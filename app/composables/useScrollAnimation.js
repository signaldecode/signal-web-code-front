/**
 * 스크롤 트리거 애니메이션 composable
 * Intersection Observer 기반으로 요소가 뷰포트에 진입할 때 애니메이션 적용
 *
 * 사용법:
 *   const { animRef } = useScrollAnimation()
 *   <div ref="animRef" v-scroll-animate>...</div>
 *
 * 또는 디렉티브로:
 *   <section v-scroll-animate>...</section>
 *   <section v-scroll-animate="'slide-up'">...</section>
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    once = true
  } = options

  const animRef = ref(null)
  const isVisible = ref(false)

  let observer = null

  const observe = (el) => {
    if (!el || !import.meta.client) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            entry.target.classList.add('scroll-animated')

            if (once) {
              observer?.unobserve(entry.target)
            }
          } else if (!once) {
            isVisible.value = false
            entry.target.classList.remove('scroll-animated')
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
  }

  onMounted(() => {
    if (animRef.value) {
      observe(animRef.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return {
    animRef,
    isVisible,
    observe
  }
}

/**
 * v-scroll-animate 디렉티브
 * 요소가 뷰포트에 진입하면 .scroll-animated 클래스 추가
 *
 * 사용법:
 *   <div v-scroll-animate>fade-up 기본</div>
 *   <div v-scroll-animate="'slide-left'">좌측에서 슬라이드</div>
 *   <div v-scroll-animate="{ animation: 'fade-up', delay: 200 }">딜레이 적용</div>
 */
export const vScrollAnimate = {
  getSSRProps(binding) {
    const value = binding.value
    let animation = 'fade-up'

    if (typeof value === 'string') {
      animation = value
    } else if (typeof value === 'object' && value !== null) {
      animation = value.animation || 'fade-up'
    }

    return {
      class: `scroll-animate scroll-animate--${animation}`
    }
  },

  mounted(el, binding) {
    const value = binding.value
    let animation = 'fade-up'
    let delay = 0

    if (typeof value === 'string') {
      animation = value
    } else if (typeof value === 'object' && value !== null) {
      animation = value.animation || 'fade-up'
      delay = value.delay || 0
    }

    el.classList.add('scroll-animate', `scroll-animate--${animation}`)

    if (delay) {
      el.style.transitionDelay = `${delay}ms`
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-animated')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    el._scrollObserver = observer
  },

  unmounted(el) {
    el._scrollObserver?.disconnect()
  }
}
