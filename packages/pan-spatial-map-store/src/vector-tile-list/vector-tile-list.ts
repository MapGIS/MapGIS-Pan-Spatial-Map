export class VectorTileList {
  private static _instance: VectorTileList

  private constructor() {}

  public cesiumVectorTileList: any[] = []

  public cesiumVectorTileNames: string[] = []

  public mapboxVectorTileList: any[] = []

  public mapboxVectorTileNames: string[] = []

  public static getInstance() {
    if (!this._instance) {
      this._instance = new VectorTileList()
    }
    return this._instance
  }
}

export default VectorTileList.getInstance()
