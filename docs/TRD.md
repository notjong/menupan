# TRD — Excel 구동 카페 메뉴판

PRD: `docs/PRD.md`

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 런타임 | Node.js (ESM, `.mjs`) | 빌드 단계 없이 실행한다 |
| HTTP | `express` | 정적 파일과 JSON API 2개만 제공한다 |
| 파일 감시 | `chokidar` | Excel 저장 시 생기는 rename/atomic write 이벤트를 안정적으로 잡는다 |
| Excel 파싱 | `xlsx`(SheetJS) 0.20.3 | 공식 CDN tarball로 설치한다 |
| 실시간 푸시 | SSE (`text/event-stream`) | 서버에서 클라이언트로 가는 단방향 신호만 필요하다. WebSocket은 과하다 |
| 클라이언트 | 바닐라 JS + `EventSource` | 프레임워크 없이 템플릿 렌더링만 한다 |
| 테스트 | `node:test` + `node:assert/strict` | 의존성을 추가하지 않는다 |

```json
"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
```

npm 레지스트리의 `xlsx`는 0.18.5(구버전)라 쓰지 않는다.

## 2. 구조

```text
package.json
server.mjs                 # 조립: express + watcher + SSE (얇게 유지)
src/
  parse-workbook.mjs       # 순수: workbook → MenuData
  format.mjs               # 순수: 가격 포맷 등 (클라이언트와 공유)
  debounce.mjs             # 순수: 타이머 주입 가능한 디바운스
  sse-hub.mjs              # 연결된 클라이언트 목록 + broadcast
test/
  *.test.mjs
data/menu.xlsx
public/
  index.html
  client.js                # EventSource 수신 → fetch → render
  templates/
    board-grid.css         # 공통 레이아웃 (CSS 변수 기반)
    <theme>.css            # 테마별 변수 값
  assets/<theme>/{bg,frame}-<device>.png
```

원칙: 로직은 `src/`의 순수 모듈에 두고 테스트한다. `server.mjs`는 조립만 한다.

## 3. 데이터 계약

### 3.1 `GET /api/menu` 응답 (MenuData)

```json
{
  "storeName": "빌런 커피",
  "theme": "cafe-dark",
  "autoAdvanceSec": 0,
  "pages": [
    {
      "name": "커피",
      "items": [
        { "name": "아메리카노", "price": 4500, "desc": "깔끔한 산미", "soldOut": false, "category": "에스프레소" }
      ]
    }
  ]
}
```

### 3.2 파싱 규칙 (`parseWorkbook`)

| 입력 | 결과 |
|---|---|
| 시트 이름이 `_`로 시작 | `pages`에서 제외 |
| 시트 순서 | `pages` 순서 = 워크북 시트 순서 |
| `메뉴명`이 빈 행 | 무시 |
| `가격` | 숫자로 변환한다. 숫자가 아니면 `null`로 두고 화면에 가격을 표시하지 않는다 |
| `품절` | 앞뒤 공백을 지우고 대소문자 무관하게 `Y`면 `true`, 그 외 `false` |
| `카테고리` 빈칸 | `""` (그룹 제목 없음) |
| `_설정` 없음 | 기본값: `storeName=""`, `theme=<기본 테마>`, `autoAdvanceSec=0` |
| `자동전환초` 음수·비숫자 | `0` |
| 알 수 없는 `테마` | 기본 테마로 대체 |

### 3.3 가격 포맷

`formatPrice(4500) → "4,500원"`. `Intl.NumberFormat('ko-KR')`을 쓴다. 서버와 클라이언트가 같은 함수를 쓴다.

## 4. 갱신 흐름

```text
menu.xlsx change/add 이벤트
  → debounce(300ms)
  → 파싱해서 메모리 캐시 교체 (실패 시 이전 캐시 유지 + 로그)
  → sseHub.broadcast("menu-updated")
client: EventSource("/events") on "menu-updated" → fetch("/api/menu") → render
```

- **파싱 실패 처리**: Excel 저장 중에는 파일이 잠깐 불완전하거나 잠겨 있을 수 있다. 이때 이전 정상 데이터를 유지하고 broadcast하지 않는다.
- **임시 파일 무시**: `~$menu.xlsx` 같은 Excel 잠금 파일은 감시에서 제외한다.
- **SSE 엔드포인트** `GET /events`: 헤더 `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. 연결이 끊기면 hub에서 제거한다. 재연결은 브라우저 `EventSource` 기본 동작에 맡긴다.
- 이벤트는 신호만 보낸다(`event: menu-updated\ndata: {}\n\n`). 데이터 소스는 `/api/menu` 하나다.

## 5. 클라이언트 렌더링

- 첫 로드에 `/api/menu`를 받고 렌더링한 뒤 `/events`를 구독한다.
- 갱신 시 현재 페이지 인덱스를 유지한다. 페이지 수가 줄면 마지막 페이지로 보정한다.
- 테마: `<link id="theme">`의 `href`를 `templates/<theme>.css`로 바꾼다. 배경·테두리는 CSS 변수로 `assets/<theme>/{bg,frame}-<device>.png`를 지정한다.
- 디바이스 판별은 CSS 미디어쿼리(방향·폭)로 한다. JS는 디바이스를 판별하지 않는다.
- 자동 전환: `autoAdvanceSec > 0`이면 `setInterval`로 다음 페이지로 순환한다. 값이 바뀌면 타이머를 다시 만든다.
- 사용자 데이터는 `textContent`로 넣는다. `innerHTML`에 Excel 값을 넣지 않는다(XSS 방지).

## 6. 테마·디자인

디자인 출처: `design/project/메뉴판 템플릿 시스템.dc.html` (프로토타입. 시각 결과만 맞춘다)

| 테마 ID | 텍스트 | 보조 | 액센트 |
|---|---|---|---|
| light-olive | #33381f | #6e7350 | #6f7637 |
| deep-green | #f0ecd8 | #a9bcab | #c8a24a |
| cream | #3c3120 | #897354 | #b5602f |
| beige | #352a1a | #827049 | #7a8246 |

- 폰트: 메뉴명·매장명 `Nanum Myeongjo`(serif, 메뉴판 인쇄물 느낌), 본문·가격 `Pretendard`(한글 가독성).
- 레이아웃: `tablet-land`만 2열, 나머지 1열.
- 테두리 PNG는 가운데가 투명한 오버레이다. 배경 PNG 위에 겹친다.

## 7. 미결 사항

1. **테마 목록 불일치**: 원본 요구사항은 `cafe-dark`, `bistro-light` 2종이다. 디자인 번들은 위 4종이다. `design/project/assets/`에는 8종 폴더가 모두 있다. → 확정 전까지 "`assets/<theme>/`와 `templates/<theme>.css`가 모두 있는 ID = 유효한 테마"로 처리한다. 기본 테마는 확정이 필요하다.
2. 기본 포트는 3000이다. `PORT` 환경변수로 바꿀 수 있게 할지 정해야 한다.
