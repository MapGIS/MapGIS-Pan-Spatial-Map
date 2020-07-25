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

    <q-space />

    <!-- menu -->
    <div class="q-px-md q-gutter-sm row items-center no-wrap">
      <q-btn
        flat
        dense
        v-for="{
          id: categoryId,
          categoryIcon,
          categoryLabel,
          children: categoryChildren
        } in menus"
        :key="categoryId"
        class="q-px-sm"
      >
        <q-icon
          left
          size="18px"
          v-if="$q.screen.gt.sm"
          :name="`img:${categoryIcon}`"
          class="q-pr-sm"
        />
        <div>{{ categoryLabel }}</div>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 10]">
          <q-list dense>
            <template
              v-for="{
                id: groupId,
                groupIcon,
                groupLabel,
                children: groupChildren
              } in categoryChildren"
            >
              <q-item
                v-if="groupLabel === ''"
                clickable
                @click="handleClick(groupChildren[0])"
                :key="groupId"
              >
                <q-item-section avatar>
                  <q-avatar
                    dense
                    size="24px"
                    font-size="18px"
                    :icon="`img:${groupChildren[0].applicationIcon}`"
                    color="grey"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  {{ groupChildren[0].applicationLabel }}
                </q-item-section>
              </q-item>
              <q-item v-else clickable :key="groupId">
                <q-item-section avatar>
                  <q-avatar
                    dense
                    size="24px"
                    font-size="18px"
                    :icon="`img:${groupIcon}`"
                    color="grey"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>{{ groupLabel }}</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu anchor="top right" self="top left">
                  <q-list>
                    <q-item
                      v-for="widgetToBlock in groupChildren"
                      :key="widgetToBlock.id"
                      dense
                      clickable
                      @click="handleClick(widgetToBlock)"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          dense
                          size="24px"
                          font-size="18px"
                          :icon="`img:${widgetToBlock.applicationIcon}`"
                          color="grey"
                          text-color="white"
                        />
                      </q-item-section>
                      <q-item-section>
                        {{ widgetToBlock.applicationLabel }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

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
            <q-item-section avatar>
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
    default: '全行业一张图应用平台'
  })
  readonly subtitle!: string

  @Prop()
  readonly user?: []

  @Prop()
  readonly about?: object

  private get logoUrl() {
    return `img:${this.logo}`
  }

  // 格式化之后的菜单项
  private get menus() {
    const menus: {
      id: string
      categoryIcon: string
      categoryLabel: string
      children: {
        id: symbol
        groupIcon: string
        groupLabel: string
        children: LayoutWidgetToBlock[]
      }[]
    }[] = []
    this.data.forEach(widgetToBlock => {
      const { props = {} } = widgetToBlock
      const {
        category_icon: categoryIcon = widgetToBlock.applicationIcon,
        category_label: categoryLabel = widgetToBlock.applicationLabel,
        group_icon: groupIcon = '',
        group_label: groupLabel = ''
      } = props as Record<string, any>
      // 一级类别菜单
      let menu = menus.find(
        item =>
          item.categoryIcon === categoryIcon &&
          item.categoryLabel === categoryLabel
      )
      if (!menu) {
        menu = {
          id: categoryIcon + categoryLabel,
          categoryIcon,
          categoryLabel,
          children: []
        }
        menus.push(menu)
      }
      // 二级分组菜单
      let menuGroup = menu.children.find(
        item =>
          groupLabel !== '' &&
          item.groupIcon === groupIcon &&
          item.groupLabel === groupLabel
      )
      if (!menuGroup) {
        menuGroup = {
          id: Symbol(''),
          groupIcon,
          groupLabel,
          children: []
        }
        menu.children.push(menuGroup)
      }
      menuGroup.children.push(widgetToBlock)
    })
    return menus
  }

  private handleClick(widgetToBlock: LayoutWidgetToBlock) {
    if (!widgetToBlock.info.props || !widgetToBlock.info.props.noUI)
      this.closeAll()
    this.toggleWidget(widgetToBlock.info)
  }

  private closeAll() {
    this.data.filter(x => x.info.show).forEach(x => this.toggleWidget(x.info))
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

<style lang="scss">
.menu-box {
  &:hover {
    background: #0a81c3;
  }
}
</style>
