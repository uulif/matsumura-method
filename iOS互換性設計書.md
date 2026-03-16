# iOS互換性設計書

**作成日:** 2026-03-15
**対象:** 松村メソッドPWA（GitHub Pages + Firebase Auth + Firestore + Cloudflare Workers）
**目的:** iPhone/iPad/Macでの完全動作を実現する

---

## 1. 現状の問題一覧

### A. Google認証が壊れる【致命的】

**現象:** iOSでGoogle認証が動作しない。

**原因:**
- `signInWithPopup` → iOSスタンドアロンPWAではポップアップがSafariに飛び、アプリに戻れない
- `signInWithRedirect` → Safari 16.1+のITP（Intelligent Tracking Prevention）で第三者Cookieが遮断され、`getRedirectResult()`が`null`を返す

**両方壊れる。** どちらか一方に変えるだけでは解決しない。

**根拠:**
- https://github.com/firebase/firebase-js-sdk/issues/6716
- https://github.com/firebase/firebase-js-sdk/issues/6831
- https://github.com/firebase/firebase-js-sdk/issues/8329
- https://github.com/firebase/firebase-js-sdk/issues/7583

---

### B. 100vh問題【重要】

**現象:** iOS Safariでナビバーがアドレスバーの裏に隠れる。

**原因:** CSS `.app { height: 100vh }` がiOS SafariではURLバー分を含む高さを返す。`overflow: hidden`でスクロール不可のため、URLバーが引っ込まず下部が常に隠れる。

**解決:** `100dvh`（Dynamic Viewport Height）はiOS Safari 15.4+（2022年3月）で対応済み。

---

### C. viewportメタタグ不備【重要】

**現状のindex.html:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

**問題点:**
1. `viewport-fit=cover`未設定 → `env(safe-area-inset-*)`が全て0になる → ノッチ/Dynamic Islandに対応不可
2. `maximum-scale=1.0, user-scalable=no` → iOS 10以降Safariが無視する。アクセシビリティ違反
3. `status-bar-style: default` → ステータスバーが不透明白背景で全画面表示にならない

---

### D. プッシュ通知未実装【機能不足】

**現象:** 定期見直し（GTDの要）の通知手段がない。バッジはアプリを開かないと見えない。

**対応状況:** iOS 16.4+（2023年3月）でホーム画面追加済みPWAのWeb Push対応済み。manifest.jsonの`"display": "standalone"`は既に設定済み。

---

### E. Safari ↔ PWA ストレージ分離【注意】

**事実:** ホーム画面に追加したPWAとSafariブラウザはストレージが完全に分離される。

| ストレージ | Safari ↔ PWA共有 |
|-----------|-----------------|
| IndexedDB | 共有されない |
| localStorage | 共有されない |
| Cookie | 共有されない |
| Service Worker | 共有されない |
| Cache API | **共有される（唯一の例外）** |

**影響:** Safariでログインしても、PWAでは未ログイン状態。ユーザーにPWAとしてインストールさせ、PWA内で認証させる設計が必須。

**根拠:**
- https://webkit.org/blog/14403/updates-to-storage-policy/
- https://www.netguru.com/blog/how-to-share-session-cookie-or-state-between-pwa-in-standalone-mode-and-safari-on-ios

---

### F. IndexedDB 7日消去リスク【軽微】

**事実:**
- **Safariブラウザ利用時:** 7日間のブラウザ使用日数でアクセスがないとIndexedDB含む全データが消去される（ITPポリシー）
- **ホーム画面追加済みPWA:** この7日制限から**免除**される
- iOS 17以降、`navigator.storage.persist()`で追加保護が可能

**対策:** ホーム画面追加をユーザーに案内すれば実質問題なし。既存のFirestore同期が安全網として機能する。

**根拠:**
- https://webkit.org/blog/14403/updates-to-storage-policy/
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

---

## 2. 解決策の詳細設計

### 2-A. Google認証：Cloudflare Workerで認証プロキシ

#### 方式

Firebase公式推奨の「Option 3: Proxy auth requests to firebaseapp.com」をCloudflare Workerで実装する。

#### 仕組み

```
[PWA (GitHub Pages)]
  Firebase SDK: authDomain = "matsumura-auth.uulife98.workers.dev"
  ↓ signInWithRedirect()

[Cloudflare Worker: matsumura-auth.uulife98.workers.dev]
  /__/auth/* → https://<firebase-project>.firebaseapp.com/__/auth/* をプロキシ
  ↓ 同一ドメインでCookieが保持される → ITP回避

[Firebase Auth]
  認証完了 → リダイレクトバック
  ↓

[PWA]
  getRedirectResult() → 認証結果取得成功
```

#### なぜこれで解決するか

