<template>
  <a-layout v-if="initialized" class="mp-app-builder-wrapper">
    <a-layout-header class="builder-header-wrapper">
      <div class="header-wide">
        <div class="header-left">
          <div class="logo">
            <mp-icon :icon="logo" class="icon" />
            <h1>MapGIS WebAppBuilder</h1>
          </div>
        </div>
        <div class="header-content"></div>
        <div class="header-right">
          <a-button class="header-item" type="primary" @click="onJSONClick">
            JSON
          </a-button>
          <a-button class="header-item" type="primary" @click="onSaveClick">
            保存
          </a-button>
        </div>
      </div>
      <a-modal
        v-model="jsonVisible"
        title="应用详细配置"
        :footer="null"
        :dialog-style="{ top: '0' }"
        width="90%"
      >
        <app-json-config :app-config="appConfig"></app-json-config>
      </a-modal>
    </a-layout-header>
    <a-layout>
      <a-layout-sider class="sidebar-left-wrapper" width="auto">
        <div class="sidebar-menu">
          <div class="sidebar-menu-top">
            <div
              v-for="panel in panels"
              :key="panel.key"
              :class="['panel-tab', { active: panel.key === panelTab }]"
              @click="onPanelClick(panel.key)"
            >
              <a-icon :type="panel.icon" class="tab-icon" />
              <div class="tab-text">{{ panel.title }}</div>
            </div>
          </div>
        </div>
        <div
          class="sidebar-content"
          v-for="panel in panels"
          :key="panel.key"
          v-show="panel.key === panelTab"
        >
          <component
            :is="panel.component"
            :app-config="appConfig"
            :themes="themes"
            :widgets="widgets"
            @theme-change="$emit('theme-change', $event)"
          >
          </component>
        </div>
      </a-layout-sider>
      <a-layout-content>
        <mp-app-loader
          :application="application"
          :design-time="true"
          style="height: calc(100vh - 48px)"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import { AppManager } from '../../managers'

import ThemeConfig from './ThemeConfig'
import Attribute from './Attribute'
import WidgetConfig from './WidgetConfig'
import AppJsonConfig from './AppJsonConfig'

export default {
  name: 'MpAppBuilder',
  components: { ThemeConfig, Attribute, WidgetConfig, AppJsonConfig },
  props: {
    baseAPI: String,
    appConfigPath: String,
    appAssetsPath: String,
    themes: Array,
    widgets: Array
  },
  data() {
    return {
      logo:
        '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><style/></defs><path d="M832 128c19.2 0 32 12.8 32 32v96c0 19.2-12.8 32-32 32H192c-19.2 0-32-12.8-32-32v-96c0-19.2 12.8-32 32-32h640m0-32H192c-35.2 0-64 28.8-64 64v96c0 35.2 28.8 64 64 64h640c35.2 0 64-28.8 64-64v-96c0-35.2-28.8-64-64-64zM288 416c19.2 0 32 12.8 32 32v416c0 19.2-12.8 32-32 32h-96c-19.2 0-32-12.8-32-32V448c0-19.2 12.8-32 32-32h96m0-32h-96c-35.2 0-64 28.8-64 64v416c0 35.2 28.8 64 64 64h96c35.2 0 64-28.8 64-64V448c0-35.2-28.8-64-64-64zM832 416c19.2 0 32 12.8 32 32v160c0 19.2-12.8 32-32 32H480c-19.2 0-32-12.8-32-32V448c0-19.2 12.8-32 32-32h352m0-32H480c-35.2 0-64 28.8-64 64v160c0 35.2 28.8 64 64 64h352c35.2 0 64-28.8 64-64V448c0-35.2-28.8-64-64-64zM832 768c19.2 0 32 12.8 32 32v64c0 19.2-12.8 32-32 32H480c-19.2 0-32-12.8-32-32v-64c0-19.2 12.8-32 32-32h352m0-32H480c-35.2 0-64 28.8-64 64v64c0 35.2 28.8 64 64 64h352c35.2 0 64-28.8 64-64v-64c0-35.2-28.8-64-64-64z"/></svg>',
      panels: [
        {
          title: '主题',
          key: 'theme',
          icon: 'skin',
          component: 'ThemeConfig'
        },
        {
          title: '微件',
          key: 'widget',
          icon: 'appstore',
          component: 'WidgetConfig'
        },
        {
          title: '属性',
          key: 'attribute',
          icon: 'setting',
          component: 'Attribute'
        }
      ],
      panelTab: 'theme',
      initialized: false,
      application: {},
      appConfig: {},
      jsonVisible: false
    }
  },
  async created() {
    const appManager = AppManager.getInstance()

    // 加载应用
    await appManager.loadConfig(
      this.baseAPI,
      this.appConfigPath,
      this.appAssetsPath
    )

    // 获取应用（解析后的应用对象）
    this.application = appManager.getApplication()

    // 获取应用配置（原始配置信息）
    this.appConfig = appManager.getAppConfig()

    // 获取可供搭建的主题详细信息
    await Promise.all(
      this.themes.map(async theme => {
        theme.icon = `themes/${theme.name}/images/icon.png`
        theme.manifest = await appManager.getThemeManifest(
          `themes/${theme.name}`
        )
        theme.layout = await appManager.getThemeLayout(`themes/${theme.name}`)
      })
    )

    // 获取可供搭建的微件详细信息
    await Promise.all(
      this.widgets.map(async widget => {
        widget.manifest = await appManager.getWidgetManifest(
          `widgets/${widget.name}`
        )
      })
    )

    this.initialized = true
  },
  methods: {
    onPanelClick(tab) {
      if (this.panelTab === tab) {
        this.panelTab = ''
      } else {
        this.panelTab = tab
      }
    },
    onJSONClick() {
      this.jsonVisible = true
    },
    onSaveClick() {
      this.$emit('save', this.appConfig)
    }
  }
}
</script>

