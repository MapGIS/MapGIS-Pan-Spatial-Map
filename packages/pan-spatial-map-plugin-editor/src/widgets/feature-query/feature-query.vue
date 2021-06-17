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
  Sublayer,
  Rectangle3D,
  Point3D
} from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import {
  lineString,
  polygon,
  point,
  booleanCrosses,
  booleanPointInPolygon,
  booleanDisjoint,
  booleanContains
} from '@turf/turf'
import MapBoxDraw from './mixins/mapbox-draw'
import CesiumDraw from './mixins/cesium-draw'
import DrawStyle from '../../styles/draw-style'

enum QueryType {
  Point = 'Point',
  Circle = 'Circle',
  Rectangle = 'Rectangle',
  Polygon = 'Polygon',
  LineString = 'LineString',
  PickModel = 'PickModel'
}

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
    QueryType.Point,
    QueryType.Circle,
    QueryType.Rectangle,
    QueryType.Polygon,
    QueryType.LineString
  ]

  private defaultQueryTypes3d = [
    QueryType.Point,
    QueryType.Polygon,
    QueryType.LineString,
    QueryType.Rectangle
  ]

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
        type.id = QueryType.Rectangle
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
      case QueryType.Point:
        this.togglePoint3D()
        break
      case QueryType.LineString:
        this.togglePolyline3D()
        break
      case QueryType.Polygon:
        this.togglePolygon3D()
        break
      case QueryType.Rectangle:
        this.toggleRect3D()
        break
      case QueryType.PickModel:
        // this.interactionPickModel()
        break
      default:
        break
    }
  }

  handleMapbox() {
    switch (this.queryType) {
      case QueryType.Point:
        this.togglePoint()
        break
      case QueryType.LineString:
        this.togglePolyline()
        break
      case QueryType.Polygon:
        this.togglePolygon()
        break
      case QueryType.Rectangle:
        this.toggleRect()
        break
      case QueryType.Circle:
        this.toggleCircle()
        break
      default:
        break
    }
  }

  queryLayer(bound: unknown) {
    if (!this.document) {
      return
    }
    const layerArr = this.document.defaultMap.layers()
    layerArr.forEach(item => {
      const mapData = item
      if (!this.isCross(bound, mapData)) {
        return
      }
      const geometry = this.setGeometry(mapData, bound)
      if (mapData.type === LayerType.IGSVector) {
        this.quertFeatruesByVector(mapData, geometry)
      } else if (mapData.type === LayerType.IGSMapImage) {
        this.queryFeaturesByDoc(mapData, geometry)
      } else if (mapData.type === LayerType.IGSScene) {
        this.queryFeaturesByIGSScene(mapData, geometry)
      } else if (mapData.type === LayerType.arcGISMapImage) {
        this.queryFeaturesByArcgis(mapData, geometry)
      }
    })
  }

  setGeometry(
    mapData,
    bound: Record<string, number> | Array<Record<string, number>>
  ) {
    let geo
    switch (this.queryType) {
      case QueryType.Point:
        if (!this.is2DMapMode && mapData.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里吧经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getTranform(mapData)
          if (transform) {
            const { x, y, z } = cesiumUtilInstance.degreeToDataPosition(
              bound,
              transform
            )
            geo = new Point3D(x, y, bound.z)
          }
        } else {
          geo = new Zondy.Common.Point2D(bound.x, bound.y, {
            nearDis: bound.nearDis
          })
        }
        break

      case QueryType.LineString:
        if (!this.is2DMapMode && mapData.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里吧经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getTranform(mapData)
          if (transform) {
            const { xmin, ymin, xmax, ymax, zmin, zmax } = this.getRect(
              bound,
              transform
            )
            geo = new Rectangle3D(xmin, ymin, zmin, xmax, ymax, zmax)
          }
        } else {
          let nearDis = 0
          const arr = bound.map((item: Record<string, number>) => {
            nearDis = item.nearDis
            return new Zondy.Common.Point2D(item.x, item.y, {
              nearDis
            })
          })
          geo = new Zondy.Common.PolyLine(arr, { nearDis })
        }
        break

      case QueryType.Polygon:
        if (!this.is2DMapMode && mapData.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里吧经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getTranform(mapData)
          if (transform) {
            const { xmin, ymin, xmax, ymax, zmin, zmax } = this.getRect(
              bound,
              transform
            )
            geo = new Rectangle3D(xmin, ymin, zmin, xmax, ymax, zmax)
          }
        } else {
          const arr = bound.map((item: Record<string, number>) => {
            const nearDis = item.nearDis
            return new Zondy.Common.Point2D(item.x, item.y, {
              nearDis
            })
          })
          geo = new Zondy.Common.Polygon(arr)
        }
        break

      case QueryType.Circle:
      case QueryType.Rectangle:
        if (!this.is2DMapMode && mapData.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里吧经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getTranform(mapData)
          const { xmin, ymin, xmax, ymax, zmin, zmax } = bound
          geo = this.setRect3D(
            { xmin, ymin, xmax, ymax, zmin: -100000, zmax: 100000 },
            transform
          )
        } else {
          const { xmin, ymin, xmax, ymax } = bound
          geo = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
        }
        break

      default:
        return false
    }

    return geo
  }

  setRect3D({ xmin, ymin, xmax, ymax, zmin, zmax }, transform) {
    if (transform) {
      const minPosition = cesiumUtilInstance.degreeToDataPosition(
        { x: xmin, y: ymin, z: zmin },
        transform
      )
      const maxPosition = cesiumUtilInstance.degreeToDataPosition(
        { x: xmax, y: ymax, z: zmax },
        transform
      )
      return new Rectangle3D(
        minPosition.x,
        minPosition.y,
        minPosition.z,
        maxPosition.x,
        maxPosition.y,
        maxPosition.z
      )
    }
    return undefined
  }

  getRect(arr, transform) {
    const positions = arr.map(bound => {
      const { x, y, z } = cesiumUtilInstance.degreeToDataPosition(
        bound,
        transform
      )
      return {
        x,
        y,
        z: bound.z
      }
    })
    let xmin = 0
    let ymin = 0
    let zmin = 0
    let xmax = 0
    let ymax = 0
    let zmax = 0
    positions.forEach(({ x, y, z }, index) => {
      if (index === 0) {
        xmin = x
        ymin = y
        zmin = z
        xmax = x
        ymax = y
        zmax = z
      } else {
        xmin = xmin - x < 0 ? xmin : x
        ymin = ymin - y < 0 ? ymin : y
        zmin = zmin - z < 0 ? zmin : z
        xmax = xmax - x > 0 ? xmax : x
        ymax = ymax - y > 0 ? ymax : y
        zmax = zmax - z > 0 ? zmax : z
      }
    })
    return {
      xmin,
      ymin,
      xmax,
      ymax,
      zmin,
      zmax
    }
  }

  getTranform(item) {
    const {
      activeScene: { sublayers }
    } = item
    let vueKey = ''
    let tranform = null
    ;(sublayers || []).forEach(item => {
      if (item.visible) {
        vueKey = item.id
      }
    })
    if (vueKey !== '') {
      const { source } = this.CesiumZondy.M3DIgsManager.findSource(
        'default',
        vueKey
      )
      if (source.length > 0) {
        tranform = source[0].root.transform
      }
    }
    return tranform
  }

  private isCross(bound, item): boolean {
    const { fullExtent, type } = item
    let feature
    const { ymax, ymin, xmax, xmin } = fullExtent
    let extentPolygon
    if (!this.is2DMapMode && type === LayerType.IGSScene) {
      const tranform = this.getTranform(item)
      if (tranform) {
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
    switch (this.queryType) {
      case QueryType.Point:
        feature = point([bound.x, bound.y])
        break

      case QueryType.LineString:
        feature = lineString(bound.map(point => [point.x, point.y]))
        break

      case QueryType.Polygon:
        feature = polygon([bound.map(point => [point.x, point.y])])
        break

      case QueryType.Circle:
      case QueryType.Rectangle:
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
    return (
      // 交叉或者包含都会继续查询
      !booleanDisjoint(extentPolygon, feature) ||
      booleanContains(extentPolygon, feature) ||
      booleanContains(feature, extentPolygon)
    )
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
      if (!layer.visible) {
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
