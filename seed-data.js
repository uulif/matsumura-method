// 3ヶ月分のサンプルデータ投入スクリプト
// 田中健太（28歳・IT企業Webエンジニア）のデモデータ
// 日付は現在時点に自動調整される（基準月: 2026年3月）

// 日付調整ヘルパー
const _seedNow = new Date();
const _seedMonthOffset = (_seedNow.getFullYear() - 2026) * 12 + _seedNow.getMonth() - 2;

function seedDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1 + _seedMonthOffset, d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function seedMonth(yearMonthStr) {
  const [y, m] = yearMonthStr.split('-').map(Number);
  const total = y * 12 + (m - 1) + _seedMonthOffset;
  const newY = Math.floor(total / 12);
  const newM = (total % 12) + 1;
  return `${newY}-${String(newM).padStart(2, '0')}`;
}

function seedYM(year, month) {
  const total = year * 12 + (month - 1) + _seedMonthOffset;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

async function seedAllData() {
  console.log('=== シードデータ投入開始 ===');

  // ========== 設定 ==========
  await saveSetting('name', '田中健太');
  await saveSetting('birthday', '1997-08-15');
  await saveSetting('scoreItems', [
    { id: 'fullLife', title: '明日死んでも後悔のない1日だったか' },
    { id: 'spiritualFirst', title: '霊主な考え・行動・生き方をしていたか' },
    { id: 'growthAction', title: '成長につながる行動をしたか' }
  ]);
  console.log('設定 完了');

  // ========== F・BOX ==========
  const fboxItems = [
    '新しいモニター買う？ 4Kか曲面か調べる',
    '確定申告の副業分、経費の領収書まとめる',
    '田村さんに誕生日プレゼント（3/18）何がいいか',
    '料理教室の体験申し込み 土曜のやつ',
    '英語の勉強法変えたい。シャドーイングに切り替え？',
    '実家に帰省する日程 GWか？',
    '会社のSlack botアイデア思いついた。タスク管理連携',
    '腰痛対策のストレッチ動画見つけた→ブックマークした'
  ];
  for (const text of fboxItems) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 7));
    await saveData('firstbox', {
      text,
      createdAt: d.toISOString()
    });
  }
  console.log('F・BOX 完了');

  // ========== タスク ==========
  const tasks = [
    // すぐやる
    { type: 'urgent', title: 'カード明細を確認する', status: 'open', scope: 'personal' },
    { type: 'urgent', title: '○○さんにLINE返信（飲み会の件）', status: 'open', scope: 'personal' },
    { type: 'urgent', title: '薬局でコンタクト受け取り', status: 'open', scope: 'personal' },
    { type: 'urgent', title: 'チームSlackで進捗報告', status: 'done', scope: 'social' },
    // アクション
    { type: 'action', title: 'Vue.js 3の公式チュートリアル進める', status: 'in_progress', scope: 'social',
      motivation: 'スキルアップして転職の選択肢を広げる。今の年収+100万も夢じゃない', timeStart: '21:00', timeEnd: '22:00' },
    { type: 'action', title: 'ジム入会手続き（エニタイム駅前店）', status: 'open', scope: 'personal',
      motivation: '健康診断でメタボ予備軍と言われた。このままだと30歳でヤバい' },
    { type: 'action', title: 'スーツをクリーニングに出す', status: 'open', scope: 'personal' },
    { type: 'action', title: '「影響力の武器」読み終わる', status: 'in_progress', scope: 'personal',
      motivation: '営業チームとの会話で知識を活かせる。読書習慣の維持にもなる' },
    { type: 'action', title: '部屋の本棚を整理する', status: 'open', scope: 'personal' },
    { type: 'action', title: 'iPhoneのバックアップを取る', status: 'open', scope: 'personal' },
    { type: 'action', title: '歯医者の定期検診予約する', status: 'open', scope: 'personal' },
    { type: 'action', title: 'プレゼン資料のテンプレート作成', status: 'open', scope: 'social',
      motivation: '毎回ゼロから作る時間がもったいない。テンプレ化で1時間は短縮できる' },
    { type: 'action', title: '友人Aとの飲み会の店を探す（新宿周辺）', status: 'open', scope: 'personal' },
    { type: 'action', title: '実家に送る写真をアルバムにまとめる', status: 'open', scope: 'personal' },
    { type: 'action', title: 'AWS認定の参考書を買う', status: 'done', scope: 'social' },
    // プロジェクト
    { type: 'project', title: 'ポートフォリオサイトリニューアル', status: 'in_progress', scope: 'social',
      completionCriteria: 'Vercelにデプロイ完了してURL共有できる状態。最低5作品掲載。レスポンシブ対応済み',
      motivation: '転職活動で必須。今のサイトは3年前のもので恥ずかしい',
      notes: 'Next.js + Tailwind CSSで構築中。デザインはFigmaで作成済み' },
    { type: 'project', title: '確定申告（副業分）', status: 'in_progress', scope: 'personal',
      completionCriteria: 'e-Taxで送信完了。還付金の振込確認まで',
      notes: '副業の収入: 約45万円。経費の領収書整理が残っている' },
    { type: 'project', title: '引っ越し検討', status: 'open', scope: 'personal',
      completionCriteria: '新居の契約完了＋引越し業者確定＋引越し日決定',
      motivation: '今の家は駅から遠くて通勤がきつい。家賃は上がるが時間を買う',
      notes: '予算: 家賃8.5万以内。駅徒歩10分以内。1K以上' },
    { type: 'project', title: 'TOEIC 700点目標', status: 'in_progress', scope: 'social',
      completionCriteria: '公式試験で700点以上取得',
      motivation: '海外チームとの英語ミーティングで発言できるようになりたい。昇進にも有利',
      notes: '現在スコア: 580点（2025年10月）。4月の試験に申込済み' },
    // 待機
    { type: 'waiting', title: '管理会社から更新書類の返送待ち', status: 'open', scope: 'personal',
      who: '○○不動産（担当: 佐藤さん）', deadline: '2026-03-15' },
    { type: 'waiting', title: 'Aさんからプロジェクトの仕様確認返答', status: 'open', scope: 'social',
      who: '田村（チームリーダー）', deadline: '2026-03-05',
      notes: '2/28にSlackで確認送信済み' },
    { type: 'waiting', title: 'リフォーム見積もり結果', status: 'open', scope: 'personal',
      who: '○○工務店', deadline: '2026-03-20',
      notes: '実家のキッチン改修。親から頼まれた' },
    { type: 'waiting', title: '健康診断の結果', status: 'open', scope: 'personal',
      who: '○○クリニック', deadline: '2026-03-10' },
    { type: 'waiting', title: 'フリーランス案件の返事', status: 'open', scope: 'social',
      who: '○○エージェント（山田さん）', deadline: '2026-03-08',
      notes: 'React案件。時給4500円。週2リモート' },
    // カレンダー
    { type: 'calendar', title: 'チームミーティング（月次定例）', status: 'open', scope: 'social',
      dateTime: '2026-03-05', timeStart: '10:00', timeEnd: '11:00' },
    { type: 'calendar', title: '歯医者予約', status: 'open', scope: 'personal',
      dateTime: '2026-03-12', timeStart: '14:00', timeEnd: '14:30' },
    { type: 'calendar', title: '友人Bの結婚式', status: 'open', scope: 'personal',
      dateTime: '2026-04-15', timeStart: '11:00', timeEnd: '16:00',
      notes: '場所: 青山○○ホテル。ご祝儀3万円。二次会あり' },
    { type: 'calendar', title: 'TOEIC受験日', status: 'open', scope: 'social',
      dateTime: '2026-04-12', timeStart: '13:00', timeEnd: '15:30',
      notes: '会場: ○○大学。受験票を忘れないこと' },
    { type: 'calendar', title: '母の誕生日', status: 'open', scope: 'personal',
      dateTime: '2026-03-25',
      notes: '花を贈る。楽天で注文済み（配送日指定3/24）' },
    { type: 'calendar', title: '確定申告期限', status: 'open', scope: 'personal',
      dateTime: '2026-03-15',
      notes: 'e-Taxで提出。3/10までに終わらせたい' },
    { type: 'calendar', title: '部署の歓迎会', status: 'open', scope: 'social',
      dateTime: '2026-04-03', timeStart: '19:00',
      notes: '新入社員歓迎。幹事は自分。店は予約済み（新宿○○）' },
    // いつかやりたい
    { type: 'wish', title: 'プログラミングスクールで講師してみたい', status: 'open', scope: 'social' },
    { type: 'wish', title: '屋久島に行きたい（縄文杉トレッキング）', status: 'open', scope: 'personal' },
    { type: 'wish', title: '自作キーボード組み立て', status: 'open', scope: 'personal',
      notes: 'Keychron Q1がベース？ 部品代3万くらい' },
    { type: 'wish', title: 'ブログを定期的に書く（技術ブログ）', status: 'open', scope: 'social',
      notes: 'Zenn or はてなブログ。月2本ペース' },
    { type: 'wish', title: 'ギターを再開する', status: 'open', scope: 'personal',
      notes: '大学時代に弾いてた。アコギは実家にある' },
    { type: 'wish', title: '料理のレパートリーを30品にする', status: 'open', scope: 'personal' },
    { type: 'wish', title: '投資信託以外の投資を勉強する', status: 'open', scope: 'personal',
      notes: '米国個別株？ 仮想通貨？ まずは勉強から' },
    { type: 'wish', title: 'キャンプ用品を揃えてソロキャンプ', status: 'open', scope: 'personal' },
    { type: 'wish', title: '技術書の読書会を社内で主催する', status: 'open', scope: 'social' },
    { type: 'wish', title: 'Rustを学ぶ', status: 'open', scope: 'social',
      notes: 'Wasm周りで使える。The Bookから始める' },
    { type: 'wish', title: '瞑想を本格的に習慣にする（マインドフルネス）', status: 'open', scope: 'personal' },
    { type: 'wish', title: '海外テックカンファレンスに参加する', status: 'open', scope: 'social',
      notes: 'React Conf or Google I/O。来年以降？' },
    { type: 'wish', title: '副業で月10万安定させる', status: 'open', scope: 'social' },
  ];

  for (const t of tasks) {
    const now = new Date();
    const created = new Date(now);
    created.setDate(created.getDate() - Math.floor(Math.random() * 60 + 10));
    const task = createTaskData(t.type, t.title, {
      status: t.status || 'open',
      scope: t.scope || '',
      motivation: t.motivation || '',
      completionCriteria: t.completionCriteria || '',
      who: t.who || '',
      deadline: t.deadline ? seedDate(t.deadline) : '',
      dateTime: t.dateTime ? seedDate(t.dateTime) : '',
      timeStart: t.timeStart || '',
      timeEnd: t.timeEnd || '',
      notes: t.notes || '',
      createdAt: created.toISOString(),
      updatedAt: now.toISOString()
    });
    await saveData('tasks', task);
  }
  console.log('タスク 完了 (' + tasks.length + '件)');

  // ========== ルーティン ==========
  const routines = [
    // 目標（霊・心・技・体・生活 × 2以上）
    { type: 'goal', title: '感謝日記（3つ書く）', scope: 'personal',
      motivation: '感謝できることに目を向けると幸福度が上がる研究結果がある。実際にやると気持ちが落ち着く',
      trigger: '就寝前、布団に入ったら',
      routineManual: 'スマホのメモアプリを開いて、今日感謝できること3つを書く。大きなことでなくていい。「天気が良かった」レベルでOK',
      preparation: '22:30までに風呂を済ませる',
      minimumSetting: '1つだけでも書く' },
    { type: 'goal', title: '10分間の瞑想', scope: 'personal',
      motivation: '集中力が上がる。イライラが減る。やらないと一日中雑念に振り回される',
      trigger: '朝起きて顔を洗った直後',
      routineManual: 'タイマーを10分セット。あぐらで座る。呼吸に意識を向ける。雑念が来ても追わずに呼吸に戻す',
      preparation: '朝6:30に起きる（アラーム2つ）',
      minimumSetting: '3分だけ深呼吸する' },
    { type: 'goal', title: 'ポジティブなセルフトーク', scope: 'personal',
      motivation: '自己肯定感を上げる。ネガティブな独り言をやめる。思考が行動を変える',
      trigger: 'ネガティブな考えが浮かんだ時、鏡を見た時',
      routineManual: '否定的な言葉を言い換える。「ダメだ」→「ここから改善できる」。朝鏡の前で「今日もいい日になる」と言う',
      preparation: '洗面台に付箋でリマインド',
      minimumSetting: '朝1回だけ「大丈夫」と言う' },
    { type: 'goal', title: '新しいことに1つチャレンジ', scope: 'personal',
      motivation: 'コンフォートゾーンから出ることで成長する。小さくてもいいから毎日何か新しいことをする',
      trigger: '夕方、仕事が終わった後',
      routineManual: '新しい道を歩く、新しい食材で料理する、話したことない人に話しかける、等。大小問わず',
      preparation: '特になし',
      minimumSetting: 'いつもと違うコンビニに行く程度でもOK' },
    { type: 'goal', title: '技術記事を1本読む', scope: 'social',
      motivation: 'エンジニアとしての市場価値を維持する。知識が古くなると一気に不利になる',
      trigger: '昼休みの後半15分',
      routineManual: 'Zenn, Qiita, dev.toのトレンドから1本選んで読む。読んだらNotionに要点メモ',
      preparation: 'RSSリーダーに登録済み',
      minimumSetting: 'タイトルと概要だけ見て1つブックマーク' },
    { type: 'goal', title: '英語リスニング20分', scope: 'social',
      motivation: 'TOEICスコアアップに直結。海外チームとの会議で聞き取れなくて恥ずかしい思いをしたくない',
      trigger: '通勤電車の中（往路）',
      routineManual: 'TOEICリスニング問題集のPart3/4を再生。シャドーイングも可。スマホにダウンロード済み',
      preparation: 'イヤホンを忘れない。前日夜にカバンにセット',
      minimumSetting: '10分だけでも聞く' },
    { type: 'goal', title: '筋トレ30分', scope: 'personal',
      motivation: '健康診断の結果が悪化してる。体型もだらしなくなってきた。30歳までに体を作り直す',
      trigger: '仕事から帰宅して着替えた直後',
      routineManual: '月水金: 上半身（腕立て、ダンベル）。火木: 下半身（スクワット、ランジ）。YouTubeのトレーニング動画に合わせる',
      preparation: 'トレーニングウェアを出しておく。プロテインを用意',
      minimumSetting: 'スクワット20回だけ' },
    { type: 'goal', title: '7時間睡眠確保', scope: 'personal',
      motivation: '睡眠不足だとパフォーマンスが50%以下になる。集中力も判断力も落ちる',
      trigger: '23:00になったらスマホを置く',
      routineManual: '23:00にナイトモード発動。23:30就寝→6:30起床。寝る前にスマホを見ない',
      preparation: '22:30までに風呂・歯磨き完了',
      minimumSetting: '最低6時間は確保する' },
    { type: 'goal', title: '部屋の掃除（最低10分）', scope: 'personal',
      motivation: '散らかった部屋だと集中できない。人を呼べない。掃除すると気持ちもスッキリする',
      trigger: '朝食後、出勤前の10分',
      routineManual: '月: 掃除機。火: トイレ。水: 風呂。木: キッチン。金: 拭き掃除。各10分程度',
      preparation: '掃除道具は出しやすい場所に',
      minimumSetting: 'テーブルの上だけ片付ける' },
    { type: 'goal', title: '自炊（1日1食以上）', scope: 'personal',
      motivation: '外食ばかりだと不健康＋お金がかかる。自炊すると食費が半分になる',
      trigger: '夕食時',
      routineManual: '平日は簡単なもの（パスタ、炒め物）。週末に作り置き。レシピはクラシルアプリ',
      preparation: '週末にまとめ買い。冷凍ストックを切らさない',
      minimumSetting: '味噌汁だけでも作る' },
    { type: 'goal', title: 'Notionで今日の振り返りメモ', scope: 'personal',
      motivation: '振り返りをしないと同じ失敗を繰り返す。成長の記録にもなる',
      trigger: '日誌を書く直前',
      routineManual: '今日やったこと、学んだこと、改善点を3行で書く。長く書かなくていい',
      preparation: 'Notionテンプレートは作成済み',
      minimumSetting: '1行だけでも書く' },
    // 義務
    { type: 'obligation', title: '家賃振込（毎月25日）', scope: 'personal',
      trigger: '毎月23日にリマインダー',
      routineManual: '三井住友銀行アプリから振込。金額: 72,000円。振込先は登録済み',
      frequency: '毎月25日' },
    { type: 'obligation', title: 'カード支払い確認（毎月10日）', scope: 'personal',
      trigger: '毎月8日にリマインダー',
      routineManual: '三井住友カードアプリで明細確認。不正利用がないかチェック。残高確認',
      frequency: '毎月10日' },
    { type: 'obligation', title: '勤怠報告（毎日）', scope: 'social',
      trigger: '出勤時と退勤時',
      routineManual: '勤怠管理システムにログイン→打刻。残業がある場合は事前申請',
      frequency: '毎日' },
    { type: 'obligation', title: 'ゴミ出し', scope: 'personal',
      trigger: '前日の夜にゴミをまとめる',
      routineManual: '火曜: 燃えるゴミ。金曜: 燃えないゴミ+ペットボトル。第2・4水曜: 段ボール',
      frequency: '火・金' },
    { type: 'obligation', title: '国民年金支払い確認', scope: 'personal',
      trigger: '毎月月末',
      routineManual: '口座振替で自動引き落とし。通帳で確認',
      frequency: '毎月' },
    // 維持
    { type: 'maintenance', title: '歯医者定期検診', scope: 'personal',
      trigger: '前回から3ヶ月経ったら予約',
      routineManual: '○○歯科（駅前）に電話予約。土曜午前が取りやすい',
      frequency: '3ヶ月ごと' },
    { type: 'maintenance', title: '美容室', scope: 'personal',
      trigger: '髪が耳にかかり始めたら',
      routineManual: 'Hot Pepper Beautyで予約。いつもの店（○○HAIR）。カット+シャンプーで4,400円',
      frequency: '2ヶ月ごと' },
    { type: 'maintenance', title: '部屋の換気', scope: 'personal',
      trigger: '朝起きたらすぐ',
      routineManual: '対角線上の窓を2つ開ける。15分以上。冬でも最低5分',
      frequency: '毎日' },
    { type: 'maintenance', title: '爪切り', scope: 'personal',
      trigger: '日曜の風呂上がり',
      routineManual: '手足の爪を切る。爪やすりで整える',
      frequency: '週1' },
    { type: 'maintenance', title: '洗濯', scope: 'personal',
      trigger: '洗濯カゴが半分以上たまったら',
      routineManual: '洗剤+柔軟剤。タオル類は分けて洗う。干す時はハンガーに',
      frequency: '週2-3回' },
    // 指針
    { type: 'principle', title: '嘘をつかない', scope: 'personal',
      motivation: '信頼は一度失うと取り戻せない。誠実さが全ての土台',
      routineManual: '事実をそのまま伝える。言いにくいことでも正直に。ただし相手を傷つける必要はない' },
    { type: 'principle', title: '約束を守る', scope: 'personal',
      motivation: '約束を守る人は信頼される。守れない約束はしない',
      routineManual: '約束したらすぐカレンダーに入れる。難しくなったら早めに伝える' },
    { type: 'principle', title: '感情で判断しない（一晩置く）', scope: 'personal',
      motivation: '怒りや焦りで決めたことは大体間違い。冷静な時に判断する',
      routineManual: '重要な決断は一晩置く。メールの返信も感情的な時は下書き保存' },
    { type: 'principle', title: '人の話を最後まで聞く', scope: 'personal',
      motivation: '途中で遮ると相手は話す気をなくす。最後まで聞いてから話す',
      routineManual: '相手が話し終わるまで黙って聞く。相槌を打つ。話が終わってから自分の意見を言う' },
    // 候補
    { type: 'candidate', title: '朝活コミュニティに参加？', scope: 'personal',
      notes: '6:00-7:00のオンライン朝活。Twitterで見かけた。続くかわからない' },
    { type: 'candidate', title: '週末ボランティア？', scope: 'personal',
      notes: '子ども食堂のIT支援。月1回。興味はあるが時間的に厳しいかも' },
    { type: 'candidate', title: 'AWS認定取得？', scope: 'social',
      notes: 'SAA（ソリューションアーキテクト）。会社の資格手当が月5,000円。4月以降？' }
  ];

  for (const r of routines) {
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 60 + 20));
    const routine = createRoutineData(r.type, r.title, {
      scope: r.scope || '',
      motivation: r.motivation || '',
      trigger: r.trigger || '',
      routineManual: r.routineManual || '',
      preparation: r.preparation || '',
      minimumSetting: r.minimumSetting || '',
      frequency: r.frequency || '',
      notes: r.notes || '',
      streak: Math.floor(Math.random() * 20),
      totalDone: Math.floor(Math.random() * 50 + 5),
      createdAt: created.toISOString(),
      updatedAt: new Date().toISOString()
    });
    await saveData('routines', routine);
  }
  console.log('ルーティン 完了 (' + routines.length + '件)');

  // ========== 人生設計 ==========
  await saveLifeDesign({
    id: 'main',
    purpose: '技術を通じて人の役に立つプロダクトを作り、自分自身も常に成長し続けること。\n「作ったもので誰かの問題が解決した」と実感できる瞬間が、自分にとっての最大の報酬。',
    meaning: '良い仲間と共に、挑戦と学びのある人生を送ること。\n安定だけを求めるのではなく、適度なリスクを取って新しいことに挑み続ける。\n人との繋がりを大切にし、孤独にならない生き方をする。',
    ageGoals: [
      { age: 30, goal: 'シニアエンジニアとしてチームを技術的にリードできる状態。副業で月15万安定。TOEIC800点。筋トレを3年継続。彼女と同棲開始？' },
      { age: 35, goal: 'テックリードまたはマネージャーのどちらかに進む。年収800万以上。結婚して家庭を持つ。自分のプロダクトを1つローンチしている' },
      { age: 40, goal: '独立 or CTO的ポジション。子どもの教育に投資できる経済力。健康を維持して趣味も楽しめる余裕がある生活' },
      { age: 50, goal: '培った経験を若い世代に還元する。技術顧問やメンター的な活動。資産運用で老後の不安がない状態。海外にも拠点？' }
    ]
  });
  console.log('人生設計 完了');

  // ========== 長期目標 ==========
  const longTermGoals = [
    { goal: 'シニアエンジニアに昇進する', startYear: 2026, startMonth: 1, deadlineYear: 2027, deadlineMonth: 12,
      milestones: [
        { year: 2026, month: 6, goal: 'ポートフォリオ完成・AWS認定取得' },
        { year: 2026, month: 12, goal: 'チーム内で技術的リードを2件以上担当' },
        { year: 2027, month: 6, goal: '昇進面談に向けた実績まとめ' },
        { year: 2027, month: 12, goal: '昇進' }
      ]},
    { goal: '副業収入を月15万円安定させる', startYear: 2026, startMonth: 1, deadlineYear: 2027, deadlineMonth: 6,
      milestones: [
        { year: 2026, month: 3, goal: '確定申告完了・経理の仕組み化' },
        { year: 2026, month: 6, goal: '月5万円安定' },
        { year: 2026, month: 12, goal: '月10万円安定' },
        { year: 2027, month: 6, goal: '月15万円安定' }
      ]},
    { goal: 'TOEIC 800点取得', startYear: 2026, startMonth: 1, deadlineYear: 2026, deadlineMonth: 10,
      milestones: [
        { year: 2026, month: 4, goal: '700点（4月試験）' },
        { year: 2026, month: 7, goal: '750点（7月試験）' },
        { year: 2026, month: 10, goal: '800点（10月試験）' }
      ]}
  ];
  for (const g of longTermGoals) {
    if (g.startYear && g.startMonth) {
      const st = seedYM(g.startYear, g.startMonth);
      g.startYear = st.year;
      g.startMonth = st.month;
    }
    const dl = seedYM(g.deadlineYear, g.deadlineMonth);
    g.deadlineYear = dl.year;
    g.deadlineMonth = dl.month;
    if (g.milestones) {
      g.milestones = g.milestones.map(ms => {
        const adj = seedYM(ms.year, ms.month);
        return { ...ms, year: adj.year, month: adj.month };
      });
    }
    await saveLongTermGoal(g);
  }
  console.log('長期目標 完了');

  // ========== 月次目標（3ヶ月分） ==========
  // 3ヶ月前
  await saveMonthlyGoal({
    yearMonth: seedMonth('2025-12'),
    goal: '年末の振り返りと来年の目標設定。大掃除完了。忘年会を楽しむ',
    vision: '大掃除が終わったきれいな部屋で、来年の目標リストを眺めながらお茶を飲んでいる。1年間の振り返りノートが完成していて、充実感がある。',
    successPattern: '感謝の気持ちで1年を振り返り、達成したことを素直に認める。振り返りを文書化し、大掃除で体を動かしてリフレッシュする。年賀状も早めに出す。',
    failurePattern: '反省ばかりで落ち込む。来年への不安が大きくなる。ダラダラ過ごして何もしない。食べすぎ飲みすぎで体調を崩す。',
    countermeasure: '毎日3つ感謝を書く。80点でOKと割り切る。小さく始める（1日1エリア掃除）。食事量をメモして暴飲暴食を防ぐ。',
    perspectives: {
      othersFeeling: '「今年もお疲れ様」と穏やかに年を越せた',
      othersVisible: '部屋がきれいに片付いている。来年の目標リストがある',
      selfFeeling: '今年やり切った感覚がある。来年への希望がある',
      selfVisible: '振り返りノートが完成。来年の目標が明文化されている'
    },
    patterns: {
      success: { rei: '感謝の気持ちで1年を振り返る', shin: '達成したことを認める', gi: '振り返りを文書化', tai: '大掃除で体を動かす', sei: '年賀状を出す' },
      failure: { rei: '反省ばかりで終わる', shin: '来年への不安が大きい', gi: 'ダラダラ過ごして何もしない', tai: '食べすぎ飲みすぎ', sei: '部屋が散らかったまま' }
    },
    problems: { rei: '感謝を忘れがち', shin: '完璧主義で自分を責める', gi: '計画倒れ', tai: '年末の暴飲暴食', sei: '大掃除の先延ばし' },
    solutions: { rei: '毎日3つ感謝を書く', shin: '80点でOKと割り切る', gi: '小さく始める', tai: '食事量をメモする', sei: '1日1エリアずつ片付ける' },
    routines: [
      { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
      { id: 2, category: 'rei', name: '年末の振り返りノート作成', priority: 2 },
      { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
      { id: 4, category: 'shin', name: '来年の目標ブレスト', priority: 4 },
      { id: 5, category: 'gi', name: '技術記事1本読む', priority: 5 },
      { id: 6, category: 'gi', name: '来年の学習計画作成', priority: 6 },
      { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
      { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
      { id: 9, category: 'sei', name: '大掃除（1日1エリア）', priority: 9 },
      { id: 10, category: 'sei', name: '年賀状作成', priority: 10 }
    ],
    coreActions: { deadline: '確定申告準備（領収書整理）', processing: 'F・BOXの年末整理', habit: '毎朝瞑想', other: '忘年会の幹事' },
    deadlineItems: [
      { id: 1210000001, title: '忘年会幹事（店予約）', date: seedDate('2025-12-10') },
      { id: 1210000002, title: '年賀状投函', date: seedDate('2025-12-25') },
      { id: 1210000003, title: '領収書整理完了', date: seedDate('2025-12-20') }
    ],
    weeklyMilestones: [
      '大掃除スタート（リビング）',
      '大掃除（水回り）＋忘年会',
      '年賀状＋領収書整理',
      '仕事納め・振り返り',
      ''
    ],
    reward: {
      selfFeeling: '今年1年やり切った充実感',
      selfVisible: '振り返りノート完成、来年の目標リスト',
      othersFeeling: '「しっかりしてるね」と言われる',
      othersVisible: 'きれいな部屋、整理された計画'
    },
    support: { supporter: '友人A（同じく目標設定する仲間）', content: '互いの目標を共有して月1回進捗報告' }
  });

  // 2ヶ月前
  await saveMonthlyGoal({
    yearMonth: seedMonth('2026-01'),
    goal: '生活リズムの立て直しと英語学習の習慣化。ポートフォリオ設計開始',
    vision: '毎朝6:30に起きて瞑想してから出勤。通勤電車で英語リスニングが完全に習慣化している。週末にはポートフォリオのワイヤーフレームが完成している。',
    successPattern: '新年の感謝と決意を持ち、小さな成功体験を毎週積む。英語を毎日20分続け、筋トレ週4回、自炊率70%以上をキープ。',
    failurePattern: '正月ボケが抜けない。目標が大きすぎて三日坊主。何から始めていいかわからず手が止まる。寒さと外食で正月太りが戻らない。',
    countermeasure: '1月4日から強制的に通常モードに戻す。週単位の小さな目標にする。英語はTOEICリスニングに絞る。室内トレーニングで寒さ対策。作り置きで自炊のハードルを下げる。',
    breakdown: {
      factors: [
        { name: '生活リズムの確立', actions: ['1月4日からアラーム6:30設定', '22:30以降スマホ禁止', '朝瞑想10分をトリガーにする'] },
        { name: '英語学習の習慣化', actions: ['通勤電車で毎日20分リスニング', 'TOEICリスニング教材をスマホにDL', '同僚Bと週次報告'] },
        { name: 'ポートフォリオ設計', actions: ['Figmaでワイヤーフレーム作成', '参考サイト5つを分析', '週末に2時間ずつ作業'] }
      ]
    },
    schedulePatterns: [
      {
        id: 2001,
        name: '平日（通常勤務）',
        priority: 1,
        condition: { type: 'weekdays', days: [1, 2, 3, 4, 5] },
        schedule: [
          { startHour: 6, startMinute: 30, endHour: 7, activity: '起床・瞑想・身支度', color: '#43A047' },
          { startHour: 7, startMinute: 0, endHour: 7, activity: '朝食・部屋掃除', color: '#00ACC1' },
          { startHour: 7, startMinute: 30, endHour: 8, activity: '通勤（英語リスニング）', color: '#1E88E5' },
          { startHour: 8, startMinute: 30, endHour: 12, activity: '午前の業務', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼休み（技術記事）', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 18, activity: '午後の業務', color: '#5E35B1' },
          { startHour: 18, startMinute: 30, endHour: 19, activity: '帰宅・夕食（自炊）', color: '#00ACC1' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '筋トレ30分', color: '#E53935' },
          { startHour: 20, startMinute: 0, endHour: 21, activity: '英語復習・自由時間', color: '#FDD835' },
          { startHour: 21, startMinute: 0, endHour: 22, activity: 'ポートフォリオ作業', color: '#5E35B1' },
          { startHour: 22, startMinute: 30, endHour: 23, activity: '入浴・感謝日記', color: '#43A047' },
          { startHour: 23, startMinute: 0, endHour: 6, activity: '就寝', color: '#78909C' }
        ]
      },
      {
        id: 2002,
        name: '休日',
        priority: 1,
        condition: { type: 'weekdays', days: [0, 6] },
        schedule: [
          { startHour: 7, startMinute: 30, endHour: 8, activity: '起床・瞑想', color: '#43A047' },
          { startHour: 8, startMinute: 0, endHour: 9, activity: '朝食・掃除', color: '#00ACC1' },
          { startHour: 9, startMinute: 0, endHour: 12, activity: 'ポートフォリオ集中作業', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼食', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 15, activity: '英語学習（集中）', color: '#1E88E5' },
          { startHour: 15, startMinute: 0, endHour: 16, activity: '筋トレ or ジョギング', color: '#E53935' },
          { startHour: 16, startMinute: 0, endHour: 17, activity: '作り置き料理', color: '#00ACC1' },
          { startHour: 17, startMinute: 0, endHour: 19, activity: '自由時間', color: '#D81B60' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '夕食', color: '#FB8C00' },
          { startHour: 20, startMinute: 0, endHour: 22, activity: '読書・振り返り', color: '#FDD835' },
          { startHour: 22, startMinute: 30, endHour: 7, activity: '就寝', color: '#78909C' }
        ]
      }
    ],
    perspectives: {
      othersFeeling: '「年明けから頑張ってるね」と思われる',
      othersVisible: '規則正しい生活。英語学習のルーティンが見える',
      selfFeeling: '新年のやる気を行動に変えられている実感',
      selfVisible: '英語学習の記録が毎日ある。ポートフォリオのワイヤーフレーム完成'
    },
    patterns: {
      success: { rei: '新年の感謝と決意', shin: '小さな成功体験を積む', gi: '英語毎日20分', tai: '筋トレ週4', sei: '自炊率70%以上' },
      failure: { rei: '正月ボケが抜けない', shin: '三日坊主', gi: '何から始めていいかわからない', tai: '正月太りが戻らない', sei: '外食ばかり' }
    },
    problems: { rei: '正月の怠惰な習慣が残る', shin: '目標が大きすぎて挫折', gi: '英語学習の方法が定まらない', tai: '寒くて運動したくない', sei: '自炊がめんどくさい' },
    solutions: { rei: '1月4日から通常モードに戻す', shin: '週単位の小さな目標にする', gi: 'TOEICリスニングに絞る', tai: '室内トレーニングのみ', sei: '作り置きをする' },
    routines: [
      { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
      { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
      { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
      { id: 4, category: 'shin', name: '新しいことに1つチャレンジ', priority: 4 },
      { id: 5, category: 'gi', name: '技術記事1本読む', priority: 5 },
      { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
      { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
      { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
      { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
      { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
    ],
    coreActions: { deadline: 'ポートフォリオのワイヤーフレーム作成', processing: 'F・BOX週次整理', habit: '英語リスニング毎日', other: '新年会参加' },
    deadlineItems: [
      { id: 1310000001, title: '新年会（会場手配）', date: seedDate('2026-01-11') },
      { id: 1310000002, title: 'ワイヤーフレーム完成', date: seedDate('2026-01-25') },
      { id: 1310000003, title: '英語学習計画策定', date: seedDate('2026-01-05') }
    ],
    weeklyMilestones: [
      '生活リズム確立・目標整理',
      '新年会＋英語習慣スタート',
      'ワイヤーフレーム着手',
      'ワイヤーフレーム完成・月末振り返り',
      ''
    ],
    reward: {
      selfFeeling: '生活リズムが整って気持ちいい',
      selfVisible: '英語学習30日連続の記録',
      othersFeeling: '「意識高いね」と感心される',
      othersVisible: 'ポートフォリオの設計図'
    },
    support: { supporter: '同僚B（英語勉強仲間）', content: '週1で英語の進捗を報告し合う' }
  });

  // 先月
  await saveMonthlyGoal({
    yearMonth: seedMonth('2026-02'),
    goal: 'ポートフォリオサイト完成（デプロイまで）。確定申告の準備完了。TOEIC模試で650点以上',
    vision: 'Vercelにデプロイされたポートフォリオを友人や同僚に共有して「すごい！」と言われている。確定申告の下書きが完了して安心感がある。TOEIC模試で650点の画面を見てガッツポーズ。',
    successPattern: '感謝と共に成果を噛み締める。完成させた自分を褒める。ポートフォリオ実装に集中し、筋トレも継続。確定申告の書類を毎週少しずつ整理。',
    failurePattern: '焦りで余裕がなくなる。完璧を求めてリリースできない。機能を詰め込みすぎてデプロイが遅れる。忙しさを言い訳に運動をサボる。確定申告を後回し。',
    countermeasure: 'プロセスを楽しむ意識を持つ。MVP（最小限）でまずリリースする。技術はNext.js+Tailwindに決め打ちして迷わない。室内トレーニングで継続。確定申告は毎週末30分ずつ。',
    breakdown: {
      factors: [
        { name: 'ポートフォリオ完成', actions: ['トップページ実装', 'プロジェクト一覧/詳細ページ', 'コンタクトフォーム実装', 'レスポンシブ対応', 'Vercelデプロイ'] },
        { name: '確定申告準備', actions: ['freeeに収入データ入力', '領収書スキャン＆整理（毎週末）', 'e-Tax事前準備（マイナンバーカード）', '下書き作成'] },
        { name: 'TOEIC650点', actions: ['毎日リスニング20分（通勤）', 'Part5文法問題を毎日10問', '月末に模試1回受験'] }
      ]
    },
    schedulePatterns: [
      {
        id: 3001,
        name: '平日（通常勤務）',
        priority: 1,
        condition: { type: 'weekdays', days: [1, 2, 3, 4, 5] },
        schedule: [
          { startHour: 6, startMinute: 30, endHour: 7, activity: '起床・瞑想・身支度', color: '#43A047' },
          { startHour: 7, startMinute: 0, endHour: 7, activity: '朝食・部屋掃除', color: '#00ACC1' },
          { startHour: 7, startMinute: 30, endHour: 8, activity: '通勤（英語リスニング）', color: '#1E88E5' },
          { startHour: 8, startMinute: 30, endHour: 12, activity: '午前の業務', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼休み（技術記事）', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 18, activity: '午後の業務', color: '#5E35B1' },
          { startHour: 18, startMinute: 30, endHour: 19, activity: '帰宅・夕食', color: '#00ACC1' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '筋トレ30分', color: '#E53935' },
          { startHour: 20, startMinute: 0, endHour: 21, activity: 'ポートフォリオ実装（1時間）', color: '#5E35B1' },
          { startHour: 21, startMinute: 0, endHour: 22, activity: '英語復習・TOEIC Part5', color: '#1E88E5' },
          { startHour: 22, startMinute: 30, endHour: 23, activity: '入浴・感謝日記・振り返り', color: '#43A047' },
          { startHour: 23, startMinute: 0, endHour: 6, activity: '就寝', color: '#78909C' }
        ]
      },
      {
        id: 3002,
        name: '休日',
        priority: 1,
        condition: { type: 'weekdays', days: [0, 6] },
        schedule: [
          { startHour: 7, startMinute: 30, endHour: 8, activity: '起床・瞑想', color: '#43A047' },
          { startHour: 8, startMinute: 0, endHour: 9, activity: '朝食・掃除', color: '#00ACC1' },
          { startHour: 9, startMinute: 0, endHour: 12, activity: 'ポートフォリオ集中実装', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼食', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 14, activity: '確定申告書類整理', color: '#E53935' },
          { startHour: 14, startMinute: 0, endHour: 15, activity: 'TOEIC学習（集中）', color: '#1E88E5' },
          { startHour: 15, startMinute: 0, endHour: 16, activity: '筋トレ or ジョギング', color: '#E53935' },
          { startHour: 16, startMinute: 0, endHour: 17, activity: '作り置き料理', color: '#00ACC1' },
          { startHour: 17, startMinute: 0, endHour: 19, activity: '自由時間', color: '#D81B60' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '夕食', color: '#FB8C00' },
          { startHour: 20, startMinute: 0, endHour: 22, activity: 'Notionで振り返り・読書', color: '#FDD835' },
          { startHour: 22, startMinute: 30, endHour: 7, activity: '就寝', color: '#78909C' }
        ]
      }
    ],
    perspectives: {
      othersFeeling: '「すごい、もうサイト作ったの？」と驚かれる',
      othersVisible: 'ポートフォリオURLを共有できる。確定申告書類が揃っている',
      selfFeeling: '形にした達成感。自信がつく',
      selfVisible: 'デプロイ済みのポートフォリオ。確定申告の下書き完了'
    },
    patterns: {
      success: { rei: '感謝と共に成果を噛み締める', shin: '完成させた自分を褒める', gi: 'ポートフォリオ実装に集中', tai: '筋トレ継続', sei: '確定申告の書類整理' },
      failure: { rei: '焦りで余裕がなくなる', shin: '完璧を求めてリリースできない', gi: '機能を詰め込みすぎる', tai: '忙しくて運動をサボる', sei: '確定申告を後回し' }
    },
    problems: { rei: '成果に執着して焦る', shin: '完璧主義', gi: '技術選定に迷って時間を消費', tai: '寒さで運動量が落ちる', sei: '領収書の整理が面倒' },
    solutions: { rei: 'プロセスを楽しむ意識', shin: 'MVP(最小限)でリリースする', gi: 'Next.js+Tailwindに決め打ち', tai: '室内トレーニング継続', sei: '毎週末30分ずつ整理' },
    routines: [
      { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
      { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
      { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
      { id: 4, category: 'shin', name: 'Notionで振り返りメモ', priority: 4 },
      { id: 5, category: 'gi', name: 'ポートフォリオ実装（1日1時間）', priority: 5 },
      { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
      { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
      { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
      { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
      { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
    ],
    coreActions: { deadline: 'ポートフォリオデプロイ（2/28まで）', processing: '確定申告書類整理', habit: '英語リスニング毎日', other: 'TOEIC模試を1回受ける' },
    deadlineItems: [
      { id: 1410000001, title: 'ポートフォリオデプロイ', date: seedDate('2026-02-28') },
      { id: 1410000002, title: 'TOEIC模試受験', date: seedDate('2026-02-15') },
      { id: 1410000003, title: '確定申告書類まとめ', date: seedDate('2026-02-20') }
    ],
    weeklyMilestones: [
      'デザイン実装開始',
      'メイン機能実装＋TOEIC模試',
      '確定申告書類完成',
      'デプロイ＋最終テスト',
      ''
    ],
    reward: {
      selfFeeling: 'ポートフォリオを完成させた達成感',
      selfVisible: 'デプロイ済みURL。模試スコア650+',
      othersFeeling: '「ちゃんとやってるな」と信頼される',
      othersVisible: '確定申告の準備完了'
    },
    support: { supporter: '同僚C（エンジニア仲間）', content: 'ポートフォリオのコードレビューを依頼' }
  });

  // 今月
  await saveMonthlyGoal({
    yearMonth: seedMonth('2026-03'),
    goal: '確定申告完了。引っ越し先の物件候補を3件以上見学。TOEIC本番に向けた追い込み',
    vision: 'e-Taxで確定申告を送信して「完了」の画面を見ている。引っ越し先の候補リストが3件以上あり比較検討中。TOEIC模試で680点を超えて4月本番への自信がついている。',
    successPattern: '焦らず着実に1つずつ片付ける。確定申告を3/10までに終わらせて残りをTOEICと物件探しに充てる。春に向けて運動量を上げる。',
    failurePattern: '期限に追われて焦る。確定申告・引っ越し・TOEICを同時進行してパンクする。花粉症で外出がつらくなり全体的にペースダウン。',
    countermeasure: '毎朝の瞑想で焦りを抑える。優先順位を「確定申告→TOEIC→物件」と明確にする。通勤時間は全て英語に充てる。室内トレーニング+花粉対策で体調管理。',
    breakdown: {
      factors: [
        { name: '確定申告完了', actions: ['e-Taxで下書き最終確認', '3/10までに送信', '還付金の振込確認'] },
        { name: '物件見学3件以上', actions: ['不動産サイトで条件検索', '不動産会社に条件を伝える', '週末に1件ずつ見学', '比較表を作成'] },
        { name: 'TOEIC追い込み', actions: ['毎日リスニング20分（通勤）', 'Part5文法問題30分/日', '週末に模試1回', '弱点分野（Part7）集中対策'] },
        { name: '母の誕生日手配', actions: ['プレゼント選び', '楽天で注文（3/22まで）', 'メッセージカード準備'] }
      ]
    },
    perspectives: {
      othersFeeling: '「計画的に進めてるね」と思われる',
      othersVisible: '確定申告完了。物件見学のメモ。TOEIC問題集が付箋だらけ',
      selfFeeling: '着実に前に進んでいる実感',
      selfVisible: '確定申告の受領通知。物件候補リスト。模試スコア680+'
    },
    patterns: {
      success: { rei: '焦らず着実に進める', shin: '一つずつ片付ける達成感', gi: 'TOEIC集中学習', tai: '春に向けて運動量UP', sei: '確定申告を3/10までに終わらせる' },
      failure: { rei: '期限に追われて焦る', shin: '同時進行でパンクする', gi: '引っ越しに気を取られて勉強が疎かに', tai: '花粉症で外出がつらい', sei: '確定申告ギリギリ' }
    },
    problems: { rei: '焦りで精神的に不安定', shin: 'タスク過多', gi: 'TOEIC学習時間の確保', tai: '花粉症シーズン', sei: '引っ越し準備と確定申告の両立' },
    solutions: { rei: '毎朝の瞑想で落ち着く', shin: '優先順位を明確にする', gi: '通勤時間を全て英語に充てる', tai: '室内トレーニング+花粉対策', sei: '確定申告を最優先で片付ける' },
    routines: [
      { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
      { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
      { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
      { id: 4, category: 'shin', name: 'Notionで振り返りメモ', priority: 4 },
      { id: 5, category: 'gi', name: 'TOEIC問題集（Part5/6）30分', priority: 5 },
      { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
      { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
      { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
      { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
      { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
    ],
    coreActions: { deadline: '確定申告提出（3/15期限、3/10目標）', processing: '引っ越し物件リストアップ', habit: 'TOEIC学習毎日50分', other: '母の誕生日プレゼント手配' },
    deadlineItems: [
      { id: 1710000001, title: '確定申告提出', date: seedDate('2026-03-10') },
      { id: 1710000002, title: 'TOEIC模試', date: seedDate('2026-03-08') },
      { id: 1710000003, title: '母の誕生日プレゼント手配', date: seedDate('2026-03-16') },
      { id: 1710000004, title: '引っ越し物件見学①', date: seedDate('2026-03-15') },
      { id: 1710000005, title: 'ポートフォリオ最終調整', date: seedDate('2026-03-22') }
    ],
    weeklyMilestones: [
      '確定申告書類の最終確認',
      'TOEIC模試＋確定申告提出',
      '物件見学＋母の誕生日',
      'ポートフォリオ仕上げ',
      '月末振り返り・4月計画'
    ],
    schedulePatterns: [
      {
        id: 1001,
        name: '平日（通常勤務）',
        priority: 1,
        condition: { type: 'weekdays', days: [1, 2, 3, 4] },
        schedule: [
          { startHour: 6, startMinute: 30, endHour: 7, activity: '起床・瞑想・身支度', color: '#43A047' },
          { startHour: 7, startMinute: 0, endHour: 7, activity: '朝食・部屋掃除10分', color: '#00ACC1' },
          { startHour: 7, startMinute: 30, endHour: 8, activity: '通勤（英語リスニング）', color: '#1E88E5' },
          { startHour: 8, startMinute: 30, endHour: 9, activity: '出社・メールチェック', color: '#5E35B1' },
          { startHour: 9, startMinute: 0, endHour: 12, activity: '午前の業務（集中タイム）', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼休み（技術記事1本）', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 18, activity: '午後の業務', color: '#5E35B1' },
          { startHour: 18, startMinute: 0, endHour: 18, activity: '退勤（英語リスニング復路）', color: '#1E88E5' },
          { startHour: 18, startMinute: 30, endHour: 19, activity: '帰宅・着替え', color: '#43A047' },
          { startHour: 19, startMinute: 0, endHour: 19, activity: '夕食（自炊）', color: '#00ACC1' },
          { startHour: 19, startMinute: 30, endHour: 20, activity: '筋トレ30分', color: '#E53935' },
          { startHour: 20, startMinute: 0, endHour: 21, activity: 'TOEIC問題集30分', color: '#1E88E5' },
          { startHour: 21, startMinute: 0, endHour: 22, activity: '自由時間・副業', color: '#FDD835' },
          { startHour: 22, startMinute: 0, endHour: 22, activity: '入浴・感謝日記・振り返り', color: '#43A047' },
          { startHour: 22, startMinute: 30, endHour: 23, activity: '読書・リラックス', color: '#D81B60' },
          { startHour: 23, startMinute: 0, endHour: 6, activity: '就寝', color: '#78909C' }
        ]
      },
      {
        id: 1002,
        name: '金曜日',
        priority: 1,
        condition: { type: 'weekdays', days: [5] },
        schedule: [
          { startHour: 6, startMinute: 30, endHour: 7, activity: '起床・瞑想・身支度', color: '#43A047' },
          { startHour: 7, startMinute: 0, endHour: 7, activity: '朝食・部屋掃除10分', color: '#00ACC1' },
          { startHour: 7, startMinute: 30, endHour: 8, activity: '通勤（英語リスニング）', color: '#1E88E5' },
          { startHour: 8, startMinute: 30, endHour: 12, activity: '午前の業務', color: '#5E35B1' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼休み', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 18, activity: '午後の業務', color: '#5E35B1' },
          { startHour: 18, startMinute: 0, endHour: 18, activity: '退勤', color: '#1E88E5' },
          { startHour: 18, startMinute: 30, endHour: 19, activity: '帰宅・着替え', color: '#43A047' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '夕食（外食 or 自炊）', color: '#00ACC1' },
          { startHour: 20, startMinute: 0, endHour: 21, activity: '週次振り返り・来週の計画', color: '#FDD835' },
          { startHour: 21, startMinute: 0, endHour: 23, activity: '自由時間（友人と過ごす等）', color: '#D81B60' },
          { startHour: 23, startMinute: 0, endHour: 6, activity: '就寝', color: '#78909C' }
        ]
      },
      {
        id: 1003,
        name: '休日',
        priority: 1,
        condition: { type: 'weekdays', days: [0, 6] },
        schedule: [
          { startHour: 7, startMinute: 30, endHour: 8, activity: '起床・瞑想', color: '#43A047' },
          { startHour: 8, startMinute: 0, endHour: 9, activity: '朝食・掃除', color: '#00ACC1' },
          { startHour: 9, startMinute: 0, endHour: 11, activity: '副業 or ポートフォリオ改善', color: '#5E35B1' },
          { startHour: 11, startMinute: 0, endHour: 12, activity: 'TOEIC学習（集中）', color: '#1E88E5' },
          { startHour: 12, startMinute: 0, endHour: 13, activity: '昼食', color: '#FB8C00' },
          { startHour: 13, startMinute: 0, endHour: 15, activity: '引っ越し物件見学 or 確定申告作業', color: '#E53935' },
          { startHour: 15, startMinute: 0, endHour: 16, activity: '筋トレ or ジョギング', color: '#E53935' },
          { startHour: 16, startMinute: 0, endHour: 17, activity: '作り置き料理', color: '#00ACC1' },
          { startHour: 17, startMinute: 0, endHour: 19, activity: '自由時間（読書・散歩・趣味）', color: '#D81B60' },
          { startHour: 19, startMinute: 0, endHour: 20, activity: '夕食', color: '#FB8C00' },
          { startHour: 20, startMinute: 0, endHour: 21, activity: '来週の準備・振り返り', color: '#FDD835' },
          { startHour: 21, startMinute: 0, endHour: 22, activity: '感謝日記・入浴・リラックス', color: '#43A047' },
          { startHour: 22, startMinute: 30, endHour: 7, activity: '就寝', color: '#78909C' }
        ]
      }
    ],
    reward: {
      selfFeeling: '確定申告から解放される清々しさ',
      selfVisible: '確定申告完了。物件候補3件以上のリスト',
      othersFeeling: '「頼りになるな」と思われる',
      othersVisible: '確定申告の控え。TOEIC模試スコアの推移グラフ'
    },
    support: { supporter: '友人A', content: '引っ越し経験のアドバイスをもらう' }
  });
  console.log('月次目標 完了');

  // ========== 日誌（3ヶ月分、週3-4回ペース） ==========
  const journalEntries = [];

  // 日誌生成ヘルパー
  function makeJournal(dateStr, data) {
    const [y, m] = dateStr.split('-');
    return {
      date: dateStr,
      month: `${y}-${m}`,
      score: data.score || 0,
      scores: data.scores || {},
      scoreItems: [
        { id: 'fullLife', title: '明日死んでも後悔のない1日だったか' },
        { id: 'spiritualFirst', title: '霊主な考え・行動・生き方をしていたか' },
        { id: 'growthAction', title: '成長につながる行動をしたか' }
      ],
      resolution: data.resolution || '',
      tomorrowResolution: data.tomorrowResolution || '',
      reflections: data.reflections || { reflection: '', effort: '', contribution: '', gratitude: '', free: '' },
      schedule: data.schedule || [],
      routines: data.routines || [],
      coreActions: data.coreActions || {
        deadline: { name: '', done: false },
        processing: { name: '', done: false },
        habit: { name: '', done: false },
        other: { name: '', done: false }
      },
      supplement: data.supplement || { sleep: '', work: '', income: 0, expense: 0, calorieIn: 0, calorieOut: 0, weight: 0 },
      timeSchedule: '',
      memo: data.memo || ''
    };
  }

  // 12月のルーティン定義（月次目標のroutinesと一致）
  const decRoutines = [
    { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
    { id: 2, category: 'rei', name: '年末の振り返りノート作成', priority: 2 },
    { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
    { id: 4, category: 'shin', name: '来年の目標ブレスト', priority: 4 },
    { id: 5, category: 'gi', name: '技術記事1本読む', priority: 5 },
    { id: 6, category: 'gi', name: '来年の学習計画作成', priority: 6 },
    { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
    { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
    { id: 9, category: 'sei', name: '大掃除（1日1エリア）', priority: 9 },
    { id: 10, category: 'sei', name: '年賀状作成', priority: 10 }
  ];
  function makeDecRoutines(doneIds, partialIds) {
    return decRoutines.map(r => ({
      ...r,
      done: (doneIds || []).includes(r.id),
      status: (doneIds || []).includes(r.id) ? 'done' : (partialIds || []).includes(r.id) ? 'partial' : 'none'
    }));
  }

  // 12月の日誌（約11日分）
  const dec = [
    { d: '2025-12-02', resolution: '今週中に年末の振り返りリストを作る',
      reflections: { reflection: '仕事が忙しくて振り返りに手がつかなかった', effort: 'プロジェクトのコードレビューを3件完了', contribution: '後輩のバグ修正を手伝った', gratitude: '上司が差し入れしてくれた', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '明日こそ振り返りリストに着手する',
      routines: makeDecRoutines([1, 5, 8], [3]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: false }, habit: { name: '毎朝瞑想', done: false }, other: { name: '忘年会の幹事', done: false } },
      supplement: { sleep: '6.5', weight: 68.2, work: '9:00-18:30' } },
    { d: '2025-12-04', resolution: '振り返りリストに着手する',
      reflections: { reflection: '振り返りリストを半分まで書けた。集中力が切れやすい', effort: '振り返りリスト着手+英語20分', contribution: '同僚の相談に乗った', gratitude: '友人が忘年会の店を予約してくれた', free: '今年は意外と頑張った気がする' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '振り返りリスト完成させる',
      routines: makeDecRoutines([1, 2, 3, 5], [8]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: false }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: false } },
      supplement: { sleep: '7', weight: 68.0, work: '9:00-18:00' } },
    { d: '2025-12-07', resolution: '大掃除第1弾：キッチン',
      reflections: { reflection: 'キッチン掃除完了。思ったより時間かかった', effort: 'キッチン掃除3時間+筋トレ', contribution: '', gratitude: '天気が良くて換気しながら掃除できた', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '明日は風呂場の掃除',
      routines: makeDecRoutines([1, 7, 8, 9], [3]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: false }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: false } },
      supplement: { sleep: '7.5', weight: 67.8, calorieOut: 350 } },
    { d: '2025-12-10', resolution: '来年の目標ブレインストーミング',
      reflections: { reflection: '目標を書き出したが整理が追いつかない', effort: '目標20個書き出し+ポートフォリオ調査', contribution: 'チームの年末レトロスペクティブのファシリ', gratitude: 'チームメンバーが今年の感謝を言い合ったのが良かった', free: '来年は技術力を上げたい' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '目標を5つに絞る',
      routines: makeDecRoutines([1, 2, 3, 4, 5, 8], [7]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: false } },
      supplement: { sleep: '6', weight: 68.5, work: '9:00-19:00', calorieIn: 2200 } },
    { d: '2025-12-13', resolution: '忘年会を楽しむ。飲みすぎない',
      reflections: { reflection: '飲みすぎた...反省', effort: '午前中にジョギング30分できた', contribution: '忘年会で盛り上げ役になれた', gratitude: '友人たちとの時間が楽しかった', free: '来年もこのメンバーで集まりたい' },
      scores: { fullLife: 4, spiritualFirst: 2, growthAction: 2 }, score: 3,
      tomorrowResolution: '二日酔いを治す。夕方から大掃除再開',
      routines: makeDecRoutines([1, 7], [8]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: false }, habit: { name: '毎朝瞑想', done: false }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '5', weight: 69.0, calorieIn: 3500, calorieOut: 250 },
      aiComment: { normal: '忘年会、お疲れ様でした。飲みすぎたのは反省とのことですが、午前中にジョギング30分を実行したのは立派です。楽しむ時は楽しみ、翌日にしっかり切り替える。そのバランス感覚を大事にしてください。', angel: '忘年会、楽しかったんですね! 盛り上げ役になれたのも、あなたの人柄があってこそ。飲みすぎは...まあ、年に1回くらいは許しましょう(笑)。午前中のジョギングを忘れないあたり、根っこの部分はしっかりしてます!', devil: '飲みすぎた反省？ 何回目ですか、それ。「楽しかった」で終わらせてるけど、午前中のジョギング30分で免罪符にしてませんか？ 忘年会の翌日こそ真の自制心が試される。明日の行動で本気度がわかりますよ。', generatedAt: '2025-12-13T23:30:00.000Z' } },
    { d: '2025-12-16', resolution: '大掃除第2弾：リビング+寝室',
      reflections: { reflection: '掃除は順調。来年の目標もだいぶ整理できた', effort: 'リビング掃除+来年目標の優先順位付け', contribution: '', gratitude: 'きれいな部屋は気持ちいい', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 3 }, score: 4,
      tomorrowResolution: '英語学習の教材を選ぶ',
      routines: makeDecRoutines([1, 3, 4, 8, 9], [2]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: false }, processing: { name: 'F・BOXの年末整理', done: false }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '7', weight: 68.3, calorieOut: 200 } },
    { d: '2025-12-19', resolution: '仕事納めに向けてタスク整理',
      reflections: { reflection: '年内のタスクを全て洗い出した', effort: 'タスク整理+コードレビュー2件', contribution: '後輩に来年のキャリアについて相談を受けた', gratitude: '充実した1年だったと思える', free: '来年は副業をもっと頑張りたい' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '年賀状を書く',
      routines: makeDecRoutines([1, 3, 5, 6, 8], [7]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: true }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '7', weight: 68.0, work: '9:00-17:30' } },
    { d: '2025-12-22', resolution: '年賀状作成+クリスマスの準備',
      reflections: { reflection: '年賀状10枚書けた。デザインは印刷に頼った', effort: '年賀状+クリスマスケーキ予約', contribution: '実家の母に電話した', gratitude: '家族が元気でいてくれる', free: 'クリスマスは一人だけど自分へのご褒美を買おう' },
      scores: { fullLife: 3, spiritualFirst: 4, growthAction: 2 }, score: 3,
      tomorrowResolution: '来年の目標を最終版にまとめる',
      routines: makeDecRoutines([1, 3, 8, 10], []),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: true }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: false }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '7.5', weight: 67.8 } },
    { d: '2025-12-25', resolution: 'メリークリスマス。自分へのご褒美day',
      reflections: { reflection: '良い休日になった。来年への気持ちが整った', effort: '来年の目標最終版完成!', contribution: '友人にクリスマスメッセージを送った', gratitude: '健康で年を越せそう', free: '自分へのご褒美にワイヤレスイヤホン買った' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 3 }, score: 4,
      tomorrowResolution: '年末は実家でゆっくりする',
      routines: makeDecRoutines([1, 2, 3, 4, 6, 8], []),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: true }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '8', weight: 67.5, calorieIn: 2800 } },
    { d: '2025-12-28', resolution: '実家でリラックスしつつ来年の準備',
      reflections: { reflection: '実家は落ち着く。母の手料理が美味しい', effort: '来年の月別ざっくり計画を作成', contribution: '実家の掃除を手伝った', gratitude: '家族と過ごす時間', free: '来年は定期的に帰省しよう' },
      scores: { fullLife: 5, spiritualFirst: 5, growthAction: 3 }, score: 4,
      tomorrowResolution: '大晦日は今年の感謝で締めくくる',
      routines: makeDecRoutines([1, 2, 3, 4, 8, 9], [7]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: true }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '8', weight: 68.5, calorieIn: 2500 } },
    { d: '2025-12-31', resolution: '1年の感謝を込めて年越し',
      reflections: { reflection: '今年は松村メソッドを始めて生活が整い始めた', effort: '年末の振り返りノート完成!', contribution: '実家の片付けを最後まで手伝った', gratitude: '今年出会った全ての人に感謝', free: '来年はもっと良い1年にする。具体的に行動する' },
      scores: { fullLife: 5, spiritualFirst: 5, growthAction: 4 }, score: 5,
      tomorrowResolution: '2026年、最高のスタートを切る',
      routines: makeDecRoutines([1, 2, 3, 4, 5, 6, 7, 8, 9], [10]),
      coreActions: { deadline: { name: '確定申告準備（領収書整理）', done: true }, processing: { name: 'F・BOXの年末整理', done: true }, habit: { name: '毎朝瞑想', done: true }, other: { name: '忘年会の幹事', done: true } },
      supplement: { sleep: '6', weight: 69.0, calorieIn: 3000 } },
  ];

  // 1月のルーティン定義
  const janRoutines = [
    { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
    { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
    { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
    { id: 4, category: 'shin', name: '新しいことに1つチャレンジ', priority: 4 },
    { id: 5, category: 'gi', name: '技術記事1本読む', priority: 5 },
    { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
    { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
    { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
    { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
    { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
  ];
  function makeJanRoutines(doneIds, partialIds) {
    return janRoutines.map(r => ({
      ...r,
      done: (doneIds || []).includes(r.id),
      status: (doneIds || []).includes(r.id) ? 'done' : (partialIds || []).includes(r.id) ? 'partial' : 'none'
    }));
  }

  // 1月の日誌（約12日分）
  const jan = [
    { d: '2026-01-04', resolution: '正月ボケを吹き飛ばす。通常モード開始',
      reflections: { reflection: '正月で3日間ダラダラしてしまった。今日から切り替え', effort: '英語リスニング20分再開。筋トレも再開', contribution: '', gratitude: '正月休みがあるのはありがたい', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '朝6:30に起きる。瞑想10分',
      routines: makeJanRoutines([1, 6, 7], [8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: false }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: false } },
      supplement: { sleep: '7', weight: 70.0 } },
    { d: '2026-01-06', resolution: '朝6:30起き+瞑想',
      reflections: { reflection: '6:45に起きた。あと15分早くしたい', effort: '瞑想10分+英語20分+筋トレ', contribution: '同僚の新年挨拶で良い雰囲気を作れた', gratitude: '新年早々やる気がある自分に感謝', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '英語リスニングを通勤時間に定着させる',
      routines: makeJanRoutines([1, 2, 3, 6, 7], [8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: false }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: false } },
      supplement: { sleep: '6.5', weight: 69.5, work: '9:00-18:00' } },
    { d: '2026-01-08', resolution: 'ポートフォリオの設計に着手',
      reflections: { reflection: 'ワイヤーフレームを描き始めた。デザインセンスの無さを痛感', effort: 'ポートフォリオWF着手+技術記事2本読んだ', contribution: '', gratitude: 'Figmaが無料で使えるのありがたい', free: 'デザインは参考サイトを真似よう' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'ワイヤーフレーム完成させる',
      routines: makeJanRoutines([1, 2, 4, 5, 6], [3, 9]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: false }, processing: { name: 'F・BOX週次整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: false } },
      supplement: { sleep: '7', weight: 69.0, work: '9:00-18:30' } },
    { d: '2026-01-11', resolution: '英語学習30日チャレンジ開始',
      reflections: { reflection: '英語学習のアプリを3つ試した。Duolingo+TOEICリスニングに決定', effort: '英語30分+筋トレ+ポートフォリオWF修正', contribution: '友人に英語学習のアドバイスをした', gratitude: '週末に時間が取れること', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: '英語学習を通勤で完全に習慣化',
      routines: makeJanRoutines([1, 2, 4, 6, 7, 10], [3, 8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: false } },
      supplement: { sleep: '7.5', weight: 68.5, calorieOut: 400 },
      aiComment: { normal: '英語学習30日チャレンジ、素晴らしい取り組みです。アプリの選定も終わり、いよいよ本格スタートですね。通勤時間の活用は効率的です。ただ、30日連続という目標は途中で途切れると挫折しやすいので、「途切れても翌日再開すればOK」というルールも心に留めておいてください。', angel: '30日チャレンジ、始動おめでとうございます! 「アプリを3つ試して2つに絞った」という行動力が素晴らしい。やみくもに始めるんじゃなく、ちゃんと選んでから始めるのがあなたらしい。筋トレもポートフォリオもやりつつの英語、本当に頑張ってますね!', devil: '30日チャレンジ、何回目のチャレンジですか？ アプリ選びに時間をかけすぎてません？ 選んでる時間が一番楽しくて、実際にやるのは面倒...ってパターンじゃないですよね？ 結果で証明してください。1ヶ月後のスコアで答え合わせしましょう。', generatedAt: '2026-01-11T23:00:00.000Z' } },
    { d: '2026-01-13', resolution: '通勤で英語リスニング定着',
      reflections: { reflection: '通勤中のリスニングが定着してきた。行き20分ちょうど', effort: '英語20分+コードレビュー2件', contribution: '新入社員のオンボーディング資料を更新した', gratitude: '電車が空いてて座れた（リスニングに集中できた）', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '筋トレをサボらない',
      routines: makeJanRoutines([1, 5, 6, 8], [2, 9]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: false } },
      supplement: { sleep: '6.5', weight: 68.5, work: '9:00-18:30' } },
    { d: '2026-01-15', resolution: '筋トレ再開。正月太りを解消',
      reflections: { reflection: '筋トレ30分やったが体力落ちてる...', effort: '筋トレ30分+英語20分', contribution: '', gratitude: '体が動くことに感謝', free: '正月太り+2kgは1月中に戻したい' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオのコーディング開始',
      routines: makeJanRoutines([1, 2, 6, 7], [3, 8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '7', weight: 69.0, calorieOut: 350 } },
    { d: '2026-01-18', resolution: 'ポートフォリオ実装開始（Next.js）',
      reflections: { reflection: 'Next.jsのセットアップ完了。Tailwind CSSも導入した', effort: 'ポートフォリオ実装2時間+英語20分', contribution: '', gratitude: '技術の進歩で開発が楽になってる', free: 'create-next-appすごい。5分でセットアップ終わった' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'トップページのレイアウト実装',
      routines: makeJanRoutines([1, 2, 4, 5, 6, 9], [8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '6', weight: 68.5 } },
    { d: '2026-01-20', resolution: 'トップページ実装',
      reflections: { reflection: 'トップページの8割完成。レスポンシブが難しい', effort: 'ポートフォリオ実装3時間+英語20分+筋トレ', contribution: '技術ブログにNext.jsの記事を書き始めた', gratitude: '集中できる時間が取れた', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'トップページ完成+プロジェクト一覧ページ着手',
      routines: makeJanRoutines([1, 2, 5, 6, 7, 10], [3, 9]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '7', weight: 68.0, calorieIn: 2100, calorieOut: 300 } },
    { d: '2026-01-22', resolution: 'プロジェクト一覧ページ着手',
      reflections: { reflection: '仕事が忙しくてポートフォリオに手がつかなかった', effort: '英語20分は死守した', contribution: 'チームのバグ対応をリードした', gratitude: '忙しくても英語だけは続けられている', free: '仕事の繁忙期と自己学習の両立が課題' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '週末にまとめてポートフォリオ進める',
      routines: makeJanRoutines([1, 6], [2, 8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '5.5', weight: 68.5, work: '9:00-21:00' } },
    { d: '2026-01-25', resolution: '週末集中：ポートフォリオ+作り置き',
      reflections: { reflection: 'ポートフォリオのプロジェクト一覧ページ完成!', effort: 'ポートフォリオ5時間+作り置き3品+筋トレ', contribution: '', gratitude: '週末の時間は貴重。有効に使えた', free: '自炊の作り置きは時間の先行投資' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 5 }, score: 5,
      tomorrowResolution: '家賃振込忘れずに',
      routines: makeJanRoutines([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], []),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '8', weight: 67.8, calorieIn: 1900, calorieOut: 400 } },
    { d: '2026-01-27', resolution: '月末の振り返りと来月の計画',
      reflections: { reflection: '1月の目標達成率は70%くらい。英語は定着した。ポートフォリオはやや遅れ', effort: '月次振り返り+2月の計画+英語20分', contribution: '同僚Bと英語学習の進捗報告会した', gratitude: '英語学習を27日連続できた', free: '2月はポートフォリオ完成を最優先にする' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオの残りタスク洗い出し',
      routines: makeJanRoutines([1, 2, 3, 5, 6, 8], [9, 10]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '7', weight: 67.5, work: '9:00-18:00' } },
    { d: '2026-01-29', resolution: 'ポートフォリオの残り作業リストアップ',
      reflections: { reflection: '残り作業: 詳細ページ、スキルセクション、コンタクトフォーム、デプロイ', effort: '作業リスト+スキルセクション着手', contribution: '', gratitude: '計画を立てると安心する', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'スキルセクション完成',
      routines: makeJanRoutines([1, 5, 6, 9], [2, 8]),
      coreActions: { deadline: { name: 'ポートフォリオのワイヤーフレーム作成', done: true }, processing: { name: 'F・BOX週次整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: '新年会参加', done: true } },
      supplement: { sleep: '6.5', weight: 67.5 } },
  ];

  // 2月のルーティン定義
  const febRoutines = [
    { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
    { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
    { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
    { id: 4, category: 'shin', name: 'Notionで振り返りメモ', priority: 4 },
    { id: 5, category: 'gi', name: 'ポートフォリオ実装（1日1時間）', priority: 5 },
    { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
    { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
    { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
    { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
    { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
  ];
  function makeFebRoutines(doneIds, partialIds) {
    return febRoutines.map(r => ({
      ...r,
      done: (doneIds || []).includes(r.id),
      status: (doneIds || []).includes(r.id) ? 'done' : (partialIds || []).includes(r.id) ? 'partial' : 'none'
    }));
  }

  // 2月の日誌（約12日分）
  const feb = [
    { d: '2026-02-01', resolution: '2月開始。ポートフォリオ完成に向けて全力',
      reflections: { reflection: 'スキルセクション完成。デザインがいい感じ', effort: 'ポートフォリオ2時間+英語20分+瞑想10分', contribution: '', gratitude: '新しい月が始まるワクワク感', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 5 }, score: 4,
      tomorrowResolution: '詳細ページ着手',
      routines: makeFebRoutines([1, 2, 3, 5, 6, 8], [9]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: false } },
      supplement: { sleep: '7', weight: 67.5 } },
    { d: '2026-02-04', resolution: 'プロジェクト詳細ページ実装',
      reflections: { reflection: '詳細ページの7割完成。画像の最適化に手間取った', effort: 'ポートフォリオ3時間+筋トレ+英語', contribution: '後輩にReactのhooksを教えた', gratitude: '教えることで自分の理解も深まる', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: '詳細ページ完成+コンタクトフォーム',
      routines: makeFebRoutines([1, 2, 5, 6, 7], [3, 10]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: false } },
      supplement: { sleep: '6.5', weight: 67.2, work: '9:00-18:30', calorieOut: 300 } },
    { d: '2026-02-07', resolution: 'コンタクトフォーム実装+確定申告の領収書整理開始',
      reflections: { reflection: 'コンタクトフォーム完成。SendGridで送信テスト成功', effort: 'ポートフォリオ+領収書整理30分', contribution: '', gratitude: '技術的な問題を自力で解決できた喜び', free: '確定申告の領収書が思ったより多い...' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオのレスポンシブ対応',
      routines: makeFebRoutines([1, 4, 5, 6, 8, 10], [2]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: false } },
      supplement: { sleep: '7', weight: 67.0, work: '9:00-18:00' } },
    { d: '2026-02-10', resolution: 'レスポンシブ対応+カード支払い確認',
      reflections: { reflection: 'レスポンシブほぼ完了。iPad対応が少し怪しい', effort: 'レスポンシブ対応4時間+カード明細確認', contribution: 'チームMTGで良いアイデアを出せた', gratitude: 'Tailwind CSSのレスポンシブが簡単', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'TOEIC模試を週末に受ける',
      routines: makeFebRoutines([1, 2, 5, 6], [3, 8]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: false } },
      supplement: { sleep: '6', weight: 67.0, work: '9:00-19:00' } },
    { d: '2026-02-13', resolution: '週末TOEIC模試+ポートフォリオ微調整',
      reflections: { reflection: 'TOEIC模試結果: 630点。目標の650に20点足りず', effort: '模試2時間+ポートフォリオ微調整+筋トレ', contribution: '', gratitude: 'スコアは確実に上がっている（580→630）', free: 'リスニングは伸びたがリーディングが弱い。Part5対策を強化' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'Part5の文法問題を毎日10問',
      routines: makeFebRoutines([1, 2, 5, 6, 7], [4, 10]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7', weight: 67.5, calorieIn: 2000 },
      aiComment: { normal: 'TOEIC模試630点、580点からの50点アップは着実な前進です。リスニングの伸びは毎日20分の通勤学習の成果ですね。リーディング、特にPart5の文法問題を毎日10問やる計画は的確です。あと20点、十分に射程圏内です。', angel: '580→630点、50点アップおめでとうございます! たった1ヶ月半でこの伸び、すごいですよ。リスニングが伸びたのは毎日コツコツ続けた証拠。Part5対策を加えれば650は余裕で超えられます。自分をもっと褒めてあげてください!', devil: '650点目標に対して630点。「20点足りなかった」じゃなくて「目標未達」でしょ。リスニングは伸びた？ 当たり前です、毎日やってるんだから。問題はリーディングを放置してたこと。Part5対策は最初からやるべきだった。計画の甘さを反省してください。', generatedAt: '2026-02-13T22:00:00.000Z' } },
    { d: '2026-02-16', resolution: 'ポートフォリオの最終調整+Vercelデプロイ準備',
      reflections: { reflection: 'デプロイ準備完了。環境変数の設定で少し迷った', effort: 'ポートフォリオ3時間+英語30分(Part5強化)', contribution: '', gratitude: 'Vercelが無料なのがありがたい', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'デプロイ実行!',
      routines: makeFebRoutines([1, 2, 4, 5, 6, 9], [8]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: false }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7', weight: 67.0 } },
    { d: '2026-02-18', resolution: 'ポートフォリオデプロイ!',
      reflections: { reflection: 'デプロイ成功!! URLを友人と同僚に共有した', effort: 'デプロイ+バグ修正2件+英語20分', contribution: '同僚Cにコードレビューしてもらった', gratitude: '完成させた達成感がすごい。Cのレビューも的確で助かった', free: '2ヶ月かかったけどやり切った。これは自信になる' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 5 }, score: 5,
      tomorrowResolution: 'ポートフォリオ完成の余韻に浸りつつ確定申告にシフト',
      routines: makeFebRoutines([1, 2, 3, 4, 5, 6, 8], [7, 10]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: false }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '6', weight: 67.0, calorieIn: 2200 },
      aiComment: { normal: 'ポートフォリオデプロイ完了、おめでとうございます! 2ヶ月間、仕事と並行しながらやり切ったのは本当に立派です。同僚にコードレビューしてもらえる関係性も素晴らしい。次は確定申告ですが、この達成感を糧に一気に片付けましょう。', angel: 'デプロイ成功おめでとう!! 2ヶ月前は「デザインセンスの無さを痛感」と言っていたのに、今や友人や同僚に堂々と共有できるサイトを作り上げた。その成長を誇りに思ってください。バグ修正2件もしっかりやって、品質にもこだわるところ、さすがです!', devil: 'デプロイ成功、よかったですね。でも「2ヶ月かかった」のは予定通りですか？ 途中で仕事が忙しくて手が止まった期間、ありましたよね。次の確定申告は期限がある。ポートフォリオのように「やる気が出た時にやる」方式だと間に合いませんよ。計画的にいきましょう。', generatedAt: '2026-02-18T23:30:00.000Z' } },
    { d: '2026-02-20', resolution: '確定申告に本格着手',
      reflections: { reflection: 'freeeに収入データを入力。領収書があと半分残ってる', effort: '確定申告2時間+英語20分', contribution: '', gratitude: 'freeeが計算してくれるので楽', free: '副業の経費計上で迷うところがある。税理士に聞くか' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '領収書の残り半分を片付ける',
      routines: makeFebRoutines([1, 2, 6, 8], [4, 10]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7', weight: 67.0, work: '9:00-18:00' } },
    { d: '2026-02-22', resolution: '領収書整理完了目標',
      reflections: { reflection: '領収書全部入力完了! あとはe-Tax送信の準備', effort: '確定申告3時間+筋トレ30分', contribution: '', gratitude: '面倒な作業を終わらせた解放感', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: 'e-Taxの事前準備（マイナンバーカード等）',
      routines: makeFebRoutines([1, 4, 7, 8, 9], [2]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: false }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7.5', weight: 66.8, calorieOut: 350 } },
    { d: '2026-02-24', resolution: 'e-Tax準備+TOEIC Part5',
      reflections: { reflection: 'マイナンバーカードの読み取りでハマった。スマホアプリで解決', effort: 'e-Tax準備+TOEIC Part5 20問+英語リスニング20分', contribution: '友人にe-Taxのやり方を教えた', gratitude: 'スマホでマイナンバー読み取れるの便利', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '確定申告の下書き完成',
      routines: makeFebRoutines([1, 2, 6, 10], [3, 8]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '6.5', weight: 67.0, work: '9:00-18:00' } },
    { d: '2026-02-26', resolution: '確定申告下書き完成',
      reflections: { reflection: '下書き完成! 還付金が3.2万円になりそう', effort: '確定申告下書き+英語20分', contribution: '', gratitude: '還付金嬉しい', free: '3月前半で提出してしまおう' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '月末の振り返り+3月の計画',
      routines: makeFebRoutines([1, 2, 4, 6, 8], [9]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7', weight: 66.8 } },
    { d: '2026-02-28', resolution: '2月の振り返り+3月計画',
      reflections: { reflection: 'ポートフォリオ完成、確定申告ほぼ完了。良い月だった', effort: '月次振り返り+3月計画+筋トレ', contribution: '英語学習仲間のBさんと進捗報告', gratitude: '目標を達成できた月。自分を褒めたい', free: '3月は確定申告提出+引っ越し検討+TOEIC追い込み' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '3月1日、確定申告提出から始める',
      routines: makeFebRoutines([1, 2, 3, 4, 6, 7, 8, 9, 10], [5]),
      coreActions: { deadline: { name: 'ポートフォリオデプロイ（2/28まで）', done: true }, processing: { name: '確定申告書類整理', done: true }, habit: { name: '英語リスニング毎日', done: true }, other: { name: 'TOEIC模試を1回受ける', done: true } },
      supplement: { sleep: '7.5', weight: 66.5, calorieIn: 1950, calorieOut: 300 } },
  ];

  // 3月のルーティン定義
  const marRoutines = [
    { id: 1, category: 'rei', name: '感謝日記', priority: 1 },
    { id: 2, category: 'rei', name: '10分瞑想', priority: 2 },
    { id: 3, category: 'shin', name: 'ポジティブセルフトーク', priority: 3 },
    { id: 4, category: 'shin', name: 'Notionで振り返りメモ', priority: 4 },
    { id: 5, category: 'gi', name: 'TOEIC問題集（Part5/6）30分', priority: 5 },
    { id: 6, category: 'gi', name: '英語リスニング20分', priority: 6 },
    { id: 7, category: 'tai', name: '筋トレ30分', priority: 7 },
    { id: 8, category: 'tai', name: '7時間睡眠', priority: 8 },
    { id: 9, category: 'sei', name: '部屋掃除10分', priority: 9 },
    { id: 10, category: 'sei', name: '自炊（1日1食）', priority: 10 }
  ];
  function makeMarRoutines(doneIds, partialIds) {
    return marRoutines.map(r => ({
      ...r,
      done: (doneIds || []).includes(r.id),
      status: (doneIds || []).includes(r.id) ? 'done' : (partialIds || []).includes(r.id) ? 'partial' : 'none'
    }));
  }

  // 3月の日誌（15件、3/1〜3/15）
  const mar = [
    { d: '2026-03-01', resolution: '3月スタート。確定申告を最優先で片付ける',
      reflections: { reflection: 'e-Taxの下書きを最終確認した。数字に間違いがないか不安だったが、freeeの出力と一致していた', effort: '確定申告最終確認1.5時間+英語リスニング20分+TOEIC Part5 15問', contribution: '', gratitude: '2月に書類整理を終わらせておいてよかった。過去の自分に感謝', free: '3月は確定申告→物件探し→TOEIC追い込みの順で進める' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '確定申告の最終チェックリストを作る',
      routines: makeMarRoutines([1, 2, 3, 5, 6, 8, 10], [4]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: false }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7', weight: 66.5, calorieIn: 2000 } },
    { d: '2026-03-02', resolution: '確定申告チェックリスト消化+TOEIC集中',
      reflections: { reflection: 'チェックリスト8割消化。副業の交通費の計上漏れを1件発見して修正した', effort: '確定申告チェック2時間+TOEIC Part5/6 30分+英語リスニング20分+筋トレ30分', contribution: '', gratitude: '細かい見落としに気づけてよかった', free: '明日は仕事だけど、帰宅後に残りのチェック項目を終わらせたい' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'チェックリスト残り2割を完了させる',
      routines: makeMarRoutines([1, 2, 5, 6, 7, 9, 10], [3, 8]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: false }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '6.5', weight: 66.5, calorieOut: 350 } },
    { d: '2026-03-03', resolution: 'チェックリスト完了+不動産サイトで物件検索開始',
      reflections: { reflection: '確定申告のチェックリスト全完了! 送信はもう少し確認してからにする。SUUMOとHOMESで物件を10件ピックアップした', effort: '確定申告チェック完了+物件検索1時間+英語20分+TOEIC Part5 10問', contribution: '同僚にSUUMOの使い方のコツを教えた', gratitude: '確定申告の山場を越えた安心感', free: '物件探しワクワクする。駅近で1Kの良い物件が意外とある' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '不動産会社に条件を伝えて予約を入れる',
      routines: makeMarRoutines([1, 2, 3, 4, 5, 6, 8], [10]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: false }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7', weight: 66.3, work: '9:00-18:00' } },
    { d: '2026-03-04', resolution: '不動産会社に電話する+TOEIC Part5対策',
      reflections: { reflection: '不動産会社1社に電話したが、もう1社は営業時間外で繋がらなかった。TOEIC Part5を25問解いて正答率76%。品詞問題は得意だが語彙問題が弱い', effort: 'TOEIC Part5 25問+英語リスニング25分+不動産会社1社電話', contribution: '同僚のデプロイトラブルを一緒に解決した', gratitude: '不動産会社の担当者が丁寧で安心した', free: '明日もう1社に電話する。TOEIC語彙対策のアプリも探してみよう' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '2社目の不動産会社に電話+TOEIC語彙強化',
      routines: makeMarRoutines([1, 2, 5, 6, 10], [3, 8]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '6.5', weight: 66.5, work: '9:00-18:30', calorieIn: 2050 } },
    { d: '2026-03-05', resolution: '月次定例ミーティング。確定申告は週末に送信する',
      reflections: { reflection: '月次定例でQ1の進捗報告。自分の担当部分は順調と評価してもらえた。不動産会社2社に電話して条件を伝えた。土曜に1件目の見学予約が取れた', effort: '定例MTG+不動産2社電話+英語20分+TOEIC Part5 15問', contribution: '定例MTGで新しい技術提案をした（GraphQL導入）', gratitude: '上司から「頑張ってるね」と言われた', free: 'GraphQL提案、通るといいな。チームの効率が上がるはず' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 5 }, score: 4,
      tomorrowResolution: '確定申告を今週中にe-Taxで送信する',
      routines: makeMarRoutines([1, 2, 3, 5, 6], [4, 8]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: false }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '6.5', weight: 66.5, work: '9:00-18:30', calorieIn: 2100 } },
    { d: '2026-03-06', resolution: 'TOEIC学習50分を死守する日',
      reflections: { reflection: 'Part5を20問+Part6を2セット+リスニング20分で計55分達成。Part6の文挿入問題が苦手だと判明', effort: 'TOEIC 55分+技術記事1本+筋トレ20分', contribution: '', gratitude: '苦手を発見できたのは前進', free: 'Part6の対策を今週のTOEIC学習に組み込む' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'Part6対策を重点的にやる。確定申告送信準備',
      routines: makeMarRoutines([1, 5, 6, 9, 10], [2, 7]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: false }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7', weight: 66.3, work: '9:00-18:00', calorieOut: 200 } },
    { d: '2026-03-07', resolution: '物件見学1件目(土曜)+確定申告送信',
      reflections: { reflection: '物件見学1件目: 駅徒歩8分1K、築10年、家賃8.2万。日当たり良好で好印象。帰宅後にe-Taxで確定申告を送信した! 受付番号をスクショ保存', effort: '物件見学+確定申告送信+TOEIC Part6 2セット+筋トレ30分', contribution: '', gratitude: '確定申告が終わった解放感! 3/10目標の前に完了できた', free: '物件1件目は良かったけど、あと2件は見て比較したい。来週も見学予約入れよう' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '確定申告完了の達成感を味わいつつ、TOEIC集中day',
      routines: makeMarRoutines([1, 2, 3, 4, 5, 7, 8, 9], [6, 10]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: false }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7.5', weight: 66.0, calorieIn: 2300, calorieOut: 400 },
      aiComment: { normal: '確定申告送信完了、お疲れ様でした。3/10目標に対して3/7で達成、素晴らしい前倒しです。物件見学も並行して進め、日当たりや立地もしっかりチェックしている。あと2件見て比較するという冷静な判断も良いですね。TOEIC学習もこの調子で。', angel: '確定申告完了、おめでとうございます!! 目標の3/10より3日も早い! 12月から少しずつ準備して、2月に書類整理して、計画通りにここまで来た。あなたの「先を見据えて少しずつ進める力」は本当にすごいです。物件も良さそうなの見つかって、3月はいい月になりそうですね!', devil: '確定申告完了、当然ですよね。2月中にほぼ終わってたんだから、送信ボタン押しただけでしょ。物件見学1件目で「好印象」って言ってますけど、1件目って大体よく見えるもんですよ。冷静に比較表を作って判断してください。TOEICのPart6対策も始めたばかり。まだまだこれからです。', generatedAt: '2026-03-07T22:00:00.000Z' } },
    { d: '2026-03-08', resolution: 'TOEIC集中day。確定申告が終わった勢いで',
      reflections: { reflection: '確定申告が終わって気持ちに余裕ができた。TOEIC模試を1セット解いた。結果: 推定660点。前回の630から30点UP', effort: 'TOEIC模試フル2時間+リスニング復習30分+筋トレ', contribution: '英語学習仲間のBさんに確定申告のコツを共有した', gratitude: 'TOEICスコアが着実に上がっている', free: '660点は嬉しい。あと40点で700。4月本番まであと1ヶ月、いける気がする' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 5 }, score: 5,
      tomorrowResolution: 'TOEIC弱点分析して残り1ヶ月の計画を立てる',
      routines: makeMarRoutines([1, 2, 3, 4, 5, 6, 7, 8, 10], [9]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '8', weight: 66.0, calorieIn: 2000, calorieOut: 300 } },
    { d: '2026-03-09', resolution: 'TOEIC弱点分析+物件2件目の見学予約',
      reflections: { reflection: '弱点分析: Part5の時制問題とPart7のダブルパッセージが弱い。物件2件目は来週土曜に予約取れた。3件目も検討中', effort: 'TOEIC弱点分析+学習計画作成+Part5時制問題20問+英語リスニング20分', contribution: '', gratitude: '弱点が明確になると対策しやすい', free: '母の誕生日プレゼント、そろそろ考えないと。花+何かもう1つ？' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'TOEIC時制問題の集中対策。母のプレゼント候補を調べる',
      routines: makeMarRoutines([1, 2, 4, 5, 6, 8, 9], [3]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7.5', weight: 66.2, calorieIn: 1900 } },
    { d: '2026-03-10', resolution: 'TOEIC時制問題集中+母のプレゼント候補調べ',
      reflections: { reflection: '時制問題を30問解いた。正答率が65%→80%に上がった。母のプレゼントはブリザードフラワー+スイーツセットに決定', effort: 'TOEIC時制30問+リスニング20分+母プレゼント調査30分', contribution: 'チームの若手に設計レビューのフィードバック', gratitude: '集中できる環境があること', free: 'プレゼントは楽天で注文予定。3/22までに注文すれば間に合う' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: 'Part7ダブルパッセージの対策を始める',
      routines: makeMarRoutines([1, 2, 3, 5, 6, 10], [4, 8]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '6.5', weight: 66.3, work: '9:00-18:30' } },
    { d: '2026-03-11', resolution: 'Part7ダブルパッセージ対策開始',
      reflections: { reflection: 'Part7のダブルパッセージ5セット解いた。時間配分が課題。1セットに5分以上かけると全体が間に合わない', effort: 'Part7対策40分+リスニング20分+筋トレ30分', contribution: '', gratitude: '毎日少しずつでも積み重ねている自分に感謝', free: '花粉がきつくなってきた。薬を飲み始めた' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'Part7の速読トレーニング。花粉対策を万全に',
      routines: makeMarRoutines([1, 5, 6, 7], [2, 8, 9]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '6.5', weight: 66.5, work: '9:00-18:00', calorieOut: 300 },
      aiComment: { normal: '花粉シーズンが始まりましたね。体調管理しながらTOEIC対策を続けているのは立派です。Part7の時間配分の課題を自分で分析できているのが良い。速読力は一朝一夕には伸びませんが、毎日の積み重ねが効きます。薬を早めに飲み始めたのも正しい判断です。', angel: '花粉きついですよね...でもそんな中でもTOEIC学習を続けて、筋トレまでやってる。しかもPart7の時間配分という具体的な課題まで見つけてる。「毎日少しずつでも積み重ねている自分に感謝」、この気持ちを忘れないでください!', devil: '花粉を言い訳にしてませんか？ 薬飲んでるなら問題ないでしょ。Part7の速読力が足りないのは、普段から英語の長文を読む習慣がないから。TOEIC対策だけじゃなく、英語ニュース記事を毎日1本読むくらいのことしてますか？', generatedAt: '2026-03-11T23:00:00.000Z' } },
    { d: '2026-03-12', resolution: '歯医者予約日。TOEIC速読トレーニング',
      reflections: { reflection: '歯医者の定期検診、問題なし。帰りに英語ニュースアプリを入れて、通勤でリーディングも始めることにした', effort: 'TOEIC Part7速読3セット+リスニング20分+歯医者', contribution: '', gratitude: '歯が健康なのは嬉しい', free: '英語ニュースアプリ、BBC Learning Englishが良さそう' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'BBC Learning Englishで毎日1記事を習慣にする',
      routines: makeMarRoutines([1, 2, 5, 6, 8], [3, 10]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: false } },
      supplement: { sleep: '7', weight: 66.3, work: '9:00-14:00(午後半休)' } },
    { d: '2026-03-13', resolution: '母のプレゼントを楽天で注文する',
      reflections: { reflection: '楽天でブリザードフラワー+スイーツセットを注文完了。配送日を3/24に指定。メッセージカードも付けた', effort: 'プレゼント注文+TOEIC Part5/7 40分+英語リスニング20分+筋トレ20分', contribution: '後輩のPR(プルリクエスト)にレビューコメント', gratitude: '母への感謝の気持ちを形にできた', free: 'メッセージに何を書くか悩んだけど、素直に「いつもありがとう」で十分だと思った' },
      scores: { fullLife: 4, spiritualFirst: 5, growthAction: 4 }, score: 4,
      tomorrowResolution: '物件2件目の見学は明後日土曜。事前に周辺環境を調べる',
      routines: makeMarRoutines([1, 2, 3, 4, 5, 6, 9], [7, 8]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: true } },
      supplement: { sleep: '6.5', weight: 66.5, work: '9:00-18:00', calorieIn: 2100 } },
    { d: '2026-03-14', resolution: '物件2件目の周辺環境調査+TOEIC対策',
      reflections: { reflection: 'Google Mapsで物件2件目の周辺を調べた。スーパーが近くて便利そう。ただ線路沿いで騒音が心配。明日実際に確認する', effort: '物件調査+TOEIC Part5/6 30問+英語リスニング25分+BBC記事1本', contribution: '同僚Bと英語学習の進捗報告。Bさんも模試受けて600点超えたらしい', gratitude: '切磋琢磨できる仲間がいること', free: '土曜の物件見学、楽しみ。引っ越したら通勤が20分短くなる' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '物件2件目見学。3件目の予約も入れたい',
      routines: makeMarRoutines([1, 2, 4, 5, 6, 8, 10], [3, 9]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: true } },
      supplement: { sleep: '7', weight: 66.3, work: '9:00-18:00' },
      aiComment: { normal: '確定申告完了、母のプレゼント手配完了と、3月の重要タスクを着実にクリアしていますね。物件見学も2件目に進み、周辺環境まで事前調査しているのが計画的です。TOEIC学習も毎日50分ペースを維持できている。同僚Bさんとの切磋琢磨も良い刺激になっているようです。', angel: '3月のタスク、どんどんクリアしてますね! 確定申告は期限前に完了、母へのプレゼントも心のこもったメッセージ付き、物件探しも計画的に進行中。しかもBさんとの英語報告会で互いにモチベーションを高め合ってる。こういう「仲間と一緒に成長する姿勢」が素敵です!', devil: 'タスクは進んでますけど、物件選びが甘くないですか？ 「スーパーが近い」「線路沿いで騒音心配」...Google Mapsで調べただけで満足してません？ 騒音の問題は住んでからでは遅いですよ。明日の見学では、窓を開けた状態で5分間立ってみてください。それで許容できるか判断しましょう。', generatedAt: '2026-03-14T22:30:00.000Z' } },
    { d: '2026-03-15', resolution: '物件2件目見学+3件目予約+TOEIC追い込み',
      reflections: { reflection: '物件2件目を見学。駅徒歩6分、1K、築5年、家賃8.4万。スーパー徒歩2分は最高。線路の音は窓を閉めればほぼ気にならないレベルだった。3件目は来週木曜の夕方に予約が取れた', effort: '物件見学+TOEIC Part7 3セット+リスニング20分+筋トレ30分', contribution: '', gratitude: '良い物件に出会えた。不動産屋さんも親切だった', free: '2件目が今のところ一番良い。3件目を見てから決めたい。比較表をNotionで作ろう' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: 'Notionで物件比較表を作成。TOEIC Part7の速読を強化',
      routines: makeMarRoutines([1, 2, 3, 4, 5, 6, 7, 8, 9], [10]),
      coreActions: { deadline: { name: '確定申告提出（3/15期限、3/10目標）', done: true }, processing: { name: '引っ越し物件リストアップ', done: true }, habit: { name: 'TOEIC学習毎日50分', done: true }, other: { name: '母の誕生日プレゼント手配', done: true } },
      supplement: { sleep: '7.5', weight: 66.0, calorieIn: 2100, calorieOut: 400 } },
  ];

  // 全日誌を保存（日付を現在時点に調整）
  for (const entry of [...dec, ...jan, ...feb, ...mar]) {
    entry.d = seedDate(entry.d);
    const j = makeJournal(entry.d, entry);
    await saveData('journals', j);
  }
  console.log('日誌 完了 (' + (dec.length + jan.length + feb.length + mar.length) + '件)');

  // ========== 資料 ==========
  const materials = [
    { title: '確定申告の手順メモ', content: '1. freeeに収入入力\n2. 領収書をスキャンして経費登録\n3. e-Taxで送信\n4. 控えをPDF保存', fileType: 'text' },
    { title: 'ポートフォリオ参考サイト集', content: 'https://portfolio-example1.com\nhttps://portfolio-example2.com\nhttps://dribbble.com/shots/popular', fileType: 'url' },
    { title: 'TOEIC学習法まとめ', content: 'Part3/4: シャドーイング中心\nPart5: 文法問題集を毎日10問\nPart6: 文脈理解の練習\nPart7: 速読トレーニング', fileType: 'text' },
    { title: '引っ越しチェックリスト', content: '□ 物件見学（3件以上）\n□ 不動産会社に条件伝える\n□ 引越し業者の見積もり（3社）\n□ 退去通知（1ヶ月前）\n□ 住所変更手続き\n□ ライフライン切替', fileType: 'text' },
  ];
  for (const m of materials) {
    const mat = createMaterialData(m.title, {
      content: m.content,
      fileType: m.fileType || 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await saveData('materials', mat);
  }
  console.log('資料 完了');

  console.log('=== シードデータ投入完了 ===');
  console.log('ページをリロードしてください');
}
