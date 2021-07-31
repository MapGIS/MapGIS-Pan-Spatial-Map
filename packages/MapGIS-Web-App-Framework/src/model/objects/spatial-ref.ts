import axios from 'axios'

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

export class ProjectionTransformation {
  static async projectPoints(
    points: number[][],
    srcSref: string,
    desSref,
    ip,
    port,
    serverName,
    gdbName,
    userName,
    password
  ) {
    if (points.length <= 0 || !srcSref) {
      throw new Error('参数错误')
    }

    const pointArr = points.map(([x, y]) => `${x},${y}`).join(';')
    const url =
      `http://${ip}:${port}/igs/rest/mrgs/geomservice/projectpoints` +
      `?f=json&srcSref=${srcSref}&desSref=${desSref}` +
      `&serverName=${serverName}&gdbName=${gdbName}&userName=${userName}&password=${password}`

    return axios.post(url, pointArr)
  }
}
