<template>
  <!-- 分段专题图图层 -->
  <mapgis-popup
    anchor="top"
    :coordinates="coordinates"
    :offset="[0, 0]"
    :showed="showedPopup"
  >
    <div v-for="(v, k) in properties" :key="`sub-section-map-properties-${k}`">
      {{ k }} : {{ v }}
    </div>
  </mapgis-popup>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import {
  QueryFeatureStruct,
  QueryParameter,
  QueryDocFeature,
  RangeThemeLayer,
  ThemeStyle
} from '@mapgis/webclient-es6-mapboxgl'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import MapboxMinxin from '../../mixins/mapbox'

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
export default class MapboxSubSectionMap extends Mixins(MapboxMinxin) {
  // 样式
  get colors() {
    return this.subDataConfig?.color
  }

  // 图表title
  get field() {
    return this.subDataConfig.field
  }

  /**
   * 获取样式
   */
  getStyleGroups() {
    return this.colors.map<IColor>(
      ({ sectionColor, min, max }: ISectionColor) => {
        const color = utilInstance.colorRGBtoHex(sectionColor)
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
   * 展示图层
   */
  showMapboxLayer() {
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
    this.thematicMapLayer.on('mousemove', this.showInfoWin)
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
