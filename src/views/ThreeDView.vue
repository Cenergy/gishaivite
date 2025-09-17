<template>
  <div
    class="relative h-screen bg-#f5f7fa font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]"
  >
    <!-- 抽屉开关按钮 -->
    <el-button
      type="primary"
      @click="drawerVisible = true"
      class="fixed top-20px left-20px z-1000 shadow-lg md:top-10px-768 md:left-10px-768"
      circle
      size="large"
    >
      <el-icon>&gt;</el-icon>
    </el-button>

    <!-- 抽屉组件 -->
    <el-drawer
      v-model="drawerVisible"
      title="🚀 WASM模型查看器"
      :size="320"
      direction="ltr"
      class="md:!w-90vw-768"
      :modal="false"
    >
      <div class="overflow-y-auto">
        <el-card class="mb-20px" shadow="never">
          <h2 class="m-0 text-18px font-bold text-center text-#303133">
            🚀 WASM模型查看器
          </h2>
        </el-card>

        <!-- 模型选择 -->
        <el-card class="mb-20px" shadow="hover">
          <template #header>
            <div class="text-14px font-600 text-#606266">📁 模型选择</div>
          </template>
          <el-form-item label="选择模型:">
            <el-select
              v-model="selectedModel"
              placeholder="请选择模型"
              style="width: 100%"
            >
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
          </el-space>

          <!-- 流式加载控制面板 -->
          <el-card
            v-show="showStreamControls"
            class="mt-15px border-2 border-solid border-#409eff bg-gradient-to-br from-#ecf5ff to-#d9ecff"
            shadow="never"
          >
            <template #header>
              <div class="section-title">🌊 流式加载控制</div>
            </template>
            <el-space direction="vertical" style="width: 100%" :size="15">
              <!-- 智能流式WASM配置 -->
              <div v-if="loadMethod === 'smart_stream_wasm'" class="smart-config">
                <el-form-item label="自动分块阈值:">
                  <el-select v-model="smartChunkThreshold" style="width: 180px">
                    <el-option
                      v-for="option in smartThresholdOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="分块大小:">
                  <el-select v-model="smartChunkSize" style="width: 180px">
                    <el-option
                      v-for="option in chunkSizeOptions.filter(opt => opt.value > 0)"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-alert
                  title="智能分块说明"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    文件大于 {{ smartThresholdOptions.find(opt => opt.value === smartChunkThreshold)?.label || '5MB' }} 时自动启用分块下载，每块 {{ chunkSizeOptions.find(opt => opt.value === smartChunkSize)?.label || '5MB' }}
                  </template>
                </el-alert>
              </div>
              <!-- 普通流式配置 -->
              <el-form-item v-else label="分块大小:">
                <el-select v-model="chunkSize" style="width: 180px">
                  <el-option
                    v-for="option in chunkSizeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-checkbox v-model="enableResume"> 启用断点续传 </el-checkbox>
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
          <el-space style="width: 100%">
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
            <el-progress :percentage="progress" :status="isLoading ? '' : 'success'" />
            <div class="text-12px text-#909399 text-center">{{ progressText }}</div>
          </el-space>

          <!-- 流式加载详细进度 -->
          <el-card
            v-show="showStreamProgress"
            class="mt-10px bg-gradient-to-br from-#f5f7fa to-#e4e7ed"
            shadow="never"
          >
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="已下载">{{
                downloadedSize
              }}</el-descriptions-item>
              <el-descriptions-item label="总大小">{{ totalSize }}</el-descriptions-item>
              <el-descriptions-item label="下载速度">{{
                downloadSpeed
              }}</el-descriptions-item>
              <el-descriptions-item label="剩余时间">{{
                remainingTime
              }}</el-descriptions-item>
              <el-descriptions-item label="当前分块">{{
                currentChunk
              }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-card>

        <!-- 信息面板 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="section-title">📊 模型信息</div>
          </template>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item
              v-for="(value, key) in modelInfo"
              :key="key"
              :label="key"
            >
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
              <el-descriptions-item label="动画信息">{{
                animationInfo
              }}</el-descriptions-item>
            </el-descriptions>
            <el-space wrap style="width: 100%">
              <el-button type="primary" size="small" @click="playAnimation(0)">
                ▶️ 播放
              </el-button>
              <el-button size="small" @click="stopAnimation"> ⏹️ 停止 </el-button>
            </el-space>
          </el-space>
        </el-card>

        <!-- 性能统计面板 -->
        <el-card class="section-card" shadow="hover">
          <template #header>
            <div class="section-title">⚡ 性能统计</div>
          </template>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item
              v-for="(value, key) in performanceStats"
              :key="key"
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>

    <div
      v-loading="isLoading"
      :element-loading-text="loadingText"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      class="w-full h-full absolute top-0 left-0 bg-#f5f7fa"
    >
      <div
        ref="viewerContainer"
        id="viewer"
        class="w-full h-full bg-gradient-to-br from-#1a202c to-#2d3748"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from "vue";
// 导入THREE
import { THREE, OrbitControls } from "@/utils/three.js";
// 导入模型加载器和下载器
import {modelLoader, modelDownloader, ModelAnimations} from "../handles/model";

// 使用模型加载器的状态机
const loadingStateMachine = modelLoader.loadingStateMachine;

// 响应式数据
const drawerVisible = ref(false);
const selectedModel = ref("");
const modelOptions = ref([]);
const loadMethod = ref("realtime_wasm");
const chunkSize = ref(0);
const enableResume = ref(true);

// 智能流式WASM配置
const smartChunkThreshold = ref(5242880); // 5MB阈值
const smartChunkSize = ref(5242880); // 默认5MB分块大小

// 分块大小选项
const chunkSizeOptions = [
  { label: "不分块", value: 0 },
  { label: "64KB", value: 65536 },
  { label: "128KB", value: 131072 },
  { label: "256KB", value: 262144 },
  { label: "512KB", value: 524288 },
  { label: "1MB", value: 1048576 },
  { label: "2MB", value: 2097152 },
  { label: "3MB", value: 3145728 },
  { label: "5MB", value: 5242880 },
];

// 智能分块阈值选项
const smartThresholdOptions = [
  { label: "1MB", value: 1048576 },
  { label: "2MB", value: 2097152 },
  { label: "3MB", value: 3145728 },
  { label: "5MB", value: 5242880 },
  { label: "10MB", value: 10485760 },
  { label: "20MB", value: 20971520 },
];
const wireframeMode = ref(false);
const showInfo = ref(false);
const showAnimationSection = ref(false);
const animationInfo = ref("无动画");

// 从状态机获取的响应式数据
const progress = ref(0);
const progressText = ref("等待加载...");
const isLoading = ref(false);
const loadingError = ref(null);
const currentState = ref("idle"); // 响应式的状态机状态

// 动态加载文本 - 根据状态显示不同文本
const loadingText = computed(() => {
  if (currentState.value === "paused") {
    return "暂停中";
  }
  return progressText.value || "正在加载模型...";
});

// 控制按钮状态
const canPause = ref(false);
const canResume = ref(false);
const canCancel = ref(false);

// 设置状态机事件监听器
loadingStateMachine.on("stateChange", ({ from, to, context }) => {
  currentState.value = to; // 更新响应式状态
  // 暂停状态也应该显示loading遮罩
  isLoading.value = loadingStateMachine.isLoading() || to === "paused";
  progress.value = context.progress;
  progressText.value = context.message;
  loadingError.value = context.error;

  // 更新控制按钮状态
  canPause.value = loadingStateMachine.canPause();
  canResume.value = loadingStateMachine.canResume();
  canCancel.value = loadingStateMachine.canCancel();
});

loadingStateMachine.on("progress", (context) => {
  progress.value = context.progress;
  progressText.value = context.message;
});

// 计算属性
const showStreamControls = computed(() => {
  const includeList = ["stream_wasm", "realtime_wasm", "smart_stream_wasm"];
  return includeList.includes(loadMethod.value);
});

const showStreamProgress = computed(() => {
  return showStreamControls.value && isLoading.value;
});

// 流式进度数据
const downloadedSize = ref("0 MB");
const totalSize = ref("未知");
const downloadSpeed = ref("0 KB/s");
const remainingTime = ref("计算中...");
const currentChunk = ref("0/0");

// 模型信息
const modelInfo = reactive({
  状态: "等待加载",
});

// 性能统计
const performanceStats = reactive({
  总耗时: "-",
  网络请求: "-",
  数据传输: "-",
  数据解码: "-",
  几何转换: "-",
  分块数量: "-",
  分块大小: "-",
  压缩比: "-",
  原始大小: "-",
  压缩大小: "-",
  平均速度: "-",
  流式解码: "-",
});

// 加载方式选项
const loadMethods = [
  { value: "origin", label: "直接加载" },
  { value: "stream", label: "Stream" },
  { value: "wasm", label: "WASM解码" },
  { value: "stream_wasm", label: "🌊 流式WASM" },
  { value: "realtime_wasm", label: "⚡ 实时流式WASM" },
  { value: "smart_stream_wasm", label: "🧠 智能流式WASM" },
];

// Three.js 相关变量
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let currentModel: THREE.Object3D | null = null;
let modelAnimations: ModelAnimations | null = null;
const isAnimationPlaying = ref(false);

// 认证令牌
const authToken = ref("");

// 流式加载状态现在由modelLoader管理

// 加载模型数据
modelDownloader.getModel3Ds({ is_active: true })
  .then((res) => {
    console.log("API返回的模型数据:", res);
    if (res && res.length > 0) {
      // 确保数据格式正确，将API返回的数据转换为前端期望的格式
      modelOptions.value = res.map((model) => ({
        name: model.name,
        uuid: model.uuid || model.id, // 使用uuid字段，如果没有则使用id字段
        id: model.id,
        ...model,
      }));
      selectedModel.value = modelOptions.value[0].name;
      console.log("转换后的模型选项:", modelOptions.value);
    }
  })
  .catch((err) => {
    console.log("API调用失败，使用fallback数据:", err);
    modelOptions.value = [];
    selectedModel.value ="";
  });

// DOM 引用
const viewerContainer = ref<HTMLElement>();

// 方法
const setLoadMethod = (method: string) => {
  loadMethod.value = method;
};

const updateInfo = (key: string, value: string) => {
  modelInfo[key] = value;
};

const setupLighting = () => {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  // 主光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 补光
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-10, 0, -5);
  scene.add(fillLight);
};

