<script setup>
import mainData from '~/data/main.json'

const props = defineProps({
  logo: {
    type: Object,
    required: true
  },
  nav: {
    type: Array,
    required: true
  },
  navAriaLabel: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'dark'].includes(v)
  }
})

const emit = defineEmits(['menuClick', 'searchClick', 'userClick', 'cartClick'])

const router = useRouter()
const authStore = useAuthStore()
const { post } = useApi()
const cart = useCart()
const { logoUrl, snsInfo, categoryItems } = useShopInfo()

// 장바구니 수량
const cartCount = computed(() => cart.count.value)

// SNS 링크에서 블로그 URL 추출
const blogUrl = computed(() => {
  const info = snsInfo.value
  if (!info) return ''
  if (Array.isArray(info)) {
    const blogLink = info.find(sns => sns.type?.toLowerCase() === 'blog')
    return blogLink?.url || blogLink?.href || ''
  }
  if (typeof info === 'object') return info.blog || ''
  return ''
})

// 로고 이미지
const logoSrc = computed(() => logoUrl.value || '')

const isScrolled = ref(false)
const isSearchOpen = ref(false)
const isMobileNavOpen = ref(false)
const isCategoryOpen = ref(false)
const searchQuery = ref('')
const categoryRef = ref(null)

// 스크롤 상태
const showDarkStyle = computed(() => {
  return props.variant === 'dark' || isScrolled.value || isSearchOpen.value || isMobileNavOpen.value
})

let scrollTicking = false
const handleScroll = () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      isScrolled.value = window.scrollY > 50
      scrollTicking = false
    })
    scrollTicking = true
  }
}

