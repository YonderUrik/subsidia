"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[103],{12103:function(e,o,i){i.r(o),i.d(o,{default:function(){return C}});var r=i(91086),t=i(25536),c=i(95590),a=i(55994),n=i(52024),s=i(58263),d=i(74165),l=i(15861),u=i(55420),h=i(88773),b=i(78886),m=i(96516),x=i(37796),f=i(12635),p=i(60401),g=i(41306),j=i(57267),v=i(23712);function Z(){var e=(0,h.s0)(),o=(0,g.E)().verify_forgot,i=((0,h.TH)().state||{}).username,r=u.Ry().shape({code1:u.Z_().required("Codice obbligatorio"),code2:u.Z_().required("Codice obbligatorio"),code3:u.Z_().required("Codice obbligatorio"),code4:u.Z_().required("Codice obbligatorio"),code5:u.Z_().required("Codice obbligatorio"),code6:u.Z_().required("Codice obbligatorio")}),t=(0,b.cI)({mode:"onChange",resolver:(0,m.X)(r),defaultValues:{code1:"",code2:"",code3:"",code4:"",code5:"",code6:""}}),c=t.handleSubmit,a=t.formState,s=a.isSubmitting,Z=a.errors,_=function(){var r=(0,l.Z)((0,d.Z)().mark((function r(t){var c;return(0,d.Z)().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.prev=0,c=Object.values(t).join(""),r.next=4,o(c,i);case 4:200===r.sent.status&&e(n.E.register,{state:{username:i}}),r.next=11;break;case 8:r.prev=8,r.t0=r.catch(0),console.error(r.t0);case 11:case"end":return r.stop()}}),r,null,[[0,8]])})));return function(e){return r.apply(this,arguments)}}();return(0,v.jsx)(j.ZP,{methods:t,onSubmit:c(_),children:(0,v.jsxs)(x.Z,{spacing:3,children:[(0,v.jsx)(j.Iy,{keyName:"code",inputs:["code1","code2","code3","code4","code5","code6"]}),(!!Z.code1||!!Z.code2||!!Z.code3||!!Z.code4||!!Z.code5||!!Z.code6)&&(0,v.jsx)(f.Z,{error:!0,sx:{px:2},children:"Codice obbligatorio"}),(0,v.jsx)(p.Z,{fullWidth:!0,size:"large",type:"submit",variant:"contained",loading:s,sx:{mt:3},children:"Verifica"})]})})}var _=i(51306);function C(){return(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(r.ql,{children:(0,v.jsx)("title",{children:" Verifica codice | ConveyApps"})}),(0,v.jsx)(_.yj,{sx:{mb:5,height:96}}),(0,v.jsx)(c.Z,{variant:"h3",paragraph:!0,children:"Controlla la tua mail!"}),(0,v.jsx)(c.Z,{sx:{color:"text.secondary",mb:5},children:"Abbiamo inviato un codice a 6 cifre alla tua casella di posta, insersci il codice qui sotto per confermare il reset della password."}),(0,v.jsx)(Z,{}),(0,v.jsxs)(a.Z,{component:t.rU,to:n.E.login,color:"inherit",variant:"subtitle2",sx:{mx:"auto",my:2,alignItems:"center",display:"inline-flex"},children:[(0,v.jsx)(s.Z,{icon:"eva:chevron-left-fill",width:16}),"Ritorna al login"]})]})}}}]);