ITPが遮断するのは「第三者ドメインのCookie」。認証フローが`firebaseapp.com`にリダイレクトすると、戻った時にCookieが第三者扱いになる。プロキシでアプリと同じドメインから認証を提供すれば、Cookieは第一者扱いになりITPに遮断されない。

#### プラットフォーム分岐

```javascript
const isIOSPWA = window.navigator.standalone === true ||
  (window.matchMedia('(display-mode: standalone)').matches && /iPad|iPhone|iPod/.test(navigator.userAgent));

if (isIOSPWA) {
  // iOS PWA: redirect方式（プロキシ経由でITP回避）
  await firebase.auth().signInWithRedirect(provider);
} else {
  // デスクトップ/Android: popup方式（従来通り高速）
  const result = await firebase.auth().signInWithPopup(provider);
}
```

ページ読み込み時に常に`getRedirectResult()`を呼ぶ：
```javascript
// アプリ初期化時（全プラットフォーム共通）
firebase.auth().getRedirectResult().then(result => {
  if (result.credential) {
    // リダイレクト認証が完了した場合の処理
  }
}).catch(() => {});
```

#### Cloudflare Worker実装

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 認証プロキシ: /__/auth/* → firebaseapp.com
    if (url.pathname.startsWith('/__/auth/')) {
      const firebaseUrl = `https://<PROJECT_ID>.firebaseapp.com${url.pathname}${url.search}`;
      const response = await fetch(firebaseUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', 'https://<github-pages-domain>');
      return newResponse;
    }

    // 既存のNotion連携プロキシ
    // ...
  }
};
```

#### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `js/app.js` | Firebase初期化の`authDomain`変更、iOS判定+redirect分岐、`getRedirectResult()`追加 |
| Cloudflare Worker | `/__/auth/*`プロキシルート追加 |

#### 代替案（不採用とした案）

| 案 | 不採用理由 |
|----|-----------|
| Firebase Hostingに移行 | GitHub Pagesからの移行が大きく、デプロイフロー全体が変わる |
| `signInWithCredential` + Google Identity Services | 実装が複雑。GISのOne Tap UIは制御が難しい |
| popupのまま放置 | iOSで認証不可 |
| redirectのまま放置 | Safari 16.1+で認証不可 |

---

### 2-B. 100vh → 100dvh

#### CSS変更

```css
/* 変更前 */
.app {
  height: 100vh;
}

/* 変更後 */
.app {
  height: 100vh;    /* iOS 15.3以下のフォールバック */
  height: 100dvh;   /* iOS 15.4+ の動的ビューポート */
}
```

#### 補足
- スタンドアロンPWAモードでは`100dvh` = `100svh` = `100lvh`（ブラウザUIがないため同値）
- Safari以外でも`100dvh`は Chrome 108+、Firefox 101+で対応済み
- フォールバック付きなのでリスクゼロ

---

### 2-C. viewportメタタグ修正

#### 変更内容

```html
<!-- 変更前 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-status-bar-style" content="default">

<!-- 変更後 -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

#### CSS追加

```css
/* ヘッダーにノッチ/Dynamic Island分のパディング追加 */
.header {
  padding-top: env(safe-area-inset-top);
}

/* ナビバーは既にenv(safe-area-inset-bottom)対応済み（L1384） */
```

#### 注意点
- `black-translucent`にするとステータスバー領域がアプリのコンテンツ領域に含まれる
- `env(safe-area-inset-top)`でヘッダーを下げないとステータスバーとコンテンツが重なる
- `overscroll-behavior: none`でiOS 16+のラバーバンドスクロールを防止可能

---

### 2-D. プッシュ通知

#### アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│ Cloudflare Worker（スケジュール実行）              │
│                                                  │
│ Cron Trigger: 毎朝 8:00 JST (23:00 UTC前日)      │
│   ├── 今日は土日？ → 週次レビュー通知              │
│   ├── 月末残り4日以内？ → 月次レビュー通知          │
│   ├── Firestore/KVからsubscription一覧取得        │
│   └── web-pushライブラリで各端末に送信             │
└─────────────────────────────────────────────────┘
         │ Push Protocol (VAPID)
         ▼
┌─────────────────────────────────────────────────┐
│ Service Worker（端末側）                          │
│                                                  │
│ self.addEventListener('push', event => {         │
│   event.waitUntil(                    ← 必須!    │
│     self.registration.showNotification(...)      │
│   );                                             │
│ });                                              │
│                                                  │
│ self.addEventListener('notificationclick', ...) │
│   → アプリを開く / 振り返りページに遷移           │
└─────────────────────────────────────────────────┘
         ▲
         │ PushManager.subscribe()
