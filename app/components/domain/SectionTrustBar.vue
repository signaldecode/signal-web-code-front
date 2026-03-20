<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const sectionRef = ref(null)
const hasAnimated = ref(false)
const animatedValues = ref(props.data.items.map(() => 0))

const DURATION = 1500

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

const animateCounters = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const startTime = performance.now()

  const update = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / DURATION, 1)
    const easedProgress = easeOutCubic(progress)

    props.data.items.forEach((item, i) => {
      if (item.displayText) {
        animatedValues.value[i] = item.value
        return
      }
      const target = item.value
      if (Number.isInteger(target)) {
        animatedValues.value[i] = Math.round(target * easedProgress)
      } else {
        animatedValues.value[i] = parseFloat((target * easedProgress).toFixed(1))
      }
    })

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

const iconMap = {
  template: 'M4 5a1 1 0 0 1 1-1h6v8H4V5zm0 9h7v6H5a1 1 0 0 1-1-1v-5zm9-10h6a1 1 0 0 1 1 1v7h-7V4zm0 10h7v5a1 1 0 0 1-1 1h-6v-6z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  update: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  shield: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14l-4-4 1.41-1.41L11 13.17l5.59-5.59L18 9l-7 7z'
}

onMounted(() => {
  if (!sectionRef.value) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateCounters()
        observer.disconnect()
      }
    },
    { threshold: 0.5 }
  )

  observer.observe(sectionRef.value)

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <section ref="sectionRef" class="section-trust-bar">
    <div class="section-trust-bar__inner">
      <div
        v-for="(item, i) in data.items"
        :key="i"
        class="section-trust-bar__item"
      >
        <svg
          class="section-trust-bar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path :d="iconMap[item.icon]" />
        </svg>
        <span class="section-trust-bar__value">
          {{ item.displayText || animatedValues[i] }}{{ item.suffix }}
        </span>
        <span class="section-trust-bar__label">{{ item.label }}</span>
      </div>
    </div>
  </section>
</template>
