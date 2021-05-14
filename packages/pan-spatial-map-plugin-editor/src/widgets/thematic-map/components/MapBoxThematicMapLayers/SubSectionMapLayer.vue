<template>
  <!-- 分段专题图图层 -->
  <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, n) in propertiesKeys">
      <div v-show="child" :key="'sub-section-map-layer-popup-properties-' + n">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import {
  queryFeaturesInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'

interface IStyle {
  start: number
  end: number
  style: {
    color: string
    strokeColor: string
  }
}

@Component
export default class SubSectionMapLayer extends Vue {
  id = UUID.uuid()

  dataSet: any = null

  properties: Record<string, any> = {}

  coordinates: number[] = [0, 0]

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
   * 展示图层
   */
  async showLayer() {
    if (this.featureParams) {
      this.dataSet = await queryFeaturesInstance.query(this.featureParams)
      this.updateLayer()
    }
  }

  /**
   * 更新图层
   */
  updateLayer() {
    if (!this.dataSet || !this.style) return
    this.remove()
    this.thematicMapLayer = Zondy.Map.rangeThemeLayer('ThematicMapLayer', {
      layerOption: {
        isHoverAble: true,
        alwaysMapCRS: true
      }
    })
    if (!this.thematicMapLayer) return
    const _thematicMapLayer = {}
    const color = this.getColor()
    _thematicMapLayer.style = new Zondy.Map.ThemeStyle({
      shadowBlur: 2,
      shadowColor: color,
      fillColor: color,
      strokeColor: color
    })
    const highlightColor = 'rgba(255, 0, 0, 1)'
    _thematicMapLayer.highlightStyle = new Zondy.Map.ThemeStyle({
      stroke: true,
      strokeColor: highlightColor,
      fillColor: highlightColor
    })
    _thematicMapLayer.themeField = this.subDataConfig.field
    _thematicMapLayer.styleGroups = this.getSegmentstyle()
    _thematicMapLayer.id = this.id
    _thematicMapLayer.addFeatures(this.dataSet)
    this.map.addLayer(_thematicMapLayer)
    this.thematicMapLayer = _thematicMapLayer
    this.thematicMapLayer.on('mousemove', this.showInfoWin)
    this.thematicMapLayer.on('mouseout', this.closeInfoWin)
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
    const coord = [LabelDot.X, LabelDot.Y]
    const attrs = showFields.reduce((obj, v: string) => {
      const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
      obj[tag] = attributes[v]
      return obj
    }, {})

    this.coordinates = coord
    this.properties = attrs
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
