<template>
  <div class="comprehensive-result-tab-container">
    <a-spin :spinning="spinning" v-if="!cluster">
      <ul class="comprehensive-result-tab">
        <li
          v-for="(item, i) in markersInfos"
          :key="item.id"
          @mouseover="mouseOver(i)"
          @mouseleave="mouseLeave(i)"
          @click="setActivePoint(i)"
        >
          <div class="img-result-tab">
            <img :src="item.img" />
          </div>
          <div class="content-result-tab">
            <p v-for="(row, index) in fieldNames" :key="row">
              <label>{{ row }}:</label>
              <span>{{ item.properties[fields[index]] }}</span>
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
        />
      </div>
    </a-spin>
    <a-spin :spinning="spinning" v-else>
      <div class="cluster-title">
        <span>
          聚合标注图层：
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import {
  dataCatalogInstance,
  queryFeaturesInstance,
  utilInstance,
  baseConfigInstance,
  ResultSetMixin,
  IResultSetCategory
} from '@mapgis/pan-spatial-map-store'

import MarkerBlue from '../../../../assets/images/markerBlue.png'
import MarkerRed from '../../../../assets/images/markerRed0.png'

@Component
export default class ResultTab extends Vue {
  @Prop() widgetInfo!: Record<string, unknown>

  @Prop() name!: string

  @Prop() activeTab!: string

  @Prop() keyword: string

  @Prop() cluster!: boolean

  private fieldNames: string[] = []

  private fields: string[] = []

  private isDataStoreQuery = false

  private currentPageIndex = 1

  private maxCount = 0

  private markerBlue = MarkerBlue

  private markerRed = MarkerRed

  private markersInfos = []

  private spinning = false

  private activePoint = -1

  private geojson = {}

  private get allItems(): Array {
    return this.widgetInfo.config.placeName.queryTable
  }

  private get config() {
    return this.widgetInfo.config.placeName || this.widgetInfo.config.dataStore
  }

  @Watch('cluster')
  clusterChange() {
    this.queryFeature()
  }

  setCounts() {
    return this.config.clusterMaxCount < this.maxCount
      ? `大于${this.config.clusterMaxCount}`
      : `为${this.maxCount}`
  }

  @Watch('activeTab', { immediate: true })
  activeTabChange() {
    this.activePoint = -1
    this.updataMarkers()
  }

  updataMarkers() {
    if (this.activeTab === this.name) {
      this.$emit('show-coords', this.markersInfos, this.fieldNames)
    }
  }

  mounted() {
    const { showAttrsAndTitle } = this.selectedItem
    const fields: any[] = []
    const names: string[] = []
    for (let j = 0; j < showAttrsAndTitle.length; j += 1) {
      const filed = showAttrsAndTitle[j].attr
      fields.push(filed)
      const name = showAttrsAndTitle[j].showName
      names.push(name)
    }
    this.fieldNames = names
    this.fields = fields
    this.queryFeature()
  }

  private get selectedItem() {
    return this.allItems.find(item => this.name === item.placeName)
  }

  async queryFeature() {
    // const where =
    //   this.keyword && this.keyword !== ''
    //     ? `${this.selectedItem.searchField ||
    //         this.config.allSearchName} LIKE '%${this.keyword}%'`
    //     : ''
    const where = `${this.selectedItem.searchField ||
      this.config.allSearchName} LIKE '%${this.keyword}%'`
    if (!this.isDataStoreQuery) {
      await this.igsQuery(where)
    } else {
      //   await this.dsQuery(selectedItem, where, fields)
    }
  }

  /**
   * igs地名地址查询
   */
  async igsQuery(where: any) {
    const igsParams: FeatureQueryParam = {
      ip: this.config.ip,
      port: this.config.port,
      pageCount: this.cluster ? this.config.clusterMaxCount : 10,
      page: this.currentPageIndex - 1,
      fields: this.fields.toString(),
      rtnLabel: false,
      f: 'json',
      where,
      //   geometry: this.geometry,
      cursorType: 'backword'
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
      const igsRes: any = await queryFeaturesInstance.query(igsParams, combine)
      let data: any = igsRes
      if (combine) {
        // eslint-disable-next-line prefer-destructuring
        data = igsRes[0]
      }
      if (!data || !data.SFEleArray) {
        return
      }
      const geoJSONData: FeatureGeoJSON = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
        data
      )
      const { features } = geoJSONData
      const markerCoords: Record<string, any>[] = []
      if (!this.cluster) {
        for (let j = 0; j < features.length; j += 1) {
          const feature = features[j]
          const properties: Record<string, any> = {}
          for (let f = 0; f < this.fields.length; f += 1) {
            properties[this.fields[f]] = feature.properties[this.fields[f]]
          }
          const coords = {
            coordinates: utilInstance.getGeoJsonFeatureCenter(feature),
            properties,
            id: UUID.uuid(),
            img: this.markerBlue
          }
          markerCoords.push(coords)
        }
      }
      debugger
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

  mouseOver(index) {
    this.$set(this.markersInfos[index], 'img', this.markerRed)
    this.updataMarkers()
  }

  mouseLeave(index) {
    if (index !== this.activePoint) {
      this.$set(this.markersInfos[index], 'img', this.markerBlue)
    }
    this.updataMarkers()
  }

  pageChange(page) {
    this.activePoint = -1
    this.currentPageIndex = page
    this.queryFeature()
  }

  setActivePoint(index) {
    if (index !== this.activePoint && this.activePoint > -1) {
      this.$set(this.markersInfos[this.activePoint], 'img', this.markerBlue)
    }
    this.activePoint = index
    this.$set(this.markersInfos[index], 'img', this.markerRed)
    this.updataMarkers()
    this.$emit('click-item', this.markersInfos[index].coordinates)
  }
}
</script>

<style lang="less">
.comprehensive-result-tab-container {
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
      margin-bottom: 8px;
      span:first-child {
        padding-left: 5px;
        border-left: 4px solid @success-color;
        font-weight: bold;
        color: @title-color;
        margin-right: 5px;
      }
    }
    .cluster-content {
      display: flex;
      span:nth-child(2) {
        flex: 1;
        text-align: right;
      }
      .ant-tag {
        margin-left: 10px;
      }
    }
    .comprehensive-result-tab {
      flex: 1;
      overflow: auto;
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        border-bottom: 1px solid @border-color;
        padding: 10px;
        display: flex;
        align-items: center;
        &:last-child {
          border-bottom-width: 0;
        }
        .content-result-tab {
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
        .img-result-tab {
          margin-right: 18px;
        }
      }
    }
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
  }
}
</style>