<style lang="less">
.mp-app-builder-wrapper {
  .builder-header-wrapper {
    padding: 0;
    height: 48px;
    line-height: 48px;
    background-color: @base-bg-color;
    border-bottom: 1px solid @border-color;
    .header-wide {
      display: flex;
      align-items: center;
      height: 100%;
      padding-left: 8px;
      .header-left {
        display: flex;
        min-width: 240px;
        .logo {
          position: relative;
          height: 100%;
          overflow: hidden;
          .icon {
            color: @primary-color;
            font-size: 32px;
          }
          h1 {
            display: inline-block;
            margin: 0 0 0 12px;
            font-weight: 400;
            font-size: 16px;
            vertical-align: top;
            color: @title-color;
          }
        }
      }
      .header-content {
        flex: 1 1 0%;
        min-width: 0;
      }
      .header-right {
        display: flex;
        align-content: center;
        float: right;
        overflow: hidden;
        padding-right: 8px;
        .header-item {
          margin-left: 8px;
        }
      }
    }
  }
  .sidebar-left-wrapper {
    display: flex;
    flex-shrink: 0;
    height: calc(100vh - 48px);
    background-color: @base-bg-color;
    .ant-layout-sider-children {
      display: flex;
      .sidebar-menu {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 90px;
        height: 100%;
        padding-top: 8px;
        border-right: 1px solid @border-color;
        .sidebar-menu-top {
          .panel-tab {
            position: relative;
            cursor: pointer;
            color: @text-color;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            user-select: none;
            &:hover {
              color: @heading-color;
            }
            &.active {
              .tab-icon,
              .tab-text {
                color: @primary-color;
              }
            }
            &:not(:last-of-type)::after {
              position: absolute;
              bottom: 0;
              width: 16px;
              height: 1px;
              background-color: @border-color;
              content: '';
            }
            .tab-text {
              font-size: 12px;
              margin-top: 4px;
              line-height: 20px;
              text-align: center;
              word-break: break-word;
            }
          }
        }
      }
      .sidebar-content {
        width: 284px;
        border-right: 1px solid @border-color;
        overflow-y: auto;
      }
    }
  }
}
</style>
