# UI刷新 Phase 1: トークン基盤チーム（色＋ボーダー＋グラデーション）

> 作業状況: 設計中...

---

## 参照アプリとの比較

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **色管理** | :rootに74変数あるが、残り~831件のhex + ~132件のrgbaがハードコード | 全色がデザイントークン経由。プリミティブ→セマンティックの2層構造 | CSS変数で完全管理。テーマ切替はCSS変数の値差し替えのみ | セマンティック変数（systemBlue等）で管理。色数を極限まで絞る |
| **ボーダー** | 2px~5pxが100件以上散在。太さがバラバラ | 全て1px以下。区切り線はborder-bottom: 1px solid + 薄い色 | 1px solid rgba(...)のみ。太線は不使用 | 区切り線は0.5pt相当。目に見えないレベルの細さ |
| **グラデーション** | 12件のlinear-gradient使用（ボタン・背景・プログレスバー） | グラデーション不使用。フラットカラーのみ | グラデーション不使用。背景色はsolid color | グラデーション不使用。アクセントカラーはフラット |
| **ダークモード** | body.dark-modeで一部変数上書き。ハードコード色はダーク非対応 | 全色がトークン経由のため完全なダークモード対応 | CSS変数切替で完全対応 | システム設定連動で自動切替 |
| **テーマ** | 6テーマ(blue/green/purple/orange/pink/mono) + 3スタイル(minimal/soft/vivid) | テーマ概念なし（赤一色） | ライト/ダークのみ | システムカラーのみ |

---

## A. 色のCSS変数化設計

### A-1. 現状の既存変数体系（74変数）

```
:root (L13-75)
├── メインカラー: --primary, --primary-dark, --primary-gradient (3)
├── サブカラー: --success, --success-gradient, --danger, --warning (4)
├── 背景・枠: --bg-main, --bg-gray, --bg-light, --bg-secondary, --header-bg, --nav-bg, --border (7)
├── テキスト: --text-primary, --text-secondary, --text-muted, --text-placeholder (4)
├── カテゴリ: --cat-rei, --cat-shin, --cat-gi, --cat-tai, --cat-sei (5)
├── アニメーション: --transition-fast, --transition-normal, --transition-slow (3)
├── フォントサイズ: --label-font-size, --input-font-size, --home-font-size (3)
├── 角丸: --radius-xs ~ --radius-2xl (6)
├── 影: --shadow-card ~ --shadow-xl (5)
└── ボーダー幅: --border-width, --border-width-thick (2)
```

ダークモード上書き(L80-92): 11変数
テーマカラー上書き(L98-204): 各テーマ13変数 x 6テーマ
スタイルテーマ(L211-259): 各スタイル13変数 x 3スタイル

### A-2. 3層トークン構造設計

#### L1: プリミティブトークン（生の色値）

新規追加する :root 変数。全ての色の「元」となるパレット。

```css
:root {
  /* === L1: プリミティブカラー === */

  /* グレースケール */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e8e8e8;
  --color-gray-300: #d0d0d0;
  --color-gray-400: #aaa;
  --color-gray-500: #888;
  --color-gray-600: #666;
  --color-gray-700: #555;
  --color-gray-800: #333;
  --color-gray-900: #222;
  --color-gray-950: #1a1a1a;

  /* ブルー */
  --color-blue-50: #E8F4FD;
  --color-blue-100: #e8f4fd;
  --color-blue-200: #93c5fd;
  --color-blue-300: #60a5fa;
  --color-blue-400: #4A90D9;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1E88E5;
  --color-blue-800: #1e40af;
  --color-blue-900: #1a4694;
  --color-blue-950: #022d6b;

  /* グリーン */
  --color-green-50: #f0fdf4;
  --color-green-100: #dcfce7;
  --color-green-200: #bbf7d0;
  --color-green-300: #4ade80;
  --color-green-400: #22c55e;
  --color-green-500: #16a34a;
  --color-green-600: #43A047;
  --color-green-700: #27ae60;
  --color-green-800: #0f6d31;
  --color-green-900: #024a1f;

  /* レッド */
  --color-red-50: #fef2f2;
  --color-red-100: #fff5f5;
  --color-red-200: #ffe0df;
  --color-red-300: #f87171;
  --color-red-400: #ef4444;
  --color-red-500: #e74c3c;
  --color-red-600: #E53935;
  --color-red-700: #dc2626;
  --color-red-800: #D9534F;
  --color-red-900: #c4342f;

  /* オレンジ / アンバー */
  --color-orange-100: #fffbeb;
  --color-orange-200: #fef3c7;
  --color-orange-300: #FDD835;
  --color-orange-400: #f59e0b;
  --color-orange-500: #F0AD4E;
  --color-orange-600: #FB8C00;
  --color-orange-700: #e67e22;
  --color-orange-800: #d97706;
  --color-orange-900: #b45309;

  /* パープル */
  --color-purple-400: #9b59b6;
  --color-purple-500: #8b5cf6;
  --color-purple-600: #7C6DD8;
  --color-purple-700: #8E24AA;
  --color-purple-800: #6366f1;
  --color-purple-900: #5C4DB8;

  /* ピンク */
  --color-pink-400: #ec4899;
  --color-pink-500: #E91E8C;
  --color-pink-700: #D81B60;

  /* シアン */
  --color-cyan-400: #06b6d4;
  --color-cyan-500: #00ACC1;
  --color-cyan-600: #4A90A4;
  --color-cyan-700: #4A9BB8;

  /* 固定色（テーマ非依存） */
  --color-white: #ffffff;
  --color-black: #000000;
}
```

#### L2: セマンティックトークン（意味ベース）

既存の変数体系を維持しつつ、不足分を追加。

