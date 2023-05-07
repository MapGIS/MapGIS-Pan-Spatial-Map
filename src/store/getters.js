const getters = {
  isMobile: state => state.app.isMobile,
  lang: state => state.app.lang,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  nickname: state => state.user.name,
  welcome: state => state.user.welcome,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  userInfo: state => state.user.info,
  addRouters: state => state.permission.addRouters,
  casInfo: state => state.cas.info,
  systemConfig: state => state.server.systemConfig,
  baseConfig: state => state.server.baseConfig,
  domTitle: state => {
    if (state.server.baseConfig && state.server.baseConfig.title) {
      return state.server.baseConfig.title
    }
    return window._CONFIG['productTitle']
  }
}

export default getters
