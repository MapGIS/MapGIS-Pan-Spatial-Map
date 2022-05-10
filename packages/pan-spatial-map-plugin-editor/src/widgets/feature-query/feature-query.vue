<template>
  <div class="mp-widget-feature-query">
    <mp-draw-pro ref="draw" @start="onDrawStart" @finished="onDrawFinished" />
    <mp-3d-draw-pro
      ref="draw3d"
      @start="onDrawStart"
      @finished="onDrawFinished"
    >
    </mp-3d-draw-pro>
    <mp-toolbar>
      <mp-toolbar-command-group>
        <mp-toolbar-command
          v-for="type in queryTypes"
          :key="type.id"
          :title="type.label"
          :icon="type.icon"
          :active="queryType === type.id"
          @click="onOpenDraw(type.id)"
        >
        </mp-toolbar-command>
      </mp-toolbar-command-group>
      <mp-toolbar-space />
      <mp-toolbar-command-group>
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
      <mp-setting-form layout="vertical" style="padding-top: 8px">
        <a-form-item label="缓冲半径(km)">
          <a-slider
            v-model="sliderIndex"
            :marks="marks"
            :min="0"
            :max="limitsArray.length - 1"
            :tipFormatter="() => `${limits}km`"
          />
        </a-form-item>
      </mp-setting-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Watch, Inject } from 'vue-property-decorator'
import {
  baseConfigInstance,
  dataCatalogManagerInstance,
  ActiveResultSet,
  DataStoreCatalog,
} from '@mapgis/pan-spatial-map-common'
import {
  WidgetMixin,
  ExhibitionControllerMixin,
  LayerType,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  Sublayer,
  Rectangle3D,
  Point3D,
  Objects,
  Exhibition,
  Feature,
} from '@mapgis/web-app-framework'
import * as Zondy from '@mapgis/webclient-es6-service'
import {
  lineString,
  polygon,
  point,
  booleanCrosses,
  booleanPointInPolygon,
  booleanDisjoint,
  booleanContains,
} from '@turf/turf'

const { IAttributeTableListExhibition, AttributeTableListExhibition } =
  Exhibition

const { FeatureQuery } = Feature

enum QueryType {
  Point = 'Point',
  Circle = 'Circle',
  Rectangle = 'Rectangle',
  Polygon = 'Polygon',
  LineString = 'LineString',
  PickModel = 'PickModel',
  Cube = 'Cube',
}

