import { exhibitionListInstance, IExhibition } from '../../model/exhibition'

export default {
  data() {
    return {
      exhibitionList: exhibitionListInstance
    }
  },
  computed: {
    exhibitions() {
      return this.exhibitionList.exhibitions
    },
    activeExhibitionId: {
      set(id) {
        this.exhibitionList.activeExhibitionId = id
      },
      get() {
        return this.exhibitionList.activeExhibitionId
      }
    }
  },
  methods: {
    addExhibition(exhibition) {
      return this.exhibitionList.addExhibition(exhibition)
    },
    removeExhibition(exhibitionId) {
      this.exhibitionList.removeExhibition(exhibitionId)
      // 当所有的展示都被移除时，自动关闭展示面板
      if (this.exhibitions.length == 0) {
        this.closeExhibitionPanel()
      }
    },
    openExhibitionPanel() {
      this.$root.$emit('open-exhibition-panel')
    },
    closeExhibitionPanel() {
      this.$root.$emit('close-exhibition-panel')
    },
    switchExhibitionPanel() {
      this.$root.$emit('switch-exhibition-panel')
    }
  }
}
