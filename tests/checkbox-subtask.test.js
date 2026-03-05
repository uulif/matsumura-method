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

// ノートビューを開く
async function openNoteView(page) {
  await waitForApp(page);
  await page.evaluate(() => {
    app.dashboardView = 'dashboard';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);
}

// テストデータ作成ヘルパー: タスクを作成してIDを返す
async function createTestTask(page, title, type, extra = {}) {
  const id = await page.evaluate(async ({ title, type, extra }) => {
    const taskData = createTaskData(type, title, extra);
    Object.assign(taskData, extra);
    // 明示的にIDを設定（auto-incrementではIDがオブジェクトに返らないため）
    taskData.id = Date.now() + Math.floor(Math.random() * 10000);
    await saveTask(taskData);
    await app.loadTasks();
    app.render();
    return taskData.id;
  }, { title, type, extra });
  await page.waitForTimeout(300);
  return id;
}

// ===== 1. チェックボックス完了/戻し =====

test('CS01: タスクチェックで即完了（open→done）', async ({ page }) => {
  await waitForApp(page);
  // テストタスクを作成
  const taskId = await createTestTask(page, 'チェックテスト', 'urgent', {
    dateTime: new Date(Date.now() + 86400000 * 2).toISOString()
  });

  // ノートビューでタスク表示
  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // タスクのステータスが open であることを確認
  const statusBefore = await page.evaluate((id) => {
    const t = app.taskItems.find(t => t.id === id);
    return t ? t.status || 'open' : null;
  }, taskId);
  expect(statusBefore).toBe('open');

  // toggleTaskStatus を呼ぶ
  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(500);

  // ステータスが done に変わったことを確認
  const statusAfter = await page.evaluate((id) => {
    const t = app.taskItems.find(t => t.id === id);
    return t ? t.status : null;
  }, taskId);
  expect(statusAfter).toBe('done');

  // クリーンアップ
  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS02: 完了タスクのチェックで未着手に戻る（done→open）', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '戻しテスト', 'action', {
    status: 'done'
  });

  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(300);

  const status = await page.evaluate((id) => {
    const t = app.taskItems.find(t => t.id === id);
    return t ? t.status : null;
  }, taskId);
  expect(status).toBe('open');

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS03: 進行中タスクのチェックで完了になる（in_progress→done）', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '進行中テスト', 'action', {
    status: 'in_progress'
  });

  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(300);

  const status = await page.evaluate((id) => {
    const t = app.taskItems.find(t => t.id === id);
    return t ? t.status : null;
  }, taskId);
  expect(status).toBe('done');

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

// ===== 2. Undoトースト =====

test('CS04: 完了時にUndoトーストが表示される', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, 'トーストテスト', 'action');

  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(500);

  // トーストが表示される
  const toast = page.locator('#undoToast');
  await expect(toast).toBeVisible();
  const text = await toast.textContent();
  expect(text).toContain('タスクを完了しました');
  expect(text).toContain('元に戻す');

  await page.evaluate(async (id) => {
    app.hideUndoToast();
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS05: Undoボタンでタスクが元のステータスに戻る', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, 'Undoテスト', 'action');

  // 完了にする
  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(500);

  // 「元に戻す」ボタンをクリック
  const undoBtn = page.locator('.nvb-toast-undo');
  await expect(undoBtn).toBeVisible();
  await undoBtn.click();
  await page.waitForTimeout(500);

  // 元のステータス(open)に戻っている
  const status = await page.evaluate((id) => {
    const t = app.taskItems.find(t => t.id === id);
    return t ? t.status : null;
  }, taskId);
  expect(status).toBe('open');

  // トーストが消えている
  const toast = page.locator('#undoToast');
  await expect(toast).not.toBeVisible();

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS06: Undoトーストが5秒後に自動消去される', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '自動消去テスト', 'action');

  await page.evaluate((id) => app.toggleTaskStatus(id), taskId);
  await page.waitForTimeout(500);

  // トーストが表示されていることを確認
  const toast = page.locator('#undoToast');
  await expect(toast).toBeVisible();

  // 5.5秒待って消えることを確認
  await page.waitForTimeout(5500);
  await expect(toast).not.toBeVisible();

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

// ===== 3. 完了タスク削除 =====

test('CS07: 完了タスクの削除ボタンでタスクが削除される', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '削除テスト', 'action', {
    status: 'done'
  });

  // confirmをオーバーライドして自動承認
  await page.evaluate(() => { window._origConfirm = window.confirm; window.confirm = () => true; });

  await page.evaluate(async (id) => {
    await app.deleteTaskById(id);
  }, taskId);
  await page.waitForTimeout(500);

  await page.evaluate(() => { window.confirm = window._origConfirm; });

  // タスクが消えていることを確認
  const exists = await page.evaluate((id) => {
    return app.taskItems.some(t => t.id === id);
  }, taskId);
  expect(exists).toBe(false);
});

