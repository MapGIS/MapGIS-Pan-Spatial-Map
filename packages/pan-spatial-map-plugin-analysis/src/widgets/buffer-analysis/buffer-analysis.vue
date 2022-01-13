<template>
  <div class="mp-widget-buffer-analysis">
    <div id="widgets-ui" v-if="isWidgetOpen">
      <mapgis-ui-group-tab title="选择数据" id="title-space"/>
      <mapgis-ui-form-model v-bind="{labelCol: {span: 6}, wrapperCol: {span: 17}}" :layout="layout" :labelAlign="'left'">
        <mapgis-ui-form-model-item label="选择图层" :colon="false">
          <mapgis-ui-row>
            <mapgis-ui-col>
              <mapgis-ui-select v-model="tDataIndex" @change="tchangeTarget($event)" v-if="!selectLevel">
                <mapgis-ui-select-option v-for="(item, index) in layerArrOption" :key="index" :value="index">{{ item.title }}</mapgis-ui-select-option>
              </mapgis-ui-select>
              <mapgis-ui-select v-model="tDataIndex" @change="tchangeTarget" v-if="selectLevel" disabled>
                <mapgis-ui-select-option v-for="(item, index) in layerArrOption" :key="index" :value="index">{{ item.title }}</mapgis-ui-select-option>
              </mapgis-ui-select>
            </mapgis-ui-col>
          </mapgis-ui-row>
          <mapgis-ui-checkbox :default-checked="selectLevel" @change="changeSelectLevel">只对选择数据进行操作</mapgis-ui-checkbox>
        </mapgis-ui-form-model-item>
      </mapgis-ui-form-model>
    </div>
    <!-- 使用缓冲区分析组件 -->
    <mapgis-3d-buffer-analysis
      :layout='layout'
      :baseUrl='baseBufferUrl'
      :srcType='srcType'
      :srcLayer='srcLayer'
      :srcFeature='srcFeature'
      @listenLayer='showLayer'
      @listenFeature='showFeature(arguments)'
      @listenBufferAdd='showAdd'
      @load='load'
    ></mapgis-3d-buffer-analysis>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin,
} from '@mapgis/web-app-framework'
import { Style } from "@mapgis/webclient-es6-service";
import {
  eventBus,
  events
} from '@mapgis/pan-spatial-map-common'
import { ActiveResultSet } from '../../../../pan-spatial-map-common/src/active-result-set'

const { FillStyle } = Style;

@Component({
  name: 'MpBufferAnalysis',
})
export default class MpBufferAnalysis extends Mixins(WidgetMixin) {
  private layout =  "horizontal"

  private baseBufferUrl = "http://localhost:6163/"

  private srcType = "Layer"

  private srcLayer = ""

  private srcFeature = {}

  private buffer = null

  tDataIndex = null

  isFullScreen = false

  isWidgetOpen = false

  featureStyle = new FillStyle({
		color: "rgba(255,0,0,1)",
		outlineColor: "rgba(255,0,0,1)",
		outlineWidth: 3,
		opacity: 1,
	})

  selectLevel = false

  private destLayer = ''

  private feature = undefined

  add = false

  finishL = false

  finishF = false

  changeSelectLevel() {
    this.selectLevel = !this.selectLevel
    if (this.selectLevel == false) {
      this.srcType = "Layer"
    } else {
      this.srcType = "Feature"
      if (JSON.stringify(ActiveResultSet.activeResultSet) == "{}") {
      } else {
        this.srcFeature = ActiveResultSet.activeResultSet
      }
    }
  }

  // 监听图层列表，当图层发生变化时动态改变layerArrOption数组
  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.tDataIndex = null
    this.layerArrOption = []
    const arr = []
    val.layers().forEach(data => {
      if (
        data.type === LayerType.IGSMapImage ||
        data.type === LayerType.IGSVector
      ) {
        arr.push(data)
      }
    })
    if (arr.length > 0) {
      this.layerArrOption = arr
      this.tDataIndex = 0
    }
    this.tchangeTarget()
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  load(buffer) {
    this.buffer = buffer
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.isWidgetOpen = true
    if (this.layerArrOption.length != 0) {
      this.baseBufferUrl = this.layerArrOption[0].url
      this.srcLayer = this.layerArrOption[0].gdbps
      const layerObj = this.layerArrOption
      const layerUrl = layerObj.map((item, index, layerObj) => {
        return item.gdbps
      })
    }
    this.buffer.mount()
  }

  get tData() {
    if (this.tDataIndex !== null) {
      return this.layerArrOption[this.tDataIndex]
    }
    return null
  }

  tchangeTarget(event) {
    const layerCurrent = this.tData
    if (layerCurrent != null) {
      this.baseBufferUrl = layerCurrent.url
      this.srcLayer = layerCurrent.gdbps
    }
  }

  getResultLayer() {
    const url = `${this.baseBufferUrl}?gdbps=${this.destLayer}`
    const index = url.lastIndexOf("/")
    const layerName = url.substring(index + 1, url.length)
    return [url, layerName]
  }

  /**
   * 若缓冲区分析生成新图层，将结果显示在地图容器中，并用图层列表管理
   */
  addNewLayer() {
    const resultLayer: Array<string> = this.getResultLayer()
    const data = {
      name: 'IGS图层',
      description: '综合分析_结果图层',
      data: {
        type: 'IGSVector',
        url: resultLayer[0],
        name: resultLayer[1]
      }
    }
    eventBus.$emit(events.ADD_DATA_EVENT, data)
  }

  /**
   * 要素级增加GeoJsonLayer支持
   */
  addNewGeoJsonLayer() {
    const resultFeature = this.feature
    const data = {
      name: 'GeoJson图层',
      description: '综合分析_结果图层',
      data: {
        type: 'GeoJson',
        url: this.destLayer,
        source: resultFeature,
        featureStyle: this.featureStyle,
        name: this.destLayer,
      }
    }
    eventBus.$emit(events.ADD_DATA_EVENT, data)
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.isWidgetOpen = false
    this.reset()
    this.add = false
    this.buffer.unmount()
  }

  reset() {
    this.isFullScreen = false
    this.destLayer = ''
    this.selectLevel = false
    this.srcType = "Layer"
  }

  showLayer(data) {
    this.finishL = true
    this.destLayer = data
    if (this.add == true) {
      this.addNewLayer()
    }
  }

  showFeature(data) {
    [this.feature, this.destLayer, this.featureStyle] = data
    this.finishF = true
    if (this.add == true) {
      this.addNewGeoJsonLayer()
    }
  }

  showAdd(data) {
    this.add = data
  }

}
</script>

<style lang="less" scoped>
.mp-widget-buffer-analysis {
  height: 480px;
  overflow-y: auto;
  padding: 10px 10px 10px 15px;
  margin-left: 5px;
}
#widgets-ui {
  height: 130px;
  z-index: 100000;
  margin-bottom: -15px;
}
</style>
