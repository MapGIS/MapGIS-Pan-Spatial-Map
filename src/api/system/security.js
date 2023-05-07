import request from '@/utils/request'

// LDAP角色群组
export function ldapRoles() {
  return request({
    url: `${window._CONFIG['apiPathManagerPrefix']}/system/security/ldap/roles`,
    method: 'get'
  })
}
