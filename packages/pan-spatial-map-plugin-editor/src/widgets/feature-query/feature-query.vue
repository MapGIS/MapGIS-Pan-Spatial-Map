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
    <mp-toolbar>
      <mp-toolbar-command-group>
        <mp-toolbar-command
          v-for="type in queryTypes"
          :key="type.id"
          :title="type.label"
          :icon="type.icon"
          :active="queryType === type.id"
          @click="onQueryDraw(type.id)"
        >
        </mp-toolbar-command>
        <a-divider type="vertical" />
        <mp-toolbar-command
          title="设置"
          icon="setting"
          :active="showSettingPanel"
          @click="showSettingPanel = !showSettingPanel"
        />
      </mp-toolbar-command-group>
    </mp-toolbar>
    <div v-show="showSettingPanel">
      <div class="buffer-container">
        缓冲半径(km)
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Watch, Inject } from 'vue-property-decorator'
import {
  dataCatalogInstance,
  queryFeaturesInstance,
  utilInstance,
  baseConfigInstance,
  ExhibitionControllerMixin,
  IAttributeTableListExhibition,
  AttributeTableListExhibition,
  cesiumUtilInstance
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
  @Inject('CesiumZondy') CesiumZondy

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

  private showSettingPanel = false

  private sliderIndex = 0

  private queryType = ''

  private defaultQueryTypes2d = [
    'Point',
    'Circle',
    'Rectangle',
    'Polygon',
    'LineString'
  ]

  private defaultQueryTypes3d = ['Point', 'Polygon', 'LineString', 'Rectangle']

  private drawStyle = []

  private get marks() {
    return {
      ...this.limitsArray
    }
  }

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
        this.toggleRect3D()
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
      if (!this.isCross(bound, item)) {
        return
      }
      if (mapData.type === LayerType.IGSVector) {
        this.quertFeatruesByVector(mapData, bound)
      } else if (mapData.type === LayerType.IGSMapImage) {
        this.queryFeaturesByDoc(mapData, bound)
      } else if (mapData.type === LayerType.IGSScene) {
        this.queryFeaturesByIGSScene(mapData, bound)
      } else if (mapData.type === LayerType.arcGISMapImage) {
        this.queryFeaturesByArcgis(mapData, bound)
      }
    })
  }

  private isCross(bound, item): boolean {
    const { fullExtent, type } = item
    let feature
    const { ymax, ymin, xmax, xmin } = fullExtent
    let extentPolygon
    if (!this.is2DMapMode && type === LayerType.IGSScene) {
      const {
        activeScene: { sublayers }
      } = item
      let vueKey = ''
      ;(sublayers || []).forEach(item => {
        if (item.isVisible) {
          vueKey = item.id
        }
      })
      if (vueKey !== '') {
        const { source } = this.CesiumZondy.M3DIgsManager.findSource(
          'default',
          vueKey
        )
        if (source.length > 0) {
          const tranform = source[0].root.transform
          const boundObj = cesiumUtilInstance.dataPositionExtenToDegreeExtend(
            fullExtent,
            tranform
          )
          extentPolygon = polygon([
            [
              [Number(boundObj.xmin), Number(boundObj.ymin)],
              [Number(boundObj.xmax), Number(boundObj.ymin)],
              [Number(boundObj.xmax), Number(boundObj.ymax)],
              [Number(boundObj.xmin), Number(boundObj.ymax)],
              [Number(boundObj.xmin), Number(boundObj.ymin)]
            ]
          ])
        }
      }
    } else {
      extentPolygon = polygon([
        [
          [Number(xmin), Number(ymin)],
          [Number(xmax), Number(ymin)],
          [Number(xmax), Number(ymax)],
          [Number(xmin), Number(ymax)],
          [Number(xmin), Number(ymin)]
        ]
      ])
    }
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

  queryFeaturesByIGSScene(mapData, geo) {
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
    const {
      activeScene: { sublayers }
    } = mapData
    sublayers.forEach(layer => {
      if (!layer.isVisible) {
        return
      }
      exhibition.options.push({
        id: layer.id,
        name: layer.title || layer.name,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
        serverType: mapData.type,
        gdbp: 'gdbp://MapGisLocal/示例数据/ds/三维示例/sfcls/景观_模型',
        geometry: geo
      })
    })

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }

  queryFeaturesByDoc(mapData, geo) {
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

  queryFeaturesByArcgis(mapData, geo) {
    if (!mapData.isVisible) {
      return
    }

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
        serverType: mapData.type,
        layerIndex: layer.id,
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
  .buffer-container {
    margin-top: 12px;
    color: @title-color;
  }
}
</style>
