# UI刷新 Phase 3: 書く体験チーム（テキスト入力の振る舞い全般）

> 作業状況: 設計完了
> **⚠️ 2026-03-08照合結果**: v282〜v289の変更により**行番号は全面的にずれている**（style.css +45〜139行、app.js +300〜410行、pages.js +10〜33行）。実装時は行番号ではなく**クラス名でgrepして特定**すること。CSSクラスの存在・プロパティ引用はほぼ正確。

---

## 参照アプリとの比較

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **入力スタイル数** | 24クラス。background/border/outline/focusが全てバラバラ | 1スタイル（白背景、薄いボーダー、フォーカスで青アンダーライン） | ボーダーレス。placeholderのみ。フォーカスで背景変化なし | 行ベース（ボーダーなし、行間区切り線のみ） |
| **フォーカス表現** | 5種類混在（outline 2px blue / border-color変化 / background変化 / outline消し / なし） | 青アンダーライン統一（border-bottom: 2px solid blue） | 変化なし（カーソル点滅のみ） | 行ハイライト（薄い青背景） |
| **placeholder色** | 2種類（`var(--text-placeholder)` と未指定のブラウザデフォルト） | 薄いグレー統一 | 薄いグレー統一（rgba(55,53,47,0.5)） | システムグレー統一 |
| **テキストエリア伸長** | 同一パターン8箇所にコピペ。minHeight閾値もバラバラ | autosize 1関数統一 | ブロック単位で自動伸長。専用エディタ | iOS標準TextViewの自動伸長 |
| **展開/省略** | 9箇所の個別checkOverflow実装。全て同じ `scrollHeight > clientHeight` パターンのコピペ | 不使用（常に全文表示） | トグルブロック（1クリックで展開） | 不使用 |
| **入力中のスワイプ防止** | 入力フィールド上は `deltaX > deltaY * 2` で閾値2倍化 | 入力フィールドでスワイプ不可（タスク追加はモーダル） | スワイプ操作なし | 入力中はスワイプ無効化（OS レベル） |

---

## A. テキスト入力CSSの統一

### A-1. 現状の全24クラス分類

#### 分類1: フォーム型（ページ内埋め込み入力、ボーダーなし、背景色あり）

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 1 | `.form-input` | L1908-1930 | `calc(18px * var(--input-font-size)/100)` | 12px | なし | `var(--bg-gray)` | background → `#e8e8ec` | 日誌7フィールド、月次目標、パターン分析、スケジュール追加 |
| 2 | `.form-input-single` | L8384-8402 | `calc(16px * var(--input-font-size)/100)` | 14px | なし | `var(--bg-gray)` | background → `#e8e8ec` | マニュアルタイトル・カテゴリ |
| 3 | `.form-input.tall` | L8405-8407 | (親継承) | (親継承) | (親継承) | (親継承) | (親継承) | マニュアル本文 |
| 4 | `.form-input.life-textarea` | L1877-1882 | (親継承) | (親継承) | (親継承) | (親継承) | (親継承) | 人生設計テキストエリア |

**共通点**: 全てボーダーなし、`var(--bg-gray)` 背景、フォーカス時に背景が `#e8e8ec` に変化。
**問題**: フォーカス時の `#e8e8ec` がハードコード色（Phase 1原則5違反）。font-sizeが18pxと16pxで不統一。

#### 分類2: モーダル型（モーダル内入力、ボーダーあり、背景色あり）

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 5 | `.modal-input` | L2592-2606 | 15px | 10px 12px | `1px solid var(--border)` | `var(--bg-gray)` | `outline: 2px solid var(--primary)` | タスク/ルーティン/APIキー各モーダル |
| 6 | `.modal-input.modal-textarea` | L2608-2613 | `calc(16px * var(--input-font-size)/100)` | (親継承) | (親継承) | (親継承) | (親継承) | テキスト編集モーダル |
| 7 | `.modal-notes` | L2664-2670 | 14px | (親継承) | (親継承) | (親継承) | (親継承) | タスク/ルーティン補足メモ |

**共通点**: ボーダーあり（1px）、`var(--bg-gray)` 背景。
**問題**: フォーカス時が `outline: 2px` で Phase 1ボーダー原則1違反（outlineは対象外だが視覚的に太い）。

#### 分類3: インライン型（既存テキストの直接編集、ボーダー最小限）

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 8 | `.inline-edit-input` | L3917-3927 | 15px | 4px 0 | `border-bottom: 2px solid var(--primary)` | transparent | なし（outline: none） | 設定ページのインライン数値入力 |
| 9 | `.birthday-field` | L3936-3955 | 15px | 4px 2px | `border-bottom: 2px solid var(--border)` | transparent | border-bottom-color → `var(--primary)` | 生年月日入力 |
| 10 | `.journal-title-edit-textarea` | L5005-5015 | 14px | 0 | なし | transparent | なし | 日誌タイトル編集（インライン） |
| 11 | `.milestone-edit-textarea` | L5826-5836 | 14px | 0 | なし | transparent | なし | 逆算目標テキスト編集（インライン） |
| 12 | `.goal-textarea` | L5883-5897 | (親継承) | 8px | なし | transparent | なし | 年齢別目標テキスト（インライン） |

**共通点**: 背景transparent、既存テキストをその場で編集する用途。
**問題**: ボーダーが `2px solid var(--primary)` と `2px solid var(--border)` の2パターン（Phase 1原則1違反）。journal-title-edit-textareaとmilestone-edit-textareaはフォーカスフィードバックが一切なく、編集中であることが視覚的に不明瞭。

#### 分類4: 独立入力型（ページ固有の入力フィールド、ボーダーあり）

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 13 | `.input-field` | L2226-2241 | `calc(14px * var(--input-font-size)/100)` | 10px 12px | なし | `var(--bg-gray)` | `outline: 2px solid var(--primary)` | 月次目標イメージフィールド、ブレイクダウン、評価数値 |
| 14 | `.eval-textarea` | L5707-5710 | (親継承) | (親継承) | (親継承) | (親継承) | (親継承) | ルーティン月次評価テキストエリア（`.input-field` の子） |
| 15 | `.routine-edit-form .input-field` | L5624-5626 | (親継承) | (親継承) | `2px solid #888` | (親継承) | (親継承) | ルーティン編集フォーム内（ボーダー上書き） |
| 16 | `.material-add-input` | L10140-10154 | 16px | 14px 16px | `1px solid #999` | `#fff` | `border-color: #667eea` | 資料追加タイトル |
| 17 | `.material-add-textarea` | L10156-10173 | 15px | 14px 16px | `1px solid #999` | `#fff` | `border-color: #667eea` | 資料追加本文 |

**共通点**: 独立したフォームフィールドだが、ボーダー・背景が統一されていない。
**問題**: `.input-field` はborderなしだが `.routine-edit-form .input-field` では `2px solid #888` に上書き。material系はハードコード色 `#999`, `#667eea`, `#fff`, `#333` が多数（Phase 1原則5違反）。