@Component({
  name: 'MpFeatureQuery',
})
export default class MpFeatureQuery extends Mixins(
  WidgetMixin,
  ExhibitionControllerMixin
) {
  private limitsArray: Array<number> = [0, 0.1, 0.5, 1, 5]

  private showSettingPanel = false

  private sliderIndex = 0

  private queryType = ''

  private defaultQueryTypes2d = [
    QueryType.Point,
    QueryType.Circle,
    QueryType.Rectangle,
    QueryType.Polygon,
    QueryType.LineString,
  ]

  private defaultQueryTypes3d = [
    QueryType.Point,
    QueryType.Polygon,
    QueryType.LineString,
    // QueryType.Rectangle,
    QueryType.Cube,
  ]

  private queryTypes2DrawModes = {
    Point: 'draw-point',
    Circle: 'draw-circle',
    Rectangle: 'draw-rectangle',
    Polygon: 'draw-polygon',
    LineString: 'draw-polyline',
    Cube: 'draw-cube',
  }

  private get marks() {
    return {
      ...this.limitsArray,
    }
  }

  private get limits() {
    return this.limitsArray[this.sliderIndex]
  }

  private get queryTypes2d() {
    return this.widgetInfo.config.queryType.filter((type) => {
      return this.defaultQueryTypes2d.includes(type.id)
    })
  }

  private get queryTypes3d() {
    return this.widgetInfo.config.queryType.filter((type) => {
      return this.defaultQueryTypes3d.includes(type.id)
    })
  }

  private get queryTypes() {
    return this.is2DMapMode ? this.queryTypes2d : this.queryTypes3d
  }

  get drawComponent() {
    return this.is2DMapMode ? this.$refs.draw : this.$refs.draw3d
  }

  // 二三维地图模式切换时
  @Watch('mapRender')
  mapRenderChange() {
    this.onClearDraw()
  }

  created() {
    this.widgetInfo.config.queryType.forEach((type) => {
      if (type.id === '') {
        type.id = QueryType.Rectangle
      }
    })
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.vueCesium,
      this.viewer
    )
  }

  // 微件关闭时
  onClose() {
    this.onClearDraw()
  }

  // 微件失活时
  onDeActive() {
    this.onClearDraw()
  }

  // 打开绘制，点击图标激活对应类型的绘制功能
  private onOpenDraw(type) {
    this.queryType = type
    this.drawComponent &&
      this.drawComponent.openDraw(this.queryTypes2DrawModes[type])
  }

  // 移除绘制
  private onClearDraw() {
    this.queryType = ''
    this.drawComponent && this.drawComponent.closeDraw()
  }

  // 'start'响应事件(开始绘制)
  private onDrawStart() {}

  // 'finished'响应事件(结束绘制)
  private onDrawFinished({ mode, feature, shape, center }) {
    if (shape) {
      this.queryLayers(shape)
    }

    this.queryType = ''
  }

  private queryLayers(shape: Record<string, number>) {
    if (!this.document) {
      return
    }

    let nearDis = this.limits * 1000
    const { projectionName } = baseConfigInstance.config

    if (
      projectionName.indexOf('度') !== -1 ||
      projectionName.indexOf('分') !== -1 ||
      projectionName.indexOf('秒') !== -1
    ) {
      const distanceUnits = 103133.845
      nearDis /= distanceUnits
    }

    const layers = this.document.defaultMap.layers()

    layers.forEach((layer) => {
      if (!this.isCrossWithLayer(layer, shape)) {
        return
      }

      const geometry = this.toQueryGeometry(layer, shape, nearDis)

      switch (layer.type) {
        case LayerType.IGSVector:
          this.quertFeatruesByVector(layer, geometry)
          break
        case LayerType.IGSMapImage:
          this.queryFeaturesByDoc(layer, geometry)
          break
        case LayerType.IGSScene:
          this.queryFeaturesByIGSScene(layer, geometry)
          break
        case LayerType.ArcGISMapImage:
          this.queryFeaturesByArcgis(layer, geometry)
          break
        default:
          break
      }
    })
  }

  private queryFeaturesByIGSScene(layer, geometry) {
    if (!layer.isVisible) {
      return
    }
    const { ip, port, docName } = layer._parseUrl(layer.url)

    const exhibition: IAttributeTableListExhibition = {
      id: `${layer.id}`,
      name: `${layer.title} 查询结果`,
      description: '',
      options: [],
    }
    const {
      activeScene: { sublayers },
    } = layer
    const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(layer.id)
    if (layerConfig && layerConfig.bindData) {
      sublayers.forEach((item) => {
        if (!item.visible) {
          return
        }
        exhibition.options.push({
          id: item.id,
          name: item.title || item.name,
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
          serverType: layer.type,
          gdbp: layerConfig.bindData.gdbps,
          geometry: geometry,
        })
      })

      this.addExhibition(new AttributeTableListExhibition(exhibition))
      this.openExhibitionPanel()
    }
  }

  getIpPort({ isDataStoreQuery, ip, port }) {
    const ipPortObj = isDataStoreQuery
      ? {
          ip: baseConfigInstance.config.DataStoreIp,
          port: Number(baseConfigInstance.config.DataStorePort),
        }
      : {
          ip: ip || baseConfigInstance.config.ip,
          port: Number(port || baseConfigInstance.config.port),
        }

    return ipPortObj
  }

  private queryFeaturesByDoc(layer: IGSMapImageLayer, geometry) {
    if (!layer.isVisible) {
      return
    }
    const { ip, port, docName } = layer._parseUrl(layer.url)

    const exhibition: IAttributeTableListExhibition = {
      id: `${layer.id}`,
      name: `${layer.title} 查询结果`,
      description: '',
      options: [],
    }

    const sublayers = layer.allSublayers
    for (let index = 0; index < sublayers.length; index++) {
      const sublayer = sublayers[index]
      if (!sublayer.visible && sublayer.sublayers.length > 0) {
        return
      }
      // const { isDataStoreQuery, DNSName } = await FeatureQuery.isDataStoreQuery(
      //   {
      //     ip: ip || baseConfigInstance.config.ip,
      //     port: Number(port || baseConfigInstance.config.port),
      //     gdbp: sublayer.url,
      //   }
      // )
      const isDataStoreQuery = false
      const DNSName = undefined
      const ipPortObj = this.getIpPort({
        isDataStoreQuery,
        ip: ip || baseConfigInstance.config.ip,
        port: Number(port || baseConfigInstance.config.port),
      })
      exhibition.options.push({
        id: sublayer.id,
        name: sublayer.title,
        DNSName,
        isDataStoreQuery,
        // ip: ip || baseConfigInstance.config.ip,
        // port: Number(port || baseConfigInstance.config.port),
        ...ipPortObj,
        serverType: layer.type,
        gdbp: sublayer.url,
        layerIndex: sublayer.id,
        serverName: docName,
        serverUrl: layer.url,
        geometry: geometry,
      })
    }

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }

  private quertFeatruesByVector(layer: IGSVectorLayer, geometry) {
    if (!layer.isVisible) {
      return
    }
    const { ip, port, docName } = layer._parseUrl(layer.url)

    // const { isDataStoreQuery, DNSName } = await FeatureQuery.isDataStoreQuery({
    //   ip: ip || baseConfigInstance.config.ip,
    //   port: Number(port || baseConfigInstance.config.port),
    //   gdbp: layer.gdbps,
    // })
    const isDataStoreQuery = false
    const DNSName = undefined
    const ipPortObj = this.getIpPort({
      isDataStoreQuery,
      ip: ip || baseConfigInstance.config.ip,
      port: Number(port || baseConfigInstance.config.port),
    })

    const exhibition: IAttributeTableListExhibition = {
      id: `${layer.id}`,
      name: `${layer.title} 查询结果`,
      options: [
        {
          id: layer.id,
          // ip: ip || baseConfigInstance.config.ip,
          // port: Number(port || baseConfigInstance.config.port),
          DNSName,
          isDataStoreQuery,
          ...ipPortObj,
          serverType: layer.type,
          gdbp: layer.gdbps,
          geometry: geometry,
        },
      ],
    }

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }

  private queryFeaturesByArcgis(layer, geometry) {
    if (!layer.isVisible) {
      return
    }

    const exhibition: IAttributeTableListExhibition = {
      id: `${layer.id}`,
      name: `${layer.title} 查询结果`,
      description: '',
      options: [],
    }

    const sublayers = layer.allSublayers
    sublayers.forEach((sublayer) => {
      if (!sublayer.visible) {
        return
      }
      exhibition.options.push({
        id: sublayer.id,
        name: sublayer.title,
        serverType: layer.type,
        layerIndex: sublayer.id,
        serverUrl: layer.url,
        geometry: geometry,
      })
    })

    this.addExhibition(new AttributeTableListExhibition(exhibition))
    this.openExhibitionPanel()
  }

  private toQueryGeometry(
    layer,
    shape: Record<string, number> | Array<Record<string, number>>,
    nearDis
  ) {
    let geometry

    switch (this.queryType) {
      case QueryType.Point:
        if (!this.is2DMapMode && layer.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里把经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getLayerTranform(layer)
          const offset = this.getLayerOffset(layer)
          if (transform) {
            const { x, y, z } =
              this.sceneController.globelPositionToLocalPosition(
                shape,
                transform,
                offset
              )
            geometry = new Point3D(x, y, shape.z)
          }
        } else {
          geometry = new Zondy.Common.Point2D(shape.x, shape.y, { nearDis })
        }
        break
      case QueryType.LineString:
        if (!this.is2DMapMode && layer.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里把经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getLayerTranform(layer)
          const offset = this.getLayerOffset(layer)
          if (transform) {
            const { xmin, ymin, xmax, ymax, zmin, zmax } = this.toQueryRect3D(
              shape,
              transform,
              offset
            )

            geometry = new Rectangle3D(xmin, ymin, zmin, xmax, ymax, zmax)
          }
        } else {
          const pointArray = shape.map((item: Record<string, number>) => {
            return new Zondy.Common.Point2D(item.x, item.y, { nearDis })
          })

          geometry = new Zondy.Common.PolyLine(pointArray, { nearDis })
        }
        break
      case QueryType.Polygon:
        if (!this.is2DMapMode && layer.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里把经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getLayerTranform(layer)
          const offset = this.getLayerOffset(layer)
          if (transform) {
            const { xmin, ymin, xmax, ymax, zmin, zmax } = this.toQueryRect3D(
              shape,
              transform,
              offset
            )

            geometry = new Rectangle3D(xmin, ymin, zmin, xmax, ymax, zmax)
          }
        } else {
          const pointArray = shape.map((item: Record<string, number>) => {
            return new Zondy.Common.Point2D(item.x, item.y, { nearDis })
          })

          geometry = new Zondy.Common.Polygon(pointArray)
        }
        break
      case QueryType.Cube:
      case QueryType.Circle:
      case QueryType.Rectangle:
        if (!this.is2DMapMode && layer.type === LayerType.IGSScene) {
          // 三维查询需要用到局部坐标，这里把经纬度转换成局部坐标,这里z轴不做转换
          const transform = this.getLayerTranform(layer)
          const offset = this.getLayerOffset(layer)
          if (transform) {
            const { xmin, ymin, xmax, ymax, zmin, zmax } = shape

            geometry = this.transQueryRect3D(
              { xmin, ymin, xmax, ymax, zmin, zmax },
              transform,
              offset
            )
          }
        } else {
          const { xmin, ymin, xmax, ymax } = shape
          geometry = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
        }
        break
      default:
        break
    }

    return geometry
  }

  private transQueryRect3D(
    { xmin, ymin, xmax, ymax, zmin, zmax },
    transform,
    offset
  ) {
    if (transform) {
      const minPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmin, y: ymin, z: zmin },
        transform,
        offset
      )
      const maxPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmax, y: ymax, z: zmax },
        transform,
        offset
      )
      return new Rectangle3D(
        minPosition.x,
        minPosition.y,
        zmin,
        maxPosition.x,
        maxPosition.y,
        zmax
      )
    }
    return undefined
  }

  private toQueryRect3D(shape, transform, offset) {
    const positions = shape.map((item) => {
      const { x, y, z } = this.sceneController.globelPositionToLocalPosition(
        item,
        transform,
        offset
      )
      return {
        x,
        y,
        z: item.z,
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
      zmax,
    }
  }

  private getLayerTranform(layer) {
    let tranform = null
    const {
      activeScene: { sublayers },
    } = layer
    let visibleSublayerId = ''

    if (sublayers) {
      sublayers.forEach((sublayer) => {
        if (sublayer.visible) {
          visibleSublayerId = sublayer.id
        }
      })
    }

    if (visibleSublayerId !== '') {
      const source = this.sceneController.findSource(visibleSublayerId)
      if (source) {
        tranform = source.root.transform
      }
    }
    return tranform
  }

  private getLayerOffset(layer) {
    let offset = null
    const {
      activeScene: { sublayers },
    } = layer
    let visibleSublayerId = ''

    if (sublayers) {
      sublayers.forEach((sublayer) => {
        if (sublayer.visible) {
          visibleSublayerId = sublayer.id
        }
      })
    }

    if (visibleSublayerId !== '') {
      const source = this.sceneController.findSource(visibleSublayerId)
      if (source) {
        offset = source._asset.offset
      }
    }
    return offset
  }

  private isCrossWithLayer(layer, shape): boolean {
    const { fullExtent, type } = layer
    const { ymax, ymin, xmax, xmin } = fullExtent
    let geometry
    let extentPolygon

    if (!this.is2DMapMode && type === LayerType.IGSScene) {
      const tranform = this.getLayerTranform(layer)
      if (tranform) {
        const extent = this.sceneController.localExtentToGlobelExtent(
          fullExtent,
          tranform
        )
        extentPolygon = polygon([
          [
            [Number(extent.xmin), Number(extent.ymin)],
            [Number(extent.xmax), Number(extent.ymin)],
            [Number(extent.xmax), Number(extent.ymax)],
            [Number(extent.xmin), Number(extent.ymax)],
            [Number(extent.xmin), Number(extent.ymin)],
          ],
        ])
      }
    } else {
      extentPolygon = polygon([
        [
          [Number(xmin), Number(ymin)],
          [Number(xmax), Number(ymin)],
          [Number(xmax), Number(ymax)],
          [Number(xmin), Number(ymax)],
          [Number(xmin), Number(ymin)],
        ],
      ])
    }
    switch (this.queryType) {
      case QueryType.Point:
        geometry = point([shape.x, shape.y])
        break
      case QueryType.LineString:
        geometry = lineString(shape.map((point) => [point.x, point.y]))
        break
      case QueryType.Polygon:
        geometry = polygon([shape.map((point) => [point.x, point.y])])
        break
      case QueryType.Cube:
      case QueryType.Circle:
      case QueryType.Rectangle:
        const { ymax, ymin, xmax, xmin } = shape
        geometry = polygon([
          [
            [xmin, ymin],
            [xmax, ymin],
            [xmax, ymax],
            [xmin, ymax],
            [xmin, ymin],
          ],
        ])
        break
      default:
        return false
    }
    return (
      // 交叉或者包含都会继续查询
      !booleanDisjoint(extentPolygon, geometry) ||
      booleanContains(extentPolygon, geometry) ||
      booleanContains(geometry, extentPolygon)
    )
  }
}
</script>

<style lang="less" scoped>
.mp-widget-feature-query {
  display: flex;
  flex-direction: column;
}
</style>
