const { clampCardCount, slugifyTopic } = require("./utils");
const { createProfessionalContext } = require("./professional");

const DESIGN_PRESETS = {
  educational: {
    name: "정보 정리형",
    background: "#f7fbff",
    surface: "#ffffff",
    ink: "#102033",
    muted: "#526172",
    accent: "#0f766e",
    accentAlt: "#f59e0b"
  },
  promotional: {
    name: "혜택 강조형",
    background: "#fff7ed",
    surface: "#ffffff",
    ink: "#21130d",
    muted: "#6b4b3a",
    accent: "#dc2626",
    accentAlt: "#2563eb"
  },
  minimal: {
    name: "미니멀 메시지형",
    background: "#f8fafc",
    surface: "#ffffff",
    ink: "#111827",
    muted: "#64748b",
    accent: "#111827",
    accentAlt: "#14b8a6"
  },
  bold: {
    name: "체크리스트 강조형",
    background: "#fef2f2",
    surface: "#ffffff",
    ink: "#1f2937",
    muted: "#6b7280",
    accent: "#b91c1c",
    accentAlt: "#0f766e"
  },
  editorial: {
    name: "에디토리얼 인사이트형",
    background: "#f6f4ef",
    surface: "#ffffff",
    ink: "#1c1917",
    muted: "#78716c",
    accent: "#7c3aed",
    accentAlt: "#0d9488"
  }
};

const VISUAL_STYLES = {
  photo: {
    id: "photo",
    name: "사진형",
    description: "realistic photographic card visuals"
  },
  illustration: {
    id: "illustration",
    name: "일러스트형",
    description: "custom editorial illustration card visuals"
  },
  "3d": {
    id: "3d",
    name: "3D형",
    description: "polished three-dimensional rendered card visuals"
  },
  magazine: {
    id: "magazine",
    name: "잡지형",
    description: "refined magazine editorial card visuals"
  },
  meme: {
    id: "meme",
    name: "밈형",
    description: "shareable meme-inspired card visuals"
  }
};

const BODY_NAVIGATION_BY_PRESET = {
  educational: "page",
  promotional: "page",
  minimal: "badge",
  bold: "badge",
  editorial: "badge"
};

const BADGE_PREFIX_BY_PRESET = {
  minimal: "NOTE",
  bold: "CHECK",
  editorial: "INSIGHT",
  promotional: "BENEFIT"
};

const TEXT_DENSITY_BY_PRESET = {
  educational: {
    body: "full",
    bullets: 2
  },
  promotional: {
    body: "compact",
    bullets: 1
  },
  minimal: {
    body: "minimal",
    bullets: 0
  },
  bold: {
    body: "compact",
    bullets: 2
  },
  editorial: {
    body: "editorial",
    bullets: 0
  }
};

function createCardNewsPlan(request) {
  const topic = String(request.topic || "").trim();
  if (!topic) {
    throw new Error("카드뉴스 주제가 필요합니다.");
  }

  const maxCards = clampCardCount(request.maxCards, 6);
  const preset = selectDesignPreset(request);
  const visualStyleId = selectVisualStyle({ ...request, designPreset: preset });
  const professional = createProfessionalContext({ ...request, topic });
  const design = {
    preset,
    ...DESIGN_PRESETS[preset],
    ...(request.brand?.colors?.[0] ? { accent: request.brand.colors[0] } : {}),
    ...(request.brand?.colors?.[1] ? { background: request.brand.colors[1] } : {})
  };

  return {
    id: slugifyTopic(topic),
    topic,
    audience: request.audience || "인스타그램 사용자",
    goal: request.goal || "핵심 정보를 빠르게 이해시키기",
    brand: request.brand || { name: "Card News Maker", colors: [] },
    brief: buildBrief(topic, request),
    design,
    visualStyle: VISUAL_STYLES[visualStyleId],
    professional,
    cards: buildCards({ ...request, topic, maxCards, designPreset: preset }),
    meta: {
      generator: "local",
      aiReady: Boolean(process.env.OPENAI_API_KEY),
      size: "1080x1080"
    }
  };
}