const animate = () => {
  requestAnimationFrame(animate);

  // 更新动画
  if (modelAnimations) {
    modelAnimations.update();
  }

  controls.update();
  renderer.render(scene, camera);
};

const initThreeJS = async () => {
  if (!viewerContainer.value) return;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a202c);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  viewerContainer.value.appendChild(renderer.domElement);

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加光源
  setupLighting();

  // 开始渲染循环
  animate();
};

const loadModel = async () => {
  console.log("🚀 开始加载模型...");
  const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement | null;

  if (loadBtn) {
    loadBtn.disabled = true;
  }

  try {
    // 重置状态机到idle状态，避免状态转换错误
    loadingStateMachine.reset();
    const model = modelOptions.value?.find(option => option.name === selectedModel.value) || { name: "未选择模型" };
    // 使用 modelLoader 加载模型
    const result = await modelLoader.loadModel(model, loadMethod.value, {
      chunkSize: chunkSize.value,
      enableResume: enableResume.value,
      authToken: authToken.value,
      // 智能流式WASM配置
      smartChunkThreshold: smartChunkThreshold.value,
      smartChunkSize: smartChunkSize.value,
    });

    // 移除旧模型
    if (currentModel) {
      scene.remove(currentModel);
    }

    // 添加新模型
    if (result.model) {
      currentModel = result.model;
      currentModel.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      scene.add(currentModel);

      // 处理动画
      setupAnimations(currentModel);

      // 自动调整相机位置
      const box = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5;

      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();

      updateInfo("状态", "加载完成");
      updateInfo(
        "顶点数",
        result.geometry &&
          result.geometry.attributes &&
          result.geometry.attributes.position
          ? result.geometry.attributes.position.count.toString()
          : "未知"
      );

      // 更新性能统计信息
      if (result.performanceStats) {
        performanceStats["总耗时"] = result.performanceStats.totalTime + "ms";
        performanceStats["数据传输"] = result.performanceStats.downloadTime + "ms";
        performanceStats["数据解码"] = result.performanceStats.decodeTime + "ms";

        // 流式WASM特有的统计信息
        if (result.performanceStats.chunksCount !== undefined) {
          performanceStats["分块数量"] = result.performanceStats.chunksCount.toString();
        }
        if (result.performanceStats.chunkSize !== undefined) {
          performanceStats["分块大小"] = modelLoader.downloader.formatBytes(
            result.performanceStats.chunkSize
          );
        }
        if (result.performanceStats.compressionRatio !== undefined) {
          performanceStats["压缩比"] = result.performanceStats.compressionRatio + "%";
        }
        if (result.performanceStats.originalSize !== undefined) {
          performanceStats["原始大小"] = modelLoader.downloader.formatBytes(
            result.performanceStats.originalSize
          );
        }
        if (result.performanceStats.compressedSize !== undefined) {
          performanceStats["压缩大小"] = modelLoader.downloader.formatBytes(
            result.performanceStats.compressedSize
          );
        }
        if (result.performanceStats.averageSpeed !== undefined) {
          performanceStats["平均速度"] =
            modelLoader.downloader.formatBytes(result.performanceStats.averageSpeed) + "/s";
        }
        if (result.performanceStats.wasmDecodeTime !== undefined) {
          performanceStats["流式解码"] = result.performanceStats.wasmDecodeTime + "ms";
        }
        if (result.performanceStats.streamingEnabled) {
          performanceStats["流式模式"] = "✅ 启用";
        }
      }
    }
  } catch (error) {
    console.error("加载失败:", error);
    updateInfo("状态", "加载失败");
  } finally {
    if (loadBtn) {
      loadBtn.disabled = false;
    }
  }
};

