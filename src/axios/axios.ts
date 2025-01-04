import axios, { AxiosInstance, AxiosResponse } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  timeout: 5000
})

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    console.log(error.data)
    return Promise.reject(error.data)
  }
)

export default axiosInstance
