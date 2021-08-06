<template>
  <div class="mp-widget-network-analysis">
    <div id="network-analysis-el">
      <a-spin :spinning="showLoading">
        <mp-setting-form :wrapper-width="180">
          <a-form-item label="选择数据">
            <a-select v-model="layerSelectIndex" @change="setNetWorkLayer">
              <a-select-option
                v-for="(item, index) in layerArrOption"
                :key="index"
                :value="index"
              >
                {{ item.title }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="选择图层">
            <a-select v-model="networkLayerIndex" @change="resetLayer">
              <a-select-option
                v-for="(item, index) in networkLayerOption"
                :key="index"
                :value="index"
              >
                {{ item.title }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="选择方式">
            <a-select v-model="wayIndex" @change="resetLayer">
              <a-select-option
                v-for="(item, index) in wayOptions"
                :key="index"
                :value="index"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="showButton" label="选择类型">
            <a-radio-group v-model="groupRadio" :options="optionsRadio">
            </a-radio-group>
          </a-form-item>
        </mp-setting-form>
        <div v-if="showButton" class="control-button-container">
          <a-button class="control-button" @click="createMarker(null, 'dots')">
            绘制目标
          </a-button>
          <a-button
            class="control-button"
            @click="createMarker(null, 'barrier')"
          >
            绘制障碍
          </a-button>
        </div>

        <div v-if="!showButton" class="control-button-container">
          <a-button class="control-button" @click="createMarker('1', 'dots')">
            点上网标
          </a-button>
          <a-button class="control-button" @click="createMarker('2', 'dots')">
            线上网标
          </a-button>
        </div>
        <div class="control-button-container">
          <a-button class="control-button" @click="clearClick">
            结束绘制
          </a-button>
          <a-button class="control-button" @click="resetLayer">
            清空
          </a-button>
        </div>
        <a-tabs type="card" v-model="tab" size="small">
          <a-tab-pane key="coordinateArr" tab="坐标点集">
            <mp-coordinate-table
              :data="dataCoordinateArr.features"
              :columns="columnsCoordinateArr"
              :isFullScreen="isFullScreen"
              @deleteRow="deleteRow"
              @rowClick="rowClick"
              :showButton="!showButton"
            ></mp-coordinate-table>
          </a-tab-pane>
          <a-tab-pane v-if="showButton" key="hinderArr" tab="障碍点集">
            <mp-hinder-table
              :data="dataBarrierArr.features"
              :columns="columnsCoordinateArr"
              :isFullScreen="isFullScreen"
              @deleteRow="deleteRow"
              @rowClick="rowClick"
            ></mp-hinder-table>
          </a-tab-pane>
          <a-tab-pane key="analysisRes" tab="分析结果">
            <mp-anakysis-result-table
              :isFullScreen="isFullScreen"
              ref="MpNetworkAnalysis"
              @draw-high-result="drawHighResult"
              @draw-result="drawResult"
              @fly-to-high="flyToHigh"
            />
          </a-tab-pane>
        </a-tabs>
        <div class="analysis-actions">
          <!-- <a-button @click="showSetting" :disable="showLoading"
              >设置参数</a-button
            > -->
          <a-button
            type="primary"
            @click="startAnalysis"
            :disable="showLoading"
          >
            分析
          </a-button>
        </div>
      </a-spin>
    </div>
    <mapbox-layer
      v-if="is2DMapMode"
      ref="mapboxLayer"
      :dataBarrierArr="dataBarrierArr"
      :dataCoordinateArr="dataCoordinateArr"
      :marker="centerMarker"
      :result="result"
      :highResultSource="highResultSource"
      :color="color"
      @finish-draw="clickFunciton"
    />
    <cesium-layer
      v-else
      ref="cesiumLayer"
      :dataBarrierArr="dataBarrierArr"
      :dataCoordinateArr="dataCoordinateArr"
      :marker="centerMarker"
      :result="result"
      :highResultSource="highResultSource"
      :color="color"
      @finish-draw="clickFunciton"
    ></cesium-layer>
    <a-modal v-model="settingDialog" title="设置参数" centered :footer="null">
      <setting v-model="settingForm" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin,
  Analysis,
  UUID
} from '@mapgis/web-app-framework'
import {
  dataCatalogInstance,
  utilInstance,
  markerIconInstance
} from '@mapgis/pan-spatial-map-store'
import dataCatalog from '@mapgis/pan-spatial-map-store/src/data-catalog/data-catalog'
import MpHinderTable from './hinder-table'
import MpCoordinateTable from './coordinate-table'
import MpAnakysisResultTable from './analysis-result-table'
import setting from './setting'
import mapboxLayer from './map-layer/mapbox-layer.vue'
import cesiumLayer from './map-layer/cesium-layer'

@Component({
  name: 'MpNetworkAnalysis',
  components: {
    MpHinderTable,
    MpCoordinateTable,
    setting,
    MpAnakysisResultTable,
    mapboxLayer,
    cesiumLayer
  }
})
export default class MpNetworkAnalysis extends Mixins(WidgetMixin) {
  settingForm = {
    analyTp: 'UserMode',
    nearDis: 0.01,
    wid1: 'Weight1',
    wid2: 'Weight1',
    wid3: 'Weight1'
  }

  // 分时分析加载框
  showLoading = false

  settingDialog = false

  // 地图划线颜色
  color = 'rgba(39,194,76,1)'

  layerSelectIndex = null

  layerArrOption = []

  centerMarker = null

  // 选择图层下标
  networkLayerIndex = null

  // 选择图层的 数组
  networkLayerOption: array = []

  wayIndex = 0

  // 判断点上、线上类型
  clickRadio = null

  // 根据该类型判断是否需要跳转到障碍物table
  clickType = 'dots'

  tab = 'coordinateArr'

  groupRadio = '1'

  optionsRadio = [
    {
      label: '点上网标',
      value: '1'
    },
    {
      label: '线上网标',
      value: '2'
    }
  ]

  // 点集的source
  dataCoordinateArr = {
    type: 'FeatureCollection',
    features: []
  }

  circleColor = {
    'circle-radius': 5, // 半径
    'circle-color': '#FF9933', // 颜色
    'circle-opacity': 1 // 透明度
  }

  // 点集的source
  dataBarrierArr = {
    type: 'FeatureCollection',
    features: []
  }

  highResultSource = { type: 'FeatureCollection', features: [] }

  result = {
    layerPoint: { type: 'FeatureCollection', features: [] },
    layerLine: { type: 'FeatureCollection', features: [] }
  }

  get drawComponent() {
    return this.is2DMapMode ? this.$refs.mapboxLayer : this.$refs.cesiumLayer
  }

  // 面板关闭时候触发函数
  onClose() {
    this.resetLayer()
  }

  wayOptions = [
    {
      id: 'connectAnalysis',
      name: '连通分析',
      workflowId: '600336'
    },
    {
      id: 'disconnectAnalysis',
      name: '非连通分析',
      workflowId: '600336'
    },
    {
      id: 'pathAnalysis',
      name: '路径分析',
      workflowId: '600233'
    }
  ]

  get way() {
    if (this.wayIndex !== null) {
      return this.wayOptions[this.wayIndex]
    }
    return null
  }

  // 选择数据
  get layerSelect() {
    if (this.layerSelectIndex !== null) {
      return this.layerArrOption[this.layerSelectIndex]
    }
    return null
  }

  // 选择图层
  get networkLayer() {
    if (this.networkLayerIndex !== null) {
      return this.networkLayerOption[this.networkLayerIndex]
    }
    return null
  }

  get showButton() {
    return this.way.id === 'pathAnalysis'
  }

  get columnsCoordinateArr() {
    const itemWidth = this.isFullScreen ? {} : { width: '120px' }
    if (!this.showButton) {
      return [
        {
          title: '',
          key: 'index',
          scopedSlots: { customRender: 'index' },
          width: '40px',
          align: 'center'
        },
        {
          title: 'X坐标',
          dataIndex: 'geometry.coordinates[0]',
          scopedSlots: { customRender: 'x' },
          ellipsis: true,
          align: 'center',
          ...itemWidth
        },
        {
          title: 'Y坐标',
          dataIndex: 'geometry.coordinates[1]',
          scopedSlots: { customRender: 'y' },
          ellipsis: true,
          align: 'center',
          ...itemWidth
        },
        {
          title: '类型',
          dataIndex: 'properties.type',
          scopedSlots: { customRender: 'type' },
          ellipsis: true,
          width: '60px',
          align: 'center'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: '60px',
          align: 'center'
        }
      ]
    }
    return [
      {
        title: '',
        key: 'index',
        scopedSlots: { customRender: 'index' },
        width: '40px',
        align: 'center'
      },
      {
        title: 'X坐标',
        dataIndex: 'geometry.coordinates[0]',
        scopedSlots: { customRender: 'x' },
        ellipsis: true,
        align: 'center',
        ...itemWidth
      },
      {
        title: 'Y坐标',
        dataIndex: 'geometry.coordinates[1]',
        scopedSlots: { customRender: 'y' },
        ellipsis: true,
        align: 'center',
        ...itemWidth
      },
      {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' },
        width: '60px',
        align: 'center'
      }
    ]
  }

  isFullScreen = false

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('network-analysis-el')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }

  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.layerSelectIndex = null
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
      this.layerSelectIndex = 0
      this.setNetWorkLayer()
    }
  }

  async startAnalysis() {
    this.clearClick()
    this.clearResult()
    let param
    const type = this.way.id
    const workFlowId = this.way.workflowId
    const netClsUrl = this.networkLayer && this.networkLayer.url
    const { wid1, wid2, wid3, nearDis, analyTp } = this.settingForm
    const weight = [wid1, wid2, wid3].join(',')
    const flagPosStrArray = []
    const elementTypeArray = []
    this.dataCoordinateArr.features.forEach(item => {
      flagPosStrArray.push(item.geometry.coordinates)
      elementTypeArray.push(item.properties.type)
    })
    if (!netClsUrl || flagPosStrArray.length === 0) {
      this.$message.error('参数异常')
      return
    }
    const flagPosStr = flagPosStrArray.join(',')
    if (type === 'connectAnalysis' || type === 'disconnectAnalysis') {
      const flag = this.way.id === 'connectAnalysis'
      this.color = flag ? 'rgba(39,194,76,1)' : 'rgba(255,60,60,1)'
      const elementType = elementTypeArray.join(',')
      param = [
        {
          key: 'netClsUrl',
          value: netClsUrl
        },
        {
          key: 'flag',
          value: flag
        },
        {
          key: 'flagPosStr',
          value: flagPosStr
        },
        {
          key: 'elementType',
          value: elementType
        },
        {
          key: 'nearDis',
          value: nearDis
        },
        {
          key: 'weight',
          value: weight
        },
        {
          key: 'analyTp',
          value: analyTp
        },
        {
          key: 'flowId',
          value: workFlowId
        }
      ]
    } else if (type === 'pathAnalysis') {
      const elementType = this.groupRadio
      const barrierPosStrArray = []
      const bRows = this.dataBarrierArr.features
      for (let i = 0; i < bRows.length; i++) {
        barrierPosStrArray.push(bRows[i].geometry.coordinates)
      }
      const barrierPosStr = barrierPosStrArray.join(',')
      param = [
        {
          key: 'netClsUrl',
          value: netClsUrl
        },
        {
          key: 'flagPosStr',
          value: flagPosStr
        },
        {
          key: 'elementType',
          value: elementType
        },
        {
          key: 'barrierPosStr',
          value: barrierPosStr
        },
        {
          key: 'nearDis',
          value: nearDis
        },
        {
          key: 'analyTp',
          value: analyTp
        },
        {
          key: 'weight',
          value: weight
        },
        {
          key: 'outFormat',
          value: 'JSON'
        },
        {
          key: 'flowId',
          value: workFlowId
        }
      ]
      this.color = 'rgba(39,194,76,1)'
    }
    const { ip, port, docName } = this.layerSelect._parseUrl(
      this.layerSelect.url
    )

    const opt = {
      flowID: workFlowId,
      ip,
      port,
      isAsy: false,
      param
    }
    try {
      this.showLoading = true
      const res = await Analysis.WorkflowAnalysis.executeWorkflow(opt)
      this.getStatus(res)
    } catch (error) {
      this.showLoading = false
      this.$message.error('分析失败')
    }
  }

  getStatus(guid) {
    const { ip, port, docName } = this.layerSelect._parseUrl(
      this.layerSelect.url
    )
    Analysis.WorkflowAnalysis.getWorkflowStatus({
      id: guid,
      ip,
      port
    }).then(status => {
      if (status === 'Succeeded') {
        this.tab = 'analysisRes'
        Analysis.WorkflowAnalysis.getWorkflowResult({
          id: guid,
          ip,
          port
        }).then(res => {
          this.showLoading = false
          this.dealWithExecuteRes(res)
        })
      } else if (status === 'Runing') {
        window.setTimeout(() => {
          this.getStatus(guid)
        }, 1000)
      } else {
        this.showLoading = false
        this.$message.error('分析失败')
      }
    })
  }

  showSetting() {
    this.settingDialog = true
  }

  dealWithExecuteRes(result) {
    if (this.$refs.MpNetworkAnalysis) {
      this.drawComponent && this.drawComponent.clearHighLayer()
      this.drawComponent && this.drawComponent.clearResultLayer()
      this.$refs.MpNetworkAnalysis.clearLayer()
      this.$refs.MpNetworkAnalysis.onValueChange(result)
    }
  }

  clearResult() {
    this.drawComponent && this.drawComponent.clearHighLayer()
    this.drawComponent && this.drawComponent.clearResultLayer()
    this.$refs.MpNetworkAnalysis && this.$refs.MpNetworkAnalysis.clearLayer()
  }

  drawHighResult(val) {
    this.highResultSource = val
  }

  drawResult(val) {
    this.result = val
  }

  flyToHigh(val) {
    this.drawComponent && this.drawComponent.flyToHigh(val)
  }

  resetLayer() {
    this.clearClick()
    this.clearMarker()
    this.clearResult()
    // 点集的source
    this.dataCoordinateArr = {
      type: 'FeatureCollection',
      features: []
    }

    // 点集的source
    this.dataBarrierArr = {
      type: 'FeatureCollection',
      features: []
    }

    this.highResultSource = { type: 'FeatureCollection', features: [] }

    this.result = {
      layerPoint: { type: 'FeatureCollection', features: [] },
      layerLine: { type: 'FeatureCollection', features: [] }
    }
  }

  setNetWorkLayer() {
    this.networkLayerIndex = null
    this.networkLayerOption = []
    const arr = []
    if (!this.layerSelect.allSublayers) {
      if (this.layerSelect.geomType === 'Net') {
        arr.push({
          title: this.layerSelect.title,
          url: this.layerSelect.gdbps
        })
      }
    } else {
      this.layerSelect.allSublayers.forEach(item => {
        if (item.geomType === 'Net') {
          arr.push({
            title: item.title,
            url: item.url
          })
        }
      })
    }

    if (arr.length > 0) {
      this.networkLayerIndex = 0
      this.networkLayerOption = arr
    }
  }

  deleteRow(rowIndex, type) {
    this.centerMarker = null
    if (type === 'dots') {
      this.$delete(this.dataCoordinateArr.features, rowIndex)
    } else {
      this.$delete(this.dataBarrierArr.features, rowIndex)
    }
  }

  async rowClick(row) {
    const img = await markerIconInstance.unSelectIcon()
    this.centerMarker = {
      name: 'coordinate-marker',
      center: row.geometry.coordinates,
      img
    }
    if (this.is2DMapMode) {
      this.map.panTo(row.geometry.coordinates)
    } else {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          row.geometry.coordinates[0],
          row.geometry.coordinates[1],
          this.webGlobe.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  createMarker(val, type) {
    this.clickRadio = val
    this.clickType = type
    if (this.clickType === 'barrier') {
      this.tab = 'hinderArr'
    } else {
      this.tab = 'coordinateArr'
    }
    this.drawComponent && this.drawComponent.onOpenDraw()
  }

  clearClick() {
    this.drawComponent && this.drawComponent.stopDraw()
  }

  clickFunciton(e) {
    const obj = this.clickRadio ? { type: this.clickRadio } : {}
    const data = {
      type: 'Feature',
      properties: obj,
      id: UUID.uuid(),
      geometry: {
        type: 'Point',
        coordinates: [e.shape.x, e.shape.y]
      }
    }
    if (this.clickType === 'barrier') {
      this.dataBarrierArr.features.push(data)
    } else {
      this.dataCoordinateArr.features.push(data)
    }
  }

  clearMarker() {
    this.dataCoordinateArr = {
      type: 'FeatureCollection',
      features: []
    }
    this.dataBarrierArr = {
      type: 'FeatureCollection',
      features: []
    }
    this.centerMarker = null
    this.drawComponent && this.drawComponent.clearDataBarrierArr()
    this.drawComponent && this.drawComponent.clearDataCoordinateArr()
  }
}
</script>

<style lang="less">
.mp-widget-network-analysis {
  display: flex;
  flex-direction: column;
  #network-analysis-el {
    width: 300px;
    max-width: 100%;
  }
  .control-button-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
    .control-button {
      width: calc(~'50% - 2.5px');
    }
  }
  .analysis-actions {
    float: right;
    padding-top: 8px;
  }
}
</style>
