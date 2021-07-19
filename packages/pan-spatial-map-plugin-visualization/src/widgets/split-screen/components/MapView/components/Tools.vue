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

export type ToolType = 'query' | 'zoomIn' | 'zoomOut' | 'restore' | 'clear'

interface ITool {
  label: string
  icon: string
  type: ToolType
}

@Component({
  components: {}
})
export default class Tools extends Vue {
  @Prop() readonly title!: string

  @Prop() readonly excludes!: ToolType | Array<ToolType>

  @Prop() readonly tools!: ITool[]

  defaultTools: ITool[] = [
    {
      label: '查询',
      icon: 'search',
      type: 'query'
    },
    {
      label: '放大',
      icon: 'zoom-in',
      type: 'zoomIn'
    },
    {
      label: '缩小',
      icon: 'zoom-out',
      type: 'zoomOut'
    },

    {
      label: '复位',
      icon: 'redo',
      type: 'restore'
    },
    {
      label: '清除',
      icon: 'delete',
      type: 'clear'
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
