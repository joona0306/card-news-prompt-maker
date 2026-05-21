const fs = require("node:fs");
const path = require("node:path");

const { clampCardCount } = require("./utils");
const { normalizeSources } = require("./professional");

const DEFAULT_REQUEST = {
  audience: "인스타그램 사용자",
  goal: "핵심 정보를 빠르게 이해시키기",
  maxCards: 6,
  brand: {
    name: "Card News Maker",
    colors: []
  }
};

function normalizeInput(args = [], options = {}) {
  const cwd = options.cwd || process.cwd();
  const normalizedArgs = args.filter((arg) => arg !== undefined && arg !== null && String(arg).trim() !== "");

  if (normalizedArgs.length === 0) {
    throw new Error("주제를 입력하거나 JSON 파일을 지정해 주세요.");
  }

  const fileFlagIndex = normalizedArgs.findIndex((arg) => arg === "--file" || arg === "-f");
  if (fileFlagIndex >= 0) {
    const fileArg = normalizedArgs[fileFlagIndex + 1];
    if (!fileArg) {
      throw new Error("--file 옵션 뒤에 JSON 파일 경로를 지정해 주세요.");
    }

    return normalizeRawRequest(readJsonFile(resolveFromCwd(cwd, fileArg)), "json");
  }

  if (normalizedArgs.length === 1 && looksLikeJsonFile(normalizedArgs[0])) {
    const filePath = resolveFromCwd(cwd, normalizedArgs[0]);
    if (fs.existsSync(filePath)) {
      return normalizeRawRequest(readJsonFile(filePath), "json");
    }
  }

  const { topicParts, optionValues } = parseInlineOptions(normalizedArgs);
  const topic = topicParts.join(" ").trim();
  return normalizeRawRequest(
    {
      topic,
      audience: optionValues.audience,
      goal: optionValues.goal,
      maxCards: optionValues.maxCards,
      designPreset: optionValues.designPreset,
      visualStyle: optionValues.visualStyle,
      domain: optionValues.domain,
      contentType: optionValues.contentType,
      sources: optionValues.sources,
      checkedAt: optionValues.checkedAt,
      review: optionValues.review,
      disclaimer: optionValues.disclaimer,
      forbiddenClaims: optionValues.forbiddenClaims,
      brand: optionValues.brand
    },
    "cli"
  );
}

function parseInlineOptions(args) {
  const topicParts = [];
  const optionValues = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--cards" || arg === "--max-cards") {
      optionValues.maxCards = next;
      index += 1;
      continue;
    }

    if (arg === "--preset" || arg === "--design-preset") {
      optionValues.designPreset = next;
      index += 1;
      continue;
    }

    if (arg === "--visual-style" || arg === "--style") {
      optionValues.visualStyle = next;
      index += 1;
      continue;
    }

    if (arg === "--audience") {
      optionValues.audience = next;
      index += 1;
      continue;
    }

    if (arg === "--domain") {
      optionValues.domain = next;
      index += 1;
      continue;
    }

    if (arg === "--content-type") {
      optionValues.contentType = next;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      optionValues.sources = [...(optionValues.sources || []), next];
      index += 1;
      continue;
    }

    if (arg === "--checked-at") {
      optionValues.checkedAt = next;
      index += 1;
      continue;
    }

    if (arg === "--reviewer-role") {
      optionValues.review = {
        ...(optionValues.review || {}),
        reviewerRole: next
      };
      index += 1;
      continue;
    }

    if (arg === "--review-status") {
      optionValues.review = {
        ...(optionValues.review || {}),
        status: next
      };
      index += 1;
      continue;
    }

    if (arg === "--disclaimer") {
      optionValues.disclaimer = next;
      index += 1;
      continue;
    }

    if (arg === "--forbidden-claim") {
      optionValues.forbiddenClaims = [...(optionValues.forbiddenClaims || []), next];
      index += 1;
      continue;
    }

    if (arg === "--goal") {
      optionValues.goal = next;
      index += 1;
      continue;
    }

    if (arg === "--brand-name") {
      optionValues.brand = {
        ...(optionValues.brand || {}),
        name: next
      };
      index += 1;
      continue;
    }

    if (arg === "--color") {
      optionValues.brand = {
        ...(optionValues.brand || {}),
        colors: [...((optionValues.brand || {}).colors || []), next]
      };
      index += 1;
      continue;
    }

    topicParts.push(arg);
  }

  return { topicParts, optionValues };
}

function normalizeRawRequest(raw, source) {
  const topic = String(raw.topic || "").trim();
  if (!topic) {
    throw new Error("주제를 입력하거나 JSON 파일을 지정해 주세요.");
  }

  const brand = {
    ...DEFAULT_REQUEST.brand,
    ...(raw.brand || {})
  };

  if (!Array.isArray(brand.colors)) {
    brand.colors = [];
  }

  return {
    topic,
    audience: String(raw.audience || DEFAULT_REQUEST.audience).trim(),
    goal: String(raw.goal || DEFAULT_REQUEST.goal).trim(),
    maxCards: clampCardCount(raw.maxCards, DEFAULT_REQUEST.maxCards),
    designPreset: raw.designPreset ? String(raw.designPreset).trim() : undefined,
    visualStyle: raw.visualStyle ? String(raw.visualStyle).trim() : undefined,
    domain: raw.domain ? String(raw.domain).trim() : undefined,
    contentType: raw.contentType ? String(raw.contentType).trim() : undefined,
    sources: normalizeSources(raw.sources, raw.checkedAt),
    checkedAt: raw.checkedAt,
    review: raw.review || {},
    disclaimer: raw.disclaimer ? String(raw.disclaimer).trim() : undefined,
    forbiddenClaims: Array.isArray(raw.forbiddenClaims)
      ? raw.forbiddenClaims.map((item) => String(item).trim()).filter(Boolean)
      : raw.forbiddenClaims ? [String(raw.forbiddenClaims).trim()] : [],
    brand,
    source
  };
}

function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

function looksLikeJsonFile(value) {
  return String(value).toLowerCase().endsWith(".json");
}

function resolveFromCwd(cwd, filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
}

module.exports = {
  normalizeInput
};
