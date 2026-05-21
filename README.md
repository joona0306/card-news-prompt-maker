# Card News Maker

주제만 입력하면 인스타그램 1080x1080 카드뉴스용 GPT 이미지 생성 프롬프트를 카드별로 만들어주는 로컬 하네스입니다.

이 도구는 이미지를 직접 생성하지 않습니다. `prompt-01.md`, `prompt-02.md`처럼 카드별 최종 프롬프트를 만들고, 사용자가 GPT 이미지 생성 기능에 한 장씩 넣어 최종 이미지를 생성하는 방식입니다.

## 빠른 시작

PowerShell에서 `npm` 실행 정책 문제가 있으면 `npm.cmd`를 사용합니다.

```powershell
npm.cmd run create -- "여름철 폭염 건강관리"
```

생성 결과는 다음 위치에 저장됩니다.

```text
output/여름철-폭염-건강관리/
  style-guide.md
  prompts.md
  prompt-01.md
  prompt-02.md
  ...
  checklist.md
```

## 기본 사용법

### 주제만 입력

```powershell
npm.cmd run create -- "AI를 꼭 사용해야하는 이유"
```

기본값으로 6장 카드 프롬프트를 생성합니다.

### 카드 수 지정

```powershell
npm.cmd run create -- "여름철 폭염 건강관리" --cards 4
npm.cmd run create -- "여름철 폭염 건강관리" --max-cards 8
```

카드 수는 최소 2장, 최대 10장입니다. 값을 넘으면 자동으로 2-10 범위 안으로 제한됩니다.

## 카드 구성 규칙

- 첫 장은 항상 표지입니다. 페이지 번호와 좌측 상단 배지를 넣지 않습니다.
- 마지막 장은 항상 마무리 카드입니다. 페이지 번호와 좌측 상단 배지를 넣지 않습니다.
- 본문 카드는 `페이지 번호만` 또는 `좌측 상단 배지만` 사용합니다. 둘을 동시에 넣지 않습니다.
- 텍스트 양은 `designPreset`에 따라 달라집니다. 미니멀/에디토리얼은 적게, 교육형/체크리스트형은 더 구조적으로 생성합니다.

### 특정 카드만 다시 생성

```powershell
npm.cmd run create -- "여름철 폭염 건강관리" --card 2
```

같은 주제 폴더에 `prompt-02.md`만 다시 생성합니다. 기존 다른 `prompt-XX.md` 파일과 최종 이미지로 저장한 `card-XX.png`는 유지됩니다. 전체 세트를 새로 만들려면 `--card` 없이 실행합니다.

### 출력 폴더 지정

```powershell
npm.cmd run create -- "AI를 꼭 사용해야하는 이유" --output output/custom
npm.cmd run create -- "AI를 꼭 사용해야하는 이유" --out output/custom
```

출력 경로는 현재 워크스페이스 안에 있어야 합니다.

## 디자인 프리셋

`designPreset`은 카드뉴스의 편집 방향입니다.

| 값 | 의미 | 본문 내비게이션 | 텍스트 밀도 | 예시 |
| --- | --- | --- | --- | --- |
| `educational` | 정보 정리형 | 페이지 번호 | 본문 + bullet 2개 | 개념 설명, 건강관리, 정책 안내 |
| `promotional` | 혜택 강조형 | 페이지 번호 | 짧은 본문 + bullet 1개 | 이벤트, 할인, 모집, 판매 |
| `minimal` | 미니멀 메시지형 | 좌측 상단 배지 | 짧은 본문, bullet 없음 | 짧은 요약, 루틴, 한 줄 메시지 |
| `bold` | 체크리스트 강조형 | 좌측 상단 배지 | 짧은 본문 + bullet 2개 | 주의사항, 필수 확인, 실수 방지 |
| `editorial` | 에디토리얼 인사이트형 | 좌측 상단 배지 | 관점형 본문, bullet 없음 | 브랜드 스토리, 인터뷰, 트렌드 |

명령어 예시:

```powershell
npm.cmd run create -- "브랜드 스토리 인사이트" --preset editorial
npm.cmd run create -- "계약 전 반드시 확인할 체크리스트" --design-preset bold
```

