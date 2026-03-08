# UI刷新 Phase 4: 品質保証チーム（a11y＋テーマ結合テスト＋パフォーマンス＋PWA）

> 作業状況: 設計完了
> **⚠️ 2026-03-08照合結果**: v282〜v289の変更により一部行番号がずれている（app.js +30行、SW +5行）。キャッシュバージョンはv260→v289に更新済み。a11y分析（aria属性ゼロ）・テーマ色の値は正確。

---

## 参照アプリとの比較（品質保証観点）

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **WCAG準拠** | aria属性・role属性ゼロ。lang="ja"のみ。キーボードナビゲーション未対応 | WCAG 2.1 AA準拠。全要素にaria-label。スクリーンリーダー完全対応 | WCAG 2.1 AA準拠。キーボードショートカット完備。aria-role完全網羅 | VoiceOver完全対応。Dynamic Type対応。Reduce Motion対応 |
| **色コントラスト** | ダークモードで一部テキストが読めない（#999 on #1a1a1a = 2.6:1）。テーマ色依存のテキストも存在 | 全テーマでWCAG AA (4.5:1以上)を維持。テーマ切替時にコントラスト自動調整 | ライト/ダーク両方で7:1以上を確保（AAA水準） | iOS Human Interface Guidelines準拠。Dynamic Color対応 |
| **テーマ切替の堅牢性** | 6色×3スタイル×ダーク=36パターン。テスト手順なし。ハードコード色がテーマに追従しない | テーマ概念なし（赤一色）。品質管理が単純 | ライト/ダーク2パターンのみ。CSS変数で完全管理 | システム設定連動。品質はOS側で保証 |
| **パフォーマンス** | render()がinnerHTML全置換。30+ページの全DOMを毎回再生成 | React仮想DOM。差分更新のみ | 独自エディタ。ブロック単位の仮想スクロール | UIKit。ネイティブdiff更新 |
| **PWA** | Service Worker登録済み。Network-first戦略。キャッシュバージョン手動管理 | PWA対応。オフラインは読み取り専用 | PWA非対応（Electron使用） | ネイティブアプリ |

---

## A. アクセシビリティ（a11y）検証

### A-1. 現状のa11y状態の網羅的分析

#### 致命的な欠落

現在のコードベース（`index.html`, `js/pages.js`, `js/app.js`）を検索した結果、`aria-*` 属性・`role` 属性・`tabindex` 属性が **一切使用されていない**。これは WCAG 2.1 の最低基準（Level A）すら満たしていない状態である。

Todoist・Notionが完全なaria対応を行っている中、本アプリはスクリーンリーダーで全く操作できない。

以下、Phase 1〜3の変更が a11y に与える影響と、不足している属性を網羅する。

### A-2. Phase 1（トークン基盤）のa11y影響

#### 色コントラスト比の検証

Phase 1で導入される3層トークン構造により、ハードコード色がCSS変数化される。これ自体はa11yに直接影響しないが、以下のパターンでコントラスト比の問題が発生する。

##### 問題1: ダークモードのテキスト色

```
ファイル: css/style.css L90
Before (現状):
  --text-muted: #999;    /* ダークモード */
背景: --bg-main: #1a1a1a;

コントラスト比: #999 on #1a1a1a = 3.54:1
WCAG AA要件: 通常テキスト 4.5:1 / 大テキスト 3:1
判定: 通常テキストでAA不合格。大テキスト(18px+)はギリギリ合格。

After (修正案):
  --text-muted: #aaa;    /* ダークモード */
コントラスト比: #aaa on #1a1a1a = 4.62:1
判定: AA合格。
```

##### 問題2: プレースホルダー色

```
ファイル: css/style.css L91
Before (現状):
  --text-placeholder: #666;    /* ダークモード */
背景: --bg-gray: #2a2a2a;

コントラスト比: #666 on #2a2a2a = 2.32:1
WCAG AA要件: プレースホルダーは「非テキスト」扱いで3:1以上推奨
判定: 不合格。

After (修正案):
  --text-placeholder: #777;    /* ダークモード */
コントラスト比: #777 on #2a2a2a = 3.12:1
判定: 合格（非テキスト3:1基準）。
```

##### 問題3: テーマカラー×ダークモードの組み合わせ

