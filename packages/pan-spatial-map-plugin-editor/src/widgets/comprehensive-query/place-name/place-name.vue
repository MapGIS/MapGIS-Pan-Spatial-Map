<template>
  <div class="place-name-container">
    <div class="float-pop-container" v-show="!showResult">
      <span
        v-for="item in allItems"
        :key="`地名地址${item.placeName}`"
        @click="select(item)"
        :class="{ active: selected.indexOf(item.placeName) > -1 }"
      >
        {{ item.placeName }}
      </span>
    </div>
    <a-tabs v-model="tab" type="card" v-if="showResult">
      <a-tab-pane v-for="item in selected" :key="item" :tab="item">
        <result-tab
          :widgetInfo="widgetInfo"
          :name="item"
          :keyword="keyword"
          :activeTab="tab"
          @show-coords="showCoords"
          @click-item="setCenter"
        ></result-tab>
      </a-tab-pane>
    </a-tabs>
    <place-name-mapbox
      ref="place-name-mapbox"
      :markers="markers"
      :fieldNames="fieldNames"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { WidgetInfoMixin } from '@mapgis/web-app-framework'
import ResultTab from './result-tab'
import PlaceNameMapbox from './place-name-mapbox.vue'

@Component({ components: { ResultTab, PlaceNameMapbox } })
export default class PlaceName extends Vue {
  @Prop() widgetInfo!: Record<string, unknown>

  private selected: string[] = []

  private showResult = false

  private keyword = ''

  private tab = ''

  private markers = []

  private fieldNames: string[] = []

  private get allItems() {
    return this.widgetInfo.config.placeName.queryTable
  }

  select(item: any) {
    const index = this.selected.indexOf(item.placeName)
    if (index < 0) {
      this.selected.push(item.placeName)
    } else {
      this.selected.splice(index, 1)
    }
  }

  search(keyword: string) {
    this.keyword = keyword
    this.showResult = true
    this.tab = this.selected[0]
  }

  reset() {
    this.showResult = false
    this.tab = ''
  }

  showCoords(markers, fieldNames) {
    this.markers = markers
    this.fieldNames = fieldNames
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
      &:hover {
        cursor: pointer;
      }
    }
    .active {
      color: @primary-color;
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
</style>
