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
        <span :class="{ active: !cluster }">面板展示</span>
        <a-switch v-model="cluster" @change="onChange" />
        <span :class="{ active: cluster }">聚合展示</span>
      </div>
      <a-tabs v-model="tab" type="card">
        <a-tab-pane v-for="item in selected" :key="item" :tab="item">
          <place-name-panel
            :widgetInfo="widgetInfo"
            :cluster="cluster"
            :name="item"
            :keyword="keyword"
            :activeTab="tab"
            :baseUrl="baseUrl"
            @show-coords="showCoords"
            @click-item="setCenter"
            @update-geojson="updateGeojson"
          ></place-name-panel>
        </a-tab-pane>
      </a-tabs>
    </div>
    <place-name-mapbox
      ref="place-name-mapbox"
      :markers="markers"
      :fieldNames="fieldNames"
      :cluster="cluster"
      :geojson="geojson"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import PlaceNamePanel from './PlaceNamePanel'
import PlaceNameMapbox from './PlaceNameMapbox'
import {
  ExhibitionControllerMixin,
  IAttributeTableExhibition,
  AttributeTableExhibition,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'
import { LayerType, AppMixin } from '@mapgis/web-app-framework'

@Component({ components: { PlaceNamePanel, PlaceNameMapbox } })
export default class PlaceName extends Mixins(
  ExhibitionControllerMixin,
  AppMixin
) {
  @Prop() widgetInfo!: Record<string, unknown>

  private selected: string[] = []

  private showResult = false

  private keyword = ''

  private tab = ''

  private markers = []

  private fieldNames: string[] = []

  private cluster = false

  // 结果集展示标志
  private showResultSet = false

  private geojson = {}

  private get allItems() {
    return this.widgetInfo.config.placeName.queryTable
  }

  private get showType() {
    return this.widgetInfo.config.placeName.showType
  }

  private get config() {
    return this.widgetInfo.config.placeName || this.widgetInfo.config.dataStore
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
    if (this.showResultSet) {
      this.selected.forEach(item => {
        this.openReseultSet(item)
      })
    } else {
      this.showResult = true
      this.tab = this.selected[0]
    }
  }

  openReseultSet(item) {
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
    let exhibition
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
          where
        }
      }
    }
    this.addExhibition(new AttributeTableExhibition(exhibition))
    this.openExhibitionPanel()
  }

  private selectedItem(name) {
    return this.allItems.find(item => name === item.placeName)
  }

  reset() {
    this.showResult = false
    this.tab = ''
    this.showTypeChange()
    this.markers = []
    this.fieldNames = []
    this.geojson = {}
  }

  showCoords(markers, fieldNames) {
    this.markers = markers
    this.fieldNames = fieldNames
  }

  updateGeojson(geojson) {
    this.geojson = geojson
  }

  setCenter(positionCoord) {
    this.$refs['place-name-mapbox'].setMapCenter(positionCoord)
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
      justify-content: flex-end;
      margin-bottom: 10px;
      align-items: center;
      .active {
        color: @primary-color;
      }
      .ant-switch {
        margin: 0 10px;
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
