define(["exports","./Cartesian2-38b35910","./Check-f996273c","./Transforms-cdfd3fe7","./OrientedBoundingBox-d889307f"],function(n,f,t,g,l){"use strict";var e={},i=new f.Cartesian3,x=new f.Cartesian3,B=new f.Cartesian3,P=new f.Cartesian3,M=new l.OrientedBoundingBox;function o(n,t,e,r,a){n=f.Cartesian3.subtract(n,t,i),t=f.Cartesian3.dot(e,n),e=f.Cartesian3.dot(r,n);return f.Cartesian2.fromElements(t,e,a)}e.validOutline=function(n){var n=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,t=g.Matrix3.getColumn(n,0,x),e=g.Matrix3.getColumn(n,1,B),n=g.Matrix3.getColumn(n,2,P),t=f.Cartesian3.magnitude(t),e=f.Cartesian3.magnitude(e),n=f.Cartesian3.magnitude(n);return!(0===t&&(0===e||0===n)||0===e&&0===n)},e.computeProjectTo2DArguments=function(n,t,e,r){var a,i,n=l.OrientedBoundingBox.fromPoints(n,M),o=n.halfAxes,u=g.Matrix3.getColumn(o,0,x),s=g.Matrix3.getColumn(o,1,B),o=g.Matrix3.getColumn(o,2,P),C=f.Cartesian3.magnitude(u),c=f.Cartesian3.magnitude(s),m=f.Cartesian3.magnitude(o),d=Math.min(C,c,m);return(0!==C||0!==c&&0!==m)&&(0!==c||0!==m)&&(d!==c&&d!==m||(a=u),d===C?a=s:d===m&&(i=s),d!==C&&d!==c||(i=o),f.Cartesian3.normalize(a,e),f.Cartesian3.normalize(i,r),f.Cartesian3.clone(n.center,t),!0)},e.createProjectPointsTo2DFunction=function(r,a,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],r,a,i);return t}},e.createProjectPointTo2DFunction=function(e,r,a){return function(n,t){return o(n,e,r,a,t)}},n.CoplanarPolygonGeometryLibrary=e});