<template>
  <div class="collapse-indicator-wrapper">
    <span
      :class="['indicator', direction]"
      :style="{ 'z-index': zIndex }"
      @click="onClick"
    >
      <a-icon :type="iconType" />
    </span>
  </div>
</template>

<script>
export default {
  name: 'MpCollapseButton',
  props: {
    direction: {
      validator(value) {
        const allowedValues = ['left', 'right', 'top', 'bottom']
        return typeof value === 'string' && allowedValues.includes(value)
      },
      default: 'right'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {}
  },
  computed: {
    // 同步属性visible
    syncedCollapsed: {
      get() {
        return this.collapsed
      },
      set(value) {
        this.$emit('update:collapsed', value)
      }
    },
    iconType() {
      let icon
      switch (this.direction) {
        case 'left':
          icon = `vertical-${this.syncedCollapsed ? 'right' : 'left'}`
          break
        case 'right':
          icon = `vertical-${this.syncedCollapsed ? 'left' : 'right'}`
          break
        case 'top':
          icon = `${this.syncedCollapsed ? 'up' : 'down'}`
          break
        default:
          icon = `${this.syncedCollapsed ? 'down' : 'up'}`
          break
      }
      return icon
    }
  },
  methods: {
    onClick() {
      this.syncedCollapsed = !this.syncedCollapsed
    }
  }
}
</script>

<style lang="less" scoped>
.collapse-indicator-wrapper {
  position: relative;
  .indicator {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: @base-bg-color;
    border: 1px solid @border-color;
    cursor: pointer;
    &.left {
      height: 64px;
      top: calc(50% - 32px);
      border-radius: 4px 0 0 4px;
      border-right-color: transparent;
    }
    &.right {
      height: 64px;
      top: calc(50% - 32px);
      border-radius: 0 4px 4px 0;
      border-left-color: transparent;
    }
    &.top {
      width: 64px;
      left: calc(50% - 32px);
      bottom: 0;
      border-radius: 4px 4px 0 0;
      border-bottom-color: transparent;
    }
    &.bottom {
      width: 64px;
      left: calc(50% - 32px);
      border-radius: 0 0 4px 4px;
      border-top-color: transparent;
    }
  }

  &:hover {
    .indicator {
      color: white;
      background: @primary-color;
    }
  }
}
</style>
