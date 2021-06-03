import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'

@Component({})
export default class MarkerCommonMixin extends Vue {
  // 开始标注
  openMarker(mode) {}
}
