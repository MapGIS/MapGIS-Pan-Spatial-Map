<template>
  <a-spin :spinning="loading">
    <div class="mp-widget-topology-analysis">
      <a-form
        layout="vertical"
        :class="[isFullScreen === true ? '' : 'fixed-table']"
      >
        <a-form-item label="选择参照要素(区要素)">
          <div class="layer-select-container">
            <a-select v-model="tDataIndex" @change="changeTarget">
              <a-select-option
                v-for="(item, index) in layerArrOption"
                :key="index"
                :value="index"
              >
                {{ item.title }}
              </a-select-option>
            </a-select>
            <a-button @click="draw('target')">
              查询要素
            </a-button>
          </div>
        </a-form-item>
        <a-form-item>
          <div class="tab-list-container">
            <a-tabs size="small" v-model="tDataTab" v-if="tDataArr.length > 0">
              <a-tab-pane
                v-for="item in tDataArr"
                :key="item.id"
                :tab="item.name"
              >
                <feature-list
                  :params="item"
                  :active="tDataTab === item.id"
                  @select-item="val => selectItem(val, 'Target')"
                />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-form-item>
      </a-form>
      <a-divider />
      <a-form
        layout="vertical"
        :class="[isFullScreen === true ? '' : 'fixed-table']"
      >
        <a-form-item label="选择分区要素">
          <div class="layer-select-container">
            <a-select v-model="aDataIndex" @change="changeAnalysis">
              <a-select-option
                v-for="(item, index) in layerArrOption"
                :key="index"
                :value="index"
              >
                {{ item.title }}
              </a-select-option>
            </a-select>
            <a-button @click="draw('analysis')">
              查询要素
            </a-button>
          </div>
        </a-form-item>
        <a-form-item>
          <div class="tab-list-container">
            <a-tabs size="small" v-model="aDataTab" v-if="aDataArr.length > 0">
              <a-tab-pane
                v-for="item in aDataArr"
                :key="item.id"
                :tab="item.name"
              >
                <feature-list
                  :params="item"
                  :active="aDataTab === item.id"
                  @select-item="val => selectItem(val, 'Analysis')"
                />
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="analysis">
              分析
            </a-button>
            <a-tag color="#87d068" v-if="massage">
              {{ massage }}
            </a-tag>
          </a-space>
        </a-form-item>
      </a-form>
      <mapbox-layer
        v-if="is2DMapMode"
        ref="mapboxLayer"
        @finish-draw="clickFunciton"
        :geoJSONTarget="geoJSONTarget"
        :geoJSONAnalysis="geoJSONAnalysis"
      />
      <cesium-layer
        v-else
        ref="cesiumLayer"
        @finish-draw="clickFunciton"
        :geoJSONTarget="geoJSONTarget"
        :geoJSONAnalysis="geoJSONAnalysis"
      ></cesium-layer>
    </div>
  </a-spin>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  LayerType,
  WidgetMixin,
  UUID,
  IGSMapImageLayer,
  IGSVectorLayer
} from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import mapboxLayer from './map-layer/mapbox-layer.vue'
import cesiumLayer from './map-layer/cesium-layer'
import featureList from './feature-list.vue'
import * as Zondy from '@mapgis/webclient-es6-service'

@Component({
  name: 'MpTopologyAnalysis',
  components: {
    mapboxLayer,
    cesiumLayer,
    featureList
  }
})
export default class MpTopologyAnalysis extends Mixins(WidgetMixin) {
  queryType = 'target'

  tDataIndex = null

  aDataIndex = null

  tDataArr = []

  aDataArr = []

  tDataTab = ''

  aDataTab = ''

  isFullScreen = false

  loading = false

  massage = ''

  geoJSONTarget = null

