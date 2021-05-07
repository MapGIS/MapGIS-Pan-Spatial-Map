<template>
  <div class="frame cloumn">
    <div class="col-auto row items-center q-py-sm">
      <label class="col-auto">比例尺：</label>
      <q-select
        dense
        outlined
        :options="scaleArray"
        v-model="scale"
        class="col"
      />
    </div>
    <div class="col-auto row items-center q-py-sm">
      <label class="col-auto">图幅号：</label>
      <q-space />
      <q-input dense outlined class="col" v-model="keyword">
        <template v-slot:append>
          <q-icon name="clear" class="cursor-pointer" @click="keyword = ''" />
        </template>
      </q-input>
      <q-space />
      <q-btn
        round
        flat
        dense
        icon="search"
        :color="themeStyle.color"
        @click="search()"
      />
    </div>
    <label class="col-auto q-py-sm">选择图幅：</label>
    <q-list
      class="col-auto q-py-sm"
      dense
      bordered
      separator
      style="height: 200px; overflow: auto"
    >
      <q-item
        dense
        v-for="item in list"
        :key="item"
        clickable
        v-ripple
        @click="select(item)"
      >
        {{ item }}
      </q-item>
    </q-list>
    <q-pagination
      class="col-auto"
      v-model="currentPage"
      :max="maxPage"
      :input="true"
    >
    </q-pagination>
    <zone-frame-mapbox
      v-if="is2DMapMode"
      :geojson="geojson"
      :bounds="bounds"
    ></zone-frame-mapbox>
    <zone-frame-cesium
      v-else
      :geojson="geojson"
      :bounds="bounds"
    ></zone-frame-cesium>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Model } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  MapTypeChanageMixin,
  FeatureGeoJSON,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import ZoneFrameMapbox from './ZoneFrameMapbox.vue'
import ZoneFrameCesium from './ZoneFrameCesium.vue'

@Component({
  components: {
    ZoneFrameMapbox,
    ZoneFrameCesium
  }
})
export default class Frame extends Mixins(AppMixin) {
  @Model('change', { type: Object, required: false, default: null })
  private value!: FeatureGeoJSON | null

  private scale = { label: '1:20万', value: 'Scale_20w' }

  private scaleArray = [
    { label: '1:5千', value: 'Scale_5000' },
    { label: '1:1万', value: 'Scale_1w' },
    { label: '1:2万5', value: 'Scale_2w5' },
    { label: '1:5万', value: 'Scale_5w' },
    { label: '1:10万', value: 'Scale_10w' },
    { label: '1:20万', value: 'Scale_20w' },
    { label: '1:25万', value: 'Scale_25w' },
    { label: '1:50万', value: 'Scale_50w' },
    { label: '1:100万', value: 'Scale_100w' }
  ]

  private currentPage = 1

  private pageCount = 20

  private maxPage = 5

  private list: string[] = []

  private keyword = ''

  private geojson: Record<string, any> = {}

  private bounds: Record<string, any> = {}

  @Watch('currentPage', { immediate: true, deep: true })
  @Watch('scale', { immediate: true, deep: true })
  private async search() {
    const scale = this.scale.value
    const {
      data: { msg, total }
    } = await utilInstance.getFrameNoList(
      scale,
      this.currentPage,
      this.pageCount,
      this.keyword
    )
    this.list = msg
    this.maxPage = Math.ceil(total / 20)
  }

  private async select(item: string) {
    const {
      data: { XMin, YMin, XMax, YMax }
    } = await utilInstance.getRectByFrameNo(item)
    this.clear()
    this.geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [XMin, YMin],
                [XMax, YMin],
                [XMax, YMax],
                [XMin, YMax],
                [XMin, YMin]
              ]
            ]
          }
        }
      ]
    }
    this.bounds = {
      xmin: 2 * XMin - XMax,
      ymin: 2 * YMin - YMax,
      xmax: 2 * XMax - XMin,
      ymax: 2 * YMax - YMin
    }
    this.$emit('change', this.geojson)
  }

  private clear() {
    this.$emit('change', null)
  }

  private deactivated() {
    this.clear()
  }
}
</script>

<style lang="scss"></style>
