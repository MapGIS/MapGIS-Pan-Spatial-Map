define(["exports","./when-ae2e0b60","./RuntimeError-24b14c10","./Matrix2-59fd2efe"],function(e,t,i,r){"use strict";e.GeometryInstance=function(e){e=t.defaultValue(e,t.defaultValue.EMPTY_OBJECT),this.geometry=e.geometry,this.modelMatrix=r.Matrix4.clone(t.defaultValue(e.modelMatrix,r.Matrix4.IDENTITY)),this.id=e.id,this.pickPrimitive=e.pickPrimitive,this.attributes=t.defaultValue(e.attributes,{}),this.westHemisphereGeometry=void 0,this.eastHemisphereGeometry=void 0}});
