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
    <a-collapse v-model="multiActiveKey">
      <a-collapse-panel key="1">
        <template v-slot:header>
          <a-checkbox :checked="multiChecked" @click="handleMultiClick">
            批量设置已勾选项
          </a-checkbox>
        </template>
        <LayerSetting
          :setting.sync="multiSetting"
          :sprite-data="srpiteData"
        ></LayerSetting>
      </a-collapse-panel>
    </a-collapse>
    <div
      class="collapse-layer-item"
      v-for="(item, index) in layers"
      :key="index"
    >
      <a-collapse v-model="activeKey">
        <a-collapse-panel :key="item.id">
          <template v-slot:header>
            <a-checkbox
              :checked="checked"
              @click="handleClick"
              @change="onChangeCheckedBox"
            >
              {{ item.id }}
            </a-checkbox>
          </template>
          <div>
            <LayerSetting
              :layer-type="item.type"
              :setting.sync="item.paint"
              :sprite-data="srpiteData"
            ></LayerSetting>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, Document, LayerType } from '@mapgis/web-app-framework'
import axios from 'axios'
import MultiSetting from './MultiSetting.vue'
import LayerSetting from './LayerSetting.vue'

@Component({
  name: 'MpVectorTileCarto',
  components: {
    MultiSetting,
    LayerSetting
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

  // 该矢量图层下的所有子图层
  private layers = []

  private multiActiveKey = []

  private multiChecked = false

  // 当前激活 tab 面板的 key
  private activeKey = []

  // 多选框是否勾选
  private checked = false

  // 区填充数据
  private srpiteData = []

  private multiSetting = {
    'fill-color': '#bedcaf',
    'fill-outline-color': '#dd5c5c',
    'fill-opacity': 1,
    'fill-antialias': false
  }

  // 监听矢量瓦片下拉项变化，实时构造该矢量瓦片对应的样式文件下拉项以及该矢量瓦片包含的所有子图层,
  // 以及区填充图案下拉项数据
  @Watch('formData.vectorTileName', { deep: true })
  onTitleNameChange() {
    const doc: Document = this.document
    const currentLayer = doc.defaultMap.allLayers.filter(
      item => item.title === this.formData.vectorTileName
    )
    this.styleOptions = currentLayer[0].styleList.map(item => item.name)
    this.layers = currentLayer[0].currentStyle.layers
    const requestUrl = `${currentLayer[0].currentStyle.sprite}.json`
    const request = new XMLHttpRequest()
    request.open('GET', requestUrl)
    request.responseType = 'json'
    request.send()
    request.onload = function() {
      const data = JSON.parse(JSON.stringify(request.response))
      this.srpiteData = Object.keys(data)
      console.log(this.srpiteData)
    }
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

  // 多选框变化时回调函数
  private onChangeCheckedBox(event) {}

  // 批量多选框点击事件(取消冒泡)
  private handleMultiClick(event) {
    this.multiChecked = !this.multiChecked
    event.stopPropagation()
  }

  // 多选框点击事件(取消冒泡)
  private handleClick(event) {
    // If you don't want click extra trigger collapse, you can prevent this:
    this.checked = !this.checked
    event.stopPropagation()
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
.collapse-layer-item {
  margin: 8px 0;
}
</style>
