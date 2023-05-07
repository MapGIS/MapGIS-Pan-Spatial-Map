import request from '@/utils/request'

// 查询主题列表
export function listTheme(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme/list`,
    method: 'get',
    params: query
  })
}

// 查询主题详细
export function getTheme(themeId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme/` + themeId,
    method: 'get'
  })
}

// 新增主题
export function addTheme(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme`,
    method: 'post',
    data: data
  })
}

// 修改主题
export function updateTheme(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme`,
    method: 'put',
    data: data
  })
}

// 删除主题
export function delTheme(themeId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme/` + themeId,
    method: 'delete'
  })
}

// 导入主题
export function importData(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/theme/importData`,
    method: 'post',
    data: data
  })
}
