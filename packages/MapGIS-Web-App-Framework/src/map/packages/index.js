import MpWebMapPro from './map-pro/WebMapPro.vue'
import MpWebScenePro from './map-pro/WebScenePro.vue'

const components = [MpWebMapPro, MpWebScenePro]

const install = Vue => {
  components.forEach(component => {
    Vue.component(
      (component.options && component.options.name) || component.name,
      component
    )
  })
}

export default {
  install
}
