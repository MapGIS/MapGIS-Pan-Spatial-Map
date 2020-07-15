<template>
  <div class="classic-toolbar-container">
    <q-page-sticky
      position="top-right"
      :offset="[10, 10]"
      class="rounded-borders"
    >
      <div
        class="bg-title text-title row items-center no-wrap rounded-borders "
      >
        <q-toolbar
          class="shadow-2 col q-px-none rounded-borders"
          style="min-height: 36px; height: 36px"
        >
          <div class="row" v-show="toolbarVisible">
            <template
              v-for="widgetToBlock in componentWidgets.slice(0, maxIcon)"
            >
              <q-btn
                flat
                dense
                :key="widgetToBlock.id"
                @click="handleClick(widgetToBlock)"
                class="q-mx-sm"
              >
                <q-icon
                  left
                  size="18px"
                  :name="`img:${widgetToBlock.applicationIcon}`"
                />
                <div>{{ widgetToBlock.applicationLabel }}</div>
              </q-btn>
              <q-separator dark vertical :key="`${widgetToBlock.id} + '0'`" />
            </template>

            <q-btn round dense flat icon="more_vert" @click="handleShowMore">
              <q-tooltip>更多</q-tooltip>
            </q-btn>
          </div>
          <q-btn round dense flat @click="toolbarVisible = !toolbarVisible">
            <q-avatar icon="img:statics/plugins/layout/images/expand.svg" />
          </q-btn>
        </q-toolbar>
      </div>
    </q-page-sticky>
    <mp-widget-panel
      position="top-right"
      :offset="[10, 60]"
      :bottom="panelBottomToView"
      :width="panelWidth"
      :shrinkAction="false"
      :fullScreenAction="false"
      title="功能列表"
      :visible.sync="showMore"
    >
      <q-list>
        <template v-for="{ group, children } in items">
          <q-expansion-item
            expand-separator
            :key="group"
            :label="group"
            header-class="bg-grey-5 text-center"
            expand-icon-class="text-white"
          >
            <q-card>
              <q-card-section class="bg-grey-4 text-container">
                <div class="row wrap items-center">
                  <q-item
                    class="column col-6 cursor-pointer relative-positon"
                    v-ripple
                    clickable
                    v-for="widgetToBlock in children"
                    :key="widgetToBlock.id"
                    :title="widgetToBlock.applicationLabel"
                    @click="handleClick(widgetToBlock)"
                  >
                    <q-item-section class="text-center items-center">
                      <q-icon
                        :name="`img:${widgetToBlock.applicationIcon}`"
                        style="font-size: 2em"
                      />
                      <q-item-label
                        v-if="$q.screen.gt.sm"
                        class="text-weight-light q-my-xs"
                        >{{ widgetToBlock.applicationLabel }}</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
      </q-list>
    </mp-widget-panel>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpClassicToolbar' })
export default class MpClassicToolbar extends Vue {
  @Prop(Function) readonly toggleWidget!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  @Prop({
    type: Number,
    required: false,
    default: 3,
    validator(val: number) {
      return val >= 0
    }
  })
  readonly icons!: number

  private toolbarVisible = true

  private showMore = false

  private maxIcon!: number

  private panelWidth = 240

  private panelBottomToView = 36

  created() {
    this.maxIcon = this.icons
  }

  private get componentWidgets() {
    return this.data.filter(widgetToBlock => {
      return widgetToBlock.info.info.type === 'Component'
    })
  }

  // 格式化之后的项
  private get items() {
    const widgets = this.componentWidgets.slice(this.maxIcon)
    const items: {
      group: string
      children: LayoutWidgetToBlock[]
    }[] = []
    widgets.forEach(widgetToBlock => {
      const { props = {} } = widgetToBlock
      const { group = 'default' } = props as Record<string, any>
      let item = items.find(item => item.group === group)
      if (!item) {
        item = {
          group,
          children: []
        }
        items.push(item)
      }
      item.children.push(widgetToBlock)
    })
    return items
  }

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    this.showMore = false
    this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }

  private handleShowMore() {
    this.closeAll()
    this.showMore = !this.showMore
  }
}
</script>

<style lang="scss"></style>
