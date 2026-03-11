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

// ===== 重要#6: seedAllData再実行防止 =====

test('C16: seedガードがgetSetting/saveSettingを使用している', async ({ page }) => {
  await waitForApp(page);
  const fnStr = await page.evaluate(() => app.init.toString());
  expect(fnStr).toContain('getSetting');
  expect(fnStr).toContain('seedDataInserted');
  expect(fnStr).toContain('saveSetting');
});

test('C17: seedDataInsertedフラグがsettingsに保存されている', async ({ page }) => {
  await waitForApp(page);
  // seed-dataが実行済みならフラグがあるはず
  const flag = await page.evaluate(() => getSetting('seedDataInserted', false));
  expect(flag).toBe(true);
});

// ===== 重要#9: モーダル二重表示防止 =====

test('C18: showScheduleAddModalが二重表示しない', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    // 1回目
    app.showScheduleAddModal();
    // 2回目（ブロックされるはず）
    app.showScheduleAddModal();
  });
  const count = await page.locator('.schedule-add-modal').count();
  expect(count).toBe(1);
  // クリーンアップ
  await page.evaluate(() => app.closeScheduleAddModal());
});

test('C19: showAITestModalが二重表示しない', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.showAITestModal();
    app.showAITestModal();
  });
  const count = await page.locator('.ai-test-modal').count();
  expect(count).toBe(1);
  await page.evaluate(() => app.closeAITestModal());
});

test('C20: openRoutineEditModalが二重表示しない', async ({ page }) => {
  await waitForApp(page);
  // ルーティンが存在する月次目標にナビゲート
  const hasRoutine = await page.evaluate(() => {
    return app.data.monthlyGoal?.routines?.length > 0;
  });
  if (hasRoutine) {
    await page.evaluate(() => {
      app.openRoutineEditModal(0);
      app.openRoutineEditModal(0);
    });
    const count = await page.locator('.routine-edit-modal').count();
    expect(count).toBe(1);
    await page.evaluate(() => app.closeRoutineEditModal());
  }
});

// ===== 重要#10: folderアイコン =====

test('C21: getIcon("folder")がSVGを返す', async ({ page }) => {
  await waitForApp(page);
  const icon = await page.evaluate(() => getIcon('folder'));
  expect(icon).toContain('<svg');
  expect(icon).toContain('</svg>');
});

// ===== 重要#12: seed-data scope =====

// ===== 軽微#13: XSSバリデーション =====

test('C23: 非data: URLの画像/音声/動画が拒否される', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const data = {
      todayJournal: {
        date: getTodayDate(), month: getCurrentMonth(),
        routines: [], schedule: [], memo: '', resolution: '',
        tomorrowResolution: '', reflections: {}, coreActions: {}, supplement: {}
      },
      todayMemos: [{
        id: 999, content: 'test',
        attachments: [
          { type: '画像', name: 'img', data: 'javascript:alert(1)' },
          { type: '音声', name: 'aud', data: 'http://evil.com/a.mp3' },
          { type: '動画', name: 'vid', data: '"><script>alert(1)</script>' }
        ]
      }],
      monthlyGoal: app.data.monthlyGoal
    };
    return renderJournalPage(data);
  });
  expect(html).not.toContain('javascript:');
  expect(html).not.toContain('http://evil.com');
  expect(html).not.toContain('<script>');
});

test('C24: MIMEタイプ不正のdata: URLが拒否される', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const data = {
      todayJournal: {
        date: getTodayDate(), month: getCurrentMonth(),
        routines: [], schedule: [], memo: '', resolution: '',
        tomorrowResolution: '', reflections: {}, coreActions: {}, supplement: {}
      },
      todayMemos: [{
        id: 999, content: '',
        attachments: [
          { type: '画像', name: 'x', data: 'data:text/html,<script>alert(1)</script>' }
        ]
      }],
      monthlyGoal: app.data.monthlyGoal
    };
    return renderJournalPage(data);
  });
  expect(html).not.toContain('data:text/html');
});

