define(["exports","./GeometryOffsetAttribute-8c0bd3ce","./Transforms-70ded1e8","./Matrix2-10a61a55","./RuntimeError-24b14c10","./ComponentDatatype-b7b5db18","./when-ae2e0b60","./EllipseGeometryLibrary-9dd8ed16","./GeometryAttribute-e89ef932","./GeometryAttributes-5ce4955a","./GeometryInstance-a29ed6fd","./GeometryPipeline-46833021","./IndexDatatype-6902a37d","./VertexFormat-1fc9746e"],function(e,S,L,R,t,j,z,k,B,Y,m,C,p,d){"use strict";var H=new R.Cartesian3,U=new R.Cartesian3,Q=new R.Cartesian3,W=new R.Cartesian3,J=new R.Cartesian2,q=new R.Matrix3,ie=new R.Matrix3,Z=new L.Quaternion,K=new R.Cartesian3,X=new R.Cartesian3,$=new R.Cartesian3,ee=new R.Cartographic,te=new R.Cartesian3,re=new R.Cartesian2,ae=new R.Cartesian2;function y(e,t,r){for(var a=t.vertexFormat,i=t.center,n=t.semiMajorAxis,o=t.semiMinorAxis,s=t.ellipsoid,u=t.stRotation,l=r?e.length/3*2:e.length/3,m=t.shadowVolume,p=a.st?new Float32Array(2*l):void 0,y=a.normal?new Float32Array(3*l):void 0,c=a.tangent?new Float32Array(3*l):void 0,d=a.bitangent?new Float32Array(3*l):void 0,A=m?new Float32Array(3*l):void 0,x=0,f=K,h=X,g=$,_=new L.GeographicProjection(s),b=_.project(s.cartesianToCartographic(i,ee),te),i=s.scaleToGeodeticSurface(i,H),C=(s.geodeticSurfaceNormal(i,i),q),v=ie,w=(v=0!==u?(O=L.Quaternion.fromAxisAngle(i,u,Z),C=R.Matrix3.fromQuaternion(O,C),O=L.Quaternion.fromAxisAngle(i,-u,Z),R.Matrix3.fromQuaternion(O,v)):(C=R.Matrix3.clone(R.Matrix3.IDENTITY,C),R.Matrix3.clone(R.Matrix3.IDENTITY,v)),R.Cartesian2.fromElements(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,re)),E=R.Cartesian2.fromElements(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,ae),M=e.length,I=r?M:0,T=I/3*2,G=0;G<M;G+=3){var N,P=G+1,F=G+2,V=R.Cartesian3.fromArray(e,G,H);a.st&&(N=R.Matrix3.multiplyByVector(C,V,U),N=_.project(s.cartesianToCartographic(N,ee),Q),R.Cartesian3.subtract(N,b,N),J.x=(N.x+n)/(2*n),J.y=(N.y+o)/(2*o),w.x=Math.min(J.x,w.x),w.y=Math.min(J.y,w.y),E.x=Math.max(J.x,E.x),E.y=Math.max(J.y,E.y),r&&(p[x+T]=J.x,p[x+1+T]=J.y),p[x++]=J.x,p[x++]=J.y),(a.normal||a.tangent||a.bitangent||m)&&(f=s.geodeticSurfaceNormal(V,f),m&&(A[G+I]=-f.x,A[P+I]=-f.y,A[F+I]=-f.z),a.normal||a.tangent||a.bitangent)&&((a.tangent||a.bitangent)&&(h=R.Cartesian3.normalize(R.Cartesian3.cross(R.Cartesian3.UNIT_Z,f,h),h),R.Matrix3.multiplyByVector(v,h,h)),a.normal&&(y[G]=f.x,y[P]=f.y,y[F]=f.z,r)&&(y[G+I]=-f.x,y[P+I]=-f.y,y[F+I]=-f.z),a.tangent&&(c[G]=h.x,c[P]=h.y,c[F]=h.z,r)&&(c[G+I]=-h.x,c[P+I]=-h.y,c[F+I]=-h.z),a.bitangent)&&(g=R.Cartesian3.normalize(R.Cartesian3.cross(f,h,g),g),d[G]=g.x,d[P]=g.y,d[F]=g.z,r)&&(d[G+I]=g.x,d[P+I]=g.y,d[F+I]=g.z)}if(a.st)for(var M=p.length,D=0;D<M;D+=2)p[D]=(p[D]-w.x)/(E.x-w.x),p[D+1]=(p[D+1]-w.y)/(E.y-w.y);var O,i=new Y.GeometryAttributes;return a.position&&(u=k.EllipseGeometryLibrary.raisePositionsToHeight(e,t,r),i.position=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u})),a.st&&(i.st=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:p})),a.normal&&(i.normal=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:y})),a.tangent&&(i.tangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:c})),a.bitangent&&(i.bitangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),m&&(i.extrudeDirection=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:A})),r&&z.defined(t.offsetAttribute)&&(O=new Uint8Array(l),O=t.offsetAttribute===S.GeometryOffsetAttribute.TOP?S.arrayFill(O,1,0,l/2):(u=t.offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(O,u)),i.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:O})),i}function c(e){for(var t,r,a=new Array(e*(e+1)*12-6),i=0,n=0,o=1,s=0;s<3;s++)a[i++]=o++,a[i++]=n,a[i++]=o;for(s=2;s<e+1;++s){for(o=s*(s+1)-1,n=(s-1)*s-1,a[i++]=o++,a[i++]=n,a[i++]=o,t=2*s,r=0;r<t-1;++r)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;a[i++]=o++,a[i++]=n,a[i++]=o}for(t=2*e,++o,++n,s=0;s<t-1;++s)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;for(a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n++,a[i++]=n,++n,s=e-1;1<s;--s){for(a[i++]=n++,a[i++]=n,a[i++]=o,t=2*s,r=0;r<t-1;++r)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;a[i++]=n++,a[i++]=n++,a[i++]=o++}for(s=0;s<3;s++)a[i++]=n++,a[i++]=n,a[i++]=o;return a}var o=new R.Cartesian3;var A=new L.BoundingSphere,x=new L.BoundingSphere;function u(e){for(var t=e.center,r=e.ellipsoid,a=e.semiMajorAxis,i=R.Cartesian3.multiplyByScalar(r.geodeticSurfaceNormal(t,H),e.height,H),r=(A.center=R.Cartesian3.add(t,i,A.center),A.radius=a,i=R.Cartesian3.multiplyByScalar(r.geodeticSurfaceNormal(t,i),e.extrudedHeight,i),x.center=R.Cartesian3.add(t,i,x.center),x.radius=a,k.EllipseGeometryLibrary.computeEllipsePositions(e,!0,!0)),t=r.positions,i=r.numPts,a=r.outerPositions,r=L.BoundingSphere.union(A,x),n=y(t,e,!0),o=(l=c(i)).length,s=(l.length=2*o,t.length/3),u=0;u<o;u+=3)l[u+o]=l[u+2]+s,l[u+1+o]=l[u+1]+s,l[u+2+o]=l[u]+s;var i=p.IndexDatatype.createTypedArray(2*s/3,l),t=new B.Geometry({attributes:n,indices:i,primitiveType:B.PrimitiveType.TRIANGLES}),n=function(e,t){for(var r=t.vertexFormat,a=t.center,i=t.semiMajorAxis,n=t.semiMinorAxis,o=t.ellipsoid,s=t.height,u=t.extrudedHeight,l=t.stRotation,m=e.length/3*2,p=new Float64Array(3*m),y=r.st?new Float32Array(2*m):void 0,c=r.normal?new Float32Array(3*m):void 0,d=r.tangent?new Float32Array(3*m):void 0,A=r.bitangent?new Float32Array(3*m):void 0,x=t.shadowVolume,f=x?new Float32Array(3*m):void 0,h=0,g=K,_=X,b=$,C=new L.GeographicProjection(o),v=C.project(o.cartesianToCartographic(a,ee),te),a=o.scaleToGeodeticSurface(a,H),a=(o.geodeticSurfaceNormal(a,a),L.Quaternion.fromAxisAngle(a,l,Z)),w=R.Matrix3.fromQuaternion(a,q),E=R.Cartesian2.fromElements(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,re),M=R.Cartesian2.fromElements(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,ae),I=(D=e.length)/3*2,T=0;T<D;T+=3){var G=T+1,N=T+2,P=R.Cartesian3.fromArray(e,T,H),F=(r.st&&(V=R.Matrix3.multiplyByVector(w,P,U),V=C.project(o.cartesianToCartographic(V,ee),Q),R.Cartesian3.subtract(V,v,V),J.x=(V.x+i)/(2*i),J.y=(V.y+n)/(2*n),E.x=Math.min(J.x,E.x),E.y=Math.min(J.y,E.y),M.x=Math.max(J.x,M.x),M.y=Math.max(J.y,M.y),y[h+I]=J.x,y[h+1+I]=J.y,y[h++]=J.x,y[h++]=J.y),P=o.scaleToGeodeticSurface(P,P),V=R.Cartesian3.clone(P,U),g=o.geodeticSurfaceNormal(P,g),x&&(f[T+D]=-g.x,f[G+D]=-g.y,f[N+D]=-g.z),R.Cartesian3.multiplyByScalar(g,s,W)),P=R.Cartesian3.add(P,F,P),F=R.Cartesian3.multiplyByScalar(g,u,F),V=R.Cartesian3.add(V,F,V);r.position&&(p[T+D]=V.x,p[G+D]=V.y,p[N+D]=V.z,p[T]=P.x,p[G]=P.y,p[N]=P.z),(r.normal||r.tangent||r.bitangent)&&(b=R.Cartesian3.clone(g,b),F=R.Cartesian3.fromArray(e,(T+3)%D,W),R.Cartesian3.subtract(F,P,F),P=R.Cartesian3.subtract(V,P,Q),g=R.Cartesian3.normalize(R.Cartesian3.cross(P,F,g),g),r.normal&&(c[T]=g.x,c[G]=g.y,c[N]=g.z,c[T+D]=g.x,c[G+D]=g.y,c[N+D]=g.z),r.tangent&&(_=R.Cartesian3.normalize(R.Cartesian3.cross(b,g,_),_),d[T]=_.x,d[G]=_.y,d[N]=_.z,d[T+D]=_.x,d[T+1+D]=_.y,d[T+2+D]=_.z),r.bitangent)&&(A[T]=b.x,A[G]=b.y,A[N]=b.z,A[T+D]=b.x,A[G+D]=b.y,A[N+D]=b.z)}if(r.st)for(var D=y.length,O=0;O<D;O+=2)y[O]=(y[O]-E.x)/(M.x-E.x),y[O+1]=(y[O+1]-E.y)/(M.y-E.y);return l=new Y.GeometryAttributes,r.position&&(l.position=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p})),r.st&&(l.st=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:y})),r.normal&&(l.normal=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:c})),r.tangent&&(l.tangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),r.bitangent&&(l.bitangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:A})),x&&(l.extrudeDirection=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:f})),z.defined(t.offsetAttribute)&&(a=new Uint8Array(m),a=t.offsetAttribute===S.GeometryOffsetAttribute.TOP?S.arrayFill(a,1,0,m/2):(m=t.offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(a,m)),l.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),l}(a,e),l=function(e){for(var t=e.length/3,r=p.IndexDatatype.createTypedArray(t,6*t),a=0,i=0;i<t;i++){var n=i,o=i+t,s=(n+1)%t,u=s+t;r[a++]=n,r[a++]=o,r[a++]=s,r[a++]=s,r[a++]=o,r[a++]=u}return r}(a),i=p.IndexDatatype.createTypedArray(2*a.length/3,l),e=new B.Geometry({attributes:n,indices:i,primitiveType:B.PrimitiveType.TRIANGLES}),a=C.GeometryPipeline.combineInstances([new m.GeometryInstance({geometry:t}),new m.GeometryInstance({geometry:e})]);return{boundingSphere:r,attributes:a[0].attributes,indices:a[0].indices}}function s(e,t,r,a,i,n,o){for(var s=k.EllipseGeometryLibrary.computeEllipsePositions({center:e,semiMajorAxis:t,semiMinorAxis:r,rotation:a,granularity:i},!1,!0).outerPositions,u=s.length/3,l=new Array(u),m=0;m<u;++m)l[m]=R.Cartesian3.fromArray(s,3*m);e=R.Rectangle.fromCartesianArray(l,n,o);return e.width>j.CesiumMath.PI&&(e.north=0<e.north?j.CesiumMath.PI_OVER_TWO-j.CesiumMath.EPSILON7:e.north,e.south=e.south<0?j.CesiumMath.EPSILON7-j.CesiumMath.PI_OVER_TWO:e.south,e.east=j.CesiumMath.PI,e.west=-j.CesiumMath.PI),e}function f(e){var t=(e=z.defaultValue(e,z.defaultValue.EMPTY_OBJECT)).center,r=z.defaultValue(e.ellipsoid,R.Ellipsoid.WGS84),a=e.semiMajorAxis,i=e.semiMinorAxis,n=z.defaultValue(e.granularity,j.CesiumMath.RADIANS_PER_DEGREE),o=z.defaultValue(e.vertexFormat,d.VertexFormat.DEFAULT),s=z.defaultValue(e.height,0),u=z.defaultValue(e.extrudedHeight,s);this._center=R.Cartesian3.clone(t),this._semiMajorAxis=a,this._semiMinorAxis=i,this._ellipsoid=R.Ellipsoid.clone(r),this._rotation=z.defaultValue(e.rotation,0),this._stRotation=z.defaultValue(e.stRotation,0),this._height=Math.max(u,s),this._granularity=n,this._vertexFormat=d.VertexFormat.clone(o),this._extrudedHeight=Math.min(u,s),this._shadowVolume=z.defaultValue(e.shadowVolume,!1),this._workerName="createEllipseGeometry",this._offsetAttribute=e.offsetAttribute,this._rectangle=void 0,this._textureCoordinateRotationPoints=void 0}f.packedLength=R.Cartesian3.packedLength+R.Ellipsoid.packedLength+d.VertexFormat.packedLength+9,f.pack=function(e,t,r){return r=z.defaultValue(r,0),R.Cartesian3.pack(e._center,t,r),r+=R.Cartesian3.packedLength,R.Ellipsoid.pack(e._ellipsoid,t,r),r+=R.Ellipsoid.packedLength,d.VertexFormat.pack(e._vertexFormat,t,r),r+=d.VertexFormat.packedLength,t[r++]=e._semiMajorAxis,t[r++]=e._semiMinorAxis,t[r++]=e._rotation,t[r++]=e._stRotation,t[r++]=e._height,t[r++]=e._granularity,t[r++]=e._extrudedHeight,t[r++]=e._shadowVolume?1:0,t[r]=z.defaultValue(e._offsetAttribute,-1),t};var h=new R.Cartesian3,g=new R.Ellipsoid,_=new d.VertexFormat,b={center:h,ellipsoid:g,vertexFormat:_,semiMajorAxis:void 0,semiMinorAxis:void 0,rotation:void 0,stRotation:void 0,height:void 0,granularity:void 0,extrudedHeight:void 0,shadowVolume:void 0,offsetAttribute:void 0};f.unpack=function(e,t,r){t=z.defaultValue(t,0);var a=R.Cartesian3.unpack(e,t,h),i=(t+=R.Cartesian3.packedLength,R.Ellipsoid.unpack(e,t,g)),n=(t+=R.Ellipsoid.packedLength,d.VertexFormat.unpack(e,t,_)),o=(t+=d.VertexFormat.packedLength,e[t++]),s=e[t++],u=e[t++],l=e[t++],m=e[t++],p=e[t++],y=e[t++],c=1===e[t++],e=e[t];return z.defined(r)?(r._center=R.Cartesian3.clone(a,r._center),r._ellipsoid=R.Ellipsoid.clone(i,r._ellipsoid),r._vertexFormat=d.VertexFormat.clone(n,r._vertexFormat),r._semiMajorAxis=o,r._semiMinorAxis=s,r._rotation=u,r._stRotation=l,r._height=m,r._granularity=p,r._extrudedHeight=y,r._shadowVolume=c,r._offsetAttribute=-1===e?void 0:e,r):(b.height=m,b.extrudedHeight=y,b.granularity=p,b.stRotation=l,b.rotation=u,b.semiMajorAxis=o,b.semiMinorAxis=s,b.shadowVolume=c,b.offsetAttribute=-1===e?void 0:e,new f(b))},f.computeRectangle=function(e,t){var r=(e=z.defaultValue(e,z.defaultValue.EMPTY_OBJECT)).center,a=z.defaultValue(e.ellipsoid,R.Ellipsoid.WGS84),i=e.semiMajorAxis,n=e.semiMinorAxis,o=z.defaultValue(e.granularity,j.CesiumMath.RADIANS_PER_DEGREE);return s(r,i,n,z.defaultValue(e.rotation,0),o,a,t)},f.createGeometry=function(e){var t,r,a,i,n;if(!(e._semiMajorAxis<=0||e._semiMinorAxis<=0))return n=e._height,a=e._extrudedHeight,r=!j.CesiumMath.equalsEpsilon(n,a,0,j.CesiumMath.EPSILON2),e._center=e._ellipsoid.scaleToGeodeticSurface(e._center,e._center),n={center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:e._ellipsoid,rotation:e._rotation,height:n,granularity:e._granularity,vertexFormat:e._vertexFormat,stRotation:e._stRotation},r?(n.extrudedHeight=a,n.shadowVolume=e._shadowVolume,n.offsetAttribute=e._offsetAttribute,t=u(n)):(a=(r=n).center,o=R.Cartesian3.multiplyByScalar(r.ellipsoid.geodeticSurfaceNormal(a,o),r.height,o),o=R.Cartesian3.add(a,o,o),a=new L.BoundingSphere(o,r.semiMajorAxis),i=(n=k.EllipseGeometryLibrary.computeEllipsePositions(r,!0,!1)).positions,n=n.numPts,r=y(i,r,!1),n=c(n),t={boundingSphere:a,attributes:r,indices:p.IndexDatatype.createTypedArray(i.length/3,n)},z.defined(e._offsetAttribute)&&(a=t.attributes.position.values.length,r=new Uint8Array(a/3),i=e._offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(r,i),t.attributes.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:r}))),new B.Geometry({attributes:t.attributes,indices:t.indices,primitiveType:B.PrimitiveType.TRIANGLES,boundingSphere:t.boundingSphere,offsetAttribute:e._offsetAttribute})},f.createShadowVolume=function(e,t,r){var a=e._granularity,i=e._ellipsoid,t=t(a,i),r=r(a,i);return new f({center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:i,rotation:e._rotation,stRotation:e._stRotation,granularity:a,extrudedHeight:t,height:r,vertexFormat:d.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(f.prototype,{rectangle:{get:function(){return z.defined(this._rectangle)||(this._rectangle=s(this._center,this._semiMajorAxis,this._semiMinorAxis,this._rotation,this._granularity,this._ellipsoid)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return z.defined(this._textureCoordinateRotationPoints)||(this._textureCoordinateRotationPoints=function(e){var t=-e._stRotation;if(0==t)return[0,0,0,1,1,0];for(var r=k.EllipseGeometryLibrary.computeEllipsePositions({center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,rotation:e._rotation,granularity:e._granularity},!1,!0).outerPositions,a=r.length/3,i=new Array(a),n=0;n<a;++n)i[n]=R.Cartesian3.fromArray(r,3*n);var o=e._ellipsoid,e=e.rectangle;return B.Geometry._textureCoordinateRotationPoints(i,t,o,e)}(this)),this._textureCoordinateRotationPoints}}}),e.EllipseGeometry=f});