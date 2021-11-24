class DataFlowList {
  private _dataFlowList: Array<DataFlowContent> = []

  public getDataFlowById(id: string): Array<Record<string, any>> {
    const dataFlowContent = this._dataFlowList.find(
      dataFlowContent => dataFlowContent.id === id
    )
    if (dataFlowContent) {
      return dataFlowContent.positions
    }
    return []
  }

  public setDataFlowById(id: string, positions: Array<Record<string, any>>) {
    const dataFlowContent = this._dataFlowList.find(
      dataFlowContent => dataFlowContent.id === id
    )
    if (dataFlowContent) {
      dataFlowContent.positions = positions
    } else {
      this._dataFlowList.push(new DataFlowContent(id, positions))
    }
  }
}

class DataFlowContent {
  public id: string

  public positions: Array<Record<string, any>>

  constructor(id: string, positions: Array<Record<string, any>>) {
    this.id = id
    this.positions = positions
  }
}

export default new DataFlowList()
