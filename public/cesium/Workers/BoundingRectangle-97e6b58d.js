define(["exports","./Cartesian2-c1eb9da0","./Check-f996273c","./when-ae2e0b60","./Transforms-75c1d9a1"],function(t,h,e,o,r){"use strict";function f(t,e,n,i){this.x=o.defaultValue(t,0),this.y=o.defaultValue(e,0),this.width=o.defaultValue(n,0),this.height=o.defaultValue(i,0)}f.packedLength=4,f.pack=function(t,e,n){return n=o.defaultValue(n,0),e[n++]=t.x,e[n++]=t.y,e[n++]=t.width,e[n]=t.height,e},f.unpack=function(t,e,n){return e=o.defaultValue(e,0),(n=o.defined(n)?n:new f).x=t[e++],n.y=t[e++],n.width=t[e++],n.height=t[e],n},f.fromPoints=function(t,e){if(o.defined(e)||(e=new f),o.defined(t)&&0!==t.length){for(var n=t.length,i=t[0].x,h=t[0].y,a=t[0].x,r=t[0].y,d=1;d<n;d++)var u=t[d],c=u.x,u=u.y,i=Math.min(c,i),a=Math.max(c,a),h=Math.min(u,h),r=Math.max(u,r);e.x=i,e.y=h,e.width=a-i,e.height=r-h}else e.x=0,e.y=0,e.width=0,e.height=0;return e};var a=new r.GeographicProjection,d=new h.Cartographic,u=new h.Cartographic;f.fromRectangle=function(t,e,n){var i;return o.defined(n)||(n=new f),o.defined(t)?(i=(e=o.defaultValue(e,a)).project(h.Rectangle.southwest(t,d)),e=e.project(h.Rectangle.northeast(t,u)),h.Cartesian2.subtract(e,i,e),n.x=i.x,n.y=i.y,n.width=e.x,n.height=e.y):(n.x=0,n.y=0,n.width=0,n.height=0),n},f.clone=function(t,e){if(o.defined(t))return o.defined(e)?(e.x=t.x,e.y=t.y,e.width=t.width,e.height=t.height,e):new f(t.x,t.y,t.width,t.height)},f.union=function(t,e,n){o.defined(n)||(n=new f);var i=Math.min(t.x,e.x),h=Math.min(t.y,e.y),a=Math.max(t.x+t.width,e.x+e.width),t=Math.max(t.y+t.height,e.y+e.height);return n.x=i,n.y=h,n.width=a-i,n.height=t-h,n},f.expand=function(t,e,n){n=f.clone(t,n);var t=e.x-n.x,i=e.y-n.y;return t>n.width?n.width=t:t<0&&(n.width-=t,n.x=e.x),i>n.height?n.height=i:i<0&&(n.height-=i,n.y=e.y),n},f.intersect=function(t,e){var n=t.x,i=t.y,h=e.x,a=e.y;return n>h+e.width||n+t.width<h||i+t.height<a||i>a+e.height?r.Intersect.OUTSIDE:r.Intersect.INTERSECTING},f.equals=function(t,e){return t===e||o.defined(t)&&o.defined(e)&&t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height},f.prototype.clone=function(t){return f.clone(this,t)},f.prototype.intersect=function(t){return f.intersect(this,t)},f.prototype.equals=function(t){return f.equals(this,t)},t.BoundingRectangle=f});
