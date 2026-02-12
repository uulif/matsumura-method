/* ========================================
   MM v1.1.0 - ページテンプレート
   SVGアイコン対応・統一デザイン版
   ======================================== */

// HTMLエスケープ
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// カテゴリ名の日本語マッピング
const categoryNames = {
  rei: '霊',
  shin: '心',
  gi: '技',
  tai: '体',
  sei: '生活'
};

// カテゴリアイコン
const categoryIcons = {
  rei: 'star',
  shin: 'help',
  gi: 'memo',
  tai: 'food',
  sei: 'clock'
};

/* ========================================
   共通コンポーネント
   ======================================== */

// 統一ヘッダー
function renderHeader(title, options = {}) {
  const { showBack, rightIcon, rightAction, rightIcons, subtitle } = options;

  // 戻るボタンのラベルを前のページに応じて決定
  let backLabel = '戻る';
  if (typeof app !== 'undefined' && app.previousPage) {
    if (app.previousPage === 'home') {
      backLabel = 'ホーム';
    } else if (app.previousPage.endsWith('-list')) {
      backLabel = '一覧';
    } else if (app.previousPage === 'settings') {
      backLabel = '設定';
    } else if (app.previousPage === 'goal-menu') {
      backLabel = '目標';
    }
  }

  const backBtn = showBack ? `
    <button class="header-back" onclick="app.goBack()">
      ${getIcon('back')}
      <span>${backLabel}</span>
    </button>
  ` : '<div class="header-spacer"></div>';

  let rightBtn = '<div class="header-spacer"></div>';
  if (rightIcons && rightIcons.length > 0) {
    rightBtn = `<div class="header-icons">${rightIcons.map(ri => `
      <button class="header-icon ${ri.className || ''}" onclick="${ri.action}">
        ${getIcon(ri.icon)}
      </button>
    `).join('')}</div>`;
  } else if (rightIcon) {
    rightBtn = `
      <button class="header-icon" onclick="${rightAction}">
        ${getIcon(rightIcon)}
      </button>
    `;
  }

  const subtitleHTML = subtitle ? `<span class="header-subtitle">[ ${subtitle} ]</span>` : '';

  return `
    <div class="header">
      ${backBtn}
      <div class="header-center">
        <span class="header-title">${title}</span>
        ${subtitleHTML}
      </div>
      ${rightBtn}
    </div>
  `;
}

// スワイプナビゲーションインジケーター
function renderSwipeNav(pages, currentIndex) {
  const prevPage = pages[currentIndex - 1];
  const nextPage = pages[currentIndex + 1];

  const dotsHTML = pages.map((page, i) =>
    `<div class="swipe-dot ${i === currentIndex ? 'active' : ''}"
          data-index="${i}"
          data-page-id="${page.id}"
          data-page-label="${page.label}"></div>`
  ).join('');

  return `
    <div class="swipe-nav" data-current-index="${currentIndex}" data-total-pages="${pages.length}">
      <div class="swipe-nav-prev" ${prevPage ? `onclick="app.navigate('${prevPage.id}')"` : ''}>
        ${prevPage ? `← ${prevPage.label}` : ''}
      </div>
      <div class="swipe-dots">
        ${dotsHTML}
      </div>
      <div class="swipe-nav-next" ${nextPage ? `onclick="app.navigate('${nextPage.id}')"` : ''}>
        ${nextPage ? `${nextPage.label} →` : ''}
      </div>
    </div>
  `;
}

/* ========================================
   ホーム画面
   ======================================== */
function renderHomePage(data) {
  const { todayJournal } = data;
  const routines = todayJournal?.routines || [];

  // 今日のスケジュールパターンを取得
  const todayPattern = app.getTodayPattern();
  const dailySchedule = todayPattern?.schedule || [];
  const matchingPatterns = app.getTodayMatchingPatterns();
  const hasMultiplePatterns = matchingPatterns.length > 1;

  // 元のインデックスを保持、タスクを上に
  const sortedRoutines = routines.map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => (b.isOneTime ? 1 : 0) - (a.isOneTime ? 1 : 0));

  // 現在時刻
  const now = new Date();
  const currentHour = now.getHours();

  // おすすめの行動を決定
  let recommendation = '';
  const unfinishedRoutines = routines.filter(r => !r.done);
  if (dailySchedule && dailySchedule.length > 0) {
    // スケジュールから現在の時間帯を探す
    const currentSlot = dailySchedule.find(slot => {
      return currentHour >= slot.startHour && currentHour < slot.endHour;
    });
    if (currentSlot) {
      recommendation = currentSlot.activity;
    }
  }
  if (!recommendation && unfinishedRoutines.length > 0) {
    recommendation = unfinishedRoutines[0].name;
  }
  if (!recommendation) {
    recommendation = '自由時間です';
  }

  // ルーティン進捗
  const doneCount = routines.filter(r => r.done).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // 設定からウィジェットスタイル取得
  const scheduleStyle = 'timeline'; // シンプルリスト
  const routineStyle = data.settings?.routineWidgetStyle || 'checklist';

  // ルーティン進捗バーHTML
  const routineProgressHTML = sortedRoutines.length > 0 ? `
    <div class="routine-progress-bar-wrap">
      <span class="routine-progress-text">${doneCount} / ${totalCount}</span>
      <div class="routine-progress-bar">
        <div class="routine-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
  ` : '';

  // ルーティンウィジェットHTML（4スタイル）
  let routineItemsHTML = '';
  if (sortedRoutines.length === 0) {
    routineItemsHTML = '<div class="widget-empty">ルーティン未設定</div>';
  } else if (routineStyle === 'checklist') {
    // スタイル1: カード形式（4コア付き）
    const expandedCards = app.expandedHomeRoutineCards || [];
    routineItemsHTML = `
      <div class="routine-cards-grid">
        ${sortedRoutines.map(routine => {
          const isOpen = expandedCards.includes(routine.originalIndex);
          const status = routine.status || (routine.done ? 'done' : 'none');
          const statusClass = status === 'done' ? 'checked' : status === 'partial' ? 'partial' : '';
          const statusIcon = status === 'done' ? '✓' : status === 'partial' ? '△' : '';
          const manualUrl = routine.manualUrl;
          const manualText = routine.manual;
          return `
          <div class="routine-card-full home-card ${isOpen ? 'open' : ''} ${statusClass} ${routine.isOneTime ? 'is-task' : ''}">
            <div class="rc-header">
              <span class="rc-check ${statusClass}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">${statusIcon}</span>
              <span class="rc-name">${routine.name || '（未設定）'}</span>
              <span class="rc-toggle" onclick="event.stopPropagation(); app.toggleHomeRoutineCard(${routine.originalIndex})">${isOpen ? '▲' : '▼'}</span>
            </div>
            ${isOpen ? `
            <div class="rc-cores">
              <div class="rc-core"><span class="rc-icon">📝</span><span class="rc-label">前準備</span><span class="rc-text">${routine.preparation || '-'}</span></div>
              <div class="rc-core"><span class="rc-icon">⚡</span><span class="rc-label">反射条件</span><span class="rc-text">${routine.trigger || '-'}</span></div>
              <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-label">最低限</span><span class="rc-text">${routine.minimumAction || '-'}</span></div>
              <div class="rc-core rc-manual">
                <span class="rc-icon">📖</span><span class="rc-label">マニュアル</span>
                ${manualUrl ? `<a class="rc-manual-link" href="${manualUrl}" target="_blank" onclick="event.stopPropagation()">ドキュメントを開く →</a>` : '<span class="rc-text">-</span>'}
              </div>
              ${manualText ? `<div class="rc-manual-desc">${manualText}</div>` : ''}
            </div>
            ` : ''}
          </div>
        `}).join('')}
      </div>`;
  } else if (routineStyle === 'circle') {
    // スタイル2: 円形進捗
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progressPercent / 100) * circumference;
    routineItemsHTML = `
      <div class="routine-circle-wrap">
        <svg class="routine-circle" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" stroke-width="8"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            transform="rotate(-90 50 50)" stroke-linecap="round"/>
        </svg>
        <div class="routine-circle-text">
          <span class="routine-circle-num">${doneCount}</span>
          <span class="routine-circle-total">/ ${totalCount}</span>
        </div>
      </div>
      <div class="routine-mini-list">
        ${sortedRoutines.map(routine => `
          <div class="routine-mini-item ${routine.done ? 'done' : ''}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">
            <span class="routine-mini-dot"></span>${routine.name}
          </div>
        `).join('')}
      </div>`;
  } else if (routineStyle === 'cards') {
    // スタイル3: カード
    routineItemsHTML = `
      <div class="routine-cards">
        ${sortedRoutines.map(routine => `
          <div class="routine-card ${routine.done ? 'done' : ''}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">
            <div class="routine-card-check">${routine.done ? '✓' : ''}</div>
            <div class="routine-card-name">${routine.name}</div>
          </div>
        `).join('')}
      </div>`;
  } else if (routineStyle === 'minimal') {
    // スタイル4: ミニマル
    routineItemsHTML = `
      <div class="routine-minimal-header">${doneCount}/${totalCount} 完了</div>
      <div class="routine-minimal-dots">
        ${sortedRoutines.map(routine => `
          <div class="routine-minimal-dot ${routine.done ? 'done' : ''}"
            onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})"
            title="${routine.name}"></div>
        `).join('')}
      </div>
      <div class="routine-minimal-list">
        ${sortedRoutines.filter(r => !r.done).map(routine => `
          <div class="routine-minimal-item">${routine.name}</div>
        `).join('')}
      </div>`;
  }

  // スケジュールをソートして表示
  const sortedSchedule = dailySchedule && dailySchedule.length > 0
    ? [...dailySchedule].sort((a, b) => a.startHour - b.startHour)
    : [];

  // スケジュールウィジェットHTML（4スタイル）
  let scheduleItemsHTML = '';
  if (sortedSchedule.length === 0) {
    scheduleItemsHTML = `<div class="widget-empty">
      <span class="widget-empty-icon">${getIcon('calendar')}</span>
      <span class="widget-empty-text">タップして設定</span>
    </div>`;
  } else if (scheduleStyle === 'timeline') {
    // スタイル1: シンプルリスト（左寄せ・下線区切り）
    let prevTimeStr = '';
    scheduleItemsHTML = `<div class="schedule-list">
      ${sortedSchedule.map(slot => {
        const timeStr = slot.startHour + '：' + String(slot.startMinute || 0).padStart(2, '0');
        const showTime = timeStr !== prevTimeStr;
        prevTimeStr = timeStr;
        const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
        return `
          <div class="schedule-list-item ${isCurrent ? 'current' : ''}">
            <span class="schedule-list-time">${showTime ? timeStr : ''}</span>
            <span class="schedule-list-activity">${slot.activity || '予定なし'}</span>
          </div>`;
      }).join('')}
    </div>`;
  } else if (scheduleStyle === 'blocks') {
    // スタイル2: ブロック（塗りつぶし）
    scheduleItemsHTML = `<div class="schedule-blocks">
      ${sortedSchedule.map(slot => {
        const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
        const isPast = currentHour >= slot.endHour;
        const bgColor = (slot.color || '#4A90A4') + '18';
        return `
          <div class="schedule-block ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}" style="background: ${bgColor}; border-left: 3px solid ${slot.color || '#4A90A4'}">
            <div class="schedule-block-time">${slot.startHour}:00 - ${slot.endHour}:00</div>
            <div class="schedule-block-text">${slot.activity || '予定なし'}</div>
          </div>`;
      }).join('')}
    </div>`;
  } else if (scheduleStyle === 'gantt') {
    // スタイル3: ガントチャート風
    const minHour = Math.min(...sortedSchedule.map(s => s.startHour));
    const maxHour = Math.max(...sortedSchedule.map(s => s.endHour));
    const range = maxHour - minHour || 1;
    scheduleItemsHTML = `
      <div class="schedule-gantt">
        <div class="schedule-gantt-hours">
          ${Array.from({length: range + 1}, (_, i) => `<span>${minHour + i}</span>`).join('')}
        </div>
        ${sortedSchedule.map(slot => {
          const left = ((slot.startHour - minHour) / range) * 100;
          const width = ((slot.endHour - slot.startHour) / range) * 100;
          const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
          return `
            <div class="schedule-gantt-row">
              <div class="schedule-gantt-bar ${isCurrent ? 'current' : ''}"
                style="left: ${left}%; width: ${width}%; background: ${slot.color || '#4A90A4'}">
                <span>${slot.activity || ''}</span>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  } else if (scheduleStyle === 'simple') {
    // スタイル4: シンプルリスト
    scheduleItemsHTML = `<div class="schedule-simple">
      ${sortedSchedule.map(slot => {
        const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
        const isPast = currentHour >= slot.endHour;
        return `
          <div class="schedule-simple-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}">
            <span class="schedule-simple-time">${slot.startHour}:00</span>
            <span class="schedule-simple-dot" style="background: ${slot.color || '#4A90A4'}"></span>
            <span class="schedule-simple-text">${slot.activity || '-'}</span>
          </div>`;
      }).join('')}
    </div>`;
  }

  return `
    ${renderHeader('ホーム', { rightIcon: 'calendar', rightAction: 'app.showProgress()' })}
    <div class="content home-content">
      <div class="action-area">
        <div class="widget-row">
          <div class="widget-card schedule-widget" onclick="app.navigate('monthly-5')">
            <div class="widget-header">
              <span>今日の予定</span>
            </div>
            <div class="schedule-pattern-bar" onclick="event.stopPropagation(); app.showPatternSelectModal()">
              <span class="schedule-pattern-name">${todayPattern?.name || '未設定'}</span>
              <span class="schedule-pattern-arrow">▼</span>
            </div>
            <div class="widget-content">
              ${scheduleItemsHTML}
            </div>
          </div>
          <div class="widget-card routine-widget" onclick="app.navigate('journal-supplement')">
            <div class="widget-header">
              <span>今日やる事</span>
            </div>
            ${routineProgressHTML}
            <div class="widget-content" onclick="event.stopPropagation()">
              ${routineItemsHTML}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="home-fixed-bottom">
      ${renderHomeBottomButtons(data)}
    </div>
    ${renderNavBar('home')}
  `;
}

/* ========================================
   ホーム下部ボタン（パターンA/B切り替え対応）
   ======================================== */
