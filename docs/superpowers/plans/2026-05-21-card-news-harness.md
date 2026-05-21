# Card News Prompt Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 주제만 바꿔 인스타그램 1080x1080 카드뉴스 이미지를 만들기 위한 카드별 GPT 이미지 생성 최종 프롬프트를 생성한다.

**Architecture:** CLI와 JSON 입력을 `CardNewsRequest`로 정규화하고, 로컬 플래너가 2-10장 카드 콘텐츠, 디자인 프리셋, 시각 스타일, 전문 분야 안전 컨텍스트를 만든다. 프롬프트 작성기는 카드별로 정확한 한글 문구, 비주얼 방향, 내비게이션 규칙, 금지 조건, 출처/검수/면책 컨텍스트를 포함한 최종 이미지 생성 프롬프트를 `output/<topic>/prompt-XX.md`로 저장한다.

**Tech Stack:** Node.js CommonJS, Node 내장 `node:test`, Markdown prompt files

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `src/utils.js`
- Create: `topics/example.json`

- [x] **Step 1: Write project metadata**

`package.json`에 `create`, `test`, `test:watch` 스크립트를 둔다. 외부 npm 패키지는 사용하지 않는다.

- [x] **Step 2: Add shared utilities**

`src/utils.js`에 `slugifyTopic`, `clampCardCount`, `ensureInsideWorkspace`를 둔다.

- [x] **Step 3: Add example topic**

`topics/example.json`에 JSON 입력 예시를 둔다.

### Task 2: Input Normalization

**Files:**
- Create: `test/input.test.js`
- Create: `src/input.js`

- [x] **Step 1: Write failing tests**

테스트는 CLI 한 줄 입력, JSON 파일 입력, 카드 수 제한, 시각 스타일 입력, 누락 주제 오류를 검증한다.

- [x] **Step 2: Run test and verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/input.js` does not exist.

- [x] **Step 3: Implement input normalization**

`normalizeInput(args, options)`는 `{ topic, audience, goal, maxCards, designPreset, visualStyle, brand }`를 반환한다.

- [x] **Step 4: Run test and verify pass**

Run: `npm.cmd test`
Expected: PASS

### Task 3: Local Planner

**Files:**
- Create: `test/planner.test.js`
- Create: `src/planner.js`

- [x] **Step 1: Write failing tests**

테스트는 2-10장 제한, 표지/본문/마무리 구성, 표지/마무리 내비게이션 제거, 본문 내비게이션 방식, preset별 텍스트 밀도, 프리셋 자동 선택, 시각 스타일 자동 선택, 수동 override를 검증한다.

- [x] **Step 2: Run test and verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/planner.js` does not exist.

- [x] **Step 3: Implement local planner**

`createCardNewsPlan(request)`는 기획 요약, 디자인 프리셋, 카드 배열, 메타데이터를 반환한다.

- [x] **Step 4: Run test and verify pass**

Run: `npm.cmd test`
Expected: PASS

### Task 4: GPT Image Prompt Writer

**Files:**
- Create: `test/prompt.test.js`
- Create: `src/prompt.js`
- Delete: `src/render.js`
- Delete: `test/render.test.js`

- [x] **Step 1: Write failing tests**

테스트는 카드 1장 최종 프롬프트, 카드별 파일 생성, 특정 카드만 출력, 내비게이션 문구, 시각 스타일 hard rule, 레거시 HTML 산출물 정리와 최종 PNG 보존을 검증한다.

- [x] **Step 2: Run test and verify failure**

Run: `npm.cmd test -- test/prompt.test.js`
Expected: FAIL because `src/prompt.js` does not exist or legacy cleanup is missing.

- [x] **Step 3: Implement prompt writer**

`buildImagePrompt(plan, card)`는 GPT 이미지 생성에 바로 붙여 넣을 최종 프롬프트를 만든다. `writePromptFiles(plan, options)`는 `prompt-XX.md`와 `prompts.md`를 만든다.

- [x] **Step 4: Run test and verify pass**

Run: `npm.cmd test -- test/prompt.test.js`
Expected: PASS

### Task 5: CLI Orchestration and Checklist

**Files:**
- Modify: `test/cli.test.js`
- Modify: `src/cli.js`
- Modify: `docs/checklists/card-news-harness.md`

- [x] **Step 1: Write failing CLI tests**

테스트는 `runCli(["청년 창업"])`가 output 디렉터리, prompt 파일 목록, checklist 경로를 반환하는지 검증한다.

- [x] **Step 2: Run test and verify failure**

Run: `npm.cmd test`
Expected: FAIL because CLI orchestration has not yet connected prompt files and checklist output.

- [x] **Step 3: Implement CLI orchestration**

CLI는 입력 정규화, 플랜 생성, 프롬프트 파일 생성, 실행 체크리스트 생성을 순서대로 수행한다. `--card N`으로 특정 카드만 다시 출력한다.

- [x] **Step 4: Run test and verify pass**

Run: `npm.cmd test`
Expected: PASS

### Task 6: End-to-End Verification

**Files:**
- Generated: `output/<topic>/prompt-XX.md`
- Generated: `output/<topic>/prompts.md`
- Generated: `output/<topic>/checklist.md`

- [x] **Step 1: Run all tests**

Run: `npm.cmd test`
Expected: all tests PASS

### Task 10: Prompt Quality and Regeneration Safety Refresh

**Files:**
- Create: `src/korean.js`
- Create: `test/korean.test.js`
- Modify: `src/input.js`
- Modify: `src/planner.js`
- Modify: `src/professional.js`
- Modify: `src/prompt.js`
- Modify: `src/cli.js`
- Modify: `src/utils.js`
- Modify: `README.md`
- Modify: `docs/checklists/card-news-harness.md`
- Test: `test/input.test.js`
- Test: `test/planner.test.js`
- Test: `test/prompt.test.js`
- Test: `test/cli.test.js`

