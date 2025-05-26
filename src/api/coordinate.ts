import http from '../services/http';
import axios from 'axios';

/**
 * 坐标转换API
 */
export const convertCoordinates = async (params: {
  lng: number;
  lat: number;
  from_sys: string;
  to_sys: string;
}) => {
  try {
    const response = await http.get('/api/v1/converters/coords/convert', { params });
    return response;
  } catch (error) {
    console.error('坐标转换请求失败:', error);
    throw error;
  }
};

/**
 * Excel文件坐标批量转换API
 * @param formData 包含Excel文件和转换类型的FormData
 * @returns Blob数据流
 */
export const convertCoordinatesFromExcel = async (formData: FormData) => {
  try {
    // 这里使用axios而不是http实例，因为需要特殊的responseType
    const response = await axios.post('/api/v1/converters/coords/convert_from_excel', formData, {
      responseType: 'blob' // 设置响应类型为blob，用于处理StreamingResponse
    });
    return response;
  } catch (error) {
    console.error('Excel文件坐标转换请求失败:', error);
    throw error;
  }
};