function renderHomeBottomButtons(data) {
  const fboxStyle = data.settings?.fboxStyle || 'B';
  const itemCount = app.firstBoxItems ? app.firstBoxItems.length : 0;
  const badgeHTML = itemCount > 0 ? `<span class="firstbox-badge">${itemCount}</span>` : '';

  if (fboxStyle === 'A') {
    // パターンA：3ボタン横並び（日誌・F・BOX一覧・振り分け）
    return `
      <div class="home-bottom-buttons home-bottom-3btn">
        <button class="journal-btn-simple journal-btn-small" onclick="app.navigate('journal')">
          <span class="journal-btn-icon">${getIcon('journal')}</span>
          <span>日誌を書く</span>
        </button>
        <button class="firstbox-btn" onclick="app.openFirstBoxList()">
          ${badgeHTML}
          <span class="firstbox-btn-icon">${getIcon('inbox')}</span>
          <span>F・BOX</span>
        </button>
        <button class="firstbox-btn fbox-sort-btn" onclick="app.startFirstBox()">
          <span class="firstbox-btn-icon">${getIcon('refresh')}</span>
          <span>振り分け</span>
        </button>
      </div>
    `;
  } else {
    // パターンB：2ボタン（日誌・F・BOX）F・BOXを押すと内部分岐
    return `
      <div class="home-bottom-buttons">
        <button class="journal-btn-simple journal-btn-small" onclick="app.navigate('journal')">
          <span class="journal-btn-icon">${getIcon('journal')}</span>
          <span>日誌を書く</span>
        </button>
        <button class="firstbox-btn" onclick="app.openFirstBoxList()">
          ${badgeHTML}
          <span class="firstbox-btn-icon">${getIcon('inbox')}</span>
          <span>F・BOX</span>
        </button>
      </div>
    `;
  }
}

/* ========================================
   ナビゲーションバー
   ======================================== */
function renderNavBar(currentPage) {
  const navItems = [
    { id: 'home', icon: 'home', label: 'ホーム' },
    { id: 'goal-list', icon: 'book', label: '目標一覧' },
    { id: 'routine-list', icon: 'refresh', label: 'ルーティン' },
    { id: 'task-list', icon: 'task', label: 'タスク' },
    { id: 'material-list', icon: 'file', label: '資料' },
    { id: 'settings', icon: 'settings', label: '設定' }
  ];

  const navHTML = navItems.map(item => `
    <div class="nav-item ${currentPage === item.id ? 'active' : ''}"
         onclick="app.navigateNav('${item.id}')">
      <div class="nav-icon">${getIcon(item.icon)}</div>
      <div class="nav-label">${item.label}</div>
    </div>
  `).join('');

  return `<div class="nav-bar">${navHTML}</div>`;
}

/* ========================================
   ルーティン一覧ページ（新規）
   ======================================== */
function renderRoutineListPage(data) {
  const currentTab = app.currentRoutineTab || 'goal';
  const tabs = [
    { id: 'goal', label: '目標' },
    { id: 'obligation', label: '義務' },
    { id: 'maintenance', label: '維持' },
    { id: 'principle', label: '指針' },
    { id: 'candidate', label: '候補' }
  ];

  const tabBarHTML = tabs.map(tab => {
    const count = app.getRoutinesByTab(tab.id).length;
    return `
      <button class="routine-tab ${currentTab === tab.id ? 'active' : ''}"
              onclick="app.switchRoutineTab('${tab.id}')">
        <span class="routine-tab-label">${tab.label}</span>
        ${count > 0 ? `<span class="routine-tab-count">${count}</span>` : ''}
      </button>
    `;
  }).join('');

  const items = app.getRoutinesByTab(currentTab);

  // 達成率エリア（仮）
  const graphPlaceholder = `
    <div class="routine-graph-placeholder">
      <div class="routine-graph-header">
        <span>達成率</span>
        <div class="routine-graph-toggle">
          <button class="routine-graph-btn active">週次</button>
          <button class="routine-graph-btn">月次</button>
        </div>
      </div>
      <div class="routine-graph-body">
        <p>データが溜まると、ここにグラフが表示されます</p>
      </div>
    </div>
  `;

  // ルーティン一覧
  let listHTML = '';
  if (items.length === 0) {
    const emptyMessages = {
      goal: '目標ルーティンはありません',
      obligation: '義務ルーティンはありません',
      maintenance: '維持ルーティンはありません',
      principle: '指針ルーティンはありません',
      candidate: '候補ルーティンはありません'
    };
    listHTML = `<div class="routine-empty"><p>${emptyMessages[currentTab]}</p></div>`;
  } else {
    listHTML = items.map(item => {
      let subInfo = '';
      if ((item.type === 'obligation' || item.type === 'maintenance') && item.nextDate) {
        const d = new Date(item.nextDate);
        subInfo = `<div class="routine-item-sub">次回: ${d.getMonth()+1}/${d.getDate()}</div>`;
      }
      if (item.type === 'candidate' && item.createdAt) {
        const created = new Date(item.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        subInfo = `<div class="routine-item-sub">追加から${months > 0 ? months + 'ヶ月' : diffDays + '日'}${diffDays >= 90 ? ' ⚠ 3ヶ月超過' : ''}</div>`;
      }
      return `
        <div class="routine-item" onclick="app.showEditRoutineModal(${item.id})">
          <div class="routine-item-content">
            <div class="routine-item-title">${item.title}</div>
            ${subInfo}
          </div>
          <button class="routine-item-delete" onclick="event.stopPropagation(); app.deleteRoutineById(${item.id})">
            ${getIcon('close')}
          </button>
        </div>
      `;
    }).join('');
  }

  // 月次振り返りエリア（仮）
  const reviewPlaceholder = `
    <div class="routine-review-placeholder">
      <div class="routine-review-header">月次振り返り</div>
      <p>月次振り返りシステムは今後実装予定です</p>
    </div>
  `;

  // 目標タブの場合は既存ルーティンとの関係を表示
  const goalNote = currentTab === 'goal' ? `
    <div class="routine-goal-note">
      月次目標のルーティン（ホーム画面「今日やる事」）と連携予定
    </div>
  ` : '';

  return `
    ${renderHeader('ルーティン')}
    <div class="content">
      ${graphPlaceholder}
      <div class="routine-tab-bar">${tabBarHTML}</div>
      ${goalNote}
      <div class="routine-list">${listHTML}</div>
      ${reviewPlaceholder}
      <button class="routine-add-fab" onclick="app.showAddRoutineModal('${currentTab}')">
        ${getIcon('plus')}
      </button>
    </div>
    ${renderNavBar('routine-list')}
  `;
}

/* ========================================
   タスク一覧ページ（5タブ切り替え）
   ======================================== */
function renderTaskListPage(data) {
  const currentTab = app.currentTaskTab || 'action';
  const tabs = [
    { id: 'action', label: 'アクション', icon: 'check' },
    { id: 'project', label: 'プロジェクト', icon: 'list' },
    { id: 'waiting', label: '待機', icon: 'clock' },
    { id: 'calendar', label: 'カレンダー', icon: 'calendar' },
    { id: 'wish', label: 'ウィッシュ', icon: 'star' }
  ];

  const tabBarHTML = tabs.map(tab => {
    const count = app.getTasksByTab(tab.id).length;
    return `
      <button class="task-tab ${currentTab === tab.id ? 'active' : ''}"
              onclick="app.switchTaskTab('${tab.id}')">
        <span class="task-tab-icon">${getIcon(tab.icon)}</span>
        <span class="task-tab-label">${tab.label}</span>
        ${count > 0 ? `<span class="task-tab-count">${count}</span>` : ''}
      </button>
    `;
  }).join('');

  const items = app.getTasksByTab(currentTab);
  let listHTML = '';

  if (items.length === 0) {
    const emptyMessages = {
      action: '次にやるべき行動はありません',
      project: 'プロジェクトはありません',
      waiting: '待機中のタスクはありません',
      calendar: '日時指定のタスクはありません',
      wish: 'いつかやりたいことはありません'
    };
    listHTML = `
      <div class="task-empty">
        <p>${emptyMessages[currentTab]}</p>
      </div>
    `;
  } else {
    listHTML = items.map(item => renderTaskItem(item, currentTab)).join('');
  }

  return `
    ${renderHeader('タスク')}
    <div class="content">
      <div class="task-tab-bar">${tabBarHTML}</div>
      <div class="task-list">${listHTML}</div>
      <button class="task-add-fab" onclick="app.showAddTaskModal('${currentTab}')">
        ${getIcon('plus')}
      </button>
    </div>
    ${renderNavBar('task-list')}
  `;
}

function renderTaskItem(item, type) {
  let subInfo = '';

  if (type === 'project' && item.completionCriteria) {
    subInfo = `<div class="task-item-sub">完了条件: ${item.completionCriteria}</div>`;
  } else if (type === 'waiting') {
    const parts = [];
    if (item.who) parts.push(item.who);
    if (item.deadline) {
      const d = new Date(item.deadline);
      parts.push(`${d.getMonth()+1}/${d.getDate()}まで`);
    }
    if (parts.length > 0) subInfo = `<div class="task-item-sub">${parts.join(' ・ ')}</div>`;
  } else if (type === 'calendar' && item.dateTime) {
    const d = new Date(item.dateTime);
    subInfo = `<div class="task-item-sub">${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</div>`;
  }

  return `
    <div class="task-item" onclick="app.showEditTaskModal(${item.id})">
      <div class="task-item-content">
        <div class="task-item-title">${item.title}</div>
        ${subInfo}
      </div>
      <button class="task-item-delete" onclick="event.stopPropagation(); app.deleteTaskById(${item.id})">
        ${getIcon('close')}
      </button>
    </div>
  `;
}

/* ========================================
   資料一覧ページ（新規）
   ======================================== */
function renderMaterialListPage(data) {
  const items = app.materialItems || [];

  const typeIcons = { text: 'edit', url: 'forward', image: 'inbox', audio: 'list', video: 'book', pdf: 'file' };
  const typeLabels = { text: 'テキスト', url: 'URL', image: '画像', audio: '音声', video: '動画', pdf: 'PDF' };

  let listHTML = '';
  if (items.length === 0) {
    listHTML = `
      <div class="material-empty">
        <div class="material-empty-icon">${getIcon('file')}</div>
        <p>資料はまだありません</p>
      </div>
    `;
  } else {
    listHTML = items.map(item => {
      const icon = typeIcons[item.fileType] || 'file';
      const label = typeLabels[item.fileType] || '';
      let sizeInfo = '';
      if (item.fileSize) {
        const kb = Math.round(item.fileSize / 1024);
        sizeInfo = kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
      }
      return `
        <div class="material-item" onclick="app.openMaterial(${item.id})">
          <div class="material-item-icon">${getIcon(icon)}</div>
          <div class="material-item-content">
            <div class="material-item-title">${escapeHtml(item.title)}</div>
            <div class="material-item-meta">
              <span class="material-item-type">${label}</span>
              ${sizeInfo ? `<span class="material-item-size">${sizeInfo}</span>` : ''}
              ${item.fileName ? `<span class="material-item-filename">${escapeHtml(item.fileName)}</span>` : ''}
            </div>
          </div>
          <button class="material-item-delete" onclick="event.stopPropagation(); app.deleteMaterialById(${item.id})">
            ${getIcon('close')}
          </button>
        </div>
      `;
    }).join('');
  }

  return `
    ${renderHeader('資料')}
    <div class="content">
      <div class="material-list">${listHTML}</div>
      <button class="material-add-fab" onclick="app.showAddMaterialModal()">
        ${getIcon('plus')}
      </button>
    </div>
    ${renderNavBar('material-list')}
  `;
}

function renderMaterialViewPage(appRef) {
  const item = appRef._viewingMaterial;
  if (!item) {
    return `
      ${renderHeader('資料', { showBack: true })}
      <div class="content"><p style="padding:20px;color:#999;">資料が見つかりません</p></div>
    `;
  }

  let contentHTML = '';

  if (item.fileType === 'text') {
    contentHTML = `<div class="material-view-text">${escapeHtml(item.content || '').replace(/\n/g, '<br>')}</div>`;
  } else if (item.fileType === 'url') {
    contentHTML = `<a href="${escapeHtml(item.url)}" target="_blank" class="material-view-url">${escapeHtml(item.url)}</a>`;
  } else if (item.fileType === 'image' && appRef._viewingMaterialBlobUrl) {
    contentHTML = `<img src="${appRef._viewingMaterialBlobUrl}" class="material-view-image" alt="${escapeHtml(item.title)}">`;
  } else if (item.fileType === 'audio' && appRef._viewingMaterialBlobUrl) {
    contentHTML = `<audio controls src="${appRef._viewingMaterialBlobUrl}" class="material-view-audio"></audio>`;
  } else if (item.fileType === 'video' && appRef._viewingMaterialBlobUrl) {
    contentHTML = `<video controls src="${appRef._viewingMaterialBlobUrl}" class="material-view-video"></video>`;
  } else if (item.fileType === 'pdf' && appRef._viewingMaterialBlobUrl) {
    contentHTML = `
      <div class="material-view-pdf">
        <a href="${appRef._viewingMaterialBlobUrl}" target="_blank" class="material-view-pdf-link">PDFを開く</a>
      </div>
    `;
  }

  return `
    <div class="page-container">
      ${renderHeader(escapeHtml(item.title), { showBack: true })}
      <div class="content">
        <div class="material-view-content">
          ${contentHTML}
        </div>
      </div>
    </div>
  `;
}

/* ========================================
   ファーストボックス振り分けフロー
   ======================================== */
function renderFirstBoxFlow(step, inputText) {
  let content = '';

  switch(step) {
    case 'input':
      content = `
        <div class="firstbox-step">
          <h2 class="firstbox-title">ファーストボックス</h2>
          <p class="firstbox-desc">今頭に浮かんでいることを何でもいいので入力してください。一緒に整理いたします。</p>
          <textarea class="firstbox-textarea" id="firstboxInput" placeholder="アイディア、タスク、小さなメモ etc...">${inputText || ''}</textarea>
          <button class="firstbox-next-btn" onclick="app.firstBoxNext('q1')">次へ</button>
        </div>
      `;
      break;
    case 'q1':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問1：やることが明確な"行動"ですか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q1', 'clear')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q1', 'unclear')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q1-unclear':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">どれに当てはまりますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q1-unclear', 'discard')">不要（捨てる）</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q1-unclear', 'someday')">将来やるかもしれない</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q1-unclear', 'reference')">情報として残しておきたい</button>
          </div>
        </div>
      `;
      break;
    case 'q1-unclear-material':
      content = `
        <div class="firstbox-step">
          <h2 class="firstbox-title">資料を追加</h2>
          <p class="firstbox-desc">内容を入力してください</p>
          <textarea class="firstbox-textarea" id="firstboxInput" placeholder="例：参考記事、料金表、気になる資格...">${inputText || ''}</textarea>
          <h2 class="firstbox-question">どちらに保管しますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxMaterialNext('someday')">いつかやりたいリスト</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxMaterialNext('reference')">資料保管</button>
          </div>
        </div>
      `;
      break;
    case 'q2':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問2：その行動は定期的に繰り返しますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q2', 'repeat')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q2', 'once')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'routine-input':
      content = `
        <div class="firstbox-step">
          <h2 class="firstbox-title">ルーティンを追加</h2>
          <p class="firstbox-desc">ルーティンの内容を入力してください</p>
          <textarea class="firstbox-textarea" id="firstboxInput" placeholder="例：毎朝ストレッチする、挨拶を元気にする...">${inputText || ''}</textarea>
          <button class="firstbox-next-btn" onclick="app.firstBoxNext('routine-1')">次へ</button>
        </div>
      `;
      break;
    case 'task-input':
      content = `
        <div class="firstbox-step">
          <h2 class="firstbox-title">タスクを追加</h2>
          <p class="firstbox-desc">タスクの内容を入力してください</p>
          <textarea class="firstbox-textarea" id="firstboxInput" placeholder="例：企画書を作る、歯医者に行く...">${inputText || ''}</textarea>
          <button class="firstbox-next-btn" onclick="app.firstBoxNext('q3')">次へ</button>
        </div>
      `;
      break;
    case 'routine-1':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">自分の目標達成に直結するか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-1', 'yes')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-1', 'no')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'routine-2':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">やらないと罰則や損害があるか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-2', 'yes')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-2', 'no')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'routine-3':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">やらないとQOLが低下するか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-3', 'yes')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-3', 'no')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'routine-4':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">一生続ける自分の軸・やり方か？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-4', 'yes')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('routine-4', 'no')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q3':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問3：その行動は1つの作業で終わりますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q3', 'single')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q3', 'project')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q4':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問4：今から2分以内に終えられますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4', 'quick')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4', 'long')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q5':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問5：他の人に任せられるか、<br>または他の人のアクションを待っているか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q5', 'waiting')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q5', 'self')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q6':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${inputText}</div>
          <h2 class="firstbox-question">問6：やる日時は決まっていますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q6', 'scheduled')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q6', 'unscheduled')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'result':
      const resultMap = {
        'discard': { icon: 'trash', label: '不要（捨てました）', color: '#999' },
        'someday': { icon: 'star', label: 'いつかやりたいリスト', color: '#f59e0b' },
        'reference': { icon: 'file', label: '資料保管', color: '#6366f1' },
        'goal-routine': { icon: 'target', label: '目標ルーティン', color: '#ef4444' },
        'duty-routine': { icon: 'flag', label: '義務ルーティン', color: '#ef4444' },
        'maintain-routine': { icon: 'help', label: '維持ルーティン', color: '#ef4444' },
        'principle-routine': { icon: 'star', label: '指針ルーティン', color: '#ef4444' },
        'candidate-routine': { icon: 'clock', label: '候補ルーティン', color: '#999' },
        'project': { icon: 'task', label: 'プロジェクトリスト', color: '#3b82f6' },
        'do-now': { icon: 'check', label: 'では今やってみましょう！', color: '#22c55e' },
        'waiting': { icon: 'clock', label: '待機リスト', color: '#f59e0b' },
        'calendar': { icon: 'calendar', label: 'カレンダー', color: '#ec4899' },
        'action': { icon: 'forward', label: 'アクションリスト', color: '#3b82f6' }
      };
      const result = resultMap[app.firstBoxResult] || { icon: 'check', label: '完了', color: '#22c55e' };
      content = `
        <div class="firstbox-step firstbox-result">
          <div class="firstbox-result-icon" style="color: ${result.color}">${getIcon(result.icon)}</div>
          <div class="firstbox-input-display">${inputText}</div>
          <div class="firstbox-result-label" style="color: ${result.color}">→ ${result.label}</div>
          <div class="firstbox-result-actions">
            ${app.firstBoxItems && app.firstBoxItems.length > 0
              ? `<button class="firstbox-next-btn" onclick="app.navigate('${(app.data.settings?.fboxStyle || 'B') === 'B' ? 'firstbox-items' : 'firstbox-list'}')">F・BOX一覧に戻る</button>`
              : `<button class="firstbox-next-btn" onclick="app.startFirstBox()">もう1つ振り分ける</button>`
            }
            <button class="firstbox-back-btn" onclick="app.navigate('home')">ホームに戻る</button>
          </div>
        </div>
      `;
      break;
  }

  return `
    <div class="page-container">
      ${renderHeader('F・BOX', { showBack: true })}
      <div class="content">
        ${content}
      </div>
    </div>
  `;
}

/* ========================================
   F・BOX 未処理一覧ページ
   ======================================== */
function renderFirstBoxListPage(appRef) {
  const items = appRef.firstBoxItems || [];
  const fboxStyle = appRef.data.settings?.fboxStyle || 'B';

  // 経過時間の表示
  function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}時間前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}日前`;
    return `${Math.floor(diffDay / 30)}ヶ月前`;
  }

  // 未処理リストHTML
  const listHTML = items.length > 0
    ? items.map(item => `
      <div class="fbox-item">
        <div class="fbox-item-main" onclick="app.startFirstBoxSort(${item.id})">
          <span class="fbox-item-text">${item.text}</span>
          <span class="fbox-item-time">${timeAgo(item.createdAt)}</span>
        </div>
        <button class="fbox-item-delete" onclick="event.stopPropagation(); app.deleteFirstBoxItemById(${item.id})">
          ${getIcon('close')}
        </button>
      </div>
    `).join('')
    : `<div class="fbox-empty">
        <div class="fbox-empty-icon">${getIcon('inbox')}</div>
        <p>未処理のメモはありません</p>
      </div>`;

  if (fboxStyle === 'A') {
    // パターンA：シンプルな未処理一覧（振り分けは別ボタンなので入力なし）
    return `
      <div class="page-container">
        ${renderHeader('F・BOX', { showBack: true })}
        <div class="content">
          <div class="fbox-list-section">
            <div class="fbox-quick-add">
              <textarea class="fbox-quick-input" id="firstboxQuickInput" placeholder="とりあえずメモを入れる..." rows="2"></textarea>
              <button class="fbox-quick-submit" onclick="app.quickAddToFirstBox()">入れる</button>
            </div>
            <div class="fbox-list-header">
              <span>未処理のメモ</span>
              <span class="fbox-list-count">${items.length}件</span>
            </div>
            ${listHTML}
          </div>
        </div>
      </div>
    `;
  } else {
    // パターンB：入力 + 「とりあえず入れる」「そのまま振り分ける」+ 整理するページへのボタン
    const itemCount = items.length;
    return `
      <div class="page-container">
        ${renderHeader('F・BOX', { showBack: true })}
        <div class="content">
          <div class="fbox-list-section">
            <div class="fbox-input-section">
              <textarea class="fbox-quick-input" id="firstboxQuickInput" placeholder="アイディア、タスク、小さなメモ etc..." rows="3"></textarea>
              <div class="fbox-input-buttons">
                <button class="fbox-action-btn fbox-action-save" onclick="app.quickAddToFirstBox()">
                  ${getIcon('inbox')} とりあえず入れる
                </button>
                <button class="fbox-action-btn fbox-action-sort" onclick="app.quickSortFromInput()">
                  ${getIcon('refresh')} そのまま振り分ける
                </button>
              </div>
            </div>
            <button class="fbox-organize-btn" onclick="app.navigate('firstbox-items')">
              ${getIcon('inbox')} 整理する${itemCount > 0 ? `（${itemCount}件）` : ''}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

/* ========================================
   F・BOX 未処理一覧ページ（整理する）
   ======================================== */
function renderFirstBoxItemsPage(appRef) {
  const items = appRef.firstBoxItems || [];

  function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}時間前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}日前`;
    return `${Math.floor(diffDay / 30)}ヶ月前`;
  }

  const listHTML = items.length > 0
    ? items.map(item => `
      <div class="fbox-item">
        <div class="fbox-item-main" onclick="app.startFirstBoxSort(${item.id})">
          <span class="fbox-item-text">${item.text}</span>
          <span class="fbox-item-time">${timeAgo(item.createdAt)}</span>
        </div>
        <button class="fbox-item-delete" onclick="event.stopPropagation(); app.deleteFirstBoxItemById(${item.id})">
          ${getIcon('close')}
        </button>
      </div>
    `).join('')
    : `<div class="fbox-empty">
        <div class="fbox-empty-icon">${getIcon('inbox')}</div>
        <p>未処理のメモはありません</p>
      </div>`;

  return `
    <div class="page-container">
      ${renderHeader('整理する', { showBack: true })}
      <div class="content">
        <div class="fbox-list-section">
          <div class="fbox-list-header">
            <span>未処理のメモ</span>
            <span class="fbox-list-count">${items.length}件</span>
          </div>
          ${listHTML}
          ${items.length > 0 ? `
            <button class="fbox-organize-btn" onclick="app.startFirstBoxSort(${items[0].id})">
              🔀 1件目から振り分ける
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ========================================
   今日のタスク画面
   ======================================== */
