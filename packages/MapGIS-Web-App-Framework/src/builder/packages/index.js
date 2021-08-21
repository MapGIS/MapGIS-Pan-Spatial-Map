import MpAppLoader from './app-loader/AppLoader.vue'
import MpMapContainer from './map-container/MapContainer.vue'
import MpMapWidgetButton from './map-widget-indicator/MapWidgetButton.vue'
import MpContentWidgetPanel from './map-panel/ContentWidgetPanel.vue'
import MpMapWidgetPanel from './map-panel/MapWidgetPanel.vue'
import MpExhibitonPanel from './exhibition-panel/ExhibitionPanel.vue'
import MpWindowWrapper from './window-wrapper/WindowWrapper.vue'

const components = [
  MpAppLoader,
  MpMapContainer,
  MpMapWidgetButton,
  MpContentWidgetPanel,
  MpMapWidgetPanel,
  MpExhibitonPanel,
  MpWindowWrapper
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
