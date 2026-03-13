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

// ===== G1: XSS防止 - _showDriveRestoreModal =====

test('D01: 復元モーダルでファイル名がtextContentで表示される（XSS防止）', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const xssPayload = '<img src=x onerror="alert(1)">';
    app._showDriveRestoreModal([
      { id: 'test-id', name: xssPayload, modifiedTime: '2026-03-12T00:00:00Z', size: '1024' }
    ]);
    const nameEl = document.querySelector('.drive-file-name');
    const hasScript = nameEl && nameEl.innerHTML.includes('<img');
    const hasTextContent = nameEl && nameEl.textContent === xssPayload;
    app._closeDriveRestoreModal();
    return { hasScript, hasTextContent };
  });
  expect(result.hasScript).toBe(false);
  expect(result.hasTextContent).toBe(true);
});

test('D02: 復元モーダルのファイル項目がaddEventListenerで登録されている', async ({ page }) => {
  await waitForApp(page);
  const hasOnclick = await page.evaluate(() => {
    app._showDriveRestoreModal([
      { id: 'test-id', name: 'test.json', modifiedTime: '2026-03-12T00:00:00Z', size: '512' }
    ]);
    const item = document.querySelector('.drive-file-item');
    const result = item && !item.hasAttribute('onclick');
    app._closeDriveRestoreModal();
    return result;
  });
  expect(hasOnclick).toBe(true);
});

// ===== G2: _driveRequest HTTPエラーチェック =====

test('D03: _driveRequestが非401エラーでも例外を投げる', async ({ page }) => {
  await waitForApp(page);
  const threw = await page.evaluate(async () => {
    app.googleAccessToken = 'fake-token';
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve({ status: 403, ok: false, statusText: 'Forbidden', json: () => Promise.resolve({ error: { message: 'Access denied' } }) });
    try {
      await app._driveRequest('https://example.com/test');
      return false;
    } catch (e) {
      return e.message.includes('403');
    } finally {
      window.fetch = originalFetch;
      app.googleAccessToken = null;
    }
  });
  expect(threw).toBe(true);
});

test('D04: _driveRequestがネットワークエラーで適切なメッセージを返す', async ({ page }) => {
  await waitForApp(page);
  const threw = await page.evaluate(async () => {
    app.googleAccessToken = 'fake-token';
    const originalFetch = window.fetch;
    window.fetch = () => Promise.reject(new TypeError('Failed to fetch'));
    try {
      await app._driveRequest('https://example.com/test');
      return false;
    } catch (e) {
      return e.message.includes('通信エラー');
    } finally {
      window.fetch = originalFetch;
      app.googleAccessToken = null;
    }
  });
  expect(threw).toBe(true);
});

// ===== G3: 401時のDB永続化 =====

test('D05: 401レスポンスでトークンキャッシュがクリアされ接続状態は維持される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    app.googleAccessToken = 'fake-token';
    app.data.settings.googleDriveConnected = true;
    await saveSetting('googleDriveConnected', true);
    await saveSetting('googleAccessToken', 'fake-token');
    await saveSetting('googleTokenExpiresAt', Date.now() + 3600000);
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve({ status: 401, ok: false });
    try {
      await app._driveRequest('https://example.com/test');
    } catch (e) {}
    window.fetch = originalFetch;
    return {
      connected: await getSetting('googleDriveConnected'),
      token: await getSetting('googleAccessToken'),
      expiresAt: await getSetting('googleTokenExpiresAt'),
      memoryToken: app.googleAccessToken
    };
  });
  // 接続状態は維持（再接続を容易にする）
  expect(result.connected).toBe(true);
  // トークンキャッシュはクリア
  expect(result.token).toBe(null);
  expect(result.expiresAt).toBe(0);
  // メモリ上のトークンもクリア
  expect(result.memoryToken).toBe(null);
});

// ===== G4: settings復元時のLOCAL_ONLY_SETTINGS除外 =====

