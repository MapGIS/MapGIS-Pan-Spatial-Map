define(["./when-0ac5fc51","./Cartesian2-21667d02","./ArcType-13c64291","./GeometryOffsetAttribute-130c5ab0","./Transforms-9663aff8","./Check-91887fdf","./ComponentDatatype-a350450f","./EllipsoidTangentPlane-c3f115df","./GeometryAttribute-95829fb2","./GeometryAttributes-49ce162f","./GeometryInstance-e3dcce8b","./GeometryPipeline-162e7fcf","./IndexDatatype-14fcdf85","./Math-e1584698","./PolygonGeometryLibrary-82953072","./PolygonPipeline-9167e80a","./combine-323053a8","./RuntimeError-71e5ac17","./WebGLConstants-dd197df0","./AxisAlignedBoundingBox-ffb4db6f","./IntersectionTests-249faccb","./Plane-ab509945","./AttributeCompression-7ed0057c","./EncodedCartesian3-b1d566d1","./arrayRemoveDuplicates-df87c807","./EllipsoidRhumbLine-6713e1b6"],function(m,d,E,b,P,e,A,_,v,G,L,T,H,C,O,x,t,i,r,o,n,a,l,s,y,u){"use strict";var D=[],I=[];function f(e){var t,i=e.polygonHierarchy,r=m.defaultValue(e.ellipsoid,d.Ellipsoid.WGS84),o=m.defaultValue(e.granularity,C.CesiumMath.RADIANS_PER_DEGREE),n=m.defaultValue(e.perPositionHeight,!1),a=n&&m.defined(e.extrudedHeight),l=m.defaultValue(e.arcType,E.ArcType.GEODESIC),s=m.defaultValue(e.height,0),y=m.defaultValue(e.extrudedHeight,s);a||(t=Math.max(s,y),y=Math.min(s,y),s=t),this._ellipsoid=d.Ellipsoid.clone(r),this._granularity=o,this._height=s,this._extrudedHeight=y,this._arcType=l,this._polygonHierarchy=i,this._perPositionHeight=n,this._perPositionHeightExtrude=a,this._offsetAttribute=e.offsetAttribute,this._workerName="createPolygonOutlineGeometry",this.packedLength=O.PolygonGeometryLibrary.computeHierarchyPackedLength(i)+d.Ellipsoid.packedLength+8}f.pack=function(e,t,i){return i=m.defaultValue(i,0),i=O.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,i),d.Ellipsoid.pack(e._ellipsoid,t,i),i+=d.Ellipsoid.packedLength,t[i++]=e._height,t[i++]=e._extrudedHeight,t[i++]=e._granularity,t[i++]=e._perPositionHeightExtrude?1:0,t[i++]=e._perPositionHeight?1:0,t[i++]=e._arcType,t[i++]=m.defaultValue(e._offsetAttribute,-1),t[i]=e.packedLength,t};var c=d.Ellipsoid.clone(d.Ellipsoid.UNIT_SPHERE),g={polygonHierarchy:{}};return f.unpack=function(e,t,i){t=m.defaultValue(t,0);var r=O.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t);t=r.startingIndex,delete r.startingIndex;var o=d.Ellipsoid.unpack(e,t,c);t+=d.Ellipsoid.packedLength;var n=e[t++],a=e[t++],l=e[t++],s=1===e[t++],y=1===e[t++],u=e[t++],p=e[t++],t=e[t];return(i=!m.defined(i)?new f(g):i)._polygonHierarchy=r,i._ellipsoid=d.Ellipsoid.clone(o,i._ellipsoid),i._height=n,i._extrudedHeight=a,i._granularity=l,i._perPositionHeight=y,i._perPositionHeightExtrude=s,i._arcType=u,i._offsetAttribute=-1===p?void 0:p,i.packedLength=t,i},f.fromPositions=function(e){return new f({polygonHierarchy:{positions:(e=m.defaultValue(e,m.defaultValue.EMPTY_OBJECT)).positions},height:e.height,extrudedHeight:e.extrudedHeight,ellipsoid:e.ellipsoid,granularity:e.granularity,perPositionHeight:e.perPositionHeight,arcType:e.arcType,offsetAttribute:e.offsetAttribute})},f.createGeometry=function(e){var t=e._ellipsoid,i=e._granularity,r=e._polygonHierarchy,o=e._perPositionHeight,n=e._arcType,a=O.PolygonGeometryLibrary.polygonOutlinesFromHierarchy(r,!o,t);if(0!==a.length){var l,s,y,u,p,d,f=[],c=C.CesiumMath.chordLength(i,t.maximumRadius),g=e._height,h=e._extrudedHeight;if(e._perPositionHeightExtrude||!C.CesiumMath.equalsEpsilon(g,h,0,C.CesiumMath.EPSILON2))for(l=0;l<a.length;l++)(u=function(e,t,i,r,o){var n,a=_.EllipsoidTangentPlane.fromPoints(t,e).projectPointsOntoPlane(t,D);x.PolygonPipeline.computeWindingOrder2D(a)===x.WindingOrder.CLOCKWISE&&(a.reverse(),t=t.slice().reverse());var l=t.length,s=new Array(l),y=0;if(r)for(n=new Float64Array(2*l*3*2),b=0;b<l;++b){s[b]=y/3;var u=t[b],p=t[(b+1)%l];n[y++]=u.x,n[y++]=u.y,n[y++]=u.z,n[y++]=p.x,n[y++]=p.y,n[y++]=p.z}else{var d,f=0;if(o===E.ArcType.GEODESIC)for(b=0;b<l;b++)f+=O.PolygonGeometryLibrary.subdivideLineCount(t[b],t[(b+1)%l],i);else if(o===E.ArcType.RHUMB)for(b=0;b<l;b++)f+=O.PolygonGeometryLibrary.subdivideRhumbLineCount(e,t[b],t[(b+1)%l],i);for(n=new Float64Array(3*f*2),b=0;b<l;++b){s[b]=y/3,o===E.ArcType.GEODESIC?d=O.PolygonGeometryLibrary.subdivideLine(t[b],t[(b+1)%l],i,I):o===E.ArcType.RHUMB&&(d=O.PolygonGeometryLibrary.subdivideRhumbLine(e,t[b],t[(b+1)%l],i,I));for(var c=d.length,g=0;g<c;++g)n[y++]=d[g]}}for(var l=n.length/6,h=s.length,m=H.IndexDatatype.createTypedArray(l+h,2*(2*l+h)),y=0,b=0;b<l;++b)m[y++]=b,m[y++]=(b+1)%l,m[y++]=b+l,m[y++]=(b+1)%l+l;for(b=0;b<h;b++){var P=s[b];m[y++]=P,m[y++]=P+l}return new L.GeometryInstance({geometry:new v.Geometry({attributes:new G.GeometryAttributes({position:new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})}),indices:m,primitiveType:v.PrimitiveType.LINES})})}(t,a[l],c,o,n)).geometry=O.PolygonGeometryLibrary.scaleToGeodeticHeightExtruded(u.geometry,g,h,t,o),m.defined(e._offsetAttribute)&&(s=u.geometry.attributes.position.values.length/3,y=new Uint8Array(s),y=e._offsetAttribute===b.GeometryOffsetAttribute.TOP?b.arrayFill(y,1,0,s/2):(d=e._offsetAttribute===b.GeometryOffsetAttribute.NONE?0:1,b.arrayFill(y,d)),u.geometry.attributes.applyOffset=new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:y})),f.push(u);else for(l=0;l<a.length;l++)(u=function(e,t,i,r,o){var n,a=_.EllipsoidTangentPlane.fromPoints(t,e).projectPointsOntoPlane(t,D);x.PolygonPipeline.computeWindingOrder2D(a)===x.WindingOrder.CLOCKWISE&&(a.reverse(),t=t.slice().reverse());var l=t.length,s=0;if(r)for(n=new Float64Array(2*l*3),h=0;h<l;h++){var y=t[h],u=t[(h+1)%l];n[s++]=y.x,n[s++]=y.y,n[s++]=y.z,n[s++]=u.x,n[s++]=u.y,n[s++]=u.z}else{var p,d=0;if(o===E.ArcType.GEODESIC)for(h=0;h<l;h++)d+=O.PolygonGeometryLibrary.subdivideLineCount(t[h],t[(h+1)%l],i);else if(o===E.ArcType.RHUMB)for(h=0;h<l;h++)d+=O.PolygonGeometryLibrary.subdivideRhumbLineCount(e,t[h],t[(h+1)%l],i);for(n=new Float64Array(3*d),h=0;h<l;h++){o===E.ArcType.GEODESIC?p=O.PolygonGeometryLibrary.subdivideLine(t[h],t[(h+1)%l],i,I):o===E.ArcType.RHUMB&&(p=O.PolygonGeometryLibrary.subdivideRhumbLine(e,t[h],t[(h+1)%l],i,I));for(var f=p.length,c=0;c<f;++c)n[s++]=p[c]}}for(var l=n.length/3,g=H.IndexDatatype.createTypedArray(l,2*l),s=0,h=0;h<l-1;h++)g[s++]=h,g[s++]=h+1;return g[s++]=l-1,g[s++]=0,new L.GeometryInstance({geometry:new v.Geometry({attributes:new G.GeometryAttributes({position:new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})}),indices:g,primitiveType:v.PrimitiveType.LINES})})}(t,a[l],c,o,n)).geometry.attributes.position.values=x.PolygonPipeline.scaleToGeodeticHeight(u.geometry.attributes.position.values,g,t,!o),m.defined(e._offsetAttribute)&&(p=u.geometry.attributes.position.values.length,p=new Uint8Array(p/3),d=e._offsetAttribute===b.GeometryOffsetAttribute.NONE?0:1,b.arrayFill(p,d),u.geometry.attributes.applyOffset=new v.GeometryAttribute({componentDatatype:A.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:p})),f.push(u);r=T.GeometryPipeline.combineInstances(f)[0],i=P.BoundingSphere.fromVertices(r.attributes.position.values);return new v.Geometry({attributes:r.attributes,indices:r.indices,primitiveType:r.primitiveType,boundingSphere:i,offsetAttribute:e._offsetAttribute})}},function(e,t){return(e=m.defined(t)?f.unpack(e,t):e)._ellipsoid=d.Ellipsoid.clone(e._ellipsoid),f.createGeometry(e)}});
