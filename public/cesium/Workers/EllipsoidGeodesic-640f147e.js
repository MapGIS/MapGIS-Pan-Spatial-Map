define(["exports","./Matrix2-59fd2efe","./RuntimeError-24b14c10","./when-ae2e0b60","./ComponentDatatype-b7b5db18"],function(t,j,a,p,L){"use strict";function N(t,a,i,n,e,s,r){i=t*i*(4+t*(4-3*i))/16;return(1-i)*t*a*(n+i*e*(r+i*s*(2*r*r-1)))}var V=new j.Cartesian3,k=new j.Cartesian3;function n(t,a,i,n){j.Cartesian3.normalize(n.cartographicToCartesian(a,k),V),j.Cartesian3.normalize(n.cartographicToCartesian(i,k),k);var e,s,r,h,o,d,u,c,M,l,g,p,_,f=t,m=n.maximumRadius,n=n.minimumRadius,v=a.longitude,C=a.latitude,H=i.longitude,O=i.latitude,b=(m-n)/m,S=H-v,H=Math.atan((1-b)*Math.tan(C)),v=Math.atan((1-b)*Math.tan(O)),C=Math.cos(H),O=Math.sin(H),q=Math.cos(v),H=Math.sin(v),z=C*q,U=C*H,F=O*H,w=O*q,A=S,R=(L.CesiumMath.TWO_PI,Math.cos(A)),y=Math.sin(A);do{var E,x,D,G,P,R=Math.cos(A),y=Math.sin(A),I=U-w*R,W=A,T=(D=F+z*R)-2*F/(P=0===(x=Math.sqrt(q*q*y*y+I*I))?(E=0,1):1-(E=z*y/x)*E),A=S+N(b,E,P,G=Math.atan2(x,D),x,D,T=isFinite(T)?T:0)}while(Math.abs(A-W)>L.CesiumMath.EPSILON12);m=n*(1+(v=P*(m*m-n*n)/(n*n))*(4096+v*(v*(320-175*v)-768))/16384)*(G-(H=v*(256+v*(v*(74-47*v)-128))/1024)*x*(T+H*(D*(2*(O=T*T)-1)-H*T*(4*x*x-3)*(4*O-3)/6)/4)),n=Math.atan2(q*y,U-w*R),H=Math.atan2(C*y,U*R-w),f._distance=m,f._startHeading=n,f._endHeading=H,f._uSquared=v,t._start=j.Cartographic.clone(a,t._start),t._end=j.Cartographic.clone(i,t._end),t._start.height=0,t._end.height=0,C=(O=t)._uSquared,m=O._ellipsoid.maximumRadius,n=O._ellipsoid.minimumRadius,H=(m-n)/m,f=Math.cos(O._startHeading),v=Math.sin(O._startHeading),a=(1-H)*Math.tan(O._start.latitude),i=1/Math.sqrt(1+a*a),t=i*a,e=Math.atan2(a,f),h=1-(r=(s=i*v)*s),o=Math.sqrt(h),d=(C=C/4)*C,g=1-3*C+35*d/4,p=1-5*C,_=(M=1+C-3*d/4+5*(u=d*C)/4-175*(c=d*d)/64)*e-(l=1-C+15*d/8-35*u/8)*Math.sin(2*e)*C/2-g*Math.sin(4*e)*d/16-p*Math.sin(6*e)*u/48-5*Math.sin(8*e)*c/512,(O=O._constants).a=m,O.b=n,O.f=H,O.cosineHeading=f,O.sineHeading=v,O.tanU=a,O.cosineU=i,O.sineU=t,O.sigma=e,O.sineAlpha=s,O.sineSquaredAlpha=r,O.cosineSquaredAlpha=h,O.cosineAlpha=o,O.u2Over4=C,O.u4Over16=d,O.u6Over64=u,O.u8Over256=c,O.a0=M,O.a1=l,O.a2=g,O.a3=p,O.distanceRatio=_}function i(t,a,i){i=p.defaultValue(i,j.Ellipsoid.WGS84);this._ellipsoid=i,this._start=new j.Cartographic,this._end=new j.Cartographic,this._constants={},this._startHeading=void 0,this._endHeading=void 0,this._distance=void 0,this._uSquared=void 0,p.defined(t)&&p.defined(a)&&n(this,t,a,i)}Object.defineProperties(i.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},surfaceDistance:{get:function(){return this._distance}},start:{get:function(){return this._start}},end:{get:function(){return this._end}},startHeading:{get:function(){return this._startHeading}},endHeading:{get:function(){return this._endHeading}}}),i.prototype.setEndPoints=function(t,a){n(this,t,a,this._ellipsoid)},i.prototype.interpolateUsingFraction=function(t,a){return this.interpolateUsingSurfaceDistance(this._distance*t,a)},i.prototype.interpolateUsingSurfaceDistance=function(t,a){var i=this._constants,t=i.distanceRatio+t/i.b,n=Math.cos(2*t),e=Math.cos(4*t),s=Math.cos(6*t),r=Math.sin(2*t),h=Math.sin(4*t),o=Math.sin(6*t),d=Math.sin(8*t),u=t*t,c=i.u8Over256,M=i.u2Over4,l=i.u6Over64,g=i.u4Over16,t=2*(t*u)*c*n/3+t*(1-M+7*g/4-15*l/4+579*c/64-(g-15*l/4+187*c/16)*n-(5*l/4-115*c/16)*e-29*c*s/16)+(M/2-g+71*l/32-85*c/16)*r+(5*g/16-5*l/4+383*c/96)*h-u*((l-11*c/2)*r+5*c*h/2)+(29*l/96-29*c/16)*o+539*c*d/1536,n=Math.asin(Math.sin(t)*i.cosineAlpha),e=Math.atan(i.a/i.b*Math.tan(n)),s=(t-=i.sigma,Math.cos(2*i.sigma+t)),M=Math.sin(t),g=Math.cos(t),u=i.cosineU*g,r=i.sineU*M,h=Math.atan2(M*i.sineHeading,u-r*i.cosineHeading)-N(i.f,i.sineAlpha,i.cosineSquaredAlpha,t,M,g,s);return p.defined(a)?(a.longitude=this._start.longitude+h,a.latitude=e,a.height=0,a):new j.Cartographic(this._start.longitude+h,e,0)},t.EllipsoidGeodesic=i});
