<script setup>
import mainData from '~/data/main.json'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  featuredProduct: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  banner: {
    type: Object,
    default: null
  }
})

const bentoData = mainData.bentoGrid

// 카테고리 최대 4개
const displayCategories = computed(() => (props.categories || []).slice(0, 4))
</script>

<template>
  <section class="section-bento">
    <div class="section-bento__inner">
      <div class="section-bento__grid">
        <!-- Featured (왼쪽 큰 카드) -->
        <div class="section-bento__featured">
          <NuxtLink
            v-if="featuredProduct"
            :to="featuredProduct.href"
            class="section-bento__featured-link"
          >
            <img
              :src="data.mainImage || featuredProduct.image"
              :alt="featuredProduct.imageAlt || featuredProduct.name"
              class="section-bento__featured-image"
              loading="lazy"
            />
            <div class="section-bento__featured-overlay">
              <span class="section-bento__featured-badge">{{ bentoData.featuredTitle }}</span>
              <h2 class="section-bento__featured-title">{{ featuredProduct.name }}</h2>
              <p class="section-bento__featured-subtitle">{{ bentoData.featuredSubtitle }}</p>
              <span class="section-bento__featured-cta">
                {{ bentoData.featuredCta }} &rarr;
              </span>
            </div>
          </NuxtLink>
        </div>

        <!-- 오른쪽 카테고리 그리드 -->
        <div class="section-bento__categories">
          <NuxtLink
            v-for="cat in displayCategories"
            :key="cat.id || cat.label"
            :to="cat.href"
            class="section-bento__cat-card"
          >
            <img
              v-if="cat.image"
              :src="cat.image"
              :alt="cat.imageAlt || cat.label"
              class="section-bento__cat-image"
              loading="lazy"
            />
            <span class="section-bento__cat-label">{{ cat.label }}</span>
          </NuxtLink>
        </div>

        <!-- 하단 배너 -->
        <div v-if="banner" class="section-bento__banner">
          <component
            :is="banner.href || banner.linkUrl ? 'a' : 'div'"
            :href="banner.href || banner.linkUrl || undefined"
            class="section-bento__banner-link"
          >
            <img
              :src="banner.image || banner.imageUrl"
              :alt="banner.imageAlt || banner.title"
              class="section-bento__banner-image"
              loading="lazy"
            />
            <div v-if="banner.title" class="section-bento__banner-content">
              <span class="section-bento__banner-title">{{ banner.title }}</span>
              <span v-if="banner.subtitle" class="section-bento__banner-subtitle">{{ banner.subtitle }}</span>
            </div>
          </component>
        </div>
      </div>
    </div>
  </section>
</template>
