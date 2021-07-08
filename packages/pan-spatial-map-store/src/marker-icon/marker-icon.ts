import { getRequest } from '../utils'
import { baseConfigInstance } from '../config'

class MarkerIcon {
  private _selectIcon: string

  private _unselectIcon: string

  public constructor() {
    this._selectIcon = ''
    this._unselectIcon = ''
  }

  public async selectIcon() {
    // 获取未选中图标
    if (!this._selectIcon) {
      this._selectIcon = await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.selectedImg
      )
    }
    return this._selectIcon
  }

  public async unSelectIcon() {
    // 获取未选中图标
    if (!this._unselectIcon) {
      this._unselectIcon = await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.defaultImg
      )
    }
    return this._unselectIcon
  }

  private async setBase64(url: string): Promise<string> {
    const res = await getRequest()({
      url: url,
      method: 'get',
      responseType: 'arraybuffer'
    })
    const str = `data:image/png;base64,${btoa(
      new Uint8Array(res).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )}`

    return str
  }
}

export default new MarkerIcon()
