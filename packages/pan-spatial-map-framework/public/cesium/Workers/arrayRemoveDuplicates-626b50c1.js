define(["exports","./Check-c47ad5ed","./when-695b7bde","./Math-09ca1a10"],function(e,d,l,i){"use strict";var p=i.CesiumMath.EPSILON10;e.arrayRemoveDuplicates=function(e,c,d,i){if(l.defined(e)){d=l.defaultValue(d,!1);var n=l.defined(i),f=e.length;if(f<2)return e;for(var t,a,h=e[0],r=0,u=-1,s=1;s<f;++s)c(h,t=e[s],p)?(l.defined(a)||(a=e.slice(0,s),r=s-1,u=0),n&&i.push(s)):(l.defined(a)&&(a.push(t),r=s,n&&(u=i.length)),h=t);return d&&c(e[0],e[f-1],p)&&(n&&(l.defined(a)?i.splice(u,0,r):i.push(f-1)),l.defined(a)?--a.length:a=e.slice(0,-1)),l.defined(a)?a:e}}});
