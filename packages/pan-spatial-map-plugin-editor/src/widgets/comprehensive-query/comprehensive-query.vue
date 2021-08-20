<template>
  <div class="mp-widget-comprehensive-query">
    <div class="search-box query-section">
      <div class="logo" @click="onLocate">
        <mp-icon :icon="logo" />
        <span class="district-title" v-if="logoType === 'district'">
          {{ districtName }}</span
        >
      </div>
      <a-divider type="vertical" />
      <a-button
        v-if="!searchInputExapnd"
        class="start-search-button"
        icon="search"
        @click="onStartSearch"
      />
      <template v-else>
        <a-input
          class="search-input"
          placeholder="请输入关键字"
          v-model="keyword"
          allow-clear
          @focus="onSearchFocus"
          @pressEnter="onSearch"
        />
        <a-divider type="vertical" />
        <a-button class="close-button" icon="close" @click="onClose" />
        <a-button
          class="search-button"
          type="primary"
          icon="search"
          @click="onSearch"
        />
      </template>
    </div>
    <div
      :class="[
        'locate-panel-contaner',
        'query-section',
        'panel-container',
        locationPanelExpand ? '' : 'unvisible'
      ]"
    >
      <a-tabs v-model="locationType" size="small" type="card">
        <a-tab-pane key="district" tab="行政区划定位">
          <zone
            ref="zone"
            v-if="district"
            :district="district"
            :active="locationType === 'district'"
            @change="val => (geoJson = val)"
          />
        </a-tab-pane>
        <a-tab-pane key="coordinate" tab="坐标定位" force-render>
          <coordinate
            ref="coordinate"
            :active="locationType === 'coordinate'"
            @change="val => (geoJson = val)"
          />
        </a-tab-pane>
        <a-tab-pane key="map-sheet" tab="图幅定位">
          <frame
            ref="map-sheet"
            @change="val => (geoJson = val)"
            :active="locationType === 'map-sheet'"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div id="measure-max-height" />
    <div
      :class="[
        'search-panel-contaner',
        'panel-container',
        'query-section',
        searchPanelExpand ? '' : 'unvisible'
      ]"
      :style="{ 'max-height': `${maxHeight}px` }"
    >
      <place-name
        ref="placeName"
        :widgetInfo="widgetInfo"
        :geometry="geometry"
      ></place-name>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Feature } from '@mapgis/web-app-framework'
import { api } from '@mapgis/pan-spatial-map-store'
import PlaceName from './components/PlaceName/PlaceName'
import Zone from './components/ZoneFrame/Zone'
import Coordinate from './components/Coordinate/Coordinate'
import Frame from './components/ZoneFrame/Frame'

@Component({
  name: 'MpComprehensiveQuery',
  components: { PlaceName, Zone, Coordinate, Frame }
})
export default class MpComprehensiveQuery extends Mixins(WidgetMixin) {
  private keyword = ''

  private searchPanelExpand = false

  private districtName = ''

  private district = null

  private maxHeight = 0

  // 可选district：行政区划定位；coordinate：坐标定位；map-sheet：图幅号定位
  private locationType = ''

  private locationPanelExpand = false

  private searchInputExapnd = false

  private geoJson: Featrue.FeatureGeoJSON | null = null

  get logoType() {
    return this.locationType || 'district'
  }

  get logo() {
    return `${this.appAssetsUrl}${this.widgetInfo.uri}/images/${this.logoType}.png`
  }

  private get geometry() {
    if (this.geoJson && JSON.stringify(this.geoJson) !== '{}') {
      let geojson
      if (this.geoJson.features) {
        geojson = this.geoJson
      } else {
        geojson = {
          type: 'FeatureCollection',
          features: [this.geoJson]
        }
      }
      const result = Feature.FeatureConvert.featureGeoJSONToTangram(geojson)
      if (Array.isArray(result)) return result[0]
      return result
    }
    return null
  }

