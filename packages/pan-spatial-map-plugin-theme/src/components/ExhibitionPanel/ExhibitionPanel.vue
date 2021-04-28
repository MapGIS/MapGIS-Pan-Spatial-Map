<template>
  <div ref="exhibitionPanel" class="mp-exhibition-panel">
    <template v-if="closeable">
      <span class="switch-button" @click="onSwitchExhibitionPanel">
        <a-icon :type="iconType" />
      </span>
    </template>
    <div
      v-show="open"
      class="exhibition-panel-wrapper"
      :style="{ height: `${viewHeight}px` }"
    >
      <!-- Top Resize Handle -->
      <div class="resize-line-wrapper">
        <div class="resize-line" @mousedown="onResizeExhibitionPanel"></div>
      </div>
      <div class="exhibition-panel">
        <a-tabs
          v-if="exhibitions.length > 0"
          v-model="activeExhibitionId"
          type="editable-card"
          size="small"
          hide-add
          @edit="onEdit"
        >
          <a-tab-pane
            v-for="exhibition in exhibitions"
            :key="exhibition.id"
            :tab="exhibition.name"
          >
            <component
              :is="exhibition.component"
              :ref="exhibition.id"
              :exhibition="exhibition"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { ExhibitionControllerMixin } from '@mapgis/pan-spatial-map-store'
import elementResizeDetectorMaker from 'element-resize-detector'

export default {
  name: 'MpExhibitionPanel',
  mixins: [ExhibitionControllerMixin],
  props: {
    maxViewHeight: { type: Number, required: false, default: 400 },
    initOpen: { type: Boolean, default: false },
    closeable: { type: Boolean, required: false, default: true }
  },
  data() {
    return {
      viewHeight: this.maxViewHeight * 0.4,
      initViewHeight: this.maxViewHeight * 0.4,
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
      this.viewHeight = this.maxViewHeight * 0.4
      this.initViewHeight = this.maxViewHeight * 0.4
    },
    activeExhibitionId(newVal, oldVal) {
      // 延迟10毫秒执行
      setTimeout(() => {
        if (this.$refs[oldVal] && this.$refs[oldVal][0]) {
          this.$refs[oldVal][0].deActivateExhibition()
        }
        if (this.$refs[newVal] && this.$refs[newVal][0]) {
          this.$refs[newVal][0].activateExhibition()
          this.$refs[newVal][0].resizeExhibition()
        }
      }, 10)
    }
  },
  created() {
    this.$root.$on(
      'switch-exhibition-panel',
      this.onSwitchExhibitionPanel.bind(this)
    )
    this.$root.$on(
      'open-exhibition-panel',
      this.onOpenExhibitionPanel.bind(this)
    )
    this.$root.$on(
      'close-exhibition-panel',
      this.onCloseExhibitionPanel.bind(this)
    )
  },
  mounted() {
    this.watchExhibitionPanelSize()
  },
  methods: {
    onResizeExhibitionPanel(event) {
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
    onSwitchExhibitionPanel() {
      this.open = !this.open
      if (this.open && this.viewHeight === 0) {
        this.viewHeight = this.initViewHeight
      }
    },
    onOpenExhibitionPanel() {
      this.open = true

      if (this.open && this.viewHeight === 0) {
        this.viewHeight = this.initViewHeight
      }
    },
    onCloseExhibitionPanel() {
      this.open = false
    },
    onEdit(activeId, action) {
      this[action](activeId)
    },
    remove(activeId) {
      this.removeExhibition(activeId)
      this.$refs[activeId][0].closeExhibition()
    },
    resizeActiveExhibition() {
      if (this.$refs[this.activeExhibitionId]) {
        this.$refs[this.activeExhibitionId][0].resizeExhibition()
      }
    },
    watchExhibitionPanelSize() {
      const erd = elementResizeDetectorMaker()
      erd.listenTo(this.$refs.exhibitionPanel, element => {
        this.resizeActiveExhibition()
      })
    }
  }
}
</script>

<style lang="less">
.exhibition-panel {
  background-color: @base-bg-color;
  padding-top: 2px;
  flex: auto;
  .ant-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    &.ant-tabs-card {
      .ant-tabs-card-bar {
        margin-bottom: 0;
        .ant-tabs-nav-container {
          height: 32px;
          .ant-tabs-tab {
            height: 32px;
            line-height: 32px;
          }
        }
      }
      .ant-tabs-content {
        flex: auto;
        .ant-tabs-tabpane-inactive {
          height: 0;
        }
        .ant-tabs-tabpane-active {
          height: 100%;
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
.mp-exhibition-panel {
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
    border: 1px solid @primary-color;
    border-bottom-color: transparent;
    cursor: pointer;

    &:hover {
      color: white;
      background: @primary-color;
    }
  }
  .exhibition-panel-wrapper {
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
    .exhibition-panel {
      background-color: @base-bg-color;
      padding-top: 2px;
      flex: auto;
    }
  }
}
</style>
