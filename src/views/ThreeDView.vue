<template>
  <div class="threeContainer">
    <div class="sidebar">
      <div class="title">🚀 WASM模型查看器</div>

      <!-- 模型选择 -->
      <div class="section">
        <div class="section-title">📁 模型选择</div>
        <div class="form-group">
          <label for="modelSelect">选择模型:</label>
          <select id="modelSelect" v-model="selectedModel">
            <option value="merge.gltf">merge.gltf</option>
            <option value="Bee.glb">Bee.glb</option>
            <option value="SambaDancing.fbx">SambaDancing.fbx</option>
          </select>
        </div>
      </div>

      <!-- 传输方式选择 -->
      <div class="section">
        <div class="section-title">📡 传统方式</div>
        <div class="form-group">
          <button @click="loadOriginModel">直接加载</button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🔄 传输方式</div>
        <div class="method-selector">
          <button
            v-for="method in loadMethods"
            :key="method.value"
            class="method-btn"
            :class="{ active: loadMethod === method.value }"
            @click="setLoadMethod(method.value)"
          >
            {{ method.label }}
          </button>
        </div>
        <div class="form-group">
          <button @click="loadModel">🚀 加载模型</button>
          <button @click="getModelInfo">📋 获取信息</button>
        </div>

        <!-- 流式加载控制面板 -->
        <div class="section" id="streamControls" v-show="showStreamControls">
          <div class="section-title">🌊 流式加载控制</div>
          <div class="form-group">
            <label>分块大小:</label>
            <select v-model="chunkSize">
              <option value="0">不分块</option>
              <option value="65536">64KB</option>
              <option value="131072">128KB</option>
              <option value="262144">256KB</option>
              <option value="524288">512KB</option>
              <option value="1048576">1MB</option>
              <option value="2097152">2MB</option>
              <option value="3145728">3MB</option>
              <option value="5242880">5MB</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="enableResume">
              启用断点续传
            </label>
          </div>
          <div class="form-group">
            <button @click="pauseStream" :disabled="!canPause">⏸️ 暂停</button>
            <button @click="resumeStream" :disabled="!canResume">▶️ 继续</button>
            <button @click="cancelStream" :disabled="!canCancel">❌ 取消</button>
          </div>
        </div>
      </div>

      <!-- 渲染控制 -->
      <div class="section">
        <div class="section-title">🎮 渲染控制</div>
        <button @click="resetCamera">🔄 重置相机</button>
        <button @click="toggleWireframe">📐 线框模式</button>
        <button @click="toggleInfo">📊 显示信息</button>
      </div>

      <!-- 进度显示 -->
      <div class="section">
        <div class="section-title">📈 加载进度</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ progressText }}</div>
        </div>

        <!-- 流式加载详细进度 -->
        <div id="streamProgress" v-show="showStreamProgress">
          <div class="info-item">
            <span class="info-label">已下载:</span>
            <span class="info-value">{{ downloadedSize }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总大小:</span>
            <span class="info-value">{{ totalSize }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下载速度:</span>
            <span class="info-value">{{ downloadSpeed }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">剩余时间:</span>
            <span class="info-value">{{ remainingTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前分块:</span>
            <span class="info-value">{{ currentChunk }}</span>
          </div>
        </div>
      </div>

      <!-- 信息面板 -->
      <div class="section">
        <div class="section-title">📊 模型信息</div>
        <div class="info-panel">
          <div class="info-item" v-for="(value, key) in modelInfo" :key="key">
            <span class="info-label">{{ key }}:</span>
            <span class="info-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 动画控制面板 -->
      <div class="section" v-show="showAnimationSection">
        <div class="section-title">🎬 动画控制</div>
        <div class="info-panel">
          <div class="info-item">
            <span class="info-label">动画信息:</span>
            <span class="info-value">{{ animationInfo }}</span>
          </div>
          <div class="animation-controls">
            <button @click="playAnimation">▶️ 播放</button>
            <button @click="stopAnimation">⏹️ 停止</button>
          </div>
        </div>
      </div>

      <!-- 性能统计面板 -->
      <div class="section">
        <div class="section-title">⚡ 性能统计</div>
        <div class="info-panel">
          <div class="info-item" v-for="(value, key) in performanceStats" :key="key">
            <span class="info-label">{{ key }}:</span>
            <span class="info-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div ref="viewerContainer" id="viewer"></div>
      <div class="loading" v-show="isLoading">
        <div class="spinner"></div>
        <div>正在加载模型...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
// import type { FastDogWASMDecoder, WASMModelLoader } from '../types/external'

// 响应式数据
const selectedModel = ref('merge.gltf')
const loadMethod = ref('realtime-wasm')
// const selectedLoadMethod = ref('stream') // 使用 loadMethod 替代
const progress = ref(0)
const progressText = ref('等待加载...')
const isLoading = ref(false)
const chunkSize = ref(0)
const enableResume = ref(true)
const wireframeMode = ref(false)
const showInfo = ref(false)
const showAnimationSection = ref(false)
const animationInfo = ref('无动画')

// 计算属性
const showStreamControls = computed(() => {
  return loadMethod.value === 'stream-wasm' || loadMethod.value === 'realtime-wasm'
})

const showStreamProgress = computed(() => {
  return showStreamControls.value && isLoading.value
})

const canPause = ref(false)
const canResume = ref(false)
const canCancel = ref(false)

// 流式进度数据
const downloadedSize = ref('0 MB')
const totalSize = ref('未知')
const downloadSpeed = ref('0 KB/s')
const remainingTime = ref('计算中...')
const currentChunk = ref('0/0')

// 模型信息
const modelInfo = reactive({
  '状态': '等待加载'
})

// 性能统计
const performanceStats = reactive({
  '总耗时': '-',
  '网络请求': '-',
  '数据传输': '-',
  '数据解码': '-',
  '几何转换': '-'
})

// 加载方式选项
const loadMethods = [
  { value: 'stream', label: 'Stream' },
  { value: 'wasm', label: 'WASM解码' },
  { value: 'stream-wasm', label: '🌊 流式WASM' },
  { value: 'realtime-wasm', label: '⚡ 实时流式WASM' }
]

// Three.js 相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let currentModel: THREE.Object3D | null = null
let animationMixer: THREE.AnimationMixer | null = null
let animationActions: THREE.AnimationAction[] = []
const clock = new THREE.Clock()
let isAnimationPlaying = false

// 模型加载器和解码器
interface WASMDecoder {
  init(): Promise<void>
  decode(data: ArrayBuffer): Promise<{ data: ArrayBuffer }>
}

interface ModelLoader {
  authToken: string
  getModelInfo(uuid: string): Promise<{ size: number; created_at: string; content_type: string }>
}

let modelLoader: ModelLoader | null = null
let wasmDecoder: WASMDecoder | null = null
let authToken: string | null = null

// 流式加载相关
const streamController: AbortController | null = null

// 模型选项数组
const modelOptions = [
  { name: 'merge.gltf', uuid: '326868cfb53e44f1a9b418a05044fc2f' },
  { name: 'Bee.glb', uuid: 'f2c992a231c74dcc86e5e7c63b8b1eb5' },
  { name: 'SambaDancing.fbx', uuid: '73e872d4b0f54075859cefb9eda2eb54' },
];

// DOM 引用
const viewerContainer = ref<HTMLElement>()

// 方法
const setLoadMethod = (method: string) => {
  loadMethod.value = method
}

const getUuidByName = (modelName: string) => {
  const model = modelOptions.find(option => option.name === modelName)
  return model ? model.uuid : null
}

const updateInfo = (key: string, value: string) => {
  modelInfo[key] = value
}

const updateProgress = (percent: number, text: string) => {
  progress.value = percent
  progressText.value = text
}

const setupLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  // 主光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 补光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-10, 0, -5)
  scene.add(fillLight)
}

const animate = () => {
  requestAnimationFrame(animate)

  // 更新动画
  if (animationMixer && isAnimationPlaying) {
    animationMixer.update(clock.getDelta())
  }

  controls.update()
  renderer.render(scene, camera)
}

const initThreeJS = async () => {
  if (!viewerContainer.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a202c)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    (window.innerWidth - 300) / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(5, 5, 5)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth - 300, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  viewerContainer.value.appendChild(renderer.domElement)

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 添加光源
  setupLighting()

  // 开始渲染循环
  animate()
}

const initWASMDecoder = async () => {
  try {
    console.log('🚀 初始化 WASM 解码器...')
    // 等待外部脚本加载完成后使用全局变量
    if (typeof (window as unknown as Record<string, unknown>).FastDogWASMDecoder === 'undefined') {
      throw new Error('FastDogWASMDecoder not loaded')
    }
    const FastDogWASMDecoder = (window as unknown as Record<string, unknown>).FastDogWASMDecoder as new () => WASMDecoder
    wasmDecoder = new FastDogWASMDecoder()
    await wasmDecoder.init()
    console.log('✅ WASM 解码器初始化成功')
    updateInfo('WASM', '已初始化')
  } catch (error) {
    console.error('❌ WASM 解码器初始化失败:', error)
    updateInfo('WASM', '初始化失败')
    // 如果 WASM 不可用，回退到 Stream 模式
    loadMethod.value = 'stream'
  }
}

const login = async () => {
  try {
    const response = await fetch("/api/v1/auth/login/access-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "username=admin&password=admin123",
    })

    if (response.ok) {
      const data = await response.json()
      authToken = data.access_token
      if (modelLoader && authToken) {
        modelLoader.authToken = authToken
      }
      updateInfo('认证', '已登录')
      console.log('✅ 登录成功')
    } else {
      throw new Error('登录失败')
    }
  } catch (error) {
    console.error('❌ 登录失败:', error)
    updateInfo('认证', '登录失败')
  }
}

const loadOriginModel = async () => {
  const uuid = getUuidByName(selectedModel.value)
  if (!uuid) {
    console.error('未找到模型UUID')
    return
  }

  isLoading.value = true
  updateProgress(0, '开始直接加载...')

  try {
    const url = `/static/models/${selectedModel.value}`

    // 根据文件扩展名选择加载器
    const extension = selectedModel.value.split('.').pop()?.toLowerCase()
    let loader: GLTFLoader | FBXLoader

    if (extension === 'gltf' || extension === 'glb') {
      loader = new GLTFLoader()
    } else if (extension === 'fbx') {
      loader = new FBXLoader()
    } else {
      throw new Error('不支持的文件格式')
    }

    updateProgress(50, '正在解析模型...')

    loader.load(
        url,
        (object: unknown) => {
          // 清除之前的模型
          if (currentModel) {
            scene.remove(currentModel)
          }

          // 添加新模型
          const model = extension === 'gltf' || extension === 'glb' ? (object as { scene: THREE.Object3D }).scene : object as THREE.Object3D
          scene.add(model)
          currentModel = model

        // 设置动画
          const gltfObject = object as { animations?: THREE.AnimationClip[]; scene?: THREE.Object3D }
          if (gltfObject.animations && gltfObject.animations.length > 0) {
            animationMixer = new THREE.AnimationMixer(model)
            animationActions = []

            gltfObject.animations.forEach((clip: THREE.AnimationClip) => {
              const action = animationMixer!.clipAction(clip)
              animationActions.push(action)
            })

            showAnimationSection.value = true
            animationInfo.value = `${gltfObject.animations.length} 个动画`
          } else {
            showAnimationSection.value = false
            animationInfo.value = '无动画'
          }

        // 调整相机位置
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        camera.position.copy(center)
        camera.position.x += maxDim * 1.5
        camera.position.y += maxDim * 1.5
        camera.position.z += maxDim * 1.5
        camera.lookAt(center)

        controls.target.copy(center)
        controls.update()

        updateProgress(100, '加载完成')
        updateInfo('状态', '加载成功')
        updateInfo('顶点数', model.children.length.toString())

        isLoading.value = false
      },
      (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total) * 100
        updateProgress(percent, `加载中... ${percent.toFixed(1)}%`)
      },
      (error: Error) => {
        console.error('模型加载失败:', error)
        updateProgress(0, '加载失败')
        updateInfo('状态', '加载失败')
        isLoading.value = false
      }
    )
  } catch (error) {
    console.error('加载失败:', error)
    updateProgress(0, '加载失败')
    updateInfo('状态', '加载失败')
    isLoading.value = false
  }
}

const loadModelStream = async (): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: { totalTime: number; downloadTime: number; decodeTime: number } }> => {
  console.log('🌊 开始流式加载...')
  const uuid = getUuidByName(selectedModel.value)
  if (!uuid) throw new Error('无法获取模型UUID')

  const startTime = Date.now()
  updateProgress(10, '🌊 流式: 开始下载...')

  try {
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`/api/v1/resources/models/uuid/${uuid}`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    updateProgress(50, '🌊 流式: 下载完成，解析中...')

    const arrayBuffer = await response.arrayBuffer()
    const loader = new GLTFLoader()

    return new Promise((resolve, reject) => {
      loader.parse(arrayBuffer, '', (gltf: { scene: THREE.Object3D }) => {
        const endTime = Date.now()
        const firstChild = gltf.scene.children[0] as THREE.Mesh
        resolve({
          model: gltf.scene,
          geometry: firstChild?.geometry || new THREE.BufferGeometry(),
          performanceStats: {
            totalTime: endTime - startTime,
            downloadTime: endTime - startTime,
            decodeTime: 0
          }
        })
      }, reject)
    })
  } catch (error) {
    console.error('流式加载失败:', error)
    throw error
  }
}

// 构建模型的辅助函数
const buildModelWithGLTFLoader = async (modelData: ArrayBuffer | string | Record<string, unknown>): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry }> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🎨 开始解析模型数据')
      console.log('📊 传入数据类型:', typeof modelData)
      console.log('📊 传入数据内容:', modelData)

      // 检测数据格式
      // 首先检查是否包含原始格式数据（FBX等）
      if (typeof modelData === 'object' && modelData !== null &&
          'extensions' in modelData &&
          typeof (modelData as Record<string, unknown>).extensions === 'object' &&
          (modelData as Record<string, unknown>).extensions !== null &&
          'FASTDOG_ORIGINAL_FORMAT' in ((modelData as Record<string, unknown>).extensions as Record<string, unknown>)) {
        const originalFormat = ((modelData as Record<string, unknown>).extensions as Record<string, unknown>).FASTDOG_ORIGINAL_FORMAT as Record<string, unknown>
        console.log(`🔧 检测到原始格式: ${originalFormat.format}`)

        if (originalFormat.format === '.fbx') {
          console.log('📊 检测到FBX格式，使用FBXLoader')
          try {
            const binaryString = atob(originalFormat.data as string)
            const arrayBuffer = new ArrayBuffer(binaryString.length)
            const uint8Array = new Uint8Array(arrayBuffer)
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i)
            }

            const loader = new FBXLoader()
            const fbxModel = loader.parse(arrayBuffer, '')

            console.log('✅ FBXLoader解析成功')

            // 提取第一个几何体用于向后兼容
            let geometry: THREE.BufferGeometry | null = null
            fbxModel.traverse((child: THREE.Object3D) => {
              if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry && !geometry) {
                geometry = (child as THREE.Mesh).geometry
              }
            })

            if (!geometry) {
              geometry = new THREE.BoxGeometry(1, 1, 1)
            }

            resolve({
              model: fbxModel,
              geometry: geometry
            })
            return
          } catch (error: unknown) {
            throw new Error('FBX数据解析失败: ' + (error as Error).message)
          }
        } else {
          throw new Error(`不支持的原始格式: ${originalFormat.format}`)
        }
      }

      // 检查直接的FBX格式标识
      if (typeof modelData === 'object' && modelData !== null && (modelData as Record<string, unknown>).type === 'fbx' && (modelData as Record<string, unknown>).data) {
        // FBX格式处理
        console.log('📊 检测到直接FBX格式，使用FBXLoader')
        try {
          const binaryString = atob((modelData as Record<string, unknown>).data as string)
          const arrayBuffer = new ArrayBuffer(binaryString.length)
          const uint8Array = new Uint8Array(arrayBuffer)
          for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i)
          }

          const loader = new FBXLoader()
          const fbxModel = loader.parse(arrayBuffer, '')

          console.log('✅ FBXLoader解析成功')

          // 提取第一个几何体用于向后兼容
          let geometry: THREE.BufferGeometry | null = null
          fbxModel.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry && !geometry) {
              geometry = (child as THREE.Mesh).geometry
            }
          })

          if (!geometry) {
            geometry = new THREE.BoxGeometry(1, 1, 1)
          }

          resolve({
            model: fbxModel,
            geometry: geometry
          })
          return
        } catch (error: unknown) {
          throw new Error('FBX数据解析失败: ' + (error as Error).message)
        }
      }

      // GLTF/GLB格式处理
      const loader = new GLTFLoader()

      // 确保数据格式正确：GLTFLoader.parse支持JSON字符串、JSON对象或ArrayBuffer（GLB）
      let dataToParse: ArrayBuffer | string
      if (modelData instanceof ArrayBuffer) {
        // 如果是ArrayBuffer（GLB格式），直接使用
        dataToParse = modelData
        console.log('📊 检测到GLB二进制数据，大小:', modelData.byteLength, '字节')
      } else if (typeof modelData === 'object' && modelData !== null && (modelData as Record<string, unknown>).type === 'glb' && (modelData as Record<string, unknown>).data) {
        // 如果是WASM解码器返回的GLB对象格式，需要将base64数据转换为ArrayBuffer
        console.log('📊 检测到WASM解码器GLB对象格式，转换base64数据')
        try {
          const binaryString = atob((modelData as Record<string, unknown>).data as string)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          dataToParse = bytes.buffer
          console.log('📊 GLB数据转换完成，大小:', dataToParse.byteLength, '字节')
        } catch (error: unknown) {
          throw new Error('GLB base64数据解码失败: ' + (error as Error).message)
        }
      } else if (typeof modelData === 'string') {
        // 如果是字符串，直接使用
        dataToParse = modelData
      } else if (typeof modelData === 'object' && modelData !== null) {
        // 如果是普通对象，转换为JSON字符串
        dataToParse = JSON.stringify(modelData)
      } else {
        throw new Error('无效的模型数据格式')
      }

      console.log('📊 解析数据类型:', typeof dataToParse)

      // 直接使用parse方法解析GLTF JSON数据，无需创建Blob URL
      loader.parse(
        dataToParse, // 传入正确格式的数据
        '', // 资源路径（空字符串表示无外部资源）
        (gltf: { scene: THREE.Object3D }) => {
          console.log('✅ GLTFLoader直接解析成功，保留完整材质')

          // 提取第一个几何体用于向后兼容
          let geometry: THREE.BufferGeometry | null = null
          if (gltf.scene) {
            gltf.scene.traverse((child: THREE.Object3D) => {
              if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry && !geometry) {
                geometry = (child as THREE.Mesh).geometry
              }
            })
          }

          if (!geometry) {
            // 如果没有找到几何体，创建一个默认的
            geometry = new THREE.BoxGeometry(1, 1, 1)
          }

          // 返回完整的模型和几何体
          resolve({
            model: gltf.scene || new THREE.Object3D(),
            geometry: geometry
          })
        },
        (error: unknown) => {
          console.error('❌ GLTFLoader直接解析失败:', error)
          reject(error)
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

const loadModelWASM = async (): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: { totalTime: number; downloadTime: number; decodeTime: number } }> => {
  console.log('🔧 开始WASM解码加载...')

  // 检查WASM解码器是否已初始化
  if (!wasmDecoder) {
    throw new Error('WASM解码器未初始化，请先初始化WASM解码器')
  }

  const uuid = getUuidByName(selectedModel.value)
  if (!uuid) throw new Error('无法获取模型UUID')

  const startTime = Date.now()
  updateProgress(10, 'WASM: 开始下载二进制数据...')

  try {
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`/api/v1/resources/models/uuid/${uuid}`, {
      headers
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    updateProgress(30, 'WASM: 下载完成，开始解码...')

    const binaryData = await response.arrayBuffer()
    const downloadTime = Date.now() - startTime

    updateProgress(50, 'WASM: 使用 WASM 解码中...')

    const decodeStartTime = Date.now()
    const decodeResult = await wasmDecoder.decode(binaryData)
    const decodeTime = Date.now() - decodeStartTime

    updateProgress(80, 'WASM: 解码完成，构建模型...')

    // 解析解码结果
    let parsedData: ArrayBuffer | string | Record<string, unknown> = decodeResult.data
    if (typeof decodeResult.data === 'string') {
      try {
        parsedData = JSON.parse(decodeResult.data)
      } catch (e) {
        console.warn('⚠️ 无法解析为JSON:', e)
      }
    }

    // 使用buildModelWithGLTFLoader构建模型
    const modelResult = await buildModelWithGLTFLoader(parsedData)
    const endTime = Date.now()

    return {
      model: modelResult.model,
      geometry: modelResult.geometry,
      performanceStats: {
        totalTime: endTime - startTime,
        downloadTime: downloadTime,
        decodeTime: decodeTime
      }
    }
  } catch (error) {
    console.error('WASM 模型加载失败:', error)
    throw error
  }
}

const loadModelStreamWASM = async (): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: { totalTime: number; downloadTime: number; decodeTime: number } }> => {
  console.log('🌊🔧 开始流式WASM加载...')
  // 暂时使用普通WASM加载，后续可以实现真正的流式功能
  return await loadModelWASM()
}

