const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('シードデータ投入', async ({ page }) => {
  // アプリをロード
  await page.goto('/');
  await page.waitForFunction(() => {
    const ls = document.getElementById('loadingScreen');
    return ls && ls.classList.contains('hide');
  }, { timeout: 15000 });
  await page.waitForFunction(() => {
    const appEl = document.getElementById('app');
    return appEl && appEl.children.length > 0;
  }, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // シードデータスクリプトを読み込んで実行
  const seedScript = fs.readFileSync(
    path.join(__dirname, '..', 'seed-data.js'),
    'utf-8'
  );
  await page.evaluate(seedScript);

  // seedAllData()を実行
  const result = await page.evaluate(async () => {
    await seedAllData();
    // 投入結果を確認
    const tasks = await getAllTasks();
    const routines = await getAllRoutines();
    const fbox = await getAllFirstBoxItems();
    const materials = await getAllMaterials();
    const journals = await getAllData('journals');
    const monthlyGoals = await getAllMonthlyGoals();
    const longTermGoals = await getAllLongTermGoals();
    const lifeDesign = await getLifeDesign();
    return {
      tasks: tasks.length,
      routines: routines.length,
      fbox: fbox.length,
      materials: materials.length,
      journals: journals.length,
      monthlyGoals: monthlyGoals.length,
      longTermGoals: longTermGoals.length,
      hasLifeDesign: !!lifeDesign.purpose
    };
  });

  console.log('=== 投入結果 ===');
  console.log('タスク:', result.tasks);
  console.log('ルーティン:', result.routines);
  console.log('F・BOX:', result.fbox);
  console.log('資料:', result.materials);
  console.log('日誌:', result.journals);
  console.log('月次目標:', result.monthlyGoals);
  console.log('長期目標:', result.longTermGoals);
  console.log('人生設計:', result.hasLifeDesign);

  expect(result.tasks).toBeGreaterThanOrEqual(40);
  expect(result.routines).toBeGreaterThanOrEqual(25);
  expect(result.fbox).toBeGreaterThanOrEqual(5);
  expect(result.journals).toBeGreaterThanOrEqual(30);
  expect(result.monthlyGoals).toBeGreaterThanOrEqual(3);
  expect(result.longTermGoals).toBeGreaterThanOrEqual(2);
  expect(result.hasLifeDesign).toBe(true);
});
