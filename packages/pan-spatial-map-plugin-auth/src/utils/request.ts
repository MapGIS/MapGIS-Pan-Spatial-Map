import axios from 'axios'
import { Store } from 'vuex'

export const configService = (
  store: Store<unknown>,
  proxyTable: Record<string, string> = {}
) => {
  // Request interceptors
  axios.interceptors.request.use(config => {
    if (config.url) {
      let { url } = config
      Object.entries(proxyTable).forEach(([key, value]) => {
        const reg = new RegExp(key)
        if (reg.test(url)) {
          url = url.replace(reg, value)
        }
      })
      config.url = url
    }

    return config
  })
}
