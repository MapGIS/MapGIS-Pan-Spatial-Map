define(["exports","./Cartesian2-c1eb9da0","./PolylineVolumeGeometryLibrary-b532118b","./when-ae2e0b60","./Math-5bbcea10","./Transforms-5a0f5c0d","./PolylinePipeline-9b4a6834"],function(a,R,V,s,Q,u,U){"use strict";var e={},G=new R.Cartesian3,d=new R.Cartesian3,p=new R.Cartesian3,m=new R.Cartesian3,I=[new R.Cartesian3,new R.Cartesian3],q=new R.Cartesian3,j=new R.Cartesian3,k=new R.Cartesian3,F=new R.Cartesian3,H=new R.Cartesian3,J=new R.Cartesian3,K=new R.Cartesian3,W=new R.Cartesian3,X=new R.Cartesian3,Y=new R.Cartesian3,c=new u.Quaternion,g=new u.Matrix3;function Z(a,e,r,n,t){var i,s=R.Cartesian3.angleBetween(R.Cartesian3.subtract(e,a,G),R.Cartesian3.subtract(r,a,d)),o=n===V.CornerType.BEVELED?1:Math.ceil(s/Q.CesiumMath.toRadians(5))+1,n=3*o,C=new Array(n),l=(C[n-3]=r.x,C[n-2]=r.y,C[n-1]=r.z,i=t?u.Matrix3.fromQuaternion(u.Quaternion.fromAxisAngle(R.Cartesian3.negate(a,G),s/o,c),g):u.Matrix3.fromQuaternion(u.Quaternion.fromAxisAngle(a,s/o,c),g),0);e=R.Cartesian3.clone(e,G);for(var y=0;y<o;y++)e=u.Matrix3.multiplyByVector(i,e,e),C[l++]=e.x,C[l++]=e.y,C[l++]=e.z;return C}function $(a,e,r,n){var t=G;return n||(e=R.Cartesian3.negate(e,e)),[(t=R.Cartesian3.add(a,e,t)).x,t.y,t.z,r.x,r.y,r.z]}function _(a,e,r,n){for(var t=new Array(a.length),i=new Array(a.length),s=R.Cartesian3.multiplyByScalar(e,r,G),o=R.Cartesian3.negate(s,d),C=0,l=a.length-1,y=0;y<a.length;y+=3){var u=R.Cartesian3.fromArray(a,y,p),c=R.Cartesian3.add(u,o,m),c=(t[C++]=c.x,t[C++]=c.y,t[C++]=c.z,R.Cartesian3.add(u,s,m));i[l--]=c.z,i[l--]=c.y,i[l--]=c.x}return n.push(t,i),n}e.addAttribute=function(a,e,r,n){var t=e.x,i=e.y,e=e.z;s.defined(r)&&(a[r]=t,a[r+1]=i,a[r+2]=e),s.defined(n)&&(a[n]=e,a[n-1]=i,a[n-2]=t)};var aa=new R.Cartesian3,ea=new R.Cartesian3;e.computePositions=function(a){for(var e,r,n,t,i,s,o,C,l=a.granularity,y=a.positions,u=a.ellipsoid,c=a.width/2,d=a.cornerType,p=a.saveAttributes,m=q,g=j,h=k,f=F,w=H,z=J,x=K,b=W,P=X,A=Y,B=[],E=p?[]:void 0,S=p?[]:void 0,v=y[0],D=y[1],g=R.Cartesian3.normalize(R.Cartesian3.subtract(D,v,g),g),m=u.geodeticSurfaceNormal(v,m),f=R.Cartesian3.normalize(R.Cartesian3.cross(m,g,f),f),x=(p&&(E.push(f.x,f.y,f.z),S.push(m.x,m.y,m.z)),R.Cartesian3.clone(v,x)),v=D,h=R.Cartesian3.negate(g,h),M=[],T=y.length,N=1;N<T-1;N++){m=u.geodeticSurfaceNormal(v,m),D=y[N+1],g=R.Cartesian3.normalize(R.Cartesian3.subtract(D,v,g),g),w=R.Cartesian3.normalize(R.Cartesian3.add(g,h,w),w);var L=R.Cartesian3.multiplyByScalar(m,R.Cartesian3.dot(g,m),aa),O=(R.Cartesian3.subtract(g,L,L),R.Cartesian3.normalize(L,L),R.Cartesian3.multiplyByScalar(m,R.Cartesian3.dot(h,m),ea));R.Cartesian3.subtract(h,O,O),R.Cartesian3.normalize(O,O),!Q.CesiumMath.equalsEpsilon(Math.abs(R.Cartesian3.dot(L,O)),1,Q.CesiumMath.EPSILON7)&&(w=R.Cartesian3.cross(w,m,w),w=R.Cartesian3.cross(m,w,w),w=R.Cartesian3.normalize(w,w),L=c/Math.max(.25,R.Cartesian3.magnitude(R.Cartesian3.cross(w,h,G))),O=V.PolylineVolumeGeometryLibrary.angleIsGreaterThanPi(g,h,v,u),w=R.Cartesian3.multiplyByScalar(w,L,w),O?(b=R.Cartesian3.add(v,w,b),A=R.Cartesian3.add(b,R.Cartesian3.multiplyByScalar(f,c,A),A),P=R.Cartesian3.add(b,R.Cartesian3.multiplyByScalar(f,2*c,P),P),I[0]=R.Cartesian3.clone(x,I[0]),I[1]=R.Cartesian3.clone(A,I[1]),B=_(e=U.PolylinePipeline.generateArc({positions:I,granularity:l,ellipsoid:u}),f,c,B),p&&(E.push(f.x,f.y,f.z),S.push(m.x,m.y,m.z)),z=R.Cartesian3.clone(P,z),f=R.Cartesian3.normalize(R.Cartesian3.cross(m,g,f),f),P=R.Cartesian3.add(b,R.Cartesian3.multiplyByScalar(f,2*c,P),P),x=R.Cartesian3.add(b,R.Cartesian3.multiplyByScalar(f,c,x),x),d===V.CornerType.ROUNDED||d===V.CornerType.BEVELED?M.push({leftPositions:Z(b,z,P,d,O)}):M.push({leftPositions:$(v,R.Cartesian3.negate(w,w),P,O)})):(P=R.Cartesian3.add(v,w,P),A=R.Cartesian3.add(P,R.Cartesian3.negate(R.Cartesian3.multiplyByScalar(f,c,A),A),A),b=R.Cartesian3.add(P,R.Cartesian3.negate(R.Cartesian3.multiplyByScalar(f,2*c,b),b),b),I[0]=R.Cartesian3.clone(x,I[0]),I[1]=R.Cartesian3.clone(A,I[1]),B=_(e=U.PolylinePipeline.generateArc({positions:I,granularity:l,ellipsoid:u}),f,c,B),p&&(E.push(f.x,f.y,f.z),S.push(m.x,m.y,m.z)),z=R.Cartesian3.clone(b,z),f=R.Cartesian3.normalize(R.Cartesian3.cross(m,g,f),f),b=R.Cartesian3.add(P,R.Cartesian3.negate(R.Cartesian3.multiplyByScalar(f,2*c,b),b),b),x=R.Cartesian3.add(P,R.Cartesian3.negate(R.Cartesian3.multiplyByScalar(f,c,x),x),x),d===V.CornerType.ROUNDED||d===V.CornerType.BEVELED?M.push({rightPositions:Z(P,z,b,d,O)}):M.push({rightPositions:$(v,w,b,O)})),h=R.Cartesian3.negate(g,h)),v=D}return m=u.geodeticSurfaceNormal(v,m),I[0]=R.Cartesian3.clone(x,I[0]),I[1]=R.Cartesian3.clone(v,I[1]),e=U.PolylinePipeline.generateArc({positions:I,granularity:l,ellipsoid:u}),B=_(e,f,c,B),p&&(E.push(f.x,f.y,f.z),S.push(m.x,m.y,m.z)),d===V.CornerType.ROUNDED&&(a=q,n=k,t=(r=B)[1],i=R.Cartesian3.fromArray(r[1],t.length-3,j),n=R.Cartesian3.fromArray(r[0],0,n),s=Z(a=R.Cartesian3.midpoint(i,n,a),i,n,V.CornerType.ROUNDED,!1),o=r.length-1,C=r[o-1],t=r[o],i=R.Cartesian3.fromArray(C,C.length-3,i),n=R.Cartesian3.fromArray(t,0,n),r=[s,Z(R.Cartesian3.midpoint(i,n,a),i,n,V.CornerType.ROUNDED,!1)]),{positions:B,corners:M,lefts:E,normals:S,endPositions:r}},a.CorridorGeometryLibrary=e});
