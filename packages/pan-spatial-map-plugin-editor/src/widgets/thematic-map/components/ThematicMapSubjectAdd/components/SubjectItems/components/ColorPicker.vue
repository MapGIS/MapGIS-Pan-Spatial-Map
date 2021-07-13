<template>
  <a-dropdown :trigger="['click']">
    <slot>
      <span
        class="color-picker-btn"
        :style="{ background: color }"
        @click.prevent
      />
    </slot>
    <chrome-picker slot="overlay" v-model="color" />
  </a-dropdown>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Chrome } from 'vue-color'

@Component({
  components: {
    'chrome-picker': Chrome
  }
})
export default class ColorPicker extends Vue {
  @Prop({ default: false }) readonly isGradient!: boolean

  @Prop({ default: () => ['0.25', '0.55', '0.85', '1.0'] })
  readonly gradientRules!: string[]

  @Prop({
    type: [String, Object],
    default: 'rgb(255,0,0)',
    validator: value => {
      if (typeof value !== 'string') {
        return Object.keys(value).includes('1.0')
      }
      return true
    }
  })
  readonly value!: string | object

  get color() {
    return this.isGradient ? this.value['1.0'] : this.value
  }

  set color({ rgba, hex }) {
    let color = hex
    if (this.isGradient) {
      const { r, g, b, a } = rgba
      color = this.gradientRules.reduce((obj, v) => {
        obj[v] = `rgba(${r}, ${g}, ${b}, ${v})`
        return obj
      }, {})
    }
    this.$emit('input', color)
  }
}
</script>
<style lang="less" scoped>
.color-picker-btn {
  width: 20px;
  height: 20px;
  border: 1px solid @border-color-base;
  border-radius: @border-radius-base;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  margin-top: -5px;
}
</style>
