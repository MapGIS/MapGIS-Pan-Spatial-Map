import {
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery,
  MpPlotManager,
  // MpSymbolLibrary,
  MpPlotAnimation
} from './widgets'

const components = [
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery,
  MpPlotManager,
  // MpSymbolLibrary,
  MpPlotAnimation
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