const resetCamera = () => {
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
};

const toggleWireframe = () => {
  wireframeMode.value = !wireframeMode.value;
  if (currentModel) {
    currentModel.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const material = mesh.material as THREE.Material & { wireframe: boolean };
        material.wireframe = wireframeMode.value;
      }
    });
  }
};

const toggleInfo = () => {
  showInfo.value = !showInfo.value;
};

// 设置动画
const setupAnimations = (model: THREE.Object3D) => {
  // 清理之前的动画
  if (modelAnimations) {
    modelAnimations.destroy();
    modelAnimations = null;
  }

  // 创建新的动画管理器
  modelAnimations = new ModelAnimations(model, {
    autoPlay: true,
    loop: true
  });

  // 获取动画信息并更新UI
  const animInfo = modelAnimations.getAnimationInfo();
  
  if (animInfo.hasAnimations) {
    showAnimationSection.value = true;
    animationInfo.value = animInfo.info;
    
    // 更新播放状态
    const playbackState = modelAnimations.getPlaybackState();
    isAnimationPlaying.value = playbackState.isPlaying;
  } else {
    showAnimationSection.value = false;
    animationInfo.value = "无动画";
    isAnimationPlaying.value = false;
  }
};

const playAnimation = (index: number = 0) => {
  if (modelAnimations) {
    const success = modelAnimations.play(index);
    if (success) {
      isAnimationPlaying.value = true;
    }
  }
};

