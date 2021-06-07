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
        <add-service-url
          :service-types="tempServiceTypes"
          @emitAddService2D="onAddService"
          @emitAddService3D="onAddService"
        />
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

  // 二维视图下的服务数据
  private services2D = []

  // 三维视图下的服务数据
  private services3D = []

  // 二维视图下的服务分类下拉数据
  private serviceCategories2D = []

  // 三维视图下的服务分类下拉数据
  private serviceCategories3D = []

  // 二维视图下的服务类型与文件类型下拉项数据的集合
  private allTypes2D: object[] = []

  // 三维视图下的服务类型与文件类型下拉项数据的集合
  private allTypes3D: object[] = []

  // 监听渲染器的变化，获取对应渲染引擎下的数据
  @Watch('mapRender')
  onMapRenderChange() {
    this.getMapRenderData()
  }

  created() {
    this.initData()
  }

  // 初始化各项数据(一开始就将二三维数据都构造好)
  private initData() {
    this.widgetConfig = this.widgetInfo.config
    this.allTypes2D = [...this.serviceTypes2D, ...this.fileTypes2D]
    this.allTypes3D = [...this.serviceTypes3D, ...this.fileTypes3D]

    // 将table数据以及服务分类下拉项数据置空
    this.services2D = []
    this.services3D = []
    this.serviceCategories2D = []
    this.serviceCategories3D = []

    const tempServices2D = this.widgetInfo.config.services2D
    const tempServices3D = this.widgetInfo.config.services3D

    this.initConfigData(tempServices2D, true)
    this.initConfigData(tempServices3D, false)

    this.getMapRenderData()
  }

  // 通过配置获取数据，并初始化服务分类下拉项
  private initConfigData(tempServices, is2DMap) {
    // 初始化服务分类下拉项
    tempServices
      .map(item => ({ name: item.name, desc: item.name }))
      .forEach(item => {
        if (is2DMap) this.serviceCategories2D.push(item)
        else this.serviceCategories3D.push(item)
      })

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

        if (is2DMap) this.services2D.push(service)
        else this.services3D.push(service)
      }
    }
  }

  // 响应URl Tab页的添加服务数据事件
  private onAddService(service, is2DMap) {
    if (is2DMap) this.services2D.push(service)
    else this.services3D.push(service)

    this.getMapRenderData()
  }

  // 获取对应渲染引擎下的数据
  private getMapRenderData() {
    if (this.is2DMapMode) {
      this.services = this.services2D
      this.serviceCategories = this.serviceCategories2D
      this.allTypes = this.allTypes2D
      this.tempServiceTypes = this.serviceTypes2D
      this.tempfileTypes = this.fileTypes2D
    } else {
      this.services = this.services3D
      this.serviceCategories = this.serviceCategories3D
      this.allTypes = this.allTypes3D
      this.tempServiceTypes = this.serviceTypes3D
      this.tempfileTypes = this.fileTypes3D
    }
  }
}
</script>

<style lang="less" scoped></style>