#### 分類5: クイック入力型（素早い入力を想定、太めボーダー）

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 18 | `.firstbox-textarea` | L8713-8728 | 16px | 12px | `2px solid #999` | (未指定→白) | `border-color: var(--primary)` | F・BOX振り分けフロー入力 |
| 19 | `.fbox-quick-input` | L8924-8939 | 15px | 12px | `2px solid #999` | (未指定→白) | `border-color: var(--primary)` | F・BOXクイック入力（小） |
| 20 | `.fbox-quick-input-large` | L8964-8968 | 16px | (親継承) | (親継承) | (親継承) | (親継承) | F・BOXクイック入力（大・パターンB） |
| 21 | `.ai-textarea` | L8560-8574 | 15px | 12px | `1px solid #999` | (未指定→白) | `border-color: #0ea5e9` | AIテストモーダル入力 |

**共通点**: ユーザーがテキストを「書き始める」起点。ボーダーで存在感を出す意図。
**問題**: border幅が2pxと1pxで不統一（Phase 1原則1違反）。ハードコード色 `#999`, `#0ea5e9`, `#667eea` 混在。

#### 分類6: 特殊用途型

| # | クラス名 | CSS行 | font-size | padding | border | background | focus挙動 | 用途 |
|---|---------|-------|-----------|---------|--------|------------|----------|------|
| 22 | `.expand-edit-textarea` | L1818-1834 | `calc(15px * var(--input-font-size)/100)` | 12px | `2px solid var(--primary)` | `#fff` | `border-color: var(--primary-dark)` | 展開→編集モードのテキストエリア |
| 23 | `.schedule-time-input` | L6035-6048, L7677-7687 | 15px / 14px | 8px | `2px solid var(--border)` / `1px solid var(--border)` | `var(--bg-gray)` / (未指定) | `border-color: var(--primary)` | スケジュール時刻入力（2箇所で定義が重複） |
| 24 | `.cycle-input` | L7868-7874 | 14px | 8px 10px | `1px solid var(--border)` | (未指定) | (未指定) | サイクル日数入力 |
| 25 | `.rv-day-memo-input` | L4434-4443 | 13px | 8px | `1px solid #ccc` | (未指定) | (未指定) | 振り返りカレンダー日メモ |
| 26 | `.inline-input-field` | L2811-2818 | 14px | 8px 12px | `2px solid var(--border)` | (未指定) | (未指定) | インラインモーダル入力 |
| 27 | `.toast-input-field` | L2873-2879 | 14px | 8px 12px | `2px solid var(--border)` | (未指定) | (未指定) | トーストモーダル入力 |
| 28 | `.modal-memo-input` | L2893-2904 | 14px | 10px 12px | `2px solid var(--border)` | `var(--bg-main)` | `border-color: var(--primary)` | モーダルメモ入力 |
| 29 | `.favorite-add-input` | L2990-2996 | 13px | 8px 10px | `1px solid var(--border)` | (未指定) | (未指定) | お気に入り追加入力 |

**問題**: `.schedule-time-input` が2箇所（L6035, L7677）で異なる定義。border幅が2pxと1pxで混在。ハードコード色 `#ccc`, `#fff` 残存。

### A-2. 統一後のベースクラス＋modifier設計

#### 設計方針

Todoist方式を基本とする:
- **ベース**: 薄いボーダー（1px）、背景色あり、フォーカスで一貫した視覚フィードバック
- Notionの完全ボーダーレスは「目標管理アプリ」の用途にはカジュアルすぎる
- Apple Remindersの行ベース入力はWebでの再現が困難

#### CSS変数定義（Phase 1トークン基盤への追加要請）

```css
:root {
  /* === テキスト入力トークン === */
  --input-bg: var(--bg-gray);
  --input-bg-focus: var(--color-gray-200);          /* #e8e8e8 — 旧 #e8e8ec を統一 */
  --input-border: var(--color-gray-300);             /* #d0d0d0 */
  --input-border-focus: var(--primary);
  --input-placeholder: var(--text-placeholder);
  --input-text: var(--text-primary);
  --input-radius: var(--radius-md);                  /* 8px */
  --input-padding-x: 12px;
  --input-padding-y: 10px;
  --input-focus-ring: 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent);
}

body.dark-mode {
  --input-bg: var(--color-gray-900);
  --input-bg-focus: var(--color-gray-800);
  --input-border: var(--color-gray-700);
}
```

#### ベースクラス: `.input-base`

全テキスト入力の共通基盤。

```css
/* === テキスト入力 統一ベース === */
.input-base {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: calc(15px * var(--input-font-size) / 100);
  color: var(--input-text);
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color var(--transition-fast),
              background var(--transition-fast),
              box-shadow var(--transition-fast);
}

.input-base:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: var(--input-focus-ring);
}

.input-base::placeholder {
  color: var(--input-placeholder);
}

/* リサイズ可能（textarea向け） */
.input-base[rows],
textarea.input-base {
  resize: vertical;
  line-height: 1.6;
}
```

**参照アプリ比較**:
- Todoist: 白背景 + 1px border + フォーカスで青アンダーライン → 本設計はborder全周 + focus-ring
- Notion: ボーダーレス + placeholderのみ → 本設計は控えめなボーダーあり（目標管理の用途には枠があったほうが明確）
- Apple Reminders: iOS標準 → 本設計はWeb向けに翻訳

#### modifier: `.input--form`（フォーム型）

```css
/* フォーム型: ページ内埋め込み、ボーダーなし、背景強調 */
.input--form {
  border: none;
  background: var(--input-bg);
  border-radius: var(--radius-lg);
  padding: 12px;
  font-size: calc(16px * var(--input-font-size) / 100);
}

.input--form:focus {
  background: var(--input-bg-focus);
  box-shadow: none;
  border: none;
}

/* 高さバリアント */
.input--form.input--tall {
  min-height: 200px;
}
```

#### modifier: `.input--modal`（モーダル型）

```css
/* モーダル型: ボーダーあり、モーダル内配置 */
.input--modal {
  margin-bottom: 8px;
}

/* モーダル内テキストエリア */
.input--modal.input--textarea {
  min-height: 200px;
  font-size: calc(16px * var(--input-font-size) / 100);
}

/* モーダル内メモ（補足情報） */
.input--modal.input--notes {
  min-height: 60px;
  font-size: 14px;
}
```

#### modifier: `.input--inline`（インライン型）

```css
/* インライン型: 既存テキストの直接編集、背景transparent */
.input--inline {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--input-border);
  border-radius: 0;
  padding: 4px 0;
}

.input--inline:focus {
  border-bottom-color: var(--input-border-focus);
  box-shadow: none;
}

/* インライン型（編集モード） — 展開後の編集テキストエリア */
.input--inline-edit {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  resize: none;
  overflow: hidden;
}

.input--inline-edit:focus {
  box-shadow: none;
}
```

#### modifier: `.input--bordered`（クイック入力型）