function renderTasksPage(data) {
  const { todayJournal, monthlyGoal } = data;
  const routineRate = calculateRoutineRate(todayJournal);
  const completedTasks = todayJournal.routines.filter(r => r.done).length;

  const routinesHTML = todayJournal.routines.map((routine, index) => `
    <div class="task-item ${routine.done ? 'completed' : ''}">
      <div class="task-check ${routine.done ? 'done' : ''}"
           onclick="app.toggleRoutine(${index})">${routine.done ? getIcon('check') : ''}</div>
      <span class="task-tag tag-${routine.category}">${categoryNames[routine.category]}</span>
      <span class="task-text">${routine.name || `ルーティン${index + 1}`}</span>
    </div>
  `).join('');

  const scheduleHTML = (todayJournal.schedule || []).map((item, index) => `
    <div class="task-item ${item.done ? 'completed' : ''}">
      <div class="task-check ${item.done ? 'done' : ''}"
           onclick="app.toggleSchedule(${index})">${item.done ? getIcon('check') : ''}</div>
      <span class="task-text">${item.name}</span>
    </div>
  `).join('') || '<div class="task-item"><span class="task-text empty">予定を追加してください</span></div>';

  return `
    ${renderHeader('今日のタスク', { showBack: true })}
    <div class="content">
      <div class="progress-section">
        <div class="progress-title">
          <span class="icon-inline">${getIcon('check')}</span>
          ルーティン達成率
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${routineRate}%"></div>
        </div>
        <div class="progress-text">${completedTasks}/${todayJournal.routines.length} 完了（${routineRate}%）</div>
      </div>

      <div class="now-action">
        <div class="now-label">
          <span class="icon-inline">${getIcon('clock')}</span>
          今やる理想の行動
        </div>
        <div class="now-content">${getCurrentIdealAction(todayJournal) || '予定を確認しましょう'}</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('list')}</span>
          本日の予定リスト
        </div>
        ${scheduleHTML}
        <button class="add-btn" onclick="app.addScheduleItem()">
          <span class="icon-inline">${getIcon('plus')}</span>
          予定を追加
        </button>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('refresh')}</span>
          ルーティン行動
        </div>
        ${routinesHTML}
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('target')}</span>
          4つのコア（追加タスク）
        </div>
        <div class="task-item ${todayJournal.coreActions?.deadline?.done ? 'completed' : ''}">
          <div class="task-check ${todayJournal.coreActions?.deadline?.done ? 'done' : ''}"
               onclick="app.toggleCoreAction('deadline')">${todayJournal.coreActions?.deadline?.done ? getIcon('check') : ''}</div>
          <span class="task-text">期日目標：${todayJournal.coreActions?.deadline?.name || '---'}</span>
        </div>
        <div class="task-item ${todayJournal.coreActions?.processing?.done ? 'completed' : ''}">
          <div class="task-check ${todayJournal.coreActions?.processing?.done ? 'done' : ''}"
               onclick="app.toggleCoreAction('processing')">${todayJournal.coreActions?.processing?.done ? getIcon('check') : ''}</div>
          <span class="task-text">要処理：${todayJournal.coreActions?.processing?.name || '---'}</span>
        </div>
      </div>
    </div>
    ${renderNavBar('home')}
  `;
}

// 現在の理想の行動を取得
function getCurrentIdealAction(journal) {
  const unfinished = journal.routines.find(r => !r.done && r.name);
  if (unfinished) return unfinished.name;
  const unfinishedSchedule = (journal.schedule || []).find(s => !s.done);
  if (unfinishedSchedule) return unfinishedSchedule.name;
  return null;
}

/* ========================================
   日誌画面（スワイプ対応）
   ======================================== */
