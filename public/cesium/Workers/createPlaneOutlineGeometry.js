define(["./when-ae2e0b60","./Transforms-75c1d9a1","./Cartesian2-c1eb9da0","./Check-f996273c","./ComponentDatatype-e44126e4","./GeometryAttribute-842f7f8f","./GeometryAttributes-5ce4955a","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./WebGLConstants-35626ea2"],function(r,a,i,e,o,c,u,t,n,s,y){"use strict";function m(){this._workerName="createPlaneOutlineGeometry"}m.packedLength=0,m.pack=function(e,t){return t},m.unpack=function(e,t,n){return r.defined(n)?n:new m};var p=new i.Cartesian3(-.5,-.5,0),b=new i.Cartesian3(.5,.5,0);return m.createGeometry=function(){var e=new u.GeometryAttributes,t=new Uint16Array(8),n=new Float64Array(12);return n[0]=p.x,n[1]=p.y,n[2]=p.z,n[3]=b.x,n[4]=p.y,n[5]=p.z,n[6]=b.x,n[7]=b.y,n[8]=p.z,n[9]=p.x,n[10]=b.y,n[11]=p.z,e.position=new c.GeometryAttribute({componentDatatype:o.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:n}),t[0]=0,t[1]=1,t[2]=1,t[3]=2,t[4]=2,t[5]=3,t[6]=3,t[7]=0,new c.Geometry({attributes:e,indices:t,primitiveType:c.PrimitiveType.LINES,boundingSphere:new a.BoundingSphere(i.Cartesian3.ZERO,Math.sqrt(2))})},function(e,t){return r.defined(t)&&(e=m.unpack(e,t)),m.createGeometry(e)}});
