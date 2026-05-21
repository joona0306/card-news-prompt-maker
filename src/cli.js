const fs = require("node:fs");
const path = require("node:path");

const { normalizeInput } = require("./input");
const { createCardNewsPlan } = require("./planner");
const { writePromptFiles } = require("./prompt");
const { ensureInsideWorkspace } = require("./utils");

async function runCli(args = process.argv.slice(2), options = {}) {
  const cwd = options.cwd || process.cwd();
  const runtime = parseRuntimeArgs(args);
  const request = normalizeInput(runtime.inputArgs, { cwd });
  const plan = createCardNewsPlan(request);
  const outputRoot = ensureInsideWorkspace(cwd, options.outputRoot || runtime.outputRoot || path.join(cwd, "output"));
  const cardNumber = options.cardNumber ?? runtime.cardNumber;
  const promptResult = writePromptFiles(plan, {
    cwd,
    outputRoot,
    cardNumber
  });
  const checklistPath = writeRunChecklist({ request, plan, promptResult, cardNumber });

  return {
    request,
    plan,
    promptResult,
    checklistPath
  };
}

function parseRuntimeArgs(args) {
  const inputArgs = [];
  let outputRoot;
  let cardNumber;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--card") {
      cardNumber = readRequiredRuntimeOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--output" || arg === "--out") {
      outputRoot = readRequiredRuntimeOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    inputArgs.push(arg);
  }

  return {
    cardNumber,
    inputArgs,
    outputRoot
  };
}

function readRequiredRuntimeOptionValue(args, index, optionName) {
  const value = args[index + 1];
  if (value === undefined || value === null || String(value).trim() === "" || String(value).startsWith("--")) {
    throw new Error(`${optionName} 옵션 뒤에 값을 지정해 주세요.`);
  }

  return value;
}

function writeRunChecklist({ request, plan, promptResult, cardNumber }) {
  const checklistPath = path.join(promptResult.outputDir, "checklist.md");
  const promptItems = promptResult.promptFiles
    .map((file) => `- [x] ${path.basename(file)}`)
    .join("\n");
  const professionalReview = buildProfessionalReviewChecklist(plan.professional);

  const content = `# Card News Run Checklist

## Input

- Topic: ${request.topic}
- Source: ${request.source}
- Audience: ${request.audience}
- Goal: ${request.goal}
- Requested cards: ${request.maxCards}
- Design preset: ${plan.design.preset}
- Visual style: ${plan.visualStyle.name} (${plan.visualStyle.id})
- Generator: ${plan.meta.generator}
${cardNumber ? `- Selected card: ${cardNumber}` : "- Selected card: all"}

## Generated Files

### Prompt

${promptItems}
- [x] ${path.basename(promptResult.styleGuideFile)}

${professionalReview}

## Visual QA

- [ ] \`style-guide.md\`의 시리즈 앵커가 모든 카드에 유지됨
- [ ] 표지와 마무리 카드에는 페이지 번호와 배지가 없음
- [ ] 본문 카드는 페이지 번호 또는 좌측 상단 배지 중 하나만 사용
- [ ] 선택한 visualStyle의 시각 규칙이 실제 이미지에서 분명히 드러남
- [ ] preset에 맞는 텍스트 밀도와 레이아웃 차이가 보임

## Next Work

- [ ] GPT 이미지 생성에 카드별 prompt 파일을 한 장씩 입력
- [ ] 생성 이미지의 한글 오탈자와 누락 문구 확인
- [ ] 주제 특성에 맞지 않는 비주얼이면 해당 카드 prompt만 수정
- [ ] 최종 이미지 파일명을 \`card-01.png\` 형식으로 저장
`;

  fs.writeFileSync(checklistPath, content, "utf8");
  return checklistPath;
}

function buildProfessionalReviewChecklist(professional) {
  if (!professional?.enabled) {
    return "";
  }

  const sourceItems = professional.sources.length
    ? professional.sources.map((source) => `- [ ] 출처 확인: ${source.title}${source.checkedAt ? ` (${source.checkedAt})` : ""}`).join("\n")
    : "- [ ] 출처 추가 필요";

  return `## Professional Review

- Domain: ${professional.domainName} (${professional.domain})
- Content type: ${professional.contentType}
- Reviewer role: ${professional.review.reviewerRole}
- Review status: ${professional.review.status}

${sourceItems}
- [ ] 금지 표현 제거 확인
- [ ] 면책 문구와 일반 정보 범위 확인
- [ ] 최종 이미지 게시 전 전문가 검수 완료
`;
}

async function main() {
  try {
    const result = await runCli();
    console.log(`카드뉴스 프롬프트 출력 폴더: ${result.promptResult.outputDir}`);
    console.log(`프롬프트: ${result.promptResult.promptFiles.length}개`);
    console.log(`프롬프트 인덱스: ${result.promptResult.indexFile}`);
    console.log(`스타일 가이드: ${result.promptResult.styleGuideFile}`);
    console.log(`체크리스트: ${result.checklistPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseRuntimeArgs,
  runCli,
  writeRunChecklist
};