function renderJournalPage(data) {
  const { todayJournal } = data;
  const dateStr = formatDateJapanese(todayJournal.date);

  const swipePages = [
    { id: 'journal-supplement', label: 'ルーティン' },
    { id: 'journal', label: '日誌' },
    { id: 'monthly', label: '今月の目標' }
  ];

  return `
    ${renderHeader('日誌', {
      showBack: true,
      subtitle: dateStr,
      rightIcons: [
        { icon: 'save', action: 'app.confirmSaveJournal()', className: 'icon-save' },
        { icon: 'trash', action: 'app.confirmDeleteCurrentJournal()', className: 'icon-delete' }
      ]
    })}
    <div class="content">
      ${renderSwipeNav(swipePages, 1)}

      <div class="score-box">
        <div class="score-label">点数（5段階）</div>
        <select class="score-select" onchange="app.updateJournalScore(this.value)">
          <option value="0" ${todayJournal.score === 0 ? 'selected' : ''}>---</option>
          <option value="1" ${todayJournal.score === 1 ? 'selected' : ''}>1 - とても悪い</option>
          <option value="2" ${todayJournal.score === 2 ? 'selected' : ''}>2 - 悪い</option>
          <option value="3" ${todayJournal.score === 3 ? 'selected' : ''}>3 - 普通</option>
          <option value="4" ${todayJournal.score === 4 ? 'selected' : ''}>4 - 良い</option>
          <option value="5" ${todayJournal.score === 5 ? 'selected' : ''}>5 - とても良い</option>
        </select>
      </div>

      <div class="form-section">
        <div class="form-title">
          ①今日の反省
          <span class="help-btn" onclick="app.showHelp('reflection')">${getIcon('help')}</span>
        </div>
        <textarea class="form-input" placeholder="今日反省すべきことは..." autocomplete="off"
          onchange="app.updateJournalReflection('reflection', this.value)"
        >${todayJournal.reflections?.reflection || ''}</textarea>
      </div>

      <div class="form-section">
        <div class="form-title">
          ②今日の努力・成果
          <span class="help-btn" onclick="app.showHelp('effort')">${getIcon('help')}</span>
        </div>
        <textarea class="form-input" placeholder="今日頑張ったことは..." autocomplete="off"
          onchange="app.updateJournalReflection('effort', this.value)"
        >${todayJournal.reflections?.effort || ''}</textarea>
      </div>

      <div class="form-section">
        <div class="form-title">
          ③世の為人の為にしたこと
          <span class="help-btn" onclick="app.showHelp('contribution')">${getIcon('help')}</span>
        </div>
        <textarea class="form-input" placeholder="誰かの役に立てたことは..." autocomplete="off"
          onchange="app.updateJournalReflection('contribution', this.value)"
        >${todayJournal.reflections?.contribution || ''}</textarea>
      </div>

      <div class="form-section">
        <div class="form-title">
          ④印象的・気付き・感謝
          <span class="help-btn" onclick="app.showHelp('gratitude')">${getIcon('help')}</span>
        </div>
        <textarea class="form-input" placeholder="印象に残ったこと、気づいたこと..." autocomplete="off"
          onchange="app.updateJournalReflection('gratitude', this.value)"
        >${todayJournal.reflections?.gratitude || ''}</textarea>
      </div>

      <div class="form-section">
        <div class="form-title">
          ⑤自由記入
          <span class="help-btn" onclick="app.showHelp('free')">${getIcon('help')}</span>
        </div>
        <textarea class="form-input" placeholder="その他メモ..." autocomplete="off"
          onchange="app.updateJournalReflection('free', this.value)"
        >${todayJournal.reflections?.free || ''}</textarea>
      </div>

      <div class="form-section">
        <div class="form-title">
          ⑥クイックメモ
          <button class="quickmemo-undo-btn" onclick="app.undoDeleteMemo()" title="削除を取り消す">${getIcon('undo')}</button>
        </div>
        <div class="quickmemo-list">
          ${data.todayMemos && data.todayMemos.length > 0
            ? data.todayMemos.map(memo => `
                <div class="quickmemo-item">
                  <div class="quickmemo-content">
                    ${memo.content ? `<div class="quickmemo-text">${memo.content}</div>` : ''}
                    ${memo.attachments && memo.attachments.length > 0
                      ? memo.attachments.map(att => {
                          if ((att.type === '画像' || att.type === '手書き') && (att.data || att.dataUrl)) {
                            return `<img src="${att.data || att.dataUrl}" class="quickmemo-image" alt="${att.name}">`;
                          } else if (att.type === '音声' && att.data) {
                            return `<audio controls class="quickmemo-audio"><source src="${att.data}"></audio>`;
                          } else if (att.type === '動画' && att.data) {
                            return `<video controls class="quickmemo-video"><source src="${att.data}"></video>`;
                          } else if (att.type === 'リンク' && att.url) {
                            return `<a href="${att.url}" target="_blank" class="quickmemo-link">${att.name}</a>`;
                          } else if (att.type === '位置情報' && att.lat) {
                            return `<a href="https://www.google.com/maps?q=${att.lat},${att.lng}" target="_blank" class="quickmemo-link">📍 ${att.name}</a>`;
                          } else {
                            return `<div class="quickmemo-attachment">${att.type}: ${att.name}</div>`;
                          }
                        }).join('')
                      : ''}
                  </div>
                  <button class="quickmemo-delete-btn" onclick="app.deleteQuickMemo(${memo.id})">${getIcon('close')}</button>
                </div>
              `).join('')
            : '<div class="quickmemo-empty">今日のクイックメモはありません</div>'}
        </div>
      </div>
    </div>
    ${renderNavBar('journal-list')}
  `;
}

/* ========================================
   ルーティンチェック画面
   ======================================== */
function renderJournalSupplementPage(data) {
  const { todayJournal } = data;
  const dateStr = formatDateJapanese(todayJournal.date);
  const routines = todayJournal.routines || [];
  const expandedCards = app.expandedJournalRoutineCards || [];

  const swipePages = [
    { id: 'journal-supplement', label: 'ルーティン' },
    { id: 'journal', label: '日誌' },
    { id: 'monthly', label: '今月の目標' }
  ];

  const routinesHTML = routines.length > 0 ? `
    <div class="rc-controls">
      <button class="rc-control-btn" onclick="event.stopPropagation(); app.toggleAllJournalRoutineCards(true)">全て開く</button>
      <button class="rc-control-btn" onclick="event.stopPropagation(); app.toggleAllJournalRoutineCards(false)">全て閉じる</button>
    </div>
    <div class="routine-cards-grid journal-routine-cards">
      ${routines.map((routine, index) => {
        const isOpen = expandedCards.includes(index);
        return `
        <div class="routine-card-full ${isOpen ? 'open' : ''} ${routine.done ? 'checked' : ''}">
          <div class="rc-header">
            <div class="task-check ${routine.done ? 'done' : ''}"
                 onclick="event.stopPropagation(); app.toggleRoutine(${index})">${routine.done ? getIcon('check') : ''}</div>
            <span class="task-tag tag-${routine.category}">${categoryNames[routine.category] || ''}</span>
            <span class="rc-name">${routine.name || 'ルーティン' + (index + 1)}</span>
            <span class="rc-toggle" onclick="event.stopPropagation(); app.toggleJournalRoutineCard(${index})">${isOpen ? '▲' : '▼'}</span>
          </div>
          ${isOpen ? `
          <div class="rc-cores">
            <div class="rc-core"><span class="rc-icon">⏰</span><span class="rc-text">${routine.condition || '-'}</span></div>
            <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-text">${routine.minimumAction || '-'}</span></div>
            <div class="rc-core"><span class="rc-icon">⚠️</span><span class="rc-text">${routine.troubleAnticipation || '-'}</span></div>
          </div>
          ` : ''}
        </div>
      `}).join('')}
    </div>
  ` : '<div class="list-empty">ルーティンが設定されていません</div>';

  const completedCount = routines.filter(r => r.done).length;
  const routineRate = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;

  return `
    ${renderHeader('ルーティン', {
      showBack: true,
      subtitle: dateStr,
      rightIcons: [
        { icon: 'save', action: 'app.confirmSaveJournal()', className: 'icon-save' },
        { icon: 'trash', action: 'app.confirmDeleteCurrentJournal()', className: 'icon-delete' }
      ]
    })}
    <div class="content">
      ${renderSwipeNav(swipePages, 0)}

      <div class="progress-section">
        <div class="progress-title">
          <span class="icon-inline">${getIcon('check')}</span>
          ルーティン達成率
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${routineRate}%"></div>
        </div>
        <div class="progress-text">${completedCount}/${routines.length} 完了（${routineRate}%）</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('task')}</span>
          本日のルーティン
        </div>
        ${routinesHTML}
      </div>
    </div>
    ${renderNavBar('journal-list')}
  `;
}

/* ========================================
   日誌一覧画面
   ======================================== */
function renderJournalListPage(data) {
  const { journals } = data;

  const listHTML = journals.length > 0 ? journals.map((journal, index) => {
    const rate = calculateRoutineRate(journal);
    const dateText = formatDateWithDayOfWeek(journal.date);
    const titleText = journal.title || '';
    const scoreText = journal.score || '---';
    const isStarred = journal.starred ? 'starred' : '';
    return `
      <div class="list-item journal-list-item" id="journal-list-${index}" data-journal-date="${journal.date}">
        <div class="journal-list-header">
          <button class="journal-star-btn ${isStarred}" onclick="event.stopPropagation(); app.toggleJournalStar('${journal.date}')">${getIcon('star')}</button>
          <div class="journal-list-date" onclick="app.viewJournal('${journal.date}')">${dateText}</div>
          <div class="journal-list-score" onclick="app.viewJournal('${journal.date}')">${scoreText}点</div>
          <div class="journal-list-rate" onclick="app.viewJournal('${journal.date}')">達成${rate}%</div>
          <button class="list-delete-btn" onclick="event.stopPropagation(); app.confirmDeleteJournal('${journal.date}')">${getIcon('close')}</button>
        </div>
        <div class="journal-list-title-wrapper" onclick="if(!this.classList.contains('expanded')) app.expandJournalListItem(${index}, '${journal.date}')">
          <div class="journal-list-title-content">${titleText || '<span class="placeholder">タイトルを入力...</span>'}</div>
          <div class="journal-list-title-more"></div>
        </div>
      </div>
    `;
  }).join('') : '<div class="list-empty">日誌がありません</div>';

  return `
    ${renderHeader('日誌一覧')}
    <div class="content">
      ${listHTML}
    </div>
    <div class="fab" onclick="app.navigateToTodayJournal()">
      ${getIcon('plus')}
    </div>
    ${renderNavBar('journal-list')}
  `;
}

/* ========================================
   月次目標画面（スワイプ6ページ対応）
   ======================================== */
function renderMonthlyPage(data, pageIndex = 0) {
  const { monthlyGoal } = data;
  const monthStr = formatMonthJapanese(monthlyGoal.yearMonth);

  const swipePages = [
    { id: 'monthly-0', label: '目標' },
    { id: 'monthly-1', label: '四つの観点' },
    { id: 'monthly-2', label: 'パターン分析' },
    { id: 'monthly-3', label: 'ブレイクダウン' },
    { id: 'monthly-4', label: 'ルーティン' },
    { id: 'monthly-5', label: 'コア行動' },
    { id: 'monthly-6', label: '基本スケジュール' },
    { id: 'monthly-7', label: 'ルーティン評価' }
  ];

  const currentPageLabel = swipePages[pageIndex]?.label || '目標';

  return `
    ${renderHeader(currentPageLabel, {
      showBack: true,
      subtitle: monthStr,
      rightIcons: [
        { icon: 'save', action: 'app.confirmSaveMonthlyGoal()', className: 'icon-save' },
        { icon: 'trash', action: 'app.confirmDeleteCurrentMonthlyGoal()', className: 'icon-delete' }
      ]
    })}
    <div class="content">
      ${renderSwipeNav(swipePages, pageIndex)}
      ${renderMonthlyPageContent(monthlyGoal, pageIndex)}
    </div>
    ${renderNavBar('monthly-list')}
  `;
}

function renderMonthlyPageContent(monthlyGoal, pageIndex) {
  switch(pageIndex) {
    case 0: return renderMonthlyGoalSection(monthlyGoal);
    case 1: return renderMonthlyPerspectivesSection(monthlyGoal);
    case 2: return renderMonthlyPatternSection(monthlyGoal);
    case 3: return renderMonthlyBreakdownSection(monthlyGoal);
    case 4: return renderMonthlyRoutineSection(monthlyGoal);
    case 5: return renderMonthlyCoreSection(monthlyGoal);
    case 6: return renderMonthlyScheduleSection();
    case 7: return renderMonthlyEvaluationSection(monthlyGoal);
    default: return renderMonthlyGoalSection(monthlyGoal);
  }
}

function renderMonthlyGoalSection(monthlyGoal) {
  return `
    <div class="form-section">
      <div class="form-title">今月達成する目標</div>
      <textarea class="form-input" placeholder="今月の目標を入力..." autocomplete="off"
        onchange="app.updateMonthlyGoal('goal', this.value)"
      >${monthlyGoal.goal || ''}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">目標達成のイメージ</div>
      <textarea class="form-input" placeholder="達成した時のイメージ..." autocomplete="off"
        onchange="app.updateMonthlyGoal('vision', this.value)"
      >${monthlyGoal.vision || ''}</textarea>
    </div>
  `;
}

function renderMonthlyPerspectivesSection(monthlyGoal) {
  return `
    <div class="section">
      <div class="section-title">他の人が得れる</div>
      <div class="input-row">
        <span class="input-label">気持ち</span>
        <input class="input-field" placeholder="相手が感じる気持ち..." autocomplete="off"
          value="${monthlyGoal.perspectives?.othersFeeling || ''}"
          onchange="app.updateMonthlyPerspective('othersFeeling', this.value)">
      </div>
      <div class="input-row">
        <span class="input-label">見えるもの</span>
        <input class="input-field" placeholder="相手に見える成果..." autocomplete="off"
          value="${monthlyGoal.perspectives?.othersVisible || ''}"
          onchange="app.updateMonthlyPerspective('othersVisible', this.value)">
      </div>
    </div>

    <div class="section">
      <div class="section-title">自分が得れる</div>
      <div class="input-row">
        <span class="input-label">気持ち</span>
        <input class="input-field" placeholder="自分が感じる気持ち..." autocomplete="off"
          value="${monthlyGoal.perspectives?.selfFeeling || ''}"
          onchange="app.updateMonthlyPerspective('selfFeeling', this.value)">
      </div>
      <div class="input-row">
        <span class="input-label">見えるもの</span>
        <input class="input-field" placeholder="自分が得る成果..." autocomplete="off"
          value="${monthlyGoal.perspectives?.selfVisible || ''}"
          onchange="app.updateMonthlyPerspective('selfVisible', this.value)">
      </div>
    </div>
  `;
}

