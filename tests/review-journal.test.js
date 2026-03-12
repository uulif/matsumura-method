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
  // welcomeScreen除去
  await page.evaluate(() => {
    const ws = document.getElementById('welcomeScreen');
    if (ws) ws.remove();
  });
  await page.waitForTimeout(500);
}

// シードデータ投入ヘルパー（アプリのsaveData APIを使用）
async function seedJournalData(page) {
  return page.evaluate(async () => {
    const today = getTodayDate();
    const parts = today.split('-');
    const y = +parts[0], m = +parts[1], d = +parts[2];

    const month = `${y}-${String(m).padStart(2, '0')}`;
    for (let i = 0; i < 3; i++) {
      const dd = Math.max(1, d - i);
      const date = `${y}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
      await saveData('journals', {
        date,
        month,
        resolution: `テスト意気込み${i}`,
        reflections: { reflection: `反省テスト${i}`, effort: `努力テスト${i}` },
        coreActions: {
          deadline: { name: `期限タスク${i}`, done: i === 0 },
          processing: { name: '', done: false },
          habit: { name: '', done: false },
          other: { name: '', done: false }
        },
        scoreItems: [{ id: 's1', title: '集中力' }],
        scores: { s1: i + 2 },
        routines: [{ name: 'ルーティン1', done: true }, { name: 'ルーティン2', done: false }],
        memo: i === 0 ? 'テストメモ' : '',
        tomorrowResolution: i === 0 ? '明日も頑張る' : ''
      });
    }
    await app.loadAllData();
    return true;
  });
}

// DB全クリアヘルパー
async function clearJournals(page) {
  return page.evaluate(async () => {
    const all = await getAllData('journals');
    for (const j of all) {
      await deleteData('journals', j.date);
    }
    await app.loadAllData();
  });
}

// 日誌タブへ遷移するヘルパー
async function goToJournalTab(page) {
  await page.evaluate(() => app.navigate('review'));
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.rv-tab');
    const jTab = Array.from(tabs).find(t => t.textContent.includes('日誌'));
    if (jTab) jTab.click();
  });
  await page.waitForTimeout(300);
}

// === RJ01: 振り返りページに日誌タブが存在する ===
test('RJ01: 振り返りページに日誌タブが存在する', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.navigate('review'));
  await page.waitForTimeout(300);

  const hasTab = await page.evaluate(() => {
    const tabs = document.querySelectorAll('.rv-tab');
    return Array.from(tabs).some(t => t.textContent.includes('日誌'));
  });
  expect(hasTab).toBe(true);
});

// === RJ02: 日誌タブクリックで日誌一覧が表示される ===
test('RJ02: 日誌タブクリックで日誌一覧が表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const hasCards = await page.evaluate(() => {
    return document.querySelectorAll('.rjl-card').length > 0;
  });
  expect(hasCards).toBe(true);
});

// === RJ03: 日誌カードが日付降順で表示される ===
test('RJ03: 日誌カードが日付降順で表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const dates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rjl-date')).map(el => el.textContent);
  });
  expect(dates.length).toBeGreaterThanOrEqual(2);
  const firstDay = parseInt(dates[0].match(/\/(\d+)/)?.[1] || '0');
  const lastDay = parseInt(dates[dates.length - 1].match(/\/(\d+)/)?.[1] || '0');
  expect(firstDay).toBeGreaterThanOrEqual(lastDay);
});

// === RJ04: 意気込みが表示される ===
test('RJ04: 意気込みが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const hasResolution = await page.evaluate(() => {
    const labels = document.querySelectorAll('.rjl-field-label');
    return Array.from(labels).some(l => l.textContent === '意気込み');
  });
  expect(hasResolution).toBe(true);
});

// === RJ05: スコア（★）が正しく表示される ===
test('RJ05: スコア（★）が正しく表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const scoreInfo = await page.evaluate(() => {
    const dots = document.querySelectorAll('.rjl-score-dot');
    const filled = document.querySelectorAll('.rjl-score-dot.filled');
    return { total: dots.length, filled: filled.length };
  });
  // 3日分のジャーナル × 1スコア項目 × 5ドット = 15
  expect(scoreInfo.total).toBe(15);
  // スコアは2,3,4 → 合計9個filled
  expect(scoreInfo.filled).toBe(9);
});

// === RJ06: コアアクションが表示される ===
test('RJ06: コアアクションが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const coreInfo = await page.evaluate(() => {
    const items = document.querySelectorAll('.rjl-core-item');
    const doneItems = document.querySelectorAll('.rjl-core-check.done');
    return { count: items.length, done: doneItems.length };
  });
  expect(coreInfo.count).toBe(3);
  expect(coreInfo.done).toBe(1);
});

// === RJ07: ルーティン達成率バッジが表示される ===
test('RJ07: ルーティン達成率バッジが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const badges = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rjl-routine-badge')).map(b => b.textContent);
  });
  expect(badges.length).toBe(3);
  expect(badges[0]).toContain('1/2');
  expect(badges[0]).toContain('50%');
});

// === RJ08: 振り返りテキストが表示される ===
test('RJ08: 振り返りテキストが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const reflectionLabels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rjl-field-label'))
      .map(l => l.textContent);
  });
  expect(reflectionLabels).toContain('今日の反省');
  expect(reflectionLabels).toContain('努力・成果');
});

// === RJ09: メモが表示される ===
test('RJ09: メモが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const hasMemo = await page.evaluate(() => {
    const labels = document.querySelectorAll('.rjl-field-label');
    return Array.from(labels).some(l => l.textContent === 'メモ');
  });
  expect(hasMemo).toBe(true);
});

// === RJ10: 明日の意気込みが表示される ===
test('RJ10: 明日の意気込みが表示される', async ({ page }) => {
  await waitForApp(page);
  await seedJournalData(page);
  await goToJournalTab(page);

  const hasTomorrow = await page.evaluate(() => {
    const labels = document.querySelectorAll('.rjl-field-label');
    return Array.from(labels).some(l => l.textContent === '明日の意気込み');
  });
  expect(hasTomorrow).toBe(true);
});

// === RJ11: XSS防止 - ユーザーテキストがエスケープされている ===
test('RJ11: XSS防止 - ユーザーテキストがエスケープされている', async ({ page }) => {
  await waitForApp(page);

  const xss = '<script>alert("xss")</script>';
  await page.evaluate(async (payload) => {
    const today = getTodayDate();
    const month = getCurrentMonth();
    await saveData('journals', {
      date: today,
      month,
      resolution: payload,
      reflections: { reflection: payload },
      coreActions: { deadline: { name: payload, done: false } },
      scoreItems: [{ id: 's1', title: payload }],
      scores: { s1: 3 },
      routines: [],
      memo: payload,
      tomorrowResolution: payload
    });
    await app.loadAllData();
  }, xss);

  await goToJournalTab(page);

  const xssCheck = await page.evaluate(() => {
    const container = document.querySelector('.rjl-container');
    if (!container) return { safe: false, reason: 'no container' };
    const html = container.innerHTML;
    const hasRawScript = html.includes('<script>');
    const hasEscaped = html.includes('&lt;script&gt;');
    return { safe: !hasRawScript && hasEscaped, hasRawScript, hasEscaped };
  });
  expect(xssCheck.safe).toBe(true);
});

// === RJ12: 空のジャーナルはカードに表示されない ===
test('RJ12: 空のジャーナルはカードに表示されない', async ({ page }) => {
  await waitForApp(page);
  await clearJournals(page);

  const today = await page.evaluate(() => getTodayDate());
  const parts = today.split('-');
  const y = +parts[0], m = +parts[1], d = +parts[2];
  const yesterday = `${y}-${String(m).padStart(2, '0')}-${String(Math.max(1, d - 1)).padStart(2, '0')}`;

  const month = `${y}-${String(m).padStart(2, '0')}`;
  await page.evaluate(async (dates) => {
    // 空のジャーナル
    await saveData('journals', { date: dates.today, month: dates.month });
    // データありのジャーナル
    await saveData('journals', {
      date: dates.yesterday,
      month: dates.month,
      resolution: '何か意気込み',
      reflections: {},
      coreActions: {},
      routines: [],
      memo: ''
    });
    await app.loadAllData();
  }, { today, yesterday, month });

  await goToJournalTab(page);

  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('.rjl-card').length;
  });
  expect(cardCount).toBe(1);
});

// === RJ13: ジャーナルがない月は空メッセージが表示される ===
test('RJ13: ジャーナルがない月は空メッセージが表示される', async ({ page }) => {
  await waitForApp(page);
  await clearJournals(page);
  await goToJournalTab(page);

  const emptyMsg = await page.evaluate(() => {
    const el = document.querySelector('.rv-empty');
    return el ? el.textContent : null;
  });
  expect(emptyMsg).toContain('この月の日誌はまだありません');
});

// === RJ14: タブ切り替えでactiveクラスが正しく付与される ===
test('RJ14: タブ切り替えでactiveクラスが正しく付与される', async ({ page }) => {
  await waitForApp(page);
  await goToJournalTab(page);

  const tabState = await page.evaluate(() => {
    const tabs = document.querySelectorAll('.rv-tab');
    const activeTab = document.querySelector('.rv-tab.active');
    return {
      totalTabs: tabs.length,
      activeText: activeTab ? activeTab.textContent.trim() : null,
      activeCount: document.querySelectorAll('.rv-tab.active').length
    };
  });
  expect(tabState.totalTabs).toBe(4);
  expect(tabState.activeText).toBe('日誌');
  expect(tabState.activeCount).toBe(1);
});

// === RJ15: journals引数がundefinedでもクラッシュしない ===
test('RJ15: journals引数がundefinedでもクラッシュしない', async ({ page }) => {
  await waitForApp(page);

  const result = await page.evaluate(() => {
    try {
      const html = renderReviewJournalList({}, undefined);
      return { success: true, hasEmpty: html.includes('この月の日誌はまだありません') };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  expect(result.success).toBe(true);
  expect(result.hasEmpty).toBe(true);
});