```css
:root {
  /* === L2: セマンティックカラー（追加分） === */

  /* 状態色 */
  --color-status-done: var(--color-green-700);        /* #27ae60 */
  --color-status-progress: var(--color-blue-400);      /* #4A90D9→--primary連動 */
  --color-status-open: var(--color-gray-500);           /* #999 */
  --color-status-warning: var(--color-orange-400);      /* #f59e0b */
  --color-status-error: var(--color-red-800);           /* #D9534F → --danger */

  /* インタラクティブ */
  --color-interactive-border: var(--color-gray-500);    /* チェックボックス等の枠線 */
  --color-interactive-hover: var(--color-gray-100);     /* ホバー背景 */
  --color-interactive-active: rgba(0, 0, 0, 0.05);     /* アクティブ背景 */
  --color-interactive-focus: var(--primary);            /* フォーカスリング */

  /* コンテンツ背景 */
  --color-surface-primary: var(--bg-main);
  --color-surface-secondary: var(--bg-gray);
  --color-surface-tertiary: var(--bg-light);

  /* 区切り線（ボーダー） */
  --color-border-default: var(--border);
  --color-border-light: var(--color-gray-200);
  --color-border-strong: var(--color-gray-800);

  /* ウィジェット固有色 */
  --color-widget-schedule-border: var(--color-blue-900);   /* #1a4694 */
  --color-widget-schedule-bg: rgba(37, 99, 235, 0.12);
  --color-widget-schedule-text: var(--color-blue-800);     /* #1e40af */
  --color-widget-routine-border: var(--color-green-800);   /* #0f6d31 */
  --color-widget-routine-bg: rgba(22, 163, 74, 0.23);
  --color-widget-routine-text: var(--color-green-900);     /* #024a1f */

  /* アクションカード（ベーステーマ） */
  --color-action-border: #D4A87E;
  --color-action-bg: #FCF9F7;
  --color-action-icon: #B8884A;

  /* クイックボタン（ベーステーマ） */
  --color-quick-border: #D4D47E;
  --color-quick-bg: #FCFCF7;
  --color-quick-icon: #A8A84A;

  /* 目標カード（ベーステーマ） */
  --color-goal-border: #7EB8D4;
  --color-goal-bg: #F7FBFC;
  --color-goal-icon: #4A9BB8;

  /* 進捗カード（ベーステーマ） */
  --color-progress-border: #7ED4A8;
  --color-progress-bg: #F7FCF9;

  /* 人生設計カード */
  --color-life-border: #B8B8B8;

  /* 日誌ボタン */
  --color-journal-border: var(--color-gray-900);
  --color-journal-bg: var(--color-white);
  --color-journal-text: var(--color-gray-900);

  /* スケジュール色パレット（JSからも参照） */
  --color-schedule-1: #E53935;
  --color-schedule-2: #FB8C00;
  --color-schedule-3: #FDD835;
  --color-schedule-4: #43A047;
  --color-schedule-5: #00ACC1;
  --color-schedule-6: #1E88E5;
  --color-schedule-7: #5E35B1;
  --color-schedule-8: #D81B60;
  --color-schedule-9: #6D4C41;
  --color-schedule-10: #546E7A;

  /* カレンダー */
  --color-calendar-sun: var(--color-red-700);    /* #dc2626 */
  --color-calendar-sat: var(--color-blue-600);   /* #2563eb */
  --color-calendar-header-bg: var(--color-gray-200); /* #e8e8e8 */

  /* 判断ボタン5色 */
  --color-judgment-continue: #43A047;
  --color-judgment-strengthen: #1E88E5;
  --color-judgment-improve: #FB8C00;
  --color-judgment-reduce: #8E24AA;
  --color-judgment-stop: #E53935;

  /* 優先度バッジ */
  --color-priority-1: var(--color-red-600);
  --color-priority-2: var(--color-orange-600);
  --color-priority-3: var(--color-orange-400);
  --color-priority-4: var(--color-green-400);
  --color-priority-5: var(--color-blue-500);
}

/* ダークモード追加分 */
body.dark-mode {
  --color-interactive-border: var(--color-gray-700);
  --color-interactive-hover: var(--color-gray-800);
  --color-border-light: var(--color-gray-800);
  --color-border-strong: var(--color-gray-400);
  --color-surface-primary: var(--color-gray-950);
  --color-surface-secondary: #2a2a2a;
  --color-surface-tertiary: #242424;
  --color-widget-schedule-border: #3b5998;
  --color-widget-schedule-bg: rgba(59, 130, 246, 0.15);
  --color-widget-routine-border: #2d8a4e;
  --color-widget-routine-bg: rgba(34, 197, 94, 0.15);
  --color-calendar-header-bg: var(--color-gray-900);
  --color-journal-bg: var(--color-gray-950);
  --color-journal-text: var(--color-gray-200);
}
```

#### L3: コンポーネントトークン

L3はセクションB・Cの個別変更内で直接CSS変数として適用するため、独立した定義層としては設けない。セマンティックトークンの参照で十分カバーできる。

### A-3. ハードコード色の変数化計画（CSS: 主要なパターン別）

以下、代表的なハードコードパターンと対応する変数を示す。全831件のhexのうち、:root内の定義（約180件）を除いた**約650件**が変更対象。

#### パターン1: チェックボックス・ステータス色

| 箇所 | 現在のハードコード色 | 置換先変数 |
|------|-------------------|-----------|
| noteview.css L166-167 | `background: #27ae60; border-color: #27ae60;` | `var(--color-status-done)` |
| noteview.css L171-172 | `background: #3498db; border-color: #3498db;` | `var(--color-status-progress)` |
| noteview.css L138 | `border: 2px solid #ccc;` | `border: 1px solid var(--color-interactive-border)` |
| noteview.css L146 | `color: #fff;` | `color: var(--color-white)` |
| noteview.css L246-247 | `border-color: #e74c3c; color: #e74c3c;` | `var(--color-red-500)` |
| noteview.css L257 | `border-color: #555;` | `var(--color-interactive-border)` |
| style.css L5397 | `border: 2px solid #888;` | `border: 1px solid var(--color-interactive-border)` |
| style.css L7177 | `border: 2px solid #888;` | `border: 1px solid var(--color-interactive-border)` |
| style.css L9447 | `border: 2px solid #ccc;` | `border: 1px solid var(--color-border-light)` |
| style.css L9458 | `background: #4caf50; border-color: #4caf50;` | `var(--color-status-done)` |

#### パターン2: 固定的なUI部品色（ボタン等）

| 箇所 | 現在のハードコード色 | 置換先変数 |
|------|-------------------|-----------|
| style.css L1092 | `background: #666;` | `var(--color-gray-600)` |
| style.css L1093 | `color: #fff;` | `var(--color-white)` |
| style.css L1102 | `color: #666;` | `var(--color-gray-600)` |
| style.css L1104 | `border: 1.5px solid #666;` | `border: 1px solid var(--color-gray-600)` |
| style.css L1110 | `background: #666;` | `var(--color-gray-600)` |
| style.css L4729 | `color: #4A7BF7;` | `var(--primary)` |
| style.css L4750 | `color: #8BABFF;` | `var(--primary)` ※ダークモードで自動対応 |

#### パターン3: ウィジェット固有色（スケジュール青系・ルーティン緑系）

