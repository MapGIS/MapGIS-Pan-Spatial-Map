import {
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery
} from './widgets'

const components = [
  MpMeasurement,
  MpMarkerManager,
  MpAddData,
  MpComprehensiveQuery,
  MpThematicMap,
  MpVectorTileCarto,
  MpFeatureQuery
]

const install = Vue => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