지정하지 않으면 주제 키워드 기준으로 자동 선택합니다.

## 시각 스타일

`visualStyle`은 이미지의 시각 매체 방향입니다.

| 값 | 의미 | 한국어 별칭 |
| --- | --- | --- |
| `photo` | 사진형 | `사진`, `사진형`, `실사`, `실사형` |
| `illustration` | 일러스트형 | `일러스트`, `일러스트형`, `삽화`, `삽화형` |
| `3d` | 3D형 | `3D형`, `입체`, `입체형` |
| `magazine` | 잡지형 | `잡지`, `잡지형`, `매거진`, `매거진형` |
| `meme` | 밈형 | `밈`, `밈형`, `유머`, `유머형` |

명령어 예시:

```powershell
npm.cmd run create -- "여름철 폭염 건강관리" --visual-style photo
npm.cmd run create -- "AI를 꼭 사용해야하는 이유" --style illustration
npm.cmd run create -- "제품 구조를 쉽게 이해하는 법" --style 3d
npm.cmd run create -- "브랜드 스토리 인사이트" --preset editorial --style magazine
npm.cmd run create -- "직장인 공감 업무 습관" --style meme
```

지정하지 않으면 주제 키워드와 디자인 프리셋을 기준으로 자동 선택합니다.

## 전체 파라미터

아래 표는 CLI에서 바로 쓸 수 있는 모든 파라미터입니다. 값이 공백을 포함하면 PowerShell에서 큰따옴표로 감쌉니다.

| 파라미터 | 별칭 | 쓸 수 있는 값 | 예시 |
| --- | --- | --- | --- |
| `"주제"` | 없음 | 자유 텍스트 | `"AI를 꼭 사용해야하는 이유"` |
| `--file` | `-f` | 워크스페이스 안 JSON 파일 경로 | `--file topics/example.json`, `-f topics/estate-law.json` |
| `--cards` | `--max-cards` | 숫자. 최소 2, 최대 10으로 자동 제한 | `--cards 4`, `--max-cards 8`, `--cards 12` |
| `--preset` | `--design-preset` | `educational`, `promotional`, `minimal`, `bold`, `editorial` | `--preset educational`, `--preset bold`, `--design-preset editorial` |
| `--visual-style` | `--style` | `photo`, `illustration`, `3d`, `magazine`, `meme` 또는 한국어 별칭 | `--style photo`, `--style 3d`, `--visual-style "사진형"`, `--style "밈"` |
| `--audience` | 없음 | 대상 독자 자유 텍스트 | `--audience "동네 매장 사장님"`, `--audience "전세 계약을 앞둔 임차인"` |
| `--goal` | 없음 | 카드뉴스 목적 자유 텍스트 | `--goal "오늘 바로 실행할 항목 정리"`, `--goal "계약 전 확인 항목을 일반 정보로 정리하기"` |
| `--domain` | 없음 | `real_estate`, `insurance`, `legal`, `medical` 또는 별칭 | `--domain real_estate`, `--domain insurance`, `--domain "법률"`, `--domain health` |
| `--content-type` | 없음 | `general_info`, `advertisement` 또는 별칭 | `--content-type general_info`, `--content-type advertisement`, `--content-type "광고"` |
| `--source` | 없음 | `자료명|URL|확인일` 형식. 반복 가능 | `--source "국가법령정보센터 공인중개사법|https://www.law.go.kr/|2026-05-21"` |
| `--checked-at` | 없음 | `YYYY-MM-DD` 같은 확인일 텍스트 | `--checked-at 2026-05-21` |
| `--fact` | 없음 | 확인된 핵심 사실 자유 텍스트. 반복 가능 | `--fact "등기부등본은 계약 직전 다시 확인합니다." --fact "보증 가입 가능 여부를 확인합니다."` |
| `--must-include` | 없음 | 반드시 카드 내용에 반영할 문장. 반복 가능 | `--must-include "전입신고와 확정일자는 별도 확인 항목으로 다룹니다."` |
| `--source-note` | 없음 | 출처/검수 메모. 반복 가능 | `--source-note "국가법령정보센터와 보증기관 안내를 함께 확인합니다."` |
| `--reviewer-role` | 없음 | 검수자 역할 자유 텍스트 | `--reviewer-role "공인중개사 또는 변호사"`, `--reviewer-role "의사 또는 의료 전문가"` |
| `--review-status` | 없음 | 검수 상태 자유 텍스트. 기본값은 `required` | `--review-status required`, `--review-status draft`, `--review-status reviewed` |
| `--disclaimer` | 없음 | 면책/주의 문구 자유 텍스트 | `--disclaimer "본 콘텐츠는 일반 정보이며, 개별 판단은 전문가 상담이 필요합니다."` |
| `--forbidden-claim` | 없음 | 금지 표현 자유 텍스트. 반복 가능 | `--forbidden-claim "100% 승소" --forbidden-claim "무조건 보장"` |
| `--brand-name` | 없음 | 푸터/브랜드 이름 | `--brand-name "Local Boost"`, `--brand-name "Card News Maker"` |
| `--color` | 없음 | 브랜드 색상. 첫 번째는 accent, 두 번째는 background. 반복 가능 | `--color "#0f766e" --color "#f8fafc"` |
| `--card` | 없음 | 다시 만들 카드 번호. 1부터 전체 카드 수 사이 | `--card 2`, `--card 6` |
| `--output` | `--out` | 워크스페이스 안 출력 루트 폴더 | `--output output/custom`, `--out output/test-run` |

