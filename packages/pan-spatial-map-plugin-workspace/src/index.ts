import {
  MpZoom,
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
  MpZoom,
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
    Vue.component(component.name || component.options.name, component)
  })
}

export default {
  install
}
