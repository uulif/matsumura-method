// QA Phase 2: v355 カレンダー機能強化テスト
// 独立実行可能: npx playwright test tests/qa-v355.spec.js
// スクショ保存先: tests/screenshots/

const { test, expect } = require('@playwright/test');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// === 3ヶ月分テストデータ ===
function buildMonthlyGoal(yearMonth, config) {
  return {
    yearMonth,
    goal: config.goal || '',
    vision: config.vision || '',
    perspectives: config.perspectives || {
      othersFeeling: '', othersVisible: '', selfFeeling: '', selfVisible: ''
    },
    patterns: config.patterns || {
      success: { rei: '', shin: '', gi: '', tai: '', sei: '' },
      failure: { rei: '', shin: '', gi: '', tai: '', sei: '' }
    },
    problems: config.problems || { rei: '', shin: '', gi: '', tai: '', sei: '' },
    solutions: config.solutions || { rei: '', shin: '', gi: '', tai: '', sei: '' },
    breakdown: config.breakdown || { factors: [] },
    routines: config.routines,
    coreActions: config.coreActions,
    schedulePatterns: config.schedulePatterns || [],
    reward: config.reward || {
      selfFeeling: '', selfVisible: '', othersFeeling: '', othersVisible: ''
    },
    support: config.support || { supporter: '', content: '' }
  };
}

// 1月データ（70%+埋め）
const JAN_GOAL = buildMonthlyGoal('2026-01', {
  goal: '新年の目標を明確にし、習慣の土台を作る',
  vision: '1月末には毎日のルーティンが自然にできている状態',
  perspectives: {
    othersFeeling: '落ち着いた人だと思われたい',
    othersVisible: '毎日同じ時間に活動している',
    selfFeeling: '自分のペースを掴めている感覚',
    selfVisible: '日誌を毎日記入できている'
  },
  patterns: {
    success: { rei: '感謝の気持ちを忘れない', shin: '集中時間を確保', gi: '計画的に行動', tai: '早起きする', sei: '整理整頓' },
    failure: { rei: '焦って雑になる', shin: 'SNS見すぎ', gi: '先延ばし', tai: '夜更かし', sei: '机が散らかる' }
  },
  problems: { rei: '感謝を忘れがち', shin: '集中力低下', gi: '計画倒れ', tai: '運動不足', sei: '片付け苦手' },
  solutions: { rei: '毎晩感謝日記', shin: 'ポモドーロ法', gi: 'タスク細分化', tai: '朝散歩15分', sei: '5分片付け' },
  routines: [
    { id: 1, category: 'rei', name: '朝の感謝3つ', priority: 1, condition: '起床直後', minimumAction: '1つでも書く', troubleAnticipation: '寝坊した日はスキップしがち' },
    { id: 2, category: 'rei', name: '夜の振り返り', priority: 2, condition: '就寝前', minimumAction: '一言でも', troubleAnticipation: '疲れて忘れる' },
    { id: 3, category: 'shin', name: 'ポモドーロ2セット', priority: 3, condition: '午前中', minimumAction: '1セットでもOK', troubleAnticipation: '予定が入る' },
    { id: 4, category: 'shin', name: '読書30分', priority: 4, condition: '昼休みor夜', minimumAction: '10分でもOK', troubleAnticipation: '本が見つからない' },
    { id: 5, category: 'gi', name: 'タスク整理', priority: 5, condition: '朝一番', minimumAction: '3件確認', troubleAnticipation: '' },
    { id: 6, category: 'gi', name: '週次レビュー', priority: 6, condition: '日曜夜', minimumAction: '15分振り返り', troubleAnticipation: '日曜に外出' },
    { id: 7, category: 'tai', name: '朝散歩15分', priority: 7, condition: '起床後1時間以内', minimumAction: '5分でも外に出る', troubleAnticipation: '雨の日' },
    { id: 8, category: 'tai', name: 'ストレッチ', priority: 8, condition: '就寝前', minimumAction: '3分', troubleAnticipation: '' },
    { id: 9, category: 'sei', name: '5分片付け', priority: 9, condition: '仕事開始前', minimumAction: '机の上だけ', troubleAnticipation: '' },
    { id: 10, category: 'sei', name: '', priority: 10 }
  ],
  coreActions: {
    deadline: '確定申告の準備資料を集める',
    processing: '未読メールを0にする',
    habit: '毎日水2リットル',
    other: '新しい手帳のセットアップ'
  },
  schedulePatterns: [
    {
      id: 1001, name: '平日パターン', priority: 2,
      condition: { type: 'weekdays', days: [1, 2, 3, 4, 5] },
      schedule: [
        { startHour: 6, startMinute: 30, activity: '起床・散歩', color: '#4CAF50' },
        { startHour: 7, startMinute: 30, activity: '朝食・準備', color: '#FF9800' },
        { startHour: 9, startMinute: 0, activity: '集中作業（ポモドーロ）', color: '#2196F3' },
        { startHour: 12, startMinute: 0, activity: '昼食・読書', color: '#FF9800' },
        { startHour: 13, startMinute: 0, activity: '午後作業', color: '#2196F3' },
        { startHour: 18, startMinute: 0, activity: '夕食・自由時間', color: '#9C27B0' },
        { startHour: 22, startMinute: 0, activity: 'ストレッチ・振り返り', color: '#4CAF50' },
        { startHour: 23, startMinute: 0, activity: '就寝', color: '#607D8B' }
      ]
    },
    {
      id: 1002, name: '休日パターン', priority: 2,
      condition: { type: 'weekdays', days: [0, 6] },
      schedule: [
        { startHour: 8, startMinute: 0, activity: 'ゆっくり起床', color: '#4CAF50' },
        { startHour: 9, startMinute: 0, activity: '掃除・洗濯', color: '#FF9800' },
        { startHour: 10, startMinute: 30, activity: '自由時間', color: '#9C27B0' },
        { startHour: 12, startMinute: 0, activity: '昼食', color: '#FF9800' },
        { startHour: 13, startMinute: 0, activity: '趣味・外出', color: '#E91E63' },
        { startHour: 18, startMinute: 0, activity: '夕食', color: '#FF9800' },
        { startHour: 20, startMinute: 0, activity: '週次レビュー（日曜）', color: '#2196F3' },
        { startHour: 23, startMinute: 0, activity: '就寝', color: '#607D8B' }
      ]
    }
  ],
  reward: {
    selfFeeling: '達成感と自信',
    selfVisible: 'ルーティン定着率80%以上',
    othersFeeling: '頼れる存在だと思われる',
    othersVisible: '安定した生活リズム'
  },
  support: { supporter: '家族', content: '朝の声掛け' }
});

