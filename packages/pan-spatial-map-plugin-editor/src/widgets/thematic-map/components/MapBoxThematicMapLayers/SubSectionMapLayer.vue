<template>
  <!-- 分段专题图图层 -->
  <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, i) in propertiesKeys">
      <div v-show="child" :key="`sub-section-map-layer-popup-properties-${i}`">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import MapboxThematicMapLayersMinxin from '../../mixins/mapbox-thematic-map-layers'

interface IStyle {
  start: number
  end: number
  style: {
    color: string
    strokeColor: string
  }
}

@Component
export default class SubSectionMapLayer extends Mixins(
  MapboxThematicMapLayersMinxin
) {
  properties: Record<string, any> = {}

  coordinates = [{ lng: 0, lat: 0 }]

  // 获取属性keys
  get propertiesKeys() {
    return utilInstance.getJsonTag(this.properties)
  }

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
  async showLayer() {
    if (this.featureQueryParams) {
      this.dataSet = await queryFeaturesInstance.query(this.featureQueryParams)
      this.updateLayer()
    }
  }

  /**
   * 更新图层
   */
  updateLayer() {
    if (!this.dataSet || !this.style) return
    this.remove()
    const _thematicMapLayer = window.Zondy.Map.rangeThemeLayer(
      'ThematicMapLayer',
      {
        map: this.map,
        isHoverAble: true, // 开启 hover 高亮效果
        opacity: 0.8,
        alwaysMapCRS: true
      }
    )
    if (!_thematicMapLayer) return
    const color = this.getColor()
    _thematicMapLayer.style = this.getThemeStyle({
      shadowBlur: 2,
      shadowColor: color,
      fillColor: color,
      strokeColor: color
    })
    const highlightColor = 'rgba(255, 0, 0, 1)'
    _thematicMapLayer.highlightStyle = this.getThemeStyle({
      stroke: true,
      strokeColor: highlightColor,
      fillColor: highlightColor
    })
    _thematicMapLayer.themeField = this.subDataConfig.field
    _thematicMapLayer.styleGroups = this.getSegmentstyle()
    console.log('style', this.getSegmentstyle())
    _thematicMapLayer.id = this.id

    // this.map.addLayer(_thematicMapLayer)
    this.thematicMapLayer = _thematicMapLayer
    this.thematicMapLayer.on('mousemove', this.showInfoWin)
    this.thematicMapLayer.on('mouseout', this.closeInfoWin)
    _thematicMapLayer.addFeatures(this.dataSet)
  }

  /**
   * 展示信息窗口
   */
  showInfoWin({ target }: any) {
    this.closeInfoWin()
    const { showFields, showFieldsTitle } = this.subDataConfig.popup
    if (!target || !target.refDataID || !showFields || !showFields.length) {
      return
    }
    const { attributes, LabelDot } = this.thematicMapLayer.getFeatureById(
      target.refDataID
    )
    const coordinates = [LabelDot.X, LabelDot.Y]
    const properties = showFields.reduce((obj, v: string) => {
      const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
      obj[tag] = attributes[v]
      return obj
    }, {})

    this.coordinates = coordinates
    this.properties = properties
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
