define(["./Cartesian2-38b35910","./combine-276652d0","./AttributeCompression-25f42564","./Math-5bbcea10","./IndexDatatype-516320ea","./createTaskProcessorWorker","./Check-f996273c","./when-ae2e0b60","./WebGLConstants-35626ea2"],function(S,_,G,W,B,a,e,r,n){"use strict";var O=32767,z=new S.Cartographic,H=new S.Cartesian3;var Y=new S.Rectangle,Z=new S.Ellipsoid,j=new S.Cartesian3,q={min:void 0,max:void 0};var J=new S.Cartesian3,K=new S.Cartesian3,Q=new S.Cartesian3,V=new S.Cartesian3,X=new S.Cartesian3;return a(function(a,e){var r=new Uint16Array(a.positions),n=new Uint16Array(a.widths),t=new Uint32Array(a.counts),i=new Uint16Array(a.batchIds);s=a.packedBuffer,s=new Float64Array(s),c=0,q.min=s[c++],q.max=s[c++],S.Rectangle.unpack(s,2,Y),c+=S.Rectangle.packedLength,S.Ellipsoid.unpack(s,c,Z),c+=S.Ellipsoid.packedLength,S.Cartesian3.unpack(s,c,j);for(var s=Z,o=j,u=function(a,e,r,n,t){for(var i=a.length/3,s=a.subarray(0,i),o=a.subarray(i,2*i),u=a.subarray(2*i,3*i),c=(G.AttributeCompression.zigZagDeltaDecode(s,o,u),new Float64Array(a.length)),f=0;f<i;++f){var p=s[f],d=o[f],C=u[f],p=W.CesiumMath.lerp(e.west,e.east,p/O),d=W.CesiumMath.lerp(e.south,e.north,d/O),C=W.CesiumMath.lerp(r,n,C/O),p=S.Cartographic.fromRadians(p,d,C,z),d=t.cartographicToCartesian(p,H);S.Cartesian3.pack(d,c,3*f)}return c}(r,Y,q.min,q.max,s),c=u.length/3,r=4*c-4,f=new Float32Array(3*r),p=new Float32Array(3*r),d=new Float32Array(3*r),C=new Float32Array(2*r),b=new Uint16Array(r),h=0,w=0,l=0,y=0,k=t.length,v=0;v<k;++v){for(var A=t[v],g=n[v],m=i[v],x=0;x<A;++x){0===x?(I=S.Cartesian3.unpack(u,3*y,J),E=S.Cartesian3.unpack(u,3*(y+1),K),D=S.Cartesian3.subtract(I,E,Q),S.Cartesian3.add(I,D,D)):D=S.Cartesian3.unpack(u,3*(y+x-1),Q);var D,E,I,P,U=S.Cartesian3.unpack(u,3*(y+x),V);x===A-1?(E=S.Cartesian3.unpack(u,3*(y+A-1),J),I=S.Cartesian3.unpack(u,3*(y+A-2),K),P=S.Cartesian3.subtract(E,I,X),S.Cartesian3.add(E,P,P)):P=S.Cartesian3.unpack(u,3*(y+x+1),X),S.Cartesian3.subtract(D,o,D),S.Cartesian3.subtract(U,o,U),S.Cartesian3.subtract(P,o,P);for(var T=x===A-1?2:4,F=0===x?2:0;F<T;++F){S.Cartesian3.pack(U,f,h),S.Cartesian3.pack(D,p,h),S.Cartesian3.pack(P,d,h),h+=3;var N=F-2<0?-1:1;C[w++]=F%2*2-1,C[w++]=N*g,b[l++]=m}}y+=A}var R=B.IndexDatatype.createTypedArray(r,6*c-6),M=0,L=0,k=c-1;for(v=0;v<k;++v)R[L++]=M,R[L++]=M+2,R[L++]=M+1,R[L++]=M+1,R[L++]=M+2,R[L++]=M+3,M+=4;return e.push(f.buffer,p.buffer,d.buffer),e.push(C.buffer,b.buffer,R.buffer),s={indexDatatype:2===R.BYTES_PER_ELEMENT?B.IndexDatatype.UNSIGNED_SHORT:B.IndexDatatype.UNSIGNED_INT,currentPositions:f.buffer,previousPositions:p.buffer,nextPositions:d.buffer,expandAndWidth:C.buffer,batchIds:b.buffer,indices:R.buffer},a.keepDecodedPositions&&(r=function(a){for(var e=a.length,r=new Uint32Array(e+1),n=0,t=0;t<e;++t)r[t]=n,n+=a[t];return r[e]=n,r}(t),e.push(u.buffer,r.buffer),s=_.combine(s,{decodedPositions:u.buffer,decodedPositionOffsets:r.buffer})),s})});