### 파라미터 조합 예시

기본 주제만 입력:

```powershell
npm.cmd run create -- "AI를 꼭 사용해야하는 이유"
```

대상, 목적, 카드 수까지 지정:

```powershell
npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트" --audience "동네 매장 사장님" --goal "오늘 바로 실행할 홍보 항목을 정리하기" --cards 6
```

디자인 프리셋과 시각 스타일 지정:

```powershell
npm.cmd run create -- "브랜드 스토리 인사이트" --preset editorial --style magazine
npm.cmd run create -- "제품 구조를 쉽게 이해하는 법" --design-preset educational --visual-style 3d
npm.cmd run create -- "직장인 공감 업무 습관" --preset minimal --style "밈"
```

전문 분야 안전 정보까지 지정:

```powershell
npm.cmd run create -- "전세 계약 전 확인할 5가지" --domain real_estate --content-type general_info --source "국가법령정보센터 공인중개사법|https://www.law.go.kr/|2026-05-21" --reviewer-role "공인중개사 또는 변호사" --disclaimer "본 콘텐츠는 일반 정보이며, 개별 계약 판단은 전문가 상담이 필요합니다." --forbidden-claim "무조건 안전"
```

확인된 사실과 필수 반영 내용을 추가:

```powershell
npm.cmd run create -- "전세 계약 전 확인할 5가지" --fact "등기부등본은 계약 직전 다시 확인해야 합니다." --must-include "전입신고와 확정일자는 별도 확인 항목으로 다룹니다." --source-note "국가법령정보센터와 보증기관 안내를 함께 확인합니다."
```

브랜드 색상과 출력 폴더 지정:

```powershell
npm.cmd run create -- "카페 신메뉴 홍보 카드뉴스" --brand-name "Local Boost" --color "#0f766e" --color "#f8fafc" --output output/local-boost
```

특정 카드만 다시 생성:

```powershell
npm.cmd run create -- "전세 계약 전 확인할 5가지" --card 2
```

## 전문 분야 모드

부동산, 보험, 법률, 의학처럼 책임과 규제가 큰 주제는 `domain`을 지정하거나 주제 키워드로 자동 감지됩니다. 이 모드는 출처, 전문가 검수, 면책 문구, 금지 표현을 프롬프트와 체크리스트에 추가합니다.

지원 도메인:

| 값 | 의미 | 한국어 별칭 |
| --- | --- | --- |
| `real_estate` | 부동산 | `부동산`, `공인중개` |
| `insurance` | 보험 | `보험` |
| `legal` | 법률 | `법률`, `법무` |
| `medical` | 의학/의료 | `의학`, `의료`, `건강` |

