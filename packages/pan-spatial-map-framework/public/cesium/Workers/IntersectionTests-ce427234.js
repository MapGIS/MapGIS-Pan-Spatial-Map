define(["exports","./Cartesian2-38b35910","./when-ae2e0b60","./Check-f996273c","./Transforms-ce97037a","./Math-5bbcea10"],function(t,w,d,a,v,R){"use strict";var S={};function i(t,a,e){var r=t+a;return R.CesiumMath.sign(t)!==R.CesiumMath.sign(a)&&Math.abs(r/Math.max(Math.abs(t),Math.abs(a)))<e?0:r}S.computeDiscriminant=function(t,a,e){return a*a-4*t*e},S.computeRealRoots=function(t,a,e){if(0===t)return 0===a?[]:[-e/a];if(0===a){if(0===e)return[0,0];var r=Math.abs(e),n=Math.abs(t);if(r<n&&r/n<R.CesiumMath.EPSILON14)return[0,0];if(n<r&&n/r<R.CesiumMath.EPSILON14)return[];if((n=-e/t)<0)return[];r=Math.sqrt(n);return[-r,r]}if(0===e)return(n=-a/t)<0?[n,0]:[0,n];r=i(a*a,-(4*t*e),R.CesiumMath.EPSILON14);if(r<0)return[];n=-.5*i(a,R.CesiumMath.sign(a)*Math.sqrt(r),R.CesiumMath.EPSILON14);return 0<a?[n/t,e/n]:[e/n,n/t]};var f={};function s(t,a,e,r){var n,i,a=a/3,e=e/3,s=t*e,o=a*r,u=a*a,C=e*e,c=t*e-u,l=t*r-a*e,h=a*r-C,M=4*c*h-l*l;if(M<0)return m=(m=(n=(f=-((i=s*C<=u*o?-2*a*(d=c)+(f=t)*l:-(f=r)*l+2*e*(d=h))<0?-1:1)*Math.abs(f)*Math.sqrt(-M))-i)/2)<0?-Math.pow(-m,1/3):Math.pow(m,1/3),f=n===f?-m:-d/m,i=d<=0?m+f:-i/(m*m+f*f+d),s*C<=u*o?[(i-a)/t]:[-r/(i+e)];var m=c,f=-2*a*c+t*l,d=h,s=-r*l+2*e*h,C=Math.sqrt(M),u=Math.sqrt(3)/2,o=Math.abs(Math.atan2(t*C,-f)/3),c=(i=2*Math.sqrt(-m),Math.cos(o)),l=(n=i*c,i*(-c/2-u*Math.sin(o))),h=2*a<n+l?n-a:l-a,M=t,f=h/M,o=Math.abs(Math.atan2(r*C,-s)/3),m=-r,t=(n=(i=2*Math.sqrt(-d))*(c=Math.cos(o)))+(l=i*(-c/2-u*Math.sin(o)))<2*e?n+e:l+e,C=m/t,s=-h*t-M*m,r=(e*s-a*(h*m))/(-a*s+e*(M*t));return f<=r?f<=C?r<=C?[f,r,C]:[f,C,r]:[C,f,r]:f<=C?[r,f,C]:r<=C?[r,C,f]:[C,r,f]}f.computeDiscriminant=function(t,a,e,r){var n=a*a,i=e*e;return 18*t*a*e*r+n*i-27*(t*t)*(r*r)-4*(t*i*e+n*a*r)},f.computeRealRoots=function(t,a,e,r){var n;if(0===t)return S.computeRealRoots(a,e,r);if(0!==a)return 0===e?0===r?(i=-a/t)<0?[i,0,0]:[0,0,i]:s(t,a,0,r):0===r?0===(n=S.computeRealRoots(t,a,e)).length?[0]:n[1]<=0?[n[0],n[1],0]:0<=n[0]?[0,n[0],n[1]]:[n[0],0,n[1]]:s(t,a,e,r);if(0!==e)return 0===r?0===(n=S.computeRealRoots(t,0,e)).Length?[0]:[n[0],0,n[1]]:s(t,0,e,r);if(0===r)return[0,0,0];var i,a=(i=-r/t)<0?-Math.pow(-i,1/3):Math.pow(i,1/3);return[a,a,a]};var O={};function C(t,a,e,r){var n=t*t,i=a-3*n/8,s=e-a*t/2+n*t/8,r=r-e*t/4+a*n/16-3*n*n/256,e=f.computeRealRoots(1,2*i,i*i-4*r,-s*s);if(0<e.length){a=-t/4,n=e[e.length-1];if(Math.abs(n)<R.CesiumMath.EPSILON14){var t=S.computeRealRoots(1,i,r);if(2===t.length){var o,u,e=t[0],r=t[1];if(0<=e&&0<=r)return t=Math.sqrt(e),[a-(u=Math.sqrt(r)),a-t,a+t,a+u];if(0<=e&&r<0)return[a-(o=Math.sqrt(e)),a+o];if(e<0&&0<=r)return[a-(o=Math.sqrt(r)),a+o]}return[]}if(0<n)return u=(i+n+s/(t=Math.sqrt(n)))/2,e=S.computeRealRoots(1,t,(i+n-s/t)/2),r=S.computeRealRoots(1,-t,u),0!==e.length?(e[0]+=a,e[1]+=a,0!==r.length?(r[0]+=a,r[1]+=a,e[1]<=r[0]?[e[0],e[1],r[0],r[1]]:r[1]<=e[0]?[r[0],r[1],e[0],e[1]]:e[0]>=r[0]&&e[1]<=r[1]?[r[0],e[0],e[1],r[1]]:r[0]>=e[0]&&r[1]<=e[1]?[e[0],r[0],r[1],e[1]]:e[0]>r[0]&&e[0]<r[1]?[r[0],e[0],r[1],e[1]]:[e[0],r[0],e[1],r[1]]):e):0!==r.length?(r[0]+=a,r[1]+=a,r):[]}return[]}function c(t,a,e,r){var n=t*t,i=f.computeRealRoots(1,-2*a,e*t+a*a-4*r,n*r-e*a*t+e*e);if(0<i.length){var s,o,u,C,c,i=i[0],a=a-i,l=a*a,h=t/2,a=a/2,M=l-4*r,l=l+4*Math.abs(r),m=n-4*i,n=n+4*Math.abs(i),n=(m=i<0||M*n<m*l?(s=(n=Math.sqrt(m))/2,0===n?0:(t*a-e)/n):(s=0===(l=Math.sqrt(M))?0:(t*a-e)/l,l/2),0==h&&0===s?u=o=0:R.CesiumMath.sign(h)===R.CesiumMath.sign(s)?u=i/(o=h+s):o=i/(u=h-s),0==a&&0===m?c=C=0:R.CesiumMath.sign(a)===R.CesiumMath.sign(m)?c=r/(C=a+m):C=r/(c=a-m),S.computeRealRoots(1,o,C)),M=S.computeRealRoots(1,u,c);if(0!==n.length)return 0!==M.length?n[1]<=M[0]?[n[0],n[1],M[0],M[1]]:M[1]<=n[0]?[M[0],M[1],n[0],n[1]]:n[0]>=M[0]&&n[1]<=M[1]?[M[0],n[0],n[1],M[1]]:M[0]>=n[0]&&M[1]<=n[1]?[n[0],M[0],M[1],n[1]]:n[0]>M[0]&&n[0]<M[1]?[M[0],n[0],M[1],n[1]]:[n[0],M[0],n[1],M[1]]:n;if(0!==M.length)return M}return[]}function e(t,a){a=w.Cartesian3.clone(d.defaultValue(a,w.Cartesian3.ZERO)),w.Cartesian3.equals(a,w.Cartesian3.ZERO)||w.Cartesian3.normalize(a,a),this.origin=w.Cartesian3.clone(d.defaultValue(t,w.Cartesian3.ZERO)),this.direction=a}O.computeDiscriminant=function(t,a,e,r,n){var i=t*t,s=a*a,o=s*a,u=e*e,C=u*e,c=r*r,l=c*r,h=n*n;return s*u*c-4*o*l-4*t*C*c+18*t*a*e*l-27*i*c*c+256*(i*t)*(h*n)+n*(18*o*e*r-4*s*C+16*t*u*u-80*t*a*u*r-6*t*s*c+144*i*e*c)+h*(144*t*s*e-27*s*s-128*i*u-192*i*a*r)},O.computeRealRoots=function(t,a,e,r,n){if(Math.abs(t)<R.CesiumMath.EPSILON15)return f.computeRealRoots(a,e,r,n);var i=a/t,s=e/t,o=r/t,u=n/t,a=i<0?1:0;switch(a=(a=(a+=s<0?a+1:a)+(o<0?a+1:a))+(u<0?a+1:a)){case 0:return C(i,s,o,u);case 1:case 2:return c(i,s,o,u);case 3:case 4:return C(i,s,o,u);case 5:return c(i,s,o,u);case 6:case 7:return C(i,s,o,u);case 8:return c(i,s,o,u);case 9:case 10:return C(i,s,o,u);case 11:return c(i,s,o,u);case 12:case 13:case 14:case 15:return C(i,s,o,u);default:return}},e.clone=function(t,a){if(d.defined(t))return d.defined(a)?(a.origin=w.Cartesian3.clone(t.origin),a.direction=w.Cartesian3.clone(t.direction),a):new e(t.origin,t.direction)},e.getPoint=function(t,a,e){return d.defined(e)||(e=new w.Cartesian3),e=w.Cartesian3.multiplyByScalar(t.direction,a,e),w.Cartesian3.add(t.origin,e,e)};var l={rayPlane:function(t,a,e){d.defined(e)||(e=new w.Cartesian3);var r=t.origin,t=t.direction,n=a.normal,i=w.Cartesian3.dot(n,t);if(!(Math.abs(i)<R.CesiumMath.EPSILON15)){a=(-a.distance-w.Cartesian3.dot(n,r))/i;if(!(a<0))return e=w.Cartesian3.multiplyByScalar(t,a,e),w.Cartesian3.add(r,e,e)}}},M=new w.Cartesian3,m=new w.Cartesian3,g=new w.Cartesian3,p=new w.Cartesian3,x=new w.Cartesian3,u=(l.rayTriangleParametric=function(t,a,e,r,n){n=d.defaultValue(n,!1);var i,s,o,u=t.origin,t=t.direction,e=w.Cartesian3.subtract(e,a,M),r=w.Cartesian3.subtract(r,a,m),C=w.Cartesian3.cross(t,r,g),c=w.Cartesian3.dot(e,C);if(n){if(c<R.CesiumMath.EPSILON6)return;if(h=w.Cartesian3.subtract(u,a,p),(l=w.Cartesian3.dot(h,C))<0||c<l)return;if(i=w.Cartesian3.cross(h,e,x),(s=w.Cartesian3.dot(t,i))<0||c<l+s)return;o=w.Cartesian3.dot(r,i)/c}else{if(Math.abs(c)<R.CesiumMath.EPSILON6)return;var l,n=1/c,h=w.Cartesian3.subtract(u,a,p);if((l=w.Cartesian3.dot(h,C)*n)<0||1<l)return;if(i=w.Cartesian3.cross(h,e,x),(s=w.Cartesian3.dot(t,i)*n)<0||1<l+s)return;o=w.Cartesian3.dot(r,i)*n}return o},l.rayTriangle=function(t,a,e,r,n,i){a=l.rayTriangleParametric(t,a,e,r,n);if(d.defined(a)&&!(a<0))return d.defined(i)||(i=new w.Cartesian3),w.Cartesian3.multiplyByScalar(t.direction,a,i),w.Cartesian3.add(t.origin,i,i)},new e);l.lineSegmentTriangle=function(t,a,e,r,n,i,s){var o=u,e=(w.Cartesian3.clone(t,o.origin),w.Cartesian3.subtract(a,t,o.direction),w.Cartesian3.normalize(o.direction,o.direction),l.rayTriangleParametric(o,e,r,n,i));if(!(!d.defined(e)||e<0||e>w.Cartesian3.distance(t,a)))return d.defined(s)||(s=new w.Cartesian3),w.Cartesian3.multiplyByScalar(o.direction,e,s),w.Cartesian3.add(o.origin,s,s)};var o={root0:0,root1:0};function h(t,a,e){d.defined(e)||(e=new v.Interval);var r=t.origin,t=t.direction,n=a.center,a=a.radius*a.radius,r=w.Cartesian3.subtract(r,n,g),n=function(t,a,e,r){var n,e=a*a-4*t*e;if(!(e<0)){if(0<e)return i=1/(2*t),(n=(-a+(e=Math.sqrt(e)))*i)<(e=(-a-e)*i)?(r.root0=n,r.root1=e):(r.root0=e,r.root1=n),r;var i=-a/(2*t);return 0!=i?(r.root0=r.root1=i,r):void 0}}(w.Cartesian3.dot(t,t),2*w.Cartesian3.dot(t,r),w.Cartesian3.magnitudeSquared(r)-a,o);if(d.defined(n))return e.start=n.root0,e.stop=n.root1,e}l.raySphere=function(t,a,e){if(e=h(t,a,e),d.defined(e)&&!(e.stop<0))return e.start=Math.max(e.start,0),e};var y=new e,P=(l.lineSegmentSphere=function(t,a,e,r){var n=y,a=(w.Cartesian3.clone(t,n.origin),w.Cartesian3.subtract(a,t,n.direction)),t=w.Cartesian3.magnitude(a);if(w.Cartesian3.normalize(a,a),r=h(n,e,r),!(!d.defined(r)||r.stop<0||r.start>t))return r.start=Math.max(r.start,0),r.stop=Math.min(r.stop,t),r},new w.Cartesian3),b=new w.Cartesian3;function N(t,a,e){var r=t+a;return R.CesiumMath.sign(t)!==R.CesiumMath.sign(a)&&Math.abs(r/Math.max(Math.abs(t),Math.abs(a)))<e?0:r}l.rayEllipsoid=function(t,a){var a=a.oneOverRadii,e=w.Cartesian3.multiplyComponents(a,t.origin,P),a=w.Cartesian3.multiplyComponents(a,t.direction,b),t=w.Cartesian3.magnitudeSquared(e),e=w.Cartesian3.dot(e,a);if(1<t){if(0<=e)return;var r,n,i,s,o=e*e,u=t-1;if(o<(n=(r=w.Cartesian3.magnitudeSquared(a))*u))return;if(n<o)return i=e*e-n,(o=(s=-e+Math.sqrt(i))/r)<(C=u/s)?new v.Interval(o,C):{start:C,stop:o};var C=Math.sqrt(u/r);return new v.Interval(C,C)}return t<1?(u=t-1,i=e*e-(n=(r=w.Cartesian3.magnitudeSquared(a))*u),s=-e+Math.sqrt(i),new v.Interval(0,s/r)):e<0?(r=w.Cartesian3.magnitudeSquared(a),new v.Interval(0,-e/r)):void 0};var q=new w.Cartesian3,L=new w.Cartesian3,I=new w.Cartesian3,E=new w.Cartesian3,z=new w.Cartesian3,T=new v.Matrix3,U=new v.Matrix3,Z=new v.Matrix3,A=new v.Matrix3,D=new v.Matrix3,W=new v.Matrix3,B=new v.Matrix3,V=new w.Cartesian3,k=new w.Cartesian3,F=new w.Cartographic,G=(l.grazingAltitudeLocation=function(t,a){var e=t.origin,r=t.direction;if(!w.Cartesian3.equals(e,w.Cartesian3.ZERO)){var n=a.geodeticSurfaceNormal(e,q);if(0<=w.Cartesian3.dot(r,n))return e}var n=d.defined(this.rayEllipsoid(t,a)),t=a.transformPositionToScaledSpace(r,q),i=w.Cartesian3.normalize(t,t),t=w.Cartesian3.mostOrthogonalAxis(t,E),t=w.Cartesian3.normalize(w.Cartesian3.cross(t,i,L),L),s=w.Cartesian3.normalize(w.Cartesian3.cross(i,t,I),I),o=T,i=(o[0]=i.x,o[1]=i.y,o[2]=i.z,o[3]=t.x,o[4]=t.y,o[5]=t.z,o[6]=s.x,o[7]=s.y,o[8]=s.z,v.Matrix3.transpose(o,U)),u=v.Matrix3.fromScale(a.radii,Z),t=v.Matrix3.fromScale(a.oneOverRadii,A),s=D,i=(s[0]=0,s[1]=-r.z,s[2]=r.y,s[3]=r.z,s[4]=0,s[5]=-r.x,s[6]=-r.y,s[7]=r.x,s[8]=0,v.Matrix3.multiply(v.Matrix3.multiply(i,t,W),s,W)),t=v.Matrix3.multiply(v.Matrix3.multiply(i,u,B),o,B),s=v.Matrix3.multiplyByVector(i,e,z),C=function(t,a,e,r,n){var i=r*r,s=n*n,o=(t[v.Matrix3.COLUMN1ROW1]-t[v.Matrix3.COLUMN2ROW2])*s,u=n*(r*N(t[v.Matrix3.COLUMN1ROW0],t[v.Matrix3.COLUMN0ROW1],R.CesiumMath.EPSILON15)+a.y),C=t[v.Matrix3.COLUMN0ROW0]*i+t[v.Matrix3.COLUMN2ROW2]*s+r*a.x+e,c=s*N(t[v.Matrix3.COLUMN2ROW1],t[v.Matrix3.COLUMN1ROW2],R.CesiumMath.EPSILON15),l=n*(r*N(t[v.Matrix3.COLUMN2ROW0],t[v.Matrix3.COLUMN0ROW2])+a.z),h=[];if(0==l&&0==c){if(0===(M=S.computeRealRoots(o,u,C)).length)return h;i=M[0],e=Math.sqrt(Math.max(1-i*i,0));return h.push(new w.Cartesian3(r,n*i,n*-e)),h.push(new w.Cartesian3(r,n*i,n*e)),2===M.length&&(s=M[1],t=Math.sqrt(Math.max(1-s*s,0)),h.push(new w.Cartesian3(r,n*s,n*-t)),h.push(new w.Cartesian3(r,n*s,n*t))),h}if(s=o*o+(i=c*c),t=2*(u*o+(e=l*c)),i=2*C*o+u*u-i+(a=l*l),e=2*(C*u-e),0==s&&0==t&&0==i&&0==e)return h;var M,m=(M=O.computeRealRoots(s,t,i,e,C*C-a)).length;if(0===m)return h;for(var f=0;f<m;++f){var d=M[f],g=d*d,p=Math.max(1-g,0),p=Math.sqrt(p),g=R.CesiumMath.sign(o)===R.CesiumMath.sign(C)?N(o*g+C,u*d,R.CesiumMath.EPSILON12):R.CesiumMath.sign(C)===R.CesiumMath.sign(u*d)?N(o*g,u*d+C,R.CesiumMath.EPSILON12):N(o*g+u*d,C,R.CesiumMath.EPSILON12),g=g*N(c*d,l,R.CesiumMath.EPSILON15);g<0?h.push(new w.Cartesian3(r,n*d,n*p)):0<g?h.push(new w.Cartesian3(r,n*d,n*-p)):0!==p?(h.push(new w.Cartesian3(r,n*d,n*-p)),h.push(new w.Cartesian3(r,n*d,n*p)),++f):h.push(new w.Cartesian3(r,n*d,n*p))}return h}(t,w.Cartesian3.negate(s,q),0,0,1),c=C.length;if(0<c){for(var l=w.Cartesian3.clone(w.Cartesian3.ZERO,k),h=Number.NEGATIVE_INFINITY,M=0;M<c;++M){var m=v.Matrix3.multiplyByVector(u,v.Matrix3.multiplyByVector(o,C[M],V),V),f=w.Cartesian3.normalize(w.Cartesian3.subtract(m,e,E),E),f=w.Cartesian3.dot(f,r);h<f&&(h=f,l=w.Cartesian3.clone(m,l))}i=a.cartesianToCartographic(l,F),h=R.CesiumMath.clamp(h,0,1),t=w.Cartesian3.magnitude(w.Cartesian3.subtract(l,e,E))*Math.sqrt(1-h*h);return i.height=t=n?-t:t,a.cartographicToCartesian(i,new w.Cartesian3)}},new w.Cartesian3);l.lineSegmentPlane=function(t,a,e,r){d.defined(r)||(r=new w.Cartesian3);var a=w.Cartesian3.subtract(a,t,G),n=e.normal,i=w.Cartesian3.dot(n,a);if(!(Math.abs(i)<R.CesiumMath.EPSILON6)){n=w.Cartesian3.dot(n,t),e=-(e.distance+n)/i;if(!(e<0||1<e))return w.Cartesian3.multiplyByScalar(a,e,r),w.Cartesian3.add(t,r,r),r}},l.trianglePlaneIntersection=function(t,a,e,r){var n,i,s=r.normal,o=r.distance,u=w.Cartesian3.dot(s,t)+o<0,C=w.Cartesian3.dot(s,a)+o<0,s=w.Cartesian3.dot(s,e)+o<0,o=0;if(1!=(o=(o+=u?1:0)+(C?1:0)+(s?1:0))&&2!=o||(n=new w.Cartesian3,i=new w.Cartesian3),1==o){if(u)return l.lineSegmentPlane(t,a,r,n),l.lineSegmentPlane(t,e,r,i),{positions:[t,a,e,n,i],indices:[0,3,4,1,2,4,1,4,3]};if(C)return l.lineSegmentPlane(a,e,r,n),l.lineSegmentPlane(a,t,r,i),{positions:[t,a,e,n,i],indices:[1,3,4,2,0,4,2,4,3]};if(s)return l.lineSegmentPlane(e,t,r,n),l.lineSegmentPlane(e,a,r,i),{positions:[t,a,e,n,i],indices:[2,3,4,0,1,4,0,4,3]}}else if(2==o){if(!u)return l.lineSegmentPlane(a,t,r,n),l.lineSegmentPlane(e,t,r,i),{positions:[t,a,e,n,i],indices:[1,2,4,1,4,3,0,3,4]};if(!C)return l.lineSegmentPlane(e,a,r,n),l.lineSegmentPlane(t,a,r,i),{positions:[t,a,e,n,i],indices:[2,0,4,2,4,3,1,3,4]};if(!s)return l.lineSegmentPlane(t,e,r,n),l.lineSegmentPlane(a,e,r,i),{positions:[t,a,e,n,i],indices:[0,1,4,0,4,3,2,3,4]}}},t.IntersectionTests=l,t.Ray=e});