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

// 활성 섹션 목록 (best 뒤에 how_it_works 자동 삽입)
const activeSections = computed(() => {
  const list = Array.isArray(sections.value) ? [...sections.value] : []
  const bestIndex = list.findIndex(s => s.keyword === 'best')
  if (bestIndex !== -1) {
    list.splice(bestIndex + 1, 0, { keyword: 'how_it_works', isActive: true })
  }
  return list
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

    <!-- Trust Bar (항상 표시 - Hero 직후 신뢰 지표) -->
    <SectionTrustBar :data="mainData.trustBar" />

    <main>
      <!-- 카테고리 (항상 표시) -->
      <SectionCategories
        :data="mainData.categories"
        :categories="categoryItems"
      />

      <!-- 섹션 동적 렌더링 -->
      <MainSectionRenderer :sections="activeSections" />
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
