<script setup>
import orderData from '~/data/order.json'
import mainData from '~/data/main.json'
import { validate } from '~/utils/validators'

const router = useRouter()
const authStore = useAuthStore()
const { warning } = useToast()
const { getOrderItems, clearOrderItems, createOrder, cancelOrder } = useOrder()
const { requestPayment } = usePayments()
const { removeFromCart } = useCart()
const { freeShippingAmount, baseShippingFee } = useShopInfo()

// 로그인 필수 - 비로그인 시 로그인 페이지로 리다이렉트
definePageMeta({
  middleware: ['auth']
})

// SEO
useHead({ title: orderData.seo.title })
useSeoMeta({
  title: orderData.seo.title,
  description: orderData.seo.description,
  ogTitle: orderData.seo.title,
  ogDescription: orderData.seo.description,
  ogImage: orderData.seo.ogImage
})

// 주문 상품 (바로구매 or 장바구니에서 가져옴)
const orderItems = ref([])

// 생성된 주문번호 (결제 전 상태) - 페이지 이탈 시 취소용
const pendingOrderNumber = ref(null)

// 결제 리다이렉트 진행 중 여부 (success/fail 페이지로 이동 중)
const isPaymentRedirecting = ref(false)

// 취소 알럿 모달
const showCancelModal = ref(false)

// sessionStorage 키
const PENDING_ORDER_KEY = 'pendingOrderNumber'

// pendingOrderNumber를 sessionStorage에 저장
const savePendingOrder = (orderNumber) => {
  pendingOrderNumber.value = orderNumber
  if (import.meta.client && orderNumber) {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderNumber)
  }
}

// pendingOrderNumber 초기화
const clearPendingOrder = () => {
  pendingOrderNumber.value = null
  if (import.meta.client) {
    sessionStorage.removeItem(PENDING_ORDER_KEY)
  }
}

// 주문 취소 실행
const executeCancelOrder = async (orderNumber = null) => {
  const targetOrder = orderNumber || pendingOrderNumber.value
  if (targetOrder) {
    try {
      await cancelOrder(targetOrder)
    } catch (e) {
      console.warn('Failed to cancel pending order:', e)
    }
    if (!orderNumber) {
      clearPendingOrder()
    }
  }
}

// 기존 미결제 주문 취소 (새 주문 생성 전 호출)
const cancelPreviousPendingOrder = async () => {
  // sessionStorage에서 이전 주문번호 확인
  if (import.meta.client) {
    const storedOrder = sessionStorage.getItem(PENDING_ORDER_KEY)
    if (storedOrder) {
      try {
        await cancelOrder(storedOrder)
      } catch (e) {
        console.warn('Failed to cancel previous pending order:', e)
      }
      sessionStorage.removeItem(PENDING_ORDER_KEY)
    }
  }
  // ref에 저장된 주문도 취소
  if (pendingOrderNumber.value) {
    await executeCancelOrder()
  }
}

// 취소 알럿 확인 시 호출
const handleCancelConfirm = async () => {
  showCancelModal.value = false
  await executeCancelOrder()
  clearPendingOrder()
}

// 페이지 이탈 시 미결제 주문 취소 (알럿 표시)
const showCancelAlert = () => {
  if (pendingOrderNumber.value && !isPaymentRedirecting.value) {
    showCancelModal.value = true
    return true // 이탈 중단
  }
  return false
}

// beforeunload 이벤트 핸들러 (브라우저 닫기/새로고침)
const handleBeforeUnload = () => {
  // 결제 리다이렉트 중이면 취소하지 않음
  if (isPaymentRedirecting.value) return

  const orderToCancel = pendingOrderNumber.value || (import.meta.client && sessionStorage.getItem(PENDING_ORDER_KEY))
  if (orderToCancel) {
    // sendBeacon으로 비동기 취소 요청 (페이지 종료 시에도 전송 보장)
    const apiBase = useRuntimeConfig().public.apiBase || ''
    navigator.sendBeacon(`${apiBase}/orders/${orderToCancel}/cancel`)
    sessionStorage.removeItem(PENDING_ORDER_KEY)
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // 결제 리다이렉트 중이 아닐 때만 주문 취소 (모달 없이 바로 취소)
    if (!isPaymentRedirecting.value) {
      const orderToCancel = pendingOrderNumber.value || sessionStorage.getItem(PENDING_ORDER_KEY)
      if (orderToCancel) {
        executeCancelOrder(orderToCancel)
        clearPendingOrder()
      }
    }
  }
})

onMounted(() => {
  // 주문 상품 로드 (sessionStorage는 클라이언트에서만)
  const items = getOrderItems()
  if (items.length > 0) {
    orderItems.value = items
  }
})

// 주문 상품 목록 (UI용 변환)
const orderProducts = computed(() => {
  if (orderItems.value.length > 0) {
    return orderItems.value.map(item => ({
      id: item.productId,
      name: item.productName,
      image: item.productImage,
      option: item.optionName,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice
    }))
  }
  // 폴백: 더미 데이터
  return orderData.dummy.products
})

