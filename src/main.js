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

// import {
//   WidgetMixin,
//   WidgetInfoMixin,
//   PanelMixin,
//   ThemeContentMixin,
//   AppMixin,
//   ThemeMixin
// } from '@mapgis/web-app-framework'
// import { MapgisEventBusOneMapMixin, events } from '@mapgis/webclient-vue-eventbus'

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
window.MapgisApplicationVueRuntime = Vue
window.MapgisApplicationVuexRuntime = store
// window.MapgisEventBusOneMapMixin = MapgisEventBusOneMapMixin
// window.events = events

// window.WidgetMixin = WidgetMixin
// window.WidgetInfoMixin = WidgetInfoMixin
// window.PanelMixin = PanelMixin
// window.ThemeContentMixin = ThemeContentMixin
// window.AppMixin = AppMixin
// window.ThemeMixin = ThemeMixin
