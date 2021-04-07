import { Component } from 'vue-property-decorator'
/**
 * 结果集操作对象
 */

/**
 * 结果集表头对象
 */
export interface IResultSetColumn {
  // 唯一的标识
  name: string
  // 头部标签
  label?: string
  // 行对象属性以确定此列的值
  field?: string | Function
  // （可选）如果我们使用可见列，这个列将始终可见
  required?: boolean
  // （可选）对齐
  align?: string
  // （可选）告诉你想要这个列可排序
  sortable?: boolean
  // （可选）比较功能，如果你有
  //  一些自定义数据或想要一个特定的方式来比较两行
  // 函数返回值：
  // *小于0，然后将a排序为低于b的索引，即首先出现
  // *为0，则相对于彼此保持a和b不变，但相对于所有不同的元素进行排序
  // *大于0，则将b排序为低于a的索引，即b先到达
  sort?: Function
  // （可选）您可以使用函数格式化数据
  format?: Function
  // body td:
  style?: string
  classes?: string
  // (v1.3.0+) header th:
  headerStyle?: string
  headerClasses?: string
  // 字段类型（扩展：对应数据的类型）
  type?: string
  // 是否显示列（扩展：是否显示当前列）
  visible?: boolean
}

export class ResultSetColumnOper implements IResultSetColumn {
  name: string

  label: string

  field: string | Function

  required: boolean | undefined

  align: string | undefined

  sortable: boolean | undefined

  sort: Function | undefined

  format: Function | undefined

  style: string | undefined

  classes: string | undefined

  headerStyle: string | undefined

  headerClasses: string | undefined

  type: string

  visible: boolean

  constructor(info: IResultSetColumn) {
    this.name = info.name
    this.label = info.label || info.name
    this.field = info.field || info.name
    this.required = info.required
    this.align = info.align
    this.sortable = info.sortable
    this.sort = info.sort
    this.format = info.format
    this.style = info.style
    this.classes = info.classes
    this.headerStyle = info.headerStyle
    this.headerClasses = info.headerClasses
    this.type = info.type || 'string'
    this.visible = info.type === undefined ? true : (info.visible as boolean)
  }
}

/**
 * 结果集表格
 */
export interface IResultSetTable {
  // 唯一标识
  id?: string
  // 显示标签
  label: string
  // gdbp地址，图层查询
  gdbp?: string
  // 图层索引，文档查询
  layerIndex?: string
  // 初始查询条件
  where?: string
  // 额外的查询条件
  extraWhere?: string
  // 表头信息，方便插件对结果集的操作
  columns?: IResultSetColumn[]
  // geometry
  geometry?: Record<string, unknown>
  // 服务IP
  ip?: string
  // 服务PORT
  port?: number
  // 服务名称
  serverName?: string
  // 服务类型
  serverType?: string
  // 服务路径
  serverUrl?: string

  component?: string
}

export class ResultSetTableOper implements IResultSetTable {
  id: string

  label: string

  gdbp: string

  layerIndex: string

  where: string

  extraWhere: string

  columns: ResultSetColumnOper[]

  geometry: Record<string, unknown> | undefined

  ip: string | undefined

  port: number | undefined

  serverName: string | undefined

  serverType: string | undefined

  serverUrl: string | undefined

  component: string | undefined

  constructor(info: IResultSetTable) {
    this.id = info.id || Math.random().toString()
    this.label = info.label
    this.gdbp = info.gdbp || ''
    this.layerIndex = info.layerIndex || ''
    this.where = info.where || ''
    this.extraWhere = info.extraWhere || ''
    this.columns = (info.columns || []).map(x => new ResultSetColumnOper(x))
    this.geometry = info.geometry
    this.ip = info.ip
    this.port = info.port
    this.serverName = info.serverName
    this.serverType = info.serverType
    this.serverUrl = info.serverUrl
    this.component = info.component || 'MpResultTab'
  }
}

/**
 * 结果集分类
 */
export interface IResultSetCategory {
  // 唯一标识
  id?: string
  // 服务IP
  ip?: string
  // 服务PORT
  port?: number
  // 显示标签
  label: string
  // 服务名称
  serverName?: string
  // 服务类型
  serverType?: string
  // 服务路径
  serverUrl?: string
  // 子tabs活跃的tab
  tab?: string
  // 表格列表
  tables: IResultSetTable[]
  component?: string
  // gdbp地址，图层查询
  gdbp?: string
  // geometry
  geometry?: Record<string, unknown>
}

