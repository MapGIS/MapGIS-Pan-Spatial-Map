import request from '@/utils/request'

export function getDistrictTree() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/district/tree`,
    method: 'get'
  })
}

export function deleteDistrict(ids) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/district/${ids}`,
    method: 'delete'
  })
}
