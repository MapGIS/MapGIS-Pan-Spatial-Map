<template>
  <a-tooltip :title="label" :overlay-style="{ zIndex }">
    <div class="mp-button" @click="onClick">
      <mp-icon :icon="icon" />
    </div>
  </a-tooltip>
</template>

<script>
export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpButton',
  props: {
    label: {
      type: String
    },
    icon: {
      type: String
    },
    zIndex: {
      type: Number,
      default: 2000
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
.mp-button {
  width: 32px;
  height: 32px;
  cursor: pointer;
  background: @base-bg-color;
  border-radius: 2px;
  line-height: 32px;
  font-size: 16px;
  box-shadow: 0px 1px 2px 0px @shadow-color;
  color: @text-color;
  text-align: center;
  &:hover {
    color: @primary-color;
  }
}
</style>
