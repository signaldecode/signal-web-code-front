<script setup>
import mainData from '~/data/main.json'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  slides: {
    type: Array,
    default: () => []
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const arrowLabels = mainData.hero.arrowLabels

const currentIndex = ref(0)
const totalSlides = computed(() => props.slides.length || 1)
const isTransitioning = ref(false)
const animOffset = ref(0)
const skipTransition = ref(false)
const trackRef = ref(null)
const sectionRef = ref(null)
const heroWidth = ref(0)

const updateHeroWidth = () => {
  if (sectionRef.value) heroWidth.value = sectionRef.value.clientWidth
}

// 현재 활성 슬라이드 (오버레이 텍스트용)
const activeSlide = computed(() => props.slides[currentIndex.value] || props.data)

// 순환 인덱스 계산
const getCircularIndex = (i) => {
  const n = totalSlides.value
  return ((i % n) + n) % n
}

// 5개 슬라이드 윈도우: [현재-2, 현재-1, 현재, 현재+1, 현재+2]
// → 항상 양쪽에 잘린 슬라이드가 보이고, 전환 시에도 빈 공간 없이 무한 순환
const CENTER_POS = 2

const visibleSlides = computed(() => {
  if (totalSlides.value <= 1) {
    return [{ slide: props.slides[0] || props.data, index: 0 }]
  }
  return [-2, -1, 0, 1, 2].map(offset => {
    const idx = getCircularIndex(currentIndex.value + offset)
    return { slide: props.slides[idx], index: idx }
  })
})

// 트랙 translateX: 중앙(position 2)에 현재 슬라이드 배치
// animOffset: 0=정지, 1=다음으로 이동 중, -1=이전으로 이동 중
const trackStyle = computed(() => {
  const targetPos = CENTER_POS + animOffset.value
  const vw = heroWidth.value
  return {
    transform: vw
      ? `translateX(calc((${vw}px - var(--hero-slide-width)) / 2 - ${targetPos} * var(--hero-slide-step)))`
      : `translateX(calc((100vw - var(--hero-slide-width)) / 2 - ${targetPos} * var(--hero-slide-step)))`,
    transition: skipTransition.value ? 'none' : undefined
  }
})

let autoPlayTimer = null

// dot용 선행 인덱스 — 슬라이드 시작 시점에 즉시 반영
const dotIndex = ref(0)

const goToSlide = (index) => {
  currentIndex.value = getCircularIndex(index)
  dotIndex.value = currentIndex.value
}

const nextSlide = () => {
  if (isTransitioning.value || totalSlides.value <= 1) return
  isTransitioning.value = true
  animOffset.value = 1
  dotIndex.value = getCircularIndex(currentIndex.value + 1)
  restartAutoPlay()
}

const prevSlide = () => {
  if (isTransitioning.value || totalSlides.value <= 1) return
  isTransitioning.value = true
  animOffset.value = -1
  dotIndex.value = getCircularIndex(currentIndex.value - 1)
  restartAutoPlay()
}

// 애니메이션 완료 → 인덱스 갱신 후 즉시 스냅 (무한 순환 트릭)
// 핵심: getBoundingClientRect()로 강제 reflow → 브라우저가 transition:none 상태를 확실히 paint 한 뒤 transition 복원
const onTransitionEnd = (event) => {
  if (event.propertyName !== 'transform') return
  skipTransition.value = true
  if (animOffset.value === 1) goToSlide(currentIndex.value + 1)
  else if (animOffset.value === -1) goToSlide(currentIndex.value - 1)
  animOffset.value = 0
  nextTick(() => {
    // 강제 reflow: transition:none + 새 transform이 확실히 적용된 후 transition 복원
    trackRef.value?.getBoundingClientRect()
    skipTransition.value = false
    isTransitioning.value = false
  })
}

const startAutoPlay = () => {
  stopAutoPlay()
  if (props.autoPlay && totalSlides.value > 1) {
    autoPlayTimer = setInterval(() => nextSlide(), props.interval)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const restartAutoPlay = () => {
  stopAutoPlay()
  startAutoPlay()
}

// 모바일 터치 스와이프
const { swipeEvents: heroSwipeEvents } = useSwipe({
  onSwipeLeft: nextSlide,
  onSwipeRight: prevSlide
})

onMounted(() => {
  updateHeroWidth()
  window.addEventListener('resize', updateHeroWidth)
  startAutoPlay()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeroWidth)
  stopAutoPlay()
})
</script>

<template>
  <section
    ref="sectionRef"
    class="section-hero"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @touchstart="(e) => { stopAutoPlay(); heroSwipeEvents.touchstart(e) }"
    @touchmove="heroSwipeEvents.touchmove"
    @touchend="heroSwipeEvents.touchend"
  >
    <div class="section-hero__track-wrapper">
      <div
        ref="trackRef"
        class="section-hero__track"
        :style="trackStyle"
        @transitionend="onTransitionEnd"
      >
        <div
          v-for="({ slide }, i) in visibleSlides"
          :key="i"
          class="section-hero__slide"
          @click="totalSlides > 1 && i < CENTER_POS ? prevSlide() : totalSlides > 1 && i > CENTER_POS ? nextSlide() : null"
        >
          <component
            :is="(slide.linkUrl || slide.href) ? 'a' : 'div'"
            :href="(i === CENTER_POS || totalSlides <= 1) ? (slide.linkUrl || slide.href || undefined) : undefined"
            :target="(i === CENTER_POS || totalSlides <= 1) && (slide.linkUrl || slide.href) ? (slide.linkTarget || '_self') : undefined"
            :rel="(i === CENTER_POS || totalSlides <= 1) && slide.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
            class="section-hero__slide-link"
          >
            <NuxtImg
              :src="slide.imageUrl || slide.image"
              :alt="slide.title || slide.imageAlt"
              class="section-hero__image"
              sizes="sm:100vw md:85vw lg:85vw"
              quality="100"
              :loading="(i === CENTER_POS || totalSlides <= 1) ? 'eager' : 'lazy'"
              :fetchpriority="(i === CENTER_POS || totalSlides <= 1) ? 'high' : undefined"
            />
          </component>
        </div>
      </div>
    </div>

    <!-- 콘텐츠 오버레이 (텍스트 비노출) -->

    <!-- Dot 인디케이터 — 이미지 바깥 -->
    <div v-if="totalSlides > 1" class="section-hero__dots" role="tablist">
      <button
        v-for="n in totalSlides"
        :key="n"
        class="section-hero__dot"
        :class="{ 'is-active': dotIndex === n - 1 }"
        :aria-label="`${n} / ${totalSlides}`"
        :aria-selected="dotIndex === n - 1"
        role="tab"
        @click="dotIndex = n - 1; goToSlide(n - 1)"
      />
    </div>

    <!-- 화살표 -->
    <div v-if="totalSlides > 1" class="section-hero__arrows">
      <IconSlideButton
        direction="prev"
        class="slide-button--hero"
        :aria-label="arrowLabels.prev"
        @click="prevSlide"
      />
      <IconSlideButton
        direction="next"
        class="slide-button--hero"
        :aria-label="arrowLabels.next"
        @click="nextSlide"
      />
    </div>
  </section>
</template>
