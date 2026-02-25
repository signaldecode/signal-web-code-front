import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false
  }),

  actions: {
    /**
     * 로그인 처리 - 로그인 API 응답에서 유저 정보를 직접 설정
     * @param {object} userData - 로그인 API에서 반환된 유저 데이터
     */
    async login(userData = null) {
      this.isLoggedIn = true
      if (import.meta.client) {
        localStorage.setItem('isLoggedIn', 'true')
      }
      // 로그인 응답에 유저 데이터가 포함된 경우 직접 설정
      if (userData) {
        this.user = userData
      }
    },

    logout() {
      this.user = null
      this.isLoggedIn = false
      if (import.meta.client) {
        localStorage.removeItem('isLoggedIn')
      }
    },

    /**
     * 유저 정보 설정 (SSR에서 가져온 데이터로 설정)
     * @param {object} userData - 유저 데이터
     */
    setUser(userData) {
      if (userData) {
        this.user = userData
        this.isLoggedIn = true
      }
    },

    /**
     * SSR 전용: 서버에서만 유저 정보 조회
     * 클라이언트 네트워크 탭에 /me 요청이 노출되지 않음
     */
    async fetchUserSSR() {
      // 서버에서만 실행
      if (import.meta.server) {
        try {
          const res = await $fetch('/api/_internal/me')
          if (res.success && res.data) {
            this.user = res.data
            this.isLoggedIn = true
          }
        } catch {
          this.user = null
          this.isLoggedIn = false
        }
      }
    },

    /**
     * 유저 정보 확인 및 로드 (SSR 지원)
     */
    async ensureUser() {
      if (!this.user) {
        this.loading = true
        await this.fetchUserSSR()
        this.loading = false
      }
    }
  }
})
