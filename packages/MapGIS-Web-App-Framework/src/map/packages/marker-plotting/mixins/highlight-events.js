import { eventBus, events } from '@mapgis/pan-spatial-map-store'

export default {
  data() {
    return {
      highlightEventName: events.FEATURE_HIGHLIGHT,
      clearHightlightEventName: events.CLEAR_FEATURE_HIGHLIGHT,
      clearQueryTreeSelectedEventName: events.CLEAR_QUERY_TREE_SELECTED
    }
  },
  methods: {
    /**
     * 执行高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onHighlightCallback(marker, vueKey) {
      if (this.vueKey !== vueKey) {
        this.addHighlight(marker)
      }
    },
    /**
     * 移除高亮事件
     */
    offHighlight() {
      if (this.vueKey) {
        eventBus.$off(this.highlightEventName, this.onHighlightCallback)
      }
    },
    /**
     * 监听高亮事件
     */
    onHighlight() {
      if (this.vueKey) {
        eventBus.$on(this.highlightEventName, this.onHighlightCallback)
      }
    },
    /**
     * 派发高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitHighlight(marker, vueKey) {
      if (this.vueKey === vueKey) {
        eventBus.$emit(this.highlightEventName, marker, vueKey)
      }
    },
    /**
     * 执行取消高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onClearHighlightCallback(marker, vueKey) {
      if (this.vueKey !== vueKey) {
        this.clearHighlight(marker)
      }
    },
    /**
     * 移除取消高亮事件
     */
    offClearHighlight() {
      if (this.vueKey) {
        eventBus.$off(
          this.clearHightlightEventName,
          this.onClearHighlightCallback
        )
      }
    },
    /**
     * 监听取消高亮事件
     */
    onClearHighlight() {
      if (this.vueKey) {
        eventBus.$on(
          this.clearHightlightEventName,
          this.onClearHighlightCallback
        )
      }
    },
    /**
     * 派发取消高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitClearHighlight(marker, vueKey) {
      if (this.vueKey === vueKey) {
        eventBus.$emit(this.clearHightlightEventName, marker, vueKey)
      }
    },
    /**
     * 派发取消结果树选中
     * @param {string} vuekey 组件唯一标识
     */
    emitClearQueryTreeSelected(vueKey) {
      if (this.vueKey === vueKey) {
        eventBus.$emit(this.clearQueryTreeSelectedEventName, vueKey)
      }
    },
    /**
     * 清除高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    clearHighlight(marker) {},
    /**
     * 添加高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    addHighlight(marker) {},
    /**
     * 订阅高亮事件
     * @return {Funtion} 事件销毁回调
     */
    subscribeHighlight() {
      this.onClearHighlight()
      this.onHighlight()
      return () => {
        this.offClearHighlight()
        this.offHighlight()
      }
    }
  }
}
