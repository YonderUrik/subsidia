"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[764],{25764:function(e,i,o){o.r(i),o.d(i,{default:function(){return y}});var r=o(91086),c=o(25536),t=o(95590),a=o(55994),n=o(52024),s=o(58263),d=o(74165),l=o(15861),u=o(55420),b=o(88773),h=o(78886),m=o(96516),x=o(37796),p=o(12635),f=o(60401),g=o(41306),j=o(61465),v=o(57267),Z=o(23712);function _(){var e=(0,b.s0)(),i=(0,g.E)().verify,o=((0,b.TH)().state||{}).username,r=(0,j.Ds)().enqueueSnackbar,c=u.Ry().shape({code1:u.Z_().required("Codice obbligatorio"),code2:u.Z_().required("Codice obbligatorio"),code3:u.Z_().required("Codice obbligatorio"),code4:u.Z_().required("Codice obbligatorio"),code5:u.Z_().required("Codice obbligatorio"),code6:u.Z_().required("Codice obbligatorio")}),t=(0,h.cI)({mode:"onChange",resolver:(0,m.X)(c),defaultValues:{code1:"",code2:"",code3:"",code4:"",code5:"",code6:""}}),a=t.handleSubmit,s=t.formState,_=s.isSubmitting,C=s.errors,y=function(){var c=(0,l.Z)((0,d.Z)().mark((function c(t){var a;return(0,d.Z)().wrap((function(c){for(;;)switch(c.prev=c.next){case 0:return c.prev=0,a=Object.values(t).join(""),c.next=4,i(a,o);case 4:200===c.sent.status&&(r("Registrazione completata"),e(n.E.login)),c.next=11;break;case 8:c.prev=8,c.t0=c.catch(0),console.error(c.t0);case 11:case"end":return c.stop()}}),c,null,[[0,8]])})));return function(e){return c.apply(this,arguments)}}();return(0,Z.jsx)(v.ZP,{methods:t,onSubmit:a(y),children:(0,Z.jsxs)(x.Z,{spacing:3,children:[(0,Z.jsx)(v.Iy,{keyName:"code",inputs:["code1","code2","code3","code4","code5","code6"]}),(!!C.code1||!!C.code2||!!C.code3||!!C.code4||!!C.code5||!!C.code6)&&(0,Z.jsx)(p.Z,{error:!0,sx:{px:2},children:"Codice obbligatorio"}),(0,Z.jsx)(f.Z,{fullWidth:!0,size:"large",type:"submit",variant:"contained",loading:_,sx:{mt:3},children:"Verifica"})]})})}var C=o(51306);function y(){return(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsx)(r.ql,{children:(0,Z.jsx)("title",{children:" Verifica codice | ConveyApps"})}),(0,Z.jsx)(C.yj,{sx:{mb:5,height:96}}),(0,Z.jsx)(t.Z,{variant:"h3",paragraph:!0,children:"Controlla la tua mail!"}),(0,Z.jsx)(t.Z,{sx:{color:"text.secondary",mb:5},children:"Abbiamo inviato un codice a 6 cifre alla tua casella di posta, insersci il codice qui sotto per confermare la tua registrazione."}),(0,Z.jsx)(_,{}),(0,Z.jsxs)(a.Z,{component:c.rU,to:n.E.login,color:"inherit",variant:"subtitle2",sx:{mx:"auto",my:2,alignItems:"center",display:"inline-flex"},children:[(0,Z.jsx)(s.Z,{icon:"eva:chevron-left-fill",width:16}),"Ritorna al login"]})]})}}}]);