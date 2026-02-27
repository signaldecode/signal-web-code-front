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
      <div v-if="category.image" class="category-card__image-wrap">
        <NuxtImg
          :src="category.image"
          :alt="category.imageAlt || category.label"
          class="category-card__image"
          loading="lazy"
          format="webp"
          quality="80"
        />
      </div>
      <p class="category-card__label">{{ category.label }}</p>
    </NuxtLink>
  </article>
</template>
