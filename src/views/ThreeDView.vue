<template>
  <div class="flex h-screen bg-#f5f7fa font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] md:flex-col-768">
    <div class="w-300px bg-white border-r-1 border-r-solid border-r-#e4e7ed p-5px overflow-y-auto shadow-lg md:w-full-768 md:h-auto-768 md:max-h-40vh-768">
      <el-card class="mb-20px" shadow="never">
        <h2 class="m-0 text-18px font-bold text-center text-#303133">🚀 WASM模型查看器</h2>
      </el-card>

      <!-- 模型选择 -->
      <el-card class="mb-20px" shadow="hover">
        <template #header>
          <div class="text-14px font-600 text-#606266">📁 模型选择</div>
        </template>
        <el-form-item label="选择模型:">
          <el-select v-model="selectedModel" placeholder="请选择模型" style="width: 100%">
            <el-option
              v-for="model in modelOptions"
              :key="model.id"
              :label="model.name"
              :value="model.name"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <!-- 传输方式选择 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">📡 传统方式</div>
        </template>
        <el-button type="primary" @click="loadOriginModel" style="width: 100%">
          直接加载
        </el-button>
      </el-card>

      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">🔄 传输方式</div>
        </template>
        <div class="flex flex-wrap gap-5px mb-15px">
          <el-button
            v-for="method in loadMethods"
            :key="method.value"
            :type="loadMethod === method.value ? 'primary' : 'default'"
            size="small"
            @click="setLoadMethod(method.value)"
            style="margin: 2px; flex: 1"
          >
            {{ method.label }}
          </el-button>
        </div>
        <el-space direction="horizontal" style="width: 100%" :size="10">
          <el-button type="success" @click="loadModel" style="width: 100%">
            🚀 加载模型
          </el-button>
          <el-button type="info" @click="getModelInfo" style="width: 100%">
            📋 获取信息
          </el-button>
        </el-space>

        <!-- 流式加载控制面板 -->
        <el-card v-show="showStreamControls" class="mt-15px border-2 border-solid border-#409eff bg-gradient-to-br from-#ecf5ff to-#d9ecff" shadow="never">
          <template #header>
            <div class="section-title">🌊 流式加载控制</div>
          </template>
          <el-space direction="vertical" style="width: 100%" :size="15">
            <el-form-item label="分块大小:">
              <el-select v-model="chunkSize" style="width: 180px">
                <el-option
                  v-for="option in chunkSizeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-checkbox v-model="enableResume">
              启用断点续传
            </el-checkbox>
            <el-space direction="horizontal" style="width: 100%" :size="10">
              <el-button size="small" :disabled="!canPause" @click="pauseStream">
                ⏸️ 暂停
              </el-button>
              <el-button size="small" :disabled="!canResume" @click="resumeStream">
                ▶️ 继续
              </el-button>
              <el-button size="small" :disabled="!canCancel" @click="cancelStream">
                ❌ 取消
              </el-button>
            </el-space>
          </el-space>
        </el-card>
      </el-card>

      <!-- 渲染控制 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">🎮 渲染控制</div>
        </template>
        <el-space  style="width: 100%">
          <el-button size="small" @click="resetCamera">🔄 重置相机</el-button>
          <el-button size="small" @click="toggleWireframe">📐 线框模式</el-button>
          <el-button size="small" @click="toggleInfo">📊 显示信息</el-button>
        </el-space>
      </el-card>

      <!-- 进度显示 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">📈 加载进度</div>
        </template>
        <el-space direction="vertical" style="width: 100%" :size="10">
          <el-progress :percentage="progress" :status="isLoading ? 'active' : 'success'" />
          <div class="text-12px text-#909399 text-center">{{ progressText }}</div>
        </el-space>

        <!-- 流式加载详细进度 -->
        <el-card v-show="showStreamProgress" class="mt-10px bg-gradient-to-br from-#f5f7fa to-#e4e7ed" shadow="never">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="已下载">{{ downloadedSize }}</el-descriptions-item>
            <el-descriptions-item label="总大小">{{ totalSize }}</el-descriptions-item>
            <el-descriptions-item label="下载速度">{{ downloadSpeed }}</el-descriptions-item>
            <el-descriptions-item label="剩余时间">{{ remainingTime }}</el-descriptions-item>
            <el-descriptions-item label="当前分块">{{ currentChunk }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-card>

      <!-- 信息面板 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">📊 模型信息</div>
        </template>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item v-for="(value, key) in modelInfo" :key="key" :label="key">
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 动画控制面板 -->
      <el-card v-show="showAnimationSection" class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">🎬 动画控制</div>
        </template>
        <el-space direction="vertical" style="width: 100%" :size="10">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="动画信息">{{ animationInfo }}</el-descriptions-item>
          </el-descriptions>
          <el-space wrap style="width: 100%">
            <el-button type="primary" size="small" @click="playAnimation(0)">
              ▶️ 播放
            </el-button>
            <el-button size="small" @click="stopAnimation">
              ⏹️ 停止
            </el-button>
          </el-space>
        </el-space>
      </el-card>

      <!-- 性能统计面板 -->
      <el-card class="section-card" shadow="hover">
        <template #header>
          <div class="section-title">⚡ 性能统计</div>
        </template>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item v-for="(value, key) in performanceStats" :key="key" :label="key">
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <div class="flex-1 relative bg-#f5f7fa md:h-60vh-768">
      <div ref="viewerContainer" id="viewer" class="w-full h-full bg-gradient-to-br from-#1a202c to-#2d3748"></div>
      <el-loading
        v-loading="isLoading"
        element-loading-text="正在加载模型..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import FastDogDecoder from '../loaders/wasm-decoder.js'
// import WASMModelLoader from '../loaders/model-loader.js'
import HttpDataProvider from '../loaders/HttpDataProvider.js'
import { streamModelByUuid,getModel3Ds } from '../api/resources'
import LoadingStateMachine from '../utils/LoadingStateMachine.js'
// import type { FastDogWASMDecoder, WASMModelLoader } from '../types/external'

// 创建状态机实例
const loadingStateMachine = new LoadingStateMachine()

// 响应式数据
const selectedModel = ref('')
const loadMethod = ref('realtime-wasm')
const modelOptions = ref([])
const chunkSize = ref(0)
const enableResume = ref(true)

// 分块大小选项
const chunkSizeOptions = [
  { label: '不分块', value: 0 },
  { label: '64KB', value: 65536 },
  { label: '128KB', value: 131072 },
  { label: '256KB', value: 262144 },
  { label: '512KB', value: 524288 },
  { label: '1MB', value: 1048576 },
  { label: '2MB', value: 2097152 },
  { label: '3MB', value: 3145728 },
  { label: '5MB', value: 5242880 }
]
const wireframeMode = ref(false)
const showInfo = ref(false)
const showAnimationSection = ref(false)
const animationInfo = ref('无动画')

// 从状态机获取的响应式数据
const progress = ref(0)
const progressText = ref('等待加载...')
const isLoading = ref(false)
const loadingError = ref(null)

// 控制按钮状态
const canPause = ref(false)
const canResume = ref(false)
const canCancel = ref(false)

// 设置状态机事件监听器
loadingStateMachine.on('stateChange', ({ context }) => {
  isLoading.value = loadingStateMachine.isLoading()
  progress.value = context.progress
  progressText.value = context.message
  loadingError.value = context.error

  // 更新控制按钮状态
  canPause.value = loadingStateMachine.canPause()
  canResume.value = loadingStateMachine.canResume()
  canCancel.value = loadingStateMachine.canCancel()
})

loadingStateMachine.on('progress', (context) => {
  progress.value = context.progress
  progressText.value = context.message
})

// 计算属性
const showStreamControls = computed(() => {
  return loadMethod.value === 'stream-wasm' || loadMethod.value === 'realtime-wasm'
})

const showStreamProgress = computed(() => {
  return showStreamControls.value && isLoading.value
})

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
  '几何转换': '-',
  '分块数量': '-',
  '分块大小': '-',
  '压缩比': '-',
  '原始大小': '-',
  '压缩大小': '-',
  '平均速度': '-',
  '流式解码': '-'
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
const isAnimationPlaying = ref(false)

// 模型加载器和解码器
interface StreamDecoder {
  add_chunk(chunk: Uint8Array): StreamResult
  free(): void
}

interface StreamResult {
  success: boolean
  is_complete: boolean
  progress: number
  data: string | ArrayBuffer | object
  error?: string
  chunks_processed: number
  total_received: number
  stats?: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    wasmDecodeTime: number
  }
}

