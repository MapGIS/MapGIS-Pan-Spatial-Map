define(["exports","./GeometryOffsetAttribute-b02d5bb9","./Transforms-f0fd44c2","./Cartesian2-38b35910","./ComponentDatatype-e44126e4","./when-ae2e0b60","./Check-f996273c","./GeometryAttribute-0e25489a","./GeometryAttributes-5ce4955a","./IndexDatatype-516320ea","./Math-5bbcea10"],function(i,D,I,T,z,L,t,R,N,B,S){"use strict";var f=new T.Cartesian3(1,1,1),U=Math.cos,F=Math.sin;function d(i){i=L.defaultValue(i,L.defaultValue.EMPTY_OBJECT);var t=L.defaultValue(i.radii,f),e=L.defaultValue(i.innerRadii,t),a=L.defaultValue(i.minimumClock,0),n=L.defaultValue(i.maximumClock,S.CesiumMath.TWO_PI),r=L.defaultValue(i.minimumCone,0),o=L.defaultValue(i.maximumCone,S.CesiumMath.PI),s=Math.round(L.defaultValue(i.stackPartitions,10)),m=Math.round(L.defaultValue(i.slicePartitions,8)),u=Math.round(L.defaultValue(i.subdivisions,128));this._radii=T.Cartesian3.clone(t),this._innerRadii=T.Cartesian3.clone(e),this._minimumClock=a,this._maximumClock=n,this._minimumCone=r,this._maximumCone=o,this._stackPartitions=s,this._slicePartitions=m,this._subdivisions=u,this._offsetAttribute=i.offsetAttribute,this._workerName="createEllipsoidOutlineGeometry"}d.packedLength=2*T.Cartesian3.packedLength+8,d.pack=function(i,t,e){return e=L.defaultValue(e,0),T.Cartesian3.pack(i._radii,t,e),e+=T.Cartesian3.packedLength,T.Cartesian3.pack(i._innerRadii,t,e),e+=T.Cartesian3.packedLength,t[e++]=i._minimumClock,t[e++]=i._maximumClock,t[e++]=i._minimumCone,t[e++]=i._maximumCone,t[e++]=i._stackPartitions,t[e++]=i._slicePartitions,t[e++]=i._subdivisions,t[e]=L.defaultValue(i._offsetAttribute,-1),t};var c=new T.Cartesian3,C=new T.Cartesian3,_={radii:c,innerRadii:C,minimumClock:void 0,maximumClock:void 0,minimumCone:void 0,maximumCone:void 0,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0,offsetAttribute:void 0};d.unpack=function(i,t,e){t=L.defaultValue(t,0);var a=T.Cartesian3.unpack(i,t,c),n=(t+=T.Cartesian3.packedLength,T.Cartesian3.unpack(i,t,C)),r=(t+=T.Cartesian3.packedLength,i[t++]),o=i[t++],s=i[t++],m=i[t++],u=i[t++],f=i[t++],l=i[t++],i=i[t];return L.defined(e)?(e._radii=T.Cartesian3.clone(a,e._radii),e._innerRadii=T.Cartesian3.clone(n,e._innerRadii),e._minimumClock=r,e._maximumClock=o,e._minimumCone=s,e._maximumCone=m,e._stackPartitions=u,e._slicePartitions=f,e._subdivisions=l,e._offsetAttribute=-1===i?void 0:i,e):(_.minimumClock=r,_.maximumClock=o,_.minimumCone=s,_.maximumCone=m,_.stackPartitions=u,_.slicePartitions=f,_.subdivisions=l,_.offsetAttribute=-1===i?void 0:i,new d(_))},d.createGeometry=function(i){var t=i._radii;if(!(t.x<=0||t.y<=0||t.z<=0)){var e=i._innerRadii;if(!(e.x<=0||e.y<=0||e.z<=0)){for(var a,n,r=i._minimumClock,o=i._maximumClock,s=i._minimumCone,m=i._maximumCone,u=i._subdivisions,f=T.Ellipsoid.fromCartesian3(t),l=i._slicePartitions+1,d=i._stackPartitions+1,c=((l=Math.round(l*Math.abs(o-r)/S.CesiumMath.TWO_PI))<2&&(l=2),(d=Math.round(d*Math.abs(m-s)/S.CesiumMath.PI))<2&&(d=2),0),C=1,_=e.x!==t.x||e.y!==t.y||e.z!==t.z,h=!1,p=!1,y=(_&&(C=2,0<s&&(h=!0,c+=l),m<Math.PI&&(p=!0,c+=l)),u*C*(d+l)),b=new Float64Array(3*y),k=B.IndexDatatype.createTypedArray(y,2*(y+c-(l+d)*C)),v=0,A=new Array(d),x=new Array(d),P=0;P<d;P++)A[P]=F(n=s+P*(m-s)/(d-1)),x[P]=U(n);var w=new Array(u),M=new Array(u);for(P=0;P<u;P++)w[P]=F(a=r+P*(o-r)/(u-1)),M[P]=U(a);for(P=0;P<d;P++)for(g=0;g<u;g++)b[v++]=t.x*A[P]*M[g],b[v++]=t.y*A[P]*w[g],b[v++]=t.z*x[P];if(_)for(P=0;P<d;P++)for(g=0;g<u;g++)b[v++]=e.x*A[P]*M[g],b[v++]=e.y*A[P]*w[g],b[v++]=e.z*x[P];for(A.length=u,x.length=u,P=0;P<u;P++)A[P]=F(n=s+P*(m-s)/(u-1)),x[P]=U(n);for(w.length=l,M.length=l,P=0;P<l;P++)w[P]=F(a=r+P*(o-r)/(l-1)),M[P]=U(a);for(P=0;P<u;P++)for(g=0;g<l;g++)b[v++]=t.x*A[P]*M[g],b[v++]=t.y*A[P]*w[g],b[v++]=t.z*x[P];if(_)for(P=0;P<u;P++)for(g=0;g<l;g++)b[v++]=e.x*A[P]*M[g],b[v++]=e.y*A[P]*w[g],b[v++]=e.z*x[P];for(P=v=0;P<d*C;P++)for(var V=P*u,g=0;g<u-1;g++)k[v++]=V+g,k[v++]=V+g+1;var G=d*u*C;for(P=0;P<l;P++)for(g=0;g<u-1;g++)k[v++]=G+P+g*l,k[v++]=G+P+(g+1)*l;if(_)for(G=d*u*C+l*u,P=0;P<l;P++)for(g=0;g<u-1;g++)k[v++]=G+P+g*l,k[v++]=G+P+(g+1)*l;if(_){var E=d*u*C,O=E+u*l;if(h)for(P=0;P<l;P++)k[v++]=E+P,k[v++]=O+P;if(p)for(E+=u*l-l,O+=u*l-l,P=0;P<l;P++)k[v++]=E+P,k[v++]=O+P}y=new N.GeometryAttributes({position:new R.GeometryAttribute({componentDatatype:z.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:b})});return L.defined(i._offsetAttribute)&&(c=b.length,_=new Uint8Array(c/3),h=i._offsetAttribute===D.GeometryOffsetAttribute.NONE?0:1,D.arrayFill(_,h),y.applyOffset=new R.GeometryAttribute({componentDatatype:z.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:_})),new R.Geometry({attributes:y,indices:k,primitiveType:R.PrimitiveType.LINES,boundingSphere:I.BoundingSphere.fromEllipsoid(f),offsetAttribute:i._offsetAttribute})}}},i.EllipsoidOutlineGeometry=d});
