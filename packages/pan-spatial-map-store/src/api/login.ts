import request from '../utils/request'

export function login(data: any) {
  return request({
    url: 'auth/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: 'auth/logout',
    method: 'delete'
  })
}

export function getInfo() {
  return request({
    url: 'auth/info',
    method: 'get'
  })
}

export function getAppInfo() {
  return request({
    url: 'auth/app-info',
    method: 'get'
  })
}
