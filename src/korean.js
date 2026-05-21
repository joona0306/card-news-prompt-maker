function appendObjectParticle(value) {
  return appendParticle(value, "을", "를");
}

function appendSubjectParticle(value) {
  return appendParticle(value, "이", "가");
}

function appendTopicParticle(value) {
  return appendParticle(value, "은", "는");
}

function appendParticle(value, withFinalConsonant, withoutFinalConsonant) {
  const text = String(value || "").trim();
  if (!text) {
    return text;
  }

  return `${text}${hasFinalConsonant(text) ? withFinalConsonant : withoutFinalConsonant}`;
}

function hasFinalConsonant(value) {
  const char = getLastMeaningfulChar(value);
  if (!char) {
    return false;
  }

  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }

  return (code - 0xac00) % 28 !== 0;
}

function getLastMeaningfulChar(value) {
  const text = String(value || "").trim();
  for (let index = text.length - 1; index >= 0; index -= 1) {
    const char = text[index];
    if (/[\s"'`.,!?()[\]{}<>]/.test(char)) {
      continue;
    }

    return char;
  }

  return "";
}

module.exports = {
  appendObjectParticle,
  appendSubjectParticle,
  appendTopicParticle,
  hasFinalConsonant
};
