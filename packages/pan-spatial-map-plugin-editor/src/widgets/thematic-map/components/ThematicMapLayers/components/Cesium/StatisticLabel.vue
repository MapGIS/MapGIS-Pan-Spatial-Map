<template>
  <!-- 等级符号专题图 -->
  <mapgis-3d-popup
    :position="popupPosition"
    :showed="showPopup"
    :destroyOnClose="true"
  >
    <span class="popup-fontsize" v-if="!popupProperties">暂无数据</span>
    <div v-else>
      <div
        v-for="(v, k) in popupProperties"
        :key="`statistic-label-properties-${v}`"
        class="popup-row popup-fontsize"
      >
        <span>{{ `${k}：` }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </mapgis-3d-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import { GFeature, utilInstance } from '@mapgis/pan-spatial-map-store'
import CesiumMinxin from '../../mixins/cesium'

@Component
export default class CesiumStatisticLabel extends Mixins(CesiumMinxin) {
  get labelStyle() {
    return this.subDataConfig.labelStyle
  }

  get field() {
    return this.subDataConfig.field
  }

  /**
   * 获取图层geo要素数据存入实体中
   * @param layer 图层
   */
  addGeoJSONFeaturesToEntity(layer: Layer) {
    if (!this.geojson || !this.geojson.features) return
    this.geojson.features.forEach((feature: GFeature) => {
      const value = feature.properties[this.field]
      const center = utilInstance.getGeoJsonFeatureCenter(feature)
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
      this.addEntityToLayer(layer, feature, {
        position,
        cylinder: {
          material,
          length: 0.001, // 圆柱体高度
          topRadius: _radius, // 圆柱体顶部半径
          bottomRadius: _radius // 圆柱体底部半径
        }
      })
    })
  }
}
</script>
<style lang="less" scoped>
.popup-row {
  line-height: 20px;
  margin-top: 8px;
}
.popup-fontsize {
  font-size: 12px;
}
</style>
