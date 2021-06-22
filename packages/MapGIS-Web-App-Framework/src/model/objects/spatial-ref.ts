export class AngleConvert {
  /**
   * 十进制度转度分秒 d.m.s -> {d,m,s}
   * @param val 十进制经纬度坐标
   */
  public static dToDms(val) {
    const dStrs = val.toString().split('.')
    const d = Number(dStrs[0])
    const mVal = (val - d) * 60
    const mStrs = mVal.toString().split('.')
    const m = Number(mStrs[0])
    const s = (mVal - m) * 60
    return {
      d,
      m,
      s
    }
  }

  /**
   * 度分秒转十进制度 {d,m,s} -> d.m.s
   * @param d
   * @param m
   * @param s
   */
  public static dmsToD(d, m, s) {
    const deci = d + m / 60 + s / (60 * 60)
    return deci
  }
}
