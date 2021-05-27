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
import { WidgetMixin, Document } from '@mapgis/web-app-framework'
import {
  AddServicesMixin,
  ServiceType,
  Service,
  queryIgsServicesInfoInstance
} from '@mapgis/pan-spatial-map-store'
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'
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

  created() {
    this.initData()
  }

  // 初始化各项数据
  private initData() {
    this.widgetConfig = this.widgetInfo.config
    this.tempServiceTypes = this.serviceTypes2D
    this.tempfileTypes = this.fileTypes2D
    if (!this.is2DMapMode) {
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
    this.serviceCategories = []
    if (this.is2DMapMode) {
      tempServices = this.widgetInfo.config.services2D.reduce(
        (result, item) => {
          if (item.id !== '') {
            result.push(item)
          } else {
            result.push({ ...item, ...{ id: uuid() } })
          }
          return result
        },
        []
      )
    } else {
      tempServices = this.widgetInfo.config.services3D
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
}
</script>

<style lang="less" scoped></style>
