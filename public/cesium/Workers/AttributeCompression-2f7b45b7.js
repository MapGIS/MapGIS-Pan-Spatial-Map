define(["exports","./Matrix2-59fd2efe","./ComponentDatatype-b7b5db18","./RuntimeError-24b14c10","./when-ae2e0b60"],function(e,o,C,t,u){"use strict";var a={SCALAR:"SCALAR",VEC2:"VEC2",VEC3:"VEC3",VEC4:"VEC4",MAT2:"MAT2",MAT3:"MAT3",MAT4:"MAT4",getMathType:function(e){switch(e){case a.SCALAR:return Number;case a.VEC2:return o.Cartesian2;case a.VEC3:return o.Cartesian3;case a.VEC4:return o.Cartesian4;case a.MAT2:return o.Matrix2;case a.MAT3:return o.Matrix3;case a.MAT4:return o.Matrix4}},getNumberOfComponents:function(e){switch(e){case a.SCALAR:return 1;case a.VEC2:return 2;case a.VEC3:return 3;case a.VEC4:case a.MAT2:return 4;case a.MAT3:return 9;case a.MAT4:return 16}}},M=Object.freeze(a),s={octEncodeInRange:function(e,t,a){var n;return a.x=e.x/(Math.abs(e.x)+Math.abs(e.y)+Math.abs(e.z)),a.y=e.y/(Math.abs(e.x)+Math.abs(e.y)+Math.abs(e.z)),e.z<0&&(e=a.x,n=a.y,a.x=(1-Math.abs(n))*C.CesiumMath.signNotZero(e),a.y=(1-Math.abs(e))*C.CesiumMath.signNotZero(n)),a.x=C.CesiumMath.toSNorm(a.x,t),a.y=C.CesiumMath.toSNorm(a.y,t),a},octEncode:function(e,t){return s.octEncodeInRange(e,255,t)}},n=new o.Cartesian2,r=new Uint8Array(1);function c(e){return r[0]=e,r[0]}s.octEncodeToCartesian4=function(e,t){return s.octEncodeInRange(e,65535,n),t.x=c(n.x*(1/256)),t.y=c(n.x),t.z=c(n.y*(1/256)),t.w=c(n.y),t},s.octDecodeInRange=function(e,t,a,n){return n.x=C.CesiumMath.fromSNorm(e,a),n.y=C.CesiumMath.fromSNorm(t,a),n.z=1-(Math.abs(n.x)+Math.abs(n.y)),n.z<0&&(e=n.x,n.x=(1-Math.abs(n.y))*C.CesiumMath.signNotZero(e),n.y=(1-Math.abs(e))*C.CesiumMath.signNotZero(n.y)),o.Cartesian3.normalize(n,n)},s.octDecode=function(e,t,a){return s.octDecodeInRange(e,t,255,a)},s.octDecodeFromCartesian4=function(e,t){var a=e.x,n=e.y,o=e.z,e=e.w;return s.octDecodeInRange(256*a+n,256*o+e,65535,t)},s.octPackFloat=function(e){return 256*e.x+e.y};var i=new o.Cartesian2;function f(e){return e>>1^-(1&e)}s.octEncodeFloat=function(e){return s.octEncode(e,i),s.octPackFloat(i)},s.octDecodeFloat=function(e,t){var e=e/256,a=Math.floor(e);return s.octDecode(a,256*(e-a),t)},s.octPack=function(e,t,a,n){e=s.octEncodeFloat(e),t=s.octEncodeFloat(t),a=s.octEncode(a,i);return n.x=65536*a.x+e,n.y=65536*a.y+t,n},s.octUnpack=function(e,t,a,n){var o=e.x/65536,r=Math.floor(o),c=65536*(o-r),o=e.y/65536,e=Math.floor(o),o=65536*(o-e);s.octDecodeFloat(c,t),s.octDecodeFloat(o,a),s.octDecode(r,e,n)},s.compressTextureCoordinates=function(e){return 4096*(4095*e.x|0)+(4095*e.y|0)},s.decompressTextureCoordinates=function(e,t){var a=Math.floor(e/4096);return t.x=a/4095,t.y=(e-4096*a)/4095,t},s.zigZagDeltaDecode=function(e,t,a){for(var n=e.length,o=0,r=0,c=0,s=0;s<n;++s)o+=f(e[s]),r+=f(t[s]),e[s]=o,t[s]=r,u.defined(a)&&(c+=f(a[s]),a[s]=c)},s.dequantize=function(e,t,a,n){var o,r=M.getNumberOfComponents(a);switch(t){case C.ComponentDatatype.BYTE:o=127;break;case C.ComponentDatatype.UNSIGNED_BYTE:o=255;break;case C.ComponentDatatype.SHORT:o=32767;break;case C.ComponentDatatype.UNSIGNED_SHORT:o=65535;break;case C.ComponentDatatype.INT:o=2147483647;break;case C.ComponentDatatype.UNSIGNED_INT:o=4294967295}for(var c=new Float32Array(n*r),s=0;s<n;s++)for(var u=0;u<r;u++){var i=s*r+u;c[i]=Math.max(e[i]/o,-1)}return c},e.AttributeCompression=s});
