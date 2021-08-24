<template>
  <a-card :size="size" :bordered="bordered" :loading="loading" :class="cardCls">
    <slot name="title">
      <span slot="title">{{ title }}</span>
    </slot>
    <template #extra>
      <slot name="extra">
        <mp-toolbar-command-group>
          <mp-toolbar-command
            v-for="item in tools"
            :key="item.title"
            :title="item.title"
            :icon="item.icon"
            :size="size"
            @click="item.method()"
          />
        </mp-toolbar-command-group>
      </slot>
    </template>
    <slot></slot>
  </a-card>
</template>
<script>
import { CommonUtil } from '@mapgis/web-app-framework'

const prefixCls = 'mp-card'

export default {
  name: 'MpCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    tools: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      validator(v) {
        return CommonUtil.oneOf(v, ['large', 'small'])
      }
    },
    boxShadow: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardCls({ size, boxShadow }) {
      return [
        prefixCls,
        {
          [`${prefixCls}-box-shadow`]: !!boxShadow
        }
      ]
    }
  }
}
</script>
<style lang="less">
.mp-card {
  @height-lg: 36px;
  @height-md: 30px;
  @height-sm: 24px;
  @padding-lg: 12px;
  @padding-md: 8px;
  @padding-sm: 4px;
  &.ant-card {
    .ant-card-head {
      font-size: 14px;
      min-height: @height-md;
      line-height: @height-md;
      padding: 0 @padding-md;

      .ant-card-head-title,
      .ant-card-extra {
        padding: 0;
        color: @text-color;
      }
    }
    .ant-card-body {
      padding: @padding-md;
    }
    &.ant-card-small {
      .ant-card-head {
        margin-bottom: 4px;
        min-height: @height-sm;
        line-height: @height-sm;
        padding: 0 @padding-sm;
      }
      .ant-card-body {
        padding: @padding-sm;
      }
    }
    &.ant-card-large {
      .ant-card-head {
        padding: 0 @padding-lg;
        min-height: @height-lg;
        line-height: @height-lg;
      }
      .ant-card-body {
        padding: @padding-lg;
      }
    }
  }

  &-box-shadow {
    box-shadow: @box-shadow-base;
  }
}
</style>
