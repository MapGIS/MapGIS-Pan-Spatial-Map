<template>
  <!-- 等级符号专题图 -->
  <mapgis-3d-popup :position="position" :showed="true">
    <span v-if="!properties">暂无数据</span>
    <template v-else>
      <row-flex
        v-for="(v, k) in properties"
        :key="`label-properties-${v}`"
        :label="`${k}`"
        :span="[10, 14]"
        class="popup-row"
        >{{ `${v}` }}</row-flex
      >
    </template>
  </mapgis-3d-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import RowFlex from '../../../RowFlex'
import CesiumMinxin from '../../mixins/cesium'

@Component({
  components: {
    RowFlex
  }
})
export default class CesiumStatisticLabel extends Mixins(CesiumMinxin) {
  get labelStyle() {
    return this.subDataConfig.labelStyle
  }

  get field() {
    return this.subDataConfig.field
  }

  /**
   * 获取图层要素数据
   * @param webGlobe
   * @param layer 图层
   * @param features 要素集合
   * @param labelStyle 样式配置
   */
  getGeoJSONFeaturesLayer() {
    if (!this.geojson || !this.geojson.features) return
    this.geojson.features.forEach((feature: GFeature) => {
      const value = feature.properties[this.field]
      const center = utilInstance.getGeoJsonFeatureCenter(feature)
      if (center) {
        const {
          textStyle: { fillColor },
          radius
        } = this.labelStyle
        const { min, max, radiu } = radius[0]
        const plus = max - min
        const maxR = Number(radiu)
        const _radius = value * 150 * (max && plus > 0 ? maxR / plus : maxR)
        const material = this.getColor(fillColor)
        const position = this.getPosition(center[0], center[1])
        this.addEntityToLayer(this.thematicMapLayer, {
          position,
          cylinder: {
            material,
            length: 0.001, // 圆柱体高度
            topRadius: _radius, // 圆柱体顶部半径
            bottomRadius: _radius // 圆柱体底部半径
          }
        })
      }
    })
  }
}
</script>
