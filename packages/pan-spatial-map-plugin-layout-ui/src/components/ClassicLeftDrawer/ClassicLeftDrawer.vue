<template>
  <div class="classic-left-drawer-container fit">
    <div class="bg-title text-title fit column">
      <div
        v-for="{ id, icon, label } in menus"
        :key="id"
        class="col-auto menu-box items-center cursor-pointer"
        :class="{ 'bg-primary': active === id }"
        @click="active = id"
        :title="label"
      >
        <q-btn
          flat
          dense
          stack
          no-caps
          class="full-width"
          style="font-size: 12px"
        >
          <q-icon size="24px" :name="`img:${icon}`" class="q-mt-md q-mb-sm" />
          <div class="ellipsis">{{ label }}</div>
        </q-btn>
      </div>
    </div>
    <template v-if="currentMenu">
      <mp-widget-panel
        position="left"
        visible
        expand
        :shrinkAction="false"
        :title="currentMenu.label"
        :width="currentMenu.width"
        class="classic-left-drawer-container-second"
        @update:visible="active = ''"
      >
        <!-- 只有一个分组视为不分组 -->
        <template v-if="currentMenu.children.length === 1">
          <!-- 只有一个组件直接展示组件 -->
          <template v-if="currentMenu.children[0].children.length === 1">
            <component
              :is="currentMenu.children[0].children[0].info.info.component"
              v-bind="
                mergeProps(
                  currentMenu.children[0].children[0].info.info.props,
                  currentMenu.children[0].children[0].info.props
                )
              "
            />
          </template>
          <!-- 多个组件则列出来 -->
          <template v-else>
            <q-list class="fit">
              <template
                v-for="{
                  id,
                  applicationIcon,
                  applicationLabel,
                  info
                } in currentMenu.children[0].children"
              >
                <q-expansion-item
                  expand-separator
                  :key="id"
                  group="select"
                  :icon="`img:${applicationIcon}`"
                  :label="applicationLabel"
                  header-class="bg-grey-5"
                  expand-icon-class="text-white"
                >
                  <component
                    :is="info.info.component"
                    v-bind="mergeProps(info.info.props, info.props)"
                  />
                </q-expansion-item>
              </template>
            </q-list>
          </template>
        </template>
        <!-- 有多个分组的情况 -->
        <template v-else>
          <q-list bordered class="fit">
            <template v-for="{ group, children } in currentMenu.children">
              <q-expansion-item :key="group" group="select" :label="group">
                <div class="row fit">
                  <!-- 分组列表项 -->
                  <div
                    v-for="{
                      id,
                      applicationIcon,
                      applicationLabel
                    } in children"
                    :key="id"
                    class="col-6 column items-center cursor-pointer"
                  >
                    <q-icon
                      :name="`img:${applicationIcon}`"
                      style="font-size: 60px"
                    />
                    <label>{{ applicationLabel }}</label>
                  </div>
                </div>
              </q-expansion-item>
              <q-separator :key="`${group}-separator`" />
            </template>
          </q-list>
        </template>
      </mp-widget-panel>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { LayoutWidgetToBlock } from '../types/widget-to-block'

@Component({
  name: 'MpClassicLeftDrawer',
  filters: {}
})
export default class MpClassicLeftDrawer extends Vue {
  @Prop(Function) readonly changeWidth!: Function

  @Prop(Array) readonly data!: LayoutWidgetToBlock[]

  // 当前激活的菜单
  private active = ''

  created() {
    this.changeWidth(60)
  }

  // 格式化之后的菜单项
  private get menus() {
    const menus: {
      id: string
      icon: string
      label: string
      width: number
      children: { group: string; children: LayoutWidgetToBlock[] }[]
    }[] = []
    this.data.forEach(widgetToBlock => {
      const { props = {} } = widgetToBlock
      const {
        category_icon: icon = widgetToBlock.applicationIcon,
        category_label: label = widgetToBlock.applicationLabel,
        group = 'default',
        width = 240
      } = props as Record<string, any>
      // 一级菜单
      let firstMenu = menus.find(
        menu => menu.icon === icon && menu.label === label
      )
      if (!firstMenu) {
        firstMenu = {
          id: icon + label,
          icon,
          label,
          width,
          children: []
        }
        menus.push(firstMenu)
      }
      // 二级菜单分组
      let menuGroup = firstMenu.children.find(item => item.group === group)
      if (!menuGroup) {
        menuGroup = {
          group,
          children: []
        }
        firstMenu.children.push(menuGroup)
      }
      menuGroup.children.push(widgetToBlock)
    })
    return menus
  }

  // 当前激活的菜单
  private get currentMenu() {
    return this.menus.find(x => x.id === this.active)
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

<style lang="scss">
.classic-left-drawer-container {
  .menu-box {
    text-align: center;

    &:hover {
      background: $blue-6;
    }
  }
  &-second {
    top: 0 !important;
    left: 0 !important;
  }
}
</style>
