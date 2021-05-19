<template>
  <div class="mapbox-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component
        :is="t"
        :key="t"
        :config="config"
        :dataSet="dataSet"
        v-if="subjectType === t"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  thematicMapInstance,
  subjectTypes
} from '@mapgis/pan-spatial-map-store'
import mapboxLayers from './components/Mapbox'
import CesiumLayers from './components/Cesium'

// 均使用的v10.5.3.10的版本
// 方式一: 同步加载mapboxgl.js
window.mapboxgl = require('../../../../../libs/zondyclient/mapbox-gl.js')
// import mapboxgl from '../../../../../libs/zondyclient/mapbox-gl.js'
// window.mapboxgl = mapboxgl

// 同步或异步加载mapboxgl-plugin.js
require('../../../../../libs/zondyclient/webclient-mapboxgl-plugin.js')
// import('../../../../../libs/zondyclient/webclient-mapboxgl-plugin.js')

// 方式二: 异步加载mapboxgl.js, 如果其他文件读取mapboxgl变量可能为undefined
// import('../../../../../libs/zondyclient/mapbox-gl.js').then(({ default: mapboxgl }) => {
//   window.mapboxgl = mapboxgl
//   import('../../../../../libs/zondyclient/webclient-mapboxgl-plugin.js')
//   require('../../../../../libs/zondyclient/webclient-mapboxgl-plugin.js')
// })

@Component({
  components: {
    ...mapboxLayers,
    ...CesiumLayers
  }
})
export default class ThematicMapLayers extends Mixins(AppMixin) {
  
  get prefix() {
    return this.is2DMapMode? 'Mapbox': 'Cesium'
  }

  // 专题配置
  get config() {
    return thematicMapInstance.getSelectedConfig
  }

  // 专题配置年度
  get dataSet() {
    return thematicMapInstance.getPageDataSet
  }

  // 获取专题类别
  get subjectType() {
    return this.config ? `${this.prefix}${this.config.type}` : ''
  }

  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypes.map(({value}) => `${this.prefix}${value}`)
  }

}
</script>
<style lang="less" scoped></style>
