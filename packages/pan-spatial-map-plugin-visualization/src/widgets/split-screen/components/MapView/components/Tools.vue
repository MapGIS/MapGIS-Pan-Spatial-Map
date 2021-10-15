<template>
  <mp-toolbar class="mp-split-screen-toolbar">
    <mp-toolbar-title>
      {{ title }}
    </mp-toolbar-title>
    <mp-toolbar-command-group>
      <mp-toolbar-command
        v-for="item in resTools"
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
import { OperationType } from '../store/map-view-state'

interface ITool {
  label: string
  icon: string
  type: keyof OperationType
}

@Component
export default class Tools extends Vue {
  @Prop() readonly title!: string

  @Prop() readonly excludes!: keyof OperationType | Array<keyof OperationType>

  @Prop() readonly tools!: ITool[]

  defaultTools: ITool[] = [
    {
      label: '查询',
      icon: 'search',
      type: OperationType.QUERY
    },
    {
      label: '放大',
      icon: 'zoom-in',
      type: OperationType.ZOOMIN
    },
    {
      label: '缩小',
      icon: 'zoom-out',
      type: OperationType.ZOOMOUT
    },

    {
      label: '复位',
      icon: 'redo',
      type: OperationType.RESTORE
    },
    {
      label: '清除',
      icon: 'delete',
      type: OperationType.CLEAR
    }
  ]

  get resTools() {
    const _tools =
      this.tools && this.tools.length ? this.tools : this.defaultTools
    return _tools.filter(
      ({ type }) => !this.excludes || !this.excludes.includes(type)
    )
  }

  onIconClick({ type }: ITool) {
    this.$emit('on-click', type)
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
