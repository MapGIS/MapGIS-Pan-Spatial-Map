define(["exports","./Matrix2-59fd2efe","./RuntimeError-24b14c10","./when-ae2e0b60"],function(e,n,i,h){function r(){this.high=n.Cartesian3.clone(n.Cartesian3.ZERO),this.low=n.Cartesian3.clone(n.Cartesian3.ZERO)}r.encode=function(e,n){var i;return h.defined(n)||(n={high:0,low:0}),0<=e?(i=65536*Math.floor(e/65536),n.high=i,n.low=e-i):(i=65536*Math.floor(-e/65536),n.high=-i,n.low=e+i),n};var t={high:0,low:0},a=(r.fromCartesian=function(e,n){var i=(n=h.defined(n)?n:new r).high,o=n.low;return r.encode(e.x,t),i.x=t.high,o.x=t.low,r.encode(e.y,t),i.y=t.high,o.y=t.low,r.encode(e.z,t),i.z=t.high,o.z=t.low,n},new r);r.writeElements=function(e,n,i){r.fromCartesian(e,a);var e=a.high,o=a.low;n[i]=e.x,n[i+1]=e.y,n[i+2]=e.z,n[i+3]=o.x,n[i+4]=o.y,n[i+5]=o.z},e.EncodedCartesian3=r});