| 箇所 | 現在のハードコード色 | 置換先変数 |
|------|-------------------|-----------|
| style.css L6493-6494 | `color: #022d6b; border: 3px solid #1a4694;` | `color: var(--color-widget-schedule-text); border: 1px solid var(--color-widget-schedule-border);` |
| style.css L6496 | `background: rgba(37, 99, 235, 0.12);` | `var(--color-widget-schedule-bg)` |
| style.css L6506 | `border: 3px solid #1a4694;` | `border: 1px solid var(--color-widget-schedule-border)` |
| style.css L6650 | `background: #1a4694;` | `var(--color-widget-schedule-border)` |
| style.css L6678 | `border: 2px solid #1a4694;` | `border: 1px solid var(--color-widget-schedule-border)` |
| style.css L6683 | `color: #1a4694;` | `var(--color-widget-schedule-border)` |
| style.css L6694 | `border: 3px solid #1a4694;` | `border: 1px solid var(--color-widget-schedule-border)` |
| style.css L6700 | `color: #1e40af;` | `var(--color-widget-schedule-text)` |
| style.css L6704 | `color: #1e3a5f;` | `var(--color-widget-schedule-text)` |
| style.css L6712 | `color: #2563EB;` | `var(--color-blue-600)` |
| style.css L6724-6725 | `color: #024a1f; border: 3px solid #0f6d31;` | `color: var(--color-widget-routine-text); border: 1px solid var(--color-widget-routine-border);` |
| style.css L6727 | `background: rgba(22, 163, 74, 0.23);` | `var(--color-widget-routine-bg)` |
| style.css L6743 | `border: 3px solid #0f6d31;` | `border: 1px solid var(--color-widget-routine-border)` |
| style.css L7135 | `background: linear-gradient(90deg, #4ade80, #22c55e);` | `background: var(--color-green-400);` ※フラット化 |
| style.css L7183 | `color: #22c55e;` | `var(--color-green-400)` |
| style.css L7189 | `background: #22c55e; border-color: #22c55e;` | `var(--color-green-400)` |

#### パターン4: カレンダー色

| 箇所 | 現在のハードコード色 | 置換先変数 |
|------|-------------------|-----------|
| style.css L4182 | `background: #e8e8e8;` | `var(--color-calendar-header-bg)` |
| style.css L4189 | `border-bottom: 2px solid #aaa;` | `border-bottom: 1px solid var(--color-gray-400)` |
| style.css L4201 | `color: #dc2626;` | `var(--color-calendar-sun)` |
| style.css L4202 | `color: #2563eb;` | `var(--color-calendar-sat)` |

#### パターン5: ベーステーマ固有色（アクション・クイック・目標・進捗カード）

**制約: ホーム画面と目標一覧のレイアウト・余白・フォントサイズは変更不可。色・影のみ改善可。**

| 箇所 | 現在のハードコード色 | 置換先変数 |
|------|-------------------|-----------|
| style.css L813 | `border: 3px solid #D4D47E;` | `border: 1px solid var(--color-quick-border);` |
| style.css L818 | `background: #ffffff;` | `var(--color-white)` |
| style.css L819 | `box-shadow: 0 0 2px color-mix(in srgb, #D4D47E 42%, black);` | `box-shadow: 0 0 2px color-mix(in srgb, var(--color-quick-border) 42%, black);` |
| style.css L951 | `border: 3px solid #D4D47E;` | `border: 1px solid var(--color-quick-border);` |
| style.css L952 | `background: #FCFCF7;` | `var(--color-quick-bg)` |
| style.css L953 | `box-shadow: 0 0 2px color-mix(in srgb, #D4D47E 42%, black);` | `var(--color-quick-border)` |
| style.css L957 | `color: #A8A84A;` | `var(--color-quick-icon)` |
| style.css L987 | `background: #F7FBFC;` | `var(--color-goal-bg)` |
| style.css L988 | `border: 5px solid #7EB8D4;` | `border: 1px solid var(--color-goal-border);` ※ボーダー統一 |
| style.css L989 | `box-shadow: 0 0 3px color-mix(in srgb, #7EB8D4 20%, black);` | `box-shadow: var(--shadow-sm);` |
| style.css L1200 | `background: #F7FBFC;` | `var(--color-goal-bg)` |
| style.css L1201 | `border: 5px solid #7EB8D4;` | `border: 1px solid var(--color-goal-border);` |
| style.css L1271 | `background: #F7FCF9;` | `var(--color-progress-bg)` |
| style.css L1272 | `border: 5px solid #7ED4A8;` | `border: 1px solid var(--color-progress-border);` |
| style.css L6396 | `background: #FCF9F7;` | `var(--color-action-bg)` |
| style.css L6397 | `border: 3px solid #D4A87E;` | `border: 1px solid var(--color-action-border);` |
| style.css L6405 | `color: #B8884A;` | `var(--color-action-icon)` |

### A-4. JS内ハードコード色の移行設計（32件）

#### 方針
JSからCSSカスタムプロパティを参照するには、以下の方法を使う:
1. **getComputedStyle()経由**: `getComputedStyle(document.documentElement).getPropertyValue('--variable-name')`
2. **data属性経由**: HTML要素にdata属性でカラークラスを設定し、CSSで色を定義
3. **CSS変数を直接インラインスタイルに使用**: `style="color: var(--variable-name)"`

各JSファイルの具体的対応:

#### js/noteview.js L8-39（25件）: data属性 + CSS変数経由

```
ファイル: js/noteview.js L8-17
Before:
const NV_CATEGORIES = {
  urgent:   { label: 'すぐやる', color: '#ef4444' },
  action:   { label: 'アクションリスト', color: '#3498db' },
  project:  { label: 'プロジェクト', color: '#e67e22' },
  waiting:  { label: '待機リスト', color: '#f39c12' },
  calendar: { label: 'カレンダー', color: '#2ecc71' },
  wish:     { label: 'いつかやりたい', color: '#95a5a6' },
  fbox:     { label: 'F・BOX', color: '#e74c3c' },
  routine:  { label: 'ルーティン', color: '#9b59b6' }
};

After:
const NV_CATEGORIES = {
  urgent:   { label: 'すぐやる', color: 'var(--color-gtd-urgent)' },
  action:   { label: 'アクションリスト', color: 'var(--color-gtd-action)' },
  project:  { label: 'プロジェクト', color: 'var(--color-gtd-project)' },
  waiting:  { label: '待機リスト', color: 'var(--color-gtd-waiting)' },
  calendar: { label: 'カレンダー', color: 'var(--color-gtd-calendar)' },
  wish:     { label: 'いつかやりたい', color: 'var(--color-gtd-wish)' },
  fbox:     { label: 'F・BOX', color: 'var(--color-gtd-fbox)' },
  routine:  { label: 'ルーティン', color: 'var(--color-gtd-routine)' }
};

理由: 原則5（CSS変数経由）。colorプロパティにvar()を使えるのはinline style経由のため、
これらの値がstyle属性に設定される箇所で機能する。
CSS側に対応する変数を追加:
  --color-gtd-urgent: #ef4444;
  --color-gtd-action: #3498db;
  --color-gtd-project: #e67e22;
  --color-gtd-waiting: #f39c12;
  --color-gtd-calendar: #2ecc71;
  --color-gtd-wish: #95a5a6;
  --color-gtd-fbox: #e74c3c;
  --color-gtd-routine: #9b59b6;
```

