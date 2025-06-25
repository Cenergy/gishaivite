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
    handleScroll = () => {
      const heroSection = document.querySelector('.hero-section')
      if (heroSection) {
        const heroHeight = heroSection.offsetHeight
        isHeaderFixed.value = window.scrollY > heroHeight - 80
      } else {
        // 如果没有hero section，根据滚动距离判断
        isHeaderFixed.value = window.scrollY > 100
      }
    }

    // 初始检查
    checkScroll()
    handleScroll()

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