<script setup>
// Fallback 이미지 (API 실패 시 사용)
import insta1 from '~/assets/images/instagram1.jpg'
import insta2 from '~/assets/images/instagram2.jpg'
import insta3 from '~/assets/images/instagram3.jpg'
import insta4 from '~/assets/images/instagram4.jpg'

const fallbackImages = [
  { image: insta1, href: '#', imageAlt: 'Instagram 1' },
  { image: insta2, href: '#', imageAlt: 'Instagram 2' },
  { image: insta3, href: '#', imageAlt: 'Instagram 3' },
  { image: insta4, href: '#', imageAlt: 'Instagram 4' }
]

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  }
})

// Instagram API 연동
const { posts: instagramPosts, fetchInstagramFeed } = useInstagram()

// API 데이터 또는 props 또는 fallback 사용
const displayImages = computed(() => {
  if (instagramPosts.value.length > 0) {
    return instagramPosts.value.map(post => ({
      image: post.image,
      href: post.href,
      imageAlt: post.caption || 'Instagram post'
    }))
  }
  if (props.images.length > 0) {
    return props.images
  }
  return fallbackImages
})

onMounted(() => {
  // Instagram API 호출 (토큰 설정되어 있으면 실행)
  fetchInstagramFeed(12)
})

const currentIndex = ref(0)
const itemWidth = ref(374)
const visibleItems = ref(4)
const gap = ref(24)
const sliderWrapRef = ref(null)

// Touch/Swipe
const { swipeEvents: sliderSwipeEvents } = useSwipe({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
})

const maxIndex = computed(() => {
  return Math.max(0, displayImages.value.length - visibleItems.value)
})

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < maxIndex.value)

const sliderStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * (itemWidth.value + gap.value)}px)`
}))

const nextSlide = () => {
  if (canGoNext.value) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (canGoPrev.value) {
    currentIndex.value--
  }
}

const updateLayout = () => {
  const w = window.innerWidth
  if (w >= 768) {
    // 태블릿 이상: 4개 표시, 컨테이너 폭 기반 계산
    visibleItems.value = 4
    gap.value = w >= 1024 ? 24 : 16
    if (sliderWrapRef.value) {
      const containerWidth = sliderWrapRef.value.offsetWidth
      itemWidth.value = (containerWidth - gap.value * (visibleItems.value - 1)) / visibleItems.value
    } else {
      itemWidth.value = 374
    }
  } else {
    // 모바일: 2개 표시
    visibleItems.value = 2
    gap.value = 12
    if (sliderWrapRef.value) {
      const containerWidth = sliderWrapRef.value.offsetWidth
      itemWidth.value = (containerWidth - gap.value * (visibleItems.value - 1)) / visibleItems.value
    } else {
      itemWidth.value = 200
    }
  }
}

let resizeTimer = null
const debouncedLayout = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(updateLayout, 150)
}

onMounted(() => {
  updateLayout()
  window.addEventListener('resize', debouncedLayout, { passive: true })
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedLayout)
})
</script>

<template>
  <section class="section-instagram">
    <div class="section-instagram__inner">
      <div class="section-instagram__header">
        <div class="section-instagram__titles">
          <h2 class="section-instagram__title">{{ data.title }}</h2>
          <p class="section-instagram__subtitle">{{ data.subtitle }}</p>
        </div>
        <div class="section-instagram__controls">
          <IconSlideButton
            direction="prev"
            :disabled="!canGoPrev"
            :aria-label="data.arrowLabels?.prev"
            @click="prevSlide"
          />
          <IconSlideButton
            direction="next"
            :disabled="!canGoNext"
            :aria-label="data.arrowLabels?.next"
            @click="nextSlide"
          />
        </div>
      </div>
      <div
        ref="sliderWrapRef"
        class="section-instagram__slider-wrap"
        v-on="sliderSwipeEvents"
      >
        <div
          class="section-instagram__slider"
          :style="sliderStyle"
        >
          <a
            v-for="(item, index) in displayImages"
            :key="index"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="section-instagram__item"
            :style="{ width: `${itemWidth}px`, height: `${itemWidth * 4 / 3}px` }"
          >
            <img
              :src="item.image"
              :alt="item.imageAlt"
              class="section-instagram__image"
              loading="lazy"
              width="374"
              height="499"
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
