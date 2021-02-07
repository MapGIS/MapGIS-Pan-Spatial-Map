import request from '../utils/request'

export function imagesUpload(data) {
  return request({
    url: 'api/local-storage/pictures',
    method: 'post',
    data
  })
}
