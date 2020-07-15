<template>
  <component :is="component">
    <template v-for="slot in slots" v-slot:[slot[0].slotName]="slotProps">
      <template v-for="widgetToBlock in slot">
        <component
          :key="widgetToBlock.name"
          :is="widgetToBlock.component"
          v-bind="
            mergeProps(
              slotProps,
              widgetToBlock.props,
              getOwnProps(widgetToBlock.name),
              getScaffoldProps()
            )
          "
        />
      </template>
    </template>

    <template v-for="widget in hasUIWidgets">
      <keep-alive :key="widget.id">
        <mp-widget-panel
          :title="widget.info.label"
          :visible="widget.show"
          v-if="widget.show"
          v-bind="widget.position"
          @update:visible="toggleWidget(widget)"
        >
          <template v-slot:default="slotProps">
            <component
              :is="widget.info.component"
              v-bind="mergeProps(slotProps, widget.info.props, widget.props)"
            />
          </template>
        </mp-widget-panel>
      </keep-alive>
    </template>

    <template v-for="widget in noUIWidgets">
      <component
        :is="widget.info.component"
        :key="widget.id"
        :ref="widget.id"
        v-show="false"
        v-bind="mergeProps(widget.info.props, widget.props)"
      />
    </template>
  </component>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator'
import VueRouter from 'vue-router'
import { Store } from 'vuex'
import { IScaffold, ILayoutBlock } from '../types/layout'
import { LayoutWidget } from '../types/widget'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpDynamicLayoutHelper' })
export default class MpDynamicLayoutHelper extends Vue {
  $router!: VueRouter

  $store!: Store<unknown>

  @Prop(String) private readonly component!: string

  @Prop() private readonly scaffold!: IScaffold

  @Prop(Array) private readonly blocks!: ILayoutBlock[]

  @Prop(Array) private readonly widgets!: LayoutWidget[]

  @Prop(Array) private readonly widgetToBlocks!: LayoutWidgetToBlock[]

  @Prop(Function) private readonly toggleWidgetFn!: (
    widget: LayoutWidget
  ) => Promise<void>

  private get slots() {
    const slotNames = Array.from(new Set(this.blocks.map(x => x.slotName)))
    return slotNames.map(slotName => {
      return this.blocks.filter(x => x.slotName === slotName)
    })
  }

  public get hasUIWidgets() {
    return this.widgets.filter(widget => {
      const { info } = widget
      return info.type === 'Component' && (!widget.props || !widget.props.noUI)
    })
  }

  public get noUIWidgets() {
    return this.widgets.filter(widget => {
      const { info } = widget
      return info.type === 'Component' && widget.props && widget.props.noUI
    })
  }

  private get toggleWidget() {
    return (widget: LayoutWidget) => {
      const { info } = widget
      if (info.type === 'Component') {
        if (widget.props && widget.props.noUI) {
          const { click } = this.$refs[widget.id][0] as any
          if (typeof click === 'function') {
            this.$refs[widget.id][0].click()
          }
        } else {
          this.toggleWidgetFn(widget)
        }
      } else if (info.to) {
        if (info.to.startsWith('http')) {
          window.open(info.to)
        } else {
          this.$router.push(info.to)
        }
      }
    }
  }

  private getOwnProps(block: string) {
    return {
      toggleWidget: this.toggleWidget,
      data: this.widgetToBlocks.filter(x => x.block === block)
    }
  }

  private getScaffoldProps() {
    return {
      scaffold: this.scaffold
    }
  }

  private mergeProps(...args: Record<string, unknown>[]) {
    let props: Record<string, unknown> = {}
    args.forEach(arg => {
      props = { ...props, ...arg }
    })
    return props
  }
}
</script>
