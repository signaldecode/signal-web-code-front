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

const currentIndex = ref(0)
const visibleItems = 2
const containerRef = ref(null)
const sectionRef = ref(null)
const itemWidth = ref(0)
const gap = 24
const parallaxOffset = ref(0)

// 선택된 상품의 이미지로 메인 이미지 변경
const selectedProductIndex = ref(-1)
const displayImage = computed(() => {
  if (selectedProductIndex.value >= 0) {
    return props.products[selectedProductIndex.value]?.image || props.data.mainImage
  }
  return props.data.mainImage
})
const displayImageAlt = computed(() => {
  if (selectedProductIndex.value >= 0) {
    return props.products[selectedProductIndex.value]?.name || props.data.mainImageAlt
  }
  return props.data.mainImageAlt
})

// Touch/Swipe
const { swipeEvents: sliderSwipeEvents } = useSwipe({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
})

const maxIndex = computed(() => {
  return Math.max(0, props.products.length - visibleItems)
})

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < maxIndex.value)

const sliderStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * (itemWidth.value + gap)}px)`
}))

const nextSlide = () => {
  if (canGoNext.value) currentIndex.value++
}

const prevSlide = () => {
  if (canGoPrev.value) currentIndex.value--
}

const selectProduct = (idx) => {
  selectedProductIndex.value = selectedProductIndex.value === idx ? -1 : idx
}

const calculateItemWidth = () => {
  nextTick(() => {
    if (containerRef.value) {
      const containerWidth = containerRef.value.offsetWidth
      itemWidth.value = (containerWidth - gap) / visibleItems
    }
  })
}

// 패럴랙스 스크롤
const onScroll = () => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const viewH = window.innerHeight
  // 섹션이 뷰포트 안에 있을 때만
  if (rect.bottom > 0 && rect.top < viewH) {
    const progress = (viewH - rect.top) / (viewH + rect.height)
    parallaxOffset.value = (progress - 0.5) * 40 // -20px ~ +20px
  }
}

let resizeTimer = null
const debouncedCalculate = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(calculateItemWidth, 150)
}

onMounted(() => {
  calculateItemWidth()
  window.addEventListener('resize', debouncedCalculate, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedCalculate)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <section ref="sectionRef" class="section-md-pick">
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
              :src="displayImage"
              :alt="displayImageAlt"
              class="section-md-pick__main-image"
              loading="lazy"
              width="588"
              height="588"
              :style="{ transform: `translateY(${parallaxOffset}px)` }"
            />
          </a>
          <img
            v-else
            :src="displayImage"
            :alt="displayImageAlt"
            class="section-md-pick__main-image"
            loading="lazy"
            width="588"
            height="588"
            :style="{ transform: `translateY(${parallaxOffset}px)` }"
          />
        </div>

        <div class="section-md-pick__info">
          <p class="section-md-pick__brand">{{ shopNameEn || data.brandName }}</p>
          <h3 class="section-md-pick__recommend-title">{{ data.recommendTitle }}</h3>

          <div
            class="section-md-pick__slider-wrap"
            v-on="sliderSwipeEvents"
          >
            <IconSlideButton
              direction="prev"
              class="section-md-pick__arrow section-md-pick__arrow--prev"
              :disabled="!canGoPrev"
              :aria-label="data.arrowLabels?.prev"
              @click="prevSlide"
            />
            <div ref="containerRef" class="section-md-pick__slider-container">
              <div class="section-md-pick__slider" :style="sliderStyle">
                <div
                  v-for="(product, idx) in products"
                  :key="product.id"
                  class="section-md-pick__item"
                  :class="{ 'section-md-pick__item--selected': selectedProductIndex === idx }"
                  :style="{ width: itemWidth > 0 ? `${itemWidth}px` : undefined }"
                  @click="selectProduct(idx)"
                >
                  <ProductCardSmall :product="product" />
                </div>
              </div>
            </div>
            <IconSlideButton
              direction="next"
              class="section-md-pick__arrow section-md-pick__arrow--next"
              :disabled="!canGoNext"
              :aria-label="data.arrowLabels?.next"
              @click="nextSlide"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
