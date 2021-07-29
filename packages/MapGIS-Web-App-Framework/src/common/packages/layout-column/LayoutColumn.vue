<template>
  <a-layout class="mp-layout-column" :class="layoutCls">
    <a-layout-header
      class="mp-layout-column-header"
      :class="layoutHeaderCls"
      :style="layoutHeaderStyle"
    >
      <slot name="header"></slot>
    </a-layout-header>
    <a-layout-content
      class="mp-layout-column-content"
      :class="layoutContentCls"
      :style="layoutContentStyle"
    >
      <slot></slot>
    </a-layout-content>
  </a-layout>
</template>
<script>
import { ColorUtil } from '@mapgis/web-app-framework'

export default {
  name: 'MpLayoutColumn',
  props: {
    size: {
      type: String,
      default: 'default',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
      }
    },
    padding: {
      type: String,
      default: 'sm',
      validator(v) {
        return ['xs', 'sm', 'md', 'lg'].includes(v)
      }
    },
    boxShadow: {
      type: Boolean,
      default: false
    },
    headerBottomBorder: {
      type: Boolean,
      default: true
    },
    headerBg: {
      type: String,
      default: '#fff',
      validator: v =>
        ColorUtil.isHex(v) || ColorUtil.isRgb(v) || ColorUtil.isRgba(v)
    },
    headerCls: {
      type: String,
      default: ''
    },
    contentCls: {
      type: String,
      default: ''
    },
    contentMaxHeight: {
      type: Number,
      default: 320
    }
  },
  computed: {
    layoutCls({ size, padding, boxShadow }) {
      return [size, `padding-${padding}`, { 'box-shadow': boxShadow }]
    },
    layoutHeaderCls({ headerCls, headerBottomBorder }) {
      return {
        [headerCls]: true,
        'bottom-border': headerBottomBorder
      }
    },
    layoutHeaderStyle({ headerBg }) {
      return {
        background: headerBg
      }
    },
    layoutContentCls({ contentCls }) {
      return contentCls
    },
    layoutContentStyle({ contentMaxHeight }) {
      return {
        'max-height': `${contentMaxHeight}px`
      }
    }
  }
}
</script>
<style lang="less">
.mp-layout-column {
  display: flex;
  flex-flow: column nowrap;
  line-height: 32px;
  background: @white;
  /* 此处lineHeight和padding的设置应和主题配置保持一致，目前暂无less变量设置，先写死 */
  &.box-shadow {
    box-shadow: @box-shadow-base;
  }
  &.large {
    line-height: 40px;
  }
  &.small {
    line-height: 24px;
  }
  &.padding-xs {
    .mp-layout-column-header {
      padding: 0 4px;
    }
    .mp-layout-column-content {
      padding: 4px;
    }
  }
  &.padding-sm {
    .mp-layout-column-header {
      padding: 0 8px;
    }
    .mp-layout-column-content {
      padding: 8px;
    }
  }
  &.padding-md {
    .mp-layout-column-header {
      padding: 0 12px;
    }
    .mp-layout-column-content {
      padding: 12px;
    }
  }
  &-header {
    height: auto;
    line-height: inherit;
    padding: 0;
    &.bottom-border {
      border-bottom: 1px solid @border-color-base;
    }
  }
  &-content {
    flex: 1;
    overflow-y: auto;
  }
}
</style>
