# TDD-IMPLEMENTS.md — TDD 진행표

`plan.md`의 테스트를 실행 순서대로 하나씩 쪼갠 진행표다. 각 항목은 Kent Beck TDD 사이클 한 바퀴다.

```text
TODO ──/tdd-red──▶ RED ──/tdd-green──▶ GREEN ──/tdd-refactor──▶ DONE
       실패 테스트 1개      최소 구현 + 커밋         구조 개선 + 커밋
                           [BEHAVIORAL]            [STRUCTURAL]
```

## 규칙

- 한 번에 한 항목만 진행한다. `RED` 또는 `GREEN` 항목이 있으면 다음 항목을 시작하지 않는다.
- 위에서부터 순서대로 진행한다. 뒤 항목은 앞 항목의 코드를 전제로 한다.
- 명령어가 `상태`와 `기록` 칸을 갱신한다. 손으로 고칠 때도 같은 형식을 지킨다.
- `DONE`이 되면 `plan.md`의 같은 테스트도 `[x]`로 바꾼다.
- 테스트 실행: 전체 `npm test`, 하나 `node --test --test-name-pattern="<테스트 이름>" <테스트 파일>`

## 항목 양식

```text
### Txx 한 줄 설명
- 상태: TODO | RED | GREEN | DONE
- 테스트: <테스트 파일> › <테스트 이름>
- 대상: <제품 코드 파일> › <함수>
- 주어진 상황 → 기대 결과
- Red 기대 실패: Red 단계에서 나와야 할 실패
- Red 기록 / Green 기록 / Refactor 기록: 명령어가 채운다
```

---

## T00 프로젝트 준비 (구조적 준비, 테스트 없음)

- 상태: DONE
- 내용: `/tdd-red`가 처음 실행될 때 `package.json`이 없으면 만든다.
  - `"type": "module"`
  - `"scripts": { "start": "node server.mjs", "test": "node --test" }`
  - 의존성은 넣지 않는다. 처음 필요한 항목에서 설치한다.
- 커밋: `chore: package.json 추가` / `[STRUCTURAL] T00`
- 기록: `package.json` 생성(의존성 없음). `npm test` → `tests 0`, exit 0. 테스트 없는 항목이라 RED/GREEN을 건너뛰고 DONE.

---

## 1. 가격 표시

### T01 가격에 콤마와 "원"을 붙인다

- 상태: DONE
- 테스트: `test/format.test.mjs` › `shouldFormatPriceWithCommaAndWon`
- 대상: `src/format.mjs` › `formatPrice(price)`
- 주어진 상황 → 기대 결과: `formatPrice(4500)` → `"4,500원"`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/format.mjs` 없음)
- Red 기록: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/format.mjs' imported from .../test/format.test.mjs` (tests 1, fail 1)
- Green 기록: Fake It. `formatPrice()`가 상수 `"4,500원"`을 반환한다. 남은 하드코딩: 반환값 `"4,500원"`(테스트 기대값과 중복). 미사용 경고(ts 6133)를 없애려고 매개변수 `price`를 뺐다. 일반화할 때 다시 넣는다.
- Refactor 기록: 테스트와 코드 사이 중복(`4500` ↔ `"4,500원"`) 제거. (1) Introduce Parameter `price` + Substitute Algorithm(상수 → `Intl.NumberFormat("ko-KR")`, TRD 3.3절). 매개변수만 넣으면 미사용 경고가 다시 나서 두 단계를 한 번에 했다. (2) Extract Constant `KRW_NUMBER_FORMAT`, `PRICE_UNIT`. 단계마다 `npm test` 통과. 남은 하드코딩 없음.

### T02 가격이 없으면 빈 문자열을 반환한다

