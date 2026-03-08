# UI刷新 Phase 2: 操作・動きチーム（アニメーション＋タッチ＋ジェスチャー）

> 作業開始: 2026-02-26
> ステータス: 設計完了
> **⚠️ 2026-03-08照合結果**: v282〜v289の変更により**行番号は全面的にずれている**（CSS +75〜139行、JS +30〜400行）。実装時は行番号ではなく**keyframes名・クラス名でgrepして特定**すること。致命的な設計ミス（toast-in方向誤認、fh-pop未計上）は修正済み。

---

## 参照アプリとの比較（全体）

| 観点 | 現状 (matsumura-method) | Todoist | Notion | Apple Reminders |
|------|------------------------|---------|--------|-----------------|
| **ページ遷移** | 4種類選択可（fade/slide/scale/push）。各200-250ms。ユーザー設定で切替 | fade 200ms統一。1パターンのみ | アニメーションなし（即時切替）。モバイルはpush遷移のみ | push遷移（iOS標準）。slide-in/out 350ms |
| **@keyframes数** | 22個（重複あり）。用途分散・命名不統一 | 5個以下。最小限 | ほぼ0個。CSS transitionのみで完結 | iOS標準に準拠。独自keyframesは極少 |
| **transition** | 89箇所。うち44箇所がハードコード値（`0.15s ease`等）。変数使用45箇所 | 全てCSS変数経由。`--duration-fast: 100ms`等 | transition統一。200ms ease-out基本 | iOS標準timing。spring animation |
| **タッチ操作** | 5系統（ページスワイプ/メインタブスワイプ/ドラッグナビ/ゴールカードスワイプ/ドラムスクロール） | スワイプは左右のみ（完了/削除）。ページ遷移はタップのみ | スワイプなし。全てタップ操作 | スワイプアクション（削除/フラグ）。バウンスエフェクト |
| **スクロール管理** | 3パターンの位置保存/復元（content.scrollTop直接/\_keepScrollPosition/widget別管理） | 各画面でスクロール位置を自動保存。復元はシームレス | 仮想スクロール。位置は自動管理 | ネイティブUIKit。自動管理 |
| **テキストエリア伸長** | 同一パターンが8箇所にコピペ散在 | autosize統一。1箇所で制御 | 独自エディタ。ブロック単位 | iOS標準TextViewの自動伸長 |

---

## A. アニメーション辞書

### A-1. 現状の全@keyframes一覧（23個）

> **⚠️ 設計書作成後にv287で`fh-pop`が追加されている（当初22個→23個）。行番号は全面的にずれているため参照不可（クラス名で検索すること）。**

| # | 名前 | 定義行 | 使用行 | 用途 | 分類 |
|---|------|--------|--------|------|------|
| 0 | `fh-pop` | L2773付近(実コード) | フィールドヘルプアイコン | フィールドヘルプのポップアニメーション | フィードバック |
| 1 | `cancel-pulse` | L980-983 | L965 | クイックボタンキャンセル状態のパルス | フィードバック |
| 2 | `slideUp` (1) | L2776-2778 | L2773 | ボトムシートモーダルの入場 | 入場 |
| 3 | `fadeInDown` | L2850-2858 | L2847 | トースト入力モーダルの入場 | 入場 |
| 4 | `theme-blink` | L3511-3513 | L3517 | テーマプレビュー中の点滅 | フィードバック |
| 5 | `toast-in` | L3813-3817 | L3805 | トースト通知の入場 | 入場 |
| 6 | `toast-out` | L3820-3824 | L3810 | トースト通知の退場 | 退場 |
| 7 | `daySummarySlideUp` | L4112-4114 | L4110 | 日サマリーの入場 | 入場 |
| 8 | `ripple-anim` | L4573-4577 | L4569 | リップルエフェクト | フィードバック |
| 9 | `fade-in` | L4597-4599 | L4592 | ページ遷移: フェード入場 | ページ遷移 |
| 10 | `fade-out` | L4601-4603 | L4595 | ページ遷移: フェード退場 | ページ遷移 |
| 11 | `slide-in` | L4613-4615 | L4608 | ページ遷移: スライド入場 | ページ遷移 |
| 12 | `slide-out` | L4617-4619 | L4611 | ページ遷移: スライド退場 | ページ遷移 |
| 13 | `scale-in` | L4629-4631 | L4624 | ページ遷移: スケール入場 | ページ遷移 |
| 14 | `scale-out` | L4633-4635 | L4627 | ページ遷移: スケール退場 | ページ遷移 |
| 15 | `push-in` | L4645-4647 | L4640 | ページ遷移: プッシュ入場 | ページ遷移 |
| 16 | `push-out` | L4649-4651 | L4643 | ページ遷移: プッシュ退場 | ページ遷移 |
| 17 | `slide-out-left` | L5111-5119 | L5104 | 目標カード左スライド退場 | 退場 |
| 18 | `slide-out-right` | L5122-5130 | L5108 | 目標カード右スライド退場 | 退場 |
| 19 | `goalSlideLeft` | L5182-5190 | L5172 | 目標カードコンテンツ左入場 | 入場 |
| 20 | `goalSlideRight` | L5193-5201 | L5179 | 目標カードコンテンツ右入場 | 入場 |
| 21 | `fadeIn` | L6545-6547 | L6542 | パターン選択モーダルの入場 | 入場 |
| 22 | `slideUp` (2) | L6561-6568 | L6558 | パターン選択コンテンツの入場 | 入場 |

### A-2. 重複・類似keyframesの分析

#### 重複1: `slideUp` が2つ存在（名前衝突）

```
@keyframes slideUp (L2776-2778):
  to { transform: translateY(0); }
  用途: ボトムシートモーダル

@keyframes slideUp (L6561-6568):
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
  用途: パターン選択コンテンツ
```

**問題**: 同名の@keyframesが2つ存在。CSSの仕様上、後に定義された方（L6561）が優先される。
L2773で使用されている`animation: slideUp 0.3s ease forwards`は、意図した動作（translateY(100%)→0）ではなく、L6561の定義（translateY(20px)→0 + opacity 0→1）が適用される。

**対策**: 名前を分離する。

