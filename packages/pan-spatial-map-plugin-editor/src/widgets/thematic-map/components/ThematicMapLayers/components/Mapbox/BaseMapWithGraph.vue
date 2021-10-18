<template>
  <!-- 统计专题图 -->
  <mp-marker-pro :marker="selfMarker" v-if="selfMarker.fid" />
</template>
<script lang="ts">
import { Component, Mixins, Inject, Watch } from 'vue-property-decorator'
import { GraphThemeLayer } from '@mapgis/webclient-es6-mapboxgl'
import { getMarker, IMarker } from '../../../../utils'
import { Feature } from '@mapgis/web-app-framework'
import _debounce from 'lodash/debounce'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxBaseMapWithGraph extends Mixins(BaseMixin) {
  @Inject('map') map

  @Inject('mapbox') mapbox

  /**
   * 监听：图属联动变化
   */
  @Watch('marker.fid')
  fidChanged() {
    this.selfMarker = this.marker
  }

  // 专题图层
  private thematicMapLayer: any = null

  // 标注
  private selfMarker: IMarker | Record<string, unknown> = {}

  // 图标实体颜色
  private colors: string[] = [
    '#FFB980',
    '#5AB1EF',
    '#B6A2DE',
    '#2EC7C9',
    '#D87A80'
  ]

  // Bar add Bar3D 图表配置
  private chartsSettingForBarAddBar3DCommon = {
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

  // Point add Line 图表配置
  private chartsSettingForPointOrLine = {
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

  // Pie add Ring 图表配置
  private chartsSettingForPieOrRing = {
    width: 240,
    height: 100,
    sectorStyle: {
      fillOpacity: 0.8
    },
    sectorHoverStyle: {
      fillOpacity: 1
    },
    xShapeBlank: [10, 10, 10],
    backgroundStyle: { fillColor: '#CCE8CF' },
    backgroundRadius: [5, 5, 5, 5]
  }

  // 设置专题图层 option参数
  private thematicMapLayerOptions = {
    map: this.map,
    isOverLay: true,
    calGravity: true,
    attributions: ' ',
    opacity: 0.9,
    chartsSetting: {},
    themeFields: []
  }

  // 图表x轴或y轴字段
  get graph() {
    return this.subjectData?.graph
  }

  // 图表类型
  get graphType() {
    return this.subjectData?.graphType
  }

  // 图表填充色
  get faceStyleByFields() {
    return this.colors.map(v => ({ fillColor: v }))
  }

  /**
   * 初始化统计表样式
   */
  initGraphicStyles() {
    const { showFields, showFieldsTitle } = this.graph
    const axisYTick = 4
    const codomain = [0, 30922]
    const interval = Math.ceil((codomain[1] - codomain[0]) / axisYTick)
    const axisXLabels = showFields.map(v =>
      showFieldsTitle && showFieldsTitle[v] ? showFieldsTitle[v] : v
    )
    const axisYLabels = axisXLabels
      .map((v, i) => Math.ceil(codomain[0] + i * interval))
      .sort((a, b) => b - a)
    const axisObj = {
      axisYTick,
      codomain,
      axisXLabels,
      axisYLabels
    }
    this.chartsSettingForBarAddBar3DCommon = {
      ...this.chartsSettingForBarAddBar3DCommon,
      ...axisObj
    }
    this.chartsSettingForPointOrLine = {
      ...this.chartsSettingForPointOrLine,
      ...axisObj
    }
    this.chartsSettingForPieOrRing = {
      sectorStyleByFields: this.faceStyleByFields,
      ...this.chartsSettingForPieOrRing,
      ...axisObj
    }
    this.thematicMapLayerOptions = {
      ...this.thematicMapLayerOptions,
      themeFields: showFields
    }
  }

  /**
   * 柱状图图层
   */
  createBarThematicMapLayer() {
    const chartsSettingForBar = this.chartsSettingForBarAddBar3DCommon
    chartsSettingForBar.barStyle = { fillOpacity: 0.7 }
    chartsSettingForBar.barHoverStyle = { fillOpacity: 1 }
    chartsSettingForBar.barShadowStyle = {
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(100,100,100,0.8)'
    }
    chartsSettingForBar.barLinearGradient = this.colors.map(v => [v, v])
    return chartsSettingForBar
  }

  /**
   * 3D柱状统计图层
   */
  createBar3DThematicMapLayer() {
    const chartsSettingForBar3D = this.chartsSettingForBarAddBar3DCommon
    chartsSettingForBar3D.useXReferenceLine = true
    chartsSettingForBar3D.xReferenceLineStyle = {
      strokeColor: '#008acd',
      strokeOpacity: 0.4
    }
    chartsSettingForBar3D.barFaceStyle = { stroke: true }
    chartsSettingForBar3D.barFaceStyleByFields = this.faceStyleByFields
    chartsSettingForBar3D.barFaceHoverStyle = {
      stroke: true,
      strokeWidth: 1,
      strokeColor: '#ffff00'
    }
    return chartsSettingForBar3D
  }

  /**
   * 折线统计图层
   */
  createLineThematicMapLayer(fillColor = '#9966CC') {
    const PointOrLine = this.chartsSettingForPointOrLine
    PointOrLine.pointStyle.fillColor = fillColor
    return PointOrLine
  }

  /**
   * 散点统计图层
   */
  createPointThematicMapLayer() {
    return this.createLineThematicMapLayer('#D8361B')
  }

  /**
   * 饼图图层
   */
  createPieThematicMapLayer() {
    return this.chartsSettingForPieOrRing
  }

  /**
   * 环形图层
   */
  createRingThematicMapLayer() {
    this.chartsSettingForPieOrRing.innerRingRadius = 20
    return this.createPieThematicMapLayer()
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.thematicMapLayer) {
      const { id } = this.thematicMapLayer
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id)
      } else {
        if (this.thematicMapLayer.clear) {
          this.thematicMapLayer.clear()
        }
        if (this.thematicMapLayer.removeFromMap) {
          this.thematicMapLayer.removeFromMap()
        }
      }
      this.thematicMapLayer = null
      this.closePopupWin()
    }
  }

  /**
   * 显示图层
   * fixme 统计专题图目前不支持geojson数据
   */
  showLayer() {
    if (!this.graph || !this.geojson) return
    this.removeLayer()
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
    this.thematicMapLayer = new GraphThemeLayer(`${type}Layer`, type, {
      ...this.thematicMapLayerOptions,
      map: this.map,
      chartsSetting
    })
    if (!this.thematicMapLayer) return
    this.thematicMapLayer.addFeatures(
      Feature.FeatureConvert.featureGeoJSONTofeatureIGS(this.geojson)
    )
    this.thematicMapLayer.on('mousemove', _debounce(this.showPopupWin, 200))
    this.thematicMapLayer.on('mouseout', _debounce(this.closePopupWin, 200))
  }

  /**
   * 开启信息窗口
   */
  showPopupWin({ event, target }: any) {
    if (!target || !target.dataInfo) return
    const fid = target.refDataID + 1
    this.emitHighlight(fid)
    getMarker(this.geojson, fid).then(
      marker => (this.selfMarker = marker || {})
    )
  }

  /**
   * 关闭信息窗口
   */
  closePopupWin() {
    this.emitClearHighlight()
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
