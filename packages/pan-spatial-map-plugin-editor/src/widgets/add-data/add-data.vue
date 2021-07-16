<template>
  <div class="mp-widget-add-data">
    <ul class="top-tab-nav">
      <li
        v-for="{ key, label } in tabs"
        :key="key"
        :class="[key === tab ? 'active-color' : '']"
        @click="tab = key"
      >
        {{ label }}
      </li>
    </ul>
    <template v-if="loaded">
      <add-data-list
        ref="refAddDataList"
        v-show="tab === 'list'"
        :data-list="dataList"
        :dataTypes="dataTypes"
        :categories="categories"
        @save="onSaveData"
        @add-layer="onAddLayer"
        @remove-layer="onRemoveLayer"
        @add-category="onAddCategory"
      />
      <add-data-url
        v-show="tab === 'url'"
        :url-data-types="urlDataTypes"
        :categories="categories"
        @added="onAddData"
      ></add-data-url>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import {
  WidgetMixin,
  UUID,
  ObjectUtil,
  LayerType,
  LoadStatus
} from '@mapgis/web-app-framework'
import {
  api,
  DataCatalogManager,
  eventBus
} from '@mapgis/pan-spatial-map-store'

import AddDataList from './components/AddDataList.vue'
import AddDataUrl from './components/AddDataUrl.vue'

@Component({
  name: 'MpAddData',
  components: {
    AddDataList,
    AddDataUrl
  }
})
export default class MpAddData extends Mixins(WidgetMixin) {
  private tab = 'list'

  private tabs = [
    { key: 'list', label: '数据列表' },
    { key: 'url', label: 'URL' }
  ]

  private config

  private loaded = false

  private commonDataTypes = [
    {
      text: 'OGC WMS 服务',
      value: 'OGCWMS',
      example: 'http://<server>:<port>/igs/rest/ogc/doc/beijing/WMSServer'
    },
    {
      text: 'OGC WMTS 服务',
      value: 'OGCWMTS',
      example: 'http://<server>:<port>/igs/rest/ogc/beijing/WMTSServer'
    },
    {
      text: 'ArcGIS IMAGE REST Service',
      value: 'ArcGISMapImage',
      example:
        'http://<server>:<port>/arcgis/rest/services/ServiceRequest/MapServer'
    },
    {
      text: 'ArcGIS TILE REST Service',
      value: 'ArcGISTile',
      example:
        'http://<server>:<port>/arcgis/rest/services/ServiceRequest/MapServer'
    },
    {
      text: 'MapGIS 瓦片 REST Service',
      value: 'IGSTile',
      example: 'http://<server>:<port>/igs/rest/mrms/tile/{tileName}'
    },
    {
      text: 'MapGIS 文档 REST Service',
      value: 'IGSMapImage',
      example: 'http://<server>:<port>/igs/rest/mrms/docs/{docName}'
    },
    {
      text: 'MapGIS 图层 REST Service',
      value: 'IGSVector',
      example: 'http://<server>:<port>/igs/rest/mrms/layers?gdbps={gdbps}'
    }
  ]

  get urlDataTypes2D() {
    return [...this.commonDataTypes]
  }

  get fileDataTypes2D() {
    return [
      { text: 'GeoJSON 数据', value: 'GEOJSON' },
      { text: 'GeoTIFF 数据', value: 'TIF' },
      { text: 'Esri Shapefile', value: 'SHP' },
      { text: 'MapGIS 6X 工作区文件', value: '6X' }
    ]
  }

  get dataTypes2D() {
    return [...this.commonDataTypes]
  }

  get urlDataTypes3D() {
    return [...this.commonDataTypes, ...this.cesiumDataTypes3D]
  }

  get fileDataTypes3D() {
    return [
      { text: 'GeoJSON 数据', value: 'GEOJSON' },
      { text: 'KML', value: 'KML' },
      { text: 'KMZ', value: 'KMZ' },
      { text: 'CZML', value: 'CZML' }
    ]
  }

