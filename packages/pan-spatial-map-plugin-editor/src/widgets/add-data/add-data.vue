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
      tempServices = this.handleConfigData(this.widgetInfo.config.services2D)
    } else {
      tempServices = this.handleConfigData(this.widgetInfo.config.services3D)
    }
    if (!tempServices) {
      return
    }
    // 初始化服务分类下拉项
    tempServices.forEach(item => {
      if (!selectCategory.includes(item.category)) {
        const selectOption = { name: item.category, desc: item.category }
        selectCategory.push(item.category)
        this.addServiceCategory(selectOption)
      }
    })
    for (let i = 0; i < tempServices.length; i++) {
      const service = tempServices[i]
      this.addService(service)
    }
  }

  // 对config中的配置数据进行处理
  handleConfigData(data) {
    return data.reduce((result, item) => {
      if (item.id !== '') {
        result.push(item)
      } else {
        result.push({ ...item, ...{ id: UUID.uuid() } })
      }
      return result
    }, [])
  }
}
</script>

<style lang="less" scoped></style>
