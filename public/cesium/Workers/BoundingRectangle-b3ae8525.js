define(["exports","./Cartesian2-c1eb9da0","./Check-f996273c","./when-ae2e0b60","./Transforms-713e2e92"],function(e,h,t,o,r){"use strict";function f(e,t,n,i){this.x=o.defaultValue(e,0),this.y=o.defaultValue(t,0),this.width=o.defaultValue(n,0),this.height=o.defaultValue(i,0)}f.packedLength=4,f.pack=function(e,t,n){return n=o.defaultValue(n,0),t[n++]=e.x,t[n++]=e.y,t[n++]=e.width,t[n]=e.height,t},f.unpack=function(e,t,n){return t=o.defaultValue(t,0),(n=o.defined(n)?n:new f).x=e[t++],n.y=e[t++],n.width=e[t++],n.height=e[t],n},f.fromPoints=function(e,t){if(o.defined(t)||(t=new f),o.defined(e)&&0!==e.length){for(var n=e.length,i=e[0].x,h=e[0].y,a=e[0].x,r=e[0].y,d=1;d<n;d++)var u=e[d],c=u.x,u=u.y,i=Math.min(c,i),a=Math.max(c,a),h=Math.min(u,h),r=Math.max(u,r);t.x=i,t.y=h,t.width=a-i,t.height=r-h}else t.x=0,t.y=0,t.width=0,t.height=0;return t};var a=new r.GeographicProjection,d=new h.Cartographic,u=new h.Cartographic;f.fromRectangle=function(e,t,n){var i;return o.defined(n)||(n=new f),o.defined(e)?(i=(t=o.defaultValue(t,a)).project(h.Rectangle.southwest(e,d)),t=t.project(h.Rectangle.northeast(e,u)),h.Cartesian2.subtract(t,i,t),n.x=i.x,n.y=i.y,n.width=t.x,n.height=t.y):(n.x=0,n.y=0,n.width=0,n.height=0),n},f.clone=function(e,t){if(o.defined(e))return o.defined(t)?(t.x=e.x,t.y=e.y,t.width=e.width,t.height=e.height,t):new f(e.x,e.y,e.width,e.height)},f.union=function(e,t,n){o.defined(n)||(n=new f);var i=Math.min(e.x,t.x),h=Math.min(e.y,t.y),a=Math.max(e.x+e.width,t.x+t.width),e=Math.max(e.y+e.height,t.y+t.height);return n.x=i,n.y=h,n.width=a-i,n.height=e-h,n},f.expand=function(e,t,n){n=f.clone(e,n);var e=t.x-n.x,i=t.y-n.y;return e>n.width?n.width=e:e<0&&(n.width-=e,n.x=t.x),i>n.height?n.height=i:i<0&&(n.height-=i,n.y=t.y),n},f.intersect=function(e,t){var n=e.x,i=e.y,h=t.x,a=t.y;return n>h+t.width||n+e.width<h||i+e.height<a||i>a+t.height?r.Intersect.OUTSIDE:r.Intersect.INTERSECTING},f.equals=function(e,t){return e===t||o.defined(e)&&o.defined(t)&&e.x===t.x&&e.y===t.y&&e.width===t.width&&e.height===t.height},f.prototype.clone=function(e){return f.clone(this,e)},f.prototype.intersect=function(e){return f.intersect(this,e)},f.prototype.equals=function(e){return f.equals(this,e)},e.BoundingRectangle=f});