function renderMonthlyPatternSection(monthlyGoal) {
  return `
    <div class="form-section">
      <div class="form-title">成功パターン</div>
      <textarea class="form-input" placeholder="うまくいくときのパターン..." autocomplete="off"
        onchange="app.updateMonthlyGoal('successPattern', this.value)"
      >${monthlyGoal.successPattern || ''}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">失敗パターン</div>
      <textarea class="form-input" placeholder="うまくいかないときのパターン..." autocomplete="off"
        onchange="app.updateMonthlyGoal('failurePattern', this.value)"
      >${monthlyGoal.failurePattern || ''}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">対策</div>
      <textarea class="form-input" placeholder="失敗を防ぐための対策..." autocomplete="off"
        onchange="app.updateMonthlyGoal('countermeasure', this.value)"
      >${monthlyGoal.countermeasure || ''}</textarea>
    </div>
  `;
}

function renderMonthlyBreakdownSection(monthlyGoal) {
  const breakdown = monthlyGoal.breakdown || { factors: [] };
  const factors = breakdown.factors || [];
  const expandedFactors = app.expandedBreakdownFactors || [];

  return `
    <div class="section">
      <div class="section-title">ゴールブレイクダウン</div>
      <p class="section-desc">目標達成に必要な要因（最大10個）と、各要因に対する行動（最大7個）を設定します。</p>

      <div class="breakdown-list">
        ${factors.map((factor, fIndex) => {
          const isOpen = expandedFactors.includes(fIndex);
          const actions = factor.actions || [];
          return `
          <div class="breakdown-factor ${isOpen ? 'open' : ''}">
            <div class="breakdown-factor-header" onclick="app.toggleBreakdownFactor(${fIndex})">
              <span class="breakdown-factor-num">${fIndex + 1}</span>
              <span class="breakdown-factor-name">${factor.name || '（未設定）'}</span>
              <span class="breakdown-factor-count">${actions.length}/7</span>
              <span class="breakdown-toggle">${isOpen ? '▲' : '▼'}</span>
            </div>
            ${isOpen ? `
            <div class="breakdown-factor-content">
              <div class="breakdown-factor-edit">
                <input class="input-field" value="${factor.name || ''}" placeholder="要因名"
                  onchange="app.updateBreakdownFactor(${fIndex}, 'name', this.value)">
                <button class="btn-icon danger" onclick="app.removeBreakdownFactor(${fIndex})">✕</button>
              </div>
              <div class="breakdown-actions">
                ${actions.map((action, aIndex) => `
                  <div class="breakdown-action">
                    <span class="breakdown-action-num">${aIndex + 1}</span>
                    <input class="input-field" value="${action || ''}" placeholder="行動${aIndex + 1}"
                      onchange="app.updateBreakdownAction(${fIndex}, ${aIndex}, this.value)">
                    <button class="btn-icon small danger" onclick="app.removeBreakdownAction(${fIndex}, ${aIndex})">✕</button>
                  </div>
                `).join('')}
                ${actions.length < 7 ? `
                  <button class="add-btn small" onclick="app.addBreakdownAction(${fIndex})">
                    + 行動を追加
                  </button>
                ` : ''}
              </div>
            </div>
            ` : ''}
          </div>
        `}).join('')}
      </div>

      ${factors.length < 10 ? `
        <button class="add-btn" onclick="app.addBreakdownFactor()">
          + 要因を追加（${factors.length}/10）
        </button>
      ` : '<p class="limit-reached">要因は最大10個です</p>'}
    </div>
  `;
}

function renderMonthlyRoutineSection(monthlyGoal) {
  const routines = monthlyGoal.routines || [];
  const expandedCards = app.expandedRoutineCards || [];

  // 登録順で表示
  const sortedRoutines = routines.map((r, i) => ({ ...r, originalIndex: i }));

  const routinesHTML = `
    <div class="rc-controls">
      <button class="rc-control-btn" onclick="event.stopPropagation(); app.toggleAllRoutineCards(true)">全て開く</button>
      <button class="rc-control-btn" onclick="event.stopPropagation(); app.toggleAllRoutineCards(false)">全て閉じる</button>
    </div>
    <div class="routine-cards-grid">
      ${sortedRoutines.map(r => {
        const isOpen = expandedCards.includes(r.originalIndex);
        return `
        <div class="routine-card-full ${isOpen ? 'open' : ''}" onclick="app.openRoutineEditModal(${r.originalIndex})">
          <div class="rc-header">
            <span class="task-tag tag-${r.category}">${categoryNames[r.category] || ''}</span>
            <span class="rc-name">${r.name || '（未設定）'}</span>
            <span class="rc-toggle" onclick="event.stopPropagation(); app.toggleRoutineCard(${r.originalIndex})">${isOpen ? '▲' : '▼'}</span>
          </div>
          ${isOpen ? `
          <div class="rc-cores">
            <div class="rc-core"><span class="rc-icon">⏰</span><span class="rc-text">${r.condition || '-'}</span></div>
            <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-text">${r.minimumAction || '-'}</span></div>
            <div class="rc-core"><span class="rc-icon">⚠️</span><span class="rc-text">${r.troubleAnticipation || '-'}</span></div>
          </div>
          ` : ''}
        </div>
      `}).join('')}
    </div>
  `;

  return `
    <div class="section">
      <div class="section-title">毎日のルーティン</div>
      ${routinesHTML}
      <button class="add-btn" onclick="app.addMonthlyRoutine()">
        <span class="icon-inline">${getIcon('plus')}</span>
        ルーティンを追加
      </button>
    </div>
  `;
}

function renderMonthlyCoreSection(monthlyGoal) {
  return `
    <div class="form-section">
      <div class="form-title">期日目標</div>
      <textarea class="form-input" placeholder="期日のある目標..." autocomplete="off"
        onchange="app.updateMonthlyGoal('deadlineGoal', this.value)"
      >${monthlyGoal.deadlineGoal || ''}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">要処理事項</div>
      <textarea class="form-input" placeholder="処理すべき事項..." autocomplete="off"
        onchange="app.updateMonthlyGoal('processingItems', this.value)"
      >${monthlyGoal.processingItems || ''}</textarea>
    </div>
  `;
}

function renderMonthlyScheduleSection() {
  const patterns = app.data.monthlyGoal?.schedulePatterns || [];
  const editingId = app.editingPatternId;

  // パターン編集中
  if (editingId) {
    const pattern = patterns.find(p => p.id === editingId);
    if (pattern) {
      return renderPatternEditor(pattern);
    }
  }

  // パターン一覧（優先度順にソート）
  const sortedPatterns = [...patterns].sort((a, b) => (a.priority || 3) - (b.priority || 3));
  const priorityLabels = ['', '最高', '高', '中', '低', '最低'];

  const patternsHTML = sortedPatterns.length > 0
    ? sortedPatterns.map(pattern => {
        const condText = getConditionText(pattern.condition);
        const scheduleCount = pattern.schedule?.length || 0;
        const priority = pattern.priority || 3;
        return `
          <div class="pattern-card" onclick="app.openPatternEditor(${pattern.id})">
            <div class="pattern-card-header">
              <div class="pattern-card-name">${pattern.name || '無名パターン'}</div>
              <span class="pattern-priority-badge priority-${priority}">${priorityLabels[priority]}</span>
              <button class="pattern-delete-btn" onclick="event.stopPropagation(); app.deleteSchedulePattern(${pattern.id})">×</button>
            </div>
            <div class="pattern-card-condition">${condText}</div>
            <div class="pattern-card-info">${scheduleCount}件の予定</div>
          </div>
        `;
      }).join('')
    : '<div class="widget-empty">パターンを追加してください</div>';

  return `
    <div class="pattern-list">
      ${patternsHTML}
    </div>
    <button class="schedule-add-btn" onclick="app.addSchedulePattern()">
      ${getIcon('plus')} パターンを追加
    </button>
  `;
}

function getConditionText(condition) {
  if (!condition) return '条件なし';
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  switch (condition.type) {
    case 'weekdays':
      const days = (condition.days || []).map(d => dayNames[d]).join('');
      return days ? `毎週 ${days}` : '曜日未設定';

    case 'biweekly':
      const biDays = (condition.days || []).map(d => dayNames[d]).join('');
      const weekType = condition.weekType === 'odd' ? '奇数週' : '偶数週';
      return `${weekType} ${biDays}`;

    case 'cycle':
      const cycleLen = condition.cycleLength || 7;
      const activeLen = condition.activeDays?.length || 0;
      return `${activeLen}日稼働/${cycleLen}日周期`;

    case 'dates':
      const datesMode = condition.datesMode || 'dates';
      if (datesMode === 'dates') {
        const dates = (condition.dates || []).join(',');
        return `毎月${dates}日`;
      } else if (datesMode === 'nthWeekday') {
        const nth = condition.nthWeekday || { week: 1, day: 1 };
        return `第${nth.week}${dayNames[nth.day]}曜日`;
      } else if (datesMode === 'lastWeekday') {
        const lastDay = condition.lastWeekday ?? 1;
        return `最終${dayNames[lastDay]}曜日`;
      }
      return '特定日';

    default:
      return '条件なし';
  }
}

