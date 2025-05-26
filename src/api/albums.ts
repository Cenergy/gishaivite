import http from '../services/httpService'

/**
 * 相册相关API
 */
export default {
  // 获取相册列表
  getAlbums: async () => {
    try {
      const response = await http.get('/api/v1/albums/')
      return response
    } catch (error) {
      console.error('获取相册列表失败:', error)
      return { error }
    }
  },

  // 创建相册
  createAlbum: async (data: { name: string; description?: string; cover_photo?: string }) => {
    try {
      const response = await http.post('/api/v1/albums/', data)
      return response
    } catch (error) {
      console.error('创建相册失败:', error)
      return { error }
    }
  },

  // 获取单个相册
  getAlbum: async (albumId: string) => {
    try {
      const response = await http.get(`/api/v1/albums/${albumId}`)
      return response
    } catch (error) {
      console.error('获取相册失败:', error)
      return { error }
    }
  },

  // 更新相册
  updateAlbum: async (
    albumId: string,
    data: { name?: string; description?: string; cover_photo?: string },
  ) => {
    try {
      const response = await http.put(`/api/v1/albums/${albumId}`, data)
      return response
    } catch (error) {
      console.error('更新相册失败:', error)
      return { error }
    }
  },

  // 删除相册
  deleteAlbum: async (albumId: string) => {
    try {
      const response = await http.delete(`/api/v1/albums/${albumId}`)
      return response
    } catch (error) {
      console.error('删除相册失败:', error)
      return { error }
    }
  },

  // 获取照片列表
  getPhotos: async () => {
    try {
      const response = await http.get('/api/v1/albums/photos/')
      return response
    } catch (error) {
      console.error('获取照片列表失败:', error)
      return { error }
    }
  },

  // 创建照片
  createPhoto: async (data: {
    album_id: string
    url: string
    title?: string
    description?: string
    lng: number
    lat: number
  }) => {
    try {
      const response = await http.post('/api/v1/albums/photos/', data)
      return response
    } catch (error) {
      console.error('创建照片失败:', error)
      return { error }
    }
  },

  // 获取单个照片
  getPhoto: async (photoId: string) => {
    try {
      const response = await http.get(`/api/v1/albums/photos/${photoId}`)
      return response
    } catch (error) {
      console.error('获取照片失败:', error)
      return { error }
    }
  },

  // 更新照片
  updatePhoto: async (
    photoId: string,
    data: { title?: string; description?: string; lng?: number; lat?: number },
  ) => {
    try {
      const response = await http.put(`/api/v1/albums/photos/${photoId}`, data)
      return response
    } catch (error) {
      console.error('更新照片失败:', error)
      return { error }
    }
  },

  // 删除照片
  deletePhoto: async (photoId: string) => {
    try {
      const response = await http.delete(`/api/v1/albums/photos/${photoId}`)
      return response
    } catch (error) {
      console.error('删除照片失败:', error)
      return { error }
    }
  },

  // 根据经纬度范围获取照片
  getPhotosByGeo: async (params: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }) => {
    try {
      const response = await http.get('/api/v1/albums/geo/photos/', { params })
      return response
    } catch (error) {
      console.error('根据经纬度获取照片失败:', error)
      return { error }
    }
  },

  // 根据经纬度范围获取相册
  getAlbumsByGeo: async (params: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }) => {
    try {
      const response = await http.get('/api/v1/albums/geo/albums/', { params })
      return response
    } catch (error) {
      console.error('根据经纬度获取相册失败:', error)
      return { error }
    }
  },
}
