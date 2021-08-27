<template>
  <a-tooltip :key="title" placement="bottom" :title="title">
    <div
      v-if="icon.startsWith('<svg')"
      :class="{
        'mp-toolbar-command': true,
        active: active,
        disabled: disabled,
        'hover-bordered': hoverBordered,
        [`mp-toolbar-command-${size}`]: !!size
      }"
      class="mp-toolbar-command"
      @click="onClick"
    >
      <mp-icon :icon="icon" />
    </div>
    <a-icon
      v-else
      :class="{
        'mp-toolbar-command': true,
        active: active,
        disabled: disabled,
        'hover-bordered': hoverBordered,
        [`mp-toolbar-command-${size}`]: !!size
      }"
      @click="onClick"
      :type="icon"
    />
  </a-tooltip>
</template>

<script>
import { CommonUtil } from '@mapgis/web-app-framework'

export default {
  name: 'MpToolbarCommand',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    hoverBordered: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      validator(v) {
        return CommonUtil.oneOf(v, ['large', 'small'])
      }
    }
  },
  methods: {
    onClick() {
      this.$emit('click')
    }
  }
}
</script>

<style lang="less" scoped>
.mp-toolbar-command {
  font-size: 14px;
  color: @text-color;
  width: 27px;
  margin: 0 6px;
  padding-top: 2px;
  text-align: center;
  cursor: pointer;
  &.anticon {
    height: 27px;
    line-height: 27px;
  }
  &-large {
    width: 34px;
  }
  &-large.anticon {
    height: 34px;
    line-height: 34px;
  }
  &-small {
    width: 20px;
  }
  &-small.anticon {
    height: 20px;
    line-height: 20px;
  }
  &:hover {
    color: @primary-color;
  }
  &.hover-bordered {
    &:hover {
      border: 1px solid @border-color;
    }
  }
  &.active {
    color: @primary-color;
  }
  &.disabled {
    cursor: not-allowed;
    color: @disabled-color;
    pointer-events: none;
  }
}
</style>
