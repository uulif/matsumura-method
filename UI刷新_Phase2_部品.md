# UI刷新 Phase 2: 部品チーム（UIコンポーネント統一）

> 作業開始: 2026-02-26
> ステータス: 設計完了

---

## 参照アプリとの比較（全体）

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **削除ボタン** | 13種類（`.list-delete-btn`, `.fbox-item-delete`, `.task-item-delete` 等）。サイズ16px〜28px、色も赤/グレー/テーマ色がバラバラ | スワイプ→削除1パターン。常時表示の削除ボタンなし | `...`メニュー内に「Delete」1つ。ゴミ箱アイコン不使用 | スワイプ→赤背景「削除」1パターン |
| **チェックボックス** | 7種類（`.task-check`, `.rc-check`, `.routine-check` 等）。サイズ20px〜28px、角丸/丸混在 | 丸型チェック1種（完了→灰塗り）。プロジェクト色で縁取り | 正方形チェック1種。シンプルな2状態(空/✓) | 丸型チェック1種。完了→テーマ色塗り |
| **FAB/追加ボタン** | 6種類（`.fab`, `.task-add-fab`, `.add-btn` 等）。影・サイズ・位置バラバラ | 右下FAB1個（赤丸＋白＋アイコン） | テキスト内「＋」ボタン1種。FABなし | 左下「新規リマインダー」テキストボタン |
| **タブバー** | 5系統（`.nav-bar`, `.tabs`, `.gtd-tab-bar`, `.task-tab-bar`, `.routine-tab-bar`）。見た目が全て異なる | 下ナビ1本＋プロジェクト横スクロール | 上部タブ1種（下線アクティブ） | 下ナビ1本のみ |
| **モーダル** | 10種類超（center/bottom-sheet/inline/toast/confirm/field-help/pattern-select 等） | モーダル2種（入力用・確認用）。統一デザイン | モーダル2種（ダイアログ・コマンドパレット） | アラート1種＋アクションシート1種 |
| **カード** | 9種類（`.card`, `.goal-card`, `.progress-card`, `.life-card`, `.routine-card` 等）。枠線・影・角丸バラバラ | カードなし（リスト表現のみ） | ブロック1種（余白・枠で差をつける） | リスト表現のみ |

---

## 1. 削除ボタン統一

### 1-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | JS使用箇所 (pages.js) | サイズ | 色 | 形状 |
|---|---------|-------|----------------------|--------|-----|------|
| 1 | `.quickmemo-delete-btn` | style.css L1998-2010 | pages.js L1664 | 20×20 | `#aaa` | テキスト横、SVG `close` |
| 2 | `.score-item-delete` | style.css L2120-2130 | pages.js L1564 | テキスト | `#999`→hover赤 | `&times;` 文字 |
| 3 | `.list-delete-btn` | style.css L4808-4829 | pages.js L1781,2520,2704 | 28×28 | `#bbb`→赤 | SVG `close` |
| 4 | `.fbox-item-delete` | style.css L9137-9160 | pages.js L533,1316,1392 | 24×24 | `#bbb`→赤 | SVG `trash` / `close` |
| 5 | `.task-item-delete` | style.css L9417-9440 | pages.js L589,912 | 24×24 | `#bbb`→赤 | SVG `trash` / `close` |
| 6 | `.routine-item-delete` | style.css L9706-9729 | pages.js L634,782 | 24×24 | `#bbb`→赤 | SVG `close` |
| 7 | `.material-item-delete` | style.css L9895-9918 | pages.js L663,957 | 24×24 | `#bbb`→赤 | SVG `close` |
| 8 | `.schedule-delete-btn` | style.css L7668-7675 | pages.js L2188,2874 | テキスト | `#999`→赤 | `×` 文字 |
| 9 | `.remove-btn` | style.css L5053-5068 | pages.js L2608 | 24×24 | `#ccc`→赤 | SVG `close` |
| 10 | `.pattern-delete-btn` | style.css L7746-7753 | pages.js L2111 | テキスト | `#999`→赤 | `×` 文字 |
| 11 | `.schedule-free-delete` | style.css L8170-8183 | (schedule-entry内) | 24×24 | `#999`→赤 | `×` 文字 |
| 12 | `.favorite-item-delete` | style.css L2973-2981 | (お気に入り内) | 20×20 | `#bbb`→赤 | SVG |
| 13 | `.remove-btn-red` | style.css L5919-5940 | pages.js L2821 | 28×28 | `#E53935` 常時赤 | SVG `close` |
| 14 | `.btn-icon.danger` | style.css 内 | pages.js L1989 | テキスト | 赤 | `✕` 文字 |

### 1-2. 統一パターン設計

**統一先: 2パターン**

#### パターンA: `.delete-btn`（インラインアイコン削除）
用途: リストアイテムの右端に常時表示する削除ボタン（全13箇所の主要用途）

```css
/* === 統一削除ボタン（インライン） === */
.delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-gray-400);          /* Phase1トークン */
  cursor: pointer;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast),
              background var(--transition-fast);
  padding: 0;
}

.delete-btn:active {
  color: var(--color-red-600);           /* Phase1トークン */
  background: var(--color-red-50);
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

/* 小サイズ修飾子（スコア項目・スケジュール時刻横など狭い場所） */
.delete-btn--sm {
  width: 24px;
  height: 24px;
}

.delete-btn--sm svg {
  width: 14px;
  height: 14px;
}
```

```html
<!-- Before -->
<button class="list-delete-btn" onclick="...">${getIcon('close')}</button>
<button class="fbox-item-delete" onclick="...">${getIcon('trash')}</button>
<span class="score-item-delete" onclick="...">&times;</span>

<!-- After -->
<button class="delete-btn" onclick="...">${getIcon('close')}</button>
<button class="delete-btn" onclick="...">${getIcon('close')}</button>
<button class="delete-btn delete-btn--sm" onclick="...">${getIcon('close')}</button>
```

