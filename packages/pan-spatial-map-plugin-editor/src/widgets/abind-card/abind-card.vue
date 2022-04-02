<template>
  <div></div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpAbindCard' })
export default class MpAbindCard extends Mixins(WidgetMixin) {}
</script>
