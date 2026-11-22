# Claude Code 프롬프트 모음

- 프로젝트: `/Users/jongmoolee/claude-code-project/menupan`
- 범위: cwd 전체 합본 (증분)
- 추출 시각: 2026-11-21 20:50:06
- 세션 수: 1 / 프롬프트 수: 0

---

### 1. 2026-11-21

코드베이스의 @docs/menu-project-requirement.md 를 읽고 /init 을 실행해줘. CLAUDE.md와 PRD.md, TRD.md를 분리해서 작성해주고, 켄트벡의 증강코딩(https://github.com/claude-code-expert/inflearn-docs/blob/main/example/Kentbeck-CLAUDE-ko.md 주소 참고)을 이용해서 개발할 것이므로 TDD 개발 프로세스를 CLAUDE.md에 그대로 적용해서 파일 작성해.

### 2. 2026-11-21

plan.md에서 테스트 목록이 이해하기 어려운데 어떤 테스트인지 알 수 있게 다시 정리해줘

### 3. 2026-11-22

슬래시 명령어로 /tdd-red를 만들어서 TDD-IMPLEMENTS.md의 하나의 프로세스 항목을 실패하는 케이스를 만들어야 하고 그 뒤 /tdd-green으로 해당 케이스를 통과하는 구현을 개발한 뒤 /tdd-refactor를 통해서 하드코딩되거나 소프트웨어 개발 원칙에 맞지 않는 개발 코드들을 리팩토링 해야해

이 전체 프로세스는 켄트벡의 TDD 방법론에 의거해서 진행되어야 하고 각 항목은 TDD-IMPLEMENTS.md에 작성한 것을 기반으로 진행되어야 해

먼저 슬래시 명령어를 각각 만들고 @plan.md을 읽어서 작은단위로 쪼개놓은 개발항목들을 순차적으로 TDD-IMPLEMENTS.md에 정리해줘

### 4. 2026-11-22

1번으로 진행해줘

### 5. 2026-11-22

나머지 전체 테스트도 T01 테스트 진행한 것처럼  tdd-red, tdd-green, tdd-fefactor 순으로 진행해줘