#### 重複2: `fade-in` と `fadeIn` が類似

```
@keyframes fade-in (L4597): from { opacity: 0; } to { opacity: 1; }
@keyframes fadeIn (L6545): from { opacity: 0; } to { opacity: 1; }
```

**問題**: 完全に同一の内容。命名が異なるだけ。

#### 重複3: `slide-out` と `slide-out-left` が類似

```
@keyframes slide-out (L4617): 0→-100%
@keyframes slide-out-left (L5111): 0→-30% + opacity
```

**分析**: 挙動は異なる（100%移動 vs 30%+フェード）ため統合不可。ただし命名体系を統一すべき。

#### 重複4: `daySummarySlideUp` と `slideUp (2)` が類似

```
@keyframes daySummarySlideUp (L4112): translateY(100%)→0 + opacity 0→1
@keyframes slideUp (2) (L6561): translateY(20px)→0 + opacity 0→1
```

**分析**: 移動距離が異なる（100% vs 20px）。統合可能（パラメータ化は不可だが、距離を20pxに統一して問題なし）。

### A-3. 統一後のアニメーション辞書設計

#### カテゴリ別に整理・統合

**ページ遷移（4ペア = 8個） — 維持**

ユーザー設定で切り替え可能な機能であり、4種類全て維持する。

| 名前 | duration | easing | 用途 | 変更 |
|------|----------|--------|------|------|
| `fade-in` | 200ms | ease-out | ページフェード入場 | 維持 |
| `fade-out` | 150ms | ease-in | ページフェード退場 | 維持 |
| `slide-in` | 250ms | ease-out | ページスライド入場 | 維持 |
| `slide-out` | 200ms | ease-in | ページスライド退場 | 維持 |
| `scale-in` | 200ms | ease-out | ページスケール入場 | 維持 |
| `scale-out` | 150ms | ease-in | ページスケール退場 | 維持 |
| `push-in` | 250ms | ease-out | ページプッシュ入場 | 維持 |
| `push-out` | 250ms | ease-in | ページプッシュ退場 | 維持 |

**入場アニメーション（8個 → 3個に統合）**

> ※ `fh-pop`(v287追加)はフィードバックに分類。`toast-in`は方向分析修正により統合可能に変更。

| 統合前 | 統合後 | duration | easing | 用途 |
|--------|-------|----------|--------|------|
| `slideUp` (1) | `enter-slide-up` | 250ms | cubic-bezier(0.4,0,0.2,1) | ボトムシート入場 |
| `fadeInDown` | `enter-fade-down` | 200ms | ease-out | トースト入力モーダル入場 |
| `daySummarySlideUp` | `enter-slide-up-fade` | 200ms | ease-out | コンテンツ入場（日サマリー、パターン選択コンテンツ） |
| `toast-in` | **`enter-slide-up-fade`** | 300ms | ease-out | トースト入場 ※方向分析修正: 実際はtranslateY(20px)→0で統合可能 |
| `fadeIn` | ~~廃止~~ → `fade-in` を再利用 | 200ms | ease | パターン選択オーバーレイ入場 |
| `slideUp` (2) | `enter-slide-up-fade` | 250ms | ease | パターン選択コンテンツ入場 |
| `goalSlideLeft` | `enter-from-right` | 250ms | ease-out | 目標カードコンテンツ左入場 |
| `goalSlideRight` | `enter-from-left` | 250ms | ease-out | 目標カードコンテンツ右入場 |

**退場アニメーション（4個 → 3個に統合）**

| 統合前 | 統合後 | duration | easing | 用途 |
|--------|-------|----------|--------|------|
| `toast-out` L3820 | `exit-fade-up` | 200ms | ease-in | トースト退場 |
| `slide-out-left` L5111 | `exit-to-left` | 200ms | ease-in | 目標カード左退場 |
| `slide-out-right` L5122 | `exit-to-right` | 200ms | ease-in | 目標カード右退場 |

**フィードバック（4個 → 4個、維持）**

| 名前 | duration | easing | 用途 | 変更 |
|------|----------|--------|------|------|
| `cancel-pulse` | 1.5s | ease-in-out infinite | キャンセル状態パルス | 維持 |
| `theme-blink` | 0.8s | ease-in-out infinite | テーマプレビュー点滅 | 維持 |
| `ripple-anim` | 0.6s | ease-out | リップルエフェクト | 維持 |
| `fh-pop` | (v287追加) | ease-out | フィールドヘルプポップ | 維持 |

### A-4. 統合の具体的な変更（Before/After）

#### 変更1: `slideUp` (1) → `enter-slide-up` に改名

```
ファイル: css/style.css L2776-2778
Before:
@keyframes slideUp {
  to { transform: translateY(0); }
}

After:
@keyframes enter-slide-up {
  to { transform: translateY(0); }
}
理由: 同名keyframesの衝突を解消。用途を明確にする命名に変更。
```

```
ファイル: css/style.css L2773
Before:
  animation: slideUp 0.3s ease forwards;

After:
  animation: enter-slide-up 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
理由: 改名に伴う参照更新。durationをvar(--transition-normal)の250msに近い値に統一。
```

#### 変更2: `fadeInDown` → `enter-fade-down` に改名

```
ファイル: css/style.css L2850-2858
Before:
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

After:
@keyframes enter-fade-down {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
理由: 命名体系の統一（enter-/exit- プレフィックス）。
```

```
ファイル: css/style.css L2847
Before:
  animation: fadeInDown 0.2s ease;

After:
  animation: enter-fade-down 200ms ease-out;
理由: 改名に伴う参照更新。
```

#### 変更3: `daySummarySlideUp` + `slideUp` (2) → `enter-slide-up-fade` に統合

```
ファイル: css/style.css L4112-4114
Before:
@keyframes daySummarySlideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

After: 削除（enter-slide-up-fadeで代替）
```

新規追加（:rootブロック直後、または既存keyframes群の先頭に配置）:

```css
/* === 統一入場アニメーション === */
@keyframes enter-slide-up-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

```
ファイル: css/style.css L4110
Before:
  animation: daySummarySlideUp 0.2s ease;

After:
  animation: enter-slide-up-fade 200ms ease-out;
