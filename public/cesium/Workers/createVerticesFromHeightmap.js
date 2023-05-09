define(["./Cartesian2-38b35910","./AxisAlignedBoundingBox-26346796","./Transforms-ce97037a","./when-ae2e0b60","./Check-f996273c","./TerrainEncoding-ca220d73","./Math-5bbcea10","./OrientedBoundingBox-155b5606","./WebMercatorProjection-cf614542","./AttributeCompression-25f42564","./EllipsoidTangentPlane-d3bb82f1","./RuntimeError-ac2797b4","./createTaskProcessorWorker","./combine-276652d0","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./Plane-ee0aa150","./IntersectionTests-ce427234"],function($e,et,tt,at,c,it,rt,nt,st,ot,lt,r,e,d,h,m,g,p){"use strict";var n,s,o,l,f,B,k,b,I,U,T,M,N,V,t,a,x,w,y,u=Object.freeze({NONE:0,LERC:1}),ft={},ut=(ft.DEFAULT_STRUCTURE=Object.freeze({heightScale:1,heightOffset:0,elementsPerHeight:1,stride:1,elementMultiplier:256,isBigEndian:!1}),new $e.Cartesian3),dt=new tt.Matrix4,ht=new $e.Cartesian3,mt=new $e.Cartesian3,ct=new $e.Cartesian2,gt=new $e.Cartesian3,pt=new tt.Matrix4,xt=new tt.Matrix4,i=(ft.computeVertices=function(e){for(var t,a,N,z,L,O=Math.cos,R=Math.sin,H=Math.sqrt,_=Math.atan,Y=Math.exp,W=rt.CesiumMath.PI_OVER_TWO,i=rt.CesiumMath.toRadians,X=e.heightmap,r=e.width,n=e.height,s=e.skirtHeight,Z=0<s,j=at.defaultValue(e.octEncodedNormals,void 0),G=at.defined(e.octEncodedNormals),o=at.defaultValue(e.repeat,new $e.Cartesian2(1,1)),q=at.defaultValue(e.isGeographic,!0),l=at.defaultValue(e.ellipsoid,$e.Ellipsoid.WGS84),f=1/l.maximumRadius,u=$e.Rectangle.clone(e.nativeRectangle),c=$e.Rectangle.clone(e.rectangle),Q=at.defined(c)?(t=c.west,a=c.south,N=c.east,c.north):q?(t=i(u.west),a=i(u.south),N=i(u.east),i(u.north)):(t=u.west*f,a=W-2*_(Y(-u.south*f)),N=u.east*f,W-2*_(Y(-u.north*f))),d=e.relativeToCenter,J=at.defined(d),d=J?d:$e.Cartesian3.ZERO,K=at.defaultValue(e.includeWebMercatorT,!1),$=at.defaultValue(e.exaggeration,1),ee=at.defaultValue(e.exaggerationRelativeHeight,0),te=1!==$,ae=at.defaultValue(e.aspectArrow,!1),e=at.defaultValue(e.structure,ft.DEFAULT_STRUCTURE),ie=at.defaultValue(e.heightScale,ft.DEFAULT_STRUCTURE.heightScale),re=at.defaultValue(e.heightOffset,ft.DEFAULT_STRUCTURE.heightOffset),ne=at.defaultValue(e.elementsPerHeight,ft.DEFAULT_STRUCTURE.elementsPerHeight),se=at.defaultValue(e.stride,ft.DEFAULT_STRUCTURE.stride),oe=at.defaultValue(e.elementMultiplier,ft.DEFAULT_STRUCTURE.elementMultiplier),le=at.defaultValue(e.isBigEndian,ft.DEFAULT_STRUCTURE.isBigEndian),fe=$e.Rectangle.computeWidth(u),ue=$e.Rectangle.computeHeight(u),ce=fe/(r-1),de=ue/(n-1),e=(q||(fe*=f,ue*=f),l.radiiSquared),he=e.x,me=e.y,ge=e.z,pe=65536,xe=-65536,e=tt.Transforms.eastNorthUpToFixedFrame(d,l),we=tt.Matrix4.inverseTransformation(e,dt),h=(K&&(z=st.WebMercatorProjection.geodeticLatitudeToMercatorAngle(a),L=1/(st.WebMercatorProjection.geodeticLatitudeToMercatorAngle(Q)-z)),ht),m=(h.x=Number.POSITIVE_INFINITY,h.y=Number.POSITIVE_INFINITY,h.z=Number.POSITIVE_INFINITY,mt),ye=(m.x=Number.NEGATIVE_INFINITY,m.y=Number.NEGATIVE_INFINITY,m.z=Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY),g=r*n,p=g+(0<s?2*r+2*n:0),x=new Array(p),ke=new Array(p),be=new Array(p),Ie=K?new Array(p):[],Ue=te?new Array(p):[],Te=0,Me=n,Ae=0,Ve=r,ve=(Z&&(--Te,++Me,--Ae,++Ve),Te);ve<Me;++ve){var Be,w=ve,y=(n<=(w=w<0?0:w)&&(w=n-1),u.north-de*w),y=q?i(y):W-2*_(Y(-y*f)),De=rt.CesiumMath.clamp((y-a)/(Q-a),0,1),Se=ve===Te,Ce=ve===Me-1,Pe=(0<s&&(Se?y+=1e-5*ue:Ce&&(y-=1e-5*ue)),O(y)),Ee=R(y),Fe=ge*Ee;K&&(Be=(st.WebMercatorProjection.geodeticLatitudeToMercatorAngle(y)-z)*L);for(var Ne=Ae;Ne<Ve;++Ne){var k=Ne,ze=w*(r*se)+(k=r<=(k=k<0?0:k)?r-1:k)*se;if(1===ne)I=X[ze];else{var b,I=0;if(le)for(b=0;b<ne;++b)I=I*oe+X[ze+b];else for(b=ne-1;0<=b;--b)I=I*oe+X[ze+b]}I=I*ie+re;var xe=Math.max(xe,I),pe=Math.min(pe,I),U=u.west+ce*k,Le=(q?U=i(U):U*=f,(U-t)/(N-t)),Le=rt.CesiumMath.clamp(Le,0,1),T=w*r+k;if(0<s){var M=Ne===Ae,Oe=Ne===Ve-1,Re=Se||Ce||M||Oe;if((Se||Ce)&&(M||Oe))continue;Re&&(I-=s,M?(T=n-w-1+g,U-=1e-5*fe):Ce?T=g+n+(r-k-1):Oe?(T=g+n+r+w,U+=1e-5*fe):Se&&(T=g+n+r+n+k))}var Re=Pe*O(U),M=Pe*R(U),Oe=he*Re,k=me*M,U=1/H(Oe*Re+k*M+Fe*Ee),He=Oe*U,k=k*U,U=Fe*U,A=new $e.Cartesian3;A.x=He+Re*I,A.y=k+M*I,A.z=U+Ee*I,tt.Matrix4.multiplyByPoint(we,A,ut),$e.Cartesian3.minimumByComponent(ut,h,h),$e.Cartesian3.maximumByComponent(ut,m,m),ye=Math.min(ye,I),x[T]=A,be[T]=new $e.Cartesian2(Le,De),ke[T]=I,K&&(Ie[T]=Be),te&&(Ue[T]=l.geodeticSurfaceNormal(A))}}for(var _e,Ye,Z=tt.BoundingSphere.fromPoints(x),c=(at.defined(c)&&(_e=nt.OrientedBoundingBox.fromRectangle(c,pe,xe,l)),J&&(Ye=new it.EllipsoidalOccluder(l).computeHorizonCullingPointPossiblyUnderEllipsoid(d,x,pe)),new et.AxisAlignedBoundingBox(h,m,d)),We=new it.TerrainEncoding(d,c,ye,xe,e,G,K,te,$,ee),Xe=new Float32Array(p*We.stride),Ze=0,je=[],Ge=0;Ge<o.x*o.y;Ge++){var qe=new $e.Cartesian3;je.push(qe)}for(var V=0;V<p;++V)var v,B,D,Ze=G?(V<g&&(ct.x=j[D=2*V],ct.y=j[1+D],ae&&(D=be[V].y,v=be[V].x,v=Math.floor(v*o.x),D=Math.floor(D*o.y),B=new $e.Cartesian3,ot.AttributeCompression.octDecode(ct.x,ct.y,B),(D=parseInt(D*o.x+v))<o.x*o.y)&&$e.Cartesian3.add(B,je[D],je[D]),1!==$)&&(v=ot.AttributeCompression.AttributeCompression.octDecode(ct.x,ct.y,gt),B=tt.Transforms.Transforms.eastNorthUpToFixedFrame(x[V],l,xt),D=tt.Transforms.Matrix4.inverseTransformation(B,pt),tt.Transforms.Matrix4.multiplyByPointAsVector(D,v,v),v.z*=$,$e.Cartesian3.normalize(v,v),tt.Transforms.Matrix4.multiplyByPointAsVector(B,v,v),$e.Cartesian3.normalize(v,v),ot.AttributeCompression.AttributeCompression.octEncode(v,ct)),We.encode(Xe,Ze,x[V],be[V],ke[V],ct,Ie[V],Ue[V])):We.encode(Xe,Ze,x[V],be[V],ke[V],void 0,Ie[V],Ue[V]);var Qe=[];if(G&&ae)for(var Je=0;Je<o.y;Je++)for(var Ke=0;Ke<o.x;Ke++){var S,C,P,E,F=je[parseInt(Je*o.x+Ke)];$e.Cartesian3.magnitude(F)<1e-10?Qe.push(0):($e.Cartesian3.normalize(F,F),S=new $e.Cartesian3,C=parseInt(p/2),C=new lt.EllipsoidTangentPlane(x[C]),E=($e.Cartesian3.cross(C.xAxis,C.yAxis,S),$e.Cartesian3.normalize(S,S),new $e.Cartesian3),P=$e.Cartesian3.dot(F,S),P=($e.Cartesian3.multiplyByScalar(S,P,E),new $e.Cartesian3),F=($e.Cartesian3.subtract(F,E,P),$e.Cartesian3.angleBetween(P,C.xAxis)),E=new $e.Cartesian3,$e.Cartesian3.cross(C.xAxis,P,E),$e.Cartesian3.dot(E,S)<0&&(F=2*Math.PI-F),Qe.push(F))}return{vertices:Xe,maximumHeight:xe,minimumHeight:pe,encoding:We,boundingSphere3D:Z,orientedBoundingBox:_e,occludeePointInScaledSpace:Ye,aspect:Qe,repeat:o}},{}),A=(s=function(e,t,a,i,r){for(var n,s,o,l,f,u=0,c=e.pixels.numBlocksX,d=e.pixels.numBlocksY,h=Math.floor(e.width/c),m=Math.floor(e.height/d),g=2*e.maxZError,p=Number.MAX_VALUE,x=(a=a||(e.mask?e.mask.bitset:null),s=new t(e.width*e.height),r&&a&&(o=new Uint8Array(e.width*e.height)),new Float32Array(h*m)),w=0;w<=d;w++){var y=w!==d?m:e.height%d;if(0!==y)for(var k=0;k<=c;k++){var b=k!==c?h:e.width%c;if(0!==b){var I,U,T,M,A=w*e.width*m+k*h,V=e.width-b,v=e.pixels.blocks[u];if(v.encoding<2?(I=0===v.encoding?v.rawData:(B(v.stuffedData,v.bitsPerPixel,v.numValidPixels,v.offset,g,x,e.pixels.maxValue),x),U=0):T=2===v.encoding?0:v.offset,a)for(f=0;f<y;f++){for(7&A&&(M=a[A>>3],M<<=7&A),l=0;l<b;l++)128&(M=7&A?M:a[A>>3])?(o&&(o[A]=1),p=(n=v.encoding<2?I[U++]:T)<p?n:p,s[A++]=n):(o&&(o[A]=0),s[A++]=i),M<<=1;A+=V}else if(v.encoding<2)for(f=0;f<y;f++){for(l=0;l<b;l++)p=(n=I[U++])<p?n:p,s[A++]=n;A+=V}else for(p=T<p?T:p,f=0;f<y;f++){for(l=0;l<b;l++)s[A++]=T;A+=V}if(1===v.encoding&&U!==v.numValidPixels)throw"Block and Mask do not match";u++}}}return{resultPixels:s,resultMask:o,minValue:p}},o=function(e){return{fileIdentifierString:e.fileIdentifierString,fileVersion:e.fileVersion,imageType:e.imageType,height:e.height,width:e.width,maxZError:e.maxZError,eofOffset:e.eofOffset,mask:e.mask?{numBlocksX:e.mask.numBlocksX,numBlocksY:e.mask.numBlocksY,numBytes:e.mask.numBytes,maxValue:e.mask.maxValue}:null,pixels:{numBlocksX:e.pixels.numBlocksX,numBlocksY:e.pixels.numBlocksY,numBytes:e.pixels.numBytes,maxValue:e.pixels.maxValue,noDataValue:e.noDataValue}}},l=function(e){for(var t=e.pixels.numBlocksX*e.pixels.numBlocksY,a={},i=0;i<t;i++){var r=e.pixels.blocks[i];0===r.encoding?a.float32=!0:1===r.encoding?a[r.bitsPerPixel]=!0:a[0]=!0}return Object.keys(a)},f=function(e,t,a){var i={},r=new Uint8Array(e,t,10);if(i.fileIdentifierString=String.fromCharCode.apply(null,r),"CntZImage"!==i.fileIdentifierString.trim())throw"Unexpected file identifier string: "+i.fileIdentifierString;t+=10;var n=new DataView(e,t,24);if(i.fileVersion=n.getInt32(0,!0),i.imageType=n.getInt32(4,!0),i.height=n.getUint32(8,!0),i.width=n.getUint32(12,!0),i.maxZError=n.getFloat64(16,!0),t+=24,!a)if(n=new DataView(e,t,16),i.mask={},i.mask.numBlocksY=n.getUint32(0,!0),i.mask.numBlocksX=n.getUint32(4,!0),i.mask.numBytes=n.getUint32(8,!0),i.mask.maxValue=n.getFloat32(12,!0),t+=16,0<i.mask.numBytes){var s=new Uint8Array(Math.ceil(i.width*i.height/8)),o=(n=new DataView(e,t,i.mask.numBytes)).getInt16(0,!0),l=2,f=0;do{if(0<o)for(;o--;)s[f++]=n.getUint8(l++);else for(var u=n.getUint8(l++),o=-o;o--;)s[f++]=u}while(o=n.getInt16(l,!0),(l+=2)<i.mask.numBytes);if(-32768!==o||f<s.length)throw"Unexpected end of mask RLE encoding";i.mask.bitset=s,t+=i.mask.numBytes}else 0==(i.mask.numBytes|i.mask.numBlocksY|i.mask.maxValue)&&(i.mask.bitset=new Uint8Array(Math.ceil(i.width*i.height/8)));n=new DataView(e,t,16),i.pixels={},i.pixels.numBlocksY=n.getUint32(0,!0),i.pixels.numBlocksX=n.getUint32(4,!0),i.pixels.numBytes=n.getUint32(8,!0),i.pixels.maxValue=n.getFloat32(12,!0),t+=16;for(var r=i.pixels.numBlocksX,a=i.pixels.numBlocksY,c=r+(0<i.width%r?1:0),d=a+(0<i.height%a?1:0),h=(i.pixels.blocks=new Array(c*d),0),m=0;m<d;m++)for(var g=0;g<c;g++){var p,x=0,w=e.byteLength-t,w=(n=new DataView(e,t,Math.min(10,w)),{}),y=(i.pixels.blocks[h++]=w,n.getUint8(0));if(x++,w.encoding=63&y,3<w.encoding)throw"Invalid block encoding ("+w.encoding+")";if(2===w.encoding)t++;else{if(0!==y&&2!==y){if(y>>=6,2==(w.offsetType=y))w.offset=n.getInt8(1),x++;else if(1==y)w.offset=n.getInt16(1,!0),x+=2;else{if(0!=y)throw"Invalid block offset type";w.offset=n.getFloat32(1,!0),x+=4}if(1===w.encoding)if(y=n.getUint8(x),x++,w.bitsPerPixel=63&y,y>>=6,2==(w.numValidPixelsType=y))w.numValidPixels=n.getUint8(x),x++;else if(1==y)w.numValidPixels=n.getUint16(x,!0),x+=2;else{if(0!=y)throw"Invalid valid pixel count type";w.numValidPixels=n.getUint32(x,!0),x+=4}}if(t+=x,3!==w.encoding)if(0===w.encoding){var y=(i.pixels.numBytes-1)/4;if(y!==Math.floor(y))throw"uncompressed block has invalid length";p=new ArrayBuffer(4*y),new Uint8Array(p).set(new Uint8Array(e,t,4*y));var x=new Float32Array(p);w.rawData=x,t+=4*y}else 1===w.encoding&&(x=Math.ceil(w.numValidPixels*w.bitsPerPixel/8),y=Math.ceil(x/4),p=new ArrayBuffer(4*y),new Uint8Array(p).set(new Uint8Array(e,t,x)),w.stuffedData=new Uint32Array(p),t+=x)}}return i.eofOffset=t,i},B=function(e,t,a,i,r,n,s){var o,l,f,u,c=(1<<t)-1,d=0,h=0,m=Math.ceil((s-i)/r),g=4*e.length-Math.ceil(t*a/8);for(e[e.length-1]<<=8*g,o=0;o<a;o++)0===h&&(u=e[d++],h=32),t<=h?(f=u>>>h-t&c,h-=t):(f=(u&c)<<(l=t-h)&c,f+=(u=e[d++])>>>(h=32-l)),n[o]=f<m?i+f*r:s;return n},x=n={defaultNoDataValue:-34027999387901484e22,decode:function(e,t){var a=(t=t||{}).encodedMaskData||null===t.encodedMaskData,e=f(e,t.inputOffset||0,a),a=null!==t.noDataValue?t.noDataValue:n.defaultNoDataValue,i=s(e,t.pixelType||Float32Array,t.encodedMaskData,a,t.returnMask),a={width:e.width,height:e.height,pixelData:i.resultPixels,minValue:i.minValue,maxValue:e.pixels.maxValue,noDataValue:a};return i.resultMask&&(a.maskData=i.resultMask),t.returnEncodedMask&&e.mask&&(a.encodedMaskData=e.mask.bitset||null),t.returnFileInfo&&(a.fileInfo=o(e),t.computeUsedBitDepths)&&(a.fileInfo.bitDepths=l(e)),a}},k=function(e,t,a,i,r,n,s,o){var l,f,u,c,d,h=(1<<a)-1,m=0,g=0,p=4*e.length-Math.ceil(a*i/8);if(e[e.length-1]<<=8*p,r)for(l=0;l<i;l++)0===g&&(u=e[m++],g=32),a<=g?(f=u>>>g-a&h,g-=a):(f=(u&h)<<(c=a-g)&h,f+=(u=e[m++])>>>(g=32-c)),t[l]=r[f];else for(d=Math.ceil((o-n)/s),l=0;l<i;l++)0===g&&(u=e[m++],g=32),a<=g?(f=u>>>g-a&h,g-=a):(f=(u&h)<<(c=a-g)&h,f+=(u=e[m++])>>>(g=32-c)),t[l]=f<d?n+f*s:o},b=function(e,t,a,i,r,n){for(var s,o,l=(1<<t)-1,f=0,u=0,c=0,d=0,h=[],m=4*e.length-Math.ceil(t*a/8),g=(e[e.length-1]<<=8*m,Math.ceil((n-i)/r)),u=0;u<a;u++)0===c&&(o=e[f++],c=32),t<=c?(d=o>>>c-t&l,c-=t):(d=(o&l)<<(s=t-c)&l,d+=(o=e[f++])>>>(c=32-s)),h[u]=d<g?i+d*r:n;return h.unshift(i),h},I=function(e,t,a,i,r,n,s,o){var l,f,u,c=(1<<a)-1,d=0,h=0,m=0;if(r)for(p=0;p<i;p++)0===h&&(f=e[d++],h=32,m=0),a<=h?(l=f>>>m&c,h-=a,m+=a):(l=f>>>m&c,h=32-(u=a-h),l|=((f=e[d++])&(1<<u)-1)<<a-u,m=u),t[p]=r[l];else for(var g=Math.ceil((o-n)/s),p=0;p<i;p++)0===h&&(f=e[d++],h=32,m=0),a<=h?(l=f>>>m&c,h-=a,m+=a):(l=f>>>m&c,h=32-(u=a-h),l|=((f=e[d++])&(1<<u)-1)<<a-u,m=u),t[p]=l<g?n+l*s:o;return t},U=function(e,t,a,i,r,n){for(var s,o,l=(1<<t)-1,f=0,u=0,c=0,d=0,h=0,m=[],g=Math.ceil((n-i)/r),u=0;u<a;u++)0===c&&(o=e[f++],c=32,h=0),t<=c?(d=o>>>h&l,c-=t,h+=t):(d=o>>>h&l,c=32-(s=t-c),d|=((o=e[f++])&(1<<s)-1)<<t-s,h=s),m[u]=d<g?i+d*r:n;return m.unshift(i),m},T=function(e,t,a,i){var r,n,s,o,l=(1<<a)-1,f=0,u=0,c=4*e.length-Math.ceil(a*i/8);for(e[e.length-1]<<=8*c,r=0;r<i;r++)0===u&&(s=e[f++],u=32),a<=u?(n=s>>>u-a&l,u-=a):(n=(s&l)<<(o=a-u)&l,n+=(s=e[f++])>>>(u=32-o)),t[r]=n;return t},M=function(e,t,a,i){for(var r,n,s,o=(1<<a)-1,l=0,f=0,u=0,c=0;c<i;c++)0===f&&(n=e[l++],f=32,u=0),a<=f?(r=n>>>u&o,f-=a,u+=a):(r=n>>>u&o,f=32-(s=a-f),r|=((n=e[l++])&(1<<s)-1)<<a-s,u=s),t[c]=r;return t},N={HUFFMAN_LUT_BITS_MAX:12,computeChecksumFletcher32:function(e){for(var t=65535,a=65535,i=e.length,r=Math.floor(i/2),n=0;r;){var s=359<=r?359:r;for(r-=s;a+=t=(t+=e[n++]<<8)+e[n++],--s;);t=(65535&t)+(t>>>16),a=(65535&a)+(a>>>16)}return 1&i&&(a+=t+=e[n]<<8),((a=(65535&a)+(a>>>16))<<16|(t=(65535&t)+(t>>>16)))>>>0},readHeaderInfo:function(e,t){var a=t.ptr,i=new Uint8Array(e,a,6),r={};if(r.fileIdentifierString=String.fromCharCode.apply(null,i),0!==r.fileIdentifierString.lastIndexOf("Lerc2",0))throw"Unexpected file identifier string (expect Lerc2 ): "+r.fileIdentifierString;a+=6;var i=new DataView(e,a,8),n=i.getInt32(0,!0);if(a+=4,3<=(r.fileVersion=n)&&(r.checksum=i.getUint32(4,!0),a+=4),i=new DataView(e,a,12),r.height=i.getUint32(0,!0),r.width=i.getUint32(4,!0),a+=8,4<=n?(r.numDims=i.getUint32(8,!0),a+=4):r.numDims=1,i=new DataView(e,a,40),r.numValidPixel=i.getUint32(0,!0),r.microBlockSize=i.getInt32(4,!0),r.blobSize=i.getInt32(8,!0),r.imageType=i.getInt32(12,!0),r.maxZError=i.getFloat64(16,!0),r.zMin=i.getFloat64(24,!0),r.zMax=i.getFloat64(32,!0),a+=40,t.headerInfo=r,t.ptr=a,3<=n&&this.computeChecksumFletcher32(new Uint8Array(e,a-(4<=n?52:48),r.blobSize-14))!==r.checksum)throw"Checksum failed.";return!0},checkMinMaxRanges:function(e,t){var a=t.headerInfo,i=this.getDataTypeArray(a.imageType),r=a.numDims*this.getDataTypeSize(a.imageType),n=this.readSubArray(e,t.ptr,i,r),s=this.readSubArray(e,t.ptr+r,i,r);t.ptr+=2*r;for(var o=!0,l=0;l<a.numDims;l++)if(n[l]!==s[l]){o=!1;break}return a.minValues=n,a.maxValues=s,o},readSubArray:function(e,t,a,i){var r,e=a===Uint8Array?new Uint8Array(e,t,i):(r=new ArrayBuffer(i),new Uint8Array(r).set(new Uint8Array(e,t,i)),new a(r));return e},readMask:function(e,t){var a=t.ptr,i=t.headerInfo,r=i.width*i.height,i=i.numValidPixel,n=new DataView(e,a,4),s={};if(s.numBytes=n.getUint32(0,!0),a+=4,(0===i||r===i)&&0!==s.numBytes)throw"invalid mask";if(0===i)l=new Uint8Array(Math.ceil(r/8)),s.bitset=l,d=new Uint8Array(r),t.pixels.resultMask=d,a+=s.numBytes;else if(0<s.numBytes){var o,l=new Uint8Array(Math.ceil(r/8)),f=(n=new DataView(e,a,s.numBytes)).getInt16(0,!0),u=2,c=0;do{if(0<f)for(;f--;)l[c++]=n.getUint8(u++);else for(o=n.getUint8(u++),f=-f;f--;)l[c++]=o}while(f=n.getInt16(u,!0),(u+=2)<s.numBytes);if(-32768!==f||c<l.length)throw"Unexpected end of mask RLE encoding";for(var d=new Uint8Array(r),h=0,m=0,m=0;m<r;m++)7&m?(h=l[m>>3],h<<=7&m):h=l[m>>3],128&h&&(d[m]=1);t.pixels.resultMask=d,s.bitset=l,a+=s.numBytes}return t.ptr=a,t.mask=s,!0},readDataOneSweep:function(e,t,a){var i=t.ptr,r=t.headerInfo,n=r.numDims,s=r.width*r.height,o=r.imageType,r=r.numValidPixel*N.getDataTypeSize(o)*n,l=t.pixels.resultMask,f=a===Uint8Array?new Uint8Array(e,i,r):(o=new ArrayBuffer(r),new Uint8Array(o).set(new Uint8Array(e,i,r)),new a(o));if(f.length===s*n)t.pixels.resultPixels=f;else{t.pixels.resultPixels=new a(s*n);var u,c=0,d=0,h=0;if(1<n)for(h=0;h<n;h++)for(u=h*s,d=0;d<s;d++)l[d]&&(t.pixels.resultPixels[u+d]=f[c++]);else for(d=0;d<s;d++)l[d]&&(t.pixels.resultPixels[d]=f[c++])}return t.ptr=i+=r,!0},readHuffmanTree:function(e,t){var a=this.HUFFMAN_LUT_BITS_MAX,i=new DataView(e,t.ptr,16);if(t.ptr+=16,i.getInt32(0,!0)<2)throw"unsupported Huffman version";var r=i.getInt32(4,!0),n=i.getInt32(8,!0),s=i.getInt32(12,!0);if(s<=n)return!1;for(var o,l,f,u=new Uint32Array(s-n),c=(N.decodeBits(e,t,u),[]),d=n;d<s;d++)c[o=d-(d<r?0:r)]={first:u[d-n],second:null};var i=e.byteLength-t.ptr,h=Math.ceil(i/4),h=new ArrayBuffer(4*h),m=(new Uint8Array(h).set(new Uint8Array(e,t.ptr,i)),new Uint32Array(h)),g=0,p=0,x=m[0];for(d=n;d<s;d++)0<(f=c[o=d-(d<r?0:r)].first)&&(c[o].second=x<<g>>>32-f,f<=32-g?32===(g+=f)&&(g=0,x=m[++p]):(x=m[++p],c[o].second|=x>>>32-(g+=f-32)));var w=0,y=0,k=new V;for(d=0;d<c.length;d++)void 0!==c[d]&&(w=Math.max(w,c[d].first));y=a<=w?a:w,30<=w&&console.log("WARning, large NUM LUT BITS IS "+w);var b,I,U,T,M,A=[];for(d=n;d<s;d++)if(0<(f=c[o=d-(d<r?0:r)].first))if(b=[f,o],f<=y)for(I=c[o].second<<y-f,U=1<<y-f,l=0;l<U;l++)A[I|l]=b;else for(I=c[o].second,M=k,T=f-1;0<=T;T--)M=I>>>T&1?(M.right||(M.right=new V),M.right):(M.left||(M.left=new V),M.left),0!==T||M.val||(M.val=b[1]);return{decodeLut:A,numBitsLUTQick:y,numBitsLUT:w,tree:k,stuffedData:m,srcPtr:p,bitPos:g}},readHuffman:function(e,t,a){for(var i,r,n,s,o,l,f,u,c,d=t.headerInfo,h=d.numDims,m=t.headerInfo.height,g=t.headerInfo.width,p=g*m,e=this.readHuffmanTree(e,t),x=e.decodeLut,w=e.tree,y=e.stuffedData,k=e.srcPtr,b=e.bitPos,I=e.numBitsLUTQick,U=e.numBitsLUT,T=0===t.headerInfo.imageType?128:0,M=t.pixels.resultMask,A=0,V=(0<b&&(k++,b=0),y[k]),v=1===t.encodeMode,B=new a(p*h),D=B,S=0;S<d.numDims;S++){if(1<h&&(D=new a(B.buffer,p*S,p),A=0),t.headerInfo.numValidPixel===g*m)for(l=u=0;l<m;l++)for(f=0;f<g;f++,u++){if(r=0,o=s=V<<b>>>32-I,x[o=32-b<I?s|=y[k+1]>>>64-b-I:o])r=x[o][1],b+=x[o][0];else for(o=s=V<<b>>>32-U,32-b<U&&(o=s|=y[k+1]>>>64-b-U),i=w,c=0;c<U;c++)if(!(i=s>>>U-c-1&1?i.right:i.left).left&&!i.right){r=i.val,b=b+c+1;break}32<=b&&(b-=32,V=y[++k]),n=r-T,v?(n=n+(!(0<f)&&0<l?D[u-g]:A)&255,A=D[u]=n):D[u]=n}else for(l=u=0;l<m;l++)for(f=0;f<g;f++,u++)if(M[u]){if(r=0,o=s=V<<b>>>32-I,x[o=32-b<I?s|=y[k+1]>>>64-b-I:o])r=x[o][1],b+=x[o][0];else for(o=s=V<<b>>>32-U,32-b<U&&(o=s|=y[k+1]>>>64-b-U),i=w,c=0;c<U;c++)if(!(i=s>>>U-c-1&1?i.right:i.left).left&&!i.right){r=i.val,b=b+c+1;break}32<=b&&(b-=32,V=y[++k]),n=r-T,v?(!(0<f&&M[u-1])&&0<l&&M[u-g]?n+=D[u-g]:n+=A,n&=255,A=D[u]=n):D[u]=n}t.ptr=t.ptr+4*(k+1)+(0<b?4:0)}t.pixels.resultPixels=B},decodeBits:function(e,t,a,i,r){var n=t.headerInfo,s=n.fileVersion,o=0,l=5<=e.byteLength-t.ptr?5:e.byteLength-t.ptr,l=new DataView(e,t.ptr,l),f=l.getUint8(0),u=(o++,f>>6),u=0==u?4:3-u,c=0<(32&f),f=31&f,d=0;if(1==u)d=l.getUint8(o),o++;else if(2==u)d=l.getUint16(o,!0),o+=2;else{if(4!=u)throw"Invalid valid pixel count type";d=l.getUint32(o,!0),o+=4}var h,m,g,p,x,w,y,u=2*n.maxZError,r=1<n.numDims?n.maxValues[r]:n.zMax;if(c){for(t.counter.lut++,w=l.getUint8(o),o++,p=Math.ceil((w-1)*f/8),x=Math.ceil(p/4),m=new ArrayBuffer(4*x),g=new Uint8Array(m),t.ptr+=o,g.set(new Uint8Array(e,t.ptr,p)),n=new Uint32Array(m),t.ptr+=p,y=0;w-1>>>y;)y++;p=Math.ceil(d*y/8),x=Math.ceil(p/4),m=new ArrayBuffer(4*x),(g=new Uint8Array(m)).set(new Uint8Array(e,t.ptr,p)),h=new Uint32Array(m),t.ptr+=p,c=(3<=s?U:b)(n,f,w-1,i,u,r),(3<=s?I:k)(h,a,y,d,c)}else t.counter.bitstuffer++,y=f,t.ptr+=o,0<y&&(p=Math.ceil(d*y/8),x=Math.ceil(p/4),m=new ArrayBuffer(4*x),(g=new Uint8Array(m)).set(new Uint8Array(e,t.ptr,p)),h=new Uint32Array(m),t.ptr+=p,3<=s?null===i?M(h,a,y,d):I(h,a,y,d,!1,i,u,r):null===i?T(h,a,y,d):k(h,a,y,d,!1,i,u,r))},readTiles:function(e,t,a){for(var i,r,n,s,o,l,f,u,c,d,h,m,g=t.headerInfo,p=g.width,x=g.height,w=g.microBlockSize,y=g.imageType,k=N.getDataTypeSize(y),b=Math.ceil(p/w),I=Math.ceil(x/w),U=(t.pixels.numBlocksY=I,t.pixels.numBlocksX=b,t.pixels.ptr=0),T=0,M=0,A=0,V=0,v=0,B=0,D=new a(w*w),S=x%w||w,C=p%w||w,P=g.numDims,E=t.pixels.resultMask,F=t.pixels.resultPixels,M=0;M<I;M++)for(i=M!==I-1?w:S,A=0;A<b;A++)for(V=M*p*w+A*w,s=p-(r=A!==b-1?w:C),m=0;m<P;m++){if(1<P&&(F=new a(t.pixels.resultPixels.buffer,p*x*m*k,p*x)),o=e.byteLength-t.ptr,l={},B=0,B++,n=(c=(o=new DataView(e,t.ptr,Math.min(10,o))).getUint8(0))>>6&255,(c>>2&15)!=(A*w>>3&15))throw"integrity issue";if(3<(c=3&c))throw t.ptr+=B,"Invalid block encoding ("+c+")";if(2==c)t.counter.constant++,t.ptr+=B;else if(0==c){if(t.counter.uncompressed++,t.ptr+=B,d=(d=i*r*k)<(f=e.byteLength-t.ptr)?d:f,f=new ArrayBuffer(d%k==0?d:d+k-d%k),new Uint8Array(f).set(new Uint8Array(e,t.ptr,d)),u=new a(f),v=0,E)for(U=0;U<i;U++){for(T=0;T<r;T++)E[V]&&(F[V]=u[v++]),V++;V+=s}else for(U=0;U<i;U++){for(T=0;T<r;T++)F[V++]=u[v++];V+=s}t.ptr+=v*k}else if(d=N.getDataTypeUsed(y,n),h=N.getOnePixel(l,B,d,o),B+=N.getDataTypeSize(d),3==c)if(t.ptr+=B,t.counter.constantoffset++,E)for(U=0;U<i;U++){for(T=0;T<r;T++)E[V]&&(F[V]=h),V++;V+=s}else for(U=0;U<i;U++){for(T=0;T<r;T++)F[V++]=h;V+=s}else if(t.ptr+=B,N.decodeBits(e,t,D,h,m),B=0,E)for(U=0;U<i;U++){for(T=0;T<r;T++)E[V]&&(F[V]=D[B++]),V++;V+=s}else for(U=0;U<i;U++){for(T=0;T<r;T++)F[V++]=D[B++];V+=s}}},formatFileInfo:function(e){return{fileIdentifierString:e.headerInfo.fileIdentifierString,fileVersion:e.headerInfo.fileVersion,imageType:e.headerInfo.imageType,height:e.headerInfo.height,width:e.headerInfo.width,numValidPixel:e.headerInfo.numValidPixel,microBlockSize:e.headerInfo.microBlockSize,blobSize:e.headerInfo.blobSize,maxZError:e.headerInfo.maxZError,pixelType:N.getPixelType(e.headerInfo.imageType),eofOffset:e.eofOffset,mask:e.mask?{numBytes:e.mask.numBytes}:null,pixels:{numBlocksX:e.pixels.numBlocksX,numBlocksY:e.pixels.numBlocksY,maxValue:e.headerInfo.zMax,minValue:e.headerInfo.zMin,noDataValue:e.noDataValue}}},constructConstantSurface:function(e){var t,a=e.headerInfo.zMax,i=e.headerInfo.numDims,r=e.headerInfo.height*e.headerInfo.width,n=r*i,s=0,o=0,l=e.pixels.resultMask;if(l)if(1<i)for(s=0;s<i;s++)for(t=s*r,o=0;o<r;o++)l[o]&&(e.pixels.resultPixels[t+o]=a);else for(o=0;o<r;o++)l[o]&&(e.pixels.resultPixels[o]=a);else if(e.pixels.resultPixels.fill)e.pixels.resultPixels.fill(a);else for(o=0;o<n;o++)e.pixels.resultPixels[o]=a},getDataTypeArray:function(e){var t;switch(e){case 0:t=Int8Array;break;case 1:t=Uint8Array;break;case 2:t=Int16Array;break;case 3:t=Uint16Array;break;case 4:t=Int32Array;break;case 5:t=Uint32Array;break;case 6:t=Float32Array;break;case 7:t=Float64Array;break;default:t=Float32Array}return t},getPixelType:function(e){var t;switch(e){case 0:t="S8";break;case 1:t="U8";break;case 2:t="S16";break;case 3:t="U16";break;case 4:t="S32";break;case 5:t="U32";break;case 6:t="F32";break;case 7:t="F64";break;default:t="F32"}return t},isValidPixelValue:function(e,t){if(null===t)return!1;var a;switch(e){case 0:a=-128<=t&&t<=127;break;case 1:a=0<=t&&t<=255;break;case 2:a=-32768<=t&&t<=32767;break;case 3:a=0<=t&&t<=65536;break;case 4:a=-2147483648<=t&&t<=2147483647;break;case 5:a=0<=t&&t<=4294967296;break;case 6:a=-34027999387901484e22<=t&&t<=34027999387901484e22;break;case 7:a=5e-324<=t&&t<=17976931348623157e292;break;default:a=!1}return a},getDataTypeSize:function(e){var t=0;switch(e){case 0:case 1:t=1;break;case 2:case 3:t=2;break;case 4:case 5:case 6:t=4;break;case 7:t=8;break;default:t=e}return t},getDataTypeUsed:function(e,t){var a=e;switch(e){case 2:case 4:a=e-t;break;case 3:case 5:a=e-2*t;break;case 6:a=0===t?e:1===t?2:1;break;case 7:a=0===t?e:e-2*t+1;break;default:a=e}return a},getOnePixel:function(e,t,a,i){var r=0;switch(a){case 0:r=i.getInt8(t);break;case 1:r=i.getUint8(t);break;case 2:r=i.getInt16(t,!0);break;case 3:r=i.getUint16(t,!0);break;case 4:r=i.getInt32(t,!0);break;case 5:r=i.getUInt32(t,!0);break;case 6:r=i.getFloat32(t,!0);break;case 7:r=i.getFloat64(t,!0);break;default:throw"the decoder does not understand this pixel type"}return r}},V=function(e,t,a){this.val=e,this.left=t,this.right=a},w={decode:function(e,t){var a,i=(t=t||{}).noDataValue,r=0,n={},s=(n.ptr=t.inputOffset||0,n.pixels={},N.readHeaderInfo(e,n),n.headerInfo),o=s.fileVersion,l=N.getDataTypeArray(s.imageType),f=(N.readMask(e,n),s.numValidPixel===s.width*s.height||n.pixels.resultMask||(n.pixels.resultMask=t.maskData),s.width*s.height);if(n.pixels.resultPixels=new l(f*s.numDims),n.counter={onesweep:0,uncompressed:0,lut:0,bitstuffer:0,constant:0,constantoffset:0},0!==s.numValidPixel)if(s.zMax===s.zMin)N.constructConstantSurface(n);else if(4<=o&&N.checkMinMaxRanges(e,n))N.constructConstantSurface(n);else{var u=new DataView(e,n.ptr,2),c=u.getUint8(0);if(n.ptr++,c)N.readDataOneSweep(e,n,l);else if(1<o&&s.imageType<=1&&Math.abs(s.maxZError-.5)<1e-5){c=u.getUint8(1);if(n.ptr++,2<(n.encodeMode=c)||o<4&&1<c)throw"Invalid Huffman flag "+c;c?N.readHuffman(e,n,l):N.readTiles(e,n,l)}else N.readTiles(e,n,l)}n.eofOffset=n.ptr,t.inputOffset?(a=n.headerInfo.blobSize+t.inputOffset-n.ptr,1<=Math.abs(a)&&(n.eofOffset=t.inputOffset+n.headerInfo.blobSize)):(a=n.headerInfo.blobSize-n.ptr,1<=Math.abs(a)&&(n.eofOffset=n.headerInfo.blobSize));var d={width:s.width,height:s.height,pixelData:n.pixels.resultPixels,minValue:s.zMin,maxValue:s.zMax,validPixelCount:s.numValidPixel,dimCount:s.numDims,dimStats:{minValues:s.minValues,maxValues:s.maxValues},maskData:n.pixels.resultMask};if(n.pixels.resultMask&&N.isValidPixelValue(s.imageType,i)){for(var h=n.pixels.resultMask,r=0;r<f;r++)h[r]||(d.pixelData[r]=i);d.noDataValue=i}return n.noDataValue=i,t.returnFileInfo&&(d.fileInfo=N.formatFileInfo(n)),d},getBandCount:function(e){for(var t=0,a=0,i={ptr:0,pixels:{}};a<e.byteLength-58;)N.readHeaderInfo(e,i),a+=i.headerInfo.blobSize,t++,i.ptr=a;return t}},t=new ArrayBuffer(4),a=new Uint8Array(t),y=(new Uint32Array(t)[0]=1)===a[0],i.Lerc={decode:function(e,t){if(!y)throw"Big endian system is not supported.";var a,i,r=(t=t||{}).inputOffset||0,n=new Uint8Array(e,r,10),n=String.fromCharCode.apply(null,n);if("CntZImage"===n.trim())a=x,i=1;else{if("Lerc2"!==n.substring(0,5))throw"Unexpected file identifier string: "+n;a=w,i=2}for(var s,o,l,f,u,c,d=0,h=e.byteLength-10,m=[],g={width:0,height:0,pixels:[],pixelType:t.pixelType,mask:null,statistics:[]};r<h;){var p=a.decode(e,{inputOffset:r,encodedMaskData:s,maskData:l,returnMask:0===d,returnEncodedMask:0===d,returnFileInfo:!0,pixelType:t.pixelType||null,noDataValue:t.noDataValue||null}),r=p.fileInfo.eofOffset;0===d&&(s=p.encodedMaskData,l=p.maskData,g.width=p.width,g.height=p.height,g.dimCount=p.dimCount||1,g.pixelType=p.pixelType||p.fileInfo.pixelType,g.mask=p.maskData),1<i&&p.fileInfo.mask&&0<p.fileInfo.mask.numBytes&&m.push(p.maskData),d++,g.pixels.push(p.pixelData),g.statistics.push({minValue:p.minValue,maxValue:p.maxValue,noDataValue:p.noDataValue,dimStats:p.dimStats})}if(1<i&&1<m.length){for(c=g.width*g.height,g.bandMasks=m,(l=new Uint8Array(c)).set(m[0]),f=1;f<m.length;f++)for(o=m[f],u=0;u<c;u++)l[u]=l[u]&o[u];g.maskData=l}return g}},i.Lerc);return e(function(e,t){if(e.encoding===u.LERC){try{a=A.decode(e.heightmap)}catch(e){throw new r.RuntimeError(e)}if(a.statistics[0].minValue===Number.MAX_VALUE)throw new r.RuntimeError("Invalid tile data");e.heightmap=a.pixels[0],e.width=a.width,e.height=a.height}e.ellipsoid=$e.Ellipsoid.clone(e.ellipsoid),e.rectangle=$e.Rectangle.clone(e.rectangle);var a=ft.computeVertices(e),i=a.vertices;return t.push(i.buffer),{vertices:i.buffer,numberOfAttributes:a.encoding.stride,minimumHeight:a.minimumHeight,maximumHeight:a.maximumHeight,gridWidth:e.width,gridHeight:e.height,boundingSphere3D:a.boundingSphere3D,orientedBoundingBox:a.orientedBoundingBox,occludeePointInScaledSpace:a.occludeePointInScaledSpace,encoding:a.encoding,westIndicesSouthToNorth:a.westIndicesSouthToNorth,southIndicesEastToWest:a.southIndicesEastToWest,eastIndicesNorthToSouth:a.eastIndicesNorthToSouth,northIndicesWestToEast:a.northIndicesWestToEast,aspect:a.aspect,repeat:a.repeat}})});