const loadModelStreamWASMRealtime = async (): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: { totalTime: number; downloadTime: number; decodeTime: number } }> => {
  console.log('⚡ 开始实时流式WASM加载...')
  // 暂时使用普通WASM加载，后续可以实现真正的实时流式功能
  return await loadModelWASM()
}

const loadModel = async () => {
  console.log('🚀 开始加载模型...')
  const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement | null

  if (loadBtn) {
    loadBtn.disabled = true
  }
  isLoading.value = true

  try {
    updateProgress(0, '开始加载...')

    let result: { model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: { totalTime: number; downloadTime: number; decodeTime: number } }

    switch (loadMethod.value) {
      case 'stream':
        result = await loadModelStream()
        break
      case 'wasm':
        result = await loadModelWASM()
        break
      case 'stream-wasm':
        result = await loadModelStreamWASM()
        break
      case 'realtime-wasm':
        result = await loadModelStreamWASMRealtime()
        break
      default:
        throw new Error('未知的加载方式')
    }

    updateProgress(100, '加载完成!')

    // 移除旧模型
    if (currentModel) {
      scene.remove(currentModel)
    }

    // 添加新模型
    if (result.model) {
      currentModel = result.model
      currentModel.traverse((child: THREE.Object3D) => {
          const mesh = child as THREE.Mesh
          if (mesh.isMesh) {
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })
      scene.add(currentModel)

      // 自动调整相机位置
      const box = new THREE.Box3().setFromObject(currentModel)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ *= 1.5

      camera.position.set(center.x, center.y, center.z + cameraZ)
      camera.lookAt(center)
      controls.target.copy(center)
      controls.update()

      updateInfo('状态', '加载完成')
      updateInfo('顶点数', result.geometry && result.geometry.attributes && result.geometry.attributes.position ? result.geometry.attributes.position.count.toString() : '未知')

      if (result.performanceStats) {
        performanceStats['总耗时'] = result.performanceStats.totalTime + 'ms'
        performanceStats['数据传输'] = result.performanceStats.downloadTime + 'ms'
        performanceStats['数据解码'] = result.performanceStats.decodeTime + 'ms'
      }
    }

  } catch (error) {
    console.error('加载失败:', error)
    updateProgress(0, '加载失败')
    updateInfo('状态', '加载失败')
  } finally {
    isLoading.value = false
    if (loadBtn) {
      loadBtn.disabled = false
    }
  }
}

const getModelInfo = async () => {
  const uuid = getUuidByName(selectedModel.value)
  if (!uuid || !modelLoader) {
    console.error('无法获取模型信息')
    return
  }

  try {
    const info = await modelLoader.getModelInfo(uuid)
    updateInfo('文件大小', (info.size / 1024 / 1024).toFixed(2) + ' MB')
    updateInfo('创建时间', new Date(info.created_at).toLocaleString())
    updateInfo('文件类型', info.content_type)
  } catch (error) {
    console.error('获取模型信息失败:', error)
  }
}

const resetCamera = () => {
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
}

const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value
  if (currentModel) {
    currentModel.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const material = mesh.material as THREE.Material & { wireframe: boolean }
        material.wireframe = wireframeMode.value
      }
    })
  }
}

