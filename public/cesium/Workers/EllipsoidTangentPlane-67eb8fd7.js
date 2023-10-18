define(["exports","./AxisAlignedBoundingBox-fe8fad3e","./Cartesian2-c1eb9da0","./Transforms-8c8e0c6f","./Check-f996273c","./when-ae2e0b60","./IntersectionTests-46ce3a3a","./Plane-0f30f65b"],function(e,n,s,i,t,l,r,a){"use strict";var o=new i.Cartesian4;function c(e,t){e=(t=l.defaultValue(t,s.Ellipsoid.WGS84)).scaleToGeodeticSurface(e);var n=i.Transforms.eastNorthUpToFixedFrame(e,t),t=(this._ellipsoid=t,this._origin=e,this._xAxis=s.Cartesian3.fromCartesian4(i.Matrix4.getColumn(n,0,o)),this._yAxis=s.Cartesian3.fromCartesian4(i.Matrix4.getColumn(n,1,o)),s.Cartesian3.fromCartesian4(i.Matrix4.getColumn(n,2,o)));this._plane=a.Plane.fromPointNormal(e,t)}Object.defineProperties(c.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},origin:{get:function(){return this._origin}},plane:{get:function(){return this._plane}},xAxis:{get:function(){return this._xAxis}},yAxis:{get:function(){return this._yAxis}},zAxis:{get:function(){return this._plane.normal}}});var d=new n.AxisAlignedBoundingBox,f=(c.fromPoints=function(e,t){return new c(n.AxisAlignedBoundingBox.fromPoints(e,d).center,t)},new r.Ray),p=new s.Cartesian3,u=(c.prototype.projectPointOntoPlane=function(e,t){var n=f,e=(n.origin=e,s.Cartesian3.normalize(e,n.direction),r.IntersectionTests.rayPlane(n,this._plane,p));if(l.defined(e)||(s.Cartesian3.negate(n.direction,n.direction),e=r.IntersectionTests.rayPlane(n,this._plane,p)),l.defined(e))return n=s.Cartesian3.subtract(e,this._origin,e),e=s.Cartesian3.dot(this._xAxis,n),n=s.Cartesian3.dot(this._yAxis,n),l.defined(t)?(t.x=e,t.y=n,t):new s.Cartesian2(e,n)},c.prototype.projectPointsOntoPlane=function(e,t){l.defined(t)||(t=[]);for(var n=0,i=e.length,r=0;r<i;r++){var a=this.projectPointOntoPlane(e[r],t[n]);l.defined(a)&&(t[n]=a,n++)}return t.length=n,t},c.prototype.projectPointToNearestOnPlane=function(e,t){l.defined(t)||(t=new s.Cartesian2);var n=f,e=(n.origin=e,s.Cartesian3.clone(this._plane.normal,n.direction),r.IntersectionTests.rayPlane(n,this._plane,p)),n=(l.defined(e)||(s.Cartesian3.negate(n.direction,n.direction),e=r.IntersectionTests.rayPlane(n,this._plane,p)),s.Cartesian3.subtract(e,this._origin,e)),e=s.Cartesian3.dot(this._xAxis,n),n=s.Cartesian3.dot(this._yAxis,n);return t.x=e,t.y=n,t},c.prototype.projectPointsToNearestOnPlane=function(e,t){l.defined(t)||(t=[]);var n=e.length;t.length=n;for(var i=0;i<n;i++)t[i]=this.projectPointToNearestOnPlane(e[i],t[i]);return t},new s.Cartesian3);c.prototype.projectPointOntoEllipsoid=function(e,t){l.defined(t)||(t=new s.Cartesian3);var n=this._ellipsoid,i=this._origin,r=this._xAxis,a=this._yAxis,o=u;return s.Cartesian3.multiplyByScalar(r,e.x,o),t=s.Cartesian3.add(i,o,t),s.Cartesian3.multiplyByScalar(a,e.y,o),s.Cartesian3.add(t,o,t),n.scaleToGeocentricSurface(t,t),t},c.prototype.projectPointsOntoEllipsoid=function(e,t){var n=e.length;l.defined(t)?t.length=n:t=new Array(n);for(var i=0;i<n;++i)t[i]=this.projectPointOntoEllipsoid(e[i],t[i]);return t},e.EllipsoidTangentPlane=c});
