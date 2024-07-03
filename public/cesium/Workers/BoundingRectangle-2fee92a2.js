define(["exports","./Matrix2-59fd2efe","./RuntimeError-24b14c10","./when-ae2e0b60","./Transforms-3bc98d07"],function(t,h,e,f,a){function c(t,e,n,i){this.x=f.defaultValue(t,0),this.y=f.defaultValue(e,0),this.width=f.defaultValue(n,0),this.height=f.defaultValue(i,0)}c.packedLength=4,c.pack=function(t,e,n){return n=f.defaultValue(n,0),e[n++]=t.x,e[n++]=t.y,e[n++]=t.width,e[n]=t.height,e},c.unpack=function(t,e,n){return e=f.defaultValue(e,0),(n=f.defined(n)?n:new c).x=t[e++],n.y=t[e++],n.width=t[e++],n.height=t[e],n},c.fromPoints=function(t,e){if(f.defined(e)||(e=new c),f.defined(t)&&0!==t.length){for(var n=t.length,i=t[0].x,h=t[0].y,r=t[0].x,a=t[0].y,d=1;d<n;d++)var u=t[d],o=u.x,u=u.y,i=Math.min(o,i),r=Math.max(o,r),h=Math.min(u,h),a=Math.max(u,a);e.x=i,e.y=h,e.width=r-i,e.height=a-h}else e.x=0,e.y=0,e.width=0,e.height=0;return e};var r=new a.GeographicProjection,d=new h.Cartographic,u=new h.Cartographic;c.fromRectangle=function(t,e,n){var i;return f.defined(n)||(n=new c),f.defined(t)?(i=(e=f.defaultValue(e,r)).project(h.Rectangle.southwest(t,d)),e=e.project(h.Rectangle.northeast(t,u)),h.Cartesian2.subtract(e,i,e),n.x=i.x,n.y=i.y,n.width=e.x,n.height=e.y):(n.x=0,n.y=0,n.width=0,n.height=0),n},c.clone=function(t,e){if(f.defined(t))return f.defined(e)?(e.x=t.x,e.y=t.y,e.width=t.width,e.height=t.height,e):new c(t.x,t.y,t.width,t.height)},c.union=function(t,e,n){f.defined(n)||(n=new c);var i=Math.min(t.x,e.x),h=Math.min(t.y,e.y),r=Math.max(t.x+t.width,e.x+e.width),t=Math.max(t.y+t.height,e.y+e.height);return n.x=i,n.y=h,n.width=r-i,n.height=t-h,n},c.expand=function(t,e,n){n=c.clone(t,n);var t=e.x-n.x,i=e.y-n.y;return t>n.width?n.width=t:t<0&&(n.width-=t,n.x=e.x),i>n.height?n.height=i:i<0&&(n.height-=i,n.y=e.y),n},c.intersect=function(t,e){var n=t.x,i=t.y,h=e.x,r=e.y;return n>h+e.width||n+t.width<h||i+t.height<r||i>r+e.height?a.Intersect.OUTSIDE:a.Intersect.INTERSECTING},c.equals=function(t,e){return t===e||f.defined(t)&&f.defined(e)&&t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height},c.prototype.clone=function(t){return c.clone(this,t)},c.prototype.intersect=function(t){return c.intersect(this,t)},c.prototype.equals=function(t){return c.equals(this,t)},t.BoundingRectangle=c});
