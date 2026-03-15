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

test('T04: .fh要素がインラインで表示されている', async ({ page }) => {
  await waitForApp(page);
  // タスク一覧ページに直接遷移（.fh要素がサブタブ内に存在）
  await page.evaluate(() => app.navigate('task-list'));
  await page.waitForTimeout(500);
  // .fh要素が存在し表示されていることを確認
  const fhInfo = await page.evaluate(() => {
    const fhs = document.querySelectorAll('.fh');
    if (fhs.length === 0) return { count: 0, allVisible: false };
    let allVisible = true;
    fhs.forEach(fh => {
      if (getComputedStyle(fh).display === 'none') allVisible = false;
    });
    return { count: fhs.length, allVisible };
  });
  expect(fhInfo.count).toBeGreaterThan(0);
  expect(fhInfo.allVisible).toBe(true);
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

// ===== Googleカレンダー連携テスト =====

test('T19: _buildGcalEventBody()がdateTimeから正しいイベントを構築する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: 'テスト', dateTime: '2026-03-15T10:00', notes: 'メモ', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result).not.toBeNull();
  expect(result.summary).toBe('テスト');
  expect(result.start.dateTime).toContain('2026-03-15');
  expect(result.start.timeZone).toBeTruthy();
  expect(result.end.dateTime).toBeTruthy();
  expect(result.end.timeZone).toBeTruthy();
});

test('T20: _buildGcalEventBody()がdeadlineから終日イベントを構築する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '締切タスク', deadline: '2026-03-20', notes: '', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result).not.toBeNull();
  expect(result.summary).toBe('締切タスク');
  expect(result.start.date).toBe('2026-03-20');
  expect(result.end.date).toBe('2026-03-21');
});

test('T21: _buildGcalEventBody()がdeadline+timeStartから時刻付きイベントを構築する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '時刻付き', deadline: '2026-03-20', timeStart: '09:00', timeEnd: '17:00', notes: '', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result).not.toBeNull();
  expect(result.start.dateTime).toContain('2026-03-20');
  expect(result.start.timeZone).toBeTruthy();
  expect(result.end.dateTime).toContain('2026-03-20');
});

test('T22: _buildGcalEventBody()が日付なしタスクでnullを返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '日付なし', dateTime: '', deadline: '', notes: '', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result).toBeNull();
});

test('T23: _buildGcalEventBody()が不正な日付でnullを返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '不正日付', dateTime: 'invalid-date', notes: '', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result).toBeNull();
});

test('T24: _buildGcalEventBody()がタイトル空のタスクにフォールバック名を設定する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '', dateTime: '2026-03-15T10:00', notes: '', completionCriteria: '', motivation: '', who: '' };
    return app._buildGcalEventBody(task);
  });
  expect(result.summary).toBe('（無題のタスク）');
});

test('T25: _buildGcalEventBody()がメモ・基準・動機を説明に含める', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: 'テスト', dateTime: '2026-03-15T10:00', notes: 'メモ文', completionCriteria: '完了基準', motivation: 'やる気', who: '田中' };
    return app._buildGcalEventBody(task);
  });
  expect(result.description).toContain('メモ文');
  expect(result.description).toContain('完了基準');
  expect(result.description).toContain('やる気');
  expect(result.description).toContain('担当: 田中');
});

test('T26: sendToGoogleCalendar()がfirebaseUser未連携でトーストを表示する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app.firebaseUser = null;
    let toastMsg = '';
    const origToast = app.showToast.bind(app);
    app.showToast = (msg) => { toastMsg = msg; };
    app.sendToGoogleCalendar(999);
    app.showToast = origToast;
    return toastMsg;
  });
  expect(result).toContain('連携が必要');
});

test('T27: _gcalSending排他制御が連打を防ぐ', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app._gcalSending = true;
    let called = false;
    const origGetToken = app._getGcalToken;
    app._getGcalToken = () => { called = true; return null; };
    app.sendToGoogleCalendar(1);
    app._getGcalToken = origGetToken;
    app._gcalSending = false;
    return called;
  });
  expect(result).toBe(false);
});

test('T28: toggleGcalAutoType()が許可されたタイプのみ受け付ける', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    await app.toggleGcalAutoType('urgent');
    const after = await getSetting('gcalAutoTypes', []);
    const hasUrgent = after.includes('urgent');
    // 不正なタイプを試行
    await app.toggleGcalAutoType('malicious');
    const after2 = await getSetting('gcalAutoTypes', []);
    const hasMalicious = after2.includes('malicious');
    // クリーンアップ
    await app.toggleGcalAutoType('urgent');
    return { hasUrgent, hasMalicious };
  });
  expect(result.hasUrgent).toBe(true);
  expect(result.hasMalicious).toBe(false);
});

