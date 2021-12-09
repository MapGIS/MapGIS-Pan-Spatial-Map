/**
 * 获取属性表当前高亮tab页的结果
 * @return geojson
 */
class ActiveResultSet {
  private _activeResultSet: Record<string, any> = {}

  public get activeResultSet() {
    return this._activeResultSet
  }

  public set activeResultSet(geojson: Record<string, any>) {
    this._activeResultSet = geojson
  }
}

export default new ActiveResultSet()
