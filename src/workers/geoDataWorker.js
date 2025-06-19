// 地理数据处理 Web Worker
// 用于处理大量地理数据，避免阻塞主线程

/**
 * 处理 GeoJSON 数据
 * @param {Object} geoData - GeoJSON 数据
 * @param {Object} options - 处理选项
 * @returns {Object} 处理后的数据
 */
function processGeoJSON(geoData, options = {}) {
  const { simplify = false, tolerance = 0.001, filterBounds = null } = options
  
  if (!geoData || !geoData.features) {
    return { error: 'Invalid GeoJSON data' }
  }

  let features = geoData.features
  let processedCount = 0
  const totalCount = features.length

  // 过滤边界范围内的要素
  if (filterBounds) {
    features = features.filter(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        return isFeatureInBounds(feature, filterBounds)
      }
      return false
    })
  }

  // 简化几何图形
  if (simplify) {
    features = features.map((feature, index) => {
      processedCount++
      
      // 每处理100个要素发送一次进度更新
      if (processedCount % 100 === 0) {
        self.postMessage({
          type: 'progress',
          progress: (processedCount / totalCount) * 100,
          message: `正在简化几何图形: ${processedCount}/${totalCount}`
        })
      }

      if (feature.geometry) {
        feature.geometry = simplifyGeometry(feature.geometry, tolerance)
      }
      return feature
    })
  }

  return {
    type: 'FeatureCollection',
    features,
    metadata: {
      originalCount: totalCount,
      processedCount: features.length,
      simplified: simplify,
      tolerance: simplify ? tolerance : null
    }
  }
}

/**
 * 检查要素是否在指定边界内
 * @param {Object} feature - GeoJSON 要素
 * @param {Array} bounds - 边界 [minLng, minLat, maxLng, maxLat]
 * @returns {boolean}
 */
function isFeatureInBounds(feature, bounds) {
  const [minLng, minLat, maxLng, maxLat] = bounds
  
  if (feature.geometry.type === 'Point') {
    const [lng, lat] = feature.geometry.coordinates
    return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
  }
  
  // 对于其他几何类型，检查边界框
  const bbox = calculateBoundingBox(feature.geometry)
  if (!bbox) return false
  
  return !(bbox[2] < minLng || bbox[0] > maxLng || bbox[3] < minLat || bbox[1] > maxLat)
}

/**
 * 计算几何图形的边界框
 * @param {Object} geometry - GeoJSON 几何图形
 * @returns {Array|null} 边界框 [minLng, minLat, maxLng, maxLat]
 */
function calculateBoundingBox(geometry) {
  let coords = []
  
  function extractCoords(coordArray) {
    if (typeof coordArray[0] === 'number') {
      coords.push(coordArray)
    } else {
      coordArray.forEach(extractCoords)
    }
  }
  
  if (geometry.coordinates) {
    extractCoords(geometry.coordinates)
  }
  
  if (coords.length === 0) return null
  
  let minLng = coords[0][0], maxLng = coords[0][0]
  let minLat = coords[0][1], maxLat = coords[0][1]
  
  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })
  
  return [minLng, minLat, maxLng, maxLat]
}

/**
 * 简化几何图形（Douglas-Peucker 算法的简化版本）
 * @param {Object} geometry - GeoJSON 几何图形
 * @param {number} tolerance - 容差
 * @returns {Object} 简化后的几何图形
 */
function simplifyGeometry(geometry, tolerance) {
  if (geometry.type === 'Point') {
    return geometry // 点不需要简化
  }
  
  if (geometry.type === 'LineString') {
    return {
      ...geometry,
      coordinates: simplifyLineString(geometry.coordinates, tolerance)
    }
  }
  
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map(ring => 
        simplifyLineString(ring, tolerance)
      )
    }
  }
  
  return geometry // 其他类型暂不处理
}

/**
 * 简化线串坐标
 * @param {Array} coords - 坐标数组
 * @param {number} tolerance - 容差
 * @returns {Array} 简化后的坐标数组
 */
function simplifyLineString(coords, tolerance) {
  if (coords.length <= 2) return coords
  
  const simplified = [coords[0]]
  
  for (let i = 1; i < coords.length - 1; i++) {
    const prev = simplified[simplified.length - 1]
    const curr = coords[i]
    const next = coords[i + 1]
    
    // 计算点到线段的距离
    const distance = pointToLineDistance(curr, prev, next)
    
    if (distance > tolerance) {
      simplified.push(curr)
    }
  }
  
  simplified.push(coords[coords.length - 1])
  return simplified
}

/**
 * 计算点到线段的距离
 * @param {Array} point - 点坐标 [lng, lat]
 * @param {Array} lineStart - 线段起点 [lng, lat]
 * @param {Array} lineEnd - 线段终点 [lng, lat]
 * @returns {number} 距离
 */
function pointToLineDistance(point, lineStart, lineEnd) {
  const [x, y] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  
  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1
  
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  
  if (lenSq === 0) {
    return Math.sqrt(A * A + B * B)
  }
  
  const param = dot / lenSq
  
  let xx, yy
  
  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }
  
  const dx = x - xx
  const dy = y - yy
  
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 聚类点数据
 * @param {Array} points - 点数据数组
 * @param {number} distance - 聚类距离
 * @returns {Array} 聚类结果
 */
function clusterPoints(points, distance = 0.01) {
  const clusters = []
  const processed = new Set()
  
  points.forEach((point, index) => {
    if (processed.has(index)) return
    
    const cluster = [point]
    processed.add(index)
    
    // 查找附近的点
    for (let i = index + 1; i < points.length; i++) {
      if (processed.has(i)) continue
      
      const otherPoint = points[i]
      const dist = calculateDistance(
        point.geometry.coordinates,
        otherPoint.geometry.coordinates
      )
      
      if (dist <= distance) {
        cluster.push(otherPoint)
        processed.add(i)
      }
    }
    
    clusters.push({
      center: calculateClusterCenter(cluster),
      count: cluster.length,
      points: cluster
    })
  })
  
  return clusters
}

/**
 * 计算两点间距离
 * @param {Array} coord1 - 坐标1 [lng, lat]
 * @param {Array} coord2 - 坐标2 [lng, lat]
 * @returns {number} 距离
 */
function calculateDistance(coord1, coord2) {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2
  
  return Math.sqrt(
    Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)
  )
}

/**
 * 计算聚类中心
 * @param {Array} cluster - 聚类点数组
 * @returns {Array} 中心坐标 [lng, lat]
 */
function calculateClusterCenter(cluster) {
  const totalLng = cluster.reduce((sum, point) => 
    sum + point.geometry.coordinates[0], 0
  )
  const totalLat = cluster.reduce((sum, point) => 
    sum + point.geometry.coordinates[1], 0
  )
  
  return [
    totalLng / cluster.length,
    totalLat / cluster.length
  ]
}

// Worker 消息处理
self.onmessage = function(e) {
  const { type, data, options, id } = e.data
  
  try {
    let result
    
    switch (type) {
      case 'processGeoJSON':
        result = processGeoJSON(data, options)
        break
        
      case 'clusterPoints':
        const { points, distance } = data
        result = clusterPoints(points, distance)
        break
        
      case 'calculateBounds':
        result = calculateBoundingBox(data)
        break
        
      default:
        throw new Error(`Unknown task type: ${type}`)
    }
    
    self.postMessage({
      type: 'success',
      id,
      result
    })
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message
    })
  }
}

// 发送 Worker 就绪消息
self.postMessage({ type: 'ready' })