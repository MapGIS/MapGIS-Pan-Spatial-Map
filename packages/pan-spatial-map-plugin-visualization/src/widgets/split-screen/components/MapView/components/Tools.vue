<template>
  <row-flex
    :label="title"
    :span="[12, 12]"
    :colon="false"
    :gutter="0"
    justify="space-between"
    class="tools"
  >
    <slot>
      <a-tooltip v-for="item in tools" :key="item.label" :title="item.label">
        <a-icon :type="item.icon" @click.stop="onIconClick(item)" />
      </a-tooltip>
    </slot>
  </row-flex>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import _upperFirst from 'lodash/upperFirst'
import RowFlex from '../../RowFlex'

export type OperationType =
  | 'UNKNOW'
  | 'QUERY'
  | 'ZOOMIN'
  | 'ZOOMOUT'
  | 'RESORT'
  | 'PAN'
  | 'CLEAR'

export type OperationFn =
  | 'onQuery'
  | 'onZoomIn'
  | 'onZoomOut'
  | 'onResort'
  | 'onPan'
  | 'onClear'

interface ITool {
  label: string
  icon: string
  operationType: OperationType
}

@Component({
  components: {
    RowFlex
  }
})
export default class Tools extends Vue {
  @Prop() readonly title!: string

  tools: ITool[] = [
    {
      label: '查询',
      icon: 'search',
      operationType: 'query'
    },
    {
      label: '放大',
      icon: 'zoom-in',
      operationType: 'zoomIn'
    },
    {
      label: '缩小',
      icon: 'zoom-out',
      operationType: 'zoomOut'
    },

    {
      label: '复位',
      icon: 'redo',
      operationType: 'resort'
    },
    {
      label: '移动',
      icon: 'drag',
      operationType: 'pan'
    },
    {
      label: '清除',
      icon: 'delete',
      operationType: 'clear'
    }
  ]

  onIconClick({ operationType }: ITool) {
    const fnName: OperationFn = `on${_upperFirst(operationType)}`
    const _operationType: OperationType = operationType.toUpperCase()
    this.$emit('on-icon-click', _operationType, fnName)
  }
}
</script>
<style lang="less" scoped>
.tools {
  color: @white;
  background-color: @primary-color;
  line-height: 32px;
  padding: 0 8px;
  /deep/ .ant-col:last-of-type {
    text-align: right;
    .anticon {
      font-size: 18px;
      margin-left: 8px;
      vertical-align: middle;
      margin-top: -0.125em;
    }
  }
  + div {
    flex: 1;
  }
}
</style>
