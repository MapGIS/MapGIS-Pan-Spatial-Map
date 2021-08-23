export default {
  data() {
    return {
      isExhibitionActive: true
    }
  },
  methods: {
    resizeExhibition() {
      return this.onResize()
    },
    activateExhibition() {
      this.isExhibitionActive = true
      return this.onActive()
    },
    deActivateExhibition() {
      this.isExhibitionActive = false
      return this.onDeActive()
    },
    closeExhibition() {
      return this.onClose()
    },
    onResize() {},
    onActive() {},
    onDeActive() {},
    onClose() {}
  }
}
