<template>
  <div
    :class="{
      'mp-toolbar-command-group': true,
      'remove-first-command-left-margin': removeFirstCommandLeftMargin,
      'remove-last-command-right-margin': removeLastCommandRightMargin
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpToolbarCommandGroup',
  props: {
    removeFirstCommandLeftMargin: {
      type: Boolean,
      default: true
    },
    removeLastCommandRightMargin: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="less" scoped>
.mp-toolbar-command-group {
  display: flex;
  align-items: center;
  &.remove-first-command-left-margin {
    & > .mp-toolbar-command {
      &:first-child {
        margin-left: 0;
      }
    }
  }
  &.remove-last-command-right-margin {
    & > .mp-toolbar-command {
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
