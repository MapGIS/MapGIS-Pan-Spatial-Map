<template>
  <div class="edit-data-flow-style-container">
    <div class="edit-form-container">
      <mapgis-ui-form :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <mapgis-ui-form-item label="类型">
          <mapgis-ui-radio-group v-model="type">
            <mapgis-ui-radio-button value="point">
              点
            </mapgis-ui-radio-button>
            <mapgis-ui-radio-button value="marker">
              标签
            </mapgis-ui-radio-button>
            <mapgis-ui-radio-button value="model">
              模型
            </mapgis-ui-radio-button>
          </mapgis-ui-radio-group>
        </mapgis-ui-form-item>
        <mapgis-ui-form-item
          v-for="item in form"
          :key="item.key"
          :label="item.label"
        >
          <mapgis-ui-input v-if="item.type === 'string'" v-model="item.value" />
          <mapgis-ui-input-number
            v-else-if="item.type === 'number'"
            v-model="item.value"
            style="width:100%"
            :min="item.min"
            :max="item.max"
          />
          <mapgis-ui-sketch-color-picker v-else :color.sync="item.value" />
        </mapgis-ui-form-item>
      </mapgis-ui-form>
    </div>
    <div class="edit-form-submit">
      <a-button type="primary" @click="submit">
        确认
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'

@Component({
  name: 'MpEditDataFlowStyle',
  components: {}
})
export default class MpEditDataFlowStyle extends Vue {
  @Prop({ required: true }) layer

  type = 'point'

  form = []

  @Watch('layer.layerStyle.type', { immediate: true })
  layerChange(val) {
    this.type = val
  }

  @Watch('type', { immediate: true })
  typeChange(val) {
    let formArr = []
    const {
      layerStyle: { type }
    } = this.layer
    switch (val) {
      case 'marker':
        formArr = [
          {
            key: 'xOffset',
            type: 'number',
            value: 0,
            label: '水平偏移量',
            min: 0
          },
          {
            key: 'yOffset',
            type: 'number',
            value: 0,
            label: '垂直偏移量',
            min: 0
          },
          { key: 'url', type: 'string', value: '', label: '图标地址' },
          {
            key: 'rotation',
            type: 'number',
            value: 0,
            label: '图标旋转角度',
            min: 0,
            max: 360
          },
          {
            key: 'imageScale',
            type: 'number',
            value: 1,
            label: '图标缩放',
            min: 1
          },
          {
            key: 'width',
            type: 'number',
            value: 20,
            label: '图标宽度',
            min: 1
          },
          {
            key: 'height',
            type: 'number',
            value: 20,
            label: '图标高度',
            min: 1
          }
        ]
        if (type === 'marker') {
          this.setLayerValue(formArr)
        }
        break
      case 'model':
        formArr = [
          { key: 'url', type: 'string', value: '', label: '模型地址' },
          { key: 'scale', type: 'number', value: 1, label: '缩放', min: 1 }
        ]
        if (type === 'model') {
          this.setLayerValue(formArr)
        }
        break
      default:
        formArr = [
          { key: 'radius', type: 'number', value: 24, label: '半径', min: 0 },
          { key: 'color', type: 'color', value: '#FFFF00', label: '填充色' },
          {
            key: 'outlineColor',
            type: 'color',
            value: '#FF0000',
            label: '描边颜色'
          },
          { key: 'outlineWidth', type: 'number', value: 2, label: '描边宽度' },
          {
            key: 'outlineOpacity',
            type: 'number',
            value: 1,
            label: '描边透明度'
          }
        ]
        if (type === 'point') {
          this.setLayerValue(formArr)
        }
        break
    }
    this.form = formArr
  }

  setLayerValue(form = []) {
    const { layerStyle } = this.layer
    form.forEach(item => {
      item.value = layerStyle[item.key]
    })
  }

  submit() {
    const obj = { type: this.type }
    this.form.forEach(item => {
      obj[item.key] = item.value
    })
    this.layer.setLayerStyle(obj)
    this.$emit('update:layer', this.layer)
  }
}
</script>
<style lang="less" scoped>
.edit-data-flow-style-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .edit-form-container {
    flex: 1;
    overflow: auto;
  }
  .edit-form-submit {
    margin-top: 10px;
    text-align: right;
  }
}
</style>
