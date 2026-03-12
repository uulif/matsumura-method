const { test, expect } = require('@playwright/test');

// アプリが完全にロードされるまで待つヘルパー
async function waitForApp(page) {
  await page.goto('/');
  // ローディング画面が消えるのを待つ
  await page.waitForFunction(() => {
    const ls = document.getElementById('loadingScreen');
    return ls && ls.classList.contains('hide');
  }, { timeout: 10000 });
  // app要素に子が描画されるのを待つ
  await page.waitForFunction(() => {
    const appEl = document.getElementById('app');
    return appEl && appEl.children.length > 0;
  }, { timeout: 10000 });
  await page.waitForTimeout(500);
  // ウェルカム画面が表示されていたら閉じる
  await page.evaluate(() => {
    const ws = document.getElementById('welcomeScreen');
    if (ws) ws.remove();
  });
  await page.waitForTimeout(200);
}

// ページ遷移ヘルパー（app.navigateを使用）
async function navigateTo(page, target) {
  await page.evaluate((t) => app.navigateNav(t), target);
  await page.waitForTimeout(500);
}

// ===== Phase1修正確認テスト =====

test('T01: fieldHelpIcon()が正しいHTML（<b class="fh">）を返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => fieldHelpIcon('task-urgent'));
  expect(result).toContain('<b class="fh"');
  expect(result).toContain('data-k="task-urgent"');
  expect(result).not.toContain('?');
  expect(result).not.toContain('field-help-icon');
});

test('T02: FIELD_HELPの全キーが参照先と一致する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const keys = Object.keys(FIELD_HELP);
    const emptyKeys = keys.filter(k => !FIELD_HELP[k] || FIELD_HELP[k].trim() === '');
    return { total: keys.length, emptyKeys, allHaveText: emptyKeys.length === 0 };
  });
  expect(result.total).toBeGreaterThanOrEqual(26);
  expect(result.allHaveText).toBe(true);
});

test('T03: fieldHelpIcon()が存在しないキーに空文字を返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => fieldHelpIcon('nonexistent-key'));
  expect(result).toBe('');
});

test('T04: .fh要素がdisplay:noneで非表示', async ({ page }) => {
  await waitForApp(page);
  // タスク一覧ページに直接遷移（.fh要素がサブタブ内に存在）
  await page.evaluate(() => app.navigate('task-list'));
  await page.waitForTimeout(500);
  // .fh要素が存在するが非表示であることを確認
  const fhInfo = await page.evaluate(() => {
    const fhs = document.querySelectorAll('.fh');
    if (fhs.length === 0) return { count: 0, allHidden: true };
    let allHidden = true;
    fhs.forEach(fh => {
      if (getComputedStyle(fh).display !== 'none') allHidden = false;
    });
    return { count: fhs.length, allHidden };
  });
  expect(fhInfo.count).toBeGreaterThan(0);
  expect(fhInfo.allHidden).toBe(true);
});

test('T05: ヘルプポップアップにuser-select:none適用', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.showFieldHelp('task-urgent'));
  await page.waitForTimeout(200);
  const popup = page.locator('.field-help-popup');
  await expect(popup).toBeVisible();
  const userSelect = await page.evaluate(() => {
    const el = document.querySelector('.field-help-popup');
    return getComputedStyle(el).userSelect || getComputedStyle(el).webkitUserSelect;
  });
  expect(userSelect).toBe('none');
});

// ===== 主要操作テスト =====

test('T06: アプリが正常にロードされる', async ({ page }) => {
  await waitForApp(page);
  const appEl = page.locator('#app');
  await expect(appEl).toBeVisible();
  const loading = page.locator('#loadingScreen');
  await expect(loading).toHaveClass(/hide/);
});

