/* ========================================
   MM v1.1.0 - メインアプリケーション
   アップデート版：スワイプナビ・アニメーション対応
   ======================================== */

const APP_VERSION = 405;
const APP_UPDATE_LOG = `■ v405 更新内容
・長期目標に「この目標を持つ理由」フィールドを追加
  - メイン/サブ/独立すべてに対応
  - Notion同期にも理由を出力
・ホームに長期目標バー追加（月目標バーとセット表示）
・目標一覧: メイン長期目標のみ表示（ページネーション廃止）
・長期目標一覧: メインブロック内に「+サブ追加」ボタン
・PWA自動更新: 新バージョン検出時に自動リロード`;

// フィールドヘルプテキスト（ガイド準拠）
const _FBOX_HELP = 'F・BOX（未処理箱）\n頭に浮かんだことを全てここに入れる。\nとにかく頭の中を空にする。';
const FIELD_HELP = {
  // タスク種別
  'task-urgent': 'すぐやるリスト\n2分以内にできるが今この場ではできない行動。\n手が空いたら最優先で実行する。',
  'task-action': 'アクションリスト\n日時未定の次にやるべき行動。時間ができた時に実行する。\n先延ばししそうなものには動機付けを書いてよい（任意）。',
  'task-project': 'プロジェクト\n複数の行動が必要なもの。\n①プロジェクト名を登録\n②「何をもって完了とするか」を1文で書く\n③中のタスクを具体的な行動に分解する\n④分解した各タスクをフローに再度流す',
  'task-waiting': '待機リスト\n他者のアクション待ち。誰に・何を・いつまでにを記録して経過を追う。\n返事が来たら、その内容をF・BOXに入れて再フローする。',
  'task-calendar': 'カレンダー\n日時が決まっているもの。その日に実行する。',
  'task-wish': 'いつかやりたいリスト\n今は動かないが忘れたくないもの。アイデア、願望、興味、全部ここ。\n月次で見返し、行動に変わったものはフローに流す。',
  // タスクフィールド
  'task-condition': '完了条件\n「何をもって完了とするか」を1文で書く。\n例：「引越し」→「新居に全荷物が入り、旧居を引き渡した時点で完了」\n分解しないプロジェクトは永遠に動かない。',
  'task-motivation': '動機付け（任意）\n先延ばし防止用。やった時に得られるもの／やらなかった時に失うもの。\n先延ばししがちなプロジェクトやアクションに書く。',
  'task-who': '誰に\n待っている相手の名前。\n1週間以上返事がないものはリマインドするか別手段を検討。',
  'task-deadline': 'いつまでに\n返事や結果を待つ期限。',
  // ルーティン種別
  'routine-goal': '目標ルーティン\n月次目標達成に直結する変数ルーティン。月次で入れ替わる。\n動機付け必須。霊・心・技・体・生活の5領域×最低2個＝最低10個。\n優先順位をつけ、時間が足りない日の判断を機械的にする。',
  'routine-obligation': '義務ルーティン\n社会人として必ず行うべきもの。手続き、支払い系。定数。\nやらないと罰則や損害があるもの。',
  'routine-maintenance': '維持ルーティン\nやらないとQOLが低下するもの。病院、美容室など。定数。',
  'routine-principle': '指針ルーティン\n一生ブレない軸。生き方の原則、信仰面の習慣、ポモドーロ法など。定数。\n月次見直し対象外。',
  'routine-candidate': '候補ルーティン\nまだわからない／来月以降の検討枠。\n3ヶ月候補のまま動かないものは削除を検討する。',
  // 5コア
  'core-motivation': '①動機付け ★最重要★\nやった時・成功時に得られるもの。やらなかった時・失敗時に失うもの。\n感情を揺さぶることで行動につなげる。\n\n動機の源6個：\n・快楽を得たい ・苦痛を避けたい\n・希望を持ちたい ・恐怖を避けたい\n・人に認められたい ・人に拒絶されたくない',
  'core-trigger': '②条件反射\nそのルーティンを行うタイミング。\n「〇〇（条件）のとき〇〇（ルーティン）を行う」の形で書く。',
  'core-manual': '③マニュアル\nそのルーティン中の具体的な動き、必要な道具、コスト、時間。\nそれを読めば誰でもいきなり遂行できるレベルで作り上げる。\n必要であれば禁止事項、トラブル時想定も入れる。',
  'core-preparation': '④前準備\n特定のルーティンは、特定のリミットまでに特定の行動をする。\n例：20時に風呂入るなら、19時までに仕事を終わらせる。',
  'core-minimum': '⑤最低限設定\n普段は筋トレ60分→忙しくても最低20分。\n朝の掃除を夜に置き換える、など。\nそのルーティンの大事なことを抜粋して行う。',
  // スコープ
  'scope': '区分\n個人＝プライベートな事柄\n社会＝仕事・社会的な事柄',
  // 時間
  'time-range': '実施時間\nそのタスク／ルーティンを行う時間帯。任意。',
  // タブヘルプ（GTDメインタブ）
  'tab-fbox': _FBOX_HELP,
  'tab-firstbox': _FBOX_HELP,
  'tab-task': 'タスク\n振り分け済みのタスク一覧。\nすぐやる・アクション・プロジェクト・待機・カレンダー・いつかに分類。',
  'tab-routine': 'ルーティン\n定期的に繰り返す行動。\n目標・義務・維持・指針・候補の5分類。',
  'tab-material': '資料\n行動不要だが情報として残すもの。',
  // ノートビュー ステータスヘルプ
  'nv-open': '未着手\nまだ手をつけていないタスク。',
  'nv-done': '完了\n終わったタスク。',
  // 日誌ページ
  'journal-resolution': '今日の意気込み\n今日1日をどう過ごすかの宣言。\n昨日「明日の意気込み」を書いていれば自動反映される。',
  'journal-score': '今日の点数\n以下の視点で1日を評価する。\n・明日死んでも後悔のない、全力で、自由な1日だったか\n・感謝・感動に溢れた1日だったか\n・霊主の視点で考えられたか',
  'journal-reflection': '今日の反省\n以下の視点で振り返る。\n・慢心と盲信はなかったか\n・人を裁かず、赦し、敬えたか',
  'journal-effort': '今日の努力・成果\n以下の視点で振り返る。\n・真善美を大切にできたか\n・責任を持てたか',
  'journal-contribution': '世の為人の為にしたこと\n以下の視点で振り返る。\n・感謝と尊敬を持てたか\n・神様・ご先祖様・世の中の人の為に生きたか',
  'journal-gratitude': '印象的・気付き・感謝\n今日印象に残ったこと、新しい気づき、感謝したいことを書く。',
  'journal-free': '自由記入\nどのカテゴリにも当てはまらないメモ。\n思いついたことを自由に書く。',
  'journal-tomorrow': '明日の意気込み\n明日をどう過ごすかの宣言。\n翌日の日誌を開いた時「今日の意気込み」に自動反映される。',
  'journal-routines': '本日のルーティン\n月次目標で設定したルーティンの今日分。\n完了したらチェックを入れる。展開すると条件反射・最低限・トラブル想定が見える。',
  // 月次目標ページ
  'monthly-goal': '今月の目標\n長期目標から逆算された「今月達成すること」を明確にする。\n具体的・測定可能な目標を1つ書く。',
  'monthly-patterns': 'パターン分析\n自分の成功パターンと失敗パターンを分析する。\nうまくいく時の共通点、失敗する時の共通点を言語化する。',
  // monthly-problems, monthly-solutions: UIセクション未実装のため定義保留
  'monthly-breakdown': 'ブレイクダウン\n今月の目標を10個の要因に分解し、各要因に対する行動を最大7個設定する。\n\n【要因のルール】\n・霊・心・技・体・生活から最低1つずつ入れる\n\n【行動のルール】\n・測定可能であること（数値・頻度が明確）\n・自分がコントロール可能であること\n・毎日または定期的に実行可能であること',
  'monthly-reward': '報酬\n目標達成時の報酬を4つの観点（他人×気持ち/見えるもの、自分×気持ち/見えるもの）で書く。',
  // monthly-support, monthly-schedule, monthly-eval: UIセクション未実装のため定義保留
  // 長期目標
  // longterm-goal: PAGE_GUIDEでカバー済みのため定義保留
  'longterm-reason': 'この目標の理由\nなぜこの目標を達成したいのか。\n理由が明確なほど行動が続く。迷った時に立ち返る原点になる。',
  'longterm-milestone': 'マイルストーン\n長期目標の中間地点。\n「いつまでに何を達成するか」を具体的に書く。',
  // 人生設計
  'life-purpose': '人生の目的\n自分が何のために生きるのか。最も大切にしていること。',
  'life-meaning': '人生の意味\n自分にとっての人生の意味、使命感。',
  'life-age-goals': '年齢別目標\n各年齢で達成したいことを書く。\n長期目標の土台になる。',
  // ホーム
  'home-schedule': '今日の予定\n今日の予定一覧。タップで詳細を確認できる。',
  'home-routine': 'ルーティン\n今日のルーティン達成状況。タップでチェック。\n✓=完了（100%） △=一部達成（50%） 空=未着手（0%）',
  'home-core-actions': '期日目標\n月次目標で設定した、繰り返さない一回きりの行動。',
};

// 定期見直しチェックリスト
const REVIEW_CHECKLIST = {
  daily: {
    label: '毎日',
    items: [
      'F・BOXの中身を全て処理する',
      'アクションリストから今日やることを選ぶ',
      'カレンダーの今日の予定を確認する'
    ]
  },
  weekly: {
    label: '週次',
    items: [
      '義務ルーティン全件確認',
      '維持ルーティン全件確認',
      '待機リスト全件確認',
      'プロジェクトリスト全件確認',
      '来週対応分を今日やる事に落とす'
    ]
  },
  monthly: {
    label: '月次',
    items: [
      'いつかやりたいリストを見返す',
      '資料保管を見返す',
      '候補ルーティン全件確認',
      'ルーティン月次振り返り'
    ]
  }
};

// ページガイドテキスト（月次目標タブ用）
const PAGE_GUIDE = {
  'monthly-0': { step: 'STEP 1+3', title: '目標', body: '今月達成する目標と、達成した時のイメージ・報酬を書く。\n長期目標から逆算された「今月分」を明確にする。' },
  'monthly-1': { step: 'STEP 4', title: 'パターン分析', body: '自分の成功パターンと失敗パターンを分析する。\n\nうまくいく時の共通点、失敗する時の共通点を言語化し、対策を立てる。' },
  'monthly-2': { step: 'STEP 2', title: 'ブレイクダウン', body: '今月の目標を要因に分解し、各要因に対する具体的な行動を洗い出す。\n\nマンダラチャートのように構造化する。' },
  'monthly-3': { step: 'STEP 5', title: 'ルーティン', body: '目標達成のために毎日繰り返す行動。\n\n5カテゴリに分類：\n・目標（変数・月ごとに入れ替え）\n・義務（定数）\n・維持（定数）\n・指針（定数）\n・候補（定数）' },
  'monthly-4': { step: 'STEP 5', title: '期日目標', body: '繰り返さない一回きりの行動。\n\n期日のある目標と、処理すべき事項を記録する。' },
  'monthly-5': { step: 'STEP 6', title: '基本スケジュール', body: '理想の1日の流れを描く。\n\n厳守ではなく参考用。\n曜日や条件ごとに複数パターンを設定できる。' },
  'monthly-6': { step: '月次振り返り', title: '月末評価', body: '4次元で5段階評価し、総合判断を行う。\n\n①達成率\n②効果・実績\n③費用対効果\n④成長期待予測\n\n判断：継続／強化／改善／縮小／廃止' },
};

function fieldHelpIcon(key) {
  if (!FIELD_HELP[key]) return '';
  return '<b class="fh" data-k="' + key + '"></b>';
}

const app = {
  currentPage: 'home',
  previousPage: null,
  sectionEntryPoint: null, // 記入ページに入った時のエントリーポイント（home or 一覧）
  monthlyPageIndex: 0, // 月次目標の現在ページ（0-6）
  _goalBarExpanded: false, // 月次目標バーの展開状態
  lifePageIndex: 0, // 人生設計の現在ページ（0:目的/意味, 1:年齢別目標）
  expandedRoutineIndex: null, // 展開中のルーティン（月次編集用）
  journalListMonth: null, // 日誌一覧の表示月（null=今月）

  // ノートビュー状態
  noteViewCollapsed: {},

  // スワイプグループ定義
  swipeGroups: {
    journal: ['journal-supplement', 'journal'],
    monthly: ['monthly-0', 'monthly-1', 'monthly-2', 'monthly-3', 'monthly-4', 'monthly-5', 'monthly-6'],
    life: ['life-0', 'life-1']
  },

  // メインタブ（下部ナビ）のフラット順序（サブタブ含む）
  flatPages: [
    { page: 'home' },
    { page: 'gtd', tab: 'firstbox' },
    { page: 'gtd', tab: 'task', subTab: 'urgent' },
    { page: 'gtd', tab: 'task', subTab: 'action' },
    { page: 'gtd', tab: 'task', subTab: 'project' },
    { page: 'gtd', tab: 'task', subTab: 'waiting' },
    { page: 'gtd', tab: 'task', subTab: 'calendar' },
    { page: 'gtd', tab: 'task', subTab: 'wish' },
    { page: 'gtd', tab: 'routine', subTab: 'goal' },
    { page: 'gtd', tab: 'routine', subTab: 'obligation' },
    { page: 'gtd', tab: 'routine', subTab: 'maintenance' },
    { page: 'gtd', tab: 'routine', subTab: 'principle' },
    { page: 'gtd', tab: 'routine', subTab: 'candidate' },
    { page: 'gtd', tab: 'material' },
    { page: 'goal-list' },
    { page: 'review-list' },
    { page: 'settings' }
  ],

  // メインタブスワイプ状態
  mainTabSwipe: {
    startX: 0,
    startY: 0,
    directionLocked: false
  },

  // スワイプ状態
  swipe: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    direction: null,
    container: null
  },

  // ドラッグ移動状態
  dragNav: {
    active: false,
    longPressTimer: null,
    startIndex: null,
    currentIndex: null,
    swipeNav: null,
  },

  data: {
    todayJournal: null,
    monthlyGoal: null,
    longTermGoal: null,
    longTermGoals: [],
    lifeDesign: null,
    journals: [],
    monthlyGoals: [],
    manuals: [],
    manual: null,
    editingManual: null,
    settings: {}
  },

  // 初期化
  async init() {
    try {
      // データベース初期化
      await initDB();
      console.log('Database initialized');

      // データ読み込み
      await this.loadAllData();

      // サンプルデータ投入（初回のみ：フラグで管理）
      try {
        const seedDone = await getSetting('seedDataInserted', false);
        if (!seedDone && typeof seedAllData === 'function') {
          const existingTasks = await getAllTasks();
          if (existingTasks.length === 0) {
            console.log('初回起動：サンプルデータを投入します');
            await seedAllData();
            await saveSetting('seedDataInserted', true);
            await this.loadAllData();
          }
        }
      } catch(e) { console.warn('seed skip:', e); }

      // スケジュールパターン自動補完は廃止（v376）



      // テーマ適用
      this.applyTheme(this.data.settings.theme, this.data.settings.themeApplyAll);

      // スタイルテーマ適用
      this.applyStyleTheme(this.data.settings.styleTheme);

      // ダークモード適用
      this.applyDarkMode(this.data.settings.darkMode);

      // 詳細ボタン設定適用
      this.applyDetailBtnSettings(this.data.settings.detailBtnStyle, this.data.settings.detailBtnColor);

      // フォント適用
      this.applyFont(this.data.settings.font);

      // フォントサイズ適用
      this.applyFontSize();

      // トランジション適用
      this.applyTransition(this.data.settings.transition);

      // 初期画面表示
      this.render();

      // バージョン更新チェック
      this.checkVersionUpdate();

      // 戻るジェスチャー対応
      this.initHistoryNavigation();

      // リップルエフェクト初期化
      this.initRippleEffects();

      // キーボード表示時のナビバー制御
      this.initKeyboardHandler();

      // スワイプナビゲーション初期化
      this.initSwipeNavigation();

      // メインタブスワイプ初期化
      this.initMainTabSwipe();

      // ドラッグ移動初期化
      this.initDragNavigation();

      // テキストエリア自動伸縮のイベント委譲（モーダル内も含む）
      document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA') {
          this.autoResizeTextarea(e.target);
        }
      });

      // フィールドヘルプ長押し初期化
      this.initFieldHelp();

      // バックグラウンド保存 & 日付変更検知
      this.initVisibilityHandler();

      // Service Worker 登録
      this.registerServiceWorker();

      // 起動時にサーバーバージョンをチェック（バックグラウンド）
      this.autoUpdateCheck();

      // Firebase 初期化（認証 + クラウド同期）
      this.initFirebase();

      console.log('App initialized');
    } catch (error) {
      console.error('Init error:', error);
      if (error.message === 'DB_FALLBACK_TIMEOUT') {
        this.showToast('データベースに接続できません。他のタブを全て閉じてリロードしてください。');
      } else {
        this.showToast('初期化エラー(' + (error.message || error.name || 'unknown') + ')：リロードしてください');
      }
    }
  },

  // 期限が最も近い長期目標を取得（メイン優先）
  getClosestDeadlineGoal(goals) {
    if (!goals || goals.length === 0) return null;

    // メインがあればメインを返す
    const mainGoal = goals.find(g => g.type === 'main');
    if (mainGoal) return mainGoal;

    const today = new Date();
    const goalsWithDeadline = goals.filter(g => g.deadlineYear && g.deadlineMonth);

    if (goalsWithDeadline.length === 0) {
      return goals[0];
    }

    goalsWithDeadline.sort((a, b) => {
      const dateA = new Date(a.deadlineYear, a.deadlineMonth, 0);
      const dateB = new Date(b.deadlineYear, b.deadlineMonth, 0);
      return dateA - dateB;
    });

    // 過去の期限は除外し、未来の期限で最も近いものを返す
    const futureGoals = goalsWithDeadline.filter(g => {
      const deadline = new Date(g.deadlineYear, g.deadlineMonth, 0);
      return deadline >= today;
    });

    return futureGoals.length > 0 ? futureGoals[0] : goalsWithDeadline[0];
  },

  // 全データ読み込み（再呼び出し保護付き）
  _loadingAllData: false,
  _loadingPromise: null,
  async loadAllData() {
    if (this._loadingAllData) return this._loadingPromise;
    this._loadingAllData = true;
    this._loadingPromise = this._doLoadAllData().finally(() => {
      this._loadingAllData = false;
      this._loadingPromise = null;
    });
    return this._loadingPromise;
  },
  async _doLoadAllData() {
    const today = getTodayDate();
    const currentMonth = getCurrentMonth();

    this.data.todayJournal = await getJournal(today);
    this.data.monthlyGoal = await getMonthlyGoal(currentMonth);
    this.data.longTermGoals = await getAllLongTermGoals();
    this.data.longTermGoal = this.getClosestDeadlineGoal(this.data.longTermGoals);
    this.data.lifeDesign = await getLifeDesign();
    this.journalListMonth = currentMonth;
    this.data.journals = await getMonthJournals(currentMonth);
    this.data.journals.forEach(j => this.migratePolicyScores(j));
    this.data.monthlyGoals = await getAllMonthlyGoals();
    this.data.manuals = await getAllManuals();

    // 設定読み込み
    this.data.settings = {
      name: await getSetting('name', ''),
      birthday: await getSetting('birthday', ''),
      darkMode: await getSetting('darkMode', false),
      theme: await getSetting('theme', null),
      themeApplyAll: await getSetting('themeApplyAll', false),
      font: await getSetting('font', null),
      transition: await getSetting('transition', null),
      detailBtnStyle: await getSetting('detailBtnStyle', null),
      detailBtnColor: await getSetting('detailBtnColor', null),
      labelFontSize: await getSetting('labelFontSize', 100),
      inputFontSize: await getSetting('inputFontSize', 100),
      homeFontSize: await getSetting('homeFontSize', 100),
      schedulePattern: await getSetting('schedulePattern', 'hourly'),
      dailySchedule: await getSetting('dailySchedule', []),
      fboxStyle: await getSetting('fboxStyle', 'B'),
      geminiApiKey: await getSetting('geminiApiKey', ''),
      notionApiKey: await getSetting('notionApiKey', ''),
      notionPageId: await getSetting('notionPageId', ''),
      aiPresets: await getSetting('aiPresets', [{ id: 'default', name: '標準', length: 'medium', tone: 'casual', isDefault: true }]),
      inputModalType: await getSetting('inputModalType', 'center'),
      scheduleWidgetStyle: await getSetting('scheduleWidgetStyle', 'timeline'),
      routineWidgetStyle: await getSetting('routineWidgetStyle', 'checklist'),
      styleTheme: await getSetting('styleTheme', null),
      lastCloudSync: await getSetting('lastCloudSync', null),
      gcalAutoTypes: await getSetting('gcalAutoTypes', [])
    };

    // グローバル点数項目テンプレート読み込み
    this.data.scoreItems = await getSetting('scoreItems', [
      { id: 'fullLife', title: '明日死んでも後悔のない1日だったか' },
      { id: 'spiritualFirst', title: '霊主な考え・行動・生き方をしていたか' }
    ]);

    // 日誌に点数項目がなければグローバル設定からコピー
    if (!this.data.todayJournal.scoreItems || this.data.todayJournal.scoreItems.length === 0) {
      this.data.todayJournal.scoreItems = JSON.parse(JSON.stringify(this.data.scoreItems));
    }

    // 旧policyScoresを新スコアに移行（後方互換）
    this.migratePolicyScores(this.data.todayJournal);

    // 前日の意気込みを自動反映（今日の日誌にまだ意気込みがない場合のみ）
    let needsSave = false;
    this.resolutionAutoPopulated = false;
    if (!this.data.todayJournal.resolution) {
      const logicalNow = getLogicalNow();
      const yesterday = new Date(logicalNow);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      const yesterdayJournal = await getJournal(yesterdayStr);
      if (yesterdayJournal.tomorrowResolution) {
        this.data.todayJournal.resolution = yesterdayJournal.tomorrowResolution;
        this.resolutionAutoPopulated = true;
        needsSave = true;
      }
    }

    // APIキーを復元
    this.geminiApiKey = this.data.settings.geminiApiKey || '';

    // dailyScheduleをdataに直接も保持
    this.data.dailySchedule = this.data.settings.dailySchedule || [];

    // F・BOXアイテムを読み込み
    await this.loadFirstBoxItems();

    // タスクを読み込み
    try { await this.loadTasks(); } catch(e) { console.warn('タスク読み込みスキップ:', e); }

    // ルーティンを読み込み
    try { await this.loadRoutines(); } catch(e) { console.warn('ルーティン読み込みスキップ:', e); }

    // 資料を読み込み
    try { await this.loadMaterials(); } catch(e) { console.warn('資料読み込みスキップ:', e); }

    // 月次目標からルーティンを日誌に同期
    if (this.data.monthlyGoal && this.data.todayJournal) {
      const monthlyRoutines = this.data.monthlyGoal.routines || [];
      const journalRoutines = this.data.todayJournal.routines || [];

      // ルーティンが空、または月次と数が違う場合は同期
      if (journalRoutines.length === 0 || journalRoutines.length !== monthlyRoutines.length) {
        // 既存のdone状態を保持しつつ、月次からコピー
        this.data.todayJournal.routines = monthlyRoutines.map((routine, i) => {
          const routineId = routine.id ?? (i + 1);
          const existing = journalRoutines.find(r => r.id === routineId) || journalRoutines.find(r => r.name === routine.name);
          return {
            id: routineId,
            category: routine.category,
            name: routine.name,
            priority: routine.priority || i + 1,
            condition: routine.condition || '',
            minimumAction: routine.minimumAction || '',
            troubleAnticipation: routine.troubleAnticipation || '',
            done: existing ? existing.done : false,
            status: existing ? (existing.status || 'none') : 'none'
          };
        });
        needsSave = true;
      }

      // コアアクションもコピー
      if (this.data.monthlyGoal.coreActions && !this.data.todayJournal.coreActions?.deadline?.name) {
        const existingCore = this.data.todayJournal.coreActions || {};
        this.data.todayJournal.coreActions = {
          deadline: { name: this.data.monthlyGoal.coreActions.deadline || '', done: existingCore.deadline?.done || false },
          processing: { name: this.data.monthlyGoal.coreActions.processing || '', done: existingCore.processing?.done || false },
          habit: { name: this.data.monthlyGoal.coreActions.habit || '', done: existingCore.habit?.done || false },
          other: { name: this.data.monthlyGoal.coreActions.other || '', done: existingCore.other?.done || false }
        };
        needsSave = true;
      }
    }

    // 変更があった場合のみ1回で保存
    if (needsSave) {
      await saveJournal(this.data.todayJournal);
    }
  },

  // 画面描画
  render() {
    const container = document.getElementById('app');
    const routineRate = calculateRoutineRate(this.data.todayJournal);

    // filteredLongTermGoalsとcurrentLongTermIndexを直接this.dataに保持するため、参照を渡す
    const renderData = this.data;
    renderData.routineRate = routineRate;

    let html = '';

    switch (this.currentPage) {
      case 'home':
        html = renderHomePage(renderData);
        break;
      case 'tasks':
        html = renderTasksPage(renderData);
        break;
      case 'journal':
        html = renderJournalPage(renderData);
        break;
      case 'journal-supplement':
        html = renderJournalSupplementPage(renderData);
        break;
      case 'journal-list':
        html = renderJournalListPage(renderData);
        break;
      case 'monthly':
      case 'monthly-0':
      case 'monthly-1':
      case 'monthly-2':
      case 'monthly-3':
      case 'monthly-4':
      case 'monthly-5':
      case 'monthly-6':
        html = renderMonthlyPage(renderData, this.monthlyPageIndex);
        break;
      case 'monthly-list':
        html = renderMonthlyListPage(renderData);
        break;
      case 'longterm':
        html = renderLongTermPage(renderData);
        break;
      case 'longterm-list':
        html = renderLongTermListPage(renderData);
        break;
      case 'life':
      case 'life-0':
      case 'life-1':
        html = renderLifeDesignPage(renderData, this.lifePageIndex);
        break;
      case 'settings':
        html = renderSettingsPage(renderData);
        break;
      case 'gtd':
        html = renderGTDPage(renderData);
        break;
      case 'review-list':
        if (!renderData.reviewMonthJournalCounts) {
          if (!this._loadingReviewList) {
            this._loadingReviewList = true;
            this.loadReviewListData().then(() => {
              this._loadingReviewList = false;
              this.render();
            }).catch(err => {
              console.error('振り返りデータの読み込みに失敗:', err);
              this._loadingReviewList = false;
              this.data.reviewMonthJournalCounts = {};
              this.render();
            });
          }
          html = renderHeader('振り返り') + '<div class="content"><div class="rv-empty">読み込み中...</div></div>' + renderNavBar('review-list');
        } else {
          html = renderReviewListPage(renderData);
        }
        break;
      case 'review':
        html = renderReviewMonthPage(renderData);
        break;
      case 'calendar':
        html = renderCalendarPage(renderData);
        break;
      case 'goal-list':
        html = renderGoalListPage(renderData);
        break;
      case 'manual-list':
        html = renderManualListPage(renderData);
        break;
      case 'routine-list':
        html = renderRoutineListPage(renderData);
        break;
      case 'task-list':
        html = renderTaskListPage(renderData);
        break;
      case 'material-list':
        html = renderMaterialListPage(renderData);
        break;
      case 'material-view':
        html = renderMaterialViewPage(this);
        break;
      case 'material-add':
        html = renderMaterialAddPage(this);
        break;
      case 'firstbox':
        html = renderFirstBoxFlow(this.firstBoxStep, this.firstBoxInput);
        break;
      case 'firstbox-list':
        html = renderFirstBoxListPage(this);
        break;
      case 'firstbox-items':
        html = renderFirstBoxItemsPage(this);
        break;
      case 'note-view':
        html = renderNoteViewPage(this);
        break;
      case 'routine-note-view':
        html = renderRoutineNoteViewPage(this);
        break;
      case 'manual':
        html = renderManualPage(renderData);
        break;
      case 'manual-edit':
        html = renderManualEditPage(renderData);
        break;
      case 'schedule-entry':
        html = renderScheduleEntryPage(renderData);
        break;
      default:
        html = renderHomePage(renderData);
    }

    // 描画前の高さとスクロール位置を記録
    const contentEl = container.querySelector('.content');
    const oldHeight = contentEl ? contentEl.scrollHeight : 0;
    const oldScrollTop = contentEl ? contentEl.scrollTop : 0;

    container.innerHTML = html;
    container.classList.toggle('noteview-active', this.currentPage === 'note-view' || this.currentPage === 'routine-note-view');

    // スクロール位置を計算して設定
    const newContentEl = container.querySelector('.content');
    if (newContentEl) {
      if (this._keepScrollPosition !== undefined) {
        // スクロール位置を維持するフラグがある場合はそのまま復元
        newContentEl.scrollTop = this._keepScrollPosition;
      } else {
        const newHeight = newContentEl.scrollHeight;
        const heightDiff = newHeight - oldHeight;
        // 元の位置 + 増えた分（増えてない場合は元の位置のまま）
        newContentEl.scrollTop = oldScrollTop + (heightDiff > 0 ? heightDiff : 0);
      }
    }

    // リップルエフェクト再初期化
    this.initRippleEffects();

    // テキストエリア自動伸縮
    this.autoResizeAllTextareas();

    // はみ出しチェック（続きを見る表示）
    this.checkOverflow();

    // 長期目標カードのスワイプ設定
    this.initGoalCardSwipe();

    // タブの中央寄せ
    if (this.currentPage === 'task-list') {
      this.scrollTaskTabToCenter();
    } else if (this.currentPage === 'routine-list') {
      this.scrollRoutineTabToCenter();
    } else if (this.currentPage === 'gtd') {
      if (this.currentGTDTab === 'task') {
        this.scrollTaskTabToCenter();
      } else if (this.currentGTDTab === 'routine') {
        this.scrollRoutineTabToCenter();
      }
    }

    // 達成率グラフ・月次評価達成率を該当ページでのみ非同期描画
    setTimeout(() => {
      if (this.currentPage === 'journal-supplement') this.renderRoutineGraph();
      if (this.currentPage === 'monthly-6') this.renderEvalAchievementRates();
    }, 0);
  },

  // テキストエリア自動伸縮
  autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    const minH = parseInt(getComputedStyle(el).minHeight) || 44;
    el.style.height = Math.max(el.scrollHeight, minH) + 'px';
  },

  autoResizeAllTextareas() {
    const container = document.getElementById('app');
    if (!container) return;
    container.querySelectorAll('textarea').forEach(ta => {
      this.autoResizeTextarea(ta);
    });
  },

  // 長期目標カードスワイプ初期化
  goalCardSwipe: {
    startX: 0,
    startY: 0,
    active: false
  },

  initGoalCardSwipe() {
    const goalCard = document.getElementById('home-card-longterm');
    if (!goalCard) return;

    // 複数目標がある場合のみスワイプを有効化
    const total = this.data.filteredLongTermGoals?.length || 0;
    if (total <= 1) return;

    // バインドした関数を保存して使用
    const self = this;
    goalCard.ontouchstart = function(e) { self.handleGoalCardSwipeStart(e); };
    goalCard.ontouchmove = function(e) { self.handleGoalCardSwipeMove(e); };
    goalCard.ontouchend = function(e) { self.handleGoalCardSwipeEnd(e); };
  },

  handleGoalCardSwipeStart(e) {
    const touch = e.touches[0];
    this.goalCardSwipe = {
      startX: touch.clientX,
      startY: touch.clientY,
      active: true,
      direction: null
    };
  },

  handleGoalCardSwipeMove(e) {
    if (!this.goalCardSwipe.active) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.goalCardSwipe.startX;
    const deltaY = touch.clientY - this.goalCardSwipe.startY;

    // 方向決定（初回のみ）
    if (!this.goalCardSwipe.direction) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        this.goalCardSwipe.direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'h' : 'v';
      }
    }
  },

  handleGoalCardSwipeEnd(e) {
    if (!this.goalCardSwipe.active) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.goalCardSwipe.startX;
    const threshold = 50;

    if (this.goalCardSwipe.direction === 'h') {
      if (deltaX > threshold) {
        // 右スワイプ → 前の目標
        this.prevLongTermGoal();
      } else if (deltaX < -threshold) {
        // 左スワイプ → 次の目標
        this.nextLongTermGoal();
      }
    }

    this.goalCardSwipe.active = false;
  },

  // はみ出しをチェックして「続きを見る」を表示
  checkOverflow() {
    // ホーム画面の長期目標
    const homeGoalTitle = document.querySelector('#home-card-longterm .goal-title');
    const homeGoalMore = document.querySelector('#home-card-longterm .goal-more');
    if (homeGoalTitle && homeGoalMore) {
      if (homeGoalTitle.scrollHeight > homeGoalTitle.clientHeight) {
        homeGoalMore.innerHTML = '続きを見る ▼';
        homeGoalMore.onclick = (e) => { e.stopPropagation(); this.expandHomeCard('longterm'); };
      } else {
        homeGoalMore.innerHTML = '';
      }
    }

    // ホーム画面の月次目標
    const progressDetail = document.querySelector('.progress-detail');
    const progressMore = document.querySelector('.progress-more');
    if (progressDetail && progressMore) {
      if (progressDetail.scrollHeight > progressDetail.clientHeight) {
        progressMore.innerHTML = '続きを見る ▼';
        progressMore.onclick = (e) => { e.stopPropagation(); this.expandHomeCard('monthly'); };
      } else {
        progressMore.innerHTML = '';
      }
    }

    // 長期目標記入ページのgoal-card
    const longtermGoalTitle = document.querySelector('#longterm-card-goal .goal-title');
    const longtermGoalMore = document.querySelector('#longterm-card-goal .goal-more');
    if (longtermGoalTitle && longtermGoalMore) {
      if (longtermGoalTitle.scrollHeight > longtermGoalTitle.clientHeight) {
        longtermGoalMore.innerHTML = '続きを見る ▼';
        longtermGoalMore.onclick = (e) => { e.stopPropagation(); this.expandLongtermCard(); };
      } else {
        longtermGoalMore.innerHTML = '';
      }
    }

    // 逆算目標の「続きを見る」
    const milestoneWrappers = document.querySelectorAll('.milestone-goal-wrapper');
    milestoneWrappers.forEach((wrapper, index) => {
      const content = wrapper.querySelector('.milestone-goal-content');
      const more = wrapper.querySelector('.milestone-goal-more');
      if (content && more) {
        if (content.scrollHeight > content.clientHeight) {
          more.innerHTML = '続きを見る ▼';
          more.onclick = (e) => { e.stopPropagation(); this.expandMilestone(index); };
        } else {
          more.innerHTML = '';
        }
      }
    });

    // 長期目標一覧の「続きを見る」
    const longtermListWrappers = document.querySelectorAll('.longterm-list-item .list-goal-wrapper');
    longtermListWrappers.forEach((wrapper, index) => {
      if (wrapper.classList.contains('expanded')) return; // 展開中はスキップ
      const content = wrapper.querySelector('.list-goal-content');
      const more = wrapper.querySelector('.list-goal-more');
      const goalId = wrapper.closest('.longterm-list-item')?.dataset?.goalId;
      if (content && more && goalId) {
        if (content.scrollHeight > content.clientHeight) {
          more.innerHTML = '続きを見る ▼';
          more.onclick = (e) => { e.stopPropagation(); this.expandLongtermListItem(index, parseInt(goalId)); };
        } else {
          more.innerHTML = '';
        }
      }
    });

    // 人生設計ページの最上位目的
    const purposeContent = document.querySelector('#life-card-purpose .life-card-content');
    const purposeMore = document.querySelector('#life-card-purpose .life-card-more');
    if (purposeContent && purposeMore) {
      if (purposeContent.scrollHeight > purposeContent.clientHeight) {
        purposeMore.innerHTML = '続きを見る ▼';
        purposeMore.onclick = (e) => { e.stopPropagation(); this.expandLifeCard('purpose'); };
      } else {
        purposeMore.innerHTML = '';
      }
    }

    // 人生設計ページの意味
    const meaningContent = document.querySelector('#life-card-meaning .life-card-content');
    const meaningMore = document.querySelector('#life-card-meaning .life-card-more');
    if (meaningContent && meaningMore) {
      if (meaningContent.scrollHeight > meaningContent.clientHeight) {
        meaningMore.innerHTML = '続きを見る ▼';
        meaningMore.onclick = (e) => { e.stopPropagation(); this.expandLifeCard('meaning'); };
      } else {
        meaningMore.innerHTML = '';
      }
    }

    // 年齢別目標の「続きを見る」
    const goalWrappers = document.querySelectorAll('.goal-display-wrapper');
    goalWrappers.forEach((wrapper, index) => {
      const textarea = wrapper.querySelector('.goal-textarea');
      const more = wrapper.querySelector('.goal-more');
      if (textarea && more) {
        if (textarea.scrollHeight > textarea.clientHeight) {
          more.innerHTML = '続きを見る ▼';
          more.onclick = () => { this.expandAgeGoal(index); };
        } else {
          more.innerHTML = '';
        }
      }
    });
  },

  // ページ遷移
  async navigate(page, pushHistory = true, source = 'default') {
    // 排他制御（連打防止）
    if (this._navigating) return;
    this._navigating = true;
    try {
      await this._doNavigate(page, pushHistory, source);
    } finally {
      this._navigating = false;
    }
  },

  async _doNavigate(page, pushHistory, source) {
    // モーダル・オーバーレイのクリーンアップ（body直下に残存する要素を除去）
    document.querySelectorAll('.modal-overlay, .field-help-overlay').forEach(el => el.remove());
    this.closeModalDirect();

    // 資料閲覧から離れる時はBlob URL解放
    if (this.currentPage === 'material-view' && page !== 'material-view') {
      this.cleanupMaterialBlobUrl();
    }

    // 振り返り一覧に遷移時はキャッシュをクリア（最新データを反映）
    if (page === 'review-list') {
      this.data.reviewMonthJournalCounts = null;
    }

    // 記入ページから離れる時の自動保存
    try {
      await this.autoSaveOnLeaveEntryPage(page);
    } catch (e) {
      console.warn('自動保存失敗:', e);
    }

    // 保留中の日付変更があれば実行
    try {
      await this._applyPendingDateChange();
    } catch (e) {
      console.warn('日付変更適用失敗:', e);
    }

    // 前のページを記録（戻るボタン用）
    if (this.currentPage && this.currentPage !== page) {
      this.previousPage = this.currentPage;
    }

    // 記入ページに入る時、エントリーポイントを記録
    const entryPages = ['journal', 'journal-supplement', 'monthly', 'longterm'];
    const normalizedPage = page.startsWith('monthly-') && page !== 'monthly-list' ? 'monthly' : page;
    if (entryPages.includes(normalizedPage)) {
      // ホームから来たか、一覧から来たかを記録
      if (this.currentPage === 'home') {
        this.sectionEntryPoint = 'home';
      } else if (this.currentPage === 'journal-list') {
        this.sectionEntryPoint = 'journal-list';
      } else if (this.currentPage === 'monthly-list') {
        this.sectionEntryPoint = 'monthly-list';
      } else if (this.currentPage === 'longterm-list' || this.currentPage === 'goal-menu') {
        this.sectionEntryPoint = 'longterm-list';
      }
      // それ以外（同じセクション内の移動）はエントリーポイントを維持
    }

    let transition = this.data.settings.transition || 'none';

    // スワイプ経由の場合はアニメーションなし（すでにスライド済み）
    if (source === 'swipe') {
      transition = 'none';
    }
    // 同一ページ内のサブタブ切り替えはアニメーションなし（GTD・レビュー等）
    else if (this.currentPage === page) {
      transition = 'none';
    }
    // 同一セクション内の移動はアニメーションなし（月次・人生設計のページ切り替え）
    else if ((this.currentPage === 'monthly' && (page === 'monthly' || (page.startsWith('monthly-') && page !== 'monthly-list'))) ||
             (this.currentPage === 'life' && (page === 'life' || page.startsWith('life-')))) {
      transition = 'none';
    }
    // ベース設定の場合：下枠→スケール、それ以外→フェード
    else if (transition === 'none') {
      transition = source === 'nav' ? 'scale' : 'fade';
    }

    const container = document.getElementById('app');
    const content = container.querySelector('.content, .home-content');

    // アニメーションありの場合
    if (content && transition !== 'none') {
      // 一時的にトランジションクラスを適用
      document.body.classList.remove('transition-none', 'transition-fade', 'transition-slide', 'transition-scale', 'transition-push');
      document.body.classList.add(`transition-${transition}`);

      content.classList.add('page-exit');
      const exitTime = transition === 'slide' || transition === 'push' ? 200 : 150;
      await new Promise(resolve => {
        setTimeout(() => {
          this.currentPage = page;
          // 月次ページのインデックス設定
          if (page.startsWith('monthly-') && page !== 'monthly-list') {
            const index = parseInt(page.split('-')[1]);
            if (!isNaN(index)) {
              this.monthlyPageIndex = index;
              this.currentPage = 'monthly';
            }
          } else if (page === 'monthly') {
            this.monthlyPageIndex = 0;
          }
          // 人生設計ページのインデックス設定
          if (page.startsWith('life-')) {
            const index = parseInt(page.split('-')[1]);
            if (!isNaN(index)) {
              this.lifePageIndex = index;
              this.currentPage = 'life';
            }
          } else if (page === 'life') {
            this.lifePageIndex = 0;
          }
          this._keepScrollPosition = 0;
          this.render();
          delete this._keepScrollPosition;
          const contentEl = document.querySelector('.content');
          if (contentEl) contentEl.scrollTop = 0;
          // 新しいコンテンツにpage-enterクラス追加
          const newContent = container.querySelector('.content, .home-content');
          if (newContent) {
            newContent.classList.add('page-enter');
            setTimeout(() => newContent.classList.remove('page-enter'), 300);
          }
          resolve();
        }, exitTime);
      });
    } else {
      // コンテンツがない場合
      this.currentPage = page;
      if (page.startsWith('monthly-') && page !== 'monthly-list') {
        const index = parseInt(page.split('-')[1]);
        if (!isNaN(index)) {
          this.monthlyPageIndex = index;
          this.currentPage = 'monthly';
        }
      } else if (page === 'monthly') {
        this.monthlyPageIndex = 0;
      }
      // 人生設計ページのインデックス設定
      if (page.startsWith('life-')) {
        const index = parseInt(page.split('-')[1]);
        if (!isNaN(index)) {
          this.lifePageIndex = index;
          this.currentPage = 'life';
        }
      } else if (page === 'life') {
        this.lifePageIndex = 0;
      }
      this._keepScrollPosition = 0;
      this.render();
      delete this._keepScrollPosition;
      const contentEl2 = document.querySelector('.content');
      if (contentEl2) contentEl2.scrollTop = 0;
    }

    // ブラウザ履歴に追加（戻るジェスチャー対応）
    if (pushHistory) {
      history.pushState({ page }, '', `#${page}`);
    }

  },

  // 前のページに戻る（階層ベース）
  goBack(pushHistory = true) {
    const page = this.currentPage;

    // ホーム → 何もしない
    if (page === 'home') return;

    // 今日のタスク → ホーム
    if (page === 'tasks') {
      this.navigate('home', pushHistory);
      return;
    }

    // 日誌グループ
    if (page === 'journal-supplement') {
      // ホームから来たらホーム、それ以外は日誌
      this.navigate(this.sectionEntryPoint === 'home' ? 'home' : 'journal', pushHistory);
      return;
    }
    if (page === 'journal') {
      // ホームから来たらホーム、一覧から来たら一覧
      this.navigate(this.sectionEntryPoint === 'home' ? 'home' : 'journal-list', pushHistory);
      return;
    }

    // 月次グループ
    if (page === 'monthly') {
      // ホームから来た場合は直接ホームへ
      if (this.sectionEntryPoint === 'home') {
        this.navigate('home', pushHistory);
      } else if (this.monthlyPageIndex > 0) {
        this.monthlyPageIndex = 0;
        this.render();
      } else {
        this.navigate('monthly-list', pushHistory);
      }
      return;
    }

    // 長期目標
    if (page === 'longterm') {
      // ホームから来たらホーム、一覧から来たら一覧
      this.navigate(this.sectionEntryPoint === 'home' ? 'home' : 'longterm-list', pushHistory);
      return;
    }

    // 人生設計グループ
    if (page === 'life') {
      if (this.lifePageIndex > 0) {
        this.lifePageIndex = 0;
        this.render();
      } else {
        this.navigate('goal-list', pushHistory);
      }
      return;
    }

    // マニュアル
    if (page === 'manual-edit') {
      this.navigate('manual', pushHistory);
      return;
    }
    if (page === 'manual') {
      this.navigate('manual-list', pushHistory);
      return;
    }

    // 資料追加 → GTD（資料タブ）
    if (page === 'material-add') {
      this.currentGTDTab = 'material';
      this.navigate('gtd', pushHistory);
      return;
    }

    // 資料閲覧 → 呼び出し元に戻る
    if (page === 'material-view') {
      this.cleanupMaterialBlobUrl();
      if (this._materialReturnPage === 'note-view') {
        this.navigate('note-view', pushHistory);
      } else {
        this.currentGTDTab = 'material';
        this.navigate('gtd', pushHistory);
      }
      return;
    }

    // F・BOX振り分けフロー → 呼び出し元に戻る
    if (page === 'firstbox' || page === 'firstbox-items') {
      if (this._fboxReturnPage === 'note-view') {
        this.navigate('note-view', pushHistory);
      } else {
        this.currentGTDTab = 'firstbox';
        this.navigate('gtd', pushHistory);
      }
      return;
    }

    // カレンダー → ホーム
    if (page === 'calendar') {
      this.navigate('home', pushHistory);
      return;
    }

    // ノートビュー → GTD
    if (page === 'note-view' || page === 'routine-note-view') {
      this.navigate('gtd', pushHistory);
      return;
    }

    // 振り返り月詳細 → 振り返り一覧
    if (page === 'review') {
      this.navigate('review-list', pushHistory);
      return;
    }

    // 一覧ページ → 上の階層
    if (page === 'journal-list' || page === 'monthly-list' || page === 'longterm-list') {
      this.navigate('goal-list', pushHistory);
      return;
    }

    // 目標一覧、マニュアル一覧、設定、振り返り一覧 → ホーム
    this.navigate('home', pushHistory);
  },

  // 下枠ナビゲーション用（スケール使用）
  navigateNav(page, pushHistory = true) {
    this.navigate(page, pushHistory, 'nav');
  },

  // ========== ファーストボックス ==========
  firstBoxStep: 'input',
  firstBoxInput: '',
  firstBoxResult: '',
  firstBoxItems: [],

  // F・BOXアイテムをDBから読み込み
  async loadFirstBoxItems() {
    this.firstBoxItems = await getAllFirstBoxItems();
  },

  // とりあえずF・BOXに入れる（保存のみ、振り分けしない）
  async quickAddToFirstBox() {
    const input = document.getElementById('firstboxQuickInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    await saveFirstBoxItem(text);
    input.value = '';
    await this.loadFirstBoxItems();
    this.render();
  },

  // F・BOX一覧から1個選んで振り分けフロー開始
  startFirstBoxSort(id) {
    const item = this.firstBoxItems.find(i => i.id === id);
    if (!item) return;
    this._fboxReturnPage = this.currentPage;
    this.firstBoxStep = 'q1';
    this.firstBoxInput = item.text;
    this.firstBoxResult = '';
    this.firstBoxSortingId = id;
    this.navigate('firstbox');
  },

  // 振り分け完了時にF・BOXから削除
  async completeFirstBoxSort() {
    // 振り分け結果を該当ストアに保存
    await this.saveFirstBoxResultToStore();
    // F・BOXから削除
    if (this.firstBoxSortingId) {
      await deleteFirstBoxItem(this.firstBoxSortingId);
      this.firstBoxSortingId = null;
      await this.loadFirstBoxItems();
    }
  },

  // 振り分け結果 → 各ストアへ保存
  async saveFirstBoxResultToStore() {
    const text = this.firstBoxInput;
    const result = this.firstBoxResult;
    if (!text || !result) return;

    // 結果 → 保存先マッピング
    const taskMap = {
      'urgent': 'urgent',
      'action': 'action',
      'do-now': 'action',
      'project': 'project',
      'waiting': 'waiting',
      'calendar': 'calendar',
      'someday': 'wish'
    };
    const routineMap = {
      'goal-routine': 'goal',
      'duty-routine': 'obligation',
      'maintain-routine': 'maintenance',
      'principle-routine': 'principle',
      'candidate-routine': 'candidate'
    };

    this._lastCreatedItemId = null;
    this._lastCreatedItemType = null;
    try {
      if (taskMap[result]) {
        const savedId = await saveTask(createTaskData(taskMap[result], text, { source: 'fbox' }));
        await this.loadTasks();
        const newTask = this.taskItems.find(t => t.id === savedId);
        if (newTask) { this._lastCreatedItemId = newTask.id; this._lastCreatedItemType = 'task'; }
      } else if (routineMap[result]) {
        await saveRoutine(createRoutineData(routineMap[result], text, { source: 'fbox' }));
        await this.loadRoutines();
        const newRoutine = (this.routineItems || []).find(r => r.name === text && r.type === routineMap[result]);
        if (newRoutine) { this._lastCreatedItemId = newRoutine.id; this._lastCreatedItemType = 'routine'; }
      } else if (result === 'reference') {
        await saveMaterial(createMaterialData(text, { source: 'fbox' }));
        await this.loadMaterials();
      }
      // 'discard' は何も保存しない
    } catch (e) {
      console.warn('振り分け結果の保存に失敗:', e);
    }
  },

  // 通常のF・BOX開始（入力→即振り分け）
  startFirstBox() {
    this.firstBoxStep = 'input';
    this.firstBoxInput = '';
    this.firstBoxResult = '';
    this.firstBoxSortingId = null;
    this.navigate('firstbox');
  },

  // ルーティンページからの追加（入力後ルーティン5択へ）
  startRoutineAdd() {
    this.firstBoxStep = 'routine-input';
    this.firstBoxInput = '';
    this.firstBoxResult = '';
    this.navigate('firstbox');
  },

  // タスクページからの追加（入力後問3へ）
  startTaskAdd() {
    this.firstBoxStep = 'task-input';
    this.firstBoxInput = '';
    this.firstBoxResult = '';
    this.navigate('firstbox');
  },

  // 資料ページからの追加（2択のみ）
  startMaterialAdd() {
    this.firstBoxStep = 'q1-unclear-material';
    this.firstBoxInput = '';
    this.firstBoxResult = '';
    // 資料ページからは不要の選択肢なしの2択
    this.navigate('firstbox');
  },

  firstBoxNext(nextStep) {
    const input = document.getElementById('firstboxInput');
    if (input) {
      this.firstBoxInput = input.value.trim();
    }
    if (!this.firstBoxInput) {
      this.showToast('内容を入力してください');
      return;
    }
    this.firstBoxStep = nextStep;
    this.render();
  },

  async firstBoxAnswer(question, answer) {
    switch(question) {
      case 'q1':
        if (answer === 'clear') this.firstBoxStep = 'q2';
        else this.firstBoxStep = 'q1-unclear';
        break;
      case 'q1-unclear':
        if (answer === 'discard') { this.firstBoxResult = 'discard'; this.firstBoxStep = 'result'; }
        else if (answer === 'someday') { this.firstBoxResult = 'someday'; this.firstBoxStep = 'result'; }
        else if (answer === 'reference') { this.firstBoxResult = 'reference'; this.firstBoxStep = 'result'; }
        break;
      case 'q1-unclear-material':
        if (answer === 'someday') { this.firstBoxResult = 'someday'; this.firstBoxStep = 'result'; }
        else if (answer === 'reference') { this.firstBoxResult = 'reference'; this.firstBoxStep = 'result'; }
        break;
      case 'q2':
        if (answer === 'repeat') this.firstBoxStep = 'routine-1';
        else this.firstBoxStep = 'q3';
        break;
      case 'routine-1':
        if (answer === 'yes') { this.firstBoxResult = 'goal-routine'; this.firstBoxStep = 'result'; }
        else this.firstBoxStep = 'routine-2';
        break;
      case 'routine-2':
        if (answer === 'yes') { this.firstBoxResult = 'duty-routine'; this.firstBoxStep = 'result'; }
        else this.firstBoxStep = 'routine-3';
        break;
      case 'routine-3':
        if (answer === 'yes') { this.firstBoxResult = 'maintain-routine'; this.firstBoxStep = 'result'; }
        else this.firstBoxStep = 'routine-4';
        break;
      case 'routine-4':
        if (answer === 'yes') { this.firstBoxResult = 'principle-routine'; this.firstBoxStep = 'result'; }
        else { this.firstBoxResult = 'candidate-routine'; this.firstBoxStep = 'result'; }
        break;
      case 'q3':
        if (answer === 'single') this.firstBoxStep = 'q4';
        else { this.firstBoxResult = 'project'; this.firstBoxStep = 'result'; }
        break;
      case 'q4':
        if (answer === 'quick') this.firstBoxStep = 'q4-sub';
        else this.firstBoxStep = 'q5';
        break;
      case 'q4-sub':
        if (answer === 'now') { this.firstBoxResult = 'do-now'; this.firstBoxStep = 'result'; }
        else { this.firstBoxResult = 'urgent'; this.firstBoxStep = 'result'; }
        break;
      case 'q5':
        if (answer === 'waiting') { this.firstBoxResult = 'waiting'; this.firstBoxStep = 'result'; }
        else this.firstBoxStep = 'q6';
        break;
      case 'q6':
        if (answer === 'scheduled') { this.firstBoxResult = 'calendar'; this.firstBoxStep = 'result'; }
        else { this.firstBoxResult = 'action'; this.firstBoxStep = 'result'; }
        break;
    }
    // 振り分け結果に到達したら保存＆F・BOXアイテムを削除
    if (this.firstBoxStep === 'result') {
      await this.completeFirstBoxSort();
    }
    this.render();
  },

  async firstBoxMaterialNext(type) {
    const input = document.getElementById('firstboxInput');
    if (input) {
      this.firstBoxInput = input.value.trim();
    }
    if (!this.firstBoxInput) {
      this.showToast('内容を入力してください');
      return;
    }
    this.firstBoxResult = type;
    this.firstBoxStep = 'result';
    await this.completeFirstBoxSort();
    this.render();
  },

  // F-BOX振り分け結果 → 遷移先へ移動
  navigateToFirstBoxResult() {
    const result = this.firstBoxResult;
    const taskTabMap = { 'urgent': 'urgent', 'action': 'action', 'do-now': 'action', 'project': 'project', 'waiting': 'waiting', 'calendar': 'calendar', 'someday': 'wish' };
    if (taskTabMap[result]) {
      this.currentTaskTab = taskTabMap[result];
      this.navigate('task-list');
    } else if (result?.includes('routine')) {
      this.navigate('routine-list');
    } else if (result === 'reference') {
      this.navigate('material-list');
    }
  },

  // F-BOX振り分け後 → 追加情報を編集
  editLastCreatedItem() {
    if (this._lastCreatedItemType === 'task' && this._lastCreatedItemId) {
      this.showEditTaskModal(this._lastCreatedItemId);
    } else if (this._lastCreatedItemType === 'routine' && this._lastCreatedItemId) {
      this.showEditRoutineModal(this._lastCreatedItemId);
    }
  },

  // F・BOXスタイル切り替え（A/B）
  showFboxStyleModal() {
    const current = this.data.settings.fboxStyle || 'B';
    const styles = [
      { value: 'A', name: '3ボタン', desc: '日誌・F・BOX・振り分けの3ボタン' },
      { value: 'B', name: '内部分岐', desc: 'F・BOXを開いて入れる/振り分ける' }
    ];

    const optionsHTML = styles.map(s => `
      <div class="modal-option ${current === s.value ? 'active' : ''}"
           onclick="app.setFboxStyle('${s.value}')">
        <span class="modal-option-name">${s.name}</span>
        <span class="modal-option-desc">${s.desc}</span>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">F・BOXスタイル</div>
          ${optionsHTML}
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  showGeminiApiKeyModal() {
    const current = this.geminiApiKey || '';
    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">Gemini APIキー</div>
          <input type="password" class="modal-input" id="geminiApiKeyInput" value="${escapeHtml(current)}" placeholder="AIzaSy..." autocomplete="off">
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveGeminiApiKey()">保存</button>
          </div>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async saveGeminiApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const key = input ? input.value.trim() : '';
    await saveSetting('geminiApiKey', key);
    this.geminiApiKey = key;
    this.data.settings.geminiApiKey = key;
    this.closeModalDirect();
    this.render();
    this.showToast(key ? 'APIキーを保存しました' : 'APIキーを削除しました');
    if (this.firebaseUser) this.backupToCloud().catch(() => {});
  },

  // ===== Notion連携 =====
  showNotionSettingsModal() {
    const currentKey = this.data.settings.notionApiKey || '';
    const currentPage = this.data.settings.notionPageId || '';
    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">Notion連携設定</div>
          <p style="font-size:12px;color:#999;margin:0 0 12px">※ 自前プロキシ経由で安全に通信します</p>
          <div style="margin-bottom:12px">
            <label class="modal-label" style="display:block;margin-bottom:4px;font-size:13px">APIキー（Integration Token）</label>
            <input type="password" class="modal-input" id="notionApiKeyInput" value="${escapeHtml(currentKey)}" placeholder="ntn_..." autocomplete="off">
          </div>
          <div style="margin-bottom:16px">
            <label class="modal-label" style="display:block;margin-bottom:4px;font-size:13px">ページID（URLも可）</label>
            <input type="text" class="modal-input" id="notionPageIdInput" value="${escapeHtml(currentPage)}" placeholder="ページURLの末尾の英数字" autocomplete="off">
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveNotionSettings()">保存</button>
          </div>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async saveNotionSettings() {
    const keyInput = document.getElementById('notionApiKeyInput');
    const pageInput = document.getElementById('notionPageIdInput');
    const key = keyInput ? keyInput.value.trim() : '';
    let pageId = pageInput ? pageInput.value.trim() : '';
    // バリデーション: APIキーのフォーマットチェック
    if (key && !key.startsWith('ntn_') && !key.startsWith('secret_')) {
      this.showToast('APIキーはntn_で始まる必要があります');
      return;
    }
    // URLからページIDを抽出（大文字対応）
    pageId = pageId.replace(/-/g, '');
    if (pageId.includes('notion.so') || pageId.includes('notion.site')) {
      const match = pageId.match(/([a-f0-9]{32})/i);
      if (match) pageId = match[1].toLowerCase();
    }
    // バリデーション: ページIDフォーマットチェック
    if (pageId && !/^[a-f0-9]{32}$/.test(pageId)) {
      this.showToast('ページIDの形式が正しくありません（32桁の英数字）');
      return;
    }
    // 片方だけ設定されている場合の警告
    if ((key && !pageId) || (!key && pageId)) {
      this.showToast('APIキーとページIDの両方を設定してください');
      return;
    }
    await saveSetting('notionApiKey', key);
    await saveSetting('notionPageId', pageId);
    this.data.settings.notionApiKey = key;
    this.data.settings.notionPageId = pageId;
    this.closeModalDirect();
    this.render();
    this.showToast(key ? 'Notion設定を保存しました' : 'Notion設定を削除しました');
    if (this.firebaseUser) this.backupToCloud().catch(() => {});
  },

  _lastNotionReq: 0,

  async _notionThrottle() {
    const now = Date.now();
    const elapsed = now - this._lastNotionReq;
    if (elapsed < 350) {
      await new Promise(r => setTimeout(r, 350 - elapsed));
    }
    this._lastNotionReq = Date.now();
  },

  async _notionRequest(method, endpoint, body, retries = 5) {
    await this._notionThrottle();
    const key = this.data.settings.notionApiKey;
    if (!key) throw new Error('Notion APIキーが未設定です');
    const proxyUrl = `https://notion-proxy.uulife98.workers.dev${endpoint}`;
    let res;
    try {
      res = await fetch(proxyUrl, {
        method,
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      if (retries > 0) {
        const wait = 1000 * (6 - retries);
        await new Promise(r => setTimeout(r, wait));
        return this._notionRequest(method, endpoint, body, retries - 1);
      }
      throw new Error('ネットワーク接続またはCORSプロキシに問題があります');
    }
    if (res.status === 429 && retries > 0) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
      const wait = Math.max(retryAfter * 1000, 1000) * (6 - retries);
      await new Promise(r => setTimeout(r, wait));
      return this._notionRequest(method, endpoint, body, retries - 1);
    }
    if (res.status >= 500 && retries > 0) {
      const wait = 1000 * (6 - retries);
      await new Promise(r => setTimeout(r, wait));
      return this._notionRequest(method, endpoint, body, retries - 1);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Notion API error: ${res.status} ${err.message || ''}`);
    }
    return res.json().catch(() => ({}));
  },

  async _notionCreatePage(parentId, title, children) {
    return this._notionRequest('POST', '/pages', {
      parent: { page_id: parentId },
      properties: { title: [{ text: { content: title } }] },
      children: children || []
    });
  },

  async _notionAppendBlocks(pageId, children) {
    const CHUNK = 100;
    for (let i = 0; i < children.length; i += CHUNK) {
      await this._notionRequest('PATCH', `/blocks/${pageId}/children`, { children: children.slice(i, i + CHUNK) });
    }
  },

  async _notionClearBlocks(pageId) {
    const ids = [];
    let cursor = undefined;
    do {
      const url = `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
      const res = await this._notionRequest('GET', url);
      for (const block of (res.results || [])) {
        if (block.type !== 'child_page') ids.push(block.id);
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    for (const id of ids) {
      await this._notionRequest('DELETE', `/blocks/${id}`);
    }
  },

  async _notionReplaceBlocks(pageId, children) {
    const oldIds = [];
    let cursor = undefined;
    do {
      const url = `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
      const res = await this._notionRequest('GET', url);
      for (const block of (res.results || [])) {
        if (block.type !== 'child_page') oldIds.push(block.id);
      }
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    if (children.length > 0) await this._notionAppendBlocks(pageId, children);
    for (const id of oldIds) {
      await this._notionRequest('DELETE', `/blocks/${id}`);
    }
  },

  async _notionFindChildPage(parentId, title, prefixMatch) {
    let cursor = undefined;
    do {
      const url = `/blocks/${parentId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
      const res = await this._notionRequest('GET', url);
      const found = (res.results || []).find(b => {
        if (b.type !== 'child_page' || !b.child_page) return false;
        if (prefixMatch) return b.child_page.title.startsWith(prefixMatch);
        return b.child_page.title === title;
      });
      if (found) return found.id;
      cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return null;
  },

  async _notionGetOrCreatePage(parentId, title) {
    const existing = await this._notionFindChildPage(parentId, title);
    if (existing) return existing;
    const page = await this._notionCreatePage(parentId, title);
    return page.id;
  },

  _notionTextBlock(type, text) {
    const str = text || '';
    const LIMIT = 2000;
    if (str.length <= LIMIT) {
      return { type, [type]: { rich_text: [{ type: 'text', text: { content: str } }] } };
    }
    const parts = [];
    for (let i = 0; i < str.length; i += LIMIT) {
      parts.push({ type: 'text', text: { content: str.substring(i, i + LIMIT) } });
    }
    return { type, [type]: { rich_text: parts } };
  },

  _notionHeading(level, text) {
    const type = `heading_${level}`;
    return this._notionTextBlock(type, text);
  },

  _notionTodoBlock(text, checked = false) {
    const str = text || '';
    return { type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content: str } }], checked } };
  },

  _notionBulletBlock(text) {
    return this._notionTextBlock('bulleted_list_item', text);
  },

  _notionDivider() {
    return { type: 'divider', divider: {} };
  },

  _buildJournalNotionBlocks(j) {
    const blocks = [];
    if (j.resolution) {
      blocks.push(this._notionHeading(3, '意気込み'));
      blocks.push(this._notionTextBlock('paragraph', j.resolution));
    }
    if (j.scoreItems && j.scores) {
      blocks.push(this._notionHeading(3, '今日の点数'));
      j.scoreItems.forEach(item => {
        const val = j.scores[item.id] ?? 0;
        blocks.push(this._notionBulletBlock(`${item.title}: ${val}/5`));
      });
      if (j.score != null) {
        blocks.push(this._notionBulletBlock(`総合点: ${j.score}/5`));
      }
    }
    if (j.coreActions) {
      const coreLabels = { deadline: '期限付き', processing: '処理系', habit: '習慣', other: 'その他' };
      const hasCoreData = Object.entries(coreLabels).some(([key]) => j.coreActions[key]?.name);
      if (hasCoreData) {
        blocks.push(this._notionHeading(3, 'コアアクション'));
        Object.entries(coreLabels).forEach(([key, label]) => {
          const ca = j.coreActions[key];
          if (ca && ca.name) blocks.push(this._notionTodoBlock(`${label}: ${ca.name}`, ca.done));
        });
      }
    }
    if (j.reflections) {
      const labels = { reflection: '今日の反省', effort: '努力・成果', contribution: '世の為人の為', gratitude: '気付き・感謝', free: '自由記入' };
      Object.entries(labels).forEach(([key, label]) => {
        if (j.reflections[key]) {
          blocks.push(this._notionHeading(3, label));
          blocks.push(this._notionTextBlock('paragraph', j.reflections[key]));
        }
      });
    }
    if (j.tomorrowResolution) {
      blocks.push(this._notionHeading(3, '明日の意気込み'));
      blocks.push(this._notionTextBlock('paragraph', j.tomorrowResolution));
    }
    if (j.supplement) {
      const s = j.supplement;
      const items = [];
      if (s.sleep) items.push(`睡眠: ${s.sleep}`);
      if (s.work) items.push(`勤務: ${s.work}`);
      if (s.income) items.push(`収入: ¥${s.income}`);
      if (s.expense) items.push(`支出: ¥${s.expense}`);
      if (s.calorieIn) items.push(`摂取カロリー: ${s.calorieIn}kcal`);
      if (s.calorieOut) items.push(`消費カロリー: ${s.calorieOut}kcal`);
      if (s.weight) items.push(`体重: ${s.weight}kg`);
      if (items.length > 0) {
        blocks.push(this._notionHeading(3, 'サプリメント'));
        items.forEach(item => blocks.push(this._notionBulletBlock(item)));
      }
    }
    if (j.memo) {
      blocks.push(this._notionHeading(3, 'メモ'));
      blocks.push(this._notionTextBlock('paragraph', j.memo));
    }
    if (j.aiComment) {
      const aiText = j.aiComment.text || j.aiComment.normal || '';
      if (aiText) {
        blocks.push(this._notionHeading(3, 'AIコメント'));
        blocks.push(this._notionTextBlock('paragraph', aiText));
      }
    }
    if (j.schedule && j.schedule.length > 0) {
      const schedItems = j.schedule.filter(s => s.text || s.title);
      if (schedItems.length > 0) {
        blocks.push(this._notionHeading(3, '予定'));
        schedItems.forEach(s => blocks.push(this._notionBulletBlock(s.text || s.title)));
      }
    }
    if (j.timeSchedule) {
      blocks.push(this._notionHeading(3, 'タイムスケジュール'));
      blocks.push(this._notionTextBlock('paragraph', j.timeSchedule));
    }
    return blocks;
  },

  _notionExporting: false,

  async exportToNotion() {
    if (this._notionExporting) {
      this.showToast('エクスポート実行中です');
      return;
    }
    if (!this.data.settings.notionApiKey || !this.data.settings.notionPageId) {
      this.showToast('Notion APIキーとページIDを設定してください');
      return;
    }
    this._notionExporting = true;
    const rootPageId = this.data.settings.notionPageId;
    const errors = [];

    try {
      // 全データを1回だけ読み込み（進捗計算と実処理で共有）
      let totalSteps = 0, doneSteps = 0;
      const allJournals = await getAllData('journals');
      const allGoals = await getAllData('monthlyGoals');
      const months = new Set();
      allJournals.forEach(j => { if (j.date) months.add(j.date.substring(0, 7)); });
      allGoals.forEach(g => { if (g.yearMonth) months.add(g.yearMonth); });
      // 人生設計1 + 長期目標1 + 月ごと(月目標1 + 日誌N + ルーティン集計1)
      totalSteps += 2;
      months.forEach(ym => {
        totalSteps += 1;
        totalSteps += allJournals.filter(j => j.date && j.date.startsWith(ym)).length;
        totalSteps += 1;
      });
      const showProgress = (label) => {
        doneSteps++;
        this.showToast(`${doneSteps}/${totalSteps} ${label}`);
      };

      // === 人生設計 ===
      showProgress('人生設計');
      try {
        const lifeDesign = await getLifeDesign();
        if (lifeDesign && (lifeDesign.purpose || lifeDesign.meaning || (lifeDesign.ageGoals && lifeDesign.ageGoals.length > 0))) {
          const lifePageId = await this._notionGetOrCreatePage(rootPageId, '人生設計');
          const blocks = [];
          if (lifeDesign.purpose) { blocks.push(this._notionHeading(2, '目的')); blocks.push(this._notionTextBlock('paragraph', lifeDesign.purpose)); }
          if (lifeDesign.meaning) { blocks.push(this._notionHeading(2, '意味')); blocks.push(this._notionTextBlock('paragraph', lifeDesign.meaning)); }
          if (lifeDesign.ageGoals && lifeDesign.ageGoals.length > 0) {
            blocks.push(this._notionHeading(2, '年齢別目標'));
            lifeDesign.ageGoals.forEach(ag => {
              if (ag.age && ag.goal) blocks.push(this._notionTextBlock('paragraph', `${ag.age}歳: ${ag.goal}`));
            });
          }
          if (blocks.length > 0) await this._notionReplaceBlocks(lifePageId, blocks);
        }
      } catch (e) { errors.push('人生設計: ' + e.message); }

      // === 長期目標 ===
      showProgress('長期目標');
      try {
        const longTermGoals = await getAllData('longTermGoals');
        if (longTermGoals && longTermGoals.length > 0) {
          const ltPageId = await this._notionGetOrCreatePage(rootPageId, '長期目標');
          const blocks = [];

          // メイン → サブ → 独立の順に出力
          const mainGoal = longTermGoals.find(g => g.type === 'main');
          const subGoals = longTermGoals.filter(g => g.type === 'sub');
          const independentGoals = longTermGoals.filter(g => !g.type || (g.type !== 'main' && g.type !== 'sub'));

          const addGoalBlocks = (goal, prefix = '') => {
            const label = prefix ? `${prefix} ` : '';
            blocks.push(this._notionHeading(2, label + (goal.title || goal.goal || '長期目標')));
            if (goal.startYear && goal.startMonth && goal.deadlineYear && goal.deadlineMonth) {
              blocks.push(this._notionTextBlock('paragraph', `期間: ${goal.startYear}年${goal.startMonth}月 〜 ${goal.deadlineYear}年${goal.deadlineMonth}月`));
            } else if (goal.deadlineYear && goal.deadlineMonth) {
              blocks.push(this._notionTextBlock('paragraph', `期限: ${goal.deadlineYear}年${goal.deadlineMonth}月`));
            }
            if (goal.goal && goal.goal !== goal.title) blocks.push(this._notionTextBlock('paragraph', goal.goal));
            if (goal.reason) blocks.push(this._notionTextBlock('paragraph', `理由: ${goal.reason}`));
            if (goal.milestones && goal.milestones.length > 0) {
              blocks.push(this._notionHeading(3, 'マイルストーン'));
              goal.milestones.forEach(m => {
                if (m.goal) {
                  const dateStr = m.year && m.month ? `${m.year}年${m.month}月: ` : '';
                  blocks.push(this._notionTodoBlock(`${dateStr}${m.goal}`, false));
                }
              });
            }
            blocks.push(this._notionDivider());
          };

          if (mainGoal) {
            addGoalBlocks(mainGoal, '★メイン');
            subGoals.forEach(g => addGoalBlocks(g, '└ サブ'));
          }
          independentGoals.forEach(g => addGoalBlocks(g));
          if (blocks.length > 0) await this._notionReplaceBlocks(ltPageId, blocks);
        }
      } catch (e) { errors.push('長期目標: ' + e.message); }

      // === 月次データ ===
      const sortedMonths = [...months].sort().reverse();
      for (const ym of sortedMonths) {
        const [y, m] = ym.split('-');
        const monthLabel = `${y}年${parseInt(m)}月`;

        try {
          const monthPageId = await this._notionGetOrCreatePage(rootPageId, monthLabel);

          // 月目標
          showProgress(`${monthLabel} 月目標`);
          const goal = allGoals.find(g => g.yearMonth === ym);
          if (goal && goal.goal) {
            const goalPageId = await this._notionGetOrCreatePage(monthPageId, '月目標');
            const blocks = [this._notionTextBlock('paragraph', goal.goal)];
            if (goal.coreActions) {
              const coreLabels = { deadline: '期限付き', processing: '処理系', habit: '習慣', other: 'その他' };
              const hasCoreData = Object.entries(coreLabels).some(([key]) => goal.coreActions[key]);
              if (hasCoreData) {
                blocks.push(this._notionHeading(3, 'コアアクション'));
                Object.entries(coreLabels).forEach(([key, label]) => {
                  if (goal.coreActions[key]) blocks.push(this._notionBulletBlock(`${label}: ${goal.coreActions[key]}`));
                });
              }
            }
            if (goal.categories) {
              blocks.push(this._notionHeading(3, 'カテゴリ別目標'));
              const catNames = { rei: '霊', shin: '心', tai: '体', gi: '技', sei: '生活', other: 'その他' };
              Object.entries(goal.categories).forEach(([key, val]) => {
                if (val) blocks.push(this._notionBulletBlock(`${catNames[key] || key}: ${val}`));
              });
            }
            await this._notionReplaceBlocks(goalPageId, blocks);
          }

          // 日誌
          const monthJournals = allJournals.filter(j => j.date && j.date.startsWith(ym)).sort((a, b) => a.date.localeCompare(b.date));
          if (monthJournals.length > 0) {
            const journalPageId = await this._notionGetOrCreatePage(monthPageId, '日誌');
            for (const j of monthJournals) {
              showProgress(`${monthLabel} ${j.date}`);
              try {
                const title = j.title || j.date;
                const dayLabel = `${j.date} ${title}`;
                let dayPageId = await this._notionFindChildPage(journalPageId, dayLabel, j.date);
                if (!dayPageId) {
                  const page = await this._notionCreatePage(journalPageId, dayLabel);
                  dayPageId = page.id;
                }
                const blocks = this._buildJournalNotionBlocks(j);
                if (blocks.length > 0) await this._notionReplaceBlocks(dayPageId, blocks);
              } catch (e) {
                errors.push(`${monthLabel} ${j.date}: ${e.message}`);
              }
            }
          }

          // ルーティン集計
          showProgress(`${monthLabel} ルーティン集計`);
          const routineJournals = monthJournals.filter(j => j.routines && j.routines.length > 0);
          if (routineJournals.length > 0) {
            const routinePageId = await this._notionGetOrCreatePage(monthPageId, 'ルーティン集計');
            const routineNames = new Set();
            routineJournals.forEach(j => j.routines.forEach(r => { if (r.name) routineNames.add(r.name); }));
            const blocks = [];
            routineNames.forEach(name => {
              let done = 0, total = 0;
              routineJournals.forEach(j => {
                const r = j.routines.find(r => r.name === name);
                if (r) { total++; const rs = getRoutineStatus(r); if (rs === 'done') done++; else if (rs === 'partial') done += 0.5; }
              });
              const rate = total > 0 ? Math.round((done / total) * 100) : 0;
              blocks.push(this._notionTodoBlock(`${name}: ${done}/${total}（${rate}%）`, rate >= 80));
            });
            if (blocks.length > 0) await this._notionReplaceBlocks(routinePageId, blocks);
          }
        } catch (e) { errors.push(`${monthLabel}: ${e.message}`); }
      }

      if (errors.length > 0) {
        console.error('Notion export errors:', errors);
        const numbered = errors.map((e, i) => `${i + 1}. ${e}`).join('\n');
        this.showToast(`エクスポート完了（${errors.length}件エラー）\n${numbered}`, 5000);
      } else {
        this.showToast('Notionへのエクスポートが完了しました');
      }
    } catch (err) {
      console.error('Notion export fatal error:', err);
      this.showToast('エクスポートに失敗しました: ' + err.message);
    } finally {
      this._notionExporting = false;
    }
  },

  async syncJournalToNotion(journal) {
    if (!this.data.settings.notionApiKey || !this.data.settings.notionPageId || !journal || !journal.date) return;
    try {
      const rootPageId = this.data.settings.notionPageId;
      const ym = journal.date.substring(0, 7);
      const [y, m] = ym.split('-');
      const monthLabel = `${y}年${parseInt(m)}月`;
      const monthPageId = await this._notionGetOrCreatePage(rootPageId, monthLabel);
      const journalPageId = await this._notionGetOrCreatePage(monthPageId, '日誌');
      const title = journal.title || journal.date;
      const dayLabel = `${journal.date} ${title}`;
      let dayPageId = await this._notionFindChildPage(journalPageId, dayLabel, journal.date);
      if (!dayPageId) {
        const page = await this._notionCreatePage(journalPageId, dayLabel);
        dayPageId = page.id;
      }
      const blocks = this._buildJournalNotionBlocks(journal);
      if (blocks.length > 0) await this._notionReplaceBlocks(dayPageId, blocks);
      // ルーティン集計も更新
      if (journal.routines && journal.routines.length > 0) {
        this._syncRoutineSummaryToNotion(monthPageId, ym).catch(e => console.error('Routine summary sync error:', e));
      }
    } catch (err) {
      console.error('Notion日誌同期エラー:', err);
    }
  },

  async syncMonthlyGoalToNotion(monthlyGoal) {
    if (!this.data.settings.notionApiKey || !this.data.settings.notionPageId || !monthlyGoal || !monthlyGoal.yearMonth || !monthlyGoal.goal) return;
    try {
      const rootPageId = this.data.settings.notionPageId;
      const [y, m] = monthlyGoal.yearMonth.split('-');
      const monthLabel = `${y}年${parseInt(m)}月`;
      const monthPageId = await this._notionGetOrCreatePage(rootPageId, monthLabel);
      const goalPageId = await this._notionGetOrCreatePage(monthPageId, '月目標');
      const blocks = [this._notionTextBlock('paragraph', monthlyGoal.goal || '')];
      if (monthlyGoal.coreActions) {
        const coreLabels = { deadline: '期限付き', processing: '処理系', habit: '習慣', other: 'その他' };
        const hasCoreData = Object.entries(coreLabels).some(([key]) => monthlyGoal.coreActions[key]);
        if (hasCoreData) {
          blocks.push(this._notionHeading(3, 'コアアクション'));
          Object.entries(coreLabels).forEach(([key, label]) => {
            if (monthlyGoal.coreActions[key]) blocks.push(this._notionBulletBlock(`${label}: ${monthlyGoal.coreActions[key]}`));
          });
        }
      }
      if (monthlyGoal.categories) {
        blocks.push(this._notionHeading(3, 'カテゴリ別目標'));
        const catNames = { rei: '霊', shin: '心', tai: '体', gi: '技', sei: '生活', other: 'その他' };
        Object.entries(monthlyGoal.categories).forEach(([key, val]) => {
          if (val) blocks.push(this._notionBulletBlock(`${catNames[key] || key}: ${val}`));
        });
      }
      await this._notionReplaceBlocks(goalPageId, blocks);
    } catch (err) {
      console.error('Notion月目標同期エラー:', err);
    }
  },

  async syncLongTermGoalToNotion() {
    if (!this.data.settings.notionApiKey || !this.data.settings.notionPageId) return;
    try {
      const rootPageId = this.data.settings.notionPageId;
      const longTermGoals = await getAllData('longTermGoals');
      if (!longTermGoals || longTermGoals.length === 0) return;
      const ltPageId = await this._notionGetOrCreatePage(rootPageId, '長期目標');
      const blocks = [];

      const mainGoal = longTermGoals.find(g => g.type === 'main');
      const subGoals = longTermGoals.filter(g => g.type === 'sub');
      const independentGoals = longTermGoals.filter(g => !g.type || (g.type !== 'main' && g.type !== 'sub'));

      const addGoalBlocks = (goal, prefix = '') => {
        const label = prefix ? `${prefix} ` : '';
        blocks.push(this._notionHeading(2, label + (goal.title || goal.goal || '長期目標')));
        if (goal.startYear && goal.startMonth && goal.deadlineYear && goal.deadlineMonth) {
          blocks.push(this._notionTextBlock('paragraph', `期間: ${goal.startYear}年${goal.startMonth}月 〜 ${goal.deadlineYear}年${goal.deadlineMonth}月`));
        } else if (goal.deadlineYear && goal.deadlineMonth) {
          blocks.push(this._notionTextBlock('paragraph', `期限: ${goal.deadlineYear}年${goal.deadlineMonth}月`));
        }
        if (goal.goal && goal.goal !== goal.title) blocks.push(this._notionTextBlock('paragraph', goal.goal));
        if (goal.reason) blocks.push(this._notionTextBlock('paragraph', `理由: ${goal.reason}`));
        if (goal.milestones && goal.milestones.length > 0) {
          blocks.push(this._notionHeading(3, 'マイルストーン'));
          goal.milestones.forEach(ms => {
            if (ms.goal) {
              const dateStr = ms.year && ms.month ? `${ms.year}年${ms.month}月: ` : '';
              blocks.push(this._notionTodoBlock(`${dateStr}${ms.goal}`, false));
            }
          });
        }
        blocks.push(this._notionDivider());
      };

      if (mainGoal) {
        addGoalBlocks(mainGoal, '★メイン');
        subGoals.forEach(g => addGoalBlocks(g, '└ サブ'));
      }
      independentGoals.forEach(g => addGoalBlocks(g));

      if (blocks.length > 0) await this._notionReplaceBlocks(ltPageId, blocks);
    } catch (err) {
      console.error('Notion長期目標同期エラー:', err);
    }
  },

  async _syncRoutineSummaryToNotion(monthPageId, yearMonth) {
    const allJournals = await getMonthJournals(yearMonth);
    const routineJournals = allJournals.filter(j => j.routines && j.routines.length > 0);
    if (routineJournals.length === 0) return;
    const routinePageId = await this._notionGetOrCreatePage(monthPageId, 'ルーティン集計');
    const routineNames = new Set();
    routineJournals.forEach(j => j.routines.forEach(r => { if (r.name) routineNames.add(r.name); }));
    const blocks = [];
    routineNames.forEach(name => {
      let done = 0, total = 0;
      routineJournals.forEach(j => {
        const r = j.routines.find(r => r.name === name);
        if (r) {
          // 曜日フィルタ: その日にアクティブでないルーティンはスキップ
          if (r.weekDays && r.weekDays.length > 0 && j.date) {
            const dow = new Date(j.date + 'T00:00:00').getDay();
            if (!r.weekDays.includes(dow)) return;
          }
          total++;
          const rs = getRoutineStatus(r);
          if (rs === 'done') done++;
          else if (rs === 'partial') done += 0.5;
        }
      });
      const rate = total > 0 ? Math.round((done / total) * 100) : 0;
      blocks.push(this._notionTodoBlock(`${name}: ${done}/${total}（${rate}%）`, rate >= 80));
    });
    if (blocks.length > 0) await this._notionReplaceBlocks(routinePageId, blocks);
  },

  async setFboxStyle(style) {
    await saveSetting('fboxStyle', style);
    this.data.settings.fboxStyle = style;
    this.closeModalDirect();
    this.render();
    this.showToast(`F・BOXスタイル: パターン${style}`);
  },

  // F・BOX未処理一覧を開く
  openFirstBoxList() {
    this.navigate('firstbox-list');
  },

  // F・BOX整理開始（最初のアイテムから振り分け）
  startFirstBoxOrganize() {
    const items = this.firstBoxItems || [];
    if (items.length === 0) return;
    this.startFirstBoxSort(items[0].id);
  },

  // パターンB：入力欄からそのまま振り分けフローへ
  quickSortFromInput() {
    const input = document.getElementById('firstboxQuickInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      this.showToast('内容を入力してください');
      return;
    }
    this.firstBoxStep = 'q1';
    this.firstBoxInput = text;
    this.firstBoxResult = '';
    this.firstBoxSortingId = null;
    this.navigate('firstbox');
  },

  // F・BOXアイテム削除（個別・confirm付き：既存互換）
  async deleteFirstBoxItemById(id) {
    if (!confirm('このメモを削除しますか？')) return;
    await deleteFirstBoxItem(id);
    await this.loadFirstBoxItems();
    this.render();
    this.showToast('削除しました');
  },

  // F・BOXアイテム チェック完了（ワンタップ削除＋undo）
  async checkFirstBoxItem(id) {
    const item = this.firstBoxItems.find(i => i.id === id);
    if (!item) return;
    const backup = { ...item };
    await deleteFirstBoxItem(id);
    await this.loadFirstBoxItems();
    this.render();
    this.showToast('完了しました', 4000, {
      label: '元に戻す',
      callback: async () => {
        await saveData('firstbox', backup);
        await this.loadFirstBoxItems();
        this.render();
      }
    });
  },

  // ========== タスク管理 ==========
  taskItems: [],
  currentGTDTab: 'firstbox',
  currentTaskTab: 'urgent',

  async loadTasks() {
    this.taskItems = await getAllTasks();
  },

  getTasksByTab(type) {
    return this.taskItems.filter(t => t.type === type);
  },

  switchGTDTab(tab) {
    this.currentGTDTab = tab;
    this._keepScrollPosition = 0;
    this.render();
    delete this._keepScrollPosition;
    if (tab === 'task') this.scrollTaskTabToCenter();
    if (tab === 'routine') this.scrollRoutineTabToCenter();
  },

  // ノートビュー切り替え
  dashboardView: 'dashboard',

  openNoteView() {
    this.navigate('note-view');
  },

  openRoutineNoteView() {
    this.navigate('routine-note-view');
  },

  setDashboardView(view) {
    this.dashboardView = view;
    this._keepScrollPosition = 0;
    this.render();
    delete this._keepScrollPosition;
  },

  scrollToDashSection(id) {
    const section = document.getElementById('dash-' + id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  routineNoteViewAddItem(groupId) {
    this.showAddRoutineModal(groupId);
  },

  toggleNoteViewSection(index) {
    if (this._lastLongPressTime && Date.now() - this._lastLongPressTime < 300) return;
    if (!this.noteViewCollapsed) this.noteViewCollapsed = {};
    this.noteViewCollapsed[index] = !this.noteViewCollapsed[index];
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },



  noteViewAddItem(groupId) {
    if (groupId === 'fbox') {
      this._fboxReturnPage = 'note-view';
      this.firstBoxInput = '';
      this.firstBoxResult = '';
      this.firstBoxSortingId = null;
      this.navigate('firstbox');
      return;
    }
    const taskTypes = ['urgent', 'action', 'calendar', 'project', 'waiting', 'wish'];
    if (taskTypes.includes(groupId)) {
      this.showAddTaskModal(groupId);
    } else {
      this.showAddTaskModal('action');
    }
  },

  switchTaskTab(tab) {
    this.currentTaskTab = tab;
    this._keepScrollPosition = 0;
    this.render();
    delete this._keepScrollPosition;
    this.scrollTaskTabToCenter();
  },

  scrollTaskTabToCenter() {
    setTimeout(() => {
      const tabBar = document.querySelector('.task-tab-bar');
      const activeTab = tabBar?.querySelector('.task-tab.active');
      if (!tabBar || !activeTab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = tabBar.scrollLeft + (tabRect.left - barRect.left) - (barRect.width / 2) + (tabRect.width / 2);
      tabBar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 10);
  },

  // タスク追加モーダルを表示
  showAddTaskModal(type) {
    const typeLabel = {
      urgent: 'すぐやる',
      action: 'アクションリスト',
      project: 'プロジェクト',
      waiting: '待機リスト',
      calendar: 'カレンダー',
      wish: 'いつかやりたい'
    }[type || this.currentTaskTab];

    const currentType = type || this.currentTaskTab;
    let fieldsHTML = '';

    if (currentType === 'project') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">プロジェクト名</div>
          <input type="text" class="modal-input" id="taskTitleInput" placeholder="プロジェクト名" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">完了条件（必須）${fieldHelpIcon('task-condition')}</div>
          <input type="text" class="modal-input" id="taskConditionInput" placeholder="何をもって完了とするか" autocomplete="off">
        </div>
      `;
    } else if (currentType === 'waiting') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" placeholder="何を待っているか" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">誰に${fieldHelpIcon('task-who')}</div>
          <input type="text" class="modal-input" id="taskWhoInput" placeholder="相手の名前" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">いつまでに${fieldHelpIcon('task-deadline')}</div>
          <input type="date" class="modal-input" id="taskDeadlineInput">
        </div>
      `;
    } else if (currentType === 'calendar') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" placeholder="予定の内容" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">日時</div>
          <input type="datetime-local" class="modal-input" id="taskDateTimeInput">
        </div>
      `;
    } else {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" placeholder="やること" autocomplete="off">
        </div>
      `;
    }

    const showMotivation = currentType === 'urgent' || currentType === 'action' || currentType === 'project';

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">${typeLabel}に追加${fieldHelpIcon('task-' + currentType)}</div>
          ${fieldsHTML}
          <details class="modal-details">
            <summary>オプション</summary>
            ${showMotivation ? `
              <div class="modal-notes-section">
                <div class="modal-notes-label">動機付け（任意）${fieldHelpIcon('task-motivation')}</div>
                <textarea class="modal-input" id="taskMotivationInput" placeholder="先延ばし防止：やった時に得られるもの／やらなかった時に失うもの" rows="2"></textarea>
              </div>
            ` : ''}
            <div class="modal-notes-section">
              <div class="modal-notes-label">実施時間${fieldHelpIcon('time-range')}</div>
              <div style="display:flex;gap:8px;">
                <input type="time" class="modal-input" id="taskTimeStartInput" style="flex:1;margin-bottom:0;">
                <span style="align-self:center;color:var(--text-muted,#999);">〜</span>
                <input type="time" class="modal-input" id="taskTimeEndInput" style="flex:1;margin-bottom:0;">
              </div>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">区分${fieldHelpIcon('scope')}</div>
              <select class="modal-input" id="taskScopeInput">
                <option value="">なし</option>
                <option value="personal">個人</option>
                <option value="social">社会</option>
              </select>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">メモ</div>
              <textarea class="modal-input modal-notes" id="taskNotesInput" placeholder="補足情報..." rows="2"></textarea>
            </div>
          </details>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveNewTask('${currentType}')">追加</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    setTimeout(() => {
      const input = document.getElementById('taskTitleInput');
      if (input) input.focus();
    }, 100);
  },

  async saveNewTask(type) {
    const titleInput = document.getElementById('taskTitleInput');
    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      this.showToast('内容を入力してください');
      return;
    }

    const extra = {};
    const notesInput = document.getElementById('taskNotesInput');
    if (notesInput && notesInput.value.trim()) {
      extra.notes = notesInput.value.trim();
    }

    if (type === 'project') {
      const condInput = document.getElementById('taskConditionInput');
      extra.completionCriteria = condInput ? condInput.value.trim() : '';
    } else if (type === 'waiting') {
      const whoInput = document.getElementById('taskWhoInput');
      const deadlineInput = document.getElementById('taskDeadlineInput');
      extra.who = whoInput ? whoInput.value.trim() : '';
      extra.deadline = deadlineInput ? deadlineInput.value : '';
    } else if (type === 'calendar') {
      const dtInput = document.getElementById('taskDateTimeInput');
      extra.dateTime = dtInput ? dtInput.value : '';
    }

    const timeStartInput = document.getElementById('taskTimeStartInput');
    const timeEndInput = document.getElementById('taskTimeEndInput');
    const scopeInput = document.getElementById('taskScopeInput');
    const motivationInput = document.getElementById('taskMotivationInput');
    if (timeStartInput && timeStartInput.value) extra.timeStart = timeStartInput.value;
    if (timeEndInput && timeEndInput.value) extra.timeEnd = timeEndInput.value;
    if (scopeInput && scopeInput.value) extra.scope = scopeInput.value;
    if (motivationInput && motivationInput.value.trim()) extra.motivation = motivationInput.value.trim();

    const allowedTypes = ['urgent','action','project','waiting','calendar','wish'];
    const safeType = allowedTypes.includes(type) ? type : 'action';
    const taskData = createTaskData(safeType, title, extra);
    // サブタスク追加時はparentIdを設定
    if (this._addSubtaskParentId) {
      const parent = this.taskItems.find(t => t.id === this._addSubtaskParentId);
      if (parent) {
        taskData.parentId = this._addSubtaskParentId;
        taskData.type = parent.type;
      }
      delete this._addSubtaskParentId;
    }
    const savedId = await saveTask(taskData);
    await this.loadTasks();
    // auto-send: IDで正確にタスクを取得してGcal自動送信（awaitしない=UIブロック防止）
    const savedTask = this.taskItems.find(t => t.id === savedId);
    if (savedTask) this._autoSendToGcal(savedTask).then(() => this.loadTasks().then(() => this.render()));
    this.closeModalDirect();
    this.render();
    this.showToast('追加しました');
  },

  // サブタスク追加モーダルを表示
  showAddSubtaskModal(parentId) {
    this._addSubtaskParentId = parentId;
    const parent = this.taskItems.find(t => t.id === parentId);
    const allowedTypes = ['urgent','action','project','waiting','calendar','wish'];
    const safeType = (parent && allowedTypes.includes(parent.type)) ? parent.type : 'action';

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">サブタスクを追加</div>
          <div class="modal-notes-section">
            <div class="modal-notes-label">親タスク: ${escapeHtml(parent?.title || '')}</div>
          </div>
          <div class="modal-notes-section">
            <div class="modal-notes-label">内容</div>
            <input type="text" class="modal-input" id="taskTitleInput" placeholder="サブタスクの内容" autocomplete="off">
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveNewTask('${safeType}')">追加</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    setTimeout(() => {
      const input = document.getElementById('taskTitleInput');
      if (input) input.focus();
    }, 100);
  },

  async toggleTaskStatus(id) {
    const task = this.taskItems.find(t => t.id === id);
    if (!task) return;
    const current = task.status || 'open';
    if (current === 'done') {
      // 完了 → 未着手に戻す
      task.status = 'open';
      await saveTask(task);
      await this.loadTasks();
      this.render();
    } else {
      // 未完了 → 即完了 + 元に戻すトースト
      const prevStatus = 'open';
      task.status = 'done';
      await saveTask(task);
      await this.loadTasks();
      this.render();
      this.showUndoToast(id, prevStatus);
    }
  },

  async setTaskStatus(id, newStatus) {
    const task = this.taskItems.find(t => t.id === id);
    if (!task) return;
    const prevStatus = task.status || 'open';
    task.status = newStatus;
    await saveTask(task);
    await this.loadTasks();
    this.render();

    // 完了時のみトースト表示（元に戻す機能付き）
    if (newStatus === 'done') {
      this.showUndoToast(id, prevStatus);
    }
  },

  // トースト通知（元に戻す付き）
  _undoToastTimer: null,

  showUndoToast(taskId, prevStatus) {
    // 既存トーストがあればクリア
    this.hideUndoToast();

    const safeId = parseInt(taskId, 10);
    if (isNaN(safeId)) return;
    const allowedStatuses = ['open', 'in_progress', 'done'];
    const safePrev = allowedStatuses.includes(prevStatus) ? prevStatus : 'open';

    const toast = document.createElement('div');
    toast.className = 'nvb-toast';
    toast.id = 'undoToast';
    toast.innerHTML = `
      <span class="nvb-toast-msg">タスクを完了しました</span>
      <button class="nvb-toast-undo" onclick="app.undoTaskComplete(${safeId}, '${safePrev}')">元に戻す</button>
    `;
    document.body.appendChild(toast);

    // アニメーション用に少し遅延してクラス追加
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    // 5秒後に自動非表示
    this._undoToastTimer = setTimeout(() => {
      this.hideUndoToast();
    }, 5000);
  },

  hideUndoToast() {
    if (this._undoToastTimer) {
      clearTimeout(this._undoToastTimer);
      this._undoToastTimer = null;
    }
    const toast = document.getElementById('undoToast');
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  },

  async undoTaskComplete(taskId, prevStatus) {
    this.hideUndoToast();
    const task = this.taskItems.find(t => t.id === taskId);
    if (!task) return;
    task.status = prevStatus;
    await saveTask(task);
    await this.loadTasks();
    this.render();
  },

  async deleteTaskById(id) {
    if (!confirm('このタスクを削除しますか？')) return;
    // 子タスクのparentIdをnullに昇格（孤児防止）
    const children = this.taskItems.filter(t => t.parentId === id);
    for (const child of children) {
      child.parentId = null;
      await saveTask(child);
    }
    await deleteTask(id);
    await this.loadTasks();
    this.render();
    this.showToast('削除しました');
  },

  // タスク編集モーダル
  async showEditTaskModal(id) {
    const task = this.taskItems.find(t => t.id === id);
    if (!task) return;

    const typeLabel = {
      urgent: 'すぐやる',
      action: 'アクションリスト',
      project: 'プロジェクト',
      waiting: '待機リスト',
      calendar: 'カレンダー',
      wish: 'いつかやりたい'
    }[task.type];

    const esc = (s) => escapeHtml(s || '');
    let fieldsHTML = '';

    if (task.type === 'project') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">プロジェクト名</div>
          <input type="text" class="modal-input" id="taskTitleInput" value="${esc(task.title)}" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">完了条件${fieldHelpIcon('task-condition')}</div>
          <input type="text" class="modal-input" id="taskConditionInput" value="${esc(task.completionCriteria)}" placeholder="何をもって完了とするか" autocomplete="off">
        </div>
      `;
    } else if (task.type === 'waiting') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" value="${esc(task.title)}" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">誰に${fieldHelpIcon('task-who')}</div>
          <input type="text" class="modal-input" id="taskWhoInput" value="${esc(task.who)}" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">いつまでに${fieldHelpIcon('task-deadline')}</div>
          <input type="date" class="modal-input" id="taskDeadlineInput" value="${task.deadline || ''}">
        </div>
      `;
    } else if (task.type === 'calendar') {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" value="${esc(task.title)}" autocomplete="off">
        </div>
        <div class="modal-notes-section">
          <div class="modal-notes-label">日時</div>
          <input type="datetime-local" class="modal-input" id="taskDateTimeInput" value="${task.dateTime || ''}">
        </div>
      `;
    } else {
      fieldsHTML = `
        <div class="modal-notes-section">
          <div class="modal-notes-label">内容</div>
          <input type="text" class="modal-input" id="taskTitleInput" value="${esc(task.title)}" autocomplete="off">
        </div>
      `;
    }

    const showMotivation = task.type === 'urgent' || task.type === 'action' || task.type === 'project';

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">${typeLabel}を編集${fieldHelpIcon('task-' + task.type)}</div>
          ${fieldsHTML}
          ${showMotivation ? `
            <div class="modal-notes-section">
              <div class="modal-notes-label">動機付け（任意）${fieldHelpIcon('task-motivation')}</div>
              <textarea class="modal-input" id="taskMotivationInput" placeholder="先延ばし防止：やった時に得られるもの／やらなかった時に失うもの" rows="2">${esc(task.motivation)}</textarea>
            </div>
          ` : ''}
          <div class="modal-notes-section">
            <div class="modal-notes-label">実施時間${fieldHelpIcon('time-range')}</div>
            <div style="display:flex;gap:8px;">
              <input type="time" class="modal-input" id="taskTimeStartInput" value="${task.timeStart || ''}" style="flex:1;margin-bottom:0;">
              <span style="align-self:center;color:var(--text-muted,#999);">〜</span>
              <input type="time" class="modal-input" id="taskTimeEndInput" value="${task.timeEnd || ''}" style="flex:1;margin-bottom:0;">
            </div>
          </div>
          <div class="modal-notes-section">
            <div class="modal-notes-label">区分${fieldHelpIcon('scope')}</div>
            <select class="modal-input" id="taskScopeInput">
              <option value="">なし</option>
              <option value="personal" ${task.scope === 'personal' ? 'selected' : ''}>個人</option>
              <option value="social" ${task.scope === 'social' ? 'selected' : ''}>社会</option>
            </select>
          </div>
          <div class="modal-notes-section">
            <div class="modal-notes-label">メモ</div>
            <textarea class="modal-input modal-notes" id="taskNotesInput" placeholder="補足情報..." rows="2">${esc(task.notes)}</textarea>
          </div>
          ${this.firebaseUser ? `
          <div class="gcal-send-section">
            <button class="gcal-send-btn" onclick="app.sendToGoogleCalendar(${id})">
              ${getIcon('calendar')} Googleカレンダーに${task.gcalEventId ? '更新' : '送信'}
            </button>
            ${task.gcalEventId ? '<span class="gcal-sent-badge">送信済み</span>' : ''}
          </div>
          ` : ''}
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.updateTask(${id})">保存</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async updateTask(id) {
    const task = this.taskItems.find(t => t.id === id);
    if (!task) return;

    const titleInput = document.getElementById('taskTitleInput');
    task.title = titleInput ? titleInput.value.trim() : task.title;

    const notesInput = document.getElementById('taskNotesInput');
    task.notes = notesInput ? notesInput.value.trim() : (task.notes || '');

    if (task.type === 'project') {
      const condInput = document.getElementById('taskConditionInput');
      task.completionCriteria = condInput ? condInput.value.trim() : '';
    } else if (task.type === 'waiting') {
      const whoInput = document.getElementById('taskWhoInput');
      const deadlineInput = document.getElementById('taskDeadlineInput');
      task.who = whoInput ? whoInput.value.trim() : '';
      task.deadline = deadlineInput ? deadlineInput.value : '';
    } else if (task.type === 'calendar') {
      const dtInput = document.getElementById('taskDateTimeInput');
      task.dateTime = dtInput ? dtInput.value : '';
    }

    const timeStartInput = document.getElementById('taskTimeStartInput');
    const timeEndInput = document.getElementById('taskTimeEndInput');
    const scopeInput = document.getElementById('taskScopeInput');
    task.timeStart = timeStartInput ? timeStartInput.value : (task.timeStart || '');
    task.timeEnd = timeEndInput ? timeEndInput.value : (task.timeEnd || '');
    task.scope = scopeInput ? scopeInput.value : (task.scope || '');

    const motivationInput = document.getElementById('taskMotivationInput');
    if (motivationInput) task.motivation = motivationInput.value.trim();

    await saveTask(task);
    await this.loadTasks();
    // auto-send: loadTasks後の最新参照でGcal自動送信（awaitしない=UIブロック防止）
    const freshTask = this.taskItems.find(t => t.id === task.id);
    if (freshTask) this._autoSendToGcal(freshTask).then(() => this.loadTasks().then(() => this.render()));
    this.closeModalDirect();
    this.render();
    this.showToast('更新しました');
  },

  // ========== ルーティン管理 ==========
  routineItems: [],
  currentRoutineTab: 'goal',

  async loadRoutines() {
    this.routineItems = await getAllRoutines();
  },

  getRoutinesByTab(type) {
    return this.routineItems.filter(r => r.type === type);
  },

  switchRoutineTab(tab) {
    this.currentRoutineTab = tab;
    this._keepScrollPosition = 0;
    this.render();
    delete this._keepScrollPosition;
    this.scrollRoutineTabToCenter();
  },

  scrollRoutineTabToCenter() {
    setTimeout(() => {
      const tabBar = document.querySelector('.routine-tab-bar');
      const activeTab = tabBar?.querySelector('.routine-tab.active');
      if (!tabBar || !activeTab) return;
      const barRect = tabBar.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const scrollLeft = tabBar.scrollLeft + (tabRect.left - barRect.left) - (barRect.width / 2) + (tabRect.width / 2);
      tabBar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 10);
  },

  showAddRoutineModal(type) {
    const typeLabel = {
      goal: '目標', obligation: '義務', maintenance: '維持',
      principle: '指針', candidate: '候補'
    }[type || this.currentRoutineTab];

    const currentType = type || this.currentRoutineTab;
    let fieldsHTML = `
      <div class="modal-notes-section">
        <div class="modal-notes-label">ルーティン名</div>
        <input type="text" class="modal-input" id="routineTitleInput" placeholder="ルーティン名" autocomplete="off">
      </div>
    `;

    if (currentType === 'obligation' || currentType === 'maintenance') {
      fieldsHTML += `
        <div class="modal-notes-section">
          <div class="modal-notes-label">次回期限</div>
          <input type="date" class="modal-input" id="routineNextDateInput">
        </div>
      `;
    }

    const motivationRequired = currentType === 'goal';

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">${typeLabel}ルーティンを追加${fieldHelpIcon('routine-' + currentType)}</div>
          ${fieldsHTML}
          ${motivationRequired ? `
            <div class="modal-notes-section">
              <div class="modal-notes-label">①動機付け（必須）${fieldHelpIcon('core-motivation')}</div>
              <textarea class="modal-input" id="routineMotivationInput" placeholder="〇→やった時に得られるもの&#10;×→やらなかった時に失うもの" rows="3"></textarea>
            </div>
          ` : ''}
          <details class="modal-details">
            <summary>5コア設定${motivationRequired ? '（残り4コア）' : ''}</summary>
            ${!motivationRequired ? `
              <div class="modal-notes-section">
                <div class="modal-notes-label">①動機付け（任意）${fieldHelpIcon('core-motivation')}</div>
                <textarea class="modal-input" id="routineMotivationInput" placeholder="〇→やった時に得られるもの&#10;×→やらなかった時に失うもの" rows="2"></textarea>
              </div>
            ` : ''}
            <div class="modal-notes-section">
              <div class="modal-notes-label">②条件反射${fieldHelpIcon('core-trigger')}</div>
              <textarea class="modal-input" id="routineTriggerInput" placeholder="〇〇のとき〇〇を行う" rows="2"></textarea>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">③マニュアル${fieldHelpIcon('core-manual')}</div>
              <textarea class="modal-input" id="routineManualInput" placeholder="具体的な動き・道具・時間" rows="2"></textarea>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">④前準備${fieldHelpIcon('core-preparation')}</div>
              <textarea class="modal-input" id="routinePreparationInput" placeholder="〇時までに〇〇を終わらせる" rows="2"></textarea>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">⑤最低限設定${fieldHelpIcon('core-minimum')}</div>
              <textarea class="modal-input" id="routineMinimumInput" placeholder="忙しい時の最小バージョン" rows="2"></textarea>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">区分${fieldHelpIcon('scope')}</div>
              <select class="modal-input" id="routineScopeInput">
                <option value="">なし</option>
                <option value="personal">個人</option>
                <option value="social">社会</option>
              </select>
            </div>
            <div class="modal-notes-section">
              <div class="modal-notes-label">メモ</div>
              <textarea class="modal-input modal-notes" id="routineNotesInput" placeholder="補足情報..." rows="2"></textarea>
            </div>
          </details>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveNewRoutine('${currentType}')">追加</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    setTimeout(() => {
      const input = document.getElementById('routineTitleInput');
      if (input) input.focus();
    }, 100);
  },

  async saveNewRoutine(type) {
    const titleInput = document.getElementById('routineTitleInput');
    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      this.showToast('ルーティン名を入力してください');
      return;
    }

    const extra = {};
    const notesInput = document.getElementById('routineNotesInput');
    if (notesInput && notesInput.value.trim()) {
      extra.notes = notesInput.value.trim();
    }

    if (type === 'obligation' || type === 'maintenance') {
      const dateInput = document.getElementById('routineNextDateInput');
      extra.nextDate = dateInput ? dateInput.value : '';
    }

    const scopeInput = document.getElementById('routineScopeInput');
    if (scopeInput && scopeInput.value) extra.scope = scopeInput.value;

    // 5コア
    const motivationInput = document.getElementById('routineMotivationInput');
    const triggerInput = document.getElementById('routineTriggerInput');
    const manualInput = document.getElementById('routineManualInput');
    const prepInput = document.getElementById('routinePreparationInput');
    const minInput = document.getElementById('routineMinimumInput');
    if (motivationInput && motivationInput.value.trim()) extra.motivation = motivationInput.value.trim();
    if (triggerInput && triggerInput.value.trim()) extra.trigger = triggerInput.value.trim();
    if (manualInput && manualInput.value.trim()) extra.routineManual = manualInput.value.trim();
    if (prepInput && prepInput.value.trim()) extra.preparation = prepInput.value.trim();
    if (minInput && minInput.value.trim()) extra.minimumSetting = minInput.value.trim();

    // 目標ルーティンは動機付け必須
    if (type === 'goal' && !extra.motivation) {
      this.showToast('目標ルーティンは動機付けが必須です');
      return;
    }

    await saveRoutine(createRoutineData(type, title, extra));
    await this.loadRoutines();
    this.closeModalDirect();
    this.render();
    this.showToast('追加しました');
  },

  async toggleRoutineStatus(id) {
    const routine = this.routineItems.find(r => r.id === id);
    if (!routine) return;
    const current = routine.status || 'open';
    if (current === 'done') {
      routine.status = 'open';
    } else {
      routine.status = 'done';
    }
    await saveRoutine(routine);
    await this.loadRoutines();
    this.render();
  },

  async deleteRoutineById(id) {
    if (!confirm('このルーティンを削除しますか？')) return;
    await deleteRoutine(id);
    await this.loadRoutines();
    this.render();
    this.showToast('削除しました');
  },

  async showEditRoutineModal(id) {
    const routine = this.routineItems.find(r => r.id === id);
    if (!routine) return;

    const typeLabel = {
      goal: '目標', obligation: '義務', maintenance: '維持',
      principle: '指針', candidate: '候補'
    }[routine.type];

    let fieldsHTML = `
      <input type="text" class="modal-input" id="routineTitleInput" value="${escapeHtml(routine.title || '')}" autocomplete="off">
    `;

    if (routine.type === 'obligation' || routine.type === 'maintenance') {
      fieldsHTML += `
        <input type="date" class="modal-input" id="routineNextDateInput" value="${routine.nextDate || ''}" style="margin-top:8px;">
      `;
    }

    const esc = (s) => escapeHtml(s || '');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">${typeLabel}ルーティンを編集${fieldHelpIcon('routine-' + routine.type)}</div>
          ${fieldsHTML}
          <div class="modal-notes-section" style="margin-top:12px;">
            <div class="modal-notes-label">①動機付け${routine.type === 'goal' ? '（必須）' : ''}${fieldHelpIcon('core-motivation')}</div>
            <textarea class="modal-input" id="routineMotivationInput" placeholder="やった時に得られるもの／やらなかった時に失うもの" rows="2">${esc(routine.motivation)}</textarea>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">②条件反射${fieldHelpIcon('core-trigger')}</div>
            <textarea class="modal-input" id="routineTriggerInput" placeholder="〇〇のとき〇〇を行う" rows="2">${esc(routine.trigger)}</textarea>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">③マニュアル${fieldHelpIcon('core-manual')}</div>
            <textarea class="modal-input" id="routineManualInput" placeholder="具体的な動き・道具・時間" rows="2">${esc(routine.routineManual)}</textarea>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">④前準備${fieldHelpIcon('core-preparation')}</div>
            <textarea class="modal-input" id="routinePreparationInput" placeholder="〇時までに〇〇を終わらせる" rows="2">${esc(routine.preparation)}</textarea>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">⑤最低限設定${fieldHelpIcon('core-minimum')}</div>
            <textarea class="modal-input" id="routineMinimumInput" placeholder="忙しい時の最小バージョン" rows="2">${esc(routine.minimumSetting)}</textarea>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">区分${fieldHelpIcon('scope')}</div>
            <select class="modal-input" id="routineScopeInput">
              <option value="">なし</option>
              <option value="personal" ${routine.scope === 'personal' ? 'selected' : ''}>個人</option>
              <option value="social" ${routine.scope === 'social' ? 'selected' : ''}>社会</option>
            </select>
          </div>
          <div class="modal-notes-section" style="margin-top:8px;">
            <div class="modal-notes-label">メモ</div>
            <textarea class="modal-input modal-notes" id="routineNotesInput" placeholder="メモ・補足情報..." rows="2">${esc(routine.notes)}</textarea>
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.updateRoutine(${id})">保存</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async updateRoutine(id) {
    const routine = this.routineItems.find(r => r.id === id);
    if (!routine) return;

    const titleInput = document.getElementById('routineTitleInput');
    routine.title = titleInput ? titleInput.value.trim() : routine.title;

    const notesInput = document.getElementById('routineNotesInput');
    routine.notes = notesInput ? notesInput.value.trim() : (routine.notes || '');

    if (routine.type === 'obligation' || routine.type === 'maintenance') {
      const dateInput = document.getElementById('routineNextDateInput');
      routine.nextDate = dateInput ? dateInput.value : '';
    }

    const scopeInput = document.getElementById('routineScopeInput');
    routine.scope = scopeInput ? scopeInput.value : (routine.scope || '');

    // 5コア
    const motivationInput = document.getElementById('routineMotivationInput');
    const triggerInput = document.getElementById('routineTriggerInput');
    const manualInput = document.getElementById('routineManualInput');
    const prepInput = document.getElementById('routinePreparationInput');
    const minInput = document.getElementById('routineMinimumInput');
    routine.motivation = motivationInput ? motivationInput.value.trim() : (routine.motivation || '');
    routine.trigger = triggerInput ? triggerInput.value.trim() : (routine.trigger || '');
    routine.routineManual = manualInput ? manualInput.value.trim() : (routine.routineManual || '');
    routine.preparation = prepInput ? prepInput.value.trim() : (routine.preparation || '');
    routine.minimumSetting = minInput ? minInput.value.trim() : (routine.minimumSetting || '');

    // 目標ルーティンは動機付け必須
    if (routine.type === 'goal' && !routine.motivation) {
      this.showToast('目標ルーティンは動機付けが必須です');
      return;
    }

    await saveRoutine(routine);
    await this.loadRoutines();
    this.closeModalDirect();
    this.render();
    this.showToast('更新しました');
  },

  // ========== 資料管理 ==========
  materialItems: [],
  _selectedMaterialFile: null,
  _viewingMaterial: null,
  _viewingMaterialBlobUrl: null,

  async loadMaterials() {
    this.materialItems = await getAllMaterials();
  },

  startAddMaterial() {
    this._selectedMaterialFile = null;
    this.navigate('material-add');
  },

  onMaterialFileSelected() {
    const fileInput = document.getElementById('materialFileInput');
    const nameEl = document.getElementById('materialFileName');
    const previewEl = document.getElementById('materialFilePreview');
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 50 * 1024 * 1024) {
        this.showToast('50MBを超えるファイルは保存できません');
        fileInput.value = '';
        return;
      }
      this._selectedMaterialFile = file;
      if (nameEl) {
        const kb = Math.round(file.size / 1024);
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
        nameEl.textContent = `${file.name}（${sizeStr}）`;
      }
      if (previewEl && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => { previewEl.innerHTML = `<img src="${e.target.result}" class="material-add-preview-img">`; };
        reader.readAsDataURL(file);
      }
    }
  },

  removeMaterialFile() {
    this._selectedMaterialFile = null;
    const nameEl = document.getElementById('materialFileName');
    const previewEl = document.getElementById('materialFilePreview');
    const fileInput = document.getElementById('materialFileInput');
    if (nameEl) nameEl.textContent = '';
    if (previewEl) previewEl.innerHTML = '';
    if (fileInput) fileInput.value = '';
    document.getElementById('materialFileArea').classList.remove('has-file');
  },

  async saveNewMaterial() {
    const titleInput = document.getElementById('materialTitleInput');
    const contentInput = document.getElementById('materialContentInput');
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value : '';

    if (!title && !content && !this._selectedMaterialFile) {
      this.showToast('何か入力してください');
      return;
    }

    const extra = { content };

    if (this._selectedMaterialFile) {
      try {
        const file = this._selectedMaterialFile;
        const arrayBuffer = await file.arrayBuffer();
        extra.fileData = arrayBuffer;
        extra.fileName = file.name;
        extra.mimeType = file.type;
        extra.fileSize = file.size;
      } catch (e) {
        this.showToast('ファイルの読み込みに失敗: ' + e.message);
        return;
      }
      this._selectedMaterialFile = null;
    }

    try {
      await saveMaterial(createMaterialData(title, extra));
      await this.loadMaterials();
      this.navigate('material-list');
      this.showToast('保存しました');
    } catch (e) {
      this.showToast('保存に失敗: ' + e.message);
    }
  },

  async deleteMaterialById(id) {
    const item = this.materialItems.find(m => m.id === id);
    if (item && item.fileData && !confirm('この資料を削除しますか？元に戻せません。')) return;
    await deleteMaterial(id);
    await this.loadMaterials();
    this.render();
    this.showToast('削除しました');
  },

  openMaterial(id) {
    const item = this.materialItems.find(m => m.id === id);
    if (!item) return;

    this._materialReturnPage = this.currentPage;
    this._viewingMaterial = item;
    if (item.fileData) {
      try {
        const blob = new Blob([item.fileData], { type: item.mimeType });
        this._viewingMaterialBlobUrl = URL.createObjectURL(blob);
      } catch (e) {
        this._viewingMaterialBlobUrl = null;
      }
    }
    this.navigate('material-view');
  },

  cleanupMaterialBlobUrl() {
    if (this._viewingMaterialBlobUrl) {
      URL.revokeObjectURL(this._viewingMaterialBlobUrl);
      this._viewingMaterialBlobUrl = null;
    }
    this._viewingMaterial = null;
  },

  // 戻るジェスチャー対応の初期化
  initHistoryNavigation() {
    // 初期状態を履歴に追加
    history.replaceState({ page: 'home' }, '', '#home');

    // 戻る/進むボタン・ジェスチャーの処理（階層ベースで戻る）
    window.addEventListener('popstate', (event) => {
      this.goBack(false);
    });
  },

  // バックグラウンド保存 & 日付変更検知
  _lastSavedDate: null,
  _pendingDateChange: false,

  // 編集中かどうかを判定
  _isEditingPage() {
    const editPages = ['journal', 'journal-supplement', 'monthly', 'longterm', 'life'];
    if (editPages.includes(this.currentPage)) return true;
    if (document.querySelector('.modal-overlay')) return true;
    if (document.querySelector('.schedule-add-modal')) return true;
    if (document.querySelector('.routine-edit-modal')) return true;
    return false;
  },

  // 日付変更チェック（編集中はブロック）
  _checkDateChange() {
    const today = getTodayDate();
    if (!this._lastSavedDate || this._lastSavedDate === today) return;

    if (this._isEditingPage()) {
      this._pendingDateChange = true;
      return;
    }

    this._lastSavedDate = today;
    this._pendingDateChange = false;
    this.saveCurrentPageData().then(() => {
      return this.loadAllData();
    }).then(() => {
      this.render();
      this.showToast('日付が変わりました');
    }).catch(e => console.warn('日付変更後のデータ再読み込み失敗:', e));
  },

  // 保留中の日付変更を実行（編集ページから離れた時に呼ばれる）
  async _applyPendingDateChange() {
    if (!this._pendingDateChange) return;
    this._pendingDateChange = false;
    this._lastSavedDate = getTodayDate();
    await this.loadAllData();
    this.render();
    this.showToast('日付が変わりました');
  },

  initVisibilityHandler() {
    this._lastSavedDate = getTodayDate();

    // 1分間隔で日付変更チェック（開きっぱなし対応）
    if (this._dateCheckInterval) clearInterval(this._dateCheckInterval);
    this._dateCheckInterval = setInterval(() => this._checkDateChange(), 60000);

    // visibilitychange: タブ非表示・アプリ切り替え時に保存
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // バックグラウンドに入った時：ローカル保存完了後にDriveバックアップ
        this.saveCurrentPageData()
          .then(() => this._autoSyncToCloud())
          .catch(e => console.warn('バックグラウンド保存/同期失敗:', e));
      } else {
        // フォアグラウンドに戻った時：日付変更チェック
        this._checkDateChange();
      }
    });

    // beforeunload: PCでタブ閉じ・リロード時
    window.addEventListener('beforeunload', () => {
      this.saveCurrentPageData().catch(e => console.warn('beforeunload保存失敗:', e));
    });

    // pagehide: iOS Safari対策（beforeunloadが効かないケース）
    window.addEventListener('pagehide', () => {
      this.saveCurrentPageData().catch(e => console.warn('pagehide保存失敗:', e));
    });

    // 定期自動保存（30秒間隔）: pagehide/beforeunload到達前にデータを保全
    if (this._autoSaveInterval) clearInterval(this._autoSaveInterval);
    this._autoSaveInterval = setInterval(() => {
      this.saveCurrentPageData().catch(e => console.warn('自動保存失敗:', e));
    }, 30000);
  },

  // キーボード表示時にナビバーを隠す
  _keyboardTimer: null,
  initKeyboardHandler() {
    window.addEventListener('focusin', (e) => {
      if (e.target.matches('input, textarea, select')) {
        clearTimeout(this._keyboardTimer);
        document.body.classList.add('keyboard-open');
      }
    });
    window.addEventListener('focusout', () => {
      this._keyboardTimer = setTimeout(() => {
        document.body.classList.remove('keyboard-open');
      }, 200);
    });

    // キーボード表示時に固定ボタンをキーボードの上に移動
    if (window.visualViewport) {
      const updateBottomButtons = () => {
        const bottomButtons = document.querySelector('.fbox-bottom-buttons');
        if (!bottomButtons) return;
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        bottomButtons.style.bottom = keyboardHeight + 'px';
      };
      window.visualViewport.addEventListener('resize', updateBottomButtons);
      window.visualViewport.addEventListener('scroll', updateBottomButtons);
    }
  },

  // リップルエフェクト初期化
  initRippleEffects() {
    if (this._rippleInitialized) return;
    this._rippleInitialized = true;
    document.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem) return;
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = navItem.getBoundingClientRect();
      const size = 50;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      navItem.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  },

  // スワイプナビゲーション初期化
  initSwipeNavigation() {
    document.addEventListener('touchstart', (e) => this.handleSwipeStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleSwipeMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleSwipeEnd(e), { passive: true });
    document.addEventListener('touchcancel', (e) => this.handleSwipeEnd(e), { passive: true });
  },

  // メインタブスワイプ初期化
  initMainTabSwipe() {
    document.addEventListener('touchstart', (e) => this.handleMainTabSwipeStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleMainTabSwipeMove(e), { passive: true });
    document.addEventListener('touchend', (e) => this.handleMainTabSwipeEnd(e), { passive: true });
  },

  // 現在のページ+サブタブからflatPages内のindexを返す
  getCurrentFlatIndex() {
    const page = this.currentPage;
    if (page === 'gtd') {
      const tab = this.currentGTDTab || 'firstbox';
      if (tab === 'task') {
        const subTab = this.currentTaskTab || 'urgent';
        return this.flatPages.findIndex(p => p.page === 'gtd' && p.tab === 'task' && p.subTab === subTab);
      }
      if (tab === 'routine') {
        const subTab = this.currentRoutineTab || 'goal';
        return this.flatPages.findIndex(p => p.page === 'gtd' && p.tab === 'routine' && p.subTab === subTab);
      }
      return this.flatPages.findIndex(p => p.page === 'gtd' && p.tab === tab);
    }
    if (page === 'review-list' || page === 'review') {
      return this.flatPages.findIndex(p => p.page === 'review-list');
    }
    return this.flatPages.findIndex(p => p.page === page && !p.tab);
  },

  // flatPages[index]に遷移（サブタブ状態も設定）
  navigateToFlatPage(index) {
    const entry = this.flatPages[index];
    if (!entry) return;
    if (entry.page === 'gtd') {
      this.currentGTDTab = entry.tab;
      if (entry.subTab) {
        if (entry.tab === 'task') this.currentTaskTab = entry.subTab;
        if (entry.tab === 'routine') this.currentRoutineTab = entry.subTab;
      }
    }
    this.navigateNav(entry.page);
  },

  // メインタブスワイプ - タッチ開始
  handleMainTabSwipeStart(e) {
    // flatPages内のページ以外では無効
    if (this.getCurrentFlatIndex() === -1) return;

    // ゴールカード上のスワイプはメインタブスワイプを無効化
    const goalCard = e.target.closest('#home-card-longterm');
    if (goalCard && this.data.filteredLongTermGoals?.length > 1) {
      this.mainTabSwipe.disabled = true;
      return;
    }

    // タブバー・横スクロール要素上のスワイプは無効化
    if (e.target.closest('.task-tab-bar') || e.target.closest('.routine-tab-bar') || e.target.closest('.rv-table-wrapper') || e.target.closest('.rcl-matrix-wrap')) {
      this.mainTabSwipe.disabled = true;
      return;
    }

    this.mainTabSwipe.disabled = false;
    const touch = e.touches[0];
    this.mainTabSwipe.startX = touch.clientX;
    this.mainTabSwipe.startY = touch.clientY;
    this.mainTabSwipe.directionLocked = false;
  },

  // メインタブスワイプ - 移動中
  handleMainTabSwipeMove(e) {
    if (this.getCurrentFlatIndex() === -1) return;
    if (this.mainTabSwipe.disabled) return;
    if (this.mainTabSwipe.directionLocked) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.mainTabSwipe.startX);
    const deltaY = Math.abs(touch.clientY - this.mainTabSwipe.startY);

    // 縦スクロールが優勢ならスワイプをキャンセル
    if (deltaY > 10 && deltaY > deltaX) {
      this.mainTabSwipe.directionLocked = true;
    }
  },

  // メインタブスワイプ - タッチ終了
  handleMainTabSwipeEnd(e) {
    if (this.getCurrentFlatIndex() === -1) return;
    if (this.mainTabSwipe.disabled) return;
    if (this.mainTabSwipe.directionLocked) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.mainTabSwipe.startX;
    const threshold = 50; // スワイプ判定の閾値

    if (Math.abs(deltaX) < threshold) return;

    const currentIndex = this.getCurrentFlatIndex();
    let newIndex;

    if (deltaX > 0) {
      // 右スワイプ → 前のページへ
      newIndex = currentIndex - 1;
    } else {
      // 左スワイプ → 次のページへ
      newIndex = currentIndex + 1;
    }

    // 範囲チェック
    if (newIndex >= 0 && newIndex < this.flatPages.length) {
      // セクション境界：別セクションに入る時は常にそのセクションの最初のタブへ
      const currentEntry = this.flatPages[currentIndex];
      const targetEntry = this.flatPages[newIndex];
      if (currentEntry.page !== targetEntry.page) {
        const firstOfSection = this.flatPages.findIndex(p => p.page === targetEntry.page);
        if (firstOfSection !== -1) {
          newIndex = firstOfSection;
        }
      }
      this.navigateToFlatPage(newIndex);
    }
  },

  // フィールドヘルプ長押し初期化（ラベル長押しで説明表示）
  initFieldHelp() {
    let timer;
    let activeEl = null;
    let startX = 0;
    let startY = 0;
    let lastTouchTime = 0;
    const MOVE_THRESHOLD = 10;
    const findMarker = (target) => {
      if (!target || !target.closest) return null;
      if (target.matches('input, textarea, select, [contenteditable]')) return null;
      const container = target.closest('.modal-notes-section, .task-tab, .gtd-tab, .condition-type-row, .routine-tab, .modal-title, .nv-group-label, .nv-group-header, .form-title, .section-title, .widget-header, .score-items-header, .life-card-label');
      if (!container) return null;
      const fh = container.querySelector('.fh');
      if (!fh) return null;
      return { marker: fh, parent: container };
    };
    const clearPress = () => {
      if (!timer && !activeEl) return;
      clearTimeout(timer);
      timer = null;
      if (activeEl) {
        activeEl.classList.remove('fh-pressing');
        activeEl = null;
      }
    };
    const startPress = (r) => {
      activeEl = r.parent;
      activeEl.classList.add('fh-pressing');
      const fn = r.marker.dataset.fn || 'showFieldHelp';
      const k = r.marker.dataset.k;
      timer = setTimeout(() => {
        const el = activeEl;
        if (el) {
          el.classList.remove('fh-pressing');
          el.classList.add('fh-pop');
          el.addEventListener('animationend', () => el.classList.remove('fh-pop'), { once: true });
          setTimeout(() => el.classList.remove('fh-pop'), 350);
        }
        if (navigator.vibrate) navigator.vibrate(10);
        activeEl = null;
        timer = null;
        this._lastLongPressTime = Date.now();
        if (typeof this[fn] === 'function') this[fn](k);
      }, 500);
    };
    document.addEventListener('touchstart', (e) => {
      clearPress();
      lastTouchTime = Date.now();
      const r = findMarker(e.target);
      if (r && e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startPress(r);
      }
    }, { passive: true });
    document.addEventListener('touchend', clearPress);
    document.addEventListener('touchmove', (e) => {
      if (!timer && !activeEl) return;
      if (!e.touches || !e.touches.length) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (dx * dx + dy * dy > MOVE_THRESHOLD * MOVE_THRESHOLD) clearPress();
    }, { passive: true });
    document.addEventListener('mousedown', (e) => {
      if (Date.now() - lastTouchTime < 500) return;
      clearPress();
      const r = findMarker(e.target);
      if (r) startPress(r);
    });
    document.addEventListener('mouseup', clearPress);
  },

  // ドラッグ移動初期化
  initDragNavigation() {
    document.addEventListener('touchstart', (e) => this.handleDragNavStart(e), { passive: true });
    document.addEventListener('touchmove', (e) => this.handleDragNavMove(e), { passive: true });
    document.addEventListener('touchend', (e) => this.handleDragNavEnd(e), { passive: true });
    document.addEventListener('touchcancel', (e) => this.handleDragNavCancel(e), { passive: true });
    // PCクリック対応
    document.addEventListener('click', (e) => this.handleDotClick(e));
  },

  // ドラッグ移動 - タッチ開始
  handleDragNavStart(e) {
    // ドット部分全体（左右ラベルの内側）を対象にする
    const dotsContainer = e.target.closest('.swipe-dots');
    if (!dotsContainer) return;

    const swipeNav = dotsContainer.closest('.swipe-nav');
    if (!swipeNav) return;

    // 現在のアクティブなドットを取得
    const activeDot = dotsContainer.querySelector('.swipe-dot.active');
    if (!activeDot) return;

    // タップしたドットを取得（ワンタップ移動用）
    const tappedDot = e.target.closest('.swipe-dot');

    // 長押しタイマー開始（0.5秒）
    this.dragNav.longPressTimer = setTimeout(() => {
      this.activateDragNav(activeDot, swipeNav);
    }, 500);

    this.dragNav.pendingDot = activeDot;
    this.dragNav.pendingSwipeNav = swipeNav;
    this.dragNav.touchStartTime = Date.now();
    this.dragNav.tappedDot = tappedDot;
  },

  // ドラッグ移動 - 発動
  activateDragNav(dot, swipeNav) {
    this.dragNav.active = true;
    this.dragNav.startIndex = parseInt(dot.dataset.index);
    this.dragNav.currentIndex = this.dragNav.startIndex;
    this.dragNav.swipeNav = swipeNav;

    // ドット情報を取得
    const dots = swipeNav.querySelectorAll('.swipe-dot');
    this.dragNav.totalDots = dots.length;
    this.dragNav.startX = null; // 距離ベース操作用

    // インジケーターにドラッグモードクラスを追加
    swipeNav.classList.add('drag-mode');

    // 元の丸を大きくする
    dot.classList.add('drag-active');

    // 拡大UIオーバーレイを作成・表示
    this.showDragOverlay(dots);

    // スクロール禁止・タッチ無効化
    document.body.classList.add('drag-nav-active');

    // バイブレーション
    this.vibrate();
  },

  // ドラッグ移動 - 拡大UIオーバーレイ表示
  showDragOverlay(dots) {
    // 既存のオーバーレイを削除
    this.hideDragOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'drag-overlay';

    const content = document.createElement('div');
    content.className = 'drag-overlay-content';

    dots.forEach((dot, i) => {
      const overlayDot = document.createElement('div');
      overlayDot.className = 'drag-overlay-dot';
      overlayDot.dataset.index = i;
      overlayDot.dataset.pageLabel = dot.dataset.pageLabel;

      // 現在のページは塗りつぶし
      if (i === this.dragNav.startIndex) {
        overlayDot.classList.add('active');
      }
      // 選択中のドットはハイライト
      if (i === this.dragNav.currentIndex) {
        overlayDot.classList.add('selected');
        // 吹き出し追加
        const tooltip = document.createElement('div');
        tooltip.className = 'drag-tooltip';
        tooltip.textContent = dot.dataset.pageLabel;
        overlayDot.appendChild(tooltip);
      }

      content.appendChild(overlayDot);
    });

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    this.dragNav.overlay = overlay;
  },

  // ドラッグ移動 - オーバーレイ更新
  updateDragOverlay(newIndex) {
    if (!this.dragNav.overlay) return;

    const dots = this.dragNav.overlay.querySelectorAll('.drag-overlay-dot');
    dots.forEach((dot, i) => {
      dot.classList.remove('selected');
      // 既存の吹き出しを削除
      const existingTooltip = dot.querySelector('.drag-tooltip');
      if (existingTooltip) existingTooltip.remove();

      if (i === newIndex) {
        dot.classList.add('selected');
        // 吹き出し追加
        const tooltip = document.createElement('div');
        tooltip.className = 'drag-tooltip';
        tooltip.textContent = dot.dataset.pageLabel;
        dot.appendChild(tooltip);
      }
    });
  },

  // ドラッグ移動 - オーバーレイ削除
  hideDragOverlay() {
    if (this.dragNav.overlay) {
      this.dragNav.overlay.remove();
      this.dragNav.overlay = null;
    }
  },

  // ドラッグ移動 - タッチ移動
  handleDragNavMove(e) {
    // 長押し待機中に動いた場合はタイマーをクリアしない（インジケーター内なら継続）
    if (this.dragNav.longPressTimer && !this.dragNav.active) {
      const touch = e.touches[0];
      const swipeNav = this.dragNav.pendingSwipeNav;
      if (swipeNav) {
        const rect = swipeNav.querySelector('.swipe-dots').getBoundingClientRect();
        // インジケーター領域外ならキャンセル
        if (touch.clientX < rect.left - 20 || touch.clientX > rect.right + 20 ||
            touch.clientY < rect.top - 20 || touch.clientY > rect.bottom + 20) {
          this.clearDragNavTimer();
          return;
        }
      }
    }

    if (!this.dragNav.active) return;

    const touch = e.touches[0];

    // 距離ベース操作: 開始X座標を記録
    if (this.dragNav.startX === null) {
      this.dragNav.startX = touch.clientX;
    }

    // 距離ベースでインデックスを計算
    const deltaX = touch.clientX - this.dragNav.startX;
    const stepSize = 50; // 50pxで1ドット移動
    const deltaIndex = Math.round(deltaX / stepSize);
    let newIndex = this.dragNav.startIndex + deltaIndex;

    // 範囲制限
    newIndex = Math.max(0, Math.min(this.dragNav.totalDots - 1, newIndex));

    if (newIndex !== this.dragNav.currentIndex) {
      // 元のインジケーターのドットも更新
      const swipeNav = this.dragNav.swipeNav;
      const dots = swipeNav.querySelectorAll('.swipe-dot');
      dots.forEach(d => d.classList.remove('drag-active'));
      dots[newIndex].classList.add('drag-active');

      // オーバーレイ更新
      this.updateDragOverlay(newIndex);

      this.dragNav.currentIndex = newIndex;

      // バイブレーション
      this.vibrate();
    }
  },

  // ドラッグ移動 - タッチ終了
  handleDragNavEnd(e) {
    this.clearDragNavTimer();

    // ドラッグモードが発動していない場合、ワンタップ判定
    if (!this.dragNav.active) {
      const touchDuration = Date.now() - this.dragNav.touchStartTime;
      const tappedDot = this.dragNav.tappedDot;

      // 200ms未満でドットをタップした場合、そのページに移動
      if (touchDuration < 200 && tappedDot && !tappedDot.classList.contains('active')) {
        const swipeNav = tappedDot.closest('.swipe-nav');
        const activeDot = swipeNav?.querySelector('.swipe-dot.active');
        if (activeDot) {
          const pageId = tappedDot.dataset.pageId;
          const tappedIndex = parseInt(tappedDot.dataset.index);
          const activeIndex = parseInt(activeDot.dataset.index);
          const direction = tappedIndex > activeIndex ? 'left' : 'right';
          this.navigateWithDirection(pageId, direction);
        }
      }

      // タップ情報をクリア
      this.dragNav.touchStartTime = null;
      this.dragNav.tappedDot = null;
      return;
    }

    const startIndex = this.dragNav.startIndex;
    const currentIndex = this.dragNav.currentIndex;
    const swipeNav = this.dragNav.swipeNav;

    // ドラッグモード解除
    this.endDragNav();

    // 現在のページと違う丸で離した場合のみ遷移
    if (currentIndex !== startIndex) {
      const dot = swipeNav.querySelectorAll('.swipe-dot')[currentIndex];
      if (dot) {
        const pageId = dot.dataset.pageId;
        const direction = currentIndex > startIndex ? 'left' : 'right';
        this.navigateWithDirection(pageId, direction);
      }
    }
  },

  // ドラッグ移動 - キャンセル
  handleDragNavCancel(e) {
    this.clearDragNavTimer();
    if (this.dragNav.active) {
      this.cancelDragNav();
    }
  },

  // ドットクリック（PC用）
  handleDotClick(e) {
    const clickedDot = e.target.closest('.swipe-dot');
    if (!clickedDot) return;

    // アクティブなドットは何もしない
    if (clickedDot.classList.contains('active')) return;

    const swipeNav = clickedDot.closest('.swipe-nav');
    const activeDot = swipeNav?.querySelector('.swipe-dot.active');
    if (!activeDot) return;

    const pageId = clickedDot.dataset.pageId;
    const clickedIndex = parseInt(clickedDot.dataset.index);
    const activeIndex = parseInt(activeDot.dataset.index);
    const direction = clickedIndex > activeIndex ? 'left' : 'right';
    this.navigateWithDirection(pageId, direction);
  },

  // ドラッグ移動 - キャンセル処理
  cancelDragNav() {
    this.endDragNav();
  },

  // ドラッグ移動 - 終了処理
  endDragNav() {
    if (this.dragNav.swipeNav) {
      this.dragNav.swipeNav.classList.remove('drag-mode');
      const dots = this.dragNav.swipeNav.querySelectorAll('.swipe-dot');
      dots.forEach(d => d.classList.remove('drag-active'));
    }

    // オーバーレイ削除
    this.hideDragOverlay();

    // スクロール禁止・タッチ無効化解除
    document.body.classList.remove('drag-nav-active');

    // 状態リセット
    this.dragNav.active = false;
    this.dragNav.startIndex = null;
    this.dragNav.currentIndex = null;
    this.dragNav.swipeNav = null;
    this.dragNav.totalDots = null;
    this.dragNav.startX = null;
  },

  // 長押しタイマークリア
  clearDragNavTimer() {
    if (this.dragNav.longPressTimer) {
      clearTimeout(this.dragNav.longPressTimer);
      this.dragNav.longPressTimer = null;
    }
    this.dragNav.pendingDot = null;
    this.dragNav.pendingSwipeNav = null;
  },

  // バイブレーション
  vibrate() {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  // 方向指定付きナビゲーション（ドラッグ移動用）
  navigateWithDirection(pageId, direction) {
    // スワイプと同様のアニメーションで移動
    this.navigate(pageId, true, 'swipe');
  },

  // 現在のページのスワイプ情報を取得
  getSwipeInfo() {
    const page = this.currentPage;

    if (page === 'journal' || page === 'journal-supplement') {
      // 日誌グループの末尾にmonthly-0を接続
      const pages = [...this.swipeGroups.journal, 'monthly-0'];
      return { pages, index: pages.indexOf(page) };
    }

    if (page === 'monthly') {
      // 月次グループの先頭にjournalを接続
      const pages = ['journal', ...this.swipeGroups.monthly];
      return { pages, index: this.monthlyPageIndex + 1 };
    }

    if (page === 'life') {
      const pages = this.swipeGroups.life;
      return { pages, index: this.lifePageIndex };
    }

    return null;
  },

  // 指定ページのHTMLを取得（headerとcontentのみ、navbarは除外）
  getPageContent(pageId) {
    let fullHtml = '';

    // ページIDに応じてコンテンツを生成
    if (pageId === 'journal') {
      fullHtml = renderJournalPage(this.data);
    } else if (pageId === 'journal-supplement') {
      fullHtml = renderJournalSupplementPage(this.data);
    } else if (pageId.startsWith('monthly-')) {
      const idx = parseInt(pageId.split('-')[1]);
      fullHtml = renderMonthlyPage(this.data, idx);
    } else if (pageId.startsWith('life-')) {
      const idx = parseInt(pageId.split('-')[1]);
      fullHtml = renderLifeDesignPage(this.data, idx);
    }

    if (!fullHtml) return '';

    // DOMにパースしてheaderとcontentだけを抽出（navbarを除外）
    const temp = document.createElement('div');
    temp.innerHTML = fullHtml;
    const header = temp.querySelector('.header');
    const content = temp.querySelector('.content');

    // swipe-navをページと一緒にスライドさせるためpositionをabsoluteに変更
    if (content) {
      const swipeNav = content.querySelector('.swipe-nav');
      if (swipeNav) {
        swipeNav.style.position = 'absolute';
      }
    }

    let result = '';
    if (header) result += header.outerHTML;
    if (content) result += content.outerHTML;
    return result;
  },

  // スワイプ開始
  handleSwipeStart(e) {
    // ドラッグ移動中はスワイプ無効
    if (this.dragNav.active) return;

    // 前のスワイプが残っていたら削除＋visibility解除
    if (this.swipe.container) {
      this.swipe.container.remove();
      this.swipe.container = null;
      // 元のheader/contentのvisibilityを確実に解除
      const appContainer = document.getElementById('app');
      const header = appContainer.querySelector('.header');
      const content = appContainer.querySelector('.content');
      if (header) header.style.visibility = '';
      if (content) content.style.visibility = '';
    }

    const info = this.getSwipeInfo();
    if (!info) return;

    // 入力フィールドかどうかを記録（後で判定に使う）
    const tag = e.target.tagName;
    const isInputField = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');

    const touch = e.touches[0];
    this.swipe = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: 0,
      direction: null,
      container: null,
      info: info,
      isInputField: isInputField
    };
  },

  // スワイプ移動
  handleSwipeMove(e) {
    // ドラッグ移動中はスワイプ無効
    if (this.dragNav.active) return;
    if (!this.swipe.active) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.swipe.startX;
    const deltaY = touch.clientY - this.swipe.startY;

    // 方向決定（初回のみ）
    if (!this.swipe.direction) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        // 入力フィールド上の場合は、より明確な横スワイプのみ認識
        if (this.swipe.isInputField) {
          // 横方向が縦の2倍以上の場合のみスワイプ
          this.swipe.direction = (Math.abs(deltaX) > Math.abs(deltaY) * 2) ? 'h' : 'v';
        } else {
          this.swipe.direction = Math.abs(deltaX) > Math.abs(deltaY) ? 'h' : 'v';
        }
      }
      if (this.swipe.direction !== 'h') {
        this.swipe.active = false;
        return;
      }
    }

    if (this.swipe.direction !== 'h') return;
    e.preventDefault();

    const info = this.swipe.info;
    const screenW = window.innerWidth;

    // スワイプコンテナを作成（初回のみ）
    if (!this.swipe.container) {
      const hasPrev = info.index > 0;
      const hasNext = info.index < info.pages.length - 1;

      // コンテナ作成
      const container = document.createElement('div');
      container.className = 'swipe-container';

      // ナビバーの実際の高さを測定してbottomを設定
      const navbar = document.querySelector('.nav-bar');
      if (navbar) {
        container.style.bottom = navbar.offsetHeight + 'px';
      }

      // 現在のページ（#app内から取得）
      const appContainer = document.getElementById('app');
      const currentPage = document.createElement('div');
      currentPage.className = 'swipe-page current';
      const header = appContainer.querySelector('.header');
      const content = appContainer.querySelector('.content');
      if (header) currentPage.appendChild(header.cloneNode(true));
      if (content) {
        const contentClone = content.cloneNode(true);
        // swipe-navをページと一緒にスライドさせるためpositionをabsoluteに変更
        const swipeNavInClone = contentClone.querySelector('.swipe-nav');
        if (swipeNavInClone) {
          swipeNavInClone.style.position = 'absolute';
        }
        currentPage.appendChild(contentClone);
      }
      container.appendChild(currentPage);

      // 前のページ
      if (hasPrev) {
        const prevPage = document.createElement('div');
        prevPage.className = 'swipe-page prev';
        prevPage.innerHTML = this.getPageContent(info.pages[info.index - 1]);
        container.appendChild(prevPage);
      }

      // 次のページ
      if (hasNext) {
        const nextPage = document.createElement('div');
        nextPage.className = 'swipe-page next';
        nextPage.innerHTML = this.getPageContent(info.pages[info.index + 1]);
        container.appendChild(nextPage);
      }

      // 元のヘッダーとコンテンツを非表示（#app内の要素）
      if (header) header.style.visibility = 'hidden';
      if (content) content.style.visibility = 'hidden';

      document.body.appendChild(container);
      this.swipe.container = container;
      this.swipe.appContainer = appContainer; // 参照を保存
    }

    // 端での抵抗感
    const hasPrev = info.index > 0;
    const hasNext = info.index < info.pages.length - 1;
    if ((deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext)) {
      this.swipe.currentX = deltaX * 0.3;
    } else {
      this.swipe.currentX = deltaX;
    }

    // ページ位置を更新
    const current = this.swipe.container.querySelector('.current');
    const prev = this.swipe.container.querySelector('.prev');
    const next = this.swipe.container.querySelector('.next');

    if (current) current.style.transform = `translateX(${this.swipe.currentX}px)`;
    if (prev) prev.style.transform = `translateX(${-screenW + this.swipe.currentX}px)`;
    if (next) next.style.transform = `translateX(${screenW + this.swipe.currentX}px)`;
  },

  // スワイプ終了
  handleSwipeEnd(e) {
    // ドラッグ移動中はスワイプ無効
    if (this.dragNav.active) return;
    if (!this.swipe.active || !this.swipe.container) {
      this.swipe.active = false;
      return;
    }

    const info = this.swipe.info;
    const deltaX = this.swipe.currentX;
    const threshold = window.innerWidth * 0.25;
    const screenW = window.innerWidth;

    const current = this.swipe.container.querySelector('.current');
    const prev = this.swipe.container.querySelector('.prev');
    const next = this.swipe.container.querySelector('.next');

    // ページ遷移判定
    let targetPage = null;
    let animateX = 0;

    if (deltaX > threshold && info.index > 0) {
      // 前のページへ
      targetPage = info.pages[info.index - 1];
      animateX = screenW;
    } else if (deltaX < -threshold && info.index < info.pages.length - 1) {
      // 次のページへ
      targetPage = info.pages[info.index + 1];
      animateX = -screenW;
    }

    // アニメーション
    const duration = 200;
    if (current) {
      current.style.transition = `transform ${duration}ms ease-out`;
      current.style.transform = `translateX(${animateX}px)`;
    }
    if (prev) {
      prev.style.transition = `transform ${duration}ms ease-out`;
      prev.style.transform = `translateX(${-screenW + animateX}px)`;
    }
    if (next) {
      next.style.transition = `transform ${duration}ms ease-out`;
      next.style.transform = `translateX(${screenW + animateX}px)`;
    }

    // アニメーション後の処理（containerの参照を保存して比較）
    const currentContainer = this.swipe.container;
    setTimeout(() => {
      // 先にページ遷移（裏でDOMを更新、アニメーションなし）
      if (targetPage) {
        this.navigate(targetPage, true, 'swipe');
      }

      // 元のヘッダーとコンテンツを表示（#app内から取得）
      const appContainer = document.getElementById('app');
      const header = appContainer.querySelector('.header');
      const content = appContainer.querySelector('.content');
      if (header) header.style.visibility = '';
      if (content) content.style.visibility = '';

      // 保存したcontainerを削除
      if (currentContainer) {
        currentContainer.remove();
      }

      // 新しいスワイプが始まっていなければ状態リセット
      if (this.swipe.container === currentContainer || this.swipe.container === null) {
        this.swipe = {
          active: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          direction: null,
          container: null
        };
      }
    }, duration);
  },

  /* ========================================
     スマート＋ボタン機能
     ======================================== */

  // 今日の日誌へ移動（既存なら編集、なければ新規）
  async changeJournalListMonth(direction) {
    if (this._changingMonth) return;
    this._changingMonth = true;
    try {
      const current = this.journalListMonth || getCurrentMonth();
      const [y, m] = current.split('-').map(Number);
      const d = new Date(y, m - 1 + direction, 1);
      const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const journals = await getMonthJournals(newMonth);
      this.journalListMonth = newMonth;
      this.data.journals = journals;
      this.data.journals.forEach(j => this.migratePolicyScores(j));
      this.render();
    } catch (err) {
      console.error('月切り替え失敗:', err);
    } finally {
      this._changingMonth = false;
    }
  },

  async navigateToTodayJournal() {
    const today = getTodayDate();
    this.data.todayJournal = await getJournal(today);
    if (!this.data.todayJournal.scoreItems || this.data.todayJournal.scoreItems.length === 0) {
      this.data.todayJournal.scoreItems = JSON.parse(JSON.stringify(this.data.scoreItems));
    }
    this.migratePolicyScores(this.data.todayJournal);
    this.navigate('journal');
  },

  // 今月の目標シートへ移動（既存なら編集、なければ新規）
  async navigateToCurrentMonth() {
    const currentMonth = getCurrentMonth();
    const existingGoal = this.data.monthlyGoals.find(g => g.yearMonth === currentMonth);

    if (existingGoal) {
      // 既存の月次目標がある場合はそれを表示
      this.data.monthlyGoal = existingGoal;
    } else {
      // なければ新規作成
      this.data.monthlyGoal = await getMonthlyGoal(currentMonth);
      this.data.monthlyGoals = await getAllMonthlyGoals();
    }
    this.monthlyPageIndex = 0;
    this.collapsedBreakdownFactors = [];
    this.navigate('monthly');
  },

  showNewMonthlyGoalPicker() {
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    let nextM = curM + 1, nextY = curY;
    if (nextM > 12) { nextM = 1; nextY++; }

    const curYM = `${curY}-${String(curM).padStart(2, '0')}`;
    const nextYM = `${nextY}-${String(nextM).padStart(2, '0')}`;

    const goals = this.data.monthlyGoals || [];
    const existsCur = goals.some(g => g.yearMonth === curYM);
    const existsNext = goals.some(g => g.yearMonth === nextYM);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-content" style="max-width:320px">
        <div class="modal-header">月次目標を作成</div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:8px">
          <button class="modal-btn primary" ${existsCur ? 'disabled style="opacity:0.4"' : ''} onclick="this.closest('.modal-overlay').remove(); app.navigateToMonth('${curYM}')">
            ${curM}月（今月）${existsCur ? ' — 作成済み' : ''}
          </button>
          <button class="modal-btn primary" ${existsNext ? 'disabled style="opacity:0.4"' : ''} onclick="this.closest('.modal-overlay').remove(); app.navigateToMonth('${nextYM}')">
            ${nextM}月（来月）${existsNext ? ' — 作成済み' : ''}
          </button>
          <div style="margin-top:4px">
            <label style="font-size:13px;color:#888">その他の月</label>
            <input type="month" class="form-input" style="margin-top:4px" onchange="this.closest('.modal-overlay').remove(); app.navigateToMonth(this.value)">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async navigateToMonth(yearMonth) {
    if (!yearMonth) return;
    const existingGoal = this.data.monthlyGoals.find(g => g.yearMonth === yearMonth);

    if (existingGoal) {
      this.data.monthlyGoal = existingGoal;
    } else {
      this.data.monthlyGoal = await getMonthlyGoal(yearMonth);
      this.data.monthlyGoals = await getAllMonthlyGoals();
    }
    this.monthlyPageIndex = 0;
    this.collapsedBreakdownFactors = [];
    this.navigate('monthly');
  },

  /* ========================================
     ルーティン・タスク操作
     ======================================== */

  async toggleRoutine(index) {
    // スクロール位置を保存
    const widgetContent = document.querySelector('.routine-widget .widget-content');
    const scrollTop = widgetContent ? widgetContent.scrollTop : 0;

    // 3段階サイクル: none → done → partial → none
    const routine = this.data.todayJournal.routines[index];
    if (!routine) return;
    const currentStatus = getRoutineStatus(routine);
    const nextStatus = currentStatus === 'none' ? 'done' : currentStatus === 'done' ? 'partial' : 'none';
    routine.status = nextStatus;
    routine.done = nextStatus === 'done'; // 互換性のため

    await saveJournal(this.data.todayJournal);
    this.render();

    // スクロール位置を復元
    requestAnimationFrame(() => {
      const newWidgetContent = document.querySelector('.routine-widget .widget-content');
      if (newWidgetContent) {
        newWidgetContent.scrollTop = scrollTop;
      }
    });
  },

  async toggleSchedule(index) {
    if (!this.data.todayJournal?.schedule?.[index]) return;
    this.data.todayJournal.schedule[index].done = !this.data.todayJournal.schedule[index].done;
    await saveJournal(this.data.todayJournal);
    this.render();
  },

  async toggleCoreAction(type) {
    if (!this.data.todayJournal.coreActions[type]) {
      this.data.todayJournal.coreActions[type] = { name: '', done: false };
    }
    this.data.todayJournal.coreActions[type].done = !this.data.todayJournal.coreActions[type].done;
    await saveJournal(this.data.todayJournal);
    this.render();
  },

  addScheduleItem() {
    this.showCustomInputModal('予定を追加', '予定を入力', async (name) => {
      if (name) {
        if (!this.data.todayJournal.schedule) {
          this.data.todayJournal.schedule = [];
        }
        this.data.todayJournal.schedule.push({ name, done: false });
        await saveJournal(this.data.todayJournal);
        this.render();
      }
    });
  },

  // ワンタイムタスク追加（今日やることウィジェット）
  addOneTimeTask() {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-message"><div>今日のタスクを追加</div></div>
        <input type="text" placeholder="タスク名を入力" autocomplete="off" style="width:100%;padding:12px;font-size:16px;border:2px solid var(--border, #ddd);border-radius:8px;margin:8px 0;box-sizing:border-box;">
        <div class="confirm-buttons">
          <button class="confirm-btn cancel">キャンセル</button>
          <button class="confirm-btn ok">追加</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('input');
    input.focus();
    overlay.querySelector('.confirm-btn.cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-btn.ok').onclick = async () => {
      const name = input.value.trim();
      if (!name) return;
      overlay.remove();
      if (!this.data.todayJournal.routines) this.data.todayJournal.routines = [];
      this.data.todayJournal.routines.push({ name, isOneTime: true });
      await saveJournal(this.data.todayJournal);
      this.render();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('.confirm-btn.ok').click();
    });
  },

  /* ========================================
     日誌操作
     ======================================== */

  // 個別点数を更新し、平均を自動計算
  updateScore(itemId, value) {
    if (!this.data.todayJournal.scores) {
      this.data.todayJournal.scores = {};
    }
    this.data.todayJournal.scores[itemId] = parseInt(value);
    this.recalcScoreAverage();
  },

  // 点数平均を再計算
  recalcScoreAverage() {
    const scores = this.data.todayJournal.scores || {};
    const vals = Object.values(scores).filter(v => typeof v === 'number' && !isNaN(v));
    this.data.todayJournal.score = vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
      : 0;
  },

  // 点数項目を追加（カスタムモーダル使用）
  addScoreItem() {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-message"><div>点数項目のタイトル</div></div>
        <input type="text" class="score-item-input" placeholder="例：後悔のない1日だったか" autocomplete="off" style="width:100%;padding:14px;font-size:16px;border:2px solid var(--border, #ddd);border-radius:8px;margin:8px 0;box-sizing:border-box;text-align:left;">
        <div class="confirm-buttons">
          <button class="confirm-btn cancel">キャンセル</button>
          <button class="confirm-btn ok">追加</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('.score-item-input');
    input.focus();
    overlay.querySelector('.confirm-btn.cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-btn.ok').onclick = async () => {
      const title = input.value.trim();
      if (!title) return;
      overlay.remove();
      const id = 'score_' + Date.now();
      const newItem = { id, title };
      // 日誌の項目に追加
      if (!this.data.todayJournal.scoreItems) this.data.todayJournal.scoreItems = [];
      this.data.todayJournal.scoreItems.push({ ...newItem });
      // グローバルテンプレートにも追加（参照分離）
      this.data.scoreItems.push({ ...newItem });
      await saveSetting('scoreItems', this.data.scoreItems);
      await saveJournal(this.data.todayJournal);
      this.render();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('.confirm-btn.ok').click();
    });
  },

  // 点数項目を削除（カスタムモーダル使用）
  confirmDeleteScoreItem(id) {
    const journalItems = this.data.todayJournal.scoreItems || [];
    if (journalItems.length <= 1) {
      this.showToast('最低1つの項目が必要です');
      return;
    }
    this.showConfirmModal('この点数項目', async () => {
      // 日誌の項目から削除
      this.data.todayJournal.scoreItems = journalItems.filter(item => item.id !== id);
      // グローバルテンプレートからも削除
      this.data.scoreItems = this.data.scoreItems.filter(item => item.id !== id);
      await saveSetting('scoreItems', this.data.scoreItems);
      // スコアも削除
      if (this.data.todayJournal.scores) {
        delete this.data.todayJournal.scores[id];
        this.recalcScoreAverage();
      }
      await saveJournal(this.data.todayJournal);
      this.render();
    });
  },

  // 旧policyScoresを新scoresに移行
  migratePolicyScores(journal) {
    if (!journal.policyScores) return;
    const ps = journal.policyScores;
    if (!journal.scores || Object.keys(journal.scores).length === 0) {
      journal.scores = {};
      if (ps.fullLife) journal.scores['fullLife'] = Math.min(5, Math.round(ps.fullLife / 2));
      if (ps.spiritualFirst) journal.scores['spiritualFirst'] = Math.min(5, Math.round(ps.spiritualFirst / 2));
      const vals = Object.values(journal.scores).filter(v => v > 0);
      journal.score = vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10
        : 0;
    }
  },

  updateJournalTitle(value) {
    this.data.todayJournal.title = value.trim();
  },

  async autoGenerateTitle(journal) {
    if (!journal || journal.title) return;
    // 日誌の内容からタイトルを生成
    const r = journal.reflections || {};
    const content = journal.resolution || r.reflection || r.effort || r.contribution || r.gratitude || r.free || '';
    if (!content) return;

    if (this.geminiApiKey) {
      try {
        const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(`以下の日誌の内容から、12〜20文字以内で簡潔なタイトルを1つだけ生成してください。タイトルのみ出力し、他の説明は不要です。\n\n${content}`);
        const title = result.response.text().trim().replace(/^[「『]|[」』]$/g, '').replace(/[\r\n]+/g, ' ');
        if (title && title.length <= 30) {
          journal.title = title;
        }
      } catch (e) {
        console.error('タイトル自動生成失敗:', e);
      }
    }
    // AI未設定またはAI失敗時：先頭15文字をフォールバック
    if (!journal.title) {
      journal.title = content.substring(0, 15).replace(/[\r\n]+/g, ' ');
    }
  },

  updateResolution(value) {
    this.data.todayJournal.resolution = value;
  },

  updateTomorrowResolution(value) {
    this.data.todayJournal.tomorrowResolution = value;
  },

  updateJournalReflection(field, value) {
    if (!this.data.todayJournal.reflections) {
      this.data.todayJournal.reflections = {};
    }
    this.data.todayJournal.reflections[field] = value;
  },

  async viewJournal(date) {
    this.data.todayJournal = await getJournal(date);
    // 日誌に点数項目がなければグローバル設定からコピー（旧データ互換）
    if (!this.data.todayJournal.scoreItems || this.data.todayJournal.scoreItems.length === 0) {
      this.data.todayJournal.scoreItems = JSON.parse(JSON.stringify(this.data.scoreItems));
    }
    // 旧policyScoresを新スコアに移行（後方互換）
    this.migratePolicyScores(this.data.todayJournal);
    this.navigate('journal');
  },

  // 補足データ更新
  updateSupplement(field, value) {
    if (!this.data.todayJournal.supplement) {
      this.data.todayJournal.supplement = {};
    }
    this.data.todayJournal.supplement[field] = value;
  },

  /* ========================================
     月次目標操作
     ======================================== */

  // 月次目標から日誌へ同期（ルーティン・コアアクション）
  // ルーティン・コアアクション同期の汎用ロジック
  // mode: 'add'=既存進捗保持, 'reset'=全ステータスリセット
  syncMonthlyToSpecificJournal(journal, monthlyGoal, mode) {
    if (!monthlyGoal || !journal) return;
    const mg = monthlyGoal;
    const isReset = mode === 'reset';

    const monthlyRoutines = mg.routines || [];
    const journalRoutines = journal.routines || [];

    // ルーティン同期
    journal.routines = monthlyRoutines.map((routine, i) => {
      const routineId = routine.id ?? (i + 1);
      const existingRoutine = isReset ? null
        : (journalRoutines.find(r => r.id === routineId) || journalRoutines.find(r => r.name === routine.name));
      return {
        id: routineId,
        category: routine.category,
        name: routine.name,
        priority: routine.priority || i + 1,
        condition: routine.condition || '',
        minimumAction: routine.minimumAction || '',
        troubleAnticipation: routine.troubleAnticipation || '',
        weekDays: routine.weekDays || null,
        weeklyTarget: routine.weeklyTarget || null,
        done: existingRoutine ? existingRoutine.done : false,
        status: existingRoutine ? (existingRoutine.status || 'none') : 'none'
      };
    });

    // コアアクション同期
    if (mg.coreActions) {
      const existingCore = isReset ? {} : (journal.coreActions || {});
      journal.coreActions = {
        deadline: { name: mg.coreActions.deadline || '', done: existingCore.deadline?.done || false },
        processing: { name: mg.coreActions.processing || '', done: existingCore.processing?.done || false },
        habit: { name: mg.coreActions.habit || '', done: existingCore.habit?.done || false },
        other: { name: mg.coreActions.other || '', done: existingCore.other?.done || false }
      };
    }
  },

  // 今日の日誌に月次目標を同期（既存互換ラッパー）
  async syncMonthlyToJournal() {
    if (!this.data.monthlyGoal || !this.data.todayJournal) return;
    this.syncMonthlyToSpecificJournal(this.data.todayJournal, this.data.monthlyGoal, 'add');
    await saveJournal(this.data.todayJournal);
  },

  // 「カレンダーに反映」モーダルを表示
  showReflectModal() {
    if (document.querySelector('.reflect-modal')) return;
    const modalHTML = `
      <div class="modal-overlay reflect-modal active" onclick="app.closeReflectModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">カレンダーに反映</div>
          <p style="font-size:13px;color:var(--text-secondary);margin:8px 0 16px;">今月の全日誌にルーティンとコアアクションを反映します。</p>
          <div class="reflect-options">
            <button class="reflect-option-btn" onclick="app.reflectMonthlyToCalendar('add')">
              <span class="reflect-option-icon">＋</span>
              <span class="reflect-option-label">追加</span>
              <span class="reflect-option-desc">既存の進捗を保持したまま反映</span>
            </button>
            <button class="reflect-option-btn reflect-option-danger" onclick="app.confirmReflectReset()">
              <span class="reflect-option-icon">↻</span>
              <span class="reflect-option-label">リセットして反映</span>
              <span class="reflect-option-desc">全ての進捗をリセットして上書き</span>
            </button>
          </div>
          <button class="modal-cancel-btn" onclick="app.closeReflectModal()">キャンセル</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeReflectModal() {
    const modal = document.querySelector('.reflect-modal');
    if (modal) modal.remove();
  },

  // リセットモードの2段階確認
  confirmReflectReset() {
    this.closeReflectModal();
    const modalHTML = `
      <div class="modal-overlay reflect-modal active" onclick="app.closeReflectModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title" style="color:#dc2626;">確認</div>
          <p style="font-size:13px;margin:8px 0 16px;">今月の全日誌のルーティン進捗・コアアクション完了状態がリセットされます。この操作は取り消せません。</p>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-danger" onclick="app.reflectMonthlyToCalendar('reset')">リセットして反映</button>
            <button class="modal-btn" onclick="app.closeReflectModal()">キャンセル</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // 月次目標を当月の全日誌に一括反映
  async reflectMonthlyToCalendar(mode) {
    this.closeReflectModal();
    if (!this.data.monthlyGoal) return;

    const yearMonth = getCurrentMonth();
    const journals = await getMonthJournals(yearMonth);
    if (journals.length === 0) {
      this.showToast('今月の日誌がありません');
      return;
    }

    const mg = this.data.monthlyGoal;
    for (const journal of journals) {
      this.syncMonthlyToSpecificJournal(journal, mg, mode);
    }

    // 一括保存
    await saveBatch({ journals: journals });

    // todayJournalの同期
    const today = getTodayDate();
    const updatedToday = journals.find(j => j.date === today);
    if (updatedToday) {
      this.data.todayJournal = updatedToday;
    }

    // journalsキャッシュも更新
    this.data.journals = journals;

    // カレンダーキャッシュを無効化（次回表示時に再読み込み）
    this.data.calendarJournals = null;
    this.data.calendarMonthlyGoal = null;
    this.data.calendarTasks = null;

    this.showToast(`${journals.length}件の日誌に反映しました`);
    this.render();
  },

  // 「過去の月からコピー」モーダルを表示
  async showCopyMonthModal() {
    if (document.querySelector('.copy-month-modal')) return;
    const allGoals = await getAllMonthlyGoals();
    const editingMonth = this.data.monthlyGoal.yearMonth;
    // データがある月のみ、編集中の月を除外、新しい順
    const pastGoals = allGoals
      .filter(g => g.yearMonth !== editingMonth && hasMonthlyGoalData(g))
      .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

    if (pastGoals.length === 0) {
      this.showToast('コピー元の月がありません');
      return;
    }

    const listHTML = pastGoals.map(g => {
      const [y, m] = g.yearMonth.split('-');
      const routineCount = (g.routines || []).filter(r => r.name).length;
      const patternCount = (g.schedulePatterns || []).length;
      const coreCount = ['deadline', 'processing', 'habit', 'other']
        .filter(k => g.coreActions && g.coreActions[k]).length;
      return `
        <div class="copy-month-item" onclick="app.confirmCopyFromMonth('${g.yearMonth}')">
          <span class="copy-month-label">${y}年${parseInt(m)}月</span>
          <span class="copy-month-info">ルーティン${routineCount}件 / パターン${patternCount}件 / コア${coreCount}件</span>
        </div>
      `;
    }).join('');

    const modalHTML = `
      <div class="modal-overlay copy-month-modal active" onclick="app.closeCopyMonthModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">過去の月からコピー</div>
          <p style="font-size:12px;color:var(--text-secondary);margin:4px 0 12px;">ルーティン・コアアクション・スケジュールパターンをコピーします。</p>
          <div class="copy-month-list">${listHTML}</div>
          <button class="modal-cancel-btn" onclick="app.closeCopyMonthModal()">キャンセル</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeCopyMonthModal() {
    const modal = document.querySelector('.copy-month-modal');
    if (modal) modal.remove();
  },

  // コピー確認
  confirmCopyFromMonth(sourceYearMonth) {
    this.closeCopyMonthModal();
    const [y, m] = sourceYearMonth.split('-');
    const label = `${y}年${parseInt(m)}月`;
    const modalHTML = `
      <div class="modal-overlay copy-month-modal active" onclick="app.closeCopyMonthModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">確認</div>
          <p style="font-size:13px;margin:8px 0 16px;">${escapeHtml(label)}の設定をコピーしますか？<br><br>ルーティン・コアアクション・スケジュールパターンが上書きされます。<br>（目標・観点・報酬等はコピーされません）</p>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.copyFromPastMonth('${sourceYearMonth}')">コピーする</button>
            <button class="modal-btn" onclick="app.closeCopyMonthModal()">キャンセル</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // 過去月の設定をコピー
  async copyFromPastMonth(sourceYearMonth) {
    this.closeCopyMonthModal();
    try {
      const source = await getMonthlyGoal(sourceYearMonth);
      const target = this.data.monthlyGoal;

      // ルーティンをコピー（全フィールド）
      if (source.routines) {
        target.routines = source.routines.map(r => ({ ...r }));
      }

      // コアアクションをコピー
      if (source.coreActions) {
        target.coreActions = { ...source.coreActions };
      }

      // スケジュールパターンをコピー（ID振り直し）
      if (source.schedulePatterns && source.schedulePatterns.length > 0) {
        const baseId = Date.now();
        target.schedulePatterns = source.schedulePatterns.map((p, i) => ({
          ...p,
          id: baseId + i,
          schedule: (p.schedule || []).map(s => ({ ...s })),
          condition: p.condition ? { ...p.condition,
            days: p.condition.days ? [...p.condition.days] : undefined,
            activeDays: p.condition.activeDays ? [...p.condition.activeDays] : undefined,
            dates: p.condition.dates ? [...p.condition.dates] : undefined,
            nthWeekday: p.condition.nthWeekday ? { ...p.condition.nthWeekday } : undefined
          } : undefined
        }));
      }

      await saveMonthlyGoal(target);
      const editingYearMonth = target.yearMonth;
      await this.loadAllData();
      // loadAllDataが今月にリセットするので、編集中の月を再ロード
      this.data.monthlyGoal = await getMonthlyGoal(editingYearMonth);
      const [y, m] = sourceYearMonth.split('-');
      this.showToast(`${y}年${parseInt(m)}月からコピーしました`);
      this.render();
    } catch (err) {
      console.error('コピー失敗:', err);
      this.showToast('コピーに失敗: ' + err.message);
    }
  },

  updateMonthlyGoal(field, value) {
    this.data.monthlyGoal[field] = value;
  },

  updateMonthlyReward(field, value) {
    if (!this.data.monthlyGoal.reward) {
      this.data.monthlyGoal.reward = {};
    }
    this.data.monthlyGoal.reward[field] = value;
  },

  // ゴールブレイクダウン操作
  collapsedBreakdownFactors: [],

  toggleBreakdownFactor(index) {
    const idx = this.collapsedBreakdownFactors.indexOf(index);
    if (idx >= 0) {
      this.collapsedBreakdownFactors.splice(idx, 1);
    } else {
      this.collapsedBreakdownFactors.push(index);
    }
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  expandAllBreakdown() {
    if (!this.data.monthlyGoal.breakdown) {
      this.data.monthlyGoal.breakdown = { factors: [] };
    }
    const factors = this.data.monthlyGoal.breakdown.factors;
    while (factors.length < 10) {
      factors.push({ name: '', actions: [] });
    }
    for (const factor of factors) {
      if (!factor.actions) factor.actions = [];
      while (factor.actions.length < 7) {
        factor.actions.push('');
      }
    }
    this.collapsedBreakdownFactors = [];
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  cycleBreakdownCategory(factorIndex) {
    if (!this.data.monthlyGoal.breakdown?.factors?.[factorIndex]) return;
    const cats = ['', 'rei', 'shin', 'tai', 'gi', 'sei'];
    const current = this.data.monthlyGoal.breakdown.factors[factorIndex].category || '';
    const idx = cats.indexOf(current);
    this.data.monthlyGoal.breakdown.factors[factorIndex].category = cats[(idx + 1) % cats.length];
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  moveBreakdownFactor(fromIndex, direction) {
    const factors = this.data.monthlyGoal?.breakdown?.factors;
    if (!factors) return;
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= factors.length) return;
    const temp = factors[fromIndex];
    factors[fromIndex] = factors[toIndex];
    factors[toIndex] = temp;
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  addBreakdownFactor() {
    if (!this.data.monthlyGoal.breakdown) {
      this.data.monthlyGoal.breakdown = { factors: [] };
    }
    if (this.data.monthlyGoal.breakdown.factors.length >= 10) return;

    this.data.monthlyGoal.breakdown.factors.push({
      name: '',
      actions: []
    });
    this.render();
  },

  updateBreakdownFactor(factorIndex, field, value) {
    if (!this.data.monthlyGoal.breakdown?.factors?.[factorIndex]) return;
    this.data.monthlyGoal.breakdown.factors[factorIndex][field] = value;
  },

  removeBreakdownFactor(factorIndex) {
    if (!this.data.monthlyGoal.breakdown?.factors) return;
    this.data.monthlyGoal.breakdown.factors.splice(factorIndex, 1);
    this.collapsedBreakdownFactors = this.collapsedBreakdownFactors
      .filter(i => i !== factorIndex)
      .map(i => i > factorIndex ? i - 1 : i);
    this.render();
  },

  addBreakdownAction(factorIndex) {
    if (!this.data.monthlyGoal.breakdown?.factors?.[factorIndex]) return;
    const factor = this.data.monthlyGoal.breakdown.factors[factorIndex];
    if (!factor.actions) factor.actions = [];
    if (factor.actions.length >= 7) return;

    factor.actions.push('');
    this.render();
  },

  updateBreakdownAction(factorIndex, actionIndex, value) {
    if (!this.data.monthlyGoal.breakdown?.factors?.[factorIndex]) return;
    this.data.monthlyGoal.breakdown.factors[factorIndex].actions[actionIndex] = value;
  },

  removeBreakdownAction(factorIndex, actionIndex) {
    if (!this.data.monthlyGoal.breakdown?.factors?.[factorIndex]) return;
    this.data.monthlyGoal.breakdown.factors[factorIndex].actions.splice(actionIndex, 1);
    this.render();
  },

  // 期日アイテム操作
  addDeadlineItem() {
    if (!this.data.monthlyGoal.deadlineItems) {
      this.data.monthlyGoal.deadlineItems = [];
    }
    if (this.data.monthlyGoal.deadlineItems.length >= 10) return;
    this.data.monthlyGoal.deadlineItems.push({ id: Date.now(), title: '', date: '' });
    this.render();
  },

  updateDeadlineItem(index, field, value) {
    if (!this.data.monthlyGoal.deadlineItems?.[index]) return;
    this.data.monthlyGoal.deadlineItems[index][field] = value;
  },

  removeDeadlineItem(index) {
    if (!this.data.monthlyGoal.deadlineItems) return;
    this.data.monthlyGoal.deadlineItems.splice(index, 1);
    this.render();
  },

  // 週次マイルストーン操作
  updateWeeklyMilestone(weekIndex, value) {
    if (!this.data.monthlyGoal.weeklyMilestones) {
      this.data.monthlyGoal.weeklyMilestones = ['', '', '', '', ''];
    }
    this.data.monthlyGoal.weeklyMilestones[weekIndex] = value;
  },

  async viewMonthlyGoal(yearMonth) {
    this.data.monthlyGoal = await getMonthlyGoal(yearMonth);
    this.monthlyPageIndex = 0;
    this.collapsedBreakdownFactors = [];
    this.navigate('monthly');
  },

  createNewMonthlyGoal() {
    this.showCustomInputModal('新規月次目標', '年月 (例: 2026-02)', (yearMonth) => {
      if (yearMonth && /^\d{4}-\d{2}$/.test(yearMonth)) {
        this.data.monthlyGoal = getDefaultMonthlyGoal(yearMonth);
        this.monthlyPageIndex = 0;
        this.navigate('monthly');
      } else if (yearMonth) {
        this.showToast('形式が正しくありません (例: 2026-02)');
      }
    });
  },

  // 月次ルーティン操作
  addMonthlyRoutine() {
    if (!this.data.monthlyGoal.routines) {
      this.data.monthlyGoal.routines = [];
    }
    const newPriority = Math.min(this.data.monthlyGoal.routines.length + 1, 5);
    const newRoutine = {
      id: Date.now(),
      name: '',
      category: 'rei',
      priority: newPriority,
      condition: '',
      minimumAction: '',
      troubleAnticipation: '',
      done: false
    };
    this.data.monthlyGoal.routines.push(newRoutine);
    const newIndex = this.data.monthlyGoal.routines.length - 1;
    this.render();
    // 新規追加後にモーダルを開く
    setTimeout(() => this.openRoutineEditModal(newIndex), 100);
  },

  updateMonthlyRoutine(index, field, value) {
    if (!this.data.monthlyGoal?.routines?.[index]) return;
    this.data.monthlyGoal.routines[index][field] = value;
    // 優先順位変更時は他のルーティンも調整
    if (field === 'priority') {
      this.reorderRoutinePriorities(index, parseInt(value));
    }
  },

  // 優先順位の並び替え
  reorderRoutinePriorities(changedIndex, newPriority) {
    const routines = this.data.monthlyGoal.routines;
    const oldPriority = routines[changedIndex].priority;

    routines.forEach((r, i) => {
      if (i === changedIndex) return;
      // 優先度が上がった場合（数字が小さくなった）
      if (newPriority < oldPriority && r.priority >= newPriority && r.priority < oldPriority) {
        r.priority++;
      }
      // 優先度が下がった場合（数字が大きくなった）
      else if (newPriority > oldPriority && r.priority <= newPriority && r.priority > oldPriority) {
        r.priority--;
      }
    });
    routines[changedIndex].priority = newPriority;
  },

  removeMonthlyRoutine(index) {
    this.data.monthlyGoal.routines.splice(index, 1);
    // 優先順位を再割り当て
    this.data.monthlyGoal.routines.forEach((r, i) => {
      r.priority = i + 1;
    });
    this.render();
  },

  // ルーティン評価を更新
  updateRoutineEvaluation(routineIndex, field, value) {
    const routine = this.data.monthlyGoal.routines[routineIndex];
    if (!routine) return;

    if (!routine.evaluation) {
      routine.evaluation = {
        judgment: null,
        tangibleSelf: '',
        tangibleOthers: '',
        intangibleSelf: '',
        intangibleOthers: '',
        growthForecast: '',
        ratingAchievement: null,
        ratingEffect: null,
        ratingCost: null,
        ratingGrowth: null,
        weeklyMemos: ['', '', '', '', ''],
        cost: {
          time: '',
          money: '',
          physicalLoad: '',
          mentalLoad: '',
          opportunityCost: '',
          barrier: ''
        }
      };
    }

    // v312以前のデータにweeklyMemosがない場合のガード
    if (!routine.evaluation.weeklyMemos) {
      routine.evaluation.weeklyMemos = ['', '', '', '', ''];
    }

    // v309以前のデータにcostオブジェクトがない場合のガード
    if (!routine.evaluation.cost) {
      routine.evaluation.cost = {
        time: '', money: '', physicalLoad: '',
        mentalLoad: '', opportunityCost: '', barrier: ''
      };
    }

    // ネストしたフィールド（cost.time, weeklyMemo.0 など）に対応
    if (field.startsWith('cost.')) {
      const costField = field.split('.')[1];
      routine.evaluation.cost[costField] = value;
    } else if (field.startsWith('weeklyMemo.')) {
      const weekIndex = parseInt(field.split('.')[1], 10);
      if (weekIndex >= 0 && weekIndex <= 4) {
        routine.evaluation.weeklyMemos[weekIndex] = value;
      }
    } else {
      routine.evaluation[field] = value;
    }

    // DB保存
    saveMonthlyGoal(this.data.monthlyGoal);
  },

  // ルーティン達成率を計算（月間）
  async calculateRoutineAchievementRate(routineName, routineId) {
    const yearMonth = this.data.monthlyGoal?.yearMonth;
    if (!yearMonth) return 0;

    const journals = await getMonthJournals(yearMonth);
    if (journals.length === 0) return 0;

    let effectiveCount = 0;
    let totalCount = 0;

    journals.forEach(journal => {
      const routine = (routineId && journal.routines?.find(r => r.id === routineId)) || journal.routines?.find(r => r.name === routineName);
      if (routine) {
        totalCount++;
        const status = getRoutineStatus(routine);
        if (status === 'done') effectiveCount++;
      }
    });

    return totalCount > 0 ? Math.round((effectiveCount / totalCount) * 100) : 0;
  },

  // 達成率グラフの期間（'week' or 'month'）
  routineGraphPeriod: 'week',

  // 振り返りタブ状態
  reviewTab: 'monthly',
  reviewYearMonth: null,
  routineTableMode: 'week',
  reviewCalendarMonth: null,
  reviewCalendarYear: null,

  switchReviewTab(tab) {
    const validTabs = ['monthly', 'journals', 'routines'];
    this.reviewTab = validTabs.includes(tab) ? tab : 'monthly';
    this._keepScrollPosition = 0;
    this.render();
  },

  async toggleReviewRoutine(dateStr, routineIndex) {
    const journal = (this.data.reviewJournals || []).find(j => j.date === dateStr);
    if (!journal || !journal.routines || !journal.routines[routineIndex]) return;
    const routine = journal.routines[routineIndex];
    const current = getRoutineStatus(routine);
    const next = current === 'none' ? 'done' : current === 'done' ? 'partial' : 'none';
    routine.status = next;
    routine.done = next === 'done';
    await saveJournal(journal);
    // todayJournalとjournalsの同期
    const today = getTodayDate();
    if (journal.date === today) {
      this.data.todayJournal = journal;
    }
    const idx = (this.data.journals || []).findIndex(j => j.date === dateStr);
    if (idx !== -1) {
      this.data.journals[idx] = journal;
    }
    this.render();
  },

  // 振り返り月詳細を開く
  async viewReviewMonth(yearMonth) {
    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) return;
    try {
      const goal = await getMonthlyGoal(yearMonth);
      const journals = await getMonthJournals(yearMonth);
      journals.forEach(j => this.migratePolicyScores(j));
      this.reviewYearMonth = yearMonth;
      this.reviewTab = 'monthly';
      this.data.reviewMonthlyGoal = goal;
      this.data.reviewJournals = journals;
      this.navigate('review');
    } catch (err) {
      console.error('月データの取得に失敗:', err);
    }
  },

  // 振り返り一覧用：全月の日誌件数を読み込み
  async loadReviewListData() {
    const allJournals = await getAllData('journals');
    const monthMap = {};
    allJournals.forEach(j => {
      const month = j.month || (j.date ? j.date.substring(0, 7) : null);
      if (!month) return;
      if (!monthMap[month]) monthMap[month] = 0;
      if (hasJournalData(j)) monthMap[month]++;
    });
    this.data.reviewMonthJournalCounts = monthMap;
  },

  switchRoutineTableMode(mode) {
    this.routineTableMode = mode;
    this.render();
  },


  openCalendarPicker() {
    const container = document.getElementById('rv-calendar-picker');
    if (!container) return;
    const now = new Date();
    const selYear = this.reviewCalendarYear ?? now.getFullYear();
    const selMonth = this.reviewCalendarMonth ?? now.getMonth();

    container.style.display = 'flex';
    container.innerHTML = `
      <div class="rv-picker-card rv-drum-picker">
        <div class="rv-drum-header">年月を選択</div>
        <div class="rv-drum-row">
          <div class="rv-drum-col" id="drum-col-year">
            <button class="rv-drum-arrow" onclick="app.drumAdjust('year', 1)">▲</button>
            <div class="rv-drum-value" id="drum-year">${selYear}</div>
            <button class="rv-drum-arrow" onclick="app.drumAdjust('year', -1)">▼</button>
            <div class="rv-drum-label">年</div>
          </div>
          <div class="rv-drum-col" id="drum-col-month">
            <button class="rv-drum-arrow" onclick="app.drumAdjust('month', 1)">▲</button>
            <div class="rv-drum-value" id="drum-month">${selMonth + 1}</div>
            <button class="rv-drum-arrow" onclick="app.drumAdjust('month', -1)">▼</button>
            <div class="rv-drum-label">月</div>
          </div>
        </div>
        <div class="rv-drum-actions">
          <button class="rv-drum-today" onclick="app.drumToday()">今月に戻る</button>
          <button class="rv-drum-ok" onclick="app.drumConfirm()">決定</button>
        </div>
        <button class="rv-picker-close" onclick="app.closeCalendarPicker()">キャンセル</button>
      </div>
    `;
    this.initDrumTouch('drum-col-year', 'year');
    this.initDrumTouch('drum-col-month', 'month');
  },

  initDrumTouch(colId, type) {
    const col = document.getElementById(colId);
    if (!col) return;
    let startY = 0;
    let accumulated = 0;
    const threshold = 30;
    col.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      accumulated = 0;
    }, { passive: true });
    col.addEventListener('touchmove', (e) => {
      const deltaY = startY - e.touches[0].clientY;
      const steps = Math.floor((deltaY - accumulated) / threshold);
      if (steps !== 0) {
        for (let i = 0; i < Math.abs(steps); i++) {
          this.drumAdjust(type, steps > 0 ? 1 : -1);
        }
        accumulated += steps * threshold;
      }
    }, { passive: true });
  },

  drumAdjust(type, dir) {
    const el = document.getElementById(type === 'year' ? 'drum-year' : 'drum-month');
    if (!el) return;
    let val = parseInt(el.textContent);
    val += dir;
    if (type === 'month') {
      if (val > 12) val = 1;
      if (val < 1) val = 12;
    }
    el.textContent = val;
  },

  drumToday() {
    const now = new Date();
    const yearEl = document.getElementById('drum-year');
    const monthEl = document.getElementById('drum-month');
    if (yearEl) yearEl.textContent = now.getFullYear();
    if (monthEl) monthEl.textContent = now.getMonth() + 1;
    this.drumConfirm();
  },

  drumConfirm() {
    const yearEl = document.getElementById('drum-year');
    const monthEl = document.getElementById('drum-month');
    if (!yearEl || !monthEl) return;
    const year = parseInt(yearEl.textContent);
    const month = parseInt(monthEl.textContent) - 1;
    this.reviewCalendarMonth = month;
    this.reviewCalendarYear = year;
    this.calendarSelectedDate = null;
    this.closeCalendarPicker();
    this.loadReviewCalendarJournals(year, month);
  },

  calendarSelectedDate: null,

  toggleDaySummary(dateStr, cellEl) {
    const container = document.getElementById('rv-day-summary');
    if (!container) return;
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    if (this.calendarSelectedDate === dateStr && container.classList.contains('active')) {
      this.calendarSelectedDate = null;
      container.classList.remove('active');
      return;
    }
    this.calendarSelectedDate = dateStr;
    if (cellEl) cellEl.classList.add('selected');
    this.loadDaySummary(dateStr, container);
  },

  closeDaySummary() {
    const container = document.getElementById('rv-day-summary');
    if (container) container.classList.remove('active');
    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    this.calendarSelectedDate = null;
  },

  // カレンダーからのルーティン○△×トグル
  async toggleCalendarRoutine(dateStr, routineIndex) {
    const journal = await getJournal(dateStr);
    if (!journal.routines || !journal.routines[routineIndex]) return;

    // 3段階サイクル: none → done → partial → none
    const routine = journal.routines[routineIndex];
    const current = getRoutineStatus(routine);
    const next = current === 'none' ? 'done' : current === 'done' ? 'partial' : 'none';
    routine.status = next;
    routine.done = next === 'done';

    await saveJournal(journal);

    // todayJournalとの同期
    const today = getTodayDate();
    if (journal.date === today) {
      this.data.todayJournal = journal;
    }

    // calendarJournalsキャッシュ更新
    if (this.data.calendarJournals) {
      const idx = this.data.calendarJournals.findIndex(j => j.date === dateStr);
      if (idx !== -1) {
        this.data.calendarJournals[idx] = journal;
      }
    }

    // journalsキャッシュ更新
    const jIdx = (this.data.journals || []).findIndex(j => j.date === dateStr);
    if (jIdx !== -1) {
      this.data.journals[jIdx] = journal;
    }

    // グリッドのドットを更新するためrender（DOM全差替え）
    this.render();

    // render後に選択状態と詳細パネルを復元
    if (this.calendarSelectedDate === dateStr) {
      const dayCell = document.querySelector(`.calendar-day[onclick*="${dateStr}"]`);
      if (dayCell) dayCell.classList.add('selected');
      const container = document.getElementById('rv-day-summary');
      if (container) {
        this.loadDaySummary(dateStr, container);
      }
    }
  },

  async loadDaySummary(dateStr, container) {
    try {
      const journal = await getJournal(dateStr);
      if (this.calendarSelectedDate !== dateStr) return;
      const dateLabel = formatDateWithDayOfWeek(dateStr);
      const today = getTodayDate();
      const isFuture = dateStr > today;

      // カレンダー表示月のmonthlyGoalを使用（月切替対応）
      const calMG = this.data.calendarMonthlyGoal || this.data.monthlyGoal;

      // --- スケジュール（パターンから計算） ---
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const matchingPatterns = this.getDateMatchingPatterns(dateObj, calMG);
      const pattern = matchingPatterns.length > 0 ? matchingPatterns[0] : null;
      const patternSchedule = pattern ? [...(pattern.schedule || [])].sort((a, b) =>
        (a.startHour * 60 + (a.startMinute || 0)) - (b.startHour * 60 + (b.startMinute || 0))
      ) : [];

      // --- ルーティン ---
      const hasJournal = hasJournalData(journal);
      const routines = hasJournal ? (journal.routines || []) : (calMG?.routines || []);
      const namedRoutines = routines.filter(r => r.name);
      const total = namedRoutines.length;
      let doneCount = 0, partialCount = 0;
      if (hasJournal) {
        doneCount = namedRoutines.filter(r => getRoutineStatus(r) === 'done').length;
        partialCount = namedRoutines.filter(r => getRoutineStatus(r) === 'partial').length;
      }
      const rate = total > 0 ? Math.round(((doneCount + partialCount * 0.5) / total) * 100) : 0;

      // --- コアアクション ---
      const coreActions = hasJournal ? (journal.coreActions || {}) : null;
      const coreMG = calMG?.coreActions || {};

      // --- タスク ---
      const allTasks = this.data.calendarTasks || [];
      const dayTasks = allTasks.filter(t => {
        if (t.status === 'done') return false;
        if (t.dateTime && t.dateTime.startsWith(dateStr)) return true;
        if (t.deadline && t.deadline === dateStr) return true;
        return false;
      });

      // --- スケジュールHTML ---
      let scheduleHTML = '';
      if (patternSchedule.length > 0) {
        scheduleHTML = `
          <div class="cal-section">
            <div class="cal-section-title">${getIcon('calendar')} ${escapeHtml(pattern.name || 'スケジュール')}</div>
            <div class="cal-timeline">
              ${patternSchedule.map(slot => {
                const sh = String(slot.startHour).padStart(2, '0');
                const sm = String(slot.startMinute || 0).padStart(2, '0');
                return `<div class="cal-timeline-item">
                  <span class="cal-timeline-time">${sh}:${sm}</span>
                  <span class="cal-timeline-bar"></span>
                  <span class="cal-timeline-text">${escapeHtml(slot.activity || '')}</span>
                </div>`;
              }).join('')}
            </div>
          </div>`;
      }

      // --- ルーティンHTML ---
      let routineHTML = '';
      if (total > 0) {
        const canToggle = hasJournal && !isFuture;
        const routineItems = namedRoutines.map((r, i) => {
          const origIdx = routines.indexOf(r);
          const s = hasJournal ? getRoutineStatus(r) : 'none';
          const sym = s === 'done' ? '○' : s === 'partial' ? '△' : '×';
          const cls = s === 'done' ? 'done' : s === 'partial' ? 'partial' : 'none';
          const onClick = canToggle ? `onclick="app.toggleCalendarRoutine('${dateStr}', ${origIdx})"` : '';
          const cursor = canToggle ? 'cursor:pointer;' : 'opacity:0.6;';
          return `<span class="cal-routine-item cal-r-${cls}" ${onClick} style="${cursor}">${sym} ${escapeHtml(r.name)}</span>`;
        }).join('');

        routineHTML = `
          <div class="cal-section">
            <div class="cal-section-title">ルーティン ${hasJournal ? `${rate}%` : ''}${!hasJournal ? ' <span class="cal-template-badge">テンプレート</span>' : ''}</div>
            <div class="cal-routine-list">${routineItems}</div>
          </div>`;
      }

      // --- コアアクションHTML ---
      let coreHTML = '';
      const coreTypes = [
        { key: 'deadline', label: '期日' },
        { key: 'processing', label: '要処理' },
        { key: 'habit', label: '習慣' },
        { key: 'other', label: 'その他' }
      ];
      const coreItems = coreTypes.map(ct => {
        const name = hasJournal ? (coreActions[ct.key]?.name || '') : (coreMG[ct.key] || '');
        if (!name) return '';
        const done = hasJournal ? (coreActions[ct.key]?.done || false) : false;
        const check = done ? '☑' : '☐';
        return `<div class="cal-core-item ${done ? 'done' : ''}">${check} ${escapeHtml(ct.label)}: ${escapeHtml(name)}</div>`;
      }).filter(Boolean);
      if (coreItems.length > 0) {
        coreHTML = `
          <div class="cal-section">
            <div class="cal-section-title">コアアクション</div>
            ${coreItems.join('')}
          </div>`;
      }

      // --- タスクHTML ---
      let taskHTML = '';
      if (dayTasks.length > 0) {
        const taskItems = dayTasks.map(t => {
          const timeStr = t.dateTime ? t.dateTime.substring(11, 16) : '';
          return `<div class="cal-task-item">${timeStr ? `<span class="cal-task-time">${timeStr}</span>` : ''}<span>${escapeHtml(t.title)}</span></div>`;
        }).join('');
        taskHTML = `
          <div class="cal-section">
            <div class="cal-section-title">タスク</div>
            ${taskItems}
          </div>`;
      }

      // --- 期日アイテムHTML ---
      let deadlineHTML = '';
      const dlItems = (calMG?.deadlineItems || []).filter(di => di.date === dateStr && di.title);
      if (dlItems.length > 0) {
        deadlineHTML = `
          <div class="cal-section">
            <div class="cal-section-title">期日アイテム</div>
            ${dlItems.map(di => `<div class="cal-deadline-item">${escapeHtml(di.title)}</div>`).join('')}
          </div>`;
      }

      // --- 週次マイルストーンHTML ---
      let milestoneHTML = '';
      const msMilestones = calMG?.weeklyMilestones || [];
      if (new Date(y, m - 1, d).getDay() === 1 && msMilestones.length > 0) {
        let mondayCount = 0;
        for (let md = 1; md <= d; md++) {
          if (new Date(y, m - 1, md).getDay() === 1) mondayCount++;
        }
        const msText = msMilestones[mondayCount - 1] || '';
        if (msText) {
          milestoneHTML = `
            <div class="cal-section">
              <div class="cal-section-title">週次マイルストーン（第${mondayCount}週）</div>
              <div class="cal-milestone-item">${escapeHtml(msText)}</div>
            </div>`;
        }
      }

      const hasAnyContent = scheduleHTML || routineHTML || coreHTML || taskHTML || deadlineHTML || milestoneHTML || (hasJournal && journal.resolution);

      container.innerHTML = `
        <div class="rv-day-card">
          <div class="rv-day-header">
            <div class="rv-day-date">${escapeHtml(dateLabel)}</div>
            <div>
              ${hasJournal ? `<button class="rv-day-link" onclick="app.viewJournal('${dateStr}')">日誌を見る →</button>` : ''}
              <button class="rv-day-close" onclick="app.closeDaySummary()">×</button>
            </div>
          </div>
          ${hasAnyContent ? `
            ${scheduleHTML}
            ${deadlineHTML}
            ${milestoneHTML}
            ${routineHTML}
            ${coreHTML}
            ${taskHTML}
            ${hasJournal && journal.resolution ? `<div class="rv-day-resolution">「${escapeHtml(journal.resolution)}」</div>` : ''}
          ` : '<div class="rv-day-empty">データなし</div>'}
        </div>
      `;
      container.classList.add('active');
    } catch (e) {
      console.error('loadDaySummary error:', e);
      this.calendarSelectedDate = null;
      container.innerHTML = '<div class="rv-day-card"><div class="rv-day-empty">読み込みエラー</div></div>';
      container.classList.add('active');
    }
  },

  closeCalendarPicker() {
    const container = document.getElementById('rv-calendar-picker');
    if (container) {
      container.style.display = 'none';
      container.classList.remove('rv-picker-top');
      container.innerHTML = '';
    }
  },

  async saveDayMemo(dateStr, memo) {
    const journal = await getJournal(dateStr);
    const trimmed = memo.trim();
    if (trimmed) {
      journal.calendarMemo = trimmed;
    } else {
      delete journal.calendarMemo;
    }
    await saveJournal(journal);
    this.loadReviewCalendarJournals(
      this.reviewCalendarYear ?? new Date().getFullYear(),
      this.reviewCalendarMonth ?? new Date().getMonth()
    );
  },

  reviewCalendarPrev() {
    const now = new Date();
    let m = this.reviewCalendarMonth ?? now.getMonth();
    let y = this.reviewCalendarYear ?? now.getFullYear();
    m--;
    if (m < 0) { m = 11; y--; }
    this.reviewCalendarMonth = m;
    this.reviewCalendarYear = y;
    this.calendarSelectedDate = null;
    this.loadReviewCalendarJournals(y, m);
  },

  reviewCalendarNext() {
    const now = new Date();
    let m = this.reviewCalendarMonth ?? now.getMonth();
    let y = this.reviewCalendarYear ?? now.getFullYear();
    m++;
    if (m > 11) { m = 0; y++; }
    this.reviewCalendarMonth = m;
    this.reviewCalendarYear = y;
    this.calendarSelectedDate = null;
    this.loadReviewCalendarJournals(y, m);
  },

  async loadReviewCalendarJournals(year, month) {
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    this.data.calendarJournals = await getMonthJournals(yearMonth);
    this.data.calendarJournals.forEach(j => this.migratePolicyScores(j));
    // 表示月のmonthlyGoalを読み込み（パターン計算用）
    this.data.calendarMonthlyGoal = await getMonthlyGoal(yearMonth);
    // タスク読み込み（カレンダー表示用）
    this.data.calendarTasks = await getAllTasks();
    this.render();
  },


  switchRoutineGraphPeriod(period) {
    this.routineGraphPeriod = period;
    this.render();
  },

  // 達成率グラフを描画（render()後に自動呼び出し）
  async renderRoutineGraph() {
    const bars = document.getElementById('routine-graph-bars');
    if (!bars) return;
    const rates = this.routineGraphPeriod === 'week'
      ? await this.calculateWeeklyRoutineRates()
      : await this.calculateMonthlyRoutineRates();
    if (rates.length === 0 || rates.every(r => r.rate < 0)) {
      bars.innerHTML = '<p class="routine-graph-empty">データがありません</p>';
      return;
    }
    bars.innerHTML = rates.map(r => {
      if (r.rate < 0) return '';
      const colorClass = r.rate >= 80 ? 'high' : r.rate >= 50 ? 'mid' : 'low';
      return '<div class="routine-bar-col">' +
        '<div class="routine-bar-value">' + r.rate + '%</div>' +
        '<div class="routine-bar-track"><div class="routine-bar-fill ' + colorClass + '" style="height:' + r.rate + '%"></div></div>' +
        '<div class="routine-bar-label">' + escapeHtml(r.label) + '</div>' +
      '</div>';
    }).join('');
  },

  // 月次評価の達成率を非同期描画（インラインscript除去の代替）
  async renderEvalAchievementRates() {
    const elements = document.querySelectorAll('[id^="achievement-"]');
    if (elements.length === 0) return;
    const routines = this.data.monthlyGoal?.routines || [];
    for (const el of elements) {
      const index = parseInt(el.id.replace('achievement-', ''));
      const routine = routines[index];
      if (routine && routine.name) {
        const rate = await this.calculateRoutineAchievementRate(routine.name, routine.id);
        el.textContent = rate + '%';
      }
    }
  },

  // 直近7日間の日別達成率を計算
  async calculateWeeklyRoutineRates() {
    const rates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const journal = await getJournal(dateStr);
      const routines = journal.routines || [];
      const total = routines.filter(r => r.name).length;
      const doneW = routines.filter(r => getRoutineStatus(r) === 'done').length;
      const partialW = routines.filter(r => getRoutineStatus(r) === 'partial').length;
      const rate = total > 0 ? Math.round(((doneW + partialW * 0.5) / total) * 100) : -1;
      const dayNames = ['日','月','火','水','木','金','土'];
      rates.push({ label: dayNames[d.getDay()], rate, date: dateStr });
    }
    return rates;
  },

  // 今月の週別達成率を計算
  async calculateMonthlyRoutineRates() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const journals = await getMonthJournals(yearMonth);
    const weeks = [[], [], [], [], []];
    journals.forEach(j => {
      const day = new Date(j.date).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[weekIndex].push(j);
    });
    return weeks.map((weekJournals, i) => {
      let totalEffective = 0, totalCount = 0;
      weekJournals.forEach(j => {
        const routines = j.routines || [];
        const named = routines.filter(r => r.name);
        totalCount += named.length;
        named.forEach(r => {
          const s = getRoutineStatus(r);
          if (s === 'done') totalEffective++;
          else if (s === 'partial') totalEffective += 0.5;
        });
      });
      return {
        label: `${i + 1}W`,
        rate: totalCount > 0 ? Math.round((totalEffective / totalCount) * 100) : -1
      };
    }).filter(w => w.rate >= 0);
  },

  // 評価展開中のルーティン
  expandedEvalRoutineIndex: null,

  toggleEvalRoutineDetail(index) {
    if (this.expandedEvalRoutineIndex === index) {
      this.expandedEvalRoutineIndex = null;
    } else {
      this.expandedEvalRoutineIndex = index;
    }
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  /* ========================================
     長期目標操作
     ======================================== */

  updateLongTermGoal(field, value) {
    if (!this.data.longTermGoal) {
      this.data.longTermGoal = { id: Date.now() };
    }
    this.data.longTermGoal[field] = value;
    // 期限の年と月が両方揃った時だけ逆算目標を自動生成
    if (['deadlineYear', 'deadlineMonth', 'startYear', 'startMonth'].includes(field)) {
      const g = this.data.longTermGoal;
      if (parseInt(g.deadlineYear) && parseInt(g.deadlineMonth)) {
        this.generateMilestones();
      }
    }
  },

  async viewLongTermGoal(id) {
    this.data.longTermGoal = await getLongTermGoal(id);
    this.navigate('longterm');
  },

  createNewLongTermGoal(type = null, mainGoalId = null) {
    // メインは1つだけ
    if (type === 'main') {
      const existing = (this.data.longTermGoals || []).find(g => g.type === 'main');
      if (existing) {
        this.showToast('メイン長期目標は1つだけ作成できます');
        return;
      }
    }
    const now = new Date();
    this.data.longTermGoal = {
      id: Date.now(),
      goal: '',
      type: type,
      mainGoalId: type === 'sub' ? mainGoalId : null,
      startYear: String(now.getFullYear()),
      startMonth: String(now.getMonth() + 1),
      deadlineYear: '',
      deadlineMonth: '',
      milestones: []
    };
    this.navigate('longterm');
  },

  generateMilestones() {
    const g = this.data.longTermGoal;
    if (!g) return;
    const dY = parseInt(g.deadlineYear);
    const dM = parseInt(g.deadlineMonth);
    if (!dY || !dM) return;

    // 開始月の次月 or 今月の次月（どちらか遅い方）が下限
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    let startLimitY = curY, startLimitM = curM + 1;
    if (startLimitM > 12) { startLimitM = 1; startLimitY++; }

    const sY = parseInt(g.startYear);
    const sM = parseInt(g.startMonth);
    if (sY && sM) {
      let afterStartY = sY, afterStartM = sM + 1;
      if (afterStartM > 12) { afterStartM = 1; afterStartY++; }
      // 開始日の次月が今月の次月より後なら、そちらを下限にする
      if (afterStartY > startLimitY || (afterStartY === startLimitY && afterStartM > startLimitM)) {
        startLimitY = afterStartY;
        startLimitM = afterStartM;
      }
    }

    // 既存の目標テキストを年月キーで保持
    const existing = {};
    (g.milestones || []).forEach(m => {
      if (m.year && m.month && m.goal) {
        existing[`${m.year}-${m.month}`] = m.goal;
      }
    });

    // 期限の1ヶ月前から下限まで生成
    const newMilestones = [];
    let y = dY, m = dM - 1;
    if (m === 0) { m = 12; y--; }
    while (y > startLimitY || (y === startLimitY && m >= startLimitM)) {
      const key = `${y}-${m}`;
      newMilestones.push({ year: String(y), month: String(m), goal: existing[key] || '' });
      m--;
      if (m === 0) { m = 12; y--; }
    }
    g.milestones = newMilestones;
    // スクロール位置を保持して再描画
    this._keepScrollPosition = true;
    this.render();
  },

  removeMilestone(index) {
    this.data.longTermGoal.milestones.splice(index, 1);
    this.render();
  },

  // 確認モーダル表示
  showConfirmModal(targetName, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-message">
          <div>この${escapeHtml(targetName)}を</div>
          <div>消去しますか？</div>
        </div>
        <div class="confirm-buttons">
          <button class="confirm-btn cancel">キャンセル</button>
          <button class="confirm-btn ok">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.confirm-btn.cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-btn.ok').onclick = () => {
      overlay.remove();
      onConfirm();
    };
  },

  // 日誌を明示的に保存（確認あり）
  confirmSaveJournal() {
    this.showSaveConfirmModal('日誌', async () => {
      if (!this.data.todayJournal.title) {
        await this.autoGenerateTitle(this.data.todayJournal);
      }
      await saveJournal(this.data.todayJournal);
      this.data.journals = await getMonthJournals(this.journalListMonth || getCurrentMonth());
      this.data.journals.forEach(j => this.migratePolicyScores(j));
      // Notion自動同期（バックグラウンド）
      this.syncJournalToNotion(this.data.todayJournal).catch(() => {});
    });
  },

  // 月次目標を明示的に保存（確認あり）
  confirmSaveMonthlyGoal() {
    this.showSaveConfirmModal('月次目標', async () => {
      await saveMonthlyGoal(this.data.monthlyGoal);
      this.data.monthlyGoals = await getAllMonthlyGoals();
      // Notion自動同期（バックグラウンド）
      this.syncMonthlyGoalToNotion(this.data.monthlyGoal).catch(() => {});
    });
  },

  // 長期目標を明示的に保存（確認あり）
  confirmSaveLongTermGoal() {
    this.showSaveConfirmModal('長期目標', async () => {
      await saveLongTermGoal(this.data.longTermGoal);
      this.data.longTermGoals = await getAllLongTermGoals();
      // Notion自動同期（バックグラウンド・全長期目標を再書出し）
      this.syncLongTermGoalToNotion().catch(() => {});
    });
  },

  // 現在の記入ページのデータを保存（ページ遷移なし・バックグラウンド保存用）
  async saveCurrentPageData() {
    const current = this.currentPage;
    if (!current) return;

    const journalGroup = ['journal', 'journal-supplement'];

    if (journalGroup.includes(current)) {
      if (!this.data.todayJournal.title) {
        await this.autoGenerateTitle(this.data.todayJournal);
      }
      await saveJournal(this.data.todayJournal);
    } else if (current === 'monthly') {
      await saveMonthlyGoal(this.data.monthlyGoal);
    } else if (current === 'longterm') {
      // 編集中のtextarea値をデータに反映してから保存
      const longtermTextarea = document.getElementById('longterm-card-edit-goal');
      if (longtermTextarea) {
        if (!this.data.longTermGoal) {
          this.data.longTermGoal = { goal: '' };
        }
        this.data.longTermGoal.goal = longtermTextarea.value;
      }
      const milestoneTextareas = document.querySelectorAll('[id^="milestone-edit-"]');
      milestoneTextareas.forEach(textarea => {
        const index = parseInt(textarea.id.replace('milestone-edit-', ''));
        if (!isNaN(index) && this.data.longTermGoal?.milestones?.[index]) {
          this.data.longTermGoal.milestones[index].goal = textarea.value;
        }
      });
      await saveLongTermGoal(this.data.longTermGoal);
    } else if (current === 'life') {
      if (this.data.lifeDesign) {
        await saveLifeDesign(this.data.lifeDesign);
      }
    }
  },

  // 記入ページから離れる時の自動保存
  async autoSaveOnLeaveEntryPage(newPage) {
    const current = this.currentPage;
    if (!current) return;

    // 日誌グループ: journal, journal-supplement
    const journalGroup = ['journal', 'journal-supplement'];
    // 月次グループ: monthly
    const monthlyGroup = ['monthly'];
    // 長期グループ: longterm
    const longtermGroup = ['longterm'];

    // 日誌グループから離れる場合
    if (journalGroup.includes(current) && !journalGroup.includes(newPage)) {
      await saveJournal(this.data.todayJournal);
    }
    // 月次グループから離れる場合
    else if (monthlyGroup.includes(current) && !monthlyGroup.includes(newPage)) {
      await saveMonthlyGoal(this.data.monthlyGoal);
      await this.syncMonthlyToJournal();
    }
    // 長期グループから離れる場合
    else if (longtermGroup.includes(current) && !longtermGroup.includes(newPage)) {
      // goal-cardが編集中の場合、textareaの値を取得してデータに反映
      const longtermTextarea = document.getElementById('longterm-card-edit-goal');
      if (longtermTextarea) {
        if (!this.data.longTermGoal) {
          this.data.longTermGoal = { goal: '' };
        }
        this.data.longTermGoal.goal = longtermTextarea.value;
      }
      // 逆算目標が編集中の場合、textareaの値を取得してデータに反映
      const milestoneTextareas = document.querySelectorAll('[id^="milestone-edit-"]');
      milestoneTextareas.forEach(textarea => {
        const index = parseInt(textarea.id.replace('milestone-edit-', ''));
        if (!isNaN(index) && this.data.longTermGoal?.milestones?.[index]) {
          this.data.longTermGoal.milestones[index].goal = textarea.value;
        }
      });
      await saveLongTermGoal(this.data.longTermGoal);
    }
  },

  // 保存確認モーダル
  showSaveConfirmModal(targetName, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-message">
          <div>この${escapeHtml(targetName)}を</div>
          <div>保存しますか？</div>
        </div>
        <div class="confirm-buttons">
          <button class="confirm-btn cancel">キャンセル</button>
          <button class="confirm-btn ok save">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.confirm-btn.cancel').onclick = () => overlay.remove();
    overlay.querySelector('.confirm-btn.ok').onclick = () => {
      overlay.remove();
      onConfirm();
    };
  },

  // 現在の日誌を消去確認
  confirmDeleteCurrentJournal() {
    const date = this.data.todayJournal?.date;
    if (!date) return;
    this.showConfirmModal('日誌', () => this.deleteJournalAndNavigate(date));
  },

  async deleteJournalAndNavigate(date) {
    await deleteJournal(date);
    this.data.journals = await getMonthJournals(this.journalListMonth || getCurrentMonth());
    this.data.journals.forEach(j => this.migratePolicyScores(j));
    this.data.todayJournal = await getJournal(getTodayDate());
    this.migratePolicyScores(this.data.todayJournal);
    this.navigate('journal-list');
  },

  // 現在の月次目標を消去確認
  confirmDeleteCurrentMonthlyGoal() {
    const yearMonth = this.data.monthlyGoal?.yearMonth;
    if (!yearMonth) return;
    this.showConfirmModal('月次目標', () => this.deleteMonthlyGoalAndNavigate(yearMonth));
  },

  async deleteMonthlyGoalAndNavigate(yearMonth) {
    await deleteMonthlyGoal(yearMonth);
    this.data.monthlyGoals = await getAllMonthlyGoals();
    this.data.monthlyGoal = await getMonthlyGoal(getCurrentMonth());
    this.navigate('monthly-list');
  },

  // 現在の長期目標を消去確認
  confirmDeleteCurrentLongTermGoal() {
    const id = this.data.longTermGoal?.id;
    if (!id) return;
    this.showConfirmModal('長期目標', () => this.deleteLongTermGoalAndNavigate(id));
  },

  async deleteLongTermGoalAndNavigate(id) {
    await deleteLongTermGoal(id);
    this.data.longTermGoals = await getAllLongTermGoals();
    this.data.longTermGoal = this.getClosestDeadlineGoal(this.data.longTermGoals);
    this.navigate('longterm-list');
  },

  // 日誌削除確認（一覧から）
  confirmDeleteJournal(date) {
    this.showConfirmModal('日誌', () => this.deleteJournal(date));
  },

  async deleteJournal(date) {
    await deleteJournal(date);
    this.data.journals = await getMonthJournals(this.journalListMonth || getCurrentMonth());
    this.data.journals.forEach(j => this.migratePolicyScores(j));
    this.render();
  },

  // 月次目標削除確認（一覧から）
  confirmDeleteMonthlyGoal(yearMonth) {
    this.showConfirmModal('月次目標', () => this.deleteMonthlyGoal(yearMonth));
  },

  async deleteMonthlyGoal(yearMonth) {
    await deleteMonthlyGoal(yearMonth);
    this.data.monthlyGoals = await getAllMonthlyGoals();
    this.render();
  },

  // 長期目標削除確認（一覧から）
  confirmDeleteLongTermGoal(id) {
    this.showConfirmModal('長期目標', () => this.deleteLongTermGoal(id));
  },

  async deleteLongTermGoal(id) {
    // メイン削除時、紐づくサブを独立に戻す
    const goal = (this.data.longTermGoals || []).find(g => g.id === id);
    if (goal && goal.type === 'main') {
      const subs = (this.data.longTermGoals || []).filter(g => g.type === 'sub' && g.mainGoalId === id);
      for (const sub of subs) {
        sub.type = null;
        sub.mainGoalId = null;
        await saveLongTermGoal(sub);
      }
    }
    await deleteLongTermGoal(id);
    this.data.longTermGoals = await getAllLongTermGoals();
    this.render();
  },

  // 長期目標タイプ変更
  async changeLongTermGoalType(id, newType) {
    const goal = (this.data.longTermGoals || []).find(g => g.id === id);
    if (!goal) return;

    if (newType === 'main') {
      const existing = (this.data.longTermGoals || []).find(g => g.type === 'main' && g.id !== id);
      if (existing) {
        this.showToast('メイン長期目標は1つだけ作成できます');
        return;
      }
      goal.type = 'main';
      goal.mainGoalId = null;
    } else if (newType === 'sub') {
      const mainGoal = (this.data.longTermGoals || []).find(g => g.type === 'main');
      if (!mainGoal) {
        this.showToast('先にメイン長期目標を作成してください');
        return;
      }
      goal.type = 'sub';
      goal.mainGoalId = mainGoal.id;
    } else {
      // 独立に変更
      goal.type = null;
      goal.mainGoalId = null;
    }

    await saveLongTermGoal(goal);
    this.data.longTermGoals = await getAllLongTermGoals();
    this.render();
  },

  // 長期目標作成メニュー表示
  showCreateLongTermMenu() {
    const mainExists = (this.data.longTermGoals || []).some(g => g.type === 'main');

    // メインが存在する場合：サブはメインブロック内の「+サブ追加」から作るのでFABでは独立のみ
    // メインが存在しない場合：メイン作成と独立作成を表示
    if (mainExists) {
      // メインあり → 独立目標を直接作成（メニュー不要）
      this.createNewLongTermGoal();
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal" style="max-width:300px">
        <div class="confirm-message" style="margin-bottom:12px;font-weight:600">長期目標を作成</div>
        <button class="btn-action" style="width:100%;margin-bottom:8px;padding:12px;border:1px solid var(--primary);border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-size:14px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay')); app.createNewLongTermGoal('main')">★ メイン長期目標</button>
        <button class="btn-action" style="width:100%;margin-bottom:8px;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-primary);font-size:14px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay')); app.createNewLongTermGoal()">独立した目標</button>
        <button style="width:100%;padding:10px;border:none;border-radius:var(--radius-sm);background:var(--bg-gray);color:var(--text-secondary);font-size:13px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay'))">キャンセル</button>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
  },

  // 長期目標タイプ変更メニュー表示
  showChangeTypeMenu(id) {
    const goal = (this.data.longTermGoals || []).find(g => g.id === id);
    if (!goal) return;
    const mainExists = (this.data.longTermGoals || []).some(g => g.type === 'main');
    const isMain = goal.type === 'main';
    const isSub = goal.type === 'sub';

    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-modal" style="max-width:300px">
        <div class="confirm-message" style="margin-bottom:12px;font-weight:600">タイプを変更</div>
        ${!isMain && !mainExists ? `<button style="width:100%;margin-bottom:8px;padding:12px;border:1px solid var(--primary);border-radius:var(--radius-sm);background:var(--primary);color:#fff;font-size:14px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay')); app.changeLongTermGoalType(${id}, 'main')">★ メインに昇格</button>` : ''}
        ${!isSub && mainExists && !isMain ? `<button style="width:100%;margin-bottom:8px;padding:12px;border:1px solid var(--primary);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-primary);font-size:14px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay')); app.changeLongTermGoalType(${id}, 'sub')">サブに紐づけ</button>` : ''}
        ${(isMain || isSub) ? `<button style="width:100%;margin-bottom:8px;padding:12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-primary);font-size:14px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay')); app.changeLongTermGoalType(${id}, null)">独立に変更</button>` : ''}
        <button style="width:100%;padding:10px;border:none;border-radius:var(--radius-sm);background:var(--bg-gray);color:var(--text-secondary);font-size:13px;cursor:pointer" onclick="document.body.removeChild(this.closest('.confirm-overlay'))">キャンセル</button>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
  },

  /* ========================================
     人生設計操作
     ======================================== */

  expandLifeCard(field) {
    const card = document.getElementById(`life-card-${field}`);
    if (!card) return;

    const isExpanded = card.classList.contains('expanded');

    if (isExpanded) {
      // 閉じる（キャンセル扱い）
      this.closeLifeCardExpand(field);
    } else {
      // 展開
      const currentText = this.data.lifeDesign[field] || '';
      const content = card.querySelector('.life-card-content');

      // はみ出ていない場合はすぐに編集モードへ
      const isOverflow = content && content.scrollHeight > content.clientHeight;

      card.classList.add('expanded');

      if (!isOverflow) {
        this.enterEditMode('life', field);
        return;
      }

      // はみ出ている場合は閲覧モード
      if (content) {
        content.style.maxHeight = 'none';
        content.innerHTML = `<div class="expand-view-text" onclick="event.stopPropagation(); app.enterEditMode('life', '${field}')">${escapeHtml(currentText)}</div>`;
      }

      // ボタンを編集/閉じるに
      const more = card.querySelector('.life-card-more');
      if (more) {
        more.innerHTML = `
          <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeLifeCardExpand('${field}')">閉じる</button>
          <button class="expand-btn save" onclick="event.stopPropagation(); app.enterEditMode('life', '${field}')">編集</button>
        `;
      }
    }
  },

  closeLifeCardExpand(field) {
    const card = document.getElementById(`life-card-${field}`);
    if (!card) return;

    card.classList.remove('expanded');

    // 再描画して元に戻す
    this.render();
  },

  async saveLifeCardExpand(field) {
    const textarea = document.getElementById(`life-card-edit-${field}`);
    if (!textarea) return;

    const newValue = textarea.value;

    this.data.lifeDesign[field] = newValue;
    await saveLifeDesign(this.data.lifeDesign);

    this.closeLifeCardExpand(field);
  },

  editLifeDesign(field) {
    // 長文展開で編集するので、直接展開を呼ぶ
    this.expandLifeCard(field);
  },

  showTextEditModal(title, currentValue, onSave) {
    const container = document.createElement('div');
    container.id = 'modal-container';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:11000;';

    container.innerHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()" style="width:90%;max-width:400px;">
          <div class="modal-title">${escapeHtml(title)}</div>
          <textarea id="text-edit-input" class="modal-input modal-textarea" rows="10" placeholder="入力してください...">${escapeHtml(currentValue)}</textarea>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.confirmTextEdit()">保存</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this._textEditCallback = onSave;

    setTimeout(() => {
      const input = document.getElementById('text-edit-input');
      if (input) input.focus();
    }, 100);
  },

  confirmTextEdit() {
    const input = document.getElementById('text-edit-input');
    if (input && this._textEditCallback) {
      this._textEditCallback(input.value);
      this._textEditCallback = null;
    }
    this.closeModalDirect();
  },

  async updateLifeDesign(field, value) {
    this.data.lifeDesign[field] = value;
    await saveLifeDesign(this.data.lifeDesign);
  },

  async addAgeGoal() {
    if (!this.data.lifeDesign.ageGoals) {
      this.data.lifeDesign.ageGoals = [];
    }
    this.data.lifeDesign.ageGoals.push({ age: '', goal: '' });
    await saveLifeDesign(this.data.lifeDesign);
    this.render();
  },

  async updateAgeGoal(index, field, value) {
    this.data.lifeDesign.ageGoals[index][field] = value;
    // 年齢順にソート（空の年齢は最後に）
    this.data.lifeDesign.ageGoals.sort((a, b) => {
      if (a.age === '' || a.age === null) return 1;
      if (b.age === '' || b.age === null) return -1;
      return parseInt(a.age) - parseInt(b.age);
    });
    await saveLifeDesign(this.data.lifeDesign);
    this.render();
  },

  async removeAgeGoal(index) {
    this.data.lifeDesign.ageGoals.splice(index, 1);
    await saveLifeDesign(this.data.lifeDesign);
    this.render();
  },

  // 年齢別目標の「続きを見る」展開（閲覧モード）
  expandAgeGoal(index) {
    const wrapper = document.getElementById(`goal-wrapper-${index}`);
    const textarea = document.getElementById(`goal-textarea-${index}`);
    const more = wrapper?.querySelector('.goal-more');
    const buttonsView = wrapper?.querySelector('.goal-buttons-view');
    const buttonsEdit = wrapper?.querySelector('.goal-buttons-edit');

    if (!wrapper || !textarea) return;

    wrapper.classList.add('expanded');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.readOnly = true;

    if (more) more.style.display = 'none';
    if (buttonsView) buttonsView.style.display = 'flex';
    if (buttonsEdit) buttonsEdit.style.display = 'none';
  },

  closeAgeGoalExpand(index) {
    const wrapper = document.getElementById(`goal-wrapper-${index}`);
    const textarea = document.getElementById(`goal-textarea-${index}`);
    const more = wrapper?.querySelector('.goal-more');
    const buttonsView = wrapper?.querySelector('.goal-buttons-view');
    const buttonsEdit = wrapper?.querySelector('.goal-buttons-edit');

    if (!wrapper || !textarea) return;

    wrapper.classList.remove('expanded');
    textarea.style.height = '';
    textarea.readOnly = false;

    if (buttonsView) buttonsView.style.display = 'none';
    if (buttonsEdit) buttonsEdit.style.display = 'none';
    if (more) more.style.display = '';

    // 少し待ってからオーバーフローチェック
    setTimeout(() => this.checkOverflow(), 10);
  },

  // 閲覧モードから編集モードへ
  editAgeGoal(index) {
    const wrapper = document.getElementById(`goal-wrapper-${index}`);
    const textarea = document.getElementById(`goal-textarea-${index}`);
    const buttonsView = wrapper?.querySelector('.goal-buttons-view');
    const buttonsEdit = wrapper?.querySelector('.goal-buttons-edit');

    if (!textarea) return;

    // 編集前の値を保存
    textarea.dataset.originalValue = textarea.value;

    textarea.readOnly = false;
    textarea.focus();

    if (buttonsView) buttonsView.style.display = 'none';
    if (buttonsEdit) buttonsEdit.style.display = 'flex';
  },

  // 編集キャンセル
  cancelAgeGoalEdit(index) {
    const wrapper = document.getElementById(`goal-wrapper-${index}`);
    const textarea = document.getElementById(`goal-textarea-${index}`);

    if (textarea && textarea.dataset.originalValue !== undefined) {
      textarea.value = textarea.dataset.originalValue;
    }

    this.closeAgeGoalExpand(index);
  },

  // 編集保存
  async saveAgeGoalEdit(index) {
    const textarea = document.getElementById(`goal-textarea-${index}`);
    if (!textarea) return;

    this.data.lifeDesign.ageGoals[index].goal = textarea.value;
    await saveLifeDesign(this.data.lifeDesign);

    this.closeAgeGoalExpand(index);
  },

  /* ========================================
     マニュアル操作
     ======================================== */

  async viewManual(id) {
    this.data.manual = await getManual(id);
    this.navigate('manual');
  },

  async createNewManual() {
    this.data.editingManual = {
      id: null,
      title: '',
      category: '',
      content: ''
    };
    this.data.manual = this.data.editingManual;
    this.navigate('manual-edit');
  },

  async editManual(id) {
    this.data.editingManual = await getManual(id);
    this.data.manual = this.data.editingManual;
    this.navigate('manual-edit');
  },

  updateManualField(field, value) {
    if (!this.data.editingManual) {
      this.data.editingManual = {};
    }
    this.data.editingManual[field] = value;
  },

  async saveManual() {
    if (!this.data.editingManual.title) {
      this.showToast('タイトルを入力してください');
      return;
    }

    if (!this.data.editingManual.id) {
      this.data.editingManual.id = Date.now();
    }

    await saveManual(this.data.editingManual);
    this.data.manuals = await getAllManuals();
    this.navigate('manual-list');
  },

  async deleteManual(id) {
    if (confirm('このマニュアルを削除しますか？')) {
      await deleteManual(id);
      this.data.manuals = await getAllManuals();
      this.navigate('manual-list');
    }
  },

  /* ========================================
     設定操作
     ======================================== */

  editSetting(key) {
    const labels = {
      name: '氏名',
      birthday: '生年月日'
    };

    this.showCustomInputModal(
      labels[key] || key,
      '入力してください',
      async (value) => {
        if (value !== null && value !== '') {
          await saveSetting(key, value);
          this.data.settings[key] = value;
          this.render();
        }
      },
      this.data.settings[key] || ''
    );
  },

  // 氏名インライン編集開始
  startInlineEdit(key) {
    const valueEl = document.getElementById('name-value');
    if (!valueEl) return;

    // 既に編集中なら何もしない
    if (valueEl.tagName === 'INPUT') return;

    const currentValue = this.data.settings[key] || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit-input';
    input.value = currentValue;
    input.placeholder = '名前を入力';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');

    // 元の要素を入力欄に置換
    valueEl.replaceWith(input);
    input.focus();
    input.select();

    // 保存処理
    const save = async () => {
      const newValue = input.value.trim();
      // 空でも保存（削除可能にする）
      await saveSetting(key, newValue || null);
      this.data.settings[key] = newValue || null;

      // スパンに戻す
      const span = document.createElement('span');
      span.className = 'setting-value inline-editable';
      span.id = 'name-value';
      span.onclick = () => this.startInlineEdit(key);
      span.textContent = this.data.settings[key] || '未設定';
      input.replaceWith(span);
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      }
    });
  },

  // 生年月日入力処理（自動タブ移動）
  handleBirthdayInput(input, type) {
    // 数字のみ許可
    input.value = input.value.replace(/[^0-9]/g, '');

    const maxLength = type === 'year' ? 4 : 2;

    // 最大文字数に達したら次のフィールドへ
    if (input.value.length >= maxLength) {
      if (type === 'year') {
        document.getElementById('bday-month')?.focus();
      } else if (type === 'month') {
        document.getElementById('bday-day')?.focus();
      } else if (type === 'day') {
        // 最後のフィールドなので保存
        input.blur();
      }
    }

    // 自動保存
    this.saveBirthday();
  },

  // 生年月日保存
  async saveBirthday() {
    const year = document.getElementById('bday-year')?.value || '';
    const month = document.getElementById('bday-month')?.value || '';
    const day = document.getElementById('bday-day')?.value || '';

    // 全て入力されていたら保存
    if (year.length === 4 && month.length >= 1 && day.length >= 1) {
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      const birthday = `${year}-${paddedMonth}-${paddedDay}`;
      await saveSetting('birthday', birthday);
      this.data.settings.birthday = birthday;
    }
  },

  async toggleSetting(key) {
    this.data.settings[key] = !this.data.settings[key];
    await saveSetting(key, this.data.settings[key]);
    if (key === 'darkMode') {
      this.applyDarkMode(this.data.settings[key]);
    }
    this.render();
  },

  applyDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  },

  async setTheme(theme, applyAll = false) {
    // 一部モードで同じテーマを再度タップしたらベースに戻す（全体→一部の切り替えは除く）
    if (!applyAll && this.data.settings.theme === theme && !this.data.settings.themeApplyAll) {
      theme = null;
    }
    // 現在のテーマクラスを削除
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-pink', 'theme-mono', 'theme-apply-all');
    // 新しいテーマクラスを追加
    if (theme) {
      document.body.classList.add(`theme-${theme}`);
      if (applyAll) {
        document.body.classList.add('theme-apply-all');
      }
    }
    // 設定を保存
    this.data.settings.theme = theme;
    this.data.settings.themeApplyAll = applyAll;
    await saveSetting('theme', theme);
    await saveSetting('themeApplyAll', applyAll);
    this.render();
  },

  async setFont(fontId) {
    // 現在のフォントクラスを削除
    for (let i = 1; i <= 9; i++) {
      document.body.classList.remove(`font-${i}`);
    }
    // 新しいフォントクラスを追加
    if (fontId) {
      document.body.classList.add(`font-${fontId}`);
    }
    // 設定を保存
    this.data.settings.font = fontId;
    await saveSetting('font', fontId);
    this.render();
  },

  async setTransition(type) {
    // 現在のトランジションクラスを削除
    document.body.classList.remove('transition-none', 'transition-fade', 'transition-slide', 'transition-scale', 'transition-push');
    // 新しいトランジションクラスを追加
    document.body.classList.add(`transition-${type || 'none'}`);
    // 設定を保存
    this.data.settings.transition = type;
    await saveSetting('transition', type);
    this.render();
  },

  applyTransition(type) {
    document.body.classList.remove('transition-none', 'transition-fade', 'transition-slide', 'transition-scale', 'transition-push');
    document.body.classList.add(`transition-${type || 'none'}`);
  },

  applyTheme(theme, applyAll = false) {
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-pink', 'theme-mono', 'theme-apply-all');
    if (theme) {
      document.body.classList.add(`theme-${theme}`);
      if (applyAll) {
        document.body.classList.add('theme-apply-all');
      }
    }
  },

  applyStyleTheme(styleTheme) {
    document.body.classList.remove('style-minimal', 'style-soft', 'style-vivid');
    if (styleTheme) {
      document.body.classList.add(`style-${styleTheme}`);
    }
  },

  applyDetailBtnSettings(style, color) {
    // スタイルクラスを削除
    document.body.classList.remove('detail-btn-raised', 'detail-btn-outline', 'detail-btn-pill', 'detail-btn-flat');
    // 配色クラスを削除
    document.body.classList.remove('detail-btn-adaptive', 'detail-btn-neutral');

    // スタイルを適用（デフォルト: raised）
    document.body.classList.add(`detail-btn-${style || 'raised'}`);
    // 配色を適用（デフォルト: adaptive）
    document.body.classList.add(`detail-btn-${color || 'adaptive'}`);
  },

  applyFont(fontId) {
    for (let i = 1; i <= 9; i++) {
      document.body.classList.remove(`font-${i}`);
    }
    if (fontId) {
      document.body.classList.add(`font-${fontId}`);
    }
  },

  /* ========================================
     モーダル表示
     ======================================== */

  expandHomeCard(type) {
    const card = document.getElementById(`home-card-${type}`);
    if (!card) return;

    const isExpanded = card.classList.contains('expanded');
    const contentClass = type === 'longterm' ? '.goal-title' : '.progress-detail';
    const moreClass = type === 'longterm' ? '.goal-more' : '.progress-more';

    if (isExpanded) {
      // 閉じる（キャンセル扱い）
      this.closeHomeCardExpand(type);
    } else {
      // 展開
      const currentText = type === 'longterm'
        ? (this.data.longTermGoal?.goal || '')
        : (this.data.monthlyGoal?.goal || '');
      const content = card.querySelector(contentClass);

      // はみ出ていない場合はすぐに編集モードへ
      const isOverflow = content && content.scrollHeight > content.clientHeight;

      card.classList.add('expanded');

      if (!isOverflow) {
        this.enterEditMode('home', type);
        return;
      }

      // はみ出ている場合は閲覧モード
      if (content) {
        content.style.maxHeight = 'none';
        const navigateTo = type === 'longterm' ? 'longterm' : 'monthly';
        content.innerHTML = `<div class="expand-view-text" onclick="event.stopPropagation(); app.navigateToDetail('${navigateTo}')">${escapeHtml(currentText)}</div>`;
      }

      // ボタンを詳細/閉じるに
      const more = card.querySelector(moreClass);
      if (more) {
        const navigateTo = type === 'longterm' ? 'longterm' : 'monthly';
        more.innerHTML = `
          <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeHomeCardExpand('${type}')">閉じる</button>
          <button class="expand-btn save" onclick="event.stopPropagation(); app.navigateToDetail('${navigateTo}')">詳細</button>
        `;
      }
    }
  },

  // 詳細ページへ遷移
  navigateToDetail(type) {
    if (type === 'longterm') {
      // メイン長期目標を優先、なければ期限最短
      const today = new Date(); today.setHours(0,0,0,0);
      const validGoals = (this.data.longTermGoals || []).filter(g => {
        if (!g.deadlineYear || !g.deadlineMonth) return false;
        const deadline = new Date(g.deadlineYear, g.deadlineMonth, 0);
        if (g.startYear && g.startMonth) {
          const startDate = new Date(g.startYear, g.startMonth - 1, 1);
          return startDate <= today && today <= deadline;
        }
        return today <= deadline;
      });
      const goal = validGoals.find(g => g.type === 'main') || validGoals.sort((a, b) => new Date(a.deadlineYear, a.deadlineMonth, 0) - new Date(b.deadlineYear, b.deadlineMonth, 0))[0];
      if (goal) {
        this.data.longTermGoal = goal;
      }
      this.navigate('longterm');
    } else {
      this.navigate('monthly');
    }
  },

  // ホームの長期目標カードクリック
  handleLongTermCardClick(event) {
    const card = document.getElementById('home-card-longterm');
    if (!card) return;

    // 展開中なら何もしない（カード内部のクリックで処理される）
    if (card.classList.contains('expanded')) return;

    // 続きを見るがあるか確認
    const goalTitle = card.querySelector('.goal-title');
    const hasOverflow = goalTitle && goalTitle.scrollHeight > goalTitle.clientHeight;

    if (hasOverflow) {
      // テキストがはみ出している場合は展開
      this.expandHomeCard('longterm');
    } else {
      // はみ出していない場合は詳細ページへ
      this.navigateToDetail('longterm');
    }
  },

  // ホームの今月の目標カードクリック
  handleMonthlyCardClick(event) {
    const card = document.getElementById('home-card-monthly');
    if (!card) return;

    if (card.classList.contains('expanded')) return;

    const progressDetail = card.querySelector('.progress-detail');
    const hasOverflow = progressDetail && progressDetail.scrollHeight > progressDetail.clientHeight;

    if (hasOverflow) {
      this.expandHomeCard('monthly');
    } else {
      this.navigateToDetail('monthly');
    }
  },

  // 前の長期目標へ
  prevLongTermGoal() {
    if (this.data.currentLongTermIndex > 0) {
      this.data.currentLongTermIndex--;
      this.render();
      this.applyGoalCardSlide('right');
    }
  },

  // 次の長期目標へ
  nextLongTermGoal() {
    const total = this.data.filteredLongTermGoals?.length || 0;
    if (this.data.currentLongTermIndex < total - 1) {
      this.data.currentLongTermIndex++;
      this.render();
      this.applyGoalCardSlide('left');
    }
  },

  // ゴールカードスライドアニメーション適用
  applyGoalCardSlide(direction) {
    const goalCard = document.getElementById('home-card-longterm');
    if (!goalCard) return;

    goalCard.classList.add(`slide-${direction}`);
    setTimeout(() => {
      goalCard.classList.remove(`slide-${direction}`);
    }, 250);
  },

  // スケジュール関連関数（パターンB: 自由形式）
  async updateFreeSchedule(index, field, value) {
    if (!this.data.dailySchedule || !this.data.dailySchedule[index]) return;

    if (field === 'startHour' || field === 'endHour') {
      this.data.dailySchedule[index][field] = parseInt(value) || 0;
    } else {
      this.data.dailySchedule[index][field] = value;
    }

    await this.saveDailySchedule();
    this.render();
  },

  // フリースケジュール時刻（時+分）更新
  async updateFreeScheduleTime(index, startOrEnd, timeValue) {
    if (!this.data.dailySchedule || !this.data.dailySchedule[index]) return;
    const parts = timeValue.split(':');
    const hour = parseInt(parts[0]) || 0;
    const minute = parseInt(parts[1]) || 0;
    if (startOrEnd === 'start') {
      this.data.dailySchedule[index].startHour = hour;
      this.data.dailySchedule[index].startMinute = minute;
    } else {
      this.data.dailySchedule[index].endHour = hour;
      this.data.dailySchedule[index].endMinute = minute;
    }
    await this.saveDailySchedule();
    this.render();
  },

  showScheduleAddModal() {
    if (document.querySelector('.schedule-add-modal')) return;
    const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60', '#6D4C41', '#546E7A'];
    const modalHTML = `
      <div class="modal-overlay schedule-add-modal active" onclick="app.closeScheduleAddModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">予定を追加</div>
          <div class="schedule-modal-time">
            <div class="schedule-modal-time-group">
              <label>開始</label>
              <input type="time" id="scheduleAddStart" class="schedule-time-input" onchange="document.getElementById('scheduleAddEnd').focus(); document.getElementById('scheduleAddEnd').click();">
            </div>
            <span>〜</span>
            <div class="schedule-modal-time-group">
              <label>終了</label>
              <input type="time" id="scheduleAddEnd" class="schedule-time-input">
            </div>
          </div>
          <input type="text" id="scheduleAddText" class="form-input" placeholder="予定を入力..." style="margin:12px 0">
          <div class="schedule-modal-colors">
            ${colors.map((c, i) => `<span class="schedule-color-dot ${i === 0 ? 'selected' : ''}" style="background:${c}" onclick="app.selectScheduleColor(this, '${c}')"></span>`).join('')}
          </div>
          <input type="hidden" id="scheduleAddColor" value="${colors[0]}">
          <div class="modal-buttons">
            <button class="modal-btn" onclick="app.closeScheduleAddModal()">キャンセル</button>
            <button class="modal-btn primary" onclick="app.saveNewSchedule()">追加</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  selectScheduleColor(el, color) {
    document.querySelectorAll('.schedule-modal-colors .schedule-color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('scheduleAddColor').value = color;
  },

  closeScheduleAddModal() {
    const modal = document.querySelector('.schedule-add-modal');
    if (modal) modal.remove();
  },

  async saveNewSchedule() {
    const startTime = document.getElementById('scheduleAddStart').value;
    const endTime = document.getElementById('scheduleAddEnd').value;
    const text = document.getElementById('scheduleAddText').value.trim();
    const color = document.getElementById('scheduleAddColor').value;

    if (!startTime || !endTime) {
      this.showToast('時間を入力してください');
      return;
    }

    if (!this.data.dailySchedule) {
      this.data.dailySchedule = [];
    }

    this.data.dailySchedule.push({
      startHour: parseInt(startTime.split(':')[0]),
      startMinute: parseInt(startTime.split(':')[1]) || 0,
      endHour: parseInt(endTime.split(':')[0]),
      endMinute: parseInt(endTime.split(':')[1]) || 0,
      activity: text,
      color: color
    });

    await this.saveDailySchedule();
    this.closeScheduleAddModal();
    this.render();
  },

  async deleteFreeSchedule(index) {
    if (!this.data.dailySchedule) return;

    this.data.dailySchedule.splice(index, 1);
    await this.saveDailySchedule();
    this.render();
  },

  async saveDailySchedule() {
    await saveSetting('dailySchedule', this.data.dailySchedule);
    if (!this.data.settings) this.data.settings = {};
    this.data.settings.dailySchedule = this.data.dailySchedule;
  },

  // ========================================
  // スケジュールパターン関連
  // ========================================

  // 今日の選択中パターンインデックス（同優先度で複数該当時用）
  todayPatternIndex: 0,

  // 任意日付に該当する全パターンを取得（優先度でグループ化）
  // monthlyGoalを指定可能（月切替対応）
  getDateMatchingPatterns(date, monthlyGoal) {
    const mg = monthlyGoal || this.data.monthlyGoal;
    const patterns = mg?.schedulePatterns || [];
    if (patterns.length === 0) return [];

    const matching = patterns.filter(p => this.checkPatternApplies(p, date));
    if (matching.length === 0) return [];

    // 最高優先度を取得
    const highestPriority = Math.min(...matching.map(p => p.priority || 3));
    // 同優先度のパターンのみ返す
    return matching.filter(p => (p.priority || 3) === highestPriority);
  },

  // 今日に該当する全パターンを取得（既存互換ラッパー）
  getTodayMatchingPatterns() {
    return this.getDateMatchingPatterns(new Date());
  },

  // 定期見直しバッジ判定
  hasReviewBadge() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remaining = lastDay - now.getDate();
    return (dayOfWeek === 0 || dayOfWeek === 6) || remaining <= 4;
  },

  // 定期見直しの状態を取得（リセット判定付き）
  async _getReviewState() {
    const state = await getSetting('reviewCheckState') || {};
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // 毎日リセット
    if (!state.daily || state.daily.date !== today) {
      state.daily = { date: today, checks: new Array(REVIEW_CHECKLIST.daily.items.length).fill(false) };
    }

    // 週次リセット（月曜基準）
    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const mondayStr = mondayDate.toISOString().slice(0, 10);
    if (!state.weekly || state.weekly.date !== mondayStr) {
      state.weekly = { date: mondayStr, checks: new Array(REVIEW_CHECKLIST.weekly.items.length).fill(false) };
    }

    // 月次リセット（月初基準）
    const monthStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    if (!state.monthly || state.monthly.date !== monthStr) {
      state.monthly = { date: monthStr, checks: new Array(REVIEW_CHECKLIST.monthly.items.length).fill(false) };
    }

    return state;
  },

  // 定期見直しチェックリスト表示
  async showReviewChecklist() {
    const existing = document.querySelector('.field-help-overlay');
    if (existing) existing.remove();

    const state = await this._getReviewState();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remaining = lastDay - now.getDate();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonthend = remaining <= 4;

    let html = '';
    ['daily', 'weekly', 'monthly'].forEach(cat => {
      const cl = REVIEW_CHECKLIST[cat];
      const checks = state[cat].checks;
      const hasBadge = (cat === 'weekly' && isWeekend) || (cat === 'monthly' && isMonthend);
      html += '<div class="review-category">';
      html += '<div class="review-category-title">' + cl.label + (hasBadge ? '<span class="review-cat-badge"></span>' : '') + '</div>';
      cl.items.forEach((item, i) => {
        const checked = checks[i];
        html += '<div class="review-item' + (checked ? ' checked' : '') + '" onclick="app.toggleReviewCheck(\'' + cat + '\',' + i + ')">';
        html += '<span class="review-check">' + (checked ? '✓' : '') + '</span>';
        html += '<span class="review-text">' + item + '</span>';
        html += '</div>';
      });
      html += '</div>';
    });

    const overlay = document.createElement('div');
    overlay.className = 'field-help-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `
      <div class="field-help-popup review-popup" onclick="event.stopPropagation()">
        <div class="field-help-title">定期見直し</div>
        ${html}
        <button class="field-help-close" onclick="this.closest('.field-help-overlay').remove()">閉じる</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  // チェックトグル
  async toggleReviewCheck(category, index) {
    const state = await this._getReviewState();
    state[category].checks[index] = !state[category].checks[index];
    await saveSetting('reviewCheckState', state);
    // ポップアップを再描画
    await this.showReviewChecklist();
  },

  // 今月の第何週か（0始まり: 0=W1, 1=W2, ... 4=W5）
  getWeekOfMonth() {
    const day = new Date().getDate();
    return Math.min(Math.floor((day - 1) / 7), 4);
  },

  // 今日に適用されるパターンを取得
  getTodayPattern() {
    const matching = this.getTodayMatchingPatterns();
    if (matching.length === 0) {
      // 該当なしの場合、全パターンから最優先を返す
      const patterns = this.data.monthlyGoal?.schedulePatterns || [];
      if (patterns.length === 0) return null;
      const sorted = [...patterns].sort((a, b) => (a.priority || 3) - (b.priority || 3));
      return sorted[0];
    }

    // 複数該当時はインデックスで選択
    const index = this.todayPatternIndex % matching.length;
    return matching[index];
  },

  // セレクトボックスでパターンを選択
  selectTodayPattern(index) {
    this.todayPatternIndex = parseInt(index) || 0;
    this.closePatternSelectModal();
    this.render();
  },

  // パターン選択モーダルを表示
  showPatternSelectModal() {
    if (document.querySelector('.pattern-select-modal')) return;
    const patterns = this.data.monthlyGoal?.schedulePatterns || [];
    const matchingPatterns = this.getTodayMatchingPatterns();
    const currentIndex = this.todayPatternIndex || 0;

    const patternItemsHTML = matchingPatterns.length > 0
      ? matchingPatterns.map((p, i) => `
        <div class="pattern-select-item ${i === currentIndex ? 'selected' : ''}" onclick="app.selectTodayPattern(${i})">
          <div class="pattern-select-info">
            <div class="pattern-select-name">${p.name ? escapeHtml(p.name) : 'パターン' + (i + 1)}</div>
            <div class="pattern-select-schedule">${(p.schedule || []).length}件の予定</div>
          </div>
          ${i === currentIndex ? '<span class="pattern-select-check">✓</span>' : ''}
        </div>
      `).join('')
      : '<div class="pattern-select-empty">今日に該当するパターンがありません</div>';

    const modalHTML = `
      <div class="modal-overlay pattern-select-modal active" onclick="app.closePatternSelectModal()">
        <div class="modal-content pattern-select-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">パターンを選択</div>
            <button class="modal-close" onclick="app.closePatternSelectModal()">×</button>
          </div>
          <div class="pattern-select-list">
            ${patternItemsHTML}
          </div>
          <div class="pattern-select-footer">
            <button class="pattern-select-manage" onclick="app.closePatternSelectModal(); app.navigate('monthly-5');">
              パターンを管理
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closePatternSelectModal() {
    const modal = document.querySelector('.pattern-select-modal');
    if (modal) modal.remove();
  },

  // パターンが指定日に適用されるかチェック
  checkPatternApplies(pattern, date) {
    if (!pattern.condition) return true;
    const cond = pattern.condition;
    const dayOfWeek = date.getDay(); // 0=日, 1=月, ..., 6=土

    switch (cond.type) {
      case 'weekdays':
        // 曜日指定
        return (cond.days || []).includes(dayOfWeek);

      case 'biweekly':
        // 隔週（エポックベースの絶対週番号で年境界をまたいでも一貫）
        const epochWeek = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        const isOddWeek = epochWeek % 2 === 1;
        const weekMatch = cond.weekType === 'odd' ? isOddWeek : !isOddWeek;
        return weekMatch && (cond.days || []).includes(dayOfWeek);

      case 'cycle':
        // カスタム周期
        if (!cond.startDate || !cond.cycleLength) return false;
        const start = new Date(cond.startDate);
        const startNorm = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const dateNorm = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((dateNorm.getTime() - startNorm.getTime()) / (24 * 60 * 60 * 1000));
        const dayInCycle = ((diffDays % cond.cycleLength) + cond.cycleLength) % cond.cycleLength;
        return (cond.activeDays || []).includes(dayInCycle);

      case 'dates':
        // 特定日
        const datesMode = cond.datesMode || 'dates';

        if (datesMode === 'dates') {
          // 毎月○日
          return (cond.dates || []).includes(date.getDate());
        } else if (datesMode === 'nthWeekday') {
          // 第N週のX曜日
          const nth = cond.nthWeekday || { week: 1, day: 1 };
          if (dayOfWeek !== nth.day) return false;
          // その月の第何週目か計算
          const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const firstWeekdayOccurrence = 1 + ((7 + nth.day - firstDayOfMonth.getDay()) % 7);
          const weekOfMonth = Math.ceil((date.getDate() - firstWeekdayOccurrence) / 7) + 1;
          return weekOfMonth === nth.week;
        } else if (datesMode === 'lastWeekday') {
          // 月の最後のX曜日
          const targetDay = cond.lastWeekday ?? 1;
          if (dayOfWeek !== targetDay) return false;
          // 次の週の同じ曜日が翌月になるかチェック
          const nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
          return nextWeek.getMonth() !== date.getMonth();
        }
        return false;

      default:
        return true;
    }
  },

  // パターン追加
  async addSchedulePattern() {
    if (!this.data.monthlyGoal.schedulePatterns) {
      this.data.monthlyGoal.schedulePatterns = [];
    }

    const newPattern = {
      id: Date.now(),
      name: `パターン${this.data.monthlyGoal.schedulePatterns.length + 1}`,
      schedule: [],
      condition: { type: 'weekdays', days: [1, 2, 3, 4, 5] }, // デフォルト: 平日
      priority: 3 // デフォルト: 中（1=最高, 5=最低）
    };

    this.data.monthlyGoal.schedulePatterns.push(newPattern);
    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // パターン優先度更新
  async updatePatternPriority(patternId, priority) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (pattern) {
      pattern.priority = parseInt(priority) || 3;
      await saveMonthlyGoal(this.data.monthlyGoal);
      this.render();
    }
  },

  // パターン削除
  async deleteSchedulePattern(patternId) {
    if (!this.data.monthlyGoal.schedulePatterns) return;

    const index = this.data.monthlyGoal.schedulePatterns.findIndex(p => p.id === patternId);
    if (index !== -1) {
      this.data.monthlyGoal.schedulePatterns.splice(index, 1);
      await saveMonthlyGoal(this.data.monthlyGoal);
      this.render();
    }
  },

  // パターン名更新
  async updatePatternName(patternId, name) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (pattern) {
      pattern.name = name;
      await saveMonthlyGoal(this.data.monthlyGoal);
    }
  },

  // パターン条件更新
  async updatePatternCondition(patternId, field, value) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern) return;

    if (!pattern.condition) pattern.condition = {};

    if (field === 'type') {
      pattern.condition.type = value;
      // タイプ変更時にデフォルト値設定
      if (value === 'weekdays') {
        pattern.condition.days = pattern.condition.days || [1, 2, 3, 4, 5];
      } else if (value === 'biweekly') {
        pattern.condition.weekType = pattern.condition.weekType || 'odd';
        pattern.condition.days = pattern.condition.days || [1, 2, 3, 4, 5];
      } else if (value === 'cycle') {
        pattern.condition.cycleLength = pattern.condition.cycleLength || 7;
        pattern.condition.activeDays = pattern.condition.activeDays || [0, 1, 2, 3, 4];
        pattern.condition.startDate = pattern.condition.startDate || getTodayDate();
      } else if (value === 'dates') {
        pattern.condition.dates = pattern.condition.dates || [1];
        pattern.condition.datesMode = pattern.condition.datesMode || 'dates';
      }
    } else if (field === 'days') {
      pattern.condition.days = value;
    } else if (field === 'weekType') {
      pattern.condition.weekType = value;
    } else if (field === 'cycleLength') {
      pattern.condition.cycleLength = parseInt(value) || 7;
    } else if (field === 'activeDays') {
      pattern.condition.activeDays = value;
    } else if (field === 'startDate') {
      pattern.condition.startDate = value;
    } else if (field === 'dates') {
      pattern.condition.dates = value;
    } else if (field === 'datesMode') {
      pattern.condition.datesMode = value;
      // モード変更時にデフォルト値設定
      if (value === 'nthWeekday') {
        pattern.condition.nthWeekday = pattern.condition.nthWeekday || { week: 1, day: 1 };
      } else if (value === 'lastWeekday') {
        pattern.condition.lastWeekday = pattern.condition.lastWeekday ?? 1;
      }
    } else if (field === 'nthWeek') {
      if (!pattern.condition.nthWeekday) pattern.condition.nthWeekday = { week: 1, day: 1 };
      pattern.condition.nthWeekday.week = parseInt(value) || 1;
    } else if (field === 'nthDay') {
      if (!pattern.condition.nthWeekday) pattern.condition.nthWeekday = { week: 1, day: 1 };
      pattern.condition.nthWeekday.day = parseInt(value) || 0;
    } else if (field === 'lastWeekday') {
      pattern.condition.lastWeekday = parseInt(value) || 0;
    }

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // 条件ヘルプ表示
  showConditionHelp(type) {
    const helpTexts = {
      weekdays: '毎週特定の曜日に適用されます。\n複数の曜日を選択可能です。\n\n例: 月〜金を選択 → 平日パターン',
      biweekly: '隔週（1週おき）で適用されます。\n\n「奇数週」か「偶数週」を選び、さらに適用する曜日も指定します。\n\n例: 奇数週の土日 → 2週に1回の週末シフト',
      cycle: '曜日に関係なく、一定日数の周期で繰り返すパターンです。\n\n【設定方法】\n1. 周期日数: 何日で1サイクルか\n2. 開始日: 周期のカウント開始日\n3. 稼働日: 周期内の何日目が適用か\n\n例: 「4勤2休」\n→ 周期6日、稼働日1〜4日目',
      dates: '毎月の特定日に適用されます。\n\n【3つのモード】\n・毎月○日: 日付を直接指定\n・第○週の○曜日: 例）第2火曜日\n・月の最後の○曜日: 例）最終金曜日'
    };
    this.showToast(helpTexts[type] || '説明がありません', 8000);
  },

  // 曜日トグル
  async togglePatternDay(patternId, day) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.condition) return;

    const days = pattern.condition.days || [];
    const index = days.indexOf(day);
    if (index === -1) {
      days.push(day);
      days.sort((a, b) => a - b);
    } else {
      days.splice(index, 1);
    }
    pattern.condition.days = days;

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // 周期内日トグル
  async toggleCycleDay(patternId, day) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.condition) return;

    const activeDays = pattern.condition.activeDays || [];
    const index = activeDays.indexOf(day);
    if (index === -1) {
      activeDays.push(day);
      activeDays.sort((a, b) => a - b);
    } else {
      activeDays.splice(index, 1);
    }
    pattern.condition.activeDays = activeDays;

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // 特定日トグル
  async togglePatternDate(patternId, date) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.condition) return;

    const dates = pattern.condition.dates || [];
    const index = dates.indexOf(date);
    if (index === -1) {
      dates.push(date);
      dates.sort((a, b) => a - b);
    } else {
      dates.splice(index, 1);
    }
    pattern.condition.dates = dates;

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // パターン内スケジュール追加
  async addPatternScheduleSlot(patternId) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern) return;

    if (!pattern.schedule) pattern.schedule = [];
    const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60'];

    pattern.schedule.push({
      startHour: 9,
      endHour: 10,
      activity: '',
      color: colors[pattern.schedule.length % colors.length]
    });

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // パターン内スケジュール更新
  async updatePatternScheduleSlot(patternId, slotIndex, field, value) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.schedule || !pattern.schedule[slotIndex]) return;

    if (field === 'startHour' || field === 'endHour') {
      pattern.schedule[slotIndex][field] = parseInt(value) || 0;
    } else {
      pattern.schedule[slotIndex][field] = value;
    }

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // パターン内スケジュール時刻（時+分）更新
  async updatePatternScheduleTime(patternId, slotIndex, startOrEnd, timeValue) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.schedule || !pattern.schedule[slotIndex]) return;
    const parts = timeValue.split(':');
    const hour = parseInt(parts[0]) || 0;
    const minute = parseInt(parts[1]) || 0;
    if (startOrEnd === 'start') {
      pattern.schedule[slotIndex].startHour = hour;
      pattern.schedule[slotIndex].startMinute = minute;
    } else {
      pattern.schedule[slotIndex].endHour = hour;
      pattern.schedule[slotIndex].endMinute = minute;
    }
    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // パターン内スケジュール削除
  async deletePatternScheduleSlot(patternId, slotIndex) {
    const pattern = this.data.monthlyGoal.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.schedule) return;

    pattern.schedule.splice(slotIndex, 1);
    await saveMonthlyGoal(this.data.monthlyGoal);
    this.render();
  },

  // 編集中のパターンID
  editingPatternId: null,

  // パターン編集画面を開く
  openPatternEditor(patternId) {
    this.editingPatternId = patternId;
    this.render();
  },

  // パターン編集画面を閉じる
  closePatternEditor() {
    this.editingPatternId = null;
    this.render();
  },

  // スケジュールスロット詳細モーダルを表示
  showScheduleSlotDetail(patternId, slotIndex) {
    if (document.querySelector('.slot-detail-modal')) return;
    const pattern = this.data.monthlyGoal?.schedulePatterns?.find(p => p.id === patternId);
    if (!pattern || !pattern.schedule || !pattern.schedule[slotIndex]) return;

    const slot = pattern.schedule[slotIndex];
    const startH = String(slot.startHour).padStart(2, '0');
    const endH = String(slot.endHour).padStart(2, '0');
    const color = (slot.color && /^#[0-9a-fA-F]{3,8}$/.test(slot.color)) ? slot.color : '#4A90A4';

    const modalHTML = `
      <div class="modal-overlay slot-detail-modal active" onclick="app.closeSlotDetailModal()">
        <div class="modal-content slot-detail-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">予定の詳細</div>
            <button class="modal-close" onclick="app.closeSlotDetailModal()">×</button>
          </div>
          <div class="slot-detail-color-bar" style="background: ${color}"></div>
          <div class="slot-detail-time">${startH}:00 〜 ${endH}:00</div>
          <div class="slot-detail-activity">${escapeHtml(slot.activity || '（未設定）')}</div>
          <div class="slot-detail-notes-section">
            <label class="slot-detail-label">メモ</label>
            <textarea class="slot-detail-notes" placeholder="メモを入力..."
                      onchange="app.updatePatternScheduleSlot(${patternId}, ${slotIndex}, 'notes', this.value)">${escapeHtml(slot.notes || '')}</textarea>
          </div>
          <button class="slot-detail-close-btn" onclick="app.closeSlotDetailModal()">閉じる</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // スロット詳細モーダルを閉じる
  closeSlotDetailModal() {
    const modal = document.querySelector('.slot-detail-modal');
    if (modal) modal.remove();
  },

  // ホームのスケジュール項目タップ → その場で詳細モーダル表示
  openScheduleSlotFromHome(slotIndex) {
    const todayPattern = this.getTodayPattern();
    if (!todayPattern) {
      this.navigate('monthly-5');
      return;
    }
    this.showScheduleSlotDetail(todayPattern.id, slotIndex);
  },

  enterEditMode(target, field) {
    const card = target === 'home'
      ? document.getElementById(`home-card-${field}`)
      : document.getElementById(`life-card-${field}`);
    if (!card) return;

    const contentClass = target === 'home'
      ? (field === 'longterm' ? '.goal-title' : '.progress-detail')
      : '.life-card-content';
    const moreClass = target === 'home'
      ? (field === 'longterm' ? '.goal-more' : '.progress-more')
      : '.life-card-more';

    const currentText = target === 'home'
      ? (field === 'longterm' ? (this.data.longTermGoal?.goal || '') : (this.data.monthlyGoal?.goal || ''))
      : (this.data.lifeDesign[field] || '');

    // textareaに置き換え
    const content = card.querySelector(contentClass);
    if (content) {
      content.innerHTML = `<textarea id="${target}-card-edit-${field}" class="expand-edit-textarea">${escapeHtml(currentText)}</textarea>`;
    }

    // ボタンを保存/キャンセルに
    const more = card.querySelector(moreClass);
    if (more) {
      const closeFunc = target === 'home' ? 'closeHomeCardExpand' : 'closeLifeCardExpand';
      const saveFunc = target === 'home' ? 'saveHomeCardExpand' : 'saveLifeCardExpand';
      more.innerHTML = `
        <button class="expand-btn cancel" onclick="event.stopPropagation(); app.${closeFunc}('${field}')">キャンセル</button>
        <button class="expand-btn save" onclick="event.stopPropagation(); app.${saveFunc}('${field}')">保存</button>
      `;
    }

    // textareaにフォーカス＆高さ自動調整
    setTimeout(() => {
      const textarea = document.getElementById(`${target}-card-edit-${field}`);
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        textarea.focus();
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        });
      }
    }, 100);
  },

  closeHomeCardExpand(type) {
    const card = document.getElementById(`home-card-${type}`);
    if (!card) return;

    card.classList.remove('expanded');

    // 再描画して元に戻す
    this.render();
  },

  async saveHomeCardExpand(type) {
    const textarea = document.getElementById(`home-card-edit-${type}`);
    if (!textarea) return;

    const newValue = textarea.value;

    if (type === 'longterm') {
      if (!this.data.longTermGoal) {
        this.data.longTermGoal = { goal: '' };
      }
      this.data.longTermGoal.goal = newValue;
      await saveLongTermGoal(this.data.longTermGoal);
    } else if (type === 'monthly') {
      if (!this.data.monthlyGoal) {
        this.data.monthlyGoal = { goal: '' };
      }
      this.data.monthlyGoal.goal = newValue;
      await saveMonthlyGoal(this.data.monthlyGoal);
    }

    this.closeHomeCardExpand(type);
  },

  /* ========================================
     長期目標記入ページのgoal-card展開
     ======================================== */
  expandLongtermCard() {
    const card = document.getElementById('longterm-card-goal');
    if (!card) return;

    const isExpanded = card.classList.contains('expanded');
    const content = card.querySelector('.goal-title');
    const more = card.querySelector('.goal-more');

    if (isExpanded) {
      this.closeLongtermCardExpand();
    } else {
      const currentText = this.data.longTermGoal?.goal || '';

      // はみ出ていない場合はすぐに編集モードへ
      const isOverflow = content && content.scrollHeight > content.clientHeight;

      card.classList.add('expanded');

      if (!isOverflow) {
        this.enterLongtermEditMode();
        return;
      }

      // はみ出ている場合は閲覧モード
      if (content) {
        content.style.maxHeight = 'none';
        content.innerHTML = `<div class="expand-view-text" onclick="event.stopPropagation(); app.enterLongtermEditMode()">${escapeHtml(currentText)}</div>`;
      }

      // ボタンを編集/閉じるに
      if (more) {
        more.innerHTML = `
          <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeLongtermCardExpand()">閉じる</button>
          <button class="expand-btn save" onclick="event.stopPropagation(); app.enterLongtermEditMode()">編集</button>
        `;
      }
    }
  },

  enterLongtermEditMode() {
    const card = document.getElementById('longterm-card-goal');
    if (!card) return;

    const content = card.querySelector('.goal-title');
    const more = card.querySelector('.goal-more');
    const currentText = this.data.longTermGoal?.goal || '';

    card.classList.add('expanded');

    // textareaに置き換え
    if (content) {
      content.innerHTML = `<textarea id="longterm-card-edit-goal" class="expand-edit-textarea">${escapeHtml(currentText)}</textarea>`;
    }

    // ボタンを保存/キャンセルに
    if (more) {
      more.innerHTML = `
        <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeLongtermCardExpand()">キャンセル</button>
        <button class="expand-btn save" onclick="event.stopPropagation(); app.saveLongtermCardExpand()">保存</button>
      `;
    }

    // textareaにフォーカス＆高さ自動調整
    setTimeout(() => {
      const textarea = document.getElementById('longterm-card-edit-goal');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        textarea.focus();
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        });
      }
    }, 100);
  },

  closeLongtermCardExpand() {
    const card = document.getElementById('longterm-card-goal');
    if (!card) return;

    card.classList.remove('expanded');
    this.render();
  },

  async saveLongtermCardExpand() {
    const textarea = document.getElementById('longterm-card-edit-goal');
    if (!textarea) return;

    const newValue = textarea.value;

    if (!this.data.longTermGoal) {
      this.data.longTermGoal = { goal: '' };
    }
    this.data.longTermGoal.goal = newValue;
    await saveLongTermGoal(this.data.longTermGoal);

    this.closeLongtermCardExpand();
  },

  /* ========================================
     逆算目標の展開仕様
     ======================================== */
  expandMilestone(index) {
    const wrapper = document.querySelector(`#milestone-${index} .milestone-goal-wrapper`);
    if (!wrapper) return;

    const isExpanded = wrapper.classList.contains('expanded');
    const content = wrapper.querySelector('.milestone-goal-content');
    const more = wrapper.querySelector('.milestone-goal-more');

    if (isExpanded) {
      this.closeMilestoneExpand(index);
    } else {
      const currentText = this.data.longTermGoal?.milestones?.[index]?.goal || '';

      // はみ出ていない場合はすぐに編集モードへ
      const isOverflow = content && content.scrollHeight > content.clientHeight;

      wrapper.classList.add('expanded');

      if (!isOverflow) {
        this.enterMilestoneEditMode(index);
        return;
      }

      // はみ出ている場合は閲覧モード
      if (content) {
        content.style.maxHeight = 'none';
        content.innerHTML = `<div class="expand-view-text" onclick="event.stopPropagation(); app.enterMilestoneEditMode(${index})">${escapeHtml(currentText)}</div>`;
      }

      // ボタンを編集/閉じるに
      if (more) {
        more.innerHTML = `
          <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeMilestoneExpand(${index})">閉じる</button>
          <button class="expand-btn save" onclick="event.stopPropagation(); app.enterMilestoneEditMode(${index})">編集</button>
        `;
      }
    }
  },

  enterMilestoneEditMode(index) {
    const wrapper = document.querySelector(`#milestone-${index} .milestone-goal-wrapper`);
    if (!wrapper) return;

    const content = wrapper.querySelector('.milestone-goal-content');
    const more = wrapper.querySelector('.milestone-goal-more');
    const currentText = this.data.longTermGoal?.milestones?.[index]?.goal || '';

    wrapper.classList.add('expanded');

    // textareaに置き換え
    if (content) {
      content.innerHTML = `<textarea id="milestone-edit-${index}" class="milestone-edit-textarea">${escapeHtml(currentText)}</textarea>`;
    }

    // ボタンを保存/キャンセルに
    if (more) {
      more.innerHTML = `
        <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeMilestoneExpand(${index})">キャンセル</button>
        <button class="expand-btn save" onclick="event.stopPropagation(); app.saveMilestoneExpand(${index})">保存</button>
      `;
    }

    // textareaにフォーカス＆高さ自動調整
    setTimeout(() => {
      const textarea = document.getElementById(`milestone-edit-${index}`);
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
        textarea.focus();
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.max(textarea.scrollHeight, 42) + 'px';
        });
      }
    }, 100);
  },

  closeMilestoneExpand(index) {
    const wrapper = document.querySelector(`#milestone-${index} .milestone-goal-wrapper`);
    if (!wrapper) return;

    wrapper.classList.remove('expanded');
    this.render();
  },

  async saveMilestoneExpand(index) {
    const textarea = document.getElementById(`milestone-edit-${index}`);
    if (!textarea) return;

    const newValue = textarea.value;

    if (!this.data.longTermGoal) {
      this.data.longTermGoal = { milestones: [] };
    }
    if (!this.data.longTermGoal.milestones) {
      this.data.longTermGoal.milestones = [];
    }
    if (!this.data.longTermGoal.milestones[index]) {
      this.data.longTermGoal.milestones[index] = {};
    }
    this.data.longTermGoal.milestones[index].goal = newValue;
    await saveLongTermGoal(this.data.longTermGoal);

    this.closeMilestoneExpand(index);
  },

  /* ========================================
     長期目標一覧の展開仕様（閲覧専用）
     ======================================== */
  expandLongtermListItem(index, goalId) {
    const wrapper = document.querySelector(`#longterm-list-${index} .list-goal-wrapper`);
    if (!wrapper) return;

    const isExpanded = wrapper.classList.contains('expanded');
    const content = wrapper.querySelector('.list-goal-content');
    const more = wrapper.querySelector('.list-goal-more');

    if (isExpanded) {
      // 閉じる
      wrapper.classList.remove('expanded');
      if (content) {
        content.style.maxHeight = '';
      }
      if (more) {
        // checkOverflowで再設定されるので空にする
        more.innerHTML = '';
      }
      this.checkOverflow();
    } else {
      // はみ出ていない場合は詳細ページへ
      const isOverflow = content && content.scrollHeight > content.clientHeight;

      if (!isOverflow) {
        this.viewLongTermGoal(goalId);
        return;
      }

      // 展開（閲覧モード）
      wrapper.classList.add('expanded');
      if (content) {
        content.style.maxHeight = 'none';
      }
      if (more) {
        more.innerHTML = `
          <button class="expand-btn cancel" onclick="event.stopPropagation(); app.closeLongtermListItem(${index})">閉じる</button>
          <button class="expand-btn save" onclick="event.stopPropagation(); app.viewLongTermGoal(${goalId})">詳細</button>
        `;
      }
    }
  },

  closeLongtermListItem(index) {
    const wrapper = document.querySelector(`#longterm-list-${index} .list-goal-wrapper`);
    if (!wrapper) return;

    wrapper.classList.remove('expanded');
    const content = wrapper.querySelector('.list-goal-content');
    if (content) {
      content.style.maxHeight = '';
    }
    this.checkOverflow();
  },

  async toggleJournalStar(journalDate) {
    const journal = this.data.journals.find(j => j.date === journalDate);
    if (journal) {
      journal.starred = !journal.starred;
      await saveJournal(journal);

      // 今日の日誌の場合はtodayJournalも更新
      if (this.data.todayJournal && this.data.todayJournal.date === journalDate) {
        this.data.todayJournal.starred = journal.starred;
      }

      this.render();
    }
  },

  showStyleThemeModal() {
    const current = this.data.settings.styleTheme || null;
    const styles = [
      { id: null, name: 'ベース', desc: '標準スタイル' },
      { id: 'minimal', name: 'ミニマル', desc: 'シャープ・影なし・細線' },
      { id: 'soft', name: 'ソフト', desc: '丸い・柔らかい影' },
      { id: 'vivid', name: 'ビビッド', desc: '現在と同じ' }
    ];

    const optionsHTML = styles.map(s => `
      <div class="modal-option ${current === s.id ? 'active' : ''}" onclick="app.selectStyleTheme(${s.id ? `'${s.id}'` : 'null'})">
        <div>
          <div class="modal-option-name">${s.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${s.desc}</div>
        </div>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">UIスタイル</div>
          <div class="modal-option-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async selectStyleTheme(styleId) {
    this.data.settings.styleTheme = styleId;
    this.applyStyleTheme(styleId);
    await saveSetting('styleTheme', styleId);
    this.closeModalDirect();
    this.render();
  },

  showThemeModal() {
    const currentTheme = this.data.settings.theme;
    const themeApplyAll = this.data.settings.themeApplyAll || false;

    // プレビュー用に現在の状態を保存
    this.previewTheme = currentTheme;
    this.previewThemeApplyAll = themeApplyAll;
    this.originalTheme = currentTheme;
    this.originalThemeApplyAll = themeApplyAll;

    const themes = [
      { id: null, name: 'ベース', color: '#888888' },
      { id: 'blue', name: 'ブルー', color: '#4A90D9' },
      { id: 'green', name: 'グリーン', color: '#5CB85C' },
      { id: 'purple', name: 'パープル', color: '#7C6DD8' },
      { id: 'orange', name: 'オレンジ', color: '#F5A623' },
      { id: 'pink', name: 'ピンク', color: '#E91E8C' },
      { id: 'mono', name: 'モノクロ', color: '#555555' }
    ];

    const optionsHTML = themes.map(t => {
      const isAllActive = currentTheme === t.id && themeApplyAll;
      const isPartActive = currentTheme === t.id && !themeApplyAll;
      const allStyle = `border-color: ${t.color};${isAllActive ? ` background: ${t.color};` : ''}`;
      const partStyle = `border-color: ${t.color};${isPartActive ? ` background: ${t.color};` : ''}`;
      const showPartBtn = t.id !== null;
      return `
      <div class="theme-modal-option ${currentTheme === t.id ? 'active' : ''}" data-theme-id="${t.id}">
        <div class="theme-modal-btn ${isAllActive ? 'active' : ''}" data-mode="all" data-theme="${t.id}" data-color="${t.color}" style="${allStyle}" onclick="app.previewThemeSelect(${t.id ? `'${t.id}'` : 'null'}, true)"></div>
        <div class="theme-modal-name">${t.name}</div>
        ${showPartBtn ? `<div class="theme-modal-btn ${isPartActive ? 'active' : ''}" data-mode="part" data-theme="${t.id}" data-color="${t.color}" style="${partStyle}" onclick="app.previewThemeSelect('${t.id}', false)"></div>` : '<div style="width:28px;"></div>'}
      </div>
    `;
    }).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeThemeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()" style="position: relative;">
          <div class="modal-title" style="margin-bottom: 8px;">テーマカラー</div>
          <div class="theme-modal-header">
            <span class="theme-modal-label-left">[ 背景 有 ]</span>
            <span></span>
            <span class="theme-modal-label-right">[ 背景 無 ]</span>
          </div>
          <div class="theme-modal-list">
            ${optionsHTML}
          </div>
          <div class="theme-modal-footer">
            <button class="theme-modal-confirm" onclick="app.confirmTheme()">保存</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  previewThemeSelect(theme, applyAll) {
    this.previewTheme = theme;
    this.previewThemeApplyAll = applyAll;

    // 全ボタンの状態をリセット
    document.querySelectorAll('.theme-modal-btn').forEach(btn => {
      btn.classList.remove('active', 'previewing');
      const color = btn.dataset.color;
      btn.style.background = 'transparent';
    });

    // 選択したボタンを点滅状態に
    const targetBtn = document.querySelector(`.theme-modal-btn[data-theme="${theme}"][data-mode="${applyAll ? 'all' : 'part'}"]`);
    if (targetBtn) {
      targetBtn.classList.add('previewing');
      const color = targetBtn.dataset.color;
      targetBtn.style.background = color;
    }

    // オプションの背景も更新
    document.querySelectorAll('.theme-modal-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeId === String(theme));
    });
  },

  async confirmTheme() {
    await this.setTheme(this.previewTheme, this.previewThemeApplyAll);
    this.closeModalDirect();
  },

  closeThemeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
      // 決定を押さずに閉じた場合、元のテーマに戻す
      this.applyTheme(this.originalTheme, this.originalThemeApplyAll);
      this.closeModalDirect();
    }
  },

  showFontModal() {
    const currentFont = this.data.settings.font;
    this.previewFont = currentFont; // プレビュー用
    const fonts = [
      { id: null, name: 'システム標準' },
      { id: 1, name: '字体1' },
      { id: 2, name: '字体2' },
      { id: 3, name: '字体3' },
      { id: 4, name: '字体4' },
      { id: 5, name: '字体5' },
      { id: 6, name: '字体6' },
      { id: 7, name: '字体7' },
      { id: 8, name: '字体8' },
      { id: 9, name: '字体9' }
    ];

    const optionsHTML = fonts.map(f => `
      <div class="font-modal-option ${currentFont === f.id ? 'active' : ''}" data-font-id="${f.id}"
           onclick="app.previewFontSelect(${f.id})"
           style="${f.id ? `font-family: ${this.getFontFamily(f.id)};` : ''}">
        <span class="font-modal-name">${f.name}</span>
      </div>
    `).join('');

    const previewStyle = currentFont ? `font-family: ${this.getFontFamily(currentFont)};` : '';

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="font-modal-header">
            <span class="modal-title">フォント</span>
            <button class="font-modal-confirm" onclick="app.confirmFont()">決定</button>
          </div>
          <div class="font-modal-preview" id="fontPreview" style="${previewStyle}">
            よろしくお願いいたします。
          </div>
          <div class="font-modal-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  previewFontSelect(fontId) {
    this.previewFont = fontId;
    // プレビューテキストのフォント変更
    const preview = document.getElementById('fontPreview');
    if (preview) {
      preview.style.fontFamily = fontId ? this.getFontFamily(fontId) : '';
    }
    // 選択状態を更新
    document.querySelectorAll('.font-modal-option').forEach(el => {
      const id = el.dataset.fontId === 'null' ? null : parseInt(el.dataset.fontId);
      el.classList.toggle('active', id === fontId);
    });
  },

  async confirmFont() {
    await this.setFont(this.previewFont);
    this.closeModalDirect();
  },

  // 詳細ボタン形状モーダル
  showDetailBtnStyleModal() {
    const currentStyle = this.data.settings.detailBtnStyle || 'raised';
    const styles = [
      { id: 'raised', name: '浮き' },
      { id: 'outline', name: '枠線' },
      { id: 'pill', name: 'ピル' },
      { id: 'flat', name: 'フラット' }
    ];

    const optionsHTML = styles.map(s => `
      <div class="modal-option ${currentStyle === s.id ? 'active' : ''}"
           onclick="app.setDetailBtnStyle('${s.id}')">
        <span class="modal-option-name">${s.name}</span>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">詳細ボタン形状</div>
          <div class="modal-option-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async setDetailBtnStyle(style) {
    this.data.settings.detailBtnStyle = style;
    await saveSetting('detailBtnStyle', style);
    this.applyDetailBtnSettings(style, this.data.settings.detailBtnColor);
    this.closeModalDirect();
    this.render();
  },

  // 詳細ボタン配色モーダル
  showDetailBtnColorModal() {
    const currentColor = this.data.settings.detailBtnColor || 'adaptive';
    const colors = [
      { id: 'neutral', name: '固定グレー' },
      { id: 'adaptive', name: 'テーマ連動' }
    ];

    const optionsHTML = colors.map(c => `
      <div class="modal-option ${currentColor === c.id ? 'active' : ''}"
           onclick="app.setDetailBtnColor('${c.id}')">
        <span class="modal-option-name">${c.name}</span>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">詳細ボタン配色</div>
          <div class="modal-option-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async setDetailBtnColor(color) {
    this.data.settings.detailBtnColor = color;
    await saveSetting('detailBtnColor', color);
    this.applyDetailBtnSettings(this.data.settings.detailBtnStyle, color);
    this.closeModalDirect();
    this.render();
  },

  showSchedulePatternModal() {
    const currentPattern = this.data.settings.schedulePattern || 'hourly';
    const patterns = [
      { id: 'hourly', name: '時間帯区切り', desc: '6時〜23時を1時間ごとに区切る' },
      { id: 'free', name: '自由形式', desc: '開始〜終了時間を自由に設定' }
    ];

    const optionsHTML = patterns.map(p => `
      <div class="modal-option ${currentPattern === p.id ? 'active' : ''}"
           onclick="app.setSchedulePattern('${p.id}')">
        <span class="modal-option-name">${p.name}</span>
        <span class="modal-option-desc">${p.desc}</span>
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModalDirect()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">スケジュール形式</div>
          <div class="modal-option-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async setSchedulePattern(pattern) {
    this.data.settings.schedulePattern = pattern;
    await saveSetting('schedulePattern', pattern);
    this.closeModalDirect();
    this.render();
  },

  showFontSizeModal() {
    const currentLabelSize = this.data.settings.labelFontSize || 100;
    const currentInputSize = this.data.settings.inputFontSize || 100;
    const currentHomeSize = this.data.settings.homeFontSize || 100;
    const sizeSteps = [85, 92, 100, 110, 120];

    const createStepOptions = (type, currentSize) => {
      return sizeSteps.map((size, index) => {
        const isSelected = currentSize === size;
        const label = index === 2 ? '標準' : (index < 2 ? '小' + (2 - index) : '大' + (index - 2));
        return `<label class="font-size-step ${isSelected ? 'selected' : ''}" onclick="app.selectFontSizeStep('${type}', ${size})">
          <span class="font-size-step-label">${label}</span>
        </label>`;
      }).join('');
    };

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeFontSizeModal(event)">
        <div class="modal-content font-size-modal" onclick="event.stopPropagation()">
          <div class="modal-title">文字サイズ</div>

          <div class="font-size-section">
            <div class="font-size-section-title">タイトル</div>
            <div class="font-size-preview" id="label-preview" style="font-size: ${currentLabelSize}%;">よろしくお願いいたします。</div>
            <div class="font-size-steps" id="label-steps">
              ${createStepOptions('label', currentLabelSize)}
            </div>
          </div>

          <div class="font-size-section">
            <div class="font-size-section-title">入力</div>
            <div class="font-size-preview" id="input-preview" style="font-size: ${currentInputSize}%;">よろしくお願いいたします。</div>
            <div class="font-size-steps" id="input-steps">
              ${createStepOptions('input', currentInputSize)}
            </div>
          </div>

          <div class="font-size-section">
            <div class="font-size-section-title">ホーム画面</div>
            <div class="font-size-preview" id="home-preview" style="font-size: ${currentHomeSize}%;">よろしくお願いいたします。</div>
            <div class="font-size-steps" id="home-steps">
              ${createStepOptions('home', currentHomeSize)}
            </div>
          </div>

          <div class="font-size-footer">
            <button class="font-size-confirm" onclick="app.confirmFontSize()">保存</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  selectFontSizeStep(type, size) {
    const preview = document.getElementById(`${type}-preview`);
    const stepsContainer = document.getElementById(`${type}-steps`);
    if (preview) preview.style.fontSize = `${size}%`;
    if (stepsContainer) {
      stepsContainer.querySelectorAll('.font-size-step').forEach((step, index) => {
        const stepSizes = [85, 92, 100, 110, 120];
        step.classList.toggle('selected', stepSizes[index] === size);
      });
    }
  },

  async confirmFontSize() {
    const labelSteps = document.getElementById('label-steps');
    const inputSteps = document.getElementById('input-steps');
    const homeSteps = document.getElementById('home-steps');

    if (!labelSteps || !inputSteps || !homeSteps) {
      this.closeModalDirect();
      return;
    }

    const sizeSteps = [85, 92, 100, 110, 120];
    let labelSize = 100;
    let inputSize = 100;
    let homeSize = 100;

    labelSteps.querySelectorAll('.font-size-step').forEach((step, index) => {
      if (step.classList.contains('selected')) labelSize = sizeSteps[index];
    });
    inputSteps.querySelectorAll('.font-size-step').forEach((step, index) => {
      if (step.classList.contains('selected')) inputSize = sizeSteps[index];
    });
    homeSteps.querySelectorAll('.font-size-step').forEach((step, index) => {
      if (step.classList.contains('selected')) homeSize = sizeSteps[index];
    });

    this.data.settings.labelFontSize = labelSize;
    this.data.settings.inputFontSize = inputSize;
    this.data.settings.homeFontSize = homeSize;

    // まずモーダルを閉じる
    this.closeModalDirect();

    // その後保存と適用
    this.applyFontSize();
    await saveSetting('labelFontSize', labelSize);
    await saveSetting('inputFontSize', inputSize);
    await saveSetting('homeFontSize', homeSize);
  },

  closeFontSizeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
      this.closeModalDirect();
    }
  },

  applyFontSize() {
    const labelSize = this.data.settings.labelFontSize || 100;
    const inputSize = this.data.settings.inputFontSize || 100;
    const homeSize = this.data.settings.homeFontSize || 100;
    document.documentElement.style.setProperty('--label-font-size', labelSize);
    document.documentElement.style.setProperty('--input-font-size', inputSize);
    document.documentElement.style.setProperty('--home-font-size', homeSize);
  },

  showTransitionModal() {
    const currentTransition = this.data.settings.transition || 'none';
    const transitions = [
      { id: 'none', name: 'ベース', desc: '下枠→スケール、他→フェード' },
      { id: 'fade', name: 'フェード', desc: 'ふわっと消えて現れる' },
      { id: 'slide', name: 'スライド', desc: '横からスライド' },
      { id: 'scale', name: 'スケール', desc: '小さくなって大きくなる' },
      { id: 'push', name: 'プッシュ', desc: '押し出される感じ' }
    ];

    const optionsHTML = transitions.map(t => `
      <div class="transition-modal-option ${currentTransition === t.id ? 'active' : ''}"
           onclick="app.selectTransition('${t.id}')">
        <span class="transition-modal-name">${t.name}</span>
        <span class="transition-modal-desc">${t.desc}</span>
        ${currentTransition === t.id ? '<span class="transition-modal-check">✓</span>' : ''}
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">画面切り替え</div>
          <div class="transition-modal-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async selectTransition(type) {
    await this.setTransition(type);
    this.closeModalDirect();
  },

  // 入力モーダルタイプ選択
  showInputModalTypeModal() {
    const currentType = this.data.settings.inputModalType || 'center';
    const types = [
      { id: 'center', name: 'センター', desc: '画面中央にポップアップ' },
      { id: 'bottom', name: 'ボトムシート', desc: '画面下からスライド' },
      { id: 'inline', name: 'インライン', desc: 'その場で入力欄が展開' },
      { id: 'toast', name: 'トースト型', desc: '画面上部に小さく表示' }
    ];

    const optionsHTML = types.map(t => `
      <div class="transition-modal-option ${currentType === t.id ? 'active' : ''}"
           onclick="app.selectInputModalType('${t.id}')">
        <span class="transition-modal-name">${t.name}</span>
        <span class="transition-modal-desc">${t.desc}</span>
        ${currentType === t.id ? '<span class="transition-modal-check">✓</span>' : ''}
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay active" onclick="app.closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">入力モーダル</div>
          <div class="transition-modal-list">
            ${optionsHTML}
          </div>
        </div>
      </div>
    `;

    // レイアウトシフト防止: .appの幅を固定
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.style.width = appEl.offsetWidth + 'px';
    }
    document.body.style.overflow = 'hidden';

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:11000;';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  },

  async selectInputModalType(type) {
    this.data.settings.inputModalType = type;
    await saveSetting('inputModalType', type);

    this.closeModalDirect();

    // ページ全体を再描画せず、表示値だけ直接更新
    const typeNames = {center:'センター', bottom:'ボトムシート', inline:'インライン', toast:'トースト型'};
    const valueEl = document.querySelector('.setting-item[onclick*="showInputModalTypeModal"] .setting-value');
    if (valueEl) {
      valueEl.textContent = typeNames[type] || 'センター';
    }
  },

  // スケジュールウィジェットスタイル選択モーダル
  showScheduleWidgetStyleModal() {
    if (document.querySelector('.widget-style-modal')) return;
    const current = this.data.settings.scheduleWidgetStyle || 'timeline';
    const styles = [
      { id: 'timeline', name: 'タイムライン', desc: '縦に並ぶドット付きタイムライン' },
      { id: 'blocks', name: 'ブロック', desc: 'カード形式のブロック表示' },
      { id: 'gantt', name: 'ガント', desc: '横棒グラフ風のチャート' },
      { id: 'simple', name: 'シンプル', desc: 'ミニマルなリスト形式' }
    ];

    const optionsHTML = styles.map(s => `
      <div class="style-option ${current === s.id ? 'active' : ''}" onclick="app.selectScheduleWidgetStyle('${s.id}')">
        <span class="style-option-name">${s.name}</span>
        <span class="style-option-desc">${s.desc}</span>
        ${current === s.id ? '<span class="style-option-check">✓</span>' : ''}
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay widget-style-modal active" onclick="app.closeWidgetStyleModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">スケジュールデザイン</div>
          <div class="style-options">${optionsHTML}</div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async selectScheduleWidgetStyle(style) {
    this.data.settings.scheduleWidgetStyle = style;
    await saveSetting('scheduleWidgetStyle', style);
    this.closeWidgetStyleModal();
    this.render();
  },

  // ルーティンウィジェットスタイル選択モーダル
  showRoutineWidgetStyleModal() {
    if (document.querySelector('.widget-style-modal')) return;
    const current = this.data.settings.routineWidgetStyle || 'checklist';
    const styles = [
      { id: 'checklist', name: 'チェックリスト', desc: 'プログレスバー付きリスト' },
      { id: 'circle', name: 'サークル', desc: '円形の進捗ゲージ' },
      { id: 'cards', name: 'カード', desc: 'カード形式で並べて表示' },
      { id: 'minimal', name: 'ミニマル', desc: 'ドットとテキストのみ' }
    ];

    const optionsHTML = styles.map(s => `
      <div class="style-option ${current === s.id ? 'active' : ''}" onclick="app.selectRoutineWidgetStyle('${s.id}')">
        <span class="style-option-name">${s.name}</span>
        <span class="style-option-desc">${s.desc}</span>
        ${current === s.id ? '<span class="style-option-check">✓</span>' : ''}
      </div>
    `).join('');

    const modalHTML = `
      <div class="modal-overlay widget-style-modal active" onclick="app.closeWidgetStyleModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-title">ルーティンデザイン</div>
          <div class="style-options">${optionsHTML}</div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async selectRoutineWidgetStyle(style) {
    this.data.settings.routineWidgetStyle = style;
    await saveSetting('routineWidgetStyle', style);
    this.closeWidgetStyleModal();
    this.render();
  },

  closeWidgetStyleModal() {
    const modal = document.querySelector('.widget-style-modal');
    if (modal) modal.remove();
  },

  // ルーティン編集モーダル（テーブル等から開く用）
  openRoutineEditModal(index) {
    if (document.querySelector('.routine-edit-modal')) return;
    const routine = this.data.monthlyGoal?.routines?.[index];
    if (!routine) return;

    const categoryOptions = Object.entries({
      rei: '霊', shin: '心', tai: '体', gi: '技', sei: '生活'
    }).map(([key, name]) =>
      `<option value="${key}" ${routine.category === key ? 'selected' : ''}>${name}</option>`
    ).join('');

    const modalHTML = `
      <div class="modal-overlay routine-edit-modal active" onclick="app.closeRoutineEditModal()">
        <div class="modal-content routine-edit-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">ルーティン編集</div>
            <button class="modal-close" onclick="app.closeRoutineEditModal()">×</button>
          </div>
          <div class="routine-edit-form">
            <div class="routine-field">
              <label>ルーティン名</label>
              <input class="input-field" id="re-name" value="${escapeHtml(routine.name || '')}" autocomplete="off">
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>カテゴリ</label>
              <select class="input-field" id="re-category">${categoryOptions}</select>
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>曜日指定</label>
              <div class="re-weekdays" id="re-weekdays">
                ${['日','月','火','水','木','金','土'].map((d, i) => {
                  const checked = (routine.weekDays && routine.weekDays.includes(i)) ? 'active' : '';
                  return `<button type="button" class="re-weekday-btn ${checked}" data-day="${i}" onclick="this.classList.toggle('active')">${d}</button>`;
                }).join('')}
              </div>
              <p class="field-hint">未選択＝毎日</p>
            </div>
            <div class="routine-field">
              <label>週の目標回数（任意）</label>
              <input class="input-field" id="re-weekly-target" type="number" min="1" max="7" placeholder="未入力＝曜日数がターゲット" value="${routine.weeklyTarget || ''}">
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>📝 前準備</label>
              <textarea class="input-field" id="re-preparation" rows="2" placeholder="例：19時までに仕事を終わらせる">${escapeHtml(routine.preparation || '')}</textarea>
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>⚡ 反射条件</label>
              <textarea class="input-field" id="re-trigger" rows="2" placeholder="例：20時になったら風呂に入る">${escapeHtml(routine.trigger || '')}</textarea>
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>📋 最低限設定</label>
              <textarea class="input-field" id="re-minimum" rows="2" placeholder="例：最低でも10分は入る">${escapeHtml(routine.minimumAction || '')}</textarea>
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>📖 マニュアル URL</label>
              <input class="input-field" id="re-manual-url" type="url" placeholder="https://drive.google.com/..." value="${escapeHtml(routine.manualUrl || '')}">
            </div>
            <div class="routine-field">
              <label>📖 マニュアル 説明（任意）</label>
              <textarea class="input-field" id="re-manual" rows="2" placeholder="ドキュメントの説明など">${escapeHtml(routine.manual || '')}</textarea>
            </div>
            <hr class="re-divider">
            <div class="routine-field">
              <label>📊 評価指標（任意）</label>
              <input class="input-field" id="re-metric-name" placeholder="例：体重 / 学習時間 / 売上" value="${escapeHtml(routine.metricName || '')}">
            </div>
            <div class="routine-field">
              <label>🎯 数値目標（任意）</label>
              <input class="input-field" id="re-metric-target" placeholder="例：65kg / 週10時間" value="${escapeHtml(routine.metricTarget || '')}">
            </div>
          </div>
          <div class="modal-buttons">
            <button class="modal-btn danger" onclick="app.removeMonthlyRoutine(${index}); app.closeRoutineEditModal();">削除</button>
            <button class="modal-btn primary" onclick="app.saveRoutineFromModal(${index})">保存</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveRoutineFromModal(index) {
    const name = document.getElementById('re-name').value;
    const category = document.getElementById('re-category').value;
    const preparation = document.getElementById('re-preparation').value;
    const trigger = document.getElementById('re-trigger').value;
    const minimumAction = document.getElementById('re-minimum').value;
    const manualUrl = document.getElementById('re-manual-url').value;
    const manual = document.getElementById('re-manual').value;
    const metricName = document.getElementById('re-metric-name').value;
    const metricTarget = document.getElementById('re-metric-target').value;

    if (!this.data.monthlyGoal.routines[index]) return;

    const weekDayBtns = document.querySelectorAll('#re-weekdays .re-weekday-btn.active');
    const weekDays = Array.from(weekDayBtns).map(b => parseInt(b.dataset.day));
    const weeklyTargetVal = document.getElementById('re-weekly-target').value;
    const weeklyTarget = weeklyTargetVal ? parseInt(weeklyTargetVal) : null;

    Object.assign(this.data.monthlyGoal.routines[index], {
      name, category, preparation, trigger, minimumAction, manualUrl, manual, metricName, metricTarget,
      weekDays: weekDays.length > 0 ? weekDays : null,
      weeklyTarget
    });

    await saveMonthlyGoal(this.data.monthlyGoal);
    this.closeRoutineEditModal();
    this.render();
  },

  closeRoutineEditModal() {
    const modal = document.querySelector('.routine-edit-modal');
    if (modal) modal.remove();
  },

  // カード形式の展開/折りたたみ（月次目標用）
  expandedRoutineCards: [],

  toggleRoutineCard(index) {
    if (!this.expandedRoutineCards) this.expandedRoutineCards = [];
    const idx = this.expandedRoutineCards.indexOf(index);
    if (idx >= 0) {
      this.expandedRoutineCards.splice(idx, 1);
    } else {
      this.expandedRoutineCards.push(index);
    }
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  toggleAllRoutineCards(open) {
    // .content要素のスクロール位置を保存
    const contentEl = document.querySelector('.content');
    const scrollTop = contentEl ? contentEl.scrollTop : 0;

    if (open) {
      // 全て開く
      const routines = this.data.monthlyGoal?.routines || [];
      this.expandedRoutineCards = routines.map((_, i) => i);
    } else {
      // 全て閉じる
      this.expandedRoutineCards = [];
    }

    // renderのスクロール調整を無効化するためフラグを立てる
    this._keepScrollPosition = scrollTop;
    this.render();
    delete this._keepScrollPosition;
  },

  // 日誌ルーティン用の展開/折りたたみ
  expandedJournalRoutineCards: [],

  toggleJournalRoutineCard(index) {
    if (!this.expandedJournalRoutineCards) this.expandedJournalRoutineCards = [];
    const idx = this.expandedJournalRoutineCards.indexOf(index);
    if (idx >= 0) {
      this.expandedJournalRoutineCards.splice(idx, 1);
    } else {
      this.expandedJournalRoutineCards.push(index);
    }
    const contentEl = document.querySelector('.content');
    this._keepScrollPosition = contentEl ? contentEl.scrollTop : 0;
    this.render();
    delete this._keepScrollPosition;
  },

  toggleAllJournalRoutineCards(open) {
    const contentEl = document.querySelector('.content');
    const scrollTop = contentEl ? contentEl.scrollTop : 0;

    if (open) {
      const routines = this.data.todayJournal?.routines || [];
      this.expandedJournalRoutineCards = routines.map((_, i) => i);
    } else {
      this.expandedJournalRoutineCards = [];
    }

    this._keepScrollPosition = scrollTop;
    this.render();
    delete this._keepScrollPosition;
  },

  // ホームウィジェット用ルーティンカード展開/折りたたみ
  expandedHomeRoutineCards: [],

  toggleHomeRoutineCard(index) {
    if (!this.expandedHomeRoutineCards) this.expandedHomeRoutineCards = [];

    // .contentと.widget-content両方のスクロール位置を保存
    const contentEl = document.querySelector('.content');
    const widgetContent = document.querySelector('.routine-widget .widget-content');
    const contentScrollTop = contentEl ? contentEl.scrollTop : 0;
    const widgetScrollTop = widgetContent ? widgetContent.scrollTop : 0;

    const idx = this.expandedHomeRoutineCards.indexOf(index);
    if (idx >= 0) {
      this.expandedHomeRoutineCards.splice(idx, 1);
    } else {
      this.expandedHomeRoutineCards.push(index);
    }

    this._keepScrollPosition = contentScrollTop;
    this.render();
    delete this._keepScrollPosition;

    // widget-contentのスクロール位置を復元
    requestAnimationFrame(() => {
      const newWidgetContent = document.querySelector('.routine-widget .widget-content');
      if (newWidgetContent) {
        newWidgetContent.scrollTop = widgetScrollTop;
      }
    });
  },

  // カスタム入力モーダル（prompt()の代わり）
  showCustomInputModal(title, placeholder, callback, defaultValue = '') {
    const type = this.data.settings.inputModalType || 'center';
    const escTitle = escapeHtml(title);
    const escPlaceholder = escapeHtml(placeholder);
    const escDefault = escapeHtml(defaultValue);

    let modalHTML = '';

    if (type === 'center') {
      modalHTML = `
        <div class="modal-overlay active" onclick="app.closeModal(event)">
          <div class="modal-content" onclick="event.stopPropagation()" style="width:90%;max-width:340px">
            <div class="modal-title">${escTitle}</div>
            <input type="text" class="modal-input" id="customInputValue"
                   placeholder="${escPlaceholder}" value="${escDefault}"
                   autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <div class="modal-buttons">
              <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
              <button class="modal-btn primary" onclick="app.submitCustomInput()">OK</button>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'bottom') {
      modalHTML = `
        <div class="modal-overlay active" onclick="app.closeModal(event)">
          <div class="bottom-sheet-modal" onclick="event.stopPropagation()">
            <div class="bottom-sheet-handle"></div>
            <div class="modal-title">${escTitle}</div>
            <input type="text" class="modal-input" id="customInputValue"
                   placeholder="${escPlaceholder}" value="${escDefault}"
                   autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <div class="modal-buttons">
              <button class="modal-btn" onclick="app.closeModalDirect()">キャンセル</button>
              <button class="modal-btn primary" onclick="app.submitCustomInput()">OK</button>
            </div>
          </div>
        </div>
      `;
    } else if (type === 'inline') {
      modalHTML = `
        <div class="modal-overlay active" onclick="app.closeModal(event)">
          <div class="inline-input-modal" onclick="event.stopPropagation()">
            <span class="inline-input-label">${escTitle}</span>
            <input type="text" class="inline-input-field" id="customInputValue"
                   placeholder="${escPlaceholder}" value="${escDefault}"
                   autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <button class="inline-input-btn" onclick="app.submitCustomInput()">✓</button>
            <button class="inline-input-btn cancel" onclick="app.closeModalDirect()">✕</button>
          </div>
        </div>
      `;
    } else if (type === 'toast') {
      modalHTML = `
        <div class="modal-overlay active" onclick="app.closeModal(event)">
          <div class="toast-input-modal" onclick="event.stopPropagation()">
            <div class="toast-input-title">${escTitle}</div>
            <div class="toast-input-row">
              <input type="text" class="toast-input-field" id="customInputValue"
                     placeholder="${escPlaceholder}" value="${escDefault}"
                     autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
              <button class="toast-input-btn" onclick="app.submitCustomInput()">OK</button>
            </div>
          </div>
        </div>
      `;
    }

    this.customInputCallback = callback;

    // レイアウトシフト防止: .appの幅を固定
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.style.width = appEl.offsetWidth + 'px';
    }
    document.body.style.overflow = 'hidden';

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:11000;';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    // 入力欄にフォーカス
    setTimeout(() => {
      const input = document.getElementById('customInputValue');
      if (input) input.focus();
    }, 100);
  },

  submitCustomInput() {
    const input = document.getElementById('customInputValue');
    const value = input ? input.value : '';
    this.closeModalDirect();
    if (this.customInputCallback) {
      this.customInputCallback(value);
      this.customInputCallback = null;
    }
  },

  getFontFamily(id) {
    const fontFamilies = {
      1: "'Yomogi', cursive",
      2: "'Kiwi Maru', serif",
      3: "'Zen Maru Gothic', sans-serif",
      4: "'M PLUS Rounded 1c', sans-serif",
      5: "'Hachi Maru Pop', cursive",
      6: "'Yuji Syuku', serif",
      7: "'Shippori Mincho', serif",
      8: "'Noto Serif JP', serif",
      9: "'Sawarabi Mincho', serif"
    };
    return fontFamilies[id] || 'inherit';
  },

  closeModalDirect() {
    // サブタスク追加フラグをクリーンアップ
    delete this._addSubtaskParentId;
    // modal-containerを全て削除（複数残っている場合に対応）
    const containers = document.querySelectorAll('#modal-container');
    containers.forEach(container => container.remove());

    // 注: 他のmodal-overlay（クイックモーダル等）は削除しない
    // それぞれのcloseQuickModal()等で処理する

    // bodyのスクロールを復元（他にモーダルがなければ）
    if (!document.querySelector('.modal-overlay')) {
      document.body.style.overflow = '';
    }

    // .appの幅を復元（他にモーダルがなければ）
    const appEl = document.getElementById('app');
    if (appEl && !document.querySelector('.modal-overlay')) {
      appEl.style.width = '';
    }
  },

  showFieldHelp(key) {
    const text = FIELD_HELP[key];
    if (!text) return;

    const existing = document.querySelector('.field-help-overlay');
    if (existing) existing.remove();

    const lines = text.split('\n');
    const title = lines[0];
    const body = lines.slice(1).join('<br>');

    const overlay = document.createElement('div');
    overlay.className = 'field-help-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `
      <div class="field-help-popup" onclick="event.stopPropagation()">
        <div class="field-help-title">${title}</div>
        <div class="field-help-body">${body}</div>
        <button class="field-help-close" onclick="this.closest('.field-help-overlay').remove()">閉じる</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  showPageGuide(pageId) {
    const guide = PAGE_GUIDE[pageId];
    if (!guide) return;

    const existing = document.querySelector('.field-help-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'field-help-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `
      <div class="field-help-popup page-guide-popup" onclick="event.stopPropagation()">
        <div class="page-guide-step">${guide.step}</div>
        <div class="field-help-title">${guide.title}</div>
        <div class="field-help-body">${guide.body.replace(/\n/g, '<br>')}</div>
        <button class="field-help-close" onclick="this.closest('.field-help-overlay').remove()">閉じる</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  showToast(message, duration = 2000, action = null) {
    // 既存のトーストを削除
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'toast-container';
    if (action) container.style.pointerEvents = 'auto';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    if (action) {
      const btn = document.createElement('button');
      btn.className = 'toast-action';
      btn.textContent = action.label;
      btn.onclick = async () => {
        clearTimeout(container._timerId);
        try { await action.callback(); } catch (e) { console.error('Undo failed:', e); }
        container.remove();
      };
      toast.appendChild(btn);
    }

    container.appendChild(toast);
    document.body.appendChild(container);

    // 自動で消える
    const timerId = setTimeout(() => {
      const t = container.querySelector('.toast');
      if (t) {
        t.classList.add('hide');
        setTimeout(() => container.remove(), 200);
      }
    }, duration);

    container._timerId = timerId;
  },

  closeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
      this.closeModalDirect();
    }
  },

  /* ========================================
     データエクスポート/インポート
     ======================================== */

  async exportData() {
    const data = {
      journals: await getAllData('journals'),
      monthlyGoals: await getAllData('monthlyGoals'),
      longTermGoals: await getAllData('longTermGoals'),
      lifeDesign: await getLifeDesign(),
      settings: this.data.settings,
      tasks: await getAllTasks(),
      routines: await getAllRoutines(),
      materials: await getAllMaterials(),
      firstbox: await getAllFirstBoxItems(),
      memos: await getAllMemos(),
      manuals: await getAllManuals(),
      scoreItems: this.data.scoreItems,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matsumura-method-backup-${getTodayDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },

  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);

          // バリデーション
          if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            this.showToast('無効なデータ形式です');
            return;
          }
          const errors = [];
          if (data.journals && !Array.isArray(data.journals)) errors.push('journals が配列ではありません');
          if (data.journals && Array.isArray(data.journals)) {
            const invalid = data.journals.filter(j => !j || typeof j.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(j.date));
            if (invalid.length > 0) errors.push(`journals に無効なデータが ${invalid.length} 件あります（date形式不正）`);
          }
          if (data.monthlyGoals && !Array.isArray(data.monthlyGoals)) errors.push('monthlyGoals が配列ではありません');
          if (data.monthlyGoals && Array.isArray(data.monthlyGoals)) {
            const invalid = data.monthlyGoals.filter(g => !g || typeof g.yearMonth !== 'string');
            if (invalid.length > 0) errors.push(`monthlyGoals に無効なデータが ${invalid.length} 件あります`);
          }
          if (data.longTermGoals && !Array.isArray(data.longTermGoals)) errors.push('longTermGoals が配列ではありません');
          if (data.longTermGoals && Array.isArray(data.longTermGoals)) {
            const invalid = data.longTermGoals.filter(g => !g || (typeof g.id !== 'string' && typeof g.id !== 'number'));
            if (invalid.length > 0) errors.push(`longTermGoals に無効なデータが ${invalid.length} 件あります`);
          }
          if (data.tasks && !Array.isArray(data.tasks)) errors.push('tasks が配列ではありません');
          if (data.routines && !Array.isArray(data.routines)) errors.push('routines が配列ではありません');
          if (data.firstbox && !Array.isArray(data.firstbox)) errors.push('firstbox が配列ではありません');
          if (data.memos && !Array.isArray(data.memos)) errors.push('memos が配列ではありません');
          if (data.manuals && !Array.isArray(data.manuals)) errors.push('manuals が配列ではありません');
          if (data.materials && !Array.isArray(data.materials)) errors.push('materials が配列ではありません');
          if (data.settings && (typeof data.settings !== 'object' || Array.isArray(data.settings))) errors.push('settings がオブジェクトではありません');
          if (data.lifeDesign && (typeof data.lifeDesign !== 'object' || Array.isArray(data.lifeDesign))) errors.push('lifeDesign がオブジェクトではありません');

          if (errors.length > 0) {
            const numbered = errors.map((e, i) => `${i + 1}. ${e}`).join('\n');
            this.showToast(`データ検証エラー（${errors.length}件）\n${numbered}`, 5000);
            console.error('Import validation errors:', errors);
            return;
          }

          // インポート対象データの有無チェック
          const hasAnyData = data.journals || data.monthlyGoals || data.longTermGoals ||
            data.lifeDesign || data.settings || data.tasks || data.routines ||
            data.materials || data.firstbox || data.memos || data.manuals || data.scoreItems;
          if (!hasAnyData) {
            this.showToast('インポートするデータがありません');
            return;
          }

          // 確認ダイアログ
          if (!confirm('データをインポートすると、同じキーの既存データが上書きされます。続行しますか？')) {
            return;
          }

          // バリデーション通過後のインポート（単一トランザクションでアトミックに保存）
          const storeDataMap = {};
          const arrayStores = ['journals', 'monthlyGoals', 'longTermGoals', 'tasks',
                               'routines', 'materials', 'firstbox', 'memos', 'manuals'];
          for (const store of arrayStores) {
            if (data[store] && Array.isArray(data[store])) {
              storeDataMap[store] = data[store];
            }
          }
          if (data.lifeDesign) {
            storeDataMap.lifeDesign = [data.lifeDesign];
          }
          // settings はオブジェクト→配列に変換（端末固有設定とscoreItemsは除外）
          const settingsItems = [];
          if (data.settings && typeof data.settings === 'object') {
            for (const [key, value] of Object.entries(data.settings)) {
              if (!this._LOCAL_ONLY_SETTINGS.includes(key) && key !== 'scoreItems') {
                settingsItems.push({ key, value });
              }
            }
          }
          if (data.scoreItems) {
            settingsItems.push({ key: 'scoreItems', value: data.scoreItems });
          }
          if (settingsItems.length > 0) {
            storeDataMap.settings = settingsItems;
          }
          await saveBatch(storeDataMap);

          await this.loadAllData();
          this.render();
          this.showToast('インポートが完了しました');
        } catch (error) {
          console.error('Import error:', error);
          this.showToast('インポートに失敗: ' + error.message);
        }
      }
    };
    input.click();
  },

  async clearDemoData() {
    if (!confirm('デモデータを全て削除して、空の状態から始めます。よろしいですか？')) return;
    if (!confirm('再度確認します。全データが削除されます。続行しますか？')) return;
    try {
      const storeNames = Array.from(db.objectStoreNames);
      const tx = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
      // clear後、同一トランザクション内でseedガードフラグを設定（アトミック性保証）
      tx.objectStore('settings').put({ key: 'seedDataInserted', value: true });
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      });
      this.showToast('データを削除しました。リロードします…');
      setTimeout(() => location.reload(), 1000);
    } catch (e) {
      console.error('clearDemoData error:', e);
      this.showToast('データ削除に失敗: ' + e.message + '\nリロードします…');
      setTimeout(() => location.reload(), 1000);
    }
  },

  async confirmResetData() {
    if (confirm('全データを削除し、デモデータを再投入します。よろしいですか？')) {
      if (confirm('再度確認します。全データを削除してよろしいですか？')) {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => location.reload();
        req.onerror = () => location.reload();
      }
    }
  },

  /* ========================================
     進捗表示
     ======================================== */

  async showProgress() {
    // カレンダーページ初回表示時にデータを読み込み
    if (!this.data.calendarMonthlyGoal || !this.data.calendarTasks) {
      const now = new Date();
      await this.loadReviewCalendarJournals(
        this.reviewCalendarYear ?? now.getFullYear(),
        this.reviewCalendarMonth ?? now.getMonth()
      );
    }
    this.navigate('calendar');
  },

  /* ========================================
     ヘルプ表示
     ======================================== */

  showHelp(topic) {
    const helps = {
      reflection: '今日うまくいかなかったこと、改善したいことを書きましょう。',
      effort: '今日頑張ったこと、達成できたことを書きましょう。',
      contribution: '誰かの役に立てたこと、社会貢献について書きましょう。',
      gratitude: '感謝したいこと、気づいたこと、印象に残ったことを書きましょう。',
      free: '自由にメモしたいことを書きましょう。'
    };
    const text = helps[topic] || '';
    if (!text) return;
    // インラインヘルプを切り替え
    const el = document.getElementById('help-' + topic);
    if (el) {
      el.classList.toggle('show');
    }
  },

  /* ========================================
     Service Worker 登録
     ======================================== */

  _swRegistration: null,

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' });
        this._swRegistration = registration;
        // 新しいSWがあれば即座に更新チェック
        registration.update();
        // 新しいSWがアクティブになったら自動リロードで最新を反映
        const hadController = !!navigator.serviceWorker.controller;
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing && hadController) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  },

  async checkForAppUpdate() {
    this.showToast('確認中…');
    try {
      const res = await fetch('./js/app.js?_=' + Date.now(), { cache: 'no-store' });
      const text = await res.text();
      const match = text.match(/const APP_VERSION = (\d+);/);
      if (match) {
        const serverVersion = parseInt(match[1]);
        if (serverVersion > APP_VERSION) {
          localStorage.setItem('app_update_pending', 'true');
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) { await reg.unregister(); }
            const keys = await caches.keys();
            for (const key of keys) { await caches.delete(key); }
          } catch (e) { /* ignore */ }
          window.location.href = window.location.pathname + '?_=' + Date.now();
        } else {
          this.showToast('最新バージョンです（v' + APP_VERSION + '）');
        }
      } else {
        this.showToast('バージョン確認に失敗しました');
      }
    } catch (e) {
      this.showToast('通信エラー: ' + e.message);
    }
  },

  async forceRefresh() {
    this.showToast('強制更新中…');
    localStorage.setItem('app_update_pending', 'true');
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) { await reg.unregister(); }
      const keys = await caches.keys();
      for (const key of keys) { await caches.delete(key); }
    } catch (e) { /* ignore */ }
    window.location.href = window.location.pathname + '?_=' + Date.now();
  },

  _showUpdateNotification() {
    // 自動リロードに変更（controllerchangeで直接reload()）
    // 念のため残す：手動呼び出し用
    window.location.reload();
  },

  // 起動時にサーバーのバージョンと比較し、古ければ強制更新
  async autoUpdateCheck() {
    try {
      const res = await fetch('./js/app.js?_=' + Date.now(), { cache: 'no-store' });
      const text = await res.text();
      const match = text.match(/const APP_VERSION = (\d+);/);
      if (match) {
        const serverVersion = parseInt(match[1]);
        if (serverVersion > APP_VERSION) {
          console.log(`Auto update: v${APP_VERSION} -> v${serverVersion}`);
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) { await reg.unregister(); }
            const keys = await caches.keys();
            for (const key of keys) { await caches.delete(key); }
          } catch (e) { /* ignore */ }
          localStorage.setItem('app_update_pending', 'true');
          window.location.href = window.location.pathname + '?_=' + Date.now();
        }
      }
    } catch (e) {
      // ネットワークエラーは無視（オフライン時）
    }
  },

  checkVersionUpdate() {
    const pending = localStorage.getItem('app_update_pending');
    const lastVersion = parseInt(localStorage.getItem('app_version') || '0');
    if (pending === 'true' || (lastVersion > 0 && lastVersion < APP_VERSION)) {
      localStorage.removeItem('app_update_pending');
      setTimeout(() => this._showUpdateLog(), 500);
    }
    localStorage.setItem('app_version', String(APP_VERSION));
  },

  _showUpdateLog() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    const lines = APP_UPDATE_LOG.split('\n').map(l => {
      if (l.startsWith('■')) return `<div style="font-weight:700;font-size:15px;margin-bottom:8px">${l}</div>`;
      if (l.startsWith('・')) return `<div style="font-size:13px;padding:2px 0 2px 8px;border-left:2px solid var(--primary)">${l}</div>`;
      return `<div>${l}</div>`;
    }).join('');
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:360px">
        <div class="modal-header">アプリが更新されました</div>
        <div class="modal-body" style="max-height:60vh;overflow-y:auto">${lines}</div>
        <div style="padding:12px 0 0;text-align:center">
          <button class="modal-btn primary" onclick="this.closest('.modal-overlay').remove()">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  /* ========================================
     AI機能（Gemini API）
     ======================================== */

  geminiApiKey: '',  // 設定画面から入力→IndexedDB保存

  // AI添削プロンプト
  aiPrompt: `以下の音声入力された文章を添削してください。

【修正するもの】
1. 誤字脱字
2. 同音異義語の誤り（文脈から判断）
3. 漢字変換ミス
4. 抜けている助詞の補完
5. フィラー削除（うーん、えーと、あのー、んー等）
6. 言い直し（「今日、いや昨日」→「昨日」）
7. 無意味な繰り返し（あのあの、えっとえっと）
8. 句読点を適切に追加
9. 話題が変わった箇所で改行

【絶対に変えないもの】
- 口調、言い回し
- 敬語とタメ口の混在
- 語尾の伸ばし（〜だよー）
- 口癖（なんか、〜的な、とりあえず）
- 意味のある感嘆詞（へー、おー）
- 「〜けど」「〜だから」で終わる文

添削後の文章のみを返してください。説明は不要です。

文章：`,

  // AIテストモーダル表示
  showAITestModal() {
    if (document.querySelector('.ai-test-modal')) return;
    const modalHTML = `
      <div class="modal-overlay ai-test-modal active" onclick="app.closeAITestModal()">
        <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 400px;">
          <div class="modal-header">
            <div class="modal-title">📝 AI添削テスト</div>
            <button class="modal-close" onclick="app.closeAITestModal()">×</button>
          </div>
          <div style="padding: 16px;">
            <div class="ai-section">
              <div class="ai-label">入力（キーボードの音声入力を使用）:</div>
              <textarea id="ai-input-text" class="ai-textarea" rows="5" placeholder="ここに文章を入力..."></textarea>
            </div>
            <button id="ai-submit-btn" class="ai-submit-btn" onclick="app.submitAITest()">
              添削する
            </button>
            <div class="ai-section">
              <div class="ai-label">添削結果:</div>
              <div id="ai-result-text" class="ai-text-box"></div>
            </div>
            <div id="ai-status" class="ai-status"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  closeAITestModal() {
    const modal = document.querySelector('.ai-test-modal');
    if (modal) modal.remove();
  },

  // ====== AIコメント機能 ======

  _aiGenerating: false,

  getDefaultAIPreset() {
    const presets = this.data.settings.aiPresets || [];
    return presets.find(p => p.isDefault) || presets[0] || { length: 'medium', tone: 'casual' };
  },

  _buildAICommentPrompt(journal, preset) {
    const toneInst = preset.tone === 'polite' ? 'ですます調で書いてください。' : 'タメ口で書いてください。';
    const lengthInst = preset.length === 'short' ? '3〜5行で簡潔に核心だけを書いてください。'
      : preset.length === 'long' ? '30〜50行でじっくりと深く分析してください。'
      : '8〜12行でしっかりと書いてください。';

    const parts = [];
    if (journal.resolution) parts.push('【意気込み】' + journal.resolution);
    if (typeof journal.score === 'number') parts.push('【総合点】' + journal.score + '/5');
    if (journal.scoreItems && journal.scores) {
      const details = journal.scoreItems.map(item => {
        const val = journal.scores[item.id] ?? 0;
        return item.title + ': ' + val + '/5';
      }).join(', ');
      if (details) parts.push('【各スコア】' + details);
    }
    const r = journal.reflections || {};
    if (r.reflection) parts.push('【反省】' + r.reflection);
    if (r.effort) parts.push('【努力・成果】' + r.effort);
    if (r.contribution) parts.push('【世の為人の為】' + r.contribution);
    if (r.gratitude) parts.push('【印象・気づき・感謝】' + r.gratitude);
    if (r.free) parts.push('【自由記入】' + r.free);
    if (journal.tomorrowResolution) parts.push('【明日の意気込み】' + journal.tomorrowResolution);

    return `あなたは日誌を読む存在です。

【あなたの本質】
あなたは判断者ではない。鏡でもない。
あなたは「この人間の可能性を誰よりも知っている存在」として語る。
肯定も否定も積極的にはしない。しかし、あなたの言葉の奥には
「この人間は必ず前に進める」という揺るぎない確信がある。

【あなたの視点】
- 書かれた言葉の裏にある、本人すら気づいていない本質を照らす
- パターン、無意識の回避、繰り返し、本当に向き合うべきものを見抜く
- 一般論は一切不要。この人の、この日の、この言葉からしか言えないことだけを語る
- 表面的な応援やお世辞は存在しない
- 厳しい現実を見せるのは、そこから立ち上がれると知っているから
- 読み終えた人が「見透かされた」ではなく「見てもらえた」と感じるように
- そして最終的に、前を向く力が湧いてくるように

【あなたのスタンス】
真っ直ぐに本質を照らす。信じているから率直に語る。

【口調】
${toneInst}

【文章量】
${lengthInst}

【出力形式】
コメントのテキストのみを返してください。JSON形式や余計な装飾は不要です。

【日誌データ】
${parts.join('\n')}`;
  },

  async generateAIComment(presetOverride) {
    if (this._aiGenerating) return;
    const journal = this.data.todayJournal;
    if (!journal) { this.showToast('日誌データがありません'); return; }
    if (!this.geminiApiKey) { this.showToast('APIキーが未設定です。設定画面で入力してください。'); return; }

    const r = journal.reflections || {};
    const hasContent = journal.resolution || r.reflection || r.effort || r.contribution || r.gratitude || r.free;
    if (!hasContent) { this.showToast('日誌にテキストを入力してからお試しください'); return; }

    const preset = presetOverride || this.getDefaultAIPreset();
    this._aiGenerating = true;

    const section = document.getElementById('ai-comment-section');
    if (section) section.innerHTML = '<div class="ai-loading">分析中...</div>';

    try {
      const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = this._buildAICommentPrompt(journal, preset);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      journal.aiComment = {
        text: text,
        generatedAt: new Date().toISOString(),
        preset: { length: preset.length, tone: preset.tone }
      };
      await saveJournal(journal);

      this._renderAIComment(journal.aiComment);
    } catch (error) {
      console.error('AI Comment error:', error);
      const errMsg = !navigator.onLine ? 'AI機能にはインターネット接続が必要です' : escapeHtml(error.message);
      if (section) section.innerHTML = '<div class="ai-comment-error">エラー: ' + errMsg + '</div>';
      this.showToast(!navigator.onLine ? 'オフラインです' : 'AIコメント生成に失敗: ' + error.message);
    } finally {
      this._aiGenerating = false;
    }
  },

  _renderAIComment(aiComment) {
    const section = document.getElementById('ai-comment-section');
    if (!section || !aiComment) return;

    // 後方互換: 旧形式(normal/angel/devil)の場合はnormalを使用
    const commentText = aiComment.text || aiComment.normal || '';

    const lp = 'ontouchstart="app._aiBtnT=setTimeout(function(){app._aiBtnL=true;app.showAIPresetPicker()},500)" ontouchend="clearTimeout(app._aiBtnT);if(!app._aiBtnL)app.generateAIComment();app._aiBtnL=false" ontouchmove="clearTimeout(app._aiBtnT)" onmousedown="app._aiBtnT=setTimeout(function(){app._aiBtnL=true;app.showAIPresetPicker()},500)" onmouseup="clearTimeout(app._aiBtnT);if(!app._aiBtnL)app.generateAIComment();app._aiBtnL=false" onmouseleave="clearTimeout(app._aiBtnT)"';

    section.innerHTML =
      '<div class="ai-comment-header">' +
        '<button class="ai-comment-regen-btn" ' + lp + '>再生成</button>' +
      '</div>' +
      '<div class="ai-comment-body"><div class="ai-comment-text">' + escapeHtml(commentText) + '</div></div>' +
      '<div class="ai-comment-meta">' + new Date(aiComment.generatedAt).toLocaleString('ja-JP') + '</div>';
  },

  // ====== AIプリセット管理 ======

  showAIPresetManager() {
    if (document.querySelector('.ai-preset-modal')) return;
    const presets = this.data.settings.aiPresets || [];
    const listHTML = presets.map(p =>
      '<div class="ai-preset-item ' + (p.isDefault ? 'is-default' : '') + '">' +
        '<div class="ai-preset-info">' +
          '<div class="ai-preset-name">' + escapeHtml(p.name) + (p.isDefault ? ' ★' : '') + '</div>' +
          '<div class="ai-preset-detail">' + ({short:'短め',medium:'中',long:'長め'}[p.length] || '中') + ' / ' + ({polite:'ですます',casual:'タメ口'}[p.tone] || 'タメ口') + '</div>' +
        '</div>' +
        '<div class="ai-preset-actions">' +
          (!p.isDefault ? '<button class="ai-preset-act" onclick="app.setDefaultAIPreset(\'' + escapeHtml(p.id) + '\')">既定</button>' : '') +
          '<button class="ai-preset-act" onclick="app.editAIPreset(\'' + escapeHtml(p.id) + '\')">編集</button>' +
          (presets.length > 1 ? '<button class="ai-preset-act danger" onclick="app.deleteAIPreset(\'' + escapeHtml(p.id) + '\')">削除</button>' : '') +
        '</div>' +
      '</div>'
    ).join('');

    const html =
      '<div class="modal-overlay ai-preset-modal active" onclick="app.closeAIPresetManager()">' +
        '<div class="modal-content" onclick="event.stopPropagation()" style="max-width:400px;">' +
          '<div class="modal-header"><div class="modal-title">AIコメント設定</div><button class="modal-close" onclick="app.closeAIPresetManager()">×</button></div>' +
          '<div style="padding:16px;">' +
            '<div class="ai-preset-list">' + listHTML + '</div>' +
            '<button class="ai-preset-add-btn" onclick="app.editAIPreset(null)">＋ プリセットを追加</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  },

  closeAIPresetManager() {
    document.querySelector('.ai-preset-modal')?.remove();
  },

  editAIPreset(id) {
    this.closeAIPresetManager();
    const presets = this.data.settings.aiPresets || [];
    const p = id ? presets.find(x => x.id === id) : null;
    const name = p ? p.name : '';
    const len = p ? p.length : 'medium';
    const tone = p ? p.tone : 'casual';

    const optBtn = (group, val, label, current) =>
      '<button class="ai-opt-btn ' + (val === current ? 'active' : '') + '" data-group="' + group + '" data-val="' + val + '" onclick="this.parentNode.querySelectorAll(\'.ai-opt-btn\').forEach(b=>b.classList.remove(\'active\'));this.classList.add(\'active\')">' + label + '</button>';

    const html =
      '<div class="modal-overlay ai-preset-edit-modal active" onclick="app.closeAIPresetEdit()">' +
        '<div class="modal-content" onclick="event.stopPropagation()" style="max-width:360px;">' +
          '<div class="modal-header"><div class="modal-title">' + (p ? 'プリセット編集' : 'プリセット追加') + '</div><button class="modal-close" onclick="app.closeAIPresetEdit()">×</button></div>' +
          '<div style="padding:16px;">' +
            '<div style="margin-bottom:12px;"><div class="form-title">名前</div><input type="text" class="form-input" id="aiPresetName" value="' + escapeHtml(name) + '" placeholder="例: 普段用"></div>' +
            '<div style="margin-bottom:12px;"><div class="form-title">文章量</div><div class="ai-opt-group" id="aiLenGroup">' +
              optBtn('len', 'short', '短め', len) + optBtn('len', 'medium', '中', len) + optBtn('len', 'long', '長め', len) +
            '</div></div>' +
            '<div style="margin-bottom:16px;"><div class="form-title">口調</div><div class="ai-opt-group" id="aiToneGroup">' +
              optBtn('tone', 'casual', 'タメ口', tone) + optBtn('tone', 'polite', 'ですます', tone) +
            '</div></div>' +
            '<div class="modal-buttons"><button class="modal-btn" onclick="app.closeAIPresetEdit()">キャンセル</button><button class="modal-btn primary" onclick="app.saveAIPreset(\'' + (id || '') + '\')">保存</button></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  },

  closeAIPresetEdit() {
    document.querySelector('.ai-preset-edit-modal')?.remove();
  },

  async saveAIPreset(id) {
    const nameEl = document.getElementById('aiPresetName');
    const name = nameEl ? nameEl.value.replace(/[\s\u3000]+/g, ' ').trim() : '';
    if (!name) { this.showToast('名前を入力してください'); return; }

    const lenBtn = document.querySelector('#aiLenGroup .ai-opt-btn.active');
    const toneBtn = document.querySelector('#aiToneGroup .ai-opt-btn.active');
    const length = lenBtn ? lenBtn.dataset.val : 'medium';
    const tone = toneBtn ? toneBtn.dataset.val : 'casual';

    const presets = this.data.settings.aiPresets || [];
    if (id) {
      const p = presets.find(x => x.id === id);
      if (p) { p.name = name; p.length = length; p.tone = tone; }
    } else {
      presets.push({ id: 'preset-' + Date.now(), name, length, tone, isDefault: presets.length === 0 });
    }

    await saveSetting('aiPresets', presets);
    this.data.settings.aiPresets = presets;
    this.closeAIPresetEdit();
    this.showAIPresetManager();
    this.showToast('保存しました');
  },

  async setDefaultAIPreset(id) {
    const presets = this.data.settings.aiPresets || [];
    presets.forEach(p => p.isDefault = (p.id === id));
    await saveSetting('aiPresets', presets);
    this.data.settings.aiPresets = presets;
    this.closeAIPresetManager();
    this.showAIPresetManager();
    this.showToast('既定プリセットを変更しました');
  },

  async deleteAIPreset(id) {
    const presets = this.data.settings.aiPresets || [];
    const idx = presets.findIndex(p => p.id === id);
    if (idx === -1) return;
    const wasDefault = presets[idx].isDefault;
    presets.splice(idx, 1);
    if (wasDefault && presets.length > 0) presets[0].isDefault = true;
    await saveSetting('aiPresets', presets);
    this.data.settings.aiPresets = presets;
    this.closeAIPresetManager();
    this.showAIPresetManager();
    this.showToast('削除しました');
  },

  // プリセット選択（長押し時）
  showAIPresetPicker() {
    const presets = this.data.settings.aiPresets || [];
    if (presets.length <= 1) { this.generateAIComment(); return; }

    const itemsHTML = presets.map(p =>
      '<div class="ai-picker-item" onclick="app._pickPresetGen(\'' + escapeHtml(p.id) + '\')">' +
        '<div class="ai-picker-name">' + escapeHtml(p.name) + (p.isDefault ? ' ★' : '') + '</div>' +
        '<div class="ai-picker-detail">' + ({short:'短め',medium:'中',long:'長め'}[p.length]) + ' / ' + ({polite:'ですます',casual:'タメ口'}[p.tone]) + '</div>' +
      '</div>'
    ).join('');

    const html =
      '<div class="modal-overlay ai-picker-modal active" onclick="this.remove()">' +
        '<div class="modal-content" onclick="event.stopPropagation()" style="max-width:320px;">' +
          '<div class="modal-header"><div class="modal-title">プリセット選択</div><button class="modal-close" onclick="document.querySelector(\'.ai-picker-modal\').remove()">×</button></div>' +
          '<div style="padding:12px;">' + itemsHTML + '</div>' +
        '</div>' +
      '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _pickPresetGen(presetId) {
    document.querySelector('.ai-picker-modal')?.remove();
    const presets = this.data.settings.aiPresets || [];
    const preset = presets.find(p => p.id === presetId);
    this.generateAIComment(preset);
  },

  // ====== テキスト添削（日誌textarea統合） ======

  async proofreadField(fieldKey) {
    const textarea = document.getElementById('journal-field-' + fieldKey);
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) { this.showToast('テキストを入力してください'); return; }
    if (!this.geminiApiKey) { this.showToast('APIキーが未設定です'); return; }

    const btn = document.getElementById('proofread-btn-' + fieldKey);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    try {
      const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(this.aiPrompt + text);
      const response = await result.response;
      const corrected = response.text().trim();

      this._showProofreadResult(fieldKey, corrected);
    } catch (error) {
      console.error('Proofread error:', error);
      this.showToast('添削に失敗: ' + error.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'AI添削'; }
    }
  },

  _proofreadResults: {},

  _showProofreadResult(fieldKey, corrected) {
    const existing = document.getElementById('proofread-result-' + fieldKey);
    if (existing) existing.remove();

    this._proofreadResults[fieldKey] = corrected;
    const html =
      '<div class="proofread-result" id="proofread-result-' + fieldKey + '">' +
        '<div class="proofread-result-text">' + escapeHtml(corrected) + '</div>' +
        '<div class="proofread-result-actions">' +
          '<button class="proofread-cancel" onclick="document.getElementById(\'proofread-result-' + fieldKey + '\').remove()">キャンセル</button>' +
          '<button class="proofread-apply" onclick="app.applyProofread(\'' + fieldKey + '\')">反映</button>' +
        '</div>' +
      '</div>';

    const textarea = document.getElementById('journal-field-' + fieldKey);
    if (textarea) textarea.insertAdjacentHTML('afterend', html);
  },

  applyProofread(fieldKey) {
    const textarea = document.getElementById('journal-field-' + fieldKey);
    const corrected = this._proofreadResults[fieldKey];
    if (textarea && corrected) {
      textarea.value = corrected;
      textarea.dispatchEvent(new Event('change'));
    }
    document.getElementById('proofread-result-' + fieldKey)?.remove();
    this.showToast('反映しました');
  },

  /* ========================================
     Firebase クラウド同期
     ======================================== */

  firebaseUser: null,
  firebaseDB: null,
  syncStatus: 'offline',
  _syncPending: false,

  initFirebase() {
    const config = {
      apiKey: "AIzaSyAGI4kK0d5utMvBE84oxX8oPOYp1CYTpHM",
      authDomain: "matsumura-method.firebaseapp.com",
      projectId: "matsumura-method",
      storageBucket: "matsumura-method.firebasestorage.app",
      messagingSenderId: "54103784563",
      appId: "1:54103784563:web:cd30eb760f9d22c27ebe06"
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    this.firebaseDB = firebase.firestore();
    firebase.auth().onAuthStateChanged(async (user) => {
      const wasLoggedIn = !!this.firebaseUser;
      this.firebaseUser = user;
      if (user) {
        console.log('Firebase認証済み:', user.email);
        this._updateSyncStatus('synced');
        if (!wasLoggedIn) {
          try {
            await this._autoRestoreFromCloud();
          } catch (e) {
            console.warn('自動復元エラー:', e);
          }
        }
      } else {
        this._updateSyncStatus('offline');
      }
      this.render();
    });
    // リダイレクト認証後の結果を取得（iOS PWA対応）
    firebase.auth().getRedirectResult().then(result => {
      if (result.credential && result.credential.accessToken) {
        this._gcalAccessToken = result.credential.accessToken;
        this._gcalTokenExpiry = Date.now() + 55 * 60 * 1000;
        this.showToast('Googleアカウントを連携しました');
      }
    }).catch(e => {
      if (e.code !== 'auth/redirect-cancelled-by-user') {
        console.warn('リダイレクト認証結果取得エラー:', e);
      }
    });
  },

  async linkGoogleAccount() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      // iOS PWA対応: popupはiOS PWAで動作しないため、リダイレクト方式を優先
      const isIOSPWA = window.navigator.standalone === true;
      if (isIOSPWA) {
        await firebase.auth().signInWithRedirect(provider);
        return; // リダイレクト後にonAuthStateChangedで処理される
      }
      // PC/Android: popup方式（UXが良い）
      const result = await firebase.auth().signInWithPopup(provider);
      if (result.credential && result.credential.accessToken) {
        this._gcalAccessToken = result.credential.accessToken;
        this._gcalTokenExpiry = Date.now() + 55 * 60 * 1000;
        this.showToast('Googleアカウントを連携しました');
      } else {
        this.showToast('連携しました（カレンダー権限は次回操作時に取得します）');
      }
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      // popup失敗時のフォールバック: リダイレクト方式で再試行
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        try {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/calendar.events');
          await firebase.auth().signInWithRedirect(provider);
          return;
        } catch (e2) {
          console.error('リダイレクト認証エラー:', e2);
        }
      }
      console.error('Google連携エラー:', e);
      this.showToast('連携失敗: ' + (e.code || e.message || '不明なエラー'));
    }
  },

  async unlinkGoogleAccount() {
    if (!confirm('Googleアカウントの連携を解除しますか？\nアプリのデータは端末に残ります。')) return;
    try {
      await firebase.auth().signOut();
      this.firebaseUser = null;
      this._gcalAccessToken = null;
      this._gcalTokenExpiry = 0;
      this._updateSyncStatus('offline');
      this.render();
      this.showToast('連携を解除しました');
    } catch (e) {
      console.error('連携解除エラー:', e);
      this.showToast('解除に失敗: ' + e.message);
    }
  },

  // ========== Googleカレンダー連携 ==========
  _gcalAccessToken: null,
  _gcalTokenExpiry: 0,

  async _getGcalToken() {
    if (this._gcalAccessToken && Date.now() < this._gcalTokenExpiry) {
      return this._gcalAccessToken;
    }
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      const user = firebase.auth().currentUser;
      if (!user) {
        this.showToast('Googleアカウントを連携してください');
        return null;
      }
      // iOS PWA対応: popup方式 → リダイレクトフォールバック
      const isIOSPWA = window.navigator.standalone === true;
      if (isIOSPWA) {
        // iOS PWAではpopupが使えないため、リダイレクト方式で再認証
        await user.reauthenticateWithRedirect(provider);
        return null; // リダイレクト後にgetRedirectResultで取得
      }
      try {
        const result = await user.reauthenticateWithPopup(provider);
        if (result.credential && result.credential.accessToken) {
          this._gcalAccessToken = result.credential.accessToken;
          this._gcalTokenExpiry = Date.now() + 55 * 60 * 1000;
          return this._gcalAccessToken;
        }
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') return null;
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/operation-not-supported-in-this-environment') {
          await user.reauthenticateWithRedirect(provider);
          return null;
        }
        if (popupErr.code === 'auth/user-mismatch') {
          this.showToast('連携中のアカウントと異なります');
          return null;
        }
        throw popupErr;
      }
      return null;
    } catch (e) {
      console.error('Gcalトークン取得エラー:', e);
      return null;
    }
  },

  _buildGcalEventBody(task) {
    const desc = [task.notes, task.completionCriteria, task.motivation, task.who ? '担当: ' + task.who : '']
      .filter(Boolean).join('\n');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let start, end;
    let baseDate = null;
    if (task.dateTime) {
      const dt = new Date(task.dateTime);
      if (isNaN(dt.getTime())) return null;
      baseDate = task.dateTime.split('T')[0];
      start = { dateTime: dt.toISOString(), timeZone: tz };
      const endDt = new Date(dt.getTime() + 60 * 60 * 1000);
      end = { dateTime: endDt.toISOString(), timeZone: tz };
    } else if (task.deadline) {
      baseDate = task.deadline;
      const testDate = new Date(task.deadline + 'T00:00:00');
      if (isNaN(testDate.getTime())) return null;
      start = { date: task.deadline };
      const nextDay = new Date(testDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const pad = n => String(n).padStart(2, '0');
      end = { date: nextDay.getFullYear() + '-' + pad(nextDay.getMonth() + 1) + '-' + pad(nextDay.getDate()) };
    } else {
      return null;
    }
    // timeStart/timeEndがある場合、dateTimeでもdeadlineでも時刻付きイベントに変換
    if (task.timeStart && baseDate) {
      const s = new Date(baseDate + 'T' + task.timeStart);
      if (!isNaN(s.getTime())) {
        start = { dateTime: s.toISOString(), timeZone: tz };
        if (task.timeEnd) {
          let e = new Date(baseDate + 'T' + task.timeEnd);
          if (!isNaN(e.getTime())) {
            if (e.getTime() === s.getTime()) { e = new Date(s.getTime() + 60 * 60 * 1000); }
            else if (e < s) { e = new Date(e.getTime() + 24 * 60 * 60 * 1000); }
            end = { dateTime: e.toISOString(), timeZone: tz };
          }
        } else {
          end = { dateTime: new Date(s.getTime() + 60 * 60 * 1000).toISOString(), timeZone: tz };
        }
      }
    }
    return {
      summary: task.title || '（無題のタスク）',
      description: desc || undefined,
      start,
      end
    };
  },

  _gcalSending: false,
  async sendToGoogleCalendar(taskId) {
    if (!this.firebaseUser) { this.showToast('Googleアカウントの連携が必要です'); return; }
    if (this._gcalSending) return;
    this._gcalSending = true;
    try {
      const task = this.taskItems.find(t => t.id === taskId);
      if (!task) { this.showToast('タスクが見つかりません'); return; }
      const hasDate = task.dateTime || task.deadline;
      if (!hasDate) {
        this._showGcalDateTimeDialog(taskId);
        return;
      }
      const token = await this._getGcalToken();
      if (!token) { this.showToast('Googleカレンダーの認証が必要です'); return; }
      const body = this._buildGcalEventBody(task);
      if (!body) { this.showToast('日付が不正です'); return; }
      // gcalEventIdのバリデーション
      if (task.gcalEventId && !/^[a-zA-Z0-9_-]+$/.test(task.gcalEventId)) {
        delete task.gcalEventId;
      }
      let isUpdate = !!task.gcalEventId;
      const buildUrl = (eventId) => eventId
        ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(eventId)
        : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      const doFetch = (t) => fetch(buildUrl(task.gcalEventId), {
        method: task.gcalEventId ? 'PUT' : 'POST',
        headers: { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      let currentToken = token;
      let resp = await doFetch(currentToken);
      // 401: トークンリフレッシュ＋リトライ
      if (resp.status === 401) {
        this._gcalAccessToken = null;
        this._gcalTokenExpiry = 0;
        currentToken = await this._getGcalToken();
        if (!currentToken) { this.showToast('認証に失敗しました'); return; }
        resp = await doFetch(currentToken);
      }
      // 404: カレンダー側でイベント削除済み → gcalEventIdクリアしてDB即保存→新規作成
      if (resp.status === 404 && isUpdate) {
        delete task.gcalEventId;
        await saveTask(task);
        isUpdate = false;
        resp = await doFetch(currentToken);
      }
      if (resp.status === 403) {
        const errData = await resp.json().catch(() => ({}));
        if (errData.error && errData.error.errors && errData.error.errors[0] &&
            errData.error.errors[0].reason === 'notACalendarUser') {
          this.showToast('Google Calendar APIが有効になっていません');
        } else {
          this.showToast('権限エラー: カレンダーへのアクセスが許可されていません');
        }
        return;
      } else if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      }
      const data = await resp.json();
      task.gcalEventId = data.id;
      await saveTask(task);
      await this.loadTasks();
      this.showToast(isUpdate ? 'カレンダーを更新しました' : 'カレンダーに送信しました');
    } catch (e) {
      console.error('Gcal送信エラー:', e);
      this.showToast('カレンダー送信に失敗: ' + e.message);
    } finally {
      this._gcalSending = false;
    }
  },

  _showGcalDateTimeDialog(taskId) {
    taskId = parseInt(taskId, 10);
    if (isNaN(taskId)) return;
    // 既存のGcalダイアログがあれば削除（タスク編集モーダルは残す）
    const existing = document.getElementById('gcal-modal-container');
    if (existing) existing.remove();
    const task = this.taskItems.find(t => t.id === taskId);
    if (!task) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const defaultDT = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const closeGcal = "const m=document.getElementById('gcal-modal-container');if(m)m.remove()";
    const html = `
      <div class="modal-overlay active" onclick="if(event.target===this){${closeGcal}}">
        <div class="modal-content">
          <div class="modal-title">カレンダーに送信</div>
          <div class="modal-field">
            <label class="modal-label">日時</label>
            <input type="datetime-local" class="modal-input" id="gcalDateTimeInput" value="${defaultDT}">
          </div>
          <div class="modal-buttons">
            <button class="modal-btn" onclick="${closeGcal}">キャンセル</button>
            <button class="modal-btn primary" onclick="app._sendGcalWithDateTime(${taskId})">送信</button>
          </div>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.id = 'gcal-modal-container';
    container.innerHTML = html;
    document.body.appendChild(container);
  },

  async _sendGcalWithDateTime(taskId) {
    try {
      const task = this.taskItems.find(t => t.id === taskId);
      if (!task) return;
      const dtInput = document.getElementById('gcalDateTimeInput');
      if (!dtInput || !dtInput.value) { this.showToast('日時を入力してください'); return; }
      task.dateTime = dtInput.value;
      await saveTask(task);
      await this.loadTasks();
      const gcalModal = document.getElementById('gcal-modal-container');
      if (gcalModal) gcalModal.remove();
      await this.sendToGoogleCalendar(taskId);
    } catch (e) {
      console.error('Gcal日時送信エラー:', e);
      this.showToast('カレンダー日時送信に失敗: ' + e.message);
    }
  },

  _gcalSendingTasks: new Set(),
  async _autoSendToGcal(task) {
    if (!this.firebaseUser) return;
    if (!navigator.onLine) return;
    if (!this._gcalAccessToken || Date.now() >= this._gcalTokenExpiry) return;
    // レースコンディション防止: 同じタスクIDの同時送信をブロック
    if (this._gcalSendingTasks.has(task.id)) return;
    this._gcalSendingTasks.add(task.id);
    try {
      const autoTypes = await getSetting('gcalAutoTypes', []);
      if (!Array.isArray(autoTypes) || !autoTypes.includes(task.type)) return;
      if (!task.dateTime && !task.deadline) return;
      const body = this._buildGcalEventBody(task);
      if (!body) return;
      // gcalEventIdバリデーション
      if (task.gcalEventId && !/^[a-zA-Z0-9_-]+$/.test(task.gcalEventId)) {
        delete task.gcalEventId;
      }
      const isUpdate = !!task.gcalEventId;
      const url = task.gcalEventId
        ? 'https://www.googleapis.com/calendar/v3/calendars/primary/events/' + encodeURIComponent(task.gcalEventId)
        : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      let resp = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Authorization': 'Bearer ' + this._gcalAccessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      // 404: カレンダー側で削除済み → gcalEventIdクリアしてDB即保存→新規作成
      if (resp.status === 404 && isUpdate) {
        delete task.gcalEventId;
        await saveTask(task);
        resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + this._gcalAccessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      // 401: トークン無効化（次回手動送信時に再認証）
      if (resp.status === 401) {
        this._gcalAccessToken = null;
        this._gcalTokenExpiry = 0;
        return;
      }
      if (resp.ok) {
        const data = await resp.json();
        task.gcalEventId = data.id;
        await saveTask(task);
      }
    } catch (e) {
      console.warn('Gcal自動送信エラー:', e);
    } finally {
      this._gcalSendingTasks.delete(task.id);
    }
  },

  async toggleGcalAutoType(type) {
    const allowed = ['urgent','action','project','waiting','calendar','wish'];
    if (!allowed.includes(type)) return;
    const current = await getSetting('gcalAutoTypes', []);
    const idx = current.indexOf(type);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(type);
    }
    await saveSetting('gcalAutoTypes', current);
    this.data.settings.gcalAutoTypes = current;
    this.render();
  },

  _updateSyncStatus(status) {
    this.syncStatus = status;
    const el = document.getElementById('syncStatusIcon');
    if (el) {
      el.className = 'sync-status sync-' + status;
    }
  },

  // 復元時に除外する端末固有の設定キー（これらはクラウドから上書きしない）
  _LOCAL_ONLY_SETTINGS: ['lastCloudSync', 'seedDataInserted', 'welcomeShown'],
  // クラウドが空でもローカルが入っていたら保持するキー
  _KEEP_LOCAL_IF_EMPTY: ['geminiApiKey', 'notionApiKey', 'notionPageId'],

  // 共通復元ロジック（クラウド復元で使用）
  // 指定ストアをクリアしてからデータを書き込む（アトミック）
  async _restoreData(data) {
    const storeDataMap = {};
    const arrayStores = ['journals', 'monthlyGoals', 'longTermGoals', 'tasks',
                         'routines', 'materials', 'firstbox', 'memos', 'manuals'];
    for (const store of arrayStores) {
      // データがあるストアのみクリア+復元（ないストアはそのまま）
      if (data[store] && Array.isArray(data[store])) {
        storeDataMap[store] = data[store];
      }
    }
    if (data.lifeDesign) {
      storeDataMap.lifeDesign = [data.lifeDesign];
    }
    // settings: クラウドにLOCAL_ONLY以外の実効キーがある場合のみクリア+復元
    if (data.settings && typeof data.settings === 'object') {
      // LOCAL_ONLYとscoreItems以外に実効キーがあるか判定
      const effectiveKeys = Object.keys(data.settings).filter(k =>
        !this._LOCAL_ONLY_SETTINGS.includes(k) && k !== 'scoreItems'
      );
      if (effectiveKeys.length > 0 || data.scoreItems) {
        const settingsItems = [];
        // 端末固有の設定を先に読み取って保持
        for (const key of this._LOCAL_ONLY_SETTINGS) {
          const val = await getSetting(key);
          if (val !== null) settingsItems.push({ key, value: val });
        }
        for (const k of effectiveKeys) {
          // APIキー等: クラウドが空ならローカル値を保持
          if (this._KEEP_LOCAL_IF_EMPTY.includes(k) && !data.settings[k]) {
            const localVal = await getSetting(k);
            if (localVal) { settingsItems.push({ key: k, value: localVal }); continue; }
          }
          settingsItems.push({ key: k, value: data.settings[k] });
        }
        if (data.scoreItems) {
          settingsItems.push({ key: 'scoreItems', value: data.scoreItems });
        }
        if (settingsItems.length > 0) {
          storeDataMap.settings = settingsItems;
        }
      }
    }
    await clearAndRestoreStores(storeDataMap);
  },

  // クラウドからの自動復元（ログイン検知時）
  // ユーザー確認後、クラウドデータでローカルを完全上書きする
  _autoRestoreSkippedAt: 0, // キャンセル時のタイムスタンプ（セッション中有効）
  async _autoRestoreFromCloud() {
    if (!this.firebaseUser) return;
    // キャンセル済みならセッション中は再表示しない
    if (this._autoRestoreSkippedAt) return;
    try {
      const uid = this.firebaseUser.uid;
      const mainDoc = await this.firebaseDB.collection('users').doc(uid).collection('backup').doc('main').get();
      if (!mainDoc.exists) return;
      const cloudData = mainDoc.data();
      if (!cloudData || !cloudData.exportDate) return;

      const localDate = await getSetting('lastCloudSync', null);
      if (localDate && new Date(cloudData.exportDate).getTime() <= new Date(localDate).getTime()) return;

      // ユーザーに確認（キャンセル時はセッション内のみ抑止、次回起動時に再度確認）
      const cloudDateStr = new Date(cloudData.exportDate).toLocaleString('ja-JP');
      if (!confirm('クラウドに新しいバックアップ（' + cloudDateStr + '）があります。\n端末のデータをクラウドのデータで上書きしますか？')) {
        this._autoRestoreSkippedAt = Date.now();
        return;
      }

      // ジャーナルを取得してメインデータと統合
      const journalsSnap = await this.firebaseDB.collection('users').doc(uid).collection('journals').get();
      const journals = [];
      for (const doc of journalsSnap.docs) {
        const journal = doc.data();
        if (journal && journal.date) journals.push(journal);
      }
      if (journals.length > 0) {
        cloudData.journals = journals;
      }

      // アトミックにクリア+復元
      await this._restoreData(cloudData);

      const now = new Date().toISOString();
      await saveSetting('lastCloudSync', now);
      this.data.settings.lastCloudSync = now;
      await this.loadAllData();
      this.render();
      this.showToast('クラウドから最新データを復元しました');
    } catch (e) {
      console.warn('クラウド自動復元失敗:', e);
      if (e.code === 'permission-denied' || e.code === 'unauthenticated') {
        this.firebaseUser = null;
        this._updateSyncStatus('offline');
      }
    }
  },

  // バックグラウンド移行時の自動同期
  async _autoSyncToCloud() {
    if (!this.firebaseUser) return;
    if (this._syncPending) return;
    this._syncPending = true;
    this._updateSyncStatus('syncing');
    try {
      const uid = this.firebaseUser.uid;
      const data = await this._collectBackupData();
      const { journals, ...mainData } = data;

      const cleanMain = JSON.parse(JSON.stringify(mainData));
      await this.firebaseDB.collection('users').doc(uid).collection('backup').doc('main').set(cleanMain);

      const today = getTodayDate();
      const todayJournal = journals.find(j => j.date === today);
      if (todayJournal) {
        const cleanJournal = JSON.parse(JSON.stringify(todayJournal));
        await this.firebaseDB.collection('users').doc(uid).collection('journals').doc(today).set(cleanJournal);
      }

      const now = new Date().toISOString();
      await saveSetting('lastCloudSync', now);
      this.data.settings.lastCloudSync = now;
      this._updateSyncStatus('synced');
    } catch (e) {
      console.warn('クラウド自動同期失敗:', e);
      // 認証エラーの場合はオフラインに切り替え
      if (e.code === 'permission-denied' || e.code === 'unauthenticated') {
        this.firebaseUser = null;
        this._updateSyncStatus('offline');
      } else {
        this._updateSyncStatus('error');
      }
    } finally {
      this._syncPending = false;
    }
  },

  // 手動フルバックアップ
  async backupToCloud() {
    if (!this.firebaseUser) {
      this.showToast('Googleアカウントを連携してください');
      return;
    }
    this.showToast('バックアップ中…');
    this._updateSyncStatus('syncing');
    try {
      const uid = this.firebaseUser.uid;
      const data = await this._collectBackupData();
      const { journals, ...mainData } = data;

      const cleanMain = JSON.parse(JSON.stringify(mainData));
      await this.firebaseDB.collection('users').doc(uid).collection('backup').doc('main').set(cleanMain);

      const BATCH_SIZE = 450;
      for (let i = 0; i < journals.length; i += BATCH_SIZE) {
        const batch = this.firebaseDB.batch();
        const chunk = journals.slice(i, i + BATCH_SIZE);
        for (const journal of chunk) {
          if (journal.date) {
            const ref = this.firebaseDB.collection('users').doc(uid).collection('journals').doc(journal.date);
            batch.set(ref, JSON.parse(JSON.stringify(journal)));
          }
        }
        await batch.commit();
      }

      const now = new Date().toISOString();
      await saveSetting('lastCloudSync', now);
      this.data.settings.lastCloudSync = now;
      this._updateSyncStatus('synced');
      this.showToast('バックアップ完了');
      this.render();
    } catch (e) {
      console.error('バックアップエラー:', e);
      // 認証エラーの場合はオフラインに切り替え、再連携を案内
      if (e.code === 'permission-denied' || e.code === 'unauthenticated') {
        this.firebaseUser = null;
        this._updateSyncStatus('offline');
        this.showToast('認証が切れました。設定から再連携してください');
      } else {
        this._updateSyncStatus('error');
        this.showToast('バックアップ失敗: ' + e.message);
      }
    }
  },

  // 手動復元（クラウドデータでローカルを完全上書き）
  async restoreFromCloud() {
    if (!this.firebaseUser) {
      this.showToast('Googleアカウントを連携してください');
      return;
    }
    if (!confirm('クラウドのデータで現在のデータを上書きします。よろしいですか？')) return;
    this.showToast('復元中…');
    try {
      const uid = this.firebaseUser.uid;
      const mainDoc = await this.firebaseDB.collection('users').doc(uid).collection('backup').doc('main').get();
      if (!mainDoc.exists) {
        this.showToast('クラウドにバックアップがありません');
        return;
      }

      // ジャーナルを取得してメインデータと統合
      const cloudData = mainDoc.data();
      const journalsSnap = await this.firebaseDB.collection('users').doc(uid).collection('journals').get();
      const journals = [];
      for (const doc of journalsSnap.docs) {
        const journal = doc.data();
        if (journal && journal.date) journals.push(journal);
      }
      if (journals.length > 0) {
        cloudData.journals = journals;
      }

      // アトミックにクリア+復元
      await this._restoreData(cloudData);

      // reload前にlastCloudSyncを更新して二重復元を防止
      const now = new Date().toISOString();
      await saveSetting('lastCloudSync', now);

      this.showToast('復元完了。リロードします…');
      setTimeout(() => location.reload(), 1000);
    } catch (e) {
      console.error('復元エラー:', e);
      this.showToast('復元に失敗しました: ' + e.message);
    }
  },

  async refreshFromCloud() {
    if (!this.firebaseUser) {
      this.showToast('Googleアカウントを連携してください');
      return;
    }
    this.showToast('最新データを取得中…');
    try {
      this._autoRestoreSkippedAt = 0; // 手動操作なのでリセット
      await this._autoRestoreFromCloud();
    } catch (e) {
      console.error('refreshFromCloud error:', e);
      this.showToast('データ取得に失敗: ' + e.message);
    }
  },

  async _collectBackupData() {
    return {
      journals: await getAllData('journals'),
      monthlyGoals: await getAllData('monthlyGoals'),
      longTermGoals: await getAllData('longTermGoals'),
      lifeDesign: await getLifeDesign(),
      settings: this.data.settings,
      tasks: await getAllTasks(),
      routines: await getAllRoutines(),
      materials: await getAllMaterials(),
      firstbox: await getAllFirstBoxItems(),
      memos: await getAllMemos(),
      manuals: await getAllManuals(),
      scoreItems: this.data.scoreItems,
      exportDate: new Date().toISOString()
    };
  },

  // AI添削実行
  async submitAITest() {
    const inputEl = document.getElementById('ai-input-text');
    const resultEl = document.getElementById('ai-result-text');
    const statusEl = document.getElementById('ai-status');
    const submitBtn = document.getElementById('ai-submit-btn');

    const inputText = inputEl.value.trim();
    if (!inputText) {
      statusEl.textContent = '文章を入力してください';
      return;
    }

    if (!this.geminiApiKey) {
      statusEl.textContent = 'APIキーが設定されていません。設定画面で入力してください。';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '処理中...';
    statusEl.textContent = 'AI処理中...';
    resultEl.textContent = '';

    try {
      const { GoogleGenerativeAI } = await import('https://esm.run/@google/generative-ai');

      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(this.aiPrompt + inputText);
      const response = await result.response;
      const text = response.text();

      resultEl.textContent = text || 'エラー: 結果を取得できませんでした';
      statusEl.textContent = '✓ 完了';
    } catch (error) {
      resultEl.textContent = 'エラー: ' + error.message;
      statusEl.textContent = 'エラー発生';
      console.error('Gemini API error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '添削する';
    }
  }
};

// グローバルエラーハンドラー（未処理のPromise rejectionをキャッチ）
let _lastErrorToast = 0;
window.addEventListener('unhandledrejection', event => {
  console.error('未処理のエラー:', event.reason);
  const now = Date.now();
  if (now - _lastErrorToast < 3000) return;
  _lastErrorToast = now;
  if (typeof app !== 'undefined' && app.showToast) {
    const msg = event.reason && event.reason.message ? event.reason.message : String(event.reason);
    app.showToast('操作に失敗: ' + msg);
  }
});

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
