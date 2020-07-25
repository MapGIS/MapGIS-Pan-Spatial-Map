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
        v-if="componentWidgets.length > maxIcon"
        round
        flat
        icon="more_vert"
        @click="showMoreDialog = !showMoreDialog"
      >
        <q-tooltip>更多</q-tooltip>
      </q-btn>

      <q-separator dark vertical />

      <q-btn dense flat no-wrap v-if="user">
        <q-avatar size="30px" icon="account_circle" />
        <q-icon name="arrow_drop_down" size="16px" />

        <q-menu
          auto-close
          fit
          anchor="bottom right"
          self="top right"
          :offset="[0, 10]"
        >
          <q-list dense style="min-width: 100px">
            <q-item
              v-for="item in user"
              :key="item.label"
              clickable
              @click="handleUserItem(item)"
            >
              <q-item-section>
                <q-avatar
                  dense
                  size="24px"
                  font-size="18px"
                  :icon="`img:${item.icon}`"
                  color="grey"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>

              <component
                :is="item.component"
                :ref="item.component"
                v-show="false"
                v-bind="item.props"
              />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        flat
        dense
        size="12px"
        v-if="about"
        :icon="`img:${about.icon}`"
        @click="handleAbout(about)"
      >
        <q-tooltip>{{ about.label }}</q-tooltip>
        <component
          :is="about.component"
          :ref="about.component"
          v-show="false"
          v-bind="mergeProps(getOwnProps(), about.props)"
        />
      </q-btn>
    </div>
    <q-dialog v-model="showMoreDialog" title="功能列表">
      <q-card class="more-widgets-container">
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
          <div class="row items-start content-center">
            <q-item
              class="cursor-pointer relative-positon"
              :class="[isCol3 ? 'col-3' : 'col', isCol3 ? 'q-px-none' : '']"
              v-ripple
              clickable
              v-for="widgetToBlock in componentWidgets.slice(maxIcon)"
              :key="widgetToBlock.id"
              :title="widgetToBlock.applicationLabel"
              @click="handleClick(widgetToBlock)"
            >
              <q-item-section>
                <div class="column items-center">
                  <q-icon
                    :name="`img:${widgetToBlock.applicationIcon}`"
                    style="font-size: 2em"
                  />
                  <q-item-label class="text-weight-light q-py-xs"
                    >{{ widgetToBlock.applicationLabel }}
                  </q-item-label>
                </div>
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

  @Prop()
  readonly user?: []

  @Prop()
  readonly about?: object

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

  private get isCol3() {
    return this.componentWidgets.slice(this.maxIcon).length > 3
  }

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    this.closeShowMore()
    if (!widgetToBlock.info.props || !widgetToBlock.info.props.noUI)
      this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
  }

  private closeShowMore() {
    this.showMoreDialog = false
  }

  private getOwnProps() {
    return {
      logo: this.logo,
      title: this.title,
      subtitle: this.subtitle
    }
  }

  private mergeProps(...args: Record<string, unknown>[]) {
    let props: Record<string, unknown> = {}
    args.forEach(arg => {
      props = { ...props, ...arg }
    })
    return props
  }

  private handleUserItem(item) {
    const { click } = this.$refs[item.component][0] as any
    if (typeof click === 'function') {
      this.$refs[item.component][0].click()
    }
  }

  private handleAbout(about) {
    const { click } = this.$refs[about.component] as any
    if (typeof click === 'function') {
      this.$refs[about.component].click()
    }
  }
}
</script>

<style lang="scss"></style>
