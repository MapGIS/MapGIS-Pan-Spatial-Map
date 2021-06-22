<template>
  <div class="mp-toolbar-space">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MpToolbarSpace'
}
</script>

<style lang="less" scoped>
.mp-toolbar-space {
  flex-grow: 1;
}
</style>
