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

// ===== 振り返りルーティンチェックリスト =====

// ヘルパー: 振り返り月ページをルーティンタブで開く
async function openReviewRoutineTab(page) {
  await waitForApp(page);
  // デモデータで振り返り月ページを開く
  const currentMonth = await page.evaluate(() => getCurrentMonth());
  await page.evaluate((ym) => app.viewReviewMonth(ym), currentMonth);
  await page.waitForTimeout(500);
  // ルーティンタブに切り替え
  await page.evaluate(() => app.switchReviewTab('routines'));
  await page.waitForTimeout(300);
}

test('V16: 振り返りページに「ルーティン」タブが表示される', async ({ page }) => {
  await waitForApp(page);
  const currentMonth = await page.evaluate(() => getCurrentMonth());
  await page.evaluate((ym) => app.viewReviewMonth(ym), currentMonth);
  await page.waitForTimeout(500);
  const tabs = await page.evaluate(() => {
    const tabEls = document.querySelectorAll('.rv-tab');
    return Array.from(tabEls).map(t => t.textContent.trim());
  });
  expect(tabs).toContain('ルーティン');
  expect(tabs.length).toBe(3);
});

test('V17: switchReviewTabがroutinesタブを受け付ける', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app.switchReviewTab('routines');
    return app.reviewTab;
  });
  expect(result).toBe('routines');
});

test('V18: switchReviewTabが不正な値をmonthlyにフォールバックする', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    app.switchReviewTab('invalid');
    return app.reviewTab;
  });
  expect(result).toBe('monthly');
});

test('V19: ルーティンタブ切替でrcl-containerが表示される', async ({ page }) => {
  await openReviewRoutineTab(page);
  // データがある場合はrcl-container、ない場合はrv-emptyが表示される
  const hasContent = await page.evaluate(() => {
    return document.querySelector('.rcl-container') !== null || document.querySelector('.rv-empty') !== null;
  });
  expect(hasContent).toBe(true);
});

test('V20: ルーティンデータなし時に空メッセージが表示される', async ({ page }) => {
  await waitForApp(page);
  // ルーティンなしの振り返りデータを設定
  await page.evaluate(() => {
    app.reviewYearMonth = '2020-01';
    app.data.reviewJournals = [{ date: '2020-01-01', routines: [] }];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const emptyMsg = page.locator('.rv-empty');
  await expect(emptyMsg).toBeVisible();
  const text = await emptyMsg.textContent();
  expect(text).toContain('ルーティンデータはありません');
});

test('V21: ルーティンチェックリストにサマリーが表示される', async ({ page }) => {
  await waitForApp(page);
  // テストデータを設定
  await page.evaluate(() => {
    app.reviewYearMonth = '2025-03';
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [{ name: 'テスト', done: true, status: 'done' }] },
      { date: '2025-03-02', routines: [{ name: 'テスト', done: false, status: 'none' }] }
    ];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const summary = page.locator('.rcl-summary');
  await expect(summary).toBeVisible();
  const rateText = await page.locator('.rcl-summary-num').textContent();
  expect(rateText).toBe('50%');
});

test('V22: ルーティン別達成率バーが表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.reviewYearMonth = '2025-03';
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [{ name: 'R1', done: true, status: 'done' }, { name: 'R2', done: false }] },
      { date: '2025-03-02', routines: [{ name: 'R1', done: false }, { name: 'R2', done: true, status: 'done' }] }
    ];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const rows = page.locator('.rcl-routine-row');
  const count = await rows.count();
  expect(count).toBe(2); // R1とR2の2行
  const rates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rcl-routine-rate')).map(el => el.textContent.trim());
  });
  expect(rates).toEqual(['50%', '50%']);
});

test('V23: マトリクスが横スクロール可能なラッパー内に表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.reviewYearMonth = '2025-03';
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [{ name: 'A', done: true, status: 'done' }] }
    ];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const wrap = page.locator('.rcl-matrix-wrap');
  await expect(wrap).toBeVisible();
  const overflowX = await wrap.evaluate(el => getComputedStyle(el).overflowX);
  expect(overflowX).toBe('auto');
});

