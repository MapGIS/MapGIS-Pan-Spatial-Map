<template>
  <a-row type="flex" :align="align" :justify="justify" :gutter="gutter">
    <a-col :span="labelSpan" class="row-flex-col-left" :title="label">
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
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class RowFlex extends Vue {
  @Prop({ default: 'middle' }) readonly align!: 'top' | 'middle' | 'bottom'

  @Prop({ default: 'start' }) readonly justify!:
    | 'start'
    | 'end'
    | 'center'
    | 'space-between'
    | 'space-around'

  @Prop({ default: () => 0 }) readonly gutter!: number | Array<number>

  @Prop({ default: () => [5, 19] }) readonly span!: number[]

  @Prop({ default: true }) readonly colon!: boolean

  @Prop() readonly label!: string

  get labelSpan() {
    return this.span[0]
  }

  get contentSpan() {
    return this.span[1]
  }
}
</script>
<style lang="less" scoped>
.row-flex-col-left {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