- [x] **Step 1: Write failing tests**

구조화 카드 내용, facts/mustInclude/sourceNotes, 한글 조사, style guide 생성, 비파괴 `--card N` 재생성, 최종 PNG 보존, 누락 옵션 오류 메시지를 검증한다.

- [x] **Step 2: Implement input and Korean copy helpers**

`contentOutline`/`cards`, `facts`, `mustInclude`, `sourceNotes`를 입력 요청으로 정규화하고, `src/korean.js`에서 을/를, 이/가, 은/는 조사를 처리한다.

- [x] **Step 3: Improve planner content quality**

구조화 카드 내용이 있으면 범용 템플릿보다 우선하고, 전세/부동산 및 소상공인 마케팅 주제에는 더 구체적인 기본 템플릿을 사용한다. 플랜에 `styleAnchor`와 `contentControls`를 추가한다.

- [x] **Step 4: Improve prompt output safety**

카드별 프롬프트에 Series style anchor, Content controls, 긴 한글 제목 두 줄 규칙을 추가하고, `style-guide.md`를 생성한다. `--card N`은 해당 프롬프트만 갱신하고 기존 프롬프트와 최종 PNG를 유지한다.

- [x] **Step 5: Update docs and samples**

README, 체크리스트, JSON 예시, output 샘플을 현재 동작 기준으로 갱신한다.

- [x] **Step 6: Verify**

Run: `npm.cmd test`
Expected: all tests PASS

- [x] **Step 2: Run sample prompt generation**

Run: `npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트"`
Expected: `output/소상공인-온라인-마케팅-체크리스트/prompt-01.md` exists.

- [x] **Step 3: Run selected-card prompt generation**

Run: `npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트" --card 2`
Expected: selected-card run returns one prompt file.

- [x] **Step 4: Record result**

실행 결과와 남은 개선 작업을 `docs/checklists/card-news-harness.md`와 output별 `checklist.md`에 남긴다.

### Task 7: Professional Safety Context

**Files:**
- Create: `src/professional.js`
- Modify: `src/input.js`
- Modify: `src/planner.js`
- Modify: `src/prompt.js`
- Modify: `src/cli.js`
- Modify: `README.md`
- Modify: `docs/checklists/card-news-harness.md`
- Test: `test/input.test.js`
- Test: `test/planner.test.js`
- Test: `test/prompt.test.js`
- Test: `test/cli.test.js`

- [x] **Step 1: Write failing tests**

전문 분야 JSON 입력, CLI 입력, 도메인 자동 감지, 전문 프롬프트 안전 문구, 전문 검수 체크리스트 테스트를 추가한다.

- [x] **Step 2: Implement professional module**

`src/professional.js`에 `real_estate`, `insurance`, `legal`, `medical` 도메인, 출처 정규화, 콘텐츠 유형, 검수자 역할, 면책 문구, 금지 표현 로직을 둔다.

- [x] **Step 3: Wire professional context into plan and prompt**

`createCardNewsPlan()` 결과에 `professional` 컨텍스트를 추가하고, `buildImagePrompt()`가 Professional safety 섹션을 포함하게 한다.

- [x] **Step 4: Update checklist and docs**

실행별 `checklist.md`에 Professional Review 섹션을 추가하고, README와 문서에 전문 분야 사용법을 반영한다.

- [x] **Step 5: Verify**

Run: `npm.cmd test`
Expected: all tests PASS

### Task 8: README Usage Reference

**Files:**
- Create: `README.md`
- Modify: `docs/checklists/card-news-harness.md`
- Modify: `package.json`

- [x] **Step 1: Add root README usage guide**

`README.md`에 빠른 시작, CLI 파라미터, 디자인 프리셋, 시각 스타일, JSON 예시, 생성 후 작업 흐름을 정리한다.

- [x] **Step 2: Link checklist to README**

`docs/checklists/card-news-harness.md` 상단에 README를 사용법 기준 문서로 안내한다.

- [x] **Step 3: Align package metadata**

`package.json` 설명이 디자인 프리셋과 시각 스타일 기반 프롬프트 하네스임을 드러내도록 갱신한다.

- [x] **Step 4: Verify docs and tests**

Run: `npm.cmd test`
Expected: all tests PASS

### Task 9: Prompt Differentiation Refresh

**Files:**
- Modify: `src/planner.js`
- Modify: `src/prompt.js`
- Modify: `src/cli.js`
- Modify: `src/utils.js`
- Modify: `README.md`
- Modify: `docs/checklists/card-news-harness.md`
- Modify: `docs/superpowers/specs/2026-05-21-card-news-harness-design.md`
- Modify: `test/planner.test.js`
- Modify: `test/prompt.test.js`
- Modify: `test/cli.test.js`

- [x] **Step 1: Add behavior tests**

표지/마무리 카드의 내비게이션 제거, 본문 카드의 단일 내비게이션, preset별 텍스트 밀도, visualStyle별 hard rule을 검증한다.

- [x] **Step 2: Update planner and prompt writer**

카드 수를 2-10장으로 제한하고, 표지는 `cover`, 마지막은 `closing`으로 고정한다. 본문 카드는 preset에 따라 페이지 번호 또는 좌측 상단 배지 중 하나만 쓰고, visualStyle별 강제 시각 규칙을 프롬프트에 넣는다.

- [x] **Step 3: Update docs and generated samples**

README, 체크리스트, 설계 문서, 샘플 output을 현재 동작 기준으로 갱신한다.

- [x] **Step 4: Verify**

Run: `npm.cmd test`
Expected: all tests PASS
