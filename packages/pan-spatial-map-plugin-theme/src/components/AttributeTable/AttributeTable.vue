<template>
  <div class="mp-attribute-table">
    <template v-if="closeable">
      <span class="switch-button" @click="switchAttributeTable">
        <a-icon :type="iconType" />
      </span>
    </template>
    <div v-show="open" :style="{ height: `${viewHeight}px` }">
      <!-- Top Resize Handle -->
      <div class="resize-line-wrapper">
        <div class="resize-line" @mousedown="resizeAttributeTable"></div>
      </div>
      <div class="result-set-container"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MpAttributeTable',
  props: {
    maxViewHeight: { type: Number, required: false, default: 400 },
    initOpen: { type: Boolean, default: false },
    closeable: { type: Boolean, required: false, default: true }
  },
  data() {
    return {
      viewHeight: this.maxViewHeight / 3,
      initViewHeight: this.maxViewHeight / 3,
      open: this.initOpen
    }
  },
  computed: {
    iconType() {
      return `${this.open ? 'down' : 'up'}`
    }
  },
  watch: {
    maxViewHeight() {
      this.viewHeight = this.maxViewHeight / 3
      this.initViewHeight = this.maxViewHeight / 3
    }
  },
  created() {
    this.$root.$on(
      'switch-attribute-table',
      this.switchAttributeTable.bind(this)
    )
    this.$root.$on('open-attribute-table', this.openAttributeTable.bind(this))
    this.$root.$on('close-attribute-table', this.closeAttributeTable.bind(this))
  },
  methods: {
    resizeAttributeTable(event) {
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
    },
    switchAttributeTable() {
      this.open = !this.open
      if (this.open && this.viewHeight === 0) {
        this.viewHeight = this.initViewHeight
      }
    },
    openAttributeTable() {
      this.open = true

      if (this.open && this.viewHeight === 0) {
        this.viewHeight = this.initViewHeight
      }
    },
    closeAttributeTable() {
      this.open = false
    }
  }
}
</script>

<style lang="less" scoped>
.mp-attribute-table {
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
  .result-set-container {
    flex: auto;
  }
}
</style>
