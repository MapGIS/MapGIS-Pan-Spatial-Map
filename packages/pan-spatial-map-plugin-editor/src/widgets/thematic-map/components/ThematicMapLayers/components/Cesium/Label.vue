<template>
  <!-- 聚合标注专题图， 必须有geojson数据才会展示 -->
  <mapgis-3d-mapv-layer
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
export default class CesiumLabel extends Mixins(BaseMixin) {
  // 聚合图配置项
  // 新旧版本的样式设置对比参照 https://shimowendang.com/docs/gO3oxMwgNmHJddqD
  // 此处只对新版的样式兼容，旧版的每个字段没有具体说明，无法和新版对应起来
  get options() {
    return {
      cesium: { postRender: true, postRenderFrame: 0 },
      draw: 'cluster',
      context: '2d',
      ...(this.subjectData?.themeStyle || {})
    }
  }
}
</script>