#### パターンB: `.delete-btn--danger`（常時赤・強調削除）
用途: 年齢別目標の `.remove-btn-red` のように「削除操作が目立つべき」場所

```css
.delete-btn--danger {
  color: var(--color-red-600);
}

.delete-btn--danger:active {
  color: var(--color-red-700);
  background: var(--color-red-100);
}
```

```html
<!-- Before -->
<button class="remove-btn-red" onclick="...">${getIcon('close')}</button>

<!-- After -->
<button class="delete-btn delete-btn--danger" onclick="...">${getIcon('close')}</button>
```

### 1-3. アイコン統一

現状、削除ボタンのアイコンが `close`(×)、`trash`(ゴミ箱)、`&times;`(文字) と混在。

**統一方針**: 全て SVG `close`（×アイコン）に統一。理由:
- Todoist/Notion共に削除はコンパクトな×を使用
- `trash` アイコンは確認ダイアログ内のみに使用（危険操作の強調）
- 文字の `×` / `&times;` / `✕` は全てSVG `close` に置換

### 1-4. マイグレーション表

| 旧クラス | 新クラス | アイコン変更 |
|---------|---------|------------|
| `.quickmemo-delete-btn` | `.delete-btn` | 変更なし（close） |
| `.score-item-delete` | `.delete-btn .delete-btn--sm` | `&times;` → SVG close |
| `.list-delete-btn` | `.delete-btn` | 変更なし（close） |
| `.fbox-item-delete` | `.delete-btn` | trash/close → close |
| `.task-item-delete` | `.delete-btn` | trash/close → close |
| `.routine-item-delete` | `.delete-btn` | 変更なし（close） |
| `.material-item-delete` | `.delete-btn` | 変更なし（close） |
| `.schedule-delete-btn` | `.delete-btn .delete-btn--sm` | `×` 文字 → SVG close |
| `.remove-btn` | `.delete-btn` | 変更なし（close） |
| `.pattern-delete-btn` | `.delete-btn .delete-btn--sm` | `×` 文字 → SVG close |
| `.schedule-free-delete` | `.delete-btn .delete-btn--sm` | `×` 文字 → SVG close |
| `.favorite-item-delete` | `.delete-btn` | 変更なし |
| `.remove-btn-red` | `.delete-btn .delete-btn--danger` | 変更なし（close） |
| `.btn-icon.danger` | `.delete-btn .delete-btn--sm .delete-btn--danger` | `✕` → SVG close |

### 1-5. ダークモード

```css
.dark-mode .delete-btn {
  color: var(--color-gray-500);
}

.dark-mode .delete-btn:active {
  color: var(--color-red-400);
  background: rgba(229, 57, 53, 0.15);
}

.dark-mode .delete-btn--danger {
  color: var(--color-red-400);
}
```

---

## 2. チェックボックス / トグル統一

### 2-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | JS使用箇所 (pages.js) | サイズ | 形状 | 状態数 |
|---|---------|-------|----------------------|--------|------|--------|
| 1 | `.task-check` | style.css L1638-1664 | pages.js L1436,1445,1498-1506,1704 | 24×24 | 角丸正方形 | 3状態(none/partial/done) |
| 2 | `.rc-check` | style.css L5394-5431 | pages.js L226 | 22×22 | 角丸正方形 | 3状態(none/partial/done) |
| 3 | `.routine-check` | style.css L7174-7191 | (ルーティン一覧内) | 20×20 | 角丸 | 2状態(none/done) |
| 4 | `.routine-card-check` | style.css L7359-7381 | pages.js L275 | 22×22 | 角丸 | 3状態 |
| 5 | `.task-item-check` | style.css L9442-9474 | pages.js L582,904 | 22×22 | 丸形 | 3状態(none/in-progress/checked) |
| 6 | `.toggle-switch` | style.css L3962-3991 | pages.js L2940 | 48×26 | ピル型 | 2状態(off/active) |
| 7 | `.nv-check` | noteview.css L135-173 | (ノートビュー内) | 20×20 | 丸形 | 3状態(none/partial/done) |

### 2-2. 参照アプリ比較

| アプリ | チェック形状 | サイズ | 状態 | 色 |
|--------|------------|--------|------|-----|
| **Todoist** | 丸形 | 24px | 2状態（空/完了灰） | プロジェクト色で縁取り |
| **Notion** | 角丸正方形 | 16px | 2状態（空/✓青） | 青のみ |
| **Apple Reminders** | 丸形 | 22px | 2状態（空/✓テーマ色） | テーマ色 |

### 2-3. 統一パターン設計

**統一先: 3パターン**

#### パターンA: `.check`（3状態チェック — メイン）
用途: ルーティン・タスクの完了/半分/未了（`.task-check`, `.rc-check`, `.routine-check`, `.routine-card-check`）

```css
/* === 統一チェックボックス（3状態） === */
.check {
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-gray-300);     /* Phase1: 2px → 1px */
  border-radius: var(--radius-sm);              /* 角丸正方形 */
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  background: transparent;
  color: transparent;
}

.check.done {
  background: var(--color-green-600);
  border-color: var(--color-green-600);
  color: white;
}

.check.done svg {
  stroke: white;
  width: 14px;
  height: 14px;
}

.check.partial {
  background: var(--color-amber-500, #f59e0b);
  border-color: var(--color-amber-500, #f59e0b);
  color: white;
  font-size: 13px;
  font-weight: 700;
}
```

