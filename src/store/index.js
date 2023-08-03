import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/router'
import microApps from './modules/micro-app'
import cas from './modules/cas'
import server from './modules/server'
import setting from './modules/setting'

import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    microApps,
    cas,
    server,
    setting
  },
  state: {},
  mutations: {},
  actions: {},
  getters
})
