var t=(0,Object.freeze)([]);class e{static ATTRIBUTE=1;static COMPONENT=2;static ELEMENT=3;static FRAGMENT=4;static INTERPOLATION=5;static STATIC=6;get properties(){const{attributes:t}=this;if(t.length){const e={};for(const s of t)s.type<2?e[s.name]=s.value:Object.assign(e,s.value);return e}return null}}var s=(t,e)=>t[e];const n="\0",c=t=>t.replace(/^[\r\n]\s*|\s*[\r\n]\s*$/g,""),a=(t,e)=>({type:t,value:e}),i=(t,s,n)=>({type:e.ATTRIBUTE,dynamic:t,name:s,value:n}),r=(e,s,c,a,i)=>({"\0p":n+0,type:e,attributes:s===t?n+1:s,children:c===t?n+1:c,name:a,value:i}),l=(l,u,p)=>{const f=({index:t},s)=>{const n=c(N.slice(d,t)),{length:i}=n;if(i){let t=0,s=t;do{if(s=n.indexOf("\0",t),s<0)T(c(n.slice(t)));else if(T(c(n.slice(t,s))),h(a(e.INTERPOLATION,"\0a"+ ++A)),t=s+1,t===i)break}while(~s)}d=t+s.length},T=t=>{t&&h(a(e.STATIC,t))},h=t=>{g[0].children.push(t)},O=t=>{g&&h(t),g=[t,g||t]},E=[e.prototype,t,{}],N=l.join("\0");let g,d=0,A=0;for(const c of N.matchAll(/(<(\/)?(\S*?)>)|(<(\S+)([^>/]*?)(\/)?>)/g)){const[l,o,T,h,N,d,I,y]=c;switch(l){case"<>":f(c,l),O(r(e.FRAGMENT,t,[]));break;case"</>":f(c,l),g=g[1];break;default:if(f(c,l),T)g=g[1];else{let c=t;if(I&&I.trim()){c=[];for(const[t,s,n,r,l,o,u]of I.matchAll(/((\S+)=((('|")([^\5]*?)\5)|\x00)|\x00)/g))if(o)c.push(i(!1,n,u));else{const t="\0a"+ ++A;c.push(n?i(!0,n,t):a(e.INTERPOLATION,t))}}const l=d||h,o=l.split("."),f=p.has(o[0]);let T=l;if(f){const t=o.reduce(s,u),e=E.indexOf(t);T=n+(e<0?E.push(t)-1:e)}O(r(f?e.COMPONENT:e.ELEMENT,c,y?t:[],l,T)),y&&(g=g[1])}}}g.id=n+2;const I={f:Function(`return ${JSON.stringify(g).replace(/"\\u0000([ap]?)(\d*)"/g,((t,e,s)=>"p"===e?"__proto__":`${e?"arguments":"this"}[${s}]`))}`),c:E};return o.set(l,I),I},o=new WeakMap,u=(t={})=>{const e=new Set(Object.keys(t));return function(s){const{f:n,c:c}=o.get(s)||l(s,t,e);return n.apply(c,arguments)}};export{u as ESX,e as Token};