```html
<!-- Before -->
<div class="task-check done" onclick="...">${getIcon('check')}</div>
<span class="rc-check checked" onclick="...">✓</span>

<!-- After -->
<div class="check done" onclick="...">${getIcon('check')}</div>
<div class="check done" onclick="...">${getIcon('check')}</div>
```

#### パターンB: `.check--circle`（丸形チェック）
用途: GTDタスク一覧の `.task-item-check`（Todoist風の丸チェック）

```css
.check--circle {
  border-radius: 50%;
}

.check--circle.in-progress {
  border-color: var(--color-blue-400);
  color: var(--color-blue-400);
  font-size: 14px;
  font-weight: 700;
}
```

```html
<!-- Before -->
<div class="task-item-check checked" onclick="...">${getIcon('check')}</div>
<div class="task-item-check in-progress" onclick="...">—</div>

<!-- After -->
<div class="check check--circle done" onclick="...">${getIcon('check')}</div>
<div class="check check--circle in-progress" onclick="...">—</div>
```

#### パターンC: `.toggle`（トグルスイッチ）
用途: 設定画面のON/OFF（`.toggle-switch`）

```css
/* === 統一トグルスイッチ === */
.toggle {
  width: 48px;
  height: 28px;
  background: var(--color-gray-300);
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
  flex-shrink: 0;
  border: none;
}

.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-fast);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle.active {
  background: var(--color-green-600);
}

.toggle.active::after {
  transform: translateX(20px);
}
```

### 2-4. マイグレーション表

| 旧クラス | 新クラス | 変更内容 |
|---------|---------|---------|
| `.task-check` | `.check` | border 2px→1px、色をトークン化 |
| `.rc-check` | `.check` | 22px→24px、✓文字→SVG |
| `.routine-check` | `.check` | 20px→24px |
| `.routine-card-check` | `.check` | 22px→24px |
| `.task-item-check` | `.check .check--circle` | border 2px→1px |
| `.toggle-switch` | `.toggle` | クラス名のみ変更 |
| `.nv-check` | `.check .check--circle` | border 2px→1px |

### 2-5. ダークモード

```css
.dark-mode .check {
  border-color: var(--color-gray-600);
}

.dark-mode .check.done {
  background: var(--color-green-700);
  border-color: var(--color-green-700);
}

.dark-mode .toggle {
  background: var(--color-gray-700);
}

.dark-mode .toggle.active {
  background: var(--color-green-700);
}
```

---

## 3. FAB / 追加ボタン統一

### 3-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | JS使用箇所 (pages.js) | サイズ | 位置 | 見た目 |
|---|---------|-------|----------------------|--------|------|--------|
| 1 | `.fab` | style.css L3840-3865 | pages.js L1796,2529,2714,3230 | 52×52 | fixed右下 | テーマ色丸+影 |
| 2 | `.task-add-fab` | style.css L9492-9518 | pages.js L597,873 | 48×48 | fixed右下 | テーマ色丸+影 |
| 3 | `.routine-add-fab` | style.css L9761-9787 | pages.js L643,813 | 48×48 | fixed右下 | テーマ色丸+影 |
| 4 | `.material-add-fab` | style.css L9938-9964 | pages.js L674,969 | 48×48 | fixed右下 | テーマ色丸+影 |
| 5 | `.add-btn` | style.css L5018-5050, L9238-9261 | pages.js L1479,2013,2059,2678,2843 | テキスト幅 | static | テキスト+枠線/破線 |
| 6 | `.add-routine-btn` | style.css L7203-7226 | (ルーティン一覧内) | テキスト幅 | static | テーマ色テキスト |
| 7 | `.schedule-add-btn` | style.css L8131-8134 | pages.js L2124,2377,2892 | テキスト幅 | static | テキスト+アイコン |
| 8 | `.score-item-add-btn` | style.css 内 | pages.js L1574 | テキスト幅 | static | 枠線ボタン |

### 3-2. 参照アプリ比較

| アプリ | FAB | インライン追加 |
|--------|-----|-------------|
| **Todoist** | 右下56px赤丸FAB 1つ。全画面共通 | なし |
| **Notion** | FABなし | テキスト行の`+`ボタン。hover時に表示 |
| **Apple Reminders** | なし | 左下「新規リマインダー」テキストリンク |

### 3-3. 統一パターン設計

**統一先: 2パターン**

#### パターンA: `.fab`（フローティング追加ボタン — 1つに統一）
用途: GTDタスク/ルーティン/資料/日誌一覧/長期目標一覧/マニュアル一覧の右下

```css
/* === 統一FAB === */
.fab {
  position: fixed;
  bottom: 96px;
  right: 20px;
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);  /* Phase1: 色ベースの影→汎用影 */
  cursor: pointer;
  transition: transform var(--transition-fast);
  z-index: 500;
  border: none;
}

.fab:active {
  transform: scale(0.9);
}

.fab svg {
  width: 24px;
  height: 24px;
}
```

現行の `.fab` とほぼ同じだが、影の色を `rgba(102,126,234,0.4)` → `rgba(0,0,0,0.2)` に変更（テーマ色に依存させない）。

#### パターンB: `.add-inline`（インライン追加ボタン）
用途: セクション内の「＋ ルーティンを追加」「＋ 予定を追加」等

```css
/* === 統一インライン追加ボタン === */
.add-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 16px;
  border: 1px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-gray-600);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: 8px;
}

.add-inline:active {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.add-inline svg {
  width: 16px;
  height: 16px;
}

/* ソリッド枠線バリアント（score-item-add-btn等） */
.add-inline--solid {
  border-style: solid;
}
```