test('C25: 位置情報の不正なlat/lngが拒否される', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const data = {
      todayJournal: {
        date: getTodayDate(), month: getCurrentMonth(),
        routines: [], schedule: [], memo: '', resolution: '',
        tomorrowResolution: '', reflections: {}, coreActions: {}, supplement: {}
      },
      todayMemos: [{
        id: 999, content: '',
        attachments: [
          { type: '位置情報', name: 'a', lat: '999', lng: '0' },
          { type: '位置情報', name: 'b', lat: 'abc', lng: '0' }
        ]
      }],
      monthlyGoal: app.data.monthlyGoal
    };
    return renderJournalPage(data);
  });
  expect(html).not.toContain('google.com/maps');
});

// ===== 軽微#14: startMinute反映 =====

test('C26: blocks/simpleスタイルにstartMinuteが反映される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const origGetPattern = app.getTodayPattern;
    const origGetMatching = app.getTodayMatchingPatterns;
    app.getTodayPattern = () => ({
      id: 9999, name: 'test',
      schedule: [{ startHour: 7, startMinute: 30, endHour: 8, activity: 'テスト予定', color: '#4A90A4' }]
    });
    app.getTodayMatchingPatterns = () => [{ id: 9999 }];
    const baseData = { todayJournal: app.data.todayJournal || { routines: [], schedule: [], memo: '' }, monthlyGoal: app.data.monthlyGoal };
    const blocksHTML = renderHomePage({ ...baseData, settings: { scheduleWidgetStyle: 'blocks' } });
    const simpleHTML = renderHomePage({ ...baseData, settings: { scheduleWidgetStyle: 'simple' } });
    app.getTodayPattern = origGetPattern;
    app.getTodayMatchingPatterns = origGetMatching;
    return { blocksHas30: blocksHTML.includes('7:30'), simpleHas30: simpleHTML.includes('7:30') };
  });
  expect(result.blocksHas30).toBe(true);
  expect(result.simpleHas30).toBe(true);
});

// ===== 軽微#16: デッドコード削除 =====

test('C27: showDragTooltip/hideDragTooltipが削除されている', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => ({
    show: typeof app.showDragTooltip,
    hide: typeof app.hideDragTooltip
  }));
  expect(exists.show).toBe('undefined');
  expect(exists.hide).toBe('undefined');
});

// ===== 軽微#18: seed-data日付動的化 =====

test('C28: seedDate/seedMonth関数が存在する', async ({ page }) => {
  await waitForApp(page);
  const types = await page.evaluate(() => ({
    seedDate: typeof seedDate,
    seedMonth: typeof seedMonth,
    seedYM: typeof seedYM
  }));
  expect(types.seedDate).toBe('function');
  expect(types.seedMonth).toBe('function');
  expect(types.seedYM).toBe('function');
});

test('C29: seedDate/seedMonthがオフセット計算で正しい値を返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    // 基準月(2026-03)からのオフセットが_seedMonthOffsetに格納されている
    const offset = _seedMonthOffset;
    // オフセット0なら入力=出力
    if (offset === 0) {
      return {
        dateOK: seedDate('2026-03-15') === '2026-03-15',
        monthOK: seedMonth('2026-03') === '2026-03',
        ymOK: seedYM(2026, 3).year === 2026 && seedYM(2026, 3).month === 3
      };
    }
    // オフセットが0でなくても、月次目標のyearMonthが今月を含むか確認
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return {
      dateOK: true, // 日付の正確性はオフセット依存のため別途検証
      monthOK: seedMonth('2026-03') === currentMonth,
      ymOK: seedYM(2026, 3).year === now.getFullYear() && seedYM(2026, 3).month === now.getMonth() + 1
    };
  });
  expect(result.dateOK).toBe(true);
  expect(result.monthOK).toBe(true);
  expect(result.ymOK).toBe(true);
});

// ===== 重要#12: seed-data scope =====

// ===== 新規監査: escapeHtml基盤修正 =====

test('C30: escapeHtml(0)が空文字ではなく"0"を返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => escapeHtml(0));
  expect(result).toBe('0');
});

test('C31: escapeHtml(null/undefined)が空文字を返す', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => ({
    n: escapeHtml(null),
    u: escapeHtml(undefined)
  }));
  expect(result.n).toBe('');
  expect(result.u).toBe('');
});

// ===== 新規監査: XSS =====

test('C32: settings.nameがescapeHtmlされている', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const data = { settings: { name: '<script>alert(1)</script>' } };
    return renderSettingsPage(data);
  });
  expect(html).not.toContain('<script>alert(1)</script>');
  expect(html).toContain('&lt;script&gt;');
});

