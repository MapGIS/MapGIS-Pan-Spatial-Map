<template>
  <q-page-sticky
    :position="position"
    :offset="realPos"
    :expand="expand"
    v-show="show"
    ref="body"
  >
    <q-card class="transparent" ref="box">
      <q-bar
        class="bg-title text-title"
        :style="{ cursor: canMove ? 'all-scroll' : 'auto', width: realWidth }"
      >
        <div class="text-weight-bold col-grow" v-touch-pan.prevent.mouse="move">
          {{ title }}
        </div>
        <q-btn
          dense
          flat
          v-if="shrinkAction"
          :icon="showBody ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
          @click="showBody = !showBody"
        >
        </q-btn>
        <q-btn
          dense
          flat
          v-if="fullScreenAction"
          :icon="fullScreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="fullScreen = !fullScreen"
        >
        </q-btn>
        <q-btn dense flat icon="close" @click="close" />
      </q-bar>
      <div class="col bg-container text-container">
        <div
          v-show="showBody"
          class="scroll"
          :style="{ width: realWidth, height: realHeight }"
        >
          <slot :visible="show" :close="close" />
        </div>
      </div>
    </q-card>
  </q-page-sticky>
</template>

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  PropSync,
  Ref,
  Watch
} from 'vue-property-decorator'

interface MoveEvent {
  delta: {
    x: number
    y: number
  }
}

@Component({ name: 'MpWidgetPanel' })
export default class MpWidgetPanel extends Vue {
  @Ref() readonly body!: any

  @Ref() readonly box!: any

  // 窗体方位
  // top-left | top | top-right | right | bottom-right | bottom | bottom-left | left
  @Prop({ type: String, default: 'top-right' }) readonly position!: string

  // 初始位置
  @Prop({ type: Array, default: () => [0, 0] }) readonly offset!: number[]

  // 是否展开
  @Prop({ type: Boolean, default: false }) readonly expand!: boolean

  // 显示标题
  @Prop({ type: String }) readonly title?: string

  // 是否显示
  @PropSync('visible', { type: Boolean, default: false })
  private show!: boolean

  // 内容宽度
  @Prop({ type: Number, default: 360 }) readonly width!: number

  // 内容高度
  @Prop({ type: Number })
  height?: number

  // 相对于主视图顶的距离
  @Prop({ type: Number, default: 0 })
  readonly top!: number

  // 相对于主视图底的距离
  @Prop({ type: Number, default: 0 })
  readonly bottom!: number

  // 是否使用绝对位置
  @Prop({ type: Boolean, default: false })
  readonly absolute!: boolean

  // 是否有收缩动作
  @Prop({ type: Boolean, default: true })
  readonly shrinkAction!: boolean

  // 是否有全屏动作
  @Prop({ type: Boolean, default: true })
  readonly fullScreenAction!: boolean

  // 是否显示内容
  private showBody = true

  // 是否全屏
  private fullScreen = false

  // 移动之后的位置，默认为初始位置
  private movePos = this.offset

  // 相对于屏幕的偏移
  private leftToScreen = 0

  private rightToScreen = 0

  private topToScreen = 0

  private bottomToScreen = 0

  private heightPixel = '100px'

  created() {
    if (this.height) {
      this.heightPixel = `${this.height}px`
    }

    this.$nextTick(() => {
      this.getToScreenOffset()
    })
  }

  // 是否是水平布局
  // 上下悬停
  private get isHorizontal() {
    return ['top', 'bottom'].includes(this.position)
  }

  // 是否是垂直布局
  // 左右悬停
  private get isVertical() {
    return ['left', 'right'].includes(this.position)
  }

  // 是否允许拖动
  // 全屏以及展开时不允许拖动
  private get canMove() {
    return !this.fullScreen && !this.expand
  }

  // 真实的内容宽度
  // 全屏(fullScreen)|水平展开(expand && isHorizontal)：计算q-page的宽度
  // 正常情况：使用传入的宽度
  private get realWidth() {
    this.getToScreenOffset()

    if (this.fullScreen || (this.expand && this.isHorizontal))
      // 全屏|水平展开：总宽度减去左右布局宽度
      return `calc(100vw - ${this.leftToScreen}px - ${this.rightToScreen}px)`
    return `${this.width}px`
  }

  // 真实的内容高度
  // 全屏(fullScreen)|垂直展开(expand && isVertical)：计算q-page的高度并减去title的高度
  // 正常情况：使用传入的高度
  private get realHeight() {
    this.getToScreenOffset()

    if (this.fullScreen || (this.expand && this.isVertical)) {
      // 全屏|垂直展开：总高度减去上下布局高度减去title高度
      return `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px)`
    }
    return this.heightPixel
  }

  // 真实的位置，主要为了保证全屏的时候在0，0位置
  private get realPos() {
    if (this.canMove) return this.movePos
    return [0, 0]
  }

  @Watch('offset', { deep: true })
  updateOffset() {
    this.movePos = this.offset
    if (this.absolute) {
      const x = this.position.includes('left')
        ? this.offset[0]
        : document.documentElement.clientWidth - this.offset[0]
      const y = this.position.includes('top')
        ? this.offset[1]
        : document.documentElement.clientHeight - this.offset[1]
      this.movePos = [x - 32, y - 32]
    }
  }

  @Watch('height', { deep: true })
  updateHeight() {
    if (this.height) {
      this.heightPixel = `${this.height}px`
    }
  }

  // 获取相对于屏幕的偏移
  private getToScreenOffset() {
    const { body = {} } = this
    const { left, right, top, bottom } = body
    this.leftToScreen = left
    this.rightToScreen = right
    this.topToScreen = top
    this.bottomToScreen = bottom

    // 如果height为undefined
    if (!this.height) {
      if (['top-left', 'top-right', 'top'].includes(this.position)) {
        this.heightPixel = `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px - ${this.offset[1]}px - ${this.bottom}px)`
      } else if (
        ['bottom-left', 'bottom-right', 'bottom'].includes(this.position)
      ) {
        this.heightPixel = `calc(100vh - ${this.topToScreen}px - ${this.bottomToScreen}px - 32px - ${this.offset[1]}px - ${this.top}px)`
      }
    }
  }

  // 移动事件
  // 只有在允许移动的时候生效
  // 通过此次移动的相对位置以及上次的位置计算新的位置
  // 注意xy的加减问题
  private move({ delta: { x, y } }: MoveEvent) {
    if (this.canMove) {
      const { position, movePos } = this
      // 基于左右计算x轴偏移量
      let px = position.includes('left') ? movePos[0] + x : movePos[0] - x
      // 保证在可视范围内
      const maxpx =
        document.body.clientWidth -
        this.body.left -
        this.body.right -
        this.box.$el.clientWidth
      if (px > maxpx) px = maxpx
      if (px < 0) px = 0
      // 基于上下计算y轴偏移量
      let py = position.includes('top') ? movePos[1] + y : movePos[1] - y
      // 保证在可视范围内
      const maxpy =
        document.body.clientHeight -
        this.body.top -
        this.body.bottom -
        this.box.$el.clientHeight
      if (py > maxpy) py = maxpy
      if (py < 0) py = 0

      this.movePos = [px, py]
    }
  }

  // 关闭事件
  private close() {
    this.show = false
  }
}
</script>

<style lang="scss" scoped></style>
