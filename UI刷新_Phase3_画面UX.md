# UI刷新 Phase 3: 画面UXチーム（レイアウト＋空状態＋データ可視化＋ナビゲーション）

> 作業状況: 設計中...

---

## 参照アプリとの比較

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **レイアウト** | 7種のレイアウトパターンが混在。padding/gap/余白に統一基準なし | Header(48px)+Content+TabBar。padding 16px統一。セクション間gap 8px | サイドバー+メイン。コンテンツはブロック単位で積み上げ。余白は8pxグリッド | Header+Content+TabBar。セクション間16px。余白は8の倍数 |
| **空状態** | 8種のCSSクラスが散在。icon有無・色・padding全てバラバラ | 全ページ共通: 中央にイラスト(SVG)+説明文+アクションボタン。薄いグレー配色 | ページ種別ごとのイラスト+「○○を追加」ボタン。ミニマルなSVG | SF Symbolアイコン+説明テキスト。アクションリンクなし。非常にシンプル |
| **データ可視化** | プログレスバー(3箇所), SVG円(1箇所), レーダーチャート(1箇所), 折れ線プレースホルダ(2箇所), カレンダーヒートマップ(1箇所) | プログレスバーのみ（カルマシステム）。極めてシンプル | プログレスバー、簡易チャート。データベースビューにグラフ機能あり | 達成率の円グラフ(Habit系)。基本的にリスト表示のみ |
| **ナビゲーション** | 5タブ+サブタブ(4+6+5+3)+スワイプグループ3系統。合計30+ページ | 5タブ(受信トレイ/今日/近日/フィルタ/検索)。深度は最大2階層 | サイドバーツリー。深度無制限だがフラットに見せる設計 | タブバー(4タブ)+リスト→詳細の2階層。スワイプで戻る |

---

## A. レイアウト標準化

### A-1. 現状のレイアウトパターン分類

コードベースから検出した全レイアウトパターンを7種に分類する。

#### パターン1: Header + Content + NavBar（標準型）
使用ページ（20+ページ）: home, gtd, goal-list, review, settings, routine-list, task-list, material-list, journal-list, monthly-list, longterm-list, manual-list, calendar, schedule-entry, 各詳細・編集ページ

```
┌──────────────┐
│   Header 48px │ ← .header (style.css L603-613)
├──────────────┤
│              │
│   Content    │ ← .content (style.css L652-660)
│   flex: 1    │    padding: 16px, gap: 16px
│   scroll     │
│              │
├──────────────┤
│  NavBar      │ ← .nav-bar (style.css L1367-1376)
└──────────────┘
```

**現状のCSS** (`css/style.css` L603-660, L1367-1376):
```css
/* L603 */ .header { height: 48px; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; background: var(--header-bg); border-bottom: 2px solid var(--border); }
/* L652 */ .content { padding: 16px; display: flex; flex-direction: column; gap: 16px; flex: 1; overflow-y: auto; }
/* L1367 */ .nav-bar { background: var(--nav-bg); border-top: 2px solid var(--border); display: flex; justify-content: space-around; padding: 6px 0 max(10px, env(safe-area-inset-bottom)); }
```

**問題点**:
- `.header` の `border-bottom: 2px` → Phase 1で1pxに統一予定だが、NavBarも同様に `border-top: 2px` が残存
- `.content` の `padding: 16px` は統一されているが、一部ページで個別上書きあり
- ホーム画面のみ `.home-content` で異なるpadding構造

#### パターン2: Header + TabBar + Content + NavBar（タブ付き型）
使用ページ: gtd (4タブ), task-list (6タブ), routine-list (5タブ), review (3タブ)

```
┌──────────────┐
│   Header 48px │
├──────────────┤
│  TabBar      │ ← .gtd-tab-bar / .task-tab-bar / .routine-tab-bar / .rv-tabs
├──────────────┤
│              │
│   Content    │
│   scroll     │
│              │
├──────────────┤
│  NavBar      │
└──────────────┘
```

**現状の問題**: タブバーのクラス名が4種類別々（`gtd-tab-bar`, `task-tab-bar`, `routine-tab-bar`, `rv-tabs`）。Phase 2で `.tab-bar` + `.tab-item` に統一予定。

#### パターン3: Header + SwipeNav + Content + NavBar（スワイプ型）
使用ページ: journal/journal-supplement (2P), monthly (8P), life (2P)

```
┌──────────────┐
│   Header 48px │
├──────────────┤
│ ← SwipeNav → │ ← .swipe-nav (pages.js L120-144)
├──────────────┤
│              │
│   Content    │ ← padding-top: 60px追加 (style.css L663-665)
│   scroll     │
│              │
├──────────────┤
│  NavBar      │
└──────────────┘
```

**現状のCSS** (`css/style.css` L663-665):
```css
.content:has(.swipe-nav) { padding-top: 60px; }
```

**問題点**: SwipeNavが `.content` 内部にあるため `:has()` で上部余白を追加する必要がある。本来はヘッダーとコンテンツの間に固定配置すべき。

#### パターン4: Header + Content（ナビなし詳細型）
使用ページ: material-view, longterm（編集時）

```
┌──────────────┐
│   Header 48px │ ← showBack: true
├──────────────┤
│              │
│   Content    │
│   full       │
│              │
└──────────────┘
```

NavBarを表示しないページ。戻るボタンのみで遷移。

#### パターン5: Wizard（F・BOXフロー型）
使用ページ: firstbox (振り分けフロー)

```
┌──────────────┐
│   Header 48px │
├──────────────┤
│  質問テキスト │ ← .firstbox-step
│              │
│  選択ボタン   │ ← .firstbox-choice-btn
│              │
└──────────────┘
```

