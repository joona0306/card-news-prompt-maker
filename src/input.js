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
      facts: optionValues.facts,
      mustInclude: optionValues.mustInclude,
      sourceNotes: optionValues.sourceNotes,
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

    if (arg === "--cards" || arg === "--max-cards") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.maxCards = next;
      index += 1;
      continue;
    }

    if (arg === "--preset" || arg === "--design-preset") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.designPreset = next;
      index += 1;
      continue;
    }

    if (arg === "--visual-style" || arg === "--style") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.visualStyle = next;
      index += 1;
      continue;
    }

    if (arg === "--audience") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.audience = next;
      index += 1;
      continue;
    }

    if (arg === "--domain") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.domain = next;
      index += 1;
      continue;
    }

    if (arg === "--content-type") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.contentType = next;
      index += 1;
      continue;
    }

    if (arg === "--source") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.sources = [...(optionValues.sources || []), next];
      index += 1;
      continue;
    }

    if (arg === "--checked-at") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.checkedAt = next;
      index += 1;
      continue;
    }

    if (arg === "--reviewer-role") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.review = {
        ...(optionValues.review || {}),
        reviewerRole: next
      };
      index += 1;
      continue;
    }

    if (arg === "--review-status") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.review = {
        ...(optionValues.review || {}),
        status: next
      };
      index += 1;
      continue;
    }

    if (arg === "--disclaimer") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.disclaimer = next;
      index += 1;
      continue;
    }

    if (arg === "--forbidden-claim") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.forbiddenClaims = [...(optionValues.forbiddenClaims || []), next];
      index += 1;
      continue;
    }

    if (arg === "--fact") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.facts = [...(optionValues.facts || []), next];
      index += 1;
      continue;
    }

    if (arg === "--must-include") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.mustInclude = [...(optionValues.mustInclude || []), next];
      index += 1;
      continue;
    }

    if (arg === "--source-note") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.sourceNotes = [...(optionValues.sourceNotes || []), next];
      index += 1;
      continue;
    }

    if (arg === "--goal") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.goal = next;
      index += 1;
      continue;
    }

    if (arg === "--brand-name") {
      const next = readRequiredOptionValue(args, index, arg);
      optionValues.brand = {
        ...(optionValues.brand || {}),
        name: next
      };
      index += 1;
      continue;
    }

    if (arg === "--color") {
      const next = readRequiredOptionValue(args, index, arg);
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
    forbiddenClaims: normalizeStringArray(raw.forbiddenClaims),
    contentOutline: normalizeContentOutline(raw.contentOutline || raw.cards),
    facts: normalizeStringArray(raw.facts || raw.checkedFacts),
    mustInclude: normalizeStringArray(raw.mustInclude),
    sourceNotes: normalizeStringArray(raw.sourceNotes),
    brand,
    source
  };
}

function readRequiredOptionValue(args, index, optionName) {
  const value = args[index + 1];
  if (value === undefined || value === null || String(value).trim() === "" || String(value).startsWith("--")) {
    throw new Error(`${optionName} 옵션 뒤에 값을 지정해 주세요.`);
  }

  return value;
}

function normalizeContentOutline(value) {
  if (!value) {
    return [];
  }

  const items = Array.isArray(value) ? value : [value];
  return items
    .map((item) => normalizeContentItem(item))
    .filter((item) => item.title || item.body);
}

function normalizeContentItem(item) {
  if (typeof item === "string") {
    const text = item.trim();
    return {
      title: text,
      body: text,
      bullets: []
    };
  }

  const title = String(item.title || item.headline || "").trim();
  const body = String(item.body || item.copy || item.text || title).trim();
  const fallbackTitle = title || body.slice(0, 28).trim();

  return {
    title: fallbackTitle,
    body,
    bullets: normalizeStringArray(item.bullets || item.points)
  };
}

function normalizeStringArray(value) {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map((item) => String(item).trim())
    .filter(Boolean);
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
