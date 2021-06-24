<template>
  <div class="mp-widget-network-analysis">
    <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
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
        <a-select v-model="networkLayerIndex">
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
        <a-select v-model="wayIndex">
          <a-select-option
            v-for="(item, index) in wayOptions"
            :key="index"
            :value="index"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
        <div class="control-button-container">
          <a-button
            v-show="showButton"
            class="control-button"
            @click="createMarker(null, 'dots')"
          >
            绘制目标
          </a-button>
          <a-button
            v-show="showButton"
            class="control-button"
            @click="createMarker(null, 'barrier')"
          >
            绘制障碍
          </a-button>
        </div>

        <div class="control-button-container">
          <a-button
            v-show="!showButton"
            class="control-button"
            @click="createMarker('1', 'dots')"
          >
            点上网标
          </a-button>
          <a-button
            v-show="!showButton"
            class="control-button"
            @click="createMarker('2', 'dots')"
          >
            线上网标
          </a-button>
        </div>
        <div class="control-button-container">
          <a-button class="control-button" @click="clearClick">
            结束绘制
          </a-button>
          <a-button class="control-button" @click="clearMarker">
            清空
          </a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'
import {
  dataCatalogInstance,
  queryFeaturesInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import dataCatalog from '@mapgis/pan-spatial-map-store/src/data-catalog/data-catalog'
import MpHinderTable from './hinder-table'
import MpCoordinateTable from './coordinate-table'
import MpAnakysisResultTable from './analysis-result-table'
import setting from './setting'

@Component({
  name: 'MpNetworkAnalysis',
  components: {
    MpHinderTable,
    MpCoordinateTable,
    setting,
    MpAnakysisResultTable
  }
})
export default class MpNetworkAnalysis extends Mixins(WidgetMixin) {
  layerSelectIndex = null

  layerArrOption = []

  // 选择图层下标
  networkLayerIndex = null

  // 选择图层的 数组
  networkLayerOption: array = []

  wayIndex = null

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

  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.layerSelectIndex = null
    this.layerArrOption = []
    const arr = []
    val.layers().forEach(data => {
      if (data.type === LayerType.IGSMapImage) {
        arr.push(data)
      }
    })
    if (arr.length > 0) {
      this.layerArrOption = arr
      this.layerSelectIndex = 0
      this.setNetWorkLayer()
    }
  }

  setNetWorkLayer() {
    this.networkLayerIndex = null
    this.networkLayerOption = []
    const arr = []
    this.layerSelect.allSublayers.forEach(item => {
      if (['Lin', 'Pnt'].includes(item.geomType)) {
        arr.push(item)
      }
    })
    if (arr.length > 0) {
      this.networkLayerIndex = 0
      this.networkLayerOption = arr
    }
  }

  createMarker(val, type) {
    // this.clickRadio = val
    // this.clickType = type
    // if (this.clickType === 'barrier') {
    //   this.tab = 'hinderArr'
    // } else {
    //   this.tab = 'coordinateArr'
    // }
    // this.map.on('click', this.clickFunciton)
  }

  clearClick() {
    // this.map.off('click', this.clickFunciton)
  }
}
</script>

<style lang="less">
.mp-widget-network-analysis {
  display: flex;
  flex-direction: column;
  .ant-form-item {
    margin-bottom: 10px;
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
  }
}
</style>
