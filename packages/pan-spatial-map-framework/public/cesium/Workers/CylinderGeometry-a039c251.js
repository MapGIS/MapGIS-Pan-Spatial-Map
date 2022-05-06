define(["exports","./GeometryOffsetAttribute-70462dd7","./Transforms-afef28e3","./Cartesian2-8dbd81c1","./ComponentDatatype-2104c626","./CylinderGeometryLibrary-8617eb7a","./when-695b7bde","./Check-c47ad5ed","./GeometryAttribute-8921fd23","./GeometryAttributes-5198def4","./IndexDatatype-a458492e","./Math-09ca1a10","./VertexFormat-327b5e55"],function(e,P,I,k,M,U,z,a,E,S,B,Y,m){"use strict";var N=new k.Cartesian2,Z=new k.Cartesian3,J=new k.Cartesian3,W=new k.Cartesian3,j=new k.Cartesian3;function u(t){var e=(t=z.defaultValue(t,z.defaultValue.EMPTY_OBJECT)).length,a=t.topRadius,r=t.bottomRadius,n=z.defaultValue(t.vertexFormat,m.VertexFormat.DEFAULT),o=z.defaultValue(t.slices,128);this._length=e,this._topRadius=a,this._bottomRadius=r,this._vertexFormat=m.VertexFormat.clone(n),this._slices=o,this._offsetAttribute=t.offsetAttribute,this._workerName="createCylinderGeometry"}u.packedLength=m.VertexFormat.packedLength+5,u.pack=function(t,e,a){return a=z.defaultValue(a,0),m.VertexFormat.pack(t._vertexFormat,e,a),a+=m.VertexFormat.packedLength,e[a++]=t._length,e[a++]=t._topRadius,e[a++]=t._bottomRadius,e[a++]=t._slices,e[a]=z.defaultValue(t._offsetAttribute,-1),e};var t,p=new m.VertexFormat,d={vertexFormat:p,length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,offsetAttribute:void 0};u.unpack=function(t,e,a){e=z.defaultValue(e,0);var r=m.VertexFormat.unpack(t,e,p),n=(e+=m.VertexFormat.packedLength,t[e++]),o=t[e++],i=t[e++],s=t[e++],t=t[e];return z.defined(a)?(a._vertexFormat=m.VertexFormat.clone(r,a._vertexFormat),a._length=n,a._topRadius=o,a._bottomRadius=i,a._slices=s,a._offsetAttribute=-1===t?void 0:t,a):(d.length=n,d.topRadius=o,d.bottomRadius=i,d.slices=s,d.offsetAttribute=-1===t?void 0:t,new u(d))},u.createGeometry=function(d){var p=d._length,y=d._topRadius,f=d._bottomRadius,t=d._vertexFormat,e=d._slices;if(!(p<=0||y<0||f<0||0===y&&0===f)){var l=e+e,b=e+l,c=l+l,A=U.CylinderGeometryLibrary.computePositions(p,y,f,e,!0),v=t.st?new Float32Array(2*c):void 0,a=t.normal?new Float32Array(3*c):void 0,r=t.tangent?new Float32Array(3*c):void 0,n=t.bitangent?new Float32Array(3*c):void 0,g=t.normal||t.tangent||t.bitangent;if(g){for(var h=t.tangent||t.bitangent,o=0,i=0,x=0,_=Math.atan2(f-y,p),C=Z,F=(C.z=Math.sin(_),Math.cos(_)),w=W,G=J,s=0;s<e;s++){var D=s/e*Y.CesiumMath.TWO_PI,R=F*Math.cos(D),D=F*Math.sin(D);g&&(C.x=R,C.y=D,h&&(w=k.Cartesian3.normalize(k.Cartesian3.cross(k.Cartesian3.UNIT_Z,C,w),w)),t.normal&&(a[o++]=C.x,a[o++]=C.y,a[o++]=C.z,a[o++]=C.x,a[o++]=C.y,a[o++]=C.z),t.tangent&&(r[i++]=w.x,r[i++]=w.y,r[i++]=w.z,r[i++]=w.x,r[i++]=w.y,r[i++]=w.z),t.bitangent&&(G=k.Cartesian3.normalize(k.Cartesian3.cross(C,w,G),G),n[x++]=G.x,n[x++]=G.y,n[x++]=G.z,n[x++]=G.x,n[x++]=G.y,n[x++]=G.z))}for(s=0;s<e;s++)t.normal&&(a[o++]=0,a[o++]=0,a[o++]=-1),t.tangent&&(r[i++]=1,r[i++]=0,r[i++]=0),t.bitangent&&(n[x++]=0,n[x++]=-1,n[x++]=0);for(s=0;s<e;s++)t.normal&&(a[o++]=0,a[o++]=0,a[o++]=1),t.tangent&&(r[i++]=1,r[i++]=0,r[i++]=0),t.bitangent&&(n[x++]=0,n[x++]=1,n[x++]=0)}var m=B.IndexDatatype.createTypedArray(c,12*e-12),u=0,V=0;for(s=0;s<e-1;s++)m[u++]=V,m[u++]=V+2,m[u++]=V+3,m[u++]=V,m[u++]=V+3,m[u++]=V+1,V+=2;for(m[u++]=l-2,m[u++]=0,m[u++]=1,m[u++]=l-2,m[u++]=1,m[u++]=l-1,s=1;s<e-1;s++)m[u++]=l+s+1,m[u++]=l+s,m[u++]=l;for(s=1;s<e-1;s++)m[u++]=b,m[u++]=b+s,m[u++]=b+s+1;var T=0;if(t.st){var O=Math.max(y,f);for(s=0;s<c;s++){var L=k.Cartesian3.fromArray(A,3*s,j);v[T++]=(L.x+O)/(2*O),v[T++]=(L.y+O)/(2*O)}}_=new S.GeometryAttributes,f=(t.position&&(_.position=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:A})),t.normal&&(_.normal=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:a})),t.tangent&&(_.tangent=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:r})),t.bitangent&&(_.bitangent=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:n})),t.st&&(_.st=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:v})),N.x=.5*p,N.y=Math.max(f,y),new I.BoundingSphere(k.Cartesian3.ZERO,k.Cartesian2.magnitude(N)));return z.defined(d._offsetAttribute)&&(p=A.length,y=new Uint8Array(p/3),p=d._offsetAttribute===P.GeometryOffsetAttribute.NONE?0:1,P.arrayFill(y,p),_.applyOffset=new E.GeometryAttribute({componentDatatype:M.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:y})),new E.Geometry({attributes:_,indices:m,primitiveType:E.PrimitiveType.TRIANGLES,boundingSphere:f,offsetAttribute:d._offsetAttribute})}},u.getUnitCylinder=function(){return t=z.defined(t)?t:u.createGeometry(new u({topRadius:1,bottomRadius:1,length:1,vertexFormat:m.VertexFormat.POSITION_ONLY}))},e.CylinderGeometry=u});
