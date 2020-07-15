<template>
  <q-page :style-fn="styleFn">
    <component
      :is="map.component"
      :page-height="pageHeight"
      v-bind="map.props"
    />
  </q-page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpMainContainer' })
export default class MpMainContainer extends Vue {
  @Prop(Function) readonly toggleWidget!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  @Prop({
    type: Object,
    required: false,
    default() {
      return {
        component: 'MpMapContainer',
        props: {
          is2D: true
        }
      }
    }
  })
  readonly map!: object

  private pageHeight = ''

  private styleFn(offset: number) {
    const pageHeight = offset ? `calc(100vh - ${offset}px)` : '100vh'
    this.pageHeight = pageHeight
    return { maxHeight: pageHeight }
  }
}
</script>
