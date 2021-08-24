/**
 * 通过分辨率获取其在地图里面对应的层级
 * @param {number} resolution 当前层级分辨率
 * @param {Array<Record<string,number>>} levelResolutions 地图的层级与最大分辨率的对应关系
 * @returns 当前分辨对应地图里面的层级
 */
export function getLevelInMap(resolution, levelResolutions) {
  const levelResolutionsTemp = JSON.parse(JSON.stringify(levelResolutions))
  const nearlevel = levelResolutionsTemp.sort(function(a, b) {
    return (
      Math.abs(a.resolution - resolution) - Math.abs(b.resolution - resolution)
    )
  })[0].level
  return nearlevel
}

/**
 * 通过分辨率来计算偏移量
 * @param {number} resolution 当前层级分辨率
 * @param {Array<Record<string,number>>} levelResolutions 当前层级与分辨率关系数组
 * @param {number} levelValue 初始层级
 * @param {boolean} isWGS84 是否为经纬度
 * @returns 偏移量
 */
export function getZoomOffsetByResolution({
  resolution,
  levelResolutions,
  levelValue,
  isWGS84
}) {
  debugger
  // 如果分辨率单位为（度/像素）需要转换为（米/像素）
  resolution = isWGS84 ? resolution * 111194.872221777 : resolution
  // 获取当前分辨率对应cesium里面的层级，计算偏移量
  const level = getLevelInMap(resolution, levelResolutions)
  const zoomOffset = levelValue - level

  return zoomOffset
}
