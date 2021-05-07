<template>
  <div class="zone-container">
    <div class="search-head-container">
      <a-input v-model="keyword" />
      <a-button icon="search" shape="circle"></a-button>
      <a-button icon="redo" @click="reset" shape="circle"></a-button>
      <a-button icon="close" @click="clear" shape="circle"> </a-button>
    </div>
    <div class="current-name" @click="geBack">
      {{ current.name }}
    </div>
    <div class="select-name">
      <span
        v-for="item in list"
        :key="item.id"
        @click="select(item)"
        :class="{ active: include(item.name, keyword) }"
      >
        {{ item.name }}
      </span>
    </div>
    <a-divider />
    <a-checkbox-group v-model="options">
      <a-checkbox value="setStyle">
        设置图形样式
      </a-checkbox>
    </a-checkbox-group>
    <zone-frame-mapbox
      v-if="is2DMapMode"
      :geojson="geojson"
      :fillOutlineColor="fillOutlineColor"
      :fillColor="fillColor"
    ></zone-frame-mapbox>
    <zone-frame-cesium
      v-else
      :geojson="geojson"
      :fillOutlineColor="fillOutlineColor"
      :fillColor="fillColor"
    ></zone-frame-cesium>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Model } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import Axios from 'axios'
import { FeatureGeoJSON, request } from '@mapgis/pan-spatial-map-store'
import ZoneFrameMapbox from './ZoneFrameMapbox.vue'
import ZoneFrameCesium from './ZoneFrameCesium.vue'

@Component({
  components: {
    ZoneFrameMapbox,
    ZoneFrameCesium
  }
})
export default class Zone extends Mixins(AppMixin) {
  @Model('change', { type: Object, required: false, default: null })
  private value!: FeatureGeoJSON | null

  @Prop(Boolean)
  readonly visible!: boolean

  private keyword = ''

  private current: Record<string, string> = { id: '', name: '中国' }

  private back: Record<string, string>[] = []

  private geojson: Record<string, any> = {}

  private fillOutlineColor = '#484896'

  private fillColor = '#6e599f'

  private lineWidth = '2'

  private options: string[] = ['setStyle']

  private get setStyle() {
    return this.options.includes('setStyle')
  }

  private activated() {
    this.reset()
  }

  private get list() {
    if (this.geojson && Object.keys(this.geojson).length > 0) {
      return this.geojson.features.map(x => ({
        id: x.properties.id,
        name: x.properties.name
      }))
    }
    return []
  }

  @Watch('fillColor')
  @Watch('fillOutlineColor')
  @Watch('current', { immediate: true, deep: true })
  private changeCurrent() {
    this.getGeoJson()
  }

  @Watch('geojson')
  private changeGeojson(val: FeatureGeoJSON | null) {
    this.$emit('change', val)
  }

  private clear() {
    this.geojson = {}
  }

  private reset() {
    this.current = { id: '', name: '中国' }
  }

  private geBack() {
    const item = this.back.pop()
    if (item) {
      this.current = item
    }
  }

  private select(item: { id: string; name: string }) {
    if (item.id !== this.current.id) {
      this.back.push(this.current)
      this.current = item
    }
  }

  private include(name: string, keyword: string) {
    return keyword && name.includes(keyword)
  }

  private getConfig = (strUrl: string) =>
    request({
      url: strUrl,
      method: 'get'
    })

  private async getGeoJson() {
    const { id } = this.current
    let url = this.appAssetsUrl
    if (!id) {
      // 中国
      url += '/widgets/ComprehensiveQuery/data/china.json'
      const { data } = await this.getConfig(url)
      this.geojson = data
    } else if (id.length === 2) {
      // 省
      url += `/widgets/ComprehensiveQuery/data/geometryProvince/${id}.json`
      const { data } = await this.getConfig(url)
      this.geojson = data
    } else if (id.length === 4) {
      // 市
      url += `/widgets/ComprehensiveQuery/data/geometryCouties/${id}00.json`
      const { data } = await this.getConfig(url)
      this.geojson = data
    } else if (this.geojson) {
      const feature = this.geojson.features.find(x => x.properties.id === id)
      if (feature) {
        this.geojson = {
          ...this.geojson,
          features: [feature]
        }
      }
    }
  }
}
</script>

<style lang="less">
.zone-container {
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  .search-head-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    .ant-btn {
      margin-left: 5px;
    }
  }
  .current-name {
    color: @primary-color;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    padding-bottom: 10px;
  }
  .select-name {
    padding-bottom: 10px;
    color: @primary-color;
    span {
      padding: 0 8px 8px 0;
      cursor: pointer;
    }
  }
  .color {
    height: 30px;
  }

  .active {
    color: red !important;
  }
}
</style>
