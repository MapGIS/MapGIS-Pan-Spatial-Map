export interface IBaseLayersConfigServer {
  loadConfig(): Promise<any>
}

export class BaseLayersConfig {
  private static _instance: BaseLayersConfig

  private _config: any

  private _server: any

  private constructor() {
    this._config = null
    this._server = null
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new BaseLayersConfig()
    }

    return this._instance
  }

  public get config() {
    return this._config
  }

  public set server(server: IBaseLayersConfigServer) {
    this._server = server
  }

  public static async loadConfig() {
    const instance = this.getInstance()
    if (!instance._config && instance._server) {
      const { data } = await instance._server.loadConfig()
      instance._config = data
    }
    return instance._config
  }
}

export default BaseLayersConfig.getInstance()
