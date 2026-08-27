  /* Marquee: repeat the phrase group until the track is at least one group
     wider than the viewport, then scroll by exactly one group width. Without
     this the loop leaves a gap on the right and visibly snaps back. */
  (function(){
    var track=document.querySelector('.mtrack');
    if(!track)return;
    var group=track.querySelector('.mgroup');
    if(!group)return;
    var tries=0;
    function fill(){
      while(track.children.length>1)track.removeChild(track.lastChild);
      var w=group.getBoundingClientRect().width;
      /* On a cold load the webfont may not have arrived, so the group can
         measure 0. Bailing here would strand the marquee at one group, so
         retry shortly instead. setTimeout rather than rAF, because rAF is
         paused in background tabs. */
      if(!w){
        if(tries++<40)setTimeout(fill,50);
        return;
      }
      tries=0;
      track.style.setProperty('--mw',w+'px');
      /* Never fewer than two groups: the track scrolls by exactly one group
         width, so a lone group would leave the strip empty mid-cycle. */
      var need=Math.max(2,Math.ceil(window.innerWidth/w)+1);
      for(var i=1;i<need;i++){
        var c=group.cloneNode(true);
        c.setAttribute('aria-hidden','true');
        track.appendChild(c);
      }
    }
    window.__fillMarquee=fill;
    fill();
    var last=window.innerWidth;
    function recheck(){
      if(window.innerWidth===last)return;
      last=window.innerWidth;
      fill();
    }
    if(window.ResizeObserver){
      new ResizeObserver(recheck).observe(document.querySelector('.marquee'));
    }
    var t;
    window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(recheck,150)});
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fill);
  })();

  /* Language switch. Spanish is the markup default (so it is what search
     engines and no-JS visitors get); English lives alongside it in data-en
     attributes, so each string's two versions sit next to each other. */
  (function(){
    var KEY='cdlr-lang';
    var btns=Array.prototype.slice.call(document.querySelectorAll('.langsw button'));
    /* Each page declares its own titles on <html>, so this file stays shared. */
    var titles={
      es:document.documentElement.dataset.titleEs||document.title,
      en:document.documentElement.dataset.titleEn||document.title
    };
    function swap(sel,enKey,esKey,get,set){
      document.querySelectorAll(sel).forEach(function(el){
        if(el.dataset[esKey]===undefined)el.dataset[esKey]=get(el);
        set(el, window.__lang==='en' ? el.dataset[enKey] : el.dataset[esKey]);
      });
    }
    function apply(lang){
      window.__lang=lang;
      document.documentElement.lang=lang;
      document.title=titles[lang];
      swap('[data-en]','en','esText',
        function(el){return el.textContent},
        function(el,v){el.textContent=v});
      swap('[data-en-html]','enHtml','esHtml',
        function(el){return el.innerHTML},
        function(el,v){el.innerHTML=v});
      swap('[data-en-ph]','enPh','esPh',
        function(el){return el.placeholder},
        function(el,v){el.placeholder=v});
      swap('[data-en-aria]','enAria','esAria',
        function(el){return el.getAttribute('aria-label')},
        function(el,v){el.setAttribute('aria-label',v)});
      btns.forEach(function(b){
        b.setAttribute('aria-pressed', String(b.dataset.lang===lang));
      });
      /* Phrase widths changed, so the marquee needs re-measuring. */
      if(window.__fillMarquee)window.__fillMarquee();
      try{localStorage.setItem(KEY,lang)}catch(e){}
    }
    btns.forEach(function(b){
      b.addEventListener('click',function(){apply(b.dataset.lang)});
    });
    var saved=null;
    try{saved=localStorage.getItem(KEY)}catch(e){}
    apply(saved || (/^en\b/i.test(navigator.language||'') ? 'en' : 'es'));
  })();

  /* Success modal + confetti. Flat rectangular pieces in the brand palette,
     drawn on canvas — no gradients, matching the rest of the system. */
  var okModal=(function(){
    var modal=document.getElementById('okModal');
    /* Pages without the sign-up form (e.g. the newsletter) have no dialog. */
    if(!modal)return {open:function(){},close:function(){}};
    var card=modal.querySelector('.modal-card');
    var canvas=document.getElementById('confetti');
    var ctx=canvas.getContext('2d');
    var raf=null,lastFocus=null;
    var COLORS=['#e5b415','#b98d0f','#b5482a','#2b6f68','#141210','#fff6eb'];
    function reduced(){
      return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    function clear(){ctx.clearRect(0,0,canvas.width,canvas.height)}
    function burst(){
      var dpr=Math.min(window.devicePixelRatio||1,2);
      var w=modal.clientWidth,h=modal.clientHeight;
      canvas.width=w*dpr;canvas.height=h*dpr;
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var m=modal.getBoundingClientRect(),c=card.getBoundingClientRect();
      var cx=c.left-m.left+c.width/2, cy=c.top-m.top+c.height/2;
      var parts=[];
      for(var i=0;i<90;i++){
        var a=Math.random()*Math.PI*2, sp=4+Math.random()*7;
        parts.push({
          x:cx+(Math.random()-0.5)*c.width*0.85,
          y:cy+(Math.random()-0.5)*c.height*0.55,
          vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-3.5,
          w:5+Math.random()*6, h:3+Math.random()*4,
          rot:Math.random()*Math.PI, vr:(Math.random()-0.5)*0.32,
          col:COLORS[i%COLORS.length]
        });
      }
      var start=null;
      function frame(now){
        if(start===null)start=now;
        var t=now-start, life=Math.max(0,1-t/2600), alive=false;
        ctx.clearRect(0,0,w,h);
        for(var j=0;j<parts.length;j++){
          var p=parts[j];
          p.vy+=0.19; p.vx*=0.99; p.vy*=0.99;
          p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
          if(life>0&&p.y<h+50)alive=true;
          ctx.save();
          ctx.globalAlpha=life;
          ctx.translate(p.x,p.y); ctx.rotate(p.rot);
          ctx.fillStyle=p.col;
          ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
          ctx.restore();
        }
        if(alive&&!modal.hidden)raf=requestAnimationFrame(frame);
        else clear();
      }
      raf=requestAnimationFrame(frame);
    }
    function focusables(){
      return card.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    }
    function onKey(e){
      if(e.key==='Escape'){close();return}
      if(e.key!=='Tab')return;
      var f=focusables();
      if(!f.length)return;
      var first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
    function open(){
      lastFocus=document.activeElement;
      modal.hidden=false;
      document.body.style.overflow='hidden';
      document.addEventListener('keydown',onKey);
      card.querySelector('.modal-x').focus();
      if(!reduced())burst();
    }
    function close(){
      if(modal.hidden)return;
      modal.hidden=true;
      if(raf)cancelAnimationFrame(raf);
      raf=null; clear();
      document.body.style.overflow='';
      document.removeEventListener('keydown',onKey);
      /* preventScroll: restoring focus to the submit button would otherwise
         scroll the page back to the form and fight the newsletter jump. */
      if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
    }
    modal.querySelectorAll('[data-close]').forEach(function(el){
      el.addEventListener('click',close);
    });
    /* A real anchor, so the jump works off native navigation (plus the
       stylesheet's smooth scroll-behavior) rather than relying on JS. The
       handler only dismisses the dialog. */
    var toNews=document.getElementById('okToNews');
    if(toNews)toNews.addEventListener('click',function(){close()});
    return {open:open,close:close};
  })();

  var f=document.getElementById('vf');
  /* Everything below is sign-up form behaviour; other pages skip it. */
  if(f){
  /* Mirror the newsletter checkbox into its hidden field, so submissions
     always carry an explicit Sí/No rather than omitting the field. */
  (function(){
    var cb=document.getElementById('boletinCb'),hid=document.getElementById('boletinField');
    if(!cb||!hid)return;
    function sync(){hid.value=cb.checked?'Sí':'No'}
    cb.addEventListener('change',sync);
    f.addEventListener('reset',function(){setTimeout(sync,0)});
    sync();
  })();
  var n=document.getElementById('name'),e=document.getElementById('email');
  var en=document.getElementById('errName'),ee=document.getElementById('errEmail'),es=document.getElementById('errSend');
  var btn=f.querySelector('button[type=submit]');
  n.addEventListener('input',function(){en.style.display='none'});
  e.addEventListener('input',function(){ee.style.display='none'});
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var bad=false;
    es.style.display='none';
    if(!n.value.trim()){en.style.display='block';bad=true}
    if(!/^\S+@\S+\.\S+$/.test(e.value.trim())){ee.style.display='block';bad=true}
    if(bad)return;
    btn.disabled=true;
    fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
      .then(function(res){
        if(res.ok){
          f.reset();
          okModal.open();
        }else{
          es.style.display='block';
          es.scrollIntoView({behavior:'smooth',block:'center'});
        }
      })
      .catch(function(){
        es.style.display='block';
        es.scrollIntoView({behavior:'smooth',block:'center'});
      })
      .finally(function(){btn.disabled=false});
  });
}

  /* Newsletter sign-up (boletin.html): email only, reusing the shared
     success dialog. Kept separate from the volunteer form above, which
     expects fields this page does not have. */
  var nf=document.getElementById('nf');
  if(nf){
    var ne=document.getElementById('nlEmail');
    var nee=document.getElementById('nlErrEmail'),nes=document.getElementById('nlErrSend');
    var nbtn=nf.querySelector('button[type=submit]');
    ne.addEventListener('input',function(){nee.style.display='none'});
    nf.addEventListener('submit',function(ev){
      ev.preventDefault();
      nes.style.display='none';
      if(!/^\S+@\S+\.\S+$/.test(ne.value.trim())){nee.style.display='block';return}
      nbtn.disabled=true;
      fetch(nf.action,{method:'POST',body:new FormData(nf),headers:{'Accept':'application/json'}})
        .then(function(res){
          if(res.ok){nf.reset();okModal.open();}
          else{nes.style.display='block'}
        })
        .catch(function(){nes.style.display='block'})
        .finally(function(){nbtn.disabled=false});
    });
  }