function renderPatternEditor(pattern) {
  const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60'];
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const condition = pattern.condition || { type: 'weekdays', days: [] };

  // スケジュール一覧
  const schedule = pattern.schedule || [];
  const sortedSchedule = [...schedule].sort((a, b) => a.startHour - b.startHour);

  const scheduleHTML = sortedSchedule.length > 0
    ? sortedSchedule.map((slot) => {
        const originalIndex = schedule.findIndex(s => s === slot);
        return `
          <div class="schedule-entry-item" style="border-left: 4px solid ${slot.color || colors[0]}">
            <div class="schedule-entry-time">
              <input type="time" class="schedule-time-input" value="${String(slot.startHour).padStart(2,'0')}:00"
                     onchange="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'startHour', parseInt(this.value.split(':')[0]))">
              <span>〜</span>
              <input type="time" class="schedule-time-input" value="${String(slot.endHour).padStart(2,'0')}:00"
                     onchange="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'endHour', parseInt(this.value.split(':')[0]))">
              <button class="schedule-delete-btn" onclick="app.deletePatternScheduleSlot(${pattern.id}, ${originalIndex})">×</button>
            </div>
            <input type="text" class="schedule-entry-text" placeholder="予定を入力..."
                   value="${slot.activity || ''}"
                   onchange="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'activity', this.value)">
            <div class="schedule-color-picker">
              ${colors.map(c => `<span class="schedule-color-dot ${slot.color === c ? 'selected' : ''}" style="background:${c}" onclick="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'color', '${c}')"></span>`).join('')}
            </div>
          </div>
        `;
      }).join('')
    : '';

  // 条件設定UI
  let conditionUI = '';

  // ヘルプテキスト
  const helpTexts = {
    weekdays: '毎週特定の曜日に適用されます。複数選択可能です。',
    biweekly: '隔週（1週おき）で適用されます。奇数週か偶数週を選び、曜日も指定します。',
    cycle: '曜日に関係なく、一定の周期で繰り返すパターンです。\n例：「5日働いて2日休む」→ 周期7日、稼働日1〜5日目\n開始日を基準に周期がカウントされます。',
    dates: '毎月の特定日や、「第○週の○曜日」などで指定します。'
  };

  // 条件タイプ選択
  conditionUI += `
    <div class="condition-type-select">
      <div class="condition-type-row">
        <select class="form-select" onchange="app.updatePatternCondition(${pattern.id}, 'type', this.value)">
          <option value="weekdays" ${condition.type === 'weekdays' ? 'selected' : ''}>曜日指定</option>
          <option value="biweekly" ${condition.type === 'biweekly' ? 'selected' : ''}>隔週</option>
          <option value="cycle" ${condition.type === 'cycle' ? 'selected' : ''}>カスタム周期</option>
          <option value="dates" ${condition.type === 'dates' ? 'selected' : ''}>特定日</option>
        </select>
        <button class="help-btn" onclick="app.showConditionHelp('${condition.type}')">？</button>
      </div>
      <div class="condition-help" id="condition-help-${pattern.id}" style="display:none;"></div>
    </div>
  `;

  // 条件タイプ別の詳細設定
  if (condition.type === 'weekdays' || condition.type === 'biweekly') {
    // 曜日選択
    const selectedDays = condition.days || [];
    conditionUI += `
      <div class="condition-days">
        ${dayNames.map((name, i) => `
          <button class="day-btn ${selectedDays.includes(i) ? 'active' : ''}" onclick="app.togglePatternDay(${pattern.id}, ${i})">${name}</button>
        `).join('')}
      </div>
    `;

    // 隔週の場合は週タイプ選択
    if (condition.type === 'biweekly') {
      conditionUI += `
        <div class="condition-week-type">
          <label>
            <input type="radio" name="weekType" value="odd" ${condition.weekType === 'odd' ? 'checked' : ''} onchange="app.updatePatternCondition(${pattern.id}, 'weekType', 'odd')"> 奇数週
          </label>
          <label>
            <input type="radio" name="weekType" value="even" ${condition.weekType !== 'odd' ? 'checked' : ''} onchange="app.updatePatternCondition(${pattern.id}, 'weekType', 'even')"> 偶数週
          </label>
        </div>
      `;
    }
  } else if (condition.type === 'cycle') {
    // カスタム周期
    const cycleLength = condition.cycleLength || 7;
    const activeDays = condition.activeDays || [];
    const startDate = condition.startDate || '';

    conditionUI += `
      <div class="condition-cycle">
        <div class="cycle-row">
          <label>周期日数</label>
          <input type="number" class="cycle-input" min="1" max="31" value="${cycleLength}"
                 onchange="app.updatePatternCondition(${pattern.id}, 'cycleLength', this.value)">
        </div>
        <div class="cycle-row">
          <label>開始日</label>
          <input type="date" class="cycle-date" value="${startDate}"
                 onchange="app.updatePatternCondition(${pattern.id}, 'startDate', this.value)">
        </div>
        <div class="cycle-days-label">稼働日（周期内の何日目）</div>
        <div class="condition-days cycle-days">
          ${Array.from({length: cycleLength}, (_, i) => `
            <button class="day-btn ${activeDays.includes(i) ? 'active' : ''}" onclick="app.toggleCycleDay(${pattern.id}, ${i})">${i + 1}</button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (condition.type === 'dates') {
    // 特定日
    const selectedDates = condition.dates || [];
    const nthWeekday = condition.nthWeekday || { week: 1, day: 1 }; // 第N週のX曜日
    const lastWeekday = condition.lastWeekday; // 月の最後のX曜日
    const datesMode = condition.datesMode || 'dates'; // dates, nthWeekday, lastWeekday

    conditionUI += `
      <div class="condition-dates">
        <div class="dates-mode-select">
          <label class="dates-mode-option">
            <input type="radio" name="datesMode" value="dates" ${datesMode === 'dates' ? 'checked' : ''}
                   onchange="app.updatePatternCondition(${pattern.id}, 'datesMode', 'dates')">
            毎月○日
          </label>
          <label class="dates-mode-option">
            <input type="radio" name="datesMode" value="nthWeekday" ${datesMode === 'nthWeekday' ? 'checked' : ''}
                   onchange="app.updatePatternCondition(${pattern.id}, 'datesMode', 'nthWeekday')">
            第○週の○曜日
          </label>
          <label class="dates-mode-option">
            <input type="radio" name="datesMode" value="lastWeekday" ${datesMode === 'lastWeekday' ? 'checked' : ''}
                   onchange="app.updatePatternCondition(${pattern.id}, 'datesMode', 'lastWeekday')">
            月の最後の○曜日
          </label>
        </div>

        ${datesMode === 'dates' ? `
          <div class="dates-label">毎月の適用日</div>
          <div class="condition-days dates-grid">
            ${Array.from({length: 31}, (_, i) => `
              <button class="day-btn small ${selectedDates.includes(i + 1) ? 'active' : ''}" onclick="app.togglePatternDate(${pattern.id}, ${i + 1})">${i + 1}</button>
            `).join('')}
          </div>
        ` : ''}

        ${datesMode === 'nthWeekday' ? `
          <div class="nth-weekday-select">
            <select class="form-select small" onchange="app.updatePatternCondition(${pattern.id}, 'nthWeek', this.value)">
              <option value="1" ${nthWeekday.week === 1 ? 'selected' : ''}>第1</option>
              <option value="2" ${nthWeekday.week === 2 ? 'selected' : ''}>第2</option>
              <option value="3" ${nthWeekday.week === 3 ? 'selected' : ''}>第3</option>
              <option value="4" ${nthWeekday.week === 4 ? 'selected' : ''}>第4</option>
              <option value="5" ${nthWeekday.week === 5 ? 'selected' : ''}>第5</option>
            </select>
            <select class="form-select small" onchange="app.updatePatternCondition(${pattern.id}, 'nthDay', this.value)">
              ${dayNames.map((name, i) => `<option value="${i}" ${nthWeekday.day === i ? 'selected' : ''}>${name}曜日</option>`).join('')}
            </select>
          </div>
        ` : ''}

        ${datesMode === 'lastWeekday' ? `
          <div class="last-weekday-select">
            <span>月の最後の</span>
            <select class="form-select small" onchange="app.updatePatternCondition(${pattern.id}, 'lastWeekday', this.value)">
              ${dayNames.map((name, i) => `<option value="${i}" ${lastWeekday === i ? 'selected' : ''}>${name}曜日</option>`).join('')}
            </select>
          </div>
        ` : ''}
      </div>
    `;
  }

  const priority = pattern.priority || 3;

  return `
    <div class="pattern-editor">
      <div class="pattern-editor-header">
        <button class="back-btn" onclick="app.closePatternEditor()">${getIcon('back')} 戻る</button>
      </div>

      <div class="form-section">
        <div class="form-title">パターン名</div>
        <input type="text" class="form-input" value="${pattern.name || ''}"
               onchange="app.updatePatternName(${pattern.id}, this.value)" placeholder="パターン名...">
      </div>

      <div class="form-section">
        <div class="form-title">優先度（複数パターンが該当時）</div>
        <div class="priority-select">
          <button class="priority-btn ${priority === 1 ? 'active' : ''} priority-1" onclick="app.updatePatternPriority(${pattern.id}, 1)">1<br><span>最高</span></button>
          <button class="priority-btn ${priority === 2 ? 'active' : ''} priority-2" onclick="app.updatePatternPriority(${pattern.id}, 2)">2<br><span>高</span></button>
          <button class="priority-btn ${priority === 3 ? 'active' : ''} priority-3" onclick="app.updatePatternPriority(${pattern.id}, 3)">3<br><span>中</span></button>
          <button class="priority-btn ${priority === 4 ? 'active' : ''} priority-4" onclick="app.updatePatternPriority(${pattern.id}, 4)">4<br><span>低</span></button>
          <button class="priority-btn ${priority === 5 ? 'active' : ''} priority-5" onclick="app.updatePatternPriority(${pattern.id}, 5)">5<br><span>最低</span></button>
        </div>
      </div>

      <div class="form-section">
        <div class="form-title">適用条件</div>
        ${conditionUI}
      </div>

      <div class="form-section">
        <div class="form-title">スケジュール</div>
        <div class="schedule-entry-list">
          ${scheduleHTML}
        </div>
        <button class="schedule-add-btn" onclick="app.addPatternScheduleSlot(${pattern.id})">
          ${getIcon('plus')} 予定を追加
        </button>
      </div>
    </div>
  `;
}

function renderMonthlyEvaluationSection(monthlyGoal) {
  const routines = monthlyGoal.routines || [];
  const expandedIndex = app.expandedEvalRoutineIndex;

  // 優先順位でソート
  const sortedRoutines = routines.map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));

  const routinesHTML = sortedRoutines.length > 0 ? sortedRoutines.map(r => {
    const i = r.originalIndex;
    const isExpanded = expandedIndex === i;
    const eval_ = r.evaluation || {};
    const cost = eval_.cost || {};

    return `
      <div class="eval-card ${isExpanded ? 'expanded' : ''}">
        <div class="eval-card-header" onclick="app.toggleEvalRoutineDetail(${i})">
          <span class="routine-priority-num">${r.priority || '-'}</span>
          <span class="task-tag tag-${r.category}">${categoryNames[r.category] || '---'}</span>
          <span class="eval-routine-name">${r.name || '（未設定）'}</span>
          <span class="eval-expand-icon">${isExpanded ? '▲' : '▼'}</span>
        </div>
        ${isExpanded ? `
          <div class="eval-card-body">
            <div class="eval-section">
              <div class="eval-section-title">達成率</div>
              <div class="eval-achievement" id="achievement-${i}">計算中...</div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">効果・実績（4観点）</div>
              <div class="eval-field">
                <label>有形×自分 <span class="field-hint">自分が得た具体的成果</span></label>
                <textarea class="input-field eval-textarea" placeholder="例：体重2kg減 / 作業時間週5時間短縮"
                  onchange="app.updateRoutineEvaluation(${i}, 'tangibleSelf', this.value)">${eval_.tangibleSelf || ''}</textarea>
              </div>
              <div class="eval-field">
                <label>有形×他人 <span class="field-hint">他人に見える具体的成果</span></label>
                <textarea class="input-field eval-textarea" placeholder="例：提案3件通過 / 売上10%増"
                  onchange="app.updateRoutineEvaluation(${i}, 'tangibleOthers', this.value)">${eval_.tangibleOthers || ''}</textarea>
              </div>
              <div class="eval-field">
                <label>無形×自分 <span class="field-hint">自分の内面的変化</span></label>
                <textarea class="input-field eval-textarea" placeholder="例：自信がついた / 集中力向上"
                  onchange="app.updateRoutineEvaluation(${i}, 'intangibleSelf', this.value)">${eval_.intangibleSelf || ''}</textarea>
              </div>
              <div class="eval-field">
                <label>無形×他人 <span class="field-hint">他人からの評価・印象</span></label>
                <textarea class="input-field eval-textarea" placeholder="例：信頼度アップ / 頼られるようになった"
                  onchange="app.updateRoutineEvaluation(${i}, 'intangibleOthers', this.value)">${eval_.intangibleOthers || ''}</textarea>
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">数値化と来月目標</div>
              <div class="eval-field">
                <label>今月の数値実績</label>
                <textarea class="input-field eval-textarea" placeholder="無形の変化を数値で表現..."
                  onchange="app.updateRoutineEvaluation(${i}, 'metrics', this.value)">${eval_.metrics || ''}</textarea>
              </div>
              <div class="eval-field">
                <label>来月の数値目標</label>
                <textarea class="input-field eval-textarea" placeholder="来月達成したい数値..."
                  onchange="app.updateRoutineEvaluation(${i}, 'nextTarget', this.value)">${eval_.nextTarget || ''}</textarea>
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">費用対効果</div>
              <div class="eval-cost-grid">
                <div class="eval-field">
                  <label>時間（分/日）</label>
                  <input type="text" class="input-field" placeholder="例：60"
                    value="${cost.time || ''}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.time', this.value)">
                </div>
                <div class="eval-field">
                  <label>金銭（円/月）</label>
                  <input type="text" class="input-field" placeholder="例：5000"
                    value="${cost.money || ''}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.money', this.value)">
                </div>
                <div class="eval-field">
                  <label>肉体的負荷</label>
                  <input type="text" class="input-field" placeholder="例：中程度"
                    value="${cost.physicalLoad || ''}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.physicalLoad', this.value)">
                </div>
                <div class="eval-field">
                  <label>機会損失</label>
                  <input type="text" class="input-field" placeholder="例：読書時間が減る"
                    value="${cost.opportunityCost || ''}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.opportunityCost', this.value)">
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('') : '<div class="widget-empty">ルーティンを先に設定してください</div>';

  // 達成率の遅延計算用スクリプト
  const calcScript = sortedRoutines.length > 0 ? `
    <script>
      (async function() {
        ${sortedRoutines.map(r => `
          const rate${r.originalIndex} = await app.calculateRoutineAchievementRate('${(r.name || '').replace(/'/g, "\\'")}');
          const el${r.originalIndex} = document.getElementById('achievement-${r.originalIndex}');
          if (el${r.originalIndex}) {
            el${r.originalIndex}.innerHTML = '<span class="achievement-rate">' + rate${r.originalIndex} + '%</span>';
            el${r.originalIndex}.className = 'eval-achievement rate-' + (rate${r.originalIndex} >= 80 ? 'high' : rate${r.originalIndex} >= 50 ? 'mid' : 'low');
          }
        `).join('')}
      })();
    </script>
  ` : '';

  return `
    <div class="section">
      <div class="section-title">ルーティン月次評価</div>
      <div class="eval-hint">各ルーティンをタップして評価を入力</div>
      ${routinesHTML}
    </div>
    ${calcScript}
  `;
}

/* ========================================
   月次目標一覧画面
   ======================================== */
function renderMonthlyListPage(data) {
  const { monthlyGoals } = data;

  const listHTML = monthlyGoals.length > 0 ? monthlyGoals.map(goal => `
    <div class="list-item" onclick="app.viewMonthlyGoal('${goal.yearMonth}')">
      <div class="list-content">
        <div class="list-title">${formatMonthJapanese(goal.yearMonth)}</div>
        <div class="list-sub">${goal.goal || '目標未設定'}</div>
      </div>
      <button class="list-delete-btn" onclick="event.stopPropagation(); app.confirmDeleteMonthlyGoal('${goal.yearMonth}')">${getIcon('close')}</button>
    </div>
  `).join('') : '<div class="list-empty">月次目標がありません</div>';

  return `
    ${renderHeader('月次目標一覧')}
    <div class="content">
      ${listHTML}
    </div>
    <div class="fab" onclick="app.navigateToCurrentMonth()">
      ${getIcon('plus')}
    </div>
    ${renderNavBar('monthly-list')}
  `;
}

/* ========================================
   長期目標画面
   ======================================== */
function renderLongTermPage(data) {
  const { longTermGoal } = data;

  // 年のプルダウン選択肢（今年〜+50年）
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y <= currentYear + 50; y++) {
    const selected = longTermGoal?.deadlineYear == y ? 'selected' : '';
    yearOptions.push(`<option value="${y}" ${selected}>${y}</option>`);
  }

  // 月のプルダウン選択肢（1〜12月）
  const monthOptions = [];
  for (let m = 1; m <= 12; m++) {
    const selected = longTermGoal?.deadlineMonth == m ? 'selected' : '';
    monthOptions.push(`<option value="${m}" ${selected}>${m}</option>`);
  }

  // 開始日の年プルダウン
  const startYearOptions = [];
  for (let y = currentYear; y <= currentYear + 50; y++) {
    const selected = longTermGoal?.startYear == y ? 'selected' : '';
    startYearOptions.push(`<option value="${y}" ${selected}>${y}</option>`);
  }

  // 開始日の月プルダウン
  const startMonthOptions = [];
  for (let m = 1; m <= 12; m++) {
    const selected = longTermGoal?.startMonth == m ? 'selected' : '';
    startMonthOptions.push(`<option value="${m}" ${selected}>${m}</option>`);
  }

  // 期限表示（あと○日）
  let deadlineDisplay = '';
  let daysLeftDisplay = '';
  if (longTermGoal?.deadlineYear && longTermGoal?.deadlineMonth) {
    deadlineDisplay = `${longTermGoal.deadlineYear}年${longTermGoal.deadlineMonth}月まで`;
    const deadline = new Date(longTermGoal.deadlineYear, longTermGoal.deadlineMonth, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    daysLeftDisplay = daysLeft > 0 ? `あと${daysLeft}日` : '期限到達';
  }

  const milestonesHTML = (longTermGoal?.milestones || []).map((m, i) => {
    // 年のプルダウン選択肢
    let mYearOptions = '<option value="">年</option>';
    for (let y = currentYear; y <= currentYear + 50; y++) {
      const selected = m.year == y ? 'selected' : '';
      mYearOptions += `<option value="${y}" ${selected}>${y}</option>`;
    }
    // 月のプルダウン選択肢
    let mMonthOptions = '<option value="">月</option>';
    for (let mo = 1; mo <= 12; mo++) {
      const selected = m.month == mo ? 'selected' : '';
      mMonthOptions += `<option value="${mo}" ${selected}>${mo}</option>`;
    }
    const goalText = m.goal || '';
    return `
    <div class="milestone-item" id="milestone-${i}">
      <div class="milestone-date">
        <select class="input-field small" onchange="app.updateMilestone(${i}, 'year', this.value)">
          ${mYearOptions}
        </select>
        <span>年</span>
        <select class="input-field small" onchange="app.updateMilestone(${i}, 'month', this.value)">
          ${mMonthOptions}
        </select>
        <span>月</span>
        <button class="remove-btn" onclick="app.removeMilestone(${i})">${getIcon('close')}</button>
      </div>
      <div class="milestone-goal-wrapper" onclick="if(!this.classList.contains('expanded')) app.expandMilestone(${i})">
        <div class="milestone-goal-content">${goalText || '<span class="placeholder">中間目標を入力...</span>'}</div>
        <div class="milestone-goal-more"></div>
      </div>
    </div>
  `;
  }).join('');

  return `
    ${renderHeader('長期目標', {
      showBack: true,
      rightIcons: [
        { icon: 'save', action: 'app.confirmSaveLongTermGoal()', className: 'icon-save' },
        { icon: 'trash', action: 'app.confirmDeleteCurrentLongTermGoal()', className: 'icon-delete' }
      ]
    })}
    <div class="content">
      <div class="section">
        <div class="section-title">開始日<span class="section-hint">省略可</span></div>
        <div class="deadline-row">
          <select class="input-field" onchange="app.updateLongTermGoal('startYear', this.value)">
            <option value="">年</option>
            ${startYearOptions.join('')}
          </select>
          <span>年</span>
          <select class="input-field small" onchange="app.updateLongTermGoal('startMonth', this.value)">
            <option value="">月</option>
            ${startMonthOptions.join('')}
          </select>
          <span>月から</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">目標期限</div>
        <div class="deadline-row">
          <select class="input-field" onchange="app.updateLongTermGoal('deadlineYear', this.value)">
            <option value="">年</option>
            ${yearOptions.join('')}
          </select>
          <span>年</span>
          <select class="input-field small" onchange="app.updateLongTermGoal('deadlineMonth', this.value)">
            <option value="">月</option>
            ${monthOptions.join('')}
          </select>
          <span>月までに</span>
        </div>
      </div>

      <div class="goal-card longterm-page-card" id="longterm-card-goal" onclick="if(!this.classList.contains('expanded')) app.expandLongtermCard()">
        <div class="goal-label">
          <span class="icon-inline">${getIcon('target')}</span>
          今回の長期目標
          <span class="days-left">
            <span class="deadline-date">${deadlineDisplay}</span>
            <span class="deadline-remaining">${daysLeftDisplay}</span>
          </span>
        </div>
        <div class="goal-title">${longTermGoal?.goal || '目標を入力しましょう'}</div>
        <div class="goal-more"></div>
      </div>

      <div class="section">
        <div class="section-title">
          逆算目標（1カ月単位）
          <span class="section-hint">追加/削除可</span>
        </div>
        ${milestonesHTML}
        <button class="add-btn dashed" onclick="app.addMilestone()">
          <span class="icon-inline">${getIcon('plus')}</span>
          逆算を追加
        </button>
      </div>
    </div>
    ${renderNavBar('longterm-list')}
  `;
}