// 2月データ（70%+埋め）
const FEB_GOAL = buildMonthlyGoal('2026-02', {
  goal: '集中力を高め、プロジェクトを前進させる',
  vision: '2月末にはプロジェクトの核心部分が完成している',
  perspectives: {
    othersFeeling: '仕事ができる人だと思われたい',
    othersVisible: '成果物が目に見える形で出ている',
    selfFeeling: 'フロー状態を日常的に体験できている',
    selfVisible: ''
  },
  patterns: {
    success: { rei: '謙虚に学ぶ', shin: 'ディープワーク', gi: 'PDCA回す', tai: '体力維持', sei: '' },
    failure: { rei: '慢心', shin: '浅い作業', gi: '振り返りなし', tai: '', sei: '' }
  },
  routines: [
    { id: 1, category: 'rei', name: '感謝ジャーナル', priority: 1, condition: '朝', minimumAction: '1行', troubleAnticipation: '' },
    { id: 2, category: 'rei', name: '他者への声掛け', priority: 2, condition: '日中', minimumAction: '1人に', troubleAnticipation: 'テレワークの日' },
    { id: 3, category: 'shin', name: 'ディープワーク90分', priority: 3, condition: '午前', minimumAction: '30分集中', troubleAnticipation: '会議が入る' },
    { id: 4, category: 'shin', name: '技術記事を読む', priority: 4, condition: '昼休み', minimumAction: '1記事', troubleAnticipation: '' },
    { id: 5, category: 'gi', name: '朝のタスク優先順位付け', priority: 5, condition: '始業前', minimumAction: 'Top3決める', troubleAnticipation: '' },
    { id: 6, category: 'gi', name: '日次振り返り', priority: 6, condition: '終業後', minimumAction: '5分', troubleAnticipation: '残業時' },
    { id: 7, category: 'tai', name: 'ジョギング20分', priority: 7, condition: '朝 or 夕', minimumAction: '10分ウォーキング', troubleAnticipation: '寒い日' },
    { id: 8, category: 'tai', name: '', priority: 8 },
    { id: 9, category: 'sei', name: 'デスク整理', priority: 9, condition: '退勤前', minimumAction: '1分片付け', troubleAnticipation: '' },
    { id: 10, category: 'sei', name: '', priority: 10 }
  ],
  coreActions: {
    deadline: 'プロジェクトAlpha中間レビュー',
    processing: 'コードレビュー依頼に即日対応',
    habit: '水2L + プロテイン',
    other: '確定申告提出'
  },
  schedulePatterns: [
    {
      id: 2001, name: '出社日', priority: 1,
      condition: { type: 'weekdays', days: [1, 3, 5] },
      schedule: [
        { startHour: 6, startMinute: 0, activity: '起床・準備', color: '#4CAF50' },
        { startHour: 7, startMinute: 30, activity: '通勤', color: '#607D8B' },
        { startHour: 9, startMinute: 0, activity: 'ディープワーク', color: '#2196F3' },
        { startHour: 12, startMinute: 0, activity: '昼食・技術記事', color: '#FF9800' },
        { startHour: 13, startMinute: 0, activity: 'チームミーティング', color: '#E91E63' },
        { startHour: 14, startMinute: 0, activity: '午後作業', color: '#2196F3' },
        { startHour: 18, startMinute: 0, activity: '退勤・ジョギング', color: '#4CAF50' },
        { startHour: 20, startMinute: 0, activity: '夕食・自由時間', color: '#9C27B0' }
      ]
    },
    {
      id: 2002, name: 'テレワーク日', priority: 1,
      condition: { type: 'weekdays', days: [2, 4] },
      schedule: [
        { startHour: 7, startMinute: 0, activity: '起床・ジョギング', color: '#4CAF50' },
        { startHour: 8, startMinute: 30, activity: '朝食・始業準備', color: '#FF9800' },
        { startHour: 9, startMinute: 0, activity: 'ディープワーク', color: '#2196F3' },
        { startHour: 12, startMinute: 0, activity: '昼食・散歩', color: '#FF9800' },
        { startHour: 13, startMinute: 0, activity: '午後作業', color: '#2196F3' },
        { startHour: 17, startMinute: 30, activity: '終業・日次振り返り', color: '#9C27B0' },
        { startHour: 18, startMinute: 30, activity: '夕食・読書', color: '#FF9800' }
      ]
    },
    {
      id: 2003, name: '休日', priority: 2,
      condition: { type: 'weekdays', days: [0, 6] },
      schedule: [
        { startHour: 8, startMinute: 30, activity: 'ゆっくり起床', color: '#4CAF50' },
        { startHour: 10, startMinute: 0, activity: '個人プロジェクト', color: '#2196F3' },
        { startHour: 12, startMinute: 0, activity: '昼食・外出', color: '#E91E63' },
        { startHour: 18, startMinute: 0, activity: '夕食・リラックス', color: '#9C27B0' }
      ]
    }
  ],
  reward: {
    selfFeeling: '確実に前進している実感',
    selfVisible: 'プロジェクト進捗50%達成',
    othersFeeling: '',
    othersVisible: ''
  },
  support: { supporter: 'メンター', content: '週1の1on1' }
});

