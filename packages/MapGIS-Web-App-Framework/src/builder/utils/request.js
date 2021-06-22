import axios from 'axios'

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

// create axios instance
const createAxiosInstance = function(baseApi) {
  const axiosInstance = axios.create({
    baseURL: baseApi,
    timeout: 20000
  })
  axiosInstance.defaults.withCredentials = true
  axiosInstance.interceptors.request.use(...interceptorsRequest)
  axiosInstance.interceptors.response.use(...interceptorsResponse)
  return axiosInstance
}

export default createAxiosInstance
