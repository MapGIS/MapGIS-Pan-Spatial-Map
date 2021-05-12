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
      <div
        v-show="showLengthSelect && isMeasureFinished"
        class="measure-result-title"
      >
        测量结果
      </div>
      <div v-show="showLengthSelect && isMeasureFinished" class="result-panel">
        <div class="result-item">
          <span>投影平面长度:</span>
          <span>{{ results.planeLength }}</span>
        </div>
        <div class="result-item">
          <span>椭球实地长度:</span>
          <span>{{ results.ellipsoidLength }}</span>
        </div>
      </div>
      <div
        v-show="showAreaSelect && isMeasureFinished"
        class="measure-result-title"
      >
        测量结果
      </div>
      <div v-show="showAreaSelect && isMeasureFinished" class="result-panel">
        <div class="result-item">
          <span>投影平面周长:</span>
          <span>{{ results.planePerimeter }}</span>
        </div>
        <div class="result-item">
          <span>投影平面面积:</span>
          <span>{{ results.planeArea }}</span>
        </div>
        <div class="result-item">
          <span>椭球实地周长:</span>
          <span>{{ results.ellipsoidPerimeter }}</span>
        </div>
        <div class="result-item">
          <span>椭球实地面积:</span>
          <span>{{ results.ellipsoidArea }}</span>
        </div>
      </div>
    </div>
    <div v-show="showSettingPanel" class="measure-style">
      <div class="measure-style-title">文字样式</div>
      <a-form-model
        :model="formData"
        labelAlign="left"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="字体:">
          <a-select v-model="formData.textType">
            <a-select-option v-for="item in textTypes" :key="item">{{
              item
            }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="字体颜色:">
          <a-input
            class="color-input"
            v-model="formData.textColor"
            :style="{ background: formData.textColor }"
          >
            <div slot="addonAfter">
              <a-popover trigger="click">
                <template slot="content">
                  <sketch-picker
                    :value="formData.textColor"
                    @input="val => getFontColor(val)"
                  />
                </template>
                <a-icon type="edit" />
              </a-popover>
            </div>
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="字号:">
          <a-input v-model.number="formData.textSize" type="number" :min="12">
          </a-input>
        </a-form-model-item>
      </a-form-model>
      <div class="measure-style-title">轮廓线样式</div>
      <a-form-model
        :model="formData"
        labelAlign="left"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="颜色">
          <a-input
            class="color-input"
            v-model="formData.lineColor"
            :style="{ background: formData.lineColor }"
          >
            <a-popover slot="addonAfter" trigger="click">
              <template slot="content">
                <sketch-picker
                  :value="formData.lineColor"
                  @input="val => getLineColor(val)"
                />
              </template>
              <a-icon type="edit" />
            </a-popover>
          </a-input>
        </a-form-item>
        <a-form-item label="样式">
          <a-select v-model="formData.lineType">
            <a-select-option v-for="item in lineTypes" :key="item">{{
              item
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="透明度">
          <a-slider
            v-model="formData.lineOpacity"
            :min="0"
            :max="100"
            :step="1"
            :tip-formatter="formatter"
          ></a-slider>
        </a-form-item>
        <a-form-item label="宽度">
          <a-input v-model.number="formData.lineWidth" type="number" :min="1">
          </a-input>
        </a-form-item>
      </a-form-model>
    </div>
    <mapbox-measure
      ref="mapboxMeasure"
      v-show="is2DMapMode"
      :measureSetting="formData"
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
  private formData = {
    textType: '宋体',
    textColor: '#1890ff',
    textSize: '14',
    lineColor: '#1890ff',
    lineType: '实线',
    lineOpacity: 100,
    lineWidth: 3
  }

  // 字体下拉框配置
  private textTypes = ['宋体', '楷体', '微软雅黑']

  // 轮廓线下拉框配置
  private lineTypes = ['实线', '虚线']

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

  // 选中文字颜色拾取器对应事件
  private getFontColor(val) {
    this.formData.textColor = val.hex
  }

  // 选中轮廓线颜色拾取器对应事件
  private getLineColor(val) {
    this.formData.lineColor = val.hex
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
    .measure-result-title {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 8px;
      font-weight: bold;
    }
    .result-item {
      margin-top: 8px;
    }
    .result-item :nth-child(2) {
      margin-left: 8px;
    }
  }
  .measure-style {
    .measure-style-title {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 0;
      font-weight: bold;
    }
    .ant-form-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;
    }
    .color-input {
      ::v-deep .ant-input-wrapper,
      ::v-deep .ant-input {
        background: inherit;
      }
      ::v-deep .ant-input-group-addon {
        background: inherit;
        cursor: pointer;
      }
    }
  }
}
</style>
