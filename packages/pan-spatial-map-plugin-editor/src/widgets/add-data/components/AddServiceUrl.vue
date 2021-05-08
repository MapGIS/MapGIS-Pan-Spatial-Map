<template>
  <div class="add-service-url">
    <service-category-select />
    <service-type-select :service-types="serviceTypes" />
    <div class="btn">
      <a-button type="primary">添加</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import {
  AddServicesMixin,
  ServiceType,
  ServiceCategory,
  Service
} from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'
import ServiceCategorySelect from './ServiceCategorySelect.vue'
import ServiceTypeSelect from './ServiceTypeSelect.vue'

@Component({
  components: { ServiceCategorySelect, ServiceTypeSelect }
})
export default class AddServiceUrl extends Mixins(AddServicesMixin, AppMixin) {
  @Prop(Array) readonly serviceTypes!: ServiceType[]
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
