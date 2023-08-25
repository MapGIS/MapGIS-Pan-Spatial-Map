define(["./Transforms-75c1d9a1","./BoxGeometry-13026ce3","./Cartesian2-c1eb9da0","./Color-b3353b71","./CylinderGeometry-ea8d45f7","./when-ae2e0b60","./EllipsoidGeometry-6a2f4f30","./IndexDatatype-516320ea","./createTaskProcessorWorker","./Check-f996273c","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./GeometryOffsetAttribute-b02d5bb9","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./GeometryAttribute-842f7f8f","./GeometryAttributes-5ce4955a","./VertexFormat-90d15264","./CylinderGeometryLibrary-88cb80d2"],function(S,k,T,V,M,F,B,w,e,t,n,r,a,i,o,s,d,c,f,x){"use strict";function R(e){this.offset=e.offset,this.count=e.count,this.color=e.color,this.batchIds=e.batchIds}var l=new T.Cartesian3,u=S.Matrix4.packedLength+T.Cartesian3.packedLength,h=S.Matrix4.packedLength+2,b=S.Matrix4.packedLength+T.Cartesian3.packedLength,p=T.Cartesian3.packedLength+1,y={modelMatrix:new S.Matrix4,boundingVolume:new S.BoundingSphere};function A(e,t){var t=t*u,n=T.Cartesian3.unpack(e,t,l),e=(t+=T.Cartesian3.packedLength,S.Matrix4.unpack(e,t,y.modelMatrix)),t=(S.Matrix4.multiplyByScale(e,n,e),y.boundingVolume);return T.Cartesian3.clone(T.Cartesian3.ZERO,t.center),t.radius=Math.sqrt(3),y}function O(e,t){var t=t*h,n=e[t++],r=e[t++],n=T.Cartesian3.fromElements(n,n,r,l),r=S.Matrix4.unpack(e,t,y.modelMatrix),e=(S.Matrix4.multiplyByScale(r,n,r),y.boundingVolume);return T.Cartesian3.clone(T.Cartesian3.ZERO,e.center),e.radius=Math.sqrt(2),y}function L(e,t){var t=t*b,n=T.Cartesian3.unpack(e,t,l),e=(t+=T.Cartesian3.packedLength,S.Matrix4.unpack(e,t,y.modelMatrix)),t=(S.Matrix4.multiplyByScale(e,n,e),y.boundingVolume);return T.Cartesian3.clone(T.Cartesian3.ZERO,t.center),t.radius=1,y}function E(e,t){var t=t*p,n=e[t++],e=T.Cartesian3.unpack(e,t,l),t=S.Matrix4.fromTranslation(e,y.modelMatrix),e=(S.Matrix4.multiplyByUniformScale(t,n,t),y.boundingVolume);return T.Cartesian3.clone(T.Cartesian3.ZERO,e.center),e.radius=1,y}var Z=new T.Cartesian3;function U(e,t,n,r,a){if(F.defined(t)){for(var i=n.length,o=r.attributes.position.values,s=r.indices,d=e.positions,c=e.vertexBatchIds,f=e.indices,l=e.batchIds,u=e.batchTableColors,h=e.batchedIndices,b=e.indexOffsets,p=e.indexCounts,y=e.boundingVolumes,x=e.modelMatrix,g=e.center,C=e.positionOffset,m=e.batchIdIndex,v=e.indexOffset,I=e.batchedIndicesOffset,k=0;k<i;++k){for(var M=a(t,k),B=M.modelMatrix,w=(S.Matrix4.multiply(x,B,B),n[k]),A=o.length,O=0;O<A;O+=3){var L=T.Cartesian3.unpack(o,O,Z);S.Matrix4.multiplyByPoint(B,L,L),T.Cartesian3.subtract(L,g,L),T.Cartesian3.pack(L,d,3*C+O),c[m++]=w}for(var E=s.length,U=0;U<E;++U)f[v+U]=s[U]+C;var G=k+I;h[G]=new R({offset:v,count:E,color:V.Color.fromRgba(u[w]),batchIds:[w]}),l[G]=w,b[G]=v,p[G]=E,y[G]=S.BoundingSphere.transform(M.boundingVolume,B),C+=A/3,v+=E}e.positionOffset=C,e.batchIdIndex=m,e.indexOffset=v,e.batchedIndicesOffset+=i}}var G=new T.Cartesian3,D=new S.Matrix4;function P(e,t,n){var r=n.length,a=2+r*S.BoundingSphere.packedLength+1+function(e){for(var t=e.length,n=0,r=0;r<t;++r)n+=V.Color.packedLength+3+e[r].batchIds.length;return n}(t),i=new Float64Array(a),o=0;i[o++]=e,i[o++]=r;for(var s=0;s<r;++s)S.BoundingSphere.pack(n[s],i,o),o+=S.BoundingSphere.packedLength;var d=t.length;i[o++]=d;for(var c=0;c<d;++c){var f=t[c],l=(V.Color.pack(f.color,i,o),o+=V.Color.packedLength,i[o++]=f.offset,i[o++]=f.count,f.batchIds),u=l.length;i[o++]=u;for(var h=0;h<u;++h)i[o++]=l[h]}return i}return e(function(e,t){var n=F.defined(e.boxes)?new Float32Array(e.boxes):void 0,r=F.defined(e.boxBatchIds)?new Uint16Array(e.boxBatchIds):void 0,a=F.defined(e.cylinders)?new Float32Array(e.cylinders):void 0,i=F.defined(e.cylinderBatchIds)?new Uint16Array(e.cylinderBatchIds):void 0,o=F.defined(e.ellipsoids)?new Float32Array(e.ellipsoids):void 0,s=F.defined(e.ellipsoidBatchIds)?new Uint16Array(e.ellipsoidBatchIds):void 0,d=F.defined(e.spheres)?new Float32Array(e.spheres):void 0,c=F.defined(e.sphereBatchIds)?new Uint16Array(e.sphereBatchIds):void 0,f=F.defined(n)?r.length:0,l=F.defined(a)?i.length:0,u=F.defined(o)?s.length:0,h=F.defined(d)?c.length:0,b=k.BoxGeometry.getUnitBox(),p=M.CylinderGeometry.getUnitCylinder(),y=B.EllipsoidGeometry.getUnitEllipsoid(),x=b.attributes.position.values,g=p.attributes.position.values,C=y.attributes.position.values,x=x.length*f,g=(x=(x+=g.length*l)+C.length*(u+h),b.indices),C=p.indices,m=y.indices,g=g.length*f,C=(g=(g+=C.length*l)+m.length*(u+h),new Float32Array(x)),m=new Uint16Array(x/3),x=w.IndexDatatype.createTypedArray(x/3,g),g=f+l+u+h,f=new Uint16Array(g),l=new Array(g),u=new Uint32Array(g),h=new Uint32Array(g),g=new Array(g);v=e.packedBuffer,v=new Float64Array(v),I=0,T.Cartesian3.unpack(v,0,G),I+=T.Cartesian3.packedLength,S.Matrix4.unpack(v,I,D);U(v={batchTableColors:new Uint32Array(e.batchTableColors),positions:C,vertexBatchIds:m,indices:x,batchIds:f,batchedIndices:l,indexOffsets:u,indexCounts:h,boundingVolumes:g,positionOffset:0,batchIdIndex:0,indexOffset:0,batchedIndicesOffset:0,modelMatrix:D,center:G},n,r,b,A),U(v,a,i,p,O),U(v,o,s,y,L),U(v,d,c,y,E);var v,I=P(x.BYTES_PER_ELEMENT,l,g);return t.push(C.buffer,m.buffer,x.buffer),t.push(f.buffer,u.buffer,h.buffer),t.push(I.buffer),{positions:C.buffer,vertexBatchIds:m.buffer,indices:x.buffer,indexOffsets:u.buffer,indexCounts:h.buffer,batchIds:f.buffer,packedBuffer:I.buffer}})});
