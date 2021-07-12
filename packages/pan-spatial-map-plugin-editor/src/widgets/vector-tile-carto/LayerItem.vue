<template>
  <div class="layer-item-container">
    <div
      class="layer-style-item"
      v-for="item in layerStyleItems"
      :key="setKey(item)"
    >
      <a-icon type="delete" @click="onClickDelBtn(item)"></a-icon>
      <a-input
        class="middle-input"
        v-model.number="item[0]"
        type="number"
      ></a-input>
      <a-input
        v-if="
          type === 'fill-color-picker' ||
            type === 'outline-color-picker' ||
            type === 'background-color-picker'
        "
        class="color-input"
        v-model="item[1]"
        :style="{ background: item[1] }"
      >
        <a-popover slot="addonAfter" trigger="click">
          <template slot="content">
            <sketch-picker
              :value="item[1]"
              @input="val => getLineColor(val, item)"
            />
          </template>
          <a-icon type="edit" />
        </a-popover>
      </a-input>
      <a-select
        v-if="type === 'option-select'"
        v-model="item[1]"
        @change="value => patternChange(value, item)"
      >
        <a-select-option v-for="item2 in spriteData" :key="item2">
          {{ item2 }}
        </a-select-option>
      </a-select>
      <a-input
        v-if="type === 'opacity-input' || type === 'opacity-background'"
        v-model.number="item[1]"
        type="number"
        step="0.1"
        min="0"
        max="1"
      ></a-input>
      <a-switch v-if="type === 'switch'" v-model="item[1]" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop, Emit } from 'vue-property-decorator'
import { Sketch } from 'vue-color'
import { UUID } from '@mapgis/web-app-framework'

@Component({
  name: 'LayerItem',
  components: { 'sketch-picker': Sketch }
})
export default class LayerItem extends Vue {
  // 该矢量瓦片的某一具体样式(例：填充色)
  @Prop({ type: Array, default: () => [] }) layerStyleItems!: array

  // 该矢量瓦片的广义样式种类(例：颜色拾取、下拉选项、透明度输入框、开关)
  @Prop({ type: String, default: 'fill-color-picker' }) readonly type!: string

  // 该矢量瓦片所对应的区填充图案数据
  @Prop({ type: Array }) readonly spriteData: array

  @Emit('delete')
  emitDeleteBtn(delIndex, delType) {}

  // 选中颜色拾取器对应事件
  private getLineColor(val, item) {
    const index = this.layerStyleItems.findIndex(item2 => item2 === item)
    this.layerStyleItems.splice(index, 1, [item[0], val.hex])
  }

  // v-for循环为每一项设置唯一key
  private setKey(item) {
    const key = item[0] + UUID.uuid()
    return key
  }

  // 点击删除图标对应事件
  private onClickDelBtn(item) {
    const index = this.layerStyleItems.findIndex(item2 => item2 === item)
    this.emitDeleteBtn(index, this.type)
  }

  // 区填充图案下拉项变化时回调事件
  private patternChange(value, item) {
    if (value === '清空区填充图案') {
      this.onClickDelBtn(item)
    }
  }
}
</script>

<style lang="less" scoped>
.layer-item-container {
  display: flex;
  flex-direction: column;
}
.layer-style-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  .middle-input {
    width: 48%;
  }
  .ant-select {
    flex-grow: 1;
  }
}
.anticon-delete {
  cursor: pointer;
}
.middle-input {
  margin: 0 8px;
}
.color-input {
  ::v-deep .ant-input-wrapper,
  ::v-deep .ant-input {
    background: inherit;
  }
  ::v-deep .ant-input-group-addon {
    background: inherit;
    cursor: pointer;
  }
}
</style>
