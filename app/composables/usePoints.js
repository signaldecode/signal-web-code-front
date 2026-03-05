/**
 * 적립금 관리 API composable
 * GET /users/me/points - 적립금 현황 및 내역 조회
 */

export const usePoints = () => {
  const { get } = useApi()

  const balance = ref(0)
  const history = ref([])
  const pagination = ref({
    page: 1,
    size: 20,
    totalElements: 0
  })
  const pending = ref(false)
  const error = ref(null)

  /**
   * 적립금 조회 (현재 잔액 + 내역)
   * @param {object} params - 조회 파라미터
   * @param {number} params.page - 페이지 번호 (0부터 시작)
   * @param {number} params.size - 페이지 크기
   */
  const fetchPoints = async (params = {}) => {
    pending.value = true
    error.value = null

    try {
      const queryParams = {
        page: params.page ?? 0,
        size: params.size ?? 20
      }

      const response = await get('/users/me/points', queryParams)
      const data = response.data ?? response

      // 현재 적립금
      balance.value = data.current ?? 0

      // 적립금 내역
      const historyData = data.history ?? {}
      history.value = historyData.content ?? []

      // 페이지네이션 정보
      pagination.value = {
        page: historyData.page ?? 1,
        size: historyData.size ?? 20,
        totalElements: historyData.total_elements ?? historyData.totalElements ?? 0
      }

      return { balance: balance.value, history: history.value }
    } catch (e) {
      error.value = e?.data?.message || e?.message || '적립금 조회에 실패했습니다.'
      console.error('Failed to fetch points:', e)
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 적립금 잔액만 조회 (fetchPoints 호출)
   */
  const fetchBalance = async () => {
    await fetchPoints()
    return balance.value
  }

  /**
   * 적립금 내역 조회 (페이지네이션)
   * @param {object} params - 조회 파라미터
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지 크기
   */
  const fetchHistory = async (params = {}) => {
    await fetchPoints(params)
    return history.value
  }

  /**
   * 더 보기 (다음 페이지 로드)
   */
  const loadMore = async () => {
    if (pending.value) return

    const nextPage = pagination.value.page
    await fetchPoints({ page: nextPage, size: pagination.value.size })
  }

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  /**
   * 거래 유형 매핑
   */
  const transactionTypeMap = {
    EARN: 'EARNED',
    USE: 'USED',
    CANCEL: 'CANCELLED',
    EXPIRE: 'EXPIRED',
    ADMIN: 'ADMIN'
  }

  /**
   * 적립금 내역 변환
   */
  const transformHistory = (item) => {
    const amount = item.amount ?? 0
    const transactionType = item.transaction_type ?? item.transactionType ?? 'EARN'

    return {
      id: item.id,
      date: formatDate(item.created_at ?? item.createdAt),
      description: item.reason ?? item.description ?? '-',
      amount,
      amountText: `${amount > 0 ? '+' : ''}${Number(amount).toLocaleString()}P`,
      balanceAfter: item.balance_after ?? item.balanceAfter ?? 0,
      status: transactionTypeMap[transactionType] ?? transactionType,
      isPositive: amount > 0
    }
  }

  /**
   * 변환된 적립금 내역
   */
  const transformedHistory = computed(() => {
    return history.value.map(transformHistory)
  })

  /**
   * 더 불러올 데이터가 있는지 확인
   */
  const hasMore = computed(() => {
    const loaded = history.value.length
    return loaded < pagination.value.totalElements
  })

  return {
    // 상태
    balance,
    history,
    transformedHistory,
    pagination,
    pending,
    error,
    hasMore,
    // 메서드
    fetchPoints,
    fetchBalance,
    fetchHistory,
    loadMore,
    transformHistory
  }
}
