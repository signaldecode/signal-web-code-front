<script setup>
import uiData from '~/data/ui.json'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const activeIndex = ref(null)
const isMobile = ref(false)
let hoverTimer = null

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    activeIndex.value = null
  }
}

const activate = (index) => {
  if (isMobile.value) return
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    activeIndex.value = index
  }, 80)
}

const deactivate = () => {
  if (isMobile.value) return
  clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    activeIndex.value = null
  }, 300)
}

const toggle = (index) => {
  if (isMobile.value) return
  activeIndex.value = activeIndex.value === index ? null : index
}

const close = () => {
  activeIndex.value = null
}

const handleKeydown = (e, index) => {
  if (isMobile.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    toggle(index)
  }
  if (e.key === 'Escape' && activeIndex.value !== null) {
    close()
  }
}

let resizeTimer = null
const debouncedCheck = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(checkMobile, 150)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', debouncedCheck, { passive: true })
})

onUnmounted(() => {
  clearTimeout(hoverTimer)
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedCheck)
})

const gridStyle = computed(() => {
  const count = props.products.length
  if (activeIndex.value === null || count === 0) {
    return { gridTemplateColumns: `repeat(${count}, 1fr)` }
  }
  const columns = props.products
    .map((_, i) => (i === activeIndex.value ? '4fr' : '1fr'))
    .join(' ')
  return { gridTemplateColumns: columns }
})

const hasDiscount = (product) => {
  return product.originalPrice && product.originalPrice > product.price
}

const discountRate = (product) => {
  if (product.discountRate) return product.discountRate
  if (!hasDiscount(product)) return 0
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

const formattedPrice = (product) => {
  return product.price?.toLocaleString()
}

const displayProducts = computed(() => {
  return props.products.slice(0, 4)
})
</script>

<template>
  <section class="section-showroom">
    <div class="section-showroom__inner">
      <div class="section-showroom__header">
        <div class="section-showroom__titles">
          <h2 class="section-showroom__title">{{ data.title }}</h2>
          <p class="section-showroom__subtitle">{{ data.subtitle }}</p>
        </div>
        <NuxtLink
          v-if="data.viewAllHref"
          :to="data.viewAllHref"
          class="section-showroom__view-all"
        >
          {{ data.viewAllLabel }}
        </NuxtLink>
      </div>

      <!-- 데스크톱: 쇼룸 그리드 -->
      <div
        v-if="!isMobile"
        class="section-showroom__grid"
        :class="{ 'has-active': activeIndex !== null }"
        :style="gridStyle"
      >
        <div
          v-for="(product, i) in displayProducts"
          :key="product.id"
          class="section-showroom__item"
          :class="{ 'is-active': activeIndex === i }"
          role="button"
          tabindex="0"
          :aria-expanded="String(activeIndex === i)"
          :aria-label="product.name"
          @mouseenter="activate(i)"
          @mouseleave="deactivate"
          @click="toggle(i)"
          @keydown="handleKeydown($event, i)"
        >
          <div class="section-showroom__compact">
            <div class="section-showroom__thumb">
              <img
                :src="product.image"
                :alt="product.imageAlt"
                class="section-showroom__thumb-image"
                loading="lazy"
              />
            </div>
            <div class="section-showroom__compact-info">
              <span class="section-showroom__compact-name">{{ product.name }}</span>
              <span class="section-showroom__compact-hint">{{ data.expandHint }}</span>
            </div>
          </div>

          <div class="section-showroom__expanded">
            <div class="section-showroom__expanded-image">
              <img
                :src="product.image"
                :alt="product.imageAlt"
                loading="lazy"
              />
            </div>
            <div class="section-showroom__expanded-info">
              <h3 class="section-showroom__expanded-name">{{ product.name }}</h3>
              <p
                v-if="product.summary"
                class="section-showroom__expanded-summary"
              >
                {{ product.summary }}
              </p>
              <div class="section-showroom__expanded-price">
                <BaseBadge
                  v-if="hasDiscount(product)"
                  :label="`${discountRate(product)}%`"
                  variant="discount"
                  size="product"
                />
                <span class="section-showroom__price-current">
                  {{ formattedPrice(product) }}{{ product.currency }}
                </span>
              </div>
              <BaseRating
                v-if="product.rating"
                :rating="product.rating"
                :review-count="product.reviewCount"
                variant="simple"
                size="md"
              />
              <NuxtLink
                :to="product.href"
                class="section-showroom__cta"
                @click.stop
              >
                {{ data.ctaLabel }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 모바일: 기존 ProductCard 그리드 -->
      <div v-else class="section-showroom__mobile-grid">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>
