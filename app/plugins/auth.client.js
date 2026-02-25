/**
 * Auth Client Plugin
 * SSR에서 hydration된 인증 상태를 localStorage와 동기화
 * 네트워크 탭에 /me 요청이 노출되지 않도록 클라이언트에서는 API 호출하지 않음
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // SSR에서 인증 정보가 hydration된 경우 localStorage 동기화
  if (authStore.isLoggedIn && authStore.user) {
    localStorage.setItem('isLoggedIn', 'true')
  } else {
    // SSR에서 인증 실패 시 localStorage 정리
    const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true'
    if (hasLoginFlag && !authStore.isLoggedIn) {
      localStorage.removeItem('isLoggedIn')
    }
  }
})
