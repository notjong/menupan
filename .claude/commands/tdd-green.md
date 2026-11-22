---
description: TDD Green — RED 상태 항목의 테스트를 통과시키는 최소한의 코드만 작성한다
allowed-tools: Read, Edit, Write, Bash(npm test:*), Bash(node --test:*), Bash(npm install:*), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

# /tdd-green — 테스트를 통과시키는 최소 구현

Kent Beck TDD의 **Green** 단계다. `CLAUDE.md`의 "개발 프로세스" 절을 따른다.

## 1. 항목 확인

1. `TDD-IMPLEMENTS.md`를 읽는다.
2. 상태가 `RED`인 항목을 찾는다.
   - 없으면 멈추고 `/tdd-red`를 먼저 실행하라고 알린다.
   - `GREEN` 항목이 있으면 멈추고 `/tdd-refactor`를 먼저 실행하라고 알린다.
3. 해당 테스트를 실행해 아직 실패하는지 확인한다: `node --test --test-name-pattern="<테스트 이름>" <테스트 파일>`

## 2. 최소 구현

- 항목의 **대상** 파일과 함수에만 코드를 쓴다.
- 이 테스트 하나를 통과시키는 데 **딱 필요한 만큼만** 쓴다. 다음 항목의 경우, 예외 처리, 옵션을 미리 넣지 않는다.
- 가장 빠른 길을 고른다. Kent Beck의 Green 전략 중 하나를 쓴다.
  - **가짜로 구현하기(Fake It)**: 상수를 그대로 반환한다. 일반화는 다음 테스트나 `/tdd-refactor`가 한다.
  - **명백한 구현(Obvious Implementation)**: 구현이 한 줄로 명백할 때만 쓴다.
- 제품 코드용 의존성(예: `express`, `chokidar`)은 이 항목이 처음 필요로 할 때만 설치한다.
- **테스트 코드는 고치지 않는다.** 테스트가 틀렸다고 판단되면 멈추고 사용자에게 알린다.

## 3. 통과 확인

1. 해당 테스트를 실행해 통과를 확인한다.
2. 전체 테스트를 실행한다: `npm test`. **모두 통과해야 한다.** 다른 테스트가 깨지면 이 단계 안에서 고친다.
3. 경고(Node 경고, 미사용 import 등)가 있으면 해결한다.

## 4. 기록

`TDD-IMPLEMENTS.md`에서 이 항목을 갱신한다.

- `상태`를 `RED`에서 `GREEN`으로 바꾼다.
- `Green 기록`에 쓴 전략(Fake It 또는 Obvious Implementation)과, 남겨 둔 하드코딩이 있으면 그 내용을 적는다. `/tdd-refactor`가 이 기록을 읽는다.

## 5. 커밋 (행위적 변경)

모든 테스트가 통과했으므로 커밋한다. 이번 변경은 **행위적 변경**이다.

- 스테이징: 테스트 파일, 대상 파일, `TDD-IMPLEMENTS.md`, (의존성을 설치했으면) `package.json`, `package-lock.json`
- 메시지 형식:

```text
feat(<모듈>): <항목 한 줄 설명>

[BEHAVIORAL] <항목 ID> <테스트 이름>
```

## 6. 보고

다음 세 줄만 보고한다.

- 항목 ID와 통과한 테스트 수 / 전체 테스트 수
- 쓴 전략과 남은 하드코딩
- 다음 단계: `/tdd-refactor`
