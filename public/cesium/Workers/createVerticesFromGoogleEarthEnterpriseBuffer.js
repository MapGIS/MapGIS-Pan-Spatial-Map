define(["./AxisAlignedBoundingBox-83842dab","./Transforms-cdfd3fe7","./Cartesian2-38b35910","./when-ae2e0b60","./TerrainEncoding-f8dd5478","./Math-5bbcea10","./OrientedBoundingBox-d889307f","./RuntimeError-ac2797b4","./WebMercatorProjection-cf614542","./createTaskProcessorWorker","./Check-f996273c","./combine-276652d0","./AttributeCompression-25f42564","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-98d5e01c","./IntersectionTests-78298c28","./Plane-457b12fd"],function(Te,Ce,Me,xe,Ne,be,ve,Se,we,e,t,i,n,r,a,o,s,u){"use strict";var Be=Uint16Array.BYTES_PER_ELEMENT,Pe=Int32Array.BYTES_PER_ELEMENT,Ae=Uint32Array.BYTES_PER_ELEMENT,ye=Float32Array.BYTES_PER_ELEMENT,Re=Float64Array.BYTES_PER_ELEMENT;function _e(e,t,i){i=xe.defaultValue(i,be.CesiumMath);for(var n=e.length,r=0;r<n;++r)if(i.equalsEpsilon(e[r],t,be.CesiumMath.EPSILON12))return r;return-1}var We=new Me.Cartographic,Fe=new Me.Cartesian3,Oe=new Me.Cartesian3,Ye=new Me.Cartesian3,ke=new Ce.Matrix4;function Ue(e,t,i,n,r,a,o,s,u,h,c){for(var d=s.length,g=0;g<d;++g){var l=s[g],m=l.cartographic,p=l.index,I=e.length,E=m.longitude,f=m.latitude,f=be.CesiumMath.clamp(f,-be.CesiumMath.PI_OVER_TWO,be.CesiumMath.PI_OVER_TWO),m=m.height-o.skirtHeight,E=(o.hMin=Math.min(o.hMin,m),Me.Cartographic.fromRadians(E,f,m,We),h&&(We.longitude+=u),h?g===d-1?We.latitude+=c:0===g&&(We.latitude-=c):We.latitude+=u,o.ellipsoid.cartographicToCartesian(We)),f=(e.push(E),t.push(m),i.push(Me.Cartesian2.clone(i[p])),0<n.length&&n.push(n[p]),0<r.length&&r.push(r[p]),Ce.Matrix4.multiplyByPoint(o.toENU,E,Fe),o.minimum),m=o.maximum,E=(Me.Cartesian3.minimumByComponent(Fe,f,f),Me.Cartesian3.maximumByComponent(Fe,m,m),o.lastBorderPoint);xe.defined(E)&&(f=E.index,a.push(f,I-1,I,I,p,f)),o.lastBorderPoint=l}}return e(function(e,t){e.ellipsoid=Me.Ellipsoid.clone(e.ellipsoid),e.rectangle=Me.Rectangle.clone(e.rectangle);var i=(e=function(O,e,t,i,n,Y,k,r,a,U,V){var o,s,u,h;n=xe.defined(i)?(o=i.west,s=i.south,u=i.east,h=i.north,W=i.width,i.height):(o=be.CesiumMath.toRadians(n.west),s=be.CesiumMath.toRadians(n.south),u=be.CesiumMath.toRadians(n.east),h=be.CesiumMath.toRadians(n.north),W=be.CesiumMath.toRadians(i.width),be.CesiumMath.toRadians(i.height));var H,L,D=[s,h],G=[o,u],j=Ce.Transforms.eastNorthUpToFixedFrame(e,t),z=Ce.Matrix4.inverseTransformation(j,ke);a&&(H=we.WebMercatorProjection.geodeticLatitudeToMercatorAngle(s),L=1/(we.WebMercatorProjection.geodeticLatitudeToMercatorAngle(h)-H));var q,c,J=1!==Y,d=new DataView(O),g=Number.POSITIVE_INFINITY,l=Number.NEGATIVE_INFINITY,m=Oe,p=(m.x=Number.POSITIVE_INFINITY,m.y=Number.POSITIVE_INFINITY,m.z=Number.POSITIVE_INFINITY,Ye),I=(p.x=Number.NEGATIVE_INFINITY,p.y=Number.NEGATIVE_INFINITY,p.z=Number.NEGATIVE_INFINITY,0),E=0,K=0;for(c=0;c<4;++c){var f=I,T=(q=d.getUint32(f,!0),f+=Ae,be.CesiumMath.toRadians(180*d.getFloat64(f,!0))),T=(f+=Re,-1===_e(G,T)&&G.push(T),be.CesiumMath.toRadians(180*d.getFloat64(f,!0))),T=(f+=Re,-1===_e(D,T)&&D.push(T),f+=2*Re,d.getInt32(f,!0));f+=Pe,E+=T,T=d.getInt32(f,!0),K+=3*T,I+=q+Ae}var Q=[],X=[],C=new Array(E),M=new Array(E),x=new Array(E),N=a?new Array(E):[],b=J?new Array(E):[],v=new Array(K),S=[],Z=[],$=[],w=[],B=0,ee=0;for(c=I=0;c<4;++c){q=d.getUint32(I,!0);for(var te=I+=Ae,ie=be.CesiumMath.toRadians(180*d.getFloat64(I,!0)),ne=(I+=Re,be.CesiumMath.toRadians(180*d.getFloat64(I,!0))),re=(I+=Re,be.CesiumMath.toRadians(180*d.getFloat64(I,!0))),ae=.5*re,oe=(I+=Re,be.CesiumMath.toRadians(180*d.getFloat64(I,!0))),se=.5*oe,ue=(I+=Re,d.getInt32(I,!0)),he=(I+=Pe,d.getInt32(I,!0)),ce=(I=I+Pe+Pe,new Array(ue)),de=0;de<ue;++de){var P=ie+d.getUint8(I++)*re,A=(We.longitude=P,ne+d.getUint8(I++)*oe),y=(We.latitude=A,d.getFloat32(I,!0));if(I+=ye,0!==y&&y<V&&(y*=-Math.pow(2,U)),y*=6371010,We.height=y,-1!==_e(G,P)||-1!==_e(D,A)){var R=_e(Q,We,Me.Cartographic);if(-1!==R){ce[de]=X[R];continue}Q.push(Me.Cartographic.clone(We)),X.push(B)}ce[de]=B,Math.abs(P-o)<ae?S.push({index:B,cartographic:Me.Cartographic.clone(We)}):Math.abs(P-u)<ae?$.push({index:B,cartographic:Me.Cartographic.clone(We)}):Math.abs(A-s)<se?Z.push({index:B,cartographic:Me.Cartographic.clone(We)}):Math.abs(A-h)<se&&w.push({index:B,cartographic:Me.Cartographic.clone(We)}),g=Math.min(y,g),l=Math.max(y,l),x[B]=y;R=t.cartographicToCartesian(We),y=(C[B]=R,a&&(N[B]=(we.WebMercatorProjection.geodeticLatitudeToMercatorAngle(A)-H)*L),J&&(y=t.geodeticSurfaceNormal(R),b[B]=y),Ce.Matrix4.multiplyByPoint(z,R,Fe),Me.Cartesian3.minimumByComponent(Fe,m,m),Me.Cartesian3.maximumByComponent(Fe,p,p),(P-o)/(u-o)),P=(y=be.CesiumMath.clamp(y,0,1),(A-s)/(h-s));P=be.CesiumMath.clamp(P,0,1),M[B]=new Me.Cartesian2(y,P),++B}for(var ge=3*he,le=0;le<ge;++le,++ee)v[ee]=ce[d.getUint16(I,!0)],I+=Be;if(q!==I-te)throw new Se.RuntimeError("Invalid terrain tile.")}C.length=B,M.length=B,x.length=B,a&&(N.length=B);J&&(b.length=B);var O=B,me=ee,r={hMin:g,lastBorderPoint:void 0,skirtHeight:r,toENU:z,ellipsoid:t,minimum:m,maximum:p},_=(S.sort(function(e,t){return t.cartographic.latitude-e.cartographic.latitude}),Z.sort(function(e,t){return e.cartographic.longitude-t.cartographic.longitude}),$.sort(function(e,t){return e.cartographic.latitude-t.cartographic.latitude}),w.sort(function(e,t){return t.cartographic.longitude-e.cartographic.longitude}),1e-5);Ue(C,x,M,N,b,v,r,S,-_*W,!0,-_*n),Ue(C,x,M,N,b,v,r,Z,-_*n,!1),Ue(C,x,M,N,b,v,r,$,_*W,!0,_*n),Ue(C,x,M,N,b,v,r,w,_*n,!1),0<S.length&&0<w.length&&(W=S[0].index,_=w[w.length-1].index,n=C.length-1,v.push(_,n,O,O,W,_));E=C.length;var pe,n=Ce.BoundingSphere.fromPoints(C);xe.defined(i)&&(pe=ve.OrientedBoundingBox.fromRectangle(i,g,l,t));for(var W=new Ne.EllipsoidalOccluder(t).computeHorizonCullingPointPossiblyUnderEllipsoid(e,C,g),_=new Te.AxisAlignedBoundingBox(m,p,e),Ie=new Ne.TerrainEncoding(e,_,r.hMin,l,j,!1,a,J,Y,k),Ee=new Float32Array(E*Ie.stride),fe=0,F=0;F<E;++F)fe=Ie.encode(Ee,fe,C[F],M[F],x[F],void 0,N[F],b[F]);i=S.map(function(e){return e.index}).reverse(),e=Z.map(function(e){return e.index}).reverse(),_=$.map(function(e){return e.index}).reverse(),r=w.map(function(e){return e.index}).reverse();return e.unshift(_[_.length-1]),e.push(i[0]),r.unshift(i[i.length-1]),r.push(_[0]),{vertices:Ee,indices:new Uint16Array(v),maximumHeight:l,minimumHeight:g,encoding:Ie,boundingSphere3D:n,orientedBoundingBox:pe,occludeePointInScaledSpace:W,vertexCountWithoutSkirts:O,indexCountWithoutSkirts:me,westIndicesSouthToNorth:i,southIndicesEastToWest:e,eastIndicesNorthToSouth:_,northIndicesWestToEast:r}}(e.buffer,e.relativeToCenter,e.ellipsoid,e.rectangle,e.nativeRectangle,e.exaggeration,e.exaggerationRelativeHeight,e.skirtHeight,e.includeWebMercatorT,e.negativeAltitudeExponentBias,e.negativeElevationThreshold)).vertices,n=(t.push(i.buffer),e.indices);return t.push(n.buffer),{vertices:i.buffer,indices:n.buffer,numberOfAttributes:e.encoding.stride,minimumHeight:e.minimumHeight,maximumHeight:e.maximumHeight,boundingSphere3D:e.boundingSphere3D,orientedBoundingBox:e.orientedBoundingBox,occludeePointInScaledSpace:e.occludeePointInScaledSpace,encoding:e.encoding,vertexCountWithoutSkirts:e.vertexCountWithoutSkirts,indexCountWithoutSkirts:e.indexCountWithoutSkirts,westIndicesSouthToNorth:e.westIndicesSouthToNorth,southIndicesEastToWest:e.southIndicesEastToWest,eastIndicesNorthToSouth:e.eastIndicesNorthToSouth,northIndicesWestToEast:e.northIndicesWestToEast}})});
