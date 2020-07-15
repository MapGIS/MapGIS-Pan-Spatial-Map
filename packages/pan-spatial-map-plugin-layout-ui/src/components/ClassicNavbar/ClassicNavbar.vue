<template>
  <q-toolbar class="bg-title text-title">
    <q-toolbar-title shrink class="row items-center no-wrap">
      <!-- logo -->
      <q-icon :name="logoUrl" size="38px" />
      <!-- title -->
      <span v-if="$q.screen.gt.sm" class="q-ml-sm">{{ title }}</span>
      <span v-if="$q.screen.gt.sm" class="q-ml-sm text-subtitle1">
        {{ subtitle }}
      </span>
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
    <!-- menu -->
    <div class="q-pl-sm q-gutter-sm row items-center no-wrap">
      <q-btn
        flat
        dense
        v-for="widgetToBlock in componentWidgets"
        :key="widgetToBlock.id"
        @click="handleClick(widgetToBlock)"
      >
        <q-icon left :name="`img:${widgetToBlock.applicationIcon}`" />
        <div v-if="$q.screen.gt.sm">{{ widgetToBlock.applicationLabel }}</div>
        <q-tooltip v-else>{{ widgetToBlock.applicationLabel }}</q-tooltip>
      </q-btn>
    </div>
  </q-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({ name: 'MpClassicNavbar' })
export default class MpClassicNavbar extends Vue {
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
    type: String,
    required: false,
    default: '全空间专业GIS应用框架'
  })
  readonly subtitle!: string

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
    this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }
}
</script>

<style lang="scss">
.menu-box {
  &:hover {
    background: #0a81c3;
  }
}
</style>