const stopAnimation = () => {
  if (modelAnimations) {
    modelAnimations.stop();
    isAnimationPlaying.value = false;
  }
};

const pauseStream = () => {
  console.log("⏸️ 暂停流式下载");
  modelLoader.pauseStream();
};

const resumeStream = () => {
  console.log("▶️ 恢复流式下载");
  modelLoader.resumeStream();
};

const cancelStream = () => {
  console.log("❌ 取消流式下载");
  modelLoader.cancelStream();

  // 重置流式信息显示
  downloadedSize.value = "0 B";
  totalSize.value = "0 B";
  downloadSpeed.value = "0 B/s";
  remainingTime.value = "--";
  currentChunk.value = "0/0";
};

// 窗口大小调整
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

// 动态加载外部脚本
// ES6模块已经在顶部导入，不需要动态加载脚本

// 生命周期
onMounted(async () => {
  try {
    await nextTick();

    // 初始化Three.js
    await initThreeJS();

    // 初始化模型加载器
    await modelLoader.initialize(authToken.value);

    window.addEventListener("resize", handleResize);
  } catch (error) {
    console.error("组件初始化失败:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);

  // 清理动画资源
  if (modelAnimations) {
    modelAnimations.destroy();
  }

  // 清理Three.js资源
  if (renderer) {
    renderer.dispose();
  }
  if (currentModel) {
    scene.remove(currentModel);
  }

  // 清理模型加载器资源
  modelLoader.cleanup();
});
</script>
