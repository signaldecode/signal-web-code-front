/**
 * Auth Server Plugin
 * SSR에서 유저 정보를 가져와 클라이언트에 hydration
 * 네트워크 탭에 /me 요청이 노출되지 않음
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const event = useRequestEvent()
  if (!event) return

  const authStore = useAuthStore(nuxtApp.$pinia)

  // 이미 로드되었으면 스킵 (중복 호출 방지)
  if (authStore.user) return

  // 쿠키에서 로그인 상태 확인 (access_token 또는 refresh_token 존재 여부)
  const cookies = event.node.req.headers.cookie || ''
  const hasAuthCookie = cookies.includes('access_token') || cookies.includes('refresh_token')

  if (!hasAuthCookie) return

  const config = useRuntimeConfig()
  const apiBaseUrl = config.apiBaseUrl

  if (!apiBaseUrl) return

  try {
    const response = await $fetch(`${apiBaseUrl}/users/me`, {
      headers: {
        cookie: cookies
      },
      credentials: 'include'
    })

    if (response.success && response.data) {
      authStore.setUser(response.data)
    }
  } catch {
    // 인증 실패 시 무시 (로그인 상태 아님)
  }
})
