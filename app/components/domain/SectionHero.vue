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
const slideDirection = ref('next')
const isTransitioning = ref(false)

// 현재 활성 슬라이드
const activeSlide = computed(() => props.slides[currentIndex.value] || props.data)

// 이전/다음 슬라이드 인덱스 (순환)
const prevIndex = computed(() =>
  (currentIndex.value - 1 + totalSlides.value) % totalSlides.value
)
const nextIndex = computed(() =>
  (currentIndex.value + 1) % totalSlides.value
)

// 슬라이드 가져오기 (인덱스 순환)
const getSlide = (index) => props.slides[index] || {}

let autoPlayTimer = null

const goToSlide = (index) => {
  currentIndex.value = ((index % totalSlides.value) + totalSlides.value) % totalSlides.value
}

const nextSlide = () => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  slideDirection.value = 'next'
  goToSlide(currentIndex.value + 1)
  restartAutoPlay()
}

const prevSlide = () => {
  if (isTransitioning.value) return
  isTransitioning.value = true
  slideDirection.value = 'prev'
  goToSlide(currentIndex.value - 1)
  restartAutoPlay()
}

const onTransitionDone = () => {
  isTransitioning.value = false
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
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <section
    class="section-hero"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
    @touchstart="(e) => { stopAutoPlay(); heroSwipeEvents.touchstart(e) }"
    @touchmove="heroSwipeEvents.touchmove"
    @touchend="heroSwipeEvents.touchend"
  >
    <div class="section-hero__track-wrapper">
      <Transition
        :name="`hero-slide-${slideDirection}`"
        @after-enter="onTransitionDone"
        @after-leave="onTransitionDone"
      >
        <div :key="currentIndex" class="section-hero__track">
          <!-- 이전 슬라이드 -->
          <div
            v-if="totalSlides > 1"
            class="section-hero__slide section-hero__slide--prev"
            @click="prevSlide"
          >
            <NuxtImg
              :src="getSlide(prevIndex).imageUrl || getSlide(prevIndex).image"
              :alt="getSlide(prevIndex).title || getSlide(prevIndex).imageAlt"
              class="section-hero__image"
              sizes="sm:100vw md:30vw lg:30vw"
              quality="100"
              loading="lazy"
            />
          </div>

          <!-- 현재 슬라이드 (메인) -->
          <div class="section-hero__slide section-hero__slide--active">
            <component
              :is="(activeSlide.linkUrl || activeSlide.href) ? 'a' : 'div'"
              :href="activeSlide.linkUrl || activeSlide.href || undefined"
              :target="(activeSlide.linkUrl || activeSlide.href) ? (activeSlide.linkTarget || '_self') : undefined"
              :rel="activeSlide.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
              class="section-hero__slide-link"
            >
              <NuxtImg
                :src="activeSlide.imageUrl || activeSlide.image"
                :alt="activeSlide.title || activeSlide.imageAlt"
                class="section-hero__image"
                sizes="sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw"
                quality="100"
                loading="eager"
                fetchpriority="high"
              />
            </component>
          </div>

          <!-- 다음 슬라이드 -->
          <div
            v-if="totalSlides > 1"
            class="section-hero__slide section-hero__slide--next"
            @click="nextSlide"
          >
            <NuxtImg
              :src="getSlide(nextIndex).imageUrl || getSlide(nextIndex).image"
              :alt="getSlide(nextIndex).title || getSlide(nextIndex).imageAlt"
              class="section-hero__image"
              sizes="sm:100vw md:30vw lg:30vw"
              quality="100"
              loading="lazy"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- 콘텐츠 오버레이 -->
    <div class="section-hero__content">
      <p v-if="activeSlide.subtitle" class="section-hero__subtitle">{{ activeSlide.subtitle }}</p>
      <p v-if="activeSlide.description" class="section-hero__description">{{ activeSlide.description }}</p>
      <SlideIndicator
        v-if="totalSlides > 1"
        :current="currentIndex + 1"
        :total="totalSlides"
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
