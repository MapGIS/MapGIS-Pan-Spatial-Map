<template>
  <a-layout-header :class="[themeMode, 'header-wrapper']">
    <div class="header-wide">
      <div :class="['logo', themeMode]">
        <mp-icon :icon="application.logo" class="icon" />
        <h1>{{ application.title }}</h1>
        <h2>{{ application.subtitle }}</h2>
      </div>
      <slot name="header-content"></slot>
      <div :class="['header-right', themeMode]">
        <mp-header-avatar class="header-item" />
      </div>
    </div>
  </a-layout-header>
</template>

<script>
import { AppMixin } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpIcon from '../Icon/Icon.vue'
import MpHeaderAvatar from './HeaderAvatar.vue'

export default {
  name: 'MpPanSpatialMapHeader',
  components: { MpIcon, MpHeaderAvatar },
  mixins: [AppMixin],
  props: {
    themeMode: {
      type: String,
      required: false,
      default: 'dark'
    }
  }
}
</script>

<style lang="less" scoped>
.header-wrapper {
  height: 48px;
  line-height: 48px;
  padding: 0;
  z-index: 2;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  position: relative;
  background: @base-bg-color;
  &.dark {
    background: @header-bg-color-dark;
    color: white;
  }
  .header-wide {
    padding-left: 8px;
    .logo {
      display: inline-block;
      padding: 0 12px 0 0;
      .icon {
        color: @primary-color;
        font-size: 32px;
        margin-right: 8px;
        vertical-align: -0.2em;
      }
      h1 {
        color: inherit;
        display: inline-block;
        font-size: 16px;
      }
      h2 {
        color: inherit;
        display: inline-block;
        font-size: 14px;
        padding-left: 6px;
      }
    }
    .header-right{
      float: right;
      display: flex;
      color: inherit;
      .header-item{
        color: inherit;
        padding: 0 12px;
        cursor: pointer;
        align-self: center;
        a{
          color: inherit;
          i{
            font-size: 16px;
          }
        }
      }
      each(@theme-list, {
        &.@{value} .header-item{
          &:hover{
            @class: ~'hover-bg-color-@{value}';
            background-color: @@class;
          }
        }
      })
    }
  }
}
</style>
