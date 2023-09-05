define(["./AttributeCompression-b9605c73","./Cartesian2-c1eb9da0","./Color-98ea9560","./when-ae2e0b60","./IndexDatatype-516320ea","./Math-5bbcea10","./OrientedBoundingBox-33a0a521","./createTaskProcessorWorker","./Check-f996273c","./Transforms-5a0f5c0d","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2","./EllipsoidTangentPlane-27707043","./AxisAlignedBoundingBox-996de4d7","./IntersectionTests-f6c80ab5","./Plane-07db2b77"],function(me,ye,Ie,we,xe,ve,Ae,e,a,n,r,t,i,o,s,d,f){"use strict";var Ee=new ye.Cartesian3,Ne=new ye.Ellipsoid,Te=new ye.Rectangle,ke={min:void 0,max:void 0,indexBytesPerElement:void 0};function Be(e,a,n){var r=a.length,t=2+r*Ae.OrientedBoundingBox.packedLength+1+function(e){for(var a=e.length,n=0,r=0;r<a;++r)n+=Ie.Color.packedLength+3+e[r].batchIds.length;return n}(n),i=new Float64Array(t),o=0;i[o++]=e,i[o++]=r;for(var s=0;s<r;++s)Ae.OrientedBoundingBox.pack(a[s],i,o),o+=Ae.OrientedBoundingBox.packedLength;var d=n.length;i[o++]=d;for(var f=0;f<d;++f){var c=n[f],u=(Ie.Color.pack(c.color,i,o),o+=Ie.Color.packedLength,i[o++]=c.offset,i[o++]=c.count,c.batchIds),h=u.length;i[o++]=h;for(var l=0;l<h;++l)i[o++]=u[l]}return i}var Le=new ye.Cartesian3,Oe=new ye.Cartesian3,Ue=new ye.Cartesian3,Pe=new ye.Cartesian3,Fe=new ye.Cartesian3,Se=new ye.Cartographic,Re=new ye.Rectangle;return e(function(e,R){n=e.packedBuffer,n=new Float64Array(n),S=0,ke.indexBytesPerElement=n[S++],ke.min=n[S++],ke.max=n[S++],ye.Cartesian3.unpack(n,3,Ee),S+=ye.Cartesian3.packedLength,ye.Ellipsoid.unpack(n,S,Ne),S+=ye.Ellipsoid.packedLength,ye.Rectangle.unpack(n,S,Te);for(var a=new(2===ke.indexBytesPerElement?Uint16Array:Uint32Array)(e.indices),n=new Uint16Array(e.positions),r=new Uint32Array(e.counts),t=new Uint32Array(e.indexCounts),D=new Uint32Array(e.batchIds),M=new Uint32Array(e.batchTableColors),_=new Array(r.length),G=Ee,i=Ne,o=Te,Y=ke.min,V=ke.max,s=e.minimumHeights,d=e.maximumHeights,f=(we.defined(s)&&we.defined(d)&&(s=new Float32Array(s),d=new Float32Array(d)),n.length/2),H=n.subarray(0,f),W=n.subarray(f,2*f),z=(me.AttributeCompression.zigZagDeltaDecode(H,W),new Float64Array(3*f)),c=0;c<f;++c){var u=H[c],h=W[c],u=ve.CesiumMath.lerp(o.west,o.east,u/32767),h=ve.CesiumMath.lerp(o.south,o.north,h/32767),u=ye.Cartographic.fromRadians(u,h,0,Se),h=i.cartographicToCartesian(u,Le);ye.Cartesian3.pack(h,z,3*c)}var l=r.length,Z=new Array(l),g=new Array(l),j=0,q=0;for(c=0;c<l;++c)Z[c]=j,g[c]=q,j+=r[c],q+=t[c];var p=new Float32Array(3*f*2),b=new Uint16Array(2*f),C=new Uint32Array(g.length),m=new Uint32Array(t.length),y=[],I={};for(c=0;c<l;++c)x=M[c],we.defined(I[x])?(I[x].positionLength+=r[c],I[x].indexLength+=t[c],I[x].batchIds.push(c)):I[x]={positionLength:r[c],indexLength:t[c],offset:0,indexOffset:0,batchIds:[c]};var J,K=0,Q=0;for(x in I)I.hasOwnProperty(x)&&((v=I[x]).offset=K,v.indexOffset=Q,K+=2*v.positionLength,Q+=J=2*v.indexLength+6*v.positionLength,v.indexLength=J);var w=[];for(x in I)I.hasOwnProperty(x)&&(v=I[x],w.push({color:Ie.Color.fromRgba(parseInt(x)),offset:v.indexOffset,count:v.indexLength,batchIds:v.batchIds}));for(c=0;c<l;++c){for(var x,v,A=(v=I[x=M[c]]).offset,E=3*A,N=A,T=Z[c],k=r[c],X=D[c],$=Y,ee=V,ae=(we.defined(s)&&we.defined(d)&&($=s[c],ee=d[c]),Number.POSITIVE_INFINITY),ne=Number.NEGATIVE_INFINITY,re=Number.POSITIVE_INFINITY,te=Number.NEGATIVE_INFINITY,B=0;B<k;++B){var L=ye.Cartesian3.unpack(z,3*T+3*B,Le),O=(i.scaleToGeodeticSurface(L,L),i.cartesianToCartographic(L,Se)),U=O.latitude,O=O.longitude,ae=Math.min(U,ae),ne=Math.max(U,ne),re=Math.min(O,re),te=Math.max(O,te),U=i.geodeticSurfaceNormal(L,Oe),O=ye.Cartesian3.multiplyByScalar(U,$,Ue),ie=ye.Cartesian3.add(L,O,Pe),O=ye.Cartesian3.multiplyByScalar(U,ee,O),U=ye.Cartesian3.add(L,O,Fe);ye.Cartesian3.subtract(U,G,U),ye.Cartesian3.subtract(ie,G,ie),ye.Cartesian3.pack(U,p,E),ye.Cartesian3.pack(ie,p,E+3),b[N]=X,b[N+1]=X,E+=6,N+=2}(o=Re).west=re,o.east=te,o.south=ae,o.north=ne,_[c]=Ae.OrientedBoundingBox.fromRectangle(o,Y,V,i);var P=v.indexOffset,oe=g[c],se=t[c];for(C[c]=P,B=0;B<se;B+=3){var de=a[oe+B]-T,fe=a[oe+B+1]-T,ce=a[oe+B+2]-T;y[P++]=2*de+A,y[P++]=2*fe+A,y[P++]=2*ce+A,y[P++]=2*ce+1+A,y[P++]=2*fe+1+A,y[P++]=2*de+1+A}for(B=0;B<k;++B){var ue=B,he=(B+1)%k;y[P++]=2*ue+1+A,y[P++]=2*he+A,y[P++]=2*ue+A,y[P++]=2*ue+1+A,y[P++]=2*he+1+A,y[P++]=2*he+A}v.offset+=2*k,v.indexOffset=P,m[c]=P-C[c]}for(var y=xe.IndexDatatype.createTypedArray(p.length/3,y),le=w.length,F=0;F<le;++F){for(var ge=w[F].batchIds,pe=0,be=ge.length,Ce=0;Ce<be;++Ce)pe+=m[ge[Ce]];w[F].count=pe}var S=Be(2===y.BYTES_PER_ELEMENT?xe.IndexDatatype.UNSIGNED_SHORT:xe.IndexDatatype.UNSIGNED_INT,_,w);return R.push(p.buffer,y.buffer,C.buffer,m.buffer,b.buffer,S.buffer),{positions:p.buffer,indices:y.buffer,indexOffsets:C.buffer,indexCounts:m.buffer,batchIds:b.buffer,packedBuffer:S.buffer}})});
