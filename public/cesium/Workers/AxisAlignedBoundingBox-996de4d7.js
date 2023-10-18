define(["exports","./Cartesian2-c1eb9da0","./Check-f996273c","./when-ae2e0b60","./Transforms-5a0f5c0d"],function(e,x,n,h,t){"use strict";function y(e,n,i){this.minimum=x.Cartesian3.clone(h.defaultValue(e,x.Cartesian3.ZERO)),this.maximum=x.Cartesian3.clone(h.defaultValue(n,x.Cartesian3.ZERO)),i=h.defined(i)?x.Cartesian3.clone(i):x.Cartesian3.midpoint(this.minimum,this.maximum,new x.Cartesian3),this.center=i}y.fromPoints=function(e,n){if(h.defined(n)||(n=new y),h.defined(e)&&0!==e.length){for(var i=e[0].x,a=e[0].y,t=e[0].z,m=e[0].x,r=e[0].y,s=e[0].z,u=e.length,c=1;c<u;c++)var o=e[c],l=o.x,C=o.y,o=o.z,i=Math.min(l,i),m=Math.max(l,m),a=Math.min(C,a),r=Math.max(C,r),t=Math.min(o,t),s=Math.max(o,s);var f=n.minimum,d=(f.x=i,f.y=a,f.z=t,n.maximum);d.x=m,d.y=r,d.z=s,n.center=x.Cartesian3.midpoint(f,d,n.center)}else n.minimum=x.Cartesian3.clone(x.Cartesian3.ZERO,n.minimum),n.maximum=x.Cartesian3.clone(x.Cartesian3.ZERO,n.maximum),n.center=x.Cartesian3.clone(x.Cartesian3.ZERO,n.center);return n},y.clone=function(e,n){if(h.defined(e))return h.defined(n)?(n.minimum=x.Cartesian3.clone(e.minimum,n.minimum),n.maximum=x.Cartesian3.clone(e.maximum,n.maximum),n.center=x.Cartesian3.clone(e.center,n.center),n):new y(e.minimum,e.maximum,e.center)},y.equals=function(e,n){return e===n||h.defined(e)&&h.defined(n)&&x.Cartesian3.equals(e.center,n.center)&&x.Cartesian3.equals(e.minimum,n.minimum)&&x.Cartesian3.equals(e.maximum,n.maximum)};var m=new x.Cartesian3;y.intersectPlane=function(e,n){m=x.Cartesian3.subtract(e.maximum,e.minimum,m);var i=x.Cartesian3.multiplyByScalar(m,.5,m),a=n.normal,i=i.x*Math.abs(a.x)+i.y*Math.abs(a.y)+i.z*Math.abs(a.z),e=x.Cartesian3.dot(e.center,a)+n.distance;return 0<e-i?t.Intersect.INSIDE:e+i<0?t.Intersect.OUTSIDE:t.Intersect.INTERSECTING},y.prototype.clone=function(e){return y.clone(this,e)},y.prototype.intersectPlane=function(e){return y.intersectPlane(this,e)},y.prototype.equals=function(e){return y.equals(this,e)},e.AxisAlignedBoundingBox=y});
