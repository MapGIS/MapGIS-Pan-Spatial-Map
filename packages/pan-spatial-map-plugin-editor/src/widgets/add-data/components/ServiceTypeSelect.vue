<template>
  <div class="service-type-select">
    <div class="container-head">
      <span>服务类型:</span>
      <a-select class="select-first" v-model="option">
        <a-select-option v-for="item in serviceTypes" :key="item.value">{{
          item.label
        }}</a-select-option>
      </a-select>
    </div>

    <template v-if="isOGC">
      <div class="input-item">
        <span>服务地址:</span>
        <a-input v-model="ogcInfo.url"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称:</span>
        <a-input v-model="ogcInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isTianDiTu">
      <div class="input-item">
        <span>图层类型:</span>
        <a-select class="select-first" v-model="tdtInfo.layerType">
          <a-select-option v-for="item in tdtLayerTypes" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </div>
      <div class="input-item">
        <span class="special-title">token:</span>
        <a-input v-model="tdtInfo.token"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称:</span>
        <a-input v-model="tdtInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isArcGIS">
      <div class="input-item">
        <span>服务范围:</span>
        <a-input v-model="arcgisInfo.extend"></a-input>
      </div>
      <div class="input-item">
        <span>服务地址:</span>
        <a-input v-model="arcgisInfo.url"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称:</span>
        <a-input v-model="arcgisInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isMapGIS">
      <div class="mapgis-server">
        <div class="input-item">
          <div class="short-title1">IP地址:</div>
          <a-input class="short-input" v-model="ip"></a-input>
        </div>
        <div class="input-item">
          <div class="short-title2">端口:</div>
          <a-input class="short-input" v-model="port"></a-input>
        </div>
        <div v-if="showLayer" class="input-item">
          <div class="long-title">GDBP地址:</div>
          <MapgisLayer
            :ip="ip"
            :port="port"
            @igsLayerInfo="updateIgsLayerInfo"
          />
        </div>
        <div v-if="showMap" class="input-item">
          <div class="long-title2">地图服务名称:</div>
          <MapgisServer
            :ip="ip"
            :port="port"
            :type="option"
            @serverName="updateServerName"
          ></MapgisServer>
        </div>
      </div>
    </template>

    <template v-if="isBaidu || isGaode || isGoogle || isGoogleExt">
      <div class="input-item">
        <span>图层类型:</span>
        <a-input v-model="baiduGaodeGoogleInfo.layerType"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称:</span>
        <a-input v-model="baiduGaodeGoogleInfo.name"></a-input>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Model,
  Watch,
  Emit,
  Prop
} from 'vue-property-decorator'
import { ServiceType } from '@mapgis/pan-spatial-map-store'
import MapgisLayer from './MapGISSelects/MapgisLayer.vue'
import MapgisServer from './MapGISSelects/MapgisServer.vue'

@Component({
  components: {
    MapgisLayer,
    MapgisServer
  }
})
export default class ServiceTypeSelect extends Vue {
  @Model('change') readonly value!: Record<string, unknown> | null

  // 服务类型下拉项数据
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 服务类型选中项
  private option: any = ''

  // 服务器ip
  private ip = 'develop.smaryun.com'

  // 服务器端口
  private port = '6163'

  private ogcInfo = {
    name: '',
    url: ''
  }

  private tdtLayerTypes = ['img', 'cia', 'vec']

  private tdtInfo = {
    layerType: '',
    token: '2ddaabf906d4b5418aed0078e1657029',
    name: ''
  }

  private arcgisInfo = {
    extend: '',
    url: '',
    name: ''
  }

  private baiduGaodeGoogleInfo = {
    layerType: '',
    name: ''
  }

  get showLayer() {
    return this.option === 'layer'
  }

  get showMap() {
    return this.option === 'doc' || this.option === 'tile'
  }

  get isOGC() {
    return this.option && (this.option === 'WMS' || this.option === 'WMTS')
  }

  get isTianDiTu() {
    return this.option && this.option === 'tianDiTu'
  }

  get isArcGIS() {
    return this.option && this.option === 'arcgis'
  }

  get isMapGIS() {
    return (
      this.option &&
      (this.option === 'doc' ||
        this.option === 'tile' ||
        this.option === 'layer')
    )
  }

  get isBaidu() {
    return this.option && this.option === 'baidu'
  }

  get isGaode() {
    return this.option && this.option === 'gaode'
  }

  get isGoogle() {
    return this.option && this.option === 'google'
  }

  get isGoogleExt() {
    return this.option && this.option === 'googleExt'
  }

  // 配合@Model触发change事件更新value值
  @Emit()
  change(val: Record<string, unknown>) {}

  @Watch('serviceTypes', { deep: true })
  updateServiceTypes() {
    const { type } = this.value || {}
    const selectItem = this.serviceTypes.find(item => item.value === type)
    if (selectItem) {
      this.option = selectItem.value
    }
  }

  @Watch('ogcInfo', { deep: true })
  changeOgcInfo() {
    const type = this.option || {}
    const { url, name } = this.ogcInfo
    this.change({ type, url, name })
  }

  @Watch('tdtInfo', { deep: true })
  changeTdtInfo() {
    const type = this.option || {}
    const { layerType, token, name } = this.tdtInfo
    this.change({ type, layerType, token, name })
  }

  @Watch('arcgisInfo', { deep: true })
  changeArcgisInfo() {
    const type = this.option || {}
    const { extend, url, name } = this.arcgisInfo
    this.change({ type, extend, url, name })
  }

  @Watch('baiduGaodeGoogleInfo', { deep: true })
  changeBaiduGaodeGoogleInfo() {
    const type = this.option || {}
    const { layerType, name } = this.baiduGaodeGoogleInfo
    this.change({ type, layerType, name })
  }

  updateIgsLayerInfo(obj: Record<string, any>) {
    const data = {
      gdbp: obj.gdbp,
      name: obj.name,
      ip: this.ip,
      port: this.port
    }
    console.log(data)
    this.changeIgsData(data)
  }

  updateServerName(val: string) {
    const data = {
      serverName: val,
      ip: this.ip,
      port: this.port
    }
    console.log(data)
    this.changeIgsData(data)
  }

  changeIgsData(obj) {
    const type = this.option
    const { ip, port } = obj
    if (type === 'layer') {
      const { gdbp, name } = obj
      this.change({ type, gdbp, name, ip, port })
    } else {
      const { serverName } = obj
      this.change({ type, serverName, ip, port })
    }
  }
}
</script>

<style lang="less" scoped>
.service-type-select {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.container-head {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 8px 0;
}
.select-first {
  margin-left: 16px;
  flex-grow: 1;
}
.mapgis-server {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.input-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .special-title {
    padding: 0 20px 0 0;
  }

  .ant-input,
  .ant-select {
    margin-left: 16px;
    flex-grow: 1;
  }
  .short-title1 {
    padding: 0 16px 0 0;
  }
  .short-title2 {
    padding: 0 28px 0 0;
  }

  .long-title {
    width: 59px;
    white-space: pre-wrap;
  }
  .long-title2 {
    width: 64px;
    white-space: pre-wrap;
  }
}
</style>
