<template>
  <a-row
    type="flex"
    :align="align"
    :justify="justify"
    :gutter="gutter"
    :class="type"
    class="row-flex"
  >
    <a-col
      :span="labelSpan"
      :title="label"
      :style="labelStyle"
      class="row-flex-col-left"
    >
      <slot name="label" v-if="$slots.label || label">
        {{ label }}{{ isColon }}</slot
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
    type: {
      type: String,
      default: 'horizontal',
      validator: function(value) {
        return ['horizontal', 'vertical'].includes(value)
      }
    },
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
      type: String
    },
    labelWidth: {
      type: Number
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
    isVertical({ type }) {
      return type === 'vertical'
    },
    isColon({ isVertical, colon }) {
      return (isVertical ? false : colon) ? '：' : ''
    },
    labelSpan({ isVertical, span }) {
      return isVertical ? 24 : span[0]
    },
    contentSpan({ isVertical, span }) {
      return isVertical ? 24 : span[1]
    },
    labelStyle({ labelWidth, labelSpan, labelAlign }) {
      let style = {
        textAlign: labelAlign
      }
      if (labelWidth) {
        style = {
          ...style,
          width: `${labelWidth}px`
        }
      }
      return style
    },
    contentStyle({ labelWidth, contentAlign }) {
      let style = {
        textAlign: contentAlign
      }
      if (labelWidth) {
        style = {
          ...style,
          flex: 1
        }
      }
      return style
    }
  }
}
</script>

<style lang="less" scoped>
.ellipse {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.row-flex {
  &.vertical {
    .row-flex-col-left {
      margin-bottom: 2px;
    }
  }
}
.row-flex-col-left {
  // .ellipse();
  white-space: normal;
}
</style>
