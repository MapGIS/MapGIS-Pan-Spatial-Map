import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/async-router'
import cas from './modules/cas'
import server from './modules/server'

import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    cas,
    server
  },
  state: {},
  mutations: {},
  actions: {},
  getters
})
