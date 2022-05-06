define(["exports","./Cartesian2-8dbd81c1","./Check-c47ad5ed","./when-695b7bde","./Transforms-afef28e3"],function(e,x,n,h,a){"use strict";function y(e,n,i){this.minimum=x.Cartesian3.clone(h.defaultValue(e,x.Cartesian3.ZERO)),this.maximum=x.Cartesian3.clone(h.defaultValue(n,x.Cartesian3.ZERO)),i=h.defined(i)?x.Cartesian3.clone(i):x.Cartesian3.midpoint(this.minimum,this.maximum,new x.Cartesian3),this.center=i}y.fromPoints=function(e,n){if(h.defined(n)||(n=new y),!h.defined(e)||0===e.length)return n.minimum=x.Cartesian3.clone(x.Cartesian3.ZERO,n.minimum),n.maximum=x.Cartesian3.clone(x.Cartesian3.ZERO,n.maximum),n.center=x.Cartesian3.clone(x.Cartesian3.ZERO,n.center),n;for(var i=e[0].x,t=e[0].y,a=e[0].z,m=e[0].x,o=e[0].y,l=e[0].z,d=e.length,r=1;r<d;r++)var s=e[r],C=s.x,f=s.y,s=s.z,i=Math.min(C,i),m=Math.max(C,m),t=Math.min(f,t),o=Math.max(f,o),a=Math.min(s,a),l=Math.max(s,l);var u=n.minimum,c=(u.x=i,u.y=t,u.z=a,n.maximum);return c.x=m,c.y=o,c.z=l,n.center=x.Cartesian3.midpoint(u,c,n.center),n},y.clone=function(e,n){if(h.defined(e))return h.defined(n)?(n.minimum=x.Cartesian3.clone(e.minimum,n.minimum),n.maximum=x.Cartesian3.clone(e.maximum,n.maximum),n.center=x.Cartesian3.clone(e.center,n.center),n):new y(e.minimum,e.maximum,e.center)},y.equals=function(e,n){return e===n||h.defined(e)&&h.defined(n)&&x.Cartesian3.equals(e.center,n.center)&&x.Cartesian3.equals(e.minimum,n.minimum)&&x.Cartesian3.equals(e.maximum,n.maximum)};var m=new x.Cartesian3;y.intersectPlane=function(e,n){m=x.Cartesian3.subtract(e.maximum,e.minimum,m);var i=x.Cartesian3.multiplyByScalar(m,.5,m),t=n.normal,i=i.x*Math.abs(t.x)+i.y*Math.abs(t.y)+i.z*Math.abs(t.z),e=x.Cartesian3.dot(e.center,t)+n.distance;return 0<e-i?a.Intersect.INSIDE:e+i<0?a.Intersect.OUTSIDE:a.Intersect.INTERSECTING},y.prototype.clone=function(e){return y.clone(this,e)},y.prototype.intersectPlane=function(e){return y.intersectPlane(this,e)},y.prototype.equals=function(e){return y.equals(this,e)},e.AxisAlignedBoundingBox=y});