```
ファイル: js/noteview.js L20-26
Before:
const NV_ROUTINE_CATEGORIES = {
  goal:        { label: '目標', color: '#ef4444' },
  obligation:  { label: '義務', color: '#3498db' },
  maintenance: { label: '維持', color: '#2ecc71' },
  principle:   { label: '指針', color: '#f59e0b' },
  candidate:   { label: '候補', color: '#95a5a6' }
};

After:
const NV_ROUTINE_CATEGORIES = {
  goal:        { label: '目標', color: 'var(--color-routine-goal)' },
  obligation:  { label: '義務', color: 'var(--color-routine-obligation)' },
  maintenance: { label: '維持', color: 'var(--color-routine-maintenance)' },
  principle:   { label: '指針', color: 'var(--color-routine-principle)' },
  candidate:   { label: '候補', color: 'var(--color-routine-candidate)' }
};

理由: 原則5（CSS変数経由）
CSS追加:
  --color-routine-goal: #ef4444;
  --color-routine-obligation: #3498db;
  --color-routine-maintenance: #2ecc71;
  --color-routine-principle: #f59e0b;
  --color-routine-candidate: #95a5a6;
```

```
ファイル: js/noteview.js L29-33
Before:
const NV_STATUS = {
  open:        { label: '未着手', icon: '○', color: '#999' },
  in_progress: { label: '進行中', icon: '●', color: '#3498db' },
  done:        { label: '完了',   icon: '✓', color: '#27ae60' }
};

After:
const NV_STATUS = {
  open:        { label: '未着手', icon: '○', color: 'var(--color-status-open)' },
  in_progress: { label: '進行中', icon: '●', color: 'var(--color-status-progress)' },
  done:        { label: '完了',   icon: '✓', color: 'var(--color-status-done)' }
};

理由: 原則5（CSS変数経由）+ ダークモード対応
```

```
ファイル: js/noteview.js L36-39
Before:
const NV_SCOPE = {
  personal: { label: '個人', color: '#8b5cf6' },
  social:   { label: '社会', color: '#06b6d4' }
};

After:
const NV_SCOPE = {
  personal: { label: '個人', color: 'var(--color-scope-personal)' },
  social:   { label: '社会', color: 'var(--color-scope-social)' }
};

理由: 原則5（CSS変数経由）
CSS追加:
  --color-scope-personal: #8b5cf6;
  --color-scope-social: #06b6d4;
```

#### js/app.js L5825-5831（7件）: テーマカラープレビュー

```
ファイル: js/app.js L5824-5831
Before:
    const themes = [
      { id: null, name: 'ベース', color: '#888888' },
      { id: 'blue', name: 'ブルー', color: '#4A90D9' },
      { id: 'green', name: 'グリーン', color: '#5CB85C' },
      { id: 'purple', name: 'パープル', color: '#7C6DD8' },
      { id: 'orange', name: 'オレンジ', color: '#F5A623' },
      { id: 'pink', name: 'ピンク', color: '#E91E8C' },
      { id: 'mono', name: 'モノクロ', color: '#555555' }
    ];

After: 変更なし（例外として維持）

理由: これはテーマ選択UIのプレビュー表示用の定数であり、
テーマ切替前に各テーマの色を見せる目的。CSSテーマクラスが適用される前に
色を表示する必要があるため、ハードコードが適切。
ただし、各色値がCSS :root と一致していることをコメントで明記する。
```

#### js/app.js L3750-3751（2件）: チャート色

```
ファイル: js/app.js L3750-3751
Before:
    if (rateCanvas) this.drawLineSVG(rateCanvas, labels, rateData, 100, '%', '#4A90A4');
    if (scoreCanvas) this.drawLineSVG(scoreCanvas, labels, scoreData, 5, '', '#E67E22');

After:
    const cs = getComputedStyle(document.documentElement);
    const chartColorRate = cs.getPropertyValue('--color-chart-rate').trim() || '#4A90A4';
    const chartColorScore = cs.getPropertyValue('--color-chart-score').trim() || '#E67E22';
    if (rateCanvas) this.drawLineSVG(rateCanvas, labels, rateData, 100, '%', chartColorRate);
    if (scoreCanvas) this.drawLineSVG(scoreCanvas, labels, scoreData, 5, '', chartColorScore);

理由: 原則5（CSS変数経由）。SVG描画ではvar()が使えないためgetComputedStyleで取得。
CSS追加:
  --color-chart-rate: #4A90A4;
  --color-chart-score: #E67E22;
```

#### js/app.js L4830, L5240（2件）: スケジュール色パレット

```
ファイル: js/app.js L4830
Before:
    const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60', '#6D4C41', '#546E7A'];

After:
    const cs = getComputedStyle(document.documentElement);
    const colors = Array.from({length: 10}, (_, i) =>
      cs.getPropertyValue(`--color-schedule-${i + 1}`).trim()
    ).filter(Boolean);
    if (colors.length === 0) colors.push('#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60', '#6D4C41', '#546E7A');

理由: 原則5（CSS変数経由）。フォールバック付きでCSS変数から色パレットを取得。
```

```
ファイル: js/app.js L5240
Before:
    const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60'];

After:
    const cs = getComputedStyle(document.documentElement);
    const colors = Array.from({length: 8}, (_, i) =>
      cs.getPropertyValue(`--color-schedule-${i + 1}`).trim()
    ).filter(Boolean);
    if (colors.length === 0) colors.push('#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60');

理由: 同上
```

#### js/pages.js L1237-1253（16件）: F-BOX振り分け結果色

