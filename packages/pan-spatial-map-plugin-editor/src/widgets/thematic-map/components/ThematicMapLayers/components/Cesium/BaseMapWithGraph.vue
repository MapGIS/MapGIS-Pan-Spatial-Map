<template>
  <span />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'
// todo 后期有可能支持

@Component
export default class CesiumBaseMapWithGraph extends Mixins(BaseMinxin) {
  showLayer() {
    this.$message.warning('三维模式下暂不支持统计专题图')
  }
}
</script>
