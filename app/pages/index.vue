<script setup>
import mainData from '~/data/main.json'

// shop-info (SEO + 섹션 목록)
const {
  seoInfo,
  shopName,
  sections,
  categoryItems: apiCategoryItems,
  fetchCategories
} = useShopInfo()

// 섹션 데이터 fetch
const { fetchSections } = useSections()

// 배너 데이터
const { heroBanners, bannerPending } = useMain()

// 팝업
const { centerPopups, floatingPopups, fetchPopups, dismissPopup } = usePopup()

// SEO (API 우선, JSON fallback)
useHead({ title: () => seoInfo.value?.title || shopName.value || mainData.seo.title })
useSeoMeta({
  title: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  description: () => seoInfo.value?.description || '',
  ogTitle: () => seoInfo.value?.title || shopName.value || mainData.seo.title,
  ogDescription: () => seoInfo.value?.description || '',
  ogImage: () => seoInfo.value?.ogImage || mainData.seo.ogImage
})

// 고정 배치 섹션 키워드 (index.vue에서 직접 배치)
const fixedSections = ['best', 'trust_bar', 'how_it_works']

// 동적 섹션 목록 (고정 배치 제외)
const activeSections = computed(() => {
  if (!Array.isArray(sections.value)) return []
  return sections.value.filter(s => !fixedSections.includes(s.keyword))
})

// Hero 슬라이드
const heroSlides = computed(() => heroBanners.value || [])

// 카테고리 (API 또는 JSON fallback)
const categoryItems = computed(() =>
  apiCategoryItems.value?.length ? apiCategoryItems.value : mainData.categories.items
)

// 섹션 데이터 로드 (클라이언트 전용 - SSR 401 방지)
const sectionsLoaded = ref(false)

const loadSections = async () => {
  if (sectionsLoaded.value) return
  if (!sections.value?.length) return
  sectionsLoaded.value = true
  await Promise.all([
    fetchSections(sections.value),
    fetchCategories()
  ])
}

onMounted(async () => {
  await loadSections()
  fetchPopups()
})

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
    <!-- Hero 배너 -->
    <ClientOnly>
      <div v-if="bannerPending" class="page-main__loading">
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
      <!-- 1. TrustBar (Hero 직후 — 신뢰 지표로 즉시 설득) -->
      <!-- <div v-scroll-animate="{ animation: 'fade-in' }">
        <SectionTrustBar :data="mainData.trustBar" />
      </div> -->

      <!-- 2. 인기 상품 쇼룸 (핵심 상품 즉시 노출) -->
      <div v-scroll-animate="{ animation: 'fade-up' }">
        <SectionShowroom
          :data="mainData.showroom"
          :products="mainData.showroom.mockProducts"
        />
      </div>

      <!-- 3. 카테고리 탐색 -->
      <div v-scroll-animate="{ animation: 'fade-up' }">
        <SectionCategories
          :data="mainData.categories"
          :categories="categoryItems"
        />
      </div>

      <!-- 4. 동적 섹션 (best/trust_bar/how_it_works 제외) -->
      <MainSectionRenderer :sections="activeSections" />

      <!-- 5. HowItWorks (하단 — 구매 프로세스 안내) -->
      <div v-scroll-animate="{ animation: 'fade-up', stagger: true }">
        <SectionHowItWorks :data="mainData.howItWorks" />
      </div>

      <!-- 6. Newsletter CTA (전환 유도) -->
      <div v-scroll-animate="{ animation: 'scale-in' }">
        <SectionNewsletter :data="mainData.newsletter" />
      </div>
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
