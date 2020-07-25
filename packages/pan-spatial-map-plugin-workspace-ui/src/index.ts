import { VueConstructor } from 'vue'
import {
  MpMapContainer,
  MpWidgetPanel,
  MpMapClear,
  MpZoomIn,
  MpZoomOut,
  MpFullScreen,
  MpLayerManager,
  MpDataCatalog,
  MpLayoutManager,
  MpThemeManager,
  MpResultSet,
  MpResultTab,
  MpMapTypeSwitch,
  MpBaseMapSwitch,
  MpCesiumMarker
} from './components'
import startServer from './utils/server'

const components = [
  MpMapContainer,
  MpWidgetPanel,
  MpMapClear,
  MpZoomIn,
  MpZoomOut,
  MpFullScreen,
  MpLayerManager,
  MpDataCatalog,
  MpLayoutManager,
  MpThemeManager,
  MpResultSet,
  MpResultTab,
  MpMapTypeSwitch,
  MpBaseMapSwitch,
  MpCesiumMarker
]

const install = (Vue: VueConstructor) => {
  components.forEach(component => {
    Vue.component((component as any).options.name, component)
  })

  startServer()
}

export default {
  install
}