**JS参照** (`js/pages.js` L1043-1284): `renderFirstBoxFlow()` がstepに応じて質問→選択を出し分け。input → q1 → q2 → ... → 振り分け完了の線形フロー。

#### パターン6: 2カラム（ノートビュー型）
使用ページ: note-view, routine-note-view

```
┌──────────────┐
│   Header 48px │
├──────┬───────┤
│Today │Organize│ ← 左右2分割
│      │       │
│tasks │sorted  │
│      │       │
└──────┴───────┘
```

**JS参照** (`js/noteview.js` L1-100): Notion風の2カラムビュー。タスクを「今日」と「整理」に分けて表示。

#### パターン7: FixedBottom型（ホーム下部ボタン）
使用ページ: home, firstbox-list（パターンB）

```
┌──────────────┐
│   Header 48px │
├──────────────┤
│              │
│   Content    │
│   scroll     │
│              │
├──────────────┤
│ FixedBottom  │ ← .home-fixed-bottom / .fbox-bottom-buttons
├──────────────┤
│  NavBar      │
└──────────────┘
```

**JS参照** (`js/pages.js` L408-410): ホーム画面の日誌・F・BOXボタン。
**JS参照** (`js/pages.js` L1356-1359): F・BOXパターンBの下部固定ボタン。

### A-2. レイアウト統一設計

#### 共通レイアウトシェル

全ページに適用するレイアウトの共通構造を定義する。

**After** (`css/style.css` に追加):
```css
/* === レイアウトシェル === */
.page-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-shell > .header {
  flex-shrink: 0;
}

.page-shell > .content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.page-shell > .nav-bar {
  flex-shrink: 0;
}
```

現在、各render関数が返すHTMLはルート要素なしでヘッダー・コンテンツ・ナビバーを並べている。`#app` コンテナに `display: flex; flex-direction: column; height: 100vh;` が設定されている前提で動作しているため、明示的な `.page-shell` ラッパーは任意（将来の拡張用）。

#### padding / gap の8pxグリッド統一

**Before** (現状のばらつき):
```
.content            → padding: 16px; gap: 16px   ← 基準値（変更不要）
.fbox-empty         → padding: 40px 20px          ← 20pxは8の倍数でない
.task-empty          → padding: 40px 20px          ← 同上
.routine-empty       → padding: 24px 20px          ← 同上
.material-empty      → padding: 40px 20px          ← 同上
.widget-empty        → padding: 30px 16px          ← 30pxは8の倍数でない
```

**After** (8pxグリッド準拠):
```
.content            → padding: 16px; gap: 16px    ← 変更なし
空状態（統一後）      → padding: 40px 16px          ← 水平は16px、垂直は40px(8*5)
.widget-empty        → padding: 32px 16px          ← 30→32px(8*4)
```

#### border-width統一（Phase 1連携）

**Before** (`css/style.css` L612, L1370):
```css
.header { border-bottom: 2px solid var(--border); }
.nav-bar { border-top: 2px solid var(--border); }
```

**After**:
```css
.header { border-bottom: var(--border-width) solid var(--border); }
.nav-bar { border-top: var(--border-width) solid var(--border); }
```

Phase 1で `--border-width: 1px` に統一されるため、自動的に1pxになる。

---

## B. 空状態（Empty State）統一

### B-1. 現状分析: 8クラス × 3パターン

現在の空状態は以下の3パターンに分かれている。

| パターン | クラス | 構造 | 使用箇所 |
|----------|--------|------|----------|
| **A: icon+text** | `.widget-empty`, `.fbox-empty`, `.material-empty` | SVGアイコン + テキスト | ホームウィジェット, F・BOX, 資料 |
| **B: text only** | `.task-empty`, `.routine-empty`, `.list-empty`, `.quickmemo-empty`, `.rv-empty` | テキストのみ | タスク, ルーティン, 各一覧, クイックメモ, 振り返り |
| **C: widget内** | `.widget-empty`（ホーム内） | flexbox中央配置 + icon + text | ホームスケジュール/ルーティン |

#### 現状CSSの全体像

```
css/style.css
├── L1953  .quickmemo-empty   → color: var(--text-placeholder); font-size: 14px
├── L4831  .list-empty        → text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 14px
├── L6995  .widget-empty      → color: #666; text-align: center; padding: 30px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px
├── L7005  .widget-empty-icon → font-size: 28px; opacity: 0.5
├── L7010  .widget-empty-text → font-size: 14px
├── L9163  .fbox-empty        → text-align: center; padding: 40px 20px; color: #aaa
├── L9169  .fbox-empty-icon   → width: 48px; height: 48px; color: #999; margin: 0 auto 12px
├── L9181  .fbox-empty p      → font-size: 14px; color: #999
├── L9485  .task-empty        → text-align: center; padding: 40px 20px; color: #777; font-size: 14px
├── L9731  .routine-empty     → text-align: center; padding: 24px 20px; color: #777; font-size: 14px
├── L9920  .material-empty    → text-align: center; padding: 40px 20px; color: #aaa
├── L9926  .material-empty-icon → width: 48px; height: 48px; color: #999; margin: 0 auto 12px
└── L10663 .rv-empty          → text-align: center; color: var(--text-muted, #999); padding: 40px 16px; font-size: 14px
```

**問題点**:
1. **色がハードコード**: `#666`, `#777`, `#aaa`, `#999` がCSS変数を使わず直書き → ダークモード非対応
2. **padding不統一**: `30px 16px`, `40px 20px`, `24px 20px` の3パターン
3. **構造不統一**: icon有無、actionボタン有無がページごとにバラバラ
4. **クラス名乱立**: 同じ「空です」表示に8つの別クラスが存在

