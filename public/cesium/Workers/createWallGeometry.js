define(["./when-ae2e0b60","./Cartesian2-c1eb9da0","./Transforms-8c8e0c6f","./ComponentDatatype-e44126e4","./Check-f996273c","./GeometryAttribute-8106b887","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./VertexFormat-90d15264","./WallGeometryLibrary-5386b8d1","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./arrayRemoveDuplicates-bdf50aa0","./PolylinePipeline-6484d4ee","./EllipsoidGeodesic-a0581819","./EllipsoidRhumbLine-2fd480f5","./IntersectionTests-46ce3a3a","./Plane-0f30f65b"],function(S,I,N,M,e,W,B,U,q,p,J,t,a,i,n,r,o,s,m,l){"use strict";var Y=new I.Cartesian3,Z=new I.Cartesian3,j=new I.Cartesian3,K=new I.Cartesian3,Q=new I.Cartesian3,X=new I.Cartesian3,$=new I.Cartesian3;function d(e){var t=(e=S.defaultValue(e,S.defaultValue.EMPTY_OBJECT)).positions,a=e.maximumHeights,i=e.minimumHeights,n=S.defaultValue(e.vertexFormat,p.VertexFormat.DEFAULT),r=S.defaultValue(e.granularity,q.CesiumMath.RADIANS_PER_DEGREE),e=S.defaultValue(e.ellipsoid,I.Ellipsoid.WGS84),n=(this._positions=t,this._minimumHeights=i,this._maximumHeights=a,this._vertexFormat=p.VertexFormat.clone(n),this._granularity=r,this._ellipsoid=I.Ellipsoid.clone(e),this._workerName="createWallGeometry",1+t.length*I.Cartesian3.packedLength+2);S.defined(i)&&(n+=i.length),S.defined(a)&&(n+=a.length),this.packedLength=n+I.Ellipsoid.packedLength+p.VertexFormat.packedLength+1}d.pack=function(e,t,a){a=S.defaultValue(a,0);var i,n=e._positions,r=n.length;for(t[a++]=r,i=0;i<r;++i,a+=I.Cartesian3.packedLength)I.Cartesian3.pack(n[i],t,a);var o=e._minimumHeights,r=S.defined(o)?o.length:0;if(t[a++]=r,S.defined(o))for(i=0;i<r;++i)t[a++]=o[i];var s=e._maximumHeights;if(r=S.defined(s)?s.length:0,t[a++]=r,S.defined(s))for(i=0;i<r;++i)t[a++]=s[i];return I.Ellipsoid.pack(e._ellipsoid,t,a),a+=I.Ellipsoid.packedLength,p.VertexFormat.pack(e._vertexFormat,t,a),t[a+=p.VertexFormat.packedLength]=e._granularity,t};var c=I.Ellipsoid.clone(I.Ellipsoid.UNIT_SPHERE),y=new p.VertexFormat,f={positions:void 0,minimumHeights:void 0,maximumHeights:void 0,ellipsoid:c,vertexFormat:y,granularity:void 0};return d.unpack=function(e,t,a){t=S.defaultValue(t,0);for(var i,n,r=e[t++],o=new Array(r),s=0;s<r;++s,t+=I.Cartesian3.packedLength)o[s]=I.Cartesian3.unpack(e,t);if(0<(r=e[t++]))for(i=new Array(r),s=0;s<r;++s)i[s]=e[t++];if(0<(r=e[t++]))for(n=new Array(r),s=0;s<r;++s)n[s]=e[t++];var m=I.Ellipsoid.unpack(e,t,c),l=(t+=I.Ellipsoid.packedLength,p.VertexFormat.unpack(e,t,y)),u=e[t+=p.VertexFormat.packedLength];return S.defined(a)?(a._positions=o,a._minimumHeights=i,a._maximumHeights=n,a._ellipsoid=I.Ellipsoid.clone(m,a._ellipsoid),a._vertexFormat=p.VertexFormat.clone(l,a._vertexFormat),a._granularity=u,a):(f.positions=o,f.minimumHeights=i,f.maximumHeights=n,f.granularity=u,new d(f))},d.fromConstantHeights=function(e){var t=(e=S.defaultValue(e,S.defaultValue.EMPTY_OBJECT)).positions,a=e.minimumHeight,i=e.maximumHeight,n=S.defined(a),r=S.defined(i);if(n||r)for(var o=t.length,s=n?new Array(o):void 0,m=r?new Array(o):void 0,l=0;l<o;++l)n&&(s[l]=a),r&&(m[l]=i);return new d({positions:t,maximumHeights:m,minimumHeights:s,ellipsoid:e.ellipsoid,vertexFormat:e.vertexFormat})},d.createGeometry=function(e){var t=e._positions,a=e._minimumHeights,i=e._maximumHeights,n=e._vertexFormat,r=e._granularity,o=e._ellipsoid,e=J.WallGeometryLibrary.computePositions(o,t,i,a,r,!0);if(S.defined(e)){for(var s=e.bottomPositions,m=e.topPositions,t=e.numCorners,l=m.length,i=2*l,u=n.position?new Float64Array(i):void 0,p=n.normal?new Float32Array(i):void 0,d=n.tangent?new Float32Array(i):void 0,c=n.bitangent?new Float32Array(i):void 0,y=n.st?new Float32Array(i/3*2):void 0,f=0,g=0,h=0,C=0,v=0,b=$,x=X,A=Q,_=!0,E=0,O=1/((l/=3)-t-1),w=0;w<l;++w){var F,L=3*w,k=I.Cartesian3.fromArray(m,L,Y),H=I.Cartesian3.fromArray(s,L,Z);n.position&&(u[f++]=H.x,u[f++]=H.y,u[f++]=H.z,u[f++]=k.x,u[f++]=k.y,u[f++]=k.z),n.st&&(y[v++]=E,y[v++]=0,y[v++]=E,y[v++]=1),(n.normal||n.tangent||n.bitangent)&&(H=I.Cartesian3.clone(I.Cartesian3.ZERO,K),F=I.Cartesian3.subtract(k,o.geodeticSurfaceNormal(k,Z),Z),w+1<l&&(H=I.Cartesian3.fromArray(m,3+L,K)),_&&(L=I.Cartesian3.subtract(H,k,j),F=I.Cartesian3.subtract(F,k,Y),b=I.Cartesian3.normalize(I.Cartesian3.cross(F,L,b),b),_=!1),I.Cartesian3.equalsEpsilon(k,H,q.CesiumMath.EPSILON10)?_=!0:(E+=O,n.tangent&&(x=I.Cartesian3.normalize(I.Cartesian3.subtract(H,k,x),x)),n.bitangent&&(A=I.Cartesian3.normalize(I.Cartesian3.cross(b,x,A),A))),n.normal&&(p[g++]=b.x,p[g++]=b.y,p[g++]=b.z,p[g++]=b.x,p[g++]=b.y,p[g++]=b.z),n.tangent&&(d[C++]=x.x,d[C++]=x.y,d[C++]=x.z,d[C++]=x.x,d[C++]=x.y,d[C++]=x.z),n.bitangent)&&(c[h++]=A.x,c[h++]=A.y,c[h++]=A.z,c[h++]=A.x,c[h++]=A.y,c[h++]=A.z)}var a=new B.GeometryAttributes,V=(n.position&&(a.position=new W.GeometryAttribute({componentDatatype:M.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u})),n.normal&&(a.normal=new W.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:p})),n.tangent&&(a.tangent=new W.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),n.bitangent&&(a.bitangent=new W.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:c})),n.st&&(a.st=new W.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:y})),i/3),G=U.IndexDatatype.createTypedArray(V,i-=6*(t+1)),D=0;for(w=0;w<V-2;w+=2){var P=w,T=w+2,z=I.Cartesian3.fromArray(u,3*P,Y),R=I.Cartesian3.fromArray(u,3*T,Z);I.Cartesian3.equalsEpsilon(z,R,q.CesiumMath.EPSILON10)||(z=w+3,G[D++]=w+1,G[D++]=P,G[D++]=z,G[D++]=z,G[D++]=P,G[D++]=T)}return new W.Geometry({attributes:a,indices:G,primitiveType:W.PrimitiveType.TRIANGLES,boundingSphere:new N.BoundingSphere.fromVertices(u)})}},function(e,t){return(e=S.defined(t)?d.unpack(e,t):e)._ellipsoid=I.Ellipsoid.clone(e._ellipsoid),d.createGeometry(e)}});
