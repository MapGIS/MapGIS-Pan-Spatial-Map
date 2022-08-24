import { Component, Vue, Mixins, Prop } from 'vue-property-decorator'
import * as turf from '@turf/turf'
import {
  DomUtil,
  AppMixin,
  ExhibitionMixin,
  LayerType,
  UUID,
  MapMixin,
  Rectangle3D,
  Feature,
  Objects,
  Exhibition
} from '@mapgis/web-app-framework'
import { ProjectorManager } from '@mapgis/pan-spatial-map-common'
import moment from 'moment'

const { GFeature, FeatureQuery, ArcGISFeatureQuery } = Feature

const { IAttributeTableOption, IAttributeTableExhibition } = Exhibition
@Component({})
export default class LayerTypeUtil extends Mixins(
  AppMixin,
  MapMixin,
  ExhibitionMixin
) {
  // // 下载包以时间命名
  // private datetime: any = Date.now()

  // csv对象
  private Json2csvParser: any = require('json2csv').Parser

  // 表格数据
  private tableData: unknown[] = []

  // 表头数据
  private tableColumns: Array = []

  private markers: Record<string, any>[] = []

  private fitBound: Record<string, any> = {}

  private selectionBound: Record<string, any> = {}

  // 是否正在加载
  private loading = false

  private currentTableParams: Record<string, any> = {}

  private showFilter = false

  private showAttrStatistics = false

  private statisticAndFilterParamas: Record<string, any> = {}

  // 是否随地图范围过滤
  private filterWithMap = false

  // 地图范围
  private geometry?: Record<string, unknown> = undefined

  private geometry3D?: Record<string, unknown> = undefined

  // 选中的行
  private selection: unknown[] = []

  selectIcon = ''

  unSelectIcon = ''

  // 分页信息
  private pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ['5', '10', '20', '30', '50'] // 这里注意只能是字符串，不能是数字
  }

  private id = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-table-wrapper`

  private tableId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-table`

  private filterId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-filter`

  private statisticsId = `${new Date().getTime()}-${Math.floor(
    Math.random() * 10
  )}-statistics`

  /* 属性表数据转为json数据的暂存属性 */
  private attrTableToJsonData = null

  private fullScreen = false

  private useScrollX = false

  private scrollY = 0

  private isActive = true

  rowKey = 'fid'

  private get optionVal() {
    return {}
  }

  private setRowKey() {
    const { serverType, isDataStoreQuery } = this.optionVal

    switch (serverType) {
      case LayerType.IGSVector:
      case LayerType.IGSMapImage:
        return isDataStoreQuery ? 'mpoid' : 'fid'
      case LayerType.ArcGISMapImage:
        return 'ID'
      case LayerType.IGSScene:
        return 'FID'
      case LayerType.EsGeoCode:
        return 'customerId'

      default:
        return 'fid'
    }
  }

  /**
   * 投屏操作
   * @param file
   * {
   *  url: 视频地址,
   *  type: 视频类型,
   *  name: 视频名称
   * }
   */
  projectScreen(file) {
    if (!this.getProjectorStatus(file.name)) {
      const {
        vFOV,
        orientationHeading,
        orientationRoll,
        positionX,
        positionY,
        positionZ,
        hFOV,
        orientationPitch
      } = file
      const cameraPosition = {
        x: positionX,
        y: positionY,
        z: positionZ
      }
      const Orientation = {
        heading: orientationHeading,
        pitch: orientationPitch,
        roll: orientationRoll
      }
      ProjectorManager.addProjector(
        this.exhibition.id,
        this.exhibition.name,
        file.name,
        file.url,
        'video',
        file.type,
        file.url,
        '',
        '',
        true,
        cameraPosition,
        Orientation,
        hFOV,
        vFOV
      )
      this.setProjectorStatus(file.name, true)
    } else {
      this.setProjectorStatus(file.name)
    }
  }

  getProjectorStatus(projectorId) {
    return ProjectorManager.getProjectorStatus(projectorId, this.exhibition.id)
  }

  setProjectorStatus(projectorId, isProjected = false) {
    return ProjectorManager.setProjectorStatus(
      projectorId,
      this.exhibition.id,
      isProjected
    )
  }

  /**
   * 当为dataStore查询时并且keyword为空，采用逆地理编码查询，获取中心点与查询范围
   */
  getLonLatDis(geoJSONExtent) {
    if (geoJSONExtent) {
      const { geometry } = geoJSONExtent
      const { coordinates } = geometry
      const from = turf.point(coordinates[0][0])
      const to = turf.point(coordinates[0][3])
      const options = { units: 'kilometers' }

      const distance = turf.rhumbDistance(from, to, options)

      const center = turf.centerOfMass(geoJSONExtent)
      return {
        lon: center.geometry.coordinates[0],
        lat: center.geometry.coordinates[1],
        dis: distance / 2
      }
    }
    return {}
  }

  /* val默认传参供attrTableToJsonData函数使用，传入val=“1”表示请求当前图层全部数据 */
  private async queryGeoJSON(
    geometry: Record<string, unknown> | undefined,
    where: string | undefined,
    val = '0'
  ) {
    this.rowKey = this.setRowKey()
    this.currentTableParams = { ...this.optionVal }
    const { ip, port, serverName, serverType, serverUrl, layerIndex, gdbp } =
      this.optionVal
    const { current, pageSize } = this.pagination
    let geojson
    const queryWhere = where || this.optionVal.where
    let queryGeometry = geometry || this.optionVal.geometry
    switch (serverType) {
      case LayerType.IGSMapImage:
      case LayerType.IGSVector:
        const { isDataStoreQuery, DNSName } = this.optionVal
        if (!isDataStoreQuery) {
          if (this.pagination.total === 0) {
            const { AttStruct, TotalCount } = await this.queryCount(
              queryGeometry,
              queryWhere
            )
            if (!(this.tableColumns && this.tableColumns.length > 0)) {
              const columns = this.setTableScroll(AttStruct)
              this.tableColumns = columns
            }
            this.pagination.total = TotalCount
          }
        }
        const page = isDataStoreQuery ? current : current - 1
        geojson = await FeatureQuery.query({
          ip,
          port: port.toString(),
          f: 'geojson',
          where: queryWhere,
          geometry: queryGeometry,
          isDataStoreQuery,
          page: val === '1' ? 0 : page,
          pageCount: val === '1' ? this.pagination.total : pageSize,
          gdbp,
          DNSName,
          docName: serverName,
          layerIdxs: layerIndex,
          coordPrecision: 8,
          rtnLabel: false
        })
        if (val === '1') {
          this.attrTableToJsonData = geojson.features
          return
        }
        this.tableData = geojson.features
        if (isDataStoreQuery) {
          this.setGeoJsonColums(geojson)
          this.pagination.total = geojson.dataCount
        }
        this.removeMarkers()
        // 如果当前是激活状态，则添加markers
        if (this.isExhibitionActive) {
          await this.addMarkers()
        }
        break

      case LayerType.ArcGISMapImage:
        if (this.pagination.total === 0) {
          const { count } = await ArcGISFeatureQuery.getTotal({
            f: 'pjson',
            where: queryWhere,
            geometry: queryGeometry,
            serverUrl,
            layerIndex
          })

          this.pagination.total = count
        }

        geojson = await ArcGISFeatureQuery.query({
          f: 'pjson',
          where: queryWhere,
          geometry: queryGeometry,
          page: val === '1' ? 0 : current - 1,
          pageCount: val === '1' ? this.pagination.total : pageSize,
          serverUrl,
          layerIndex,
          totalCount: this.pagination.total
        })

        if (val === '1') {
          this.attrTableToJsonData = geojson.feature
          return
        }
        this.tableData = geojson.features
        const columns: Array = []
        const { properties } = geojson.features[0]
        const tags = Object.keys(properties)
        if (tags.length <= 10) {
          // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
          this.useScrollX = false
        } else {
          // 10个以上，每个设固定宽度180，且启用水平滚动条
          this.useScrollX = true
        }
        if (!(this.tableColumns && this.tableColumns.length > 0)) {
          for (let index = 0; index < tags.length; index++) {
            const name = tags[index]
            const alias = tags[index] ? `${tags[index]}` : ''
            const type = 'string'
            const obj = {
              title: alias.length ? alias : name,
              key: name,
              dataIndex: `properties.${name}`,
              align: 'left',
              ellipsis: true
            }
            if (this.useScrollX) {
              obj.width = 180
            }
            // var str = '37'
            const num = Number(properties[name])
            if (!isNaN(num)) {
              obj.sorter = (a, b) =>
                Number(a.properties[name]) - Number(b.properties[name])
            }
            columns.push(obj)
          }
          this.tableColumns = columns
        }
        this.removeMarkers()
        // 如果当前是激活状态，则添加markers
        if (this.isExhibitionActive) {
          await this.addMarkers()
        }
        break

      case LayerType.IGSScene:
        // 查找矩阵集
        const source = this.sceneController.findSource(this.optionVal.id)
        queryGeometry = geometry
          ? this.getGeometry3D(source)
          : this.optionVal.geometry
        const json = await FeatureQuery.query(
          {
            ip,
            port: port.toString(),
            where: queryWhere,
            geometry: queryGeometry,
            page: current - 1,
            pageCount: pageSize,
            gdbp,
            coordPrecision: 8,
            rtnLabel: false
          },
          false,
          serverType === LayerType.IGSScene
        )
        const { AttStruct, SFEleArray = [], TotalCount } = json
        this.pagination.total = TotalCount
        if (val === '1') {
          const jsonData = await FeatureQuery.query(
            {
              ip,
              port: port.toString(),
              where: queryWhere,
              geometry: queryGeometry,
              page: 0,
              pageCount: this.pagination.total,
              gdbp,
              coordPrecision: 8,
              rtnLabel: false
            },
            false,
            serverType === LayerType.IGSScene
          )
          const { AttStruct, SFEleArray = [], TotalCount } = jsonData
          const { FldNumber = 0, FldName = [] } = AttStruct
          this.attrTableToJsonData = this.setTable(
            SFEleArray,
            source,
            FldName,
            FldNumber
          )
          return
        }
        const { FldNumber = 0, FldName = [] } = AttStruct
        if (!(this.tableColumns && this.tableColumns.length > 0)) {
          const columns = this.setTableScroll(AttStruct)
          this.tableColumns = columns
        }
        this.tableData = this.setTable(SFEleArray, source, FldName, FldNumber)
        this.removeMarkers()
        // 如果当前是激活状态，则添加markers
        if (this.isExhibitionActive) {
          await this.addMarkers()
        }
        break

      case LayerType.DataFlow:
        // 获取数据流图层实时返回的数据信息
        const features = this.dataFlowList.getDataFlowById(this.optionVal.id)
        this.setGeoJsonColums({ features, type: 'FeatureCollection' })
        this.pagination.total = features.length
        this.tableData = features
        this.removeMarkers()
        // 如果当前是激活状态，则添加markers
        if (this.isExhibitionActive) {
          await this.addMarkers()
        }
        break

      case LayerType.EsGeoCode:
        const { libName } = this.optionVal
        let lon
        let lat
        let dis
        if (!queryWhere) {
          const lonLatDis = this.getLonLatDis(this.getBounds())
          lon = lonLatDis.lon
          lat = lonLatDis.lat
          dis = lonLatDis.dis
        }
        const datastoreParams = {
          ip,
          port: port.toString(),
          where: queryWhere,
          geometry: queryGeometry,
          page: current,
          pageCount: pageSize,
          libName,
          decode: !queryWhere,
          lon,
          lat,
          dis,
          isEsGeoCode: true
        }
        const geoCode = await FeatureQuery.query(datastoreParams)
        // 将地理编码查询返回结果转换为GEOJSON格式
        if (geoCode) {
          const features = geoCode.result
          const markerCoords = []
          for (let j = 0; j < features.length; j += 1) {
            const feature = features[j]
            const coordinates = [feature.lon, feature.lat]
            const properties = {
              ...feature.detail,
              ...feature.areaAddr,
              // 由于没有返回唯一标识，这里自定义下标为唯一标识
              customerId: j
            }
            markerCoords.push({
              type: 'Feature',
              properties,
              geometry: {
                type: 'Point',
                coordinates
              }
            })
          }
          geojson = { type: 'FeatureCollection', features: markerCoords }
          this.tableData = geojson.features
          this.setGeoJsonColums(geojson)
          this.pagination.total = geoCode.totalCount
          this.removeMarkers()
          // 如果当前是激活状态，则添加markers
          if (this.isExhibitionActive) {
            await this.addMarkers()
          }
        }
        break

      default:
        break
    }
  }

  private setTableScroll(AttStruct) {
    const columns: Array = [
      {
        title: this.rowKey,
        key: this.rowKey,
        dataIndex: `properties.${this.rowKey}`,
        align: 'left',
        // 超过宽度将自动省略
        ellipsis: true,
        width: 180
      }
    ]
    const {
      FldNumber = 0,
      FldName = [],
      FldAlias = [],
      FldType = []
    } = AttStruct
    // 根据字段数计算useScrollX
    if (FldNumber <= 10) {
      // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
      this.useScrollX = false
    } else {
      // 10个以上，每个设固定宽度180，且启用水平滚动条
      this.useScrollX = true
    }
    for (let index = 0; index < FldNumber; index++) {
      const name = FldName[index]
      const alias = FldAlias[index] ? `${FldAlias[index]}` : ''
      const type = FldType[index]
      const sortable = !['GEOMETRY', 'STRING'].includes(type.toUpperCase())
      const obj = {
        title: alias.length ? alias : name,
        key: name,
        dataIndex: `properties.${name}`,
        align: 'left',
        // 超过宽度将自动省略
        ellipsis: true
      }
      if (this.useScrollX) {
        obj.width = 180
      }
      columns.push(
        sortable
          ? {
              ...obj,
              sorter: (a, b) =>
                this.sorterFunciton(
                  a.properties[name],
                  b.properties[name],
                  type
                )
            }
          : obj
      )
    }

    return columns
  }

  // 只有数字类型才会添加排序功能
  private sorterFunciton(a: any, b: any, type: string): boolean {
    const numberArr: Array<string> = [
      'BYTE',
      'SHORT',
      'INT',
      'LONG',
      'FLOAT',
      'DOUBLE',
      'BINARY'
    ]
    const timeArr: Array<string> = ['TIME', 'DATE', 'TIMESTAMP']
    if (numberArr.includes(type.toUpperCase())) {
      return a - b
    }
    if (timeArr.includes(type.toUpperCase())) {
      return moment(a) - moment(b)
    }
    return false
  }

  private getGeometry3D(source) {
    if (source) {
      const transform = source.root.transform
      const { xmin, ymin, xmax, ymax, zmin, zmax } = this.geometry3D
      const minPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmin, y: ymin, z: zmin },
        transform
      )
      const maxPosition = this.sceneController.globelPositionToLocalPosition(
        { x: xmax, y: ymax, z: zmax },
        transform
      )
      return new Rectangle3D(
        minPosition.x,
        minPosition.y,
        zmin,
        maxPosition.x,
        maxPosition.y,
        zmax
      )
    }

    return undefined
  }

  // 设置IGSScene类型的属性表table数据
  setTable(SFEleArray, source, FldName, FldNumber) {
    return (SFEleArray || []).map(({ AttValue = [], bound = {}, FID }) => {
      let boundObj = null
      if (source) {
        const tranform = source.root.transform
        const offset = source._asset.offset
        boundObj = this.sceneController.localExtentToGlobelExtent(
          bound,
          tranform,
          offset
        )
      }
      const properties = {
        FID,
        specialLayerId: this.optionVal.id,
        specialLayerBound: boundObj
      }
      for (let index = 0; index < FldNumber; index++) {
        const name = FldName[index]
        const value = AttValue[index]
        properties[name] = value
      }
      return {
        geometry: {
          coordinates: [],
          type: '3DPolygon'
        },
        properties
      }
    })
  }

  // IGSMapImage、IGSVector图层获取总页数
  private async queryCount(geometry?: Record<string, any>, where?: string) {
    const { ip, port, isDataStoreQuery, serverName } = this.optionVal
    const { layerIndex, gdbp } = this.optionVal
    const featureSet = await FeatureQuery.query({
      ip,
      port: port.toString(),
      f: 'json',
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      isDataStoreQuery,
      geometry,
      where,
      gdbp,
      docName: serverName,
      layerIdxs: layerIndex,
      rtnLabel: false
    })
    return featureSet
  }

  /**
   * 获取屏幕范围
   */
  getBounds() {
    let polygon
    if (this.is2DMapMode) {
      const { _ne, _sw } = this.map.getBounds()
      const { lng: xmax, lat: ymax } = _ne
      const { lng: xmin, lat: ymin } = _sw
      polygon = turf.polygon(
        [
          [
            [xmin, ymax],
            [xmax, ymax],
            [xmax, ymin],
            [xmin, ymin],
            [xmin, ymax]
          ]
        ],
        { name: 'bounds' }
      )
    } else {
      const Rectangle = this.viewer.camera.computeViewRectangle()
      const xmin = (Rectangle.west / Math.PI) * 180
      const ymax = (Rectangle.north / Math.PI) * 180
      const xmax = (Rectangle.east / Math.PI) * 180
      const ymin = (Rectangle.south / Math.PI) * 180
      polygon = turf.polygon(
        [
          [
            [xmin, ymax],
            [xmax, ymax],
            [xmax, ymin],
            [xmin, ymin],
            [xmin, ymax]
          ]
        ],
        { name: 'bounds' }
      )
    }
    return polygon
  }

  // 通过geoJson设置table标题数组
  setGeoJsonColums(geojson) {
    if (!geojson.features || geojson.features.length <= 0) {
      this.tableColumns = []
      return
    }
    const columns: Array = []
    const { properties } = geojson.features[0]
    const tags = Object.keys(properties)
    if (tags.length <= 10) {
      // 10个以内，不需要设固定宽度，且不需要启用水平滚动条
      this.useScrollX = false
    } else {
      // 10个以上，每个设固定宽度180，且启用水平滚动条
      this.useScrollX = true
    }
    if (!(this.tableColumns && this.tableColumns.length > 0)) {
      for (let index = 0; index < tags.length; index++) {
        const name = tags[index]
        const alias = tags[index] ? `${tags[index]}` : ''
        const type = 'string'
        const obj = {
          title: alias.length ? alias : name,
          key: name,
          dataIndex: `properties.${name}`,
          align: 'left',
          ellipsis: true
        }
        if (this.useScrollX) {
          obj.width = 180
        }
        // var str = '37'
        const num = Number(properties[name])
        if (!isNaN(num)) {
          obj.sorter = (a, b) =>
            Number(a.properties[name]) - Number(b.properties[name])
        }
        columns.push(obj)
      }
      this.tableColumns = columns
    }
  }
}
