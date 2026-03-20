# 메인페이지 트렌디 리뉴얼 체크리스트

## 리뉴얼 섹션 흐름
```
Hero(비주얼 강화) → Trust Bar(신규) → Bento Grid(신규) → Best Items(리디자인)
→ Best Reviews(리디자인) → MD Pick(리디자인) → Category Items(유지)
→ Showcase Marquee(리디자인) → CTA Banner(리디자인) → Instagram(유지)
```

---

## Phase 1: 기존 API만으로 가능한 개선

### 1. Hero 섹션 리디자인 ✅
- [x] 풀스크린 + 오버레이 그라데이션 레이아웃
- [x] split-text 글자별 등장 애니메이션
- [x] crossfade + ken-burns(줌인/아웃) 전환
- [x] 글래스모피즘 CTA 버튼 + hover ripple
- [x] 프로그레스 바 인디케이터 (autoplay 타이머 연동)
- **API**: `GET /main/banners` (HERO) — 변경 없음
- **파일**: `SectionHero.vue`, `_sections.scss`

### 2. ProductCard 호버 강화 ✅
- [x] 카드 lift + 그림자 확장 + 빠른 정보 표시
- [x] 글래스모피즘 뱃지 + 순위 번호 (1st, 2nd...)
- [x] 호버 오버레이 그라데이션 개선
- [x] 카드 간 stagger fade-up
- **API**: 변경 없음
- **파일**: `ProductCard.vue`, `_product-card.scss`

### 3. Trust Bar (신규) ✅
- [x] 신규 컴포넌트 `SectionTrustBar.vue`
- [x] `main.json`에 `trustBar` 데이터 추가
- [x] 가로 배치 + 아이콘 + 카운터 숫자 애니메이션 (IntersectionObserver)
- [x] `index.vue`에서 Hero 아래 직접 배치
- **API**: 없음 (data 기반)
- **파일**: `SectionTrustBar.vue`, `main.json`, `_sections.scss`

### 4. Bento Grid (신규) ✅
- [x] 신규 컴포넌트 `SectionBentoGrid.vue`
- [x] CSS Grid 기반 비대칭 레이아웃 (Featured + 카테고리 2x2 + 하단 배너)
- [x] recommend 상품 + 카테고리 + 슬라이드 배너 조합
- [x] 섹션 레지스트리 등록 (`bento` keyword)
- [x] 반응형 (모바일 세로 스택)
- **API**: `/sections/recommend` + `/categories` + `/main/banners` (SLIDE) 조합
- **파일**: `SectionBentoGrid.vue`, `_sections.scss`, `useSectionRegistry.js`

### 5. Best Reviews 매거진 레이아웃 ✅
- [x] Featured(큰 카드) + 2개 작은 카드 비대칭 그리드
- [x] 이미지 우선 정렬 유지
- [x] 호버 시 카드 lift + 이미지 줌
- **API**: 변경 없음
- **파일**: `SectionBestReviews.vue`, `_sections.scss`

### 6. MD Pick 인터랙션 강화 ✅
- [x] 메인 이미지 패럴랙스 스크롤
- [x] 상품 클릭 시 메인 이미지 변경 연동
- [x] 선택 상태 UI (outline + lift)
- **API**: 변경 없음
- **파일**: `SectionMdPick.vue`, `_sections.scss`

### 7. CTA 배너 (BannerFull 리디자인) ✅
- [x] 좌측 그라데이션 오버레이 + 텍스트 + CTA 버튼
- [x] 21:9 시네마틱 비율
- [x] 글래스모피즘 CTA 버튼
- [x] 호버 시 이미지 줌
- **API**: 변경 없음
- **파일**: `BannerFull.vue`, `_banner.scss`

### 8. Reviews Marquee 카드 리디자인 ✅
- [x] 카드 border-radius + hover lift
- [x] 호버 시 리뷰 내용 오버레이 표시 (backdrop-blur)
- [x] 별점 + 리뷰 텍스트 + 유저명
- **API**: 변경 없음
- **파일**: `SectionReviews.vue`, `_sections.scss`