// ===== 4. サブタスク機能 =====

test('CS08: サブタスクの作成（parentId設定）', async ({ page }) => {
  await waitForApp(page);
  // 親タスク作成
  const parentId = await createTestTask(page, '親タスク', 'project');

  // サブタスク作成
  const childId = await page.evaluate(async (pid) => {
    const taskData = createTaskData('project', 'サブタスク1', {});
    taskData.id = Date.now() + Math.floor(Math.random() * 10000);
    taskData.parentId = pid;
    await saveTask(taskData);
    await app.loadTasks();
    app.render();
    return taskData.id;
  }, parentId);
  await page.waitForTimeout(300);

  // 子タスクのparentIdを確認
  const result = await page.evaluate(({ parentId, childId }) => {
    const child = app.taskItems.find(t => t.id === childId);
    return {
      childExists: !!child,
      parentIdMatch: child?.parentId === parentId
    };
  }, { parentId, childId });

  expect(result.childExists).toBe(true);
  expect(result.parentIdMatch).toBe(true);

  // クリーンアップ
  await page.evaluate(async ({ parentId, childId }) => {
    await deleteTask(childId);
    await deleteTask(parentId);
    await app.loadTasks();
  }, { parentId, childId });
});

test('CS09: 親タスク削除で子タスクが昇格（parentId → null）', async ({ page }) => {
  await waitForApp(page);
  // 親タスク作成
  const parentId = await createTestTask(page, '削除テスト親CS09', 'project');

  // サブタスク2つ作成
  await page.evaluate(async (pid) => {
    for (let i = 1; i <= 2; i++) {
      const taskData = createTaskData('project', `削除テスト子CS09-${i}`, {});
      taskData.id = Date.now() + i * 1000;
      taskData.parentId = pid;
      await saveTask(taskData);
    }
    await app.loadTasks();
    app.render();
  }, parentId);
  await page.waitForTimeout(300);

  // 削除前: 子タスクが存在しparentIdが親IDであること
  const before = await page.evaluate((pid) => {
    const children = app.taskItems.filter(t => t.title && t.title.startsWith('削除テスト子CS09'));
    return children.map(c => ({ title: c.title, parentId: c.parentId, id: c.id }));
  }, parentId);
  expect(before.length).toBe(2);
  before.forEach(b => expect(b.parentId).toBe(parentId));

  // confirmをオーバーライドして自動承認
  await page.evaluate(() => { window._origConfirm = window.confirm; window.confirm = () => true; });

  // 親を削除
  await page.evaluate(async (id) => {
    await app.deleteTaskById(id);
  }, parentId);
  await page.waitForTimeout(500);

  // confirmを復元
  await page.evaluate(() => { window.confirm = window._origConfirm; });

  // 子タスクのparentIdがnullに昇格されていること（タイトルで検索）
  const after = await page.evaluate(() => {
    const children = app.taskItems.filter(t => t.title && t.title.startsWith('削除テスト子CS09'));
    return children.map(c => ({ title: c.title, parentId: c.parentId, id: c.id }));
  });
  expect(after.length).toBe(2);
  after.forEach(a => expect(a.parentId).toBeNull());

  // クリーンアップ
  await page.evaluate(async () => {
    const children = app.taskItems.filter(t => t.title && t.title.startsWith('削除テスト子CS09'));
    for (const c of children) await deleteTask(c.id);
    await app.loadTasks();
  });
});

