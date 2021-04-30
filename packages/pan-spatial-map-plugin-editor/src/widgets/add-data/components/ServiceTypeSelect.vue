<template>
  <div class="service-type-select">
    <div class="row items-center q-pb-sm">
      <span class="col-3 q-pr-xs text-left">服务类型：</span>
      <q-select
        class="col-9 q-px-xs"
        dense
        outlined
        :options="serviceTypes"
        v-model="option"
      />
    </div>

    <template v-if="isOGC">
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务地址：</span>
        <q-input class="col-9 q-px-xs" dense outlined v-model="ogcInfo.url" />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务名称：</span>
        <q-input class="col-9 q-px-xs" dense outlined v-model="ogcInfo.name" />
      </div>
    </template>

    <template v-if="isTianDiTu">
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">图层类型：</span>
        <q-select
          class="col-9 q-px-xs"
          dense
          outlined
          :options="tdtLayerTypes"
          v-model="tdtInfo.layerType"
        />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">token：</span>
        <q-input class="col-9 q-px-xs" dense outlined v-model="tdtInfo.token" />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务名称：</span>
        <q-input class="col-9 q-px-xs" dense outlined v-model="tdtInfo.name" />
      </div>
    </template>

    <template v-if="isArcGIS">
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务范围：</span>
        <q-input
          class="col-9 q-px-xs"
          dense
          outlined
          v-model="arcgisInfo.extend"
        />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务地址：</span>
        <q-input
          class="col-9 q-px-xs"
          dense
          outlined
          v-model="arcgisInfo.url"
        />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务名称：</span>
        <q-input
          class="col-9 q-px-xs"
          dense
          outlined
          v-model="arcgisInfo.name"
        />
      </div>
    </template>

    <template v-if="isMapGIS">
      <igs-server :dataType="option.value" @update-data="changeIgsDate" />
    </template>

    <template v-if="isBaidu || isGaode || isGoogle || isGoogleExt">
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">图层类型：</span>
        <q-input
          class="col-9 q-px-xs"
          dense
          outlined
          v-model="baiduGaodeGoogleInfo.layerType"
        />
      </div>
      <div class="row items-center q-pb-sm">
        <span class="col-3 q-pr-xs text-left">服务名称：</span>
        <q-input
          class="col-9 q-px-xs"
          dense
          outlined
          v-model="baiduGaodeGoogleInfo.name"
        />
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
export default class ServiceTypeSelect extends Vue {}
</script>
