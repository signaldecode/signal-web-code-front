<script setup>
import mypageData from '~/data/mypage.json'

const pageData = mypageData.pages.points

const { balance, transformedHistory, pagination, pending, error, hasMore, fetchPoints, loadMore } = usePoints()

// 상태 텍스트 매핑
const getStatusText = (status) => {
  return pageData.status[status] || status
}

// 상태 클래스
const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || ''
  return `mypage-points__status-badge--${statusLower}`
}

// 데이터 로드
onMounted(async () => {
  try {
    await fetchPoints()
  } catch (e) {
    console.error('Failed to load points:', e)
  }
})
</script>

<template>
  <section class="mypage-points" :aria-label="pageData.title">
    <header class="mypage-points__header">
      <h2 class="mypage-points__title">{{ pageData.title }}</h2>
    </header>

    <!-- 보유 적립금 -->
    <div class="mypage-points__balance-card">
      <span class="mypage-points__balance-label">{{ pageData.balance.label }}</span>
      <span class="mypage-points__balance-value">
        {{ Number(balance).toLocaleString() }}{{ pageData.balance.unit }}
      </span>
    </div>

    <!-- 로딩 -->
    <div v-if="pending && transformedHistory.length === 0" class="mypage-points__loading">
      {{ pageData.loading }}
    </div>

    <!-- 적립금 내역 테이블 -->
    <template v-else-if="transformedHistory.length > 0">
      <table class="mypage-points__table">
        <thead class="mypage-points__thead">
          <tr>
            <th class="mypage-points__th mypage-points__th--date">{{ pageData.table.date }}</th>
            <th class="mypage-points__th mypage-points__th--description">{{ pageData.table.description }}</th>
            <th class="mypage-points__th mypage-points__th--amount">{{ pageData.table.amount }}</th>
            <th class="mypage-points__th mypage-points__th--status">{{ pageData.table.status }}</th>
          </tr>
        </thead>
        <tbody class="mypage-points__tbody">
          <tr v-for="item in transformedHistory" :key="item.id" class="mypage-points__tr">
            <td class="mypage-points__td mypage-points__td--date">{{ item.date }}</td>
            <td class="mypage-points__td mypage-points__td--description">{{ item.description }}</td>
            <td
              class="mypage-points__td mypage-points__td--amount"
              :class="{ positive: item.isPositive, negative: !item.isPositive }"
            >
              {{ item.amountText }}
            </td>
            <td class="mypage-points__td mypage-points__td--status">
              <span
                class="mypage-points__status-badge"
                :class="getStatusClass(item.status)"
              >
                {{ getStatusText(item.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 더 보기 버튼 -->
      <div v-if="hasMore" class="mypage-points__more">
        <BaseButton
          variant="outline"
          color="gray"
          size="medium"
          :disabled="pending"
          @click="loadMore"
        >
          {{ pending ? '불러오는 중...' : '더 보기' }}
        </BaseButton>
      </div>
    </template>

    <!-- 빈 상태 -->
    <div v-else class="mypage-points__empty">
      <p class="mypage-points__empty-title">{{ pageData.empty.title }}</p>
      <p class="mypage-points__empty-desc">{{ pageData.empty.description }}</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="mypage-points__error">
      {{ error }}
    </div>
  </section>
</template>