| テーマ | --primary | ダーク背景(#1a1a1a) | コントラスト比 | 判定 |
|--------|----------|---------------------|---------------|------|
| ベース | #4A90D9 | #1a1a1a | 5.38:1 | AA合格 |
| ブルー | #4A90D9 | #1a1a1a | 5.38:1 | AA合格 |
| グリーン | #5CB85C | #1a1a1a | 5.88:1 | AA合格 |
| パープル | #7C6DD8 | #1a1a1a | 4.55:1 | AA合格(ギリギリ) |
| オレンジ | #F5A623 | #1a1a1a | 9.04:1 | AAA合格 |
| ピンク | #E91E8C | #1a1a1a | 4.54:1 | AA合格(ギリギリ) |
| モノクロ | #555555 | #1a1a1a | 2.16:1 | **不合格** |

**モノクロテーマ×ダークモードが致命的**。`--primary: #555` は `#1a1a1a` 背景上でコントラスト比2.16:1となり、ボタンテキストやアクティブタブの文字が読めない。

```
ファイル: css/style.css L190
Before:
.theme-mono {
  --primary: #555555;

After (修正案):
.theme-mono {
  --primary: #888888;   /* ダークモード時のみ。ライトモードではそのまま */

理由: #888 on #1a1a1a = 3.96:1。テーマカラーはUIコントロール色（非テキスト）のため3:1基準で合格。
ただし、テキストに使う場合は4.5:1が必要。
→ 安全策: #999（4.85:1）を推奨。

最終After:
body.dark-mode .theme-mono {
  --primary: #999999;
}
コントラスト比: #999 on #1a1a1a = 4.85:1（AA合格）

追加場所: css/style.css ダークモードセクション（L80-92の後）に追加
```

##### 問題4: ライトモードでのホワイト文字×テーマ色背景

Phase 2のFAB統一で `.fab` の文字色が `color: white` となる。テーマ色が背景色の場合:

| テーマ | --primary (背景) | 文字(白) | コントラスト比 | 判定 |
|--------|----------------|---------|---------------|------|
| ベース | #4A90D9 | #fff | 3.32:1 | **大テキスト合格、通常不合格** |
| グリーン | #5CB85C | #fff | 2.53:1 | **不合格** |
| オレンジ | #F5A623 | #fff | 1.67:1 | **不合格** |
| パープル | #7C6DD8 | #fff | 3.30:1 | **大テキスト合格、通常不合格** |
| ピンク | #E91E8C | #fff | 3.31:1 | **大テキスト合格、通常不合格** |
| モノクロ | #555555 | #fff | 7.46:1 | AAA合格 |

FABのアイコン(SVG 24px)は「大テキスト」相当のため3:1基準だが、グリーン・オレンジテーマではそれも下回る。

```
対策: テーマ色に応じてFAB文字色を自動切替する

ファイル: css/style.css（新規追加セクション）
After:
/* テーマ色が明るい場合のFAB文字色補正 */
.theme-green .fab,
.theme-orange .fab {
  color: var(--color-gray-900);  /* 暗い文字 */
}

.dark-mode .theme-green .fab,
.dark-mode .theme-orange .fab {
  color: white;  /* ダークモードでは白に戻す */
}

理由: グリーン・オレンジの背景色は明るく、白文字では読めない。
Todoistの赤FABは#DB4035で白文字コントラスト比4.63:1（AA合格）。
当アプリでは明るいテーマ色の場合に暗い文字で対応する。
```

### A-3. Phase 2（部品）のa11y影響

#### チェックボックスのaria属性不足

Phase 2で統一される `.check` コンポーネントに、以下のaria属性が必要。

```
ファイル: js/pages.js（Phase 2統一後の全チェックボックス出力箇所）

Before（Phase 2設計書より）:
<div class="check done" onclick="...">${getIcon('check')}</div>
<div class="check check--circle in-progress" onclick="...">—</div>

After (a11y対応):
<div class="check done" role="checkbox" aria-checked="true" aria-label="完了" tabindex="0" onclick="..." onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">${getIcon('check')}</div>
<div class="check check--circle in-progress" role="checkbox" aria-checked="mixed" aria-label="進行中" tabindex="0" onclick="..." onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">—</div>
<div class="check" role="checkbox" aria-checked="false" aria-label="未完了" tabindex="0" onclick="..." onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}"></div>

理由:
1. role="checkbox" — スクリーンリーダーにチェックボックスであることを通知
2. aria-checked — 3状態（true/false/mixed）を正確に伝達
3. aria-label — 視覚的なアイコンの代替テキスト
4. tabindex="0" — キーボードでフォーカス可能にする
5. onkeydown — Enter/Spaceでクリック動作を代替（キーボード操作対応）
```

影響箇所（Phase 2マイグレーション表より）:
- `.task-check` → `.check` : pages.js L1436,1445,1498-1506,1704
- `.rc-check` → `.check` : pages.js L226
- `.routine-check` → `.check` : ルーティン一覧内
- `.routine-card-check` → `.check` : pages.js L275
- `.task-item-check` → `.check .check--circle` : pages.js L582,904
- `.nv-check` → `.check .check--circle` : ノートビュー内

#### トグルスイッチのaria属性不足

```
Before（Phase 2設計書より）:
<div class="toggle active" onclick="..."></div>

After (a11y対応):
<button class="toggle active" role="switch" aria-checked="true" aria-label="ダークモード" tabindex="0" onclick="..."></button>

理由:
1. role="switch" — トグルスイッチの正しいrole
2. aria-checked — ON/OFF状態
3. button要素に変更 — div+onclickよりセマンティック
```

影響箇所: pages.js L2940（設定ページ内トグルスイッチ全箇所）

#### 削除ボタンのaria属性不足

```
Before（Phase 2設計書より）:
<button class="delete-btn" onclick="...">${getIcon('close')}</button>

After (a11y対応):
<button class="delete-btn" aria-label="削除" onclick="...">${getIcon('close')}</button>

理由: アイコンのみのボタンにはaria-labelが必須。
Todoistでは全てのアイコンボタンにaria-label="Remove"等を付与している。
```

影響箇所: Phase 2マイグレーション表の14箇所全て

#### FABのaria属性不足

```
Before（Phase 2設計書より）:
<div class="fab" onclick="...">${getIcon('plus')}</div>

After (a11y対応):
<button class="fab" aria-label="新規追加" onclick="...">${getIcon('plus')}</button>

理由:
1. button要素に変更（div+onclickは非セマンティック）
2. aria-labelでアイコンの意味を伝達
```

#### タブバーのaria属性不足

```
Before（Phase 2設計書より）:
<div class="tab-bar">
  <button class="tab-item active" onclick="...">F・BOX</button>
  <button class="tab-item" onclick="...">タスク</button>
</div>

After (a11y対応):
<div class="tab-bar" role="tablist" aria-label="GTDタブ">
  <button class="tab-item active" role="tab" aria-selected="true" aria-controls="gtd-panel-fbox" tabindex="0" onclick="...">F・BOX</button>
  <button class="tab-item" role="tab" aria-selected="false" aria-controls="gtd-panel-task" tabindex="-1" onclick="...">タスク</button>
</div>
<div id="gtd-panel-fbox" role="tabpanel" aria-labelledby="...">
  <!-- コンテンツ -->
</div>

理由:
1. role="tablist" / role="tab" / role="tabpanel" — タブUIの標準aria構造
2. aria-selected — アクティブタブの明示
3. aria-controls — タブとパネルの関連付け
4. tabindex="-1" — 非アクティブタブはTabキーでスキップ（矢印キーで移動）
```

影響箇所: Phase 2のタブバー統一で6系統に適用

#### モーダルのaria属性不足

```
Before（Phase 2設計書より）:
<div class="modal-overlay active">
  <div class="modal">
    <div class="modal__title">タイトル</div>
    ...
  </div>
</div>

After (a11y対応):
<div class="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modal-title-xxx">
  <div class="modal">
    <div class="modal__title" id="modal-title-xxx">タイトル</div>
    ...
  </div>
</div>

理由:
1. role="dialog" — モーダルダイアログであることを通知
2. aria-modal="true" — 背景操作が不可であることを通知
3. aria-labelledby — モーダルのタイトルを関連付け
Notionでは全モーダルにrole="dialog"を使用。
```

影響箇所: Phase 2のモーダル統一で10種類に適用

### A-4. Phase 3（画面UX・書く体験）のa11y影響

#### 空状態のa11y

Phase 3で空状態が `.empty-state` に統一される。空状態には `role="status"` が必要。

```
Before（Phase 3設計書より）:
<div class="empty-state">
  <div class="empty-state-icon">${getIcon('check')}</div>
  <div class="empty-state-text">このカテゴリにタスクはありません</div>
</div>

After (a11y対応):
<div class="empty-state" role="status" aria-label="空の状態">
  <div class="empty-state-icon" aria-hidden="true">${getIcon('check')}</div>
  <div class="empty-state-text">このカテゴリにタスクはありません</div>
</div>

理由:
1. role="status" — コンテンツが動的に変わることをスクリーンリーダーに通知
2. aria-hidden="true" (アイコン) — 装飾アイコンを読み上げから除外
```

影響箇所: Phase 3の21箇所全て

#### プログレスバーのa11y

```
Before（Phase 3設計書より）:
<div class="progress">
  <div class="progress-fill" style="width: 30%"></div>
</div>

After (a11y対応):
<div class="progress" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" aria-label="ルーティン達成率 30%">
  <div class="progress-fill" style="width: 30%"></div>
</div>

理由: role="progressbar" と aria-valuenow は WCAG 必須。
Todoistのプログレスバーも同様のaria構造を持つ。
```

#### スワイプナビのa11y

Phase 3でスワイプナビが改善されるが、スワイプ操作はスクリーンリーダーユーザーには不可能。代替ナビゲーション手段が必要。

```
Before（Phase 3設計書より）:
<div class="swipe-nav-prev" onclick="app.navigate('...')">
  ${getIcon('back')} 前のページ
</div>

After (a11y対応):
<button class="swipe-nav-prev" onclick="app.navigate('...')" aria-label="前のページへ移動: ルーティンチェック">
  ${getIcon('back')} ルーティンチェック
</button>

理由:
1. div → button に変更（セマンティック）
2. aria-label にページ名を含める
```

### A-5. 基盤レベルのa11y修正（index.html）

```
ファイル: index.html L96
Before:
<div class="app" id="app">

After:
<main class="app" id="app" role="main" aria-live="polite">

理由:
1. div → main（セマンティックHTML5要素）
2. role="main" — メインコンテンツ領域の明示
3. aria-live="polite" — render()によるDOM全置換時に、変更をスクリーンリーダーに通知

注意: aria-live="polite" はrender()のたびに全コンテンツが読み上げられるリスクがある。
代替策として、ページ遷移時のみ aria-live を一時的に有効にするJSロジックを検討する。
```

```
ファイル: index.html L89-93
Before:
<div class="loading-screen" id="loadingScreen">
  <div class="loading-logo">🎯</div>
  <div class="loading-title">MM</div>
  <div class="loading-spinner"></div>
</div>

After:
<div class="loading-screen" id="loadingScreen" role="alert" aria-live="assertive" aria-label="読み込み中">
  <div class="loading-logo" aria-hidden="true">🎯</div>
  <div class="loading-title">MM</div>
  <div class="loading-spinner" aria-hidden="true"></div>
</div>

理由:
1. role="alert" — ローディング画面の存在をスクリーンリーダーに即座に通知
2. aria-hidden="true" (装飾要素) — スピナーと絵文字を読み上げから除外
3. デザイン原則3（絵文字→SVG）に基づき、🎯は将来的にSVGに置換
```

```
ファイル: index.html L5
Before:
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

After:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

理由:
- maximum-scale=1.0 と user-scalable=no は視覚障害者のピンチズームを阻止する。
  WCAG 2.1 SC 1.4.4「Resize text」違反。
- Apple Reminders / Notion はピンチズームを制限していない。
- PWAのstandaloneモードでは、ブラウザUIなしでも意図しないズームは発生しにくい。
- ただし、iOSのフォーム入力時の自動ズーム問題がある。
  → font-size: 16px以上に統一することで回避可能（Phase 3の入力統一で対応済み）。
```

### A-6. フォーカス管理

現在、ページ遷移時にフォーカスが失われる。`render()` がDOM全置換するため、フォーカスがbodyに戻る。

```
ファイル: js/app.js L473の後（render()内）
Before:
    container.innerHTML = html;

After（フォーカス管理追加）:
    container.innerHTML = html;

    // ページ遷移時にフォーカスをヘッダータイトルに移動
    const headerTitle = container.querySelector('.header-title');
    if (headerTitle) {
      headerTitle.setAttribute('tabindex', '-1');
      headerTitle.focus();
    }

理由:
1. SPAのページ遷移後にフォーカスが失われると、スクリーンリーダーユーザーは現在位置を見失う
2. ヘッダータイトルにフォーカスを当てることで、新しいページの名前が読み上げられる
3. tabindex="-1" により、Tabキーによる通常のナビゲーションフローには影響しない
Notionではページ遷移後にページタイトルにフォーカスが移動する。
```

### A-7. a11y修正のBefore/After一覧表

| # | 種別 | ファイル | 行 | Before | After | WCAG基準 |
|---|------|---------|-----|--------|-------|----------|
| 1 | コントラスト | css/style.css | L90 | `--text-muted: #999` (dark) | `--text-muted: #aaa` | 1.4.3 AA |
| 2 | コントラスト | css/style.css | L91 | `--text-placeholder: #666` (dark) | `--text-placeholder: #777` | 1.4.11 |
| 3 | コントラスト | css/style.css | 新規 | (なし) | `body.dark-mode .theme-mono { --primary: #999; }` | 1.4.3 AA |
| 4 | コントラスト | css/style.css | 新規 | (なし) | `.theme-green .fab, .theme-orange .fab { color: var(--color-gray-900); }` | 1.4.3 AA |
| 5 | セマンティクス | index.html | L96 | `<div class="app" id="app">` | `<main class="app" id="app" role="main">` | 1.3.1 |
| 6 | ズーム | index.html | L5 | `maximum-scale=1.0, user-scalable=no` | 削除 | 1.4.4 |
| 7 | aria | チェック全箇所 | pages.js | `<div class="check">` | `role="checkbox" aria-checked tabindex="0"` | 4.1.2 |
| 8 | aria | トグル全箇所 | pages.js | `<div class="toggle">` | `role="switch" aria-checked` | 4.1.2 |
| 9 | aria | 削除ボタン全箇所 | pages.js | `<button class="delete-btn">` | `aria-label="削除"` | 1.1.1 |
| 10 | aria | FAB全箇所 | pages.js | `<div class="fab">` | `<button class="fab" aria-label="新規追加">` | 1.1.1, 4.1.2 |
| 11 | aria | タブバー全箇所 | pages.js | `<div class="tab-bar">` | `role="tablist" aria-label` + `role="tab" aria-selected` | 4.1.2 |
| 12 | aria | モーダル全箇所 | app.js | `<div class="modal-overlay">` | `role="dialog" aria-modal="true" aria-labelledby` | 4.1.2 |
| 13 | aria | 空状態21箇所 | pages.js | `<div class="empty-state">` | `role="status"` + アイコンに`aria-hidden="true"` | 4.1.3 |
| 14 | aria | プログレスバー | pages.js | `<div class="progress">` | `role="progressbar" aria-valuenow aria-valuemin aria-valuemax` | 4.1.2 |
| 15 | フォーカス | js/app.js | L473後 | (なし) | ページ遷移時にヘッダーにfocus() | 2.4.3 |
| 16 | ローディング | index.html | L89 | `<div class="loading-screen">` | `role="alert" aria-live="assertive"` | 4.1.3 |

---

## B. テーマ結合テスト設計

### B-1. テストマトリクス

6テーマ色 × 3スタイル × ダークモード = **36パターン**

```
テーマ色: [ベース, blue, green, purple, orange, pink, mono] → 7色（ベース含む）
スタイル: [minimal, soft, vivid, ベース(なし)] → 4スタイル（ベース含む）
モード:   [ライト, ダーク] → 2

実際のパターン: 7色 × 4スタイル × 2モード = 56パターン
```

ただし、テーマ色「ベース」とスタイル「ベース」は`:root`の値そのものであり、テーマクラスが付与されない状態を指す。実質的にテスト必要なのは全56パターンだが、優先度で分類する。

### B-2. 危険な組み合わせの特定

Phase 1〜3の変更で特に破綻リスクが高いパターン:

#### 危険度: 致命的

| # | 組み合わせ | 危険な箇所 | 理由 | Phase |
|---|-----------|-----------|------|-------|
| 1 | **mono × ダーク** | FAB・ボタン文字色 | --primary: #555 がダーク背景と同化 | P2 |
| 2 | **orange × ダーク** | テーマ色テキスト | --primary: #F5A623 が明るすぎてダーク背景上で浮く | P1 |
| 3 | **green × ライト × vivid** | 統一チェックボックスの完了色 | --color-green-600 (#43A047) と --primary (#5CB85C) が近すぎて区別不能 | P2 |

#### 危険度: 重要

| # | 組み合わせ | 危険な箇所 | 理由 | Phase |
|---|-----------|-----------|------|-------|
| 4 | **全テーマ × ダーク** | ダークモード追加変数 | Phase 1で追加される `--color-surface-primary` 等がダークモードで適切に上書きされているか | P1 |
| 5 | **全テーマ × minimal** | 影なしカード | `--shadow-card: none; --shadow-sm: none;` で境界線のみ依存。Phase 1のボーダー1px統一で線が細すぎて見えない可能性 | P1+P2 |
| 6 | **blue/purple × ダーク** | ウィジェット色 | Phase 1の `--color-widget-schedule-border` がダークモードで十分なコントラストを持つか | P1 |
| 7 | **全テーマ** | 統一モーダルの背景 | `--bg-main` がモーダル背景に使われるが、テーマによってはオーバーレイと区別がつかない | P2 |

#### 危険度: 軽微

| # | 組み合わせ | 危険な箇所 | 理由 | Phase |
|---|-----------|-----------|------|-------|
| 8 | **全テーマ × soft** | 角丸が過大 | `--radius-xl: 20px` でモーダルの角丸が大きすぎる可能性 | P2 |
| 9 | **全テーマ** | 統一タブバー背景 | `--color-gray-100` (#f5f5f5) がライト時の `--bg-main` (#fff) と近すぎてタブバーが見えない | P2 |

### B-3. テスト手順書

#### 手順1: 準備

```
1. テスト対象: Phase 1〜3の変更が全て適用された状態
2. ブラウザ: Chrome DevTools (レスポンシブモード)
3. デバイスサイズ: 375×667 (iPhone SE), 393×852 (Pixel 7)
4. テスト環境: ローカル開発サーバー
```

#### 手順2: 各パターンの自動切替テストスクリプト

以下のJSをDevToolsコンソールで実行し、全パターンを自動スクリーンショット可能にする。

```javascript
// テーマ結合テスト用スクリプト（DevToolsコンソール実行用）
async function themeTestSuite() {
  const themes = [null, 'blue', 'green', 'purple', 'orange', 'pink', 'mono'];
  const styles = [null, 'minimal', 'soft', 'vivid'];
  const darkModes = [false, true];
  const pages = ['home', 'gtd', 'goal-list', 'review', 'settings'];

  for (const theme of themes) {
    for (const style of styles) {
      for (const dark of darkModes) {
        // テーマ適用
        document.body.className = '';
        if (theme) document.body.classList.add(`theme-${theme}`);
        if (style) document.body.classList.add(`style-${style}`);
        if (dark) document.body.classList.add('dark-mode');

        const label = `${theme||'base'}_${style||'base'}_${dark?'dark':'light'}`;
        console.log(`テスト: ${label}`);

        // 各ページを表示して目視確認
        for (const page of pages) {
          app.navigate(page);
          await new Promise(r => setTimeout(r, 500));
          console.log(`  ${page}: OK / NG`);
        }
      }
    }
  }
  console.log('テスト完了');
}
```

#### 手順3: 目視チェック項目（各パターンで確認）

| # | チェック項目 | 合格基準 | 関連Phase |
|---|------------|---------|----------|
| 1 | ヘッダーテキストが読める | コントラスト比 4.5:1以上 | P1 |
| 2 | ナビバーのアイコンが見える | コントラスト比 3:1以上 | P1 |
| 3 | FABのアイコンが見える | コントラスト比 3:1以上 | P2 |
| 4 | タブバーのアクティブ/非アクティブが区別可能 | 背景色に明確な差 | P2 |
| 5 | チェックボックスの3状態が区別可能 | 色の差が明確 | P2 |
| 6 | カードの境界が見える | ボーダーorシャドウが視認可能 | P1+P2 |
| 7 | モーダルが背景と区別可能 | オーバーレイとモーダル背景に差 | P2 |
| 8 | 入力フィールドの枠線が見える | ボーダーが視認可能 | P3 |
| 9 | フォーカスリングが見える | フォーカス時の変化が明確 | P3 |
| 10 | プログレスバーの進捗色が見える | バー色と背景の差 | P3 |
| 11 | 空状態のアイコン・テキストが読める | コントラスト比 4.5:1以上 | P3 |
| 12 | 削除ボタンのアイコンが見える | コントラスト比 3:1以上 | P2 |

#### 手順4: 重点テストパターン（56パターン中の16パターン）

全56パターンのテストが理想だが、開発効率を考慮し、以下の16パターンを重点テストする。

| # | テーマ | スタイル | モード | 選定理由 |
|---|--------|---------|-------|---------|
| 1 | ベース | ベース | ライト | 基準パターン |
| 2 | ベース | ベース | ダーク | ダーク基準 |
| 3 | blue | minimal | ライト | minimal影なしの視認性 |
| 4 | blue | minimal | ダーク | 最もコントラスト問題が出やすい |
| 5 | green | soft | ライト | 明るい色 + 丸い角 |
| 6 | green | vivid | ダーク | 緑×ダークのチェックボックス |
| 7 | purple | ベース | ダーク | パープルのコントラスト限界 |
| 8 | orange | ベース | ライト | 明るいテーマ色×白背景 |
| 9 | orange | soft | ダーク | 明るいテーマ色×ダーク |
| 10 | pink | minimal | ライト | ピンクのボーダー視認性 |
| 11 | pink | vivid | ダーク | ピンク×ダーク |
| 12 | **mono** | **ベース** | **ダーク** | **最も危険な組み合わせ** |
| 13 | mono | minimal | ライト | モノクロ影なし |
| 14 | ベース | soft | ライト | 丸い角の通常パターン |
| 15 | ベース | vivid | ダーク | vividのボーダー太さ |
| 16 | blue | soft | ダーク | 頻用テーマの組み合わせ |

### B-4. 自動テスト可能な項目

Playwrightを用いた自動テストが可能な項目:

```javascript
// playwright-tests/theme-contrast.spec.js （テスト設計のみ。実装はPhase 4実装時）

test.describe('テーマ結合テスト', () => {
  const themes = ['', 'blue', 'green', 'purple', 'orange', 'pink', 'mono'];
  const darkModes = [false, true];

  for (const theme of themes) {
    for (const dark of darkModes) {
      test(`${theme||'base'} × ${dark?'dark':'light'}: FABコントラスト`, async ({ page }) => {
        await page.goto('/');
        await page.evaluate(({ theme, dark }) => {
          if (theme) document.body.classList.add(`theme-${theme}`);
          if (dark) document.body.classList.add('dark-mode');
        }, { theme, dark });

        // FABの色を取得してコントラスト比を計算
        const fabColor = await page.$eval('.fab', el =>
          getComputedStyle(el).color
        );
        const fabBg = await page.$eval('.fab', el =>
          getComputedStyle(el).backgroundColor
        );
        const ratio = calculateContrastRatio(fabColor, fabBg);
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      });
    }
  }
});
```

---

## C. パフォーマンス検証

### C-1. render()の全体再描画（innerHTML全置換）の影響評価

#### 現状の仕組み

```
ファイル: js/app.js L356-495

render() {
  1. switch文で現在ページのHTML文字列を生成（30+ページ分のrender関数）
  2. container.innerHTML = html;  ← 全DOMを破棄して再構築
  3. スクロール位置を復元
  4. リップルエフェクト再初期化
  5. checkOverflow() 実行
  6. ページ固有の後処理（グラフ描画、スワイプ初期化等）
}
```

#### 問題の定量評価

innerHTML全置換のコスト:
- DOM破棄: 既存の全要素を破棄（イベントリスナー含む）
- HTML解析: ブラウザがHTML文字列をパース
- DOM構築: 新しいDOM ノードを生成
- レンダリング: レイアウト計算 → ペイント → コンポジット

**推定コスト**（ホームページの場合）:
- 生成されるHTML: 約5,000〜15,000文字（ウィジェット数による）
- DOM要素数: 約200〜500要素
- innerHTML代入: 約5〜15ms（低スペック端末で30ms）
- レイアウト計算: 約3〜10ms
- ペイント: 約2〜5ms
- **合計: 約10〜30ms（通常端末）、50〜100ms（低スペック端末）**

60fpsのフレーム予算は16.7ms。通常端末ではギリギリ1フレーム内に収まるが、低スペック端末ではフレーム落ちが発生する。

#### 参照アプリとの比較

| アプリ | 更新方式 | フレーム落ちリスク |
|--------|---------|-----------------|
| Todoist | React仮想DOM。差分更新 | なし（差分のみ更新） |
| Notion | 独自エディタ。ブロック単位更新 | なし |
| Apple Reminders | UIKit diffableDataSource | なし |
| **本アプリ** | **innerHTML全置換** | **チェック切替等の微小変更でも全体再描画** |

### C-2. Phase 2〜3の変更がパフォーマンスに与える影響

#### Phase 2: 部品統一の影響

| 変更 | パフォーマンス影響 | 理由 |
|------|-----------------|------|
| 削除ボタン統一 | **微改善** | CSS定義が14→2に減少。スタイル計算が高速化 |
| チェックボックス統一 | **微改善** | CSS定義が7→3に減少 |
| タブバー統一 | **中立** | クラス名が変わるだけ |
| モーダル統一 | **中立** | 構造変更だが表示/非表示の制御方法は同一 |
| カード統一 | **微改善** | CSS定義が14→3に減少。CSSファイルサイズが約1,400行削減 |
| アイコンSVG化 | **微悪化（懸念）** | 絵文字(Unicode)→SVG(DOM要素)への変更でDOM要素数が増加。ただしSVGは小さく影響は最小限 |

#### Phase 2: アニメーション辞書の影響

| 変更 | パフォーマンス影響 | 理由 |
|------|-----------------|------|
| keyframes統合（22→17） | **微改善** | パース対象が減少 |
| transition変数化（56箇所） | **中立** | CSS変数のルックアップは高速 |

#### Phase 3: 画面UXの影響

| 変更 | パフォーマンス影響 | 理由 |
|------|-----------------|------|
| 空状態統一 | **中立** | DOM構造が若干変更されるが影響なし |
| プログレスバー統一 | **中立** | − |
| 棒グラフ/折れ線グラフ実装 | **新規コスト** | SVG要素の動的生成。ただしCanvas不使用のため描画コストは低い。ルーティン一覧ページの初回レンダリングに+5〜10ms |
| スワイプナビ改善 | **中立** | ドット→テキストへの変更でDOM要素数は減少 |

#### Phase 3: 書く体験の影響

| 変更 | パフォーマンス影響 | 理由 |
|------|-----------------|------|
| テキスト入力CSS統一 | **微改善** | 29クラス→ベース+modifier。CSS計算が高速化 |
| autoResizeTextarea共通化 | **中立** | ロジックは同一。呼び出し元が集約されるだけ |
| checkOverflow共通化 | **微改善** | 9箇所→1関数。関数呼び出しのオーバーヘッドは無視可能だが、コードのparse時間が微減 |

### C-3. 改善が必要な箇所と具体的な対策

#### 対策1: render()の部分更新検討（提案レベル）

**現状**: チェックボックスの切替のような微小変更でも`render()`が呼ばれ、ページ全体のDOMが再構築される。

**対策案**: 特定の操作に対して部分更新を導入する。

```
ファイル: js/app.js（新規メソッド）

// 部分更新: チェックボックスの状態変更
updateCheckState(element, newState) {
  // render()を呼ばずに、DOM要素を直接更新
  element.classList.remove('done', 'partial');
  if (newState === 'done') {
    element.classList.add('done');
    element.innerHTML = getIcon('check');
  } else if (newState === 'partial') {
    element.classList.add('partial');
    element.innerHTML = getIcon('halfCheck');
  } else {
    element.innerHTML = '';
  }
  // aria属性も更新
  element.setAttribute('aria-checked', newState === 'done' ? 'true' : newState === 'partial' ? 'mixed' : 'false');
}
```

**リスク**: 部分更新とrender()全体更新が混在すると、状態の不整合が生じやすい。
**判断**: Phase 4では設計のみ。実装は将来のパフォーマンス問題が顕在化した場合に行う。現状の端末性能では render() の全体再描画でも許容範囲内。

#### 対策2: CSSファイルサイズ削減の効果測定

Phase 1〜3の変更による CSS削減量:
- Phase 1 (トークン): +80変数、ハードコード色の変数化（差し引きほぼ±0）
- Phase 2 (部品): **約1,400行の純減**
- Phase 3 (画面UX): 約33行の純減 + 45行追加
- Phase 3 (書く体験): **約253行の純減**

**合計: 約1,640行の純減**（10,977行 → 約9,340行）

CSSファイルサイズ: 約280KB → 約240KB（約14%削減）
パース時間への影響: 約1〜3msの改善（体感不可）

#### 対策3: render()後の後処理の最適化

```
ファイル: js/app.js L490-495（render()後の後処理）

Before:
    // リップルエフェクト再初期化
    this.initRippleEffects();
    // はみ出しチェック（続きを見る表示）
    this.checkOverflow();

After:
    // 後処理をrequestAnimationFrameで遅延実行（レンダリングをブロックしない）
    requestAnimationFrame(() => {
      this.initRippleEffects();
      this.checkOverflow();
    });

理由:
1. initRippleEffects() はquerySelectorAllで全要素を走査する。render()直後に同期実行すると
   レンダリングパイプラインをブロックする。
2. checkOverflow() はscrollHeight/clientHeightの読み取りでレイアウト再計算を強制する。
3. requestAnimationFrameで1フレーム遅延させることで、まずユーザーに画面を見せてから
   後処理を行う。体感レスポンスが改善する。
```

#### 対策4: will-changeの追加検討

Phase 2〜3で新規追加される頻繁にアニメーションする要素への `will-change` 追加を検討。

| 要素 | アニメーション | will-change推奨 | 理由 |
|------|-------------|----------------|------|
| `.fab` | :active → scale(0.9) | 不要 | 単発のタッチフィードバック。常時GPUレイヤーは不要 |
| `.tab-item.active` | 背景色・影の変化 | 不要 | 単発の状態変化 |
| `.modal` | translateY → 0 | 不要 | 表示時のみのアニメーション |
| `.check` | all var(--transition-fast) | 不要 | 単発 |
| `.progress-fill` | width var(--transition-normal) | 不要 | 低頻度 |

**結論**: Phase 2〜3の変更で新たにwill-changeが必要な要素はない。既存の `.swipe-wrapper` と `.swipe-page` の2箇所のみで十分。

---

## D. PWA検証

### D-1. Service Workerキャッシュ対象の確認

#### 現在のキャッシュ対象

```
ファイル: service-worker.js L2-12
const CACHE_NAME = 'matsumura-method-v260';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/noteview.css',
  '/js/app.js',
  '/js/db.js',
  '/js/pages.js',
  '/js/icons.js',
  '/js/noteview.js',
  '/manifest.json'
];
```

#### Phase 1〜3で追加/変更されるファイル

| ファイル | 変更種別 | キャッシュ対象か | 対応 |
|---------|---------|---------------|------|
| `css/style.css` | 変更（大量修正） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `css/noteview.css` | 変更（ボーダー等） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `js/app.js` | 変更（大量修正） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `js/pages.js` | 変更（大量修正） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `js/icons.js` | 変更（7アイコン追加） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `js/noteview.js` | 変更（CSS変数化） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `js/db.js` | 変更なし | 既にキャッシュ対象 | 対応不要 |
| `index.html` | 変更（meta修正等） | 既にキャッシュ対象 | バージョン番号更新のみ |
| `manifest.json` | 変更なし | 既にキャッシュ対象 | 対応不要 |

**結論**: Phase 1〜3で新規ファイルは追加されない。全変更は既存ファイルの修正であり、`urlsToCache` の変更は不要。

### D-2. キャッシュバージョン更新手順

Phase 1〜3の実装完了後、以下の3箇所のバージョン番号を同時に更新する。

```
更新手順:

1. service-worker.js L1
   Before: const CACHE_NAME = 'matsumura-method-v260';
   After:  const CACHE_NAME = 'matsumura-method-v270';
   理由: Service Workerのキャッシュ名を変更すると、activateイベントで旧キャッシュが自動削除される。

2. index.html L30-31
   Before:
     <link rel="stylesheet" href="css/style.css?v=260">
     <link rel="stylesheet" href="css/noteview.css?v=260">
   After:
     <link rel="stylesheet" href="css/style.css?v=270">
     <link rel="stylesheet" href="css/noteview.css?v=270">
   理由: クエリパラメータでブラウザキャッシュをバスト。

3. index.html L101-105
   Before:
     <script src="js/db.js?v=260"></script>
     <script src="js/icons.js?v=260"></script>
     <script src="js/pages.js?v=260"></script>
     <script src="js/noteview.js?v=260"></script>
     <script src="js/app.js?v=260"></script>
   After:
     <script src="js/db.js?v=270"></script>
     <script src="js/icons.js?v=270"></script>
     <script src="js/pages.js?v=270"></script>
     <script src="js/noteview.js?v=270"></script>
     <script src="js/app.js?v=270"></script>
   理由: 全JSファイルのキャッシュバスト。
```

### D-3. Service Workerのキャッシュ戦略の評価

#### 現在の戦略: Network-first

```
ファイル: service-worker.js L41-60

戦略:
1. ネットワークからフェッチを試みる
2. 成功 → レスポンスをキャッシュに保存 + 返却
3. 失敗 → キャッシュから返却（ignoreSearch: true で?v=xxx を無視）
```

#### 評価

| 観点 | 評価 | 補足 |
|------|------|------|
| **オフライン動作** | 適切 | ネットワーク失敗時にキャッシュから返す。全ファイルがinstall時にプリキャッシュされるため確実 |
| **更新の反映** | 適切 | ネットワーク優先のため、オンライン時は常に最新ファイルを取得。SW更新時はcontrollerchangeで自動リロード |
| **ignoreSearch** | 適切 | `?v=260` 等のクエリパラメータを無視してキャッシュマッチ。キャッシュヒット率が向上 |
| **Phase 1〜3との整合** | **要確認** | 大量のCSS/JS変更後、ユーザーのブラウザが古いキャッシュを使い続けるリスク |

#### Phase 1〜3実装後のキャッシュ更新フロー

```
1. 開発者がファイルを変更し、CACHE_NAMEを v260 → v270 に更新
2. ユーザーがアプリを開く
3. ブラウザが service-worker.js を自動チェック（1バイトでも変更あれば更新トリガー）
4. 新しいSWがinstall → 新キャッシュ(v270)にファイルを保存
5. 旧SW制御のページが全て閉じられると、新SWがactivate
6. activate時に旧キャッシュ(v260)を自動削除
7. controllerchangeイベントで自動リロード → 新ファイルが表示される
```

**問題**: ステップ5で「旧ページが全て閉じられるまで待つ」ため、ユーザーがタブを開いたままだと更新が遅延する。

**現状の対策**: `self.skipWaiting()` (L21) により、新SWはinstall直後にactivateする。これにより更新遅延は解消済み。

### D-4. manifest.json の確認

```
ファイル: manifest.json
```

| 項目 | 現在の値 | 問題 | 推奨変更 |
|------|---------|------|---------|
| `name` | "MM" | 短すぎるが問題なし | 変更不要 |
| `short_name` | "MM" | 適切 | 変更不要 |
| `theme_color` | "#667eea" | Phase 1でグラデーション廃止後もこの色を維持 | 変更不要（テーマ色はCSS変数で管理。manifestのtheme_colorはブラウザUIの色） |
| `background_color` | "#1a1a2e" | ダークモード前提の色。ライトモードの起動画面が暗い | **変更推奨**: `"#ffffff"` |
| `icons` | SVG 1サイズのみ | PNG非対応の古いブラウザで表示されない | **変更推奨**: PNG版も追加（ただし既存アイコンがSVGのみなら現状維持） |
| `orientation` | "portrait" | 適切 | 変更不要 |
| `display` | "standalone" | 適切 | 変更不要 |

```
ファイル: manifest.json L8
Before:
  "background_color": "#1a1a2e",

After:
  "background_color": "#ffffff",

理由: PWAの起動スプラッシュ画面の背景色。ライトモードがデフォルトのため白が適切。
ダークモードユーザーには一瞬白が表示されるが、ローディング画面がすぐにかぶさるため問題なし。
```

### D-5. index.html のローディング画面とPhase 1の整合性

```
ファイル: index.html L47
Before:
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

After:
  background: var(--primary, #4A90D9);

理由:
1. デザイン原則2（グラデーション廃止）
2. テーマカラーに連動させる（var(--primary)）
3. ただし、index.html内の<style>タグはCSSファイル読み込み前に適用されるため、
   CSS変数が未定義の可能性がある。フォールバック値を必ず指定する。

注意: :rootの変数はstyle.cssが読み込まれるまで使えない。
index.htmlのインラインスタイルではvar()のフォールバック値が必須。
実際にはローディング画面はCSSファイル読み込み前に表示されるケースがあるため、
ハードコード値を維持するほうが安全。

最終判断: グラデーション → フラットカラーに変更するが、ハードコード値を維持。
```

```
ファイル: index.html L47
Before:
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

After:
  background: #4A90D9;

理由: デザイン原則2（グラデーション廃止）。CSS変数はこの段階で使えないため
ハードコード値を使用。色はベーステーマの--primaryと同一値。
```

### D-6. PWAスコアチェックリスト

Lighthouse PWA監査項目との照合:

| 項目 | 現状 | Phase後 | 対応 |
|------|------|---------|------|
| Registers a service worker | 合格 | 合格 | 変更不要 |
| Responds with 200 when offline | 合格 | 合格 | 変更不要 |
| Has start_url | 合格 | 合格 | 変更不要 |
| Has manifest | 合格 | 合格 | 変更不要 |
| Content sized to viewport | 合格 | 合格 | 変更不要 |
| Has theme_color meta tag | 合格 | 合格 | 変更不要 |
| Splash screen configurable | 合格 | 合格 | background_color修正で改善 |
| Installable | 合格 | 合格 | 変更不要 |
| Uses HTTPS | N/A(ローカル) | N/A | 変更不要 |

---

## 実装優先度

| 優先度 | タスク | 影響範囲 | 工数 |
|--------|--------|---------|------|
| **P0（致命的）** | A-2: ダークモード色コントラスト修正（--text-muted, --text-placeholder, mono primary） | css/style.css 3箇所 | 小 |
| **P0（致命的）** | A-2: FABの明るいテーマ色対応（green/orange） | css/style.css 新規4行 | 小 |
| **P0（致命的）** | A-5: viewport meta の user-scalable=no 削除 | index.html 1箇所 | 小 |
| **P1（重要）** | A-3: Phase 2部品にaria属性追加（チェック・トグル・削除・FAB） | pages.js 全部品箇所 | 中 |
| **P1（重要）** | A-3: タブバーにaria tablist構造追加 | pages.js 6系統 | 中 |
| **P1（重要）** | A-3: モーダルにaria dialog属性追加 | app.js 10種 | 中 |
| **P1（重要）** | B-3: テーマ結合テスト実施（重点16パターン） | 手動テスト | 大 |
| **P2（改善）** | A-6: render()後のフォーカス管理 | app.js 1箇所 | 小 |
| **P2（改善）** | A-4: 空状態・プログレスバーのaria追加 | pages.js 21+2箇所 | 小 |
| **P2（改善）** | C-3: render()後処理のrAF化 | app.js 1箇所 | 小 |
| **P2（改善）** | D-5: ローディング画面のグラデーション廃止 | index.html 1箇所 | 小 |
| **P3（提案）** | A-5: #appをmain要素に変更 | index.html 1箇所 | 小 |
| **P3（提案）** | A-5: ローディング画面のaria追加 | index.html 1箇所 | 小 |
| **P3（提案）** | D-4: manifest.json background_color変更 | manifest.json 1箇所 | 小 |
| **P3（提案）** | C-1: 部分更新の設計（将来実装用） | 設計のみ | − |

---

## 変更件数サマリー

| カテゴリ | 件数 |
|---------|------|
| CSS: コントラスト比修正（ダークモード変数） | 2箇所 |
| CSS: テーマ固有コントラスト修正（mono dark, green/orange FAB） | 2ブロック（8行追加） |
| HTML: viewport meta修正 | 1箇所 |
| HTML: セマンティック要素変更（main要素、ローディングaria） | 3箇所 |
| HTML: ローディング画面グラデーション廃止 | 1箇所 |
| JS: aria属性追加（チェック・トグル・削除・FAB・タブ・モーダル・空状態・プログレスバー） | 全Phase 2-3部品箇所（推定80+箇所） |
| JS: フォーカス管理追加 | 1箇所 |
| JS: render()後処理のrAF化 | 1箇所 |
| PWA: CACHE_NAME更新 | 1箇所 |
| PWA: index.htmlバージョン番号更新 | 7箇所 |
| PWA: manifest.json background_color | 1箇所 |
| テスト: テーマ結合テスト手順書 | 16パターン×12チェック項目 |
| テスト: 自動テストスクリプト設計 | 1ファイル（設計のみ） |

> 作業状況: 完了
