const set = new Set<string>()

export class MarkerState {
  constructor(private selectedIds = set) {
    if (!new.target) {
      throw new Error('MarkerState类应该被实例化使用')
    } else {
      this.selectedIds = selectedIds
    }
  }

  public getSelectedIds() {
    return this.selectedIds
  }

  public setSelectedIds(markerId: string) {
    this.selectedIds.add(markerId)
  }

  public removeSelectedIds(markerId: string) {
    this.selectedIds.delete(markerId)
  }

  public clearSelectedIds() {
    this.selectedIds.clear()
  }
}

export default new MarkerState()
