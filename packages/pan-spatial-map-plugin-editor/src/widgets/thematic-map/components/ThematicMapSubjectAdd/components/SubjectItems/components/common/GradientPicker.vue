<template>
  <div class="gradient-picker">
    <mp-row-flex
      class="gradient-picker-head"
      label="渐变色设置"
      justify="space-between"
      content-align="right"
      :colon="false"
      :span="[12, 12]"
    >
      <a-tooltip title="新增">
        <a-icon type="plus" @click="add" />
      </a-tooltip>
      <a-tooltip title="删除">
        <a-icon type="delete" @click="remove" />
      </a-tooltip>
      <a-tooltip title="确认">
        <a-icon type="check" @click="confirm" />
      </a-tooltip>
    </mp-row-flex>
    <div class="gradient-picker-content">
      <a-empty v-if="!gradientList.length" />
      <template v-else>
        <div
          v-for="(item, i) in gradientList"
          :key="i"
          class="gradient-picker-item"
        >
          <color-picker
            v-model="item.color"
            :border-radius="false"
            type="rgba"
          />
          <a-input-number
            v-model="item.percent"
            :min="0"
            :max="100"
            :precision="0"
            :formatter="value => `${value}%`"
            :parser="value => value.replace('%', '')"
          />
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ColorPicker from './ColorPicker.vue'

interface IGradient {
  color: string
  percent: number
}

@Component({
  components: {
    ColorPicker
  }
})
export default class GradientPicker extends Vue {
  // {0.25: rgb(0,0,255), 0.55: rgb(0,0,255)}
  @Prop() readonly value!: Record<string, string>

  gradientList: IGradient[] = []

  add() {
    const { length } = this.gradientList
    if (!length || length <= 5) {
      const node = {
        color: '',
        percent: 0
      }
      this.gradientList.push(node)
    } else if (length > 5) {
      this.$message.warning('渐变色最多可设置5级')
    }
  }

  remove() {}

  confirm() {
    const gradientObj = this.gradientList.reduce<Record<string, string>>(
      (obj, { color, percent }) => {
        const _percent = `${percent / 100}`
        const key = percent >= 100 ? `${_percent}.0` : _percent
        obj[key] = color
        return obj
      },
      {}
    )
    this.$emit('input', gradientObj)
  }

  @Watch('value', { immediate: true, deep: true })
  valueChange(nV) {
    if (!nV || Object.keys(nV).some(n => isNaN(Number(n)))) {
      return
    }
    this.gradientList = Object.entries(nV).map(([k, v]) => ({
      color: v,
      percent: Number(k) * 100
    }))
  }
}
</script>
<style lang="less" scoped>
.gradient-picker {
  &-head {
    padding: 4px 8px;
    background: #e5e5e5;

    /deep/ .anticon {
      font-size: 14px;
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        color: @primary-color;
      }
    }
  }
  &-content {
    padding: 12px;
    width: 210px;
    height: 150px;
    overflow-y: auto;
    background: @white;
  }
  &-item {
    display: flex;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 6px;
    }
    /deep/ .ant-input-number {
      border-radius: 0;
      flex: 1;
      &:hover,
      &:focus {
        border-color: @border-color-base;
      }
    }
  }
}
</style>
