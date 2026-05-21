# Card News Run Checklist

## Input

- Topic: 전세 계약 전 확인할 5가지
- Source: json
- Audience: 전세 계약을 앞둔 임차인
- Goal: 계약 전 확인 항목을 일반 정보로 정리하기
- Requested cards: 6
- Design preset: bold
- Visual style: 일러스트형 (illustration)
- Generator: local
- Selected card: all

## Generated Files

### Prompt

- [x] prompt-01.md
- [x] prompt-02.md
- [x] prompt-03.md
- [x] prompt-04.md
- [x] prompt-05.md
- [x] prompt-06.md
- [x] style-guide.md

## Professional Review

- Domain: 부동산 (real_estate)
- Content type: general_info
- Reviewer role: 공인중개사 또는 변호사
- Review status: required

- [ ] 출처 확인: 국가법령정보센터 공인중개사법 (2026-05-21)
- [ ] 금지 표현 제거 확인
- [ ] 면책 문구와 일반 정보 범위 확인
- [ ] 최종 이미지 게시 전 전문가 검수 완료


## Visual QA

- [ ] `style-guide.md`의 시리즈 앵커가 모든 카드에 유지됨
- [ ] 표지와 마무리 카드에는 페이지 번호와 배지가 없음
- [ ] 본문 카드는 페이지 번호 또는 좌측 상단 배지 중 하나만 사용
- [ ] 선택한 visualStyle의 시각 규칙이 실제 이미지에서 분명히 드러남
- [ ] preset에 맞는 텍스트 밀도와 레이아웃 차이가 보임

## Next Work

- [ ] GPT 이미지 생성에 카드별 prompt 파일을 한 장씩 입력
- [ ] 생성 이미지의 한글 오탈자와 누락 문구 확인
- [ ] 주제 특성에 맞지 않는 비주얼이면 해당 카드 prompt만 수정
- [ ] 최종 이미지 파일명을 `card-01.png` 형식으로 저장
