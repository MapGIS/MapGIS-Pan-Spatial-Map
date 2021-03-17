<template>
  <div class="mp-widget-attribute-table">
    <template v-if="closeable">
      <span class="switch-button" @click="onSwitchAttributeTable">
        <a-icon :type="iconType" />
      </span>
    </template>
    <div
      v-show="open"
      class="attribute-table-wrapper"
      :style="{ height: `${viewHeight}px` }"
    >
      <!-- Top Resize Handle -->
      <div class="resize-line-wrapper">
        <div class="resize-line" @mousedown="onResizeAttributeTable"></div>
      </div>
      <div class="attribute-table"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpAttributeTable' })
export default class MpAttributeTable extends Mixins(WidgetMixin) {
  @Prop({ type: Number, required: false, default: 400 })
  readonly maxViewHeight!: number

  @Prop({ type: Boolean, default: false })
  readonly initOpen!: boolean

  @Prop({ type: Boolean, required: false, default: true })
  readonly closeable!: boolean

  viewHeight = this.maxViewHeight / 3

  initViewHeight = this.maxViewHeight / 3

  open = this.initOpen

  get iconType() {
    return `${this.open ? 'down' : 'up'}`
  }

  @Watch('maxViewHeight')
  onMaxViewHeightChanged() {
    this.viewHeight = this.maxViewHeight / 3
    this.initViewHeight = this.maxViewHeight / 3
  }

  created() {
    this.$root.$on(
      'switch-attribute-table',
      this.onSwitchAttributeTable.bind(this)
    )
    this.$root.$on('open-attribute-table', this.onOpenAttributeTable.bind(this))
    this.$root.$on(
      'close-attribute-table',
      this.onCloseAttributeTable.bind(this)
    )
  }

  onResizeAttributeTable(event) {
    let startY = event.clientY
    const self = this
    const move = moveEvent => {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      const offset = startY - moveEvent.clientY
      startY -= offset

      const height = self.viewHeight + offset

      if (height > self.maxViewHeight) {
        self.viewHeight = self.maxViewHeight
      } else if (height < 10) {
        self.viewHeight = 0
        self.open = false
      } else {
        self.viewHeight = height
      }
    }

    const up = moveEvent => {
      document.removeEventListener('mousemove', move, true)
      document.removeEventListener('mouseup', up, true)
    }
    document.addEventListener('mousemove', move, true)
    document.addEventListener('mouseup', up, true)
  }

  onSwitchAttributeTable() {
    this.open = !this.open
    if (this.open && this.viewHeight === 0) {
      this.viewHeight = this.initViewHeight
    }
  }

  onOpenAttributeTable() {
    this.open = true

    if (this.open && this.viewHeight === 0) {
      this.viewHeight = this.initViewHeight
    }
  }

  onCloseAttributeTable() {
    this.open = false
  }
}
</script>

<style lang="less" scoped>
.mp-widget-attribute-table {
  display: flex;
  flex-direction: column;
  position: relative;
  .switch-button {
    position: absolute;
    width: 64px;
    left: calc(50% - 32px);
    top: calc(-1em - 2px);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: @base-bg-color;
    border-radius: 4px 4px 0 0;
    border: 1px solid @border-color;
    border-bottom-color: transparent;
    cursor: pointer;

    &:hover {
      color: white;
      background: @primary-color;
    }
  }
  .attribute-table-wrapper {
    display: flex;
    flex-direction: column;
    .resize-line-wrapper {
      position: relative;
      .resize-line {
        width: 100%;
        border: 1px solid @border-color;
        cursor: ns-resize;

        &:hover {
          border-color: @primary-color;
        }
      }
    }
    .attribute-table {
      background-color: @base-bg-color;
      flex: auto;
    }
  }
}
</style>
