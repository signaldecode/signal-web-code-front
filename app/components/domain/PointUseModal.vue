<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  labels: {
    type: Object,
    required: true
  },
  availablePoint: {
    type: Number,
    default: 0
  },
  currentPoint: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 입력된 포인트
const inputPoint = ref(props.currentPoint || 0)

// 최대 사용 체크박스
const useMaxPoint = ref(false)

// 인풋에 표시할 값 (포맷팅)
const displayPoint = computed(() => {
  return inputPoint.value > 0 ? String(inputPoint.value) : ''
})

// 모달 열릴 때 초기화
watch(isOpen, (val) => {
  if (val) {
    inputPoint.value = props.currentPoint || 0
    useMaxPoint.value = props.currentPoint > 0 && props.currentPoint === props.availablePoint
  }
})

// 최대 사용 체크박스 변경 시
watch(useMaxPoint, (val) => {
  if (val) {
    inputPoint.value = props.availablePoint
  }
})

// 인풋 값 변경 시 - 초과 시 최대값으로 자동 설정 (DOM 값도 강제 변경)
const handleInputChange = (e) => {
  const val = e.target.value
  const numVal = parseInt(String(val).replace(/[^0-9]/g, '')) || 0

  // 사용 가능 적립금 초과 시 최대값으로 설정
  if (numVal > props.availablePoint) {
    inputPoint.value = props.availablePoint
    // DOM 인풋 값도 직접 변경하여 초과 입력 방지
    e.target.value = String(props.availablePoint)
  } else {
    inputPoint.value = numVal
  }

  useMaxPoint.value = inputPoint.value === props.availablePoint
}

// 확인 버튼
const handleConfirm = () => {
  emit('confirm', inputPoint.value)
  isOpen.value = false
}

// 취소 버튼
const handleCancel = () => {
  isOpen.value = false
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="labels.title"
    size="small"
  >
    <div class="point-use-modal">
      <!-- 사용 가능 적립금 -->
      <div class="point-use-modal__available">
        <span class="point-use-modal__available-label">{{ labels.available }}</span>
        <strong class="point-use-modal__available-value">
          {{ availablePoint.toLocaleString() }}{{ labels.unit }}
        </strong>
      </div>

      <!-- 적립금 입력 -->
      <div class="point-use-modal__input-area">
        <div class="base-input">
          <input
            :value="displayPoint"
            type="text"
            inputmode="numeric"
            :placeholder="labels.placeholder"
            class="base-input__field"
            @input="handleInputChange"
          >
        </div>
      </div>

      <!-- 최대 사용 체크박스 -->
      <label class="point-use-modal__checkbox">
        <input
          v-model="useMaxPoint"
          type="checkbox"
          class="point-use-modal__checkbox-input"
        >
        <span class="point-use-modal__checkbox-label">{{ labels.useMax }}</span>
      </label>
    </div>

    <template #footer>
      <div class="point-use-modal__buttons">
        <BaseButton
          :label="labels.cancel"
          variant="line"
          color="black"
          size="small"
          @click="handleCancel"
        />
        <BaseButton
          :label="labels.confirm"
          variant="bg"
          color="green"
          size="small"
          @click="handleConfirm"
        />
      </div>
    </template>
  </BaseModal>
</template>
