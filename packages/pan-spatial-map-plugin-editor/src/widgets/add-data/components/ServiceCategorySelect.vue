<template>
  <div class="service-category-select">
    <div>
      <span>服务分类:</span>
      <a-select class="select-first" v-model="serviceCategory">
        <a-select-option
          v-for="(item, index) in serviceCategories"
          :key="index"
          >{{ item.name }}</a-select-option
        >
      </a-select>
      <a-button shape="circle" icon="plus"></a-button>
    </div>

    <a-modal v-modal="visible" title="添加服务分类">
      <a-input v-model="newName" placeholder="分类名称"></a-input>
      <a-input v-model="newDesc" placeholder="分类描述"></a-input>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch, Model, Emit } from 'vue-property-decorator'
import {
  ServiceCategory,
  AddServicesMixin
} from '@mapgis/pan-spatial-map-store'
import { AppMixin } from '@mapgis/web-app-framework'

@Component({})
export default class ServiceCategorySelect extends Mixins(
  AddServicesMixin,
  AppMixin
) {
  // 类别选中项
  private serviceCategory = ''

  // 是否显示添加对话框
  private visible = false

  // 分类名称输入框值
  private newName = ''

  // 分类描述输入框值
  private newDesc = ''
}
</script>
