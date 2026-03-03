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

// ノートビューへ遷移（ダッシュボード表示）
async function openPatternB(page) {
  await waitForApp(page);
  await page.evaluate(() => {
    app.dashboardView = 'dashboard';
    app.navigate('note-view');
  });
  await page.waitForTimeout(500);
}

// ===== パターンB テスト =====

test('PB01: ノートビューが直接ダッシュボード表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigate('note-view'));
  await page.waitForTimeout(500);
  // ダッシュボード（nvb-layout）が直接表示される
  const hasNvbLayout = await page.evaluate(() => !!document.querySelector('.nvb-layout'));
  expect(hasNvbLayout).toBe(true);
});

test('PB02: パターンBでサイドバーとメインエリアが表示される', async ({ page }) => {
  await openPatternB(page);
  const sidebar = page.locator('.nvb-sidebar');
  await expect(sidebar).toBeVisible();
  const main = page.locator('.nvb-main');
  await expect(main).toBeVisible();
});

test('PB03: サイドバーにメニュー項目が全て表示される', async ({ page }) => {
  await openPatternB(page);
  const items = await page.evaluate(() => {
    const els = document.querySelectorAll('.nvb-sidebar-item');
    return Array.from(els).map(el => el.textContent.trim());
  });
  // ダッシュボード、全タスク一覧、完了済み + 7種別 = 10項目
  expect(items.length).toBe(10);
  expect(items.some(t => t.includes('ダッシュボード'))).toBe(true);
  expect(items.some(t => t.includes('全タスク一覧'))).toBe(true);
  expect(items.some(t => t.includes('完了済み'))).toBe(true);
  expect(items.some(t => t.includes('F・BOX'))).toBe(true);
  expect(items.some(t => t.includes('すぐやる'))).toBe(true);
});

test('PB04: ダッシュボード表示時にサマリーカードが4枚表示される', async ({ page }) => {
  await openPatternB(page);
  const cards = page.locator('.nvb-card');
  await expect(cards).toHaveCount(4);
});

test('PB05: サイドバー「全タスク一覧」クリックでテーブルが表示される', async ({ page }) => {
  await openPatternB(page);
  await page.evaluate(() => app.setDashboardView('all'));
  await page.waitForTimeout(500);
  const tableSection = page.locator('.nvb-table-section');
  const count = await tableSection.count();
  // テーブルセクションか空メッセージが表示される
  expect(count).toBeGreaterThanOrEqual(1);
});

test('PB06: サイドバー「完了済み」クリックで完了タスク表示', async ({ page }) => {
  await openPatternB(page);
  await page.evaluate(() => app.setDashboardView('done'));
  await page.waitForTimeout(500);
  const title = await page.evaluate(() => {
    const el = document.querySelector('.nvb-table-title');
    return el ? el.textContent : '';
  });
  expect(title).toContain('完了済み');
});

test('PB07: 種別フィルタで特定種別のタスクのみ表示される', async ({ page }) => {
  await openPatternB(page);
  await page.evaluate(() => app.setDashboardView('type-action'));
  await page.waitForTimeout(500);
  const title = await page.evaluate(() => {
    const el = document.querySelector('.nvb-table-title');
    return el ? el.textContent : '';
  });
  expect(title).toContain('アクションリスト');
});

test('PB08: サイドバーのactive状態が正しく表示される', async ({ page }) => {
  await openPatternB(page);
  // ダッシュボード表示時、ダッシュボードがactive
  let activeItem = await page.evaluate(() => {
    const el = document.querySelector('.nvb-sidebar-item.active');
    return el ? el.textContent.trim() : '';
  });
  expect(activeItem).toContain('ダッシュボード');
  // 全タスクに切替
  await page.evaluate(() => app.setDashboardView('all'));
  await page.waitForTimeout(500);
  activeItem = await page.evaluate(() => {
    const el = document.querySelector('.nvb-sidebar-item.active');
    return el ? el.textContent.trim() : '';
  });
  expect(activeItem).toContain('全タスク一覧');
});

