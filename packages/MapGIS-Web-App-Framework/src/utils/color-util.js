export function isHex(color) {
  return color.length >= 4 && color[0] == '#'
}

export function isRgb(color) {
  return color.length >= 10 && color.slice(0, 3) == 'rgb'
}

export function isRgba(color) {
  return color.length >= 13 && color.slice(0, 4) == 'rgba'
}

/**
 * 获取颜色的r g b a,支持#16进制模式和rgb字符串模式
 * @param color
 * @param opacity
 * @returns {{a: number, r: number, b: number, g: number}}
 */
export function getColorObject(color, opacity) {
  let tempColor = color
  if (color.indexOf('rgb') === -1) {
    tempColor = this.hexToRgba(color, opacity)
  }
  const strs = tempColor.split(',')
  const r = Number(strs[0].split('(')[1])
  const g = Number(strs[1])
  let b = 0
  let a = 1
  if (strs.length > 3) {
    b = Number(strs[2])
    a = Number(strs[3].split(')')[0])
  } else if (strs.length == 3) {
    b = Number(strs[2].split(')')[0])
  }
  return {
    r,
    g,
    b,
    a
  }
}

/**
 *
 * @param color 16进制颜色转rgba
 */
export function hexToRgba(color, opacity) {
  if (opacity === undefined) {
    opacity = 1
  }
  let sColor = color.toLowerCase()
  // 十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 如果是16进制颜色
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    // 处理六位的颜色值
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`))
    }
    return `rgba(${sColorChange.join(',')},${opacity})`
  }
  return sColor
}

/**
 *
 * @param color rgb转16进制
 */
export function rgbToHex(color) {
  if (!color.includes('rgb')) {
    return color
  }
  const rgb = color.split(',')
  const r = parseInt(rgb[0].split('(')[1])
  const g = parseInt(rgb[1])
  const b = parseInt(rgb[2].split(')')[0])
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  return hex.toLocaleUpperCase()
}

/**
 * rgba转字符串
 * @param rgba rgba对象
 * @param needOpacity 是否使用透明度
 */
export function colorObjectToRgba(rgba, needOpacity) {
  let colorStr = ''
  if (rgba.a !== undefined) {
    colorStr = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
    // 已传入needOpacity，并且为false
    if (needOpacity !== undefined && !needOpacity) {
      colorStr = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
    }
  } else {
    colorStr = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
  }
  return colorStr
}
