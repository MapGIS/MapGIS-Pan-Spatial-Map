define(["./createTaskProcessorWorker","./when-ae2e0b60"],function(e,t){"use strict";const T="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array&&"undefined"!=typeof DataView;function l(e){for(var t,r,i,s,n,a,o,h,f,u=e.length,l=0,c=Number.POSITIVE_INFINITY,p=0,d=u;p<d;++p)e[p]>l&&(l=e[p]),e[p]<c&&(c=e[p]);for(t=1<<l,r=new(T?Uint32Array:Array)(t),i=1,s=0,n=2;i<=l;){for(p=0;p<u;++p)if(e[p]===i){for(o=s,h=a=0;h<i;++h)a=a<<1|1&o,o>>=1;for(f=i<<16|p,h=a;h<t;h+=n)r[h]=f;++s}++i,s<<=1,n<<=1}return[r,l,c]}function c(e,t){switch(this.buffer,this.blocks=[],this.bufferSize=32768,this.totalpos=0,this.ip=0,this.bitsbuf=0,this.bitsbuflen=0,this.input=T?new Uint8Array(e):e,this.output,this.op,this.bfinal=!1,this.bufferType=c.BufferType.ADAPTIVE,this.resize=!1,(t?(t.index&&(this.ip=t.index),t.bufferSize&&(this.bufferSize=t.bufferSize),t.bufferType&&(this.bufferType=t.bufferType),t.resize):(t={},0))&&(this.resize=t.resize),this.bufferType){case c.BufferType.BLOCK:this.op=c.MaxBackwardLength,this.output=new(T?Uint8Array:Array)(c.MaxBackwardLength+this.bufferSize+c.MaxCopyLength);break;case c.BufferType.ADAPTIVE:this.op=0,this.output=new(T?Uint8Array:Array)(this.bufferSize),this.expandBuffer=this.expandBufferAdaptive,this.concatBuffer=this.concatBufferDynamic,this.decodeHuffman=this.decodeHuffmanAdaptive;break;default:throw new Error("invalid inflate mode")}}function x(){}c.BufferType={BLOCK:0,ADAPTIVE:1},c.prototype.decompress=function(){for(;!this.bfinal;)this.parseBlock();return this.concatBuffer()},c.MaxBackwardLength=32768,c.MaxCopyLength=258,c.Order=(r=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],T?new Uint16Array(r):r),c.LengthCodeTable=(r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],T?new Uint16Array(r):r),c.LengthExtraTable=(r=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],T?new Uint8Array(r):r),c.DistCodeTable=(r=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],T?new Uint16Array(r):r),c.DistExtraTable=(r=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],T?new Uint8Array(r):r),c.FixedLiteralLengthTable=function(){for(var e=new(T?Uint8Array:Array)(288),t=0,r=e.length;t<r;++t)e[t]=t<=143?8:t<=255?9:t<=279?7:8;return l(e)}(),c.FixedDistanceTable=function(){for(var e=new(T?Uint8Array:Array)(30),t=0,r=e.length;t<r;++t)e[t]=5;return l(e)}(),c.prototype.parseBlock=function(){var e=this.readBits(3);switch(1&e&&(this.bfinal=!0),e>>>=1){case 0:this.parseUncompressedBlock();break;case 1:this.parseFixedHuffmanBlock();break;case 2:this.parseDynamicHuffmanBlock();break;default:throw new Error("unknown BTYPE: "+e)}},c.prototype.readBits=function(e){for(var t,r=this.bitsbuf,i=this.bitsbuflen,s=this.input,n=this.ip,a=s.length;i<e;){if(a<=n)throw new Error("input buffer is broken");r|=s[n++]<<i,i+=8}return t=r&(1<<e)-1,i-=e,this.bitsbuf=r>>>=e,this.bitsbuflen=i,this.ip=n,t},c.prototype.readCodeByTable=function(e){for(var t=this.bitsbuf,r=this.bitsbuflen,i=this.input,s=this.ip,n=i.length,a=e[0],o=e[1];r<o&&!(n<=s);)t|=i[s++]<<r,r+=8;if(r<(a=(e=a[t&(1<<o)-1])>>>16))throw new Error("invalid code length: "+a);return this.bitsbuf=t>>a,this.bitsbuflen=r-a,this.ip=s,65535&e},c.prototype.parseUncompressedBlock=function(){var e,t,r=this.input,i=this.ip,s=this.output,n=this.op,a=r.length,o=s.length;if(this.bitsbuf=0,this.bitsbuflen=0,a<=i+1)throw new Error("invalid uncompressed block header: LEN");if(e=r[i++]|r[i++]<<8,a<=i+1)throw new Error("invalid uncompressed block header: NLEN");if(e===~(r[i++]|r[i++]<<8))throw new Error("invalid uncompressed block header: length verify");if(i+e>r.length)throw new Error("input buffer is broken");switch(this.bufferType){case c.BufferType.BLOCK:for(;n+e>s.length;){if(e-=t=o-n,T)s.set(r.subarray(i,i+t),n),n+=t,i+=t;else for(;t--;)s[n++]=r[i++];this.op=n,s=this.expandBuffer(),n=this.op}break;case c.BufferType.ADAPTIVE:for(;n+e>s.length;)s=this.expandBuffer({fixRatio:2});break;default:throw new Error("invalid inflate mode")}if(T)s.set(r.subarray(i,i+e),n),n+=e,i+=e;else for(;e--;)s[n++]=r[i++];this.ip=i,this.op=n,this.output=s},c.prototype.parseFixedHuffmanBlock=function(){this.decodeHuffman(c.FixedLiteralLengthTable,c.FixedDistanceTable)},c.prototype.parseDynamicHuffmanBlock=function(){for(var e,t,r,i,s,n,a=this.readBits(5)+257,o=this.readBits(5)+1,h=this.readBits(4)+4,f=new(T?Uint8Array:Array)(c.Order.length),u=0;u<h;++u)f[c.Order[u]]=this.readBits(3);if(!T)for(u=h,h=f.length;u<h;++u)f[c.Order[u]]=0;for(e=l(f),t=new(T?Uint8Array:Array)(a+o),u=0,n=a+o;u<n;)switch(r=this.readCodeByTable(e)){case 16:for(s=3+this.readBits(2);s--;)t[u++]=i;break;case 17:for(s=3+this.readBits(3);s--;)t[u++]=0;i=0;break;case 18:for(s=11+this.readBits(7);s--;)t[u++]=0;i=0;break;default:i=t[u++]=r}o=T?l(t.subarray(0,a)):l(t.slice(0,a)),a=T?l(t.subarray(a)):l(t.slice(a)),this.decodeHuffman(o,a)},c.prototype.decodeHuffman=function(e,t){for(var r,i,s,n,a=this.output,o=this.op,h=(this.currentLitlenTable=e,a.length-c.MaxCopyLength);256!==(r=this.readCodeByTable(e));)if(r<256)h<=o&&(this.op=o,a=this.expandBuffer(),o=this.op),a[o++]=r;else for(i=r-257,n=c.LengthCodeTable[i],0<c.LengthExtraTable[i]&&(n+=this.readBits(c.LengthExtraTable[i])),r=this.readCodeByTable(t),s=c.DistCodeTable[r],0<c.DistExtraTable[r]&&(s+=this.readBits(c.DistExtraTable[r])),h<=o&&(this.op=o,a=this.expandBuffer(),o=this.op);n--;)a[o]=a[o++-s];for(;8<=this.bitsbuflen;)this.bitsbuflen-=8,this.ip--;this.op=o},c.prototype.decodeHuffmanAdaptive=function(e,t){for(var r,i,s,n,a=this.output,o=this.op,h=(this.currentLitlenTable=e,a.length);256!==(r=this.readCodeByTable(e));)if(r<256)h<=o&&(h=(a=this.expandBuffer()).length),a[o++]=r;else for(i=r-257,n=c.LengthCodeTable[i],0<c.LengthExtraTable[i]&&(n+=this.readBits(c.LengthExtraTable[i])),r=this.readCodeByTable(t),s=c.DistCodeTable[r],0<c.DistExtraTable[r]&&(s+=this.readBits(c.DistExtraTable[r])),h<o+n&&(h=(a=this.expandBuffer()).length);n--;)a[o]=a[o++-s];for(;8<=this.bitsbuflen;)this.bitsbuflen-=8,this.ip--;this.op=o},c.prototype.expandBuffer=function(e){var t,r,i=new(T?Uint8Array:Array)(this.op-c.MaxBackwardLength),s=this.op-c.MaxBackwardLength,n=this.output;if(T)i.set(n.subarray(c.MaxBackwardLength,i.length));else for(t=0,r=i.length;t<r;++t)i[t]=n[t+c.MaxBackwardLength];if(this.blocks.push(i),this.totalpos+=i.length,T)n.set(n.subarray(s,s+c.MaxBackwardLength));else for(t=0;t<c.MaxBackwardLength;++t)n[t]=n[s+t];return this.op=c.MaxBackwardLength,n},c.prototype.expandBufferAdaptive=function(e){var t,r=this.input.length/this.ip+1|0,i=this.input,s=this.output;return e&&("number"==typeof e.fixRatio&&(r=e.fixRatio),"number"==typeof e.addRatio)&&(r+=e.addRatio),i=r<2?(e=(i.length-this.ip)/this.currentLitlenTable[2]/2*258|0)<s.length?s.length+e:s.length<<1:s.length*r,T?(t=new Uint8Array(i)).set(s):t=s,this.output=t,this.output},c.prototype.concatBuffer=function(){var e,t,r,i,s,n=0,a=this.totalpos+(this.op-c.MaxBackwardLength),o=this.output,h=this.blocks,f=new(T?Uint8Array:Array)(a);if(0===h.length)return T?this.output.subarray(c.MaxBackwardLength,this.op):this.output.slice(c.MaxBackwardLength,this.op);for(t=0,r=h.length;t<r;++t)for(i=0,s=(e=h[t]).length;i<s;++i)f[n++]=e[i];for(t=c.MaxBackwardLength,r=this.op;t<r;++t)f[n++]=o[t];return this.blocks=[],this.buffer=f,this.buffer},c.prototype.concatBufferDynamic=function(){var e,t=this.op;return T?this.resize?(e=new Uint8Array(t)).set(this.output.subarray(0,t)):e=this.output.subarray(0,t):(this.output.length>t&&(this.output.length=t),e=this.output),this.buffer=e,this.buffer};function u(e){this.buffer=new(T?Uint16Array:Array)(2*e),this.length=0}function v(e){e=e||{},this.files=[],this.comment=e.comment,this.password}function p(e,t){t=t||{},this.input=T&&e instanceof Array?new Uint8Array(e):e,this.ip=0,this.eocdrOffset,this.numberOfThisDisk,this.startDisk,this.totalEntriesThisDisk,this.totalEntries,this.centralDirectorySize,this.centralDirectoryOffset,this.commentLength,this.comment,this.fileHeaderList,this.filenameToIndex,this.verify=t.verify||!1,this.password=t.password}x.calc=function(e,t,r){return x.update(e,0,t,r)},x.update=function(e,t,r,i){var s=x.Table,n="number"==typeof r?r:r=0;for(t^=4294967295,n=7&(i="number"==typeof i?i:e.length);n--;++r)t=t>>>8^s[255&(t^e[r])];for(n=i>>3;n--;r+=8)t=(t=(t=(t=(t=(t=(t=(t=t>>>8^s[255&(t^e[r])])>>>8^s[255&(t^e[r+1])])>>>8^s[255&(t^e[r+2])])>>>8^s[255&(t^e[r+3])])>>>8^s[255&(t^e[r+4])])>>>8^s[255&(t^e[r+5])])>>>8^s[255&(t^e[r+6])])>>>8^s[255&(t^e[r+7])];return(4294967295^t)>>>0},x.single=function(e,t){return(x.Table[255&(e^t)]^e>>>8)>>>0},x.Table_=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],x.Table=T?new Uint32Array(x.Table_):x.Table_;const m=function(e,t){if(this.index="number"==typeof t?t:0,this.bitindex=0,this.buffer=e instanceof(T?Uint8Array:Array)?e:new(T?Uint8Array:Array)(m.DefaultBlockSize),2*this.buffer.length<=this.index)throw new Error("invalid index");this.buffer.length<=this.index&&this.expandBuffer()},w=(m.DefaultBlockSize=32768,m.prototype.expandBuffer=function(){var e,t=this.buffer,r=t.length,i=new(T?Uint8Array:Array)(r<<1);if(T)i.set(t);else for(e=0;e<r;++e)i[e]=t[e];return this.buffer=i},m.prototype.writeBits=function(e,t,r){var i,s=this.buffer,n=this.index,a=this.bitindex,o=s[n];if(r&&1<t&&(e=8<t?(r=e,(m.ReverseTable[255&r]<<24|m.ReverseTable[r>>>8&255]<<16|m.ReverseTable[r>>>16&255]<<8|m.ReverseTable[r>>>24&255])>>32-t):m.ReverseTable[e]>>8-t),t+a<8)o=o<<t|e,a+=t;else for(i=0;i<t;++i)o=o<<1|e>>t-i-1&1,8==++a&&(a=0,s[n++]=m.ReverseTable[o],o=0,n===s.length)&&(s=this.expandBuffer());s[n]=o,this.buffer=s,this.bitindex=a,this.index=n},m.prototype.finish=function(){var e=this.buffer,t=this.index;return 0<this.bitindex&&(e[t]<<=8-this.bitindex,e[t]=m.ReverseTable[e[t]],t++),T?e.subarray(0,t):(e.length=t,e)},m.ReverseTable=function(){for(var e=new(T?Uint8Array:Array)(256),t=0;t<256;++t)e[t]=function(e){var t=e,r=7;for(e>>>=1;e;e>>>=1)t=t<<1|1&e,--r;return(t<<r&255)>>>0}(t);return e}(),u.prototype.getParent=function(e){return 2*((e-2)/4|0)},u.prototype.getChild=function(e){return 2*e+2},u.prototype.push=function(e,t){var r,i,s=this.buffer,n=this.length;for(s[this.length++]=t,s[this.length++]=e;0<n&&(r=this.getParent(n),s[n]>s[r]);)i=s[n],s[n]=s[r],s[r]=i,i=s[n+1],s[n+1]=s[r+1],s[r+1]=i,n=r;return this.length},u.prototype.pop=function(){var e,t,r,i=this.buffer,s=i[0],n=i[1];for(this.length-=2,i[0]=i[this.length],i[1]=i[this.length+1],r=0;!((t=this.getChild(r))>=this.length)&&(t+2<this.length&&i[t+2]>i[t]&&(t+=2),i[t]>i[r]);)e=i[r],i[r]=i[t],i[t]=e,e=i[r+1],i[r+1]=i[t+1],i[t+1]=e,r=t;return{index:n,value:s,length:this.length}},function(e,t){this.compressionType=w.CompressionType.DYNAMIC,this.lazy=0,this.freqsLitLen,this.freqsDist,this.input=T&&e instanceof Array?new Uint8Array(e):e,this.output,this.op=0,t&&(t.lazy&&(this.lazy=t.lazy),"number"==typeof t.compressionType&&(this.compressionType=t.compressionType),t.outputBuffer&&(this.output=T&&t.outputBuffer instanceof Array?new Uint8Array(t.outputBuffer):t.outputBuffer),"number"==typeof t.outputIndex)&&(this.op=t.outputIndex),this.output||(this.output=new(T?Uint8Array:Array)(32768))}),d=(w.CompressionType={NONE:0,FIXED:1,DYNAMIC:2,RESERVED:3},w.Lz77MinLength=3,w.Lz77MaxLength=258,w.WindowSize=32768,w.MaxCodeLength=16,w.HUFMAX=286,w.FixedHuffmanTable=function(){for(var e=[],t=0;t<288;t++)switch(!0){case t<=143:e.push([t+48,8]);break;case t<=255:e.push([t-144+400,9]);break;case t<=279:e.push([t-256,7]);break;case t<=287:e.push([t-280+192,8]);break;default:throw"invalid literal: "+t}return e}(),w.prototype.compress=function(){var e,t,r,i=this.input;switch(this.compressionType){case w.CompressionType.NONE:for(t=0,r=i.length;t<r;)t+=(e=T?i.subarray(t,t+65535):i.slice(t,t+65535)).length,this.makeNocompressBlock(e,t===r);break;case w.CompressionType.FIXED:this.output=this.makeFixedHuffmanBlock(i,!0),this.op=this.output.length;break;case w.CompressionType.DYNAMIC:this.output=this.makeDynamicHuffmanBlock(i,!0),this.op=this.output.length;break;default:throw"invalid compression type"}return this.output},w.prototype.makeNocompressBlock=function(e,t){var r,i,s,n=this.output,a=this.op;if(T){for(n=new Uint8Array(this.output.buffer);n.length<=a+e.length+5;)n=new Uint8Array(n.length<<1);n.set(this.output)}if(t=t?1:0,r=w.CompressionType.NONE,n[a++]=t|r<<1,r=65536+~(t=e.length)&65535,n[a++]=255&t,n[a++]=t>>>8&255,n[a++]=255&r,n[a++]=r>>>8&255,T)n.set(e,a),a+=e.length,n=n.subarray(0,a);else{for(i=0,s=e.length;i<s;++i)n[a++]=e[i];n.length=a}return this.op=a,this.output=n},w.prototype.makeFixedHuffmanBlock=function(e,t){var r=new m(T?new Uint8Array(this.output.buffer):this.output,this.op),t=t?1:0,i=w.CompressionType.FIXED;return r.writeBits(t,1,!0),r.writeBits(i,2,!0),t=this.lz77(e),this.fixedHuffman(t,r),r.finish()},w.prototype.makeDynamicHuffmanBlock=function(e,t){var r,i,s,n,a,o,h,f,u,l,c,p,d=new m(T?new Uint8Array(this.output.buffer):this.output,this.op),y=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],g=new Array(19),t=t?1:0,b=w.CompressionType.DYNAMIC;for(d.writeBits(t,1,!0),d.writeBits(b,2,!0),t=this.lz77(e),n=this.getLengths_(this.freqsLitLen,15),b=this.getCodesFromLengths_(n),a=this.getLengths_(this.freqsDist,7),e=this.getCodesFromLengths_(a),r=286;257<r&&0===n[r-1];r--);for(i=30;1<i&&0===a[i-1];i--);for(o=this.getTreeSymbols_(r,n,i,a),h=this.getLengths_(o.freqs,7),c=0;c<19;c++)g[c]=h[y[c]];for(s=19;4<s&&0===g[s-1];s--);for(f=this.getCodesFromLengths_(h),d.writeBits(r-257,5,!0),d.writeBits(i-1,5,!0),d.writeBits(s-4,4,!0),c=0;c<s;c++)d.writeBits(g[c],3,!0);for(c=0,p=o.codes.length;c<p;c++)if(u=o.codes[c],d.writeBits(f[u],h[u],!0),16<=u){switch(c++,u){case 16:l=2;break;case 17:l=3;break;case 18:l=7;break;default:throw"invalid code: "+u}d.writeBits(o.codes[c],l,!0)}return this.dynamicHuffman(t,[b,n],[e,a],d),d.finish()},w.prototype.dynamicHuffman=function(e,t,r,i){for(var s,n,a=t[0],o=t[1],h=r[0],f=r[1],u=0,l=e.length;u<l;++u)if(s=e[u],i.writeBits(a[s],o[s],!0),256<s)i.writeBits(e[++u],e[++u],!0),n=e[++u],i.writeBits(h[n],f[n],!0),i.writeBits(e[++u],e[++u],!0);else if(256===s)break;return i},w.prototype.fixedHuffman=function(e,t){for(var r,i=0,s=e.length;i<s;i++)if(r=e[i],m.prototype.writeBits.apply(t,w.FixedHuffmanTable[r]),256<r)t.writeBits(e[++i],e[++i],!0),t.writeBits(e[++i],5),t.writeBits(e[++i],e[++i],!0);else if(256===r)break;return t},w.Lz77Match=function(e,t){this.length=e,this.backwardDistance=t},w.Lz77Match.LengthCodeTable=(r=function(){for(var e,t=[],r=3;r<=258;r++)e=function(e){switch(!0){case 3===e:return[257,e-3,0];case 4===e:return[258,e-4,0];case 5===e:return[259,e-5,0];case 6===e:return[260,e-6,0];case 7===e:return[261,e-7,0];case 8===e:return[262,e-8,0];case 9===e:return[263,e-9,0];case 10===e:return[264,e-10,0];case e<=12:return[265,e-11,1];case e<=14:return[266,e-13,1];case e<=16:return[267,e-15,1];case e<=18:return[268,e-17,1];case e<=22:return[269,e-19,2];case e<=26:return[270,e-23,2];case e<=30:return[271,e-27,2];case e<=34:return[272,e-31,2];case e<=42:return[273,e-35,3];case e<=50:return[274,e-43,3];case e<=58:return[275,e-51,3];case e<=66:return[276,e-59,3];case e<=82:return[277,e-67,4];case e<=98:return[278,e-83,4];case e<=114:return[279,e-99,4];case e<=130:return[280,e-115,4];case e<=162:return[281,e-131,5];case e<=194:return[282,e-163,5];case e<=226:return[283,e-195,5];case e<=257:return[284,e-227,5];case 258===e:return[285,e-258,0];default:throw"invalid length: "+e}}(r),t[r]=e[2]<<24|e[1]<<16|e[0];return t}(),T?new Uint32Array(r):r),w.Lz77Match.prototype.getDistanceCode_=function(e){var t;switch(!0){case 1===e:t=[0,e-1,0];break;case 2===e:t=[1,e-2,0];break;case 3===e:t=[2,e-3,0];break;case 4===e:t=[3,e-4,0];break;case e<=6:t=[4,e-5,1];break;case e<=8:t=[5,e-7,1];break;case e<=12:t=[6,e-9,2];break;case e<=16:t=[7,e-13,2];break;case e<=24:t=[8,e-17,3];break;case e<=32:t=[9,e-25,3];break;case e<=48:t=[10,e-33,4];break;case e<=64:t=[11,e-49,4];break;case e<=96:t=[12,e-65,5];break;case e<=128:t=[13,e-97,5];break;case e<=192:t=[14,e-129,6];break;case e<=256:t=[15,e-193,6];break;case e<=384:t=[16,e-257,7];break;case e<=512:t=[17,e-385,7];break;case e<=768:t=[18,e-513,8];break;case e<=1024:t=[19,e-769,8];break;case e<=1536:t=[20,e-1025,9];break;case e<=2048:t=[21,e-1537,9];break;case e<=3072:t=[22,e-2049,10];break;case e<=4096:t=[23,e-3073,10];break;case e<=6144:t=[24,e-4097,11];break;case e<=8192:t=[25,e-6145,11];break;case e<=12288:t=[26,e-8193,12];break;case e<=16384:t=[27,e-12289,12];break;case e<=24576:t=[28,e-16385,13];break;case e<=32768:t=[29,e-24577,13];break;default:throw"invalid distance"}return t},w.Lz77Match.prototype.toLz77Array=function(){var e=this.length,t=this.backwardDistance,r=[],i=0,e=w.Lz77Match.LengthCodeTable[e];return r[i++]=65535&e,r[i++]=e>>16&255,r[i++]=e>>24,e=this.getDistanceCode_(t),r[+i]=e[0],r[4]=e[1],r[5]=e[2],r},w.prototype.lz77=function(e){var t,r,i,s,n,a,o,h,f,u={},l=w.WindowSize,c=T?new Uint16Array(2*e.length):[],p=0,d=0,y=new(T?Uint32Array:Array)(286),g=new(T?Uint32Array:Array)(30),b=this.lazy;if(!T){for(i=0;i<=285;)y[i++]=0;for(i=0;i<=29;)g[i++]=0}function m(e,t){for(var r=e.toLz77Array(),i=0,s=r.length;i<s;++i)c[p++]=r[i];y[r[0]]++,g[r[3]]++,d=e.length+t-1,h=null}for(y[256]=1,t=0,r=e.length;t<r;++t){for(i=n=0,s=w.Lz77MinLength;i<s&&t+i!==r;++i)n=n<<8|e[t+i];if(void 0===u[n]&&(u[n]=[]),a=u[n],!(0<d--)){for(;0<a.length&&t-a[0]>l;)a.shift();if(t+w.Lz77MinLength>=r){for(h&&m(h,-1),i=0,s=r-t;i<s;++i)f=e[t+i],c[p++]=f,++y[f];break}0<a.length?(o=this.searchLongestMatch_(e,t,a),h?h.length<o.length?(f=e[t-1],c[p++]=f,++y[f],m(o,0)):m(h,-1):o.length<b?h=o:m(o,0)):h?m(h,-1):(f=e[t],c[p++]=f,++y[f])}a.push(t)}return c[p++]=256,y[256]++,this.freqsLitLen=y,this.freqsDist=g,T?c.subarray(0,p):c},w.prototype.searchLongestMatch_=function(e,t,r){var i,s,n,a,o,h,f=0,u=e.length;e:for(a=0,h=r.length;a<h;a++){if(i=r[h-a-1],n=w.Lz77MinLength,f>w.Lz77MinLength){for(o=f;o>w.Lz77MinLength;o--)if(e[i+o-1]!==e[t+o-1])continue e;n=f}for(;n<w.Lz77MaxLength&&t+n<u&&e[i+n]===e[t+n];)++n;if(f<n&&(s=i,f=n),n===w.Lz77MaxLength)break}return new w.Lz77Match(f,t-s)},w.prototype.getTreeSymbols_=function(e,t,r,i){for(var s,n,a,o,h=new(T?Uint32Array:Array)(e+r),f=new(T?Uint32Array:Array)(316),u=new(T?Uint8Array:Array)(19),l=0,c=0;c<e;c++)h[l++]=t[c];for(c=0;c<r;c++)h[l++]=i[c];if(!T)for(c=0,n=u.length;c<n;++c)u[c]=0;for(c=a=0,n=h.length;c<n;c+=l){for(l=1;c+l<n&&h[c+l]===h[c];++l);if(s=l,0===h[c])if(s<3)for(;0<s--;)u[f[a++]=0]++;else for(;0<s;)(o=s-3<(o=s<138?s:138)&&o<s?s-3:o)<=10?(f[a++]=17,f[a++]=o-3,u[17]++):(f[a++]=18,f[a++]=o-11,u[18]++),s-=o;else if(f[a++]=h[c],u[h[c]]++,--s<3)for(;0<s--;)f[a++]=h[c],u[h[c]]++;else for(;0<s;)s-3<(o=s<6?s:6)&&o<s&&(o=s-3),f[a++]=16,f[a++]=o-3,u[16]++,s-=o}return{codes:T?f.subarray(0,a):f.slice(0,a),freqs:u}},w.prototype.getLengths_=function(e,t){var r,i,s,n,a,o=e.length,h=new u(2*w.HUFMAX),f=new(T?Uint8Array:Array)(o);if(!T)for(n=0;n<o;n++)f[n]=0;for(n=0;n<o;++n)0<e[n]&&h.push(n,e[n]);if(r=new Array(h.length/2),i=new(T?Uint32Array:Array)(h.length/2),1===r.length)f[h.pop().index]=1;else{for(n=0,a=h.length/2;n<a;++n)r[n]=h.pop(),i[n]=r[n].value;for(s=this.reversePackageMerge_(i,i.length,t),n=0,a=r.length;n<a;++n)f[r[n].index]=s[n]}return f},w.prototype.reversePackageMerge_=function(e,i,t){var r,s,n,a,o,h=new(T?Uint16Array:Array)(t),f=new(T?Uint8Array:Array)(t),u=new(T?Uint8Array:Array)(i),l=new Array(t),c=new Array(t),p=new Array(t),d=(1<<t)-i,y=1<<t-1;for(h[t-1]=i,s=0;s<t;++s)d<y?f[s]=0:(f[s]=1,d-=y),d<<=1,h[t-2-s]=(h[t-1-s]/2|0)+i;for(h[0]=f[0],l[0]=new Array(h[0]),c[0]=new Array(h[0]),s=1;s<t;++s)h[s]>2*h[s-1]+f[s]&&(h[s]=2*h[s-1]+f[s]),l[s]=new Array(h[s]),c[s]=new Array(h[s]);for(r=0;r<i;++r)u[r]=t;for(n=0;n<h[t-1];++n)l[t-1][n]=e[n],c[t-1][n]=n;for(r=0;r<t;++r)p[r]=0;for(1===f[t-1]&&(--u[0],++p[t-1]),s=t-2;0<=s;--s){for(o=p[s+1],n=r=0;n<h[s];n++)(a=l[s+1][o]+l[s+1][o+1])>e[r]?(l[s][n]=a,c[s][n]=i,o+=2):(l[s][n]=e[r],c[s][n]=r,++r);p[s]=0,1===f[s]&&function e(t){var r=c[t][p[t]];r===i?(e(t+1),e(t+1)):--u[r],++p[t]}(s)}return u},w.prototype.getCodesFromLengths_=function(e){for(var t,r,i=new(T?Uint16Array:Array)(e.length),s=[],n=[],a=0,o=0,h=e.length;o<h;o++)s[e[o]]=1+(0|s[e[o]]);for(o=1,h=w.MaxCodeLength;o<=h;o++)a=(n[o]=a)+(0|s[o])<<1;for(o=0,h=e.length;o<h;o++)for(a=n[e[o]],n[e[o]]+=1,t=i[o]=0,r=e[o];t<r;t++)i[o]=i[o]<<1|1&a,a>>>=1;return i},v.CompressionMethod={STORE:0,DEFLATE:8},v.OperatingSystem={MSDOS:0,UNIX:3,MACINTOSH:7},v.Flags={ENCRYPT:1,DESCRIPTOR:8,UTF8:2048},v.FileHeaderSignature=[80,75,1,2],v.LocalFileHeaderSignature=[80,75,3,4],v.CentralDirectorySignature=[80,75,5,6],v.prototype.addFile=function(e,t){t=t||{};var r,i=e.length,s=0;if(T&&e instanceof Array&&(e=new Uint8Array(e)),"number"!=typeof t.compressionMethod&&(t.compressionMethod=v.CompressionMethod.DEFLATE),t.compress)switch(t.compressionMethod){case v.CompressionMethod.STORE:break;case v.CompressionMethod.DEFLATE:s=x.calc(e),e=this.deflateWithOption(e,t),r=!0;break;default:throw new Error("unknown compression method:"+t.compressionMethod)}this.files.push({buffer:e,option:t,compressed:r,encrypted:!1,size:i,crc32:s})},v.prototype.setPassword=function(e){this.password=e},v.prototype.compress=function(){for(var e,t,r,i,s,n,a,o,h,f,u,l,c,p,d,y,g,b,m,w=this.files,L=0,k=0,A=0,B=w.length;A<B;++A){if(h=(e=w[A]).option.filename?e.option.filename.length:0,f=e.option.extraField?e.option.extraField.length:0,u=e.option.comment?e.option.comment.length:0,!e.compressed)switch(e.crc32=x.calc(e.buffer),e.option.compressionMethod){case v.CompressionMethod.STORE:break;case v.CompressionMethod.DEFLATE:e.buffer=this.deflateWithOption(e.buffer,e.option),e.compressed=!0;break;default:throw new Error("unknown compression method:"+e.option.compressionMethod)}if(void 0!==e.option.password||void 0!==this.password){for(g=this.createEncryptionKey(e.option.password||this.password),d=e.buffer,T?((y=new Uint8Array(d.length+12)).set(d,12),d=y):d.unshift(0,0,0,0,0,0,0,0,0,0,0,0),b=0;b<12;++b)d[b]=this.encode(g,11===A?255&e.crc32:256*Math.random()|0);for(m=d.length;b<m;++b)d[b]=this.encode(g,d[b]);e.buffer=d}L+=30+h+e.buffer.length,k+=46+h+u}for(n=22+(this.comment?this.comment.length:0),t=new(T?Uint8Array:Array)(L+k+n),s=(i=L)+k,A=r=0,B=w.length;A<B;++A){if(h=(e=w[A]).option.filename?e.option.filename.length:0,f=0,u=e.option.comment?e.option.comment.length:0,a=r,t[r++]=v.LocalFileHeaderSignature[0],t[r++]=v.LocalFileHeaderSignature[1],t[r++]=v.LocalFileHeaderSignature[2],t[r++]=v.LocalFileHeaderSignature[3],t[i++]=v.FileHeaderSignature[0],t[i++]=v.FileHeaderSignature[1],t[i++]=v.FileHeaderSignature[2],t[i++]=v.FileHeaderSignature[3],t[i++]=20,t[i++]=e.option.os||v.OperatingSystem.MSDOS,t[r++]=t[i++]=20,o=t[r++]=t[i++]=0,(e.option.password||this.password)&&(o|=v.Flags.ENCRYPT),t[r++]=t[i++]=255&o,t[r++]=t[i++]=o>>8&255,o=e.option.compressionMethod,t[r++]=t[i++]=255&o,t[r++]=t[i++]=o>>8&255,o=e.option.date||new Date,t[r++]=t[i++]=(7&o.getMinutes())<<5|o.getSeconds()/2|0,t[r++]=t[i++]=o.getHours()<<3|o.getMinutes()>>3,t[r++]=t[i++]=(o.getMonth()+1&7)<<5|o.getDate(),t[r++]=t[i++]=(o.getFullYear()-1980&127)<<1|o.getMonth()+1>>3,o=e.crc32,t[r++]=t[i++]=255&o,t[r++]=t[i++]=o>>8&255,t[r++]=t[i++]=o>>16&255,t[r++]=t[i++]=o>>24&255,o=e.buffer.length,t[r++]=t[i++]=255&o,t[r++]=t[i++]=o>>8&255,t[r++]=t[i++]=o>>16&255,t[r++]=t[i++]=o>>24&255,o=e.size,t[r++]=t[i++]=255&o,t[r++]=t[i++]=o>>8&255,t[r++]=t[i++]=o>>16&255,t[r++]=t[i++]=o>>24&255,t[r++]=t[i++]=255&h,t[r++]=t[i++]=h>>8&255,t[r++]=t[i++]=255&f,t[r++]=t[i++]=f>>8&255,t[i++]=255&u,t[i++]=u>>8&255,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=0,t[i++]=255&a,t[i++]=a>>8&255,t[i++]=a>>16&255,t[i++]=a>>24&255,l=e.option.filename)if(T)t.set(l,r),t.set(l,i),r+=h,i+=h;else for(b=0;b<h;++b)t[r++]=t[i++]=l[b];if(c=e.option.extraField)if(T)t.set(c,r),t.set(c,i),r+=f,i+=f;else for(b=0;b<u;++b)t[r++]=t[i++]=c[b];if(p=e.option.comment)if(T)t.set(p,i),i+=u;else for(b=0;b<u;++b)t[i++]=p[b];if(T)t.set(e.buffer,r),r+=e.buffer.length;else for(b=0,m=e.buffer.length;b<m;++b)t[r++]=e.buffer[b]}if(t[s++]=v.CentralDirectorySignature[0],t[s++]=v.CentralDirectorySignature[1],t[s++]=v.CentralDirectorySignature[2],t[s++]=v.CentralDirectorySignature[3],t[s++]=0,t[s++]=0,t[s++]=0,t[s++]=0,t[s++]=255&B,t[s++]=B>>8&255,t[s++]=255&B,t[s++]=B>>8&255,t[s++]=255&k,t[s++]=k>>8&255,t[s++]=k>>16&255,t[s++]=k>>24&255,t[s++]=255&L,t[s++]=L>>8&255,t[s++]=L>>16&255,t[s++]=L>>24&255,u=this.comment?this.comment.length:0,t[s++]=255&u,t[s++]=u>>8&255,this.comment)if(T)t.set(this.comment,s),s+=u;else for(b=0,m=u;b<m;++b)t[s++]=this.comment[b];return t},v.prototype.deflateWithOption=function(e,t){return new w(e,t.deflateOption).compress()},v.prototype.getByte=function(e){return(e=65535&e[2]|2)*(1^e)>>8&255},v.prototype.encode=function(e,t){var r=this.getByte(e);return this.updateKeys(e,t),r^t},v.prototype.updateKeys=function(e,t){e[0]=x.single(e[0],t),e[1]=1+(6681*(20173*(e[1]+(255&e[0]))>>>0)>>>0)>>>0,e[2]=x.single(e[2],e[1]>>>24)},v.prototype.createEncryptionKey=function(e){var t,r,i=[305419896,591751049,878082192];for(T&&(i=new Uint32Array(i)),t=0,r=e.length;t<r;++t)this.updateKeys(i,255&e[t]);return i},p.CompressionMethod=v.CompressionMethod,p.FileHeaderSignature=v.FileHeaderSignature,p.LocalFileHeaderSignature=v.LocalFileHeaderSignature,p.CentralDirectorySignature=v.CentralDirectorySignature,p.FileHeader=function(e,t){this.input=e,this.offset=t,this.length,this.version,this.os,this.needVersion,this.flags,this.compression,this.time,this.date,this.crc32,this.compressedSize,this.plainSize,this.fileNameLength,this.extraFieldLength,this.fileCommentLength,this.diskNumberStart,this.internalFileAttributes,this.externalFileAttributes,this.relativeOffset,this.filename,this.extraField,this.comment},p.FileHeader.prototype.parse=function(){var e=this.input,t=this.offset;if(e[t++]!==p.FileHeaderSignature[0]||e[t++]!==p.FileHeaderSignature[1]||e[t++]!==p.FileHeaderSignature[2]||e[t++]!==p.FileHeaderSignature[3])throw new Error("invalid file header signature");this.version=e[t++],this.os=e[t++],this.needVersion=e[t++]|e[t++]<<8,this.flags=e[t++]|e[t++]<<8,this.compression=e[t++]|e[t++]<<8,this.time=e[t++]|e[t++]<<8,this.date=e[t++]|e[t++]<<8,this.crc32=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.compressedSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.plainSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.fileNameLength=e[t++]|e[t++]<<8,this.extraFieldLength=e[t++]|e[t++]<<8,this.fileCommentLength=e[t++]|e[t++]<<8,this.diskNumberStart=e[t++]|e[t++]<<8,this.internalFileAttributes=e[t++]|e[t++]<<8,this.externalFileAttributes=e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24,this.relativeOffset=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.filename=String.fromCharCode.apply(null,T?e.subarray(t,t+=this.fileNameLength):e.slice(t,t+=this.fileNameLength)),this.extraField=T?e.subarray(t,t+=this.extraFieldLength):e.slice(t,t+=this.extraFieldLength),this.comment=T?e.subarray(t,t+this.fileCommentLength):e.slice(t,t+this.fileCommentLength),this.length=t-this.offset},p.LocalFileHeader=function(e,t){this.input=e,this.offset=t,this.length,this.needVersion,this.flags,this.compression,this.time,this.date,this.crc32,this.compressedSize,this.plainSize,this.fileNameLength,this.extraFieldLength,this.filename,this.extraField},p.LocalFileHeader.Flags=v.Flags,p.LocalFileHeader.prototype.parse=function(){var e=this.input,t=this.offset;if(e[t++]!==p.LocalFileHeaderSignature[0]||e[t++]!==p.LocalFileHeaderSignature[1]||e[t++]!==p.LocalFileHeaderSignature[2]||e[t++]!==p.LocalFileHeaderSignature[3])throw new Error("invalid local file header signature");this.needVersion=e[t++]|e[t++]<<8,this.flags=e[t++]|e[t++]<<8,this.compression=e[t++]|e[t++]<<8,this.time=e[t++]|e[t++]<<8,this.date=e[t++]|e[t++]<<8,this.crc32=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.compressedSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.plainSize=(e[t++]|e[t++]<<8|e[t++]<<16|e[t++]<<24)>>>0,this.fileNameLength=e[t++]|e[t++]<<8,this.extraFieldLength=e[t++]|e[t++]<<8,this.filename=String.fromCharCode.apply(null,T?e.subarray(t,t+=this.fileNameLength):e.slice(t,t+=this.fileNameLength)),this.extraField=T?e.subarray(t,t+=this.extraFieldLength):e.slice(t,t+=this.extraFieldLength),this.length=t-this.offset},p.prototype.searchEndOfCentralDirectoryRecord=function(){for(var e=this.input,t=e.length-12;0<t;--t)if(e[t]===p.CentralDirectorySignature[0]&&e[t+1]===p.CentralDirectorySignature[1]&&e[t+2]===p.CentralDirectorySignature[2]&&e[t+3]===p.CentralDirectorySignature[3])return void(this.eocdrOffset=t);throw new Error("End of Central Directory Record not found")},p.prototype.parseEndOfCentralDirectoryRecord=function(){var e,t=this.input;if(this.eocdrOffset||this.searchEndOfCentralDirectoryRecord(),e=this.eocdrOffset,t[e++]!==p.CentralDirectorySignature[0]||t[e++]!==p.CentralDirectorySignature[1]||t[e++]!==p.CentralDirectorySignature[2]||t[e++]!==p.CentralDirectorySignature[3])throw new Error("invalid signature");this.numberOfThisDisk=t[e++]|t[e++]<<8,this.startDisk=t[e++]|t[e++]<<8,this.totalEntriesThisDisk=t[e++]|t[e++]<<8,this.totalEntries=t[e++]|t[e++]<<8,this.centralDirectorySize=(t[e++]|t[e++]<<8|t[e++]<<16|t[e++]<<24)>>>0,this.centralDirectoryOffset=(t[e++]|t[e++]<<8|t[e++]<<16|t[e++]<<24)>>>0,this.commentLength=t[e++]|t[e++]<<8,this.comment=T?t.subarray(e,e+this.commentLength):t.slice(e,e+this.commentLength)},p.prototype.parseFileHeader=function(){var e,t,r,i,s=[],n={};if(!this.fileHeaderList){for(void 0===this.centralDirectoryOffset&&this.parseEndOfCentralDirectoryRecord(),e=this.centralDirectoryOffset,r=0,i=this.totalEntries;r<i;++r)(t=new p.FileHeader(this.input,e)).parse(),e+=t.length,n[(s[r]=t).filename]=r;if(this.centralDirectorySize<e-this.centralDirectoryOffset)throw new Error("invalid file header size");this.fileHeaderList=s,this.filenameToIndex=n}},p.prototype.getFileData=function(e,t){t=t||{};var r,i,s,n,a,o,h=this.input,f=this.fileHeaderList;if(f||this.parseFileHeader(),void 0===f[e])throw new Error("wrong index");if(i=f[e].relativeOffset,(r=new p.LocalFileHeader(this.input,i)).parse(),i+=r.length,s=r.compressedSize,0!=(r.flags&p.LocalFileHeader.Flags.ENCRYPT)){if(!t.password&&!this.password)throw new Error("please set password");for(n=this.createDecryptionKey(t.password||this.password),o=(a=i)+12;a<o;++a)this.decode(n,h[a]);for(o=(a=i+=12)+(s-=12);a<o;++a)h[a]=this.decode(n,h[a])}switch(r.compression){case p.CompressionMethod.STORE:var u=(l=T?this.input.subarray(i,i+s):this.input.slice(i,i+s)).buffer.slice(i,i+s),l=new Uint8Array(u);break;case p.CompressionMethod.DEFLATE:l=new c(this.input,{index:i,bufferSize:r.plainSize}).decompress();break;default:throw new Error("unknown compression type")}if(this.verify&&(f=x.calc(l),r.crc32!==f))throw new Error("wrong crc: file=0x"+r.crc32.toString(16)+", data=0x"+f.toString(16));return l},p.prototype.getFilenames=function(){var e,t,r,i=[];for(this.fileHeaderList||this.parseFileHeader(),e=0,t=(r=this.fileHeaderList).length;e<t;++e)i[e]=r[e].filename;return i},p.prototype.decompress=function(e,t){var r;if(this.filenameToIndex||this.parseFileHeader(),void 0===(r=this.filenameToIndex[e]))throw new Error(e+" not found");return this.getFileData(r,t)},p.prototype.setPassword=function(e){this.password=e},p.prototype.decode=function(e,t){return t^=this.getByte(e),this.updateKeys(e,t),t},p.prototype.updateKeys=v.prototype.updateKeys,p.prototype.createDecryptionKey=v.prototype.createEncryptionKey,p.prototype.getByte=v.prototype.getByte,{});var r;return d.Unzip=p,e(function(e,t){for(var r,i,s,n,a,o,h=new Uint8Array(e._data),f=new d.Unzip(h,{}),u=e._password,l=(f.setPassword(u),f.getFilenames()),c=0;c<l.length;c++)(l[c].includes(".glb")||l[c].includes(".cmpt")||l[c].includes(".pnts"))&&(r=f.decompress(l[c],{password:u})),l[c].includes(".json")&&(i=f.decompress(l[c],{password:u})),l[c].includes(".bin")&&(s=f.decompress(l[c],{password:u})),l[c].includes(".i3dm")&&(n=f.decompress(l[c],{password:u})),l[c].includes(".att")&&(a=f.decompress(l[c],{password:u})),l[c].includes(".tid")&&(o=f.decompress(l[c],{password:u}));return h={},r&&(t.push(r.buffer),h.file=r.buffer),i&&(t.push(i.buffer),h.attJson=i.buffer),s&&(t.push(s.buffer),h.attBin=s.buffer),n&&(t.push(n.buffer),h.instancedFile=n.buffer),a&&(t.push(a.buffer),h.att=a.buffer),o&&(t.push(o.buffer),h.tid=o.buffer),h})});
