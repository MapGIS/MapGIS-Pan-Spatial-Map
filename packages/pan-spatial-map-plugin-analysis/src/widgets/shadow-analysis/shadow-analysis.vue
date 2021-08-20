<template>
  <div class="mp-widget-shadow-analysis">
    <mp-setting-form>
      <a-form-item label="日期">
        <a-date-picker
          :default-value="formData.date | formatToMoment('YYYY-MM-DD')"
          @change="changeDate"
        />
      </a-form-item>
      <a-form-item label="开始时间">
        <a-time-picker
          :default-value="formData.startTime | formatToMoment"
          @change="changeTime($event, 'startTime')"
        />
      </a-form-item>
      <a-form-item label="结束时间">
        <a-time-picker
          :default-value="formData.endTime | formatToMoment"
          @change="changeTime($event, 'endTime')"
        />
      </a-form-item>
      <a-form-item label="底部高程">
        <a-input v-model.number="formData.min" type="number" addon-after="米" />
      </a-form-item>
      <a-form-item label="拉伸高度">
        <a-input
          v-model.number="formData.max"
          type="number"
          min="0"
          addon-after="米"
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
      <!-- <a-form-item label="阴影率">
        <a-input v-model.number="formData.ratio" type="number" disabled />
      </a-form-item> -->
    </mp-setting-form>
    <div class="mp-footer-actions">
      <a-button @click="shadow" :disabled="maskShow" type="primary">
        分析
      </a-button>
      <a-button @click="sun" :disabled="maskShow" type="primary">
        日照效果
      </a-button>
      <a-button @click="remove">
        清除
      </a-button>
    </div>
    <mp-mask
      :parentDivClass="'mp-map-container'"
      :loading="maskShow"
      :text="maskText"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'
import moment from 'moment'