// 3月データ（70%+埋め）＝テスト実行時の「今月」
const MAR_GOAL = buildMonthlyGoal('2026-03', {
  goal: '第1四半期を締めくくり、次の四半期に繋げる',
  vision: '3月末には成果を可視化し、4月以降の方向性が明確',
  perspectives: {
    othersFeeling: '成長を感じてもらえる',
    othersVisible: 'プレゼンや報告で成果を共有',
    selfFeeling: 'やりきった充実感',
    selfVisible: ''
  },
  patterns: {
    success: { rei: '周囲に感謝を伝える', shin: '一つに集中', gi: '', tai: '体調管理', sei: '環境整備' },
    failure: { rei: '', shin: 'マルチタスク', gi: '計画の甘さ', tai: '無理しすぎ', sei: '' }
  },
  routines: [
    { id: 1, category: 'rei', name: '感謝3行日記', priority: 1, condition: '就寝前', minimumAction: '1行', troubleAnticipation: '' },
    { id: 2, category: 'rei', name: 'ありがとうを伝える', priority: 2, condition: '日中', minimumAction: '1回', troubleAnticipation: '' },
    { id: 3, category: 'shin', name: '集中タイム2h', priority: 3, condition: '午前', minimumAction: '1h', troubleAnticipation: '割り込み' },
    { id: 4, category: 'shin', name: '学習30分', priority: 4, condition: '夜', minimumAction: '15分', troubleAnticipation: '' },
    { id: 5, category: 'gi', name: '今日のTop3設定', priority: 5, condition: '朝', minimumAction: 'Top1だけでも', troubleAnticipation: '' },
    { id: 6, category: 'gi', name: '', priority: 6 },
    { id: 7, category: 'tai', name: '運動30分', priority: 7, condition: '朝 or 夕', minimumAction: '15分ウォーク', troubleAnticipation: '花粉症' },
    { id: 8, category: 'tai', name: 'ストレッチ', priority: 8, condition: '寝る前', minimumAction: '5分', troubleAnticipation: '' },
    { id: 9, category: 'sei', name: '週末掃除', priority: 9, condition: '土曜午前', minimumAction: '水回りだけ', troubleAnticipation: '' },
    { id: 10, category: 'sei', name: '', priority: 10 }
  ],
  coreActions: {
    deadline: 'Q1成果レポート提出',
    processing: '未処理チケットをゼロに',
    habit: '水2L + 野菜多め',
    other: 'Q2計画ドラフト作成'
  },
  schedulePatterns: [
    {
      id: 3001, name: '通常日', priority: 2,
      condition: { type: 'weekdays', days: [1, 2, 3, 4, 5] },
      schedule: [
        { startHour: 6, startMinute: 30, activity: '起床・運動', color: '#4CAF50' },
        { startHour: 8, startMinute: 0, activity: '朝食・準備', color: '#FF9800' },
        { startHour: 9, startMinute: 0, activity: '集中タイム', color: '#2196F3' },
        { startHour: 12, startMinute: 0, activity: '昼食', color: '#FF9800' },
        { startHour: 13, startMinute: 0, activity: '午後作業', color: '#2196F3' },
        { startHour: 17, startMinute: 30, activity: '終業・振り返り', color: '#9C27B0' },
        { startHour: 19, startMinute: 0, activity: '夕食・学習', color: '#FF9800' },
        { startHour: 22, startMinute: 30, activity: 'ストレッチ・就寝準備', color: '#4CAF50' }
      ]
    },
    {
      id: 3002, name: '週末', priority: 2,
      condition: { type: 'weekdays', days: [0, 6] },
      schedule: [
        { startHour: 8, startMinute: 0, activity: '起床', color: '#4CAF50' },
        { startHour: 9, startMinute: 0, activity: '掃除（土曜）/ 自由（日曜）', color: '#FF9800' },
        { startHour: 11, startMinute: 0, activity: '外出・買い物', color: '#E91E63' },
        { startHour: 18, startMinute: 0, activity: '夕食・リラックス', color: '#9C27B0' }
      ]
    }
  ],
  reward: {
    selfFeeling: '1Qやりきった達成感',
    selfVisible: 'レポート完成',
    othersFeeling: '信頼される人',
    othersVisible: ''
  },
  support: { supporter: 'チームメンバー', content: '相互フィードバック' }
});

