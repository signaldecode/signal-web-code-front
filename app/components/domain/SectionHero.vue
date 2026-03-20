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
    default: 6000
  }
})

const arrowLabels = mainData.hero.arrowLabels
const ctaLabel = mainData.hero.ctaLabel

const currentIndex = ref(0)
const prevIndex = ref(-1)
const totalSlides = computed(() => props.slides.length || 1)
const isTransitioning = ref(false)
const progressValue = ref(0)
const textVisible = ref(true)

// 현재 활성 슬라이드
const activeSlide = computed(() => props.slides[currentIndex.value] || props.data)

// Ken Burns 방향: 슬라이드마다 번갈아 zoom-in / zoom-out
const kenBurnsDirection = computed(() => currentIndex.value % 2 === 0 ? 'in' : 'out')

// 타이틀 글자 분리 (split-text 애니메이션)
const splitTitle = computed(() => {
  const title = activeSlide.value.title || ''
  return title.split('').map((char, i) => ({
    char: char === ' ' ? '\u00A0' : char,
    delay: i * 40
  }))
})

let autoPlayTimer = null
let progressTimer = null
const PROGRESS_INTERVAL = 30 // 30ms마다 업데이트

const goToSlide = (index) => {
  if (isTransitioning.value || totalSlides.value <= 1) return
  const n = totalSlides.value
  const target = ((index % n) + n) % n
  if (target === currentIndex.value) return

  isTransitioning.value = true
  textVisible.value = false

  // 텍스트 퇴장 후 슬라이드 전환
  setTimeout(() => {
    prevIndex.value = currentIndex.value
    currentIndex.value = target
    progressValue.value = 0

    // crossfade 완료 후 텍스트 등장
    setTimeout(() => {
      textVisible.value = true
      isTransitioning.value = false
    }, 800)
  }, 300)
}

const nextSlide = () => goToSlide(currentIndex.value + 1)
const prevSlide = () => goToSlide(currentIndex.value - 1)

// 프로그레스 바 + 오토플레이
const startAutoPlay = () => {
  stopAutoPlay()
  if (!props.autoPlay || totalSlides.value <= 1) return

  progressValue.value = 0
  progressTimer = setInterval(() => {
    progressValue.value += (PROGRESS_INTERVAL / props.interval) * 100
    if (progressValue.value >= 100) {
      progressValue.value = 100
      nextSlide()
    }
  }, PROGRESS_INTERVAL)
}

const stopAutoPlay = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

const restartAutoPlay = () => {
  progressValue.value = 0
  startAutoPlay()
}

// 모바일 터치 스와이프
const { swipeEvents: heroSwipeEvents } = useSwipe({
  onSwipeLeft: () => { nextSlide(); restartAutoPlay() },
  onSwipeRight: () => { prevSlide(); restartAutoPlay() }
})

const onArrowClick = (dir) => {
  if (dir === 'next') nextSlide()
  else prevSlide()
  restartAutoPlay()
}

onMounted(() => {
  // 초기 텍스트 애니메이션
  textVisible.value = false
  setTimeout(() => {
    textVisible.value = true
    startAutoPlay()
  }, 100)
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <section
    class="section-hero-v2"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @touchstart="(e) => { stopAutoPlay(); heroSwipeEvents.touchstart(e) }"
    @touchmove="heroSwipeEvents.touchmove"
    @touchend="(e) => { heroSwipeEvents.touchend(e); startAutoPlay() }"
  >
    <!-- 배경 이미지 레이어 (crossfade + ken-burns) -->
    <div class="section-hero-v2__bg">
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="section-hero-v2__bg-slide"
        :class="{
          'section-hero-v2__bg-slide--active': i === currentIndex,
          'section-hero-v2__bg-slide--prev': i === prevIndex && isTransitioning,
          'section-hero-v2__bg-slide--ken-in': i === currentIndex && kenBurnsDirection === 'in',
          'section-hero-v2__bg-slide--ken-out': i === currentIndex && kenBurnsDirection === 'out'
        }"
      >
        <NuxtImg
          :src="slide.imageUrl || slide.image"
          :alt="slide.title || slide.imageAlt"
          class="section-hero-v2__bg-image"
          sizes="100vw"
          quality="90"
          :loading="i === 0 ? 'eager' : 'lazy'"
          :fetchpriority="i === 0 ? 'high' : undefined"
        />
      </div>
      <!-- 그라데이션 오버레이 -->
      <div class="section-hero-v2__overlay" />
    </div>

    <!-- 콘텐츠 오버레이 -->
    <div class="section-hero-v2__content">
      <p
        v-if="activeSlide.subtitle"
        class="section-hero-v2__subtitle"
        :class="{ 'section-hero-v2__subtitle--visible': textVisible }"
      >
        {{ activeSlide.subtitle }}
      </p>

      <!-- Split-text 타이틀 -->
      <h2 class="section-hero-v2__title">
        <span
          v-for="(item, i) in splitTitle"
          :key="`${currentIndex}-${i}`"
          class="section-hero-v2__char"
          :class="{ 'section-hero-v2__char--visible': textVisible }"
          :style="{ transitionDelay: `${item.delay}ms` }"
        >{{ item.char }}</span>
      </h2>

      <p
        v-if="activeSlide.description"
        class="section-hero-v2__description"
        :class="{ 'section-hero-v2__description--visible': textVisible }"
      >
        {{ activeSlide.description }}
      </p>

      <!-- 글래스모피즘 CTA 버튼 -->
      <component
        :is="(activeSlide.linkUrl || activeSlide.href) ? 'a' : 'span'"
        :href="activeSlide.linkUrl || activeSlide.href || undefined"
        :target="(activeSlide.linkUrl || activeSlide.href) ? (activeSlide.linkTarget || '_self') : undefined"
        :rel="activeSlide.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
        class="section-hero-v2__cta"
        :class="{ 'section-hero-v2__cta--visible': textVisible }"
      >
        <span class="section-hero-v2__cta-text">{{ ctaLabel }}</span>
        <span class="section-hero-v2__cta-arrow">&rarr;</span>
      </component>
    </div>

    <!-- 하단 컨트롤 바 -->
    <div class="section-hero-v2__controls">
      <!-- 화살표 -->
      <div v-if="totalSlides > 1" class="section-hero-v2__arrows">
        <button
          class="section-hero-v2__arrow-btn"
          :aria-label="arrowLabels.prev"
          @click="onArrowClick('prev')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          class="section-hero-v2__arrow-btn"
          :aria-label="arrowLabels.next"
          @click="onArrowClick('next')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- 프로그레스 인디케이터 -->
      <div v-if="totalSlides > 1" class="section-hero-v2__progress">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="section-hero-v2__progress-item"
          :class="{ 'section-hero-v2__progress-item--active': i === currentIndex }"
          :aria-label="`${i + 1}번 슬라이드`"
          @click="() => { goToSlide(i); restartAutoPlay() }"
        >
          <span class="section-hero-v2__progress-bar">
            <span
              v-if="i === currentIndex"
              class="section-hero-v2__progress-fill"
              :style="{ width: `${progressValue}%` }"
            />
          </span>
        </button>
      </div>

      <!-- 슬라이드 카운터 -->
      <div v-if="totalSlides > 1" class="section-hero-v2__counter">
        <span class="section-hero-v2__counter-current">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
        <span class="section-hero-v2__counter-sep">/</span>
        <span class="section-hero-v2__counter-total">{{ String(totalSlides).padStart(2, '0') }}</span>
      </div>
    </div>
  </section>
</template>