const defaultIp = '127.0.0.1'
const defaultPort = 6163
export class ResultSetCategoryOper implements IResultSetCategory {
  id: string

  ip: string

  port: number

  label: string

  serverName: string

  serverType: string

  serverUrl: string

  tab: string

  tables: IResultSetTable[]

  component: string

  gdbp: string

  geometry: Record<string, unknown>

  constructor(info: IResultSetCategory) {
    this.id = info.id || Math.random().toString()
    this.ip = info.ip || defaultIp
    this.port = info.port || defaultPort
    this.label = info.label
    this.serverName = info.serverName || ''
    this.serverType = info.serverType || ''
    this.serverUrl = info.serverUrl || ''
    this.tables = (info.tables || []).map(x => new ResultSetTableOper(x))
    this.geometry = (info.geometry as Record<string, unknown>) || undefined
    if (info.tables.length > 0) {
      this.tab = info.tables[info.tables.length - 1].id as string
    } else {
      this.tab = ''
    }
    this.component = info.component || 'MpResultTab'
    this.gdbp = info.gdbp || ''
  }
}

export interface IResultSet {
  // 分类集
  categories: ResultSetCategoryOper[]

  // 当前分类Id
  currentCategoryId: string

  // 当前分类对象
  currentCategory: ResultSetCategoryOper | undefined

  // 当前表格Id
  currentTableId: string

  // 当前表格对象
  currentTable: IResultSetTable | undefined

  // 添加分类
  addCategory(info: IResultSetCategory): ResultSetCategoryOper

  // 移除分类
  removeCategory(info: IResultSetCategory): void

  // 移除二级菜单
  removeTable(key: string): void
}

/**
 * 结果集操作类
 */
export class ResultSetOper implements IResultSet {
  categories: ResultSetCategoryOper[] = []

  currentCategoryId = ''

  public get currentTableId() {
    return (this.currentCategory as ResultSetCategoryOper).tab
  }

  public set currentTableId(key: string) {
    ;(this.currentCategory as ResultSetCategoryOper).tab = key
  }

  public get currentCategory() {
    return this.categories.find(x => x.id === this.currentCategoryId)
  }

  public get currentTable() {
    if (this.currentCategory) {
      return this.currentCategory.tables.find(
        x => x.id === (this.currentCategory as ResultSetCategoryOper).tab
      )
    }
    return undefined
  }

  public addCategory(info: IResultSetCategory) {
    const category = new ResultSetCategoryOper(info)
    if (this.categories.length > 0) {
      const index = this.categories.findIndex(item => item.id === category.id)
      if (index > -1) {
        const item = this.categories[index]
        const { tables = [] } = item
        if (category.tables.length > 0) {
          const i = tables.findIndex(
            row => category.tables && row.id === (category.tables || [{}])[0].id
          )
          if (i > -1) {
            tables.splice(i, 1)
          }
          tables.push(new ResultSetTableOper(category.tables[0]))
        }
        this.categories[index] = { ...category, tables }
      } else {
        this.categories.push(category)
      }
    } else {
      this.categories.push(category)
    }

    this.categories = this.categories.map(item => {
      if (item.tables.length > 0) {
        item.tab = item.tables[item.tables.length - 1].id as string
      } else {
        item.tab = ''
      }
      return item
    })

    const categoryItem = this.categories.find(
      x => x.id === category.id
    ) as ResultSetCategoryOper

    return categoryItem
  }

  public removeCategory(info: IResultSetCategory) {
    const index = this.categories.findIndex(category => {
      return category.id === info.id
    })

    if (index > -1) {
      this.categories.splice(index, 1)
    }
  }

  public removeTable(key: string) {
    const index = (this
      .currentCategory as ResultSetCategoryOper).tables.findIndex(
      x => x.id === key
    )
    if (index > -1) {
      ;(this.currentCategory as ResultSetCategoryOper).tables.splice(index, 1)
      // 当移除的table是正在展示的table的时候，需要将激活的table设置为最后一个,如果table为空，则删除父层
      const { tables } = this.currentCategory as ResultSetCategoryOper
      if (tables.length > 0) {
        if (this.currentTableId === key) {
          this.currentTableId = tables[tables.length - 1].id as string
        }
      } else {
        this.removeCategory(this.currentCategory as ResultSetCategoryOper)
      }
    }
  }
}

/**
 * 结果操作对象
 */
export default new ResultSetOper()
