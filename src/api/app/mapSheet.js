import request from '@/utils/request'

export function getScales(rect, originSrs, destSrs) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/mapSheet/scale?rect=${rect}&originSrs=${originSrs}&destSrs=${destSrs}`,
    method: 'get'
  })
}

export function getNos(scale, rect, originSrs, destSrs, gdbp, url, replace) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/mapSheet/no?scale=${scale}&rect=${rect}&originSrs=${originSrs}&destSrs=${destSrs}&gdbp=${gdbp}&url=${url}&replace=${replace}`,
    method: 'get'
  })
}