const toggleInfo = () => {
  showInfo.value = !showInfo.value
}

const playAnimation = () => {
  if (animationActions.length > 0) {
    animationActions.forEach(action => action.play())
    isAnimationPlaying = true
  }
}

const stopAnimation = () => {
  if (animationActions.length > 0) {
    animationActions.forEach(action => action.stop())
    isAnimationPlaying = false
  }
}

const pauseStream = () => {
  canPause.value = false
  canResume.value = true
}

const resumeStream = () => {
  canPause.value = true
  canResume.value = false
}

const cancelStream = () => {
  if (streamController) {
    streamController.abort()
  }
  canPause.value = false
  canResume.value = false
  canCancel.value = false
}

// 窗口大小调整
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = (window.innerWidth - 300) / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth - 300, window.innerHeight)
  }
}

// 动态加载外部脚本
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查脚本是否已经存在
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

// 加载必要的脚本
const loadExternalScripts = async () => {
  try {
    // 检查脚本是否已经加载
    if (typeof (window as unknown as Record<string, unknown>).FastDogWASMDecoder !== 'undefined' &&
        typeof (window as unknown as Record<string, unknown>).WASMModelLoader !== 'undefined') {
      return
    }

    await loadScript('/js/wasm-decoder.js')
     await loadScript('/js/model-loader.js')
    console.log('External scripts loaded successfully')
  } catch (error) {
    console.error('Failed to load external scripts:', error)
    throw error
  }
}

