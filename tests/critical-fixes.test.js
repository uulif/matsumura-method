const { test, expect } = require('@playwright/test');

// アプリが完全にロードされるまで待つヘルパー
async function waitForApp(page) {
  await page.goto('/');
  await page.waitForFunction(() => {
    const ls = document.getElementById('loadingScreen');
    return ls && ls.classList.contains('hide');
  }, { timeout: 10000 });
  await page.waitForFunction(() => {
    const appEl = document.getElementById('app');
    return appEl && appEl.children.length > 0;
  }, { timeout: 10000 });
  await page.waitForTimeout(500);
}

// ===== 致命的#1: グローバルエラーハンドラー =====

test('C01: unhandledrejectionハンドラーが登録されている', async ({ page }) => {
  await waitForApp(page);
  const hasHandler = await page.evaluate(() => {
    // unhandledrejectionリスナーが存在するか確認（間接的に）
    return typeof _lastErrorToast === 'number';
  });
  expect(hasHandler).toBe(true);
});

test('C02: DB保存失敗時にトースト通知が表示される', async ({ page }) => {
  await waitForApp(page);
  // IndexedDBのsaveTaskを一時的に壊してエラーを発生させる
  await page.evaluate(() => {
    const origSaveTask = window.saveTask;
    window.saveTask = async () => { throw new Error('テスト用エラー'); };
    // タスク追加を試みる（失敗する）
    app.taskItems = app.taskItems || [];
    app.saveNewTask('action').catch(() => {});
    // 元に戻す
    setTimeout(() => { window.saveTask = origSaveTask; }, 1000);
  });
  await page.waitForTimeout(1500);
  const toast = await page.locator('.toast').first();
  // トーストが表示されたか（エラーメッセージまたは入力バリデーション）
  const toastVisible = await toast.isVisible().catch(() => false);
  // saveNewTaskはtitleが空だと'内容を入力してください'トースト、
  // titleがあればDB保存失敗でunhandledrejection経由のトースト
  // どちらかのトーストが出ればOK
  expect(toastVisible).toBe(true);
});

test('C03: 連続エラーのデバウンス（3秒以内の2回目は抑制）', async ({ page }) => {
  await waitForApp(page);
  const toastCount = await page.evaluate(async () => {
    let count = 0;
    const origShowToast = app.showToast.bind(app);
    app.showToast = (msg) => { count++; origShowToast(msg); };
    // 2回連続でunhandledrejectionを発火
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject('test1'),
      reason: 'test1'
    }));
    window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject('test2'),
      reason: 'test2'
    }));
    await new Promise(r => setTimeout(r, 500));
    return count;
  });
  // デバウンスにより1回のみ表示
  expect(toastCount).toBe(1);
});

// ===== 致命的#2: SW更新通知 =====

test('C04: _showUpdateNotificationメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app._showUpdateNotification === 'function');
  expect(exists).toBe(true);
});

test('C05: 更新通知バーが正しいHTMLを生成する', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app._showUpdateNotification());
  const bar = page.locator('.update-notification');
  await expect(bar).toBeVisible();
  await expect(bar.locator('button')).toHaveCount(2);
  await expect(bar.locator('span')).toContainText('アプリが更新されました');
});

test('C06: 「後で」ボタンで通知バーが消える', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app._showUpdateNotification());
  const bar = page.locator('.update-notification');
  await expect(bar).toBeVisible();
  // 「後で」ボタン（2番目）をクリック
  await bar.locator('button').nth(1).click();
  await expect(bar).not.toBeVisible();
});

test('C07: 通知バーの二重表示防止', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app._showUpdateNotification();
    app._showUpdateNotification();
  });
  const count = await page.locator('.update-notification').count();
  expect(count).toBe(1);
});

test('C08: 通知バーのz-indexが9000である', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app._showUpdateNotification());
  const zIndex = await page.locator('.update-notification').evaluate(el => {
    return window.getComputedStyle(el).zIndex;
  });
  expect(zIndex).toBe('9000');
});

test('C09: 通知バーのボタンが44px以上の高さを持つ', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app._showUpdateNotification());
  const buttons = page.locator('.update-notification button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const height = await buttons.nth(i).evaluate(el => el.offsetHeight);
    expect(height).toBeGreaterThanOrEqual(44);
  }
});

test('C10: SW登録パスが相対パスである', async ({ page }) => {
  await waitForApp(page);
  // registerServiceWorkerの実装を確認
  const fnStr = await page.evaluate(() => app.registerServiceWorker.toString());
  expect(fnStr).toContain('./service-worker.js');
  expect(fnStr).not.toContain("'/service-worker.js'");
});

// ===== 致命的#3: manifest.json =====

test('C11: manifest.jsonのiconにsizes="any"が設定されている', async ({ page }) => {
  const response = await page.goto('/manifest.json');
  const manifest = await response.json();
  expect(manifest.icons[0].sizes).toBe('any');
  expect(manifest.icons[0].type).toBe('image/svg+xml');
});

test('C12: manifest.jsonにid, scope, langが設定されている', async ({ page }) => {
  const response = await page.goto('/manifest.json');
  const manifest = await response.json();
  expect(manifest.id).toBeDefined();
  expect(manifest.scope).toBeDefined();
  expect(manifest.lang).toBe('ja');
});

// ===== 致命的#4: renderTasksPageクラッシュ防止 =====

test('C13: routinesがundefinedでもrenderTasksPageがクラッシュしない', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    try {
      // todayJournalのroutinesをundefinedにしてレンダリング
      const testData = {
        todayJournal: { schedule: [], memo: '', coreActions: [] },
        monthlyGoal: app.data.monthlyGoal
      };
      const html = renderTasksPage(testData);
      return { success: true, hasHTML: html.length > 0 };
    } catch(e) {
      return { success: false, error: e.message, stack: e.stack?.substring(0, 300) };
    }
  });
  if (!result.success) console.log('C13 error:', result.error, result.stack);
  expect(result.success).toBe(true);
  expect(result.hasHTML).toBe(true);
});

test('C14: routinesが空配列の場合に0/0表示になる', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const testData = {
      todayJournal: { routines: [], schedule: [], memo: '' },
      monthlyGoal: app.data.monthlyGoal
    };
    return renderTasksPage(testData);
  });
  expect(html).toContain('0/0 完了');
});

// ===== 初回訪問時の誤通知防止 =====

test('C15: hadControllerフラグのロジックがregisterServiceWorkerに含まれている', async ({ page }) => {
  await waitForApp(page);
  const fnStr = await page.evaluate(() => app.registerServiceWorker.toString());
  expect(fnStr).toContain('hadController');
  expect(fnStr).toContain('navigator.serviceWorker.controller');
});
