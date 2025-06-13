import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加统一的请求头等
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一返回完整的response对象
    return response
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response) {
      // 根据HTTP状态码处理不同错误
      switch (error.response.status) {
        case 401:
          console.error('未授权，请重新登录')
          break
        case 403:
          console.error('拒绝访问')
          break
        case 404:
          console.error('请求资源不存在')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error('请求错误', error.message)
      }
    } else if (error.request) {
      console.error('请求未响应', error.message)
    } else {
      console.error('请求设置错误', error.message)
    }
    return Promise.reject(error)
  },
)

export default service
