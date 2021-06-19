import { G3D } from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'
import { SceneLayer } from './scene-layer'
import { Rectangle3D, Point3D, Size } from './3d-layer'
import { ObjectTool } from '../../utils/object-tool'

/**
 * IGServer发布的三维场景服务
 *
 * url格式：[protocol]://[ip]:[port]/igs/rest/g3d/{docName}
 *
 * @date 24/05/2021
 * @export
 * @class IGSSceneLayer
 * @extends {IGSSceneLayer}
 */
export class IGSSceneLayer extends SceneLayer {
  /**
   * Creates an instance of IGSSceneLayer.
   * @date 24/05/2021
   * @param {Record<string, any>} [properties]
   * @memberof IGSSceneLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.IGSScene

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 场景文档中的
   *
   * @date 25/05/2021
   * @type {Scene[]}
   * @memberof IGSSceneLayer
   */
  scenes: Scene[] = []

  /**
   * 当前激活的scene
   *
   * @date 25/05/2021
   * @type {(Scene | undefined)}
   * @memberof IGSSceneLayer
   */
  activeScene: Scene | undefined

  /**
   * 全图范围
   *
   * @author Yuanye Ma
   * @date 12/03/2021
   * @type {Rectangle}
   * @memberof Layer
   */
  get fullExtent(): Rectangle3D {
    if (this.activeScene && this.activeScene.sceneRange)
      return this.activeScene.sceneRange

    return this._fullExtent
  }

  load(): Promise<Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.从URL中解析出ip、port、serverName参数
    const parms = this._parseUrl(this.url)

    const promise = new Promise((resolve, reject) => {
      // 2.调用es6service中的接口进行网络请求。
      const g3dMapDoc = new G3D.G3DMapDoc(parms)
      this.loadStatus = LoadStatus.loading
      g3dMapDoc.GetDocInfo(
        res => {
          if (res && res.sceneInfos) {
            if (res.sceneInfos.length > 0) {
              res.sceneInfos.forEach(sceneInfo => {
                const scene = new Scene()

                scene.layer = this

                scene.fromJSON(sceneInfo)

                this.scenes.push(scene)
              })
            }
          }

          if (this.scenes.length > 0) this.activeScene = this.scenes[0]

          this.loadStatus = LoadStatus.loaded
          resolve(this)
        },
        failInfo => {
          this.loadStatus = LoadStatus.failed
          reject(failInfo)
        }
      )
    })

