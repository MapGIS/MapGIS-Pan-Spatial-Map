// 布局元素组件列表
let externalLayoutElementComponents = {}

/**
 * 设置布局元素组件列表
 * @param components
 */
function setExternalLayoutElementComponents(components) {
  externalLayoutElementComponents = components
}

/**
 * 布局元素组件是否存在
 */
function isExternalLayoutElementComponentExist(componentName) {
  return Object.hasOwnProperty.call(
    externalLayoutElementComponents,
    componentName
  )
}

export {
  setExternalLayoutElementComponents,
  isExternalLayoutElementComponentExist
}

export { default as MpPanSpatialMapHeader } from './Header/Header.vue'
export { default as MpPanSpatialMapSideMenu } from './SideMenu/SideMenu.vue'