### B-2. 統一空状態デザイン

Todoist/Notionに倣い、全空状態を **icon + message + (optional) action** の3層構造に統一する。

#### 統一CSSクラス

**After** (`css/style.css` に追加。旧クラスは全て置換):
```css
/* === 空状態 統一コンポーネント === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  gap: 8px;
}

.empty-state-icon {
  width: 40px;
  height: 40px;
  color: var(--text-placeholder);
  opacity: 0.6;
}

.empty-state-icon svg {
  width: 40px;
  height: 40px;
}

.empty-state-text {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.empty-state-action {
  margin-top: 8px;
  font-size: 14px;
  color: var(--primary);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
}

.empty-state-action:active {
  opacity: 0.7;
}

/* ウィジェット内の空状態（コンパクト版） */
.empty-state--compact {
  padding: 24px 16px;
}

.empty-state--compact .empty-state-icon {
  width: 28px;
  height: 28px;
}

.empty-state--compact .empty-state-icon svg {
  width: 28px;
  height: 28px;
}
```

### B-3. 全21箇所の Before/After 変更一覧

以下、`js/pages.js` の全空状態箇所を統一クラスに置換する。

---

#### B-3-1. ホーム画面 ルーティンウィジェット空状態

**場所**: `js/pages.js` L210
**Before**:
```javascript
routineItemsHTML = '<div class="widget-empty">ルーティン未設定</div>';
```
**After**:
```javascript
routineItemsHTML = `<div class="empty-state empty-state--compact">
  <div class="empty-state-icon">${getIcon('check')}</div>
  <div class="empty-state-text">ルーティン未設定</div>
</div>`;
```

---

#### B-3-2. ホーム画面 スケジュールウィジェット空状態

**場所**: `js/pages.js` L306-309
**Before**:
```javascript
scheduleItemsHTML = `<div class="widget-empty">
  <span class="widget-empty-icon">${getIcon('calendar')}</span>
  <span class="widget-empty-text">タップして設定</span>
</div>`;
```
**After**:
```javascript
scheduleItemsHTML = `<div class="empty-state empty-state--compact">
  <div class="empty-state-icon">${getIcon('calendar')}</div>
  <div class="empty-state-text">タップして設定</div>
</div>`;
```

---

#### B-3-3. GTD F・BOXタブ 空状態

**場所**: `js/pages.js` L542-546 (renderGTDFirstBoxTab内)
**Before**:
```javascript
<div class="fbox-empty">
  <div class="fbox-empty-icon">${getIcon('inbox')}</div>
  <p>未処理のアイテムはありません</p>
</div>
```
**After**:
```javascript
<div class="empty-state">
  <div class="empty-state-icon">${getIcon('inbox')}</div>
  <div class="empty-state-text">未処理のアイテムはありません</div>
</div>
```

---

#### B-3-4. GTD タスクタブ 空状態

**場所**: `js/pages.js` L594 (renderGTDTaskTab内)
**Before**:
```javascript
<div class="task-empty">このカテゴリにタスクはありません</div>
```
**After**:
```javascript
<div class="empty-state">
  <div class="empty-state-icon">${getIcon('check')}</div>
  <div class="empty-state-text">このカテゴリにタスクはありません</div>
</div>
```

---

#### B-3-5. GTD ルーティンタブ 空状態

**場所**: `js/pages.js` L639 (renderGTDRoutineTab内)
**Before**:
```javascript
<div class="routine-empty">このカテゴリにルーティンはありません</div>
```
**After**:
```javascript
<div class="empty-state">
  <div class="empty-state-icon">${getIcon('clock')}</div>
  <div class="empty-state-text">このカテゴリにルーティンはありません</div>
</div>
```

---

#### B-3-6. GTD 資料タブ 空状態

**場所**: `js/pages.js` L668-672 (renderGTDMaterialTab内)
**Before**:
```javascript
<div class="material-empty">
  <div class="material-empty-icon">${getIcon('file')}</div>
  <p>資料はまだありません</p>
</div>
```
**After**:
```javascript
<div class="empty-state">
  <div class="empty-state-icon">${getIcon('file')}</div>
  <div class="empty-state-text">資料はまだありません</div>
</div>
```

---

#### B-3-7. ルーティン一覧ページ 空状態

**場所**: `js/pages.js` L760 (renderRoutineListPage内)
**Before**:
```javascript
listHTML = `<div class="routine-empty"><p>${emptyMessages[currentTab]}</p></div>`;
```
**After**:
```javascript
listHTML = `<div class="empty-state">
  <div class="empty-state-icon">${getIcon('clock')}</div>
  <div class="empty-state-text">${emptyMessages[currentTab]}</div>
</div>`;
```

---

#### B-3-8. タスク一覧ページ 空状態

**場所**: `js/pages.js` L860-863 (renderTaskListPage内)
**Before**:
```javascript
listHTML = `
  <div class="task-empty">
    <p>${emptyMessages[currentTab]}</p>
  </div>
`;
```
**After**:
```javascript
listHTML = `<div class="empty-state">
  <div class="empty-state-icon">${getIcon('check')}</div>
  <div class="empty-state-text">${emptyMessages[currentTab]}</div>
</div>`;
```

---

#### B-3-9. 資料一覧ページ 空状態

**場所**: `js/pages.js` L927-932 (renderMaterialListPage内)
**Before**:
```javascript
listHTML = `
  <div class="material-empty">
    <div class="material-empty-icon">${getIcon('file')}</div>
    <p>資料はまだありません</p>
  </div>
