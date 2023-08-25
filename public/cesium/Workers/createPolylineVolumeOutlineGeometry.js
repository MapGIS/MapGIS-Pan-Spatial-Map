define(["./when-ae2e0b60","./Cartesian2-c1eb9da0","./arrayRemoveDuplicates-bdf50aa0","./BoundingRectangle-97e6b58d","./Transforms-75c1d9a1","./ComponentDatatype-e44126e4","./PolylineVolumeGeometryLibrary-18fa5257","./Check-f996273c","./GeometryAttribute-842f7f8f","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonPipeline-1d8700a4","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-b07a98b6","./AxisAlignedBoundingBox-450093aa","./IntersectionTests-ac09ddc2","./Plane-f4840d15","./PolylinePipeline-90d28432","./EllipsoidGeodesic-a0581819","./EllipsoidRhumbLine-2fd480f5"],function(d,y,h,g,f,m,E,e,P,_,v,a,b,i,n,t,o,r,l,s,p,c,u){"use strict";function k(e){var i=(e=d.defaultValue(e,d.defaultValue.EMPTY_OBJECT)).polylinePositions,n=e.shapePositions,e=(this._positions=i,this._shape=n,this._ellipsoid=y.Ellipsoid.clone(d.defaultValue(e.ellipsoid,y.Ellipsoid.WGS84)),this._cornerType=d.defaultValue(e.cornerType,E.CornerType.ROUNDED),this._granularity=d.defaultValue(e.granularity,a.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeOutlineGeometry",1+i.length*y.Cartesian3.packedLength);e+=1+n.length*y.Cartesian2.packedLength,this.packedLength=e+y.Ellipsoid.packedLength+2}k.pack=function(e,i,n){n=d.defaultValue(n,0);var a,t=e._positions,o=t.length;for(i[n++]=o,a=0;a<o;++a,n+=y.Cartesian3.packedLength)y.Cartesian3.pack(t[a],i,n);var r=e._shape,o=r.length;for(i[n++]=o,a=0;a<o;++a,n+=y.Cartesian2.packedLength)y.Cartesian2.pack(r[a],i,n);return y.Ellipsoid.pack(e._ellipsoid,i,n),n+=y.Ellipsoid.packedLength,i[n++]=e._cornerType,i[n]=e._granularity,i};var C=y.Ellipsoid.clone(y.Ellipsoid.UNIT_SPHERE),L={polylinePositions:void 0,shapePositions:void 0,ellipsoid:C,height:void 0,cornerType:void 0,granularity:void 0},T=(k.unpack=function(e,i,n){i=d.defaultValue(i,0);for(var a=e[i++],t=new Array(a),o=0;o<a;++o,i+=y.Cartesian3.packedLength)t[o]=y.Cartesian3.unpack(e,i);var a=e[i++],r=new Array(a);for(o=0;o<a;++o,i+=y.Cartesian2.packedLength)r[o]=y.Cartesian2.unpack(e,i);var l=y.Ellipsoid.unpack(e,i,C),s=(i+=y.Ellipsoid.packedLength,e[i++]),p=e[i];return d.defined(n)?(n._positions=t,n._shape=r,n._ellipsoid=y.Ellipsoid.clone(l,n._ellipsoid),n._cornerType=s,n._granularity=p,n):(L.polylinePositions=t,L.shapePositions=r,L.cornerType=s,L.granularity=p,new k(L))},new g.BoundingRectangle);return k.createGeometry=function(e){var i=e._positions,i=h.arrayRemoveDuplicates(i,y.Cartesian3.equalsEpsilon),n=e._shape,n=E.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(n);if(!(i.length<2||n.length<3)){b.PolygonPipeline.computeWindingOrder2D(n)===b.WindingOrder.CLOCKWISE&&n.reverse();var a=g.BoundingRectangle.fromPoints(n,T),i=E.PolylineVolumeGeometryLibrary.computePositions(i,n,a,e,!1),a=n,e=new _.GeometryAttributes,t=(e.position=new P.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:i}),a.length),a=e.position.values.length/3,o=i.length/3/t,r=v.IndexDatatype.createTypedArray(a,2*t*(1+o)),l=0,s=0,p=s*t;for(u=0;u<t-1;u++)r[l++]=u+p,r[l++]=u+p+1;for(r[l++]=t-1+p,r[l++]=p,p=(s=o-1)*t,u=0;u<t-1;u++)r[l++]=u+p,r[l++]=u+p+1;for(r[l++]=t-1+p,r[l++]=p,s=0;s<o-1;s++)for(var d=t*s,c=d+t,u=0;u<t;u++)r[l++]=u+d,r[l++]=u+c;return new P.Geometry({attributes:e,indices:v.IndexDatatype.createTypedArray(a,r),boundingSphere:f.BoundingSphere.fromVertices(i),primitiveType:P.PrimitiveType.LINES})}},function(e,i){return(e=d.defined(i)?k.unpack(e,i):e)._ellipsoid=y.Ellipsoid.clone(e._ellipsoid),k.createGeometry(e)}});
