<template>
  <div class="place-name-container">
    <div class="float-pop-container" v-show="!showResult">
      <span
        v-for="item in allItems"
        :key="`地名地址${item.placeName}`"
        @click="select(item)"
        :class="{ active: selected.indexOf(item.placeName) > -1 }"
        >{{ item.placeName }}</span
      >
    </div>
    <div class="search-tab-container" v-if="showResult && !showResultSet">
      <div class="search-switch-container">
        <a-switch v-model="cluster" @change="onChange" size="small" />
        <span :class="{ active: cluster }">聚合展示</span>
        <a-icon
          class="action"
          style="flex: 1; text-align: right;"
          :type="shrink ? 'up' : 'down'"
          @click="shrink = !shrink"
        />
      </div>
      <a-tabs
        v-model="tab"
        type="card"
        v-show="!shrink"
        style="margin-top: 8px;"
      >
        <a-tab-pane v-for="item in selected" :key="item" :tab="item">
          <place-name-panel
            :widgetInfo="widgetInfo"
            :cluster="cluster"
            :name="item"
            :keyword="keyword"
            :activeTab="tab"
            :baseUrl="baseUrl"
            :geometry="geometryData"
            @show-coords="showCoords"
            @click-item="setCenter"
            @update-geojson="updateGeojson"
          ></place-name-panel>
        </a-tab-pane>
      </a-tabs>
    </div>
    <place-name-mapbox
      ref="refPlaceNameMapbox"
      :markers="markers"
      :field-configs="fieldConfigs"
      :cluster="cluster"
      :geojson="geojson"
    />
    <place-name-cesium
      ref="refPlaceNameCesium"
      :markers="markers"
      :field-configs="fieldConfigs"
      :cluster="cluster"
      :geojson="geojson"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import PlaceNamePanel from './PlaceNamePanel'
