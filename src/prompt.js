const fs = require("node:fs");
const path = require("node:path");

const { ensureInsideWorkspace } = require("./utils");

function buildImagePrompt(plan, card) {
  const visual = buildVisualDirection(plan, card);
  const styleAnchor = buildStyleAnchor(plan);
  const navigation = buildNavigationInstruction(plan, card);
  const exactText = buildExactText(plan, card);
  const contentControls = buildContentControls(plan.contentControls);
  const professionalSafety = buildProfessionalSafety(plan.professional);

  return [
    "Create a finished 1080x1080 Instagram card news image.",
    "",
    `Topic: ${plan.topic}`,
    `Target audience: ${plan.audience}`,
    `Card: ${card.index} of ${plan.cards.length}`,
    `Card role: ${card.role}`,
    `Design concept: ${plan.design.name} (${plan.design.preset})`,
    `Visual style: ${plan.visualStyle.name} (${plan.visualStyle.id})`,
    "",
    "Visual direction:",
    visual,
    "",
    "Series style anchor:",
    styleAnchor,
    "",
    "Layout:",
    "- Square 1080x1080 composition for Instagram carousel.",
    "- Use a professional Korean social-media card-news layout.",
    "- Keep generous safe margins on all sides.",
    "- Place the main headline as the strongest visual element.",
    "- Use the visual element as support, not as a background that hides text.",
    "- Keep all text inside readable zones with strong contrast.",
    navigation,
    "",
    contentControls,
    contentControls ? "" : undefined,
    "Text must be exactly:",
    exactText,
    "",
    "Typography:",
    "- Modern Korean sans-serif style.",
    "- Strong hierarchy: title large, body medium, optional bullet text compact.",
    `- ${plan.styleAnchor?.titleRule || "Break long Korean titles into two balanced lines when needed."}`,
    "- If a badge is listed in the exact text, keep it small and separate from the headline.",
    "- No distorted, misspelled, duplicated, or decorative Korean characters.",
    "",
    "Color palette:",
    `- Background: ${plan.design.background}`,
    `- Primary text: ${plan.design.ink}`,
    `- Accent: ${plan.design.accent}`,
    `- Secondary accent: ${plan.design.accentAlt}`,
    "",
    professionalSafety,
    professionalSafety ? "" : undefined,
    "Constraints:",
    "- Do not add extra Korean text.",
    "- Do not add extra English text unless it is listed in the exact text.",
    "- Do not add logos, watermarks, QR codes, UI mockups, fake app screens, or unreadable microtext.",
    "- Do not crop the text.",
    "- Do not change the meaning of the Korean copy.",
    "- Do not include people with identifiable real faces unless the topic explicitly requires it.",
    "- Final output must feel like a polished Instagram carousel card, not a poster mockup."
  ].filter((line) => line !== undefined).join("\n");
}

function writePromptFiles(plan, options = {}) {
  const cwd = options.cwd || process.cwd();
  const outputRoot = ensureInsideWorkspace(cwd, options.outputRoot || path.join(cwd, "output"));
  const outputDir = ensureInsideWorkspace(cwd, path.join(outputRoot, plan.id));
  const selectedCards = selectCards(plan.cards, options.cardNumber);

  fs.mkdirSync(outputDir, { recursive: true });
  removeGeneratedFiles(outputDir, selectedCards.map((card) => card.index), Boolean(options.cardNumber));

  const promptFiles = selectedCards.map((card) => {
    const file = path.join(outputDir, `prompt-${String(card.index).padStart(2, "0")}.md`);
    const content = `# Card ${card.index} Image Prompt

\`\`\`text
${buildImagePrompt(plan, card)}
\`\`\`
`;
    fs.writeFileSync(file, content, "utf8");
    return file;
  });

  const indexFile = path.join(outputDir, "prompts.md");
  fs.writeFileSync(indexFile, buildPromptIndex(plan, promptFiles, options.cardNumber), "utf8");
  const styleGuideFile = path.join(outputDir, "style-guide.md");
  fs.writeFileSync(styleGuideFile, buildStyleGuide(plan), "utf8");

  return {
    outputDir,
    promptFiles,
    indexFile,
    styleGuideFile
  };
}

function removeGeneratedFiles(outputDir, selectedIndexes = [], partial = false) {
  const selected = new Set(selectedIndexes.map((index) => Number(index)));

  for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const promptMatch = entry.name.match(/^prompt-(\d{2})\.md$/i);
    const legacyHtmlMatch = entry.name.match(/^card-(\d{2})\.html$/i);
    const matchedIndex = Number(promptMatch?.[1] || legacyHtmlMatch?.[1]);

    if ((promptMatch || legacyHtmlMatch) && (!partial || selected.has(matchedIndex))) {
      fs.rmSync(path.join(outputDir, entry.name), { force: true });
    }
  }
}

