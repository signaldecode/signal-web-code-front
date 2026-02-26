<script setup>
defineProps({
  faqs: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <section id="section-faq" class="product-detail-faq">
    <div class="product-detail-faq__header">
      <h2 class="product-detail-faq__title">{{ labels.title }}</h2>
    </div>
    <FaqList
      :faqs="faqs"
      :loading="loading"
      :empty-message="labels.emptyMessage"
    />
  </section>
</template>
