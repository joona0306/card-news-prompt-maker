# Card News Prompt Harness Design

## Goal

주제만 바꿔도 인스타그램용 1080x1080 카드뉴스를 만들기 위한 카드별 GPT 이미지 생성 최종 프롬프트를 생성한다. 이 하네스는 이미지 API를 직접 호출하지 않고, 사용자가 GPT 이미지 생성 기능에 한 장씩 붙여 넣을 수 있는 프롬프트 파일을 만든다.

## Inputs

하네스는 두 가지 입력을 지원한다.

- CLI 주제 입력: `npm.cmd run create -- "청년 창업 지원금"`
- JSON 파일 입력: `npm.cmd run create -- --file topics/example.json`

특정 카드만 다시 만들고 싶을 때는 다음처럼 실행한다.

```powershell
npm.cmd run create -- "청년 창업 지원금" --card 3
```

JSON 입력은 다음 필드를 지원한다.

```json
{
  "topic": "청년 창업 지원금",
  "audience": "예비 창업자",
  "goal": "지원 절차를 쉽게 이해시키기",
  "maxCards": 6,
  "designPreset": "educational",
  "visualStyle": "illustration",
  "domain": "real_estate",
  "contentType": "general_info",
  "sources": [
    {
      "title": "국가법령정보센터 공인중개사법",
      "url": "https://www.law.go.kr/",
      "checkedAt": "2026-05-21"
    }
  ],
  "review": {
    "required": true,
    "reviewerRole": "공인중개사 또는 변호사",
    "status": "required"
  },
  "contentOutline": [
    {
      "title": "등기부등본 먼저 확인",
      "body": "소유자, 근저당, 압류 여부를 계약 전 확인합니다.",
      "bullets": ["계약 당일 재확인", "주소와 소유자 일치 확인"]
    }
  ],
  "facts": ["등기부등본은 계약 직전 다시 확인해야 합니다."],
  "mustInclude": ["전입신고와 확정일자는 별도 확인 항목으로 다룹니다."],
  "sourceNotes": ["출처 확인일을 검수 단계에 남깁니다."],
  "disclaimer": "본 콘텐츠는 일반 정보이며, 개별 계약 판단은 전문가 상담이 필요합니다.",
  "forbiddenClaims": ["확정 수익", "무조건 안전"],
  "brand": {
    "name": "Card News Maker",
    "colors": ["#123456", "#f4f7fb"]
  }
}
```

## Process

1. 입력을 표준 작업 요청으로 정규화한다.
2. 로컬 생성기가 주제, 대상, 목적을 바탕으로 기획 방향을 만든다.
3. 2-10장의 카드 콘텐츠를 구성한다. 첫 장은 표지, 마지막 장은 마무리 카드로 고정한다.
4. 주제 키워드와 입력 옵션을 기준으로 디자인 프리셋을 결정한다.
5. 주제 키워드와 입력 옵션을 기준으로 시각 스타일을 결정한다.
6. `contentOutline` 또는 `cards`가 있으면 구조화된 카드 내용을 범용 템플릿보다 우선한다.
7. 전문 분야가 감지되면 출처, 검수자, 면책 문구, 금지 표현, facts/mustInclude/sourceNotes 컨텍스트를 만든다.
8. 카드별 GPT 이미지 생성용 최종 프롬프트를 만든다.
9. `output/<topic>/style-guide.md`와 `prompt-01.md`부터 카드별 프롬프트 파일을 저장한다.
10. 사용자는 style guide를 기준으로 프롬프트를 한 장씩 GPT 이미지 생성 기능에 넣고 결과 이미지를 검수한다.

## API Policy

프롬프트 생성 자체에는 이미지 API가 필요 없다. 최종 이미지는 사용자가 GPT 이미지 생성 기능에서 직접 생성한다. 따라서 `OPENAI_API_KEY` 없이도 하네스는 동작한다.

## Prompt Requirements

각 카드 프롬프트는 다음을 포함한다.

- 1080x1080 인스타그램 카드뉴스 이미지 요구
- 주제, 대상, 카드 번호, 카드 역할
- 카드별 비주얼 방향
- 시리즈 전체에서 유지할 style anchor
- facts/mustInclude/sourceNotes 기반 Content controls
- 본문 카드의 내비게이션 방식
- 정확히 넣어야 할 한글 텍스트
- 타이포그래피와 색상 팔레트
- 한글 오탈자, 추가 텍스트, 워터마크, QR 코드 금지 조건

표지와 마무리 카드는 페이지 번호, 배지, eyebrow를 표시하지 않는다. 본문 카드는 페이지 번호 또는 좌측 상단 배지 중 하나만 사용한다.

## Design Presets

주제마다 다른 컨셉을 만들 수 있도록 프리셋을 분리한다.

- `educational`: 정보 전달형, 페이지 번호, 본문 + bullet 2개
- `promotional`: 혜택/이벤트형, 페이지 번호, 짧은 본문 + bullet 1개
- `minimal`: 짧은 메시지형, 좌측 상단 배지, bullet 없음
- `bold`: 경고/체크리스트형, 좌측 상단 배지, 짧은 본문 + bullet 2개
- `editorial`: 스토리/인사이트형, 좌측 상단 배지, 관점형 본문