/* ========================================
   長期目標一覧画面
   ======================================== */
function renderLongTermListPage(data) {
  const { longTermGoals } = data;

  const listHTML = longTermGoals.length > 0 ? longTermGoals.map((goal, index) => {
    const deadlineText = `${goal.deadlineYear || '----'}年${goal.deadlineMonth || '--'}月まで`;
    const goalText = goal.goal || '目標未設定';
    return `
    <div class="list-item longterm-list-item" id="longterm-list-${index}" data-goal-id="${goal.id}">
      <div class="list-deadline" onclick="app.viewLongTermGoal(${goal.id})">${deadlineText}</div>
      <div class="list-goal-wrapper" onclick="if(!this.classList.contains('expanded')) app.expandLongtermListItem(${index}, ${goal.id})">
        <div class="list-goal-content">${goalText}</div>
        <div class="list-goal-more"></div>
      </div>
      <button class="list-delete-btn" onclick="event.stopPropagation(); app.confirmDeleteLongTermGoal(${goal.id})">${getIcon('close')}</button>
    </div>
  `;
  }).join('') : '<div class="list-empty">長期目標がありません</div>';

  return `
    ${renderHeader('長期目標一覧')}
    <div class="content">
      ${listHTML}
    </div>
    <div class="fab" onclick="app.createNewLongTermGoal()">
      ${getIcon('plus')}
    </div>
    ${renderNavBar('longterm-list')}
  `;
}

/* ========================================
   人生設計画面（スワイプ2ページ対応）
   ======================================== */
function renderLifeDesignPage(data, pageIndex = 0) {
  const { lifeDesign, settings } = data;

  const swipePages = [
    { id: 'life-0', label: '目的/意味' },
    { id: 'life-1', label: '年齢別目標' }
  ];

  const currentPageLabel = swipePages[pageIndex]?.label || '目的/意味';

  return `
    ${renderHeader('人生設計', { subtitle: currentPageLabel })}
    <div class="content">
      ${renderSwipeNav(swipePages, pageIndex)}
      ${renderLifePageContent(lifeDesign, settings, pageIndex)}
    </div>
    ${renderNavBar('goal-list')}
  `;
}

function renderLifePageContent(lifeDesign, settings, pageIndex) {
  switch(pageIndex) {
    case 0: return renderLifePurposeSection(lifeDesign);
    case 1: return renderLifeAgeGoalsSection(lifeDesign, settings);
    default: return renderLifePurposeSection(lifeDesign);
  }
}

function renderLifePurposeSection(lifeDesign) {
  const purposeText = lifeDesign.purpose || '';
  const meaningText = lifeDesign.meaning || '';

  return `
    <div class="life-card" id="life-card-purpose" onclick="if(!this.classList.contains('expanded')) app.editLifeDesign('purpose')">
      <div class="life-card-label">人生の最上位目的</div>
      <div class="life-card-content">${purposeText || '<span class="placeholder">タップして入力...</span>'}</div>
      <div class="life-card-more"></div>
    </div>

    <div class="life-card" id="life-card-meaning" onclick="if(!this.classList.contains('expanded')) app.editLifeDesign('meaning')">
      <div class="life-card-label">その目的を持つ意味</div>
      <div class="life-card-content">${meaningText || '<span class="placeholder">タップして入力...</span>'}</div>
      <div class="life-card-more"></div>
    </div>
  `;
}

function renderLifeAgeGoalsSection(lifeDesign, settings) {
  // 現在の年齢と生年を計算（設定から）
  const today = new Date();
  const currentYear = today.getFullYear();
  let minAge = 0;
  let birthYear = null;

  if (settings && settings.birthday) {
    const parts = settings.birthday.split('-');
    birthYear = parseInt(parts[0]);
    const birthMonth = parseInt(parts[1]) || 1;
    const birthDay = parseInt(parts[2]) || 1;

    if (birthYear) {
      // 誕生日が今年すでに来たかどうかで年齢を計算
      let age = currentYear - birthYear;
      const birthdayThisYear = new Date(currentYear, birthMonth - 1, birthDay);
      if (today < birthdayThisYear) {
        age--; // まだ誕生日が来てない
      }
      minAge = age;
    }
  }

  // 年齢の選択肢を生成（現在の年齢から100歳まで）
  const ageOptions = [];
  for (let age = minAge; age <= 100; age++) {
    ageOptions.push(`<option value="${age}">${age}</option>`);
  }
  const ageOptionsHTML = ageOptions.join('');

  // 年齢から西暦を計算
  const getYearFromAge = (age) => {
    if (birthYear) {
      return birthYear + parseInt(age);
    }
    return '';
  };

  const ageGoalsHTML = (lifeDesign.ageGoals || []).map((item, i) => {
    const year = item.age ? getYearFromAge(item.age) : '';
    return `
    <div class="age-goal-item" id="age-goal-item-${i}">
      <div class="age-year-row">
        <select class="age-select" onchange="app.updateAgeGoal(${i}, 'age', this.value)">
          <option value="">--</option>
          ${ageOptionsHTML.replace(`value="${item.age}"`, `value="${item.age}" selected`)}
        </select>
        <span class="age-label">歳</span>
        <span class="year-label">${year ? `(${year}年)` : ''}</span>
        <button class="remove-btn-red" onclick="app.removeAgeGoal(${i})">${getIcon('close')}</button>
      </div>
      <div class="goal-display-wrapper" id="goal-wrapper-${i}">
        <textarea class="input-field goal-textarea" id="goal-textarea-${i}" placeholder="目標..." autocomplete="off"
          onchange="app.updateAgeGoal(${i}, 'goal', this.value)">${item.goal || ''}</textarea>
        <div class="goal-more"></div>
        <div class="goal-buttons-view" style="display:none;">
          <button class="expand-btn cancel" onclick="app.closeAgeGoalExpand(${i})">閉じる</button>
          <button class="expand-btn save" onclick="app.editAgeGoal(${i})">編集</button>
        </div>
        <div class="goal-buttons-edit" style="display:none;">
          <button class="expand-btn cancel" onclick="app.cancelAgeGoalEdit(${i})">閉じる</button>
          <button class="expand-btn save" onclick="app.saveAgeGoalEdit(${i})">保存</button>
        </div>
      </div>
    </div>
  `}).join('');

  return `
    <div class="section">
      <div class="section-title">年齢別　目標</div>
      ${ageGoalsHTML}
      <button class="add-btn dashed" onclick="app.addAgeGoal()">
        <span class="icon-inline">${getIcon('plus')}</span>
        年齢目標を追加
      </button>
    </div>
  `;
}

/* ========================================
   スケジュール記入画面
   ======================================== */
function renderScheduleEntryPage(data) {
  const { dailySchedule } = data;
  const colors = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#00ACC1', '#1E88E5', '#5E35B1', '#D81B60', '#6D4C41', '#546E7A'];

  // 時間順にソート
  const sortedSchedule = dailySchedule && dailySchedule.length > 0
    ? [...dailySchedule].sort((a, b) => a.startHour - b.startHour)
    : [];

  const itemsHTML = sortedSchedule.length > 0
    ? sortedSchedule.map((slot) => {
        const originalIndex = dailySchedule.findIndex(s => s === slot);
        return `
        <div class="schedule-entry-item" style="border-left: 4px solid ${slot.color || colors[0]}">
          <div class="schedule-entry-time">
            <input type="time" class="schedule-time-input" value="${String(slot.startHour).padStart(2,'0')}:00"
                   onchange="app.updateFreeSchedule(${originalIndex}, 'startHour', parseInt(this.value.split(':')[0]))">
            <span>〜</span>
            <input type="time" class="schedule-time-input" value="${String(slot.endHour).padStart(2,'0')}:00"
                   onchange="app.updateFreeSchedule(${originalIndex}, 'endHour', parseInt(this.value.split(':')[0]))">
            <button class="schedule-delete-btn" onclick="app.deleteFreeSchedule(${originalIndex})">×</button>
          </div>
          <input type="text" class="schedule-entry-text" placeholder="予定を入力..."
                 value="${slot.activity || ''}"
                 onchange="app.updateFreeSchedule(${originalIndex}, 'activity', this.value)">
          <div class="schedule-color-picker">
            ${colors.map(c => `<span class="schedule-color-dot ${slot.color === c ? 'selected' : ''}" style="background:${c}" onclick="app.updateFreeSchedule(${originalIndex}, 'color', '${c}')"></span>`).join('')}
          </div>
        </div>
      `}).join('')
    : '<div class="widget-empty">予定を追加してください</div>';

  return `
    ${renderHeader('1日のスケジュール', { showBack: true })}
    <div class="content">
      <div class="schedule-entry-list">
        ${itemsHTML}
      </div>
      <button class="schedule-add-btn" onclick="app.showScheduleAddModal()">
        ${getIcon('plus')} 予定を追加
      </button>
    </div>
    ${renderNavBar('home')}
  `;
}

/* ========================================
   設定画面
   ======================================== */
function renderSettingsPage(data) {
  const { settings } = data;

  return `
    ${renderHeader('設定')}
    <div class="content">
      <div class="setting-section">
        <div class="setting-title">基本情報</div>
        <div class="setting-item inline-edit-item">
          <span class="setting-label">氏名</span>
          <span class="setting-value inline-editable" id="name-value" onclick="app.startInlineEdit('name')">${settings.name || '未設定'}</span>
        </div>
        <div class="setting-item inline-edit-item">
          <span class="setting-label">生年月日</span>
          <div class="birthday-input-group" id="birthday-group">
            ${(() => {
              const bd = settings.birthday || '';
              const parts = bd.split('-');
              const year = parts[0] || '';
              const month = parts[1] || '';
              const day = parts[2] || '';
              return `
                <input type="text" inputmode="numeric" class="birthday-field" id="bday-year" maxlength="4" placeholder="0000" value="${year}" oninput="app.handleBirthdayInput(this, 'year')" onfocus="this.select()">
                <span class="birthday-sep">/</span>
                <input type="text" inputmode="numeric" class="birthday-field" id="bday-month" maxlength="2" placeholder="00" value="${month}" oninput="app.handleBirthdayInput(this, 'month')" onfocus="this.select()">
                <span class="birthday-sep">/</span>
                <input type="text" inputmode="numeric" class="birthday-field" id="bday-day" maxlength="2" placeholder="00" value="${day}" oninput="app.handleBirthdayInput(this, 'day')" onfocus="this.select()">
              `;
            })()}
          </div>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">表示設定</div>
        <div class="setting-item">
          <span class="setting-label">ダークモード</span>
          <div class="toggle-switch ${settings.darkMode ? 'active' : ''}"
               onclick="app.toggleSetting('darkMode')"></div>
        </div>
        <div class="setting-item" onclick="app.showInputModalTypeModal()">
          <span class="setting-label">入力モーダル</span>
          <span class="setting-value">${{center:'センター',bottom:'ボトムシート',inline:'インライン',toast:'トースト型'}[settings.inputModalType] || 'センター'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">ウィジェットデザイン</div>
        <div class="setting-item" onclick="app.showScheduleWidgetStyleModal()">
          <span class="setting-label">スケジュール</span>
          <span class="setting-value">${{timeline:'タイムライン',blocks:'ブロック',gantt:'ガント',simple:'シンプル'}[settings.scheduleWidgetStyle] || 'タイムライン'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showRoutineWidgetStyleModal()">
          <span class="setting-label">ルーティン（ホーム）</span>
          <span class="setting-value">${{checklist:'チェックリスト',circle:'サークル',cards:'カード',minimal:'ミニマル'}[settings.routineWidgetStyle] || 'チェックリスト'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">表示</div>
        <div class="setting-item" onclick="app.showThemeModal()">
          <span class="setting-label">テーマカラー</span>
          <span class="setting-value">${settings.theme ? {blue:'ブルー',green:'グリーン',purple:'パープル',orange:'オレンジ',pink:'ピンク',mono:'モノクロ'}[settings.theme] : 'ベース'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showFontModal()">
          <span class="setting-label">フォント</span>
          <span class="setting-value">${settings.font ? '字体' + settings.font : 'システム標準'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showFontSizeModal()">
          <span class="setting-label">文字サイズ</span>
          <span class="setting-value">${settings.labelFontSize || settings.inputFontSize ? 'カスタム' : '標準'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showTransitionModal()">
          <span class="setting-label">画面切り替え</span>
          <span class="setting-value">${{none:'ベース',fade:'フェード',slide:'スライド',scale:'スケール',push:'プッシュ'}[settings.transition] || 'ベース'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showDetailBtnStyleModal()">
          <span class="setting-label">詳細ボタン形状</span>
          <span class="setting-value">${{raised:'浮き',outline:'枠線',pill:'ピル',flat:'フラット'}[settings.detailBtnStyle] || '浮き'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showDetailBtnColorModal()">
          <span class="setting-label">詳細ボタン配色</span>
          <span class="setting-value">${{adaptive:'テーマ連動',neutral:'固定グレー'}[settings.detailBtnColor] || 'テーマ連動'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showSchedulePatternModal()">
          <span class="setting-label">スケジュール形式</span>
          <span class="setting-value">${{hourly:'時間帯区切り',free:'自由形式'}[settings.schedulePattern] || '時間帯区切り'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">F・BOX</div>
        <div class="setting-item" onclick="app.showFboxStyleModal()">
          <span class="setting-label">F・BOXスタイル</span>
          <span class="setting-value">${{A:'3ボタン',B:'内部分岐'}[settings.fboxStyle] || '内部分岐'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">AI機能</div>
        <div class="setting-item" onclick="app.showAITestModal()">
          <span class="setting-label">
            🎤 音声入力テスト
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">データ</div>
        <div class="setting-item" onclick="app.exportData()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('export')}</span>
            データをエクスポート
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.importData()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('import')}</span>
            データをインポート
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item danger" onclick="app.confirmResetData()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('close')}</span>
            データ初期化
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">アプリ情報</div>
        <div class="setting-item">
          <span class="setting-label">バージョン</span>
          <span class="setting-value">1.1.0</span>
        </div>
      </div>
    </div>
    ${renderNavBar('settings')}
  `;
}

