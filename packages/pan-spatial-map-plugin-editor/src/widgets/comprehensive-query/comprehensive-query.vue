<template>
  <div>
    <mapgis-ui-comprehensive-query
      :geoJSONExtent="extent"
      :logo="logo"
      :districtName="locationType === 'district' ? districtName : ''"
      :widgetInfo="config"
      :defaultMarkerIcon="defaultMarkerIcon"
      :selectedMarkerIcon="selectedMarkerIcon"
      @onClose="onClose"
      @onSearch="onSearch"
      @current-result="currentResult"
      @select-markers="selectMarkers"
      @click-item="clickItem"
      @change-cluster="changeCluster"
      @open-attribute-table="openAttributeTable"
      @remove-attribute-table="removeAttributeTable"
      @color-cluster="setColorCluster"
    >
      <mapgis-ui-tabs v-model="locationType" size="small" type="card">
        <mapgis-ui-tab-pane key="district" tab="行政区划定位">
          <zone
            ref="zone"
            v-if="district"
            :district="district"
            :active="locationType === 'district'"
            @change="change"
          />
        </mapgis-ui-tab-pane>
        <mapgis-ui-tab-pane key="coordinate" tab="坐标定位" force-render>
          <coordinate
            ref="coordinate"
            :active="locationType === 'coordinate'"
            @change="change"
          />
        </mapgis-ui-tab-pane>
        <mapgis-ui-tab-pane key="map-sheet" tab="图幅定位">
          <frame
            ref="map-sheet"
            @change="change"
            :active="locationType === 'map-sheet'"
          />
        </mapgis-ui-tab-pane>
      </mapgis-ui-tabs>
    </mapgis-ui-comprehensive-query>
    <place-name-mapbox
      :defaultMarkerIcon="defaultMarkerIcon"
      :selectedMarkerIcon="selectedMarkerIcon"
      :hoverMarker="hoverMarker"
      :cluster="cluster"
      :geojson="current"
      :colorCluster="colorCluster"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import {
  LayerType,
  AppMixin,
  MapMixin,
  ExhibitionControllerMixin,
  Feature,
  Exhibition,
  WidgetMixin
} from '@mapgis/web-app-framework'
import { api, markerIconInstance } from '@mapgis/pan-spatial-map-common'
import Zone from './components/ZoneFrame/Zone.vue'
import Coordinate from './components/Coordinate/Coordinate.vue'
import Frame from './components/ZoneFrame/Frame.vue'
import PlaceNameMapbox from './components/PlaceName/PlaceNameMapbox.vue'
import * as turf from '@turf/turf'

const { IAttributeTableExhibition, AttributeTableExhibition } = Exhibition

@Component({
  name: 'MpComprehensiveQuery',
  components: { Zone, Coordinate, Frame, PlaceNameMapbox }
})
export default class MpComprehensiveQuery extends Mixins(
  WidgetMixin,
  ExhibitionControllerMixin,
  AppMixin,
  MapMixin
) {
  /**
   * 查询范围
   */
  private extent = null

  /**
   * 是否开启聚合标注
   */
  private cluster = false

  private colorCluster = ''

  /**
   * 控制面板回传回来的范围
   */
  private geoJSONExtent = null

  /**
   * 查询的结果
   */
  private current = { type: 'FeatureCollection', features: [] }

  private districtName = ''

  /**
   * 鼠标移入的marker
   */
  private hoverMarker = []

  /**
   * 行政区范围
   */
  private district = null

  /**
   * 默认图标
   */
  private defaultMarkerIcon = ''

  /**
   * 选中图标
   */
  private selectedMarkerIcon = ''

  // 可选district：行政区划定位；coordinate：坐标定位；map-sheet：图幅号定位
  private locationType = 'district'

  get logoType() {
    return this.locationType || 'district'
  }

  /**
   * logo地址
   */
  get logo() {
    return `${this.appAssetsUrl}${this.widgetInfo.uri}/images/${this.logoType}.png`
  }

  /**
   * 微件配置信息
   */
  private get config() {
    return this.widgetInfo.config
  }

  async mounted() {
    try {
      const districtConfig = await api.getConfig('district')
      if (districtConfig && districtConfig.length > 0) {
        this.district = districtConfig[0]

        this.districtName = this.district?.defaults.text
      }
    } catch (error) {
      console.log(error)
    }

    try {
      this.defaultMarkerIcon = await markerIconInstance.unSelectIcon()
      this.selectedMarkerIcon = await markerIconInstance.selectIcon()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 点击关闭的回调函数
   */
  onClose() {
    this.$refs.zone && this.$refs.zone.clear()
    this.$refs.coordinate && this.$refs.coordinate.clear()
    this.$refs['map-sheet'] && this.$refs['map-sheet'].clear()
  }

  /**
   * 查询时的回调函数（在没有查询范围时，采用当前屏幕的范围）
   */
  onSearch() {
    if (
      this.geoJSONExtent === null ||
      JSON.stringify(this.geoJSONExtent) === '{}'
    ) {
      this.extent = this.getBounds()
    } else {
      this.extent = this.geoJSONExtent
    }
  }

  /**
   * 设置聚合图标的颜色
   */
  setColorCluster(color: string) {
    this.colorCluster = color
  }

  /**
   * 手动选择范围的时候回调函数
   */
  change(val) {
    this.geoJSONExtent = val
  }

  /**
   * 获取屏幕范围
   */
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
    return polygon
  }

  /**
   * 当前展示的结果回调函数（将查询结果展示至地图上）
   */
  currentResult(geojson) {
    this.current = geojson
  }

  /**
   * 当前点击的条目的回调函数（实现点击后跳转中心点）
   */
  clickItem(feature) {
    const center = Feature.getGeoJSONFeatureCenter(feature)
    if (this.is2DMapMode) {
      this.map.flyTo({
        center: center,
        curve: 1,
        easing(t) {
          return t
        }
      })
    } else {
      this.webGlobe.flyTo(center[0], center[1])
    }
  }

  /**
   * 当前选中的坐标
   */
  selectMarkers(selectMarkers) {
    this.hoverMarker = selectMarkers
  }

  /**
   * 聚合按钮改变时的回调
   */
  changeCluster(val) {
    this.current = { type: 'FeatureCollection', features: [] }
    this.cluster = val
  }

  /**
   * 打开属性表回调函数
   */
  openAttributeTable(exhibition) {
    this.addExhibition(new AttributeTableExhibition(exhibition))
    this.openExhibitionPanel()
  }

  /**
   * 关闭属性表回调函数
   */
  removeAttributeTable(exhibitionId) {
    this.removeExhibition(exhibitionId)
  }
}
</script>