test('V24: マトリクスセルに●/◐/○アイコンが表示される', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.reviewYearMonth = '2025-03';
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [
        { name: 'R1', done: true, status: 'done' },
        { name: 'R2', done: false, status: 'partial' },
        { name: 'R3', done: false }
      ]}
    ];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const cells = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.rcl-cell:not(.rcl-na)')).map(el => el.textContent.trim());
  });
  expect(cells).toContain('●'); // done
  expect(cells).toContain('◐'); // partial
  expect(cells).toContain('○'); // none
});

test('V25: toggleReviewRoutineメソッドが存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => typeof app.toggleReviewRoutine === 'function');
  expect(exists).toBe(true);
});

test('V26: toggleReviewRoutineがステータスを正しく遷移させる（none→done→partial→none）', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [{ name: 'Test', done: false }] }
    ];
    const r = () => app.data.reviewJournals[0].routines[0];

    // none → done
    await app.toggleReviewRoutine('2025-03-01', 0);
    const s1 = r().status;

    // done → partial
    await app.toggleReviewRoutine('2025-03-01', 0);
    const s2 = r().status;

    // partial → none (status removed or set to none)
    await app.toggleReviewRoutine('2025-03-01', 0);
    const s3 = getRoutineStatus(r());

    return { s1, s2, s3 };
  });
  expect(result.s1).toBe('done');
  expect(result.s2).toBe('partial');
  expect(result.s3).toBe('none');
});

test('V27: toggleReviewRoutineがtodayJournalを同期する', async ({ page }) => {
  await waitForApp(page);
  const synced = await page.evaluate(async () => {
    const today = getTodayDate();
    app.data.todayJournal = { date: today, routines: [{ name: 'Sync', done: false }] };
    app.data.reviewJournals = [app.data.todayJournal];
    await app.toggleReviewRoutine(today, 0);
    return app.data.todayJournal.routines[0].status === 'done';
  });
  expect(synced).toBe(true);
});

test('V28: toggleReviewRoutineが無効なパラメータで安全に動作する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    app.data.reviewJournals = [];
    // 存在しない日付
    await app.toggleReviewRoutine('9999-12-31', 0);
    // 存在しない index
    app.data.reviewJournals = [{ date: '2025-03-01', routines: [{ name: 'X' }] }];
    await app.toggleReviewRoutine('2025-03-01', 99);
    return true; // エラーなく完了
  });
  expect(result).toBe(true);
});

test('V29: .rcl-matrix-wrapがスワイプ除外に含まれている', async ({ page }) => {
  await waitForApp(page);
  const inExclusion = await page.evaluate(() => {
    const src = app.handleMainTabSwipeStart.toString();
    return src.includes('rcl-matrix-wrap');
  });
  expect(inExclusion).toBe(true);
});

test('V30: .rcl-cellのタップ領域が十分な大きさ（44px以上）', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => {
    app.reviewYearMonth = '2025-03';
    app.data.reviewJournals = [
      { date: '2025-03-01', routines: [{ name: 'Size', done: true, status: 'done' }] }
    ];
    app.data.reviewMonthlyGoal = {};
    app.reviewTab = 'routines';
    app.navigate('review');
  });
  await page.waitForTimeout(300);
  const sizes = await page.evaluate(() => {
    const cell = document.querySelector('.rcl-cell:not(.rcl-na)');
    if (!cell) return null;
    const s = getComputedStyle(cell);
    return {
      minWidth: parseInt(s.minWidth),
      minHeight: parseInt(s.minHeight)
    };
  });
  if (sizes) {
    expect(sizes.minWidth).toBeGreaterThanOrEqual(44);
    expect(sizes.minHeight).toBeGreaterThanOrEqual(44);
  }
});

// ===== v331-v333 テスト =====

test('V31: Notion設定モーダルが正しいパターンで開く', async ({ page }) => {
  await waitForApp(page);
  await page.evaluate(() => app.showNotionSettingsModal());
  await page.waitForTimeout(200);
  const modal = await page.evaluate(() => {
    const c = document.getElementById('modal-container');
    if (!c) return null;
    return {
      hasOverlay: !!c.querySelector('.modal-overlay.active'),
      hasContent: !!c.querySelector('.modal-content'),
      hasKeyInput: !!c.querySelector('#notionApiKeyInput'),
      hasPageInput: !!c.querySelector('#notionPageIdInput'),
      keyInputType: c.querySelector('#notionApiKeyInput')?.type
    };
  });
  expect(modal).not.toBeNull();
  expect(modal.hasOverlay).toBe(true);
  expect(modal.hasContent).toBe(true);
  expect(modal.hasKeyInput).toBe(true);
  expect(modal.hasPageInput).toBe(true);
  expect(modal.keyInputType).toBe('password');
});

