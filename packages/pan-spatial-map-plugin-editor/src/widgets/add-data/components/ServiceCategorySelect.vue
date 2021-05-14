<template>
  <div class="service-category-select">
    <div class="container-head">
      <span>服务分类:</span>
      <a-select class="select-first" v-model="serviceCategory">
        <a-select-option v-for="item in serviceCategories" :key="item.name">{{
          item.name
        }}</a-select-option>
      </a-select>
      <a-button shape="circle" icon="plus" @click="visible = true"></a-button>
    </div>
    <a-modal
      title="添加服务分类"
      :visible="visible"
      :width="420"
      @cancel="visible = false"
      @ok="onClickOk"
    >
      <a-input
        class="input-name"
        v-model="newName"
        placeholder="分类名称"
      ></a-input>
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
  @Model('change') readonly value!: ServiceCategory | null

  // 类别选中项
  private serviceCategory = ''

  // 是否显示添加对话框
  private visible = false

  // 分类名称输入框值
  private newName = ''

  // 分类描述输入框值
  private newDesc = ''

  // 配合@Model触发change事件更新value值
  @Watch('serviceCategory')
  @Emit()
  private change(val) {}

  @Watch('visible')
  changeVisible(newVal) {
    if (newVal) {
      this.newName = ''
      this.newDesc = ''
    }
  }

  // 初始化下拉选项
  created() {
    const name = this.value
    const selectItem = this.serviceCategories.find(item => item.name === name)
    if (selectItem) {
      this.serviceCategory = selectItem.name
    }

    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  // 确定按钮回调
  onClickOk() {
    this.visible = false
    if (this.newName === '') {
      this.$message.warning('请输入分类名称')
      return
    }
    const { newName, newDesc } = this
    if (this.serviceCategories.includes(item => item.name === newName)) {
      this.$message.warning(`${newName}已存在`)
      return
    }
    this.serviceCategory = newName
    const obj = {
      name: newName,
      desc: newDesc
    }
    this.addServiceCategory(obj)
    this.visible = false
  }
}
</script>

<style lang="less" scoped>
.service-category-select {
  width: 100%;
  display: flex;
}
.container-head {
  width: 100%;
  display: flex;
  align-items: center;
}
.select-first {
  margin: 0 16px;
  flex-grow: 1;
}
.input-name {
  margin-bottom: 10px;
}
</style>
