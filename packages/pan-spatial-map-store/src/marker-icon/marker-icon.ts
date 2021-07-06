import { getRequest } from '../utils'
import { baseConfigInstance } from '../config'

class MarkerIcon {
  private _selectIcon: string

  private _unselectIcon: string

  public constructor() {
    this._selectIcon = ''
    this._unselectIcon = ''
  }

  /**
   * 获取选中图标, 获取失败终止后续执行?劫持异常,处理并抛出错误?
   * @param {Function} next 获取图标之后的操作
   * @returns {Promise} 图标
   */
  public async selectIcon(next?: (icon: string) => void): Promise<string> {
    if (!this._selectIcon) {
      this._selectIcon = await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.selectedImg
      )
    }
    next && next(this._selectIcon)
    return this._selectIcon
  }

  /**
   * 获取未选中图标
   * @param {Function} next 获取图标之后的操作
   * @returns {Promise} 图标
   */
  public async unSelectIcon(next?: (icon: string) => void): Promise<string> {
    if (!this._unselectIcon) {
      this._unselectIcon = await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.defaultImg
      )
    }
    next && next(this._unselectIcon)
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
