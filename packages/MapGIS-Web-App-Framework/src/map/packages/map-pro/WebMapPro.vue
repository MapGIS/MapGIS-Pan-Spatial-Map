<template>
  <mapgis-web-map
    ref="mapgisWebMap"
    :center="center"
    :zoom="zoom"
    :access-token="accessToken"
    :map-style="mergedMapStyle"
    :crs="crs"
    @load="handleLoad"
    style="height: 100%; width: 100%"
  >
    <div v-for="layerProps in layers" :key="layerProps.layerId">
      <mapgis-igs-tile-layer
        v-if="isIgsTileLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.url"
        :serverName="layerProps.serverName"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-igs-doc-layer
        v-if="isIgsDocLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.url"
        :layers="layerProps.layers"
        :serverName="layerProps.serverName"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-igs-vector-layer
        v-if="isIgsVectorLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.url"
        :gdbps="layerProps.gdbps"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-ogc-wmts-layer
        v-if="isWMTSLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :wmtsLayer="layerProps.wmtsLayer"
        :tileMatrixSet="layerProps.tileMatrixSet"
        :version="layerProps.version"
        :wmtsStyle="layerProps.wmtsStyle"
        :format="layerProps.format"
        :token="layerProps.token"
        :zoomOffset="layerProps.zoomOffset"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-ogc-wms-layer
        v-if="isWMSLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :layers="layerProps.layers"
        :version="layerProps.version"
        :token="layerProps.token"
        :reversebbox="layerProps.reversebbox"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-arcgis-map-layer
        v-if="isArcgisMapLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :layers="layerProps.layers"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-arcgis-tile-layer
        v-if="isArcgisTileLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-rastertile-layer
        v-if="isRasterLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-igs-tdt-layer
        v-if="isIgsTdtLayer(layerProps.type)"
        :layer="layerProps"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseURL="layerProps.baseURL"
        :token="layerProps.token"
        :crs="crs"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
      <mapgis-mvt-style-layer
        v-if="isVectorTileLayer(layerProps.type)"
        :mvtStyle="layerProps.mvtStyle"
        mode="merge"
        :before="getBeforeLayerId(layerProps.beforeId)"
      />
    </div>
    <mapgis-scale :position="'left-bottom'" />
  </mapgis-web-map>
</template>

<script>
import '@mapgis/mapbox-gl/dist/mapbox-gl.css'
import { Layer, LayerType, LoadStatus } from '../../../model/document/layer'
import { ObjectUtil } from '../../../utils'
import DefaultMapStyle from '../../styles/map-style.json'

