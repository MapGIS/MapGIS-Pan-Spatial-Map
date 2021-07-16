<template>
  <div class="add-data-file-wrapper beauty-scroll">
    <a-space direction="vertical" style="flex: 1">
      <a-row>
        <label>分类</label>
      </a-row>
      <a-row>
        <add-data-category-select
          :categories="categories"
          :value="categoryName"
          @select="onCategorySelect"
          class="full-width"
        />
      </a-row>
      <a-row>
        <label>类型</label>
      </a-row>
      <a-row>
        <add-data-type-select
          :types="fileDataTypes"
          :value="fileDataType"
          @select="onDataTypeSelect"
          class="full-width"
        />
      </a-row>
      <a-row>
        <label>地址</label>
      </a-row>
      <a-row>
        <a-textarea v-model="file" auto-size :disabled="true"> </a-textarea>
      </a-row>
      <a-row>
        <label>名称</label>
      </a-row>
      <a-row>
        <a-input v-model="name"> </a-input>
      </a-row>
      <a-row>
        <a-upload-dragger
          name="file"
          :action="
            `http://localhost:${config.igsPort}/igs/rest/resource/upload`
          "
          :accept="accept"
          @change="handleChange"
        >
          <div class="upload-content">
            <a-icon type="upload" :style="{ fontSize: '36px' }" />
            <p>{{ label }}</p>
          </div>
        </a-upload-dragger>
      </a-row>
      <a-row>
        <a-button
          type="primary"
          @click="onAdd"
          class="full-width"
          style="margin-top: 10px;"
          :disabled="file.length == 0 || name.length == 0"
        >
          添加
        </a-button>
      </a-row>
    </a-space>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UrlUtil } from '@mapgis/web-app-framework'
import AddDataCategorySelect from './AddDataCategorySelect.vue'
import AddDataTypeSelect from './AddDataTypeSelect.vue'

@Component({
  name: 'AddDataFile',
  components: {
    AddDataCategorySelect,
    AddDataTypeSelect
  }
})
export default class AddDataFile extends Vue {
  @Prop({ type: Array }) categories

  @Prop({ type: Array }) fileDataTypes

  @Prop({ type: Object }) config

  private categoryName = this.categories.length ? this.categories[0].name : ''

  private fileDataType = this.fileDataTypes.length
    ? this.fileDataTypes[0]
    : null

  private file = ''

  private path = ''

  private name = ''

  // 上传提示信息
  private label = '单击或将文件拖到该区域以上传'

  // 接受的上传文件类型
  private accept = ''

  onCategorySelect(val) {
    this.categoryName = val
  }

  onDataTypeSelect(val) {
    this.fileDataType = val
  }

  onAdd() {
    if (!UrlUtil.isUrlValid(this.file)) {
      this.$message.warn('请上传正确的文件')
      return false
    }
  }

  private handleChange(info) {
    if (info.file.status === 'done') {
      console.log(info)
      const url = info.file.response.data[0].url
      const path = info.file.response.data[0].path

      this.file = `http://${this.config.igsIp}:${this.config.igsPort}${url}`
      this.path = `http://192.168.21.191:6163/igs/rest/mrms/layers?gdbps=gdbp:${path}`

      console.log(this.file)
      console.log(path)
      console.log(this.path)
    }
  }
}
</script>

<style lang="less" scoped>
.add-data-file-wrapper {
  display: flex;
  overflow: auto;
  .full-width {
    width: 100%;
  }
}
</style>
