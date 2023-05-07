import request from '@/utils/request'

// 查询微件列表
export function listWidget(query) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget/list`,
    method: 'get',
    params: query
  })
}

// 查询微件详细
export function getWidget(widgetId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget/` + widgetId,
    method: 'get'
  })
}

// 新增微件
export function addWidget(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget`,
    method: 'post',
    data: data
  })
}

// 修改微件
export function updateWidget(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget`,
    method: 'put',
    data: data
  })
}

// 删除微件
export function delWidget(widgetId) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget/` + widgetId,
    method: 'delete'
  })
}

// 导入微件
export function importData(data) {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/app/widget/importData`,
    method: 'post',
    data: data
  })
}
