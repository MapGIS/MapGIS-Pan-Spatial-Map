<template>
  <div class="mp-widget-feature-query">
    <mapgis-draw
      ref="drawer"
      :controls="controls"
      :styles="drawStyle"
      @added="onAdded"
      @drawCreate="onDrawFinish"
    />
    <mapgis-3d-draw
      ref="drawref"
      @load="handleDrawLoad"
      @drawcreate="handleCreate"
    >
    </mapgis-3d-draw>
    <div class="toolbar">
      <template v-for="type in queryTypes">
        <a-tooltip placement="bottom" :title="type.label" :key="type.id">
          <div
            :class="{ command: true, active: queryType === type.id }"
            @click="onQueryDraw(type.id)"
            :key="type.id"
          >
            <span v-if="type.icon.startsWith('icon-')">{{ type.label }}</span>
            <mp-icon v-else :icon="type.icon" />
          </div>
        </a-tooltip>
      </template>
    </div>
    <div class="buffer-container">
      缓冲半径(km):
    </div>
    <div>
      <a-slider
        v-model="sliderIndex"
        :marks="marks"
        :min="0"
        :max="limitsArray.length - 1"
        :tipFormatter="() => `${limits}km`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Watch } from 'vue-property-decorator'
import {
  dataCatalogInstance,
  queryFeaturesInstance,
  utilInstance,
  baseConfigInstance,
  ExhibitionControllerMixin,
  IAttributeTableListExhibition,
  AttributeTableListExhibition
} from '@mapgis/pan-spatial-map-store'
import {
  WidgetMixin,
  AppMixin,
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  Sublayer
} from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import {
  lineString,
  polygon,
  point,
  booleanCrosses,
  booleanPointInPolygon,
  booleanDisjoint
} from '@turf/turf'
import MapBoxDraw from './mixins/mapbox-draw'
import CesiumDraw from './mixins/cesium-draw'
import DrawStyle from '../../styles/draw-style'

