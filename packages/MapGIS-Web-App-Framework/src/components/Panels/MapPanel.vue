<template>
  <div class="mp-map-panel"></div>
</template>

<script>
export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpMapPanel',
  props: ['panel'],
  mounted() {
    this.$el.appendChild(this.panel.content)
  }
}
</script>

<style lang="less" scoped></style>