// 生命周期
onMounted(async () => {
  try {
    await nextTick()

    // 加载外部脚本
    await loadExternalScripts()

    // 等待一小段时间确保脚本完全加载
    await new Promise(resolve => setTimeout(resolve, 100))

    await initThreeJS()
    await initWASMDecoder()

    // 初始化模型加载器
    try {
      if (typeof (window as unknown as Record<string, unknown>).WASMModelLoader === 'undefined') {
        throw new Error('WASMModelLoader not loaded')
      }
      const WASMModelLoaderClass = (window as unknown as Record<string, unknown>).WASMModelLoader as new (baseUrl: string, token: string | null) => ModelLoader
      modelLoader = new WASMModelLoaderClass('/api/v1/resources', authToken)
      console.log('✅ 模型加载器初始化成功')
    } catch (error) {
      console.error('模型加载器初始化失败:', error)
    }

    await login()

    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('组件初始化失败:', error)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // 清理Three.js资源
  if (renderer) {
    renderer.dispose()
  }
  if (currentModel) {
    scene.remove(currentModel)
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.threeContainer {
  display: flex;
  height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  position: relative;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #4a5568;
  text-align: center;
}

.section {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #4a5568;
}

select,
input,
button {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

select:focus,
input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 10px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.progress-container {
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: 0%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #718096;
  margin-top: 5px;
}

.info-panel {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
  font-size: 12px;
  color: #4a5568;
  max-height: 200px;
  overflow-y: auto;
}

.info-item {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.info-label {
  font-weight: 500;
}

.info-value {
  color: #667eea;
}

.animation-controls {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.animation-controls button {
  flex: 1;
  padding: 8px 12px;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.animation-controls button:hover {
  background: #2d3748;
}

.animation-controls button:disabled {
  background: #2d3748;
  cursor: not-allowed;
  opacity: 0.6;
}

#viewer {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #1a202c 0%, #2d3748 100%);
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 18px;
  text-align: center;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.method-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.method-btn {
  flex: 1;
  padding: 8px;
  font-size: 12px;
  margin-bottom: 0;
}

.method-btn.active {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-success {
  background: #48bb78;
}

.status-error {
  background: #f56565;
}

.status-loading {
  background: #ed8936;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 流式加载控制面板样式 */
#streamControls {
  border: 2px solid #4299e1;
  border-radius: 8px;
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
}

#streamControls .section-title {
  color: #2b6cb0;
  border-bottom-color: #4299e1;
}

#streamControls select {
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  padding: 4px 8px;
  width: 100%;
}

#streamControls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #2d3748;
}

#streamControls input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

#streamControls button {
  padding: 6px 12px;
  margin: 2px;
  border-radius: 4px;
  font-size: 12px;
  min-width: 70px;
}

/* 流式进度详细信息样式 */
#streamProgress {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
  margin-top: 10px;
}

#streamProgress .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
}

#streamProgress .info-item:last-child {
  border-bottom: none;
}

#streamProgress .info-label {
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

#streamProgress .info-value {
  font-size: 12px;
  color: #2d3748;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}
</style>