```html
<!-- Before -->
<button class="add-btn" onclick="...">
  <span class="icon-inline">${getIcon('plus')}</span>
  ルーティンを追加
</button>
<button class="schedule-add-btn" onclick="...">
  ${getIcon('plus')} 予定を追加
</button>
<button class="add-btn dashed" onclick="...">
  <span class="icon-inline">${getIcon('plus')}</span>
  逆算を追加
</button>

<!-- After -->
<button class="add-inline" onclick="...">
  ${getIcon('plus')} ルーティンを追加
</button>
<button class="add-inline" onclick="...">
  ${getIcon('plus')} 予定を追加
</button>
<button class="add-inline" onclick="...">
  ${getIcon('plus')} 逆算を追加
</button>
```

### 3-4. マイグレーション表

| 旧クラス | 新クラス | 変更内容 |
|---------|---------|---------|
| `.fab` | `.fab`（変更なし） | 影のcolor変更のみ |
| `.task-add-fab` | `.fab` | 48px→52px、CSS統合 |
| `.routine-add-fab` | `.fab` | 48px→52px、CSS統合 |
| `.material-add-fab` | `.fab` | 48px→52px、CSS統合 |
| `.add-btn` | `.add-inline` | デザイン統一 |
| `.add-btn.dashed` | `.add-inline` | デフォルトがdashed |
| `.add-routine-btn` | `.add-inline` | テーマ色→グレーに |
| `.schedule-add-btn` | `.add-inline` | デザイン統一 |
| `.score-item-add-btn` | `.add-inline .add-inline--solid` | デザイン統一 |

### 3-5. ダークモード

```css
.dark-mode .fab {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
}

.dark-mode .add-inline {
  border-color: var(--color-gray-700);
  color: var(--color-gray-400);
}

.dark-mode .add-inline:active {
  background: var(--color-gray-900);
}
```

---

## 4. タブバー統一

### 4-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | JS使用箇所 (pages.js) | タブ数 | デザイン | 用途 |
|---|---------|-------|----------------------|--------|---------|------|
| 1 | `.nav-bar` / `.nav-item` | style.css L1367-1376 | pages.js L683-705 | 5固定 | 下固定、アイコン+ラベル | メインナビゲーション |
| 2 | `.tabs` / `.tab` | style.css L4451-4474 | (汎用) | 可変 | 背景灰色、pill型 | 汎用タブ（未使用？） |
| 3 | `.gtd-tab-bar` / `.gtd-tab` | style.css L9267-9290 | pages.js L496-503 | 4 | 横スクロール、下線アクティブ | GTDページ内タブ |
| 4 | `.task-tab-bar` / `.task-tab` | style.css L9315-9377 | pages.js L564-574,835-845 | 6 | 横スクロール、pill型、カウンター付き | タスク分類タブ |
| 5 | `.routine-tab-bar` / `.routine-tab` | style.css L9605-9655 | pages.js L616-625,720-729 | 5 | 横スクロール、pill型、カウンター付き | ルーティン分類タブ |
| 6 | `.rv-tabs` / `.rv-tab` | style.css L10611-10634 | pages.js L3315-3317 | 3 | pill型、影付き | 振り返りページタブ |
| 7 | `.rv-toggle` / `.rv-toggle-btn` | style.css L10637-10660 | pages.js L3500-3503 | 2-3 | 小型pill型 | 週/月トグル |

### 4-2. 参照アプリ比較

| アプリ | メインナビ | サブタブ | セグメント |
|--------|----------|---------|----------|
| **Todoist** | 下固定5アイコン（ラベルなし） | なし | なし |
| **Notion** | サイドバー（モバイル：下固定3つ） | ページ上部に下線タブ | なし |
| **Apple Reminders** | 下固定3ボタン | なし | セグメントコントロール(pill型) |

### 4-3. 統一パターン設計

**統一先: 2パターン**（メインナビは変更禁止のため対象外）

#### パターンA: `.tab-bar` / `.tab-item`（セクション内タブ — スクロール可）
用途: GTD/タスク/ルーティンの分類切り替え

```css
/* === 統一タブバー（横スクロール） === */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  margin-bottom: 12px;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  color: var(--color-gray-600);
  background: transparent;
  transition: all var(--transition-fast);
  border: none;
}

.tab-item.active {
  background: var(--bg-main, #fff);
  color: var(--text-primary);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* カウンター（タスク数等） */
.tab-item__count {
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  font-weight: 600;
}

.tab-item.active .tab-item__count {
  background: var(--primary);
  color: white;
}

/* アイコン付き（タスクタブ） */
.tab-item__icon {
  width: 14px;
  height: 14px;
}

.tab-item__icon svg {
  width: 14px;
  height: 14px;
}
```

```html
<!-- Before (GTD) -->
<div class="gtd-tab-bar">
  <div class="gtd-tab active" onclick="...">F・BOX</div>
  <div class="gtd-tab" onclick="...">タスク</div>
</div>

<!-- Before (Task) -->
<div class="task-tab-bar">
  <button class="task-tab active" onclick="...">
    <span class="task-tab-icon">${getIcon('zap')}</span>
    <span class="task-tab-label">すぐやる</span>
    <span class="task-tab-count">3</span>
  </button>
</div>

<!-- After (統一) -->
<div class="tab-bar">
  <button class="tab-item active" onclick="...">F・BOX</button>
  <button class="tab-item" onclick="...">タスク</button>
</div>

<div class="tab-bar">
  <button class="tab-item active" onclick="...">
    <span class="tab-item__icon">${getIcon('zap')}</span>
    すぐやる
    <span class="tab-item__count">3</span>
  </button>
</div>
```

#### パターンB: `.segment`（セグメントコントロール — 小型2-3択）
用途: 振り返りの週/月切り替え、表示モード切替

