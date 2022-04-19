<template>
  <div class="mp-widget-basemap-manager">
    <div class="basemap-wrapper">
      <mp-basemap-item
        v-for="basemap in basemaps"
        :key="basemap.name"
        :name="basemap.name"
        :image="imageUrl(basemap.image)"
        :active="basemapNames.includes(basemap.name)"
        @select="onSelect"
        @un-select="onUnSelect"
      >
      </mp-basemap-item>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  UUID,
  LayerType,
  LoadStatus,
  FitBound,
} from '@mapgis/web-app-framework'
import { api, DataCatalogManager } from '@mapgis/pan-spatial-map-common'
import MpBasemapItem from './components/BasemapItem/BasemapItem.vue'

@Component({ name: 'MpBasemapManager', components: { MpBasemapItem } })
export default class MpBasemapManager extends Mixins(WidgetMixin) {
  private basemapNames: Array<string> = []

  private isInitMapRange = false // 是否已初始化地图范围,只有初次进入程序，才会初始化地图范围

  get imageUrl() {
    return function (image) {
      if (image.startsWith('http') || image.startsWith('https')) {
        return image
      }
      return this.baseUrl + image
    }
  }

  get basemaps() {
    const basemapList = [...this.widgetInfo.config]
    let defaultBasemap
    for (let i = 0; i < basemapList.length; i++) {
      const basemap = basemapList[i]
      if (
        basemap.description == '索引底图' ||
        basemap.children[0].description == '索引底图'
      ) {
        basemapList.splice(i, 1)
        defaultBasemap = basemap
        break
      }
    }
    if (defaultBasemap) {
      basemapList.push(defaultBasemap)
    }

    // 将配置转换成可用于添加到map中的配置
    return basemapList
      .map((basemap) => {
        const { children } = basemap
        const layers = children.map((layer) => {
          if (
            layer.serverType &&
            typeof layer.serverType === 'number' &&
            !isNaN(layer.serverType)
          ) {
            // 通过内部保存获取的配置
            return layer
          }
          // 如果要兼容老版格式，可以在这里进行升级，转换成新的数据结构（数据与添加数据配置一致）
          layer = this.updateLayer(layer)
          // 索引底图只有一个图层，图层的描述必须为 "索引底图"，不然不会显示在其他底图上层
          let description = layer.description || ''
          if (
            description !== '索引底图' &&
            basemap.description === '索引底图'
          ) {
            description = '索引底图'
          }
          const layerConfig = {
            name: layer.name,
            guid: UUID.uuid(),
            description,
            serverURL: layer.url,
            serverType: this.parseLayerType(layer.type),
          }
          if (layer.token) {
            layerConfig.tokenValue = layer.token
            layerConfig.tokenKey = layer.tokenKey ? layer.tokenKey : 'token'
          }
          return layerConfig
        })
        return {
          ...basemap,
          children: layers,
        }
      })
      .filter((basemap) => {
        const { visible = 'true' } = basemap
        return visible === 'true'
      })
  }

  /**
   * 获取默认选中的底图
   */
  get defaultSelect() {
    return this.basemaps.filter((basemap) => {
      const { select = false } = basemap
      return select
    })
  }

  mounted() {
    // 加载显示配置里已设置默认选中的底图
    if (this.defaultSelect && this.defaultSelect.length > 0) {
      for (let i = 0; i < this.defaultSelect.length; i++) {
        let isZoomTo = false
        if (this.defaultSelect[i].name === '索引底图') {
          isZoomTo = true
        }
        this.onSelect(this.defaultSelect[i].name, isZoomTo)
      }
    }
  }

  fitBounds(item) {
    const { Cesium, map, webGlobe, CesiumZondy } = this
    const isOutOfRange = FitBound.fitBoundByLayer(
      item,
      {
        Cesium,
        map,
        webGlobe,
        CesiumZondy,
      },
      this.is2DMapMode === true
    )
    if (isOutOfRange) {
      this.$message.error('初始底图范围有误，已调整为经纬度最大范围')
    }
  }

  onSelect(name, isZoomTo = false) {
    this.basemapNames.push(name)
    for (let i = 0; i < this.basemaps.length; i++) {
      const basemap = this.basemaps[i]
      if (basemap.name === name) {
        basemap.children.forEach(async (layer) => {
          const mapLayer = DataCatalogManager.generateLayerByConfig(layer)
          mapLayer.description = layer.description
          if (mapLayer.loadStatus === LoadStatus.notLoaded) {
            await mapLayer.load()
            this.document.baseLayerMap.add(mapLayer)
            if (isZoomTo) {
              this.fitBounds(mapLayer)
            }
          } else {
            this.document.baseLayerMap.add(mapLayer)
          }
        })
        if (!basemap.select) {
          basemap.select = true
        }
        break
      }
    }
  }

  onUnSelect(name) {
    this.basemapNames.splice(
      this.basemapNames.findIndex((basemapName) => basemapName === name),
      1
    )
    for (let i = 0; i < this.basemaps.length; i++) {
      const basemap = this.basemaps[i]
      if (basemap.name === name) {
        basemap.children.forEach((layer) => {
          const maplayer = this.document.baseLayerMap.findLayerById(layer.guid)
          this.document.baseLayerMap.remove(maplayer)
        })
        if (basemap.select) {
          basemap.select = false
        }
        break
      }
    }
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
        token,
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
              'Zondy.Enum.Map.TiandituType.CVA': 'cia',
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
              'Zondy.Enum.Map.ArcGISLayerType.TopoUS2D': 'NGS_Topo_US_2D',
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

  private parseLayerType(typeString: string): LayerType {
    const type = LayerType[typeString]
    if (type === undefined) {
      return LayerType.Unknown
    }

    return type
  }

  // 微件失活时
  onDeActive() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
  }

  // 微件关闭时
  onClose() {
    // 微件失活时自动保存配置到后台
    this.saveConfig()
  }

  saveConfig() {
    console.log(this.basemaps)
    api
      .saveWidgetConfig({
        name: 'basemap-manager',
        config: JSON.stringify(this.basemaps),
      })
      .then(() => {
        console.log('更新底图配置成功')
      })
      .catch(() => {
        console.log('更新底图配置失败')
      })
  }

  private getBasemapMarginStyle(index) {
    const isMarginTop = index / 2 >= 1
    if (index % 2 === 0) {
      return {
        width: 'calc(50% - 5px)',
        marginRight: '10px',
        marginTop: isMarginTop ? '10px' : 0,
      }
    }
    return {
      width: 'calc(50% - 5px)',
      marginRigh: '10px',
      marginTop: isMarginTop ? '10px' : 0,
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-basemap-manager {
  display: flex;
  justify-content: center;
  .basemap-wrapper {
    width: 220px;
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