```css
/* クイック入力型: 存在感のあるボーダー、書き始めの起点 */
.input--bordered {
  border: 1px solid var(--color-gray-500);
  border-radius: var(--radius-xl);
  background: var(--bg-main);
}

.input--bordered:focus {
  border-color: var(--input-border-focus);
}

/* 大型入力（F-BOX パターンB） */
.input--bordered.input--large {
  min-height: 50vh;
  font-size: 16px;
  line-height: 1.8;
}
```

#### modifier: `.input--expand`（展開編集型）

```css
/* 展開→編集モードのテキストエリア */
.input--expand {
  border: 1px solid var(--primary);
  background: var(--bg-main);
  overflow: hidden;
  resize: none;
  min-height: 100px;
  line-height: 1.6;
}

.input--expand:focus {
  border-color: var(--primary-dark);
  box-shadow: var(--input-focus-ring);
}
```

#### サイズ修飾子

```css
/* 小型（時刻・数値・セレクト向け） */
.input--sm {
  padding: 8px;
  font-size: calc(14px * var(--input-font-size) / 100);
}

/* 小幅 */
.input--narrow {
  width: 80px;
  text-align: center;
}

.input--xs {
  width: 60px;
  text-align: center;
}
```

### A-3. 全クラスのBefore/After マイグレーション

---

#### 1. `.form-input` → `.input-base.input--form`

```
ファイル: css/style.css L1908-1930
Before:
.form-input {
  width: 100%;
  min-height: 44px;
  background: var(--bg-gray);
  border: none;
  border-radius: var(--radius-lg);
  padding: 12px;
  font-size: calc(18px * var(--input-font-size) / 100);
  color: var(--text-primary);
  resize: vertical;
  transition: background var(--transition-fast);
  autocomplete: off;
}

.form-input:focus {
  outline: none;
  background: #e8e8ec;
}

.form-input::placeholder {
  color: var(--text-placeholder);
}

After: 削除。`.input-base.input--form` で代替。

理由:
- ハードコード色 `#e8e8ec` → `var(--input-bg-focus)` に統一（Phase 1原則5）
- font-size 18px → 16px に統一（form-input-singleとの差をなくす）
- autocomplete: off はCSSプロパティではない（HTML属性）ため削除
```

**HTML側変更** (js/pages.js): 全ての `class="form-input"` を `class="input-base input--form"` に変更。

対象行: L1550, L1582, L1592, L1602, L1612, L1622, L1629, L1858, L1865, L1941, L1948, L1955, L2071, L2078, L2352

---

#### 2. `.form-input-single` → `.input-base.input--form`

```
ファイル: css/style.css L8384-8402
Before:
.form-input-single {
  width: 100%;
  padding: 14px;
  background: var(--bg-gray);
  border: none;
  border-radius: var(--radius-lg);
  font-size: calc(16px * var(--input-font-size) / 100);
  color: var(--text-primary);
  transition: background var(--transition-fast);
}

.form-input-single:focus {
  outline: none;
  background: #e8e8ec;
}

.form-input-single::placeholder {
  color: var(--text-placeholder);
}

After: 削除。`.input-base.input--form` で代替。

理由: .form-input と同一の振る舞い。paddingの14px→12pxは視覚的に差がない。統一する。
```

**HTML側変更** (js/pages.js): L3266, L3273 の `class="form-input-single"` → `class="input-base input--form"`

---

#### 3. `.form-input.tall` → `.input-base.input--form.input--tall`

```
ファイル: css/style.css L8405-8407
Before:
.form-input.tall {
  min-height: 200px;
}

After: 削除。`.input--tall` modifier で代替。
```

**HTML側変更** (js/pages.js): L3280 の `class="form-input tall"` → `class="input-base input--form input--tall"`

---

#### 4. `.form-input.life-textarea` → `.input-base.input--form` + インラインstyle

```
ファイル: css/style.css L1877-1882
Before:
.form-input.life-textarea {
  min-height: 182px;
  max-height: 182px;
  overflow: auto;
  resize: none;
}

After: 維持（ただし `.input--form.input--life` に改名）

理由: 人生設計カードの固定高さは展開仕様との連携があり、単純な統一ができない。
ページ固有のmodifierとして残す。

新CSS:
.input--life {
  min-height: 182px;
  max-height: 182px;
  overflow: auto;
  resize: none;
}
```

---

#### 5. `.modal-input` → `.input-base.input--modal`

```
ファイル: css/style.css L2592-2606
Before:
.modal-input {
  background: var(--bg-gray);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 15px;
  text-align: left;
  width: 100%;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: 2px solid var(--primary);
}

After: 削除。`.input-base.input--modal` で代替。

理由:
- focus時の `outline: 2px` → `box-shadow` に変更（2px outlineは視覚的に重い）
- Todoistのフォーカス表現は青アンダーラインのみ。本設計は控えめなfocus-ring
```

**HTML側変更** (js/app.js): 全ての `class="modal-input"` を `class="input-base input--modal"` に変更。

対象行（js/app.js）: L1249, L1411, L1415, L1422, L1426, L1430, L1437, L1441, L1448, L1465, L1471, L1473, L1478, L1486, L1590, L1594, L1601, L1605, L1609, L1616, L1620, L1627, L1642, L1648, L1650, L1655, L1663, L1759, L1767, L1782, L1790, L1795, L1799, L1803, L1807, L1811, L1819, L1906, L1911, L1924, L1928, L1932, L1936, L1940, L1944, L1952, L4265, L4838, L4843, L4846, L6599, L6615

---

#### 6. `.modal-input.modal-textarea` → `.input-base.input--modal.input--textarea`

```
ファイル: css/style.css L2608-2613
Before:
.modal-input.modal-textarea {
  text-align: left;
  font-size: calc(16px * var(--input-font-size) / 100);
  min-height: 200px;
  resize: vertical;
}

After: 削除。`.input--modal.input--textarea` で代替。
```

**HTML側変更** (js/app.js): L4265 の `class="modal-input modal-textarea"` → `class="input-base input--modal input--textarea"`

---

#### 7. `.modal-notes` → `.input-base.input--modal.input--notes`

```
ファイル: css/style.css L2664-2670
Before:
.modal-notes {
  width: 100%;
  resize: vertical;
  min-height: 60px;
  font-size: 14px;
  box-sizing: border-box;
}

After: 削除。`.input--modal.input--notes` で代替。
```

**HTML側変更** (js/app.js): L1486, L1663, L1819, L1952 の `modal-notes` → `input--notes` に追加

---

#### 8. `.inline-edit-input` → `.input-base.input--inline`

```
ファイル: css/style.css L3917-3927
Before:
.inline-edit-input {
  border: none;
  border-bottom: 2px solid var(--primary);
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  padding: 4px 0;
  outline: none;
  width: 120px;
  text-align: right;
}

After: 削除。`.input-base.input--inline` + width/text-align インラインstyle で代替。

