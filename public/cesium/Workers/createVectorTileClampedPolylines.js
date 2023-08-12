define(["./AttributeCompression-b9605c73","./Cartesian2-c1eb9da0","./combine-276652d0","./IndexDatatype-516320ea","./Math-5bbcea10","./createTaskProcessorWorker","./Check-f996273c","./when-ae2e0b60","./WebGLConstants-35626ea2"],function(aa,ea,ta,ra,sa,a,e,t,r){"use strict";var na=32767,i=Math.cos(sa.CesiumMath.toRadians(150)),ia=new ea.Cartographic,oa=new ea.Cartesian3;var da=new ea.Cartographic,la=new ea.Cartographic;function ca(a){var e=8*a,t=3*e,r=4*e;this.startEllipsoidNormals=new Float32Array(t),this.endEllipsoidNormals=new Float32Array(t),this.startPositionAndHeights=new Float32Array(r),this.startFaceNormalAndVertexCornerIds=new Float32Array(r),this.endPositionAndHeights=new Float32Array(r),this.endFaceNormalAndHalfWidths=new Float32Array(r),this.vertexBatchIds=new Uint16Array(e),this.indices=ra.IndexDatatype.createTypedArray(e,36*a),this.vec3Offset=0,this.vec4Offset=0,this.batchIdOffset=0,this.indexOffset=0,this.volumeStartIndex=0}var o=new ea.Cartesian3,d=new ea.Cartesian3;function H(a,e,t,r,s){var t=ea.Cartesian3.subtract(t,e,d),n=ea.Cartesian3.subtract(e,a,o);return ea.Cartesian3.normalize(t,t),ea.Cartesian3.normalize(n,n),ea.Cartesian3.dot(t,n)<i&&(n=ea.Cartesian3.multiplyByScalar(n,-1,o)),ea.Cartesian3.add(t,n,s),ea.Cartesian3.equals(s,ea.Cartesian3.ZERO)&&(s=ea.Cartesian3.subtract(a,e)),ea.Cartesian3.cross(s,r,s),ea.Cartesian3.cross(r,s,s),ea.Cartesian3.normalize(s,s),s}var O=[0,2,6,0,6,4,0,1,3,0,3,2,0,4,5,0,5,1,5,3,1,5,7,3,7,5,4,7,4,6,7,6,2,7,2,3],P=O.length,D=new ea.Cartesian3,S=new ea.Cartesian3,M=new ea.Cartesian3,U=new ea.Cartesian3,B=new ea.Cartesian3,fa=(ca.prototype.addVolume=function(a,e,t,r,s,n,i,o,d,l){for(var c=ea.Cartesian3.add(e,d,D),f=l.geodeticSurfaceNormal(c,S),c=ea.Cartesian3.add(t,d,D),h=l.geodeticSurfaceNormal(c,U),u=H(a,e,t,f,M),C=H(r,t,e,h,B),p=this.startEllipsoidNormals,b=this.endEllipsoidNormals,m=this.startPositionAndHeights,A=this.startFaceNormalAndVertexCornerIds,w=this.endPositionAndHeights,g=this.endFaceNormalAndHalfWidths,v=this.vertexBatchIds,y=this.batchIdOffset,N=this.vec3Offset,k=this.vec4Offset,I=0;I<8;I++)ea.Cartesian3.pack(f,p,N),ea.Cartesian3.pack(h,b,N),ea.Cartesian3.pack(e,m,k),m[k+3]=s,ea.Cartesian3.pack(t,w,k),w[k+3]=n,ea.Cartesian3.pack(u,A,k),A[k+3]=I,ea.Cartesian3.pack(C,g,k),g[k+3]=i,v[y++]=o,N+=3,k+=4;this.batchIdOffset=y,this.vec3Offset=N,this.vec4Offset=k;var x=this.indices,E=this.volumeStartIndex,F=this.indexOffset;for(I=0;I<P;I++)x[F+I]=O[I]+E;this.volumeStartIndex+=8,this.indexOffset+=P},new ea.Rectangle),ha=new ea.Ellipsoid,ua=new ea.Cartesian3,Ca=new ea.Cartesian3,pa=new ea.Cartesian3,ba=new ea.Cartesian3,ma=new ea.Cartesian3;return a(function(a,e){for(var t=new Uint16Array(a.positions),B=new Uint16Array(a.widths),r=new Uint32Array(a.counts),R=new Uint16Array(a.batchIds),s=fa,n=ha,i=ua,o=new Float64Array(a.packedBuffer),d=0,l=o[d++],c=o[d++],f=(ea.Rectangle.unpack(o,2,s),d+=ea.Rectangle.packedLength,ea.Ellipsoid.unpack(o,d,n),d+=ea.Ellipsoid.packedLength,ea.Cartesian3.unpack(o,d,i),t.length/3),o=t.subarray(0,f),d=t.subarray(f,2*f),h=t.subarray(2*f,3*f),u=(aa.AttributeCompression.zigZagDeltaDecode(o,d,h),o),C=d,T=h,p=r,V=p.length,W=u.length,z=new Uint8Array(W),b=da,m=la,q=0,A=0;A<V;A++){for(var w=p[A],L=w,g=1;g<w;g++){var _=q+g,G=_-1;m.longitude=u[_],m.latitude=C[_],b.longitude=u[G],b.latitude=C[G],ea.Cartographic.equals(m,b)&&(L--,z[G]=1)}p[A]=L,q+=w}for(var v=0,y=0;y<W;y++)1!==z[y]&&(u[v]=u[y],C[v]=C[y],T[v]=T[y],v++);for(var Z=r.length,Y=0,N=0;N<Z;N++)Y+=r[N]-1;var k=new ca(Y),I=function(a,e,t,r,s,n,i){for(var o=a.length,d=new Float64Array(3*o),l=0;l<o;++l){var c=a[l],f=e[l],h=t[l],c=sa.CesiumMath.lerp(r.west,r.east,c/na),f=sa.CesiumMath.lerp(r.south,r.north,f/na),h=sa.CesiumMath.lerp(s,n,h/na),c=ea.Cartographic.fromRadians(c,f,h,ia),f=i.cartographicToCartesian(c,oa);ea.Cartesian3.pack(f,d,3*l)}return d}(o,d,h,s,l,c,n),f=o.length,x=new Float32Array(3*f);for(N=0;N<f;++N)x[3*N]=I[3*N]-i.x,x[3*N+1]=I[3*N+1]-i.y,x[3*N+2]=I[3*N+2]-i.z;var E=0,F=0;for(N=0;N<Z;N++){for(var j=r[N]-1,J=.5*B[N],K=R[N],Q=E,H=0;H<j;H++){var O,P,D=ea.Cartesian3.unpack(x,E,pa),S=ea.Cartesian3.unpack(x,E+3,ba),X=h[F],$=h[F+1],X=sa.CesiumMath.lerp(l,c,X/na),$=sa.CesiumMath.lerp(l,c,$/na),M=(F++,Ca),U=ma;0===H?(P=ea.Cartesian3.unpack(x,O=Q+3*j,Ca),ea.Cartesian3.equals(P,D)?ea.Cartesian3.unpack(x,O-3,M):(P=ea.Cartesian3.subtract(D,S,Ca),M=ea.Cartesian3.add(P,D,Ca))):ea.Cartesian3.unpack(x,E-3,M),H===j-1?(O=ea.Cartesian3.unpack(x,Q,ma),ea.Cartesian3.equals(O,S)?ea.Cartesian3.unpack(x,Q+3,U):(P=ea.Cartesian3.subtract(S,D,ma),U=ea.Cartesian3.add(P,S,ma))):ea.Cartesian3.unpack(x,E+6,U),k.addVolume(M,D,S,U,X,$,J,K,i,n),E+=3}E+=3,F++}return t=k.indices,e.push(k.startEllipsoidNormals.buffer),e.push(k.endEllipsoidNormals.buffer),e.push(k.startPositionAndHeights.buffer),e.push(k.startFaceNormalAndVertexCornerIds.buffer),e.push(k.endPositionAndHeights.buffer),e.push(k.endFaceNormalAndHalfWidths.buffer),e.push(k.vertexBatchIds.buffer),e.push(t.buffer),d={indexDatatype:2===t.BYTES_PER_ELEMENT?ra.IndexDatatype.UNSIGNED_SHORT:ra.IndexDatatype.UNSIGNED_INT,startEllipsoidNormals:k.startEllipsoidNormals.buffer,endEllipsoidNormals:k.endEllipsoidNormals.buffer,startPositionAndHeights:k.startPositionAndHeights.buffer,startFaceNormalAndVertexCornerIds:k.startFaceNormalAndVertexCornerIds.buffer,endPositionAndHeights:k.endPositionAndHeights.buffer,endFaceNormalAndHalfWidths:k.endFaceNormalAndHalfWidths.buffer,vertexBatchIds:k.vertexBatchIds.buffer,indices:t.buffer},a.keepDecodedPositions&&(s=function(a){for(var e=a.length,t=new Uint32Array(e+1),r=0,s=0;s<e;++s)t[s]=r,r+=a[s];return t[e]=r,t}(r),e.push(I.buffer,s.buffer),d=ta.combine(d,{decodedPositions:I.buffer,decodedPositionOffsets:s.buffer})),d})});
