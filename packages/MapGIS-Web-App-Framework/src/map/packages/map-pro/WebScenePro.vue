<template>
  <mapgis-web-scene
    :libPath="libPath"
    :plugin-path="pluginPath"
    @load="handleLoad"
    :key-event-enable="false"
    :base-layer-picker="false"
    :animation="false"
    :fullscreen-button="false"
    style="height: 100%; width: 100%"
  >
    <div v-for="layerProps in layers" :key="layerProps.layerId">
      <mapgis-3d-igs-tile-layer
        v-if="isIgsTileLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :tilingScheme="layerProps.srs"
      />
      <mapgis-3d-igs-doc-layer
        v-if="isIgsDocLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :layers="layerProps.layers"
      />
      <mapgis-3d-igs-vector-layer
        v-if="isIgsVectorLayer(layerProps.type)"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :gdbps="layerProps.gdbps"
        :layerStyle="layerProps.layerStyle"
      />
      <mapgis-3d-ogc-wms-layer
        v-if="isWMSLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :layers="layerProps.layers"
        :srs="layerProps.srs"
      />
      <mapgis-3d-ogc-wmts-layer
        v-if="isWMTSLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :options="layerProps.options"
        :baseUrl="layerProps.url"
        :wmtsLayer="layerProps.layer"
        :wmtsStyle="layerProps.wmtsStyle"
        :tilingScheme="layerProps.srs"
        :tileMatrixSet="layerProps.tileMatrixSetID"
        :format="layerProps.format"
        :token="layerProps.token"
      />
      <mapgis-3d-arcgis-tile-layer
        v-if="isArcgisTileLayer(layerProps.type)"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :layerStyle="layerProps.layerStyle"
      />
      <mapgis-3d-arcgis-map-layer
        v-if="isArcgisMapLayer(layerProps.type)"
        :id="layerProps.layerId"
        :baseUrl="layerProps.url"
        :layers="layerProps.layers"
        :layerStyle="layerProps.layerStyle"
        :srs="layerProps.srs"
      />
      <mapgis-3d-vectortile-layer
        v-if="isVectorTileLayer(layerProps.type)"
        :vectortilejson="layerProps.mvtStyle"
        :tilingScheme="layerProps.srs"
      />
      <mapgis-3d-igs-m3d
        v-if="isIgsM3dLayer(layerProps.type)"
        :vueIndex="layerProps.id"
        :id="layerProps.id"
        :show="layerProps.show"
        :url="layerProps.url"
      />
      <mapgis-3d-igs-terrain
        v-if="isIgsTerrainLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
      />
    </div>
  </mapgis-web-scene>
</template>

<script>
import {
  Layer,
  LayerType,
  LoadStatus,
  IGSSceneSublayerRenderType
} from '../../../model/document/layer'

