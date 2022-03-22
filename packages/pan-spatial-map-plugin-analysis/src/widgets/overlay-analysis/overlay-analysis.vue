<template>
  <div class="mp-widget-overlay-analysis">
    <div id="widgets-ui">
		  <mapgis-ui-group-tab title="选择数据" id="title-space"/>
      <mapgis-ui-form-model v-bind="{labelCol: {span: 6}, wrapperCol: {span: 17}}" :layout="layout">
        <mapgis-ui-form-model-item label="叠加图层1" :colon="false">
          <mapgis-ui-row>
            <mapgis-ui-col>
              <mapgis-ui-select v-model="tDataIndex" @change="tchangeTarget">
                <mapgis-ui-select-option v-for="(item, index) in layerArrOption" :key="index" :value="index">{{ item.title }}</mapgis-ui-select-option>
              </mapgis-ui-select>
            </mapgis-ui-col>
          </mapgis-ui-row>
        </mapgis-ui-form-model-item>
        <mapgis-ui-form-model-item label="叠加图层2" :colon="false">
          <mapgis-ui-row>
            <mapgis-ui-col>
              <mapgis-ui-select v-model="dDataIndex" @change="dchangeTarget" v-if="!selectLevel">
                <mapgis-ui-select-option v-for="(item, index) in layerArrOption" :key="index" :value="index">{{ item.title }}</mapgis-ui-select-option>
              </mapgis-ui-select>
              <mapgis-ui-select v-model="dDataIndex" @change="dchangeTarget" v-if="selectLevel" disabled>
                <mapgis-ui-select-option v-for="(item, index) in layerArrOption" :key="index" :value="index">{{ item.title }}</mapgis-ui-select-option>
              </mapgis-ui-select>
            </mapgis-ui-col>
          </mapgis-ui-row>
          <mapgis-ui-checkbox :checked="selectLevel" @change="changeSelectLevel">只对选择数据进行操作</mapgis-ui-checkbox>
        </mapgis-ui-form-model-item>
      </mapgis-ui-form-model>
    </div>
    <mapgis-3d-analysis-overlay
      :layout='layout'
      :baseUrl='baseOverlayUrl'
      :srcType='srcType'
      :srcALayer='srcALayer'
      :srcBLayer='srcBLayer'
      :srcAFeature='srcAFeature'
      :srcBFeature='srcBFeature'
      @listenLayer='showLayer'
      @listenOverlayAdd='showAdd'
      @load='load'
    ></mapgis-3d-analysis-overlay>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin,
} from '@mapgis/web-app-framework'
import {
  eventBus,
  events
} from '@mapgis/pan-spatial-map-common'
import { ActiveResultSet } from '../../../../pan-spatial-map-common/src/active-result-set'


@Component({
  name: 'MpOverlayAnalysis',
})
export default class MpOverlayAnalysis extends Mixins(WidgetMixin) {
  private layout =  "horizontal"

  private baseOverlayUrl = "http://localhost:6163"

  private srcType = "Layer"

  private srcALayer = ""

  private srcBLayer = ""

  private srcAFeature = {}

  private srcBFeature = {}

  private overlay = null

  tDataIndex = null

  dDataIndex = null

  isFullScreen = false

  isWidgetOpen = false

  selectLevel = false

  feature = undefined

  destLayer = ""

  add = false

  finishLayer = false

  finishFeature = false

  changeSelectLevel() {
    this.selectLevel = !this.selectLevel
    if (this.selectLevel == false) {
      this.srcType = "Layer"
    } else {
      this.srcType = "Feature"
      if (JSON.stringify(ActiveResultSet.activeResultSet) == "{}") {
        this.$message.warn('当前选择要素为空，请重新选择')
        this.selectLevel = true
        this.changeSelectLevel()
      } else {
        this.srcAFeature = ActiveResultSet.activeResultSet
      }
    }
  }

  // 监听图层列表，当图层发生变化时动态改变layerArrOption数组
  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.tDataIndex = null
    this.dDataIndex = null
    this.layerArrOption = []
    const arr = []
    val.layers().forEach(data => {
      if (data.type === LayerType.IGSVector) {
        arr.push(data)
      } else if (data.type === LayerType.IGSMapImage) {
        arr.push(...data.sublayers)
      }
    })
    if (arr.length > 0) {
      this.layerArrOption = arr
      this.tDataIndex = 0
      this.dDataIndex = 0
    }
    this.tchangeTarget()
    this.dchangeTarget()
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  load(overlay) {
    this.overlay = overlay
  }

  /**
   * 打开模块
   */
  onOpen() {
    this.isWidgetOpen = true
    this.overlay.mount()
  }

  // 获取当前下拉框中的图层对象和索引值
  get tData() {
    if (this.tDataIndex !== null) {
      return this.layerArrOption[this.tDataIndex]
    }
    return null
  }

  get dData() {
    if (this.dDataIndex !== null) {
      return this.layerArrOption[this.dDataIndex]
    }
    return null
  }

  tchangeTarget() {
    const tlayerCurrent = this.tData
    if (tlayerCurrent != null) {
      if (tlayerCurrent.type == 6) {
        this.baseOverlayUrl = tlayerCurrent.url
        this.srcALayer = tlayerCurrent.gdbps
      } else {
        this.baseOverlayUrl = tlayerCurrent.layer.url
        this.srcALayer = tlayerCurrent.url
      }
    }
  }

  dchangeTarget() {
    const dlayerCurrent = this.dData
    if (dlayerCurrent != null) {
      if (dlayerCurrent.type == 6) {
        this.baseOverlayUrl = dlayerCurrent.url
        this.srcBLayer = dlayerCurrent.gdbps
      } else {
        this.baseOverlayUrl = dlayerCurrent.layer.url
        this.srcBLayer = dlayerCurrent.url
      }
    }
  }

  showLayer(data) {
    this.finishLayer = true
    this.destLayer = data
    if (this.add == true) {
      this.addNewLayer()
    }
  }

  showAdd(data) {
    this.add = data
  }

  addNewLayer() {
    const ip = (this.baseOverlayUrl || "").split('/')[2].split(':')[0]
		const port = (this.baseOverlayUrl || "").split('/')[2].split(':')[1]
    console.log(ip, port)
    // const url = `${this.baseOverlayUrl}?gdbps=${this.destLayer}`
    const url = `http://${ip}:${port}/igs/rest/mrms/layers?gdbps=${this.destLayer}`
    const index = url.lastIndexOf("/")
    const layerName = url.substring(index + 1, url.length)
    const data = {
      name: 'IGS图层',
      description: '综合分析_结果图层',
      data: {
        type: 'IGSVector',
        url,
        name: layerName
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
    this.overlay.unmount()
  }

  reset() {
    this.isFullScreen = false
  }

}
</script>

<style lang="less" scoped>
.mp-widget-overlay-analysis {
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
