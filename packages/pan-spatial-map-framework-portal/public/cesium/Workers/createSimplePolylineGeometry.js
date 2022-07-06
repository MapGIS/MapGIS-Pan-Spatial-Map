define(["./when-ae2e0b60","./Cartesian2-38b35910","./ArcType-1275a14e","./Transforms-ce97037a","./Color-a4bb5b8a","./ComponentDatatype-e44126e4","./Check-f996273c","./GeometryAttribute-f82de479","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolylinePipeline-8831ea08","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidGeodesic-0207b202","./EllipsoidRhumbLine-af7b5ebe","./IntersectionTests-ce427234","./Plane-ee0aa150"],function(D,L,V,x,S,I,e,R,O,M,U,N,o,t,r,a,l,i,n){"use strict";function y(e){var o=(e=D.defaultValue(e,D.defaultValue.EMPTY_OBJECT)).positions,t=e.colors,r=D.defaultValue(e.colorsPerVertex,!1),r=(this._positions=o,this._colors=t,this._colorsPerVertex=r,this._arcType=D.defaultValue(e.arcType,V.ArcType.GEODESIC),this._granularity=D.defaultValue(e.granularity,U.CesiumMath.RADIANS_PER_DEGREE),this._ellipsoid=D.defaultValue(e.ellipsoid,L.Ellipsoid.WGS84),this._workerName="createSimplePolylineGeometry",1+o.length*L.Cartesian3.packedLength);r+=D.defined(t)?1+t.length*S.Color.packedLength:1,this.packedLength=r+L.Ellipsoid.packedLength+3}y.pack=function(e,o,t){t=D.defaultValue(t,0);var r,a=e._positions,l=a.length;for(o[t++]=l,r=0;r<l;++r,t+=L.Cartesian3.packedLength)L.Cartesian3.pack(a[r],o,t);var i=e._colors,l=D.defined(i)?i.length:0;for(o[t++]=l,r=0;r<l;++r,t+=S.Color.packedLength)S.Color.pack(i[r],o,t);return L.Ellipsoid.pack(e._ellipsoid,o,t),t+=L.Ellipsoid.packedLength,o[t++]=e._colorsPerVertex?1:0,o[t++]=e._arcType,o[t]=e._granularity,o},y.unpack=function(e,o,t){o=D.defaultValue(o,0);for(var r=e[o++],a=new Array(r),l=0;l<r;++l,o+=L.Cartesian3.packedLength)a[l]=L.Cartesian3.unpack(e,o);var i=0<(r=e[o++])?new Array(r):void 0;for(l=0;l<r;++l,o+=S.Color.packedLength)i[l]=S.Color.unpack(e,o);var n=L.Ellipsoid.unpack(e,o),s=(o+=L.Ellipsoid.packedLength,1===e[o++]),p=e[o++],d=e[o];return D.defined(t)?(t._positions=a,t._colors=i,t._ellipsoid=n,t._colorsPerVertex=s,t._arcType=p,t._granularity=d,t):new y({positions:a,colors:i,ellipsoid:n,colorsPerVertex:s,arcType:p,granularity:d})};var F=new Array(2),H=new Array(2),W={positions:F,height:H,ellipsoid:void 0,minDistance:void 0,granularity:void 0};return y.createGeometry=function(e){var o=e._positions,t=e._colors,r=e._colorsPerVertex,a=e._arcType,l=e._granularity,e=e._ellipsoid,i=U.CesiumMath.chordLength(l,e.maximumRadius),n=D.defined(t)&&!r,s=o.length,p=0;if(a===V.ArcType.GEODESIC||a===V.ArcType.RHUMB){var d,y,c=a===V.ArcType.GEODESIC?(d=U.CesiumMath.chordLength(l,e.maximumRadius),y=N.PolylinePipeline.numberOfPoints,N.PolylinePipeline.generateArc):(d=l,y=N.PolylinePipeline.numberOfPointsRhumbLine,N.PolylinePipeline.generateRhumbArc),u=N.PolylinePipeline.extractHeights(o,e),f=W;if(a===V.ArcType.GEODESIC?f.minDistance=i:f.granularity=l,f.ellipsoid=e,n){for(var h=0,C=0;C<s-1;C++)h+=y(o[C],o[C+1],d)+1;B=new Float64Array(3*h),A=new Uint8Array(4*h),f.positions=F,f.height=H;var T=0;for(C=0;C<s-1;++C){F[0]=o[C],F[1]=o[C+1],H[0]=u[C],H[1]=u[C+1];var g=c(f);if(D.defined(t))for(var m=g.length/3,b=t[C],P=0;P<m;++P)A[T++]=S.Color.floatToByte(b.red),A[T++]=S.Color.floatToByte(b.green),A[T++]=S.Color.floatToByte(b.blue),A[T++]=S.Color.floatToByte(b.alpha);B.set(g,p),p+=g.length}}else if(f.positions=o,f.height=u,B=new Float64Array(c(f)),D.defined(t)){for(A=new Uint8Array(B.length/3*4),C=0;C<s-1;++C)p=function(e,o,t,r,a,l,i){var n=N.PolylinePipeline.numberOfPoints(e,o,a),s=t.red,p=t.green,d=t.blue,y=t.alpha,e=r.red,o=r.green,a=r.blue,c=r.alpha;if(S.Color.equals(t,r)){for(g=0;g<n;g++)l[i++]=S.Color.floatToByte(s),l[i++]=S.Color.floatToByte(p),l[i++]=S.Color.floatToByte(d),l[i++]=S.Color.floatToByte(y);return i}for(var u=(e-s)/n,f=(o-p)/n,h=(a-d)/n,C=(c-y)/n,T=i,g=0;g<n;g++)l[T++]=S.Color.floatToByte(s+g*u),l[T++]=S.Color.floatToByte(p+g*f),l[T++]=S.Color.floatToByte(d+g*h),l[T++]=S.Color.floatToByte(y+g*C);return T}(o[C],o[C+1],t[C],t[C+1],i,A,p);r=t[s-1];A[p++]=S.Color.floatToByte(r.red),A[p++]=S.Color.floatToByte(r.green),A[p++]=S.Color.floatToByte(r.blue),A[p++]=S.Color.floatToByte(r.alpha)}}else{var _=n?2*s-2:s,B=new Float64Array(3*_),A=D.defined(t)?new Uint8Array(4*_):void 0,E=0,v=0;for(C=0;C<s;++C){var k=o[C];if(n&&0<C&&(L.Cartesian3.pack(k,B,E),E+=3,b=t[C-1],A[v++]=S.Color.floatToByte(b.red),A[v++]=S.Color.floatToByte(b.green),A[v++]=S.Color.floatToByte(b.blue),A[v++]=S.Color.floatToByte(b.alpha)),n&&C===s-1)break;L.Cartesian3.pack(k,B,E),E+=3,D.defined(t)&&(b=t[C],A[v++]=S.Color.floatToByte(b.red),A[v++]=S.Color.floatToByte(b.green),A[v++]=S.Color.floatToByte(b.blue),A[v++]=S.Color.floatToByte(b.alpha))}}var a=new O.GeometryAttributes,l=(a.position=new R.GeometryAttribute({componentDatatype:I.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:B}),D.defined(t)&&(a.color=new R.GeometryAttribute({componentDatatype:I.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:4,values:A,normalize:!0})),2*((_=B.length/3)-1)),G=M.IndexDatatype.createTypedArray(_,l),w=0;for(C=0;C<_-1;++C)G[w++]=C,G[w++]=C+1;return new R.Geometry({attributes:a,indices:G,primitiveType:R.PrimitiveType.LINES,boundingSphere:x.BoundingSphere.fromPoints(o)})},function(e,o){return(e=D.defined(o)?y.unpack(e,o):e)._ellipsoid=L.Ellipsoid.clone(e._ellipsoid),y.createGeometry(e)}});
