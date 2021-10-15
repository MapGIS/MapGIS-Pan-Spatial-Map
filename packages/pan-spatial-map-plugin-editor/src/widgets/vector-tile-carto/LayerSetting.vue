<template>
  <div class="layer-setting-panel">
    <div v-if="layerType === 'background'">
      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('background-color')">
          <div class="item-title">背景色:</div>
          <div class="item-panel">
            <a-input
              class="color-input"
              v-if="!paint['background-color'].stops"
              v-model="paint['background-color']"
              :style="{ background: paint['background-color'] }"
            >
              <a-popover slot="addonAfter" trigger="click">
                <template slot="content">
                  <sketch-picker
                    :value="paint['background-color']"
                    @input="val => getLineColor(val, 'background-color')"
                  />
                </template>
                <a-icon type="edit" />
              </a-popover>
            </a-input>
            <a-icon
              type="plus"
              style="margin-left:0.5em"
              @click="onClickAddBtn('background-color')"
            />
          </div>
        </div>
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('background-color')"
        >
          <LayerItem
            :layer-style-items="paint['background-color'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="background-color-picker"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>

      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('background-opacity')">
          <div class="item-title">背景透明度:</div>
          <div class="item-panel">
            <a-input
              v-if="!paint['background-opacity'].stops"
              v-model.number="paint['background-opacity']"
              type="number"
              step="0.1"
              min="0"
              max="1"
            ></a-input>
            <a-icon
              type="plus"
              style="margin-left:0.5em"
              @click="onClickAddBtn('background-opacity')"
            />
          </div>
        </div>
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('background-opacity')"
        >
          <LayerItem
            :layer-style-items="paint['background-opacity'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="opacity-background"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('fill-color')">
          <div class="item-title">填充色:</div>
          <div class="item-panel">
            <a-input
              class="color-input"
              v-if="!paint['fill-color'].stops"
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
        <div class="style-multiple-item" v-if="hasMultiStyleVal('fill-color')">
          <LayerItem
            :layer-style-items="paint['fill-color'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="fill-color-picker"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>

      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('fill-outline-color')">
          <div class="item-title">轮廓颜色:</div>
          <div class="item-panel">
            <a-input
              class="color-input"
              v-if="!paint['fill-outline-color'].stops"
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
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('fill-outline-color')"
        >
          <LayerItem
            :layer-style-items="paint['fill-outline-color'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="outline-color-picker"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>

      <!-- 区填充图案样式特殊些，包括渲染条件、+按钮、占位元素 -->
      <div class="style-item">
        <div class="style-single-item">
          <div class="item-title">区填充图案:</div>
          <div class="item-panel">
            <a-select
              v-if="!paint['fill-pattern'] || !paint['fill-pattern'].stops"
              v-model="paint['fill-pattern']"
              @change="patternChange"
            >
              <a-select-option v-for="item in spriteData" :key="item">
                {{ item }}
              </a-select-option>
            </a-select>
            <a-icon
              v-if="paint['fill-pattern']"
              type="plus"
              style="margin-left:0.5em"
              @click="onClickAddBtn('fill-pattern')"
            />
            <div
              v-if="!paint['fill-pattern']"
              style="width: 14px; height: 14px; margin-left:0.5em"
            ></div>
          </div>
        </div>
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('fill-pattern')"
        >
          <LayerItem
            :layer-style-items="paint['fill-pattern'].stops"
            :sprite-data="spriteData"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="option-select"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>

      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('fill-opacity')">
          <div class="item-title">透明度:</div>
          <div class="item-panel">
            <a-input
              v-if="!paint['fill-opacity'].stops"
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
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('fill-opacity')"
        >
          <LayerItem
            :layer-style-items="paint['fill-opacity'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="opacity-input"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>

      <div class="style-item">
        <div class="style-single-item" v-if="hasStyleKey('fill-antialias')">
          <div class="item-title">抗锯齿:</div>
          <div class="item-panel">
            <a-switch
              v-if="!paint['fill-antialias'].stops"
              v-model="paint['fill-antialias']"
            />
            <a-icon
              type="plus"
              style="margin-left:0.5em"
              @click="onClickAddBtn('fill-antialias')"
            />
          </div>
        </div>
        <div
          class="style-multiple-item"
          v-if="hasMultiStyleVal('fill-antialias')"
        >
          <LayerItem
            :layer-style-items="paint['fill-antialias'].stops"
            :maxZoom="maxZoom"
            :minZoom="minZoom"
            type="switch"
            @delete="onClickDeleteBtn"
          ></LayerItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator'
import { Sketch } from 'vue-color'
import { UUID } from '@mapgis/web-app-framework'
import LayerItem from './LayerItem.vue'

@Component({
  name: 'LayerSetting',
  components: { 'sketch-picker': Sketch, LayerItem }
})
export default class LayerSetting extends Vue {
  // 子图层的样式属性集
  @PropSync('setting', { type: Object, default: _ => {} })
  paint!: object

  // 该矢量瓦片所对应的区填充图案数据
  @Prop({
    type: Array,
    default: () => []
  })
  readonly spriteData!: string[]

  // 子图层的图层类型,若为background,这说明是背景底色图层
  @Prop({ type: String, default: 'fill' }) readonly layerType: string

  // 该矢量瓦片所对应的最小级数
  @Prop({ type: Number, default: 0 }) readonly minZoom: number

  // 该矢量瓦片所对应的最大级数
  @Prop({ type: Number, default: 10 }) readonly maxZoom: number

  // 判断该子图层的样式属性集是否含有该样式属性
  private hasStyleKey(key) {
    return Object.keys(this.paint).includes(key)
  }

  // 判断该子图层的样式属性集中的某个样式属性是否有多个值
  private hasMultiStyleVal(key) {
    return this.paint[key] && this.paint[key].stops
  }

  // 选中颜色拾取器对应事件
  private getLineColor(val, type) {
    this.paint[type] = val.hex
  }

  // 区填充图案下拉项变化时回调事件
  private patternChange(value) {
    if (value === '清空区填充图案') {
      this.$delete(this.paint, 'fill-pattern')
    }
  }

  // 点击+按钮响应事件
  private onClickAddBtn(type) {
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
      case 'background-color-picker':
        type = 'background-color'
        break
      case 'opacity-input':
        type = 'fill-opacity'
        break
      case 'opacity-background':
        type = 'background-opacity'
        break
      case 'option-select':
        type = 'fill-pattern'
        break
      case 'switch':
        type = 'fill-antialias'
        break
      default:
        break
    }
    if (this.paint[type].stops.length <= 2) {
      // 如果该样式数量<=2，则删除该样式属性的stops属性，重新为其赋值为stops中的未被删除的那一项
      const item = this.paint[type].stops.find(
        (item, index) => index !== delIndex
      )
      this.paint[type] = item[1]
    } else {
      // 否则只需删除该样式属性中stops属性中的该项即可
      this.paint[type].stops.splice(delIndex, 1)
    }
  }
}
</script>

<style lang="less" scoped>
.style-single-item {
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
    margin-left: 0.5em;

    .ant-select {
      flex-grow: 1;
    }
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

.style-multiple-item {
  margin-top: 8px;
}
</style>