// Form State
const orderer = reactive({
  name: '',
  phone: '',
  email: ''
})

const shipping = reactive({
  sameAsOrderer: false,
  recipient: '',
  phone: '',
  email: '',
  zipcode: '',
  address: '',
  addressDetail: '',
  memo: '',
  customMemo: ''
})

const payment = reactive({
  method: 'card',
  cardCompany: '',
  installment: '0',
  bank: '',
  depositor: ''
})

const coupon = reactive({
  point: ''
})

// 사용 가능 적립금
const availablePoint = ref(0)
const { get } = useApi()

// 사용 가능 적립금 조회 API
const fetchAvailablePoint = async () => {
  try {
    const res = await get('/users/me/points/available')
    if (res?.success) {
      availablePoint.value = res.data || 0
    }
  } catch (e) {
    availablePoint.value = 0
  }
}

// 사용자 정보 조회 (SSR에서 fetch 후 hydration - 네트워크 탭에 안 보임)
const { data: userData } = await useAsyncData('order-user-data', () =>
  $fetch('/api/_internal/me'),
  { server: true }
)

// 사용자 정보로 폼 초기화
const initUserData = () => {
  const res = userData.value
  if (res?.success && res?.data) {
    const user = res.data

    // 주문자 정보 채우기
    orderer.name = user.name || ''
    orderer.phone = user.phone || ''
    orderer.email = user.email || ''

    // 수령인/연락처도 회원 기본 정보에서 가져오기
    shipping.recipient = user.name || ''
    shipping.phone = user.phone || ''
  }
}

// 즉시 실행 및 데이터 변경 시 재실행
initUserData()
watch(userData, initUserData)

// 쿠폰 선택 모달
const isCouponModalOpen = ref(false)
const selectedCoupon = ref(null)
const couponDiscount = ref(0)

// 적립금 사용 모달
const isPointModalOpen = ref(false)

const agreements = reactive({
  all: false,
  terms: false,
  privacy: false
})

// 주문자 정보와 동일 처리
watch(() => shipping.sameAsOrderer, (val) => {
  if (val) {
    shipping.recipient = orderer.name
    shipping.phone = orderer.phone
  }
})

// 결제 금액 계산
const summary = computed(() => {
  // 상품 총액 계산
  const productTotal = orderItems.value.length > 0
    ? orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
    : orderData.dummy.summary.productTotal

  // 배송비 계산 (무료배송 기준 충족 시 무료)
  const freeThreshold = freeShippingAmount.value || 50000
  const baseFee = baseShippingFee.value || 3000
  const shippingFee = productTotal >= freeThreshold ? 0 : baseFee

  const base = {
    productTotal,
    shippingFee,
    discount: 0,
    couponDiscount: couponDiscount.value,
    pointUsed: 0,
    total: 0
  }

  // 포인트 사용
  const pointUsed = parseInt(coupon.point) || 0
  base.pointUsed = Math.min(pointUsed, availablePoint.value)

  // 총 결제 금액
  base.total = base.productTotal + base.shippingFee - base.discount - base.couponDiscount - base.pointUsed

  return base
})

// 회원은 약관 동의 불필요 (가입 시 이미 동의)
const isAgreementValid = computed(() => true)

// 쿠폰 모달 열기
const openCouponModal = () => {
  isCouponModalOpen.value = true
}

// 쿠폰 선택 완료 처리
const handleCouponSelect = ({ coupon, discountAmount }) => {
  selectedCoupon.value = coupon
  couponDiscount.value = discountAmount
}

// 적립금 모달 열기
const openPointModal = async () => {
  await fetchAvailablePoint()
  isPointModalOpen.value = true
}

// 적립금 사용 확인
const handlePointConfirm = (point) => {
  coupon.point = String(point)
}

