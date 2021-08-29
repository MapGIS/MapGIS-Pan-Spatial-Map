<template>
  <div class="comprehensive-place-name-panel-container">
    <a-spin :spinning="spinning" v-if="!cluster">
      <template v-if="markersInfos.length > 0">
        <ul class="comprehensive-place-name-panel">
          <li
            v-for="(item, i) in markersInfos"
            :key="item.markerId"
            @mouseover="mouseOver(i)"
            @mouseleave="mouseLeave(i)"
            @click="setActivePoint(i)"
          >
            <div class="img-place-name-panel">
              <img :src="item.img" />
            </div>
            <div class="content-place-name-panel">
              <p v-for="(config, index) in fieldConfigs" :key="index">
                <label>{{ config.title }}:</label>
                <span>{{ item.properties[config.name] }}</span>
              </p>
            </div>
          </li>
        </ul>
        <div class="pagination-container">
          <a-pagination
            simple
            :current="currentPageIndex"
            :total="maxCount"
            @change="pageChange"
            size="small"
          />
        </div>
      </template>
      <a-empty v-else :image="simpleImage" />
    </a-spin>
    <a-spin :spinning="spinning" v-else>
      <div class="cluster-title">
        <span>
          聚合标注图层
        </span>
      </div>
      <div class="cluster-content">
        <span>
          {{ name }}
        </span>
        <span>
          {{ `共${setCounts()}条结果` }}
        </span>
        <a-tag :color="selectedItem.color">
          {{ selectedItem.color }}
        </a-tag>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Empty } from 'ant-design-vue'
import { UUID, AppMixin, Feature } from '@mapgis/web-app-framework'
import { markerIconInstance } from '@mapgis/pan-spatial-map-common'

@Component
export default class PlaceNamePanel extends Vue {
  @Prop() widgetInfo!: Record<string, unknown>

  @Prop() name!: string

  @Prop() activeTab!: string

  @Prop() keyword: string

  @Prop() cluster!: boolean

  @Prop() baseUrl!: string

  @Prop() geometry?: Record<string, unknown>

  private fieldConfigs: Record<string, unknown>[] = []

  private fields: string[] = []

  private isDataStoreQuery = false

  private currentPageIndex = 1

  private maxCount = 0

  private markersInfos = []

  private spinning = false

  private geojson = {}

  private get allItems(): Array {
    return this.widgetInfo.config.placeName.queryTable
  }

  private get config() {
    return this.widgetInfo.config.placeName || this.widgetInfo.config.dataStore
  }

  private get selectedItem() {
    return this.allItems.find(item => this.name === item.placeName)
  }

  @Watch('cluster')
  clusterChange() {
    this.queryFeature()
  }

