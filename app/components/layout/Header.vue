<script setup>
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
const { logoUrl, isLoaded: shopInfoLoaded } = useShopInfo()

// 로고 이미지 (API 로딩 완료 후에만 표시, fallback 없음)
const logoSrc = computed(() => logoUrl.value || '')

const isScrolled = ref(false)
const isSearchOpen = ref(false)
const isUserMenuOpen = ref(false)
const isMobileNavOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const userMenuRef = ref(null)

// dark variant, 스크롤, 검색창 열림 시 흰색 배경
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
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

// 모바일 내비게이션
const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value
  // 메뉴 열릴 때 body 스크롤 방지
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

const handleUserClick = () => {
  emit('userClick')
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const goToMypage = () => {
  closeUserMenu()
  router.push('/mypage')
}

const handleLogout = async () => {
  try {
    await post('/auth/logout')
  } catch {
    // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리
  } finally {
    authStore.logout()
    closeUserMenu()
    router.push('/login')
  }
}

// 외부 클릭 시 유저 메뉴 닫기
const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    closeUserMenu()
  }
}

const handleCartClick = () => {
  emit('cartClick')
  router.push('/cart')
}

const handleSearchSubmit = (query) => {
  if (query.trim()) {
    router.push({
      path: '/search',
      query: { q: query.trim() }
    })
    closeSearch()
  }
}

// ESC 키로 검색창/모바일 메뉴 닫기
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isSearchOpen.value) closeSearch()
    if (isMobileNavOpen.value) closeMobileNav()
  }
}

// 라우트 변경 시 모바일 내비 닫기
const route = useRoute()
watch(() => route.fullPath, () => {
  if (isMobileNavOpen.value) {
    closeMobileNav()
  }
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
  // 모바일 메뉴 열려있으면 정리
  document.body.style.overflow = ''
})
</script>

<template>
  <header :class="['header', { 'header--scrolled': showDarkStyle }]">
    <!-- Top Bar: 고객센터, 블로그, 마이페이지, 로그인/로그아웃 -->
    <div class="header__top-bar">
      <div class="header__top-bar-inner">
        <nav class="header__top-nav">
          <NuxtLink to="/support" class="header__top-link">고객센터</NuxtLink>
          <NuxtLink to="/blog" class="header__top-link">블로그</NuxtLink>
          <ClientOnly>
            <template v-if="authStore.isLoggedIn">
              <NuxtLink to="/mypage" class="header__top-link">마이페이지</NuxtLink>
              <button type="button" class="header__top-link header__top-link--btn" @click="handleLogout">로그아웃</button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="header__top-link">로그인</NuxtLink>
            </template>
          </ClientOnly>
        </nav>
      </div>
    </div>

    <!-- Main Header -->
    <div class="header__main">
      <div class="header__inner">
        <!-- Left: Menu (mobile) + Logo + Nav -->
        <div class="header__left">
          <button
            type="button"
            class="header__menu-btn"
            :aria-label="logo.menuLabel"
            :aria-expanded="isMobileNavOpen"
            @click="toggleMobileNav"
          >
            <IconMenu v-if="!isMobileNavOpen" size="md" :label="logo.menuLabel" decorative />
            <IconClose v-else size="md" decorative />
          </button>

          <NuxtLink to="/" class="header__logo" @click="closeMobileNav">
            <NuxtImg v-if="logoSrc" :src="logoSrc" :alt="logo.alt" class="header__logo-img" preload />
          </NuxtLink>

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

        <!-- Right: Search + Cart -->
        <div class="header__actions">
          <!-- Desktop Search (항상 활성화) -->
          <div class="header__search-desktop">
            <BaseSearchInput
              v-model="searchQuery"
              :placeholder="logo.searchPlaceholder"
              @submit="handleSearchSubmit"
            />
          </div>

          <!-- Mobile Search Toggle Button -->
          <button
            type="button"
            class="header__search-mobile-btn"
            :aria-label="logo.searchLabel"
            @click="openSearch"
          >
            <IconSearch size="md" decorative />
          </button>

          <!-- Cart -->
          <button
            type="button"
            class="header__action-btn"
            :aria-label="logo.cartLabel"
            @click="handleCartClick"
          >
            <IconCart size="md" :count="cart.count.value" decorative />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Search Popup (full screen) -->
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

    <!-- Mobile Navigation Menu (full screen) -->
    <Teleport to="body">
      <Transition name="mobile-nav">
        <div v-if="isMobileNavOpen" class="mobile-nav">
          <div class="mobile-nav__backdrop" @click="closeMobileNav" />
          <nav class="mobile-nav__content" :aria-label="navAriaLabel">
            <ul class="mobile-nav__list">
              <li v-for="item in nav" :key="item.href" class="mobile-nav__item">
                <NuxtLink
                  :to="item.href"
                  class="mobile-nav__link"
                  @click="closeMobileNav"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