理由: 統合後のアニメーション名に変更。translateY(100%)→20pxに変更するが、
日サマリーはdisplay:noneから表示されるため、大きな移動距離は不要。
20pxの微妙なスライドの方がNotionライクで上品。
```

#### 変更4: `fadeIn` → `fade-in`（既存）で代替、定義を削除

```
ファイル: css/style.css L6545-6547
Before:
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

After: 削除（fade-inと完全に同一のため）
```

```
ファイル: css/style.css L6542
Before:
  animation: fadeIn 0.2s ease;

After:
  animation: fade-in 200ms ease-out;
理由: 重複定義を廃止。既存のfade-inを再利用。
```

#### 変更5: `slideUp` (2) → `enter-slide-up-fade`（統合済み）で代替、定義を削除

```
ファイル: css/style.css L6561-6568
Before:
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

After: 削除（enter-slide-up-fadeと同一内容のため）
```

```
ファイル: css/style.css L6558
Before:
  animation: slideUp 0.25s ease;

After:
  animation: enter-slide-up-fade 250ms ease-out;
理由: 統合後のアニメーション名に変更。
```

#### 変更6: `toast-in` → `enter-slide-up-fade` で代替

> **⚠️ 設計書作成時の分析に誤りがあった。以下修正済み。**
>
> **誤**: toast-inの初期値は `translateY(-10px)`（上から下へ）→ `enter-slide-up-fade`と方向が逆のため統合不可
> **正**: 実コードの`.toast`初期値は `transform: translateY(20px)`（**下から上へ**）→ `enter-slide-up-fade`と**同方向**のため**統合可能**

```
ファイル: css/style.css L3892付近(実コード)
Before:
@keyframes toast-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
(.toast の初期値: opacity: 0; transform: translateY(20px); → 下から上へスライド)

After: 削除（enter-slide-up-fadeで代替可能。同方向・同パターン）
```

```
ファイル: css/style.css L3884付近(実コード)
Before:
  animation: toast-in 300ms ease forwards;

After:
  animation: enter-slide-up-fade 300ms ease-out forwards;
理由: toast-inの実際の動き（translateY(20px)→0）はenter-slide-up-fadeと同一方向。統合可能。
```

#### 変更7: `toast-out` → `exit-fade-up` に改名

```
ファイル: css/style.css L3820-3824
Before:
@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

After:
@keyframes exit-fade-up {
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
理由: 命名体系統一。
```

```
ファイル: css/style.css L3810
Before:
  animation: toast-out 200ms ease-in forwards;

After:
  animation: exit-fade-up 200ms ease-in forwards;
理由: 改名に伴う参照更新。
```

#### 変更8: `slide-out-left` → `exit-to-left`、`slide-out-right` → `exit-to-right` に改名

```
ファイル: css/style.css L5111-5119
Before:
@keyframes slide-out-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30%); opacity: 0; }
}

After:
@keyframes exit-to-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30%); opacity: 0; }
}
理由: 命名体系統一。
```

```
ファイル: css/style.css L5104
Before:
  animation: slide-out-left 200ms ease-in forwards;

After:
  animation: exit-to-left 200ms ease-in forwards;
理由: 改名に伴う参照更新。
```

```
ファイル: css/style.css L5122-5130
Before:
@keyframes slide-out-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(30%); opacity: 0; }
}

After:
@keyframes exit-to-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(30%); opacity: 0; }
}
理由: 命名体系統一。
```

```
ファイル: css/style.css L5108
Before:
  animation: slide-out-right 200ms ease-in forwards;

After:
  animation: exit-to-right 200ms ease-in forwards;
