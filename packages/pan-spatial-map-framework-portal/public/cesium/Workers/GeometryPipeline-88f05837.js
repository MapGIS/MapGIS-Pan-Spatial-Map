define(["exports","./AttributeCompression-25f42564","./Cartesian2-38b35910","./Check-f996273c","./when-ae2e0b60","./Math-5bbcea10","./Transforms-07a9fab5","./ComponentDatatype-e44126e4","./EncodedCartesian3-d40e98d6","./GeometryAttribute-586bf52c","./IndexDatatype-516320ea","./IntersectionTests-f49c7cd3","./Plane-45ad3143"],function(t,T,R,r,V,D,M,w,d,G,S,F,B){"use strict";var N=new R.Cartesian3,L=new R.Cartesian3,z=new R.Cartesian3;var s={calculateACMR:function(e){var t=(e=V.defaultValue(e,V.defaultValue.EMPTY_OBJECT)).indices,r=e.maximumIndex,a=V.defaultValue(e.cacheSize,24),i=t.length;if(!V.defined(r))for(var r=0,n=0,s=t[n];n<i;)r<s&&(r=s),s=t[++n];for(var o=[],d=0;d<r+1;d++)o[d]=0;for(var u=a+1,p=0;p<i;++p)u-o[t[p]]>a&&(o[t[p]]=u,++u);return(u-a+1)/(i/3)}},e=(s.tipsify=function(e){var t=(e=V.defaultValue(e,V.defaultValue.EMPTY_OBJECT)).indices,p=e.maximumIndex,d=V.defaultValue(e.cacheSize,24);function l(d,l,e,t,r,y,f){for(var a,i=-1,n=-1,s=0;s<e.length;){var o=e[s];t[o].numLiveTriangles&&(a=0,(n<(a=r-t[o].timeStamp+2*t[o].numLiveTriangles<=l?r-t[o].timeStamp:a)||-1===n)&&(n=a,i=o)),++s}if(-1!==i)return i;for(var u=t,p=y,m=f;1<=p.length;){var c=p[p.length-1];if(p.splice(p.length-1,1),0<u[c].numLiveTriangles)return c}for(;v<m;){if(0<u[v].numLiveTriangles)return++v-1;++v}return-1}var e=t.length,r=0,y=t[u=0],f=e;if(V.defined(p))r=p+1;else{for(;u<f;)r<y&&(r=y),y=t[++u];if(-1===r)return 0;++r}for(var a=[],i=0;i<r;i++)a[i]={numLiveTriangles:0,timeStamp:0,vertexTriangles:[]};for(var n=u=0;u<f;)a[t[u]].vertexTriangles.push(n),++a[t[u]].numLiveTriangles,a[t[u+1]].vertexTriangles.push(n),++a[t[u+1]].numLiveTriangles,a[t[u+2]].vertexTriangles.push(n),++a[t[u+2]].numLiveTriangles,++n,u+=3;var s,m=0,o=d+1,v=1,c=[],C=[],h=0,b=[],g=e/3,A=[];for(i=0;i<g;i++)A[i]=!1;for(;-1!==m;){for(var T,c=[],x=(T=a[m]).vertexTriangles.length,P=0;P<x;++P)if(!A[n=T.vertexTriangles[P]]){A[n]=!0;for(var u=n+n+n,w=0;w<3;++w)s=t[u],c.push(s),C.push(s),b[h]=s,++h,--(s=a[s]).numLiveTriangles,o-s.timeStamp>d&&(s.timeStamp=o,++o),++u}m=l(0,d,c,a,o,C,r)}return b},{});function o(e,t,r,a,i){e[t++]=r,e[t++]=a,e[t++]=a,e[t++]=i,e[t++]=i,e[t]=r}function g(e){var t,r,a={};for(t in e)e.hasOwnProperty(t)&&V.defined(e[t])&&V.defined(e[t].values)&&(r=e[t],a[t]=new G.GeometryAttribute({componentDatatype:r.componentDatatype,componentsPerAttribute:r.componentsPerAttribute,normalize:r.normalize,values:[]}));return a}e.toWireframe=function(e){var t=e.indices;if(V.defined(t)){switch(e.primitiveType){case G.PrimitiveType.TRIANGLES:e.indices=function(e){for(var t=e.length,r=S.IndexDatatype.createTypedArray(t,t/3*6),a=0,i=0;i<t;i+=3,a+=6)o(r,a,e[i],e[i+1],e[i+2]);return r}(t);break;case G.PrimitiveType.TRIANGLE_STRIP:e.indices=function(e){var t=e.length;if(3<=t){for(var r=S.IndexDatatype.createTypedArray(t,6*(t-2)),a=(o(r,0,e[0],e[1],e[2]),6),i=3;i<t;++i,a+=6)o(r,a,e[i-1],e[i],e[i-2]);return r}return new Uint16Array}(t);break;case G.PrimitiveType.TRIANGLE_FAN:e.indices=function(e){if(0<e.length){for(var t=e.length-1,r=S.IndexDatatype.createTypedArray(t,6*(t-1)),a=e[0],i=0,n=1;n<t;++n,i+=6)o(r,i,a,e[n],e[n+1]);return r}return new Uint16Array}(t)}e.primitiveType=G.PrimitiveType.LINES}return e},e.createLineSegmentsForVectors=function(e,t,r){t=V.defaultValue(t,"normal"),r=V.defaultValue(r,1e4);for(var a,i=e.attributes.position.values,n=e.attributes[t].values,s=i.length,o=new Float64Array(2*s),u=0,p=0;p<s;p+=3)o[u++]=i[p],o[u++]=i[p+1],o[u++]=i[p+2],o[u++]=i[p]+n[p]*r,o[u++]=i[p+1]+n[p+1]*r,o[u++]=i[p+2]+n[p+2]*r;t=e.boundingSphere;return V.defined(t)&&(a=new M.BoundingSphere(t.center,t.radius+r)),new G.Geometry({attributes:{position:new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:o})},primitiveType:G.PrimitiveType.LINES,boundingSphere:a})},e.createAttributeLocations=function(e){for(var t,r=["position","positionHigh","positionLow","position3DHigh","position3DLow","position2DHigh","position2DLow","pickColor","normal","st","tangent","bitangent","extrudeDirection","compressedAttributes"],a=e.attributes,i={},n=0,s=r.length,o=0;o<s;++o){var u=r[o];V.defined(a[u])&&(i[u]=n++)}for(t in a)a.hasOwnProperty(t)&&!V.defined(i[t])&&(i[t]=n++);return i},e.reorderForPreVertexCache=function(e){var t=G.Geometry.computeNumberOfVertices(e),d=e.indices;if(V.defined(d)){for(var r=new Int32Array(t),l=0;l<t;l++)r[l]=-1;for(var y,f=d,m=f.length,c=S.IndexDatatype.createTypedArray(t,m),a=0,v=0,i=0;a<m;)-1!==(y=r[f[a]])?c[v]=y:(r[y=f[a]]=i,c[v]=i,++i),++a,++v;e.indices=c;var n,s=e.attributes;for(n in s)if(s.hasOwnProperty(n)&&V.defined(s[n])&&V.defined(s[n].values)){for(var o=s[n],C=o.values,u=0,p=o.componentsPerAttribute,h=w.ComponentDatatype.createTypedArray(o.componentDatatype,i*p);u<t;){var b=r[u];if(-1!==b)for(var g=0;g<p;g++)h[p*b+g]=C[p*u+g];++u}o.values=h}}return e},e.reorderForPostVertexCache=function(e,t){var r=e.indices;if(e.primitiveType===G.PrimitiveType.TRIANGLES&&V.defined(r)){for(var a=r.length,i=0,n=0;n<a;n++)r[n]>i&&(i=r[n]);e.indices=s.tipsify({indices:r,maximumIndex:i,cacheSize:t})}return e},e.fitToUnsignedShortIndices=function(e){var t=[],d=G.Geometry.computeNumberOfVertices(e);if(V.defined(e.indices)&&d>=D.CesiumMath.SIXTY_FOUR_KILOBYTES){var r,l=[],a=[],y=0,i=g(e.attributes),f=e.indices,m=f.length;e.primitiveType===G.PrimitiveType.TRIANGLES?r=3:e.primitiveType===G.PrimitiveType.LINES?r=2:e.primitiveType===G.PrimitiveType.POINTS&&(r=1);for(var c=0;c<m;c+=r){for(var v=0;v<r;++v){var C=f[c+v],n=l[C];if(!V.defined(n)){n=y++,l[C]=n,p=u=s=b=o=h=void 0;var s,h=i,o=e.attributes,b=C;for(s in o)if(o.hasOwnProperty(s)&&V.defined(o[s])&&V.defined(o[s].values))for(var u=o[s],p=0;p<u.componentsPerAttribute;++p)h[s].values.push(u.values[b*u.componentsPerAttribute+p])}a.push(n)}y+r>=D.CesiumMath.SIXTY_FOUR_KILOBYTES&&(t.push(new G.Geometry({attributes:i,indices:a,primitiveType:e.primitiveType,boundingSphere:e.boundingSphere,boundingSphereCV:e.boundingSphereCV})),l=[],a=[],y=0,i=g(e.attributes))}0!==a.length&&t.push(new G.Geometry({attributes:i,indices:a,primitiveType:e.primitiveType,boundingSphere:e.boundingSphere,boundingSphereCV:e.boundingSphereCV}))}else t.push(e);return t};var y=new R.Cartesian3,f=new R.Cartographic,l=(e.projectTo2D=function(e,t,r,d,a){for(var i=e.attributes[t],l=(a=V.defined(a)?a:new M.GeographicProjection).ellipsoid,n=i.values,s=new Float64Array(n.length),o=0,u=0;u<n.length;u+=3){var p=R.Cartesian3.fromArray(n,u,y),p=l.cartesianToCartographic(p,f),p=a.project(p,y);s[o++]=p.x,s[o++]=p.y,s[o++]=p.z}return e.attributes[r]=i,e.attributes[d]=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:s}),delete e.attributes[t],e},{high:0,low:0}),n=(e.encodeAttribute=function(e,t,r,a){for(var i=e.attributes[t],n=i.values,s=n.length,o=new Float32Array(s),u=new Float32Array(s),p=0;p<s;++p)d.EncodedCartesian3.encode(n[p],l),o[p]=l.high,u[p]=l.low;i=i.componentsPerAttribute;return e.attributes[r]=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:i,values:o}),e.attributes[a]=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:i,values:u}),delete e.attributes[t],e},new R.Cartesian3);function a(e,t){if(V.defined(t))for(var r=t.values,a=r.length,i=0;i<a;i+=3)R.Cartesian3.unpack(r,i,n),M.Matrix4.multiplyByPoint(e,n,n),R.Cartesian3.pack(n,r,i)}function i(e,t){if(V.defined(t))for(var r=t.values,a=r.length,i=0;i<a;i+=3)R.Cartesian3.unpack(r,i,n),M.Matrix3.multiplyByVector(e,n,n),n=R.Cartesian3.normalize(n,n),R.Cartesian3.pack(n,r,i)}var p=new M.Matrix4,m=new M.Matrix3;e.transformToWorldCoordinates=function(e){var t=e.modelMatrix;if(M.Matrix4.equals(t,M.Matrix4.IDENTITY))return e;var r=e.geometry.attributes,r=(a(t,r.position),a(t,r.prevPosition),a(t,r.nextPosition),(V.defined(r.normal)||V.defined(r.tangent)||V.defined(r.bitangent))&&(M.Matrix4.inverse(t,p),M.Matrix4.transpose(p,p),M.Matrix4.getMatrix3(p,m),i(m,r.normal),i(m,r.tangent),i(m,r.bitangent)),e.geometry.boundingSphere);return V.defined(r)&&(e.geometry.boundingSphere=M.BoundingSphere.transform(r,t,r)),e.modelMatrix=M.Matrix4.clone(M.Matrix4.IDENTITY),e};var P=new R.Cartesian3;function c(e,t){var r,a,d,l,y,f,i=e.length,m=(e[0].modelMatrix,V.defined(e[0][t].indices)),c=e[0][t].primitiveType,n=function(e,t){var r,d=e.length,a={},i=e[0][t].attributes;for(r in i)if(i.hasOwnProperty(r)&&V.defined(i[r])&&V.defined(i[r].values)){for(var n=i[r],s=n.values.length,o=!0,u=1;u<d;++u){var p=e[u][t].attributes[r];if(!V.defined(p)||n.componentDatatype!==p.componentDatatype||n.componentsPerAttribute!==p.componentsPerAttribute||n.normalize!==p.normalize){o=!1;break}s+=p.values.length}o&&(a[r]=new G.GeometryAttribute({componentDatatype:n.componentDatatype,componentsPerAttribute:n.componentsPerAttribute,normalize:n.normalize,values:w.ComponentDatatype.createTypedArray(n.componentDatatype,s)}))}return a}(e,t);for(r in n)if(n.hasOwnProperty(r))for(d=n[r].values,s=o=0;s<i;++s)for(y=(l=e[s][t].attributes[r].values).length,a=0;a<y;++a)d[o++]=l[a];if(m){for(var v=0,s=0;s<i;++s)v+=e[s][t].indices.length;var m=G.Geometry.computeNumberOfVertices(new G.Geometry({attributes:n,primitiveType:G.PrimitiveType.POINTS})),C=S.IndexDatatype.createTypedArray(m,v),h=0,b=0;for(s=0;s<i;++s){for(var g=e[s][t].indices,A=g.length,o=0;o<A;++o)C[h++]=b+g[o];b+=G.Geometry.computeNumberOfVertices(e[s][t])}f=C}var u=new R.Cartesian3,T=0;for(s=0;s<i;++s){if(p=e[s][t].boundingSphere,!V.defined(p)){u=void 0;break}R.Cartesian3.add(p.center,u,u)}if(V.defined(u))for(R.Cartesian3.divideByScalar(u,i,u),s=0;s<i;++s){var p=e[s][t].boundingSphere,x=R.Cartesian3.magnitude(R.Cartesian3.subtract(p.center,u,P))+p.radius;T<x&&(T=x)}return new G.Geometry({attributes:n,indices:f,primitiveType:c,boundingSphere:V.defined(u)?new M.BoundingSphere(u,T):void 0})}e.combineInstances=function(e){for(var t=[],r=[],a=e.length,i=0;i<a;++i){var n=e[i];V.defined(n.geometry)?t.push(n):V.defined(n.westHemisphereGeometry)&&V.defined(n.eastHemisphereGeometry)&&r.push(n)}var s=[];return 0<t.length&&s.push(c(t,"geometry")),0<r.length&&(s.push(c(r,"westHemisphereGeometry")),s.push(c(r,"eastHemisphereGeometry"))),s};var A=new R.Cartesian3,x=new R.Cartesian3,I=new R.Cartesian3,O=new R.Cartesian3,E=(e.computeNormal=function(e){for(var t=e.indices,d=e.attributes,r=d.position.values,a=d.position.values.length/3,i=t.length,n=new Array(a),l=new Array(i/3),s=new Array(i),o=0;o<a;o++)n[o]={indexOffset:0,count:0,currentCount:0};var u=0;for(o=0;o<i;o+=3){var y=t[o],f=t[o+1],m=t[o+2],c=3*y,v=3*f,C=3*m;x.x=r[c],x.y=r[1+c],x.z=r[2+c],I.x=r[v],I.y=r[1+v],I.z=r[2+v],O.x=r[C],O.y=r[1+C],O.z=r[2+C],n[y].count++,n[f].count++,n[m].count++,R.Cartesian3.subtract(I,x,I),R.Cartesian3.subtract(O,x,O),l[u]=R.Cartesian3.cross(I,O,new R.Cartesian3),u++}var p,h=0;for(o=0;o<a;o++)n[o].indexOffset+=h,h+=n[o].count;for(o=u=0;o<i;o+=3)s[(p=n[t[o]]).indexOffset+p.currentCount]=u,p.currentCount++,s[(p=n[t[o+1]]).indexOffset+p.currentCount]=u,p.currentCount++,s[(p=n[t[o+2]]).indexOffset+p.currentCount]=u,p.currentCount++,u++;var b=new Float32Array(3*a);for(o=0;o<a;o++){var g=3*o;if(p=n[o],R.Cartesian3.clone(R.Cartesian3.ZERO,A),0<p.count){for(u=0;u<p.count;u++)R.Cartesian3.add(A,l[s[p.indexOffset+u]],A);R.Cartesian3.equalsEpsilon(R.Cartesian3.ZERO,A,D.CesiumMath.EPSILON10)&&R.Cartesian3.clone(l[s[p.indexOffset]],A)}R.Cartesian3.equalsEpsilon(R.Cartesian3.ZERO,A,D.CesiumMath.EPSILON10)&&(A.z=1),R.Cartesian3.normalize(A,A),b[g]=A.x,b[1+g]=A.y,b[2+g]=A.z}return e.attributes.normal=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:b}),e},new R.Cartesian3),k=new R.Cartesian3,_=new R.Cartesian3,q=(e.computeTangentAndBitangent=function(e){e.attributes;for(var d=e.indices,t=e.attributes.position.values,l=e.attributes.normal.values,y=e.attributes.st.values,f=e.attributes.position.values.length/3,m=d.length,r=new Array(3*f),a=0;a<r.length;a++)r[a]=0;for(a=0;a<m;a+=3){var i,n=d[a],c=d[a+1],v=d[a+2],s=3*c,o=3*v,u=2*n,c=2*c,v=2*v,n=t[i=3*n],C=t[i+1],h=t[i+2],b=y[u],u=y[1+u],g=y[1+c]-u,u=y[1+v]-u,c=1/((y[c]-b)*u-(y[v]-b)*g),v=(u*(t[s]-n)-g*(t[o]-n))*c,b=(u*(t[s+1]-C)-g*(t[o+1]-C))*c,n=(u*(t[s+2]-h)-g*(t[o+2]-h))*c;r[i]+=v,r[i+1]+=b,r[i+2]+=n,r[s]+=v,r[s+1]+=b,r[s+2]+=n,r[o]+=v,r[o+1]+=b,r[o+2]+=n}var A=new Float32Array(3*f),T=new Float32Array(3*f);for(a=0;a<f;a++){s=(i=3*a)+1,o=i+2;var x=R.Cartesian3.fromArray(l,i,E),p=R.Cartesian3.fromArray(r,i,_),P=R.Cartesian3.dot(x,p);R.Cartesian3.multiplyByScalar(x,P,k),R.Cartesian3.normalize(R.Cartesian3.subtract(p,k,p),p),A[i]=p.x,A[s]=p.y,A[o]=p.z,R.Cartesian3.normalize(R.Cartesian3.cross(x,p,p),p),T[i]=p.x,T[s]=p.y,T[o]=p.z}return e.attributes.tangent=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:A}),e.attributes.bitangent=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:T}),e},new R.Cartesian2),U=new R.Cartesian3,Y=new R.Cartesian3,Z=new R.Cartesian3,H=new R.Cartesian2;function W(e){switch(e.primitiveType){case G.PrimitiveType.TRIANGLE_FAN:for(var t=e,d=G.Geometry.computeNumberOfVertices(t),r=S.IndexDatatype.createTypedArray(d,3*(d-2)),l=(r[0]=1,r[1]=0,r[2]=2,3),y=3;y<d;++y)r[l++]=y-1,r[l++]=0,r[l++]=y;return t.indices=r,t.primitiveType=G.PrimitiveType.TRIANGLES,t;case G.PrimitiveType.TRIANGLE_STRIP:for(var t=e,a=G.Geometry.computeNumberOfVertices(t),i=S.IndexDatatype.createTypedArray(a,3*(a-2)),n=(i[0]=0,i[1]=1,i[2]=2,3<a&&(i[3]=0,i[4]=2,i[5]=3),6),s=3;s<a-1;s+=2)i[n++]=s,i[n++]=s-1,i[n++]=s+1,s+2<a&&(i[n++]=s,i[n++]=s+1,i[n++]=s+2);return t.indices=i,t.primitiveType=G.PrimitiveType.TRIANGLES,t;case G.PrimitiveType.TRIANGLES:var o=e;if(V.defined(o.indices))return o;for(var f=G.Geometry.computeNumberOfVertices(o),m=S.IndexDatatype.createTypedArray(f,f),c=0;c<f;++c)m[c]=c;return o.indices=m,o;case G.PrimitiveType.LINE_STRIP:for(var o=e,v=G.Geometry.computeNumberOfVertices(o),C=S.IndexDatatype.createTypedArray(v,2*(v-1)),h=(C[0]=0,C[1]=1,2),b=2;b<v;++b)C[h++]=b-1,C[h++]=b;return o.indices=C,o.primitiveType=G.PrimitiveType.LINES,o;case G.PrimitiveType.LINE_LOOP:for(var u=e,g=G.Geometry.computeNumberOfVertices(u),p=S.IndexDatatype.createTypedArray(g,2*g),A=(p[0]=0,p[1]=1,2),T=2;T<g;++T)p[A++]=T-1,p[A++]=T;return p[A++]=g-1,p[A]=0,u.indices=p,u.primitiveType=G.PrimitiveType.LINES,u;case G.PrimitiveType.LINES:u=e;if(V.defined(u.indices))return u;for(var x=G.Geometry.computeNumberOfVertices(u),P=S.IndexDatatype.createTypedArray(x,x),w=0;w<x;++w)P[w]=w;return u.indices=P,u}return e}function v(e,t){Math.abs(e.y)<D.CesiumMath.EPSILON6&&(e.y=t?-D.CesiumMath.EPSILON6:D.CesiumMath.EPSILON6)}e.compressVertices=function(e){var t=e.attributes.extrudeDirection;if(V.defined(t)){for(var d=t.values,r=d.length/3,l=new Float32Array(2*r),y=0,a=0;a<r;++a)R.Cartesian3.fromArray(d,3*a,U),R.Cartesian3.equals(U,R.Cartesian3.ZERO)?y+=2:(H=T.AttributeCompression.octEncodeInRange(U,65535,H),l[y++]=H.x,l[y++]=H.y);return e.attributes.compressedAttributes=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:l}),delete e.attributes.extrudeDirection,e}var t=e.attributes.normal,i=e.attributes.st,n=V.defined(t),s=V.defined(i);if(!n&&!s)return e;var f,m,c,v,C=e.attributes.tangent,h=e.attributes.bitangent,b=V.defined(C),g=V.defined(h);n&&(f=t.values),s&&(m=i.values),b&&(c=C.values),g&&(v=h.values);var t=r=(n?f:m).length/(n?3:2),i=s&&n?2:1,o=(t*=i+=b||g?1:0,new Float32Array(t)),u=0;for(a=0;a<r;++a){s&&(R.Cartesian2.fromArray(m,2*a,q),o[u++]=T.AttributeCompression.compressTextureCoordinates(q));var p=3*a;n&&V.defined(c)&&V.defined(v)?(R.Cartesian3.fromArray(f,p,U),R.Cartesian3.fromArray(c,p,Y),R.Cartesian3.fromArray(v,p,Z),T.AttributeCompression.octPack(U,Y,Z,q),o[u++]=q.x,o[u++]=q.y):(n&&(R.Cartesian3.fromArray(f,p,U),o[u++]=T.AttributeCompression.octEncodeFloat(U)),b&&(R.Cartesian3.fromArray(c,p,U),o[u++]=T.AttributeCompression.octEncodeFloat(U)),g&&(R.Cartesian3.fromArray(v,p,U),o[u++]=T.AttributeCompression.octEncodeFloat(U)))}return e.attributes.compressedAttributes=new G.GeometryAttribute({componentDatatype:w.ComponentDatatype.FLOAT,componentsPerAttribute:i,values:o}),n&&delete e.attributes.normal,s&&delete e.attributes.st,g&&delete e.attributes.bitangent,b&&delete e.attributes.tangent,e};var C=new R.Cartesian3;function u(e,t,r,a){R.Cartesian3.add(e,R.Cartesian3.multiplyByScalar(R.Cartesian3.subtract(t,e,C),e.y/(e.y-t.y),C),r),R.Cartesian3.clone(r,a),v(r,!0),v(a,!1)}var h=new R.Cartesian3,b=new R.Cartesian3,X=new R.Cartesian3,j=new R.Cartesian3,J={positions:new Array(7),indices:new Array(9)};function K(e,t,r){var a,i,n,s,o;if(!(0<=e.x||0<=t.x||0<=r.x))return function(e,t,r){if(0!==e.y&&0!==t.y&&0!==r.y)return v(e,e.y<0),v(t,t.y<0),v(r,r.y<0);var a=Math.abs(e.y),i=Math.abs(t.y),n=Math.abs(r.y),a=i<a?n<a?D.CesiumMath.sign(e.y):D.CesiumMath.sign(r.y):n<i?D.CesiumMath.sign(t.y):D.CesiumMath.sign(r.y);v(e,n=a<0),v(t,n),v(r,n)}(e,t,r),o=e.y<0,a=t.y<0,i=r.y<0,n=0,s=J.indices,1==(n=(n+=o?1:0)+(a?1:0)+(i?1:0))?(s[1]=3,s[2]=4,s[5]=6,s[7]=6,s[8]=5,o?(u(e,t,h,X),u(e,r,b,j),s[0]=0,s[3]=1,s[4]=2,s[6]=1):a?(u(t,r,h,X),u(t,e,b,j),s[0]=1,s[3]=2,s[4]=0,s[6]=2):i&&(u(r,e,h,X),u(r,t,b,j),s[0]=2,s[3]=0,s[4]=1,s[6]=0)):2==n&&(s[2]=4,s[4]=4,s[5]=3,s[7]=5,s[8]=6,o?a?i||(u(r,e,h,X),u(r,t,b,j),s[0]=0,s[1]=1,s[3]=0,s[6]=2):(u(t,r,h,X),u(t,e,b,j),s[0]=2,s[1]=0,s[3]=2,s[6]=1):(u(e,t,h,X),u(e,r,b,j),s[0]=1,s[1]=2,s[3]=1,s[6]=0)),o=J.positions,o[0]=e,o[1]=t,o[2]=r,o.length=3,1!=n&&2!=n||(o[3]=h,o[4]=b,o[5]=X,o[6]=j,o.length=7),J}function Q(e,t){var r=e.attributes;if(0!==r.position.values.length){for(var a in r)r.hasOwnProperty(a)&&V.defined(r[a])&&V.defined(r[a].values)&&((a=r[a]).values=w.ComponentDatatype.createTypedArray(a.componentDatatype,a.values));var i=G.Geometry.computeNumberOfVertices(e);return e.indices=S.IndexDatatype.createTypedArray(i,e.indices),t&&(e.boundingSphere=M.BoundingSphere.fromVertices(r.position.values)),e}}function $(e){var t,r,a=e.attributes,i={};for(t in a)a.hasOwnProperty(t)&&V.defined(a[t])&&V.defined(a[t].values)&&(r=a[t],i[t]=new G.GeometryAttribute({componentDatatype:r.componentDatatype,componentsPerAttribute:r.componentsPerAttribute,normalize:r.normalize,values:[]}));return new G.Geometry({attributes:i,indices:[],primitiveType:e.primitiveType})}function ee(e,t,r){var a=V.defined(e.geometry.boundingSphere);t=Q(t,a),r=Q(r,a),V.defined(r)&&!V.defined(t)?e.geometry=r:!V.defined(r)&&V.defined(t)?e.geometry=t:(e.westHemisphereGeometry=t,e.eastHemisphereGeometry=r,e.geometry=void 0)}function te(u,p){var d=new u,l=new u,y=new u;return function(e,t,r,a,i,n,s,o){e=u.fromArray(i,e*p,d),t=u.fromArray(i,t*p,l),i=u.fromArray(i,r*p,y),u.multiplyByScalar(e,a.x,e),u.multiplyByScalar(t,a.y,t),u.multiplyByScalar(i,a.z,i),r=u.add(e,t,e);u.add(r,i,r),o&&u.normalize(r,r),u.pack(r,n,s*p)}}var re=te(M.Cartesian4,4),ae=te(R.Cartesian3,3),ie=te(R.Cartesian2,2),ne=function(e,t,r,a,i,n,s){e=i[e]*a.x,t=i[t]*a.y,i=i[r]*a.z;n[s]=e+t+i>D.CesiumMath.EPSILON6?1:0},se=new R.Cartesian3,oe=new R.Cartesian3,ue=new R.Cartesian3,pe=new R.Cartesian3;function de(e,t,r,a,i,n,d,l,y,f,m,s,c,v,C,o){if(V.defined(n)||V.defined(d)||V.defined(l)||V.defined(y)||V.defined(f)||0!==v){var u,p=function(e,t,r,a,i){var n,s,o,u,p,d,l,y;if(V.defined(i)||(i=new R.Cartesian3),V.defined(t.z)){if(R.Cartesian3.equalsEpsilon(e,t,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_X,i);if(R.Cartesian3.equalsEpsilon(e,r,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_Y,i);if(R.Cartesian3.equalsEpsilon(e,a,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_Z,i);n=R.Cartesian3.subtract(r,t,N),s=R.Cartesian3.subtract(a,t,L),o=R.Cartesian3.subtract(e,t,z),u=R.Cartesian3.dot(n,n),p=R.Cartesian3.dot(n,s),d=R.Cartesian3.dot(n,o),l=R.Cartesian3.dot(s,s),y=R.Cartesian3.dot(s,o)}else{if(R.Cartesian2.equalsEpsilon(e,t,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_X,i);if(R.Cartesian2.equalsEpsilon(e,r,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_Y,i);if(R.Cartesian2.equalsEpsilon(e,a,D.CesiumMath.EPSILON14))return R.Cartesian3.clone(R.Cartesian3.UNIT_Z,i);n=R.Cartesian2.subtract(r,t,N),s=R.Cartesian2.subtract(a,t,L),o=R.Cartesian2.subtract(e,t,z),u=R.Cartesian2.dot(n,n),p=R.Cartesian2.dot(n,s),d=R.Cartesian2.dot(n,o),l=R.Cartesian2.dot(s,s),y=R.Cartesian2.dot(s,o)}return i.y=l*d-p*y,i.z=u*y-p*d,r=u*l-p*p,0!==i.y&&(i.y/=r),0!==i.z&&(i.z/=r),i.x=1-i.y-i.z,i}(a,R.Cartesian3.fromArray(i,3*e,se),R.Cartesian3.fromArray(i,3*t,oe),R.Cartesian3.fromArray(i,3*r,ue),pe);if(V.defined(n)&&ae(e,t,r,p,n,s.normal.values,o,!0),V.defined(f)&&(a=R.Cartesian3.fromArray(f,3*e,se),i=R.Cartesian3.fromArray(f,3*t,oe),n=R.Cartesian3.fromArray(f,3*r,ue),R.Cartesian3.multiplyByScalar(a,p.x,a),R.Cartesian3.multiplyByScalar(i,p.y,i),R.Cartesian3.multiplyByScalar(n,p.z,n),R.Cartesian3.equals(a,R.Cartesian3.ZERO)&&R.Cartesian3.equals(i,R.Cartesian3.ZERO)&&R.Cartesian3.equals(n,R.Cartesian3.ZERO)?((u=se).x=0,u.y=0,u.z=0):(u=R.Cartesian3.add(a,i,a),R.Cartesian3.add(u,n,u),R.Cartesian3.normalize(u,u)),R.Cartesian3.pack(u,s.extrudeDirection.values,3*o)),V.defined(m)&&ne(e,t,r,p,m,s.applyOffset.values,o),V.defined(d)&&ae(e,t,r,p,d,s.tangent.values,o,!0),V.defined(l)&&ae(e,t,r,p,l,s.bitangent.values,o,!0),V.defined(y)&&ie(e,t,r,p,y,s.st.values,o),0<v)for(var h=0;h<v;h++){var b=c[h],g=(E=O=I=S=w=P=x=T=A=g=void 0,e),A=t,T=r,x=p,P=o,w=C[b],S=s[b],I=w.componentsPerAttribute,O=w.values,E=S.values;switch(I){case 4:re(g,A,T,x,O,E,P,!1);break;case 3:ae(g,A,T,x,O,E,P,!1);break;case 2:ie(g,A,T,x,O,E,P,!1);break;default:E[P]=O[g]*x.x+O[A]*x.y+O[T]*x.z}}}}function le(e,t,r,a,i,n){var s=e.position.values.length/3;return-1!==i?-1===(i=r[a=a[i]])?(r[a]=s,e.position.values.push(n.x,n.y,n.z),t.push(s),s):(t.push(i),i):(e.position.values.push(n.x,n.y,n.z),t.push(s),s)}var ye={position:!0,normal:!0,bitangent:!0,tangent:!0,st:!0,extrudeDirection:!0,applyOffset:!0};function fe(d){var e,l=d.geometry,t=l.attributes,r=t.position.values,y=V.defined(t.normal)?t.normal.values:void 0,f=V.defined(t.bitangent)?t.bitangent.values:void 0,m=V.defined(t.tangent)?t.tangent.values:void 0,c=V.defined(t.st)?t.st.values:void 0,v=V.defined(t.extrudeDirection)?t.extrudeDirection.values:void 0,C=V.defined(t.applyOffset)?t.applyOffset.values:void 0,a=l.indices,i=[];for(e in t)t.hasOwnProperty(e)&&!ye[e]&&V.defined(t[e])&&i.push(e);var n,s,h=i.length,o=$(l),b=$(l),g=[],A=(g.length=r.length/3,[]);for(A.length=r.length/3,u=0;u<g.length;++u)g[u]=-1,A[u]=-1;for(var T=a.length,u=0;u<T;u+=3){var x=a[u],P=a[u+1],w=a[u+2],S=R.Cartesian3.fromArray(r,3*x),I=R.Cartesian3.fromArray(r,3*P),O=R.Cartesian3.fromArray(r,3*w),p=K(S,I,O);if(V.defined(p)&&3<p.positions.length)for(var E=p.positions,N=p.indices,L=N.length,z=0;z<L;++z){var D=N[z],M=E[D],G=M.y<0?(n=b.attributes,s=b.indices,g):(n=o.attributes,s=o.indices,A);de(x,P,w,M,r,y,m,f,c,v,C,n,i,h,t,le(n,s,G,a,D<3?u+D:-1,M))}else V.defined(p)&&(S=p.positions[0],I=p.positions[1],O=p.positions[2]),G=S.y<0?(n=b.attributes,s=b.indices,g):(n=o.attributes,s=o.indices,A),de(x,P,w,S,r,y,m,f,c,v,C,n,i,h,t,le(n,s,G,a,u,S)),de(x,P,w,I,r,y,m,f,c,v,C,n,i,h,t,le(n,s,G,a,u+1,I)),de(x,P,w,O,r,y,m,f,c,v,C,n,i,h,t,le(n,s,G,a,u+2,O))}ee(d,b,o)}var me=B.Plane.fromPointNormal(R.Cartesian3.ZERO,R.Cartesian3.UNIT_Y),ce=new R.Cartesian3,ve=new R.Cartesian3;function Ce(e,t,r,a,i,n,s){V.defined(s)&&(a=R.Cartesian3.fromArray(a,3*e,se),R.Cartesian3.equalsEpsilon(a,r,D.CesiumMath.EPSILON10)?n.applyOffset.values[i]=s[e]:n.applyOffset.values[i]=s[t])}function he(d){var e,l=d.geometry,y=l.attributes,t=y.position.values,f=V.defined(y.applyOffset)?y.applyOffset.values:void 0,r=l.indices,a=$(l),i=$(l),m=r.length,c=[],v=(c.length=t.length/3,[]);for(v.length=t.length/3,e=0;e<c.length;++e)c[e]=-1,v[e]=-1;for(e=0;e<m;e+=2){var n,C,h,b,s=r[e],o=r[e+1],u=R.Cartesian3.fromArray(t,3*s,se),p=R.Cartesian3.fromArray(t,3*o,oe),g=(Math.abs(u.y)<D.CesiumMath.EPSILON6&&(u.y<0?u.y=-D.CesiumMath.EPSILON6:u.y=D.CesiumMath.EPSILON6),Math.abs(p.y)<D.CesiumMath.EPSILON6&&(p.y<0?p.y=-D.CesiumMath.EPSILON6:p.y=D.CesiumMath.EPSILON6),a.attributes),A=a.indices,T=v,x=i.attributes,P=i.indices,w=c,S=F.IntersectionTests.lineSegmentPlane(u,p,me,ue);V.defined(S)?(n=R.Cartesian3.multiplyByScalar(R.Cartesian3.UNIT_Y,5*D.CesiumMath.EPSILON9,ce),u.y<0&&(R.Cartesian3.negate(n,n),g=i.attributes,A=i.indices,T=c,x=a.attributes,P=a.indices,w=v),C=R.Cartesian3.add(S,n,ve),Ce(s,o,u,t,le(g,A,T,r,e,u),g,f),Ce(s,o,C,t,le(g,A,T,r,-1,C),g,f),R.Cartesian3.negate(n,n),R.Cartesian3.add(S,n,C),Ce(s,o,C,t,le(x,P,w,r,-1,C),x,f),Ce(s,o,p,t,le(x,P,w,r,e+1,p),x,f)):(A=u.y<0?(h=i.attributes,b=i.indices,c):(h=a.attributes,b=a.indices,v),Ce(s,o,u,t,le(h,b,A,r,e,u),h,f),Ce(s,o,p,t,le(h,b,A,r,e+1,p),h,f))}ee(d,i,a)}var be=new R.Cartesian2,ge=new R.Cartesian2,Ae=new R.Cartesian3,Te=new R.Cartesian3,xe=new R.Cartesian3,Pe=new R.Cartesian3,we=new R.Cartesian3,Se=new R.Cartesian3,Ie=new M.Cartesian4;function Oe(e){for(var e=e.attributes,t=e.position.values,r=e.prevPosition.values,a=e.nextPosition.values,i=t.length,n=0;n<i;n+=3){var s,o=R.Cartesian3.unpack(t,n,Ae);0<o.x||(s=R.Cartesian3.unpack(r,n,Te),(o.y<0&&0<s.y||0<o.y&&s.y<0)&&(0<n-3?(r[n]=t[n-3],r[n+1]=t[n-2],r[n+2]=t[n-1]):R.Cartesian3.pack(o,r,n)),s=R.Cartesian3.unpack(a,n,xe),(o.y<0&&0<s.y||0<o.y&&s.y<0)&&(n+3<i?(a[n]=t[n+3],a[n+1]=t[n+4],a[n+2]=t[n+5]):R.Cartesian3.pack(o,a,n)))}}var Ee=5*D.CesiumMath.EPSILON9,Ne=D.CesiumMath.EPSILON6;e.splitLongitude=function(d){var l=d.geometry,y=l.boundingSphere;if(V.defined(y)&&(0<y.center.x-y.radius||M.BoundingSphere.intersectPlane(y,B.Plane.ORIGIN_ZX_PLANE)!==M.Intersect.INTERSECTING))return d;if(l.geometryType!==G.GeometryType.NONE)switch(l.geometryType){case G.GeometryType.POLYLINES:for(var f=d,m=f.geometry,c=m.attributes,e=c.position.values,v=c.prevPosition.values,C=c.nextPosition.values,h=c.expandAndWidth.values,b=V.defined(c.st)?c.st.values:void 0,g=V.defined(c.color)?c.color.values:void 0,A=$(m),T=$(m),x=!1,P=e.length/3,t=0;t<P;t+=4){var r=t,w=t+2,a=R.Cartesian3.fromArray(e,3*r,Ae),i=R.Cartesian3.fromArray(e,3*w,Te);if(Math.abs(a.y)<Ne)for(a.y=Ne*(i.y<0?-1:1),e[3*t+1]=a.y,e[3*(t+1)+1]=a.y,p=3*r;p<3*r+12;p+=3)v[p]=e[3*t],v[p+1]=e[3*t+1],v[p+2]=e[3*t+2];if(Math.abs(i.y)<Ne)for(i.y=Ne*(a.y<0?-1:1),e[3*(t+2)+1]=i.y,e[3*(t+3)+1]=i.y,p=3*r;p<3*r+12;p+=3)C[p]=e[3*(t+2)],C[p+1]=e[3*(t+2)+1],C[p+2]=e[3*(t+2)+2];var n=A.attributes,S=A.indices,s=T.attributes,I=T.indices,O=F.IntersectionTests.lineSegmentPlane(a,i,me,Pe);if(V.defined(O)){var x=!0,E=R.Cartesian3.multiplyByScalar(R.Cartesian3.UNIT_Y,Ee,we),o=(a.y<0&&(R.Cartesian3.negate(E,E),n=T.attributes,S=T.indices,s=A.attributes,I=A.indices),R.Cartesian3.add(O,E,Se)),E=(n.position.values.push(a.x,a.y,a.z,a.x,a.y,a.z),n.position.values.push(o.x,o.y,o.z),n.position.values.push(o.x,o.y,o.z),n.prevPosition.values.push(v[3*r],v[3*r+1],v[3*r+2]),n.prevPosition.values.push(v[3*r+3],v[3*r+4],v[3*r+5]),n.prevPosition.values.push(a.x,a.y,a.z,a.x,a.y,a.z),n.nextPosition.values.push(o.x,o.y,o.z),n.nextPosition.values.push(o.x,o.y,o.z),n.nextPosition.values.push(o.x,o.y,o.z),n.nextPosition.values.push(o.x,o.y,o.z),R.Cartesian3.negate(E,E),R.Cartesian3.add(O,E,o),s.position.values.push(o.x,o.y,o.z),s.position.values.push(o.x,o.y,o.z),s.position.values.push(i.x,i.y,i.z,i.x,i.y,i.z),s.prevPosition.values.push(o.x,o.y,o.z),s.prevPosition.values.push(o.x,o.y,o.z),s.prevPosition.values.push(o.x,o.y,o.z),s.prevPosition.values.push(o.x,o.y,o.z),s.nextPosition.values.push(i.x,i.y,i.z,i.x,i.y,i.z),s.nextPosition.values.push(C[3*w],C[3*w+1],C[3*w+2]),s.nextPosition.values.push(C[3*w+3],C[3*w+4],C[3*w+5]),R.Cartesian2.fromArray(h,2*r,be)),o=Math.abs(E.y),E=(n.expandAndWidth.values.push(-1,o,1,o),n.expandAndWidth.values.push(-1,-o,1,-o),s.expandAndWidth.values.push(-1,o,1,o),s.expandAndWidth.values.push(-1,-o,1,-o),R.Cartesian3.magnitudeSquared(R.Cartesian3.subtract(O,a,xe)));if(E/=R.Cartesian3.magnitudeSquared(R.Cartesian3.subtract(i,a,xe)),V.defined(g)){for(var o=M.Cartesian4.fromArray(g,4*r,Ie),O=M.Cartesian4.fromArray(g,4*w,Ie),N=D.CesiumMath.lerp(o.x,O.x,E),L=D.CesiumMath.lerp(o.y,O.y,E),u=D.CesiumMath.lerp(o.z,O.z,E),o=D.CesiumMath.lerp(o.w,O.w,E),p=4*r;p<4*r+8;++p)n.color.values.push(g[p]);for(n.color.values.push(N,L,u,o),n.color.values.push(N,L,u,o),s.color.values.push(N,L,u,o),s.color.values.push(N,L,u,o),p=4*w;p<4*w+8;++p)s.color.values.push(g[p])}if(V.defined(b)){O=R.Cartesian2.fromArray(b,2*r,be),N=R.Cartesian2.fromArray(b,2*(t+3),ge),L=D.CesiumMath.lerp(O.x,N.x,E);for(p=2*r;p<2*r+4;++p)n.st.values.push(b[p]);for(n.st.values.push(L,O.y),n.st.values.push(L,N.y),s.st.values.push(L,O.y),s.st.values.push(L,N.y),p=2*w;p<2*w+4;++p)s.st.values.push(b[p])}u=n.position.values.length/3-4,S.push(u,u+2,u+1),S.push(u+1,u+2,u+3),u=s.position.values.length/3-4,I.push(u,u+2,u+1),I.push(u+1,u+2,u+3)}else{var z,o=a.y<0?(z=T.attributes,T.indices):(z=A.attributes,A.indices);for(z.position.values.push(a.x,a.y,a.z),z.position.values.push(a.x,a.y,a.z),z.position.values.push(i.x,i.y,i.z),z.position.values.push(i.x,i.y,i.z),p=3*t;p<3*t+12;++p)z.prevPosition.values.push(v[p]),z.nextPosition.values.push(C[p]);for(p=2*t;p<2*t+8;++p)z.expandAndWidth.values.push(h[p]),V.defined(b)&&z.st.values.push(b[p]);if(V.defined(g))for(p=4*t;p<4*t+16;++p)z.color.values.push(g[p]);u=z.position.values.length/3-4,o.push(u,u+2,u+1),o.push(u+1,u+2,u+3)}}x&&(Oe(T),Oe(A)),ee(f,T,A);break;case G.GeometryType.TRIANGLES:fe(d);break;case G.GeometryType.LINES:he(d)}else W(l),l.primitiveType===G.PrimitiveType.TRIANGLES?fe(d):l.primitiveType===G.PrimitiveType.LINES&&he(d);return d},t.GeometryPipeline=e});
