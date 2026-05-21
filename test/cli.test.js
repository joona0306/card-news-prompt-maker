const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { runCli } = require("../src/cli");

test("runCli orchestrates input, planning, prompt writing, and checklist creation", async (t) => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-cli-"));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));

  const result = await runCli(["소상공인 온라인 마케팅 체크리스트"], {
    outputRoot
  });

  assert.equal(result.plan.cards.length, 6);
  assert.equal(result.promptResult.promptFiles.length, 6);
  assert.ok(fs.existsSync(result.promptResult.promptFiles[0]));
  assert.ok(fs.existsSync(result.promptResult.styleGuideFile));
  assert.ok(fs.existsSync(result.checklistPath));
  const checklist = fs.readFileSync(result.checklistPath, "utf8");

  assert.match(checklist, /소상공인 온라인 마케팅 체크리스트/);
  assert.match(checklist, /style-guide\.md/);
  assert.match(checklist, /표지와 마무리 카드에는 페이지 번호와 배지가 없음/);
  assert.match(checklist, /본문 카드는 페이지 번호 또는 좌측 상단 배지 중 하나만 사용/);
  assert.match(fs.readFileSync(result.promptResult.promptFiles[0], "utf8"), /Text must be exactly/);
});

test("runCli can generate only one selected card prompt", async (t) => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-cli-"));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));

  const result = await runCli(["AI 면접 준비", "--card", "2"], {
    outputRoot
  });

  assert.equal(result.promptResult.promptFiles.length, 1);
  assert.match(path.basename(result.promptResult.promptFiles[0]), /prompt-02\.md/);
});

test("runCli rejects missing selected card value with a clear error", async () => {
  await assert.rejects(
    () => runCli(["AI 면접 준비", "--card"]),
    /--card 옵션 뒤에 값을 지정/
  );
});

test("runCli passes visual style into generated prompts", async (t) => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-cli-"));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));

  const result = await runCli(["여름철 폭염 건강관리", "--visual-style", "magazine"], {
    outputRoot
  });

  assert.equal(result.plan.visualStyle.id, "magazine");
  assert.match(fs.readFileSync(result.promptResult.promptFiles[0], "utf8"), /Visual style: 잡지형 \(magazine\)/);
});

test("runCli checklist includes professional review tasks", async (t) => {
  const outputRoot = fs.mkdtempSync(path.join(process.cwd(), ".tmp-test-cli-"));
  t.after(() => fs.rmSync(outputRoot, { recursive: true, force: true }));

  const result = await runCli([
    "보험금 청구 전 확인사항",
    "--domain",
    "insurance",
    "--source",
    "금융감독원 소비자 안내|https://www.fss.or.kr/|2026-05-21",
    "--reviewer-role",
    "보험설계사 또는 준법감시 담당자"
  ], {
    outputRoot
  });

  const checklist = fs.readFileSync(result.checklistPath, "utf8");

  assert.equal(result.plan.professional.enabled, true);
  assert.match(checklist, /Professional Review/);
  assert.match(checklist, /보험/);
  assert.match(checklist, /보험설계사 또는 준법감시 담당자/);
});
