<template>
  <div class="mp-widget-shadow-analysis">
    <mp-setting-form>
      <a-form-item label="日期">
        <a-date-picker
          :default-value="shadowMoment(formData.date, 'YYYY-MM-DD')"
          @change="changeDate"
        />
      </a-form-item>
      <a-form-item label="分析类型">
        <a-row>
          <a-radio-group v-model="formData.timeType">
            <a-radio value="timeRange">
              时间段
            </a-radio>
            <a-radio value="time">
              时间点
            </a-radio>
          </a-radio-group>
        </a-row>
      </a-form-item>
      <a-form-item label="时间" v-if="formData.timeType === 'time'">
        <a-time-picker
          :default-value="shadowMoment(formData.time, 'HH:mm:ss')"
          @change="
            val => {
              changeTime(val, 'time')
            }
          "
        />
      </a-form-item>
      <div v-else-if="formData.timeType === 'timeRange'">
        <a-form-item label="开始时间">
          <a-time-picker
            :default-value="shadowMoment(formData.startTime, 'HH:mm:ss')"
            @change="
              val => {
                changeTime(val, 'startTime')
              }
            "
          />
        </a-form-item>
        <a-form-item label="结束时间">
          <a-time-picker
            :default-value="shadowMoment(formData.endTime, 'HH:mm:ss')"
            @change="
              val => {
                changeTime(val, 'endTime')
              }
            "
          />
        </a-form-item>
      </div>
      <a-form-item label="底部高程">
        <a-input
          v-model.number="formData.min"
          type="number"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="拉伸高度">
        <a-input
          v-model.number="formData.max"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="阴影颜色">
        <MpColorPicker
          :color.sync="formData.shadowColor"
          :disableAlpha="true"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="非阴影颜色">
        <MpColorPicker
          :color.sync="formData.sunColor"
          :disableAlpha="true"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="阴影率" v-show="formData.timeType === 'time'">
        <a-input v-model.number="formData.ratio" type="number" disabled />
      </a-form-item>
      <div class="progress-div" v-if="percent != 0">
        <a-progress type="circle" :percent="percent" />
      </div>
    </mp-setting-form>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="shadow" :disabled="percent != 0">
        分析
      </a-button>
      <a-button type="primary" @click="sun" :disabled="percent != 0">
        日照效果
      </a-button>
      <a-button @click="remove">
        清除
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'
import moment from 'moment'