- 상태: DONE
- 테스트: `test/format.test.mjs` › `shouldReturnEmptyStringWhenPriceIsNull`
- 대상: `src/format.mjs` › `formatPrice(price)`
- 주어진 상황 → 기대 결과: `formatPrice(null)` → `""`
- Red 기대 실패: `AssertionError` (`"null원"` 같은 값이 나옴)
- Red 기록: `AssertionError: actual '0원', expected ''` (Intl.NumberFormat이 null을 0으로 바꿈)
- Green 기록: Obvious Implementation. `price === null`이면 `""` 반환(가드 절). 남은 하드코딩 없음.
- Refactor 기록: 변경 없음. 가드 절 한 줄이고 중복·매직 값 없음. 남은 하드코딩 없음.

---

## 2. Excel 읽기

공통: 테스트는 `XLSX.utils.book_new()`, `XLSX.utils.aoa_to_sheet()`로 작은 워크북을 직접 만든다. T03의 Red 단계에서 `xlsx`를 설치한다.

```bash
npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

반환 형식은 `docs/TRD.md` 3.1절의 `MenuData`를 따른다.

### 2-1. 시트 → 페이지

### T03 시트 하나가 메뉴판 페이지 하나가 된다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldTurnEachSheetIntoPage`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook(workbook)`
- 주어진 상황 → 기대 결과: 시트 `커피`, `디저트` → `pages.length === 2`, `pages.map(p => p.name)` = `["커피", "디저트"]`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/parse-workbook.mjs` 없음)
- Red 기록: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/parse-workbook.mjs'`. 테스트 픽스처용 `xlsx` 0.20.3(CDN) 설치.
- Green 기록: Obvious Implementation. `workbook.SheetNames`를 `{ name }` 페이지로 매핑. 남은 하드코딩 없음.
- Refactor 기록: 변경 없음. 한 줄 매핑이고 중복·매직 값 없음.

### T04 `_`로 시작하는 시트는 페이지에서 뺀다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldExcludeSheetsStartingWithUnderscore`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 시트 `커피`, `_설정` → 페이지 이름 `["커피"]`
- Red 기대 실패: `AssertionError` (`_설정`이 페이지에 포함됨)
- Red 기록: `AssertionError: actual ['커피', '_설정'], expected ['커피']`
- Green 기록: Obvious Implementation. `name.startsWith("_")` 시트를 거른다. 남은 하드코딩: 매직 문자열 `"_"`.
- Refactor 기록: (1) Introduce Constant `HIDDEN_SHEET_PREFIX` (2) Extract Function `isMenuSheet`. 단계마다 `npm test` 통과. 남은 하드코딩 없음.

### T05 페이지 순서는 Excel 탭 순서를 따른다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldKeepWorkbookSheetOrder`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 탭 순서 `음료`, `커피` → 페이지 이름 `["음료", "커피"]`
- Red 기대 실패: `AssertionError`. 앞 항목 구현이 이미 순서를 지키면 바로 통과할 수 있다. 그때는 `/tdd-red` 규칙대로 멈추고 사용자에게 확인한다.
- Red 기록: Red 실패 없음: 첫 실행에서 통과. T03 구현이 `SheetNames` 순서를 그대로 쓴다. 테스트는 회귀 테스트로 유지.
- Green 기록: 구현 없음(이미 통과).
- Refactor 기록: 변경 없음. 제품 코드를 건드리지 않았다.

### 2-2. 행 → 메뉴 항목

### T06 각 열이 메뉴 항목의 값이 된다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldMapColumnsToItemFields`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 헤더 `메뉴명 | 가격 | 설명 | 품절 | 카테고리`, 행 `아메리카노 | 4500 | 깔끔한 산미 | (빈칸) | 에스프레소` → `pages[0].items[0]` = `{ name: "아메리카노", price: 4500, desc: "깔끔한 산미", soldOut: false, category: "에스프레소" }`
- Red 기대 실패: `AssertionError` (`items`가 없거나 비어 있음)
- Red 기록: `TypeError: Cannot read properties of undefined (reading '0')` (`items` 없음)
- Green 기록: Obvious Implementation(`XLSX.utils.sheet_to_json`로 행 → 객체) + Fake It(`soldOut: false` 고정). 남은 하드코딩: `soldOut: false`(T08에서 풀림), 열 이름 문자열 5개가 매핑 안에 흩어짐.
- Refactor 기록: (1) Extract Function `toMenuItem` (2) Introduce Constant `MENU_COLUMNS`(열 이름 한곳에 모음). 단계마다 `npm test` 통과. 남은 하드코딩: `soldOut: false` — 일반화할 테스트가 아직 없어 남김, T08에서 풀림.

