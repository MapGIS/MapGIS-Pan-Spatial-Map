define(["exports","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./when-ae2e0b60","./EllipsoidRhumbLine-2fd480f5","./GeometryAttribute-b0d1422a","./Math-5bbcea10","./WebGLConstants-35626ea2"],function(e,L,p,D,G,O,T,W,t){"use strict";function n(e,t,n){n=n||2;var r,a,i,x,u,o=t&&t.length,s=o?t[0]*n:e.length,p=v(e,0,s,n,!0),h=[];if(p&&p.next!==p.prev){if(o&&(p=function(e,t,n,r){var a,i,x,u,o=[];for(a=0,i=t.length;a<i;a++)u=t[a]*r,x=a<i-1?t[a+1]*r:e.length,(u=v(e,u,x,r,!1))===u.next&&(u.steiner=!0),o.push(function(e){var t=e,n=e;for(;(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next,t!==e;);return n}(u));for(o.sort(d),a=0;a<o.length;a++)!function(e,t){(t=function(e,t){var n,r=t,a=e.x,i=e.y,x=-1/0;do{if(i<=r.y&&i>=r.next.y&&r.next.y!==r.y){var u=r.x+(i-r.y)*(r.next.x-r.x)/(r.next.y-r.y);if(u<=a&&x<u){if((x=u)===a){if(i===r.y)return r;if(i===r.next.y)return r.next}n=r.x<r.next.x?r:r.next}}}while(r=r.next,r!==t);if(!n)return null;if(a!==x){var o,s=n,p=n.x,h=n.y,f=1/0;for(r=n;a>=r.x&&r.x>=p&&a!==r.x&&z(i<h?a:x,i,p,h,i<h?x:a,i,r.x,r.y)&&(o=Math.abs(i-r.y)/(a-r.x),B(r,e))&&(o<f||o===f&&(r.x>n.x||r.x===n.x&&function(e,t){return R(e.prev,e,t.prev)<0&&R(t.next,e,e.next)<0}(n,r)))&&(n=r,f=o),(r=r.next)!==s;);}return n}(e,t))&&Z(t=N(t,e),t.next)}(o[a],n),n=Z(n,n.next);return n}(e,t,p,n)),e.length>80*n){for(var f=r=e[0],l=a=e[1],y=n;y<s;y+=n)(i=e[y])<f&&(f=i),(x=e[y+1])<l&&(l=x),r<i&&(r=i),a<x&&(a=x);u=0!==(u=Math.max(r-f,a-l))?1/u:0}S(p,h,n,f,l,u)}return h}function v(e,t,n,r,a){var i,x;if(a===0<c(e,t,n,r))for(i=t;i<n;i+=r)x=u(i,e[i],e[i+1],x);else for(i=n-r;t<=i;i-=r)x=u(i,e[i],e[i+1],x);return x&&P(x,x.next)&&(U(x),x=x.next),x}function Z(e,t){if(!e)return e;t=t||e;var n,r=e;do{if(n=!1,r.steiner||!P(r,r.next)&&0!==R(r.prev,r,r.next))r=r.next;else{if(U(r),(r=t=r.prev)===r.next)break;n=!0}}while(n||r!==t);return t}function S(e,t,n,r,a,i,x){if(e){if(!x&&i){for(var u=e,o=r,s=a,p=i,h=u;null===h.z&&(h.z=A(h.x,h.y,o,s,p)),h.prevZ=h.prev,h.nextZ=h.next,(h=h.next)!==u;);h.prevZ.nextZ=null,h.prevZ=null;var f,l,y,v,c,d,m,C,g=h,b=1;do{for(l=g,c=g=null,d=0;l;){for(d++,y=l,f=m=0;f<b&&(m++,y=y.nextZ);f++);for(C=b;0<m||0<C&&y;)0!==m&&(0===C||!y||l.z<=y.z)?(l=(v=l).nextZ,m--):(y=(v=y).nextZ,C--),c?c.nextZ=v:g=v,v.prevZ=c,c=v;l=y}}while(c.nextZ=null,b*=2,1<d)}for(var w,E,M=e;e.prev!==e.next;)if(w=e.prev,E=e.next,i?function(e,t,n,r){var a=e.prev,i=e,x=e.next;if(0<=R(a,i,x))return;var u=(a.x<i.x?a.x<x.x?a:x:i.x<x.x?i:x).x,o=(a.y<i.y?a.y<x.y?a:x:i.y<x.y?i:x).y,s=(a.x>i.x?a.x>x.x?a:x:i.x>x.x?i:x).x,p=(a.y>i.y?a.y>x.y?a:x:i.y>x.y?i:x).y,h=A(u,o,t,n,r),f=A(s,p,t,n,r),l=e.prevZ,y=e.nextZ;for(;l&&l.z>=h&&y&&y.z<=f;){if(l!==e.prev&&l!==e.next&&z(a.x,a.y,i.x,i.y,x.x,x.y,l.x,l.y)&&0<=R(l.prev,l,l.next))return;if(l=l.prevZ,y!==e.prev&&y!==e.next&&z(a.x,a.y,i.x,i.y,x.x,x.y,y.x,y.y)&&0<=R(y.prev,y,y.next))return;y=y.nextZ}for(;l&&l.z>=h;){if(l!==e.prev&&l!==e.next&&z(a.x,a.y,i.x,i.y,x.x,x.y,l.x,l.y)&&0<=R(l.prev,l,l.next))return;l=l.prevZ}for(;y&&y.z<=f;){if(y!==e.prev&&y!==e.next&&z(a.x,a.y,i.x,i.y,x.x,x.y,y.x,y.y)&&0<=R(y.prev,y,y.next))return;y=y.nextZ}return 1}(e,r,a,i):function(e){var t=e.prev,n=e,r=e.next;if(0<=R(t,n,r))return;var a=e.next.next;for(;a!==e.prev;){if(z(t.x,t.y,n.x,n.y,r.x,r.y,a.x,a.y)&&0<=R(a.prev,a,a.next))return;a=a.next}return 1}(e))t.push(w.i/n),t.push(e.i/n),t.push(E.i/n),U(e),e=E.next,M=E.next;else if((e=E)===M){x?1===x?S(e=function(e,t,n){var r=e;do{var a=r.prev,i=r.next.next}while(!P(a,i)&&I(a,r,r.next,i)&&B(a,i)&&B(i,a)&&(t.push(a.i/n),t.push(r.i/n),t.push(i.i/n),U(r),U(r.next),r=e=i),r=r.next,r!==e);return Z(r)}(Z(e),t,n),t,n,r,a,i,2):2===x&&function(e,t,n,r,a,i){var x=e;do{for(var u,o=x.next.next;o!==x.prev;){if(x.i!==o.i&&function(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!function(e,t){var n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&I(n,n.next,e,t))return 1}while(n=n.next,n!==e);return}(e,t)&&(B(e,t)&&B(t,e)&&function(e,t){var n=e,r=!1,a=(e.x+t.x)/2,i=(e.y+t.y)/2;for(;n.y>i!=n.next.y>i&&n.next.y!==n.y&&a<(n.next.x-n.x)*(i-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next,n!==e;);return r}(e,t)&&(R(e.prev,e,t.prev)||R(e,t.prev,t))||P(e,t)&&0<R(e.prev,e,e.next)&&0<R(t.prev,t,t.next))}(x,o))return u=N(x,o),x=Z(x,x.next),u=Z(u,u.next),S(x,t,n,r,a,i),S(u,t,n,r,a,i);o=o.next}}while(x=x.next,x!==e)}(e,t,n,r,a,i):S(Z(e),t,n,r,a,i,1);break}}}function d(e,t){return e.x-t.x}function A(e,t,n,r,a){return(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=32767*(e-n)*a)|e<<8))|e<<4))|e<<2))|e<<1))|(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=32767*(t-r)*a)|t<<8))|t<<4))|t<<2))|t<<1))<<1}function z(e,t,n,r,a,i,x,u){return 0<=(a-x)*(t-u)-(e-x)*(i-u)&&0<=(e-x)*(r-u)-(n-x)*(t-u)&&0<=(n-x)*(i-u)-(a-x)*(r-u)}function R(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function P(e,t){return e.x===t.x&&e.y===t.y}function I(e,t,n,r){var a=s(R(e,t,n)),i=s(R(e,t,r)),x=s(R(n,r,e)),u=s(R(n,r,t));return a!==i&&x!==u||0===a&&o(e,n,t)||0===i&&o(e,r,t)||0===x&&o(n,e,r)||!(0!==u||!o(n,t,r))}function o(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function s(e){return 0<e?1:e<0?-1:0}function B(e,t){return R(e.prev,e,e.next)<0?0<=R(e,t,e.next)&&0<=R(e,e.prev,t):R(e,t,e.prev)<0||R(e,e.next,t)<0}function N(e,t){var n=new x(e.i,e.x,e.y),r=new x(t.i,t.x,t.y),a=e.next,i=t.prev;return(e.next=t).prev=e,(n.next=a).prev=n,(r.next=n).prev=r,(i.next=r).prev=i,r}function u(e,t,n,r){e=new x(e,t,n);return r?(e.next=r.next,(e.prev=r).next.prev=e,r.next=e):(e.prev=e).next=e,e}function U(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function x(e,t,n){this.i=e,this.x=t,this.y=n,this.prev=null,this.next=null,this.z=null,this.prevZ=null,this.nextZ=null,this.steiner=!1}function c(e,t,n,r){for(var a=0,i=t,x=n-r;i<n;i+=r)a+=(e[x]-e[i])*(e[i+1]+e[x+1]),x=i;return a}n.deviation=function(e,t,n,r){var a=t&&t.length,i=a?t[0]*n:e.length,x=Math.abs(c(e,0,i,n));if(a)for(var u=0,o=t.length;u<o;u++){var s=t[u]*n,p=u<o-1?t[u+1]*n:e.length;x-=Math.abs(c(e,s,p,n))}for(var h=0,u=0;u<r.length;u+=3){var f=r[u]*n,l=r[u+1]*n,y=r[u+2]*n;h+=Math.abs((e[f]-e[y])*(e[1+l]-e[1+f])-(e[f]-e[l])*(e[1+y]-e[1+f]))}return 0===x&&0===h?0:Math.abs((h-x)/x)},n.flatten=function(e){for(var t=e[0][0].length,n={vertices:[],holes:[],dimensions:t},r=0,a=0;a<e.length;a++){for(var i=0;i<e[a].length;i++)for(var x=0;x<t;x++)n.vertices.push(e[a][i][x]);0<a&&(r+=e[a-1].length,n.holes.push(r))}return n};var r={CLOCKWISE:t.WebGLConstants.CW,COUNTER_CLOCKWISE:t.WebGLConstants.CCW,validate:function(e){return e===r.CLOCKWISE||e===r.COUNTER_CLOCKWISE}},a=Object.freeze(r),h=new L.Cartesian3,f=new L.Cartesian3,i={computeArea2D:function(e){for(var t=e.length,n=0,r=t-1,a=0;a<t;r=a++){var i=e[r],x=e[a];n+=i.x*x.y-x.x*i.y}return.5*n},computeWindingOrder2D:function(e){return 0<i.computeArea2D(e)?a.COUNTER_CLOCKWISE:a.CLOCKWISE},triangulate:function(e,t){return n(L.Cartesian2.packArray(e),t,2)}},_=new L.Cartesian3,K=new L.Cartesian3,V=new L.Cartesian3,k=new L.Cartesian3,q=new L.Cartesian3,F=new L.Cartesian3,j=new L.Cartesian3,J=(i.computeSubdivision=function(e,t,n,r){r=G.defaultValue(r,W.CesiumMath.RADIANS_PER_DEGREE);for(var a=n.slice(0),i=t.length,x=new Array(3*i),u=0,o=0;o<i;o++){var s=t[o];x[u++]=s.x,x[u++]=s.y,x[u++]=s.z}for(var p=[],h={},f=e.maximumRadius,n=W.CesiumMath.chordLength(r,f),l=n*n;0<a.length;){var y,v,c=a.pop(),d=a.pop(),m=a.pop(),C=L.Cartesian3.fromArray(x,3*m,_),g=L.Cartesian3.fromArray(x,3*d,K),b=L.Cartesian3.fromArray(x,3*c,V),w=L.Cartesian3.multiplyByScalar(L.Cartesian3.normalize(C,k),f,k),E=L.Cartesian3.multiplyByScalar(L.Cartesian3.normalize(g,q),f,q),M=L.Cartesian3.multiplyByScalar(L.Cartesian3.normalize(b,F),f,F),Z=L.Cartesian3.magnitudeSquared(L.Cartesian3.subtract(w,E,j)),E=L.Cartesian3.magnitudeSquared(L.Cartesian3.subtract(E,M,j)),M=L.Cartesian3.magnitudeSquared(L.Cartesian3.subtract(M,w,j)),w=Math.max(Z,E,M);l<w?Z===w?(o=h[y=Math.min(m,d)+" "+Math.max(m,d)],G.defined(o)||(v=L.Cartesian3.add(C,g,j),L.Cartesian3.multiplyByScalar(v,.5,v),x.push(v.x,v.y,v.z),o=x.length/3-1,h[y]=o),a.push(m,o,c),a.push(o,d,c)):E===w?(o=h[y=Math.min(d,c)+" "+Math.max(d,c)],G.defined(o)||(v=L.Cartesian3.add(g,b,j),L.Cartesian3.multiplyByScalar(v,.5,v),x.push(v.x,v.y,v.z),o=x.length/3-1,h[y]=o),a.push(d,o,m),a.push(o,c,m)):M===w&&(o=h[y=Math.min(c,m)+" "+Math.max(c,m)],G.defined(o)||(v=L.Cartesian3.add(b,C,j),L.Cartesian3.multiplyByScalar(v,.5,v),x.push(v.x,v.y,v.z),o=x.length/3-1,h[y]=o),a.push(c,o,d),a.push(o,m,d)):(p.push(m),p.push(d),p.push(c))}return new T.Geometry({attributes:{position:new T.GeometryAttribute({componentDatatype:D.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:x})},indices:p,primitiveType:T.PrimitiveType.TRIANGLES})},new L.Cartographic),Q=new L.Cartographic,X=new L.Cartographic,H=new L.Cartographic;i.computeRhumbLineSubdivision=function(e,t,n,r){r=G.defaultValue(r,W.CesiumMath.RADIANS_PER_DEGREE);for(var a=n.slice(0),i=t.length,x=new Array(3*i),u=0,o=0;o<i;o++){var s=t[o];x[u++]=s.x,x[u++]=s.y,x[u++]=s.z}for(var p=[],h={},n=e.maximumRadius,f=W.CesiumMath.chordLength(r,n),l=new O.EllipsoidRhumbLine(void 0,void 0,e),y=new O.EllipsoidRhumbLine(void 0,void 0,e),v=new O.EllipsoidRhumbLine(void 0,void 0,e);0<a.length;){var c,d,m,C,g=a.pop(),b=a.pop(),w=a.pop(),E=L.Cartesian3.fromArray(x,3*w,_),M=L.Cartesian3.fromArray(x,3*b,K),Z=L.Cartesian3.fromArray(x,3*g,V),E=e.cartesianToCartographic(E,J),M=e.cartesianToCartographic(M,Q),Z=e.cartesianToCartographic(Z,X),S=(l.setEndPoints(E,M),l.surfaceDistance),A=(y.setEndPoints(M,Z),y.surfaceDistance),z=(v.setEndPoints(Z,E),v.surfaceDistance),R=Math.max(S,A,z);f<R?S===R?(o=h[c=Math.min(w,b)+" "+Math.max(w,b)],G.defined(o)||(d=l.interpolateUsingFraction(.5,H),m=.5*(E.height+M.height),C=L.Cartesian3.fromRadians(d.longitude,d.latitude,m,e,j),x.push(C.x,C.y,C.z),o=x.length/3-1,h[c]=o),a.push(w,o,g),a.push(o,b,g)):A===R?(o=h[c=Math.min(b,g)+" "+Math.max(b,g)],G.defined(o)||(d=y.interpolateUsingFraction(.5,H),m=.5*(M.height+Z.height),C=L.Cartesian3.fromRadians(d.longitude,d.latitude,m,e,j),x.push(C.x,C.y,C.z),o=x.length/3-1,h[c]=o),a.push(b,o,w),a.push(o,g,w)):z===R&&(o=h[c=Math.min(g,w)+" "+Math.max(g,w)],G.defined(o)||(d=v.interpolateUsingFraction(.5,H),m=.5*(Z.height+E.height),C=L.Cartesian3.fromRadians(d.longitude,d.latitude,m,e,j),x.push(C.x,C.y,C.z),o=x.length/3-1,h[c]=o),a.push(g,o,b),a.push(o,w,b)):(p.push(w),p.push(b),p.push(g))}return new T.Geometry({attributes:{position:new T.GeometryAttribute({componentDatatype:D.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:x})},indices:p,primitiveType:T.PrimitiveType.TRIANGLES})},i.scaleToGeodeticHeight=function(e,t,n,r){n=G.defaultValue(n,L.Ellipsoid.WGS84);var a=h,i=f;if(t=G.defaultValue(t,0),r=G.defaultValue(r,!0),G.defined(e))for(var x=e.length,u=0;u<x;u+=3)L.Cartesian3.fromArray(e,u,i),r&&(i=n.scaleToGeodeticSurface(i,i)),0!==t&&(a=n.geodeticSurfaceNormal(i,a),L.Cartesian3.multiplyByScalar(a,t,a),L.Cartesian3.add(i,a,i)),e[u]=i.x,e[u+1]=i.y,e[u+2]=i.z;return e},e.PolygonPipeline=i,e.WindingOrder=a});
