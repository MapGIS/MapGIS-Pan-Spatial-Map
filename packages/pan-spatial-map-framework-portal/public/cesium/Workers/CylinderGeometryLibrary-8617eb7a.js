define(["exports","./Math-09ca1a10"],function(r,l){"use strict";var t={computePositions:function(r,f,h,t,a){for(var e=.5*r,y=-e,r=t+t,i=new Float64Array(3*(a?2*r:r)),n=0,o=0,s=a?3*r:0,M=a?3*(r+t):3*t,m=0;m<t;m++){var c=m/t*l.CesiumMath.TWO_PI,u=Math.cos(c),c=Math.sin(c),v=u*h,d=c*h,u=u*f,c=c*f;i[o+s]=v,i[o+s+1]=d,i[o+s+2]=y,i[o+M]=u,i[o+M+1]=c,i[o+M+2]=e,o+=3,a&&(i[n++]=v,i[n++]=d,i[n++]=y,i[n++]=u,i[n++]=c,i[n++]=e)}return i}};r.CylinderGeometryLibrary=t});
