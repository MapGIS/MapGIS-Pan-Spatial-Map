<template>
  <div class="mp-map-container">
    <mp-web-map-pro
      v-show="mapRender === mapboxRender"
      :document="document"
      v-bind="mapOptions"
    />
    <keep-alive>
      <mp-web-scene-pro
        v-show="mapRender === cesiumRender"
        :document="document"
        :lib-path="cesiumLibPath"
        :plugin-path="cesiumPluginPath"
        v-bind="mapOptions"
      />
    </keep-alive>
  </div>
</template>

<script>
import { AppMixin } from '../../mixins'
import MapRender from '../../utils/map-render'
import MpWebMapPro from '../../../map/packages/map-pro/WebMapPro.vue'
import MpWebScenePro from '../../../map/packages/map-pro/WebScenePro.vue'

export default {
  name: 'MpMapContainer',
  mixins: [AppMixin],
  components: {
    MpWebMapPro,
    MpWebScenePro
  },
  props: {
    cesiumLibPath: {
      type: String
    },
    cesiumPluginPath: {
      type: String
    },
    mapOptions: {
      type: Object
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="less" scoped>
.mp-map-container {
  width: 100%;
  height: 100%;
}
</style>
