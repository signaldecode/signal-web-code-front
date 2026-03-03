<script setup>
import mainData from '~/data/main.json'
import inquiryData from '~/data/inquiry.json'

useHead({ title: inquiryData.seo.title })
useSeoMeta({
  title: inquiryData.seo.title,
  description: inquiryData.seo.description
})

const router = useRouter()
const { get, post } = useApi()

const isSubmitting = ref(false)

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

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePhone = (phone) => {
  const re = /^[0-9]{10,11}$/
  return re.test(phone.replace(/-/g, ''))
}

const clearErrors = () => {
  errors.service = ''
  errors.category = ''
  errors.name = ''
  errors.phone = ''
  errors.company = ''
  errors.email = ''
  errors.content = ''
}

const validate = () => {
  clearErrors()
  let isValid = true

  if (!form.service) {
    errors.service = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!form.category) {
    errors.category = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!form.name.trim()) {
    errors.name = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!form.phone.trim()) {
    errors.phone = inquiryData.messages.requiredAlert
    isValid = false
  } else if (!validatePhone(form.phone)) {
    errors.phone = inquiryData.messages.invalidPhone
    isValid = false
  }

  if (!form.company.trim()) {
    errors.company = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = inquiryData.messages.requiredAlert
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = inquiryData.messages.invalidEmail
    isValid = false
  }

  if (!form.content.trim()) {
    errors.content = inquiryData.messages.requiredAlert
    isValid = false
  }

  if (!privacyAgreed.value) {
    alert(inquiryData.messages.privacyAlert)
    isValid = false
  }

  return isValid
}

const handleFileError = (message) => {
  alert(message)
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append('service', form.service)
    formData.append('category', form.category)
    formData.append('name', form.name)
    formData.append('phone', form.phone.replace(/-/g, ''))
    formData.append('company', form.company)
    formData.append('email', form.email)
    formData.append('referenceUrl', form.referenceUrl)
    formData.append('content', form.content)
    formData.append('privacyAgreed', privacyAgreed.value)

    if (privacyPolicy.value?.id) {
      formData.append('policyId', privacyPolicy.value.id)
    }

    form.files.forEach((item) => {
      formData.append('files', item.file)
    })

    const result = await post('/inquiries', formData)

    if (result.success) {
      alert(inquiryData.messages.submitSuccess)
      router.push('/')
    } else {
      alert(result.message || inquiryData.messages.submitError)
    }
  } catch (error) {
    console.error('문의 접수 실패:', error)
    alert(inquiryData.messages.submitError)
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
                :options="inquiryData.fields.category.options"
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
              v-model="form.phone"
              type="tel"
              inputmode="numeric"
              :label="inquiryData.fields.phone.label"
              :placeholder="inquiryData.fields.phone.placeholder"
              :required="inquiryData.fields.phone.required"
              :error="errors.phone"
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
              v-model="form.email"
              type="email"
              :label="inquiryData.fields.email.label"
              :placeholder="inquiryData.fields.email.placeholder"
              :required="inquiryData.fields.email.required"
              :error="errors.email"
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
                :max-size-m-b="10"
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
            >
              {{ inquiryData.buttons.submit }}
            </BaseButton>
          </div>
        </form>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
