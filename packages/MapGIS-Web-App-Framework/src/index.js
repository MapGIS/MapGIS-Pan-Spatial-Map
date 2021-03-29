export { AppManager, WidgetManager } from './managers'

export {
  AppMixin,
  WidgetInfoMixin,
  WidgetMixin,
  ThemeMixin,
  ThemeContentMixin,
  PanelMixin,
  MapMixin
} from './mixins'

export { MpMapboxView, MpCesiumView } from './components'

export { WidgetState } from './utils'

import {
  MpAppLoader,
  MpMapContainer,
  MpMapboxView,
  MpCesiumView,
  MpPlacement,
  MpIcon,
  MpMapWidgetButton,
  MpMapWidgetContainer,
  MpWindow,
  MpWindowWrapper,
  MpContentWidgetPanel,
  MpMapWidgetPanel
} from './components'

const components = [
  MpAppLoader,
  MpMapContainer,
  MpMapboxView,
  MpCesiumView,
  MpPlacement,
  MpIcon,
  MpMapWidgetButton,
  MpMapWidgetContainer,
  MpWindow,
  MpWindowWrapper,
  MpContentWidgetPanel,
  MpMapWidgetPanel
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
