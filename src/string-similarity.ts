import stringSimilarity from 'string-similarity';
import readline from "readline";
import { suggestions } from './data';

// 標準入力からクエリを取得
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("検索クエリを入力してください: ", async (query) => {
  if (query) {
    const data = suggestions.map((suggestion) => [suggestion.name, suggestion.description, ...suggestion.tags].join(" "));
    const matches = stringSimilarity.findBestMatch(query, data);
    console.log(matches);
  } else {
    console.log("クエリが入力されませんでした。");
  }
  rl.close();
});


