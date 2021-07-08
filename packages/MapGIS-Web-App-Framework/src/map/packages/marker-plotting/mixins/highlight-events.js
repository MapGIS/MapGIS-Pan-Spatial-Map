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
     * 移除高亮事件
     */
    offHighlight(callback) {
      eventBus.$off(this.highlightEventName, callback)
    },
    /**
     * 监听高亮事件
     */
    onHighlight(callback) {
      eventBus.$on(this.highlightEventName, callback)
    },
    /**
     * 派发高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitHighlight(marker, vueKey) {
      eventBus.$emit(this.highlightEventName, marker, vueKey)
    },
    /**
     * 移除取消高亮事件
     */
    offClearHighlight(callback) {
      eventBus.$off(this.clearHightlightEventName, callback)
    },
    /**
     * 监听取消高亮事件
     */
    onClearHighlight(callback) {
      eventBus.$on(this.clearHightlightEventName, callback)
    },
    /**
     * 派发取消高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitClearHighlight(marker, vueKey) {
      eventBus.$emit(this.clearHightlightEventName, marker, vueKey)
    },
    /**
     * 派发取消结果树选中
     * @param {string} vuekey 组件唯一标识
     */
    emitClearQueryTreeSelected(vueKey) {
      eventBus.$emit(this.clearQueryTreeSelectedEventName, vueKey)
    },
    /**
     * 添加高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    addHighlight(marker) {},
    /**
     * 执行高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onHighlightCallback(marker, vueKey) {
      if (this.vueKey && this.vueKey !== vueKey) {
        this.addHighlight(marker)
      }
    },
    /**
     * 清除高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    clearHighlight(marker) {},
    /**
     * 执行取消高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onClearHighlightCallback(marker, vueKey) {
      if (this.vueKey && this.vueKey !== vueKey) {
        this.clearHighlight(marker)
      }
    },
    /**
     * 订阅高亮事件
     * @return {Funtion} 事件销毁回调
     */
    subscribeHighlight() {
      if (this.vueKey) {
        this.onClearHighlight(this.onClearHighlightCallback)
        this.onHighlight(this.onHighlightCallback)
      }

      return () => {
        if (this.vueKey) {
          this.offClearHighlight(this.onClearHighlightCallback)
          this.offHighlight(this.onHighlightCallback)
        }
      }
    }
  }
}