### T07 메뉴명이 빈 행은 건너뛴다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldSkipRowsWithEmptyName`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 행 `아메리카노`, (메뉴명 빈 행), `라떼` → `items.map(i => i.name)` = `["아메리카노", "라떼"]`
- Red 기대 실패: `AssertionError` (빈 항목이 섞임)
- Red 기록: `AssertionError: actual ['아메리카노', '', '라떼'], expected ['아메리카노', '라떼']`
- Green 기록: Obvious Implementation. 메뉴명이 falsy인 행을 `filter`로 거른다. 남은 하드코딩 없음. 정리 거리: 익명 조건식, `parseWorkbook` 안 중첩 파이프라인.
- Refactor 기록: (1) Extract Function `hasMenuName` (2) Extract Function `parseMenuSheet`. 단계마다 `npm test` 통과. 남은 하드코딩: `soldOut: false` — T08에서 풀림.

### T08 품절 칸이 `Y`면 품절로 표시한다

- 상태: DONE
- 테스트: `test/parse-workbook.test.mjs` › `shouldMarkItemSoldOutWhenColumnIsY`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 품절 `Y` → `soldOut: true` / 품절 빈칸 → `soldOut: false`
- Red 기대 실패: `AssertionError` (T06의 Fake It으로 `soldOut`이 늘 `false`)
- Red 기록: `AssertionError: actual false, expected true` (T06의 Fake It `soldOut: false`)
- Green 기록: Obvious Implementation. `row[품절] === "Y"`. Fake It `soldOut: false` 제거. 남은 하드코딩: 매직 문자열 `"Y"`.
- Refactor 기록: Introduce Constant `SOLD_OUT_MARK`. `npm test` 통과. 남은 하드코딩 없음.

### T09 품절 칸의 소문자·공백도 `Y`로 인정한다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldTreatLowercaseAndPaddedYAsSoldOut`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 품절 `y` → `true`, 품절 `" Y "` → `true`
- Red 기대 실패: `AssertionError` (`false`가 나옴)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T10 가격이 숫자가 아니면 `null`로 둔다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldSetPriceNullWhenNotNumeric`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 가격 `"시가"` → `price: null`, 가격 `"4,500원"` → `price: null`
- Red 기대 실패: `AssertionError` (`"시가"`, `NaN` 등이 나옴)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T11 카테고리가 빈칸이면 빈 문자열로 둔다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldDefaultCategoryToEmptyString`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 카테고리 빈칸 → `category: ""`
- Red 기대 실패: `AssertionError` (`undefined`가 나옴)
- Red 기록:
- Green 기록:
- Refactor 기록:

### 2-3. `_설정` 시트

공통: 기본 테마가 아직 정해지지 않았다(`docs/TRD.md` 7절). 그래서 테마 관련 값은 인자로 받는다: `parseWorkbook(workbook, { themes, defaultTheme })`. 테스트가 값을 넘긴다.

