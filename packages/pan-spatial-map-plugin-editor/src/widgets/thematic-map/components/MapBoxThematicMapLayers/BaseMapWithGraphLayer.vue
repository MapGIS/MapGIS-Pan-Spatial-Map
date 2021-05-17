<template>
  <!-- 统计专题图 -->
  <mapgis-popup :coordinates="coordinates" :showed="true">
    <template v-for="(child, n) in propertiesKeys">
      <div v-show="child" :key="'base-map-with-graph-popup-properties-' + n">
        {{ child }} : {{ properties[child] }}
      </div>
    </template>
  </mapgis-popup>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import {
  thematicMapInstance,
  queryFeaturesInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import MapboxThematicMapLayersMinxin from '../../mixins/mapbox-thematic-map-layers'

@Component
export default class BaseMapWithGraphLayer extends Mixins(
  MapboxThematicMapLayersMinxin
) {
  dataSet: any = null

  properties: Record<string, any> = {}

  coordinates = [
    { lng: 0, lat: 0 },
    { lng: 0, lat: 0 }
  ]

  colors: string[] = ['#FFB980', '#5AB1EF', '#B6A2DE', '#2EC7C9', '#D87A80']

  // Bar add Bar3D chartsSetting
  chartsSettingForBarAddBar3DCommon = {
    width: 230,
    height: 110,
    xShapeBlank: [10, 10, 10],
    backgroundRadius: [5, 5, 5, 5],
    backgroundStyle: {
      fillColor: '#d1eeee',
      shadowBlur: 12,
      shadowColor: '#d1eeee',
      fillOpacity: 0
    }
  }

  // Point add Line chartsSetting
  chartsSettingForPointOrLine = {
    width: 220,
    height: 100,

    xShapeBlank: [10, 10],
    backgroundStyle: {
      fillColor: '#d1eeee',
      fillOpacity: 0
    },
    backgroundRadius: [5, 5, 5, 5],
    useXReferenceLine: true,
    pointStyle: {
      pointRadius: 5,
      shadowBlur: 12,
      shadowColor: '#D8361B',
      fillOpacity: 0.8
    },
    pointHoverStyle: {
      stroke: true,
      strokeColor: '#D8361B',
      strokeWidth: 2,
      fillColor: '#ffffff',
      pointRadius: 4
    }
  }

  // Pie add Ring chartsSetting
  chartsSettingForPieOrRing = {
    width: 240,
    height: 100,
    sectorStyle: {
      fillOpacity: 0.8
    }, // 柱状图中柱条的（表示字段值的图形）样式
    sectorHoverStyle: {
      fillOpacity: 1
    },
    xShapeBlank: [10, 10, 10], // 水平方向上的空白间距参数
    backgroundStyle: { fillColor: '#CCE8CF' }, // 背景样式
    backgroundRadius: [5, 5, 5, 5] // 背景框圆角参数
  }

  // 设置graphThemeLayer option参数
  thematicMapLayerOptions = {
    isOverLay: true,
    attributions: ' ',
    opacity: 0.9,
    chartsSetting: {},
    calGravity: true
  }

  get graph() {
    return this.subDataConfig.graph
  }

  get graphType() {
    return this.subDataConfig.graphType
  }

  get faceStyleByFields() {
    return this.colors.map(v => ({ fillColor: v }))
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
    if (!this.dataSet || !this.graph) return
    this.remove()
    this.initGraphicStyles()
    let chartsSetting = null
    let type = ''
    switch (this.graphType) {
      case 'bar':
        chartsSetting = this.createBarThematicMapLayer()
        type = 'Bar'
        break
      case 'bar3d':
        chartsSetting = this.createBar3DThematicMapLayer()
        type = 'Bar3D'
        break
      case 'line':
        chartsSetting = this.createLineThematicMapLayer()
        type = 'Line'
        break
      case 'point':
        chartsSetting = this.createPointThematicMapLayer()
        type = 'Point'
        break
      case 'pie':
        chartsSetting = this.createPieThematicMapLayer()
        type = 'Pie'
        break
      case 'ring':
        chartsSetting = this.createRingThematicMapLayer()
        type = 'Ring'
        break
      default:
        break
    }
    this.thematicMapLayerOptions.chartsSetting = chartsSetting
    this.thematicMapLayer = this.Zondy.Map.graphThemeLayer(
      `${type}Layer`,
      type,
      this.thematicMapLayerOptions
    )
    this.thematicMapLayer.id = this.id
    this.thematicMapLayer.addFeatures(this.dataSet)
    this.thematicMapLayer.on('mousemove', this.showInfoWin)
    this.thematicMapLayer.on('mouseout', this.closeInfoWin)
  }

  /**
   * 初始化样式
   */
  initGraphicStyles() {
    const { showFields, showFieldsTitle } = this.graph
    const codomain = [0, 30922]
    const axisYTick = 3
    const axisXLabels = showFields.map(v => showFieldsTitle[v] || v)
    const interval = Math.ceil((codomain[1] - codomain[0]) / axisYTick)
    const axisYLabels = axisYTick
      .map((v, i) => Math.ceil(codomain[0] + i * interval))
      .sort((a, b) => b - a)

    const axisObj = {
      axisXLabels,
      axisYLabels,
      codomain
    }
    this.chartsSettingForBarAddBar3DCommon = {
      ...this.chartsSettingForBarAddBar3DCommon,
      ...axisObj,
      axisYTick
    }

    this.chartsSettingForPointOrLine = {
      ...this.chartsSettingForPointOrLine,
      ...axisObj,
      axisYTick
    }

    this.chartsSettingForPieOrRing = {
      ...this.chartsSettingForPieOrRing,
      ...axisObj,
      sectorStyleByFields: this.faceStyleByFields
    }
    this.thematicMapLayerOptions = {
      ...this.thematicMapLayerOptions,
      map: this.map,
      themeFields: showFields
    }
  }

  createBarThematicMapLayer() {
    const chartsSettingForBar = this.chartsSettingForBarAddBar3DCommon
    chartsSettingForBar.barStyle = { fillOpacity: 0.7 } // 柱状图中柱条的（表示字段值的图形）样式
    chartsSettingForBar.barHoverStyle = { fillOpacity: 1 } //  柱条 hover 样式
    // 阴影样式
    chartsSettingForBar.barShadowStyle = {
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(100,100,100,0.8)'
    }
    chartsSettingForBar.barLinearGradient = this.colors.map(v => [v, v])
    return chartsSettingForBar
  }

  createBar3DThematicMapLayer() {
    const chartsSettingForBar3D = this.chartsSettingForBarAddBar3DCommon
    chartsSettingForBar3D.useXReferenceLine = true
    chartsSettingForBar3D.xReferenceLineStyle = {
      strokeColor: '#008acd',
      strokeOpacity: 0.4
    }
    // 3d 柱条正面样式（3d 柱条的侧面和顶面会以 3d 柱条正面样式为默认样式）
    chartsSettingForBar3D.barFaceStyle = { stroke: true }
    // 按字段设置 3d 柱条正面样式
    chartsSettingForBar3D.barFaceStyleByFields = this.faceStyleByFields
    // 3d 柱条正面 hover 样式（3d 柱条的侧面和顶面 hover 会以 3d 柱条正面 hover 样式为默认 hover 样式）
    chartsSettingForBar3D.barFaceHoverStyle = {
      stroke: true,
      strokeWidth: 1,
      strokeColor: '#ffff00'
    }
    return chartsSettingForBar3D
  }

  createLineThematicMapLayer(fillColor = '#9966CC') {
    const PointOrLine = this.chartsSettingForPointOrLine
    PointOrLine.pointStyle.fillColor = fillColor
    return PointOrLine
  }

  createPointThematicMapLayer() {
    this.createLineThematicMapLayer('#D8361B')
  }

  createPieThematicMapLayer() {
    return this.chartsSettingForPieOrRing
  }

  createRingThematicMapLayer() {
    this.chartsSettingForPieOrRing.innerRingRadius = 20
    this.createPieThematicMapLayer()
  }

  /**
   * 展示信息弹框
   */
  showInfoWin({ event, target }: any) {
    this.closeInfoWin()
    const { showFields, showFieldsTitle } = this.subDataConfig.popup
    if (!target || !target.refDataID || !showFields || !showFields.length) {
      return
    }
    const { field, value } = target.dataInfo
    const { offsetTop, offsetLeft } = this.map.getContainer()
    const { lng, lat } = this.map.unproject(
      new this.mapbox.Point(event.x - offsetLeft, event.y - offsetTop - 60)
    )
    this.coordinates = [lng, lat]
    this.properties[field] = value
  }

  /**
   * 关闭信息弹框
   */
  closeInfoWin() {
    this.coordinates = []
    this.properties = {}
  }
}
</script>
<style lang="less" scoped></style>
