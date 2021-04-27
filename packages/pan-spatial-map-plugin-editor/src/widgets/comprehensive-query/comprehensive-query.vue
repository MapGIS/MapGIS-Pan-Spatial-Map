<template>
  <div class="mp-widget-comprehensive-query">
    <div class="search-box query-section">
      <div class="logo" @click="onLocate">
        <mp-icon :icon="logo" />
        <span>{{ districtName }}</span>
      </div>
      <a-divider type="vertical" />
      <a-input
        placeholder="请输入关键字"
        v-model="keyword"
        allow-clear
        @focus="onSearchFocus"
      />
      <a-divider type="vertical" />
      <a-button class="close-button" icon="close" @click="onClose" />
      <a-button
        class="search-button"
        type="primary"
        icon="search"
        @click="onSearch"
      />
    </div>
    <div
      :class="[
        'locate-panel-contaner',
        'query-section',
        'panel-container',
        locationPanelExpand ? '' : 'unvisible'
      ]"
    >
      <a-tabs
        default-active-key="district"
        @change="onLocateChange"
        size="small"
        type="card"
      >
        <a-tab-pane key="district" tab="行政区划定位">
          行政区划定位
        </a-tab-pane>
        <a-tab-pane key="coordinate" tab="坐标定位" force-render>
          坐标定位
        </a-tab-pane>
        <a-tab-pane key="map-sheet" tab="图幅定位">
          图幅定位
        </a-tab-pane>
      </a-tabs>
    </div>
    <div
      :class="[
        'search-panel-contaner',
        'panel-container',
        'query-section',
        searchPanelExpand ? '' : 'unvisible'
      ]"
    >
      <place-name ref="placeName" :widgetInfo="widgetInfo"></place-name>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import PlaceName from './place-name/place-name'

@Component({ name: 'MpComprehensiveQuery', components: { PlaceName } })
export default class MpComprehensiveQuery extends Mixins(WidgetMixin) {
  private keyword = ''

  private searchPanelExpand = false

  private districtName = ''

  // 可选district：行政区划定位；coordinate：坐标定位；map-sheet：图幅号定位
  private locationType = 'district'

  private locationPanelExpand = false

  get logo() {
    return `${this.appAssetsUrl}${this.widgetInfo.uri}/images/${this.locationType}.png`
  }

  onLocate() {
    this.locationPanelExpand = true
    this.searchPanelExpand = false
  }

  onLocateChange(activeKey) {
    this.locationType = activeKey
  }

  onClose() {
    this.locationPanelExpand = false
    this.searchPanelExpand = false
    this.$refs.placeName.reset()
  }

  onSearchFocus() {
    this.searchPanelExpand = true
    this.locationPanelExpand = false
    this.$refs.placeName.reset()
  }

  onSearch() {
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
  .locate-panel-contaner {
    .ant-tabs.ant-tabs-card {
      .ant-tabs-card-bar {
        margin-bottom: 0;
        .ant-tabs-nav-container {
          height: 32px;
          .ant-tabs-tab {
            height: 32px;
            line-height: 32px;
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
  width: 360px;
  color: @text-color;
  background: @base-bg-color;
  border-radius: 2px;
  .query-section {
    border-radius: 2px;
    box-shadow: 0px 1px 2px 0px @shadow-color;
  }
  .search-box {
    display: flex;
    align-items: center;
    height: 32px;
    .logo {
      padding: 6px 8px;
      cursor: pointer;
    }
  }
  .panel-container {
    padding: 8px;
    &.unvisible {
      display: none;
    }
  }
  .locate-panel-contaner {
  }
  .search-panel-contaner {
  }
}
</style>
