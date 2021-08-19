/**
 * 通过分辨率获取其在地图里面对应的层级
 * @param {number} resolution 当前层级分辨率
 * @param {Array<Record<string,number>>} levelResolutions 地图的层级与最大分辨率的对应关系
 * @returns 当前分辨对应地图里面的层级
 */
export function getLevelInMap(resolution, levelResolutions) {
  let level = levelResolutions.length - 1
  for (let index = levelResolutions.length - 1; index >= 1; index--) {
    const levelResolution = levelResolutions[index]
    if (resolution > levelResolution.resolution) {
      level = levelResolutions[index - 1].level
    }
  }
  return level
}
