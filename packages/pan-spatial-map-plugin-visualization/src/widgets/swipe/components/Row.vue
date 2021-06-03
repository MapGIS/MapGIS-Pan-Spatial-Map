<template functinal>
  <a-row>
    <a-col> {{ title }}图层： </a-col>
    <a-col>
      <slot />
    </a-col>
  </a-row>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Row extends Vue {
  @Prop() readonly title?: string
}
</script>
<style lang="less" scoped>
/deep/.ant-select {
  width: 100%;
}
</style>
