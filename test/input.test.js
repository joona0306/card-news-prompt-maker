const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { normalizeInput } = require("../src/input");

test("CLI topic input is normalized into a reusable request", () => {
  const request = normalizeInput(["청년 창업 지원금"]);

  assert.equal(request.topic, "청년 창업 지원금");
  assert.equal(request.maxCards, 6);
  assert.equal(request.audience, "인스타그램 사용자");
  assert.equal(request.goal, "핵심 정보를 빠르게 이해시키기");
  assert.equal(request.source, "cli");
});

test("CLI input can include card count, design preset, and visual style", () => {
  const request = normalizeInput([
    "여름철 폭염 건강관리",
    "--cards",
    "8",
    "--preset",
    "educational",
    "--visual-style",
    "photo"
  ]);

  assert.equal(request.topic, "여름철 폭염 건강관리");
  assert.equal(request.maxCards, 8);
  assert.equal(request.designPreset, "educational");
  assert.equal(request.visualStyle, "photo");
});

test("JSON file input overrides optional fields", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "card-news-input-"));
  const file = path.join(dir, "topic.json");
  fs.writeFileSync(
    file,
    JSON.stringify({
      topic: "소상공인 온라인 마케팅",
      audience: "동네 매장 사장님",
      goal: "실행할 체크리스트 제공",
      maxCards: 12,
      designPreset: "bold",
      visualStyle: "3d",
      brand: {
        name: "Local Boost",
        colors: ["#0f766e", "#f8fafc"]
      }
    }),
    "utf8"
  );

  const request = normalizeInput(["--file", file]);

  assert.equal(request.topic, "소상공인 온라인 마케팅");
  assert.equal(request.audience, "동네 매장 사장님");
  assert.equal(request.goal, "실행할 체크리스트 제공");
  assert.equal(request.maxCards, 10);
  assert.equal(request.designPreset, "bold");
  assert.equal(request.visualStyle, "3d");
  assert.equal(request.brand.name, "Local Boost");
  assert.deepEqual(request.brand.colors, ["#0f766e", "#f8fafc"]);
  assert.equal(request.source, "json");
});

test("JSON file input preserves professional domain metadata", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "card-news-input-"));
  const file = path.join(dir, "topic.json");
  fs.writeFileSync(
    file,
    JSON.stringify({
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
        required: true,
        reviewerRole: "공인중개사 또는 변호사",
        status: "required"
      },
      disclaimer: "본 콘텐츠는 일반 정보이며, 개별 계약 판단은 전문가 상담이 필요합니다.",
      forbiddenClaims: ["확정 수익", "무조건 안전"]
    }),
    "utf8"
  );

  const request = normalizeInput(["--file", file]);

  assert.equal(request.domain, "real_estate");
  assert.equal(request.contentType, "general_info");
  assert.equal(request.sources.length, 1);
  assert.equal(request.sources[0].title, "국가법령정보센터 공인중개사법");
  assert.equal(request.review.reviewerRole, "공인중개사 또는 변호사");
  assert.match(request.disclaimer, /일반 정보/);
  assert.deepEqual(request.forbiddenClaims, ["확정 수익", "무조건 안전"]);
});

test("CLI input can include professional safety metadata", () => {
  const request = normalizeInput([
    "보험금 청구 전 확인사항",
    "--domain",
    "insurance",
    "--content-type",
    "general_info",
    "--source",
    "금융감독원 소비자 안내|https://www.fss.or.kr/|2026-05-21",
    "--reviewer-role",
    "보험설계사 또는 준법감시 담당자",
    "--disclaimer",
    "본 콘텐츠는 일반 정보입니다.",
    "--forbidden-claim",
    "무조건 보장"
  ]);

  assert.equal(request.domain, "insurance");
  assert.equal(request.contentType, "general_info");
  assert.equal(request.sources[0].title, "금융감독원 소비자 안내");
  assert.equal(request.sources[0].url, "https://www.fss.or.kr/");
  assert.equal(request.sources[0].checkedAt, "2026-05-21");
  assert.equal(request.review.reviewerRole, "보험설계사 또는 준법감시 담당자");
  assert.equal(request.disclaimer, "본 콘텐츠는 일반 정보입니다.");
  assert.deepEqual(request.forbiddenClaims, ["무조건 보장"]);
});

test("JSON path can be passed as the first argument", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "card-news-input-"));
  const file = path.join(dir, "topic.json");
  fs.writeFileSync(file, JSON.stringify({ topic: "AI 면접 준비", maxCards: 3 }), "utf8");

  const request = normalizeInput([file]);

  assert.equal(request.topic, "AI 면접 준비");
  assert.equal(request.maxCards, 3);
  assert.equal(request.source, "json");
});

test("missing topic throws a clear validation error", () => {
  assert.throws(
    () => normalizeInput([]),
    /주제를 입력하거나 JSON 파일을 지정/
  );
});
