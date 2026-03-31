<script setup>
const { shopNameEn } = useShopInfo()

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const VISIBLE = 2
const BUFFER = 2
const currentIndex = ref(0)
const containerRef = ref(null)
const trackRef = ref(null)
const itemStep = ref(0)
const animOffset = ref(0)
const skipTransition = ref(false)

const total = computed(() => props.products.length)

const getCircularIndex = (i) => {
  const n = total.value
  return ((i % n) + n) % n
}

// 무한 순환 윈도우: currentIndex 기준으로 BUFFER 양쪽 여유 포함
const displayItems = computed(() => {
  const n = total.value
  if (n === 0) return []
  const count = n + BUFFER * 2
  return Array.from({ length: count }, (_, i) => {
    const idx = getCircularIndex(currentIndex.value + i - BUFFER)
    return { product: props.products[idx], index: idx }
  })
})

const measureItemStep = () => {
  if (!trackRef.value) return
  const items = trackRef.value.children
  if (items.length < 2) return
  itemStep.value = items[1].offsetLeft - items[0].offsetLeft
}

const trackStyle = computed(() => {
  if (!itemStep.value) return undefined
  const base = BUFFER * itemStep.value
  const anim = animOffset.value * itemStep.value
  return {
    transform: `translateX(-${base + anim}px)`,
    transition: skipTransition.value ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
  }
})

const nextSlide = () => {
  if (animOffset.value !== 0 || total.value <= VISIBLE) return
  animOffset.value = 1
}

const prevSlide = () => {
  if (animOffset.value !== 0 || total.value <= VISIBLE) return
  animOffset.value = -1
}

const onTransitionEnd = (event) => {
  if (event.propertyName !== 'transform') return
  skipTransition.value = true
  currentIndex.value = getCircularIndex(currentIndex.value + animOffset.value)
  animOffset.value = 0
  nextTick(() => {
    trackRef.value?.getBoundingClientRect()
    skipTransition.value = false
  })
}

// Touch/Swipe
const { swipeEvents: sliderSwipeEvents } = useSwipe({
  onSwipeLeft: nextSlide,
  onSwipeRight: prevSlide
})

const init = () => {
  skipTransition.value = true
  currentIndex.value = 0
  animOffset.value = 0
  nextTick(() => {
    measureItemStep()
    nextTick(() => {
      trackRef.value?.getBoundingClientRect()
      skipTransition.value = false
    })
  })
}

let resizeTimer = null
const debouncedInit = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(init, 150)
}

onMounted(() => {
  nextTick(init)
  window.addEventListener('resize', debouncedInit, { passive: true })
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedInit)
})

watch(() => props.products, () => {
  nextTick(init)
}, { deep: true })
</script>

<template>
  <section class="section-md-pick">
    <div class="section-md-pick__inner">
      <div class="section-md-pick__header">
        <h2 class="section-md-pick__title">{{ data.title }}</h2>
        <p class="section-md-pick__subtitle">{{ data.subtitle }}</p>
      </div>

      <div class="section-md-pick__content">
        <div class="section-md-pick__image-card">
          <a
            v-if="data.linkUrl"
            :href="data.linkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="section-md-pick__image-link"
          >
            <img
              :src="data.mainImage"
              :alt="data.mainImageAlt"
              class="section-md-pick__main-image"
              loading="lazy"
              width="588"
              height="588"
            />
          </a>
          <img
            v-else
            :src="data.mainImage"
            :alt="data.mainImageAlt"
            class="section-md-pick__main-image"
            loading="lazy"
            width="588"
            height="588"
          />
        </div>

        <div class="section-md-pick__info">
          <p class="section-md-pick__brand">{{ shopNameEn || data.brandName }}</p>
          <h3 class="section-md-pick__recommend-title">{{ data.recommendTitle }}</h3>

          <div
            class="section-md-pick__slider-wrap"
            @touchstart="sliderSwipeEvents.touchstart"
            @touchmove="sliderSwipeEvents.touchmove"
            @touchend="sliderSwipeEvents.touchend"
          >
            <IconSlideButton
              v-if="total > VISIBLE"
              direction="prev"
              class="section-md-pick__arrow section-md-pick__arrow--prev"
              :aria-label="data.arrowLabels?.prev"
              @click="prevSlide"
            />
            <div ref="containerRef" class="section-md-pick__slider-container">
              <div
                ref="trackRef"
                class="section-md-pick__slider"
                :style="trackStyle"
                @transitionend="onTransitionEnd"
              >
                <ProductCardSmall
                  v-for="(item, i) in displayItems"
                  :key="i"
                  :product="item.product"
                  class="section-md-pick__item"
                />
              </div>
            </div>
            <IconSlideButton
              v-if="total > VISIBLE"
              direction="next"
              class="section-md-pick__arrow section-md-pick__arrow--next"
              :aria-label="data.arrowLabels?.next"
              @click="nextSlide"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