const openSearch = () => {
  isSearchOpen.value = true
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

// 카테고리 드롭다운 (데스크톱) / 사이드 내비 (모바일)
const toggleCategory = () => {
  if (window.innerWidth >= 768) {
    isCategoryOpen.value = !isCategoryOpen.value
    isMobileNavOpen.value = false
  } else {
    toggleMobileNav()
    isCategoryOpen.value = false
  }
}

const closeCategory = () => {
  isCategoryOpen.value = false
}

// 모바일 내비게이션
const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
  if (isMobileNavOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileNav = () => {
  isMobileNavOpen.value = false
  document.body.style.overflow = ''
}

const handleLogout = async () => {
  try {
    await post('/auth/logout')
  } catch {
    // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리
  } finally {
    authStore.logout()
    router.push('/login')
  }
}

// 외부 클릭 시 카테고리 드롭다운 닫기
const handleClickOutside = (e) => {
  if (categoryRef.value && !categoryRef.value.contains(e.target)) {
    closeCategory()
  }
}

const handleCartClick = () => {
  emit('cartClick')
  router.push('/cart')
}

const handleSearchSubmit = (query) => {
  if (query.trim()) {
    router.push({ path: '/search', query: { q: query.trim() } })
    closeSearch()
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isSearchOpen.value) closeSearch()
    if (isCategoryOpen.value) closeCategory()
    if (isMobileNavOpen.value) closeMobileNav()
  }
}

const route = useRoute()
watch(() => route.fullPath, () => {
  closeMobileNav()
  closeCategory()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<template>
  <header :class="['header', { 'header--scrolled': showDarkStyle }]">
    <!-- Row 1: 로고 | 검색 | 회원가입 | 로그인 | 장바구니 -->
    <div class="header__row-1">
      <div class="header__row-1-inner">
        <NuxtLink to="/" class="header__logo" @click="closeMobileNav">
          <NuxtImg v-if="logoSrc" :src="logoSrc" :alt="logo.alt" class="header__logo-img" preload />
        </NuxtLink>

        <!-- 검색바 (데스크톱 중앙) -->
        <div class="header__search-center">
          <BaseSearchInput
            v-model="searchQuery"
            :placeholder="logo.searchPlaceholder"
            @submit="handleSearchSubmit"
          />
        </div>

        <!-- 유저 액션 (데스크톱) -->
        <div class="header__user-actions">
          <ClientOnly>
            <template v-if="authStore.isLoggedIn">
              <NuxtLink to="/mypage" class="header__user-link">{{ logo.userMenu?.mypage }}</NuxtLink>
              <button type="button" class="header__user-link header__user-link--btn" @click="handleLogout">{{ logo.userMenu?.logout }}</button>
            </template>
            <template v-else>
              <NuxtLink to="/signup" class="header__user-link">{{ logo.signupLabel }}</NuxtLink>
              <NuxtLink to="/login" class="header__user-link">{{ logo.loginLabel }}</NuxtLink>
            </template>
          </ClientOnly>
          <button
            type="button"
            class="header__action-btn"
            :aria-label="logo.cartLabel"
            @click="handleCartClick"
          >
            <IconCart size="md" :count="cartCount" decorative />
          </button>
        </div>

        <!-- 모바일 액션 -->
        <div class="header__mobile-actions">
          <button
            type="button"
            class="header__search-mobile-btn"
            :aria-label="logo.searchLabel"
            @click="openSearch"
          >
            <IconSearch size="md" decorative />
          </button>
          <button
            type="button"
            class="header__action-btn"
            :aria-label="logo.cartLabel"
            @click="handleCartClick"
          >
            <IconCart size="md" :count="cartCount" decorative />
          </button>
        </div>
      </div>
    </div>

    <!-- Row 2: ☰ 카테고리 | 네비게이션 | 우측 유틸 링크 -->
    <div class="header__row-2" ref="categoryRef">
      <div class="header__row-2-inner">
        <!-- 좌측: 카테고리 + 네비 -->
        <div class="header__row-2-left">
          <button
            type="button"
            class="header__category-btn"
            :aria-label="logo.menuLabel"
            :aria-expanded="isCategoryOpen || isMobileNavOpen"
            @click="toggleCategory"
          >
            <IconMenu v-if="!isCategoryOpen && !isMobileNavOpen" size="sm" decorative />
            <IconClose v-else size="sm" decorative />
            <span class="header__category-label">{{ logo.menuLabel }}</span>
          </button>

          <nav class="header__nav" :aria-label="navAriaLabel">
            <ul class="header__nav-list">
              <li
                v-for="item in nav"
                :key="item.href"
                class="header__nav-item"
              >
                <NuxtLink :to="item.href" class="header__nav-link">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 우측: 고객센터 / 블로그 -->
        <div class="header__row-2-right">
          <NuxtLink to="/support" class="header__util-link">고객센터</NuxtLink>
          <a
            v-if="blogUrl"
            :href="blogUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="header__util-link"
          >블로그</a>
        </div>
      </div>

      <!-- 데스크톱 카테고리 드롭다운 패널 -->
      <Transition name="dropdown">
        <div v-if="isCategoryOpen" class="header__category-dropdown">
          <div class="header__category-dropdown-inner">
            <ul class="header__category-list">
              <li
                v-for="cat in categoryItems"
                :key="cat.id"
                class="header__category-item"
              >
                <NuxtLink
                  :to="cat.href"
                  class="header__category-link"
                  @click="closeCategory"
                >
                  {{ cat.label }}
                </NuxtLink>
                <!-- 하위 카테고리 -->
                <ul v-if="cat.children?.length" class="header__subcategory-list">
                  <li
                    v-for="child in cat.children"
                    :key="child.id"
                    class="header__subcategory-item"
                  >
                    <NuxtLink
                      :to="child.href"
                      class="header__subcategory-link"
                      @click="closeCategory"
                    >
                      {{ child.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 모바일 검색 팝업 -->
    <Teleport to="body">
      <Transition name="search-popup">
        <div v-if="isSearchOpen" class="header__search-mobile">
          <div class="header__search-mobile-inner">
            <BaseSearchInput
              v-model="searchQuery"
              :placeholder="logo.searchPlaceholder"
              :close-label="logo.searchCloseLabel"
              @close="closeSearch"
              @submit="handleSearchSubmit"
            />
          </div>
          <div class="header__search-mobile-backdrop" @click="closeSearch"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- 모바일 네비게이션 (사이드 드로어) -->
    <Teleport to="body">
      <Transition name="mobile-nav">
        <div v-if="isMobileNavOpen" class="mobile-nav">
          <div class="mobile-nav__backdrop" @click="closeMobileNav" />
          <nav class="mobile-nav__content" :aria-label="navAriaLabel">
            <!-- 유저 영역 (상단) -->
            <div class="mobile-nav__user">
              <ClientOnly>
                <template v-if="authStore.isLoggedIn">
                  <NuxtLink to="/mypage" class="mobile-nav__user-link" @click="closeMobileNav">
                    {{ logo.userMenu?.mypage }}
                  </NuxtLink>
                  <button type="button" class="mobile-nav__user-link mobile-nav__user-link--btn" @click="handleLogout">
                    {{ logo.userMenu?.logout }}
                  </button>
                </template>
                <template v-else>
                  <NuxtLink to="/login" class="mobile-nav__user-primary" @click="closeMobileNav">
                    {{ logo.loginLabel }}
                  </NuxtLink>
                  <NuxtLink to="/signup" class="mobile-nav__user-link" @click="closeMobileNav">
                    {{ logo.signupLabel }}
                  </NuxtLink>
                </template>
              </ClientOnly>
            </div>

            <!-- 카테고리 목록 -->
            <p class="mobile-nav__section-title">카테고리</p>
            <ul class="mobile-nav__list">
              <li v-for="cat in categoryItems" :key="cat.id" class="mobile-nav__item">
                <NuxtLink :to="cat.href" class="mobile-nav__link" @click="closeMobileNav">
                  {{ cat.label }}
                </NuxtLink>
              </li>
            </ul>

            <!-- 일반 네비게이션 -->
            <p class="mobile-nav__section-title">메뉴</p>
            <ul class="mobile-nav__list">
              <li v-for="item in nav" :key="item.href" class="mobile-nav__item">
                <NuxtLink :to="item.href" class="mobile-nav__link" @click="closeMobileNav">
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>

            <!-- 유틸 링크 (하단) -->
            <div class="mobile-nav__util">
              <NuxtLink to="/support" class="mobile-nav__util-link" @click="closeMobileNav">고객센터</NuxtLink>
              <a
                v-if="blogUrl"
                :href="blogUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mobile-nav__util-link"
              >블로그</a>
            </div>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
