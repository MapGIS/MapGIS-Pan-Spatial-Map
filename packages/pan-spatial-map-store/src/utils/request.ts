import axios from 'axios'
import envInstance, { loadEnv } from '../env'

const interceptorsRequest = [
  config => {
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
]

// response interceptor
const interceptorsResponse = [
  response => {
    return response.data
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
]

const service = axios.create({
  timeout: 5000
})

loadEnv().then(() => {
  service.defaults.baseURL = envInstance.config.baseApi
  service.defaults.withCredentials = true
  service.interceptors.request.use(...interceptorsRequest)
  service.interceptors.response.use(...interceptorsResponse)
})

export default service
