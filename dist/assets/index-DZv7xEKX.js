(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const u of l.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&i(u)}).observe(document,{childList:!0,subtree:!0});function n(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(s){if(s.ep)return;s.ep=!0;const l=n(s);fetch(s.href,l)}})();function Er(e){const t=Object.create(null);for(const n of e.split(","))t[n]=1;return n=>n in t}const me={},Bn=[],Tt=()=>{},Va=()=>!1,gi=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),vi=e=>e.startsWith("onUpdate:"),De=Object.assign,Mr=(e,t)=>{const n=e.indexOf(t);n>-1&&e.splice(n,1)},rd=Object.prototype.hasOwnProperty,re=(e,t)=>rd.call(e,t),U=Array.isArray,Hn=e=>Mo(e)==="[object Map]",Wa=e=>Mo(e)==="[object Set]",Hs=e=>Mo(e)==="[object Date]",G=e=>typeof e=="function",_e=e=>typeof e=="string",$t=e=>typeof e=="symbol",ue=e=>e!==null&&typeof e=="object",qa=e=>(ue(e)||G(e))&&G(e.then)&&G(e.catch),Ua=Object.prototype.toString,Mo=e=>Ua.call(e),sd=e=>Mo(e).slice(8,-1),Ga=e=>Mo(e)==="[object Object]",Ar=e=>_e(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,mo=Er(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),bi=e=>{const t=Object.create(null);return(n=>t[n]||(t[n]=e(n)))},ad=/-\w/g,ht=bi(e=>e.replace(ad,t=>t.slice(1).toUpperCase())),ld=/\B([A-Z])/g,ln=bi(e=>e.replace(ld,"-$1").toLowerCase()),Xa=bi(e=>e.charAt(0).toUpperCase()+e.slice(1)),Ui=bi(e=>e?`on${Xa(e)}`:""),At=(e,t)=>!Object.is(e,t),ti=(e,...t)=>{for(let n=0;n<e.length;n++)e[n](...t)},Ya=(e,t,n,i=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:i,value:n})},Tr=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let Vs;const yi=()=>Vs||(Vs=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Me(e){if(U(e)){const t={};for(let n=0;n<e.length;n++){const i=e[n],s=_e(i)?pd(i):Me(i);if(s)for(const l in s)t[l]=s[l]}return t}else if(_e(e)||ue(e))return e}const cd=/;(?![^(]*\))/g,ud=/:([^]+)/,dd=/\/\*[^]*?\*\//g;function pd(e){const t={};return e.replace(dd,"").split(cd).forEach(n=>{if(n){const i=n.split(ud);i.length>1&&(t[i[0].trim()]=i[1].trim())}}),t}function be(e){let t="";if(_e(e))t=e;else if(U(e))for(let n=0;n<e.length;n++){const i=be(e[n]);i&&(t+=i+" ")}else if(ue(e))for(const n in e)e[n]&&(t+=n+" ");return t.trim()}const fd="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",md=Er(fd);function Ka(e){return!!e||e===""}function hd(e,t){if(e.length!==t.length)return!1;let n=!0;for(let i=0;n&&i<e.length;i++)n=$r(e[i],t[i]);return n}function $r(e,t){if(e===t)return!0;let n=Hs(e),i=Hs(t);if(n||i)return n&&i?e.getTime()===t.getTime():!1;if(n=$t(e),i=$t(t),n||i)return e===t;if(n=U(e),i=U(t),n||i)return n&&i?hd(e,t):!1;if(n=ue(e),i=ue(t),n||i){if(!n||!i)return!1;const s=Object.keys(e).length,l=Object.keys(t).length;if(s!==l)return!1;for(const u in e){const d=e.hasOwnProperty(u),p=t.hasOwnProperty(u);if(d&&!p||!d&&p||!$r(e[u],t[u]))return!1}}return String(e)===String(t)}const Ja=e=>!!(e&&e.__v_isRef===!0),X=e=>_e(e)?e:e==null?"":U(e)||ue(e)&&(e.toString===Ua||!G(e.toString))?Ja(e)?X(e.value):JSON.stringify(e,Za,2):String(e),Za=(e,t)=>Ja(t)?Za(e,t.value):Hn(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((n,[i,s],l)=>(n[Gi(i,l)+" =>"]=s,n),{})}:Wa(t)?{[`Set(${t.size})`]:[...t.values()].map(n=>Gi(n))}:$t(t)?Gi(t):ue(t)&&!U(t)&&!Ga(t)?String(t):t,Gi=(e,t="")=>{var n;return $t(e)?`Symbol(${(n=e.description)!=null?n:t})`:e};let Re;class gd{constructor(t=!1){this.detached=t,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this._warnOnRun=!0,this.__v_skip=!0,!t&&Re&&(Re.active?(this.parent=Re,this.index=(Re.scopes||(Re.scopes=[])).push(this)-1):(this._active=!1,this._warnOnRun=!1))}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].pause();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let t,n;if(this.scopes)for(t=0,n=this.scopes.length;t<n;t++)this.scopes[t].resume();for(t=0,n=this.effects.length;t<n;t++)this.effects[t].resume()}}run(t){if(this._active){const n=Re;try{return Re=this,t()}finally{Re=n}}}on(){++this._on===1&&(this.prevScope=Re,Re=this)}off(){if(this._on>0&&--this._on===0){if(Re===this)Re=this.prevScope;else{let t=Re;for(;t;){if(t.prevScope===this){t.prevScope=this.prevScope;break}t=t.prevScope}}this.prevScope=void 0}}stop(t){if(this._active){this._active=!1;let n,i;for(n=0,i=this.effects.length;n<i;n++)this.effects[n].stop();for(this.effects.length=0,n=0,i=this.cleanups.length;n<i;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,i=this.scopes.length;n<i;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!t){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function vd(){return Re}let he;const Xi=new WeakSet;class Qa{constructor(t){this.fn=t,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Re&&(Re.active?Re.effects.push(this):this.flags&=-2)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Xi.has(this)&&(Xi.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||tl(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Ws(this),nl(this);const t=he,n=gt;he=this,gt=!0;try{return this.fn()}finally{ol(this),he=t,gt=n,this.flags&=-3}}stop(){if(this.flags&1){for(let t=this.deps;t;t=t.nextDep)Lr(t);this.deps=this.depsTail=void 0,Ws(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Xi.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){dr(this)&&this.run()}get dirty(){return dr(this)}}let el=0,ho,go;function tl(e,t=!1){if(e.flags|=8,t){e.next=go,go=e;return}e.next=ho,ho=e}function Or(){el++}function Rr(){if(--el>0)return;if(go){let t=go;for(go=void 0;t;){const n=t.next;t.next=void 0,t.flags&=-9,t=n}}let e;for(;ho;){let t=ho;for(ho=void 0;t;){const n=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(i){e||(e=i)}t=n}}if(e)throw e}function nl(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function ol(e){let t,n=e.depsTail,i=n;for(;i;){const s=i.prevDep;i.version===-1?(i===n&&(n=s),Lr(i),bd(i)):t=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}e.deps=t,e.depsTail=n}function dr(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(il(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function il(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===ko)||(e.globalVersion=ko,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!dr(e))))return;e.flags|=2;const t=e.dep,n=he,i=gt;he=e,gt=!0;try{nl(e);const s=e.fn(e._value);(t.version===0||At(s,e._value))&&(e.flags|=128,e._value=s,t.version++)}catch(s){throw t.version++,s}finally{he=n,gt=i,ol(e),e.flags&=-3}}function Lr(e,t=!1){const{dep:n,prevSub:i,nextSub:s}=e;if(i&&(i.nextSub=s,e.prevSub=void 0),s&&(s.prevSub=i,e.nextSub=void 0),n.subs===e&&(n.subs=i,!i&&n.computed)){n.computed.flags&=-5;for(let l=n.computed.deps;l;l=l.nextDep)Lr(l,!0)}!t&&!--n.sc&&n.map&&n.map.delete(n.key)}function bd(e){const{prevDep:t,nextDep:n}=e;t&&(t.nextDep=n,e.prevDep=void 0),n&&(n.prevDep=t,e.nextDep=void 0)}let gt=!0;const rl=[];function Ot(){rl.push(gt),gt=!1}function Rt(){const e=rl.pop();gt=e===void 0?!0:e}function Ws(e){const{cleanup:t}=e;if(e.cleanup=void 0,t){const n=he;he=void 0;try{t()}finally{he=n}}}let ko=0;class yd{constructor(t,n){this.sub=t,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Dr{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(t){if(!he||!gt||he===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==he)n=this.activeLink=new yd(he,this),he.deps?(n.prevDep=he.depsTail,he.depsTail.nextDep=n,he.depsTail=n):he.deps=he.depsTail=n,sl(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const i=n.nextDep;i.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=i),n.prevDep=he.depsTail,n.nextDep=void 0,he.depsTail.nextDep=n,he.depsTail=n,he.deps===n&&(he.deps=i)}return n}trigger(t){this.version++,ko++,this.notify(t)}notify(t){Or();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Rr()}}}function sl(e){if(e.dep.sc++,e.sub.flags&4){const t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let i=t.deps;i;i=i.nextDep)sl(i)}const n=e.dep.subs;n!==e&&(e.prevSub=n,n&&(n.nextSub=e)),e.dep.subs=e}}const pr=new WeakMap,_n=Symbol(""),fr=Symbol(""),So=Symbol("");function je(e,t,n){if(gt&&he){let i=pr.get(e);i||pr.set(e,i=new Map);let s=i.get(n);s||(i.set(n,s=new Dr),s.map=i,s.key=n),s.track()}}function Wt(e,t,n,i,s,l){const u=pr.get(e);if(!u){ko++;return}const d=p=>{p&&p.trigger()};if(Or(),t==="clear")u.forEach(d);else{const p=U(e),v=p&&Ar(n);if(p&&n==="length"){const h=Number(i);u.forEach((b,P)=>{(P==="length"||P===So||!$t(P)&&P>=h)&&d(b)})}else switch((n!==void 0||u.has(void 0))&&d(u.get(n)),v&&d(u.get(So)),t){case"add":p?v&&d(u.get("length")):(d(u.get(_n)),Hn(e)&&d(u.get(fr)));break;case"delete":p||(d(u.get(_n)),Hn(e)&&d(u.get(fr)));break;case"set":Hn(e)&&d(u.get(_n));break}}Rr()}function Nn(e){const t=ie(e);return t===e?t:(je(t,"iterate",So),ut(e)?t:t.map(vt))}function wi(e){return je(e=ie(e),"iterate",So),e}function Et(e,t){return Gt(e)?Xn(kn(e)?vt(t):t):vt(t)}const wd={__proto__:null,[Symbol.iterator](){return Yi(this,Symbol.iterator,e=>Et(this,e))},concat(...e){return Nn(this).concat(...e.map(t=>U(t)?Nn(t):t))},entries(){return Yi(this,"entries",e=>(e[1]=Et(this,e[1]),e))},every(e,t){return zt(this,"every",e,t,void 0,arguments)},filter(e,t){return zt(this,"filter",e,t,n=>n.map(i=>Et(this,i)),arguments)},find(e,t){return zt(this,"find",e,t,n=>Et(this,n),arguments)},findIndex(e,t){return zt(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return zt(this,"findLast",e,t,n=>Et(this,n),arguments)},findLastIndex(e,t){return zt(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return zt(this,"forEach",e,t,void 0,arguments)},includes(...e){return Ki(this,"includes",e)},indexOf(...e){return Ki(this,"indexOf",e)},join(e){return Nn(this).join(e)},lastIndexOf(...e){return Ki(this,"lastIndexOf",e)},map(e,t){return zt(this,"map",e,t,void 0,arguments)},pop(){return lo(this,"pop")},push(...e){return lo(this,"push",e)},reduce(e,...t){return qs(this,"reduce",e,t)},reduceRight(e,...t){return qs(this,"reduceRight",e,t)},shift(){return lo(this,"shift")},some(e,t){return zt(this,"some",e,t,void 0,arguments)},splice(...e){return lo(this,"splice",e)},toReversed(){return Nn(this).toReversed()},toSorted(e){return Nn(this).toSorted(e)},toSpliced(...e){return Nn(this).toSpliced(...e)},unshift(...e){return lo(this,"unshift",e)},values(){return Yi(this,"values",e=>Et(this,e))}};function Yi(e,t,n){const i=wi(e),s=i[t]();return i!==e&&!ut(e)&&(s._next=s.next,s.next=()=>{const l=s._next();return l.done||(l.value=n(l.value)),l}),s}const xd=Array.prototype;function zt(e,t,n,i,s,l){const u=wi(e),d=u!==e&&!ut(e),p=u[t];if(p!==xd[t]){const b=p.apply(e,l);return d?vt(b):b}let v=n;u!==e&&(d?v=function(b,P){return n.call(this,Et(e,b),P,e)}:n.length>2&&(v=function(b,P){return n.call(this,b,P,e)}));const h=p.call(u,v,i);return d&&s?s(h):h}function qs(e,t,n,i){const s=wi(e),l=s!==e&&!ut(e);let u=n,d=!1;s!==e&&(l?(d=i.length===0,u=function(v,h,b){return d&&(d=!1,v=Et(e,v)),n.call(this,v,Et(e,h),b,e)}):n.length>3&&(u=function(v,h,b){return n.call(this,v,h,b,e)}));const p=s[t](u,...i);return d?Et(e,p):p}function Ki(e,t,n){const i=ie(e);je(i,"iterate",So);const s=i[t](...n);return(s===-1||s===!1)&&jr(n[0])?(n[0]=ie(n[0]),i[t](...n)):s}function lo(e,t,n=[]){Ot(),Or();const i=ie(e)[t].apply(e,n);return Rr(),Rt(),i}const Id=Er("__proto__,__v_isRef,__isVue"),al=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter($t));function _d(e){$t(e)||(e=String(e));const t=ie(this);return je(t,"has",e),t.hasOwnProperty(e)}class ll{constructor(t=!1,n=!1){this._isReadonly=t,this._isShallow=n}get(t,n,i){if(n==="__v_skip")return t.__v_skip;const s=this._isReadonly,l=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return l;if(n==="__v_raw")return i===(s?l?Od:pl:l?dl:ul).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(i)?t:void 0;const u=U(t);if(!s){let p;if(u&&(p=wd[n]))return p;if(n==="hasOwnProperty")return _d}const d=Reflect.get(t,n,Be(t)?t:i);if(($t(n)?al.has(n):Id(n))||(s||je(t,"get",n),l))return d;if(Be(d)){const p=u&&Ar(n)?d:d.value;return s&&ue(p)?hr(p):p}return ue(d)?s?hr(d):Fr(d):d}}class cl extends ll{constructor(t=!1){super(!1,t)}set(t,n,i,s){let l=t[n];const u=U(t)&&Ar(n);if(!this._isShallow){const v=Gt(l);if(!ut(i)&&!Gt(i)&&(l=ie(l),i=ie(i)),!u&&Be(l)&&!Be(i))return v||(l.value=i),!0}const d=u?Number(n)<t.length:re(t,n),p=Reflect.set(t,n,i,Be(t)?t:s);return t===ie(s)&&p&&(d?At(i,l)&&Wt(t,"set",n,i):Wt(t,"add",n,i)),p}deleteProperty(t,n){const i=re(t,n);t[n];const s=Reflect.deleteProperty(t,n);return s&&i&&Wt(t,"delete",n,void 0),s}has(t,n){const i=Reflect.has(t,n);return(!$t(n)||!al.has(n))&&je(t,"has",n),i}ownKeys(t){return je(t,"iterate",U(t)?"length":_n),Reflect.ownKeys(t)}}class kd extends ll{constructor(t=!1){super(!0,t)}set(t,n){return!0}deleteProperty(t,n){return!0}}const Sd=new cl,Pd=new kd,Cd=new cl(!0);const mr=e=>e,Xo=e=>Reflect.getPrototypeOf(e);function Ed(e,t,n){return function(...i){const s=this.__v_raw,l=ie(s),u=Hn(l),d=e==="entries"||e===Symbol.iterator&&u,p=e==="keys"&&u,v=s[e](...i),h=n?mr:t?Xn:vt;return!t&&je(l,"iterate",p?fr:_n),De(Object.create(v),{next(){const{value:b,done:P}=v.next();return P?{value:b,done:P}:{value:d?[h(b[0]),h(b[1])]:h(b),done:P}}})}}function Yo(e){return function(...t){return e==="delete"?!1:e==="clear"?void 0:this}}function Md(e,t){const n={get(s){const l=this.__v_raw,u=ie(l),d=ie(s);e||(At(s,d)&&je(u,"get",s),je(u,"get",d));const{has:p}=Xo(u),v=t?mr:e?Xn:vt;if(p.call(u,s))return v(l.get(s));if(p.call(u,d))return v(l.get(d));l!==u&&l.get(s)},get size(){const s=this.__v_raw;return!e&&je(ie(s),"iterate",_n),s.size},has(s){const l=this.__v_raw,u=ie(l),d=ie(s);return e||(At(s,d)&&je(u,"has",s),je(u,"has",d)),s===d?l.has(s):l.has(s)||l.has(d)},forEach(s,l){const u=this,d=u.__v_raw,p=ie(d),v=t?mr:e?Xn:vt;return!e&&je(p,"iterate",_n),d.forEach((h,b)=>s.call(l,v(h),v(b),u))}};return De(n,e?{add:Yo("add"),set:Yo("set"),delete:Yo("delete"),clear:Yo("clear")}:{add(s){const l=ie(this),u=Xo(l),d=ie(s),p=!t&&!ut(s)&&!Gt(s)?d:s;return u.has.call(l,p)||At(s,p)&&u.has.call(l,s)||At(d,p)&&u.has.call(l,d)||(l.add(p),Wt(l,"add",p,p)),this},set(s,l){!t&&!ut(l)&&!Gt(l)&&(l=ie(l));const u=ie(this),{has:d,get:p}=Xo(u);let v=d.call(u,s);v||(s=ie(s),v=d.call(u,s));const h=p.call(u,s);return u.set(s,l),v?At(l,h)&&Wt(u,"set",s,l):Wt(u,"add",s,l),this},delete(s){const l=ie(this),{has:u,get:d}=Xo(l);let p=u.call(l,s);p||(s=ie(s),p=u.call(l,s)),d&&d.call(l,s);const v=l.delete(s);return p&&Wt(l,"delete",s,void 0),v},clear(){const s=ie(this),l=s.size!==0,u=s.clear();return l&&Wt(s,"clear",void 0,void 0),u}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=Ed(s,e,t)}),n}function Nr(e,t){const n=Md(e,t);return(i,s,l)=>s==="__v_isReactive"?!e:s==="__v_isReadonly"?e:s==="__v_raw"?i:Reflect.get(re(n,s)&&s in i?n:i,s,l)}const Ad={get:Nr(!1,!1)},Td={get:Nr(!1,!0)},$d={get:Nr(!0,!1)};const ul=new WeakMap,dl=new WeakMap,pl=new WeakMap,Od=new WeakMap;function Rd(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Fr(e){return Gt(e)?e:zr(e,!1,Sd,Ad,ul)}function Ld(e){return zr(e,!1,Cd,Td,dl)}function hr(e){return zr(e,!0,Pd,$d,pl)}function zr(e,t,n,i,s){if(!ue(e)||e.__v_raw&&!(t&&e.__v_isReactive)||e.__v_skip||!Object.isExtensible(e))return e;const l=s.get(e);if(l)return l;const u=Rd(sd(e));if(u===0)return e;const d=new Proxy(e,u===2?i:n);return s.set(e,d),d}function kn(e){return Gt(e)?kn(e.__v_raw):!!(e&&e.__v_isReactive)}function Gt(e){return!!(e&&e.__v_isReadonly)}function ut(e){return!!(e&&e.__v_isShallow)}function jr(e){return e?!!e.__v_raw:!1}function ie(e){const t=e&&e.__v_raw;return t?ie(t):e}function Dd(e){return!re(e,"__v_skip")&&Object.isExtensible(e)&&Ya(e,"__v_skip",!0),e}const vt=e=>ue(e)?Fr(e):e,Xn=e=>ue(e)?hr(e):e;function Be(e){return e?e.__v_isRef===!0:!1}function j(e){return Nd(e,!1)}function Nd(e,t){return Be(e)?e:new Fd(e,t)}class Fd{constructor(t,n){this.dep=new Dr,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?t:ie(t),this._value=n?t:vt(t),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(t){const n=this._rawValue,i=this.__v_isShallow||ut(t)||Gt(t);t=i?t:ie(t),At(t,n)&&(this._rawValue=t,this._value=i?t:vt(t),this.dep.trigger())}}function uo(e){return Be(e)?e.value:e}const zd={get:(e,t,n)=>t==="__v_raw"?e:uo(Reflect.get(e,t,n)),set:(e,t,n,i)=>{const s=e[t];return Be(s)&&!Be(n)?(s.value=n,!0):Reflect.set(e,t,n,i)}};function fl(e){return kn(e)?e:new Proxy(e,zd)}class jd{constructor(t,n,i){this.fn=t,this.setter=n,this._value=void 0,this.dep=new Dr(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=ko-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&he!==this)return tl(this,!0),!0}get value(){const t=this.dep.track();return il(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function Bd(e,t,n=!1){let i,s;return G(e)?i=e:(i=e.get,s=e.set),new jd(i,s,n)}const Ko={},li=new WeakMap;let yn;function Hd(e,t=!1,n=yn){if(n){let i=li.get(n);i||li.set(n,i=[]),i.push(e)}}function Vd(e,t,n=me){const{immediate:i,deep:s,once:l,scheduler:u,augmentJob:d,call:p}=n,v=W=>s?W:ut(W)||s===!1||s===0?qt(W,1):qt(W);let h,b,P,L,K=!1,q=!1;if(Be(e)?(b=()=>e.value,K=ut(e)):kn(e)?(b=()=>v(e),K=!0):U(e)?(q=!0,K=e.some(W=>kn(W)||ut(W)),b=()=>e.map(W=>{if(Be(W))return W.value;if(kn(W))return v(W);if(G(W))return p?p(W,2):W()})):G(e)?t?b=p?()=>p(e,2):e:b=()=>{if(P){Ot();try{P()}finally{Rt()}}const W=yn;yn=h;try{return p?p(e,3,[L]):e(L)}finally{yn=W}}:b=Tt,t&&s){const W=b,ke=s===!0?1/0:s;b=()=>qt(W(),ke)}const de=vd(),le=()=>{h.stop(),de&&de.active&&Mr(de.effects,h)};if(l&&t){const W=t;t=(...ke)=>{const nt=W(...ke);return le(),nt}}let Y=q?new Array(e.length).fill(Ko):Ko;const Q=W=>{if(!(!(h.flags&1)||!h.dirty&&!W))if(t){const ke=h.run();if(W||s||K||(q?ke.some((nt,ot)=>At(nt,Y[ot])):At(ke,Y))){P&&P();const nt=yn;yn=h;try{const ot=[ke,Y===Ko?void 0:q&&Y[0]===Ko?[]:Y,L];Y=ke,p?p(t,3,ot):t(...ot)}finally{yn=nt}}}else h.run()};return d&&d(Q),h=new Qa(b),h.scheduler=u?()=>u(Q,!1):Q,L=W=>Hd(W,!1,h),P=h.onStop=()=>{const W=li.get(h);if(W){if(p)p(W,4);else for(const ke of W)ke();li.delete(h)}},t?i?Q(!0):Y=h.run():u?u(Q.bind(null,!0),!0):h.run(),le.pause=h.pause.bind(h),le.resume=h.resume.bind(h),le.stop=le,le}function qt(e,t=1/0,n){if(t<=0||!ue(e)||e.__v_skip||(n=n||new Map,(n.get(e)||0)>=t))return e;if(n.set(e,t),t--,Be(e))qt(e.value,t,n);else if(U(e))for(let i=0;i<e.length;i++)qt(e[i],t,n);else if(Wa(e)||Hn(e))e.forEach(i=>{qt(i,t,n)});else if(Ga(e)){for(const i in e)qt(e[i],t,n);for(const i of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,i)&&qt(e[i],t,n)}return e}function Ao(e,t,n,i){try{return i?e(...i):e()}catch(s){xi(s,t,n)}}function bt(e,t,n,i){if(G(e)){const s=Ao(e,t,n,i);return s&&qa(s)&&s.catch(l=>{xi(l,t,n)}),s}if(U(e)){const s=[];for(let l=0;l<e.length;l++)s.push(bt(e[l],t,n,i));return s}}function xi(e,t,n,i=!0){const s=t?t.vnode:null,{errorHandler:l,throwUnhandledErrorInProduction:u}=t&&t.appContext.config||me;if(t){let d=t.parent;const p=t.proxy,v=`https://vuejs.org/error-reference/#runtime-${n}`;for(;d;){const h=d.ec;if(h){for(let b=0;b<h.length;b++)if(h[b](e,p,v)===!1)return}d=d.parent}if(l){Ot(),Ao(l,null,10,[e,p,v]),Rt();return}}Wd(e,n,s,i,u)}function Wd(e,t,n,i=!0,s=!1){if(s)throw e;console.error(e)}const We=[];let Ct=-1;const Vn=[];let sn=null,Fn=0;const ml=Promise.resolve();let ci=null;function zn(e){const t=ci||ml;return e?t.then(this?e.bind(this):e):t}function qd(e){let t=Ct+1,n=We.length;for(;t<n;){const i=t+n>>>1,s=We[i],l=Po(s);l<e||l===e&&s.flags&2?t=i+1:n=i}return t}function Br(e){if(!(e.flags&1)){const t=Po(e),n=We[We.length-1];!n||!(e.flags&2)&&t>=Po(n)?We.push(e):We.splice(qd(t),0,e),e.flags|=1,hl()}}function hl(){ci||(ci=ml.then(vl))}function Ud(e){U(e)?Vn.push(...e):sn&&e.id===-1?sn.splice(Fn+1,0,e):e.flags&1||(Vn.push(e),e.flags|=1),hl()}function Us(e,t,n=Ct+1){for(;n<We.length;n++){const i=We[n];if(i&&i.flags&2){if(e&&i.id!==e.uid)continue;We.splice(n,1),n--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function gl(e){if(Vn.length){const t=[...new Set(Vn)].sort((n,i)=>Po(n)-Po(i));if(Vn.length=0,sn){sn.push(...t);return}for(sn=t,Fn=0;Fn<sn.length;Fn++){const n=sn[Fn];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}sn=null,Fn=0}}const Po=e=>e.id==null?e.flags&2?-1:1/0:e.id;function vl(e){try{for(Ct=0;Ct<We.length;Ct++){const t=We[Ct];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),Ao(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;Ct<We.length;Ct++){const t=We[Ct];t&&(t.flags&=-2)}Ct=-1,We.length=0,gl(),ci=null,(We.length||Vn.length)&&vl()}}let ct=null,bl=null;function ui(e){const t=ct;return ct=e,bl=e&&e.type.__scopeId||null,t}function Gd(e,t=ct,n){if(!t||e._n)return e;const i=(...s)=>{i._d&&oa(-1);const l=ui(t);let u;try{u=e(...s)}finally{ui(l),i._d&&oa(1)}return u};return i._n=!0,i._c=!0,i._d=!0,i}function Ji(e,t){if(ct===null)return e;const n=Si(ct),i=e.dirs||(e.dirs=[]);for(let s=0;s<t.length;s++){let[l,u,d,p=me]=t[s];l&&(G(l)&&(l={mounted:l,updated:l}),l.deep&&qt(u),i.push({dir:l,instance:n,value:u,oldValue:void 0,arg:d,modifiers:p}))}return e}function vn(e,t,n,i){const s=e.dirs,l=t&&t.dirs;for(let u=0;u<s.length;u++){const d=s[u];l&&(d.oldValue=l[u].value);let p=d.dir[i];p&&(Ot(),bt(p,n,8,[e.el,d,e,t]),Rt())}}function Xd(e,t){if(qe){let n=qe.provides;const i=qe.parent&&qe.parent.provides;i===n&&(n=qe.provides=Object.create(i)),n[e]=t}}function ni(e,t,n=!1){const i=Xp();if(i||Wn){let s=Wn?Wn._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&e in s)return s[e];if(arguments.length>1)return n&&G(t)?t.call(i&&i.proxy):t}}const Yd=Symbol.for("v-scx"),Kd=()=>ni(Yd);function wn(e,t,n){return yl(e,t,n)}function yl(e,t,n=me){const{immediate:i,deep:s,flush:l,once:u}=n,d=De({},n),p=t&&i||!t&&l!=="post";let v;if(Eo){if(l==="sync"){const L=Kd();v=L.__watcherHandles||(L.__watcherHandles=[])}else if(!p){const L=()=>{};return L.stop=Tt,L.resume=Tt,L.pause=Tt,L}}const h=qe;d.call=(L,K,q)=>bt(L,h,K,q);let b=!1;l==="post"?d.scheduler=L=>{Xe(L,h&&h.suspense)}:l!=="sync"&&(b=!0,d.scheduler=(L,K)=>{K?L():Br(L)}),d.augmentJob=L=>{t&&(L.flags|=4),b&&(L.flags|=2,h&&(L.id=h.uid,L.i=h))};const P=Vd(e,t,d);return Eo&&(v?v.push(P):p&&P()),P}function Jd(e,t,n){const i=this.proxy,s=_e(e)?e.includes(".")?wl(i,e):()=>i[e]:e.bind(i,i);let l;G(t)?l=t:(l=t.handler,n=t);const u=To(this),d=yl(s,l.bind(i),n);return u(),d}function wl(e,t){const n=t.split(".");return()=>{let i=e;for(let s=0;s<n.length&&i;s++)i=i[n[s]];return i}}const Zd=Symbol("_vte"),Qd=e=>e.__isTeleport,Zi=Symbol("_leaveCb");function Hr(e,t){e.shapeFlag&6&&e.component?(e.transition=t,Hr(e.component.subTree,t)):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function ep(e,t){return G(e)?De({name:e.name},t,{setup:e}):e}function xl(e){e.ids=[e.ids[0]+e.ids[2]+++"-",0,0]}function Gs(e,t){let n;return!!((n=Object.getOwnPropertyDescriptor(e,t))&&!n.configurable)}const di=new WeakMap;function vo(e,t,n,i,s=!1){if(U(e)){e.forEach((q,de)=>vo(q,t&&(U(t)?t[de]:t),n,i,s));return}if(bo(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&vo(e,t,n,i.component.subTree);return}const l=i.shapeFlag&4?Si(i.component):i.el,u=s?null:l,{i:d,r:p}=e,v=t&&t.r,h=d.refs===me?d.refs={}:d.refs,b=d.setupState,P=ie(b),L=b===me?Va:q=>Gs(h,q)?!1:re(P,q),K=(q,de)=>!(de&&Gs(h,de));if(v!=null&&v!==p){if(Xs(t),_e(v))h[v]=null,L(v)&&(b[v]=null);else if(Be(v)){const q=t;K(v,q.k)&&(v.value=null),q.k&&(h[q.k]=null)}}if(G(p)){Ot();try{Ao(p,d,12,[u,h])}finally{Rt()}}else{const q=_e(p),de=Be(p);if(q||de){const le=()=>{if(e.f){const Y=q?L(p)?b[p]:h[p]:K()||!e.k?p.value:h[e.k];if(s)U(Y)&&Mr(Y,l);else if(U(Y))Y.includes(l)||Y.push(l);else if(q)h[p]=[l],L(p)&&(b[p]=h[p]);else{const Q=[l];K(p,e.k)&&(p.value=Q),e.k&&(h[e.k]=Q)}}else q?(h[p]=u,L(p)&&(b[p]=u)):de&&(K(p,e.k)&&(p.value=u),e.k&&(h[e.k]=u))};if(u){const Y=()=>{le(),di.delete(e)};Y.id=-1,di.set(e,Y),Xe(Y,n)}else Xs(e),le()}}}function Xs(e){const t=di.get(e);t&&(t.flags|=8,di.delete(e))}yi().requestIdleCallback;yi().cancelIdleCallback;const bo=e=>!!e.type.__asyncLoader,Il=e=>e.type.__isKeepAlive;function tp(e,t){_l(e,"a",t)}function np(e,t){_l(e,"da",t)}function _l(e,t,n=qe){const i=e.__wdc||(e.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return e()});if(Ii(t,i,n),n){let s=n.parent;for(;s&&s.parent;)Il(s.parent.vnode)&&op(i,t,n,s),s=s.parent}}function op(e,t,n,i){const s=Ii(t,e,i,!0);Vr(()=>{Mr(i[t],s)},n)}function Ii(e,t,n=qe,i=!1){if(n){const s=n[e]||(n[e]=[]),l=t.__weh||(t.__weh=(...u)=>{Ot();const d=To(n),p=bt(t,n,e,u);return d(),Rt(),p});return i?s.unshift(l):s.push(l),l}}const Xt=e=>(t,n=qe)=>{(!Eo||e==="sp")&&Ii(e,(...i)=>t(...i),n)},ip=Xt("bm"),kl=Xt("m"),rp=Xt("bu"),sp=Xt("u"),ap=Xt("bum"),Vr=Xt("um"),lp=Xt("sp"),cp=Xt("rtg"),up=Xt("rtc");function dp(e,t=qe){Ii("ec",e,t)}const pp=Symbol.for("v-ndc");function Oe(e,t,n,i){let s;const l=n,u=U(e);if(u||_e(e)){const d=u&&kn(e);let p=!1,v=!1;d&&(p=!ut(e),v=Gt(e),e=wi(e)),s=new Array(e.length);for(let h=0,b=e.length;h<b;h++)s[h]=t(p?v?Xn(vt(e[h])):vt(e[h]):e[h],h,void 0,l)}else if(typeof e=="number"){s=new Array(e);for(let d=0;d<e;d++)s[d]=t(d+1,d,void 0,l)}else if(ue(e))if(e[Symbol.iterator])s=Array.from(e,(d,p)=>t(d,p,void 0,l));else{const d=Object.keys(e);s=new Array(d.length);for(let p=0,v=d.length;p<v;p++){const h=d[p];s[p]=t(e[h],h,p,l)}}else s=[];return s}const gr=e=>e?ql(e)?Si(e):gr(e.parent):null,yo=De(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>gr(e.parent),$root:e=>gr(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>Pl(e),$forceUpdate:e=>e.f||(e.f=()=>{Br(e.update)}),$nextTick:e=>e.n||(e.n=zn.bind(e.proxy)),$watch:e=>Jd.bind(e)}),Qi=(e,t)=>e!==me&&!e.__isScriptSetup&&re(e,t),fp={get({_:e},t){if(t==="__v_skip")return!0;const{ctx:n,setupState:i,data:s,props:l,accessCache:u,type:d,appContext:p}=e;if(t[0]!=="$"){const P=u[t];if(P!==void 0)switch(P){case 1:return i[t];case 2:return s[t];case 4:return n[t];case 3:return l[t]}else{if(Qi(i,t))return u[t]=1,i[t];if(s!==me&&re(s,t))return u[t]=2,s[t];if(re(l,t))return u[t]=3,l[t];if(n!==me&&re(n,t))return u[t]=4,n[t];vr&&(u[t]=0)}}const v=yo[t];let h,b;if(v)return t==="$attrs"&&je(e.attrs,"get",""),v(e);if((h=d.__cssModules)&&(h=h[t]))return h;if(n!==me&&re(n,t))return u[t]=4,n[t];if(b=p.config.globalProperties,re(b,t))return b[t]},set({_:e},t,n){const{data:i,setupState:s,ctx:l}=e;return Qi(s,t)?(s[t]=n,!0):i!==me&&re(i,t)?(i[t]=n,!0):re(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(l[t]=n,!0)},has({_:{data:e,setupState:t,accessCache:n,ctx:i,appContext:s,props:l,type:u}},d){let p;return!!(n[d]||e!==me&&d[0]!=="$"&&re(e,d)||Qi(t,d)||re(l,d)||re(i,d)||re(yo,d)||re(s.config.globalProperties,d)||(p=u.__cssModules)&&p[d])},defineProperty(e,t,n){return n.get!=null?e._.accessCache[t]=0:re(n,"value")&&this.set(e,t,n.value,null),Reflect.defineProperty(e,t,n)}};function Ys(e){return U(e)?e.reduce((t,n)=>(t[n]=null,t),{}):e}let vr=!0;function mp(e){const t=Pl(e),n=e.proxy,i=e.ctx;vr=!1,t.beforeCreate&&Ks(t.beforeCreate,e,"bc");const{data:s,computed:l,methods:u,watch:d,provide:p,inject:v,created:h,beforeMount:b,mounted:P,beforeUpdate:L,updated:K,activated:q,deactivated:de,beforeDestroy:le,beforeUnmount:Y,destroyed:Q,unmounted:W,render:ke,renderTracked:nt,renderTriggered:ot,errorCaptured:yt,serverPrefetch:Sn,expose:wt,inheritAttrs:se,components:ye,directives:Ke,filters:cn}=t;if(v&&hp(v,i,null),u)for(const pe in u){const z=u[pe];G(z)&&(i[pe]=z.bind(n))}if(s){const pe=s.call(n,n);ue(pe)&&(e.data=Fr(pe))}if(vr=!0,l)for(const pe in l){const z=l[pe],ge=G(z)?z.bind(n,n):G(z.get)?z.get.bind(n,n):Tt,ce=!G(z)&&G(z.set)?z.set.bind(n):Tt,it=oe({get:ge,set:ce});Object.defineProperty(i,pe,{enumerable:!0,configurable:!0,get:()=>it.value,set:Ue=>it.value=Ue})}if(d)for(const pe in d)Sl(d[pe],i,n,pe);if(p){const pe=G(p)?p.call(n):p;Reflect.ownKeys(pe).forEach(z=>{Xd(z,pe[z])})}h&&Ks(h,e,"c");function Ae(pe,z){U(z)?z.forEach(ge=>pe(ge.bind(n))):z&&pe(z.bind(n))}if(Ae(ip,b),Ae(kl,P),Ae(rp,L),Ae(sp,K),Ae(tp,q),Ae(np,de),Ae(dp,yt),Ae(up,nt),Ae(cp,ot),Ae(ap,Y),Ae(Vr,W),Ae(lp,Sn),U(wt))if(wt.length){const pe=e.exposed||(e.exposed={});wt.forEach(z=>{Object.defineProperty(pe,z,{get:()=>n[z],set:ge=>n[z]=ge,enumerable:!0})})}else e.exposed||(e.exposed={});ke&&e.render===Tt&&(e.render=ke),se!=null&&(e.inheritAttrs=se),ye&&(e.components=ye),Ke&&(e.directives=Ke),Sn&&xl(e)}function hp(e,t,n=Tt){U(e)&&(e=br(e));for(const i in e){const s=e[i];let l;ue(s)?"default"in s?l=ni(s.from||i,s.default,!0):l=ni(s.from||i):l=ni(s),Be(l)?Object.defineProperty(t,i,{enumerable:!0,configurable:!0,get:()=>l.value,set:u=>l.value=u}):t[i]=l}}function Ks(e,t,n){bt(U(e)?e.map(i=>i.bind(t.proxy)):e.bind(t.proxy),t,n)}function Sl(e,t,n,i){let s=i.includes(".")?wl(n,i):()=>n[i];if(_e(e)){const l=t[e];G(l)&&wn(s,l)}else if(G(e))wn(s,e.bind(n));else if(ue(e))if(U(e))e.forEach(l=>Sl(l,t,n,i));else{const l=G(e.handler)?e.handler.bind(n):t[e.handler];G(l)&&wn(s,l,e)}}function Pl(e){const t=e.type,{mixins:n,extends:i}=t,{mixins:s,optionsCache:l,config:{optionMergeStrategies:u}}=e.appContext,d=l.get(t);let p;return d?p=d:!s.length&&!n&&!i?p=t:(p={},s.length&&s.forEach(v=>pi(p,v,u,!0)),pi(p,t,u)),ue(t)&&l.set(t,p),p}function pi(e,t,n,i=!1){const{mixins:s,extends:l}=t;l&&pi(e,l,n,!0),s&&s.forEach(u=>pi(e,u,n,!0));for(const u in t)if(!(i&&u==="expose")){const d=gp[u]||n&&n[u];e[u]=d?d(e[u],t[u]):t[u]}return e}const gp={data:Js,props:Zs,emits:Zs,methods:po,computed:po,beforeCreate:Ve,created:Ve,beforeMount:Ve,mounted:Ve,beforeUpdate:Ve,updated:Ve,beforeDestroy:Ve,beforeUnmount:Ve,destroyed:Ve,unmounted:Ve,activated:Ve,deactivated:Ve,errorCaptured:Ve,serverPrefetch:Ve,components:po,directives:po,watch:bp,provide:Js,inject:vp};function Js(e,t){return t?e?function(){return De(G(e)?e.call(this,this):e,G(t)?t.call(this,this):t)}:t:e}function vp(e,t){return po(br(e),br(t))}function br(e){if(U(e)){const t={};for(let n=0;n<e.length;n++)t[e[n]]=e[n];return t}return e}function Ve(e,t){return e?[...new Set([].concat(e,t))]:t}function po(e,t){return e?De(Object.create(null),e,t):t}function Zs(e,t){return e?U(e)&&U(t)?[...new Set([...e,...t])]:De(Object.create(null),Ys(e),Ys(t??{})):t}function bp(e,t){if(!e)return t;if(!t)return e;const n=De(Object.create(null),e);for(const i in t)n[i]=Ve(e[i],t[i]);return n}function Cl(){return{app:null,config:{isNativeTag:Va,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let yp=0;function wp(e,t){return function(i,s=null){G(i)||(i=De({},i)),s!=null&&!ue(s)&&(s=null);const l=Cl(),u=new WeakSet,d=[];let p=!1;const v=l.app={_uid:yp++,_component:i,_props:s,_container:null,_context:l,_instance:null,version:ef,get config(){return l.config},set config(h){},use(h,...b){return u.has(h)||(h&&G(h.install)?(u.add(h),h.install(v,...b)):G(h)&&(u.add(h),h(v,...b))),v},mixin(h){return l.mixins.includes(h)||l.mixins.push(h),v},component(h,b){return b?(l.components[h]=b,v):l.components[h]},directive(h,b){return b?(l.directives[h]=b,v):l.directives[h]},mount(h,b,P){if(!p){const L=v._ceVNode||Ut(i,s);return L.appContext=l,P===!0?P="svg":P===!1&&(P=void 0),e(L,h,P),p=!0,v._container=h,h.__vue_app__=v,Si(L.component)}},onUnmount(h){d.push(h)},unmount(){p&&(bt(d,v._instance,16),e(null,v._container),delete v._container.__vue_app__)},provide(h,b){return l.provides[h]=b,v},runWithContext(h){const b=Wn;Wn=v;try{return h()}finally{Wn=b}}};return v}}let Wn=null;const xp=(e,t)=>t==="modelValue"||t==="model-value"?e.modelModifiers:e[`${t}Modifiers`]||e[`${ht(t)}Modifiers`]||e[`${ln(t)}Modifiers`];function Ip(e,t,...n){if(e.isUnmounted)return;const i=e.vnode.props||me;let s=n;const l=t.startsWith("update:"),u=l&&xp(i,t.slice(7));u&&(u.trim&&(s=n.map(h=>_e(h)?h.trim():h)),u.number&&(s=n.map(Tr)));let d,p=i[d=Ui(t)]||i[d=Ui(ht(t))];!p&&l&&(p=i[d=Ui(ln(t))]),p&&bt(p,e,6,s);const v=i[d+"Once"];if(v){if(!e.emitted)e.emitted={};else if(e.emitted[d])return;e.emitted[d]=!0,bt(v,e,6,s)}}const _p=new WeakMap;function El(e,t,n=!1){const i=n?_p:t.emitsCache,s=i.get(e);if(s!==void 0)return s;const l=e.emits;let u={},d=!1;if(!G(e)){const p=v=>{const h=El(v,t,!0);h&&(d=!0,De(u,h))};!n&&t.mixins.length&&t.mixins.forEach(p),e.extends&&p(e.extends),e.mixins&&e.mixins.forEach(p)}return!l&&!d?(ue(e)&&i.set(e,null),null):(U(l)?l.forEach(p=>u[p]=null):De(u,l),ue(e)&&i.set(e,u),u)}function _i(e,t){return!e||!gi(t)?!1:(t=t.slice(2),t=t==="Once"?t:t.replace(/Once$/,""),re(e,t[0].toLowerCase()+t.slice(1))||re(e,ln(t))||re(e,t))}function Qs(e){const{type:t,vnode:n,proxy:i,withProxy:s,propsOptions:[l],slots:u,attrs:d,emit:p,render:v,renderCache:h,props:b,data:P,setupState:L,ctx:K,inheritAttrs:q}=e,de=ui(e);let le,Y;try{if(n.shapeFlag&4){const W=s||i,ke=W;le=Mt(v.call(ke,W,h,b,L,P,K)),Y=d}else{const W=t;le=Mt(W.length>1?W(b,{attrs:d,slots:u,emit:p}):W(b,null)),Y=t.props?d:kp(d)}}catch(W){wo.length=0,xi(W,e,1),le=Ut(an)}let Q=le;if(Y&&q!==!1){const W=Object.keys(Y),{shapeFlag:ke}=Q;W.length&&ke&7&&(l&&W.some(vi)&&(Y=Sp(Y,l)),Q=Yn(Q,Y,!1,!0))}return n.dirs&&(Q=Yn(Q,null,!1,!0),Q.dirs=Q.dirs?Q.dirs.concat(n.dirs):n.dirs),n.transition&&Hr(Q,n.transition),le=Q,ui(de),le}const kp=e=>{let t;for(const n in e)(n==="class"||n==="style"||gi(n))&&((t||(t={}))[n]=e[n]);return t},Sp=(e,t)=>{const n={};for(const i in e)(!vi(i)||!(i.slice(9)in t))&&(n[i]=e[i]);return n};function Pp(e,t,n){const{props:i,children:s,component:l}=e,{props:u,children:d,patchFlag:p}=t,v=l.emitsOptions;if(t.dirs||t.transition)return!0;if(n&&p>=0){if(p&1024)return!0;if(p&16)return i?ea(i,u,v):!!u;if(p&8){const h=t.dynamicProps;for(let b=0;b<h.length;b++){const P=h[b];if(Ml(u,i,P)&&!_i(v,P))return!0}}}else return(s||d)&&(!d||!d.$stable)?!0:i===u?!1:i?u?ea(i,u,v):!0:!!u;return!1}function ea(e,t,n){const i=Object.keys(t);if(i.length!==Object.keys(e).length)return!0;for(let s=0;s<i.length;s++){const l=i[s];if(Ml(t,e,l)&&!_i(n,l))return!0}return!1}function Ml(e,t,n){const i=e[n],s=t[n];return n==="style"&&ue(i)&&ue(s)?!$r(i,s):i!==s}function Cp({vnode:e,parent:t,suspense:n},i){for(;t;){const s=t.subTree;if(s.suspense&&s.suspense.activeBranch===e&&(s.suspense.vnode.el=s.el=i,e=s),s===e)(e=t.vnode).el=i,t=t.parent;else break}n&&n.activeBranch===e&&(n.vnode.el=i)}const Al={},Tl=()=>Object.create(Al),$l=e=>Object.getPrototypeOf(e)===Al;function Ep(e,t,n,i=!1){const s={},l=Tl();e.propsDefaults=Object.create(null),Ol(e,t,s,l);for(const u in e.propsOptions[0])u in s||(s[u]=void 0);n?e.props=i?s:Ld(s):e.type.props?e.props=s:e.props=l,e.attrs=l}function Mp(e,t,n,i){const{props:s,attrs:l,vnode:{patchFlag:u}}=e,d=ie(s),[p]=e.propsOptions;let v=!1;if((i||u>0)&&!(u&16)){if(u&8){const h=e.vnode.dynamicProps;for(let b=0;b<h.length;b++){let P=h[b];if(_i(e.emitsOptions,P))continue;const L=t[P];if(p)if(re(l,P))L!==l[P]&&(l[P]=L,v=!0);else{const K=ht(P);s[K]=yr(p,d,K,L,e,!1)}else L!==l[P]&&(l[P]=L,v=!0)}}}else{Ol(e,t,s,l)&&(v=!0);let h;for(const b in d)(!t||!re(t,b)&&((h=ln(b))===b||!re(t,h)))&&(p?n&&(n[b]!==void 0||n[h]!==void 0)&&(s[b]=yr(p,d,b,void 0,e,!0)):delete s[b]);if(l!==d)for(const b in l)(!t||!re(t,b))&&(delete l[b],v=!0)}v&&Wt(e.attrs,"set","")}function Ol(e,t,n,i){const[s,l]=e.propsOptions;let u=!1,d;if(t)for(let p in t){if(mo(p))continue;const v=t[p];let h;s&&re(s,h=ht(p))?!l||!l.includes(h)?n[h]=v:(d||(d={}))[h]=v:_i(e.emitsOptions,p)||(!(p in i)||v!==i[p])&&(i[p]=v,u=!0)}if(l){const p=ie(n),v=d||me;for(let h=0;h<l.length;h++){const b=l[h];n[b]=yr(s,p,b,v[b],e,!re(v,b))}}return u}function yr(e,t,n,i,s,l){const u=e[n];if(u!=null){const d=re(u,"default");if(d&&i===void 0){const p=u.default;if(u.type!==Function&&!u.skipFactory&&G(p)){const{propsDefaults:v}=s;if(n in v)i=v[n];else{const h=To(s);i=v[n]=p.call(null,t),h()}}else i=p;s.ce&&s.ce._setProp(n,i)}u[0]&&(l&&!d?i=!1:u[1]&&(i===""||i===ln(n))&&(i=!0))}return i}const Ap=new WeakMap;function Rl(e,t,n=!1){const i=n?Ap:t.propsCache,s=i.get(e);if(s)return s;const l=e.props,u={},d=[];let p=!1;if(!G(e)){const h=b=>{p=!0;const[P,L]=Rl(b,t,!0);De(u,P),L&&d.push(...L)};!n&&t.mixins.length&&t.mixins.forEach(h),e.extends&&h(e.extends),e.mixins&&e.mixins.forEach(h)}if(!l&&!p)return ue(e)&&i.set(e,Bn),Bn;if(U(l))for(let h=0;h<l.length;h++){const b=ht(l[h]);ta(b)&&(u[b]=me)}else if(l)for(const h in l){const b=ht(h);if(ta(b)){const P=l[h],L=u[b]=U(P)||G(P)?{type:P}:De({},P),K=L.type;let q=!1,de=!0;if(U(K))for(let le=0;le<K.length;++le){const Y=K[le],Q=G(Y)&&Y.name;if(Q==="Boolean"){q=!0;break}else Q==="String"&&(de=!1)}else q=G(K)&&K.name==="Boolean";L[0]=q,L[1]=de,(q||re(L,"default"))&&d.push(b)}}const v=[u,d];return ue(e)&&i.set(e,v),v}function ta(e){return e[0]!=="$"&&!mo(e)}const Wr=e=>e==="_"||e==="_ctx"||e==="$stable",qr=e=>U(e)?e.map(Mt):[Mt(e)],Tp=(e,t,n)=>{if(t._n)return t;const i=Gd((...s)=>qr(t(...s)),n);return i._c=!1,i},Ll=(e,t,n)=>{const i=e._ctx;for(const s in e){if(Wr(s))continue;const l=e[s];if(G(l))t[s]=Tp(s,l,i);else if(l!=null){const u=qr(l);t[s]=()=>u}}},Dl=(e,t)=>{const n=qr(t);e.slots.default=()=>n},Nl=(e,t,n)=>{for(const i in t)(n||!Wr(i))&&(e[i]=t[i])},$p=(e,t,n)=>{const i=e.slots=Tl();if(e.vnode.shapeFlag&32){const s=t._;s?(Nl(i,t,n),n&&Ya(i,"_",s,!0)):Ll(t,i)}else t&&Dl(e,t)},Op=(e,t,n)=>{const{vnode:i,slots:s}=e;let l=!0,u=me;if(i.shapeFlag&32){const d=t._;d?n&&d===1?l=!1:Nl(s,t,n):(l=!t.$stable,Ll(t,s)),u=t}else t&&(Dl(e,t),u={default:1});if(l)for(const d in s)!Wr(d)&&u[d]==null&&delete s[d]},Xe=Fp;function Rp(e){return Lp(e)}function Lp(e,t){const n=yi();n.__VUE__=!0;const{insert:i,remove:s,patchProp:l,createElement:u,createText:d,createComment:p,setText:v,setElementText:h,parentNode:b,nextSibling:P,setScopeId:L=Tt,insertStaticContent:K}=e,q=(f,g,w,S=null,I=null,_=null,M=void 0,E=null,C=!!g.dynamicChildren)=>{if(f===g)return;f&&!co(f,g)&&(S=xt(f),Ue(f,I,_,!0),f=null),g.patchFlag===-2&&(C=!1,g.dynamicChildren=null);const{type:k,ref:V,shapeFlag:$}=g;switch(k){case ki:de(f,g,w,S);break;case an:le(f,g,w,S);break;case tr:f==null&&Y(g,w,S,M);break;case ee:ye(f,g,w,S,I,_,M,E,C);break;default:$&1?ke(f,g,w,S,I,_,M,E,C):$&6?Ke(f,g,w,S,I,_,M,E,C):($&64||$&128)&&k.process(f,g,w,S,I,_,M,E,C,He)}V!=null&&I?vo(V,f&&f.ref,_,g||f,!g):V==null&&f&&f.ref!=null&&vo(f.ref,null,_,f,!0)},de=(f,g,w,S)=>{if(f==null)i(g.el=d(g.children),w,S);else{const I=g.el=f.el;g.children!==f.children&&v(I,g.children)}},le=(f,g,w,S)=>{f==null?i(g.el=p(g.children||""),w,S):g.el=f.el},Y=(f,g,w,S)=>{[f.el,f.anchor]=K(f.children,g,w,S,f.el,f.anchor)},Q=({el:f,anchor:g},w,S)=>{let I;for(;f&&f!==g;)I=P(f),i(f,w,S),f=I;i(g,w,S)},W=({el:f,anchor:g})=>{let w;for(;f&&f!==g;)w=P(f),s(f),f=w;s(g)},ke=(f,g,w,S,I,_,M,E,C)=>{if(g.type==="svg"?M="svg":g.type==="math"&&(M="mathml"),f==null)nt(g,w,S,I,_,M,E,C);else{const k=f.el&&f.el._isVueCE?f.el:null;try{k&&k._beginPatch(),Sn(f,g,I,_,M,E,C)}finally{k&&k._endPatch()}}},nt=(f,g,w,S,I,_,M,E)=>{let C,k;const{props:V,shapeFlag:$,transition:B,dirs:H}=f;if(C=f.el=u(f.type,_,V&&V.is,V),$&8?h(C,f.children):$&16&&yt(f.children,C,null,S,I,er(f,_),M,E),H&&vn(f,null,S,"created"),ot(C,f,f.scopeId,M,S),V){for(const ae in V)ae!=="value"&&!mo(ae)&&l(C,ae,null,V[ae],_,S);"value"in V&&l(C,"value",null,V.value,_),(k=V.onVnodeBeforeMount)&&Pt(k,S,f)}H&&vn(f,null,S,"beforeMount");const J=Dp(I,B);J&&B.beforeEnter(C),i(C,g,w),((k=V&&V.onVnodeMounted)||J||H)&&Xe(()=>{k&&Pt(k,S,f),J&&B.enter(C),H&&vn(f,null,S,"mounted")},I)},ot=(f,g,w,S,I)=>{if(w&&L(f,w),S)for(let _=0;_<S.length;_++)L(f,S[_]);if(I){let _=I.subTree;if(g===_||Bl(_.type)&&(_.ssContent===g||_.ssFallback===g)){const M=I.vnode;ot(f,M,M.scopeId,M.slotScopeIds,I.parent)}}},yt=(f,g,w,S,I,_,M,E,C=0)=>{for(let k=C;k<f.length;k++){const V=f[k]=E?Vt(f[k]):Mt(f[k]);q(null,V,g,w,S,I,_,M,E)}},Sn=(f,g,w,S,I,_,M)=>{const E=g.el=f.el;let{patchFlag:C,dynamicChildren:k,dirs:V}=g;C|=f.patchFlag&16;const $=f.props||me,B=g.props||me;let H;if(w&&bn(w,!1),(H=B.onVnodeBeforeUpdate)&&Pt(H,w,g,f),V&&vn(g,f,w,"beforeUpdate"),w&&bn(w,!0),k&&(!f.dynamicChildren||f.dynamicChildren.length!==k.length)&&(C=0,M=!1,k=null),($.innerHTML&&B.innerHTML==null||$.textContent&&B.textContent==null)&&h(E,""),k?wt(f.dynamicChildren,k,E,w,S,er(g,I),_):M||z(f,g,E,null,w,S,er(g,I),_,!1),C>0){if(C&16)se(E,$,B,w,I);else if(C&2&&$.class!==B.class&&l(E,"class",null,B.class,I),C&4&&l(E,"style",$.style,B.style,I),C&8){const J=g.dynamicProps;for(let ae=0;ae<J.length;ae++){const ne=J[ae],we=$[ne],Pe=B[ne];(Pe!==we||ne==="value")&&l(E,ne,we,Pe,I,w)}}C&1&&f.children!==g.children&&h(E,g.children)}else!M&&k==null&&se(E,$,B,w,I);((H=B.onVnodeUpdated)||V)&&Xe(()=>{H&&Pt(H,w,g,f),V&&vn(g,f,w,"updated")},S)},wt=(f,g,w,S,I,_,M)=>{for(let E=0;E<g.length;E++){const C=f[E],k=g[E],V=C.el&&(C.type===ee||!co(C,k)||C.shapeFlag&198)?b(C.el):w;q(C,k,V,null,S,I,_,M,!0)}},se=(f,g,w,S,I)=>{if(g!==w){if(g!==me)for(const _ in g)!mo(_)&&!(_ in w)&&l(f,_,g[_],null,I,S);for(const _ in w){if(mo(_))continue;const M=w[_],E=g[_];M!==E&&_!=="value"&&l(f,_,E,M,I,S)}"value"in w&&l(f,"value",g.value,w.value,I)}},ye=(f,g,w,S,I,_,M,E,C)=>{const k=g.el=f?f.el:d(""),V=g.anchor=f?f.anchor:d("");let{patchFlag:$,dynamicChildren:B,slotScopeIds:H}=g;H&&(E=E?E.concat(H):H),f==null?(i(k,w,S),i(V,w,S),yt(g.children||[],w,V,I,_,M,E,C)):$>0&&$&64&&B&&f.dynamicChildren&&f.dynamicChildren.length===B.length?(wt(f.dynamicChildren,B,w,I,_,M,E),(g.key!=null||I&&g===I.subTree)&&Fl(f,g,!0)):z(f,g,w,V,I,_,M,E,C)},Ke=(f,g,w,S,I,_,M,E,C)=>{g.slotScopeIds=E,f==null?g.shapeFlag&512?I.ctx.activate(g,w,S,M,C):cn(g,w,S,I,_,M,C):Pn(f,g,C)},cn=(f,g,w,S,I,_,M)=>{const E=f.component=Gp(f,S,I);if(Il(f)&&(E.ctx.renderer=He),Yp(E,!1,M),E.asyncDep){if(I&&I.registerDep(E,Ae,M),!f.el){const C=E.subTree=Ut(an);le(null,C,g,w),f.placeholder=C.el}}else Ae(E,f,g,w,I,_,M)},Pn=(f,g,w)=>{const S=g.component=f.component;if(Pp(f,g,w))if(S.asyncDep&&!S.asyncResolved){pe(S,g,w);return}else S.next=g,S.update();else g.el=f.el,S.vnode=g},Ae=(f,g,w,S,I,_,M)=>{const E=()=>{if(f.isMounted){let{next:$,bu:B,u:H,parent:J,vnode:ae}=f;{const st=zl(f);if(st){$&&($.el=ae.el,pe(f,$,M)),st.asyncDep.then(()=>{Xe(()=>{f.isUnmounted||k()},I)});return}}let ne=$,we;bn(f,!1),$?($.el=ae.el,pe(f,$,M)):$=ae,B&&ti(B),(we=$.props&&$.props.onVnodeBeforeUpdate)&&Pt(we,J,$,ae),bn(f,!0);const Pe=Qs(f),ve=f.subTree;f.subTree=Pe,q(ve,Pe,b(ve.el),xt(ve),f,I,_),$.el=Pe.el,ne===null&&Cp(f,Pe.el),H&&Xe(H,I),(we=$.props&&$.props.onVnodeUpdated)&&Xe(()=>Pt(we,J,$,ae),I)}else{let $;const{el:B,props:H}=g,{bm:J,m:ae,parent:ne,root:we,type:Pe}=f,ve=bo(g);bn(f,!1),J&&ti(J),!ve&&($=H&&H.onVnodeBeforeMount)&&Pt($,ne,g),bn(f,!0);{we.ce&&we.ce._hasShadowRoot()&&we.ce._injectChildStyle(Pe,f.parent?f.parent.type:void 0);const st=f.subTree=Qs(f);q(null,st,w,S,f,I,_),g.el=st.el}if(ae&&Xe(ae,I),!ve&&($=H&&H.onVnodeMounted)){const st=g;Xe(()=>Pt($,ne,st),I)}(g.shapeFlag&256||ne&&bo(ne.vnode)&&ne.vnode.shapeFlag&256)&&f.a&&Xe(f.a,I),f.isMounted=!0,g=w=S=null}};f.scope.on();const C=f.effect=new Qa(E);f.scope.off();const k=f.update=C.run.bind(C),V=f.job=C.runIfDirty.bind(C);V.i=f,V.id=f.uid,C.scheduler=()=>Br(V),bn(f,!0),k()},pe=(f,g,w)=>{g.component=f;const S=f.vnode.props;f.vnode=g,f.next=null,Mp(f,g.props,S,w),Op(f,g.children,w),Ot(),Us(f),Rt()},z=(f,g,w,S,I,_,M,E,C=!1)=>{const k=f&&f.children,V=f?f.shapeFlag:0,$=g.children,{patchFlag:B,shapeFlag:H}=g;if(B>0){if(B&128){ce(k,$,w,S,I,_,M,E,C);return}else if(B&256){ge(k,$,w,S,I,_,M,E,C);return}}H&8?(V&16&&rt(k,I,_),$!==k&&h(w,$)):V&16?H&16?ce(k,$,w,S,I,_,M,E,C):rt(k,I,_,!0):(V&8&&h(w,""),H&16&&yt($,w,S,I,_,M,E,C))},ge=(f,g,w,S,I,_,M,E,C)=>{f=f||Bn,g=g||Bn;const k=f.length,V=g.length,$=Math.min(k,V);let B;for(B=0;B<$;B++){const H=g[B]=C?Vt(g[B]):Mt(g[B]);q(f[B],H,w,null,I,_,M,E,C)}k>V?rt(f,I,_,!0,!1,$):yt(g,w,S,I,_,M,E,C,$)},ce=(f,g,w,S,I,_,M,E,C)=>{let k=0;const V=g.length;let $=f.length-1,B=V-1;for(;k<=$&&k<=B;){const H=f[k],J=g[k]=C?Vt(g[k]):Mt(g[k]);if(co(H,J))q(H,J,w,null,I,_,M,E,C);else break;k++}for(;k<=$&&k<=B;){const H=f[$],J=g[B]=C?Vt(g[B]):Mt(g[B]);if(co(H,J))q(H,J,w,null,I,_,M,E,C);else break;$--,B--}if(k>$){if(k<=B){const H=B+1,J=H<V?g[H].el:S;for(;k<=B;)q(null,g[k]=C?Vt(g[k]):Mt(g[k]),w,J,I,_,M,E,C),k++}}else if(k>B)for(;k<=$;)Ue(f[k],I,_,!0),k++;else{const H=k,J=k,ae=new Map;for(k=J;k<=B;k++){const Ne=g[k]=C?Vt(g[k]):Mt(g[k]);Ne.key!=null&&ae.set(Ne.key,k)}let ne,we=0;const Pe=B-J+1;let ve=!1,st=0;const pn=new Array(Pe);for(k=0;k<Pe;k++)pn[k]=0;for(k=H;k<=$;k++){const Ne=f[k];if(we>=Pe){Ue(Ne,I,_,!0);continue}let Fe;if(Ne.key!=null)Fe=ae.get(Ne.key);else for(ne=J;ne<=B;ne++)if(pn[ne-J]===0&&co(Ne,g[ne])){Fe=ne;break}Fe===void 0?Ue(Ne,I,_,!0):(pn[Fe-J]=k+1,Fe>=st?st=Fe:ve=!0,q(Ne,g[Fe],w,null,I,_,M,E,C),we++)}const Lt=ve?Np(pn):Bn;for(ne=Lt.length-1,k=Pe-1;k>=0;k--){const Ne=J+k,Fe=g[Ne],$o=g[Ne+1],at=Ne+1<V?$o.el||jl($o):S;pn[k]===0?q(null,Fe,w,at,I,_,M,E,C):ve&&(ne<0||k!==Lt[ne]?it(Fe,w,at,2):ne--)}}},it=(f,g,w,S,I=null)=>{const{el:_,type:M,transition:E,children:C,shapeFlag:k}=f;if(k&6){it(f.component.subTree,g,w,S);return}if(k&128){f.suspense.move(g,w,S);return}if(k&64){M.move(f,g,w,He);return}if(M===ee){i(_,g,w);for(let $=0;$<C.length;$++)it(C[$],g,w,S);i(f.anchor,g,w);return}if(M===tr){Q(f,g,w);return}if(S!==2&&k&1&&E)if(S===0)E.persisted&&!_[Zi]?i(_,g,w):(E.beforeEnter(_),i(_,g,w),Xe(()=>E.enter(_),I));else{const{leave:$,delayLeave:B,afterLeave:H}=E,J=()=>{f.ctx.isUnmounted?s(_):i(_,g,w)},ae=()=>{const ne=_._isLeaving||!!_[Zi];_._isLeaving&&_[Zi](!0),E.persisted&&!ne?J():$(_,()=>{J(),H&&H()})};B?B(_,J,ae):ae()}else i(_,g,w)},Ue=(f,g,w,S=!1,I=!1)=>{const{type:_,props:M,ref:E,children:C,dynamicChildren:k,shapeFlag:V,patchFlag:$,dirs:B,cacheIndex:H,memo:J}=f;if($===-2&&(I=!1),E!=null&&(Ot(),vo(E,null,w,f,!0),Rt()),H!=null&&(g.renderCache[H]=void 0),V&256){g.ctx.deactivate(f);return}const ae=V&1&&B,ne=!bo(f);let we;if(ne&&(we=M&&M.onVnodeBeforeUnmount)&&Pt(we,g,f),V&6)un(f.component,w,S);else{if(V&128){f.suspense.unmount(w,S);return}ae&&vn(f,null,g,"beforeUnmount"),V&64?f.type.remove(f,g,w,He,S):k&&!k.hasOnce&&(_!==ee||$>0&&$&64)?rt(k,g,w,!1,!0):(_===ee&&$&384||!I&&V&16)&&rt(C,g,w),S&&Je(f)}const Pe=J!=null&&H==null;(ne&&(we=M&&M.onVnodeUnmounted)||ae||Pe)&&Xe(()=>{we&&Pt(we,g,f),ae&&vn(f,null,g,"unmounted"),Pe&&(f.el=null)},w)},Je=f=>{const{type:g,el:w,anchor:S,transition:I}=f;if(g===ee){Ze(w,S);return}if(g===tr){W(f);return}const _=()=>{s(w),I&&!I.persisted&&I.afterLeave&&I.afterLeave()};if(f.shapeFlag&1&&I&&!I.persisted){const{leave:M,delayLeave:E}=I,C=()=>M(w,_);E?E(f.el,_,C):C()}else _()},Ze=(f,g)=>{let w;for(;f!==g;)w=P(f),s(f),f=w;s(g)},un=(f,g,w)=>{const{bum:S,scope:I,job:_,subTree:M,um:E,m:C,a:k}=f;na(C),na(k),S&&ti(S),I.stop(),_&&(_.flags|=8,Ue(M,f,g,w)),E&&Xe(E,g),Xe(()=>{f.isUnmounted=!0},g)},rt=(f,g,w,S=!1,I=!1,_=0)=>{for(let M=_;M<f.length;M++)Ue(f[M],g,w,S,I)},xt=f=>{if(f.shapeFlag&6)return xt(f.component.subTree);if(f.shapeFlag&128)return f.suspense.next();const g=P(f.anchor||f.el),w=g&&g[Zd];return w?P(w):g};let It=!1;const dn=(f,g,w)=>{let S;f==null?g._vnode&&(Ue(g._vnode,null,null,!0),S=g._vnode.component):q(g._vnode||null,f,g,null,null,null,w),g._vnode=f,It||(It=!0,Us(S),gl(),It=!1)},He={p:q,um:Ue,m:it,r:Je,mt:cn,mc:yt,pc:z,pbc:wt,n:xt,o:e};return{render:dn,hydrate:void 0,createApp:wp(dn)}}function er({type:e,props:t},n){return n==="svg"&&e==="foreignObject"||n==="mathml"&&e==="annotation-xml"&&t&&t.encoding&&t.encoding.includes("html")?void 0:n}function bn({effect:e,job:t},n){n?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function Dp(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function Fl(e,t,n=!1){const i=e.children,s=t.children;if(U(i)&&U(s))for(let l=0;l<i.length;l++){const u=i[l];let d=s[l];d.shapeFlag&1&&!d.dynamicChildren&&((d.patchFlag<=0||d.patchFlag===32)&&(d=s[l]=Vt(s[l]),d.el=u.el),!n&&d.patchFlag!==-2&&Fl(u,d)),d.type===ki&&(d.patchFlag===-1&&(d=s[l]=Vt(d)),d.el=u.el),d.type===an&&!d.el&&(d.el=u.el)}}function Np(e){const t=e.slice(),n=[0];let i,s,l,u,d;const p=e.length;for(i=0;i<p;i++){const v=e[i];if(v!==0){if(s=n[n.length-1],e[s]<v){t[i]=s,n.push(i);continue}for(l=0,u=n.length-1;l<u;)d=l+u>>1,e[n[d]]<v?l=d+1:u=d;v<e[n[l]]&&(l>0&&(t[i]=n[l-1]),n[l]=i)}}for(l=n.length,u=n[l-1];l-- >0;)n[l]=u,u=t[u];return n}function zl(e){const t=e.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:zl(t)}function na(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}function jl(e){if(e.placeholder)return e.placeholder;const t=e.component;return t?jl(t.subTree):null}const Bl=e=>e.__isSuspense;function Fp(e,t){t&&t.pendingBranch?U(e)?t.effects.push(...e):t.effects.push(e):Ud(e)}const ee=Symbol.for("v-fgt"),ki=Symbol.for("v-txt"),an=Symbol.for("v-cmt"),tr=Symbol.for("v-stc"),wo=[];let tt=null;function O(e=!1){wo.push(tt=e?null:[])}function zp(){wo.pop(),tt=wo[wo.length-1]||null}let Co=1;function oa(e,t=!1){Co+=e,e<0&&tt&&t&&(tt.hasOnce=!0)}function Hl(e){return e.dynamicChildren=Co>0?tt||Bn:null,zp(),Co>0&&tt&&tt.push(e),e}function R(e,t,n,i,s,l){return Hl(x(e,t,n,i,s,l,!0))}function jp(e,t,n,i,s){return Hl(Ut(e,t,n,i,s,!0))}function Vl(e){return e?e.__v_isVNode===!0:!1}function co(e,t){return e.type===t.type&&e.key===t.key}const Wl=({key:e})=>e??null,oi=({ref:e,ref_key:t,ref_for:n})=>(typeof e=="number"&&(e=""+e),e!=null?_e(e)||Be(e)||G(e)?{i:ct,r:e,k:t,f:!!n}:e:null);function x(e,t=null,n=null,i=0,s=null,l=e===ee?0:1,u=!1,d=!1){const p={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&Wl(t),ref:t&&oi(t),scopeId:bl,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:l,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:ct};return d?(fi(p,n),l&128&&e.normalize(p)):n&&(p.shapeFlag|=_e(n)?8:16),Co>0&&!u&&tt&&(p.patchFlag>0||l&6)&&p.patchFlag!==32&&tt.push(p),p}const Ut=Bp;function Bp(e,t=null,n=null,i=0,s=null,l=!1){if((!e||e===pp)&&(e=an),Vl(e)){const d=Yn(e,t,!0);return n&&fi(d,n),Co>0&&!l&&tt&&(d.shapeFlag&6?tt[tt.indexOf(e)]=d:tt.push(d)),d.patchFlag=-2,d}if(Qp(e)&&(e=e.__vccOpts),t){t=Hp(t);let{class:d,style:p}=t;d&&!_e(d)&&(t.class=be(d)),ue(p)&&(jr(p)&&!U(p)&&(p=De({},p)),t.style=Me(p))}const u=_e(e)?1:Bl(e)?128:Qd(e)?64:ue(e)?4:G(e)?2:0;return x(e,t,n,i,s,u,l,!0)}function Hp(e){return e?jr(e)||$l(e)?De({},e):e:null}function Yn(e,t,n=!1,i=!1){const{props:s,ref:l,patchFlag:u,children:d,transition:p}=e,v=t?Wp(s||{},t):s,h={__v_isVNode:!0,__v_skip:!0,type:e.type,props:v,key:v&&Wl(v),ref:t&&t.ref?n&&l?U(l)?l.concat(oi(t)):[l,oi(t)]:oi(t):l,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:d,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==ee?u===-1?16:u|16:u,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:p,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&Yn(e.ssContent),ssFallback:e.ssFallback&&Yn(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return p&&i&&Hr(h,p.clone(h)),h}function Vp(e=" ",t=0){return Ut(ki,null,e,t)}function Te(e="",t=!1){return t?(O(),jp(an,null,e)):Ut(an,null,e)}function Mt(e){return e==null||typeof e=="boolean"?Ut(an):U(e)?Ut(ee,null,e.slice()):Vl(e)?Vt(e):Ut(ki,null,String(e))}function Vt(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:Yn(e)}function fi(e,t){let n=0;const{shapeFlag:i}=e;if(t==null)t=null;else if(U(t))n=16;else if(typeof t=="object")if(i&65){const s=t.default;s&&(s._c&&(s._d=!1),fi(e,s()),s._c&&(s._d=!0));return}else{n=32;const s=t._;!s&&!$l(t)?t._ctx=ct:s===3&&ct&&(ct.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else if(G(t)){if(i&65){fi(e,{default:t});return}t={default:t,_ctx:ct},n=32}else t=String(t),i&64?(n=16,t=[Vp(t)]):n=8;e.children=t,e.shapeFlag|=n}function Wp(...e){const t={};for(let n=0;n<e.length;n++){const i=e[n];for(const s in i)if(s==="class")t.class!==i.class&&(t.class=be([t.class,i.class]));else if(s==="style")t.style=Me([t.style,i.style]);else if(gi(s)){const l=t[s],u=i[s];u&&l!==u&&!(U(l)&&l.includes(u))?t[s]=l?[].concat(l,u):u:u==null&&l==null&&!vi(s)&&(t[s]=u)}else s!==""&&(t[s]=i[s])}return t}function Pt(e,t,n,i=null){bt(e,t,7,[n,i])}const qp=Cl();let Up=0;function Gp(e,t,n){const i=e.type,s=(t?t.appContext:e.appContext)||qp,l={uid:Up++,vnode:e,type:i,parent:t,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new gd(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(s.provides),ids:t?t.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Rl(i,s),emitsOptions:El(i,s),emit:null,emitted:null,propsDefaults:me,inheritAttrs:i.inheritAttrs,ctx:me,data:me,props:me,attrs:me,slots:me,refs:me,setupState:me,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return l.ctx={_:l},l.root=t?t.root:l,l.emit=Ip.bind(null,l),e.ce&&e.ce(l),l}let qe=null;const Xp=()=>qe||ct;let mi,wr;{const e=yi(),t=(n,i)=>{let s;return(s=e[n])||(s=e[n]=[]),s.push(i),l=>{s.length>1?s.forEach(u=>u(l)):s[0](l)}};mi=t("__VUE_INSTANCE_SETTERS__",n=>qe=n),wr=t("__VUE_SSR_SETTERS__",n=>Eo=n)}const To=e=>{const t=qe;return mi(e),e.scope.on(),()=>{e.scope.off(),mi(t)}},ia=()=>{qe&&qe.scope.off(),mi(null)};function ql(e){return e.vnode.shapeFlag&4}let Eo=!1;function Yp(e,t=!1,n=!1){t&&wr(t);const{props:i,children:s}=e.vnode,l=ql(e);Ep(e,i,l,t),$p(e,s,n||t);const u=l?Kp(e,t):void 0;return t&&wr(!1),u}function Kp(e,t){const n=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,fp);const{setup:i}=n;if(i){Ot();const s=e.setupContext=i.length>1?Zp(e):null,l=To(e),u=Ao(i,e,0,[e.props,s]),d=qa(u);if(Rt(),l(),(d||e.sp)&&!bo(e)&&xl(e),d){if(u.then(ia,ia),t)return u.then(p=>{ra(e,p)}).catch(p=>{xi(p,e,0)});e.asyncDep=u}else ra(e,u)}else Ul(e)}function ra(e,t,n){G(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:ue(t)&&(e.setupState=fl(t)),Ul(e)}function Ul(e,t,n){const i=e.type;e.render||(e.render=i.render||Tt);{const s=To(e);Ot();try{mp(e)}finally{Rt(),s()}}}const Jp={get(e,t){return je(e,"get",""),e[t]}};function Zp(e){const t=n=>{e.exposed=n||{}};return{attrs:new Proxy(e.attrs,Jp),slots:e.slots,emit:e.emit,expose:t}}function Si(e){return e.exposed?e.exposeProxy||(e.exposeProxy=new Proxy(fl(Dd(e.exposed)),{get(t,n){if(n in t)return t[n];if(n in yo)return yo[n](e)},has(t,n){return n in t||n in yo}})):e.proxy}function Qp(e){return G(e)&&"__vccOpts"in e}const oe=(e,t)=>Bd(e,t,Eo),ef="3.5.39";let xr;const sa=typeof window<"u"&&window.trustedTypes;if(sa)try{xr=sa.createPolicy("vue",{createHTML:e=>e})}catch{}const Gl=xr?e=>xr.createHTML(e):e=>e,tf="http://www.w3.org/2000/svg",nf="http://www.w3.org/1998/Math/MathML",Ht=typeof document<"u"?document:null,aa=Ht&&Ht.createElement("template"),of={insert:(e,t,n)=>{t.insertBefore(e,n||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,n,i)=>{const s=t==="svg"?Ht.createElementNS(tf,e):t==="mathml"?Ht.createElementNS(nf,e):n?Ht.createElement(e,{is:n}):Ht.createElement(e);return e==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:e=>Ht.createTextNode(e),createComment:e=>Ht.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>Ht.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,n,i,s,l){const u=n?n.previousSibling:t.lastChild;if(s&&(s===l||s.nextSibling))for(;t.insertBefore(s.cloneNode(!0),n),!(s===l||!(s=s.nextSibling)););else{aa.innerHTML=Gl(i==="svg"?`<svg>${e}</svg>`:i==="mathml"?`<math>${e}</math>`:e);const d=aa.content;if(i==="svg"||i==="mathml"){const p=d.firstChild;for(;p.firstChild;)d.appendChild(p.firstChild);d.removeChild(p)}t.insertBefore(d,n)}return[u?u.nextSibling:t.firstChild,n?n.previousSibling:t.lastChild]}},rf=Symbol("_vtc");function sf(e,t,n){const i=e[rf];i&&(t=(t?[t,...i]:[...i]).join(" ")),t==null?e.removeAttribute("class"):n?e.setAttribute("class",t):e.className=t}const la=Symbol("_vod"),af=Symbol("_vsh"),lf=Symbol(""),cf=/(?:^|;)\s*display\s*:/;function uf(e,t,n){const i=e.style,s=_e(n);let l=!1;if(n&&!s){if(t)if(_e(t))for(const u of t.split(";")){const d=u.slice(0,u.indexOf(":")).trim();n[d]==null&&fo(i,d,"")}else for(const u in t)n[u]==null&&fo(i,u,"");for(const u in n){u==="display"&&(l=!0);const d=n[u];d!=null?pf(e,u,!_e(t)&&t?t[u]:void 0,d)||fo(i,u,d):fo(i,u,"")}}else if(s){if(t!==n){const u=i[lf];u&&(n+=";"+u),i.cssText=n,l=cf.test(n)}}else t&&e.removeAttribute("style");la in e&&(e[la]=l?i.display:"",e[af]&&(i.display="none"))}const ca=/\s*!important$/;function fo(e,t,n){if(U(n))n.forEach(i=>fo(e,t,i));else if(n==null&&(n=""),t.startsWith("--"))e.setProperty(t,n);else{const i=df(e,t);ca.test(n)?e.setProperty(ln(i),n.replace(ca,""),"important"):e[i]=n}}const ua=["Webkit","Moz","ms"],nr={};function df(e,t){const n=nr[t];if(n)return n;let i=ht(t);if(i!=="filter"&&i in e)return nr[t]=i;i=Xa(i);for(let s=0;s<ua.length;s++){const l=ua[s]+i;if(l in e)return nr[t]=l}return t}function pf(e,t,n,i){return e.tagName==="TEXTAREA"&&(t==="width"||t==="height")&&_e(i)&&n===i}const da="http://www.w3.org/1999/xlink";function pa(e,t,n,i,s,l=md(t)){i&&t.startsWith("xlink:")?n==null?e.removeAttributeNS(da,t.slice(6,t.length)):e.setAttributeNS(da,t,n):n==null||l&&!Ka(n)?e.removeAttribute(t):e.setAttribute(t,l?"":$t(n)?String(n):n)}function fa(e,t,n,i,s){if(t==="innerHTML"||t==="textContent"){n!=null&&(e[t]=t==="innerHTML"?Gl(n):n);return}const l=e.tagName;if(t==="value"&&l!=="PROGRESS"&&!l.includes("-")){const d=l==="OPTION"?e.getAttribute("value")||"":e.value,p=n==null?e.type==="checkbox"?"on":"":String(n);(d!==p||!("_value"in e))&&(e.value=p),n==null&&e.removeAttribute(t),e._value=n;return}let u=!1;if(n===""||n==null){const d=typeof e[t];d==="boolean"?n=Ka(n):n==null&&d==="string"?(n="",u=!0):d==="number"&&(n=0,u=!0)}try{e[t]=n}catch{}u&&e.removeAttribute(s||t)}function jn(e,t,n,i){e.addEventListener(t,n,i)}function ff(e,t,n,i){e.removeEventListener(t,n,i)}const ma=Symbol("_vei");function mf(e,t,n,i,s=null){const l=e[ma]||(e[ma]={}),u=l[t];if(i&&u)u.value=i;else{const[d,p]=vf(t);if(i){const v=l[t]=wf(i,s);jn(e,d,v,p)}else u&&(ff(e,d,u,p),l[t]=void 0)}}const hf=/(Once|Passive|Capture)$/,gf=/^on:?(?:Once|Passive|Capture)$/;function vf(e){let t,n;for(;(n=e.match(hf))&&!gf.test(e);)t||(t={}),e=e.slice(0,e.length-n[1].length),t[n[1].toLowerCase()]=!0;return[e[2]===":"?e.slice(3):ln(e.slice(2)),t]}let or=0;const bf=Promise.resolve(),yf=()=>or||(bf.then(()=>or=0),or=Date.now());function wf(e,t){const n=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=n.attached)return;const s=n.value;if(U(s)){const l=i.stopImmediatePropagation;i.stopImmediatePropagation=()=>{l.call(i),i._stopped=!0};const u=s.slice(),d=[i];for(let p=0;p<u.length&&!i._stopped;p++){const v=u[p];v&&bt(v,t,5,d)}}else bt(s,t,5,[i])};return n.value=e,n.attached=yf(),n}const ha=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)>96&&e.charCodeAt(2)<123,xf=(e,t,n,i,s,l)=>{const u=s==="svg";t==="class"?sf(e,i,u):t==="style"?uf(e,n,i):gi(t)?vi(t)||mf(e,t,n,i,l):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):If(e,t,i,u))?(fa(e,t,i),!e.tagName.includes("-")&&(t==="value"||t==="checked"||t==="selected")&&pa(e,t,i,u,l,t!=="value")):e._isVueCE&&(_f(e,t)||e._def.__asyncLoader&&(/[A-Z]/.test(t)||!_e(i)))?fa(e,ht(t),i,l,t):(t==="true-value"?e._trueValue=i:t==="false-value"&&(e._falseValue=i),pa(e,t,i,u))};function If(e,t,n,i){if(i)return!!(t==="innerHTML"||t==="textContent"||t in e&&ha(t)&&G(n));if(t==="spellcheck"||t==="draggable"||t==="translate"||t==="autocorrect"||t==="sandbox"&&e.tagName==="IFRAME"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA")return!1;if(t==="width"||t==="height"){const s=e.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return ha(t)&&_e(n)?!1:t in e}function _f(e,t){const n=e._def.props;if(!n)return!1;const i=ht(t);return Array.isArray(n)?n.some(s=>ht(s)===i):Object.keys(n).some(s=>ht(s)===i)}const ga=e=>{const t=e.props["onUpdate:modelValue"]||!1;return U(t)?n=>ti(t,n):t};function kf(e){e.target.composing=!0}function va(e){const t=e.target;t.composing&&(t.composing=!1,t.dispatchEvent(new Event("input")))}const ir=Symbol("_assign");function ba(e,t,n){return t&&(e=e.trim()),n&&(e=Tr(e)),e}const rr={created(e,{modifiers:{lazy:t,trim:n,number:i}},s){e[ir]=ga(s);const l=i||s.props&&s.props.type==="number";jn(e,t?"change":"input",u=>{u.target.composing||e[ir](ba(e.value,n,l))}),(n||l)&&jn(e,"change",()=>{e.value=ba(e.value,n,l)}),t||(jn(e,"compositionstart",kf),jn(e,"compositionend",va),jn(e,"change",va))},mounted(e,{value:t}){e.value=t??""},beforeUpdate(e,{value:t,oldValue:n,modifiers:{lazy:i,trim:s,number:l}},u){if(e[ir]=ga(u),e.composing)return;const d=(l||e.type==="number")&&!/^0\d/.test(e.value)?Tr(e.value):e.value,p=t??"";if(d===p)return;const v=e.getRootNode();(v instanceof Document||v instanceof ShadowRoot)&&v.activeElement===e&&e.type!=="range"&&(i&&t===n||s&&e.value.trim()===p)||(e.value=p)}},Sf=["ctrl","shift","alt","meta"],Pf={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>"button"in e&&e.button!==0,middle:e=>"button"in e&&e.button!==1,right:e=>"button"in e&&e.button!==2,exact:(e,t)=>Sf.some(n=>e[`${n}Key`]&&!t.includes(n))},D=(e,t)=>{if(!e)return e;const n=e._withMods||(e._withMods={}),i=t.join(".");return n[i]||(n[i]=((s,...l)=>{for(let u=0;u<t.length;u++){const d=Pf[t[u]];if(d&&d(s,t))return}return e(s,...l)}))},Cf={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Ef=(e,t)=>{const n=e._withKeys||(e._withKeys={}),i=t.join(".");return n[i]||(n[i]=(s=>{if(!("key"in s))return;const l=ln(s.key);if(t.some(u=>u===l||Cf[u]===l))return e(s)}))},Mf=De({patchProp:xf},of);let ya;function Af(){return ya||(ya=Rp(Mf))}const Tf=((...e)=>{const t=Af().createApp(...e),{mount:n}=t;return t.mount=i=>{const s=Of(i);if(!s)return;const l=t._component;!G(l)&&!l.render&&!l.template&&(l.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const u=n(s,!1,$f(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),u},t});function $f(e){if(e instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&e instanceof MathMLElement)return"mathml"}function Of(e){return _e(e)?document.querySelector(e):e}async function Rf(e,t){const n=await fetch("/api/connect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({from:e,to:t})});if(!n.ok){const s=await n.json().catch(()=>null);throw new Error(s?.error||`Connection naming failed with ${n.status}`)}const i=await n.json();if(!i.meaning)throw new Error("Connection naming returned no meaning");return i.meaning}async function Lf(e){const t=await fetch("/api/suggest",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>null);throw new Error(i?.error||`Suggestion request failed with ${t.status}`)}const n=await t.json();return Array.isArray(n.suggestions)?n.suggestions.slice(0,3):[]}async function Df(e){const t=await fetch("/api/group-actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>null);throw new Error(i?.error||`Group action suggestion failed with ${t.status}`)}const n=await t.json();return Array.isArray(n.actions)?n.actions.slice(0,4):[]}async function Nf(e,t){const n=await fetch("/api/generate-image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e,model:t??void 0})});if(!n.ok){const s=await n.json().catch(()=>null);throw new Error(s?.error||`Image generation failed with ${n.status}`)}const i=await n.json();if(typeof i.image!="string"||!i.image.startsWith("data:image/"))throw new Error("Image generation returned no image");return i}async function Ff(e){const t=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!t.ok){const i=await t.json().catch(()=>null);throw new Error(i?.error||`AI generation failed with ${t.status}`)}const n=await t.json();if(!Array.isArray(n.artifacts)||!n.artifacts.length)throw new Error("AI generation returned no artifacts");return n}const ii=320,Ir=230,Xl=.35,zf=2.4,jf=560,Bf=82;function ri(){return new Intl.DateTimeFormat("en",{hour:"2-digit",minute:"2-digit"}).format(new Date)}function sr(e){return JSON.parse(JSON.stringify(e))}function Yl(e){return[...new Set(e.filter(Boolean))]}function Ur(e){return{inputs:e?.inputs??[],outputs:e?.outputs??[]}}function Kn(e){const t=e.trim().replace(/\s+/g," ");return t?t.length>42?`${t.slice(0,39)}...`:t:"Untitled artifact"}function Hf(e){const t=e.toLowerCase(),n=["semantic object"];return/\b(list|item|collection|inventory)\b/.test(t)&&n.push("list"),/\b(game|card|condition|rule|turn|score|player|level)\b/.test(t)&&n.push("game logic"),/\b(plan|schedule|week|calendar|reminder|routine)\b/.test(t)&&n.push("plan"),/\b(button|form|screen|page|ui|component|dashboard|modal|widget|vue|react)\b/.test(t)&&n.push("interface"),/\b(data|table|csv|transform|calculate|number)\b/.test(t)&&n.push("data"),Yl(n).slice(0,4)}function Vf(e){const t=e.toLowerCase(),n=["source","constraint","result"];return/\b(list|item|collection|inventory)\b/.test(t)&&n.push("item","quantity","place"),/\b(game|card|condition|rule)\b/.test(t)&&n.push("trigger","state","target"),/\b(plan|schedule|week|calendar)\b/.test(t)&&n.push("date","task","dependency"),/\b(button|form|screen|page|ui|component)\b/.test(t)&&n.push("input","event","view"),Yl(n).slice(0,6)}function Wf(e,t="unknown"){const n=e.toLowerCase();return/\b(html|javascript|js|interactive|component|button|form|screen|page|ui|widget|vue|react|counter|calculator|simulate|simulation|simulator|explorer|atlas|map)\b/.test(n)?"component":/\b(image|picture|photo|illustration|logo|icon|poster|visual|wallpaper)\b/.test(n)?"image":/\b(video|movie|clip|animation|trailer)\b/.test(n)?"video":/\b(text|copy|poem|story|essay|markdown|explain|write|article|headline)\b/.test(n)?"text":/\b(card|plan|schedule|list|game|condition|rule|data|table|routine|inventory)\b/.test(n)?"object":t}function qf(e){return{raw:e,description:e,tags:Hf(e),connections:Vf(e),capabilities:["accepts detail","can connect","can transform"],facets:[{label:"role",value:"semantic object"},{label:"state",value:"draft"}],summary:"Universal artifact shell. Meaning, capabilities, and connections are model-defined.",ports:Ur()}}function Uf(e){const t=e.toLowerCase();return/\b(forest|bioregion|watershed|ecology|ecological)\b/.test(t)?!0:/\b(map|atlas|city|world|explorer)\b/.test(t)&&/\b(nature|wildlife|habitat|green|regenerative|rewild|landscape|river)\b/.test(t)}function Gf(e){const t=Kn(e),i=`<template>
  <main class="spatial-world" :class="'climate-' + climate">
    <header class="atlas-header">
      <div>
        <span class="eyebrow">living atlas</span>
        <h3>{{ title }}</h3>
      </div>
      <div class="harmony-seal" :style="{ '--harmony': harmony + '%' }">
        <strong>{{ harmony }}</strong><small>harmony</small>
      </div>
      <button
        class="restore"
        type="button"
        :disabled="!hasChanges && !selectedRegion"
        aria-label="Restore the atlas and return to the whole world"
        @click="restoreWorld"
      >↺ <span>restore</span></button>
    </header>

    <section class="atlas-stage" aria-label="Interactive map of six connected regions">
      <svg
        class="atlas"
        viewBox="0 0 640 380"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="A living map. Select a named region to explore and change it."
      >
        <defs>
          <radialGradient id="worldGlow" cx="48%" cy="42%">
            <stop offset="0" stop-color="#d8edaf" stop-opacity=".18" />
            <stop offset="1" stop-color="#101a16" stop-opacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect x="4" y="4" width="632" height="372" rx="42" fill="#101916" />
        <rect x="4" y="4" width="632" height="372" rx="42" fill="url(#worldGlow)" />

        <path class="river" d="M-10 73 C115 111 103 211 237 203 S385 108 482 167 S545 318 654 286" />
        <g class="corridors" aria-hidden="true">
          <path d="M143 102 C215 92 251 123 300 105 S403 85 487 108" />
          <path d="M124 252 C209 221 278 281 365 246 S480 212 541 260" />
          <path d="M188 158 C244 188 298 189 347 166 S429 150 486 181" />
        </g>

        <g
          v-for="region in regions"
          :key="region.id"
          class="region"
          :class="{ selected: selectedId === region.id }"
          role="button"
          tabindex="0"
          :aria-label="region.name + ', canopy ' + region.canopy + ', community ' + region.community"
          @click="selectRegion(region)"
          @keydown.enter.prevent="selectRegion(region)"
          @keydown.space.prevent="selectRegion(region)"
        >
          <title>{{ region.name }} — select to explore</title>
          <path class="region-land" :d="region.path" :fill="regionColor(region)" />
          <circle
            class="canopy"
            :cx="region.cx"
            :cy="region.cy - 10"
            :r="12 + region.canopy * .14"
            :style="{ opacity: .26 + region.canopy / 180 }"
          />
          <circle
            v-for="marker in communityMarkers(region)"
            :key="marker"
            class="community"
            :cx="region.cx + ((marker - 1) % 3) * 10 - 10"
            :cy="region.cy + 14 + Math.floor((marker - 1) / 3) * 9"
            r="3.2"
          />
          <text class="region-label" :x="region.cx" :y="region.cy - 4" text-anchor="middle">{{ region.name }}</text>
          <text class="region-reading" :x="region.cx" :y="region.cy + 9" text-anchor="middle">
            {{ region.canopy }} leaf · {{ region.community }} life
          </text>
        </g>

        <g class="landmarks" aria-hidden="true">
          <path d="M116 62 l8 -15 8 15 z M108 64 h32 v5 h-32z" />
          <circle cx="300" cy="72" r="7" />
          <path d="M471 72 h18 v18 h-18z M476 66 h8 v6 h-8z" />
          <path d="M89 284 q14 -24 28 0 z" />
          <circle cx="346" cy="302" r="8" />
          <path d="M536 278 l11 -17 11 17 z" />
        </g>
      </svg>

      <div v-if="selectedRegion" class="focus-strip" aria-live="polite">
        <button class="return" type="button" aria-label="Return to the whole atlas" @click="returnToWhole">←</button>
        <div class="focus-copy">
          <strong>{{ selectedRegion.name }}</strong>
          <small>{{ selectedRegion.canopy }} canopy · {{ selectedRegion.community }} community · {{ selectedRegion.water }} water</small>
        </div>
        <div class="domain-actions">
          <button type="button" @click="rewildSelected"><i>✦</i><span>rewild</span></button>
          <button type="button" @click="settleSelected"><i>⌂</i><span>settle gently</span></button>
        </div>
      </div>
      <div v-else class="atlas-hint">
        <span class="climate-mark" aria-hidden="true">{{ climateGlyph }}</span>
        <span>Touch a region to enter it</span>
        <small>{{ climate }} climate</small>
      </div>
    </section>
  </main>
</template>

<script>
const { computed, onMounted, reactive, ref, watch } = Vue;

const fallbackInputs = reactive({ climate: 'temperate' });
const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
const dotInputs = dot.inputs ?? fallbackInputs;
const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};

