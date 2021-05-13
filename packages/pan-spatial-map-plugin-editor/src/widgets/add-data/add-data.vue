<template>
  <div class="mp-widget-add-data">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="数据列表">
        <add-services-data :service-types="allTypes" />
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
import { WidgetMixin } from '@mapgis/web-app-framework'
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

  private allTypes: ServiceType[] = []

  private tempServiceTypes: ServiceType[] = []

  private tempfileTypes: ServiceType[] = []

  created() {
    this.widgetConfig = this.widgetInfo.config
    this.tempServiceTypes = this.serviceTypes2D
    this.tempfileTypes = this.fileTypes2D
    if (!this.is2DMapMode) {
      this.tempServiceTypes = this.serviceTypes3D
      this.tempfileTypes = this.fileTypes3D
    }
    this.allTypes = [...this.tempServiceTypes, ...this.tempfileTypes]

    this.oldServicesToNew()
  }

  async oldServicesToNew() {
    let tempServices: Record<string, any>[] = []
    if (this.is2DMapMode) {
      tempServices = this.widgetInfo.config.services2D
    } else {
      tempServices = this.widgetInfo.config.services3D
    }
    if (!tempServices) {
      return
    }
    this.services = []
    this.serviceCategories = []
    const themes: string[] = []
    for (let i = 0; i < tempServices.length; i += 1) {
      const childs = tempServices[i].children
      if (childs) {
        for (let c = 0; c < childs.length; c += 1) {
          const child = childs[c]
          const {
            ip,
            port,
            name,
            serverUrl,
            theme,
            type,
            layerType,
            extend,
            token
          } = child
          const serviceCategorie = { name: theme, desc: theme }
          if (!themes.includes(theme)) {
            themes.push(theme)
            this.addServiceCategory(serviceCategorie)
          }
          let tempLayerType = type
          if (type === 'Layer') {
            tempLayerType = 'layer'
          }
          if (type === 'MapGIS') {
            // 如果访问不到服务，进程到这里会断掉，后面的数据会获取不到，新版已取消MapGIS类型，分为doc和tile，不需要再去通过服务来判别类型
            const res: any = await queryIgsServicesInfoInstance.getMapInfoService(
              {
                ip,
                port,
                name
              }
            )
            if (!res) {
              // eslint-disable-next-line no-continue
              continue
            }
            tempLayerType = res.type
          }
          const service: Service = {
            id: uuid(),
            ip,
            port,
            name,
            url: serverUrl || tempLayerType,
            category: theme,
            type: tempLayerType,
            visible: false,
            layerType,
            extend,
            token
          }
          this.addService(service)
        }
      } else {
        const {
          id,
          ip,
          port,
          name,
          url,
          category,
          type,
          layerType,
          extend,
          token
        } = tempServices[i]
        const serviceCategorie = { name: category, desc: category }
        if (!themes.includes(category)) {
          themes.push(category)
          this.addServiceCategory(serviceCategorie)
        }
        const service: Service = {
          id,
          ip,
          port,
          name,
          url,
          category,
          type,
          visible: false,
          layerType,
          extend,
          token
        }
        this.addService(service)
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