`;
```
**After**:
```javascript
listHTML = `<div class="empty-state">
  <div class="empty-state-icon">${getIcon('file')}</div>
  <div class="empty-state-text">資料はまだありません</div>
</div>`;
```

---

#### B-3-10. F・BOX一覧ページ 空状態（1箇所目）

**場所**: `js/pages.js` L1321-1324 (renderFirstBoxListPage内)
**Before**:
```javascript
: `<div class="fbox-empty">
    <div class="fbox-empty-icon">${getIcon('inbox')}</div>
    <p>未処理のメモはありません</p>
  </div>`;
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('inbox')}</div>
    <div class="empty-state-text">未処理のメモはありません</div>
  </div>`;
```

---

#### B-3-11. F・BOX整理ページ 空状態

**場所**: `js/pages.js` L1397-1400 (renderFirstBoxItemsPage内)
**Before**:
```javascript
: `<div class="fbox-empty">
    <div class="fbox-empty-icon">${getIcon('inbox')}</div>
    <p>未処理のメモはありません</p>
  </div>`;
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('inbox')}</div>
    <div class="empty-state-text">未処理のメモはありません</div>
  </div>`;
```

---

#### B-3-12. クイックメモ 空状態

**場所**: `js/pages.js` L1667 (renderJournalPage内)
**Before**:
```javascript
: '<div class="quickmemo-empty">今日のクイックメモはありません</div>'
```
**After**:
```javascript
: `<div class="empty-state empty-state--compact">
    <div class="empty-state-icon">${getIcon('memo')}</div>
    <div class="empty-state-text">今日のクイックメモはありません</div>
  </div>`
```

---

#### B-3-13. ルーティンチェック画面 空状態

**場所**: `js/pages.js` L1720 (renderJournalSupplementPage内)
**Before**:
```javascript
: '<div class="list-empty">ルーティンが設定されていません</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('clock')}</div>
    <div class="empty-state-text">ルーティンが設定されていません</div>
  </div>`;
```

---

#### B-3-14. 日誌一覧 空状態

**場所**: `js/pages.js` L1789 (renderJournalListPage内)
**Before**:
```javascript
: '<div class="list-empty">日誌がありません</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('journal')}</div>
    <div class="empty-state-text">日誌がありません</div>
    <button class="empty-state-action" onclick="app.navigateToTodayJournal()">最初の日誌を書く</button>
  </div>`;
```

---

#### B-3-15. スケジュールパターン一覧 空状態

**場所**: `js/pages.js` L2118 (renderMonthlyScheduleSection内)
**Before**:
```javascript
: '<div class="widget-empty">パターンを追加してください</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('calendar')}</div>
    <div class="empty-state-text">パターンを追加してください</div>
  </div>`;
```

---

#### B-3-16. ルーティン月次評価 空状態

**場所**: `js/pages.js` L2497 (renderMonthlyEvaluationSection内)
**Before**:
```javascript
: '<div class="widget-empty">ルーティンを先に設定してください</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('clock')}</div>
    <div class="empty-state-text">ルーティンを先に設定してください</div>
  </div>`;
```

---

#### B-3-17. 月次目標一覧 空状態

**場所**: `js/pages.js` L2522 (renderMonthlyListPage内)
**Before**:
```javascript
: '<div class="list-empty">月次目標がありません</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('flag')}</div>
    <div class="empty-state-text">月次目標がありません</div>
    <button class="empty-state-action" onclick="app.navigateToCurrentMonth()">今月の目標を作成</button>
  </div>`;
```

---

#### B-3-18. 長期目標一覧 空状態

**場所**: `js/pages.js` L2707 (renderLongTermListPage内)
**Before**:
```javascript
: '<div class="list-empty">長期目標がありません</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('target')}</div>
    <div class="empty-state-text">長期目標がありません</div>
    <button class="empty-state-action" onclick="app.createNewLongTermGoal()">最初の目標を作成</button>
  </div>`;
```

---

#### B-3-19. スケジュール入力 空状態

**場所**: `js/pages.js` L2884 (renderScheduleEntryPage内)
**Before**:
```javascript
: '<div class="widget-empty">予定を追加してください</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('calendar')}</div>
    <div class="empty-state-text">予定を追加してください</div>
  </div>`;
```

---

#### B-3-20. マニュアル一覧 空状態

**場所**: `js/pages.js` L3223 (renderManualListPage内)
**Before**:
```javascript
: '<div class="list-empty">マニュアルがありません</div>';
```
**After**:
```javascript
: `<div class="empty-state">
    <div class="empty-state-icon">${getIcon('list')}</div>
    <div class="empty-state-text">マニュアルがありません</div>
    <button class="empty-state-action" onclick="app.createNewManual()">マニュアルを作成</button>
  </div>`;
