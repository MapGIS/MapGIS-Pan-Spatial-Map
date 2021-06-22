import * as Zondy from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import { WebTileLayer } from './web-tile-layer'
import { UUID } from '../../utils'

/**
 * 高德墨卡托电子地图
 * 数据从第3级到第18级
 * @date 28/04/2021
 * @export
 * @class AMapMercatorEMapLayer
 * @extends {WebTileLayer}
 */
export class AMapMercatorEMapLayer extends WebTileLayer {
  /**
   * Creates an instance of AMapMercatorEMapLayer.
   * @date 23/04/2021
   * @memberof AMapMercatorEMapLayer
   */
  constructor() {
    const options = {
      title: 'AMapEMap',
      description: 'AMapEMap - Map data',
      id: UUID.uuid(),
      urlTemplate:
        'http://wprd{subDomain}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=15',
      subDomains: ['01', '02', '03', '04']
    }
    super(options)

    this.type = LayerType.aMapMercatorEMap
  }
}

/**
 * 高德墨卡托卫星地图
 * 数据从第1级到第18级
 *
 * @date 28/04/2021
 * @export
 * @class AMapMercatorSatelliteMapLayer
 * @extends {WebTileLayer}
 */
export class AMapMercatorSatelliteMapLayer extends WebTileLayer {
  /**
   * Creates an instance of AMapMercatorSatelliteMapLayer.
   * @date 23/04/2021
   * @memberof AMapMercatorSatelliteMapLayer
   */
  constructor() {
    const options = {
      title: 'AMapMercatorSatellite',
      description: 'AMapEMap - Map data',
      id: UUID.uuid(),
      urlTemplate:
        'http://wprd{subDomain}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11',
      subDomains: ['01', '02', '03', '04']
    }
    super(options)

    this.type = LayerType.aMapMercatorSatelliteMap
  }
}

/**
 * 高德墨卡托卫星注记地图
 * 数据从第3级到第18级
 * @date 28/04/2021
 * @export
 * @class AMapMercatorSatelliteAnnMapLayer
 * @extends {WebTileLayer}
 */
export class AMapMercatorSatelliteAnnMapLayer extends WebTileLayer {
  /**
   * Creates an instance of AMapMercatorSatelliteAnnMapLayer.
   * @date 23/04/2021
   * @memberof AMapMercatorSatelliteAnnMapLayer
   */
  constructor() {
    const options = {
      title: 'AMapMercatorSatelliteAnn',
      description: 'AMapEMap - Map data',
      id: UUID.uuid(),
      urlTemplate:
        'http://wprd{subDomain}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}&scl=1&ltype=12',
      subDomains: ['01', '02', '03', '04']
    }
    super(options)

    this.type = LayerType.aMapMercatorSatelliteAnnMap
  }
}
