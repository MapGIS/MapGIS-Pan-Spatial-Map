import { BaseEvent } from '../event/event'

export class MapTypeChange extends BaseEvent {
  private _mapType: string

  constructor() {
    super()
    this._mapType = ''
  }

  public get mapType() {
    return this._mapType
  }

  public set mapType(type: string) {
    this._mapType = type
  }
}

const mapTypeChangeInstance: MapTypeChange = new MapTypeChange()

export default mapTypeChangeInstance
