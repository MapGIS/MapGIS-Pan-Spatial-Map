define(["./when-ae2e0b60","./Matrix2-59fd2efe","./GeometryOffsetAttribute-8c0bd3ce","./Transforms-3bc98d07","./ComponentDatatype-b7b5db18","./RuntimeError-24b14c10","./GeometryAttribute-dff85b2b","./GeometryAttributes-5ce4955a","./IndexDatatype-6902a37d","./PolygonPipeline-ea1c8d04","./RectangleGeometryLibrary-c2148ae2","./combine-276652d0","./WebGLConstants-35626ea2","./EllipsoidRhumbLine-535d21cd"],function(d,s,p,c,m,e,_,E,A,g,G,t,i,a){"use strict";var f=new c.BoundingSphere,h=new c.BoundingSphere,v=new s.Cartesian3,y=new s.Rectangle;function b(e,t){var i,a=e._ellipsoid,r=t.height,n=t.width,e=t.northCap,o=t.southCap,l=r,u=2,s=0,d=4,p=(e&&(--u,--l,s+=1,d-=2),o&&(--u,--l,s+=1,d-=2),s+=u*n+2*l-d,new Float64Array(3*s)),c=0,g=0,f=v;if(e)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,0,f),p[c++]=f.x,p[c++]=f.y,p[c++]=f.z;else for(i=0;i<n;i++)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),p[c++]=f.x,p[c++]=f.y,p[c++]=f.z;for(i=n-1,g=1;g<r;g++)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),p[c++]=f.x,p[c++]=f.y,p[c++]=f.z;if(g=r-1,!o)for(i=n-2;0<=i;i--)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),p[c++]=f.x,p[c++]=f.y,p[c++]=f.z;for(i=0,g=r-2;0<g;g--)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),p[c++]=f.x,p[c++]=f.y,p[c++]=f.z;for(var u=p.length/3*2,h=A.IndexDatatype.createTypedArray(p.length/3,u),y=0,b=0;b<p.length/3-1;b++)h[y++]=b,h[y++]=b+1;h[y++]=p.length/3-1,h[y++]=0;l=new _.Geometry({attributes:new E.GeometryAttributes,primitiveType:_.PrimitiveType.LINES});return l.attributes.position=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p}),l.indices=h,l}function R(e){var t=(e=d.defaultValue(e,d.defaultValue.EMPTY_OBJECT)).rectangle,i=d.defaultValue(e.granularity,m.CesiumMath.RADIANS_PER_DEGREE),a=d.defaultValue(e.ellipsoid,s.Ellipsoid.WGS84),r=d.defaultValue(e.rotation,0),n=d.defaultValue(e.height,0),o=d.defaultValue(e.extrudedHeight,n);this._rectangle=s.Rectangle.clone(t),this._granularity=i,this._ellipsoid=a,this._surfaceHeight=Math.max(n,o),this._rotation=r,this._extrudedHeight=Math.min(n,o),this._offsetAttribute=e.offsetAttribute,this._workerName="createRectangleOutlineGeometry"}R.packedLength=s.Rectangle.packedLength+s.Ellipsoid.packedLength+5,R.pack=function(e,t,i){return i=d.defaultValue(i,0),s.Rectangle.pack(e._rectangle,t,i),i+=s.Rectangle.packedLength,s.Ellipsoid.pack(e._ellipsoid,t,i),i+=s.Ellipsoid.packedLength,t[i++]=e._granularity,t[i++]=e._surfaceHeight,t[i++]=e._rotation,t[i++]=e._extrudedHeight,t[i]=d.defaultValue(e._offsetAttribute,-1),t};var P=new s.Rectangle,w=s.Ellipsoid.clone(s.Ellipsoid.UNIT_SPHERE),L={rectangle:P,ellipsoid:w,granularity:void 0,height:void 0,rotation:void 0,extrudedHeight:void 0,offsetAttribute:void 0},C=(R.unpack=function(e,t,i){t=d.defaultValue(t,0);var a=s.Rectangle.unpack(e,t,P),r=(t+=s.Rectangle.packedLength,s.Ellipsoid.unpack(e,t,w)),n=(t+=s.Ellipsoid.packedLength,e[t++]),o=e[t++],l=e[t++],u=e[t++],e=e[t];return d.defined(i)?(i._rectangle=s.Rectangle.clone(a,i._rectangle),i._ellipsoid=s.Ellipsoid.clone(r,i._ellipsoid),i._surfaceHeight=o,i._rotation=l,i._extrudedHeight=u,i._offsetAttribute=-1===e?void 0:e,i):(L.granularity=n,L.height=o,L.rotation=l,L.extrudedHeight=u,L.offsetAttribute=-1===e?void 0:e,new R(L))},new s.Cartographic);return R.createGeometry=function(e){var t,i,a,r,n,o,l=e._rectangle,u=e._ellipsoid,s=G.RectangleGeometryLibrary.computeOptions(l,e._granularity,e._rotation,0,y,C);if(!m.CesiumMath.equalsEpsilon(l.north,l.south,m.CesiumMath.EPSILON10)&&!m.CesiumMath.equalsEpsilon(l.east,l.west,m.CesiumMath.EPSILON10))return t=e._surfaceHeight,r=e._extrudedHeight,a=!m.CesiumMath.equalsEpsilon(t,r,0,m.CesiumMath.EPSILON2)?(i=function(e,t){for(var i=e._surfaceHeight,a=e._extrudedHeight,r=e._ellipsoid,e=b(e,t),n=t.height,o=t.width,l=(i=g.PolygonPipeline.scaleToGeodeticHeight(e.attributes.position.values,i,r,!1)).length,u=new Float64Array(2*l),i=(u.set(i),g.PolygonPipeline.scaleToGeodeticHeight(e.attributes.position.values,a,r)),a=(u.set(i,l),e.attributes.position.values=u,t.northCap),r=t.southCap,i=4,t=(a&&--i,r&&--i,2*(u.length/3+i)),s=A.IndexDatatype.createTypedArray(u.length/3,t),l=u.length/6,d=0,p=0;p<l-1;p++)s[d++]=p,s[d++]=p+1,s[d++]=p+l,s[d++]=p+l+1;return s[d++]=l-1,s[d++]=0,s[d++]=l+l-1,s[d++]=l,s[d++]=0,s[d++]=l,t=a?n-1:(s[d++]=i=o-1,s[d++]=i+l,o+n-2),s[d++]=t,s[d++]=t+l,r||(s[d++]=u=o+t-1,s[d]=u+l),e.indices=s,e}(e,s),d.defined(e._offsetAttribute)&&(n=i.attributes.position.values.length/3,a=new Uint8Array(n),a=e._offsetAttribute===p.GeometryOffsetAttribute.TOP?p.arrayFill(a,1,0,n/2):(o=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(a,o)),i.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),n=c.BoundingSphere.fromRectangle3D(l,u,t,h),a=c.BoundingSphere.fromRectangle3D(l,u,r,f),c.BoundingSphere.union(n,a)):((i=b(e,s)).attributes.position.values=g.PolygonPipeline.scaleToGeodeticHeight(i.attributes.position.values,t,u,!1),d.defined(e._offsetAttribute)&&(r=i.attributes.position.values.length,n=new Uint8Array(r/3),o=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(n,o),i.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:n})),c.BoundingSphere.fromRectangle3D(l,u,t)),new _.Geometry({attributes:i.attributes,indices:i.indices,primitiveType:_.PrimitiveType.LINES,boundingSphere:a,offsetAttribute:e._offsetAttribute})},function(e,t){return(e=d.defined(t)?R.unpack(e,t):e)._ellipsoid=s.Ellipsoid.clone(e._ellipsoid),e._rectangle=s.Rectangle.clone(e._rectangle),R.createGeometry(e)}});
