const path = require("node:path");

function clampCardCount(value, defaultCount = 6) {
  if (value === undefined || value === null || value === "") {
    return defaultCount;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return defaultCount;
  }

  return Math.min(10, Math.max(2, parsed));
}

function slugifyTopic(topic) {
  const normalized = String(topic || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();

  const slug = normalized
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "card-news";
}

function ensureInsideWorkspace(workspaceRoot, candidatePath) {
  const root = path.resolve(workspaceRoot);
  const candidate = path.resolve(candidatePath);
  const rootWithSeparator = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (candidate !== root && !candidate.startsWith(rootWithSeparator)) {
    throw new Error(`출력 경로가 워크스페이스 밖입니다: ${candidate}`);
  }

  return candidate;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  clampCardCount,
  ensureInsideWorkspace,
  escapeHtml,
  slugifyTopic
};
