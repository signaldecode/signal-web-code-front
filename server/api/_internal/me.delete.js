/**
 * Internal User Delete API (Server-only)
 * 회원 탈퇴
 * /me API가 네트워크 탭에 노출되지 않음
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

  const headers = getHeaders(event)
  const requestHeaders = {}

  if (headers.cookie) {
    requestHeaders.cookie = headers.cookie
  }

  try {
    const response = await $fetch.raw(`${apiBaseUrl}/users/me`, {
      method: 'DELETE',
      headers: requestHeaders,
      credentials: 'include'
    })

    // Set-Cookie 헤더 전달 (로그아웃 처리)
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

    throw createError({
      statusCode,
      data: errorData
    })
  }
})
