const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { createCardNewsPlan } = require("../src/planner");
const { buildImagePrompt, writePromptFiles } = require("../src/prompt");

test("buildImagePrompt creates a final GPT image prompt for one card", () => {
  const plan = createCardNewsPlan({
    topic: "소상공인 온라인 마케팅 체크리스트",
    audience: "동네 매장 사장님",
    goal: "오늘 바로 실행할 홍보 항목을 정리하기",
    maxCards: 3,
    designPreset: "bold",
    visualStyle: "photo"
  });

  const prompt = buildImagePrompt(plan, plan.cards[0]);

  assert.match(prompt, /1080x1080/);
  assert.match(prompt, /Instagram card news/);
  assert.match(prompt, /Text must be exactly/);
  assert.match(prompt, /소상공인 온라인 마케팅 체크리스트/);
  assert.match(prompt, /Visual style: 사진형 \(photo\)/);
  assert.match(prompt, /photographic/);
  assert.match(prompt, /Do not add extra Korean text/);
});

test("buildImagePrompt includes professional safety constraints when domain is regulated", () => {
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
    disclaimer: "본 콘텐츠는 일반 정보이며, 개별 계약 판단은 전문가 상담이 필요합니다."
  });

  const prompt = buildImagePrompt(plan, plan.cards[0]);

  assert.match(prompt, /Professional safety/);
  assert.match(prompt, /Domain: 부동산 \(real_estate\)/);
  assert.match(prompt, /Content type: general_info/);
  assert.match(prompt, /국가법령정보센터 공인중개사법/);
  assert.match(prompt, /Reviewer role: 공인중개사 또는 변호사/);
  assert.match(prompt, /Do not invent facts, statutes, prices, rates, diagnoses, outcomes, guarantees, or deadlines/);
  assert.match(prompt, /본 콘텐츠는 일반 정보/);
});

test("buildImagePrompt omits navigation text on cover and closing cards", () => {
  const plan = createCardNewsPlan({ topic: "여름철 폭염 건강관리", maxCards: 4 });

  const coverPrompt = buildImagePrompt(plan, plan.cards[0]);
  const closingPrompt = buildImagePrompt(plan, plan.cards.at(-1));

  assert.doesNotMatch(coverPrompt, /Eyebrow:/);
  assert.doesNotMatch(coverPrompt, /Page number:/);
  assert.match(coverPrompt, /Navigation: none/);
  assert.doesNotMatch(closingPrompt, /Eyebrow:/);
  assert.doesNotMatch(closingPrompt, /Page number:/);
  assert.match(closingPrompt, /Navigation: none/);
});

test("buildImagePrompt uses only page number or badge for body cards", () => {
  const pagePlan = createCardNewsPlan({ topic: "개념 정리", maxCards: 4, designPreset: "educational" });
  const badgePlan = createCardNewsPlan({ topic: "필수 체크리스트", maxCards: 4, designPreset: "bold" });

  const pagePrompt = buildImagePrompt(pagePlan, pagePlan.cards[1]);
  const badgePrompt = buildImagePrompt(badgePlan, badgePlan.cards[1]);

  assert.match(pagePrompt, /Navigation: page number only/);
  assert.match(pagePrompt, /Page number: 2\/4/);
  assert.doesNotMatch(pagePrompt, /Eyebrow:/);
  assert.match(badgePrompt, /Navigation: top-left badge only/);
  assert.match(badgePrompt, /Eyebrow: CHECK 01/);
  assert.doesNotMatch(badgePrompt, /Page number:/);
});

test("visual styles produce strongly different visual rules", () => {
  const photoPlan = createCardNewsPlan({ topic: "매장 현장 사진 사례", visualStyle: "photo" });
  const threeDPlan = createCardNewsPlan({ topic: "제품 구조 설명", visualStyle: "3d" });
  const memePlan = createCardNewsPlan({ topic: "직장인 공감 업무 습관", visualStyle: "meme" });

  assert.match(buildImagePrompt(photoPlan, photoPlan.cards[1]), /Hard visual style rule: photorealistic editorial photography/);
  assert.match(buildImagePrompt(threeDPlan, threeDPlan.cards[1]), /Hard visual style rule: isometric 3D render/);
  assert.match(buildImagePrompt(memePlan, memePlan.cards[1]), /Hard visual style rule: meme-card composition/);
});

test("writePromptFiles writes one prompt per card and an index file", () => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-prompts-"));
  const plan = createCardNewsPlan({ topic: "AI 면접 준비", maxCards: 2 });

  try {
    const result = writePromptFiles(plan, { outputRoot });

    assert.equal(result.promptFiles.length, 2);
    assert.ok(fs.existsSync(result.promptFiles[0]));
    assert.ok(fs.existsSync(result.indexFile));
    assert.match(fs.readFileSync(result.promptFiles[0], "utf8"), /AI 면접 준비/);
    assert.match(fs.readFileSync(result.indexFile, "utf8"), /prompt-01.md/);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("writePromptFiles can write only a selected card prompt", () => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-prompts-"));
  const plan = createCardNewsPlan({ topic: "브랜드 스토리", maxCards: 4 });

  try {
    writePromptFiles(plan, { outputRoot });
    const result = writePromptFiles(plan, { outputRoot, cardNumber: 3 });

    assert.equal(result.promptFiles.length, 1);
    assert.match(path.basename(result.promptFiles[0]), /prompt-03\.md/);
    assert.match(fs.readFileSync(result.indexFile, "utf8"), /Selected card: 3/);
    assert.equal(fs.existsSync(path.join(result.outputDir, "prompt-01.md")), false);
    assert.equal(fs.existsSync(path.join(result.outputDir, "prompt-02.md")), false);
    assert.equal(fs.existsSync(path.join(result.outputDir, "prompt-04.md")), false);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("writePromptFiles removes legacy HTML and PNG render outputs from the same topic folder", () => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-prompts-"));
  const plan = createCardNewsPlan({ topic: "레거시 정리", maxCards: 1 });
  const outputDir = path.join(outputRoot, plan.id);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "card-01.html"), "legacy html", "utf8");
  fs.writeFileSync(path.join(outputDir, "card-01.png"), "legacy png", "utf8");
  fs.writeFileSync(path.join(outputDir, "custom-note.md"), "keep", "utf8");

  try {
    writePromptFiles(plan, { outputRoot });

    assert.equal(fs.existsSync(path.join(outputDir, "card-01.html")), false);
    assert.equal(fs.existsSync(path.join(outputDir, "card-01.png")), false);
    assert.equal(fs.existsSync(path.join(outputDir, "custom-note.md")), true);
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
});
