define(["exports","./Matrix2-59fd2efe","./when-ae2e0b60","./RuntimeError-24b14c10","./ComponentDatatype-b7b5db18"],function(e,a,r,t,i){"use strict";function n(e){this._ellipsoid=r.defaultValue(e,a.Ellipsoid.WGS84),this._semimajorAxis=this._ellipsoid.maximumRadius,this._oneOverSemimajorAxis=1/this._semimajorAxis}Object.defineProperties(n.prototype,{ellipsoid:{get:function(){return this._ellipsoid}}}),n.mercatorAngleToGeodeticLatitude=function(e){return i.CesiumMath.PI_OVER_TWO-2*Math.atan(Math.exp(-e))},n.geodeticLatitudeToMercatorAngle=function(e){n.MaximumLatitude<e?e=n.MaximumLatitude:e<-n.MaximumLatitude&&(e=-n.MaximumLatitude);e=Math.sin(e);return.5*Math.log((1+e)/(1-e))},n.MaximumLatitude=n.mercatorAngleToGeodeticLatitude(Math.PI),n.prototype.project=function(e,t){var i=this._semimajorAxis,o=e.longitude*i,i=n.geodeticLatitudeToMercatorAngle(e.latitude)*i,e=e.height;return r.defined(t)?(t.x=o,t.y=i,t.z=e,t):new a.Cartesian3(o,i,e)},n.prototype.unproject=function(e,t){var i=this._oneOverSemimajorAxis,o=e.x*i,i=n.mercatorAngleToGeodeticLatitude(e.y*i),e=e.z;return r.defined(t)?(t.longitude=o,t.latitude=i,t.height=e,t):new a.Cartographic(o,i,e)},e.WebMercatorProjection=n});
