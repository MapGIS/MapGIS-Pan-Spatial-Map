<template>
  <!-- 分段专题图图层 -->
  <mapgis-popup :showed="showPopup" :coordinates="coordinates" v-if="showPopup">
    <span class="popup-fontsize" v-if="!properties">暂无数据</span>
    <div v-else>
      <div
        v-for="(v, k) in properties"
        :key="`sub-section-map-properties-${v}`"
        class="popup-row popup-fontsize"
      >
        <span>{{ `${k}：` }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </mapgis-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { RangeThemeLayer, ThemeStyle } from '@mapgis/webclient-es6-mapboxgl'
import { ColorUtil } from '@mapgis/web-app-framework'
import _debounce from 'lodash/debounce'
import MapboxMixin from '../../mixins/mapbox'

interface IColor {
  start: number
  end: number
  style: {
    color: string
    strokeColor: string
  }
}

interface ISectionColor {
  min: number
  max: number
  sectionColor: string
}

@Component
export default class MapboxSubSectionMap extends Mixins(MapboxMixin) {
  // 样式
  get colors() {
    return this.subjectData?.color
  }

  // 图表title
  get field() {
    return this.subjectData.field
  }

  /**
   * 获取样式
   */
  getStyleGroups() {
    return this.colors.map<IColor>(
      ({ sectionColor, min, max }: ISectionColor) => {
        const color = ColorUtil.rgbToHex(sectionColor)
        return {
          start: Number(min),
          end: Number(max),
          style: {
            color,
            strokeColor: color
          }
        }
      }
    )
  }

  /**
   * 获取图表样式
   * @param styleProps
   */
  getThemeStyle(styleProps: any) {
    return new ThemeStyle(styleProps)
  }

  /**
   * 获取专题图图层
   */
  getThematicMapLayer() {
    if (!this.colors) return
    const _thematicMapLayer = new RangeThemeLayer('ThematicMapLayer', {
      map: this.map,
      opacity: 0.8,
      isHoverAble: true,
      alwaysMapCRS: true
    })
    if (!_thematicMapLayer) return
    _thematicMapLayer.id = this.id
    _thematicMapLayer.themeField = this.field
    _thematicMapLayer.styleGroups = this.getStyleGroups()
    const color =
      this.colors && this.colors.length
        ? this.colors[0].sectionColor
        : '#FFFFFF'
    _thematicMapLayer.style = this.getThemeStyle({
      shadowBlur: 2,
      shadowColor: color,
      fillColor: color,
      strokeColor: color
    })
    _thematicMapLayer.highlightStyle = this.getThemeStyle({
      stroke: true,
      strokeWidth: 4,
      fillOpacity: 0.8,
      strokeColor: 'blue',
      fillColor: '#00EEEE'
    })
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
