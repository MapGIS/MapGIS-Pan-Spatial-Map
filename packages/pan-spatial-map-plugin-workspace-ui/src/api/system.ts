import axios from 'axios'

export const getSystemConfig = () =>
  axios({
    url: '/onemap/WebService/GetConfig?id=default',
    method: 'get'
  })
