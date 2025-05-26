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
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      
      switch (status) {
        case 401:
          console.error('未授权，请重新登录');
          // 可以在这里处理登出逻辑
          // store.dispatch('user/logout');
          break;
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(`请求错误: ${status}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default http;