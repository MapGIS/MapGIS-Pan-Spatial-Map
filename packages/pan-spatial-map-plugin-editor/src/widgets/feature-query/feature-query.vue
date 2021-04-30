<template>
  <div class="mp-widget-feature-query">
    <mapgis-draw
      ref="drawer"
      :controls="controls"
      @added="handleAdded"
      @drawCreate="drawFinish"
    />
    <a-radio-group :value="clickType" @change="clickDraw">
      <a-radio-button
        v-for="item in widgetInfo.config.queryType"
        :key="item.name"
        :value="item.name"
      >
        {{ item.name }}
      </a-radio-button>
    </a-radio-group>
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
import { Component, Vue, Mixins } from 'vue-property-decorator'
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
import MapBoxDraw from './mixins/mapbox-draw'
import CesiumDraw from './mixins/cesium-draw'
import {
  lineString,
  polygon,
  point,
  booleanCrosses,
  booleanPointInPolygon,
  booleanDisjoint
} from '@turf/turf'
// TODO 完成判断两个面是否相交

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

  private clickType = ''

  private get limits() {
    return this.limitsArray[this.sliderIndex]
  }

  onOpen() {
    this.show = true
  }

  onClose() {
    this.show = false
  }

  clickDraw(e) {
    this.clickType = e.target.value
    if (this.is2DMapMode) {
      this.handleMapbox()
    } else {
      this.handleCesium()
    }
  }

  handleCesium() {
    this.createCesium()
    switch (this.clickType) {
      case '点':
        this.interactionDrawPnt()
        break
      case '线':
        this.interactionDrawLine()
        break
      case '面':
        this.interactionDrawPolygon()
        break
      case '矩形':
        // this.toggleRect()
        break
      case '圆':
        // this.toggleRect()
        break
      default:
        break
    }
  }

  handleMapbox() {
    switch (this.clickType) {
      case '点':
        this.togglePoint()
        break
      case '线':
        this.togglePolyline()
        break
      case '面':
        this.togglePolygon()
        break
      case '矩形':
        this.toggleRect()
        break
      case '圆':
        // this.toggleRect()
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
  .buffer-container {
    margin-top: 20px;
    color: @title-color;
  }
}
</style>
