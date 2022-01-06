import Cookie from 'js-cookie'

// 兼容Web-App-FrameWork中解构axios返回的data数据
const respCommon = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    if (
      response.config.url === 'http://localhost:8015/auth/login' ||
      response.config.url === 'http://localhost:8015/auth/app-info'
    ) {
      return response
    } else {
      return response.data
    }
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    return Promise.reject(error)
  },
}

// 401拦截
const resp401 = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    const { message, router } = options
    if (response.code === 401) {
      message.error('无此权限')
      router.push('/login')
    }
    return response
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const { message, router } = options
    const { response } = error
    if (response.status === 401) {
      message.error('无此权限')
      router.push('/login')
    }
    return Promise.reject(error)
  }
}

const resp403 = {
  onFulfilled(response, options) {
    const { message } = options
    if (response.code === 403) {
      message.error('请求被拒绝')
    }
    return response
  },
  onRejected(error, options) {
    const { message } = options
    const { response } = error
    if (response.status === 403) {
      message.error('请求被拒绝')
    }
    return Promise.reject(error)
  }
}

const reqCommon = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    const { message } = options
    const { url, xsrfCookieName } = config
    if (Object.prototype.toString.call(url) === '[object Object]') {
      if (
        url.url.indexOf('login') === -1 &&
        xsrfCookieName &&
        !Cookie.get(xsrfCookieName)
      ) {
        message.warning('认证 token 已过期，请重新登录')
      }
      config.url = `${process.env.VUE_APP_API_BASE_URL}${url.url}`
      return config
    }
    if (
      url.indexOf('login') === -1 &&
      xsrfCookieName &&
      !Cookie.get(xsrfCookieName)
    ) {
      message.warning('认证 token 已过期，请重新登录')
    }
    return config
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const { message } = options
    message.error(error.message)
    return Promise.reject(error)
  }
}

export default {
  request: [reqCommon], // 请求拦截
  response: [resp401, resp403, respCommon] // 响应拦截
}
