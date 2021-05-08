<template>
  <div class="zone-container">
    <div class="search-head-container">
      <a-input v-model="keyword" placeholder="请输入行政区关键字" />
      <a-button icon="redo" @click="reset" shape="circle"></a-button>
      <a-button icon="close" @click="clear" shape="circle"> </a-button>
    </div>
    <div separator=">" class="current-name">
      <div
        v-for="(item, index) in currents"
        :key="index"
        @click="goBack(index)"
        class="breadcrumb"
      >
        <span v-if="index !== 0" class="separator">{{ '>' }}</span>
        <span class="text">{{ item.name }}</span>
      </div>
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
    <div class="custom-color" v-show="setStyle">
      <a-row type="flex" align="middle">
        <a-col :span="8">
          填充颜色：
        </a-col>
        <a-col :span="16">
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker
                :value="fillColor"
                @input="val => getFillColor(val)"
              />
            </template>
            <div :style="{ background: fillColor }" class="color"></div>
          </a-popover>
        </a-col>
      </a-row>
      <a-row type="flex" align="middle">
        <a-col :span="8">
          轮廓线颜色：
        </a-col>
        <a-col :span="16">
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker
                :value="fillOutlineColor"
                @input="val => getFillOutlineColor(val)"
              />
            </template>
            <div :style="{ background: fillOutlineColor }" class="color"></div>
          </a-popover>
        </a-col>
      </a-row>
    </div>
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
import { Sketch } from 'vue-color'
import ZoneFrameMapbox from './ZoneFrameMapbox.vue'
import ZoneFrameCesium from './ZoneFrameCesium.vue'

@Component({
  components: {
    ZoneFrameMapbox,
    ZoneFrameCesium,
    'sketch-picker': Sketch
  }
})
export default class Zone extends Mixins(AppMixin) {
  @Model('change', { type: Object, required: false, default: null })
  private value!: FeatureGeoJSON | null

  @Prop(Boolean)
  readonly visible!: boolean

  private keyword = ''

  private currents: Record<string, string> = [{ id: '', name: '中国' }]

  private back: Record<string, string>[] = []

  private geojson: Record<string, any> = {}

  private fillOutlineColor = '#484896'

  private fillColor = '#6e599f'

  private lineWidth = '2'

  private options: string[] = ['setStyle']

  private get setStyle() {
    return this.options.includes('setStyle')
  }

  private get current() {
    if (this.currents.length > 0) {
      return this.currents[this.currents.length - 1]
    }
    return { id: '', name: '中国' }
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

  // 选中轮廓线颜色拾取器对应事件
  getFillColor(val) {
    this.fillColor = val.hex
  }

  getFillOutlineColor(val) {
    this.fillOutlineColor = val.hex
  }

  private reset() {
    this.currents = [{ id: '', name: '中国' }]
  }

  private goBack(index) {
    this.currents = this.currents.slice(0, index + 1)
  }

  private select(item: { id: string; name: string }) {
    if (item.id !== this.current.id) {
      // this.back.push(this.current)
      this.currents.push(item)
    }
  }

  private include(name: string, keyword: string) {
    return keyword && name.includes(keyword)
  }

  private getConfig = (strUrl: string) => Axios.get(strUrl)

  private async getGeoJson() {
    const { id } = this.current
    let url = this.appAssetsUrl
    if (!id) {
      // 中国
      url += '/widgets/comprehensive-query/data/china.json'
      const { data } = await this.getConfig(url)
      this.geojson = data
    } else if (id.length === 2) {
      // 省
      url += `/widgets/comprehensive-query/data/geometryProvince/${id}.json`
      const { data } = await this.getConfig(url)
      this.geojson = data
    } else if (id.length === 4) {
      // 市
      url += `/widgets/comprehensive-query/data/geometryCouties/${id}00.json`
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
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 15px;
    .breadcrumb {
      display: flex;
      align-items: center;
      .text {
        color: @blue-4;
        cursor: pointer;
      }
      .separator {
        padding: 0 4px;
      }
      &:last-child {
        .text {
          color: @blue-6;
          font-weight: bold;
        }
      }
    }
  }
  .select-name {
    padding-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    color: @primary-color;
    span {
      padding: 0 8px 8px 0;
      cursor: pointer;
      white-space: nowrap;
    }
  }
  .custom-color {
    margin-top: 18px;
    .ant-row-flex:first-child {
      margin-bottom: 10px;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .active {
    color: @error-color !important;
  }
}
</style>
