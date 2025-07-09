import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 滚动效果组合式函数
 * 处理滚动动画和固定头部的逻辑
 */
export function useScrollEffects() {
  const isHeaderFixed = ref(false)
  
  // 声明函数引用，以便在onUnmounted中移除事件监听
  let checkScroll
  let handleScroll

  const initScrollEffects = () => {
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
          })
        }
      })
    })

    // 滚动动画效果
    checkScroll = () => {
      const scrollAnimations = document.querySelectorAll('.scroll-animation')
      scrollAnimations.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const windowHeight = window.innerHeight
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('active')
        }
      })
    }

    // 监听滚动固定header
    let lastScrollY = 0
    let headerOriginalTop = 0
    
    // 获取头部原始位置
    const getHeaderOriginalPosition = () => {
      const header = document.querySelector('.header')
      if (header && headerOriginalTop === 0) {
        headerOriginalTop = header.offsetTop
      }
    }
    
    handleScroll = () => {
      const currentScrollY = window.scrollY
      const header = document.querySelector('.header')
      
      if (header) {
        // 确保获取到头部原始位置
        if (headerOriginalTop === 0) {
          getHeaderOriginalPosition()
        }
        
        // 添加一个小的缓冲区域（10px），避免频繁切换
        const threshold = headerOriginalTop + 10
        
        // 向下滚动且超过阈值时固定
        if (currentScrollY >= threshold && currentScrollY > lastScrollY) {
          isHeaderFixed.value = true
        }
        // 向上滚动且回到原始位置附近时取消固定
        else if (currentScrollY <= headerOriginalTop && currentScrollY < lastScrollY) {
          isHeaderFixed.value = false
        }
        
        lastScrollY = currentScrollY
      } else {
        // 降级方案：如果找不到header元素，使用滚动距离判断
        isHeaderFixed.value = currentScrollY > 100
      }
    }

    // 初始检查
    checkScroll()
    
    // 延迟获取头部位置，确保DOM完全渲染
    setTimeout(() => {
      getHeaderOriginalPosition()
      handleScroll()
    }, 100)

    // 添加滚动事件监听
    window.addEventListener('scroll', checkScroll)
    window.addEventListener('scroll', handleScroll)
  }

  const cleanupScrollEffects = () => {
    // 移除滚动监听
    if (checkScroll) {
      window.removeEventListener('scroll', checkScroll)
    }
    if (handleScroll) {
      window.removeEventListener('scroll', handleScroll)
    }
  }

  onMounted(() => {
    initScrollEffects()
  })

  onUnmounted(() => {
    cleanupScrollEffects()
  })

  return {
    isHeaderFixed,
    initScrollEffects,
    cleanupScrollEffects
  }
}