import axios from 'axios'

export const getAuthConfig = () =>
  axios({
    url: '/statics/plugins/auth/config.json',
    method: 'get'
  })