// 결제하기
const handleSubmit = async () => {
  // 배송지 연락처 검사
  if (!validate('phone', shipping.phone.replace(/-/g, ''))) {
    warning(orderData.validation?.shippingPhone || '배송지 연락처 형식이 올바르지 않습니다.')
    return
  }

  // 배송지 이메일 검사
  if (!shipping.email || !validate('email', shipping.email)) {
    warning(orderData.validation?.shippingEmail || '받으실 이메일 형식이 올바르지 않습니다.')
    return
  }

  // 기존 미결제 주문이 있으면 먼저 취소
  await cancelPreviousPendingOrder()

  // 주문 생성 요청 데이터
  const orderPayload = {
    items: orderItems.value.map(item => ({
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity
    })),
    shippingAddress: {
      recipientName: shipping.recipient,
      recipientPhone: shipping.phone,
      email: shipping.email
    },
    expectedAmount: summary.value.total,
    orderChannel: 'WEB',
    userCouponId: selectedCoupon.value?.id || null,
    usedPoint: parseInt(coupon.point) || 0
  }

  const result = await createOrder(orderPayload)

  if (result.success) {
    // 미결제 주문번호 저장 (페이지 이탈 시 취소용)
    savePendingOrder(result.orderNumber)

    // 주문 생성 성공 → 결제 정보 sessionStorage에 저장 (승인 페이지에서 사용)
    if (import.meta.client) {
      sessionStorage.setItem('paymentOrder', JSON.stringify({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        amount: summary.value.total,
        cartItemIds: orderItems.value.map(item => item.cartItemId).filter(Boolean)
      }))
    }

    // 주문명 생성
    const firstProduct = orderProducts.value[0]?.name || ''
    const orderName = orderProducts.value.length > 1
      ? `${firstProduct} 외 ${orderProducts.value.length - 1}건`
      : firstProduct

    // 토스페이먼츠 결제창 호출 (리다이렉트 방식)
    // 리다이렉트 전 플래그 설정하여 주문 취소 방지
    isPaymentRedirecting.value = true

    const origin = window.location.origin
    const paymentResult = await requestPayment({
      amount: summary.value.total,
      orderId: result.orderNumber,
      orderName,
      customerName: orderer.name || shipping.recipient,
      customerEmail: orderer.email || '',
      customerKey: authStore.isLoggedIn ? `user_${authStore.user?.id}` : null,
      successUrl: `${origin}/payment/success`,
      failUrl: `${origin}/payment/fail`
    })

    // 사용자가 결제창을 닫은 경우 → 취소 알럿 표시
    if (paymentResult?.cancelled) {
      isPaymentRedirecting.value = false
      showCancelModal.value = true
      return
    }

    // 결제 진행 중 (리다이렉트 완료) → 여기까지 오지 않음
    // 만약 오게 되면 플래그 초기화
    isPaymentRedirecting.value = false
    clearPendingOrder()
  } else {
    warning(result.error)
  }
}
</script>

<template>
  <div class="page-order">
    <main class="order-page">
      <form class="order-page__content" @submit.prevent="handleSubmit">
        <div class="order-page__main">
          <!-- 1. 구매 상품 -->
          <section class="order-section">
            <header class="order-section__header">
              <h2 class="order-section__title">{{ orderData.sections.products.title }}</h2>
            </header>
            <div class="order-products">
              <OrderProductCard
                v-for="product in orderProducts"
                :key="product.id"
                :product="product"
                :labels="orderData.sections.products.labels"
              />
            </div>
          </section>

          <!-- 2. 배송지 정보 -->
          <OrderShippingSection
            :model-value="shipping"
            :labels="orderData.sections.shipping"
            :show-same-as-orderer="false"
            :show-select-address="false"
            @update:model-value="val => Object.assign(shipping, val)"
          />

          <!-- 5. 할인 / 쿠폰 -->
          <OrderCouponSection
            v-model="coupon"
            :labels="orderData.sections.coupon"
            :selected-coupon="selectedCoupon"
            :coupon-discount="couponDiscount"
            @open-coupon-modal="openCouponModal"
            @open-point-modal="openPointModal"
          />

          <!-- 6. 결제 수단 -->
          <!-- <OrderPaymentSection
            v-model="payment"
            :labels="orderData.sections.payment"
          /> -->
        </div>

        <!-- 결제 금액 사이드바 -->
        <OrderSummaryAside
          v-model:agreements="agreements"
          :summary="summary"
          :labels="orderData.summary"
          :agreement-labels="orderData.sections.agreements"
          :submit-label="orderData.submit.member"
          :disabled="false"
          :hide-agreements="true"
          @submit="handleSubmit"
        />
      </form>
    </main>

    <Footer :data="mainData.footer" />

    <!-- 쿠폰 선택 모달 -->
    <CouponSelectModal
      v-model="isCouponModalOpen"
      :subtotal="summary.productTotal"
      :selected-coupon-id="selectedCoupon?.id"
      @select="handleCouponSelect"
    />

    <!-- 적립금 사용 모달 -->
    <PointUseModal
      v-model="isPointModalOpen"
      :labels="orderData.sections.pointModal"
      :available-point="availablePoint"
      :current-point="parseInt(coupon.point) || 0"
      @confirm="handlePointConfirm"
    />

    <FloatingPaymentBar
      v-model:agreements="agreements"
      :summary="summary"
      :labels="orderData.summary"
      :agreement-labels="orderData.sections.agreements"
      :submit-label="orderData.submit.member"
      :disabled="false"
      :hide-agreements="true"
      @submit="handleSubmit"
    />

    <!-- 결제 취소 알럿 모달 -->
    <AlertModal
      v-model="showCancelModal"
      :title="orderData.cancelModal.title"
      :message="orderData.cancelModal.message"
      :confirm-label="orderData.cancelModal.confirm"
      variant="warning"
      @confirm="handleCancelConfirm"
    />
  </div>
</template>
