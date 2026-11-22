# plan.md — TDD 테스트 목록

"go"를 받으면 위에서부터 `- [ ]`인 첫 테스트를 하나 구현한다. 통과하면 `- [x]`로 바꾼다.
실제 진행 순서와 단계별 기록은 `TDD-IMPLEMENTS.md`에 있다(`/tdd-red` → `/tdd-green` → `/tdd-refactor`).
근거: `docs/PRD.md`, `docs/TRD.md`

읽는 법: 각 항목은 **무엇을 확인하는지(한 줄)** 다음에 **주어진 상황 → 기대 결과**를 적는다. 괄호 안 `영문 이름`은 코드의 테스트 이름이다.

---

## 1. 가격 표시 — `public/format.mjs`

Excel에는 숫자만 넣고, 화면에는 "4,500원"처럼 보여야 한다.

- [x] **가격에 콤마와 "원"을 붙인다** (`shouldFormatPriceWithCommaAndWon`)
  - `4500` → `"4,500원"`
- [x] **가격이 없으면 아무것도 표시하지 않는다** (`shouldReturnEmptyStringWhenPriceIsNull`)
  - `null` → `""`

## 2. Excel 읽기 — `src/parse-workbook.mjs`

Excel 워크북을 화면용 데이터(JSON)로 바꾼다. 파일 대신 테스트 안에서 만든 작은 워크북을 쓴다.

### 2-1. 시트 → 페이지

- [x] **시트 하나가 메뉴판 페이지 하나가 된다** (`shouldTurnEachSheetIntoPage`)
  - 시트 `커피`, `디저트` → 페이지 2개, 이름 `커피`, `디저트`
- [x] **`_`로 시작하는 시트는 페이지에서 뺀다** (`shouldExcludeSheetsStartingWithUnderscore`)
  - 시트 `커피`, `_설정` → 페이지는 `커피` 1개뿐
- [x] **페이지 순서는 Excel 탭 순서를 따른다** (`shouldKeepWorkbookSheetOrder`)
  - 탭 순서 `음료`, `커피` → 페이지 순서도 `음료`, `커피`

### 2-2. 행 → 메뉴 항목

- [x] **각 열이 메뉴 항목의 값이 된다** (`shouldMapColumnsToItemFields`)
  - `아메리카노 | 4500 | 깔끔한 산미 | (빈칸) | 에스프레소` → `{ name: "아메리카노", price: 4500, desc: "깔끔한 산미", soldOut: false, category: "에스프레소" }`
- [x] **메뉴명이 빈 행은 건너뛴다** (`shouldSkipRowsWithEmptyName`)
  - 중간에 빈 줄이 있는 시트 → 빈 줄은 항목에 안 들어간다
- [x] **품절 칸이 `Y`면 품절로 표시한다** (`shouldMarkItemSoldOutWhenColumnIsY`)
  - 품절 `Y` → `soldOut: true` / 빈칸 → `soldOut: false`
- [x] **품절 칸의 소문자·공백도 `Y`로 인정한다** (`shouldTreatLowercaseAndPaddedYAsSoldOut`)
  - `y`, `" Y "` → `soldOut: true` (점주의 입력 실수 대비)
- [x] **가격이 숫자가 아니면 가격을 비워 둔다** (`shouldSetPriceNullWhenNotNumeric`)
  - `"시가"`, `"4,500원"` → `price: null` (화면에 가격 안 보임)
- [x] **카테고리가 빈칸이면 빈 문자열로 둔다** (`shouldDefaultCategoryToEmptyString`)
  - 카테고리 빈칸 → `category: ""` (소제목 없이 표시)

### 2-3. `_설정` 시트

- [x] **매장명·테마·자동전환초를 읽는다** (`shouldReadStoreNameThemeAndAutoAdvanceFromSettingsSheet`)
  - `매장명=빌런 커피`, `테마=cream`, `자동전환초=5` → `{ storeName: "빌런 커피", theme: "cream", autoAdvanceSec: 5 }`
- [x] **`_설정` 시트가 없으면 기본값을 쓴다** (`shouldUseDefaultsWhenSettingsSheetMissing`)
  - `_설정` 없음 → 매장명 `""`, 기본 테마, 자동전환 `0`(수동)