import PlaceNameMapbox from './PlaceNameMapbox'
import PlaceNameCesium from './PlaceNameCesium'
import {
  ExhibitionControllerMixin,
  IAttributeTableExhibition,
  AttributeTableExhibition,
  baseConfigInstance,
  Parser,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import { LayerType, AppMixin, MapMixin } from '@mapgis/web-app-framework'
import * as turf from '@turf/turf'

@Component({ components: { PlaceNamePanel, PlaceNameMapbox, PlaceNameCesium } })
export default class PlaceName extends Mixins(
  ExhibitionControllerMixin,
  AppMixin,
  MapMixin
) {
  @Prop() widgetInfo!: Record<string, unknown>

  @Prop() geometry?: Record<string, unknown>

  private geometryData = null

  private selected: string[] = []

  private selectedCopy: string[] = []

  private showResult = false

  private keyword = ''

  private tab = ''

  private markers = []

  private fieldConfigs: string[] = []

  private cluster = false

  // 结果集展示标志
  private showResultSet = false

  private geojson = {}

  private shrink = false

  private get allItems() {
    return this.widgetInfo.config.placeName.queryTable
  }

  private get showType() {
    return this.widgetInfo.config.placeName.showType
  }

  private get config() {
    return this.widgetInfo.config.placeName || this.widgetInfo.config.dataStore
  }

  @Watch('geometry', { immediate: true })
  geometryChange(val) {
    this.geometryData = val
  }

  @Watch('showType', { immediate: true })
  showTypeChange() {
    if (this.showType === 'result') {
      this.showResultSet = true
    } else if (this.showType === 'normal') {
      this.showResultSet = false
      this.cluster = false
    } else if (this.showType === 'cluster') {
      this.showResultSet = false
      this.cluster = true
    }
  }

  mounted() {
    if (this.selected.length === 0 && this.allItems.length > 0) {
      this.selected = [this.allItems[0].placeName]
    }
  }

  getBounds() {
    let polygon
    if (this.is2DMapMode) {
      const { _ne, _sw } = this.map.getBounds()
      const { lng: xmax, lat: ymax } = _ne
      const { lng: xmin, lat: ymin } = _sw
      polygon = turf.polygon(
        [
          [
            [xmin, ymax],
            [xmax, ymax],
            [xmax, ymin],
            [xmin, ymin],
            [xmin, ymax]
          ]
        ],
        { name: 'bounds' }
      )
    } else {
      const Rectangle = this.webGlobe.viewer.camera.computeViewRectangle()
      const xmin = (Rectangle.west / Math.PI) * 180
      const ymax = (Rectangle.north / Math.PI) * 180
      const xmax = (Rectangle.east / Math.PI) * 180
      const ymin = (Rectangle.south / Math.PI) * 180
      polygon = turf.polygon(
        [
          [
            [xmin, ymax],
            [xmax, ymax],
            [xmax, ymin],
            [xmin, ymin],
            [xmin, ymax]
          ]
        ],
        { name: 'bounds' }
      )
    }
    const result = Parser.changeToTangram(polygon)
    if (Array.isArray(result)) return result[0]
    return result
  }

  select(item: any) {
    const index = this.selected.indexOf(item.placeName)
    if (index < 0) {
      this.selected.push(item.placeName)
    } else {
      if (this.selected.length > 1) {
        this.selected.splice(index, 1)
      } else {
        this.$message.warning('至少选中一个类别！')
      }
    }
  }

  onChange(val) {
    const copy = JSON.parse(JSON.stringify(this.selected))
    this.selected = []
    this.selected = copy
  }

  search(keyword: string) {
    this.keyword = keyword
    if (!this.geometry) {
      this.geometryData = this.getBounds()
    }
    if (this.showResultSet) {
      const arr = []
      // 删除属性表中不包含在此次选择项的tab
      this.selectedCopy.forEach(item => {
        let bool = false
        this.selected.forEach(row => {
          if (row === item) {
            bool = true
          }
        })
        arr.push(item)
      })
      arr.forEach(item => {
        this.openReseultSet(item, true)
      })
      this.selected.forEach(item => {
        this.openReseultSet(item)
      })
      this.selectedCopy = JSON.parse(JSON.stringify(this.selected))
    } else {
      this.showResult = false
      this.$nextTick(() => {
        this.showResult = true
        this.tab = this.selected[0]
      })
    }
  }

  removeResult() {
    // 点击关闭面板的时候，删除属性表里面所有的tab
    if (this.showResultSet === true) {
      this.selectedCopy.forEach(item => {
        this.openReseultSet(item, true)
      })
    }
  }

  openReseultSet(item, isDelete) {
    const { queryWay, ip, port, docName, allSearchName } = this.config
    const {
      gdbp,
      placeName,
      LayerIndex,
      LayerName,
      searchField
    } = this.selectedItem(item)
    const where =
      this.keyword !== '' && this.keyword
        ? `${searchField || allSearchName} LIKE '%${this.keyword}%'`
        : `${searchField || allSearchName} LIKE '%'`
    let exhibition: IAttributeTableExhibition = null
    if (queryWay === 'doc') {
      // 地图文档
      exhibition = {
        id: `${docName} ${LayerName} ${LayerIndex}`,
        name: `${LayerName} 查询结果`,
        description: `${docName} ${LayerName}`,
        option: {
          id: LayerIndex,
          name: LayerName,
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: LayerType.IGSMapImage,
          layerIndex: LayerIndex,
          serverName: docName,
          geometry: this.geometryData,
          serverUrl: `http://${ip}:${port}/igs/rest/mrms/docs/${docName}`,
          where
        }
      }
    } else if (queryWay === 'gdbp') {
      exhibition = {
        id: `${placeName}`,
        name: `${placeName} 查询结果`,
        option: {
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: LayerType.IGSVector,
          gdbp: gdbp,
          where,
          geometry: this.geometryData
        }
      }
    }
    if (!isDelete) {
      this.addExhibition(new AttributeTableExhibition(exhibition))
      this.openExhibitionPanel()
    } else {
      this.removeExhibition(exhibition.id)
    }
  }

  private selectedItem(name) {
    return this.allItems.find(item => name === item.placeName)
  }

  reset() {
    this.showResult = false
    this.tab = ''
    this.showTypeChange()
    this.markers = []
    this.fieldConfigs = []
    this.geojson = {}
  }

  showCoords(markers, fieldConfigs) {
    this.markers = markers
    this.fieldConfigs = fieldConfigs
  }

  updateGeojson(geojson) {
    this.geojson = geojson
  }

  setCenter(positionCoord) {
    if (this.mapRender === this.mapboxRender) {
      if (this.$refs.refPlaceNameMapbox) {
        this.$refs.refPlaceNameMapbox.setMapCenter(positionCoord)
      }
    } else {
      if (this.$refs.refPlaceNameCesium) {
        this.$refs.refPlaceNameCesium.setMapCenter(positionCoord)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.place-name-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .float-pop-container {
    span {
      padding: 3px 6px;
      white-space: nowrap;
      &:hover {
        cursor: pointer;
      }
    }
    .active {
      color: @primary-color;
    }
  }
  .search-tab-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    .search-switch-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .active {
        color: @primary-color;
      }
      .ant-switch {
        margin: 0 10px;
      }
      .action {
        cursor: pointer;
        padding-left: 8px;
        &:hover {
          color: @primary-color;
        }
      }
    }
    /deep/ .ant-tabs {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      .ant-tabs-nav-container {
        height: 32px;
        .ant-tabs-tab {
          height: 32px;
          line-height: 32px;
        }
      }
      .ant-tabs-bar {
        margin-bottom: 10px;
      }
      .ant-tabs-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .ant-tabs-tabpane-active {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
