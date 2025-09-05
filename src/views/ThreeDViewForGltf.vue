<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="js">
import { ref, onMounted, onUnmounted } from 'vue';
import { THREE, GLTFLoader, OrbitControls } from "@/utils/three.js";

const container = ref(null);
let scene, camera, renderer, controls, model;

const init = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 3);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.value.appendChild(renderer.domElement);

  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加光照
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 添加地面
  const groundGeometry = new THREE.PlaneGeometry(10, 10);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 加载GLTF模型
  loadModel();
};

const loadModel = () => {
  const loader = new GLTFLoader();
  
  loader.load(
    '/models/RiggedFigure.gltf',
    (gltf) => {
      model = gltf.scene;
      
      // 设置模型阴影
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // 调整模型位置和大小
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      
      scene.add(model);
      console.log('模型加载成功:', gltf);
    },
    (progress) => {
      console.log('加载进度:', (progress.loaded / progress.total * 100) + '%');
    },
    (error) => {
      console.error('模型加载失败:', error);
    }
  );
};

const animate = () => {
  requestAnimationFrame(animate);
  
  // 更新控制器
  controls.update();
  
  // 渲染场景
  renderer.render(scene, camera);
};

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  init();
  animate();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>