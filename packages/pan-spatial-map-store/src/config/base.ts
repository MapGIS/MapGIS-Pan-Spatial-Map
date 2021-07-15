import api from '../api'

export class BaseConfig {
  private static _instance: BaseConfig

  private _config: any

  private constructor() {
    this._config = null
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new BaseConfig()
    }

    return this._instance
  }

  public get config() {
    return this._config
  }

  public static async load() {
    const instance = this.getInstance()
    if (!instance._config) {
      const config = await api.getConfig('base')
      instance._config = config
    }
    return instance._config
  }
}

export default BaseConfig.getInstance()
