define(["./GeometryOffsetAttribute-8c0bd3ce","./arrayRemoveDuplicates-bce1b0dc","./Transforms-3bc98d07","./Matrix2-59fd2efe","./RuntimeError-24b14c10","./ComponentDatatype-b7b5db18","./PolylineVolumeGeometryLibrary-aaaa4829","./CorridorGeometryLibrary-64499c3b","./when-ae2e0b60","./GeometryAttribute-dff85b2b","./GeometryAttributes-5ce4955a","./IndexDatatype-6902a37d","./PolygonPipeline-ea1c8d04","./VertexFormat-1fc9746e","./combine-276652d0","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-0cf355bc","./AxisAlignedBoundingBox-9ec4e335","./IntersectionTests-d0a84f0f","./Plane-43337cee","./PolylinePipeline-5ce4be00","./EllipsoidGeodesic-640f147e","./EllipsoidRhumbLine-535d21cd"],function(E,m,d,rt,t,at,y,it,ot,nt,gt,st,V,x,e,r,a,o,n,s,l,u,P){"use strict";var lt=new rt.Cartesian3,dt=new rt.Cartesian3,ut=new rt.Cartesian3,mt=new rt.Cartesian3,N=new rt.Cartesian3,yt=new rt.Cartesian3,ft=new rt.Cartesian3,ct=new rt.Cartesian3;function f(t,e){for(var r=0;r<t.length;r++)t[r]=e.scaleToGeodeticSurface(t[r],t[r]);return t}function pt(t,e,r,a,i,o){var n=t.normals,s=t.tangents,t=t.bitangents,l=rt.Cartesian3.normalize(rt.Cartesian3.cross(r,e,ft),ft);o.normal&&it.CorridorGeometryLibrary.addAttribute(n,e,a,i),o.tangent&&it.CorridorGeometryLibrary.addAttribute(s,l,a,i),o.bitangent&&it.CorridorGeometryLibrary.addAttribute(t,r,a,i)}function F(t,e,r){var a,i=t.positions,o=t.corners,I=t.endPositions,S=t.lefts,R=t.normals,t=new gt.GeometryAttributes,n=0,s=0,k=0;for(T=0;T<i.length;T+=2)n+=a=i[T].length-3,k+=2*a,s+=i[T+1].length-3;for(n+=3,s+=3,T=0;T<o.length;T++){var H=o[T],z=o[T].leftPositions;ot.defined(z)?n+=a=z.length:s+=a=o[T].rightPositions.length,k+=a}var l,d,u,m,y,B=ot.defined(I),f=(B&&(n+=l=I[0].length-3,s+=l,k+=6*(l/=3)),n+s),c=new Float64Array(f),p={normals:e.normal?new Float32Array(f):void 0,tangents:e.tangent?new Float32Array(f):void 0,bitangents:e.bitangent?new Float32Array(f):void 0},g=0,h=f-1,b=lt,C=dt,U=l/2,A=st.IndexDatatype.createTypedArray(f/3,k),v=0;if(B)for(var _=ut,w=mt,Y=I[0],b=rt.Cartesian3.fromArray(R,0,b),C=rt.Cartesian3.fromArray(S,0,C),T=0;T<U;T++)_=rt.Cartesian3.fromArray(Y,3*(U-1-T),_),w=rt.Cartesian3.fromArray(Y,3*(U+T),w),it.CorridorGeometryLibrary.addAttribute(c,w,g),it.CorridorGeometryLibrary.addAttribute(c,_,void 0,h),pt(p,b,C,g,h,e),y=(u=g/3)+1,m=(d=(h-2)/3)-1,A[v++]=d,A[v++]=u,A[v++]=m,A[v++]=m,A[v++]=u,A[v++]=y,g+=3,h-=3;var W,q,J=0,j=0,G=i[J++],E=i[J++];for(c.set(G,g),c.set(E,h-E.length+1),C=rt.Cartesian3.fromArray(S,j,C),a=E.length-3,T=0;T<a;T+=3)W=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(G,T,ft),ft),q=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(E,a-T,ct),ct),pt(p,b=rt.Cartesian3.normalize(rt.Cartesian3.add(W,q,b),b),C,g,h,e),y=(u=g/3)+1,m=(d=(h-2)/3)-1,A[v++]=d,A[v++]=u,A[v++]=m,A[v++]=m,A[v++]=u,A[v++]=y,g+=3,h-=3;for(W=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(G,a,ft),ft),q=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(E,a,ct),ct),b=rt.Cartesian3.normalize(rt.Cartesian3.add(W,q,b),b),j+=3,T=0;T<o.length;T++){var V,x,F,K=(H=o[T]).leftPositions,Q=H.rightPositions,L=yt,P=ut,N=mt;if(b=rt.Cartesian3.fromArray(R,j,b),ot.defined(K)){for(pt(p,b,C,void 0,h,e),h-=3,x=y,F=m,V=0;V<K.length/3;V++)L=rt.Cartesian3.fromArray(K,3*V,L),A[v++]=x,A[v++]=F-V-1,A[v++]=F-V,it.CorridorGeometryLibrary.addAttribute(c,L,void 0,h),P=rt.Cartesian3.fromArray(c,3*(F-V-1),P),N=rt.Cartesian3.fromArray(c,3*x,N),pt(p,b,C=rt.Cartesian3.normalize(rt.Cartesian3.subtract(P,N,C),C),void 0,h,e),h-=3;L=rt.Cartesian3.fromArray(c,3*x,L),P=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(c,3*F,P),L,P),N=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(c,3*(F-V),N),L,N),pt(p,b,C=rt.Cartesian3.normalize(rt.Cartesian3.add(P,N,C),C),g,void 0,e),g+=3}else{for(pt(p,b,C,g,void 0,e),g+=3,x=m,F=y,V=0;V<Q.length/3;V++)L=rt.Cartesian3.fromArray(Q,3*V,L),A[v++]=x,A[v++]=F+V,A[v++]=F+V+1,it.CorridorGeometryLibrary.addAttribute(c,L,g),P=rt.Cartesian3.fromArray(c,3*x,P),N=rt.Cartesian3.fromArray(c,3*(F+V),N),pt(p,b,C=rt.Cartesian3.normalize(rt.Cartesian3.subtract(P,N,C),C),g,void 0,e),g+=3;L=rt.Cartesian3.fromArray(c,3*x,L),P=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(c,3*(F+V),P),L,P),N=rt.Cartesian3.subtract(rt.Cartesian3.fromArray(c,3*F,N),L,N),pt(p,b,C=rt.Cartesian3.normalize(rt.Cartesian3.negate(rt.Cartesian3.add(N,P,C),C),C),void 0,h,e),h-=3}for(G=i[J++],E=i[J++],G.splice(0,3),E.splice(E.length-3,3),c.set(G,g),c.set(E,h-E.length+1),a=E.length-3,j+=3,C=rt.Cartesian3.fromArray(S,j,C),V=0;V<E.length;V+=3)W=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(G,V,ft),ft),q=r.geodeticSurfaceNormal(rt.Cartesian3.fromArray(E,a-V,ct),ct),pt(p,b=rt.Cartesian3.normalize(rt.Cartesian3.add(W,q,b),b),C,g,h,e),u=(y=g/3)-1,A[v++]=d=(m=(h-2)/3)+1,A[v++]=u,A[v++]=m,A[v++]=m,A[v++]=u,A[v++]=y,g+=3,h-=3;g-=3,h+=3}if(pt(p,b=rt.Cartesian3.fromArray(R,R.length-3,b),C,g,h,e),B){g+=3,h-=3,_=ut,w=mt;var X=I[1];for(T=0;T<U;T++)_=rt.Cartesian3.fromArray(X,3*(l-T-1),_),w=rt.Cartesian3.fromArray(X,3*T,w),it.CorridorGeometryLibrary.addAttribute(c,_,void 0,h),it.CorridorGeometryLibrary.addAttribute(c,w,g),pt(p,b,C,g,h,e),u=(y=g/3)-1,A[v++]=d=(m=(h-2)/3)+1,A[v++]=u,A[v++]=m,A[v++]=m,A[v++]=u,A[v++]=y,g+=3,h-=3}if(t.position=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c}),e.st){var D=new Float32Array(f/3*2),M=0;if(B){n/=3,s/=3;var O,Z=Math.PI/(l+1),$=1/(n-l+1),tt=1/(s-l+1),et=l/2;for(T=1+et;T<l+1;T++)O=at.CesiumMath.PI_OVER_TWO+Z*T,D[M++]=tt*(1+Math.cos(O)),D[M++]=.5*(1+Math.sin(O));for(T=1;T<s-l+1;T++)D[M++]=T*tt,D[M++]=0;for(T=l;et<T;T--)O=at.CesiumMath.PI_OVER_TWO-T*Z,D[M++]=1-tt*(1+Math.cos(O)),D[M++]=.5*(1+Math.sin(O));for(T=et;0<T;T--)O=at.CesiumMath.PI_OVER_TWO-Z*T,D[M++]=1-$*(1+Math.cos(O)),D[M++]=.5*(1+Math.sin(O));for(T=n-l;0<T;T--)D[M++]=T*$,D[M++]=1;for(T=1;T<1+et;T++)O=at.CesiumMath.PI_OVER_TWO+Z*T,D[M++]=$*(1+Math.cos(O)),D[M++]=.5*(1+Math.sin(O))}else{for($=1/((n/=3)-1),tt=1/((s/=3)-1),T=0;T<s;T++)D[M++]=T*tt,D[M++]=0;for(T=n;0<T;T--)D[M++]=(T-1)*$,D[M++]=1}t.st=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:D})}return e.normal&&(t.normal=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:p.normals})),e.tangent&&(t.tangent=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:p.tangents})),e.bitangent&&(t.bitangent=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:p.bitangents})),{attributes:t,indices:A}}function L(t,e,r){r[e++]=t[0],r[e++]=t[1],r[e++]=t[2];for(var a=3;a<t.length;a+=3){var i=t[a],o=t[a+1],n=t[a+2];r[e++]=i,r[e++]=o,r[e++]=n,r[e++]=i,r[e++]=o,r[e++]=n}return r[e++]=t[0],r[e++]=t[1],r[e++]=t[2],r}function D(t,e){var r=new x.VertexFormat({position:e.position,normal:e.normal||e.bitangent||t.shadowVolume,tangent:e.tangent,bitangent:e.normal||e.bitangent,st:e.st}),a=t.ellipsoid,r=F(it.CorridorGeometryLibrary.computePositions(t),r,a),i=t.height,o=t.extrudedHeight,n=r.attributes,s=r.indices,r=n.position.values,l=r.length,d=new Float64Array(6*l),u=new Float64Array(l),m=(u.set(r),new Float64Array(4*l)),m=L(r=V.PolygonPipeline.scaleToGeodeticHeight(r,i,a),0,m),n=(m=L(u=V.PolygonPipeline.scaleToGeodeticHeight(u,o,a),2*l,m),d.set(r),d.set(u,l),d.set(m,2*l),n.position.values=d,function(t,e){if(e.normal||e.tangent||e.bitangent||e.st){var r,a,i=t.position.values,o=((e.normal||e.bitangent)&&(r=t.normal.values,a=t.bitangent.values),t.position.values.length/18),n=3*o,s=2*o,l=2*n;if(e.normal||e.bitangent||e.tangent){for(var d=e.normal?new Float32Array(6*n):void 0,u=e.tangent?new Float32Array(6*n):void 0,m=e.bitangent?new Float32Array(6*n):void 0,y=lt,f=dt,c=ut,p=mt,g=N,h=yt,b=l,C=0;C<n;C+=3){var A=b+l,y=rt.Cartesian3.fromArray(i,C,y),f=rt.Cartesian3.fromArray(i,C+n,f),c=rt.Cartesian3.fromArray(i,(C+3)%n,c);f=rt.Cartesian3.subtract(f,y,f),c=rt.Cartesian3.subtract(c,y,c),p=rt.Cartesian3.normalize(rt.Cartesian3.cross(f,c,p),p),e.normal&&(it.CorridorGeometryLibrary.addAttribute(d,p,A),it.CorridorGeometryLibrary.addAttribute(d,p,A+3),it.CorridorGeometryLibrary.addAttribute(d,p,b),it.CorridorGeometryLibrary.addAttribute(d,p,b+3)),(e.tangent||e.bitangent)&&(h=rt.Cartesian3.fromArray(r,C,h),e.bitangent&&(it.CorridorGeometryLibrary.addAttribute(m,h,A),it.CorridorGeometryLibrary.addAttribute(m,h,A+3),it.CorridorGeometryLibrary.addAttribute(m,h,b),it.CorridorGeometryLibrary.addAttribute(m,h,b+3)),e.tangent)&&(g=rt.Cartesian3.normalize(rt.Cartesian3.cross(h,p,g),g),it.CorridorGeometryLibrary.addAttribute(u,g,A),it.CorridorGeometryLibrary.addAttribute(u,g,A+3),it.CorridorGeometryLibrary.addAttribute(u,g,b),it.CorridorGeometryLibrary.addAttribute(u,g,b+3)),b+=6}if(e.normal){for(d.set(r),C=0;C<n;C+=3)d[C+n]=-r[C],d[C+n+1]=-r[C+1],d[C+n+2]=-r[C+2];t.normal.values=d}else t.normal=void 0;e.bitangent?(m.set(a),m.set(a,n),t.bitangent.values=m):t.bitangent=void 0,e.tangent&&(o=t.tangent.values,u.set(o),u.set(o,n),t.tangent.values=u)}if(e.st){for(var v=t.st.values,_=new Float32Array(6*s),w=(_.set(v),_.set(v,s),2*s),T=0;T<2;T++){for(_[w++]=v[0],_[w++]=v[1],C=2;C<s;C+=2){var G=v[C],E=v[C+1];_[w++]=G,_[w++]=E,_[w++]=G,_[w++]=E}_[w++]=v[0],_[w++]=v[1]}t.st.values=_}}return t}(n,e)),y=l/3;if(t.shadowVolume){for(var f=n.normal.values,l=f.length,i=new Float32Array(6*l),c=0;c<l;c++)f[c]=-f[c];i.set(f,l),i=L(f,4*l,i),n.extrudeDirection=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:i}),e.normal||(n.normal=void 0)}ot.defined(t.offsetAttribute)&&(o=new Uint8Array(6*y),o=t.offsetAttribute===E.GeometryOffsetAttribute.TOP?(o=E.arrayFill(o,1,0,y),E.arrayFill(o,1,2*y,4*y)):(a=t.offsetAttribute===E.GeometryOffsetAttribute.NONE?0:1,E.arrayFill(o,a)),n.applyOffset=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:o}));var p,g,h,b,C=s.length,A=y+y,v=st.IndexDatatype.createTypedArray(d.length/3,2*C+3*A),_=(v.set(s),C);for(c=0;c<C;c+=3){var w=s[c],T=s[c+1],G=s[c+2];v[_++]=G+y,v[_++]=T+y,v[_++]=w+y}for(c=0;c<A;c+=2)h=(p=c+A)+1,b=(g=p+A)+1,v[_++]=p,v[_++]=g,v[_++]=h,v[_++]=h,v[_++]=g,v[_++]=b;return{attributes:n,indices:v}}var c=new rt.Cartesian3,p=new rt.Cartesian3,g=new rt.Cartographic;function h(t,e,r,a,i,o){var e=rt.Cartesian3.subtract(e,t,c),n=(rt.Cartesian3.normalize(e,e),r.geodeticSurfaceNormal(t,p)),e=rt.Cartesian3.cross(e,n,c),n=(rt.Cartesian3.multiplyByScalar(e,a,e),i.latitude),a=i.longitude,s=o.latitude,l=o.longitude,d=(rt.Cartesian3.add(t,e,p),r.cartesianToCartographic(p,g),g.latitude),u=g.longitude,n=Math.min(n,d),a=Math.min(a,u),s=Math.max(s,d),l=Math.max(l,u);rt.Cartesian3.subtract(t,e,p),r.cartesianToCartographic(p,g),d=g.latitude,u=g.longitude,n=Math.min(n,d),a=Math.min(a,u),s=Math.max(s,d),l=Math.max(l,u),i.latitude=n,i.longitude=a,o.latitude=s,o.longitude=l}var b=new rt.Cartesian3,C=new rt.Cartesian3,A=new rt.Cartographic,v=new rt.Cartographic;function i(t,e,r,a,i){t=f(t,e);var o=m.arrayRemoveDuplicates(t,rt.Cartesian3.equalsEpsilon),n=o.length;if(n<2||r<=0)return new rt.Rectangle;var s,l,d=.5*r;A.latitude=Number.POSITIVE_INFINITY,A.longitude=Number.POSITIVE_INFINITY,v.latitude=Number.NEGATIVE_INFINITY,v.longitude=Number.NEGATIVE_INFINITY,a===y.CornerType.ROUNDED&&(t=o[0],rt.Cartesian3.subtract(t,o[1],b),rt.Cartesian3.normalize(b,b),rt.Cartesian3.multiplyByScalar(b,d,b),rt.Cartesian3.add(t,b,C),e.cartesianToCartographic(C,g),s=g.latitude,l=g.longitude,A.latitude=Math.min(A.latitude,s),A.longitude=Math.min(A.longitude,l),v.latitude=Math.max(v.latitude,s),v.longitude=Math.max(v.longitude,l));for(var u=0;u<n-1;++u)h(o[u],o[u+1],e,d,A,v);r=o[n-1],rt.Cartesian3.subtract(r,o[n-2],b),rt.Cartesian3.normalize(b,b),rt.Cartesian3.multiplyByScalar(b,d,b),rt.Cartesian3.add(r,b,C),h(r,C,e,d,A,v),a===y.CornerType.ROUNDED&&(e.cartesianToCartographic(C,g),s=g.latitude,l=g.longitude,A.latitude=Math.min(A.latitude,s),A.longitude=Math.min(A.longitude,l),v.latitude=Math.max(v.latitude,s),v.longitude=Math.max(v.longitude,l)),t=ot.defined(i)?i:new rt.Rectangle;return t.north=v.latitude,t.south=A.latitude,t.east=v.longitude,t.west=A.longitude,t}function _(t){var e=(t=ot.defaultValue(t,ot.defaultValue.EMPTY_OBJECT)).positions,r=t.width,a=ot.defaultValue(t.height,0),i=ot.defaultValue(t.extrudedHeight,a);this._positions=e,this._ellipsoid=rt.Ellipsoid.clone(ot.defaultValue(t.ellipsoid,rt.Ellipsoid.WGS84)),this._vertexFormat=x.VertexFormat.clone(ot.defaultValue(t.vertexFormat,x.VertexFormat.DEFAULT)),this._width=r,this._height=Math.max(a,i),this._extrudedHeight=Math.min(a,i),this._cornerType=ot.defaultValue(t.cornerType,y.CornerType.ROUNDED),this._granularity=ot.defaultValue(t.granularity,at.CesiumMath.RADIANS_PER_DEGREE),this._shadowVolume=ot.defaultValue(t.shadowVolume,!1),this._workerName="createCorridorGeometry",this._offsetAttribute=t.offsetAttribute,this._rectangle=void 0,this.packedLength=1+e.length*rt.Cartesian3.packedLength+rt.Ellipsoid.packedLength+x.VertexFormat.packedLength+7}_.pack=function(t,e,r){r=ot.defaultValue(r,0);var a=t._positions,i=a.length;e[r++]=i;for(var o=0;o<i;++o,r+=rt.Cartesian3.packedLength)rt.Cartesian3.pack(a[o],e,r);return rt.Ellipsoid.pack(t._ellipsoid,e,r),r+=rt.Ellipsoid.packedLength,x.VertexFormat.pack(t._vertexFormat,e,r),r+=x.VertexFormat.packedLength,e[r++]=t._width,e[r++]=t._height,e[r++]=t._extrudedHeight,e[r++]=t._cornerType,e[r++]=t._granularity,e[r++]=t._shadowVolume?1:0,e[r]=ot.defaultValue(t._offsetAttribute,-1),e};var w=rt.Ellipsoid.clone(rt.Ellipsoid.UNIT_SPHERE),T=new x.VertexFormat,G={positions:void 0,ellipsoid:w,vertexFormat:T,width:void 0,height:void 0,extrudedHeight:void 0,cornerType:void 0,granularity:void 0,shadowVolume:void 0,offsetAttribute:void 0};return _.unpack=function(t,e,r){e=ot.defaultValue(e,0);for(var a=t[e++],i=new Array(a),o=0;o<a;++o,e+=rt.Cartesian3.packedLength)i[o]=rt.Cartesian3.unpack(t,e);var n=rt.Ellipsoid.unpack(t,e,w),s=(e+=rt.Ellipsoid.packedLength,x.VertexFormat.unpack(t,e,T)),l=(e+=x.VertexFormat.packedLength,t[e++]),d=t[e++],u=t[e++],m=t[e++],y=t[e++],f=1===t[e++],c=t[e];return ot.defined(r)?(r._positions=i,r._ellipsoid=rt.Ellipsoid.clone(n,r._ellipsoid),r._vertexFormat=x.VertexFormat.clone(s,r._vertexFormat),r._width=l,r._height=d,r._extrudedHeight=u,r._cornerType=m,r._granularity=y,r._shadowVolume=f,r._offsetAttribute=-1===c?void 0:c,r):(G.positions=i,G.width=l,G.height=d,G.extrudedHeight=u,G.cornerType=m,G.granularity=y,G.shadowVolume=f,G.offsetAttribute=-1===c?void 0:c,new _(G))},_.computeRectangle=function(t,e){var r=(t=ot.defaultValue(t,ot.defaultValue.EMPTY_OBJECT)).positions,a=t.width;return i(r,ot.defaultValue(t.ellipsoid,rt.Ellipsoid.WGS84),a,ot.defaultValue(t.cornerType,y.CornerType.ROUNDED),e)},_.createGeometry=function(t){var e,r,a,i,o,n=t._positions,s=t._width,l=t._ellipsoid,n=f(n,l),n=m.arrayRemoveDuplicates(n,rt.Cartesian3.equalsEpsilon);if(!(n.length<2||s<=0))return o=t._height,a=t._extrudedHeight,r=!at.CesiumMath.equalsEpsilon(o,a,0,at.CesiumMath.EPSILON2),e=t._vertexFormat,n={ellipsoid:l,positions:n,width:s,cornerType:t._cornerType,granularity:t._granularity,saveAttributes:!0},r?(n.height=o,n.extrudedHeight=a,n.shadowVolume=t._shadowVolume,n.offsetAttribute=t._offsetAttribute,i=D(n,e)):((i=F(it.CorridorGeometryLibrary.computePositions(n),e,l)).attributes.position.values=V.PolygonPipeline.scaleToGeodeticHeight(i.attributes.position.values,o,l),ot.defined(t._offsetAttribute)&&(s=t._offsetAttribute===E.GeometryOffsetAttribute.NONE?0:1,r=i.attributes.position.values.length,a=new Uint8Array(r/3),E.arrayFill(a,s),i.attributes.applyOffset=new nt.GeometryAttribute({componentDatatype:at.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a}))),n=i.attributes,o=d.BoundingSphere.fromVertices(n.position.values,void 0,3),e.position||(i.attributes.position.values=void 0),new nt.Geometry({attributes:n,indices:i.indices,primitiveType:nt.PrimitiveType.TRIANGLES,boundingSphere:o,offsetAttribute:t._offsetAttribute})},_.createShadowVolume=function(t,e,r){var a=t._granularity,i=t._ellipsoid,e=e(a,i),r=r(a,i);return new _({positions:t._positions,width:t._width,cornerType:t._cornerType,ellipsoid:i,granularity:a,extrudedHeight:e,height:r,vertexFormat:x.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(_.prototype,{rectangle:{get:function(){return ot.defined(this._rectangle)||(this._rectangle=i(this._positions,this._ellipsoid,this._width,this._cornerType)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return[0,0,0,1,1,0]}}}),function(t,e){return(t=ot.defined(e)?_.unpack(t,e):t)._ellipsoid=rt.Ellipsoid.clone(t._ellipsoid),_.createGeometry(t)}});
