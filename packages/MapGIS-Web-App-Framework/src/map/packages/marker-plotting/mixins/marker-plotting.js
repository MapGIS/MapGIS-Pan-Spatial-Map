export default {
  data() {
    return {
      // 高亮要素
      highlightEventName: 'highlight-feature',
      // 清除要素高亮
      clearHightlightEventName: 'clear-highlight-feature',
      // 清除结果树选中
      clearSelectionEventName: 'clear-selection-feature'
    }
  },
  methods: {
    /**
     * 监听高亮事件
     */
    registerHighlightEvent(callback) {
      this.$root.$on(this.highlightEventName, callback)
    },
    /**
     * 派发高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitHighlightEvent(marker, vueKey) {
      this.$root.$emit(this.highlightEventName, marker, vueKey)
    },
    /**
     * 移除高亮事件
     */
    unregisterHighlightEvent(callback) {
      this.$root.$off(this.highlightEventName, callback)
    },
    /**
     * 监听取消高亮事件
     */
    registerClearHighlightEvent(callback) {
      this.$root.$on(this.clearHightlightEventName, callback)
    },
    /**
     * 派发取消高亮事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    emitClearHighlightEvent(marker, vueKey) {
      this.$root.$emit(this.clearHightlightEventName, marker, vueKey)
    },
    /**
     * 移除取消高亮事件
     */
    unregisterClearHighlightEvent(callback) {
      this.$root.$off(this.clearHightlightEventName, callback)
    },
    /**
     * 监听清除选择事件
     */
    registerClearSelectionEvent(callback) {
      this.$root.$on(this.clearSelectionEventName, callback)
    },
    /**
     * 派发清除选择事件
     * @param {string} vuekey 组件唯一标识
     */
    emitClearSelectionEvent(vueKey) {
      this.$root.$emit(this.clearSelectionEventName, vueKey)
    },
    /**
     * 移除清除选择事件
     */
    unregisterClearSelectionEvent(callback) {
      this.$root.$on(this.clearSelectionEventName, callback)
    },
    /**
     * 添加高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    onHighlightFeature(marker) {},
    /**
     * 执行高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onHighlightEventCallback(marker, vueKey) {
      if (this.vueKey && this.vueKey !== vueKey) {
        this.onHighlightFeature(marker)
      }
    },
    /**
     * 清除高亮,由主组件实现
     * @param {object} marker 标注信息
     */
    onClearHighlightFeature(marker) {},
    /**
     * 执行取消高亮的回调事件
     * @param {object} marker 标注信息
     * @param {string} vuekey 组件唯一标识
     */
    onClearHighlightEventCallback(marker, vueKey) {
      if (this.vueKey && this.vueKey !== vueKey) {
        this.onClearHighlightFeature(marker)
      }
    },
    /**
     * 订阅高亮事件
     * @return {Funtion} 事件销毁回调
     */
    subscribeHighlight() {
      if (this.vueKey) {
        this.registerHighlightEvent(this.onHighlightEventCallback)
        this.registerClearHighlightEvent(this.onClearHighlightEventCallback)
      }

      return () => {
        if (this.vueKey) {
          this.unregisterHighlightEvent(this.onHighlightEventCallback)
          this.unregisterClearHighlightEvent(this.onClearHighlightEventCallback)
        }
      }
    }
  }
}
