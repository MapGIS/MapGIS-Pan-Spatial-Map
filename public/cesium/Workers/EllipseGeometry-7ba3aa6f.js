define(["exports","./GeometryOffsetAttribute-b02d5bb9","./Transforms-5aeb1d5e","./Cartesian2-078e6458","./Check-f996273c","./ComponentDatatype-e44126e4","./when-ae2e0b60","./EllipseGeometryLibrary-46efe941","./GeometryAttribute-ccf4e0b6","./GeometryAttributes-5ce4955a","./GeometryInstance-3287a41d","./GeometryPipeline-dd278883","./IndexDatatype-516320ea","./Math-5bbcea10","./VertexFormat-90d15264"],function(e,S,L,R,t,j,k,z,B,Y,m,C,p,y,d){"use strict";var H=new R.Cartesian3,U=new R.Cartesian3,Q=new R.Cartesian3,W=new R.Cartesian3,J=new R.Cartesian2,q=new L.Matrix3,ie=new L.Matrix3,Z=new L.Quaternion,K=new R.Cartesian3,X=new R.Cartesian3,$=new R.Cartesian3,ee=new R.Cartographic,te=new R.Cartesian3,re=new R.Cartesian2,ae=new R.Cartesian2;function c(e,t,r){for(var a=t.vertexFormat,i=t.center,n=t.semiMajorAxis,o=t.semiMinorAxis,s=t.ellipsoid,l=t.stRotation,u=r?e.length/3*2:e.length/3,m=t.shadowVolume,p=a.st?new Float32Array(2*u):void 0,y=a.normal?new Float32Array(3*u):void 0,c=a.tangent?new Float32Array(3*u):void 0,d=a.bitangent?new Float32Array(3*u):void 0,A=m?new Float32Array(3*u):void 0,h=0,x=K,f=X,g=$,_=new L.GeographicProjection(s),b=_.project(s.cartesianToCartographic(i,ee),te),i=s.scaleToGeodeticSurface(i,H),C=(s.geodeticSurfaceNormal(i,i),q),v=ie,w=(v=0!==l?(O=L.Quaternion.fromAxisAngle(i,l,Z),C=L.Matrix3.fromQuaternion(O,C),O=L.Quaternion.fromAxisAngle(i,-l,Z),L.Matrix3.fromQuaternion(O,v)):(C=L.Matrix3.clone(L.Matrix3.IDENTITY,C),L.Matrix3.clone(L.Matrix3.IDENTITY,v)),R.Cartesian2.fromElements(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,re)),M=R.Cartesian2.fromElements(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,ae),E=e.length,I=r?E:0,T=I/3*2,G=0;G<E;G+=3){var N,P=G+1,F=G+2,V=R.Cartesian3.fromArray(e,G,H);a.st&&(N=L.Matrix3.multiplyByVector(C,V,U),N=_.project(s.cartesianToCartographic(N,ee),Q),R.Cartesian3.subtract(N,b,N),J.x=(N.x+n)/(2*n),J.y=(N.y+o)/(2*o),w.x=Math.min(J.x,w.x),w.y=Math.min(J.y,w.y),M.x=Math.max(J.x,M.x),M.y=Math.max(J.y,M.y),r&&(p[h+T]=J.x,p[h+1+T]=J.y),p[h++]=J.x,p[h++]=J.y),(a.normal||a.tangent||a.bitangent||m)&&(x=s.geodeticSurfaceNormal(V,x),m&&(A[G+I]=-x.x,A[P+I]=-x.y,A[F+I]=-x.z),a.normal||a.tangent||a.bitangent)&&((a.tangent||a.bitangent)&&(f=R.Cartesian3.normalize(R.Cartesian3.cross(R.Cartesian3.UNIT_Z,x,f),f),L.Matrix3.multiplyByVector(v,f,f)),a.normal&&(y[G]=x.x,y[P]=x.y,y[F]=x.z,r)&&(y[G+I]=-x.x,y[P+I]=-x.y,y[F+I]=-x.z),a.tangent&&(c[G]=f.x,c[P]=f.y,c[F]=f.z,r)&&(c[G+I]=-f.x,c[P+I]=-f.y,c[F+I]=-f.z),a.bitangent)&&(g=R.Cartesian3.normalize(R.Cartesian3.cross(x,f,g),g),d[G]=g.x,d[P]=g.y,d[F]=g.z,r)&&(d[G+I]=g.x,d[P+I]=g.y,d[F+I]=g.z)}if(a.st)for(var E=p.length,D=0;D<E;D+=2)p[D]=(p[D]-w.x)/(M.x-w.x),p[D+1]=(p[D+1]-w.y)/(M.y-w.y);var O,i=new Y.GeometryAttributes;return a.position&&(l=z.EllipseGeometryLibrary.raisePositionsToHeight(e,t,r),i.position=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:l})),a.st&&(i.st=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:p})),a.normal&&(i.normal=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:y})),a.tangent&&(i.tangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:c})),a.bitangent&&(i.bitangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),m&&(i.extrudeDirection=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:A})),r&&k.defined(t.offsetAttribute)&&(O=new Uint8Array(u),O=t.offsetAttribute===S.GeometryOffsetAttribute.TOP?S.arrayFill(O,1,0,u/2):(l=t.offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(O,l)),i.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:O})),i}function A(e){for(var t,r,a=new Array(e*(e+1)*12-6),i=0,n=0,o=1,s=0;s<3;s++)a[i++]=o++,a[i++]=n,a[i++]=o;for(s=2;s<e+1;++s){for(o=s*(s+1)-1,n=(s-1)*s-1,a[i++]=o++,a[i++]=n,a[i++]=o,t=2*s,r=0;r<t-1;++r)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;a[i++]=o++,a[i++]=n,a[i++]=o}for(t=2*e,++o,++n,s=0;s<t-1;++s)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;for(a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n++,a[i++]=n,++n,s=e-1;1<s;--s){for(a[i++]=n++,a[i++]=n,a[i++]=o,t=2*s,r=0;r<t-1;++r)a[i++]=o,a[i++]=n++,a[i++]=n,a[i++]=o++,a[i++]=n,a[i++]=o;a[i++]=n++,a[i++]=n++,a[i++]=o++}for(s=0;s<3;s++)a[i++]=n++,a[i++]=n,a[i++]=o;return a}var o=new R.Cartesian3;var h=new L.BoundingSphere,x=new L.BoundingSphere;function l(e){for(var t=e.center,r=e.ellipsoid,a=e.semiMajorAxis,i=R.Cartesian3.multiplyByScalar(r.geodeticSurfaceNormal(t,H),e.height,H),r=(h.center=R.Cartesian3.add(t,i,h.center),h.radius=a,i=R.Cartesian3.multiplyByScalar(r.geodeticSurfaceNormal(t,i),e.extrudedHeight,i),x.center=R.Cartesian3.add(t,i,x.center),x.radius=a,z.EllipseGeometryLibrary.computeEllipsePositions(e,!0,!0)),t=r.positions,i=r.numPts,a=r.outerPositions,r=L.BoundingSphere.union(h,x),n=c(t,e,!0),o=(u=A(i)).length,s=(u.length=2*o,t.length/3),l=0;l<o;l+=3)u[l+o]=u[l+2]+s,u[l+1+o]=u[l+1]+s,u[l+2+o]=u[l]+s;var i=p.IndexDatatype.createTypedArray(2*s/3,u),t=new B.Geometry({attributes:n,indices:i,primitiveType:B.PrimitiveType.TRIANGLES}),n=function(e,t){for(var r=t.vertexFormat,a=t.center,i=t.semiMajorAxis,n=t.semiMinorAxis,o=t.ellipsoid,s=t.height,l=t.extrudedHeight,u=t.stRotation,m=e.length/3*2,p=new Float64Array(3*m),y=r.st?new Float32Array(2*m):void 0,c=r.normal?new Float32Array(3*m):void 0,d=r.tangent?new Float32Array(3*m):void 0,A=r.bitangent?new Float32Array(3*m):void 0,h=t.shadowVolume,x=h?new Float32Array(3*m):void 0,f=0,g=K,_=X,b=$,C=new L.GeographicProjection(o),v=C.project(o.cartesianToCartographic(a,ee),te),a=o.scaleToGeodeticSurface(a,H),a=(o.geodeticSurfaceNormal(a,a),L.Quaternion.fromAxisAngle(a,u,Z)),w=L.Matrix3.fromQuaternion(a,q),M=R.Cartesian2.fromElements(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,re),E=R.Cartesian2.fromElements(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,ae),I=(D=e.length)/3*2,T=0;T<D;T+=3){var G=T+1,N=T+2,P=R.Cartesian3.fromArray(e,T,H),F=(r.st&&(V=L.Matrix3.multiplyByVector(w,P,U),V=C.project(o.cartesianToCartographic(V,ee),Q),R.Cartesian3.subtract(V,v,V),J.x=(V.x+i)/(2*i),J.y=(V.y+n)/(2*n),M.x=Math.min(J.x,M.x),M.y=Math.min(J.y,M.y),E.x=Math.max(J.x,E.x),E.y=Math.max(J.y,E.y),y[f+I]=J.x,y[f+1+I]=J.y,y[f++]=J.x,y[f++]=J.y),P=o.scaleToGeodeticSurface(P,P),V=R.Cartesian3.clone(P,U),g=o.geodeticSurfaceNormal(P,g),h&&(x[T+D]=-g.x,x[G+D]=-g.y,x[N+D]=-g.z),R.Cartesian3.multiplyByScalar(g,s,W)),P=R.Cartesian3.add(P,F,P),F=R.Cartesian3.multiplyByScalar(g,l,F),V=R.Cartesian3.add(V,F,V);r.position&&(p[T+D]=V.x,p[G+D]=V.y,p[N+D]=V.z,p[T]=P.x,p[G]=P.y,p[N]=P.z),(r.normal||r.tangent||r.bitangent)&&(b=R.Cartesian3.clone(g,b),F=R.Cartesian3.fromArray(e,(T+3)%D,W),R.Cartesian3.subtract(F,P,F),P=R.Cartesian3.subtract(V,P,Q),g=R.Cartesian3.normalize(R.Cartesian3.cross(P,F,g),g),r.normal&&(c[T]=g.x,c[G]=g.y,c[N]=g.z,c[T+D]=g.x,c[G+D]=g.y,c[N+D]=g.z),r.tangent&&(_=R.Cartesian3.normalize(R.Cartesian3.cross(b,g,_),_),d[T]=_.x,d[G]=_.y,d[N]=_.z,d[T+D]=_.x,d[T+1+D]=_.y,d[T+2+D]=_.z),r.bitangent)&&(A[T]=b.x,A[G]=b.y,A[N]=b.z,A[T+D]=b.x,A[G+D]=b.y,A[N+D]=b.z)}if(r.st)for(var D=y.length,O=0;O<D;O+=2)y[O]=(y[O]-M.x)/(E.x-M.x),y[O+1]=(y[O+1]-M.y)/(E.y-M.y);return u=new Y.GeometryAttributes,r.position&&(u.position=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p})),r.st&&(u.st=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:y})),r.normal&&(u.normal=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:c})),r.tangent&&(u.tangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),r.bitangent&&(u.bitangent=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:A})),h&&(u.extrudeDirection=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:x})),k.defined(t.offsetAttribute)&&(a=new Uint8Array(m),a=t.offsetAttribute===S.GeometryOffsetAttribute.TOP?S.arrayFill(a,1,0,m/2):(m=t.offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(a,m)),u.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),u}(a,e),u=function(e){for(var t=e.length/3,r=p.IndexDatatype.createTypedArray(t,6*t),a=0,i=0;i<t;i++){var n=i,o=i+t,s=(n+1)%t,l=s+t;r[a++]=n,r[a++]=o,r[a++]=s,r[a++]=s,r[a++]=o,r[a++]=l}return r}(a),i=p.IndexDatatype.createTypedArray(2*a.length/3,u),e=new B.Geometry({attributes:n,indices:i,primitiveType:B.PrimitiveType.TRIANGLES}),a=C.GeometryPipeline.combineInstances([new m.GeometryInstance({geometry:t}),new m.GeometryInstance({geometry:e})]);return{boundingSphere:r,attributes:a[0].attributes,indices:a[0].indices}}function s(e,t,r,a,i,n,o){for(var s=z.EllipseGeometryLibrary.computeEllipsePositions({center:e,semiMajorAxis:t,semiMinorAxis:r,rotation:a,granularity:i},!1,!0).outerPositions,l=s.length/3,u=new Array(l),m=0;m<l;++m)u[m]=R.Cartesian3.fromArray(s,3*m);e=R.Rectangle.fromCartesianArray(u,n,o);return e.width>y.CesiumMath.PI&&(e.north=0<e.north?y.CesiumMath.PI_OVER_TWO-y.CesiumMath.EPSILON7:e.north,e.south=e.south<0?y.CesiumMath.EPSILON7-y.CesiumMath.PI_OVER_TWO:e.south,e.east=y.CesiumMath.PI,e.west=-y.CesiumMath.PI),e}function f(e){var t=(e=k.defaultValue(e,k.defaultValue.EMPTY_OBJECT)).center,r=k.defaultValue(e.ellipsoid,R.Ellipsoid.WGS84),a=e.semiMajorAxis,i=e.semiMinorAxis,n=k.defaultValue(e.granularity,y.CesiumMath.RADIANS_PER_DEGREE),o=k.defaultValue(e.vertexFormat,d.VertexFormat.DEFAULT),s=k.defaultValue(e.height,0),l=k.defaultValue(e.extrudedHeight,s);this._center=R.Cartesian3.clone(t),this._semiMajorAxis=a,this._semiMinorAxis=i,this._ellipsoid=R.Ellipsoid.clone(r),this._rotation=k.defaultValue(e.rotation,0),this._stRotation=k.defaultValue(e.stRotation,0),this._height=Math.max(l,s),this._granularity=n,this._vertexFormat=d.VertexFormat.clone(o),this._extrudedHeight=Math.min(l,s),this._shadowVolume=k.defaultValue(e.shadowVolume,!1),this._workerName="createEllipseGeometry",this._offsetAttribute=e.offsetAttribute,this._rectangle=void 0,this._textureCoordinateRotationPoints=void 0}f.packedLength=R.Cartesian3.packedLength+R.Ellipsoid.packedLength+d.VertexFormat.packedLength+9,f.pack=function(e,t,r){return r=k.defaultValue(r,0),R.Cartesian3.pack(e._center,t,r),r+=R.Cartesian3.packedLength,R.Ellipsoid.pack(e._ellipsoid,t,r),r+=R.Ellipsoid.packedLength,d.VertexFormat.pack(e._vertexFormat,t,r),r+=d.VertexFormat.packedLength,t[r++]=e._semiMajorAxis,t[r++]=e._semiMinorAxis,t[r++]=e._rotation,t[r++]=e._stRotation,t[r++]=e._height,t[r++]=e._granularity,t[r++]=e._extrudedHeight,t[r++]=e._shadowVolume?1:0,t[r]=k.defaultValue(e._offsetAttribute,-1),t};var g=new R.Cartesian3,_=new R.Ellipsoid,v=new d.VertexFormat,b={center:g,ellipsoid:_,vertexFormat:v,semiMajorAxis:void 0,semiMinorAxis:void 0,rotation:void 0,stRotation:void 0,height:void 0,granularity:void 0,extrudedHeight:void 0,shadowVolume:void 0,offsetAttribute:void 0};f.unpack=function(e,t,r){t=k.defaultValue(t,0);var a=R.Cartesian3.unpack(e,t,g),i=(t+=R.Cartesian3.packedLength,R.Ellipsoid.unpack(e,t,_)),n=(t+=R.Ellipsoid.packedLength,d.VertexFormat.unpack(e,t,v)),o=(t+=d.VertexFormat.packedLength,e[t++]),s=e[t++],l=e[t++],u=e[t++],m=e[t++],p=e[t++],y=e[t++],c=1===e[t++],e=e[t];return k.defined(r)?(r._center=R.Cartesian3.clone(a,r._center),r._ellipsoid=R.Ellipsoid.clone(i,r._ellipsoid),r._vertexFormat=d.VertexFormat.clone(n,r._vertexFormat),r._semiMajorAxis=o,r._semiMinorAxis=s,r._rotation=l,r._stRotation=u,r._height=m,r._granularity=p,r._extrudedHeight=y,r._shadowVolume=c,r._offsetAttribute=-1===e?void 0:e,r):(b.height=m,b.extrudedHeight=y,b.granularity=p,b.stRotation=u,b.rotation=l,b.semiMajorAxis=o,b.semiMinorAxis=s,b.shadowVolume=c,b.offsetAttribute=-1===e?void 0:e,new f(b))},f.computeRectangle=function(e,t){var r=(e=k.defaultValue(e,k.defaultValue.EMPTY_OBJECT)).center,a=k.defaultValue(e.ellipsoid,R.Ellipsoid.WGS84),i=e.semiMajorAxis,n=e.semiMinorAxis,o=k.defaultValue(e.granularity,y.CesiumMath.RADIANS_PER_DEGREE);return s(r,i,n,k.defaultValue(e.rotation,0),o,a,t)},f.createGeometry=function(e){var t,r,a,i,n;if(!(e._semiMajorAxis<=0||e._semiMinorAxis<=0))return n=e._height,a=e._extrudedHeight,r=!y.CesiumMath.equalsEpsilon(n,a,0,y.CesiumMath.EPSILON2),e._center=e._ellipsoid.scaleToGeodeticSurface(e._center,e._center),n={center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:e._ellipsoid,rotation:e._rotation,height:n,granularity:e._granularity,vertexFormat:e._vertexFormat,stRotation:e._stRotation},r?(n.extrudedHeight=a,n.shadowVolume=e._shadowVolume,n.offsetAttribute=e._offsetAttribute,t=l(n)):(a=(r=n).center,o=R.Cartesian3.multiplyByScalar(r.ellipsoid.geodeticSurfaceNormal(a,o),r.height,o),o=R.Cartesian3.add(a,o,o),a=new L.BoundingSphere(o,r.semiMajorAxis),i=(n=z.EllipseGeometryLibrary.computeEllipsePositions(r,!0,!1)).positions,n=n.numPts,r=c(i,r,!1),n=A(n),t={boundingSphere:a,attributes:r,indices:p.IndexDatatype.createTypedArray(i.length/3,n)},k.defined(e._offsetAttribute)&&(a=t.attributes.position.values.length,r=new Uint8Array(a/3),i=e._offsetAttribute===S.GeometryOffsetAttribute.NONE?0:1,S.arrayFill(r,i),t.attributes.applyOffset=new B.GeometryAttribute({componentDatatype:j.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:r}))),new B.Geometry({attributes:t.attributes,indices:t.indices,primitiveType:B.PrimitiveType.TRIANGLES,boundingSphere:t.boundingSphere,offsetAttribute:e._offsetAttribute})},f.createShadowVolume=function(e,t,r){var a=e._granularity,i=e._ellipsoid,t=t(a,i),r=r(a,i);return new f({center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:i,rotation:e._rotation,stRotation:e._stRotation,granularity:a,extrudedHeight:t,height:r,vertexFormat:d.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(f.prototype,{rectangle:{get:function(){return k.defined(this._rectangle)||(this._rectangle=s(this._center,this._semiMajorAxis,this._semiMinorAxis,this._rotation,this._granularity,this._ellipsoid)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return k.defined(this._textureCoordinateRotationPoints)||(this._textureCoordinateRotationPoints=function(e){var t=-e._stRotation;if(0==t)return[0,0,0,1,1,0];for(var r=z.EllipseGeometryLibrary.computeEllipsePositions({center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,rotation:e._rotation,granularity:e._granularity},!1,!0).outerPositions,a=r.length/3,i=new Array(a),n=0;n<a;++n)i[n]=R.Cartesian3.fromArray(r,3*n);var o=e._ellipsoid,e=e.rectangle;return B.Geometry._textureCoordinateRotationPoints(i,t,o,e)}(this)),this._textureCoordinateRotationPoints}}}),e.EllipseGeometry=f});
