<template>
  <!-- 聚合标注专题图 ， 必须有geojson数据才会展示 -->
  <mapgis-mapv-layer
    v-if="geojson && geojson.features && !!geojson.features.length"
    :geojson="geojson"
    :options="options"
    :count-field="field"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxLabel extends Mixins(BaseMixin) {
  get options() {
    return {
      cesium: { postRender: true, postRenderFrame: 0 },
      draw: 'cluster',
      context: '2d',
      fillStyle: 'rgba(255, 50, 0, 1.0)',
      size: 50 / 3 / 2, // 非聚合点的半径
      minSize: 8, // 聚合点最小半径
      maxSize: 31, // 聚合点最大半径
      globalAlpha: 0.8, // 透明度
      clusterRadius: 150, // 聚合像素半径
      maxClusterZoom: 18, // 最大聚合的级别
      maxZoom: 19, // 最大显示级别
      minPoints: 5, // 最少聚合点数，点数多于此值才会被聚合
      extent: 400, // 聚合的细腻程度，越高聚合后点越密集
      label: {
        // 聚合文本样式
        show: true, // 是否显示
        fillStyle: 'white'
      },
      gradient: {
        // 聚合图标渐变色
        0: 'blue',
        0.5: 'yellow',
        1.0: 'rgb(255,0,0)'
      },
      ...(this.subjectData.style || {})
    }
  }
}
</script>
