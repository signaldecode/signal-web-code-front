/**
 * Internal User API (Server-only)
 * 사용자 정보를 서버에서만 조회하여 클라이언트 네트워크 탭에 노출되지 않도록 함
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.apiBaseUrl

  if (!apiBaseUrl) {
    throw createError({
      statusCode: 500,
      message: 'API_BASE_URL 환경변수가 설정되지 않았습니다.'
    })
  }

  // 원본 요청의 쿠키 전달
  const headers = getHeaders(event)
  const requestHeaders = {}

  if (headers.cookie) {
    requestHeaders.cookie = headers.cookie
  }

  try {
    const response = await $fetch.raw(`${apiBaseUrl}/users/me`, {
      method: 'GET',
      headers: requestHeaders,
      credentials: 'include'
    })

    // Set-Cookie 헤더 수정 (Safari 쿠키 문제 해결)
    const setCookieHeaders = response.headers.getSetCookie?.() || []

    for (const cookie of setCookieHeaders) {
      const modifiedCookie = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax')
        .replace(/Path=\/api\/v1/gi, 'Path=/')
        .replace(/Domain=[^;]+;?/gi, '')

      appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
    }

    return response._data
  } catch (error) {
    const statusCode = error.response?.status || 500
    const errorData = error.data || { message: error.message }

    // 에러 응답의 Set-Cookie도 처리
    const setCookieHeaders = error.response?.headers?.getSetCookie?.() || []
    for (const cookie of setCookieHeaders) {
      const modifiedCookie = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax')
        .replace(/Path=\/api\/v1/gi, 'Path=/')
        .replace(/Domain=[^;]+;?/gi, '')

      appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
    }

    throw createError({
      statusCode,
      data: errorData
    })
  }
})
