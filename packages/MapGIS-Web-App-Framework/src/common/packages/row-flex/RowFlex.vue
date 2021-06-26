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

<script>
export default {
  name: 'MpRowFlex',
  props: {
    align: {
      type: String,
      default: 'middle',
      validator: function(value) {
        return ['top', 'middle', 'bottom'].includes(value)
      }
    },
    justify: {
      type: String,
      default: 'start',
      validator: function(value) {
        return [
          'start',
          'end',
          'center',
          'space-between',
          'space-around'
        ].includes(value)
      }
    },
    gutter: {
      type: [Array, Number],
      default: () => 0
    },
    span: {
      type: Array,
      default: () => [5, 19]
    },
    colon: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      require: true
    }
  },
  computed: {
    labelSpan() {
      return this.span[0]
    },
    contentSpan() {
      return this.span[1]
    }
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
