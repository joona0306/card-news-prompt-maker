const test = require("node:test");
const assert = require("node:assert/strict");

const { createCardNewsPlan, selectDesignPreset, selectVisualStyle } = require("../src/planner");

test("planner creates cover, body cards, and closing card within the 10 card limit", () => {
  const plan = createCardNewsPlan({
    topic: "소상공인 온라인 마케팅 체크리스트",
    audience: "동네 매장 사장님",
    goal: "바로 실행할 항목 제공",
    maxCards: 10
  });

  assert.equal(plan.cards.length, 10);
  assert.equal(plan.cards[0].role, "cover");
  assert.equal(plan.cards.at(-1).role, "closing");
  assert.ok(plan.cards.every((card) => card.title.length > 0));
  assert.ok(plan.cards.every((card) => card.body.length > 0));
  assert.equal(plan.meta.generator, "local");
});

test("manual design preset overrides automatic selection", () => {
  const plan = createCardNewsPlan({
    topic: "정부 지원금 신청 절차",
    maxCards: 4,
    designPreset: "minimal",
    visualStyle: "illustration"
  });

  assert.equal(plan.design.preset, "minimal");
  assert.equal(plan.visualStyle.id, "illustration");
  assert.equal(plan.cards.length, 4);
});

test("design preset is selected from topic keywords", () => {
  assert.equal(selectDesignPreset({ topic: "한정 이벤트 할인 혜택" }), "promotional");
  assert.equal(selectDesignPreset({ topic: "계약 전 반드시 확인할 위험 체크리스트" }), "bold");
  assert.equal(selectDesignPreset({ topic: "브랜드 스토리 인사이트" }), "editorial");
  assert.equal(selectDesignPreset({ topic: "초보자를 위한 개념 정리" }), "educational");
});

test("planner keeps cover and closing cards at minimum and ten cards maximum", () => {
  const minimum = createCardNewsPlan({ topic: "짧은 공지", maxCards: 0 });

  assert.equal(minimum.cards.length, 2);
  assert.equal(minimum.cards[0].role, "cover");
  assert.equal(minimum.cards.at(-1).role, "closing");
  assert.equal(createCardNewsPlan({ topic: "긴 교육 자료", maxCards: 99 }).cards.length, 10);
});

test("visual style can be selected manually or inferred from topic", () => {
  assert.equal(selectVisualStyle({ topic: "카페 현장 운영 사진 사례", visualStyle: "사진형" }), "photo");
  assert.equal(selectVisualStyle({ topic: "폭염 건강관리" }), "photo");
  assert.equal(selectVisualStyle({ topic: "브랜드 스토리 인터뷰", designPreset: "editorial" }), "magazine");
  assert.equal(selectVisualStyle({ topic: "직장인 공감 밈" }), "meme");
  assert.equal(selectVisualStyle({ topic: "제품 구조 3D 설명" }), "3d");
});

test("planner adds professional safety context for regulated domains", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    domain: "real_estate",
    contentType: "general_info",
    sources: [
      {
        title: "국가법령정보센터 공인중개사법",
        url: "https://www.law.go.kr/",
        checkedAt: "2026-05-21"
      }
    ],
    review: {
      reviewerRole: "공인중개사 또는 변호사"
    },
    forbiddenClaims: ["무조건 안전"]
  });

  assert.equal(plan.professional.enabled, true);
  assert.equal(plan.professional.domain, "real_estate");
  assert.equal(plan.professional.domainName, "부동산");
  assert.equal(plan.professional.contentType, "general_info");
  assert.equal(plan.professional.review.required, true);
  assert.equal(plan.professional.review.reviewerRole, "공인중개사 또는 변호사");
  assert.equal(plan.professional.sources.length, 1);
  assert.ok(plan.professional.forbiddenClaims.includes("무조건 안전"));
  assert.match(plan.professional.disclaimer, /일반 정보/);
});