function selectCards(cards, cardNumber) {
  if (cardNumber === undefined || cardNumber === null || cardNumber === "") {
    return cards;
  }

  const parsed = Number.parseInt(cardNumber, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > cards.length) {
    throw new Error(`카드 번호는 1부터 ${cards.length} 사이여야 합니다.`);
  }

  return [cards[parsed - 1]];
}

function buildPromptIndex(plan, promptFiles, cardNumber) {
  const selected = cardNumber ? `\n- Selected card: ${cardNumber}` : "";
  const partialNote = cardNumber ? "\n- Existing prompt files are preserved during selected-card regeneration." : "";
  const files = promptFiles
    .map((file) => `- ${path.basename(file)}`)
    .join("\n");

  return `# GPT Image Prompt Set

## Summary

- Topic: ${plan.topic}
- Size: 1080x1080
- Cards in plan: ${plan.cards.length}
- Design preset: ${plan.design.preset}
- Visual style: ${plan.visualStyle.name} (${plan.visualStyle.id})
- Style guide: style-guide.md
${plan.professional?.enabled ? `- Professional domain: ${plan.professional.domainName} (${plan.professional.domain})` : "- Professional domain: none"}${selected}${partialNote}

## Prompt Files

${files}

## Use

Open each prompt file and paste one prompt at a time into GPT image generation.
Generate card images sequentially so style and text quality can be checked per card.
`;
}

function buildProfessionalSafety(professional) {
  if (!professional?.enabled) {
    return "";
  }

  const sourceLines = professional.sources.length
    ? professional.sources.map((source) => `- ${source.title}${source.url ? ` (${source.url})` : ""}${source.checkedAt ? `, checked at ${source.checkedAt}` : ""}`)
    : ["- No source provided. Treat all factual/legal/medical/financial claims as draft copy requiring source review."];
  const forbidden = professional.forbiddenClaims.map((claim) => `- ${claim}`).join("\n");

  return [
    "Professional safety:",
    `- Domain: ${professional.domainName} (${professional.domain})`,
    `- Content type: ${professional.contentType}`,
    `- Review required: ${professional.review.required ? "yes" : "no"}`,
    `- Reviewer role: ${professional.review.reviewerRole}`,
    `- Review status: ${professional.review.status}`,
    `- Disclaimer: ${professional.disclaimer}`,
    "- Sources:",
    ...sourceLines,
    "- Forbidden claims:",
    forbidden,
    "- Do not invent facts, statutes, prices, rates, diagnoses, outcomes, guarantees, or deadlines.",
    "- Do not present general information as personalized professional advice.",
    "- Keep any disclaimer text readable if it appears on the card."
  ].join("\n");
}

function buildStyleAnchor(plan) {
  const anchor = plan.styleAnchor || {};

  return [
    "- Keep this card visually consistent with the same carousel series.",
    `- Series ID: ${anchor.seriesId || `${plan.topic} | ${plan.design.preset} | ${plan.visualStyle.id}`}`,
    `- Repeated visual motif: ${anchor.visualMotif || `${plan.topic}을 상징하는 반복 오브젝트`}`,
    `- Layout system: ${anchor.layoutSystem || `${plan.design.name} 레이아웃을 일관되게 유지`}`,
    "- Reuse the same palette, title rhythm, visual scale, and margin system across every card."
  ].join("\n");
}

function buildContentControls(controls) {
  if (!controls) {
    return "";
  }

  const facts = formatList("Checked facts", controls.facts);
  const mustInclude = formatList("Must include", controls.mustInclude);
  const sourceNotes = formatList("Source notes", controls.sourceNotes);

  if (!facts && !mustInclude && !sourceNotes) {
    return "";
  }

  return [
    "Content controls:",
    "- Use these controls to avoid generic copy and unsupported claims.",
    facts,
    mustInclude,
    sourceNotes
  ].filter(Boolean).join("\n");
}

function formatList(label, values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }

  return [`- ${label}:`, ...values.map((value) => `  - ${value}`)].join("\n");
}

