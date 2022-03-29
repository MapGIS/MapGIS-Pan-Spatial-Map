define(["exports","./Cartesian2-38b35910","./Check-f996273c","./when-ae2e0b60","./Math-5bbcea10"],function(t,M,i,c,g){"use strict";function l(t,i,a){if(0===t)return i*a;var t=t*t,e=t*t,n=e*t,s=n*t,h=s*t,u=h*t;return i*((1-t/4-3*e/64-5*n/256-175*s/16384-441*h/65536-4851*u/1048576)*a-(3*t/8+3*e/32+45*n/1024+105*s/4096+2205*h/131072+6237*u/524288)*Math.sin(2*a)+(15*e/256+45*n/1024+525*s/16384+1575*h/65536+155925*u/8388608)*Math.sin(4*a)-(35*n/3072+175*s/12288+3675*h/262144+13475*u/1048576)*Math.sin(6*a)+(315*s/131072+2205*h/524288+43659*u/8388608)*Math.sin(8*a)-(693*h/1310720+6237*u/5242880)*Math.sin(10*a)+1001*u/8388608*Math.sin(12*a))}function d(t,i){if(0===t)return Math.log(Math.tan(.5*(g.CesiumMath.PI_OVER_TWO+i)));var a=t*Math.sin(i);return Math.log(Math.tan(.5*(g.CesiumMath.PI_OVER_TWO+i)))-t/2*Math.log((1+a)/(1-a))}var _=new M.Cartesian3,r=new M.Cartesian3;function e(t,i,a,e){M.Cartesian3.normalize(e.cartographicToCartesian(i,r),_),M.Cartesian3.normalize(e.cartographicToCartesian(a,r),r);var n,s,h,u=e.maximumRadius,o=e.minimumRadius,u=u*u;t._ellipticitySquared=(u-o*o)/u,t._ellipticity=Math.sqrt(t._ellipticitySquared),t._start=M.Cartographic.clone(i,t._start),t._start.height=0,t._end=M.Cartographic.clone(a,t._end),t._end.height=0,t._heading=(o=t,u=i.longitude,h=i.latitude,s=a.longitude,n=a.latitude,h=d(o._ellipticity,h),o=d(o._ellipticity,n),Math.atan2(g.CesiumMath.negativePiToPi(s-u),o-h)),t._distance=(n=t,s=e.maximumRadius,u=e.minimumRadius,o=i.longitude,h=i.latitude,t=a.longitude,e=a.latitude,i=n._heading,t-=o,o=0,o=g.CesiumMath.equalsEpsilon(Math.abs(i),g.CesiumMath.PI_OVER_TWO,g.CesiumMath.EPSILON8)?s===u?s*Math.cos(h)*g.CesiumMath.negativePiToPi(t):(u=Math.sin(h),s*Math.cos(h)*g.CesiumMath.negativePiToPi(t)/Math.sqrt(1-n._ellipticitySquared*u*u)):(t=l(n._ellipticity,s,h),(l(n._ellipticity,s,e)-t)/Math.cos(i)),Math.abs(o))}function o(t,i,a,e,n,s){if(0===a)return M.Cartographic.clone(t,s);var h,u,o,r=n*n;return a=Math.abs(g.CesiumMath.PI_OVER_TWO-Math.abs(i))>g.CesiumMath.EPSILON8?(h=function(t,i,a){if(t/=a,0===i)return t;var e=(a=t*t)*t,n=e*t,s=(i=i*i)*i,h=s*i,u=h*i,o=u*i,r=o*i,l=Math.sin(2*t),d=Math.cos(2*t),M=Math.sin(4*t),c=Math.cos(4*t),g=Math.sin(6*t),m=Math.cos(6*t),_=Math.sin(8*t),p=Math.cos(8*t),C=Math.sin(10*t);return t+t*i/4+7*t*s/64+15*t*h/256+579*t*u/16384+1515*t*o/65536+16837*t*r/1048576+(3*t*s/16+45*t*h/256-t*(32*a-561)*u/4096-t*(232*a-1677)*o/16384+t*(399985-90560*a+512*n)*r/5242880)*d+(21*t*h/256+483*t*u/4096-t*(224*a-1969)*o/16384-t*(33152*a-112599)*r/1048576)*c+(151*t*u/4096+4681*t*o/65536+1479*t*r/16384-453*e*r/32768)*m+(1097*t*o/65536+42783*t*r/1048576)*p+8011*t*r/1048576*Math.cos(10*t)+(3*i/8+3*s/16+213*h/2048-3*a*h/64+255*u/4096-33*a*u/512+20861*o/524288-33*a*o/512+n*o/1024+28273*r/1048576-471*a*r/8192+9*n*r/4096)*l+(21*s/256+21*h/256+533*u/8192-21*a*u/512+197*o/4096-315*a*o/4096+584039*r/16777216-12517*a*r/131072+7*n*r/2048)*M+(151*h/6144+151*u/4096+5019*o/131072-453*a*o/16384+26965*r/786432-8607*a*r/131072)*g+(1097*u/131072+1097*o/65536+225797*r/10485760-1097*a*r/65536)*_+(8011*o/2621440+8011*r/1048576)*C+293393*r/251658240*Math.sin(12*t)}(l(n,e,t.latitude)+a*Math.cos(i),n,e),o=d(n,t.latitude),u=d(n,h),u=Math.tan(i)*(u-o),g.CesiumMath.negativePiToPi(t.longitude+u)):(h=t.latitude,u=a/(0===n?e*Math.cos(t.latitude):(o=Math.sin(t.latitude),e*Math.cos(t.latitude)/Math.sqrt(1-r*o*o))),0<i?g.CesiumMath.negativePiToPi(t.longitude+u):g.CesiumMath.negativePiToPi(t.longitude-u)),c.defined(s)?(s.longitude=a,s.latitude=h,s.height=0,s):new M.Cartographic(a,h,0)}function m(t,i,a){a=c.defaultValue(a,M.Ellipsoid.WGS84);this._ellipsoid=a,this._start=new M.Cartographic,this._end=new M.Cartographic,this._heading=void 0,this._distance=void 0,this._ellipticity=void 0,this._ellipticitySquared=void 0,c.defined(t)&&c.defined(i)&&e(this,t,i,a)}Object.defineProperties(m.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},surfaceDistance:{get:function(){return this._distance}},start:{get:function(){return this._start}},end:{get:function(){return this._end}},heading:{get:function(){return this._heading}}}),m.fromStartHeadingDistance=function(t,i,a,e,n){var s=c.defaultValue(e,M.Ellipsoid.WGS84),h=s.maximumRadius,u=s.minimumRadius,h=h*h,u=Math.sqrt((h-u*u)/h),h=o(t,i=g.CesiumMath.negativePiToPi(i),a,s.maximumRadius,u);return!c.defined(n)||c.defined(e)&&!e.equals(n.ellipsoid)?new m(t,h,s):(n.setEndPoints(t,h),n)},m.prototype.setEndPoints=function(t,i){e(this,t,i,this._ellipsoid)},m.prototype.interpolateUsingFraction=function(t,i){return this.interpolateUsingSurfaceDistance(t*this._distance,i)},m.prototype.interpolateUsingSurfaceDistance=function(t,i){return o(this._start,this._heading,t,this._ellipsoid.maximumRadius,this._ellipticity,i)},m.prototype.findIntersectionWithLongitude=function(t,i){var a=this._ellipticity,e=this._heading,n=Math.abs(e),s=this._start;if(t=g.CesiumMath.negativePiToPi(t),g.CesiumMath.equalsEpsilon(Math.abs(t),Math.PI,g.CesiumMath.EPSILON14)&&(t=g.CesiumMath.sign(s.longitude)*Math.PI),c.defined(i)||(i=new M.Cartographic),Math.abs(g.CesiumMath.PI_OVER_TWO-n)<=g.CesiumMath.EPSILON8)return i.longitude=t,i.latitude=s.latitude,i.height=0,i;if(g.CesiumMath.equalsEpsilon(Math.abs(g.CesiumMath.PI_OVER_TWO-n),g.CesiumMath.PI_OVER_TWO,g.CesiumMath.EPSILON8))return g.CesiumMath.equalsEpsilon(t,s.longitude,g.CesiumMath.EPSILON12)?void 0:(i.longitude=t,i.latitude=g.CesiumMath.PI_OVER_TWO*g.CesiumMath.sign(g.CesiumMath.PI_OVER_TWO-e),i.height=0,i);var n=s.latitude,h=a*Math.sin(n),l=Math.tan(.5*(g.CesiumMath.PI_OVER_TWO+n))*Math.exp((t-s.longitude)/Math.tan(e)),d=(1+h)/(1-h),u=s.latitude;do{var o=u,r=a*Math.sin(o),u=2*Math.atan(l*Math.pow((1+r)/(1-r)/d,a/2))-g.CesiumMath.PI_OVER_TWO}while(!g.CesiumMath.equalsEpsilon(u,o,g.CesiumMath.EPSILON12));return i.longitude=t,i.latitude=u,i.height=0,i},m.prototype.findIntersectionWithLatitude=function(t,i){var a,e=this._ellipticity,n=this._heading,s=this._start;if(!g.CesiumMath.equalsEpsilon(Math.abs(n),g.CesiumMath.PI_OVER_TWO,g.CesiumMath.EPSILON8))return a=d(e,s.latitude),e=d(e,t),n=Math.tan(n)*(e-a),e=g.CesiumMath.negativePiToPi(s.longitude+n),c.defined(i)?(i.longitude=e,i.latitude=t,i.height=0,i):new M.Cartographic(e,t,0)},t.EllipsoidRhumbLine=m});
