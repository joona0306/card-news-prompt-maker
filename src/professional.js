const PROFESSIONAL_DOMAINS = {
  real_estate: {
    id: "real_estate",
    name: "부동산",
    defaultReviewerRole: "공인중개사 또는 변호사",
    defaultDisclaimer: "본 콘텐츠는 일반 정보이며, 개별 계약 또는 투자 판단은 전문가 상담이 필요합니다.",
    forbiddenClaims: ["확정 수익", "무조건 안전", "최저가 보장", "허위 매물", "수익 보장"],
    keywords: /(부동산|전세|월세|매매|청약|임대차|계약|등기|중개|보증금|분양)/
  },
  insurance: {
    id: "insurance",
    name: "보험",
    defaultReviewerRole: "보험설계사 또는 준법감시 담당자",
    defaultDisclaimer: "본 콘텐츠는 일반 정보이며, 실제 보장 여부와 보험금 지급은 약관과 심사 기준에 따라 달라질 수 있습니다.",
    forbiddenClaims: ["무조건 보장", "100% 지급", "보험금 확정", "누구나 가입", "손해 없음"],
    keywords: /(보험|보험금|보장|청구|약관|면책|갱신|특약|해지환급금)/
  },
  legal: {
    id: "legal",
    name: "법률",
    defaultReviewerRole: "변호사",
    defaultDisclaimer: "본 콘텐츠는 일반 정보이며, 개별 사건 판단은 변호사 상담이 필요합니다.",
    forbiddenClaims: ["100% 승소", "무조건 승소", "형량 보장", "전관 효과", "즉시 해결"],
    keywords: /(법률|소송|고소|고발|변호사|계약서|합의|상속|이혼|형사|민사|노무|분쟁)/
  },
  medical: {
    id: "medical",
    name: "의학",
    defaultReviewerRole: "의사 또는 의료 전문가",
    defaultDisclaimer: "본 콘텐츠는 일반 건강 정보이며, 진단과 치료는 의료 전문가 상담이 필요합니다.",
    forbiddenClaims: ["완치 보장", "부작용 없음", "100% 효과", "즉시 치료", "진단 확정"],
    keywords: /(의학|의료|건강|질환|증상|진단|치료|약|복용|수술|병원|고혈압|당뇨|암|통증)/
  }
};

const CONTENT_TYPES = {
  general_info: "general_info",
  advertisement: "advertisement"
};

function createProfessionalContext(request) {
  const domain = normalizeDomain(request.domain) || inferProfessionalDomain(request);

  if (!domain) {
    return { enabled: false };
  }

  const config = PROFESSIONAL_DOMAINS[domain];
  const sources = normalizeSources(request.sources, request.checkedAt);
  const review = normalizeReview(request.review, config);
  const contentType = normalizeContentType(request.contentType);
  const forbiddenClaims = unique([
    ...config.forbiddenClaims,
    ...normalizeStringArray(request.forbiddenClaims)
  ]);

  return {
    enabled: true,
    domain: config.id,
    domainName: config.name,
    contentType,
    sources,
    needsSourceReview: sources.length === 0,
    review,
    disclaimer: request.disclaimer || config.defaultDisclaimer,
    forbiddenClaims,
    facts: normalizeStringArray(request.facts),
    mustInclude: normalizeStringArray(request.mustInclude),
    sourceNotes: normalizeStringArray(request.sourceNotes)
  };
}

function normalizeDomain(value) {
  if (!value) {
    return undefined;
  }

  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const aliases = {
    real_estate: "real_estate",
    realestate: "real_estate",
    property: "real_estate",
    "부동산": "real_estate",
    "공인중개": "real_estate",
    insurance: "insurance",
    "보험": "insurance",
    finance_insurance: "insurance",
    legal: "legal",
    law: "legal",
    "법률": "legal",
    "법무": "legal",
    medical: "medical",
    medicine: "medical",
    healthcare: "medical",
    health: "medical",
    "의학": "medical",
    "의료": "medical",
    "건강": "medical"
  };

  return aliases[key];
}

function inferProfessionalDomain(request) {
  const source = `${request.topic || ""} ${request.goal || ""}`.toLowerCase();

  for (const config of Object.values(PROFESSIONAL_DOMAINS)) {
    if (config.keywords.test(source)) {
      return config.id;
    }
  }

  return undefined;
}

function normalizeContentType(value) {
  if (!value) {
    return CONTENT_TYPES.general_info;
  }

  const key = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const aliases = {
    general_info: CONTENT_TYPES.general_info,
    info: CONTENT_TYPES.general_info,
    information: CONTENT_TYPES.general_info,
    "정보": CONTENT_TYPES.general_info,
    "일반정보": CONTENT_TYPES.general_info,
    advertisement: CONTENT_TYPES.advertisement,
    ad: CONTENT_TYPES.advertisement,
    promotion: CONTENT_TYPES.advertisement,
    "광고": CONTENT_TYPES.advertisement,
    "홍보": CONTENT_TYPES.advertisement
  };

  return aliases[key] || CONTENT_TYPES.general_info;
}

function normalizeSources(sources, defaultCheckedAt) {
  if (!sources) {
    return [];
  }

  const list = Array.isArray(sources) ? sources : [sources];

  return list
    .map((source) => normalizeSource(source, defaultCheckedAt))
    .filter((source) => source.title || source.url);
}

function normalizeSource(source, defaultCheckedAt) {
  if (!source) {
    return {
      title: "",
      url: undefined,
      checkedAt: defaultCheckedAt
    };
  }

  if (typeof source === "string") {
    const [title, url, checkedAt] = source.split("|").map((part) => part?.trim());

    if (url) {
      return {
        title,
        url,
        checkedAt: checkedAt || defaultCheckedAt
      };
    }

    return {
      title: source,
      url: source.startsWith("http") ? source : undefined,
      checkedAt: defaultCheckedAt
    };
  }

  return {
    title: String(source.title || "").trim(),
    url: source.url ? String(source.url).trim() : undefined,
    checkedAt: source.checkedAt || defaultCheckedAt
  };
}

function normalizeReview(review, config) {
  const normalized = review || {};
  const required = normalized.required === undefined ? true : Boolean(normalized.required);

  return {
    required,
    reviewerRole: normalized.reviewerRole || config.defaultReviewerRole,
    status: normalized.status || (required ? "required" : "not_required")
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

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

module.exports = {
  CONTENT_TYPES,
  PROFESSIONAL_DOMAINS,
  createProfessionalContext,
  inferProfessionalDomain,
  normalizeContentType,
  normalizeDomain,
  normalizeSources
};
