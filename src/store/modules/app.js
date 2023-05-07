import storage from 'store'
import { TOGGLE_MOBILE_TYPE, APP_LANGUAGE } from '@/store/mutation-types'
import { loadLanguageAsync } from '@/locales'

const app = {
  state: {
    isMobile: false,
    lang: 'zh-CN',
    _antLocale: {}
  },
  mutations: {
    [TOGGLE_MOBILE_TYPE]: (state, isMobile) => {
      state.isMobile = isMobile
    },
    [APP_LANGUAGE]: (state, lang, antd = {}) => {
      state.lang = lang
      state._antLocale = antd
      storage.set(APP_LANGUAGE, lang)
    }
  },
  actions: {
    setLang({ commit }, lang) {
      return new Promise((resolve, reject) => {
        commit(APP_LANGUAGE, lang)
        loadLanguageAsync(lang)
          .then(() => {
            resolve()
          })
          .catch(e => {
            reject(e)
          })
      })
    }
  }
}

export default app
