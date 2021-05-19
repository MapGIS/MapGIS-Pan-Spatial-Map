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
            <div class="item-title">填充色:</div>
            <div class="item-panel">
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
                      @input="val => getLineColor(val, 'fill-color')"
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
          </div>
          <div class="layer-content" v-show="showLayerItem">
            <LayerItem
              :layer-style-items="paint['fill-color'].stops"
              type="fill-color-picker"
              @delete="onClickDeleteBtn"
            ></LayerItem>
          </div>
          <div class="panel-item">
            <div class="item-title">轮廓颜色:</div>
            <div class="item-panel">
              <a-input
                class="color-input"
                v-show="
                  !paint['fill-outline-color'] ||
                    !paint['fill-outline-color'].stops
                "
                v-model="paint['fill-outline-color']"
                :style="{ background: paint['fill-outline-color'] }"
              >
                <a-popover slot="addonAfter" trigger="click">
                  <template slot="content">
                    <sketch-picker
                      :value="paint['fill-outline-color']"
                      @input="val => getLineColor(val, 'fill-outline-color')"
                    />
                  </template>
                  <a-icon type="edit" />
                </a-popover>
              </a-input>
              <a-icon
                type="plus"
                style="margin-left:0.5em"
                @click="onClickAddBtn('fill-outline-color')"
              />
            </div>
          </div>
          <div class="layer-content" v-show="showLayerItem">
            <LayerItem
              :layer-style-items="paint['fill-outline-color'].stops"
              type="outline-color-picker"
              @delete="onClickDeleteBtn"
            ></LayerItem>
          </div>

          <div class="panel-item">
            <div class="item-title">区填充图案:</div>
            <div class="item-panel">
              <a-select
                v-show="!paint['fill-pattern'] || !paint['fill-pattern'].stops"
                v-model="paint['fill-pattern']"
              >
                <a-select-option v-for="item in options" :key="item">
                  {{ item }}
                </a-select-option>
              </a-select>
              <a-icon
                type="plus"
                style="margin-left:0.5em"
                @click="onClickAddBtn('fill-pattern')"
              />
            </div>
          </div>

          <div class="panel-item">
            <div class="item-title">透明度:</div>
            <div class="item-panel">
              <a-input
                v-show="!paint['fill-opacity'] || !paint['fill-opacity'].stops"
                v-model.number="paint['fill-opacity']"
                type="number"
                step="0.1"
                min="0"
                max="1"
              ></a-input>
              <a-icon
                type="plus"
                style="margin-left:0.5em"
                @click="onClickAddBtn('fill-opacity')"
              />
            </div>
          </div>
          <div class="layer-content" v-show="showLayerItem">
            <LayerItem
              :layer-style-items="paint['fill-opacity'].stops"
              type="opacity-input"
              @delete="onClickDeleteBtn"
            ></LayerItem>
          </div>

          <div class="panel-item">
            <div class="item-title">抗锯齿:</div>
            <div class="item-panel">
              <a-switch
                v-show="
                  !paint['fill-antialias'] || !paint['fill-antialias'].stops
                "
                v-model="paint['fill-antialias']"
              />
              <a-icon
                type="plus"
                style="margin-left:0.5em"
                @click="onClickAddBtn('fill-antialias')"
              />
            </div>
          </div>
          <div class="layer-content" v-show="showLayerItem">
            <LayerItem
              :layer-style-items="paint['fill-antialias'].stops"
              type="switch"
              @delete="onClickDeleteBtn"
            ></LayerItem>
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

  private options = []

  // 选中颜色拾取器对应事件
  private getLineColor(val, type) {
    this.paint[type] = val.hex
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
    // 根据不同的类别，找到该类别对应的样式属性
    switch (delType) {
      case 'fill-color-picker':
        type = 'fill-color'
        break
      case 'outline-color-picker':
        type = 'fill-outline-color'
        break
      case 'opacity-input':
        type = 'fill-opacity'
        break
      case 'switch':
        type = 'fill-antialias'
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
  margin-bottom: 8px;
  .item-title {
    width: 74px;
    display: flex;
    justify-content: flex-end;
  }
  .item-panel {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }
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