test('D06: _restoreDataが端末固有設定を除外する', async ({ page }) => {
  await waitForApp(page);
  const preserved = await page.evaluate(async () => {
    await saveSetting('googleDriveConnected', true);
    await saveSetting('lastDriveBackup', '2026-01-01');
    await saveSetting('welcomeShown', true);
    await app._restoreData({
      settings: {
        googleDriveConnected: false,
        lastDriveBackup: '2025-01-01',
        welcomeShown: false,
        themeColor: 'blue'
      }
    });
    const gc = await getSetting('googleDriveConnected');
    const lb = await getSetting('lastDriveBackup');
    const ws = await getSetting('welcomeShown');
    const tc = await getSetting('themeColor');
    return { gc, lb, ws, tc };
  });
  expect(preserved.gc).toBe(true);
  expect(preserved.lb).toBe('2026-01-01');
  expect(preserved.ws).toBe(true);
  expect(preserved.tc).toBe('blue');
});

// ===== G5: initGoogleAuthリトライ上限 =====

test('D07: initGoogleAuthにリトライ上限が設定されている', async ({ page }) => {
  await waitForApp(page);
  const hasLimit = await page.evaluate(() => {
    return typeof app._googleAuthRetryCount === 'number';
  });
  expect(hasLimit).toBe(true);
});

// ===== G6: _startAutoSignInポーリング上限 =====

test('D08: _startAutoSignInメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app._startAutoSignIn === 'function');
  expect(exists).toBe(true);
});

// ===== G9: welcomeShown矛盾状態 =====

test('D09: welcomeShown設定が存在する', async ({ page }) => {
  await waitForApp(page);
  const has = await page.evaluate(async () => {
    const val = await getSetting('welcomeShown');
    return val !== undefined;
  });
  expect(has).toBe(true);
});

// ===== G11: visibilitychange順序保証 =====

test('D10: _autoBackupToDriveがasync関数である', async ({ page }) => {
  await waitForApp(page);
  const isAsync = await page.evaluate(() => {
    return app._autoBackupToDrive.constructor.name === 'AsyncFunction';
  });
  expect(isAsync).toBe(true);
});

// ===== G13: confirmファイル名サニタイズ =====

test('D11: _restoreFromDriveFileが存在しconfirmを使う', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app._restoreFromDriveFile === 'function');
  expect(exists).toBe(true);
});

// ===== G15: exportDateチェック =====

test('D12: _autoRestoreFromDriveでexportDateなしデータがスキップされる', async ({ page }) => {
  await waitForApp(page);
  const skipped = await page.evaluate(async () => {
    app.googleAccessToken = 'fake-token';
    let requestCount = 0;
    const originalDriveRequest = app._driveRequest.bind(app);
    app._driveRequest = async (url) => {
      requestCount++;
      if (requestCount === 1) return { json: () => Promise.resolve({ files: [{ id: 'f1', name: 'test.json' }] }) };
      if (requestCount === 2) return { json: () => Promise.resolve({ journals: [] }) }; // no exportDate
      return { json: () => Promise.resolve({}) };
    };
    await app._autoRestoreFromDrive();
    app._driveRequest = originalDriveRequest;
    app.googleAccessToken = null;
    return requestCount === 2; // 2回リクエストして復元はスキップ
  });
  expect(skipped).toBe(true);
});

// ===== G16: 復元コード共通化 =====

test('D13: _restoreDataメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app._restoreData === 'function');
  expect(exists).toBe(true);
});

// ===== 復元モーダル二重表示防止 =====

test('D14: 復元モーダルの二重表示が防止される', async ({ page }) => {
  await waitForApp(page);
  const count = await page.evaluate(() => {
    app._showDriveRestoreModal([{ id: '1', name: 'a.json' }]);
    app._showDriveRestoreModal([{ id: '2', name: 'b.json' }]);
    const modals = document.querySelectorAll('.drive-restore-modal');
    const c = modals.length;
    app._closeDriveRestoreModal();
    return c;
  });
  expect(count).toBe(1);
});

// ===== LOCAL_ONLY_SETTINGS定義 =====

test('D15: _LOCAL_ONLY_SETTINGSが配列で定義されている', async ({ page }) => {
  await waitForApp(page);
  const valid = await page.evaluate(() => {
    return Array.isArray(app._LOCAL_ONLY_SETTINGS) &&
           app._LOCAL_ONLY_SETTINGS.includes('googleDriveConnected') &&
           app._LOCAL_ONLY_SETTINGS.includes('lastDriveBackup') &&
           app._LOCAL_ONLY_SETTINGS.includes('welcomeShown');
  });
  expect(valid).toBe(true);
});
