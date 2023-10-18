define(["exports","./Transforms-1b5921a3","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./when-ae2e0b60","./GeometryAttribute-b0d1422a","./GeometryAttributes-5ce4955a","./Math-5bbcea10","./Plane-91027bbd","./VertexFormat-90d15264"],function(t,g,w,a,v,x,b,M,i,f,u){"use strict";function h(t){this.planes=x.defaultValue(t,[])}var p=[new w.Cartesian3,new w.Cartesian3,new w.Cartesian3],d=(w.Cartesian3.clone(w.Cartesian3.UNIT_X,p[0]),w.Cartesian3.clone(w.Cartesian3.UNIT_Y,p[1]),w.Cartesian3.clone(w.Cartesian3.UNIT_Z,p[2]),new w.Cartesian3),c=new w.Cartesian3,l=new f.Plane(new w.Cartesian3(1,0,0),0);function n(t){t=x.defaultValue(t,x.defaultValue.EMPTY_OBJECT),this.left=t.left,this._left=void 0,this.right=t.right,this._right=void 0,this.top=t.top,this._top=void 0,this.bottom=t.bottom,this._bottom=void 0,this.near=x.defaultValue(t.near,1),this._near=this.near,this.far=x.defaultValue(t.far,5e8),this._far=this.far,this._cullingVolume=new h,this._orthographicMatrix=new g.Matrix4}function o(t){t.top===t._top&&t.bottom===t._bottom&&t.left===t._left&&t.right===t._right&&t.near===t._near&&t.far===t._far||(t._left=t.left,t._right=t.right,t._top=t.top,t._bottom=t.bottom,t._near=t.near,t._far=t.far,t._orthographicMatrix=g.Matrix4.computeOrthographicOffCenter(t.left,t.right,t.bottom,t.top,t.near,t.far,t._orthographicMatrix))}h.fromBoundingSphere=function(t,e){x.defined(e)||(e=new h);for(var a=p.length,i=e.planes,n=(i.length=2*a,t.center),r=t.radius,o=0,s=0;s<a;++s){var f=p[s],u=i[o],l=i[o+1];x.defined(u)||(u=i[o]=new g.Cartesian4),x.defined(l)||(l=i[o+1]=new g.Cartesian4),w.Cartesian3.multiplyByScalar(f,-r,d),w.Cartesian3.add(n,d,d),u.x=f.x,u.y=f.y,u.z=f.z,u.w=-w.Cartesian3.dot(f,d),w.Cartesian3.multiplyByScalar(f,r,d),w.Cartesian3.add(n,d,d),l.x=-f.x,l.y=-f.y,l.z=-f.z,l.w=-w.Cartesian3.dot(w.Cartesian3.negate(f,c),d),o+=2}return e},h.prototype.computeVisibility=function(t){for(var e=this.planes,a=!1,i=0,n=e.length;i<n;++i){var r=t.intersectPlane(f.Plane.fromCartesian4(e[i],l));if(r===g.Intersect.OUTSIDE)return g.Intersect.OUTSIDE;r===g.Intersect.INTERSECTING&&(a=!0)}return a?g.Intersect.INTERSECTING:g.Intersect.INSIDE},h.prototype.computeVisibilityWithPlaneMask=function(t,e){if(e===h.MASK_OUTSIDE||e===h.MASK_INSIDE)return e;for(var a=h.MASK_INSIDE,i=this.planes,n=0,r=i.length;n<r;++n){var o=n<31?1<<n:0;if(!(n<31&&0==(e&o))){var s=t.intersectPlane(f.Plane.fromCartesian4(i[n],l));if(s===g.Intersect.OUTSIDE)return h.MASK_OUTSIDE;s===g.Intersect.INTERSECTING&&(a|=o)}}return a},h.MASK_OUTSIDE=4294967295,h.MASK_INSIDE=0,h.MASK_INDETERMINATE=2147483647,Object.defineProperties(n.prototype,{projectionMatrix:{get:function(){return o(this),this._orthographicMatrix}}});var m=new w.Cartesian3,C=new w.Cartesian3,I=new w.Cartesian3,_=new w.Cartesian3;function y(t){t=x.defaultValue(t,x.defaultValue.EMPTY_OBJECT),this._offCenterFrustum=new n,this.width=t.width,this._width=void 0,this.aspectRatio=t.aspectRatio,this._aspectRatio=void 0,this.near=x.defaultValue(t.near,1),this._near=this.near,this.far=x.defaultValue(t.far,5e8),this._far=this.far}function r(t){var e,a=t._offCenterFrustum;t.width===t._width&&t.aspectRatio===t._aspectRatio&&t.near===t._near&&t.far===t._far||(t._aspectRatio=t.aspectRatio,t._width=t.width,t._near=t.near,t._far=t.far,e=1/t.aspectRatio,a.right=.5*t.width,a.left=-a.right,a.top=e*a.right,a.bottom=-a.top,a.near=t.near,a.far=t.far)}function s(t){t=x.defaultValue(t,x.defaultValue.EMPTY_OBJECT),this.left=t.left,this._left=void 0,this.right=t.right,this._right=void 0,this.top=t.top,this._top=void 0,this.bottom=t.bottom,this._bottom=void 0,this.near=x.defaultValue(t.near,1),this._near=this.near,this.far=x.defaultValue(t.far,5e8),this._far=this.far,this._cullingVolume=new h,this._perspectiveMatrix=new g.Matrix4,this._infinitePerspective=new g.Matrix4}function F(t){var e=t.top,a=t.bottom,i=t.right,n=t.left,r=t.near,o=t.far;e===t._top&&a===t._bottom&&n===t._left&&i===t._right&&r===t._near&&o===t._far||(t._left=n,t._right=i,t._top=e,t._bottom=a,t._near=r,t._far=o,t._perspectiveMatrix=g.Matrix4.computePerspectiveOffCenter(n,i,a,e,r,o,t._perspectiveMatrix),t._infinitePerspective=g.Matrix4.computeInfinitePerspectiveOffCenter(n,i,a,e,r,t._infinitePerspective))}n.prototype.computeCullingVolume=function(t,e,a){var i=this._cullingVolume.planes,n=this.top,r=this.bottom,o=this.right,s=this.left,f=this.near,u=this.far,l=w.Cartesian3.cross(e,a,m),h=(w.Cartesian3.normalize(l,l),C),f=(w.Cartesian3.multiplyByScalar(e,f,h),w.Cartesian3.add(t,h,h),I),s=(w.Cartesian3.multiplyByScalar(l,s,f),w.Cartesian3.add(h,f,f),i[0]);return(s=x.defined(s)?s:i[0]=new g.Cartesian4).x=l.x,s.y=l.y,s.z=l.z,s.w=-w.Cartesian3.dot(l,f),w.Cartesian3.multiplyByScalar(l,o,f),w.Cartesian3.add(h,f,f),s=i[1],(s=x.defined(s)?s:i[1]=new g.Cartesian4).x=-l.x,s.y=-l.y,s.z=-l.z,s.w=-w.Cartesian3.dot(w.Cartesian3.negate(l,_),f),w.Cartesian3.multiplyByScalar(a,r,f),w.Cartesian3.add(h,f,f),s=i[2],(s=x.defined(s)?s:i[2]=new g.Cartesian4).x=a.x,s.y=a.y,s.z=a.z,s.w=-w.Cartesian3.dot(a,f),w.Cartesian3.multiplyByScalar(a,n,f),w.Cartesian3.add(h,f,f),s=i[3],(s=x.defined(s)?s:i[3]=new g.Cartesian4).x=-a.x,s.y=-a.y,s.z=-a.z,s.w=-w.Cartesian3.dot(w.Cartesian3.negate(a,_),f),s=i[4],(s=x.defined(s)?s:i[4]=new g.Cartesian4).x=e.x,s.y=e.y,s.z=e.z,s.w=-w.Cartesian3.dot(e,h),w.Cartesian3.multiplyByScalar(e,u,f),w.Cartesian3.add(t,f,f),s=i[5],(s=x.defined(s)?s:i[5]=new g.Cartesian4).x=-e.x,s.y=-e.y,s.z=-e.z,s.w=-w.Cartesian3.dot(w.Cartesian3.negate(e,_),f),this._cullingVolume},n.prototype.getPixelDimensions=function(t,e,a,i,n){o(this);var r=this.right-this.left,e=i*(this.top-this.bottom)/e;return n.x=i*r/t,n.y=e,n},n.prototype.clone=function(t){return(t=x.defined(t)?t:new n).left=this.left,t.right=this.right,t.top=this.top,t.bottom=this.bottom,t.near=this.near,t.far=this.far,t._left=void 0,t._right=void 0,t._top=void 0,t._bottom=void 0,t._near=void 0,t._far=void 0,t},n.prototype.equals=function(t){return x.defined(t)&&t instanceof n&&this.right===t.right&&this.left===t.left&&this.top===t.top&&this.bottom===t.bottom&&this.near===t.near&&this.far===t.far},n.prototype.equalsEpsilon=function(t,e,a){return t===this||x.defined(t)&&t instanceof n&&i.CesiumMath.equalsEpsilon(this.right,t.right,e,a)&&i.CesiumMath.equalsEpsilon(this.left,t.left,e,a)&&i.CesiumMath.equalsEpsilon(this.top,t.top,e,a)&&i.CesiumMath.equalsEpsilon(this.bottom,t.bottom,e,a)&&i.CesiumMath.equalsEpsilon(this.near,t.near,e,a)&&i.CesiumMath.equalsEpsilon(this.far,t.far,e,a)},y.packedLength=4,y.pack=function(t,e,a){return a=x.defaultValue(a,0),e[a++]=t.width,e[a++]=t.aspectRatio,e[a++]=t.near,e[a]=t.far,e},y.unpack=function(t,e,a){return e=x.defaultValue(e,0),(a=x.defined(a)?a:new y).width=t[e++],a.aspectRatio=t[e++],a.near=t[e++],a.far=t[e],a},Object.defineProperties(y.prototype,{projectionMatrix:{get:function(){return r(this),this._offCenterFrustum.projectionMatrix}}}),y.prototype.computeCullingVolume=function(t,e,a){return r(this),this._offCenterFrustum.computeCullingVolume(t,e,a)},y.prototype.getPixelDimensions=function(t,e,a,i,n){return r(this),this._offCenterFrustum.getPixelDimensions(t,e,a,i,n)},y.prototype.clone=function(t){return(t=x.defined(t)?t:new y).aspectRatio=this.aspectRatio,t.width=this.width,t.near=this.near,t.far=this.far,t._aspectRatio=void 0,t._width=void 0,t._near=void 0,t._far=void 0,this._offCenterFrustum.clone(t._offCenterFrustum),t},y.prototype.equals=function(t){return!!(x.defined(t)&&t instanceof y)&&(r(this),r(t),this.width===t.width)&&this.aspectRatio===t.aspectRatio&&this._offCenterFrustum.equals(t._offCenterFrustum)},y.prototype.equalsEpsilon=function(t,e,a){return!!(x.defined(t)&&t instanceof y)&&(r(this),r(t),i.CesiumMath.equalsEpsilon(this.width,t.width,e,a))&&i.CesiumMath.equalsEpsilon(this.aspectRatio,t.aspectRatio,e,a)&&this._offCenterFrustum.equalsEpsilon(t._offCenterFrustum,e,a)},Object.defineProperties(s.prototype,{projectionMatrix:{get:function(){return F(this),this._perspectiveMatrix}},infiniteProjectionMatrix:{get:function(){return F(this),this._infinitePerspective}}});var q=new w.Cartesian3,B=new w.Cartesian3,L=new w.Cartesian3,N=new w.Cartesian3;function V(t){t=x.defaultValue(t,x.defaultValue.EMPTY_OBJECT),this._offCenterFrustum=new s,this.fov=t.fov,this._fov=void 0,this._fovy=void 0,this._sseDenominator=void 0,this.aspectRatio=t.aspectRatio,this._aspectRatio=void 0,this.near=x.defaultValue(t.near,1),this._near=this.near,this.far=x.defaultValue(t.far,5e8),this._far=this.far,this.xOffset=x.defaultValue(t.xOffset,0),this._xOffset=this.xOffset,this.yOffset=x.defaultValue(t.yOffset,0),this._yOffset=this.yOffset}function E(t){var e=t._offCenterFrustum;t.fov===t._fov&&t.aspectRatio===t._aspectRatio&&t.near===t._near&&t.far===t._far&&t.xOffset===t._xOffset&&t.yOffset===t._yOffset||(t._aspectRatio=t.aspectRatio,t._fov=t.fov,t._fovy=t.aspectRatio<=1?t.fov:2*Math.atan(Math.tan(.5*t.fov)/t.aspectRatio),t._near=t.near,t._far=t.far,t._sseDenominator=2*Math.tan(.5*t._fovy),t._xOffset=t.xOffset,t._yOffset=t.yOffset,e.top=t.near*Math.tan(.5*t._fovy),e.bottom=-e.top,e.right=t.aspectRatio*e.top,e.left=-e.right,e.near=t.near,e.far=t.far,e.right+=t.xOffset,e.left+=t.xOffset,e.top+=t.yOffset,e.bottom+=t.yOffset)}s.prototype.computeCullingVolume=function(t,e,a){var i=this._cullingVolume.planes,n=this.top,r=this.bottom,o=this.right,s=this.left,f=this.near,u=this.far,l=w.Cartesian3.cross(e,a,q),h=B,f=(w.Cartesian3.multiplyByScalar(e,f,h),w.Cartesian3.add(t,h,h),L),u=(w.Cartesian3.multiplyByScalar(e,u,f),w.Cartesian3.add(t,f,f),N),s=(w.Cartesian3.multiplyByScalar(l,s,u),w.Cartesian3.add(h,u,u),w.Cartesian3.subtract(u,t,u),w.Cartesian3.normalize(u,u),w.Cartesian3.cross(u,a,u),w.Cartesian3.normalize(u,u),i[0]);return(s=x.defined(s)?s:i[0]=new g.Cartesian4).x=u.x,s.y=u.y,s.z=u.z,s.w=-w.Cartesian3.dot(u,t),w.Cartesian3.multiplyByScalar(l,o,u),w.Cartesian3.add(h,u,u),w.Cartesian3.subtract(u,t,u),w.Cartesian3.cross(a,u,u),w.Cartesian3.normalize(u,u),s=i[1],(s=x.defined(s)?s:i[1]=new g.Cartesian4).x=u.x,s.y=u.y,s.z=u.z,s.w=-w.Cartesian3.dot(u,t),w.Cartesian3.multiplyByScalar(a,r,u),w.Cartesian3.add(h,u,u),w.Cartesian3.subtract(u,t,u),w.Cartesian3.cross(l,u,u),w.Cartesian3.normalize(u,u),s=i[2],(s=x.defined(s)?s:i[2]=new g.Cartesian4).x=u.x,s.y=u.y,s.z=u.z,s.w=-w.Cartesian3.dot(u,t),w.Cartesian3.multiplyByScalar(a,n,u),w.Cartesian3.add(h,u,u),w.Cartesian3.subtract(u,t,u),w.Cartesian3.cross(u,l,u),w.Cartesian3.normalize(u,u),s=i[3],(s=x.defined(s)?s:i[3]=new g.Cartesian4).x=u.x,s.y=u.y,s.z=u.z,s.w=-w.Cartesian3.dot(u,t),s=i[4],(s=x.defined(s)?s:i[4]=new g.Cartesian4).x=e.x,s.y=e.y,s.z=e.z,s.w=-w.Cartesian3.dot(e,h),w.Cartesian3.negate(e,u),s=i[5],(s=x.defined(s)?s:i[5]=new g.Cartesian4).x=u.x,s.y=u.y,s.z=u.z,s.w=-w.Cartesian3.dot(u,f),this._cullingVolume},s.prototype.getPixelDimensions=function(t,e,a,i,n){F(this);var r=1/this.near,e=2*i*a*(this.top*r)/e,r=this.right*r;return n.x=2*i*a*r/t,n.y=e,n},s.prototype.clone=function(t){return(t=x.defined(t)?t:new s).right=this.right,t.left=this.left,t.top=this.top,t.bottom=this.bottom,t.near=this.near,t.far=this.far,t._left=void 0,t._right=void 0,t._top=void 0,t._bottom=void 0,t._near=void 0,t._far=void 0,t},s.prototype.equals=function(t){return x.defined(t)&&t instanceof s&&this.right===t.right&&this.left===t.left&&this.top===t.top&&this.bottom===t.bottom&&this.near===t.near&&this.far===t.far},s.prototype.equalsEpsilon=function(t,e,a){return t===this||x.defined(t)&&t instanceof s&&i.CesiumMath.equalsEpsilon(this.right,t.right,e,a)&&i.CesiumMath.equalsEpsilon(this.left,t.left,e,a)&&i.CesiumMath.equalsEpsilon(this.top,t.top,e,a)&&i.CesiumMath.equalsEpsilon(this.bottom,t.bottom,e,a)&&i.CesiumMath.equalsEpsilon(this.near,t.near,e,a)&&i.CesiumMath.equalsEpsilon(this.far,t.far,e,a)},V.packedLength=6,V.pack=function(t,e,a){return a=x.defaultValue(a,0),e[a++]=t.fov,e[a++]=t.aspectRatio,e[a++]=t.near,e[a++]=t.far,e[a++]=t.xOffset,e[a]=t.yOffset,e},V.unpack=function(t,e,a){return e=x.defaultValue(e,0),(a=x.defined(a)?a:new V).fov=t[e++],a.aspectRatio=t[e++],a.near=t[e++],a.far=t[e++],a.xOffset=t[e++],a.yOffset=t[e],a},Object.defineProperties(V.prototype,{projectionMatrix:{get:function(){return E(this),this._offCenterFrustum.projectionMatrix}},infiniteProjectionMatrix:{get:function(){return E(this),this._offCenterFrustum.infiniteProjectionMatrix}},fovy:{get:function(){return E(this),this._fovy}},sseDenominator:{get:function(){return E(this),this._sseDenominator}}}),V.prototype.computeCullingVolume=function(t,e,a){return E(this),this._offCenterFrustum.computeCullingVolume(t,e,a)},V.prototype.getPixelDimensions=function(t,e,a,i,n){return E(this),this._offCenterFrustum.getPixelDimensions(t,e,a,i,n)},V.prototype.clone=function(t){return(t=x.defined(t)?t:new V).aspectRatio=this.aspectRatio,t.fov=this.fov,t.near=this.near,t.far=this.far,t._aspectRatio=void 0,t._fov=void 0,t._near=void 0,t._far=void 0,this._offCenterFrustum.clone(t._offCenterFrustum),t},V.prototype.equals=function(t){return!!(x.defined(t)&&t instanceof V)&&(E(this),E(t),this.fov===t.fov)&&this.aspectRatio===t.aspectRatio&&this._offCenterFrustum.equals(t._offCenterFrustum)},V.prototype.equalsEpsilon=function(t,e,a){return!!(x.defined(t)&&t instanceof V)&&(E(this),E(t),i.CesiumMath.equalsEpsilon(this.fov,t.fov,e,a))&&i.CesiumMath.equalsEpsilon(this.aspectRatio,t.aspectRatio,e,a)&&this._offCenterFrustum.equalsEpsilon(t._offCenterFrustum,e,a)};function O(t){var e,a,i=t.frustum,n=t.orientation,r=t.origin,o=x.defaultValue(t.vertexFormat,u.VertexFormat.DEFAULT),t=x.defaultValue(t._drawNearPlane,!0);i instanceof V?(e=0,a=V.packedLength):i instanceof y&&(e=1,a=y.packedLength),this._frustumType=e,this._frustum=i.clone(),this._origin=w.Cartesian3.clone(r),this._orientation=g.Quaternion.clone(n),this._drawNearPlane=t,this._vertexFormat=o,this._workerName="createFrustumGeometry",this.packedLength=2+a+w.Cartesian3.packedLength+g.Quaternion.packedLength+u.VertexFormat.packedLength}O.pack=function(t,e,a){a=x.defaultValue(a,0);var i=t._frustumType,n=t._frustum;return 0===(e[a++]=i)?(V.pack(n,e,a),a+=V.packedLength):(y.pack(n,e,a),a+=y.packedLength),w.Cartesian3.pack(t._origin,e,a),a+=w.Cartesian3.packedLength,g.Quaternion.pack(t._orientation,e,a),a+=g.Quaternion.packedLength,u.VertexFormat.pack(t._vertexFormat,e,a),e[a+=u.VertexFormat.packedLength]=t._drawNearPlane?1:0,e};var G=new V,j=new y,U=new g.Quaternion,Q=new w.Cartesian3,K=new u.VertexFormat;function P(t,e,a,i,n,r,o,s){for(var f=t/3*2,u=0;u<4;++u)x.defined(e)&&(e[t]=r.x,e[t+1]=r.y,e[t+2]=r.z),x.defined(a)&&(a[t]=o.x,a[t+1]=o.y,a[t+2]=o.z),x.defined(i)&&(i[t]=s.x,i[t+1]=s.y,i[t+2]=s.z),t+=3;n[f]=0,n[1+f]=0,n[2+f]=1,n[3+f]=0,n[4+f]=1,n[5+f]=1,n[6+f]=0,n[7+f]=1}O.unpack=function(t,e,a){e=x.defaultValue(e,0);var i,n=t[e++],r=(0===n?(i=V.unpack(t,e,G),e+=V.packedLength):(i=y.unpack(t,e,j),e+=y.packedLength),w.Cartesian3.unpack(t,e,Q)),o=(e+=w.Cartesian3.packedLength,g.Quaternion.unpack(t,e,U)),s=(e+=g.Quaternion.packedLength,u.VertexFormat.unpack(t,e,K)),t=1===t[e+=u.VertexFormat.packedLength];return x.defined(a)?(e=n===a._frustumType?a._frustum:void 0,a._frustum=i.clone(e),a._frustumType=n,a._origin=w.Cartesian3.clone(r,a._origin),a._orientation=g.Quaternion.clone(o,a._orientation),a._vertexFormat=u.VertexFormat.clone(s,a._vertexFormat),a._drawNearPlane=t,a):new O({frustum:i,origin:r,orientation:o,vertexFormat:s,_drawNearPlane:t})};for(var Y=new g.Matrix3,J=new g.Matrix4,z=new g.Matrix4,R=new w.Cartesian3,S=new w.Cartesian3,T=new w.Cartesian3,W=new w.Cartesian3,X=new w.Cartesian3,Z=new w.Cartesian3,k=new Array(3),A=new Array(4),D=(A[0]=new g.Cartesian4(-1,-1,1,1),A[1]=new g.Cartesian4(1,-1,1,1),A[2]=new g.Cartesian4(1,1,1,1),A[3]=new g.Cartesian4(-1,1,1,1),new Array(4)),e=0;e<4;++e)D[e]=new g.Cartesian4;O._computeNearFarPlanes=function(t,e,a,i,n,r,o,s){var f,u,e=g.Matrix3.fromQuaternion(e,Y),r=x.defaultValue(r,R),o=x.defaultValue(o,S),l=x.defaultValue(s,T),r=g.Matrix3.getColumn(e,0,r),o=g.Matrix3.getColumn(e,1,o),l=g.Matrix3.getColumn(e,2,l),s=(w.Cartesian3.normalize(r,r),w.Cartesian3.normalize(o,o),w.Cartesian3.normalize(l,l),w.Cartesian3.negate(r,r),g.Matrix4.computeView(t,l,o,r,J));0===a?(e=i.projectionMatrix,o=g.Matrix4.multiply(e,s,z),u=g.Matrix4.inverse(o,z)):f=g.Matrix4.inverseTransformation(s,z),x.defined(u)?(k[0]=i.near,k[1]=i.far):(k[0]=0,k[1]=i.near,k[2]=i.far);for(var h=0;h<2;++h)for(var p=0;p<4;++p){var d,c,m=g.Cartesian4.clone(A[p],D[p]);x.defined(u)?(d=1/(m=g.Matrix4.multiplyByVector(u,m,m)).w,w.Cartesian3.multiplyByScalar(m,d,m),w.Cartesian3.subtract(m,t,m),w.Cartesian3.normalize(m,m),d=w.Cartesian3.dot(l,m),w.Cartesian3.multiplyByScalar(m,k[h]/d,m),w.Cartesian3.add(m,t,m)):(x.defined(i._offCenterFrustum)&&(i=i._offCenterFrustum),d=k[h],c=k[h+1],m.x=.5*(m.x*(i.right-i.left)+i.left+i.right),m.y=.5*(m.y*(i.top-i.bottom)+i.bottom+i.top),m.z=.5*(m.z*(d-c)-d-c),m.w=1,g.Matrix4.multiplyByVector(f,m,m)),n[12*h+3*p]=m.x,n[12*h+3*p+1]=m.y,n[12*h+3*p+2]=m.z}},O.createGeometry=function(t){for(var e,a,i,n,r,o,s,f=t._frustumType,u=t._frustum,l=t._origin,h=t._orientation,p=t._drawNearPlane,t=t._vertexFormat,d=p?6:5,c=new Float64Array(72),l=(O._computeNearFarPlanes(l,h,f,u,c),24),h=(c[l]=c[12],c[l+1]=c[13],c[l+2]=c[14],c[l+3]=c[0],c[l+4]=c[1],c[l+5]=c[2],c[l+6]=c[9],c[l+7]=c[10],c[l+8]=c[11],c[l+9]=c[21],c[l+10]=c[22],c[l+11]=c[23],c[l+=12]=c[15],c[l+1]=c[16],c[l+2]=c[17],c[l+3]=c[3],c[l+4]=c[4],c[l+5]=c[5],c[l+6]=c[0],c[l+7]=c[1],c[l+8]=c[2],c[l+9]=c[12],c[l+10]=c[13],c[l+11]=c[14],c[l+=12]=c[3],c[l+1]=c[4],c[l+2]=c[5],c[l+3]=c[15],c[l+4]=c[16],c[l+5]=c[17],c[l+6]=c[18],c[l+7]=c[19],c[l+8]=c[20],c[l+9]=c[6],c[l+10]=c[7],c[l+11]=c[8],c[l+=12]=c[6],c[l+1]=c[7],c[l+2]=c[8],c[l+3]=c[18],c[l+4]=c[19],c[l+5]=c[20],c[l+6]=c[21],c[l+7]=c[22],c[l+8]=c[23],c[l+9]=c[9],c[l+10]=c[10],c[l+11]=c[11],p||(c=c.subarray(12)),new M.GeometryAttributes({position:new b.GeometryAttribute({componentDatatype:v.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:c})})),m=((x.defined(t.normal)||x.defined(t.tangent)||x.defined(t.bitangent)||x.defined(t.st))&&(f=x.defined(t.normal)?new Float32Array(12*d):void 0,u=x.defined(t.tangent)?new Float32Array(12*d):void 0,e=x.defined(t.bitangent)?new Float32Array(12*d):void 0,t=x.defined(t.st)?new Float32Array(8*d):void 0,i=S,n=T,r=w.Cartesian3.negate(a=R,W),o=w.Cartesian3.negate(i,X),s=w.Cartesian3.negate(n,Z),l=0,p&&(P(l,f,u,e,t,s,a,i),l+=12),P(l,f,u,e,t,n,r,i),P(l+=12,f,u,e,t,r,s,i),P(l+=12,f,u,e,t,o,s,r),P(l+=12,f,u,e,t,a,n,i),P(l+=12,f,u,e,t,i,n,r),x.defined(f)&&(h.normal=new b.GeometryAttribute({componentDatatype:v.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:f})),x.defined(u)&&(h.tangent=new b.GeometryAttribute({componentDatatype:v.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:u})),x.defined(e)&&(h.bitangent=new b.GeometryAttribute({componentDatatype:v.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:e})),x.defined(t))&&(h.st=new b.GeometryAttribute({componentDatatype:v.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:t})),new Uint16Array(6*d)),C=0;C<d;++C){var _=6*C,y=4*C;m[_]=y,m[1+_]=1+y,m[2+_]=2+y,m[3+_]=y,m[4+_]=2+y,m[5+_]=3+y}return new b.Geometry({attributes:h,indices:m,primitiveType:b.PrimitiveType.TRIANGLES,boundingSphere:g.BoundingSphere.fromVertices(c)})},t.FrustumGeometry=O,t.OrthographicFrustum=y,t.PerspectiveFrustum=V});
