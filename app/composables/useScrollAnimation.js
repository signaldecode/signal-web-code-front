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
 *   <section v-scroll-animate="'blur-in'">커스텀 애니메이션</section>
 *   <section v-scroll-animate="{ animation: 'fade-up', delay: 200 }">딜레이</section>
 *   <section v-scroll-animate="{ animation: 'fade-up', stagger: true }">자식 순차 등장</section>
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
 * stagger 자식 요소에 --stagger-index CSS 변수 주입
 */
const applyStaggerIndices = (el) => {
  const children = el.children
  for (let i = 0; i < children.length; i++) {
    children[i].style.setProperty('--stagger-index', i)
  }
}

/**
 * v-scroll-animate 디렉티브
 * 요소가 뷰포트에 진입하면 .scroll-animated 클래스 추가
 *
 * 사용법:
 *   <div v-scroll-animate>fade-up 기본</div>
 *   <div v-scroll-animate="'blur-in'">블러 해제</div>
 *   <div v-scroll-animate="{ animation: 'fade-up', delay: 200 }">딜레이 적용</div>
 *   <div v-scroll-animate="{ animation: 'fade-up', stagger: true }">자식 순차 등장</div>
 */
export const vScrollAnimate = {
  getSSRProps(binding) {
    if (binding.value === false) return {}

    const value = binding.value
    let animation = 'fade-up'
    let stagger = false

    if (typeof value === 'string') {
      animation = value
    } else if (typeof value === 'object' && value !== null) {
      animation = value.animation || 'fade-up'
      stagger = value.stagger || false
    }

    const classes = [`scroll-animate`, `scroll-animate--${animation}`]
    if (stagger) classes.push('scroll-animate--stagger')

    return { class: classes.join(' ') }
  },

  mounted(el, binding) {
    // false면 애니메이션 건너뛰기 (배너 등 즉시 표시 필요한 섹션)
    if (binding.value === false) return

    const value = binding.value
    let animation = 'fade-up'
    let delay = 0
    let stagger = false
    let threshold = 0.15

    if (typeof value === 'string') {
      animation = value
    } else if (typeof value === 'object' && value !== null) {
      animation = value.animation || 'fade-up'
      delay = value.delay || 0
      stagger = value.stagger || false
      threshold = value.threshold || 0.15
    }

    el.classList.add('scroll-animate', `scroll-animate--${animation}`)

    if (stagger) {
      el.classList.add('scroll-animate--stagger')
      applyStaggerIndices(el)
    }

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
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    el._scrollObserver = observer

    // ClientOnly 등 늦게 마운트된 요소가 이미 뷰포트 안에 있으면
    // IntersectionObserver 초기 감지를 놓칠 수 있으므로 수동 체크
    el._scrollFallback = setTimeout(() => {
      if (el.classList.contains('scroll-animated')) return
      const rect = el.getBoundingClientRect()
      if (rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('scroll-animated')
        observer.unobserve(el)
      }
    }, 200)
  },

  unmounted(el) {
    el._scrollObserver?.disconnect()
    clearTimeout(el._scrollFallback)
  }
}