function selectDesignPreset(request) {
  if (request.designPreset && DESIGN_PRESETS[request.designPreset]) {
    return request.designPreset;
  }

  const source = `${request.topic || ""} ${request.goal || ""}`.toLowerCase();

  if (/(이벤트|할인|혜택|프로모션|모집|판매|런칭|가격)/.test(source)) {
    return "promotional";
  }

  if (/(위험|주의|체크리스트|반드시|경고|실수|금지|필수)/.test(source)) {
    return "bold";
  }

  if (/(스토리|인사이트|트렌드|관점|인터뷰|브랜드|칼럼)/.test(source)) {
    return "editorial";
  }

  if (/(심플|요약|루틴|문장|한 줄|미니멀)/.test(source)) {
    return "minimal";
  }

  return "educational";
}

function selectVisualStyle(request) {
  if (request.visualStyle) {
    const normalized = normalizeVisualStyle(request.visualStyle);
    if (normalized) {
      return normalized;
    }

    throw new Error(`지원하지 않는 visualStyle입니다: ${request.visualStyle}`);
  }

  const source = `${request.topic || ""} ${request.goal || ""} ${request.designPreset || ""}`.toLowerCase();

  if (/(밈|유머|웃긴|재미|공감|mz|meme)/i.test(source)) {
    return "meme";
  }

  if (/(3d|입체|모형|렌더|제품\s*구조|구조|인테리어|공간)/i.test(source)) {
    return "3d";
  }

  if (/(사진|현장|건강|폭염|여름|여행|음식|운동|카페|매장|생활|실사)/i.test(source)) {
    return "photo";
  }

  if (request.designPreset === "editorial" || /(잡지|매거진|인터뷰|칼럼|트렌드|스토리)/i.test(source)) {
    return "magazine";
  }

  return "illustration";
}

function normalizeVisualStyle(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "-");

  const aliases = {
    photo: "photo",
    photographic: "photo",
    "사진": "photo",
    "사진형": "photo",
    "실사": "photo",
    "실사형": "photo",
    illustration: "illustration",
    illustrated: "illustration",
    "일러스트": "illustration",
    "일러스트형": "illustration",
    "삽화": "illustration",
    "삽화형": "illustration",
    "3d": "3d",
    "3d형": "3d",
    "three-d": "3d",
    threed: "3d",
    "입체": "3d",
    "입체형": "3d",
    magazine: "magazine",
    editorial: "magazine",
    "잡지": "magazine",
    "잡지형": "magazine",
    "매거진": "magazine",
    "매거진형": "magazine",
    meme: "meme",
    "밈": "meme",
    "밈형": "meme",
    "유머": "meme",
    "유머형": "meme"
  };

  return aliases[key];
}


function buildBrief(topic, request) {
  const audience = request.audience || "인스타그램 사용자";
  const goal = request.goal || "핵심 정보를 빠르게 이해시키기";
  return `${audience}가 ${topic}을 빠르게 이해하고, 다음 행동을 고를 수 있도록 ${goal}.`;
}

function buildCards(request) {
  const cards = [];
  const total = request.maxCards;
  const preset = request.designPreset || "educational";

  cards.push({
    index: 1,
    role: "cover",
    navigation: { type: "none" },
    eyebrow: "",
    title: request.topic,
    body: `${request.audience || "인스타그램 사용자"}를 위한 핵심 정리`,
    bullets: [],
    footer: request.brand?.name || "Card News Maker"
  });

  if (total === 1) {
    return cards;
  }

  const bodyCount = Math.max(0, total - 2);
  const bodyTemplates = createBodyTemplates(request);

  for (let index = 0; index < bodyCount; index += 1) {
    const template = bodyTemplates[index % bodyTemplates.length];
    const navigation = createBodyNavigation(preset, index + 1);
    const content = applyTextDensity(template, request, preset);

    cards.push({
      index: cards.length + 1,
      role: "body",
      navigation,
      eyebrow: navigation.type === "badge" ? navigation.label : "",
      title: content.title,
      body: content.body,
      bullets: content.bullets,
      footer: request.topic
    });
  }

  cards.push({
    index: cards.length + 1,
    role: "closing",
    navigation: { type: "none" },
    eyebrow: "",
    title: "마지막으로 기억할 것",
    body: `${request.topic}은 상황에 따라 달라질 수 있습니다. 저장 후 내 조건과 최신 기준을 다시 확인하세요.`,
    bullets: [],
    footer: request.brand?.name || "Card News Maker"
  });

  return cards;
}

