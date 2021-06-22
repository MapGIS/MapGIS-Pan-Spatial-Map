export interface IFields {
  // 名称
  name: string
  // 可见性
  visible: boolean
  // 标题
  title: string
}

export interface IExhibition {
  // 唯一标识
  id?: string
  // 名称
  name: string
  // 描述
  description?: string
  // 全局组件名
  component?: string
}

export interface IAttributeTableOption {
  // 唯一标识
  id?: string
  // 名称
  name: string
  // 服务IP
  ip?: string
  // 服务PORT
  port?: number
  // 服务类型
  serverType?: string
  // 服务名称
  serverName?: string
  // 服务路径
  serverUrl?: string
  // gdbp地址，图层查询
  gdbp?: string
  // 图层索引，文档查询
  layerIndex?: string
  // 初始查询条件
  where?: string
  // 查询集合
  geometry?: Record<string, unknown>
  // 字段信息
  fields?: IFields[]
}

export interface IAttributeTableExhibition extends IExhibition {
  // 选项
  option: IAttributeTableOption
}

export interface IAttributeTableListExhibition extends IExhibition {
  // 选项
  options: IAttributeTableOption[]
}

class AttributeTableOption implements IAttributeTableOption {
  id?: string

  name: string

  ip: string | undefined

  port: number | undefined

  serverType: string | undefined

  serverName: string | undefined

  serverUrl: string | undefined

  gdbp: string

  layerIndex: string

  where: string

  geometry: Record<string, unknown> | undefined

  fields: IFields[]

  constructor(info: IAttributeTableOption) {
    this.id = info.id || Math.random().toString()
    this.name = info.name
    this.ip = info.ip
    this.port = info.port
    this.serverType = info.serverType
    this.serverName = info.serverName
    this.serverUrl = info.serverUrl
    this.gdbp = info.gdbp || ''
    this.layerIndex = info.layerIndex === undefined ? '' : info.layerIndex
    this.where = info.where || ''
    this.fields = info.fields || []
    this.geometry = info.geometry
  }
}

export class AttributeTableExhibition implements IAttributeTableExhibition {
  // 唯一标识
  id: string

  // 名称
  name: string

  // 描述
  description: string

  // 全局组件名
  component?: string

  // 选项
  option: IAttributeTableOption

  constructor(info: IAttributeTableExhibition) {
    this.id = info.id || Math.random().toString()
    this.name = info.name
    this.description = info.description || ''
    this.component = info.component || 'MpAttributeTable'
    this.option = new AttributeTableOption(info.option)
  }
}

export class AttributeTableListExhibition
  implements IAttributeTableListExhibition {
  // 唯一标识
  id: string

  // 名称
  name: string

  // 描述
  description: string

  // 全局组件名
  component?: string

  // 选项
  options: IAttributeTableOption[]

  // 激活选项
  activeOptionId: string

  constructor(info: IAttributeTableListExhibition) {
    this.id = info.id || Math.random().toString()
    this.name = info.name
    this.description = info.description || ''
    this.component = info.component || 'MpAttributeTableList'
    this.options = (info.options || []).map(
      option => new AttributeTableOption(option)
    )
    if (this.options.length > 0) {
      this.activeOptionId = this.options[this.options.length - 1].id as string
    } else {
      this.activeOptionId = ''
    }
  }
}

// 展示列表
export class ExhibitionList {
  exhibitions: IExhibition[] = []

  activeExhibitionId = ''

  addExhibition(exhibition: IExhibition) {
    if (this.exhibitions.length > 0) {
      const index = this.exhibitions.findIndex(
        item => item.id === exhibition.id
      )
      if (index > -1) {
        // 已经存在相同id的展示，进行替换
        this.exhibitions.splice(index, 1, exhibition)
        this.activeExhibitionId = exhibition.id as string
        return
      }
    }

    this.exhibitions.push(exhibition)
    this.activeExhibitionId = this.exhibitions[this.exhibitions.length - 1]
      .id as string
  }

  removeExhibition(exhibitionId: string) {
    let isLastExhibition = false
    const index = this.exhibitions.findIndex(item => {
      return item.id === exhibitionId
    })

    if (index > -1) {
      isLastExhibition = index === this.exhibitions.length - 1

      this.exhibitions.splice(index, 1)

      if (this.exhibitions.length > 0) {
        if (this.activeExhibitionId === exhibitionId) {
          if (isLastExhibition) {
            // 被删除的是最后一个激活的，仍旧设置最后一个为激活
            this.activeExhibitionId = this.exhibitions[
              this.exhibitions.length - 1
            ].id as string
          } else {
            // 被删除的不是最后一个激活的，直接设置下一个为激活
            this.activeExhibitionId = this.exhibitions[index].id as string
          }
        }
      } else {
        this.activeExhibitionId = ''
      }
    }
  }
}

// 展示列表
export default new ExhibitionList()