// タスクデータ（カレンダー表示テスト用）
const TEST_TASKS = [
  { title: 'Q1レポート提出', type: 'urgent', status: 'todo', deadline: '2026-03-15', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { title: 'チーム1on1', type: 'calendar', status: 'todo', dateTime: '2026-03-10T14:00', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { title: 'プレゼン準備', type: 'action', status: 'todo', deadline: '2026-03-20', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { title: '歯医者予約', type: 'calendar', status: 'todo', dateTime: '2026-03-12T10:30', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z' },
  { title: '完了済みタスク', type: 'action', status: 'done', deadline: '2026-03-05', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z' },
  { title: '確定申告', type: 'urgent', status: 'todo', deadline: '2026-03-16', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { title: '2月タスク残り', type: 'action', status: 'todo', deadline: '2026-02-20', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { title: '1月会議メモ整理', type: 'action', status: 'todo', deadline: '2026-01-25', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' }
];

// 日誌データ（1月・2月に数日分。3月はテストで「反映」機能を使う）
function buildJournal(date, routines, coreActions, extra = {}) {
  const [y, m] = date.split('-');
  return {
    date,
    month: `${y}-${m}`,
    title: extra.title || '',
    score: extra.score || 0,
    scores: extra.scores || {},
    resolution: extra.resolution || '',
    tomorrowResolution: '',
    reflections: extra.reflections || { reflection: '', effort: '', contribution: '', gratitude: '', free: '' },
    schedule: extra.schedule || [],
    routines,
    coreActions,
    supplement: extra.supplement || {},
    memo: extra.memo || ''
  };
}

function buildJanJournalRoutines(statuses) {
  // statuses: array of 'done'|'partial'|'none' for each of 9 named routines
  const names = ['朝の感謝3つ','夜の振り返り','ポモドーロ2セット','読書30分','タスク整理','週次レビュー','朝散歩15分','ストレッチ','5分片付け'];
  const cats = ['rei','rei','shin','shin','gi','gi','tai','tai','sei'];
  const result = names.map((name, i) => ({
    id: i + 1, category: cats[i], name, priority: i + 1,
    done: statuses[i] === 'done', status: statuses[i] || 'none'
  }));
  result.push({ id: 10, category: 'sei', name: '', priority: 10, done: false, status: 'none' });
  return result;
}

function buildFebJournalRoutines(statuses) {
  const names = ['感謝ジャーナル','他者への声掛け','ディープワーク90分','技術記事を読む','朝のタスク優先順位付け','日次振り返り','ジョギング20分'];
  const cats = ['rei','rei','shin','shin','gi','gi','tai'];
  const result = names.map((name, i) => ({
    id: i + 1, category: cats[i], name, priority: i + 1,
    done: statuses[i] === 'done', status: statuses[i] || 'none'
  }));
  // 空枠を埋める
  result.push({ id: 8, category: 'tai', name: '', priority: 8, done: false, status: 'none' });
  result.push({ id: 9, category: 'sei', name: 'デスク整理', priority: 9, done: statuses[7] === 'done', status: statuses[7] || 'none' });
  result.push({ id: 10, category: 'sei', name: '', priority: 10, done: false, status: 'none' });
  return result;
}

function buildJournalCoreActions(mg, doneMap = {}) {
  return {
    deadline: { name: mg.deadline || '', done: !!doneMap.deadline },
    processing: { name: mg.processing || '', done: !!doneMap.processing },
    habit: { name: mg.habit || '', done: !!doneMap.habit },
    other: { name: mg.other || '', done: !!doneMap.other }
  };
}

const JAN_JOURNALS = [
  buildJournal('2026-01-05',
    buildJanJournalRoutines(['done','done','done','partial','done','none','done','done','done']),
    buildJournalCoreActions(JAN_GOAL.coreActions, { deadline: false, processing: true, habit: true, other: false }),
    { resolution: '今日も一日精一杯!', score: 4, reflections: { effort: '午前中に集中できた', gratitude: '天気が良かった', reflection: '', contribution: '', free: '' } }
  ),
  buildJournal('2026-01-06',
    buildJanJournalRoutines(['done','done','partial','done','done','done','none','done','done']),
    buildJournalCoreActions(JAN_GOAL.coreActions, { deadline: false, processing: false, habit: true, other: false }),
    { resolution: '読書を多めに' }
  ),
  buildJournal('2026-01-12',
    buildJanJournalRoutines(['done','done','done','done','done','none','done','done','partial']),
    buildJournalCoreActions(JAN_GOAL.coreActions, { deadline: true, processing: true, habit: true, other: false }),
    { resolution: '週末だけど頑張る', score: 3 }
  ),
  buildJournal('2026-01-15',
    buildJanJournalRoutines(['done','partial','done','none','done','none','done','done','done']),
    buildJournalCoreActions(JAN_GOAL.coreActions, { deadline: false, processing: true, habit: false, other: true }),
    { resolution: '午後からミーティング' }
  ),
  buildJournal('2026-01-20',
    buildJanJournalRoutines(['done','done','done','done','partial','none','done','partial','done']),
    buildJournalCoreActions(JAN_GOAL.coreActions, { deadline: true, processing: true, habit: true, other: true }),
    { resolution: '最終週に向けて加速', score: 5 }
  )
];

const FEB_JOURNALS = [
  buildJournal('2026-02-02',
    buildFebJournalRoutines(['done','done','done','partial','done','done','done','done']),
    buildJournalCoreActions(FEB_GOAL.coreActions, { deadline: false, processing: true, habit: true, other: false }),
    { resolution: '2月スタート!' }
  ),
  buildJournal('2026-02-10',
    buildFebJournalRoutines(['done','partial','done','done','done','done','partial','done']),
    buildJournalCoreActions(FEB_GOAL.coreActions, { deadline: false, processing: false, habit: true, other: false }),
    { resolution: '中間レビュー準備' }
  ),
  buildJournal('2026-02-18',
    buildFebJournalRoutines(['done','done','done','done','done','partial','done','done']),
    buildJournalCoreActions(FEB_GOAL.coreActions, { deadline: true, processing: true, habit: true, other: false }),
    { resolution: '後半戦', score: 4 }
  ),
  buildJournal('2026-02-25',
    buildFebJournalRoutines(['done','done','partial','done','partial','done','done','partial']),
    buildJournalCoreActions(FEB_GOAL.coreActions, { deadline: false, processing: true, habit: false, other: true }),
    { resolution: '2月ラストスパート' }
  )
];

// === データ投入ヘルパー ===
async function injectTestData(page) {
  await page.evaluate(({ jan, feb, mar, janJ, febJ, tasks }) => {
    return new Promise((resolve, reject) => {
      const dbReq = indexedDB.open('MatsumuraMethodDB');
      dbReq.onsuccess = () => {
        const db = dbReq.result;
        const tx = db.transaction(['monthlyGoals', 'journals', 'tasks'], 'readwrite');
        const mgStore = tx.objectStore('monthlyGoals');
        const jStore = tx.objectStore('journals');
        const tStore = tx.objectStore('tasks');

        // 月次目標投入
        mgStore.put(jan);
        mgStore.put(feb);
        mgStore.put(mar);

        // 日誌投入
        for (const j of janJ) jStore.put(j);
        for (const j of febJ) jStore.put(j);

        // タスク投入
        for (const t of tasks) tStore.put(t);

        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      };
      dbReq.onerror = () => reject(dbReq.error);
    });
  }, { jan: JAN_GOAL, feb: FEB_GOAL, mar: MAR_GOAL, janJ: JAN_JOURNALS, febJ: FEB_JOURNALS, tasks: TEST_TASKS });
}

// === ヘルパー ===
async function screenshot(page, name) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
}

async function screenshotFull(page, name) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
}

async function waitForApp(page) {
  // ローディング画面が消えてアプリが表示されるまで待機
  await page.waitForSelector('.loading-screen.hide', { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function enableDarkMode(page) {
  await page.evaluate(() => {
    document.body.classList.add('dark-mode');
  });
  await page.waitForTimeout(300);
}

async function disableDarkMode(page) {
  await page.evaluate(() => {
    document.body.classList.remove('dark-mode');
  });
  await page.waitForTimeout(300);
}

// === テスト ===

test.describe('v355 カレンダー機能強化 QA', () => {

  test.beforeEach(async ({ page }) => {
    // アプリ読み込み
    await page.goto('/');
    await waitForApp(page);
    // テストデータ投入
    await injectTestData(page);
    // リロードしてデータ反映
    await page.reload();
    await waitForApp(page);
  });

  test('01: ホーム画面表示確認', async ({ page }) => {
    await screenshot(page, '01_home_light');
    await enableDarkMode(page);
    await screenshot(page, '01_home_dark');
  });

  test('02: 3月の月次目標ページ表示', async ({ page }) => {
    // 月次目標ページへ移動
    await page.click('.home-monthly-banner');
    await page.waitForTimeout(500);
    await screenshot(page, '02_monthly_top_light');

    // スクロールしてルーティンセクション確認
    await page.evaluate(() => {
      const el = document.querySelector('.reflect-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);
    await screenshot(page, '02_monthly_routine_section');

    // 「過去の月からコピー」ボタン確認
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const copyBtn = page.locator('.copy-month-btn');
    await expect(copyBtn).toBeVisible();
    await screenshot(page, '02_monthly_copy_btn');

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '02_monthly_top_dark');
  });

  test('03: 「過去の月からコピー」モーダル', async ({ page }) => {
    await page.click('.home-monthly-banner');
    await page.waitForTimeout(500);

    // コピーモーダルを開く
    await page.click('.copy-month-btn');
    await page.waitForTimeout(500);

    // モーダルが表示されたか
    const modal = page.locator('.copy-month-modal');
    await expect(modal).toBeVisible();
    await screenshot(page, '03_copy_modal_light');

    // 1月と2月が表示されているか（データがある月のみ、新しい順）
    const items = page.locator('.copy-month-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // 最初の項目が2月（新しい順）
    const firstLabel = await items.first().locator('.copy-month-label').textContent();
    expect(firstLabel).toContain('2月');

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '03_copy_modal_dark');

    // キャンセル
    await page.click('.modal-cancel-btn');
    await page.waitForTimeout(300);
    await expect(modal).not.toBeVisible();
  });

  test('04: 過去月コピー実行（2月→3月）', async ({ page }) => {
    await page.click('.home-monthly-banner');
    await page.waitForTimeout(500);

    // 3月のルーティン数を確認（コピー前）
    const beforeRoutines = await page.evaluate(() => {
      return (app.data.monthlyGoal.routines || []).filter(r => r.name).length;
    });

    // コピーモーダルを開き、2月を選択
    await page.click('.copy-month-btn');
    await page.waitForTimeout(500);

    // 2月をクリック
    await page.click('.copy-month-item:first-child');
    await page.waitForTimeout(500);

    // 確認モーダル
    const confirmModal = page.locator('.copy-month-modal');
    await expect(confirmModal).toBeVisible();
    await screenshot(page, '04_copy_confirm');

    // コピー実行
    await page.click('text=コピーする');
    await page.waitForTimeout(1000);

    // Toast確認
    await screenshot(page, '04_copy_done');

    // ルーティンが2月のデータに変わったか
    const afterRoutines = await page.evaluate(() => {
      const mg = app.data.monthlyGoal;
      return {
        routineNames: (mg.routines || []).filter(r => r.name).map(r => r.name),
        patternCount: (mg.schedulePatterns || []).length,
        coreDeadline: mg.coreActions?.deadline || ''
      };
    });
    expect(afterRoutines.routineNames).toContain('感謝ジャーナル');
    expect(afterRoutines.routineNames).toContain('ディープワーク90分');
    expect(afterRoutines.patternCount).toBe(3); // 出社日・テレワーク日・休日
    expect(afterRoutines.coreDeadline).toBe('プロジェクトAlpha中間レビュー');

    await screenshot(page, '04_after_copy_page');
  });

  test('05: 「カレンダーに反映」モーダル', async ({ page }) => {
    // まず3月に日誌データを作る（反映のテスト用）
    await page.evaluate(() => {
      // 3月の日誌を数件作成
      const dates = ['2026-03-02', '2026-03-05', '2026-03-09', '2026-03-10', '2026-03-14'];
      const promises = dates.map(async (d) => {
        const j = await getJournal(d);
        j.resolution = 'テスト日誌';
        await saveJournal(j);
      });
      return Promise.all(promises);
    });

    // ルーティンセクション（pageIndex=4）へ直接移動
    await page.evaluate(() => app.navigate('monthly-4'));
    await page.waitForTimeout(800);

    // 反映ボタンまでスクロール
    await page.evaluate(() => {
      const el = document.querySelector('.reflect-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);

    // 反映ボタンをクリック
    await page.click('.reflect-btn');
    await page.waitForTimeout(500);

    // モーダル確認
    const modal = page.locator('.reflect-modal');
    await expect(modal).toBeVisible();
    await screenshot(page, '05_reflect_modal_light');

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '05_reflect_modal_dark');
    await disableDarkMode(page);

    // 「追加」モードで実行（モーダル内のボタンを指定）
    await page.click('.reflect-option-btn:not(.reflect-option-danger)');
    await page.waitForTimeout(1000);
    await screenshot(page, '05_reflect_done');

    // 日誌にルーティンが反映されたか確認
    const result = await page.evaluate(async () => {
      const j = await getJournal('2026-03-05');
      return {
        hasRoutines: (j.routines || []).filter(r => r.name).length > 0,
        hasCoreActions: !!(j.coreActions?.deadline?.name)
      };
    });
    expect(result.hasRoutines).toBe(true);
    expect(result.hasCoreActions).toBe(true);
  });

  test('06: 「カレンダーに反映」リセットモード', async ({ page }) => {
    // 先に日誌を作って、ルーティンにdone状態をセット
    await page.evaluate(async () => {
      const j = await getJournal('2026-03-02');
      j.resolution = 'テスト';
      j.routines = (app.data.monthlyGoal.routines || []).map(r => ({
        ...r, done: true, status: 'done'
      }));
      await saveJournal(j);
    });

    // ルーティンセクション（pageIndex=4）へ直接移動
    await page.evaluate(() => app.navigate('monthly-4'));
    await page.waitForTimeout(800);

    // 反映ボタンまでスクロール
    await page.evaluate(() => {
      const el = document.querySelector('.reflect-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(300);

    // 反映モーダル→リセットモード
    await page.click('.reflect-btn');
    await page.waitForTimeout(500);
    await page.click('text=リセットして反映');
    await page.waitForTimeout(500);

    // 2段階確認モーダル
    const confirmModal = page.locator('.reflect-modal');
    await expect(confirmModal).toBeVisible();
    await screenshot(page, '06_reflect_reset_confirm');

    // 確認して実行
    await page.click('.modal-btn-danger');
    await page.waitForTimeout(1000);

    // ルーティンがリセットされたか
    const status = await page.evaluate(async () => {
      const j = await getJournal('2026-03-02');
      const routines = j.routines || [];
      return routines.filter(r => r.name).every(r => r.status === 'none' && !r.done);
    });
    expect(status).toBe(true);
    await screenshot(page, '06_reflect_reset_done');
  });

  test('07: カレンダーページ表示（3月）', async ({ page }) => {
    // まず反映を実行してからカレンダーを見る
    await page.evaluate(async () => {
      // 3月日誌を複数作成
      const dates = [];
      for (let d = 1; d <= 15; d++) {
        dates.push(`2026-03-${String(d).padStart(2, '0')}`);
      }
      for (const date of dates) {
        const j = await getJournal(date);
        j.resolution = `${date}の日誌`;
        // ルーティンを同期
        app.syncMonthlyToSpecificJournal(j, app.data.monthlyGoal, 'add');
        await saveJournal(j);
      }
      // いくつかのルーティンにdone/partialを設定
      const doneMap = { '2026-03-02': [0,1,2,3], '2026-03-05': [0,1,4,6], '2026-03-09': [0,2,3,5,7], '2026-03-10': [1,3,5] };
      const partialMap = { '2026-03-02': [4], '2026-03-05': [2,3], '2026-03-09': [1], '2026-03-10': [0,2,4,6] };
      for (const [date, indices] of Object.entries(doneMap)) {
        const j = await getJournal(date);
        for (const i of indices) {
          if (j.routines[i]) { j.routines[i].done = true; j.routines[i].status = 'done'; }
        }
        for (const i of (partialMap[date] || [])) {
          if (j.routines[i]) { j.routines[i].done = false; j.routines[i].status = 'partial'; }
        }
        await saveJournal(j);
      }
    });

    // カレンダーページへ
    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);
    await screenshot(page, '07_calendar_march_light');

    // パターンインジケーターが表示されているか
    const patternIndicators = page.locator('.cal-day-pattern');
    const patternCount = await patternIndicators.count();
    expect(patternCount).toBeGreaterThan(0);

    // タスクバッジが表示されているか（3/10, 3/12, 3/15, 3/16, 3/20にタスクあり）
    const taskBadges = page.locator('.cal-day-task');
    const taskBadgeCount = await taskBadges.count();
    expect(taskBadgeCount).toBeGreaterThan(0);

    // カテゴリドットが表示されているか
    const catDots = page.locator('.rv-cat-dots');
    const dotCount = await catDots.count();
    expect(dotCount).toBeGreaterThan(0);

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '07_calendar_march_dark');
  });

  test('08: カレンダー日付クリック→詳細パネル', async ({ page }) => {
    // データ準備（テスト07と同様）
    await page.evaluate(async () => {
      const j = await getJournal('2026-03-10');
      j.resolution = '充実した1日にする';
      app.syncMonthlyToSpecificJournal(j, app.data.monthlyGoal, 'add');
      j.routines[0].done = true; j.routines[0].status = 'done';
      j.routines[1].done = false; j.routines[1].status = 'partial';
      j.routines[2].done = true; j.routines[2].status = 'done';
      j.coreActions.deadline.done = true;
      await saveJournal(j);
    });

    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);

    // 3月10日をクリック
    await page.click('.calendar-day:has-text("10"):not(.header)');
    await page.waitForTimeout(800);

    // 詳細パネルが表示されたか
    const panel = page.locator('#rv-day-summary.active');
    await expect(panel).toBeVisible();
    await screenshot(page, '08_day_detail_light');

    // タイムラインが表示されているか（3/10は火曜=テレワーク日 or 通常日）
    const timeline = page.locator('.cal-timeline-item');
    const timelineCount = await timeline.count();
    expect(timelineCount).toBeGreaterThan(0);

    // ルーティン表示
    const routineItems = page.locator('.cal-routine-item');
    expect(await routineItems.count()).toBeGreaterThan(0);

    // ○△×の表示確認
    const doneItems = page.locator('.cal-r-done');
    const partialItems = page.locator('.cal-r-partial');
    expect(await doneItems.count()).toBeGreaterThan(0);
    expect(await partialItems.count()).toBeGreaterThan(0);

    // コアアクション表示
    const coreItems = page.locator('.cal-core-item');
    expect(await coreItems.count()).toBeGreaterThan(0);

    // タスク表示（3/10にはチーム1on1がある）
    const taskItems = page.locator('.cal-task-item');
    expect(await taskItems.count()).toBeGreaterThan(0);

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '08_day_detail_dark');
  });

  test('09: ルーティン○△×トグル', async ({ page }) => {
    // データ準備（resetモードで全ステータスをnoneに）
    await page.evaluate(async () => {
      const j = await getJournal('2026-03-10');
      j.resolution = 'トグルテスト';
      app.syncMonthlyToSpecificJournal(j, app.data.monthlyGoal, 'reset');
      await saveJournal(j);
    });

    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);

    // 3月10日をクリック
    await page.click('.calendar-day:has-text("10"):not(.header)');
    await page.waitForTimeout(800);

    // 最初のルーティンの初期状態を取得（×のはず）
    const firstRoutine = page.locator('.cal-routine-item').first();
    const initialText = await firstRoutine.textContent();
    await screenshot(page, '09_toggle_initial');
    expect(initialText).toContain('×'); // resetモードなのでnone

    // クリックして done(○) に
    await firstRoutine.click();
    await page.waitForTimeout(800);
    await screenshot(page, '09_toggle_to_done');

    // ○に変わったか
    const afterText1 = await page.locator('.cal-routine-item').first().textContent();
    expect(afterText1).toContain('○');

    // もう1回クリックして partial(△) に
    await page.locator('.cal-routine-item').first().click();
    await page.waitForTimeout(800);
    const afterText2 = await page.locator('.cal-routine-item').first().textContent();
    expect(afterText2).toContain('△');
    await screenshot(page, '09_toggle_to_partial');

    // もう1回クリックして none(×) に戻る
    await page.locator('.cal-routine-item').first().click();
    await page.waitForTimeout(800);
    const afterText3 = await page.locator('.cal-routine-item').first().textContent();
    expect(afterText3).toContain('×');
    await screenshot(page, '09_toggle_to_none');

    // DB上でもステータスが変わっているか
    const dbStatus = await page.evaluate(async () => {
      const j = await getJournal('2026-03-10');
      return j.routines[0]?.status;
    });
    expect(dbStatus).toBe('none');
  });

  test('10: 月切替（1月・2月表示）', async ({ page }) => {
    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);

    // 左矢印で2月へ
    await page.click('.rv-cal-arrow:first-child');
    await page.waitForTimeout(1000);
    await screenshot(page, '10_calendar_feb');

    // 2月のパターンインジケーター確認
    const febPatterns = page.locator('.cal-day-pattern');
    expect(await febPatterns.count()).toBeGreaterThan(0);

    // 2月の日付をクリック
    await page.click('.calendar-day:has-text("10"):not(.header)');
    await page.waitForTimeout(800);
    await screenshot(page, '10_feb_day_detail');

    // さらに左矢印で1月へ
    await page.click('.rv-cal-arrow:first-child');
    await page.waitForTimeout(1000);
    await screenshot(page, '10_calendar_jan');

    // 1月の日付クリック
    await page.click('.calendar-day:has-text("5"):not(.header)');
    await page.waitForTimeout(800);
    await screenshot(page, '10_jan_day_detail');

    // 1月の詳細にスケジュール（平日/休日パターン）が表示されるか
    const janTimeline = page.locator('.cal-timeline-item');
    expect(await janTimeline.count()).toBeGreaterThan(0);

    // ダークモード
    await enableDarkMode(page);
    await screenshot(page, '10_jan_dark');
  });

  test('11: 未来日のテンプレート表示', async ({ page }) => {
    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);

    // 3月の未来日（例: 25日）をクリック
    await page.click('.calendar-day:has-text("25"):not(.header)');
    await page.waitForTimeout(800);

    // テンプレートバッジが表示されているか
    const badge = page.locator('.cal-template-badge');
    await expect(badge).toBeVisible();
    await screenshot(page, '11_future_template');

    // トグルが無効（cursor:default, opacity:0.6）
    const routineItem = page.locator('.cal-routine-item').first();
    const style = await routineItem.getAttribute('style');
    expect(style).toContain('opacity:0.6');
  });

  test('12: CSSタッチターゲット確認', async ({ page }) => {
    await page.click('.home-monthly-banner');
    await page.waitForTimeout(500);

    // 反映ボタンのサイズ
    const reflectBtn = page.locator('.reflect-btn');
    if (await reflectBtn.isVisible()) {
      const box = await reflectBtn.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // コピーボタンのサイズ
    const copyBtn = page.locator('.copy-month-btn');
    const copyBox = await copyBtn.boundingBox();
    expect(copyBox.height).toBeGreaterThanOrEqual(44);

    // コピーモーダルのアイテムサイズ
    await page.click('.copy-month-btn');
    await page.waitForTimeout(500);
    const modalItem = page.locator('.copy-month-item').first();
    if (await modalItem.isVisible()) {
      const itemBox = await modalItem.boundingBox();
      expect(itemBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('13: 全画面スクショ（ライト+ダーク）', async ({ page }) => {
    // ホーム
    await screenshot(page, '13_full_home_light');
    await enableDarkMode(page);
    await screenshot(page, '13_full_home_dark');
    await disableDarkMode(page);

    // 月次目標
    await page.click('.home-monthly-banner');
    await page.waitForTimeout(500);
    await screenshotFull(page, '13_full_monthly_light');
    await enableDarkMode(page);
    await screenshotFull(page, '13_full_monthly_dark');
    await disableDarkMode(page);

    // カレンダー
    await page.evaluate(() => app.showProgress());
    await page.waitForTimeout(1000);
    await screenshot(page, '13_full_calendar_light');
    await enableDarkMode(page);
    await screenshot(page, '13_full_calendar_dark');
  });
});
