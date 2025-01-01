import OpenAI from "openai";
import readline from "readline";
import { suggestions } from "./data";

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// コサイン類似度計算関数
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// サジェスチョンロジック
async function getSuggestions(query: string): Promise<{ name: string; similarity: number }[]> {
  try {
    // ユーザーのクエリを埋め込みに変換
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const queryEmbedding = response.data[0].embedding;

    // 各候補の埋め込みを計算し、類似度を求める
    const scores = await Promise.all(
      suggestions.map(async (item) => {
        // tagsとdescriptionを結合して入力とする
        const inputText = `${item.name} ${item.tags.join(" ")} ${item.description}`;
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: inputText,
        });
        const suggestionEmbedding = embeddingResponse.data[0].embedding;
        return {
          name: item.name,
          similarity: cosineSimilarity(queryEmbedding, suggestionEmbedding),
        };
      })
    );

    return scores.sort((a, b) => b.similarity - a.similarity);
    // 類似度でソートして上位5件を返す
    // return scores.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

// 標準入力からクエリを取得
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("検索クエリを入力してください: ", async (query) => {
  if (query) {
    const results = await getSuggestions(query);
    console.log("サジェスチョン結果:", results);
  } else {
    console.log("クエリが入力されませんでした。");
  }
  rl.close();
});
