define(["exports","./arrayRemoveDuplicates-bce1b0dc","./Matrix2-59fd2efe","./when-ae2e0b60","./ComponentDatatype-b7b5db18","./PolylinePipeline-5ce4be00"],function(e,f,A,C,b,P){var i={};var w=new A.Cartographic,M=new A.Cartographic;function E(e,i,t,n){var r=(i=f.arrayRemoveDuplicates(i,A.Cartesian3.equalsEpsilon)).length;if(!(r<2)){var a=C.defined(n),o=C.defined(t),l=new Array(r),h=new Array(r),s=new Array(r),g=i[0],p=(l[0]=g,e.cartesianToCartographic(g,w));o&&(p.height=t[0]),h[0]=p.height,s[0]=a?n[0]:0;for(var u,c,d=h[0]===s[0],y=1,m=1;m<r;++m){var v=i[m],P=e.cartesianToCartographic(v,M);o&&(P.height=t[m]),d=d&&0===P.height,u=p,c=P,b.CesiumMath.equalsEpsilon(u.latitude,c.latitude,b.CesiumMath.EPSILON10)&&b.CesiumMath.equalsEpsilon(u.longitude,c.longitude,b.CesiumMath.EPSILON10)?p.height<P.height&&(h[y-1]=P.height):(l[y]=v,h[y]=P.height,s[y]=a?n[m]:0,d=d&&h[y]===s[y],A.Cartographic.clone(P,p),++y)}if(!(d||y<2))return l.length=y,h.length=y,s.length=y,{positions:l,topHeights:h,bottomHeights:s}}}var D=new Array(2),F=new Array(2),H={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};i.computePositions=function(e,i,t,n,r,a){var o=E(e,i,t,n);if(C.defined(o)){i=o.positions,t=o.topHeights,n=o.bottomHeights;var l=i.length,o=l-2,h=b.CesiumMath.chordLength(r,e.maximumRadius),s=H;if(s.minDistance=h,s.ellipsoid=e,a){for(var g=0,p=0;p<l-1;p++)g+=P.PolylinePipeline.numberOfPoints(i[p],i[p+1],h)+1;var u=new Float64Array(3*g),c=new Float64Array(3*g),d=D,y=F,m=(s.positions=d,s.height=y,0);for(p=0;p<l-1;p++){d[0]=i[p],d[1]=i[p+1],y[0]=t[p],y[1]=t[p+1];var v=P.PolylinePipeline.generateArc(s);u.set(v,m),y[0]=n[p],y[1]=n[p+1],c.set(P.PolylinePipeline.generateArc(s),m),m+=v.length}}else s.positions=i,s.height=t,u=new Float64Array(P.PolylinePipeline.generateArc(s)),s.height=n,c=new Float64Array(P.PolylinePipeline.generateArc(s));return{bottomPositions:c,topPositions:u,numCorners:o}}},e.WallGeometryLibrary=i});