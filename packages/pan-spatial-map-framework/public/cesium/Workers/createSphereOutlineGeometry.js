define(["./when-0ac5fc51","./Cartesian2-21667d02","./Check-91887fdf","./EllipsoidOutlineGeometry-397088fc","./Math-e1584698","./GeometryOffsetAttribute-130c5ab0","./Transforms-9663aff8","./combine-323053a8","./RuntimeError-71e5ac17","./ComponentDatatype-a350450f","./WebGLConstants-dd197df0","./GeometryAttribute-95829fb2","./GeometryAttributes-49ce162f","./IndexDatatype-14fcdf85"],function(n,r,e,o,i,t,s,a,d,l,c,u,f,m){"use strict";function p(e){var i=n.defaultValue(e.radius,1),e={radii:new r.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(e),this._workerName="createSphereOutlineGeometry"}p.packedLength=o.EllipsoidOutlineGeometry.packedLength,p.pack=function(e,i,t){return o.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new o.EllipsoidOutlineGeometry,G={radius:void 0,radii:new r.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return p.unpack=function(e,i,t){i=o.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=i._stackPartitions,G.slicePartitions=i._slicePartitions,G.subdivisions=i._subdivisions,n.defined(t)?(r.Cartesian3.clone(i._radii,G.radii),t._ellipsoidGeometry=new o.EllipsoidOutlineGeometry(G),t):(G.radius=i._radii.x,new p(G))},p.createGeometry=function(e){return o.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return n.defined(i)&&(e=p.unpack(e,i)),p.createGeometry(e)}});