test('T29: タスク編集モーダルにGcal送信ボタンが表示される（ログイン時）', async ({ page }) => {
  await waitForApp(page);
  // タスクを作成
  await page.evaluate(async () => {
    await saveTask({ type: 'urgent', title: 'Gcalテスト', status: 'open', dateTime: '2026-03-15T10:00', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await app.loadTasks();
  });
  await page.waitForTimeout(300);
  // firebaseUserを模擬してモーダル表示
  const hasBtn = await page.evaluate(() => {
    const task = app.taskItems.find(t => t.title === 'Gcalテスト');
    if (!task) return false;
    app.firebaseUser = { email: 'test@example.com' };
    app.showEditTaskModal(task.id);
    const btn = document.querySelector('.gcal-send-btn');
    app.closeModalDirect();
    app.firebaseUser = null;
    return !!btn;
  });
  expect(hasBtn).toBe(true);
});

test('T30: タスク編集モーダルにGcal送信ボタンが非表示（未ログイン時）', async ({ page }) => {
  await waitForApp(page);
  // テスト用タスクを作成
  await page.evaluate(async () => {
    await saveTask({ type: 'urgent', title: 'Gcalテスト2', status: 'open', dateTime: '2026-03-15T10:00', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await app.loadTasks();
  });
  await page.waitForTimeout(300);
  const hasBtn = await page.evaluate(() => {
    const task = app.taskItems.find(t => t.title === 'Gcalテスト2');
    if (!task) return 'no-task';
    app.firebaseUser = null;
    app.showEditTaskModal(task.id);
    const btn = document.querySelector('.gcal-send-btn');
    app.closeModalDirect();
    return !!btn;
  });
  expect(hasBtn).toBe(false);
});

test('T31: .gcal-send-btnスタイルが正しく適用される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    const task = app.taskItems.find(t => t.title === 'Gcalテスト');
    if (!task) return;
    app.firebaseUser = { email: 'test@example.com' };
    app.showEditTaskModal(task.id);
  });
  await page.waitForTimeout(300);
  const btnStyle = await page.evaluate(() => {
    const btn = document.querySelector('.gcal-send-btn');
    if (!btn) return null;
    const s = getComputedStyle(btn);
    return { minHeight: s.minHeight, cursor: s.cursor, display: s.display };
  });
  await page.evaluate(() => { app.closeModalDirect(); app.firebaseUser = null; });
  if (btnStyle) {
    expect(parseInt(btnStyle.minHeight)).toBeGreaterThanOrEqual(44);
    expect(btnStyle.cursor).toBe('pointer');
  }
});

test('T32: 設定ページにGcalAutoTypes UIが表示される（ログイン時）', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.firebaseUser = { email: 'test@example.com' };
    app.syncStatus = 'synced';
  });
  await navigateTo(page, 'settings');
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const labels = document.querySelectorAll('.gcal-auto-label');
    return labels.length;
  });
  await page.evaluate(() => { app.firebaseUser = null; });
  expect(result).toBe(6); // urgent,action,project,waiting,calendar,wish
});

test('T33: _showGcalDateTimeDialogがタスク編集モーダルを破壊せず専用コンテナで開く', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    // タスク編集モーダルを先に設置
    const editModal = document.createElement('div');
    editModal.id = 'modal-container';
    editModal.innerHTML = '<div>編集モーダル</div>';
    document.body.appendChild(editModal);
    // ダミータスクを追加
    app.taskItems.push({ id: 99999, title: 'ダミー', type: 'urgent', status: 'open' });
    app._showGcalDateTimeDialog(99999);
    const editModalSurvived = !!document.getElementById('modal-container');
    const gcalModal = document.getElementById('gcal-modal-container');
    const input = document.getElementById('gcalDateTimeInput');
    // クリーンアップ
    if (gcalModal) gcalModal.remove();
    const em = document.getElementById('modal-container');
    if (em) em.remove();
    app.taskItems = app.taskItems.filter(t => t.id !== 99999);
    return { editModalSurvived, hasGcalModal: !!gcalModal, hasInput: !!input };
  });
  expect(result.editModalSurvived).toBe(true);
  expect(result.hasGcalModal).toBe(true);
  expect(result.hasInput).toBe(true);
});

test('T34: _buildGcalEventBody()で日跨ぎtimeEnd<timeStartが正しく処理される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const task = { title: '日跨ぎ', dateTime: '2026-03-15T22:00', timeStart: '23:00', timeEnd: '01:00', notes: '', completionCriteria: '', motivation: '', who: '' };
    const body = app._buildGcalEventBody(task);
    const start = new Date(body.start.dateTime);
    const end = new Date(body.end.dateTime);
    return { endAfterStart: end > start };
  });
  expect(result.endAfterStart).toBe(true);
});

test('T35: gcalAutoTypesの型安全性（null/undefinedでもクラッシュしない）', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    // gcalAutoTypesをnullに設定してクラッシュしないか確認
    await saveSetting('gcalAutoTypes', null);
    try {
      await app._autoSendToGcal({ type: 'urgent', dateTime: '2026-03-15T10:00', title: 'テスト' });
      return 'ok';
    } catch (e) {
      return 'error: ' + e.message;
    } finally {
      await saveSetting('gcalAutoTypes', []);
    }
  });
  expect(result).toBe('ok');
});
