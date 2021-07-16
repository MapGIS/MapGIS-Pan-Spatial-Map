<template>
  <a-checkbox-group v-model="basemapNames" style="width:100%">
    <ul class="mp-widget-basemap-manager">
      <li
        v-for="(basemap, index) in basemaps"
        class="image-container"
        :key="basemap.name"
        :style="getBasemapMarginStyle(index)"
      >
        <div class="image-header">
          <img :src="imageUrl(basemap.image)" />
          <a-popover>
            <template slot="content">
              <span>
                {{ basemap.name }}
              </span>
            </template>
            <p class="img-description">
              <a-checkbox :value="basemap.name"> </a-checkbox>
              <span class="img-title">{{ basemap.name }}</span>
            </p>
          </a-popover>
        </div>
      </li>
    </ul>
  </a-checkbox-group>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  UUID,
  LayerType,
  LoadStatus
} from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  DataCatalogManager
} from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpBasemapManager' })
export default class MpBasemapManager extends Mixins(WidgetMixin) {
  private basemaps: Array<Record<string, unknown>> = []

  private basemapNames: Array<string> = []

  private defaultBasemap = null

  get imageUrl() {
    return function(image) {
      if (image.startsWith('http') || image.startsWith('https')) {
        return image
      }
      return this.baseUrl + image
    }
  }

  @Watch('basemapNames', { immediate: true })
  async basemapNamesChange(newValue: Array<string>, oldValue: Array<string>) {
    if (oldValue && oldValue.length >= 0 && newValue && newValue.length >= 0) {
      // 取消勾选的时候删除图层
      for (let index = 0; index < oldValue.length; index++) {
        const name = oldValue[index]
        if (!newValue.includes(name)) {
          const info: any = this.basemaps.find(item => item.name === name)
          for (let i = 0; i < info.children.length; i++) {
            const layer = info.children[i]
            const maplayer = this.document.baseLayerMap.findLayerById(
              layer.guid
            )
            this.document.baseLayerMap.remove(maplayer)
          }
        }
      }

      // 勾选的时候添加图层，这里使用for是为了 异步await
      for (let index = 0; index < newValue.length; index++) {
        const name = newValue[index]
        if (!oldValue.includes(name)) {
          const info: any = this.basemaps.find(item => item.name === name)
          for (let i = 0; i < info.children.length; i++) {
            const layer = info.children[i]
            const mapLayer = DataCatalogManager.generateLayerByConfig(layer)
            if (mapLayer.loadStatus === LoadStatus.notLoaded) {
              await mapLayer.load()
              this.document.baseLayerMap.add(mapLayer)
            } else {
              this.document.baseLayerMap.add(mapLayer)
            }
          }
        }
      }
    }
  }

  mounted() {
    let config = [...this.widgetInfo.config]

    // 获取默认底图
    this.defaultBasemap = this.getDefaultBasemap()

    if (this.defaultBasemap) {
      config.push(this.defaultBasemap)
    }

    // 将配置转换成可用于添加到map中的配置
    config = config.map(basemap => {
      const { children } = basemap
      const layers = children.map(layer => {
        // 如果要兼容老版格式，可以在这里进行升级，转换成新的数据结构（数据与添加数据配置一致）
        layer = this.updateLayer(layer)
        const layerConfig = {
          name: layer.name,
          guid: UUID.uuid(),
          serverURL: layer.url,
          serverType: this.parseIssueType(layer.type)
        }
        if (layer.token) {
          layerConfig.tokenValue = layer.token
          layerConfig.tokenKey = layer.tokenKey ? layer.tokenKey : 'token'
        }

        return layerConfig
      })
      return {
        ...basemap,
        children: layers
      }
    })

    this.basemaps = config.filter(basemap => {
      const { visible = 'true' } = basemap
      return visible === 'true'
    })

    // 默认底图加载
    if (this.defaultBasemap) {
      this.basemapNames = [this.defaultBasemap.name]
    } else {
      this.basemapNames = []
    }
  }

  private getDefaultBasemap() {
    const {
      name,
      image,
      serverType,
      ip,
      port,
      defaultMapType,
      defaultMapName
    } = baseConfigInstance.config

    const defaultBasemap = {
      name,
      image,
      children: []
    }

    const defaultBasemapLayer = {}

    // 根据服务类型初始化图层信息
    switch (serverType) {
      case 'IGServer':
        defaultBasemapLayer.name = defaultMapName
        switch (defaultMapType) {
          case 'doc':
            defaultBasemapLayer.type = 'IGSMapImage'
            defaultBasemapLayer.url = `http://${ip}:${port}/igs/rest/mrms/docs/${defaultMapName}`
            break
          case 'tile':
            defaultBasemapLayer.type = 'IGSTile'
            defaultBasemapLayer.url = `http://${ip}:${port}/igs/rest/mrms/tile/${defaultMapName}`
            break
          default:
            break
        }
        defaultBasemap.children.push(defaultBasemapLayer)
        break
      case 'OGCServer':
        // 默认底图需要实现对OGCServer的支持
        // OGCServerTypeName: WMS、WMTS
        // OGCServerUrl
        // TileMatrixSetLink
        break
      default:
        break
    }

    if (defaultBasemap.children.length > 0) {
      return defaultBasemap
    }

    return null
  }

