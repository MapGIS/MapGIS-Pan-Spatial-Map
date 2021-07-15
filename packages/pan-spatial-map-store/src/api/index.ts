import * as configService from './config'

import * as uploadService from './upload'

import * as mapSheetService from './map-sheet'

const apiTable = {
  getConfig: configService.getConfig,
  getWidgetConfig: configService.getWidgetConfig,
  saveWidgetConfig: configService.saveWidgetConfig,
  imagesUpload: uploadService.imagesUpload,
  getFrameNoByCoord: mapSheetService.getFrameNoByCoord,
  getFrameExtentByNo: mapSheetService.getFrameExtentByNo,
  getFrameNoList: mapSheetService.getFrameNoList,
  setApiProxy
}

function setApiProxy(apiProxyTable) {
  Object.keys(apiProxyTable).forEach(api => {
    const proxy = apiProxyTable[api]
    apiTable[api] = proxy
  })
}

export default apiTable
