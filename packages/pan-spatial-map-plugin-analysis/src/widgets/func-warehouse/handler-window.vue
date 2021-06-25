<template>
  <div class="mp-handler-window">
    处理界面
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Analysis } from '@mapgis/web-app-framework'

@Component({ name: 'MpHandlerWindow' })
export default class MpHandlerWindow extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped>
.mp-handler-window {
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }
  .space {
    width: 100%;
  }
  .btn {
    text-align: right;
    margin: 12px 0;
    button {
      margin-left: 8px;
    }
  }
  .col {
    text-align: center;
    line-height: 30px;
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .ant-table-wrapper {
    width: 400px;
  }
}
</style>
