<template>
  <a-row type="flex" :align="align" :justify="justify" :gutter="gutter">
    <a-col
      :span="labelSpan"
      :title="label"
      :style="labelStyle"
      class="row-flex-col-left"
    >
      <slot name="label" v-if="$slots.label || label">
        {{ label }}{{ colon ? '：' : '' }}</slot
      >
    </a-col>
    <a-col :span="contentSpan" :style="contentStyle">
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
      default: 0
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
    },
    labelAlign: {
      type: String,
      default: 'left',
      validator: function(value) {
        return ['left', 'center', 'right'].includes(value)
      }
    },
    contentAlign: {
      type: String,
      default: 'left',
      validator: function(value) {
        return ['left', 'center', 'right'].includes(value)
      }
    }
  },
  computed: {
    labelSpan() {
      return this.span[0]
    },
    contentSpan() {
      return this.span[1]
    },
    labelStyle() {
      return {
        textAlign: this.labelAlign
      }
    },
    contentStyle() {
      return {
        textAlign: this.contentAlign
      }
    }
  }
}
</script>

<style lang="less" scoped>
.row-flex-col-left {
  // overflow: hidden;
  // white-space: nowrap;
  // text-overflow: ellipsis;
  white-space: normal;
  line-height: 1;
}
</style>
