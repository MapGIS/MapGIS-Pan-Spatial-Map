import * as Zondy from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import { WebTileLayer } from './web-tile-layer'
import { UUID } from '../../utils'

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
      //   urlTemplate:
      //     'http://wprd{subDomain}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=15',
      //   subDomains: ['01', '02', '03', '04']
      urlTemplate:
        'http://wprd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}&scl=1&ltype=15',
      subDomains: ['01', '02', '03', '04']
    }
    super(options)
  }
}
