<template>
  <div class="add-service-url">
    <service-category-select v-model="serviceCategory" />
    <service-type-select v-model="serviceInfo" :service-types="serviceTypes" />
    <div class="btn">
      <a-button type="primary" @click="onAdd">添加</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  AddServicesMixin,
  ServiceType,
  ServiceCategory,
  Service
} from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'
import ServiceCategorySelect from './ServiceCategorySelect.vue'
import ServiceTypeSelect from './ServiceTypeSelect.vue'

@Component({
  components: { ServiceCategorySelect, ServiceTypeSelect }
})
export default class AddServiceUrl extends Mixins(AddServicesMixin, AppMixin) {
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  private serviceCategory: ServiceCategory | null = null

  private serviceInfo: Record<string, unknown> = {
    type: 'doc'
  }

  @Watch('serviceCategory')
  onChangeServiceCategory(newVal) {
    console.log(newVal)
  }

  @Watch('serviceInfo', { deep: true })
  onChangeServiceInfo(newVal) {
    console.log(newVal)
  }

  created() {
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  onAdd() {
    const { serviceCategory } = this
    if (!serviceCategory) {
      this.$message.warning('请选择服务分类')
      return
    }
    const {
      type,
      serverName,
      ip,
      port,
      name,
      url,
      gdbp,
      token,
      extend
    } = this.serviceInfo
    const category = this.serviceCategory
    console.log(category)

    let service: Service

    switch (type) {
      case 'doc':
        service = {
          id: uuid(),
          name: serverName as string,
          category,
          type,
          url: `http://${ip}:${port}/igs/rest/mrcs/docs/${serverName}/0?include={includeDetails:true,includeSubs:true}&f=json`,
          visible: true,
          ip,
          port
        }
        this.addService(service)
        break
      case 'tile':
        service = {
          id: uuid(),
          name: serverName as string,
          category,
          url: `http://${ip}:${port}/igs/rest/mrcs/tiles/${serverName}?f=json&v=2.0`,
          type,
          visible: true,
          ip,
          port
        }
        this.addService(service)
        break
      case 'layer':
        service = {
          id: uuid(),
          gdbp: gdbp as string,
          url: gdbp as string,
          category,
          type,
          visible: true,
          name: name as string,
          ip,
          port
        }
        this.addService(service)
        break
      case 'WMS':
      case 'WMTS':
        service = {
          id: uuid(),
          name: name as string,
          category,
          type,
          url: url as string,
          visible: true
        }
        this.addService(service)
        break
      case 'tianDiTu':
        const tempayerType: string = this.serviceInfo.layerType as string
        service = {
          id: uuid(),
          name: name as string,
          category,
          type,
          url: `http://t${Math.round(
            Math.random() * 7
          )}.tianditu.gov.cn/${tempayerType}_c/wmts`,
          token,
          visible: true
        }
        this.addService(service)
        break
      case 'arcgis':
        let layerType
        if ((url as string).includes('MapServer/tile/{z}/{y}/{x}')) {
          layerType = (url as string)
            .split('/MapServer/tile/{z}/{y}/{x}')[0]
            .split('services/')[1]
        }
        service = {
          id: uuid(),
          name: name as string,
          category,
          type,
          extend,
          layerType,
          url: url as string,
          visible: true
        }
        this.addService(service)
        break
      case 'baidu':
      case 'gaode':
      case 'google':
      case 'googleExt':
        const tempLayerType = this.serviceInfo.layerType
        service = {
          id: uuid(),
          name: name as string,
          category,
          type,
          layerType: tempLayerType,
          url: tempLayerType as string,
          visible: true
        }
        this.addService(service)
        break
      default:
        this.$message.wraning('未支持的服务类型')
        break
    }
  }
}
</script>

<style lang="scss" scoped>
.add-service-url {
  width: 100%;
}
.btn {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