理由:
- border-bottom: 2px → 1px（Phase 1原則1）
- `width: 120px` と `text-align: right` は設定ページ固有のため、inline style か追加CSSで対応
```

**HTML側変更** (js/app.js): L4498 の `input.className = 'inline-edit-input'` → `input.className = 'input-base input--inline'; input.style.width = '120px'; input.style.textAlign = 'right';`

---

#### 9. `.birthday-field` → `.input-base.input--inline` + サイズ修飾子

```
ファイル: css/style.css L3936-3955
Before:
.birthday-field {
  width: 40px;
  border: none;
  border-bottom: 2px solid var(--border);
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  padding: 4px 2px;
  text-align: center;
  outline: none;
  transition: border-color var(--transition-fast);
}

.birthday-field:focus {
  border-bottom-color: var(--primary);
}

.birthday-field#bday-year {
  width: 50px;
}

After: 削除。`.input-base.input--inline` + `.input--birthday` で代替。

理由: border-bottom: 2px → 1px（Phase 1原則1）

新CSS（ページ固有modifier）:
.input--birthday {
  width: 40px;
  text-align: center;
  padding: 4px 2px;
}
.input--birthday-year {
  width: 50px;
}
```

**HTML側変更** (js/pages.js): L2925, L2927, L2929 の `class="birthday-field"` → `class="input-base input--inline input--birthday"` / `class="input-base input--inline input--birthday input--birthday-year"`

---

#### 10. `.journal-title-edit-textarea` → `.input-base.input--inline-edit`

```
ファイル: css/style.css L5005-5015
Before:
.journal-title-edit-textarea {
  width: 100%;
  min-height: calc(14px * 1.5);
  font-size: 14px;
  line-height: 1.5;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
}

After: 削除。`.input-base.input--inline-edit` で代替。

理由: フォーカスフィードバックがゼロ。統一ベースで border-bottom: 1px を追加し、
編集状態であることを視覚的にフィードバックする。
```

**JS側変更** (js/app.js): L5701 の `class="journal-title-edit-textarea"` → `class="input-base input--inline-edit"`

---

#### 11. `.milestone-edit-textarea` → `.input-base.input--inline-edit`

```
ファイル: css/style.css L5826-5836
Before:
.milestone-edit-textarea {
  width: 100%;
  min-height: calc(14px * 1.5 * 2);
  font-size: 14px;
  line-height: 1.5;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
}

After: 削除。`.input-base.input--inline-edit` で代替。
```

**JS側変更** (js/app.js): L5531 の `class="milestone-edit-textarea"` → `class="input-base input--inline-edit"`

---

#### 12. `.goal-textarea` → `.input-base.input--inline-edit` + 固定高さ

```
ファイル: css/style.css L5883-5897
Before:
.goal-display-wrapper .goal-textarea {
  width: 100%;
  line-height: 1.5;
  height: calc(1.5em * 2 + 16px);
  box-sizing: border-box;
  resize: none;
  overflow: hidden;
  border: none;
  padding: 8px;
  background: transparent;
}

.goal-display-wrapper.expanded .goal-textarea {
  overflow: visible;
}

After: `.input-base.input--inline-edit` + ページ固有modifier `.input--age-goal` で代替。

新CSS:
.input--age-goal {
  height: calc(1.5em * 2 + 16px);
  overflow: hidden;
  padding: 8px;
}

.goal-display-wrapper.expanded .input--age-goal {
  overflow: visible;
}
```

---

#### 13. `.input-field` → `.input-base`

```
ファイル: css/style.css L2226-2241
Before:
.input-field {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  font-size: calc(14px * var(--input-font-size) / 100);
  background: var(--bg-gray);
  color: var(--text-primary);
  autocomplete: off;
}

.input-field:focus {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}

After: 削除。`.input-base` で代替（ベースクラスにflex:1を追加するか、flexレイアウト側で制御）。

理由:
- autocomplete: off はCSSプロパティではない（HTML属性）
- focus時の `outline: 2px solid` → `box-shadow` focus-ring に統一
- font-size 14px → 15px に統一（ベースクラスの値）

注意: `.input-field` が `flex: 1` を持っているのは .input-row 等の横並びレイアウト内で使われるため。
ベースクラスは `width: 100%` であり、flex コンテナ内では自然にフレックス伸縮するため問題なし。
ただし明示的に必要な場合は `.input--flex` modifier を用意する。
```

新CSS:
```css
.input--flex {
  flex: 1;
  width: auto;
}
```

**HTML側変更** (js/pages.js): 全ての `class="input-field"` を `class="input-base"` に変更（小サイズは `input--sm` 等を追加）。

対象行: L1875, L1881, L1887, L1893, L1907, L1913, L1923, L1929, L1987, L1995, L2418, L2423, L2428, L2433, L2442, L2447, L2469, L2475, L2481, L2487, L2600, L2604, L2630, L2635, L2646, L2651, L2824
(js/app.js): L6422, L6427, L6432, L6437, L6442, L6447, L6451

---

#### 14. `.eval-textarea` → (ベースに統合)

```
ファイル: css/style.css L5707-5710
Before:
.eval-textarea {
  min-height: 50px;
  resize: vertical;
}

After: 維持（独立modifierとして）。ベースのtextareaは既にresize: verticalを持つため、min-heightのみの指定。

新CSS:
.input--eval {
  min-height: 50px;
}
```

---

#### 15. `.routine-edit-form .input-field` → `.input-base`（ボーダー上書き削除）

```
ファイル: css/style.css L5618-5626
Before:
.routine-edit-form textarea.input-field {
  width: 100%;
  min-height: 80px;
  resize: vertical;
}

.routine-edit-form .input-field {
  border: 2px solid #888;
}

After: 削除。

理由:
- `border: 2px solid #888` → ベースクラスの `1px solid var(--input-border)` で統一（Phase 1原則1, 原則5）
- textareaの width/min-height/resize はベースクラスに含まれる
```

---

#### 16-17. `.material-add-input` / `.material-add-textarea` → `.input-base`

```
ファイル: css/style.css L10140-10173
Before:
.material-add-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #999;
  border-radius: var(--radius-lg);
  font-size: 16px;
  color: #333;
  background: #fff;
  box-sizing: border-box;
}

.material-add-input:focus {
  outline: none;
  border-color: #667eea;
}

.material-add-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #999;
  border-radius: var(--radius-lg);
  font-size: 15px;
  color: #333;
  background: #fff;
  box-sizing: border-box;
  min-height: 180px;
  resize: vertical;
  line-height: 1.7;
}

.material-add-textarea:focus {
  outline: none;
  border-color: #667eea;
}

After: 両方削除。`.input-base` で代替。テキストエリアは `.input-base` + min-height inline style。

