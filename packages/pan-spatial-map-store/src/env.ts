import axios from 'axios'

export class Env {
  private static _instance: Env

  private _config: any

  private constructor() {
    this._config = null
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new Env()
    }

    return this._instance
  }

  public get config() {
    return this._config
  }

  public static async load() {
    const instance = this.getInstance()
    if (!instance._config) {
      const {
        data = {
          whiteList: ['/login'],
          loginPath: '/login',
          baseApi: '/'
        }
      } = await axios.get('config/env.json')
      instance._config = data
    }
    return instance._config
  }
}

export default Env.getInstance()

export const loadEnv = async () => {
  await Env.load()
}