```

---

#### B-3-21. 振り返り ルーティン達成表 空状態

**場所**: `js/pages.js` L3496 (renderReviewRoutineTable内)
**Before**:
```javascript
return '<div class="rv-empty">月次目標にルーティンが設定されていません</div>';
```
**After**:
```javascript
return `<div class="empty-state">
  <div class="empty-state-icon">${getIcon('chart')}</div>
  <div class="empty-state-text">月次目標にルーティンが設定されていません</div>
  <button class="empty-state-action" onclick="app.navigate('monthly')">月次目標を設定</button>
</div>`;
```

### B-4. CSS削除対象

統一クラス `.empty-state` に置換後、以下の旧CSSを全て削除する。

| 削除対象 | 行番号 | 行数 |
|----------|--------|------|
| `.quickmemo-empty` | L1953-1956 | 4行 |
| `.list-empty` | L4831-4836 | 6行 |
| `.widget-empty` | L6995-7003 | 9行 |
| `.widget-empty-icon` | L7005-7008 | 4行 |
| `.widget-empty-text` | L7010-7012 | 3行 |
| `.fbox-empty` | L9163-9167 | 5行 |
| `.fbox-empty-icon` | L9169-9174 | 6行 |
| `.fbox-empty-icon svg` | L9176-9179 | 4行 |
| `.fbox-empty p` | L9181-9184 | 4行 |
| `.task-empty` | L9485-9490 | 6行 |
| `.routine-empty` | L9731-9736 | 6行 |
| `.material-empty` | L9920-9924 | 5行 |
| `.material-empty-icon` | L9926-9931 | 6行 |
| `.material-empty-icon svg` | L9933-9936 | 4行 |
| `.rv-empty` | L10663-10668 | 6行 |
| **合計** | | **78行削除** |

統一CSSの追加: **約45行**
**差し引き: 約33行の純減**

---

## C. データ可視化

### C-1. 現状の可視化要素一覧

| 種類 | 場所 | ファイル/行 | 状態 |
|------|------|-------------|------|
| **プログレスバー** (ルーティン進捗) | ホーム画面ルーティンウィジェット | `pages.js` L198-204 | 実装済み |
| **プログレスバー** (ルーティン達成率) | ルーティンチェック画面 | `pages.js` L1744-1746 | 実装済み |
| **SVG円グラフ** (ルーティン進捗) | ホーム画面ルーティンcircleスタイル | `pages.js` L250-256 | 実装済み |
| **レーダーチャート** (5カテゴリバランス) | 振り返りサマリータブ | `pages.js` L3411-3454 | 実装済み |
| **カレンダーヒートマップ** (カテゴリドット) | カレンダーページ | `pages.js` L3599-3675 | 実装済み |
| **棒グラフ** (達成率) | ルーティン一覧ページ | `pages.js` L734-748 | プレースホルダ（"読み込み中..."） |
| **折れ線グラフ** (達成率推移) | 振り返りグラフタブ | `pages.js` L3566-3570 | プレースホルダ（"読み込み中..."） |
| **折れ線グラフ** (スコア推移) | 振り返りグラフタブ | `pages.js` L3572-3576 | プレースホルダ（"読み込み中..."） |
| **達成率表** (ルーティン達成表) | 振り返り達成表タブ | `pages.js` L3489-3556 | 実装済み |

### C-2. プログレスバーの統一

#### 現状の問題

2箇所にプログレスバーがあるが、CSSクラスが異なる。

**ホーム画面** (`pages.js` L198-204):
```html
<div class="routine-progress-bar-wrap">
  <span class="routine-progress-text">3 / 10</span>
  <div class="routine-progress-bar">
    <div class="routine-progress-fill" style="width: 30%"></div>
  </div>
</div>
```

**ルーティンチェック画面** (`pages.js` L1744-1746):
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 70%"></div>
</div>
```

#### 統一設計

Phase 2の部品統一と連携し、プログレスバーを1つのクラスに統一する。

**After** (`css/style.css` に追加):
```css
/* === プログレスバー 統一コンポーネント === */
.progress {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.progress--lg {
  height: 8px;
  border-radius: 4px;
}

.progress--lg .progress-fill {
  border-radius: 4px;
}
```

**After HTML構造** (統一後):
```html
<div class="progress">
  <div class="progress-fill" style="width: ${percent}%"></div>
</div>
```

### C-3. SVG円グラフの改善

**場所**: `js/pages.js` L250-256

**Before** (ハードコード色):
```javascript
<circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
<circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="8" .../>
```

**After** (CSS変数使用):
```javascript
<circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-secondary)" stroke-width="8"/>
<circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" stroke-width="8" .../>
```

Phase 1のトークン基盤により、SVG内の色もCSS変数化する。ダークモード・テーマ切替に自動対応。

### C-4. レーダーチャートの改善

**場所**: `js/pages.js` L3411-3454

**Before** (ハードコード色 L3452):
```javascript
<polygon points="${dataPts}" fill="rgba(74,144,164,0.2)" stroke="#4A90A4" stroke-width="2"/>
```

**After** (CSS変数):
```javascript
<polygon points="${dataPts}" fill="color-mix(in srgb, var(--primary) 20%, transparent)" stroke="var(--primary)" stroke-width="2"/>
```

**Before** (背景五角形 L3424):
```javascript
stroke="var(--border-color, #ddd)"
```

`--border-color` はPhase 1で `--border` に統一されるため問題なし。ただし `var(--border-color, #ddd)` ではなく `var(--border)` を使用すべき。

**After**:
```javascript
stroke="var(--border)"
```

### C-5. カレンダーヒートマップの改善

**場所**: `js/pages.js` L3621, L3642

**Before** (ハードコード色):
```javascript
const dotColors = { rei: '#7C4DFF', shin: '#E91E63', gi: '#FF9800', tai: '#4CAF50', sei: '#2196F3' };
```

**After** (CSS変数):
```javascript
const dotColors = { rei: 'var(--cat-rei)', shin: 'var(--cat-shin)', gi: 'var(--cat-gi)', tai: 'var(--cat-tai)', sei: 'var(--cat-sei)' };
```

現在カテゴリカラーは全て `#888888` に設定されている（`:root` L41-45）。Phase 1でカテゴリカラーが意味のある色に設定された後に自動反映される。

**注意**: SVGの `style` 属性内で `var()` を使う場合、一部の古いブラウザでは非対応。ただしこのアプリはPWAでモダンブラウザ前提のため問題なし。

