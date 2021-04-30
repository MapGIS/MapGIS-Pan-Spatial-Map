<template>
  <div class="add-service-url"></div>
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
export default class AddServiceUrl extends Mixins(AddServicesMixin, AppMixin) {}
</script>

<style lang="scss" scoped></style>
