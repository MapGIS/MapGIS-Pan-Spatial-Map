import axios from 'axios'

export const getBaseLayersConfig = () =>
  axios({
    url: 'statics/plugins/workspace/ChangeBaseMapConfig.json',
    method: 'get'
  })