    return promise.then(data => {
      return this
    })
  }

  clone(): Layer {
    const result = new IGSSceneLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      if (key === 'activeScene') {
      } else if (key === 'scenes') {
        const scenes = element[valueIndex]
        const scenesCopy: Scene[] = []
        let sceneCopy: Scene | undefined

        scenes.forEach(scene => {
          sceneCopy = scene.clone(result)

          if (sceneCopy) {
            scenesCopy.push(sceneCopy)
          }
        })

        result[key] = scenesCopy
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    let avtiveScene: Scene | undefined

    result.scenes.forEach(scene => {
      if (scene.sceneIndex === this.activeScene?.sceneIndex) avtiveScene = scene
    })

    result.activeScene = avtiveScene

    return result
  }

  /**
   * url解析,提取对应的ip、port、docName
   * 约定URL格式如下：[protocol]://[ip]:[port]/igs/rest/g3d/{docName}
   *
   * @date 23/03/2021
   * @private
   * @param {*} url
   * @return {*}  {{ ip; port; docName }}
   * @memberof IGSTileLayer
   */
  _parseUrl(url): { ip; port; docName } {
    const ipReg = '/://[a-zA-Z0-9]+:*/g'
    const portReg = '/:+[0-9]+//g'

    const serverType = 'igs/rest/g3d/'
    const indexServer = url.search(serverType)
    const indexName = indexServer + serverType.length
    const docName = url.substr(indexName)

    const ips = url.match(/:\/\/[a-zA-Z0-9.]+:*/g)
    const ports = url.match(/:+[0-9]+\//g)

    const matchIp = ips ? ips[0] : '://localhost'
    const matchPort = ports ? ports[0] : ':6163'

    let ip = ''
    let port = ''
    if (matchIp && matchIp.length > 3) {
      ip = matchIp.slice(3, matchIp.length - 1)
    }
    if (matchPort && matchPort.length > 2) {
      port = matchPort.slice(1, matchPort.length - 1)
    }

    return { ip, port, docName }
  }
}

/**
 * 三场景服务图层子图层类型枚举
 *
 * @date 25/05/2021
 * @export
 * @enum {number}
 */
export enum IGSSceneSublayerType {
  unknow = -1, // 类型未知
  vector3D = 1, // 三维矢量数据图层
  model = 2, // 三维模型图层
  elevation = 3, // 三维高程（地形）图层
  label3D = 4, // 三维注记图层
  cloud = 5, // 三维云图层
  panorama = 6, // 三维街景图层
  mapRef = 7, // 二维Map引用图层
  modelCache = 10 // m3d模型缓存图层
}

export enum IGSSceneSublayerRenderType {
  unknow = -1, // 类型未知
  covering = 0, // 依附层
  cloud = 1, // 云层
  elevation = 2, // 地形层
  model = 3, // 模型层
  label = 4, // 注记层
  panorama = 5, // 街景图层
  modelCache = 10 // m3d模型缓存图层
}

export class Scene {
  /**
   * 该场景在场景文档中的索引
   *
   * @date 25/05/2021
   * @memberof Scene
   */
  sceneIndex = -1

  /**
   * 场景名
   *
   * @date 25/05/2021
   * @memberof Scene
   */
  sceneName = ''

  /**
   * 场景包围盒
   *
   * @date 25/05/2021
   * @type {(Rectangle3D | undefined)}
   * @memberof Scene
   */
  sceneRange: Rectangle3D | undefined

  /**
   * 场景中包含的图层列表
   *
   * @date 25/05/2021
   * @type {IGSSceneSublayer[]}
   * @memberof Scene
   */
  sublayers: IGSSceneSublayer[] = []

  /**
   * 场景所属的场景服务图层
   *
   * @date 26/05/2021
   * @type {(IGSSceneLayer | undefined)}
   * @memberof Scene
   */
  layer: IGSSceneLayer | undefined

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof Scene
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.sceneIndex !== undefined)
      this.sceneIndex = jsonObject.sceneIndex

    if (jsonObject.sceneName !== undefined)
      this.sceneName = jsonObject.sceneName

    if (jsonObject.sceneRange)
      this.sceneRange = new Rectangle3D(
        jsonObject.sceneRange.xMin,
        jsonObject.sceneRange.yMin,
        jsonObject.sceneRange.zMin,
        jsonObject.sceneRange.xMax,
        jsonObject.sceneRange.yMax,
        jsonObject.sceneRange.zMax
      )

    if (jsonObject.layers) {
      jsonObject.layers.forEach(layer => {
        const sceneSublayer = new IGSSceneSublayer()

        sceneSublayer.layer = this.layer

        sceneSublayer.fromJSON(layer)

        this.sublayers.push(sceneSublayer)
      })
    }
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof Scene
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的sublayer
   *
   * @date 02/04/2021
   * @return {*}  {Scene}
   * @memberof Scene
   */
  clone(layer?: IGSSceneLayer): Scene {
    const result = new Scene()

    result.layer = layer

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      if (key === 'layer') {
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: IGSSceneSublayer[] = []
        let sublayerCopy: IGSSceneSublayer | undefined

        sublayers.forEach(sublayer => {
          sublayerCopy = sublayer.clone(result)

          if (sublayerCopy) {
            sublayersCopy.push(sublayerCopy)
          }
        })

        result[key] = sublayersCopy
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }
}

export class IGSSceneSublayer {
  /**
   * 图层唯一id
   *
   * @author Yuanye Ma
   * @date 12/03/2021
   * @type {string}
   * @memberof IGSSceneSublayer
   */
  id = ''

  /**
   * 子图层的索引
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  renderIndex = -1

  /**
   * 子图层名称
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  title = ''

  /**
   * 子图层gdbp地址,如果是模型缓存图层的话，为mcj文件的路径。
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  url = ''

  /**
   * 子图层是否可见
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  visible = true

  /**
   * 子图层类型
   *
   * @date 25/05/2021
   * @type {IGSSceneSublayerType}
   * @memberof IGSSceneSublayer
   */
  type: IGSSceneSublayerType = IGSSceneSublayerType.unknow

  /**
   * 子图层渲染类型
   *
   * @date 25/05/2021
   * @type {IGSSceneSublayerRenderType}
   * @memberof IGSSceneSublayer
   */
  renderType: IGSSceneSublayerRenderType = IGSSceneSublayerRenderType.unknow

  /**
   * 子图层的外包范围
   *
   * @date 25/05/2021
   * @type {(Rectangle3D | undefined)}
   * @memberof IGSSceneSublayer
   */
  range: Rectangle3D | undefined

  /**
   * 开始级别
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  beginLevel = -1

  /**
   * 结束级别
   *
   * @date 25/05/2021
   * @memberof IGSSceneSublayer
   */
  endLevel = -1

  /**
   * 网格划分的源点
   *
   * @date 25/05/2021
   * @type {(Point3D | undefined)}
   * @memberof IGSSceneSublayer
   */
  originPoint: Point3D | undefined

  /**
   * 最大网格大小
   *
   * @date 25/05/2021
   * @type {(Size | undefined)}
   * @memberof IGSSceneSublayer
   */
  maxFrameSize: Size | undefined

  /**
   * 子图层所属的场景服务图层
   *
   * @date 26/05/2021
   * @type {(IGSSceneLayer | undefined)}
   * @memberof IGSSceneSublayer
   */
  layer: IGSSceneLayer | undefined

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof IGSSceneSublayer
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.layerRenderIndex !== undefined)
      this.renderIndex = jsonObject.layerRenderIndex

    if (jsonObject.layerName !== undefined) this.title = jsonObject.layerName

    if (jsonObject.gdbpUrl !== undefined) this.url = jsonObject.gdbpUrl

    if (jsonObject.isVisible !== undefined) this.visible = jsonObject.isVisible

    if (jsonObject.layerType !== undefined)
      this.type = parseInt(jsonObject.layerType) // 字符转数字。

    if (jsonObject.layerRenderType !== undefined)
      this.renderType = jsonObject.layerRenderType

    if (jsonObject.range3D !== undefined) {
      this.range = new Rectangle3D(
        jsonObject.range3D.xMin,
        jsonObject.range3D.yMin,
        jsonObject.range3D.zMin,
        jsonObject.range3D.xMax,
        jsonObject.range3D.yMax,
        jsonObject.range3D.zMax
      )
    }

    if (jsonObject.beginLevel !== undefined)
      this.beginLevel = jsonObject.beginLevel

    if (jsonObject.endLevel !== undefined) this.endLevel = jsonObject.endLevel

    if (jsonObject.originalPoints) {
      this.originPoint = new Point3D(
        jsonObject.originalPoints.x,
        jsonObject.originalPoints.y,
        0
      )
    }

    if (jsonObject.frameSizes && jsonObject.frameSizes.length > 0) {
      this.maxFrameSize = new Size(
        jsonObject.frameSizes[0].wid,
        jsonObject.frameSizes[0].hel
      )
    }

    if (this.layer) this.id = `${this.layer.id}:${this.renderIndex}`
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof IGSSceneSublayer
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的sublayer
   *
   * @date 02/04/2021
   * @return {*}  {IGSSceneSublayer}
   * @memberof IGSSceneSublayer
   */
  clone(scene?: Scene): IGSSceneSublayer {
    const result = new IGSSceneSublayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'layer') {
        if (scene) result[key] = scene.layer
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }
}
