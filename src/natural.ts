import { TfIdf } from "natural";
import { suggestions } from "./data";
import readline from "readline";

// TF-IDFのインスタンス
const tfidf = new TfIdf();
suggestions.forEach((item, index) => {
  tfidf.addDocument(`${item.name} ${item.description} ${item.tags.join(" ")}`, index.toString());
});

// 標準入力からクエリを取得
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("検索クエリを入力してください: ", async (query) => {
  if (query) {
    tfidf.tfidfs(query, (i, measure) => {
      console.log(`サジェスチョン: ${suggestions[+i].name}, スコア: ${measure}`);
    });
  } else {
    console.log("クエリが入力されませんでした。");
  }
  rl.close();
});
