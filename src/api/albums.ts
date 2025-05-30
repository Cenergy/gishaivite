import http from '../services/httpService'

/**
 * API基础路径
 */
const BASE_PATH = '/api/v1/albums/';
const PHOTOS_PATH = `${BASE_PATH}photos/`;
const GEO_PATH = `${BASE_PATH}geo/`;
const CATEGORIES_PATH = `${BASE_PATH}categories/`;

/**
 * 分页参数接口
 */
interface PaginationParams {
  skip?: number
  limit?: number
}

/**
 * 分类接口
 */
interface Category {
  id: string
  name: string
  description?: string
  is_public?: boolean
  album_count?: number
  created_at: string
  updated_at: string
}

/**
 * 相册接口
 */
interface Album {
  id: string
  name: string
  description?: string
  cover_photo?: string
  is_public?: boolean
  category_id?: string
  photo_count?: number
  created_at: string
  updated_at: string
}

/**
 * 照片接口
 */
interface Photo {
  id: string
  album_id: string
  url: string
  title?: string
  description?: string
  lng: number
  lat: number
  is_public?: boolean
  created_at: string
  updated_at: string
}

/**
 * 地理位置查询参数
 */
interface GeoParams {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

/**
 * 相册查询参数
 */
interface AlbumQueryParams extends PaginationParams {
  is_public?: boolean
  category_id?: string
  with_photo_count?: boolean
}

/**
 * 照片查询参数
 */
interface PhotoQueryParams extends PaginationParams {
  is_public?: boolean
  album_id?: string
}

/**
 * 分类查询参数
 */
interface CategoryQueryParams extends PaginationParams {
  is_public?: boolean
  with_album_count?: boolean
}

/**
 * 相册相关API
 */
export default {
  // ==================== 分类接口 ====================
  
  // 获取分类列表
  getCategories: async (params?: CategoryQueryParams) => {
    try {
      const response = await http.get(`${CATEGORIES_PATH}`, { params })
      return response
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return { error }
    }
  },

  // 创建分类 🔒
  createCategory: async (data: { name: string; description?: string; is_public?: boolean }) => {
    try {
      const response = await http.post(`${CATEGORIES_PATH}`, data)
      return response
    } catch (error) {
      console.error('创建分类失败:', error)
      return { error }
    }
  },

  // 获取分类详情
  getCategory: async (categoryId: string) => {
    try {
      const response = await http.get(`${CATEGORIES_PATH}${categoryId}`)
      return response
    } catch (error) {
      console.error('获取分类详情失败:', error)
      return { error }
    }
  },

  // 更新分类 🔒
  updateCategory: async (
    categoryId: string,
    data: { name?: string; description?: string; is_public?: boolean },
  ) => {
    try {
      const response = await http.put(`${CATEGORIES_PATH}${categoryId}`, data)
      return response
    } catch (error) {
      console.error('更新分类失败:', error)
      return { error }
    }
  },

  // 删除分类 🔒
  deleteCategory: async (categoryId: string) => {
    try {
      const response = await http.delete(`${CATEGORIES_PATH}${categoryId}`)
      return response
    } catch (error) {
      console.error('删除分类失败:', error)
      return { error }
    }
  },

  // ==================== 相册接口 ====================
  
  // 获取相册列表
  getAlbums: async (params?: AlbumQueryParams) => {
    try {
      const response = await http.get(`${BASE_PATH}`, { params })
      return response
    } catch (error) {
      console.error('获取相册列表失败:', error)
      return { error }
    }
  },

  // 创建相册 🔒
  createAlbum: async (data: { 
    name: string; 
    description?: string; 
    cover_photo?: string;
    is_public?: boolean;
    category_id?: string;
  }) => {
    try {
      const response = await http.post(`${BASE_PATH}`, data)
      return response
    } catch (error) {
      console.error('创建相册失败:', error)
      return { error }
    }
  },

  // 获取相册详情
  getAlbum: async (albumId: string) => {
    try {
      const response = await http.get(`${BASE_PATH}${albumId}`)
      return response
    } catch (error) {
      console.error('获取相册详情失败:', error)
      return { error }
    }
  },

  // 更新相册 🔒
  updateAlbum: async (
    albumId: string,
    data: { 
      name?: string; 
      description?: string; 
      cover_photo?: string;
      is_public?: boolean;
      category_id?: string;
    },
  ) => {
    try {
      const response = await http.put(`${BASE_PATH}${albumId}`, data)
      return response
    } catch (error) {
      console.error('更新相册失败:', error)
      return { error }
    }
  },

  // 删除相册 🔒
  deleteAlbum: async (albumId: string) => {
    try {
      const response = await http.delete(`${BASE_PATH}${albumId}`)
      return response
    } catch (error) {
      console.error('删除相册失败:', error)
      return { error }
    }
  },

  // ==================== 照片接口 ====================
  
  // 获取照片列表
  getPhotos: async (params?: PhotoQueryParams) => {
    try {
      const response = await http.get(`${PHOTOS_PATH}`, { params })
      return response
    } catch (error) {
      console.error('获取照片列表失败:', error)
      return { error }
    }
  },

  // 创建照片 🔒
  createPhoto: async (data: {
    album_id: string
    url: string
    title?: string
    description?: string
    lng: number
    lat: number
    is_public?: boolean
  }) => {
    try {
      const response = await http.post(`${PHOTOS_PATH}`, data)
      return response
    } catch (error) {
      console.error('创建照片失败:', error)
      return { error }
    }
  },

  // 获取照片详情
  getPhoto: async (photoId: string) => {
    try {
      const response = await http.get(`${PHOTOS_PATH}${photoId}`)
      return response
    } catch (error) {
      console.error('获取照片详情失败:', error)
      return { error }
    }
  },

  // 更新照片 🔒
  updatePhoto: async (
    photoId: string,
    data: { 
      title?: string; 
      description?: string; 
      lng?: number; 
      lat?: number;
      is_public?: boolean;
    },
  ) => {
    try {
      const response = await http.put(`${PHOTOS_PATH}${photoId}`, data)
      return response
    } catch (error) {
      console.error('更新照片失败:', error)
      return { error }
    }
  },

  // 删除照片 🔒
  deletePhoto: async (photoId: string) => {
    try {
      const response = await http.delete(`${PHOTOS_PATH}${photoId}`)
      return response
    } catch (error) {
      console.error('删除照片失败:', error)
      return { error }
    }
  },

  // ==================== 地理位置接口 ====================
  
  // 根据坐标获取照片
  getPhotosByGeo: async (params: GeoParams & { 
    skip?: number;
    limit?: number;
    is_public?: boolean;
  }) => {
    try {
      const response = await http.get(`${GEO_PATH}photos/`, { params })
      return response
    } catch (error) {
      console.error('根据坐标获取照片失败:', error)
      return { error }
    }
  },

  // 根据坐标获取相册
  getAlbumsByGeo: async (params: GeoParams & {
    skip?: number;
    limit?: number;
    is_public?: boolean;
    with_photo_count?: boolean;
  }) => {
    try {
      const response = await http.get(`${GEO_PATH}albums/`, { params })
      return response
    } catch (error) {
      console.error('根据坐标获取相册失败:', error)
      return { error }
    }
  },
}

// 导出类型定义
export type { Category, Album, Photo, PaginationParams, AlbumQueryParams, PhotoQueryParams, CategoryQueryParams, GeoParams }

// 保持向后兼容
export const basePath = BASE_PATH
