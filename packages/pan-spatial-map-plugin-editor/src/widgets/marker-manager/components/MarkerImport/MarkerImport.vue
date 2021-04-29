<template>
  <div class="marker-import">
    <a-form-model
      :model="formImport"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="文件路径:">
        <a-upload
          name="file"
          accept=".txt"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :before-upload="beforeUpload"
          @change="onChangeFile"
        >
          <div class="upload-content">
            <a-icon type="upload" :style="{ fontSize: '18px' }"></a-icon>
          </div>
        </a-upload>
      </a-form-model-item>
      <div class="btn-content">
        <a-button type="primary" @click="openImportFileDesc = true"
          >查看支持导入文件的数据结构</a-button
        >
      </div>
      <a-checkbox
        class="crs-checkbox"
        :default-checked="true"
        @change="onChange"
      >
        设置输入坐标空间参考系
      </a-checkbox>
      <a-form-model-item v-show="showCrsSelect" label="参考系:">
        <a-select v-model="formImport.crsName">
          <a-select-option v-for="item in crsNames" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-divider />
      <div class="btn-group">
        <a-button type="primary" @click="onClickConfirm">确认</a-button>
        <a-button @click="onClickCancel">取消</a-button>
      </div>
    </a-form-model>
    <a-modal
      v-model="openImportFileDesc"
      title="文件结构"
      @ok="openImportFileDesc = false"
    >
      <marker-import-file-desc />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { ThemeStyleMixin } from '@mapgis/web-app-framework'
import { UUID } from '@mapgis/webclient-store/src/utils'
import MarkerAddMixin from '../../mixins/marker-add'
import MarkerImportFileDesc from './MarkerImportFileDesc.vue'

@Component({
  name: 'MpMarkerImport',
  components: { MarkerImportFileDesc }
})
export default class MpMarkerImport extends Mixins(MarkerAddMixin) {
  private formImport = {
    crsName: 'WGS1984_度'
  }

  private crsNames = ['WGS1984_度', 'Web墨卡托_WGS1984']

  // 支持导入文件描述对话框的显隐
  private openImportFileDesc = false

  // 参考系选择器的显隐
  private showCrsSelect = true

  @Emit('closeModal')
  closeModal() {}

  // 多选框变化时回调函数
  onChange(e) {
    this.showCrsSelect = e.target.checked
  }

  // 取消按钮回调函数
  onClickCancel() {
    this.closeModal()
  }

  // 确认按钮回调函数
  onClickConfirm() {
    this.closeModal()
  }

  // 上传文件之前的钩子
  beforeUpload(file) {
    const isTxt = file.type === 'text/plain'
    if (!isTxt) {
      this.$message.error('You can only upload JPG file!')
    }
    return isTxt
  }

  // 文件状态改变的回调
  onChangeFile(info) {
    if (info.file.status === 'uploading' || info.file.status === 'error') {
      return
    }
    if (info.file.status === 'done') {
      const reader = new FileReader()
      // 文件内容载入完毕之后的回调。
      reader.onload = this.fileLoad.bind(this)

      // const reader = new FileReader()
      // reader.addEventListener('load', () => callback(reader.result))
      // reader.readAsDataURL(img)
    }
  }

  fileLoad(e: any) {
    console.log(e)
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
.upload-content {
  width: 208px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .anticon-upload {
    margin-right: 10px;
  }
}
.btn-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 8px 0;
}
.crs-checkbox {
  margin: 8px 0 18px 32px;
}
.ant-divider {
  margin: 12px 0;
}
.btn-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .ant-btn {
    margin-left: 8px;
  }
}
</style>
