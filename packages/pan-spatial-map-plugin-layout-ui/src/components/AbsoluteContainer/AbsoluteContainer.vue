<template>
  <div class="absolute-container">
    <q-page-sticky
      v-for="sticky in items"
      :key="sticky.id"
      :position="sticky.position"
      :offset="sticky.offset"
    >
      <div class="column group bg-title text-title">
        <q-item
          class="row cursor-pointer group-item relative-position"
          v-for="item in sticky.children"
          :key="item.widgetToBlock.id"
          v-ripple
          @click="handleClick(item.widgetToBlock)"
          clickable
        >
          <q-icon :name="`img:${item.props.icon}`" :title="item.props.label" />
        </q-item>
      </div>
    </q-page-sticky>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpAbsoluteContainer' })
export default class MpAbsoluteContainer extends Vue {
  @Prop(Function) readonly toggleWidget!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  private get items() {
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

    const totalItems = positions.map(position => {
      return this.getItems(position)
    })

    return [].concat(...totalItems)
  }

  private getItems(position: string) {
    const result: unknown[] = []

    const items = this.data
      .filter(
        widgetToBlock =>
          widgetToBlock.props && widgetToBlock.props.position === position
      )
      .map(widgetToBlock => ({
        props: {
          icon:
            (widgetToBlock.props && widgetToBlock.props.icon) ||
            widgetToBlock.applicationIcon,
          label:
            (widgetToBlock.props && widgetToBlock.props.label) ||
            widgetToBlock.applicationLabel,
          group:
            (widgetToBlock.props && widgetToBlock.props.group) || Math.random()
        },
        widgetToBlock
      }))

    Array.from(
      new Set(items.map(widgetToBlock => widgetToBlock.props.group))
    ).forEach(group => {
      const children = items.filter(
        widgetToBlock =>
          widgetToBlock.props && widgetToBlock.props.group === group
      )
      result.push({
        id: Math.random().toString(),
        position,
        offset: children[0].widgetToBlock.props.offset,
        children
      })
    })

    return result
  }

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

<style lang="scss">
.absolute-container {
  .group {
    border-radius: 5px;
    font-size: 20px;
    padding: 1px;
  }

  .group-item {
    padding: 5px;
  }

  .q-item {
    min-height: 0px;
  }
}
</style>