```
ファイル: js/pages.js L1237-1253
Before:
      const resultMap = {
        'discard': { icon: 'trash', label: '不要（捨てました）', color: '#999', nav: false },
        'someday': { icon: 'star', label: 'いつかやりたいリスト', color: '#f59e0b', nav: true },
        'reference': { icon: 'file', label: '資料保管', color: '#6366f1', nav: true },
        'goal-routine': { icon: 'target', label: '目標ルーティン', color: '#ef4444', nav: true },
        'duty-routine': { icon: 'flag', label: '義務ルーティン', color: '#ef4444', nav: true },
        'maintain-routine': { icon: 'help', label: '維持ルーティン', color: '#ef4444', nav: true },
        'principle-routine': { icon: 'star', label: '指針ルーティン', color: '#ef4444', nav: true },
        'candidate-routine': { icon: 'clock', label: '候補ルーティン', color: '#999', nav: true },
        'project': { icon: 'task', label: 'プロジェクトリスト', color: '#3b82f6', nav: true },
        'do-now': { icon: 'check', label: 'では今やってみましょう！', color: '#22c55e', nav: false },
        'waiting': { icon: 'clock', label: '待機リスト', color: '#f59e0b', nav: true },
        'calendar': { icon: 'calendar', label: 'カレンダー', color: '#ec4899', nav: true },
        'urgent': { icon: 'zap', label: 'すぐやるリスト', color: '#ef4444', nav: true },
        'action': { icon: 'forward', label: 'アクションリスト', color: '#3b82f6', nav: true }
      };

After:
      const resultMap = {
        'discard': { icon: 'trash', label: '不要（捨てました）', color: 'var(--color-status-open)', nav: false },
        'someday': { icon: 'star', label: 'いつかやりたいリスト', color: 'var(--color-gtd-waiting)', nav: true },
        'reference': { icon: 'file', label: '資料保管', color: 'var(--color-purple-800)', nav: true },
        'goal-routine': { icon: 'target', label: '目標ルーティン', color: 'var(--color-red-400)', nav: true },
        'duty-routine': { icon: 'flag', label: '義務ルーティン', color: 'var(--color-red-400)', nav: true },
        'maintain-routine': { icon: 'help', label: '維持ルーティン', color: 'var(--color-red-400)', nav: true },
        'principle-routine': { icon: 'star', label: '指針ルーティン', color: 'var(--color-red-400)', nav: true },
        'candidate-routine': { icon: 'clock', label: '候補ルーティン', color: 'var(--color-status-open)', nav: true },
        'project': { icon: 'task', label: 'プロジェクトリスト', color: 'var(--color-blue-500)', nav: true },
        'do-now': { icon: 'check', label: 'では今やってみましょう！', color: 'var(--color-green-400)', nav: false },
        'waiting': { icon: 'clock', label: '待機リスト', color: 'var(--color-gtd-waiting)', nav: true },
        'calendar': { icon: 'calendar', label: 'カレンダー', color: 'var(--color-pink-400)', nav: true },
        'urgent': { icon: 'zap', label: 'すぐやるリスト', color: 'var(--color-red-400)', nav: true },
        'action': { icon: 'forward', label: 'アクションリスト', color: 'var(--color-blue-500)', nav: true }
      };

理由: 原則5（CSS変数経由）。これらはstyle属性のcolorに設定されるため var() が使える。
```

#### js/pages.js L252-253（SVGインライン色）

```
ファイル: js/pages.js L252-253
Before:
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="8"

After:
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border-light)" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-green-400)" stroke-width="8"

理由: インラインSVGではvar()が使える。原則5（CSS変数経由）。
```

#### js/pages.js L332-334, L357, L372（スケジュールウィジェットインライン色）

```
ファイル: js/pages.js L332-334
Before:
        const bgColor = (slot.color || '#4A90A4') + '18';
        ...
            style="background: ${bgColor}; border-left: 3px solid ${slot.color || '#4A90A4'}">

After:
        const bgColor = (slot.color || 'var(--color-cyan-600)') + '18';
        ...
            style="background: ${bgColor}; border-left: 1px solid ${slot.color || 'var(--color-cyan-600)'}">

理由: slot.colorはユーザー設定色のため完全な変数化は不可。フォールバック値のみ変数化。
ただし、slot.colorがhex値の場合 + '18' で透過度を付加するパターンは
CSS変数と互換性がない（var()に文字列結合できない）。
→ 代替案: slot.colorが設定されている場合はそのまま使い、
  未設定時のみCSS変数を使う。hex + '18' パターンは現状維持。

最終After:
        const fallbackColor = '#4A90A4';
        const slotColor = slot.color || fallbackColor;
        const bgColor = slotColor + '18';
        ...
            style="background: ${bgColor}; border-left: 1px solid ${slotColor}">

理由: slot.colorはユーザーが色ピッカーで選んだhex値であり、
CSS変数化の対象外。フォールバック値は定数として残す。border幅は1pxに変更。
```

```
ファイル: js/pages.js L357
Before:
                style="left: ${left}%; width: ${width}%; background: ${slot.color || '#4A90A4'}">

After:
                style="left: ${left}%; width: ${width}%; background: ${slot.color || '#4A90A4'}">

理由: 同上。ユーザー設定色のフォールバック。変更なし。
```

```
ファイル: js/pages.js L372
Before:
            <span class="schedule-simple-dot" style="background: ${slot.color || '#4A90A4'}"></span>

After:
            <span class="schedule-simple-dot" style="background: ${slot.color || '#4A90A4'}"></span>

理由: 同上。変更なし。
```

#### js/pages.js L982（インラインstyle色）

```
ファイル: js/pages.js L982
Before:
    return `...
      <p style="padding:20px;color:#999;">資料が見つかりません</p>
    ...`;

After:
    return `...
      <p style="padding:20px;color:var(--text-muted);">資料が見つかりません</p>
    ...`;

理由: 原則5（CSS変数経由）。既存のテキスト変数を使用。
```

---

## B. ボーダー統一設計

### B-1. 分類基準

- **1pxに統一**: UIの区切り・枠線として使われているもの（デザイン原則1適用）
- **装飾目的で例外**: CSSで図形を描画しているもの（矢印・三角形等）
- **var(--border-width)に統一**: 既にCSS変数を参照しているが2pxの値になっているもの

### B-2. 全変更箇所（Before/After）

#### カテゴリ1: `2px solid var(--border)` → `1px solid var(--border)` （27件）

```
ファイル: css/style.css L612
Before: border-bottom: 2px solid var(--border);
After:  border-bottom: 1px solid var(--border);
理由: デザイン原則1（ボーダー最大1px）。ヘッダー下線。Todoistは1px以下の区切り線。

ファイル: css/style.css L774
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。アクションカード枠線。

ファイル: css/style.css L1370
Before: border-top: 2px solid var(--border);
After:  border-top: 1px solid var(--border);
理由: デザイン原則1。ナビバー上線。

ファイル: css/style.css L1398
Before: border-top: 2px solid var(--border);
After:  border-top: 1px solid var(--border);
理由: デザイン原則1。ホーム固定ボトム上線。

ファイル: css/style.css L2473
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L2815
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L2876
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L2895
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L2908
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L2939
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3038
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3167
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3198
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3264
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3277
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3294
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3323
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L3939
Before: border-bottom: 2px solid var(--border);
After:  border-bottom: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L5642
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。ルーティン評価カード枠線。

ファイル: css/style.css L5751
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L5949
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。期限行。

ファイル: css/style.css L6039
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。スケジュール入力。

ファイル: css/style.css L7362
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。ルーティンカードチェック。

ファイル: css/style.css L7816
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。曜日ボタン。

ファイル: css/style.css L8019
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。優先度ボタン。

ファイル: css/style.css L8309
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。目標メニューアイテム。

ファイル: css/style.css L8373
Before: border: 2px solid var(--border);
After:  border: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L10501
Before: border: 2px solid var(--border, #ddd);
After:  border: 1px solid var(--border, #ddd);
理由: デザイン原則1。月次振り返りボタン。
```

#### カテゴリ2: `2px solid var(--primary)` → `1px solid var(--primary)` （6件）

