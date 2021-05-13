import { Layer, LoadStatus, LayerType } from './layer'
/**
 * 组图层
 *
 * @date 06/04/2021
 * @export
 * @class GroupLayer
 * @extends {Layer}
 */
export class GroupLayer extends Layer {
  /**
   * Creates an instance of GroupLayer.
   * @date 12/05/2021
   * @param {Record<string, any>} [properties]
   * @memberof GroupLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)
  }

  /**
   * 子图层列表
   *
   * @date 06/04/2021
   * @type {Layer[]}
   * @memberof Map
   */
  layers: Layer[] = []

  /**
   * 所有图层,包括组图层的子图层
   *
   * @date 06/04/2021
   * @readonly
   * @type {Layer[]}
   * @memberof Map
   */
  get allLayers(): Layer[] {
    if (this._allLayers.length === 0) this.isDirty = true

    if (this.isDirty) {
      this._allLayers = []
      this.layers.forEach(layer => {
        this.getAllLayers(layer, this._allLayers)
      })

      this.isDirty = false
    }

    return this._allLayers
  }

  /**
   * 根据图层ID查找对应图层
   *
   * @date 06/04/2021
   * @return {*}  {Layer}
   * @memberof GroupLayer
   */
  findLayerById(layerID: string): Layer | undefined {
    let layerTemp: Layer | undefined
    this.allLayers.forEach(layer => {
      if (layer.id === layerID) {
        layerTemp = layer
      }
    })

    return layerTemp
  }

  /**
   * 在指定索引前添加图层
   *
   * @date 06/04/2021
   * @param {Layer} layer       待添加的图层
   * @param {number} [index]    可选参数，默认添加到最后。
   * @return {*}  {GroupLayer}  组图层
   * @memberof GroupLayer
   */
  add(layer: Layer, index?: number): GroupLayer {
    let indexTemp = this.layers.length

    if (index) {
      if (index >= 0 && index <= this.layers.length) {
        indexTemp = index
      }
    }

    this.layers.splice(indexTemp, 0, layer)
    this.isDirty = true

    return this
  }

  /**
   * 从图层列表中删除指定的图层
   *
   * @date 06/04/2021
   * @param {Layer} layer   待删除的图层
   * @return {*}  {Layer}   从图层列表中删除的图层
   * @memberof GroupLayer
   */
  remove(layer: Layer): Layer | undefined {
    let layerToDel: Layer | undefined
    const i = this.layers.indexOf(layer)
    if (i !== -1) {
      layerToDel = layer
      this.layers.splice(i, 1)
      this.isDirty = true
    }

    return layerToDel
  }

  /**
   * 删除所有子图层
   *
   * @date 06/04/2021
   * @return {*}  {Layer[]}   删除的子图层
   * @memberof GroupLayer     组图层
   */
  removeAll(): Layer[] {
    const ret: Layer[] = this.layers
    this.layers.splice(0, this.layers.length)
    this.isDirty = true

    return ret
  }

  /**
   * 获取叶子节点图层（不包含GroupLayer的图层）
   *
   * @date 07/04/2021
   * @return {*}  {Layer[]}   叶子节点图层列表
   * @memberof GroupLayer     组图层
   */
  getFlatLayers(): Layer[] {
    const flatLayers = this.allLayers.filter(layer => {
      if (layer.type !== LayerType.group) {
        return true
      }
      return false
    })

    return flatLayers
  }

  /**
   * 加载图层
   *
   * 依次调用子图层的加载方法
   *
   * @date 06/04/2021
   * @return {*}  {Promise<Layer>}
   * @memberof GroupLayer
   */
  load(): Promise<Layer> {
    const promise = new Promise((resolve, reject) => {
      if (this.loadStatus === LoadStatus.notLoaded) {
        this.loadStatus = LoadStatus.loading

        this.layers.forEach(layer => {
          layer.load()
        })

        this.loadStatus = LoadStatus.loaded
      }

      resolve(this)
    })

    return promise.then(data => {
      return this
    })
  }

  /**
   * 创建一个深度克隆的GroupLayer
   *
   * @date 06/04/2021
   * @return {*}  {Layer}
   * @memberof GroupLayer
   */
  clone(): Layer {
    const result = new GroupLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      if (key === 'layers') {
        const layers = element[valueIndex]
        const layersCopy: Layer[] = []
        let layerCopy: Layer | undefined

        layers.forEach(layer => {
          layerCopy = layer.clone()
          if (layerCopy) layersCopy.push(layerCopy)
        })

        result[key] = layersCopy
      } else if (key === '_allLayers') {
      } else {
        result[key] = this._deepClone(element[valueIndex])
      }
    })

    return result
  }

  private _allLayers: Layer[] = []

  // 用于标识是否需要重新生成_allLayers.当layers更新时，请将该标志置为true.
  private isDirty = true

  private getAllLayers(layer: Layer, allLayers: Layer[]) {
    allLayers.push(layer)
    if (layer instanceof GroupLayer) {
      layer.layers.forEach(element => {
        this.getAllLayers(element, allLayers)
      })
    }
  }
}
