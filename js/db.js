/* ========================================
   MM v1.1.0 - データベース管理
   IndexedDB を使用してオフラインでもデータ保存
   ======================================== */

const DB_NAME = 'MatsumuraMethodDB';
const DB_VERSION = 6;

let db = null;

// ストア定義（一箇所で管理）
function createStoresIfNeeded(database) {
  if (!database.objectStoreNames.contains('journals')) {
    const s = database.createObjectStore('journals', { keyPath: 'date' });
    s.createIndex('month', 'month', { unique: false });
  }
  if (!database.objectStoreNames.contains('monthlyGoals')) {
    database.createObjectStore('monthlyGoals', { keyPath: 'yearMonth' });
  }
  if (!database.objectStoreNames.contains('longTermGoals')) {
    database.createObjectStore('longTermGoals', { keyPath: 'id', autoIncrement: true });
  }
  if (!database.objectStoreNames.contains('lifeDesign')) {
    database.createObjectStore('lifeDesign', { keyPath: 'id' });
  }
  if (!database.objectStoreNames.contains('settings')) {
    database.createObjectStore('settings', { keyPath: 'key' });
  }
  if (!database.objectStoreNames.contains('dailyData')) {
    const s = database.createObjectStore('dailyData', { keyPath: 'date' });
    s.createIndex('month', 'month', { unique: false });
  }
  if (!database.objectStoreNames.contains('memos')) {
    const s = database.createObjectStore('memos', { keyPath: 'id', autoIncrement: true });
    s.createIndex('date', 'date', { unique: false });
  }
  if (!database.objectStoreNames.contains('manuals')) {
    const s = database.createObjectStore('manuals', { keyPath: 'id' });
    s.createIndex('category', 'category', { unique: false });
  }
  if (!database.objectStoreNames.contains('firstbox')) {
    const s = database.createObjectStore('firstbox', { keyPath: 'id', autoIncrement: true });
    s.createIndex('createdAt', 'createdAt', { unique: false });
  }
  if (!database.objectStoreNames.contains('tasks')) {
    const s = database.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
    s.createIndex('type', 'type', { unique: false });
    s.createIndex('updatedAt', 'updatedAt', { unique: false });
  }
  if (!database.objectStoreNames.contains('routines')) {
    const s = database.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
    s.createIndex('type', 'type', { unique: false });
    s.createIndex('updatedAt', 'updatedAt', { unique: false });
  }
  if (!database.objectStoreNames.contains('materials')) {
    const s = database.createObjectStore('materials', { keyPath: 'id', autoIncrement: true });
    s.createIndex('fileType', 'fileType', { unique: false });
    s.createIndex('updatedAt', 'updatedAt', { unique: false });
  }
}

// DB接続を設定する共通処理
function setupDBConnection(database) {
  db = database;
  db.onversionchange = () => {
    db.close();
    db = null;
  };
}

// データベース初期化（タイムアウト付き）
function initDBAttempt() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('DB_TIMEOUT'));
    }, 5000);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('DB upgrade blocked - waiting for old connections to close');
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      setupDBConnection(request.result);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      createStoresIfNeeded(event.target.result);
    };
  });
}

// バージョン指定なしでDBを開く（最後の砦）
function initDBFallback() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('DB_FALLBACK_TIMEOUT'));
    }, 5000);

    const request = indexedDB.open(DB_NAME);

    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error);
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      setupDBConnection(request.result);
      resolve(db);
    };
  });
}

// データベース初期化（リトライ＋フォールバック付き）
async function initDB() {
  // 1回目の試行
  try {
    return await initDBAttempt();
  } catch (e1) {
    console.warn('DB init 1st attempt failed:', e1.message);
  }

  // 少し待ってリトライ（古い接続が閉じる時間を確保）
  await new Promise(r => setTimeout(r, 1000));

  // 2回目の試行
  try {
    return await initDBAttempt();
  } catch (e2) {
    console.warn('DB init 2nd attempt failed:', e2.message);
  }

  // バージョン指定なしで開く（バージョンアップは諦め、既存データで動作）
  console.warn('DB init falling back to current version');
  return await initDBFallback();
}

