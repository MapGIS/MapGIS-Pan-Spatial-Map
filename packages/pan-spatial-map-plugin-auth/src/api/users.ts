import axios from 'axios'

export const userLogin = (data: any) =>
  axios({
    url: '/onemap/UserArea/Login',
    method: 'post',
    data
  })

export const userLogout = () => {
  return Promise.resolve({ data: { code: 0 } })
}
