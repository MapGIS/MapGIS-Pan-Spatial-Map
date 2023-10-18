define(["exports","./Cartesian2-c1eb9da0","./when-ae2e0b60","./Check-f996273c","./Transforms-b0beda9b","./Math-5bbcea10","./GeometryAttribute-9509a6ac"],function(t,X,d,n,a,Y,l){"use strict";var w=Math.cos,M=Math.sin,m=Math.sqrt,r={computePosition:function(t,n,a,r,e,o,s){var n=n.radiiSquared,i=t.nwCorner,g=t.boundingRectangle,h=i.latitude-t.granYCos*r+e*t.granXSin,u=w(h),c=M(h),C=n.z*c,i=i.longitude+r*t.granYSin+e*t.granXCos,l=u*w(i),u=u*M(i),S=n.x*l,n=n.y*u,l=m(S*l+n*u+C*c);o.x=S/l,o.y=n/l,o.z=C/l,a&&(u=t.stNwCorner,d.defined(u)?(h=u.latitude-t.stGranYCos*r+e*t.stGranXSin,i=u.longitude+r*t.stGranYSin+e*t.stGranXCos,s.x=(i-t.stWest)*t.lonScalar,s.y=(h-t.stSouth)*t.latScalar):(s.x=(i-g.west)*t.lonScalar,s.y=(h-g.south)*t.latScalar))}},S=new l.Matrix2,b=new X.Cartesian3,p=new X.Cartographic,G=new X.Cartesian3,x=new a.GeographicProjection;function R(t,n,a,r,e,o,s){var i=Math.cos(n),g=r*i,i=a*i,h=Math.sin(n),r=r*h,a=a*h,h=(b=x.project(t,b),b=X.Cartesian3.subtract(b,G,b),l.Matrix2.fromRotation(n,S)),n=(b=l.Matrix2.multiplyByVector(h,b,b),b=X.Cartesian3.add(b,G,b),(t=x.unproject(b,t)).latitude),h=n+--o*a,u=n-g*--s,c=n-g*s+o*a,C=Math.max(n,h,u,c),n=Math.min(n,h,u,c),h=t.longitude,u=h+o*i,c=h+s*r,s=h+s*r+o*i;return{north:C,south:n,east:Math.max(h,u,c,s),west:Math.min(h,u,c,s),granYCos:g,granYSin:r,granXCos:i,granXSin:a,nwCorner:t}}r.computeOptions=function(t,n,a,r,e,o,s){var i=t.east,g=t.west,h=t.north,u=t.south,c=!1,C=!1,l=(h===Y.CesiumMath.PI_OVER_TWO&&(c=!0),u===-Y.CesiumMath.PI_OVER_TWO&&(C=!0),h-u),S=i<g?Y.CesiumMath.TWO_PI-g+i:i-g,d=Math.ceil(S/n)+1,n=Math.ceil(l/n)+1,S=S/(d-1),l=l/(n-1),o=X.Rectangle.northwest(t,o),w=X.Rectangle.center(t,p),w=(0===a&&0===r||(w.longitude<o.longitude&&(w.longitude+=Y.CesiumMath.TWO_PI),G=x.project(w,G)),l),M=S,t=X.Rectangle.clone(t,e),e={granYCos:w,granYSin:0,granXCos:M,granXSin:0,nwCorner:o,boundingRectangle:t,width:d,height:n,northCap:c,southCap:C};return 0!==a&&(h=(w=R(o,a,S,l,0,d,n)).north,u=w.south,i=w.east,g=w.west,e.granYCos=w.granYCos,e.granYSin=w.granYSin,e.granXCos=w.granXCos,e.granXSin=w.granXSin,t.north=h,t.south=u,t.east=i,t.west=g),0!==r&&(a-=r,c=R(M=X.Rectangle.northwest(t,s),a,S,l,0,d,n),e.stGranYCos=c.granYCos,e.stGranXCos=c.granXCos,e.stGranYSin=c.granYSin,e.stGranXSin=c.granXSin,e.stNwCorner=M,e.stWest=c.west,e.stSouth=c.south),e},t.RectangleGeometryLibrary=r});
