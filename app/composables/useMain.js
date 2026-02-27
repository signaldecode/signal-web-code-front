/**
 * 메인 페이지 배너 API 호출 composable
 * GET /main/banners - 배너 조회
 *
 * NOTE: 상품/카테고리 데이터는 useSections.js로 이전됨
 */
export const useMain = () => {
  const { useApiData } = useApi()

  const { data: bannerResponse, pending: bannerPending, refresh: refreshBanners } = useApiData(
    'main-banners',
    '/main/banners',
    {},
    { server: false }
  )

  // 배너 로딩 상태 (SSR에서도 스켈레톤 표시를 위해)
  const bannerLoaded = computed(() => {
    return bannerResponse.value !== null && bannerResponse.value !== undefined
  })

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

  // 배너 타입별 데이터 (HERO, SLIDE, HALF, FULL)
  const heroBanners = computed(() => {
    return bannerResponse.value?.data?.HERO?.map(transformBanner) || []
  })

  const slideBanners = computed(() => {
    return bannerResponse.value?.data?.SLIDE?.map(transformBanner) || []
  })

  const halfBanners = computed(() => {
    return bannerResponse.value?.data?.HALF?.map(transformBanner) || []
  })

  const fullBanners = computed(() => {
    return bannerResponse.value?.data?.FULL?.map(transformBanner) || []
  })

  return {
    // 상태
    bannerPending,
    bannerLoaded,
    refreshBanners,

    // 변환된 배너 데이터
    heroBanners,
    slideBanners,
    halfBanners,
    fullBanners
  }
}
