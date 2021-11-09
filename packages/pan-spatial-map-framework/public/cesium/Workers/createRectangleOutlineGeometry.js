define(["./when-0ac5fc51","./Cartesian2-21667d02","./GeometryOffsetAttribute-130c5ab0","./Transforms-9663aff8","./ComponentDatatype-a350450f","./Check-91887fdf","./GeometryAttribute-95829fb2","./GeometryAttributes-49ce162f","./IndexDatatype-14fcdf85","./Math-e1584698","./PolygonPipeline-9167e80a","./RectangleGeometryLibrary-c242c7c9","./combine-323053a8","./RuntimeError-71e5ac17","./WebGLConstants-dd197df0","./EllipsoidRhumbLine-6713e1b6"],function(c,s,p,d,b,e,_,v,E,f,g,A,t,i,a,r){"use strict";var h=new d.BoundingSphere,y=new d.BoundingSphere,G=new s.Cartesian3,m=new s.Rectangle;function R(e,t){var i=e._ellipsoid,a=t.height,r=t.width,n=t.northCap,o=t.southCap,l=a,u=2,s=0,e=4;n&&(--u,--l,s+=1,e-=2),o&&(--u,--l,s+=1,e-=2),s+=u*r+2*l-e;var c,p=new Float64Array(3*s),d=0,f=0,g=G;if(n)A.RectangleGeometryLibrary.computePosition(t,i,!1,f,0,g),p[d++]=g.x,p[d++]=g.y,p[d++]=g.z;else for(c=0;c<r;c++)A.RectangleGeometryLibrary.computePosition(t,i,!1,f,c,g),p[d++]=g.x,p[d++]=g.y,p[d++]=g.z;for(c=r-1,f=1;f<a;f++)A.RectangleGeometryLibrary.computePosition(t,i,!1,f,c,g),p[d++]=g.x,p[d++]=g.y,p[d++]=g.z;if(f=a-1,!o)for(c=r-2;0<=c;c--)A.RectangleGeometryLibrary.computePosition(t,i,!1,f,c,g),p[d++]=g.x,p[d++]=g.y,p[d++]=g.z;for(c=0,f=a-2;0<f;f--)A.RectangleGeometryLibrary.computePosition(t,i,!1,f,c,g),p[d++]=g.x,p[d++]=g.y,p[d++]=g.z;for(var o=p.length/3*2,h=E.IndexDatatype.createTypedArray(p.length/3,o),y=0,m=0;m<p.length/3-1;m++)h[y++]=m,h[y++]=m+1;h[y++]=p.length/3-1,h[y++]=0;o=new _.Geometry({attributes:new v.GeometryAttributes,primitiveType:_.PrimitiveType.LINES});return o.attributes.position=new _.GeometryAttribute({componentDatatype:b.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:p}),o.indices=h,o}function P(e){var t=(e=c.defaultValue(e,c.defaultValue.EMPTY_OBJECT)).rectangle,i=c.defaultValue(e.granularity,f.CesiumMath.RADIANS_PER_DEGREE),a=c.defaultValue(e.ellipsoid,s.Ellipsoid.WGS84),r=c.defaultValue(e.rotation,0),n=c.defaultValue(e.height,0),o=c.defaultValue(e.extrudedHeight,n);this._rectangle=s.Rectangle.clone(t),this._granularity=i,this._ellipsoid=a,this._surfaceHeight=Math.max(n,o),this._rotation=r,this._extrudedHeight=Math.min(n,o),this._offsetAttribute=e.offsetAttribute,this._workerName="createRectangleOutlineGeometry"}P.packedLength=s.Rectangle.packedLength+s.Ellipsoid.packedLength+5,P.pack=function(e,t,i){return i=c.defaultValue(i,0),s.Rectangle.pack(e._rectangle,t,i),i+=s.Rectangle.packedLength,s.Ellipsoid.pack(e._ellipsoid,t,i),i+=s.Ellipsoid.packedLength,t[i++]=e._granularity,t[i++]=e._surfaceHeight,t[i++]=e._rotation,t[i++]=e._extrudedHeight,t[i]=c.defaultValue(e._offsetAttribute,-1),t};var w=new s.Rectangle,L=s.Ellipsoid.clone(s.Ellipsoid.UNIT_SPHERE),C={rectangle:w,ellipsoid:L,granularity:void 0,height:void 0,rotation:void 0,extrudedHeight:void 0,offsetAttribute:void 0};P.unpack=function(e,t,i){t=c.defaultValue(t,0);var a=s.Rectangle.unpack(e,t,w);t+=s.Rectangle.packedLength;var r=s.Ellipsoid.unpack(e,t,L);t+=s.Ellipsoid.packedLength;var n=e[t++],o=e[t++],l=e[t++],u=e[t++],t=e[t];return c.defined(i)?(i._rectangle=s.Rectangle.clone(a,i._rectangle),i._ellipsoid=s.Ellipsoid.clone(r,i._ellipsoid),i._surfaceHeight=o,i._rotation=l,i._extrudedHeight=u,i._offsetAttribute=-1===t?void 0:t,i):(C.granularity=n,C.height=o,C.rotation=l,C.extrudedHeight=u,C.offsetAttribute=-1===t?void 0:t,new P(C))};var D=new s.Cartographic;return P.createGeometry=function(e){var t=e._rectangle,i=e._ellipsoid,a=A.RectangleGeometryLibrary.computeOptions(t,e._granularity,e._rotation,0,m,D);if(!f.CesiumMath.equalsEpsilon(t.north,t.south,f.CesiumMath.EPSILON10)&&!f.CesiumMath.equalsEpsilon(t.east,t.west,f.CesiumMath.EPSILON10)){var r,n,o,l,u=e._surfaceHeight,s=e._extrudedHeight;return u=!f.CesiumMath.equalsEpsilon(u,s,0,f.CesiumMath.EPSILON2)?(n=function(e,t){var i=e._surfaceHeight,a=e._extrudedHeight,r=e._ellipsoid,n=a,o=i,l=R(e,t),a=t.height,i=t.width,u=(e=g.PolygonPipeline.scaleToGeodeticHeight(l.attributes.position.values,o,r,!1)).length;(o=new Float64Array(2*u)).set(e),n=g.PolygonPipeline.scaleToGeodeticHeight(l.attributes.position.values,n,r),o.set(n,u),l.attributes.position.values=o,r=t.northCap,n=t.southCap,t=4,r&&--t,n&&--t;for(var t=2*(o.length/3+t),s=E.IndexDatatype.createTypedArray(o.length/3,t),u=o.length/6,c=0,p=0;p<u-1;p++)s[c++]=p,s[c++]=p+1,s[c++]=p+u,s[c++]=p+u+1;return s[c++]=u-1,s[c++]=0,s[c++]=u+u-1,s[c++]=u,s[c++]=0,s[c++]=u,a=r?a-1:(s[c++]=r=i-1,s[c++]=r+u,i+a-2),s[c++]=a,s[c++]=a+u,n||(s[c++]=a=i+a-1,s[c]=a+u),l.indices=s,l}(e,a),c.defined(e._offsetAttribute)&&(r=n.attributes.position.values.length/3,o=new Uint8Array(r),o=e._offsetAttribute===p.GeometryOffsetAttribute.TOP?p.arrayFill(o,1,0,r/2):(l=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(o,l)),n.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:b.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:o})),o=d.BoundingSphere.fromRectangle3D(t,i,u,y),s=d.BoundingSphere.fromRectangle3D(t,i,s,h),d.BoundingSphere.union(o,s)):((n=R(e,a)).attributes.position.values=g.PolygonPipeline.scaleToGeodeticHeight(n.attributes.position.values,u,i,!1),c.defined(e._offsetAttribute)&&(a=n.attributes.position.values.length,a=new Uint8Array(a/3),l=e._offsetAttribute===p.GeometryOffsetAttribute.NONE?0:1,p.arrayFill(a,l),n.attributes.applyOffset=new _.GeometryAttribute({componentDatatype:b.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),d.BoundingSphere.fromRectangle3D(t,i,u)),new _.Geometry({attributes:n.attributes,indices:n.indices,primitiveType:_.PrimitiveType.LINES,boundingSphere:u,offsetAttribute:e._offsetAttribute})}},function(e,t){return(e=c.defined(t)?P.unpack(e,t):e)._ellipsoid=s.Ellipsoid.clone(e._ellipsoid),e._rectangle=s.Rectangle.clone(e._rectangle),P.createGeometry(e)}});
