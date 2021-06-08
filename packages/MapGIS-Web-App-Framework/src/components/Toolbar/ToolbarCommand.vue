<template>
  <a-tooltip :key="title" placement="bottom" :title="title">
    <div
      v-if="icon.startsWith('<svg')"
      :class="{
        'mp-toolbar-command': true,
        active: active,
        disabled: disabled,
        'hover-bordered': hoverBordered
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
        'hover-bordered': hoverBordered
      }"
      @click="onClick"
      :type="icon"
    />
  </a-tooltip>
</template>

<script>
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
  text-align: center;
  cursor: pointer;
  &.anticon {
    height: 27px;
    padding-top: 6px;
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