@Component({
  name: 'MpShadowAnalysis'
})
export default class MpShadowAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    date: moment().format('YYYY-MM-DD'), // 日期
    startTime: '10:00:00', // 开始时间
    endTime: '14:00:00', // 结束时间
    min: 0, // 最低高程(米)
    max: 20, // 拉伸高度(米)
    shadowColor: 'rgb(0,255,0)', // 阴影颜色
    sunColor: 'rgb(255,0,0)', // 非阴影颜色
    ratio: 0, // 阴影率(时间点范围阴影分析输出结果)
    timeType: 'timeRange', // 分析类型(time：时间点；timeRange:时间段)
    time: '10:00:00' // 时间点
  }

  created() {
    // 初始化
    window.ShadowManage = {
      drawElement: null,
      shadowAnalysis: null
    }
  }

  private shadowMoment = moment // moment插件

  private percent = 0

  /**
   * 日期组件值变化
   */
  changeDate(val) {
    const date = this.shadowMoment(val).format('YYYY-MM-DD')
    this.$set(this.formData, 'date', date)
  }

  /**
   * 时间组件值变化
   */
  changeTime(val, tag) {
    const time = this.shadowMoment(val).format('HH:mm:ss')
    this.$set(this.formData, tag, time)
  }

  // 微件关闭时
  onClose() {
    this.remove()
  }

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  /**
   * rgb转cesium的颜色
   */
  getCesiumColor(colorStr) {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(colorStr)
  }

  /**
   * 时间字符串转JulianDate时间
   */
  getJulianDate(timeStr: string) {
    const utc = this.Cesium.JulianDate.fromDate(new Date(timeStr)) // UTC
    return this.Cesium.JulianDate.addHours(utc, 0, new this.Cesium.JulianDate()) // 北京时间
  }

  /**
   * 原生日照分析
   */
  sun() {
    this.remove()
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = true // 开启日照
    viewer.shadows = true // 开启阴影
    const { date, startTime, endTime, time, timeType } = this.formData
    if (timeType === 'timeRange') {
      // 时间段日照分析
      viewer.clock.shouldAnimate = true // 开启计时
      viewer.clock.startTime = this.getJulianDate(
        `${date} ${this.formData.startTime}`
      )
      viewer.clock.stopTime = this.getJulianDate(
        `${date} ${this.formData.endTime}`
      )
      viewer.clock.currentTime = this.getJulianDate(
        `${date} ${this.formData.startTime}`
      )
      viewer.clock.multiplier = 3600 // cesium中1秒表示现实中1个小时
      viewer.clock.clockRange = this.Cesium.ClockRange.LOOP_STOP // 循环动画
    } else if (timeType === 'time') {
      // 时间点日照分析
      viewer.clockViewModel.currentTime = this.getJulianDate(
        `${date} ${this.formData.time}`
      )
    }
  }

  getPercent(result) {
    console.log(`时间段百分比${result}`)
    console.log(new Date().getTime())
    this.percent = Number((result * 100).toFixed(2))
    if (result === 1) {
      this.percent = 0
    }
  }

  /**
   * 范围时间点阴影分析/范围时间段阴影分析
   */
  shadow() {
    this.remove()
    const { viewer } = this.webGlobe

    // 初始化交互式绘制控件
    window.ShadowManage.drawElement =
      window.ShadowManage.drawElement || new this.Cesium.DrawElement(viewer)

    const { date, min, max, timeType, shadowColor, sunColor } = this.formData
    const time = new Date(`${date} ${this.formData.time}`)
    const startTime = new Date(`${date} ${this.formData.startTime}`)
    const endTime = new Date(`${date} ${this.formData.endTime}`)

    viewer.scene.globe.depthTestAgainstTerrain = false // 关闭深度检测

    const self = this

    // 1.绘制分析区域(矩形)
    // 激活交互式绘制工具
    window.ShadowManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        console.log('绘制结束')
        console.log(new Date().getTime())
        self.remove()
        console.log('remove')
        console.log(new Date().getTime())
        self.percent = 0.01
        let xmin
        let ymin
        let xmax
        let ymax
        positions.forEach(point => {
          const { x, y } = point
          if (xmin === undefined || x < xmin) {
            xmin = x
          }
          if (xmax === undefined || x > xmax) {
            xmax = x
          }
          if (ymin === undefined || y < ymin) {
            ymin = y
          }
          if (ymax === undefined || y > ymax) {
            ymax = y
          }
        })
        // 多边形x方向长度
        const recXLength = self.Cesium.Cartesian3.distance(
          new this.Cesium.Cartesian3(xmin, ymin, 0),
          new this.Cesium.Cartesian3(xmax, ymin, 0)
        )
        // 多边形y方向长度
        const recYLength = self.Cesium.Cartesian3.distance(
          new this.Cesium.Cartesian3(xmin, ymin, 0),
          new this.Cesium.Cartesian3(xmin, ymax, 0)
        )
        const xPaneNum = Math.ceil(recXLength / 4) // X轴方向插值点个数
        const yPaneNum = Math.ceil(recYLength / 4) // Y轴方向插值点个数
        const zPaneNum = Math.ceil((max - min) / 4) // Z轴方向插值点个数
        window.ShadowManage.shadowAnalysis =
          window.ShadowManage.shadowAnalysis ||
          new self.Cesium.ShadowAnalysis(viewer, {
            callback: this.getPercent,
            xPaneNum,
            yPaneNum,
            zPaneNum,
            shadowColor: self.getCesiumColor(shadowColor),
            sunColor: self.getCesiumColor(sunColor)
          })
        console.log('分析前')
        console.log(new Date().getTime())
        if (timeType === 'time') {
          // 固定时间点范围阴影分析
          const shadowRatio = window.ShadowManage.shadowAnalysis.pointsArrayInShadow(
            positions,
            min,
            max,
            time
          )
          self.$set(self.formData, 'ratio', shadowRatio)
          console.log('时间点分析后')
          console.log(new Date().getTime())
        } else if (timeType === 'timeRange') {
          // 时间段范围阴影分析
          const result = window.ShadowManage.shadowAnalysis.calcPointsArrayInShadowTime(
            positions,
            min,
            max,
            startTime,
            endTime
          )
          console.log('时间段分析后')
          console.log(new Date().getTime())
        }
      }
    })
  }

  /**
   * 移除绘制插件和阴影分析结果
   */
  remove() {
    // 判断是否已有阴影分析结果
    if (window.ShadowManage.shadowAnalysis) {
      // 移除阴影分析显示结果
      window.ShadowManage.shadowAnalysis.remove()
      window.ShadowManage.shadowAnalysis = null
    }

    if (window.ShadowManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.ShadowManage.drawElement.stopDrawing()
      window.ShadowManage.drawElement = null
    }

    this.$set(this.formData, 'ratio', 0)

    // 关闭原生日照分析
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = false
    viewer.shadows = false
    viewer.clock.multiplier = 1
    viewer.clock.shouldAnimate = false // 关闭计时'
    this.percent = 0
  }
}
</script>

<style lang="less">
.mp-widget-shadow-analysis {
  display: flex;
  flex-direction: column;
  .mp-footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid @border-color;
    .ant-btn {
      margin-left: 8px;
    }
  }

  .mp-note-info {
    padding: 3px 0;
    color: @text-color-secondary;
    word-break: break-all;
    white-space: break-spaces;
    font-size: 12px;
    &.ant-input {
      border: none;
      background-color: transparent;
      resize: none;
      min-height: 24px;
    }
  }
  .progress-div {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(100, 100, 100, 0.3);
    filter: alpha(opacity=50);
    .ant-progress {
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      position: absolute;
      margin: auto;
    }
    .ant-progress-inner {
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      position: absolute;
      margin: auto;
    }
  }
}
</style>
