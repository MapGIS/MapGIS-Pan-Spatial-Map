define(["exports","./GeometryOffsetAttribute-b02d5bb9","./Transforms-5aeb1d5e","./Cartesian2-078e6458","./ComponentDatatype-e44126e4","./when-ae2e0b60","./Check-f996273c","./GeometryAttribute-ccf4e0b6","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./VertexFormat-90d15264"],function(t,Q,$,tt,et,at,e,it,rt,nt,ot,f){"use strict";var mt=new tt.Cartesian3,st=new tt.Cartesian3,ut=new tt.Cartesian3,lt=new tt.Cartesian3,ct=new tt.Cartesian3,l=new tt.Cartesian3(1,1,1),ft=Math.cos,dt=Math.sin;function d(t){t=at.defaultValue(t,at.defaultValue.EMPTY_OBJECT);var e=at.defaultValue(t.radii,l),a=at.defaultValue(t.innerRadii,e),i=at.defaultValue(t.minimumClock,0),r=at.defaultValue(t.maximumClock,ot.CesiumMath.TWO_PI),n=at.defaultValue(t.minimumCone,0),o=at.defaultValue(t.maximumCone,ot.CesiumMath.PI),m=Math.round(at.defaultValue(t.stackPartitions,64)),s=Math.round(at.defaultValue(t.slicePartitions,64)),u=at.defaultValue(t.vertexFormat,f.VertexFormat.DEFAULT);this._radii=tt.Cartesian3.clone(e),this._innerRadii=tt.Cartesian3.clone(a),this._minimumClock=i,this._maximumClock=r,this._minimumCone=n,this._maximumCone=o,this._stackPartitions=m,this._slicePartitions=s,this._vertexFormat=f.VertexFormat.clone(u),this._offsetAttribute=t.offsetAttribute,this._workerName="createEllipsoidGeometry"}d.packedLength=2*tt.Cartesian3.packedLength+f.VertexFormat.packedLength+7,d.pack=function(t,e,a){return a=at.defaultValue(a,0),tt.Cartesian3.pack(t._radii,e,a),a+=tt.Cartesian3.packedLength,tt.Cartesian3.pack(t._innerRadii,e,a),a+=tt.Cartesian3.packedLength,f.VertexFormat.pack(t._vertexFormat,e,a),a+=f.VertexFormat.packedLength,e[a++]=t._minimumClock,e[a++]=t._maximumClock,e[a++]=t._minimumCone,e[a++]=t._maximumCone,e[a++]=t._stackPartitions,e[a++]=t._slicePartitions,e[a]=at.defaultValue(t._offsetAttribute,-1),e};var a,C=new tt.Cartesian3,p=new tt.Cartesian3,y=new f.VertexFormat,_={radii:C,innerRadii:p,vertexFormat:y,minimumClock:void 0,maximumClock:void 0,minimumCone:void 0,maximumCone:void 0,stackPartitions:void 0,slicePartitions:void 0,offsetAttribute:void 0};d.unpack=function(t,e,a){e=at.defaultValue(e,0);var i=tt.Cartesian3.unpack(t,e,C),r=(e+=tt.Cartesian3.packedLength,tt.Cartesian3.unpack(t,e,p)),n=(e+=tt.Cartesian3.packedLength,f.VertexFormat.unpack(t,e,y)),o=(e+=f.VertexFormat.packedLength,t[e++]),m=t[e++],s=t[e++],u=t[e++],l=t[e++],c=t[e++],t=t[e];return at.defined(a)?(a._radii=tt.Cartesian3.clone(i,a._radii),a._innerRadii=tt.Cartesian3.clone(r,a._innerRadii),a._vertexFormat=f.VertexFormat.clone(n,a._vertexFormat),a._minimumClock=o,a._maximumClock=m,a._minimumCone=s,a._maximumCone=u,a._stackPartitions=l,a._slicePartitions=c,a._offsetAttribute=-1===t?void 0:t,a):(_.minimumClock=o,_.maximumClock=m,_.minimumCone=s,_.maximumCone=u,_.stackPartitions=l,_.slicePartitions=c,_.offsetAttribute=-1===t?void 0:t,new d(_))},d.createGeometry=function(t){var e=t._radii;if(!(e.x<=0||e.y<=0||e.z<=0)){var a=t._innerRadii;if(!(a.x<=0||a.y<=0||a.z<=0)){var i=t._minimumClock,r=t._maximumClock,n=t._minimumCone,o=t._maximumCone,m=t._vertexFormat,s=t._slicePartitions+1,u=t._stackPartitions+1,l=((s=Math.round(s*Math.abs(r-i)/ot.CesiumMath.TWO_PI))<2&&(s=2),(u=Math.round(u*Math.abs(o-n)/ot.CesiumMath.PI))<2&&(u=2),0),c=[n],f=[i];for(L=0;L<u;L++)c.push(n+L*(o-n)/(u-1));for(c.push(o),V=0;V<s;V++)f.push(i+V*(r-i)/(s-1));f.push(r);var d=c.length,C=f.length,p=0,y=1,_=a.x!==e.x||a.y!==e.y||a.z!==e.z,h=!1,A=!1,E=!1,x=(_&&(y=2,0<n&&(h=!0,p+=s-1),o<Math.PI&&(A=!0,p+=s-1),(r-i)%ot.CesiumMath.TWO_PI?(E=!0,p+=2*(u-1)+1):p+=1),C*d*y),b=new Float64Array(3*x),z=Q.arrayFill(new Array(x),!1),N=Q.arrayFill(new Array(x),!1),v=s*u*y,k=nt.IndexDatatype.createTypedArray(v,6*(v+p+1-(s+u)*y)),w=m.normal?new Float32Array(3*x):void 0,F=m.tangent?new Float32Array(3*x):void 0,P=m.bitangent?new Float32Array(3*x):void 0,R=m.st?new Float32Array(2*x):void 0,g=new Array(d),U=new Array(d);for(L=0;L<d;L++)g[L]=dt(c[L]),U[L]=ft(c[L]);for(var S=new Array(C),B=new Array(C),V=0;V<C;V++)B[V]=ft(f[V]),S[V]=dt(f[V]);for(L=0;L<d;L++)for(V=0;V<C;V++)b[l++]=e.x*g[L]*B[V],b[l++]=e.y*g[L]*S[V],b[l++]=e.z*U[L];var M,T,D,G,W=x/2;if(_)for(L=0;L<d;L++)for(V=0;V<C;V++)b[l++]=a.x*g[L]*B[V],b[l++]=a.y*g[L]*S[V],b[l++]=a.z*U[L],z[W]=!0,0<L&&L!==d-1&&0!==V&&V!==C-1&&(N[W]=!0),W++;for(l=0,L=1;L<d-2;L++)for(M=L*C,T=(L+1)*C,V=1;V<C-2;V++)k[l++]=T+V,k[l++]=T+V+1,k[l++]=M+V+1,k[l++]=T+V,k[l++]=M+V+1,k[l++]=M+V;if(_)for(var Y=d*C,L=1;L<d-2;L++)for(M=Y+L*C,T=Y+(L+1)*C,V=1;V<C-2;V++)k[l++]=T+V,k[l++]=M+V,k[l++]=M+V+1,k[l++]=T+V,k[l++]=M+V+1,k[l++]=T+V+1;if(_){if(h)for(G=d*C,L=1;L<C-2;L++)k[l++]=L,k[l++]=L+1,k[l++]=G+L+1,k[l++]=L,k[l++]=G+L+1,k[l++]=G+L;if(A)for(D=d*C-C,G=d*C*y-C,L=1;L<C-2;L++)k[l++]=D+L+1,k[l++]=D+L,k[l++]=G+L,k[l++]=D+L+1,k[l++]=G+L,k[l++]=G+L+1}if(E){for(L=1;L<d-2;L++)k[l++]=G=C*d+(D=C*L),k[l++]=D+C,k[l++]=D,k[l++]=G,k[l++]=G+C,k[l++]=D+C;for(L=1;L<d-2;L++)G=C*d+C*(L+1)-1,k[l++]=(D=C*(L+1)-1)+C,k[l++]=G,k[l++]=D,k[l++]=D+C,k[l++]=G+C,k[l++]=G}var v=new rt.GeometryAttributes,J=(m.position&&(v.position=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:b})),0),X=0,Z=0,j=0,q=x/2,H=tt.Ellipsoid.fromCartesian3(e),K=tt.Ellipsoid.fromCartesian3(a);if(m.st||m.normal||m.tangent||m.bitangent){for(L=0;L<x;L++){var O=z[L]?K:H,I=tt.Cartesian3.fromArray(b,3*L,mt),O=O.geodeticSurfaceNormal(I,st);N[L]&&tt.Cartesian3.negate(O,O),m.st&&(I=tt.Cartesian2.negate(O,ct),R[J++]=Math.atan2(I.y,I.x)/ot.CesiumMath.TWO_PI+.5,R[J++]=Math.asin(O.z)/Math.PI+.5),m.normal&&(w[X++]=O.x,w[X++]=O.y,w[X++]=O.z),(m.tangent||m.bitangent)&&(I=0,z[L]&&(I=q),I=!h&&I<=L&&L<I+2*C?tt.Cartesian3.UNIT_X:tt.Cartesian3.UNIT_Z,tt.Cartesian3.cross(I,O,I=ut),tt.Cartesian3.normalize(I,I),m.tangent&&(F[Z++]=I.x,F[Z++]=I.y,F[Z++]=I.z),m.bitangent)&&(O=tt.Cartesian3.cross(O,I,lt),tt.Cartesian3.normalize(O,O),P[j++]=O.x,P[j++]=O.y,P[j++]=O.z)}m.st&&(v.st=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:R})),m.normal&&(v.normal=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:w})),m.tangent&&(v.tangent=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:F})),m.bitangent&&(v.bitangent=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:P}))}return at.defined(t._offsetAttribute)&&(p=b.length,_=new Uint8Array(p/3),A=t._offsetAttribute===Q.GeometryOffsetAttribute.NONE?0:1,Q.arrayFill(_,A),v.applyOffset=new it.GeometryAttribute({componentDatatype:et.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:_})),new it.Geometry({attributes:v,indices:k,primitiveType:it.PrimitiveType.TRIANGLES,boundingSphere:$.BoundingSphere.fromEllipsoid(H),offsetAttribute:t._offsetAttribute})}}},d.getUnitEllipsoid=function(){return a=at.defined(a)?a:d.createGeometry(new d({radii:new tt.Cartesian3(1,1,1),vertexFormat:f.VertexFormat.POSITION_ONLY}))},t.EllipsoidGeometry=d});
