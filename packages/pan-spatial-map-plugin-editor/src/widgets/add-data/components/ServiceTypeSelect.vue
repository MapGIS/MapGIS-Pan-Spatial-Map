<template>
  <div class="service-type-select">
    <div class="container-head">
      <span>服务类型:</span>
      <a-select class="select-first" v-model="option" @change="onChange">
        <a-select-option v-for="(item, index) in serviceTypes" :key="index">{{
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
          <a-select-option
            v-for="(item, index) in tdtLayerTypes"
            :key="index"
            >{{ item }}</a-select-option
          >
        </a-select>
      </div>
      <div class="input-item">
        <span>token：</span>
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
      <!-- <igs-server :dataType="option.value" @update-data="changeIgsDate" /> -->
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
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 服务类型选中项
  private option

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
    return (
      this.option &&
      (this.option.value === 'WMS' || this.option.value === 'WMTS')
    )
  }

  get isTianDiTu() {
    return this.option && this.option.value === 'tianDiTu'
  }

  get isArcGIS() {
    return this.option && this.option.value === 'arcgis'
  }

  get isMapGIS() {
    return (
      this.option &&
      (this.option.value === 'doc' ||
        this.option.value === 'tile' ||
        this.option.value === 'layer')
    )
  }

  get isBaidu() {
    return this.option && this.option.value === 'baidu'
  }

  get isGaode() {
    return this.option && this.option.value === 'gaode'
  }

  get isGoogle() {
    return this.option && this.option.value === 'google'
  }

  get isGoogleExt() {
    return this.option && this.option.value === 'googleExt'
  }

  onChange(value, option) {
    console.log(value)
    console.log(option)
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
}
.select-first {
  margin-left: 16px;
  flex-grow: 1;
}
.input-item {
  width: 100%;
  display: flex;
  align-items: center;

  .ant-input,
  .ant-select {
    margin-left: 16px;
    flex-grow: 1;
  }
}
</style>
