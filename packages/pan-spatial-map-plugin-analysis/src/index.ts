import {
  MpNetworkAnalysis,
  MpFuncWarehouse,
  MpTopologyAnalysis,
  MpSceneRoaming,
  MpVisualAnalysis,
  MpVisibilityAnalysis,
  MpDynamicSectionAnalysis,
  MpTerrainAnalysis,
  MpSkylineAnalysis,
  MpShadowAnalysis,
  MpParticleEffects,
  MpProfileAnalysis,
  MpSceneSetting,
  MpHeightLimitedAnalysis,
  MpViewpointManager
} from './widgets'

const components = [
  MpNetworkAnalysis,
  MpFuncWarehouse,
  MpTopologyAnalysis,
  MpSceneRoaming,
  MpVisualAnalysis,
  MpVisibilityAnalysis,
  MpDynamicSectionAnalysis,
  MpTerrainAnalysis,
  MpSkylineAnalysis,
  MpShadowAnalysis,
  MpParticleEffects,
  MpProfileAnalysis,
  MpSceneSetting,
  MpHeightLimitedAnalysis,
  MpViewpointManager
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
