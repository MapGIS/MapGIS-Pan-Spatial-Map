define(["./arrayRemoveDuplicates-bdf50aa0","./Transforms-b0beda9b","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./CoplanarPolygonGeometryLibrary-8f8d8ac1","./when-ae2e0b60","./GeometryAttribute-9509a6ac","./GeometryAttributes-5ce4955a","./GeometryInstance-1af88174","./GeometryPipeline-6f352065","./IndexDatatype-516320ea","./PolygonGeometryLibrary-8f1626d5","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./OrientedBoundingBox-83b01426","./EllipsoidTangentPlane-fd3d43cb","./AxisAlignedBoundingBox-f0ce5db6","./IntersectionTests-12a15587","./Plane-9e807de8","./AttributeCompression-b9605c73","./EncodedCartesian3-6f721b97","./ArcType-1275a14e","./EllipsoidRhumbLine-2fd480f5","./PolygonPipeline-74b9dcb6"],function(i,y,l,e,c,p,o,s,u,d,m,b,g,t,n,r,a,f,h,P,G,v,L,C,T,E,k){"use strict";function A(e){e=(e=o.defaultValue(e,o.defaultValue.EMPTY_OBJECT)).polygonHierarchy;this._polygonHierarchy=e,this._workerName="createCoplanarPolygonOutlineGeometry",this.packedLength=g.PolygonGeometryLibrary.computeHierarchyPackedLength(e)+1}A.fromPositions=function(e){return new A({polygonHierarchy:{positions:(e=o.defaultValue(e,o.defaultValue.EMPTY_OBJECT)).positions}})},A.pack=function(e,t,n){return n=o.defaultValue(n,0),t[n=g.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,n)]=e.packedLength,t};var H={polygonHierarchy:{}};return A.unpack=function(e,t,n){t=o.defaultValue(t,0);var r=g.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t),e=(t=r.startingIndex,delete r.startingIndex,e[t]);return(n=o.defined(n)?n:new A(H))._polygonHierarchy=r,n.packedLength=e,n},A.createGeometry=function(e){var e=e._polygonHierarchy,t=e.positions,t=i.arrayRemoveDuplicates(t,l.Cartesian3.equalsEpsilon,!0);if(!(t.length<3)&&p.CoplanarPolygonGeometryLibrary.validOutline(t)){var n=g.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(e,!1);if(0!==n.length){for(var r=[],o=0;o<n.length;o++){var a=new d.GeometryInstance({geometry:function(e){for(var t=e.length,n=new Float64Array(3*t),r=b.IndexDatatype.createTypedArray(t,2*t),o=0,a=0,i=0;i<t;i++){var y=e[i];n[o++]=y.x,n[o++]=y.y,n[o++]=y.z,r[a++]=i,r[a++]=(i+1)%t}var l=new u.GeometryAttributes({position:new s.GeometryAttribute({componentDatatype:c.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})});return new s.Geometry({attributes:l,indices:r,primitiveType:s.PrimitiveType.LINES})}(n[o])});r.push(a)}t=m.GeometryPipeline.combineInstances(r)[0],e=y.BoundingSphere.fromPoints(e.positions);return new s.Geometry({attributes:t.attributes,indices:t.indices,primitiveType:t.primitiveType,boundingSphere:e})}}},function(e,t){return(e=o.defined(t)?A.unpack(e,t):e)._ellipsoid=l.Ellipsoid.clone(e._ellipsoid),A.createGeometry(e)}});
