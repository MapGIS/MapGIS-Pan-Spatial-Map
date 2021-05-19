<template>
  <div>
    <a-collapse v-model="activeKey">
      <a-collapse-panel key="1">
        <template v-slot:header>
          <a-checkbox :checked="checked">
            批量设置已勾选项
          </a-checkbox>
        </template>
        <div class="collapse-panel">
          <div class="panel-item">
            <span>填充色:</span>
            <a-input
              class="color-input"
              v-show="!paint['fill-color'] || !paint['fill-color'].stops"
              v-model="paint['fill-color']"
              :style="{ background: paint['fill-color'] }"
            >
              <a-popover slot="addonAfter" trigger="click">
                <template slot="content">
                  <sketch-picker
                    :value="paint['fill-color']"
                    @input="val => getLineColor(val)"
                  />
                </template>
                <a-icon type="edit" />
              </a-popover>
            </a-input>
            <a-icon
              type="plus"
              style="margin-left:0.5em"
              @click="onClickAddBtn('fill-color')"
            />
          </div>
          <div class="layer-content" v-show="showLayerItem">
            <LayerItem
              :layer-style-items="paint['fill-color'].stops"
              type="color-picker"
              @delete="onClickDeleteBtn"
            ></LayerItem>
            <!-- <LayerItem type="option-select"></LayerItem>
            <LayerItem type="opacity-input"></LayerItem>
            <LayerItem type="switch"></LayerItem> -->
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator'
import { Sketch } from 'vue-color'
import { UUID } from '@mapgis/web-app-framework'
import LayerItem from './LayerItem.vue'

@Component({
  name: 'MultiSetting',
  components: { 'sketch-picker': Sketch, LayerItem }
})
export default class MultiSetting extends Vue {
  @PropSync('setting', { type: Object, default: _ => {} })
  paint: object

  // 当前激活 tab 面板的 key
  private activeKey = []

  // 多选框是否勾选
  private checked = false

  private showLayerItem = false

  // 选中颜色拾取器对应事件
  private getLineColor(val) {
    this.paint['fill-color'] = val.hex
  }

  // 点击+按钮响应事件
  private onClickAddBtn(type) {
    this.showLayerItem = true
    // 如果修改的样式中没有'stops'属性，则说明是第一次点击+按钮
    if (!this.paint[type].stops) {
      // 先拿到该样式属性对应的原始数据
      const originData = this.paint[type]

      // 之后重新构造该样式属性,添加一个stops属性
      this.paint[type] = {}
      this.$set(this.paint[type], 'stops', [])
      this.paint[type].stops.push([1, originData])
      this.paint[type].stops.push([2, originData])
    } else {
      // 否则说明是多次点击+按钮了,那么直接构造新的样式数据
      const stopsLength = this.paint[type].stops.length
      const itemIndex = stopsLength + 1
      const itemValue = this.paint[type].stops[stopsLength - 1][1]
      const stopsItem = [itemIndex, itemValue]
      this.paint[type].stops.push(stopsItem)
    }
    console.log(this.paint)
  }

  // 监听点击删除图标事件回调
  private onClickDeleteBtn(delIndex, delType) {
    let type = ''
    switch (delType) {
      case 'color-picker':
        type = 'fill-color'
        break
      default:
        break
    }
    if (this.paint[type].stops.length <= 2) {
      // 如果该样式数量<=2，则删除该样式属性的stops属性，重新为其赋值为stops中的最后一项
      const stopsLength = this.paint[type].stops.length
      const lastValue = this.paint[type].stops[stopsLength - 1][1]
      this.paint[type] = lastValue
    } else {
      // 否则只需删除该样式属性中stops属性中的该项即可
      this.paint[type].stops.splice(delIndex, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-item {
  display: flex;
  align-items: center;
  & :first-child {
    margin-right: 0.5em;
  }
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
.anticon-plus {
  cursor: pointer;
}

.layer-content {
  margin-top: 8px;
}
</style>
