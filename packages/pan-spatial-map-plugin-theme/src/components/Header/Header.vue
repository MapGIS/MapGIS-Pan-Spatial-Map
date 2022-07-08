<template>
  <a-layout-header :class="[themeMode, 'header-wrapper']">
    <div class="header-wide">
      <div class="header-left">
        <slot name="header-left">
          <div :class="['logo', themeMode]">
            <mp-icon :icon="computedAppLogo" class="icon" />
            <h1>{{ application.title }}</h1>
            <h2>{{ application.subtitle }}</h2>
          </div>
        </slot>
      </div>
      <div class="header-content">
        <slot name="header-content" />
      </div>
      <div :class="['header-right', themeMode]">
        <slot name="header-right" />
      </div>
    </div>
  </a-layout-header>
</template>

<script>
import { AppMixin } from '@mapgis/web-app-framework'
import { request } from '../../../../pan-spatial-map-framework/src/utils/request'
import axios from '../../../../../node_modules/axios'

export default {
  name: 'MpPanSpatialMapHeader',
  mixins: [AppMixin],
  props: {
    themeMode: {
      type: String,
      required: false,
      default: 'dark'
    }
  },
  data() {
    return {
      tempbase64: ''
    }
  },
  computed: {
    computedAppLogo() {
      const url = this.appLogo
      if (this.appLogo.indexOf('svg+xml') !== -1) {
        this.getbase64(url)
        return this.tempbase64
      }
      return this.appLogo
    }
  },
  methods: {
    async getbase64(url) {
      await request({ url, method: 'get' }).then((data) => {
        this.tempbase64 = data
      })
    }
  }
}
</script>

<style lang="less" scoped>
.header-wrapper {
  height: 48px;
  line-height: 48px;
  padding: 0;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  background: @base-bg-color;
  &.dark,
  &.night {
    background: @header-bg-color-dark;
    color: white;
  }
  .header-wide {
    display: flex;
    height: 48px;
    padding-left: 8px;
    .header-left {
      display: flex;
      min-width: 240px;
      .logo {
        position: relative;
        height: 48px;
        overflow: hidden;
        .icon {
          color: @primary-color;
          font-size: 32px;
          margin-right: 8px;
          position: relative;
          /deep/img {
            vertical-align: unset !important;
          }
          /deep/i {
            font-size: 32px;
          }
        }
        h1 {
          display: inline-block;
          margin: 0 0 0 12px;
          font-weight: 400;
          font-size: 16px;
          vertical-align: top;
          color: inherit;
        }
        h2 {
          display: inline-block;
          margin: 0 0 0 12px;
          font-weight: 400;
          font-size: 14px;
          vertical-align: top;
          color: inherit;
        }
      }
    }
    .header-content {
      flex: 1 1 0%;
      min-width: 0;
    }
  }
}
</style>

<style lang="less">
.header-wrapper {
  .header-wide {
    .header-right {
      display: flex;
      float: right;
      height: 48px;
      overflow: hidden;
      padding-right: 8px;
      color: inherit;
      .header-item {
        height: 100%;
        display: flex;
        align-items: center;
        color: inherit;
        padding: 0 12px;
        cursor: pointer;
        a {
          color: inherit;
          i {
            font-size: 16px;
          }
        }
      }
      each(@theme-list, {
        &.@{value} .header-item {
          &:hover {
            @class: ~'hover-bg-color-@{value}';
            background-color: @@class;
          }
        }
      });
    }
  }
}
</style>
