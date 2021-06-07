<template>
  <div class="frame-container">
    <a-space direction="vertical" style="flex: 1">
      <a-row>
        <label>比例尺</label>
      </a-row>
      <a-row>
        <a-select :options="scaleArray" v-model="scale" style="width:100%" />
      </a-row>
      <a-row>
        <label>图幅号</label>
      </a-row>
      <a-row>
        <a-input-search
          placeholder="请输入关键字"
          allowClear
          v-model="keyword"
          enter-button
          @search="onSearch"
        />
      </a-row>
      <a-spin :spinning="loading">
        <a-list :data-source="list" size="small" :pagination="pagination">
          <div slot="header">
            选择图幅
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
    <template v-if="active">
      <zone-frame-mapbox
        v-if="is2DMapMode"
        :feature="frameFeature"
        :center="center"
        :highlight-style="highlightStyle"
      ></zone-frame-mapbox>
      <zone-frame-cesium
        v-else
        :feature="frameFeature"
        :center="center"
        :highlight-style="highlightStyle"
      ></zone-frame-cesium>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Watch,
  Mixins,
  Model,
  Prop,
  Emit
} from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
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
  @Prop()
  readonly active!: boolean

  @Emit()
  change(val: FeatureGeoJSON | null) {}

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

  private frameFeature: Record<string, any> = {}

  private center = []

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

  private get highlightStyle() {
    return baseConfigInstance.config.colorConfig
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

  private async onSearch() {
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

  private async select(item: string) {
    this.selectItem = item
    const {
      data: { XMin, YMin, XMax, YMax }
    } = await utilInstance.getRectByFrameNo(item)
    this.clear()
    this.frameFeature = {
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
    this.center = [(XMin + XMax) / 2, (YMin + YMax) / 2]

    this.change(this.frameFeature)
  }

  private clear() {
    this.frameFeature = {}
    this.center = []
    this.change(this.frameFeature)
  }
}
</script>

<style lang="less">
.frame-container {
  display: flex;
  padding: 10px 3px 0 3px;
  .ant-space {
    .ant-space-item {
      .ant-list {
        .ant-list-header {
          padding: 0 0 8px 0;
        }
        .ant-spin-container {
          max-height: 200px;
          overflow-y: auto;
          .select-item {
            background-color: fade(@primary-color, 20%);
          }
          .ant-list-item {
            justify-content: flex-start;
            padding: 5px 0 5px 10px;
            &:hover {
              background-color: @hover-bg-color;
            }
            .filter-words {
              color: @primary-color;
            }
          }
        }
        .ant-list-pagination {
          margin-top: 8px;
        }
      }
    }
  }
}
</style>