test('CS10: サブタスク追加モーダルが正しく開く', async ({ page }) => {
  await waitForApp(page);
  const parentId = await createTestTask(page, 'モーダル親', 'project');

  // showAddSubtaskModal を呼ぶ
  await page.evaluate((id) => app.showAddSubtaskModal(id), parentId);
  await page.waitForTimeout(500);

  // モーダルが開いていること
  const modal = page.locator('.modal-overlay');
  await expect(modal).toBeVisible();

  // モーダルのタイトルに「サブタスクを追加」が含まれること
  const titleText = await page.evaluate(() => {
    const el = document.querySelector('.modal-title');
    return el ? el.textContent : '';
  });
  expect(titleText).toContain('サブタスクを追加');

  // 親タスク名が表示されていること
  const parentName = await page.evaluate(() => {
    const el = document.querySelector('.modal-notes-label');
    return el ? el.textContent : '';
  });
  expect(parentName).toContain('モーダル親');

  // _addSubtaskParentId がセットされていること
  const flagSet = await page.evaluate((pid) => {
    return app._addSubtaskParentId === pid;
  }, parentId);
  expect(flagSet).toBe(true);

  // モーダルを閉じる
  await page.evaluate(() => app.closeModalDirect());
  await page.waitForTimeout(300);

  // _addSubtaskParentIdがクリアされていること
  const flagCleared = await page.evaluate(() => {
    return app._addSubtaskParentId === undefined;
  });
  expect(flagCleared).toBe(true);

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, parentId);
});

// ===== 5. ノートビュー表示 =====

test('CS11: ノートビューでチェックボックス（丸）が表示される', async ({ page }) => {
  await waitForApp(page);
  await createTestTask(page, 'チェック表示テスト', 'urgent', {
    dateTime: new Date(Date.now() + 86400000).toISOString()
  });

  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // .nvb-check 要素が存在すること
  const checkCount = await page.evaluate(() => {
    return document.querySelectorAll('.nvb-check').length;
  });
  expect(checkCount).toBeGreaterThan(0);
});

test('CS12: 完了タスクのチェックボックスが緑✓表示', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '完了表示テスト', 'action', {
    status: 'done'
  });

  await page.evaluate(() => {
    app.dashboardView = 'done';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // .nvb-check-done が存在すること
  const doneChecks = await page.evaluate(() => {
    return document.querySelectorAll('.nvb-check-done').length;
  });
  expect(doneChecks).toBeGreaterThan(0);

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS13: in_progressタスクが未完了表示（openと同じ）', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '進行中表示テスト', 'action', {
    status: 'in_progress'
  });

  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // in_progressはopenにフォールバックされ、nvb-check-doneでもnvb-check-fboxでもない（未完了表示）
  const plainChecks = await page.evaluate(() => {
    return document.querySelectorAll('.nvb-check:not(.nvb-check-done):not(.nvb-check-fbox)').length;
  });
  expect(plainChecks).toBeGreaterThan(0);

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

