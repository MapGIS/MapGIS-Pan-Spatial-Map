import { getConfigValueByKey } from '@/api/system/config'

export default {
  state: {
    apps: [],
    mounting: false
  },
  mutations: {
    SET_APPS(state, apps) {
      state.apps = apps
    },
    TOGGLE_MOUNTING(state, mounting) {
      state.mounting = mounting
    }
  },
  actions: {
    generateMicroApps({ commit }) {
      return new Promise(resolve => {
        getConfigValueByKey('app.extended.microApp').then(res => {
          commit('SET_APPS', JSON.parse(res.data || '{}').microAppList || [])
          resolve()
        })
      })
    },
    beforeMount({ commit }) {
      commit('TOGGLE_MOUNTING', true)
    },
    afterUnmount({ commit }) {
      commit('TOGGLE_MOUNTING', false)
    }
  }
}