```css
/* === 統一セグメントコントロール === */
.segment {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
  width: fit-content;
}

.segment__btn {
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  color: var(--color-gray-600);
  transition: all var(--transition-fast);
}

.segment__btn.active {
  background: var(--bg-main, #fff);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

```html
<!-- Before -->
<div class="rv-toggle">
  <button class="rv-toggle-btn active">週</button>
  <button class="rv-toggle-btn">月</button>
</div>

<!-- After -->
<div class="segment">
  <button class="segment__btn active">週</button>
  <button class="segment__btn">月</button>
</div>
```

### 4-4. マイグレーション表

| 旧クラス | 新クラス | 変更内容 |
|---------|---------|---------|
| `.nav-bar` / `.nav-item` | 変更なし | 制約により変更不可 |
| `.tabs` / `.tab` | `.tab-bar` / `.tab-item` | クラス名変更、デザイン統一 |
| `.gtd-tab-bar` / `.gtd-tab` | `.tab-bar` / `.tab-item` | pill型に統一 |
| `.task-tab-bar` / `.task-tab` | `.tab-bar` / `.tab-item` | デザイン統一 |
| `.routine-tab-bar` / `.routine-tab` | `.tab-bar` / `.tab-item` | デザイン統一 |
| `.rv-tabs` / `.rv-tab` | `.tab-bar` / `.tab-item` | デザイン統一 |
| `.rv-toggle` / `.rv-toggle-btn` | `.segment` / `.segment__btn` | クラス名・構造統一 |
| `.routine-graph-toggle` / `.routine-graph-btn` | `.segment` / `.segment__btn` | デザイン統一 |

### 4-5. ダークモード

```css
.dark-mode .tab-bar {
  background: var(--color-gray-950);
}

.dark-mode .tab-item.active {
  background: var(--color-gray-800);
  color: var(--color-gray-100);
}

.dark-mode .tab-item__count {
  background: var(--color-gray-800);
  color: var(--color-gray-400);
}

.dark-mode .segment {
  background: var(--color-gray-950);
}

.dark-mode .segment__btn.active {
  background: var(--color-gray-800);
  color: var(--color-gray-100);
}
```

---

## 5. モーダル統一

### 5-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | 用途 | 表示位置 | 特徴 |
|---|---------|-------|------|---------|------|
| 1 | `.modal-overlay` / `.modal-content` | style.css L2536-2569 | 汎用入力モーダル | 画面上部中央 | 半透明オーバーレイ、slideDown |
| 2 | `.bottom-sheet-modal` | style.css L2762-2786 | 設定の入力モーダル(ボトムシート型) | 画面下部 | slideUp、角丸上部のみ |
| 3 | `.inline-input-modal` | style.css L2789-2833 | インライン入力型 | 対象要素の直下 | overlay不使用、float |
| 4 | `.toast-input-modal` | style.css L2836-2890 | トースト入力型 | 画面下部 | 角丸pill、compact |
| 5 | `.confirm-overlay` / `.confirm-modal` | style.css L4504-4559 | 確認ダイアログ | 画面中央 | 小サイズ、2ボタン |
| 6 | `.field-help-overlay` | style.css L2710-2759 | フィールドヘルプ | 画面中央 | テキスト表示のみ |
| 7 | `.pattern-select-modal` | style.css L6530-6691 | パターン選択 | 画面中央 | リスト選択UI |
| 8 | テーマ/フォント/遷移モーダル | style.css L3408-3748 | 設定選択 | 設定により変動 | ラジオボタンリスト |
| 9 | `.routine-edit-modal` | style.css L5580-5637 | ルーティン編集 | 画面中央 | フォーム入力 |
| 10 | `.schedule-add-modal` | style.css L8131-8134 | スケジュール追加 | 画面中央 | 時刻入力 |

### 5-2. 参照アプリ比較

| アプリ | モーダル種類 | 共通パターン |
|--------|------------|------------|
| **Todoist** | タスク追加（ボトムシート）、確認（アラート） | 2パターン。入力系はボトムシート、確認系はアラート |
| **Notion** | コマンドパレット（上部）、プロパティ編集（右パネル） | 全てが同一のオーバーレイ+白パネル構造 |
| **Apple Reminders** | アクションシート（下部）、アラート（中央） | iOS標準の2パターンのみ |

### 5-3. 統一パターン設計

**統一先: 1基本パターン + 3修飾子**

モーダルの「表示位置」は設定で切り替え可能な機能が既にあるため（center/bottom/inline/toast）、CSSクラス構造だけ統一する。

#### 基本パターン: `.modal`（共通構造）

```css
/* === 統一モーダル基盤 === */

/* オーバーレイ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
  overflow-y: auto;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* コンテンツ（デフォルト: 中央表示） */
.modal {
  background: var(--bg-main);
  color: var(--text-primary);
  border-radius: var(--radius-xl);
  padding: 20px;
  width: 94%;
  max-width: 500px;
  margin: 40px auto;
  transform: translateY(-10px);
  transition: transform var(--transition-normal);
}

.modal-overlay.active .modal {
  transform: translateY(0);
}

/* ヘッダー */
.modal__title {
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-gray-200);
}

/* 入力 */
.modal__input {
  background: var(--bg-gray);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: 15px;
  width: 100%;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.modal__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.15);
}

.modal__input--textarea {
  min-height: 200px;
  resize: vertical;
}

/* ボタン行 */
.modal__buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.modal__btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-xl);
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: opacity var(--transition-fast);
}

.modal__btn:active {
  opacity: 0.8;
}

.modal__btn--primary {
  background: var(--primary);
  color: white;
}

.modal__btn--cancel {
  background: var(--color-gray-200);
  color: var(--color-gray-700);
}

.modal__btn--danger {
  background: var(--color-red-600);
  color: white;
}
```

#### 修飾子1: `.modal--bottom`（ボトムシート）

```css
.modal--bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: none;
  margin: 0;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  transform: translateY(100%);
  max-height: 80vh;
  overflow-y: auto;
}