콘텐츠 성격:

| 값 | 의미 |
| --- | --- |
| `general_info` | 일반 정보 |
| `advertisement` | 광고/홍보 |

CLI 예시:

```powershell
npm.cmd run create -- "전세 계약 전 확인할 5가지" --domain real_estate --content-type general_info --source "국가법령정보센터 공인중개사법|https://www.law.go.kr/|2026-05-21" --reviewer-role "공인중개사 또는 변호사"
npm.cmd run create -- "보험금 청구 전 확인사항" --domain insurance --source "금융감독원 소비자 안내|https://www.fss.or.kr/|2026-05-21" --forbidden-claim "무조건 보장"
npm.cmd run create -- "고혈압 약 복용 전 확인사항" --domain medical --disclaimer "본 콘텐츠는 일반 건강 정보이며, 진단과 치료는 의료 전문가 상담이 필요합니다."
npm.cmd run create -- "전세 계약 전 확인할 5가지" --fact "등기부등본은 계약 직전 다시 확인합니다." --must-include "전입신고와 확정일자는 별도 확인 항목으로 다룹니다."
```

전문 분야는 JSON 사용을 권장합니다. 출처와 검수 정보를 구조화하기 쉽기 때문입니다.

```json
{
  "topic": "전세 계약 전 확인할 5가지",
  "audience": "전세 계약을 앞둔 임차인",
  "goal": "계약 전 확인 항목을 일반 정보로 정리하기",
  "maxCards": 6,
  "designPreset": "bold",
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
    },
    {
      "title": "보증금 반환 위험 보기",
      "body": "보증금 규모와 선순위 권리를 함께 확인합니다.",
      "bullets": ["선순위 권리", "보증 가능 여부"]
    }
  ],
  "facts": ["등기부등본은 계약 직전 다시 확인해야 합니다."],
  "mustInclude": ["전입신고와 확정일자는 별도 확인 항목으로 다룹니다."],
  "sourceNotes": ["국가법령정보센터와 보증기관 안내를 함께 확인합니다."],
  "disclaimer": "본 콘텐츠는 일반 정보이며, 개별 계약 판단은 전문가 상담이 필요합니다.",
  "forbiddenClaims": ["확정 수익", "무조건 안전"]
}
```

전문 분야 결과물은 게시 전 검수가 필요합니다. 하네스는 검수용 초안을 만들 뿐, 법률·의학·보험·부동산 판단을 확정하지 않습니다.

## 구조화 카드 내용

기본 자동 생성은 주제 키워드로 카드 본문을 만듭니다. 실무용 카드뉴스처럼 정확한 카드별 내용을 정해 두고 싶으면 JSON의 `contentOutline`을 사용합니다. `cards`도 같은 형식의 별칭으로 사용할 수 있습니다.

```json
{
  "topic": "전세 계약 전 확인할 5가지",
  "maxCards": 4,
  "contentOutline": [
    {
      "title": "등기부등본 먼저 확인",
      "body": "소유자, 근저당, 압류 여부를 계약 전 확인합니다.",
      "bullets": ["계약 당일 재확인", "주소와 소유자 일치 확인"]
    },
    {
      "title": "보증금 반환 위험 보기",
      "body": "보증금 규모와 선순위 권리를 함께 확인합니다.",
      "bullets": ["선순위 권리", "보증 가능 여부"]
    }
  ]
}
```

`facts`, `mustInclude`, `sourceNotes`는 프롬프트의 Content controls 섹션에 들어가며, 구조화된 카드 내용이 없을 때는 본문 카드 초안에도 우선 반영됩니다.

## JSON 사용법

`topics/example.json`처럼 입력 파일을 만들고 실행합니다.

```json
{
  "topic": "여름철 폭염 건강관리",
  "audience": "야외 활동이 많은 직장인",
  "goal": "폭염 시 건강관리 행동 요령을 쉽게 전달하기",
  "maxCards": 4,
  "designPreset": "educational",
  "visualStyle": "photo",
  "brand": {
    "name": "Card News Maker",
    "colors": ["#0f766e", "#f8fafc"]
  }
}
```

실행:

