define(["exports","./arrayRemoveDuplicates-bdf50aa0","./Cartesian2-c1eb9da0","./when-ae2e0b60","./Math-5bbcea10","./PolylinePipeline-36bb5be5"],function(e,f,b,A,C,P){"use strict";var i={};var w=new b.Cartographic,M=new b.Cartographic;function E(e,i,t,a){var r=(i=f.arrayRemoveDuplicates(i,b.Cartesian3.equalsEpsilon)).length;if(!(r<2)){var n=A.defined(a),o=A.defined(t),l=new Array(r),s=new Array(r),h=new Array(r),g=i[0],p=(l[0]=g,e.cartesianToCartographic(g,w));o&&(p.height=t[0]),s[0]=p.height,h[0]=n?a[0]:0;for(var u,c,d=s[0]===h[0],y=1,m=1;m<r;++m){var v=i[m],P=e.cartesianToCartographic(v,M);o&&(P.height=t[m]),d=d&&0===P.height,u=p,c=P,C.CesiumMath.equalsEpsilon(u.latitude,c.latitude,C.CesiumMath.EPSILON10)&&C.CesiumMath.equalsEpsilon(u.longitude,c.longitude,C.CesiumMath.EPSILON10)?p.height<P.height&&(s[y-1]=P.height):(l[y]=v,s[y]=P.height,h[y]=n?a[m]:0,d=d&&s[y]===h[y],b.Cartographic.clone(P,p),++y)}if(!(d||y<2))return l.length=y,s.length=y,h.length=y,{positions:l,topHeights:s,bottomHeights:h}}}var F=new Array(2),H=new Array(2),L={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};i.computePositions=function(e,i,t,a,r,n){var o=E(e,i,t,a);if(A.defined(o)){i=o.positions,t=o.topHeights,a=o.bottomHeights;var l=i.length,o=l-2,s=C.CesiumMath.chordLength(r,e.maximumRadius),h=L;if(h.minDistance=s,h.ellipsoid=e,n){for(var g=0,p=0;p<l-1;p++)g+=P.PolylinePipeline.numberOfPoints(i[p],i[p+1],s)+1;var u=new Float64Array(3*g),c=new Float64Array(3*g),d=F,y=H,m=(h.positions=d,h.height=y,0);for(p=0;p<l-1;p++){d[0]=i[p],d[1]=i[p+1],y[0]=t[p],y[1]=t[p+1];var v=P.PolylinePipeline.generateArc(h);u.set(v,m),y[0]=a[p],y[1]=a[p+1],c.set(P.PolylinePipeline.generateArc(h),m),m+=v.length}}else h.positions=i,h.height=t,u=new Float64Array(P.PolylinePipeline.generateArc(h)),h.height=a,c=new Float64Array(P.PolylinePipeline.generateArc(h));return{bottomPositions:c,topPositions:u,numCorners:o}}},e.WallGeometryLibrary=i});
