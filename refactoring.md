# 메인페이지 리팩터링 계획

## 현재 상태 분석

### 백엔드 API (수정 없음)

| API | 역할 |
|-----|------|
| `GET /main/shop-info` | 섹션 목록(keyword, sortOrder, isActive), SEO, 상점 정보 |
| `GET /main/banners` | Hero/Slide/Full/Half 배너 |
| `GET /sections/{keyword}` | 섹션별 상품/리뷰/배너 데이터 |
| `GET /categories` | 카테고리 목록 |
| `GET /popups` | 센터/플로팅 팝업 |

### Admin에서 관리 가능한 항목

- 섹션 순서/활성화/타이틀/설명 (`PUT /admin/displays`)
- 배너 CRUD (HERO / SLIDE / FULL / HALF 포지션)
- 팝업 CRUD (CENTER / FLOATING)
- 헤더 메뉴 구성

### 현재 `index.vue` 문제점

1. **273줄로 비대** — 페이지가 조립 전용이어야 하나, computed/로직이 과다
2. **v-if 체이닝 하드코딩** — `section.keyword === 'best'` 같은 분기가 template에 직접 나열
3. **확장성 부족** — 새 섹션 타입 추가 시 index.vue를 직접 수정해야 함
4. **데이터 변환 로직이 페이지에 존재** — bestData, newData, mdPickData 등 computed가 페이지에 위치

---

## 리팩터링 방향: 섹션 레지스트리 패턴

### 핵심 컨셉

```
API sections 배열 → keyword로 컴포넌트 자동 매핑 → sortOrder 순서대로 렌더링
```

Admin에서 섹션 순서/활성화 변경 → 프론트 코드 수정 0

### 구조 트리

```
app/
├── pages/
│   └── index.vue                      # 얇은 조립 셸 (~50줄)
├── composables/
│   ├── useShopInfo.js                 # 유지 (shop-info + categories)
│   ├── useSections.js                 # 유지 (섹션 데이터 fetch)
│   ├── useMain.js                     # 유지 (배너 데이터)
│   ├── usePopup.js                    # 유지
│   └── useSectionRegistry.js          # 🆕 keyword → 컴포넌트 매핑 레지스트리
├── components/
│   └── domain/
│       ├── MainSectionRenderer.vue    # 🆕 동적 섹션 렌더러
│       ├── SectionHero.vue            # 리팩터 (props 통일)
│       ├── SectionBestItems.vue       # 리팩터 (props 통일)
│       ├── SectionMdPick.vue          # 리팩터 (props 통일)
│       ├── SectionCategoryItems.vue   # 리팩터 (props 통일)
│       ├── SectionReviews.vue         # 리팩터 (props 통일)
│       ├── SectionInstagram.vue       # 리팩터 (props 통일)
│       ├── BannerFull.vue             # 리팩터 (props 통일)
│       ├── BannerSlide.vue            # 리팩터 (props 통일)
│       └── SectionHalfBanners.vue     # 리팩터 (props 통일)
└── data/
    └── main.json                      # SEO/접근성 fallback 텍스트
```

---

## 핵심 변경 사항

### 1. `useSectionRegistry.js` — 섹션 레지스트리

keyword → 컴포넌트 매핑을 한 곳에서 관리:

```js
const sectionMap = {
  best:          { component: 'SectionBestItems', clientOnly: false },
  new:           { component: 'SectionBestItems', clientOnly: false, variant: 'new' },
  recommend:     { component: 'SectionMdPick',    clientOnly: false },
  category:      { component: 'SectionCategoryItems', clientOnly: false },
  full_banner:   { component: 'BannerFull',       clientOnly: true },
  slide_banner:  { component: 'BannerSlide',      clientOnly: true },
  half_banner:   { component: 'SectionHalfBanners', clientOnly: true },
  review:        { component: 'SectionReviews',   clientOnly: true },
  instagram:     { component: 'SectionInstagram', clientOnly: false },
}
```

- 새 섹션 타입 추가 시 → 컴포넌트 1개 생성 + 레지스트리 1줄 추가
- `clientOnly` 플래그로 SSR/CSR 제어

### 2. `MainSectionRenderer.vue` — 동적 섹션 렌더러

```vue
<template>
  <template v-for="section in activeSections" :key="section.keyword">
    <ClientOnly v-if="registry[section.keyword]?.clientOnly">
      <component
        :is="registry[section.keyword].component"
        :section="section"
        :variant="registry[section.keyword].variant"
      />
    </ClientOnly>
    <component
      v-else
      :is="registry[section.keyword]?.component"
      :section="section"
      :variant="registry[section.keyword]?.variant"
    />
  </template>
</template>
```

### 3. `index.vue` — 슬림화 (273줄 → ~50줄)

```vue
<template>
  <div class="page-main">
    <ClientOnly>
      <SectionHero :banners="heroBanners" />
      <template #fallback><BaseSpinner /></template>
    </ClientOnly>

    <main>
      <SectionCategories :categories="categoryItems" />
      <MainSectionRenderer :sections="activeSections" />
    </main>

    <Footer />

    <ClientOnly>
      <PopupCenter :popups="centerPopups" @dismiss="dismissPopup" />
      <PopupFloating :popups="floatingPopups" @dismiss="dismissPopup" />
    </ClientOnly>
  </div>
</template>
```

### 4. 각 섹션 컴포넌트 — props 인터페이스 통일

데이터 변환 로직을 페이지에서 각 컴포넌트 내부 또는 composable로 이동:

```js
// 공통 props 인터페이스
{
  section: Object,    // { keyword, title, subtitle, description, linkUrl, bannerImageUrl, ... }
  variant: String,    // 같은 컴포넌트 재사용 시 구분 ('best' | 'new')
}
```

각 컴포넌트가 자체적으로:
- `useSections()`에서 자기 keyword의 데이터를 가져옴
- `main.json`에서 fallback 텍스트를 가져옴
- 데이터 변환을 내부에서 처리

---

## 작업 순서

| 단계 | 작업 | 영향 범위 | 비고 |
|------|------|-----------|------|
| **1** | `useSectionRegistry.js` 생성 | 신규 파일 | keyword → component 매핑 |
| **2** | `MainSectionRenderer.vue` 생성 | 신규 파일 | 동적 렌더링 엔진 |
| **3** | 섹션 컴포넌트 props 통일 리팩터 | domain 컴포넌트 | 데이터 변환 로직 이동 |
| **4** | `index.vue` 슬림화 | pages/index.vue | ~50줄로 축소 |
| **5** | `main.json` fallback 데이터 정리 | data/main.json | 불필요 항목 제거 |
| **6** | SCSS 토큰 미준수 부분 점검 | styles/ | HEX/px 직접 사용 제거 |
| **7** | SEO/A11y 검증 | 전체 | H1 계층, aria, meta 점검 |

---

## 기대 효과

- **Admin 섹션 관리 → 프론트 코드 수정 0**: API 기반 동적 렌더링 완전 달성
- **새 섹션 타입 추가**: 컴포넌트 1개 + 레지스트리 1줄
- **index.vue**: 비즈니스 로직 없는 순수 조립 페이지 (CLAUDE.md 원칙 준수)
- **유지보수성**: 섹션별 독립적 수정 가능, 다른 섹션에 영향 없음
- **백엔드 API 수정 불필요**: 동일 엔드포인트, 동일 응답 구조 그대로 사용
