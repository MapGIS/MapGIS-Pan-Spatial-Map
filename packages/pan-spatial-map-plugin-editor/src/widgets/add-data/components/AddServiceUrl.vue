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
  Service,
  eventBus
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

  private isSelectLeafNode = true

  @Watch('serviceCategory')
  onChangeServiceCategory(newVal) {
    console.log(newVal)
  }

  @Watch('serviceInfo', { deep: true })
  onChangeServiceInfo(newVal) {
    console.log(newVal)
  }

  created() {
    // 监听选择树选择节点事件，若选择的不是末级叶子节点，则无法添加该节点对应的服务
    eventBus.$on('emitSelectNode', val => {
      this.isSelectLeafNode = val
    })
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  private onAdd() {
    const { serviceCategory } = this
    if (!serviceCategory) {
      this.$message.warning('请选择服务分类')
      return
    }
    if (!this.isSelectLeafNode) {
      this.$message.warning('请选择末级叶子节点作为要添加的服务')
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
    let service: Service

    switch (type) {
      case 'doc':
        service = {
          id: uuid(),
          name: serverName as string,
          category,
          type,
          url: `http://${ip}:${port}/igs/rest/mrms/docs/${serverName}`,
          // url: `http://${ip}:${port}/igs/rest/mrcs/docs/${serverName}/0?include={includeDetails:true,includeSubs:true}&f=json`,
          visible: true,
          ip,
          port
        }
        break
      case 'tile':
        service = {
          id: uuid(),
          name: serverName as string,
          category,
          type,
          url: `http://${ip}:${port}/igs/rest/mrms/tile/${serverName}`,
          // url: `http://${ip}:${port}/igs/rest/mrcs/tiles/${serverName}?f=json&v=2.0`,
          visible: true,
          ip,
          port
        }
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
        break
      case 'tianDiTu':
        const tempayerType: string = this.serviceInfo.layerType as string
        const urlHref = `http://t${Math.round(
          Math.random() * 7
        )}.tianditu.gov.cn/${tempayerType}_c/wmts`
        service = {
          id: uuid(),
          name: name as string,
          category,
          type,
          url: urlHref,
          token,
          visible: true
        }
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
        break
      default:
        this.$message.wraning('未支持的服务类型')
        break
    }

    // 将服务加入到对应渲染引擎下的数据中
    if (this.is2DMapMode) {
      this.$emit('emitAddService2D', service, true)
    } else {
      this.$emit('emitAddService3D', service, false)
    }

    // 现在的addService方法仅仅只是将服务对应的图层加入到document中
    this.addService(service)
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
