import axios from 'axios'

export const getDataCatalogConfig = () =>
  axios({
    url: '/onemap/WebService/GetConfig?id=baseTreeConfig',
    method: 'get'
  })
