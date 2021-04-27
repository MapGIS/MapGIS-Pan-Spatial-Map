<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
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

  @Prop() keyword: string

  private fieldNames: string[] = []

  private isDataStoreQuery = false

  private currentPageIndex = 1

  private maxPage = 100

  private markerBlue = MarkerBlue

  private markerRed = MarkerRed

  private get allItems(): Array {
    return this.widgetInfo.config.placeName.queryTable
  }

  private get config() {
    return this.widgetInfo.config.placeName || this.widgetInfo.config.dataStore
  }

  mounted() {
    this.queryFeature()
  }

  getSelectedItem() {
    return this.allItems.find(item => this.name === item.placeName)
  }

  async queryFeature() {
    const selectedItem = this.getSelectedItem(this.placeNameTab)
    if (!selectedItem) {
      return
    }
    const { showAttrsAndTitle } = selectedItem
    const fields: any[] = []
    const names: string[] = []
    for (let j = 0; j < showAttrsAndTitle.length; j += 1) {
      const filed = showAttrsAndTitle[j].attr
      fields.push(filed)
      const name = showAttrsAndTitle[j].showName
      names.push(name)
    }
    this.fieldNames = names
    const where = this.keyword && this.keyword !== '' ? this.keyword : undefined
    if (!this.isDataStoreQuery) {
      await this.igsQuery(selectedItem, where, fields)
    } else {
      //   await this.dsQuery(selectedItem, where, fields)
    }
  }

  /**
   * igs地名地址查询
   */
  async igsQuery(selectedItem: any, where: any, fields: string[]) {
    const igsParams: FeatureQueryParam = {
      ip: this.config.ip,
      port: this.config.port,
      pageCount: 10,
      page: this.currentPageIndex - 1,
      fields: fields.toString(),
      rtnLabel: true,
      f: 'json',
      where,
      //   geometry: this.geometry,
      cursorType: 'backword'
    }
    const { queryWay } = this.config
    if (queryWay === 'doc') {
      // 地图文档
      igsParams.docName = this.config.docName
      igsParams.layerName = selectedItem.LayerName
    } else if (queryWay === 'gdbp') {
      igsParams.gdbp = selectedItem.gdbp
      igsParams.srsIds = '地理坐标系(西安)_度'
    }
    const combine = this.config.combine === 'true'
    try {
      debugger
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
      console.log(geoJSONData)

      const { features } = geoJSONData
      const markerCoords: Record<string, any>[] = []
      for (let j = 0; j < features.length; j += 1) {
        const feature = features[j]
        const properties: Record<string, any> = {}
        for (let f = 0; f < fields.length; f += 1) {
          properties[fields[f]] = feature.properties[fields[f]]
        }
        const coords = {
          coordinates: utilInstance.getGeoJsonFeatureCenter(feature),
          properties,
          id: UUID.uuid(),
          img: this.markerBlue
        }
        markerCoords.push(coords)
      }
      this.markersInfos = markerCoords
      const dataCount = geoJSONData.dataCount
        ? geoJSONData.dataCount
        : features.length
      this.maxPage = Math.ceil(dataCount / 10)
    } catch (error) {
      console.log(error)
    }
  }
}
</script>

<style scoped></style>
