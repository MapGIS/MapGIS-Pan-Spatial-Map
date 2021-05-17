<template>
  <!-- 等级符号专题图 -->
  <div></div>
  <!-- <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, i) in propertiesKeys">
      <div v-show="child" :key="`sub-section-map-layer-popup-properties-${i}`">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup> -->
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import MapboxThematicMapLayersMinxin from '../../mixins/mapbox-thematic-map-layers'

@Component
export default class StatisticLabelLayer extends Mixins(
  MapboxThematicMapLayersMinxin
) {
  get style() {
    return this.subDataConfig.labelStyle
  }

  get symbolSetting() {
    return {
      maxR: 25,
      minR: 5,
      circleStyle: {
        fillOpacity: 0.8
      },
      circleHoverStyle: {
        fillOpacity: 1,
        stroke: true,
        strokeWidth: 4,
        strokeColor: 'blue'
      }
    }
  }

  /**
   * 展示图层
   */
  showLayer() {
    this.updateLayer()
  }

  /**
   * 更新图层
   */
  updateLayer() {
    if (!this.dataSet || !this.style) return
    this.removeLayer()
    const _thematicMapLayer = window.Zondy.Map.rankSymbolThemeLayer(
      'ThematicMapLayer',
      'Circle',
      { calGravity: true }
    )
    if (!_thematicMapLayer) return
    const {
      textStyle: { fillColor },
      radius
    } = this.style
    const { min, max } = radius[0]
    this.thematicMapLayer = {
      ..._thematicMapLayer,
      id: this.id,
      themeField: this.field,
      symbolSetting: {
        fillColor,
        codomain: [min, max],
        ...this.symbolSetting
      }
    }
    this.thematicMapLayer.on('mousemove', this.showInfoWin)
    this.thematicMapLayer.on('mouseout', this.closeInfoWin)
    this.thematicMapLayer.addFeatures(this.dataSet)
  }

  /**
   * 展示信息窗口
   */
  showInfoWin({ target }: any) {
    this.closeInfoWin()
    const { showFields, showFieldsTitle } = this.popupConfig
    if (!target || !target.refDataID || !showFields || !showFields.length) {
      return
    }
    const {
      attributes,
      LabelDot: { X, Y }
    } = this.thematicMapLayer.getFeatureById(target.refDataID)
    this.coordinates = [X, Y]
    this.properties = showFields.reduce((obj, v: string) => {
      const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
      obj[tag] = attributes[v]
      return obj
    }, {})
  }

  /**
   * 关闭信息窗口
   */
  closeInfoWin() {
    this.coordinates = []
    this.properties = {}
  }
}
</script>
<style lang="less" scoped></style>
