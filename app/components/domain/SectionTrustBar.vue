<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="section-trust-bar" :aria-label="data.ariaLabel">
    <div class="section-trust-bar__inner">
      <dl class="section-trust-bar__list">
        <div
          v-for="(item, index) in data.items"
          :key="index"
          class="section-trust-bar__item"
        >
          <dt class="section-trust-bar__value">
            {{ item.value }}
            <span v-if="item.suffix" class="section-trust-bar__suffix">{{ item.suffix }}</span>
          </dt>
          <dd class="section-trust-bar__label">{{ item.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