// 汎用：データ保存
function saveData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 汎用：データ取得
function getData(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 汎用：全データ取得
function getAllData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 汎用：データ削除
function deleteData(storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// インデックスで検索
function getDataByIndex(storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/* ========================================
   日誌関連
   ======================================== */

// 今日の日付を取得（YYYY-MM-DD形式）
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 今月を取得（YYYY-MM形式）
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 日誌のデフォルトデータ
function getDefaultJournal(date) {
  const [year, month] = date.split('-');
  return {
    date: date,
    month: `${year}-${month}`,
    score: 0,
    reflections: {
      reflection: '',      // 今日の反省
      effort: '',          // 今日の努力・成果
      contribution: '',    // 世の為人の為にしたこと
      gratitude: '',       // 印象的・気付き・感謝
      free: ''             // 自由記入
    },
    schedule: [],          // 今日の予定リスト
    routines: [],          // 月次目標から同期される
    coreActions: {
      deadline: { name: '', done: false },
      processing: { name: '', done: false },
      habit: { name: '', done: false },
      other: { name: '', done: false }
    },
    supplement: {
      sleep: '',
      work: '',
      income: 0,
      expense: 0,
      calorieIn: 0,
      calorieOut: 0,
      weight: 0
    },
    timeSchedule: '',
    memo: ''
  };
}

// 日誌にデータがあるかチェック
function hasJournalData(journal) {
  if (!journal) return false;
  // スコアがあれば保存
  if (journal.score) return true;
  // 振り返りがあれば保存
  if (journal.reflections) {
    const r = journal.reflections;
    if (r.reflection || r.effort || r.contribution || r.gratitude || r.free) return true;
  }
  // メモがあれば保存
  if (journal.memo) return true;
  // 予定があれば保存
  if (journal.schedule && journal.schedule.length > 0) return true;
  // ルーティンに名前があれば保存
  if (journal.routines && journal.routines.some(r => r.name || r.done)) return true;
  // コアアクションに名前があれば保存
  if (journal.coreActions) {
    const ca = journal.coreActions;
    if ((ca.deadline && (ca.deadline.name || ca.deadline.done)) ||
        (ca.processing && (ca.processing.name || ca.processing.done)) ||
        (ca.habit && (ca.habit.name || ca.habit.done)) ||
        (ca.other && (ca.other.name || ca.other.done))) return true;
  }
  // 補足データがあれば保存
  if (journal.supplement) {
    const s = journal.supplement;
    if (s.income || s.expense || s.sleep || s.work || s.calorieIn || s.calorieOut || s.weight) return true;
  }
  return false;
}

// 日誌を保存
async function saveJournal(journal) {
  if (!hasJournalData(journal)) return; // 空なら保存しない
  return saveData('journals', journal);
}

// 日誌を取得
async function getJournal(date) {
  const journal = await getData('journals', date);
  return journal || getDefaultJournal(date);
}

// 今日の日誌を取得
async function getTodayJournal() {
  return getJournal(getTodayDate());
}

// 月の日誌一覧を取得
async function getMonthJournals(yearMonth) {
  return getDataByIndex('journals', 'month', yearMonth);
}

// 日誌を削除
async function deleteJournal(date) {
  return deleteData('journals', date);
}

/* ========================================
   月次目標関連
   ======================================== */

// 月次目標のデフォルトデータ
function getDefaultMonthlyGoal(yearMonth) {
  return {
    yearMonth: yearMonth,
    goal: '',
    perspectives: {
      othersFeeling: '',
      othersVisible: '',
      selfFeeling: '',
      selfVisible: ''
    },
    patterns: {
      success: { rei: '', shin: '', gi: '', tai: '', sei: '' },
      failure: { rei: '', shin: '', gi: '', tai: '', sei: '' }
    },
    problems: { rei: '', shin: '', gi: '', tai: '', sei: '' },
    solutions: { rei: '', shin: '', gi: '', tai: '', sei: '' },
    breakdown: {
      factors: []  // { name: '', actions: [] }
    },
    routines: [
      { id: 1, category: 'rei', name: '' },
      { id: 2, category: 'rei', name: '' },
      { id: 3, category: 'shin', name: '' },
      { id: 4, category: 'shin', name: '' },
      { id: 5, category: 'gi', name: '' },
      { id: 6, category: 'gi', name: '' },
      { id: 7, category: 'tai', name: '' },
      { id: 8, category: 'tai', name: '' },
      { id: 9, category: 'sei', name: '' },
      { id: 10, category: 'sei', name: '' }
    ],
    coreActions: {
      deadline: '',
      processing: '',
      habit: '',
      other: ''
    },
    schedulePatterns: [],
    support: {
      supporter: '',
      content: ''
    }
  };
}

// 月次目標にデータがあるかチェック
function hasMonthlyGoalData(goal) {
  if (!goal) return false;
  // 目標があれば保存
  if (goal.goal) return true;
  // ビジョンがあれば保存
  if (goal.vision) return true;
  // 観点にデータがあれば保存
  if (goal.perspectives) {
    const p = goal.perspectives;
    if (p.othersFeeling || p.othersVisible || p.selfFeeling || p.selfVisible) return true;
  }
  // パターンにデータがあれば保存
  if (goal.patterns) {
    const checkPattern = (pat) => pat && (pat.rei || pat.shin || pat.gi || pat.tai || pat.sei);
    if (checkPattern(goal.patterns.success) || checkPattern(goal.patterns.failure)) return true;
  }
  // ルーティンに名前があれば保存
  if (goal.routines && goal.routines.some(r => r.name)) return true;
  // コアアクションがあれば保存
  if (goal.coreActions) {
    const ca = goal.coreActions;
    if (ca.deadline || ca.processing || ca.habit || ca.other) return true;
  }
  // サポートがあれば保存
  if (goal.support && (goal.support.supporter || goal.support.content)) return true;
  return false;
}

// 月次目標を保存
async function saveMonthlyGoal(goal) {
  if (!hasMonthlyGoalData(goal)) return; // 空なら保存しない
  return saveData('monthlyGoals', goal);
}

// 月次目標を取得
async function getMonthlyGoal(yearMonth) {
  const goal = await getData('monthlyGoals', yearMonth);
  return goal || getDefaultMonthlyGoal(yearMonth);
}

// 現在の月次目標を取得
async function getCurrentMonthlyGoal() {
  return getMonthlyGoal(getCurrentMonth());
}

// 全月次目標を取得
async function getAllMonthlyGoals() {
  return getAllData('monthlyGoals');
}

// 月次目標を削除
async function deleteMonthlyGoal(yearMonth) {
  return deleteData('monthlyGoals', yearMonth);
}

/* ========================================
   長期目標関連
   ======================================== */

// 長期目標にデータがあるかチェック
function hasLongTermGoalData(goal) {
  if (!goal) return false;
  // 目標があれば保存
  if (goal.goal) return true;
  // 期限があれば保存
  if (goal.deadlineYear || goal.deadlineMonth) return true;
  // マイルストーンにデータがあれば保存
  if (goal.milestones && goal.milestones.some(m => m.year || m.month || m.goal)) return true;
  return false;
}

// 長期目標を保存
async function saveLongTermGoal(goal) {
  if (!hasLongTermGoalData(goal)) return; // 空なら保存しない
  return saveData('longTermGoals', goal);
}

// 長期目標を取得
async function getLongTermGoal(id) {
  return getData('longTermGoals', id);
}

// 全長期目標を取得
async function getAllLongTermGoals() {
  return getAllData('longTermGoals');
}

// 長期目標を削除
async function deleteLongTermGoal(id) {
  return deleteData('longTermGoals', id);
}

/* ========================================
   人生設計関連
   ======================================== */

// 人生設計のデフォルトデータ
function getDefaultLifeDesign() {
  return {
    id: 'main',
    purpose: '',
    meaning: '',
    ageGoals: []  // { age: 30, goal: '' }
  };
}

// 人生設計を保存
async function saveLifeDesign(design) {
  return saveData('lifeDesign', design);
}

// 人生設計を取得
async function getLifeDesign() {
  const design = await getData('lifeDesign', 'main');
  return design || getDefaultLifeDesign();
}

/* ========================================
   設定関連
   ======================================== */

// 設定を保存
async function saveSetting(key, value) {
  return saveData('settings', { key, value });
}

// 設定を取得
async function getSetting(key, defaultValue = null) {
  const setting = await getData('settings', key);
  return setting ? setting.value : defaultValue;
}

/* ========================================
   F・BOX関連
   ======================================== */

// F・BOXにアイテムを追加
async function saveFirstBoxItem(text) {
  return saveData('firstbox', {
    text: text,
    createdAt: new Date().toISOString()
  });
}

// F・BOX全アイテム取得（新しい順）
async function getAllFirstBoxItems() {
  const items = await getAllData('firstbox');
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// F・BOXアイテム削除（振り分け完了時）
async function deleteFirstBoxItem(id) {
  return deleteData('firstbox', id);
}

/* ========================================
   タスク関連（v1.3.0追加）
   type: 'action' | 'project' | 'waiting' | 'calendar' | 'wish'
   ======================================== */

// タスクを保存
async function saveTask(task) {
  const now = new Date().toISOString();
  if (!task.id) {
    task.createdAt = now;
  }
  task.updatedAt = now;
  return saveData('tasks', task);
}

// タスクを取得
async function getTask(id) {
  return getData('tasks', id);
}

// 全タスクを取得
async function getAllTasks() {
  return getAllData('tasks');
}

// タイプ別にタスクを取得
async function getTasksByType(type) {
  return getDataByIndex('tasks', 'type', type);
}

// タスクを削除
async function deleteTask(id) {
  return deleteData('tasks', id);
}

/* ========================================
   ルーティン関連（v1.3.0追加）
   type: 'goal' | 'obligation' | 'maintenance' | 'principle' | 'candidate'
   ======================================== */

// ルーティンを保存
async function saveRoutine(routine) {
  const now = new Date().toISOString();
  if (!routine.id) {
    routine.createdAt = now;
  }
  routine.updatedAt = now;
  return saveData('routines', routine);
}

// ルーティンを取得
async function getRoutine(id) {
  return getData('routines', id);
}

// 全ルーティンを取得
async function getAllRoutines() {
  return getAllData('routines');
}

// タイプ別にルーティンを取得
async function getRoutinesByType(type) {
  return getDataByIndex('routines', 'type', type);
}

// ルーティンを削除
async function deleteRoutine(id) {
  return deleteData('routines', id);
}

/* ========================================
   資料関連（v1.3.0追加）
   fileType: 'text' | 'url' | 'image' | 'audio' | 'video' | 'pdf'
   ======================================== */

// 資料を保存
async function saveMaterial(material) {
  const now = new Date().toISOString();
  if (!material.id) {
    material.createdAt = now;
  }
  material.updatedAt = now;
  return saveData('materials', material);
}

// 資料を取得
async function getMaterial(id) {
  return getData('materials', id);
}

// 全資料を取得
async function getAllMaterials() {
  return getAllData('materials');
}

// 資料を削除
async function deleteMaterial(id) {
  return deleteData('materials', id);
}

/* ========================================
   データ構造ファクトリ（AI補足対応の拡張構造）
   全ての新規作成はこのファクトリを経由する
   ======================================== */

// タスクの初期データ構造
function createTaskData(type, title, extra = {}) {
  return {
    type,
    title,
    description: '',
    status: 'open',
    priority: null,
    deadline: '',
    subtasks: [],
    notes: '',
    relatedProjectId: null,
    source: 'manual',
    aiSuggestions: [],
    completionCriteria: '',
    who: '',
    dateTime: '',
    ...extra
  };
}

// ルーティンの初期データ構造
function createRoutineData(type, title, extra = {}) {
  return {
    type,
    title,
    description: '',
    frequency: '',
    notes: '',
    nextDate: '',
    streak: 0,
    totalDone: 0,
    lastDoneAt: null,
    source: 'manual',
    aiSuggestions: [],
    ...extra
  };
}

// 資料の初期データ構造
function createMaterialData(title, extra = {}) {
  return {
    title: title || '無題',
    content: '',
    tags: [],
    notes: '',
    source: 'manual',
    aiSuggestions: [],
    ...extra
  };
}

/* ========================================
   補足データ関連（収支・カロリー等）
   ======================================== */

// 日次データを保存
async function saveDailyData(data) {
  return saveData('dailyData', data);
}

// 日次データを取得
async function getDailyData(date) {
  return getData('dailyData', date);
}

// 今日の日次データを取得または作成
async function getTodayDailyData() {
  const date = getTodayDate();
  const data = await getDailyData(date);
  if (data) return data;

  const [year, month] = date.split('-');
  return {
    date: date,
    month: `${year}-${month}`,
    income: 0,
    expense: 0,
    calorieIn: 0,
    calorieOut: 0,
    weight: 0,
    timerRecords: []
  };
}

/* ========================================
   メモ関連
   ======================================== */

// メモを保存
async function saveMemo(memo) {
  if (!memo.id) {
    memo.id = Date.now();
  }
  memo.date = memo.date || getTodayDate();
  return saveData('memos', memo);
}

// 全メモを取得
async function getAllMemos() {
  return getAllData('memos');
}

// メモを削除
async function deleteMemo(id) {
  return deleteData('memos', id);
}

/* ========================================
   統計計算
   ======================================== */

// ルーティン達成率を計算
function calculateRoutineRate(journal) {
  if (!journal || !journal.routines) return 0;
  const completed = journal.routines.filter(r => r.done).length;
  return Math.round((completed / journal.routines.length) * 100);
}

// 月の達成率平均を計算
async function calculateMonthlyAverageRate(yearMonth) {
  const journals = await getMonthJournals(yearMonth);
  if (journals.length === 0) return 0;

  const totalRate = journals.reduce((sum, j) => sum + calculateRoutineRate(j), 0);
  return Math.round(totalRate / journals.length);
}

/* ========================================
   マニュアル関連（v1.1.0追加）
   ======================================== */

// マニュアルを保存
async function saveManual(manual) {
  if (!manual.id) {
    manual.id = Date.now();
  }
  manual.updatedAt = new Date().toISOString();
  return saveData('manuals', manual);
}

// マニュアルを取得
async function getManual(id) {
  return getData('manuals', id);
}

// 全マニュアルを取得
async function getAllManuals() {
  return getAllData('manuals');
}

// マニュアルを削除
async function deleteManual(id) {
  return deleteData('manuals', id);
}
