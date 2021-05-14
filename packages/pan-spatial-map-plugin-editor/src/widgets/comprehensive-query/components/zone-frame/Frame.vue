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
          <a-input placeholder="请输入关键字" allowClear v-model="keyword" />
        </a-col>
      </a-row>
      <a-list
        :loading="loading"
        :data-source="searchList"
        :pagination="pagination"
        size="small"
      >
        <div slot="header">
          选择图幅：
        </div>
        <a-list-item
          slot="renderItem"
          slot-scope="item"
          @click="select(item)"
          :class="{ 'select-item': selectItem === item }"
        >
          <template
            v-if="item.toUpperCase().indexOf(keyword.toUpperCase()) > -1"
          >
            <span>{{
              item.substr(0, item.toUpperCase().indexOf(keyword.toUpperCase()))
            }}</span>
            <span class="filter-words">{{
              item.substr(
                item.toUpperCase().indexOf(keyword.toUpperCase()),
                keyword.length
              )
            }}</span>
            <span>{{
              item.substr(
                item.toUpperCase().indexOf(keyword.toUpperCase()) +
                  keyword.length
              )
            }}</span>
          </template>
          <span v-else>
            {{ item }}
          </span>
        </a-list-item>
      </a-list>
    </a-space>
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

  private maxPage = 0

  private list: string[] = []

  private searchList: string[] = []

  private loading = false

  private keyword = ''

  private selectItem = ''

  private geojson: Record<string, any> = {}

  private bounds: Record<string, any> = {}

  private get pagination() {
    return {
      size: 'small',
      total: this.searchList.length
    }
  }

  @Watch('scale', { immediate: true })
  private async scaleChange() {
    this.loading = true
    try {
      const { scale } = this
      const list = await utilInstance.getFrameNoList({ scale })
      this.list = list || []
      this.searchList = list || []
    } catch (error) {
      this.list = []
      this.searchList = []
    } finally {
      this.loading = false
    }
  }

  @Watch('active')
  activeChange(val) {
    if (!val) {
      this.selectItem = ''
      this.clear()
    }
  }

  private async select(item: string) {
    this.selectItem = item
    const {
      data: { XMin, YMin, XMax, YMax }
    } = await utilInstance.getRectByFrameNo(item)
    this.clear()
    this.geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: item },
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
        .ant-spin-container {
          max-height: 200px;
          overflow-y: auto;
          .select-item {
            background-color: @blue-1;
          }
          .ant-list-item {
            justify-content: flex-start;
            padding-left: 10px;
            &:hover {
              background-color: @hover-bg-color;
            }
            .filter-words {
              color: @primary-color;
            }
          }
        }
      }
    }
  }
}
</style>
