import { VueConstructor } from 'vue'

import { default as MpAbout } from './About/About.vue'
import { default as MpLogout } from './Logout/Logout'

const components = [MpAbout, MpLogout]

const install = (Vue: VueConstructor) => {
  components.forEach(component => {
    Vue.component((component as any).options.name, component)
  })
}

export default {
  install
}
