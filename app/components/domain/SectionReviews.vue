<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  reviews: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// 2줄로 나누기 (각 줄에 최소 10개씩 - 무한 스크롤용)
const topRowReviews = computed(() => {
  const half = Math.ceil(props.reviews.length / 2)
  const items = props.reviews.slice(0, half)
  // 무한 스크롤을 위해 복제
  return [...items, ...items]
})

const bottomRowReviews = computed(() => {
  const half = Math.ceil(props.reviews.length / 2)
  const items = props.reviews.slice(half)
  // 무한 스크롤을 위해 복제
  return [...items, ...items]
})

// 마우스 오버 시 애니메이션 정지
const isPaused = ref(false)

const handleMouseEnter = () => {
  isPaused.value = true
}

const handleMouseLeave = () => {
  isPaused.value = false
}

// 리뷰 클릭 시 상세 페이지로 이동
const handleReviewClick = (review) => {
  if (review.productId) {
    router.push(`/products/${review.productId}?tab=reviews&reviewId=${review.id}`)
  }
}
</script>

<template>
  <section class="section-reviews">
    <div class="section-reviews__header">
      <h2 class="section-reviews__title">{{ data.title }}</h2>
      <p v-if="data.subtitle" class="section-reviews__subtitle">{{ data.subtitle }}</p>
    </div>

    <div
      class="section-reviews__marquee"
      :class="{ 'section-reviews__marquee--paused': isPaused }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Top Row: 좌측으로 이동 -->
      <div class="section-reviews__row section-reviews__row--left">
        <div class="section-reviews__track">
          <button
            v-for="(review, index) in topRowReviews"
            :key="`top-${index}`"
            type="button"
            class="section-reviews__card"
            @click="handleReviewClick(review)"
          >
            <div class="section-reviews__card-image">
              <NuxtImg
                v-if="review.images?.[0]"
                :src="review.images[0]"
                :alt="review.username"
                loading="lazy"
              />
              <div v-else class="section-reviews__card-placeholder">
                <p>{{ review.content }}</p>
              </div>
            </div>
            <div class="section-reviews__card-info">
              <div class="section-reviews__card-rating">
                <IconStar
                  v-for="i in 5"
                  :key="i"
                  size="sm"
                  :active="i <= (review.rating || 0)"
                />
              </div>
              <span class="section-reviews__card-username">{{ review.username }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Bottom Row: 우측으로 이동 -->
      <div class="section-reviews__row section-reviews__row--right">
        <div class="section-reviews__track">
          <button
            v-for="(review, index) in bottomRowReviews"
            :key="`bottom-${index}`"
            type="button"
            class="section-reviews__card"
            @click="handleReviewClick(review)"
          >
            <div class="section-reviews__card-image">
              <NuxtImg
                v-if="review.images?.[0]"
                :src="review.images[0]"
                :alt="review.username"
                loading="lazy"
              />
              <div v-else class="section-reviews__card-placeholder">
                <p>{{ review.content }}</p>
              </div>
            </div>
            <div class="section-reviews__card-info">
              <div class="section-reviews__card-rating">
                <IconStar
                  v-for="i in 5"
                  :key="i"
                  size="sm"
                  :active="i <= (review.rating || 0)"
                />
              </div>
              <span class="section-reviews__card-username">{{ review.username }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