.modal-overlay.active .modal--bottom {
  transform: translateY(0);
}
```

#### 修飾子2: `.modal--confirm`（確認ダイアログ）

```css
.modal--confirm {
  max-width: 320px;
  text-align: center;
  padding: 24px;
}

.modal--confirm .modal__title {
  border-bottom: none;
  text-align: center;
  padding-bottom: 0;
}

.modal--confirm .modal__message {
  font-size: 14px;
  color: var(--color-gray-600);
  margin-bottom: 20px;
  line-height: 1.6;
}
```

#### 修飾子3: `.modal--compact`（コンパクト選択）

```css
.modal--compact {
  padding: 12px;
}

.modal--compact .modal__title {
  font-size: 14px;
  margin-bottom: 8px;
  padding-bottom: 8px;
}
```

### 5-4. マイグレーション表

| 旧クラス | 新クラス | 変更内容 |
|---------|---------|---------|
| `.modal-content` | `.modal` | クラス名変更 |
| `.modal-title` | `.modal__title` | BEM記法に |
| `.modal-input` | `.modal__input` | BEM記法に |
| `.modal-buttons` | `.modal__buttons` | BEM記法に |
| `.modal-btn` | `.modal__btn` | BEM記法に |
| `.bottom-sheet-modal` | `.modal .modal--bottom` | 修飾子に |
| `.confirm-modal` | `.modal .modal--confirm` | 修飾子に |
| `.confirm-overlay` | `.modal-overlay`（統合） | 別overlayを廃止 |
| `.field-help-overlay` | `.modal-overlay` + `.modal .modal--compact` | 統合 |
| `.pattern-select-modal` | `.modal`（通常） | デザイン統一 |
| `.routine-edit-modal` | `.modal`（通常） | デザイン統一 |
| `.schedule-add-modal` | `.modal .modal--compact` | デザイン統一 |

### 5-5. ダークモード

```css
.dark-mode .modal {
  background: var(--color-gray-900);
  color: var(--color-gray-100);
}

.dark-mode .modal__title {
  border-color: var(--color-gray-700);
}

.dark-mode .modal__input {
  background: var(--color-gray-800);
  border-color: var(--color-gray-700);
  color: var(--color-gray-100);
}

.dark-mode .modal__btn--cancel {
  background: var(--color-gray-800);
  color: var(--color-gray-300);
}
```

---

## 6. カード統一

### 6-1. 現状の全バリアント一覧

| # | クラス名 | CSS行 | JS使用箇所 (pages.js) | 用途 | 特徴 |
|---|---------|-------|----------------------|------|------|
| 1 | `.card` | style.css L670-684 | (汎用) | 汎用カード | shadow-md、枠線、16pxパディング |
| 2 | `.card-gradient` | style.css L687-698 | (汎用) | グラデーションカード | 枠線なし、白文字 |
| 3 | `.goal-card` | style.css L5134-5166 | pages.js L3141,2659 | 長期目標表示 | 枠線、shadow-card、展開可 |
| 4 | `.progress-card` | style.css L5236-5265 | pages.js L3155 | 月次目標表示 | 枠線、展開可 |
| 5 | `.routine-card-full` | style.css L5364-5375 | pages.js L224,702,2037 | ルーティン詳細カード | 展開可、チェック付き |
| 6 | `.routine-card` | style.css L7340-7390 | pages.js L274 | ルーティンミニカード | タップでチェック切替 |
| 7 | `.action-card` | style.css L769-783 | (ホーム画面内) | アクションカード | gradient背景 |
| 8 | `.life-card` | style.css L1779-1807 | pages.js L2757,2763 | 人生設計カード | 枠線、展開可 |
| 9 | `.task-item` | style.css L9383-9398 | pages.js L581,903 | GTDタスクアイテム | リスト行型、check付き |
| 10 | `.fbox-item` | style.css L9094-9100 | pages.js L529,1311,1387 | F・BOXアイテム | リスト行型、delete付き |
| 11 | `.eval-card` | style.css 内 | pages.js L2400 | 月次評価カード | 展開可 |
| 12 | `.rv-summary-card` | style.css L10671-10677 | pages.js L3462 | 週次サマリーカード | 2px枠線 |
| 13 | `.rv-section` | style.css L10730-10736 | pages.js L3481 | 振り返りセクション | 2px枠線 |
| 14 | `.widget-card` | style.css 内 | pages.js L384,396 | ホームウィジェット | 2列並び |

### 6-2. 参照アプリ比較

| アプリ | カードパターン | 共通原則 |
|--------|-------------|---------|
| **Todoist** | カードなし。全てリスト行 | 枠線・影なし。背景色差だけでグルーピング |
| **Notion** | ブロック1種。paddin+角丸で統一 | 1px border + 8px radius。影なし |
| **Apple Reminders** | グループ化された角丸リスト | 影なし。グループ単位で角丸白背景 |

### 6-3. 統一パターン設計

**統一先: 3パターン**

#### パターンA: `.card`（標準カード）
用途: 目標表示、人生設計、ウィジェット等の「情報表示ブロック」

```css
/* === 統一カード（標準） === */
.card {
  background: var(--bg-main);
  border-radius: var(--radius-xl);
  padding: 16px;
  border: 1px solid var(--color-gray-200);     /* Phase1: var(--border-width) → 1px固定 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);  /* Phase1: shadow-md → 控えめに */
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.card:active {
  transform: scale(0.98);
}

/* 展開状態 */
.card.expanded {
  z-index: 100;
  overflow: visible;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card.expanded:active {
  transform: none;
}
```

#### パターンB: `.card--section`（セクションカード）
用途: 振り返りのサマリー、グラフ枠、レーダーチャート枠（`.rv-summary-card`, `.rv-section`）

```css
.card--section {
  cursor: default;
  border-color: var(--color-gray-300);
}

.card--section:active {
  transform: none;
}

/* セクションタイトル */
.card--section .card__title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-gray-200);
}
```

```html
<!-- Before -->
<div class="rv-summary-card">
  <div class="rv-summary-title">...</div>