export default {
  name: 'MpWebScenePro',
  props: {
    document: {
      type: Object,
      required: true
    },
    libPath: {
      type: String
    },
    pluginPath: {
      type: String
    }
  },
  data() {
    return {
      layers: []
    }
  },
  watch: {
    document: {
      deep: true,
      handler() {
        this.parseDocument()
      }
    }
  },
  created() {
    this.parseDocument()
  },
  methods: {
    parseDocument() {
      if (!this.document) return

      // 先将图层置空，避免图层重复添加
      const layers = []

      this.document.baseLayerMap
        .clone()
        .getFlatLayers()
        .forEach((layer, index) => {
          if (layer.loadStatus === LoadStatus.loaded) {
            if (layer.type === LayerType.IGSScene) {
              layer.activeScene.sublayers.forEach(igsSceneSublayer => {
                const layerComponentProps = this.genLayerComponentPropsByIGSSceneSublayer(
                  igsSceneSublayer
                )
                layers.push(layerComponentProps)
              })
            } else {
              const layerComponentProps = this.genLayerComponentPropsByLayer(
                layer,
                index
              )
              layers.push(layerComponentProps)
            }
          }
        })

      this.document.defaultMap
        .clone()
        .getFlatLayers()
        .forEach((layer, index) => {
          if (layer.loadStatus === LoadStatus.loaded) {
            if (layer.type === LayerType.IGSScene) {
              layer.activeScene.sublayers.forEach(igsSceneSublayer => {
                const layerComponentProps = this.genLayerComponentPropsByIGSSceneSublayer(
                  igsSceneSublayer
                )
                layers.push(layerComponentProps)
              })
            } else {
              const layerComponentProps = this.genLayerComponentPropsByLayer(
                layer,
                this.document.baseLayerMap.clone().getFlatLayers().length +
                  index
              )
              layers.push(layerComponentProps)
            }
          }
        })

      this.layers = layers
    },

    genLayerComponentPropsByIGSSceneSublayer(igsSceneSublayer) {
      // 图层组件所需要的属性
      let layerComponentProps = {}

      // 图层显示样式
      const layerStyle = {
        show: igsSceneSublayer.isVisible
      }

      switch (igsSceneSublayer.renderType) {
        case IGSSceneSublayerRenderType.modelCache:
        case IGSSceneSublayerRenderType.elevation:
          layerComponentProps = {
            type: igsSceneSublayer.renderType,
            id: igsSceneSublayer.id,
            url: igsSceneSublayer.layer.url
          }
          break
        default:
          break
      }

      layerComponentProps = { ...layerComponentProps, ...layerStyle }

      return layerComponentProps
    },
    // genLayerComponentPropsByLayer(layer) {
    // 图层组件所需要的属性
    genLayerComponentPropsByLayer(layer, index) {
      // mapbox图层组件所需要的属性
      let layerComponentProps = {}

      let allLayerNames = []
      let showLayers = ''
      let visibleSubLayers = []
      // 图层显示样式
      const layerStyle = {
        visible: layer.isVisible,
        opacity: layer.opacity,
        zIndex: index + 1
      }

      // 图层空间参照系
      const srs = `EPSG:${layer.spatialReference.wkid}`

      const token = { key: layer.tokenKey, value: layer.tokenValue }

      let tempStr = ''
      let parms = {}
      let tileMatrixSet = {}

      switch (layer.type) {
        case LayerType.IGSTile:
          // 修改说明：当前igs图层组件控制可见性的接口还没有放到layerStyle中。
          // 修改人：马原野 2021年5月27日
          parms = layer._parseUrl(layer.url)
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            ip: parms.ip,
            port: parms.port,
            serverName: parms.tileName,
            show: layer.isVisible,
            alpha: layer.opacity
          }

          break
        case LayerType.IGSMapImage:
          showLayers = 'show:'

          visibleSubLayers = layer.allSublayers.filter(sublayer => {
            if (sublayer.visible) return true
            return false
          })

          visibleSubLayers.forEach((sublayer, index) => {
            showLayers += `${sublayer.id}`

            if (index !== visibleSubLayers.length - 1) {
              showLayers += ','
            }
          })

          // 修改说明：当前igs图层组件控制可见性的接口还没有放到layerStyle中。
          // 修改人：马原野 2021年5月27日
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layers: showLayers,
            show: layer.isVisible,
            alpha: layer.opacity,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值
          }

          break
        case LayerType.IGSVector:
          // 修改说明：mapgis-3d-igs-vector-layer要求gdbps参数必须为数组。
          // 修改人：马原野 2021年5月27日
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            gdbps: layer.gdbps.split(',')
          }
          break
        case LayerType.OGCWMTS:
          // 修改说明：修订吉威的wmts服务在三维场景下显示不了的问题。
          // 初始级别 默认为0 有的为1 比如吉威的瓦片服务
          // 修改人：马原野 2021年6月7日

          tileMatrixSet = layer.activeLayer.tileMatrixSet

          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            tileMatrixSetID: layer.activeLayer.tileMatrixSetId,
            layer: layer.activeLayer.id,
            wmtsStyle: layer.activeLayer.styleId,
            format: layer.activeLayer.imageFormat,
            options: {
              startLevel: parseInt(tileMatrixSet.tileInfo.lods[0].levelValue)
            }
          }

          break
        case LayerType.OGCWMS:
          allLayerNames = []
          layer.allSublayers.forEach(element => {
            if (element.visible && element.name)
              allLayerNames.push(element.name)
          })
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layers: allLayerNames.join(',')
          }

          break
        case LayerType.arcGISTile:
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url
          }

          break
        case LayerType.arcGISMapImage:
          showLayers = 'show:'

          visibleSubLayers = layer.allSublayers.filter(sublayer => {
            if (sublayer.visible) return true
            return false
          })

          visibleSubLayers.forEach((sublayer, index) => {
            showLayers += `${sublayer.id}`

            if (index !== visibleSubLayers.length - 1) {
              showLayers += ','
            }
          })

          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layers: showLayers
          }
          break
        case LayerType.aMapMercatorEMap:
        case LayerType.aMapMercatorSatelliteMap:
        case LayerType.aMapMercatorSatelliteAnnMap:
          tempStr = this.generateWebTileLayerUrl(layer)
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: tempStr,
            sourceId: layer.id
          }
          break
        case LayerType.vectorTile:
          // 修改说明：当前mapgis-3d-vectortile-layer图层的切片方式设置方式和其它图层还不一致。
          // 修改人：马原野 2021年6月8日
          layerComponentProps = {
            type: layer.type,
            mvtStyle: layer.currentStyle,
            tilingScheme: this.getTilingSchemeBySrs(srs)
          }
          break
        default:
          break
      }

      layerComponentProps = { ...layerComponentProps, layerStyle, srs, token }

      return layerComponentProps
    },
    handleLoad(payload) {
      const { Cesium, CesiumZondy } = payload
      // 底层传递到window上,通过window取当分屏时是否存在问题???
      const { webGlobe } = window
      this.Cesium = Cesium

      this.$root.$emit('cesium-load', { webGlobe, Cesium, CesiumZondy })
    },
    isIgsDocLayer(type) {
      return type === LayerType.IGSMapImage
    },
    isIgsTileLayer(type) {
      return type === LayerType.IGSTile
    },
    isIgsVectorLayer(type) {
      return type === LayerType.IGSVector
    },
    isWMSLayer(type) {
      return type === LayerType.OGCWMS
    },
    isWMTSLayer(type) {
      return type === LayerType.OGCWMTS
    },
    isIgsTdtLayer(type) {
      return false
    },
    isArcgisMapLayer(type) {
      return type === LayerType.arcGISMapImage
    },
    isArcgisTileLayer(type) {
      return type === LayerType.arcGISTile
    },
    isRasterLayer(type) {
      return (
        type === LayerType.aMapMercatorEMap ||
        type === LayerType.aMapMercatorSatelliteMap ||
        type === LayerType.aMapMercatorSatelliteAnnMap
      )
    },
    isVectorTileLayer(type) {
      return type === LayerType.vectorTile
    },
    isDoc3dLayer(type) {
      return false
    },
    isIgsM3dLayer(type) {
      return type === IGSSceneSublayerRenderType.modelCache
    },
    isIgsTerrainLayer(type) {
      return type === IGSSceneSublayerRenderType.elevation
    },
    getTilingSchemeBySrs(srs) {
      let tilingScheme = null

      if (this.Cesium == null) return null

      if (
        srs === 'EPSG:4326' ||
        srs === 'EPSG:4490' ||
        srs === 'EPSG:4610' ||
        srs === 'EPSG:4214'
      ) {
        tilingScheme = new this.Cesium.GeographicTilingScheme()
      } else if (srs === 'EPSG:3857') {
        tilingScheme = new this.Cesium.WebMercatorTilingScheme()
      } else {
        tilingScheme = new this.Cesium.GeographicTilingScheme()
      }
      return tilingScheme
    }
  }
}
</script>
