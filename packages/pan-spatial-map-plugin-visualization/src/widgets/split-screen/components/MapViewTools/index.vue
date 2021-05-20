<template>
  <row-flex
    :label="title"
    :span="[14, 10]"
    :colon="false"
    :gutter="0"
    justify="space-between"
    class="map-view-tools"
  >
    <a-tooltip v-for="item in tools" :key="item.label" :title="item.label">
      <a-icon :type="item.icon" @click.stop="onSettingIconClick(item)" />
    </a-tooltip>
  </row-flex>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import RowFlex from '../RowFlex'

export type OperationType =
  | 'UNKNOW'
  | 'QUERY'
  | 'ZOOMIN'
  | 'ZOOMOUT'
  | 'RESORT'
  | 'PAN'
  | 'CLEAR'

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
export default class MapViewTools extends Vue {
  @Prop() title!: string

  // 工具按钮
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

  /**
   * 设置图标点击操作
   * @param item<object>
   */
  onSettingIconClick({ operationType }: ITool) {
    const fnName = `${operationType}Click`
    const _operationType = operationType.toUpperCase()
    this.$emit('on-icon-click', _operationType, fnName)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
