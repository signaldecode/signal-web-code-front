/**
 * Internal OAuth Link API (Server-only)
 * 소셜 계정 연동 처리 + 유저 정보 반환
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

  const body = await readBody(event)
  const { provider, ...linkData } = body

  if (!provider) {
    throw createError({
      statusCode: 400,
      message: 'provider is required'
    })
  }

  try {
    // 1. 소셜 계정 연동 요청
    const linkResponse = await $fetch.raw(`${apiBaseUrl}/auth/oauth2/${provider}/link`, {
      method: 'POST',
      body: linkData,
      credentials: 'include'
    })

    // Set-Cookie 헤더 전달
    const setCookieHeaders = linkResponse.headers.getSetCookie?.() || []
    const cookies = []

    for (const cookie of setCookieHeaders) {
      const modifiedCookie = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax')
        .replace(/Path=\/api\/v1/gi, 'Path=/')
        .replace(/Domain=[^;]+;?/gi, '')

      appendResponseHeader(event, 'Set-Cookie', modifiedCookie)

      const cookieNameValue = modifiedCookie.split(';')[0]
      cookies.push(cookieNameValue)
    }

    const linkResult = linkResponse._data

    if (!linkResult.success) {
      return linkResult
    }

    // 2. 연동 성공 시 유저 정보 조회
    let userData = null

    try {
      const userResponse = await $fetch(`${apiBaseUrl}/users/me`, {
        headers: {
          cookie: cookies.join('; ')
        },
        credentials: 'include'
      })

      if (userResponse.success && userResponse.data) {
        userData = userResponse.data
      }
    } catch {
      // 유저 정보 조회 실패해도 연동은 성공으로 처리
    }

    return {
      ...linkResult,
      user: userData
    }
  } catch (error) {
    const statusCode = error.response?.status || 500
    const errorData = error.data || { message: error.message }

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
