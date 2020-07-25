<template>
  <component :is="resultSet.component" @open="openFooter">
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpFooter' })
export default class MpFooter extends Vue {
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

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    if (!widgetToBlock.info.props || !widgetToBlock.info.props.noUI)
      this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }
}
</script>
