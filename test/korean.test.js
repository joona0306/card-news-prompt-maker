const test = require("node:test");
const assert = require("node:assert/strict");

const {
  appendObjectParticle,
  appendSubjectParticle,
  appendTopicParticle
} = require("../src/korean");

test("appendObjectParticle chooses 을 or 를 from the final Korean syllable", () => {
  assert.equal(appendObjectParticle("전세 계약을 앞둔 임차인"), "전세 계약을 앞둔 임차인을");
  assert.equal(appendObjectParticle("인스타그램 사용자"), "인스타그램 사용자를");
  assert.equal(appendObjectParticle("동네 매장 사장님"), "동네 매장 사장님을");
});

test("appendSubjectParticle chooses 이 or 가 for brief copy", () => {
  assert.equal(appendSubjectParticle("동네 매장 사장님"), "동네 매장 사장님이");
  assert.equal(appendSubjectParticle("인스타그램 사용자"), "인스타그램 사용자가");
});

test("appendTopicParticle chooses 은 or 는 for closing copy", () => {
  assert.equal(appendTopicParticle("전세 계약 전 확인할 5가지"), "전세 계약 전 확인할 5가지는");
  assert.equal(appendTopicParticle("보험금 청구"), "보험금 청구는");
  assert.equal(appendTopicParticle("고혈압 약"), "고혈압 약은");
});
