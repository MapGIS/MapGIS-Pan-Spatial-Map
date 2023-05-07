import { getSystemConfig, getAppBaseConfig } from '@/api/system/config'

export default {
  state: {
    // systemConfig: {
    //   casConfig: {},
    //   devPlatform: 'Java',
    //   fullVersion: '10.6.0.10-win-x86_64',
    //   javaVersion: '1.8.0_162',
    //   loginConfig: {},
    //   oauthConfig: {},
    //   osArch: 'amd64',
    //   osName: 'Windows 10',
    //   osUsername: null,
    //   osVersion: '10.0',
    //   registerConfig: {},
    //   serviceArch: 'SingleService',
    //   version: '10.6.0.10'
    // }
    systemConfig: null,
    // baseConfig: {
    //   logo: '',
    //   title: '',
    //   subtitle: '',
    //   copyright: ''
    // }
    baseConfig: null
  },
  mutations: {
    SET_SYSTEM_CONFIG(state, config) {
      state.systemConfig = config
    },
    SET_BASE_CONFIG(state, config) {
      state.baseConfig = config
    }
  },
  actions: {
    getSystemConfig({ commit }) {
      return new Promise(resolve => {
        getSystemConfig().then(res => {
          commit('SET_SYSTEM_CONFIG', res.data)
          resolve()
        })
      })
    },
    getBaseConfig({ commit }) {
      return new Promise(resolve => {
        getAppBaseConfig().then(res => {
          commit('SET_BASE_CONFIG', res.data)
          resolve()
        })
      })
    }
  }
}
