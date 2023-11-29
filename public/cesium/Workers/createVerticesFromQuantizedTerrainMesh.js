define(["./AxisAlignedBoundingBox-3005be1a","./Cartesian2-078e6458","./when-ae2e0b60","./TerrainEncoding-7ea7a6aa","./IndexDatatype-516320ea","./Math-5bbcea10","./Transforms-5aeb1d5e","./Check-f996273c","./WebMercatorProjection-9d47817f","./createTaskProcessorWorker","./AttributeCompression-7a920947","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./combine-276652d0","./RuntimeError-ac2797b4"],function(te,re,ne,ie,oe,ae,se,e,de,t,r,n,i,o,a){"use strict";function ce(){e.DeveloperError.throwInstantiationError()}Object.defineProperties(ce.prototype,{errorEvent:{get:e.DeveloperError.throwInstantiationError},credit:{get:e.DeveloperError.throwInstantiationError},tilingScheme:{get:e.DeveloperError.throwInstantiationError},ready:{get:e.DeveloperError.throwInstantiationError},readyPromise:{get:e.DeveloperError.throwInstantiationError},hasWaterMask:{get:e.DeveloperError.throwInstantiationError},hasVertexNormals:{get:e.DeveloperError.throwInstantiationError},availability:{get:e.DeveloperError.throwInstantiationError}});var s=[],d=(ce.getRegularGridIndices=function(e,t){var r=s[e],n=(ne.defined(r)||(s[e]=r=[]),r[t]);return ne.defined(n)||g(e,t,n=e*t<ae.CesiumMath.SIXTY_FOUR_KILOBYTES?r[t]=new Uint16Array((e-1)*(t-1)*6):r[t]=new Uint32Array((e-1)*(t-1)*6),0),n},[]),I=(ce.getRegularGridIndicesAndEdgeIndices=function(e,t){var r,n,i,o,a=d[e],s=(ne.defined(a)||(d[e]=a=[]),a[t]);return ne.defined(s)||(r=ce.getRegularGridIndices(e,t),n=(e=l(e,t)).westIndicesSouthToNorth,i=e.southIndicesEastToWest,o=e.eastIndicesNorthToSouth,e=e.northIndicesWestToEast,s=a[t]={indices:r,westIndicesSouthToNorth:n,southIndicesEastToWest:i,eastIndicesNorthToSouth:o,northIndicesWestToEast:e}),s},[]);function l(e,t){for(var r=new Array(t),n=new Array(e),i=new Array(t),o=new Array(e),a=0;a<e;++a)n[o[a]=a]=e*t-1-a;for(a=0;a<t;++a)i[a]=(a+1)*e-1,r[a]=(t-a-1)*e;return{westIndicesSouthToNorth:r,southIndicesEastToWest:n,eastIndicesNorthToSouth:i,northIndicesWestToEast:o}}function g(e,t,r,n){for(var i=0,o=0;o<t-1;++o){for(var a=0;a<e-1;++a){var s=i,d=s+e,c=d+1,h=s+1;r[n++]=s,r[n++]=d,r[n++]=h,r[n++]=h,r[n++]=d,r[n++]=c,++i}++i}}function c(e,t,r,n){for(var i=e[0],o=e.length,a=1;a<o;++a){var s=e[a];r[n++]=i,r[n++]=s,r[n++]=t,r[n++]=t,r[n++]=s,r[n++]=t+1,i=s,++t}return n}ce.getRegularGridAndSkirtIndicesAndEdgeIndices=function(e,t){var r,n,i,o,a,s,d,c,h=I[e],u=(ne.defined(h)||(I[e]=h=[]),h[t]);return ne.defined(u)||(i=(r=e*t)+(o=2*e+2*t),o=(n=(e-1)*(t-1)*6)+6*Math.max(0,o-4),a=(c=l(e,t)).westIndicesSouthToNorth,s=c.southIndicesEastToWest,d=c.eastIndicesNorthToSouth,c=c.northIndicesWestToEast,g(e,t,e=oe.IndexDatatype.createTypedArray(i,o),0),ce.addSkirtIndices(a,s,d,c,r,e,n),u=h[t]={indices:e,westIndicesSouthToNorth:a,southIndicesEastToWest:s,eastIndicesNorthToSouth:d,northIndicesWestToEast:c,indexCountWithoutSkirts:n}),u},ce.addSkirtIndices=function(e,t,r,n,i,o,a){a=c(e,i,o,a),a=c(t,i+=e.length,o,a),a=c(r,i+=t.length,o,a),c(n,i+=r.length,o,a)},ce.heightmapTerrainQuality=.25,ce.getEstimatedLevelZeroGeometricErrorForAHeightmap=function(e,t,r){return 2*e.maximumRadius*Math.PI*ce.heightmapTerrainQuality/(t*r)},ce.prototype.requestTileGeometry=e.DeveloperError.throwInstantiationError,ce.prototype.getLevelMaximumGeometricError=e.DeveloperError.throwInstantiationError,ce.prototype.getTileDataAvailable=e.DeveloperError.throwInstantiationError,ce.prototype.loadTileDataAvailability=e.DeveloperError.throwInstantiationError;var he=32767,ue=new re.Cartesian3,Ie=new re.Cartesian3,le=new re.Cartesian3,ge=new re.Cartographic,me=new re.Cartesian2;function Te(e,t,r,n,i,o,a,s,d){for(var c=Number.POSITIVE_INFINITY,h=i.north,u=i.south,I=i.east,l=i.west,g=(I<l&&(I+=ae.CesiumMath.TWO_PI),e.length),m=0;m<g;++m){var T=e[m],E=r[T],T=n[T],T=(ge.longitude=ae.CesiumMath.lerp(l,I,T.x),ge.latitude=ae.CesiumMath.lerp(u,h,T.y),ge.height=E-t,o.cartographicToCartesian(ge,ue));se.Matrix4.multiplyByPoint(a,T,T),re.Cartesian3.minimumByComponent(T,s,s),re.Cartesian3.maximumByComponent(T,d,d),c=Math.min(c,ge.height)}return c}function Ee(e,t,r,n,i,o,a,s,d,c,h,u,I,l){for(var g=ne.defined(a),m=d.north,T=d.south,E=d.east,p=d.west,f=(E<p&&(E+=ae.CesiumMath.TWO_PI),r.length),y=0;y<f;++y){var N,w,v=r[y],S=i[v],M=o[v],S=(ge.longitude=ae.CesiumMath.lerp(p,E,M.x)+I,ge.latitude=ae.CesiumMath.lerp(T,m,M.y)+l,ge.height=S-c,s.cartographicToCartesian(ge,ue));g&&(me.x=a[v=2*v],me.y=a[1+v]),n.hasWebMercatorT&&(N=(de.WebMercatorProjection.geodeticLatitudeToMercatorAngle(ge.latitude)-h)*u),n.hasGeodeticSurfaceNormals&&(w=s.geodeticSurfaceNormal(S)),t=n.encode(e,t,S,M,ge.height,me,N,w)}}function pe(e,t){var r;return"function"==typeof e.slice&&"function"!=typeof(r=e.slice()).sort&&(r=void 0),(r=ne.defined(r)?r:Array.prototype.slice.call(e)).sort(t),r}return t(function(e,_){for(var t,r,n=(A=e.quantizedVertices).length/3,i=e.octEncodedNormals,o=e.westIndices.length+e.eastIndices.length+e.southIndices.length+e.northIndices.length,a=e.includeWebMercatorT,s=e.exaggeration,d=e.exaggerationRelativeHeight,c=1!==s,h=re.Rectangle.clone(e.rectangle),G=h.west,V=h.south,Y=h.east,O=h.north,u=re.Ellipsoid.clone(e.ellipsoid),I=e.minimumHeight,l=e.maximumHeight,g=e.relativeToCenter,m=se.Transforms.eastNorthUpToFixedFrame(g,u),T=se.Matrix4.inverseTransformation(m,new se.Matrix4),B=(a&&(t=de.WebMercatorProjection.geodeticLatitudeToMercatorAngle(V),r=1/(de.WebMercatorProjection.geodeticLatitudeToMercatorAngle(O)-t)),A.subarray(0,n)),R=A.subarray(n,2*n),L=A.subarray(2*n,3*n),j=ne.defined(i),E=new Array(n),p=new Array(n),f=new Array(n),U=a?new Array(n):[],z=c?new Array(n):[],y=Ie,N=(y.x=Number.POSITIVE_INFINITY,y.y=Number.POSITIVE_INFINITY,y.z=Number.POSITIVE_INFINITY,le),w=(N.x=Number.NEGATIVE_INFINITY,N.y=Number.NEGATIVE_INFINITY,N.z=Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY),v=Number.NEGATIVE_INFINITY,S=Number.POSITIVE_INFINITY,M=Number.NEGATIVE_INFINITY,b=0;b<n;++b){var x=B[b],C=R[b],x=x/he,C=C/he,q=ae.CesiumMath.lerp(I,l,L[b]/he),Q=(ge.longitude=ae.CesiumMath.lerp(G,Y,x),ge.latitude=ae.CesiumMath.lerp(V,O,C),ge.height=q,w=Math.min(ge.longitude,w),v=Math.max(ge.longitude,v),S=Math.min(ge.latitude,S),M=Math.max(ge.latitude,M),u.cartographicToCartesian(ge));E[b]=new re.Cartesian2(x,C),p[b]=q,f[b]=Q,a&&(U[b]=(de.WebMercatorProjection.geodeticLatitudeToMercatorAngle(ge.latitude)-t)*r),c&&(z[b]=u.geodeticSurfaceNormal(Q)),se.Matrix4.multiplyByPoint(T,Q,ue),re.Cartesian3.minimumByComponent(ue,y,y),re.Cartesian3.maximumByComponent(ue,N,N)}var K,A=pe(e.westIndices,function(e,t){return E[e].y-E[t].y}),X=pe(e.eastIndices,function(e,t){return E[t].y-E[e].y}),Z=pe(e.southIndices,function(e,t){return E[t].x-E[e].x}),J=pe(e.northIndices,function(e,t){return E[e].x-E[t].x}),W=(I<0&&(K=new ie.EllipsoidalOccluder(u).computeHorizonCullingPointPossiblyUnderEllipsoid(g,f,I)),Math.min(I,Te(e.westIndices,e.westSkirtHeight,p,E,h,u,T,y,N)));W=Math.min(W,Te(e.southIndices,e.southSkirtHeight,p,E,h,u,T,y,N)),W=Math.min(W,Te(e.eastIndices,e.eastSkirtHeight,p,E,h,u,T,y,N)),W=Math.min(W,Te(e.northIndices,e.northSkirtHeight,p,E,h,u,T,y,N));for(var $,P=new te.AxisAlignedBoundingBox(y,N,g),D=new ie.TerrainEncoding(g,P,W,l,m,j,a,c,s,d),P=D.stride,k=new Float32Array(n*P+o*P),ee=0,F=0;F<n;++F)j&&(me.x=i[$=2*F],me.y=i[1+$]),ee=D.encode(k,ee,f[F],E[F],p[F],me,U[F],z[F]);W=Math.max(0,2*(o-4)),m=e.indices.length+3*W;(s=oe.IndexDatatype.createTypedArray(n+o,m)).set(e.indices,0);var o=d=1e-4*(v-w),m=W=1e-4*(M-S),W=-W,H=n*P;return Ee(k,H,A,D,p,E,i,u,h,e.westSkirtHeight,t,r,-d,0),Ee(k,H+=e.westIndices.length*P,Z,D,p,E,i,u,h,e.southSkirtHeight,t,r,0,W),Ee(k,H+=e.southIndices.length*P,X,D,p,E,i,u,h,e.eastSkirtHeight,t,r,o,0),Ee(k,H+=e.eastIndices.length*P,J,D,p,E,i,u,h,e.northSkirtHeight,t,r,0,m),ce.addSkirtIndices(A,Z,X,J,n,s,e.indices.length),_.push(k.buffer,s.buffer),{vertices:k.buffer,indices:s.buffer,westIndicesSouthToNorth:A,southIndicesEastToWest:Z,eastIndicesNorthToSouth:X,northIndicesWestToEast:J,vertexStride:P,center:g,minimumHeight:I,maximumHeight:l,occludeePointInScaledSpace:K,encoding:D,indexCountWithoutSkirts:e.indices.length}})});
