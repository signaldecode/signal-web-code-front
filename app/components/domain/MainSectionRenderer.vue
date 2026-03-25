<script setup>
const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  }
})

const { getEntry } = useSectionRegistry()

// 컴포넌트 resolve 맵 (lazy resolve 방지를 위해 미리 등록)
const componentMap = {
  SectionBestItems: resolveComponent('SectionBestItems'),
  SectionBestReviews: resolveComponent('SectionBestReviews'),
  SectionMdPick: resolveComponent('SectionMdPick'),
  SectionCategoryItems: resolveComponent('SectionCategoryItems'),
  SectionReviews: resolveComponent('SectionReviews'),
  SectionInstagram: resolveComponent('SectionInstagram'),
  BannerFull: resolveComponent('BannerFull'),
  BannerSlide: resolveComponent('BannerSlide'),
  SectionHalfBanners: resolveComponent('SectionHalfBanners'),
  SectionTrustBar: resolveComponent('SectionTrustBar'),
  SectionHowItWorks: resolveComponent('SectionHowItWorks'),
  SectionShowroom: resolveComponent('SectionShowroom')
}

/**
 * 섹션별 애니메이션 매핑
 * 각 섹션 특성에 맞는 고유 애니메이션 배정
 */
const sectionAnimationMap = {
  best: { animation: 'slide-up-spring', stagger: true },
  best_review: { animation: 'blur-in' },
  new: { animation: 'fade-up', stagger: true },
  recommend: { animation: 'scale-in' },
  category: { animation: 'fade-up', stagger: true },
  full_banner: false,
  slide_banner: false,
  half_banner: false,
  review: { animation: 'fade-in' },
  instagram: { animation: 'blur-in' },
  trust_bar: { animation: 'fade-in' },
  how_it_works: { animation: 'fade-up', stagger: true }
}

/**
 * keyword에 맞는 애니메이션 옵션 반환
 */
const getAnimationConfig = (keyword, index) => {
  const config = sectionAnimationMap[keyword]
  if (config === false) return false
  return {
    ...(config || { animation: 'fade-up' }),
    delay: index * 60
  }
}

/**
 * keyword로 실제 Vue 컴포넌트 resolve
 */
const resolveSection = (keyword) => {
  const entry = getEntry(keyword)
  if (!entry) return null
  return componentMap[entry.component] || null
}

/**
 * keyword로 props 조회
 */
const getSectionProps = (keyword) => {
  const entry = getEntry(keyword)
  if (!entry) return {}
  return entry.props()
}

/**
 * 렌더 여부 판단
 */
const shouldRender = (keyword) => {
  const entry = getEntry(keyword)
  if (!entry) return false
  return !entry.isEmpty()
}

/**
 * ClientOnly 래핑 여부
 */
const isClientOnly = (keyword) => {
  const entry = getEntry(keyword)
  return entry?.clientOnly || false
}
</script>

<template>
  <template v-for="(section, index) in sections" :key="section.keyword">
    <!-- ClientOnly 섹션 -->
    <ClientOnly v-if="isClientOnly(section.keyword) && shouldRender(section.keyword)">
      <div v-scroll-animate="getAnimationConfig(section.keyword, index)">
        <component
          :is="resolveSection(section.keyword)"
          v-bind="getSectionProps(section.keyword)"
        />
      </div>
    </ClientOnly>

    <!-- SSR 섹션 -->
    <div
      v-else-if="!isClientOnly(section.keyword) && shouldRender(section.keyword)"
      v-scroll-animate="getAnimationConfig(section.keyword, index)"
    >
      <component
        :is="resolveSection(section.keyword)"
        v-bind="getSectionProps(section.keyword)"
      />
    </div>
  </template>
</template>