- [x] **자동전환초가 음수거나 글자면 0(수동)으로 본다** (`shouldClampNegativeAutoAdvanceToZero`)
  - `-3`, `"빠르게"` → `autoAdvanceSec: 0`
- [x] **없는 테마 이름이면 기본 테마로 바꾼다** (`shouldFallBackToDefaultThemeWhenUnknown`)
  - `테마=purple` → 기본 테마

### 2-4. 실제 샘플 파일

- [x] **`data/menu.xlsx`를 읽으면 커피·디저트·음료 3페이지가 나온다** (`shouldParseSampleDataMenuXlsx`)
  - 실제 파일로 확인하는 마지막 점검

## 3. 저장 이벤트 합치기 — `src/debounce.mjs`

Excel은 한 번 저장할 때 파일 이벤트를 여러 번 낸다. 이를 300ms 단위로 한 번으로 합친다. 실제 시간 대신 가짜 시계로 테스트한다.

- [x] **300ms 안에 이벤트가 여러 번 와도 한 번만 처리한다** (`shouldCallOnceForBurstWithin300ms`)
  - 0ms, 100ms, 200ms에 이벤트 → 500ms에 처리 1번
- [x] **조용한 시간이 지난 뒤 다시 오면 또 처리한다** (`shouldCallAgainAfterQuietPeriod`)
  - 0ms 이벤트, 1000ms 이벤트 → 처리 2번

## 4. 브라우저에 갱신 알림 보내기 — `src/sse-hub.mjs`

열린 브라우저 목록을 들고 있다가 "메뉴 바뀜" 신호를 보낸다.

- [x] **연결된 모든 브라우저에 신호를 보낸다** (`shouldWriteEventToAllConnectedClients`)
  - 브라우저 2개 연결 후 알림 → 둘 다 받음
- [x] **창을 닫은 브라우저는 목록에서 뺀다** (`shouldRemoveClientOnClose`)
  - 1개 닫힘 후 알림 → 남은 1개만 받음
- [x] **신호를 SSE 형식으로 보낸다** (`shouldFormatEventAsSseFrame`)
  - 보내는 문자열 = `event: menu-updated\ndata: {}\n\n`

## 5. 서버 전체 흐름 — `server.mjs`

위 부품을 연결했을 때의 동작을 확인한다.

- [x] **`GET /api/menu`가 메뉴 JSON을 준다** (`shouldServeMenuJsonFromApiMenu`)
  - 요청 → 200, `pages` 배열 포함
- [x] **`GET /events`가 SSE 연결을 연다** (`shouldRespondEventStreamHeadersOnEvents`)
  - 응답 헤더 `Content-Type: text/event-stream`
- [x] **Excel을 읽다 실패하면 직전 메뉴를 그대로 보여준다** (`shouldKeepPreviousDataWhenParseFails`)
  - 저장 도중 깨진 파일 → `/api/menu`는 이전 정상 데이터
- [x] **읽기에 실패하면 브라우저에 알리지 않는다** (`shouldNotBroadcastWhenParseFails`)
  - 깨진 파일 → 갱신 신호 0번 (화면 깜빡임 방지)
- [x] **Excel 임시 잠금 파일은 무시한다** (`shouldIgnoreExcelLockFiles`)
  - `~$menu.xlsx` 생성 → 아무 일도 없음

## 6. 화면 계산 — `public/` 안의 순수 함수

DOM 없이 테스트할 수 있게 계산만 따로 뺀다.

- [x] **같은 카테고리끼리 묶되 Excel 순서를 지킨다** (`shouldGroupItemsByCategoryInOrder`)
  - `에스프레소, 에스프레소, 브루잉` → 그룹 2개: `에스프레소(2)`, `브루잉(1)`
- [x] **메뉴가 갱신돼도 보던 페이지에 머문다** (`shouldKeepCurrentPageIndexAfterUpdate`)
  - 2번째 페이지를 보는 중 갱신 → 계속 2번째 페이지
- [x] **페이지가 줄면 마지막 페이지로 옮긴다** (`shouldClampPageIndexWhenPagesShrink`)
  - 3번째 페이지를 보는 중 시트 삭제로 2페이지가 됨 → 2번째 페이지
