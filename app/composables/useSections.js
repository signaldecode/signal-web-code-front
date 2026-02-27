/**
 * 메인 페이지 섹션 데이터 조회 composable
 * GET /sections/{keyword}?limit=N
 *
 * shop-info의 sections 배열에서 keyword를 받아 각 섹션 데이터 조회
 */
export const useSections = () => {
  const config = useRuntimeConfig()

  // API URL 빌드
  const buildUrl = (endpoint) => {
    if (import.meta.server) {
      return `${config.apiBaseUrl}${endpoint}`
    }
    return `${config.public.apiBase}${endpoint}`
  }

  // 섹션별 데이터 상태
  const sectionData = useState('sections-data', () => ({}))

  /**
   * 단일 섹션 데이터 조회
   * @param {string} keyword - 섹션 키워드 (best, new, recommend, review, half_banner 등)
   * @param {number} limit - 조회 개수 (기본 8, review는 30 권장)
   */
  const fetchSection = async (keyword, limit = 8) => {
    if (!keyword) return null

    // 이미 데이터가 있으면 스킵
    if (sectionData.value[keyword]) {
      console.log(`[useSections] ${keyword}: 캐시된 데이터 사용`)
      return sectionData.value[keyword]
    }

    try {
      const url = buildUrl(`/sections/${keyword}`)
      console.log(`[useSections] ${keyword}: API 호출 시작`, url)

      const response = await $fetch(url, {
        method: 'GET',
        query: { limit },
        credentials: 'include'
      })

      const data = response.data || response
      sectionData.value = { ...sectionData.value, [keyword]: data }

      return data
    } catch (err) {
      const status = err?.response?.status || err?.status || err?.statusCode
      console.log(`[useSections] ${keyword}: API 에러 (${status})`)
      if (status !== 401) {
        console.error(`[useSections] 에러 [${keyword}]:`, err)
      }
      return null
    }
  }

  /**
   * 여러 섹션 데이터 일괄 조회
   * @param {Array<{keyword: string, limit?: number}>} sections - 섹션 목록
   */
  const fetchSections = async (sections) => {
    if (!sections?.length) return

    const promises = sections.map(section => {
      const limit = section.keyword === 'review' ? 30 : (section.limit || 8)
      return fetchSection(section.keyword, limit)
    })

    await Promise.all(promises)
  }

  /**
   * 특정 섹션 데이터 가져오기
   * @param {string} keyword
   */
  const getSection = (keyword) => {
    return computed(() => sectionData.value[keyword] || null)
  }

  // 상품 데이터 변환 함수
  const transformProduct = (product) => {
    const hasDiscount = product.sellingPrice && product.sellingPrice < product.regularPrice

    return {
      id: product.id,
      href: `/products/${product.id}`,
      image: product.imageUrl,
      imageAlt: product.name,
      isBest: product.tags?.some(tag => tag.toUpperCase() === 'BEST') || product.isBest,
      isNew: product.tags?.some(tag => tag.toUpperCase() === 'NEW') || product.isNew,
      name: product.name,
      summary: product.summary,
      promotionName: product.promotionName,
      price: product.sellingPrice || product.regularPrice,
      originalPrice: hasDiscount ? product.regularPrice : null,
      discountRate: product.discountRate || 0,
      currency: '원',
      rating: product.ratingAvg,
      reviewCount: product.reviewCount
    }
  }

  // 리뷰 데이터 변환 함수
  const transformReview = (review) => {
    // 이미지 배열 추출 (다양한 필드명 지원)
    const rawImages = review.imageUrls || review.images || review.reviewImageUrls || []
    // 이미지가 객체 배열인 경우 url 추출, 문자열 배열이면 그대로 사용
    const images = rawImages.map(img => typeof img === 'string' ? img : (img?.url || img?.imageUrl || ''))
      .filter(Boolean)

    return {
      id: review.id,
      productId: review.productId,
      productName: review.productName,
      productImage: review.productImageUrl,
      rating: review.rating,
      content: review.content,
      images,
      // 작성자: authorName, username, author 등 다양한 필드명 지원
      username: review.authorName || review.username || review.author || '',
      author: review.authorName || review.username || review.author || '',
      date: review.createdAt,
      helpful: review.helpfulCount || 0
    }
  }

  // 배너 데이터 변환 함수
  const transformBanner = (banner) => ({
    id: banner.id,
    title: banner.title || banner.name || '',
    subtitle: banner.subtitle || '',
    description: banner.description || '',
    image: banner.imageUrl,
    imageUrl: banner.imageUrl,
    mobileImage: banner.mobileImageUrl,
    mobileImageUrl: banner.mobileImageUrl,
    imageAlt: banner.title || banner.name || '',
    href: banner.linkUrl,
    linkTarget: banner.linkTarget
  })

  // ============================================
  // 섹션별 Computed Getters (변환된 데이터)
  // ============================================

  // 베스트 상품
  const bestProducts = computed(() => {
    const data = sectionData.value['best']
    if (!data?.products) return []
    return data.products.map(transformProduct)
  })

  // 신상품
  const newProducts = computed(() => {
    const data = sectionData.value['new']
    if (!data?.products) return []
    return data.products.map(transformProduct)
  })

  // 추천 상품
  const recommendProducts = computed(() => {
    const data = sectionData.value['recommend']
    if (!data?.products) return []
    return data.products.map(transformProduct)
  })

  // 리뷰
  const reviews = computed(() => {
    const data = sectionData.value['review']
    if (!data?.reviews) return []
    return data.reviews.map(transformReview)
  })

  // 하프 배너
  const halfBanners = computed(() => {
    const data = sectionData.value['half_banner']
    if (!data?.banners) return []
    return data.banners.map(transformBanner)
  })

  // ============================================
  // 섹션별 메타 정보 (title, subtitle 등)
  // ============================================

  // 섹션 메타 정보 헬퍼
  const getSectionMeta = (keyword) => {
    return computed(() => {
      const data = sectionData.value[keyword]
      if (!data) return null
      return {
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        bannerImageUrl: data.bannerImageUrl || '',
        linkUrl: data.linkUrl || ''
      }
    })
  }

  // 각 섹션 메타 정보
  const bestMeta = computed(() => {
    const data = sectionData.value['best']
    return data ? { title: data.title, subtitle: data.subtitle, description: data.description } : null
  })

  const newMeta = computed(() => {
    const data = sectionData.value['new']
    return data ? { title: data.title, subtitle: data.subtitle, description: data.description } : null
  })

  const recommendMeta = computed(() => {
    const data = sectionData.value['recommend']
    return data ? {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      bannerImageUrl: data.bannerImageUrl,
      linkUrl: data.linkUrl
    } : null
  })

  const reviewMeta = computed(() => {
    const data = sectionData.value['review']
    return data ? { title: data.title, subtitle: data.subtitle, description: data.description } : null
  })

  return {
    // 상태
    sectionData,

    // 메서드
    fetchSection,
    fetchSections,
    getSection,
    getSectionMeta,

    // 변환 함수 (외부 사용용)
    transformProduct,
    transformReview,
    transformBanner,

    // 변환된 데이터
    bestProducts,
    newProducts,
    recommendProducts,
    reviews,
    halfBanners,

    // 섹션 메타 정보
    bestMeta,
    newMeta,
    recommendMeta,
    reviewMeta
  }
}
