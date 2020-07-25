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

  constructor(info: IResultSetTable) {
    this.id = info.id || Math.random().toString()
    this.label = info.label
    this.gdbp = info.gdbp || ''
    this.layerIndex = info.layerIndex || ''
    this.where = info.where || ''
    this.extraWhere = info.extraWhere || ''
    this.columns = (info.columns || []).map(x => new ResultSetColumnOper(x))
    this.geometry = info.geometry
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
  // 服务名称，文档查询
  docName?: string
  // 表格列表
  tables?: IResultSetTable[]
  component?: string
}

const defaultIp = '127.0.0.1'
const defaultPort = 6163
export class ResultSetCategoryOper implements IResultSetCategory {
  id: string

  ip: string

  port: number

  label: string

  docName: string

  tables: ResultSetTableOper[]

  component: string

  constructor(info: IResultSetCategory) {
    this.id = info.id || Math.random().toString()
    this.ip = info.ip || defaultIp
    this.port = info.port || defaultPort
    this.label = info.label
    this.docName = info.docName || ''
    this.tables = (info.tables || []).map(x => new ResultSetTableOper(x))
    this.component = info.component || 'MpResultTab'
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
  currentTable: ResultSetTableOper | undefined

  // 添加分类
  addCategory(info: IResultSetCategory): ResultSetCategoryOper
}

/**
 * 结果集操作类
 */
export class ResultSetOper implements IResultSet {
  categories: ResultSetCategoryOper[] = []

  currentCategoryId = ''

  currentTableId = ''

  public get currentCategory() {
    return this.categories.find(x => x.id === this.currentCategoryId)
  }

  public get currentTable() {
    if (this.currentCategory) {
      return this.currentCategory.tables.find(x => x.id === this.currentTableId)
    }
    return undefined
  }

  public addCategory(info: IResultSetCategory) {
    const category = new ResultSetCategoryOper(info)
    this.categories.push(category)
    return category
  }

  public removeCategory(info: IResultSetCategory) {
    const index = this.categories.findIndex(category => {
      return category.id === info.id
    })

    if (index > -1) {
      this.categories.splice(index, 1)
    }
  }

  public updateTableInfo(info: IResultSetTable) {
    for (let i = 0; i < this.categories.length; i += 1) {
      const { tables } = this.categories[i]
      for (let j = 0; j < tables.length; j += 1) {
        const table = tables[j]
        if (table.id === info.id) {
          Object.assign(table, info)
          return
        }
      }
    }
  }
}

/**
 * 结果操作对象
 */
export default new ResultSetOper()
