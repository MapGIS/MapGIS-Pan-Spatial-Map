<template>
  <a-layout-header :class="[themeMode, 'header-wrapper']">
    <div class="header-wide">
      <div class="header-left">
        <div :class="['logo', themeMode]">
          <mp-icon :icon="application.logo" class="icon" />
          <h1>{{ application.title }}</h1>
          <h2>{{ application.subtitle }}</h2>
        </div>
      </div>
      <div class="header-content">
        <slot name="header-content" />
      </div>
      <div :class="['header-right', themeMode]">
        <mp-header-avatar class="header-item" />
      </div>
    </div>
  </a-layout-header>
</template>

<script>
import { AppMixin } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpHeaderAvatar from './HeaderAvatar.vue'

export default {
  name: 'MpPanSpatialMapHeader',
  components: { MpHeaderAvatar },
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
  z-index: 2000;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  position: relative;
  background: @base-bg-color;
  &.dark {
    background: @header-bg-color-dark;
    color: white;
  }
  .header-wide {
    display: flex;
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
          margin-right: 8px;
          vertical-align: middle;
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
    .header-right{
      display: flex;
      min-width: 280px;
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
