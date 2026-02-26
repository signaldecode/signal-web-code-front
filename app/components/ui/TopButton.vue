<script setup>
const props = defineProps({
  showAt: {
    type: Number,
    default: 300
  },
  ariaLabel: {
    type: String,
    default: '맨 위로 이동'
  }
})

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > props.showAt
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="top-button">
    <button
      v-show="isVisible"
      type="button"
      class="top-button"
      :aria-label="ariaLabel"
      @click="scrollToTop"
    >
      <IconArrow direction="up" size="md" />
    </button>
  </Transition>
</template>
