define(["./GeometryOffsetAttribute-b02d5bb9","./Transforms-5b30acc6","./Cartesian2-38b35910","./Check-f996273c","./ComponentDatatype-e44126e4","./when-ae2e0b60","./GeometryAttribute-792ddfc7","./GeometryAttributes-5ce4955a","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2"],function(u,m,o,e,s,f,c,b,t,a,n,i){"use strict";var d=new o.Cartesian3;function r(e){var t=(e=f.defaultValue(e,f.defaultValue.EMPTY_OBJECT)).minimum,a=e.maximum;this._min=o.Cartesian3.clone(t),this._max=o.Cartesian3.clone(a),this._offsetAttribute=e.offsetAttribute,this._workerName="createBoxOutlineGeometry"}r.fromDimensions=function(e){var t=(e=f.defaultValue(e,f.defaultValue.EMPTY_OBJECT)).dimensions,t=o.Cartesian3.multiplyByScalar(t,.5,new o.Cartesian3);return new r({minimum:o.Cartesian3.negate(t,new o.Cartesian3),maximum:t,offsetAttribute:e.offsetAttribute})},r.fromAxisAlignedBoundingBox=function(e){return new r({minimum:e.minimum,maximum:e.maximum})},r.packedLength=2*o.Cartesian3.packedLength+1,r.pack=function(e,t,a){return a=f.defaultValue(a,0),o.Cartesian3.pack(e._min,t,a),o.Cartesian3.pack(e._max,t,a+o.Cartesian3.packedLength),t[a+2*o.Cartesian3.packedLength]=f.defaultValue(e._offsetAttribute,-1),t};var p=new o.Cartesian3,y=new o.Cartesian3,C={minimum:p,maximum:y,offsetAttribute:void 0};return r.unpack=function(e,t,a){t=f.defaultValue(t,0);var n=o.Cartesian3.unpack(e,t,p),i=o.Cartesian3.unpack(e,t+o.Cartesian3.packedLength,y),e=e[t+2*o.Cartesian3.packedLength];return f.defined(a)?(a._min=o.Cartesian3.clone(n,a._min),a._max=o.Cartesian3.clone(i,a._max),a._offsetAttribute=-1===e?void 0:e,a):(C.offsetAttribute=-1===e?void 0:e,new r(C))},r.createGeometry=function(e){var t,a,n,i=e._min,r=e._max;if(!o.Cartesian3.equals(i,r))return t=new b.GeometryAttributes,a=new Uint16Array(24),n=new Float64Array(24),n[0]=i.x,n[1]=i.y,n[2]=i.z,n[3]=r.x,n[4]=i.y,n[5]=i.z,n[6]=r.x,n[7]=r.y,n[8]=i.z,n[9]=i.x,n[10]=r.y,n[11]=i.z,n[12]=i.x,n[13]=i.y,n[14]=r.z,n[15]=r.x,n[16]=i.y,n[17]=r.z,n[18]=r.x,n[19]=r.y,n[20]=r.z,n[21]=i.x,n[22]=r.y,n[23]=r.z,t.position=new c.GeometryAttribute({componentDatatype:s.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n}),a[0]=4,a[1]=5,a[2]=5,a[3]=6,a[4]=6,a[5]=7,a[6]=7,a[7]=4,a[8]=0,a[9]=1,a[10]=1,a[11]=2,a[12]=2,a[13]=3,a[14]=3,a[15]=0,a[16]=0,a[17]=4,a[18]=1,a[19]=5,a[20]=2,a[21]=6,a[22]=3,a[23]=7,r=o.Cartesian3.subtract(r,i,d),i=.5*o.Cartesian3.magnitude(r),f.defined(e._offsetAttribute)&&(r=n.length,n=new Uint8Array(r/3),r=e._offsetAttribute===u.GeometryOffsetAttribute.NONE?0:1,u.arrayFill(n,r),t.applyOffset=new c.GeometryAttribute({componentDatatype:s.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:n})),new c.Geometry({attributes:t,indices:a,primitiveType:c.PrimitiveType.LINES,boundingSphere:new m.BoundingSphere(o.Cartesian3.ZERO,i),offsetAttribute:e._offsetAttribute})},function(e,t){return f.defined(t)&&(e=r.unpack(e,t)),r.createGeometry(e)}});
