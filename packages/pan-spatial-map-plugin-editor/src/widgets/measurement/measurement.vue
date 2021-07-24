<template>
  <div class="mp-widget-measurement">
    <mp-toolbar>
      <mp-toolbar-command-group v-show="is2DMapMode">
        <mp-toolbar-command
          v-for="item in planeMeasureModes"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          @click="onOpenMeasure(item.mode)"
        />
      </mp-toolbar-command-group>
      <!-- 三维模式下的key值为每项的mode，避免和二维模式的key值重复 -->
      <mp-toolbar-command-group v-show="!is2DMapMode">
        <mp-toolbar-command
          v-for="item in cesiumMeasureModes"
          :key="item.mode"
          :title="item.title"
          :icon="item.icon"
          @click="onOpenMeasure(item.mode)"
        />
      </mp-toolbar-command-group>
      <div v-show="is2DMapMode" class="unit">
        <a-select
          size="small"
          v-show="showLengthSelect"
          v-model="activeDistanceSelect"
        >
          <a-select-option v-for="item in getSelectOptions" :key="item">
            {{ item }}
          </a-select-option>
        </a-select>
        <a-select
          size="small"
          v-show="showAreaSelect"
          v-model="activeAreaSelect"
        >
          <a-select-option v-for="item in getSelectOptions" :key="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
      <mp-toolbar-space />
      <mp-toolbar-command-group>
        <mp-toolbar-command
          title="清除"
          icon="delete"
          @click="onClearMeasure"
        />
        <mp-toolbar-command
          v-show="is2DMapMode"
          title="设置"
          icon="setting"
          :active="showSettingPanel"
          @click="showSettingPanel = !showSettingPanel"
        />
      </mp-toolbar-command-group>
    </mp-toolbar>
    <div v-show="is2DMapMode">
      <div
        v-show="showLengthSelect && isMeasureFinished"
        class="measure-result"
      >
        <div class="result-item">
          <span class="name">投影平面长度: </span>
          <span class="value">{{ results.planeLength }}</span>
        </div>
        <div class="result-item">
          <span class="name">椭球实地长度: </span>
          <span class="value">{{ results.ellipsoidLength }}</span>
        </div>
      </div>
      <div v-show="showAreaSelect && isMeasureFinished" class="measure-result">
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
    <div v-show="!is2DMapMode">
      <div
        v-show="showLengthSelect && isMeasureFinished"
        class="measure-result"
      >
        <div class="result-item">
          <span class="name">直线距离: </span>
          <span class="value">{{ results.cesiumLength }}千米</span>
        </div>
      </div>
      <div v-show="showAreaSelect && isMeasureFinished" class="measure-result">
        <div class="result-item">
          <span class="name">空间面积: </span>
          <span class="value">{{ results.cesiumArea }}平方公里</span>
        </div>
      </div>
      <div
        v-show="showTriangleSelect && isMeasureFinished"
        class="measure-result"
      >
        <div class="result-item">
          <span class="name">高差: </span>
          <span class="value">{{ results.verticalDiatance }}米</span>
        </div>
        <div class="result-item">
          <span class="name">水平距离: </span>
          <span class="value">{{ results.horizontalDiatance }}米</span>
        </div>
      </div>
    </div>
    <div v-show="showSettingPanel && is2DMapMode" class="setting-panel">
      <a-divider></a-divider>
      <mp-setting-form layout="vertical">
        <a-form-item label="字体名称">
          <a-select v-model="measureStyle.textType">
            <a-select-option v-for="item in textTypes" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="字体颜色">
          <mp-color-picker
            :color="measureStyle.textColor"
            :disable-alpha="false"
            @input="onTextColorChange"
          ></mp-color-picker>
        </a-form-item>
        <a-form-item label="字体大小">
          <a-input
            v-model.number="measureStyle.textSize"
            type="number"
            :min="12"
          >
          </a-input>
        </a-form-item>
        <a-form-item label="线样式">
          <a-select v-model="measureStyle.lineType">
            <a-select-option v-for="item in lineTypes" :key="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="线颜色">
          <mp-color-picker
            :color="lineColor"
            :disable-alpha="false"
            @input="onLineColorChange"
          ></mp-color-picker>
        </a-form-item>
        <a-form-item label="线宽度">
          <a-input
            v-model.number="measureStyle.lineWidth"
            type="number"
            :min="1"
          >
          </a-input>
        </a-form-item>
        <a-form-item label="填充颜色">
          <mp-color-picker
            :color="fillColor"
            :disable-alpha="false"
            @input="onFillColorChange"
          ></mp-color-picker>
        </a-form-item>
      </mp-setting-form>
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
    <cesium-measure
      ref="cesiumMeasure"
      v-show="!is2DMapMode"
      :measureStyle="measureStyle"
      @start="onMeasureStart"
      @finished="onMeasureFinished"
    ></cesium-measure>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, ColorUtil } from '@mapgis/web-app-framework'
import MapboxMeasure from './components/MapboxMeasure.vue'
import CesiumMeasure from './components/CesiumMeasure.vue'

@Component({
  name: 'MpMeasurement',
  components: { MapboxMeasure, CesiumMeasure }
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

  // 三维模式下的量算模型组
  private cesiumMeasureModes = [
    {
      mode: 'measure-length',
      title: '长度',
      icon: 'line-chart'
    },
    {
      mode: 'measure-area',
      title: '面积',
      icon: 'area-chart'
    },
    {
      mode: 'measure-triangulation',
      title: '三角',
      icon: 'heat-map'
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
    ellipsoidArea: '',
    cesiumLength: '',
    cesiumArea: '',
    verticalDiatance: '',
    horizontalDiatance: ''
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
    return ColorUtil.hexToRgba(
      this.measureStyle.lineColor,
      this.measureStyle.lineOpacity
    )
  }

  get fillColor() {
    return ColorUtil.hexToRgba(
      this.measureStyle.fillColor,
      this.measureStyle.fillOpacity
    )
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

  // 当前激活项是否为三角测量
  get showTriangleSelect() {
    return this.activeMode === 'measure-triangulation'
  }

  get measureComponent() {
    return this.is2DMapMode
      ? this.$refs.mapboxMeasure
      : this.$refs.cesiumMeasure
  }

  // 二三维地图模式切换时
  @Watch('mapRender')
  mapRenderChange() {
    this.onClearMeasure()
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

  // 清除并关闭测量
  private onClearMeasure() {
    this.measureComponent && this.measureComponent.closeMeasure()

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
}
</script>

<style lang="less" scoped>
.mp-widget-measurement {
  .unit {
    margin: 0 6px;
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
  }
}
</style>
