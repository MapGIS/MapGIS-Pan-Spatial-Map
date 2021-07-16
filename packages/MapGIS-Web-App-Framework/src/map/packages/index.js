import MpWebMapPro from './map-pro/WebMapPro.vue'
import MpWebScenePro from './map-pro/WebScenePro.vue'
import MpDrawPro from './draw-pro/DrawPro.vue'
import Mp3dDrawPro from './draw-pro/3dDrawPro.vue'
import MpMarkerPro from './marker-pro/MarkerPro.vue'
import Mp3dMarkerPro from './marker-pro/3dMarkerPro.vue'
import MpMarkerSetPro from './marker-pro/MarkerSetPro.vue'
import Mp3dMarkerSetPro from './marker-pro/3dMarkerSetPro.vue'
import MpMarkerPlotting from './marker-plotting/MarkerPlotting.vue'
import Mp3dMarkerPlotting from './marker-plotting/3dMarkerPlotting.vue'

export { default as MarkerPlottingMixin } from './marker-plotting/mixins/marker-plotting'

const components = [
  MpWebMapPro,
  MpWebScenePro,
  MpDrawPro,
  Mp3dDrawPro,
  MpMarkerPro,
  Mp3dMarkerPro,
  MpMarkerSetPro,
  Mp3dMarkerSetPro,
  MpMarkerPlotting,
  Mp3dMarkerPlotting
]

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
