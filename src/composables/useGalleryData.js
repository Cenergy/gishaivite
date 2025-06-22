import { ref, computed } from 'vue'
import albumsAPI from '@/api/albums'

/**
 * 相册数据管理 Composable
 * 处理分类、相册和照片数据的加载和转换
 */
export function useGalleryData() {
  // 响应式数据
  const categories = ref([{ id: 'all', name: '全部' }])
  const albums = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 数据转换函数
  const transformAlbumData = (apiAlbum) => {
    return {
      id: apiAlbum.id,
      title: apiAlbum.name,
      description: apiAlbum.description || '',
      coverUrl: apiAlbum.cover_image || 'https://picsum.photos/800/600',
      category: apiAlbum.category_id || 'all',
      date: new Date(apiAlbum.created_at).toLocaleDateString('zh-CN'),
      location: apiAlbum.location || '未知位置',
      sortOrder: apiAlbum.sort_order || 0,
      photos: [],
    }
  }

  const transformPhotoData = (apiPhoto, albumLocation = '未知位置') => {
    return {
      id: apiPhoto.id,
      title: apiPhoto.title || '未命名照片',
      description: apiPhoto.description || '',
      // 缩略图用于列表显示
      url: apiPhoto.thumbnail_url,
      // 预览图用于查看器显示
      previewUrl: apiPhoto.preview_url,
      // 原图URL
      originalUrl:
        apiPhoto.original_url && apiPhoto.original_url.length > 0
          ? apiPhoto.original_url[0]
          : apiPhoto.preview_url,
      date: apiPhoto.taken_at
        ? new Date(apiPhoto.taken_at).toLocaleDateString('zh-CN')
        : new Date(apiPhoto.created_at).toLocaleDateString('zh-CN'),
      location: apiPhoto.location || albumLocation,
      coordinates:
        apiPhoto.longitude && apiPhoto.latitude ? [apiPhoto.longitude, apiPhoto.latitude] : null,
      fileFormat: apiPhoto.file_format,
      fileSize: apiPhoto.file_size,
      width: apiPhoto.width,
      height: apiPhoto.height,
    }
  }

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const response = await albumsAPI.getCategories({ is_public: true })

      if (response && !response.error) {
        // 处理不同的响应格式
        let categoriesData = response
        if (response.data) {
          categoriesData = response.data
        }
        if (response.items) {
          categoriesData = response.items
        }

        if (Array.isArray(categoriesData)) {
          const apiCategories = categoriesData.map((cat) => ({
            id: cat.id,
            name: cat.name,
          }))
          categories.value = [{ id: 'all', name: '全部' }, ...apiCategories]
        } else {
          // 使用默认分类
          categories.value = [
            { id: 'all', name: '全部' },
            { id: 'landscape', name: '风景' },
            { id: 'portrait', name: '人像' },
            { id: 'street', name: '街拍' },
          ]
        }
      } else {
        // 使用默认分类
        categories.value = [
          { id: 'all', name: '全部' },
          { id: 'landscape', name: '风景' },
          { id: 'portrait', name: '人像' },
          { id: 'street', name: '街拍' },
        ]
      }
    } catch (err) {
      // 使用默认分类
      categories.value = [
        { id: 'all', name: '全部' },
        { id: 'landscape', name: '风景' },
        { id: 'portrait', name: '人像' },
        { id: 'street', name: '街拍' },
      ]
    }
  }

  // 加载相册数据
  const loadAlbums = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await albumsAPI.getAlbums({
        is_public: true,
        with_photo_count: true,
      })

      if (response && !response.error) {
        // 处理不同的响应格式
        let albumsData = response
        if (response.data) {
          albumsData = response.data
        }
        if (response.items) {
          albumsData = response.items
        }

        if (Array.isArray(albumsData)) {
          const transformedAlbums = albumsData.map(transformAlbumData)

          // 为每个相册加载照片
          for (const album of transformedAlbums) {
            try {
              const photosResponse = await albumsAPI.getPhotos({
                album_id: album.id,
                is_public: true,
              })

              if (photosResponse && !photosResponse.error) {
                let photosData = photosResponse
                if (photosResponse.data) {
                  photosData = photosResponse.data
                }
                if (photosResponse.items) {
                  photosData = photosResponse.items
                }

                if (Array.isArray(photosData)) {
                  album.photos = photosData.map((photo) => transformPhotoData(photo, album.location))
                } else {
                  album.photos = []
                }
              } else {
                album.photos = []
              }
            } catch (photoErr) {
              album.photos = []
            }
          }

          albums.value = transformedAlbums
        } else {
          // 创建一些示例数据用于测试
          albums.value = [
            {
              id: '1',
              title: '示例相册1',
              description: '这是一个示例相册',
              coverUrl: 'https://picsum.photos/800/600?random=1',
              category: 'landscape',
              date: new Date().toLocaleDateString('zh-CN'),
              location: '示例位置',
              photos: [
                {
                  id: '1',
                  title: '示例照片1',
                  description: '示例照片描述',
                  url: 'https://picsum.photos/800/600?random=1',
                  date: new Date().toLocaleDateString('zh-CN'),
                  location: '示例位置',
                  coordinates: [116.4074, 39.9042],
                },
              ],
            },
          ]
        }
      } else {
        throw new Error(response?.error || '获取相册数据失败')
      }
    } catch (err) {
      error.value = err.message || '加载数据失败'

      // 创建一些示例数据用于测试
      albums.value = [
        {
          id: '1',
          title: '示例相册1',
          description: '这是一个示例相册',
          coverUrl: 'https://picsum.photos/800/600?random=1',
          category: 'landscape',
          date: new Date().toLocaleDateString('zh-CN'),
          location: '示例位置',
          photos: [
            {
              id: '1',
              title: '示例照片1',
              description: '示例照片描述',
              url: 'https://picsum.photos/800/600?random=1',
              date: new Date().toLocaleDateString('zh-CN'),
              location: '示例位置',
              coordinates: [116.4074, 39.9042],
            },
          ],
        },
      ]
    } finally {
      loading.value = false
    }
  }

  // 初始化数据
  const initializeData = async () => {
    await loadCategories()
    await loadAlbums()
  }

  // 根据分类筛选相册
  const getFilteredAlbums = (activeCategory) => {
    let filtered = []
    if (activeCategory === 'all') {
      filtered = albums.value
    } else {
      filtered = albums.value.filter((album) => album.category === activeCategory)
    }

    // 根据 sort_order 排序，越大在前面
    return filtered.sort((a, b) => b.sortOrder - a.sortOrder)
  }

  // 获取所有照片（用于地图模式）
  const getAllPhotos = (filteredAlbums) => {
    let photos = []
    filteredAlbums.forEach((album) => {
      photos = [
        ...photos,
        ...album.photos.map((photo) => ({
          ...photo,
          albumId: album.id,
          albumTitle: album.title,
        })),
      ]
    })
    return photos
  }

  return {
    // 响应式数据
    categories,
    albums,
    loading,
    error,
    
    // 方法
    loadCategories,
    loadAlbums,
    initializeData,
    getFilteredAlbums,
    getAllPhotos,
    
    // 数据转换函数
    transformAlbumData,
    transformPhotoData
  }
}