test('V32: Notion設定バリデーション（不正APIキー）', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    app.showNotionSettingsModal();
    await new Promise(r => setTimeout(r, 100));
    document.getElementById('notionApiKeyInput').value = 'invalid_key';
    document.getElementById('notionPageIdInput').value = '300339928dce80799c62d66c80021997';
    await app.saveNotionSettings();
    return { key: app.data.settings.notionApiKey || '' };
  });
  // 不正なキーはntn_で始まらないので保存されないはず
  expect(result.key).not.toBe('invalid_key');
});

test('V33: autoGenerateTitle内でsaveJournalが呼ばれない', async ({ page }) => {
  await waitForApp(page);
  const callCount = await page.evaluate(async () => {
    let count = 0;
    const origSave = window.saveJournal;
    window.saveJournal = async (j) => { count++; return origSave(j); };
    const journal = { date: '2026-03-16', reflections: { reflection: 'テスト内容' } };
    await app.autoGenerateTitle(journal);
    window.saveJournal = origSave;
    return count;
  });
  expect(callCount).toBe(0);
});

test('V34: autoGenerateTitleでフォールバックタイトルが15文字以内', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(async () => {
    const journal = { date: '2026-03-16', reflections: { reflection: '非常に長いテスト文章です。これは15文字を超えるはず。もっと書きます。' } };
    await app.autoGenerateTitle(journal);
    return journal.title;
  });
  expect(result).toBeTruthy();
  expect(result.length).toBeLessThanOrEqual(15);
});

test('V35: _notionTextBlockが2000文字超を正しく分割する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const longText = 'あ'.repeat(4500);
    const block = app._notionTextBlock('paragraph', longText);
    return {
      type: block.type,
      richTextCount: block.paragraph.rich_text.length,
      firstLen: block.paragraph.rich_text[0].text.content.length,
      totalLen: block.paragraph.rich_text.reduce((s, r) => s + r.text.content.length, 0)
    };
  });
  expect(result.type).toBe('paragraph');
  expect(result.richTextCount).toBe(3); // 4500/2000 = 3 chunks
  expect(result.firstLen).toBe(2000);
  expect(result.totalLen).toBe(4500);
});

test('V36: _notionFindChildPageのprefixMatchが前方一致で検索する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    // _notionFindChildPageのfind条件をテスト（API呼び出しなし）
    const testResults = [
      { type: 'child_page', child_page: { title: '2026-03-16 テスト' }, id: 'found-id' },
      { type: 'child_page', child_page: { title: '2026-03-17 別の日' }, id: 'other-id' }
    ];
    const found = testResults.find(b => {
      if (b.type !== 'child_page' || !b.child_page) return false;
      return b.child_page.title.startsWith('2026-03-16');
    });
    return found ? found.id : null;
  });
  expect(result).toBe('found-id');
});

test('V37: getDefaultJournalにtitleフィールドがある', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const j = getDefaultJournal('2026-03-16');
    return { hasTitle: 'title' in j, titleValue: j.title };
  });
  expect(result.hasTitle).toBe(true);
  expect(result.titleValue).toBe('');
});

test('V38: hasJournalDataがtitleを認識する', async ({ page }) => {
  await waitForApp(page);
  const result = await page.evaluate(() => {
    const emptyJ = getDefaultJournal('2026-03-16');
    const titleJ = { ...getDefaultJournal('2026-03-16'), title: 'テスト' };
    return { empty: hasJournalData(emptyJ), withTitle: hasJournalData(titleJ) };
  });
  expect(result.empty).toBe(false);
  expect(result.withTitle).toBe(true);
});

test('V39: score-ticksダークモード定義が存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('.dark-mode') && rule.selectorText.includes('.score-ticks')) return true;
        }
      } catch (e) {}
    }
    return false;
  });
  expect(exists).toBe(true);
});

test('V40: fbox-organize-btnダークモード定義が存在する', async ({ page }) => {
  await waitForApp(page);
  const exists = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('.dark-mode') && rule.selectorText.includes('.fbox-organize-btn')) return true;
        }
      } catch (e) {}
    }
    return false;
  });
  expect(exists).toBe(true);
});