```
ファイル: css/style.css L1641
Before: border: 2px solid var(--primary);
After:  border: 1px solid var(--primary);
理由: デザイン原則1。タスクチェックボックス。

ファイル: css/style.css L1822
Before: border: 2px solid var(--primary);
After:  border: 1px solid var(--primary);
理由: デザイン原則1。展開テキストエリア。

ファイル: css/style.css L3701
Before: border: 2px solid var(--primary);
After:  border: 1px solid var(--primary);
理由: デザイン原則1。フォントモーダルオプション。

ファイル: css/style.css L3919
Before: border-bottom: 2px solid var(--primary);
After:  border-bottom: 1px solid var(--primary);
理由: デザイン原則1。インライン編集入力。

ファイル: css/style.css L7580
Before: border: 2px solid var(--primary);
After:  border: 1px solid var(--primary);
理由: デザイン原則1。スタイルオプションactive。

ファイル: css/style.css L7914
Before: border: 2px solid var(--primary);
After:  border: 1px solid var(--primary);
理由: デザイン原則1。ヘルプボタン。
```

#### カテゴリ3: `2px+ solid #ハードコード色` → `1px solid var(--変数)` （太ボーダー＋色変数化同時）

```
ファイル: css/style.css L813
Before: border: 3px solid #D4D47E;
After:  border: 1px solid var(--color-quick-border);
理由: デザイン原則1 + 原則5。クイックボタンfieldset。

ファイル: css/style.css L951
Before: border: 3px solid #D4D47E;
After:  border: 1px solid var(--color-quick-border);
理由: デザイン原則1 + 原則5。ホーム画面クイックボタン。

ファイル: css/style.css L988
Before: border: 5px solid #7EB8D4;
After:  border: 1px solid var(--color-goal-border);
理由: デザイン原則1 + 原則5。ホーム画面目標カード。

ファイル: css/style.css L1201
Before: border: 5px solid #7EB8D4;
After:  border: 1px solid var(--color-goal-border);
理由: デザイン原則1 + 原則5。長期目標カード。

ファイル: css/style.css L1272
Before: border: 5px solid #7ED4A8;
After:  border: 1px solid var(--color-progress-border);
理由: デザイン原則1 + 原則5。進捗カード。

ファイル: css/style.css L1703
Before: border-left: 4px solid var(--warning);
After:  border-left: 1px solid var(--warning);
理由: デザイン原則1。現在のアクションハイライト。
※ ただし左ボーダーによるアクセントは3pxまで許容する提案あり。
→ 最終判断: 1pxに統一（デザイン原則厳守）

ファイル: css/style.css L1781
Before: border: 5px solid #B8B8B8;
After:  border: 1px solid var(--color-life-border);
理由: デザイン原則1 + 原則5。人生設計カード。

ファイル: css/style.css L2190
Before: border: 2px dashed #93c5fd;
After:  border: 1px dashed var(--color-blue-200);
理由: デザイン原則1 + 原則5。追加ボタン。

ファイル: css/style.css L3339
Before: border: 2px solid #333;
After:  border: 1px solid var(--color-gray-800);
理由: デザイン原則1 + 原則5。図形アイコン。

ファイル: css/style.css L3386
Before: border: 2px solid #333;
After:  border: 1px solid var(--color-gray-800);
理由: デザイン原則1 + 原則5。バケツアイコン。

ファイル: css/style.css L3398
Before: border: 2px solid #333;
After:  border: 1px solid var(--color-gray-800);
理由: デザイン原則1 + 原則5。バケツアイコン上部。

ファイル: css/style.css L3444
Before: border: 3px solid #888;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。テーマモーダルボタン。

ファイル: css/style.css L3619
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。フォントサイズステップ。

ファイル: css/style.css L4103
Before: border-top: 2px solid #ddd;
After:  border-top: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。日サマリー。

ファイル: css/style.css L4189
Before: border-bottom: 2px solid #aaa;
After:  border-bottom: 1px solid var(--color-gray-400);
理由: デザイン原則1 + 原則5。カレンダーヘッダー。

ファイル: css/style.css L4291
Before: border-top: 2px solid #ccc;
After:  border-top: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。ドラム値。

ファイル: css/style.css L4292
Before: border-bottom: 2px solid #ccc;
After:  border-bottom: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。ドラム値。

ファイル: css/style.css L4309
Before: border: 2px solid var(--primary, #4A90A4);
After:  border: 1px solid var(--primary, #4A90A4);
理由: デザイン原則1。ドラムUI今日ボタン。

ファイル: css/style.css L4384
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。ピッカーカード。

ファイル: css/style.css L5374
Before: border: 2px solid #d97706;
After:  border: 1px solid var(--color-orange-800);
理由: デザイン原則1 + 原則5。ルーティンタスクカード。

ファイル: css/style.css L5397
Before: border: 2px solid #888;
After:  border: 1px solid var(--color-interactive-border);
理由: デザイン原則1 + 原則5。ルーティンチェック。

ファイル: css/style.css L5614
Before: border-top: 2px solid #999;
After:  border-top: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。区切り線。

ファイル: css/style.css L5625
Before: border: 2px solid #888;
After:  border: 1px solid var(--color-interactive-border);
理由: デザイン原則1 + 原則5。ルーティン編集入力。

ファイル: css/style.css L6397
Before: border: 3px solid #D4A87E;
After:  border: 1px solid var(--color-action-border);
理由: デザイン原則1 + 原則5。アクションカード大。

ファイル: css/style.css L6442
Before: border: 3px solid transparent;
After:  border: 1px solid transparent;
理由: デザイン原則1。アクション行。

ファイル: css/style.css L6494
Before: border: 3px solid #1a4694;
After:  border: 1px solid var(--color-widget-schedule-border);
理由: デザイン原則1 + 原則5。スケジュールウィジェットヘッダー。

ファイル: css/style.css L6506
Before: border: 3px solid #1a4694;
After:  border: 1px solid var(--color-widget-schedule-border);
理由: デザイン原則1 + 原則5。スケジュールパターンバー。

ファイル: css/style.css L6678
Before: border: 2px solid #1a4694;
After:  border: 1px solid var(--color-widget-schedule-border);
理由: デザイン原則1 + 原則5。パターン選択管理ボタン。

ファイル: css/style.css L6694
Before: border: 3px solid #1a4694;
After:  border: 1px solid var(--color-widget-schedule-border);
理由: デザイン原則1 + 原則5。スケジュールウィジェットコンテンツ。

ファイル: css/style.css L6725
Before: border: 3px solid #0f6d31;
After:  border: 1px solid var(--color-widget-routine-border);
理由: デザイン原則1 + 原則5。ルーティンウィジェットヘッダー。

ファイル: css/style.css L6743
Before: border: 3px solid #0f6d31;
After:  border: 1px solid var(--color-widget-routine-border);
理由: デザイン原則1 + 原則5。ルーティンプログレスバーラップ。

ファイル: css/style.css L6778
Before: border-width: 2px;
After:  border-width: 1px;
理由: デザイン原則1。

ファイル: css/style.css L6922
Before: border-bottom: 3px solid var(--border);
After:  border-bottom: 1px solid var(--border);
理由: デザイン原則1。

ファイル: css/style.css L6931
Before: border: 2px solid currentColor;
After:  border: 1px solid currentColor;
理由: デザイン原則1。

ファイル: css/style.css L7177
Before: border: 2px solid #888;
After:  border: 1px solid var(--color-interactive-border);
理由: デザイン原則1 + 原則5。ルーティンチェック。

ファイル: css/style.css L7212
Before: border: 2px dashed var(--border);
After:  border: 1px dashed var(--border);
理由: デザイン原則1。

ファイル: css/style.css L7661
Before: border: 2px solid transparent;
After:  border: 1px solid transparent;
理由: デザイン原則1。スケジュール色ドット。

ファイル: css/style.css L8199
Before: border: 2px solid #888;
After:  border: 1px solid var(--color-interactive-border);
理由: デザイン原則1 + 原則5。パターンボタン。

ファイル: css/style.css L8515
Before: border: 3px solid #222;
After:  border: 1px solid var(--color-journal-border);
理由: デザイン原則1 + 原則5。日誌ボタン。

ファイル: css/style.css L8651
Before: border: 3px solid #222;
After:  border: 1px solid var(--color-journal-border);
理由: デザイン原則1 + 原則5。F-BOXボタン。

ファイル: css/style.css L8719
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。F-BOXテキストエリア。

ファイル: css/style.css L8765
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L8849
Before: border: 1.5px solid var(--primary, #667eea);
After:  border: 1px solid var(--primary, #667eea);
理由: デザイン原則1。F-BOX編集ボタン。

ファイル: css/style.css L8927
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。F-BOX入力。

ファイル: css/style.css L9111
Before: border-left: 3px solid var(--primary, #4f46e5);
After:  border-left: 1px solid var(--primary, #4f46e5);
理由: デザイン原則1。F-BOXアイテム左ボーダー。

ファイル: css/style.css L9195
Before: border: 2px solid #bbf7d0;
After:  border: 1px solid var(--color-green-200);
理由: デザイン原則1 + 原則5。整理するボタン。

ファイル: css/style.css L9271
Before: border-bottom: 2px solid #ddd;
After:  border-bottom: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。GTDタブバー。

ファイル: css/style.css L9447
Before: border: 2px solid #ccc;
After:  border: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。タスクチェック。

ファイル: css/style.css L10676
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。サマリーカード。

ファイル: css/style.css L10735
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。セクション。

ファイル: css/style.css L10742
Before: border-bottom: 2px solid #999;
After:  border-bottom: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。セクションタイトル。

ファイル: css/style.css L10762
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L10773
Before: border-bottom: 1.5px solid #aaa;
After:  border-bottom: 1px solid var(--color-gray-400);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L10799
Before: border-bottom: 1.5px solid #aaa;
After:  border-bottom: 1px solid var(--color-gray-400);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L10811
Before: border-bottom: 1.5px solid #aaa;
After:  border-bottom: 1px solid var(--color-gray-400);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L10836
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。

ファイル: css/style.css L10902
Before: border: 2px solid #999;
After:  border: 1px solid var(--color-gray-500);
理由: デザイン原則1 + 原則5。リンクアイテム。
```

