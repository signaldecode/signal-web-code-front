<script setup>
import paymentData from '~/data/payment.json'
import mainData from '~/data/main.json'

const route = useRoute()
const { cancelOrder } = useOrder()

useHead({ title: paymentData.fail.seo.title })
useSeoMeta({
  title: paymentData.fail.seo.title,
  description: paymentData.fail.seo.description
})

const errorMessage = computed(() => route.query.message || '')
const orderId = computed(() => route.query.orderId || '')

// 결제 실패 시 주문 취소
onMounted(async () => {
  if (orderId.value) {
    try {
      await cancelOrder(orderId.value)
    } catch (e) {
      console.warn('Failed to cancel order:', e)
    }
  }
  // sessionStorage에 저장된 정보 삭제
  if (import.meta.client) {
    sessionStorage.removeItem('paymentOrder')
    sessionStorage.removeItem('pendingOrderNumber')
  }
})

const goToOrder = () => navigateTo('/order', { replace: true })
const goHome = () => navigateTo('/', { replace: true })
</script>

<template>
  <div class="page-payment-result">
    <main class="payment-result">
      <div class="payment-result__error">
        <div class="payment-result__icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="32" cy="32" r="32" fill="currentColor" />
            <path d="M22 22L42 42M42 22L22 42" stroke="white" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="payment-result__title">{{ paymentData.fail.title }}</h1>
        <p class="payment-result__description">{{ paymentData.fail.description }}</p>
        <p v-if="errorMessage" class="payment-result__reason">
          <span class="payment-result__reason-label">{{ paymentData.fail.errorLabel }}</span>
          {{ errorMessage }}
        </p>
        <div class="payment-result__buttons">
          <BaseButton
            :label="paymentData.fail.retryButton"
            variant="line"
            color="black"
            size="big"
            @click="goToOrder"
          />
          <BaseButton
            :label="paymentData.fail.homeButton"
            variant="bg"
            color="green"
            size="big"
            @click="goHome"
          />
        </div>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
