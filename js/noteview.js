/* ========================================
   MM - ノートビュー（Notion風 2カラム並列）
   ワイドスクリーン用：今日 + 整理用 同時表示
   GTDノートビュー + ルーティンノートビュー
   ======================================== */

// GTD種別の定義（色・ラベル）
const NV_CATEGORIES = {
  urgent:   { label: 'すぐやる', color: '#ef4444' },
  action:   { label: 'アクションリスト', color: '#3498db' },
  project:  { label: 'プロジェクト', color: '#e67e22' },
  waiting:  { label: '待機リスト', color: '#f39c12' },
  calendar: { label: 'カレンダー', color: '#2ecc71' },
  wish:     { label: 'いつかやりたい', color: '#95a5a6' },
  fbox:     { label: 'F・BOX', color: '#e74c3c' },
  routine:  { label: 'ルーティン', color: '#9b59b6' }
};

// ルーティンカテゴリ定義
const NV_ROUTINE_CATEGORIES = {
  goal:        { label: '目標', color: '#ef4444' },
  obligation:  { label: '義務', color: '#3498db' },
  maintenance: { label: '維持', color: '#2ecc71' },
  principle:   { label: '指針', color: '#f59e0b' },
  candidate:   { label: '候補', color: '#95a5a6' }
};

// ステータス定義
const NV_STATUS = {
  open:        { label: '未着手', icon: '○', color: '#999' },
  in_progress: { label: '進行中', icon: '●', color: '#3498db' },
  done:        { label: '完了',   icon: '✓', color: '#27ae60' }
};

// スコープ定義
const NV_SCOPE = {
  personal: { label: '個人', color: '#8b5cf6' },
  social:   { label: '社会', color: '#06b6d4' }
};

/* ========================================
   GTDノートビュー
   ======================================== */

/**
 * GTDノートビューページ（パターンA/B切替対応）
 */
function renderNoteViewPage(appRef) {
  const pattern = appRef.noteViewPattern || 'A';

  const toggleHTML = `
    <div class="nv-pattern-toggle">
      <button class="${pattern === 'A' ? 'active' : ''}" onclick="app.setNoteViewPattern('A')">A</button>
      <button class="${pattern === 'B' ? 'active' : ''}" onclick="app.setNoteViewPattern('B')">B</button>
    </div>
  `;

  let contentHTML;
  if (pattern === 'B') {
    contentHTML = renderNoteViewDashboard(appRef);
  } else {
    const todayGroups = buildTodayGroups(appRef);
    const organizeGroups = buildOrganizeGroups(appRef);
    contentHTML = `
      <div class="nv-page">
        <div class="nv-column">
          <div class="nv-column-title">今日</div>
          ${todayGroups.map(group => renderNvGroup(group, 'today', appRef)).join('')}
        </div>
        <div class="nv-divider"></div>
        <div class="nv-column">
          <div class="nv-column-title">整理用</div>
          ${organizeGroups.map(group => renderNvGroup(group, 'organize', appRef)).join('')}
        </div>
      </div>
    `;
  }

  return `
    ${renderHeader('ノートビュー', { showBack: true, rightHtml: toggleHTML })}
    <div class="content">
      ${contentHTML}
    </div>
    ${renderNavBar('gtd')}
  `;
}

/* ========================================
   パターンB: ダッシュボード型ノートビュー
   ======================================== */

