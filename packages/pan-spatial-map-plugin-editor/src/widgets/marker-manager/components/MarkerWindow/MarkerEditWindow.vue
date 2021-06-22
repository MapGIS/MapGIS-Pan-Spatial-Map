<template>
  <a-modal
    class="marker-edit-wrapper"
    :visible="visible"
    title="标注"
    :width="300"
    :mask="false"
    @cancel="onCancel"
    @ok="$emit('ok', markerValue)"
  >
    <div class="marker-edit-body">
      <a-space direction="vertical" style="flex: 1">
        <a-row>
          <label>名称</label>
        </a-row>
        <a-row>
          <a-input v-model="markerValue.title" />
        </a-row>
        <a-row>
          <label>描述</label>
        </a-row>
        <a-row>
          <a-textarea
            v-model="markerValue.description"
            :auto-size="{ minRows: 2, maxRows: 6 }"
          />
        </a-row>
        <a-row>
          <label>图片</label>
        </a-row>
        <a-row>
          <a-upload
            :multiple="false"
            method="post"
            :withCredentials="true"
            accept=".jpg, image/*"
            :action="baseUrl + '/api/local-storage/pictures'"
            list-type="picture-card"
            :file-list="fileList"
            @preview="onFilePreview"
            @change="onFileChange"
          >
            <div v-if="fileList.length < 1">
              <a-icon type="plus" />
              <div class="ant-upload-text">
                上传
              </div>
            </div>
          </a-upload>
          <a-modal
            :visible="previewVisible"
            :footer="null"
            @cancel="onPreviewCancel"
          >
            <img style="width: 100%" :src="previewImage" />
          </a-modal>
        </a-row>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, UUID } from '@mapgis/web-app-framework'

@Component({})
export default class MarkerEditWindow extends Mixins(AppMixin) {
  @Prop({ type: Object, required: true }) marker!: Record<string, any>

  @Prop({ type: Boolean, default: false }) visible

  private markerValue = {}

  private previewVisible = false

  private previewImage = ''

  private fileList = []

  @Watch('marker', { immediate: true })
  markerChange() {
    this.updateMarkerValue()
  }

  private onFileChange({ fileList, file }) {
    this.fileList = fileList
    if (file.status === 'done') {
      this.markerValue.picture = file.response.url
    }
  }

  private onCancel() {
    // 还原markerValue
    this.updateMarkerValue()
    this.$emit('cancel')
  }

  private onFilePreview(file) {
    this.previewVisible = true
    this.previewImage = file.url || `${this.baseUrl}${file.response.url}`
  }

  private onPreviewCancel() {
    this.previewVisible = false
  }

  private updateMarkerValue() {
    this.markerValue = { ...this.marker }

    if (this.markerValue.picture) {
      this.fileList = [
        {
          uid: UUID.uuid(),
          name: 'image.png',
          status: 'done',
          url: `${this.baseUrl}${this.markerValue.picture}`
        }
      ]
    } else {
      this.fileList = []
    }
  }
}
</script>

<style lang="less" scoped>
.marker-edit-wrapper {
  .marker-edit-body {
    display: flex;
  }
}
</style>

<style lang="less">
.marker-edit-wrapper {
  .ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
  }
  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
}
</style>
