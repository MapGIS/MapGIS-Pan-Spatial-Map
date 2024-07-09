define(["exports","./AxisAlignedBoundingBox-9ec4e335","./Matrix2-59fd2efe","./RuntimeError-24b14c10","./when-ae2e0b60","./IntersectionTests-d0a84f0f","./Plane-43337cee","./Transforms-3bc98d07"],function(e,t,s,n,l,i,r,a){var o=new s.Cartesian4;function d(e,n){e=(n=l.defaultValue(n,s.Ellipsoid.WGS84)).scaleToGeodeticSurface(e);var t=a.Transforms.eastNorthUpToFixedFrame(e,n),n=(this._ellipsoid=n,this._origin=e,this._xAxis=s.Cartesian3.fromCartesian4(s.Matrix4.getColumn(t,0,o)),this._yAxis=s.Cartesian3.fromCartesian4(s.Matrix4.getColumn(t,1,o)),s.Cartesian3.fromCartesian4(s.Matrix4.getColumn(t,2,o)));this._plane=r.Plane.fromPointNormal(e,n)}Object.defineProperties(d.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},origin:{get:function(){return this._origin}},plane:{get:function(){return this._plane}},xAxis:{get:function(){return this._xAxis}},yAxis:{get:function(){return this._yAxis}},zAxis:{get:function(){return this._plane.normal}}});var c=new t.AxisAlignedBoundingBox,f=(d.fromPoints=function(e,n){return new d(t.AxisAlignedBoundingBox.fromPoints(e,c).center,n)},new i.Ray),p=new s.Cartesian3,u=(d.prototype.projectPointOntoPlane=function(e,n){var t=f,e=(t.origin=e,s.Cartesian3.normalize(e,t.direction),i.IntersectionTests.rayPlane(t,this._plane,p));if(l.defined(e)||(s.Cartesian3.negate(t.direction,t.direction),e=i.IntersectionTests.rayPlane(t,this._plane,p)),l.defined(e))return t=s.Cartesian3.subtract(e,this._origin,e),e=s.Cartesian3.dot(this._xAxis,t),t=s.Cartesian3.dot(this._yAxis,t),l.defined(n)?(n.x=e,n.y=t,n):new s.Cartesian2(e,t)},d.prototype.projectPointsOntoPlane=function(e,n){l.defined(n)||(n=[]);for(var t=0,i=e.length,r=0;r<i;r++){var a=this.projectPointOntoPlane(e[r],n[t]);l.defined(a)&&(n[t]=a,t++)}return n.length=t,n},d.prototype.projectPointToNearestOnPlane=function(e,n){l.defined(n)||(n=new s.Cartesian2);var t=f,e=(t.origin=e,s.Cartesian3.clone(this._plane.normal,t.direction),i.IntersectionTests.rayPlane(t,this._plane,p)),t=(l.defined(e)||(s.Cartesian3.negate(t.direction,t.direction),e=i.IntersectionTests.rayPlane(t,this._plane,p)),s.Cartesian3.subtract(e,this._origin,e)),e=s.Cartesian3.dot(this._xAxis,t),t=s.Cartesian3.dot(this._yAxis,t);return n.x=e,n.y=t,n},d.prototype.projectPointsToNearestOnPlane=function(e,n){l.defined(n)||(n=[]);var t=e.length;n.length=t;for(var i=0;i<t;i++)n[i]=this.projectPointToNearestOnPlane(e[i],n[i]);return n},new s.Cartesian3);d.prototype.projectPointOntoEllipsoid=function(e,n){l.defined(n)||(n=new s.Cartesian3);var t=this._ellipsoid,i=this._origin,r=this._xAxis,a=this._yAxis,o=u;return s.Cartesian3.multiplyByScalar(r,e.x,o),n=s.Cartesian3.add(i,o,n),s.Cartesian3.multiplyByScalar(a,e.y,o),s.Cartesian3.add(n,o,n),t.scaleToGeocentricSurface(n,n),n},d.prototype.projectPointsOntoEllipsoid=function(e,n){var t=e.length;l.defined(n)?n.length=t:n=new Array(t);for(var i=0;i<t;++i)n[i]=this.projectPointOntoEllipsoid(e[i],n[i]);return n},e.EllipsoidTangentPlane=d});
