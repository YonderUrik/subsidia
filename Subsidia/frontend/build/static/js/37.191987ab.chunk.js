"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[37],{89903:function(e,n,t){t.d(n,{Z:function(){return h}});var r=t(1413),a=t(45987),i=t(30461),o=t(37796),s=t(95590),l=t(11792),c=t(55994),u=t(25536),d=t(23712);function p(e){var n=e.link,t=e.activeLast,a=e.disabled,o=n.name,s=n.href,l=n.icon,p=(0,r.Z)({typography:"body2",alignItems:"center",color:"text.primary",display:"inline-flex"},a&&!t&&{cursor:"default",pointerEvents:"none",color:"text.disabled"}),x=(0,d.jsxs)(d.Fragment,{children:[l&&(0,d.jsx)(i.Z,{component:"span",sx:{mr:1,display:"inherit","& svg":{width:20,height:20}},children:l}),o]});return s?(0,d.jsx)(c.Z,{component:u.rU,to:s,sx:p,children:x}):(0,d.jsxs)(i.Z,{sx:p,children:[" ",x," "]})}var x=["links","action","heading","moreLink","activeLast","sx"];function h(e){var n=e.links,t=e.action,u=e.heading,h=e.moreLink,f=e.activeLast,v=e.sx,Z=(0,a.Z)(e,x),g=n?n[n.length-1].name:null;return(0,d.jsxs)(i.Z,{sx:(0,r.Z)({mb:2},v),children:[(0,d.jsxs)(o.Z,{direction:"row",alignItems:"center",children:[(0,d.jsxs)(i.Z,{sx:{flexGrow:1},children:[u&&(0,d.jsx)(s.Z,{variant:"h4",gutterBottom:!0,children:u}),n&&!!n.length&&(0,d.jsx)(l.Z,(0,r.Z)((0,r.Z)({separator:(0,d.jsx)(m,{})},Z),{},{children:n.map((function(e){return(0,d.jsx)(p,{link:e,activeLast:f,disabled:e.name===g},e.name||"")}))}))]}),t&&(0,d.jsxs)(i.Z,{sx:{flexShrink:0},children:[" ",t," "]})]}),!!h&&(0,d.jsx)(i.Z,{sx:{mt:2},children:h.map((function(e){return(0,d.jsx)(c.Z,{noWrap:!0,href:e,variant:"body2",target:"_blank",rel:"noopener",sx:{display:"table"},children:e},e)}))})]})}function m(){return(0,d.jsx)(i.Z,{component:"span",sx:{width:4,height:4,borderRadius:"50%",bgcolor:"text.disabled"}})}},40465:function(e,n,t){t.d(n,{k:function(){return i}});var r=t(29439),a=t(88391);function i(e){var n=(0,a.useState)(!!e),t=(0,r.Z)(n,2),i=t[0],o=t[1];return{value:i,onTrue:(0,a.useCallback)((function(){o(!0)}),[]),onFalse:(0,a.useCallback)((function(){o(!1)}),[]),onToggle:(0,a.useCallback)((function(){o((function(e){return!e}))}),[]),setValue:o}}},37:function(e,n,t){t.r(n),t.d(n,{default:function(){return l}});var r=t(44884),a=t(12782),i=t(89903),o=t(30155),s=t(23712);function l(){var e=(0,a.K$)();return(0,s.jsxs)(r.Z,{maxWidth:!e.themeStretch&&"lg",children:[(0,s.jsx)(i.Z,{heading:"Aggiungi raccolta",sx:{mb:{xs:3,md:5}}}),(0,s.jsx)(o.Z,{})]})}},77171:function(e,n,t){t.d(n,{UO:function(){return i},tv:function(){return o}});var r=t(88391),a=t(88773);function i(){var e=(0,a.UO)();return(0,r.useMemo)((function(){return e}),[e])}function o(){var e=(0,a.s0)();return(0,r.useMemo)((function(){return{back:function(){return e(-1)},forward:function(){return e(1)},reload:function(){return window.location.reload()},push:function(n){return e(n)},replace:function(n){return e(n,{replace:!0})}}}),[e])}},30155:function(e,n,t){t.d(n,{Z:function(){return L}});var r=t(74165),a=t(15861),i=t(29439),o=t(88391),s=t(55420),l=t(78886),c=t(96516),u=t(60401),d=t(75208),p=t(37796),x=t(12600),h=t(46541),m=t(8991),f=t(30461),v=t(81129),Z=t(51023),g=t(19708),j=t(52024),b=t(77171),k=t(40465),y=t(83182),w=t(70562);var P=t(3475),S=t(79631),C=t(57267),_=t(61465),z=t(23712);function L(e){var n=e.currentInvoice,t=(0,b.tv)(),L=function(e,n,t){var r=(0,y.Z)(),a=(0,w.Z)(r.breakpoints.up(n)),i=(0,w.Z)(r.breakpoints.down(n)),o=(0,w.Z)(r.breakpoints.between(n,t)),s=(0,w.Z)(r.breakpoints.only(n));return"up"===e?a:"down"===e?i:"between"===e?o:s}("up","md"),I=(0,k.k)(),T=(0,_.Ds)().enqueueSnackbar,q=(0,o.useState)([]),D=(0,i.Z)(q,2),M=D[0],O=D[1],A=(0,o.useState)([]),F=(0,i.Z)(A,2),V=F[0],R=F[1];console.log(n);var E=(0,o.useCallback)((0,a.Z)((0,r.Z)().mark((function e(){var n,t;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,S.Z.post("/raccolte/get-distinct-value",{value:"client"});case 3:return n=e.sent,e.next=6,S.Z.post("/raccolte/get-distinct-value",{value:"product"});case 6:t=e.sent,O(n.data),R(t.data),e.next=14;break;case 11:e.prev=11,e.t0=e.catch(0),console.log(e.t0);case 14:case"end":return e.stop()}}),e,null,[[0,11]])}))),[]);(0,o.useEffect)((function(){E()}),[E]);var K=s.Ry().shape({date:s.nK().nullable().required("Data mancante"),client:s.Z_().required("Cliente mancante"),product:s.Z_().required("Prodotto mancante"),weight:s.Rx().required("Peso mancante"),price:s.Rx().required("Prezzo mancante"),status:s.Z_().required("Stato mancante"),revenue:s.Rx()}),U=(0,o.useMemo)((function(){return{date:n?new Date(null===n||void 0===n?void 0:n.date):new Date,client:(null===n||void 0===n?void 0:n.client)||"",product:(null===n||void 0===n?void 0:n.product)||"",weight:(null===n||void 0===n?void 0:n.weight)||0,price:(null===n||void 0===n?void 0:n.price)||0,revenue:(null===n||void 0===n?void 0:n.revenue)||0,status:(null===n||void 0===n?void 0:n.status)||"Da Pagare",note:(null===n||void 0===n?void 0:n.note)||""}}),[n]),W=(0,l.cI)({resolver:(0,c.X)(K),defaultValues:U}),B=W.reset,G=W.control,N=W.handleSubmit,Q=W.watch,X=W.formState.isSubmitting,$=N(function(){var e=(0,a.Z)((0,r.Z)().mark((function e(a){return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(I.onTrue(),e.prev=1,n){e.next=9;break}return e.next=5,S.Z.post("/raccolte/new-raccolta",{data:a});case 5:B(),T("Valore aggiunto correttamente"),e.next=13;break;case 9:return e.next=11,S.Z.post("/raccolte/edit-raccolta",{data:a,id:n._id});case 11:B(),T("Valore aggiornato correttamente");case 13:t.push(j.O.raccolte),e.next=19;break;case 16:e.prev=16,e.t0=e.catch(1),T(e.t0.message||e.t0,{variant:"error"});case 19:return e.prev=19,I.onFalse(),e.finish(19);case 22:case"end":return e.stop()}}),e,null,[[1,16,19,22]])})));return function(n){return e.apply(this,arguments)}}()),H=Q("price"),J=Q("weight"),Y="Tot. Teorico : ".concat((0,P.e_)(H*J));return(0,z.jsx)(C.ZP,{methods:W,children:(0,z.jsx)(x.ZP,{container:!0,justifyContent:"center",children:(0,z.jsx)(x.ZP,{item:!0,xs:12,md:8,children:(0,z.jsxs)(d.Z,{children:[!L&&(0,z.jsx)(h.Z,{title:"Dettagli"}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1,mt:2},children:(0,z.jsx)(l.Qr,{name:"date",control:G,render:function(e){var n=e.field,t=e.fieldState.error;return(0,z.jsx)(g.M,{label:"Data",value:n.value,onChange:function(e){n.onChange(e)},slotProps:{textField:{fullWidth:!0,format:"dd/MM/yyyy",error:!!t,helperText:null===t||void 0===t?void 0:t.message}}})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.Fl,{freeSolo:!0,size:"small",name:"client",label:"Cliente",options:M,getOptionLabel:function(e){return e},isOptionEqualToValue:function(e,n){return e===n.value}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.Fl,{freeSolo:!0,size:"small",name:"product",label:"Prodotto",options:V,getOptionLabel:function(e){return e},isOptionEqualToValue:function(e,n){return e===n.value}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"weight",label:"Peso",type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(m.Z,{position:"start",children:(0,z.jsx)(f.Z,{component:"span",sx:{color:"text.disabled"},children:"Kg"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"price",label:"Prezzo per Kg",type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(m.Z,{position:"start",children:(0,z.jsx)(f.Z,{component:"span",sx:{color:"text.disabled"},children:"\u20ac"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{size:"small",name:"revenue",label:"Totale incassato",helperText:Y,type:"number",InputLabelProps:{shrink:!0},InputProps:{startAdornment:(0,z.jsx)(m.Z,{position:"start",children:(0,z.jsx)(f.Z,{component:"span",sx:{color:"text.disabled"},children:"\u20ac"})})}})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsx)(C.au,{name:"note",label:"Note",multiline:!0,rows:3})}),(0,z.jsx)(p.Z,{spacing:3,sx:{px:3,py:1},children:(0,z.jsxs)(C.Cc,{name:"status",label:"Stato",size:"small",children:[(0,z.jsx)(v.Z,{sx:{borderStyle:"dashed"}}),["Da Pagare","Acconto","Pagato"].map((function(e){return(0,z.jsx)(Z.Z,{value:e,children:e},e)}))]})}),(0,z.jsx)(p.Z,{justifyContent:"flex-end",direction:"row",spacing:2,sx:{mt:3,p:3},children:(0,z.jsx)(u.Z,{size:"small",variant:"contained",color:"success",loading:I.value&&X,onClick:$,children:n?"Modifica":"Aggiungi"})})]})})})})}}}]);