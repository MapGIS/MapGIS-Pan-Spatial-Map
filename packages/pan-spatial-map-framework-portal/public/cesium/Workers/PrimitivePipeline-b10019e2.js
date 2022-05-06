define(["exports","./Transforms-5b30acc6","./ComponentDatatype-e44126e4","./when-ae2e0b60","./Check-f996273c","./Cartesian2-38b35910","./GeometryAttribute-792ddfc7","./GeometryAttributes-5ce4955a","./GeometryPipeline-2ecb7ec0","./IndexDatatype-516320ea","./WebMercatorProjection-cf614542"],function(e,w,A,V,t,c,P,k,D,C,f){"use strict";function m(e,t,r){e=V.defaultValue(e,0),t=V.defaultValue(t,0),r=V.defaultValue(r,0),this.value=new Float32Array([e,t,r])}function O(e,t){for(var e=e.attributes,r=e.position,n=r.values.length/r.componentsPerAttribute,i=(e.batchId=new P.GeometryAttribute({componentDatatype:A.ComponentDatatype.FLOAT,componentsPerAttribute:1,values:new Float32Array(n)}),e.batchId.values),o=0;o<n;++o)i[o]=t}function l(e){var t=e.instances,r=e.projection,n=e.elementIndexUintSupported,i=e.scene3DOnly,o=e.vertexCacheOptimize,a=e.compressVertices,e=e.modelMatrix,s=t.length;for(C=0;C<s;++C)if(V.defined(t[C].geometry)){t[C].geometry.primitiveType;break}var d=t,p=!i,u=d.length;if(!p&&1<u)for(var c=d[0].modelMatrix,f=1;f<u;++f)if(!w.Matrix4.equals(c,d[f].modelMatrix)){p=!0;break}if(p)for(f=0;f<u;++f)V.defined(d[f].geometry)&&D.GeometryPipeline.transformToWorldCoordinates(d[f]);else w.Matrix4.multiplyTransformation(e,d[0].modelMatrix,e);if(!i)for(C=0;C<s;++C)V.defined(t[C].geometry)&&D.GeometryPipeline.splitLongitude(t[C]);for(var m=t,h=m.length,l=0;l<h;++l){var g=m[l];V.defined(g.geometry)?O(g.geometry,l):V.defined(g.westHemisphereGeometry)&&V.defined(g.eastHemisphereGeometry)&&(O(g.westHemisphereGeometry,l),O(g.eastHemisphereGeometry,l))}if(o)for(C=0;C<s;++C){var y=t[C];V.defined(y.geometry)?(D.GeometryPipeline.reorderForPostVertexCache(y.geometry),D.GeometryPipeline.reorderForPreVertexCache(y.geometry)):V.defined(y.westHemisphereGeometry)&&V.defined(y.eastHemisphereGeometry)&&(D.GeometryPipeline.reorderForPostVertexCache(y.westHemisphereGeometry),D.GeometryPipeline.reorderForPreVertexCache(y.westHemisphereGeometry),D.GeometryPipeline.reorderForPostVertexCache(y.eastHemisphereGeometry),D.GeometryPipeline.reorderForPreVertexCache(y.eastHemisphereGeometry))}var b=D.GeometryPipeline.combineInstances(t);for(s=b.length,C=0;C<s;++C){var v,G,x,S,P=(v=b[C]).attributes;if(i)for(G in P)P.hasOwnProperty(G)&&P[G].componentDatatype===A.ComponentDatatype.DOUBLE&&D.GeometryPipeline.encodeAttribute(v,G,G+"3DHigh",G+"3DLow");else for(G in P)P.hasOwnProperty(G)&&P[G].componentDatatype===A.ComponentDatatype.DOUBLE&&(D.GeometryPipeline.projectTo2D(v,G,x=G+"3D",S=G+"2D",r),V.defined(v.boundingSphere)&&"position"===G&&(v.boundingSphereCV=w.BoundingSphere.fromVertices(v.attributes.position2D.values)),D.GeometryPipeline.encodeAttribute(v,x,x+"High",x+"Low"),D.GeometryPipeline.encodeAttribute(v,S,S+"High",S+"Low"));a&&D.GeometryPipeline.compressVertices(v)}if(!n){for(var k=[],s=b.length,C=0;C<s;++C)v=b[C],k=k.concat(D.GeometryPipeline.fitToUnsignedShortIndices(v));b=k}return b}function g(e,t,r,n){for(var i,o,a,s=n.length-1,d=(a=0<=s?(i=(s=n[s]).offset+s.count,r[o=s.index].indices.length):r[o=i=0].indices.length,e.length),p=0;p<d;++p){var u=e[p][t];V.defined(u)&&(a<i+(u=u.indices.length)&&(i=0,a=r[++o].indices.length),n.push({index:o,offset:i,count:u}),i+=u)}}Object.defineProperties(m.prototype,{componentDatatype:{get:function(){return A.ComponentDatatype.FLOAT}},componentsPerAttribute:{get:function(){return 3}},normalize:{get:function(){return!1}}}),m.fromCartesian3=function(e){return new m(e.x,e.y,e.z)},m.toValue=function(e,t){return(t=V.defined(t)?t:new Float32Array([e.x,e.y,e.z]))[0]=e.x,t[1]=e.y,t[2]=e.z,t};var h={};function i(e,t){for(var r=e.length,n=0;n<r;++n){o=i=d=s=a=void 0;var i,o,a=e[n],s=t,d=a.attributes;for(i in d)d.hasOwnProperty(i)&&(o=d[i],V.defined(o)&&V.defined(o.values)&&s.push(o.values.buffer));V.defined(a.indices)&&s.push(a.indices.buffer)}}function o(e){var t=e.length,r=1+(w.BoundingSphere.packedLength+1)*t,n=new Float32Array(r),i=0;n[i++]=t;for(var o=0;o<t;++o){var a=e[o];V.defined(a)?(n[i++]=1,w.BoundingSphere.pack(e[o],n,i)):n[i++]=0,i+=w.BoundingSphere.packedLength}return n}function r(e){for(var t=new Array(e[0]),r=0,n=1;n<e.length;)1===e[n++]&&(t[r]=w.BoundingSphere.unpack(e,n)),++r,n+=w.BoundingSphere.packedLength;return t}h.combineGeometry=function(e){for(var t,r,n,i,o,a,s=e.instances,d=s.length,p=!1,u=(0<d&&(0<(t=l(e)).length&&(r=D.GeometryPipeline.createAttributeLocations(t[0]),e.createPickOffsets&&(g(i=s,"geometry",o=t,a=[]),g(i,"westHemisphereGeometry",o,a),g(i,"eastHemisphereGeometry",o,a),i=a)),V.defined(s[0].attributes)&&V.defined(s[0].attributes.offset)&&(n=new Array(d),p=!0)),new Array(d)),c=new Array(d),f=0;f<d;++f){var m=s[f],h=m.geometry,h=(V.defined(h)&&(u[f]=h.boundingSphere,c[f]=h.boundingSphereCV,p&&(n[f]=m.geometry.offsetAttribute)),m.eastHemisphereGeometry),m=m.westHemisphereGeometry;V.defined(h)&&V.defined(m)&&(V.defined(h.boundingSphere)&&V.defined(m.boundingSphere)&&(u[f]=w.BoundingSphere.union(h.boundingSphere,m.boundingSphere)),V.defined(h.boundingSphereCV)&&V.defined(m.boundingSphereCV)&&(c[f]=w.BoundingSphere.union(h.boundingSphereCV,m.boundingSphereCV)))}return{geometries:t,modelMatrix:e.modelMatrix,attributeLocations:r,pickOffsets:i,offsetInstanceExtend:n,boundingSpheres:u,boundingSpheresCV:c}},h.packCreateGeometryResults=function(e,t){var r=new Float64Array(function(e){for(var t=1,r=e.length,n=0;n<r;n++){var i=e[n];if(++t,V.defined(i)){var o,a=i.attributes;for(o in t+=7+2*w.BoundingSphere.packedLength+(V.defined(i.indices)?i.indices.length:0),a)a.hasOwnProperty(o)&&V.defined(a[o])&&(t+=5+a[o].values.length)}}return t}(e)),n=[],i={},o=e.length,a=0;r[a++]=o;for(var s=0;s<o;s++){var d=e[s],p=V.defined(d);if(r[a++]=p?1:0,p){r[a++]=d.primitiveType,r[a++]=d.geometryType,r[a++]=V.defaultValue(d.offsetAttribute,-1);var u,p=V.defined(d.boundingSphere)?1:0,p=((r[a++]=p)&&w.BoundingSphere.pack(d.boundingSphere,r,a),a+=w.BoundingSphere.packedLength,V.defined(d.boundingSphereCV)?1:0),c=((r[a++]=p)&&w.BoundingSphere.pack(d.boundingSphereCV,r,a),a+=w.BoundingSphere.packedLength,d.attributes),f=[];for(u in c)c.hasOwnProperty(u)&&V.defined(c[u])&&(f.push(u),V.defined(i[u])||(i[u]=n.length,n.push(u)));r[a++]=f.length;for(var m=0;m<f.length;m++){var h=f[m],l=c[h];r[a++]=i[h],r[a++]=l.componentDatatype,r[a++]=l.componentsPerAttribute,r[a++]=l.normalize?1:0,r[a++]=l.values.length,r.set(l.values,a),a+=l.values.length}p=V.defined(d.indices)?d.indices.length:0;0<(r[a++]=p)&&(r.set(d.indices,a),a+=p)}}return t.push(r.buffer),{stringTable:n,packedData:r}},h.unpackCreateGeometryResults=function(e){for(var t=e.stringTable,r=e.packedData,n=new Array(r[0]),i=0,o=1;o<r.length;)if(1===r[o++]){var a,s,d=r[o++],p=r[o++],u=r[o++];-1===u&&(u=void 0),1===r[o++]&&(a=w.BoundingSphere.unpack(r,o)),o+=w.BoundingSphere.packedLength;1===r[o++]&&(s=w.BoundingSphere.unpack(r,o)),o+=w.BoundingSphere.packedLength;var c=new k.GeometryAttributes,f=r[o++];for(S=0;S<f;S++){for(var m=t[r[o++]],h=r[o++],l=r[o++],g=0!==r[o++],y=r[o++],b=A.ComponentDatatype.createTypedArray(h,y),v=0;v<y;v++)b[v]=r[o++];c[m]=new P.GeometryAttribute({componentDatatype:h,componentsPerAttribute:l,normalize:g,values:b})}if(0<(y=r[o++]))for(var G=b.length/l,x=C.IndexDatatype.createTypedArray(G,y),S=0;S<y;S++)x[S]=r[o++];n[i++]=new P.Geometry({primitiveType:d,geometryType:p,boundingSphere:a,boundingSphereCV:s,indices:x,attributes:c,offsetAttribute:u})}else n[i++]=void 0;return n},h.packCombineGeometryParameters=function(e,t){for(var r=e.createGeometryResults,n=r.length,i=0;i<n;i++)t.push(r[i].packedData.buffer);return{createGeometryResults:e.createGeometryResults,packedInstances:function(e,t){var r=e.length,n=new Float64Array(1+19*r),i=0;n[i++]=r;for(var o=0;o<r;o++){var a=e[o];w.Matrix4.pack(a.modelMatrix,n,i),i+=w.Matrix4.packedLength,V.defined(a.attributes)&&V.defined(a.attributes.offset)&&(a=a.attributes.offset.value,n[i]=a[0],n[i+1]=a[1],n[i+2]=a[2]),i+=3}return t.push(n.buffer),n}(e.instances,t),ellipsoid:e.ellipsoid,isGeographic:e.projection instanceof w.GeographicProjection,elementIndexUintSupported:e.elementIndexUintSupported,scene3DOnly:e.scene3DOnly,vertexCacheOptimize:e.vertexCacheOptimize,compressVertices:e.compressVertices,modelMatrix:e.modelMatrix,createPickOffsets:e.createPickOffsets}},h.unpackCombineGeometryParameters=function(e){for(var t=function(e){for(var t=e,r=new Array(t[0]),n=0,i=1;i<t.length;){var o,a=w.Matrix4.unpack(t,i);i+=w.Matrix4.packedLength,V.defined(t[i])&&(o={offset:new m(t[i],t[i+1],t[i+2])}),i+=3,r[n++]={modelMatrix:a,attributes:o}}return r}(e.packedInstances),r=e.createGeometryResults,n=r.length,i=0,o=0;o<n;o++)for(var a=h.unpackCreateGeometryResults(r[o]),s=a.length,d=0;d<s;d++){var p=a[d];t[i].geometry=p,++i}var u=c.Ellipsoid.clone(e.ellipsoid);return{instances:t,ellipsoid:u,projection:new(e.isGeographic?w.GeographicProjection:f.WebMercatorProjection)(u),elementIndexUintSupported:e.elementIndexUintSupported,scene3DOnly:e.scene3DOnly,vertexCacheOptimize:e.vertexCacheOptimize,compressVertices:e.compressVertices,modelMatrix:w.Matrix4.clone(e.modelMatrix),createPickOffsets:e.createPickOffsets}},h.packCombineGeometryResults=function(e,t){V.defined(e.geometries)&&i(e.geometries,t);var r=o(e.boundingSpheres),n=o(e.boundingSpheresCV);return t.push(r.buffer,n.buffer),{geometries:e.geometries,attributeLocations:e.attributeLocations,modelMatrix:e.modelMatrix,pickOffsets:e.pickOffsets,offsetInstanceExtend:e.offsetInstanceExtend,boundingSpheres:r,boundingSpheresCV:n}},h.unpackCombineGeometryResults=function(e){return{geometries:e.geometries,attributeLocations:e.attributeLocations,modelMatrix:e.modelMatrix,pickOffsets:e.pickOffsets,offsetInstanceExtend:e.offsetInstanceExtend,boundingSpheres:r(e.boundingSpheres),boundingSpheresCV:r(e.boundingSpheresCV)}},e.PrimitivePipeline=h});
