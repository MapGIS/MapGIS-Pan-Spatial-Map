define(["exports","./GeometryOffsetAttribute-b02d5bb9","./Transforms-713e2e92","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./when-ae2e0b60","./GeometryAttribute-e03451d8","./GeometryAttributes-5ce4955a","./VertexFormat-90d15264"],function(e,m,u,s,t,y,p,x,c,o){"use strict";var f=new s.Cartesian3;function A(e){var t=(e=p.defaultValue(e,p.defaultValue.EMPTY_OBJECT)).minimum,a=e.maximum,n=p.defaultValue(e.vertexFormat,o.VertexFormat.DEFAULT);this._minimum=s.Cartesian3.clone(t),this._maximum=s.Cartesian3.clone(a),this._vertexFormat=n,this._offsetAttribute=e.offsetAttribute,this._workerName="createBoxGeometry"}A.fromDimensions=function(e){var t=(e=p.defaultValue(e,p.defaultValue.EMPTY_OBJECT)).dimensions,t=s.Cartesian3.multiplyByScalar(t,.5,new s.Cartesian3);return new A({minimum:s.Cartesian3.negate(t,new s.Cartesian3),maximum:t,vertexFormat:e.vertexFormat,offsetAttribute:e.offsetAttribute})},A.fromAxisAlignedBoundingBox=function(e){return new A({minimum:e.minimum,maximum:e.maximum})},A.packedLength=2*s.Cartesian3.packedLength+o.VertexFormat.packedLength+1,A.pack=function(e,t,a){return a=p.defaultValue(a,0),s.Cartesian3.pack(e._minimum,t,a),s.Cartesian3.pack(e._maximum,t,a+s.Cartesian3.packedLength),o.VertexFormat.pack(e._vertexFormat,t,a+2*s.Cartesian3.packedLength),t[a+2*s.Cartesian3.packedLength+o.VertexFormat.packedLength]=p.defaultValue(e._offsetAttribute,-1),t};var a,l=new s.Cartesian3,b=new s.Cartesian3,d=new o.VertexFormat,C={minimum:l,maximum:b,vertexFormat:d,offsetAttribute:void 0};A.unpack=function(e,t,a){t=p.defaultValue(t,0);var n=s.Cartesian3.unpack(e,t,l),r=s.Cartesian3.unpack(e,t+s.Cartesian3.packedLength,b),i=o.VertexFormat.unpack(e,t+2*s.Cartesian3.packedLength,d),e=e[t+2*s.Cartesian3.packedLength+o.VertexFormat.packedLength];return p.defined(a)?(a._minimum=s.Cartesian3.clone(n,a._minimum),a._maximum=s.Cartesian3.clone(r,a._maximum),a._vertexFormat=o.VertexFormat.clone(i,a._vertexFormat),a._offsetAttribute=-1===e?void 0:e,a):(C.offsetAttribute=-1===e?void 0:e,new A(C))},A.createGeometry=function(e){var t,a,n,r=e._minimum,i=e._maximum,o=e._vertexFormat;if(!s.Cartesian3.equals(r,i))return t=new c.GeometryAttributes,o.position&&(o.st||o.normal||o.tangent||o.bitangent)?(o.position&&((n=new Float64Array(72))[0]=r.x,n[1]=r.y,n[2]=i.z,n[3]=i.x,n[4]=r.y,n[5]=i.z,n[6]=i.x,n[7]=i.y,n[8]=i.z,n[9]=r.x,n[10]=i.y,n[11]=i.z,n[12]=r.x,n[13]=r.y,n[14]=r.z,n[15]=i.x,n[16]=r.y,n[17]=r.z,n[18]=i.x,n[19]=i.y,n[20]=r.z,n[21]=r.x,n[22]=i.y,n[23]=r.z,n[24]=i.x,n[25]=r.y,n[26]=r.z,n[27]=i.x,n[28]=i.y,n[29]=r.z,n[30]=i.x,n[31]=i.y,n[32]=i.z,n[33]=i.x,n[34]=r.y,n[35]=i.z,n[36]=r.x,n[37]=r.y,n[38]=r.z,n[39]=r.x,n[40]=i.y,n[41]=r.z,n[42]=r.x,n[43]=i.y,n[44]=i.z,n[45]=r.x,n[46]=r.y,n[47]=i.z,n[48]=r.x,n[49]=i.y,n[50]=r.z,n[51]=i.x,n[52]=i.y,n[53]=r.z,n[54]=i.x,n[55]=i.y,n[56]=i.z,n[57]=r.x,n[58]=i.y,n[59]=i.z,n[60]=r.x,n[61]=r.y,n[62]=r.z,n[63]=i.x,n[64]=r.y,n[65]=r.z,n[66]=i.x,n[67]=r.y,n[68]=i.z,n[69]=r.x,n[70]=r.y,n[71]=i.z,t.position=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n})),o.normal&&((a=new Float32Array(72))[0]=0,a[1]=0,a[2]=1,a[3]=0,a[4]=0,a[5]=1,a[6]=0,a[7]=0,a[8]=1,a[9]=0,a[10]=0,a[11]=1,a[12]=0,a[13]=0,a[14]=-1,a[15]=0,a[16]=0,a[17]=-1,a[18]=0,a[19]=0,a[20]=-1,a[21]=0,a[22]=0,a[23]=-1,a[24]=1,a[25]=0,a[26]=0,a[27]=1,a[28]=0,a[29]=0,a[30]=1,a[31]=0,a[32]=0,a[33]=1,a[34]=0,a[35]=0,a[36]=-1,a[37]=0,a[38]=0,a[39]=-1,a[40]=0,a[41]=0,a[42]=-1,a[43]=0,a[44]=0,a[45]=-1,a[46]=0,a[47]=0,a[48]=0,a[49]=1,a[50]=0,a[51]=0,a[52]=1,a[53]=0,a[54]=0,a[55]=1,a[56]=0,a[57]=0,a[58]=1,a[59]=0,a[60]=0,a[61]=-1,a[62]=0,a[63]=0,a[64]=-1,a[65]=0,a[66]=0,a[67]=-1,a[68]=0,a[69]=0,a[70]=-1,a[71]=0,t.normal=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:a})),o.st&&((a=new Float32Array(48))[0]=0,a[1]=0,a[2]=1,a[3]=0,a[4]=1,a[5]=1,a[6]=0,a[7]=1,a[8]=1,a[9]=0,a[10]=0,a[11]=0,a[12]=0,a[13]=1,a[14]=1,a[15]=1,a[16]=0,a[17]=0,a[18]=1,a[19]=0,a[20]=1,a[21]=1,a[22]=0,a[23]=1,a[24]=1,a[25]=0,a[26]=0,a[27]=0,a[28]=0,a[29]=1,a[30]=1,a[31]=1,a[32]=1,a[33]=0,a[34]=0,a[35]=0,a[36]=0,a[37]=1,a[38]=1,a[39]=1,a[40]=0,a[41]=0,a[42]=1,a[43]=0,a[44]=1,a[45]=1,a[46]=0,a[47]=1,t.st=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:a})),o.tangent&&((a=new Float32Array(72))[0]=1,a[1]=0,a[2]=0,a[3]=1,a[4]=0,a[5]=0,a[6]=1,a[7]=0,a[8]=0,a[9]=1,a[10]=0,a[11]=0,a[12]=-1,a[13]=0,a[14]=0,a[15]=-1,a[16]=0,a[17]=0,a[18]=-1,a[19]=0,a[20]=0,a[21]=-1,a[22]=0,a[23]=0,a[24]=0,a[25]=1,a[26]=0,a[27]=0,a[28]=1,a[29]=0,a[30]=0,a[31]=1,a[32]=0,a[33]=0,a[34]=1,a[35]=0,a[36]=0,a[37]=-1,a[38]=0,a[39]=0,a[40]=-1,a[41]=0,a[42]=0,a[43]=-1,a[44]=0,a[45]=0,a[46]=-1,a[47]=0,a[48]=-1,a[49]=0,a[50]=0,a[51]=-1,a[52]=0,a[53]=0,a[54]=-1,a[55]=0,a[56]=0,a[57]=-1,a[58]=0,a[59]=0,a[60]=1,a[61]=0,a[62]=0,a[63]=1,a[64]=0,a[65]=0,a[66]=1,a[67]=0,a[68]=0,a[69]=1,a[70]=0,a[71]=0,t.tangent=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:a})),o.bitangent&&((a=new Float32Array(72))[0]=0,a[1]=1,a[2]=0,a[3]=0,a[4]=1,a[5]=0,a[6]=0,a[7]=1,a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=0,a[13]=1,a[14]=0,a[15]=0,a[16]=1,a[17]=0,a[18]=0,a[19]=1,a[20]=0,a[21]=0,a[22]=1,a[23]=0,a[24]=0,a[25]=0,a[26]=1,a[27]=0,a[28]=0,a[29]=1,a[30]=0,a[31]=0,a[32]=1,a[33]=0,a[34]=0,a[35]=1,a[36]=0,a[37]=0,a[38]=1,a[39]=0,a[40]=0,a[41]=1,a[42]=0,a[43]=0,a[44]=1,a[45]=0,a[46]=0,a[47]=1,a[48]=0,a[49]=0,a[50]=1,a[51]=0,a[52]=0,a[53]=1,a[54]=0,a[55]=0,a[56]=1,a[57]=0,a[58]=0,a[59]=1,a[60]=0,a[61]=0,a[62]=1,a[63]=0,a[64]=0,a[65]=1,a[66]=0,a[67]=0,a[68]=1,a[69]=0,a[70]=0,a[71]=1,t.bitangent=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:a})),(a=new Uint16Array(36))[0]=0,a[1]=1,a[2]=2,a[3]=0,a[4]=2,a[5]=3,a[6]=6,a[7]=5,a[8]=4,a[9]=7,a[10]=6,a[11]=4,a[12]=8,a[13]=9,a[14]=10,a[15]=8,a[16]=10,a[17]=11,a[18]=14,a[19]=13,a[20]=12,a[21]=15,a[22]=14,a[23]=12,a[24]=18,a[25]=17,a[26]=16,a[27]=19,a[28]=18,a[29]=16,a[30]=20,a[31]=21,a[32]=22,a[33]=20,a[34]=22,a[35]=23):((n=new Float64Array(24))[0]=r.x,n[1]=r.y,n[2]=r.z,n[3]=i.x,n[4]=r.y,n[5]=r.z,n[6]=i.x,n[7]=i.y,n[8]=r.z,n[9]=r.x,n[10]=i.y,n[11]=r.z,n[12]=r.x,n[13]=r.y,n[14]=i.z,n[15]=i.x,n[16]=r.y,n[17]=i.z,n[18]=i.x,n[19]=i.y,n[20]=i.z,n[21]=r.x,n[22]=i.y,n[23]=i.z,t.position=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n}),(a=new Uint16Array(36))[0]=4,a[1]=5,a[2]=6,a[3]=4,a[4]=6,a[5]=7,a[6]=1,a[7]=0,a[8]=3,a[9]=1,a[10]=3,a[11]=2,a[12]=1,a[13]=6,a[14]=5,a[15]=1,a[16]=2,a[17]=6,a[18]=2,a[19]=3,a[20]=7,a[21]=2,a[22]=7,a[23]=6,a[24]=3,a[25]=0,a[26]=4,a[27]=3,a[28]=4,a[29]=7,a[30]=0,a[31]=1,a[32]=5,a[33]=0,a[34]=5,a[35]=4),o=s.Cartesian3.subtract(i,r,f),i=.5*s.Cartesian3.magnitude(o),p.defined(e._offsetAttribute)&&(r=n.length,o=new Uint8Array(r/3),n=e._offsetAttribute===m.GeometryOffsetAttribute.NONE?0:1,m.arrayFill(o,n),t.applyOffset=new x.GeometryAttribute({componentDatatype:y.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:o})),new x.Geometry({attributes:t,indices:a,primitiveType:x.PrimitiveType.TRIANGLES,boundingSphere:new u.BoundingSphere(s.Cartesian3.ZERO,i),offsetAttribute:e._offsetAttribute})},A.getUnitBox=function(){return a=p.defined(a)?a:A.createGeometry(A.fromDimensions({dimensions:new s.Cartesian3(1,1,1),vertexFormat:o.VertexFormat.POSITION_ONLY}))},e.BoxGeometry=A});