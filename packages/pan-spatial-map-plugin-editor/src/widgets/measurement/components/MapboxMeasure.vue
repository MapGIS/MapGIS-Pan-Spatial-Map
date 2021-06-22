<template>
  <div class="mapbox-measure-wrapper">
    <mapgis-measure
      class="measure-draw-wrapper"
      position="bottom-left"
      ref="measure"
      :measureMode="measureMode"
      :styles="drawStyle"
      @added="onAdded"
      @measureResult="onMeasureResult"
    >
      <div slot="measureMarker">
        <mapgis-marker
          v-for="(item, index) in measureMarkers"
          :key="'measuer-marker-' + index"
          :coordinates="item.coordinates"
          anchor="bottom"
        >
          <div slot="marker">
            <div class="measure-popup">
              <div class="measure-tip"></div>
              <div class="measure-content">
                <div
                  v-for="text in item.text"
                  :key="'measuerText-' + text"
                  :style="
                    `font-size: ${measureStyle.textSize}px;font-family: ${measureStyle.textType};color: ${measureStyle.textColor}`
                  "
                >
                  {{ text }}
                </div>
              </div>
            </div>
          </div>
        </mapgis-marker>
      </div>
    </mapgis-measure>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Mixins,
  Provide,
  Prop,
  Watch,
  Emit
} from 'vue-property-decorator'

import { MapMixin } from '@mapgis/web-app-framework'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import MeasureMixin from '../mixins/measure'
import DrawStyle from '../../../styles/draw-style'

@Component({ components: {} })
export default class Measure extends Mixins(MapMixin, MeasureMixin) {
  @Emit('start')
  emitMeasureStart() {}

  @Emit('finished')
  emitMeasureFineshed(results: Record<string, any>) {}

  private measure: any = null

  private measureMarkers: any[] = []

  // 测量结果
  private results: Record<string, any> = {}

  // 上一次测量结果
  private lastResult: any = {}

  // 绘制样式
  private drawStyle = []

  mounted() {
    this.drawStyle = DrawStyle
  }

  beforeDestroy() {
    this.measure = undefined
  }

  // 打开测量工具
  openMeasure(mode) {
    // 每次打开绘制前先关闭之前的
    this.closeMeasure()
    // 使能渲染（如果没有开启会开启测量工具）
    this.enableMeasure()
    // 保存当前测量模式
    this.measureMode = mode
    // 设置测量模式到测量工具中
    this.setMeasureMode(mode)
    // 发送测量开始的事件
    this.emitMeasureStart()
  }

  // 关闭测量工具
  closeMeasure() {
    // 如果在交互中或者已经获取到测量结果，需要清除
    if (
      (this.measure &&
        ['draw_line_string', 'draw_polygon'].includes(
          this.measure.getMode()
        )) ||
      this.measureMarkers.length !== 0
    ) {
      this.measureMarkers = []
      this.lastResult = {}
      if (this.measure) {
        this.measure.deleteAll()
        this.measure.changeMode('simple_select')
      }
    }
  }

  // 距离单位变化
  onDistanceUnitChange() {
    // 如果已经测量过，直接更新其结果
    if (Object.keys(this.lastResult).length > 0) {
      this.formatMeasureResult(
        this.lastResult,
        this.distanceUnit,
        this.areaUnit
      )
    }
  }

  // 面积单位变化
  onAreaUnitChange() {
    // 如果已经测量过，直接更新其结果
    if (Object.keys(this.lastResult).length > 0) {
      this.formatMeasureResult(
        this.lastResult,
        this.distanceUnit,
        this.areaUnit
      )
    }
  }

  // 测量覆盖物样式变化
  onMeasureStyleChange() {
    this.setMeasureStyle(this.measureStyle)
  }

  // 测量工具已经准备好
  private onAdded(e: any) {
    const { measure } = e
    this.measure = measure
  }

  // 测量结果拿到后
  private onMeasureResult(result: any) {
    this.formatMeasureResult(result, this.distanceUnit, this.areaUnit)
  }

  // 使能测量
  private enableMeasure() {
    const measureComponent = this.$refs.measure
    if (measureComponent) {
      this.setMeasureStyle(this.measureStyle)
      measureComponent.enableMeasure()
    }
  }

  // 根据当前激活类型来选择对应的绘制类型
  private setMeasureMode(mode) {
    switch (mode) {
      case 'measure-length':
        if (this.measure) {
          this.measure.changeMode('draw_line_string')
        }
        break
      case 'measure-area':
        if (this.measure) {
          this.measure.changeMode('draw_polygon')
        }
        break
      default:
        break
    }
  }