  geoJSONAnalysis = null

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
  }

  get drawComponent() {
    return this.is2DMapMode ? this.$refs.mapboxLayer : this.$refs.cesiumLayer
  }

  // 目标类
  get tData() {
    if (this.tDataIndex !== null) {
      return this.layerArrOption[this.tDataIndex]
    }
    return null
  }

  // 分析类
  get aData() {
    if (this.aDataIndex !== null) {
      return this.layerArrOption[this.aDataIndex]
    }
    return null
  }

  selectItem(geoJSON, type) {
    if (type === 'Target') {
      this.geoJSONTarget = geoJSON
    } else {
      this.geoJSONAnalysis = geoJSON
    }
  }

  changeTarget() {
    this.tDataArr = []

    this.tDataTab = ''

    this.massage = ''

    this.geoJSONTarget = null
  }

  changeAnalysis() {
    this.aDataArr = []

    this.aDataTab = ''

    this.massage = ''

    this.geoJSONAnalysis = null
  }

  @Watch('document.defaultMap', { deep: true, immediate: true })
  documentChange(val: Array<unknown>) {
    this.aDataIndex = null
    this.tDataIndex = null
    this.layerArrOption = []
    this.changeTarget()
    this.changeAnalysis()
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
      this.aDataIndex = 0
      this.tDataIndex = 0
    }
  }

  draw(type) {
    this.queryType = type
    this.drawComponent && this.drawComponent.onOpenDraw()
  }

  clickFunciton(e) {
    if (this.queryType === 'target') {
      this.tDataArr = []
      this.tDataTab = ''
    } else {
      this.aDataArr = []
      this.aDataTab = ''
    }
    const { xmin, ymin, xmax, ymax } = e.shape
    const geo = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
    const layer = this.queryType === 'target' ? this.tData : this.aData
    if (layer) {
      if (layer.type === LayerType.IGSMapImage) {
        this.queryFeaturesByDoc(layer, geo)
      } else if (layer.type === LayerType.IGSVector) {
        this.quertFeatruesByVector(layer, geo)
      }
    }
  }

  private queryFeaturesByDoc(layer: IGSMapImageLayer, geometry) {
    if (!layer.isVisible) {
      return
    }
    const { ip, port, docName } = layer._parseUrl(layer.url)

    const arr = []
    const sublayers = layer.allSublayers
    sublayers.forEach(sublayer => {
      if (!sublayer.visible) {
        return
      }
      arr.push({
        id: sublayer.id,
        name: sublayer.title,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: layer.type,
        layerIndex: sublayer.id,
        serverName: docName,
        serverUrl: layer.url,
        geometry: geometry
      })
    })
    if (this.queryType === 'target') {
      this.tDataArr = arr
      this.tDataTab = arr.length > 0 ? arr[0].id : ''
    } else {
      this.aDataArr = arr
      this.aDataTab = arr.length > 0 ? arr[0].id : ''
    }
  }

  private quertFeatruesByVector(layer: IGSVectorLayer, geometry) {
    if (!layer.isVisible) {
      return
    }
    const { ip, port, docName } = layer._parseUrl(layer.url)

    const arr = [
      {
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: layer.type,
        gdbp: layer.gdbps,
        geometry: geometry,
        name: layer.title
      }
    ]
    if (this.queryType === 'target') {
      this.tDataArr = arr
      this.tDataTab = arr.length > 0 ? arr[0].id : ''
    } else {
      this.aDataArr = arr
      this.aDataTab = arr.length > 0 ? arr[0].id : ''
    }
  }

  analysis() {
    if (this.geoJSONAnalysis && this.geoJSONTarget) {
      this.loading = true
      this.massage = ''
      const target = this.geoJSONTarget.features[0].properties
      const analysis = this.geoJSONAnalysis.features[0].properties
      const { ip, port } = baseConfigInstance.config
      let analysisService

      if (target.ftype === 1) {
        const targetGeom = target.fGeom.PntGeom[0]
        analysisService = new Zondy.MRGS.TopAnalysis({
          relativeObj: targetGeom,
          ip,
          port
        })
      } else if (target.ftype === 2) {
        const targetGeom = target.fGeom.LinGeom[0]
        analysisService = new Zondy.MRGS.TopAnalysis({
          relativeObj: targetGeom,
          ip,
          port
        })
      } else if (analysis.ftype === 3) {
        const targetGeom = target.fGeom.RegGeom[0]
        analysisService = new Zondy.MRGS.TopAnalysis({
          relativeObj: targetGeom,
          ip,
          port
        })
      }
      if (analysis.ftype === 1) {
        const analysisGeom = analysis.fGeom.PntGeom[0]
        analysisService.setPnt(analysisGeom)
      } else if (analysis.ftype === 2) {
        const analysisGeom = analysis.fGeom.LinGeom[0]
        analysisService.setLine(analysisGeom)
      } else if (analysis.ftype === 3) {
        const analysisGeom = analysis.fGeom.RegGeom[0]
        analysisService.setReg(analysisGeom)
      }
      analysisService.execute(
        res => {
          let msg = ''
          if (res === 'Include') {
            msg = '包含'
          } else if (res === 'Disjoin') {
            msg = '相离'
          } else if (res === 'Intersect') {
            msg = '相交'
          } else {
            msg = '相邻'
          }
          this.loading = false
          this.massage = `分析结果: ${msg}`
        },
        () => {
          this.loading = false
        }
      )
    } else {
      this.$message.error('未选择要素')
    }
  }

  // 面板关闭时候触发函数
  onClose() {
    this.reset()
  }

  reset() {
    this.queryType = 'target'

    // this.tDataIndex = null

    // this.aDataIndex = null

    this.tDataArr = []

    this.aDataArr = []

    this.tDataTab = ''

    this.aDataTab = ''

    this.isFullScreen = false

    this.loading = false

    this.massage = ''

    this.geoJSONTarget = null

    this.geoJSONAnalysis = null
  }
}
</script>

<style lang="less">
.mp-widget-topology-analysis {
  .fixed-table {
    width: 250px;
  }
  .ant-form-item {
    margin-bottom: 0;
    .tab-list-container {
      border-radius: 4px;
      height: 250px;
      border: 1px solid @border-color;
    }
    .layer-select-container {
      display: flex;
      .ant-btn {
        margin-left: 10px;
      }
    }
    .ant-tabs-bar {
      margin: 0;
    }
  }
}
</style>