### C-6. 棒グラフ（達成率）の実装設計

**場所**: `js/pages.js` L734-748 (renderRoutineListPage内)

現在プレースホルダ（"読み込み中..."）のみ。実データから棒グラフを描画する設計。

**現状** (`pages.js` L744-746):
```html
<div class="routine-graph-body" id="routine-graph-bars">
  <div class="routine-graph-loading">読み込み中...</div>
</div>
```

**After HTML構造** (SVGベースの棒グラフ):
```html
<div class="routine-graph-body" id="routine-graph-bars">
  <svg viewBox="0 0 320 120" class="bar-chart">
    <!-- Y軸ラベル -->
    <text x="24" y="16" class="bar-chart-label">100%</text>
    <text x="24" y="56" class="bar-chart-label">50%</text>
    <text x="24" y="96" class="bar-chart-label">0%</text>
    <!-- グリッド線 -->
    <line x1="32" y1="12" x2="312" y2="12" stroke="var(--border)" stroke-width="0.5"/>
    <line x1="32" y1="52" x2="312" y2="52" stroke="var(--border)" stroke-width="0.5"/>
    <line x1="32" y1="92" x2="312" y2="92" stroke="var(--border)" stroke-width="0.5"/>
    <!-- 棒グラフ（日数分） -->
    <rect x="40" y="32" width="24" height="60" rx="2" fill="var(--primary)" opacity="0.8"/>
    <!-- 日付ラベル -->
    <text x="52" y="108" class="bar-chart-date">月</text>
    ...
  </svg>
</div>
```

**After CSS**:
```css
.bar-chart {
  width: 100%;
  height: 120px;
}

.bar-chart-label {
  font-size: 10px;
  fill: var(--text-muted);
  text-anchor: end;
}

.bar-chart-date {
  font-size: 10px;
  fill: var(--text-muted);
  text-anchor: middle;
}
```

**実装方針**: `app.js` の `renderRoutineGraph()` (後処理)で、journals データから日別達成率を計算し、SVGの `<rect>` を動的に生成する。Canvas不使用でSVG一本化。

### C-7. 折れ線グラフ（達成率推移・スコア推移）の実装設計

**場所**: `js/pages.js` L3566-3578 (renderReviewGraph内)

**現状** (2つのプレースホルダ):
```html
<div id="rv-graph-canvas" class="rv-graph-canvas">
  <div class="rv-graph-loading">読み込み中...</div>
</div>
<div id="rv-score-canvas" class="rv-graph-canvas">
  <div class="rv-graph-loading">読み込み中...</div>
</div>
```

**After HTML構造** (SVGベースの折れ線グラフ):
```html
<div id="rv-graph-canvas" class="rv-graph-canvas">
  <svg viewBox="0 0 320 160" class="line-chart">
    <!-- Y軸 -->
    <text x="24" y="16" class="line-chart-label">100%</text>
    <text x="24" y="80" class="line-chart-label">50%</text>
    <text x="24" y="144" class="line-chart-label">0%</text>
    <!-- グリッド -->
    <line x1="32" y1="12" x2="312" y2="12" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4"/>
    <line x1="32" y1="76" x2="312" y2="76" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4"/>
    <line x1="32" y1="140" x2="312" y2="140" stroke="var(--border)" stroke-width="0.5"/>
    <!-- 塗りつぶし -->
    <polygon points="32,140 ... 312,140" fill="color-mix(in srgb, var(--primary) 10%, transparent)"/>
    <!-- 折れ線 -->
    <polyline points="32,80 72,60 112,40 ..." fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- ドット -->
    <circle cx="32" cy="80" r="3" fill="var(--primary)"/>
    ...
    <!-- X軸ラベル -->
    <text x="32" y="156" class="line-chart-date">2/20</text>
    ...
  </svg>
</div>
```

**After CSS**:
```css
.line-chart {
  width: 100%;
  height: 160px;
}

.line-chart-label {
  font-size: 10px;
  fill: var(--text-muted);
  text-anchor: end;
}

.line-chart-date {
  font-size: 9px;
  fill: var(--text-muted);
  text-anchor: middle;
}
```

**実装方針**:
- `app.js` の後処理関数 `renderReviewGraphData()` で journals データから日別の達成率・スコアを計算
- SVGの `<polyline>` で折れ線を描画（Canvas不使用）
- 週次表示(1W): 7点、月次表示(1M): 最大31点
- データがない日はドットを表示せず折れ線を途切れさせる（`NaN` スキップ）
- スコア推移は0-10のスケール（Y軸ラベル: 10, 5, 0）

### C-8. 可視化の色管理まとめ

全ての可視化要素でハードコード色をCSS変数に置換する。

| 要素 | Before | After |
|------|--------|-------|
| SVG円 背景リング | `#e5e7eb` | `var(--bg-secondary)` |
| SVG円 進捗リング | `#22c55e` | `var(--primary)` |
| レーダー データ面 fill | `rgba(74,144,164,0.2)` | `color-mix(in srgb, var(--primary) 20%, transparent)` |
| レーダー データ面 stroke | `#4A90A4` | `var(--primary)` |
| レーダー 背景/軸 | `var(--border-color, #ddd)` | `var(--border)` |
| カレンダー カテゴリドット | `#7C4DFF` 他5色 | `var(--cat-rei)` 他5変数 |
| スケジュールブロック border | `slot.color \|\| '#4A90A4'` | `slot.color \|\| 'var(--primary)'` |
| 棒グラフ/折れ線グラフ | 新規実装 | 全てCSS変数使用 |

---

## D. ナビゲーション評価

### D-1. 全ページ到達経路マップ

