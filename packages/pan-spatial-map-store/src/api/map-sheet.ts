import { getRequest } from '../utils/request'
import axios from 'axios'

/**
 * 根据坐标计算图幅号
 * @param ip 服务IP
 * @param port 服务Port
 * @param lon 经度
 * @param lat 纬度
 * @param scale 比例尺
 * @param originSrs 源参考系
 * @param destSrs 目标参考系
 */
export function getFrameNoByCoord(
  ip,
  port,
  lon,
  lat,
  scale,
  originSrs,
  destSrs
) {
  const url = `http://${ip}:${port}/onemap/cliprect/getRectByCoor`
  return axios.post(
    url,
    JSON.stringify({
      lon,
      lat,
      scale,
      srsId: originSrs,
      f: 'json',
      objSrsId: destSrs
    })
  )
}

/**
 * 获取图幅号对应的范围
 * @param {*} [ip]
 * @param {*} [port]
 * @param {string} frameNo
 * @param {*} [srsId]
 * @param {*} [objSrsId]
 */
export function getFrameExtentByNo(ip, port, frameNo, originSrs, destSrs) {
  const url = `http://${ip}:${port}/onemap/cliprect/getRectByFrameNo`
  return axios.post(
    url,
    JSON.stringify({
      frameNo,
      srsId: originSrs,
      objSrsId: destSrs,
      f: 'json'
    })
  )
}

/**
 * 获取图幅号
 *
 * @param {string} scale
 * @param {number} [page=1]
 * @param {number} [count=20]
 * @param {string} [keyword='']
 * @return {*}
 */
export function getFrameNoList(
  ip,
  port,
  gdbp,
  xMin,
  yMin,
  xMax,
  yMax,
  scale,
  pageNumber,
  pageSize,
  keyword,
  originSrs,
  destSrs
) {
  return getRequest()({
    url: '/api/map-sheet/no',
    method: 'get',
    params: {
      keyword,
      scale,
      rect: `${xMin},${yMin},${xMax},${yMax}`,
      originSrs,
      destSrs,
      gdbp,
      url: `http://${ip}:${port}/onemap/cliprect/clipList`,
      pageNumber,
      pageSize
    }
  })
}
