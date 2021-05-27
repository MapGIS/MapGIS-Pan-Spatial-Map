<template>
  <div class="mp-widget-measurement">
    <div class="measure-toolbar">
      <div class="actions">
        <a-tooltip
          v-for="item in planeMeasureModes"
          :key="item.title"
          placement="bottom"
          :title="item.title"
        >
          <a-icon
            class="action"
            @click="onOpenMeasure(item.mode)"
            :type="item.icon"
          />
        </a-tooltip>
      </div>
      <div class="unit">
        <a-select v-show="showLengthSelect" v-model="activeDistanceSelect">
          <a-select-option v-for="item in getSelectOptions" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
        <a-select v-show="showAreaSelect" v-model="activeAreaSelect">
          <a-select-option v-for="item in getSelectOptions" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </div>
      <div class="actions">
        <a-tooltip placement="bottom" title="清除">
          <a-icon class="action" @click="onClearMeasure" type="delete">
          </a-icon>
        </a-tooltip>
        <a-tooltip placement="bottom" title="设置">
          <a-icon
            :class="{ action: true, active: showSettingPanel }"
            @click="showSettingPanel = !showSettingPanel"
            type="setting"
          >
          </a-icon>
        </a-tooltip>
      </div>
    </div>
    <div class="measure-result">
      <div v-show="showLengthSelect && isMeasureFinished">
        <div class="result-item">
          <span class="name">投影平面长度: </span>
          <span class="value">{{ results.planeLength }}</span>
        </div>
        <div class="result-item">
          <span class="name">椭球实地长度: </span>
          <span class="value">{{ results.ellipsoidLength }}</span>
        </div>
      </div>
      <div v-show="showAreaSelect && isMeasureFinished">
        <div class="result-item">
          <span class="name">投影平面周长: </span>
          <span class="value">{{ results.planePerimeter }}</span>
        </div>
        <div class="result-item">
          <span class="name">投影平面面积: </span>
          <span class="value">{{ results.planeArea }}</span>
        </div>
        <div class="result-item">
          <span class="name">椭球实地周长: </span>
          <span class="value">{{ results.ellipsoidPerimeter }}</span>
        </div>
        <div class="result-item">
          <span class="name">椭球实地面积: </span>
          <span class="value">{{ results.ellipsoidArea }}</span>
        </div>
      </div>
    </div>
    <div v-show="showSettingPanel" class="setting-panel">
      <a-divider></a-divider>
      <a-space direction="vertical" style="width: 100%;">
        <a-row>
          <label>字体名称</label>
        </a-row>
        <a-row>
          <a-select v-model="measureStyle.textType" style="width: 100%;">
            <a-select-option v-for="item in textTypes" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-row>
        <a-row>
          <label>字体颜色</label>
        </a-row>
        <a-row>
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker
                :value="measureStyle.textColor"
                @input="onTextColorChange"
              />
            </template>
            <div
              :style="{ background: measureStyle.textColor }"
              class="color"
            ></div>
          </a-popover>
        </a-row>
        <a-row>
          <label>字体大小</label>
        </a-row>
        <a-row>
          <a-input
            v-model.number="measureStyle.textSize"
            type="number"
            :min="12"
          >
          </a-input>
        </a-row>
        <a-row>
          <label>线样式</label>
        </a-row>
        <a-row>
          <a-select v-model="measureStyle.lineType" style="width: 100%;">
            <a-select-option v-for="item in lineTypes" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-row>
        <a-row>
          <label>线颜色</label>
        </a-row>
        <a-row>
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker :value="lineColor" @input="onLineColorChange" />
            </template>
            <div
              :style="{
                background: measureStyle.lineColor,
                opacity: measureStyle.lineOpacity
              }"
              class="color"
            ></div>
          </a-popover>
        </a-row>
        <a-row>
          <label>线宽度</label>
        </a-row>
        <a-row>
          <a-input
            v-model.number="measureStyle.lineWidth"
            type="number"
            :min="1"
          >
          </a-input>
        </a-row>
        <a-row>
          <label>填充颜色</label>
        </a-row>
        <a-row>
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker :value="fillColor" @input="onFillColorChange" />
            </template>
            <div
              :style="{
                background: measureStyle.fillColor,
                opacity: measureStyle.fillOpacity
              }"
              class="color"
            ></div>
          </a-popover>
        </a-row>
      </a-space>
    </div>
    <mapbox-measure
      ref="mapboxMeasure"
      v-show="is2DMapMode"
      :measureStyle="measureStyle"
      :distanceUnit="activeDistanceSelect"
      :areaUnit="activeAreaSelect"
      @finished="onMeasureFinished"
      @start="onMeasureStart"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { Sketch } from 'vue-color'
import MapboxMeasure from './components/MapboxMeasure.vue'