```powershell
npm.cmd run create -- --file topics/example.json
```

JSON 파일 경로만 넣어도 됩니다.

```powershell
npm.cmd run create -- topics/example.json
```

## 추천 조합

```powershell
npm.cmd run create -- "여름철 폭염 건강관리" --cards 4 --preset educational --style photo
npm.cmd run create -- "소상공인 온라인 마케팅 체크리스트" --cards 6 --preset bold --style photo
npm.cmd run create -- "AI를 꼭 사용해야하는 이유" --cards 6 --preset editorial --style illustration
npm.cmd run create -- "제품 구조를 쉽게 이해하는 법" --cards 5 --preset educational --style 3d
npm.cmd run create -- "직장인 공감 업무 습관" --cards 3 --preset minimal --style meme
```

## 생성 후 작업 흐름

1. `prompts.md`에서 전체 카드 목록을 확인합니다.
2. `style-guide.md`에서 시리즈 앵커, 팔레트, 제목 줄바꿈 규칙을 확인합니다.
3. `prompt-01.md`부터 GPT 이미지 생성 기능에 한 장씩 붙여 넣습니다.
4. 생성된 이미지에서 한글 오탈자, 누락 문구, 잘림 여부를 확인합니다.
5. 문제가 있는 카드만 `--card N`으로 프롬프트를 다시 만들거나 prompt 파일을 직접 조정합니다.
6. 최종 이미지는 `card-01.png`, `card-02.png`처럼 저장합니다.

## ChatGPT 이미지 생성 프롬프트 사용법

출력 폴더를 통째로 프롬프트 창에 넣는 방식은 권장하지 않습니다. 카드별 한글 텍스트와 레이아웃이 섞일 수 있으므로, 같은 ChatGPT 이미지 생성 대화에서 `style-guide.md`를 기준으로 잡고 `prompt-XX.md`를 한 장씩 순서대로 넣습니다.

권장 순서:

1. ChatGPT 이미지 생성 대화를 새로 엽니다.
2. 아래 준비 메시지를 먼저 보냅니다.
3. `style-guide.md` 내용을 붙여 넣어 시리즈 기준을 고정합니다.
4. `prompt-01.md`의 코드블록 안 프롬프트만 붙여 넣고 1번 이미지를 생성합니다.
5. 결과 이미지의 한글 오탈자, 누락 문구, 잘림, 카드 톤을 확인합니다.
6. 같은 대화에서 `prompt-02.md`, `prompt-03.md`를 한 장씩 순서대로 반복합니다.
7. 문제가 있는 카드만 `--card N`으로 다시 프롬프트를 만들거나 해당 `prompt-XX.md`를 직접 수정합니다.

처음 보낼 준비 메시지:

```text
이 카드뉴스 시리즈는 아래 style-guide 기준으로 모든 카드의 색상, 여백, 시각 톤, 제목 스타일을 일관되게 유지해 주세요.
이후 제가 카드별 prompt-01, prompt-02를 하나씩 보낼 예정입니다.
한 번에 한 장만 생성해 주세요.
```

카드별 프롬프트를 넣을 때는 `prompt-XX.md` 전체 설명보다 코드블록 안의 `Create a finished 1080x1080 Instagram card news image.`로 시작하는 본문만 사용하는 편이 안전합니다. 여러 `prompt-XX.md`를 한 번에 붙여 넣으면 ChatGPT가 여러 장의 지시를 섞거나 일부 텍스트를 누락할 수 있습니다.

## 테스트

```powershell
npm.cmd test
```

현재 테스트는 CLI 입력, JSON 입력, 구조화 카드 내용, 카드 수 제한, 한글 조사, 표지/마무리 카드, 본문 내비게이션 방식, preset별 텍스트 밀도, 디자인 프리셋, 시각 스타일, 프롬프트 생성, 비파괴 특정 카드 재생성, style guide 생성, 레거시 HTML 정리를 검증합니다.
전문 분야 입력, 출처, 검수자 역할, 면책 문구, 금지 표현, facts/mustInclude/sourceNotes, 전문 분야 프롬프트 안전 문구도 함께 검증합니다.
