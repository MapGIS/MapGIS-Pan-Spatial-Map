<template>
  <mp-placement
    class="mp-window-wrapper"
    :position="anchor"
    :offset="[currentHorizontalOffset, currentVerticalOffset]"
    v-show="syncedVisible"
    :style="style"
    :z-index="zIndex"
    ref="windowContainer"
  >
    <div
      class="window-head"
      :style="{
        cursor: canDragable ? 'all-scroll' : 'auto'
      }"
      @mousedown="onMousedown(onDrag, $event)"
      ref="headerContainer"
    >
      <div class="title">{{ title }}</div>
      <div class="actions">
        <a-icon
          v-if="shrinkAction"
          class="action"
          :type="shrink ? 'up' : 'down'"
          @click="shrink = !shrink"
        />
        <a-icon
          v-if="fullScreenAction"
          class="action"
          :type="fullScreen ? 'fullscreen-exit' : 'fullscreen'"
          @click="fullScreen = !fullScreen"
        />
        <a-icon class="action" type="close" @click="onClose" />
      </div>
    </div>
    <div
      v-show="!shrink"
      class="beauty-scroll window-content"
      ref="contentContainer"
    >
      <slot />
      <div
        v-show="canResizable"
        @mousedown="onMousedown(onResizeWindow, $event)"
        style="position: absolute; bottom: 2px; right: 2px; cursor: nw-resize; width: 15px; height: 15px;"
      />
    </div>
  </mp-placement>
</template>

<script>
const SPECIAL_CHARS_REGEXP = /([:-_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/

const camelCase = function(name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1')
}

const getStyle =
  Number(document.documentMode) < 9
    ? function(element, styleName) {
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'styleFloat'
        }
        try {
          switch (styleName) {
            case 'opacity':
              try {
                return element.filters.item('alpha').opacity / 100
              } catch (e) {
                return 1.0
              }
            default:
              return element.style[styleName] || element.currentStyle
                ? element.currentStyle[styleName]
                : null
          }
        } catch (e) {
          return element.style[styleName]
        }
      }
    : function(element, styleName) {
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'cssFloat'
        }
        try {
          const computed = document.defaultView.getComputedStyle(element, '')
          return element.style[styleName] || computed
            ? computed[styleName]
            : null
        } catch (e) {
          return element.style[styleName]
        }
      }

