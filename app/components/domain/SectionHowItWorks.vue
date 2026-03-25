<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="section-how-it-works">
    <div class="section-how-it-works__inner">
      <div class="section-how-it-works__header">
        <h2 class="section-how-it-works__title">{{ data.title }}</h2>
        <p class="section-how-it-works__subtitle">{{ data.subtitle }}</p>
      </div>
      <ol class="section-how-it-works__steps">
        <li
          v-for="(step, index) in data.steps"
          :key="index"
          class="section-how-it-works__step"
        >
          <span class="section-how-it-works__step-number">{{ step.step }}</span>
          <h3 class="section-how-it-works__step-title">{{ step.title }}</h3>
          <p class="section-how-it-works__step-description">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
