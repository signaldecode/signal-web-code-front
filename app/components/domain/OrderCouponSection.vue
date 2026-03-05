<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  selectedCoupon: {
    type: Object,
    default: null
  },
  couponDiscount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'openCouponModal', 'openPointModal'])

// 포인트 사용 여부
const hasPointUsed = computed(() => {
  const point = parseInt(props.modelValue.point) || 0
  return point > 0
})

// 포인트 버튼 라벨
const pointButtonLabel = computed(() => {
  return hasPointUsed.value ? props.labels.point.modify : props.labels.point.use
})

const handleOpenCouponModal = () => {
  emit('openCouponModal')
}

const handleOpenPointModal = () => {
  emit('openPointModal')
}
</script>

<template>
  <section class="order-section">
    <header class="order-section__header">
      <h2 class="order-section__title">{{ labels.title }}</h2>
    </header>
    <div class="order-coupon">
      <!-- 쿠폰 선택 버튼 -->
      <div class="order-coupon__row">
        <button
          type="button"
          class="order-coupon__select-btn"
          @click="handleOpenCouponModal"
        >
          <span v-if="selectedCoupon" class="order-coupon__selected">
            <span class="order-coupon__selected-name">{{ selectedCoupon.name }}</span>
            <span class="order-coupon__selected-discount">-{{ couponDiscount.toLocaleString() }}{{ labels.currency }}</span>
          </span>
          <span v-else class="order-coupon__placeholder">{{ labels.coupon.placeholder }}</span>
          <IconArrow direction="right" size="sm" />
        </button>
      </div>

      <!-- 포인트 사용 -->
      <div class="order-coupon__row">
        <div class="order-coupon__input-wrapper">
          <BaseInput
            :model-value="modelValue.point ? `${Number(modelValue.point).toLocaleString()}${labels.point.unit}` : ''"
            type="text"
            :placeholder="labels.point.placeholder"
            :readonly="true"
            :disabled="true"
          />
        </div>
        <BaseButton
          :label="pointButtonLabel"
          variant="line"
          color="black"
          size="big"
          type="button"
          class="order-coupon__apply-btn"
          @click="handleOpenPointModal"
        />
      </div>
    </div>
  </section>
</template>
