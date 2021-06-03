<template>
  <!-- 等级符号专题图 -->
  <mapgis-popup :coordinates="coordinates" :showed="true" v-if="showPopup">
    <span v-if="!properties">暂无数据</span>
    <template v-else>
      <row-flex
        v-for="(v, k) in properties"
        :key="`statistic-label-properties-${v}`"
        :label="k"
        :span="[12, 12]"
        class="popup-row"
        >{{ v }}</row-flex
      >
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { RankSymbolThemeLayer } from '@mapgis/webclient-es6-mapboxgl'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import RowFlex from '../../../RowFlex'
import MapboxMinxin from '../../mixins/mapbox'

@Component({
  components: {
    RowFlex
  }
})
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

  // 图表字段样式
  get labelStyle() {
    return this.subDataConfig.labelStyle
  }

  // 图表title
  get field() {
    return this.subDataConfig.field
  }

  /**
   * 展示图层
   */
  showMapboxLayer() {
    if (!this.labelStyle) return
    const _thematicMapLayer = new RankSymbolThemeLayer(
      'ThematicMapLayer',
      'Circle',
      {
        calGravity: true,
        map: this.map
      }
    )
    if (!_thematicMapLayer) return
    const {
      textStyle: { fillColor },
      radius
    } = this.labelStyle
    const { min, max } = radius[0]
    _thematicMapLayer.symbolSetting = {
      fillColor,
      codomain: [min, max],
      ...this.symbolSetting
    }
    _thematicMapLayer.themeField = this.field
    this.thematicMapLayer = _thematicMapLayer
    this.thematicMapLayer.on(
      'mousemove',
      utilInstance.debounce(this.showInfoWin, 200)
    )
    this.thematicMapLayer.on('mouseout', this.closeInfoWin)
    this.thematicMapLayer.addFeatures(this.dataSet)
  }

  /**
   * 展示信息窗口
   */
  showMapboxInfoWin({ target }: any) {
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
}
</script>
<style lang="less" scoped>
.popup-row {
  min-width: 150px;
}
</style>
