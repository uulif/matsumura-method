const { test, expect } = require('@playwright/test');

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

// ===== Firebase移行後テスト（v308） =====

test('D01: initFirebaseメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.initFirebase === 'function');
  expect(exists).toBe(true);
});

test('D02: linkGoogleAccountメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.linkGoogleAccount === 'function');
  expect(exists).toBe(true);
});

test('D03: unlinkGoogleAccountメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.unlinkGoogleAccount === 'function');
  expect(exists).toBe(true);
});

test('D04: _autoSyncToCloudがasync関数である', async ({ page }) => {
  await waitForApp(page);
  const isAsync = await page.evaluate(() => {
    return app._autoSyncToCloud.constructor.name === 'AsyncFunction';
  });
  expect(isAsync).toBe(true);
});

test('D05: _autoRestoreFromCloudがasync関数である', async ({ page }) => {
  await waitForApp(page);
  const isAsync = await page.evaluate(() => {
    return app._autoRestoreFromCloud.constructor.name === 'AsyncFunction';
  });
  expect(isAsync).toBe(true);
});

test('D06: backupToCloudメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.backupToCloud === 'function');
  expect(exists).toBe(true);
});

test('D07: restoreFromCloudメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.restoreFromCloud === 'function');
  expect(exists).toBe(true);
});

test('D08: refreshFromCloudメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.refreshFromCloud === 'function');
  expect(exists).toBe(true);
});

test('D09: _collectBackupDataが全データを収集する', async ({ page }) => {
  await waitForApp(page);
  const keys = await page.evaluate(async () => {
    const data = await app._collectBackupData();
    return Object.keys(data);
  });
  expect(keys).toContain('journals');
  expect(keys).toContain('settings');
  expect(keys).toContain('tasks');
  expect(keys).toContain('routines');
  expect(keys).toContain('exportDate');
});

test('D10: _restoreDataメソッドが存在し設定を復元する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    await app._restoreData({
      settings: { themeColor: 'test-blue' }
    });
    return await getSetting('themeColor');
  });
  expect(result).toBe('test-blue');
});

test('D11: _restoreDataがLOCAL_ONLY_SETTINGSを除外する', async ({ page }) => {
  await waitForApp(page);
  const preserved = await page.evaluate(async () => {
    await saveSetting('lastCloudSync', '2026-03-14');
    await app._restoreData({
      settings: { lastCloudSync: '2025-01-01', themeColor: 'green' }
    });
    const lcs = await getSetting('lastCloudSync');
    const tc = await getSetting('themeColor');
    return { lcs, tc };
  });
  expect(preserved.lcs).toBe('2026-03-14');
  expect(preserved.tc).toBe('green');
});

test('D12: _LOCAL_ONLY_SETTINGSが配列で定義されている', async ({ page }) => {
  await waitForApp(page);
  const valid = await page.evaluate(() => {
    return Array.isArray(app._LOCAL_ONLY_SETTINGS) &&
           app._LOCAL_ONLY_SETTINGS.includes('lastCloudSync');
  });
  expect(valid).toBe(true);
});

test('D13: syncStatusプロパティが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => {
    return typeof app.syncStatus === 'string';
  });
  expect(exists).toBe(true);
});

test('D14: _updateSyncStatusがステータスを更新する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app._updateSyncStatus('syncing');
    const status = app.syncStatus;
    app._updateSyncStatus('offline');
    return status;
  });
  expect(result).toBe('syncing');
});

test('D15: firebaseDBプロパティが初期化されている', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => {
    return app.firebaseDB !== undefined;
  });
  expect(exists).toBe(true);
});
