<template>
  <div class="mp-widget-add-data">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="数据列表">
        <add-services-data
          :service-types="allTypes"
          :widget-config="widgetConfig"
        />
      </a-tab-pane>
      <a-tab-pane key="2" tab="URL">
        <add-service-url :service-types="tempServiceTypes" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="文件">
        <add-service-file
          :service-types="tempfileTypes"
          :widget-config="widgetConfig"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, Document, UUID } from '@mapgis/web-app-framework'
import {
  AddServicesMixin,
  ServiceType,
  Service,
  queryIgsServicesInfoInstance
} from '@mapgis/pan-spatial-map-store'
import AddServicesData from './components/AddServicesData.vue'
import AddServiceUrl from './components/AddServiceUrl.vue'
import AddServiceFile from './components/AddServiceFile.vue'

@Component({
  name: 'MpAddData',
  components: {
    AddServicesData,
    AddServiceUrl,
    AddServiceFile
  }
})
export default class MpAddData extends Mixins(WidgetMixin, AddServicesMixin) {
  // 微件配置信息
  private widgetConfig

  // 服务类型与文件类型下拉项数据的集合
  private allTypes: object[] = []

  // 服务类型下拉项数据
  private tempServiceTypes: object[] = []

  // 文件类型下拉项数据
  private tempfileTypes: object[] = []

  // 监听渲染器的变化，获取对应渲染引擎下的数据
  @Watch('mapRender')
  onMapRenderChange() {
    this.initData()
  }

  created() {
    this.initData()
  }

  // 初始化各项数据
  private initData() {
    this.widgetConfig = this.widgetInfo.config
    if (this.is2DMapMode) {
      this.tempServiceTypes = this.serviceTypes2D
      this.tempfileTypes = this.fileTypes2D
    } else {
      this.tempServiceTypes = this.serviceTypes3D
      this.tempfileTypes = this.fileTypes3D
    }
    this.allTypes = [...this.tempServiceTypes, ...this.tempfileTypes]

    this.getConfigData()
  }

  // 通过配置获取数据，并初始化服务分类下拉项
  private getConfigData() {
    const doc: Document = this.document
    const selectCategory = []
    let tempServices: Record<string, any>[] = []
    // 将服务数据清空
    this.services = []
    // 将服务分类下拉项数据清空
    this.serviceCategories = []

    if (this.is2DMapMode) {
      tempServices = this.widgetInfo.config.services2D
    } else {
      tempServices = this.widgetInfo.config.services3D
    }

    if (!tempServices) {
      return
    }

    // 初始化服务分类下拉项
    tempServices
      .map(item => ({ name: item.name, desc: item.name }))
      .forEach(item => this.addServiceCategory(item))

    for (const item of tempServices) {
      const itemConfig = item.children
      for (const config of itemConfig) {
        let type = config.type

        if (type === 'Layer') {
          type = 'layer'
        } else if (type === 'MapGIS') {
          // const data = await queryIgsServicesInfoInstance.getMapInfoService(
          //   config.ip,
          //   config.port,
          //   config.name
          // )
          // if (!data) {
          //   console.log('该类型有问题')
          // } else {
          //   type = data.type
          // }
        }

        const service = {
          id: UUID.uuid(),
          ip: config.ip,
          port: config.port,
          name: config.name,
          category: config.theme,
          visible: false,
          layerType: config.layerType,
          extent: config.extent,
          token: config.token || '',
          url: config.serverUrl,
          type: type,
          gdbp: config.gdbp || ''
        }

        this.addService(service)
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
