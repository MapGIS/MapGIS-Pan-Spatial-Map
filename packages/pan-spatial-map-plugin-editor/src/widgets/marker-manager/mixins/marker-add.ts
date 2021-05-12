import { Vue, Component } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({})
export default class MarkerAddMixin extends Vue {
  async transPoints(points: any[], srcSref: string) {
    if (
      srcSref.includes('度') ||
      srcSref.includes('分') ||
      srcSref.includes('秒')
    ) {
      return points
    }
    const result: any = await utilInstance.transPoint(
      points,
      srcSref,
      'WGS1984_度'
    )
    if (result.Data && result.Data.length > 0) {
      const datas: any[] = []
      for (let i = 0; i < result.Data.length; i += 1) {
        const obj = result.Data[i]
        const data = [obj.x, obj.y]
        datas.push(data)
      }
      return datas
    }
    return points
  }
}
