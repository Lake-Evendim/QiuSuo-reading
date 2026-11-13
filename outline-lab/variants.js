window.OUTLINE_VARIANTS=[
  {id:'a',name:'书籍目录',font:'思源宋体',detail:'15.5 / 14px · 统一宋体 / 紧凑行距',description:'主章与小节统一宋体，以字号、字重和缩进区分层级。章号独立，间距收紧。'},
  {id:'b',name:'现代导航',font:'Chiron 黑体',detail:'15px · 现代黑体 / 紧凑行距',description:'章号与标题连续排，主次清楚。更直接，也更适合快速查找。'},
  {id:'c',name:'圆体书签',font:'Chiron 圆体',detail:'15px · 圆体 / 轻柔书签',description:'圆润字形配合小章签，层级柔和。当前章节像一张阅读书签。'},
  {id:'d',name:'窄体索引',font:'Glow 窄黑',detail:'17px · 窄体 / 独立章号',description:'字面更窄，字号更大。长标题保留呼吸，也能减少折行。'},
  {id:'e',name:'等宽档案',font:'更纱等宽黑体',detail:'14px · 等宽字体 / 规律对齐',description:'中英文字宽有规律，章号整齐排列，呈现技术档案的秩序。'},
  {id:'f',name:'小薇宋意',font:'站酷小薇',detail:'16px · 小薇宋体 / 黑体小节',description:'宋体带一点字形性格，主章更醒目，适合偏重阅读气质的方向。'},
];
window.OUTLINE_VARIANTS=window.OUTLINE_VARIANTS.map(v=>({...v,round:'layout'})).concat([
  {id:'g',round:'fonts',name:'清晰黑体',font:'思源黑体',detail:'思源黑体 · 600 / 500',description:'笔形端正、字腔清楚，适合长目录与快速查找。'},
  {id:'h',round:'fonts',name:'人文黑体',font:'昭源黑体',detail:'昭源黑体 · 600 / 500',description:'保留中文的传统骨架，以黑体笔画呈现，略有书页气质。'},
  {id:'i',round:'fonts',name:'圆体书页',font:'昭源圆体',detail:'昭源圆体 · 600 / 500',description:'笔画端点圆润，字形柔和；深色字重保证小节清晰。'},
  {id:'j',round:'fonts',name:'斜切字形',font:'得意黑',detail:'得意黑 · 原生字重',description:'斜切与不对称字腔带来个性，中文与英文保持同一字体。'},
  {id:'k',round:'fonts',name:'几何窄体',font:'庆科黄油体',detail:'庆科黄油体 · 原生字重',description:'笔形规整、字面较窄，让目录带一点几何趣味。'},
  {id:'l',round:'fonts',name:'宽体重黑',font:'Glow 宽黑',detail:'Glow 宽黑 · 800',description:'笔画粗壮、字面开阔，视觉更强；长标题会增加折行。'},
]);
window.OUTLINE_ROUNDS={fonts:{label:'本轮字体',ids:['g','h','i','j','k','l']},layout:{label:'上轮排版',ids:['a','b','c','d','e','f']}};
window.OUTLINE_VARIANTS.push(
  {id:'m',round:'refined',name:'现代构造',font:'IBM Plex Sans SC',detail:'IBM Plex Sans SC · Medium',description:'干净的黑体结构，转角明确；英文与数字带有技术气质。'},
  {id:'n',round:'refined',adopted:true,name:'清晰索引',font:'思源黑体',detail:'已采用 · 思源黑体 · 600 / 500',description:'字腔开敞、笔画清楚，适合章节多、标题较长的目录。'},
  {id:'o',round:'refined',name:'书籍宋体',font:'昭源宋体',detail:'昭源宋体 · 600 / 500',description:'横细竖粗的书籍字形，主章与小节统一宋体，层级连贯。'},
  {id:'p',round:'refined',name:'杂志宋体',font:'站酷小薇',detail:'站酷小薇 · 原生字重',description:'保留宋体的阅读气质，字形更有个性，轻盈但不纤弱。'},
  {id:'q',round:'refined',name:'技术等宽',font:'更纱等宽黑体',detail:'更纱等宽黑体 · 原生字重',description:'中英文与数字有规律地排列，适合技术术语密集的目录。'},
  {id:'r',round:'refined',name:'柔和圆体',font:'昭源圆体',detail:'昭源圆体 · 600 / 500',description:'圆润端点弱化机械感，保持清楚的黑体骨架与紧凑节奏。'},
);
window.OUTLINE_ROUNDS.refined={label:'新字体方案',ids:['m','n','o','p','q','r']};
window.OUTLINE_LAB={
  escape:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  decorate(scope){
    scope.querySelectorAll('[data-jump]').forEach(button=>{
      if(button.dataset.outlineDecorated)return;
      const text=button.textContent;
      button.setAttribute('aria-label',text);
      const number=document.createElement('span'),label=document.createElement('span');
      number.className='toc-number';label.className='toc-label';
      number.textContent=button.dataset.number||'';label.textContent=button.dataset.label||text;
      button.classList.toggle('is-unindexed',!number.textContent);
      button.replaceChildren(number,document.createTextNode(number.textContent?' ':''),label);
      button.dataset.outlineDecorated='true';
    });
  },
  numberHeadings(headings){
    const candidates=new Map(headings.map(h=>[h.index,h.text.match(/^(?:\|\s*)?(\d+(?:\.\d+)*)\s+(.+)$/)]));
    // A number in a title is not a chapter index. Confirm the article's numbering sequence.
    const sequence=[];let previous=null;
    for(const h of headings){
      const match=candidates.get(h.index);if(!match||match[1].includes('.'))continue;
      const value=Number(match[1]);
      if(previous===null?(value===0||value===1):(value>previous&&value<=previous+2)){
        sequence.push(h.index);previous=value;
      }
    }
    const numbered=new Set(sequence.length>=2?sequence:[]);let parent=null;
    return headings.map(h=>{
      const match=candidates.get(h.index),main=numbered.has(h.index);
      const child=!main&&!!match&&match[1].includes('.')&&parent!==null&&Number(match[1].split('.')[0])===parent;
      if(main)parent=Number(match[1]);else if(!child)parent=null;
      const indexed=main||child;
      return {...h,child,number:indexed?match[1]:'',label:indexed?match[2]:h.text};
    });
  },
  groups(article){
    const headings=this.numberHeadings(article.blocks.map((b,index)=>({...b,index})).filter(b=>b.type==='heading'));
    const groups=[];let current;
    for(const h of headings){
      if(h.child&&current)current.children.push(h);
      else{current={...h,children:[]};groups.push(current);}
    }
    return {headings,groups};
  }
};
