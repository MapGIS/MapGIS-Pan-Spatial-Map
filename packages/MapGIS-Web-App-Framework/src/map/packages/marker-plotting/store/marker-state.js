const set = new Set()

export class MarkerState {
  constructor(selectedIds = set) {
    if (!new.target) {
      throw new Error('MarkerState类应该被实例化使用')
    } else {
      this.selectedIds = selectedIds
    }
  }

  hasSelecteId(markerId) {
    return this.selectedIds.has(markerId)
  }

  getSelectedIds() {
    return this.selectedIds
  }

  setSelectedIds(markerId) {
    if (!this.hasSelecteId(markerId)) {
      this.selectedIds.add(markerId)
    }
  }

  removeSelectedIds(markerId) {
    if (this.hasSelecteId(markerId)) {
      this.selectedIds.delete(markerId)
    }
  }

  clearSelectedIds() {
    this.selectedIds.clear()
  }
}

export default new MarkerState()
