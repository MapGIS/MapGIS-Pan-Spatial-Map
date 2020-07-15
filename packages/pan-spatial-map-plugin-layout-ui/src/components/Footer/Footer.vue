<template>
  <component :is="resultSet.component" v-if="visible" @open="openFooter">
    <q-btn
      v-for="widgetToBlock in data"
      :key="widgetToBlock.id"
      flat
      :label="widgetToBlock.applicationLabel"
      :icon="widgetToBlock.applicationIcon"
      @click="handleClick(widgetToBlock)"
    />
  </component>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpFooter' })
export default class MpFooter extends Mixins(MapDocumentMixin) {
  @Prop(Function) openFooter!: Function

  @Prop(Function) closeFooter!: Function

  @Prop(Function) readonly toggleWidget!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  @Prop({
    type: Object,
    required: false,
    default() {
      return {
        component: 'MpResultSet',
        props: {}
      }
    }
  })
  readonly resultSet!: object

  private visible = false

  @Watch('map', { immediate: true })
  mapLoaded(map: unknown) {
    if (map) {
      this.visible = true
    }
  }

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }
}
</script>
