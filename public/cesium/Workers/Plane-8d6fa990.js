define(["exports","./Cartesian2-c1eb9da0","./Transforms-badb9ae9","./Check-f996273c","./when-ae2e0b60","./Math-5bbcea10"],function(n,r,i,e,s,a){"use strict";function o(n,e){this.normal=r.Cartesian3.clone(n),this.distance=e}o.fromPointNormal=function(n,e,a){n=-r.Cartesian3.dot(e,n);return s.defined(a)?(r.Cartesian3.clone(e,a.normal),a.distance=n,a):new o(e,n)};var t=new r.Cartesian3,c=(o.fromCartesian4=function(n,e){var a=r.Cartesian3.fromCartesian4(n,t),n=n.w;return s.defined(e)?(r.Cartesian3.clone(a,e.normal),e.distance=n,e):new o(a,n)},o.getPointDistance=function(n,e){return r.Cartesian3.dot(n.normal,e)+n.distance},new r.Cartesian3),l=(o.projectPointOntoPlane=function(n,e,a){s.defined(a)||(a=new r.Cartesian3);var t=o.getPointDistance(n,e),n=r.Cartesian3.multiplyByScalar(n.normal,t,c);return r.Cartesian3.subtract(e,n,a)},new i.Matrix4),C=new i.Cartesian4,d=new r.Cartesian3;o.transform=function(n,e,a){var t=n.normal,n=n.distance,e=i.Matrix4.inverseTranspose(e,l),t=i.Cartesian4.fromElements(t.x,t.y,t.z,n,C),t=i.Matrix4.multiplyByVector(e,t,t),n=r.Cartesian3.fromCartesian4(t,d);return t=i.Cartesian4.divideByScalar(t,r.Cartesian3.magnitude(n),t),o.fromCartesian4(t,a)},o.clone=function(n,e){return s.defined(e)?(r.Cartesian3.clone(n.normal,e.normal),e.distance=n.distance,e):new o(n.normal,n.distance)},o.equals=function(n,e){return n.distance===e.distance&&r.Cartesian3.equals(n.normal,e.normal)},o.ORIGIN_XY_PLANE=Object.freeze(new o(r.Cartesian3.UNIT_Z,0)),o.ORIGIN_YZ_PLANE=Object.freeze(new o(r.Cartesian3.UNIT_X,0)),o.ORIGIN_ZX_PLANE=Object.freeze(new o(r.Cartesian3.UNIT_Y,0)),n.Plane=o});
