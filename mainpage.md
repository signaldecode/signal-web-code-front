# 메인 페이지 개선 계획

## 현재 API 스펙 (변경 없음)

| API | 제공 데이터 |
|-----|-----------|
| `GET /main/shop-info` | 섹션 목록(keyword, sortOrder, isActive), SEO, 상점 정보, headerMenu |
| `GET /main/banners` | HERO / SLIDE / FULL / HALF 배너 배열 |
| `GET /sections/{keyword}` | 섹션별 상품(name, price, discount, rating, reviewCount), 리뷰(rating, content, images, author), 배너 |
| `GET /categories` | 카테고리 목록 (id, name, imageUrl, children) |
| `GET /popups` | CENTER / FLOATING 팝업 |

---

## 개선 항목

### 1. 헤더 레이아웃 변경

**현재**: 로고 + 네비게이션 + 유저 메뉴 일렬 배치
**변경**:
```
로고  |              검색              | 회원가입 | 로그인 | 장바구니
햄버거(카테고리) | 이벤트 | etc...
```
- 검색 바를 상단 중앙에 배치
- 햄버거 버튼으로 카테고리 드로어 호출
- 2단 구성 (상단: 로고+검색+유저 / 하단: 네비게이션)

**영향 범위**: `Header.vue` (전체 페이지 공통), `main.json` header 데이터
**데이터 소스**: `shop-info` headerMenu + `main.json`

---

### 2. 히어로 배너 (Peek 캐러셀)

**현재**: 화면 꽉 채우는 풀스크린 슬라이드
**변경**: 이전 배너 | **현재 배너** | 다음 배너 (양옆 미리보기)
- 현재 슬라이드가 중앙에 크게, 양옆은 축소+흐림 처리
- 배너 사이즈 적절하게 조절

**영향 범위**: `SectionHero.vue` 캐러셀 로직 재작성
**데이터 소스**: `GET /main/banners` HERO 배열 (변경 없음)

---

### 3. 상품 카드 호버 효과

**현재**: 기본 호버 (그림자 정도)
**변경**: 호버 시 상세 정보 오버레이 노출
- 할인율, 평점, 리뷰 수, 간단 설명 등
- 부드러운 트랜지션 효과

**영향 범위**: `ProductCard.vue`, SCSS 컴포넌트 스타일
**데이터 소스**: 기존 상품 데이터 (name, price, discountRate, rating, reviewCount, summary)

---

### 4. 리뷰 섹션 리디자인

**현재**: 마키(무한 스크롤) 2줄 애니메이션
**변경**: 리뷰 섹션 UI 전면 교체
- 구체적인 디자인 방향 결정 필요 (카드 그리드? 슬라이더? 등)

**영향 범위**: `SectionReviews.vue` 교체
**데이터 소스**: `GET /sections/review` (rating, content, images, author, productName)

---

### 5. 카테고리 아이콘 구성

**현재**: 이미지 썸네일 기반 카테고리 카드
**변경**: 간결한 아이콘으로 감각적 구성
- SVG 아이콘 또는 미니멀 일러스트
- 컴팩트한 레이아웃

**영향 범위**: `SectionCategories.vue`, `CategoryCard.vue`
**데이터 소스**: `GET /categories` imageUrl 필드 (Admin에서 아이콘 이미지 업로드) 또는 프론트 아이콘 매핑

---

### 6. 베스트 후기 배치

**현재**: 리뷰 섹션이 하단에 위치
**변경**: 상단 영역에 베스트 후기를 배치하여 유저 유입/신뢰도 증가
- Admin 섹션 순서 변경 또는 프론트에서 별도 하이라이트 영역 구성

**영향 범위**: 섹션 순서 조정 또는 새로운 리뷰 하이라이트 컴포넌트
**데이터 소스**: `GET /sections/review` (동일)

---

### 7. 스크롤 트리거 애니메이션

**현재**: 애니메이션 없음 (즉시 렌더링)
**변경**: 스크롤 시 요소가 시간차로 등장
- Intersection Observer 기반
- 텍스트 fade-up, 이미지 slide-in 등
- 스토리텔링형 경험 제공

**영향 범위**: 공통 composable (`useScrollAnimation.js`) + 각 섹션 컴포넌트 적용
**데이터 소스**: 없음 (순수 프론트 작업)

---

### 8. 푸터 크기 줄이기

**현재**: 정보가 많아 푸터가 큼
**변경**: 컴팩트하게 축소
- 접기/펼치기 또는 필수 정보만 노출
- 모바일에서 더 간결하게

**영향 범위**: `Footer.vue`, SCSS 스타일
**데이터 소스**: `main.json` footer (변경 없음)

---

## 작업 체크리스트

### Phase 1 — SCSS/CSS 작업 (가벼운 항목)

- [x] 8. 푸터 크기 줄이기
- [x] 3. 상품 카드 호버 효과 변경
- [x] 7. 스크롤 트리거 애니메이션 (`useScrollAnimation.js` composable 생성)

### Phase 2 — 컴포넌트 리빌드 (중간 규모)

- [x] 2. 히어로 배너 Peek 캐러셀로 변경
- [x] 5. 카테고리 아이콘 구성 리디자인
- [x] 4. 리뷰 섹션 리디자인
- [x] 6. 베스트 후기 배치 (`SectionBestReviews.vue` + 레지스트리 연동)

### Phase 3 — 레이아웃 변경 (전체 영향)

- [x] 1. 헤더 레이아웃 변경 (2단 구조: 로고+검색+유저 / 카테고리+네비)

---

## 참고

- 모든 항목 현재 API 스펙으로 구현 가능 (백엔드 수정 불필요)
- Phase 순서는 영향 범위 기준 (좁은 범위 → 넓은 범위)
- 헤더는 전체 페이지에 영향을 주므로 마지막 Phase에 배치
- 각 항목 완료 시 체크리스트 업데이트