/**
 * 쇼핑몰 정보 전역 상태 관리
 * - 최초 1회만 API 호출
 * - useState로 SSR/CSR 모두 지원
 * - 앱 전체에서 재사용
 */
export const useShopInfo = () => {
  const { get } = useApi()
  const config = useRuntimeConfig()

  // API URL 빌드
  const buildUrl = (endpoint) => {
    if (import.meta.server) {
      return `${config.apiBaseUrl}${endpoint}`
    }
    return `${config.public.apiBase}${endpoint}`
  }

  // 전역 상태 (앱 전체에서 공유)
  const shopInfo = useState('shop-info', () => null)
  const isLoaded = useState('shop-info-loaded', () => false)
  const pending = useState('shop-info-pending', () => false)
  const error = useState('shop-info-error', () => null)

  // 카테고리 상태
  const categories = useState('categories', () => [])

  /**
   * 쇼핑몰 정보 조회
   * - 이미 로드되었으면 스킵
   * - force=true면 강제 재조회
   */
  const fetchShopInfo = async (force = false) => {
    // 이미 로드되었고 강제 갱신이 아니면 스킵
    if (isLoaded.value && !force) {
      return shopInfo.value
    }

    // 이미 로딩 중이면 스킵
    if (pending.value) {
      return shopInfo.value
    }

    pending.value = true
    error.value = null

    try {
      const response = await get('/main/shop-info')
      const data = response.data || response

      shopInfo.value = data
      isLoaded.value = true

      return data
    } catch (err) {
      console.error('[useShopInfo] shop-info 로드 실패:', err)
      error.value = err.data?.message || err.message || '쇼핑몰 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      pending.value = false
    }
  }

  /**
   * 강제 새로고침
   */
  const refresh = () => fetchShopInfo(true)

  /**
   * 카테고리 목록 조회
   */
  const fetchCategories = async () => {
    // 이미 데이터가 있으면 스킵
    if (categories.value?.length) {
      return categories.value
    }

    try {
      const url = buildUrl('/main/categories')
      const response = await $fetch(url, {
        method: 'GET',
        credentials: 'include'
      })

      const data = response.data || response
      categories.value = Array.isArray(data) ? data : []

      return categories.value
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      return []
    }
  }

  // 카테고리를 UI용으로 변환
  const categoryItems = computed(() => {
    return categories.value.map(cat => ({
      id: cat.id,
      label: cat.name,
      href: `/category?tab=${cat.id}`,
      image: `/images/categories/category-${cat.sortOrder + 1}.png`,
      imageAlt: `${cat.name} 카테고리`
    }))
  })

  // ============================================
  // Computed Getters (편의용)
  // ============================================

  // 기본 정보
  const shopName = computed(() => shopInfo.value?.shopName || '')
  const shopNameEn = computed(() => shopInfo.value?.shopNameEn || '')
  const logoUrl = computed(() => shopInfo.value?.logoUrl || '')
  const faviconUrl = computed(() => shopInfo.value?.faviconUrl || '')

  // 사업자 정보
  const businessInfo = computed(() => shopInfo.value?.businessInfo || {})

  // 고객센터 정보
  const customerServiceInfo = computed(() => shopInfo.value?.customerServiceInfo || {})

  // 개인정보 관리
  const privacyInfo = computed(() => shopInfo.value?.privacyInfo || {})

  // 저작권 문구
  const copyrightText = computed(() => {
    if (shopInfo.value?.copyrightText) return shopInfo.value.copyrightText
    const year = new Date().getFullYear()
    return `© ${year} ${shopName.value || 'Shop'}. All rights reserved.`
  })

  // SEO 정보
  const seoInfo = computed(() => shopInfo.value?.seoInfo || {})

  // SNS 정보 (배열 또는 객체 형태 모두 지원)
  const snsInfo = computed(() => {
    const info = shopInfo.value?.snsInfo
    if (!info) return []
    // 배열 형태: [{ type: 'blog', url: '...' }]
    if (Array.isArray(info)) return info
    // 객체 형태: { blog: 'url', youtube: 'url' } - 그대로 반환
    if (typeof info === 'object') return info
    return []
  })

  // 테마
  const theme = computed(() => shopInfo.value?.theme || 'green')

  // 헤더 메뉴
  const headerMenu = computed(() => shopInfo.value?.headerMenu || [])

  // 메인 섹션 목록 (sortOrder로 정렬, isActive 없으면 활성화로 간주)
  const sections = computed(() => {
    const sectionList = shopInfo.value?.sections || []
    return [...sectionList]
      .filter(s => s.isActive !== false) // isActive가 명시적으로 false가 아니면 포함
      .sort((a, b) => a.sortOrder - b.sortOrder)
  })

  // 배송 정책
  const shippingPolicy = computed(() => shopInfo.value?.shippingPolicy || {})

  // 무료배송 기준 금액
  const freeShippingAmount = computed(() => shippingPolicy.value?.freeShippingAmount || 0)

  // 기본 배송비
  const baseShippingFee = computed(() => shippingPolicy.value?.baseShippingFee || 0)

  return {
    // 상태
    shopInfo,
    isLoaded,
    pending,
    error,
    categories,

    // 메서드
    fetchShopInfo,
    fetchCategories,
    refresh,

    // Getters
    shopName,
    shopNameEn,
    logoUrl,
    faviconUrl,
    businessInfo,
    customerServiceInfo,
    privacyInfo,
    copyrightText,
    seoInfo,
    snsInfo,
    theme,
    headerMenu,
    sections,
    shippingPolicy,
    freeShippingAmount,
    baseShippingFee,
    categoryItems
  }
}