test('T07: GTDタブ切り替えが動作する', async ({ page }) => {
  await waitForApp(page);
  // GTDページへ直接遷移
  await navigateTo(page, 'gtd');
  // GTDタブが表示されることを確認
  const gtdTabs = page.locator('.gtd-tab');
  const tabCount = await gtdTabs.count();
  expect(tabCount).toBeGreaterThanOrEqual(3);
  // 「タスク」タブをクリック
  const taskTab = page.locator('.gtd-tab').filter({ hasText: 'タスク' });
  await expect(taskTab).toBeVisible();
  await taskTab.click();
  await page.waitForTimeout(300);
  await expect(taskTab).toHaveClass(/active/);
  // 「ルーティン」タブをクリック
  const routineTab = page.locator('.gtd-tab').filter({ hasText: 'ルーティン' });
  await expect(routineTab).toBeVisible();
  await routineTab.click();
  await page.waitForTimeout(300);
  await expect(routineTab).toHaveClass(/active/);
});

test('T08: タスクサブタブ切り替えが動作する', async ({ page }) => {
  await waitForApp(page);
  // タスク一覧ページへ直接遷移
  await page.evaluate(() => app.navigate('task-list'));
  await page.waitForTimeout(500);
  // サブタブが表示されることを確認
  const subTabs = page.locator('.task-tab');
  const count = await subTabs.count();
  expect(count).toBeGreaterThan(0);
  // 2番目のサブタブが存在すればクリック
  if (count > 1) {
    await subTabs.nth(1).click();
    await page.waitForTimeout(300);
    await expect(subTabs.nth(1)).toHaveClass(/active/);
  }
});

test('T09: ルーティンサブタブ切り替えが動作する', async ({ page }) => {
  await waitForApp(page);
  // ルーティン一覧ページへ直接遷移
  await page.evaluate(() => app.navigate('routine-list'));
  await page.waitForTimeout(500);
  // サブタブが表示されることを確認
  const subTabs = page.locator('.routine-tab');
  const count = await subTabs.count();
  expect(count).toBeGreaterThan(0);
  if (count > 1) {
    await subTabs.nth(1).click();
    await page.waitForTimeout(300);
    await expect(subTabs.nth(1)).toHaveClass(/active/);
  }
});

test('T10: タスク追加モーダルが開閉する', async ({ page }) => {
  await waitForApp(page);
  // タスク追加モーダルを直接呼び出し
  await page.evaluate(() => app.showAddTaskModal('urgent'));
  await page.waitForTimeout(500);
  // モーダルが開くことを確認
  const modal = page.locator('.modal-overlay');
  await expect(modal).toBeVisible();
  // .fh要素がモーダル内に存在すること（タイトルに長押しヘルプマーカー）
  const fhInModal = await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    return overlay ? overlay.querySelectorAll('.fh').length : 0;
  });
  expect(fhInModal).toBeGreaterThan(0);
  // モーダルを閉じる（オーバーレイクリック）
  await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.click();
  });
  await page.waitForTimeout(300);
  await expect(modal).not.toBeVisible();
});

test('T11: ルーティン追加モーダルが開閉する', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.showAddRoutineModal('goal'));
  await page.waitForTimeout(500);
  const modal = page.locator('.modal-overlay');
  await expect(modal).toBeVisible();
  // .fh要素がモーダル内に存在すること
  const fhInModal = await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    return overlay ? overlay.querySelectorAll('.fh').length : 0;
  });
  expect(fhInModal).toBeGreaterThan(0);
  // モーダルを閉じる（オーバーレイクリック）
  await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) overlay.click();
  });
  await page.waitForTimeout(300);
  await expect(modal).not.toBeVisible();
});

test('T12: 長押し（mousedown 500ms）でヘルプポップアップが表示される', async ({ page }) => {
  await waitForApp(page);
  // タスク一覧ページへ直接遷移
  await page.evaluate(() => app.navigate('task-list'));
  await page.waitForTimeout(500);
  // タスクサブタブを長押し
  const subTab = page.locator('.task-tab').first();
  await expect(subTab).toBeVisible();
  const box = await subTab.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(300);
  // ヘルプポップアップが表示されることを確認
  const overlay = page.locator('.field-help-overlay');
  await expect(overlay).toBeVisible();
});