@Component
export default class MpFeatureQuery extends Mixins(
  MapBoxDraw,
  CesiumDraw,
  WidgetMixin,
  AppMixin,
  ExhibitionControllerMixin
) {
  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  private show = false

  private limitsArray: Array<number> = [0, 0.1, 0.5, 1, 5]

  private get marks() {
    return {
      ...this.limitsArray
    }
  }

  private sliderIndex = 0

  private queryType = ''

  private defaultQueryTypes2d = [
    'Point',
    'Circle',
    'Rectangle',
    'Polygon',
    'LineString'
  ]

  private defaultQueryTypes3d = ['Point', 'Polygon', 'LineString']

  private drawStyle = []

  private get limits() {
    return this.limitsArray[this.sliderIndex]
  }

  private get queryTypes2d() {
    return this.widgetInfo.config.queryType.filter(type => {
      return this.defaultQueryTypes2d.includes(type.id)
    })
  }

  private get queryTypes3d() {
    return this.widgetInfo.config.queryType.filter(type => {
      return this.defaultQueryTypes3d.includes(type.id)
    })
  }

  private get queryTypes() {
    return this.is2DMapMode ? this.queryTypes2d : this.queryTypes3d
  }

  // 二三维地图模式切换时
  @Watch('mapRender')
  mapRenderChange() {
    if (this.is2DMapMode) {
      this.clearCesiumDraw3D()
    } else {
      this.clearMapboxDraw()
    }
  }

  created() {
    this.widgetInfo.config.queryType.forEach(type => {
      if (type.id === '') {
        type.id = 'Rectangle'
      }
    })
  }

  mounted() {
    this.drawStyle = DrawStyle
  }

  // 微件关闭时
  onClose() {
    this.clearDraw()
  }

  // 微件失活时
  onDeActive() {
    this.clearDraw()
  }

  onQueryDraw(type) {
    this.queryType = type
    if (this.is2DMapMode) {
      this.handleMapbox()
    } else {
      this.handleCesium()
    }
  }

  clearDraw() {
    if (this.is2DMapMode) {
      this.clearMapboxDraw()
    } else {
      this.clearCesiumDraw3D()
    }
  }

  handleCesium() {
    switch (this.queryType) {
      case 'Point':
        this.togglePoint3D()
        break
      case 'LineString':
        this.togglePolyline3D()
        break
      case 'Polygon':
        this.togglePolygon3D()
        break
      case 'Rectangle':
        // this.interactionDrawRectangle()
        break
      case 'PickModel':
        // this.interactionPickModel()
        break
      default:
        break
    }
  }

  handleMapbox() {
    switch (this.queryType) {
      case 'Point':
        this.togglePoint()
        break
      case 'LineString':
        this.togglePolyline()
        break
      case 'Polygon':
        this.togglePolygon()
        break
      case 'Rectangle':
        this.toggleRect()
        break
      case 'Circle':
        this.toggleCircle()
        break
      default:
        break
    }
  }

  queryLayer(bound: Record<string, number>) {
    if (!this.document) {
      return
    }

    const layerArr = this.document.defaultMap.layers()
    layerArr.forEach(item => {
      const mapData = item
      if (!this.isCross(bound, item.fullExtent)) {
        return
      }
      if (mapData.type === LayerType.IGSVector) {
        this.quertFeatruesByVector(mapData, bound)
      } else if (mapData.type === LayerType.IGSMapImage) {
        this.queryFeaturesByDoc(mapData, bound)
      }
    })
  }

  private isCross(bound, fullExtent): boolean {
    let feature
    const { ymax, ymin, xmax, xmin } = fullExtent
    const extentPolygon = polygon([
      [
        [Number(xmin), Number(ymin)],
        [Number(xmax), Number(ymin)],
        [Number(xmax), Number(ymax)],
        [Number(xmin), Number(ymax)],
        [Number(xmin), Number(ymin)]
      ]
    ])
    switch (bound.getGeometryType()) {
      case 'point':
        feature = point([bound.x, bound.y])
        break

      case 'line':
        feature = lineString(bound.pointArr.map(point => [point.x, point.y]))
        break

      case 'polygon':
        feature = polygon([bound.pointArr.map(point => [point.x, point.y])])
        break

      case 'rect':
        const { ymax, ymin, xmax, xmin } = bound
        feature = polygon([
          [
            [xmin, ymin],
            [xmax, ymin],
            [xmax, ymax],
            [xmin, ymax],
            [xmin, ymin]
          ]
        ])
        break

      default:
        return false
    }

    return !booleanDisjoint(extentPolygon, feature)
  }

  queryFeaturesByDoc(mapData: IGSMapImageLayer, geo) {
    if (!mapData.isVisible) {
      return
    }
    const { ip, port, docName } = mapData._parseUrl(mapData.url)

    const exhibition: IAttributeTableListExhibition = {
      id: `${mapData.id}`,
      name: `${mapData.title} 查询结果`,
      description: '',
      options: []
    }

    const subLayers = mapData.allSublayers
    subLayers.forEach(layer => {
      if (!layer.visible) {
        return
      }
      exhibition.options.push({
        id: layer.id,
        name: layer.title,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: mapData.type,
        layerIndex: layer.id,
        serverName: docName,
        serverUrl: mapData.url,
        geometry: geo
      })
    })

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }

  quertFeatruesByVector(mapData: IGSVectorLayer, geo) {
    if (!mapData.isVisible) {
      return
    }
    const { ip, port, docName } = mapData._parseUrl(mapData.url)

    const exhibition: IAttributeTableListExhibition = {
      id: `${mapData.id}`,
      name: `${mapData.title} 查询结果`,
      options: [
        {
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: mapData.type,
          gdbp: mapData.gdbps,
          geometry: geo
        }
      ]
    }

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }
}
</script>

<style lang="less" scoped>
.mp-widget-feature-query {
  display: flex;
  flex-direction: column;
  color: @text-color;
  .toolbar {
    display: flex;
    align-items: center;
    text-align: right;
    height: 32px;
    font-size: 17px;
    color: @text-color;
    justify-content: space-between;
    .command {
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
  .buffer-container {
    margin-top: 12px;
    color: @title-color;
  }
}
</style>
