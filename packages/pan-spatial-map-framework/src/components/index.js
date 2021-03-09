import Drawer from './tool/Drawer.vue'
import Setting from './setting/Setting.vue'

const components = [Drawer, Setting]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
