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
    <a-collapse class="multiple-style" v-model="multiActiveKey">
      <a-collapse-panel key="1">
        <template v-slot:header>
          <a-checkbox :checked="multiChecked" @click="handleMultiClick">
            批量设置已勾选项
          </a-checkbox>
        </template>
        <LayerSetting
          :setting.sync="multiSetting"
          :sprite-data="spriteData"
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
              default-checked
              @change="event => onChange(event, item)"
              @click="event => handleClick(event)"
            >
              {{ item.id }}
            </a-checkbox>
          </template>
          <div>
            <LayerSetting
              :layer-type="item.type"
              :setting.sync="item.paint"
              :sprite-data="spriteData"
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
import { eventBus } from '@mapgis/pan-spatial-map-store'
import LayerSetting from './LayerSetting.vue'

@Component({
  name: 'MpVectorTileCarto',
  components: {
    LayerSetting
  }
})
export default class MpVectorTileCarto extends Mixins(WidgetMixin) {
  // 表单数据
  private formData = {
    vectorTileName: '',
    vectorTileStyle: ''
  }

  // 当前选择的图层
  private currentLayer = {}

  // 矢量瓦片下拉项配置
  private vectorTileOptions = []

  // 样式文件下拉项配置
  private styleOptions = []

  // 该矢量图层下的所有子图层
  private layers = []

  // 当前激活批量 tab 面板的 key
  private multiActiveKey = []

  // 批量多选框是否勾选
  private multiChecked = false

  // 当前激活 tab 面板的 key
  private activeKey = []

  // 区填充数据
  private spriteData = []

  // 勾选的子图层id数组
  private checkedLayerIDs = []

  // 批量设置样式属性集
  private multiSetting = {
    'fill-color': '#bedcaf',
    'fill-outline-color': '#dd5c5c',
    'fill-pattern': '',
    'fill-opacity': 1,
    'fill-antialias': true
  }

  // 监听矢量瓦片下拉项变化，实时构造该矢量瓦片对应的样式文件下拉项,以及区填充图案下拉项数据
  @Watch('formData.vectorTileName', { deep: true })
  onTileNameChange(newVal) {
    if (newVal === '') {
      return false
    } else {
      const doc: Document = this.document
      this.currentLayer = doc.defaultMap.allLayers.find(
        item => item.title === newVal
      )
      const requestUrl = `${this.currentLayer.currentStyle.sprite}.json`
      this.styleOptions = this.currentLayer.styleList.map(item => item.name)
      this.formData.vectorTileStyle = this.currentLayer.currentStyle.name
      // 获取到区填充图案数据后，将批量设置类型中的区填充属性值设为数据的第0项
      this.getSpriteData(requestUrl).then(res => {
        this.spriteData = res
        this.multiSetting['fill-pattern'] = this.spriteData[0]
      })
    }
  }

  // 监听样式文件下拉项变化，将当前图层的样式类型更改为所选样式文件,实时构造该矢量瓦片包含的所有子图层
  @Watch('formData.vectorTileStyle', { deep: true })
  onTileStyleChange(newVal) {
    if (newVal === '') {
      return false
    } else {
      const doc: Document = this.document
      this.checkedLayerIDs = []
      this.currentLayer.currentStyle = this.currentLayer.styleList.find(
        item => item.name === newVal
      )
      this.layers = this.currentLayer.currentStyle.layers
      // 所有初始子图层默认勾选，所以初始所有子图层的id都会被push进勾选的子图层id数组
      this.layers.forEach(item => {
        this.checkedLayerIDs.push(item.id)
      })

      this.layers = this.layers.reduce((result, item) => {
        if (item.type === 'fill') {
          item.paint = {
            ...item.paint,
            'fill-outline-color': '#dd5c5c',
            'fill-opacity': 1,
            'fill-antialias': true
          }
        }
        result.push(item)
        return result
      }, [])
    }
  }

  // 监听批量设置样式属性集的变化,来改变所勾选子图层对应样式
  @Watch('multiSetting', { deep: true })
  onMultiSetChange(newVal) {
    const multiSettingKeys = Object.keys(newVal)
    if (this.multiChecked) {
      this.layers = this.layers.reduce((result, item) => {
        if (this.checkedLayerIDs.includes(item.id) && item.type === 'fill') {
          // 只修改该子图层样式属性集paint中含有的样式
          const layerPaintKeys = Object.keys(item.paint)
          layerPaintKeys.forEach(key => {
            if (multiSettingKeys.includes(key)) {
              item.paint[key] = newVal[key]
            }
          })

          // 区填充图案样式特殊些，所以子图层的该样式也要改变
          item.paint['fill-pattern'] = newVal['fill-pattern']
        }
        result.push(item)
        return result
      }, [])
    }
  }

  // 监听目录树勾选图层节点变化后触发的事件
  created() {
    eventBus.$on('emitSelectLayer', this.init)
  }

  // 销毁目录树勾选图层节点变化后触发的事件
  beforeDestroy() {
    eventBus.$off('emitSelectLayer')
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
      if (this.vectorTileOptions.length > 0) {
        // 矢量瓦片下拉项默认值为第0项数据
        this.formData.vectorTileName = this.vectorTileOptions[0]
      }
    } else {
      // 如果没有勾选任何矢量图层，则置空所有下拉项数据以及子图层
      this.vectorTileOptions = []
      this.styleOptions = []
      this.formData.vectorTileName = ''
      this.formData.vectorTileStyle = ''
      this.layers = []
    }
  }

  // 初始化区填充图案数据
  private getSpriteData(url) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.responseType = 'json'
      request.open('GET', url)
      request.onload = function() {
        const data = JSON.parse(JSON.stringify(request.response))
        resolve(Object.keys(data))
      }
      request.send()
    })
  }

  // 批量多选框点击事件(取消冒泡)
  private handleMultiClick(event) {
    this.multiChecked = !this.multiChecked
    event.stopPropagation()
  }

  // 多选框点击事件(取消冒泡)
  private handleClick(event) {
    // If you don't want click extra trigger collapse, you can prevent this:
    event.stopPropagation()
  }

  // 子图层多选框勾选状态变化时回调函数(同时多选框的勾选也控制该子图层的可见性(若该子图层有layout属性的话))
  private onChange(event, item) {
    const isChecked = event.target.checked
    if (isChecked) {
      if (!this.checkedLayerIDs.includes(item.id))
        this.checkedLayerIDs.push(item.id)
      if (item.layout) item.layout.visibility = 'visible'
    } else {
      const index = this.checkedLayerIDs.findIndex(item2 => item2 === item.id)
      if (index !== -1) this.checkedLayerIDs.splice(index, 1)
      if (item.layout) item.layout.visibility = 'none'
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

.multiple-style {
  margin-top: 8px;
}
.collapse-layer-item {
  margin: 8px 0;
}
</style>
