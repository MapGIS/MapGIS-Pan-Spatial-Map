<template>
  <!-- 等级符号专题图 -->
  <mapgis-popup :showed="showPopup" :coordinates="coordinates" v-if="showPopup">
    <span class="popup-fontsize" v-if="!properties">暂无数据</span>
    <div v-else>
      <div
        v-for="(v, k) in properties"
        :key="`statistic-label-properties-${v}`"
        class="popup-row popup-fontsize"
      >
        <span>{{ `${k}：` }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </mapgis-popup>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { RankSymbolThemeLayer } from '@mapgis/webclient-es6-mapboxgl'
import _debounce from 'lodash/debounce'
import MapboxMixin from '../../mixins/mapbox'

@Component
export default class MapboxStatisticLabel extends Mixins(MapboxMixin) {
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
    return this.subjectData.labelStyle
  }

  // 图表title
  get field() {
    return this.subjectData.field
  }

  /**
   * 获取专题图图层
   */
  getThematicMapLayer() {
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
    this.thematicMapLayer.on('mousemove', _debounce(this.showPopupWin, 200))
    this.thematicMapLayer.on('mouseout', _debounce(this.closePopupWin, 200))
    this.thematicMapLayer.addFeatures(this.dataSet)
  }

  /**
   * 展示信息窗口
   */
  getPopupInfos({ target }: any, { showFields, showFieldsTitle }: any) {
    if (!target.refDataID) return
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
  line-height: 20px;
  margin-top: 8px;
}
.popup-fontsize {
  font-size: 14px;
}
</style>
