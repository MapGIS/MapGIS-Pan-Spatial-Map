<template>
  <a-row type="flex" :align="align" :justify="justify" :gutter="gutter">
    <a-col :span="labelSpan">
      <slot name="label" v-if="$slots.label || label">
        {{ label }}{{ colon ? '：' : '' }}</slot
      >
    </a-col>
    <a-col :span="contentSpan">
      <slot />
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class RowFlex extends Mixins<Record<string, any>>(WidgetMixin) {
  @Prop({ default: 'middle' }) align!: 'top' | 'middle' | 'bottom'

  @Prop({ default: 'start' }) justify!:
    | 'start'
    | 'end'
    | 'center'
    | 'space-between'
    | 'space-around'

  @Prop({ default: () => 0 }) gutter!: number | Array<number>

  @Prop({ default: () => [5, 19] }) span!: number[]

  @Prop({ default: true }) colon!: boolean

  @Prop() label!: string

  get labelSpan() {
    return this.span[0]
  }

  get contentSpan() {
    return this.span[1]
  }
}
</script>
<style lang="less" scoped></style>
