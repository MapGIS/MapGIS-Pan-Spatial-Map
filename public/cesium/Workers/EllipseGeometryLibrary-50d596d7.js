define(["exports","./Matrix2-59fd2efe","./ComponentDatatype-b7b5db18","./Transforms-3bc98d07"],function(a,E,V,y){"use strict";var e={},u=new E.Cartesian3,m=new E.Cartesian3,c=new y.Quaternion,h=new E.Matrix3;function v(a,e,t,r,i,n,s,o,l,C){e=a+e,E.Cartesian3.multiplyByScalar(r,Math.cos(e),u),E.Cartesian3.multiplyByScalar(t,Math.sin(e),m),E.Cartesian3.add(u,m,u),r=Math.cos(a),r*=r,t=Math.sin(a),t*=t,e=n/Math.sqrt(s*r+i*t);return y.Quaternion.fromAxisAngle(u,e/o,c),E.Matrix3.fromQuaternion(c,h),E.Matrix3.multiplyByVector(h,l,C),E.Cartesian3.normalize(C,C),E.Cartesian3.multiplyByScalar(C,o,C),C}var A=new E.Cartesian3,R=new E.Cartesian3,W=new E.Cartesian3,M=new E.Cartesian3,S=(e.raisePositionsToHeight=function(a,e,t){for(var r=e.ellipsoid,i=e.height,n=e.extrudedHeight,e=t?a.length/3*2:a.length/3,s=new Float64Array(3*e),o=a.length,l=t?o:0,C=0;C<o;C+=3){var y=C+1,u=C+2,m=E.Cartesian3.fromArray(a,C,A),c=(r.scaleToGeodeticSurface(m,m),E.Cartesian3.clone(m,R)),h=r.geodeticSurfaceNormal(m,M),x=E.Cartesian3.multiplyByScalar(h,i,W);E.Cartesian3.add(m,x,m),t&&(E.Cartesian3.multiplyByScalar(h,n,x),E.Cartesian3.add(c,x,c),s[C+l]=c.x,s[y+l]=c.y,s[u+l]=c.z),s[C]=m.x,s[y]=m.y,s[u]=m.z}return s},new E.Cartesian3),b=new E.Cartesian3,B=new E.Cartesian3;e.computeEllipsePositions=function(a,e,t){var r=a.semiMinorAxis,i=a.semiMajorAxis,n=a.rotation,s=a.center,a=8*a.granularity,o=r*r,l=i*i,C=i*r,y=E.Cartesian3.magnitude(s),u=E.Cartesian3.normalize(s,S),m=E.Cartesian3.cross(E.Cartesian3.UNIT_Z,s,b),m=E.Cartesian3.normalize(m,m),c=E.Cartesian3.cross(u,m,B),h=1+Math.ceil(V.CesiumMath.PI_OVER_TWO/a),x=V.CesiumMath.PI_OVER_TWO/(h-1),M=V.CesiumMath.PI_OVER_TWO-h*x;M<0&&(h-=Math.ceil(Math.abs(M)/x));var f,z,d,_,p=e?new Array(3*(h*(h+2)*2)):void 0,O=0,w=A,P=R,i=4*h*3,T=i-1,I=0,g=t?new Array(i):void 0,w=v(M=V.CesiumMath.PI_OVER_TWO,n,c,m,o,C,l,y,u,w);for(e&&(p[O++]=w.x,p[O++]=w.y,p[O++]=w.z),t&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x),M=V.CesiumMath.PI_OVER_TWO-x,f=1;f<h+1;++f){if(w=v(M,n,c,m,o,C,l,y,u,w),P=v(Math.PI-M,n,c,m,o,C,l,y,u,P),e){for(p[O++]=w.x,p[O++]=w.y,p[O++]=w.z,d=2*f+2,z=1;z<d-1;++z)_=E.Cartesian3.lerp(w,P,z/(d-1),W),p[O++]=_.x,p[O++]=_.y,p[O++]=_.z;p[O++]=P.x,p[O++]=P.y,p[O++]=P.z}t&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,g[I++]=P.x,g[I++]=P.y,g[I++]=P.z),M=V.CesiumMath.PI_OVER_TWO-(f+1)*x}for(f=h;1<f;--f){if(w=v(-(M=V.CesiumMath.PI_OVER_TWO-(f-1)*x),n,c,m,o,C,l,y,u,w),P=v(M+Math.PI,n,c,m,o,C,l,y,u,P),e){for(p[O++]=w.x,p[O++]=w.y,p[O++]=w.z,d=2*(f-1)+2,z=1;z<d-1;++z)_=E.Cartesian3.lerp(w,P,z/(d-1),W),p[O++]=_.x,p[O++]=_.y,p[O++]=_.z;p[O++]=P.x,p[O++]=P.y,p[O++]=P.z}t&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,g[I++]=P.x,g[I++]=P.y,g[I++]=P.z)}w=v(-(M=V.CesiumMath.PI_OVER_TWO),n,c,m,o,C,l,y,u,w);r={};return e&&(p[O++]=w.x,p[O++]=w.y,p[O++]=w.z,r.positions=p,r.numPts=h),t&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,r.outerPositions=g),r},a.EllipseGeometryLibrary=e});