자동 선택은 키워드 기반으로 수행하되, JSON의 `designPreset`이 있으면 그 값을 우선한다.

## Visual Styles

시각 스타일은 디자인 프리셋과 별도 축으로 관리한다. CLI에서는 `--visual-style` 또는 `--style`을 쓰고, JSON에서는 `visualStyle`을 쓴다.

- `photo`: 사진형, photorealistic editorial photography 규칙
- `illustration`: 일러스트형, custom editorial illustration 규칙
- `3d`: 3D형, isometric 3D render 규칙
- `magazine`: 잡지형, magazine editorial layout 규칙
- `meme`: 밈형, meme-card composition 규칙

한국어 별칭도 입력할 수 있다. 예: `사진형`, `일러스트형`, `3D형`, `잡지형`, `밈형`.

## Professional Domains

전문 분야는 정보 오류와 광고 규제 위험이 있으므로 별도 안전 컨텍스트를 만든다.

- `real_estate`: 부동산
- `insurance`: 보험
- `legal`: 법률
- `medical`: 의학/의료

전문 분야 컨텍스트는 `domain`, `contentType`, `sources`, `review`, `disclaimer`, `forbiddenClaims`, `facts`, `mustInclude`, `sourceNotes`를 사용한다. 도메인이 지정되지 않아도 주제 키워드로 보수적으로 감지한다.

## Files

- `package.json`: 실행 스크립트와 Node 내장 테스트 설정
- `README.md`: 전체 사용법, 파라미터, CLI 예시, JSON 예시
- `src/cli.js`: CLI 인자 파싱과 전체 실행 진입점
- `src/input.js`: CLI/JSON 입력 정규화
- `src/korean.js`: 한글 조사 선택 헬퍼
- `src/planner.js`: 로컬 기획, 콘텐츠 구성, 디자인 프리셋 결정, 시각 스타일 자동 선택과 별칭 정규화
- `src/professional.js`: 전문 분야 도메인 감지, 출처 정규화, 검수 컨텍스트 생성
- `src/prompt.js`: 카드별 최종 GPT 이미지 생성 프롬프트 작성
- `src/utils.js`: slug, 카드 수 제한, 안전한 출력 경로 유틸리티
- `test/*.test.js`: 입력, 기획, 프롬프트 생성 단위 테스트
- `topics/example.json`: JSON 입력 예시
- `docs/checklists/card-news-harness.md`: 다음 작업자가 이어갈 체크리스트

## Risks

- GPT 이미지 생성에서 한글 텍스트가 틀릴 수 있다. 그래서 프롬프트에 정확한 텍스트와 금지 조건을 반복하고, 한 장씩 생성해 검수하는 흐름을 기본으로 둔다.
- 복잡한 전문 주제는 로컬 규칙 기반 문구가 부족할 수 있다. 이 경우 JSON에서 `contentOutline`, `facts`, `mustInclude`, `sourceNotes`를 함께 지정하는 편이 안정적이다.
- 이미지 생성 결과가 카드 간 스타일이 달라질 수 있다. 같은 주제의 카드들은 `style-guide.md`와 같은 `prompts.md` 세트에서 순서대로 생성하고, 마음에 들지 않는 카드는 `--card N`으로 해당 프롬프트만 갱신한다.

## Test Strategy

- CLI 주제 입력과 JSON 입력이 동일한 표준 요청으로 정규화되는지 확인한다.
- 구조화 카드 내용과 facts/mustInclude/sourceNotes가 보존되는지 확인한다.
- 한글 조사 선택이 받침 유무에 맞게 동작하는지 확인한다.
- 카드 수가 2-10장 범위로 제한되는지 확인한다.
- 표지와 마무리 카드에 페이지 번호와 배지가 들어가지 않는지 확인한다.
- 본문 카드가 페이지 번호 또는 좌측 상단 배지 중 하나만 쓰는지 확인한다.
- preset별 텍스트 밀도가 달라지는지 확인한다.
- 프리셋 자동 선택과 수동 override가 동작하는지 확인한다.
- 시각 스타일 자동 선택, 수동 override, 한국어 별칭이 동작하는지 확인한다.
- 시각 스타일별 hard rule이 프롬프트에 들어가는지 확인한다.
- 전문 분야 도메인 감지, 출처, 검수자 역할, 면책 문구, 금지 표현이 프롬프트에 들어가는지 확인한다.
- style anchor와 Content controls가 프롬프트와 `style-guide.md`에 들어가는지 확인한다.
- 카드별 프롬프트가 1080x1080, 정확한 한글 텍스트, 금지 조건을 포함하는지 확인한다.
- 특정 카드만 프롬프트로 다시 출력할 때 기존 프롬프트와 최종 PNG를 보존하는지 확인한다.
- 이전 HTML 산출물이 같은 출력 폴더에 남아 있으면 정리되는지 확인한다.
