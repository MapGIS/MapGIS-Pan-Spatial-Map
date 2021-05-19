<template>
  <div></div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import CesiumMinxin from '../../mixins/cesium'

@Component
export default class CesiumLabel extends Mixins(
  CesiumMinxin
) {}
</script>
<style lang="less" scoped></style>
