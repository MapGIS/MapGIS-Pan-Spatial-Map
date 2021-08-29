<template>
  <div class="frame-container">
    <mp-setting-form layout="vertical">
      <a-form-item label="比例尺">
        <a-select :options="scaleArray" v-model="scale" />
      </a-form-item>
      <a-form-item label="图幅号">
        <a-input-search
          placeholder="请输入关键字"
          allowClear
          v-model="keyword"
          enter-button
          @search="onSearch"
        />
      </a-form-item>
    </mp-setting-form>
    <a-space direction="vertical" style="flex: 1">
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
import { AppMixin, Feature } from '@mapgis/web-app-framework'
import { baseConfigInstance, api } from '@mapgis/pan-spatial-map-common'
import axios from 'axios'
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
  change(val: Feature.FeatureGeoJSON | null) {}

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

  private frameConfig = {
    ip: '',
    port: '',
    name: '',
    gdbp: ''
  }

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

  async mounted() {
    this.frameConfig = await api.getConfig('sheet')
  }

  private async onSearch() {
    this.loading = true
    try {
      const { scale, pageNumber, pageSize, keyword } = this
      // 通过sheetConfig内的ip、port、name去获取地图范围，构造成[xMin, yMin, xMax, yMax]，用于查询图幅号
      const {
        data: { xMin, yMin, xMax, yMax }
      } = await axios.get(
        `http://${this.frameConfig.ip}:${this.frameConfig.port}/igs/rest/mrms/info/${this.frameConfig.name}`
      )

      const { content, totalElements } = await api.getFrameNoList(
        this.frameConfig.ip,
        this.frameConfig.port,
        this.frameConfig.gdbp,
        xMin,
        yMin,
        xMax,
        yMax,
        scale,
        pageNumber - 1,
        pageSize,
        keyword,
        baseConfigInstance.config.projectionName,
        baseConfigInstance.config.projectionName
      )
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
    } = await api.getFrameExtentByNo(
      this.frameConfig.ip,
      this.frameConfig.port,
      item,
      baseConfigInstance.config.projectionName,
      baseConfigInstance.config.projectionName
    )

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
  flex-direction: column;
  .ant-space {
    .ant-space-item {
      .ant-list {
        font-size: 12px;
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
            padding: 5px 0 5px 5px;
            &:hover {
              background-color: @hover-bg-color;
            }
            .filter-words {
              color: @primary-color;
            }
          }
        }
        .ant-empty-normal {
          margin: 8px 0;
        }
        .ant-pagination {
          font-size: 12px;
          .ant-list-pagination {
            margin-top: 8px;
          }
        }
      }
    }
  }
}
</style>
