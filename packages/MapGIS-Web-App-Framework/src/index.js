import Vue from 'vue'

import VueMapbox from '@mapgis/webclient-vue-mapboxgl'
import VueCesium from '@mapgis/webclient-vue-cesium'

Vue.use(VueMapbox, {})
Vue.use(VueCesium, {})

export {
  AppManager,
  WidgetManager,
  WidgetState,
  AppMixin,
  WidgetInfoMixin,
  WidgetMixin,
  ThemeMixin,
  ThemeContentMixin,
  PanelMixin,
  MapMixin
} from './builder'

export {
  UUID,
  ObjectTool,
  CoordinateTransformation,
  Document,
  Map,
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
  AMapMercatorEMapLayer,
  AMapMercatorSatelliteMapLayer,
  AMapMercatorSatelliteAnnMapLayer,
  VectorTileLayer,
  IGSSceneLayer,
  IGSSceneSublayerRenderType,
  Rectangle3D,
  Point3D
} from './model'

import { CommonComponents } from './common'
import { MapComponents } from './map'
import { BuilderComponents } from './builder'

const install = Vue => {
  Vue.use(CommonComponents)
  Vue.use(MapComponents)
  Vue.use(BuilderComponents)
}

export default {
  install
}
