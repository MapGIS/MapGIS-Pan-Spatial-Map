<template>
  <div class="frame-container">
    <a-space direction="vertical" style="width:100%">
      <a-row type="flex" align="middle">
        <a-col>
          <label class="col-auto">比例尺：</label>
        </a-col>
        <a-col :flex="1">
          <a-select :options="scaleArray" v-model="scale" style="width:100%" />
        </a-col>
      </a-row>
      <a-row type="flex" align="middle">
        <a-col>
          <label class="col-auto">图幅号：</label>
        </a-col>
        <a-col :flex="1">
          <a-input-search
            placeholder="请输入关键字"
            v-model="keyword"
            @search="search"
          />
        </a-col>
      </a-row>
      <a-list bordered :data-source="list" size="small">
        <div slot="header">
          选择图幅：
        </div>
        <a-list-item slot="renderItem" slot-scope="item" @click="select(item)">
          {{ item }}
        </a-list-item>
      </a-list>
    </a-space>
    <!-- <q-pagination
      class="col-auto"
      v-model="currentPage"
      :max="maxPage"
      :input="true"
    >
    </q-pagination> -->
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
import { Component, Watch, Mixins, Model, Prop } from 'vue-property-decorator'
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

  @Prop()
  readonly active!: boolean

  private scale = 'Scale_20w'

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

  private maxPage = 0

  private list: string[] = []

  private keyword = ''

  private geojson: Record<string, any> = {}

  private bounds: Record<string, any> = {}

  private get pagination() {
    return {
      pageSize: this.pageCount,
      total: this.maxPage,
      current: this.currentPage,
      onChange: page => {
        this.currentPage = page
      }
    }
  }

  @Watch('currentPage', { immediate: true, deep: true })
  @Watch('scale', { immediate: true })
  private async search() {
    const { scale } = this
    const {
      data: { msg, total }
    } = await utilInstance.getFrameNoList(
      scale,
      this.currentPage,
      this.pageCount,
      this.keyword
    )
    this.list = msg
    this.maxPage = total
  }

  @Watch('active')
  activeChange(val) {
    if (!val) {
      this.clear()
    } else {
      this.getGeoJson()
    }
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
    this.geojson = {}
    this.$emit('change', this.geojson)
  }
}
</script>

<style lang="less">
.frame-container {
  padding-top: 10px;
  .ant-space {
    .ant-space-item {
      .ant-list {
        .ant-spin-nested-loading {
          .ant-spin-container {
            max-height: 200px;
            overflow-y: auto;
          }
        }
      }
    }
  }
}
</style>
