import axios from 'axios'
import { colors } from 'quasar'
import { IScaffold } from '@mapgis/pan-spatial-map-plugin-layout-ui'
import getLayout from '../utils/layout'

/**
 * 初始化主题
 * @param scaffold 项目信息
 */
export default async function(scaffold: IScaffold) {
  const layout = getLayout(scaffold)
  const path = layout.themeJson || scaffold.defaultThemeJson
  const { data: themeInfo } = await axios.get(path)
  Object.entries<string>(themeInfo).forEach(([key, value]) => {
    colors.setBrand(key, value)
  })
}
