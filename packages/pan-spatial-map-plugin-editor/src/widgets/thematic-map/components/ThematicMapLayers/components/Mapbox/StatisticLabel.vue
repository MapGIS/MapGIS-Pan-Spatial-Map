<template>
  <!-- 等级符号专题图 -->
  <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, i) in propertiesKeys">
      <div v-show="child" :key="`statistic-label-layer-popup-properties-${i}`">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { RankSymbolThemeLayer } from '@mapgis/webclient-es6-mapboxgl'
import MapboxMinxin from '../../mixins/mapbox'

@Component
export default class MapboxStatisticLabel extends Mixins(MapboxMinxin) {
  symbolSetting = {
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

  get labelStyle() {
    return this.subDataConfig.labelStyle
  }

  /**
   * 展示图层
   */
  showMapboxLayer() {
    if (!this.labelStyle) return
    this.thematicMapLayer = new RankSymbolThemeLayer(
      'ThematicMapLayer',
      'Circle',
      { calGravity: true }
    )
    if (!this.thematicMapLayer) return
    const {
      textStyle: { fillColor },
      radius
    } = this.labelStyle
    const { min, max } = radius[0]
    this.thematicMapLayer.symbolSetting = {
      fillColor,
      codomain: [min, max],
      ...this.symbolSetting
    }
    this.thematicMapLayer.id = this.id
    this.thematicMapLayer.themeField = this.field
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
    const feature = this.thematicMapLayer.getFeatureById(target.refDataID)
    if (feature) {
      const {
        attributes,
        LabelDot: { X, Y }
      } = feature
      this.coordinates = [X, Y]
      this.properties = showFields.reduce((obj, v: string) => {
        const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
        obj[tag] = attributes[v]
        return obj
      }, {})
    }
  }

  /**
   * 关闭信息窗口
   */
  closeInfoWin() {
    this.coordinates = [0, 0]
    this.properties = {}
  }
}
</script>
