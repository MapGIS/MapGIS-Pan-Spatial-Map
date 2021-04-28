<template>
  <div></div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

interface IVueExtends {
  [k: string]: any
}

@Component
export default class BaseMapWithGraph extends Mixins<IVueExtends>(
  WidgetMixin
) {}
</script>
<style lang="less" scoped></style>
