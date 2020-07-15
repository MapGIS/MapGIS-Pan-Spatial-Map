<template>
  <q-toolbar class="bg-title text-title">
    <q-toolbar-title shrink class="row items-center no-wrap">
      <q-icon :name="logoUrl" size="38px" />
      <span v-if="$q.screen.gt.sm" class="q-ml-sm">{{ title }}</span>
    </q-toolbar-title>
    <div
      v-if="$q.screen.gt.sm"
      class="q-ml-xs q-gutter-md text-title row items-center no-wrap"
    >
      <q-btn
        flat
        dense
        v-for="widgetToBlock in linkWidgets"
        :key="widgetToBlock.id"
        @click="handleClick(widgetToBlock)"
        :label="widgetToBlock.applicationLabel"
      >
      </q-btn>
    </div>

    <q-space />

    <div class="q-pl-sm q-gutter-sm row items-center no-wrap">
      <q-btn
        round
        flat
        dense
        v-for="widgetToBlock in componentWidgets.slice(0, maxIcon)"
        :key="widgetToBlock.id"
        :icon="`img:${widgetToBlock.applicationIcon}`"
        @click="handleClick(widgetToBlock)"
      >
        <q-tooltip>{{ widgetToBlock.applicationLabel }}</q-tooltip>
      </q-btn>
      <q-btn
        round
        flat
        icon="more_vert"
        @click="showMoreDialog = !showMoreDialog"
      >
        <q-tooltip>更多</q-tooltip>
      </q-btn>
    </div>
    <q-dialog v-model="showMoreDialog" title="功能列表">
      <q-card>
        <q-item class="bg-title text-title">
          <q-item-section>
            <div class="text-h6">
              功能列表
              <q-btn
                round
                flat
                dense
                icon="close"
                class="float-right"
                v-close-popup
              ></q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-card-section class="bg-grey-5 text-container">
          <div class="row wrap items-center">
            <q-item
              class="column col-3 cursor-pointer relative-positon"
              v-ripple
              clickable
              v-for="widgetToBlock in componentWidgets.slice(maxIcon)"
              :key="widgetToBlock.id"
              :title="widgetToBlock.applicationLabel"
              @click="handleClick(widgetToBlock)"
            >
              <q-item-section class="text-center items-center">
                <q-icon
                  :name="`img:${widgetToBlock.applicationIcon}`"
                  style="font-size: 3em"
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
    </q-dialog>
  </q-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpStandardNavbar' })
export default class MpStandardNavbar extends Vue {
  @Prop(Function) readonly toggleWidget!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  @Prop({
    type: String,
    required: false,
    default: 'statics/app-logo-128x128.png'
  })
  readonly logo!: string

  @Prop({
    type: String,
    required: false,
    default: 'MapGIS全空间一张图'
  })
  readonly title!: string

  @Prop({
    type: Number,
    required: false,
    default: 3,
    validator(val: number) {
      return val >= 0
    }
  })
  readonly icons!: number

  private showMoreDialog = false

  private maxIcon!: number

  private created() {
    if (this.isMobile) {
      this.maxIcon = 0
    } else {
      this.maxIcon = this.icons
    }
  }

  private get isMobile() {
    return this.$q.platform.is.mobile === true
  }

  private get logoUrl() {
    return `img:${this.logo}`
  }

  private get linkWidgets() {
    return this.data.filter(widgetToBlock => {
      return widgetToBlock.info.info.type === 'Link'
    })
  }

  private get componentWidgets() {
    return this.data.filter(widgetToBlock => {
      return widgetToBlock.info.info.type === 'Component'
    })
  }

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    this.closeShowMore()
    this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }

  private closeShowMore() {
    this.showMoreDialog = false
  }
}
</script>
