<script setup>
import popupData from '~/data/popup.json'

const props = defineProps({
  popups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss'])

const labels = popupData.center

// 안전한 배열 참조
const safePopups = computed(() => props.popups || [])

// 팝업 열릴 때 body 스크롤 잠금
watch(
  () => safePopups.value.length > 0,
  (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

// 컴포넌트 언마운트 시 스크롤 복원
onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

const handleHide = (popup) => {
  if (!popup) return
  emit('dismiss', popup.id, getHideType(popup))
}

const handleClose = (popup) => {
  if (!popup) return
  emit('dismiss', popup.id, 'close')
}

const handleImageClick = (popup) => {
  if (!popup?.linkUrl) return
  emit('dismiss', popup.id, 'close')
  window.open(popup.linkUrl, popup.linkTarget || '_blank')
}

const getHideType = (popup) => {
  return (popup.closeOption || 'TODAY').toUpperCase()
}

const hideLabel = (popup) => {
  if (getHideType(popup) === 'WEEK') return labels.closeWeek
  return labels.closeDay
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-center">
      <div
        v-if="safePopups.length"
        class="popup-center"
        role="dialog"
        aria-modal="true"
        :aria-label="safePopups[0].name"
      >
        <div class="popup-center__backdrop" />
        <div class="popup-center__container">
          <div class="popup-center__body">
            <a
              v-if="safePopups[0].linkUrl"
              :href="safePopups[0].linkUrl"
              :target="safePopups[0].linkTarget || '_blank'"
              rel="noopener noreferrer"
              class="popup-center__link"
              @click.prevent="handleImageClick(safePopups[0])"
            >
              <NuxtImg
                :src="safePopups[0].image"
                :alt="safePopups[0].name"
                class="popup-center__image"
                format="webp"
                width="480"
                quality="80"
                loading="eager"
              />
            </a>
            <NuxtImg
              v-else
              :src="safePopups[0].image"
              :alt="safePopups[0].name"
              class="popup-center__image"
              format="webp"
              loading="eager"
            />
          </div>
          <div class="popup-center__footer">
            <button
              type="button"
              class="popup-center__hide"
              @click="handleHide(safePopups[0])"
            >
              {{ hideLabel(safePopups[0]) }}
            </button>
            <button
              type="button"
              class="popup-center__close"
              @click="handleClose(safePopups[0])"
            >
              {{ labels.close }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
