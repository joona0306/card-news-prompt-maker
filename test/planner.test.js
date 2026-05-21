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