### T12 매장명·테마·자동전환초를 읽는다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldReadStoreNameThemeAndAutoAdvanceFromSettingsSheet`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: `_설정` 시트(헤더 `항목 | 값`) 행 `매장명 | 빌런 커피`, `테마 | cream`, `자동전환초 | 5`, 옵션 `{ themes: ["cream", "beige"], defaultTheme: "beige" }` → `{ storeName: "빌런 커피", theme: "cream", autoAdvanceSec: 5 }`
- Red 기대 실패: `AssertionError` (`storeName` 등이 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T13 `_설정` 시트가 없으면 기본값을 쓴다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldUseDefaultsWhenSettingsSheetMissing`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: 시트 `커피`만 있음, 옵션 `{ themes: ["cream", "beige"], defaultTheme: "beige" }` → `{ storeName: "", theme: "beige", autoAdvanceSec: 0 }`
- Red 기대 실패: `TypeError` 또는 `AssertionError` (`_설정`이 있다고 가정한 코드)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T14 자동전환초가 음수거나 글자면 0으로 본다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldClampNegativeAutoAdvanceToZero`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: `자동전환초 | -3` → `autoAdvanceSec: 0`, `자동전환초 | 빠르게` → `autoAdvanceSec: 0`
- Red 기대 실패: `AssertionError` (`-3`, `NaN`이 나옴)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T15 없는 테마 이름이면 기본 테마로 바꾼다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldFallBackToDefaultThemeWhenUnknown`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook`
- 주어진 상황 → 기대 결과: `테마 | purple`, 옵션 `{ themes: ["cream", "beige"], defaultTheme: "beige" }` → `theme: "beige"`
- Red 기대 실패: `AssertionError` (`"purple"`이 나옴)
- Red 기록:
- Green 기록:
- Refactor 기록:

### 2-4. 실제 샘플 파일

### T16 `data/menu.xlsx`를 읽으면 커피·디저트·음료 3페이지가 나온다

- 상태: TODO
- 테스트: `test/parse-workbook.test.mjs` › `shouldParseSampleDataMenuXlsx`
- 대상: `src/parse-workbook.mjs` › `parseWorkbook` (파일 읽기는 테스트에서 `XLSX.readFile`로 한다)
- 주어진 상황 → 기대 결과: `data/menu.xlsx` → 페이지 이름 `["커피", "디저트", "음료"]`
- 주의: Red 전에 실제 파일의 시트 이름을 먼저 확인한다. 다르면 기대값을 맞추기 전에 사용자에게 알린다.
- Red 기대 실패: 앞 항목이 모두 끝났다면 바로 통과할 수 있다. 그때는 `/tdd-red` 규칙대로 멈추고 사용자에게 확인한다(이 항목은 회귀 점검용이다).
- Red 기록:
- Green 기록:
- Refactor 기록:

---

## 3. 저장 이벤트 합치기

공통: 실제 시간을 기다리지 않는다. `node:test`의 `mock.timers`(`t.mock.timers.enable({ apis: ["setTimeout"] })`, `t.mock.timers.tick(ms)`)로 시간을 흘린다.

### T17 300ms 안에 이벤트가 여러 번 와도 한 번만 처리한다

- 상태: TODO
- 테스트: `test/debounce.test.mjs` › `shouldCallOnceForBurstWithin300ms`
- 대상: `src/debounce.mjs` › `debounce(fn, ms)`
- 주어진 상황 → 기대 결과: `debounce(fn, 300)`을 0ms, 100ms, 200ms에 호출하고 500ms까지 흘림 → `fn` 호출 1번
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/debounce.mjs` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T18 조용한 시간이 지난 뒤 다시 오면 또 처리한다

- 상태: TODO
- 테스트: `test/debounce.test.mjs` › `shouldCallAgainAfterQuietPeriod`
- 대상: `src/debounce.mjs` › `debounce`
- 주어진 상황 → 기대 결과: 0ms 호출, 1000ms 호출, 1500ms까지 흘림 → `fn` 호출 2번
- Red 기대 실패: `AssertionError` (한 번만 호출되는 가짜 구현)
- Red 기록:
- Green 기록:
- Refactor 기록:

---

## 4. 브라우저에 갱신 알림 보내기

공통: 실제 HTTP 응답 대신 `write`, `on("close")`만 가진 가짜 응답 객체를 쓴다.

### T19 신호를 SSE 형식으로 만든다

- 상태: TODO
- 테스트: `test/sse-hub.test.mjs` › `shouldFormatEventAsSseFrame`
- 대상: `src/sse-hub.mjs` › `formatSseEvent(name, data)`
- 주어진 상황 → 기대 결과: `formatSseEvent("menu-updated", {})` → `"event: menu-updated\ndata: {}\n\n"`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/sse-hub.mjs` 없음)
- 순서 메모: `plan.md`에서는 4절 마지막이다. 아래 T20이 이 형식을 쓰므로 먼저 둔다.
- Red 기록:
- Green 기록:
- Refactor 기록:

### T20 연결된 모든 브라우저에 신호를 보낸다

- 상태: TODO
- 테스트: `test/sse-hub.test.mjs` › `shouldWriteEventToAllConnectedClients`
- 대상: `src/sse-hub.mjs` › `createSseHub()` → `{ add(res), broadcast(name, data) }`
- 주어진 상황 → 기대 결과: 가짜 응답 2개 `add` 후 `broadcast("menu-updated", {})` → 두 응답 모두 `write("event: menu-updated\ndata: {}\n\n")` 1번
- Red 기대 실패: `SyntaxError`(export 없음) 또는 `TypeError` (`createSseHub` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T21 창을 닫은 브라우저는 목록에서 뺀다

- 상태: TODO
- 테스트: `test/sse-hub.test.mjs` › `shouldRemoveClientOnClose`
- 대상: `src/sse-hub.mjs` › `createSseHub`
- 주어진 상황 → 기대 결과: 응답 2개 `add`, 1개가 `close` 이벤트 발생, `broadcast` → 남은 1개만 `write` 받음
- Red 기대 실패: `AssertionError` (닫힌 응답에도 `write`됨)
- Red 기록:
- Green 기록:
- Refactor 기록:

---

## 5. 서버 전체 흐름

공통: `server.mjs`는 조립만 한다. 테스트할 수 있게 부품을 나눈다.

- `src/app.mjs` › `createApp({ getMenu, hub })`: express 앱을 반환한다. `listen`하지 않는다.
- `src/reloader.mjs` › `createReloader({ readWorkbook, parse, hub, log })`: 파일이 바뀌었을 때 실행할 `reload()`와 현재 데이터 `getMenu()`를 반환한다.
- `src/watch-filter.mjs` › `shouldReload(path)`: 감시할 파일인지 판정한다.

HTTP 테스트는 `app.listen(0)`으로 빈 포트에 띄우고 `fetch`로 부른 뒤 닫는다. T22의 Green에서 `express`를 설치한다.

### T22 `GET /api/menu`가 메뉴 JSON을 준다

- 상태: TODO
- 테스트: `test/app.test.mjs` › `shouldServeMenuJsonFromApiMenu`
- 대상: `src/app.mjs` › `createApp`
- 주어진 상황 → 기대 결과: `getMenu`가 `{ pages: [{ name: "커피", items: [] }] }`를 반환 → `GET /api/menu` 응답 200, 본문 `pages[0].name === "커피"`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/app.mjs` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T23 `GET /events`가 SSE 연결을 연다

- 상태: TODO
- 테스트: `test/app.test.mjs` › `shouldRespondEventStreamHeadersOnEvents`
- 대상: `src/app.mjs` › `createApp` (`hub.add(res)` 호출)
- 주어진 상황 → 기대 결과: `GET /events` → 응답 헤더 `content-type`이 `text/event-stream`으로 시작, `cache-control: no-cache`. 헤더 확인 후 요청을 끊는다(`AbortController`).
- Red 기대 실패: `AssertionError` (404)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T24 Excel을 읽다 실패하면 직전 메뉴를 유지한다

- 상태: TODO
- 테스트: `test/reloader.test.mjs` › `shouldKeepPreviousDataWhenParseFails`
- 대상: `src/reloader.mjs` › `createReloader`
- 주어진 상황 → 기대 결과: 첫 `reload()`는 정상 데이터 A, 두 번째 `reload()`에서 `readWorkbook`이 예외를 던짐 → `getMenu()`는 여전히 A, `log`가 1번 호출됨
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/reloader.mjs` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T25 읽기에 실패하면 브라우저에 알리지 않는다

- 상태: TODO
- 테스트: `test/reloader.test.mjs` › `shouldNotBroadcastWhenParseFails`
- 대상: `src/reloader.mjs` › `createReloader`
- 주어진 상황 → 기대 결과: 정상 `reload()` 1번 → `hub.broadcast` 1번. 이어서 실패하는 `reload()` 1번 → `hub.broadcast`는 여전히 1번
- Red 기대 실패: `AssertionError` (실패해도 broadcast함). 앞 항목 구현이 이미 막고 있으면 바로 통과할 수 있다. 그때는 멈추고 사용자에게 확인한다.
- Red 기록:
- Green 기록:
- Refactor 기록:

### T26 Excel 임시 잠금 파일은 무시한다

- 상태: TODO
- 테스트: `test/watch-filter.test.mjs` › `shouldIgnoreExcelLockFiles`
- 대상: `src/watch-filter.mjs` › `shouldReload(path)`
- 주어진 상황 → 기대 결과: `shouldReload("data/~$menu.xlsx")` → `false`, `shouldReload("data/menu.xlsx")` → `true`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`src/watch-filter.mjs` 없음)
- 후속: 이 항목이 `DONE`이 되면 `server.mjs`에서 부품을 조립한다(chokidar 설치, `debounce` + `shouldReload` + `createReloader` + `createApp`). 조립은 새 행위가 없는 연결 작업이므로 별도 구조적 커밋으로 하고, `npm start`로 직접 확인한다.
- Red 기록:
- Green 기록:
- Refactor 기록:

