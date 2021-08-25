class ComputeZoomOffset {
  /**
   * key：瓦片尺寸  “256,512,1024”
   * val: 层级与分辨关系数组
   */
  levelResolutionToTileSizes = {}

  /**
   * 通过瓦片大小获取层级与分辨关系的数组
   * @param {*} TileSize 瓦片尺寸，三维用的瓦片尺寸为512的levelResolution数组
   * @returns 层级与分辨关系的数组
   */
  getLevelResolutionByTileSize(TileSize) {
    if (!this.levelResolutionToTileSizes[TileSize]) {
      const arr = []
      for (let level = 0; level <= 24; level++) {
        const r = 6378137 // 赤道半径
        const resolutionOnTheEquator = 360 / (TileSize * 2 ** level)
        arr.push({
          level,
          resolution: resolutionOnTheEquator
        })
      }
      this.levelResolutionToTileSizes[TileSize] = arr
    }
    return this.levelResolutionToTileSizes[TileSize]
  }

  /**
   * 获取cesium层级与分辨率关系的数组
   * @returns 层级与分辨率关系的数组
   */
  getLevelResolutionCesium() {
    return this.getLevelResolutionByTileSize(512)
  }

  /**
   * 通过分辨率获取其在地图里面对应的层级
   * @param {number} resolution 当前层级分辨率
   * @param {Array<Record<string,number>>} levelResolutions 地图的层级与最大分辨率的对应关系
   * @returns 当前分辨对应地图里面的层级
   */
  getNearLevel(resolution, levelResolutions) {
    const levelResolutionsTemp = JSON.parse(JSON.stringify(levelResolutions))
    const nearlevel = levelResolutionsTemp.sort(function(a, b) {
      return (
        Math.abs(a.resolution - resolution) -
        Math.abs(b.resolution - resolution)
      )
    })[0].level
    return nearlevel
  }

  /**
   * 通过分辨率来计算偏移量
   * @param {number} resolution 当前层级分辨率
   * @param {Array<Record<string,number>>} levelResolutions 当前层级与分辨率关系数组
   * @param {number} levelValue 初始层级
   * @returns 偏移量
   */
  getZoomOffsetByResolution({ resolution, levelResolutions, levelValue }) {
    // 获取当前分辨率对应cesium里面的层级，计算偏移量
    const level = this.getNearLevel(resolution, levelResolutions)
    const zoomOffset = levelValue - level

    return zoomOffset
  }

  /**
   * 通过瓦片信息来计算偏移量
   * @param {number} tileInfo 瓦片信息
   * @param {boolean} isCesium 如果是三维图层，则不需要通过size去计算层级与瓦片的数组
   * @returns 偏移量
   */
  getZoomOffsetByTileInfo(tileInfo, isCesium = false) {
    let levelResolutions = []
    const lodBegin = tileInfo.lods[0]
    if (!isCesium) {
      let size = 256
      if (tileInfo.size.length > 0) {
        size = tileInfo.size[0]
      }
      levelResolutions = this.getLevelResolutionByTileSize(size)
    } else {
      levelResolutions = this.getLevelResolutionCesium()
    }
    const zoomOffset = this.getZoomOffsetByResolution({
      resolution: lodBegin.resolution,
      levelResolutions: levelResolutions,
      levelValue: lodBegin.levelValue
    })

    return zoomOffset
  }
}
export default new ComputeZoomOffset()
