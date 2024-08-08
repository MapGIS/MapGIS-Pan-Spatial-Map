define(["exports","./Matrix2-10a61a55","./RuntimeError-24b14c10","./when-ae2e0b60","./Transforms-70ded1e8"],function(e,f,n,h,a){"use strict";function y(e,n,i){this.minimum=f.Cartesian3.clone(h.defaultValue(e,f.Cartesian3.ZERO)),this.maximum=f.Cartesian3.clone(h.defaultValue(n,f.Cartesian3.ZERO)),i=h.defined(i)?f.Cartesian3.clone(i):f.Cartesian3.midpoint(this.minimum,this.maximum,new f.Cartesian3),this.center=i}y.fromPoints=function(e,n){if(h.defined(n)||(n=new y),h.defined(e)&&0!==e.length){for(var i=e[0].x,t=e[0].y,a=e[0].z,m=e[0].x,r=e[0].y,s=e[0].z,u=e.length,c=1;c<u;c++)var o=e[c],l=o.x,x=o.y,o=o.z,i=Math.min(l,i),m=Math.max(l,m),t=Math.min(x,t),r=Math.max(x,r),a=Math.min(o,a),s=Math.max(o,s);var d=n.minimum,C=(d.x=i,d.y=t,d.z=a,n.maximum);C.x=m,C.y=r,C.z=s,n.center=f.Cartesian3.midpoint(d,C,n.center)}else n.minimum=f.Cartesian3.clone(f.Cartesian3.ZERO,n.minimum),n.maximum=f.Cartesian3.clone(f.Cartesian3.ZERO,n.maximum),n.center=f.Cartesian3.clone(f.Cartesian3.ZERO,n.center);return n},y.clone=function(e,n){if(h.defined(e))return h.defined(n)?(n.minimum=f.Cartesian3.clone(e.minimum,n.minimum),n.maximum=f.Cartesian3.clone(e.maximum,n.maximum),n.center=f.Cartesian3.clone(e.center,n.center),n):new y(e.minimum,e.maximum,e.center)},y.equals=function(e,n){return e===n||h.defined(e)&&h.defined(n)&&f.Cartesian3.equals(e.center,n.center)&&f.Cartesian3.equals(e.minimum,n.minimum)&&f.Cartesian3.equals(e.maximum,n.maximum)};var m=new f.Cartesian3;y.intersectPlane=function(e,n){m=f.Cartesian3.subtract(e.maximum,e.minimum,m);var i=f.Cartesian3.multiplyByScalar(m,.5,m),t=n.normal,i=i.x*Math.abs(t.x)+i.y*Math.abs(t.y)+i.z*Math.abs(t.z),e=f.Cartesian3.dot(e.center,t)+n.distance;return 0<e-i?a.Intersect.INSIDE:e+i<0?a.Intersect.OUTSIDE:a.Intersect.INTERSECTING},y.prototype.clone=function(e){return y.clone(this,e)},y.prototype.intersectPlane=function(e){return y.intersectPlane(this,e)},y.prototype.equals=function(e){return y.equals(this,e)},e.AxisAlignedBoundingBox=y});