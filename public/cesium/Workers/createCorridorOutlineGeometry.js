define(["./GeometryOffsetAttribute-b02d5bb9","./arrayRemoveDuplicates-bdf50aa0","./Transforms-cdfd3fe7","./Cartesian2-38b35910","./Check-f996273c","./ComponentDatatype-e44126e4","./PolylineVolumeGeometryLibrary-64b9f3de","./CorridorGeometryLibrary-5f34b6f5","./when-ae2e0b60","./GeometryAttribute-0e967e1c","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonPipeline-e1842ebb","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-98d5e01c","./AxisAlignedBoundingBox-83842dab","./IntersectionTests-78298c28","./Plane-457b12fd","./PolylinePipeline-a31b4808","./EllipsoidGeodesic-0207b202","./EllipsoidRhumbLine-af7b5ebe"],function(A,l,d,B,e,M,R,U,F,Y,q,W,u,v,t,i,r,o,a,n,s,p,f,h){"use strict";var J=new B.Cartesian3,j=new B.Cartesian3,z=new B.Cartesian3;function _(e,t){var i,r=[],o=e.positions,a=e.corners,e=e.endPositions,n=new q.GeometryAttributes,s=0,l=0,d=0;for(w=0;w<o.length;w+=2)s+=i=o[w].length-3,d+=i/3*4,l+=o[w+1].length-3;for(s+=3,l+=3,w=0;w<a.length;w++){var u=a[w],p=a[w].leftPositions;F.defined(p)?s+=i=p.length:l+=i=a[w].rightPositions.length,d+=i/3*2}var f,h,y,c,b,g=F.defined(e),m=(g&&(s+=f=e[0].length-3,l+=f,d+=4*(f/=3)),s+l),A=new Float64Array(m),v=0,_=m-1,E=f/2,C=W.IndexDatatype.createTypedArray(m/3,d+4),G=0;if(C[G++]=v/3,C[G++]=(_-2)/3,g){r.push(v/3);for(var T=J,P=j,I=e[0],w=0;w<E;w++)T=B.Cartesian3.fromArray(I,3*(E-1-w),T),P=B.Cartesian3.fromArray(I,3*(E+w),P),U.CorridorGeometryLibrary.addAttribute(A,P,v),U.CorridorGeometryLibrary.addAttribute(A,T,void 0,_),b=(y=v/3)+1,c=(h=(_-2)/3)-1,C[G++]=h,C[G++]=c,C[G++]=y,C[G++]=b,v+=3,_-=3}var L=0,D=o[L++],k=o[L++];for(A.set(D,v),A.set(k,_-k.length+1),i=k.length-3,r.push(v/3,(_-2)/3),w=0;w<i;w+=3)b=(y=v/3)+1,c=(h=(_-2)/3)-1,C[G++]=h,C[G++]=c,C[G++]=y,C[G++]=b,v+=3,_-=3;for(w=0;w<a.length;w++){var x,N,O=(u=a[w]).leftPositions,V=u.rightPositions,H=z;if(F.defined(O)){for(_-=3,N=c,r.push(b),x=0;x<O.length/3;x++)H=B.Cartesian3.fromArray(O,3*x,H),C[G++]=N-x-1,C[G++]=N-x,U.CorridorGeometryLibrary.addAttribute(A,H,void 0,_),_-=3;r.push(N-Math.floor(O.length/6)),t===R.CornerType.BEVELED&&r.push((_-2)/3+1),v+=3}else{for(v+=3,N=b,r.push(c),x=0;x<V.length/3;x++)H=B.Cartesian3.fromArray(V,3*x,H),C[G++]=N+x,C[G++]=N+x+1,U.CorridorGeometryLibrary.addAttribute(A,H,v),v+=3;r.push(N+Math.floor(V.length/6)),t===R.CornerType.BEVELED&&r.push(v/3-1),_-=3}for(D=o[L++],k=o[L++],D.splice(0,3),k.splice(k.length-3,3),A.set(D,v),A.set(k,_-k.length+1),i=k.length-3,x=0;x<k.length;x+=3)y=(b=v/3)-1,C[G++]=h=(c=(_-2)/3)+1,C[G++]=c,C[G++]=y,C[G++]=b,v+=3,_-=3;r.push((v-=3)/3,((_+=3)-2)/3)}if(g){v+=3,_-=3,T=J,P=j;var S=e[1];for(w=0;w<E;w++)T=B.Cartesian3.fromArray(S,3*(f-w-1),T),P=B.Cartesian3.fromArray(S,3*w,P),U.CorridorGeometryLibrary.addAttribute(A,T,void 0,_),U.CorridorGeometryLibrary.addAttribute(A,P,v),y=(b=v/3)-1,C[G++]=h=(c=(_-2)/3)+1,C[G++]=c,C[G++]=y,C[G++]=b,v+=3,_-=3;r.push(v/3)}else r.push(v/3,(_-2)/3);return C[G++]=v/3,C[G++]=(_-2)/3,n.position=new Y.GeometryAttribute({componentDatatype:M.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:A}),{attributes:n,indices:C,wallIndices:r}}function y(e){var t=(e=F.defaultValue(e,F.defaultValue.EMPTY_OBJECT)).positions,i=e.width,r=F.defaultValue(e.height,0),o=F.defaultValue(e.extrudedHeight,r);this._positions=t,this._ellipsoid=B.Ellipsoid.clone(F.defaultValue(e.ellipsoid,B.Ellipsoid.WGS84)),this._width=i,this._height=Math.max(r,o),this._extrudedHeight=Math.min(r,o),this._cornerType=F.defaultValue(e.cornerType,R.CornerType.ROUNDED),this._granularity=F.defaultValue(e.granularity,u.CesiumMath.RADIANS_PER_DEGREE),this._offsetAttribute=e.offsetAttribute,this._workerName="createCorridorOutlineGeometry",this.packedLength=1+t.length*B.Cartesian3.packedLength+B.Ellipsoid.packedLength+6}y.pack=function(e,t,i){i=F.defaultValue(i,0);var r=e._positions,o=r.length;t[i++]=o;for(var a=0;a<o;++a,i+=B.Cartesian3.packedLength)B.Cartesian3.pack(r[a],t,i);return B.Ellipsoid.pack(e._ellipsoid,t,i),i+=B.Ellipsoid.packedLength,t[i++]=e._width,t[i++]=e._height,t[i++]=e._extrudedHeight,t[i++]=e._cornerType,t[i++]=e._granularity,t[i]=F.defaultValue(e._offsetAttribute,-1),t};var c=B.Ellipsoid.clone(B.Ellipsoid.UNIT_SPHERE),b={positions:void 0,ellipsoid:c,width:void 0,height:void 0,extrudedHeight:void 0,cornerType:void 0,granularity:void 0,offsetAttribute:void 0};return y.unpack=function(e,t,i){t=F.defaultValue(t,0);for(var r=e[t++],o=new Array(r),a=0;a<r;++a,t+=B.Cartesian3.packedLength)o[a]=B.Cartesian3.unpack(e,t);var n=B.Ellipsoid.unpack(e,t,c),s=(t+=B.Ellipsoid.packedLength,e[t++]),l=e[t++],d=e[t++],u=e[t++],p=e[t++],f=e[t];return F.defined(i)?(i._positions=o,i._ellipsoid=B.Ellipsoid.clone(n,i._ellipsoid),i._width=s,i._height=l,i._extrudedHeight=d,i._cornerType=u,i._granularity=p,i._offsetAttribute=-1===f?void 0:f,i):(b.positions=o,b.width=s,b.height=l,b.extrudedHeight=d,b.cornerType=u,b.granularity=p,b.offsetAttribute=-1===f?void 0:f,new y(b))},y.createGeometry=function(e){var t,i,r,o,a=e._positions,n=e._width,s=e._ellipsoid,a=function(e,t){for(var i=0;i<e.length;i++)e[i]=t.scaleToGeodeticSurface(e[i],e[i]);return e}(a,s),a=l.arrayRemoveDuplicates(a,B.Cartesian3.equalsEpsilon);if(!(a.length<2||n<=0))return o=e._height,i=e._extrudedHeight,t=!u.CesiumMath.equalsEpsilon(o,i,0,u.CesiumMath.EPSILON2),a={ellipsoid:s,positions:a,width:n,cornerType:e._cornerType,granularity:e._granularity,saveAttributes:!1},t?(a.height=o,a.extrudedHeight=i,a.offsetAttribute=e._offsetAttribute,r=function(e){for(var t,i,r=e.ellipsoid,o=(p=_(U.CorridorGeometryLibrary.computePositions(e),e.cornerType)).wallIndices,a=e.height,n=e.extrudedHeight,s=p.attributes,l=p.indices,d=(p=s.position.values).length,u=((f=new Float64Array(d)).set(p),new Float64Array(2*d)),p=v.PolygonPipeline.scaleToGeodeticHeight(p,a,r),f=v.PolygonPipeline.scaleToGeodeticHeight(f,n,r),h=(u.set(p),u.set(f,d),s.position.values=u,d/=3,F.defined(e.offsetAttribute)&&(a=new Uint8Array(2*d),a=e.offsetAttribute===A.GeometryOffsetAttribute.TOP?A.arrayFill(a,1,0,d):(n=e.offsetAttribute===A.GeometryOffsetAttribute.NONE?0:1,A.arrayFill(a,n)),s.applyOffset=new Y.GeometryAttribute({componentDatatype:M.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),l.length),y=W.IndexDatatype.createTypedArray(u.length/3,2*(h+o.length)),c=(y.set(l),h),b=0;b<h;b+=2){var g=l[b],m=l[b+1];y[c++]=g+d,y[c++]=m+d}for(b=0;b<o.length;b++)i=(t=o[b])+d,y[c++]=t,y[c++]=i;return{attributes:s,indices:y}}(a)):((r=_(U.CorridorGeometryLibrary.computePositions(a),a.cornerType)).attributes.position.values=v.PolygonPipeline.scaleToGeodeticHeight(r.attributes.position.values,o,s),F.defined(e._offsetAttribute)&&(n=r.attributes.position.values.length,t=new Uint8Array(n/3),i=e._offsetAttribute===A.GeometryOffsetAttribute.NONE?0:1,A.arrayFill(t,i),r.attributes.applyOffset=new Y.GeometryAttribute({componentDatatype:M.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:t}))),a=r.attributes,o=d.BoundingSphere.fromVertices(a.position.values,void 0,3),new Y.Geometry({attributes:a,indices:r.indices,primitiveType:Y.PrimitiveType.LINES,boundingSphere:o,offsetAttribute:e._offsetAttribute})},function(e,t){return(e=F.defined(t)?y.unpack(e,t):e)._ellipsoid=B.Ellipsoid.clone(e._ellipsoid),y.createGeometry(e)}});