- [x] **자동 전환은 마지막 다음에 처음으로 돌아간다** (`shouldComputeNextPageIndexCyclically`)
  - 3페이지 중 3번째 → 다음은 1번째

## 7. 어드민 설정 — `/admin`에서 `_설정` 시트를 고친다

어드민에서 테마·디바이스·매장 설정을 저장하면 Excel `_설정` 시트에 쓴다. 그러면 기존 파일 감시 → SSE 흐름으로 메뉴판이 바뀐다. 데이터 출처는 여전히 Excel 하나다.

### 7.1 설정 읽기 — `src/parse-workbook.mjs`

- [x] **`_설정`의 디바이스를 읽는다** (`shouldReadDeviceFromSettingsSheet`)
  - `디바이스 = mobile` → `device: "mobile"`
- [x] **모르는 디바이스는 기본 디바이스로 바꾼다** (`shouldFallBackToDefaultDeviceWhenUnknown`)
  - `디바이스 = tv` 또는 없음 → `device: "tablet-port"`
- [x] **`_설정`의 영문태그를 읽는다** (`shouldReadTaglineFromSettingsSheet`)
  - `영문태그 = SPECIALTY COFFEE` → `tagline: "SPECIALTY COFFEE"`, 없으면 `""`

### 7.2 설정 쓰기 — `src/write-settings.mjs`

- [x] **`_설정`의 값을 바꾸고 메뉴 시트는 건드리지 않는다** (`shouldWriteSettingsIntoSettingsSheet`)
  - 테마 `beige` → `cream`으로 저장 → 다시 파싱하면 `cream`, 커피 시트 항목은 그대로
- [x] **없는 설정 행과 `_설정` 시트는 새로 만든다** (`shouldCreateSettingsSheetWhenMissing`)
  - `_설정` 없는 워크북에 저장 → `_설정` 시트가 생기고 다시 파싱하면 저장한 값

### 7.3 입력 검증 — `src/validate-settings.mjs`

- [x] **올바른 입력은 다듬어서 받는다** (`shouldAcceptValidSettings`)
  - 매장명 `" 빌런 커피 "`, 자동전환초 `"5"` → `storeName: "빌런 커피"`, `autoAdvanceSec: 5`
- [x] **모르는 테마·디바이스는 거절한다** (`shouldRejectUnknownThemeOrDevice`)
  - 테마 `purple`, 디바이스 `tv` → `ok: false`, 오류에 `theme`, `device`
- [x] **자동전환초는 0 이상 정수만 받는다** (`shouldRejectInvalidAutoAdvanceSec`)
  - `-1`, `1.5`, `"빠르게"` → 모두 `ok: false`

### 7.4 로그인 — `src/admin-auth.mjs`

- [ ] **맞는 계정에만 세션을 준다** (`shouldIssueSessionOnlyForCorrectCredentials`)
  - `admin/1234` → 토큰, 그 토큰은 유효. `admin/0000` → `null`

### 7.5 어드민 API — `src/app.mjs`

- [ ] **세션 없이 설정 API를 부르면 401** (`shouldRejectAdminSettingsWithoutSession`)
- [ ] **로그인하면 HttpOnly 세션 쿠키를 준다** (`shouldLoginAndSetSessionCookie`)
  - 맞는 계정 → 200 + `Set-Cookie: ...; HttpOnly`, 틀린 계정 → 401
- [ ] **세션이 있으면 현재 설정과 선택지를 준다** (`shouldReturnCurrentSettingsAndOptions`)
  - → `{ settings, themes, devices }`
- [ ] **올바른 설정을 저장한다** (`shouldSaveValidSettingsWithSession`)
  - `PUT /api/admin/settings` → `saveSettings`가 검증된 값으로 1번 불림, 204
- [ ] **잘못된 설정은 400이고 저장하지 않는다** (`shouldRejectInvalidSettingsWith400`)
- [ ] **로그아웃하면 세션이 끊긴다** (`shouldEndSessionOnLogout`)
  - 로그아웃 뒤 같은 쿠키로 설정 API → 401
