import {
  MpZoomIn,
  MpZoomOut,
  MpMapModePicker,
  MpAbout,
  MpScalebar,
  MpDataCatalog,
  MpLayerList,
  MpAttributeTable,
  MpBasemapManager,
  MpLegend
} from './widgets'

const components = [
  MpZoomIn,
  MpZoomOut,
  MpMapModePicker,
  MpAbout,
  MpScalebar,
  MpDataCatalog,
  MpLayerList,
  MpAttributeTable,
  MpBasemapManager,
  MpLegend
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
