import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
http.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 设置默认请求头
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    // 添加授权token（如果有）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 统一处理业务错误
    // if (response.data.code !== 0) {
    //   return Promise.reject(new Error(response.data.message || '业务错误'));
    // }
    return response;
  },
  (error) => {
    // 统一错误处理
    return Promise.reject(error);
  }
);

export default http;