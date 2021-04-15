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

export {
  Layer,
  LayerType,
  LoadStatus,
  LOD,
  TileInfo,
  TileLayer,
  MapImageLayer,
  IGSTileLayer,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  OGCWMSLayer,
  WMTSSublayer,
  Sublayer
} from './store/document/layer'

export { Document, Map } from './store/document'

import {
  MpAppLoader,
  MpMapContainer,
  MpMapboxView,
  MpCesiumView,
  MpPlacement,
  MpIcon,
  MpMapWidgetButton,
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
  MpWindow,
  MpWindowWrapper,
  MpContentWidgetPanel,
  MpMapWidgetPanel
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
