/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vue, Component } from 'vue-property-decorator'
import resultSetOperInstance, {
  IResultSetColumn,
  ResultSetColumnOper,
  IResultSetCategory
} from '../result-set/result-set'

@Component({})
export default class ResultSetMixin extends Vue {
  private readonly resultSetOper = resultSetOperInstance

  // #region 方法 addCategory[添加分类信息] removeCategory[移除分类信息] activeTable[激活表格] createColumn[创建表头项]
  public addCategory(info: IResultSetCategory) {
    return this.resultSetOper.addCategory(info)
  }

  public removeCategory(info: IResultSetCategory) {
    this.resultSetOper.removeCategory(info)
  }

  public activeTable(categoryId: string, tableId: string) {
    this.currentCategoryId = categoryId
    this.currentTableId = tableId
  }

  public createColumn(info: IResultSetColumn) {
    return new ResultSetColumnOper(info)
  }
  // #endregion

  // #region categoryId[当前激活的分类ID]
  public get currentCategoryId() {
    return this.resultSetOper.currentCategoryId
  }

  public set currentCategoryId(val: string) {
    this.resultSetOper.currentCategoryId = val
  }
  // #endregion

  // #region tableId[当前激活的表格ID]
  public get currentTableId() {
    return this.resultSetOper.currentTableId
  }

  public set currentTableId(val: string) {
    this.resultSetOper.currentTableId = val
  }
  // #endregion

  // #region tableColumns[当前激活表头信息]
  public get tableColumns() {
    if (this.currentTable) {
      return this.currentTable.columns
    }
    return []
  }

  public set tableColumns(columns: ResultSetColumnOper[]) {
    if (this.currentTable) {
      this.currentTable.columns = columns
    }
  }
  // #endregion

  // #region extraWhere[当前激活额外查询条件]
  public get extraWhere() {
    if (this.currentTable) {
      return this.currentTable.extraWhere
    }
    return ''
  }

  public set extraWhere(val: string) {
    if (this.currentTable) {
      this.currentTable.extraWhere = val
    }
  }
  // #endregion

  public get geometry() {
    if (this.currentTable) {
      return this.currentTable.geometry
    }
    return undefined
  }

  public set geometry(geometry: Record<string, unknown> | undefined) {
    if (this.currentTable) {
      this.currentTable.geometry = geometry
    }
  }

  public get categories() {
    return this.resultSetOper.categories
  }

  public get currentCategory() {
    return this.resultSetOper.currentCategory
  }

  public get tables() {
    if (this.currentCategory) {
      return this.currentCategory.tables
    }
    return []
  }

  public get currentTable() {
    return this.resultSetOper.currentTable
  }

  public get param() {
    if (this.currentCategory && this.currentTable) {
      const { ip, port, docName } = this.currentCategory
      const {
        layerIndex,
        gdbp,
        where,
        extraWhere,
        geometry
      } = this.currentTable
      let finalWhere = ''
      if (where) {
        finalWhere = where
      }
      if (extraWhere) {
        if (finalWhere) {
          finalWhere = `(${finalWhere}) and (${extraWhere})`
        } else {
          finalWhere = extraWhere
        }
      }
      return {
        ip,
        port,
        docName,
        layerIndex,
        gdbp,
        where: finalWhere,
        geometry
      }
    }
    return undefined
  }

  // #region visibleColumns[当前激活显示的列]
  public get visibleColumns() {
    return this.tableColumns.filter(x => x.visible).map(x => x.name)
  }

  public set visibleColumns(val: string[]) {
    this.tableColumns = this.tableColumns.map(x => {
      return {
        ...x,
        visible: val.includes(x.name)
      }
    })
  }
  // #endregion
}
