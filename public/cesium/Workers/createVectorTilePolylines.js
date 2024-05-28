define(["./Matrix2-59fd2efe","./combine-276652d0","./AttributeCompression-2f7b45b7","./ComponentDatatype-b7b5db18","./IndexDatatype-6902a37d","./createTaskProcessorWorker","./RuntimeError-24b14c10","./when-ae2e0b60","./WebGLConstants-35626ea2"],function(S,_,G,W,B,a,e,r,n){"use strict";var O=32767,z=new S.Cartographic,H=new S.Cartesian3;var Y=new S.Rectangle,Z=new S.Ellipsoid,j=new S.Cartesian3,q={min:void 0,max:void 0};var J=new S.Cartesian3,K=new S.Cartesian3,Q=new S.Cartesian3,V=new S.Cartesian3,X=new S.Cartesian3;return a(function(a,e){var r=new Uint16Array(a.positions),n=new Uint16Array(a.widths),t=new Uint32Array(a.counts),i=new Uint16Array(a.batchIds);s=a.packedBuffer,s=new Float64Array(s),f=0,q.min=s[f++],q.max=s[f++],S.Rectangle.unpack(s,2,Y),f+=S.Rectangle.packedLength,S.Ellipsoid.unpack(s,f,Z),f+=S.Ellipsoid.packedLength,S.Cartesian3.unpack(s,f,j);for(var s=Z,o=j,u=function(a,e,r,n,t){for(var i=a.length/3,s=a.subarray(0,i),o=a.subarray(i,2*i),u=a.subarray(2*i,3*i),f=(G.AttributeCompression.zigZagDeltaDecode(s,o,u),new Float64Array(a.length)),c=0;c<i;++c){var p=s[c],d=o[c],b=u[c],p=W.CesiumMath.lerp(e.west,e.east,p/O),d=W.CesiumMath.lerp(e.south,e.north,d/O),b=W.CesiumMath.lerp(r,n,b/O),p=S.Cartographic.fromRadians(p,d,b,z),d=t.cartographicToCartesian(p,H);S.Cartesian3.pack(d,f,3*c)}return f}(r,Y,q.min,q.max,s),f=u.length/3,r=4*f-4,c=new Float32Array(3*r),p=new Float32Array(3*r),d=new Float32Array(3*r),b=new Float32Array(2*r),C=new Uint16Array(r),w=0,l=0,h=0,y=0,k=t.length,m=0;m<k;++m){for(var v=t[m],A=n[m],g=i[m],x=0;x<v;++x){0===x?(I=S.Cartesian3.unpack(u,3*y,J),E=S.Cartesian3.unpack(u,3*(y+1),K),D=S.Cartesian3.subtract(I,E,Q),S.Cartesian3.add(I,D,D)):D=S.Cartesian3.unpack(u,3*(y+x-1),Q);var D,E,I,P,U=S.Cartesian3.unpack(u,3*(y+x),V);x===v-1?(E=S.Cartesian3.unpack(u,3*(y+v-1),J),I=S.Cartesian3.unpack(u,3*(y+v-2),K),P=S.Cartesian3.subtract(E,I,X),S.Cartesian3.add(E,P,P)):P=S.Cartesian3.unpack(u,3*(y+x+1),X),S.Cartesian3.subtract(D,o,D),S.Cartesian3.subtract(U,o,U),S.Cartesian3.subtract(P,o,P);for(var R=x===v-1?2:4,T=0===x?2:0;T<R;++T){S.Cartesian3.pack(U,c,w),S.Cartesian3.pack(D,p,w),S.Cartesian3.pack(P,d,w),w+=3;var F=T-2<0?-1:1;b[l++]=T%2*2-1,b[l++]=F*A,C[h++]=g}}y+=v}var N=B.IndexDatatype.createTypedArray(r,6*f-6),M=0,L=0,k=f-1;for(m=0;m<k;++m)N[L++]=M,N[L++]=M+2,N[L++]=M+1,N[L++]=M+1,N[L++]=M+2,N[L++]=M+3,M+=4;return e.push(c.buffer,p.buffer,d.buffer),e.push(b.buffer,C.buffer,N.buffer),s={indexDatatype:2===N.BYTES_PER_ELEMENT?B.IndexDatatype.UNSIGNED_SHORT:B.IndexDatatype.UNSIGNED_INT,currentPositions:c.buffer,previousPositions:p.buffer,nextPositions:d.buffer,expandAndWidth:b.buffer,batchIds:C.buffer,indices:N.buffer},a.keepDecodedPositions&&(r=function(a){for(var e=a.length,r=new Uint32Array(e+1),n=0,t=0;t<e;++t)r[t]=n,n+=a[t];return r[e]=n,r}(t),e.push(u.buffer,r.buffer),s=_.combine(s,{decodedPositions:u.buffer,decodedPositionOffsets:r.buffer})),s})});
