define(["exports","./GeometryOffsetAttribute-8c0bd3ce","./Transforms-3bc98d07","./Matrix2-59fd2efe","./ComponentDatatype-b7b5db18","./when-ae2e0b60","./RuntimeError-24b14c10","./EllipseGeometryLibrary-50d596d7","./GeometryAttribute-dff85b2b","./GeometryAttributes-5ce4955a","./IndexDatatype-6902a37d"],function(e,p,f,c,m,h,t,y,b,A,_){var g=new c.Cartesian3,s=new c.Cartesian3;var x=new f.BoundingSphere,E=new f.BoundingSphere;function M(e){var t=(e=h.defaultValue(e,h.defaultValue.EMPTY_OBJECT)).center,i=h.defaultValue(e.ellipsoid,c.Ellipsoid.WGS84),r=e.semiMajorAxis,a=e.semiMinorAxis,n=h.defaultValue(e.granularity,m.CesiumMath.RADIANS_PER_DEGREE),o=h.defaultValue(e.height,0),s=h.defaultValue(e.extrudedHeight,o);this._center=c.Cartesian3.clone(t),this._semiMajorAxis=r,this._semiMinorAxis=a,this._ellipsoid=c.Ellipsoid.clone(i),this._rotation=h.defaultValue(e.rotation,0),this._height=Math.max(s,o),this._granularity=n,this._extrudedHeight=Math.min(s,o),this._numberOfVerticalLines=Math.max(h.defaultValue(e.numberOfVerticalLines,16),0),this._offsetAttribute=e.offsetAttribute,this._workerName="createEllipseOutlineGeometry"}M.packedLength=c.Cartesian3.packedLength+c.Ellipsoid.packedLength+8,M.pack=function(e,t,i){return i=h.defaultValue(i,0),c.Cartesian3.pack(e._center,t,i),i+=c.Cartesian3.packedLength,c.Ellipsoid.pack(e._ellipsoid,t,i),i+=c.Ellipsoid.packedLength,t[i++]=e._semiMajorAxis,t[i++]=e._semiMinorAxis,t[i++]=e._rotation,t[i++]=e._height,t[i++]=e._granularity,t[i++]=e._extrudedHeight,t[i++]=e._numberOfVerticalLines,t[i]=h.defaultValue(e._offsetAttribute,-1),t};var v=new c.Cartesian3,C=new c.Ellipsoid,G={center:v,ellipsoid:C,semiMajorAxis:void 0,semiMinorAxis:void 0,rotation:void 0,height:void 0,granularity:void 0,extrudedHeight:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};M.unpack=function(e,t,i){t=h.defaultValue(t,0);var r=c.Cartesian3.unpack(e,t,v),a=(t+=c.Cartesian3.packedLength,c.Ellipsoid.unpack(e,t,C)),n=(t+=c.Ellipsoid.packedLength,e[t++]),o=e[t++],s=e[t++],u=e[t++],l=e[t++],d=e[t++],p=e[t++],e=e[t];return h.defined(i)?(i._center=c.Cartesian3.clone(r,i._center),i._ellipsoid=c.Ellipsoid.clone(a,i._ellipsoid),i._semiMajorAxis=n,i._semiMinorAxis=o,i._rotation=s,i._height=u,i._granularity=l,i._extrudedHeight=d,i._numberOfVerticalLines=p,i._offsetAttribute=-1===e?void 0:e,i):(G.height=u,G.extrudedHeight=d,G.granularity=l,G.rotation=s,G.semiMajorAxis=n,G.semiMinorAxis=o,G.numberOfVerticalLines=p,G.offsetAttribute=-1===e?void 0:e,new M(G))},M.createGeometry=function(e){var t,i,r,a;if(!(e._semiMajorAxis<=0||e._semiMinorAxis<=0))return r=e._height,i=e._extrudedHeight,t=!m.CesiumMath.equalsEpsilon(r,i,0,m.CesiumMath.EPSILON2),e._center=e._ellipsoid.scaleToGeodeticSurface(e._center,e._center),r={center:e._center,semiMajorAxis:e._semiMajorAxis,semiMinorAxis:e._semiMinorAxis,ellipsoid:e._ellipsoid,rotation:e._rotation,height:r,granularity:e._granularity,numberOfVerticalLines:e._numberOfVerticalLines},t?(r.extrudedHeight=i,r.offsetAttribute=e._offsetAttribute,a=function(e){var t=e.center,i=e.ellipsoid,r=e.semiMajorAxis,a=c.Cartesian3.multiplyByScalar(i.geodeticSurfaceNormal(t,g),e.height,g),i=(x.center=c.Cartesian3.add(t,a,x.center),x.radius=r,a=c.Cartesian3.multiplyByScalar(i.geodeticSurfaceNormal(t,a),e.extrudedHeight,a),E.center=c.Cartesian3.add(t,a,E.center),E.radius=r,y.EllipseGeometryLibrary.computeEllipsePositions(e,!1,!0).outerPositions),i=(t=new A.GeometryAttributes({position:new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:y.EllipseGeometryLibrary.raisePositionsToHeight(i,e,!0)})})).position.values,a=f.BoundingSphere.union(x,E),n=i.length/3,i=(h.defined(e.offsetAttribute)&&(r=new Uint8Array(n),r=e.offsetAttribute===p.GeometryOffsetAttribute.TOP?p.arrayFill(r,1,0,n/2):(i=e.offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(r,i)),t.applyOffset=new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:r})),h.defaultValue(e.numberOfVerticalLines,16)),i=m.CesiumMath.clamp(i,0,n/2),o=_.IndexDatatype.createTypedArray(n,2*n+2*i),s=(n/=2,0);for(d=0;d<n;++d)o[s++]=d,o[s++]=(d+1)%n,o[s++]=d+n,o[s++]=(d+1)%n+n;if(0<i)for(var r=Math.min(i,n),u=Math.round(n/r),l=Math.min(u*i,n),d=0;d<l;d+=u)o[s++]=d,o[s++]=d+n;return{boundingSphere:a,attributes:t,indices:o}}(r)):(a=function(e){for(var t=e.center,t=(s=c.Cartesian3.multiplyByScalar(e.ellipsoid.geodeticSurfaceNormal(t,s),e.height,s),s=c.Cartesian3.add(t,s,s),new f.BoundingSphere(s,e.semiMajorAxis)),i=y.EllipseGeometryLibrary.computeEllipsePositions(e,!1,!0).outerPositions,e=new A.GeometryAttributes({position:new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:y.EllipseGeometryLibrary.raisePositionsToHeight(i,e,!1)})}),r=i.length/3,a=_.IndexDatatype.createTypedArray(r,2*r),n=0,o=0;o<r;++o)a[n++]=o,a[n++]=(o+1)%r;return{boundingSphere:t,attributes:e,indices:a}}(r),h.defined(e._offsetAttribute)&&(t=a.attributes.position.values.length,i=new Uint8Array(t/3),r=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(i,r),a.attributes.applyOffset=new b.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:i}))),new b.Geometry({attributes:a.attributes,indices:a.indices,primitiveType:b.PrimitiveType.LINES,boundingSphere:a.boundingSphere,offsetAttribute:e._offsetAttribute})},e.EllipseOutlineGeometry=M});