interface ExtendedPerformanceStats {
  totalTime: number
  downloadTime: number
  decodeTime: number
  chunksCount?: number
  chunkSize?: number
  compressionRatio?: string
  originalSize?: number
  compressedSize?: number
  averageSpeed?: number
  wasmDecodeTime?: string
  streamingEnabled?: boolean
}

interface DataProvider {
  authToken: string | null
  getModelInfo?(uuid: string): Promise<{ size: number; created_at: string; content_type: string }>
}

let dataProvider: DataProvider | null = null
let wasmDecoder: FastDogDecoder | null = null
let authToken: string | null = null

// 流式加载相关
const streamState = reactive({
  controller: null as AbortController | null,
  downloadBuffer: null as ArrayBuffer | null,
  downloadedBytes: 0,
  totalBytes: 0,
  downloadStartTime: 0,
  lastProgressTime: 0,
  lastDownloadedBytes: 0,
  isPaused: false,
  isCancelled: false,
  resumeData: null as {
    filename: string
    downloadedBytes: number
    totalBytes: number
    timestamp: number
  } | null
})

// 加载模型数据
getModel3Ds({is_active:true}).then(res => {
  console.log(res)
  if (res && res.length > 0) {
    modelOptions.value = res
    selectedModel.value = res[0].name
  }
}).catch(err => {
  console.log(err)
  modelOptions.value=[
  { name: 'merge.gltf', uuid: '326868cfb53e44f1a9b418a05044fc2f' },
  { name: 'Bee.glb', uuid: 'f2c992a231c74dcc86e5e7c63b8b1eb5' },
  { name: 'SambaDancing.fbx', uuid: '73e872d4b0f54075859cefb9eda2eb54' },
]
})

