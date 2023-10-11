define(["exports","./Check-f996273c","./when-ae2e0b60","./Transforms-badb9ae9","./Math-5bbcea10"],function(e,r,g,t,l){"use strict";function f(e,r,t){return t<e?t=e:r<t&&(t=r),t}function o(e,r,t){var o,s;return"number"==typeof t?f(e,r,t):"string"==typeof t&&(o=new RegExp("^[0-9]+$"),s=new RegExp("^[0-9]+\\.?[0-9]+?$"),o.test(t)||s.test(t))?f(e,r,Number(t)):r}function C(e){return o(0,1,e)}function n(e){return o(0,255,e)}function a(e,r,t){return t<0&&(t+=1),1<t&&--t,6*t<1?e+6*(r-e)*t:2*t<1?r:3*t<2?e+(r-e)*(2/3-t)*6:e}function b(e,r,t,o){this.red=C(g.defaultValue(e,1)),this.green=C(g.defaultValue(r,1)),this.blue=C(g.defaultValue(t,1)),this.alpha=C(g.defaultValue(o,1))}b.fromCartesian4=function(e,r){return g.defined(r)?(r.red=C(e.x),r.green=C(e.y),r.blue=C(e.z),r.alpha=C(e.w),r):new b(e.x,e.y,e.z,e.w)},b.fromBytes=function(e,r,t,o,s){return e=b.byteToFloat(n(g.defaultValue(e,255))),r=b.byteToFloat(n(g.defaultValue(r,255))),t=b.byteToFloat(n(g.defaultValue(t,255))),o=b.byteToFloat(n(g.defaultValue(o,255))),g.defined(s)?(s.red=e,s.green=r,s.blue=t,s.alpha=o,s):new b(e,r,t,o)},b.fromAlpha=function(e,r,t){return g.defined(t)?(t.red=C(e.red),t.green=C(e.green),t.blue=C(e.blue),t.alpha=C(r),t):new b(e.red,e.green,e.blue,r)},t.FeatureDetection.supportsTypedArrays()&&(t=new ArrayBuffer(4),s=new Uint32Array(t),i=new Uint8Array(t)),b.fromRgba=function(e,r){return s[0]=e,b.fromBytes(i[0],i[1],i[2],i[3],r)},b.fromHsl=function(e,r,t,o,s){e=C(g.defaultValue(e,0)%1),r=C(g.defaultValue(r,0)),t=C(g.defaultValue(t,0)),o=C(g.defaultValue(o,1));var f=t,n=t,l=t;return 0!==r&&(f=a(r=2*t-(t=t<.5?t*(1+r):t+r-t*r),t,e+1/3),n=a(r,t,e),l=a(r,t,e-1/3)),g.defined(s)?(s.red=f,s.green=n,s.blue=l,s.alpha=o,s):new b(f,n,l,o)},b.fromRandom=function(e,r){var t,o=(e=g.defaultValue(e,g.defaultValue.EMPTY_OBJECT)).red,s=(g.defined(o)||(t=g.defaultValue(e.minimumRed,0),s=g.defaultValue(e.maximumRed,1),o=t+l.CesiumMath.nextRandomNumber()*(s-t)),e.green),f=(g.defined(s)||(t=g.defaultValue(e.minimumGreen,0),f=g.defaultValue(e.maximumGreen,1),s=t+l.CesiumMath.nextRandomNumber()*(f-t)),e.blue),n=(g.defined(f)||(t=g.defaultValue(e.minimumBlue,0),n=g.defaultValue(e.maximumBlue,1),f=t+l.CesiumMath.nextRandomNumber()*(n-t)),e.alpha);return g.defined(n)||(t=g.defaultValue(e.minimumAlpha,0),e=g.defaultValue(e.maximumAlpha,1),n=t+l.CesiumMath.nextRandomNumber()*(e-t)),g.defined(r)?(r.red=o,r.green=s,r.blue=f,r.alpha=n,r):new b(o,s,f,n)};var s,i,O=/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i,S=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i,c=/^rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)(?:\s*,\s*([0-9.]+))?\s*\)$/i,F=/^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+%)\s*,\s*([0-9.]+%)(?:\s*,\s*([0-9.]+))?\s*\)$/i;b.fromCssColorString=function(e,r){if(a=!1,"string"==typeof(i=(t=e).replace(/\s/g,""))?(C=new RegExp("^#[0-9A-Fa-f]{3}$"),E=new RegExp("^#[0-9A-Fa-f]{4}$"),u=new RegExp("^#[0-9A-Fa-f]{6}$"),o=new RegExp("^#[0-9A-Fa-f]{8}$"),s=new RegExp("^[rR][gG][Bb][(]([]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){2}[\\s]*(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)[\\s]*[)]{1}$"),f=new RegExp("^[rR][gG][Bb][Aa][(]([\\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\\s]*,){3}[\\s]*(1|1.0|0|0.[0-9]*)[\\s]*[)]{1}$"),n=new RegExp("^[hH][Ss][Ll][(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*)[)]$"),l=new RegExp("^[hH][Ss][Ll][Aa][(]([\\s]*(2[0-9][0-9]|360｜3[0-5][0-9]|[01]?[0-9][0-9]?)[\\s]*,)([\\s]*((100|[0-9][0-9]?)%|0)[\\s]*,){2}([\\s]*(1|1.0|0|0.[0-9]*)[\\s]*)[)]$"),(a=C.test(i)||E.test(i)||u.test(i)||o.test(i)||s.test(i)||f.test(i)||n.test(i)||l.test(i))||(C=b[t.toUpperCase()],g.defined(C)&&(a=!0))):a=!1,!a)return r=new b(1,1,1);g.defined(r)||(r=new b);var t,o,s,f,n,l,C,a,i,E=b[(e=e.replace(/\s/g,"")).toUpperCase()];if(g.defined(E))b.clone(E,r);else{var u=O.exec(e);if(null!==u)r.red=parseInt(u[1],16)/15,r.green=parseInt(u[2],16)/15,r.blue=parseInt(u[3],16)/15,r.alpha=parseInt(g.defaultValue(u[4],"f"),16)/15;else if(null!==(u=S.exec(e)))r.red=parseInt(u[1],16)/255,r.green=parseInt(u[2],16)/255,r.blue=parseInt(u[3],16)/255,r.alpha=parseInt(g.defaultValue(u[4],"ff"),16)/255;else if(null!==(u=c.exec(e)))r.red=parseFloat(u[1])/("%"===u[1].substr(-1)?100:255),r.green=parseFloat(u[2])/("%"===u[2].substr(-1)?100:255),r.blue=parseFloat(u[3])/("%"===u[3].substr(-1)?100:255),r.alpha=parseFloat(g.defaultValue(u[4],"1.0"));else{if(null!==(u=F.exec(e)))return b.fromHsl(parseFloat(u[1])/360,parseFloat(u[2])/100,parseFloat(u[3])/100,parseFloat(g.defaultValue(u[4],"1.0")),r);r=void 0}}return r},b.packedLength=4,b.pack=function(e,r,t){return t=g.defaultValue(t,0),r[t++]=e.red,r[t++]=e.green,r[t++]=e.blue,r[t]=e.alpha,r},b.unpack=function(e,r,t){return r=g.defaultValue(r,0),(t=g.defined(t)?t:new b).red=e[r++],t.green=e[r++],t.blue=e[r++],t.alpha=e[r],t},b.byteToFloat=function(e){return e/255},b.floatToByte=function(e){return 1===e?255:256*e|0},b.clone=function(e,r){if(g.defined(e))return g.defined(r)?(r.red=e.red,r.green=e.green,r.blue=e.blue,r.alpha=e.alpha,r):new b(e.red,e.green,e.blue,e.alpha)},b.equals=function(e,r){return e===r||g.defined(e)&&g.defined(r)&&e.red===r.red&&e.green===r.green&&e.blue===r.blue&&e.alpha===r.alpha},b.equalsArray=function(e,r,t){return e.red===r[t]&&e.green===r[t+1]&&e.blue===r[t+2]&&e.alpha===r[t+3]},b.prototype.clone=function(e){return b.clone(this,e)},b.prototype.equals=function(e){return b.equals(this,e)},b.prototype.equalsEpsilon=function(e,r){return this===e||g.defined(e)&&Math.abs(this.red-e.red)<=r&&Math.abs(this.green-e.green)<=r&&Math.abs(this.blue-e.blue)<=r&&Math.abs(this.alpha-e.alpha)<=r},b.prototype.toString=function(){return"("+this.red+", "+this.green+", "+this.blue+", "+this.alpha+")"},b.prototype.toCssColorString=function(){var e=b.floatToByte(this.red),r=b.floatToByte(this.green),t=b.floatToByte(this.blue);return 1===this.alpha?"rgb("+e+","+r+","+t+")":"rgba("+e+","+r+","+t+","+this.alpha+")"},b.prototype.toCssColor=function(){return{red:b.floatToByte(this.red),green:b.floatToByte(this.green),blue:b.floatToByte(this.blue),alpha:this.alpha}},b.prototype.toCssHexString=function(){var e,r=b.floatToByte(this.red).toString(16),t=(r.length<2&&(r="0"+r),b.floatToByte(this.green).toString(16)),o=(t.length<2&&(t="0"+t),b.floatToByte(this.blue).toString(16));return o.length<2&&(o="0"+o),this.alpha<1?"#"+r+t+o+(e=(e=b.floatToByte(this.alpha).toString(16)).length<2?"0"+e:e):"#"+r+t+o},b.prototype.toBytes=function(e){var r=b.floatToByte(this.red),t=b.floatToByte(this.green),o=b.floatToByte(this.blue),s=b.floatToByte(this.alpha);return g.defined(e)?(e[0]=r,e[1]=t,e[2]=o,e[3]=s,e):[r,t,o,s]},b.prototype.toRgba=function(){return i[0]=b.floatToByte(this.red),i[1]=b.floatToByte(this.green),i[2]=b.floatToByte(this.blue),i[3]=b.floatToByte(this.alpha),s[0]},b.prototype.brighten=function(e,r){return r.red=1-(1-this.red)*(e=1-e),r.green=1-(1-this.green)*e,r.blue=1-(1-this.blue)*e,r.alpha=this.alpha,r},b.prototype.darken=function(e,r){return r.red=this.red*(e=1-e),r.green=this.green*e,r.blue=this.blue*e,r.alpha=this.alpha,r},b.prototype.withAlpha=function(e,r){return b.fromAlpha(this,e,r)},b.add=function(e,r,t){return t.red=e.red+r.red,t.green=e.green+r.green,t.blue=e.blue+r.blue,t.alpha=e.alpha+r.alpha,t},b.subtract=function(e,r,t){return t.red=e.red-r.red,t.green=e.green-r.green,t.blue=e.blue-r.blue,t.alpha=e.alpha-r.alpha,t},b.multiply=function(e,r,t){return t.red=e.red*r.red,t.green=e.green*r.green,t.blue=e.blue*r.blue,t.alpha=e.alpha*r.alpha,t},b.divide=function(e,r,t){return t.red=e.red/r.red,t.green=e.green/r.green,t.blue=e.blue/r.blue,t.alpha=e.alpha/r.alpha,t},b.mod=function(e,r,t){return t.red=e.red%r.red,t.green=e.green%r.green,t.blue=e.blue%r.blue,t.alpha=e.alpha%r.alpha,t},b.lerp=function(e,r,t,o){return o.red=l.CesiumMath.lerp(e.red,r.red,t),o.green=l.CesiumMath.lerp(e.green,r.green,t),o.blue=l.CesiumMath.lerp(e.blue,r.blue,t),o.alpha=l.CesiumMath.lerp(e.alpha,r.alpha,t),o},b.multiplyByScalar=function(e,r,t){return t.red=e.red*r,t.green=e.green*r,t.blue=e.blue*r,t.alpha=e.alpha*r,t},b.divideByScalar=function(e,r,t){return t.red=e.red/r,t.green=e.green/r,t.blue=e.blue/r,t.alpha=e.alpha/r,t},b.ALICEBLUE=Object.freeze(b.fromCssColorString("#F0F8FF")),b.ANTIQUEWHITE=Object.freeze(b.fromCssColorString("#FAEBD7")),b.AQUA=Object.freeze(b.fromCssColorString("#00FFFF")),b.AQUAMARINE=Object.freeze(b.fromCssColorString("#7FFFD4")),b.AZURE=Object.freeze(b.fromCssColorString("#F0FFFF")),b.BEIGE=Object.freeze(b.fromCssColorString("#F5F5DC")),b.BISQUE=Object.freeze(b.fromCssColorString("#FFE4C4")),b.BLACK=Object.freeze(b.fromCssColorString("#000000")),b.BLANCHEDALMOND=Object.freeze(b.fromCssColorString("#FFEBCD")),b.BLUE=Object.freeze(b.fromCssColorString("#0000FF")),b.BLUEVIOLET=Object.freeze(b.fromCssColorString("#8A2BE2")),b.BROWN=Object.freeze(b.fromCssColorString("#A52A2A")),b.BURLYWOOD=Object.freeze(b.fromCssColorString("#DEB887")),b.CADETBLUE=Object.freeze(b.fromCssColorString("#5F9EA0")),b.CHARTREUSE=Object.freeze(b.fromCssColorString("#7FFF00")),b.CHOCOLATE=Object.freeze(b.fromCssColorString("#D2691E")),b.CORAL=Object.freeze(b.fromCssColorString("#FF7F50")),b.CORNFLOWERBLUE=Object.freeze(b.fromCssColorString("#6495ED")),b.CORNSILK=Object.freeze(b.fromCssColorString("#FFF8DC")),b.CRIMSON=Object.freeze(b.fromCssColorString("#DC143C")),b.CYAN=Object.freeze(b.fromCssColorString("#00FFFF")),b.DARKBLUE=Object.freeze(b.fromCssColorString("#00008B")),b.DARKCYAN=Object.freeze(b.fromCssColorString("#008B8B")),b.DARKGOLDENROD=Object.freeze(b.fromCssColorString("#B8860B")),b.DARKGRAY=Object.freeze(b.fromCssColorString("#A9A9A9")),b.DARKGREEN=Object.freeze(b.fromCssColorString("#006400")),b.DARKGREY=b.DARKGRAY,b.DARKKHAKI=Object.freeze(b.fromCssColorString("#BDB76B")),b.DARKMAGENTA=Object.freeze(b.fromCssColorString("#8B008B")),b.DARKOLIVEGREEN=Object.freeze(b.fromCssColorString("#556B2F")),b.DARKORANGE=Object.freeze(b.fromCssColorString("#FF8C00")),b.DARKORCHID=Object.freeze(b.fromCssColorString("#9932CC")),b.DARKRED=Object.freeze(b.fromCssColorString("#8B0000")),b.DARKSALMON=Object.freeze(b.fromCssColorString("#E9967A")),b.DARKSEAGREEN=Object.freeze(b.fromCssColorString("#8FBC8F")),b.DARKSLATEBLUE=Object.freeze(b.fromCssColorString("#483D8B")),b.DARKSLATEGRAY=Object.freeze(b.fromCssColorString("#2F4F4F")),b.DARKSLATEGREY=b.DARKSLATEGRAY,b.DARKTURQUOISE=Object.freeze(b.fromCssColorString("#00CED1")),b.DARKVIOLET=Object.freeze(b.fromCssColorString("#9400D3")),b.DEEPPINK=Object.freeze(b.fromCssColorString("#FF1493")),b.DEEPSKYBLUE=Object.freeze(b.fromCssColorString("#00BFFF")),b.DIMGRAY=Object.freeze(b.fromCssColorString("#696969")),b.DIMGREY=b.DIMGRAY,b.DODGERBLUE=Object.freeze(b.fromCssColorString("#1E90FF")),b.FIREBRICK=Object.freeze(b.fromCssColorString("#B22222")),b.FLORALWHITE=Object.freeze(b.fromCssColorString("#FFFAF0")),b.FORESTGREEN=Object.freeze(b.fromCssColorString("#228B22")),b.FUCHSIA=Object.freeze(b.fromCssColorString("#FF00FF")),b.GAINSBORO=Object.freeze(b.fromCssColorString("#DCDCDC")),b.GHOSTWHITE=Object.freeze(b.fromCssColorString("#F8F8FF")),b.GOLD=Object.freeze(b.fromCssColorString("#FFD700")),b.GOLDENROD=Object.freeze(b.fromCssColorString("#DAA520")),b.GRAY=Object.freeze(b.fromCssColorString("#808080")),b.GREEN=Object.freeze(b.fromCssColorString("#008000")),b.GREENYELLOW=Object.freeze(b.fromCssColorString("#ADFF2F")),b.GREY=b.GRAY,b.HONEYDEW=Object.freeze(b.fromCssColorString("#F0FFF0")),b.HOTPINK=Object.freeze(b.fromCssColorString("#FF69B4")),b.INDIANRED=Object.freeze(b.fromCssColorString("#CD5C5C")),b.INDIGO=Object.freeze(b.fromCssColorString("#4B0082")),b.IVORY=Object.freeze(b.fromCssColorString("#FFFFF0")),b.KHAKI=Object.freeze(b.fromCssColorString("#F0E68C")),b.LAVENDER=Object.freeze(b.fromCssColorString("#E6E6FA")),b.LAVENDAR_BLUSH=Object.freeze(b.fromCssColorString("#FFF0F5")),b.LAWNGREEN=Object.freeze(b.fromCssColorString("#7CFC00")),b.LEMONCHIFFON=Object.freeze(b.fromCssColorString("#FFFACD")),b.LIGHTBLUE=Object.freeze(b.fromCssColorString("#ADD8E6")),b.LIGHTCORAL=Object.freeze(b.fromCssColorString("#F08080")),b.LIGHTCYAN=Object.freeze(b.fromCssColorString("#E0FFFF")),b.LIGHTGOLDENRODYELLOW=Object.freeze(b.fromCssColorString("#FAFAD2")),b.LIGHTGRAY=Object.freeze(b.fromCssColorString("#D3D3D3")),b.LIGHTGREEN=Object.freeze(b.fromCssColorString("#90EE90")),b.LIGHTGREY=b.LIGHTGRAY,b.LIGHTPINK=Object.freeze(b.fromCssColorString("#FFB6C1")),b.LIGHTSEAGREEN=Object.freeze(b.fromCssColorString("#20B2AA")),b.LIGHTSKYBLUE=Object.freeze(b.fromCssColorString("#87CEFA")),b.LIGHTSLATEGRAY=Object.freeze(b.fromCssColorString("#778899")),b.LIGHTSLATEGREY=b.LIGHTSLATEGRAY,b.LIGHTSTEELBLUE=Object.freeze(b.fromCssColorString("#B0C4DE")),b.LIGHTYELLOW=Object.freeze(b.fromCssColorString("#FFFFE0")),b.LIME=Object.freeze(b.fromCssColorString("#00FF00")),b.LIMEGREEN=Object.freeze(b.fromCssColorString("#32CD32")),b.LINEN=Object.freeze(b.fromCssColorString("#FAF0E6")),b.MAGENTA=Object.freeze(b.fromCssColorString("#FF00FF")),b.MAROON=Object.freeze(b.fromCssColorString("#800000")),b.MEDIUMAQUAMARINE=Object.freeze(b.fromCssColorString("#66CDAA")),b.MEDIUMBLUE=Object.freeze(b.fromCssColorString("#0000CD")),b.MEDIUMORCHID=Object.freeze(b.fromCssColorString("#BA55D3")),b.MEDIUMPURPLE=Object.freeze(b.fromCssColorString("#9370DB")),b.MEDIUMSEAGREEN=Object.freeze(b.fromCssColorString("#3CB371")),b.MEDIUMSLATEBLUE=Object.freeze(b.fromCssColorString("#7B68EE")),b.MEDIUMSPRINGGREEN=Object.freeze(b.fromCssColorString("#00FA9A")),b.MEDIUMTURQUOISE=Object.freeze(b.fromCssColorString("#48D1CC")),b.MEDIUMVIOLETRED=Object.freeze(b.fromCssColorString("#C71585")),b.MIDNIGHTBLUE=Object.freeze(b.fromCssColorString("#191970")),b.MINTCREAM=Object.freeze(b.fromCssColorString("#F5FFFA")),b.MISTYROSE=Object.freeze(b.fromCssColorString("#FFE4E1")),b.MOCCASIN=Object.freeze(b.fromCssColorString("#FFE4B5")),b.NAVAJOWHITE=Object.freeze(b.fromCssColorString("#FFDEAD")),b.NAVY=Object.freeze(b.fromCssColorString("#000080")),b.OLDLACE=Object.freeze(b.fromCssColorString("#FDF5E6")),b.OLIVE=Object.freeze(b.fromCssColorString("#808000")),b.OLIVEDRAB=Object.freeze(b.fromCssColorString("#6B8E23")),b.ORANGE=Object.freeze(b.fromCssColorString("#FFA500")),b.ORANGERED=Object.freeze(b.fromCssColorString("#FF4500")),b.ORCHID=Object.freeze(b.fromCssColorString("#DA70D6")),b.PALEGOLDENROD=Object.freeze(b.fromCssColorString("#EEE8AA")),b.PALEGREEN=Object.freeze(b.fromCssColorString("#98FB98")),b.PALETURQUOISE=Object.freeze(b.fromCssColorString("#AFEEEE")),b.PALEVIOLETRED=Object.freeze(b.fromCssColorString("#DB7093")),b.PAPAYAWHIP=Object.freeze(b.fromCssColorString("#FFEFD5")),b.PEACHPUFF=Object.freeze(b.fromCssColorString("#FFDAB9")),b.PERU=Object.freeze(b.fromCssColorString("#CD853F")),b.PINK=Object.freeze(b.fromCssColorString("#FFC0CB")),b.PLUM=Object.freeze(b.fromCssColorString("#DDA0DD")),b.POWDERBLUE=Object.freeze(b.fromCssColorString("#B0E0E6")),b.PURPLE=Object.freeze(b.fromCssColorString("#800080")),b.RED=Object.freeze(b.fromCssColorString("#FF0000")),b.ROSYBROWN=Object.freeze(b.fromCssColorString("#BC8F8F")),b.ROYALBLUE=Object.freeze(b.fromCssColorString("#4169E1")),b.SADDLEBROWN=Object.freeze(b.fromCssColorString("#8B4513")),b.SALMON=Object.freeze(b.fromCssColorString("#FA8072")),b.SANDYBROWN=Object.freeze(b.fromCssColorString("#F4A460")),b.SEAGREEN=Object.freeze(b.fromCssColorString("#2E8B57")),b.SEASHELL=Object.freeze(b.fromCssColorString("#FFF5EE")),b.SIENNA=Object.freeze(b.fromCssColorString("#A0522D")),b.SILVER=Object.freeze(b.fromCssColorString("#C0C0C0")),b.SKYBLUE=Object.freeze(b.fromCssColorString("#87CEEB")),b.SLATEBLUE=Object.freeze(b.fromCssColorString("#6A5ACD")),b.SLATEGRAY=Object.freeze(b.fromCssColorString("#708090")),b.SLATEGREY=b.SLATEGRAY,b.SNOW=Object.freeze(b.fromCssColorString("#FFFAFA")),b.SPRINGGREEN=Object.freeze(b.fromCssColorString("#00FF7F")),b.STEELBLUE=Object.freeze(b.fromCssColorString("#4682B4")),b.TAN=Object.freeze(b.fromCssColorString("#D2B48C")),b.TEAL=Object.freeze(b.fromCssColorString("#008080")),b.THISTLE=Object.freeze(b.fromCssColorString("#D8BFD8")),b.TOMATO=Object.freeze(b.fromCssColorString("#FF6347")),b.TURQUOISE=Object.freeze(b.fromCssColorString("#40E0D0")),b.VIOLET=Object.freeze(b.fromCssColorString("#EE82EE")),b.WHEAT=Object.freeze(b.fromCssColorString("#F5DEB3")),b.WHITE=Object.freeze(b.fromCssColorString("#FFFFFF")),b.WHITESMOKE=Object.freeze(b.fromCssColorString("#F5F5F5")),b.YELLOW=Object.freeze(b.fromCssColorString("#FFFF00")),b.YELLOWGREEN=Object.freeze(b.fromCssColorString("#9ACD32")),b.TRANSPARENT=Object.freeze(new b(0,0,0,0)),e.Color=b});
