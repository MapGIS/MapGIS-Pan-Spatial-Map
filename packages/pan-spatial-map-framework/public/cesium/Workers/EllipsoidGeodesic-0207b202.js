define(["exports","./Cartesian2-38b35910","./Check-f996273c","./when-ae2e0b60","./Math-5bbcea10"],function(t,j,i,_,k){"use strict";function L(t,a,i,n,e,s,r){i=t*i*(4+t*(4-3*i))/16;return(1-i)*t*a*(n+i*e*(r+i*s*(2*r*r-1)))}var N=new j.Cartesian3,V=new j.Cartesian3;function n(t,a,i,n){j.Cartesian3.normalize(n.cartographicToCartesian(a,V),N),j.Cartesian3.normalize(n.cartographicToCartesian(i,V),V);var c,u,M,l,g,e,_,p,f,m,v,C,H,O=t,s=n.maximumRadius,n=n.minimumRadius,r=a.longitude,h=a.latitude,o=i.longitude,d=i.latitude,S=(s-n)/s,b=o-r,o=Math.atan((1-S)*Math.tan(h)),r=Math.atan((1-S)*Math.tan(d)),h=Math.cos(o),d=Math.sin(o),q=Math.cos(r),o=Math.sin(r),U=h*q,w=h*o,A=d*o,R=d*q,y=b,E=(k.CesiumMath.TWO_PI,Math.cos(y)),P=Math.sin(y);do{var x,D,T,z,F,E=Math.cos(y),P=Math.sin(y),G=w-R*E,I=y,W=(T=A+U*E)-2*A/(F=0===(D=Math.sqrt(q*q*P*P+G*G))?(x=0,1):1-(x=U*P/D)*x),y=b+L(S,x,F,z=Math.atan2(D,T),D,T,W=isFinite(W)?W:0)}while(Math.abs(y-I)>k.CesiumMath.EPSILON12);s=n*(1+(r=F*(s*s-n*n)/(n*n))*(4096+r*(r*(320-175*r)-768))/16384)*(z-(o=r*(256+r*(r*(74-47*r)-128))/1024)*D*(W+o*(T*(2*(d=W*W)-1)-o*W*(4*D*D-3)*(4*d-3)/6)/4)),n=Math.atan2(q*P,w-R*E),o=Math.atan2(h*P,w*E-R),O._distance=s,O._startHeading=n,O._endHeading=o,O._uSquared=r,t._start=j.Cartographic.clone(a,t._start),t._end=j.Cartographic.clone(i,t._end),t._start.height=0,t._end.height=0,h=(d=t)._uSquared,s=d._ellipsoid.maximumRadius,n=d._ellipsoid.minimumRadius,o=(s-n)/s,O=Math.cos(d._startHeading),r=Math.sin(d._startHeading),a=(1-o)*Math.tan(d._start.latitude),i=1/Math.sqrt(1+a*a),t=i*a,c=Math.atan2(a,O),l=1-(M=(u=i*r)*u),g=Math.sqrt(l),e=(h=h/4)*h,v=1-3*h+35*e/4,C=1-5*h,H=(f=1+h-3*e/4+5*(_=e*h)/4-175*(p=e*e)/64)*c-(m=1-h+15*e/8-35*_/8)*Math.sin(2*c)*h/2-v*Math.sin(4*c)*e/16-C*Math.sin(6*c)*_/48-5*Math.sin(8*c)*p/512,(d=d._constants).a=s,d.b=n,d.f=o,d.cosineHeading=O,d.sineHeading=r,d.tanU=a,d.cosineU=i,d.sineU=t,d.sigma=c,d.sineAlpha=u,d.sineSquaredAlpha=M,d.cosineSquaredAlpha=l,d.cosineAlpha=g,d.u2Over4=h,d.u4Over16=e,d.u6Over64=_,d.u8Over256=p,d.a0=f,d.a1=m,d.a2=v,d.a3=C,d.distanceRatio=H}function a(t,a,i){i=_.defaultValue(i,j.Ellipsoid.WGS84);this._ellipsoid=i,this._start=new j.Cartographic,this._end=new j.Cartographic,this._constants={},this._startHeading=void 0,this._endHeading=void 0,this._distance=void 0,this._uSquared=void 0,_.defined(t)&&_.defined(a)&&n(this,t,a,i)}Object.defineProperties(a.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},surfaceDistance:{get:function(){return this._distance}},start:{get:function(){return this._start}},end:{get:function(){return this._end}},startHeading:{get:function(){return this._startHeading}},endHeading:{get:function(){return this._endHeading}}}),a.prototype.setEndPoints=function(t,a){n(this,t,a,this._ellipsoid)},a.prototype.interpolateUsingFraction=function(t,a){return this.interpolateUsingSurfaceDistance(this._distance*t,a)},a.prototype.interpolateUsingSurfaceDistance=function(t,a){var i=this._constants,t=i.distanceRatio+t/i.b,n=Math.cos(2*t),e=Math.cos(4*t),c=Math.cos(6*t),u=Math.sin(2*t),s=Math.sin(4*t),M=Math.sin(6*t),l=Math.sin(8*t),g=t*t,r=i.u8Over256,h=i.u2Over4,o=i.u6Over64,d=i.u4Over16,t=2*(t*g)*r*n/3+t*(1-h+7*d/4-15*o/4+579*r/64-(d-15*o/4+187*r/16)*n-(5*o/4-115*r/16)*e-29*r*c/16)+(h/2-d+71*o/32-85*r/16)*u+(5*d/16-5*o/4+383*r/96)*s-g*((o-11*r/2)*u+5*r*s/2)+(29*o/96-29*r/16)*M+539*r*l/1536,n=Math.asin(Math.sin(t)*i.cosineAlpha),e=Math.atan(i.a/i.b*Math.tan(n)),c=(t-=i.sigma,Math.cos(2*i.sigma+t)),h=Math.sin(t),d=Math.cos(t),g=i.cosineU*d,u=i.sineU*h,s=Math.atan2(h*i.sineHeading,g-u*i.cosineHeading)-L(i.f,i.sineAlpha,i.cosineSquaredAlpha,t,h,d,c);return _.defined(a)?(a.longitude=this._start.longitude+s,a.latitude=e,a.height=0,a):new j.Cartographic(this._start.longitude+s,e,0)},t.EllipsoidGeodesic=a});