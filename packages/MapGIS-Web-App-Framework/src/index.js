import Vue from 'vue'

import gisComs from '@mapgis/webclient-vue-mapboxgl'

Vue.use(gisComs)

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
  Sublayer,
  IGSTileLayer,
  IGSMapImageLayer,
  IGSSublayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  WMTSSublayer,
  TileMatrixSet,
  WMTSStyle,
  OGCWMSLayer,
  WMSSublayer,
  ArcGISTileLayer,
  ArcGISMapImageLayer,
  ArcGISSublayer,
  AMapMercatorEMapLayer
} from './store/document/layer'

export { Document, Map } from './store/document'

export { UUID } from './store/utils'

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
