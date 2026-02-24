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
 * GTDノートビューページ（2カラム同時表示）
 */
function renderNoteViewPage(appRef) {
  const todayGroups = buildTodayGroups(appRef);
  const organizeGroups = buildOrganizeGroups(appRef);

  return `
    ${renderHeader('ノートビュー', { showBack: true })}
    <div class="content">
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
    </div>
    ${renderNavBar('gtd')}
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
  else if (view === 'routine-today' || view === 'routine-manage') helpKey = 'routine-' + group.id;

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