</div>
<div class="rv-section">
  <div class="rv-section-title">...</div>
</div>

<!-- After -->
<div class="card card--section">
  <div class="card__title">...</div>
</div>
```

#### パターンC: `.list-item`（リストアイテム）
用途: タスク行、F・BOX行、ルーティン行、資料行等のリスト要素

```css
/* === 統一リストアイテム === */
.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  margin-bottom: 8px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.list-item:active {
  background: var(--color-gray-50);
}

/* 完了状態 */
.list-item.done {
  opacity: 0.6;
}

.list-item.done .list-item__title {
  text-decoration: line-through;
  color: var(--color-gray-400);
}

/* コンテンツ */
.list-item__content {
  flex: 1;
  min-width: 0;
}

.list-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item__sub {
  font-size: 12px;
  color: var(--color-gray-500);
  margin-top: 2px;
}
```

```html
<!-- Before (task-item) -->
<div class="task-item done" onclick="...">
  <div class="task-item-check checked">...</div>
  <div class="task-item-content">
    <div class="task-item-title">...</div>
    <div class="task-item-sub">...</div>
  </div>
  <button class="task-item-delete">...</button>
</div>

<!-- After -->
<div class="list-item done" onclick="...">
  <div class="check check--circle done">...</div>
  <div class="list-item__content">
    <div class="list-item__title">...</div>
    <div class="list-item__sub">...</div>
  </div>
  <button class="delete-btn">...</button>
