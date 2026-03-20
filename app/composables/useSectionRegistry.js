/**
 * 메인 페이지 섹션 레지스트리
 * keyword → 컴포넌트 매핑 + 데이터 바인딩을 한 곳에서 관리
 *
 * 새 섹션 추가 시: registry에 1줄 추가 + 컴포넌트 1개 생성
 */
import mainData from '~/data/main.json'

export const useSectionRegistry = () => {
  const {
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

  const {
    slideBanners: apiSlideBanners,
    fullBanners: apiFullBanners
  } = useMain()

  const {
    categoryItems: apiCategoryItems
  } = useShopInfo()

  /**
   * 섹션 레지스트리
   * - component: 렌더할 컴포넌트명
   * - clientOnly: true면 ClientOnly로 래핑
   * - props: () => 해당 컴포넌트에 전달할 props (reactive)
   * - isEmpty: () => 데이터 없으면 렌더 스킵
   */
  const registry = {
    best: {
      component: 'SectionBestItems',
      clientOnly: false,
      props: () => ({
        data: {
          title: bestMeta.value?.title || mainData.bestItems.title,
          subtitle: bestMeta.value?.subtitle || bestMeta.value?.description || mainData.bestItems.subtitle,
          arrowLabels: mainData.bestItems.arrowLabels
        },
        products: bestProducts.value || [],
        showRank: true
      }),
      isEmpty: () => !bestProducts.value?.length
    },

    best_review: {
      component: 'SectionBestReviews',
      clientOnly: true,
      props: () => ({
        data: mainData.bestReviews,
        reviews: sectionReviews.value || []
      }),
      isEmpty: () => !sectionReviews.value?.length
    },

    new: {
      component: 'SectionBestItems',
      clientOnly: false,
      props: () => ({
        data: {
          title: newMeta.value?.title || mainData.newItems.title,
          subtitle: newMeta.value?.subtitle || newMeta.value?.description || mainData.newItems.subtitle,
          arrowLabels: mainData.newItems.arrowLabels
        },
        products: newProducts.value || []
      }),
      isEmpty: () => !newProducts.value?.length
    },

    recommend: {
      component: 'SectionMdPick',
      clientOnly: false,
      props: () => ({
        data: {
          ...mainData.mdPick,
          title: recommendMeta.value?.title || mainData.mdPick.title,
          subtitle: recommendMeta.value?.subtitle || recommendMeta.value?.description || mainData.mdPick.subtitle,
          mainImage: recommendMeta.value?.bannerImageUrl || mainData.mdPick.mainImage,
          mainImageAlt: recommendMeta.value?.title || mainData.mdPick.mainImageAlt,
          recommendTitle: recommendMeta.value?.description || mainData.mdPick.recommendTitle,
          linkUrl: recommendMeta.value?.linkUrl || null
        },
        products: recommendProducts.value || []
      }),
      isEmpty: () => !recommendProducts.value?.length
    },

    category: {
      component: 'SectionCategoryItems',
      clientOnly: false,
      props: () => ({
        data: mainData.categoryItems,
        categories: apiCategoryItems.value?.length ? apiCategoryItems.value : [],
        fallbackProducts: [
          ...(bestProducts.value || []),
          ...(recommendProducts.value || [])
        ]
      }),
      isEmpty: () => false
    },

    full_banner: {
      component: 'BannerFull',
      clientOnly: true,
      props: () => ({
        banner: apiFullBanners.value?.[0] || null
      }),
      isEmpty: () => !apiFullBanners.value?.[0]
    },

    slide_banner: {
      component: 'BannerSlide',
      clientOnly: true,
      props: () => ({
        banners: apiSlideBanners.value || [],
        autoPlay: true,
        interval: 5000
      }),
      isEmpty: () => !apiSlideBanners.value?.length
    },

    half_banner: {
      component: 'SectionHalfBanners',
      clientOnly: true,
      props: () => ({
        banners: sectionHalfBanners.value || [],
        buttonLabel: mainData.banners.halfLabels.buttonLabel
      }),
      isEmpty: () => !sectionHalfBanners.value?.length
    },

    review: {
      component: 'SectionReviews',
      clientOnly: true,
      props: () => ({
        data: {
          title: reviewMeta.value?.title || mainData.reviews.title,
          subtitle: reviewMeta.value?.subtitle || reviewMeta.value?.description || mainData.reviews.subtitle
        },
        reviews: sectionReviews.value || []
      }),
      isEmpty: () => !sectionReviews.value?.length
    },

    bento: {
      component: 'SectionBentoGrid',
      clientOnly: true,
      props: () => ({
        data: {
          ...mainData.bentoGrid,
          mainImage: recommendMeta.value?.bannerImageUrl || mainData.mdPick.mainImage
        },
        featuredProduct: recommendProducts.value?.[0] || null,
        categories: apiCategoryItems.value?.length ? apiCategoryItems.value.slice(0, 4) : mainData.categories.items.slice(0, 4),
        banner: apiSlideBanners.value?.[0] || mainData.banners.slide[0] || null
      }),
      isEmpty: () => !recommendProducts.value?.length && !apiCategoryItems.value?.length
    },

    instagram: {
      component: 'SectionInstagram',
      clientOnly: false,
      props: () => ({
        data: mainData.instagram,
        images: mainData.instagram.items
      }),
      isEmpty: () => false
    }
  }

  /**
   * keyword로 레지스트리 항목 조회
   */
  const getEntry = (keyword) => registry[keyword] || null

  /**
   * 등록된 모든 keyword 목록
   */
  const registeredKeywords = Object.keys(registry)

  return {
    registry,
    getEntry,
    registeredKeywords
  }
}