理由: 改名に伴う参照更新。
```

#### 変更9: `goalSlideLeft` → `enter-from-right`、`goalSlideRight` → `enter-from-left` に改名

```
ファイル: css/style.css L5182-5190
Before:
@keyframes goalSlideLeft {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

After:
@keyframes enter-from-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
理由: 命名体系統一。「goalSlideLeft」は「左にスライドして入る」ではなく「右から入ってくる」なので
enter-from-rightが正確。
```

```
ファイル: css/style.css L5172
Before:
  animation: goalSlideLeft 0.25s ease-out;

After:
  animation: enter-from-right 250ms ease-out;
理由: 改名に伴う参照更新。
```

```
ファイル: css/style.css L5193-5201
Before:
@keyframes goalSlideRight {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

After:
@keyframes enter-from-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
理由: 命名体系統一。
```

```
ファイル: css/style.css L5179
Before:
  animation: goalSlideRight 0.25s ease-out;

After:
  animation: enter-from-left 250ms ease-out;
理由: 改名に伴う参照更新。
```

### A-5. 統合後のアニメーション辞書（最終版）

**統合前: 22個 → 統合後: 17個（5個削減）**

| # | 名前 | 分類 | duration | easing | 用途 |
|---|------|------|----------|--------|------|
| 1 | `fade-in` | ページ遷移 | 200ms | ease-out | フェード入場 |
| 2 | `fade-out` | ページ遷移 | 150ms | ease-in | フェード退場 |
| 3 | `slide-in` | ページ遷移 | 250ms | ease-out | スライド入場 |
| 4 | `slide-out` | ページ遷移 | 200ms | ease-in | スライド退場 |
| 5 | `scale-in` | ページ遷移 | 200ms | ease-out | スケール入場 |
| 6 | `scale-out` | ページ遷移 | 150ms | ease-in | スケール退場 |
| 7 | `push-in` | ページ遷移 | 250ms | ease-out | プッシュ入場 |
| 8 | `push-out` | ページ遷移 | 250ms | ease-in | プッシュ退場 |
| 9 | `enter-slide-up` | 入場 | 250ms | cubic-bezier(0.4,0,0.2,1) | ボトムシート |
| 10 | `enter-fade-down` | 入場 | 200ms | ease-out | トースト入力モーダル |
| 11 | `enter-slide-up-fade` | 入場 | 200-250ms | ease-out | 日サマリー、パターン選択コンテンツ |
| 12 | `enter-from-right` | 入場 | 250ms | ease-out | 目標カード左スワイプ入場 |
| 13 | `enter-from-left` | 入場 | 250ms | ease-out | 目標カード右スワイプ入場 |
| 14 | `toast-in` | 入場 | 300ms | ease-out | トースト通知 |
| 15 | `exit-fade-up` | 退場 | 200ms | ease-in | トースト退場 |
| 16 | `exit-to-left` | 退場 | 200ms | ease-in | 目標カード左退場 |
| 17 | `exit-to-right` | 退場 | 200ms | ease-in | 目標カード右退場 |
| -- | `cancel-pulse` | フィードバック | 1.5s | ease-in-out infinite | キャンセルパルス |
| -- | `theme-blink` | フィードバック | 0.8s | ease-in-out infinite | テーマプレビュー |
| -- | `ripple-anim` | フィードバック | 0.6s | ease-out | リップル |

**命名規則**:
- 入場: `enter-*`（enter-slide-up, enter-fade-down, enter-from-right等）
- 退場: `exit-*`（exit-fade-up, exit-to-left等）
- ページ遷移: 既存名維持（fade-in/out, slide-in/out, scale-in/out, push-in/out）
- フィードバック: 機能名をそのまま使用（cancel-pulse, ripple-anim等）

---

## B. transition標準化

### B-1. 現状の分析

CSS変数定義（css/style.css L48-50）:

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

**使用状況**:
- CSS変数使用: 45箇所（`var(--transition-fast)` 等）
- ハードコード: 44箇所

### B-2. ハードコードtransitionの全洗い出しと変数化計画

#### グループ1: `0.15s ease` → `var(--transition-fast)`（22箇所）

`--transition-fast: 0.15s ease` と完全一致または実質同等。

```
ファイル: css/style.css L1053
Before: transition: background 0.15s ease;
After:  transition: background var(--transition-fast);
理由: --transition-fast (0.15s ease) と完全一致。

ファイル: css/style.css L1078
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L3622
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L6599
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L6619
Before: transition: background 0.15s ease;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L6685
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L6905
Before: transition: background 0.15s ease;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L7159
Before: transition: background 0.15s ease;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L7823
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8527
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8662
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8768
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8791
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8951
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9046
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9112
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9149
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9198
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9250
Before: transition: all 0.15s ease;
After:  transition: all var(--transition-fast);
```

#### グループ2: `0.15s` / `0.15s ease` (easing省略 or プロパティ個別指定) → `var(--transition-fast)` （8箇所）

```
ファイル: css/style.css L7348
Before: transition: all 0.15s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L7415
Before: transition: all 0.15s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8835
Before: transition: background 0.15s;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L8852
Before: transition: all 0.15s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9393
Before: transition: background 0.15s;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L9508
Before: transition: transform 0.15s;
After:  transition: transform var(--transition-fast);

ファイル: css/style.css L9682
Before: transition: background 0.15s;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L9777
Before: transition: transform 0.15s;
After:  transition: transform var(--transition-fast);

ファイル: css/style.css L9842
Before: transition: background 0.15s;
After:  transition: background var(--transition-fast);

ファイル: css/style.css L9954
Before: transition: transform 0.15s;
After:  transition: transform var(--transition-fast);

ファイル: css/style.css L9986
Before: transition: all 0.15s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9001
Before: transition: transform 0.15s, box-shadow 0.15s;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
```

#### グループ3: `0.15s ease` (複合プロパティ) → `var(--transition-fast)` 分解（4箇所）

```
ファイル: css/style.css L2386
Before: transition: transform 0.15s ease, box-shadow 0.15s ease;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

ファイル: css/style.css L2475
Before: transition: transform 0.15s ease, box-shadow 0.15s ease;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

ファイル: css/style.css L6882
Before: transition: transform 0.15s ease, box-shadow 0.15s ease;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

ファイル: css/style.css L6890
Before: transition: transform 0.15s ease, box-shadow 0.15s ease;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

ファイル: css/style.css L7726
Before: transition: transform 0.15s ease, box-shadow 0.15s ease;
After:  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
```

#### グループ4: `0.2s` / `0.2s ease` → `var(--transition-fast)` （9箇所）

0.2sは0.15sに近い速度。--transition-fastに統一して問題なし。
Todoistの基準では100-200msは全て「fast」カテゴリ。

```
ファイル: css/style.css L4731
Before: transition: all 0.2s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L5781
Before: transition: box-shadow 0.2s ease;
After:  transition: box-shadow var(--transition-fast);

ファイル: css/style.css L6362
Before: transition: all 0.2s ease;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L8933
Before: transition: border-color 0.2s ease;
After:  transition: border-color var(--transition-fast);

ファイル: css/style.css L9284
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9340
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9454
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L9630
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L10507
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);

ファイル: css/style.css L10627
Before: transition: all 0.2s;
After:  transition: all var(--transition-fast);
```

#### グループ5: `0.3s ease` → `var(--transition-normal)` （2箇所）

```
ファイル: css/style.css L2772
Before: transition: transform 0.3s ease;
After:  transition: transform var(--transition-normal);

ファイル: css/style.css L6769
Before: transition: width 0.3s ease;
After:  transition: width var(--transition-normal);

ファイル: css/style.css L7137
Before: transition: width 0.3s ease;
After:  transition: width var(--transition-normal);
```

#### グループ6: `0.1s ease` → `var(--transition-fast)` （2箇所）

0.1sは--transition-fast (0.15s)よりやや速いが、体感差はほぼない。統一可能。

```
ファイル: css/style.css L2511
Before: transition: width 0.1s ease;
After:  transition: width var(--transition-fast);

ファイル: css/style.css L10906
Before: transition: transform 0.1s;
After:  transition: transform var(--transition-fast);
```

#### グループ7: `0.5s ease` → `var(--transition-slow)` （1箇所）

```
ファイル: css/style.css L10463
Before: transition: height 0.5s ease;
After:  transition: height var(--transition-slow);
```

#### グループ8: noteview.css （1箇所）

```
ファイル: css/noteview.css L149
Before: transition: transform 0.1s;
After:  transition: transform var(--transition-fast);
```

### B-3. 変更件数サマリー

| 変換パターン | 件数 |
|-------------|------|
| `0.15s ease` → `var(--transition-fast)` | 22件 |
| `0.15s` (easing省略) → `var(--transition-fast)` | 12件 |
| `0.15s ease` (複合) → `var(--transition-fast)` 分解 | 5件 |
| `0.2s` / `0.2s ease` → `var(--transition-fast)` | 10件 |
| `0.3s ease` → `var(--transition-normal)` | 3件 |
| `0.1s` → `var(--transition-fast)` | 2件 |
| `0.5s ease` → `var(--transition-slow)` | 1件 |
| noteview.css | 1件 |
| **合計** | **56件** |

変更後のハードコードtransition: **0箇所**（全件変数化完了）

---

## C. タッチ/ジェスチャー最適化

### C-1. タッチハンドラの関係性マップ

```
document (グローバルリスナー)
├── 1. ページスワイプ (initSwipeNavigation)
│   ├── touchstart → handleSwipeStart()       {passive: true}
│   ├── touchmove  → handleSwipeMove()        {passive: false} ★ preventDefault使用
│   ├── touchend   → handleSwipeEnd()         {passive: true}
│   └── touchcancel → handleSwipeEnd()        {passive: true}
│
├── 2. メインタブスワイプ (initMainTabSwipe)
│   ├── touchstart → handleMainTabSwipeStart() {passive: true}
│   ├── touchmove  → handleMainTabSwipeMove()  {passive: true}
│   └── touchend   → handleMainTabSwipeEnd()   {passive: true}
│
├── 3. ドラッグナビ (initDragNavigation)
│   ├── touchstart → handleDragNavStart()      {passive: true}
│   ├── touchmove  → handleDragNavMove()       {passive: true}
│   ├── touchend   → handleDragNavEnd()        {passive: true}
│   └── touchcancel → handleDragNavCancel()    {passive: true}
│
goalCard (要素レベルリスナー)
├── 4. ゴールカードスワイプ (initGoalCardSwipe)
│   ├── ontouchstart → handleGoalCardSwipeStart()
│   ├── ontouchmove  → handleGoalCardSwipeMove()
│   └── ontouchend   → handleGoalCardSwipeEnd()
│
drumColumn (要素レベルリスナー)
└── 5. ドラムスクロール (initDrumTouch)
    ├── touchstart                              {passive: true}
    └── touchmove                               {passive: true}
```

### C-2. passive/active設定の妥当性確認

| ハンドラ | 現在のpassive | 妥当性 | 推奨 | 理由 |
|---------|-------------|--------|------|------|
| ページスワイプ touchstart | `true` | 適切 | 維持 | スクロール性能を阻害しない |
| ページスワイプ touchmove | `false` | **適切** | 維持 | e.preventDefault()でスクロールを抑制する必要がある。横スワイプ時に縦スクロールを止めるため必須 |
| ページスワイプ touchend | `true` | 適切 | 維持 | イベントのキャンセル不要 |
| メインタブスワイプ touchstart | `true` | 適切 | 維持 | - |
| メインタブスワイプ touchmove | `true` | **要確認** | `false`に変更検討 | 現在はpreventDefault未使用。しかし縦スクロール中のメインタブスワイプ誤発動を防ぐため、将来的にpreventDefaultが必要になる可能性あり。ただし現状は`directionLocked`で制御しているため`true`で問題なし |
| ドラッグナビ touchstart | `true` | 適切 | 維持 | - |
| ドラッグナビ touchmove | `true` | **問題あり** | `false`に変更 | ドラッグモード中（`this.dragNav.active === true`時）はスクロールを止めるべき。`document.body.classList.add('drag-nav-active')`でCSSレベルのscroll制御はしているが、touchmoveのデフォルト動作も止めた方が確実 |
| ゴールカードスワイプ | `未指定` | **問題あり** | passive指定を追加 | `ontouchstart`等のプロパティ代入ではpassiveが指定されない。`addEventListener`に変更し、touchmoveは`{passive: false}`にすべき（横スワイプ時にカード内の縦スクロールを止めるため） |
| ドラムスクロール touchstart | `true` | 適切 | 維持 | - |
| ドラムスクロール touchmove | `true` | **問題あり** | `false`に変更 | ドラム操作中にページ全体がスクロールする可能性がある。e.preventDefault()で抑制すべき |

### C-3. 具体的な変更（Before/After）

#### 変更1: ドラッグナビのtouchmoveをpassive: falseに変更

```
ファイル: js/app.js L2347
Before:
    document.addEventListener('touchmove', (e) => this.handleDragNavMove(e), { passive: true });

After:
    document.addEventListener('touchmove', (e) => this.handleDragNavMove(e), { passive: false });
理由: ドラッグモード中にe.preventDefault()でスクロールを抑制する必要がある。
```

```
ファイル: js/app.js L2479-2527 (handleDragNavMove内)
Before:
    if (!this.dragNav.active) return;

    const touch = e.touches[0];

After:
    if (!this.dragNav.active) return;

    e.preventDefault(); // ドラッグ中はスクロールを抑制
    const touch = e.touches[0];
理由: ドラッグモード中のスクロール抑制。CSSのoverflow:hiddenだけでは不十分な場合がある。
```

#### 変更2: ゴールカードスワイプをaddEventListenerに変更

```
ファイル: js/app.js L530-533
Before:
    const self = this;
    goalCard.ontouchstart = function(e) { self.handleGoalCardSwipeStart(e); };
    goalCard.ontouchmove = function(e) { self.handleGoalCardSwipeMove(e); };
    goalCard.ontouchend = function(e) { self.handleGoalCardSwipeEnd(e); };

After:
    goalCard.addEventListener('touchstart', (e) => this.handleGoalCardSwipeStart(e), { passive: true });
    goalCard.addEventListener('touchmove', (e) => this.handleGoalCardSwipeMove(e), { passive: true });
    goalCard.addEventListener('touchend', (e) => this.handleGoalCardSwipeEnd(e), { passive: true });
理由:
1. ontouchstartプロパティ代入ではpassive設定ができない（ブラウザデフォルトに依存）
2. アロー関数でthisバインドを簡潔にする（selfハック不要）
3. 明示的にpassive: trueを指定（ゴールカードのスワイプは左右のみでpreventDefault不要）
```

注意: addEventListenerに変更すると、`render()`が呼ばれるたびに`initGoalCardSwipe()`が実行され、
リスナーが重複登録される可能性がある。

```
ファイル: js/app.js L521-528 (initGoalCardSwipe先頭に追加)
Before:
  initGoalCardSwipe() {
    const goalCard = document.getElementById('home-card-longterm');
    if (!goalCard) return;

After:
  initGoalCardSwipe() {
    const goalCard = document.getElementById('home-card-longterm');
    if (!goalCard) return;

    // 既にリスナー登録済みならスキップ
    if (goalCard._swipeInitialized) return;
    goalCard._swipeInitialized = true;
理由: render()のたびにaddEventListenerが重複登録されるのを防止。
ontouchstartプロパティ代入の場合は上書きされるため問題なかったが、
addEventListenerでは蓄積されるため明示的なガードが必要。
```

#### 変更3: ドラムスクロールのtouchmoveをpassive: falseに変更

```
ファイル: js/app.js L3514-3515
Before:
    col.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      accumulated = 0;
    }, { passive: true });
    col.addEventListener('touchmove', (e) => {

After:
    col.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      accumulated = 0;
    }, { passive: true });
    col.addEventListener('touchmove', (e) => {
      e.preventDefault(); // ドラム操作中はページスクロールを抑制
```

```
ファイル: js/app.js L3515の後のclosing
Before:
    }, { passive: true });

After:
    }, { passive: false });
