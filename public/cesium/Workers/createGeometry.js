define(["./when-ae2e0b60","./PrimitivePipeline-f17290a9","./createTaskProcessorWorker","./Transforms-cdfd3fe7","./Cartesian2-38b35910","./Check-f996273c","./Math-5bbcea10","./combine-276652d0","./RuntimeError-ac2797b4","./ComponentDatatype-e44126e4","./WebGLConstants-35626ea2","./GeometryAttribute-0e967e1c","./GeometryAttributes-5ce4955a","./GeometryPipeline-6ec6db85","./AttributeCompression-25f42564","./EncodedCartesian3-d40e98d6","./IndexDatatype-516320ea","./IntersectionTests-78298c28","./Plane-457b12fd","./WebMercatorProjection-cf614542"],function(f,u,e,r,t,n,o,i,a,s,c,d,b,m,p,l,y,P,k,C){"use strict";var v={};return e(function(e,r){for(var t=e.subTasks,n=t.length,o=new Array(n),i=0;i<n;i++){var a=t[i],s=a.geometry,c=a.moduleName;f.defined(c)?(c=function(e){var r=v[e];return f.defined(r)||("object"==typeof exports?v[r]=r=require("Workers/"+e):require(["Workers/"+e],function(e){v[r=e]=e})),r}(c),o[i]=c(s,a.offset)):o[i]=s}return f.when.all(o,function(e){return u.PrimitivePipeline.packCreateGeometryResults(e,r)})})});