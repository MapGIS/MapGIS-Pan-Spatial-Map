import {
  MpNetworkAnalysis,
  MpFuncWarehouse,
  MpTopologyAnalysis,
  MpSceneRoaming,
  MpVisualAnalysis,
  MpVisibilityAnalysis,
  MpDynamicSectionAnalysis,
  MpMapStory,
  MpTerrainAnalysis,
  MpSkylineAnalysis,
  MpShadowAnalysis,
  MpParticleEffects,
  MpProfileAnalysis,
  MpSceneSetting,
  MpHeightLimitedAnalysis,
  MpViewpointManager,
  MpPondingSimulation,
  MpVideo
} from './widgets'

const components = [
  MpNetworkAnalysis,
  MpFuncWarehouse,
  MpTopologyAnalysis,
  MpSceneRoaming,
  MpVisualAnalysis,
  MpVisibilityAnalysis,
  MpDynamicSectionAnalysis,
  MpMapStory,
  MpTerrainAnalysis,
  MpSkylineAnalysis,
  MpShadowAnalysis,
  MpParticleEffects,
  MpProfileAnalysis,
  MpSceneSetting,
  MpHeightLimitedAnalysis,
  MpViewpointManager,
  MpPondingSimulation,
  MpVideo
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
