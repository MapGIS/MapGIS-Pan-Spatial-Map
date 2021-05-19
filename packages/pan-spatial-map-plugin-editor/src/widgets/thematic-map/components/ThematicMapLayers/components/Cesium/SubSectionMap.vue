<template>
  <!-- 分段专题图图层 -->
  <div></div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import CesiumMinxin from '../../mixins/cesium'

@Component
export default class CesiumSubSectionMap extends Mixins(
  CesiumMinxin
) {}
</script>
<style lang="less" scoped></style>