/* ========================================
   目標一覧画面
   ======================================== */
function renderGoalListPage(data) {
  const { monthlyGoal } = data;

  // 有効な長期目標をフィルタ（開始日 <= 今日 <= 期限日）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredGoals = (data.longTermGoals || []).filter(goal => {
    if (!goal.deadlineYear || !goal.deadlineMonth) return false;
    const deadline = new Date(goal.deadlineYear, goal.deadlineMonth - 1, 1);
    if (goal.startYear && goal.startMonth) {
      const startDate = new Date(goal.startYear, goal.startMonth - 1, 1);
      return startDate <= today && today <= deadline;
    }
    return today <= deadline;
  }).sort((a, b) => {
    const dateA = new Date(a.deadlineYear, a.deadlineMonth - 1, 1);
    const dateB = new Date(b.deadlineYear, b.deadlineMonth - 1, 1);
    return dateA - dateB;
  });

  // フィルタ済み目標をdataに保存
  data.filteredLongTermGoals = filteredGoals;
  if (data.currentLongTermIndex === undefined || data.currentLongTermIndex >= filteredGoals.length) {
    data.currentLongTermIndex = 0;
  }

  const currentGoal = filteredGoals[data.currentLongTermIndex] || null;
  const totalGoals = filteredGoals.length;
  const currentIndex = data.currentLongTermIndex;

  // 長期目標の残り日数計算
  let longTermDeadline = '';
  let longTermDaysLeft = '';
  if (currentGoal?.deadlineYear && currentGoal?.deadlineMonth) {
    longTermDeadline = `〆${currentGoal.deadlineYear}年${currentGoal.deadlineMonth}月`;
    const deadline = new Date(currentGoal.deadlineYear, currentGoal.deadlineMonth - 1, 1);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      longTermDaysLeft = `あと${diffDays}日`;
    } else if (diffDays === 0) {
      longTermDaysLeft = '今日まで';
    } else {
      longTermDaysLeft = '期限超過';
    }
  }

  // ページネーション表示
  let paginationHTML = '';
  if (totalGoals > 1) {
    const prevArrow = currentIndex > 0
      ? `<span class="goal-nav-arrow" onclick="event.stopPropagation(); app.prevLongTermGoal()">&lt;</span>`
      : `<span class="goal-nav-arrow invisible">&lt;</span>`;
    const nextArrow = currentIndex < totalGoals - 1
      ? `<span class="goal-nav-arrow" onclick="event.stopPropagation(); app.nextLongTermGoal()">&gt;</span>`
      : `<span class="goal-nav-arrow invisible">&gt;</span>`;
    paginationHTML = `<span class="goal-pagination">${prevArrow}${currentIndex + 1}/${totalGoals}${nextArrow}</span>`;
  }

  // 今月の残り日数計算
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthDaysLeft = lastDay.getDate() - today.getDate();
  const monthDeadline = `〆${today.getFullYear()}年${today.getMonth() + 1}月`;
  const monthDaysLeftText = monthDaysLeft > 0 ? `あと${monthDaysLeft}日` : '今月最終日';

  return `
    ${renderHeader('目標一覧')}
    <div class="content goal-list-content">
      <div class="goals-area">
        <div class="goal-card" id="home-card-longterm" onclick="app.handleLongTermCardClick(event)">
          <div class="goal-label">
            ${paginationHTML}
            <span class="icon-inline">${getIcon('target')}</span>
            今回の長期目標
            <span class="days-left">
              <span class="deadline-date">${longTermDeadline}</span>
              <span class="deadline-remaining">${longTermDaysLeft}</span>
            </span>
          </div>
          <div class="goal-title">${currentGoal?.goal || '目標を設定しましょう'}</div>
          <div class="goal-more"></div>
        </div>

        <div class="progress-card" id="home-card-monthly" onclick="app.handleMonthlyCardClick(event)">
          <div class="progress-label">
            <span class="icon-inline">${getIcon('flag')}</span>
            今月の目標
            <span class="days-left">
              <span class="deadline-date">${monthDeadline}</span>
              <span class="deadline-remaining">${monthDaysLeftText}</span>
            </span>
          </div>
          <div class="progress-detail">${monthlyGoal?.goal || '月次目標を設定しましょう'}</div>
          <div class="progress-more"></div>
        </div>
      </div>

      <div class="goal-menu">
        <div class="goal-menu-item" onclick="app.navigate('life')">
          <div class="goal-menu-icon">${getIcon('star')}</div>
          <div class="goal-menu-text">
            <div class="goal-menu-title">人生設計</div>
            <div class="goal-menu-sub">人生の最上位目的・年齢別目標</div>
          </div>
          <div class="goal-menu-arrow">${getIcon('forward')}</div>
        </div>
        <div class="goal-menu-item" onclick="app.navigate('longterm-list')">
          <div class="goal-menu-icon">${getIcon('target')}</div>
          <div class="goal-menu-text">
            <div class="goal-menu-title">長期目標</div>
            <div class="goal-menu-sub">数ヶ月〜数年単位の目標</div>
          </div>
          <div class="goal-menu-arrow">${getIcon('forward')}</div>
        </div>
        <div class="goal-menu-item" onclick="app.navigate('monthly-list')">
          <div class="goal-menu-icon">${getIcon('flag')}</div>
          <div class="goal-menu-text">
            <div class="goal-menu-title">月次目標</div>
            <div class="goal-menu-sub">今月達成する目標・ルーティン</div>
          </div>
          <div class="goal-menu-arrow">${getIcon('forward')}</div>
        </div>
        <div class="goal-menu-item" onclick="app.navigate('journal-list')">
          <div class="goal-menu-icon">${getIcon('journal')}</div>
          <div class="goal-menu-text">
            <div class="goal-menu-title">日誌一覧</div>
            <div class="goal-menu-sub">毎日の振り返り記録</div>
          </div>
          <div class="goal-menu-arrow">${getIcon('forward')}</div>
        </div>
      </div>
    </div>
    ${renderNavBar('goal-list')}
  `;
}

/* ========================================
   マニュアル一覧画面
   ======================================== */
function renderManualListPage(data) {
  const { manuals } = data;

  const listHTML = manuals && manuals.length > 0 ? manuals.map(manual => `
    <div class="list-item" onclick="app.viewManual(${manual.id})">
      <div class="list-icon">${getIcon('list')}</div>
      <div class="list-content">
        <div class="list-title">${manual.title || '無題のマニュアル'}</div>
        <div class="list-sub">${manual.category || '未分類'}</div>
      </div>
      <div class="list-arrow">${getIcon('forward')}</div>
    </div>
  `).join('') : '<div class="list-empty">マニュアルがありません</div>';

  return `
    ${renderHeader('マニュアル')}
    <div class="content">
      ${listHTML}
    </div>
    <div class="fab" onclick="app.createNewManual()">
      ${getIcon('plus')}
    </div>
    ${renderNavBar('manual-list')}
  `;
}

/* ========================================
   マニュアル詳細画面
   ======================================== */
function renderManualPage(data) {
  const { manual } = data;

  return `
    ${renderHeader(manual?.title || 'マニュアル', { showBack: true, rightIcon: 'memo', rightAction: 'app.editManual(' + manual?.id + ')' })}
    <div class="content">
      <div class="manual-content">
        ${manual?.content || 'コンテンツがありません'}
      </div>
    </div>
    ${renderNavBar('manual-list')}
  `;
}

/* ========================================
   マニュアル編集画面
   ======================================== */
function renderManualEditPage(data) {
  const { manual } = data;
  const isNew = !manual?.id;

  return `
    ${renderHeader(isNew ? 'マニュアル作成' : 'マニュアル編集', { showBack: true })}
    <div class="content">
      <div class="form-section">
        <div class="form-title">タイトル</div>
        <input class="form-input-single" placeholder="マニュアルのタイトル..." autocomplete="off"
          value="${manual?.title || ''}"
          onchange="app.updateManualField('title', this.value)">
      </div>

      <div class="form-section">
        <div class="form-title">カテゴリ</div>
        <input class="form-input-single" placeholder="例: 仕事、筋トレ、料理..." autocomplete="off"
          value="${manual?.category || ''}"
          onchange="app.updateManualField('category', this.value)">
      </div>

      <div class="form-section">
        <div class="form-title">内容</div>
        <textarea class="form-input tall" placeholder="マニュアルの内容を入力..." autocomplete="off"
          onchange="app.updateManualField('content', this.value)"
        >${manual?.content || ''}</textarea>
      </div>

      <div class="button-row">
        <button class="btn-primary" onclick="app.saveManual()">
          ${getIcon('save')} 保存
        </button>
        ${!isNew ? `<button class="btn-danger" onclick="app.deleteManual(${manual.id})">
          ${getIcon('close')} 削除
        </button>` : ''}
      </div>
    </div>
    ${renderNavBar('manual-list')}
  `;
}

/* ========================================
   振り返り画面
   ======================================== */
function renderReviewPage(data) {
  const { journals, monthlyGoal } = data;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // カレンダー生成
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let calendarHTML = `
    <div class="calendar-day header">日</div>
    <div class="calendar-day header">月</div>
    <div class="calendar-day header">火</div>
    <div class="calendar-day header">水</div>
    <div class="calendar-day header">木</div>
    <div class="calendar-day header">金</div>
    <div class="calendar-day header">土</div>
  `;

  for (let i = 0; i < firstDay; i++) {
    calendarHTML += '<div class="calendar-day"></div>';
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasData = journals.some(j => j.date === dateStr);
    const isToday = d === today.getDate();

    calendarHTML += `
      <div class="calendar-day ${hasData ? 'has-data' : ''} ${isToday ? 'today' : ''}"
           onclick="app.viewJournal('${dateStr}')">${d}</div>
    `;
  }

  return `
    ${renderHeader('振り返り')}
    <div class="content">
      <div class="tabs">
        <div class="tab active">週</div>
        <div class="tab">月</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('calendar')}</span>
          ${year}年${month + 1}月
        </div>
        <div class="calendar-grid">
          ${calendarHTML}
        </div>
      </div>

      <div class="chart-container">
        <span class="icon-inline">${getIcon('chart')}</span>
        達成率推移グラフ（準備中）
      </div>

      <div class="list-item" onclick="app.navigate('journal-list')">
        <div class="list-icon">${getIcon('journal')}</div>
        <div class="list-content">
          <div class="list-title">日誌一覧</div>
        </div>
        <div class="list-arrow">${getIcon('forward')}</div>
      </div>
      <div class="list-item" onclick="app.navigate('monthly-list')">
        <div class="list-icon">${getIcon('flag')}</div>
        <div class="list-content">
          <div class="list-title">月次目標</div>
        </div>
        <div class="list-arrow">${getIcon('forward')}</div>
      </div>
      <div class="list-item" onclick="app.navigate('longterm-list')">
        <div class="list-icon">${getIcon('target')}</div>
        <div class="list-content">
          <div class="list-title">長期目標</div>
        </div>
        <div class="list-arrow">${getIcon('forward')}</div>
      </div>
      <div class="list-item" onclick="app.navigate('life')">
        <div class="list-icon">${getIcon('star')}</div>
        <div class="list-content">
          <div class="list-title">人生設計</div>
        </div>
        <div class="list-arrow">${getIcon('forward')}</div>
      </div>
    </div>
    ${renderNavBar('home')}
  `;
}

/* ========================================
   ユーティリティ
   ======================================== */

function formatDateJapanese(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${year}年${parseInt(month)}月${parseInt(day)}日`;
}

function formatDateWithDayOfWeek(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = dayNames[date.getDay()];
  return `${parseInt(month)}月${parseInt(day)}日(${dayOfWeek})`;
}

function formatMonthJapanese(yearMonth) {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return `${year}年${parseInt(month)}月`;
}

function calculateRoutineRate(journal) {
  if (!journal || !journal.routines || journal.routines.length === 0) return 0;
  const completed = journal.routines.filter(r => r.done).length;
  return Math.round((completed / journal.routines.length) * 100);
}
