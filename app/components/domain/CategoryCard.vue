<script setup>
const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="category-card">
    <NuxtLink :to="category.href" class="category-card__link">
      <div class="category-card__icon-wrap">
        <NuxtImg
          v-if="category.image"
          :src="category.image"
          :alt="category.imageAlt || category.label"
          class="category-card__icon"
          loading="lazy"
          format="webp"
          quality="80"
        />
        <span v-else class="category-card__icon-fallback">
          {{ category.label?.charAt(0) }}
        </span>
      </div>
      <p class="category-card__label">{{ category.label }}</p>
    </NuxtLink>
  </article>
</template>