function renderNoteViewDashboard(appRef) {
  const allTasks = (appRef.taskItems || []).filter(t => (t.status || 'open') !== 'done');
  const doneTasks = (appRef.taskItems || []).filter(t => (t.status || 'open') === 'done');
  const fboxItems = appRef.firstBoxItems || [];
  const now = Date.now();
  const sevenDays = 7 * 86400000;

  // 緊急度判定
  function getUrgency(task) {
    if (task.type === 'calendar' && task.dateTime) {
      const dt = new Date(task.dateTime).getTime();
      if (!isNaN(dt)) {
        if (dt < now) return 'overdue';
        if (dt - now < sevenDays) return 'soon';
      }
    }
    if (task.type === 'waiting' && task.deadline) {
      const dt = new Date(task.deadline).getTime();
      if (!isNaN(dt)) {
        if (dt < now) return 'overdue';
        if (dt - now < sevenDays) return 'soon';
      }
    }
    if (task.type === 'urgent') return 'soon';
    if ((task.status || 'open') === 'in_progress') return 'active';
    return 'ok';
  }

  // 期限テキスト
  function getDeadlineText(task) {
    let dateVal = null;
    if (task.type === 'calendar' && task.dateTime) dateVal = new Date(task.dateTime);
    else if (task.type === 'waiting' && task.deadline) dateVal = new Date(task.deadline);
    if (!dateVal || isNaN(dateVal.getTime())) return '';
    const diffDays = Math.ceil((dateVal.getTime() - now) / 86400000);
    if (diffDays < 0) return `超過${Math.abs(diffDays)}日`;
    if (diffDays === 0) return '今日';
    return `あと${diffDays}日`;
  }

  // 分類
  const overdue = [];
  const soon = [];
  const active = [];
  const ok = [];

  allTasks.forEach(task => {
    const urgency = getUrgency(task);
    const item = {
      id: task.id, source: 'task', title: task.title || '',
      type: task.type, status: task.status || 'open',
      deadlineText: getDeadlineText(task), urgency: urgency
    };
    if (urgency === 'overdue') overdue.push(item);
    else if (urgency === 'soon') soon.push(item);
    else if (urgency === 'active') active.push(item);
    else ok.push(item);
  });

  // F-BOXは「要処理」
  fboxItems.forEach(f => {
    soon.push({
      id: f.id, source: 'fbox', title: f.text || '',
      type: 'fbox', status: 'open', deadlineText: '', urgency: 'soon'
    });
  });

  // 今日のルーティン（義務・維持）
  const journalRoutines = appRef.data.todayJournal?.routines || [];
  journalRoutines.forEach((r, i) => {
    if (r.category !== 'obligation' && r.category !== 'maintenance') return;
    let st = 'open';
    if (r.status === 'done' || r.done) st = 'done';
    else if (r.status === 'partial') st = 'in_progress';
    if (st === 'done') return;
    active.push({
      id: i, source: 'routine-journal', title: r.name || '',
      type: 'routine', status: st, deadlineText: '今日', urgency: 'active'
    });
  });

  const overdueCount = overdue.length;
  const soonCount = soon.length;
  const activeCount = active.length;
  const okCount = ok.length;
  const totalCount = overdueCount + soonCount + activeCount + okCount;

  // サマリーカード
  const cardsHTML = `
    <div class="nv-dash-cards">
      <div class="nv-dash-card nv-dash-overdue${overdueCount > 0 ? ' has-items' : ''}" onclick="app.scrollToDashSection('overdue')">
        <div class="nv-dash-card-label">期限超過</div>
        <div class="nv-dash-card-count">${overdueCount}</div>
        <div class="nv-dash-card-unit">件</div>
      </div>
      <div class="nv-dash-card nv-dash-soon${soonCount > 0 ? ' has-items' : ''}" onclick="app.scrollToDashSection('soon')">
        <div class="nv-dash-card-label">すぐやる/7日以内</div>
        <div class="nv-dash-card-count">${soonCount}</div>
        <div class="nv-dash-card-unit">件</div>
      </div>
      <div class="nv-dash-card nv-dash-active${activeCount > 0 ? ' has-items' : ''}" onclick="app.scrollToDashSection('active')">
        <div class="nv-dash-card-label">進行中/今日</div>
        <div class="nv-dash-card-count">${activeCount}</div>
        <div class="nv-dash-card-unit">件</div>
      </div>
      <div class="nv-dash-card nv-dash-total">
        <div class="nv-dash-card-label">未完了合計</div>
        <div class="nv-dash-card-count">${totalCount}</div>
        <div class="nv-dash-card-unit">件</div>
      </div>
    </div>
  `;

  // アラートバナー
  let alertHTML = '';
  if (overdueCount > 0) {
    alertHTML = `<div class="nv-dash-alert">⚠ 期限超過 ${overdueCount}件があります。ご確認ください。</div>`;
  }

  // セクション描画
  function renderDashSection(id, label, items) {
    if (items.length === 0) return '';
    return `
      <div class="nv-dash-section" id="dash-${id}">
        <div class="nv-dash-section-header nv-dash-header-${id}">${label}（${items.length}件）</div>
        ${items.map(item => renderDashRow(item)).join('')}
      </div>
    `;
  }

  function renderDashRow(item) {
    const cat = NV_CATEGORIES[item.type] || { label: item.type, color: '#999' };
    const statusClass = 'nv-status-' + item.status;
    const isFbox = item.source === 'fbox';
    const isRoutine = item.source === 'routine-journal';
    const checkIcon = isFbox ? '→' : item.status === 'in_progress' ? '●' : '○';

    let checkAction = 'void(0)';
    if (item.source === 'task') checkAction = `app.toggleTaskStatus(${item.id})`;
    else if (isFbox) checkAction = `app.startFirstBoxSort(${item.id})`;
    else if (isRoutine) checkAction = `app.toggleRoutine(${item.id})`;

    let editAction = 'void(0)';
    if (item.source === 'task') editAction = `app.showEditTaskModal(${item.id})`;
    else if (isFbox) editAction = `app.startFirstBoxSort(${item.id})`;

    return `
      <div class="nv-dash-row ${statusClass}">
        <div class="nv-dash-check ${statusClass}${isFbox ? ' nv-dash-check-fbox' : ''}" onclick="event.stopPropagation(); ${checkAction}">
          ${checkIcon}
        </div>
        <span class="nv-dash-badge" style="background:${cat.color}18; color:${cat.color}">${cat.label}</span>
        <div class="nv-dash-title" onclick="${editAction}">${escapeHtml(item.title)}</div>
        ${item.deadlineText ? `<span class="nv-dash-deadline nv-dash-dl-${item.urgency}">${item.deadlineText}</span>` : ''}
        ${item.source === 'task' ? `<button class="nv-dash-edit" onclick="${editAction}">編集</button>` : ''}
      </div>
    `;
  }

  const sectionsHTML =
    renderDashSection('overdue', '期限超過', overdue) +
    renderDashSection('soon', 'すぐやる・7日以内', soon) +
    renderDashSection('active', '進行中・今日のルーティン', active) +
    renderDashSection('ok', '余裕あり', ok);

  // 完了済み折りたたみ
  let doneHTML = '';
  if (doneTasks.length > 0) {
    const doneCollapsed = appRef.noteViewCollapsed?.['dash-done'];
    doneHTML = `
      <div class="nv-dash-section">
        <div class="nv-dash-section-header nv-dash-header-done" onclick="app.toggleNoteViewSection('dash-done')">
          ${doneCollapsed ? '▸' : '▾'} 完了済み（${doneTasks.length}件）
        </div>
        ${!doneCollapsed ? doneTasks.map(task => renderDashRow({
          id: task.id, source: 'task', title: task.title || '',
          type: task.type, status: 'done', deadlineText: '', urgency: 'ok'
        })).join('') : ''}
      </div>
    `;
  }

  return `
    ${alertHTML}
    ${cardsHTML}
    ${sectionsHTML || '<div class="nv-dash-empty">未完了のタスクはありません</div>'}
    ${doneHTML}
  `;
}

/**
 * 今日ビュー：ステータス別グループ（未着手/進行中/完了）
 * ルーティンは義務・維持のみ表示
 */
function buildTodayGroups(appRef) {
  const allItems = [];

  // タスク
  (appRef.taskItems || []).forEach(t => {
    allItems.push({
      id: t.id,
      source: 'task',
      title: t.title || '',
      status: t.status || 'open',
      category: t.type || 'action',
      timeStart: t.timeStart || '',
      timeEnd: t.timeEnd || '',
      scope: t.scope || '',
      sub: buildTaskSub(t)
    });
  });

  // 今日のルーティン（日誌から取得、義務・維持のみ）
  const journalRoutines = appRef.data.todayJournal?.routines || [];
  journalRoutines.forEach((r, i) => {
    if (r.category !== 'obligation' && r.category !== 'maintenance') return;

    let status = 'open';
    if (r.status === 'done' || r.done) status = 'done';
    else if (r.status === 'partial') status = 'in_progress';

    allItems.push({
      id: i,
      source: 'routine-journal',
      title: r.name || '',
      status: status,
      category: 'routine',
      timeStart: '',
      timeEnd: '',
      scope: '',
      sub: ''
    });
  });

  // F・BOXアイテム
  (appRef.firstBoxItems || []).forEach(f => {
    allItems.push({
      id: f.id,
      source: 'fbox',
      title: f.text || '',
      status: 'open',
      category: 'fbox',
      timeStart: '',
      timeEnd: '',
      scope: '',
      sub: ''
    });
  });

  // ステータス別にグループ化
  const statusOrder = ['open', 'in_progress', 'done'];
  return statusOrder.map(st => {
    const items = allItems.filter(item => item.status === st);
    return {
      id: st,
      icon: NV_STATUS[st].icon,
      label: NV_STATUS[st].label,
      color: NV_STATUS[st].color,
      count: items.length,
      items: items
    };
  });
}

/**
 * 整理用ビュー：GTDカテゴリ別グループ
 */
function buildOrganizeGroups(appRef) {
  const groups = [];

  // F・BOX
  const fboxItems = (appRef.firstBoxItems || []).map(f => ({
    id: f.id,
    source: 'fbox',
    title: f.text || '',
    status: 'open',
    category: 'fbox',
    timeStart: '',
    timeEnd: '',
    scope: '',
    sub: ''
  }));
  groups.push({
    id: 'fbox',
    icon: '●',
    label: NV_CATEGORIES.fbox.label,
    color: NV_CATEGORIES.fbox.color,
    count: fboxItems.length,
    items: fboxItems
  });

  // タスクをGTD種別順に
  const typeOrder = ['urgent', 'action', 'calendar', 'project', 'waiting', 'wish'];
  typeOrder.forEach(type => {
    const tasks = (appRef.taskItems || []).filter(t => t.type === type);
    const items = tasks.map(t => ({
      id: t.id,
      source: 'task',
      title: t.title || '',
      status: t.status || 'open',
      category: type,
      timeStart: t.timeStart || '',
      timeEnd: t.timeEnd || '',
      scope: t.scope || '',
      sub: buildTaskSub(t)
    }));
    groups.push({
      id: type,
      icon: '●',
      label: NV_CATEGORIES[type].label,
      color: NV_CATEGORIES[type].color,
      count: items.length,
      items: items
    });
  });

  return groups;
}

function buildTaskSub(task) {
  if (task.type === 'waiting' && task.who) {
    let s = task.who;
    if (task.deadline) {
      const d = new Date(task.deadline);
      if (!isNaN(d.getTime())) {
        s += ' ' + (d.getMonth() + 1) + '/' + d.getDate() + 'まで';
      }
    }
    return s;
  }
  if (task.type === 'calendar' && task.dateTime) {
    const d = new Date(task.dateTime);
    if (isNaN(d.getTime())) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  if (task.type === 'project' && task.completionCriteria) {
    return task.completionCriteria;
  }
  return '';
}

/* ========================================
   ルーティンノートビュー
   ======================================== */

/**
 * ルーティンノートビューページ（2カラム同時表示）
 */
function renderRoutineNoteViewPage(appRef) {
  const todayGroups = buildRoutineTodayGroups(appRef);
  const manageGroups = buildRoutineManageGroups(appRef);

  return `
    ${renderHeader('ルーティンビュー', { showBack: true })}
    <div class="content">
      <div class="nv-page">
        <div class="nv-column">
          <div class="nv-column-title">今日のルーティン</div>
          ${todayGroups.map(group => renderNvGroup(group, 'routine-today', appRef)).join('')}
        </div>
        <div class="nv-divider"></div>
        <div class="nv-column">
          <div class="nv-column-title">ルーティン管理</div>
          ${manageGroups.map(group => renderNvGroup(group, 'routine-manage', appRef)).join('')}
        </div>
      </div>
    </div>
    ${renderNavBar('gtd')}
  `;
}

/**
 * ルーティン今日ビュー：ステータス別（義務・維持のみ）
 */
function buildRoutineTodayGroups(appRef) {
  const allItems = [];
  const journalRoutines = appRef.data.todayJournal?.routines || [];

  journalRoutines.forEach((r, i) => {
    if (r.category !== 'obligation' && r.category !== 'maintenance') return;

    let status = 'open';
    if (r.status === 'done' || r.done) status = 'done';
    else if (r.status === 'partial') status = 'in_progress';

    allItems.push({
      id: i,
      source: 'routine-journal',
      title: r.name || '',
      status: status,
      category: r.category || 'obligation',
      timeStart: '',
      timeEnd: '',
      scope: '',
      sub: r.condition ? r.condition : ''
    });
  });

  const statusOrder = ['open', 'in_progress', 'done'];
  return statusOrder.map(st => {
    const items = allItems.filter(item => item.status === st);
    return {
      id: st,
      icon: NV_STATUS[st].icon,
      label: NV_STATUS[st].label,
      color: NV_STATUS[st].color,
      count: items.length,
      items: items
    };
  });
}

/**
 * ルーティン管理ビュー：カテゴリ別
 */
function buildRoutineManageGroups(appRef) {
  const categoryOrder = ['obligation', 'maintenance', 'goal', 'principle', 'candidate'];

  return categoryOrder.map(cat => {
    const routines = (appRef.routineItems || []).filter(r => r.type === cat);
    const items = routines.map(r => ({
      id: r.id,
      source: 'routine',
      title: r.title || '',
      status: r.status || 'open',
      category: cat,
      timeStart: '',
      timeEnd: '',
      scope: r.scope || '',
      sub: r.notes ? r.notes.substring(0, 40) : ''
    }));
    const catDef = NV_ROUTINE_CATEGORIES[cat];
    return {
      id: cat,
      icon: '●',
      label: catDef.label,
      color: catDef.color,
      count: items.length,
      items: items
    };
  });
}

/* ========================================
   共通描画
   ======================================== */

/**
 * グループ1つを描画
 */
function renderNvGroup(group, view, appRef) {
  const key = view + '-' + group.id;
  const collapsed = appRef.noteViewCollapsed && appRef.noteViewCollapsed[key];

  let itemsHTML = '';
  if (!collapsed) {
    if (group.items.length === 0) {
      itemsHTML = '<div class="nv-empty-row">なし</div>';
    } else {
      itemsHTML = group.items.map(item => renderNvRow(item, view)).join('');
    }
    if (view === 'organize') {
      itemsHTML += `
        <div class="nv-add-row" onclick="app.noteViewAddItem('${escapeHtml(group.id)}')">
          ＋ 新規
        </div>
      `;
    }
    if (view === 'routine-manage') {
      itemsHTML += `
        <div class="nv-add-row" onclick="app.routineNoteViewAddItem('${escapeHtml(group.id)}')">
          ＋ 新規
        </div>
      `;
    }
  }

  // ヘルプキー判定
  let helpKey = '';
  if (view === 'today') helpKey = 'nv-' + group.id;
  else if (view === 'organize') helpKey = group.id === 'fbox' ? 'tab-fbox' : 'task-' + group.id;
  else if (view === 'routine-manage') helpKey = 'routine-' + group.id;
  else if (view === 'routine-today') helpKey = 'nv-' + group.id;

  return `
    <div class="nv-group">
      <div class="nv-group-header" onclick="app.toggleNoteViewSection('${escapeHtml(key)}')">
        <span class="nv-group-toggle">${collapsed ? '▸' : '▾'}</span>
        <span class="nv-group-icon" style="color:${escapeHtml(group.color)}">${escapeHtml(group.icon)}</span>
        <span class="nv-group-label">${escapeHtml(group.label)}${fieldHelpIcon(helpKey)}</span>
        <span class="nv-group-count">${group.count}</span>
      </div>
      ${!collapsed ? `<div class="nv-group-body">${itemsHTML}</div>` : ''}
    </div>
  `;
}

/**
 * アイテム1行を描画
 */
function renderNvRow(item, view) {
  const safeId = parseInt(item.id, 10);
  if (isNaN(safeId)) return '';

  const clickAction = getNvRowAction(item);
  const statusClass = 'nv-status-' + item.status;

  // チェックボックス
  let checkAction = '';
  if (item.source === 'task') {
    checkAction = `app.toggleTaskStatus(${safeId})`;
  } else if (item.source === 'routine-journal') {
    checkAction = `app.toggleRoutine(${safeId})`;
  } else if (item.source === 'fbox') {
    checkAction = `app.startFirstBoxSort(${safeId})`;
  } else if (item.source === 'routine') {
    checkAction = 'void(0)';
  }

  const isFbox = item.source === 'fbox';
  const checkIcon = isFbox ? '→'
    : item.status === 'done' ? '✓'
    : item.status === 'in_progress' ? '●'
    : '';

  // 実施時間
  let timeHTML = '';
  if (item.timeStart) {
    const timeText = item.timeEnd ? item.timeStart + ' - ' + item.timeEnd : item.timeStart;
    timeHTML = `<span class="nv-time">${escapeHtml(timeText)}</span>`;
  }

  // スコープバッジ
  let scopeHTML = '';
  if (item.scope && NV_SCOPE[item.scope]) {
    const s = NV_SCOPE[item.scope];
    scopeHTML = `<span class="nv-scope" style="color:${escapeHtml(s.color)}">${escapeHtml(s.label)}</span>`;
  }

  // GTD種別バッジ（今日カラムのみ。整理用はグループ名と重複するため非表示）
  let badgeHTML = '';
  if (view === 'today') {
    const cat = NV_CATEGORIES[item.category];
    if (cat) {
      badgeHTML = `<span class="nv-badge" style="color:${escapeHtml(cat.color)}">● ${escapeHtml(cat.label)}</span>`;
    }
  }
  // ルーティン今日カラム：カテゴリバッジ
  if (view === 'routine-today') {
    const cat = NV_ROUTINE_CATEGORIES[item.category];
    if (cat) {
      badgeHTML = `<span class="nv-badge" style="color:${escapeHtml(cat.color)}">● ${escapeHtml(cat.label)}</span>`;
    }
  }

  return `
    <div class="nv-row ${statusClass}" onclick="${clickAction}">
      <div class="nv-check ${statusClass}${isFbox ? ' nv-check-fbox' : ''}" onclick="event.stopPropagation(); ${checkAction}">
        ${checkIcon}
      </div>
      ${timeHTML}
      <div class="nv-row-content">
        <span class="nv-row-title">${escapeHtml(item.title)}</span>
        ${item.sub ? `<span class="nv-row-sub">${escapeHtml(item.sub)}</span>` : ''}
      </div>
      ${scopeHTML}
      ${badgeHTML}
    </div>
  `;
}

function getNvRowAction(item) {
  const id = parseInt(item.id, 10);
  switch (item.source) {
    case 'task':
      return isNaN(id) ? 'void(0)' : `app.showEditTaskModal(${id})`;
    case 'routine-journal':
      return 'void(0)';
    case 'routine':
      return isNaN(id) ? 'void(0)' : `app.showEditRoutineModal(${id})`;
    case 'fbox':
      return isNaN(id) ? 'void(0)' : `app.startFirstBoxSort(${id})`;
    default:
      return 'void(0)';
  }
}
