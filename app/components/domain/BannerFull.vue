<script setup>
import mainData from '~/data/main.json'

const props = defineProps({
  banner: {
    type: Object,
    required: true
  }
})

const bannerData = mainData.banners.full
</script>

<template>
  <section v-if="banner" class="banner-full">
    <component
      :is="(banner.href || banner.linkUrl) ? 'a' : 'div'"
      :href="banner.href || banner.linkUrl || undefined"
      :target="banner.linkTarget || '_self'"
      class="banner-full__link"
    >
      <NuxtImg
        :src="banner.imageUrl || banner.image || bannerData.image"
        :alt="banner.title || banner.imageAlt || bannerData.imageAlt"
        class="banner-full__image"
        loading="lazy"
      />
      <div class="banner-full__overlay" />
      <div class="banner-full__content">
        <p v-if="banner.subtitle || bannerData.subtitle" class="banner-full__subtitle">
          {{ banner.subtitle || bannerData.subtitle }}
        </p>
        <h3 class="banner-full__title">
          {{ banner.title || bannerData.title }}
        </h3>
        <span class="banner-full__cta">
          {{ mainData.hero.ctaLabel }} &rarr;
        </span>
      </div>
    </component>
  </section>
</template>
