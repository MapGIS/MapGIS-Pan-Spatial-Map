<template>
  <!-- 分段专题图图层 -->
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
import { Mixins, Component } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import MapboxMinxin from '../../mixins/mapbox'

interface IStyle {
  start: number
  end: number
  style: {
    color: string
    strokeColor: string
  }
}

@Component
export default class MapboxSubSectionMap extends Mixins(
  MapboxMinxin
) {
  // 样式
  get style() {
    return this.subDataConfig?.color
  }

  /**
   * 获取颜色
   * @param sectionColor
   */
  getColor(sectionColor?: string) {
    return sectionColor
      ? utilInstance.colorRGBtoHex(sectionColor)
      : this.style && this.style.length
      ? this.style[0].sectionColor
      : '#FFFFFF'
  }

  /**
   * 获取样式
   */
  getSegmentstyle() {
    return this.style.map<IStyle>(({ sectionColor, min, max }) => {
      const color = this.getColor(sectionColor)
      return {
        start: Number(min),
        end: Number(max),
        style: {
          color,
          strokeColor: color
        }
      }
    })
  }

  /**
   * 获取图表样式
   * @param styleProps
   */
  getThemeStyle(styleProps: any) {
    return new window.Zondy.Map.ThemeStyle(styleProps)
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
    const _thematicMapLayer = window.Zondy.Map.rangeThemeLayer(
      'ThematicMapLayer',
      {
        map: this.map,
        opacity: 0.8,
        isHoverAble: true,
        alwaysMapCRS: true
      }
    )
    if (!_thematicMapLayer) return
    const color = this.getColor()
    const highlightColor = 'rgba(255, 0, 0, 1)'
    _thematicMapLayer.id = this.id
    _thematicMapLayer.themeField = this.field
    _thematicMapLayer.styleGroups = this.getSegmentstyle()
    _thematicMapLayer.style = this.getThemeStyle({
      shadowBlur: 2,
      shadowColor: color,
      fillColor: color,
      strokeColor: color
    })
    _thematicMapLayer.highlightStyle = this.getThemeStyle({
      stroke: true,
      strokeColor: highlightColor,
      fillColor: highlightColor
    })
    this.thematicMapLayer = _thematicMapLayer
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
    this.properties = {}
    this.coordinates = []
  }
}
</script>
<style lang="less" scoped></style>
