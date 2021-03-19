<template>
  <a-layout-sider
    theme="light"
    :class="[themeMode, 'side-panel-wrapper']"
    :width="currentWidth"
    v-show="syncedVisible"
  >
    <a-card
      size="small"
      :title="title"
      :style="{
        flex: 'auto',
        transition: 'none',
        border: 'none'
      }"
    >
      <a-icon class="close-button" type="close" slot="extra" @click="onClose" />
      <slot />
    </a-card>
    <mp-pan-spatial-map-adjust-line
      v-if="!isFullScreen"
      direction="right"
      :resize-button="false"
      @line-move="onPanelLineMove"
    />
  </a-layout-sider>
</template>

<script>
import { mapState } from 'vuex'
import MpPanSpatialMapAdjustLine from '../AdjustLine/AdjustLine.vue'

export default {
  name: 'MpPanSpatialMapSideWindow',
  components: { MpPanSpatialMapAdjustLine },
  props: {
    // 显示标题
    title: { type: String, default: 'Title' },
    // 显示图标
    icon: { type: String, required: false },
    // 是否显示
    visible: { type: Boolean, default: false },
    // 内容宽度
    width: { type: Number, default: 240 },
    // 是否全屏
    isFullScreen: { type: Boolean, default: false },
    // 最大宽度，支持数值和函数，函数必须返回数值
    maxWidth: { type: [Number, Function] }
  },
  data() {
    return {
      resizeWidth: this.width
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode
    },
    // 同步属性visible
    syncedVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    currentWidth() {
      if (this.isFullScreen) {
        const width = this.getMaxWidth()
        if (width) {
          return width
        }
      }

      return this.resizeWidth
    }
  },
  methods: {
    // 获取地图容器元素
    getMaxWidth() {
      if (!this.maxWidth) return null

      const type = typeof this.maxWidth
      if (type === 'function') {
        return this.maxWidth()
      } else if (this.maxWidth instanceof Number) {
        return this.maxWidth
      }
      return null
    },
    onPanelLineMove(offset) {
      this.resizeWidth += offset
      if (this.resizeWidth < 2) {
        this.resizeWidth = 2
      } else {
        const maxWidth = this.getMaxWidth()

        if (maxWidth && this.resizeWidth >= maxWidth) {
          this.resizeWidth = maxWidth
        }
      }
    },
    // 关闭事件
    onClose() {
      this.syncedVisible = false
    }
  }
}
</script>

<style lang="less">
.side-panel-wrapper {
  .ant-layout-sider-children {
    display: flex;
    flex-direction: row;
    height: 100%;
    justify-content: flex-end;
  }
}
</style>

<style lang="less" scoped>
.side-panel-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 500;
  height: calc(100vh - 48px);
  .close-button {
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
}
</style>
