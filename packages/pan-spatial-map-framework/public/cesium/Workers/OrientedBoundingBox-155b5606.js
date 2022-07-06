define(["exports","./Transforms-ce97037a","./Cartesian2-38b35910","./Check-f996273c","./when-ae2e0b60","./EllipsoidTangentPlane-d3bb82f1","./Math-5bbcea10","./Plane-ee0aa150"],function(a,N,O,t,P,w,y,b){"use strict";function T(a,t){this.center=O.Cartesian3.clone(P.defaultValue(a,O.Cartesian3.ZERO)),this.halfAxes=N.Matrix3.clone(P.defaultValue(t,N.Matrix3.ZERO))}T.packedLength=O.Cartesian3.packedLength+N.Matrix3.packedLength,T.pack=function(a,t,e){return e=P.defaultValue(e,0),O.Cartesian3.pack(a.center,t,e),N.Matrix3.pack(a.halfAxes,t,e+O.Cartesian3.packedLength),t},T.unpack=function(a,t,e){return t=P.defaultValue(t,0),P.defined(e)||(e=new T),O.Cartesian3.unpack(a,t,e.center),N.Matrix3.unpack(a,t+O.Cartesian3.packedLength,e.halfAxes),e};var A=new O.Cartesian3,I=new O.Cartesian3,R=new O.Cartesian3,E=new O.Cartesian3,S=new O.Cartesian3,U=new O.Cartesian3,L=new N.Matrix3,z={unitary:new N.Matrix3,diagonal:new N.Matrix3},M=(T.fromPoints=function(a,t){if(P.defined(t)||(t=new T),!P.defined(a)||0===a.length)return t.halfAxes=N.Matrix3.ZERO,t.center=O.Cartesian3.ZERO,t;for(var e=a.length,n=O.Cartesian3.clone(a[0],A),r=1;r<e;r++)O.Cartesian3.add(n,a[r],n);var i,s=1/e,o=(O.Cartesian3.multiplyByScalar(n,s,n),0),C=0,c=0,u=0,l=0,d=0;for(r=0;r<e;r++)o+=(i=O.Cartesian3.subtract(a[r],n,I)).x*i.x,C+=i.x*i.y,c+=i.x*i.z,u+=i.y*i.y,l+=i.y*i.z,d+=i.z*i.z;C*=s,c*=s,u*=s,l*=s,d*=s;var h=L,s=(h[0]=o*=s,h[1]=C,h[2]=c,h[3]=C,h[4]=u,h[5]=l,h[6]=c,h[7]=l,h[8]=d,N.Matrix3.computeEigenDecomposition(h,z)),h=N.Matrix3.clone(s.unitary,t.halfAxes),x=N.Matrix3.getColumn(h,0,E),M=N.Matrix3.getColumn(h,1,S),m=N.Matrix3.getColumn(h,2,U),f=-Number.MAX_VALUE,p=-Number.MAX_VALUE,g=-Number.MAX_VALUE,w=Number.MAX_VALUE,y=Number.MAX_VALUE,b=Number.MAX_VALUE;for(r=0;r<e;r++)i=a[r],f=Math.max(O.Cartesian3.dot(x,i),f),p=Math.max(O.Cartesian3.dot(M,i),p),g=Math.max(O.Cartesian3.dot(m,i),g),w=Math.min(O.Cartesian3.dot(x,i),w),y=Math.min(O.Cartesian3.dot(M,i),y),b=Math.min(O.Cartesian3.dot(m,i),b);x=O.Cartesian3.multiplyByScalar(x,.5*(w+f),x),M=O.Cartesian3.multiplyByScalar(M,.5*(y+p),M),m=O.Cartesian3.multiplyByScalar(m,.5*(b+g),m),s=O.Cartesian3.add(x,M,t.center),O.Cartesian3.add(s,m,s),h=R;return h.x=f-w,h.y=p-y,h.z=g-b,O.Cartesian3.multiplyByScalar(h,.5,h),N.Matrix3.multiplyByScale(t.halfAxes,h,t.halfAxes),t},new O.Cartesian3),d=new O.Cartesian3;function B(a,t,e,n,r,i,s,o,C,c,u){var l=(u=P.defined(u)?u:new T).halfAxes;N.Matrix3.setColumn(l,0,t,l),N.Matrix3.setColumn(l,1,e,l),N.Matrix3.setColumn(l,2,n,l);(t=M).x=(r+i)/2,t.y=(s+o)/2,t.z=(C+c)/2;e=d,e.x=(i-r)/2,e.y=(o-s)/2,e.z=(c-C)/2,n=u.center,t=N.Matrix3.multiplyByVector(l,t,t);return O.Cartesian3.add(a,t,n),N.Matrix3.multiplyByScale(l,e,l),u}var V=new O.Cartographic,_=new O.Cartesian3,v=new O.Cartographic,k=new O.Cartographic,W=new O.Cartographic,X=new O.Cartographic,q=new O.Cartographic,D=new O.Cartesian3,j=new O.Cartesian3,Z=new O.Cartesian3,Y=new O.Cartesian3,G=new O.Cartesian3,F=new O.Cartesian2,H=new O.Cartesian2,J=new O.Cartesian2,K=new O.Cartesian2,Q=new O.Cartesian2,$=new O.Cartesian3,aa=new O.Cartesian3,ta=new O.Cartesian3,ea=new O.Cartesian3,na=new O.Cartesian2,ra=new O.Cartesian3,ia=new O.Cartesian3,sa=new O.Cartesian3,oa=new b.Plane(O.Cartesian3.UNIT_X,0),m=(T.fromRectangle=function(a,t,e,n,r){var i,s,o,C,c;if(t=P.defaultValue(t,0),e=P.defaultValue(e,0),n=P.defaultValue(n,O.Ellipsoid.WGS84),a.width<=y.CesiumMath.PI)return s=O.Rectangle.center(a,V),x=n.cartographicToCartesian(s,_),i=(x=new w.EllipsoidTangentPlane(x,n)).plane,m=s.longitude,s=a.south<0&&0<a.north?0:s.latitude,c=O.Cartographic.fromRadians(m,a.north,e,v),u=O.Cartographic.fromRadians(a.west,a.north,e,k),s=O.Cartographic.fromRadians(a.west,s,e,W),l=O.Cartographic.fromRadians(a.west,a.south,e,X),m=O.Cartographic.fromRadians(m,a.south,e,q),c=n.cartographicToCartesian(c,D),d=n.cartographicToCartesian(u,j),s=n.cartographicToCartesian(s,Z),h=n.cartographicToCartesian(l,Y),m=n.cartographicToCartesian(m,G),c=x.projectPointToNearestOnPlane(c,F),C=x.projectPointToNearestOnPlane(d,H),s=x.projectPointToNearestOnPlane(s,J),M=x.projectPointToNearestOnPlane(h,K),m=x.projectPointToNearestOnPlane(m,Q),o=-(s=Math.min(C.x,s.x,M.x)),C=Math.max(C.y,c.y),c=Math.min(M.y,m.y),u.height=l.height=t,d=n.cartographicToCartesian(u,j),h=n.cartographicToCartesian(l,Y),M=Math.min(b.Plane.getPointDistance(i,d),b.Plane.getPointDistance(i,h)),m=e,B(x.origin,x.xAxis,x.yAxis,x.zAxis,s,o,c,C,M,m,r);var u=0<a.south,l=a.north<0,d=u?a.south:l?a.north:0,h=O.Rectangle.center(a,V).longitude,x=O.Cartesian3.fromRadians(h,d,e,n,$);x.z=0;var M,m,f=Math.abs(x.x)<y.CesiumMath.EPSILON10&&Math.abs(x.y)<y.CesiumMath.EPSILON10?O.Cartesian3.UNIT_X:O.Cartesian3.normalize(x,aa),p=O.Cartesian3.UNIT_Z,g=O.Cartesian3.cross(f,p,ta),h=(i=b.Plane.fromPointNormal(x,f,oa),O.Cartesian3.fromRadians(h+y.CesiumMath.PI_OVER_TWO,d,e,n,ea)),h=(s=-(o=O.Cartesian3.dot(b.Plane.projectPointOntoPlane(i,h,na),g)),C=O.Cartesian3.fromRadians(0,a.north,l?t:e,n,ra).z,c=O.Cartesian3.fromRadians(0,a.south,u?t:e,n,ia).z,O.Cartesian3.fromRadians(a.east,d,e,n,sa));return B(x,g,p,f,s,o,c,C,M=b.Plane.getPointDistance(i,h),m=0,r)},T.clone=function(a,t){if(P.defined(a))return P.defined(t)?(O.Cartesian3.clone(a.center,t.center),N.Matrix3.clone(a.halfAxes,t.halfAxes),t):new T(a.center,a.halfAxes)},T.intersectPlane=function(a,t){var e=a.center,n=t.normal,a=a.halfAxes,r=n.x,i=n.y,s=n.z,r=Math.abs(r*a[N.Matrix3.COLUMN0ROW0]+i*a[N.Matrix3.COLUMN0ROW1]+s*a[N.Matrix3.COLUMN0ROW2])+Math.abs(r*a[N.Matrix3.COLUMN1ROW0]+i*a[N.Matrix3.COLUMN1ROW1]+s*a[N.Matrix3.COLUMN1ROW2])+Math.abs(r*a[N.Matrix3.COLUMN2ROW0]+i*a[N.Matrix3.COLUMN2ROW1]+s*a[N.Matrix3.COLUMN2ROW2]),i=O.Cartesian3.dot(n,e)+t.distance;return i<=-r?N.Intersect.OUTSIDE:r<=i?N.Intersect.INSIDE:N.Intersect.INTERSECTING},new O.Cartesian3),f=new O.Cartesian3,p=new O.Cartesian3,Ca=new O.Cartesian3,g=new O.Cartesian3,ca=new O.Cartesian3,h=(T.distanceSquaredTo=function(a,t){var e,n,r,i,s,t=O.Cartesian3.subtract(t,a.center,M),a=a.halfAxes,o=N.Matrix3.getColumn(a,0,m),C=N.Matrix3.getColumn(a,1,f),a=N.Matrix3.getColumn(a,2,p),c=O.Cartesian3.magnitude(o),u=O.Cartesian3.magnitude(C),l=O.Cartesian3.magnitude(a),d=!0,h=!0,x=!0,d=(0<c?O.Cartesian3.divideByScalar(o,c,o):d=!1,0<u?O.Cartesian3.divideByScalar(C,u,C):h=!1,0<l?O.Cartesian3.divideByScalar(a,l,a):x=!1,!d+!h+!x),h=(1==d?(i=o,n=C,r=a,h?x||(i=a,r=o):(i=C,n=o),e=O.Cartesian3.cross(n,r,g),i===o?o=e:i===C?C=e:i===a&&(a=e)):2==d?(n=o,h?n=C:x&&(n=a),(i=O.Cartesian3.UNIT_Y).equalsEpsilon(n,y.CesiumMath.EPSILON3)&&(i=O.Cartesian3.UNIT_X),r=O.Cartesian3.cross(n,i,Ca),O.Cartesian3.normalize(r,r),e=O.Cartesian3.cross(n,r,g),O.Cartesian3.normalize(e,e),n===o?(C=r,a=e):n===C?(a=r,o=e):n===a&&(o=r,C=e)):3==d&&(o=O.Cartesian3.UNIT_X,C=O.Cartesian3.UNIT_Y,a=O.Cartesian3.UNIT_Z),ca),x=(h.x=O.Cartesian3.dot(t,o),h.y=O.Cartesian3.dot(t,C),h.z=O.Cartesian3.dot(t,a),0);return h.x<-c?x+=(s=h.x+c)*s:h.x>c&&(x+=(s=h.x-c)*s),h.y<-u?x+=(s=h.y+u)*s:h.y>u&&(x+=(s=h.y-u)*s),h.z<-l?x+=(s=h.z+l)*s:h.z>l&&(x+=(s=h.z-l)*s),x},new O.Cartesian3),x=new O.Cartesian3,e=(T.computePlaneDistances=function(a,t,e,n){P.defined(n)||(n=new N.Interval);var r=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,s=a.center,a=a.halfAxes,o=N.Matrix3.getColumn(a,0,m),C=N.Matrix3.getColumn(a,1,f),a=N.Matrix3.getColumn(a,2,p),c=O.Cartesian3.add(o,C,h),u=(O.Cartesian3.add(c,a,c),O.Cartesian3.add(c,s,c),O.Cartesian3.subtract(c,t,x)),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i);return O.Cartesian3.add(s,o,c),O.Cartesian3.add(c,C,c),O.Cartesian3.subtract(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.add(s,o,c),O.Cartesian3.subtract(c,C,c),O.Cartesian3.add(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.add(s,o,c),O.Cartesian3.subtract(c,C,c),O.Cartesian3.subtract(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.subtract(s,o,c),O.Cartesian3.add(c,C,c),O.Cartesian3.add(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.subtract(s,o,c),O.Cartesian3.add(c,C,c),O.Cartesian3.subtract(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.subtract(s,o,c),O.Cartesian3.subtract(c,C,c),O.Cartesian3.add(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),O.Cartesian3.subtract(s,o,c),O.Cartesian3.subtract(c,C,c),O.Cartesian3.subtract(c,a,c),O.Cartesian3.subtract(c,t,u),l=O.Cartesian3.dot(e,u),r=Math.min(l,r),i=Math.max(l,i),n.start=r,n.stop=i,n},new N.BoundingSphere);T.isOccluded=function(a,t){a=N.BoundingSphere.fromOrientedBoundingBox(a,e);return!t.isBoundingSphereVisible(a)},T.prototype.intersectPlane=function(a){return T.intersectPlane(this,a)},T.prototype.distanceSquaredTo=function(a){return T.distanceSquaredTo(this,a)},T.prototype.computePlaneDistances=function(a,t,e){return T.computePlaneDistances(this,a,t,e)},T.prototype.isOccluded=function(a){return T.isOccluded(this,a)},T.equals=function(a,t){return a===t||P.defined(a)&&P.defined(t)&&O.Cartesian3.equals(a.center,t.center)&&N.Matrix3.equals(a.halfAxes,t.halfAxes)},T.prototype.clone=function(a){return T.clone(this,a)},T.prototype.equals=function(a){return T.equals(this,a)},a.OrientedBoundingBox=T});
