// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import './config'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './theme/index.less'
import store from './store/'
import i18n from './locales'
import { VueAxios } from './utils/request'

import bootstrap from './core/bootstrap'
import './core/use' // load components
import './permission' // permission control
import './global.less' // global style
import GmOnemap from '@mapgis/mapgis-pan-spatial-map-widgets-gm'
Vue.use(GmOnemap)
// 全局方法挂载
Vue.config.productionTip = false

// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)

new Vue({
  router,
  store,
  i18n,
  // init localstorage, vuex
  created: bootstrap,
  render: h => h(App)
}).$mount('#main-app')