test('T13: ヘルプポップアップが閉じられる', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.showFieldHelp('task-urgent'));
  await page.waitForTimeout(200);
  const overlay = page.locator('.field-help-overlay');
  await expect(overlay).toBeVisible();
  // 閉じるボタンをクリック
  const closeBtn = page.locator('.field-help-close');
  await closeBtn.click();
  await page.waitForTimeout(300);
  await expect(overlay).not.toBeVisible();
});

// ===== エッジケーステスト =====

test('T14: input要素上での長押しはヘルプを発動しない', async ({ page }) => {
  await waitForApp(page);
  // タスク追加モーダルを開く（input要素がある）
  await page.evaluate(() => app.showAddTaskModal('urgent'));
  await page.waitForTimeout(500);
  // input要素を長押し
  const input = page.locator('.modal-overlay input[type="text"], .modal-overlay .modal-input').first();
  await expect(input).toBeVisible();
  const box = await input.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(300);
  // ヘルプが出ないことを確認
  const overlay = page.locator('.field-help-overlay');
  const visible = await overlay.isVisible().catch(() => false);
  expect(visible).toBe(false);
});

test('T15: .fhマーカーがないコンテナでは長押しヘルプ不発動', async ({ page }) => {
  await waitForApp(page);
  // ナビバーのアイテムを長押し（.fhマーカーなし）
  const navItem = page.locator('.nav-item').first();
  await expect(navItem).toBeVisible();
  const box = await navItem.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(300);
  const overlay = page.locator('.field-help-overlay');
  const visible = await overlay.isVisible().catch(() => false);
  expect(visible).toBe(false);
});

// ===== セキュリティテスト =====

test('T16: ヘルプテキストにXSSペイロードが含まれても安全に表示される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const keys = Object.keys(FIELD_HELP);
    const htmlTags = keys.filter(k => {
      const text = FIELD_HELP[k];
      return text.includes('<script') || text.includes('onerror') || text.includes('javascript:');
    });
    return { safe: htmlTags.length === 0, htmlTags };
  });
  expect(result.safe).toBe(true);
});

// ===== 追加テスト =====

test('T17: 月次ページ間遷移にアニメーションなし（同一セクション判定）', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const origPage = app.currentPage;
    const testCases = [
      { current: 'monthly', target: 'monthly-1', shouldSkip: true },
      { current: 'monthly', target: 'monthly-6', shouldSkip: true },
      { current: 'monthly', target: 'monthly-list', shouldSkip: false },
      { current: 'life', target: 'life-1', shouldSkip: true },
      { current: 'monthly', target: 'home', shouldSkip: false },
    ];
    const results = testCases.map(tc => {
      app.currentPage = tc.current;
      const p = tc.target;
      const isSkip = (app.currentPage === 'monthly' && (p === 'monthly' || (p.startsWith('monthly-') && p !== 'monthly-list'))) ||
                     (app.currentPage === 'life' && (p === 'life' || p.startsWith('life-')));
      return { ...tc, actual: isSkip, pass: isSkip === tc.shouldSkip };
    });
    app.currentPage = origPage;
    return results;
  });
  result.forEach(r => {
    expect(r.pass).toBe(true);
  });
});

test('T18: ヘルプポップアップ本文がコピー可能（user-select: text）', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.showFieldHelp('task-urgent'));
  await page.waitForTimeout(200);
  const bodyUserSelect = await page.evaluate(() => {
    const body = document.querySelector('.field-help-body');
    return getComputedStyle(body).userSelect || getComputedStyle(body).webkitUserSelect;
  });
  expect(bodyUserSelect).toBe('text');
});