// DOM 引用
const viewerContainer = ref<HTMLElement>()

// 方法
const setLoadMethod = (method: string) => {
  loadMethod.value = method
}

const getUuidByName = (modelName: string) => {
  const model = modelOptions.value.find(option => option.name === modelName)
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
  if (animationMixer && isAnimationPlaying.value) {
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
    // 直接使用导入的类
    wasmDecoder = new FastDogDecoder()
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
      if (dataProvider && authToken) {
        dataProvider.authToken = authToken
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
  const model = modelOptions.value.find(option => option.name === selectedModel.value)
  if (!model || !model.model_file_url) {
    loadingStateMachine.error('未找到模型或模型文件URL')
    return
  }

  // 重置状态机并开始加载
  loadingStateMachine.reset()
  loadingStateMachine.startLoading('开始直接加载...')

  try {
    const url = model.model_file_url

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

    loadingStateMachine.startBuilding('正在解析模型...')

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

        loadingStateMachine.success(model, '加载完成')
        updateInfo('状态', '加载成功')
        updateInfo('顶点数', model.children.length.toString())
      },
      (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total) * 100
        loadingStateMachine.emit('progress', {
          progress: percent,
          message: `加载中... ${percent.toFixed(1)}%`
        })
      },
      (error: Error) => {
        console.error('模型加载失败:', error)
        loadingStateMachine.error(error.message, '加载失败')
        updateInfo('状态', '加载失败')
      }
    )
  } catch (error) {
    console.error('加载失败:', error)
    loadingStateMachine.error(error.message, '加载失败')
    updateInfo('状态', '加载失败')
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

    const response = await streamModelByUuid(uuid)
    if ('error' in response) {
      throw new Error(`API Error: ${response.error}`)
    }

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    updateProgress(30, '🌊 流式: 下载完成，开始解码...')

    const arrayBuffer = await response.data.arrayBuffer()
    const downloadTime = Date.now() - startTime

    // 检查数据格式，如果是FastDog格式则需要解码
    const magic = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, 8))

    let decodedData: ArrayBuffer | string
    let decodeTime = 0

    if (magic.startsWith('FASTDOG')) {
      // FastDog格式，需要解码
      updateProgress(50, '🌊 流式: 检测到FastDog格式，使用解码器...')

      if (!wasmDecoder) {
        throw new Error('WASM解码器未初始化，无法解码FastDog格式')
      }

      const decodeStartTime = Date.now()
      const decodeResult = await wasmDecoder.decode(arrayBuffer, false, { modelId: selectedModel.value, uuid: uuid })
      decodeTime = Date.now() - decodeStartTime
      decodedData = decodeResult.data
    } else {
      // 标准格式，直接使用
      decodedData = arrayBuffer
    }

    updateProgress(80, '🌊 流式: 解码完成，构建模型...')

    // 使用buildModelWithGLTFLoader构建模型
    const modelResult = await buildModelWithGLTFLoader(decodedData)
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

    const response = await streamModelByUuid(uuid)
    if ('error' in response) {
      throw new Error(`API Error: ${response.error}`)
    }

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    updateProgress(30, 'WASM: 下载完成，开始解码...')

    const binaryData = await response.data.arrayBuffer()
    const downloadTime = Date.now() - startTime

    updateProgress(50, 'WASM: 使用 WASM 解码中...')

    const decodeStartTime = Date.now()
    // 传入模型标识符以避免缓存冲突
    const decodeResult = await wasmDecoder.decode(binaryData, false, { modelId: selectedModel.value, uuid: uuid })
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

