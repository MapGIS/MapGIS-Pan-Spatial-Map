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
            allowClear
            v-model="keyword"
            enter-button
            @search="onSearch"
          />
        </a-col>
      </a-row>
      <a-spin :spinning="loading">
        <a-list :data-source="list" size="small" :pagination="pagination">
          <div slot="header">
            选择图幅：
          </div>
          <a-list-item
            slot="renderItem"
            slot-scope="item"
            @click="select(item)"
            :class="{ 'select-item': selectItem === item }"
          >
            <template v-if="item.indexOf(keyword) > -1">
              <span>{{ item.substr(0, item.indexOf(keyword)) }}</span>
              <span class="filter-words">{{
                item.substr(item.indexOf(keyword), keyword.length)
              }}</span>
              <span>{{
                item.substr(item.indexOf(keyword) + keyword.length)
              }}</span>
            </template>
            <span v-else>
              {{ item }}
            </span>
          </a-list-item>
        </a-list>
      </a-spin>
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

  private total = 0

  private list: string[] = []

  private pageNumber = 1

  private pageSize = 20

  private loading = false

  private keyword = ''

  private selectItem = ''

  private geojson: Record<string, any> = {}

  private bounds: Record<string, any> = {}

  private get pagination() {
    if (this.total) {
      return {
        size: 'small',
        total: this.total,
        pageSize: this.pageSize,
        showSizeChanger: true,
        current: this.pageNumber,
        onChange: page => {
          this.pageNumber = page
          this.onSearch()
        },
        onShowSizeChange: (current, size) => {
          this.pageSize = size
          this.onSearch()
        }
      }
    }

    return false
  }

  async onSearch() {
    this.loading = true
    try {
      const { scale, pageNumber, pageSize, keyword } = this
      const { content, totalElements } = await utilInstance.getFrameNoList({
        scale,
        pageNumber: pageNumber - 1,
        pageSize,
        keyword
      })
      this.list = content || []
      this.total = totalElements || 0
    } catch (error) {
      this.list = []
      this.total = 0
    } finally {
      this.loading = false
    }
  }

  @Watch('scale', { immediate: true })
  private paramsChange() {
    this.list = []
    this.total = 0
    this.pageNumber = 1
    this.pageSize = 20
    this.onSearch()
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