理由: ドラム操作中にページ全体がスクロールするのを防止する。
```

### C-4. 競合防止ロジックのレビュー

#### 現状の競合防止メカニズム

| 競合パターン | 防止方法 | 評価 |
|------------|---------|------|
| ページスワイプ vs ドラッグナビ | `if (this.dragNav.active) return;` (L2741, L2778) | 適切。ドラッグ中はページスワイプを完全に無効化 |
| ページスワイプ vs 縦スクロール | 方向検出: `Math.abs(deltaX) > Math.abs(deltaY)` (L2793) | 適切。6px以上の移動で方向を判定 |
| ページスワイプ vs 入力フィールド | `isInputField`フラグ + `Math.abs(deltaX) > Math.abs(deltaY) * 2` (L2791) | **良い設計**。入力フィールド上では2倍の閾値を要求。テキスト選択との競合を回避 |
| メインタブスワイプ vs ゴールカードスワイプ | `e.target.closest('#home-card-longterm')` (L2271) | 適切。ゴールカード上ではメインタブスワイプを無効化 |
| メインタブスワイプ vs タブバー横スクロール | `e.target.closest('.task-tab-bar')` (L2278) | 適切。タブバー上ではメインタブスワイプを無効化 |
| メインタブスワイプ vs 縦スクロール | `deltaY > 10 && deltaY > deltaX` → directionLocked (L2301) | 適切。10px以上の縦移動で横スワイプをロック |
| ドラッグナビ vs ページスクロール | `document.body.classList.add('drag-nav-active')` (L2403) | 一部問題。CSSでoverflow:hiddenにしているが、touchmoveのデフォルト動作は止めていない（変更3で対処済み） |

#### レビュー結果: 改善提案

**提案1（軽微）: ページスワイプの閾値をCSS変数化**

現在、スワイプ閾値がJS内でハードコードされている:
- ページスワイプ完了判定: `window.innerWidth * 0.25` (L2896)
- メインタブスワイプ判定: `50px` (L2314)
- ゴールカードスワイプ判定: `50px` (L566)

```
ファイル: js/app.js（先頭付近に定数として定義）
Before: 各所でハードコード

