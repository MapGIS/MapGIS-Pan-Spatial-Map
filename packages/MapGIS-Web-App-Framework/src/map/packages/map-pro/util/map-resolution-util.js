/**
 * 通过分辨率获取其在地图里面对应的层级
 * @param {number} resolution 当前层级分辨率
 * @param {Array<Record<string,number>>} levelResolutions 地图的层级与最大分辨率的对应关系
 * @returns 当前分辨对应地图里面的层级
 */
export function getLevelInMap(resolution, levelResolutions) {
  let level = 0
  levelResolutions.forEach((levelResolution, index) => {
    if (index < levelResolutions.length - 1) {
      if (
        resolution <= levelResolution.resolution &&
        resolution > levelResolutions[index + 1].resolution
      ) {
        level = levelResolution.level
      }
    } else {
      if (resolution <= levelResolution.resolution) {
        level = levelResolution.level
      }
    }
  })
  return level
}