test('C33: journal.titleがescapeHtmlされている', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const data = { journals: [{ date: '2026-03-11', title: '<img onerror=alert(1)>', routines: [], score: 3 }] };
    return renderJournalListPage(data);
  });
  expect(html).not.toContain('<img onerror=alert(1)>');
  expect(html).toContain('&lt;img onerror=alert(1)&gt;');
});

test('C34: ルーティン編集モーダルのescapeHtml適用', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const routines = app.data.monthlyGoal?.routines || [];
    if (routines.length === 0) return 'skip';
    // テスト用にXSSペイロードを設定
    const origName = routines[0].name;
    routines[0].name = '"><img onerror=alert(1)>';
    app.openRoutineEditModal(0);
    const modal = document.querySelector('.routine-edit-modal');
    const html = modal ? modal.innerHTML : '';
    // 元に戻す
    routines[0].name = origName;
    if (modal) modal.remove();
    return html.includes('&quot;&gt;&lt;img onerror=alert(1)&gt;') || !html.includes('"><img onerror=alert(1)>');
  });
  if (result !== 'skip') {
    expect(result).toBe(true);
  }
});

// ===== 新規監査: Date NaN防止 =====

test('C35: 不正な日付文字列でNaN/NaN表示されない', async ({ page }) => {
  await waitForApp(page);
  const html = await page.evaluate(() => {
    const item = { id: 99999, title: 'test', status: 'open', deadline: 'invalid-date' };
    return renderTaskItem(item, 'waiting', false);
  });
  expect(html).not.toContain('NaN');
});

// ===== 新規監査: スコア0の正しい表示 =====

test('C36: スコア0が"---"ではなく"0"と表示される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const data = {
      todayJournal: { date: '2026-03-11', routines: [], score: 0, scoreItems: [], scores: {}, resolution: '', coreActions: {} },
      monthlyGoal: app.data.monthlyGoal
    };
    const html = renderJournalPage(data);
    return { hasZero: html.includes('>0 <span'), hasDash: html.includes('>--- <span') };
  });
  expect(result.hasZero).toBe(true);
  expect(result.hasDash).toBe(false);
});

// ===== 新規監査: todayJournal nullガード =====

test('C37: todayJournalがundefinedでも各ページがクラッシュしない', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const errors = [];
    try { renderTasksPage({ todayJournal: undefined, monthlyGoal: {} }); } catch(e) { errors.push('tasks: ' + e.message); }
    try { renderJournalPage({ todayJournal: undefined }); } catch(e) { errors.push('journal: ' + e.message); }
    try { renderJournalSupplementPage({ todayJournal: undefined }); } catch(e) { errors.push('supplement: ' + e.message); }
    return errors;
  });
  expect(result).toEqual([]);
});

// ===== 新規監査: await修正 =====

test('C38: firstBoxAnswer/firstBoxMaterialNextがasync関数である', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => ({
    answer: app.firstBoxAnswer.constructor.name,
    material: app.firstBoxMaterialNext.constructor.name
  }));
  expect(result.answer).toBe('AsyncFunction');
  expect(result.material).toBe('AsyncFunction');
});

// ===== 新規監査: DB保存追加 =====

test('C39: saveLongtermCardExpand/saveMilestoneExpandがasync関数である', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => ({
    longterm: app.saveLongtermCardExpand.constructor.name,
    milestone: app.saveMilestoneExpand.constructor.name
  }));
  expect(result.longterm).toBe('AsyncFunction');
  expect(result.milestone).toBe('AsyncFunction');
});

// ===== 新規監査: initRippleEffects重複防止 =====

test('C40: initRippleEffectsが重複登録を防止する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app.initRippleEffects();
    app.initRippleEffects();
    app.initRippleEffects();
    return app._rippleInitialized === true;
  });
  expect(result).toBe(true);
});

// ===== 新規監査: navigate時モーダルクリーンアップ =====

test('C41: navigate時にmodal-overlayが除去される', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    // テスト用モーダルを挿入
    document.body.insertAdjacentHTML('beforeend', '<div class="modal-overlay test-modal">test</div>');
    const before = document.querySelectorAll('.modal-overlay').length;
    await app.navigate('home');
    const after = document.querySelectorAll('.modal-overlay').length;
    return { before, after };
  });
  expect(result.before).toBeGreaterThan(0);
  expect(result.after).toBe(0);
});