  private updateLayer(layer) {
    if (!layer.serverType) {
      return layer
    } else {
      const {
        serverType,
        serverUrl,
        layerType,
        serverip,
        serverport,
        layerName,
        projection,
        tokenKey,
        token
      } = layer
      const newLayer = { name: layerName, url: serverUrl }
      // 类型映射表
      let map: Record<string, string>
      switch (serverType) {
        case 'tdt':
          newLayer.type = 'OGCWMTS'
          if (!serverUrl) {
            map = {
              // 天地图影像底图
              'Zondy.Enum.Map.TiandituType.IMG': 'img',
              // 天地图影像注记
              'Zondy.Enum.Map.TiandituType.CIA': 'cia',
              // 天地图矢量底图
              'Zondy.Enum.Map.TiandituType.VEC': 'vec',
              // 天地图矢量注记
              'Zondy.Enum.Map.TiandituType.CVA': 'cia'
            }
            const type = map[layerType] || layerType
            const tilematrixSet = projection.includes('EPSG:4326') ? 'c' : 'w'
            newLayer.url = `http://t${Math.round(
              Math.random() * 7
            )}.tianditu.gov.cn/${type}_${tilematrixSet}/wmts`
          }
          newLayer.tokenKey = 'tk'
          newLayer.token = '2ddaabf906d4b5418aed0078e1657029'
          break
        case 'arcgis':
          // 目前只支持ArcGISTile类型
          newLayer.type = 'ArcGISTile'
          if (!serverUrl) {
            map = {
              // ArcGIS影像图
              'Zondy.Enum.Map.ArcGISLayerType.ImageryWorld2D':
                'ESRI_Imagery_World_2D',
              // ArcGIS街道图
              'Zondy.Enum.Map.ArcGISLayerType.StreetMapWorld2D':
                'ESRI_StreetMap_World_2D',
              // ArcGIS地形图
              'Zondy.Enum.Map.ArcGISLayerType.TopoUS2D': 'NGS_Topo_US_2D'
            }
            const type = map[layerType] || layerType
            newLayer.url = `http://services.arcgisonline.com/ArcGIS/rest/services/${type}/MapServer`
          }
          break
        case 'WMS':
          newLayer.type = 'OGCWMS'
          break
        case 'WMTS':
          newLayer.type = 'OGCWMTS'
          break
        case 'tile':
          newLayer.type = 'IGSTile'
          if (!serverUrl) {
            newLayer.url = `http://${serverip}:${serverport}/igs/rest/mrms/tile/${layerName}`
          }
          break
        case 'doc':
          newLayer.type = 'IGSMapImage'
          if (!serverUrl) {
            newLayer.url = `http://${serverip}:${serverport}/igs/rest/mrms/docs/${layerName}`
          }
          break
        case 'layer':
          newLayer.type = 'IGSVector'
          if (!serverUrl) {
            newLayer.url = `http://${serverip}:${serverport}/igs/rest/mrms/layers?gdbps=${layerName}`
          }
          break
        default:
          break
      }

      if (token) {
        newLayer.tokenKey = tokenKey
        newLayer.token = token
      }

      return newLayer
    }
  }

  private parseIssueType(typeString: string): LayerType {
    const type = LayerType[typeString]
    if (type === undefined) {
      return LayerType.Unknown
    }

    return type
  }

  private getBasemapMarginStyle(index) {
    const isMarginTop = index / 2 >= 1
    if (index % 2 === 0) {
      return {
        width: 'calc(50% - 5px)',
        marginRight: '10px',
        marginTop: isMarginTop ? '10px' : 0
      }
    }
    return {
      width: 'calc(50% - 5px)',
      marginRigh: '10px',
      marginTop: isMarginTop ? '10px' : 0
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-basemap-manager {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  &,
  li {
    padding: 0;
    margin: 0;
    list-style: none;
    .image-header {
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 66.5%; /*相对于这个盒子的宽度设置的，为保证图片比例，其值=width * 80%*/
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .img-description {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 6px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        margin-bottom: 0px;
        background-color: rgba(0, 0, 0, 0.3);
        color: white;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .img-title {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
