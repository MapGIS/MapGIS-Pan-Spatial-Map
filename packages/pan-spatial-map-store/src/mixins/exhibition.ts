import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class ExhibitionMixin extends Vue {
  isExhibitionActive = true

  resizeExhibition() {
    return this.onResize()
  }

  activateExhibition() {
    this.isExhibitionActive = true
    return this.onActive()
  }

  deActivateExhibition() {
    this.isExhibitionActive = false
    return this.onDeActive()
  }

  closeExhibition() {
    return this.onClose()
  }

  onResize() {}

  onActive() {}

  onDeActive() {}

  onClose() {}
}