下部ナビバーの5タブから全30+ページへの到達経路を網羅する。

```
NavBar (5タブ)
├── [ホーム] home
│   ├── → calendar (カレンダーボタン)
│   ├── → journal (日誌を書く)
│   ├── → firstbox-list (F・BOXボタン)
│   │   ├── → firstbox (振り分けフロー)
│   │   └── → firstbox-items (整理する)
│   ├── → journal-supplement (ルーティンウィジェットタップ)
│   ├── → monthly-5 (スケジュールウィジェットタップ)
│   └── → schedule-entry (パターンの「1日のスケジュール」)
│
├── [GTD] gtd
│   ├── (tab) firstbox → F・BOXタブ
│   │   ├── → firstbox (振り分けフロー: アイテムタップ)
│   │   └── → firstbox-items (整理するボタン)
│   ├── (tab) task → タスクタブ (6サブタブ)
│   ├── (tab) routine → ルーティンタブ (5サブタブ)
│   ├── (tab) material → 資料タブ
│   │   └── → material-view (資料タップ)
│   ├── → note-view (テーブルアイコン)
│   └── → routine-note-view (ルーティンタブ時のテーブルアイコン)
│
├── [目標一覧] goal-list
│   ├── → longterm (長期目標カードタップ)
│   ├── → monthly (月次目標カードタップ)
│   ├── → life (人生設計メニュー)
│   │   └── (swipe) life-0, life-1
│   ├── → longterm-list (長期目標メニュー)
│   │   └── → longterm (個別目標タップ)
│   ├── → monthly-list (月次目標メニュー)
│   │   └── → monthly (個別目標タップ)
│   │       └── (swipe) monthly-0 ~ monthly-7
│   └── → journal-list (日誌一覧メニュー)
│       └── → journal (個別日誌タップ)
│           └── (swipe) journal-supplement, journal
│
├── [振り返り] review
│   ├── (tab) summary → サマリータブ
│   ├── (tab) routine-table → 達成表タブ
│   └── (tab) graph → グラフタブ
│
└── [設定] settings
    ├── → routine-list (ルーティン一覧)
    ├── → task-list (タスク一覧)
    ├── → material-list (資料一覧)
    │   ├── → material-view (個別資料)
    │   └── → material-add (資料追加)
    ├── → manual-list (マニュアル一覧)
    │   ├── → manual (個別マニュアル)
    │   └── → manual-edit (マニュアル編集)
    └── → firstbox-list (F・BOX一覧)
```

### D-2. 到達困難ページの特定

| ページ | 到達方法 | 問題 | 重大度 |
|--------|----------|------|--------|
| `tasks` (今日のタスク画面) | ルーティング上は存在するがUIから遷移する導線が見当たらない | `renderTasksPage` が定義されているが、どのボタン/リンクからも呼ばれていない可能性 | **重要** |
| `schedule-entry` | home → スケジュールウィジェット → パターン選択 → パターン編集 → 「1日のスケジュール」リンク | 4ステップ必要。ホームのスケジュールが空の場合、到達が非常に困難 | **軽微** |
| `manual` / `manual-edit` | settings → manual-list → 個別タップ | 設定画面内に埋もれている。マニュアルはルーティンと密接に関連するが、GTDページからアクセスできない | **重要** |
| `note-view` / `routine-note-view` | gtd → ヘッダーのテーブルアイコン | アイコンだけで説明なし。初見では機能に気づかない | **軽微** |
| `firstbox-items` | home → F・BOX → 一覧表示 → 「整理する」ボタン | パターンAでのみ表示される。パターンBでは到達不可 | **軽微** |

### D-3. ナビゲーション改善提案

#### D-3-1. `tasks` ページの整理

**現状**: `renderTasksPage()` (`pages.js` L1426-) は「今日のタスク画面」として定義されているが、UIからの遷移導線が不明確。GTDのタスクタブ (`renderGTDTaskTab`) と機能が重複している。

**提案**: `tasks` ページを廃止するか、ホーム画面の「今日やる事」ウィジェットからのリンク先として明確に位置づける。現在は `journal-supplement` (ルーティンチェック)に遷移しているため、`tasks` は実質デッドページの可能性がある。

**判断待ち**: 設計者に `tasks` ページの意図を確認する必要がある。

#### D-3-2. マニュアルへのアクセス改善

**現状**: マニュアルは `settings → manual-list` からのみアクセス可能。

**提案**: GTDのルーティンタブに「マニュアル」へのショートカットを追加する。ルーティンの5コアのうち「③マニュアル」が重要な要素であるため、GTDからの導線が自然。

**After** (`js/pages.js` renderGTDRoutineTab内、タブバーの下に追加):
```javascript
<div class="routine-manual-link" onclick="app.navigate('manual-list')">
  ${getIcon('list')} マニュアル一覧
</div>
```

#### D-3-3. ノートビューのディスカバラビリティ向上

**現状**: テーブルアイコンのみで説明なし。

**提案（軽微）**: ヘッダーアイコンにツールチップまたはラベルを追加。ただしモバイルではツールチップが機能しにくいため、初回利用時のみコーチマーク表示がベター。実装コストが高いため、**現時点では対応不要**。

#### D-3-4. スワイプナビゲーションの視認性

**現状**: `renderSwipeNav()` はドットインジケーター + 左右ラベルで構成。

**問題**: ドットが小さく、現在地が分かりにくい。特にmonthly（8ページ）は8個のドットが並び、どこにいるか判別しにくい。

**提案**: ドットインジケーターの代わりに、現在ページ名を中央に大きく表示し、左右に前後ページ名を小さく表示する「セグメントスクロール」スタイルに変更する。

