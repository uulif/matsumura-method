/* ========================================
   MM - ノートビュー（Notion風 2カラム並列）
   ワイドスクリーン用：今日 + 整理用 同時表示
   ======================================== */

// GTD種別の定義（色・ラベル）
const NV_CATEGORIES = {
  action:   { label: '次に取', color: '#3498db' },
  project:  { label: 'プロジェクト', color: '#e67e22' },
  waiting:  { label: '待ち', color: '#f39c12' },
  calendar: { label: 'カレンダー', color: '#2ecc71' },
  wish:     { label: 'ウィッシュ', color: '#95a5a6' },
  fbox:     { label: 'INBOX', color: '#e74c3c' },
  routine:  { label: 'ルーティン', color: '#9b59b6' }
};

// ステータス定義
const NV_STATUS = {
  open:        { label: '未着手', icon: '○', color: '#999' },
  in_progress: { label: '進行中', icon: '▶', color: '#3498db' },
  done:        { label: '完了',   icon: '✓', color: '#27ae60' }
};

/**
 * ノートビューページ（2カラム同時表示）
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
          ${todayGroups.map(group => renderNvGroup(group, 'today')).join('')}
        </div>
        <div class="nv-column">
          <div class="nv-column-title">整理用</div>
          ${organizeGroups.map(group => renderNvGroup(group, 'organize')).join('')}
        </div>
      </div>
    </div>
    ${renderNavBar('gtd')}
  `;
}

/**
 * 今日ビュー：ステータス別グループ（未着手/進行中/完了）
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
      sub: buildTaskSub(t)
    });
  });

  // 今日のルーティン（日誌から取得）
  const journalRoutines = appRef.data.todayJournal?.routines || [];
  journalRoutines.forEach((r, i) => {
    let status = 'open';
    if (r.status === 'done' || r.done) status = 'done';
    else if (r.status === 'partial') status = 'in_progress';

    allItems.push({
      id: i,
      source: 'routine-journal',
      title: r.name || '',
      status: status,
      category: 'routine',
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
  const typeOrder = ['action', 'calendar', 'project', 'waiting', 'wish'];
  typeOrder.forEach(type => {
    const tasks = (appRef.taskItems || []).filter(t => t.type === type);
    const items = tasks.map(t => ({
      id: t.id,
      source: 'task',
      title: t.title || '',
      status: t.status || 'open',
      category: type,
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

/**
 * グループ1つを描画
 */
function renderNvGroup(group, view) {
  const key = view + '-' + group.id;
  const collapsed = app.noteViewCollapsed && app.noteViewCollapsed[key];

  let itemsHTML = '';
  if (!collapsed) {
    if (group.items.length === 0) {
      itemsHTML = '<div class="nv-empty-row">なし</div>';
    } else {
      itemsHTML = group.items.map(item => renderNvRow(item, view)).join('');
    }
    itemsHTML += `
      <div class="nv-add-row" onclick="app.noteViewAddItem('${escapeHtml(group.id)}')">
        ＋ 新規
      </div>
    `;
  }

  return `
    <div class="nv-group">
      <div class="nv-group-header" onclick="app.toggleNoteViewSection('${escapeHtml(key)}')">
        <span class="nv-group-toggle">${collapsed ? '▶' : '▼'}</span>
        <span class="nv-group-icon" style="color:${escapeHtml(group.color)}">${escapeHtml(group.icon)}</span>
        <span class="nv-group-label">${escapeHtml(group.label)}</span>
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
  }

  const checkIcon = item.status === 'done' ? '✓'
    : item.status === 'in_progress' ? '—'
    : '';

  // GTD種別バッジ（今日カラムのみ。整理用はグループ名と重複するため非表示）
  let badgeHTML = '';
  if (view === 'today') {
    const cat = NV_CATEGORIES[item.category];
    if (cat) {
      badgeHTML = `<span class="nv-badge" style="color:${escapeHtml(cat.color)}">● ${escapeHtml(cat.label)}</span>`;
    }
  }

  return `
    <div class="nv-row ${statusClass}" onclick="${clickAction}">
      <div class="nv-check ${statusClass}" onclick="event.stopPropagation(); ${checkAction}">
        ${checkIcon}
      </div>
      <div class="nv-row-content">
        <span class="nv-row-title">${escapeHtml(item.title)}</span>
        ${item.sub ? `<span class="nv-row-sub">${escapeHtml(item.sub)}</span>` : ''}
      </div>
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
    case 'fbox':
      return isNaN(id) ? 'void(0)' : `app.startFirstBoxSort(${id})`;
    default:
      return 'void(0)';
  }
}
