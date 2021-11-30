import {
  MpAttributeTable,
  MpAttributeTableList,
  MpTreeLayer
} from './components'

import {
  MpZoom,
  MpMapModePicker,
  MpAbout,
  MpScalebar,
  MpDataCatalog,
  MpLayerList,
  MpBasemapManager,
  MpLegend,
  MpLayerListContainer
} from './widgets'

const components = [
  MpZoom,
  MpMapModePicker,
  MpAbout,
  MpScalebar,
  MpDataCatalog,
  MpLayerList,
  MpAttributeTable,
  MpAttributeTableList,
  MpBasemapManager,
  MpLegend,
  MpTreeLayer,
  MpLayerListContainer
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