export default {
  name: 'MpWindow',
  props: {
    // 窗体方位
    // top-left | top | top-right | right | bottom-right | bottom | bottom-left | left
    anchor: {
      type: String,
      default: 'top-right'
    },
    // 水平偏移
    horizontalOffset: {
      type: Number,
      default: 0
    },
    // 垂直偏移
    verticalOffset: {
      type: Number,
      default: 0
    },
    // 是否展开
    expand: {
      type: Boolean,
      default: false
    },
    dragable: {
      type: Boolean,
      default: true
    },
    // 显示标题
    title: { type: String, default: 'Title' },
    // 显示图标
    icon: { type: String, required: false },
    // 是否显示
    visible: { type: Boolean, default: false },
    // 内容宽度
    width: { type: Number, required: false },
    // 内容高度
    height: { type: Number, required: false },
    // 相对于主视图顶的距离
    top: { type: Number },
    // 相对于主视图底的距离
    bottom: { type: Number },
    // 是否有收缩动作
    shrinkAction: { type: Boolean, default: true },
    // 是否有全屏动作
    fullScreenAction: { type: Boolean, default: true },
    // 是否窗口范围内拖动
    dragRange: { type: Boolean, default: true },
    // 是否调整窗口大小
    resizable: { type: Boolean, default: true },
    // 是否全屏
    isFullScreen: { type: Boolean, default: false },
    // 层级
    zIndex: { type: Number, default: 1 }
  },
  data() {
    return {
      // 最小宽度和最大宽度
      minWidthPixel: '240px',
      maxWidthPixel: '100%',
      // 最小高度和最大高度
      minHeightPixel: '48px',
      maxHeightPixel: '100%',
      // 是否收缩面板
      shrink: false,
      // 是否全屏
      fullScreen: this.isFullScreen,
      // 拖拽之后的位置，默认为初始位置
      dragHorizontalOffset: this.horizontalOffset,
      dragVerticalOffset: this.verticalOffset,
      heightPixel: null,
      // 调整大小后的大小，默认为初始大小
      resizeWidth: this.width,
      resizeHeight: this.height,
      relParentEl: null
    }
  },
  computed: {
    // 同步属性visible
    syncedVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    // 是否是水平布局
    // 上下悬停
    isHorizontal() {
      return ['top', 'bottom'].includes(this.anchor)
    },
    // 是否是垂直布局
    // 左右悬停
    isVertical() {
      return ['left', 'right'].includes(this.anchor)
    },
    // 是否允许拖动
    // 全屏以及展开时不允许拖动
    canDragable() {
      return this.dragable && !this.fullScreen && !this.expand
    },
    canResizable() {
      return this.resizable && (this.width || this.height)
    },
    // 当前的水平偏移，主要为了保证全屏的时候在0位置
    currentHorizontalOffset() {
      if (this.canDragable) return this.dragHorizontalOffset

      return 0
    },
    // 当前的垂直偏移，主要为了保证全屏的时候在0位置
    currentVerticalOffset() {
      if (this.canDragable) return this.dragVerticalOffset

      return 0
    },
    // 当前的内容宽度
    // 全屏(fullScreen)|水平展开(expand && isHorizontal)：计算宽度
    // 正常情况：使用传入的宽度
    currentWidthPixel() {
      if (this.fullScreen || (this.expand && this.isHorizontal))
        // 全屏|水平展开：100%
        return '100%'

      if (this.width) {
        return `${this.resizeWidth}px`
      }

      return null
    },
    // 当前的内容高度
    // 全屏(fullScreen)|垂直展开(expand && isVertical)：计算高度并减去title的高度
    // 正常情况：使用传入的高度
    currentHeightPixel() {
      if (this.shrink) {
        return '36px'
      }

      if (this.fullScreen || (this.expand && this.isVertical)) {
        // 全屏|垂直展开：高度100%
        return '100%'
      }

      // 布局高度加上title高度
      if (this.heightPixel) {
        return `calc(${this.heightPixel} + 36px)`
      }

      return null
    },
    style() {
      const styleObj = {}

      if (this.currentWidthPixel) {
        this.$set(styleObj, 'width', this.currentWidthPixel)
      } else {
        this.$set(styleObj, 'minWidth', this.minWidthPixel)
        this.$set(styleObj, 'maxWidth', this.maxWidthPixel)
      }

      if (this.currentHeightPixel) {
        this.$set(styleObj, 'height', this.currentHeightPixel)
      } else {
        this.$set(styleObj, 'minHeight', this.minHeightPixel)
        this.$set(styleObj, 'maxHeight', this.maxHeightPixel)
      }

      return styleObj
    }
  },
  watch: {
    horizontalOffset(newVal) {
      this.dragHorizontalOffset = newVal
    },
    verticalOffset(newVal) {
      this.dragVerticalOffset = newVal
    },
    resizeHeight: {
      handler() {
        if (this.resizeHeight) {
          this.heightPixel = `${this.resizeHeight}px`
        }
      }
    }
  },
  created() {
    if (!this.width) {
    }

    if (this.height) {
      this.heightPixel = `${this.height}px`
    } else {
      // 如果height为undefined
      if (
        ['top-left', 'top-right', 'top'].includes(this.anchor) &&
        typeof this.bottom != 'undefined'
      ) {
        this.heightPixel = `calc(100% - 36px - ${this.verticalOffset}px - ${this.bottom}px)`
      } else if (
        ['bottom-left', 'bottom-right', 'bottom'].includes(this.anchor) &&
        typeof this.top != 'undefined'
      ) {
        this.heightPixel = `calc(100% - 36px - ${this.verticalOffset}px - ${this.top}px)`
      }
    }
  },
  methods: {
    /**
     *  获取拖拽元素相对位置参考元素
     */
    getRelativeEl(el) {
      let parent = el.parentNode
      while (
        parent !== document.documentElement &&
        getStyle(parent, 'position') === 'static'
      ) {
        parent = parent.parentNode
      }
      return parent
    },
    // 拖拽事件
    // 只有在允许拖拽的时候生效
    // 通过此次拖拽的相对位置以及上次的位置计算新的位置
    // 注意xy的加减问题
    onDrag({ delta: { x, y } }) {
      if (this.canDragable) {
        // 基于左右计算x轴偏移量
        let offsetX
        let minOffsetX
        let maxOffsetX

        offsetX = this.anchor.includes('left')
          ? this.dragHorizontalOffset + x
          : this.dragHorizontalOffset - x

        if (this.dragRange) {
          minOffsetX = 0
          maxOffsetX =
            this.relParentEl.clientWidth -
            this.$refs.windowContainer.$el.clientWidth
        } else {
          minOffsetX = -this.$refs.windowContainer.$el.clientWidth
          maxOffsetX = this.relParentEl.clientWidth
        }

        // 保证在可视范围内
        if (offsetX > maxOffsetX) offsetX = maxOffsetX
        if (offsetX < minOffsetX) offsetX = minOffsetX

        // 基于上下计算y轴偏移量
        let offsetY
        let minOffsetY
        let maxOffsetY
        if (this.anchor.includes('top')) {
          offsetY = this.dragVerticalOffset + y
          if (this.dragRange) {
            minOffsetY = 0
            maxOffsetY =
              this.relParentEl.clientHeight -
              this.$refs.windowContainer.$el.clientHeight
          } else {
            minOffsetY = 0
            maxOffsetY =
              this.relParentEl.clientHeight -
              this.$refs.headerContainer.clientHeight
          }
        } else {
          offsetY = this.dragVerticalOffset - y
          if (this.dragRange) {
            minOffsetY = 0
            maxOffsetY =
              this.relParentEl.clientHeight -
              this.$refs.windowContainer.$el.clientHeight
          } else {
            minOffsetY = -this.$refs.contentContainer.clientHeight
            maxOffsetY =
              this.relParentEl.clientHeight -
              this.$refs.windowContainer.$el.clientHeight
          }
        }
        // 保证在可视范围内
        if (offsetY > maxOffsetY) offsetY = maxOffsetY
        if (offsetY < minOffsetY) offsetY = minOffsetY
        this.dragHorizontalOffset = offsetX
        this.dragVerticalOffset = offsetY
      }
    },
    onMousedown(func, e) {
      // 从DOM树向上查找定位元素，如无，就取documentElement
      this.relParentEl = this.getRelativeEl(this.$el)

      let startX = e.clientX
      let startY = e.clientY

      const move = moveEvent => {
        moveEvent.preventDefault()
        moveEvent.stopPropagation()

        let offsetX = 0
        let offsetY = 0

        offsetX = moveEvent.clientX - startX
        startX += offsetX
        offsetY = moveEvent.clientY - startY
        startY += offsetY

        func({ delta: { x: offsetX, y: offsetY } })
      }

      const up = moveEvent => {
        document.removeEventListener('mousemove', move, true)
        document.removeEventListener('mouseup', up, true)
      }
      document.addEventListener('mousemove', move, true)
      document.addEventListener('mouseup', up, true)
    },
    // 调整大小（暂时没有考虑dragRange）
    onResizeWindow({ delta: { x, y } }) {
      if (!this.resizable) return

      // 只处理宽度有值的面板
      if (!this.width) return

      let rx = x
      const maxWidth = this.relParentEl.clientWidth

      if (this.resizeWidth + x <= this.width) {
        rx = this.width - this.resizeWidth

        this.resizeWidth = this.width
      }
      // 不能将窗口调整到主视图外面去，否则将调不回来
      else if (this.resizeWidth + x >= maxWidth) {
        rx = maxWidth - this.resizeWidth

        this.resizeWidth = maxWidth
      } else {
        this.resizeWidth += x
      }

      if (this.anchor.includes('right')) {
        this.dragHorizontalOffset -= rx
      }

      // 只处理高度有值的面板
      if (!this.height) return

      let ry = y
      const maxHeight =
        this.relParentEl.clientHeight - this.$refs.headerContainer.clientHeight

      if (this.resizeHeight + y <= this.height) {
        ry = this.height - this.resizeHeight

        this.resizeHeight = this.height
      }
      // 不能将窗口调整到主视图下面去，否则将调不回来
      else if (this.resizeHeight + y >= maxHeight) {
        ry = maxHeight - this.resizeHeight

        this.resizeHeight = maxHeight
      } else {
        this.resizeHeight += ry
      }

      if (this.anchor.includes('bottom')) {
        this.dragVerticalOffset -= ry
      }
    },
    // 关闭事件
    onClose() {
      this.syncedVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.mp-window-wrapper {
  background-color: @base-bg-color;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0px 1px 2px 0px @shadow-color;
  .window-head {
    display: flex;
    padding: 0 12px;
    font-size: 14px;
    height: 36px;
    border-bottom: 1px solid @border-color;
    .title {
      flex: auto;
      padding: 8px 0;
      color: @heading-color;
    }
    .actions {
      padding: 8px 0;
      .action {
        cursor: pointer;
        padding-left: 8px;
        &:hover {
          color: @primary-color;
        }
      }
    }
  }
  .window-content {
    padding: 12px;
    flex: auto;
    overflow-y: auto;
  }
}
</style>