function buildStyleGuide(plan) {
  const controls = buildContentControls(plan.contentControls);

  return `# Series Style Guide

## Summary

- Topic: ${plan.topic}
- Size: ${plan.meta.size}
- Cards: ${plan.cards.length}
- Design preset: ${plan.design.name} (${plan.design.preset})
- Visual style: ${plan.visualStyle.name} (${plan.visualStyle.id})

## Series Style Anchor

${buildStyleAnchor(plan)}

## Typography

- Modern Korean sans-serif style.
- ${plan.styleAnchor?.titleRule || "Break long Korean titles into two balanced lines when needed."}
- Keep title, body, bullet, footer hierarchy consistent across cards.

## Palette

- Background: ${plan.design.background}
- Surface: ${plan.design.surface}
- Primary text: ${plan.design.ink}
- Muted text: ${plan.design.muted}
- Accent: ${plan.design.accent}
- Secondary accent: ${plan.design.accentAlt}

${controls ? `## Content Controls\n\n${controls}\n\n` : ""}## Card Copy

${plan.cards.map((card) => `### Card ${String(card.index).padStart(2, "0")} - ${card.role}

- Title: ${card.title}
- Body: ${card.body}
${card.bullets.length ? `- Bullets: ${card.bullets.join(" / ")}` : "- Bullets: none"}
`).join("\n")}`;
}

function buildNavigationInstruction(plan, card) {
  const navigation = card.navigation || { type: card.role === "body" ? "page" : "none" };

  if (navigation.type === "none") {
    return [
      "Navigation: none",
      "- Do not show page numbers, badges, eyebrows, corner labels, or carousel counters on this card."
    ].join("\n");
  }

  if (navigation.type === "badge") {
    return [
      "Navigation: top-left badge only",
      `- Show only the badge "${card.eyebrow}" in the top-left corner.`,
      "- Do not show page numbers or any other carousel counter."
    ].join("\n");
  }

  return [
    "Navigation: page number only",
    `- Show only the page number "${card.index}/${plan.cards.length}" in a quiet corner.`,
    "- Do not show badges, eyebrows, POINT labels, or corner category tags."
  ].join("\n");
}

function buildExactText(plan, card) {
  const lines = [];

  if (card.navigation?.type === "badge" && card.eyebrow) {
    lines.push(`Eyebrow: ${card.eyebrow}`);
  }

  lines.push(`Title: ${card.title}`);
  lines.push(`Body: ${card.body}`);

  if (card.bullets?.length) {
    lines.push("Bullets:");
    card.bullets.forEach((bullet) => {
      lines.push(`- ${bullet}`);
    });
  }

  lines.push(`Footer: ${card.footer}`);

  if (card.navigation?.type === "page") {
    lines.push(`Page number: ${card.index}/${plan.cards.length}`);
  }

  return lines.join("\n");
}

function buildVisualDirection(plan, card) {
  const topic = plan.topic;
  const roleDirections = {
    cover: `Create one memorable visual metaphor for "${topic}" using a clean editorial illustration or realistic lifestyle object scene, with empty space for the headline.`,
    body: `Create a supporting visual related to "${card.title}" and "${topic}", using simple objects, subtle depth, and clear information-design composition.`,
    closing: `Create a calm closing visual for saving, checking, or reviewing next steps related to "${topic}".`
  };
  const presetDirections = {
    educational: "Layout archetype: explainer diagram. Use a structured grid, one small visual system, labels as shapes only, and a calm learning rhythm.",
    promotional: "Layout archetype: campaign card. Use a strong offer-like focal area, diagonal movement, high contrast, and benefit-led emphasis.",
    minimal: "Layout archetype: quiet single-message card. Use one object or symbol, wide negative space, and very little supporting detail.",
    bold: "Layout archetype: checklist utility card. Use modular blocks, strong separators, high-contrast accents, and a direct practical mood.",
    editorial: "Layout archetype: magazine spread. Use asymmetric composition, refined cropping, pull-quote energy, and controlled texture."
  };
  const styleDirections = {
    photo: "Hard visual style rule: photorealistic editorial photography. Keep a photographic look with realistic camera optics, natural shadows, believable materials, and no illustration, 3D render, vector icon, or meme graphic treatment.",
    illustration: "Hard visual style rule: custom editorial illustration. Use drawn shapes, simplified symbolic objects, controlled line work, and avoid photorealism, 3D render, stock-photo lighting, or meme graphics.",
    "3d": "Hard visual style rule: isometric 3D render. Use modeled objects, soft studio lighting, ambient occlusion, tactile clay or plastic materials, and avoid photography, flat vector illustration, or meme typography.",
    magazine: "Hard visual style rule: magazine editorial layout. Use premium art direction, sophisticated crop tension, column rhythm, cover-story energy, and avoid checklist UI or meme-card styling.",
    meme: "Hard visual style rule: meme-card composition. Use bold reaction-style framing, oversized simple shapes, humorous visual contrast, and avoid premium magazine styling or corporate stock-photo polish."
  };

  return [
    `- ${roleDirections[card.role] || roleDirections.body}`,
    `- ${presetDirections[plan.design.preset] || presetDirections.educational}`,
    `- ${styleDirections[plan.visualStyle.id] || styleDirections.illustration}`,
    "- The visual must support the card message and leave text readable."
  ].join("\n");
}

module.exports = {
  buildImagePrompt,
  writePromptFiles
};
