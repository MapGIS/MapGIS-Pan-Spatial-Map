define(["exports","./GeometryOffsetAttribute-b02d5bb9","./Transforms-5aeb1d5e","./Cartesian2-078e6458","./ComponentDatatype-e44126e4","./when-ae2e0b60","./Check-f996273c","./EllipseGeometryLibrary-46efe941","./GeometryAttribute-ccf4e0b6","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10"],function(e,p,c,f,m,h,t,y,b,A,_,g){"use strict";var x=new f.Cartesian3,s=new f.Cartesian3;var E=new c.BoundingSphere,M=new c.BoundingSphere;function C(e){var t=(e=h.defaultValue(e,h.defaultValue.EMPTY_OBJECT)).center,i=h.defaultValue(e.ellipsoid,f.Ellipsoid.WGS84),r=e.semiMajorAxis,a=e.semiMinorAxis,n=h.defaultValue(e.granularity,g.CesiumMath.RADIANS_PER_DEGREE),o=h.defaultValue(e.height,0),s=h.defaultValue(e.extrudedHeight,o);this._center=f.Cartesian3.clone(t),this._semiMajorAxis=r,this._semiMinorAxis=a,this._ellipsoid=f.Ellipsoid.clone(i),this._rotation=h.defaultValue(e.rotation,0),this._height=Math.max(s,o),this._granularity=n,this._extrudedHeight=Math.min(s,o),this._numberOfVerticalLines=Math.max(h.defaultValue(e.numberOfVerticalLines,16),0),this._offsetAttribute=e.offsetAttribute,this._workerName="createEllipseOutlineGeometry"}C.packedLength=f.Cartesian3.packedLength+f.Ellipsoid.packedLength+8,C.pack=function(e,t,i){return i=h.defaultValue(i,0),f.Cartesian3.pack(e._center,t,i),i+=f.Cartesian3.packedLength,f.Ellipsoid.pack(e._ellipsoid,t,i),i+=f.Ellipsoid.packedLength,t[i++]=e._semiMajorAxis,t[i++]=e._semiMinorAxis,t[i++]=e._rotation,t[i++]=e._height,t[i++]=e._granularity,t[i++]=e._extrudedHeight,t[i++]=e._numberOfVerticalLines,t[i]=h.defaultValue(e._offsetAttribute,-1),t};var v=new f.Cartesian3,G=new f.Ellipsoid,L={center:v,ellipsoid:G,semiMajorAxis:void 0,semiMinorAxis:void 0,rotation:void 0,height:void 0,granularity:void 0,extrudedHeight:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};C.unpack=function(e,t,i){t=h.defaultValue(t,0);var r=f.Cartesian3.unpack(e,t,v),a=(t+=f.Cartesian3.packedLength,f.Ellipsoid.unpack(e,t,G)),n=(t+=f.Ellipsoid.packedLength,e[t++]),o=e[t++],s=e[t++],u=e[t++],l=e[t++],d=e[t++],p=e[t++],e=e[t];return h.defined(i)?(i._center=f.Cartesian3.clone(r,i._center),i._ellipsoid=f.Ellipsoid.clone(a,i._ellipsoid),i._semiMajorAxis=n,i._semiMinorAxis=o,i._rotation=s,i._height=u,i._granularity=l,i._extrudedHeight=d,i._numberOfVerticalLines=p,i._offsetAttribute=-1===e?void 0:e,i):(L.height=u,L.extrudedHeight=d,L.granularity=l,L.rotation=s,L.semiMajorAxis=n,L.semiMinorAxis=o,L.numberOfVerticalLines=p,L.offsetAttribute=-1===e?void 0:e,new C(L))},C.createGeometry=function(e){var t,i,r,a;if(!(e._semiMajorAxis<=0||e._semiMinorAxis<=0))return r=e._height,i=e._extrudedHeight,t=!g.CesiumMath.equalsEpsilon(r,i,0,g.CesiumMath.EPSILON2),e._center=e._ellipsoid.scaleToGeodeticSurface(e._center,e._center),r={center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:e._ellipsoid,rotation:e._rotation,height:r,granularity:e._granularity,numberOfVerticalLines:e._numberOfVerticalLines},t?(r.extrudedHeight=i,r.offsetAttribute=e._offsetAttribute,a=function(e){var t=e.center,i=e.ellipsoid,r=e.semiMajorAxis,a=f.Cartesian3.multiplyByScalar(i.geodeticSurfaceNormal(t,x),e.height,x),i=(E.center=f.Cartesian3.add(t,a,E.center),E.radius=r,a=f.Cartesian3.multiplyByScalar(i.geodeticSurfaceNormal(t,a),e.extrudedHeight,a),M.center=f.Cartesian3.add(t,a,M.center),M.radius=r,y.EllipseGeometryLibrary.computeEllipsePositions(e,!1,!0).outerPositions),i=(t=new A.GeometryAttributes({position:new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:y.EllipseGeometryLibrary.raisePositionsToHeight(i,e,!0)})})).position.values,a=c.BoundingSphere.union(E,M),n=i.length/3,i=(h.defined(e.offsetAttribute)&&(r=new Uint8Array(n),r=e.offsetAttribute===p.GeometryOffsetAttribute.TOP?p.arrayFill(r,1,0,n/2):(i=e.offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(r,i)),t.applyOffset=new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:r})),h.defaultValue(e.numberOfVerticalLines,16)),i=g.CesiumMath.clamp(i,0,n/2),o=_.IndexDatatype.createTypedArray(n,2*n+2*i),s=(n/=2,0);for(d=0;d<n;++d)o[s++]=d,o[s++]=(d+1)%n,o[s++]=d+n,o[s++]=(d+1)%n+n;if(0<i)for(var r=Math.min(i,n),u=Math.round(n/r),l=Math.min(u*i,n),d=0;d<l;d+=u)o[s++]=d,o[s++]=d+n;return{boundingSphere:a,attributes:t,indices:o}}(r)):(a=function(e){for(var t=e.center,t=(s=f.Cartesian3.multiplyByScalar(e.ellipsoid.geodeticSurfaceNormal(t,s),e.height,s),s=f.Cartesian3.add(t,s,s),new c.BoundingSphere(s,e.semiMajorAxis)),i=y.EllipseGeometryLibrary.computeEllipsePositions(e,!1,!0).outerPositions,e=new A.GeometryAttributes({position:new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:y.EllipseGeometryLibrary.raisePositionsToHeight(i,e,!1)})}),r=i.length/3,a=_.IndexDatatype.createTypedArray(r,2*r),n=0,o=0;o<r;++o)a[n++]=o,a[n++]=(o+1)%r;return{boundingSphere:t,attributes:e,indices:a}}(r),h.defined(e._offsetAttribute)&&(t=a.attributes.position.values.length,i=new Uint8Array(t/3),r=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(i,r),a.attributes.applyOffset=new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:i}))),new b.Geometry({attributes:a.attributes,indices:a.indices,primitiveType:b.PrimitiveType.LINES,boundingSphere:a.boundingSphere,offsetAttribute:e._offsetAttribute})},e.EllipseOutlineGeometry=C});
