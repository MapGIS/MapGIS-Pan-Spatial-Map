define(["./when-ae2e0b60","./Cartesian2-38b35910","./arrayRemoveDuplicates-bdf50aa0","./BoundingRectangle-74602a7c","./Transforms-07a9fab5","./ComponentDatatype-e44126e4","./PolylineVolumeGeometryLibrary-c00aade2","./Check-f996273c","./GeometryAttribute-586bf52c","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonPipeline-06aa4301","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-19622103","./AxisAlignedBoundingBox-d272def4","./IntersectionTests-f49c7cd3","./Plane-45ad3143","./PolylinePipeline-f47a23a0","./EllipsoidGeodesic-0207b202","./EllipsoidRhumbLine-af7b5ebe"],function(d,y,_,h,b,v,g,e,f,k,m,a,E,i,n,t,o,r,l,s,p,C,L){"use strict";function c(e){var i=(e=d.defaultValue(e,d.defaultValue.EMPTY_OBJECT)).polylinePositions,n=e.shapePositions,e=(this._positions=i,this._shape=n,this._ellipsoid=y.Ellipsoid.clone(d.defaultValue(e.ellipsoid,y.Ellipsoid.WGS84)),this._cornerType=d.defaultValue(e.cornerType,g.CornerType.ROUNDED),this._granularity=d.defaultValue(e.granularity,a.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeOutlineGeometry",1+i.length*y.Cartesian3.packedLength);e+=1+n.length*y.Cartesian2.packedLength,this.packedLength=e+y.Ellipsoid.packedLength+2}c.pack=function(e,i,n){n=d.defaultValue(n,0);var a,t=e._positions,o=t.length;for(i[n++]=o,a=0;a<o;++a,n+=y.Cartesian3.packedLength)y.Cartesian3.pack(t[a],i,n);var r=e._shape,o=r.length;for(i[n++]=o,a=0;a<o;++a,n+=y.Cartesian2.packedLength)y.Cartesian2.pack(r[a],i,n);return y.Ellipsoid.pack(e._ellipsoid,i,n),n+=y.Ellipsoid.packedLength,i[n++]=e._cornerType,i[n]=e._granularity,i};var u=y.Ellipsoid.clone(y.Ellipsoid.UNIT_SPHERE),P={polylinePositions:void 0,shapePositions:void 0,ellipsoid:u,height:void 0,cornerType:void 0,granularity:void 0},T=(c.unpack=function(e,i,n){i=d.defaultValue(i,0);for(var a=e[i++],t=new Array(a),o=0;o<a;++o,i+=y.Cartesian3.packedLength)t[o]=y.Cartesian3.unpack(e,i);var a=e[i++],r=new Array(a);for(o=0;o<a;++o,i+=y.Cartesian2.packedLength)r[o]=y.Cartesian2.unpack(e,i);var l=y.Ellipsoid.unpack(e,i,u),s=(i+=y.Ellipsoid.packedLength,e[i++]),p=e[i];return d.defined(n)?(n._positions=t,n._shape=r,n._ellipsoid=y.Ellipsoid.clone(l,n._ellipsoid),n._cornerType=s,n._granularity=p,n):(P.polylinePositions=t,P.shapePositions=r,P.cornerType=s,P.granularity=p,new c(P))},new h.BoundingRectangle);return c.createGeometry=function(e){var i=e._positions,i=_.arrayRemoveDuplicates(i,y.Cartesian3.equalsEpsilon),n=e._shape,n=g.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(n);if(!(i.length<2||n.length<3)){E.PolygonPipeline.computeWindingOrder2D(n)===E.WindingOrder.CLOCKWISE&&n.reverse();var a=h.BoundingRectangle.fromPoints(n,T),i=g.PolylineVolumeGeometryLibrary.computePositions(i,n,a,e,!1),a=n,e=new k.GeometryAttributes,t=(e.position=new f.GeometryAttribute({componentDatatype:v.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:i}),a.length),a=e.position.values.length/3,d=i.length/3/t,o=m.IndexDatatype.createTypedArray(a,2*t*(1+d)),r=0,l=0,s=l*t;for(p=0;p<t-1;p++)o[r++]=p+s,o[r++]=p+s+1;for(o[r++]=t-1+s,o[r++]=s,s=(l=d-1)*t,p=0;p<t-1;p++)o[r++]=p+s,o[r++]=p+s+1;for(o[r++]=t-1+s,o[r++]=s,l=0;l<d-1;l++)for(var c=t*l,u=c+t,p=0;p<t;p++)o[r++]=p+c,o[r++]=p+u;return new f.Geometry({attributes:e,indices:m.IndexDatatype.createTypedArray(a,o),boundingSphere:b.BoundingSphere.fromVertices(i),primitiveType:f.PrimitiveType.LINES})}},function(e,i){return(e=d.defined(i)?c.unpack(e,i):e)._ellipsoid=y.Ellipsoid.clone(e._ellipsoid),c.createGeometry(e)}});