export default {
  name: 'MpWebMapPro',
  props: {
    mapStyle: {
      type: Object,
      required: false
    },
    document: {
      type: Object,
      required: true
    },
    center: {
      type: [Object, Array],
      default() {
        return { lng: 112.247175, lat: 30.152892 }
      }
    },
    zoom: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      // 使用mapbox样式需要的秘钥
      accessToken:
        'pk.eyJ1IjoicGFybmRlZWRsaXQiLCJhIjoiY2o1MjBtYTRuMDhpaTMzbXhpdjd3YzhjdCJ9.sCoubaHF9-nhGTA-sgz0sA',
      crs: 'EPSG:4326',
      layers: [],
      map: null,
      mapboxLevelResolutions: [] // 记录mapbox中各个层级对应的分辨率
    }
  },
  computed: {
    mergedMapStyle() {
      return this.mapStyle
        ? ObjectUtil.objectMerge(DefaultMapStyle, this.mapStyle)
        : DefaultMapStyle
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
    getBeforeLayerId(beforeId) {
      // TODO 此段屏蔽代码请勿删除，防止以后做拖动排序的时候，可以作为参考
      // if (beforeId === 'defaultMap') {
      //   return undefined
      // } else if (beforeId) {
      //   if (this.map.getLayer(beforeId)) {
      //     return beforeId
      //   } else {
      //     return undefined
      //   }
      // } else if (index + 1 >= this.layers.length) {
      //   return undefined
      // } else if (this.map.getLayer(this.layers[index + 1].layerId)) {
      //   return this.layers[index + 1].layerId
      // } else {
      //   return undefined
      // }

      /**
       * 修改说明：这里对构造layers的时候，对底图进行了标识，传入beforeId字段
       *          当beforeId==='defaultMap'表示暂未添加图层树图层。当添加了
       *          图层树图层时，beforeId等于defaultMap.layers()的第一个图层ID
       * @修改人 龚瑞强
       * @时间 2021/7/2
       */
      if (beforeId && this.map.getLayer(beforeId)) {
        return beforeId
      } else {
        return undefined
      }
    },
    handleLoad(payload) {
      this.map = payload.map
      const listeners = this.$listeners
      const webMapgisListeners = this.$refs.mapgisWebMap.$listeners
      // 将mapgis-web-map的事件抛出
      Object.entries(webMapgisListeners).forEach(
        ([k, v]) => k && this.$emit(k, payload)
      )
      if (listeners && 'map-load' in listeners) {
        this.$emit('map-load', payload)
      } else {
        this.$root.$emit('mapbox-load', payload)
      }
      this.getMapboxLevelResolution(payload.mapr)
    },
    getMapboxLevelResolution(map) {},
    genMapboxLayerComponentPropsByLayer(layer, beforeId) {
      // mapbox图层组件所需要的属性
      let mapboxLayerComponentProps = {}

      let allLayerNames = []
      let showLayers = ''
      let visibleSubLayers = []
      let zoomOffset = 0
      // 图层显示样式
      const layerStyle = {
        layout: { visibility: layer.isVisible ? 'visible' : 'none' },
        paint: { 'raster-opacity': layer.opacity }
      }

      // 图层组件的共有属性
      const commonProps = {
        token: { key: layer.tokenKey, value: layer.tokenValue }
      }

      let tempStr = ''

      switch (layer.type) {
        case LayerType.IGSTile:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
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

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            layers: showLayers,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
          }

          break
        case LayerType.IGSVector:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            gdbps: layer.gdbps
          }
          break
        case LayerType.OGCWMTS:
          // 修改说明：修订arcGIS wmts服务在mapbox下显示不了的问题。
          // 原因：服务初始级别与webClient要求的初始级别不一致。对于ArcGIS 全球经纬度裁图方式,须将zoomOffset设为-1,才能显示。
          // zoomOffset计算方式不明确，已录入缺陷列表。
          // 修改人：马原野 2021年7月22日

          if (
            layer.spatialReference.isWGS84() &&
            layer.url.search('arcgis') > -1
          ) {
            zoomOffset = -1
          }
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            sourceId: layer.id,
            baseUrl: layer.url,
            wmtsLayer: layer.activeLayer.id,
            tileMatrixSet: layer.activeLayer.tileMatrixSetId,
            version: layer.version,
            wmtsStyle: layer.activeLayer.styleId,
            format: layer.activeLayer.imageFormat,
            zoomOffset: zoomOffset
          }

          break
        case LayerType.OGCWMS:
          allLayerNames = []
          layer.allSublayers.forEach(element => {
            if (element.visible && element.name)
              allLayerNames.push(element.name)
          })

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            sourceId: layer.id,
            baseUrl: layer.url,
            layers: allLayerNames.join(','),
            version: layer.version,
            reversebbox: false
          }

          break
        case LayerType.ArcGISTile:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            baseUrl: layer.url,
            sourceId: layer.id
          }

          break
        case LayerType.ArcGISMapImage:
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

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            baseUrl: layer.url,
            layers: showLayers,
            sourceId: layer.id
          }
          break
        case LayerType.AMapMercatorEMap:
        case LayerType.AMapMercatorSatelliteMap:
        case LayerType.AMapMercatorSatelliteAnnMap:
          tempStr = this.generateWebTileLayerUrl(layer)
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: tempStr,
            sourceId: layer.id
          }
          break
        case LayerType.VectorTile:
          mapboxLayerComponentProps = {
            type: layer.type,
            mvtStyle: layer.currentStyle
          }
          break
        default:
          break
      }

      // 共有属性
      mapboxLayerComponentProps = {
        ...mapboxLayerComponentProps,
        ...commonProps,
        beforeId
      }

      if (layer.type !== LayerType.VectorTile)
        mapboxLayerComponentProps.layer = layerStyle

      return mapboxLayerComponentProps
    },
    parseDocument() {
      if (!this.document) return

      // 先将图层置空，避免图层重复添加
      const layers = []

      this.document.baseLayerMap
        .clone()
        .getFlatLayers()
        .forEach(layer => {
          if (layer.loadStatus === LoadStatus.loaded) {
            let beforeId = 'defaultMap'
            if (this.document.defaultMap.layers().length > 0) {
              beforeId = this.document.defaultMap.layers()[0].id
            }
            const mapboxLayerComponentProps = this.genMapboxLayerComponentPropsByLayer(
              layer,
              beforeId
            )
            layers.push(mapboxLayerComponentProps)
          }
        })

      this.document.defaultMap
        .clone()
        .getFlatLayers()
        .forEach(layer => {
          if (layer.loadStatus === LoadStatus.loaded) {
            const mapboxLayerComponentProps = this.genMapboxLayerComponentPropsByLayer(
              layer
            )
            layers.push(mapboxLayerComponentProps)
          }
        })

      this.layers = layers
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
      return type === LayerType.ArcGISMapImage
    },
    isArcgisTileLayer(type) {
      return type === LayerType.ArcGISTile
    },
    isRasterLayer(type) {
      return (
        type === LayerType.AMapMercatorEMap ||
        type === LayerType.AMapMercatorSatelliteMap ||
        type === LayerType.AMapMercatorSatelliteAnnMap
      )
    },
    isVectorTileLayer(type) {
      return type === LayerType.VectorTile
    },
    generateWebTileLayerUrl(layer) {
      let url = ''
      let beforeSubDomain = ''
      let afterSubDomain = ''

      const subDomainTemplate = '{subDomain}'
      const indexSubDomain = layer.urlTemplate.search(subDomainTemplate)
      beforeSubDomain = layer.urlTemplate.substring(0, indexSubDomain)
      afterSubDomain = layer.urlTemplate.substring(
        indexSubDomain + subDomainTemplate.length
      )

      // 修改说明：该种方式无法真正实现子域名的随机轮询。该需求需要webClient层支持,在获取url时动态生成url。
      // 修改人：马原野 2021年04月28日
      url =
        beforeSubDomain +
        this.generateRandomSubDomain(layer.subDomains) +
        afterSubDomain

      return url
    },
    generateRandomSubDomain(subDomains) {
      return subDomains[Math.floor(Math.random() * subDomains.length)]
    }
  }
}
</script>

<style>
.mapboxgl-ctrl.mapboxgl-ctrl-scale {
  position: absolute;
  left: 1em;
  bottom: 2em;
  height: 10px;
  background-color: transparent;
  line-height: 10%;
  text-align: center;
}
</style>
