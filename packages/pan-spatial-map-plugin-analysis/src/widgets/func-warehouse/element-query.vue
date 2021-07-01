<template>
  <div class="mp-element-query">
    <div class="setting-panel">
      <a-space direction="vertical" class="space">
        <a-row>
          <a-col :span="4" class="col">要素查询</a-col>
          <a-col :span="20"> </a-col>
        </a-row>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpElementQuery' })
export default class MpElementQuery extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped>
.mp-element-query {
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
    width: 500px;
  }
}
</style>