  @Watch('activeTab', { immediate: true })
  activeTabChange() {
    this.updataMarkers()
  }

  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  }

  mounted() {
    const { showAttrsAndTitle } = this.selectedItem
    const fields: any[] = []
    const configs: Record<string, unknown>[] = []
    for (let j = 0; j < showAttrsAndTitle.length; j += 1) {
      const filed = showAttrsAndTitle[j].attr
      fields.push(filed)
      configs.push({
        name: filed,
        title: showAttrsAndTitle[j].showName
      })
    }
    this.fieldConfigs = configs
    this.fields = fields
    this.queryFeature()
  }

  setCounts() {
    return this.config.clusterMaxCount < this.maxCount
      ? `大于${this.config.clusterMaxCount}`
      : `为${this.maxCount}`
  }

  updataMarkers() {
    if (this.activeTab === this.name) {
      this.$emit('show-coords', this.markersInfos, this.fieldConfigs)
    }
  }

  async queryFeature() {
    const where =
      this.keyword && this.keyword !== ''
        ? `${this.selectedItem.searchField ||
            this.config.allSearchName} LIKE '%${this.keyword}%'`
        : `${this.selectedItem.searchField ||
            this.config.allSearchName} LIKE '%'`
    // const where = `${this.selectedItem.searchField ||
    // this.config.allSearchName} LIKE '%${this.keyword}%'`
    if (!this.isDataStoreQuery) {
      await this.igsQuery(where)
    } else {
      // await this.dsQuery(selectedItem, where, fields)
    }
  }

  /**
   * igs地名地址查询
   */
  async igsQuery(where: any) {
    const igsParams: Feature.FeatureQueryParam = {
      ip: this.config.ip,
      port: this.config.port,
      pageCount: this.cluster ? this.config.clusterMaxCount : 10,
      page: this.currentPageIndex - 1,
      fields: this.fields.toString(),
      rtnLabel: false,
      f: 'json',
      where,
      geometry: this.geometry
    }
    const { queryWay } = this.config
    if (queryWay === 'doc') {
      // 地图文档
      igsParams.docName = this.config.docName
      igsParams.layerName = this.selectedItem.LayerName
      igsParams.layerIdxs = ''
    } else if (queryWay === 'gdbp') {
      igsParams.gdbp = this.selectedItem.gdbp
      igsParams.srsIds = 'WGS1984_度'
    }
    const combine = this.config.combine === 'true'
    this.spinning = true
    try {
      const igsRes: any = await Feature.FeatureQuery.query(igsParams, combine)
      let data: any = igsRes
      if (combine) {
        data = igsRes[0]
      }
      if (!data || !data.SFEleArray) {
        return
      }
      const geoJSONData: FeatureGeoJSON = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(
        data
      )
      const { features } = geoJSONData
      const markerCoords: Record<string, any>[] = []
      const defaultImg = await markerIconInstance.unSelectIcon()
      if (!this.cluster) {
        for (let j = 0; j < features.length; j += 1) {
          const feature = features[j]
          const properties: Record<string, any> = {}
          for (let f = 0; f < this.fields.length; f += 1) {
            properties[this.fields[f]] = feature.properties[this.fields[f]]
          }
          const coords = {
            coordinates: Feature.getGeoJSONFeatureCenter(feature),
            properties,
            markerId: `place-name-${j}`,
            img: defaultImg
          }
          markerCoords.push(coords)
        }
      }
      if (this.cluster) {
        this.geojson = { type: 'FeatureCollection', features }
        this.markersInfos = []
      } else {
        this.markersInfos = markerCoords
        this.geojson = {}
      }
      this.maxCount = geoJSONData.dataCount
        ? geoJSONData.dataCount
        : features.length
      this.updataMarkers()
      this.$emit('update-geojson', this.geojson)
    } catch (error) {
      console.log(error)
    } finally {
      this.spinning = false
    }
  }

  async mouseOver(index) {
    const selectedImg = await markerIconInstance.selectIcon()
    this.$set(this.markersInfos[index], 'img', selectedImg)
    this.updataMarkers()
  }

  async mouseLeave(index) {
    const defaultImg = await markerIconInstance.unSelectIcon()
    this.$set(this.markersInfos[index], 'img', defaultImg)
    this.updataMarkers()
  }

  pageChange(page) {
    this.currentPageIndex = page
    this.queryFeature()
  }

  setActivePoint(index) {
    this.$emit('click-item', this.markersInfos[index].coordinates)
  }
}
</script>

<style lang="less">
.comprehensive-place-name-panel-container {
  &,
  .ant-spin-nested-loading,
  .ant-spin-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    .cluster-title {
      margin: 8px 0;
      span:first-child {
        padding-left: 5px;
        border-left: 4px solid @primary-color;
        font-weight: bold;
        color: @title-color;
        margin-right: 5px;
      }
    }
    .cluster-content {
      display: flex;
      align-items: center;
      span:nth-child(2) {
        flex: 1;
        text-align: right;
      }
      .ant-tag {
        margin-left: 10px;
      }
    }
    .comprehensive-place-name-panel {
      flex: 1;
      overflow: auto;
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        border-bottom: 1px solid @border-color;
        padding: 5px;
        display: flex;
        align-items: center;
        &:last-child {
          border-bottom-width: 0;
        }
        .content-place-name-panel {
          flex: 1;
          p {
            margin-bottom: 3px !important;
            label {
              color: @title-color;
              margin-right: 8px;
              font-weight: bold;
            }
            span {
              color: @text-color;
            }
          }
        }
        .img-place-name-panel {
          margin-right: 18px;
        }
      }
    }
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 5px;
    }
    .ant-empty-normal {
      margin: 15px 0 5px 0;
    }
  }
}
</style>
