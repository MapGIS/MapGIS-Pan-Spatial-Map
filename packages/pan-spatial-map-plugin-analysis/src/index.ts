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
  MpBufferAnalysis,
  MpOverlayAnalysis,
  MpProjectorManager,
  MpCityGrow,
  MpStratifiedHousehold,
  MpBimComponent,
  MpBuildingGrow,
  MpOverlayManager,
  MpModelFlatten,
  MpOutputImage,
  MpRotate
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
  MpBufferAnalysis,
  MpOverlayAnalysis,
  MpProjectorManager,
  MpCityGrow,
  MpStratifiedHousehold,
  MpBimComponent,
  MpBuildingGrow,
  MpOverlayManager,
  MpModelFlatten,
  MpOutputImage,
  MpRotate
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