// 辅助函数：获取文件信息
const getFileInfo = async (filename: string): Promise<{ size: number; supportsRangeRequests: boolean }> => {
  const uuid = getUuidByName(filename)
  if (!uuid) throw new Error('无法获取模型UUID')

  const headers: Record<string, string> = {}
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await streamModelByUuid(uuid)
  if ('error' in response) {
    throw new Error(`API Error: ${response.error}`)
  }

  if (response.status !== 200 && response.status !== 206) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const contentLength = response.headers['content-length']
  const acceptRanges = response.headers['accept-ranges']

  return {
    size: contentLength ? parseInt(contentLength) : 0,
    supportsRangeRequests: acceptRanges === 'bytes'
  }
}

// 辅助函数：下载分块
const downloadChunk = async (filename: string, start: number, end: number): Promise<ArrayBuffer> => {
  const uuid = getUuidByName(filename)
  if (!uuid) throw new Error('无法获取模型UUID')

  const headers: Record<string, string> = {}

  // 只有在分块模式下才添加Range请求头
  const chunkSizeNum = Number(chunkSize.value)
  if (chunkSizeNum > 0) {
    headers['Range'] = `bytes=${start}-${end}`
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const rangeHeader = chunkSizeNum > 0 ? `bytes=${start}-${end}` : undefined
  const response = await streamModelByUuid(uuid, rangeHeader)
  if ('error' in response) {
    throw new Error(`API Error: ${response.error}`)
  }

  if (response.status !== 200 && response.status !== 206) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return await response.data.arrayBuffer()
}

// 辅助函数：计算下载速度
const calculateDownloadSpeed = (currentTime: number): number => {
  const timeDiff = currentTime - streamState.lastProgressTime
  const bytesDiff = streamState.downloadedBytes - streamState.lastDownloadedBytes

  if (timeDiff > 0) {
    const speed = (bytesDiff / timeDiff) * 1000 // bytes per second
    streamState.lastProgressTime = currentTime
    streamState.lastDownloadedBytes = streamState.downloadedBytes
    return speed
  }
  return 0
}

// 辅助函数：计算剩余时间
const calculateRemainingTime = (speed: number): string => {
  if (speed <= 0) return '计算中...'

  const remainingBytes = streamState.totalBytes - streamState.downloadedBytes
  const remainingSeconds = remainingBytes / speed

  if (remainingSeconds < 60) {
    return `${Math.ceil(remainingSeconds)}秒`
  } else if (remainingSeconds < 3600) {
    return `${Math.ceil(remainingSeconds / 60)}分钟`
  } else {
    return `${Math.ceil(remainingSeconds / 3600)}小时`
  }
}

// 辅助函数：格式化字节数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 辅助函数：更新流式信息
const updateStreamInfo = (downloaded: number, total: number, speed: number, remaining: string, currentChunkNum: number, totalChunks: number) => {
  downloadedSize.value = formatBytes(downloaded)
  totalSize.value = formatBytes(total)
  downloadSpeed.value = formatBytes(speed) + '/s'
  remainingTime.value = remaining
  currentChunk.value = `${currentChunkNum}/${totalChunks}`
}

const loadModelStreamWASMRealtime = async (): Promise<{ model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: ExtendedPerformanceStats }> => {
  console.log('⚡ 开始实时流式WASM加载...')

  if (!wasmDecoder) {
    loadingStateMachine.error('WASM 解码器未初始化')
    throw new Error('WASM 解码器未初始化')
  }

  const uuid = getUuidByName(selectedModel.value)
  if (!uuid) {
    loadingStateMachine.error('无法获取模型UUID')
    throw new Error('无法获取模型UUID')
  }

  // 使用状态机开始加载
  loadingStateMachine.startLoading('⚡ 开始实时流式WASM加载...')

  const startTime = Date.now()
  streamState.downloadStartTime = startTime
  streamState.lastProgressTime = startTime
  streamState.lastDownloadedBytes = 0
  streamState.isPaused = false
  streamState.isCancelled = false
  streamState.controller = new AbortController()

  // 创建流式解码器实例
  const StreamDecoderClass = wasmDecoder.getStreamDecoder()
  if (!StreamDecoderClass) {
    const errorMsg = 'StreamDecoder 不可用，可能是因为使用了 JavaScript 备选模式'
    loadingStateMachine.error(errorMsg)
    throw new Error(errorMsg)
  }
  const streamDecoder: StreamDecoder = new StreamDecoderClass()

  try {
    loadingStateMachine.emit('progress', {
      progress: 5,
      message: '⚡ 实时流式WASM: 获取文件信息...'
    })

    // 获取文件大小和支持的范围请求
    const fileInfo = await getFileInfo(selectedModel.value)
    streamState.totalBytes = fileInfo.size

    updateStreamInfo(0, streamState.totalBytes, 0, '计算中...', 0, 0)
    loadingStateMachine.startDownloading('⚡ 实时流式WASM: 开始边下载边解码...')
    loadingStateMachine.emit('progress', {
      progress: 10,
      message: '⚡ 实时流式WASM: 开始边下载边解码...'
    })

    // 检查是否有断点续传数据
    let startByte = 0
    if (enableResume.value && streamState.resumeData && streamState.resumeData.filename === selectedModel.value) {
      startByte = streamState.resumeData.downloadedBytes
      streamState.downloadedBytes = startByte
      console.log(`📥 断点续传: 从字节 ${startByte} 开始下载`)
    }

    // 边下载边解码的流式处理
    let currentByte = startByte
    let chunkIndex: number, totalChunks: number

    // 处理不分块的情况
    const chunkSizeNum = Number(chunkSize.value)
    if (chunkSizeNum === 0) {
      chunkIndex = 0
      totalChunks = 1
    } else {
      chunkIndex = Math.floor(startByte / chunkSizeNum)
      totalChunks = Math.ceil(streamState.totalBytes / chunkSizeNum)
    }

    let decodeResult: StreamResult | null = null
    let isDecodeComplete = false

    while (currentByte < streamState.totalBytes && !streamState.isCancelled && !isDecodeComplete) {
      // 检查是否暂停
      while (streamState.isPaused && !streamState.isCancelled) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (streamState.isCancelled) break

      // 计算结束字节位置
      let endByte: number
      if (chunkSizeNum === 0) {
        // 不分块：下载整个文件
        endByte = streamState.totalBytes - 1
      } else {
        // 分块下载
        endByte = Math.min(currentByte + chunkSizeNum - 1, streamState.totalBytes - 1)
      }

      try {
        // 下载单个分块
        const chunkStartTime = performance.now()
        const chunk = await downloadChunk(selectedModel.value, currentByte, endByte)
        const chunkDownloadTime = performance.now() - chunkStartTime

        // 🔥 关键区别：立即将分块送入流式解码器进行边下载边解码
        const decodeStartTime = performance.now()
        const streamResult = streamDecoder.add_chunk(new Uint8Array(chunk))
        const chunkDecodeTime = performance.now() - decodeStartTime

        console.log(`📦 分块 ${chunkIndex}: 下载耗时 ${chunkDownloadTime.toFixed(1)}ms, 解码耗时 ${chunkDecodeTime.toFixed(1)}ms, 解码进度 ${(streamResult.progress * 100).toFixed(1)}%`)

        currentByte = endByte + 1
        streamState.downloadedBytes = currentByte
        chunkIndex++

        // 更新进度 - 下载进度占50%，解码进度占40%
        const downloadProgress = (streamState.downloadedBytes / streamState.totalBytes) * 50
        const decodeProgress = streamResult.progress * 40
        const totalProgress = 10 + downloadProgress + decodeProgress

        const currentTime = performance.now()
        const speed = calculateDownloadSpeed(currentTime)
        const remainingTimeText = calculateRemainingTime(speed)

        // 添加请求间隔延迟以避免触发限流
        if (currentByte < streamState.totalBytes) {
          await new Promise(resolve => setTimeout(resolve, 50)) // 50ms延迟
        }

        // 更新UI显示
        if (streamResult.is_complete) {
          loadingStateMachine.startBuilding('⚡ 实时流式WASM: 解码完成，构建模型...')
          loadingStateMachine.emit('progress', {
            progress: 90,
            message: '⚡ 实时流式WASM: 解码完成，构建模型...'
          })
          decodeResult = streamResult
          isDecodeComplete = true

          console.log('🎉 流式解码完成!', {
            chunks_processed: streamResult.chunks_processed,
            total_received: streamResult.total_received,
            final_progress: streamResult.progress
          })
        } else {
          loadingStateMachine.emit('progress', {
            progress: totalProgress,
            message: `⚡ 实时流式WASM: 下载并解码中... ${formatBytes(streamState.downloadedBytes)}/${formatBytes(streamState.totalBytes)} (解码进度: ${(streamResult.progress * 100).toFixed(1)}%)`
          })
        }

        updateStreamInfo(
          streamState.downloadedBytes,
          streamState.totalBytes,
          speed,
          remainingTimeText,
          chunkIndex,
          totalChunks
        )

        // 保存断点续传数据
        if (enableResume.value) {
          streamState.resumeData = {
            filename: selectedModel.value,
            downloadedBytes: streamState.downloadedBytes,
            totalBytes: streamState.totalBytes,
            timestamp: Date.now()
          }
        }

        // 检查解码错误
        if (!streamResult.success && streamResult.error) {
          throw new Error(`流式解码失败: ${streamResult.error}`)
        }

      } catch (error) {
        console.error(`下载分块 ${chunkIndex} 失败:`, error)
        // 重试机制
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }
    }

    if (streamState.isCancelled) {
      throw new Error('下载已取消')
    }

    if (!isDecodeComplete || !decodeResult) {
      throw new Error('流式解码未完成')
    }

    // 解析数据
    let parsedData = decodeResult.data
    if (typeof decodeResult.data === 'string') {
      try {
        parsedData = JSON.parse(decodeResult.data)
      } catch (e) {
        console.warn('⚠️ 无法解析为JSON:', e)
      }
    }

    // 构建模型
     const modelResult = await buildModelWithGLTFLoader(parsedData as string | ArrayBuffer | Record<string, unknown> || decodeResult.data as string | ArrayBuffer)
    const totalTime = Date.now() - startTime

    // 清除断点续传数据
    streamState.resumeData = null

    const stats = decodeResult.stats || {
       originalSize: streamState.totalBytes,
       compressedSize: streamState.totalBytes,
       compressionRatio: 1.0,
       wasmDecodeTime: totalTime * 0.4
     }

     const averageSpeed = streamState.totalBytes / (totalTime / 1000) // bytes per second

     const result = {
       model: modelResult.model,
       geometry: modelResult.geometry,
       performanceStats: {
         totalTime: totalTime,
         downloadTime: totalTime * 0.6, // 估算下载时间
         decodeTime: totalTime * 0.4,   // 估算解码时间
         chunksCount: chunkIndex,
         chunkSize: chunkSize.value,
         compressionRatio: (stats.compressionRatio * 100).toFixed(1),
         originalSize: stats.originalSize,
         compressedSize: stats.compressedSize,
         averageSpeed: averageSpeed,
         wasmDecodeTime: (stats.wasmDecodeTime || totalTime * 0.4).toFixed(2),
         streamingEnabled: true
       }
     }

     return result

  } catch (error) {
    console.error('实时流式WASM 模型加载失败:', error)
    loadingStateMachine.error(error.message, '实时流式WASM 模型加载失败')
    throw error
  } finally {
    // 清理流式解码器
    if (streamDecoder) {
      streamDecoder.free()
    }
  }
}

const loadModel = async () => {
  console.log('🚀 开始加载模型...')
  const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement | null

  if (loadBtn) {
    loadBtn.disabled = true
  }

  // 重置状态机
  loadingStateMachine.reset()
  loadingStateMachine.startLoading('开始加载...')

  // 清除WASM解码器缓存以避免模型混淆
  if (wasmDecoder) {
    wasmDecoder.clearCache()
  }

  try {
    let result: { model: THREE.Object3D; geometry: THREE.BufferGeometry; performanceStats?: ExtendedPerformanceStats }

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

      // 处理动画
      setupAnimations(currentModel)

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

      // 标记加载完成
      loadingStateMachine.success(result, '模型加载完成')

      if (result.performanceStats) {
      performanceStats['总耗时'] = result.performanceStats.totalTime + 'ms'
      performanceStats['数据传输'] = result.performanceStats.downloadTime + 'ms'
      performanceStats['数据解码'] = result.performanceStats.decodeTime + 'ms'

      // 流式WASM特有的统计信息
      if (result.performanceStats.chunksCount !== undefined) {
        performanceStats['分块数量'] = result.performanceStats.chunksCount.toString()
      }
      if (result.performanceStats.chunkSize !== undefined) {
        performanceStats['分块大小'] = formatBytes(result.performanceStats.chunkSize)
      }
      if (result.performanceStats.compressionRatio !== undefined) {
        performanceStats['压缩比'] = result.performanceStats.compressionRatio + '%'
      }
      if (result.performanceStats.originalSize !== undefined) {
        performanceStats['原始大小'] = formatBytes(result.performanceStats.originalSize)
      }
      if (result.performanceStats.compressedSize !== undefined) {
        performanceStats['压缩大小'] = formatBytes(result.performanceStats.compressedSize)
      }
      if (result.performanceStats.averageSpeed !== undefined) {
        performanceStats['平均速度'] = formatBytes(result.performanceStats.averageSpeed) + '/s'
      }
      if (result.performanceStats.wasmDecodeTime !== undefined) {
        performanceStats['流式解码'] = result.performanceStats.wasmDecodeTime + 'ms'
      }
      if (result.performanceStats.streamingEnabled) {
        performanceStats['流式模式'] = '✅ 启用'
      }
    }
    }

  } catch (error) {
    console.error('加载失败:', error)
    loadingStateMachine.error(error.message, '加载失败')
    updateInfo('状态', '加载失败')
  } finally {
    if (loadBtn) {
      loadBtn.disabled = false
    }
  }
}