@Component({
  name: 'MpShadowAnalysis',
  filters: {
    formatToMoment(value, format = 'HH:mm:ss') {
      return moment(value, format)
    }
  }
})
export default class MpShadowAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    date: moment().format('YYYY-MM-DD'), // 日期
    startTime: '10:00:00', // 开始时间
    endTime: '14:00:00', // 结束时间
    min: 0, // 最低高程(米)
    max: 20, // 拉伸高度(米)
    shadowColor: 'rgb(0,255,0)', // 阴影颜色
    sunColor: 'rgb(255,0,0)' // 非阴影颜色
    // ratio: 0 // 阴影率(时间点范围阴影分析输出结果)
  }

  private percent = 0

  private maskShow = false

  private maskText = '正在分析中, 请稍等...0%'

  get julianStartDate() {
    return this.getJulianDate(
      `${this.formData.date} ${this.formData.startTime}`
    )
  }

  get julianEndDate() {
    return this.getJulianDate(`${this.formData.date} ${this.formData.endTime}`)
  }

  created() {
    this.initShadowManage()
  }

  beforeDestroy() {
    this.removeShadowManage()
  }

  /**
   * 初始化阴影
   */
  initShadowManage() {
    if (!window.ShadowManage) {
      window.ShadowManage = {
        drawElement: null,
        shadowAnalysis: null
      }
    }
  }

  /**
   * 移除所有
   */
  removeShadowManage() {
    this.remove()
    window.ShadowManage = undefined
  }

  /**
   * 微件打开时
   */
  onOpen() {
    this.initShadowManage()
  }

  /**
   * 微件关闭时
   */
  onClose() {
    this.removeShadowManage()
  }

  /**
   * 微件失活时
   */
  // onDeActive() {
  //   this.removeShadowManage()
  // }

  /**
   * 时间格式化
   */
  formatDateTime(value, type = 'date') {
    return moment(value).format(type === 'date' ? 'YYYY-MM-DD' : 'HH:mm:ss')
  }

  /**
   * 日期组件值变化
   */
  changeDate(val) {
    this.$set(this.formData, 'date', this.formatDateTime(val))
  }

  /**
   * 时间组件值变化
   */
  changeTime(val, tag) {
    this.$set(this.formData, tag, this.formatDateTime(val, 'time'))
  }

  /**
   * 时间字符串转JulianDate时间
   */
  getJulianDate(timeStr: string) {
    const utc = this.Cesium.JulianDate.fromDate(new Date(timeStr)) // UTC
    return this.Cesium.JulianDate.addHours(utc, 0, new this.Cesium.JulianDate()) // 北京时间
  }

  /**
   * 获取经纬度范围
   */
  getRectBounds(positions) {
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

    return {
      xmin,
      ymin,
      xmax,
      ymax
    }
  }

  /**
   * 获取xyz轴阴影三维点的数量
   */
  getPaneNums(positions) {
    const { min, max } = this.formData
    const { xmin, ymin, xmax, ymax } = this.getRectBounds(positions)
    // 多边形x方向长度
    const recXLength = this.Cesium.Cartesian3.distance(
      new this.Cesium.Cartesian3(xmin, ymin, 0),
      new this.Cesium.Cartesian3(xmax, ymin, 0)
    )
    // 多边形y方向长度
    const recYLength = this.Cesium.Cartesian3.distance(
      new this.Cesium.Cartesian3(xmin, ymin, 0),
      new this.Cesium.Cartesian3(xmin, ymax, 0)
    )
    const xPaneNum = Math.ceil(recXLength / 4) // X轴方向插值点个数
    const yPaneNum = Math.ceil(recYLength / 4) // Y轴方向插值点个数
    const zPaneNum = Math.ceil((max - min) / 4) // Z轴方向插值点个数

    return {
      xPaneNum,
      yPaneNum,
      zPaneNum
    }
  }

  /**
   * 阴影分析遮罩层
   */
  toggleMask(status: boolean) {
    this.maskShow = status
  }

  /**
   * 时间段阴影分析回调函数，获取分析进度值
   */
  setPercent(result) {
    this.percent = result
    this.maskText = `正在分析中, 请稍等...${Number((result * 100).toFixed(2))}%`
    const timer = setInterval(() => {
      if (this.percent === result) {
        this.toggleMask(false)
      }
      clearInterval(timer)
    }, 200)
  }

  /**
   * 时间点阴影分析回调函数，获取阴影率
   */
  // setShadowRatio(result) {
  //   this.$set(this.formData, 'ratio', result)
  // }

  /**
   * 范围时间点阴影分析/范围时间段阴影分析
   */
  shadow() {
    this.removeSun()
    this.removeShadow()
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    if (!window.ShadowManage.drawElement) {
      window.ShadowManage.drawElement = new this.Cesium.DrawElement(viewer)
    }
    // 激活交互式绘制工具
    window.ShadowManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.removeDraw()
        this.toggleMask(true)
        const {
          date,
          min,
          max,
          shadowColor,
          sunColor,
          startTime,
          endTime
        } = this.formData
        if (!window.ShadowManage.shadowAnalysis) {
          // 初始化取阴影分析类
          window.ShadowManage.shadowAnalysis = new this.Cesium.ShadowAnalysis(
            viewer,
            {
              ...this.getPaneNums(positions),
              shadowColor,
              sunColor,
              percentCallback: this.setPercent
              // shadowRatioCallBack: this.setShadowRatio,
            }
          )
        }
        viewer.clockViewModel.currentTime = this.julianStartDate
        // 阴影分析
        window.ShadowManage.shadowAnalysis.calcPointsArrayInShadowTime(
          positions,
          min,
          max,
          new Date(`${date} ${startTime}`),
          new Date(`${date} ${endTime}`)
        )
      }
    })
  }

  /**
   * 原生日照分析
   */
  sun() {
    this.removeSun()
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = true // 开启日照
    viewer.shadows = true // 开启阴影
    viewer.clock.shouldAnimate = true // 开启计时
    viewer.clock.currentTime = this.julianStartDate
    viewer.clock.startTime = this.julianStartDate
    viewer.clock.stopTime = this.julianEndDate
    viewer.clock.multiplier = 3600 // cesium中1秒表示现实中1个小时
    viewer.clock.clockRange = this.Cesium.ClockRange.LOOP_STOP // 循环动画
  }

  /**
   * 移除绘制分析结果
   */
  removeDraw() {
    if (window.ShadowManage?.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.ShadowManage.drawElement.stopDrawing()
      window.ShadowManage.drawElement = null
    }
  }

  /**
   * 移除日照分析结果
   */
  removeSun() {
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = false
    viewer.shadows = false
    viewer.clock.multiplier = 1
    viewer.clock.shouldAnimate = false // 关闭计时
  }

  /**
   * 移除阴影分析结果
   */
  removeShadow() {
    // 判断是否已有阴影分析结果
    if (window.ShadowManage?.shadowAnalysis) {
      // 移除阴影分析显示结果
      window.ShadowManage.shadowAnalysis.remove()
      window.ShadowManage.shadowAnalysis = null
    }
  }

  /**
   * 清除
   */
  remove() {
    this.removeDraw()
    this.removeShadow()
    this.removeSun()
    this.toggleMask(false)
    // this.setShadowRatio(0)
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-calendar-picker,
  .ant-time-picker {
    width: 100%;
  }
}
.mp-widget-shadow-analysis {
  display: flex;
  flex-direction: column;
}
</style>
