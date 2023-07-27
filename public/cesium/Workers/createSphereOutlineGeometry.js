define(["./when-ae2e0b60","./Cartesian2-38b35910","./Check-f996273c","./EllipsoidOutlineGeometry-5d3a044a","./Math-5bbcea10","./GeometryOffsetAttribute-b02d5bb9","./Transforms-cdfd3fe7","./combine-276652d0","./RuntimeError-ac2797b4","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./GeometryAttribute-0e967e1c","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea"],function(n,r,e,o,i,t,s,a,d,l,u,c,m,p){"use strict";function y(e){var i=n.defaultValue(e.radius,1),i={radii:new r.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(i),this._workerName="createSphereOutlineGeometry"}y.packedLength=o.EllipsoidOutlineGeometry.packedLength,y.pack=function(e,i,t){return o.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var G=new o.EllipsoidOutlineGeometry,b={radius:void 0,radii:new r.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return y.unpack=function(e,i,t){e=o.EllipsoidOutlineGeometry.unpack(e,i,G);return b.stackPartitions=e._stackPartitions,b.slicePartitions=e._slicePartitions,b.subdivisions=e._subdivisions,n.defined(t)?(r.Cartesian3.clone(e._radii,b.radii),t._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(b),t):(b.radius=e._radii.x,new y(b))},y.createGeometry=function(e){return o.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=y.unpack(e,i)),y.createGeometry(e)}});
