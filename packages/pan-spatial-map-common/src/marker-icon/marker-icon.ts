import { getRequest } from '../utils'
import { baseConfigInstance } from '../config'
import { AppManager } from '@mapgis/web-app-framework'

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
      this._selectIcon = (await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.selectedImg
      )) as string
    }
    return this._selectIcon
  }

  public async unSelectIcon() {
    // 获取未选中图标
    if (!this._unselectIcon) {
      this._unselectIcon = (await this.setBase64(
        baseConfigInstance.config.colorConfig.label.image.defaultImg
      )) as string
    }
    return this._unselectIcon
  }

  private setBase64(url: string) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = '*'
      image.onload = () => {
        const base64 = this.drawBase64Image(image)
        resolve(base64)
      }
      image.onerror = () => {
        const err = new Error(`图片加载失败 ${url}`)
        reject(err)
      }
      const application = AppManager.getInstance().getApplication()
      image.src = `${application.baseAPI}${url}`
    })
  }

  drawBase64Image(img) {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.drawImage(img, 0, 0, img.width, img.height)
    const dataURL = canvas.toDataURL('image/png')
    return dataURL
  }
}

export default new MarkerIcon()
