define(["./GeometryOffsetAttribute-b02d5bb9","./Transforms-75c1d9a1","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./CylinderGeometryLibrary-88cb80d2","./when-ae2e0b60","./GeometryAttribute-842f7f8f","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2"],function(c,p,y,e,_,h,A,v,R,G,t,i,r,a){"use strict";var O=new y.Cartesian2;function s(e){var t=(e=A.defaultValue(e,A.defaultValue.EMPTY_OBJECT)).length,i=e.topRadius,r=e.bottomRadius,a=A.defaultValue(e.slices,128),n=Math.max(A.defaultValue(e.numberOfVerticalLines,16),0);this._length=t,this._topRadius=i,this._bottomRadius=r,this._slices=a,this._numberOfVerticalLines=n,this._offsetAttribute=e.offsetAttribute,this._workerName="createCylinderOutlineGeometry"}s.packedLength=6,s.pack=function(e,t,i){return i=A.defaultValue(i,0),t[i++]=e._length,t[i++]=e._topRadius,t[i++]=e._bottomRadius,t[i++]=e._slices,t[i++]=e._numberOfVerticalLines,t[i]=A.defaultValue(e._offsetAttribute,-1),t};var f={length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};return s.unpack=function(e,t,i){t=A.defaultValue(t,0);var r=e[t++],a=e[t++],n=e[t++],o=e[t++],u=e[t++],e=e[t];return A.defined(i)?(i._length=r,i._topRadius=a,i._bottomRadius=n,i._slices=o,i._numberOfVerticalLines=u,i._offsetAttribute=-1===e?void 0:e,i):(f.length=r,f.topRadius=a,f.bottomRadius=n,f.slices=o,f.numberOfVerticalLines=u,f.offsetAttribute=-1===e?void 0:e,new s(f))},s.createGeometry=function(e){var t=e._length,i=e._topRadius,r=e._bottomRadius,a=e._slices,n=e._numberOfVerticalLines;if(!(t<=0||i<0||r<0||0===i&&0===r)){for(var o,u=2*a,s=h.CylinderGeometryLibrary.computePositions(t,i,r,a,!1),f=2*a,d=(0<n&&(m=Math.min(n,a),o=Math.round(a/m),f+=m),G.IndexDatatype.createTypedArray(u,2*f)),b=0,l=0;l<a-1;l++)d[b++]=l,d[b++]=l+1,d[b++]=l+a,d[b++]=l+1+a;if(d[b++]=a-1,d[b++]=0,d[b++]=a+a-1,d[b++]=a,0<n)for(l=0;l<a;l+=o)d[b++]=l,d[b++]=l+a;var m=new R.GeometryAttributes,u=(m.position=new v.GeometryAttribute({componentDatatype:_.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:s}),O.x=.5*t,O.y=Math.max(r,i),new p.BoundingSphere(y.Cartesian3.ZERO,y.Cartesian2.magnitude(O)));return A.defined(e._offsetAttribute)&&(t=s.length,f=new Uint8Array(t/3),n=e._offsetAttribute===c.GeometryOffsetAttribute.NONE?0:1,c.arrayFill(f,n),m.applyOffset=new v.GeometryAttribute({componentDatatype:_.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:f})),new v.Geometry({attributes:m,indices:d,primitiveType:v.PrimitiveType.LINES,boundingSphere:u,offsetAttribute:e._offsetAttribute})}},function(e,t){return A.defined(t)&&(e=s.unpack(e,t)),s.createGeometry(e)}});
