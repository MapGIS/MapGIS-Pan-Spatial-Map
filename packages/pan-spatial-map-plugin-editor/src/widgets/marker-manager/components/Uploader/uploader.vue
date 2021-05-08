<template>
  <a-upload
    name="file"
    :accept="accept"
    :action="url"
    :multiple="false"
    method="post"
    :withCredentials="true"
    :before-upload="beforeUpload"
    @change="onChangeFile"
  >
    <div class="upload-content">
      <span>图片上传</span>
      <a-icon type="upload" :style="{ fontSize: '18px' }"></a-icon>
    </div>
  </a-upload>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator'

@Component({ name: 'MpUploader' })
export default class MpUploader extends Vue {
  @Prop({ type: String, default: '' }) label: string

  @Prop({ type: String, default: '/upload/uploadFile' })
  url: string

  @Prop({ type: String, default: '.jpg, image/*' }) accept: string

  private headers: Array<any> = []

  beforeUpload(file) {
    console.log(file)

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      this.$message.error('You can only upload JPG file!')
    }
    return isJpgOrPng
  }

  onChangeFile(info) {
    if (info.file.status === 'uploading' || info.file.status === 'error') {
      return
    }
    if (info.file.status === 'done') {
      this.$emit('success', info)
    }
  }
}
</script>