test('PB09: 3カテゴリ合計が日付ありactiveTasksと一致する', async ({ page }) => {
  await openPatternB(page);
  const result = await page.evaluate(() => {
    const allTasks = app.taskItems || [];
    const activeTasks = allTasks.filter(t => (t.status || 'open') !== 'done');
    // 日付ありの未完了タスクのみがカテゴリに含まれる
    const dateActiveTasks = activeTasks.filter(t => {
      const d = nvGetTaskDate(t);
      return d && !isNaN(d.getTime());
    });
    const urgentCount = parseInt(document.querySelectorAll('.nvb-card')[0]?.querySelector('.nvb-card-count')?.textContent || '0');
    const cautionCount = parseInt(document.querySelectorAll('.nvb-card')[1]?.querySelector('.nvb-card-count')?.textContent || '0');
    const okCount = parseInt(document.querySelectorAll('.nvb-card')[2]?.querySelector('.nvb-card-count')?.textContent || '0');
    const totalCount = parseInt(document.querySelectorAll('.nvb-card')[3]?.querySelector('.nvb-card-count')?.textContent || '0');
    const fboxCount = (app.firstBoxItems || []).length;
    return {
      dateActiveCount: dateActiveTasks.length,
      activeTasksCount: activeTasks.length,
      urgentCount,
      cautionCount,
      okCount,
      totalCount,
      fboxCount,
      threeCatSum: urgentCount + cautionCount + okCount,
      totalExpected: activeTasks.length + fboxCount
    };
  });
  // 3カテゴリ合計 = 日付ありactiveTasksの数
  expect(result.threeCatSum).toBe(result.dateActiveCount);
  // 未完了合計 = 全activeTasks + fboxItems
  expect(result.totalCount).toBe(result.totalExpected);
});

test('PB10: テーブルにheaderが5列表示される', async ({ page }) => {
  await openPatternB(page);
  // 全タスク一覧でテーブル表示
  await page.evaluate(() => app.setDashboardView('all'));
  await page.waitForTimeout(500);
  const headers = await page.evaluate(() => {
    const ths = document.querySelectorAll('.nvb-table thead th');
    return Array.from(ths).map(th => th.textContent.trim());
  });
  if (headers.length > 0) {
    // チェック（空）、期限まで、種別、内容、操作（空）の5列
    expect(headers.length).toBe(5);
    expect(headers[1]).toBe('期限まで');
    expect(headers[2]).toBe('種別');
    expect(headers[3]).toBe('内容');
  }
});

test('PB11: 想定外のviewでダッシュボードにフォールバック', async ({ page }) => {
  await openPatternB(page);
  await page.evaluate(() => app.setDashboardView('invalid-view-xyz'));
  await page.waitForTimeout(500);
  // ダッシュボードのカードが表示される（フォールバック）
  const cards = page.locator('.nvb-card');
  await expect(cards).toHaveCount(4);
});

test('PB12: nvGetDayDiff が日付ベースで正しく計算される', async ({ page }) => {
  await openPatternB(page);
  const result = await page.evaluate(() => {
    // 今日の日付
    const today = new Date();
    today.setHours(15, 30, 0, 0); // 15:30（時刻に関わらず同じ結果であること）
    const diff = nvGetDayDiff(today);
    // 明日
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(1, 0, 0, 0);
    const diffTomorrow = nvGetDayDiff(tomorrow);
    // 昨日
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 0, 0);
    const diffYesterday = nvGetDayDiff(yesterday);
    return { today: diff, tomorrow: diffTomorrow, yesterday: diffYesterday };
  });
  expect(result.today).toBe(0);
  expect(result.tomorrow).toBe(1);
  expect(result.yesterday).toBe(-1);
});

test('PB13: nvGetDeadlineInfo がNaN日付を正しく処理する', async ({ page }) => {
  await openPatternB(page);
  const result = await page.evaluate(() => {
    // 日付なしタスク
    const noDate = nvGetDeadlineInfo({ type: 'action', title: 'test' });
    // 不正日付タスク
    const badDate = nvGetDeadlineInfo({ type: 'calendar', dateTime: 'invalid' });
    return { noDate, badDate };
  });
  expect(result.noDate.text).toBe('—');
  expect(result.noDate.days).toBe(null);
  expect(result.badDate.text).toBe('—');
  expect(result.badDate.days).toBe(null);
});

test('PB14: ノートビューにトグルボタンが存在しない（Pattern A削除済み）', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigate('note-view'));
  await page.waitForTimeout(500);
  const toggle = page.locator('.nv-pattern-toggle');
  const exists = await toggle.count();
  expect(exists).toBe(0);
});

test('PB15: ダッシュボードのview切替後もview状態が保持される', async ({ page }) => {
  await openPatternB(page);
  // 全タスク一覧に切替
  await page.evaluate(() => app.setDashboardView('all'));
  await page.waitForTimeout(300);
  // ホームに遷移して戻る
  await page.evaluate(() => app.navigateNav('home'));
  await page.waitForTimeout(300);
  await page.evaluate(() => app.navigate('note-view'));
  await page.waitForTimeout(500);
  // dashboardView は 'all' が保持されている
  const view = await page.evaluate(() => app.dashboardView);
  expect(view).toBe('all');
});
