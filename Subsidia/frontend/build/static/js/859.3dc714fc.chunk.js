"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[859],{1859:function(e,l,o){o.r(l),o.d(l,{ModuleCard:function(){return p},default:function(){return b}});var t=o(45987),i=o(91086),r=o(25536),n=o(44884),a=o(95590),c=o(30461),s=o(47089),d=o(61563),u=o(41306),h=o(16346),g=o(52024),m=o(23712),x=["title","subheader","list"];function b(){var e=(0,u.E)().user,l=(0,d.K$)().themeStretch,o=null===e||void 0===e?void 0:e.email;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(i.ql,{children:(0,m.jsx)("title",{children:" Home | Subsidia"})}),(0,m.jsxs)(n.Z,{maxWidth:!l&&"xl",children:[(0,m.jsxs)(a.Z,{variant:"h4",sx:{mb:5},children:["Bentornato/a ",o]}),(0,m.jsx)(p,{title:"Moduli",list:[{label:"Raccolte",icon:"bi:collection-fill",color:"primary",to:g.O.raccolte,tag:"raccolte"},{label:"Cashflow",icon:"mdi:cash-sync",color:"",tag:"cashflow"},{label:"Dipendenti",icon:"clarity:employee-group-solid",color:"primary",to:g.O.dipendenti,tag:"dipendenti"},{label:"Agenda",icon:"solar:book-2-bold-duotone",color:"",tag:"agenda"},{label:"Magazzino",icon:"material-symbols:warehouse-rounded",color:"",tag:"magazzino"}]})]})]})}function p(e){e.title,e.subheader;var l=e.list,o=((0,t.Z)(e,x),(0,u.E)().user),i=null===o||void 0===o?void 0:o.tags;return(0,m.jsx)(c.Z,{display:"grid",gap:1.5,gridTemplateColumns:"repeat(2, 1fr)",sx:{p:3},children:l.map((function(e){return i.includes(e.tag)?(0,m.jsx)(r.rU,{style:{textDecoration:"none"},to:e.to,children:(0,m.jsxs)(s.Z,{variant:"outlined",sx:{py:2.5,textAlign:"center",bgcolor:e.color?"".concat(e.color,".dark"):"grey",color:"white","&:hover":{bgcolor:e.color?"".concat(e.color,".darker"):"grey"},border:function(e){return"solid 1px ".concat(e.palette.divider)}},children:[(0,m.jsx)(h.Z,{icon:e.icon,width:36,opacity:.7}),(0,m.jsx)(a.Z,{variant:"h6",sx:{mt:.5},children:e.total}),(0,m.jsx)(a.Z,{variant:"h6",children:e.label})]})},e.label):null}))})}}}]);