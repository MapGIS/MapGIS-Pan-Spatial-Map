define(["exports","./Cartesian2-8dbd81c1","./Check-c47ad5ed","./when-695b7bde","./Transforms-afef28e3","./WebGLConstants-35626ea2"],function(e,x,o,a,L,t){"use strict";var n=Object.freeze({NONE:0,TRIANGLES:1,LINES:2,POLYLINES:3});function w(e,t,n,r){this[0]=a.defaultValue(e,0),this[1]=a.defaultValue(n,0),this[2]=a.defaultValue(t,0),this[3]=a.defaultValue(r,0)}w.packedLength=4,w.pack=function(e,t,n){return n=a.defaultValue(n,0),t[n++]=e[0],t[n++]=e[1],t[n++]=e[2],t[n++]=e[3],t},w.unpack=function(e,t,n){return t=a.defaultValue(t,0),(n=a.defined(n)?n:new w)[0]=e[t++],n[1]=e[t++],n[2]=e[t++],n[3]=e[t++],n},w.clone=function(e,t){if(a.defined(e))return a.defined(t)?(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t):new w(e[0],e[2],e[1],e[3])},w.fromArray=function(e,t,n){return t=a.defaultValue(t,0),(n=a.defined(n)?n:new w)[0]=e[t],n[1]=e[t+1],n[2]=e[t+2],n[3]=e[t+3],n},w.fromColumnMajorArray=function(e,t){return w.clone(e,t)},w.fromRowMajorArray=function(e,t){return a.defined(t)?(t[0]=e[0],t[1]=e[2],t[2]=e[1],t[3]=e[3],t):new w(e[0],e[1],e[2],e[3])},w.fromScale=function(e,t){return a.defined(t)?(t[0]=e.x,t[1]=0,t[2]=0,t[3]=e.y,t):new w(e.x,0,0,e.y)},w.fromUniformScale=function(e,t){return a.defined(t)?(t[0]=e,t[1]=0,t[2]=0,t[3]=e,t):new w(e,0,0,e)},w.fromRotation=function(e,t){var n=Math.cos(e),e=Math.sin(e);return a.defined(t)?(t[0]=n,t[1]=e,t[2]=-e,t[3]=n,t):new w(n,-e,e,n)},w.toArray=function(e,t){return a.defined(t)?(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t):[e[0],e[1],e[2],e[3]]},w.getElementIndex=function(e,t){return 2*e+t},w.getColumn=function(e,t,n){var t=2*t,r=e[t],e=e[1+t];return n.x=r,n.y=e,n},w.setColumn=function(e,t,n,r){t*=2;return(r=w.clone(e,r))[t]=n.x,r[1+t]=n.y,r},w.getRow=function(e,t,n){var r=e[t],e=e[t+2];return n.x=r,n.y=e,n},w.setRow=function(e,t,n,r){return(r=w.clone(e,r))[t]=n.x,r[t+2]=n.y,r};var r=new x.Cartesian2,s=(w.getScale=function(e,t){return t.x=x.Cartesian2.magnitude(x.Cartesian2.fromElements(e[0],e[1],r)),t.y=x.Cartesian2.magnitude(x.Cartesian2.fromElements(e[2],e[3],r)),t},new x.Cartesian2),i=(w.getMaximumScale=function(e){return w.getScale(e,s),x.Cartesian2.maximumComponent(s)},w.multiply=function(e,t,n){var r=e[0]*t[0]+e[2]*t[1],a=e[0]*t[2]+e[2]*t[3],i=e[1]*t[0]+e[3]*t[1],e=e[1]*t[2]+e[3]*t[3];return n[0]=r,n[1]=i,n[2]=a,n[3]=e,n},w.add=function(e,t,n){return n[0]=e[0]+t[0],n[1]=e[1]+t[1],n[2]=e[2]+t[2],n[3]=e[3]+t[3],n},w.subtract=function(e,t,n){return n[0]=e[0]-t[0],n[1]=e[1]-t[1],n[2]=e[2]-t[2],n[3]=e[3]-t[3],n},w.multiplyByVector=function(e,t,n){var r=e[0]*t.x+e[2]*t.y,e=e[1]*t.x+e[3]*t.y;return n.x=r,n.y=e,n},w.multiplyByScalar=function(e,t,n){return n[0]=e[0]*t,n[1]=e[1]*t,n[2]=e[2]*t,n[3]=e[3]*t,n},w.multiplyByScale=function(e,t,n){return n[0]=e[0]*t.x,n[1]=e[1]*t.x,n[2]=e[2]*t.y,n[3]=e[3]*t.y,n},w.negate=function(e,t){return t[0]=-e[0],t[1]=-e[1],t[2]=-e[2],t[3]=-e[3],t},w.transpose=function(e,t){var n=e[0],r=e[2],a=e[1],e=e[3];return t[0]=n,t[1]=r,t[2]=a,t[3]=e,t},w.abs=function(e,t){return t[0]=Math.abs(e[0]),t[1]=Math.abs(e[1]),t[2]=Math.abs(e[2]),t[3]=Math.abs(e[3]),t},w.equals=function(e,t){return e===t||a.defined(e)&&a.defined(t)&&e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]&&e[3]===t[3]},w.equalsArray=function(e,t,n){return e[0]===t[n]&&e[1]===t[n+1]&&e[2]===t[n+2]&&e[3]===t[n+3]},w.equalsEpsilon=function(e,t,n){return n=a.defaultValue(n,0),e===t||a.defined(e)&&a.defined(t)&&Math.abs(e[0]-t[0])<=n&&Math.abs(e[1]-t[1])<=n&&Math.abs(e[2]-t[2])<=n&&Math.abs(e[3]-t[3])<=n},w.IDENTITY=Object.freeze(new w(1,0,0,1)),w.ZERO=Object.freeze(new w(0,0,0,0)),w.COLUMN0ROW0=0,w.COLUMN0ROW1=1,w.COLUMN1ROW0=2,w.COLUMN1ROW1=3,Object.defineProperties(w.prototype,{length:{get:function(){return w.packedLength}}}),w.prototype.clone=function(e){return w.clone(this,e)},w.prototype.equals=function(e){return w.equals(this,e)},w.prototype.equalsEpsilon=function(e,t){return w.equalsEpsilon(this,e,t)},w.prototype.toString=function(){return"("+this[0]+", "+this[2]+")\n("+this[1]+", "+this[3]+")"},{POINTS:t.WebGLConstants.POINTS,LINES:t.WebGLConstants.LINES,LINE_LOOP:t.WebGLConstants.LINE_LOOP,LINE_STRIP:t.WebGLConstants.LINE_STRIP,TRIANGLES:t.WebGLConstants.TRIANGLES,TRIANGLE_STRIP:t.WebGLConstants.TRIANGLE_STRIP,TRIANGLE_FAN:t.WebGLConstants.TRIANGLE_FAN}),f=(i.validate=function(e){return e===i.POINTS||e===i.LINES||e===i.LINE_LOOP||e===i.LINE_STRIP||e===i.TRIANGLES||e===i.TRIANGLE_STRIP||e===i.TRIANGLE_FAN},Object.freeze(i));function u(e){e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT),this.attributes=e.attributes,this.indices=e.indices,this.primitiveType=a.defaultValue(e.primitiveType,f.TRIANGLES),this.boundingSphere=e.boundingSphere,this.geometryType=a.defaultValue(e.geometryType,n.NONE),this.boundingSphereCV=e.boundingSphereCV,this.offsetAttribute=e.offsetAttribute}u.computeNumberOfVertices=function(e){var t,n,r=-1;for(t in e.attributes)e.attributes.hasOwnProperty(t)&&a.defined(e.attributes[t])&&a.defined(e.attributes[t].values)&&(r=(n=e.attributes[t]).values.length/n.componentsPerAttribute);return r};var g=new x.Cartographic,S=new x.Cartesian3,A=new L.Matrix4,O=[new x.Cartographic,new x.Cartographic,new x.Cartographic],M=[new x.Cartesian2,new x.Cartesian2,new x.Cartesian2],R=[new x.Cartesian2,new x.Cartesian2,new x.Cartesian2],V=new x.Cartesian3,P=new L.Quaternion,v=new L.Matrix4,G=new w;u._textureCoordinateRotationPoints=function(c,l,d,e){for(var t=x.Rectangle.center(e,g),t=x.Cartographic.toCartesian(t,d,S),t=L.Transforms.eastNorthUpToFixedFrame(t,d,A),y=L.Matrix4.inverse(t,A),n=M,r=O,a=(r[0].longitude=e.west,r[0].latitude=e.south,r[1].longitude=e.west,r[1].latitude=e.north,r[2].longitude=e.east,r[2].latitude=e.south,V),i=0;i<3;i++)x.Cartographic.toCartesian(r[i],d,a),a=L.Matrix4.multiplyByPointAsVector(y,a,a),n[i].x=a.x,n[i].y=a.y;var t=L.Quaternion.fromAxisAngle(x.Cartesian3.UNIT_Z,-l,P),m=L.Matrix3.fromQuaternion(t,v),p=c.length,u=Number.POSITIVE_INFINITY,o=Number.POSITIVE_INFINITY,h=Number.NEGATIVE_INFINITY,N=Number.NEGATIVE_INFINITY;for(i=0;i<p;i++)a=L.Matrix4.multiplyByPointAsVector(y,c[i],a),a=L.Matrix3.multiplyByVector(m,a,a),u=Math.min(u,a.x),o=Math.min(o,a.y),h=Math.max(h,a.x),N=Math.max(N,a.y);var I=w.fromRotation(l,G),s=R,C=(s[0].x=u,s[0].y=o,s[1].x=u,s[1].y=N,s[2].x=h,s[2].y=o,n[0]),b=n[2].x-C.x,T=n[1].y-C.y;for(i=0;i<3;i++){var f=s[i];w.multiplyByVector(I,f,f),f.x=(f.x-C.x)/b,f.y=(f.y-C.y)/T}var e=s[0],t=s[1],l=s[2],E=new Array(6);return x.Cartesian2.pack(e,E),x.Cartesian2.pack(t,E,2),x.Cartesian2.pack(l,E,4),E},e.Geometry=u,e.GeometryAttribute=function(e){e=a.defaultValue(e,a.defaultValue.EMPTY_OBJECT),this.componentDatatype=e.componentDatatype,this.componentsPerAttribute=e.componentsPerAttribute,this.normalize=a.defaultValue(e.normalize,!1),this.values=e.values},e.GeometryType=n,e.Matrix2=w,e.PrimitiveType=f});
