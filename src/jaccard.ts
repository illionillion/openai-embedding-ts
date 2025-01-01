import { suggestions } from "./data";

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

// クエリ
const query = new Set(["AI", "技術", "学ぶ", "PC"]);

// 類似度計算
suggestions.forEach((item) => {
  const itemSet = new Set(item.tags);
  const similarity = jaccardSimilarity(query, itemSet);
  console.log(`Suggestion: ${item.name}, Similarity: ${similarity}`);
});