  get cesiumDataTypes3D() {
    return [
      {
        text: 'MapGIS 3D REST Service',
        value: 'IGSScene',
        example: 'http://<server>:<port>/igs/rest/g3d/{modelName}'
      }
    ]
  }

  get dataTypes3D() {
    return [...this.commonDataTypes, ...this.cesiumDataTypes3D]
  }

  get dataTypes() {
    return this.is2DMapMode ? this.dataTypes2D : this.dataTypes3D
  }

  get urlDataTypes() {
    return this.is2DMapMode ? this.urlDataTypes2D : this.urlDataTypes3D
  }

  get dataList() {
    return this.config && this.config.data
  }

  get categories() {
    return this.dataList.map(item => {
      return { name: item.name, description: item.description }
    })
  }

  mounted() {
    if (this.widgetInfo.config.data) {
      this.widgetInfo.config.data.forEach(category => {
        category.children.forEach(item => {
          item.id = UUID.uuid()
          item.visible = false
        })
      })
    } else {
      this.$set(this.widgetInfo.config, 'data', [])
    }

    this.config = this.widgetInfo.config
    this.loaded = true

    eventBus.$on('add-data', this.onAddData)
  }

  onAddCategory({ name, description }) {
    this.dataList.push({ name, description, children: [] })
  }

  onAddData({ name, description, data }) {
    let categoryDataList = this.dataList.find(
      category => category.name === name
    )

    if (!categoryDataList) {
      categoryDataList = { name, description, children: [] }
      this.dataList.push(categoryDataList)
    }

    // 检查是否存在相同URL的数据
    if (categoryDataList.children.some(val => val.url === data.url)) {
      this.$message.warn('当前分类中已存在相同地址的数据')
      return
    }
    data.id = UUID.uuid()
    data.visible = false
    categoryDataList.children.unshift({
      ...data
    })
    // 跳转到数据列表
    this.tab = 'list'
    this.$refs.refAddDataList.selectData(name, data)
  }

  onSaveData() {
    const this_ = this

    const savedConfig = ObjectUtil.deepClone(this.config)
    savedConfig.data.forEach(category => {
      category.children.forEach(item => {
        this.$delete(item, 'id')
        this.$delete(item, 'visible')
      })
    })

    api
      .saveWidgetConfig({
        name: 'add-data',
        config: JSON.stringify(savedConfig)
      })
      .then(() => {
        this_.$message.success('保存成功')
      })
      .catch(() => {
        this_.$message.error('保存失败')
      })
  }

  async onAddLayer(data) {
    const layerConfig = {
      name: data.name,
      guid: data.id,
      serverURL: data.url,
      serverType: this.parseIssueType(data.type)
    }
    if (data.token) {
      layerConfig.tokenKey = data.tokenKey ? data.tokenKey : 'token'
      layerConfig.tokenValue = data.token
    }

    const layer = DataCatalogManager.generateLayerByConfig(layerConfig)
    if (layer) {
      if (layer.loadStatus === LoadStatus.notLoaded) {
        await layer.load()
      }
      this.document.defaultMap.add(layer)
    }
  }

  onRemoveLayer(data) {
    const layer = this.document.defaultMap.findLayerById(data.id)

    this.document.defaultMap.remove(layer)
  }

  private parseIssueType(typeString: string): LayerType {
    const type = LayerType[typeString]
    if (type === undefined) {
      return LayerType.Unknown
    }

    return type
  }
}
</script>

<style lang="less" scoped>
.mp-widget-add-data {
  flex: 1 1 0%;
  min-height: 76px;
  display: flex;
  flex-direction: column;
  .top-tab-nav {
    border-bottom: 1px @border-color solid;
    flex-shrink: 0;
    list-style: none;
    display: flex;
    height: 28px;
    margin: 0;
    padding: 0;
    margin-bottom: 8px;
    li {
      height: 100%;
      padding: 0 5px;
      margin-right: 21px;
      border-bottom: 2px transparent solid;
      &:hover {
        color: @primary-color;
        cursor: pointer;
      }
    }
    .active-color {
      border-bottom-color: @primary-color;
    }
  }
}
</style>
