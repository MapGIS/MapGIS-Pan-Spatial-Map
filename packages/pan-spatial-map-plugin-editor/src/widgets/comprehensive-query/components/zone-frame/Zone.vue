<template>
  <div class="zone-container">
    <div class="search-head-container">
      <a-input v-model="keyword" placeholder="请输入行政区关键字" />
      <a-button icon="redo" @click="reset" shape="circle"></a-button>
      <a-button icon="close" @click="clear" shape="circle"> </a-button>
    </div>
    <a-spin :spinning="spinning">
      <div>
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
      </div>
    </a-spin>
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
import {
  FeatureGeoJSON,
  request,
  api,
  FeatureQueryParam,
  queryFeaturesInstance
} from '@mapgis/pan-spatial-map-store'
import { bboxPolygon, lineString, bbox } from '@turf/turf'
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

  @Prop()
  readonly active!: boolean

  private keyword = ''

  private currents: Record<string, string> = []

  private back: Record<string, string>[] = []

  private geojson: Record<string, any> = {}

  private fillOutlineColor = '#484896'

  private fillColor = '#6e599f'

  private lineWidth = '2'

  private options: string[] = ['setStyle']

  private defaults = {}

  private gdbpInfos = []

  private spinning = false

  private get setStyle() {
    return this.options.includes('setStyle')
  }

  private get current() {
    if (this.currents.length > 0) {
      return this.currents[this.currents.length - 1]
    }
    return null
  }

  mounted() {
    this.reset()
  }

  private get list() {
    const gdbpInfo = this.gdbpInfos[this.currents.length - 1]
    if (this.geojson && Object.keys(this.geojson).length > 0 && gdbpInfo) {
      return this.geojson.features.map(x => {
        const { nameField, codeField, level } = gdbpInfo
        return {
          name: x.properties[nameField],
          level: level,
          code: x.properties[codeField]
        }
      })
    }
    return []
  }

  @Watch('fillColor')
  @Watch('fillOutlineColor')
  @Watch('current', { immediate: true, deep: true })
  private changeCurrent() {
    this.getGeoJson()
  }

  @Watch('active')
  activeChange(val) {
    if (!val) {
      this.clear()
    } else {
      this.getGeoJson()
    }
  }

  @Watch('geojson')
  private changeGeojson(val: FeatureGeoJSON | null) {
    if (val && JSON.stringify(val) !== '{}') {
      const box = bbox(val)
      const polygon = bboxPolygon(box)
      this.$emit('change', polygon)
    } else {
      this.$emit('change', val)
    }
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

  private async reset() {
    const districtJson = await api.getConfig('district')
    if (districtJson && districtJson.length > 0) {
      const { defaults, gdbpInfos } = districtJson[0]
      this.defaults = defaults
      this.gdbpInfos = gdbpInfos
      this.currents = [
        {
          name: this.defaults.text,
          level: this.defaults.level,
          code: this.defaults.code
        }
      ]
    }
  }

  private goBack(index) {
    this.currents = this.currents.slice(0, index + 1)
  }

  private select(item: { code: string; name: string }) {
    if (item.code !== this.current.code) {
      // this.back.push(this.current)
      this.currents.push(item)
    }
  }

  private include(name: string, keyword: string) {
    return keyword && name.includes(keyword)
  }

  private async getGeoJson() {
    try {
      this.spinning = true
      const gdbpInfo = this.gdbpInfos[this.currents.length - 1]
      if (this.current) {
        const { ip, port, queryWay, docName } = this.defaults
        const { code, level } = this.current
        const params: FeatureQueryParam = {
          ip,
          port,
          f: 'geojson',
          pageCount: 3000,
          coordPrecision: 8
        }
        if (gdbpInfo) {
          const { gdbp, layerName, nameField, codeField } = gdbpInfo
          const filterCode = this.filterCode(level, code)
          const where = code ? `${codeField} LIKE '${filterCode}%'` : ''
          params.where = where
          if (queryWay === 'doc') {
            params.docName = docName
            params.layerName = layerName
            params.layerIdxs = ''
          } else if (queryWay === 'gdbp') {
            params.gdbp = gdbp
          }
          const info = await queryFeaturesInstance.query(params, false)
          this.geojson = { type: 'FeatureCollection', features: info.features }
        } else if (
          // 当选中最后一级别的时候
          this.gdbpInfos.length > 0 &&
          this.currents.length > this.gdbpInfos.length
        ) {
          const { gdbp, layerName, nameField, codeField } = this.gdbpInfos[
            this.gdbpInfos.length - 1
          ]
          const where = `${codeField} = '${code}'`
          params.where = where
          if (queryWay === 'doc') {
            params.docName = docName
            params.layerName = layerName
            params.layerIdxs = ''
          } else if (queryWay === 'gdbp') {
            params.gdbp = gdbp
          }
          const info = await queryFeaturesInstance.query(params, false)
          this.geojson = { type: 'FeatureCollection', features: info.features }
        } else {
          throw Error('gdbpInfos配置不正确')
        }
      } else {
        throw Error('暂无数据')
      }
    } catch (error) {
    } finally {
      this.spinning = false
    }
  }

  filterCode(level, code) {
    switch (level) {
      case '1':
        return ''
      case '2':
        return code.substring(0, 2)
      case '3':
        return code.substring(0, 4)
      case '4':
        return code.substring(0, 6)
      case '5':
        return code.substring(0, 9)
      case '6':
        return code.substring(0, 12)
      default:
        return ''
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
    max-height: 200px;
    overflow-y: auto;
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