**Before** (`js/pages.js` L120-144):
```javascript
<div class="swipe-nav">
  <div class="swipe-nav-prev">← 前ページ名</div>
  <div class="swipe-dots">
    <div class="swipe-dot"></div>
    <div class="swipe-dot active"></div>
    <div class="swipe-dot"></div>
  </div>
  <div class="swipe-nav-next">次ページ名 →</div>
</div>
```

**After**:
```javascript
function renderSwipeNav(pages, currentIndex) {
  const prevPage = pages[currentIndex - 1];
  const nextPage = pages[currentIndex + 1];

  return `
    <div class="swipe-nav" data-current-index="${currentIndex}" data-total-pages="${pages.length}">
      <div class="swipe-nav-prev" ${prevPage ? `onclick="app.navigate('${prevPage.id}')"` : ''}>
        ${prevPage ? `${getIcon('back')} ${prevPage.label}` : ''}
      </div>
      <div class="swipe-nav-current">
        <span class="swipe-nav-current-label">${pages[currentIndex].label}</span>
        <span class="swipe-nav-current-count">${currentIndex + 1} / ${pages.length}</span>
      </div>
      <div class="swipe-nav-next" ${nextPage ? `onclick="app.navigate('${nextPage.id}')"` : ''}>
        ${nextPage ? `${nextPage.label} ${getIcon('forward')}` : ''}
      </div>
    </div>
  `;
}
```

**After CSS**:
```css
.swipe-nav {
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-main);
  border-bottom: var(--border-width) solid var(--border);
}

.swipe-nav-prev,
.swipe-nav-next {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.swipe-nav-prev { justify-content: flex-start; }
.swipe-nav-next { justify-content: flex-end; }

.swipe-nav-current {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.swipe-nav-current-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.swipe-nav-current-count {
  font-size: 11px;
  color: var(--text-muted);
}
```

この変更により、ドットの代わりに「目標 (1/8)」のような明示的な位置表示となり、8ページ構成でも迷いにくくなる。Apple Remindersのセグメントコントロールに近い体験。

### D-4. ページ階層深度マップ

```
深度0 (NavBarタブ直下)
  home, gtd, goal-list, review, settings

深度1 (タブから1タップ)
  calendar, journal, journal-supplement, monthly, life
  longterm-list, monthly-list, journal-list, manual-list
  routine-list, task-list, material-list, firstbox-list
  note-view, routine-note-view

深度2 (タブから2タップ)
  longterm, monthly-0~7, life-0~1
  journal (一覧経由), manual, material-view, material-add
  firstbox, firstbox-items, manual-edit, schedule-entry

深度3 (タブから3タップ)
  firstbox (一覧→個別アイテム→振り分け)
```

**評価**: 最大深度3は許容範囲。Todoistは最大深度2、Notionは事実上無制限だが通常2-3。Apple Remindersは最大深度2。

ただし、**同じコンテンツに複数の経路で到達できる**点は良い設計（goal-list → monthly、settings → routine-list、home → journal-supplement など）。

### D-5. ナビゲーション全体の評価

| 観点 | 評価 | 補足 |
|------|------|------|
| **到達性** | 良好 | 主要機能は2タップ以内。デッドページ(`tasks`)要確認 |
| **一貫性** | 概ね良好 | NavBar→タブ→コンテンツの3層構造は一貫。スワイプとタブの混在がやや複雑 |
| **直感性** | 改善余地あり | ノートビュー、スワイプナビのドットは分かりにくい |
| **冗長性** | 適度 | 同じページへの複数経路は意図的で有用。ただしtasks/journal-supplementの関係は整理が必要 |
| **拡張性** | 要注意 | 既に30+ページ。新機能追加時にナビゲーションが破綻するリスクあり。カテゴリの見直しが将来必要 |

---

## 実装優先度

| 優先度 | タスク | 影響範囲 | 工数目安 |
|--------|--------|----------|----------|
| **P0** | B. 空状態統一 (21箇所のJS + 78行CSS削除 + 45行CSS追加) | 全ページ | 中 |
| **P0** | C-8. 可視化の色管理 (ハードコード色→CSS変数) | 6箇所 | 小 |
| **P1** | C-2. プログレスバー統一 | 2箇所 | 小 |
| **P1** | A-2. padding/gap の8pxグリッド統一 | CSS全体 | 小 |
| **P1** | A-2. border-width統一 (header/nav-bar) | 2箇所 | 小 |
| **P2** | C-6. 棒グラフ実装 | ルーティン一覧 | 大 |
| **P2** | C-7. 折れ線グラフ実装 | 振り返りグラフタブ | 大 |
| **P2** | D-3-4. スワイプナビ改善 | 3スワイプグループ | 中 |
| **P3** | D-3-2. マニュアルへのアクセス改善 | GTDページ | 小 |
| **P3** | D-3-1. tasksページの整理 | ルーティング | 設計判断 |

---

## 変更量サマリー

| 項目 | 追加 | 削除 | 純増減 |
|------|------|------|--------|
| CSS (空状態統一) | ~45行 | ~78行 | **-33行** |
| CSS (プログレスバー統一) | ~20行 | (旧クラス分) | 微減 |
| CSS (スワイプナビ改善) | ~45行 | (旧スタイル分) | 微増 |
| CSS (グラフ) | ~30行 | 0 | +30行 |
| JS (空状態 21箇所) | 統一テンプレート化 | 個別テンプレート | ±0 |
| JS (グラフ実装) | ~150行 (棒+折れ線) | 0 | +150行 |
| JS (スワイプナビ) | ~20行 | ~15行 | +5行 |
