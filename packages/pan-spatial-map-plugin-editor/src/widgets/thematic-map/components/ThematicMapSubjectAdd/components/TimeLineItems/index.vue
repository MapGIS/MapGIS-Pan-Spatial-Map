<template>
  <div></div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class TimeLineItems extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
