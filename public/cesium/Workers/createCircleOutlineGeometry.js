define(["./Cartesian2-c1eb9da0","./Check-f996273c","./when-ae2e0b60","./EllipseOutlineGeometry-ec5d7684","./Math-5bbcea10","./GeometryOffsetAttribute-b02d5bb9","./Transforms-5a0f5c0d","./combine-276652d0","./RuntimeError-ac2797b4","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./EllipseGeometryLibrary-fc808930","./GeometryAttribute-f0467ee1","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea"],function(r,e,n,l,i,t,s,o,a,u,c,d,m,p,y){"use strict";function G(e){var i=(e=n.defaultValue(e,n.defaultValue.EMPTY_OBJECT)).radius,i={center:e.center,semiMajorAxis:i,semiMinorAxis:i,ellipsoid:e.ellipsoid,height:e.height,extrudedHeight:e.extrudedHeight,granularity:e.granularity,numberOfVerticalLines:e.numberOfVerticalLines};this._ellipseGeometry=new l.EllipseOutlineGeometry(i),this._workerName="createCircleOutlineGeometry"}G.packedLength=l.EllipseOutlineGeometry.packedLength,G.pack=function(e,i,t){return l.EllipseOutlineGeometry.pack(e._ellipseGeometry,i,t)};var _=new l.EllipseOutlineGeometry({center:new r.Cartesian3,semiMajorAxis:1,semiMinorAxis:1}),f={center:new r.Cartesian3,radius:void 0,ellipsoid:r.Ellipsoid.clone(r.Ellipsoid.UNIT_SPHERE),height:void 0,extrudedHeight:void 0,granularity:void 0,numberOfVerticalLines:void 0,semiMajorAxis:void 0,semiMinorAxis:void 0};return G.unpack=function(e,i,t){e=l.EllipseOutlineGeometry.unpack(e,i,_);return f.center=r.Cartesian3.clone(e._center,f.center),f.ellipsoid=r.Ellipsoid.clone(e._ellipsoid,f.ellipsoid),f.height=e._height,f.extrudedHeight=e._extrudedHeight,f.granularity=e._granularity,f.numberOfVerticalLines=e._numberOfVerticalLines,n.defined(t)?(f.semiMajorAxis=e._semiMajorAxis,f.semiMinorAxis=e._semiMinorAxis,t._ellipseGeometry=new l.EllipseOutlineGeometry(f),t):(f.radius=e._semiMajorAxis,new G(f))},G.createGeometry=function(e){return l.EllipseOutlineGeometry.createGeometry(e._ellipseGeometry)},function(e,i){return(e=n.defined(i)?G.unpack(e,i):e)._ellipseGeometry._center=r.Cartesian3.clone(e._ellipseGeometry._center),e._ellipseGeometry._ellipsoid=r.Ellipsoid.clone(e._ellipseGeometry._ellipsoid),G.createGeometry(e)}});
