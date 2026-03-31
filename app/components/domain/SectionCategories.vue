<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const containerRef = ref(null)
const trackRef = ref(null)
const currentIndex = ref(0)
const animOffset = ref(0)
const skipTransition = ref(false)
const itemStep = ref(0)
const needsLoop = ref(false)
const BUFFER = 2

const getCircularIndex = (i) => {
  const n = props.categories.length
  return ((i % n) + n) % n
}

// 비순환: 원본 / 순환: currentIndex 기준 윈도우
const displayItems = computed(() => {
  const n = props.categories.length
  if (n === 0) return []
  if (!needsLoop.value) {
    return props.categories.map((cat, i) => ({ category: cat, index: i }))
  }
  const count = n + BUFFER * 2
  return Array.from({ length: count }, (_, i) => {
    const idx = getCircularIndex(currentIndex.value + i - BUFFER)
    return { category: props.categories[idx], index: idx }
  })
})

const measureItemStep = () => {
  if (!trackRef.value) return
  const items = trackRef.value.children
  if (items.length < 2) return
  itemStep.value = items[1].offsetLeft - items[0].offsetLeft
}

const trackStyle = computed(() => {
  if (!needsLoop.value) return undefined
  const base = BUFFER * itemStep.value
  const anim = animOffset.value * itemStep.value
  return {
    transform: `translateX(-${base + anim}px)`,
    transition: skipTransition.value ? 'none' : 'transform 0.3s ease'
  }
})

const scroll = (direction) => {
  if (animOffset.value !== 0) return
  animOffset.value = direction === 'next' ? 1 : -1
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

// 모바일 터치 스와이프
const { swipeEvents } = useSwipe({
  onSwipeLeft: () => scroll('next'),
  onSwipeRight: () => scroll('prev')
})

const init = () => {
  skipTransition.value = true
  currentIndex.value = 0
  animOffset.value = 0
  needsLoop.value = false

  nextTick(() => {
    measureItemStep()
    if (!containerRef.value || !trackRef.value) return
    needsLoop.value = trackRef.value.scrollWidth > containerRef.value.clientWidth + 1

    nextTick(() => {
      if (needsLoop.value) measureItemStep()
      nextTick(() => {
        trackRef.value?.getBoundingClientRect()
        skipTransition.value = false
      })
    })
  })
}

onMounted(() => {
  nextTick(init)
  window.addEventListener('resize', init)
})

onUnmounted(() => {
  window.removeEventListener('resize', init)
})

watch(() => props.categories, () => {
  nextTick(init)
}, { deep: true })
</script>

<template>
  <section class="section-categories">
    <div class="section-categories__inner">
      <div class="section-categories__header">
        <h2 class="section-categories__title">{{ data.title }}</h2>
      </div>
      <div class="section-categories__slider-wrap">
        <IconSlideButton
          v-if="needsLoop"
          direction="prev"
          class="section-categories__arrow"
          @click="scroll('prev')"
        />

        <div
          ref="containerRef"
          class="section-categories__container"
          @touchstart="swipeEvents.touchstart"
          @touchmove="swipeEvents.touchmove"
          @touchend="swipeEvents.touchend"
        >
          <div
            ref="trackRef"
            class="section-categories__track"
            :style="trackStyle"
            @transitionend="onTransitionEnd"
          >
            <CategoryCard
              v-for="(item, i) in displayItems"
              :key="i"
              :category="item.category"
              class="section-categories__slide-item"
            />
          </div>
        </div>

        <IconSlideButton
          v-if="needsLoop"
          direction="next"
          class="section-categories__arrow"
          @click="scroll('next')"
        />
      </div>
    </div>
  </section>
</template>
