/**
 * Instagram Feed Composable
 * Instagram Basic Display API를 통해 게시글을 가져옴
 */

export const useInstagram = () => {
  const posts = ref([])
  const pending = ref(false)
  const error = ref(null)

  /**
   * Instagram 피드 조회
   * @param {number} limit - 가져올 게시글 수 (기본: 12)
   */
  const fetchInstagramFeed = async (limit = 12) => {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch('/api/instagram', {
        query: { limit }
      })

      if (response.success) {
        posts.value = response.data
      }
    } catch (err) {
      console.error('Instagram fetch error:', err)
      error.value = err.data?.message || 'Instagram 피드를 불러올 수 없습니다.'
      posts.value = []
    } finally {
      pending.value = false
    }
  }

  return {
    posts,
    pending,
    error,
    fetchInstagramFeed
  }
}