test("planner uses structured content outline before generic templates", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    audience: "전세 계약을 앞둔 임차인",
    maxCards: 4,
    designPreset: "bold",
    contentOutline: [
      {
        title: "등기부등본 먼저 확인",
        body: "소유자, 근저당, 압류 여부를 계약 전 확인합니다.",
        bullets: ["계약 당일 재확인", "주소와 소유자 일치 확인"]
      },
      {
        title: "보증금 반환 위험 보기",
        body: "보증금 규모와 선순위 권리를 함께 확인합니다.",
        bullets: ["선순위 권리", "보증 가능 여부"]
      }
    ]
  });

  assert.equal(plan.cards[0].body, "전세 계약을 앞둔 임차인을 위한 핵심 정리");
  assert.equal(plan.cards[1].title, "등기부등본 먼저 확인");
  assert.equal(plan.cards[1].body, "소유자, 근저당, 압류 여부를 계약 전 확인합니다.");
  assert.deepEqual(plan.cards[1].bullets, ["계약 당일 재확인", "주소와 소유자 일치 확인"]);
  assert.equal(plan.cards[2].title, "보증금 반환 위험 보기");
});

test("planner fills remaining body cards without repeating a short content outline", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    audience: "전세 계약을 앞둔 임차인",
    maxCards: 5,
    domain: "real_estate",
    designPreset: "bold",
    contentOutline: [
      {
        title: "등기부등본 먼저 확인",
        body: "소유자, 근저당, 압류 여부를 계약 전 확인합니다.",
        bullets: ["계약 당일 재확인", "주소와 소유자 일치 확인"]
      }
    ]
  });

  const titles = plan.cards.slice(1, -1).map((card) => card.title);

  assert.deepEqual([...new Set(titles)], titles);
  assert.equal(titles[0], "등기부등본 먼저 확인");
  assert.ok(titles.includes("보증금 반환 위험 보기"));
});

test("planner creates topic-specific real estate templates for jeonse topics", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    audience: "전세 계약을 앞둔 임차인",
    maxCards: 5,
    domain: "real_estate",
    designPreset: "bold"
  });

  const titles = plan.cards.slice(1, -1).map((card) => card.title);

  assert.ok(titles.includes("등기부등본 먼저 확인"));
  assert.ok(titles.includes("보증금 반환 위험 보기"));
  assert.ok(!titles.includes("먼저 핵심만 잡기"));
});

test("planner keeps small business marketing topics on specific templates", () => {
  const plan = createCardNewsPlan({
    topic: "소상공인 온라인 마케팅 체크리스트",
    audience: "동네 매장 사장님",
    goal: "오늘 바로 실행할 홍보 항목을 정리하기",
    maxCards: 6,
    designPreset: "bold",
    contentOutline: [
      {
        title: "채널 하나만 먼저 고르기",
        body: "모든 채널을 동시에 시작하기보다 고객이 실제로 보는 채널 하나에 집중합니다.",
        bullets: ["네이버 지도", "인스타그램"]
      },
      {
        title: "오늘 올릴 소재 정하기",
        body: "메뉴, 후기, 위치, 이벤트처럼 바로 촬영하거나 정리할 수 있는 소재부터 고릅니다.",
        bullets: ["고객 후기", "대표 상품"]
      }
    ]
  });

  const titles = plan.cards.slice(1, -1).map((card) => card.title);

  assert.ok(titles.includes("반응을 숫자로 남기기"));
  assert.ok(titles.includes("한 줄 행동 요청 넣기"));
  assert.ok(!titles.includes("먼저 핵심만 잡기"));
});