After:
// スワイプ関連定数
const SWIPE_THRESHOLD = 50;                    // スワイプ判定の最小移動距離(px)
const SWIPE_PAGE_THRESHOLD_RATIO = 0.25;       // ページスワイプ完了に必要な画面幅比率
const SWIPE_DIRECTION_DETECT = 6;              // 方向検出の最小移動距離(px)
const SWIPE_DIRECTION_DETECT_VERTICAL = 10;    // 縦方向ロックの最小移動距離(px)

理由: マジックナンバーの排除。チューニング時に一箇所で変更可能にする。
Todoist基準ではスワイプ閾値は56px（リストアイテム高さの半分）。
Apple Remindersではスワイプ閾値は画面幅の30%。
現状の50pxと25%は妥当な値。
```

**提案2（提案）: ゴールカードスワイプとメインタブスワイプの統合検討**

現状、ゴールカード上のスワイプとメインタブスワイプは排他制御されているが、
ゴールカードスワイプのロジック（方向検出→閾値判定→前後切替）はメインタブスワイプと構造が同一。

統合のメリット:
- コード削減（重複パターンの排除）
- 競合判定ロジックの簡素化

統合のリスク:
- ゴールカード固有の挙動（slide-left/rightアニメーション）の分離が複雑化

**最終判断**: 現状維持。統合のリスクが高く、現在の排他制御で問題なく動作しているため。

---

## D. スクロール最適化

### D-1. スクロール位置保存/復元パターンの現状分析

現在3つのパターンが存在する:

#### パターン1: render()内の自動調整（js/app.js L468-488）

```javascript
// 描画前の高さとスクロール位置を記録
const contentEl = container.querySelector('.content');
const oldHeight = contentEl ? contentEl.scrollHeight : 0;
const oldScrollTop = contentEl ? contentEl.scrollTop : 0;

// ... render ...