  // 格式化测量结果
  private formatMeasureResult(result, distanceUnit, areaUnit) {
    // 投影平面长度
    let projectionPerimeter = ''
    // 椭球实地长度
    let geographyPerimeter = ''
    // 投影平面面积
    let projectionArea = ''
    // 椭球实地面积
    let geographyArea = ''
    let marker: any = null
    let distanceUnitExp
    let areaUnitExp

    this.measureMarkers = []
    this.results = {}
    this.lastResult = JSON.parse(JSON.stringify(result))
    switch (this.measureMode) {
      case 'measure-length':
        distanceUnitExp = this.transDistanceUnit(distanceUnit)
        projectionPerimeter = (
          result.projectionPerimeter / distanceUnitExp.perimeterR
        ).toFixed(2)
        geographyPerimeter = (
          result.geographyPerimeter / distanceUnitExp.perimeterR
        ).toFixed(2)

        marker = {
          coordinates: result.coordinates[result.coordinates.length - 1],
          text: [projectionPerimeter + distanceUnitExp.perimeterUnitLabel],
          style: `color:${this.measureStyle.textColor};font-family:${this.measureStyle.textType};font-size:${this.measureStyle.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planeLength: `${projectionPerimeter} ${distanceUnitExp.perimeterUnitLabel}`,
          ellipsoidLength: `${geographyPerimeter} ${distanceUnitExp.perimeterUnitLabel}`
        }
        break
      case 'measure-area':
        distanceUnitExp = this.transDistanceUnit(distanceUnit)
        areaUnitExp = this.transAreaUnit(areaUnit)
        projectionPerimeter = (
          result.projectionPerimeter / distanceUnitExp.perimeterR
        ).toFixed(2)
        geographyPerimeter = (
          result.geographyPerimeter / distanceUnitExp.perimeterR
        ).toFixed(2)
        projectionArea = (result.projectionArea / areaUnitExp.areaR).toFixed(2)
        geographyArea = (result.geographyArea / areaUnitExp.areaR).toFixed(2)

        marker = {
          coordinates: utilInstance.getCenterOfGravityPoint(
            result.coordinates[0]
          ),
          text: [
            `周长: ${projectionPerimeter}${areaUnitExp.perimeterUnitLabel}`,
            `面积: ${projectionArea}${areaUnitExp.areaUnitLabel}`
          ],
          style: `color:${this.measureStyle.textColor};font-family:${this.measureStyle.textType};font-size:${this.measureStyle.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planePerimeter: `${projectionPerimeter} ${areaUnitExp.perimeterUnitLabel}`,
          planeArea: `${projectionArea} ${areaUnitExp.areaUnitLabel}`,
          ellipsoidPerimeter: `${geographyPerimeter} ${areaUnitExp.perimeterUnitLabel}`,
          ellipsoidArea: `${geographyArea} ${areaUnitExp.areaUnitLabel}`
        }
        break
      default:
        break
    }

    // 发送测量结束事件，会带上测量结果
    this.emitMeasureFineshed(this.results)
  }

  // 根据所选单位值，对距离单位进行处理
  private transDistanceUnit(distanceUnit) {
    let perimeterR = 1

    switch (distanceUnit) {
      case 'm':
        perimeterR = 1
        break
      case 'km':
        perimeterR = 1000
        break
      case '米':
        perimeterR = 1
        break
      case '千米':
        perimeterR = 1000
        break
      default:
        break
    }

    return {
      perimeterR,
      perimeterUnitLabel: distanceUnit
    }
  }

  // 根据所选单位值，对面积单位进行处理
  private transAreaUnit(areaUnit) {
    let perimeterR = 1
    let areaR = 1
    let perimeterUnitLabel = ''

    switch (areaUnit) {
      case 'm2':
        perimeterR = 1
        areaR = 1
        perimeterUnitLabel = 'm'
        break
      case 'km2':
        perimeterR = 1000
        areaR = 1000 * 1000
        perimeterUnitLabel = 'km'
        break
      case '平方米':
        perimeterR = 1
        areaR = 1
        perimeterUnitLabel = '米'
        break
      case '平方千米':
        perimeterR = 1000
        areaR = 1000 * 1000
        perimeterUnitLabel = '千米'
        break
      default:
        break
    }

    return {
      perimeterR,
      areaR,
      perimeterUnitLabel,
      areaUnitLabel: areaUnit
    }
  }

  private setMeasureStyle(measureStyle) {
    // 修改drawStyle中的内容
    this.drawStyle = this.drawStyle.map(style => {
      if (style.type === 'line') {
        style.paint = {
          'line-color': measureStyle.lineColor,
          'line-width': measureStyle.lineWidth,
          'line-opacity': measureStyle.lineOpacity
        }
        if (measureStyle.lineType === '虚线') {
          style.paint['line-dasharray'] = [0.2, 2]
        }
      } else if (style.type === 'circle') {
        style.paint = {
          'circle-color': measureStyle.lineColor,
          'circle-opacity': measureStyle.lineOpacity
        }
      } else if (style.type === 'fill') {
        style.paint = {
          'fill-color': measureStyle.fillColor,
          'fill-opacity': measureStyle.fillOpacity
        }
      }

      return style
    })
  }
}
</script>

<style lang="less" scoped>
.measure-popup {
  display: flex;
  flex-direction: column-reverse;
  .measure-content {
    background-color: @base-bg-color;
    padding: 5px 16px;
    border-radius: 4px;
    box-shadow: 0px 1px 2px 0px @shadow-color;
  }
  .measure-tip {
    align-self: center;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-bottom: none;
    border-top-color: @base-bg-color;
    z-index: 1;
  }
}
</style>
