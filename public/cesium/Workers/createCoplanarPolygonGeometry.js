define(["./arrayRemoveDuplicates-bdf50aa0","./BoundingRectangle-d6d7a8e5","./Transforms-b0beda9b","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./CoplanarPolygonGeometryLibrary-8f8d8ac1","./when-ae2e0b60","./GeometryAttribute-9509a6ac","./GeometryAttributes-5ce4955a","./GeometryInstance-1af88174","./GeometryPipeline-6f352065","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonGeometryLibrary-8f1626d5","./PolygonPipeline-74b9dcb6","./VertexFormat-90d15264","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./OrientedBoundingBox-83b01426","./EllipsoidTangentPlane-fd3d43cb","./AxisAlignedBoundingBox-f0ce5db6","./IntersectionTests-12a15587","./Plane-9e807de8","./AttributeCompression-b9605c73","./EncodedCartesian3-6f721b97","./ArcType-1275a14e","./EllipsoidRhumbLine-2fd480f5"],function(b,e,G,L,t,E,h,l,T,D,C,f,_,k,x,V,s,n,a,o,r,i,u,d,g,Q,j,U,Y){"use strict";var R=new L.Cartesian3,P=new e.BoundingRectangle,I=new L.Cartesian2,M=new L.Cartesian2,v=new L.Cartesian3,A=new L.Cartesian3,w=new L.Cartesian3,F=new L.Cartesian3,B=new L.Cartesian3,H=new L.Cartesian3,O=new G.Quaternion,z=new G.Matrix3,S=new G.Matrix3,N=new L.Cartesian3;function p(e){var t=(e=l.defaultValue(e,l.defaultValue.EMPTY_OBJECT)).polygonHierarchy,n=l.defaultValue(e.vertexFormat,s.VertexFormat.DEFAULT);this._vertexFormat=s.VertexFormat.clone(n),this._polygonHierarchy=t,this._stRotation=l.defaultValue(e.stRotation,0),this._ellipsoid=L.Ellipsoid.clone(l.defaultValue(e.ellipsoid,L.Ellipsoid.WGS84)),this._workerName="createCoplanarPolygonGeometry",this.packedLength=x.PolygonGeometryLibrary.computeHierarchyPackedLength(t)+s.VertexFormat.packedLength+L.Ellipsoid.packedLength+2}p.fromPositions=function(e){return new p({polygonHierarchy:{positions:(e=l.defaultValue(e,l.defaultValue.EMPTY_OBJECT)).positions},vertexFormat:e.vertexFormat,stRotation:e.stRotation,ellipsoid:e.ellipsoid})},p.pack=function(e,t,n){return n=l.defaultValue(n,0),n=x.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,n),L.Ellipsoid.pack(e._ellipsoid,t,n),n+=L.Ellipsoid.packedLength,s.VertexFormat.pack(e._vertexFormat,t,n),n+=s.VertexFormat.packedLength,t[n++]=e._stRotation,t[n]=e.packedLength,t};var y=L.Ellipsoid.clone(L.Ellipsoid.UNIT_SPHERE),c=new s.VertexFormat,m={polygonHierarchy:{}};return p.unpack=function(e,t,n){t=l.defaultValue(t,0);var a=x.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t),o=(t=a.startingIndex,delete a.startingIndex,L.Ellipsoid.unpack(e,t,y)),r=(t+=L.Ellipsoid.packedLength,s.VertexFormat.unpack(e,t,c)),i=(t+=s.VertexFormat.packedLength,e[t++]),e=e[t];return(n=l.defined(n)?n:new p(m))._polygonHierarchy=a,n._ellipsoid=L.Ellipsoid.clone(o,n._ellipsoid),n._vertexFormat=s.VertexFormat.clone(r,n._vertexFormat),n._stRotation=i,n.packedLength=e,n},p.createGeometry=function(e){var t=e._vertexFormat,n=e._polygonHierarchy,a=e._stRotation,o=n.positions;if(!((o=b.arrayRemoveDuplicates(o,L.Cartesian3.equalsEpsilon,!0)).length<3)){var r=v,i=A,l=w,s=B,p=H;if(h.CoplanarPolygonGeometryLibrary.computeProjectTo2DArguments(o,F,s,p)){var r=L.Cartesian3.cross(s,p,r),e=(r=L.Cartesian3.normalize(r,r),L.Cartesian3.equalsEpsilon(F,L.Cartesian3.ZERO,k.CesiumMath.EPSILON6)||(e=e._ellipsoid.geodeticSurfaceNormal(F,N),L.Cartesian3.dot(r,e)<0&&(r=L.Cartesian3.negate(r,r),s=L.Cartesian3.negate(s,s))),h.CoplanarPolygonGeometryLibrary.createProjectPointsTo2DFunction(F,s,p)),y=h.CoplanarPolygonGeometryLibrary.createProjectPointTo2DFunction(F,s,p),s=(t.tangent&&(i=L.Cartesian3.clone(s,i)),t.bitangent&&(l=L.Cartesian3.clone(p,l)),x.PolygonGeometryLibrary.polygonsFromHierarchy(n,e,!1)),p=s.hierarchy,c=s.polygons;if(0!==p.length){for(var o=p[0].outerRing,n=G.BoundingSphere.fromPoints(o),m=x.PolygonGeometryLibrary.computeBoundingRectangle(r,y,o,a,P),u=[],d=0;d<c.length;d++){var g=new C.GeometryInstance({geometry:function(e,t,n,a,o,r,i,l){for(var s=e.positions,p=((e=V.PolygonPipeline.triangulate(e.positions2D,e.holes)).length<3&&(e=[0,1,2]),_.IndexDatatype.createTypedArray(s.length,e.length)),y=(p.set(e),z),c=(0!==a?(e=G.Quaternion.fromAxisAngle(r,a,O),y=G.Matrix3.fromQuaternion(e,y),(t.tangent||t.bitangent)&&(e=G.Quaternion.fromAxisAngle(r,-a,O),a=G.Matrix3.fromQuaternion(e,S),i=L.Cartesian3.normalize(G.Matrix3.multiplyByVector(a,i,i),i),t.bitangent)&&(l=L.Cartesian3.normalize(L.Cartesian3.cross(r,i,l),l))):y=G.Matrix3.clone(G.Matrix3.IDENTITY,y),M),m=(t.st&&(c.x=n.x,c.y=n.y),s.length),e=3*m,u=new Float64Array(e),d=t.normal?new Float32Array(e):void 0,g=t.tangent?new Float32Array(e):void 0,b=t.bitangent?new Float32Array(e):void 0,h=t.st?new Float32Array(2*m):void 0,C=0,f=0,x=0,P=0,v=0,A=0;A<m;A++){var w,F=s[A];u[C++]=F.x,u[C++]=F.y,u[C++]=F.z,t.st&&(F=o(G.Matrix3.multiplyByVector(y,F,R),I),L.Cartesian2.subtract(F,c,F),w=k.CesiumMath.clamp(F.x/n.width,0,1),F=k.CesiumMath.clamp(F.y/n.height,0,1),h[v++]=w,h[v++]=F),t.normal&&(d[f++]=r.x,d[f++]=r.y,d[f++]=r.z),t.tangent&&(g[P++]=i.x,g[P++]=i.y,g[P++]=i.z),t.bitangent&&(b[x++]=l.x,b[x++]=l.y,b[x++]=l.z)}return a=new D.GeometryAttributes,t.position&&(a.position=new T.GeometryAttribute({componentDatatype:E.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u})),t.normal&&(a.normal=new T.GeometryAttribute({componentDatatype:E.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:d})),t.tangent&&(a.tangent=new T.GeometryAttribute({componentDatatype:E.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:g})),t.bitangent&&(a.bitangent=new T.GeometryAttribute({componentDatatype:E.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:b})),t.st&&(a.st=new T.GeometryAttribute({componentDatatype:E.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:h})),new T.Geometry({attributes:a,indices:p,primitiveType:T.PrimitiveType.TRIANGLES})}(c[d],t,m,a,y,r,i,l)});u.push(g)}e=f.GeometryPipeline.combineInstances(u)[0],s=(e.attributes.position.values=new Float64Array(e.attributes.position.values),e.indices=_.IndexDatatype.createTypedArray(e.attributes.position.values.length/3,e.indices),e.attributes);return t.position||delete s.position,new T.Geometry({attributes:s,indices:e.indices,primitiveType:e.primitiveType,boundingSphere:n})}}}},function(e,t){return l.defined(t)&&(e=p.unpack(e,t)),p.createGeometry(e)}});
