define(["exports","./Matrix2-10a61a55","./RuntimeError-24b14c10","./OrientedBoundingBox-6eb17dbb"],function(n,d,t,l){"use strict";var e={},i=new d.Cartesian3,f=new d.Cartesian3,x=new d.Cartesian3,B=new d.Cartesian3,M=new l.OrientedBoundingBox;function o(n,t,e,r,a){n=d.Cartesian3.subtract(n,t,i),t=d.Cartesian3.dot(e,n),e=d.Cartesian3.dot(r,n);return d.Cartesian2.fromElements(t,e,a)}e.validOutline=function(n){var n=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,t=d.Matrix3.getColumn(n,0,f),e=d.Matrix3.getColumn(n,1,x),n=d.Matrix3.getColumn(n,2,B),t=d.Cartesian3.magnitude(t),e=d.Cartesian3.magnitude(e),n=d.Cartesian3.magnitude(n);return!(0===t&&(0===e||0===n)||0===e&&0===n)},e.computeProjectTo2DArguments=function(n,t,e,r){var a,i,n=l.OrientedBoundingBox.fromPoints(n,M),o=n.halfAxes,u=d.Matrix3.getColumn(o,0,f),s=d.Matrix3.getColumn(o,1,x),o=d.Matrix3.getColumn(o,2,B),C=d.Cartesian3.magnitude(u),m=d.Cartesian3.magnitude(s),c=d.Cartesian3.magnitude(o),g=Math.min(C,m,c);return(0!==C||0!==m&&0!==c)&&(0!==m||0!==c)&&(g!==m&&g!==c||(a=u),g===C?a=s:g===c&&(i=s),g!==C&&g!==m||(i=o),d.Cartesian3.normalize(a,e),d.Cartesian3.normalize(i,r),d.Cartesian3.clone(n.center,t),!0)},e.createProjectPointsTo2DFunction=function(r,a,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],r,a,i);return t}},e.createProjectPointTo2DFunction=function(e,r,a){return function(n,t){return o(n,e,r,a,t)}},n.CoplanarPolygonGeometryLibrary=e});
