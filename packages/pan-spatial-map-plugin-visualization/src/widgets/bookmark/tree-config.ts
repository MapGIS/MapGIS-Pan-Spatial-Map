export class TreeConfig {
  private static _instance: TreeConfig

  public readonly config = {
    GUID: 'guid'
  }

  private constructor() {}

  public static getInstance() {
    if (!this._instance) {
      this._instance = new TreeConfig()
    }
    return this._instance
  }
}
