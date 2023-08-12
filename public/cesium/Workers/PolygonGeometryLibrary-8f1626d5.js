define(["exports","./ArcType-1275a14e","./arrayRemoveDuplicates-bdf50aa0","./Cartesian2-c1eb9da0","./ComponentDatatype-e44126e4","./when-ae2e0b60","./EllipsoidRhumbLine-2fd480f5","./GeometryAttribute-9509a6ac","./GeometryAttributes-5ce4955a","./GeometryPipeline-6f352065","./IndexDatatype-516320ea","./Math-5bbcea10","./Transforms-b0beda9b","./PolygonPipeline-74b9dcb6"],function(e,I,T,x,E,A,f,P,_,p,G,L,d,M){"use strict";function D(){this._array=[],this._offset=0,this._length=0}Object.defineProperties(D.prototype,{length:{get:function(){return this._length}}}),D.prototype.enqueue=function(e){this._array.push(e),this._length++},D.prototype.dequeue=function(){var e,t,i;if(0!==this._length)return i=(e=this._array)[t=this._offset],e[t]=void 0,10<++t&&2*t>e.length&&(this._array=e.slice(t),t=0),this._offset=t,this._length--,i},D.prototype.peek=function(){if(0!==this._length)return this._array[this._offset]},D.prototype.contains=function(e){return-1!==this._array.indexOf(e)},D.prototype.clear=function(){this._array.length=this._offset=this._length=0},D.prototype.sort=function(e){0<this._offset&&(this._array=this._array.slice(this._offset),this._offset=0),this._array.sort(e)};var S={computeHierarchyPackedLength:function(e){for(var t=0,i=[e];0<i.length;){var r=i.pop();if(A.defined(r)){t+=2;var n=r.positions,a=r.holes;if(A.defined(n)&&(t+=n.length*x.Cartesian3.packedLength),A.defined(a))for(var o=a.length,s=0;s<o;++s)i.push(a[s])}}return t},packPolygonHierarchy:function(e,t,i){for(var r=[e];0<r.length;){var n=r.pop();if(A.defined(n)){var a=n.positions,o=n.holes;if(t[i++]=A.defined(a)?a.length:0,t[i++]=A.defined(o)?o.length:0,A.defined(a))for(var s=a.length,u=0;u<s;++u,i+=3)x.Cartesian3.pack(a[u],t,i);if(A.defined(o))for(var l=o.length,h=0;h<l;++h)r.push(o[h])}}return i},unpackPolygonHierarchy:function(e,t){for(var i=e[t++],r=e[t++],n=new Array(i),a=0<r?new Array(r):void 0,o=0;o<i;++o,t+=x.Cartesian3.packedLength)n[o]=x.Cartesian3.unpack(e,t);for(var s=0;s<r;++s)a[s]=S.unpackPolygonHierarchy(e,t),t=a[s].startingIndex,delete a[s].startingIndex;return{positions:n,holes:a,startingIndex:t}}},y=new x.Cartesian3;S.subdivideLineCount=function(e,t,i){e=x.Cartesian3.distance(e,t),t=Math.max(0,Math.ceil(L.CesiumMath.log2(e/i)));return Math.pow(2,t)};var g=new x.Cartographic,m=new x.Cartographic,v=new x.Cartographic,C=new x.Cartesian3,b=(S.subdivideRhumbLineCount=function(e,t,i,r){t=e.cartesianToCartographic(t,g),i=e.cartesianToCartographic(i,m),t=new f.EllipsoidRhumbLine(t,i,e).surfaceDistance/r,i=Math.max(0,Math.ceil(L.CesiumMath.log2(t)));return Math.pow(2,i)},S.subdivideLine=function(e,t,i,r){for(var n,a,o=S.subdivideLineCount(e,t,i),s=x.Cartesian3.distance(e,t),u=s/o,l=r=A.defined(r)?r:[],h=(l.length=3*o,0),c=0;c<o;c++){n=e,f=c*u,a=s,x.Cartesian3.subtract(t,n,y),x.Cartesian3.multiplyByScalar(y,f/a,y),x.Cartesian3.add(n,y,y);var f=[y.x,y.y,y.z];l[h++]=f[0],l[h++]=f[1],l[h++]=f[2]}return l},S.subdivideRhumbLine=function(e,t,i,r,n){for(var t=e.cartesianToCartographic(t,g),i=e.cartesianToCartographic(i,m),a=new f.EllipsoidRhumbLine(t,i,e),t=a.surfaceDistance/r,i=Math.max(0,Math.ceil(L.CesiumMath.log2(t))),o=Math.pow(2,i),s=a.surfaceDistance/o,u=n=A.defined(n)?n:[],l=(u.length=3*o,0),h=0;h<o;h++){var c=a.interpolateUsingSurfaceDistance(h*s,v),c=e.cartographicToCartesian(c,C);u[l++]=c.x,u[l++]=c.y,u[l++]=c.z}return u},new x.Cartesian3),w=new x.Cartesian3,R=new x.Cartesian3,N=new x.Cartesian3,O=(S.scaleToGeodeticHeightExtruded=function(e,t,i,r,n){r=A.defaultValue(r,x.Ellipsoid.WGS84);var a=b,o=w,s=R,u=N;if(A.defined(e)&&A.defined(e.attributes)&&A.defined(e.attributes.position))for(var l=e.attributes.position.values,h=l.length/2,c=0;c<h;c+=3)x.Cartesian3.fromArray(l,c,s),r.geodeticSurfaceNormal(s,a),u=r.scaleToGeodeticSurface(s,u),o=x.Cartesian3.multiplyByScalar(a,i,o),o=x.Cartesian3.add(u,o,o),l[c+h]=o.x,l[c+1+h]=o.y,l[c+2+h]=o.z,n&&(u=x.Cartesian3.clone(s,u)),o=x.Cartesian3.multiplyByScalar(a,t,o),o=x.Cartesian3.add(u,o,o),l[c]=o.x,l[c+1]=o.y,l[c+2]=o.z;return e},S.polygonOutlinesFromHierarchy=function(e,t,i){var r,n,a=[],o=new D;for(o.enqueue(e);0!==o.length;){var s=o.dequeue(),u=s.positions;if(t)for(n=u.length,h=0;h<n;h++)i.scaleToGeodeticSurface(u[h],u[h]);if(!((u=T.arrayRemoveDuplicates(u,x.Cartesian3.equalsEpsilon,!0)).length<3)){for(var l=s.holes?s.holes.length:0,h=0;h<l;h++){var c=s.holes[h],f=c.positions;if(t)for(n=f.length,r=0;r<n;++r)i.scaleToGeodeticSurface(f[r],f[r]);if(!((f=T.arrayRemoveDuplicates(f,x.Cartesian3.equalsEpsilon,!0)).length<3)){a.push(f);var p=0;for(A.defined(c.holes)&&(p=c.holes.length),r=0;r<p;r++)o.enqueue(c.holes[r])}}a.push(u)}}return a},S.polygonsFromHierarchy=function(e,t,i,r){var n=[],a=[],o=new D;for(o.enqueue(e);0!==o.length;){var s,u=o.dequeue(),l=u.positions,h=u.holes;if(i)for(s=l.length,m=0;m<s;m++)r.scaleToGeodeticSurface(l[m],l[m]);if(!((l=T.arrayRemoveDuplicates(l,x.Cartesian3.equalsEpsilon,!0)).length<3)){var c=t(l);if(A.defined(c)){for(var f,p=[],d=(M.PolygonPipeline.computeWindingOrder2D(c)===M.WindingOrder.CLOCKWISE&&(c.reverse(),l=l.slice().reverse()),l.slice()),y=A.defined(h)?h.length:0,g=[],m=0;m<y;m++){var v=h[m],C=v.positions;if(i)for(s=C.length,f=0;f<s;++f)r.scaleToGeodeticSurface(C[f],C[f]);if(!((C=T.arrayRemoveDuplicates(C,x.Cartesian3.equalsEpsilon,!0)).length<3)){var b=t(C);if(A.defined(b)){M.PolygonPipeline.computeWindingOrder2D(b)===M.WindingOrder.CLOCKWISE&&(b.reverse(),C=C.slice().reverse()),g.push(C),p.push(d.length);var d=d.concat(C),c=c.concat(b),w=0;for(A.defined(v.holes)&&(w=v.holes.length),f=0;f<w;f++)o.enqueue(v.holes[f])}}}n.push({outerRing:l,holes:g}),a.push({positions:d,positions2D:c,holes:p})}}}return{hierarchy:n,polygons:a}},new x.Cartesian2),q=new x.Cartesian3,B=new d.Quaternion,H=new d.Matrix3,k=(S.computeBoundingRectangle=function(e,t,i,r,n){for(var e=d.Quaternion.fromAxisAngle(e,r,B),a=d.Matrix3.fromQuaternion(e,H),o=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY,u=Number.POSITIVE_INFINITY,l=Number.NEGATIVE_INFINITY,h=i.length,c=0;c<h;++c){var f=x.Cartesian3.clone(i[c],q),f=(d.Matrix3.multiplyByVector(a,f,f),t(f,O));A.defined(f)&&(o=Math.min(o,f.x),s=Math.max(s,f.x),u=Math.min(u,f.y),l=Math.max(l,f.y))}return n.x=o,n.y=u,n.width=s-o,n.height=l-u,n},S.createGeometryFromPositions=function(e,t,i,r,n,a){var o=M.PolygonPipeline.triangulate(t.positions2D,t.holes),s=(o.length<3&&(o=[0,1,2]),t.positions);if(r){for(var u=s.length,l=new Array(3*u),h=0,c=0;c<u;c++){var f=s[c];l[h++]=f.x,l[h++]=f.y,l[h++]=f.z}t=new P.Geometry({attributes:{position:new P.GeometryAttribute({componentDatatype:E.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:l})},indices:o,primitiveType:P.PrimitiveType.TRIANGLES});return n.normal?p.GeometryPipeline.computeNormal(t):t}return a===I.ArcType.GEODESIC?M.PolygonPipeline.computeSubdivision(e,s,o,i):a===I.ArcType.RHUMB?M.PolygonPipeline.computeRhumbLineSubdivision(e,s,o,i):void 0},[]),z=new x.Cartesian3,W=new x.Cartesian3;S.computeWallGeometry=function(e,t,i,r,n){var a,o,s,u=e.length,l=0;if(r)for(o=3*u*2,a=new Array(2*o),s=0;s<u;s++)p=e[s],d=e[(s+1)%u],a[l]=a[l+o]=p.x,a[++l]=a[l+o]=p.y,a[++l]=a[l+o]=p.z,a[++l]=a[l+o]=d.x,a[++l]=a[l+o]=d.y,a[++l]=a[l+o]=d.z,++l;else{var h=L.CesiumMath.chordLength(i,t.maximumRadius),c=0;if(n===I.ArcType.GEODESIC)for(s=0;s<u;s++)c+=S.subdivideLineCount(e[s],e[(s+1)%u],h);else if(n===I.ArcType.RHUMB)for(s=0;s<u;s++)c+=S.subdivideRhumbLineCount(t,e[s],e[(s+1)%u],h);for(o=3*(c+u),a=new Array(2*o),s=0;s<u;s++){var f,p=e[s],d=e[(s+1)%u];n===I.ArcType.GEODESIC?f=S.subdivideLine(p,d,h,k):n===I.ArcType.RHUMB&&(f=S.subdivideRhumbLine(t,p,d,h,k));for(var y=f.length,g=0;g<y;++g,++l)a[l]=f[g],a[l+o]=f[g];a[l]=d.x,a[l+o]=d.x,a[++l]=d.y,a[l+o]=d.y,a[++l]=d.z,a[l+o]=d.z,++l}}var u=a.length,m=G.IndexDatatype.createTypedArray(u/3,u-6*e.length),v=0;for(u/=6,s=0;s<u;s++){var C=s,b=C+1,w=C+u,T=w+1;p=x.Cartesian3.fromArray(a,3*C,z),d=x.Cartesian3.fromArray(a,3*b,W),x.Cartesian3.equalsEpsilon(p,d,L.CesiumMath.EPSILON10,L.CesiumMath.EPSILON10)||(m[v++]=C,m[v++]=w,m[v++]=b,m[v++]=b,m[v++]=w,m[v++]=T)}return new P.Geometry({attributes:new _.GeometryAttributes({position:new P.GeometryAttribute({componentDatatype:E.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:a})}),indices:m,primitiveType:P.PrimitiveType.TRIANGLES})},e.PolygonGeometryLibrary=S});
