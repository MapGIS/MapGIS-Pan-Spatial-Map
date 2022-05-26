define(["exports","./Transforms-a4418317","./Cartesian2-38b35910","./Check-f996273c","./when-ae2e0b60","./AttributeCompression-25f42564","./ComponentDatatype-e44126e4","./Math-5bbcea10"],function(e,f,p,G,x,l,d,h){"use strict";function t(e,t){this._ellipsoid=e,this._cameraPosition=new p.Cartesian3,this._cameraPositionInScaledSpace=new p.Cartesian3,this._distanceToLimbInScaledSpaceSquared=0,x.defined(t)&&(this.cameraPosition=t)}Object.defineProperties(t.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},cameraPosition:{get:function(){return this._cameraPosition},set:function(e){var t=this._ellipsoid.transformPositionToScaledSpace(e,this._cameraPositionInScaledSpace),i=p.Cartesian3.magnitudeSquared(t)-1;p.Cartesian3.clone(e,this._cameraPosition),this._cameraPositionInScaledSpace=t,this._distanceToLimbInScaledSpaceSquared=i}}});var a=new p.Cartesian3,r=(t.prototype.isPointVisible=function(e){return C(this._ellipsoid.transformPositionToScaledSpace(e,a),this._cameraPositionInScaledSpace,this._distanceToLimbInScaledSpaceSquared)},t.prototype.isScaledSpacePointVisible=function(e){return C(e,this._cameraPositionInScaledSpace,this._distanceToLimbInScaledSpaceSquared)},new p.Cartesian3),n=(t.prototype.isScaledSpacePointVisiblePossiblyUnderEllipsoid=function(e,t){var i,a=this._ellipsoid,a=x.defined(t)&&t<0&&a.minimumRadius>-t?((i=r).x=this._cameraPosition.x/(a.radii.x+t),i.y=this._cameraPosition.y/(a.radii.y+t),i.z=this._cameraPosition.z/(a.radii.z+t),i.x*i.x+i.y*i.y+i.z*i.z-1):(i=this._cameraPositionInScaledSpace,this._distanceToLimbInScaledSpaceSquared);return C(e,i,a)},t.prototype.computeHorizonCullingPoint=function(e,t,i){return u(this._ellipsoid,e,t,i)},p.Ellipsoid.clone(p.Ellipsoid.UNIT_SPHERE)),o=(t.prototype.computeHorizonCullingPointPossiblyUnderEllipsoid=function(e,t,i,a){return u(c(this._ellipsoid,i,n),e,t,a)},t.prototype.computeHorizonCullingPointFromVertices=function(e,t,i,a,r){return S(this._ellipsoid,e,t,i,a,r)},t.prototype.computeHorizonCullingPointFromVerticesPossiblyUnderEllipsoid=function(e,t,i,a,r,o){return S(c(this._ellipsoid,r,n),e,t,i,a,o)},[]),s=(t.prototype.computeHorizonCullingPointFromRectangle=function(e,t,i){var e=p.Rectangle.subsample(e,t,0,o),a=f.BoundingSphere.fromPoints(e);if(!(p.Cartesian3.magnitude(a.center)<.1*t.minimumRadius))return this.computeHorizonCullingPoint(a.center,e,i)},new p.Cartesian3);function c(e,t,i){return x.defined(t)&&t<0&&e.minimumRadius>-t&&(t=p.Cartesian3.fromElements(e.radii.x+t,e.radii.y+t,e.radii.z+t,s),e=p.Ellipsoid.fromCartesian3(t,i)),e}function u(e,t,i,a){x.defined(a)||(a=new p.Cartesian3);for(var r=T(e,t),o=0,n=0,s=i.length;n<s;++n){var c=N(e,i[n],r);if(c<0)return;o=Math.max(o,c)}return M(r,o,a)}var m=new p.Cartesian3;function S(e,t,i,a,r,o){x.defined(o)||(o=new p.Cartesian3),a=x.defaultValue(a,3),r=x.defaultValue(r,p.Cartesian3.ZERO);for(var n=T(e,t),s=0,c=0,d=i.length;c<d;c+=a){m.x=i[c]+r.x,m.y=i[c+1]+r.y,m.z=i[c+2]+r.z;var u=N(e,m,n);if(u<0)return;s=Math.max(s,u)}return M(n,s,o)}function C(e,t,i){e=p.Cartesian3.subtract(e,t,a),t=-p.Cartesian3.dot(e,t);return!(i<0?0<t:i<t&&t*t/p.Cartesian3.magnitudeSquared(e)>i)}var g=new p.Cartesian3,y=new p.Cartesian3;function N(e,t,i){var e=e.transformPositionToScaledSpace(t,g),t=p.Cartesian3.magnitudeSquared(e),a=Math.sqrt(t),e=p.Cartesian3.divideByScalar(e,a,y),t=Math.max(1,t),a=1/Math.max(1,a);return 1/(p.Cartesian3.dot(e,i)*a-p.Cartesian3.magnitude(p.Cartesian3.cross(e,i,e))*(Math.sqrt(t-1)*a))}function M(e,t,i){if(!(t<=0||t===1/0||t!=t))return p.Cartesian3.multiplyByScalar(e,t,i)}var i=new p.Cartesian3;function T(e,t){return p.Cartesian3.equals(t,p.Cartesian3.ZERO)?t:(e.transformPositionToScaledSpace(t,i),p.Cartesian3.normalize(i,i))}var b={getHeight:function(e,t,i){return(e-i)*t+i}},P=new p.Cartesian3,z=(b.getPosition=function(e,t,i,a,r){e=t.cartesianToCartographic(e,P),i=b.getHeight(e.height,i,a);return p.Cartesian3.fromRadians(e.longitude,e.latitude,i,t,r)},Object.freeze({NONE:0,BITS12:1})),_=new p.Cartesian3,E=new p.Cartesian3,v=new p.Cartesian2,H=new f.Matrix4,w=new f.Matrix4,O=Math.pow(2,12);function A(e,t,i,a,r,o,n,s,c,d){var u,m,l,h=z.NONE;x.defined(t)&&x.defined(i)&&x.defined(a)&&x.defined(r)&&(l=t.minimum,t=t.maximum,t=p.Cartesian3.subtract(t,l,E),u=a-i,h=Math.max(p.Cartesian3.maximumComponent(t),u)<O-1?z.BITS12:z.NONE,u=f.Matrix4.inverseTransformation(r,new f.Matrix4),m=p.Cartesian3.negate(l,_),f.Matrix4.multiply(f.Matrix4.fromTranslation(m,H),u,u),(m=_).x=1/t.x,m.y=1/t.y,m.z=1/t.z,f.Matrix4.multiply(f.Matrix4.fromScale(m,H),u,u),m=f.Matrix4.clone(r),f.Matrix4.setTranslation(m,p.Cartesian3.ZERO,m),r=f.Matrix4.clone(r,new f.Matrix4),l=f.Matrix4.fromTranslation(l,H),t=f.Matrix4.fromScale(t,w),l=f.Matrix4.multiply(l,t,H),f.Matrix4.multiply(r,l,r),f.Matrix4.multiply(m,l,m)),this.quantization=h,this.minimumHeight=i,this.maximumHeight=a,this.center=p.Cartesian3.clone(e),this.toScaledENU=u,this.fromScaledENU=r,this.matrix=m,this.hasVertexNormals=o,this.hasWebMercatorT=x.defaultValue(n,!1),this.hasGeodeticSurfaceNormals=x.defaultValue(s,!1),this.exaggeration=x.defaultValue(c,1),this.exaggerationRelativeHeight=x.defaultValue(d,0),this.stride=0,this._offsetGeodeticSurfaceNormal=0,this._offsetVertexNormal=0,this._calculateStrideAndOffsets()}A.prototype.encode=function(e,t,i,a,r,o,n,s){var c,d,u,m=a.x,a=a.y;return this.quantization===z.BITS12?((i=f.Matrix4.multiplyByPoint(this.toScaledENU,i,_)).x=h.CesiumMath.clamp(i.x,0,1),i.y=h.CesiumMath.clamp(i.y,0,1),i.z=h.CesiumMath.clamp(i.z,0,1),c=this.maximumHeight-this.minimumHeight,c=h.CesiumMath.clamp((r-this.minimumHeight)/c,0,1),p.Cartesian2.fromElements(i.x,i.y,v),u=l.AttributeCompression.compressTextureCoordinates(v),p.Cartesian2.fromElements(i.z,c,v),c=l.AttributeCompression.compressTextureCoordinates(v),p.Cartesian2.fromElements(m,a,v),d=l.AttributeCompression.compressTextureCoordinates(v),e[t++]=u,e[t++]=c,e[t++]=d,this.hasWebMercatorT&&(p.Cartesian2.fromElements(n,0,v),u=l.AttributeCompression.compressTextureCoordinates(v),e[t++]=u)):(p.Cartesian3.subtract(i,this.center,_),e[t++]=_.x,e[t++]=_.y,e[t++]=_.z,e[t++]=r,e[t++]=m,e[t++]=a,this.hasWebMercatorT&&(e[t++]=n)),this.hasVertexNormals&&(e[t++]=l.AttributeCompression.octPackFloat(o)),this.hasGeodeticSurfaceNormals&&(e[t++]=s.x,e[t++]=s.y,e[t++]=s.z),t};var B=new p.Cartesian3,I=new p.Cartesian3,q=(A.prototype.addGeodeticSurfaceNormals=function(e,t,i){if(!this.hasGeodeticSurfaceNormals)for(var a=this.stride,r=e.length/a,o=(this.hasGeodeticSurfaceNormals=!0,this._calculateStrideAndOffsets(),this.stride),n=0;n<r;n++){for(var s=0;s<a;s++)t[n*o+s]=e[n*a+s];var c=this.decodePosition(t,n,B),c=i.geodeticSurfaceNormal(c,I),d=n*o+this._offsetGeodeticSurfaceNormal;t[d]=c.x,t[d+1]=c.y,t[d+2]=c.z}},A.prototype.removeGeodeticSurfaceNormals=function(e,t){if(this.hasGeodeticSurfaceNormals)for(var i=this.stride,a=e.length/i,r=(this.hasGeodeticSurfaceNormals=!1,this._calculateStrideAndOffsets(),this.stride),o=0;o<a;o++)for(var n=0;n<r;n++)t[o*r+n]=e[o*i+n]},A.prototype.decodePosition=function(e,t,i){var a;return x.defined(i)||(i=new p.Cartesian3),t*=this.stride,this.quantization===z.BITS12?(a=l.AttributeCompression.decompressTextureCoordinates(e[t],v),i.x=a.x,i.y=a.y,a=l.AttributeCompression.decompressTextureCoordinates(e[t+1],v),i.z=a.x,f.Matrix4.multiplyByPoint(this.fromScaledENU,i,i)):(i.x=e[t],i.y=e[t+1],i.z=e[t+2],p.Cartesian3.add(i,this.center,i))},A.prototype.getExaggeratedPosition=function(e,t,i){i=this.decodePosition(e,t,i);var a,r=this.exaggeration,o=this.exaggerationRelativeHeight;return 1!==r&&this.hasGeodeticSurfaceNormals&&(a=this.decodeGeodeticSurfaceNormal(e,t,I),e=this.decodeHeight(e,t),t=b.getHeight(e,r,o)-e,i.x+=a.x*t,i.y+=a.y*t,i.z+=a.z*t),i},A.prototype.decodeTextureCoordinates=function(e,t,i){return x.defined(i)||(i=new p.Cartesian2),t*=this.stride,this.quantization===z.BITS12?l.AttributeCompression.decompressTextureCoordinates(e[t+2],i):p.Cartesian2.fromElements(e[t+4],e[t+5],i)},A.prototype.decodeHeight=function(e,t){return t*=this.stride,this.quantization===z.BITS12?l.AttributeCompression.decompressTextureCoordinates(e[t+1],v).y*(this.maximumHeight-this.minimumHeight)+this.minimumHeight:e[t+3]},A.prototype.decodeWebMercatorT=function(e,t){return t*=this.stride,this.quantization===z.BITS12?l.AttributeCompression.decompressTextureCoordinates(e[t+3],v).x:e[t+6]},A.prototype.getOctEncodedNormal=function(e,t,i){e=e[t=t*this.stride+this._offsetVertexNormal]/256,t=Math.floor(e);return p.Cartesian2.fromElements(t,256*(e-t),i)},A.prototype.decodeGeodeticSurfaceNormal=function(e,t,i){return t=t*this.stride+this._offsetGeodeticSurfaceNormal,i.x=e[t],i.y=e[t+1],i.z=e[t+2],i},A.prototype._calculateStrideAndOffsets=function(){var e=0;this.quantization===z.BITS12?e+=3:e+=6,this.hasWebMercatorT&&(e+=1),this.hasVertexNormals&&(this._offsetVertexNormal=e,e+=1),this.hasGeodeticSurfaceNormals&&(this._offsetGeodeticSurfaceNormal=e,e+=3),this.stride=e},{position3DAndHeight:0,textureCoordAndEncodedNormals:1,geodeticSurfaceNormal:2}),V={compressed0:0,compressed1:1,geodeticSurfaceNormal:2};A.prototype.getAttributes=function(i){var e,t,a=d.ComponentDatatype.FLOAT,r=d.ComponentDatatype.getSizeInBytes(a),o=this.stride*r,n=0,s=[];function c(e,t){s.push({index:e,vertexBuffer:i,componentDatatype:a,componentsPerAttribute:t,offsetInBytes:n,strideInBytes:o}),n+=t*r}return this.quantization===z.NONE?(c(q.position3DAndHeight,4),e=2,e=(e+=this.hasWebMercatorT?1:0)+(this.hasVertexNormals?1:0),c(q.textureCoordAndEncodedNormals,e),this.hasGeodeticSurfaceNormals&&c(q.geodeticSurfaceNormal,3)):(e=this.hasWebMercatorT||this.hasVertexNormals,t=this.hasWebMercatorT&&this.hasVertexNormals,c(V.compressed0,e?4:3),t&&c(V.compressed1,1),this.hasGeodeticSurfaceNormals&&c(V.geodeticSurfaceNormal,3)),s},A.prototype.getAttributeLocations=function(){return this.quantization===z.NONE?q:V},A.clone=function(e,t){if(x.defined(e))return(t=x.defined(t)?t:new A).quantization=e.quantization,t.minimumHeight=e.minimumHeight,t.maximumHeight=e.maximumHeight,t.center=p.Cartesian3.clone(e.center),t.toScaledENU=f.Matrix4.clone(e.toScaledENU),t.fromScaledENU=f.Matrix4.clone(e.fromScaledENU),t.matrix=f.Matrix4.clone(e.matrix),t.hasVertexNormals=e.hasVertexNormals,t.hasWebMercatorT=e.hasWebMercatorT,t.hasGeodeticSurfaceNormals=e.hasGeodeticSurfaceNormals,t.exaggeration=e.exaggeration,t.exaggerationRelativeHeight=e.exaggerationRelativeHeight,t._calculateStrideAndOffsets(),t},e.EllipsoidalOccluder=t,e.TerrainEncoding=A});
