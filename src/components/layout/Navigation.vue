<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <h1>GIS 地理信息系统</h1>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <i class="i-tabler:home"></i>
          首页
        </router-link>
        
        <router-link to="/map" class="nav-link">
          <i class="i-tabler:map"></i>
          地图视图
        </router-link>
        
        <router-link to="/geo-worker-demo" class="nav-link">
          <i class="i-tabler:cpu"></i>
          Web Worker 演示
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped>
.navigation {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-brand h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: var(--color-text);
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--color-background-soft);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: white;
}

.nav-link.router-link-active:hover {
  background-color: var(--color-primary-dark);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-brand h1 {
    font-size: 18px;
  }
  
  .nav-links {
    gap: 10px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .nav-link span {
    display: none;
  }
}
</style>