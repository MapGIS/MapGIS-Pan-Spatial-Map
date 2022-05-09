define(["./when-ae2e0b60","./Cartesian2-38b35910","./GeometryOffsetAttribute-b02d5bb9","./Transforms-5b30acc6","./ComponentDatatype-e44126e4","./Check-f996273c","./GeometryAttribute-792ddfc7","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonPipeline-a99f072e","./RectangleGeometryLibrary-64986352","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidRhumbLine-af7b5ebe"],function(p,s,c,d,m,e,_,E,A,g,f,G,t,i,a,n){"use strict";var h=new d.BoundingSphere,y=new d.BoundingSphere,v=new s.Cartesian3,b=new s.Rectangle;function R(e,t){var i,a=e._ellipsoid,n=t.height,r=t.width,e=t.northCap,o=t.southCap,l=n,u=2,s=0,p=4,c=(e&&(--u,--l,s+=1,p-=2),o&&(--u,--l,s+=1,p-=2),s+=u*r+2*l-p,new Float64Array(3*s)),d=0,g=0,f=v;if(e)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,0,f),c[d++]=f.x,c[d++]=f.y,c[d++]=f.z;else for(i=0;i<r;i++)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),c[d++]=f.x,c[d++]=f.y,c[d++]=f.z;for(i=r-1,g=1;g<n;g++)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),c[d++]=f.x,c[d++]=f.y,c[d++]=f.z;if(g=n-1,!o)for(i=r-2;0<=i;i--)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),c[d++]=f.x,c[d++]=f.y,c[d++]=f.z;for(i=0,g=n-2;0<g;g--)G.RectangleGeometryLibrary.computePosition(t,a,!1,g,i,f),c[d++]=f.x,c[d++]=f.y,c[d++]=f.z;for(var u=c.length/3*2,h=A.IndexDatatype.createTypedArray(c.length/3,u),y=0,b=0;b<c.length/3-1;b++)h[y++]=b,h[y++]=b+1;h[y++]=c.length/3-1,h[y++]=0;l=new _.Geometry({attributes:new E.GeometryAttributes,primitiveType:_.PrimitiveType.LINES});return l.attributes.position=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c}),l.indices=h,l}function P(e){var t=(e=p.defaultValue(e,p.defaultValue.EMPTY_OBJECT)).rectangle,i=p.defaultValue(e.granularity,g.CesiumMath.RADIANS_PER_DEGREE),a=p.defaultValue(e.ellipsoid,s.Ellipsoid.WGS84),n=p.defaultValue(e.rotation,0),r=p.defaultValue(e.height,0),o=p.defaultValue(e.extrudedHeight,r);this._rectangle=s.Rectangle.clone(t),this._granularity=i,this._ellipsoid=a,this._surfaceHeight=Math.max(r,o),this._rotation=n,this._extrudedHeight=Math.min(r,o),this._offsetAttribute=e.offsetAttribute,this._workerName="createRectangleOutlineGeometry"}P.packedLength=s.Rectangle.packedLength+s.Ellipsoid.packedLength+5,P.pack=function(e,t,i){return i=p.defaultValue(i,0),s.Rectangle.pack(e._rectangle,t,i),i+=s.Rectangle.packedLength,s.Ellipsoid.pack(e._ellipsoid,t,i),i+=s.Ellipsoid.packedLength,t[i++]=e._granularity,t[i++]=e._surfaceHeight,t[i++]=e._rotation,t[i++]=e._extrudedHeight,t[i]=p.defaultValue(e._offsetAttribute,-1),t};var w=new s.Rectangle,L=s.Ellipsoid.clone(s.Ellipsoid.UNIT_SPHERE),C={rectangle:w,ellipsoid:L,granularity:void 0,height:void 0,rotation:void 0,extrudedHeight:void 0,offsetAttribute:void 0},D=(P.unpack=function(e,t,i){t=p.defaultValue(t,0);var a=s.Rectangle.unpack(e,t,w),n=(t+=s.Rectangle.packedLength,s.Ellipsoid.unpack(e,t,L)),r=(t+=s.Ellipsoid.packedLength,e[t++]),o=e[t++],l=e[t++],u=e[t++],e=e[t];return p.defined(i)?(i._rectangle=s.Rectangle.clone(a,i._rectangle),i._ellipsoid=s.Ellipsoid.clone(n,i._ellipsoid),i._surfaceHeight=o,i._rotation=l,i._extrudedHeight=u,i._offsetAttribute=-1===e?void 0:e,i):(C.granularity=r,C.height=o,C.rotation=l,C.extrudedHeight=u,C.offsetAttribute=-1===e?void 0:e,new P(C))},new s.Cartographic);return P.createGeometry=function(e){var t,i,a,n,r,o,l=e._rectangle,u=e._ellipsoid,s=G.RectangleGeometryLibrary.computeOptions(l,e._granularity,e._rotation,0,b,D);if(!g.CesiumMath.equalsEpsilon(l.north,l.south,g.CesiumMath.EPSILON10)&&!g.CesiumMath.equalsEpsilon(l.east,l.west,g.CesiumMath.EPSILON10))return t=e._surfaceHeight,n=e._extrudedHeight,a=!g.CesiumMath.equalsEpsilon(t,n,0,g.CesiumMath.EPSILON2)?(i=function(e,t){for(var i=e._surfaceHeight,a=e._extrudedHeight,n=e._ellipsoid,e=R(e,t),r=t.height,o=t.width,l=(i=f.PolygonPipeline.scaleToGeodeticHeight(e.attributes.position.values,i,n,!1)).length,u=new Float64Array(2*l),i=(u.set(i),f.PolygonPipeline.scaleToGeodeticHeight(e.attributes.position.values,a,n)),a=(u.set(i,l),e.attributes.position.values=u,t.northCap),n=t.southCap,i=4,t=(a&&--i,n&&--i,2*(u.length/3+i)),s=A.IndexDatatype.createTypedArray(u.length/3,t),l=u.length/6,p=0,c=0;c<l-1;c++)s[p++]=c,s[p++]=c+1,s[p++]=c+l,s[p++]=c+l+1;return s[p++]=l-1,s[p++]=0,s[p++]=l+l-1,s[p++]=l,s[p++]=0,s[p++]=l,t=a?r-1:(s[p++]=i=o-1,s[p++]=i+l,o+r-2),s[p++]=t,s[p++]=t+l,n||(s[p++]=u=o+t-1,s[p]=u+l),e.indices=s,e}(e,s),p.defined(e._offsetAttribute)&&(r=i.attributes.position.values.length/3,a=new Uint8Array(r),a=e._offsetAttribute===c.GeometryOffsetAttribute.TOP?c.arrayFill(a,1,0,r/2):(o=e._offsetAttribute===c.GeometryOffsetAttribute.NONE?0:1,c.arrayFill(a,o)),i.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),r=d.BoundingSphere.fromRectangle3D(l,u,t,y),a=d.BoundingSphere.fromRectangle3D(l,u,n,h),d.BoundingSphere.union(r,a)):((i=R(e,s)).attributes.position.values=f.PolygonPipeline.scaleToGeodeticHeight(i.attributes.position.values,t,u,!1),p.defined(e._offsetAttribute)&&(n=i.attributes.position.values.length,r=new Uint8Array(n/3),o=e._offsetAttribute===c.GeometryOffsetAttribute.NONE?0:1,c.arrayFill(r,o),i.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:m.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:r})),d.BoundingSphere.fromRectangle3D(l,u,t)),new _.Geometry({attributes:i.attributes,indices:i.indices,primitiveType:_.PrimitiveType.LINES,boundingSphere:a,offsetAttribute:e._offsetAttribute})},function(e,t){return(e=p.defined(t)?P.unpack(e,t):e)._ellipsoid=s.Ellipsoid.clone(e._ellipsoid),e._rectangle=s.Rectangle.clone(e._rectangle),P.createGeometry(e)}});
