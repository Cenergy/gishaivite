import http from '../utils/http'

/**
 * 坐标转换API
 */
export const convertCoordinates = async (params: {
  lng: number
  lat: number
  from_sys: string
  to_sys: string
}) => {
  try {
    const response = await http.get('/v1/converters/coords/convert', { params })
    return response.data // 现在response是完整对象，需要返回data部分
  } catch (error) {
    console.error('坐标转换请求失败:', error)
    // throw error;
    return { error }
  }
}

/**
 * Excel文件坐标批量转换API
 * @param formData 包含Excel文件和转换类型的FormData
 * @returns Blob数据流
 */
export const convertCoordinatesFromExcel = async (formData: FormData) => {
  try {
    // 使用http实例发送请求，设置responseType为blob
    const response = await http.post('/v1/converters/coords/convert_from_excel', formData, {
      responseType: 'blob', // 设置响应类型为blob，用于处理StreamingResponse
    })
    return response
  } catch (error) {
    console.error('Excel文件坐标转换请求失败:', error)
    return { error }
  }
}
