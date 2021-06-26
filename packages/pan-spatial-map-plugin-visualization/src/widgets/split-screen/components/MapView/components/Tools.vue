<template>
  <mp-toolbar class="mp-split-screen-toolbar">
    <mp-toolbar-title>
      {{ title }}
    </mp-toolbar-title>
    <mp-toolbar-command-group>
      <mp-toolbar-command
        v-for="item in tools"
        :key="item.label"
        :title="item.label"
        :icon="item.icon"
        @click="onIconClick(item)"
      >
      </mp-toolbar-command>
    </mp-toolbar-command-group>
  </mp-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import _upperFirst from 'lodash/upperFirst'

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
  components: {}
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
.mp-split-screen-toolbar {
  /deep/ .mp-toolbar-title {
    color: @primary-color;
  }
}
</style>
