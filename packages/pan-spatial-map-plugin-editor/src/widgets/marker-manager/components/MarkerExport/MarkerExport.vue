<template>
  <div class="marker-export-wrapper">
    <a-form-model
      :model="formExport"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-model-item label="文件名称:">
        <a-input v-model="formExport.exportFileName"> </a-input>
      </a-form-model-item>
      <a-form-model-item label="导出格式:">
        <a-select v-model="formExport.exportFileType">
          <a-select-option v-for="item in exportFileTypes" :key="item">{{
            item
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Emit } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { ThemeStyleMixin } from '@mapgis/web-app-framework'
import { UUID } from '@mapgis/webclient-store/src/utils'
import MarkerAddMixin from '../../mixins/marker-add'

@Component({
  name: 'MarkerExport'
})
export default class MarkerExport extends Mixins() {
  private formExport = {
    exportFileName: '',
    exportFileType: 'shp格式'
  }

  // 导出格式下拉项配置
  private exportFileTypes = ['shp格式', '6x格式', 'excel格式']
}
</script>

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}
</style>
