import OpenAI from "openai";
import readline from "readline";

// OpenAI APIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 例データ（オブジェクト形式）
const suggestions = [
  {
    name: "プログラミングサークル",
    tags: ["PC", "プログラミング", "IT", "インターネット"],
    description: "プログラミングをするサークルです",
  },
  {
    name: "AI研究部",
    tags: ["AI", "機械学習", "ディープラーニング"],
    description: "AI技術を研究する部活です",
  },
  {
    name: "デザインワークショップ",
    tags: ["デザイン", "UI", "UX", "クリエイティブ"],
    description: "デザインを学ぶワークショップです",
  },
  {
    name: "軽音楽部",
    tags: ["音楽", "バンド", "演奏", "ロック"],
    description: "バンド活動を通じて音楽を楽しむ部活です",
  },
  {
    name: "フットサルクラブ",
    tags: ["スポーツ", "フットサル", "サッカー", "運動"],
    description: "フットサルを楽しむためのクラブです",
  },
  {
    name: "茶道部",
    tags: ["伝統", "文化", "茶道", "和"],
    description: "茶道の作法を学び、日本文化を楽しむ部活です",
  },
  {
    name: "写真同好会",
    tags: ["写真", "カメラ", "アート", "風景"],
    description: "カメラを使って風景や人物を撮影するサークルです",
  },
  {
    name: "料理サークル",
    tags: ["料理", "グルメ", "創作", "キッチン"],
    description: "料理を作りながら創作活動を楽しむサークルです",
  },
  {
    name: "登山部",
    tags: ["アウトドア", "登山", "自然", "冒険"],
    description: "山登りを通じて自然を満喫する部活です",
  },
  {
    name: "映画研究会",
    tags: ["映画", "鑑賞", "映像", "分析"],
    description: "映画を鑑賞し、その魅力を研究する部活です",
  },
];

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

    // 類似度でソートして上位5件を返す
    return scores.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
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
