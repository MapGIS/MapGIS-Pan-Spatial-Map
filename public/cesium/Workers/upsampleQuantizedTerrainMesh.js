define(["./AttributeCompression-25f42564","./Transforms-cdfd3fe7","./Cartesian2-38b35910","./when-ae2e0b60","./TerrainEncoding-f8dd5478","./IndexDatatype-516320ea","./Check-f996273c","./Math-5bbcea10","./OrientedBoundingBox-d889307f","./createTaskProcessorWorker","./combine-276652d0","./RuntimeError-ac2797b4","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-98d5e01c","./AxisAlignedBoundingBox-83842dab","./IntersectionTests-78298c28","./Plane-457b12fd"],function(s,ue,oe,g,de,pe,n,ae,fe,e,o,d,p,a,f,l,c,x){"use strict";var le={clipTriangleAtAxisAlignedThreshold:function(e,t,i,n,s,r){g.defined(r)?r.length=0:r=[],t=t?(h=i<e,u=n<e,s<e):(h=e<i,u=e<n,e<s);var h,u,o,d,p,a,f,l,c=h+u+t;return 1===c?h?(o=(e-i)/(n-i),d=(e-i)/(s-i),r.push(1),r.push(2),1!==d&&(r.push(-1),r.push(0),r.push(2),r.push(d)),1!==o&&(r.push(-1),r.push(0),r.push(1),r.push(o))):u?(p=(e-n)/(s-n),a=(e-n)/(i-n),r.push(2),r.push(0),1!==a&&(r.push(-1),r.push(1),r.push(0),r.push(a)),1!==p&&(r.push(-1),r.push(1),r.push(2),r.push(p))):t&&(f=(e-s)/(i-s),l=(e-s)/(n-s),r.push(0),r.push(1),1!==l&&(r.push(-1),r.push(2),r.push(1),r.push(l)),1!==f)&&(r.push(-1),r.push(2),r.push(0),r.push(f)):2===c?h||i===e?u||n===e?t||s===e||(d=(e-i)/(s-i),p=(e-n)/(s-n),r.push(2),r.push(-1),r.push(0),r.push(2),r.push(d),r.push(-1),r.push(1),r.push(2),r.push(p)):(l=(e-s)/(n-s),o=(e-i)/(n-i),r.push(1),r.push(-1),r.push(2),r.push(1),r.push(l),r.push(-1),r.push(0),r.push(1),r.push(o)):(a=(e-n)/(i-n),f=(e-s)/(i-s),r.push(0),r.push(-1),r.push(1),r.push(0),r.push(a),r.push(-1),r.push(2),r.push(0),r.push(f)):3!==c&&(r.push(0),r.push(1),r.push(2)),r},computeBarycentricCoordinates:function(e,t,i,n,s,r,h,u,o){var i=i-h,s=h-s,r=r-u,n=n-u,d=1/(r*i+s*n),t=t-u,u=e-h,e=(r*u+s*t)*d,h=(-n*u+i*t)*d,r=1-e-h;return g.defined(o)?(o.x=e,o.y=h,o.z=r,o):new oe.Cartesian3(e,h,r)},computeLineSegmentLineSegmentIntersection:function(e,t,i,n,s,r,h,u,o){var d=(h-s)*(t-r)-(u-r)*(e-s),p=(i-e)*(t-r)-(n-t)*(e-s),u=(u-r)*(i-e)-(h-s)*(n-t);if(0!=u)return r=p/u,0<=(h=d/u)&&h<=1&&0<=r&&r<=1?((o=g.defined(o)?o:new oe.Cartesian2).x=e+h*(i-e),o.y=t+h*(n-t),o):void 0}},ce=32767,ge=16383,me=[],xe=[],we=[],Ce=new oe.Cartographic,ve=new oe.Cartesian3,Be=[],ye=[],Ie=[],Ae=[],be=[],Te=new oe.Cartesian3,ze=new ue.BoundingSphere,Me=new fe.OrientedBoundingBox,Ne=new oe.Cartesian2,Ve=new oe.Cartesian3;function Ee(){this.vertexBuffer=void 0,this.index=void 0,this.first=void 0,this.second=void 0,this.ratio=void 0}Ee.prototype.clone=function(e){return(e=g.defined(e)?e:new Ee).uBuffer=this.uBuffer,e.vBuffer=this.vBuffer,e.heightBuffer=this.heightBuffer,e.normalBuffer=this.normalBuffer,e.index=this.index,e.first=this.first,e.second=this.second,e.ratio=this.ratio,e},Ee.prototype.initializeIndexed=function(e,t,i,n,s){this.uBuffer=e,this.vBuffer=t,this.heightBuffer=i,this.normalBuffer=n,this.index=s,this.first=void 0,this.second=void 0,this.ratio=void 0},Ee.prototype.initializeFromClipResult=function(e,t,i){var n=t+1;return-1!==e[t]?i[e[t]].clone(this):(this.vertexBuffer=void 0,this.index=void 0,this.first=i[e[n]],this.second=i[e[++n]],this.ratio=e[++n],++n),n},Ee.prototype.getKey=function(){return this.isIndexed()?this.index:JSON.stringify({first:this.first.getKey(),second:this.second.getKey(),ratio:this.ratio})},Ee.prototype.isIndexed=function(){return g.defined(this.index)},Ee.prototype.getH=function(){return g.defined(this.index)?this.heightBuffer[this.index]:ae.CesiumMath.lerp(this.first.getH(),this.second.getH(),this.ratio)},Ee.prototype.getU=function(){return g.defined(this.index)?this.uBuffer[this.index]:ae.CesiumMath.lerp(this.first.getU(),this.second.getU(),this.ratio)},Ee.prototype.getV=function(){return g.defined(this.index)?this.vBuffer[this.index]:ae.CesiumMath.lerp(this.first.getV(),this.second.getV(),this.ratio)};var t=new oe.Cartesian2,r=-1,h=[new oe.Cartesian3,new oe.Cartesian3],u=[new oe.Cartesian3,new oe.Cartesian3];function i(e,t){var i=h[++r],n=u[r],i=s.AttributeCompression.octDecode(e.first.getNormalX(),e.first.getNormalY(),i),n=s.AttributeCompression.octDecode(e.second.getNormalX(),e.second.getNormalY(),n);return ve=oe.Cartesian3.lerp(i,n,e.ratio,ve),oe.Cartesian3.normalize(ve,ve),s.AttributeCompression.octEncode(ve,t),--r,t}Ee.prototype.getNormalX=function(){return g.defined(this.index)?this.normalBuffer[2*this.index]:(t=i(this,t)).x},Ee.prototype.getNormalY=function(){return g.defined(this.index)?this.normalBuffer[2*this.index+1]:(t=i(this,t)).y};var m=[];function Re(e,t,i,n,s,r,h,u,o){if(0!==h.length){for(var d=0,p=0;p<h.length;)p=m[d++].initializeFromClipResult(h,p,u);for(var a=0;a<d;++a){var f,l,c=m[a];c.isIndexed()?(c.newIndex=r[c.index],c.uBuffer=e,c.vBuffer=t,c.heightBuffer=i,o&&(c.normalBuffer=n)):(f=c.getKey(),g.defined(r[f])?c.newIndex=r[f]:(l=e.length,e.push(c.getU()),t.push(c.getV()),i.push(c.getH()),o&&(n.push(c.getNormalX()),n.push(c.getNormalY())),c.newIndex=l,r[f]=l))}3===d?(s.push(m[0].newIndex),s.push(m[1].newIndex),s.push(m[2].newIndex)):4===d&&(s.push(m[0].newIndex),s.push(m[1].newIndex),s.push(m[2].newIndex),s.push(m[0].newIndex),s.push(m[2].newIndex),s.push(m[3].newIndex))}}return m.push(new Ee),m.push(new Ee),m.push(new Ee),m.push(new Ee),e(function(e,U){for(var t=e.isEastChild,i=e.isNorthChild,F=t?ge:0,P=t?ce:ge,k=i?ge:0,D=i?ce:ge,n=Be,s=ye,r=Ie,h=be,u=(n.length=0,s.length=0,r.length=0,h.length=0,Ae),o=(u.length=0,{}),d=e.vertices,p=(p=e.indices).subarray(0,e.indexCountWithoutSkirts),a=de.TerrainEncoding.clone(e.encoding),f=a.hasVertexNormals,W=0,l=e.vertexCountWithoutSkirts,c=e.minimumHeight,X=e.maximumHeight,g=new Array(l),m=new Array(l),x=new Array(l),w=f?new Array(2*l):void 0,C=0,v=0;C<l;++C,v+=2){var B=a.decodeTextureCoordinates(d,C,Ne),y=a.decodeHeight(d,C),I=ae.CesiumMath.clamp(B.x*ce|0,0,ce),A=ae.CesiumMath.clamp(B.y*ce|0,0,ce);x[C]=ae.CesiumMath.clamp((y-c)/(X-c)*ce|0,0,ce),ce-(I=I<20?0:I)<20&&(I=ce),ce-(A=A<20?0:A)<20&&(A=ce),g[C]=I,m[C]=A,f&&(B=a.getOctEncodedNormal(d,C,Ve),w[v]=B.x,w[v+1]=B.y),(t&&ge<=I||!t&&I<=ge)&&(i&&ge<=A||!i&&A<=ge)&&(o[C]=W,n.push(I),s.push(A),r.push(x[C]),f&&(h.push(w[v]),h.push(w[v+1])),++W)}var b=[],T=(b.push(new Ee),b.push(new Ee),b.push(new Ee),[]);for(T.push(new Ee),T.push(new Ee),T.push(new Ee),C=0;C<p.length;C+=3){var z=p[C],M=p[C+1],K=p[C+2],L=g[z],Y=g[M],_=g[K],z=(b[0].initializeIndexed(g,m,x,w,z),b[1].initializeIndexed(g,m,x,w,M),b[2].initializeIndexed(g,m,x,w,K),le.clipTriangleAtAxisAlignedThreshold(ge,t,L,Y,_,me));z.length<=0||(M=T[0].initializeFromClipResult(z,0,b))>=z.length||(M=T[1].initializeFromClipResult(z,M,b))>=z.length||(M=T[2].initializeFromClipResult(z,M,b),Re(n,s,r,h,u,o,le.clipTriangleAtAxisAlignedThreshold(ge,i,T[0].getV(),T[1].getV(),T[2].getV(),xe),T,f),M<z.length&&(T[2].clone(T[1]),T[2].initializeFromClipResult(z,M,b),Re(n,s,r,h,u,o,le.clipTriangleAtAxisAlignedThreshold(ge,i,T[0].getV(),T[1].getV(),T[2].getV(),xe),T,f)))}var G=t?-ce:0,J=i?-ce:0,Z=[],j=[],q=[],Q=[],N=Number.MAX_VALUE,V=-N,E=we,R=(E.length=0,oe.Ellipsoid.clone(e.ellipsoid)),$=(e=oe.Rectangle.clone(e.childRectangle)).north,ee=e.south,H=e.east,te=e.west;for(H<te&&(H+=ae.CesiumMath.TWO_PI),C=0;C<n.length;++C)I=(I=Math.round(n[C]))<=F?(Z.push(C),0):P<=I?(q.push(C),ce):2*I+G,n[C]=I,A=(A=Math.round(s[C]))<=k?(j.push(C),0):D<=A?(Q.push(C),ce):2*A+J,s[C]=A,(y=ae.CesiumMath.lerp(c,X,r[C]/ce))<N&&(N=y),V<y&&(V=y),r[C]=y,Ce.longitude=ae.CesiumMath.lerp(te,H,I/ce),Ce.latitude=ae.CesiumMath.lerp(ee,$,A/ce),Ce.height=y,R.cartographicToCartesian(Ce,ve),E.push(ve.x),E.push(ve.y),E.push(ve.z);var ie=ue.BoundingSphere.fromVertices(E,oe.Cartesian3.ZERO,3,ze),e=fe.OrientedBoundingBox.fromRectangle(e,N,V,R,Me),ne=new de.EllipsoidalOccluder(R).computeHorizonCullingPointFromVerticesPossiblyUnderEllipsoid(ie.center,E,3,ie.center,N,Te),se=V-N,O=new Uint16Array(n.length+s.length+r.length);for(C=0;C<n.length;++C)O[C]=n[C];var re=n.length;for(C=0;C<s.length;++C)O[re+C]=s[C];for(re+=s.length,C=0;C<r.length;++C)O[re+C]=ce*(r[C]-N)/se;var S,he=pe.IndexDatatype.createTypedArray(n.length,u);return f?(S=new Uint8Array(h),U.push(O.buffer,he.buffer,S.buffer),S=S.buffer):U.push(O.buffer,he.buffer),{vertices:O.buffer,encodedNormals:S,indices:he.buffer,minimumHeight:N,maximumHeight:V,westIndices:Z,southIndices:j,eastIndices:q,northIndices:Q,boundingSphere:ie,orientedBoundingBox:e,horizonOcclusionPoint:ne}})});