test('CS14: 完了タスクに削除ボタンが表示される', async ({ page }) => {
  await waitForApp(page);
  const taskId = await createTestTask(page, '削除ボタンテスト', 'action', {
    status: 'done'
  });

  await page.evaluate(() => {
    app.dashboardView = 'done';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // .nvb-btn-delete が存在すること
  const deleteBtn = page.locator('.nvb-btn-delete');
  const count = await deleteBtn.count();
  expect(count).toBeGreaterThan(0);

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

// ===== 6. ダッシュボード日付フィルタ =====

test('CS15: 日付なしタスクはダッシュボードの緊急/注意/余裕に表示されない', async ({ page }) => {
  await waitForApp(page);
  // 日付なしのurgentタスクを作成
  const taskId = await createTestTask(page, '日付なしタスク', 'urgent');

  await page.evaluate(() => {
    app.dashboardView = 'dashboard';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // 3カテゴリの合計にこのタスクが含まれないことを確認
  const result = await page.evaluate(() => {
    const cards = document.querySelectorAll('.nvb-card');
    const urgentCount = parseInt(cards[0]?.querySelector('.nvb-card-count')?.textContent || '0');
    const cautionCount = parseInt(cards[1]?.querySelector('.nvb-card-count')?.textContent || '0');
    const okCount = parseInt(cards[2]?.querySelector('.nvb-card-count')?.textContent || '0');
    return { sum: urgentCount + cautionCount + okCount };
  });

  // 日付なしタスクは3カテゴリに含まれない → 合計は日付ありタスクの数のみ
  const dateTaskCount = await page.evaluate(() => {
    const active = app.taskItems.filter(t => (t.status || 'open') !== 'done');
    return active.filter(t => {
      const d = nvGetTaskDate(t);
      return d && !isNaN(d.getTime());
    }).length;
  });
  expect(result.sum).toBe(dateTaskCount);

  await page.evaluate(async (id) => {
    await deleteTask(id);
    await app.loadTasks();
  }, taskId);
});

// ===== 7. テーブル列数統一 =====

test('CS16: テーブルのヘッダーとボディの列数が一致（5列）', async ({ page }) => {
  await waitForApp(page);
  // 完了タスクと未完了タスクの両方を作成
  const id1 = await createTestTask(page, '未完了タスク', 'action', {
    dateTime: new Date(Date.now() + 86400000 * 3).toISOString()
  });
  const id2 = await createTestTask(page, '完了タスク', 'action', {
    status: 'done',
    dateTime: new Date(Date.now() + 86400000 * 3).toISOString()
  });

  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const ths = document.querySelectorAll('.nvb-table thead th');
    const rows = document.querySelectorAll('.nvb-table tbody tr');
    const headerCount = ths.length;
    let mismatch = false;
    rows.forEach(row => {
      if (row.querySelectorAll('td').length !== headerCount) {
        mismatch = true;
      }
    });
    return { headerCount, rowCount: rows.length, mismatch };
  });

  expect(result.headerCount).toBe(5);
  expect(result.mismatch).toBe(false);

  await page.evaluate(async ({ id1, id2 }) => {
    await deleteTask(id1);
    await deleteTask(id2);
    await app.loadTasks();
  }, { id1, id2 });
});

// ===== 8. ソート順 =====

test('CS17: テーブルが期限近い順にソートされている', async ({ page }) => {
  await waitForApp(page);
  // 3日後と1日後のタスクを作成
  const id1 = await createTestTask(page, 'ソート3日後', 'calendar', {
    dateTime: new Date(Date.now() + 86400000 * 3).toISOString()
  });
  const id2 = await createTestTask(page, 'ソート1日後', 'calendar', {
    dateTime: new Date(Date.now() + 86400000 * 1).toISOString()
  });

  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // テーブル内のタスクタイトル順を確認
  const titles = await page.evaluate(() => {
    const rows = document.querySelectorAll('.nvb-table tbody tr');
    return Array.from(rows).map(row => {
      const titleCell = row.querySelector('.nvb-td-title');
      return titleCell ? titleCell.textContent.trim() : '';
    }).filter(t => t.includes('ソート'));
  });

  // 1日後が3日後より前に来ること
  const idx1day = titles.findIndex(t => t.includes('ソート1日後'));
  const idx3day = titles.findIndex(t => t.includes('ソート3日後'));
  expect(idx1day).toBeLessThan(idx3day);

  await page.evaluate(async ({ id1, id2 }) => {
    await deleteTask(id1);
    await deleteTask(id2);
    await app.loadTasks();
  }, { id1, id2 });
});

// ===== 9. サブタスク表示 =====

test('CS18: ノートビューでサブタスクが└インデント表示される', async ({ page }) => {
  await waitForApp(page);
  const parentId = await createTestTask(page, 'インデント親', 'action');
  const childId = await page.evaluate(async (pid) => {
    const taskData = createTaskData('action', 'インデント子', {});
    taskData.id = Date.now() + Math.floor(Math.random() * 10000);
    taskData.parentId = pid;
    await saveTask(taskData);
    await app.loadTasks();
    app.render();
    return taskData.id;
  }, parentId);
  await page.waitForTimeout(300);

  // 全タスク一覧ビューで表示（親子両方が含まれるように）
  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  // └ インデントが表示されていること
  const hasIndent = await page.evaluate(() => {
    const indents = document.querySelectorAll('.nvb-child-indent');
    return indents.length > 0;
  });
  expect(hasIndent).toBe(true);

  // nvb-td-child クラスが付いていること
  const hasChildClass = await page.evaluate(() => {
    return document.querySelectorAll('.nvb-td-child').length > 0;
  });
  expect(hasChildClass).toBe(true);

  await page.evaluate(async ({ parentId, childId }) => {
    await deleteTask(childId);
    await deleteTask(parentId);
    await app.loadTasks();
  }, { parentId, childId });
});

// ===== 10. XSSホワイトリスト =====

test('CS19: showUndoToast のprevStatusがホワイトリスト外ならopenにフォールバック', async ({ page }) => {
  await waitForApp(page);

  // 不正なprevStatusでshowUndoToastを呼ぶ
  await page.evaluate(() => {
    app.showUndoToast(999, '<script>alert(1)</script>');
  });
  await page.waitForTimeout(300);

  // トーストが表示されること
  const toast = page.locator('#undoToast');
  await expect(toast).toBeVisible();

  // トースト内にscriptタグが含まれないこと
  const html = await page.evaluate(() => {
    const t = document.getElementById('undoToast');
    return t ? t.innerHTML : '';
  });
  expect(html).not.toContain('<script>');
  expect(html).toContain("'open'"); // フォールバック値

  await page.evaluate(() => app.hideUndoToast());
});

// ===== 11. 期限数字の大きさ =====

test('CS20: 期限の数字部分にnvb-dl-numクラスが付与される', async ({ page }) => {
  await waitForApp(page);
  await createTestTask(page, '数字テスト', 'calendar', {
    dateTime: new Date(Date.now() + 86400000 * 3).toISOString()
  });

  await page.evaluate(() => {
    app.dashboardView = 'all';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const nums = document.querySelectorAll('.nvb-dl-num');
    if (nums.length === 0) return { count: 0, fontSize: null };
    const style = getComputedStyle(nums[0]);
    return {
      count: nums.length,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
  });

  expect(result.count).toBeGreaterThan(0);
});

// ===== 12. GTDタブでのサブタスク表示 =====

test('CS21: GTDタブでサブタスクがインデント表示される', async ({ page }) => {
  await waitForApp(page);
  const parentId = await createTestTask(page, 'GTD親タスク', 'action');
  const childId = await page.evaluate(async (pid) => {
    const taskData = createTaskData('action', 'GTD子タスク', {});
    taskData.id = Date.now() + Math.floor(Math.random() * 10000);
    taskData.parentId = pid;
    await saveTask(taskData);
    await app.loadTasks();
    app.render();
    return taskData.id;
  }, parentId);
  await page.waitForTimeout(300);

  // GTDページのタスクタブを開く
  await page.evaluate(() => app.navigate('task-list'));
  await page.waitForTimeout(500);

  // アクションリストタブをクリック
  const actionTab = page.locator('.task-tab').filter({ hasText: 'アクション' });
  if (await actionTab.count() > 0) {
    await actionTab.click();
    await page.waitForTimeout(500);
  }

  // task-item-child クラスが存在すること
  const hasChildItem = await page.evaluate(() => {
    return document.querySelectorAll('.task-item-child').length > 0;
  });
  expect(hasChildItem).toBe(true);

  // ＋サブタスクリンクが表示されていること
  const hasSubtaskLink = await page.evaluate(() => {
    return document.querySelectorAll('.task-add-subtask').length > 0;
  });
  expect(hasSubtaskLink).toBe(true);

  await page.evaluate(async ({ parentId, childId }) => {
    await deleteTask(childId);
    await deleteTask(parentId);
    await app.loadTasks();
  }, { parentId, childId });
});

// ===== 13. パターンA削除の確認 =====

test('CS22: ノートビューにA/Bトグルが存在しない', async ({ page }) => {
  await openNoteView(page);

  const hasToggle = await page.evaluate(() => {
    return !!document.querySelector('.nv-pattern-toggle');
  });
  expect(hasToggle).toBe(false);

  // setNoteViewPattern メソッドが存在しないこと
  const hasMethod = await page.evaluate(() => {
    return typeof app.setNoteViewPattern === 'function';
  });
  expect(hasMethod).toBe(false);
});

test('CS23: ノートビューが直接ダッシュボード（nvb-layout）を表示する', async ({ page }) => {
  await openNoteView(page);

  const hasLayout = await page.evaluate(() => {
    return !!document.querySelector('.nvb-layout');
  });
  expect(hasLayout).toBe(true);

  const hasSidebar = await page.evaluate(() => {
    return !!document.querySelector('.nvb-sidebar');
  });
  expect(hasSidebar).toBe(true);
});
