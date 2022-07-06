define(["exports","./Cartesian2-38b35910","./Math-5bbcea10","./Transforms-ce97037a"],function(a,E,V,y){"use strict";var e={},u=new E.Cartesian3,m=new E.Cartesian3,c=new y.Quaternion,h=new y.Matrix3;function v(a,e,r,t,i,n,s,o,l,C){e=a+e,E.Cartesian3.multiplyByScalar(t,Math.cos(e),u),E.Cartesian3.multiplyByScalar(r,Math.sin(e),m),E.Cartesian3.add(u,m,u),t=Math.cos(a),t*=t,r=Math.sin(a),r*=r,e=n/Math.sqrt(s*t+i*r);return y.Quaternion.fromAxisAngle(u,e/o,c),y.Matrix3.fromQuaternion(c,h),y.Matrix3.multiplyByVector(h,l,C),E.Cartesian3.normalize(C,C),E.Cartesian3.multiplyByScalar(C,o,C),C}var A=new E.Cartesian3,R=new E.Cartesian3,W=new E.Cartesian3,M=new E.Cartesian3,S=(e.raisePositionsToHeight=function(a,e,r){for(var t=e.ellipsoid,i=e.height,n=e.extrudedHeight,e=r?a.length/3*2:a.length/3,s=new Float64Array(3*e),o=a.length,l=r?o:0,C=0;C<o;C+=3){var y=C+1,u=C+2,m=E.Cartesian3.fromArray(a,C,A),c=(t.scaleToGeodeticSurface(m,m),E.Cartesian3.clone(m,R)),h=t.geodeticSurfaceNormal(m,M),x=E.Cartesian3.multiplyByScalar(h,i,W);E.Cartesian3.add(m,x,m),r&&(E.Cartesian3.multiplyByScalar(h,n,x),E.Cartesian3.add(c,x,c),s[C+l]=c.x,s[y+l]=c.y,s[u+l]=c.z),s[C]=m.x,s[y]=m.y,s[u]=m.z}return s},new E.Cartesian3),B=new E.Cartesian3,b=new E.Cartesian3;e.computeEllipsePositions=function(a,e,r){var t=a.semiMinorAxis,i=a.semiMajorAxis,n=a.rotation,s=a.center,a=8*a.granularity,o=t*t,l=i*i,C=i*t,y=E.Cartesian3.magnitude(s),u=E.Cartesian3.normalize(s,S),m=E.Cartesian3.cross(E.Cartesian3.UNIT_Z,s,B),m=E.Cartesian3.normalize(m,m),c=E.Cartesian3.cross(u,m,b),h=1+Math.ceil(V.CesiumMath.PI_OVER_TWO/a),x=V.CesiumMath.PI_OVER_TWO/(h-1),M=V.CesiumMath.PI_OVER_TWO-h*x;M<0&&(h-=Math.ceil(Math.abs(M)/x));var z,f,_,O,d=e?new Array(3*(h*(h+2)*2)):void 0,p=0,w=A,P=R,i=4*h*3,T=i-1,I=0,g=r?new Array(i):void 0,w=v(M=V.CesiumMath.PI_OVER_TWO,n,c,m,o,C,l,y,u,w);for(e&&(d[p++]=w.x,d[p++]=w.y,d[p++]=w.z),r&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x),M=V.CesiumMath.PI_OVER_TWO-x,z=1;z<h+1;++z){if(w=v(M,n,c,m,o,C,l,y,u,w),P=v(Math.PI-M,n,c,m,o,C,l,y,u,P),e){for(d[p++]=w.x,d[p++]=w.y,d[p++]=w.z,_=2*z+2,f=1;f<_-1;++f)O=E.Cartesian3.lerp(w,P,f/(_-1),W),d[p++]=O.x,d[p++]=O.y,d[p++]=O.z;d[p++]=P.x,d[p++]=P.y,d[p++]=P.z}r&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,g[I++]=P.x,g[I++]=P.y,g[I++]=P.z),M=V.CesiumMath.PI_OVER_TWO-(z+1)*x}for(z=h;1<z;--z){if(w=v(-(M=V.CesiumMath.PI_OVER_TWO-(z-1)*x),n,c,m,o,C,l,y,u,w),P=v(M+Math.PI,n,c,m,o,C,l,y,u,P),e){for(d[p++]=w.x,d[p++]=w.y,d[p++]=w.z,_=2*(z-1)+2,f=1;f<_-1;++f)O=E.Cartesian3.lerp(w,P,f/(_-1),W),d[p++]=O.x,d[p++]=O.y,d[p++]=O.z;d[p++]=P.x,d[p++]=P.y,d[p++]=P.z}r&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,g[I++]=P.x,g[I++]=P.y,g[I++]=P.z)}w=v(-(M=V.CesiumMath.PI_OVER_TWO),n,c,m,o,C,l,y,u,w);t={};return e&&(d[p++]=w.x,d[p++]=w.y,d[p++]=w.z,t.positions=d,t.numPts=h),r&&(g[T--]=w.z,g[T--]=w.y,g[T--]=w.x,t.outerPositions=g),t},a.EllipseGeometryLibrary=e});
