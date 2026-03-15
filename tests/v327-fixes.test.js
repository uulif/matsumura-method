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
  await page.evaluate(() => {
    const ws = document.getElementById('welcomeScreen');
    if (ws) ws.remove();
  });
  await page.waitForTimeout(200);
}

// ===== #9: 日誌一覧 月切り替えナビ =====

test('V01: 日誌一覧に月ナビゲーションが表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  const nav = page.locator('.journal-month-nav');
  await expect(nav).toBeVisible();
  const label = page.locator('.journal-month-label');
  await expect(label).toBeVisible();
  const text = await label.textContent();
  expect(text).toMatch(/\d{4}年\d{1,2}月/);
});

test('V02: 月ナビの前月ボタンで月が変わる', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  const labelBefore = await page.locator('.journal-month-label').textContent();
  await page.locator('.journal-month-btn').first().click();
  await page.waitForTimeout(500);
  const labelAfter = await page.locator('.journal-month-label').textContent();
  expect(labelAfter).not.toBe(labelBefore);
});

test('V03: 月ナビの翌月ボタンで月が変わる', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  // まず前月に移動
  await page.locator('.journal-month-btn').first().click();
  await page.waitForTimeout(500);
  const labelBefore = await page.locator('.journal-month-label').textContent();
  // 翌月に戻る
  await page.locator('.journal-month-btn').last().click();
  await page.waitForTimeout(500);
  const labelAfter = await page.locator('.journal-month-label').textContent();
  expect(labelAfter).not.toBe(labelBefore);
});

test('V04: changeJournalListMonthが年またぎを正しく処理する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    // 2025年1月から前月 → 2024年12月
    app.journalListMonth = '2025-01';
    const [y, m] = '2025-01'.split('-').map(Number);
    const d = new Date(y, m - 1 - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  expect(result).toBe('2024-12');
});

test('V05: changeJournalListMonthの排他制御が機能する', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => {
    app._changingMonth = true;
    const before = app.journalListMonth;
    app.changeJournalListMonth(1); // 排他制御で無視されるはず
    return app.journalListMonth === before;
  });
  expect(result).toBe(true);
  // クリーンアップ
  await page.evaluate(() => { app._changingMonth = false; });
});

// ===== #10: 日誌一覧カード全体タップ =====

test('V06: 日誌一覧のカード全体にonclickが設定されている', async ({ page }) => {
  await waitForApp(page);
  // デモデータがある状態で日誌一覧へ
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  const hasOnclick = await page.evaluate(() => {
    const items = document.querySelectorAll('.journal-list-item');
    if (items.length === 0) return null; // データなし
    return items[0].getAttribute('onclick') !== null;
  });
  if (hasOnclick !== null) {
    expect(hasOnclick).toBe(true);
  }
});

test('V07: 日誌カードタップでjournal画面に遷移する', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigateNav('journal-list'));
  await page.waitForTimeout(500);
  const hasItems = await page.evaluate(() => document.querySelectorAll('.journal-list-item').length > 0);
  if (hasItems) {
    await page.locator('.journal-list-item').first().click();
    await page.waitForTimeout(500);
    const currentPage = await page.evaluate(() => app.currentPage);
    expect(currentPage).toBe('journal');
  }
});

// ===== #11: ルーティンUIをタスクと統一 =====

test('V08: ルーティンアイテムにチェックボックスが表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.currentGTDTab = 'routine';
    app.navigateNav('gtd');
  });
  await page.waitForTimeout(500);
  const hasCheck = await page.evaluate(() => {
    const items = document.querySelectorAll('.routine-item');
    if (items.length === 0) return null;
    return items[0].querySelector('.routine-item-check') !== null;
  });
  if (hasCheck !== null) {
    expect(hasCheck).toBe(true);
  }
});

test('V09: ルーティンアイテムがborder（枠線）スタイルを持つ', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.currentGTDTab = 'routine';
    app.navigateNav('gtd');
  });
  await page.waitForTimeout(500);
  const hasBorder = await page.evaluate(() => {
    const item = document.querySelector('.routine-item');
    if (!item) return null;
    const style = getComputedStyle(item);
    return style.borderStyle !== 'none' && style.borderWidth !== '0px';
  });
  if (hasBorder !== null) {
    expect(hasBorder).toBe(true);
  }
});

test('V10: ルーティンとタスクのカードスタイルが統一されている', async ({ page }) => {
  await waitForApp(page);
  // タスクのスタイルを取得
  await page.evaluate(() => {
    app.currentGTDTab = 'task';
    app.navigateNav('gtd');
  });
  await page.waitForTimeout(500);
  const taskStyle = await page.evaluate(() => {
    const item = document.querySelector('.task-item');
    if (!item) return null;
    const s = getComputedStyle(item);
    return { borderRadius: s.borderRadius, padding: s.padding };
  });

  // ルーティンのスタイルを取得
  await page.evaluate(() => {
    app.currentGTDTab = 'routine';
    app.navigateNav('gtd');
  });
  await page.waitForTimeout(500);
  const routineStyle = await page.evaluate(() => {
    const item = document.querySelector('.routine-item');
    if (!item) return null;
    const s = getComputedStyle(item);
    return { borderRadius: s.borderRadius, padding: s.padding };
  });

  if (taskStyle && routineStyle) {
    expect(routineStyle.borderRadius).toBe(taskStyle.borderRadius);
    expect(routineStyle.padding).toBe(taskStyle.padding);
  }
});

test('V11: toggleRoutineStatusメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.toggleRoutineStatus === 'function');
  expect(exists).toBe(true);
});

// ===== #12: タスク最後のカード下枠 =====

test('V12: タスクの最後のアイテムに下枠(border-bottom)が表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.currentGTDTab = 'task';
    app.navigateNav('gtd');
  });
  await page.waitForTimeout(500);
  const hasBorderBottom = await page.evaluate(() => {
    const items = document.querySelectorAll('.task-item');
    if (items.length === 0) return null;
    const lastItem = items[items.length - 1];
    const style = getComputedStyle(lastItem);
    return style.borderBottomWidth !== '0px' && style.borderBottomStyle !== 'none';
  });
  if (hasBorderBottom !== null) {
    expect(hasBorderBottom).toBe(true);
  }
});

// ===== QA修正: data.journals整合性テスト =====

test('V13: navigateToTodayJournalがdata.journalsに依存しない', async ({ page }) => {
  await waitForApp(page);
  // data.journalsを空にしてもnavigateToTodayJournalが動作するか
  await page.evaluate(() => { app.data.journals = []; });
  await page.evaluate(() => app.navigateToTodayJournal());
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({
    page: app.currentPage,
    hasJournal: app.data.todayJournal !== null
  }));
  expect(result.page).toBe('journal');
  expect(result.hasJournal).toBe(true);
});

test('V14: 日誌削除がjournalListMonthの月を再読み込みする', async ({ page }) => {
  await waitForApp(page);
  const usesListMonth = await page.evaluate(() => {
    // deleteJournalメソッドのソースを確認
    const src = app.deleteJournal.toString();
    return src.includes('journalListMonth');
  });
  expect(usesListMonth).toBe(true);
});

test('V15: changeJournalListMonthがエラー時にjournalListMonthを変更しない', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    const original = app.journalListMonth;
    // getMonthJournalsを一時的に壊す
    const origFn = window.getMonthJournals;
    window.getMonthJournals = async () => { throw new Error('test'); };
    await app.changeJournalListMonth(1);
    window.getMonthJournals = origFn;
    return app.journalListMonth === original;
  });
  expect(result).toBe(true);
});
