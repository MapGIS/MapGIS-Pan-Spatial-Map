import { Vue, Component, Emit } from 'vue-property-decorator'

@Component({})
export default class DrawMixin extends Vue {
  @Emit('start')
  emitDrawStart() {}

  @Emit('finished')
  emitDrawFineshed({ mode, feature, shape, center }) {}

  private drawMode = ''

  // 打开绘制工具
  openDraw(mode) {}

  // 关闭绘制工具
  closeDraw() {}
}
