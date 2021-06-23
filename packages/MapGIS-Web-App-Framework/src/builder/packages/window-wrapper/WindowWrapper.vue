<template>
  <div class="mp-map-panel-virtual" style="display: none">
    <mp-window-card
      ref="mapPanelContainer"
      v-show="visible"
      @mousedown.native.capture="onClick"
    >
      <slot :z-index="state === this.activeState ? 2 : 1" />
    </mp-window-card>
  </div>
</template>

<script>
import { UUID } from '../../../model/utils'
import MpWindowCard from './WindowCard.vue'
import PanelManager from '../../managers/panel-manager'
import WidgetManager from '../../managers/widget-manager'
import WidgetState from '../../utils/widget-state'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpWindowWrapper',
  components: { MpWindowCard },
  props: {
    visible: { type: Boolean, default: true }
  },
  data() {
    return { id: UUID.uuid(), state: '', activeState: WidgetState.ACTIVE }
  },
  watch: {
    visible: {
      handler(newState, oldState) {
        if (newState) {
          WidgetManager.getInstance().activateWidget(this)
        }
      },
      immediate: true
    }
  },
  mounted() {
    PanelManager.getInstance().addPanel({
      id: this.id,
      content: this.$refs.mapPanelContainer.$el
    })
    WidgetManager.getInstance().openWidget(this)
  },
  beforeDestroy() {
    PanelManager.getInstance().removePanel({
      id: this.id,
      content: this.$refs.mapPanelContainer.$el
    })
  },
  methods: {
    onClick() {
      WidgetManager.getInstance().activateWidget(this)
    }
  }
}
</script>

<style lang="less" scoped></style>
