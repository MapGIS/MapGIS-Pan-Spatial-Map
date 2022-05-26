define(["./when-ae2e0b60","./Cartesian2-38b35910","./arrayRemoveDuplicates-bdf50aa0","./BoundingRectangle-e21fe51a","./Transforms-a4418317","./ComponentDatatype-e44126e4","./PolylineVolumeGeometryLibrary-474c3146","./Check-f996273c","./GeometryAttribute-1a41823d","./GeometryAttributes-5ce4955a","./GeometryPipeline-1a4c797a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonPipeline-b9c71608","./VertexFormat-90d15264","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-7ac18473","./AxisAlignedBoundingBox-ff374694","./IntersectionTests-af0a2b76","./Plane-dec8dc7e","./PolylinePipeline-8e22297b","./EllipsoidGeodesic-0207b202","./EllipsoidRhumbLine-af7b5ebe","./AttributeCompression-25f42564","./EncodedCartesian3-d40e98d6"],function(c,T,G,D,w,R,B,e,S,I,O,N,a,W,u,t,n,i,o,r,l,s,p,d,m,y,g){"use strict";function h(e){var t=(e=c.defaultValue(e,c.defaultValue.EMPTY_OBJECT)).polylinePositions,n=e.shapePositions,e=(this._positions=t,this._shape=n,this._ellipsoid=T.Ellipsoid.clone(c.defaultValue(e.ellipsoid,T.Ellipsoid.WGS84)),this._cornerType=c.defaultValue(e.cornerType,B.CornerType.ROUNDED),this._vertexFormat=u.VertexFormat.clone(c.defaultValue(e.vertexFormat,u.VertexFormat.DEFAULT)),this._granularity=c.defaultValue(e.granularity,a.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeGeometry",1+t.length*T.Cartesian3.packedLength);e+=1+n.length*T.Cartesian2.packedLength,this.packedLength=e+T.Ellipsoid.packedLength+u.VertexFormat.packedLength+2}h.pack=function(e,t,n){n=c.defaultValue(n,0);var a,i=e._positions,o=i.length;for(t[n++]=o,a=0;a<o;++a,n+=T.Cartesian3.packedLength)T.Cartesian3.pack(i[a],t,n);var r=e._shape,o=r.length;for(t[n++]=o,a=0;a<o;++a,n+=T.Cartesian2.packedLength)T.Cartesian2.pack(r[a],t,n);return T.Ellipsoid.pack(e._ellipsoid,t,n),n+=T.Ellipsoid.packedLength,u.VertexFormat.pack(e._vertexFormat,t,n),n+=u.VertexFormat.packedLength,t[n++]=e._cornerType,t[n]=e._granularity,t};var f=T.Ellipsoid.clone(T.Ellipsoid.UNIT_SPHERE),b=new u.VertexFormat,v={polylinePositions:void 0,shapePositions:void 0,ellipsoid:f,vertexFormat:b,cornerType:void 0,granularity:void 0},U=(h.unpack=function(e,t,n){t=c.defaultValue(t,0);for(var a=e[t++],i=new Array(a),o=0;o<a;++o,t+=T.Cartesian3.packedLength)i[o]=T.Cartesian3.unpack(e,t);var a=e[t++],r=new Array(a);for(o=0;o<a;++o,t+=T.Cartesian2.packedLength)r[o]=T.Cartesian2.unpack(e,t);var l=T.Ellipsoid.unpack(e,t,f),s=(t+=T.Ellipsoid.packedLength,u.VertexFormat.unpack(e,t,b)),p=(t+=u.VertexFormat.packedLength,e[t++]),d=e[t];return c.defined(n)?(n._positions=i,n._shape=r,n._ellipsoid=T.Ellipsoid.clone(l,n._ellipsoid),n._vertexFormat=u.VertexFormat.clone(s,n._vertexFormat),n._cornerType=p,n._granularity=d,n):(v.polylinePositions=i,v.shapePositions=r,v.cornerType=p,v.granularity=d,new h(v))},new D.BoundingRectangle);return h.createGeometry=function(e){var t=e._positions,t=G.arrayRemoveDuplicates(t,T.Cartesian3.equalsEpsilon),n=e._shape,n=B.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(n);if(!(t.length<2||n.length<3)){W.PolygonPipeline.computeWindingOrder2D(n)===W.WindingOrder.CLOCKWISE&&n.reverse();var a,i,o,r,l,s=D.BoundingRectangle.fromPoints(n,U),t=B.PolylineVolumeGeometryLibrary.computePositions(t,n,s,e,!0),p=n,n=s,s=e._vertexFormat,e=new I.GeometryAttributes,d=(s.position&&(e.position=new S.GeometryAttribute({componentDatatype:R.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:t})),p.length),c=t.length/3,u=(c-2*d)/(2*d),m=W.PolygonPipeline.triangulate(p),y=(u-1)*d*6+2*m.length,g=N.IndexDatatype.createTypedArray(c,y),h=2*d,f=0;for(L=0;L<u-1;L++){for(a=0;a<d-1;a++)l=(i=2*a+L*d*2)+h,r=(o=i+1)+h,g[f++]=o,g[f++]=i,g[f++]=r,g[f++]=r,g[f++]=i,g[f++]=l;r=(o=(i=2*d-2+L*d*2)+1)+h,l=i+h,g[f++]=o,g[f++]=i,g[f++]=r,g[f++]=r,g[f++]=i,g[f++]=l}if(s.st||s.tangent||s.bitangent){for(var b,v,P=new Float32Array(2*c),E=1/(u-1),_=1/n.height,k=n.height/2,C=0,L=0;L<u;L++){for(v=_*(p[0].y+k),P[C++]=b=L*E,P[C++]=v,a=1;a<d;a++)v=_*(p[a].y+k),P[C++]=b,P[C++]=v,P[C++]=b,P[C++]=v;v=_*(p[0].y+k),P[C++]=b,P[C++]=v}for(a=0;a<d;a++)v=_*(p[a].y+k),P[C++]=b=0,P[C++]=v;for(a=0;a<d;a++)v=_*(p[a].y+k),P[C++]=b=(u-1)*E,P[C++]=v;e.st=new S.GeometryAttribute({componentDatatype:R.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:new Float32Array(P)})}var V=c-2*d;for(L=0;L<m.length;L+=3){var F=m[L]+V,x=m[L+1]+V,A=m[L+2]+V;g[f++]=F,g[f++]=x,g[f++]=A,g[f++]=A+d,g[f++]=x+d,g[f++]=F+d}if(y=new S.Geometry({attributes:e,indices:g,boundingSphere:w.BoundingSphere.fromVertices(t),primitiveType:S.PrimitiveType.TRIANGLES}),s.normal&&(y=O.GeometryPipeline.computeNormal(y)),s.tangent||s.bitangent){try{y=O.GeometryPipeline.computeTangentAndBitangent(y)}catch(e){B.oneTimeWarning("polyline-volume-tangent-bitangent","Unable to compute tangents and bitangents for polyline volume geometry")}s.tangent||(y.attributes.tangent=void 0),s.bitangent||(y.attributes.bitangent=void 0),s.st||(y.attributes.st=void 0)}return y}},function(e,t){return(e=c.defined(t)?h.unpack(e,t):e)._ellipsoid=T.Ellipsoid.clone(e._ellipsoid),h.createGeometry(e)}});
