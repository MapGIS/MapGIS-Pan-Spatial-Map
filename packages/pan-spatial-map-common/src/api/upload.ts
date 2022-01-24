import { getRequest } from '../utils/request'

export function imagesUpload(data) {
  return getRequest()({
    url: '/api/local-storage/pictures',
    method: 'post',
    params: data
  })
}
