<template>
  <a-row type="flex" :align="align" :justify="justify">
    <a-col :span="labelSpan">
      <slot name="label" v-show="label || $slots.label"> {{ label }}： </slot>
    </a-col>
    <a-col :span="contentSpan">
      <slot></slot>
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @Prop() label!: string

  @Prop({ default: 'middle' }) align!: 'top' | 'middle' | 'bottom'

  @Prop({ default: 'start' }) justify!:
    | 'start'
    | 'space-between'
    | 'space-around'
    | 'center'
    | 'end'

  @Prop({ default: () => [6, 8] }) span!: (string | number)[]

  get labelSpan() {
    return this.span[0]
  }

  get contentSpan() {
    return this.span[1]
  }
}
</script>
<style lang="less" scoped></style>
