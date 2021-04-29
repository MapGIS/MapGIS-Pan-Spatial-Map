import { Vue, Component } from 'vue-property-decorator'
import { exhibitionListInstance, IExhibition } from '../exhibition'

@Component({})
export default class ExhibitionControllerMixin extends Vue {
  private readonly exhibitionList = exhibitionListInstance

  get exhibitions() {
    return this.exhibitionList.exhibitions
  }

  addExhibition(exhibition: IExhibition) {
    return this.exhibitionList.addExhibition(exhibition)
  }

  removeExhibition(exhibitionId: string) {
    this.exhibitionList.removeExhibition(exhibitionId)
  }

  get activeExhibitionId() {
    return this.exhibitionList.activeExhibitionId
  }

  set activeExhibitionId(id: string) {
    this.exhibitionList.activeExhibitionId = id
  }

  openExhibitionPanel() {
    this.$root.$emit('open-exhibition-panel')
  }

  closeExhibitionPanel() {
    this.$root.$emit('close-exhibition-panel')
  }

  switchExhibitionPanel() {
    this.$root.$emit('switch-exhibition-panel')
  }
}
