<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  confirmLabel: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'error', 'warning'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const confirmText = computed(() => props.confirmLabel || common.confirm)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleConfirm = () => {
  isOpen.value = false
  emit('confirm')
}

const handleClose = () => {
  isOpen.value = false
  emit('confirm')
}

const iconByVariant = computed(() => {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  }
  return icons[props.variant] || 'info'
})
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="title"
    size="small"
    :show-close="false"
    :close-on-backdrop="false"
    @close="handleClose"
  >
    <div class="alert-modal__content">
      <div class="alert-modal__icon" :class="`alert-modal__icon--${variant}`">
        <svg v-if="variant === 'success'" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2" />
          <path d="M15 24l6 6 12-12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else-if="variant === 'error'" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2" />
          <path d="M17 17l14 14M31 17L17 31" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <svg v-else-if="variant === 'warning'" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 8L4 40h40L24 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <path d="M24 20v8M24 32v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <svg v-else width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="2" />
          <path d="M24 16v10M24 30v2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
      <p class="alert-modal__message">{{ message }}</p>
    </div>
    <template #footer>
      <BaseButton variant="bg" color="black" size="big" @click="handleConfirm">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
