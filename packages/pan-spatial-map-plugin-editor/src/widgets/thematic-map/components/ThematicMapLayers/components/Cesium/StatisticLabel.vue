<template>
  <!-- 等级符号专题图 -->
  <mp-3d-marker-pro
    ref="marker3dProRef"
    :marker="selfMarker"
    v-if="selfMarker.fid"
  >
    <template slot="popup" slot-scope="{ properties }">
      <mp-popup-attribute :properties="properties" />
    </template>
  </mp-3d-marker-pro>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Layer, Feature } from '@mapgis/web-app-framework'
import CesiumMixin from '../../mixins/cesium'

@Component
export default class CesiumStatisticLabel extends Mixins(CesiumMixin) {
  // 等级符号图配置项
  // 新旧版本的样式设置对比参照 https://shimowendang.com/docs/gO3oxMwgNmHJddqD
  // 此处只对新版的样式兼容，旧版的每个字段没有具体说明，无法和新版对应起来
  // get options() {
  //   return this.subjectData
  //     ? this.subjectData.themeStyle || this.subjectData.labelStyle
  //     : null
  // }

  get themeOptions() {
    if (!this.subjectData) {
      return {}
    } else {
      const { labelStyle, themeStyle } = this.subjectData
      // 兼容旧配置
      return labelStyle && labelStyle.radius
        ? {
            styleGroups: [
              {
                start: labelStyle.radius.min,
                end: labelStyle.radius.max,
                style: {
                  radius: labelStyle.radius.radiu,
                  color: labelStyle.radius.sectionColor
                }
              }
            ]
          }
        : themeStyle || {}
    }
  }

  /**
   * 获取图层geo要素数据存入实体中
   * @param layer 图层
   */
  addGeoJSONFeaturesToEntity(layer: Layer) {
    if (!this.geojson || !this.geojson.features) return
    this.geojson.features.forEach((feature: Feature.GFeature) => {
      const value = feature.properties[this.field]
      const center = Feature.getGeoJSONFeatureCenter(feature)
      let cylinder
      if (this.themeOptions) {
        console.log(this.themeOptions)
        const { styleGroups } = this.themeOptions
        // debugger
        const styleGroup = Array.isArray(styleGroups)
          ? styleGroups[0]
          : styleGroups
        const { start, style } = styleGroup
        const { radius, color } = style
        let { end } = styleGroup
        if (Array.isArray(styleGroups)) {
          end = styleGroups[styleGroups.length - 1].end
        }
        const plus = end - start
        const maxR = Number(radius)
        const _radius = value * 150 * (end && plus > 0 ? maxR / plus : maxR)
        const material = this.getColor(color)
        cylinder = {
          material,
          length: 0.001, // 圆柱体高度
          topRadius: _radius, // 圆柱体顶部半径
          bottomRadius: _radius // 圆柱体底部半径
        }
      }
      const position = this.getPosition(center[0], center[1])
      this.addEntityToLayer(layer, feature, {
        position,
        cylinder
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
