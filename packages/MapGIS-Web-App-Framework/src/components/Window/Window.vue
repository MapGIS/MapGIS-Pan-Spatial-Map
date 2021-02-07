<template>
  <div>{{ title }}</div>
</template>

<script>
import { ThemeStyleMixin, IconMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpWindow',
  mixins: [ThemeStyleMixin, IconMixin],
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
    width: { type: Number, default: 360 },
    // 内容高度
    height: { type: Number, required: false },
    // 相对于主视图顶的距离
    top: { type: Number, default: 0 },
    // 相对于主视图底的距离
    bottom: { type: Number, default: 0 },
    // 是否有收缩动作
    shrinkAction: { type: Boolean, default: true },
    // 是否有全屏动作
    fullScreenAction: { type: Boolean, default: true },
    // 是否窗口范围内拖动
    dragRange: { type: Boolean, default: true },
    // 是否调整窗口大小
    resizable: { type: Boolean, default: true },
    // 是否全屏
    isFullScreen: { type: Boolean, default: false }
  },
  data() {
    return {
      // 是否收缩面板
      shrink: false,
      // 是否全屏
      fullScreen: this.isFullScreen,
      // 拖拽之后的位置，默认为初始位置
      dragHorizontalOffset: this.horizontalOffset,
      dragVerticalOffset: this.verticalOffset,
      // 相对于屏幕的偏移
      leftToScreen: 0,
      rightToScreen: 0,
      topToScreen: 0,
      bottomToScreen: 0,
      heightPixel: '100px',
      // 调整大小后的大小，默认未初始大小
      resizeWidth: this.width,
      resizeHeight: this.height
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
    // 全屏以及扩展时不允许拖动
    canDragable() {
      return this.dragable && !this.fullScreen && !this.expand
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
    // 全屏(fullScreen)|水平展开(expand && isHorizontal)：计算q-page的宽度
    // 正常情况：使用传入的宽度
    currentWidth() {
      this.calcToScreenOffset()

      if (this.fullScreen || (this.expand && this.isHorizontal))
        // 全屏|水平展开：总宽度减去左右布局宽度
        return `calc(100vw - ${this.leftToScreen}px - ${this.rightToScreen}px)`
      return `${this.resizeWidth}px`
    },
    // 当前的内容高度
    // 全屏(fullScreen)|垂直展开(expand && isVertical)：计算q-page的高度并减去title的高度
    // 正常情况：使用传入的高度
    currentHeight() {
      this.calcToScreenOffset()

      if (this.fullScreen || (this.expand && this.isVertical)) {
        // 全屏|垂直展开：总高度减去上下布局高度减去title高度
        return `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px)`
      }
      return this.heightPixel
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
    if (this.height) {
      this.heightPixel = `${this.height}px`
    }

    this.$nextTick(() => {
      this.calcToScreenOffset()
    })
  },
  methods: {
    // 获取相对于屏幕的偏移
    calcToScreenOffset() {
      if (!this.$refs.windowContainer) return

      const { left, right, top, bottom } = this.$refs.windowContainer
      this.leftToScreen = left
      this.rightToScreen = right
      this.topToScreen = top
      this.bottomToScreen = bottom

      // 如果height为undefined
      if (!this.height) {
        if (['top-left', 'top-right', 'top'].includes(this.anchor)) {
          this.heightPixel = `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px - ${this.verticalOffset}px - ${this.bottom}px)`
        } else if (
          ['bottom-left', 'bottom-right', 'bottom'].includes(this.anchor)
        ) {
          this.heightPixel = `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px - ${this.verticalOffset}px - ${this.top}px)`
        }
      }
    },
    // 拖拽事件
    // 只有在允许拖拽的时候生效
    // 通过此次拖拽的相对位置以及上次的位置计算新的位置
    // 注意xy的加减问题
    onDrag({ delta: { x, y }, position: { top, left } }) {
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
            document.body.clientWidth -
            this.$refs.windowContainer.left -
            this.$refs.windowContainer.right -
            this.$refs.bodyContainer.$el.clientWidth
        } else {
          minOffsetX = -this.$refs.bodyContainer.$el.clientWidth
          maxOffsetX =
            document.body.clientWidth -
            this.$refs.windowContainer.left -
            this.$refs.windowContainer.right
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
              document.body.clientHeight -
              this.$refs.windowContainer.top -
              this.$refs.windowContainer.bottom -
              this.$refs.bodyContainer.$el.clientHeight
          } else {
            minOffsetY = 0
            maxOffsetY =
              document.body.clientHeight -
              this.$refs.windowContainer.top -
              this.$refs.windowContainer.bottom -
              this.$refs.barContainer.$el.clientHeight
          }
        } else {
          offsetY = this.dragVerticalOffset - y
          if (this.dragRange) {
            minOffsetY = 0
            maxOffsetY =
              document.body.clientHeight -
              this.$refs.windowContainer.top -
              this.$refs.windowContainer.bottom -
              this.$refs.bodyContainer.$el.clientHeight
          } else {
            minOffsetY = -this.$refs.mainContainer.clientHeight
            maxOffsetY =
              document.body.clientHeight -
              this.$refs.windowContainer.top -
              this.$refs.windowContainer.bottom -
              this.$refs.bodyContainer.$el.clientHeight
          }
        }
        // 保证在可视范围内
        if (offsetY > maxOffsetY) offsetY = maxOffsetY
        if (offsetY < minOffsetY) offsetY = minOffsetY
        this.dragHorizontalOffset = offsetX
        this.dragVerticalOffset = offsetY
      }
    },
    // 调整大小（暂时没有考虑dragRange）
    onResizeWindow({ delta: { x, y }, position: { top, left } }) {
      if (!this.resizable) return
      let rx = x

      if (this.resizeWidth + x <= this.width) {
        rx = this.width - this.resizeWidth

        this.resizeWidth = this.width
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
        document.body.clientHeight -
        this.$refs.windowContainer.top -
        this.$refs.windowContainer.bottom -
        this.$refs.barContainer.$el.clientHeight

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

<style lang="less" scoped></style>
