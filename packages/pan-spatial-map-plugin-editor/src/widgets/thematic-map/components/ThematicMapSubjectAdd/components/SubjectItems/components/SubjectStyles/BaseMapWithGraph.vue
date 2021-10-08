<template>
  <!-- 统计专题图 -->
  <div class="base-map-with-graph">
    <mapgis-ui-empty description="暂无配置" />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class BaseMapWithGraph extends Vue {}
</script>
<style lang="less" scoped></style>