#### カテゴリ4: 装飾目的で例外とするもの（CSSで図形を描画）

```
ファイル: css/style.css L2416
Before: border: 6px solid transparent;
After:  維持（変更なし）
理由: ツールチップの矢印をCSS borderで描画。border幅が矢印の大きさを決めるため例外。

ファイル: css/style.css L3357-3359
Before:
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 16px solid #333;
After:  維持（変更なし）。色のみ変数化:
  border-bottom: 16px solid var(--color-gray-800);
理由: CSS border三角形パターンで矢印アイコンを描画。幅は図形サイズのため例外。
色のみ原則5に従い変数化。

ファイル: css/style.css L3367-3369
Before:
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 16px solid #333;
After:  維持（変更なし）。色のみ変数化:
  border-bottom: 16px solid var(--color-gray-800);
理由: 同上。三角形アイコン。

ファイル: css/style.css L9282
Before: border-bottom: 3px solid transparent;
After:  維持（変更なし）
理由: GTDタブのアクティブインジケーター。borderの太さがデザインの一部（タブの下線強調）。
→ ただし、2pxに変更しても視覚的に十分機能する。
最終判断: 1pxに統一は不自然なため例外。2pxに変更:
After: border-bottom: 2px solid transparent;
※ 例外的に2pxを許容（タブインジケーターとして最小限の太さ）
→ デザイン原則1の厳格適用に基づき、最終的に1pxとする:
After: border-bottom: 1px solid transparent;
理由: デザイン原則1厳守。
```

#### カテゴリ5: noteview.css のボーダー

```
ファイル: css/noteview.css L54
Before: border-bottom: 2px solid var(--border, #d0d0d0);
After:  border-bottom: 1px solid var(--border, #d0d0d0);
理由: デザイン原則1。グループ区切り線。

ファイル: css/noteview.css L138
Before: border: 2px solid #ccc;
After:  border: 1px solid var(--color-gray-300);
理由: デザイン原則1 + 原則5。チェックボックス。
```

#### カテゴリ6: CSS変数定義内の --border-width-thick

```
ファイル: css/style.css L74
Before: --border-width-thick: 2px;
After:  --border-width-thick: 1px;
理由: デザイン原則1。ルート変数自体を1pxに変更。

ファイル: css/style.css L241
Before: --border-width-thick: 1.5px;
After:  --border-width-thick: 1px;
理由: デザイン原則1。.style-softテーマ。

ファイル: css/style.css L258
Before: --border-width-thick: 2px;
After:  --border-width-thick: 1px;
理由: デザイン原則1。.style-vividテーマ。
```

#### カテゴリ7: 1.5px → 1px

```
ファイル: css/style.css L1104
Before: border: 1.5px solid #666;
After:  border: 1px solid var(--color-gray-600);
理由: デザイン原則1 + 原則5。outlineボタン。
```

---

## C. グラデーション処理設計

### C-1. 分類基準

- **フラットに置換**: ボタン・バッジ・プログレスバー等で単色に置き換えられるもの
- **CSS変数化して維持**: 背景として意味のあるもの（ダークモード切替等で値を変える必要があるもの）

### C-2. 全12件の変更（Before/After）

```
ファイル: css/style.css L930
コンテキスト: .home-content .action-area 背景
Before: background: linear-gradient(to right, rgba(37, 99, 235, 0.10) 50%, rgba(22, 163, 74, 0.10) 50%);
After:  background: var(--bg-main);
理由: デザイン原則2（グラデーション廃止）。アクションエリアの背景を分割グラデーションで
左右に色分けしている。Notionのようにフラットな単色背景に統一。
テーマ適用時は .theme-* .home-content .action-area で上書き済み(L6468-6480)。
```

