define(["./when-ae2e0b60","./Cartesian2-c1eb9da0","./Check-f996273c","./EllipsoidOutlineGeometry-66e52f3c","./Math-5bbcea10","./GeometryOffsetAttribute-b02d5bb9","./Transforms-b0beda9b","./combine-276652d0","./RuntimeError-ac2797b4","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./GeometryAttribute-9509a6ac","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea"],function(n,r,e,a,i,t,o,s,d,l,c,u,m,p){"use strict";function b(e){var i=n.defaultValue(e.radius,1),i={radii:new r.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new a.EllipsoidOutlineGeometry(i),this._workerName="createSphereOutlineGeometry"}b.packedLength=a.EllipsoidOutlineGeometry.packedLength,b.pack=function(e,i,t){return a.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new a.EllipsoidOutlineGeometry,G={radius:void 0,radii:new r.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return b.unpack=function(e,i,t){e=a.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=e._stackPartitions,G.slicePartitions=e._slicePartitions,G.subdivisions=e._subdivisions,n.defined(t)?(r.Cartesian3.clone(e._radii,G.radii),t._ellipsoidGeometry=new a.EllipsoidOutlineGeometry(G),t):(G.radius=e._radii.x,new b(G))},b.createGeometry=function(e){return a.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=b.unpack(e,i)),b.createGeometry(e)}});