if (this._keepScrollPosition !== undefined) {
  newContentEl.scrollTop = this._keepScrollPosition;
} else {
  const newHeight = newContentEl.scrollHeight;
  const heightDiff = newHeight - oldHeight;
  newContentEl.scrollTop = oldScrollTop + (heightDiff > 0 ? heightDiff : 0);
}
```

用途: 全ページ共通。データ変更後の再描画時にスクロール位置をできるだけ維持。

#### パターン2: `_keepScrollPosition` フラグ方式（js/app.js L6506-6520, L6539-6550）

```javascript
const contentEl = document.querySelector('.content');
const scrollTop = contentEl ? contentEl.scrollTop : 0;
// ... データ変更 ...
this._keepScrollPosition = scrollTop;
this.render();
delete this._keepScrollPosition;
```

用途: ルーティンカードの展開/折りたたみ（月次編集・日誌）。render()の自動調整を
バイパスして正確にスクロール位置を復元する。

#### パターン3: ウィジェット別管理（js/app.js L3009-3026, L6562-6582）

```javascript
const widgetContent = document.querySelector('.routine-widget .widget-content');
const scrollTop = widgetContent ? widgetContent.scrollTop : 0;
// ... render ...
requestAnimationFrame(() => {
  const newWidgetContent = document.querySelector('.routine-widget .widget-content');
  if (newWidgetContent) newWidgetContent.scrollTop = scrollTop;
});
```

用途: ホームウィジェット内のスクロール位置。content要素とは別のスクロールコンテナのため
独立して保存/復元する必要がある。

### D-2. 参照アプリとの比較

| アプリ | スクロール管理 | 特徴 |
|--------|-------------|------|
| **Todoist** | 各画面のスクロール位置を画面遷移時に自動保存。戻った時に復元 | SPA構造で仮想DOMにより再描画の影響を受けにくい |
| **Notion** | ブロック単位の仮想スクロール。表示範囲外は未レンダリング | 大量コンテンツでも高速 |
| **Apple Reminders** | UIKitネイティブ。scroll position restorationはOS管理 | 再描画はdiff更新のため位置ズレなし |

### D-3. 統一案

現状の3パターンは用途が明確に異なるため、完全統一は不適切。
ただし、以下の改善を提案する:

#### 改善1: `_keepScrollPosition`パターンをヘルパー関数に抽出

現在、同じパターンが3箇所（L6506-6520, L6539-6550, L6562-6582）にコピペされている。

```
ファイル: js/app.js（ユーティリティとして追加）
Before: 3箇所にコピペされたパターン

After:
  // スクロール位置を維持しながらrender()を実行
  renderKeepingScroll(additionalScrollTargets = []) {
    const contentEl = document.querySelector('.content');
    const contentScrollTop = contentEl ? contentEl.scrollTop : 0;

    // 追加のスクロールターゲット（ウィジェット等）の位置も保存
    const savedPositions = additionalScrollTargets.map(selector => ({
      selector,
      scrollTop: document.querySelector(selector)?.scrollTop || 0
    }));

    this._keepScrollPosition = contentScrollTop;
    this.render();
    delete this._keepScrollPosition;

    // 追加ターゲットのスクロール位置を復元
    if (savedPositions.length > 0) {
      requestAnimationFrame(() => {
        savedPositions.forEach(({ selector, scrollTop }) => {
          const el = document.querySelector(selector);
          if (el) el.scrollTop = scrollTop;
        });
      });
    }
  },

理由:
1. DRY原則。同一パターンの3重コピペを排除
2. ウィジェット用のrequestAnimationFrame復元も統合
3. 将来の追加スクロールコンテナにも対応可能
```

呼び出し側の変更:

```
ファイル: js/app.js L6503-6520 (toggleAllRoutineCards)
Before:
    const contentEl = document.querySelector('.content');
    const scrollTop = contentEl ? contentEl.scrollTop : 0;
    // ... データ変更 ...
    this._keepScrollPosition = scrollTop;
    this.render();
    delete this._keepScrollPosition;

After:
    // ... データ変更 ...
    this.renderKeepingScroll();
```

```
ファイル: js/app.js L6537-6550 (toggleAllJournalRoutineCards)
Before:
    const contentEl = document.querySelector('.content');
    const scrollTop = contentEl ? contentEl.scrollTop : 0;
    // ... データ変更 ...
    this._keepScrollPosition = scrollTop;
    this.render();
    delete this._keepScrollPosition;

After:
    // ... データ変更 ...
    this.renderKeepingScroll();
```

```
ファイル: js/app.js L6556-6582 (toggleHomeRoutineCard)
Before:
    const contentEl = document.querySelector('.content');
    const widgetContent = document.querySelector('.routine-widget .widget-content');
    const contentScrollTop = contentEl ? contentEl.scrollTop : 0;
    const widgetScrollTop = widgetContent ? widgetContent.scrollTop : 0;
    // ... データ変更 ...
    this._keepScrollPosition = contentScrollTop;
    this.render();
    delete this._keepScrollPosition;
    requestAnimationFrame(() => {
      const newWidgetContent = document.querySelector('.routine-widget .widget-content');
      if (newWidgetContent) newWidgetContent.scrollTop = widgetScrollTop;
    });

After:
    // ... データ変更 ...
    this.renderKeepingScroll(['.routine-widget .widget-content']);
