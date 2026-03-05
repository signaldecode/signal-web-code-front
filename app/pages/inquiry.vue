<script setup>
import mainData from '~/data/main.json'
import inquiryData from '~/data/inquiry.json'
import { validate, validateRequired, formatPhoneNumber } from '~/utils/validators'

useHead({ title: inquiryData.seo.title })
useSeoMeta({
  title: inquiryData.seo.title,
  description: inquiryData.seo.description
})

const router = useRouter()
const { post } = useApi()
const { categories, fetchCategories } = useShopInfo()

const isSubmitting = ref(false)

// 모달 상태
const alertModal = reactive({
  show: false,
  title: '',
  message: '',
  variant: 'info',
  onConfirm: null
})

const showAlert = (message, variant = 'info', title = '', onConfirm = null) => {
  alertModal.message = message
  alertModal.variant = variant
  alertModal.title = title || (variant === 'success' ? inquiryData.modal.successTitle :
                              variant === 'error' ? inquiryData.modal.errorTitle :
                              inquiryData.modal.warningTitle)
  alertModal.onConfirm = onConfirm
  alertModal.show = true
}

const handleAlertConfirm = () => {
  alertModal.show = false
  if (alertModal.onConfirm) {
    alertModal.onConfirm()
  }
}

const categoryOptions = computed(() => [
  ...(categories.value || []).map(cat => ({
    label: cat.name,
    value: cat.name
  })),
  { label: '기타', value: '기타' }
])

onMounted(() => {
  fetchCategories()
})

const form = reactive({
  service: '',
  category: '',
  name: '',
  phone: '',
  company: '',
  email: '',
  referenceUrl: '',
  content: '',
  files: []
})

const errors = reactive({
  service: '',
  category: '',
  name: '',
  phone: '',
  company: '',
  email: '',
  content: ''
})

const privacyAgreed = ref(false)
const privacyOpen = ref(false)

const privacyContent = computed(() => inquiryData.privacy.content)

const togglePrivacy = () => {
  privacyOpen.value = !privacyOpen.value
}

// 전화번호 입력 핸들러 (자동 포맷팅 + 유효성 검사)
const handlePhoneInput = (value) => {
  form.phone = formatPhoneNumber(value)
  validatePhone()
}

// 전화번호 유효성 검사
const validatePhone = () => {
  const numbers = form.phone.replace(/[^0-9]/g, '')

  if (!numbers) {
    errors.phone = ''
    return true
  }

  const phoneRegex = /^01[0-9]{8,9}$/
  if (!phoneRegex.test(numbers)) {
    errors.phone = inquiryData.messages.invalidPhone
    return false
  }

  errors.phone = ''
  return true
}

// 이메일 유효성 검사
const validateEmail = () => {
  if (!form.email) {
    errors.email = ''
    return true
  }

  if (!validate('email', form.email)) {
    errors.email = inquiryData.messages.invalidEmail
    return false
  }

  errors.email = ''
  return true
}

// 이메일 입력 핸들러
const handleEmailInput = (value) => {
  form.email = value
  validateEmail()
}

const validateForm = () => {
  let isValid = true

  if (!validateRequired(form.service)) {
    errors.service = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!validateRequired(form.category)) {
    errors.category = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!validateRequired(form.name)) {
    errors.name = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!validateRequired(form.phone)) {
    errors.phone = inquiryData.messages.requiredAlert
    isValid = false
  } else if (!validatePhone()) {
    isValid = false
  }

  if (!validateRequired(form.company)) {
    errors.company = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!validateRequired(form.email)) {
    errors.email = inquiryData.messages.requiredAlert
    isValid = false
  } else if (!validateEmail()) {
    isValid = false
  }

  if (!validateRequired(form.content)) {
    errors.content = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!privacyAgreed.value) {
    showAlert(inquiryData.messages.privacyAlert, 'warning')
    isValid = false
  }

  return isValid
}

