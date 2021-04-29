<template>
  <div class="mp-widget-add-data">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="数据列表">
        <add-services-data :service-types="allTypes" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="URL">
        <div>URL</div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="文件">
        <div>文件</div>
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

@Component({
  name: 'MpAddData',
  components: {
    AddServicesData
  }
})
export default class MpAddData extends Mixins(WidgetMixin) {
  private allTypes: ServiceType[] = []
}
</script>

<style lang="less" scoped></style>