export default {
  setup() {
    const title = ${JSON.stringify(t).replace(/</g,"\\u003c")};
    const initialRegions = [
      { id: 'crown', name: 'Canopy Crown', path: 'M28 38 L198 27 L222 122 L151 166 L31 137 Z', cx: 124, cy: 95, canopy: 86, community: 34, water: 52 },
      { id: 'commons', name: 'River Commons', path: 'M205 29 L400 34 L419 132 L338 173 L222 122 Z', cx: 308, cy: 96, canopy: 62, community: 68, water: 76 },
      { id: 'ridge', name: 'Solar Ridge', path: 'M400 34 L610 53 L607 151 L511 176 L419 132 Z', cx: 506, cy: 105, canopy: 48, community: 72, water: 38 },
      { id: 'moss', name: 'Moss Quarter', path: 'M31 137 L151 166 L219 237 L180 346 L36 326 Z', cx: 119, cy: 248, canopy: 91, community: 27, water: 67 },
      { id: 'wetland', name: 'Wetland Gate', path: 'M151 166 L338 173 L402 261 L369 351 L180 346 L219 237 Z', cx: 298, cy: 264, canopy: 73, community: 43, water: 92 },
      { id: 'garden', name: 'Garden District', path: 'M338 173 L511 176 L607 151 L606 327 L369 351 L402 261 Z', cx: 500, cy: 264, canopy: 57, community: 81, water: 58 },
    ];
    const regions = reactive(initialRegions.map((region) => ({ ...region })));
    const selectedId = ref(null);
    const hasChanges = ref(false);
    const climate = ref('temperate');
    const climateInput = computed(() => String(dotInputs.climate ?? '').trim().toLowerCase());
    const selectedRegion = computed(() => regions.find((region) => region.id === selectedId.value) ?? null);
    const climateGlyph = computed(() => ({ temperate: '◌', wet: '≈', dry: '☼', cool: '✦' }[climate.value]));

    function vitality(region) {
      const climateEffect =
        climate.value === 'wet' ? region.water * .09 :
        climate.value === 'dry' ? (100 - region.water) * .06 - 7 :
        climate.value === 'cool' ? region.canopy * .04 :
        4;
      const relationshipFit = 100 - Math.abs(region.canopy - region.community) * .48;
      return Math.max(18, Math.min(100, Math.round((region.canopy + region.water + relationshipFit) / 3 + climateEffect)));
    }

    const harmony = computed(() => Math.round(regions.reduce((sum, region) => sum + vitality(region), 0) / regions.length));
    const worldState = computed(() => ({
      climate: climate.value,
      harmony: harmony.value,
      selectedRegion: selectedId.value,
      regions: regions.map((region) => ({
        id: region.id,
        canopy: region.canopy,
        community: region.community,
        water: region.water,
        vitality: vitality(region),
      })),
    }));

    watch(climateInput, (next) => {
      if (/rain|wet|flood|storm/.test(next)) climate.value = 'wet';
      else if (/dry|drought|heat|hot|arid/.test(next)) climate.value = 'dry';
      else if (/cold|cool|snow|frost/.test(next)) climate.value = 'cool';
      else climate.value = 'temperate';
    }, { immediate: true });

    watch(worldState, (next) => emitDot('worldState', next), { deep: true });

    function regionColor(region) {
      const score = vitality(region);
      const hue = 82 + region.canopy * .42;
      const light = 17 + score * .16;
      return 'hsl(' + hue + ' 38% ' + light + '%)';
    }

    function communityMarkers(region) {
      return Math.max(2, Math.min(6, Math.round(region.community / 16)));
    }

    function selectRegion(region) {
      selectedId.value = region.id;
      emitDot('regionSelected', {
        id: region.id,
        name: region.name,
        canopy: region.canopy,
        community: region.community,
        water: region.water,
      });
    }

    function rewildSelected() {
      if (!selectedRegion.value) return;
      selectedRegion.value.canopy = Math.min(100, selectedRegion.value.canopy + 9);
      selectedRegion.value.water = Math.min(100, selectedRegion.value.water + 5);
      selectedRegion.value.community = Math.max(12, selectedRegion.value.community - 3);
      hasChanges.value = true;
    }

    function settleSelected() {
      if (!selectedRegion.value) return;
      selectedRegion.value.community = Math.min(100, selectedRegion.value.community + 9);
      selectedRegion.value.canopy = Math.max(18, selectedRegion.value.canopy - 5);
      selectedRegion.value.water = Math.max(16, selectedRegion.value.water - 2);
      hasChanges.value = true;
    }

    function returnToWhole() {
      selectedId.value = null;
    }

    function restoreWorld() {
      regions.forEach((region, index) => Object.assign(region, initialRegions[index]));
      selectedId.value = null;
      hasChanges.value = false;
    }

    onMounted(() => emitDot('worldState', worldState.value));

    return {
      climate,
      climateGlyph,
      communityMarkers,
      harmony,
      hasChanges,
      regions,
      regionColor,
      restoreWorld,
      returnToWhole,
      rewildSelected,
      selectedId,
      selectedRegion,
      selectRegion,
      settleSelected,
      title,
      vitality,
    };
  },
};
<\/script>

