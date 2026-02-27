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

// Best 상품 (섹션 API only - JSON에 products 없음)
const bestItems = computed(() => bestProducts.value || [])

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

// 추천 상품 (섹션 API only - JSON에 products 없음)
const mdPickProducts = computed(() => recommendProducts.value || [])

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

// 카테고리별 상품 폴백 (API 실패 시 - best + recommend 합침)
const fallbackCategoryProducts = computed(() => {
  return [...(bestProducts.value || []), ...(recommendProducts.value || [])]
})

// 슬라이드 배너 (API only)
const slideBanners = computed(() => apiSlideBanners.value || [])

// Half 배너 (섹션 API 또는 배너 API)
const halfBanners = computed(() => sectionHalfBanners.value || [])

// Full 배너 (API only)
const fullBanner = computed(() => apiFullBanners.value?.[0] || null)

// 리뷰 (섹션 API)
const reviews = computed(() => sectionReviews.value || [])

// 활성 섹션 목록 (안전한 배열 반환)
const activeSections = computed(() => {
  return Array.isArray(sections.value) ? sections.value : []
})

// 팝업
const { centerPopups, floatingPopups, fetchPopups, dismissPopup } = usePopup()

// 섹션 데이터 로드 함수
const loadSections = async () => {
  if (sectionsLoaded.value) return
  if (!sections.value?.length) return

  sectionsLoaded.value = true
  console.log('[index] 섹션 로드 시작:', sections.value.map(s => s.keyword))

  await Promise.all([
    fetchSections(sections.value),
    fetchCategories()
  ])
}

// 클라이언트에서 섹션 데이터 로드 (SSR에서 401 방지)
onMounted(async () => {
  // 섹션 데이터 로드
  await loadSections()

  // 팝업 로드
  fetchPopups()
})

// sections가 변경되면 클라이언트에서 데이터 로드 (shopInfo 로드 후 트리거)
watch(
  () => sections.value,
  async (sectionList) => {
    if (import.meta.client && sectionList?.length) {
      await loadSections()
    }
  },
  { immediate: true }
)
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
      <!-- 카테고리 (항상 표시) -->
      <SectionCategories
        :data="mainData.categories"
        :categories="categoryItems"
      />

      <!-- 섹션 동적 렌더링 (shop-info sections 순서대로) -->
      <template v-for="section in activeSections" :key="section.keyword">
        <!-- Best 상품 -->
        <SectionBestItems
          v-if="section.keyword === 'best' && bestItems.length"
          :data="bestData"
          :products="bestItems"
        />

        <!-- 신상품 -->
        <SectionBestItems
          v-if="section.keyword === 'new' && newItems.length"
          :data="newData"
          :products="newItems"
        />

        <!-- 추천 상품 -->
        <SectionMdPick
          v-if="section.keyword === 'recommend' && mdPickProducts.length"
          :data="mdPickData"
          :products="mdPickProducts"
        />

        <!-- 카테고리별 상품 -->
        <SectionCategoryItems
          v-if="section.keyword === 'category'"
          :data="mainData.categoryItems"
          :categories="categoryItems"
          :fallback-products="fallbackCategoryProducts"
        />

        <!-- Full 배너 -->
        <ClientOnly v-if="section.keyword === 'full_banner'">
          <BannerFull v-if="fullBanner" :banner="fullBanner" />
        </ClientOnly>

        <!-- Slide 배너 -->
        <ClientOnly v-if="section.keyword === 'slide_banner'">
          <BannerSlide
            v-if="slideBanners.length"
            :banners="slideBanners"
            :auto-play="true"
            :interval="5000"
          />
        </ClientOnly>

        <!-- Half 배너 -->
        <ClientOnly v-if="section.keyword === 'half_banner'">
          <SectionHalfBanners
            v-if="halfBanners.length"
            :banners="halfBanners"
            :button-label="mainData.banners.halfLabels.buttonLabel"
          />
        </ClientOnly>

        <!-- 리뷰 섹션 -->
        <ClientOnly v-if="section.keyword === 'review'">
          <SectionReviews
            v-if="reviews.length"
            :data="reviewData"
            :reviews="reviews"
          />
        </ClientOnly>

        <!-- 인스타그램 -->
        <SectionInstagram
          v-if="section.keyword === 'instagram'"
          :data="mainData.instagram"
          :images="mainData.instagram.items"
        />
      </template>
    </main>

    <Footer :data="mainData.footer" />

    <ClientOnly>
      <PopupCenter
        :popups="centerPopups"
        @dismiss="dismissPopup"
      />
      <PopupFloating
        :popups="floatingPopups"
        @dismiss="dismissPopup"
      />
    </ClientOnly>
  </div>
</template>
