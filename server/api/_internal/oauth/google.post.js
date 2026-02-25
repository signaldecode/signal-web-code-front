/**
 * Internal Google OAuth API (Server-only)
 * 구글 로그인 처리 + 유저 정보 반환
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

  try {
    // 1. 구글 OAuth 로그인 요청
    const loginResponse = await $fetch.raw(`${apiBaseUrl}/auth/oauth2/google`, {
      method: 'POST',
      body,
      credentials: 'include'
    })

    // Set-Cookie 헤더 전달 (로그인 토큰)
    const setCookieHeaders = loginResponse.headers.getSetCookie?.() || []
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

    const loginData = loginResponse._data

    // 로그인 실패 또는 신규 유저인 경우 바로 반환
    if (!loginData.success || loginData.data?.isNewUser) {
      return loginData
    }

    // 2. 로그인 성공 시 유저 정보 조회
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
      // 유저 정보 조회 실패해도 로그인은 성공으로 처리
    }

    // 3. 로그인 결과 + 유저 정보 반환
    return {
      ...loginData,
      user: userData
    }
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