<style>
.spatial-world {
  --cream: #fff7dc;
  --leaf: #93e394;
  display: grid;
  width: 100%;
  height: 100vh;
  min-height: 260px;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(8px, 2vh, 14px);
  padding: clamp(12px, 3.5vw, 22px);
  overflow: hidden;
  color: var(--cream);
  background:
    radial-gradient(circle at 15% 8%, rgba(132,211,126,.14), transparent 31%),
    radial-gradient(circle at 84% 82%, rgba(223,181,103,.1), transparent 30%),
    #0e1512;
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
}
.atlas-header { z-index: 3; display: grid; grid-template-columns: minmax(0,1fr) auto auto; align-items: center; gap: 10px; }
.eyebrow { color: rgba(255,247,220,.5); font-size: 9px; font-weight: 850; letter-spacing: .16em; text-transform: uppercase; }
h3 { margin: 2px 0 0; overflow: hidden; font-size: clamp(15px,4.7vw,25px); line-height: 1.05; letter-spacing: -.035em; text-overflow: ellipsis; white-space: nowrap; }
.harmony-seal { display: grid; width: 44px; aspect-ratio: 1; place-content: center; border-radius: 50%; background: conic-gradient(var(--leaf) var(--harmony), rgba(255,255,255,.08) 0); text-align: center; box-shadow: inset 0 0 0 5px #172019; }
.harmony-seal strong { font-size: 12px; line-height: 1; }.harmony-seal small { color: rgba(255,247,220,.48); font-size: 5px; letter-spacing: .08em; text-transform: uppercase; }
.restore { display: grid; min-width: 42px; min-height: 42px; padding: 4px 7px; place-items: center; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; color: inherit; background: rgba(255,255,255,.04); font-size: 15px; cursor: pointer; }
.restore span { font-size: 6px; letter-spacing: .08em; text-transform: uppercase; }.restore:disabled { cursor: default; opacity: .25; }
.atlas-stage { position: relative; min-height: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.1); border-radius: clamp(20px,6vw,38px); background: #101916; isolation: isolate; }
.atlas { display: block; width: 100%; height: 100%; }
.river { fill: none; stroke: #6dbac0; stroke-linecap: round; stroke-opacity: .62; stroke-width: 8; transition: stroke-width .45s ease, stroke .45s ease; }
.climate-wet .river { stroke: #79d4dc; stroke-width: 14; }.climate-dry .river { stroke: #b8a873; stroke-width: 4; stroke-opacity: .48; }.climate-cool .river { stroke: #b8dbe1; }
.corridors { fill: none; stroke: rgba(239,224,166,.28); stroke-dasharray: 4 9; stroke-linecap: round; stroke-width: 2; }
.region { cursor: pointer; outline: none; }
.region-land { stroke: rgba(255,255,255,.14); stroke-width: 2; transition: fill .4s ease, stroke .2s ease, transform .25s ease; transform-box: fill-box; transform-origin: center; }
.region:hover .region-land, .region:focus-visible .region-land { stroke: var(--cream); stroke-width: 4; transform: scale(.985); }
.region.selected .region-land { stroke: var(--leaf); stroke-width: 5; filter: url(#softGlow); }
.canopy { fill: #76d57f; filter: url(#softGlow); pointer-events: none; transition: r .4s ease, opacity .4s ease; }
.community { fill: #ffd381; stroke: rgba(50,35,18,.55); stroke-width: 1; pointer-events: none; }
.region-label { fill: var(--cream); font-size: 12px; font-weight: 780; letter-spacing: .01em; pointer-events: none; }
.region-reading { fill: rgba(255,247,220,.58); font-size: 7px; letter-spacing: .04em; pointer-events: none; }
.landmarks { fill: #f7d58b; opacity: .72; filter: url(#softGlow); }
.focus-strip { position: absolute; z-index: 8; right: clamp(7px,2vw,13px); bottom: clamp(7px,2vw,13px); left: clamp(7px,2vw,13px); display: grid; grid-template-columns: auto minmax(0,1fr) auto; min-height: 54px; align-items: center; gap: 9px; padding: 7px; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; background: rgba(10,17,13,.88); box-shadow: 0 8px 30px rgba(0,0,0,.26); backdrop-filter: blur(12px); }
.return { width: 40px; min-height: 40px; padding: 0; border: 1px solid rgba(255,255,255,.12); border-radius: 50%; color: inherit; background: rgba(255,255,255,.05); cursor: pointer; }
.focus-copy { min-width: 0; }.focus-copy strong, .focus-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.focus-copy strong { font-size: 12px; }.focus-copy small { margin-top: 3px; color: rgba(255,247,220,.55); font-size: 7px; }
.domain-actions { display: flex; gap: 5px; }.domain-actions button { display: grid; min-width: 58px; min-height: 40px; padding: 4px 7px; place-items: center; border: 1px solid rgba(255,255,255,.13); border-radius: 13px; color: inherit; background: rgba(147,227,148,.08); cursor: pointer; }.domain-actions i { color: var(--leaf); font-style: normal; font-size: 13px; }.domain-actions span { font-size: 6px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
.atlas-hint { position: absolute; z-index: 5; right: 12px; bottom: 10px; display: flex; align-items: center; gap: 7px; color: rgba(255,247,220,.72); font-size: 9px; letter-spacing: .04em; pointer-events: none; }.atlas-hint small { color: rgba(255,247,220,.4); font-size: 7px; text-transform: uppercase; }.climate-mark { display: grid; width: 26px; aspect-ratio: 1; place-content: center; border-radius: 50%; color: #18301d; background: var(--leaf); font-size: 15px; }
@media (max-height: 340px) {
  .spatial-world { grid-template-columns: minmax(105px,.48fr) 1.52fr; grid-template-rows: 1fr; gap: 9px; }
  .atlas-header { grid-template-columns: 1fr auto; align-content: start; }.atlas-header > div:first-child { grid-column: 1 / 3; }.restore span, .harmony-seal small { display: none; }
  .atlas-stage { grid-column: 2; grid-row: 1; }.focus-strip { min-height: 48px; }.focus-copy small { display: none; }
}
@media (max-width: 410px) {
  .atlas-hint small { display: none; }.domain-actions button { min-width: 48px; }.domain-actions span { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
}
</style>`;return{raw:i,description:e,vue:i,tags:["component","vue","map","atlas","ecology"],connections:["climate","world state","region selection","ecological balance"],capabilities:["explore","rewild","settle","restore","connect"],summary:"Interactive six-region living atlas with direct selection, ecological trade-offs, climate response, and a restorable world state.",ports:{inputs:[{id:"climate",label:"climate",type:"text",mode:"state",purpose:"Changes water, vitality, and atmosphere when connected text describes wet, dry, hot, cool, or temperate conditions."}],outputs:[{id:"worldState",label:"world state",type:"data",mode:"state",purpose:"Emits climate, harmony, selection, and the canopy, community, water, and vitality of all six regions."},{id:"regionSelected",label:"region selected",type:"event",mode:"event",purpose:"Emits the selected region and its current ecological state."}]}}}function Xf(e){const t=e.toLowerCase(),n=/\b(farm|farming|ranch|livestock|pasture|agriculture|animal|ecosystem|habitat)\b/.test(t),i=/\b(simulat(?:e|or|ion)|ecosystem|balance|season|weather|population|interactive world)\b/.test(t);return n&&i}function Yf(e){const t=Kn(e),i=`<template>
  <main class="farm-instrument" :class="['season-' + season.id, 'weather-' + weather]">
    <header class="world-header">
      <div>
        <span class="eyebrow">living farm</span>
        <h3>{{ title }}</h3>
      </div>
      <div class="balance-seal" :style="{ '--balance': balance + '%' }">
        <strong>{{ balance }}</strong><small>balance</small>
      </div>
    </header>

    <section class="world" aria-label="Interactive farm ecosystem">
      <button
        class="sky-control"
        type="button"
        :aria-label="'Weather is ' + weather + '. Change weather'"
        @click="cycleWeather"
      >
        <span aria-hidden="true">{{ weatherGlyph }}</span>
        <small>{{ weather }}</small>
      </button>

      <div class="cloud cloud-one" aria-hidden="true"></div>
      <div class="cloud cloud-two" aria-hidden="true"></div>
      <div class="hills" aria-hidden="true"></div>
      <div class="barn" aria-hidden="true"><i></i><b></b></div>

      <div class="pastures" aria-label="Pastures">
        <button
          v-for="(plot, index) in plots"
          :key="plot.name"
          class="plot"
          type="button"
          :aria-label="plot.growth >= 8 ? 'Harvest ' + plot.name + ' pasture' : 'Tend ' + plot.name + ' pasture'"
          @click="tendPlot(index)"
        >
          <span class="crop-row" aria-hidden="true">
            <i v-for="crop in plot.growth" :key="crop" :style="{ '--crop': crop }"></i>
          </span>
          <small>{{ plot.growth >= 8 ? 'harvest' : plot.name }}</small>
        </button>
      </div>

      <div class="animal-rail" aria-label="Welcome animals">
        <button
          v-for="animal in animals"
          :key="animal.id"
          class="animal"
          type="button"
          :aria-label="'Welcome a ' + animal.name + '. ' + animal.count + ' here'"
          @click="welcomeAnimal(animal)"
        >
          <span aria-hidden="true">{{ animal.glyph }}</span>
          <b>{{ animal.count }}</b>
        </button>
      </div>
    </section>

    <footer class="world-controls">
      <div class="season-cycle" role="group" aria-label="Season">
        <button
          v-for="(item, index) in seasons"
          :key="item.id"
          type="button"
          :class="{ active: index === seasonIndex }"
          :aria-pressed="index === seasonIndex"
          :aria-label="'Move farm into ' + item.name"
          @click="chooseSeason(index)"
        ><span aria-hidden="true">{{ item.glyph }}</span><small>{{ item.name }}</small></button>
      </div>
      <div class="balance-bed" :aria-label="'Ecosystem balance ' + balance + ' percent'">
        <i :style="{ width: balance + '%' }"></i>
        <small>{{ balanceHint }}</small>
      </div>
    </footer>
  </main>
</template>

<script>
const { computed, onMounted, reactive, ref, watch } = Vue;

const fallbackInputs = reactive({ climate: '' });
const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
const dotInputs = dot.inputs ?? fallbackInputs;
const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};

export default {
  setup() {
    const title = ${JSON.stringify(t).replace(/</g,"\\u003c")};
    const seasons = [
      { id: 'spring', name: 'spring', glyph: '✿' },
      { id: 'summer', name: 'summer', glyph: '☀' },
      { id: 'autumn', name: 'autumn', glyph: '◇' },
      { id: 'winter', name: 'winter', glyph: '✦' },
    ];
    const seasonIndex = ref(0);
    const weather = ref('sun');
    const weatherCycle = ['sun', 'rain', 'wind'];
    const plots = reactive([
      { name: 'clover', growth: 4 },
      { name: 'grain', growth: 6 },
      { name: 'orchard', growth: 3 },
    ]);
    const animals = reactive([
      { id: 'cows', name: 'cow', glyph: '🐄', count: 2 },
      { id: 'sheep', name: 'sheep', glyph: '🐑', count: 3 },
      { id: 'hens', name: 'hen', glyph: '🐓', count: 4 },
    ]);

    const climate = computed(() => String(dotInputs.climate ?? '').trim().toLowerCase());
    const season = computed(() => seasons[seasonIndex.value]);
    const weatherGlyph = computed(() => ({ sun: '☀', rain: '☂', wind: '≋' }[weather.value]));
    const totalGrowth = computed(() => plots.reduce((sum, plot) => sum + plot.growth, 0));
    const totalAnimals = computed(() => animals.reduce((sum, animal) => sum + animal.count, 0));
    const balance = computed(() => {
      const carryingFit = 100 - Math.abs(totalGrowth.value - totalAnimals.value * 1.7) * 4;
      const climateFit = weather.value === 'rain' && season.value.id === 'winter' ? -10 : 4;
      return Math.max(18, Math.min(100, Math.round(carryingFit + climateFit)));
    });
    const balanceHint = computed(() => {
      if (balance.value > 82) return 'thriving together';
      if (balance.value > 58) return 'finding balance';
      return totalAnimals.value * 1.7 > totalGrowth.value ? 'grow more pasture' : 'welcome more life';
    });
    const farmState = computed(() => ({
      season: season.value.id,
      weather: weather.value,
      balance: balance.value,
      animals: Object.fromEntries(animals.map((animal) => [animal.id, animal.count])),
      pastures: Object.fromEntries(plots.map((plot) => [plot.name, plot.growth])),
    }));

    watch(climate, (next) => {
      if (/rain|wet|storm/.test(next)) weather.value = 'rain';
      else if (/wind|dry|breeze/.test(next)) weather.value = 'wind';
      else if (/sun|warm|clear|hot/.test(next)) weather.value = 'sun';
    }, { immediate: true });

    watch(farmState, (next) => emitDot('farmState', next), { deep: true });

    function cycleWeather() {
      weather.value = weatherCycle[(weatherCycle.indexOf(weather.value) + 1) % weatherCycle.length];
    }

    function chooseSeason(index) {
      seasonIndex.value = index;
      if (seasons[index].id === 'spring' || seasons[index].id === 'summer') {
        plots.forEach((plot) => { plot.growth = Math.min(8, plot.growth + 1); });
      }
      if (seasons[index].id === 'winter') {
        plots.forEach((plot) => { plot.growth = Math.max(2, plot.growth - 1); });
      }
    }

    function tendPlot(index) {
      const plot = plots[index];
      if (plot.growth >= 8) {
        emitDot('harvest', { pasture: plot.name, yield: plot.growth * 3, season: season.value.id });
        plot.growth = 2;
      } else {
        plot.growth += weather.value === 'rain' ? 2 : 1;
        plot.growth = Math.min(8, plot.growth);
      }
    }

    function welcomeAnimal(animal) {
      animal.count = Math.min(12, animal.count + 1);
    }

    onMounted(() => emitDot('farmState', farmState.value));

    return {
      animals,
      balance,
      balanceHint,
      chooseSeason,
      cycleWeather,
      farmState,
      plots,
      season,
      seasonIndex,
      seasons,
      tendPlot,
      title,
      weather,
      weatherGlyph,
      welcomeAnimal,
    };
  },
};
<\/script>

<style>
.farm-instrument {
  --cream: #fff8dc;
  --leaf: #75d078;
  --sunlight: #ffd27a;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: clamp(7px, 2vh, 13px);
  width: 100%;
  height: 100vh;
  min-height: 260px;
  padding: clamp(12px, 3.6vw, 22px);
  overflow: hidden;
  color: var(--cream);
  background: #10170f;
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
}
.world-header { z-index: 3; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.eyebrow { color: rgba(255,248,220,.55); font-size: 9px; font-weight: 850; letter-spacing: .16em; text-transform: uppercase; }
h3 { max-width: 28ch; margin: 2px 0 0; overflow: hidden; font-size: clamp(15px, 4.8vw, 25px); line-height: 1.05; letter-spacing: -.035em; text-overflow: ellipsis; white-space: nowrap; }
.balance-seal { display: grid; width: 46px; aspect-ratio: 1; flex: 0 0 auto; place-content: center; border: 1px solid rgba(255,255,255,.16); border-radius: 50%; background: conic-gradient(var(--leaf) var(--balance), rgba(255,255,255,.08) 0); text-align: center; box-shadow: inset 0 0 0 5px #172016; }
.balance-seal strong { font-size: 13px; line-height: 1; }
.balance-seal small { margin-top: 2px; color: rgba(255,248,220,.58); font-size: 6px; letter-spacing: .08em; text-transform: uppercase; }
.world { position: relative; min-height: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.12); border-radius: clamp(20px, 7vw, 38px); isolation: isolate; background: linear-gradient(#8ed0c1 0 48%, #70a960 49% 100%); box-shadow: inset 0 -50px 80px rgba(24,53,24,.3); transition: background .7s ease; }
.season-summer .world { background: linear-gradient(#76c9cc 0 46%, #80ad53 47% 100%); }
.season-autumn .world { background: linear-gradient(#9eb6b1 0 46%, #a77841 47% 100%); }
.season-winter .world { background: linear-gradient(#b8c9cf 0 46%, #a8b3a8 47% 100%); }
.weather-rain .world { filter: saturate(.72) brightness(.86); }
.weather-wind .world { filter: saturate(.86); }
.hills { position: absolute; right: -5%; bottom: 30%; left: -5%; height: 45%; border-radius: 50% 58% 0 0; background: linear-gradient(140deg, #4d8b56, #315e3d); }
.sky-control { position: absolute; z-index: 5; top: 9px; right: 10px; display: grid; width: clamp(46px, 13vw, 61px); aspect-ratio: 1; min-height: 0; padding: 2px; place-content: center; border: 1px solid rgba(255,255,255,.35); border-radius: 50%; color: #463714; background: radial-gradient(circle at 35% 30%, #fff5bd, var(--sunlight)); box-shadow: 0 0 28px rgba(255,214,121,.4); cursor: pointer; }
.sky-control span { font-size: clamp(19px, 6vw, 29px); line-height: .8; }
.sky-control small { font-size: 6px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.weather-rain .sky-control { color: #e8f4f4; background: #456a73; box-shadow: 0 0 28px rgba(90,141,158,.45); }
.weather-wind .sky-control { color: #244a46; background: #c8e1d1; }
.cloud { position: absolute; z-index: 1; width: 42px; height: 12px; border-radius: 99px; background: rgba(255,255,255,.52); filter: blur(.2px); animation: drift 11s linear infinite alternate; }
.cloud::before, .cloud::after { position: absolute; bottom: 2px; width: 16px; aspect-ratio: 1; border-radius: 50%; background: inherit; content: ""; }
.cloud::before { left: 7px; } .cloud::after { right: 5px; width: 21px; }
.cloud-one { top: 18%; left: 12%; }.cloud-two { top: 31%; left: 47%; scale: .7; animation-delay: -5s; }
.pastures { position: absolute; z-index: 3; right: 65px; bottom: 6%; left: 5%; display: grid; height: 42%; grid-template-columns: repeat(3, 1fr); gap: clamp(4px, 1.7vw, 9px); }
.plot { position: relative; display: grid; min-width: 0; min-height: 0; padding: 5px; overflow: hidden; place-content: end center; border: 1px solid rgba(255,248,220,.21); border-radius: 48% 52% 42% 58% / 45% 48% 52% 55%; color: rgba(255,248,220,.75); background: repeating-linear-gradient(100deg, #456d35 0 7px, #385e30 8px 14px); cursor: pointer; transition: transform .25s ease, filter .25s ease; }
.plot:hover { z-index: 2; filter: brightness(1.14); transform: scale(1.04); }
.plot:active { transform: scale(.96); }
.plot small { z-index: 2; overflow: hidden; font-size: 7px; font-weight: 850; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
.crop-row { position: absolute; right: 4px; bottom: 12px; left: 4px; display: flex; height: 70%; align-items: end; justify-content: space-evenly; }
.crop-row i { width: clamp(2px, .9vw, 4px); height: calc(18% + var(--crop) * 7%); max-height: 95%; border-radius: 99px 99px 0 0; background: #b9dd6c; box-shadow: 0 0 7px rgba(185,221,108,.2); transform: rotate(calc((var(--crop) - 4) * 1deg)); transform-origin: bottom; }
.barn { position: absolute; z-index: 2; right: 14%; bottom: 28%; width: clamp(37px, 12vw, 58px); height: clamp(29px, 9vw, 44px); background: #a54e3f; box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
.barn::before { position: absolute; top: -45%; left: -10%; width: 120%; height: 55%; background: #5d382b; clip-path: polygon(50% 0,100% 100%,0 100%); content: ""; }
.barn i { position: absolute; bottom: 0; left: 38%; width: 26%; height: 60%; background: #462f27; }.barn b { position: absolute; top: 18%; left: 13%; width: 13%; aspect-ratio: 1; background: #ffd888; }
.animal-rail { position: absolute; z-index: 6; right: 7px; bottom: 7px; display: grid; gap: 5px; }
.animal { position: relative; display: grid; width: clamp(38px, 11vw, 48px); aspect-ratio: 1; min-height: 0; padding: 0; place-content: center; border: 1px solid rgba(255,255,255,.28); border-radius: 50%; background: rgba(21,33,19,.72); box-shadow: 0 5px 18px rgba(0,0,0,.2); cursor: pointer; backdrop-filter: blur(8px); transition: transform .22s ease; }
.animal:hover { transform: translateX(-3px) scale(1.05); }
.animal span { font-size: clamp(17px, 5.5vw, 25px); line-height: 1; }
.animal b { position: absolute; right: -2px; bottom: -1px; display: grid; width: 16px; aspect-ratio: 1; place-content: center; border-radius: 50%; color: #18301a; background: var(--leaf); font-size: 8px; }
.world-controls { display: grid; grid-template-columns: minmax(150px, 1fr) minmax(105px, .7fr); gap: 10px; align-items: center; }
.season-cycle { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.season-cycle button { display: grid; min-width: 0; min-height: 32px; padding: 3px; place-items: center; border: 1px solid transparent; border-radius: 12px; color: rgba(255,248,220,.52); background: rgba(255,255,255,.045); cursor: pointer; }
.season-cycle button.active { border-color: rgba(255,248,220,.22); color: var(--cream); background: rgba(117,208,120,.14); }
.season-cycle span { font-size: 13px; line-height: 1; }.season-cycle small { overflow: hidden; max-width: 100%; font-size: 6px; letter-spacing: .08em; text-overflow: ellipsis; text-transform: uppercase; }
.balance-bed { position: relative; height: 7px; border-radius: 99px; background: rgba(255,255,255,.08); }
.balance-bed i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #d9aa5e, var(--leaf)); box-shadow: 0 0 14px rgba(117,208,120,.24); transition: width .45s ease; }
.balance-bed small { position: absolute; top: 10px; right: 0; color: rgba(255,248,220,.52); font-size: 7px; letter-spacing: .06em; white-space: nowrap; }
@keyframes drift { to { transform: translateX(22px); } }
@media (max-height: 340px) {
  .farm-instrument { grid-template-columns: minmax(110px, .55fr) 1.45fr; grid-template-rows: 1fr auto; }
  .world-header { display: grid; align-content: start; }
  .world { grid-column: 2; grid-row: 1 / 3; }
  .world-controls { display: block; }
  .balance-bed { margin-top: 13px; }
  .balance-seal { width: 38px; }
}
@media (max-width: 380px) {
  .world-controls { grid-template-columns: 1fr; }
  .balance-bed { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
}
</style>`;return{raw:i,description:e,vue:i,tags:["component","vue","farm","ecosystem","simulation"],connections:["climate","farm state","harvest","ecosystem balance"],capabilities:["simulate","tend","connect"],summary:"Direct-manipulation farm world with living weather, seasons, pastures, animals, and ecosystem balance.",ports:{inputs:[{id:"climate",label:"climate",type:"text",mode:"state",purpose:"Changes the farm weather when connected climate text mentions sun, rain, wind, heat, or storms."}],outputs:[{id:"farmState",label:"farm state",type:"data",mode:"state",purpose:"Emits the current season, weather, ecosystem balance, animal populations, and pasture growth."},{id:"harvest",label:"harvest",type:"event",mode:"event",purpose:"Emits a harvest event when a mature pasture is touched."}]}}}function Kf(e,t=e){if(Uf(t))return Gf(e);if(Xf(t))return Yf(e);const n=Kn(e),s=`<template>
  <main class="growth-instrument">
    <header>
      <span class="eyebrow">living instrument</span>
      <h3>{{ title }}</h3>
    </header>

    <section class="habitat" :class="{ awake: count > seed }">
      <div class="orbit" aria-hidden="true">
        <i
          v-for="sprout in sprouts"
          :key="sprout"
          :style="{ '--i': sprout, '--total': sprouts.length }"
        ><b></b></i>
      </div>

      <button
        class="organism"
        type="button"
        :aria-label="'Grow to ' + (count + 1)"
        @click="increment"
      >
        <span class="rings" aria-hidden="true"></span>
        <strong>{{ count }}</strong>
        <small>touch to grow</small>
      </button>
    </section>

    <footer>
      <span>seed {{ seed }}</span>
      <span class="pulse"><i></i>{{ count === seed ? 'resting' : 'growing' }}</span>
      <button v-if="count !== seed" class="reset" type="button" @click="reset">return to seed</button>
    </footer>
  </main>
</template>

<script>
const { computed, onMounted, reactive, ref, watch } = Vue;

// Dot is injected by the canvas. These local defaults keep the component fully
// usable in a standalone preview and in snapshots created before Dot existed.
const fallbackInputs = reactive({ seed: 0 });
const dot = globalThis.Dot ?? { inputs: fallbackInputs, emit: () => {} };
const dotInputs = dot.inputs ?? fallbackInputs;
const emitDot = typeof dot.emit === 'function' ? dot.emit.bind(dot) : () => {};

export default {
  setup() {
    const title = ${JSON.stringify(n).replace(/</g,"\\u003c")};
    const seed = computed(() => {
      const next = Number(dotInputs.seed);
      return Number.isFinite(next) ? next : 0;
    });
    const count = ref(seed.value);
    const sprouts = computed(() => Array.from(
      { length: Math.max(4, Math.min(14, count.value + 4)) },
      (_, index) => index,
    ));

    watch(seed, (next) => {
      count.value = next;
      emitDot('count', count.value);
    });

    function increment() {
      count.value += 1;
      emitDot('count', count.value);
    }

    function reset() {
      count.value = seed.value;
      emitDot('count', count.value);
    }

    onMounted(() => emitDot('count', count.value));

    return { count, increment, reset, seed, sprouts, title };
  },
};
<\/script>

<style>
.growth-instrument {
  --cream: #fff8df;
  --moss: #9fea83;
  --sun: #ffc772;
  display: grid;
  grid-template-rows: auto minmax(180px, 1fr) auto;
  gap: clamp(10px, 3vw, 20px);
  min-height: 100vh;
  padding: clamp(16px, 5vw, 28px);
  overflow: hidden;
  color: var(--cream);
  background:
    radial-gradient(circle at 28% 8%, rgba(255, 199, 114, .2), transparent 29%),
    radial-gradient(circle at 72% 78%, rgba(117, 229, 112, .18), transparent 36%),
    #11170f;
  font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
}
header { position: relative; z-index: 2; }
h3 { max-width: 28ch; margin: 3px 0 0; font-size: clamp(17px, 5vw, 26px); line-height: 1.05; letter-spacing: -.03em; }
.eyebrow, footer { color: rgba(255, 248, 223, .56); font-size: 10px; font-weight: 760; letter-spacing: .14em; text-transform: uppercase; }
.habitat { position: relative; display: grid; min-height: 180px; place-items: center; isolation: isolate; }
.habitat::before {
  position: absolute;
  width: min(80vw, 270px);
  aspect-ratio: 1;
  border: 1px solid rgba(159, 234, 131, .16);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(159, 234, 131, .08), transparent 64%);
  content: "";
}
.orbit { position: absolute; width: min(57vw, 190px); aspect-ratio: 1; }
.orbit i {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: rotate(calc((360deg / var(--total)) * var(--i))) translateY(clamp(-86px, -25vw, -58px));
  transform-origin: 0 0;
}
.orbit b {
  display: block;
  width: clamp(5px, 2.3vw, 9px);
  aspect-ratio: 1;
  border-radius: 70% 20% 70% 20%;
  background: var(--moss);
  box-shadow: 0 0 16px rgba(159, 234, 131, .55);
  transform: rotate(calc((-360deg / var(--total)) * var(--i)));
  animation: breathe 3.6s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -130ms);
}
.organism {
  position: relative;
  z-index: 2;
  display: grid;
  width: clamp(92px, 31vw, 132px);
  aspect-ratio: 1;
  place-content: center;
  border: 1px solid rgba(255, 248, 223, .28);
  border-radius: 46% 54% 57% 43% / 52% 42% 58% 48%;
  color: #11170f;
  background: radial-gradient(circle at 38% 30%, #fff3ba, var(--sun) 42%, #8dcf68);
  box-shadow: 0 16px 48px rgba(0, 0, 0, .32), 0 0 50px rgba(159, 234, 131, .17);
  cursor: pointer;
  transition: transform .35s cubic-bezier(.2,.8,.2,1), border-radius .7s ease;
}
.organism:hover { transform: scale(1.045) rotate(-2deg); }
.organism:active { transform: scale(.95); }
.organism:focus-visible { outline: 3px solid var(--cream); outline-offset: 5px; }
.organism strong { position: relative; font-size: clamp(31px, 11vw, 50px); line-height: .9; }
.organism small { position: relative; margin-top: 8px; font-size: 9px; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }
.rings { position: absolute; inset: 9px; border: 1px solid rgba(17, 23, 15, .13); border-radius: inherit; }
.awake .organism { border-radius: 58% 42% 44% 56% / 41% 53% 47% 59%; }
footer { z-index: 2; display: flex; min-height: 24px; align-items: center; gap: 12px; }
.pulse { display: inline-flex; align-items: center; gap: 5px; }
.pulse i { width: 6px; aspect-ratio: 1; border-radius: 50%; background: var(--moss); box-shadow: 0 0 8px var(--moss); }
.reset { margin-left: auto; padding: 6px 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px; color: inherit; background: rgba(255,255,255,.05); font-size: 10px; letter-spacing: .06em; cursor: pointer; }
@keyframes breathe { to { opacity: .45; transform: scale(.68) rotate(calc((-360deg / var(--total)) * var(--i))); } }
@media (max-height: 340px) {
  .growth-instrument { grid-template-columns: .8fr 1.2fr; grid-template-rows: 1fr auto; align-items: center; }
  .habitat { grid-row: 1 / 3; grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
}
</style>`;return{raw:s,description:e,vue:s,tags:["component","vue"],connections:["seed","count","growth"],capabilities:["render","interact","connect"],summary:"Graphical growth instrument with a live seed input and count output.",ports:{inputs:[{id:"seed",label:"seed",type:"data",mode:"state",purpose:"Sets the counter to a connected numeric starting value."}],outputs:[{id:"count",label:"count",type:"data",mode:"state",purpose:"Emits the current count whenever the user grows it."}]}}}function Jf(e,t,n){const i=Wf(e,n??t?.kind??"unknown"),s=Kn(t?`${t.title} · ${e}`:e);if(i==="text"){const l=t?`### ${t.title}

${e}

This is the next written version of the artifact. The real generator will preserve intent, voice, and structure.`:`### ${s}

${e}

This is a structured text artifact placeholder.`;return{kind:i,title:s,purpose:"Readable generated content.",summary:"Text artifact with markdown preview.",content:{raw:l,markdown:l,tags:["text"],connections:["source","reference","output"],capabilities:["summarise","rewrite","connect"],summary:"Text artifact with markdown preview.",ports:{inputs:[{id:"source",label:"source",type:"text",mode:"resource",purpose:"Source text or instructions."}],outputs:[{id:"text",label:"text",type:"text",mode:"resource",purpose:"Generated written output."}]}}}}if(i==="component"){const l=t?`${t.title} ${t.prompt} ${e}`:e;return{kind:i,title:s,purpose:"Interactive generated component.",summary:"Sandboxed Vue component.",content:Kf(s,l)}}return i==="object"?{kind:i,title:s,purpose:"Semantic canvas object.",summary:"Universal object shell.",content:qf(e)}:i==="image"?{kind:i,title:s,purpose:"Image generation specification.",summary:"Image artifact placeholder.",content:{raw:`Image prompt: ${e}`,description:e,imagePrompt:e,alt:`Generated image placeholder for: ${e}`,tags:["visual"],connections:["reference","style","output"],capabilities:["describe","vary","connect"],summary:"Image artifact placeholder.",ports:{inputs:[{id:"style",label:"style",type:"text",mode:"resource",purpose:"Visual style or reference."}],outputs:[{id:"image",label:"image",type:"image",mode:"resource",purpose:"Generated image output."}]}}}:i==="video"?{kind:i,title:s,purpose:"Video generation specification.",summary:"Video artifact placeholder with storyboard beats.",content:{raw:`Video prompt: ${e}`,description:e,tags:["motion"],connections:["scene","timing","audio","output"],capabilities:["storyboard","vary","connect"],storyboard:["Opening frame","Main motion","End frame"],summary:"Video artifact placeholder with storyboard beats.",ports:{inputs:[{id:"script",label:"script",type:"text",mode:"resource",purpose:"Scene or script input."}],outputs:[{id:"video",label:"video",type:"video",mode:"resource",purpose:"Generated video output."}]}}}:{kind:i,title:s,purpose:"Unclassified generated object.",summary:"Unknown artifact type. This will later be resolved by the model router.",content:{raw:e,tags:["unclassified"],connections:["source","meaning","output"],capabilities:["classify","transform","connect"],summary:"Unknown artifact type. This will later be resolved by the model router.",ports:Ur()}}}function wa(e,t,n,i){const s=e.content??{raw:t},l=e.ports??s.ports??Ur(),u=e.summary??s.summary??s.description??s.raw,d=e.purpose??s.purpose??u;return{id:crypto.randomUUID(),kind:e.kind,title:Kn(e.title||t),prompt:t,x:n.x,y:n.y,width:ii,height:Ir,createdAt:ri(),content:{...s,raw:s.raw||s.markdown||s.description||s.text||u||t,description:s.description||u,summary:u,purpose:d,ports:l,capabilities:s.capabilities??["inspect","prompt","fork","connect"],connections:s.connections??[...l.inputs.map(p=>p.label),...l.outputs.map(p=>p.label)].slice(0,6),tags:s.tags??[e.kind]},parentId:i}}function Kl(e,t){return e.filter(n=>n.parentId===t)}function Zf(e,t){return t.parentId?e.find(n=>n.id===t.parentId)??null:null}function Qf(e,t){return t.height+(Kl(e,t.id).length?Bf:0)}function em(e,t,n){let i=e.find(s=>s.id===t);for(;i?.parentId;){if(i.parentId===n)return!0;i=e.find(s=>s.id===i?.parentId)}return!1}function tm(e,t,n,i){return n.id!==i.id&&!n.parentId&&!i.parentId&&!t.includes(n.id)&&!t.includes(i.id)&&!em(e,i.id,n.id)}const nm="/assets/vue.global.prod-ByMCnqtn.js";class Se extends Error{constructor(t){super(t),this.name="VueSfcValidationError"}}function xa(e,t,n){return`${e.slice(0,t)}${e.slice(t,n).replace(/[^\r\n]/g," ")}${e.slice(n)}`}function Ia(e,t){const n=new RegExp(`<${t}\\b([^>]*)>`,"gi"),i=new RegExp(`</${t}\\s*>`,"gi"),s=[];let l;for(;l=n.exec(e);){i.lastIndex=n.lastIndex;const u=i.exec(e);if(!u)throw new Se(`The <${t}> block is missing its closing </${t}> tag.`);s.push({attributes:l[1]??"",content:e.slice(n.lastIndex,u.index),start:l.index,end:i.lastIndex}),n.lastIndex=i.lastIndex}return s}function om(e){const t=/<\/?template\b[^>]*>/gi,n=[];let i=0,s=-1,l=-1,u="",d;for(;d=t.exec(e);){if(/^<\//.test(d[0])){if(i===0)throw new Se("Found a closing </template> tag without a matching opening tag.");i-=1,i===0&&n.push({attributes:u,content:e.slice(l,d.index),start:s,end:t.lastIndex});continue}i===0&&(s=d.index,l=t.lastIndex,u=d[0].replace(/^<template\b/i,"").replace(/>$/,"")),i+=1}if(i!==0)throw new Se("The <template> block is missing its closing </template> tag.");return n}function im(e){let t="",n="code";for(let i=0;i<e.length;i+=1){const s=e[i],l=e[i+1],u=s===`
`||s==="\r";if(n==="code"){s==="/"&&l==="/"?(t+="  ",n="line-comment",i+=1):s==="/"&&l==="*"?(t+="  ",n="block-comment",i+=1):s==="'"?(t+=" ",n="single"):s==='"'?(t+=" ",n="double"):s==="`"?(t+=" ",n="template"):t+=s;continue}if(u){t+=s,n==="line-comment"&&(n="code");continue}t+=" ",s==="\\"&&(n==="single"||n==="double"||n==="template")?i+1<e.length&&(t+=e[i+1]===`
`||e[i+1]==="\r"?e[i+1]:" ",i+=1):n==="single"&&s==="'"||n==="double"&&s==='"'||n==="template"&&s==="`"?n="code":n==="block-comment"&&s==="*"&&l==="/"&&(t+=" ",n="code",i+=1)}return t}function Jl(e){if(!e.trim())throw new Se("The <script> block must contain a component definition.");const t=im(e);if(/^\s*import(?:\s|["'{*])|\bimport\s*(?:\(|\.)/m.test(t))throw new Se("Imports are not supported in generated components. Use the global Vue object and inline data instead.");if(/\b(?:interface|enum|namespace|declare)\s+[A-Za-z_$]/.test(t)||/(?:^|[;\n])\s*type\s+[A-Za-z_$][\w$]*\s*=/.test(t)||/\b(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*[?!]?\s*:\s*[A-Za-z_$]/.test(t)||/\bfunction\b[^(\n]*\([^)\n]*\b[A-Za-z_$][\w$]*\??\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b[^)\n]*\)/.test(t)||/\([^)\n]*\b[A-Za-z_$][\w$]*\??\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b[^)\n]*\)\s*(?::\s*[^=]+)?=>/.test(t)||/\)\s*:\s*(?:string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b\s*(?:=>|\{)/.test(t)||/\s+as\s+(?:const|string|number|boolean|unknown|any|never|void|object|[A-Z][\w$]*)\b/.test(t))throw new Se("TypeScript syntax is not supported in generated components. Return plain JavaScript.");const n=[...t.matchAll(/\bexport\s+default\b/g)];if(n.length!==1)throw new Se(`The <script> block must contain exactly one export default component definition (found ${n.length}).`);if([...t.matchAll(/\bexport\b/g)].length!==1)throw new Se("Named exports are not supported. The plain <script> block may only use one export default.");return n[0]}function rm(e){if(typeof e!="string"||!e.trim())throw new Se("The generated Vue component is empty.");const t=e.replace(/<!--[\s\S]*?-->/g,h=>h.replace(/[^\r\n]/g," ")),n=Ia(t,"script");if(n.length!==1)throw new Se(`A generated component needs exactly one plain <script> block (found ${n.length}).`);const i=n[0].attributes.trim();if(/\bsetup\b/i.test(i))throw new Se("<script setup> is not supported. Use one plain <script> with export default.");if(/\bsrc\s*=/i.test(i))throw new Se("External script sources are not supported in generated components.");if(/\blang\s*=\s*["']?(?:ts|tsx)\b/i.test(i))throw new Se("TypeScript is not supported. Use a plain JavaScript <script> block.");if(i)throw new Se("Use a plain <script> block without attributes.");const s=xa(t,n[0].start,n[0].end),l=om(s);if(l.length!==1)throw new Se(`A generated component needs exactly one root <template> block (found ${l.length}).`);if(l[0].attributes.trim())throw new Se("The root <template> block must not have attributes.");if(!l[0].content.trim())throw new Se("The root <template> block must contain visible component markup.");const u=Ia(s,"style");if(u.length>1)throw new Se(`A generated component may contain at most one plain <style> block (found ${u.length}).`);if(u[0]?.attributes.trim())throw new Se("Use a plain optional <style> block without scoped, module, lang, src, or other attributes.");const d=[l[0],n[0],...u].sort((h,b)=>h.start-b.start);for(let h=1;h<d.length;h+=1)if(d[h].start<d[h-1].end)throw new Se("The root <template>, <script>, and optional <style> blocks must be siblings and cannot be nested.");let p=t;if(d.forEach(h=>{p=xa(p,h.start,h.end)}),p.trim()){const h=p.trim().replace(/\s+/g," ").slice(0,80);throw new Se(`Only one root <template>, one plain <script>, and one optional plain <style> block are supported. Remove: ${h}`)}const v=e.slice(n[0].start+e.slice(n[0].start,n[0].end).indexOf(">")+1,n[0].end-e.slice(n[0].start,n[0].end).match(/<\/script\s*>$/i)[0].length).trim();return Jl(v),{template:l[0].content.trim(),script:v,style:u.map(h=>h.content.trim()).filter(Boolean).join(`
`)}}function sm(e){const t=Jl(e),n=t.index??0,i=n+t[0].length;return`${e.slice(0,n)}const __component__ =${e.slice(i)}`}const xo="dot-component-bridge",Io=1;function _r(e){return e.replace(/<\/script/gi,"<\\/script").replace(/<\/style/gi,"<\\/style")}function hi(e){return JSON.stringify(e).replace(/</g,"\\u003c")}const Gr=`
    :root {
      color-scheme: dark;
      font-family: Inter, ui-rounded, "SF Pro Rounded", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      --dot-frame-ink: #f7f3e8;
      --dot-frame-muted: rgba(247, 243, 232, .64);
      --dot-frame-surface: rgba(247, 243, 232, .08);
      --dot-frame-line: rgba(247, 243, 232, .16);
      --dot-frame-focus: #baf2a8;
    }
    html, body { width: 100%; min-height: 100%; margin: 0; background: transparent; }
    body {
      overflow-x: hidden;
      color: var(--dot-frame-ink);
      line-height: 1.4;
      scrollbar-color: rgba(247, 243, 232, .38) transparent;
    }
    #app { width: 100%; min-height: 100vh; }
    *, *::before, *::after { box-sizing: border-box; }
    :where(button, input, select, textarea) {
      max-width: 100%;
      margin: 0;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
    }
    :where(button) {
      min-height: 38px;
      padding: .58em .9em;
      border: 1px solid var(--dot-frame-line);
      border-radius: 999px;
      background: var(--dot-frame-surface);
    }
    :where(button:not(:disabled), input[type="range"], select) { cursor: pointer; }
    :where(input:not([type="range"]), select, textarea) {
      min-height: 40px;
      padding: .62em .76em;
      border: 1px solid var(--dot-frame-line);
      border-radius: 12px;
      background: rgba(8, 11, 8, .62);
    }
    :where(textarea) { resize: vertical; }
    :where(button, input, select, textarea):focus-visible {
      outline: 2px solid var(--dot-frame-focus);
      outline-offset: 3px;
    }
    :where(button, input, select, textarea):disabled { cursor: not-allowed; opacity: .48; }
    :where(img, svg, canvas, video) { max-width: 100%; }
    ::selection { color: #10140f; background: #c9f7b9; }
    ::-webkit-scrollbar { width: 11px; height: 11px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      border-radius: 999px;
      background: rgba(247, 243, 232, .38);
      background-clip: padding-box;
    }
  `,Xr=`(function installDotRuntime() {
      'use strict';

      const PROTOCOL = ${hi(xo)};
      const VERSION = ${Io};
      let componentFailed = false;
      const rawInputs = Object.create(null);
      const reactiveInputs = window.Vue && typeof window.Vue.reactive === 'function'
        ? window.Vue.reactive(rawInputs)
        : rawInputs;
      const publicInputs = window.Vue && typeof window.Vue.readonly === 'function'
        ? window.Vue.readonly(reactiveInputs)
        : reactiveInputs;
      const pending = [];
      let activePort = null;
      let lastRevision = -1;
      let lastWidth = -1;
      let lastHeight = -1;
      let resizeFrame = 0;
      let componentReady = false;

      Object.defineProperty(window, '__DOT_COMPONENT_FAILED__', {
        configurable: false,
        enumerable: false,
        get: () => componentFailed,
      });

      function packet(type, fields) {
        return Object.assign({ protocol: PROTOCOL, version: VERSION, type: type }, fields || {});
      }

      function enqueue(message) {
        if (message.type === 'dot:resize' || message.type === 'dot:ready') {
          const existing = pending.findIndex((item) => item.type === message.type);
          if (existing >= 0) pending.splice(existing, 1);
        }
        pending.push(message);
        if (pending.length > 128) pending.splice(0, pending.length - 128);
      }

      function send(message) {
        if (!activePort) {
          enqueue(message);
          return true;
        }
        try {
          activePort.postMessage(message);
          return true;
        } catch (error) {
          return false;
        }
      }

      function reportError(error, phase) {
        componentFailed = true;
        componentReady = false;
        for (let index = pending.length - 1; index >= 0; index -= 1) {
          if (pending[index].type === 'dot:ready') pending.splice(index, 1);
        }
        const message = String(error && error.message || error || 'Unknown component error').slice(0, 4000);
        const stack = error && typeof error.stack === 'string' ? error.stack.slice(0, 12000) : undefined;
        send(packet('dot:error', { message: message, phase: phase || undefined, stack: stack }));
      }

      function validRevision(revision) {
        if (!Number.isFinite(revision)) return true;
        if (revision < lastRevision) return false;
        lastRevision = revision;
        return true;
      }

      function notifyInputs(portId) {
        window.dispatchEvent(new CustomEvent('dot:inputs', {
          detail: { inputs: publicInputs, portId: portId, revision: lastRevision },
        }));
      }

      function replaceInputs(nextInputs, revision) {
        if (!nextInputs || typeof nextInputs !== 'object' || Array.isArray(nextInputs) || !validRevision(revision)) return;
        Object.keys(reactiveInputs).forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(nextInputs, key)) delete reactiveInputs[key];
        });
        Object.keys(nextInputs).forEach((key) => {
          reactiveInputs[key] = nextInputs[key];
        });
        notifyInputs();
      }

      function updateInput(portId, value, unset, revision) {
        if (typeof portId !== 'string' || !portId.trim() || !validRevision(revision)) return;
        if (unset) delete reactiveInputs[portId];
        else reactiveInputs[portId] = value;
        notifyInputs(portId);
      }

      function receive(event) {
        const message = event && event.data;
        if (!message || message.protocol !== PROTOCOL || message.version !== VERSION) return;
        if (message.type === 'dot:inputs') replaceInputs(message.inputs, message.revision);
        if (message.type === 'dot:input') updateInput(message.portId, message.value, message.unset, message.revision);
      }

      function connect(port, initialInputs, revision) {
        if (!port || typeof port.postMessage !== 'function') return;
        if (activePort && activePort !== port) activePort.close();
        activePort = port;
        activePort.onmessage = receive;
        activePort.onmessageerror = () => reportError('The host sent an unreadable input packet.', 'bridge');
        if (typeof activePort.start === 'function') activePort.start();
        if (initialInputs !== undefined) replaceInputs(initialInputs, revision);

        const queued = pending.splice(0);
        queued.forEach((message) => send(message));
        if (componentReady && !queued.some((message) => message.type === 'dot:ready')) {
          send(packet('dot:ready', { capabilities: ['inputs', 'outputs', 'resize', 'errors'] }));
        }
        scheduleResize();
      }

      function requestBridge() {
        if (activePort || window.parent === window) return;
        window.parent.postMessage({
          source: 'dot-component',
          protocol: PROTOCOL,
          type: 'dot:bridge-request',
          version: VERSION,
        }, '*');
      }

      function cloneOutput(value) {
        const unwrapped = window.Vue && typeof window.Vue.toRaw === 'function' ? window.Vue.toRaw(value) : value;
        return typeof structuredClone === 'function' ? structuredClone(unwrapped) : unwrapped;
      }

      function emit(portId, value) {
        if (typeof portId !== 'string' || !portId.trim()) {
          reportError('Dot.emit(portId, value) requires a non-empty port id.', 'emit');
          return false;
        }
        try {
          const emitted = send(packet('dot:emit', { portId: portId, value: cloneOutput(value) }));
          if (!emitted) reportError('The output could not be delivered to the host.', 'emit:' + portId);
          return emitted;
        } catch (error) {
          reportError(error, 'emit:' + portId);
          return false;
        }
      }

      function measure() {
        resizeFrame = 0;
        const root = document.documentElement;
        const body = document.body;
        if (!root || !body) return;
        const width = Math.ceil(Math.max(root.scrollWidth, body.scrollWidth, root.getBoundingClientRect().width, body.getBoundingClientRect().width));
        const height = Math.ceil(Math.max(root.scrollHeight, body.scrollHeight, root.getBoundingClientRect().height, body.getBoundingClientRect().height));
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        send(packet('dot:resize', { width: width, height: height }));
      }

      function scheduleResize() {
        if (resizeFrame) return;
        resizeFrame = requestAnimationFrame(measure);
      }

      function observeSize() {
        scheduleResize();
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(scheduleResize);
          observer.observe(document.documentElement);
          if (document.body) observer.observe(document.body);
        } else {
          window.addEventListener('resize', scheduleResize);
        }
      }

      function ready() {
        if (componentFailed) return false;
        componentReady = true;
        send(packet('dot:ready', { capabilities: ['inputs', 'outputs', 'resize', 'errors'] }));
        requestBridge();
        scheduleResize();
        return true;
      }

      const api = {};
      Object.defineProperties(api, {
        inputs: { enumerable: true, value: publicInputs },
        emit: { enumerable: true, value: emit },
        connected: { enumerable: true, get: () => Boolean(activePort) },
        revision: { enumerable: true, get: () => lastRevision },
        version: { enumerable: true, value: VERSION },
      });
      Object.freeze(api);
      Object.defineProperty(window, 'Dot', { configurable: false, enumerable: true, value: api, writable: false });

      Object.defineProperty(window, '__DOT_COMPONENT_RUNTIME__', {
        configurable: false,
        value: Object.freeze({
          ready: ready,
          reportError: reportError,
          scheduleResize: scheduleResize,
          hasFailed: () => componentFailed,
        }),
        writable: false,
      });

      window.addEventListener('message', (event) => {
        const message = event.data;
        if (
          event.source !== window.parent ||
          !message ||
          message.source !== 'dot-host' ||
          message.protocol !== PROTOCOL ||
          message.type !== 'dot:bridge-connect' ||
          message.version !== VERSION
        ) return;
        connect(event.ports && event.ports[0], message.inputs, message.revision);
      });
      window.addEventListener('error', (event) => reportError(event.error || event.message, 'runtime'));
      window.addEventListener('unhandledrejection', (event) => reportError(event.reason, 'promise'));
      window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        queueMicrotask(() => {
          if (!event.defaultPrevented) send(packet('dot:close-request'));
        });
      });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeSize, { once: true });
      else observeSize();
      window.addEventListener('load', () => setTimeout(requestBridge, 0), { once: true });
      requestBridge();
    })();`,Yr=`function __reportError(error, phase) {
      window.__DOT_COMPONENT_RUNTIME__.reportError(error, phase);
      let errorEl = document.getElementById('dot-component-error');
      if (!errorEl) {
        errorEl = document.createElement('pre');
        errorEl.id = 'dot-component-error';
        errorEl.setAttribute('role', 'alert');
        errorEl.style.cssText = 'white-space:pre-wrap;color:#ffb4a8;background:rgba(0,0,0,.35);padding:10px;border-radius:12px;font:12px ui-monospace,monospace;';
        (document.body || document.documentElement).appendChild(errorEl);
      }
      errorEl.textContent = 'Component error: ' + String(error && error.message || error);
    }`,Zl=`function __isVisiblyLaidOut(element) {
      if (!element || !(element instanceof Element)) return false;
      let current = element;
      while (current && current instanceof Element) {
        const style = getComputedStyle(current);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.visibility === 'collapse' ||
          Number(style.opacity) <= 0.01
        ) return false;
        current = current.parentElement;
      }
      const rect = element.getBoundingClientRect();
      return (
        Number.isFinite(rect.width) &&
        Number.isFinite(rect.height) &&
        rect.width >= 4 &&
        rect.height >= 4 &&
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.top < window.innerHeight
      );
    }

    function __hasMeaningfulContent(root) {
      if (!root || window.__DOT_COMPONENT_RUNTIME__.hasFailed()) return false;
      const visibleElements = Array.from(root.querySelectorAll('*')).filter(__isVisiblyLaidOut);
      if (!visibleElements.length) return false;

      const visualSelector = [
        'button', 'input', 'select', 'textarea', 'a[href]', 'summary',
        '[role="button"]', '[role="slider"]', '[role="option"]', '[tabindex]',
        'svg', 'canvas', 'img', 'picture', 'video', 'audio', 'meter', 'progress',
      ].join(',');
      if (
        Array.from(root.querySelectorAll(visualSelector)).some((element) => __isVisiblyLaidOut(element))
      ) return true;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let visibleText = '';
      let node;
      while ((node = walker.nextNode())) {
        const text = String(node.textContent || '').replace(/\\s+/g, ' ').trim();
        const parent = node.parentElement;
        if (!text || !parent || !__isVisiblyLaidOut(parent)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) visibleText += ' ' + text;
        if (visibleText.trim().length >= 8) return true;
      }
      return false;
    }

    function __readyWhenMeaningful(root, phase) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        try {
          if (window.__DOT_COMPONENT_RUNTIME__.hasFailed()) return;
          if (!__hasMeaningfulContent(root)) {
            __reportError(
              new Error('The component rendered no visible interactive, visual, or textual content.'),
              phase + ':render',
            );
            return;
          }
          window.__DOT_COMPONENT_RUNTIME__.ready();
        } catch (error) {
          __reportError(error, phase + ':render');
        }
      }));
    }`;function am(e){const t=e.html||'<div class="empty">No component HTML generated.</div>',n=e.css||"",i=e.js||"";return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:;" />
  <style>
    ${Gr}
    ${_r(n)}
  </style>
  <script>
    ${Xr}
    ${Yr}
    ${Zl}
  <\/script>
</head>
<body>
  ${t}
  <script>
    try {
      ${_r(i)}
      __readyWhenMeaningful(document.body, 'legacy');
    } catch (error) {
      __reportError(error, 'legacy');
    }
  <\/script>
</body>
</html>`}function lm(e){const{template:t,script:n,style:i}=rm(e),s=window.location.origin,l=new URL(nm,s).href;return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- 'unsafe-eval' is required by Vue's runtime template compiler; the sandbox plus connect-src 'none' remains the security boundary. -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval' ${s}; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:;" />
  <style>
    ${Gr}
  </style>
  <script src="${l}"><\/script>
  <script>
    ${Xr}
    ${Yr}
    ${Zl}
  <\/script>
</head>
<body>
  <div id="app"></div>
  <script>
    try {
      const __style__ = ${hi(i)};
      if (__style__) {
        const styleEl = document.createElement('style');
        styleEl.textContent = __style__;
        document.head.appendChild(styleEl);
      }

      ${_r(sm(n))}

      const __definition__ = Object.assign({}, __component__, { template: ${hi(t)} });
      const app = Vue.createApp(__definition__);
      app.config.errorHandler = (error, _instance, info) => __reportError(error, 'vue:' + info);
      app.mount('#app');
      Vue.nextTick(() => __readyWhenMeaningful(document.getElementById('app'), 'vue'));
    } catch (error) {
      __reportError(error, 'vue:mount');
    }
  <\/script>
</body>
</html>`}function cm(e){const t=e instanceof Error?e.message:String(e||"The generated component could not be parsed.");return`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; media-src data: blob:;" />
  <style>
    ${Gr}
  </style>
  <script>
    ${Xr}
    ${Yr}
  <\/script>
</head>
<body>
  <div id="app"></div>
  <script>
    __reportError(new Error(${hi(t)}), 'vue:validation');
  <\/script>
</body>
</html>`}function um(e){if(e.vue?.trim())try{return lm(e.vue)}catch(t){return cm(t)}return am(e)}function dm(e){return[...document.querySelectorAll("iframe[data-dot-artifact-id]")].find(t=>t.contentWindow===e)}function pm(e){if(!e||typeof e!="object")return!1;const t=e;return t.source==="dot-component"&&t.protocol===xo&&t.type==="dot:bridge-request"&&t.version===Io}function _a(e){try{return structuredClone(e)}catch{try{const t=JSON.stringify(e);return t===void 0?void 0:JSON.parse(t)}catch{return}}}function ka(e,t,n){const i=typeof e=="number"?e:Number.NaN;return Number.isFinite(i)?Math.min(n,Math.max(t,Math.ceil(i))):null}class fm{#t;#e=new Set;#n=t=>{if(!pm(t.data))return;const n=dm(t.source),i=n?.dataset.dotArtifactId;if(!n||!i||!t.source||typeof t.source!="object"||!("postMessage"in t.source))return;for(const p of this.#e)p.iframe===n&&(p.port.close(),this.#e.delete(p));const s=new MessageChannel,l={artifactId:i,iframe:n,port:s.port1};this.#e.add(l),s.port1.onmessage=p=>this.#o(l,p.data),s.port1.onmessageerror=()=>this.#t.onError?.(i,"The component sent an unreadable message."),s.port1.start();const{inputs:u,revision:d}=this.#t.getInputs(i);t.source.postMessage({source:"dot-host",protocol:xo,type:"dot:bridge-connect",version:Io,inputs:_a(u)??{},revision:d},{targetOrigin:"*",transfer:[s.port2]})};constructor(t){this.#t=t,window.addEventListener("message",this.#n)}sendInputs(t,n,i){const s=_a(n);if(s===void 0){this.#t.onError?.(t,"Connected inputs must be serializable.");return}for(const l of this.#e)l.artifactId!==t||!l.iframe.isConnected||l.port.postMessage({protocol:xo,type:"dot:inputs",version:Io,inputs:s,revision:i});this.#i()}disposeArtifact(t){for(const n of this.#e)n.artifactId===t&&(n.port.close(),this.#e.delete(n))}dispose(){window.removeEventListener("message",this.#n);for(const t of this.#e)t.port.close();this.#e.clear()}#o(t,n){if(!n||typeof n!="object")return;const i=n;if(!(i.protocol!==xo||i.version!==Io)){if(i.type==="dot:ready"){const{inputs:s,revision:l}=this.#t.getInputs(t.artifactId);this.sendInputs(t.artifactId,s,l),this.#t.onReady?.(t.artifactId);return}if(i.type==="dot:emit"&&typeof i.portId=="string"){this.#t.onEmit(t.artifactId,i.portId.slice(0,80),i.value);return}if(i.type==="dot:resize"){const s=ka(i.width,1,4096),l=ka(i.height,150,2400);if(s===null||l===null||t.iframe.closest(".artifact-card--running"))return;t.iframe.style.setProperty("--dot-component-content-width",`${s}px`),t.iframe.style.setProperty("--dot-component-content-height",`${l}px`),t.iframe.dataset.dotContentHeight=String(l);return}if(i.type==="dot:close-request"){this.#t.onCloseRequest?.(t.artifactId);return}i.type==="dot:error"&&this.#t.onError?.(t.artifactId,String(i.message||"Component runtime error").slice(0,500))}}#i(){for(const t of this.#e)t.iframe.isConnected||(t.port.close(),this.#e.delete(t))}}const mm=new Set(["source-port-missing","target-port-missing","source-not-output","target-not-input","incompatible-types"]);let Sa=0;function hm(e){return Sa+=1,`${e}-${Date.now().toString(36)}-${Sa.toString(36)}`}function Jo(e){return e instanceof Error?e:new Error(String(e))}function Pa(e,t){if(!Number.isInteger(e)||e<=0)throw new RangeError(`${t} must be a positive integer.`)}function rn(e){if(typeof e.artifactId!="string"||e.artifactId.trim().length===0||typeof e.portId!="string"||e.portId.trim().length===0)throw new TypeError("Port addresses require non-empty artifactId and portId strings.");return Object.freeze({artifactId:e.artifactId,portId:e.portId})}function Ee(e){return JSON.stringify([e.artifactId,e.portId])}function gm(e){const t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function kr(e,t){if(e===null||typeof e=="string"||typeof e=="boolean")return!0;if(typeof e=="number")return Number.isFinite(e);if(typeof e!="object"||t.has(e))return!1;t.add(e);let n=!0;return Array.isArray(e)?n=e.every(i=>kr(i,t)):gm(e)?n=Reflect.ownKeys(e).every(s=>typeof s=="string"&&Object.prototype.propertyIsEnumerable.call(e,s)&&kr(e[s],t)):n=!1,t.delete(e),n}function Ql(e){return kr(e,new WeakSet)}function Sr(e){if(Array.isArray(e)){const t=e.map(n=>Sr(n));return Object.freeze(t)}if(e!==null&&typeof e=="object"){const t=Object.create(null);for(const[n,i]of Object.entries(e))t[n]=Sr(i);return Object.freeze(t)}return e}function Ca(e){if(!Ql(e))throw new TypeError("Living packets only accept finite, acyclic JSON-like serializable values.");return Sr(e)}function ec(e,t){return e===t||e==="any"||t==="any"||e==="component"&&t==="data"}function vm(e,t){return t!=="text"||typeof e=="string"}function Ea(e){return Object.freeze(e)}class bm{maxHops;maxDeliveriesPerFlush;now;createId;schedule;onError;ports=new Map;connections=new Map;outgoing=new Map;incoming=new Map;inputSubscribers=new Map;stateSubscribers=new Set;deliveryQueue=[];settlingConnections=new Map;registrationSequence=0;version=0;batchDepth=0;dispatchScheduled=!1;notifyScheduled=!1;settleScheduled=!1;isDispatching=!1;activeTrace;constructor(t={}){this.maxHops=t.maxHops??32,this.maxDeliveriesPerFlush=t.maxDeliveriesPerFlush??1e3,Pa(this.maxHops,"maxHops"),Pa(this.maxDeliveriesPerFlush,"maxDeliveriesPerFlush"),this.now=t.now??Date.now,this.createId=t.createId??hm,this.schedule=t.schedule??(n=>queueMicrotask(n)),this.onError=t.onError}registerPort(t){const n=rn(t),i=Ee(n),s=this.ports.get(i),l=++this.registrationSequence,u=s?.definition.direction===t.direction&&s.definition.type===t.type;return this.ports.set(i,{definition:Object.freeze({...n,direction:t.direction,type:t.type,...t.validate?{validate:t.validate}:{}}),registration:l,revision:u?s.revision:0,...u&&s.lastPacket?{lastPacket:s.lastPacket}:{}}),this.refreshConnectionsForPort(i),this.touch(),()=>{this.ports.get(i)?.registration===l&&(this.ports.delete(i),this.refreshConnectionsForPort(i),this.touch())}}connect(t){if(t.id.trim().length===0)throw new TypeError("Connection ids must be non-empty strings.");if(this.connections.has(t.id))throw new Error(`Connection "${t.id}" already exists.`);const n={id:t.id,from:rn(t.from),to:rn(t.to),meaning:t.meaning?.trim()??"",policy:t.policy??"live",status:"resting",revision:0,activityToken:0};return this.connections.set(n.id,n),this.addToIndex(this.outgoing,Ee(n.from),n.id),this.addToIndex(this.incoming,Ee(n.to),n.id),this.applyStructuralStatus(n,!0),this.touch(),this.snapshotConnection(n)}updateConnection(t,n){const i=this.requireConnection(t),s=n.from!==void 0||n.to!==void 0;if(n.from!==void 0&&(this.removeFromIndex(this.outgoing,Ee(i.from),t),i.from=rn(n.from),this.addToIndex(this.outgoing,Ee(i.from),t)),n.to!==void 0&&(this.removeFromIndex(this.incoming,Ee(i.to),t),i.to=rn(n.to),this.addToIndex(this.incoming,Ee(i.to),t)),n.meaning!==void 0&&(i.meaning=n.meaning.trim()),n.policy!==void 0&&(i.policy=n.policy),s&&(i.pending=void 0),this.applyStructuralStatus(i,!0),i.policy!=="breathe"&&i.pending){const l=i.pending;i.pending=void 0,this.enqueue({...l,release:!0})}return this.touch(),this.snapshotConnection(i)}disconnect(t){const n=this.connections.get(t);return n?(this.connections.delete(t),this.removeFromIndex(this.outgoing,Ee(n.from),t),this.removeFromIndex(this.incoming,Ee(n.to),t),this.settlingConnections.delete(t),this.touch(),!0):!1}emit(t,n,i={}){const s=rn(t),l=this.ports.get(Ee(s));if(!l)throw new Error(`Cannot emit from missing port ${s.artifactId}:${s.portId}.`);if(l.definition.direction!=="output")throw new Error(`Cannot emit from input port ${s.artifactId}:${s.portId}.`);const u=Ca(n),d=this.valueValidationProblem(l.definition,u);if(d)throw new TypeError(d);const p=i.metadata===void 0?void 0:Ca(i.metadata),v=this.activeTrace,h=v?.flowId??this.createId("flow"),b=Object.freeze([...v?.path??[]]),P=l.revision+1,L=Ea({id:this.createId("packet"),flowId:h,...v?.parentPacketId?{parentPacketId:v.parentPacketId}:{},source:s,type:l.definition.type,value:u,...p===void 0?{}:{metadata:p},revision:P,emittedAt:this.now(),hops:b.length,path:b});return l.revision=P,l.lastPacket=L,this.enqueueOutgoing(L,{flowId:h,path:b,...v?.parentPacketId?{parentPacketId:v.parentPacketId}:{}}),this.touch(),L}breathe(t){const n=this.requireConnection(t);if(!n.pending)return!1;const i=n.pending;return n.pending=void 0,this.enqueue({...i,release:!0}),this.touch(),!0}breatheInto(t){const n=this.incoming.get(Ee(rn(t)));if(!n)return 0;let i=0;return this.batch(()=>{for(const s of n){const l=this.connections.get(s);if(!l?.pending)continue;const u=l.pending;l.pending=void 0,this.enqueue({...u,release:!0}),this.touch(),i+=1}}),i}subscribeInput(t,n){const i=Ee(rn(t));let s=this.inputSubscribers.get(i);return s||(s=new Set,this.inputSubscribers.set(i,s)),s.add(n),()=>{const l=this.inputSubscribers.get(i);l&&(l.delete(n),l.size===0&&this.inputSubscribers.delete(i))}}subscribe(t,n={}){return this.stateSubscribers.add(t),n.immediate!==!1&&t(this.getSnapshot()),()=>this.stateSubscribers.delete(t)}batch(t){this.batchDepth+=1;try{return t()}finally{this.batchDepth-=1,this.batchDepth===0&&(this.requestDispatch(),this.requestNotification())}}getSnapshot(){return Object.freeze({version:this.version,ports:Object.freeze([...this.ports.values()].map(t=>this.snapshotPort(t))),connections:Object.freeze([...this.connections.values()].map(t=>this.snapshotConnection(t)))})}getConnection(t){const n=this.connections.get(t);return n?this.snapshotConnection(n):void 0}getPort(t){const n=this.ports.get(Ee(t));return n?this.snapshotPort(n):void 0}getLastPacket(t){return this.ports.get(Ee(t))?.lastPacket}enqueueOutgoing(t,n){const i=this.outgoing.get(Ee(t.source));if(i)for(const s of i)this.enqueue({connectionId:s,packet:t,trace:n,release:!1})}enqueue(t){this.deliveryQueue.push(t),this.requestDispatch()}requestDispatch(){this.batchDepth>0||this.isDispatching||this.dispatchScheduled||this.deliveryQueue.length===0||(this.dispatchScheduled=!0,this.schedule(()=>this.drainDeliveries()))}drainDeliveries(){if(this.dispatchScheduled=!1,this.isDispatching)return;this.isDispatching=!0;let t=0;try{for(;this.deliveryQueue.length>0;){if(t>=this.maxDeliveriesPerFlush){this.blockRemainingForBudget();break}const n=this.deliveryQueue.shift();if(!n)break;this.processDelivery(n),t+=1}}finally{this.isDispatching=!1,this.scheduleSettling(),this.requestDispatch()}}processDelivery(t){const n=this.connections.get(t.connectionId);if(!n)return;if(t.trace.path.includes(n.id)){this.setBlocked(n,"cycle-detected",`Flow ${t.trace.flowId} tried to traverse ${n.id} twice.`)&&this.touch();return}if(t.trace.path.length>=this.maxHops){this.setBlocked(n,"max-hops-exceeded",`Flow ${t.trace.flowId} exceeded the ${this.maxHops}-hop limit.`)&&this.touch();return}if(n.policy==="breathe"&&!t.release){n.pending=t;const P=this.structuralProblem(n);P?this.setBlocked(n,P.code,P.message):(n.status="resting",n.blockedReason=void 0),this.touch();return}const i=this.structuralProblem(n);if(i){this.setBlocked(n,i.code,i.message)&&this.touch();return}const s=this.ports.get(Ee(n.to));if(!s)return;const l=this.valueValidationProblem(s.definition,t.packet.value);if(l){this.setBlocked(n,"invalid-value",l)&&this.touch();return}const u=Object.freeze([...t.trace.path,n.id]),d=n.revision+1,p=Ea({id:this.createId("packet"),flowId:t.trace.flowId,parentPacketId:t.packet.id,source:t.packet.source,target:n.to,connectionId:n.id,type:t.packet.type,value:t.packet.value,...t.packet.metadata===void 0?{}:{metadata:t.packet.metadata},revision:t.packet.revision,connectionRevision:d,emittedAt:t.packet.emittedAt,deliveredAt:this.now(),hops:u.length,path:u});n.revision=d,n.activityToken+=1,n.lastPacket=p,n.pending=void 0,n.status="flowing",n.blockedReason=void 0,s.revision+=1,s.lastPacket=p,this.settlingConnections.set(n.id,n.activityToken),this.touch();const v=this.inputSubscribers.get(Ee(n.to));if(!v||v.size===0)return;const h=this.activeTrace;this.activeTrace={flowId:p.flowId,path:u,parentPacketId:p.id};const b=Object.freeze({connection:this.snapshotConnection(n),emit:(P,L,K)=>this.emit(P,L,K)});try{for(const P of[...v])try{P(p,b)}catch(L){this.setBlocked(n,"subscriber-error",`An input subscriber failed: ${Jo(L).message}`),this.reportFault({phase:"input-subscriber",error:Jo(L),connectionId:n.id,address:n.to}),this.touch()}}finally{this.activeTrace=h}}blockRemainingForBudget(){const t=this.deliveryQueue.splice(0),n=new Set;for(const i of t){if(n.has(i.connectionId))continue;const s=this.connections.get(i.connectionId);s&&(n.add(s.id),this.setBlocked(s,"delivery-budget-exceeded",`A dispatch exceeded the ${this.maxDeliveriesPerFlush}-delivery safety budget.`))}n.size>0&&this.touch()}scheduleSettling(){this.settleScheduled||this.settlingConnections.size===0||(this.settleScheduled=!0,this.schedule(()=>{this.settleScheduled=!1;let t=!1;for(const[n,i]of this.settlingConnections){const s=this.connections.get(n);s?.status==="flowing"&&s.activityToken===i&&(s.status="resting",t=!0)}this.settlingConnections.clear(),t&&this.touch()}))}valueValidationProblem(t,n){if(!vm(n,t.type))return`Port ${t.artifactId}:${t.portId} expects a ${t.type} value.`;if(t.validate)try{const i=t.validate(n);return i===!0?void 0:typeof i=="string"?i:`Port ${t.artifactId}:${t.portId} rejected the value.`}catch(i){return`Port ${t.artifactId}:${t.portId} validator failed: ${Jo(i).message}`}}structuralProblem(t){const n=this.ports.get(Ee(t.from)),i=this.ports.get(Ee(t.to));if(!n)return{code:"source-port-missing",message:`Source port ${t.from.artifactId}:${t.from.portId} is not registered.`};if(!i)return{code:"target-port-missing",message:`Target port ${t.to.artifactId}:${t.to.portId} is not registered.`};if(n.definition.direction!=="output")return{code:"source-not-output",message:`Source port ${t.from.artifactId}:${t.from.portId} is not an output.`};if(i.definition.direction!=="input")return{code:"target-not-input",message:`Target port ${t.to.artifactId}:${t.to.portId} is not an input.`};if(!ec(n.definition.type,i.definition.type))return{code:"incompatible-types",message:`Cannot bind ${n.definition.type} to ${i.definition.type}.`}}applyStructuralStatus(t,n){const i=this.structuralProblem(t);return i?this.setBlocked(t,i.code,i.message):t.status==="blocked"&&(n||t.blockedReason!==void 0&&mm.has(t.blockedReason.code))?(t.status="resting",t.blockedReason=void 0,!0):!1}refreshConnectionsForPort(t){const n=new Set([...this.outgoing.get(t)??[],...this.incoming.get(t)??[]]);for(const i of n){const s=this.connections.get(i);s&&this.applyStructuralStatus(s,!1)}}setBlocked(t,n,i){return t.status==="blocked"&&t.blockedReason?.code===n&&t.blockedReason.message===i?!1:(t.status="blocked",t.blockedReason=Object.freeze({code:n,message:i,at:this.now()}),this.settlingConnections.delete(t.id),!0)}snapshotPort(t){return Object.freeze({artifactId:t.definition.artifactId,portId:t.definition.portId,direction:t.definition.direction,type:t.definition.type,revision:t.revision,...t.lastPacket?{lastPacket:t.lastPacket}:{}})}snapshotConnection(t){return Object.freeze({id:t.id,from:t.from,to:t.to,meaning:t.meaning,policy:t.policy,status:t.status,revision:t.revision,...t.lastPacket?{lastPacket:t.lastPacket}:{},hasPending:t.pending!==void 0,...t.pending?{pendingPacket:t.pending.packet}:{},...t.blockedReason?{blockedReason:t.blockedReason}:{}})}requireConnection(t){const n=this.connections.get(t);if(!n)throw new Error(`Connection "${t}" does not exist.`);return n}addToIndex(t,n,i){let s=t.get(n);s||(s=new Set,t.set(n,s)),s.add(i)}removeFromIndex(t,n,i){const s=t.get(n);s&&(s.delete(i),s.size===0&&t.delete(n))}touch(){this.version+=1,this.requestNotification()}requestNotification(){this.batchDepth>0||this.notifyScheduled||this.stateSubscribers.size===0||(this.notifyScheduled=!0,this.schedule(()=>{if(this.notifyScheduled=!1,this.stateSubscribers.size===0)return;const t=this.getSnapshot();for(const n of[...this.stateSubscribers])try{n(t)}catch(i){this.reportFault({phase:"state-subscriber",error:Jo(i)})}}))}reportFault(t){if(this.onError)try{this.onError(t)}catch{}}}function ym(e,t){return ec(e.type,t.type)?e.type===t.type?e.type==="event"?7:6:e.type==="any"||t.type==="any"?4:e.type==="component"&&t.type==="data"?2:1:-1}function Ma(e,t){const n=e.content.ports?.outputs??[],i=t.content.ports?.inputs??[];let s=null;for(const u of n)for(const d of i){const p=ym(u,d);p<0||s&&p<=s.score||(s={fromPort:u,toPort:d,score:p})}if(!s)return{policy:"breathe"};const l=s.fromPort.type==="event"||s.toPort.type==="event"||s.fromPort.mode==="event"||s.toPort.mode==="event";return{fromPort:s.fromPort,toPort:s.toPort,policy:t.kind==="component"?l?"event":"live":"breathe"}}function si(e){return e.content.text||e.content.markdown||e.content.description||e.content.summary||e.content.raw||e.prompt}function wm(e,t){if(t==="text")return si(e);if(t==="image")return{url:e.content.imageUrl||"",prompt:e.content.imagePrompt||e.content.description||e.prompt,alt:e.content.alt||e.title};if(t==="video")return{storyboard:e.content.storyboard??[],description:e.content.description||e.content.summary||e.prompt};if(t==="data"||t==="component")return e.content.data??{title:e.title,kind:e.kind,purpose:e.content.purpose||"",summary:e.content.summary||si(e)};if(t==="any")return e.content.data??e.content.imageUrl??e.content.storyboard??si(e)}function Aa(e,t){if(t&&Object.prototype.hasOwnProperty.call(e.runtime?.outputs??{},t))return e.runtime?.outputs[t];const n=e.content.ports?.outputs.find(i=>i.id===t);return n?wm(e,n.type):si(e)}function Ta(e,t){return t?e.content.ports?.inputs.find(n=>n.id===t)?.label??e.content.ports?.outputs.find(n=>n.id===t)?.label??t:""}function xm(e,t){return!!e.content.ports?.outputs.some(n=>n.id===t)}function qn(e,t,n){return Math.min(Math.max(e,t),n)}function Kr(e,t){return{x:(e.x-t.x)/t.zoom,y:(e.y-t.y)/t.zoom}}function ar(e,t){return{x:e.x*t.zoom+t.x,y:e.y*t.zoom+t.y}}function Im(e,t,n){return{x:t.width/2-e.x*n,y:t.height/2-e.y*n,zoom:n}}function _m(e,t,n){const i=qn(t,Xl,zf),s=Kr(e,n);return{x:e.x-s.x*i,y:e.y-s.y*i,zoom:i}}function km(e,t,n){return Kr({x:qn(e.x,28,n.width-28),y:qn(e.y,28,n.height-130)},t)}const tc={text:"dot:model:text",image:"dot:model:image"};async function Sm(){try{const e=await fetch("/api/models");if(!e.ok)return null;const t=await e.json();return!Array.isArray(t.textModels)||!Array.isArray(t.imageModels)?null:t}catch{return null}}function $a(e){try{return localStorage.getItem(tc[e])}catch{return null}}function Oa(e,t){try{localStorage.setItem(tc[e],t)}catch{}}function lr(e){return e.split("/").pop()??e}function Pm(e){const t=e.promptPricePerMillion;return t==null?"":t?`$${t<1?t.toFixed(2):t.toFixed(0)}/M`:"free"}const Cm={key:0,class:"constellation-lasso","aria-hidden":"true"},Em=["d"],Mm={class:"tendril-layer","aria-hidden":"true"},Am=["id","x1","y1","x2","y2"],Tm=["d","stroke"],$m=["d","stroke"],Om=["cx","cy","r","opacity"],Rm=["d"],Lm=["aria-label","aria-pressed"],Dm=["disabled","title","aria-label","onClick"],Nm={key:0,"aria-hidden":"true"},Fm=["disabled"],zm=["disabled","onKeydown"],jm=["disabled","title","aria-label"],Bm=["title","aria-label","onPointerdown","onPointerup"],Hm=["data-artifact-id","role","aria-modal","aria-label","onPointerdown","onKeydown","onContextmenu"],Vm=["onClick"],Wm={class:"artifact-card__eyebrow"},qm={key:0},Um={key:1,class:"object-preview"},Gm={class:"object-preview__header"},Xm={class:"object-preview__chips"},Ym={class:"object-preview__grid"},Km=["scrolling","tabindex","data-dot-artifact-id","srcdoc"],Jm=["title","aria-label","aria-busy","disabled","onClick"],Zm=["title"],Qm={key:0,class:"image-result"},eh=["src","alt"],th=["aria-label"],nh=["aria-label"],oh=["onClick"],ih={key:4,class:"video-preview"},rh={key:5},sh=["title","onClick"],ah={key:0},lh={key:3,class:"nested-drop-hint"},ch=["title"],uh=["aria-label","onClick"],dh=["aria-label","onClick"],ph=["title","aria-label","onPointerdown","onClick"],fh=["disabled","title","aria-label"],mh=["title","aria-label","aria-pressed","onClick"],hh=["aria-expanded"],gh={key:0,class:"model-picker","aria-label":"Model selection"},vh={class:"model-picker__group","aria-label":"Artifact generation models"},bh=["title","onClick"],yh={class:"model-picker__group","aria-label":"Image generation models"},wh=["title","onClick"],xh={key:0},Ih={key:1,class:"model-picker__empty"},_h=["disabled"],kh=["disabled"],Sh={class:"command-bar__status"},Ph=["disabled","placeholder"],Ch=["disabled"],Eh=840,Ra=52,Mh=96,Ah=18,Th=180,cr="data-dot-run-inert-owned",$h=ep({__name:"App",setup(e){const t=j({x:0,y:0}),n=j({x:0,y:0,zoom:1}),i=j(!1),s=j(!1),l=j(null),u=j([]),d=j(""),p=j({type:"create"}),v=j(null),h=j(null),b=j(""),P=["nature","technical","space"];function L(){try{const r=localStorage.getItem("dot:theme");return P.includes(r)?r:"nature"}catch{return"nature"}}const K=j(L());wn(K,r=>{document.documentElement.dataset.theme=r;try{localStorage.setItem("dot:theme",r)}catch{}},{immediate:!0});const q=j(null),de=j(null),le=j($a("text")),Y=j($a("image")),Q=j(!1),W=oe(()=>le.value??de.value?.defaults.text??null),ke=oe(()=>Y.value??de.value?.defaults.image??null),nt=oe(()=>q.value?q.value:W.value?`ai · ${lr(W.value)}`:"ai models");function ot(){Q.value=!Q.value}function yt(r){le.value=r,Oa("text",r),q.value=null}function Sn(r){Y.value=r,Oa("image",r)}function wt(r){if(!Q.value)return;r.target?.closest(".model-dock")||(Q.value=!1)}const se=j([]),ye=j([]),Ke=j([]),cn=j([]),Pn=j([]),Ae=new Map,pe=new Map,z=j(null),ge=j(null),ce=j(null),it=j(Lt()),Ue=j(Ne()),Je=j(null),Ze=j(null),un=j(null),rt=j(null),xt=j(null),It=j(null),dn=j(null),He=j(null),dt=j(null),f=j(null),g=j([]),w=j(!1),S=j(null),I=j([]),_=j(!1),M=j(""),E=j(null);let C=null,k=0;const V=oe(()=>({"seed-dot--active":i.value,"seed-dot--generating":s.value,"seed-dot--dragging":!!un.value})),$=oe(()=>({transform:`translate3d(${n.value.x}px, ${n.value.y}px, 0) scale(${n.value.zoom})`})),B=oe(()=>({backgroundPosition:`${n.value.x}px ${n.value.y}px`,backgroundSize:`${44*n.value.zoom}px ${44*n.value.zoom}px`})),H=oe(()=>se.value.filter(r=>!r.parentId)),J=oe(()=>p.value.type==="edit"?"what should change about this?":"what do we want to build today?"),ae=oe(()=>p.value.type==="edit"?l.value?"regenerating":s.value?"changing":d.value.trim()?"change":"regenerate":s.value?"creating":"create"),ne=oe(()=>l.value?"regenerating":s.value?"changing":b.value.trim()?"change":"regenerate"),we=oe(()=>s.value||l.value?!0:p.value.type==="create"?!d.value.trim():!1),Pe=oe(()=>s.value||!!l.value),ve=oe(()=>se.value.find(r=>r.id===Je.value)??null),st=oe(()=>ve.value?JSON.stringify(ve.value.content,null,2):""),pn=oe(()=>dn.value?{left:`${dn.value.x}px`,top:`${dn.value.y}px`,right:"auto"}:{});function Lt(){const r=window.visualViewport;return{width:r?.width??window.innerWidth,height:r?.height??window.innerHeight}}function Ne(){return{x:window.visualViewport?.offsetLeft??0,y:window.visualViewport?.offsetTop??0}}function Fe(r){return Kr(r,n.value)}function $o(r){return ar(r,n.value)}function at(r){return Kl(se.value,r)}function xc(r){return Zf(se.value,r)}function fn(r){return Qf(se.value,r)}function es(r,o){return tm(se.value,ye.value,r,o)}function ts(){n.value=Im(t.value,Lt(),1)}function Ic(r,o){n.value=_m(r,o,n.value)}function _c(r){const o=Lt(),a=h.value?.getBoundingClientRect(),c=a?.width??Math.min(380,o.width-36),m=Math.min(a?.height??520,o.height-24),y=12;return{x:qn(r.x,y,Math.max(y,o.width-c-y)),y:qn(r.y,y,Math.max(y,o.height-m-y))}}function kc(r){const o=Lt(),a=28,c=132,m={w:430,h:Math.max(285,Ir)},y=137.508*Math.PI/180,A=Array.from({length:30},(F,Z)=>{const ze=210+Math.floor(Z/6)*104,St=16*Math.PI/180+Z*y;return{x:r.x+Math.cos(St)*ze-m.w/2,y:r.y+Math.sin(St)*ze-m.h/2}}),T=F=>H.value.some(Ie=>{const ze=Oi(Ie);return!(F.x+m.w+30<=Ie.x||F.x>=Ie.x+ze.w+30||F.y+m.h+30<=Ie.y||F.y>=Ie.y+ze.h+30)});return A.find(F=>{const Z=$o(F),Ie=m.w*n.value.zoom,ze=m.h*n.value.zoom;return!T(F)&&Z.x>=a&&Z.y>=a&&Z.x+Ie<=o.width-a&&Z.y+ze<=o.height-c})??A.find(F=>!T(F))??km({x:a,y:a+24},n.value,o)}function Pi(){s.value||l.value||(i.value=!0,zn(()=>v.value?.focus()))}function Yt(){p.value={type:"create"},d.value=""}function Sc(){Ln(),Fi(),z.value=null,ge.value=null,Je.value=null,Ze.value=null,b.value="",!s.value&&!l.value&&(i.value=!1,Yt())}function ns(r){const o=r.target;return o instanceof HTMLElement?!o.closest(".artifact-card, .seed-dot, .command-bar, .canvas-help, .inspector-panel, .deleted-marker, .marker-control, .nested-bubbles, .constellation-action, .constellation-custom-prompt"):!1}function os(r){s.value||l.value||(z.value=null,ge.value=null,Je.value=null,Ze.value=null,b.value="",t.value=Fe(r),Yt(),Pi())}function is(r,o){r.value.includes(o)||r.value.push(o)}function rs(r,o){r.value=r.value.filter(a=>a!==o)}function Pc(r,o){is(cn,r),is(Pn,o);const a=window.setTimeout(()=>{rs(cn,r),rs(Pn,o),pe.delete(o)},Eh);pe.set(o,a)}function ss(r,o,a){return{...r,content:{...r.content,provider:o,model:a},children:r.children?.map(c=>ss(c,o,a))??[]}}function Ci(){return{artifacts:se.value.map(r=>({id:r.id,kind:r.kind,title:r.title,prompt:r.prompt,parentId:r.parentId??null,purpose:r.content.purpose??"",summary:r.content.summary??"",ports:r.content.ports??{inputs:[],outputs:[]}}))}}async function Kt(r,o,a,c,m){const y=r||a?.prompt||a?.title||"Regenerate artifact";try{const A=await Ff({prompt:y,mode:o,model:le.value,preferredKind:c??null,selectedArtifact:a??null,connectedInputs:m??(a?vs(a.id):[]),canvasContext:Ci()});return q.value=A.model?`ai · ${A.model}`:"ai",A.artifacts.map(T=>ss(T,A.provider,A.model))}catch(A){return console.warn("AI generation failed. Falling back to local generator.",A),q.value="dreaming offline",[Jf(y,a,c)]}}function fe(r){return se.value.find(o=>o.id===r)??null}const xe=j([]),_t=j([]),Qe=j([]),Ei=j({}),Dt=j(null),$e=j(null),Jt=new Map;let Zn=null,Mi=!1;function Oo(r){return r.runtime||(r.runtime={inputs:{},outputs:{},revision:0}),r.runtime}function Cc(r){const o=fe(r),a=o?Oo(o):null;return{inputs:a?.inputs??{},revision:a?.revision??0}}function Qn(r,o){const a={...Ei.value};o?a[r]=o:delete a[r],Ei.value=a}function eo(r){return Ei.value[r]}function Ai(r){return xe.value.find(o=>o.toId===r&&o.error)?.error}function Ec(r){return eo(r)??Ai(r)}const Ge=new bm({onError:({error:r,connectionId:o})=>{console.warn("[dot:living-runtime]",o??"runtime",r)}}),Cn=new Map,En=new Map,Ti=new Map;function Mn(r,o,a){return{artifactId:r,portId:`${a}:${o}`}}function as(r){try{const o=JSON.stringify(r);if(o===void 0)return;const a=JSON.parse(o);return Ql(a)?a:void 0}catch{return}}function Mc(r,o,a){const c=fe(r);if(!c)return;const m=Oo(c);m.inputs={...m.inputs,[o]:structuredClone(a.value)},m.revision+=1,m.updatedAt=new Date(a.deliveredAt??Date.now()).toISOString(),Zn?.sendInputs(r,m.inputs,m.revision)}function ls(r,o){if(xe.value.some(A=>A.toId===r&&A.toPortId===o&&A.fromPortId))return;const c=fe(r);if(!c?.runtime||!Object.prototype.hasOwnProperty.call(c.runtime.inputs,o))return;const{[o]:m,...y}=c.runtime.inputs;c.runtime.inputs=y,c.runtime.revision+=1,Zn?.sendInputs(r,y,c.runtime.revision)}function An(){for(const a of xe.value)(a.policy??"breathe")!=="breathe"&&Di(a.fromId,a.toId)&&(a.policy="breathe",Fo(a.toId));const r=new Map;for(const a of se.value)for(const c of["input","output"]){const m=c==="input"?a.content.ports?.inputs??[]:a.content.ports?.outputs??[];for(const y of m){const A=Mn(a.id,y.id,c),T=Ee(A);r.set(T,{artifactId:a.id,portId:y.id,direction:c,type:y.type,signature:`${c}:${y.type}:${y.mode??"state"}`})}}const o=[];Ge.batch(()=>{for(const[c,m]of Cn)r.get(c)?.signature!==m.signature&&(m.dispose(),Cn.delete(c));for(const[c,m]of r){if(Cn.has(c))continue;const y=Mn(m.artifactId,m.portId,m.direction),A=Ge.registerPort({...y,direction:m.direction,type:m.type}),T=m.direction==="input"?Ge.subscribeInput(y,N=>Mc(m.artifactId,m.portId,N)):()=>{};Cn.set(c,{signature:m.signature,dispose:()=>{T(),A()}})}const a=new Set(xe.value.filter(c=>c.fromPortId&&c.toPortId).map(c=>c.id));for(const[c,m]of En)a.has(c)||(Ge.disconnect(c),En.delete(c),Ti.delete(c),ls(m.toArtifactId,m.toPortId));for(const c of xe.value){if(!c.fromPortId||!c.toPortId)continue;const m=[c.fromId,c.fromPortId,c.toId,c.toPortId,c.policy??"breathe"].join(":"),y=En.get(c.id);if(y?.signature===m){const A=Ge.getConnection(c.id);A&&A.meaning!==c.meaning&&Ge.updateConnection(c.id,{meaning:c.meaning});continue}y&&(Ge.disconnect(c.id),ls(y.toArtifactId,y.toPortId)),Ge.connect({id:c.id,from:Mn(c.fromId,c.fromPortId,"output"),to:Mn(c.toId,c.toPortId,"input"),meaning:c.meaning,policy:c.policy??"breathe"}),En.set(c.id,{signature:m,toArtifactId:c.toId,toPortId:c.toPortId}),o.push(c)}}),o.forEach($c)}function Ac(r,o=1150){Qe.value.includes(r)||(Qe.value=[...Qe.value,r]);const a=Jt.get(r);a&&window.clearTimeout(a),Jt.set(r,window.setTimeout(()=>{Qe.value=Qe.value.filter(c=>c!==r),Jt.delete(r)},o))}function Tc(r){for(const o of r.connections){const a=xe.value.find(m=>m.id===o.id);if(!a)continue;const c=Ti.get(o.id)??0;a.status=o.status,a.revision=o.revision,a.error=o.blockedReason?.message,o.lastPacket?.deliveredAt&&(a.lastFlowAt=new Date(o.lastPacket.deliveredAt).toISOString()),o.revision>c&&Ac(o.id),o.hasPending&&o.policy==="breathe"&&Fo(a.toId),Ti.set(o.id,o.revision)}}function $i(r,o,a=Aa(r,o)){const c=as(a);if(c!==void 0){Ge.getPort(Mn(r.id,o,"output"))||An();try{const m=Ge.emit(Mn(r.id,o,"output"),c,{metadata:{artifactId:r.id,title:r.title}}),y=Oo(r);y.outputs={...y.outputs,[o]:c},y.revision=Math.max(y.revision+1,m.revision),y.updatedAt=new Date(m.emittedAt).toISOString()}catch(m){Qn(r.id,m instanceof Error?m.message:"Could not emit this value.")}}}function $c(r){if(!r.fromPortId)return;const o=fe(r.fromId),a=o?.content.ports?.outputs.find(c=>c.id===r.fromPortId);!o||!a||a.mode==="event"||a.type==="event"||o.kind==="component"&&o.runtime?.outputs[a.id]===void 0||$i(o,a.id)}function cs(r){for(const o of r.content.ports?.outputs??[])o.mode!=="event"&&$i(r,o.id)}function Oc(r,o,a){const c=fe(r);if(!c)return;if(!xm(c,o)){Qn(r,`The component emitted undeclared output “${o}”.`);return}const m=as(a);if(m===void 0||JSON.stringify(m).length>256e3){Qn(r,`Output “${o}” must be a compact JSON-serializable value.`);return}$i(c,o,m)}const Rc=Ge.subscribe(Tc),Lc=oe(()=>JSON.stringify({artifacts:se.value.map(r=>({id:r.id,inputs:r.content.ports?.inputs.map(o=>[o.id,o.type,o.mode])??[],outputs:r.content.ports?.outputs.map(o=>[o.id,o.type,o.mode])??[]})),connections:xe.value.map(r=>[r.id,r.fromId,r.fromPortId,r.toId,r.toPortId,r.policy,r.meaning])}));wn(Lc,An,{immediate:!0});const Ro=[{closed:"47% 53% 49% 51% / 45% 48% 52% 55%",open:"45% 55% 48% 52% / 43% 47% 53% 57%"},{closed:"54% 46% 51% 49% / 48% 54% 46% 52%",open:"53% 47% 55% 45% / 46% 53% 47% 54%"},{closed:"50% 50% 44% 56% / 55% 44% 56% 45%",open:"49% 51% 43% 57% / 54% 43% 57% 46%"},{closed:"45% 55% 54% 46% / 52% 47% 53% 48%",open:"43% 57% 53% 47% / 50% 46% 54% 50%"},{closed:"52% 48% 46% 54% / 44% 55% 45% 56%",open:"51% 49% 45% 55% / 42% 54% 46% 58%"}],mn=new Map,to=j(null);let Lo=null;function Oi(r){const a=148+Math.min(at(r.id).length,5)*9,c=Math.abs(hn(r.id));return{w:a+c%19-9,h:a+Math.floor(c/19)%17-8}}function Dc(r){return{w:430,h:Math.max(285,fn(r))}}function Nc(r){const o=to.value;return z.value===r.id&&o?.id===r.id?o.layout:z.value===r.id?Dc(r):Oi(r)}function Zt(r){const o=Nc(r),a=to.value,c=z.value===r.id&&a?.id===r.id?a.scale:{x:1,y:1},m=o.w*c.x,y=o.h*c.y;return{x:r.x+(o.w-m)/2,y:r.y+(o.h-y)/2,w:m,h:y}}function Qt(r){const o=Zt(r);return{x:o.x+o.w/2,y:o.y+o.h/2}}function Fc(r){const o=Oi(r),a=Ro[Math.abs(hn(r.id))%Ro.length];return{"--closed-bubble-width":`${o.w}px`,"--closed-bubble-height":`${o.h}px`,"--bubble-radius-closed":a.closed,"--bubble-radius-open":a.open,"--bubble-drift-delay":`${Math.abs(hn(`${r.id}:drift`))%6400}ms`}}function zc(r,o){o instanceof HTMLElement?mn.set(r,o):mn.delete(r)}function jc(r){const o=getComputedStyle(r).transform.match(/^matrix\(([^)]+)\)$/);if(!o)return{x:1,y:1};const a=o[1].split(",").map(Number);return a.length<4||a.some(c=>Number.isNaN(c))?{x:1,y:1}:{x:Math.hypot(a[0],a[1]),y:Math.hypot(a[2],a[3])}}function us(){const r=et.value,o=r?mn.get(r.id):null;if(Lo?.disconnect(),!r||!o){to.value=null;return}const a=()=>{const c={id:r.id,layout:{w:o.offsetWidth,h:o.offsetHeight},scale:jc(o)},m=to.value;(m?.id!==c.id||m.layout.w!==c.layout.w||m.layout.h!==c.layout.h||m.scale.x!==c.scale.x||m.scale.y!==c.scale.y)&&(to.value=c)};a(),Lo=new ResizeObserver(a),Lo.observe(o)}const Do=j(0);let en=0;function ds(r){Do.value=r/1e3,en=requestAnimationFrame(ds)}function hn(r){let o=0;for(let a=0;a<r.length;a++)o=o*31+r.charCodeAt(a)|0;return o}function ps(r,o,a,c,m){const y=1-m;return{x:y*y*y*r.x+3*y*y*m*o.x+3*y*m*m*a.x+m*m*m*c.x,y:y*y*y*r.y+3*y*y*m*o.y+3*y*m*m*a.y+m*m*m*c.y}}function fs(r,o,a,c){const m=o.x-r.x,y=o.y-r.y,A=Math.max(Math.hypot(m,y),1),T=hn(a),N={x:m/A,y:y/A},F={x:-N.y,y:N.x},Z=T%2===0?1:-1,Ie=Z*(30+Math.abs(T)%54),ze=-Z*(18+Math.floor(Math.abs(T)/7)%48),St=Math.sin(c*(.38+Math.abs(T)%3*.08)+Math.abs(T)%41)*Math.min(22,A/11),qo=A*(.19+Math.abs(T)%13/100),Bs=A*(.24+Math.floor(Math.abs(T)/11)%15/100),Uo={x:r.x+N.x*qo+F.x*(Ie+St),y:r.y+N.y*qo+F.y*(Ie+St)},Go={x:o.x-N.x*Bs+F.x*(ze-St*.72),y:o.y-N.y*Bs+F.y*(ze-St*.72)};return{controlA:Uo,controlB:Go,path:`M ${r.x} ${r.y} C ${Uo.x} ${Uo.y}, ${Go.x} ${Go.y}, ${o.x} ${o.y}`,mid:ps(r,Uo,Go,o,.52)}}function Bc(r,o,a,c,m,y,A){const T=Math.abs(hn(m)),N=A?4:2,F=A?.34:.085,Z=[];for(let Ie=0;Ie<N;Ie++){const ze=(y*F+Ie/N+T%97/97)%1,St=ps(r,o,a,c,ze),qo=Math.sin(ze*Math.PI);Z.push({key:`${m}-${Ie}`,x:St.x,y:St.y,opacity:.25+qo*.75,r:A?3.2:2.4})}return Z}function Ri(r,o){const a=Zt(r),c={x:a.x+a.w/2,y:a.y+a.h/2},m=o.x-c.x,y=o.y-c.y,A=Math.max(Math.sqrt((m/Math.max(a.w/2,1))**2+(y/Math.max(a.h/2,1))**2),1);return{x:c.x+m/A,y:c.y+y/A}}const Li=oe(()=>xe.value.flatMap(r=>{const o=fe(r.fromId),a=fe(r.toId);if(!o||!a||o.parentId||a.parentId)return[];const c=Qt(o),m=Qt(a),y=Ri(o,m),A=Ri(a,c),T=Qe.value.includes(r.id),N=fs(y,A,r.id,Do.value);return[{connection:r,from:y,to:A,path:N.path,mid:N.mid,pulsing:T,motes:Bc(y,N.controlA,N.controlB,A,r.id,Do.value,T)}]}));function ms(r){const o=fe(r.fromId),a=fe(r.toId);return!o||!a||!r.fromPortId||!r.toPortId?"generative context · breathe":`${Ta(o,r.fromPortId)} → ${Ta(a,r.toPortId)} · ${r.policy??"breathe"}`}wn(()=>Qe.value.length>0||!!Dt.value,r=>{r&&!en?en=requestAnimationFrame(ds):!r&&en&&(cancelAnimationFrame(en),en=0)},{immediate:!0});const et=oe(()=>{const r=z.value;if(!r)return null;const o=fe(r);return o&&!o.parentId?o:null}),Hc=oe(()=>{const r=f.value;return r?r.artifactIds.map(fe).filter(o=>!!(o&&!o.parentId)):[]}),kt=oe(()=>Hc.value.length>=2?f.value:null),hs=oe(()=>{const r=dt.value?.points??[];return!dt.value?.armed||r.length<2?"":`M ${r.map(o=>`${o.x} ${o.y}`).join(" L ")}`}),Vc=oe(()=>{const r=dt.value;return!r?.armed||r.points.length<3?[]:H.value.filter(o=>Ts(ar(Qt(o),r.startCamera),r.points)).map(o=>o.id)}),Tn=oe(()=>g.value.filter(r=>I.value.includes(r.id))),tn=oe(()=>g.value.length+1+(Tn.value.length?1:0)),$n=oe(()=>{const r=et.value;if(!r)return null;const o=Zt(r),a=42,c=Ro[Math.abs(hn(r.id))%Ro.length];return{x:o.x-a,y:o.y-a,w:o.w+a*2,h:o.h+a*2,radius:c.open}}),gs=oe(()=>{const r=Dt.value;if(!r)return null;const o=fe(r.fromId);return o?fs(Ri(o,r.toWorld),r.toWorld,r.fromId,Do.value).path:null});function Wc(r){if(typeof r=="string")return r.slice(0,600);try{return JSON.stringify(r).slice(0,600)}catch{return String(r).slice(0,600)}}function No(r,o){return Wc(Aa(r,o))}function vs(r){return xe.value.filter(o=>o.toId===r).slice(0,6).flatMap(o=>{const a=fe(o.fromId);return a?[{meaning:o.meaning,kind:a.kind,title:a.title,content:No(a,o.fromPortId)}]:[]})}function qc(r){const o=xe.value.filter(a=>a.fromId===r&&(a.policy??"breathe")==="breathe").map(a=>a.toId).filter(a=>a!==r&&!_t.value.includes(a)&&fe(a));o.length&&(_t.value=[..._t.value,...o])}function Fo(r){_t.value.includes(r)||(_t.value=[..._t.value,r])}function zo(r){_t.value=_t.value.filter(o=>o!==r)}function Di(r,o){const a=new Set,c=[o];for(;c.length;){const m=c.pop();if(!(!m||a.has(m))){if(m===r)return!0;a.add(m);for(const y of xe.value)y.fromId===m&&(y.policy??"breathe")!=="breathe"&&c.push(y.toId)}}return!1}function bs(r){const o=Jt.get(r);o&&window.clearTimeout(o),Jt.delete(r),Qe.value=Qe.value.filter(a=>a!==r)}async function On(r,o,a){if(r===o||xe.value.some(N=>N.fromId===r&&N.toId===o))return;const c=fe(r),m=fe(o);if(!c||!m)return;const y=Ma(c,m),A=y.policy!=="breathe"&&Di(r,o)?"breathe":y.policy;if(y.toPort){const N=xe.value.filter(F=>F.toId===o&&F.toPortId===y.toPort?.id);if(N.length){const F=new Set(N.map(Z=>Z.id));xe.value=xe.value.filter(Z=>!F.has(Z.id)),N.forEach(Z=>bs(Z.id)),An()}}const T={id:crypto.randomUUID(),fromId:r,toId:o,fromPortId:y.fromPort?.id,toPortId:y.toPort?.id,policy:A,status:"resting",revision:0,meaning:a?.toLowerCase().slice(0,60).trim()||"weaving…",createdAt:ri()};if(xe.value.push(T),A==="breathe"&&Fo(o),An(),!a){const N=F=>({kind:F.kind,title:F.title,summary:F.content.summary??F.prompt});try{const F=await Rf(N(c),N(m)),Z=xe.value.find(Ie=>Ie.id===T.id);Z&&(Z.meaning=F)}catch(F){console.warn("Connection naming failed.",F);const Z=xe.value.find(Ie=>Ie.id===T.id);Z&&(Z.meaning="connected to")}}}function Uc(r){xe.value=xe.value.filter(o=>o.id!==r),bs(r),An()}function Gc(r,o){return H.value.find(a=>{if(a.id===o)return!1;const c=Zt(a);return r.x>=c.x&&r.x<=c.x+c.w&&r.y>=c.y&&r.y<=c.y+c.h})??null}function Xc(r,o){r.stopPropagation(),r.currentTarget.setPointerCapture(r.pointerId),Dt.value={pointerId:r.pointerId,fromId:o.id,toWorld:Fe({x:r.clientX,y:r.clientY}),hoverTargetId:null}}function ys(r){if(Mi){Mi=!1;return}$e.value=$e.value===r.id?null:r.id}function Yc(r,o){r.key!=="Enter"&&r.key!==" "||(r.preventDefault(),r.stopPropagation(),ys(o))}function Kc(r){const o=Dt.value;!o||o.pointerId!==r.pointerId||(o.toWorld=Fe({x:r.clientX,y:r.clientY}),o.hoverTargetId=Gc(o.toWorld,o.fromId)?.id??null)}function Jc(r){const o=Dt.value;!o||o.pointerId!==r.pointerId||(Dt.value=null,o.hoverTargetId&&(Mi=!0,$e.value=null,On(o.fromId,o.hoverTargetId)))}async function Zc(r){if(s.value||l.value)return;const o=xe.value.filter(a=>a.toId===r.id).map(a=>a.id);Qe.value=[...new Set([...Qe.value,...o])];for(const a of o){const c=Jt.get(a);c&&window.clearTimeout(c),Jt.delete(a),Ge.getConnection(a)?.hasPending&&Ge.breathe(a)}await Promise.resolve(),zo(r.id);try{await Wi(r)}finally{Qe.value=Qe.value.filter(a=>!o.includes(a))}}const pt=j({}),jo=j(null),nn=j(null),Nt=j([]),on=j({}),ft=j(null);let no=null,Ni=0,oo=null,Rn=null;const Ce=oe(()=>{const r=z.value;if(!r)return null;const o=nn.value?.startsWith(`${r}:`)??!1;if((s.value||l.value)&&!o)return null;const a=fe(r);return!a||a.parentId||ye.value.includes(r)?null:a}),gn=oe(()=>{const r=Ce.value;return r?pt.value[r.id]??[]:[]});function mt(r,o){return`${r}:${o.kind}:${o.title}:${hn(`${o.prompt}:${o.reason}`)}`}function Qc(r,o){on.value={...on.value,[r]:o}}function eu(r,o,a){if(r.pointerType==="mouse"&&r.button!==0||s.value||l.value)return;const c=Ce.value;if(!c)return;const m=mt(c.id,o),y=on.value[m];r.currentTarget.setPointerCapture(r.pointerId),ft.value={pointerId:r.pointerId,key:m,startPointerX:r.clientX,startPointerY:r.clientY,startPosition:Bo(c,o,a,gn.value.length),startPlacement:y?{...y}:void 0,moved:!1}}function tu(r){const o=ft.value;if(!o||o.pointerId!==r.pointerId)return;const a=r.clientX-o.startPointerX,c=r.clientY-o.startPointerY;if(!o.moved&&Math.hypot(a,c)>5&&(o.moved=!0),!o.moved)return;r.preventDefault();const m=Ce.value;if(!m){ft.value=null;return}const y=Math.max(n.value.zoom,.01);bu(m,o.key,{x:o.startPosition.x+a/y,y:o.startPosition.y+c/y})}function ws(r){const o=r.currentTarget;o.hasPointerCapture(r.pointerId)&&o.releasePointerCapture(r.pointerId)}function xs(r){const o={...on.value};r.startPlacement?o[r.key]=r.startPlacement:delete o[r.key],on.value=o}function nu(r){const o=ft.value;!o||o.pointerId!==r.pointerId||(ft.value=null,ws(r),o.moved&&(oo=o.key,Rn&&window.clearTimeout(Rn),Rn=window.setTimeout(()=>{oo===o.key&&(oo=null),Rn=null},0)))}function ou(r){const o=ft.value;!o||o.pointerId!==r.pointerId||(ft.value=null,ws(r),xs(o))}function iu(r){const o=ft.value;!o||o.pointerId!==r.pointerId||(ft.value=null,xs(o))}function ru(r,o){const a=Ce.value;if(!a)return;const c=mt(a.id,o);if(r.detail>0&&oo===c){r.preventDefault(),oo=null;return}su(o)}const io=oe(()=>{const r=Ce.value;return r?gn.value.map((o,a)=>({suggestion:o,index:a,key:mt(r.id,o)})).filter(o=>Nt.value.includes(o.key)):[]});function Fi(){Nt.value=[]}function su(r){if(s.value||l.value)return;const o=Ce.value;if(!o)return;const a=mt(o.id,r);Nt.value=Nt.value.includes(a)?Nt.value.filter(c=>c!==a):[...Nt.value,a]}function au(r){no&&window.clearTimeout(no),no=window.setTimeout(()=>{vu(r)},450)}function Is(r){const o=r.prompt||r.title,a={image:[{kind:"text",title:"Give it words",prompt:`write a short, evocative text about: ${o}`,reason:"words for what the image only shows"},{kind:"image",title:"Another angle",prompt:`${o}, seen from a completely different perspective`,reason:"sees the same thing differently"},{kind:"component",title:"Bring it alive",prompt:`a small playful interactive component inspired by: ${o}`,reason:"lets you touch it"}],text:[{kind:"image",title:"Paint it",prompt:`an image capturing the essence of: ${o}`,reason:"shows what the words mean"},{kind:"text",title:"What follows",prompt:`continue the thought of: ${o}`,reason:"the next chapter"},{kind:"component",title:"Make it usable",prompt:`an interactive component that presents this text beautifully: ${o}`,reason:"gives the words a home"}],component:[{kind:"text",title:"Its story",prompt:`write a short story or description around: ${o}`,reason:"why this exists"},{kind:"component",title:"A companion",prompt:`a companion component that complements: ${o}`,reason:"they work together"},{kind:"image",title:"Its mood",prompt:`an atmospheric image setting the mood for: ${o}`,reason:"how it should feel"}],video:[{kind:"image",title:"A still frame",prompt:`a single beautiful frame from: ${o}`,reason:"one caught moment"},{kind:"text",title:"The narration",prompt:`write narration for: ${o}`,reason:"a voice for the motion"},{kind:"object",title:"The scenes",prompt:`a structured scene list for: ${o}`,reason:"its skeleton"}],object:[{kind:"image",title:"Picture it",prompt:`an image visualising: ${o}`,reason:"make it visible"},{kind:"component",title:"Make it living",prompt:`an interactive component to explore: ${o}`,reason:"walk around inside it"},{kind:"text",title:"Explain it",prompt:`explain warmly and clearly: ${o}`,reason:"its meaning in words"}]};return a[r.kind]??a.object}function lu(r){const o=new Set(r.map(m=>m.kind)),c=`Use every selected source (${r.map(m=>m.title).join(", ")}) as living input, retaining the useful differences between them.`;return o.size===1&&o.has("text")?[{id:"distil",kind:"text",title:"Distil the thread",prompt:`${c} Create one clear, concise synthesis that captures the shared meaning, tensions, and strongest language.`,reason:"finds the signal across the writing"},{id:"rewrite",kind:"text",title:"Rewrite together",prompt:`${c} Rewrite the material as one cohesive piece with a confident voice, preserving the best ideas from each source.`,reason:"lets separate voices become one"},{id:"printable",kind:"component",title:"Printable composition",prompt:`${c} Build a beautifully typeset, printable Vue composition that presents this writing as a quiet finished piece.`,reason:"gives the words a physical form"}]:o.has("text")&&o.has("image")&&o.has("component")?[{id:"story-interface",kind:"component",title:"Story interface",prompt:`${c} Build a self-contained Vue experience where the image, text, and existing component work together as an interactive story.`,reason:"turns the constellation into an experience"},{id:"speaking-image",kind:"component",title:"Let it speak",prompt:`${c} Build a clickable Vue component that lets the image reveal and perform the text in a meaningful, tactile way.`,reason:"makes the image and words answer each other"},{id:"input-output",kind:"component",title:"Make a transformer",prompt:`${c} Build a small Vue tool that lets a person transform the selected text through the image and component’s interaction model.`,reason:"gives the material a new behaviour"}]:o.has("text")&&o.has("image")?[{id:"narrate",kind:"text",title:"Narrate the image",prompt:`${c} Write an evocative text that gives the image a voice, using the selected writing as its emotional and conceptual guide.`,reason:"lets the visual and verbal become one voice"},{id:"interactive-caption",kind:"component",title:"Make it speak",prompt:`${c} Build a self-contained Vue component where a person can explore the image and uncover the selected text through interaction.`,reason:"turns a caption into an encounter"},{id:"printable-poster",kind:"component",title:"Printable poster",prompt:`${c} Build a printable Vue composition that combines the visual source and writing into a compelling poster or editorial page.`,reason:"makes a shareable composition"}]:o.has("component")?[{id:"compose-interface",kind:"component",title:"Compose an interface",prompt:`${c} Build one purposeful self-contained Vue component that turns the selected materials into a coherent interactive tool.`,reason:"gives the constellation a useful surface"},{id:"explain-system",kind:"text",title:"Explain the system",prompt:`${c} Write a lucid explanation of how these artifacts relate, what they enable, and how someone should use them together.`,reason:"makes the relationship legible"},{id:"living-brief",kind:"object",title:"Make a living brief",prompt:`${c} Create a structured semantic brief that captures the goals, inputs, behaviours, and next decisions for this constellation.`,reason:"turns a cluster into an actionable shape"}]:[{id:"synthesise",kind:"text",title:"Find the thread",prompt:`${c} Create a thoughtful synthesis that explains the shared idea and the most interesting relationships between the sources.`,reason:"reveals what the group is really about"},{id:"new-structure",kind:"object",title:"Give it a shape",prompt:`${c} Create a clear structured object that reorganises these sources into a useful new model or plan.`,reason:"makes the constellation easier to act on"},{id:"new-experience",kind:"component",title:"Make it living",prompt:`${c} Build a small self-contained Vue experience that lets someone explore and use the ideas together.`,reason:"turns related things into behaviour"}]}function zi(r=kt.value){return r?r.artifactIds.map(fe).filter(o=>!!(o&&!o.parentId)):[]}function _s(r,o){return r.map(a=>({meaning:`${o.title.toLowerCase()} source`,kind:a.kind,title:a.title,content:No(a)}))}function Ln(){k+=1,f.value=null,g.value=[],I.value=[],w.value=!1,_.value=!1,M.value=""}async function cu(r){const o=zi(r);if(o.length<2)return;const a=lu(o);g.value=a,w.value=!0;const c=++k;try{const m=await Df({artifacts:o.map(y=>({id:y.id,kind:y.kind,title:y.title,prompt:y.prompt,purpose:y.content.purpose??"",summary:y.content.summary??"",content:No(y),ports:y.content.ports??{inputs:[],outputs:[]}})),canvasContext:Ci()});if(c!==k||!f.value)return;m.length&&(g.value=m)}catch(m){console.warn("Constellation action planning failed, keeping local actions.",m)}finally{c===k&&(w.value=!1)}}function uu(r){const o=r.map(fe).filter(N=>!!(N&&!N.parentId));if(o.length<2)return;const a=o.map(Zt),c=Math.min(...a.map(N=>N.x)),m=Math.min(...a.map(N=>N.y)),y=Math.max(...a.map(N=>N.x+N.w)),A=Math.max(...a.map(N=>N.y+N.h)),T={artifactIds:o.map(N=>N.id),center:{x:(c+y)/2,y:(m+A)/2},radius:Math.max(y-c,A-m)/2};z.value=null,ge.value=null,Je.value=null,i.value=!1,Yt(),f.value=T,cu(T)}function Ft(r,o){const a=kt.value;if(!a)return t.value;const c=(-145+r*290/Math.max(o-1,1))*Math.PI/180,m=Math.max(154,a.radius+134);return{x:a.center.x+Math.cos(c)*m,y:a.center.y+Math.sin(c)*m}}function ks(r){const o=Math.max(g.value.findIndex(c=>c.id===r.id),0),a=Ft(o,g.value.length+1);return{x:a.x-ii/2,y:a.y-Ir/2}}function du(r){s.value||l.value||(I.value=I.value.includes(r.id)?I.value.filter(o=>o!==r.id):[...I.value,r.id])}async function pu(){if(s.value||l.value)return;const r=Tn.value,o=zi();if(!(!r.length||o.length<2)){S.value="batch",s.value=!0;try{const c=(await Promise.all(r.map(async m=>{const y=await Kt(m.prompt,"create",void 0,m.kind,_s(o,m));return{action:m,generated:y,position:ks(m)}}))).flatMap(({action:m,generated:y,position:A})=>{const T=Ho(y,m.prompt,A),N=m.reason.toLowerCase().replace(/\.$/,"").slice(0,60);return T.forEach(F=>{o.forEach(Z=>{On(Z.id,F.id,N)}),zo(F.id)}),T});Ln(),z.value=c[0]?.id??null}finally{s.value=!1,S.value=null}}}async function fu(r,o){if(s.value||l.value)return;const a=zi();if(a.length<2)return;const c=o?`${o}

Use the lassoed constellation as living source material. Make one meaningful new artifact that uses every source where relevant.`:r.prompt,m=ks(r);S.value=r.id,s.value=!0;try{const y=await Kt(c,"create",void 0,o?void 0:r.kind,_s(a,r)),A=Ho(y,c,m),T=o?"made from this constellation":r.reason.toLowerCase().replace(/\.$/,"").slice(0,60);A.forEach(N=>{a.forEach(F=>{On(F.id,N.id,T)}),zo(N.id)}),Ln(),z.value=A[0]?.id??null}finally{s.value=!1,S.value=null}}function mu(){!kt.value||s.value||(I.value=[],_.value=!0,M.value="",zn(()=>E.value?.focus()))}function hu(){_.value=!1,M.value=""}function gu(){const r=M.value.trim();if(!r)return;fu({id:"custom",kind:"object",title:"Your intention",prompt:r,reason:"made from this constellation"},r)}async function vu(r){if(pt.value[r]?.length)return;const o=fe(r);if(!o||o.parentId)return;const a=++Ni;jo.value=r;try{const c=await Lf({artifact:{kind:o.kind,title:o.title,prompt:o.prompt,purpose:o.content.purpose??"",summary:o.content.summary??""},canvasContext:Ci()});if(a!==Ni)return;pt.value={...pt.value,[r]:c.length?c:Is(o)}}catch(c){console.warn("Suggestion request failed, sprouting local seeds.",c),a===Ni&&(pt.value={...pt.value,[r]:Is(o)})}finally{jo.value===r&&(jo.value=null)}}function Ss(r,o){return{angle:((o<=1?[0]:o===2?[-26,26]:[-40,0,40])[r]??0)*Math.PI/180,gap:Mh}}function Ps(r,o){const a=Zt(r),c=Math.max(a.w/2,1),m=Math.max(a.h/2,1),y=Math.cos(o),A=Math.sin(o);return 1/Math.sqrt(y*y/(c*c)+A*A/(m*m))}function Cs(r,o){const a=Qt(r),c=Ps(r,o.angle)+Ra+o.gap;return{x:a.x+Math.cos(o.angle)*c,y:a.y+Math.sin(o.angle)*c}}function Es(r,o,a){return Cs(r,Ss(o,a))}function Bo(r,o,a,c){const m=on.value[mt(r.id,o)]??Ss(a,c);return Cs(r,m)}function bu(r,o,a){const c=Qt(r),m=a.x-c.x,y=a.y-c.y,A=Math.atan2(y,m),T=Math.max(Ah,Math.hypot(m,y)-Ps(r,A)-Ra);Qc(o,{angle:A,gap:T})}function Ms(r){const o=Qt(r),a=Math.max(Zt(r).w,Zt(r).h)/2+158;return{x:o.x-a,y:o.y}}async function yu(){if(s.value||l.value)return;const r=Ce.value,o=io.value;if(!(!r||!o.length)){nn.value=`${r.id}:batch`,s.value=!0;try{const c=(await Promise.all(o.map(async({suggestion:T,index:N})=>{const F=Bo(r,T,N,gn.value.length),Z=await Kt(T.prompt,"create",void 0,T.kind,[{meaning:T.reason.toLowerCase().replace(/\.$/,"").slice(0,60),kind:r.kind,title:r.title,content:No(r)}]);return{suggestion:T,generated:Z,position:F}}))).flatMap(({suggestion:T,generated:N,position:F})=>{const Z=Ho(N,T.prompt,{x:F.x-ii/2,y:F.y-60}),Ie=T.reason.toLowerCase().replace(/\.$/,"").slice(0,60);return Z.forEach(ze=>{On(r.id,ze.id,Ie),zo(ze.id)}),Z}),m=new Set(o.map(({key:T})=>T)),y={...on.value};m.forEach(T=>delete y[T]),on.value=y;const A=(pt.value[r.id]??[]).filter(T=>!m.has(mt(r.id,T)));if(A.length)pt.value={...pt.value,[r.id]:A};else{const{[r.id]:T,...N}=pt.value;pt.value=N}Fi(),z.value=c[0]?.id??null,ge.value=null}finally{s.value=!1,nn.value=null}}}wn(z,r=>{ce.value&&ce.value!==r&&so(!1),ft.value=null,Fi(),r&&au(r),zn(us)});async function ji(r){const o=fe(r);if(!(!o||o.kind!=="image")&&!(o.content.imageUrl||o.content.imageStatus==="pending")&&!(!o.content.provider||!o.content.imagePrompt)){o.content.imageStatus="pending";try{const a=await Nf(o.content.imagePrompt,Y.value),c=fe(r);if(!c||c.content!==o.content)return;c.content.imageUrl=a.image,c.content.imageStatus="ready",a.model&&(c.content.model=a.model),cs(c)}catch(a){console.warn("Image generation failed.",a);const c=fe(r);c&&c.content===o.content&&(c.content.imageStatus="error")}}}function wu(r){r.content.imageStatus==="error"&&(r.content.imageStatus=void 0,ji(r.id))}function Bi(r,o,a,c){const m=wa(r,o,a,c);return se.value.push(m),ji(m.id),r.children?.forEach((y,A)=>{Bi(y,y.title,{x:m.x+28+A*18,y:m.y+m.height+32},m.id)}),m}function Ho(r,o,a){return r.map((c,m)=>Bi(c,o,{x:a.x+m*(ii+38),y:a.y+m%2*36}))}function xu(r){for(const o of xe.value){if(o.fromId!==r&&o.toId!==r)continue;const a=fe(o.fromId),c=fe(o.toId);if(!a||!c)continue;const m=Ma(a,c);o.fromPortId=m.fromPort?.id,o.toPortId=m.toPort?.id,o.policy=m.policy!=="breathe"&&Di(o.fromId,o.toId)?"breathe":m.policy,o.status="resting",o.error=void 0,o.policy==="breathe"&&Fo(o.toId)}}function Vo(r,o,a){const c=wa(o,a,{x:r.x,y:r.y},r.parentId),m=Oo(r),y=new Set(c.content.ports?.inputs.map(A=>A.id)??[]);r.kind=c.kind,r.title=c.title,r.prompt=a,r.content=c.content,r.runtime={inputs:Object.fromEntries(Object.entries(m.inputs).filter(([A])=>y.has(A))),outputs:{},revision:m.revision+1,updatedAt:new Date().toISOString()},Qn(r.id),xu(r.id),An(),r.kind!=="component"&&cs(r),ji(r.id),qc(r.id),o.children?.forEach((A,T)=>{Bi(A,A.title,{x:r.x+28+T*18,y:r.y+r.height+32},r.id)})}function Iu(r,o){const a=Fe(o);return H.value.find(c=>{if(!es(r,c))return!1;const m=fn(c);return a.x>=c.x&&a.x<=c.x+c.width&&a.y>=c.y&&a.y<=c.y+m})??null}function _u(r,o){r.parentId=o.id,z.value=o.id,ge.value=null,Je.value=null,Ze.value=null,b.value=""}function ku(r,o,a){r.parentId=void 0,r.x=o.x+28+a*18,r.y=o.y+fn(o)+24,z.value=r.id,ge.value=null}function ro(){C!==null&&window.clearTimeout(C),C=null}function Wo(r,o){return Math.hypot(r.x-o.x,r.y-o.y)}function As(r,o){const a=r.points[r.points.length-1];(!a||Wo(a,o)>=3)&&r.points.push(o)}function Su(r){return r.slice(1).reduce((o,a,c)=>o+Wo(r[c],a),0)}function Pu(r){return Math.abs(r.reduce((o,a,c)=>{const m=r[(c+1)%r.length];return o+a.x*m.y-m.x*a.y},0)/2)}function Ts(r,o){let a=!1;for(let c=0,m=o.length-1;c<o.length;m=c++){const y=o[c],A=o[m];y.y>r.y!=A.y>r.y&&r.x<(A.x-y.x)*(r.y-y.y)/(A.y-y.y)+y.x&&(a=!a)}return a}function Cu(r){const o=Su(r.points),a=r.points[0],c=r.points[r.points.length-1],m=a&&c&&Wo(a,c)<=Math.max(34,Math.min(108,o*.16));return r.points.length>=8&&o>=120&&Pu(r.points)>=2200&&m}function Eu(r){return H.value.filter(o=>Ts(ar(Qt(o),r.startCamera),r.points)).map(o=>o.id)}function $s(r){const o=dt.value;!o||o.pointerId!==r||o.hasMoved||(o.armed=!0,o.points=[o.startPoint],He.value=null,n.value={...o.startCamera},ro())}function Hi(r){const o=dt.value;r!==void 0&&o?.pointerId!==r||(ro(),dt.value=null)}function Mu(r){if(s.value)return;r.stopPropagation(),r.currentTarget.setPointerCapture(r.pointerId),un.value={pointerId:r.pointerId,startPointerX:r.clientX,startPointerY:r.clientY,startX:t.value.x,startY:t.value.y,moved:!1}}function Au(r){const o=un.value;if(!o||o.pointerId!==r.pointerId)return;const a=(r.clientX-o.startPointerX)/n.value.zoom,c=(r.clientY-o.startPointerY)/n.value.zoom;Math.abs(r.clientX-o.startPointerX)+Math.abs(r.clientY-o.startPointerY)>4&&(o.moved=!0),t.value={x:o.startX+a,y:o.startY+c}}function Tu(r){const o=un.value;!o||o.pointerId!==r.pointerId||(r.currentTarget.releasePointerCapture(r.pointerId),un.value=null,o.moved||(Yt(),Pi()))}function $u(r){if(ce.value!==r.id)return{};const o=it.value.width<=760?10:28,a=Math.max(n.value.zoom,.01),c=Ue.value.x+o,m=Ue.value.y+o;return{"--artifact-run-left":`${(c-n.value.x)/a}px`,"--artifact-run-top":`${(m-n.value.y)/a}px`,"--artifact-run-width":`${Math.max(1,it.value.width-o*2)}px`,"--artifact-run-height":`${Math.max(1,it.value.height-o*2)}px`,"--artifact-run-inverse-zoom":String(1/a)}}function Vi(r,o){if(!r){document.querySelectorAll(`[${cr}]`).forEach(T=>{T.removeAttribute("inert"),T.removeAttribute(cr)});return}const a=o?mn.get(o):null,c=a?.closest(".workspace"),m=a?.parentElement;if(!a||!c||!m)return;const y=c.closest("#app");[...y?Array.from(document.body.children).filter(T=>T!==y):[],...Array.from(c.children).filter(T=>T!==m),...Array.from(m.children).filter(T=>T!==a)].forEach(T=>{T.hasAttribute("inert")||(T.setAttribute("inert",""),T.setAttribute(cr,""))})}function Os(r){const o=mn.get(r);(o?.querySelector(".artifact-run-close")??o)?.focus({preventScroll:!0})}function Rs(r){const o=ce.value;if(!o)return;const a=mn.get(o);!a||r.target instanceof Node&&a.contains(r.target)||Os(o)}function Ou(r){r.kind!=="component"||ye.value.includes(r.id)||(Ln(),qi(),$e.value=null,Dt.value=null,Ze.value=null,i.value=!1,Yt(),z.value=r.id,ce.value=r.id,document.documentElement.classList.add("artifact-run-open"),zn(()=>{ce.value===r.id&&(Vi(!0,r.id),Os(r.id))}))}function so(r=!0){const o=ce.value;o&&(Vi(!1),ce.value=null,document.documentElement.classList.remove("artifact-run-open"),r&&zn(()=>mn.get(o)?.focus({preventScroll:!0})))}function Ls(r,o){document.dispatchEvent(new CustomEvent("dot:open-artifact",{detail:{artifactId:r.id,origin:o}}))}function Ds(r){const o=r.detail;if(!o?.artifactId)return;const a=se.value.find(c=>c.id===o.artifactId);a?.kind==="component"&&(r.stopImmediatePropagation(),Ou(a))}function Ru(r,o){if(ye.value.includes(o.id)||o.parentId)return;if(ce.value===o.id){r.stopPropagation();return}if($e.value&&$e.value!==o.id){const c=$e.value;r.preventDefault(),r.stopPropagation(),$e.value=null,z.value=o.id,On(c,o.id);return}r.stopPropagation(),Ln(),z.value=o.id,r.currentTarget.setPointerCapture(r.pointerId),rt.value={artifactId:o.id,pointerId:r.pointerId,startPointerX:r.clientX,startPointerY:r.clientY,startX:o.x,startY:o.y,moved:!1}}function Lu(r,o){const a=r.target;if(a!==r.currentTarget&&a instanceof Element&&a.closest('button, input, textarea, select, [contenteditable="true"]'))return;const c=r.key.toLowerCase(),m=r.key==="Enter"||r.key===" ";if(!(!m&&z.value!==o.id)&&!(!m&&!["e","i","f","delete","backspace"].includes(c))){if(r.preventDefault(),r.stopPropagation(),$e.value&&$e.value!==o.id){const y=$e.value;$e.value=null,z.value=o.id,On(y,o.id);return}if(m&&z.value===o.id){Ls(o,r.currentTarget);return}z.value=o.id,!m&&(c==="e"&&Qu(o),c==="i"&&Fs(o),c==="f"&&ed(o),(c==="delete"||c==="backspace")&&zs(o))}}function Du(r){const o=rt.value;if(!o||o.pointerId!==r.pointerId)return;const a=(r.clientX-o.startPointerX)/n.value.zoom,c=(r.clientY-o.startPointerY)/n.value.zoom;Math.abs(r.clientX-o.startPointerX)+Math.abs(r.clientY-o.startPointerY)>4&&(o.moved=!0);const m=se.value.find(y=>y.id===o.artifactId);!m||ye.value.includes(m.id)||(m.x=o.startX+a,m.y=o.startY+c,o.moved&&(Ze.value=Iu(m,{x:r.clientX,y:r.clientY})?.id??null))}function Nu(r){const o=rt.value;if(!o||o.pointerId!==r.pointerId)return;r.currentTarget.releasePointerCapture(r.pointerId);const a=se.value.find(m=>m.id===o.artifactId),c=Ze.value?se.value.find(m=>m.id===Ze.value):null;if(rt.value=null,a&&c&&o.moved&&es(a,c)){_u(a,c);return}Ze.value=null}function Fu(r,o){r.stopPropagation(),r.currentTarget.setPointerCapture(r.pointerId),xt.value={markerId:o.id,pointerId:r.pointerId,startPointerX:r.clientX,startPointerY:r.clientY,startX:o.x,startY:o.y,moved:!1}}function zu(r){const o=xt.value;if(!o||o.pointerId!==r.pointerId)return;const a=(r.clientX-o.startPointerX)/n.value.zoom,c=(r.clientY-o.startPointerY)/n.value.zoom;Math.abs(r.clientX-o.startPointerX)+Math.abs(r.clientY-o.startPointerY)>4&&(o.moved=!0);const m=Ke.value.find(y=>y.id===o.markerId);m&&(m.x=o.startX+a,m.y=o.startY+c)}function ju(r,o){const a=xt.value;!a||a.pointerId!==r.pointerId||(r.currentTarget.releasePointerCapture(r.pointerId),xt.value=null,a.moved||nd(o))}function Bu(r){r.stopPropagation();const o=h.value?.getBoundingClientRect();if(!o)return;r.currentTarget.setPointerCapture(r.pointerId),It.value={pointerId:r.pointerId,startPointerX:r.clientX,startPointerY:r.clientY,startX:o.left,startY:o.top,moved:!1}}function Hu(r){const o=It.value;if(!o||o.pointerId!==r.pointerId)return;const a=r.clientX-o.startPointerX,c=r.clientY-o.startPointerY;Math.abs(a)+Math.abs(c)>4&&(o.moved=!0),dn.value=_c({x:o.startX+a,y:o.startY+c})}function Ns(r){const o=It.value;!o||o.pointerId!==r.pointerId||(r.currentTarget.releasePointerCapture(r.pointerId),It.value=null)}function Vu(r){if(!ns(r))return;if(ce.value){r.preventDefault(),so();return}r.currentTarget.setPointerCapture(r.pointerId);const a={x:r.clientX,y:r.clientY};He.value={pointerId:r.pointerId,startPointerX:r.clientX,startPointerY:r.clientY,startX:n.value.x,startY:n.value.y,moved:!1},r.isPrimary&&r.button===0&&r.pointerType!=="touch"&&(dt.value={pointerId:r.pointerId,startCamera:{...n.value},startPoint:a,points:[a],armed:!1,hasMoved:!1},r.shiftKey?$s(r.pointerId):(ro(),C=window.setTimeout(()=>$s(r.pointerId),Th)))}function Wu(r){const o=dt.value;if(o?.pointerId===r.pointerId){const y={x:r.clientX,y:r.clientY};if(o.armed){As(o,y);return}Wo(o.startPoint,y)>8&&(o.hasMoved=!0,ro())}const a=He.value;if(!a||a.pointerId!==r.pointerId)return;const c=r.clientX-a.startPointerX,m=r.clientY-a.startPointerY;Math.abs(c)+Math.abs(m)>4&&(a.moved=!0),n.value={...n.value,x:a.startX+c,y:a.startY+m}}function qu(r){const o=dt.value;if(o?.pointerId===r.pointerId&&o.armed){const c=r.currentTarget;if(As(o,{x:r.clientX,y:r.clientY}),c.hasPointerCapture(r.pointerId)&&c.releasePointerCapture(r.pointerId),He.value=null,Hi(r.pointerId),Cu(o)){const m=Eu(o);m.length>=2&&uu(m)}return}Hi(r.pointerId);const a=He.value;if(!(!a||a.pointerId!==r.pointerId)&&(r.currentTarget.releasePointerCapture(r.pointerId),He.value=null,!a.moved)){if(Sc(),r.detail>=2){os({x:a.startPointerX,y:a.startPointerY});return}t.value=Fe({x:a.startPointerX,y:a.startPointerY})}}function Uu(r){Hi(r.pointerId);const o=He.value;if(!o||o.pointerId!==r.pointerId)return;const a=r.currentTarget;a.hasPointerCapture(r.pointerId)&&a.releasePointerCapture(r.pointerId),He.value=null}function Gu(r){ns(r)&&(r.preventDefault(),os({x:r.clientX,y:r.clientY}))}function Xu(r){r.preventDefault(),!ce.value&&Ic({x:r.clientX,y:r.clientY},n.value.zoom*(r.deltaY>0?.92:1.08))}function Yu(){s.value||l.value||(i.value=!1,Yt())}async function Wi(r){if(!(s.value||l.value||ye.value.includes(r.id))){l.value=r.id,ge.value=null;try{const o=await Kt("","regenerate",r),a=se.value.find(c=>c.id===r.id);a&&o[0]&&(Vo(a,o[0],a.prompt),z.value=a.id)}finally{l.value=null}}}function ao(r){return u.value.includes(r)}async function Ku(r){const o=fe(r.id);if(!o||o.kind!=="component"||s.value||ao(o.id)||ye.value.includes(o.id)||l.value)return;const a=eo(o.id)??"The component did not become ready.",c=o.prompt,m=o.title,y=o.content.vue,A=[`Repair “${o.title}” in place.`,`Current runtime failure: ${a}`,`Preserve the original intent: ${c||o.title}`,"Use the selected artifact and its current Vue source as the starting point.","Return one complete, immediately useful component with working interactions and the same declared connection contract."].join(`
`);u.value=[...u.value,o.id],s.value=!0,ge.value=null;try{const T=await Kt(A,"repair",o,"component",vs(o.id)),N=fe(o.id),F=T[0];N?.kind==="component"&&N.content.vue===y&&F&&(Vo(N,{...F,title:m,children:[]},c),z.value=N.id)}finally{u.value=u.value.filter(T=>T!==o.id),s.value=!1}}async function Ju(){const r=d.value.trim(),o=p.value;if(!(s.value||l.value)&&!(o.type==="create"&&!r)){if(o.type==="edit"&&!r){const a=se.value.find(c=>c.id===o.artifactId);if(!a)return;await Wi(a),i.value=!1,Yt();return}s.value=!0;try{if(o.type==="edit"){const a=se.value.find(c=>c.id===o.artifactId);if(a){const c=await Kt(r,"edit",a);c[0]&&(Vo(a,c[0],r),z.value=a.id)}}else{const a=await Kt(r,"create"),c=Ho(a,r,kc(t.value));z.value=c[0]?.id??null}ge.value=null,i.value=!1,Yt()}finally{s.value=!1}}}async function Zu(){const r=ve.value;if(!r||s.value||l.value)return;const o=b.value.trim();if(!o){await Wi(r);return}s.value=!0,ge.value=null;try{const a=await Kt(o,"edit",r),c=se.value.find(m=>m.id===r.id);c&&a[0]&&(Vo(c,a[0],o),z.value=c.id,b.value="")}finally{s.value=!1}}function Fs(r){ye.value.includes(r.id)||(Je.value=r.id,z.value=r.id,ge.value=null,b.value="")}function Qu(r){ye.value.includes(r.id)||(p.value={type:"edit",artifactId:r.id},d.value="",z.value=r.id,ge.value=null,Pi())}function ed(r){if(ye.value.includes(r.id))return;const o=sr(r);o.id=crypto.randomUUID(),o.title=`Fork of ${r.title}`,o.x=r.x+74,o.y=r.y+34,o.createdAt=ri(),o.parentId=void 0,se.value.push(o),Pc(r.id,o.id),z.value=o.id,ge.value=null}function td(r){const o=sr(r);at(r.id).forEach((c,m)=>{c.parentId=void 0,c.x=r.x+32+m*34,c.y=r.y+fn(r)+34}),se.value=se.value.filter(c=>c.id!==r.id),ye.value=ye.value.filter(c=>c!==r.id),Ae.delete(r.id),Ke.value.push({id:crypto.randomUUID(),artifact:o,title:o.title,x:o.x+o.width/2,y:o.y+fn(o)/2,createdAt:ri()})}function zs(r){if(ye.value.includes(r.id))return;ye.value.push(r.id),z.value=null,ge.value=null,rt.value=null,Je.value===r.id&&(Je.value=null,b.value="");const o=window.setTimeout(()=>td(r),jf);Ae.set(r.id,o)}function nd(r){const o=sr(r.artifact);o.parentId=void 0,se.value.push(o),Ke.value=Ke.value.filter(a=>a.id!==r.id),z.value=o.id,ge.value=null}function od(){Ke.value=[]}function qi(){Je.value=null,b.value="",It.value=null}function id(){const r=Lt(),o=[{x:t.value.x-16,y:t.value.y-16,width:32,height:32},...H.value.map(F=>({x:F.x,y:F.y,width:F.width,height:fn(F)})),...Ke.value.map(F=>({x:F.x-10,y:F.y-10,width:20,height:20}))],a=Math.min(...o.map(F=>F.x)),c=Math.min(...o.map(F=>F.y)),m=Math.max(...o.map(F=>F.x+F.width)),y=Math.max(...o.map(F=>F.y+F.height)),A=Math.max(m-a,1),T=Math.max(y-c,1),N=qn(Math.min((r.width-120)/A,(r.height-220)/T),Xl,1.25);n.value={x:r.width/2-(a+A/2)*N,y:r.height/2-(c+T/2)*N,zoom:N}}function js(r){const o=r.target,a=o.tagName==="INPUT"||o.tagName==="TEXTAREA";if(r.key==="Escape"){if(ce.value){r.preventDefault(),so();return}if($e.value){$e.value=null;return}if(kt.value){Ln();return}if(Je.value){qi();return}Yu(),ge.value=null,Ze.value=null}a||ce.value||(r.key.toLowerCase()==="f"&&id(),r.key==="0"&&ts())}function Dn(){it.value=Lt(),Ue.value=Ne(),us()}return kl(()=>{Zn=new fm({getInputs:Cc,onEmit:Oc,onCloseRequest:r=>{ce.value===r&&so()},onError:(r,o)=>Qn(r,o)}),ts(),window.addEventListener("keydown",js),window.addEventListener("pointerdown",wt,!0),window.addEventListener("resize",Dn),window.visualViewport?.addEventListener("resize",Dn),window.visualViewport?.addEventListener("scroll",Dn),document.addEventListener("focusin",Rs),document.addEventListener("dot:open-artifact",Ds,!0),Sm().then(r=>{de.value=r})}),Vr(()=>{Zn?.dispose(),Zn=null,Rc(),Cn.forEach(r=>r.dispose()),Cn.clear(),En.forEach((r,o)=>Ge.disconnect(o)),En.clear(),window.removeEventListener("keydown",js),window.removeEventListener("pointerdown",wt,!0),window.removeEventListener("resize",Dn),window.visualViewport?.removeEventListener("resize",Dn),window.visualViewport?.removeEventListener("scroll",Dn),document.removeEventListener("focusin",Rs),document.removeEventListener("dot:open-artifact",Ds,!0),Vi(!1),document.documentElement.classList.remove("artifact-run-open"),Lo?.disconnect(),ro(),no&&window.clearTimeout(no),Rn&&window.clearTimeout(Rn),en&&cancelAnimationFrame(en),Jt.forEach(r=>window.clearTimeout(r)),Ae.forEach(r=>window.clearTimeout(r)),pe.forEach(r=>window.clearTimeout(r))}),(r,o)=>(O(),R("main",{class:be(["workspace",{"workspace--panning":!!He.value,"workspace--lassoing":!!dt.value?.armed,"workspace--weave-targeting":!!$e.value,"workspace--artifact-running":!!ce.value}]),style:Me(B.value),"aria-label":"Dot creation canvas",onPointerdown:Vu,onPointermove:Wu,onPointerup:qu,onPointercancel:Uu,onDblclick:Gu,onWheel:Xu},[o[81]||(o[81]=x("div",{class:"ambient ambient--one"},null,-1)),o[82]||(o[82]=x("div",{class:"ambient ambient--two"},null,-1)),hs.value?(O(),R("svg",Cm,[x("path",{d:hs.value},null,8,Em)])):Te("",!0),x("div",{class:"world",style:Me($.value)},[(O(),R("svg",Mm,[x("defs",null,[(O(!0),R(ee,null,Oe(Li.value,a=>(O(),R("linearGradient",{id:`tendril-grad-${a.connection.id}`,key:`grad-${a.connection.id}`,gradientUnits:"userSpaceOnUse",x1:a.from.x,y1:a.from.y,x2:a.to.x,y2:a.to.y},[...o[52]||(o[52]=[x("stop",{offset:"0","stop-color":"rgba(255, 188, 117, 0.6)"},null,-1),x("stop",{offset:"1","stop-color":"rgba(142, 255, 135, 0.6)"},null,-1)])],8,Am))),128))]),(O(!0),R(ee,null,Oe(Li.value,a=>(O(),R("g",{key:a.connection.id,class:be(["tendril",[`tendril--${a.connection.status??"resting"}`,`tendril--policy-${a.connection.policy??"breathe"}`,{"tendril--pulsing":a.pulsing}]])},[x("path",{class:"tendril__glow",d:a.path,stroke:`url(#tendril-grad-${a.connection.id})`},null,8,Tm),x("path",{class:"tendril__core",d:a.path,stroke:`url(#tendril-grad-${a.connection.id})`},null,8,$m),(O(!0),R(ee,null,Oe(a.motes,c=>(O(),R("circle",{key:c.key,class:"tendril__mote",cx:c.x,cy:c.y,r:c.r,opacity:c.opacity},null,8,Om))),128))],2))),128)),gs.value?(O(),R("path",{key:0,class:"tendril__live",d:gs.value},null,8,Rm)):Te("",!0)])),et.value&&$n.value&&!s.value&&!l.value?(O(),R("button",{key:0,class:be(["weave-halo",{"weave-halo--weaving":!!Dt.value,"weave-halo--awaiting":$e.value===et.value.id}]),type:"button",style:Me({left:`${$n.value.x}px`,top:`${$n.value.y}px`,width:`${$n.value.w}px`,height:`${$n.value.h}px`,"--weave-halo-radius":$n.value.radius}),"aria-label":$e.value===et.value.id?"Choose another bubble to complete this living connection":"Weave this bubble to another","aria-pressed":$e.value===et.value.id,onPointerdown:o[0]||(o[0]=a=>Xc(a,et.value)),onPointermove:Kc,onPointerup:Jc,onClick:o[1]||(o[1]=a=>ys(et.value)),onKeydown:o[2]||(o[2]=a=>Yc(a,et.value))},null,46,Lm)):Te("",!0),kt.value?(O(),R(ee,{key:1},[x("span",{class:"constellation-core",style:Me({left:`${kt.value.center.x}px`,top:`${kt.value.center.y}px`,width:`${Math.max(68,kt.value.radius*1.24)}px`,height:`${Math.max(68,kt.value.radius*1.24)}px`}),"aria-hidden":"true"},null,4),(O(!0),R(ee,null,Oe(g.value,(a,c)=>(O(),R("button",{key:`constellation-${a.id}-${c}`,class:be(["constellation-action",{"constellation-action--queued":I.value.includes(a.id),"constellation-action--creating":S.value===a.id||S.value==="batch"&&I.value.includes(a.id),"constellation-action--waiting":s.value&&!(S.value==="batch"&&I.value.includes(a.id))}]),type:"button",disabled:s.value,title:a.reason,"aria-label":`Queue constellation action: ${a.title}`,style:Me({left:`${Ft(c,tn.value).x}px`,top:`${Ft(c,tn.value).y}px`,"--constellation-delay":`${c*120}ms`}),onPointerdown:o[3]||(o[3]=D(()=>{},["stop"])),onPointermove:o[4]||(o[4]=D(()=>{},["stop"])),onPointerup:o[5]||(o[5]=D(()=>{},["stop"])),onClick:D(m=>du(a),["stop"])},[x("span",null,X(a.title),1),x("small",null,X(a.reason),1),w.value?(O(),R("i",Nm)):Te("",!0)],46,Dm))),128)),_.value?(O(),R("form",{key:1,class:be(["constellation-custom-prompt",{"constellation-custom-prompt--creating":S.value==="custom"}]),style:Me({left:`${Ft(g.value.length,tn.value).x}px`,top:`${Ft(g.value.length,tn.value).y}px`}),onPointerdown:o[10]||(o[10]=D(()=>{},["stop"])),onPointermove:o[11]||(o[11]=D(()=>{},["stop"])),onPointerup:o[12]||(o[12]=D(()=>{},["stop"])),onSubmit:D(gu,["prevent"])},[Ji(x("input",{ref_key:"customConstellationPromptInput",ref:E,"onUpdate:modelValue":o[9]||(o[9]=a=>M.value=a),disabled:s.value,"aria-label":"Describe what to make from the selected constellation",placeholder:"what should these become?",onKeydown:Ef(D(hu,["stop","prevent"]),["esc"])},null,40,zm),[[rr,M.value]]),o[54]||(o[54]=x("span",null,"enter to weave",-1))],38)):(O(),R("button",{key:0,class:be(["constellation-action constellation-action--custom",{"constellation-action--waiting":s.value}]),type:"button",disabled:s.value,title:"Describe a transformation for this constellation","aria-label":"Describe a custom constellation action",style:Me({left:`${Ft(g.value.length,tn.value).x}px`,top:`${Ft(g.value.length,tn.value).y}px`,"--constellation-delay":`${g.value.length*120}ms`}),onPointerdown:o[6]||(o[6]=D(()=>{},["stop"])),onPointermove:o[7]||(o[7]=D(()=>{},["stop"])),onPointerup:o[8]||(o[8]=D(()=>{},["stop"])),onClick:D(mu,["stop"])},[...o[53]||(o[53]=[x("span",null,"Make something…",-1),x("small",null,"your intention",-1)])],46,Fm)),Tn.value.length?(O(),R("button",{key:2,class:be(["constellation-action constellation-action--weave",{"constellation-action--creating":S.value==="batch"}]),type:"button",disabled:s.value,title:`Create ${Tn.value.length} selected actions`,"aria-label":`Weave ${Tn.value.length} selected constellation actions`,style:Me({left:`${Ft(g.value.length+1,tn.value).x}px`,top:`${Ft(g.value.length+1,tn.value).y}px`,"--constellation-delay":`${(g.value.length+1)*120}ms`}),onPointerdown:o[13]||(o[13]=D(()=>{},["stop"])),onPointermove:o[14]||(o[14]=D(()=>{},["stop"])),onPointerup:o[15]||(o[15]=D(()=>{},["stop"])),onClick:D(pu,["stop"])},[x("span",null,"Weave "+X(Tn.value.length),1),o[55]||(o[55]=x("small",null,"bring them into being",-1))],46,jm)):Te("",!0)],64)):Te("",!0),(O(!0),R(ee,null,Oe(Ke.value,a=>(O(),R("button",{key:a.id,class:be(["deleted-marker",{"deleted-marker--dragging":xt.value?.markerId===a.id}]),type:"button",title:`Revitalise: ${a.title}`,"aria-label":`Revitalise deleted artifact ${a.title}`,style:Me({left:`${a.x}px`,top:`${a.y}px`}),onPointerdown:c=>Fu(c,a),onPointermove:zu,onPointerup:c=>ju(c,a)},[...o[56]||(o[56]=[x("span",null,"revitalise",-1)])],46,Bm))),128)),(O(!0),R(ee,null,Oe(H.value,a=>(O(),R("section",{key:a.id,ref_for:!0,ref:c=>zc(a.id,c),class:be(["artifact-card",[`artifact-card--kind-${a.kind}`,{"artifact-card--dragging":rt.value?.artifactId===a.id,"artifact-card--selected":z.value===a.id,"artifact-card--regenerating":l.value===a.id,"artifact-card--deleting":ye.value.includes(a.id),"artifact-card--nest-target":Ze.value===a.id,"artifact-card--has-children":at(a.id).length,"artifact-card--splitting":cn.value.includes(a.id),"artifact-card--fork-born":Pn.value.includes(a.id),"artifact-card--image-orb":a.kind==="image"&&!!a.content.imageUrl,"artifact-card--stale":_t.value.includes(a.id),"artifact-card--connect-target":Dt.value?.hoverTargetId===a.id,"artifact-card--lasso-candidate":Vc.value.includes(a.id),"artifact-card--constellation-source":kt.value?.artifactIds.includes(a.id),"artifact-card--runtime-error":!!Ec(a.id),"artifact-card--running":ce.value===a.id}]]),style:Me({left:`${a.x}px`,top:`${a.y}px`,width:`${a.width}px`,minHeight:`${fn(a)}px`,"--bubble-growth":at(a.id).length,...Fc(a),...$u(a)}),"data-artifact-id":a.id,tabindex:"0",role:ce.value===a.id?"dialog":void 0,"aria-modal":ce.value===a.id?"true":void 0,"aria-label":ce.value===a.id?`${a.title}. Live component run mode.`:a.kind==="component"?`${a.title}. Drag to move. Select, then activate again to run.`:`${a.title}. Drag to move.`,onPointerdown:c=>Ru(c,a),onPointermove:Du,onPointerup:Nu,onKeydown:c=>Lu(c,a),onContextmenu:D(c=>Fs(a),["stop","prevent"])},[a.kind==="component"&&z.value===a.id&&ce.value!==a.id?(O(),R("button",{key:0,class:"artifact-bloom-trigger",type:"button","aria-label":"Bloom this component into live run mode",onPointerdown:o[16]||(o[16]=D(()=>{},["stop"])),onPointermove:o[17]||(o[17]=D(()=>{},["stop"])),onPointerup:o[18]||(o[18]=D(()=>{},["stop"])),onClick:D(c=>Ls(a),["stop"])},[...o[57]||(o[57]=[x("span",{class:"artifact-bloom-trigger__seed","aria-hidden":"true"},[x("i"),x("i"),x("i")],-1),x("span",{class:"artifact-bloom-trigger__label"},"run live",-1)])],40,Vm)):Te("",!0),ce.value===a.id?(O(),R("button",{key:1,class:"artifact-run-close",type:"button","aria-label":"Return component to the canvas",onPointerdown:o[19]||(o[19]=D(()=>{},["stop"])),onPointermove:o[20]||(o[20]=D(()=>{},["stop"])),onPointerup:o[21]||(o[21]=D(()=>{},["stop"])),onClick:o[22]||(o[22]=D(c=>so(),["stop"]))},[...o[58]||(o[58]=[x("span",{"aria-hidden":"true"},"×",-1)])],32)):Te("",!0),x("div",Wm,X(l.value===a.id?"regenerating":a.kind)+" · "+X(a.createdAt),1),x("h2",null,X(a.title),1),x("div",{class:be(["artifact-content",`artifact-content--${a.kind}`])},[a.kind==="text"?(O(),R("p",qm,X(a.content.markdown||a.content.text||a.content.raw),1)):a.kind==="object"?(O(),R("div",Um,[x("div",Gm,[o[59]||(o[59]=x("span",null,"universal object",-1)),x("strong",null,X(a.content.description),1)]),x("div",Xm,[(O(!0),R(ee,null,Oe(a.content.tags??[],c=>(O(),R("span",{key:c},X(c),1))),128))]),x("div",Ym,[x("div",null,[o[60]||(o[60]=x("small",null,"inputs",-1)),(O(!0),R(ee,null,Oe(a.content.ports?.inputs??[],c=>(O(),R("span",{key:c.id},X(c.label),1))),128))]),x("div",null,[o[61]||(o[61]=x("small",null,"outputs",-1)),(O(!0),R(ee,null,Oe(a.content.ports?.outputs??[],c=>(O(),R("span",{key:c.id},X(c.label),1))),128))])])])):a.kind==="component"?(O(),R(ee,{key:2},[x("iframe",{class:"component-frame",title:"Sandboxed generated component",sandbox:"allow-scripts",scrolling:ce.value===a.id?"auto":"no",tabindex:ce.value===a.id?0:-1,"data-dot-artifact-id":a.id,srcdoc:uo(um)(a.content)},null,8,Km),eo(a.id)?(O(),R("button",{key:0,class:be(["component-runtime-error",{"component-runtime-error--repairing":ao(a.id)}]),type:"button",title:eo(a.id),"aria-label":`Repair ${a.title}. ${eo(a.id)}`,"aria-busy":ao(a.id),disabled:s.value||ao(a.id)||l.value===a.id||ye.value.includes(a.id),"aria-live":"polite",onPointerdown:o[23]||(o[23]=D(()=>{},["stop"])),onPointermove:o[24]||(o[24]=D(()=>{},["stop"])),onPointerup:o[25]||(o[25]=D(()=>{},["stop"])),onClick:D(c=>Ku(a),["stop"])},X(ao(a.id)?"mending graft…":"graft needs care · repair"),43,Jm)):Ai(a.id)?(O(),R("span",{key:1,class:"component-runtime-error component-runtime-error--connection",role:"status",title:Ai(a.id)}," connection needs care ",8,Zm)):Te("",!0)],64)):a.kind==="image"?(O(),R(ee,{key:3},[a.content.imageUrl?(O(),R("figure",Qm,[x("img",{src:a.content.imageUrl,alt:a.content.alt??a.title,draggable:"false"},null,8,eh)])):a.content.imageStatus==="pending"?(O(),R("div",{key:1,class:"image-preview image-preview--loading",role:"img","aria-label":`Generating image: ${a.content.alt??a.title}`},[...o[62]||(o[62]=[x("span",null,null,-1),x("p",null,"painting…",-1)])],8,th)):(O(),R("div",{key:2,class:"image-preview",role:"img","aria-label":a.content.alt??a.title},[o[63]||(o[63]=x("span",null,null,-1)),x("p",null,X(a.content.imagePrompt||a.content.description),1),a.content.imageStatus==="error"?(O(),R("button",{key:0,class:"image-preview__retry",type:"button",onPointerdown:o[26]||(o[26]=D(()=>{},["stop"])),onClick:D(c=>wu(a),["stop"])}," image failed · retry ",40,oh)):Te("",!0)],8,nh))],64)):a.kind==="video"?(O(),R("div",ih,[o[64]||(o[64]=x("span",{class:"video-preview__play"},"▶",-1)),x("ol",null,[(O(!0),R(ee,null,Oe(a.content.storyboard??[],c=>(O(),R("li",{key:c},X(c),1))),128))])])):(O(),R("p",rh,X(a.content.summary),1))],2),at(a.id).length?(O(),R("div",{key:2,class:"nested-bubbles","aria-label":"Nested bubbles",onPointerdown:o[27]||(o[27]=D(()=>{},["stop"]))},[(O(!0),R(ee,null,Oe(at(a.id),(c,m)=>(O(),R("button",{key:c.id,class:"nested-bubble",type:"button",title:`Open ${c.title}`,onClick:y=>ku(c,a,m)},[x("span",null,X(c.title),1),at(c.id).length?(O(),R("small",ah,X(at(c.id).length),1)):Te("",!0)],8,sh))),128))],32)):Ze.value===a.id?(O(),R("div",lh,"drop inside")):Te("",!0)],46,Hm))),128)),(O(!0),R(ee,null,Oe(Li.value,a=>(O(),R("div",{key:`meaning-${a.connection.id}`,class:be(["tendril-meaning",`tendril-meaning--${a.connection.status??"resting"}`]),style:Me({left:`${a.mid.x}px`,top:`${a.mid.y}px`}),title:ms(a.connection),onPointerdown:o[28]||(o[28]=D(()=>{},["stop"])),onPointerup:o[29]||(o[29]=D(()=>{},["stop"]))},[x("span",null,X(a.connection.meaning),1),x("small",null,X(ms(a.connection)),1),x("button",{type:"button","aria-label":`Sever connection: ${a.connection.meaning}`,onClick:D(c=>Uc(a.connection.id),["stop"])}," × ",8,uh)],46,ch))),128)),(O(!0),R(ee,null,Oe(H.value,a=>(O(),R(ee,{key:`breathe-${a.id}`},[_t.value.includes(a.id)&&l.value!==a.id&&!ye.value.includes(a.id)?(O(),R("button",{key:0,class:"breathe-badge",type:"button","aria-label":`Let ${a.title} absorb its changed connections`,style:Me({left:`${Qt(a).x}px`,top:`${a.y-20}px`}),onPointerdown:o[30]||(o[30]=D(()=>{},["stop"])),onPointermove:o[31]||(o[31]=D(()=>{},["stop"])),onPointerup:o[32]||(o[32]=D(()=>{},["stop"])),onClick:D(c=>Zc(a),["stop"])},[...o[65]||(o[65]=[x("span",null,"breathe",-1)])],44,dh)):Te("",!0)],64))),128)),et.value&&jo.value===et.value.id&&!gn.value.length?(O(),R(ee,{key:2},Oe(3,a=>x("span",{key:`seed-${a}`,class:"ghost-seed",style:Me({left:`${Es(et.value,a-1,3).x}px`,top:`${Es(et.value,a-1,3).y}px`,"--ghost-delay":`${(a-1)*240}ms`})},null,4)),64)):Te("",!0),(O(!0),R(ee,null,Oe(gn.value,(a,c)=>(O(),R("button",{key:mt(Ce.value.id,a),class:be(["ghost-suggestion",{"ghost-suggestion--queued":Nt.value.includes(mt(Ce.value.id,a)),"ghost-suggestion--creating":nn.value===`${Ce.value?.id}:batch`&&Nt.value.includes(mt(Ce.value.id,a)),"ghost-suggestion--waiting":nn.value&&!(nn.value===`${Ce.value?.id}:batch`&&Nt.value.includes(mt(Ce.value.id,a))),"ghost-suggestion--dragging":ft.value?.key===mt(Ce.value.id,a)}]),type:"button",title:a.reason,"aria-label":`Suggested artifact: ${a.title}. Drag to move; activate to queue.`,style:Me({left:`${Bo(Ce.value,a,c,gn.value.length).x}px`,top:`${Bo(Ce.value,a,c,gn.value.length).y}px`,"--ghost-delay":`${c*160}ms`}),onPointerdown:D(m=>eu(m,a,c),["stop"]),onPointermove:D(tu,["stop"]),onPointerup:D(nu,["stop"]),onPointercancel:D(ou,["stop"]),onLostpointercapture:D(iu,["stop"]),onDblclick:o[33]||(o[33]=D(()=>{},["stop"])),onClick:D(m=>ru(m,a),["stop"])},[x("span",null,X(a.title),1),x("small",null,X(a.kind),1),o[66]||(o[66]=x("i",{class:"orbit-moon orbit-moon--1","aria-hidden":"true"},null,-1)),o[67]||(o[67]=x("i",{class:"orbit-moon orbit-moon--2","aria-hidden":"true"},null,-1)),o[68]||(o[68]=x("i",{class:"orbit-moon orbit-moon--3","aria-hidden":"true"},null,-1))],46,ph))),128)),Ce.value&&io.value.length?(O(),R("button",{key:3,class:be(["ghost-weave",{"ghost-weave--creating":nn.value===`${Ce.value.id}:batch`}]),type:"button",disabled:s.value,title:`Create ${io.value.length} queued suggestions`,"aria-label":`Weave ${io.value.length} queued suggested artifacts`,style:Me({left:`${Ms(Ce.value).x}px`,top:`${Ms(Ce.value).y}px`}),onPointerdown:o[34]||(o[34]=D(()=>{},["stop"])),onPointermove:o[35]||(o[35]=D(()=>{},["stop"])),onPointerup:o[36]||(o[36]=D(()=>{},["stop"])),onDblclick:o[37]||(o[37]=D(()=>{},["stop"])),onClick:D(yu,["stop"])},[x("span",null,"weave "+X(io.value.length),1),o[69]||(o[69]=x("small",null,"make these together",-1))],46,fh)):Te("",!0),x("button",{class:be(["seed-dot",V.value]),style:Me({left:`${t.value.x}px`,top:`${t.value.y}px`}),type:"button","aria-label":"Create from this point",onPointerdown:Mu,onPointermove:Au,onPointerup:Tu},[...o[70]||(o[70]=[x("span",{class:"seed-dot__core"},null,-1),x("i",{class:"orbit-moon orbit-moon--1","aria-hidden":"true"},null,-1),x("i",{class:"orbit-moon orbit-moon--2","aria-hidden":"true"},null,-1),x("i",{class:"orbit-moon orbit-moon--3","aria-hidden":"true"},null,-1)])],38)],4),Ke.value.length?(O(),R("button",{key:1,class:"marker-control",type:"button",onPointerdown:o[38]||(o[38]=D(()=>{},["stop"])),onClick:od}," clear deleted dots ",32)):Te("",!0),x("div",{class:"theme-dots",onPointerdown:o[39]||(o[39]=D(()=>{},["stop"])),onPointerup:o[40]||(o[40]=D(()=>{},["stop"])),onDblclick:o[41]||(o[41]=D(()=>{},["stop"]))},[(O(),R(ee,null,Oe(P,a=>x("button",{key:a,class:be(["theme-dot",[`theme-dot--${a}`,{"theme-dot--active":K.value===a}]]),type:"button",title:a,"aria-label":`Switch to ${a} theme`,"aria-pressed":K.value===a,onClick:c=>K.value=a},null,10,mh)),64))],32),x("div",{class:"model-dock",onPointerdown:o[42]||(o[42]=D(()=>{},["stop"])),onPointermove:o[43]||(o[43]=D(()=>{},["stop"])),onPointerup:o[44]||(o[44]=D(()=>{},["stop"])),onDblclick:o[45]||(o[45]=D(()=>{},["stop"])),onWheel:o[46]||(o[46]=D(()=>{},["stop"]))},[x("button",{class:"generation-status generation-status--button",type:"button","aria-label":"Choose AI models","aria-expanded":Q.value,onClick:ot},X(nt.value),9,hh),Q.value?(O(),R("div",gh,[de.value?(O(),R(ee,{key:0},[x("div",vh,[o[71]||(o[71]=x("small",null,"artifacts",-1)),(O(!0),R(ee,null,Oe(de.value.textModels,a=>(O(),R("button",{key:a.id,type:"button",class:be(["model-picker__option",{"model-picker__option--active":a.id===W.value}]),title:a.id,onClick:c=>yt(a.id)},[x("span",null,X(uo(lr)(a.id)),1),x("small",null,X(uo(Pm)(a)),1)],10,bh))),128))]),x("div",yh,[o[72]||(o[72]=x("small",null,"images",-1)),(O(!0),R(ee,null,Oe(de.value.imageModels,a=>(O(),R("button",{key:a.id,type:"button",class:be(["model-picker__option",{"model-picker__option--active":a.id===ke.value}]),title:a.id,onClick:c=>Sn(a.id)},[x("span",null,X(uo(lr)(a.id)),1),a.id.endsWith(":free")?(O(),R("small",xh,"free")):Te("",!0)],10,wh))),128))])],64)):(O(),R("p",Ih,"model catalog unavailable"))])):Te("",!0)],32),o[83]||(o[83]=x("div",{class:"canvas-help"},[x("button",{class:"canvas-help__trigger",type:"button","aria-label":"Show canvas controls"},"?"),x("div",{class:"canvas-help__panel",role:"tooltip"},[x("span",null,"wheel zoom"),x("span",null,"drag background pan"),x("span",null,"second tap blooms a component"),x("span",null,"select + halo weave"),x("span",null,"right-click opens care"),x("span",null,"selected: E edit · I inspect · F fork"),x("span",null,"delete composts · escape folds"),x("span",null,"tendrils carry values"),x("span",null,"breathe absorbs changes"),x("span",null,"F fit"),x("span",null,"0 reset")])],-1)),ve.value?(O(),R("aside",{key:2,ref_key:"inspectorPanel",ref:h,class:be(["inspector-panel",{"inspector-panel--dragging":!!It.value}]),style:Me(pn.value),"aria-label":"Artifact inspector",onPointerdown:o[50]||(o[50]=D(()=>{},["stop"]))},[x("div",{class:"inspector-panel__actions",onPointerdown:o[48]||(o[48]=D(()=>{},["stop"]))},[x("button",{class:"inspector-panel__icon inspector-panel__icon--remove",type:"button","aria-label":"Remove artifact",title:"Remove artifact",onClick:o[47]||(o[47]=a=>zs(ve.value))}," × "),x("button",{class:"inspector-panel__icon",type:"button","aria-label":"Close inspector",onClick:qi},"×")],32),x("div",{class:"inspector-panel__header",onPointerdown:Bu,onPointermove:Hu,onPointerup:Ns,onPointercancel:Ns},[o[73]||(o[73]=x("div",{class:"inspector-panel__eyebrow"},"inspect",-1)),x("h2",null,X(ve.value.title),1)],32),x("dl",null,[x("div",null,[o[74]||(o[74]=x("dt",null,"type",-1)),x("dd",null,X(ve.value.kind),1)]),x("div",null,[o[75]||(o[75]=x("dt",null,"created",-1)),x("dd",null,X(ve.value.createdAt),1)]),x("div",null,[o[76]||(o[76]=x("dt",null,"prompt",-1)),x("dd",null,X(ve.value.prompt),1)]),x("div",null,[o[77]||(o[77]=x("dt",null,"purpose",-1)),x("dd",null,X(ve.value.content.purpose??"—"),1)]),x("div",null,[o[78]||(o[78]=x("dt",null,"parent",-1)),x("dd",null,X(xc(ve.value)?.title??"canvas"),1)]),x("div",null,[o[79]||(o[79]=x("dt",null,"contains",-1)),x("dd",null,X(at(ve.value.id).length),1)])]),x("form",{class:"inspector-panel__edit",onSubmit:D(Zu,["prevent"])},[Ji(x("input",{"onUpdate:modelValue":o[49]||(o[49]=a=>b.value=a),disabled:Pe.value,type:"text",placeholder:"change this artifact, or leave empty to regenerate",autocomplete:"off"},null,8,_h),[[rr,b.value]]),x("button",{type:"submit",disabled:Pe.value},X(ne.value),9,kh)],32),x("pre",null,X(st.value),1)],38)):Te("",!0),x("form",{class:be(["command-bar",{"command-bar--visible":i.value||s.value&&!nn.value&&!u.value.length}]),onSubmit:D(Ju,["prevent"])},[x("div",Sh,[o[80]||(o[80]=x("span",{class:"command-bar__dot"},null,-1)),x("span",null,X(s.value?"shaping...":p.value.type==="edit"?"artifact is listening":"origin is listening"),1)]),Ji(x("input",{ref_key:"promptInput",ref:v,"onUpdate:modelValue":o[51]||(o[51]=a=>d.value=a),disabled:s.value,placeholder:J.value,autocomplete:"off"},null,8,Ph),[[rr,d.value]]),x("button",{type:"submit",disabled:we.value},X(ae.value),9,Ch)],34)],38))}}),Oh="artifact-preview-lightbox",ur="data-dot-preview-inert-owned";let te=null,Zo=null,xn=null,Qo=null,Pr=null,Jn=null,jt=null;function Rh(e){return e?.$?.setupState??null}function nc(e){return Array.isArray(e.artifacts)?e.artifacts:[]}function Lh(e){const t=e.getAttribute("data-artifact-id");if(t)return t;const i=e.querySelector(".artifact-action-root")?.getAttribute("aria-controls");return i?.startsWith("artifact-")?i.slice(9):null}function oc(e){if(!Jn)return null;const t=Lh(e);return t?nc(Jn).find(n=>n.id===t)??null:null}function Un(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Dh(e){try{return JSON.stringify(e,null,2)}catch{return String(e)}}function Jr(e){return e.markdown||e.text||e.summary||e.description||e.raw||""}function Nh(){return te&&Zo&&xn&&Qo?{lightbox:te,titleEl:Zo,bodyEl:xn,eyebrowEl:Qo}:(te=document.createElement("div"),te.className=Oh,te.setAttribute("role","dialog"),te.setAttribute("aria-modal","true"),te.setAttribute("aria-labelledby","artifact-preview-lightbox-title"),te.setAttribute("aria-hidden","true"),te.setAttribute("inert",""),te.innerHTML=`
    <button class="artifact-preview-lightbox__backdrop" type="button" aria-label="Close preview"></button>
    <section class="artifact-preview-lightbox__shell" tabindex="-1">
      <header class="artifact-preview-lightbox__header">
        <span class="artifact-preview-lightbox__eyebrow"><i aria-hidden="true"></i><span>preview</span></span>
        <strong class="artifact-preview-lightbox__title" id="artifact-preview-lightbox-title"></strong>
        <button class="artifact-preview-lightbox__close" type="button" aria-label="Fold back into the canvas">
          <span aria-hidden="true">×</span><small>fold</small>
        </button>
      </header>
      <div class="artifact-preview-lightbox__body"></div>
    </section>
  `,Zo=te.querySelector(".artifact-preview-lightbox__title"),xn=te.querySelector(".artifact-preview-lightbox__body"),Qo=te.querySelector(".artifact-preview-lightbox__eyebrow span"),document.body.appendChild(te),te.addEventListener("click",e=>{e.target?.closest(".artifact-preview-lightbox__close, .artifact-preview-lightbox__backdrop")&&sc()}),{lightbox:te,titleEl:Zo,bodyEl:xn,eyebrowEl:Qo})}function ic(e){if(te){if(!e){document.querySelectorAll(`[${ur}]`).forEach(t=>{t.removeAttribute("inert"),t.removeAttribute(ur)});return}Array.from(document.body.children).forEach(t=>{t===te||t.hasAttribute("inert")||(t.setAttribute("inert",""),t.setAttribute(ur,""))})}}function rc(){te?.querySelector(".artifact-preview-lightbox__shell")?.focus({preventScroll:!0})}function Fh(e){te?.classList.contains("artifact-preview-lightbox--open")&&(e.target instanceof Node&&te.contains(e.target)||rc())}function zh(e,t){const n=document.createElement("article");n.className="artifact-preview-lightbox__reader";const i=Jr(t);n.innerHTML=Un(i||"No readable text available.").replace(/\n{2,}/g,"</p><p>").replace(/\n/g,"<br>"),n.innerHTML.startsWith("<p>")||(n.innerHTML=`<p>${n.innerHTML}</p>`),e.appendChild(n)}function jh(e,t){const n=document.createElement("section");n.className="artifact-preview-lightbox__object";const i=Jr(t),s=Array.isArray(t.tags)?t.tags:[],l={data:t.data??null,ports:t.ports??null};n.innerHTML=`
    <article class="artifact-preview-lightbox__reader artifact-preview-lightbox__reader--object">
      <p>${Un(i||"No object description available.")}</p>
      ${s.length?`<div class="artifact-preview-lightbox__tags">${s.map(u=>`<span>${Un(u)}</span>`).join("")}</div>`:""}
    </article>
    <pre class="artifact-preview-lightbox__json">${Un(Dh(l))}</pre>
  `,e.appendChild(n)}function Bh(e,t){const n=document.createElement("section");n.className="artifact-preview-lightbox__video";const i=Array.isArray(t.storyboard)?t.storyboard:[];n.innerHTML=`
    <div class="artifact-preview-lightbox__video-symbol">▶</div>
    <article class="artifact-preview-lightbox__reader">
      <p>${Un(Jr(t)||"Video concept preview.")}</p>
      ${i.length?`<ol>${i.map(s=>`<li>${Un(s)}</li>`).join("")}</ol>`:""}
    </article>
  `,e.appendChild(n)}function Hh(e){if(!te||!e){te?.style.setProperty("--bloom-origin-x","50%"),te?.style.setProperty("--bloom-origin-y","50%");return}const t=e.getBoundingClientRect(),n=(t.left+t.width/2)/Math.max(window.innerWidth,1)*100,i=(t.top+t.height/2)/Math.max(window.innerHeight,1)*100;te.style.setProperty("--bloom-origin-x",`${Math.max(4,Math.min(96,n))}%`),te.style.setProperty("--bloom-origin-y",`${Math.max(4,Math.min(96,i))}%`)}function Zr(e,t){const n=Nh(),i=e.content??{raw:""},s=e.title||"Artifact preview";Pr=document.activeElement instanceof HTMLElement?document.activeElement:null,Hh(t),n.titleEl.textContent=s,n.eyebrowEl.textContent="preview",n.bodyEl.innerHTML="",n.lightbox.scrollTop=0,e.kind==="object"?jh(n.bodyEl,i):e.kind==="video"?Bh(n.bodyEl,i):zh(n.bodyEl,i),n.lightbox.classList.add("artifact-preview-lightbox--open"),n.lightbox.removeAttribute("inert"),n.lightbox.setAttribute("aria-hidden","false"),ic(!0),document.documentElement.classList.add("artifact-preview-lightbox-open"),window.requestAnimationFrame(rc)}function sc(){!te||!xn||(te.classList.remove("artifact-preview-lightbox--open"),te.setAttribute("inert",""),te.setAttribute("aria-hidden","true"),ic(!1),document.documentElement.classList.remove("artifact-preview-lightbox-open"),Pr?.focus({preventScroll:!0}),Pr=null,window.setTimeout(()=>{!te?.classList.contains("artifact-preview-lightbox--open")&&xn&&(xn.innerHTML="")},420))}function La(e){return document.querySelector(".workspace--weave-targeting")?!0:!!e.closest(".artifact-action-system, .artifact-action-root, .artifact-action, .weave-halo, .nested-bubbles, .deleted-marker, .image-lightbox, .artifact-preview-lightbox, button, input, textarea, select")}function Da(e){const t=e.closest(".artifact-card");return!t||t.classList.contains("artifact-card--kind-image")||!oc(t)?null:t}function Vh(e){const t=e.detail;if(!t||typeof t.artifactId!="string"||!Jn)return;const n=nc(Jn).find(i=>i.id===t.artifactId);!n||n.kind==="component"||Zr(n,t.origin instanceof Element?t.origin:null)}function Wh(e,t){if(!e.id){Zr(e,t);return}document.dispatchEvent(new CustomEvent("dot:open-artifact",{detail:{artifactId:e.id,origin:t??void 0}}))}function qh(e){if(Jn=Rh(e),!Jn){console.warn("[dot:preview] setup state unavailable; preview lightbox disabled");return}document.addEventListener("dot:open-artifact",Vh),document.addEventListener("focusin",Fh),document.addEventListener("pointerdown",t=>{const n=t.target;if(!(n instanceof Element)||La(n))return;const i=Da(n);i&&(jt={card:i,pointerId:t.pointerId,startX:t.clientX,startY:t.clientY,moved:!1,wasSelected:i.classList.contains("artifact-card--selected")&&i.dataset.openSuppressed!=="true"})},!0),document.addEventListener("pointermove",t=>{!jt||jt.pointerId!==t.pointerId||Math.hypot(t.clientX-jt.startX,t.clientY-jt.startY)>8&&(jt.moved=!0)},!0),document.addEventListener("pointerup",t=>{const n=jt;if(jt=null,!n||n.pointerId!==t.pointerId||n.moved)return;const i=t.target;if(!(i instanceof Element)||La(i))return;const s=Da(i);if(!s||s!==n.card)return;const l=oc(s);l?.kind==="component"&&!n.wasSelected||(l?.kind==="component"?Wh(l,s):l&&Zr(l,s))},!0),document.addEventListener("pointercancel",()=>{jt=null}),document.addEventListener("keydown",t=>{t.key==="Escape"&&te?.classList.contains("artifact-preview-lightbox--open")&&(t.preventDefault(),sc())})}const ac=.26,lc=2.4;function Uh(e){return e?.$?.setupState??null}function cc(e,t,n){return Math.min(n,Math.max(t,e))}function Gh(e){const t=e.camera;return{x:Number.isFinite(t?.x)?Number(t?.x):0,y:Number.isFinite(t?.y)?Number(t?.y):0,zoom:Number.isFinite(t?.zoom)?Number(t?.zoom):1}}function Xh(e,t){e.camera={x:t.x,y:t.y,zoom:cc(t.zoom,ac,lc)}}function Yh(e,t){return{x:(e.x-t.x)/t.zoom,y:(e.y-t.y)/t.zoom}}function Kh(e){if(document.documentElement.classList.contains("artifact-run-open"))return!0;const t=e.target;return t instanceof HTMLElement?!!t.closest(".model-picker, .canvas-help__panel, .inspector-panel, .image-lightbox, .artifact-preview-lightbox, textarea, select"):!0}function Jh(e){const t=Uh(e);if(!t){console.warn("[dot:zoom] setup state unavailable; wheel zoom disabled");return}document.addEventListener("wheel",n=>{if(Kh(n))return;n.preventDefault();const i=Gh(t),s={x:n.clientX,y:n.clientY},l=Yh(s,i),u=Math.max(-120,Math.min(120,n.deltaY)),d=cc(i.zoom*Math.exp(-u*.0018),ac,lc);Xh(t,{x:s.x-l.x*d,y:s.y-l.y*d,zoom:d})},{capture:!0,passive:!1})}const uc=.26,dc=2.4;function Zh(e){return e?.$?.setupState??null}function pc(e,t,n){return Math.min(n,Math.max(t,e))}function Qh(e){const t=e.camera;return{x:Number.isFinite(t?.x)?Number(t?.x):0,y:Number.isFinite(t?.y)?Number(t?.y):0,zoom:Number.isFinite(t?.zoom)?Number(t?.zoom):1}}function eg(e,t){e.camera={x:t.x,y:t.y,zoom:pc(t.zoom,uc,dc)}}function Na(e,t){return Math.max(1,Math.hypot(e.clientX-t.clientX,e.clientY-t.clientY))}function Fa(e,t){return{x:(e.clientX+t.clientX)/2,y:(e.clientY+t.clientY)/2}}function tg(e,t){return{x:(e.x-t.x)/t.zoom,y:(e.y-t.y)/t.zoom}}function ng(e){if(document.documentElement.classList.contains("artifact-run-open"))return!0;const t=e.target;return t instanceof HTMLElement?!!t.closest(".command-bar, .model-dock, .model-picker, .github-save-dock, .canvas-help, .theme-dots, .inspector-panel, .ghost-suggestion, input, textarea, select"):!0}function za(e){e.panState=null,e.dotDragState=null,e.artifactDragState=null,e.deletedMarkerDragState=null,e.inspectorDragState=null,e.connectDragState=null,e.suggestionDragState=null,e.lassoState=null,e.constellation=null,e.dropTargetArtifactId=null}function og(e){const t=Zh(e);if(!t){console.warn("[dot:mobile] setup state unavailable; mobile gestures disabled");return}const n=t;let i=null;function s(d){if(d.touches.length<2||ng(d))return;const p=d.touches[0],v=d.touches[1],h=Qh(n),b=Fa(p,v);za(n),i={startDistance:Na(p,v),startMidpoint:b,startCamera:h,startWorldAtMidpoint:tg(b,h)},document.documentElement.classList.add("mobile-canvas-gesture-active"),d.preventDefault(),d.stopPropagation()}function l(d){if(!i)return;if(document.documentElement.classList.contains("artifact-run-open")){u();return}if(d.touches.length<2){u();return}const p=d.touches[0],v=d.touches[1],h=Fa(p,v),b=pc(i.startCamera.zoom*(Na(p,v)/i.startDistance),uc,dc);eg(n,{x:h.x-i.startWorldAtMidpoint.x*b,y:h.y-i.startWorldAtMidpoint.y*b,zoom:b}),za(n),d.preventDefault(),d.stopPropagation()}function u(){i=null,document.documentElement.classList.remove("mobile-canvas-gesture-active")}document.addEventListener("touchstart",s,{capture:!0,passive:!1}),document.addEventListener("touchmove",l,{capture:!0,passive:!1}),document.addEventListener("touchend",u,{capture:!0,passive:!1}),document.addEventListener("touchcancel",u,{capture:!0,passive:!1})}const fc="dot:save-token",ig=12e3,rg=64e3;function Gn(e){return JSON.parse(JSON.stringify(e??null))}function sg(e){return e?.$?.setupState??null}function ai(e){return Array.isArray(e)?e:[]}function mc(e,t){const n=e;return{x:Number.isFinite(n?.x)?Number(n?.x):t.x,y:Number.isFinite(n?.y)?Number(n?.y):t.y}}function hc(e){const t=e;return{x:Number.isFinite(t?.x)?Number(t?.x):0,y:Number.isFinite(t?.y)?Number(t?.y):0,zoom:Number.isFinite(t?.zoom)?Number(t?.zoom):1}}function gc(e){const t=Gn(e),n=t.content?.imageUrl;if(typeof n=="string"&&(n.startsWith("data:")||n.length>ig)&&(delete t.content.imageUrl,t.content.imageStatus==="ready"&&delete t.content.imageStatus),t.content?.imageStatus==="pending"&&delete t.content.imageStatus,t.runtime){const i=s=>Object.fromEntries(Object.entries(s).filter(([,l])=>{try{const u=JSON.stringify(l);return u.length<=rg&&!u.includes('"data:')}catch{return!1}}));t.runtime.inputs=i(t.runtime.inputs),t.runtime.outputs=i(t.runtime.outputs)}return t}function ag(e){const t=Gn(e);return t.artifact=gc(t.artifact),t}function lg(e){return{version:1,savedAt:new Date().toISOString(),dot:mc(e.dot,{x:0,y:0}),camera:hc(e.camera),artifacts:ai(e.artifacts).map(gc),deletedMarkers:ai(e.deletedMarkers).map(ag),connections:ai(e.connections).map(t=>Gn(t)),selectedArtifactId:typeof e.selectedArtifactId=="string"?e.selectedArtifactId:null,theme:typeof e.theme=="string"?e.theme:null}}function cg(e){const t=e;return!!(t&&t.version===1&&Array.isArray(t.artifacts))}function Cr(e){e.panState=null,e.dotDragState=null,e.artifactDragState=null,e.deletedMarkerDragState=null,e.inspectorDragState=null,e.connectDragState=null,e.suggestionDragState=null,e.lassoState=null,e.constellation=null,e.dropTargetArtifactId=null,document.documentElement.classList.remove("mobile-canvas-gesture-active")}function ug(e){let t=!1,n=0;const i=()=>!!(e.isGenerating||e.regeneratingArtifactId||e.creatingSuggestionKey),s=()=>{const u=i();(u||t)&&Cr(e),t=u,n=requestAnimationFrame(s)},l=()=>{i()||Cr(e)};n=requestAnimationFrame(s),document.addEventListener("pointerup",l),document.addEventListener("pointercancel",l),window.addEventListener("blur",l),window.addEventListener("beforeunload",()=>{cancelAnimationFrame(n),document.removeEventListener("pointerup",l),document.removeEventListener("pointercancel",l),window.removeEventListener("blur",l)},{once:!0})}function dg(e,t){e.dot=mc(t.dot,{x:0,y:0}),e.camera=hc(t.camera),e.artifacts=Gn(t.artifacts??[]),e.deletedMarkers=Gn(t.deletedMarkers??[]),e.connections=Gn(t.connections??[]),e.selectedArtifactId=t.selectedArtifactId??null,e.activeActionArtifactId=null,e.inspectedArtifactId=null,e.deletingArtifactIds=[],Cr(e),typeof t.theme=="string"&&typeof e.theme=="string"&&(e.theme=t.theme)}function lt(e,t,n="idle"){const i=e.querySelector(".dot-control-center__status, .github-save-dock__status");i&&(i.textContent=t,i.dataset.tone=n)}async function vc(e){return e.json().catch(()=>null)}async function pg(){const e=await fetch("/api/canvas",{method:"GET",headers:{Accept:"application/json"}}),t=await vc(e);if(!e.ok)throw new Error(String(t?.error||`Canvas load failed with ${e.status}`));return t}async function ja(e,t){const n=await fetch("/api/canvas",{method:"POST",headers:{"Content-Type":"application/json",...t?{"X-Dot-Save-Token":t}:{}},body:JSON.stringify({snapshot:e})}),i=await vc(n);if(!n.ok){const s=typeof i?.detail=="string"?`: ${i.detail.slice(0,220)}`:"",l=new Error(String(i?.error||`Canvas save failed with ${n.status}`)+s);throw l.status=n.status,l}return i}function fg(){try{return localStorage.getItem(fc)||""}catch{return""}}function mg(e){try{e&&localStorage.setItem(fc,e)}catch{}}function hg(){const e=document.createElement("div");return e.className="dot-control-center",e.innerHTML=`
    <button class="dot-control-center__trigger" type="button" data-action="toggle-controls" aria-label="Canvas settings" aria-expanded="false">?</button>
    <div class="dot-control-center__panel" role="dialog" aria-label="Canvas controls">
      <div class="dot-control-center__section">
        <small>world</small>
        <div class="dot-control-center__themes" aria-label="Theme selection">
          <button class="dot-control-theme dot-control-theme--nature" type="button" data-action="theme" data-theme-name="nature" aria-label="Nature theme"></button>
          <button class="dot-control-theme dot-control-theme--technical" type="button" data-action="theme" data-theme-name="technical" aria-label="Technical theme"></button>
          <button class="dot-control-theme dot-control-theme--space" type="button" data-action="theme" data-theme-name="space" aria-label="Space theme"></button>
        </div>
      </div>
      <div class="dot-control-center__section">
        <small>model</small>
        <button class="dot-control-center__button" type="button" data-action="model">choose model</button>
      </div>
      <div class="dot-control-center__section">
        <small>snapshot</small>
        <div class="dot-control-center__row">
          <button class="dot-control-center__button" type="button" data-action="save">save</button>
          <button class="dot-control-center__button" type="button" data-action="load">load</button>
        </div>
        <span class="dot-control-center__status" data-tone="idle">not saved</span>
      </div>
      <div class="dot-control-center__section dot-control-center__help">
        <small>canvas</small>
        <span>wheel/pinch zoom</span>
        <span>drag background pan</span>
        <span>F fit · 0 reset</span>
      </div>
    </div>
  `,document.body.appendChild(e),e}function gg(e){document.querySelector(`.theme-dot--${e}`)?.click()}function vg(){const e=document.querySelector(".generation-status--button");e?.getAttribute("aria-expanded")!=="true"&&e?.click()}function bg(e){og(e),Jh(e),qh(e);const t=sg(e);if(!t){console.warn("[dot:canvas] setup state unavailable; canvas persistence dock disabled");return}const n=t;ug(n);const i=hg(),s=i.querySelector(".dot-control-center__trigger");function l(v){i.classList.toggle("dot-control-center--open",v),s?.setAttribute("aria-expanded",String(v))}function u(){l(!1),s?.blur()}async function d(v){try{lt(i,v?"loading…":"checking…","busy");const b=(await pg())?.snapshot;if(!cg(b)){lt(i,"no snapshot yet","idle");return}const P=ai(n.artifacts);if(v&&P.length&&!confirm("Load saved GitHub canvas and replace the current canvas?")){lt(i,"load cancelled","idle");return}if(!v&&P.length){lt(i,"local canvas active","idle");return}dg(n,b),lt(i,`loaded ${b.artifacts.length}`,"good")}catch(h){console.warn("[dot:canvas] load failed",h),lt(i,h instanceof Error?h.message:"load failed","bad")}}async function p(){try{if(n.isGenerating||n.regeneratingArtifactId){lt(i,"wait for creation","busy");return}const v=lg(n);lt(i,`saving ${v.artifacts.length}…`,"busy");try{const h=await ja(v,fg());lt(i,`saved ${v.artifacts.length}`,"good"),console.info("[dot:canvas] saved snapshot",h)}catch(h){if(h.status!==401)throw h;const P=prompt("DOT_SAVE_TOKEN for saving this canvas:")?.trim();if(!P){lt(i,"save needs token","bad");return}mg(P);const L=await ja(v,P);lt(i,`saved ${v.artifacts.length}`,"good"),console.info("[dot:canvas] saved snapshot",L)}}catch(v){console.warn("[dot:canvas] save failed",v),lt(i,v instanceof Error?v.message:"save failed","bad")}}i.addEventListener("click",v=>{const b=v.target?.closest("button"),P=b?.dataset.action;if(P==="toggle-controls"){l(!i.classList.contains("dot-control-center--open"));return}P==="theme"&&gg(b?.dataset.themeName??"nature"),P==="model"&&vg(),P==="save"&&p(),P==="load"&&d(!0)}),document.addEventListener("pointerdown",v=>{const h=v.target;h instanceof Node&&i.classList.contains("dot-control-center--open")&&(i.contains(h)||u())},!0),document.addEventListener("keydown",v=>{v.key==="Escape"&&i.classList.contains("dot-control-center--open")&&(v.preventDefault(),u())}),window.setTimeout(()=>{d(!1)},250)}const yg="image-lightbox",wg=".image-result img";let Le=null,In=null,ei=null,Bt=null;function xg(){return Le&&In&&ei?{lightbox:Le,image:In,caption:ei}:(Le=document.createElement("div"),Le.className=yg,Le.setAttribute("role","dialog"),Le.setAttribute("aria-modal","true"),Le.setAttribute("aria-label","Enlarged generated image"),Le.innerHTML=`
    <button class="image-lightbox__backdrop" type="button" aria-label="Close enlarged image"></button>
    <figure class="image-lightbox__frame">
      <img class="image-lightbox__image" alt="" draggable="false" />
      <figcaption class="image-lightbox__caption"></figcaption>
      <button class="image-lightbox__close" type="button" aria-label="Close enlarged image">×</button>
    </figure>
  `,In=Le.querySelector(".image-lightbox__image"),ei=Le.querySelector(".image-lightbox__caption"),document.body.appendChild(Le),Le.addEventListener("click",e=>{e.target?.closest(".image-lightbox__close, .image-lightbox__backdrop")&&bc()}),{lightbox:Le,image:In,caption:ei})}function Ig(e){const t=xg();t.image.src=e.currentSrc||e.src,t.image.alt=e.alt||"Generated image",t.caption.textContent=e.alt||"",t.lightbox.classList.add("image-lightbox--open"),document.documentElement.classList.add("image-lightbox-open"),t.lightbox.querySelector(".image-lightbox__close")?.focus({preventScroll:!0})}function bc(){!Le||!In||(Le.classList.remove("image-lightbox--open"),document.documentElement.classList.remove("image-lightbox-open"),window.setTimeout(()=>{!Le?.classList.contains("image-lightbox--open")&&In&&In.removeAttribute("src")},180))}function Ba(e){return!!e.closest(".artifact-action-system, .artifact-action-root, .artifact-action, .weave-halo, .nested-bubbles, .deleted-marker, .image-lightbox, .artifact-preview-lightbox, button, input, textarea, select")}function yc(e){return e.querySelector(wg)}function Ha(e){const t=e.closest(".artifact-card--kind-image");return!t||!yc(t)?null:t}function _g(){document.addEventListener("pointerdown",e=>{const t=e.target;if(!(t instanceof Element)||Ba(t))return;const n=Ha(t);n&&(Bt={card:n,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,moved:!1})},!0),document.addEventListener("pointermove",e=>{!Bt||Bt.pointerId!==e.pointerId||Math.hypot(e.clientX-Bt.startX,e.clientY-Bt.startY)>8&&(Bt.moved=!0)},!0),document.addEventListener("pointerup",e=>{const t=Bt;if(Bt=null,!t||t.pointerId!==e.pointerId||t.moved)return;const n=e.target;if(!(n instanceof Element)||Ba(n))return;const i=Ha(n);if(!i||i!==t.card)return;const s=yc(i);s&&Ig(s)},!0),document.addEventListener("pointercancel",()=>{Bt=null}),document.addEventListener("keydown",e=>{e.key==="Escape"&&Le?.classList.contains("image-lightbox--open")&&(e.preventDefault(),bc())})}function kg(e){const t=e.getBoundingClientRect(),n=t.left+t.width/2,i=t.top+t.height/2;requestAnimationFrame(()=>{requestAnimationFrame(()=>{const s=document.querySelector(".inspector-panel");if(!s)return;const l=s.getBoundingClientRect();s.style.setProperty("--inspector-origin-local-x",`${n-l.left}px`),s.style.setProperty("--inspector-origin-local-y",`${i-l.top}px`),s.classList.remove("inspector-panel--from-icon"),s.offsetWidth,s.classList.add("inspector-panel--from-icon")})})}function Sg(){document.addEventListener("click",e=>{const t=e.target;if(!(t instanceof Element))return;const n=t.closest(".artifact-action--inspect");n&&kg(n)},!0)}const Pg=6,Cg=220;let Ye=null,_o=null;function wc(){_o!==null&&(window.clearTimeout(_o),_o=null)}function Eg(e){return e instanceof Element?e.closest(".artifact-card"):null}function Mg(e){return e instanceof Element&&!!e.closest(".artifact-action-system")}function Ag(e){return e.classList.contains("artifact-card--selected")&&e.dataset.openSuppressed!=="true"}function Qr(e){e.dataset.openSuppressed="true"}function Tg(e){delete e.dataset.openSuppressed}document.addEventListener("pointerdown",e=>{if(Mg(e.target))return;const t=Eg(e.target);if(!t)return;wc();const n=Ag(t);Ye={element:t,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,moved:!1,wasVisuallyOpen:n},n||Qr(t)},!0);document.addEventListener("pointermove",e=>{if(!Ye||Ye.pointerId!==e.pointerId)return;Math.abs(e.clientX-Ye.startX)+Math.abs(e.clientY-Ye.startY)>Pg&&(Ye.moved=!0)},!0);document.addEventListener("pointerup",e=>{if(!Ye||Ye.pointerId!==e.pointerId)return;const t=Ye;if(Ye=null,!t.wasVisuallyOpen){if(t.moved){Qr(t.element);return}wc(),_o=window.setTimeout(()=>{Tg(t.element),_o=null},Cg)}},!0);document.addEventListener("pointercancel",e=>{!Ye||Ye.pointerId!==e.pointerId||(Qr(Ye.element),Ye=null)},!0);Sg();_g();const $g=Tf($h),Og=$g.mount("#app");bg(Og);
