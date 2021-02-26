import MpDrawer from './tool/Drawer.vue'
import MpSetting from './setting/Setting.vue'

const components = [MpDrawer, MpSetting]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
