export default {
  data() {
    return {
      drawMode: ''
    }
  },
  methods: {
    // 打开绘制工具
    openDraw(mode) {},
    // 关闭绘制工具
    closeDraw() {},
    emitDrawStart() {
      this.$emit('start')
    },
    emitDrawFineshed({ mode, feature, shape, center }) {
      this.$emit('finished', { mode, feature, shape, center })
    }
  }
}