</div>
```

### 6-4. マイグレーション表

| 旧クラス | 新クラス | 変更内容 |
|---------|---------|---------|
| `.card` | `.card` | 枠線1px固定、影控えめに |
| `.card-gradient` | **廃止** | Phase1のグラデーション廃止方針に準拠 |
| `.goal-card` | `.card` | 統合 |
| `.progress-card` | `.card` | 統合 |
| `.life-card` | `.card` | 統合 |
| `.routine-card-full` | `.card` + 独自展開CSS | 統合 |
| `.routine-card` | `.card` | 統合 |
| `.action-card` | `.card`（gradient廃止） | フラット背景に |
| `.eval-card` | `.card` | 統合 |
| `.rv-summary-card` | `.card .card--section` | 2px→1px枠線 |
| `.rv-section` | `.card .card--section` | 2px→1px枠線 |
| `.widget-card` | `.card` | 統合 |
| `.task-item` | `.list-item` | 構造統一 |
| `.fbox-item` | `.list-item` | 構造統一 |
| `.routine-item` | `.list-item` | 構造統一 |
| `.material-item` | `.list-item` | 構造統一 |

### 6-5. ダークモード

```css
.dark-mode .card {
  background: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.dark-mode .card--section {
  border-color: var(--color-gray-700);
}

.dark-mode .list-item {
  background: var(--color-gray-900);
  border-color: var(--color-gray-800);
}

.dark-mode .list-item:active {
  background: var(--color-gray-800);
}
```

---

## 7. アイコンシステム（残りの絵文字/Unicode → SVG）

### 7-1. 残存する絵文字/Unicode文字の一覧

pages.jsおよびstyle.css内で使用されている非SVGアイコン:

| # | 文字 | 使用箇所 (pages.js) | 用途 | SVG置換案 |
|---|------|-------------------|------|----------|
| 1 | `✓` | L220,226 (statusIcon) | ルーティン完了マーク（ホーム） | `getIcon('check')` — 既に一部で使用済み |
| 2 | `△` | L220,275,1433,1700 | ルーティン半分完了 | 新規SVG `half-check` を追加 |
| 3 | `—` | L583,905 | タスク進行中マーク | 新規SVG `minus` を追加 |
| 4 | `▲` / `▼` | L228,708,982,2041,2405等 | アコーディオン開閉 | `getIcon('chevronUp')` / `getIcon('chevronDown')` — 新規追加 |
| 5 | `📝` | L232 | 前準備アイコン | `getIcon('edit')` |
| 6 | `⚡` | L233 | 反射条件アイコン | `getIcon('zap')` — 既存 |
| 7 | `📋` | L234,713,2046 | 最低限アイコン | `getIcon('list')` — 既存 |
| 8 | `📖` | L236 | マニュアルアイコン | `getIcon('book')` — 既存 |
| 9 | `⏰` | L712,2045 | 条件アイコン | `getIcon('clock')` — 既存 |
| 10 | `⚠️` | L714,2047 | トラブル予想アイコン | `getIcon('alert')` — 新規追加 |
| 11 | `📊` | L793 | 月次振り返りリンク | `getIcon('chart')` — 既存 |
| 12 | `📍` | L1657 | 位置情報リンク | `getIcon('mapPin')` — 新規追加 |
| 13 | `🔀` | L1414 | 振り分けボタン | `getIcon('sort')` — 既存 |
| 14 | `🎤` | L3027 | 音声入力テスト | `getIcon('mic')` — 新規追加 |
| 15 | `○` / `×` | L3539-3541 | 達成表の記号 | SVG不要（テーブルセル内テキストのため） |
| 16 | `✕` | L1989 | ブレイクダウン要因削除 | `getIcon('close')` |

### 7-2. 新規追加すべきSVGアイコン

icons.jsに追加する必要があるアイコン:

```javascript
// icons.js に追加

// 半分完了（三角形）
halfCheck: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5 L20 19 L4 19 Z"/></svg>',

// マイナス（進行中）
minus: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>',

// シェブロン上
chevronUp: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',

// シェブロン下
chevronDown: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',

// 警告（三角形＋！）
alert: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',

// マップピン
mapPin: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',

// マイク
mic: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
```

### 7-3. 絵文字→SVG置換マッピング

| 置換前 | 置換後 | pages.js内の行 |
|--------|-------|---------------|
| `✓`（文字） | `getIcon('check')` | L220,226 — rcチェック表示 |
| `△`（文字） | `getIcon('halfCheck')` | L220,275,1433,1700 — partial表示 |
| `—`（文字） | `getIcon('minus')` | L583,905 — in-progress表示 |
| `▲` / `▼` | `getIcon('chevronUp')` / `getIcon('chevronDown')` | L228,708,982,2041,2405等 |
| `📝` | `getIcon('edit')` | L232 |
| `⚡` | `getIcon('zap')` | L233 |
| `📋` | `getIcon('list')` | L234,713,2046 |
| `📖` | `getIcon('book')` | L236 |
| `⏰` | `getIcon('clock')` | L712,2045 |
| `⚠️` | `getIcon('alert')` | L714,2047 |
| `📊` | `getIcon('chart')` | L793 |
| `📍` | `getIcon('mapPin')` | L1657 |
| `🔀` | `getIcon('sort')` | L1414 |
| `🎤` | `getIcon('mic')` | L3027 |
| `✕`（文字） | `getIcon('close')` | L1989 |
| `×`（文字） | `getIcon('close')` | L2111,2188,2874 — 削除ボタン内 |
| `＋`（文字） | `getIcon('plus')` | L1574 — スコア追加ボタン |

### 7-4. 置換しない文字

| 文字 | 理由 |
|------|------|
| `○` / `△` / `×`（達成表内） | テーブルセル内のテキスト記号。SVG化するとセルサイズが崩れる |
| `←` / `→`（スワイプナビ） | 既にテキストとして機能している。SVGにすると過剰 |
| `&lt;` / `&gt;`（目標ナビ矢印） | テキスト矢印。コンパクトで適切 |

---

## 8. 統一CSS変数参照まとめ（Phase 1トークンとの連携）

Phase 2で使用する全てのPhase 1トークン:

| 用途 | 使用するトークン | Phase 1定義 |
|------|----------------|------------|
| 削除ボタン通常色 | `--color-gray-400` | L1プリミティブ: `#aaa` |
| 削除ボタンアクティブ | `--color-red-600` / `--color-red-50` | L1プリミティブ: `#E53935` / `#fef2f2` |
| チェック完了色 | `--color-green-600` | L1プリミティブ: `#43A047` |
| チェック半分色 | `--color-amber-500` | L1プリミティブ: `#f59e0b` (追加要) |
| チェック進行中色 | `--color-blue-400` | L1プリミティブ: `#4A90D9` |
| 枠線色 | `--color-gray-200` / `--color-gray-300` | L1プリミティブ: `#e8e8e8` / `#d0d0d0` |
| タブ背景 | `--color-gray-100` | L1プリミティブ: `#f5f5f5` |
| タブテキスト | `--color-gray-600` | L1プリミティブ: `#666` |
| カード影 | 直値 `rgba(0,0,0,0.06)` | ハードコード（影はトークン化対象外） |
| ダーク背景 | `--color-gray-900` / `--color-gray-950` | L1プリミティブ: `#222` / `#1a1a1a` |

### Phase 1に追加が必要なトークン

```css
/* Phase 1 トークン基盤に追加要請 */
--color-amber-400: #fbbf24;
--color-amber-500: #f59e0b;
--color-amber-600: #d97706;
```

---

## 9. 実装優先順序（推奨）

| 順序 | カテゴリ | 理由 | 影響範囲 |
|------|---------|------|---------|
| 1 | **削除ボタン** | 13箇所→1パターン。最も数が多く効果大 | CSS 13クラス削除、HTML 14箇所 |
| 2 | **チェックボックス** | 7箇所→2パターン。全画面で使われる最重要部品 | CSS 7クラス削除、HTML 20箇所超 |
| 3 | **FAB/追加ボタン** | 8箇所→2パターン。位置・サイズの統一が視覚的に効く | CSS 8クラス削除、HTML 12箇所 |
| 4 | **アイコンシステム** | 他の部品と同時に進行可能。pages.jsの文字置換 | icons.js 7アイコン追加、pages.js 20箇所 |
| 5 | **タブバー** | 5系統→2パターン。画面ごとに違うタブが統一される | CSS 5系統削除、HTML 8箇所 |
| 6 | **モーダル** | 10種類→1基盤+3修飾子。最も複雑だが影響範囲も最大 | CSS 10クラス統合、app.js連携必要 |
| 7 | **カード** | 14種類→3パターン。ただしレイアウト変更を伴う箇所あり | CSS 14クラス統合、HTML全画面 |

---

## 10. 削除されるCSSの概算

| カテゴリ | 削除対象クラス数 | 推定CSS行数 | 新規CSS行数 |
|---------|---------------|------------|------------|
| 削除ボタン | 14 | ~250行 | ~40行 |
| チェックボックス | 7 | ~180行 | ~60行 |
| FAB/追加ボタン | 8 | ~200行 | ~50行 |
| タブバー | 7系統 | ~300行 | ~80行 |
| モーダル | 10 | ~500行 | ~120行 |
| カード | 14 | ~400行 | ~80行 |
| **合計** | **60+** | **~1,830行削減** | **~430行追加** |

**純削減: 約1,400行**（style.css 10,977行 → 約9,500行）