### 9. 글로벌 개선 ✅
- [x] 스크롤 프로그레스 바 (페이지 상단, 테마 컬러)
- [ ] Sticky CTA 바 (Phase 2에서 검토)
- **파일**: `index.vue`, `_layout.scss`

---

## Phase 2: 신규 API 필요 (미구현)

### 10. 실시간 통계 API
- [ ] `GET /main/statistics` 엔드포인트 설계
- [ ] `useStatistics.js` composable
- [ ] Trust Bar를 실제 데이터로 연동
- **응답**: totalTemplates, totalDownloads, averageRating, activeUsers

### 11. 쇼케이스/포트폴리오
- [ ] `GET /main/showcases` 엔드포인트 설계
- [ ] `SectionShowcase.vue` 컴포넌트
- [ ] `useShowcase.js` composable
- [ ] 카드 호버 시 미리보기

### 12. 인기 검색어/트렌드
- [ ] `GET /main/trends` 엔드포인트 설계
- [ ] 히어로 하단 트렌딩 키워드 칩
- [ ] 개인화 추천 연동

### 13. 상품 Live Preview 확장
- [ ] Product에 demoUrl, pageCount, techStack 필드 추가
- [ ] ProductCard에 미리보기 버튼 추가

---

## 우선순위 매트릭스

| 순위 | 작업 | 난이도 | 영향도 | API | 상태 |
|------|------|--------|--------|-----|------|
| 1 | Hero 리디자인 | 중 | 최상 | 없음 | ✅ |
| 2 | ProductCard 호버 | 하 | 상 | 없음 | ✅ |
| 3 | Trust Bar | 하 | 상 | 없음 | ✅ |
| 4 | Bento Grid | 중 | 상 | 없음 | ✅ |
| 5 | Best Reviews 매거진 | 중 | 중 | 없음 | ✅ |
| 6 | MD Pick 인터랙션 | 중 | 중 | 없음 | ✅ |
| 7 | CTA 배너 | 하 | 중 | 없음 | ✅ |
| 8 | Reviews Marquee | 하 | 중 | 없음 | ✅ |
| 9 | 글로벌 개선 | 중 | 중 | 없음 | ✅ |
| 10 | Showcase 갤러리 | 상 | 최상 | 신규 | ⏳ |
| 11 | Live Preview | 상 | 최상 | 확장 | ⏳ |

---

## 변경 파일 요약

**수정 파일:**
- `app/components/domain/SectionHero.vue` — 풀스크린 crossfade + ken-burns
- `app/components/domain/ProductCard.vue` — rank prop, 순위 뱃지
- `app/components/domain/SectionBestItems.vue` — showRank prop
- `app/components/domain/SectionBestReviews.vue` — 매거진 레이아웃
- `app/components/domain/SectionMdPick.vue` — 패럴랙스 + 이미지 연동
- `app/components/domain/SectionReviews.vue` — 호버 오버레이
- `app/components/domain/BannerFull.vue` — CTA 배너
- `app/components/domain/MainSectionRenderer.vue` — bento 컴포넌트/애니메이션 등록
- `app/composables/useSectionRegistry.js` — bento, best showRank 등록
- `app/pages/index.vue` — Trust Bar, bento 삽입, 스크롤 프로그레스바
- `app/data/main.json` — bentoGrid, trustBar, ctaLabel 추가
- `app/assets/styles/components/_sections.scss` — 전체 섹션 스타일
- `app/assets/styles/components/_product-card.scss` — 호버 개선
- `app/assets/styles/components/_banner.scss` — CTA 배너
- `app/assets/styles/base/_layout.scss` — 프로그레스바, 히어로 플레이스홀더

**신규 파일:**
- `app/components/domain/SectionTrustBar.vue`
- `app/components/domain/SectionBentoGrid.vue`
