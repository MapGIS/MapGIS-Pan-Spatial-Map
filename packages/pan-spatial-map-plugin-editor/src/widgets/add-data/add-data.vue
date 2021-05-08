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
        <add-service-file :service-types="tempfileTypes" />
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
  private allTypes: ServiceType[] = []

  private tempServiceTypes: ServiceType[] = []

  private tempfileTypes: ServiceType[] = []

  created() {
    this.tempServiceTypes = this.serviceTypes2D
    this.tempfileTypes = this.fileTypes2D
  }
}
</script>

<style lang="less" scoped></style>
