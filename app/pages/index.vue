<script setup>
import mainData from '~/data/main.json'

// shop-info에서 SEO 정보 및 섹션 목록 가져오기
const {
  seoInfo,
  shopName,
  sections,
  isLoaded: shopInfoLoaded,
  categoryItems: apiCategoryItems,
  fetchCategories
} = useShopInfo()

// 섹션 데이터 조회
const {
  fetchSections,
  bestProducts,
  newProducts,
  recommendProducts,
  reviews: sectionReviews,
  halfBanners: sectionHalfBanners,
  bestMeta,
  newMeta,
  recommendMeta,
  reviewMeta
} = useSections()

// 섹션 로드 여부
const sectionsLoaded = ref(false)

// SEO (API 우선, JSON fallback)
useHead({ title: () => seoInfo.value?.title || shopName.value || mainData.seo.title })
useSeoMeta({
  title: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  description: () => seoInfo.value?.description || '',
  ogTitle: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  ogDescription: () => seoInfo.value?.description || '',
  ogImage: () => seoInfo.value?.ogImage || mainData.seo.ogImage
})

// 메인 페이지 배너 API 데이터
const {
  heroBanners,
  slideBanners: apiSlideBanners,
  fullBanners: apiFullBanners,
  bannerPending
} = useMain()

// 배너 로딩 상태
const showBannerLoading = computed(() => bannerPending.value)

// Hero 슬라이드 (API only)
const heroSlides = computed(() => heroBanners.value || [])

// 카테고리 (API 또는 JSON 폴백)
const categoryItems = computed(() =>
  apiCategoryItems.value?.length ? apiCategoryItems.value : mainData.categories.items
)

// Best 상품 (섹션 API 또는 JSON 폴백)
const bestItems = computed(() =>
  bestProducts.value?.length ? bestProducts.value : mainData.bestItems.products
)

// Best 섹션 데이터 (API 메타 + 폴백)
const bestData = computed(() => ({
  title: bestMeta.value?.title || mainData.bestItems.title,
  subtitle: bestMeta.value?.subtitle || bestMeta.value?.description || mainData.bestItems.subtitle,
  arrowLabels: mainData.bestItems.arrowLabels
}))

// 신상품 (섹션 API)
const newItems = computed(() => newProducts.value || [])

// New 섹션 데이터 (API 메타 + 폴백)
const newData = computed(() => ({
  title: newMeta.value?.title || mainData.newItems.title,
  subtitle: newMeta.value?.subtitle || newMeta.value?.description || mainData.newItems.subtitle,
  arrowLabels: mainData.newItems.arrowLabels
}))

// 추천 상품 (섹션 API 또는 JSON 폴백)
const mdPickProducts = computed(() =>
  recommendProducts.value?.length ? recommendProducts.value : mainData.mdPick.products
)

// Recommend 섹션 데이터 (API 메타 + 폴백)
const mdPickData = computed(() => ({
  ...mainData.mdPick,
  title: recommendMeta.value?.title || mainData.mdPick.title,
  subtitle: recommendMeta.value?.subtitle || recommendMeta.value?.description || mainData.mdPick.subtitle,
  mainImage: recommendMeta.value?.bannerImageUrl || mainData.mdPick.mainImage,
  mainImageAlt: recommendMeta.value?.title || mainData.mdPick.mainImageAlt,
  recommendTitle: recommendMeta.value?.description || mainData.mdPick.recommendTitle,
  linkUrl: recommendMeta.value?.linkUrl || null
}))

// Review 섹션 데이터 (API 메타 + 폴백)
const reviewData = computed(() => ({
  title: reviewMeta.value?.title || mainData.reviews.title,
  subtitle: reviewMeta.value?.subtitle || reviewMeta.value?.description || mainData.reviews.subtitle
}))

// 카테고리별 상품 폴백 (API 실패 시)
const fallbackCategoryProducts = computed(() => {
  const combined = [...(bestProducts.value || []), ...(recommendProducts.value || [])]
  return combined.length ? combined : mainData.categoryItems.products
})