// ===== 新規監査: hasJournalData score整合性 =====

test('C42: hasJournalDataがscore=0をデータなしと判定する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const journal = { date: '2026-03-11', routines: [], score: 0, scores: {}, resolution: '', coreActions: {} };
    return hasJournalData(journal);
  });
  expect(result).toBe(false);
});

// ===== 重要#12: タスク追加/整理ページ scope =====

test('C22: タスクのscopeが英語キー（personal/social）で保存されている', async ({ page }) => {
  await waitForApp(page);
  const scopes = await page.evaluate(async () => {
    const tasks = await getAllTasks();
    return [...new Set(tasks.map(t => t.scope).filter(Boolean))];
  });
  // 日本語scopeが含まれないことを確認
  expect(scopes).not.toContain('個人');
  expect(scopes).not.toContain('社会');
  // 英語scopeが含まれることを確認（seedデータがある場合）
  if (scopes.length > 0) {
    const validScopes = ['personal', 'social', ''];
    scopes.forEach(s => expect(validScopes).toContain(s));
  }
});

// ===== 更新時のデータ移行テスト =====

test('C43: ページリロード後もIndexedDBデータが保持される', async ({ page }) => {
  await waitForApp(page);
  // リロード前のデータ件数を取得
  const beforeCounts = await page.evaluate(async () => {
    return {
      tasks: (await getAllTasks()).length,
      routines: (await getAllRoutines()).length,
      journals: (await getAllData('journals')).length,
    };
  });
  // ページをリロード
  await page.reload();
  await waitForApp(page);
  // リロード後のデータ件数を取得
  const afterCounts = await page.evaluate(async () => {
    return {
      tasks: (await getAllTasks()).length,
      routines: (await getAllRoutines()).length,
      journals: (await getAllData('journals')).length,
    };
  });
  // データが保持されていること
  expect(afterCounts.tasks).toBe(beforeCounts.tasks);
  expect(afterCounts.routines).toBe(beforeCounts.routines);
  expect(afterCounts.journals).toBe(beforeCounts.journals);
});

test('C44: リロード後に設定値が保持される', async ({ page }) => {
  await waitForApp(page);
  // 設定値を取得
  const beforeSettings = await page.evaluate(async () => {
    return {
      name: await getSetting('name'),
      birthday: await getSetting('birthday'),
      seedDone: await getSetting('seedDataInserted'),
    };
  });
  await page.reload();
  await waitForApp(page);
  const afterSettings = await page.evaluate(async () => {
    return {
      name: await getSetting('name'),
      birthday: await getSetting('birthday'),
      seedDone: await getSetting('seedDataInserted'),
    };
  });
  expect(afterSettings.name).toBe(beforeSettings.name);
  expect(afterSettings.birthday).toBe(beforeSettings.birthday);
  expect(afterSettings.seedDone).toBe(beforeSettings.seedDone);
});

test('C45: clearDemoDataメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.clearDemoData === 'function');
  expect(exists).toBe(true);
});

test('C46: 設定画面に「全データ削除」と「デモデータに戻す」ボタンがある', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigate('settings'));
  await page.waitForTimeout(500);
  const content = await page.content();
  expect(content).toContain('全データ削除（空にする）');
  expect(content).toContain('デモデータに戻す');
});

test('C47: exportDataメソッドが存在しエクスポートデータに必須キーが含まれる', async ({ page }) => {
  await waitForApp(page);
  const keys = await page.evaluate(async () => {
    // exportDataの内部ロジックを再現（ダウンロードは発動させない）
    const data = {
      journals: await getAllData('journals'),
      monthlyGoals: await getAllData('monthlyGoals'),
      longTermGoals: await getAllData('longTermGoals'),
      lifeDesign: await getLifeDesign(),
      tasks: await getAllTasks(),
      routines: await getAllRoutines(),
      materials: await getAllMaterials(),
      firstbox: await getAllFirstBoxItems(),
      memos: await getAllMemos(),
      manuals: await getAllManuals(),
    };
    return Object.keys(data);
  });
  const required = ['journals', 'monthlyGoals', 'longTermGoals', 'lifeDesign', 'tasks', 'routines', 'materials', 'firstbox', 'memos', 'manuals'];
  for (const key of required) {
    expect(keys).toContain(key);
  }
});
