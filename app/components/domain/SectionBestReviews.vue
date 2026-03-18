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

// 상위 3개 리뷰 (평점 높은 순 + 이미지 있는 것 우선)
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

      <div class="section-best-reviews__grid">
        <button
          v-for="review in bestReviews"
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
  </section>
</template>
