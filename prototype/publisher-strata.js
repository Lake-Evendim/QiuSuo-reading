(() => {
  'use strict';
  const selector='.digest .source-margin .account-name,.reader-dialog .reader-meta .account-name';
  const fine=matchMedia('(hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const instances=new Set(),known=new WeakMap();
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const spring=n=>{const t=clamp(n)-1;return 1+2.4*t*t*t+1.4*t*t;};
  const enabled=()=>fine.matches&&!reduced.matches&&!document.body.classList.contains('reduce-motion');
  const fontsReady=document.fonts?.ready||Promise.resolve();
  const warming=new Set();let warmTask=0;
  function warm(item){
    if(!enabled()||!item.node.isConnected)return;
    warming.add(item);if(warmTask)return;
    const run=()=>{warmTask=0;for(const target of warming){warming.delete(target);
      const r=target.node.getBoundingClientRect();
      if(!target.amount&&r.width&&r.height&&r.bottom>0&&r.top<innerHeight+160&&prepare(target))rest(target);
    }};
    warmTask=window.requestIdleCallback?requestIdleCallback(run,{timeout:180}):setTimeout(run,0);
  }
  const nearby=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const item=known.get(entry.target);if(item)fontsReady.then(()=>warm(item));}},{rootMargin:'160px'});

  function rest(item){
    if(!item.ctx)return;
    item.ctx.setTransform(item.scale,0,0,item.scale,0,0);item.ctx.globalAlpha=1;
    item.ctx.clearRect(0,0,item.w,item.h);item.ctx.drawImage(item.base,0,0,item.w,item.h);
    item.node.classList.add('publisher-ready');
  }

  function fit(item){
    if(!item.digest)return;
    item.node.style.removeProperty('font-size');
    const style=getComputedStyle(item.node),size=parseFloat(style.fontSize),width=item.node.parentElement.clientWidth;
    const widest=Math.max(...[...item.text.querySelectorAll('.publisher-name-part')].map(p=>p.getBoundingClientRect().width),1);
    if(widest>width)item.node.style.fontSize=Math.max(13,size*(width-1)/widest)+'px';
  }

  function reset(item){
    if(item.raf)cancelAnimationFrame(item.raf);
    item.raf=0;item.hover=false;item.amount=0;item.velocity=0;item.node.classList.remove('publisher-animating');
    item.canvas.dataset.progress='0.000';item.canvas.dataset.mode='rest';
    rest(item);
  }

  function prepare(item){
    const node=item.node,rect=node.getBoundingClientRect();
    if(!rect.width||!rect.height)return false;
    let left=Math.max(0,rect.left-10),right=Math.max(0,innerWidth-10-rect.right),top=16,bottom=18;
    left=Math.min(22,left);right=Math.min(26,right);
    if(item.digest){
      const article=node.closest('.brief-article'),copy=article?.querySelector('.article-content');
      if(copy){const r=copy.getBoundingClientRect();
        if(r.left>=rect.right)right=Math.min(right,Math.max(0,r.left-rect.right-14));
        else bottom=Math.min(bottom,Math.max(0,r.top-rect.bottom-12));
      }
      const heading=document.querySelector('.digest-heading')?.getBoundingClientRect();
      if(heading&&rect.top>=heading.bottom)top=Math.min(top,Math.max(0,rect.top-heading.bottom-12));
    }else{
      const meta=node.closest('.reader-meta'),date=meta?.querySelector('time'),title=meta?.nextElementSibling;
      if(date){const r=date.getBoundingClientRect();
        if(r.left>=rect.right&&r.top<rect.bottom)right=Math.min(right,Math.max(0,r.left-rect.right-12));
        else if(r.top>=rect.bottom)bottom=Math.min(bottom,Math.max(0,r.top-rect.bottom-10));
      }
      if(title)bottom=Math.min(bottom,Math.max(0,title.getBoundingClientRect().top-rect.bottom-12));
      const toolbar=node.closest('.reader-dialog')?.querySelector('.reading-toolbar')?.getBoundingClientRect();
      if(toolbar)top=Math.min(top,Math.max(0,rect.top-toolbar.bottom-10));
    }
    const style=getComputedStyle(node),scale=Math.min(3,Math.max(2,devicePixelRatio||1));
    const stable=n=>Math.round(n*64)/64;
    const layout=JSON.stringify([rect.width,rect.height,left,right,top,bottom,scale,style.font,style.color].map(v=>typeof v==='number'?stable(v):v));
    if(item.layout===layout&&item.base)return true;
    item.layout=layout;item.pad={left,right,top,bottom};item.scale=scale;
    item.w=Math.ceil(stable(rect.width+left+right)*scale)/scale;item.h=Math.ceil(stable(rect.height+top+bottom)*scale)/scale;
    const canvas=item.canvas;canvas.style.left=-left+'px';canvas.style.top=-top+'px';canvas.style.width=item.w+'px';canvas.style.height=item.h+'px';
    canvas.width=Math.ceil(item.w*scale);canvas.height=Math.ceil(item.h*scale);
    item.ctx=canvas.getContext('2d');item.base=document.createElement('canvas');
    item.base.width=canvas.width;item.base.height=canvas.height;
    const ink=item.base.getContext('2d',{willReadFrequently:true});ink.setTransform(scale,0,0,scale,0,0);
    item.color=style.color;ink.fillStyle=item.color;ink.textBaseline='alphabetic';
    const walker=document.createTreeWalker(item.text,NodeFilter.SHOW_TEXT);
    for(let text; (text=walker.nextNode());){
      const parentStyle=getComputedStyle(text.parentElement);ink.font=parentStyle.font;
      let offset=0;
      for(const char of Array.from(text.textContent)){
        const range=document.createRange();range.setStart(text,offset);offset+=char.length;range.setEnd(text,offset);
        const r=range.getBoundingClientRect(),metrics=ink.measureText(char);
        if(r.width)ink.fillText(char,stable(r.left-rect.left)+left,stable(r.top-rect.top)+top+(metrics.fontBoundingBoxAscent||parseFloat(parentStyle.fontSize)*.85));
      }
    }
    const pixels=ink.getImageData(0,0,item.base.width,item.base.height),alpha=(x,y)=>{
      const ix=Math.round(x*scale),iy=Math.round(y*scale);
      return ix>=0&&iy>=0&&ix<pixels.width&&iy<pixels.height?pixels.data[(iy*pixels.width+ix)*4+3]/255:0;
    };
    const step=Math.round(Math.max(1.5,parseFloat(style.fontSize)/13)*scale),pitch=step/scale;item.pitch=pitch;item.cells=[];
    // Whole device-pixel tiles preserve every antialiased edge. Untouched tiles
    // stay in the original raster rather than being resampled each frame.
    for(let sy=0;sy<pixels.height;sy+=step)for(let sx=0;sx<pixels.width;sx+=step){
      const sw=Math.min(step,pixels.width-sx),sh=Math.min(step,pixels.height-sy);
      let coverage=0;for(let oy=0;oy<sh;oy++)for(let ox=0;ox<sw;ox++)coverage+=pixels.data[((sy+oy)*pixels.width+sx+ox)*4+3]/255;
      if(!coverage)continue;coverage/=sw*sh;
      const x=(sx+sw/2)/scale,y=(sy+sh/2)/scale;
      const gx=alpha(x+pitch,y)-alpha(x-pitch,y),gy=alpha(x,y+pitch)-alpha(x,y-pitch);
      const char=coverage>.80?'#':Math.abs(gx)>Math.abs(gy)*1.3?'|':Math.abs(gy)>Math.abs(gx)*1.3?'=':gx*gy>0?'/':'+';
      item.cells.push({x,y,char,sx,sy,sw,sh});
    }
    if(!item.cells.length){item.layout=null;item.base=null;item.ctx=null;node.classList.remove('publisher-ready');return false;}
    const projection=item.cells.map(p=>p.x+p.y*.14),first=Math.min(...projection),last=Math.max(...projection);
    item.cells.forEach((p,i)=>{
      const layer=Math.floor((p.y-p.x*.16)/(pitch*3)),column=Math.floor(p.x/(pitch*4)),chunk=layer*31.7+column*13.3;
      const cx=(column+.5)*pitch*4,cy=(layer+.5)*pitch*3+cx*.16,seed=i*17.37;
      Object.assign(p,{cx,cy,order:clamp((cx+cy*.14-first)/Math.max(1,last-first)),rupture:.42+random(chunk)*.22,
        chipX:(layer%2?1:-1)*.85+(random(chunk+1)-.5)*.30,chipY:(random(chunk+2)-.5)*.85,chipAngle:(random(chunk+3)-.5)*.65,
        angle:random(seed)*Math.PI*2,phase:random(seed+1)*Math.PI*2,speed:.8+random(seed+2)*1.7,radius:6+random(seed+3)*17,edge:.56+random(seed+4)*.26,spin:(random(seed+5)-.5)*1.1});
    });
    const chars=['#','|','=','/','+'];item.chars=new Map(chars.map((c,i)=>[c,i]));item.atlas=document.createElement('canvas');
    item.atlas.width=chars.length*12*scale;item.atlas.height=11*12*scale;
    const atlas=item.atlas.getContext('2d');atlas.setTransform(scale,0,0,scale,0,0);atlas.fillStyle=item.color;atlas.textAlign='center';atlas.textBaseline='middle';atlas.font='600 '+Math.max(3.4,pitch*2)+'px Consolas,monospace';
    for(let row=0;row<11;row++)for(let col=0;col<chars.length;col++){atlas.save();atlas.translate(col*12+6,row*12+6);atlas.rotate((row-5)*.16);atlas.fillText(chars[col],0,0);atlas.restore();}
    canvas.dataset.cells=item.cells.length;canvas.dataset.range='stroke-derived';
    return true;
  }

  function glyph(item,p,x,y,angle,reveal=1){
    if(reveal<=0)return;
    const row=clamp(Math.round(angle/.16)+5,0,10),col=item.chars.get(p.char),s=item.scale,width=reveal>=1?12:4+4*reveal;
    item.ctx.drawImage(item.atlas,col*12*s,row*12*s,width*s,12*s,x-6,y-6,width,12);
  }

  function bounded(item,p,dx,dy){
    const length=Math.hypot(dx,dy);if(length<.00001)return [0,0];
    const vx=dx/length,vy=dy/length;
    const roomX=Math.abs(vx)<.00001?Infinity:(vx<0?p.x-4:item.w-4-p.x)/Math.abs(vx);
    const roomY=Math.abs(vy)<.00001?Infinity:(vy<0?p.y-4:item.h-4-p.y)/Math.abs(vy);
    const limit=Math.max(.1,Math.min(roomX,roomY)*p.edge);
    // Every stroke point has its own reach. No common wall or frame-edge accumulation.
    const reach=limit*Math.tanh(length/limit);return [vx*reach,vy*reach];
  }

  function draw(item,time){
    const {ctx,scale:s,pitch,cells,base}=item,amount=item.amount;
    ctx.setTransform(s,0,0,s,0,0);ctx.clearRect(0,0,item.w,item.h);ctx.globalAlpha=1;
    if(amount<.0001){ctx.drawImage(base,0,0,item.w,item.h);return;}
    ctx.drawImage(base,0,0,item.w,item.h);
    let chips=0,letters=0;const moving=[];
    for(const p of cells){
      const q=smooth(p.order*.64,p.order*.64+.36,amount),pressure=smooth(0,.16,q)*(1-smooth(.16,.28,q));
      const lift=spring((q-.18)/(p.rupture-.18)),morph=smooth(p.rupture,Math.min(.90,p.rupture+.22),q);
      const release=smooth(p.rupture+.06,1,q),burst=1-Math.pow(1-release,3),rigid=p.chipAngle*lift*(1-release);
      const t=time*.001,angle=p.angle+.42*(Math.sin(t*p.speed+p.phase)-Math.sin(p.phase));
      const radius=p.radius*(.75*burst+.25*release)*(1+.12*Math.sin(t*p.speed*.73+p.phase));
      const rx=p.x-p.cx,ry=p.y-p.cy,c=Math.cos(rigid),sn=Math.sin(rigid);
      const rawX=lift*4*p.chipX-pressure*.65+rx*c-ry*sn-rx+Math.cos(angle)*radius;
      const rawY=lift*4*p.chipY+rx*sn+ry*c-ry+Math.sin(angle)*radius*.76;
      const [dx,dy]=bounded(item,p,rawX,rawY),rotation=rigid+release*p.spin;
      if(Math.abs(dx)+Math.abs(dy)+Math.abs(rotation)+morph<.0001)continue;
      ctx.clearRect(p.sx/s,p.sy/s,p.sw/s,p.sh/s);
      moving.push({p,dx,dy,rotation,morph,lift});
    }
    // Clear all departed tiles first, so one chip cannot erase its neighbor.
    for(const {p,dx,dy,rotation,morph,lift} of moving){
      if(morph<1){
        const pw=p.sw/s,ph=p.sh/s,cosine=Math.cos(rotation),sine=Math.sin(rotation),cut=clamp(-2+4*morph,-pw/2,pw/2),width=pw/2-cut;
        if(lift>.001||morph>0){ctx.setTransform(s*cosine,s*sine,-s*sine,s*cosine,(p.x+dx)*s,(p.y+dy)*s);
          if(width>.0001)ctx.drawImage(base,p.sx+(cut+pw/2)*s,p.sy,width*s,p.sh,cut,-ph/2,width,ph);
          if(morph>0)glyph(item,p,0,0,0,morph);ctx.setTransform(s,0,0,s,0,0);
        }else ctx.drawImage(base,p.sx,p.sy,p.sw,p.sh,p.x-pw/2+dx,p.y-ph/2+dy,pw,ph);
        if(lift>.02)chips++;
      }else glyph(item,p,p.x+dx,p.y+dy,rotation);
      if(morph>=.5)letters++;
    }
    item.canvas.dataset.progress=amount.toFixed(3);item.canvas.dataset.chips=chips;item.canvas.dataset.ascii=letters;
  }

  function tick(item,time){
    item.raf=0;if(!item.node.isConnected||!enabled()){reset(item);return;}
    const m=item.motion,t=clamp((time-m.start)/m.duration),t2=t*t,t3=t2*t;
    item.amount=clamp((2*t3-3*t2+1)*m.from+(t3-2*t2+t)*m.duration*m.velocity+(-2*t3+3*t2)*m.to);
    item.velocity=t===1?0:((6*t2-6*t)*m.from+(3*t2-4*t+1)*m.duration*m.velocity+(-6*t2+6*t)*m.to)/m.duration;
    if(t===1&&m.next!==undefined){
      item.motion={start:m.start+m.duration,from:item.amount,to:m.next,velocity:0,
        duration:m.next?Math.max(250,Math.min(2200,(1-item.amount)*8200)):Math.max(180,1400*Math.sqrt(item.amount))};
      tick(item,time);return;
    }
    if(!item.hover&&t===1){reset(item);return;}
    draw(item,time-item.origin);item.raf=requestAnimationFrame(t=>tick(item,t));
  }

  function moveTo(item,to){
    const time=performance.now(),velocity=item.amount===0&&to?1/8200:item.velocity||0;
    if(velocity*(to-item.amount)<0){
      const room=velocity<0?item.amount:1-item.amount,duration=Math.min(140,Math.max(1,room/Math.abs(velocity)));
      // A brief, bounded braking arc keeps a rapid reversal from dipping into
      // a clamped zero-progress plateau during a long forward transition.
      item.motion={start:time,from:item.amount,to:clamp(item.amount+velocity*duration/2),duration,velocity,next:to};
    }else item.motion={start:time,from:item.amount,to,duration:to?Math.max(250,(1-item.amount)*8200):Math.max(180,1400*Math.sqrt(item.amount)),velocity};
    if(!item.raf)item.raf=requestAnimationFrame(t=>tick(item,t));
  }

  async function enter(item,event){
    if(event.pointerType!=='mouse'||!enabled())return;
    item.hover=true;await fontsReady;
    if(!item.hover||!item.node.isConnected)return;
    if(!item.amount&&!prepare(item)){reset(item);return;}
    if(!item.amount)item.origin=performance.now();
    if(!item.amount)rest(item);item.canvas.dataset.mode='hover';
    item.node.classList.add('publisher-animating');
    moveTo(item,1);
  }

  function attach(node){
    if(known.has(node))return;
    const original=node.textContent,text=document.createElement('span');text.className='publisher-name-text';
    for(const part of original.match(/\p{Script=Han}{1,2}|[A-Za-z0-9]+|[\s\S]/gu)||[]){const span=document.createElement('span');span.className='publisher-name-part';span.textContent=part;text.append(span);}
    node.replaceChildren(text);node.classList.add('publisher-signature');
    const canvas=document.createElement('canvas');canvas.className='publisher-particles';canvas.setAttribute('aria-hidden','true');canvas.dataset.mode='rest';canvas.dataset.progress='0.000';node.append(canvas);
    const item={node,text,canvas,digest:!!node.closest('.digest'),hover:false,amount:0,velocity:0,raf:0};known.set(node,item);instances.add(item);nearby.observe(node);
    node.addEventListener('pointerenter',event=>enter(item,event));
    node.addEventListener('pointerleave',event=>{if(event.pointerType!=='mouse')return;item.hover=false;if(!item.amount){reset(item);return;}canvas.dataset.mode='return';moveTo(item,0);});
    fontsReady.then(()=>{if(node.isConnected){fit(item);warm(item);}});
  }

  function scan(){
    document.querySelectorAll('.digest .source-margin time').forEach(node=>node.remove());
    document.querySelectorAll(selector).forEach(attach);
    for(const item of instances)if(!item.node.isConnected){reset(item);nearby.unobserve(item.node);warming.delete(item);instances.delete(item);}
  }
  const observer=new MutationObserver(scan);
  for(const id of ['main','reader-content']){const root=document.getElementById(id);if(root)observer.observe(root,{childList:true,subtree:true});}
  const stopAll=()=>{for(const item of instances)reset(item);};
  const refresh=()=>{stopAll();for(const item of instances)warm(item);};
  const preferences=new MutationObserver(refresh);preferences.observe(document.body,{attributes:true,attributeFilter:['class']});
  fine.addEventListener('change',refresh);reduced.addEventListener('change',refresh);
  window.addEventListener('resize',()=>{stopAll();for(const item of instances){fit(item);item.layout=null;item.node.classList.remove('publisher-ready');warm(item);}});
  window.addEventListener('scroll',refresh,true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
  scan();
})();
