<script setup>
import mainData from '~/data/main.json'

const props = defineProps({
  data: {
    type: Object,
    default: () => mainData.bestReviews
  },
  reviews: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// 상위 3개 리뷰 (이미지 있는 것 우선 + 평점 높은 순)
const bestReviews = computed(() => {
  return [...props.reviews]
    .sort((a, b) => {
      const aHasImage = a.images?.length > 0 ? 1 : 0
      const bHasImage = b.images?.length > 0 ? 1 : 0
      if (bHasImage !== aHasImage) return bHasImage - aHasImage
      return (b.rating || 0) - (a.rating || 0)
    })
    .slice(0, 3)
})

// 매거진 레이아웃: featured(첫 번째) + side(나머지)
const featuredReview = computed(() => bestReviews.value[0] || null)
const sideReviews = computed(() => bestReviews.value.slice(1))

const handleReviewClick = (review) => {
  if (review.productId) {
    router.push(`/products/${review.productId}?tab=reviews&reviewId=${review.id}`)
  }
}
</script>

<template>
  <section v-if="bestReviews.length" class="section-best-reviews">
    <div class="section-best-reviews__inner">
      <div class="section-best-reviews__header">
        <div>
          <h2 class="section-best-reviews__title">{{ data.title }}</h2>
          <p class="section-best-reviews__subtitle">{{ data.subtitle }}</p>
        </div>
        <NuxtLink
          v-if="data.viewAllHref"
          :to="data.viewAllHref"
          class="section-best-reviews__view-all"
        >
          {{ data.viewAllLabel }}
        </NuxtLink>
      </div>

      <div class="section-best-reviews__magazine">
        <!-- Featured (큰 카드) -->
        <button
          v-if="featuredReview"
          type="button"
          class="section-best-reviews__featured"
          @click="handleReviewClick(featuredReview)"
        >
          <div v-if="featuredReview.images?.[0]" class="section-best-reviews__featured-image">
            <NuxtImg
              :src="featuredReview.images[0]"
              :alt="featuredReview.productName || featuredReview.username"
              loading="lazy"
            />
          </div>
          <div class="section-best-reviews__featured-body">
            <div class="section-best-reviews__card-rating">
              <IconStar
                v-for="i in 5"
                :key="i"
                size="sm"
                :active="i <= (featuredReview.rating || 0)"
              />
            </div>
            <p class="section-best-reviews__featured-content">{{ featuredReview.content }}</p>
            <div class="section-best-reviews__card-footer">
              <span class="section-best-reviews__card-username">{{ featuredReview.username }}</span>
              <span v-if="featuredReview.productName" class="section-best-reviews__card-product">{{ featuredReview.productName }}</span>
            </div>
          </div>
        </button>

        <!-- Side (작은 카드들) -->
        <div class="section-best-reviews__side">
          <button
            v-for="review in sideReviews"
            :key="review.id"
            type="button"
            class="section-best-reviews__card"
            @click="handleReviewClick(review)"
          >
            <div v-if="review.images?.[0]" class="section-best-reviews__card-image">
              <NuxtImg
                :src="review.images[0]"
                :alt="review.productName || review.username"
                loading="lazy"
              />
            </div>
            <div class="section-best-reviews__card-body">
              <div class="section-best-reviews__card-rating">
                <IconStar
                  v-for="i in 5"
                  :key="i"
                  size="sm"
                  :active="i <= (review.rating || 0)"
                />
              </div>
              <p class="section-best-reviews__card-content">{{ review.content }}</p>
              <div class="section-best-reviews__card-footer">
                <span class="section-best-reviews__card-username">{{ review.username }}</span>
                <span v-if="review.productName" class="section-best-reviews__card-product">{{ review.productName }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
