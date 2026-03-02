// 3ヶ月分のサンプルデータ投入スクリプト
// 田中健太（28歳・IT企業Webエンジニア）が2025年12月から使用開始した想定

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
    { type: 'urgent', title: 'カード明細を確認する', status: 'open', scope: '個人' },
    { type: 'urgent', title: '○○さんにLINE返信（飲み会の件）', status: 'open', scope: '個人' },
    { type: 'urgent', title: '薬局でコンタクト受け取り', status: 'open', scope: '個人' },
    { type: 'urgent', title: 'チームSlackで進捗報告', status: 'done', scope: '社会' },
    // アクション
    { type: 'action', title: 'Vue.js 3の公式チュートリアル進める', status: 'in_progress', scope: '社会',
      motivation: 'スキルアップして転職の選択肢を広げる。今の年収+100万も夢じゃない', timeStart: '21:00', timeEnd: '22:00' },
    { type: 'action', title: 'ジム入会手続き（エニタイム駅前店）', status: 'open', scope: '個人',
      motivation: '健康診断でメタボ予備軍と言われた。このままだと30歳でヤバい' },
    { type: 'action', title: 'スーツをクリーニングに出す', status: 'open', scope: '個人' },
    { type: 'action', title: '「影響力の武器」読み終わる', status: 'in_progress', scope: '個人',
      motivation: '営業チームとの会話で知識を活かせる。読書習慣の維持にもなる' },
    { type: 'action', title: '部屋の本棚を整理する', status: 'open', scope: '個人' },
    { type: 'action', title: 'iPhoneのバックアップを取る', status: 'open', scope: '個人' },
    { type: 'action', title: '歯医者の定期検診予約する', status: 'open', scope: '個人' },
    { type: 'action', title: 'プレゼン資料のテンプレート作成', status: 'open', scope: '社会',
      motivation: '毎回ゼロから作る時間がもったいない。テンプレ化で1時間は短縮できる' },
    { type: 'action', title: '友人Aとの飲み会の店を探す（新宿周辺）', status: 'open', scope: '個人' },
    { type: 'action', title: '実家に送る写真をアルバムにまとめる', status: 'open', scope: '個人' },
    { type: 'action', title: 'AWS認定の参考書を買う', status: 'done', scope: '社会' },
    // プロジェクト
    { type: 'project', title: 'ポートフォリオサイトリニューアル', status: 'in_progress', scope: '社会',
      completionCriteria: 'Vercelにデプロイ完了してURL共有できる状態。最低5作品掲載。レスポンシブ対応済み',
      motivation: '転職活動で必須。今のサイトは3年前のもので恥ずかしい',
      notes: 'Next.js + Tailwind CSSで構築中。デザインはFigmaで作成済み' },
    { type: 'project', title: '確定申告（副業分）', status: 'in_progress', scope: '個人',
      completionCriteria: 'e-Taxで送信完了。還付金の振込確認まで',
      notes: '副業の収入: 約45万円。経費の領収書整理が残っている' },
    { type: 'project', title: '引っ越し検討', status: 'open', scope: '個人',
      completionCriteria: '新居の契約完了＋引越し業者確定＋引越し日決定',
      motivation: '今の家は駅から遠くて通勤がきつい。家賃は上がるが時間を買う',
      notes: '予算: 家賃8.5万以内。駅徒歩10分以内。1K以上' },
    { type: 'project', title: 'TOEIC 700点目標', status: 'in_progress', scope: '社会',
      completionCriteria: '公式試験で700点以上取得',
      motivation: '海外チームとの英語ミーティングで発言できるようになりたい。昇進にも有利',
      notes: '現在スコア: 580点（2025年10月）。4月の試験に申込済み' },
    // 待機
    { type: 'waiting', title: '管理会社から更新書類の返送待ち', status: 'open', scope: '個人',
      who: '○○不動産（担当: 佐藤さん）', deadline: '2026-03-15' },
    { type: 'waiting', title: 'Aさんからプロジェクトの仕様確認返答', status: 'open', scope: '社会',
      who: '田村（チームリーダー）', deadline: '2026-03-05',
      notes: '2/28にSlackで確認送信済み' },
    { type: 'waiting', title: 'リフォーム見積もり結果', status: 'open', scope: '個人',
      who: '○○工務店', deadline: '2026-03-20',
      notes: '実家のキッチン改修。親から頼まれた' },
    { type: 'waiting', title: '健康診断の結果', status: 'open', scope: '個人',
      who: '○○クリニック', deadline: '2026-03-10' },
    { type: 'waiting', title: 'フリーランス案件の返事', status: 'open', scope: '社会',
      who: '○○エージェント（山田さん）', deadline: '2026-03-08',
      notes: 'React案件。時給4500円。週2リモート' },
    // カレンダー
    { type: 'calendar', title: 'チームミーティング（月次定例）', status: 'open', scope: '社会',
      dateTime: '2026-03-05', timeStart: '10:00', timeEnd: '11:00' },
    { type: 'calendar', title: '歯医者予約', status: 'open', scope: '個人',
      dateTime: '2026-03-12', timeStart: '14:00', timeEnd: '14:30' },
    { type: 'calendar', title: '友人Bの結婚式', status: 'open', scope: '個人',
      dateTime: '2026-04-15', timeStart: '11:00', timeEnd: '16:00',
      notes: '場所: 青山○○ホテル。ご祝儀3万円。二次会あり' },
    { type: 'calendar', title: 'TOEIC受験日', status: 'open', scope: '社会',
      dateTime: '2026-04-12', timeStart: '13:00', timeEnd: '15:30',
      notes: '会場: ○○大学。受験票を忘れないこと' },
    { type: 'calendar', title: '母の誕生日', status: 'open', scope: '個人',
      dateTime: '2026-03-25',
      notes: '花を贈る。楽天で注文済み（配送日指定3/24）' },
    { type: 'calendar', title: '確定申告期限', status: 'open', scope: '個人',
      dateTime: '2026-03-15',
      notes: 'e-Taxで提出。3/10までに終わらせたい' },
    { type: 'calendar', title: '部署の歓迎会', status: 'open', scope: '社会',
      dateTime: '2026-04-03', timeStart: '19:00',
      notes: '新入社員歓迎。幹事は自分。店は予約済み（新宿○○）' },
    // いつかやりたい
    { type: 'wish', title: 'プログラミングスクールで講師してみたい', status: 'open', scope: '社会' },
    { type: 'wish', title: '屋久島に行きたい（縄文杉トレッキング）', status: 'open', scope: '個人' },
    { type: 'wish', title: '自作キーボード組み立て', status: 'open', scope: '個人',
      notes: 'Keychron Q1がベース？ 部品代3万くらい' },
    { type: 'wish', title: 'ブログを定期的に書く（技術ブログ）', status: 'open', scope: '社会',
      notes: 'Zenn or はてなブログ。月2本ペース' },
    { type: 'wish', title: 'ギターを再開する', status: 'open', scope: '個人',
      notes: '大学時代に弾いてた。アコギは実家にある' },
    { type: 'wish', title: '料理のレパートリーを30品にする', status: 'open', scope: '個人' },
    { type: 'wish', title: '投資信託以外の投資を勉強する', status: 'open', scope: '個人',
      notes: '米国個別株？ 仮想通貨？ まずは勉強から' },
    { type: 'wish', title: 'キャンプ用品を揃えてソロキャンプ', status: 'open', scope: '個人' },
    { type: 'wish', title: '技術書の読書会を社内で主催する', status: 'open', scope: '社会' },
    { type: 'wish', title: 'Rustを学ぶ', status: 'open', scope: '社会',
      notes: 'Wasm周りで使える。The Bookから始める' },
    { type: 'wish', title: '瞑想を本格的に習慣にする（マインドフルネス）', status: 'open', scope: '個人' },
    { type: 'wish', title: '海外テックカンファレンスに参加する', status: 'open', scope: '社会',
      notes: 'React Conf or Google I/O。来年以降？' },
    { type: 'wish', title: '副業で月10万安定させる', status: 'open', scope: '社会' },
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
      deadline: t.deadline || '',
      dateTime: t.dateTime || '',
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
    { type: 'goal', title: '感謝日記（3つ書く）', scope: '個人',
      motivation: '感謝できることに目を向けると幸福度が上がる研究結果がある。実際にやると気持ちが落ち着く',
      trigger: '就寝前、布団に入ったら',
      routineManual: 'スマホのメモアプリを開いて、今日感謝できること3つを書く。大きなことでなくていい。「天気が良かった」レベルでOK',
      preparation: '22:30までに風呂を済ませる',
      minimumSetting: '1つだけでも書く' },
    { type: 'goal', title: '10分間の瞑想', scope: '個人',
      motivation: '集中力が上がる。イライラが減る。やらないと一日中雑念に振り回される',
      trigger: '朝起きて顔を洗った直後',
      routineManual: 'タイマーを10分セット。あぐらで座る。呼吸に意識を向ける。雑念が来ても追わずに呼吸に戻す',
      preparation: '朝6:30に起きる（アラーム2つ）',
      minimumSetting: '3分だけ深呼吸する' },
    { type: 'goal', title: 'ポジティブなセルフトーク', scope: '個人',
      motivation: '自己肯定感を上げる。ネガティブな独り言をやめる。思考が行動を変える',
      trigger: 'ネガティブな考えが浮かんだ時、鏡を見た時',
      routineManual: '否定的な言葉を言い換える。「ダメだ」→「ここから改善できる」。朝鏡の前で「今日もいい日になる」と言う',
      preparation: '洗面台に付箋でリマインド',
      minimumSetting: '朝1回だけ「大丈夫」と言う' },
    { type: 'goal', title: '新しいことに1つチャレンジ', scope: '個人',
      motivation: 'コンフォートゾーンから出ることで成長する。小さくてもいいから毎日何か新しいことをする',
      trigger: '夕方、仕事が終わった後',
      routineManual: '新しい道を歩く、新しい食材で料理する、話したことない人に話しかける、等。大小問わず',
      preparation: '特になし',
      minimumSetting: 'いつもと違うコンビニに行く程度でもOK' },
    { type: 'goal', title: '技術記事を1本読む', scope: '社会',
      motivation: 'エンジニアとしての市場価値を維持する。知識が古くなると一気に不利になる',
      trigger: '昼休みの後半15分',
      routineManual: 'Zenn, Qiita, dev.toのトレンドから1本選んで読む。読んだらNotionに要点メモ',
      preparation: 'RSSリーダーに登録済み',
      minimumSetting: 'タイトルと概要だけ見て1つブックマーク' },
    { type: 'goal', title: '英語リスニング20分', scope: '社会',
      motivation: 'TOEICスコアアップに直結。海外チームとの会議で聞き取れなくて恥ずかしい思いをしたくない',
      trigger: '通勤電車の中（往路）',
      routineManual: 'TOEICリスニング問題集のPart3/4を再生。シャドーイングも可。スマホにダウンロード済み',
      preparation: 'イヤホンを忘れない。前日夜にカバンにセット',
      minimumSetting: '10分だけでも聞く' },
    { type: 'goal', title: '筋トレ30分', scope: '個人',
      motivation: '健康診断の結果が悪化してる。体型もだらしなくなってきた。30歳までに体を作り直す',
      trigger: '仕事から帰宅して着替えた直後',
      routineManual: '月水金: 上半身（腕立て、ダンベル）。火木: 下半身（スクワット、ランジ）。YouTubeのトレーニング動画に合わせる',
      preparation: 'トレーニングウェアを出しておく。プロテインを用意',
      minimumSetting: 'スクワット20回だけ' },
    { type: 'goal', title: '7時間睡眠確保', scope: '個人',
      motivation: '睡眠不足だとパフォーマンスが50%以下になる。集中力も判断力も落ちる',
      trigger: '23:00になったらスマホを置く',
      routineManual: '23:00にナイトモード発動。23:30就寝→6:30起床。寝る前にスマホを見ない',
      preparation: '22:30までに風呂・歯磨き完了',
      minimumSetting: '最低6時間は確保する' },
    { type: 'goal', title: '部屋の掃除（最低10分）', scope: '個人',
      motivation: '散らかった部屋だと集中できない。人を呼べない。掃除すると気持ちもスッキリする',
      trigger: '朝食後、出勤前の10分',
      routineManual: '月: 掃除機。火: トイレ。水: 風呂。木: キッチン。金: 拭き掃除。各10分程度',
      preparation: '掃除道具は出しやすい場所に',
      minimumSetting: 'テーブルの上だけ片付ける' },
    { type: 'goal', title: '自炊（1日1食以上）', scope: '個人',
      motivation: '外食ばかりだと不健康＋お金がかかる。自炊すると食費が半分になる',
      trigger: '夕食時',
      routineManual: '平日は簡単なもの（パスタ、炒め物）。週末に作り置き。レシピはクラシルアプリ',
      preparation: '週末にまとめ買い。冷凍ストックを切らさない',
      minimumSetting: '味噌汁だけでも作る' },
    { type: 'goal', title: 'Notionで今日の振り返りメモ', scope: '個人',
      motivation: '振り返りをしないと同じ失敗を繰り返す。成長の記録にもなる',
      trigger: '日誌を書く直前',
      routineManual: '今日やったこと、学んだこと、改善点を3行で書く。長く書かなくていい',
      preparation: 'Notionテンプレートは作成済み',
      minimumSetting: '1行だけでも書く' },
    // 義務
    { type: 'obligation', title: '家賃振込（毎月25日）', scope: '個人',
      trigger: '毎月23日にリマインダー',
      routineManual: '三井住友銀行アプリから振込。金額: 72,000円。振込先は登録済み',
      frequency: '毎月25日' },
    { type: 'obligation', title: 'カード支払い確認（毎月10日）', scope: '個人',
      trigger: '毎月8日にリマインダー',
      routineManual: '三井住友カードアプリで明細確認。不正利用がないかチェック。残高確認',
      frequency: '毎月10日' },
    { type: 'obligation', title: '勤怠報告（毎日）', scope: '社会',
      trigger: '出勤時と退勤時',
      routineManual: '勤怠管理システムにログイン→打刻。残業がある場合は事前申請',
      frequency: '毎日' },
    { type: 'obligation', title: 'ゴミ出し', scope: '個人',
      trigger: '前日の夜にゴミをまとめる',
      routineManual: '火曜: 燃えるゴミ。金曜: 燃えないゴミ+ペットボトル。第2・4水曜: 段ボール',
      frequency: '火・金' },
    { type: 'obligation', title: '国民年金支払い確認', scope: '個人',
      trigger: '毎月月末',
      routineManual: '口座振替で自動引き落とし。通帳で確認',
      frequency: '毎月' },
    // 維持
    { type: 'maintenance', title: '歯医者定期検診', scope: '個人',
      trigger: '前回から3ヶ月経ったら予約',
      routineManual: '○○歯科（駅前）に電話予約。土曜午前が取りやすい',
      frequency: '3ヶ月ごと' },
    { type: 'maintenance', title: '美容室', scope: '個人',
      trigger: '髪が耳にかかり始めたら',
      routineManual: 'Hot Pepper Beautyで予約。いつもの店（○○HAIR）。カット+シャンプーで4,400円',
      frequency: '2ヶ月ごと' },
    { type: 'maintenance', title: '部屋の換気', scope: '個人',
      trigger: '朝起きたらすぐ',
      routineManual: '対角線上の窓を2つ開ける。15分以上。冬でも最低5分',
      frequency: '毎日' },
    { type: 'maintenance', title: '爪切り', scope: '個人',
      trigger: '日曜の風呂上がり',
      routineManual: '手足の爪を切る。爪やすりで整える',
      frequency: '週1' },
    { type: 'maintenance', title: '洗濯', scope: '個人',
      trigger: '洗濯カゴが半分以上たまったら',
      routineManual: '洗剤+柔軟剤。タオル類は分けて洗う。干す時はハンガーに',
      frequency: '週2-3回' },
    // 指針
    { type: 'principle', title: '嘘をつかない', scope: '個人',
      motivation: '信頼は一度失うと取り戻せない。誠実さが全ての土台',
      routineManual: '事実をそのまま伝える。言いにくいことでも正直に。ただし相手を傷つける必要はない' },
    { type: 'principle', title: '約束を守る', scope: '個人',
      motivation: '約束を守る人は信頼される。守れない約束はしない',
      routineManual: '約束したらすぐカレンダーに入れる。難しくなったら早めに伝える' },
    { type: 'principle', title: '感情で判断しない（一晩置く）', scope: '個人',
      motivation: '怒りや焦りで決めたことは大体間違い。冷静な時に判断する',
      routineManual: '重要な決断は一晩置く。メールの返信も感情的な時は下書き保存' },
    { type: 'principle', title: '人の話を最後まで聞く', scope: '個人',
      motivation: '途中で遮ると相手は話す気をなくす。最後まで聞いてから話す',
      routineManual: '相手が話し終わるまで黙って聞く。相槌を打つ。話が終わってから自分の意見を言う' },
    // 候補
    { type: 'candidate', title: '朝活コミュニティに参加？', scope: '個人',
      notes: '6:00-7:00のオンライン朝活。Twitterで見かけた。続くかわからない' },
    { type: 'candidate', title: '週末ボランティア？', scope: '個人',
      notes: '子ども食堂のIT支援。月1回。興味はあるが時間的に厳しいかも' },
    { type: 'candidate', title: 'AWS認定取得？', scope: '社会',
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
    { goal: 'シニアエンジニアに昇進する', deadlineYear: 2027, deadlineMonth: 12,
      milestones: [
        { year: 2026, month: 6, goal: 'ポートフォリオ完成・AWS認定取得' },
        { year: 2026, month: 12, goal: 'チーム内で技術的リードを2件以上担当' },
        { year: 2027, month: 6, goal: '昇進面談に向けた実績まとめ' },
        { year: 2027, month: 12, goal: '昇進' }
      ]},
    { goal: '副業収入を月15万円安定させる', deadlineYear: 2027, deadlineMonth: 6,
      milestones: [
        { year: 2026, month: 3, goal: '確定申告完了・経理の仕組み化' },
        { year: 2026, month: 6, goal: '月5万円安定' },
        { year: 2026, month: 12, goal: '月10万円安定' },
        { year: 2027, month: 6, goal: '月15万円安定' }
      ]},
    { goal: 'TOEIC 800点取得', deadlineYear: 2026, deadlineMonth: 10,
      milestones: [
        { year: 2026, month: 4, goal: '700点（4月試験）' },
        { year: 2026, month: 7, goal: '750点（7月試験）' },
        { year: 2026, month: 10, goal: '800点（10月試験）' }
      ]}
  ];
  for (const g of longTermGoals) {
    await saveLongTermGoal(g);
  }
  console.log('長期目標 完了');

  // ========== 月次目標（3ヶ月分） ==========
  // 2025年12月
  await saveMonthlyGoal({
    yearMonth: '2025-12',
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
    reward: {
      selfFeeling: '今年1年やり切った充実感',
      selfVisible: '振り返りノート完成、来年の目標リスト',
      othersFeeling: '「しっかりしてるね」と言われる',
      othersVisible: 'きれいな部屋、整理された計画'
    },
    support: { supporter: '友人A（同じく目標設定する仲間）', content: '互いの目標を共有して月1回進捗報告' }
  });

  // 2026年1月
  await saveMonthlyGoal({
    yearMonth: '2026-01',
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
    reward: {
      selfFeeling: '生活リズムが整って気持ちいい',
      selfVisible: '英語学習30日連続の記録',
      othersFeeling: '「意識高いね」と感心される',
      othersVisible: 'ポートフォリオの設計図'
    },
    support: { supporter: '同僚B（英語勉強仲間）', content: '週1で英語の進捗を報告し合う' }
  });

  // 2026年2月
  await saveMonthlyGoal({
    yearMonth: '2026-02',
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
    reward: {
      selfFeeling: 'ポートフォリオを完成させた達成感',
      selfVisible: 'デプロイ済みURL。模試スコア650+',
      othersFeeling: '「ちゃんとやってるな」と信頼される',
      othersVisible: '確定申告の準備完了'
    },
    support: { supporter: '同僚C（エンジニア仲間）', content: 'ポートフォリオのコードレビューを依頼' }
  });

  // 2026年3月（今月）
  await saveMonthlyGoal({
    yearMonth: '2026-03',
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

  // 12月の日誌（約12日分）
  const dec = [
    { d: '2025-12-02', resolution: '今週中に年末の振り返りリストを作る',
      reflections: { reflection: '仕事が忙しくて振り返りに手がつかなかった', effort: 'プロジェクトのコードレビューを3件完了', contribution: '後輩のバグ修正を手伝った', gratitude: '上司が差し入れしてくれた', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '明日こそ振り返りリストに着手する',
      supplement: { sleep: '6.5', weight: 68.2 } },
    { d: '2025-12-04', resolution: '振り返りリストに着手する',
      reflections: { reflection: '振り返りリストを半分まで書けた。集中力が切れやすい', effort: '振り返りリスト着手+英語20分', contribution: '同僚の相談に乗った', gratitude: '友人が忘年会の店を予約してくれた', free: '今年は意外と頑張った気がする' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '振り返りリスト完成させる',
      supplement: { sleep: '7', weight: 68.0 } },
    { d: '2025-12-07', resolution: '大掃除第1弾：キッチン',
      reflections: { reflection: 'キッチン掃除完了。思ったより時間かかった', effort: 'キッチン掃除3時間+筋トレ', contribution: '', gratitude: '天気が良くて換気しながら掃除できた', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '明日は風呂場の掃除',
      supplement: { sleep: '7.5', weight: 67.8 } },
    { d: '2025-12-10', resolution: '来年の目標ブレインストーミング',
      reflections: { reflection: '目標を書き出したが整理が追いつかない', effort: '目標20個書き出し+ポートフォリオ調査', contribution: 'チームの年末レトロスペクティブのファシリ', gratitude: 'チームメンバーが今年の感謝を言い合ったのが良かった', free: '来年は技術力を上げたい' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '目標を5つに絞る',
      supplement: { sleep: '6', weight: 68.5 } },
    { d: '2025-12-13', resolution: '忘年会を楽しむ。飲みすぎない',
      reflections: { reflection: '飲みすぎた...反省', effort: '午前中にジョギング30分できた', contribution: '忘年会で盛り上げ役になれた', gratitude: '友人たちとの時間が楽しかった', free: '来年もこのメンバーで集まりたい' },
      scores: { fullLife: 4, spiritualFirst: 2, growthAction: 2 }, score: 3,
      tomorrowResolution: '二日酔いを治す。夕方から大掃除再開',
      supplement: { sleep: '5', weight: 69.0, expense: 8500 } },
    { d: '2025-12-16', resolution: '大掃除第2弾：リビング+寝室',
      reflections: { reflection: '掃除は順調。来年の目標もだいぶ整理できた', effort: 'リビング掃除+来年目標の優先順位付け', contribution: '', gratitude: 'きれいな部屋は気持ちいい', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 3 }, score: 4,
      tomorrowResolution: '英語学習の教材を選ぶ',
      supplement: { sleep: '7', weight: 68.3 } },
    { d: '2025-12-19', resolution: '仕事納めに向けてタスク整理',
      reflections: { reflection: '年内のタスクを全て洗い出した', effort: 'タスク整理+コードレビュー2件', contribution: '後輩に来年のキャリアについて相談を受けた', gratitude: '充実した1年だったと思える', free: '来年は副業をもっと頑張りたい' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '年賀状を書く',
      supplement: { sleep: '7', weight: 68.0 } },
    { d: '2025-12-22', resolution: '年賀状作成+クリスマスの準備',
      reflections: { reflection: '年賀状10枚書けた。デザインは印刷に頼った', effort: '年賀状+クリスマスケーキ予約', contribution: '実家の母に電話した', gratitude: '家族が元気でいてくれる', free: 'クリスマスは一人だけど自分へのご褒美を買おう' },
      scores: { fullLife: 3, spiritualFirst: 4, growthAction: 2 }, score: 3,
      tomorrowResolution: '来年の目標を最終版にまとめる',
      supplement: { sleep: '7.5', weight: 67.8 } },
    { d: '2025-12-25', resolution: 'メリークリスマス。自分へのご褒美day',
      reflections: { reflection: '良い休日になった。来年への気持ちが整った', effort: '来年の目標最終版完成!', contribution: '友人にクリスマスメッセージを送った', gratitude: '健康で年を越せそう', free: '自分へのご褒美にワイヤレスイヤホン買った' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 3 }, score: 4,
      tomorrowResolution: '年末は実家でゆっくりする',
      supplement: { sleep: '8', weight: 67.5, expense: 15000 } },
    { d: '2025-12-28', resolution: '実家でリラックスしつつ来年の準備',
      reflections: { reflection: '実家は落ち着く。母の手料理が美味しい', effort: '来年の月別ざっくり計画を作成', contribution: '実家の掃除を手伝った', gratitude: '家族と過ごす時間', free: '来年は定期的に帰省しよう' },
      scores: { fullLife: 5, spiritualFirst: 5, growthAction: 3 }, score: 4,
      tomorrowResolution: '大晦日は今年の感謝で締めくくる',
      supplement: { sleep: '8', weight: 68.5 } },
    { d: '2025-12-31', resolution: '1年の感謝を込めて年越し',
      reflections: { reflection: '今年は松村メソッドを始めて生活が整い始めた', effort: '年末の振り返りノート完成!', contribution: '実家の片付けを最後まで手伝った', gratitude: '今年出会った全ての人に感謝', free: '来年はもっと良い1年にする。具体的に行動する' },
      scores: { fullLife: 5, spiritualFirst: 5, growthAction: 4 }, score: 5,
      tomorrowResolution: '2026年、最高のスタートを切る',
      supplement: { sleep: '6', weight: 69.0 } },
  ];

  // 1月の日誌（約14日分）
  const jan = [
    { d: '2026-01-04', resolution: '正月ボケを吹き飛ばす。通常モード開始',
      reflections: { reflection: '正月で3日間ダラダラしてしまった。今日から切り替え', effort: '英語リスニング20分再開。筋トレも再開', contribution: '', gratitude: '正月休みがあるのはありがたい', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '朝6:30に起きる。瞑想10分',
      supplement: { sleep: '7', weight: 70.0 } },
    { d: '2026-01-06', resolution: '朝6:30起き+瞑想',
      reflections: { reflection: '6:45に起きた。あと15分早くしたい', effort: '瞑想10分+英語20分+筋トレ', contribution: '同僚の新年挨拶で良い雰囲気を作れた', gratitude: '新年早々やる気がある自分に感謝', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '英語リスニングを通勤時間に定着させる',
      supplement: { sleep: '6.5', weight: 69.5 } },
    { d: '2026-01-08', resolution: 'ポートフォリオの設計に着手',
      reflections: { reflection: 'ワイヤーフレームを描き始めた。デザインセンスの無さを痛感', effort: 'ポートフォリオWF着手+技術記事2本読んだ', contribution: '', gratitude: 'Figmaが無料で使えるのありがたい', free: 'デザインは参考サイトを真似よう' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'ワイヤーフレーム完成させる',
      supplement: { sleep: '7', weight: 69.0 } },
    { d: '2026-01-11', resolution: '英語学習30日チャレンジ開始',
      reflections: { reflection: '英語学習のアプリを3つ試した。Duolingo+TOEICリスニングに決定', effort: '英語30分+筋トレ+ポートフォリオWF修正', contribution: '友人に英語学習のアドバイスをした', gratitude: '週末に時間が取れること', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: '英語学習を通勤で完全に習慣化',
      supplement: { sleep: '7.5', weight: 68.5 } },
    { d: '2026-01-13', resolution: '通勤で英語リスニング定着',
      reflections: { reflection: '通勤中のリスニングが定着してきた。行き20分ちょうど', effort: '英語20分+コードレビュー2件', contribution: '新入社員のオンボーディング資料を更新した', gratitude: '電車が空いてて座れた（リスニングに集中できた）', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '筋トレをサボらない',
      supplement: { sleep: '6.5', weight: 68.5 } },
    { d: '2026-01-15', resolution: '筋トレ再開。正月太りを解消',
      reflections: { reflection: '筋トレ30分やったが体力落ちてる...', effort: '筋トレ30分+英語20分', contribution: '', gratitude: '体が動くことに感謝', free: '正月太り+2kgは1月中に戻したい' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオのコーディング開始',
      supplement: { sleep: '7', weight: 69.0 } },
    { d: '2026-01-18', resolution: 'ポートフォリオ実装開始（Next.js）',
      reflections: { reflection: 'Next.jsのセットアップ完了。Tailwind CSSも導入した', effort: 'ポートフォリオ実装2時間+英語20分', contribution: '', gratitude: '技術の進歩で開発が楽になってる', free: 'create-next-appすごい。5分でセットアップ終わった' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'トップページのレイアウト実装',
      supplement: { sleep: '6', weight: 68.5 } },
    { d: '2026-01-20', resolution: 'トップページ実装',
      reflections: { reflection: 'トップページの8割完成。レスポンシブが難しい', effort: 'ポートフォリオ実装3時間+英語20分+筋トレ', contribution: '技術ブログにNext.jsの記事を書き始めた', gratitude: '集中できる時間が取れた', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'トップページ完成+プロジェクト一覧ページ着手',
      supplement: { sleep: '7', weight: 68.0 } },
    { d: '2026-01-22', resolution: 'プロジェクト一覧ページ着手',
      reflections: { reflection: '仕事が忙しくてポートフォリオに手がつかなかった', effort: '英語20分は死守した', contribution: 'チームのバグ対応をリードした', gratitude: '忙しくても英語だけは続けられている', free: '仕事の繁忙期と自己学習の両立が課題' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '週末にまとめてポートフォリオ進める',
      supplement: { sleep: '5.5', weight: 68.5 } },
    { d: '2026-01-25', resolution: '週末集中：ポートフォリオ+作り置き',
      reflections: { reflection: 'ポートフォリオのプロジェクト一覧ページ完成!', effort: 'ポートフォリオ5時間+作り置き3品+筋トレ', contribution: '', gratitude: '週末の時間は貴重。有効に使えた', free: '自炊の作り置きは時間の先行投資' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 5 }, score: 5,
      tomorrowResolution: '家賃振込忘れずに',
      supplement: { sleep: '8', weight: 67.8 } },
    { d: '2026-01-27', resolution: '月末の振り返りと来月の計画',
      reflections: { reflection: '1月の目標達成率は70%くらい。英語は定着した。ポートフォリオはやや遅れ', effort: '月次振り返り+2月の計画+英語20分', contribution: '同僚Bと英語学習の進捗報告会した', gratitude: '英語学習を27日連続できた', free: '2月はポートフォリオ完成を最優先にする' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオの残りタスク洗い出し',
      supplement: { sleep: '7', weight: 67.5 } },
    { d: '2026-01-29', resolution: 'ポートフォリオの残り作業リストアップ',
      reflections: { reflection: '残り作業: 詳細ページ、スキルセクション、コンタクトフォーム、デプロイ', effort: '作業リスト+スキルセクション着手', contribution: '', gratitude: '計画を立てると安心する', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'スキルセクション完成',
      supplement: { sleep: '6.5', weight: 67.5 } },
  ];

  // 2月の日誌（約13日分）
  const feb = [
    { d: '2026-02-01', resolution: '2月開始。ポートフォリオ完成に向けて全力',
      reflections: { reflection: 'スキルセクション完成。デザインがいい感じ', effort: 'ポートフォリオ2時間+英語20分+瞑想10分', contribution: '', gratitude: '新しい月が始まるワクワク感', free: '' },
      scores: { fullLife: 4, spiritualFirst: 4, growthAction: 5 }, score: 4,
      tomorrowResolution: '詳細ページ着手',
      supplement: { sleep: '7', weight: 67.5 } },
    { d: '2026-02-04', resolution: 'プロジェクト詳細ページ実装',
      reflections: { reflection: '詳細ページの7割完成。画像の最適化に手間取った', effort: 'ポートフォリオ3時間+筋トレ+英語', contribution: '後輩にReactのhooksを教えた', gratitude: '教えることで自分の理解も深まる', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: '詳細ページ完成+コンタクトフォーム',
      supplement: { sleep: '6.5', weight: 67.2 } },
    { d: '2026-02-07', resolution: 'コンタクトフォーム実装+確定申告の領収書整理開始',
      reflections: { reflection: 'コンタクトフォーム完成。SendGridで送信テスト成功', effort: 'ポートフォリオ+領収書整理30分', contribution: '', gratitude: '技術的な問題を自力で解決できた喜び', free: '確定申告の領収書が思ったより多い...' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'ポートフォリオのレスポンシブ対応',
      supplement: { sleep: '7', weight: 67.0 } },
    { d: '2026-02-10', resolution: 'レスポンシブ対応+カード支払い確認',
      reflections: { reflection: 'レスポンシブほぼ完了。iPad対応が少し怪しい', effort: 'レスポンシブ対応4時間+カード明細確認', contribution: 'チームMTGで良いアイデアを出せた', gratitude: 'Tailwind CSSのレスポンシブが簡単', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 4 }, score: 4,
      tomorrowResolution: 'TOEIC模試を週末に受ける',
      supplement: { sleep: '6', weight: 67.0 } },
    { d: '2026-02-13', resolution: '週末TOEIC模試+ポートフォリオ微調整',
      reflections: { reflection: 'TOEIC模試結果: 630点。目標の650に20点足りず', effort: '模試2時間+ポートフォリオ微調整+筋トレ', contribution: '', gratitude: 'スコアは確実に上がっている（580→630）', free: 'リスニングは伸びたがリーディングが弱い。Part5対策を強化' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: 'Part5の文法問題を毎日10問',
      supplement: { sleep: '7', weight: 67.5 } },
    { d: '2026-02-16', resolution: 'ポートフォリオの最終調整+Vercelデプロイ準備',
      reflections: { reflection: 'デプロイ準備完了。環境変数の設定で少し迷った', effort: 'ポートフォリオ3時間+英語30分(Part5強化)', contribution: '', gratitude: 'Vercelが無料なのがありがたい', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 5 }, score: 4,
      tomorrowResolution: 'デプロイ実行!',
      supplement: { sleep: '7', weight: 67.0 } },
    { d: '2026-02-18', resolution: 'ポートフォリオデプロイ!',
      reflections: { reflection: 'デプロイ成功!! URLを友人と同僚に共有した', effort: 'デプロイ+バグ修正2件+英語20分', contribution: '同僚Cにコードレビューしてもらった', gratitude: '完成させた達成感がすごい。Cのレビューも的確で助かった', free: '2ヶ月かかったけどやり切った。これは自信になる' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 5 }, score: 5,
      tomorrowResolution: 'ポートフォリオ完成の余韻に浸りつつ確定申告にシフト',
      supplement: { sleep: '6', weight: 67.0 } },
    { d: '2026-02-20', resolution: '確定申告に本格着手',
      reflections: { reflection: 'freeeに収入データを入力。領収書があと半分残ってる', effort: '確定申告2時間+英語20分', contribution: '', gratitude: 'freeeが計算してくれるので楽', free: '副業の経費計上で迷うところがある。税理士に聞くか' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '領収書の残り半分を片付ける',
      supplement: { sleep: '7', weight: 67.0 } },
    { d: '2026-02-22', resolution: '領収書整理完了目標',
      reflections: { reflection: '領収書全部入力完了! あとはe-Tax送信の準備', effort: '確定申告3時間+筋トレ30分', contribution: '', gratitude: '面倒な作業を終わらせた解放感', free: '' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: 'e-Taxの事前準備（マイナンバーカード等）',
      supplement: { sleep: '7.5', weight: 66.8 } },
    { d: '2026-02-24', resolution: 'e-Tax準備+TOEIC Part5',
      reflections: { reflection: 'マイナンバーカードの読み取りでハマった。スマホアプリで解決', effort: 'e-Tax準備+TOEIC Part5 20問+英語リスニング20分', contribution: '友人にe-Taxのやり方を教えた', gratitude: 'スマホでマイナンバー読み取れるの便利', free: '' },
      scores: { fullLife: 3, spiritualFirst: 3, growthAction: 4 }, score: 3,
      tomorrowResolution: '確定申告の下書き完成',
      supplement: { sleep: '6.5', weight: 67.0 } },
    { d: '2026-02-26', resolution: '確定申告下書き完成',
      reflections: { reflection: '下書き完成! 還付金が3.2万円になりそう', effort: '確定申告下書き+英語20分', contribution: '', gratitude: '還付金嬉しい', free: '3月前半で提出してしまおう' },
      scores: { fullLife: 4, spiritualFirst: 3, growthAction: 3 }, score: 3,
      tomorrowResolution: '月末の振り返り+3月の計画',
      supplement: { sleep: '7', weight: 66.8 } },
    { d: '2026-02-28', resolution: '2月の振り返り+3月計画',
      reflections: { reflection: 'ポートフォリオ完成、確定申告ほぼ完了。良い月だった', effort: '月次振り返り+3月計画+筋トレ', contribution: '英語学習仲間のBさんと進捗報告', gratitude: '目標を達成できた月。自分を褒めたい', free: '3月は確定申告提出+引っ越し検討+TOEIC追い込み' },
      scores: { fullLife: 5, spiritualFirst: 4, growthAction: 4 }, score: 4,
      tomorrowResolution: '3月1日、確定申告提出から始める',
      supplement: { sleep: '7.5', weight: 66.5 } },
  ];

  // 全日誌を保存
  for (const entry of [...dec, ...jan, ...feb]) {
    const j = makeJournal(entry.d, entry);
    await saveData('journals', j);
  }
  console.log('日誌 完了 (' + (dec.length + jan.length + feb.length) + '件)');

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
