import axios from 'axios'

export const userLogin = (data: any) =>
  axios({
    url: '/onemap/UserArea/Login',
    method: 'post',
    data
  })
