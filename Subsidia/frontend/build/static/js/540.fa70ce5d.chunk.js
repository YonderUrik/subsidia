"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[540],{89903:function(e,n,t){t.d(n,{Z:function(){return h}});var r=t(1413),a=t(45987),i=t(30461),s=t(37796),o=t(95590),c=t(11792),l=t(55994),u=t(25536),d=t(23712);function p(e){var n=e.link,t=e.activeLast,a=e.disabled,s=n.name,o=n.href,c=n.icon,p=(0,r.Z)({typography:"body2",alignItems:"center",color:"text.primary",display:"inline-flex"},a&&!t&&{cursor:"default",pointerEvents:"none",color:"text.disabled"}),x=(0,d.jsxs)(d.Fragment,{children:[c&&(0,d.jsx)(i.Z,{component:"span",sx:{mr:1,display:"inherit","& svg":{width:20,height:20}},children:c}),s]});return o?(0,d.jsx)(l.Z,{component:u.rU,to:o,sx:p,children:x}):(0,d.jsxs)(i.Z,{sx:p,children:[" ",x," "]})}var x=["links","action","heading","moreLink","activeLast","sx"];function h(e){var n=e.links,t=e.action,u=e.heading,h=e.moreLink,v=e.activeLast,m=e.sx,Z=(0,a.Z)(e,x),g=n?n[n.length-1].name:null;return(0,d.jsxs)(i.Z,{sx:(0,r.Z)({mb:2},m),children:[(0,d.jsxs)(s.Z,{direction:"row",alignItems:"center",children:[(0,d.jsxs)(i.Z,{sx:{flexGrow:1},children:[u&&(0,d.jsx)(o.Z,{variant:"h4",gutterBottom:!0,children:u}),n&&!!n.length&&(0,d.jsx)(c.Z,(0,r.Z)((0,r.Z)({separator:(0,d.jsx)(f,{})},Z),{},{children:n.map((function(e){return(0,d.jsx)(p,{link:e,activeLast:v,disabled:e.name===g},e.name||"")}))}))]}),t&&(0,d.jsxs)(i.Z,{sx:{flexShrink:0},children:[" ",t," "]})]}),!!h&&(0,d.jsx)(i.Z,{sx:{mt:2},children:h.map((function(e){return(0,d.jsx)(l.Z,{noWrap:!0,href:e,variant:"body2",target:"_blank",rel:"noopener",sx:{display:"table"},children:e},e)}))})]})}function f(){return(0,d.jsx)(i.Z,{component:"span",sx:{width:4,height:4,borderRadius:"50%",bgcolor:"text.disabled"}})}},40465:function(e,n,t){t.d(n,{k:function(){return i}});var r=t(29439),a=t(88391);function i(e){var n=(0,a.useState)(!!e),t=(0,r.Z)(n,2),i=t[0],s=t[1];return{value:i,onTrue:(0,a.useCallback)((function(){s(!0)}),[]),onFalse:(0,a.useCallback)((function(){s(!1)}),[]),onToggle:(0,a.useCallback)((function(){s((function(e){return!e}))}),[]),setValue:s}}},86540:function(e,n,t){t.r(n),t.d(n,{default:function(){return h}});var r=t(29439),a=t(74165),i=t(15861),s=t(88391),o=t(44884),c=(t(52024),t(77171)),l=(t(40465),t(12782)),u=t(89903),d=t(30155),p=t(79631),x=t(23712);function h(){var e=(0,l.K$)(),n=(0,c.UO)().id,t=(0,s.useCallback)((0,i.Z)((0,a.Z)().mark((function e(){var t;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,p.Z.post("/raccolte/get-single-doc",{id:n});case 3:t=e.sent,m(t.data),e.next=10;break;case 7:e.prev=7,e.t0=e.catch(0),console.log(e.t0);case 10:case"end":return e.stop()}}),e,null,[[0,7]])}))),[n]);(0,s.useEffect)((function(){t()}),[t]);var h=(0,s.useState)(null),f=(0,r.Z)(h,2),v=f[0],m=f[1];return(0,x.jsxs)(o.Z,{maxWidth:!e.themeStretch&&"lg",children:[(0,x.jsx)(u.Z,{heading:"Modifica",sx:{mb:{xs:3,md:5}}}),v&&(0,x.jsx)(d.Z,{currentInvoice:v})]})}},77171:function(e,n,t){t.d(n,{UO:function(){return i},tv:function(){return s}});var r=t(88391),a=t(88773);function i(){var e=(0,a.UO)();return(0,r.useMemo)((function(){return e}),[e])}function s(){var e=(0,a.s0)();return(0,r.useMemo)((function(){return{back:function(){return e(-1)},forward:function(){return e(1)},reload:function(){return window.location.reload()},push:function(n){return e(n)},replace:function(n){return e(n,{replace:!0})}}}),[e])}},30155:function(e,n,t){t.d(n,{Z:function(){return I}});var r=t(74165),a=t(15861),i=t(29439),s=t(88391),o=t(55420),c=t(78886),l=t(96516),u=t(60401),d=t(75208),p=t(37796),x=t(12600),h=t(46541),f=t(8991),v=t(30461),m=t(81129),Z=t(51023),g=t(19708),b=t(52024),j=t(77171),k=t(40465),w=t(83182),y=t(70562);var P=t(3475),S=t(79631),C=t(57267),_=t(61465),z=t(23712);function I(e){var n=e.currentInvoice,t=(0,j.tv)(),I=function(e,n,t){var r=(0,w.Z)(),a=(0,y.Z)(r.breakpoints.up(n)),i=(0,y.Z)(r.breakpoints.down(n)),s=(0,y.Z)(r.breakpoints.between(n,t)),o=(0,y.Z)(r.breakpoints.only(n));return"up"===e?a:"down"===e?i:"between"===e?s:o}("up","md"),L=(0,k.k)(),T=(0,_.Ds)().enqueueSnackbar,q=(0,s.useState)([]),D=(0,i.Z)(q,2),M=D[0],O=D[1],F=(0,s.useState)([]),V=(0,i.Z)(F,2),A=V[0],E=V[1];console.log(n);var R=(0,s.useCallback)((0,a.Z)((0,r.Z)().mark((function e(){var n,t;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,S.Z.post("/raccolte/get-distinct-value",{value:"client"});case 3:return n=e.sent,e.next=6,S.Z.post("/raccolte/get-distinct-value",{value:"product"});case 6:t=e.sent,O(n.data),E(t.data),e.next=14;break;case 11:e.prev=11,e.t0=e.catch(0),console.log(e.t0);case 14:case"end":return e.stop()}}),e,null,[[0,11]])}))),[]);(0,s.useEffect)((function(){R()}),[R]);var K=o.Ry().shape({date:o.nK().nullable().required("Data mancante"),client:o.Z_().required("Cliente mancante"),product:o.Z_().required("Prodotto mancante"),weight:o.Rx().required("Peso mancante"),price:o.Rx().required("Prezzo mancante"),status:o.Z_().required("Stato mancante"),revenue:o.Rx()}),U=(0,s.useMemo)((function(){return{date:n?new Date(null===n||void 0===n?void 0:n.date):new Date,client:(null===n||void 0===n?void 0:n.client)||"",product:(null===n||void 0===n?void 0:n.product)||"",weight:(null===n||void 0===n?void 0:n.weight)||0,price:(null===n||void 0===n?void 0:n.price)||0,revenue:(null===n||void 0===n?void 0:n.revenue)||0,status:(null===n||void 0===n?void 0:n.status)||"Da Pagare",note:(null===n||void 0===n?void 0:n.note)||""}}),[n]),W=(0,c.cI)({resolver:(0,l.X)(K),defaultValues:U}),B=W.reset,G=W.control,N=W.handleSubmit,Q=W.watch,X=W.formState.isSubmitting,$=N(function(){var e=(0,a.Z)((0,r.Z)().mark((function e(a){return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(L.onTrue(),e.prev=1,n){e.next=9;break}return e.next=5,S.Z.post("/raccolte/new-raccolta",{data:a});case 5:B(),T("Valore aggiunto correttamente"),e.next=13;break;case 9:return e.next=11,S.Z.post("/raccolte/edit-raccolta",{data:a,id:n._id});case 11:B(),T("Valore aggiornato correttamente");case 13:t.push(b.O.raccolte),e.next=19;break;case 16:e.prev=16,e.t0=e.catch(1),T(e.t0.message||e.t0,{variant:"error"});case 19:return e.prev=19,L.onFalse(),e.finish(19);case 22:case"end":return e.stop()}}),e,null,[[1,16,19,22]])})));return function(n){return e.apply(this,arguments)}}()),H=Q("price"),J=Q("weight"),Y="Tot. Teorico : ".concat((0,P.e_)(H*J));return(0,z.jsx)(C.ZP,{methods:W,children:(0,z.jsx)(x.ZP,{container:!0,justifyContent:"center",children:(0,z.jsx)(x.ZP,{item:!0,xs:12,md:8,children:(0,z.jsxs)(d.Z,{children:[!I&&(0,z.jsx)(h.Z,{title:"Dettagli"}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1,mt:2},children:(0,z.jsx)(c.Qr,{name:"date",control:G,render:function(e){var n=e.field,t=e.fieldState.error;return(0,z.jsx)(g.M,{label:"Data",value:n.value,onChange:function(e){n.onChange(e)},slotProps:{textField:{fullWidth:!0,format:"dd/MM/yyyy",error:!!t,helperText:null===t||void 0===t?void 0:t.message}}})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.Fl,{freeSolo:!0,size:"small",name:"client",label:"Cliente",options:M,getOptionLabel:function(e){return e},isOptionEqualToValue:function(e,n){return e===n.value}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.Fl,{freeSolo:!0,size:"small",name:"product",label:"Prodotto",options:A,getOptionLabel:function(e){return e},isOptionEqualToValue:function(e,n){return e===n.value}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"weight",label:"Peso",type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(f.Z,{position:"start",children:(0,z.jsx)(v.Z,{component:"span",sx:{color:"text.disabled"},children:"Kg"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"price",label:"Prezzo per Kg",type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(f.Z,{position:"start",children:(0,z.jsx)(v.Z,{component:"span",sx:{color:"text.disabled"},children:"\u20ac"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"revenue",label:"Totale incassato",helperText:Y,type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(f.Z,{position:"start",children:(0,z.jsx)(v.Z,{component:"span",sx:{color:"text.disabled"},children:"\u20ac"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{name:"note",label:"Note",multiline:!0,rows:3})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsxs)(C.Cc,{name:"status",label:"Stato",size:"small",children:[(0,z.jsx)(m.Z,{sx:{borderStyle:"dashed"}}),["Da Pagare","Acconto","Pagato"].map((function(e){return(0,z.jsx)(Z.Z,{value:e,children:e},e)}))]})}),(0,z.jsx)(p.Z,{justifyContent:"flex-end",direction:"row",spacing:2,sx:{mt:3,p:3},children:(0,z.jsx)(u.Z,{size:"small",variant:"contained",color:"success",loading:L.value&&X,onClick:$,children:n?"Modifica":"Aggiungi"})})]})})})})}}}]);