```

#### 改善2: タブ中央スクロールの共通化

`scrollTaskTabToCenter`と`scrollRoutineTabToCenter`は同一ロジック:

```
ファイル: js/app.js L1381-1391, L1737-1746
Before:
  scrollTaskTabToCenter() {
    setTimeout(() => {
      const tabBar = document.querySelector('.task-tab-bar');
      const activeTab = tabBar?.querySelector('.task-tab.active');
      if (!tabBar || !activeTab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = tabBar.scrollLeft + (tabRect.left - barRect.left) - (barRect.width / 2) + (tabRect.width / 2);
      tabBar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 10);
  },

  // ... (350行離れた場所に同一ロジック)

  scrollRoutineTabToCenter() {
    setTimeout(() => {
      const tabBar = document.querySelector('.routine-tab-bar');
      const activeTab = tabBar?.querySelector('.routine-tab.active');
      if (!tabBar || !activeTab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = tabBar.scrollLeft + (tabRect.left - barRect.left) - (barRect.width / 2) + (tabRect.width / 2);
      tabBar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 10);
  },

After:
  // タブバー内のアクティブタブを中央にスクロール
  scrollTabToCenter(barSelector, activeSelector) {
    setTimeout(() => {
      const tabBar = document.querySelector(barSelector);
      const activeTab = tabBar?.querySelector(activeSelector);
      if (!tabBar || !activeTab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = tabBar.scrollLeft + (tabRect.left - barRect.left) - (barRect.width / 2) + (tabRect.width / 2);
      tabBar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 10);
  },

理由: 完全に同一のロジックが2箇所にコピペされている。引数化で共通化。
```

呼び出し側:

```
ファイル: js/app.js L500-503 (render内)
Before:
    if (this.currentPage === 'task-list') {
      this.scrollTaskTabToCenter();
    } else if (this.currentPage === 'routine-list') {
      this.scrollRoutineTabToCenter();
    }

After:
    if (this.currentPage === 'task-list') {
      this.scrollTabToCenter('.task-tab-bar', '.task-tab.active');
    } else if (this.currentPage === 'routine-list') {
      this.scrollTabToCenter('.routine-tab-bar', '.routine-tab.active');
    }
```

注意: Phase 2部品チームがタブバーを`.tab-bar` / `.tab-item`に統一する計画があるため、
その統一後は:

```javascript
this.scrollTabToCenter('.tab-bar', '.tab-item.active');
```

に変更される。引数化しておくことで、この変更が容易になる。

### D-4. テキストエリア自動伸長パターンの共通化

#### 現状の分析

同一パターンが8箇所にコピペされている:

```javascript
// パターンA: 基本（6箇所: L4335-4336, L5331-5332, L5335-5336, L5444-5445, L5448-5449, L5716-5717, L5720-5721）
textarea.style.height = 'auto';
textarea.style.height = textarea.scrollHeight + 'px';

// パターンB: 最小高さ付き（4箇所: L5546-5547, L5550-5551）
textarea.style.height = 'auto';
textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
```

使用コンテキスト:
- 初回表示時の高さ設定
- `input`イベントリスナー内でのリアルタイム調整

#### 統一案

```
ファイル: js/app.js（ユーティリティとして追加）
Before: 8箇所にコピペされたパターン

After:
  // テキストエリアの高さを内容に合わせて自動調整
  autoResizeTextarea(textarea, minHeight = 0) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + 'px';
  },

  // テキストエリアにinputイベントで自動伸長を設定
  setupAutoResize(textarea, minHeight = 0) {
    if (!textarea) return;
    this.autoResizeTextarea(textarea, minHeight);
    textarea.addEventListener('input', () => {
      this.autoResizeTextarea(textarea, minHeight);
    });
  },

理由:
1. DRY原則。8重コピペの排除
2. minHeightパラメータで42px固定値にも対応
3. 初回高さ設定 + inputリスナー登録を1回の呼び出しで完了
```

呼び出し側の変更例:

```
ファイル: js/app.js L5327-5338 (expandHomeCard内)
Before:
    setTimeout(() => {
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
    }, 100);

After:
    setTimeout(() => {
      const textarea = document.getElementById(`${target}-card-edit-${field}`);
      if (textarea) {
        this.setupAutoResize(textarea);
        textarea.focus();
      }
    }, 100);
理由: 6行 → 2行に削減。ロジックはautoResizeTextareaに集約。
```

同様の変更を以下の箇所にも適用:

| ファイル | 行 | minHeight |
|---------|-----|-----------|
| js/app.js L4335-4336 | expandAgeGoal | 0 |
| js/app.js L5331-5336 | expandHomeCard | 0 |
| js/app.js L5444-5449 | expandLongtermCard内 | 0 |
| js/app.js L5546-5551 | expandLifeCard内 | 42 |
| js/app.js L5716-5721 | expandProgressCard内 | 42 |

### D-5. will-change使用箇所のレビュー

現状2箇所:

```
ファイル: css/style.css L2525
.swipe-wrapper { will-change: transform; }

ファイル: css/style.css L8491
.swipe-page { will-change: transform; }
```

| 箇所 | 評価 | 推奨 |
|------|------|------|
| `.swipe-wrapper` L2525 | **適切** | 維持。スワイプ中にtransformが頻繁に変化するためGPUレイヤー化が有効 |
| `.swipe-page` L8491 | **適切** | 維持。ページスワイプ中のスムーズな動きに必要 |

追加の`will-change`提案は不要。2箇所とも実際にtransformアニメーションが頻繁に発生する要素であり、
過剰な`will-change`はメモリ使用量を増やすだけのため、現状が最適。

Apple Remindersでは`will-change`の使用を最小限に抑えており、
実際にアニメーションが発生する要素にのみ適用するのがベストプラクティス。

---

## 実装順序の提案

| 順序 | カテゴリ | 理由 | 影響範囲 |
|------|---------|------|---------|
| 1 | **transition標準化 (B)** | 最も安全。CSS変数の値変更のみで動作に影響なし | CSS 56箇所 |
| 2 | **アニメーション辞書 (A)** | keyframes名の変更のみ。animation:プロパティの参照先を変えるだけ | CSS 22箇所の定義、13箇所の参照 |
| 3 | **テキストエリア自動伸長の共通化 (D-4)** | JS内部のリファクタリング。外部動作に影響なし | JS 8箇所 → 1関数 |
| 4 | **スクロール位置保存の共通化 (D-1,D-2)** | JS内部のリファクタリング。外部動作に影響なし | JS 5箇所 → 2関数 |
| 5 | **タッチ/ジェスチャーのpassive修正 (C)** | 動作変更を伴う。慎重なテストが必要 | JS 3箇所 |

各Stepの後にQAサイクルで動作確認。

---

## 変更件数サマリー

| カテゴリ | 件数 |
|---------|------|
| keyframes統合・改名（CSS定義） | 22定義 → 17定義（5削減） |
| keyframes参照更新（CSS animation:行） | 13箇所 |
| transition変数化（CSS） | 56箇所 |
| タッチハンドラpassive修正（JS） | 3箇所 |
| ゴールカードスワイプのaddEventListener化（JS） | 1箇所（3行 → 5行） |
| スクロール位置保存ヘルパー（JS） | 新規1関数 + 呼び出し3箇所変更 |
| タブ中央スクロール共通化（JS） | 2関数 → 1関数 + 呼び出し2箇所変更 |
| テキストエリア自動伸長共通化（JS） | 新規2関数 + 呼び出し8箇所変更 |
| スワイプ閾値の定数化（JS） | 新規4定数 + 参照4箇所 |
| noteview.css transition変数化 | 1箇所 |
| **合計CSS変更** | **69箇所 + 5定義削減** |
| **合計JS変更** | **25箇所 + 3新規関数/4定数** |

> 作業状況: 完了
