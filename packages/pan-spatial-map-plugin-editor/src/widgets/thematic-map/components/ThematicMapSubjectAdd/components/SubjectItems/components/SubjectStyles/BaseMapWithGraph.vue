<template>
  <!-- 统计专题图 -->
  <div class="base-map-with-graph">
    <a-empty :image-style="emptyImageStyle" description="暂无配置" />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class BaseMapWithGraph extends Vue {
  get emptyImageStyle() {
    return {
      height: '50px'
    }
  }
}
</script>
<style lang="less" scoped>
.base-map-with-graph {
  padding: 12px 0;
  .ant-empty {
    font-size: @font-size-sm;
  }
}
</style>
