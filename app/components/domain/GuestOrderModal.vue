<script setup>
import cartData from '~/data/cart.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'login'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleLogin = () => {
  emit('login')
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="cartData.guestModal.title"
    size="small"
  >
    <div class="guest-order-modal">
      <p class="guest-order-modal__message">{{ cartData.guestModal.message }}</p>
      <ul class="guest-order-modal__benefits">
        <li
          v-for="(benefit, idx) in cartData.guestModal.benefits"
          :key="idx"
          class="guest-order-modal__benefit"
        >
          {{ benefit }}
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="guest-order-modal__actions">
        <BaseButton
          :label="cartData.guestModal.loginButton"
          variant="bg"
          color="green"
          size="small"
          full-width
          @click="handleLogin"
        />
      </div>
    </template>
  </BaseModal>
</template>
