import http from '../utils/http'

/**
 * 资源相关API接口
 */

// 资源基础CRUD操作
export const createResource = async (resource: {
  name: string
  type: string
  url?: string
  description?: string
  is_active?: boolean
}) => {
  try {
    const response = await http.post('/v1/resources/', resource)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getResource = async (resourceId: number) => {
  try {
    const response = await http.get(`/v1/resources/${resourceId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getResources = async (params: {
  skip?: number
  limit?: number
  type?: string
  is_active?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateResource = async (resourceId: number, resource: {
  name?: string
  type?: string
  url?: string
  description?: string
  is_active?: boolean
}) => {
  try {
    const response = await http.put(`/v1/resources/${resourceId}`, resource)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteResource = async (resourceId: number) => {
  try {
    const response = await http.delete(`/v1/resources/${resourceId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const countResources = async (params: {
  type?: string
  is_active?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/count/total', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

// 模型文件相关API
export const streamModel = async (filename: string, range?: string) => {
  try {
    const headers = range ? { Range: range } : {}
    const response = await http.get(`/v1/resources/models/${filename}`, {
      headers,
      responseType: 'blob'
    })
    return response
  } catch (error) {
    return { error }
  }
}

export const getModelInfo = async (filename: string) => {
  try {
    const response = await http.get(`/v1/resources/models/${filename}/info`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const streamModelBinary = async (filename: string, range?: string) => {
  try {
    const headers = range ? { Range: range } : {}
    const response = await http.get(`/v1/resources/models/${filename}/binary`, {
      headers,
      responseType: 'blob'
    })
    return response
  } catch (error) {
    return { error }
  }
}

export const getModelManifest = async (filename: string) => {
  try {
    const response = await http.get(`/v1/resources/models/${filename}/manifest`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModelBlob = async (filename: string) => {
  try {
    const response = await http.get(`/v1/resources/models/${filename}/blob`, {
      responseType: 'blob'
    })
    return response
  } catch (error) {
    return { error }
  }
}

// 缓存管理API
export const getCacheStats = async () => {
  try {
    const response = await http.get('/v1/resources/cache/stats')
    return response.data
  } catch (error) {
    return { error }
  }
}

export const clearCache = async () => {
  try {
    const response = await http.post('/v1/resources/cache/clear')
    return response.data
  } catch (error) {
    return { error }
  }
}

// 3D模型分类相关API
export const createModel3DCategory = async (category: {
  name: string
  description?: string
  is_active?: boolean
}) => {
  try {
    const response = await http.post('/v1/resources/categories/', category)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModel3DCategory = async (categoryId: number) => {
  try {
    const response = await http.get(`/v1/resources/categories/${categoryId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModel3DCategories = async (params: {
  skip?: number
  limit?: number
  is_active?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/categories/', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateModel3DCategory = async (categoryId: number, category: {
  name?: string
  description?: string
  is_active?: boolean
}) => {
  try {
    const response = await http.put(`/v1/resources/categories/${categoryId}`, category)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteModel3DCategory = async (categoryId: number) => {
  try {
    const response = await http.delete(`/v1/resources/categories/${categoryId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const countModel3DCategories = async (params: {
  is_active?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/categories/count/total', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

// 3D模型相关API
export const createModel3D = async (model: {
  name: string
  description?: string
  file_path: string
  file_size?: number
  category_id?: number
  is_active?: boolean
  is_public?: boolean
  metadata?: object
}) => {
  try {
    const response = await http.post('/v1/resources/models3d/', model)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModel3D = async (modelId: number) => {
  try {
    const response = await http.get(`/v1/resources/models3d/${modelId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModel3DByUuid = async (uuid: string) => {
  try {
    const response = await http.get(`/v1/resources/models3d/uuid/${uuid}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const getModel3Ds = async (params: {
  skip?: number
  limit?: number
  category_id?: number
  is_active?: boolean
  is_public?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/models3d/', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

export const updateModel3D = async (modelId: number, model: {
  name?: string
  description?: string
  file_path?: string
  file_size?: number
  category_id?: number
  is_active?: boolean
  is_public?: boolean
  metadata?: object
}) => {
  try {
    const response = await http.put(`/v1/resources/models3d/${modelId}`, model)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const deleteModel3D = async (modelId: number) => {
  try {
    const response = await http.delete(`/v1/resources/models3d/${modelId}`)
    return response.data
  } catch (error) {
    return { error }
  }
}

export const countModel3Ds = async (params: {
  category_id?: number
  is_active?: boolean
  is_public?: boolean
  search?: string
}) => {
  try {
    const response = await http.get('/v1/resources/models3d/count/total', { params })
    return response.data
  } catch (error) {
    return { error }
  }
}

// 流式传输模型（通过UUID）
export const streamModelByUuid = async (uuid: string, range?: string) => {
  try {
    const headers = range ? { Range: range } : {}
    const response = await http.get(`/v1/resources/models/uuid/${uuid}`, {
      headers,
      responseType: 'blob'
    })
    return response
  } catch (error) {
    return { error }
  }
}