test("planner exposes style anchor and content controls for prompt consistency", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    maxCards: 4,
    facts: ["등기부등본은 계약 직전 다시 확인해야 합니다."],
    mustInclude: ["전입신고와 확정일자는 별도 확인 항목으로 다룹니다."],
    sourceNotes: ["국가법령정보센터 확인일을 남깁니다."]
  });

  assert.match(plan.styleAnchor.seriesId, /전세 계약 전 확인할 5가지/);
  assert.match(plan.styleAnchor.layoutSystem, /일관/);
  assert.match(plan.styleAnchor.visualMotif, /전세 계약 전 확인할 5가지를/);
  assert.doesNotMatch(plan.styleAnchor.visualMotif, /가지을/);
  assert.deepEqual(plan.contentControls.facts, ["등기부등본은 계약 직전 다시 확인해야 합니다."]);
  assert.deepEqual(plan.contentControls.mustInclude, ["전입신고와 확정일자는 별도 확인 항목으로 다룹니다."]);
  assert.deepEqual(plan.contentControls.sourceNotes, ["국가법령정보센터 확인일을 남깁니다."]);
});

test("planner derives readable card titles from content controls", () => {
  const plan = createCardNewsPlan({
    topic: "전세 계약 전 확인할 5가지",
    maxCards: 4,
    mustInclude: ["전입신고와 확정일자는 별도 확인 항목으로 다룹니다."],
    facts: ["등기부등본은 계약 직전 다시 확인해야 합니다."]
  });

  const titles = plan.cards.slice(1, -1).map((card) => card.title);

  assert.equal(titles[0], "전입신고와 확정일자");
  assert.equal(titles[1], "등기부등본");
});

test("planner conservatively infers professional domains from topic keywords", () => {
  assert.equal(createCardNewsPlan({ topic: "보험금 청구 전 확인사항" }).professional.domain, "insurance");
  assert.equal(createCardNewsPlan({ topic: "이혼 소송 전 준비사항" }).professional.domain, "legal");
  assert.equal(createCardNewsPlan({ topic: "고혈압 약 복용 전 확인사항" }).professional.domain, "medical");
  assert.equal(createCardNewsPlan({ topic: "전세 계약 전 확인사항" }).professional.domain, "real_estate");
});

test("cover and closing cards do not use page numbers or badges", () => {
  const plan = createCardNewsPlan({ topic: "여름철 폭염 건강관리", maxCards: 5 });
  const cover = plan.cards[0];
  const closing = plan.cards.at(-1);

  assert.equal(cover.role, "cover");
  assert.equal(cover.navigation.type, "none");
  assert.equal(cover.eyebrow, "");
  assert.deepEqual(cover.bullets, []);
  assert.equal(closing.role, "closing");
  assert.equal(closing.navigation.type, "none");
  assert.equal(closing.eyebrow, "");
  assert.deepEqual(closing.bullets, []);
});

test("body cards use only one navigation style", () => {
  const educational = createCardNewsPlan({ topic: "여름철 폭염 건강관리", maxCards: 4, designPreset: "educational" });
  const bold = createCardNewsPlan({ topic: "계약 전 반드시 확인할 체크리스트", maxCards: 4, designPreset: "bold" });

  assert.ok(educational.cards.slice(1, -1).every((card) => card.navigation.type === "page"));
  assert.ok(educational.cards.slice(1, -1).every((card) => card.eyebrow === ""));
  assert.ok(bold.cards.slice(1, -1).every((card) => card.navigation.type === "badge"));
  assert.ok(bold.cards.slice(1, -1).every((card) => card.eyebrow.startsWith("CHECK")));
});

test("text density changes by preset", () => {
  const minimal = createCardNewsPlan({ topic: "하루 루틴 한 줄 정리", maxCards: 4, designPreset: "minimal" });
  const educational = createCardNewsPlan({ topic: "초보자를 위한 개념 정리", maxCards: 4, designPreset: "educational" });
  const bold = createCardNewsPlan({ topic: "계약 전 필수 체크리스트", maxCards: 4, designPreset: "bold" });

  assert.ok(minimal.cards.slice(1, -1).every((card) => card.bullets.length === 0));
  assert.ok(educational.cards.slice(1, -1).every((card) => card.bullets.length === 2));
  assert.ok(bold.cards.slice(1, -1).every((card) => card.bullets.length === 2));
  assert.ok(minimal.cards[1].body.length < educational.cards[1].body.length);
});
