import { LocalStorage } from 'quasar'
import { ILayout, IScaffold } from '@mapgis/pan-spatial-map-plugin-layout-ui'

/**
 * 获取布局
 * @param data 项目信息
 */
export default function(data: IScaffold): ILayout {
  const { active, layouts } = data
  const activeLayout = LocalStorage.getItem<string>('active-layout') || ''
  const ids = [activeLayout, active]
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index]
    const result = layouts.find(layout => layout.id === id)
    if (result) return result
  }
  return layouts[0]
}
