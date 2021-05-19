<template>
  <div class="mp-widget-vector-tile-carto">
    <a-form-model
      :model="formData"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 14 }"
      labelAlign="left"
    >
      <a-form-model-item label="选择矢量瓦片">
        <a-select v-model="formData.vectorTileName">
          <a-select-option v-for="item in vectorTileOptions" :key="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="选择样式文件">
        <a-select v-model="formData.vectorTileStyle">
          <a-select-option v-for="item in styleOptions" :key="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <MultiSetting :setting.sync="multiSetting"></MultiSetting>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, Document, LayerType } from '@mapgis/web-app-framework'
import MultiSetting from './MultiSetting.vue'

@Component({
  name: 'MpVectorTileCarto',
  components: {
    MultiSetting
  }
})
export default class MpVectorTileCarto extends Mixins(WidgetMixin) {
  // 表单数据
  private formData = {
    vectorTileName: '',
    vectorTileStyle: ''
  }

  // 矢量瓦片下拉项配置
  private vectorTileOptions = []

  // 样式文件下拉项配置
  private styleOptions = []

  private multiSetting = {
    'fill-color': '#bedcaf',
    'fill-outline-color': '#dd5c5c',
    'fill-opacity': 1,
    'fill-antialias': false
  }

  // 监听矢量瓦片下拉项变化，实时构造该矢量瓦片对应的样式文件下拉项
  @Watch('formData.vectorTileName', { deep: true })
  onTitleNameChange() {
    const doc: Document = this.document
    const currentLayer = doc.defaultMap.allLayers.filter(
      item => item.title === this.formData.vectorTileName
    )
    this.styleOptions = currentLayer[0].styleList.map(item => item.name)
  }

  onOpen() {
    this.init()
  }

  // 初始化数据
  private init() {
    const doc: Document = this.document
    if (doc.defaultMap && doc.defaultMap.allLayers.length > 0) {
      this.vectorTileOptions = doc.defaultMap.allLayers.reduce(
        (result, item) => {
          if (item.type === LayerType.vectorTile) {
            result.push(item.title)
          }
          return result
        },
        []
      )
    }
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  .ant-form-item-label {
    margin-right: 4px;
  }
}
</style>