```
ファイル: css/style.css L964
コンテキスト: .quick-btn.quick-btn-cancel 背景（キャンセルモーダル表示中）
Before: background: linear-gradient(135deg, #fff5f5 0%, #ffe0df 100%) !important;
After:  background: var(--color-red-100) !important;
理由: デザイン原則2（グラデーション廃止）+ 原則5（CSS変数経由）。
キャンセル状態を示すために薄い赤背景があれば十分。
```

```
ファイル: css/style.css L1387
コンテキスト: .home-fixed-top 背景（「今やること」エリア）
Before: background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
After:  background: var(--primary);
理由: デザイン原則2（グラデーション廃止）+ 原則5（CSS変数経由）。
ホーム固定トップエリアをテーマカラーのフラットカラーに。
テーマ切替にも自動対応する。
```

```
ファイル: css/style.css L4727
コンテキスト: .home-cal-btn 背景（カレンダーボタン）
Before: background: linear-gradient(145deg, #F8F9FF 0%, #EEF2FF 50%, #E8EEFF 100%);
After:  background: var(--bg-light);
理由: デザイン原則2（グラデーション廃止）。
微妙なグラデーションだが、フラットカラーで十分機能する。
Apple Reminders方式の控えめな背景色に統一。
```

```
ファイル: css/style.css L4747
コンテキスト: .dark-mode .home-cal-btn 背景
Before: background: linear-gradient(145deg, #1a1a1a 0%, #1f2447 50%, #1d224a 100%);
After:  background: var(--bg-light);
理由: デザイン原則2（グラデーション廃止）。ダークモードでもフラットカラー。
--bg-lightがダークモードで #242424 に上書きされるため自動対応。
```

```
ファイル: css/style.css L7135
コンテキスト: .routine-progress-fill 背景（プログレスバー）
Before: background: linear-gradient(90deg, #4ade80, #22c55e);
After:  background: var(--color-green-400);
理由: デザイン原則2（グラデーション廃止）+ 原則5（CSS変数経由）。
Todoistのプログレスバーも単色。視認性はフラットカラーで十分。
```

```
ファイル: css/style.css L8517
コンテキスト: .journal-btn-simple 背景（日誌ボタン）
Before: background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%);
After:  background: var(--color-white);
理由: デザイン原則2（グラデーション廃止）。
立体感を影(box-shadow)で表現し、背景はフラットに。
```

```
ファイル: css/style.css L8537
コンテキスト: .journal-btn-simple:hover 背景
Before: background: linear-gradient(180deg, #fff 0%, #e8e8e8 100%);
After:  background: var(--color-gray-100);
理由: デザイン原則2（グラデーション廃止）+ 原則5。
```

```
ファイル: css/style.css L8545
コンテキスト: .journal-btn-simple:active 背景
Before: background: linear-gradient(180deg, #e8e8e8 0%, #f0f0f0 100%);
After:  background: var(--color-gray-200);
理由: デザイン原則2（グラデーション廃止）+ 原則5。
```

```
ファイル: css/style.css L8653
コンテキスト: .firstbox-btn 背景（F-BOXボタン）
Before: background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%);
After:  background: var(--color-white);
理由: デザイン原則2（グラデーション廃止）。日誌ボタンと同一パターン。
```

```
ファイル: css/style.css L8994
コンテキスト: .fbox-bottom-btn 背景（F-BOX下部ボタン）
Before: background: linear-gradient(135deg, #4A90D9 0%, #5BA0E9 100%);
After:  background: var(--primary);
理由: デザイン原則2（グラデーション廃止）+ 原則5。
テーマカラーのフラットボタンに統一。Todoist方式。
```

```
ファイル: css/style.css L9016
コンテキスト: .dark-mode .fbox-bottom-btn 背景
Before: background: linear-gradient(135deg, #5BA0E9 0%, #4A90D9 100%);
After:  background: var(--primary);
理由: デザイン原則2（グラデーション廃止）+ 原則5。
ダークモードでも--primaryは適切な色値に上書きされるため自動対応。
```

### C-3. CSS変数定義内の --primary-gradient / --success-gradient

グラデーション廃止に伴い、以下の変数は**非推奨**とする:
- `--primary-gradient` (L17, L102, L120, L138, L156, L174, L192)
- `--success-gradient` (L21, L104, L122, L140, L158, L176, L194)

ただし、`.card-gradient` コンポーネント(L687-710)がこれらを参照しているため、
即座に削除はせず、Phase 2以降で`.card-gradient`自体を廃止する際に合わせて削除する。

現段階では:
```
ファイル: css/style.css L687-710
Before:
.card-gradient {
  border: none;
  color: white;
}
.card-gradient.purple {
  background: var(--primary-gradient);
}
.card-gradient.green {
  background: var(--success-gradient);
}

After:
.card-gradient {
  border: none;
  color: white;
}
.card-gradient.purple {
  background: var(--primary);
}
.card-gradient.green {
  background: var(--success);
}

理由: デザイン原則2（グラデーション廃止）。グラデーション変数の参照をフラット変数に変更。
```

---

## 実装順序の提案

1. **Step 1**: :rootにL1プリミティブトークン + L2セマンティックトークンを追加（CSS変数定義のみ、既存コードに影響なし）
2. **Step 2**: --border-width-thick を全て1pxに変更（3箇所）
3. **Step 3**: ボーダー統一（カテゴリ1→2→3→5→6→7の順で進行。カテゴリ4は除外）
4. **Step 4**: グラデーション12件をフラットに置換
5. **Step 5**: ハードコード色をCSS変数に置換（パターン1→2→3→4→5の順）
6. **Step 6**: JS内ハードコード色をCSS変数経由に移行
7. **Step 7**: noteview.css のハードコード色をCSS変数化

各Stepの後にQAサイクルで動作確認。

---

## 変更件数サマリー

| カテゴリ | 件数 |
|---------|------|
| ボーダー 2px→1px (var(--border)) | 27件 |
| ボーダー 2px→1px (var(--primary)) | 6件 |
| ボーダー 2px+→1px (ハードコード色同時変数化) | 55件 |
| ボーダー 装飾例外（色のみ変数化） | 3件 |
| ボーダー CSS変数定義の値変更 | 3件 |
| noteview.css ボーダー | 2件 |
| グラデーション → フラット | 12件 |
| グラデーション CSS変数参照変更 | 2件 |
| CSS新規変数定義（L1 + L2） | ~80変数 |
| CSS色ハードコード変数化（主要パターン） | ~650件（段階的対応） |
| JS色ハードコード変数化 | 32件 |

> 作業状況: 完了
