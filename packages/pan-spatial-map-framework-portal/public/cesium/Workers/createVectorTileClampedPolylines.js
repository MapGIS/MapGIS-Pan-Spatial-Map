define(["./AttributeCompression-7ed0057c","./Cartesian2-21667d02","./combine-323053a8","./IndexDatatype-14fcdf85","./Math-e1584698","./createTaskProcessorWorker","./Check-91887fdf","./when-0ac5fc51","./WebGLConstants-dd197df0"],function(R,T,V,W,z,a,e,t,r){"use strict";var q=32767,i=Math.cos(z.CesiumMath.toRadians(150)),L=new T.Cartographic,_=new T.Cartesian3;var G=new T.Cartographic,Z=new T.Cartographic;function Y(a){var e=8*a,t=3*e,r=4*e;this.startEllipsoidNormals=new Float32Array(t),this.endEllipsoidNormals=new Float32Array(t),this.startPositionAndHeights=new Float32Array(r),this.startFaceNormalAndVertexCornerIds=new Float32Array(r),this.endPositionAndHeights=new Float32Array(r),this.endFaceNormalAndHalfWidths=new Float32Array(r),this.vertexBatchIds=new Uint16Array(e),this.indices=W.IndexDatatype.createTypedArray(e,36*a),this.vec3Offset=0,this.vec4Offset=0,this.batchIdOffset=0,this.indexOffset=0,this.volumeStartIndex=0}var o=new T.Cartesian3,d=new T.Cartesian3;function H(a,e,t,r,s){var n=T.Cartesian3.subtract(t,e,d),t=T.Cartesian3.subtract(e,a,o);return T.Cartesian3.normalize(n,n),T.Cartesian3.normalize(t,t),T.Cartesian3.dot(n,t)<i&&(t=T.Cartesian3.multiplyByScalar(t,-1,o)),T.Cartesian3.add(n,t,s),T.Cartesian3.equals(s,T.Cartesian3.ZERO)&&(s=T.Cartesian3.subtract(a,e)),T.Cartesian3.cross(s,r,s),T.Cartesian3.cross(r,s,s),T.Cartesian3.normalize(s,s),s}var O=[0,2,6,0,6,4,0,1,3,0,3,2,0,4,5,0,5,1,5,3,1,5,7,3,7,5,4,7,4,6,7,6,2,7,2,3],P=O.length,D=new T.Cartesian3,S=new T.Cartesian3,M=new T.Cartesian3,U=new T.Cartesian3,B=new T.Cartesian3;Y.prototype.addVolume=function(a,e,t,r,s,n,i,o,d,f){for(var l=T.Cartesian3.add(e,d,D),c=f.geodeticSurfaceNormal(l,S),l=T.Cartesian3.add(t,d,D),h=f.geodeticSurfaceNormal(l,U),u=H(a,e,t,c,M),C=H(r,t,e,h,B),p=this.startEllipsoidNormals,m=this.endEllipsoidNormals,A=this.startPositionAndHeights,v=this.startFaceNormalAndVertexCornerIds,w=this.endPositionAndHeights,b=this.endFaceNormalAndHalfWidths,g=this.vertexBatchIds,y=this.batchIdOffset,N=this.vec3Offset,k=this.vec4Offset,I=0;I<8;I++)T.Cartesian3.pack(c,p,N),T.Cartesian3.pack(h,m,N),T.Cartesian3.pack(e,A,k),A[k+3]=s,T.Cartesian3.pack(t,w,k),w[k+3]=n,T.Cartesian3.pack(u,v,k),v[k+3]=I,T.Cartesian3.pack(C,b,k),b[k+3]=i,g[y++]=o,N+=3,k+=4;this.batchIdOffset=y,this.vec3Offset=N,this.vec4Offset=k;var x=this.indices,E=this.volumeStartIndex,F=this.indexOffset;for(I=0;I<P;I++)x[F+I]=O[I]+E;this.volumeStartIndex+=8,this.indexOffset+=P};var j=new T.Rectangle,J=new T.Ellipsoid,K=new T.Cartesian3,Q=new T.Cartesian3,X=new T.Cartesian3,$=new T.Cartesian3,aa=new T.Cartesian3;return a(function(a,e){var t=new Uint16Array(a.positions),r=new Uint16Array(a.widths),s=new Uint32Array(a.counts),n=new Uint16Array(a.batchIds),i=j,o=J,d=K,f=new Float64Array(a.packedBuffer),l=0,c=f[l++],h=f[l++];T.Rectangle.unpack(f,2,i),l+=T.Rectangle.packedLength,T.Ellipsoid.unpack(f,l,o),l+=T.Ellipsoid.packedLength,T.Cartesian3.unpack(f,l,d);var u=t.length/3,f=t.subarray(0,u),l=t.subarray(u,2*u),C=t.subarray(2*u,3*u);R.AttributeCompression.zigZagDeltaDecode(f,l,C),function(a,e,t,r){for(var s=r.length,n=a.length,i=new Uint8Array(n),o=G,d=Z,f=0,l=0;l<s;l++){for(var c=r[l],h=c,u=1;u<c;u++){var C=f+u,p=C-1;d.longitude=a[C],d.latitude=e[C],o.longitude=a[p],o.latitude=e[p],T.Cartographic.equals(d,o)&&(h--,i[p]=1)}r[l]=h,f+=c}for(var m=0,A=0;A<n;A++)1!==i[A]&&(a[m]=a[A],e[m]=e[A],t[m]=t[A],m++)}(f,l,C,s);for(var p=s.length,m=0,A=0;A<p;A++)m+=s[A]-1;var v=new Y(m),w=function(a,e,t,r,s,n,i){for(var o=a.length,d=new Float64Array(3*o),f=0;f<o;++f){var l=a[f],c=e[f],h=t[f],l=z.CesiumMath.lerp(r.west,r.east,l/q),c=z.CesiumMath.lerp(r.south,r.north,c/q),h=z.CesiumMath.lerp(s,n,h/q),h=T.Cartographic.fromRadians(l,c,h,L),h=i.cartographicToCartesian(h,_);T.Cartesian3.pack(h,d,3*f)}return d}(f,l,C,i,c,h,o),u=f.length,b=new Float32Array(3*u);for(A=0;A<u;++A)b[3*A]=w[3*A]-d.x,b[3*A+1]=w[3*A+1]-d.y,b[3*A+2]=w[3*A+2]-d.z;var g=0,y=0;for(A=0;A<p;A++){for(var N=s[A]-1,k=.5*r[A],I=n[A],x=g,E=0;E<N;E++){var F=T.Cartesian3.unpack(b,g,X),H=T.Cartesian3.unpack(b,g+3,$),O=C[y],P=C[y+1],O=z.CesiumMath.lerp(c,h,O/q),P=z.CesiumMath.lerp(c,h,P/q);y++;var D,S,M,U=Q,B=aa;0===E?(S=T.Cartesian3.unpack(b,D=x+3*N,Q),T.Cartesian3.equals(S,F)?T.Cartesian3.unpack(b,D-3,U):(M=T.Cartesian3.subtract(F,H,Q),U=T.Cartesian3.add(M,F,Q))):T.Cartesian3.unpack(b,g-3,U),E===N-1?(M=T.Cartesian3.unpack(b,x,aa),T.Cartesian3.equals(M,H)?T.Cartesian3.unpack(b,x+3,B):(M=T.Cartesian3.subtract(H,F,aa),B=T.Cartesian3.add(M,H,aa))):T.Cartesian3.unpack(b,g+6,B),v.addVolume(U,F,H,B,O,P,k,I,d,o),g+=3}g+=3,y++}return f=v.indices,e.push(v.startEllipsoidNormals.buffer),e.push(v.endEllipsoidNormals.buffer),e.push(v.startPositionAndHeights.buffer),e.push(v.startFaceNormalAndVertexCornerIds.buffer),e.push(v.endPositionAndHeights.buffer),e.push(v.endFaceNormalAndHalfWidths.buffer),e.push(v.vertexBatchIds.buffer),e.push(f.buffer),f={indexDatatype:2===f.BYTES_PER_ELEMENT?W.IndexDatatype.UNSIGNED_SHORT:W.IndexDatatype.UNSIGNED_INT,startEllipsoidNormals:v.startEllipsoidNormals.buffer,endEllipsoidNormals:v.endEllipsoidNormals.buffer,startPositionAndHeights:v.startPositionAndHeights.buffer,startFaceNormalAndVertexCornerIds:v.startFaceNormalAndVertexCornerIds.buffer,endPositionAndHeights:v.endPositionAndHeights.buffer,endFaceNormalAndHalfWidths:v.endFaceNormalAndHalfWidths.buffer,vertexBatchIds:v.vertexBatchIds.buffer,indices:f.buffer},a.keepDecodedPositions&&(a=function(a){for(var e=a.length,t=new Uint32Array(e+1),r=0,s=0;s<e;++s)t[s]=r,r+=a[s];return t[e]=r,t}(s),e.push(w.buffer,a.buffer),f=V.combine(f,{decodedPositions:w.buffer,decodedPositionOffsets:a.buffer})),f})});