理由:
- ハードコード色 #999, #333, #fff, #667eea → CSS変数に統一（Phase 1原則5）
- ボーダー、背景、フォーカス表現が全てベースクラスでカバーされる
```

**HTML側変更** (js/pages.js): L1024 `class="material-add-input"` → `class="input-base"`, L1025 `class="material-add-textarea"` → `class="input-base"` + `style="min-height:180px"`

ダークモード:
```
ファイル: css/style.css L10268-10278
Before:
.dark-mode .material-add-input {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

.dark-mode .material-add-textarea {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

After: 削除。ベースクラスのダークモードトークンで自動対応。
```

---

#### 18. `.firstbox-textarea` → `.input-base.input--bordered`

```
ファイル: css/style.css L8713-8728
Before:
.firstbox-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  font-size: 16px;
  line-height: 1.6;
  border: 2px solid #999;
  border-radius: var(--radius-xl);
  resize: vertical;
  font-family: inherit;
}

.firstbox-textarea:focus {
  outline: none;
  border-color: var(--primary, #667eea);
}

After: 削除。`.input-base.input--bordered` + `style="min-height:100px"` で代替。

理由:
- border: 2px → 1px（Phase 1原則1）
- ハードコード色 #999 → `var(--color-gray-500)` → `.input--bordered` で統一
```

**HTML側変更** (js/pages.js): L1052, L1087, L1113, L1123 の `class="firstbox-textarea"` → `class="input-base input--bordered"` + `style="min-height:100px"`

---

#### 19-20. `.fbox-quick-input` / `.fbox-quick-input-large` → `.input-base.input--bordered`

```
ファイル: css/style.css L8924-8968
Before:
.fbox-quick-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #999;
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.fbox-quick-input:focus {
  outline: none;
  border-color: var(--primary, #667eea);
}

.fbox-quick-input-large {
  min-height: 50vh;
  font-size: 16px;
  line-height: 1.8;
}

After: 削除。`.input-base.input--bordered` + `.input--large` で代替。

理由:
- border: 2px → 1px（Phase 1原則1）
- ハードコード色 #999 → CSS変数（Phase 1原則5）
- transition: 0.2s → var(--transition-fast)（Phase 2操作動き）
```

**HTML側変更** (js/pages.js): L516, L1334 の `class="fbox-quick-input"` → `class="input-base input--bordered"`, L1353 の `class="fbox-quick-input fbox-quick-input-large"` → `class="input-base input--bordered input--large"`

---

#### 21. `.ai-textarea` → `.input-base`

```
ファイル: css/style.css L8560-8574
Before:
.ai-textarea {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  line-height: 1.5;
  border: 1px solid #999;
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: inherit;
}

.ai-textarea:focus {
  outline: none;
  border-color: #0ea5e9;
}

After: 削除。`.input-base` で代替。

理由: ハードコード色 #999, #0ea5e9 → CSS変数（Phase 1原則5）。ベースクラスで十分カバー。
```

**HTML側変更** (js/app.js): L7062 の `class="ai-textarea"` → `class="input-base"`

---

#### 22. `.expand-edit-textarea` → `.input-base.input--expand`

```
ファイル: css/style.css L1818-1834
Before:
.expand-edit-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid var(--primary);
  border-radius: var(--radius-md);
  font-size: calc(15px * var(--input-font-size) / 100);
  line-height: 1.6;
  resize: none;
  background: #fff;
  overflow: hidden;
}

.expand-edit-textarea:focus {
  outline: none;
  border-color: var(--primary-dark);
}

After: 削除。`.input-base.input--expand` で代替。

理由:
- border: 2px → 1px（Phase 1原則1）
- background: #fff → var(--bg-main)（Phase 1原則5）
```

**JS側変更** (js/app.js): L5313, L5429 の `class="expand-edit-textarea"` → `class="input-base input--expand"`

---

#### 23. `.schedule-time-input` → `.input-base.input--sm.input--narrow`

```
ファイル: css/style.css L6035-6048（月次スケジュール）
Before:
.schedule-time-input {
  width: 85px;
  padding: 8px;
  font-size: 15px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  text-align: center;
  background: var(--bg-gray);
}

.schedule-time-input:focus {
  outline: none;
  border-color: var(--primary);
}

ファイル: css/style.css L7677-7687（スケジュールエントリー）
Before:
.schedule-time-input {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.schedule-time-input:focus {
  outline: none;
  border-color: var(--primary);
}

After: 両方削除。`.input-base.input--sm` + width/text-align で代替。
2箇所の重複定義（border-widthが2pxと1pxで異なる）を1箇所に統合。

理由:
- 重複定義の解消
- border: 2px → 1px（Phase 1原則1）
```

---

#### 24. `.cycle-input` → `.input-base.input--sm.input--narrow`

```
ファイル: css/style.css L7868-7874
Before:
.cycle-input {
  width: 80px;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

After: 削除。`.input-base.input--sm.input--narrow` で代替。
```

---

#### 25. `.rv-day-memo-input` → `.input-base.input--sm`

```
ファイル: css/style.css L4434-4443
Before:
.rv-day-memo-input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: var(--radius-md);
  padding: 8px;
  font-size: 13px;
  resize: vertical;
  min-height: 40px;
  font-family: inherit;
  box-sizing: border-box;
}

After: 削除。`.input-base.input--sm` + min-height style で代替。

理由: ハードコード色 #ccc → var(--input-border)（Phase 1原則5）

ダークモード:
ファイル: css/style.css L10960
Before: .dark-mode .rv-day-memo-input { background: #222; border-color: #444; color: #ddd; }
After: 削除。ベースクラスのダークモードトークンで自動対応。
```

---

#### 26. `.inline-input-field` → `.input-base.input--sm`

```
ファイル: css/style.css L2811-2818
Before:
.inline-input-field {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
}

After: 削除。`.input-base.input--sm` + flex/min-width はレイアウト側で制御。

理由: border: 2px → 1px（Phase 1原則1）
```

---

#### 27. `.toast-input-field` → `.input-base.input--sm`

```
ファイル: css/style.css L2873-2879
Before:
.toast-input-field {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
}

After: 削除。`.input-base.input--sm` + flex はレイアウト側で制御。

理由: border: 2px → 1px（Phase 1原則1）
```

---

#### 28. `.modal-memo-input` → `.input-base`

```
ファイル: css/style.css L2893-2904
Before:
.modal-memo-input {
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--bg-main);
}

.modal-memo-input:focus {
  outline: none;
  border-color: var(--primary);
}

After: 削除。`.input-base` で代替。

理由: border: 2px → 1px（Phase 1原則1）
```

---

#### 29. `.favorite-add-input` → `.input-base.input--sm`

```
ファイル: css/style.css L2990-2996
Before:
.favorite-add-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

After: 削除。`.input-base.input--sm` + flex で代替。
```

---

#### レスポンシブ対応

```
ファイル: css/style.css L6272-6275（@media min-width: 600px内）
Before:
  .form-input {
    font-size: 16px;
    padding: 14px;
  }

After:
  .input--form {
    font-size: 16px;
    padding: 14px;
  }

理由: クラス名の変更に伴う参照更新。
```

### A-4. 削除されるCSS行数サマリー

| 旧クラス | 削除行数 | 新クラスでの対応 |
|---------|---------|---------------|
| `.form-input` 系 | ~23行 | `.input-base.input--form` |
| `.form-input-single` 系 | ~17行 | `.input-base.input--form` |
| `.modal-input` 系 | ~22行 | `.input-base.input--modal` |
| `.modal-notes` | ~7行 | `.input--notes` modifier |
| `.input-field` 系 | ~16行 | `.input-base` |
| `.inline-edit-input` | ~11行 | `.input--inline` |
| `.birthday-field` 系 | ~20行 | `.input--inline.input--birthday` |
| `.journal-title-edit-textarea` | ~11行 | `.input--inline-edit` |
| `.milestone-edit-textarea` | ~11行 | `.input--inline-edit` |
| `.goal-textarea` | ~15行 | `.input--inline-edit.input--age-goal` |
| `.expand-edit-textarea` 系 | ~17行 | `.input--expand` |
| `.firstbox-textarea` 系 | ~16行 | `.input--bordered` |
| `.fbox-quick-input` 系 | ~19行 | `.input--bordered` |
| `.ai-textarea` 系 | ~15行 | `.input-base` |
| `.schedule-time-input` (2箇所) | ~18行 | `.input--sm.input--narrow` |
| `.cycle-input` | ~7行 | `.input--sm.input--narrow` |
| `.rv-day-memo-input` | ~10行 | `.input--sm` |
| `.inline-input-field` | ~8行 | `.input--sm` |
| `.toast-input-field` | ~7行 | `.input--sm` |
| `.modal-memo-input` 系 | ~12行 | `.input-base` |
| `.favorite-add-input` | ~7行 | `.input--sm` |
| `.material-add-input/textarea` + dark | ~32行 | `.input-base` |
| `.routine-edit-form .input-field` | ~7行 | (削除) |
| `.eval-textarea` | ~4行 | `.input--eval` |
| **合計削除** | **約373行** | |
| **新規追加** | **約120行** | |
| **純減** | **約253行** | |

---

## B. テキスト入力UXの改善

### B-1. フォーカス時の視覚フィードバック統一

#### 現状の5パターン

| パターン | 現在の挙動 | 使用箇所 | 問題 |
|----------|----------|---------|------|
| A: outline 2px blue | `outline: 2px solid var(--primary)` | `.modal-input`, `.input-field` | 太いoutlineが目立ちすぎる |
| B: border-color変化 | `border-color: var(--primary)` | `.firstbox-textarea`, `.fbox-quick-input`, `.schedule-time-input`, `.modal-memo-input` | 控えめで良い |
| C: background変化 | `background: #e8e8ec` | `.form-input`, `.form-input-single` | ハードコード色。変化が微妙 |
| D: outline消しのみ | `outline: none` (他のフィードバックなし) | `.expand-edit-textarea` (border-color変化はある) | 十分 |
| E: フィードバックなし | border/outline/background 全て不変 | `.journal-title-edit-textarea`, `.milestone-edit-textarea` | 編集中であることが分からない |

#### 統一後の仕様

```
統一フォーカス表現:
  1. outline: none（ブラウザデフォルト消去）
  2. border-color: var(--input-border-focus) = var(--primary)
  3. box-shadow: var(--input-focus-ring) = 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)

例外:
  - .input--form: border なしのため、background: var(--input-bg-focus) に変化。box-shadow なし。
  - .input--inline: border-bottom のみのため、border-bottom-color 変化。box-shadow なし。
  - .input--inline-edit: ボーダーなしのため、薄い border-bottom: 1px solid var(--primary) を追加。
```

**参照アプリ比較**:
- Todoist: フォーカスでborder-bottom-colorが青に。シンプルで分かりやすい
- Notion: フォーカスで何も変わらない。カーソル点滅のみ
- Apple Reminders: フォーカスで行全体が薄い青背景に

本設計はTodoist方式に近い「border-color変化 + 薄いfocus-ring」を採用。Notionのようにフォーカスフィードバックなしは、目標管理アプリではユーザーが「今どこに入力しているか」を見失うリスクがあるため不採用。

### B-2. placeholder色の統一

#### 現状

```
パターン1: color: var(--text-placeholder)  → .form-input, .form-input-single
パターン2: 未指定（ブラウザデフォルト）      → .modal-input, .input-field, .firstbox-textarea,
                                              .fbox-quick-input, .ai-textarea, その他全て
```

ブラウザデフォルトのplaceholder色は `rgba(0,0,0,0.5)` 前後で、`var(--text-placeholder)` (#aaa) より暗い。

#### 統一後の仕様

```
ファイル: css/style.css（ベースクラス内）
Before: 各クラスで個別指定 or 未指定
After:
.input-base::placeholder {
  color: var(--input-placeholder);    /* = var(--text-placeholder) = #aaa */
}

理由: 全入力フィールドで統一されたplaceholder色。ダークモードでもvar経由で自動対応。
```

### B-3. テキストエリア自動伸長の共通関数化

#### 現状（Phase 2操作動きチームと共有）

同一パターンが8箇所にコピペ:

```javascript
// パターンA: 基本（6箇所）
textarea.style.height = 'auto';
textarea.style.height = textarea.scrollHeight + 'px';

// パターンB: 最小高さ付き（4箇所）
textarea.style.height = 'auto';
textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
```

使用箇所:

| 箇所 | app.js行 | minHeight | 用途 |
|------|---------|-----------|------|
| expandAgeGoal | L4335-4336 | 0 | 年齢別目標の展開 |
| expandHomeCard (初期) | L5331-5332 | 0 | ホームカード展開（初期高さ） |
| expandHomeCard (input) | L5335-5336 | 0 | ホームカード展開（入力時） |
| expandLongtermCard (初期) | L5444-5445 | 0 | 長期目標カード展開 |
| expandLongtermCard (input) | L5448-5449 | 0 | 長期目標カード展開（入力時） |
| expandMilestone (初期) | L5546-5547 | 42 | 逆算目標展開 |
| expandMilestone (input) | L5550-5551 | 42 | 逆算目標展開（入力時） |
| expandJournalTitle (初期) | L5716-5717 | 42 | 日誌タイトル展開 |
| expandJournalTitle (input) | L5720-5721 | 42 | 日誌タイトル展開（入力時） |

#### 統一設計

```
ファイル: js/app.js（メソッドとして追加）
Before: 8箇所のコピペ

After:
  /**
   * テキストエリアの高さを内容に合わせて自動調整
   * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
   * @param {number} minHeight - 最小高さ（px）。0の場合はscrollHeightのまま
   */
  autoResizeTextarea(textarea, minHeight = 0) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + 'px';
  },

  /**
   * テキストエリアにinputイベントで自動伸長を設定し、初期高さも調整する
   * @param {HTMLTextAreaElement} textarea - 対象のテキストエリア
   * @param {number} minHeight - 最小高さ（px）
   */
  setupAutoResize(textarea, minHeight = 0) {
    if (!textarea) return;
    this.autoResizeTextarea(textarea, minHeight);
    textarea.addEventListener('input', () => {
      this.autoResizeTextarea(textarea, minHeight);
    });
  },

理由:
1. DRY原則。9重コピペの排除
2. minHeightパラメータで42px固定値にも対応
3. Todoistの autosize と同等の機能
```

呼び出し側の変更:

```
ファイル: js/app.js L5329-5337 (expandHomeCard内)
Before:
    const textarea = document.getElementById(`${target}-card-edit-${field}`);
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.focus();
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    }

After:
    const textarea = document.getElementById(`${target}-card-edit-${field}`);
    if (textarea) {
      this.setupAutoResize(textarea);
      textarea.focus();
    }
理由: 6行 → 2行に削減。
```

```
ファイル: js/app.js L5442-5451 (expandLongtermCard内)
Before:
    const textarea = document.getElementById('longterm-card-edit-goal');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      textarea.focus();
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    }

After:
    const textarea = document.getElementById('longterm-card-edit-goal');
    if (textarea) {
      this.setupAutoResize(textarea);
      textarea.focus();
    }
```

```
ファイル: js/app.js L5544-5553 (expandMilestone内)
Before:
    const textarea = document.getElementById(`milestone-edit-${index}`);
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
      textarea.focus();
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
      });
    }

After:
    const textarea = document.getElementById(`milestone-edit-${index}`);
    if (textarea) {
      this.setupAutoResize(textarea, 42);
      textarea.focus();
    }
```

```
ファイル: js/app.js L5714-5723 (expandJournalTitle内)
Before:
    const textarea = document.getElementById(`journal-title-edit-${index}`);
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
      textarea.focus();
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
      });
    }

After:
    const textarea = document.getElementById(`journal-title-edit-${index}`);
    if (textarea) {
      this.setupAutoResize(textarea, 42);
      textarea.focus();
    }
```

```
ファイル: js/app.js L4333-4336 (expandAgeGoal内)
Before:
    wrapper.classList.add('expanded');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.readOnly = true;

After:
    wrapper.classList.add('expanded');
    this.autoResizeTextarea(textarea);
    textarea.readOnly = true;
```

### B-4. 入力中のスワイプ誤爆防止の評価

#### 現状の実装

```
ファイル: js/app.js L2758-2791
Before:
    const tag = e.target.tagName;
    const isInputField = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
    ...
    this.swipe = { ..., isInputField: isInputField };
    ...
    if (this.swipe.isInputField) {
      // 横方向が縦の2倍以上の場合のみスワイプ
      this.swipe.direction = (Math.abs(deltaX) > Math.abs(deltaY) * 2) ? 'h' : 'v';
    }
```

#### 評価

| 観点 | 評価 | 補足 |
|------|------|------|
| **閾値の妥当性** | 適切 | 2倍閾値は「明確な横スワイプ意図」を要求する妥当な値。Todoistは入力フィールドでスワイプ自体を無効にするが、本アプリはページ遷移にスワイプを多用するため完全無効は不適切 |
| **対象要素の網羅性** | 適切 | INPUT, TEXTAREA, SELECT の3要素で十分。contentEditableは未使用 |
| **2倍閾値でも誤発動するケース** | 低リスク | テキスト選択（長押し→ドラッグ）中の誤発動は、ブラウザがtouchイベントを消費するため問題なし |

**結論**: 現状の2倍閾値ロジックは十分。変更不要。

**提案（軽微）**: 閾値定数をPhase 2操作動きチームの `SWIPE_THRESHOLD` 系定数と合わせて定義する。

```
ファイル: js/app.js（定数定義、Phase 2と共通）
After:
const INPUT_SWIPE_RATIO = 2;  // 入力フィールド上でのスワイプ認識比率（横/縦）

理由: マジックナンバー排除。Phase 2のスワイプ定数と合わせて管理。
```

---

## C. 展開/省略表示の統一

### C-1. 現状の checkOverflow 実装の分析

`js/app.js` L582-706 の `checkOverflow()` メソッドに9箇所のオーバーフローチェックが**全て手書きでコピペ**されている。

| # | 対象要素 | content セレクタ | more セレクタ | 展開関数 |
|---|---------|-----------------|--------------|---------|
| 1 | ホーム長期目標タイトル | `#home-card-longterm .goal-title` | `#home-card-longterm .goal-more` | `expandHomeCard('longterm')` |
| 2 | ホーム月次目標詳細 | `.progress-detail` | `.progress-more` | `expandHomeCard('monthly')` |
| 3 | 長期目標記入ページ | `#longterm-card-goal .goal-title` | `#longterm-card-goal .goal-more` | `expandLongtermCard()` |
| 4 | 逆算目標（複数） | `.milestone-goal-content` | `.milestone-goal-more` | `expandMilestone(index)` |
| 5 | 長期目標一覧（複数） | `.list-goal-content` | `.list-goal-more` | `expandLongtermListItem(index, goalId)` |
| 6 | 日誌一覧（複数） | `.journal-list-title-content` | `.journal-list-title-more` | `expandJournalListItem(index, date)` |
| 7 | 人生設計 最上位目的 | `#life-card-purpose .life-card-content` | `#life-card-purpose .life-card-more` | `expandLifeCard('purpose')` |
| 8 | 人生設計 意味 | `#life-card-meaning .life-card-content` | `#life-card-meaning .life-card-more` | `expandLifeCard('meaning')` |
| 9 | 年齢別目標（複数） | `.goal-textarea` (in `.goal-display-wrapper`) | `.goal-more` (in wrapper) | `expandAgeGoal(index)` |

#### 共通パターン（全9箇所で同一）

```javascript
if (content.scrollHeight > content.clientHeight) {
  more.innerHTML = '続きを見る ▼';
  more.onclick = (e) => { e.stopPropagation(); expandFunction(); };
} else {
  more.innerHTML = '';
}
```

### C-2. 共通化設計

#### 共通オーバーフローチェック関数

```
ファイル: js/app.js（メソッドとして追加）
Before: 9箇所のコピペ（合計約120行）

After:
  /**
   * テキストのオーバーフローをチェックし、「続きを見る」を表示する
   * @param {HTMLElement} content - 省略対象のテキストコンテンツ要素
   * @param {HTMLElement} more - 「続きを見る」を表示するリンク要素
   * @param {Function} expandFn - 展開時のコールバック関数
   */
  checkElementOverflow(content, more, expandFn) {
    if (!content || !more) return;
    if (content.scrollHeight > content.clientHeight) {
      more.innerHTML = '続きを見る ▼';
      more.onclick = (e) => { e.stopPropagation(); expandFn(); };
    } else {
      more.innerHTML = '';
    }
  },

理由:
1. DRY原則。9重コピペの排除
2. scrollHeight > clientHeight の検出パターンを1箇所に集約
3. テスト可能性の向上（1関数をテストすれば全箇所をカバー）
```

#### checkOverflow() のリファクタリング

```
ファイル: js/app.js L582-706
Before: （約120行のコピペの塊）

After:
  checkOverflow() {
    // ホーム画面の長期目標
    this.checkElementOverflow(
      document.querySelector('#home-card-longterm .goal-title'),
      document.querySelector('#home-card-longterm .goal-more'),
      () => this.expandHomeCard('longterm')
    );

    // ホーム画面の月次目標
    this.checkElementOverflow(
      document.querySelector('.progress-detail'),
      document.querySelector('.progress-more'),
      () => this.expandHomeCard('monthly')
    );

    // 長期目標記入ページ
    this.checkElementOverflow(
      document.querySelector('#longterm-card-goal .goal-title'),
      document.querySelector('#longterm-card-goal .goal-more'),
      () => this.expandLongtermCard()
    );

    // 逆算目標（複数）
    document.querySelectorAll('.milestone-goal-wrapper').forEach((wrapper, index) => {
      this.checkElementOverflow(
        wrapper.querySelector('.milestone-goal-content'),
        wrapper.querySelector('.milestone-goal-more'),
        () => this.expandMilestone(index)
      );
    });

    // 長期目標一覧（複数）
    document.querySelectorAll('.longterm-list-item .list-goal-wrapper').forEach((wrapper, index) => {
      if (wrapper.classList.contains('expanded')) return;
      const goalId = wrapper.closest('.longterm-list-item')?.dataset?.goalId;
      if (!goalId) return;
      this.checkElementOverflow(
        wrapper.querySelector('.list-goal-content'),
        wrapper.querySelector('.list-goal-more'),
        () => this.expandLongtermListItem(index, parseInt(goalId))
      );
    });

    // 日誌一覧（複数）
    document.querySelectorAll('.journal-list-item .journal-list-title-wrapper').forEach((wrapper, index) => {
      if (wrapper.classList.contains('expanded')) return;
      const journalDate = wrapper.closest('.journal-list-item')?.dataset?.journalDate;
      if (!journalDate) return;
      this.checkElementOverflow(
        wrapper.querySelector('.journal-list-title-content'),
        wrapper.querySelector('.journal-list-title-more'),
        () => this.expandJournalListItem(index, journalDate)
      );
    });

    // 人生設計 最上位目的
    this.checkElementOverflow(
      document.querySelector('#life-card-purpose .life-card-content'),
      document.querySelector('#life-card-purpose .life-card-more'),
      () => this.expandLifeCard('purpose')
    );

    // 人生設計 意味
    this.checkElementOverflow(
      document.querySelector('#life-card-meaning .life-card-content'),
      document.querySelector('#life-card-meaning .life-card-more'),
      () => this.expandLifeCard('meaning')
    );

    // 年齢別目標（複数）
    document.querySelectorAll('.goal-display-wrapper').forEach((wrapper, index) => {
      const textarea = wrapper.querySelector('.goal-textarea');
      const more = wrapper.querySelector('.goal-more');
      this.checkElementOverflow(textarea, more, () => this.expandAgeGoal(index));
    });
  },

行数: 約120行 → 約55行（約54%削減）
```

### C-3. 3段階フロー（CLAUDE.md展開仕様）の全入力箇所での統一確認

CLAUDE.mdの展開仕様:
1. **通常表示（省略）**: `overflow: hidden` + max-height制限
2. **展開表示（閲覧モード）**: max-height解除、全文表示
3. **編集モード**: テキストエリアに変換、入力可能

| 箇所 | 段階1（省略） | 段階2（展開） | 段階3（編集） | 仕様準拠 |
|------|-------------|-------------|-------------|---------|
| ホーム長期目標 | `max-height: 113px` | `max-height: none` | `.expand-edit-textarea` | 準拠 |
| ホーム月次目標 | `max-height: 113px` | `max-height: none` | `.expand-edit-textarea` | 準拠 |
| 長期目標記入 | `max-height: 113px` | `max-height: none` | `.expand-edit-textarea` | 準拠 |
| 逆算目標 | `max-height: 42px` (2行) | `max-height: none` | `.milestone-edit-textarea` | 準拠 |
| 長期目標一覧 | `max-height` 制限あり | `max-height: none` | (遷移先で編集) | 準拠 |
| 日誌一覧 | `max-height` 制限あり | `max-height: none` | (遷移先で編集) | 準拠 |
| 人生設計 | `max-height: 158px` | `max-height: none` | `.form-input.life-textarea` | 準拠 |
| 年齢別目標 | `height: 2行分` | `overflow: visible` | (textareaが直接編集) | 2段階のみ（段階2=段階3）|

**年齢別目標は例外**: textareaが常に表示されており、展開=readOnly解除。3段階ではなく2段階で動作。これはUIとして適切（年齢別目標は短いテキストが多い）。

### C-4. 統一後の展開/省略CSS

展開仕様のCSS側も統一する。

```css
/* === 展開/省略表示 統一 === */

/* 省略コンテンツの共通構造 */
.overflow-container {
  overflow: hidden;
  position: relative;
}

/* 「続きを見る」リンク */
.overflow-more {
  font-size: 12px;
  color: var(--primary);
  text-align: right;
  cursor: pointer;
  padding-top: 4px;
}

/* 展開状態 */
.overflow-container.expanded {
  overflow: visible;
  max-height: none !important;
}
```

この統一CSSは既存の `.goal-more`, `.progress-more`, `.life-card-more`, `.milestone-goal-more`, `.list-goal-more`, `.journal-list-title-more` を置き換えるものではなく、将来の新規追加時に使えるパターンとして定義する。既存のクラス名は維持し、スタイルのみ統一する。

---

## 実装順序の提案

| 順序 | タスク | 影響範囲 | 理由 |
|------|--------|---------|------|
| 1 | **CSS変数定義の追加** (--input-bg等) | css/style.css :root内 | 他の変更の前提。影響なし |
| 2 | **`.input-base` + modifier CSSの追加** | css/style.css 新規セクション | 旧クラスと並行して存在可能 |
| 3 | **autoResizeTextarea / setupAutoResize 関数の追加** | js/app.js メソッド追加 | 旧パターンと並行して存在可能 |
| 4 | **checkElementOverflow 関数の追加** | js/app.js メソッド追加 | 旧パターンと並行して存在可能 |
| 5 | **HTMLクラス名の置換** (pages.js / app.js) | 全テキスト入力箇所 | 新CSSが必要（Step 2完了後） |
| 6 | **旧CSSクラスの削除** | css/style.css | Step 5完了後に安全に削除可能 |
| 7 | **checkOverflow のリファクタリング** | js/app.js L582-706 | Step 4完了後 |
| 8 | **autoResizeパターンの置換** | js/app.js 8箇所 | Step 3完了後 |

各Stepの後にQAサイクルで動作確認。

---

## 変更件数サマリー

| カテゴリ | 件数 |
|---------|------|
| CSS: 旧テキスト入力クラス削除 | 29クラス（約373行削除） |
| CSS: 新ベース+modifier追加 | 約120行追加 |
| CSS: テキスト入力トークン変数追加 | 10変数 |
| JS: HTML側クラス名変更 (pages.js) | 約75箇所 |
| JS: HTML側クラス名変更 (app.js) | 約60箇所 |
| JS: autoResizeTextarea 共通化 | 新規2メソッド + 9箇所の呼び出し変更 |
| JS: checkElementOverflow 共通化 | 新規1メソッド + checkOverflow 120行→55行 |
| JS: スワイプ閾値定数化 | 1定数追加 |
| CSS: ダークモード個別指定の削除 | 3箇所（material系 + rv-day-memo） |
| **CSS純減** | **約253行** |
| **JS純減** | **約90行**（コピペ削除分） |

> 作業状況: 完了
