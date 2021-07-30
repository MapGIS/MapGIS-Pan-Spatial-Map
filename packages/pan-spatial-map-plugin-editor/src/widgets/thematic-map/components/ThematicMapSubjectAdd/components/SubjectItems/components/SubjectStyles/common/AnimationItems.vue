<template>
  <a-dropdown
    class="animation-items"
    :visible="dropdownVisible"
    :trigger="['click']"
  >
    <a-button @click="showDropdown">点击设置</a-button>
    <mp-card
      slot="overlay"
      :box-shadow="true"
      title="动画设置"
      :tools="tools"
      class="animation-items-dropdown"
    >
      <mp-row-flex :span="[6, 18]" label="展示方式" label-align="right">
        {{ animation.type }}
      </mp-row-flex>
      <mp-row-flex :span="[6, 18]" label="拖尾大小" label-align="right">
        <a-input-number v-model="animation.trails" :min="1" />
      </mp-row-flex>
      <mp-row-flex :span="[6, 18]" label="单个时间" label-align="right">
        <a-input-number v-model="animation.duration" :min="1" />
      </mp-row-flex>
      <mp-row-flex :span="[6, 18]" label="起止时间" label-align="right">
        <div class="steps-range">
          <a-space>
            <a-input-number v-model="animation.stepsRange.start" :min="0" />
            <span>至</span>
            <a-input-number v-model="animation.stepsRange.end" :min="0" />
          </a-space>
        </div>
      </mp-row-flex>
    </mp-card>
  </a-dropdown>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _cloneDeep from 'lodash/cloneDeep'

@Component
export default class AnimationItems extends Vue {
  @Prop({ type: Object }) readonly value!: Record<string, any>

  dropdownVisible = false

  animation = {
    type: 'time',
    trails: 10,
    duration: 4,
    stepsRange: {
      start: 0,
      end: 100
    }
  }

  tools = [
    {
      title: '确认',
      icon: 'check',
      method: this.confirm
    },
    {
      title: '取消',
      icon: 'close',
      method: this.cancel
    }
  ]

  @Watch('value', { deep: true })
  valueChanged(nV) {
    if (nV) {
      this.animation = _cloneDeep(nV)
    }
  }

  /**
   * 触发更新
   */
  emitValue(value) {
    this.$emit('input', value)
  }

  /**
   * 展示配置
   */
  showDropdown() {
    this.dropdownVisible = true
  }

  /**
   * 隐藏配置
   */
  hideDropdown() {
    this.dropdownVisible = false
  }

  /**
   * 取消配置
   */
  cancel() {
    this.hideDropdown()
    this.emitValue(this.valu)
  }

  /**
   * 确认
   */
  confirm() {
    this.hideDropdown()
    this.emitValue(this.animation)
  }
}
</script>
<style lang="less" scoped>
.animation-items {
  &-dropdown {
    ::v-deep .ant-row-flex:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }
}

.steps-range {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
