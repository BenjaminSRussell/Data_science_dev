import{_ as h}from"./preload-helper-CLcXU_4U.js";class y{constructor(){this.tooltips=new Map,this.initialized=!1}async initialize(){if(!this.initialized)try{const{computePosition:t,autoUpdate:i,flip:o,shift:s,offset:a,arrow:p}=await h(async()=>{const{computePosition:c,autoUpdate:e,flip:l,shift:r,offset:n,arrow:d}=await import("./floating-ui.dom-6v31NwX9.js");return{computePosition:c,autoUpdate:e,flip:l,shift:r,offset:n,arrow:d}},[]);return this.computePosition=t,this.autoUpdate=i,this.flip=o,this.shift=s,this.offset=a,this.arrow=p,this.initialized=!0,!0}catch(t){return console.warn("Floating UI not available:",t),!1}}async createTooltip(t,i,o={}){if(!this.initialized&&(await this.initialize(),!this.initialized))return this.createSimpleTooltip(t,i);const{placement:s="top",offset:a=8,showArrow:p=!0,className:c="floating-tooltip"}=o;let e=this.tooltips.get(t);e||(e=document.createElement("div"),e.className=c,e.style.cssText=`
                position: absolute;
                background: rgba(17, 24, 39, 0.95);
                color: #f9fafb;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s;
                max-width: 300px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `,document.body.appendChild(e),this.tooltips.set(t,e)),e.textContent=i;const l=async()=>{if(this.computePosition)try{const{x:d,y:u,placement:m}=await this.computePosition(t,e,{placement:s,middleware:[this.offset(a),this.flip(),this.shift({padding:5})]});e.style.left=`${d}px`,e.style.top=`${u}px`}catch(d){console.warn("Tooltip positioning error:",d)}},r=async()=>{e.style.display="block",await l(),e.style.opacity="1"},n=()=>{e.style.opacity="0",setTimeout(()=>{e.style.display="none"},200)};return this.autoUpdate&&this.autoUpdate(t,e,l),t.addEventListener("mouseenter",r),t.addEventListener("mouseleave",n),t.addEventListener("focus",r),t.addEventListener("blur",n),{element:e,update:l,destroy:()=>{t.removeEventListener("mouseenter",r),t.removeEventListener("mouseleave",n),t.removeEventListener("focus",r),t.removeEventListener("blur",n),e.remove(),this.tooltips.delete(t)}}}createSimpleTooltip(t,i){const o=document.createElement("div");o.className="simple-tooltip",o.textContent=i,o.style.cssText=`
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 10000;
            display: none;
        `,document.body.appendChild(o);const s=p=>{o.style.display="block",o.style.left=`${p.pageX+10}px`,o.style.top=`${p.pageY+10}px`},a=()=>{o.style.display="none"};return t.addEventListener("mouseenter",s),t.addEventListener("mouseleave",a),{element:o,destroy:()=>{t.removeEventListener("mouseenter",s),t.removeEventListener("mouseleave",a),o.remove()}}}removeTooltip(t){const i=this.tooltips.get(t);i&&(i.remove(),this.tooltips.delete(t))}cleanup(){this.tooltips.forEach(t=>t.remove()),this.tooltips.clear()}}export{y as TooltipManager};
//# sourceMappingURL=TooltipManager-DQdMMv-l.js.map
