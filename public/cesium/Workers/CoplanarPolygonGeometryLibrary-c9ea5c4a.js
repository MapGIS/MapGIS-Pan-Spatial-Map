define(["exports","./Cartesian2-078e6458","./Check-f996273c","./Transforms-984eb057","./OrientedBoundingBox-2f174fe3"],function(n,f,e,d,l){"use strict";var t={},i=new f.Cartesian3,x=new f.Cartesian3,B=new f.Cartesian3,P=new f.Cartesian3,M=new l.OrientedBoundingBox;function o(n,e,t,r,a){n=f.Cartesian3.subtract(n,e,i),e=f.Cartesian3.dot(t,n),t=f.Cartesian3.dot(r,n);return f.Cartesian2.fromElements(e,t,a)}t.validOutline=function(n){var n=l.OrientedBoundingBox.fromPoints(n,M).halfAxes,e=d.Matrix3.getColumn(n,0,x),t=d.Matrix3.getColumn(n,1,B),n=d.Matrix3.getColumn(n,2,P),e=f.Cartesian3.magnitude(e),t=f.Cartesian3.magnitude(t),n=f.Cartesian3.magnitude(n);return!(0===e&&(0===t||0===n)||0===t&&0===n)},t.computeProjectTo2DArguments=function(n,e,t,r){var a,i,n=l.OrientedBoundingBox.fromPoints(n,M),o=n.halfAxes,u=d.Matrix3.getColumn(o,0,x),s=d.Matrix3.getColumn(o,1,B),o=d.Matrix3.getColumn(o,2,P),C=f.Cartesian3.magnitude(u),m=f.Cartesian3.magnitude(s),c=f.Cartesian3.magnitude(o),g=Math.min(C,m,c);return(0!==C||0!==m&&0!==c)&&(0!==m||0!==c)&&(g!==m&&g!==c||(a=u),g===C?a=s:g===c&&(i=s),g!==C&&g!==m||(i=o),f.Cartesian3.normalize(a,t),f.Cartesian3.normalize(i,r),f.Cartesian3.clone(n.center,e),!0)},t.createProjectPointsTo2DFunction=function(r,a,i){return function(n){for(var e=new Array(n.length),t=0;t<n.length;t++)e[t]=o(n[t],r,a,i);return e}},t.createProjectPointTo2DFunction=function(t,r,a){return function(n,e){return o(n,t,r,a,e)}},n.CoplanarPolygonGeometryLibrary=t});