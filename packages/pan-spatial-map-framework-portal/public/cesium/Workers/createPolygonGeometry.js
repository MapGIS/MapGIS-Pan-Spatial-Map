define(["./when-ae2e0b60","./Cartesian2-38b35910","./ArcType-1275a14e","./GeometryOffsetAttribute-b02d5bb9","./BoundingRectangle-74602a7c","./Transforms-07a9fab5","./Check-f996273c","./ComponentDatatype-e44126e4","./EllipsoidGeodesic-0207b202","./EllipsoidTangentPlane-19622103","./GeometryAttribute-586bf52c","./GeometryInstance-eab27e6b","./GeometryPipeline-88f05837","./IndexDatatype-516320ea","./Math-5bbcea10","./PolygonGeometryLibrary-86705dae","./PolygonPipeline-06aa4301","./VertexFormat-90d15264","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./AxisAlignedBoundingBox-d272def4","./IntersectionTests-f49c7cd3","./Plane-45ad3143","./AttributeCompression-25f42564","./EncodedCartesian3-d40e98d6","./arrayRemoveDuplicates-bdf50aa0","./EllipsoidRhumbLine-af7b5ebe","./GeometryAttributes-5ce4955a"],function(z,W,m,q,e,Y,t,K,y,E,U,G,O,V,j,A,F,f,o,r,a,i,n,s,l,u,p,g,d){"use strict";var Z=new W.Cartographic,J=new W.Cartographic;var D=new e.BoundingRectangle,X=new W.Cartesian3,$=new W.Cartesian3,ee=new W.Cartesian3,te=new W.Cartesian3,oe=new W.Cartesian3,re=new W.Cartesian3,ae=new W.Cartesian3,Q=new W.Cartesian3,ie=new W.Cartesian3,ne=new W.Cartesian2,se=new W.Cartesian2,le=new W.Cartesian3,ue=new Y.Quaternion,pe=new Y.Matrix3,ce=new Y.Matrix3;function L(e){var p,c,m,y,g,t=e.vertexFormat,d=e.geometry,h=e.shadowVolume,f=d.attributes.position.values,b=f.length,_=e.wall,P=e.top||_,v=e.bottom||_;if(t.st||t.normal||t.tangent||t.bitangent||h){var o,C,x=e.boundingRectangle,w=e.tangentPlane,T=e.ellipsoid,I=e.stRotation,A=e.perPositionHeight,E=ne,G=(E.x=x.x,E.y=x.y,t.st?new Float32Array(b/3*2):void 0),r=(t.normal&&(o=A&&P&&!_?d.attributes.normal.values:new Float32Array(b)),t.tangent?new Float32Array(b):void 0),O=t.bitangent?new Float32Array(b):void 0,V=h?new Float32Array(b):void 0,F=0,a=0,i=$,n=ee,D=te,L=!0,N=pe,H=ce,s=(H=0!==I?(C=Y.Quaternion.fromAxisAngle(w._plane.normal,I,ue),N=Y.Matrix3.fromQuaternion(C,N),C=Y.Quaternion.fromAxisAngle(w._plane.normal,-I,ue),Y.Matrix3.fromQuaternion(C,H)):(N=Y.Matrix3.clone(Y.Matrix3.IDENTITY,N),Y.Matrix3.clone(Y.Matrix3.IDENTITY,H)),0),R=0;P&&v&&(s=b/2,R=b/3,b/=2);for(var M=0;M<b;M+=3){var l,u,S,B,k=W.Cartesian3.fromArray(f,M,le);t.st&&(u=Y.Matrix3.multiplyByVector(N,k,X),u=T.scaleToGeodeticSurface(u,u),u=w.projectPointOntoPlane(u,se),W.Cartesian2.subtract(u,E,u),l=j.CesiumMath.clamp(u.x/x.width,0,1),u=j.CesiumMath.clamp(u.y/x.height,0,1),v&&(G[F+R]=l,G[F+1+R]=u),P&&(G[F]=l,G[F+1]=u),F+=2),(t.normal||t.tangent||t.bitangent||h)&&(l=a+1,u=a+2,_?(M+3<b&&(S=W.Cartesian3.fromArray(f,M+3,oe),L&&(B=W.Cartesian3.fromArray(f,M+b,re),A&&(p=k,c=S,m=B,g=void 0,p=(y=T).cartesianToCartographic(p,Z).height,(g=y.cartesianToCartographic(c,J)).height=p,y.cartographicToCartesian(g,c),(g=y.cartesianToCartographic(m,J)).height=p-100,y.cartographicToCartesian(g,m)),W.Cartesian3.subtract(S,k,S),W.Cartesian3.subtract(B,k,B),i=W.Cartesian3.normalize(W.Cartesian3.cross(B,S,i),i),L=!1),W.Cartesian3.equalsEpsilon(S,k,j.CesiumMath.EPSILON10)&&(L=!0)),(t.tangent||t.bitangent)&&(D=T.geodeticSurfaceNormal(k,D),t.tangent&&(n=W.Cartesian3.normalize(W.Cartesian3.cross(D,i,n),n)))):(i=T.geodeticSurfaceNormal(k,i),(t.tangent||t.bitangent)&&(A&&(ae=W.Cartesian3.fromArray(o,a,ae),Q=W.Cartesian3.cross(W.Cartesian3.UNIT_Z,ae,Q),Q=W.Cartesian3.normalize(Y.Matrix3.multiplyByVector(H,Q,Q),Q),t.bitangent&&(ie=W.Cartesian3.normalize(W.Cartesian3.cross(ae,Q,ie),ie))),n=W.Cartesian3.cross(W.Cartesian3.UNIT_Z,i,n),n=W.Cartesian3.normalize(Y.Matrix3.multiplyByVector(H,n,n),n),t.bitangent&&(D=W.Cartesian3.normalize(W.Cartesian3.cross(i,n,D),D)))),t.normal&&(e.wall?(o[a+s]=i.x,o[l+s]=i.y,o[u+s]=i.z):v&&(o[a+s]=-i.x,o[l+s]=-i.y,o[u+s]=-i.z),(P&&!A||_)&&(o[a]=i.x,o[l]=i.y,o[u]=i.z)),h&&(_&&(i=T.geodeticSurfaceNormal(k,i)),V[a+s]=-i.x,V[l+s]=-i.y,V[u+s]=-i.z),t.tangent&&(e.wall?(r[a+s]=n.x,r[l+s]=n.y,r[u+s]=n.z):v&&(r[a+s]=-n.x,r[l+s]=-n.y,r[u+s]=-n.z),P&&(A?(r[a]=Q.x,r[l]=Q.y,r[u]=Q.z):(r[a]=n.x,r[l]=n.y,r[u]=n.z))),t.bitangent&&(v&&(O[a+s]=D.x,O[l+s]=D.y,O[u+s]=D.z),P&&(A?(O[a]=ie.x,O[l]=ie.y,O[u]=ie.z):(O[a]=D.x,O[l]=D.y,O[u]=D.z))),a+=3)}t.st&&(d.attributes.st=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:G})),t.normal&&(d.attributes.normal=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:o})),t.tangent&&(d.attributes.tangent=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:r})),t.bitangent&&(d.attributes.bitangent=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:O})),h&&(d.attributes.extrudeDirection=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:V}))}return e.extrude&&z.defined(e.offsetAttribute)&&(I=f.length/3,C=new Uint8Array(I),e.offsetAttribute===q.GeometryOffsetAttribute.TOP?P&&v||_?C=q.arrayFill(C,1,0,I/2):P&&(C=q.arrayFill(C,1)):(I=e.offsetAttribute===q.GeometryOffsetAttribute.NONE?0:1,C=q.arrayFill(C,I)),d.attributes.applyOffset=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:C})),d}var h=new W.Cartographic,_=new W.Cartographic,c={westOverIDL:0,eastOverIDL:0},P=new y.EllipsoidGeodesic;function v(e,t,o,r,a){if(a=z.defaultValue(a,new W.Rectangle),!z.defined(e)||e.length<3)return a.west=0,a.north=0,a.south=0,a.east=0,a;if(o===m.ArcType.RHUMB)return W.Rectangle.fromCartesianArray(e,t,a);P.ellipsoid.equals(t)||(P=new y.EllipsoidGeodesic(void 0,void 0,t)),a.west=Number.POSITIVE_INFINITY,a.east=Number.NEGATIVE_INFINITY,a.south=Number.POSITIVE_INFINITY,a.north=Number.NEGATIVE_INFINITY,c.westOverIDL=Number.POSITIVE_INFINITY,c.eastOverIDL=Number.NEGATIVE_INFINITY;for(var i,n=1/j.CesiumMath.chordLength(r,t.maximumRadius),p=e.length,s=t.cartesianToCartographic(e[0],_),l=h,u=1;u<p;u++)i=l,l=s,s=t.cartesianToCartographic(e[u],i),P.setEndPoints(l,s),x(P,n,a,c);return i=l,l=s,s=t.cartesianToCartographic(e[0],i),P.setEndPoints(l,s),x(P,n,a,c),a.east-a.west>c.eastOverIDL-c.westOverIDL&&(a.west=c.westOverIDL,a.east=c.eastOverIDL,a.east>j.CesiumMath.PI&&(a.east=a.east-j.CesiumMath.TWO_PI),a.west>j.CesiumMath.PI&&(a.west=a.west-j.CesiumMath.TWO_PI)),a}var C=new W.Cartographic;function x(e,t,o,r){for(var a=e.surfaceDistance,i=Math.ceil(a*t),p=0<i?a/(i-1):Number.POSITIVE_INFINITY,n=0,s=0;s<i;s++){var l=e.interpolateUsingSurfaceDistance(n,C),u=(n+=p,l.longitude),l=l.latitude,l=(o.west=Math.min(o.west,u),o.east=Math.max(o.east,u),o.south=Math.min(o.south,l),o.north=Math.max(o.north,l),0<=u?u:u+j.CesiumMath.TWO_PI);r.westOverIDL=Math.min(r.westOverIDL,l),r.eastOverIDL=Math.max(r.eastOverIDL,l)}}var N=[];function b(e){var t,o=e.polygonHierarchy,r=z.defaultValue(e.vertexFormat,f.VertexFormat.DEFAULT),a=z.defaultValue(e.ellipsoid,W.Ellipsoid.WGS84),i=z.defaultValue(e.granularity,j.CesiumMath.RADIANS_PER_DEGREE),p=z.defaultValue(e.stRotation,0),n=z.defaultValue(e.perPositionHeight,!1),s=n&&z.defined(e.extrudedHeight),l=z.defaultValue(e.height,0),u=z.defaultValue(e.extrudedHeight,l);s||(t=Math.max(l,u),u=Math.min(l,u),l=t),this._vertexFormat=f.VertexFormat.clone(r),this._ellipsoid=W.Ellipsoid.clone(a),this._granularity=i,this._stRotation=p,this._height=l,this._extrudedHeight=u,this._closeTop=z.defaultValue(e.closeTop,!0),this._closeBottom=z.defaultValue(e.closeBottom,!0),this._polygonHierarchy=o,this._perPositionHeight=n,this._perPositionHeightExtrude=s,this._shadowVolume=z.defaultValue(e.shadowVolume,!1),this._workerName="createPolygonGeometry",this._offsetAttribute=e.offsetAttribute,this._arcType=z.defaultValue(e.arcType,m.ArcType.GEODESIC),this._rectangle=void 0,this._textureCoordinateRotationPoints=void 0,this.packedLength=A.PolygonGeometryLibrary.computeHierarchyPackedLength(o)+W.Ellipsoid.packedLength+f.VertexFormat.packedLength+12}b.fromPositions=function(e){return new b({polygonHierarchy:{positions:(e=z.defaultValue(e,z.defaultValue.EMPTY_OBJECT)).positions},height:e.height,extrudedHeight:e.extrudedHeight,vertexFormat:e.vertexFormat,stRotation:e.stRotation,ellipsoid:e.ellipsoid,granularity:e.granularity,perPositionHeight:e.perPositionHeight,closeTop:e.closeTop,closeBottom:e.closeBottom,offsetAttribute:e.offsetAttribute,arcType:e.arcType})},b.pack=function(e,t,o){return o=z.defaultValue(o,0),o=A.PolygonGeometryLibrary.packPolygonHierarchy(e._polygonHierarchy,t,o),W.Ellipsoid.pack(e._ellipsoid,t,o),o+=W.Ellipsoid.packedLength,f.VertexFormat.pack(e._vertexFormat,t,o),o+=f.VertexFormat.packedLength,t[o++]=e._height,t[o++]=e._extrudedHeight,t[o++]=e._granularity,t[o++]=e._stRotation,t[o++]=e._perPositionHeightExtrude?1:0,t[o++]=e._perPositionHeight?1:0,t[o++]=e._closeTop?1:0,t[o++]=e._closeBottom?1:0,t[o++]=e._shadowVolume?1:0,t[o++]=z.defaultValue(e._offsetAttribute,-1),t[o++]=e._arcType,t[o]=e.packedLength,t};var w=W.Ellipsoid.clone(W.Ellipsoid.UNIT_SPHERE),T=new f.VertexFormat,I={polygonHierarchy:{}};return b.unpack=function(e,t,o){t=z.defaultValue(t,0);var r=A.PolygonGeometryLibrary.unpackPolygonHierarchy(e,t),a=(t=r.startingIndex,delete r.startingIndex,W.Ellipsoid.unpack(e,t,w)),i=(t+=W.Ellipsoid.packedLength,f.VertexFormat.unpack(e,t,T)),n=(t+=f.VertexFormat.packedLength,e[t++]),s=e[t++],l=e[t++],p=e[t++],c=1===e[t++],m=1===e[t++],y=1===e[t++],g=1===e[t++],d=1===e[t++],u=e[t++],h=e[t++],e=e[t];return(o=z.defined(o)?o:new b(I))._polygonHierarchy=r,o._ellipsoid=W.Ellipsoid.clone(a,o._ellipsoid),o._vertexFormat=f.VertexFormat.clone(i,o._vertexFormat),o._height=n,o._extrudedHeight=s,o._granularity=l,o._stRotation=p,o._perPositionHeightExtrude=c,o._perPositionHeight=m,o._closeTop=y,o._closeBottom=g,o._shadowVolume=d,o._offsetAttribute=-1===u?void 0:u,o._arcType=h,o.packedLength=e,o},b.computeRectangle=function(e,t){var o=z.defaultValue(e.granularity,j.CesiumMath.RADIANS_PER_DEGREE),r=z.defaultValue(e.arcType,m.ArcType.GEODESIC),a=e.polygonHierarchy,e=z.defaultValue(e.ellipsoid,W.Ellipsoid.WGS84);return v(a.positions,e,r,o,t)},b.createGeometry=function(e){var p=e._vertexFormat,t=e._ellipsoid,c=e._granularity,m=e._stRotation,o=e._polygonHierarchy,r=e._perPositionHeight,y=e._closeTop,g=e._closeBottom,d=e._arcType;if(!((n=o.positions).length<3)){var a=E.EllipsoidTangentPlane.fromPoints(n,t),o=A.PolygonGeometryLibrary.polygonsFromHierarchy(o,a.projectPointsOntoPlane.bind(a),!r,t),h=o.hierarchy,f=o.polygons;if(0!==h.length){var i,n=h[0].outerRing,o=A.PolygonGeometryLibrary.computeBoundingRectangle(a.plane.normal,a.projectPointOntoPlane.bind(a),n,m,D),b=[],_=e._height,P=e._extrudedHeight,s={perPositionHeight:r,vertexFormat:p,geometry:void 0,tangentPlane:a,boundingRectangle:o,ellipsoid:t,stRotation:m,bottom:!1,top:!0,wall:!1,extrude:!1,arcType:d};if(e._perPositionHeightExtrude||!j.CesiumMath.equalsEpsilon(_,P,0,j.CesiumMath.EPSILON2))for(s.extrude=!0,s.top=y,s.bottom=g,s.shadowVolume=e._shadowVolume,s.offsetAttribute=e._offsetAttribute,i=0;i<f.length;i++){var l,v=function(e,t,p,c,o,r,m,a,y){var i={walls:[]};if(r||m){var t=A.PolygonGeometryLibrary.createGeometryFromPositions(e,t,p,o,a,y),g=t.attributes.position.values,n=t.indices;if(r&&m){for(var s,r=g.concat(g),d=r.length/3,h=((s=V.IndexDatatype.createTypedArray(d,2*n.length)).set(n),n.length),f=d/2,l=0;l<h;l+=3){var b=s[l]+f,_=s[l+1]+f,P=s[l+2]+f;s[l+h]=P,s[l+1+h]=_,s[l+2+h]=b}t.attributes.position.values=r,o&&a.normal&&(a=t.attributes.normal.values,t.attributes.normal.values=new Float32Array(r.length),t.attributes.normal.values.set(a)),t.indices=s}else if(m){for(d=g.length/3,s=V.IndexDatatype.createTypedArray(d,n.length),l=0;l<n.length;l+=3)s[l]=n[l+2],s[l+1]=n[l+1],s[l+2]=n[l];t.indices=s}i.topAndBottom=new G.GeometryInstance({geometry:t})}var r=c.outerRing,v=E.EllipsoidTangentPlane.fromPoints(r,e).projectPointsOntoPlane(r,N),C=(F.PolygonPipeline.computeWindingOrder2D(v)===F.WindingOrder.CLOCKWISE&&(r=r.slice().reverse()),A.PolygonGeometryLibrary.computeWallGeometry(r,e,p,o,y)),x=(i.walls.push(new G.GeometryInstance({geometry:C})),c.holes);for(l=0;l<x.length;l++){var u=x[l],v=E.EllipsoidTangentPlane.fromPoints(u,e).projectPointsOntoPlane(u,N);F.PolygonPipeline.computeWindingOrder2D(v)===F.WindingOrder.COUNTER_CLOCKWISE&&(u=u.slice().reverse()),C=A.PolygonGeometryLibrary.computeWallGeometry(u,e,p,o,y),i.walls.push(new G.GeometryInstance({geometry:C}))}return i}(t,f[i],c,h[i],r,y,g,p,d),C=(y&&g?(l=v.topAndBottom,s.geometry=A.PolygonGeometryLibrary.scaleToGeodeticHeightExtruded(l.geometry,_,P,t,r)):y?((l=v.topAndBottom).geometry.attributes.position.values=F.PolygonPipeline.scaleToGeodeticHeight(l.geometry.attributes.position.values,_,t,!r),s.geometry=l.geometry):g&&((l=v.topAndBottom).geometry.attributes.position.values=F.PolygonPipeline.scaleToGeodeticHeight(l.geometry.attributes.position.values,P,t,!0),s.geometry=l.geometry),(y||g)&&(s.wall=!1,l.geometry=L(s),b.push(l)),v.walls);s.wall=!0;for(var x=0;x<C.length;x++){var w=C[x];s.geometry=A.PolygonGeometryLibrary.scaleToGeodeticHeightExtruded(w.geometry,_,P,t,r),w.geometry=L(s),b.push(w)}}else for(i=0;i<f.length;i++){var T,I,u=new G.GeometryInstance({geometry:A.PolygonGeometryLibrary.createGeometryFromPositions(t,f[i],c,r,p,d)});u.geometry.attributes.position.values=F.PolygonPipeline.scaleToGeodeticHeight(u.geometry.attributes.position.values,_,t,!r),s.geometry=u.geometry,u.geometry=L(s),z.defined(e._offsetAttribute)&&(T=u.geometry.attributes.position.values.length,T=new Uint8Array(T/3),I=e._offsetAttribute===q.GeometryOffsetAttribute.NONE?0:1,q.arrayFill(T,I),u.geometry.attributes.applyOffset=new U.GeometryAttribute({componentDatatype:K.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:T})),b.push(u)}n=O.GeometryPipeline.combineInstances(b)[0],a=(n.attributes.position.values=new Float64Array(n.attributes.position.values),n.indices=V.IndexDatatype.createTypedArray(n.attributes.position.values.length/3,n.indices),n.attributes),o=Y.BoundingSphere.fromVertices(a.position.values);return p.position||delete a.position,new U.Geometry({attributes:a,indices:n.indices,primitiveType:n.primitiveType,boundingSphere:o,offsetAttribute:e._offsetAttribute})}}},b.createShadowVolume=function(e,t,o){var r=e._granularity,a=e._ellipsoid,t=t(r,a),o=o(r,a);return new b({polygonHierarchy:e._polygonHierarchy,ellipsoid:a,stRotation:e._stRotation,granularity:r,perPositionHeight:!1,extrudedHeight:t,height:o,vertexFormat:f.VertexFormat.POSITION_ONLY,shadowVolume:!0,arcType:e._arcType})},Object.defineProperties(b.prototype,{rectangle:{get:function(){var e;return z.defined(this._rectangle)||(e=this._polygonHierarchy.positions,this._rectangle=v(e,this._ellipsoid,this._arcType,this._granularity)),this._rectangle}},textureCoordinateRotationPoints:{get:function(){return z.defined(this._textureCoordinateRotationPoints)||(this._textureCoordinateRotationPoints=function(e){var t=-e._stRotation;if(0==t)return[0,0,0,1,1,0];var o=e._ellipsoid,r=e._polygonHierarchy.positions,e=e.rectangle;return U.Geometry._textureCoordinateRotationPoints(r,t,o,e)}(this)),this._textureCoordinateRotationPoints}}}),function(e,t){return(e=z.defined(t)?b.unpack(e,t):e)._ellipsoid=W.Ellipsoid.clone(e._ellipsoid),b.createGeometry(e)}});
