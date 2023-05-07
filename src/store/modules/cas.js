import { getSystemConfig } from '@/api/system/config'

export default {
  state: {
    info: null
  },
  mutations: {
    SET_CAS_INFO(state, info) {
      state.info = info
    }
  },
  actions: {
    getCasInfo({ commit }) {
      return new Promise(resolve => {
        getSystemConfig().then(res => {
          commit('SET_CAS_INFO', res.data.casConfig)
          resolve()
        })
      })
    }
  }
}
