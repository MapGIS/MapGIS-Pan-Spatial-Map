<template>
  <div class="add-services-data">
    <div class="row">
      <!-- <a-select v-model="serviceCategory">
        <a-select-option v-for="item in serviceCategories" :key="item.name">{{
          item.name
        }}</a-select-option>
      </a-select>
      <a-select v-model="serviceType">
        <a-select-option v-for="item in serviceTypes" :key="item">{{
          item
        }}</a-select-option>
      </a-select> -->
    </div>
    <div class="row"></div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  AddServicesMixin,
  ServiceType,
  Service
} from '@mapgis/pan-spatial-map-store'
import axios from 'axios'

@Component({})
export default class AddServicesData extends Mixins(
  AddServicesMixin,
  AppMixin
) {
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 类别选中项
  private serviceCategory: any = { name: '', desc: '' }

  // 子类别选中项
  private serviceType = null

  created() {
    console.log(this.serviceCategories)

    this.serviceCategory = this.serviceCategories[0]
    this.serviceType = this.serviceTypes[0]
  }
}
</script>

<style lang="scss" scoped></style>