┌─────────────────────────────────────────────────┐
│ PWA（アプリ側）                                   │
│                                                  │
│ 設定画面:「通知を有効にする」ボタン                │
│   ├── Notification.requestPermission()           │
│   │   └── ユーザージェスチャー（タップ）必須       │
│   ├── registration.pushManager.subscribe({       │
│   │     userVisibleOnly: true,                   │
│   │     applicationServerKey: VAPID_PUBLIC_KEY   │
│   │   })                                         │
│   └── subscription → Firestore/KVに保存          │
└─────────────────────────────────────────────────┘
```

#### FCM JS SDKを使わない理由

Firebase Cloud Messaging JS SDKはSafariで`getToken()`が失敗するissueが複数報告されている。
- https://github.com/firebase/firebase-js-sdk/issues/8356
- https://github.com/firebase/firebase-js-sdk/issues/8010
- https://github.com/firebase/firebase-js-sdk/issues/13048

代わりに標準Web Push API + VAPIDキーを使用する。`web-push`（Node.js）ライブラリがChrome（FCM endpoint）、Firefox（Mozilla endpoint）、Safari（APNs endpoint）を自動判別してくれる。

#### iOS固有の必須条件

1. **PWAがホーム画面に追加済みであること** — Safari単体では通知API自体が無効
2. **manifest.jsonに`"display": "standalone"`** — 既に対応済み
3. **`event.waitUntil(showNotification(...))`必須** — waitUntilなしだとiOS Safariは「サイレントプッシュ」と判定し、**3回で購読を強制破棄する**
4. **`new Notification()`は使えない** — iOS Safariは`self.registration.showNotification()`のみ対応
5. **ユーザージェスチャー（タップ）から`requestPermission()`を呼ぶこと** — ページ読み込み時に自動で呼ぶと拒否される

#### Cloudflare Workersを使う理由（Firebase Cloud Functionsではなく）

| 比較項目 | Cloudflare Workers | Firebase Cloud Functions |
|---------|-------------------|------------------------|
| 費用 | 無料枠: 10万リクエスト/日 | 有料プラン(Blaze)必須 |
| Cron Triggers | 無料 | 有料プラン必須 |
| 既存インフラ | Notion連携Workerが稼働中 | なし |
| デプロイ | Wrangler CLI | Firebase CLI |
| Node.js互換 | Workers Runtime（互換性あり） | Node.js |

#### VAPIDキー生成

```bash
npx web-push generate-vapid-keys
```

公開鍵をアプリに埋め込み、秘密鍵をCloudflare Worker環境変数に設定。Apple Developer Accountは不要。

#### 通知内容

| タイミング | タイトル | 本文 |
|-----------|---------|------|
| 土曜日朝 | 週次レビューの日です | 義務・維持・待機・プロジェクトリストを確認しましょう |
| 月末4日前 | 月次レビューの時期です | いつかやりたいリスト・資料・候補ルーティンを見返しましょう |

#### subscription再取得

iOS上でsubscriptionは時間経過で失効する可能性がある。アプリ起動時に毎回subscriptionを再取得してサーバーに保存し直す：

```javascript
async function refreshPushSubscription() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    // 既存のsubscriptionをサーバーに再送信（エンドポイントが変わっている可能性）
    await saveSubscriptionToServer(sub);
  }
}
```

#### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `service-worker.js` | `push`イベントハンドラ追加、`notificationclick`ハンドラ追加 |
| `js/app.js` | 通知許可リクエスト、subscription管理、設定UIに通知ボタン追加 |
| Cloudflare Worker | Cron Trigger + web-push送信ロジック追加 |

---

### 2-E. ストレージ保護

#### 対策（追加実装）

1. **`navigator.storage.persist()`を呼ぶ**（iOS 17+で有効）
```javascript
// アプリ初期化時
if (navigator.storage && navigator.storage.persist) {
  const granted = await navigator.storage.persist();
  console.log('Persistent storage:', granted);
}
```

2. **PWAインストール案内を表示**
ホーム画面に追加されていない場合、設定画面またはバナーで案内を表示。
```javascript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;
if (!isStandalone) {
  // 「ホーム画面に追加してください」バナーを表示
}
```

3. **既存のFirestore同期が安全網** — 追加のバックアップ機能は不要

---

## 3. 実装優先順位

| 順番 | 項目 | 工数 | 理由 |
|------|------|------|------|
| **1** | viewportメタタグ + 100dvh + safe-area-inset | 小 | 数行の変更で即効果。リスクゼロ |
| **2** | 認証プロキシ（Cloudflare Worker） | 中 | iOS対応の前提条件。認証が動かないと何もできない |
| **3** | キャッシュバスター更新 | 極小 | index.htmlの`?v=308`を`?v=353`に更新 |
| **4** | プッシュ通知 | 大 | 認証プロキシと同じWorkerに載せる。VAPID鍵生成+SW変更+設定UI追加 |
| **5** | ストレージ保護 + PWAインストール案内 | 小 | persist()呼び出し + 案内バナー |

---

## 4. 全変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `index.html` | 修正 | viewportメタタグ修正、status-bar-style変更、キャッシュバスター更新 |
| `css/style.css` | 修正 | `100vh`→`100dvh`フォールバック追加、`.header`にsafe-area-inset-top追加、`overscroll-behavior: none`追加 |
| `js/app.js` | 修正 | Firebase authDomain変更、iOS判定+redirect分岐、getRedirectResult()追加、通知購読機能追加、persist()呼び出し、PWAインストール案内 |
| `service-worker.js` | 修正 | pushイベントハンドラ追加、notificationclickハンドラ追加 |
| `manifest.json` | 変更なし | 既に`display: standalone`対応済み |
| **新規** Cloudflare Worker | 新規作成 | 認証プロキシ(`/__/auth/*`) + 通知スケジューラー(Cron Trigger) |

---

## 5. リスクと制約

| リスク | 深刻度 | 対策 |
|--------|--------|------|
| 認証プロキシのCloudflare Worker障害 | 中 | デスクトップ/AndroidはsignInWithPopupなので影響なし。iOS認証のみ一時停止 |
| iOS 16.4未満はプッシュ通知不可 | 低 | 2023年3月リリース。3年以上前のOSは対象外として割り切る |
| iOS通知subscriptionの失効 | 中 | アプリ起動時にsubscriptionを毎回再取得・再保存する |
| Firestore offline persistenceのiOS Safari上のバグ | 中 | オンライン時のみ同期する設計を維持。オフライン永続化に依存しない |
| Safari ↔ PWAのストレージ分離による二重ログイン | 低 | PWA内で認証する前提で設計。Safariからの利用は非推奨 |
| `notificationclick`でPWAが正しく開かない（iOS既知バグ） | 低 | 通知タップ時にURL指定でPWAを開く。PWAがkill状態だと失敗する可能性あり |
| `event.waitUntil`を忘れると3回でsubscription破棄 | 高 | コードレビューで確実にwaitUntilを使用。テストで検証 |

---

## 6. テスト計画

| # | テスト項目 | 確認方法 |
|---|-----------|---------|
| 1 | iOS Safari（ブラウザ）で基本表示が崩れないか | 実機またはシミュレーター |
| 2 | iOS PWA（ホーム画面追加）でGoogle認証が動作するか | 実機必須（シミュレーターでは再現不可） |
| 3 | `100dvh`でナビバーが隠れないか | iOS Safari実機 |
| 4 | ノッチ/Dynamic Islandにコンテンツが重ならないか | iPhone X以降の実機 |
| 5 | プッシュ通知が届くか（PWA未起動状態で） | iOS 16.4+実機 |
| 6 | 通知タップでアプリが開くか | iOS実機 |
| 7 | デスクトップ/AndroidでsignInWithPopupが従来通り動くか | Chrome/Edge |
| 8 | Cloudflare Worker認証プロキシが正常応答するか | curl/ブラウザ |
| 9 | Cron Triggerが指定時刻に実行されるか | Cloudflareダッシュボード |
| 10 | subscriptionが再起動後も維持されているか | iOS実機で端末再起動後に確認 |

---

## 7. 参考資料

### Firebase認証
- [Firebase: signInWithRedirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [GitHub #6716: Safari 16.1+ login failure](https://github.com/firebase/firebase-js-sdk/issues/6716)
- [GitHub #8329: signInWithRedirect doesn't work on Chrome 115+, Safari 16.1+](https://github.com/firebase/firebase-js-sdk/issues/8329)
- [CodeJam: Firebase Auth signInWithRedirect with Safari](https://www.codejam.info/2024/05/nextjs-firebase-auth-safari.html)

### プッシュ通知
- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [WebKit: Meet Declarative Web Push (iOS 18.4+)](https://webkit.org/blog/16535/meet-declarative-web-push/)
- [DEV: Fix iOS push subscriptions terminated after 3 notifications](https://dev.to/progressier/how-to-fix-ios-push-subscriptions-being-terminated-after-3-notifications-39a7)
- [Apple: Sending web push notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)
- [GitHub #8356: FCM getToken() issue on Safari](https://github.com/firebase/firebase-js-sdk/issues/8356)

### Viewport / CSS
- [Can I Use: Viewport Unit Variants](https://caniuse.com/viewport-unit-variants)
- [Bram.us: The Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/)
- [DEV: Make Your PWAs Look Handsome on iOS](https://dev.to/karmasakshi/make-your-pwas-look-handsome-on-ios-1o08)

### ストレージ
- [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [MagicBell: PWA iOS Limitations and Safari Support](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [MobiLoud: Do Progressive Web Apps Work on iOS? (2026)](https://www.mobiloud.com/blog/progressive-web-apps-ios)
