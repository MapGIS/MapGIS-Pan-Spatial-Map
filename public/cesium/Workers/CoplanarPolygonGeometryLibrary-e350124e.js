define(["exports","./Cartesian2-c1eb9da0","./Check-f996273c","./Transforms-5a0f5c0d","./OrientedBoundingBox-33a0a521"],function(n,g,t,f,l){"use strict";var e={},i=new g.Cartesian3,x=new g.Cartesian3,B=new g.Cartesian3,P=new g.Cartesian3,M=new l.OrientedBoundingBox;function o(n,t,e,a,r){n=g.Cartesian3.subtract(n,t,i),t=g.Cartesian3.dot(e,n),e=g.Cartesian3.dot(a,n);return g.Cartesian2.fromElements(t,e,r)}e.validOutline=function(n){var n=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,t=f.Matrix3.getColumn(n,0,x),e=f.Matrix3.getColumn(n,1,B),n=f.Matrix3.getColumn(n,2,P),t=g.Cartesian3.magnitude(t),e=g.Cartesian3.magnitude(e),n=g.Cartesian3.magnitude(n);return!(0===t&&(0===e||0===n)||0===e&&0===n)},e.computeProjectTo2DArguments=function(n,t,e,a){var r,i,n=l.OrientedBoundingBox.fromPoints(n,M),o=n.halfAxes,u=f.Matrix3.getColumn(o,0,x),s=f.Matrix3.getColumn(o,1,B),o=f.Matrix3.getColumn(o,2,P),C=g.Cartesian3.magnitude(u),c=g.Cartesian3.magnitude(s),m=g.Cartesian3.magnitude(o),d=Math.min(C,c,m);return(0!==C||0!==c&&0!==m)&&(0!==c||0!==m)&&(d!==c&&d!==m||(r=u),d===C?r=s:d===m&&(i=s),d!==C&&d!==c||(i=o),g.Cartesian3.normalize(r,e),g.Cartesian3.normalize(i,a),g.Cartesian3.clone(n.center,t),!0)},e.createProjectPointsTo2DFunction=function(a,r,i){return function(n){for(var t=new Array(n.length),e=0;e<n.length;e++)t[e]=o(n[e],a,r,i);return t}},e.createProjectPointTo2DFunction=function(e,a,r){return function(n,t){return o(n,e,a,r,t)}},n.CoplanarPolygonGeometryLibrary=e});
