(()=>{var e={};e.id=405,e.ids=[405,888],e.modules={7334:e=>{e.exports={nav:"Home_nav__KViFq",container:"Home_container__d256j",main:"Home_main__VkIEL",footer:"Home_footer__yFiaX",title:"Home_title__hYX6j",description:"Home_description__uXNdx",code:"Home_code__VVrIr",grid:"Home_grid__AVljO",card:"Home_card__E5spL",logo:"Home_logo__IOQAX"}},1725:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{config:()=>g,default:()=>u,getServerSideProps:()=>f,getStaticPaths:()=>p,getStaticProps:()=>m,reportWebVitals:()=>h,routeModule:()=>j,unstable_getServerProps:()=>y,unstable_getServerSideProps:()=>w,unstable_getStaticParams:()=>v,unstable_getStaticPaths:()=>b,unstable_getStaticProps:()=>x});var s=r(7093),n=r(5244),a=r(1323),o=r(4494),l=r(4926),d=r(9828),c=e([l,d]);[l,d]=c.then?(await c)():c;let u=(0,a.l)(d,"default"),m=(0,a.l)(d,"getStaticProps"),p=(0,a.l)(d,"getStaticPaths"),f=(0,a.l)(d,"getServerSideProps"),g=(0,a.l)(d,"config"),h=(0,a.l)(d,"reportWebVitals"),x=(0,a.l)(d,"unstable_getStaticProps"),b=(0,a.l)(d,"unstable_getStaticPaths"),v=(0,a.l)(d,"unstable_getStaticParams"),y=(0,a.l)(d,"unstable_getServerProps"),w=(0,a.l)(d,"unstable_getServerSideProps"),j=new s.PagesRouteModule({definition:{kind:n.x.PAGES,page:"/index",pathname:"/",bundlePath:"",filename:""},components:{App:l.default,Document:o.default},userland:d});i()}catch(e){i(e)}})},1982:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.d(t,{Z:()=>d});var s=r(997);r(6689);var n=r(5675),a=r.n(n),o=r(5711);r(5379),r(7385);var l=e([o]);function d({sectionCopy:e}){return(0,s.jsxs)(s.Fragment,{children:[s.jsx("div",{className:"absolute w-screen h-screen z-20 lg:text-[5.25rem] text-[2.5rem]",id:"about",children:s.jsx("div",{className:"w-screen lg:h-screen flex content-center justify-center px-24 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 md:mt-24",children:e&&e[0]&&e[0].body&&e[0].body[0]&&e[0].body[0].children&&e[0].body[0].children[0]?s.jsx("p",{className:"font-Headline font-bold",children:e[0].body[0].children[0].text}):s.jsx("p",{className:"font-Headline font-bold",children:"Content not available"})})}),s.jsx("div",{className:"w-screen h-screen object-cover",children:s.jsx(a(),{alt:"Two photos of the artist Stak on vintage film that looks like its burning",src:"https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-about-page.png",layout:"responsive",width:1440,height:900})})]})}o=(l.then?(await l)():l)[0],i()}catch(e){i(e)}})},3705:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.d(t,{Z:()=>s.Z});var s=r(1982),n=e([s]);s=(n.then?(await n)():n)[0],i()}catch(e){i(e)}})},3744:(e,t,r)=>{"use strict";r(997),r(5675)},5755:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.d(t,{Z:()=>f});var s=r(997),n=r(6689),a=r(540),o=r.n(a),l=r(7152),d=r.n(l),c=r(7833),u=r(1320),m=r.n(u),p=e([c]);function f(e){let t=e?.videoPreLink?.musicLink?.map(e=>{switch(e?.description){case"ALLOW IT, BELIEVE IT (2022)":e.order=1;break;case"BIG STAK, BIG STAK OOOOHHH!!!!! (2021)":e.order=2;break;case"FOODSAVERS (2021)":e.order=3;break;case"24/7 (2021)":e.order=4;break;case"STAK ‘N EASY (2021)":e.order=5;break;case"TEDDY EP (2020)":e.order=6;break;case"777 (2016)":e.order=7}return e})?.sort((e,t)=>e.order-t.order)||[],[r,i]=(0,n.useState)(s.jsx("div",{className:"text-9xl flex flex-col justify-center items-center",children:t.map((e,t)=>(0,s.jsxs)("div",{className:"album-div flex flex-col items-center justify-center",onClick:()=>a(),children:[s.jsx("p",{className:"rounded-lg text-2xl w-1/2 mb-3 font-Headline text-white",children:e?.description}),s.jsx("div",{className:"flex flex-col items-center drop-shadow-2xl",children:s.jsx("img",{className:"bg-black/20 z-30 mb-8 w-1/2 h-auto transition-all hover:border-red-400/50 hover:scale-75 border-black/50 border-8 rounded-lg ease-linear duration-500",id:"album",src:(0,c.u)(e?.image)||"/images/placeholder.png",alt:e?.description||"Album image"})})]},t))}));function a(){i(s.jsx("div",{className:"flex items-center justify-center flex-wrap gap-x-12",children:t.map((e,t)=>s.jsx("div",{className:"album div w-96 mb-12",dangerouslySetInnerHTML:{__html:m().sanitize(e?.body?.[0]?.children?.[0]?.text||"No content")}},t))})),d()({targets:".album-div",translateX:[-10,0],duration:2e3,easing:"easeOutQuad"})}let l=e?.videoPreLink?.heroLink?.[0]?.url,u=l?o()(l):null,p=u?`https://www.youtube.com/embed/${u}`:"",[f,g]=(0,n.useState)(!1);return(0,s.jsxs)(s.Fragment,{children:[f?s.jsx("img",{src:"/stak-tape.png",className:"mb-12 -z-5",alt:"Stak tape"}):s.jsx("video",{className:"vid sticky top-0 w-screen h-screen z-10",src:"https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/smoke-transition-bg.mp4",muted:!0}),(0,s.jsxs)("div",{className:"parallax-container flex flex-col items-center justify-center w-full h-full z-10",children:[(0,s.jsxs)("div",{className:"z-30 flex flex-col items-center justify-center mb-20 w-screen",children:[s.jsx("div",{className:"mb-12 rounded-lg",children:s.jsx("p",{className:"text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold",id:"LOOK",children:"LOOK"})}),s.jsx("iframe",{className:"w-3/4 h-screen border-8 border-black/50",src:p,title:"YouTube video player",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",modestbranding:"1",frameBorder:"0"})]}),s.jsx("div",{className:"w-screen grid-container px-12 mt-12 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:grid-cols-2 z-50",children:e?.videoPreLink?.vidLink?.map((e,t)=>{let r=e?.url,i=o()(r),n=`https://www.youtube.com/embed/${i}`;return s.jsx("iframe",{className:"w-full z-50 border-8 border-black/50 rounded-lg",src:n,width:500,height:500,alt:"video",allow:"fullscreen"},t)})}),(0,s.jsxs)("div",{className:"w-3/4 flex mt-12 gap-y-12 flex-col items-center z-30",children:[s.jsx("div",{className:"mb-12 rounded-lg flex items-center justify-center w-1/2",children:s.jsx("p",{className:"text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold",id:"LISTEN",children:"LISTEN"})}),s.jsx("div",{onClick:a,children:r})]})]})]})}c=(p.then?(await p)():p)[0],i()}catch(e){i(e)}})},2504:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.d(t,{Z:()=>s.Z});var s=r(5755),n=e([s]);s=(n.then?(await n)():n)[0],i()}catch(e){i(e)}})},7166:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});var i=r(997);function s(){return i.jsx("div",{className:"bg-black h-max mb-28",children:(0,i.jsxs)("div",{className:"mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:py-16 lg:px-8",children:[(0,i.jsxs)("div",{className:"lg:w-0 lg:flex-1",children:[i.jsx("h2",{className:"text-3xl font-bold font-Headline tracking-tight text-white sm:text-4xl",id:"newsletter-headline",children:"GET MORE ALL7Z"}),i.jsx("p",{className:"mt-3 max-w-3xl text-lg leading-6 text-gray-300 font-Headline",children:"SIGN UP TO HEAR MORE FROM US"})]}),i.jsx("div",{className:"mt-8 lg:mt-0 lg:ml-8",children:(0,i.jsxs)("form",{name:"newsletter",method:"POST",className:"sm:flex","data-netlify":"true",children:[i.jsx("input",{type:"hidden",name:"form-name",value:"newsletter"}),i.jsx("input",{id:"email-address",name:"email-address",type:"email",autoComplete:"email",required:!0,className:"w-full rounded-md border border-transparent px-5 py-3 placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 sm:max-w-xs",placeholder:"Enter your email"}),i.jsx("div",{className:"mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0",children:i.jsx("button",{type:"submit",className:"flex w-full items-center justify-center rounded-md border border-transparent bg-gray-700 px-5 py-3 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 font-Headline",children:"Sign Up"})})]})})]})})}},6101:(e,t,r)=>{"use strict";r.d(t,{Z:()=>a});var i=r(997);r(6689),r(7152),r(6442);var s=r(5675),n=r.n(s);function a(){return i.jsx("div",{className:"w-screen h-auto scroll-smooth bg-[url('https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-main-feature-(25x16).png')] bg-contain",id:"splash-image",children:i.jsx(n(),{src:"https://ik.imagekit.io/a9ltbtydo/stak-images/stak/images/Stak-main-feature-(25x16).png",layout:"responsive",width:2560,height:1600,objectFit:"contain",priority:!0,onError:e=>{e.target.src=""}})})}},6442:(e,t,r)=>{"use strict";r.d(t,{Z:()=>i});let i={container:"",nav:""}},4080:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"Image",{enumerable:!0,get:function(){return v}});let i=r(167),s=r(8760),n=r(997),a=s._(r(6689)),o=i._(r(6405)),l=i._(r(3867)),d=r(5283),c=r(6594),u=r(6218);r(3179);let m=r(5469),p=i._(r(3872)),f={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1};function g(e,t,r,i,s,n,a){let o=null==e?void 0:e.src;e&&e["data-loaded-src"]!==o&&(e["data-loaded-src"]=o,("decode"in e?e.decode():Promise.resolve()).catch(()=>{}).then(()=>{if(e.parentElement&&e.isConnected){if("empty"!==t&&s(!0),null==r?void 0:r.current){let t=new Event("load");Object.defineProperty(t,"target",{writable:!1,value:e});let i=!1,s=!1;r.current({...t,nativeEvent:t,currentTarget:e,target:e,isDefaultPrevented:()=>i,isPropagationStopped:()=>s,persist:()=>{},preventDefault:()=>{i=!0,t.preventDefault()},stopPropagation:()=>{s=!0,t.stopPropagation()}})}(null==i?void 0:i.current)&&i.current(e)}}))}function h(e){return a.use?{fetchPriority:e}:{fetchpriority:e}}globalThis.__NEXT_IMAGE_IMPORTED=!0;let x=(0,a.forwardRef)((e,t)=>{let{src:r,srcSet:i,sizes:s,height:o,width:l,decoding:d,className:c,style:u,fetchPriority:m,placeholder:p,loading:f,unoptimized:x,fill:b,onLoadRef:v,onLoadingCompleteRef:y,setBlurComplete:w,setShowAltText:j,sizesInput:_,onLoad:S,onError:k,...P}=e;return(0,n.jsx)("img",{...P,...h(m),loading:f,width:l,height:o,decoding:d,"data-nimg":b?"fill":"1",className:c,style:u,sizes:s,srcSet:i,src:r,ref:(0,a.useCallback)(e=>{t&&("function"==typeof t?t(e):"object"==typeof t&&(t.current=e)),e&&(k&&(e.src=e.src),e.complete&&g(e,p,v,y,w,x,_))},[r,p,v,y,w,k,x,_,t]),onLoad:e=>{g(e.currentTarget,p,v,y,w,x,_)},onError:e=>{j(!0),"empty"!==p&&w(!0),k&&k(e)}})});function b(e){let{isAppRouter:t,imgAttributes:r}=e,i={as:"image",imageSrcSet:r.srcSet,imageSizes:r.sizes,crossOrigin:r.crossOrigin,referrerPolicy:r.referrerPolicy,...h(r.fetchPriority)};return t&&o.default.preload?(o.default.preload(r.src,i),null):(0,n.jsx)(l.default,{children:(0,n.jsx)("link",{rel:"preload",href:r.srcSet?void 0:r.src,...i},"__nimg-"+r.src+r.srcSet+r.sizes)})}let v=(0,a.forwardRef)((e,t)=>{let r=(0,a.useContext)(m.RouterContext),i=(0,a.useContext)(u.ImageConfigContext),s=(0,a.useMemo)(()=>{let e=f||i||c.imageConfigDefault,t=[...e.deviceSizes,...e.imageSizes].sort((e,t)=>e-t),r=e.deviceSizes.sort((e,t)=>e-t);return{...e,allSizes:t,deviceSizes:r}},[i]),{onLoad:o,onLoadingComplete:l}=e,g=(0,a.useRef)(o);(0,a.useEffect)(()=>{g.current=o},[o]);let h=(0,a.useRef)(l);(0,a.useEffect)(()=>{h.current=l},[l]);let[v,y]=(0,a.useState)(!1),[w,j]=(0,a.useState)(!1),{props:_,meta:S}=(0,d.getImgProps)(e,{defaultLoader:p.default,imgConf:s,blurComplete:v,showAltText:w});return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(x,{..._,unoptimized:S.unoptimized,placeholder:S.placeholder,fill:S.fill,onLoadRef:g,onLoadingCompleteRef:h,setBlurComplete:y,setShowAltText:j,sizesInput:e.sizes,ref:t}),S.priority?(0,n.jsx)(b,{isAppRouter:!r,imgAttributes:_}):null]})});("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8214:(e,t)=>{"use strict";function r(e){let{ampFirst:t=!1,hybrid:r=!1,hasQuery:i=!1}=void 0===e?{}:e;return t||r&&i}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"isInAmpMode",{enumerable:!0,get:function(){return r}})},5283:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImgProps",{enumerable:!0,get:function(){return o}}),r(3179);let i=r(6630),s=r(6594);function n(e){return void 0!==e.default}function a(e){return void 0===e?e:"number"==typeof e?Number.isFinite(e)?e:NaN:"string"==typeof e&&/^[0-9]+$/.test(e)?parseInt(e,10):NaN}function o(e,t){var r;let o,l,d,{src:c,sizes:u,unoptimized:m=!1,priority:p=!1,loading:f,className:g,quality:h,width:x,height:b,fill:v=!1,style:y,overrideSrc:w,onLoad:j,onLoadingComplete:_,placeholder:S="empty",blurDataURL:k,fetchPriority:P,layout:O,objectFit:N,objectPosition:C,lazyBoundary:E,lazyRoot:z,...I}=e,{imgConf:L,showAltText:M,blurComplete:A,defaultLoader:H}=t,R=L||s.imageConfigDefault;if("allSizes"in R)o=R;else{let e=[...R.deviceSizes,...R.imageSizes].sort((e,t)=>e-t),t=R.deviceSizes.sort((e,t)=>e-t);o={...R,allSizes:e,deviceSizes:t}}if(void 0===H)throw Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");let T=I.loader||H;delete I.loader,delete I.srcSet;let q="__next_img_default"in T;if(q){if("custom"===o.loader)throw Error('Image with src "'+c+'" is missing "loader" prop.\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader')}else{let e=T;T=t=>{let{config:r,...i}=t;return e(i)}}if(O){"fill"===O&&(v=!0);let e={intrinsic:{maxWidth:"100%",height:"auto"},responsive:{width:"100%",height:"auto"}}[O];e&&(y={...y,...e});let t={responsive:"100vw",fill:"100vw"}[O];t&&!u&&(u=t)}let D="",F=a(x),V=a(b);if("object"==typeof(r=c)&&(n(r)||void 0!==r.src)){let e=n(c)?c.default:c;if(!e.src)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received "+JSON.stringify(e));if(!e.height||!e.width)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received "+JSON.stringify(e));if(l=e.blurWidth,d=e.blurHeight,k=k||e.blurDataURL,D=e.src,!v){if(F||V){if(F&&!V){let t=F/e.width;V=Math.round(e.height*t)}else if(!F&&V){let t=V/e.height;F=Math.round(e.width*t)}}else F=e.width,V=e.height}}let Z=!p&&("lazy"===f||void 0===f);(!(c="string"==typeof c?c:D)||c.startsWith("data:")||c.startsWith("blob:"))&&(m=!0,Z=!1),o.unoptimized&&(m=!0),q&&c.endsWith(".svg")&&!o.dangerouslyAllowSVG&&(m=!0),p&&(P="high");let G=a(h),U=Object.assign(v?{position:"absolute",height:"100%",width:"100%",left:0,top:0,right:0,bottom:0,objectFit:N,objectPosition:C}:{},M?{}:{color:"transparent"},y),B=A||"empty"===S?null:"blur"===S?'url("data:image/svg+xml;charset=utf-8,'+(0,i.getImageBlurSvg)({widthInt:F,heightInt:V,blurWidth:l,blurHeight:d,blurDataURL:k||"",objectFit:U.objectFit})+'")':'url("'+S+'")',W=B?{backgroundSize:U.objectFit||"cover",backgroundPosition:U.objectPosition||"50% 50%",backgroundRepeat:"no-repeat",backgroundImage:B}:{},X=function(e){let{config:t,src:r,unoptimized:i,width:s,quality:n,sizes:a,loader:o}=e;if(i)return{src:r,srcSet:void 0,sizes:void 0};let{widths:l,kind:d}=function(e,t,r){let{deviceSizes:i,allSizes:s}=e;if(r){let e=/(^|\s)(1?\d?\d)vw/g,t=[];for(let i;i=e.exec(r);i)t.push(parseInt(i[2]));if(t.length){let e=.01*Math.min(...t);return{widths:s.filter(t=>t>=i[0]*e),kind:"w"}}return{widths:s,kind:"w"}}return"number"!=typeof t?{widths:i,kind:"w"}:{widths:[...new Set([t,2*t].map(e=>s.find(t=>t>=e)||s[s.length-1]))],kind:"x"}}(t,s,a),c=l.length-1;return{sizes:a||"w"!==d?a:"100vw",srcSet:l.map((e,i)=>o({config:t,src:r,quality:n,width:e})+" "+("w"===d?e:i+1)+d).join(", "),src:o({config:t,src:r,quality:n,width:l[c]})}}({config:o,src:c,unoptimized:m,width:F,quality:G,sizes:u,loader:T});return{props:{...I,loading:Z?"lazy":f,fetchPriority:P,width:F,height:V,decoding:"async",className:g,style:{...U,...W},sizes:X.sizes,srcSet:X.srcSet,src:w||X.src},meta:{unoptimized:m,priority:p,placeholder:S,fill:v}}}},3867:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return g},defaultHead:function(){return u}});let i=r(167),s=r(8760),n=r(997),a=s._(r(6689)),o=i._(r(5277)),l=r(8039),d=r(1988),c=r(8214);function u(e){void 0===e&&(e=!1);let t=[(0,n.jsx)("meta",{charSet:"utf-8"})];return e||t.push((0,n.jsx)("meta",{name:"viewport",content:"width=device-width"})),t}function m(e,t){return"string"==typeof t||"number"==typeof t?e:t.type===a.default.Fragment?e.concat(a.default.Children.toArray(t.props.children).reduce((e,t)=>"string"==typeof t||"number"==typeof t?e:e.concat(t),[])):e.concat(t)}r(3179);let p=["name","httpEquiv","charSet","itemProp"];function f(e,t){let{inAmpMode:r}=t;return e.reduce(m,[]).reverse().concat(u(r).reverse()).filter(function(){let e=new Set,t=new Set,r=new Set,i={};return s=>{let n=!0,a=!1;if(s.key&&"number"!=typeof s.key&&s.key.indexOf("$")>0){a=!0;let t=s.key.slice(s.key.indexOf("$")+1);e.has(t)?n=!1:e.add(t)}switch(s.type){case"title":case"base":t.has(s.type)?n=!1:t.add(s.type);break;case"meta":for(let e=0,t=p.length;e<t;e++){let t=p[e];if(s.props.hasOwnProperty(t)){if("charSet"===t)r.has(t)?n=!1:r.add(t);else{let e=s.props[t],r=i[t]||new Set;("name"!==t||!a)&&r.has(e)?n=!1:(r.add(e),i[t]=r)}}}}return n}}()).reverse().map((e,t)=>{let i=e.key||t;if(!r&&"link"===e.type&&e.props.href&&["https://fonts.googleapis.com/css","https://use.typekit.net/"].some(t=>e.props.href.startsWith(t))){let t={...e.props||{}};return t["data-href"]=t.href,t.href=void 0,t["data-optimized-fonts"]=!0,a.default.cloneElement(e,t)}return a.default.cloneElement(e,{key:i})})}let g=function(e){let{children:t}=e,r=(0,a.useContext)(l.AmpStateContext),i=(0,a.useContext)(d.HeadManagerContext);return(0,n.jsx)(o.default,{reduceComponentsToState:f,headManager:i,inAmpMode:(0,c.isInAmpMode)(r),children:t})};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},6630:(e,t)=>{"use strict";function r(e){let{widthInt:t,heightInt:r,blurWidth:i,blurHeight:s,blurDataURL:n,objectFit:a}=e,o=i?40*i:t,l=s?40*s:r,d=o&&l?"viewBox='0 0 "+o+" "+l+"'":"";return"%3Csvg xmlns='http://www.w3.org/2000/svg' "+d+"%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='"+(d?"none":"contain"===a?"xMidYMid":"cover"===a?"xMidYMid slice":"none")+"' style='filter: url(%23b);' href='"+n+"'/%3E%3C/svg%3E"}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImageBlurSvg",{enumerable:!0,get:function(){return r}})},6594:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{VALID_LOADERS:function(){return r},imageConfigDefault:function(){return i}});let r=["default","imgix","cloudinary","akamai","custom"],i={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",loaderFile:"",domains:[],disableStaticImages:!1,minimumCacheTTL:60,formats:["image/webp"],dangerouslyAllowSVG:!1,contentSecurityPolicy:"script-src 'none'; frame-src 'none'; sandbox;",contentDispositionType:"inline",remotePatterns:[],unoptimized:!1}},6210:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return l},getImageProps:function(){return o}});let i=r(167),s=r(5283),n=r(4080),a=i._(r(3872));function o(e){let{props:t}=(0,s.getImgProps)(e,{defaultLoader:a.default,imgConf:{deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!1}});for(let[e,r]of Object.entries(t))void 0===r&&delete t[e];return{props:t}}let l=n.Image},3872:(e,t)=>{"use strict";function r(e){let{config:t,src:r,width:i,quality:s}=e;return t.path+"?url="+encodeURIComponent(r)+"&w="+i+"&q="+(s||75)}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return i}}),r.__next_img_default=!0;let i=r},5277:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return a}});let i=r(6689),s=()=>{},n=()=>{};function a(e){var t;let{headManager:r,reduceComponentsToState:a}=e;function o(){if(r&&r.mountedInstances){let t=i.Children.toArray(Array.from(r.mountedInstances).filter(Boolean));r.updateHead(a(t,e))}}return null==r||null==(t=r.mountedInstances)||t.add(e.children),o(),s(()=>{var t;return null==r||null==(t=r.mountedInstances)||t.add(e.children),()=>{var t;null==r||null==(t=r.mountedInstances)||t.delete(e.children)}}),s(()=>(r&&(r._pendingUpdate=o),()=>{r&&(r._pendingUpdate=o)})),n(()=>(r&&r._pendingUpdate&&(r._pendingUpdate(),r._pendingUpdate=null),()=>{r&&r._pendingUpdate&&(r._pendingUpdate(),r._pendingUpdate=null)})),null}},3179:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"warnOnce",{enumerable:!0,get:function(){return r}});let r=e=>{}},9828:(e,t,r)=>{"use strict";r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{default:()=>p,getServerSideProps:()=>f});var s=r(997);r(968),r(5675),r(7334);var n=r(6442),a=r(6101),o=r(3705);r(3744),r(5479);var l=r(2504),d=r(7833),c=r(5711),u=r(7166),m=e([o,l,d,c]);[o,l,d,c]=m.then?(await m)():m;let p=({aboutCopy:e,videoData:t})=>(0,s.jsxs)("div",{className:n.Z.container,children:[s.jsx(a.Z,{}),s.jsx(u.Z,{}),s.jsx(o.Z,{sectionCopy:e}),s.jsx(l.Z,{videoPreLink:t})]}),f=async()=>{let e=await d.L.fetch("*[_type == 'about']"),t={vidLink:await d.L.fetch("*[_type == 'videoLink']"),heroLink:await d.L.fetch("*[_type == 'heroVideo']"),musicLink:await d.L.fetch("*[_type == 'musicLink']")};return{props:{aboutCopy:e,videoData:t}}};i()}catch(e){i(e)}})},5379:()=>{},8039:(e,t,r)=>{"use strict";e.exports=r(7093).vendored.contexts.AmpContext},1988:(e,t,r)=>{"use strict";e.exports=r(7093).vendored.contexts.HeadManagerContext},6218:(e,t,r)=>{"use strict";e.exports=r(7093).vendored.contexts.ImageConfigContext},5675:(e,t,r)=>{e.exports=r(6210)},1791:e=>{"use strict";e.exports=require("@sanity/image-url")},943:e=>{"use strict";e.exports=require("@stripe/stripe-js")},7152:e=>{"use strict";e.exports=require("animejs")},1320:e=>{"use strict";e.exports=require("dompurify")},540:e=>{"use strict";e.exports=require("get-youtube-id")},5895:e=>{"use strict";e.exports=require("headroom.js")},2785:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{"use strict";e.exports=require("next/head")},8179:e=>{"use strict";e.exports=require("p5")},6689:e=>{"use strict";e.exports=require("react")},6405:e=>{"use strict";e.exports=require("react-dom")},997:e=>{"use strict";e.exports=require("react/jsx-runtime")},5315:e=>{"use strict";e.exports=require("path")},1964:e=>{"use strict";e.exports=import("@floating-ui/react")},5711:e=>{"use strict";e.exports=import("@portabletext/react")},8916:e=>{"use strict";e.exports=import("@react-aria/focus")},7001:e=>{"use strict";e.exports=import("@react-aria/interactions")},680:e=>{"use strict";e.exports=import("@sanity/client")},6201:e=>{"use strict";e.exports=import("react-hot-toast")},7385:e=>{"use strict";e.exports={}}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[977,137,859,926,711],()=>r(1725));module.exports=i})();