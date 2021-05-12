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
import { AppMixin, LayerType } from '@mapgis/web-app-framework'
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
          guid: uuid(),
          serverName,
          name: serverName as string,
          category,
          serverType: LayerType.IGSMapImage,
          url: `http://${ip}:${port}/igs/rest/mrms/docs/${serverName}`,
          // url: `http://${ip}:${port}/igs/rest/mrcs/docs/${serverName}/0?include={includeDetails:true,includeSubs:true}&f=json`,
          visible: true,
          ip,
          port
        }
        this.addService(service)
        break
      case 'tile':
        service = {
          guid: uuid(),
          serverName,
          name: serverName as string,
          category,
          type,
          url: `http://${ip}:${port}/igs/rest/mrms/tile/${serverName}`,
          // url: `http://${ip}:${port}/igs/rest/mrcs/tiles/${serverName}?f=json&v=2.0`,
          serverType: LayerType.IGSTile,
          visible: true,
          ip,
          port
        }
        this.addService(service)
        break
      case 'layer':
        service = {
          guid: uuid(),
          gdbps: gdbp as string,
          url: gdbp as string,
          category,
          serverType: LayerType.IGSVector,
          type,
          visible: true,
          name: name as string,
          ip,
          port
        }
        this.addService(service)
        break
      case 'WMS':
        service = {
          guid: uuid(),
          serverURL: url,
          name: name as string,
          category,
          type,
          serverType: LayerType.OGCWMS,
          url: url as string,
          visible: true
        }
        this.addService(service)
        break
      case 'WMTS':
        service = {
          guid: uuid(),
          serverURL: url,
          name: name as string,
          category,
          type,
          serverType: LayerType.OGCWMTS,
          url: url as string,
          visible: true
        }
        this.addService(service)
        break
      case 'tianDiTu':
        const tempayerType: string = this.serviceInfo.layerType as string
        const urlHref = `http://t${Math.round(
          Math.random() * 7
        )}.tianditu.gov.cn/${tempayerType}_c/wmts`
        service = {
          guid: uuid(),
          name: name as string,
          category,
          type,
          serverType: LayerType.OGCWMTS,
          serverURL: urlHref,
          url: urlHref,
          token,
          visible: true
        }
        console.log(service)

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
          guid: uuid(),
          name: name as string,
          category,
          type,
          serverURL: url,
          serverType: LayerType.arcGISMapImage,
          extend,
          layerType,
          url: url as string,
          visible: true
        }
        this.addService(service)
        break
      case 'baidu':
        const tempLayerType = this.serviceInfo.layerType
        service = {
          guid: uuid(),
          serverName,
          name: name as string,
          category,
          type,
          serverType: '',
          layerType: tempLayerType,
          url: tempLayerType as string,
          visible: true
        }
        this.addService(service)
        break
      case 'gaode':
        const tempLayerType2 = this.serviceInfo.layerType
        service = {
          guid: uuid(),
          serverName,
          name: name as string,
          category,
          type,
          serverType: LayerType.aMapMercatorSatelliteMap,
          layerType: tempLayerType2,
          url: tempLayerType2 as string,
          visible: true
        }
        this.addService(service)
        break
      case 'google':
      case 'googleExt':
        const tempLayerType3 = this.serviceInfo.layerType
        service = {
          guid: uuid(),
          serverName,
          name: name as string,
          category,
          type,
          serverType: '',
          layerType: tempLayerType3,
          url: tempLayerType3 as string,
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