  async mounted() {
    this.setMaxHeight()
    window.addEventListener(
      'resize',
      () => {
        this.setMaxHeight()
      },
      false
    )
    const districtConfig = await api.getConfig('district')
    if (districtConfig && districtConfig.length > 0) {
      this.district = districtConfig[0]

      const { defaults } = this.district

      this.districtName = defaults.text
    }
  }

  setMaxHeight() {
    const top = document
      .getElementById('measure-max-height')
      .getBoundingClientRect().top
    const bottom = document.documentElement.clientHeight - top
    this.maxHeight = bottom - 10 - 3
  }

  onLocate() {
    this.locationPanelExpand = !this.locationPanelExpand
    this.searchPanelExpand = false
    if (!this.locationType) {
      this.locationType = 'district'
    }
  }

  onStartSearch() {
    this.searchInputExapnd = true
  }

  onClose() {
    if (!this.locationPanelExpand && !this.searchPanelExpand) {
      this.searchInputExapnd = false
      return
    }

    this.locationPanelExpand = false
    this.searchPanelExpand = false
    this.$refs.placeName.removeResult()
    this.$refs.placeName.reset()
    this.$refs.zone && this.$refs.zone.clear()
    this.$refs.coordinate && this.$refs.coordinate.clear()
    this.$refs['map-sheet'] && this.$refs['map-sheet'].clear()
    if (this.locationType === 'district') {
      this.locationType = ''
    }
  }

  onSearchFocus() {
    this.searchPanelExpand = true
    this.locationPanelExpand = false
    this.$refs.placeName.reset()
  }

  onSearch() {
    this.searchPanelExpand = true
    this.locationPanelExpand = false
    this.$refs.placeName.search(this.keyword)
  }
}
</script>

<style lang="less">
.mp-widget-comprehensive-query {
  .search-box {
    .ant-divider {
      margin: 0;
    }
    input {
      border: 0;
      box-shadow: 0 0 0 0;
    }
    button {
      border: 0;
      padding: 0;
      &.search-button {
        width: 57px;
        border-radius: 0 2px 2px 0;
      }
      &.close-button {
        line-height: 16px;
        padding: 0 8px;
      }
    }
  }
  .locate-panel-contaner,
  .search-panel-contaner {
    .ant-tabs.ant-tabs-card {
      .ant-tabs-card-bar {
        margin-bottom: 0;
        .ant-tabs-nav-container-scrolling {
          padding-right: 20px;
          padding-left: 20px;
          .ant-tabs-tab-prev.ant-tabs-tab-arrow-show,
          .ant-tabs-tab-next.ant-tabs-tab-arrow-show {
            width: 20px;
          }
        }
        .ant-tabs-nav-container {
          height: 32px;
          .ant-tabs-tab {
            height: 32px;
            line-height: 32px;
            padding: 0 6px;
          }
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
.mp-widget-comprehensive-query {
  display: flex;
  flex-direction: column;
  width: 300px;
  color: @text-color;
  border-radius: 2px;
  max-height: calc(~'100% - 20px');
  .query-section {
    border-radius: 2px;
    box-shadow: 0px 1px 2px 0px @shadow-color;
  }
  .search-box {
    display: flex;
    align-items: center;
    background: @base-bg-color;
    width: fit-content;
    height: 32px;
    .logo {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      cursor: pointer;
      .district-title {
        white-space: nowrap;
        margin-left: 3px;
        color: @text-color;
      }
    }
    .start-search-button {
      font-size: 16px;
      width: 32px;
    }
    .search-input {
      flex: 1;
    }
    .search-button {
      font-size: 14px;
      width: 46px;
    }
    .close-button {
      font-size: 14px;
    }
  }
  .ant-divider-vertical {
    top: 0;
  }
  .panel-container {
    background: @base-bg-color;
    padding: 10px;
    margin-top: 3px;
    &.unvisible {
      display: none;
    }
  }
  .locate-panel-contaner {
  }
  .search-panel-contaner {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
