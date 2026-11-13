// Layout enhancement for the adopted journal. No source text is rewritten.
const main=document.querySelector('#main'),reader=document.querySelector('#reader-dialog');
const prepared=new Map(),loadedFonts=new Map(),observedWidths=new WeakMap();
let engine,rich,frame=0,revision=0,stopped=false;
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh-CN',{granularity:'word'}):null;
const number=value=>Number.parseFloat(value)||0;
function typography(node){
  const css=getComputedStyle(node);
  return {font:`${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`,spacing:number(css.letterSpacing),lineHeight:number(css.lineHeight),css};
}
function cache(key,create){
  if(prepared.has(key))return prepared.get(key);
  if(prepared.size>=256)prepared.delete(prepared.keys().next().value);
  const value=create();prepared.set(key,value);return value;
}
function textPrepared(text,type){
  return cache(JSON.stringify(['text',text,type.font,type.spacing]),()=>engine.prepare(text,type.font,{letterSpacing:type.spacing}));
}
function ensureFont(node){
  const {font}=typography(node),text=node.textContent;
  const key=JSON.stringify([font,text]);
  if(!loadedFonts.has(key))loadedFonts.set(key,document.fonts.load(font,text));
  return loadedFonts.get(key);
}
function contentWidth(node){
  const css=getComputedStyle(node);
  return node.clientWidth-number(css.paddingLeft)-number(css.paddingRight);
}
function estimateBrief(node,width){
  let height=0;
  for(const paragraph of node.children){
    const type=typography(paragraph),css=type.css;
    const inner=width-number(css.paddingLeft)-number(css.paddingRight)-number(css.borderLeftWidth)-number(css.borderRightWidth);
    const textHeight=engine.layout(textPrepared(paragraph.textContent,type),Math.max(1,inner),type.lineHeight).height;
    height+=textHeight+number(css.paddingTop)+number(css.paddingBottom);
    // Adjacent paragraph margins collapse.
    const next=paragraph.nextElementSibling;
    if(next)height+=Math.max(number(css.marginBottom),number(getComputedStyle(next).marginTop));
  }
  return height;
}
function titleItems(node,type,width){
  let offset=0;
  const items=[],starts=[];
  for(const child of node.childNodes){
    const text=child.textContent;if(!text)continue;
    let atomic=child.nodeType===1&&child.classList.contains('title-token');
    if(atomic){
      // An exceptionally long identifier must still fit a phone's viewport.
      const tooWide=engine.measureNaturalWidth(textPrepared(text,type))>width-1;
      child.classList.toggle('title-token-breakable',tooWide);atomic=!tooWide;
    }
    starts.push(offset);offset+=text.length;
    items.push({text,font:type.font,letterSpacing:type.spacing,break:atomic?'never':'normal'});
  }
  return {items,starts};
}
function richPrepared(items){return cache(JSON.stringify(['rich',items]),()=>rich.prepareRichInline(items));}
function linesAt(handle,width){
  const lines=[];
  rich.walkRichInlineLineRanges(handle,width,range=>lines.push(rich.materializeRichInlineLineRange(handle,range)));
  return lines;
}
function wordBoundaries(text){
  if(!segmenter)return null;
  const edges=new Set([0,text.length]);
  for(const part of segmenter.segment(text)){edges.add(part.index);edges.add(part.index+part.segment.length);}
  return edges;
}
function badness(lines,width,starts,text,edges){
  const mean=lines.reduce((sum,line)=>sum+line.width,0)/lines.length;
  let score=lines.reduce((sum,line)=>sum+((line.width-mean)/width)**2,0)/lines.length;
  const last=lines.at(-1).width/width;
  if(last<.48)score+=(.48-last)*1.3;
  for(let i=0;i<lines.length-1;i++){
    const fragment=lines[i].fragments.at(-1);
    if(!fragment)continue;
    const end=starts[fragment.itemIndex]+fragment.sourceEnd;
    if(edges&&!edges.has(end))score+=.08;
    // Avoid dangling open brackets and a new line beginning with punctuation.
    if(/[（(《「【]$/.test(text.slice(0,end))||/^[，。！？：；、）》」】]/.test(text.slice(end)))score+=.18;
    if(/^[的了个等与及和或]/.test(text.slice(end)))score+=.09;
    if(/[：；。！？]$/.test(text.slice(0,end)))score-=.015;
  }
  return score;
}
function balanceTitle(node,available){
  if(available<60)return;
  const type=typography(node),text=node.textContent;
  const {items,starts}=titleItems(node,type,available),handle=richPrepared(items);
  const safeWidth=Math.max(1,available-1),base=linesAt(handle,safeWidth),edges=wordBoundaries(text);
  let chosen=available,score=base.length?badness(base,safeWidth,starts,text,edges):0,chosenLines=base;
  // Keep the native line count and type scale; only adjust a bounded measure.
  if(base.length>1&&base.length<=8){
    const readerTitle=node.id==='reader-title';
    const floor=Math.max(available*(readerTitle ? .80 : .60),type.lineHeight*2);
    for(let width=safeWidth-2;width>=floor;width-=2){
      const stats=rich.measureRichInlineStats(handle,width);
      if(stats.lineCount!==base.length)continue;
      const lines=linesAt(handle,width),next=badness(lines,safeWidth,starts,text,edges)+((available-width)/available)*(readerTitle ? .07 : .025);
      if(next<score-.002){score=next;chosen=width+1;chosenLines=lines;}
    }
  }
  // Fractional widths need a small ceiling buffer, as in Pretext's shrink-wrap demo.
  // Tightening to the widest selected line also avoids a native extra glyph at the edge.
  const fitted=chosenLines.length?Math.max(...chosenLines.map(line=>line.width))+1:chosen;
  const value=`${Math.min(available,Math.ceil(chosen),Math.ceil(fitted))}px`;
  if(node.style.getPropertyValue('--title-measure')!==value)node.style.setProperty('--title-measure',value);
  node.dataset.typeset='pretext';node.dataset.typesetLines=String(chosenLines.length);
  node.dataset.typesetWidths=JSON.stringify(chosenLines.map(line=>Math.round(line.width)));
}
function arrangeEdition(article){
  const content=article.querySelector('.article-content'),title=content.querySelector('h2'),brief=content.querySelector('.brief-text');
  const wide=matchMedia('(min-width:1051px)').matches&&!document.body.classList.contains('site-focus');
  if(!wide){content.style.removeProperty('--headline-share');return;}
  const usable=contentWidth(content)-number(getComputedStyle(content).columnGap),type=typography(title);
  const originalWidth=usable*.46;
  const originalItems=titleItems(title,type,originalWidth).items;
  const originalLines=rich.measureRichInlineStats(richPrepared(originalItems),originalWidth-1).lineCount;
  // Shared grid rhythm with a small, content-dependent adjustment per article.
  let chosen=.46,best=Infinity;
  const actions=content.querySelector('.article-actions');
  for(let share=.42;share<=.481;share+=.012){
    const titleWidth=usable*share,briefWidth=usable*(1-share);
    const {items}=titleItems(title,type,titleWidth);
    const titleLines=rich.measureRichInlineStats(richPrepared(items),titleWidth-1).lineCount;
    if(titleLines>originalLines)continue;
    const titleHeight=titleLines*type.lineHeight+(actions?.offsetHeight||44)+28;
    const briefHeight=estimateBrief(brief,briefWidth);
    const cost=Math.max(titleHeight,briefHeight)+Math.abs(titleHeight-briefHeight)*.14+Math.abs(share-.46)*120;
    if(cost<best){best=cost;chosen=share;}
  }
  const ratio=(chosen/(1-chosen)).toFixed(4)+'fr';
  if(content.style.getPropertyValue('--headline-share')!==ratio)content.style.setProperty('--headline-share',ratio);
  content.dataset.typesetShare=chosen.toFixed(3);
}
function watch(node){if(node&&!observedWidths.has(node)){observedWidths.set(node,contentWidth(node));resize.observe(node);}}
const resize=new ResizeObserver(entries=>{
  for(const {target} of entries){
    const width=contentWidth(target);
    if(Math.abs(width-observedWidths.get(target))>.5){observedWidths.set(target,width);schedule();}
  }
});
async function refresh(token){
  const titles=[...main.querySelectorAll('.brief-article h2')];
  if(reader.open)titles.push(reader.querySelector('#reader-title'));
  const briefs=[...main.querySelectorAll('.journal-edition .brief-text p')];
  await Promise.all([...titles,...briefs].filter(Boolean).map(ensureFont));
  if(token!==revision||stopped)return;
  // Measure the current layout without a previous viewport's fitted title width.
  for(const title of titles)title?.style.removeProperty('--title-measure');
  main.querySelectorAll('.journal-edition .brief-article').forEach(arrangeEdition);
  for(const title of titles){
    if(!title?.isConnected||title.getClientRects().length===0)continue;
    const parent=title.parentElement,css=getComputedStyle(parent);
    const grid=css.display==='contents'?getComputedStyle(parent.parentElement):css;
    const width=grid.display==='grid'?number(grid.gridTemplateColumns.split(' ')[0]):contentWidth(css.display==='contents'?parent.parentElement:parent);
    balanceTitle(title,width);
  }
  watch(reader.open?reader.querySelector('.reader-paper'):null);
  document.documentElement.dataset.typesetting='ready';
  document.dispatchEvent(new CustomEvent('reading:typeset'));
}
function fallback(error){
  stopped=true;resize.disconnect();prepared.clear();
  document.querySelectorAll('[data-typeset]').forEach(node=>{node.style.removeProperty('--title-measure');delete node.dataset.typeset;});
  main.querySelectorAll('.article-content').forEach(node=>node.style.removeProperty('--headline-share'));
  document.documentElement.dataset.typesetting='native';
  document.documentElement.dataset.typesettingError=error?.message||'unavailable';
}
function schedule(){
  if(stopped)return;revision++;
  if(!frame)frame=requestAnimationFrame(()=>{frame=0;refresh(revision).catch(fallback);});
}
try{
  [engine,rich]=await Promise.all([import('./vendor/pretext/dist/layout.js'),import('./vendor/pretext/dist/rich-inline.js')]);
  engine.setLocale('zh-CN');
  watch(main);
  for(const name of ['reading:route','reading:reader','reading:saved','reading:preferences'])document.addEventListener(name,schedule);
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.fonts.addEventListener('loadingdone',()=>{engine.clearCache();prepared.clear();schedule();});
  window.addEventListener('resize',schedule,{passive:true});
  reader.addEventListener('close',()=>{resize.disconnect();observedWidths.delete(main);watch(main);schedule();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
}catch(error){fallback(error);}
