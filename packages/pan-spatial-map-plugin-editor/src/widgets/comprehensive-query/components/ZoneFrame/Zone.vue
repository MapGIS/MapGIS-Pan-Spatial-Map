<template>
  <div class="zone-container">
    <div class="search-head-container">
      <a-input v-model="keyword" placeholder="请输入行政区关键字" allow-clear />
      <div class="actions">
        <a-tooltip placement="bottom" title="设置">
          <a-icon
            :class="{ action: true, active: showSettingPanel }"
            @click="showSettingPanel = !showSettingPanel"
            type="setting"
          >
          </a-icon>
        </a-tooltip>
      </div>
    </div>
    <a-spin :spinning="spinning">
      <div>
        <div separator=">" class="current-name">
          <div
            v-for="(item, index) in zoneBreadcrumbItems"
            :key="index"
            @click="onZoneBreadcrumbClick(index)"
            class="breadcrumb"
          >
            <span v-if="index !== 0" class="separator">{{ '>' }}</span>
            <span class="text">{{ item.name }}</span>
          </div>
        </div>
        <div class="select-name">
          <li
            v-for="zone in nextLevelZoneList"
            :key="zone.id"
            @click="onZoneClick(zone)"
            :class="{ active: includeZone(zone.name, keyword) }"
          >
            {{ zone.name }}
          </li>
        </div>
      </div>
    </a-spin>
    <div v-show="showSettingPanel" class="setting-panel">
      <a-divider></a-divider>
      <a-space direction="vertical" style="width: 100%;">
        <a-row>
          <label>填充颜色</label>
        </a-row>
        <a-row>
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker :value="fillColor" @input="onFillColorChange" />
            </template>
            <div :style="{ background: fillColor }" class="color"></div>
          </a-popover>
        </a-row>
        <a-row>
          <label>轮廓线颜色</label>
        </a-row>
        <a-row>
          <a-popover trigger="click">
            <template slot="content">
              <sketch-picker :value="lineColor" @input="onLineColorChange" />
            </template>
            <div :style="{ background: lineColor }" class="color"></div>
          </a-popover>
        </a-row>
        <a-row>
          <label>轮廓线宽度</label>
        </a-row>
        <a-row>
          <a-input type="number" v-model="lineWidth" />
        </a-row>
      </a-space>
    </div>
    <zone-frame-mapbox
      :feature="currentLevelFeature"
      :fit-bound="currentLevelFitBound"
      :highlight-style="highlightStyle"
    ></zone-frame-mapbox>
    <zone-frame-cesium
      :feature="currentLevelFeature"
      :fit-bound="currentLevelFitBound"
      :highlight-style="highlightStyle"
    ></zone-frame-cesium>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Watch,
  Mixins,
  Prop,
  Model,
  Emit
} from 'vue-property-decorator'
import { AppMixin, MapMixin } from '@mapgis/web-app-framework'
import Axios from 'axios'
import {
  FeatureGeoJSON,
  api,
  FeatureQueryParam,
  queryFeaturesInstance,
  baseConfigInstance
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
export default class Zone extends Mixins(AppMixin, MapMixin) {
  @Prop()
  readonly active!: boolean

  @Prop()
  readonly district!: object

  @Emit()
  change(val: FeatureGeoJSON | null) {}

  // 首级配置
  private defaults = {}

  // 其他级配置集合
  private gdbpInfos = []

  // 查询关键字
  private keyword = ''

  // 行政区按级别排列的集合，可形成面包屑
  private zoneBreadcrumbItems: Record<string, string> = []

  // 下一级的行政区要素集合，可以通过它获取到下一级的行政区列表
  private nextLevelFeatures: Record<string, any> = {}

  // 当前级的行政区要素
  private currentLevelFeature: Record<string, any> = {}

  // 当前级的行政区要素缩放范围
  private currentLevelFitBound: Record<string, any> = {}

  // 加载中
  private spinning = false

  // 编辑面板的显隐
  private showSettingPanel = false

  // 填充色
  private fillColor = baseConfigInstance.config.colorConfig.feature.reg.color

  // 边线颜色
  private lineColor = baseConfigInstance.config.colorConfig.feature.line.color

  // 边线宽度
  private lineWidth = baseConfigInstance.config.colorConfig.feature.line.size

  // 所选行政区的范围
  private geoJSON = {}

  private get highlightStyle() {
    return {
      label: {
        text: {
          color: this.lineColor,
          fontSize: '14'
        }
      },
      feature: {
        reg: {
          color: this.fillColor
        },
        line: {
          color: this.lineColor,
          size: this.lineWidth
        }
      }
    }
  }

  // 当前的行政区项
  private get currentZoneBreadcrumbItem() {
    if (this.zoneBreadcrumbItems.length > 0) {
      return this.zoneBreadcrumbItems[this.zoneBreadcrumbItems.length - 1]
    }
    return null
  }

  // 下级行政区划列表
  private get nextLevelZoneList() {
    const gdbpInfo = this.gdbpInfos[this.zoneBreadcrumbItems.length - 1]
    if (
      this.nextLevelFeatures &&
      Object.keys(this.nextLevelFeatures).length > 0 &&
      gdbpInfo
    ) {
      return this.nextLevelFeatures.features.map(x => {
        const { nameField, codeField, level } = gdbpInfo
        return {
          name: x.properties[nameField],
          level: level,
          code: x.properties[codeField],
          feature: x,
          fitBound: this.getFeatureFitBound(x)
        }
      })
    }
    return []
  }

  // 当当前行政区项改变时，需要修改当前行政区的要素和缩放范围，同时，获取下一级所有行政区信息
  @Watch('currentZoneBreadcrumbItem', { deep: true })
  private currentZoneBreadcrumbItemChange() {
    const { feature, fitBound } = this.currentZoneBreadcrumbItem

    this.currentLevelFeature = feature
    this.currentLevelFitBound = fitBound

    if (feature && JSON.stringify(feature) !== '{}') {
      const box = bbox(feature)
      this.geoJSON = bboxPolygon(box)
    } else {
      this.geoJSON = {}
    }
    this.change(this.geoJSON)
    this.getNextLevelZoneFeatures()
  }

  @Watch('active')
  activeChange(val) {
    if (!val) {
      this.clear()
    }
  }

  mounted() {
    this.init()
  }

  private onFillColorChange(val) {
    this.fillColor = `rgba(${val.rgba.r},${val.rgba.g},${val.rgba.b},${val.rgba.a})`
  }

  private onLineColorChange(val) {
    this.lineColor = `rgba(${val.rgba.r},${val.rgba.g},${val.rgba.b},${val.rgba.a})`
  }

  private onZoneBreadcrumbClick(index) {
    this.zoneBreadcrumbItems = this.zoneBreadcrumbItems.slice(0, index + 1)
  }

  private onZoneClick(item: { code: string; name: string; feature; fitBound }) {
    if (item.code !== this.currentZoneBreadcrumbItem.code) {
      this.zoneBreadcrumbItems.push(item)
    }
  }

  private async getNextLevelZoneFeatures() {
    try {
      this.spinning = true
      const gdbpInfo = this.gdbpInfos[this.zoneBreadcrumbItems.length - 1]
      if (this.currentZoneBreadcrumbItem) {
        const { ip, port, queryWay, docName } = this.defaults
        const { code, level } = this.currentZoneBreadcrumbItem
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
          this.nextLevelFeatures = {
            type: 'FeatureCollection',
            features: info.features
          }
        } else if (
          // 当选中最后一级别的时候
          this.gdbpInfos.length > 0 &&
          this.zoneBreadcrumbItems.length > this.gdbpInfos.length
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
          this.nextLevelFeatures = {
            type: 'FeatureCollection',
            features: info.features
          }
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

  private init() {
    const { defaults, gdbpInfos } = this.district
    this.defaults = defaults
    this.gdbpInfos = gdbpInfos
    this.zoneBreadcrumbItems = [
      {
        name: this.defaults.text,
        level: this.defaults.level,
        code: this.defaults.code,
        feature: {},
        fitBound: {}
      }
    ]
  }

  private filterCode(level, code) {
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

  private includeZone(name: string, keyword: string) {
    return keyword && name.includes(keyword)
  }

  private getFeatureFitBound(feature) {
    if (feature && JSON.stringify(feature) !== '{}') {
      const box = bbox(feature)
      const polygon = bboxPolygon(box)

      if (polygon.geometry) {
        const bound = {
          xmin: polygon.geometry.coordinates[0][0][0],
          ymin: polygon.geometry.coordinates[0][0][1],
          xmax: polygon.geometry.coordinates[0][2][0],
          ymax: polygon.geometry.coordinates[0][2][1]
        }

        // 把bound缩小到1/2
        const width = bound.xmax - bound.xmin
        const height = bound.ymax - bound.ymin
        const center = {
          x: (bound.xmin + bound.xmax) / 2,
          y: (bound.ymin + bound.ymax) / 2
        }
        return {
          xmin: center.x - width,
          ymin: center.y - height,
          xmax: center.x + width,
          ymax: center.y + height
        }
      }
    }

    return {}
  }

  private clear() {
    this.currentLevelFeature = {}
    this.geoJSON = {}
    this.change(this.geoJSON)
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
    .actions {
      display: flex;
      align-items: center;
      flex: 1;
      text-align: right;
      font-size: 17px;
      color: @text-color;
      padding-left: 10px;
      .action {
        margin: 0 8px;
        cursor: pointer;
        &:hover,
        &.active {
          color: @primary-color;
        }
        &:first-child {
          margin-left: 0;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
  .current-name {
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 8px;
    .breadcrumb {
      display: flex;
      align-items: center;
      .text {
        color: @primary-color;
        cursor: pointer;
      }
      .separator {
        padding: 0 4px;
      }
      &:last-child {
        .text {
          color: @primary-color;
          font-weight: bold;
        }
      }
    }
  }
  .select-name {
    font-size: 13px;
    padding-bottom: 8px;
    display: flex;
    flex-wrap: wrap;
    color: @text-color;
    overflow-y: auto;
    line-height: 20px;
    li {
      display: inline-block;
      margin-right: 9px;
      cursor: pointer;
      &:hover {
        color: @primary-color;
      }
    }
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .active {
    color: @primary-color !important;
  }
}
</style>