function createBodyNavigation(preset, bodyNumber) {
  const type = BODY_NAVIGATION_BY_PRESET[preset] || "page";

  if (type === "badge") {
    const prefix = BADGE_PREFIX_BY_PRESET[preset] || "POINT";
    return {
      type,
      label: `${prefix} ${String(bodyNumber).padStart(2, "0")}`,
      position: "top-left"
    };
  }

  return {
    type: "page",
    position: "bottom-right"
  };
}

function applyTextDensity(template, request, preset) {
  const density = TEXT_DENSITY_BY_PRESET[preset] || TEXT_DENSITY_BY_PRESET.educational;
  const bullets = template.bullets.slice(0, density.bullets);

  if (density.body === "minimal") {
    return {
      title: template.title,
      body: `${template.title}만 기억하세요.`,
      bullets
    };
  }

  if (density.body === "compact") {
    return {
      title: template.title,
      body: `${request.topic}에서 바로 확인할 핵심 기준입니다.`,
      bullets
    };
  }

  if (density.body === "editorial") {
    return {
      title: template.title,
      body: `${request.topic}을 볼 때 놓치기 쉬운 관점을 짚어봅니다.`,
      bullets
    };
  }

  return {
    title: template.title,
    body: template.body,
    bullets
  };
}

function createBodyTemplates(request) {
  const topic = request.topic;
  const audience = request.audience || "인스타그램 사용자";
  const goal = request.goal || "핵심 정보를 빠르게 이해시키기";

  return [
    {
      title: "먼저 핵심만 잡기",
      body: `${topic}에서 가장 중요한 것은 전체 정보를 한 번에 외우는 것이 아니라, 판단 기준을 먼저 세우는 것입니다.`,
      bullets: [`대상: ${audience}`, `목표: ${goal}`]
    },
    {
      title: "내 상황과 맞는지 확인",
      body: "좋은 정보라도 조건이 맞지 않으면 실행 우선순위가 낮아집니다. 적용 가능한 조건부터 분리하세요.",
      bullets: ["필수 조건", "준비된 자료", "시간과 비용"]
    },
    {
      title: "실행 순서를 작게 나누기",
      body: "카드뉴스를 본 뒤 바로 움직일 수 있도록 첫 행동을 작게 정하면 실행률이 높아집니다.",
      bullets: ["오늘 확인할 것", "이번 주 준비할 것", "다음에 비교할 것"]
    },
    {
      title: "놓치기 쉬운 기준",
      body: `${topic}은 세부 조건에 따라 결과가 달라질 수 있으므로, 기준이 바뀌는 지점을 따로 표시해 두는 편이 좋습니다.`,
      bullets: ["기간", "대상", "필수 증빙"]
    },
    {
      title: "비교해야 할 선택지",
      body: "하나의 방법만 보고 결정하면 놓치는 비용이 생길 수 있습니다. 최소 두 가지 선택지를 비교하세요.",
      bullets: ["장점", "제약", "다음 행동"]
    },
    {
      title: "체크리스트로 마무리",
      body: "마지막에는 기억할 문장보다 다시 확인할 항목이 남아야 합니다.",
      bullets: ["저장하기", "공유하기", "실행 항목 표시하기"]
    },
    {
      title: "업데이트 기준 남기기",
      body: "정책, 가격, 일정처럼 바뀔 수 있는 정보는 확인 날짜를 남겨야 나중에 다시 검토하기 쉽습니다.",
      bullets: ["확인 날짜", "출처", "변경 가능성"]
    },
    {
      title: "한 문장으로 정리",
      body: `${topic}의 핵심은 내 조건에 맞는 정보를 골라 작게 실행하는 것입니다.`,
      bullets: ["핵심 기준", "첫 행동", "재확인 지점"]
    }
  ];
}

module.exports = {
  DESIGN_PRESETS,
  VISUAL_STYLES,
  createCardNewsPlan,
  selectDesignPreset,
  selectVisualStyle
};