// 슬라이드 배너 (API only)
const slideBanners = computed(() => apiSlideBanners.value || [])

// Half 배너 (섹션 API 또는 배너 API)
const halfBanners = computed(() => sectionHalfBanners.value || [])

// Full 배너 (API only)
const fullBanner = computed(() => apiFullBanners.value?.[0] || null)

// 리뷰 (섹션 API)
const reviews = computed(() => sectionReviews.value || [])

// 팝업
const { centerPopups, floatingPopups, fetchPopups, dismissPopup } = usePopup()

// 섹션별 활성화 여부 확인
const isSectionActive = (keyword) => {
  return sections.value?.some(s => s.keyword === keyword) || false
}

// sections가 로드되면 섹션 데이터 및 카테고리 조회
watch(
  () => sections.value,
  async (sectionList) => {
    if (sectionList?.length && !sectionsLoaded.value) {
      sectionsLoaded.value = true

      // 섹션 데이터와 카테고리 병렬 로드
      await Promise.all([
        fetchSections(sectionList),
        fetchCategories()
      ])
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 팝업 로드
  fetchPopups()
})
</script>

<template>
  <div class="page-main">
    <!-- Hero 배너 (클라이언트 전용 - 배너 API가 server: false) -->
    <ClientOnly>
      <div v-if="showBannerLoading" class="page-main__loading">
        <BaseSpinner />
      </div>
      <div v-else class="page-main__hero-wrap">
        <SectionHero
          v-if="heroSlides.length"
          :data="mainData.hero"
          :slides="heroSlides"
        />
      </div>
      <template #fallback>
        <div class="page-main__loading">
          <BaseSpinner />
        </div>
      </template>
    </ClientOnly>

    <main>
      <SectionCategories
        :data="mainData.categories"
        :categories="categoryItems"
      />

      <!-- Best 상품 (섹션 API) -->
      <SectionBestItems
        v-if="isSectionActive('best')"
        :data="bestData"
        :products="bestItems"
      />

      <!-- 신상품 (섹션 API) -->
      <SectionBestItems
        v-if="isSectionActive('new')"
        :data="newData"
        :products="newItems"
      />

      <!-- 추천 상품 (섹션 API) -->
      <SectionMdPick
        v-if="isSectionActive('recommend')"
        :data="mdPickData"
        :products="mdPickProducts"
      />

      <!-- Full 배너 (클라이언트 전용) -->
      <ClientOnly>
        <BannerFull v-if="fullBanner" :banner="fullBanner" />
      </ClientOnly>

      <SectionCategoryItems
        v-if="isSectionActive('category')"
        :data="mainData.categoryItems"
        :categories="categoryItems"
        :fallback-products="fallbackCategoryProducts"
      />

      <!-- Slide 배너 (클라이언트 전용) -->
      <ClientOnly>
        <BannerSlide
          v-if="slideBanners.length"
          :banners="slideBanners"
          :auto-play="true"
          :interval="5000"
        />
      </ClientOnly>

      <!-- Half 배너 (섹션 API) -->
      <ClientOnly>
        <SectionHalfBanners
          v-if="isSectionActive('half_banner') && halfBanners.length"
          :banners="halfBanners"
          :button-label="mainData.banners.halfLabels.buttonLabel"
        />
      </ClientOnly>

      <!-- 리뷰 섹션 (섹션 API) -->
      <ClientOnly>
        <SectionReviews
          v-if="isSectionActive('review') && reviews.length"
          :data="reviewData"
          :reviews="reviews"
        />
      </ClientOnly>

      <SectionInstagram
        :data="mainData.instagram"
        :images="mainData.instagram.items"
      />
    </main>

    <Footer :data="mainData.footer" />

    <PopupCenter
      :popups="centerPopups"
      @dismiss="dismissPopup"
    />
    <PopupFloating
      :popups="floatingPopups"
      @dismiss="dismissPopup"
    />
  </div>
</template>