---

## 6. 화면 계산

공통: DOM 없이 테스트할 수 있게 계산만 `public/board-state.mjs`에 둔다. 브라우저의 `client.js`가 이 모듈을 import한다.

### T27 같은 카테고리끼리 묶되 Excel 순서를 지킨다

- 상태: TODO
- 테스트: `test/board-state.test.mjs` › `shouldGroupItemsByCategoryInOrder`
- 대상: `public/board-state.mjs` › `groupByCategory(items)`
- 주어진 상황 → 기대 결과: 카테고리 순서 `에스프레소, 에스프레소, 브루잉` → `[{ category: "에스프레소", items: [2개] }, { category: "브루잉", items: [1개] }]`
- Red 기대 실패: `ERR_MODULE_NOT_FOUND` (`public/board-state.mjs` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T28 메뉴가 갱신돼도 보던 페이지에 머문다

- 상태: TODO
- 테스트: `test/board-state.test.mjs` › `shouldKeepCurrentPageIndexAfterUpdate`
- 대상: `public/board-state.mjs` › `resolvePageIndex(currentIndex, pageCount)`
- 주어진 상황 → 기대 결과: `resolvePageIndex(1, 3)` → `1`
- Red 기대 실패: `SyntaxError` (export `resolvePageIndex` 없음)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T29 페이지가 줄면 마지막 페이지로 옮긴다

- 상태: TODO
- 테스트: `test/board-state.test.mjs` › `shouldClampPageIndexWhenPagesShrink`
- 대상: `public/board-state.mjs` › `resolvePageIndex`
- 주어진 상황 → 기대 결과: `resolvePageIndex(2, 2)` → `1`
- Red 기대 실패: `AssertionError` (T28의 Fake It 또는 그대로 반환하는 구현이 `2`를 냄)
- Red 기록:
- Green 기록:
- Refactor 기록:

### T30 자동 전환은 마지막 다음에 처음으로 돌아간다

- 상태: TODO
- 테스트: `test/board-state.test.mjs` › `shouldComputeNextPageIndexCyclically`
- 대상: `public/board-state.mjs` › `nextPageIndex(currentIndex, pageCount)`
- 주어진 상황 → 기대 결과: `nextPageIndex(2, 3)` → `0`, `nextPageIndex(0, 3)` → `1`
- Red 기대 실패: `SyntaxError` (export `nextPageIndex` 없음)
- 후속: 이 항목이 `DONE`이 되면 `public/index.html`, `client.js`, 테마 CSS를 만든다. 화면 코드는 `docs/TRD.md` 5·6절과 `.claude/rules/anti-ai-slop.md`를 따른다. 브라우저에서 PRD 7절 인수 조건 6개를 직접 확인한다.
- Red 기록:
- Green 기록:
- Refactor 기록:
