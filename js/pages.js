/* ========================================
   MM v1.1.0 - ページテンプレート
   SVGアイコン対応・統一デザイン版
   ======================================== */

// ルーティンが今日の曜日に該当するか（weekDays未設定=毎日=true）
function isRoutineActiveToday(routine, dateStr) {
  if (!routine.weekDays || routine.weekDays.length === 0) return true;
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  return routine.weekDays.includes(d.getDay());
}

// 曜日ラベル（短縮）
const weekDayLabels = ['日','月','火','水','木','金','土'];

// HTMLエスケープ
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
}

// CSS色値のサニタイズ（CSSインジェクション防止）
function sanitizeColor(c) {
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#4A90A4';
}

// ルーティンのstatus判定ヘルパー
function getRoutineStatus(routine) {
  if (!routine) return 'none';
  return routine.status || (routine.done ? 'done' : 'none');
}
function isRoutineDone(routine) {
  return getRoutineStatus(routine) === 'done';
}
function isRoutineActive(routine) {
  const s = getRoutineStatus(routine);
  return s === 'done' || s === 'partial';
}

// カテゴリ名の日本語マッピング
const categoryNames = {
  rei: '霊',
  shin: '心',
  tai: '体',
  gi: '技',
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
  const { showBack, rightIcon, rightAction, rightIcons, rightHtml, subtitle, titleAction, leftHtml } = options;

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

  let leftBtn = '<div class="header-spacer"></div>';
  if (showBack) {
    leftBtn = `
      <button class="header-back" onclick="app.goBack()">
        ${getIcon('back')}
        <span>${backLabel}</span>
      </button>
    `;
  } else if (leftHtml) {
    leftBtn = leftHtml;
  }

  let rightBtn = '<div class="header-spacer"></div>';
  if (rightHtml) {
    rightBtn = rightHtml;
  } else if (rightIcons && rightIcons.length > 0) {
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
  const titleClass = titleAction ? 'header-title header-title-tappable' : 'header-title';
  const titleClick = titleAction ? ` onclick="${titleAction}"` : '';

  return `
    <div class="header">
      ${leftBtn}
      <div class="header-center">
        <span class="${titleClass}"${titleClick}>${title}</span>
        ${subtitleHTML}
      </div>
      ${rightBtn}
    </div>
  `;
}

// ホーム用カレンダーボタン（日付入り）
function renderCalendarButton() {
  const today = new Date().getDate();
  return `
    <button class="home-cal-btn" onclick="app.showProgress()">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <text x="12" y="18.5" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" stroke="none" font-family="-apple-system,BlinkMacSystemFont,Roboto,sans-serif">${today}</text>
      </svg>
    </button>
  `;
}

// 定期見直しボタン（ホーム左上）
function renderReviewButton() {
  const hasBadge = app.hasReviewBadge();
  return `
    <button class="home-review-btn" onclick="app.showReviewChecklist()">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
      ${hasBadge ? '<span class="review-badge"></span>' : ''}
    </button>
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

  // 今日の曜日でフィルタ → タスクを上に、カテゴリ順でソート
  const catOrder = { rei: 0, shin: 1, tai: 2, gi: 3, sei: 4 };
  const sortedRoutines = routines.map((r, i) => ({ ...r, originalIndex: i }))
    .filter(r => isRoutineActiveToday(r))
    .sort((a, b) => {
      const oneTimeDiff = (b.isOneTime ? 1 : 0) - (a.isOneTime ? 1 : 0);
      if (oneTimeDiff !== 0) return oneTimeDiff;
      return (catOrder[a.category] ?? 99) - (catOrder[b.category] ?? 99);
    });

  // 現在時刻
  const now = new Date();
  const currentHour = now.getHours();

  // おすすめの行動を決定
  let recommendation = '';
  const unfinishedRoutines = routines.filter(r => isRoutineActiveToday(r) && !isRoutineDone(r));
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

  // ルーティン進捗（done=完了、partial=半分として計算）※曜日フィルタ済みのsortedRoutinesで計算
  const doneCount = sortedRoutines.filter(r => isRoutineDone(r)).length;
  const partialCount = sortedRoutines.filter(r => getRoutineStatus(r) === 'partial').length;
  const totalCount = sortedRoutines.length;
  const effectiveCount = doneCount + partialCount * 0.5;
  const progressPercent = totalCount > 0 ? Math.round((effectiveCount / totalCount) * 100) : 0;

  // 設定からウィジェットスタイル取得
  const scheduleStyle = data.settings?.scheduleWidgetStyle || 'timeline';
  const routineStyle = data.settings?.routineWidgetStyle || 'checklist';

  // ルーティン進捗バーHTML
  const routineProgressHTML = sortedRoutines.length > 0 ? `
    <div class="routine-progress-bar-wrap">
      <span class="routine-progress-text">${partialCount > 0 ? doneCount + '+' + partialCount + '△' : doneCount} / ${totalCount}</span>
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
          const status = getRoutineStatus(routine);
          const statusClass = status === 'done' ? 'checked' : status === 'partial' ? 'partial' : '';
          const statusIcon = status === 'done' ? '✓' : status === 'partial' ? '△' : '';
          const manualUrl = routine.manualUrl;
          const manualText = routine.manual;
          return `
          <div class="routine-card-full home-card ${isOpen ? 'open' : ''} ${statusClass} ${routine.isOneTime ? 'is-task' : ''}">
            <div class="rc-header">
              <span class="rc-check ${statusClass}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">${statusIcon}</span>
              <span class="rc-name">${escapeHtml(routine.name || '（未設定）')}</span>
              ${routine.isOneTime ? '' : `<span class="rc-toggle" onclick="event.stopPropagation(); app.toggleHomeRoutineCard(${routine.originalIndex})">${isOpen ? '▲' : '▼'}</span>`}
            </div>
            ${isOpen && !routine.isOneTime ? `
            <div class="rc-cores">
              <div class="rc-core"><span class="rc-icon">📝</span><span class="rc-label">前準備</span><span class="rc-text">${escapeHtml(routine.preparation || '-')}</span></div>
              <div class="rc-core"><span class="rc-icon">⚡</span><span class="rc-label">反射条件</span><span class="rc-text">${escapeHtml(routine.trigger || '-')}</span></div>
              <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-label">最低限</span><span class="rc-text">${escapeHtml(routine.minimumAction || '-')}</span></div>
              <div class="rc-core rc-manual">
                <span class="rc-icon">📖</span><span class="rc-label">マニュアル</span>
                ${manualUrl && /^https?:\/\//.test(manualUrl) ? `<a class="rc-manual-link" href="${escapeHtml(manualUrl)}" target="_blank" onclick="event.stopPropagation()">ドキュメントを開く →</a>` : '<span class="rc-text">-</span>'}
              </div>
              ${manualText ? `<div class="rc-manual-desc">${escapeHtml(manualText)}</div>` : ''}
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
          <div class="routine-mini-item ${getRoutineStatus(routine) === 'done' ? 'done' : getRoutineStatus(routine) === 'partial' ? 'partial' : ''}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">
            <span class="routine-mini-dot"></span>${escapeHtml(routine.name)}
          </div>
        `).join('')}
      </div>`;
  } else if (routineStyle === 'cards') {
    // スタイル3: カード
    routineItemsHTML = `
      <div class="routine-cards">
        ${sortedRoutines.map(routine => `
          <div class="routine-card ${getRoutineStatus(routine) === 'done' ? 'done' : getRoutineStatus(routine) === 'partial' ? 'partial' : ''}" onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})">
            <div class="routine-card-check">${getRoutineStatus(routine) === 'done' ? '✓' : getRoutineStatus(routine) === 'partial' ? '△' : ''}</div>
            <div class="routine-card-name">${escapeHtml(routine.name)}</div>
          </div>
        `).join('')}
      </div>`;
  } else if (routineStyle === 'minimal') {
    // スタイル4: ミニマル
    routineItemsHTML = `
      <div class="routine-minimal-header">${doneCount}/${totalCount} 完了</div>
      <div class="routine-minimal-dots">
        ${sortedRoutines.map(routine => `
          <div class="routine-minimal-dot ${getRoutineStatus(routine) === 'done' ? 'done' : getRoutineStatus(routine) === 'partial' ? 'partial' : ''}"
            onclick="event.stopPropagation(); app.toggleRoutine(${routine.originalIndex})"
            title="${escapeHtml(routine.name)}"></div>
        `).join('')}
      </div>
      <div class="routine-minimal-list">
        ${sortedRoutines.filter(r => !isRoutineDone(r)).map(routine => `
          <div class="routine-minimal-item">${escapeHtml(routine.name)}</div>
        `).join('')}
      </div>`;
  }

  // スケジュールをソートして表示（元のインデックスを保持）
  const sortedSchedule = dailySchedule && dailySchedule.length > 0
    ? dailySchedule.map((slot, i) => ({ ...slot, _origIdx: i })).sort((a, b) => (a.startHour * 60 + (a.startMinute || 0)) - (b.startHour * 60 + (b.startMinute || 0)))
    : [];

  // スケジュールウィジェットHTML（4スタイル）
  let scheduleItemsHTML = '';
  if (sortedSchedule.length === 0) {
    scheduleItemsHTML = `<div class="widget-empty">
      <span class="widget-empty-icon">${getIcon('calendar')}</span>
      <span class="widget-empty-text">タップして設定</span>
    </div>`;
  } else if (scheduleStyle === 'timeline') {
    // スタイル1: シンプルリスト（左寄せ・縦線区切り）
    let prevTimeKey = '';
    scheduleItemsHTML = `<div class="schedule-list">
      ${sortedSchedule.map(slot => {
        const h = String(slot.startHour).padStart(2, '0');
        const m = String(slot.startMinute || 0).padStart(2, '0');
        const timeKey = h + m;
        const showTime = timeKey !== prevTimeKey;
        prevTimeKey = timeKey;
        const leadingZero = h[0] === '0'
          ? '<span class="time-hidden-zero">0</span>' + h[1]
          : h;
        const timeDisplay = leadingZero + '：' + m;
        const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
        return `
          <div class="schedule-list-item ${isCurrent ? 'current' : ''}" onclick="event.stopPropagation(); app.openScheduleSlotFromHome(${slot._origIdx})">
            <span class="schedule-list-time">${showTime ? timeDisplay : ''}</span>
            <span class="schedule-list-activity">${escapeHtml(slot.activity || '予定なし')}</span>
          </div>`;
      }).join('')}
    </div>`;
  } else if (scheduleStyle === 'blocks') {
    // スタイル2: ブロック（塗りつぶし）
    scheduleItemsHTML = `<div class="schedule-blocks">
      ${sortedSchedule.map(slot => {
        const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
        const isPast = currentHour >= slot.endHour;
        const safeColor = sanitizeColor(slot.color);
        const bgColor = safeColor + '18';
        return `
          <div class="schedule-block ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}" style="background: ${bgColor}; border-left: 3px solid ${safeColor}" onclick="event.stopPropagation(); app.openScheduleSlotFromHome(${slot._origIdx})">
            <div class="schedule-block-time">${slot.startHour}:${String(slot.startMinute || 0).padStart(2, '0')} - ${slot.endHour}:${String(slot.endMinute || 0).padStart(2, '0')}</div>
            <div class="schedule-block-text">${escapeHtml(slot.activity || '予定なし')}</div>
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
          const startPos = slot.startHour + (slot.startMinute || 0) / 60;
          const endPos = slot.endHour + (slot.endMinute || 0) / 60;
          const left = ((startPos - minHour) / range) * 100;
          const width = ((endPos - startPos) / range) * 100;
          const isCurrent = currentHour >= slot.startHour && currentHour < slot.endHour;
          return `
            <div class="schedule-gantt-row" onclick="event.stopPropagation(); app.openScheduleSlotFromHome(${slot._origIdx})">
              <div class="schedule-gantt-bar ${isCurrent ? 'current' : ''}"
                style="left: ${left}%; width: ${width}%; background: ${sanitizeColor(slot.color)}">
                <span>${escapeHtml(slot.activity || '')}</span>
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
          <div class="schedule-simple-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}" onclick="event.stopPropagation(); app.openScheduleSlotFromHome(${slot._origIdx})">
            <span class="schedule-simple-time">${slot.startHour}:${String(slot.startMinute || 0).padStart(2, '0')}</span>
            <span class="schedule-simple-dot" style="background: ${sanitizeColor(slot.color)}"></span>
            <span class="schedule-simple-text">${escapeHtml(slot.activity || '-')}</span>
          </div>`;
      }).join('')}
    </div>`;
  }

  return `
    ${renderHeader('ホーム', { leftHtml: renderReviewButton(), rightHtml: `<div class="header-right-group"><span id="syncStatusIcon" class="sync-status sync-${app.syncStatus || 'offline'}" onclick="app.firebaseUser ? app.navigate('settings') : app.linkGoogleAccount()"></span>${renderCalendarButton()}</div>` })}
    <div class="home-monthly-banner" onclick="app.navigate('monthly')">
      <span class="home-monthly-label">今月の目標</span>
      <span class="home-monthly-text">${escapeHtml(data.monthlyGoal?.goal || '未設定')}</span>
      <span class="home-monthly-arrow">›</span>
    </div>
    <div class="content home-content">
      <div class="action-area">
        <div class="widget-row">
          <div class="widget-card schedule-widget" onclick="app.navigate('monthly-5')">
            <div class="widget-header">
              <span>今日の予定${fieldHelpIcon('home-schedule')}</span>
            </div>
            <div class="schedule-pattern-bar" onclick="event.stopPropagation(); app.showPatternSelectModal()">
              <span class="schedule-pattern-name">${escapeHtml(todayPattern?.name || '未設定')}</span>
              <span class="schedule-pattern-arrow">▼</span>
            </div>
            <div class="widget-content">
              ${scheduleItemsHTML}
            </div>
          </div>
          <div class="widget-card routine-widget" onclick="app.navigate('journal-supplement')">
            <div class="widget-header">
              <span>今日やる事${fieldHelpIcon('home-routine')}</span>
              <button class="widget-header-add" onclick="event.stopPropagation(); app.addOneTimeTask()">＋</button>
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
   GTDページ
   ======================================== */
function renderGTDPage(data) {
  const currentTab = app.currentGTDTab || 'firstbox';
  const tabs = [
    { id: 'firstbox', label: 'F・BOX' },
    { id: 'task', label: 'タスク' },
    { id: 'routine', label: 'ルーティン' },
    { id: 'material', label: '資料' }
  ];

  let tabContent = '';
  switch (currentTab) {
    case 'firstbox':
      tabContent = renderGTDFirstBoxTab(data);
      break;
    case 'task':
      tabContent = renderGTDTaskTab(data);
      break;
    case 'routine':
      tabContent = renderGTDRoutineTab(data);
      break;
    case 'material':
      tabContent = renderGTDMaterialTab(data);
      break;
  }

  return `
    <div class="header">
      <div class="header-spacer"></div>
      <div class="header-center"><span class="header-title">GTD</span></div>
      <button class="header-icon" onclick="${currentTab === 'routine' ? 'app.openRoutineNoteView()' : 'app.openNoteView()'}">
        ${getIcon('table')}
      </button>
    </div>
    <div class="gtd-tab-bar">
      ${tabs.map(tab => `
        <div class="gtd-tab ${currentTab === tab.id ? 'active' : ''}"
             onclick="app.switchGTDTab('${tab.id}')">
          ${tab.label}${fieldHelpIcon('tab-' + tab.id)}
        </div>
      `).join('')}
    </div>
    <div class="content gtd-content">
      ${tabContent}
    </div>
    ${currentTab === 'firstbox' && (app.firstBoxItems || []).length > 0 ? `
      <div class="gtd-fixed-bottom">
        <button class="fbox-organize-btn fbox-organize-compact" onclick="app.startFirstBoxOrganize()">
          <span class="fbox-organize-icon">${getIcon('sort')}</span>
          <span>振り分け</span>
        </button>
      </div>
    ` : ''}
    ${renderNavBar('gtd')}
  `;
}

function renderGTDFirstBoxTab(data) {
  const items = app.firstBoxItems || [];
  return `
    <div class="fbox-list-section">
      <div class="fbox-quick-add">
        <textarea class="fbox-quick-input" id="firstboxQuickInput" rows="2"
          placeholder="気になること、思いついたことを入力..."
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();app.quickAddToFirstBox()}"
        ></textarea>
        <button class="fbox-quick-submit" onclick="app.quickAddToFirstBox()">追加</button>
      </div>

      ${items.length > 0 ? `
        <div class="fbox-list-header">
          <span>未処理</span>
          <span class="fbox-list-count">${items.length}件</span>
        </div>
        ${items.map(item => `
          <div class="fbox-item">
            <div class="fbox-check" onclick="event.stopPropagation(); app.checkFirstBoxItem(${item.id})"></div>
            <div class="fbox-item-main" onclick="app.startFirstBoxSort(${item.id})">
              <div class="fbox-item-text">${escapeHtml(item.text)}</div>
            </div>
          </div>
        `).join('')}
      ` : `
        <div class="fbox-empty">
          <div class="fbox-empty-icon">${getIcon('inbox')}</div>
          <p>未処理のアイテムはありません</p>
        </div>
      `}
    </div>
  `;
}

function renderGTDTaskTab(data) {
  const currentTab = app.currentTaskTab || 'urgent';
  const taskTabs = [
    { id: 'urgent', label: 'すぐやる', icon: 'zap' },
    { id: 'action', label: 'アクションリスト', icon: 'forward' },
    { id: 'project', label: 'プロジェクト', icon: 'folder' },
    { id: 'waiting', label: '待機', icon: 'clock' },
    { id: 'calendar', label: 'カレンダー', icon: 'calendar' },
    { id: 'wish', label: 'いつか', icon: 'star' }
  ];
  const tasks = (app.taskItems || []).filter(t => t.type === currentTab);

  return `
    <div class="task-tab-bar">
      ${taskTabs.map(tab => {
        const count = (app.taskItems || []).filter(t => t.type === tab.id && (t.status || 'open') !== 'done').length;
        return `
          <div class="task-tab ${currentTab === tab.id ? 'active' : ''}"
               onclick="app.switchTaskTab('${tab.id}')">
            <span class="task-tab-label">${tab.label}${fieldHelpIcon('task-' + tab.id)}</span>
            <span class="task-tab-count">${count}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="task-list">
      ${tasks.length > 0 ? tasks.map(task => {
        const isDone = (task.status || 'open') === 'done';
        return `
        <div class="task-item ${isDone ? 'done' : ''}" onclick="app.showEditTaskModal(${task.id})">
          <div class="task-item-check ${isDone ? 'checked' : ''}" onclick="event.stopPropagation(); app.toggleTaskStatus(${task.id})">
            ${isDone ? getIcon('check') : ''}
          </div>
          <div class="task-item-content">
            <div class="task-item-title">${escapeHtml(task.title || '')}</div>
            ${task.notes ? `<div class="task-item-sub">${escapeHtml(task.notes.substring(0, 40))}</div>` : ''}
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTaskById(${task.id})">${getIcon('close')}</button>
        </div>
      `}).join('') : `
        <div class="task-empty">このカテゴリにタスクはありません</div>
      `}
    </div>
    <button class="task-add-fab" onclick="app.showAddTaskModal()">
      ${getIcon('plus')}
    </button>
  `;
}

function renderGTDRoutineTab(data) {
  const currentTab = app.currentRoutineTab || 'goal';
  const routineTabs = [
    { id: 'goal', label: '目標' },
    { id: 'obligation', label: '義務' },
    { id: 'maintenance', label: '維持' },
    { id: 'principle', label: '原則' },
    { id: 'candidate', label: '候補' }
  ];
  const routines = (app.routineItems || []).filter(r => r.type === currentTab);

  return `
    <div class="routine-tab-bar">
      ${routineTabs.map(tab => {
        const count = (app.routineItems || []).filter(r => r.type === tab.id && (r.status || 'open') !== 'done').length;
        return `
          <div class="routine-tab ${currentTab === tab.id ? 'active' : ''}"
               onclick="app.switchRoutineTab('${tab.id}')">
            <span class="routine-tab-label">${tab.label}${fieldHelpIcon('routine-' + tab.id)}</span>
            <span class="routine-tab-count">${count}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="routine-list">
      ${routines.length > 0 ? routines.map(routine => {
        const isDone = (routine.status || 'open') === 'done';
        return `
        <div class="routine-item ${isDone ? 'done' : ''}" onclick="app.showEditRoutineModal(${routine.id})">
          <div class="routine-item-check ${isDone ? 'checked' : ''}" onclick="event.stopPropagation(); app.toggleRoutineStatus(${routine.id})">
            ${isDone ? getIcon('check') : ''}
          </div>
          <div class="routine-item-content">
            <div class="routine-item-title">${escapeHtml(routine.title || '')}</div>
            ${routine.notes ? `<div class="routine-item-sub">${escapeHtml(routine.notes.substring(0, 40))}</div>` : ''}
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteRoutineById(${routine.id})">${getIcon('close')}</button>
        </div>
      `}).join('') : `
        <div class="routine-empty">このカテゴリにルーティンはありません</div>
      `}
    </div>
    <button class="routine-add-fab" onclick="app.showAddRoutineModal()">
      ${getIcon('plus')}
    </button>
  `;
}

function renderGTDMaterialTab(data) {
  const materials = app.materialItems || [];

  return `
    <div class="material-list">
      ${materials.length > 0 ? materials.map(m => `
        <div class="material-item" onclick="app.openMaterial(${m.id})">
          <div class="material-item-icon">${getIcon('file')}</div>
          <div class="material-item-content">
            <div class="material-item-title">${escapeHtml(m.title || '無題')}</div>
            <div class="material-item-meta">
              ${m.content ? `<span>${escapeHtml(m.content.substring(0, 30))}</span>` : ''}
              ${m.fileName ? `<span class="material-item-type">${escapeHtml(m.fileName)}</span>` : ''}
            </div>
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteMaterialById(${m.id})">${getIcon('close')}</button>
        </div>
      `).join('') : `
        <div class="material-empty">
          <div class="material-empty-icon">${getIcon('file')}</div>
          <p>資料はまだありません</p>
        </div>
      `}
    </div>
    <button class="material-add-fab" onclick="app.startAddMaterial()">
      ${getIcon('plus')}
    </button>
  `;
}

/* ========================================
   ナビゲーションバー
   ======================================== */
function renderNavBar(currentPage) {
  // GTD配下のページは全てGTDをアクティブにする
  const gtdPages = ['gtd', 'task-list', 'routine-list', 'material-list', 'firstbox-list', 'firstbox', 'firstbox-items', 'material-add', 'material-view', 'note-view'];
  const reviewPages = ['review', 'review-list'];
  const activePage = reviewPages.includes(currentPage) ? 'review-list' : (gtdPages.includes(currentPage) ? 'gtd' : currentPage);

  const navItems = [
    { id: 'home', icon: 'home', label: 'ホーム' },
    { id: 'gtd', icon: 'inbox', label: 'GTD' },
    { id: 'goal-list', icon: 'book', label: '目標一覧' },
    { id: 'review-list', icon: 'chart', label: '振り返り' },
    { id: 'settings', icon: 'settings', label: '設定' }
  ];

  const navHTML = navItems.map(item => `
    <div class="nav-item ${activePage === item.id ? 'active' : ''}"
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
    const count = app.getRoutinesByTab(tab.id).filter(r => (r.status || 'open') !== 'done').length;
    return `
      <button class="routine-tab ${currentTab === tab.id ? 'active' : ''}"
              onclick="app.switchRoutineTab('${tab.id}')">
        <span class="routine-tab-label">${tab.label}${fieldHelpIcon('routine-' + tab.id)}</span>
        ${count > 0 ? `<span class="routine-tab-count">${count}</span>` : ''}
      </button>
    `;
  }).join('');

  const items = app.getRoutinesByTab(currentTab);

  // 達成率エリア
  const graphPeriod = app.routineGraphPeriod || 'week';
  const graphPlaceholder = `
    <div class="routine-graph-section">
      <div class="routine-graph-header">
        <span>達成率</span>
        <div class="routine-graph-toggle">
          <button class="routine-graph-btn ${graphPeriod === 'week' ? 'active' : ''}" onclick="app.switchRoutineGraphPeriod('week')">週次</button>
          <button class="routine-graph-btn ${graphPeriod === 'month' ? 'active' : ''}" onclick="app.switchRoutineGraphPeriod('month')">月次</button>
        </div>
      </div>
      <div class="routine-graph-body" id="routine-graph-bars">
        <div class="routine-graph-loading">読み込み中...</div>
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
        if (!isNaN(d.getTime())) {
          subInfo = `<div class="routine-item-sub">次回: ${d.getMonth()+1}/${d.getDate()}</div>`;
        }
      }
      if (item.type === 'candidate' && item.createdAt) {
        const created = new Date(item.createdAt);
        if (!isNaN(created.getTime())) {
          const now = new Date();
          const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          const months = Math.floor(diffDays / 30);
          subInfo = `<div class="routine-item-sub">追加から${months > 0 ? months + 'ヶ月' : diffDays + '日'}${diffDays >= 90 ? ' ⚠ 3ヶ月超過' : ''}</div>`;
        }
      }
      return `
        <div class="routine-item" onclick="app.showEditRoutineModal(${item.id})">
          <div class="routine-item-content">
            <div class="routine-item-title">${escapeHtml(item.title)}</div>
            ${subInfo}
            ${item.notes ? `<div class="routine-item-sub">${escapeHtml(item.notes.substring(0, 40))}</div>` : ''}
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteRoutineById(${item.id})">${getIcon('close')}</button>
        </div>
      `;
    }).join('');
  }

  // 月次振り返りへの導線
  const reviewPlaceholder = `
    <div class="routine-review-link" onclick="app.navigate('monthly'); app.monthlyPageIndex=6; app.render()">
      <span class="routine-review-icon">📊</span>
      <span>月次振り返り（ルーティン評価）を開く</span>
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
    ${renderNavBar('gtd')}
  `;
}

/* ========================================
   タスク一覧ページ（5タブ切り替え）
   ======================================== */
function renderTaskListPage(data) {
  const currentTab = app.currentTaskTab || 'urgent';
  const tabs = [
    { id: 'urgent', label: 'すぐやる', icon: 'zap' },
    { id: 'action', label: 'アクションリスト', icon: 'forward' },
    { id: 'project', label: 'プロジェクト', icon: 'list' },
    { id: 'waiting', label: '待機', icon: 'clock' },
    { id: 'calendar', label: 'カレンダー', icon: 'calendar' },
    { id: 'wish', label: 'いつか', icon: 'star' }
  ];

  const tabBarHTML = tabs.map(tab => {
    const count = app.getTasksByTab(tab.id).filter(t => (t.status || 'open') !== 'done').length;
    return `
      <button class="task-tab ${currentTab === tab.id ? 'active' : ''}"
              onclick="app.switchTaskTab('${tab.id}')">
        <span class="task-tab-icon">${getIcon(tab.icon)}</span>
        <span class="task-tab-label">${tab.label}${fieldHelpIcon('task-' + tab.id)}</span>
        ${count > 0 ? `<span class="task-tab-count">${count}</span>` : ''}
      </button>
    `;
  }).join('');

  const items = app.getTasksByTab(currentTab);
  let listHTML = '';

  if (items.length === 0) {
    const emptyMessages = {
      urgent: 'すぐやるタスクはありません',
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
    // 親タスク→子タスクの順で表示
    const parentItems = items.filter(t => !t.parentId);
    const childMap = {};
    items.filter(t => t.parentId).forEach(t => {
      if (!childMap[t.parentId]) childMap[t.parentId] = [];
      childMap[t.parentId].push(t);
    });
    listHTML = parentItems.map(item => {
      let html = renderTaskItem(item, currentTab);
      const children = childMap[item.id] || [];
      if (children.length > 0) {
        html += children.map(c => renderTaskItem(c, currentTab, true)).join('');
      }
      html += `<div class="task-add-subtask" onclick="app.showAddSubtaskModal(${item.id})">＋ サブタスク</div>`;
      return html;
    }).join('');
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
    ${renderNavBar('gtd')}
  `;
}

function renderTaskItem(item, type, isChild) {
  let subInfo = '';

  if (type === 'project' && item.completionCriteria && !isChild) {
    subInfo = `<div class="task-item-sub">完了条件: ${escapeHtml(item.completionCriteria)}</div>`;
  } else if (type === 'waiting') {
    const parts = [];
    if (item.who) parts.push(escapeHtml(item.who));
    if (item.deadline) {
      const d = new Date(item.deadline);
      if (!isNaN(d.getTime())) parts.push(`${d.getMonth()+1}/${d.getDate()}まで`);
    }
    if (parts.length > 0) subInfo = `<div class="task-item-sub">${parts.join(' ・ ')}</div>`;
  } else if (type === 'calendar' && item.dateTime) {
    const d = new Date(item.dateTime);
    if (!isNaN(d.getTime())) {
      subInfo = `<div class="task-item-sub">${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</div>`;
    }
  }

  const safeId = parseInt(item.id, 10);
  if (isNaN(safeId)) return '';
  const isDone = (item.status || 'open') === 'done';

  return `
    <div class="task-item ${isDone ? 'done' : ''}${isChild ? ' task-item-child' : ''}" onclick="app.showEditTaskModal(${safeId})">
      <div class="task-item-check ${isDone ? 'checked' : ''}" onclick="event.stopPropagation(); app.toggleTaskStatus(${safeId})">
        ${isDone ? getIcon('check') : ''}
      </div>
      <div class="task-item-content">
        <div class="task-item-title">${escapeHtml(item.title)}</div>
        ${subInfo}
        ${item.notes ? `<div class="task-item-sub">${escapeHtml(item.notes.substring(0, 40))}</div>` : ''}
      </div>
      <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTaskById(${safeId})">${getIcon('close')}</button>
    </div>
  `;
}

/* ========================================
   資料一覧ページ
   ======================================== */
function renderMaterialListPage(data) {
  const items = app.materialItems || [];

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
      const hasFile = item.fileData || item.fileName;
      const hasText = item.content && item.content.trim();
      const icon = hasFile ? 'file' : 'edit';
      let snippet = '';
      if (hasText) {
        snippet = escapeHtml(item.content.substring(0, 60)).replace(/\n/g, ' ');
        if (item.content.length > 60) snippet += '…';
      }
      let metaHTML = '';
      if (item.fileName) {
        const kb = item.fileSize ? Math.round(item.fileSize / 1024) : 0;
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
        metaHTML = `<span class="material-item-file">${getIcon('file')} ${escapeHtml(item.fileName)}（${sizeStr}）</span>`;
      }
      return `
        <div class="material-item" onclick="app.openMaterial(${item.id})">
          <div class="material-item-icon">${getIcon(icon)}</div>
          <div class="material-item-content">
            <div class="material-item-title">${escapeHtml(item.title || '無題')}</div>
            ${snippet ? `<div class="material-item-snippet">${snippet}</div>` : ''}
            ${metaHTML ? `<div class="material-item-meta">${metaHTML}</div>` : ''}
          </div>
          <button class="delete-btn" onclick="event.stopPropagation(); app.deleteMaterialById(${item.id})">${getIcon('close')}</button>
        </div>
      `;
    }).join('');
  }

  return `
    ${renderHeader('資料')}
    <div class="content">
      <div class="material-list">${listHTML}</div>
      <button class="material-add-fab" onclick="app.startAddMaterial()">
        ${getIcon('plus')}
      </button>
    </div>
    ${renderNavBar('gtd')}
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

  let textHTML = '';
  if (item.content && item.content.trim()) {
    textHTML = `<div class="material-view-text">${escapeHtml(item.content).replace(/\n/g, '<br>')}</div>`;
  }

  let fileHTML = '';
  const blobUrl = appRef._viewingMaterialBlobUrl;
  if (blobUrl && item.mimeType) {
    if (item.mimeType.startsWith('image/')) {
      fileHTML = `<img src="${blobUrl}" class="material-view-image" alt="${escapeHtml(item.title || '')}">`;
    } else if (item.mimeType.startsWith('audio/')) {
      fileHTML = `<audio controls src="${blobUrl}" class="material-view-audio"></audio>`;
    } else if (item.mimeType.startsWith('video/')) {
      fileHTML = `<video controls src="${blobUrl}" class="material-view-video"></video>`;
    } else {
      fileHTML = `<a href="${blobUrl}" target="_blank" class="material-view-file-link">${escapeHtml(item.fileName || 'ファイルを開く')}</a>`;
    }
  }

  return `
    ${renderHeader(escapeHtml(item.title || '無題'), { showBack: true })}
    <div class="content">
      <div class="material-view-content">
        ${textHTML}
        ${fileHTML}
      </div>
    </div>
  `;
}

/* ========================================
   資料追加ページ
   ======================================== */
function renderMaterialAddPage(appRef) {
  return `
    ${renderHeader('資料を追加', { showBack: true })}
    <div class="content">
      <div class="material-add-form">
        <input type="text" class="material-add-input" id="materialTitleInput" placeholder="タイトル" autocomplete="off">
        <textarea class="material-add-textarea" id="materialContentInput" placeholder="メモ・内容を入力"></textarea>
        <div class="material-add-file-area" id="materialFileArea">
          <input type="file" id="materialFileInput" accept="image/*,audio/*,video/*,.pdf,application/pdf" style="display:none;" onchange="app.onMaterialFileSelected()">
          <button class="material-add-file-btn" onclick="document.getElementById('materialFileInput').click()">
            ${getIcon('file')} ファイルを添付
          </button>
          <span class="material-add-file-name" id="materialFileName"></span>
          <div id="materialFilePreview"></div>
        </div>
        <button class="material-add-save-btn" onclick="app.saveNewMaterial()">保存</button>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
          <h2 class="firstbox-question">問4：今から2分以内に終えられますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4', 'quick')">はい</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4', 'long')">いいえ</button>
          </div>
        </div>
      `;
      break;
    case 'q4-sub':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
          <h2 class="firstbox-question">今この場で実行できますか？</h2>
          <div class="firstbox-choices">
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4-sub', 'now')">はい、今やる</button>
            <button class="firstbox-choice-btn" onclick="app.firstBoxAnswer('q4-sub', 'later')">今はできない</button>
          </div>
        </div>
      `;
      break;
    case 'q5':
      content = `
        <div class="firstbox-step">
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
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
        'discard': { icon: 'trash', label: '不要（捨てました）', color: '#999', nav: false },
        'someday': { icon: 'star', label: 'いつかやりたいリスト', color: '#f59e0b', nav: true },
        'reference': { icon: 'file', label: '資料保管', color: '#6366f1', nav: true },
        'goal-routine': { icon: 'target', label: '目標ルーティン', color: '#ef4444', nav: true },
        'duty-routine': { icon: 'flag', label: '義務ルーティン', color: '#ef4444', nav: true },
        'maintain-routine': { icon: 'help', label: '維持ルーティン', color: '#ef4444', nav: true },
        'principle-routine': { icon: 'star', label: '指針ルーティン', color: '#ef4444', nav: true },
        'candidate-routine': { icon: 'clock', label: '候補ルーティン', color: '#999', nav: true },
        'project': { icon: 'task', label: 'プロジェクトリスト', color: '#3b82f6', nav: true },
        'do-now': { icon: 'check', label: 'では今やってみましょう！', color: '#22c55e', nav: false },
        'waiting': { icon: 'clock', label: '待機リスト', color: '#f59e0b', nav: true },
        'calendar': { icon: 'calendar', label: 'カレンダー', color: '#ec4899', nav: true },
        'urgent': { icon: 'zap', label: 'すぐやるリスト', color: '#ef4444', nav: true },
        'action': { icon: 'forward', label: 'アクションリスト', color: '#3b82f6', nav: true }
      };
      const result = resultMap[app.firstBoxResult] || { icon: 'check', label: '完了', color: '#22c55e', nav: false };
      const canNavigate = result.nav && app.firstBoxResult !== 'discard';
      const canEdit = app._lastCreatedItemId && app.firstBoxResult !== 'discard' && app.firstBoxResult !== 'do-now';
      content = `
        <div class="firstbox-step firstbox-result">
          <div class="firstbox-result-icon" style="color: ${result.color}">${getIcon(result.icon)}</div>
          <div class="firstbox-input-display">${escapeHtml(inputText)}</div>
          <div class="firstbox-result-label${canNavigate ? ' tappable' : ''}" style="color: ${result.color}"
               ${canNavigate ? 'onclick="app.navigateToFirstBoxResult()"' : ''}>→ ${result.label}${canNavigate ? ' ▸' : ''}</div>
          ${canEdit ? `<button class="firstbox-edit-btn" onclick="app.editLastCreatedItem()">追加情報を書く</button>` : ''}
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
      ${renderNavBar('gtd')}
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
    if (isNaN(date.getTime())) return '';
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
        <div class="fbox-check" onclick="event.stopPropagation(); app.checkFirstBoxItem(${item.id})"></div>
        <div class="fbox-item-main" onclick="app.startFirstBoxSort(${item.id})">
          <span class="fbox-item-text">${escapeHtml(item.text)}</span>
          <span class="fbox-item-time">${timeAgo(item.createdAt)}</span>
        </div>
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
    // パターンB：入力 + 下部固定ボタン
    return `
      <div class="page-container">
        ${renderHeader('F・BOX', { showBack: true })}
        <div class="content fbox-input-content">
          <div class="fbox-list-section">
            <textarea class="fbox-quick-input fbox-quick-input-large" id="firstboxQuickInput" placeholder="アイディア、タスク、小さなメモ etc...\n頭の中にあることをなんでも書き出しましょう"></textarea>
          </div>
        </div>
        <div class="fbox-bottom-buttons">
          <button class="fbox-bottom-btn" onclick="app.quickAddToFirstBox()">とりあえず入れる</button>
          <button class="fbox-bottom-btn" onclick="app.quickSortFromInput()">そのまま振り分ける</button>
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
    if (isNaN(date.getTime())) return '';
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
        <div class="fbox-check" onclick="event.stopPropagation(); app.checkFirstBoxItem(${item.id})"></div>
        <div class="fbox-item-main" onclick="app.startFirstBoxSort(${item.id})">
          <span class="fbox-item-text">${escapeHtml(item.text)}</span>
          <span class="fbox-item-time">${timeAgo(item.createdAt)}</span>
        </div>
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
      ${renderNavBar('gtd')}
    </div>
  `;
}

/* ========================================
   今日のタスク画面
   ======================================== */
function renderTasksPage(data) {
  const todayJournal = data.todayJournal || {};
  const monthlyGoal = data.monthlyGoal;
  const routineRate = calculateRoutineRate(todayJournal);
  const routines = todayJournal.routines || [];
  const activeRoutines = routines.filter(r => isRoutineActiveToday(r, todayJournal.date));
  const completedTasks = activeRoutines.filter(r => isRoutineDone(r)).length;

  const catOrd = { rei: 0, shin: 1, tai: 2, gi: 3, sei: 4 };
  const routinesHTML = routines.map((routine, index) => ({ ...routine, originalIndex: index }))
    .filter(r => isRoutineActiveToday(r, todayJournal.date))
    .sort((a, b) => (catOrd[a.category] ?? 99) - (catOrd[b.category] ?? 99))
    .map(routine => {
    const index = routine.originalIndex;
    const status = getRoutineStatus(routine);
    const statusIcon = status === 'done' ? getIcon('check') : status === 'partial' ? '△' : '';
    return `
    <div class="task-item ${status === 'done' ? 'completed' : status === 'partial' ? 'partial' : ''}">
      <div class="task-check ${status === 'done' ? 'done' : status === 'partial' ? 'partial' : ''}"
           onclick="app.toggleRoutine(${index})">${statusIcon}</div>
      <span class="task-tag tag-${routine.category}">${categoryNames[routine.category]}</span>
      <span class="task-text">${escapeHtml(routine.name || `ルーティン${index + 1}`)}</span>
    </div>
  `}).join('');

  const scheduleHTML = (todayJournal?.schedule || []).map((item, index) => `
    <div class="task-item ${item.done ? 'completed' : ''}">
      <div class="task-check ${item.done ? 'done' : ''}"
           onclick="app.toggleSchedule(${index})">${item.done ? getIcon('check') : ''}</div>
      <span class="task-text">${escapeHtml(item.name)}</span>
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
        <div class="progress-text">${completedTasks}/${activeRoutines.length} 完了（${routineRate}%）</div>
      </div>

      <div class="now-action">
        <div class="now-label">
          <span class="icon-inline">${getIcon('clock')}</span>
          今やる理想の行動
        </div>
        <div class="now-content">${escapeHtml(getCurrentIdealAction(todayJournal)) || '予定を確認しましょう'}</div>
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
          <span class="task-text">期日目標：${escapeHtml(todayJournal.coreActions?.deadline?.name || '---')}</span>
        </div>
        <div class="task-item ${todayJournal.coreActions?.processing?.done ? 'completed' : ''}">
          <div class="task-check ${todayJournal.coreActions?.processing?.done ? 'done' : ''}"
               onclick="app.toggleCoreAction('processing')">${todayJournal.coreActions?.processing?.done ? getIcon('check') : ''}</div>
          <span class="task-text">要処理：${escapeHtml(todayJournal.coreActions?.processing?.name || '---')}</span>
        </div>
      </div>
    </div>
    ${renderNavBar('home')}
  `;
}

// 現在の理想の行動を取得
function getCurrentIdealAction(journal) {
  const unfinished = (journal.routines || []).find(r => !isRoutineDone(r) && r.name);
  if (unfinished) return unfinished.name;
  const unfinishedSchedule = (journal.schedule || []).find(s => !s.done);
  if (unfinishedSchedule) return unfinishedSchedule.name;
  return null;
}

/* ========================================
   AIコメントセクション（日誌内）
   ======================================== */
function renderAICommentSection(todayJournal) {

  const aiComment = todayJournal.aiComment;
  const lp = 'ontouchstart="app._aiBtnT=setTimeout(function(){app._aiBtnL=true;app.showAIPresetPicker()},500)" ontouchend="clearTimeout(app._aiBtnT);if(!app._aiBtnL)app.generateAIComment();app._aiBtnL=false" ontouchmove="clearTimeout(app._aiBtnT)" onmousedown="app._aiBtnT=setTimeout(function(){app._aiBtnL=true;app.showAIPresetPicker()},500)" onmouseup="clearTimeout(app._aiBtnT);if(!app._aiBtnL)app.generateAIComment();app._aiBtnL=false" onmouseleave="clearTimeout(app._aiBtnT)"';

  let contentHTML = '';
  if (!aiComment) {
    contentHTML =
      '<button class="ai-comment-gen-btn" ' + lp + '>AIに聞く</button>' +
      '<div class="ai-comment-hint">長押しでプリセット変更</div>';
  } else {
    const commentText = aiComment.text || aiComment.normal || '';
    contentHTML =
      '<div class="ai-comment-header">' +
        '<button class="ai-comment-regen-btn" ' + lp + '>再生成</button>' +
      '</div>' +
      '<div class="ai-comment-body"><div class="ai-comment-text">' + escapeHtml(commentText) + '</div></div>' +
      '<div class="ai-comment-meta">' + new Date(aiComment.generatedAt).toLocaleString('ja-JP') + '</div>';
  }

  return '<div class="form-section ai-comment-form-section">' +
    '<div class="form-title ai-comment-title">&#x1F916; AIコメント</div>' +
    '<div id="ai-comment-section">' + contentHTML + '</div>' +
  '</div>';
}

/* ========================================
   日誌画面（スワイプ対応）
   ======================================== */
function renderJournalPage(data) {
  const todayJournal = data.todayJournal || {};
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

      <div class="form-section journal-title-section">
        <input type="text" class="journal-title-input" id="journal-title-input"
          placeholder="今日のタイトル（空欄で自動生成）"
          value="${escapeHtml(todayJournal?.title || '')}"
          onchange="app.updateJournalTitle(this.value)"
          autocomplete="off" maxlength="30">
      </div>

      <div class="form-section">
        <div class="form-title">今日の意気込み${fieldHelpIcon('journal-resolution')}${app.resolutionAutoPopulated ? ' <span class="auto-populated-badge">昨日から反映</span>' : ''}</div>
        <textarea class="form-input" id="journal-field-resolution" placeholder="今日1日の意気込みを書く..." autocomplete="off"
          onchange="app.updateResolution(this.value)"
        >${escapeHtml(todayJournal?.resolution || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-resolution" onclick="app.proofreadField('resolution')">AI添削</button></div>
      </div>

      <div class="score-items-section">
        <div class="score-items-header">
          <div class="score-items-label">今日の点数${fieldHelpIcon('journal-score')}</div>
          <div class="score-items-average">${typeof todayJournal.score === 'number' ? (Number.isInteger(todayJournal.score) ? todayJournal.score : todayJournal.score.toFixed(1)) : '---'} <span class="score-items-unit">/ 5</span></div>
        </div>
        ${(todayJournal.scoreItems || []).map(item => `
          <div class="score-item">
            <div class="score-item-header">
              <span class="score-item-title">${escapeHtml(item.title)}</span>
              <button class="delete-btn delete-btn--sm" onclick="app.confirmDeleteScoreItem('${item.id}')">${getIcon('close')}</button>
            </div>
            <div class="score-item-control">
              <input type="range" min="0" max="5" value="${todayJournal.scores?.[item.id] || 0}"
                class="score-slider" oninput="this.parentElement.querySelector('.score-item-value').textContent=this.value; app.updateScore('${item.id}', this.value)">
              <span class="score-item-value">${todayJournal.scores?.[item.id] || 0}</span>
              <span class="score-item-max">/5</span>
            </div>
            <div class="score-ticks"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
          </div>
        `).join('')}
        <button class="score-item-add-btn" onclick="app.addScoreItem()">＋ 項目を追加</button>
      </div>

      <div class="form-section">
        <div class="form-title">①今日の反省${fieldHelpIcon('journal-reflection')}</div>
        <textarea class="form-input" id="journal-field-reflection" placeholder="今日反省すべきことは..." autocomplete="off"
          onchange="app.updateJournalReflection('reflection', this.value)"
        >${escapeHtml(todayJournal.reflections?.reflection || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-reflection" onclick="app.proofreadField('reflection')">AI添削</button></div>
      </div>

      <div class="form-section">
        <div class="form-title">②今日の努力・成果${fieldHelpIcon('journal-effort')}</div>
        <textarea class="form-input" id="journal-field-effort" placeholder="今日頑張ったことは..." autocomplete="off"
          onchange="app.updateJournalReflection('effort', this.value)"
        >${escapeHtml(todayJournal.reflections?.effort || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-effort" onclick="app.proofreadField('effort')">AI添削</button></div>
      </div>

      <div class="form-section">
        <div class="form-title">③世の為人の為にしたこと${fieldHelpIcon('journal-contribution')}</div>
        <textarea class="form-input" id="journal-field-contribution" placeholder="誰かの役に立てたことは..." autocomplete="off"
          onchange="app.updateJournalReflection('contribution', this.value)"
        >${escapeHtml(todayJournal.reflections?.contribution || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-contribution" onclick="app.proofreadField('contribution')">AI添削</button></div>
      </div>

      <div class="form-section">
        <div class="form-title">④印象的・気付き・感謝${fieldHelpIcon('journal-gratitude')}</div>
        <textarea class="form-input" id="journal-field-gratitude" placeholder="印象に残ったこと、気づいたこと..." autocomplete="off"
          onchange="app.updateJournalReflection('gratitude', this.value)"
        >${escapeHtml(todayJournal.reflections?.gratitude || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-gratitude" onclick="app.proofreadField('gratitude')">AI添削</button></div>
      </div>

      <div class="form-section">
        <div class="form-title">⑤自由記入${fieldHelpIcon('journal-free')}</div>
        <textarea class="form-input" id="journal-field-free" placeholder="その他メモ..." autocomplete="off"
          onchange="app.updateJournalReflection('free', this.value)"
        >${escapeHtml(todayJournal.reflections?.free || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-free" onclick="app.proofreadField('free')">AI添削</button></div>
      </div>

      <div class="form-section">
        <div class="form-title">明日の意気込み${fieldHelpIcon('journal-tomorrow')}</div>
        <textarea class="form-input" id="journal-field-tomorrowResolution" placeholder="明日の意気込みを書く..." autocomplete="off"
          onchange="app.updateTomorrowResolution(this.value)"
        >${escapeHtml(todayJournal.tomorrowResolution || '')}</textarea>
        <div class="proofread-row"><button class="proofread-btn" id="proofread-btn-tomorrowResolution" onclick="app.proofreadField('tomorrowResolution')">AI添削</button></div>
      </div>

      ${renderAICommentSection(todayJournal)}
    </div>
    ${renderNavBar('journal-list')}
  `;
}

/* ========================================
   ルーティンチェック画面
   ======================================== */
function renderJournalSupplementPage(data) {
  const todayJournal = data.todayJournal || {};
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
      ${routines.map((routine, index) => ({ ...routine, originalIndex: index }))
        .filter(r => isRoutineActiveToday(r, todayJournal.date))
        .sort((a, b) => {
          const co = { rei: 0, shin: 1, tai: 2, gi: 3, sei: 4 };
          return (co[a.category] ?? 99) - (co[b.category] ?? 99);
        })
        .map(routine => {
        const index = routine.originalIndex;
        const isOpen = expandedCards.includes(index);
        const rStatus = getRoutineStatus(routine);
        const rStatusClass = rStatus === 'done' ? 'checked' : rStatus === 'partial' ? 'partial' : '';
        const rStatusIcon = rStatus === 'done' ? getIcon('check') : rStatus === 'partial' ? '△' : '';
        return `
        <div class="routine-card-full ${isOpen ? 'open' : ''} ${rStatusClass}">
          <div class="rc-header">
            <div class="task-check ${rStatusClass}"
                 onclick="event.stopPropagation(); app.toggleRoutine(${index})">${rStatusIcon}</div>
            <span class="task-tag tag-${routine.category}">${categoryNames[routine.category] || ''}</span>
            <span class="rc-name">${escapeHtml(routine.name || 'ルーティン' + (index + 1))}</span>
            <span class="rc-toggle" onclick="event.stopPropagation(); app.toggleJournalRoutineCard(${index})">${isOpen ? '▲' : '▼'}</span>
          </div>
          ${isOpen ? `
          <div class="rc-cores">
            <div class="rc-core"><span class="rc-icon">⏰</span><span class="rc-text">${escapeHtml(routine.condition || '-')}</span></div>
            <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-text">${escapeHtml(routine.minimumAction || '-')}</span></div>
            <div class="rc-core"><span class="rc-icon">⚠️</span><span class="rc-text">${escapeHtml(routine.troubleAnticipation || '-')}</span></div>
          </div>
          ` : ''}
        </div>
      `}).join('')}
    </div>
  ` : '<div class="list-empty">ルーティンが設定されていません</div>';

  const activeRoutinesJ = routines.filter(r => isRoutineActiveToday(r, todayJournal.date));
  const completedCount = activeRoutinesJ.filter(r => isRoutineDone(r)).length;
  const partialCountJ = activeRoutinesJ.filter(r => getRoutineStatus(r) === 'partial').length;
  const effectiveCountJ = completedCount;
  const routineRate = activeRoutinesJ.length > 0 ? Math.round((effectiveCountJ / activeRoutinesJ.length) * 100) : 0;

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
        <div class="progress-text">${completedCount}/${activeRoutinesJ.length} 完了（${routineRate}%）</div>
      </div>

      <div class="section">
        <div class="section-title">
          <span class="icon-inline">${getIcon('task')}</span>
          本日のルーティン${fieldHelpIcon('journal-routines')}
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
  const currentListMonth = app.journalListMonth || getCurrentMonth();
  const monthLabel = formatMonthJapanese(currentListMonth);

  const listHTML = journals.length > 0 ? journals.map((journal, index) => {
    const rate = calculateRoutineRate(journal);
    const dateText = formatDateWithDayOfWeek(journal.date);
    const titleText = journal.title || '';
    const scoreText = typeof journal.score === 'number' ? (Number.isInteger(journal.score) ? journal.score : journal.score.toFixed(1)) : '---';
    const isStarred = journal.starred ? 'starred' : '';
    return `
      <div class="list-item journal-list-item" id="journal-list-${index}" data-journal-date="${journal.date}" onclick="app.viewJournal('${journal.date}')">
        <div class="journal-list-header">
          <button class="journal-star-btn ${isStarred}" onclick="event.stopPropagation(); app.toggleJournalStar('${journal.date}')">${getIcon('star')}</button>
          <div class="journal-list-date">${dateText}</div>
          <div class="journal-list-score">${scoreText}点</div>
          <div class="journal-list-rate">達成${rate}%</div>
          ${titleText ? `<div class="journal-list-title">${escapeHtml(titleText)}</div>` : ''}
          <button class="delete-btn" onclick="event.stopPropagation(); app.confirmDeleteJournal('${journal.date}')">${getIcon('close')}</button>
        </div>
      </div>
    `;
  }).join('') : '<div class="list-empty">日誌がありません</div>';

  return `
    ${renderHeader('日誌一覧')}
    <div class="content">
      <div class="journal-month-nav">
        <button class="journal-month-btn" onclick="app.changeJournalListMonth(-1)">${getIcon('back')}</button>
        <span class="journal-month-label">${monthLabel}</span>
        <button class="journal-month-btn" onclick="app.changeJournalListMonth(1)">${getIcon('forward')}</button>
      </div>
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
    { id: 'journal', label: '日誌' },
    { id: 'monthly-0', label: '目標' },
    { id: 'monthly-1', label: 'パターン分析' },
    { id: 'monthly-2', label: 'ブレイクダウン' },
    { id: 'monthly-3', label: 'ルーティン' },
    { id: 'monthly-4', label: '期日目標' },
    { id: 'monthly-5', label: '基本スケジュール' },
    { id: 'monthly-6', label: '月末評価' }
  ];

  const currentPageLabel = swipePages[pageIndex + 1]?.label || '目標';

  const currentPageId = swipePages[pageIndex + 1]?.id || 'monthly-0';

  return `
    ${renderHeader(currentPageLabel, {
      showBack: true,
      subtitle: monthStr,
      titleAction: `app.showPageGuide('${currentPageId}')`,
      rightIcons: [
        { icon: 'save', action: 'app.confirmSaveMonthlyGoal()', className: 'icon-save' },
        { icon: 'trash', action: 'app.confirmDeleteCurrentMonthlyGoal()', className: 'icon-delete' }
      ]
    })}
    <div class="content">
      ${renderSwipeNav(swipePages, pageIndex + 1)}
      ${pageIndex > 0 && monthlyGoal.goal ? `
        <div class="monthly-goal-bar${app._goalBarExpanded ? ' expanded' : ''}" onclick="app._goalBarExpanded = !app._goalBarExpanded; app.render()">
          <span class="monthly-goal-bar-label">目標</span>
          <span class="monthly-goal-bar-text">${escapeHtml(monthlyGoal.goal)}</span>
          <span class="monthly-goal-bar-chevron">▼</span>
        </div>
      ` : ''}
      ${renderMonthlyPageContent(monthlyGoal, pageIndex)}
    </div>
    ${renderNavBar('monthly-list')}
  `;
}

function renderMonthlyPageContent(monthlyGoal, pageIndex) {
  switch(pageIndex) {
    case 0: return renderMonthlyGoalSection(monthlyGoal);
    case 1: return renderMonthlyPatternSection(monthlyGoal);
    case 2: return renderMonthlyBreakdownSection(monthlyGoal);
    case 3: return renderMonthlyRoutineSection(monthlyGoal);
    case 4: return renderMonthlyCoreSection(monthlyGoal);
    case 5: return renderMonthlyScheduleSection();
    case 6: return renderMonthlyEvaluationSection(monthlyGoal);
    default: return renderMonthlyGoalSection(monthlyGoal);
  }
}

function renderMonthlyGoalSection(monthlyGoal) {
  const ltGoals = app.data.longTermGoals || [];
  const ltRefHTML = ltGoals.length > 0 ? ltGoals.map(g => {
    const title = escapeHtml(g.title || g.goal || '目標未設定');
    const deadline = (g.deadlineYear && g.deadlineMonth) ? `${g.deadlineYear}年${g.deadlineMonth}月まで` : '';
    const msHTML = (g.milestones || []).filter(m => m.goal).map(m => {
      const d = (m.year && m.month) ? `${m.year}年${m.month}月` : '';
      return `<div class="ltref-ms">${d ? `<span class="ltref-ms-date">${d}</span>` : ''}${escapeHtml(m.goal)}</div>`;
    }).join('');
    return `<div class="ltref-goal">
      <div class="ltref-title">${title}</div>
      ${deadline ? `<div class="ltref-deadline">${deadline}</div>` : ''}
      ${msHTML}
    </div>`;
  }).join('') : '<div class="ltref-empty">長期目標がありません</div>';

  return `
    <button class="copy-month-btn" onclick="app.showCopyMonthModal()">
      ${getIcon('import')} 過去の月からコピー
    </button>
    <div class="ltref-toggle" onclick="this.nextElementSibling.classList.toggle('open'); this.classList.toggle('open')">
      <span class="icon-inline">${getIcon('target')}</span>
      長期目標を確認
      <span class="ltref-chevron">▼</span>
    </div>
    <div class="ltref-panel">${ltRefHTML}</div>
    <div class="form-section">
      <div class="form-title">今月達成する目標${fieldHelpIcon('monthly-goal')}</div>
      <textarea class="form-input" placeholder="今月の目標を入力..." autocomplete="off"
        onchange="app.updateMonthlyGoal('goal', this.value)"
      >${escapeHtml(monthlyGoal.goal || '')}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">目標達成のイメージ</div>
      <textarea class="form-input" placeholder="達成した時のイメージ..." autocomplete="off"
        onchange="app.updateMonthlyGoal('vision', this.value)"
      >${escapeHtml(monthlyGoal.vision || '')}</textarea>
    </div>

    <div class="section">
      <div class="section-title">達成時の報酬${fieldHelpIcon('monthly-reward')}</div>
      <p class="section-desc">達成したら自分にどんなご褒美を与えるか。</p>
      <div class="input-row">
        <span class="input-label">気持ち×自分</span>
        <input class="input-field" placeholder="自分が感じる達成感..." autocomplete="off"
          value="${escapeHtml(monthlyGoal.reward?.selfFeeling || '')}"
          onchange="app.updateMonthlyReward('selfFeeling', this.value)">
      </div>
      <div class="input-row">
        <span class="input-label">見えるもの×自分</span>
        <input class="input-field" placeholder="自分へのご褒美..." autocomplete="off"
          value="${escapeHtml(monthlyGoal.reward?.selfVisible || '')}"
          onchange="app.updateMonthlyReward('selfVisible', this.value)">
      </div>
      <div class="input-row">
        <span class="input-label">気持ち×他人</span>
        <input class="input-field" placeholder="周りの人が感じること..." autocomplete="off"
          value="${escapeHtml(monthlyGoal.reward?.othersFeeling || '')}"
          onchange="app.updateMonthlyReward('othersFeeling', this.value)">
      </div>
      <div class="input-row">
        <span class="input-label">見えるもの×他人</span>
        <input class="input-field" placeholder="周りの人に見える成果..." autocomplete="off"
          value="${escapeHtml(monthlyGoal.reward?.othersVisible || '')}"
          onchange="app.updateMonthlyReward('othersVisible', this.value)">
      </div>
    </div>
  `;
}

function renderMonthlyPatternSection(monthlyGoal) {
  return `
    <div class="form-section">
      <div class="form-title">成功パターン${fieldHelpIcon('monthly-patterns')}</div>
      <textarea class="form-input" placeholder="うまくいくときのパターン..." autocomplete="off"
        onchange="app.updateMonthlyGoal('successPattern', this.value)"
      >${escapeHtml(monthlyGoal.successPattern || '')}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">失敗パターン</div>
      <textarea class="form-input" placeholder="うまくいかないときのパターン..." autocomplete="off"
        onchange="app.updateMonthlyGoal('failurePattern', this.value)"
      >${escapeHtml(monthlyGoal.failurePattern || '')}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">対策</div>
      <textarea class="form-input" placeholder="失敗を防ぐための対策..." autocomplete="off"
        onchange="app.updateMonthlyGoal('countermeasure', this.value)"
      >${escapeHtml(monthlyGoal.countermeasure || '')}</textarea>
    </div>
  `;
}

function renderMonthlyBreakdownSection(monthlyGoal) {
  const breakdown = monthlyGoal.breakdown || { factors: [] };
  const factors = breakdown.factors || [];
  // 閉じたインデックスを管理（デフォルト全展開）
  const collapsedFactors = app.collapsedBreakdownFactors || [];

  return `
    <div class="section">
      <div class="section-title">ゴールブレイクダウン${fieldHelpIcon('monthly-breakdown')}</div>
      <p class="section-desc">目標達成に必要な要因（最大10個）と、各要因に対する行動（最大7個）を設定します。</p>

      <div style="margin-bottom:8px">
        <button class="add-btn small" onclick="app.expandAllBreakdown()" style="width:100%">全て展開（10×7）</button>
      </div>

      <div class="breakdown-list">
        ${factors.map((factor, fIndex) => {
          const actions = factor.actions || [];
          const cat = factor.category || '';
          const catLabel = cat ? categoryNames[cat] || '' : '−';
          const catClass = cat ? 'tag-' + cat : 'tag-none';
          return `
          <div class="breakdown-block">
            <div class="breakdown-block-toolbar">
              <div class="breakdown-block-move">
                <button class="breakdown-move-btn" onclick="app.moveBreakdownFactor(${fIndex}, -1)" ${fIndex === 0 ? 'disabled' : ''}>↑</button>
                <button class="breakdown-move-btn" onclick="app.moveBreakdownFactor(${fIndex}, 1)" ${fIndex === factors.length - 1 ? 'disabled' : ''}>↓</button>
              </div>
              <span class="breakdown-factor-num">${fIndex + 1}</span>
              <span class="task-tag ${catClass} breakdown-cat-badge" onclick="app.cycleBreakdownCategory(${fIndex})">${catLabel}</span>
              <input class="input-field breakdown-factor-input" value="${escapeHtml(factor.name || '')}" placeholder="要因名"
                onchange="app.updateBreakdownFactor(${fIndex}, 'name', this.value)">
              <button class="delete-btn delete-btn--sm delete-btn--danger" onclick="app.removeBreakdownFactor(${fIndex})">${getIcon('close')}</button>
            </div>
            <div class="breakdown-block-actions">
              ${actions.map((action, aIndex) => `
                <div class="breakdown-action">
                  <span class="breakdown-action-num">${aIndex + 1}</span>
                  <input class="input-field" value="${escapeHtml(action || '')}" placeholder="行動${aIndex + 1}"
                    onchange="app.updateBreakdownAction(${fIndex}, ${aIndex}, this.value)">
                  <button class="delete-btn delete-btn--sm delete-btn--danger" onclick="app.removeBreakdownAction(${fIndex}, ${aIndex})">${getIcon('close')}</button>
                </div>
              `).join('')}
              ${actions.length < 7 ? `
                <button class="add-btn small" onclick="app.addBreakdownAction(${fIndex})">
                  + 行動を追加
                </button>
              ` : ''}
            </div>
          </div>
        `}).join('')}
      </div>

      ${factors.length < 10 ? `
        <button class="add-btn" onclick="app.addBreakdownFactor()">
          + 要因を追加（${factors.length}/10）
        </button>
      ` : ''}
    </div>
  `;
}

function renderMonthlyRoutineSection(monthlyGoal) {
  const routines = monthlyGoal.routines || [];
  const expandedCards = app.expandedRoutineCards || [];

  // カテゴリ順でグループ化して表示
  const categoryOrder = { rei: 0, shin: 1, tai: 2, gi: 3, sei: 4 };
  const sortedRoutines = routines
    .map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));

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
            <span class="rc-name">${escapeHtml(r.name || '（未設定）')}</span>
            ${r.weekDays && r.weekDays.length > 0 ? `<span class="rc-weekdays">${r.weekDays.map(d => weekDayLabels[d]).join('')}${r.weeklyTarget ? ' ×' + r.weeklyTarget : ''}</span>` : ''}
            <span class="rc-toggle" onclick="event.stopPropagation(); app.toggleRoutineCard(${r.originalIndex})">${isOpen ? '▲' : '▼'}</span>
          </div>
          ${isOpen ? `
          <div class="rc-cores">
            <div class="rc-core"><span class="rc-icon">⏰</span><span class="rc-text">${escapeHtml(r.condition || '-')}</span></div>
            <div class="rc-core"><span class="rc-icon">📋</span><span class="rc-text">${escapeHtml(r.minimumAction || '-')}</span></div>
            <div class="rc-core"><span class="rc-icon">⚠️</span><span class="rc-text">${escapeHtml(r.troubleAnticipation || '-')}</span></div>
          </div>
          ` : ''}
        </div>
      `}).join('')}
    </div>
  `;

  // ブレイクダウン参照パネル（閲覧のみ）
  const breakdown = monthlyGoal.breakdown || { factors: [] };
  const bdFactors = (breakdown.factors || []).filter(f => f.name);
  const breakdownRefHTML = bdFactors.length > 0 ? `
    <div class="section" style="margin-top:16px">
      <div class="breakdown-ref-toggle" onclick="this.nextElementSibling.classList.toggle('hide'); this.querySelector('.bd-arrow').textContent = this.nextElementSibling.classList.contains('hide') ? '▼' : '▲'">
        <span class="section-title" style="margin:0">ブレイクダウン参照</span>
        <span class="bd-arrow" style="font-size:12px;color:var(--text-muted);margin-left:8px">▼</span>
      </div>
      <div class="breakdown-ref-list hide">
        ${bdFactors.map((f, i) => {
          const cat = f.category || '';
          const catLabel = cat ? categoryNames[cat] || '' : '';
          const catClass = cat ? ` bd-ref-cat-${cat}` : '';
          const actions = (f.actions || []).filter(a => a);
          return `
          <div class="bd-ref-item${catClass}">
            <div class="bd-ref-header" onclick="const a=this.nextElementSibling;if(a){a.classList.toggle('hide');this.querySelector('.bd-ref-arrow').textContent=a.classList.contains('hide')?'▼':'▲'}">
              <span class="bd-ref-num">${i + 1}</span>
              ${catLabel ? `<span class="task-tag tag-${cat}" style="font-size:9px;padding:1px 6px">${catLabel}</span>` : ''}
              <span class="bd-ref-name">${escapeHtml(f.name)}</span>
              ${actions.length > 0 ? `<span class="bd-ref-arrow">▼</span>` : ''}
            </div>
            ${actions.length > 0 ? `
            <div class="bd-ref-actions hide">
              ${actions.map((a, ai) => `<div class="bd-ref-action">${ai + 1}. ${escapeHtml(a)}</div>`).join('')}
            </div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  return `
    <div class="section">
      <div class="section-title">毎日のルーティン${fieldHelpIcon('tab-routine')}</div>
      ${routinesHTML}
      <button class="add-btn" onclick="app.addMonthlyRoutine()">
        <span class="icon-inline">${getIcon('plus')}</span>
        ルーティンを追加
      </button>
      <button class="reflect-btn" onclick="app.showReflectModal()">
        ${getIcon('calendar')} カレンダーに反映
      </button>
    </div>
    ${breakdownRefHTML}
  `;
}

function renderMonthlyCoreSection(monthlyGoal) {
  const items = monthlyGoal.deadlineItems || [];
  const milestones = monthlyGoal.weeklyMilestones || ['', '', '', '', ''];

  return `
    <div class="form-section">
      <div class="form-title">期日アイテム${fieldHelpIcon('home-core-actions')}</div>
      <p class="section-desc">期日のある目標やタスクを登録すると、カレンダーに表示されます。</p>
      <div class="deadline-items-list">
        ${items.map((item, i) => `
          <div class="deadline-item-row">
            <input class="input-field deadline-item-title" value="${escapeHtml(item.title || '')}" placeholder="タイトル"
              onchange="app.updateDeadlineItem(${i}, 'title', this.value)">
            <input type="date" class="input-field deadline-item-date" value="${escapeHtml(item.date || '')}"
              onchange="app.updateDeadlineItem(${i}, 'date', this.value)">
            <button class="delete-btn delete-btn--sm delete-btn--danger" onclick="app.removeDeadlineItem(${i})">${getIcon('close')}</button>
          </div>
        `).join('')}
      </div>
      ${items.length < 10 ? `
        <button class="add-btn small" onclick="app.addDeadlineItem()">
          + 期日アイテムを追加（${items.length}/10）
        </button>
      ` : '<p class="limit-reached">期日アイテムは最大10個です</p>'}
    </div>

    <div class="form-section">
      <div class="form-title">週次マイルストーン</div>
      <p class="section-desc">各週の目標・予定を設定すると、カレンダーの月曜日に表示されます。</p>
      ${milestones.map((ms, i) => `
        <div class="milestone-row">
          <span class="milestone-label">第${i + 1}週</span>
          <input class="input-field milestone-input" value="${escapeHtml(ms || '')}" placeholder="第${i + 1}週の目標..."
            onchange="app.updateWeeklyMilestone(${i}, this.value)">
        </div>
      `).join('')}
    </div>

    <div class="form-section">
      <div class="form-title">期日目標（メモ）</div>
      <textarea class="form-input" placeholder="期日のある目標の詳細メモ..." autocomplete="off"
        onchange="app.updateMonthlyGoal('deadlineGoal', this.value)"
      >${escapeHtml(monthlyGoal.deadlineGoal || '')}</textarea>
    </div>

    <div class="form-section">
      <div class="form-title">要処理事項</div>
      <textarea class="form-input" placeholder="処理すべき事項..." autocomplete="off"
        onchange="app.updateMonthlyGoal('processingItems', this.value)"
      >${escapeHtml(monthlyGoal.processingItems || '')}</textarea>
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
              <div class="pattern-card-name">${escapeHtml(pattern.name || '無名パターン')}</div>
              <span class="pattern-priority-badge priority-${priority}">${priorityLabels[priority]}</span>
              <button class="delete-btn delete-btn--sm" onclick="event.stopPropagation(); app.deleteSchedulePattern(${pattern.id})">${getIcon('close')}</button>
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
  const sortedSchedule = [...schedule].sort((a, b) => (a.startHour * 60 + (a.startMinute || 0)) - (b.startHour * 60 + (b.startMinute || 0)));

  const scheduleHTML = sortedSchedule.length > 0
    ? sortedSchedule.map((slot) => {
        const originalIndex = schedule.findIndex(s => s === slot);
        return `
          <div class="schedule-entry-item" style="border-left: 4px solid ${sanitizeColor(slot.color || colors[0])}">
            <div class="schedule-entry-time">
              <input type="time" class="schedule-time-input" value="${String(slot.startHour).padStart(2,'0')}:${String(slot.startMinute || 0).padStart(2,'0')}"
                     onchange="app.updatePatternScheduleTime(${pattern.id}, ${originalIndex}, 'start', this.value)">
              <span>〜</span>
              <input type="time" class="schedule-time-input" value="${String(slot.endHour).padStart(2,'0')}:${String(slot.endMinute || 0).padStart(2,'0')}"
                     onchange="app.updatePatternScheduleTime(${pattern.id}, ${originalIndex}, 'end', this.value)">
              <button class="delete-btn delete-btn--sm" onclick="app.deletePatternScheduleSlot(${pattern.id}, ${originalIndex})">${getIcon('close')}</button>
            </div>
            <input type="text" class="schedule-entry-text" placeholder="予定を入力..."
                   value="${escapeHtml(slot.activity || '')}"
                   onchange="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'activity', this.value)">
            <textarea class="schedule-entry-notes" placeholder="メモ（任意）"
                      onchange="app.updatePatternScheduleSlot(${pattern.id}, ${originalIndex}, 'notes', this.value)">${escapeHtml(slot.notes || '')}</textarea>
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
        <b class="fh" data-k="${condition.type}" data-fn="showConditionHelp"></b>
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
                 onchange="app.updatePatternCondition(${pattern.id}, 'cycleLength', Math.max(1, Math.min(31, parseInt(this.value, 10) || 7)))">
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
        <input type="text" class="form-input" value="${escapeHtml(pattern.name || '')}"
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
          <span class="eval-routine-name">${escapeHtml(r.name || '（未設定）')}</span>
          <span class="eval-expand-icon">${isExpanded ? '▲' : '▼'}</span>
        </div>
        ${isExpanded ? `
          <div class="eval-card-body">
            <div class="eval-section">
              <div class="eval-section-title">①達成率</div>
              <div class="eval-achievement" id="achievement-${i}">計算中...</div>
              ${(() => {
                const memos = eval_.weeklyMemos || ['', '', '', '', ''];
                const currentWeek = app.getWeekOfMonth();
                const weekLabels = ['W1(1-7日)', 'W2(8-14日)', 'W3(15-21日)', 'W4(22-28日)', 'W5(29日-)'];
                let html = '<div class="weekly-memo-area">';
                html += '<div class="weekly-memo-current">';
                html += '<label class="weekly-memo-label">週次メモ ' + weekLabels[currentWeek] + '</label>';
                html += '<input type="text" class="input-field weekly-memo-input" placeholder="今週の達成状況を1行で" value="' + escapeHtml(memos[currentWeek] || '') + '" onchange="app.updateRoutineEvaluation(' + i + ', \'weeklyMemo.' + currentWeek + '\', this.value)">';
                html += '</div>';
                const pastMemos = memos.map((m, wi) => ({ wi, m })).filter(x => x.wi < currentWeek && x.m);
                if (pastMemos.length > 0) {
                  html += '<div class="weekly-memo-past">';
                  pastMemos.forEach(x => {
                    html += '<div class="weekly-memo-past-item"><span class="weekly-memo-week">W' + (x.wi + 1) + '</span>' + escapeHtml(x.m) + '</div>';
                  });
                  html += '</div>';
                }
                html += '</div>';
                return html;
              })()}
              <div class="eval-rating-row">
                <span class="eval-rating-label">評価</span>
                ${[1,2,3,4,5].map(n => '<button class="eval-rating-btn ' + (eval_.ratingAchievement === n ? 'selected' : '') + '" onclick="app.updateRoutineEvaluation(' + i + ', \'ratingAchievement\', ' + (eval_.ratingAchievement === n ? 'null' : n) + '); app.render()">' + n + '</button>').join('')}
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">②効果・実績（4観点）</div>
              <div class="eval-field">
                <label>有形×自分 <span class="field-hint">自分が得た具体的成果</span></label>
                <textarea class="input-field eval-textarea" placeholder="任意：具体的なエピソードや数字"
                  onchange="app.updateRoutineEvaluation(${i}, 'tangibleSelf', this.value)">${escapeHtml(eval_.tangibleSelf || '')}</textarea>
              </div>
              <div class="eval-field">
                <label>有形×他人 <span class="field-hint">他人に見える具体的成果</span></label>
                <textarea class="input-field eval-textarea" placeholder="任意：具体的なエピソードや数字"
                  onchange="app.updateRoutineEvaluation(${i}, 'tangibleOthers', this.value)">${escapeHtml(eval_.tangibleOthers || '')}</textarea>
              </div>
              <div class="eval-field">
                <label>無形×自分 <span class="field-hint">自分の内面的変化</span></label>
                <textarea class="input-field eval-textarea" placeholder="任意：具体的なエピソードや数字"
                  onchange="app.updateRoutineEvaluation(${i}, 'intangibleSelf', this.value)">${escapeHtml(eval_.intangibleSelf || '')}</textarea>
              </div>
              <div class="eval-field">
                <label>無形×他人 <span class="field-hint">他人からの評価・印象</span></label>
                <textarea class="input-field eval-textarea" placeholder="任意：具体的なエピソードや数字"
                  onchange="app.updateRoutineEvaluation(${i}, 'intangibleOthers', this.value)">${escapeHtml(eval_.intangibleOthers || '')}</textarea>
              </div>
              <div class="eval-rating-row">
                <span class="eval-rating-label">評価</span>
                ${[1,2,3,4,5].map(n => '<button class="eval-rating-btn ' + (eval_.ratingEffect === n ? 'selected' : '') + '" onclick="app.updateRoutineEvaluation(' + i + ', \'ratingEffect\', ' + (eval_.ratingEffect === n ? 'null' : n) + '); app.render()">' + n + '</button>').join('')}
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">③費用対効果</div>
              <div class="eval-cost-grid">
                <div class="eval-field">
                  <label>時間（分/日）</label>
                  <input type="text" class="input-field" placeholder="例：60"
                    value="${escapeHtml(cost.time || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.time', this.value)">
                </div>
                <div class="eval-field">
                  <label>金銭（円/月）</label>
                  <input type="text" class="input-field" placeholder="例：5000"
                    value="${escapeHtml(cost.money || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.money', this.value)">
                </div>
                <div class="eval-field">
                  <label>肉体的負荷</label>
                  <input type="text" class="input-field" placeholder="例：中程度"
                    value="${escapeHtml(cost.physicalLoad || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.physicalLoad', this.value)">
                </div>
                <div class="eval-field">
                  <label>精神的負荷</label>
                  <input type="text" class="input-field" placeholder="例：高い"
                    value="${escapeHtml(cost.mentalLoad || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.mentalLoad', this.value)">
                </div>
                <div class="eval-field">
                  <label>機会損失</label>
                  <input type="text" class="input-field" placeholder="例：読書時間が減る"
                    value="${escapeHtml(cost.opportunityCost || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.opportunityCost', this.value)">
                </div>
                <div class="eval-field">
                  <label>導入ハードル</label>
                  <input type="text" class="input-field" placeholder="例：道具購入が必要"
                    value="${escapeHtml(cost.barrier || '')}"
                    onchange="app.updateRoutineEvaluation(${i}, 'cost.barrier', this.value)">
                </div>
              </div>
              <div class="eval-rating-row">
                <span class="eval-rating-label">負荷度</span>
                ${[1,2,3,4,5].map(n => '<button class="eval-rating-btn ' + (eval_.ratingCost === n ? 'selected' : '') + '" onclick="app.updateRoutineEvaluation(' + i + ', \'ratingCost\', ' + (eval_.ratingCost === n ? 'null' : n) + '); app.render()">' + n + '</button>').join('')}
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">④成長期待予測</div>
              <div class="eval-field">
                <textarea class="input-field eval-textarea" placeholder="任意：来月続けた場合に期待する成長"
                  onchange="app.updateRoutineEvaluation(${i}, 'growthForecast', this.value)">${escapeHtml(eval_.growthForecast || '')}</textarea>
              </div>
              <div class="eval-rating-row">
                <span class="eval-rating-label">期待度</span>
                ${[1,2,3,4,5].map(n => '<button class="eval-rating-btn ' + (eval_.ratingGrowth === n ? 'selected' : '') + '" onclick="app.updateRoutineEvaluation(' + i + ', \'ratingGrowth\', ' + (eval_.ratingGrowth === n ? 'null' : n) + '); app.render()">' + n + '</button>').join('')}
              </div>
            </div>

            <div class="eval-section">
              <div class="eval-section-title">総合判断</div>
              <div class="eval-judgment-btns">
                ${['continue','strengthen','improve'].map(j => {
                  const labels = { continue: '継続', strengthen: '強化', improve: '改善' };
                  const descs = { continue: '来月も同じ設定で続ける', strengthen: '頻度や負荷を上げる', improve: 'ルーティン設計を見直す' };
                  const isSelected = eval_.judgment === j;
                  return '<div class="eval-judgment-item"><button class="eval-judgment-btn ' + (isSelected ? 'selected' : '') + ' judgment-' + j + '" onclick="app.updateRoutineEvaluation(' + i + ', \'judgment\', \'' + j + '\'); app.render()">' + labels[j] + '</button><span class="eval-judgment-desc">' + descs[j] + '</span></div>';
                }).join('')}
              </div>
              <div class="eval-judgment-btns">
                ${['reduce','abolish'].map(j => {
                  const labels = { reduce: '縮小', abolish: '廃止' };
                  const descs = { reduce: '最低限に減らして様子見', abolish: 'やめて別のルーティンへ' };
                  const isSelected = eval_.judgment === j;
                  return '<div class="eval-judgment-item"><button class="eval-judgment-btn ' + (isSelected ? 'selected' : '') + ' judgment-' + j + '" onclick="app.updateRoutineEvaluation(' + i + ', \'judgment\', \'' + j + '\'); app.render()">' + labels[j] + '</button><span class="eval-judgment-desc">' + descs[j] + '</span></div>';
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('') : '<div class="widget-empty">ルーティンを先に設定してください</div>';

  return `
    <div class="section">
      <div class="section-title">ルーティン月次評価</div>
      <div class="eval-hint">各ルーティンをタップして評価を入力</div>
      ${routinesHTML}
    </div>
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
        <div class="list-sub">${escapeHtml(goal.goal || '目標未設定')}</div>
      </div>
      <button class="delete-btn" onclick="event.stopPropagation(); app.confirmDeleteMonthlyGoal('${goal.yearMonth}')">${getIcon('close')}</button>
    </div>
  `).join('') : '<div class="list-empty">月次目標がありません</div>';

  return `
    ${renderHeader('月次目標一覧')}
    <div class="content">
      ${listHTML}
    </div>
    <div class="fab" onclick="app.showNewMonthlyGoalPicker()">
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

  const milestones = longTermGoal?.milestones || [];
  const milestonesHTML = milestones.map((m, i) => {
    const goalText = m.goal || '';
    const dateLabel = (m.year && m.month) ? `${m.year}年${m.month}月` : '';
    return `
    <div class="milestone-item" id="milestone-${i}">
      <div class="milestone-header">
        <span class="milestone-date-label">${dateLabel}</span>
        <button class="milestone-delete-btn" onclick="app.removeMilestone(${i})">${getIcon('close')}</button>
      </div>
      <div class="milestone-goal-wrapper" onclick="if(!this.classList.contains('expanded')) app.expandMilestone(${i})">
        <div class="milestone-goal-content">${goalText ? escapeHtml(goalText) : '<span class="placeholder">中間目標を入力...</span>'}</div>
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
        <div class="goal-title">${escapeHtml(longTermGoal?.goal || '目標を入力しましょう')}</div>
        <div class="goal-more"></div>
      </div>

      <div class="section">
        <div class="section-title">
          逆算目標（1カ月単位）${fieldHelpIcon('longterm-milestone')}
        </div>
        ${milestones.length > 0 ? milestonesHTML : (longTermGoal?.deadlineYear && longTermGoal?.deadlineMonth ? '' : '<div class="milestone-empty">目標期限を設定すると自動生成されます</div>')}
        ${milestones.length > 0 ? `<button class="milestone-regen-btn" onclick="app.generateMilestones()">
          <span class="icon-inline">${getIcon('refresh')}</span>
          逆算を再生成
        </button>` : ''}
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
        <div class="list-goal-content">${escapeHtml(goalText)}</div>
        <div class="list-goal-more"></div>
      </div>
      <button class="delete-btn" onclick="event.stopPropagation(); app.confirmDeleteLongTermGoal(${goal.id})">${getIcon('close')}</button>
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
      <div class="life-card-label">人生の最上位目的${fieldHelpIcon('life-purpose')}</div>
      <div class="life-card-content">${purposeText ? escapeHtml(purposeText) : '<span class="placeholder">タップして入力...</span>'}</div>
      <div class="life-card-more"></div>
    </div>

    <div class="life-card" id="life-card-meaning" onclick="if(!this.classList.contains('expanded')) app.editLifeDesign('meaning')">
      <div class="life-card-label">その目的を持つ意味${fieldHelpIcon('life-meaning')}</div>
      <div class="life-card-content">${meaningText ? escapeHtml(meaningText) : '<span class="placeholder">タップして入力...</span>'}</div>
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
        <button class="delete-btn delete-btn--danger" onclick="app.removeAgeGoal(${i})">${getIcon('close')}</button>
      </div>
      <div class="goal-display-wrapper" id="goal-wrapper-${i}">
        <textarea class="input-field goal-textarea" id="goal-textarea-${i}" placeholder="目標..." autocomplete="off"
          onchange="app.updateAgeGoal(${i}, 'goal', this.value)">${escapeHtml(item.goal || '')}</textarea>
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
      <div class="section-title">年齢別　目標${fieldHelpIcon('life-age-goals')}</div>
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
    ? [...dailySchedule].sort((a, b) => (a.startHour * 60 + (a.startMinute || 0)) - (b.startHour * 60 + (b.startMinute || 0)))
    : [];

  const itemsHTML = sortedSchedule.length > 0
    ? sortedSchedule.map((slot) => {
        const originalIndex = dailySchedule.findIndex(s => s === slot);
        return `
        <div class="schedule-entry-item" style="border-left: 4px solid ${sanitizeColor(slot.color || colors[0])}">
          <div class="schedule-entry-time">
            <input type="time" class="schedule-time-input" value="${String(slot.startHour).padStart(2,'0')}:${String(slot.startMinute || 0).padStart(2,'0')}"
                   onchange="app.updateFreeScheduleTime(${originalIndex}, 'start', this.value)">
            <span>〜</span>
            <input type="time" class="schedule-time-input" value="${String(slot.endHour).padStart(2,'0')}:${String(slot.endMinute || 0).padStart(2,'0')}"
                   onchange="app.updateFreeScheduleTime(${originalIndex}, 'end', this.value)">
            <button class="delete-btn delete-btn--sm" onclick="app.deleteFreeSchedule(${originalIndex})">${getIcon('close')}</button>
          </div>
          <input type="text" class="schedule-entry-text" placeholder="予定を入力..."
                 value="${escapeHtml(slot.activity || '')}"
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
          <span class="setting-value inline-editable" id="name-value" onclick="app.startInlineEdit('name')">${settings.name ? escapeHtml(settings.name) : '未設定'}</span>
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

      ${'<!-- 表示設定・ウィジェットデザイン・表示・F・BOX: 非表示（機能は維持） -->'}

      <div class="setting-section">
        <div class="setting-title">AI機能</div>
        <div class="setting-item" onclick="app.showGeminiApiKeyModal()">
          <span class="setting-label">Gemini APIキー</span>
          <span class="setting-value">${settings.geminiApiKey ? '設定済み' : '未設定'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showAIPresetManager()">
          <span class="setting-label">AIコメント設定</span>
          <span class="setting-value">${(() => { const dp = (settings.aiPresets || []).find(p => p.isDefault); return dp ? escapeHtml(dp.name) : '標準'; })()}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.showAITestModal()">
          <span class="setting-label">
            🎤 音声入力テスト
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">Notion連携</div>
        <div class="setting-item" onclick="app.showNotionSettingsModal()">
          <span class="setting-label">Notion APIキー</span>
          <span class="setting-value">${settings.notionApiKey ? '設定済み' : '未設定'}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.exportToNotion()">
          <span class="setting-label">Notionに一括エクスポート</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">Googleアカウント連携</div>
        ${app.firebaseUser ? `
        <div class="setting-item">
          <span class="setting-label">連携中</span>
          <span class="setting-value">${escapeHtml(app.firebaseUser.email)}</span>
        </div>
        <div class="setting-item">
          <span class="setting-label">同期ステータス</span>
          <span class="setting-value sync-label-${app.syncStatus}">${({synced:'同期済み', syncing:'同期中…', error:'エラー', offline:'未連携', idle:'待機中'})[app.syncStatus] || '不明'}</span>
        </div>
        <div class="setting-item" onclick="app.backupToCloud()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('cloudUp')}</span>
            クラウドへ上書き保存
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.restoreFromCloud()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('cloudDown')}</span>
            クラウドから読み込む
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item">
          <span class="setting-label">最終同期</span>
          <span class="setting-value">${settings.lastCloudSync ? new Date(settings.lastCloudSync).toLocaleString('ja-JP') : '未実行'}</span>
        </div>
        <div class="setting-item danger" onclick="app.unlinkGoogleAccount()">
          <span class="setting-label">連携を解除</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-title" style="margin-top:12px;">Googleカレンダー自動送信</div>
        <div class="setting-item" style="flex-wrap:wrap;">
          <span class="setting-label" style="width:100%;margin-bottom:6px;font-size:13px;color:var(--text-secondary);">日付のあるタスクを自動でカレンダーに送信するボックス</span>
          ${['urgent','action','project','waiting','calendar','wish'].map(t => {
            const labels = {urgent:'緊急',action:'次アクション',project:'プロジェクト',waiting:'連絡待ち',calendar:'カレンダー',wish:'いつか/多分'};
            const checked = (settings.gcalAutoTypes || []).includes(t);
            return `<label class="gcal-auto-label"><input type="checkbox" ${checked?'checked':''} onchange="app.toggleGcalAutoType('${t}')">${labels[t]}</label>`;
          }).join('')}
        </div>
        ` : `
        <div class="setting-item" onclick="app.linkGoogleAccount()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('cloud')}</span>
            Googleアカウントを連携
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item">
          <span class="setting-label" style="color:var(--text-secondary);font-size:13px;">一度連携すれば自動でクラウドに同期されます</span>
        </div>
        `}
      </div>

      <div class="setting-section">
        <div class="setting-title">アプリ</div>
        <div class="setting-item" onclick="app.checkForAppUpdate()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('refresh')}</span>
            アップデートを確認
          </span>
          <span class="setting-value" style="font-size:11px;color:#999">v${APP_VERSION}</span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item" onclick="app.forceRefresh()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('refresh')}</span>
            強制更新
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
        <div class="setting-item danger" onclick="app.clearDemoData()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('close')}</span>
            全データ削除（空にする）
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
        <div class="setting-item danger" onclick="app.confirmResetData()">
          <span class="setting-label">
            <span class="icon-inline">${getIcon('close')}</span>
            デモデータに戻す
          </span>
          <span class="setting-arrow">${getIcon('forward')}</span>
        </div>
      </div>

      <div class="setting-section">
        <div class="setting-title">使い方ガイド</div>
        <div class="guide-block">
          <div class="guide-frequency">毎日</div>
          <div class="guide-text">日誌を書く（朝：意気込み → 夜：振り返り＋スコア）</div>
          <div class="guide-text">ルーティンをチェックする</div>
          <div class="guide-text">F・BOXの中身を全て処理する</div>
          <div class="guide-text">明日のやることを振り分ける</div>
        </div>
        <div class="guide-block">
          <div class="guide-frequency">週次</div>
          <div class="guide-text">義務/維持ルーティンを全件確認</div>
          <div class="guide-text">待機リスト・プロジェクトを全件確認</div>
          <div class="guide-text">来週対応が必要なものを「今日やる事」に落とす</div>
          <div class="guide-text">今週の達成率と崩れた原因を1行で記録</div>
        </div>
        <div class="guide-block">
          <div class="guide-frequency">月次</div>
          <div class="guide-text">月末評価（①達成率→②効果→③コスト→④期待→総合判断）</div>
          <div class="guide-text">いつかやりたいリスト・資料保管を見返す</div>
          <div class="guide-text">候補ルーティンの昇格・削除を判断</div>
          <div class="guide-text">必要に応じて目標・ルーティンを再設定</div>
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
    const deadline = new Date(goal.deadlineYear, goal.deadlineMonth, 0);
    if (goal.startYear && goal.startMonth) {
      const startDate = new Date(goal.startYear, goal.startMonth - 1, 1);
      return startDate <= today && today <= deadline;
    }
    return today <= deadline;
  }).sort((a, b) => {
    const dateA = new Date(a.deadlineYear, a.deadlineMonth, 0);
    const dateB = new Date(b.deadlineYear, b.deadlineMonth, 0);
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
    const deadline = new Date(currentGoal.deadlineYear, currentGoal.deadlineMonth, 0);
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
          <div class="goal-title">${escapeHtml(currentGoal?.goal || '目標を設定しましょう')}</div>
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
          <div class="progress-detail">${escapeHtml(monthlyGoal?.goal || '月次目標を設定しましょう')}</div>
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
        <div class="list-title">${escapeHtml(manual.title || '無題のマニュアル')}</div>
        <div class="list-sub">${escapeHtml(manual.category || '未分類')}</div>
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
    ${renderHeader(escapeHtml(manual?.title || 'マニュアル'), { showBack: true, rightIcon: 'memo', rightAction: 'app.editManual(' + manual?.id + ')' })}
    <div class="content">
      <div class="manual-content">
        ${escapeHtml(manual?.content || 'コンテンツがありません').replace(/\n/g, '<br>')}
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
          value="${escapeHtml(manual?.title || '')}"
          onchange="app.updateManualField('title', this.value)">
      </div>

      <div class="form-section">
        <div class="form-title">カテゴリ</div>
        <input class="form-input-single" placeholder="例: 仕事、筋トレ、料理..." autocomplete="off"
          value="${escapeHtml(manual?.category || '')}"
          onchange="app.updateManualField('category', this.value)">
      </div>

      <div class="form-section">
        <div class="form-title">内容</div>
        <textarea class="form-input tall" placeholder="マニュアルの内容を入力..." autocomplete="off"
          onchange="app.updateManualField('content', this.value)"
        >${escapeHtml(manual?.content || '')}</textarea>
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
   振り返り画面（5機能統合）
   ======================================== */
/* ========================================
   振り返り一覧ページ（年月一覧）
   ======================================== */
function renderReviewListPage(data) {
  const monthlyGoals = data.monthlyGoals || [];
  const journalCounts = data.reviewMonthJournalCounts || {};
  const longTermGoals = data.longTermGoals || [];
  const ymRegex = /^\d{4}-\d{2}$/;

  // 長期目標の色パレットと月範囲を計算
  const goalColors = ['#4A90D9', '#D4A534', '#4CAF50', '#E57373', '#7E57C2', '#FF8A65'];
  const goalRanges = longTermGoals
    .filter(g => g.deadlineYear && g.deadlineMonth)
    .map((g, i) => {
      const months = [];
      const now = new Date();
      let y = parseInt(g.startYear) || now.getFullYear();
      let m = parseInt(g.startMonth) || (now.getMonth() + 1);
      const endY = parseInt(g.deadlineYear), endM = parseInt(g.deadlineMonth);
      const MAX_MONTHS = 120;
      let count = 0;
      while ((y < endY || (y === endY && m <= endM)) && count < MAX_MONTHS) {
        months.push(`${y}-${String(m).padStart(2, '0')}`);
        m++;
        if (m > 12) { m = 1; y++; }
        count++;
      }
      return {
        id: g.id,
        title: g.title || g.goal || '長期目標',
        color: goalColors[i % goalColors.length],
        months: months
      };
    });

  // 全月を収集（月次目標 + 日誌がある月）
  const allMonths = new Set();
  monthlyGoals.forEach(g => { if (hasMonthlyGoalData(g) && ymRegex.test(g.yearMonth)) allMonths.add(g.yearMonth); });
  Object.keys(journalCounts).forEach(m => { if (journalCounts[m] > 0 && ymRegex.test(m)) allMonths.add(m); });

  const sortedMonths = [...allMonths].sort((a, b) => b.localeCompare(a));

  if (sortedMonths.length === 0) {
    return `
      ${renderHeader('振り返り')}
      <div class="content">
        <div class="rv-empty">まだデータがありません</div>
      </div>
      ${renderNavBar('review-list')}
    `;
  }

  // 年別にグループ化
  const byYear = {};
  sortedMonths.forEach(ym => {
    const year = ym.split('-')[0];
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(ym);
  });

  const yearsHTML = Object.keys(byYear).sort((a, b) => b - a).map(year => {
    const yearMonths = byYear[year];

    const monthsHTML = yearMonths.map(ym => {
      const goal = monthlyGoals.find(g => g.yearMonth === ym);
      const goalText = goal?.goal || '';
      const jCount = journalCounts[ym] || 0;
      const monthNum = parseInt(ym.split('-')[1]);

      // この月にかかる長期目標を取得
      const matching = goalRanges.filter(gr => gr.months.includes(ym));

      // ラベル: この年グループ内で最初に登場する月ならラベルを表示
      let labelsHTML = '';
      matching.forEach(gr => {
        const firstInYear = yearMonths.find(m => gr.months.includes(m));
        if (firstInYear === ym) {
          labelsHTML += `<div class="rvl-goal-label" style="border-left-color: ${gr.color}; color: ${gr.color}" onclick="event.stopPropagation(); app.viewLongTermGoal(${gr.id})">${escapeHtml(gr.title)}</div>`;
        }
      });

      // サイドバー: box-shadowで左端に色バーを表示
      let barStyle = '';
      if (matching.length > 0) {
        const shadows = matching.map((gr, i) =>
          `inset ${4 * (i + 1)}px 0 0 ${gr.color}`
        );
        barStyle = ` style="box-shadow: ${shadows.join(', ')}; padding-left: ${4 * matching.length + 16}px"`;
      }

      return `
        ${labelsHTML}
        <div class="rvl-month-card" onclick="app.viewReviewMonth('${ym}')"${barStyle}>
          <div class="rvl-month-num">${monthNum}月</div>
          <div class="rvl-month-info">
            <div class="rvl-month-goal">${goalText ? escapeHtml(goalText) : '<span class="placeholder">目標未設定</span>'}</div>
            <div class="rvl-month-meta">日誌 ${jCount}件</div>
          </div>
          <div class="rvl-month-arrow">${getIcon('forward')}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="rvl-year-group">
        <div class="rvl-year-title">${escapeHtml(year)}年</div>
        ${monthsHTML}
      </div>
    `;
  }).join('');

  return `
    ${renderHeader('振り返り')}
    <div class="content">
      ${yearsHTML}
    </div>
    ${renderNavBar('review-list')}
  `;
}

/* ========================================
   振り返り月詳細ページ（月次 + 日誌）
   ======================================== */
function renderReviewMonthPage(data) {
  const yearMonth = app.reviewYearMonth || getCurrentMonth();
  const monthlyGoal = data.reviewMonthlyGoal || data.monthlyGoal || {};
  const journals = data.reviewJournals || data.journals || [];
  const validTabs = ['monthly', 'journals', 'routines'];
  const reviewTab = validTabs.includes(app.reviewTab) ? app.reviewTab : 'monthly';

  const tabs = [
    { id: 'monthly', label: '月次' },
    { id: 'journals', label: '日誌' },
    { id: 'routines', label: 'ルーティン' }
  ];
  const tabsHTML = tabs.map(t =>
    `<div class="rv-tab ${reviewTab === t.id ? 'active' : ''}" onclick="app.switchReviewTab('${t.id}')">${t.label}</div>`
  ).join('');

  let contentHTML = '';
  if (reviewTab === 'monthly') {
    contentHTML = renderReviewMonthlyOverview(monthlyGoal);
  } else if (reviewTab === 'journals') {
    contentHTML = renderReviewJournalList(data, journals);
  } else if (reviewTab === 'routines') {
    contentHTML = renderReviewRoutineChecklist(journals, yearMonth);
  }

  const monthStr = formatMonthJapanese(yearMonth);

  return `
    ${renderHeader(monthStr, { showBack: true })}
    <div class="content">
      <div class="rv-tabs">${tabsHTML}</div>
      ${contentHTML}
    </div>
    ${renderNavBar('review-list')}
  `;
}

// === 月次概要（読み取り専用ビュー） ===
function renderReviewMonthlyOverview(monthlyGoal) {
  const categoryNames = { rei: '霊', shin: '心', tai: '体', gi: '技', sei: '生活', other: 'その他' };
  let html = '';

  // 目標
  if (monthlyGoal.goal) {
    html += `<div class="rvm-section">
      <div class="rvm-label">今月の目標</div>
      <div class="rvm-text">${escapeHtml(monthlyGoal.goal)}</div>
    </div>`;
  }

  // 達成イメージ
  if (monthlyGoal.vision) {
    html += `<div class="rvm-section">
      <div class="rvm-label">達成イメージ</div>
      <div class="rvm-text">${escapeHtml(monthlyGoal.vision)}</div>
    </div>`;
  }

  // パターン分析
  if (monthlyGoal.patterns) {
    const hasSuccess = monthlyGoal.patterns.success && Object.values(monthlyGoal.patterns.success).some(v => v);
    const hasFailure = monthlyGoal.patterns.failure && Object.values(monthlyGoal.patterns.failure).some(v => v);
    if (hasSuccess || hasFailure) {
      let patternHTML = '';
      if (hasSuccess) {
        patternHTML += '<div class="rvm-sub-title">成功パターン</div>';
        Object.entries(monthlyGoal.patterns.success).forEach(([cat, val]) => {
          if (val) patternHTML += `<div class="rvm-pattern-item"><span class="rvm-cat-badge rvm-cat-${cat}">${categoryNames[cat] || cat}</span><span>${escapeHtml(val)}</span></div>`;
        });
      }
      if (hasFailure) {
        patternHTML += '<div class="rvm-sub-title">失敗パターン</div>';
        Object.entries(monthlyGoal.patterns.failure).forEach(([cat, val]) => {
          if (val) patternHTML += `<div class="rvm-pattern-item"><span class="rvm-cat-badge rvm-cat-${cat}">${categoryNames[cat] || cat}</span><span>${escapeHtml(val)}</span></div>`;
        });
      }
      html += `<div class="rvm-section">
        <div class="rvm-label">パターン分析</div>
        ${patternHTML}
      </div>`;
    }
  }

  // ルーティン
  const routines = (monthlyGoal.routines || []).filter(r => r.name);
  if (routines.length > 0) {
    const byCategory = {};
    routines.forEach(r => {
      const cat = r.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(r);
    });

    const routineHTML = Object.entries(byCategory).map(([cat, items]) => {
      const label = categoryNames[cat] || cat;
      const itemsHTML = items.map(r => `<div class="rvm-routine-item">${escapeHtml(r.name)}</div>`).join('');
      return `<div class="rvm-routine-group">
        <div class="rvm-cat-header"><span class="rvm-cat-badge rvm-cat-${cat}">${label}</span></div>
        ${itemsHTML}
      </div>`;
    }).join('');

    html += `<div class="rvm-section">
      <div class="rvm-label">ルーティン（${routines.length}項目）</div>
      ${routineHTML}
    </div>`;
  }

  // コアアクション
  const coreLabels = { deadline: '期限付き', processing: '要処理', habit: '習慣', other: 'その他' };
  if (monthlyGoal.coreActions) {
    const coreItems = Object.entries(coreLabels).map(([key, label]) => {
      const value = monthlyGoal.coreActions[key];
      if (!value) return '';
      return `<div class="rvm-core-item"><span class="rvm-core-label">${label}</span><span class="rvm-core-text">${escapeHtml(value)}</span></div>`;
    }).filter(Boolean).join('');
    if (coreItems) {
      html += `<div class="rvm-section">
        <div class="rvm-label">期日目標</div>
        ${coreItems}
      </div>`;
    }
  }

  // 報酬
  if (monthlyGoal.reward) {
    const rw = monthlyGoal.reward;
    const rewardItems = [
      { label: '気持ち×自分', value: rw.selfFeeling },
      { label: '見えるもの×自分', value: rw.selfVisible },
      { label: '気持ち×他人', value: rw.othersFeeling },
      { label: '見えるもの×他人', value: rw.othersVisible }
    ].filter(r => r.value);
    if (rewardItems.length > 0) {
      html += `<div class="rvm-section">
        <div class="rvm-label">達成報酬</div>
        ${rewardItems.map(r => `<div class="rvm-reward-item"><span class="rvm-reward-label">${r.label}</span><span class="rvm-reward-text">${escapeHtml(r.value)}</span></div>`).join('')}
      </div>`;
    }
  }

  // サポート
  if (monthlyGoal.support && (monthlyGoal.support.supporter || monthlyGoal.support.content)) {
    html += `<div class="rvm-section">
      <div class="rvm-label">サポート</div>
      ${monthlyGoal.support.supporter ? `<div class="rvm-text">協力者: ${escapeHtml(monthlyGoal.support.supporter)}</div>` : ''}
      ${monthlyGoal.support.content ? `<div class="rvm-text">${escapeHtml(monthlyGoal.support.content)}</div>` : ''}
    </div>`;
  }

  // 月末評価
  if (monthlyGoal.evaluation) {
    const ev = monthlyGoal.evaluation;
    let evalHTML = '';
    if (ev.achievement) evalHTML += `<div class="rvm-eval-item"><span class="rvm-eval-label">達成度</span><span class="rvm-eval-text">${escapeHtml(ev.achievement)}</span></div>`;
    if (ev.reflection) evalHTML += `<div class="rvm-eval-item"><span class="rvm-eval-label">振り返り</span><span class="rvm-eval-text">${escapeHtml(ev.reflection)}</span></div>`;
    if (ev.nextAction) evalHTML += `<div class="rvm-eval-item"><span class="rvm-eval-label">次の行動</span><span class="rvm-eval-text">${escapeHtml(ev.nextAction)}</span></div>`;
    if (evalHTML) {
      html += `<div class="rvm-section">
        <div class="rvm-label">月末評価</div>
        ${evalHTML}
      </div>`;
    }
  }

  if (!html) {
    return '<div class="rv-empty">この月の月次目標はまだ設定されていません</div>';
  }

  return `<div class="rvm-container">${html}</div>`;
}

// === 日誌閲覧タブ ===
function renderReviewJournalList(data, journals) {
  const sorted = [...(journals || [])]
    .filter(j => hasJournalData(j))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (sorted.length === 0) {
    return '<div class="rv-empty">この月の日誌はまだありません</div>';
  }

  const reflectionLabels = {
    reflection: '今日の反省',
    effort: '努力・成果',
    contribution: '世の為人の為',
    gratitude: '気付き・感謝',
    free: '自由記入'
  };

  const coreLabels = {
    deadline: '期限付き',
    processing: '処理系',
    habit: '習慣',
    other: 'その他'
  };

  const cardsHTML = sorted.map(j => {
    const date = j.date || '';
    const parts = date.split('-');
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    let dateLabel = date;
    if (parts.length === 3) {
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (!isNaN(d.getTime())) {
        dateLabel = `${+parts[1]}/${+parts[2]}（${dayNames[d.getDay()]}）`;
      }
    }

    // スコア（数字表示）
    let scoreHTML = '';
    let avgScore = null;
    if (j.scoreItems && j.scoreItems.length > 0) {
      const vals = j.scoreItems.map(item => (j.scores && j.scores[item.id]) ?? 0);
      const scored = vals.filter(v => v > 0);
      avgScore = scored.length > 0 ? (scored.reduce((a, b) => a + b, 0) / scored.length) : null;
      const scoreRows = j.scoreItems.map(item => {
        const val = (j.scores && j.scores[item.id]) ?? 0;
        return `<div class="rjl-score-row"><span class="rjl-score-label">${escapeHtml(item.title)}</span><span class="rjl-score-val">${val}</span></div>`;
      }).join('');
      scoreHTML = `<div class="rjl-score-section">${scoreRows}</div>`;
    }

    // 意気込み
    let resolutionHTML = '';
    if (j.resolution) {
      resolutionHTML = `<div class="rjl-field"><div class="rjl-field-label">意気込み</div><div class="rjl-field-text">${escapeHtml(j.resolution)}</div></div>`;
    }

    // コアアクション
    let coreHTML = '';
    if (j.coreActions) {
      const coreItems = Object.entries(coreLabels).map(([key, label]) => {
        const ca = j.coreActions[key];
        if (!ca || !ca.name) return '';
        return `<div class="rjl-core-item"><span class="rjl-core-check ${ca.done ? 'done' : ''}">${ca.done ? '✓' : '○'}</span><span class="rjl-core-label">${escapeHtml(label)}</span><span class="rjl-core-name">${escapeHtml(ca.name)}</span></div>`;
      }).filter(s => s).join('');
      if (coreItems) {
        coreHTML = `<div class="rjl-field"><div class="rjl-field-label">コアアクション</div>${coreItems}</div>`;
      }
    }

    // 振り返り
    let reflHTML = '';
    if (j.reflections) {
      const reflItems = Object.entries(reflectionLabels).map(([key, label]) => {
        const text = j.reflections[key];
        if (!text) return '';
        return `<div class="rjl-field"><div class="rjl-field-label">${escapeHtml(label)}</div><div class="rjl-field-text">${escapeHtml(text)}</div></div>`;
      }).filter(s => s).join('');
      reflHTML = reflItems;
    }

    // 明日の意気込み
    let tomorrowHTML = '';
    if (j.tomorrowResolution) {
      tomorrowHTML = `<div class="rjl-field"><div class="rjl-field-label">明日の意気込み</div><div class="rjl-field-text">${escapeHtml(j.tomorrowResolution)}</div></div>`;
    }

    // メモ
    let memoHTML = '';
    if (j.memo) {
      memoHTML = `<div class="rjl-field"><div class="rjl-field-label">メモ</div><div class="rjl-field-text">${escapeHtml(j.memo)}</div></div>`;
    }

    // AIコメント
    let aiHTML = '';
    if (j.aiComment) {
      const aiText = j.aiComment.text || j.aiComment.normal || '';
      if (aiText) {
        aiHTML = `<div class="rjl-field rjl-ai-comment"><div class="rjl-field-label">AIコメント</div><div class="rjl-field-text">${escapeHtml(aiText)}</div></div>`;
      }
    }

    const avgHTML = avgScore !== null ? `<div class="rjl-avg">${Number.isInteger(avgScore) ? avgScore : avgScore.toFixed(1)}</div>` : '';

    return `
      <div class="rjl-card">
        <div class="rjl-header" onclick="app.viewJournal('${escapeHtml(date)}')" style="cursor:pointer">
          <div class="rjl-date">${escapeHtml(dateLabel)}</div>
          <div class="rjl-title">${j.title ? escapeHtml(j.title) : ''}</div>
          ${avgHTML}
          <div class="rjl-edit-icon">${getIcon('forward')}</div>
        </div>
        ${scoreHTML}
        ${resolutionHTML}
        ${coreHTML}
        ${reflHTML}
        ${tomorrowHTML}
        ${memoHTML}
        ${aiHTML}
      </div>
    `;
  }).join('');

  return `<div class="rjl-container">${cardsHTML}</div>`;
}

// === ルーティンチェック表 ===
function renderReviewRoutineChecklist(journals, yearMonth) {
  const sorted = [...(journals || [])]
    .filter(j => j.routines && j.routines.length > 0)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // 全ルーティン名を収集（名前付きのみ）
  const routineNames = [];
  const routineNameSet = new Set();
  sorted.forEach(j => {
    (j.routines || []).forEach(r => {
      if (r.name && !routineNameSet.has(r.name)) {
        routineNameSet.add(r.name);
        routineNames.push(r.name);
      }
    });
  });

  if (routineNames.length === 0) {
    return '<div class="rv-empty">この月のルーティンデータはありません</div>';
  }

  // 日付リスト
  const dates = sorted.map(j => j.date);

  // サマリー統計
  let totalDone = 0, totalCount = 0;
  const perRoutine = {};
  routineNames.forEach(name => { perRoutine[name] = { done: 0, total: 0 }; });

  sorted.forEach(j => {
    (j.routines || []).forEach(r => {
      if (!r.name || !routineNameSet.has(r.name)) return;
      if (!isRoutineActiveToday(r, j.date)) return;
      const s = getRoutineStatus(r);
      perRoutine[r.name].total++;
      totalCount++;
      if (s === 'done') {
        perRoutine[r.name].done++;
        totalDone++;
      } else if (s === 'partial') {
        perRoutine[r.name].done += 0.5;
        totalDone += 0.5;
      }
    });
  });

  const overallRate = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0;

  // サマリーHTML
  const summaryHTML = `
    <div class="rcl-summary">
      <div class="rcl-summary-rate">
        <div class="rcl-summary-num">${overallRate}%</div>
        <div class="rcl-summary-label">月間達成率</div>
      </div>
      <div class="rcl-summary-detail">${totalDone} / ${totalCount}</div>
    </div>
  `;

  // ルーティン別達成率
  const perRoutineHTML = routineNames.map(name => {
    const pr = perRoutine[name];
    const rate = pr.total > 0 ? Math.round((pr.done / pr.total) * 100) : 0;
    const barWidth = rate;
    return `
      <div class="rcl-routine-row">
        <div class="rcl-routine-name">${escapeHtml(name)}</div>
        <div class="rcl-routine-bar-wrap">
          <div class="rcl-routine-bar" style="width:${barWidth}%"></div>
        </div>
        <div class="rcl-routine-rate">${rate}%</div>
      </div>
    `;
  }).join('');

  // マトリクス（横スクロール）
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  const headerCells = dates.map(d => {
    const parts = d.split('-');
    const dt = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const dayOfWeek = dayNames[dt.getDay()];
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
    return `<th class="rcl-th ${isWeekend ? 'weekend' : ''}"><div class="rcl-day">${+parts[2]}</div><div class="rcl-dow">${dayOfWeek}</div></th>`;
  }).join('');

  // 日別達成数を計算
  const perDay = {};
  dates.forEach(d => { perDay[d] = { done: 0, total: 0 }; });
  sorted.forEach(j => {
    (j.routines || []).forEach(r => {
      if (!r.name || !routineNameSet.has(r.name)) return;
      if (!isRoutineActiveToday(r, j.date)) return;
      perDay[j.date].total++;
      const s = getRoutineStatus(r);
      if (s === 'done') perDay[j.date].done++;
      else if (s === 'partial') perDay[j.date].done += 0.5;
    });
  });

  const journalByDate = new Map(sorted.map(j => [j.date, j]));
  const bodyRows = routineNames.map(name => {
    const pr = perRoutine[name];
    const rate = pr.total > 0 ? Math.round((pr.done / pr.total) * 100) : 0;
    const cells = dates.map(d => {
      const journal = journalByDate.get(d);
      const routines = journal ? (journal.routines || []) : [];
      const rIndex = routines.findIndex(r => r.name === name);
      if (rIndex === -1) return '<td class="rcl-cell rcl-na">-</td>';
      if (!isRoutineActiveToday(routines[rIndex], d)) return '<td class="rcl-cell rcl-na">-</td>';
      const s = getRoutineStatus(routines[rIndex]);
      const icon = s === 'done' ? '●' : s === 'partial' ? '◐' : '○';
      return `<td class="rcl-cell rcl-${s}" onclick="app.toggleReviewRoutine('${d}', ${rIndex})">${icon}</td>`;
    }).join('');
    return `<tr><td class="rcl-name-cell">${escapeHtml(name)}</td>${cells}<td class="rcl-total-cell">${pr.done}/${pr.total}<br><span class="rcl-total-rate">${rate}%</span></td></tr>`;
  }).join('');

  // 下行（日別集計）
  const footerCells = dates.map(d => {
    const pd = perDay[d];
    const dayRate = pd.total > 0 ? Math.round((pd.done / pd.total) * 100) : 0;
    return `<td class="rcl-footer-cell">${pd.done}/${pd.total}<br><span class="rcl-footer-rate">${dayRate}%</span></td>`;
  }).join('');

  const matrixHTML = `
    <div class="rcl-matrix-wrap">
      <table class="rcl-matrix">
        <thead><tr><th class="rcl-name-header">ルーティン</th>${headerCells}<th class="rcl-total-header">達成</th></tr></thead>
        <tbody>${bodyRows}</tbody>
        <tfoot><tr><td class="rcl-footer-label">達成</td>${footerCells}<td class="rcl-footer-total">${overallRate}%</td></tr></tfoot>
      </table>
    </div>
  `;

  return `
    <div class="rcl-container">
      ${matrixHTML}
    </div>
  `;
}

// === カレンダー独立ページ ===
function renderCalendarPage(data) {
  const { journals } = data;
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const calJournals = data.calendarJournals || journals;
  const calMG = data.calendarMonthlyGoal || data.monthlyGoal;
  const calTasks = data.calendarTasks || [];
  const calendarContent = renderReviewCalendar(data, today, year, month, calJournals, calMG, calTasks);

  return `
    ${renderHeader('カレンダー', { showBack: true })}
    <div class="content calendar-page-content">
      ${calendarContent}
    </div>
    ${renderNavBar('home')}
  `;
}

// === カレンダー描画 ===
function renderReviewCalendar(data, today, year, month, journals, calMG, calTasks) {
  const calMonth = app.reviewCalendarMonth ?? month;
  const calYear = app.reviewCalendarYear ?? year;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const lastDate = new Date(calYear, calMonth + 1, 0).getDate();
  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth();

  // 曜日ヘッダー（日曜赤・土曜青）
  const dayNames = ['日','月','火','水','木','金','土'];
  const dayClasses = ['sun','','','','','','sat'];
  let calendarHTML = dayNames.map((d, i) =>
    `<div class="calendar-day header ${dayClasses[i]}">${d}</div>`
  ).join('');

  // データ準備
  const categories = ['rei', 'shin', 'tai', 'gi', 'sei'];
  const dotColors = { rei: '#7C4DFF', shin: '#E91E63', gi: '#FF9800', tai: '#4CAF50', sei: '#2196F3' };
  const calJournalMap = new Map(journals.map(j => [j.date, j]));
  const mg = calMG || {};
  const tasks = calTasks || [];
  const msMilestones = mg.weeklyMilestones || [];
  const hasMilestones = msMilestones.some(m => m);

  // 全セルを配列に収集（行ごとにまとめて出力するため）
  const allCells = [];

  // 月初の空セル
  for (let i = 0; i < firstDay; i++) {
    allCells.push('<div class="calendar-day"></div>');
  }

  // 日付セル
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const journal = calJournalMap.get(dateStr);
    const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
    const dayOfWeek = new Date(calYear, calMonth, d).getDay();
    const dowClass = dayOfWeek === 0 ? 'sun' : dayOfWeek === 6 ? 'sat' : '';

    // パターンマーク
    const dateObj = new Date(calYear, calMonth, d);
    const matchingPatterns = app.getDateMatchingPatterns(dateObj, mg);
    const hasPattern = matchingPatterns.length > 0;
    const patternColor = hasPattern && matchingPatterns[0].schedule && matchingPatterns[0].schedule.length > 0
      ? sanitizeColor(matchingPatterns[0].schedule[0].color || '#4A90A4') : '';

    // タスクマーク
    const dayTasks = tasks.filter(t => {
      if (t.status === 'done') return false;
      if (t.dateTime && t.dateTime.startsWith(dateStr)) return true;
      if (t.deadline && t.deadline === dateStr) return true;
      return false;
    });
    const hasTask = dayTasks.length > 0;

    // カテゴリドット
    let catDots = '';
    const routines = journal ? (journal.routines || []) : [];
    if (routines.length > 0) {
      const dots = categories.map(cat => {
        const catRoutines = routines.filter(r => r.category === cat && r.name && isRoutineActiveToday(r, dateStr));
        if (catRoutines.length === 0) return '';
        const allDone = catRoutines.every(r => getRoutineStatus(r) === 'done');
        const anyDone = catRoutines.some(r => isRoutineActive(r));
        const opacity = allDone ? '1' : anyDone ? '0.5' : '0.15';
        return `<span class="rv-cat-dot" style="background:${dotColors[cat]};opacity:${opacity}"></span>`;
      }).filter(Boolean);
      if (dots.length > 0) {
        catDots = `<div class="rv-cat-dots">${dots.join('')}</div>`;
      }
    }

    // インジケーター
    let indicators = '';
    if (hasPattern || hasTask) {
      indicators += '<div class="cal-day-indicators">';
      if (hasPattern) indicators += `<span class="cal-day-pattern" style="background:${patternColor}"></span>`;
      if (hasTask) indicators += `<span class="cal-day-task">${dayTasks.length}</span>`;
      indicators += '</div>';
    }

    // セル内テキスト（期日アイテム or タスク名、最大1行 + 件数バッジ）
    let cellText = '';
    const dlItems = (mg.deadlineItems || []).filter(di => di.date === dateStr && di.title);
    const totalTextItems = dlItems.length + dayTasks.length;
    if (dlItems.length > 0) {
      cellText = `<div class="cal-cell-deadline">${escapeHtml(dlItems[0].title)}${totalTextItems > 1 ? `<span class="cal-cell-more">+${totalTextItems - 1}</span>` : ''}</div>`;
    } else if (dayTasks.length > 0) {
      cellText = `<div class="cal-cell-task">${escapeHtml(dayTasks[0].title || '')}${dayTasks.length > 1 ? `<span class="cal-cell-more">+${dayTasks.length - 1}</span>` : ''}</div>`;
    }

    allCells.push(`<div class="calendar-day ${isToday ? 'today' : ''} ${dowClass}" onclick="app.toggleDaySummary('${dateStr}', this)">${d}${indicators}${cellText}${catDots}</div>`);
  }

  // 最終行の端まで空セルで埋める
  const totalDataCells = firstDay + lastDate;
  const numRows = Math.ceil(totalDataCells / 7);
  const totalNeeded = numRows * 7;
  for (let i = totalDataCells; i < totalNeeded; i++) {
    allCells.push('<div class="calendar-day empty-pad"></div>');
  }

  // 行ごとに出力（マイルストーンラベル行を挟む）
  const currentWeekRow = isCurrentMonth ? Math.floor((today.getDate() - 1 + firstDay) / 7) : -1;
  for (let row = 0; row < numRows; row++) {
    if (hasMilestones) {
      const msText = msMilestones[row] || '';
      const isCurrent = row === currentWeekRow;
      calendarHTML += `<div class="cal-week-label ${isCurrent ? 'cal-week-current' : ''}">${msText ? escapeHtml(msText) : ''}</div>`;
    }
    for (let col = 0; col < 7; col++) {
      calendarHTML += allCells[row * 7 + col];
    }
  }

  const gridRows = hasMilestones
    ? `auto repeat(${numRows}, auto 1fr)`
    : `auto repeat(${numRows}, 1fr)`;

  return `
    <div class="rv-cal-nav">
      <div class="rv-cal-nav-center">
        <button class="rv-cal-arrow" onclick="app.reviewCalendarPrev()">${getIcon('back')}</button>
        <span class="rv-cal-title" onclick="app.openCalendarPicker()">${calYear}年${calMonth + 1}月</span>
        <button class="rv-cal-arrow" onclick="app.reviewCalendarNext()">${getIcon('forward')}</button>
      </div>
    </div>
    <div class="calendar-grid" style="grid-template-rows: ${gridRows}">${calendarHTML}</div>
    <div id="rv-day-summary" class="rv-day-summary"></div>
    <div id="rv-calendar-picker" class="rv-picker-overlay" style="display:none"></div>
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

// calculateRoutineRate は db.js で定義（重複削除）
