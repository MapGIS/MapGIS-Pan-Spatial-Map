<template>
  <div class="mapbox-measure-wrapper">
    <mapgis-measure
      class="measure-draw-wrapper"
      position="bottom-left"
      ref="measure"
      :measureMode="measureMode"
      @added="onAdded"
      @measureResult="onMeasureResult"
    >
      <div slot="measureMarker">
        <mapgis-marker
          v-for="(item, index) in measureMarkers"
          :key="'measuer-marker-' + index"
          :coordinates="item.coordinates"
        >
          <div slot="marker">
            <div
              v-for="text in item.text"
              :key="'measuerText-' + text"
              :style="
                `font-size: ${measureSetting.textSize}px;font-family: ${measureSetting.textType};color: ${measureSetting.textColor}`
              "
            >
              {{ text }}
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

@Component({ components: {} })
export default class Measure extends Mixins(MapMixin, MeasureMixin) {
  drawSources = ['mapbox-gl-draw-hot', 'mapbox-gl-draw-cold']

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

  // 因一次绘制完毕后，drawSources不会立即加入，通过定时器来检测
  private setMeasureStyleInterval = null

  beforeDestroy() {
    this.measure = undefined
  }

  // 打开测量
  openMeasure(mode) {
    // 每次打开绘制前先清除
    this.clearMeasure()
    // 移动测量覆盖物到顶端
    this.moveMeasureLayersToTop()
    // 使能渲染（如果没有开启会开启测量工具）
    this.enableMeasure()
    // 保存当前测量模式
    this.measureMode = mode
    // 设置测量模式到测量工具中
    this.setMeasureMode(mode)
    // 发送测量开始的事件
    this.emitMeasureStart()
  }

  clearMeasure() {
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
  onMeasureSettingChange() {
    this.setMeasureStyle(this.measureSetting)
  }

  // 测量工具已经准备好
  private onAdded(e: any) {
    const { measure } = e
    this.measure = measure
    this.setMeasureStyleInterval = setInterval(() => {
      // 设置测量覆盖物样式
      this.setMeasureStyle(this.measureSetting)
    }, 20)
  }

  // 测量结果拿到后
  private onMeasureResult(result: any) {
    this.formatMeasureResult(result, this.distanceUnit, this.areaUnit)
  }

  // 使能测量
  private enableMeasure() {
    const measureComponent = this.$refs.measure
    if (measureComponent) {
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
    let perimeter = ''
    let area = ''
    let marker: any = null
    let distanceUnitExp
    let areaUnitExp

    this.measureMarkers = []
    this.results = {}
    this.lastResult = JSON.parse(JSON.stringify(result))
    switch (this.measureMode) {
      case 'measure-length':
        distanceUnitExp = this.transDistanceUnit(distanceUnit)
        perimeter = (result.perimeter / distanceUnitExp.perimeterR).toFixed(2)
        marker = {
          coordinates: result.coordinates[result.coordinates.length - 1],
          text: [perimeter + distanceUnitExp.perimeterUnitLabel],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planeLength: perimeter + distanceUnitExp.perimeterUnitLabel,
          ellipsoidLength: perimeter + distanceUnitExp.perimeterUnitLabel
        }
        break
      case 'measure-area':
        areaUnitExp = this.transAreaUnit(areaUnit)
        perimeter = (result.perimeter / areaUnitExp.perimeterR).toFixed(2)
        area = (result.area / areaUnitExp.areaR).toFixed(2)
        marker = {
          coordinates: utilInstance.getCenterOfGravityPoint(
            result.coordinates[0]
          ),
          text: [
            `周长: ${perimeter}${areaUnitExp.perimeterUnitLabel}`,
            `面积：${area}${areaUnitExp.areaUnitLabel}`
          ],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planePerimeter: perimeter + areaUnitExp.perimeterUnitLabel,
          planeArea: area + areaUnitExp.areaUnitLabel,
          ellipsoidPerimeter: perimeter + areaUnitExp.perimeterUnitLabel,
          ellipsoidArea: area + areaUnitExp.areaUnitLabel
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

  // 将量算绘制的图层移到所有图层上方，避免被覆盖
  private moveMeasureLayersToTop() {
    if (this.map === null) {
      return false
    }
    if (
      this.map.getSource(this.drawSources[0]) ||
      this.map.getSource(this.drawSources[1])
    ) {
      const { layers } = this.map.getStyle()
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.source && this.drawSources.includes(layer.source)) {
          this.map.moveLayer(layer.id)
        }
      }
    }
  }

  private setMeasureStyle(measureSetting) {
    if (this.map === null) {
      return false
    }
    if (this.isMapboxDrawSourceAdded()) {
      if (this.setMeasureStyleInterval) {
        clearInterval(this.setMeasureStyleInterval)
      }

      const { layers } = this.map.getStyle()
      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i]
        if (layer.source && this.drawSources.includes(layer.source)) {
          const { type } = layer
          if (type === 'line') {
            const layerId = layer.id
            this.map.setPaintProperty(
              layerId,
              'line-color',
              measureSetting.lineColor
            )

            if (measureSetting.lineType === '虚线') {
              this.map.setPaintProperty(layerId, 'line-dasharray', [0.2, 2])
            } else if (measureSetting.lineType === '实线') {
              this.map.setPaintProperty(layerId, 'line-dasharray', null)
            }
            this.map.setPaintProperty(
              layerId,
              'line-opacity',
              measureSetting.lineOpacity / 100
            )
            this.map.setPaintProperty(
              layerId,
              'line-width',
              measureSetting.lineWidth
            )
          }
        }
      }
    }
  }

  private isMapboxDrawSourceAdded() {
    if (
      this.map.getSource(this.drawSources[0]) &&
      this.map.getSource(this.drawSources[1])
    ) {
      return true
    }
    return false
  }
}
</script>

<style scoped></style>