const handleFileError = (message) => {
  showAlert(message, 'error')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const formData = new FormData()

    const request = {
      service: form.service,
      category: form.category,
      name: form.name,
      phone: form.phone.replace(/-/g, ''),
      company: form.company,
      email: form.email,
      referenceUrl: form.referenceUrl || '',
      content: form.content
    }

    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))

    form.files.forEach((item) => {
      formData.append('files', item.file)
    })

    await post('/inquiries', formData)

    showAlert(inquiryData.messages.submitSuccess, 'success', '', () => {
      router.push('/')
    })
  } catch (error) {
    console.error('문의 접수 실패:', error)
    const errorMessage = error?.data?.message || error?.message || inquiryData.messages.submitError
    showAlert(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="page-inquiry">
    <main class="inquiry-page">
      <div class="inquiry-page__inner">
        <header class="inquiry-page__header">
          <h1 class="inquiry-page__title">{{ inquiryData.page.title }}</h1>
          <p class="inquiry-page__subtitle">{{ inquiryData.page.subtitle }}</p>
        </header>

        <form
          class="inquiry-form layout-800"
          :aria-label="inquiryData.page.sectionAriaLabel"
          @submit.prevent="handleSubmit"
        >
          <div class="inquiry-form__fields">
            <div class="inquiry-form__field">
              <label class="inquiry-form__label">
                {{ inquiryData.fields.service.label }}
                <span v-if="inquiryData.fields.service.required" class="inquiry-form__required">*</span>
              </label>
              <BaseSelect
                v-model="form.service"
                :options="inquiryData.fields.service.options"
                :placeholder="inquiryData.fields.service.placeholder"
                variant="box"
              />
              <span v-if="errors.service" class="inquiry-form__error">{{ errors.service }}</span>
            </div>

            <div class="inquiry-form__field">
              <label class="inquiry-form__label">
                {{ inquiryData.fields.category.label }}
                <span v-if="inquiryData.fields.category.required" class="inquiry-form__required">*</span>
              </label>
              <BaseSelect
                v-model="form.category"
                :options="categoryOptions"
                :placeholder="inquiryData.fields.category.placeholder"
                variant="box"
              />
              <span v-if="errors.category" class="inquiry-form__error">{{ errors.category }}</span>
            </div>

            <BaseInput
              v-model="form.name"
              type="text"
              :label="inquiryData.fields.name.label"
              :placeholder="inquiryData.fields.name.placeholder"
              :required="inquiryData.fields.name.required"
              :error="errors.name"
            />

            <BaseInput
              :model-value="form.phone"
              type="tel"
              inputmode="numeric"
              :label="inquiryData.fields.phone.label"
              :placeholder="inquiryData.fields.phone.placeholder"
              :required="inquiryData.fields.phone.required"
              :error="errors.phone"
              maxlength="13"
              @update:model-value="handlePhoneInput"
            />

            <BaseInput
              v-model="form.company"
              type="text"
              :label="inquiryData.fields.company.label"
              :placeholder="inquiryData.fields.company.placeholder"
              :required="inquiryData.fields.company.required"
              :error="errors.company"
            />

            <BaseInput
              :model-value="form.email"
              type="email"
              :label="inquiryData.fields.email.label"
              :placeholder="inquiryData.fields.email.placeholder"
              :required="inquiryData.fields.email.required"
              :error="errors.email"
              @update:model-value="handleEmailInput"
            />

            <BaseInput
              v-model="form.referenceUrl"
              type="url"
              :label="inquiryData.fields.referenceUrl.label"
              :placeholder="inquiryData.fields.referenceUrl.placeholder"
              :required="inquiryData.fields.referenceUrl.required"
            />

            <BaseTextarea
              v-model="form.content"
              :label="inquiryData.fields.content.label"
              :placeholder="inquiryData.fields.content.placeholder"
              :required="inquiryData.fields.content.required"
              :rows="6"
              :error="errors.content"
            />

            <div class="inquiry-form__field">
              <label class="inquiry-form__label">{{ inquiryData.fields.files.label }}</label>
              <BaseFileUpload
                v-model="form.files"
                :max-count="5"
                :max-size-m-b="50"
                :placeholder="inquiryData.fields.files.placeholder"
                :help-text="inquiryData.fields.files.helpText"
                @error="handleFileError"
              />
            </div>
          </div>

          <div class="inquiry-form__privacy">
            <div class="inquiry-privacy">
              <div class="inquiry-privacy__head">
                <BaseCheckbox
                  v-model="privacyAgreed"
                  variant="line"
                  size="big"
                >
                  <span class="inquiry-privacy__label">
                    <span class="inquiry-privacy__required">{{ inquiryData.privacy.required }}</span>
                    {{ inquiryData.privacy.checkboxLabel }}
                  </span>
                </BaseCheckbox>
                <button
                  type="button"
                  class="inquiry-privacy__toggle"
                  :aria-expanded="privacyOpen"
                  @click="togglePrivacy"
                >
                  {{ privacyOpen ? inquiryData.privacy.hideDetail : inquiryData.privacy.viewDetail }}
                  <IconArrow :direction="privacyOpen ? 'up' : 'down'" size="sm" />
                </button>
              </div>

              <div v-show="privacyOpen" class="inquiry-privacy__body">
                <div
                  class="inquiry-privacy__content"
                  v-html="privacyContent"
                />
              </div>
            </div>
          </div>

          <div class="inquiry-form__actions">
            <BaseButton
              type="button"
              variant="bg"
              color="light"
              size="big"
              class="inquiry-form__btn"
              @click="handleCancel"
            >
              {{ inquiryData.buttons.cancel }}
            </BaseButton>
            <BaseButton
              type="submit"
              variant="bg"
              color="black"
              size="big"
              class="inquiry-form__btn"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              {{ inquiryData.buttons.submit }}
            </BaseButton>
          </div>
        </form>
      </div>
    </main>

    <Footer :data="mainData.footer" />

    <!-- Alert Modal -->
    <AlertModal
      v-model="alertModal.show"
      :title="alertModal.title"
      :message="alertModal.message"
      :variant="alertModal.variant"
      :confirm-label="inquiryData.modal.confirmButton"
      @confirm="handleAlertConfirm"
    />
  </div>
</template>