const getModelInfo = async () => {
  const uuid = getUuidByName(selectedModel.value)
  if (!uuid || !dataProvider) {
    console.error('无法获取模型信息')
    return
  }

  try {
    if (dataProvider && dataProvider.getModelInfo) {
      const info = await dataProvider.getModelInfo(uuid)
      updateInfo('文件大小', (info.size / 1024 / 1024).toFixed(2) + ' MB')
      updateInfo('创建时间', new Date(info.created_at).toLocaleString())
      updateInfo('文件类型', info.content_type)
    } else {
      updateInfo('文件大小', '未知')
      updateInfo('创建时间', '未知')
      updateInfo('文件类型', '未知')
    }
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

// 设置动画
const setupAnimations = (model: THREE.Object3D) => {
  // 清理之前的动画
  if (animationMixer) {
    animationMixer.stopAllAction()
    animationMixer = null
  }
  animationActions = []

  // 检查模型是否有动画
  if (model.animations && model.animations.length > 0) {
    console.log('🎬 发现动画数据:', model.animations.length, '个动画')

    // 创建动画混合器
    animationMixer = new THREE.AnimationMixer(model)

    // 为每个动画创建动作
    model.animations.forEach((clip: THREE.AnimationClip, index: number) => {
      console.log(`🎭 动画 ${index + 1}: ${clip.name}, 时长: ${clip.duration.toFixed(2)}s`)
      const action = animationMixer!.clipAction(clip)
      animationActions.push(action)
    })

    // 自动播放第一个动画
    if (animationActions.length > 0) {
      playAnimation(0)
    }

    // 更新UI显示动画信息
    showAnimationSection.value = true
    animationInfo.value = model.animations.map((clip: THREE.AnimationClip, index: number) =>
      `动画${index + 1}: ${clip.name} (${clip.duration.toFixed(2)}s)`
    ).join(', ')
  } else {
    console.log('📝 该模型没有动画数据')
    showAnimationSection.value = false
    animationInfo.value = '无动画'
  }
}

const playAnimation = (index: number = 0) => {
  console.log(`🎬 尝试播放动画，索引: ${index}, 可用动画数量: ${animationActions.length}`)
  if (animationActions.length > index) {
    // 停止所有动画
    animationActions.forEach(action => action.stop())

    // 播放指定动画
    const action = animationActions[index]
    action.reset()
    action.play()
    isAnimationPlaying.value = true

    console.log(`▶️ 播放动画: ${action.getClip().name}`)
  } else {
    console.warn(`⚠️ 无法播放动画：索引 ${index} 超出范围，可用动画数量: ${animationActions.length}`)
  }
}

const stopAnimation = () => {
  if (animationMixer) {
    animationActions.forEach(action => action.stop())
    isAnimationPlaying.value = false
    console.log('⏹️ 停止动画')
  }
}

const pauseStream = () => {
  console.log('⏸️ 暂停流式下载')
  streamState.isPaused = true
  loadingStateMachine.pause('⏸️ 流式下载已暂停')
}

const resumeStream = () => {
  console.log('▶️ 恢复流式下载')
  streamState.isPaused = false
  loadingStateMachine.startDownloading('▶️ 流式下载已恢复')
}

const cancelStream = () => {
  console.log('❌ 取消流式下载')
  streamState.isCancelled = true
  if (streamState.controller) {
    streamState.controller.abort()
  }
  loadingStateMachine.cancel('❌ 流式下载已取消')

  // 清除断点续传数据
  streamState.resumeData = null
  streamState.downloadedBytes = 0
  streamState.totalBytes = 0

  // 重置流式信息显示
  downloadedSize.value = '0 B'
  totalSize.value = '0 B'
  downloadSpeed.value = '0 B/s'
  remainingTime.value = '--'
  currentChunk.value = '0/0'
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
// ES6模块已经在顶部导入，不需要动态加载脚本

// 生命周期
onMounted(async () => {
  try {
    await nextTick()

    // ES6模块已经导入，直接初始化
    await initThreeJS()
    await initWASMDecoder()

    // 初始化模型加载器
    try {
      if (typeof (window as unknown as Record<string, unknown>).WASMModelLoader === 'undefined') {
        throw new Error('WASMModelLoader not loaded')
      }
      // 创建数据提供者
      dataProvider = new HttpDataProvider('/api/v1/resources', authToken) as DataProvider
      console.log('✅ 数据提供者初始化成功')
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
