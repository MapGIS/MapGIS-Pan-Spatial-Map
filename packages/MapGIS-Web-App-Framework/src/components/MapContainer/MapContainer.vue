<template>
  <div class="mp-map-container">
    <mp-mapbox-view
      v-show="mapRender === mapboxRender"
      :page-height="pageHeight"
      :document="document"
      :map-style="style"
      v-bind="mapOptions"
    />
    <keep-alive>
      <mp-cesium-view
        v-show="mapRender === cesiumRender"
        :page-height="pageHeight"
        :document="document"
        :map-style="style"
        :lib-path="cesiumLibPath"
        :plugin-path="cesiumPluginPath"
        v-bind="mapOptions"
      />
    </keep-alive>
  </div>
</template>

<script>
import DefaultStyle from '../../assets/style/default-style.json'
import { AppMixin } from '../../mixins'
import MapRender from '../../utils/map-render'
import MpMapboxView from './MapboxView'
import MpCesiumView from './CesiumView'

export default {
  name: 'MpMapContainer',
  mixins: [AppMixin],
  components: {
    MpMapboxView,
    MpCesiumView
  },
  props: {
    pageHeight: String,
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
    return {
      style: DefaultStyle
    }
  }
}
</script>

<style lang="less" scoped>
.mp-map-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
