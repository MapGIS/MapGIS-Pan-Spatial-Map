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
        <span>服务地址：</span>
        <a-input v-model="ogcInfo.url"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称：</span>
        <a-input v-model="ogcInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isTianDiTu">
      <div class="input-item">
        <span>图层类型：</span>
        <a-select class="select-first" v-model="tdtInfo.layerType">
          <a-select-option v-for="item in tdtLayerTypes" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </div>
      <div class="input-item">
        <span class="special-title">token：</span>
        <a-input v-model="tdtInfo.token"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称：</span>
        <a-input v-model="tdtInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isArcGIS">
      <div class="input-item">
        <span>服务范围：</span>
        <a-input v-model="arcgisInfo.extend"></a-input>
      </div>
      <div class="input-item">
        <span>服务地址：</span>
        <a-input v-model="arcgisInfo.url"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称：</span>
        <a-input v-model="arcgisInfo.name"></a-input>
      </div>
    </template>

    <template v-if="isMapGIS">
      <igs-server :dataType="option" @updateData="changeIgsData" />
    </template>

    <template v-if="isBaidu || isGaode || isGoogle || isGoogleExt">
      <div class="input-item">
        <span>图层类型：</span>
        <a-input v-model="baiduGaodeGoogleInfo.layerType"></a-input>
      </div>
      <div class="input-item">
        <span>服务名称：</span>
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
import IgsServer from './MapGISSelects/IgsServer.vue'

@Component({
  components: {
    IgsServer
  }
})
export default class ServiceTypeSelect extends Vue {
  @Model('change') readonly value!: Record<string, unknown> | null

  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 服务类型选中项
  private option: any = ''

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
.input-item {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .special-title {
    width: 79px;
  }

  .ant-input,
  .ant-select {
    margin-left: 4px;
    flex-grow: 1;
  }
}
</style>
