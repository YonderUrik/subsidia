"use strict";(self.webpackChunk_minimal_kit_cra_js=self.webpackChunk_minimal_kit_cra_js||[]).push([[396],{89903:function(t,e,r){r.d(e,{Z:function(){return f}});var n=r(1413),o=r(45987),i=r(30461),a=r(37796),l=r(95590),c=r(11792),s=r(55994),d=r(25536),u=r(23712);function h(t){var e=t.link,r=t.activeLast,o=t.disabled,a=e.name,l=e.href,c=e.icon,h=(0,n.Z)({typography:"body2",alignItems:"center",color:"text.primary",display:"inline-flex"},o&&!r&&{cursor:"default",pointerEvents:"none",color:"text.disabled"}),g=(0,u.jsxs)(u.Fragment,{children:[c&&(0,u.jsx)(i.Z,{component:"span",sx:{mr:1,display:"inherit","& svg":{width:20,height:20}},children:c}),a]});return l?(0,u.jsx)(s.Z,{component:d.rU,to:l,sx:h,children:g}):(0,u.jsxs)(i.Z,{sx:h,children:[" ",g," "]})}var g=["links","action","heading","moreLink","activeLast","sx"];function f(t){var e=t.links,r=t.action,d=t.heading,f=t.moreLink,Z=t.activeLast,m=t.sx,x=(0,o.Z)(t,g),v=e?e[e.length-1].name:null;return(0,u.jsxs)(i.Z,{sx:(0,n.Z)({mb:2},m),children:[(0,u.jsxs)(a.Z,{direction:"row",alignItems:"center",children:[(0,u.jsxs)(i.Z,{sx:{flexGrow:1},children:[d&&(0,u.jsx)(l.Z,{variant:"h4",gutterBottom:!0,children:d}),e&&!!e.length&&(0,u.jsx)(c.Z,(0,n.Z)((0,n.Z)({separator:(0,u.jsx)(p,{})},x),{},{children:e.map((function(t){return(0,u.jsx)(h,{link:t,activeLast:Z,disabled:t.name===v},t.name||"")}))}))]}),r&&(0,u.jsxs)(i.Z,{sx:{flexShrink:0},children:[" ",r," "]})]}),!!f&&(0,u.jsx)(i.Z,{sx:{mt:2},children:f.map((function(t){return(0,u.jsx)(s.Z,{noWrap:!0,href:t,variant:"body2",target:"_blank",rel:"noopener",sx:{display:"table"},children:t},t)}))})]})}function p(){return(0,u.jsx)(i.Z,{component:"span",sx:{width:4,height:4,borderRadius:"50%",bgcolor:"text.disabled"}})}},1648:function(t,e,r){r.d(e,{Z:function(){return m},S:function(){return i}});var n=r(29439),o=r(88391);function i(){var t=(0,o.useState)(null),e=(0,n.Z)(t,2),r=e[0],i=e[1];return{open:r,onOpen:(0,o.useCallback)((function(t){i(t.currentTarget)}),[]),onClose:(0,o.useCallback)((function(){i(null)}),[]),setOpen:i}}var a=r(4942),l=r(1413),c=r(45987),s=r(49988),d=r(95914);var u=r(34684),h=r(35305);function g(t){var e=(null===t||void 0===t?void 0:t.color)||"#000000",r=(null===t||void 0===t?void 0:t.blur)||6,n=(null===t||void 0===t?void 0:t.opacity)||.8,o=null===t||void 0===t?void 0:t.imgUrl;return o?{position:"relative",backgroundImage:"url(".concat(o,")"),"&:before":{position:"absolute",top:0,left:0,zIndex:9,content:'""',width:"100%",height:"100%",backdropFilter:"blur(".concat(r,"px)"),WebkitBackdropFilter:"blur(".concat(r,"px)"),backgroundColor:(0,h.Fq)(e,n)}}:{backdropFilter:"blur(".concat(r,"px)"),WebkitBackdropFilter:"blur(".concat(r,"px)"),backgroundColor:(0,h.Fq)(e,n)}}var f=(0,u.ZP)("span")((function(t){var e=t.arrow,r=t.theme,n=-6.5,o={top:n,transform:"rotate(135deg)"},i={bottom:n,transform:"rotate(-45deg)"},a={left:n,transform:"rotate(45deg)"},c={right:n,transform:"rotate(-135deg)"};return(0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)((0,l.Z)({width:14,height:14,position:"absolute",borderBottomLeftRadius:3.5,clipPath:"polygon(0% 0%, 100% 100%, 0% 100%)",border:"solid 1px ".concat((0,h.Fq)("light"===r.palette.mode?r.palette.grey[500]:r.palette.common.black,.12))},g({color:r.palette.background.paper})),"top-left"===e&&(0,l.Z)((0,l.Z)({},o),{},{left:20})),"top-center"===e&&(0,l.Z)((0,l.Z)({},o),{},{left:0,right:0,margin:"auto"})),"top-right"===e&&(0,l.Z)((0,l.Z)({},o),{},{right:20})),"bottom-left"===e&&(0,l.Z)((0,l.Z)({},i),{},{left:20})),"bottom-center"===e&&(0,l.Z)((0,l.Z)({},i),{},{left:0,right:0,margin:"auto"})),"bottom-right"===e&&(0,l.Z)((0,l.Z)({},i),{},{right:20})),"left-top"===e&&(0,l.Z)((0,l.Z)({},a),{},{top:20})),"left-center"===e&&(0,l.Z)((0,l.Z)({},a),{},{top:0,bottom:0,margin:"auto"})),"left-bottom"===e&&(0,l.Z)((0,l.Z)({},a),{},{bottom:20})),"right-top"===e&&(0,l.Z)((0,l.Z)({},c),{},{top:20})),"right-center"===e&&(0,l.Z)((0,l.Z)({},c),{},{top:0,bottom:0,margin:"auto"})),"right-bottom"===e&&(0,l.Z)((0,l.Z)({},c),{},{bottom:20}))})),p=r(23712),Z=["open","children","arrow","hiddenArrow","sx"];function m(t){var e=t.open,r=t.children,n=t.arrow,o=void 0===n?"top-right":n,i=t.hiddenArrow,u=t.sx,h=(0,c.Z)(t,Z),g=function(t){var e;switch(t){case"top-left":e={style:{ml:-.75},anchorOrigin:{vertical:"bottom",horizontal:"left"},transformOrigin:{vertical:"top",horizontal:"left"}};break;case"top-center":e={style:{},anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"}};break;case"top-right":default:e={style:{ml:.75},anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"right"}};break;case"bottom-left":e={style:{ml:-.75},anchorOrigin:{vertical:"top",horizontal:"left"},transformOrigin:{vertical:"bottom",horizontal:"left"}};break;case"bottom-center":e={style:{},anchorOrigin:{vertical:"top",horizontal:"center"},transformOrigin:{vertical:"bottom",horizontal:"center"}};break;case"bottom-right":e={style:{ml:.75},anchorOrigin:{vertical:"top",horizontal:"right"},transformOrigin:{vertical:"bottom",horizontal:"right"}};break;case"left-top":e={style:{mt:-.75},anchorOrigin:{vertical:"top",horizontal:"right"},transformOrigin:{vertical:"top",horizontal:"left"}};break;case"left-center":e={anchorOrigin:{vertical:"center",horizontal:"right"},transformOrigin:{vertical:"center",horizontal:"left"}};break;case"left-bottom":e={style:{mt:.75},anchorOrigin:{vertical:"bottom",horizontal:"right"},transformOrigin:{vertical:"bottom",horizontal:"left"}};break;case"right-top":e={style:{mt:-.75},anchorOrigin:{vertical:"top",horizontal:"left"},transformOrigin:{vertical:"top",horizontal:"right"}};break;case"right-center":e={anchorOrigin:{vertical:"center",horizontal:"left"},transformOrigin:{vertical:"center",horizontal:"right"}};break;case"right-bottom":e={style:{mt:.75},anchorOrigin:{vertical:"bottom",horizontal:"left"},transformOrigin:{vertical:"bottom",horizontal:"right"}}}return e}(o),m=g.style,x=g.anchorOrigin,v=g.transformOrigin;return(0,p.jsxs)(d.ZP,(0,l.Z)((0,l.Z)({open:Boolean(e),anchorEl:e,anchorOrigin:x,transformOrigin:v,slotProps:{paper:{sx:(0,l.Z)((0,l.Z)({width:"auto",overflow:"inherit"},m),{},(0,a.Z)({},"& .".concat(s.Z.root),{"& svg":{mr:2,flexShrink:0}}),u)}}},h),{},{children:[!i&&(0,p.jsx)(f,{arrow:o}),r]}))}},56062:function(t,e,r){r.d(e,{Z:function(){return g}});var n=r(1413),o=r(45987),i=r(88391),a=r(83182),l=r(30461),c=r(34684),s=r(35305),d=(0,c.ZP)(l.Z)((function(t){var e=t.theme,r=t.ownerState,o="light"===e.palette.mode,i="filled"===r.variant,a="outlined"===r.variant,l="soft"===r.variant,c=(0,n.Z)({},"default"===r.color&&(0,n.Z)((0,n.Z)({},a&&{backgroundColor:"transparent",color:e.palette.text.primary,border:"1px solid ".concat((0,s.Fq)(e.palette.grey[500],.32))}),l&&{color:o?e.palette.text.primary:e.palette.common.white,backgroundColor:(0,s.Fq)(e.palette.grey[500],.16)})),d=(0,n.Z)({},"default"!==r.color&&(0,n.Z)((0,n.Z)((0,n.Z)({},i&&{color:e.palette[r.color].contrastText,backgroundColor:e.palette[r.color].main}),a&&{backgroundColor:"transparent",color:e.palette[r.color].main,border:"1px solid ".concat(e.palette[r.color].main)}),l&&{color:e.palette[r.color][o?"dark":"light"],backgroundColor:(0,s.Fq)(e.palette[r.color].main,.16)}));return(0,n.Z)((0,n.Z)({height:24,minWidth:22,lineHeight:0,borderRadius:6,cursor:"default",alignItems:"center",whiteSpace:"nowrap",display:"inline-flex",justifyContent:"center",textTransform:"capitalize",padding:e.spacing(0,1),color:e.palette.grey[800],fontSize:e.typography.pxToRem(12),fontFamily:e.typography.fontFamily,backgroundColor:e.palette.grey[300],fontWeight:e.typography.fontWeightBold},d),c)})),u=r(23712),h=["children","color","variant","startIcon","endIcon","sx"],g=(0,i.forwardRef)((function(t,e){var r=t.children,i=t.color,c=void 0===i?"default":i,s=t.variant,g=void 0===s?"soft":s,f=t.startIcon,p=t.endIcon,Z=t.sx,m=(0,o.Z)(t,h),x=(0,a.Z)(),v={width:16,height:16,"& svg, img":{width:1,height:1,objectFit:"cover"}};return(0,u.jsxs)(d,(0,n.Z)((0,n.Z)({ref:e,component:"span",ownerState:{color:c,variant:g},sx:(0,n.Z)((0,n.Z)((0,n.Z)({},f&&{pl:.75}),p&&{pr:.75}),Z),theme:x},m),{},{children:[f&&(0,u.jsxs)(l.Z,{sx:(0,n.Z)({mr:.75},v),children:[" ",f," "]}),r,p&&(0,u.jsxs)(l.Z,{sx:(0,n.Z)({ml:.75},v),children:[" ",p," "]})]}))}))},11769:function(t,e,r){function n(t,e,r){return t?Math.max(0,(1+t)*e-r):0}function o(t,e,r){return e[r]<t[r]?-1:e[r]>t[r]?1:0}function i(t,e){return"desc"===t?function(t,r){return o(t,r,e)}:function(t,r){return-o(t,r,e)}}r.d(e,{$W:function(){return k},K:function(){return S},et:function(){return b},S_:function(){return B},Z4:function(){return P},fQ:function(){return n},sQ:function(){return i},x6:function(){return s}});var a=r(93433),l=r(29439),c=r(88391);function s(t){var e=(0,c.useState)(!(null===t||void 0===t||!t.defaultDense)),r=(0,l.Z)(e,2),n=r[0],o=r[1],i=(0,c.useState)((null===t||void 0===t?void 0:t.defaultCurrentPage)||0),s=(0,l.Z)(i,2),d=s[0],u=s[1],h=(0,c.useState)((null===t||void 0===t?void 0:t.defaultOrderBy)||"name"),g=(0,l.Z)(h,2),f=g[0],p=g[1],Z=(0,c.useState)((null===t||void 0===t?void 0:t.defaultRowsPerPage)||15),m=(0,l.Z)(Z,2),x=m[0],v=m[1],b=(0,c.useState)((null===t||void 0===t?void 0:t.defaultOrder)||"asc"),k=(0,l.Z)(b,2),w=k[0],y=k[1],j=(0,c.useState)((null===t||void 0===t?void 0:t.defaultSelected)||[]),C=(0,l.Z)(j,2),O=C[0],S=C[1],z=(0,c.useCallback)((function(t){""!==t&&(y(f===t&&"asc"===w?"desc":"asc"),p(t))}),[w,f]),P=(0,c.useCallback)((function(t){var e=O.includes(t)?O.filter((function(e){return e!==t})):[].concat((0,a.Z)(O),[t]);S(e)}),[O]),R=(0,c.useCallback)((function(t){u(0),v(parseInt(t.target.value,10))}),[]),F=(0,c.useCallback)((function(t){o(t.target.checked)}),[]),I=(0,c.useCallback)((function(t,e){S(t?e:[])}),[]),_=(0,c.useCallback)((function(t,e){u(e)}),[]),B=(0,c.useCallback)((function(){u(0)}),[]),D=(0,c.useCallback)((function(t){S([]),d&&t<2&&u(d-1)}),[d]),W=(0,c.useCallback)((function(t){var e=t.totalRows,r=t.totalRowsInPage,n=t.totalRowsFiltered,o=O.length;if(S([]),d)if(o===r)u(d-1);else if(o===n)u(0);else if(o>r){var i=Math.ceil((e-o)/x)-1;u(i)}}),[d,x,O.length]);return{dense:n,order:w,page:d,orderBy:f,rowsPerPage:x,selected:O,onSelectRow:P,onSelectAllRows:I,onSort:z,onChangePage:_,onChangeDense:F,onResetPage:B,onChangeRowsPerPage:R,onUpdatePageDeleteRow:D,onUpdatePageDeleteRows:W,setPage:u,setDense:o,setOrder:y,setOrderBy:p,setSelected:S,setRowsPerPage:v}}var d=r(1413),u=r(60483),h=r(14062),g=r(45987),f=r(37796),p=r(95590),Z=r(21515),m=r(23712),x=["title","description","img","sx"];function v(t){var e=t.title,r=t.description,n=t.img,o=t.sx,i=(0,g.Z)(t,x);return(0,m.jsxs)(f.Z,(0,d.Z)((0,d.Z)({alignItems:"center",justifyContent:"center",sx:(0,d.Z)({height:1,textAlign:"center",p:function(t){return t.spacing(8,2)}},o)},i),{},{children:[(0,m.jsx)(Z.Z,{disabledEffect:!0,alt:"empty content",src:n||"/assets/illustrations/illustration_empty_content.svg",sx:{height:240,mb:3}}),(0,m.jsx)(p.Z,{variant:"h5",gutterBottom:!0,children:e}),r&&(0,m.jsx)(p.Z,{variant:"body2",sx:{color:"text.secondary"},children:r})]}))}function b(t){var e=t.notFound,r=t.sx;return(0,m.jsx)(u.Z,{children:e?(0,m.jsx)(h.Z,{colSpan:12,children:(0,m.jsx)(v,{filled:!0,title:"Nessun dato disponibile",sx:(0,d.Z)({py:10},r)})}):(0,m.jsx)(h.Z,{colSpan:12,sx:{p:0}})})}function k(t){var e=t.emptyRows,r=t.height;return e?(0,m.jsx)(u.Z,{sx:(0,d.Z)({},r&&{height:r*e}),children:(0,m.jsx)(h.Z,{colSpan:9})}):null}var w=r(30461),y=r(66930),j=r(88296),C=r(67591),O={border:0,margin:-1,padding:0,width:"1px",height:"1px",overflow:"hidden",position:"absolute",whiteSpace:"nowrap",clip:"rect(0 0 0 0)"};function S(t){var e=t.order,r=t.orderBy,n=t.rowCount,o=void 0===n?0:n,i=t.headLabel,a=t.numSelected,l=void 0===a?0:a,c=t.onSort,s=t.onSelectAllRows,g=t.sx;return(0,m.jsx)(j.Z,{sx:g,children:(0,m.jsxs)(u.Z,{children:[s&&(0,m.jsx)(h.Z,{padding:"checkbox",children:(0,m.jsx)(y.Z,{indeterminate:!!l&&l<o,checked:!!o&&l===o,onChange:function(t){return s(t.target.checked)}})}),i.map((function(t){return(0,m.jsx)(h.Z,{align:t.align||"left",sortDirection:r===t.id&&e,sx:{width:t.width,minWidth:t.minWidth},children:c?(0,m.jsxs)(C.Z,{hideSortIcon:!0,active:r===t.id,direction:r===t.id?e:"asc",onClick:function(){return c(t.id)},children:[t.label,r===t.id?(0,m.jsx)(w.Z,{sx:(0,d.Z)({},O),children:"desc"===e?"sorted descending":"sorted ascending"}):null]}):t.label},t.id)}))]})})}var z=["dense","action","rowCount","numSelected","onSelectAllRows","sx"];function P(t){var e=t.dense,r=t.action,n=t.rowCount,o=t.numSelected,i=t.onSelectAllRows,a=t.sx,l=(0,g.Z)(t,z);return o?(0,m.jsxs)(f.Z,(0,d.Z)((0,d.Z)({direction:"row",alignItems:"center",sx:(0,d.Z)((0,d.Z)({pl:1,pr:2,top:0,left:0,width:1,zIndex:9,height:58,position:"absolute",bgcolor:"primary.lighter"},e&&{height:38}),a)},l),{},{children:[(0,m.jsx)(y.Z,{indeterminate:!!o&&o<n,checked:!!n&&o===n,onChange:function(t){return i(t.target.checked)}}),(0,m.jsxs)(p.Z,{variant:"subtitle2",sx:(0,d.Z)({ml:2,flexGrow:1,color:"primary.main"},e&&{ml:3}),children:[o," ",o>1?"elementi selezionati":"elemento selezionato"]}),r&&r]})):null}var R=r(40255),F=r(35431),I=r(44836),_=["dense","onChangeDense","rowsPerPageOptions","sx"];function B(t){var e=t.dense,r=t.onChangeDense,n=t.rowsPerPageOptions,o=void 0===n?[15,30,50,100]:n,i=t.sx,a=(0,g.Z)(t,_);return(0,m.jsxs)(w.Z,{sx:(0,d.Z)({position:"relative"},i),children:[(0,m.jsx)(I.Z,(0,d.Z)((0,d.Z)({rowsPerPageOptions:o,component:"div"},a),{},{sx:{borderTopColor:"transparent"}})),r&&(0,m.jsx)(F.Z,{label:"Dense",control:(0,m.jsx)(R.Z,{checked:e,onChange:r}),sx:{pl:2,py:1.5,top:0,position:{sm:"absolute"}}})]})}},40465:function(t,e,r){r.d(e,{k:function(){return i}});var n=r(29439),o=r(88391);function i(t){var e=(0,o.useState)(!!t),r=(0,n.Z)(e,2),i=r[0],a=r[1];return{value:i,onTrue:(0,o.useCallback)((function(){a(!0)}),[]),onFalse:(0,o.useCallback)((function(){a(!1)}),[]),onToggle:(0,o.useCallback)((function(){a((function(t){return!t}))}),[]),setValue:a}}},33549:function(t,e,r){r.d(e,{e_:function(){return i}});var n=r(49993),o=r.n(n);function i(t){return a(t?o()(t).format("\u20ac0,0.00"):"",".00")}function a(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:".00",r=t.includes(e);return r?t.replace(e,""):t}}}]);