<template>
  <a-row
    type="flex"
    :align="align"
    :justify="justify"
    :gutter="gutter"
    :class="rowFlexCls"
  >
    <a-col
      :span="labelSpan"
      :title="label"
      :style="labelStyle"
      :class="`${prefixCls}-col-left`"
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
import { CommonUtil } from '@mapgis/web-app-framework'

export default {
  name: 'MpRowFlex',
  props: {
    type: {
      type: String,
      default: 'horizontal',
      validator: function(value) {
        return CommonUtil.oneOf(value, ['horizontal', 'vertical'])
      }
    },
    align: {
      type: String,
      default: 'middle',
      validator: function(value) {
        return CommonUtil.oneOf(value, ['top', 'middle', 'bottom'])
      }
    },
    justify: {
      type: String,
      default: 'start',
      validator: function(value) {
        return CommonUtil.oneOf(value, [
          'start',
          'end',
          'center',
          'space-between',
          'space-around'
        ])
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
        return CommonUtil.oneOf(value, ['left', 'center', 'right'])
      }
    },
    contentAlign: {
      type: String,
      default: 'left',
      validator: function(value) {
        return CommonUtil.oneOf(value, ['left', 'center', 'right'])
      }
    }
  },
  data() {
    const prefixCls = 'mp-row-flex'
    return {
      prefixCls
    }
  },
  computed: {
    rowFlexCls({ prefixCls, type }) {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-${type}`]: !!type
        }
      ]
    },
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
.mp-row-flex {
  &-vertical {
    .row-flex-col-left {
      margin-bottom: 2px;
    }
  }
  &-col-left {
    // .ellipse();
    white-space: normal;
  }
}
</style>
