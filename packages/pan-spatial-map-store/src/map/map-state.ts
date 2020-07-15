export class MapState {
  private _initZoom: number

  private _initCenter: {
    lng: number
    lat: number
  }

  constructor() {
    this._initZoom = 3
    this._initCenter = { lng: 114, lat: 30 }
  }

  public get initZoom() {
    return this._initZoom
  }

  public set initZoom(zoom: number) {
    this._initZoom = zoom
  }

  public set initCenter({ lng, lat }) {
    this._initCenter.lng = lng
    this._initCenter.lat = lat
  }

  public get initCenter() {
    return this._initCenter
  }
}

const mapStateInstance: MapState = new MapState()

export default mapStateInstance