@Component({
  name: 'MpMeasurement',
  components: { 'sketch-picker': Sketch, MapboxMeasure }
})
export default class MpMeasurement extends Mixins(WidgetMixin) {
  private planeMeasureModes = [
    {
      mode: 'measure-length',
      title: '长度',
      icon: 'line-chart'
    },
    {
      mode: 'measure-area',
      title: '面积',
      icon: 'area-chart'
    }
  ]

  // 当前激活项
  private activeMode = ''

  // 编辑面板的显隐
  private showSettingPanel = false

  // 是否测量完毕
  private isMeasureFinished = false

  // 不同激活项对应的下拉框配置
  private selectOptions = {
    'measure-length': ['m', 'km', '米', '千米'],
    'measure-area': ['m2', 'km2', '平方米', '平方千米']
  }

  // 测量长度时下拉值
  private activeDistanceSelect = '千米'

  // 测量面积时下拉值
  private activeAreaSelect = '平方千米'

  // 测量结果集
  private results: Record<string, any> = {
    planeLength: '',
    ellipsoidLength: '',
    planePerimeter: '',
    planeArea: '',
    ellipsoidPerimeter: '',
    ellipsoidArea: ''
  }

  // 样式表单数据对象
  private measureStyle = {
    textType: '宋体',
    textColor: '#1890ff',
    textSize: '14',
    lineType: '实线',
    lineColor: '#1890ff',
    lineOpacity: 1,
    lineWidth: 3,
    fillColor: '#1890ff',
    fillOpacity: 0.4
  }

  // 字体下拉框配置
  private textTypes = ['宋体', '楷体', '微软雅黑']

  // 轮廓线下拉框配置
  private lineTypes = ['实线', '虚线']

  get lineColor() {
    return {
      hex: this.measureStyle.lineColor,
      a: this.measureStyle.lineOpacity
    }
  }

  get fillColor() {
    return {
      hex: this.measureStyle.fillColor,
      a: this.measureStyle.fillOpacity
    }
  }

  // 下拉框配置
  get getSelectOptions() {
    return this.selectOptions[this.activeMode] || []
  }

  // 当前激活项是否为长度测量
  get showLengthSelect() {
    return this.activeMode === 'measure-length'
  }

  // 当前激活项是否为面积测量
  get showAreaSelect() {
    return this.activeMode === 'measure-area'
  }

  get measureComponent() {
    return this.is2DMapMode ? this.$refs.mapboxMeasure : null
  }

  // 二三维地图模式切换时
  @Watch('mapRender')
  mapRenderChange() {
    if (this.is2DMapMode) {
      // 三维测量清除
    } else {
      this.$refs.mapboxMeasure.clearMeasure()
    }

    this.isMeasureFinished = false
  }

  // 微件关闭时
  onClose() {
    this.onClearMeasure()
  }

  // 微件失活时
  onDeActive() {
    this.onClearMeasure()
  }

  // 打开测量，点击图标激活对应类型的测量功能
  private onOpenMeasure(mode) {
    this.activeMode = mode
    this.measureComponent && this.measureComponent.openMeasure(mode)
  }

  // 移除测量
  private onClearMeasure() {
    this.measureComponent && this.measureComponent.clearMeasure()

    this.isMeasureFinished = false
    this.activeMode = ''
  }

  // 'start'响应事件(开始测量)
  private onMeasureStart() {
    this.isMeasureFinished = false
  }

  // 'finished'响应事件(结束测量)
  private onMeasureFinished(results: Record<string, any>) {
    this.isMeasureFinished = true
    this.results = { ...results }
  }

  // 文字颜色拾取器对应事件
  private onTextColorChange(val) {
    this.measureStyle.textColor = val.hex
  }

  // 线颜色拾取器对应事件
  private onLineColorChange(val) {
    this.measureStyle.lineColor = val.hex
    this.measureStyle.lineOpacity = val.a
  }

  // 填充颜色拾取器对应事件
  private onFillColorChange(val) {
    this.measureStyle.fillColor = val.hex
    this.measureStyle.fillOpacity = val.a
  }

  // 格式化滑动条Tooltip内容
  private formatter(value) {
    return `${value}%`
  }
}
</script>

<style lang="less" scoped>
.mp-widget-measurement {
  .measure-toolbar {
    display: flex;
    align-items: center;
    height: 32px;
    .actions {
      display: flex;
      align-items: center;
      text-align: right;
      font-size: 17px;
      color: @text-color;
      .action {
        margin: 0 8px;
        cursor: pointer;
        &:hover,
        &.active {
          color: @primary-color;
        }
        &:first-child {
          margin-left: 0;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .unit {
      flex: 1;
      margin: 0 16px;
    }
  }
  .measure-result {
    font-size: 13px;
    margin-top: 8px;
    .result-item {
      line-height: 20px;
      .name {
        color: @heading-color;
      }
      .value {
        color: @text-color;
      }
    }
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
}
</style>
