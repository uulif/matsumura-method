# UI刷新前に戻す方法

## これは何？
2026-02-26時点（UI刷新を始める直前）のアプリの状態に戻すためのガイドです。
このファイルをClaude Codeに見せて「戻して」と言えば復元できます。

---

## 復元ポイントの情報
- **日付**: 2026-02-26（UI刷新開始直前）
- **ブランチ**: `大型アップデートver1.0`
- **コミット**: `7f9eaf0`
- **Gitタグ**: `pre-ui-refresh`
- **プロジェクトパス**: `C:\Users\uulif\Desktop\matsumura-method\`

---

## 戻し方

### 方法1: 全部まるごと戻す（推奨）
Claude Codeに以下を実行してもらう：
```
cd "C:\Users\uulif\Desktop\matsumura-method" && git checkout pre-ui-refresh -- .
```
これで全ファイルがUI刷新前の状態に戻ります。変更履歴は残るので安心です。

### 方法2: CSSだけ戻す（見た目だけ元に戻したい時）
```
cd "C:\Users\uulif\Desktop\matsumura-method" && git checkout pre-ui-refresh -- css/style.css css/noteview.css
```

### 方法3: JSだけ戻す（動きだけ元に戻したい時）
```
cd "C:\Users\uulif\Desktop\matsumura-method" && git checkout pre-ui-refresh -- js/app.js js/pages.js js/noteview.js js/icons.js
```

### 方法4: 完全にその時点に戻る（新しいブランチを作って退避）
```
cd "C:\Users\uulif\Desktop\matsumura-method" && git checkout -b UI刷新前の状態 pre-ui-refresh
```
これで `UI刷新前の状態` という別ブランチに切り替わります。

---

## 注意事項
- 方法1〜3は今のブランチにいたまま、ファイルだけ巻き戻す方法です
- 方法4はブランチごと切り替えるので、戻った後は `大型アップデートver1.0` ブランチに戻る必要があります
- どの方法でも、戻した後に `git commit` すれば「戻した」という記録が残ります
- わからなければ「UI刷新前に戻して」とClaude Codeに言えばOKです

---

## Claude Code向けメモ
このファイルを見せられて「戻して」と言われたら、方法1を実行してください。
実行前に必ず現在の変更をcommitするか、ユーザーに確認を取ること。
