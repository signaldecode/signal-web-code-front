<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})

const email = ref('')
const isSubmitted = ref(false)

const handleSubmit = () => {
  if (!email.value) return
  isSubmitted.value = true
}
</script>

<template>
  <section class="section-newsletter">
    <div class="section-newsletter__inner">
      <div class="section-newsletter__content">
        <h2 class="section-newsletter__title">{{ data.title }}</h2>
        <p class="section-newsletter__subtitle">{{ data.subtitle }}</p>
        <form
          v-if="!isSubmitted"
          class="section-newsletter__form"
          @submit.prevent="handleSubmit"
        >
          <BaseInput
            v-model="email"
            type="email"
            :placeholder="data.placeholder"
            :aria-label="data.inputAriaLabel"
            class="section-newsletter__input"
          />
          <BaseButton
            type="submit"
            variant="bg"
            color="black"
            class="section-newsletter__submit"
          >
            {{ data.buttonLabel }}
          </BaseButton>
        </form>
        <p v-else class="section-newsletter__success">
          {{ data.successMessage }}
        </p>
        <p class="section-newsletter__disclaimer">{{ data.disclaimer }}</p>
      </div>
    </div>
  </section>
</template>
