# Card News Prompt Harness Checklist

## Usage Reference

- [README.md](../../README.md)에서 전체 명령어, 파라미터, CLI 예시, JSON 예시를 확인한다.
- 이 문서는 구현 상태와 다음 작업 체크리스트를 추적한다.

## Current Scope

- [x] CLI 주제 입력 지원
- [x] JSON 파일 입력 지원
- [x] 최대 10장 카드 구성
- [x] 주제별 디자인 프리셋 자동 선택
- [x] 사진형/일러스트형/3D형/잡지형/밈형 시각 스타일 선택
- [x] visualStyle별 강제 시각 규칙으로 결과물 차별화
- [x] 카드 간 스타일 일관성을 위한 `style-guide.md`와 series style anchor 생성
- [x] 긴 한글 제목용 두 줄 제목 규칙을 프롬프트와 style guide에 반영
- [x] preset별 텍스트 밀도 조정
- [x] 구조화 카드 내용 입력(`contentOutline`/`cards`) 지원
- [x] 확인된 사실/필수 반영/출처 메모(`facts`/`mustInclude`/`sourceNotes`) 지원
- [x] 한글 조사 자동 처리로 `임차인를` 같은 문장 오류 방지
- [x] 표지/마무리 카드에서 페이지 번호와 배지 제거
- [x] 본문 카드에서 페이지 번호 또는 좌측 상단 배지 중 하나만 사용
- [x] 부동산/보험/법률/의학 전문 분야 안전 컨텍스트 지원
- [x] 출처/검수자/면책 문구/금지 표현을 프롬프트와 체크리스트에 반영
- [x] 카드별 GPT 이미지 생성 최종 프롬프트 생성
- [x] 기존 프롬프트와 최종 PNG를 보존하는 비파괴 `--card N` 재생성 지원
- [x] 실행별 `output/<topic>/checklist.md` 생성
- [x] 이전 HTML 렌더 산출물 자동 정리

## Commands

PowerShell에서 `npm` 실행 정책 문제가 있으면 `npm.cmd`를 사용한다.

```powershell
npm.cmd test
npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트"
npm.cmd run create -- "여름철 폭염 건강관리" --cards 8 --visual-style photo
npm.cmd run create -- "AI를 꼭 사용해야하는 이유" --preset editorial --style magazine
npm.cmd run create -- "전세 계약 전 확인할 5가지" --domain real_estate --source "국가법령정보센터 공인중개사법|https://www.law.go.kr/|2026-05-21" --reviewer-role "공인중개사 또는 변호사"
npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트" --card 2
npm.cmd run create -- --file topics/example.json
```

## Output

```text
output/<topic>/
  style-guide.md
  prompts.md
  prompt-01.md
  prompt-02.md
  ...
  checklist.md
```

## Next Improvements

- [ ] 생성된 실제 이미지 검수 체크리스트 추가
- [ ] 전문 분야별 출처 요약 카드 템플릿을 더 세분화
- [ ] 실제 이미지 생성 결과를 OCR로 읽어 `Text must be exactly`와 비교하는 검수 도구 추가
