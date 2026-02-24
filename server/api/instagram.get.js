/**
 * Instagram Basic Display API Proxy
 * 액세스 토큰을 서버에서 관리하여 클라이언트에 노출되지 않도록 함
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const accessToken = config.instagramAccessToken

  if (!accessToken) {
    throw createError({
      statusCode: 500,
      message: 'INSTAGRAM_ACCESS_TOKEN이 설정되지 않았습니다.'
    })
  }

  const query = getQuery(event)
  const limit = query.limit || 12

  try {
    // Instagram Basic Display API - 미디어 목록 조회
    const response = await $fetch(
      `https://graph.instagram.com/me/media`,
      {
        query: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          access_token: accessToken,
          limit
        }
      }
    )

    // 이미지/비디오만 필터링하고 포맷 변환
    const posts = (response.data || [])
      .filter(item => ['IMAGE', 'CAROUSEL_ALBUM', 'VIDEO'].includes(item.media_type))
      .map(item => ({
        id: item.id,
        image: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
        href: item.permalink,
        caption: item.caption || '',
        mediaType: item.media_type,
        timestamp: item.timestamp
      }))

    return {
      success: true,
      data: posts
    }
  } catch (error) {
    console.error('Instagram API Error:', error.data || error.message)

    // 토큰 만료 등의 에러 처리
    if (error.data?.error?.code === 190) {
      throw createError({
        statusCode: 401,
        message: 'Instagram 액세스 토큰이 만료되었습니다. 토큰을 갱신해주세요.'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: 'Instagram 피드를 불러오는데 실패했습니다.'
    })
  }
})
