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
   パターンB: サイドバー＋テーブル型ダッシュボード
   参考画像に忠実な実装
   ======================================== */

function renderNoteViewDashboard(appRef) {
  const view = appRef.dashboardView || 'dashboard';
  const allTasks = appRef.taskItems || [];
  const fboxItems = appRef.firstBoxItems || [];
  const activeTasks = allTasks.filter(t => (t.status || 'open') !== 'done');
  const doneTasks = allTasks.filter(t => (t.status || 'open') === 'done');
  const now = Date.now();
  const sevenDays = 7 * 86400000;
  const thirtyDays = 30 * 86400000;

  // 期限計算
  function getTaskDate(task) {
    if (task.type === 'calendar' && task.dateTime) return new Date(task.dateTime);
    if (task.type === 'waiting' && task.deadline) return new Date(task.deadline);
    return null;
  }

  function getDeadlineInfo(task) {
    const d = getTaskDate(task);
    if (!d || isNaN(d.getTime())) return { text: '', days: null, cls: '' };
    const diff = Math.ceil((d.getTime() - now) / 86400000);
    if (diff < 0) return { text: `超過${Math.abs(diff)}日`, days: diff, cls: 'nvb-dl-overdue' };
    if (diff === 0) return { text: '今日', days: 0, cls: 'nvb-dl-urgent' };
    if (diff <= 7) return { text: `あと${diff}日`, days: diff, cls: 'nvb-dl-urgent' };
    if (diff <= 30) return { text: `あと${diff}日`, days: diff, cls: 'nvb-dl-caution' };
    return { text: `あと${diff}日`, days: diff, cls: 'nvb-dl-ok' };
  }

  // カウント計算
  const urgentTasks = activeTasks.filter(t => {
    const d = getTaskDate(t);
    if (!d || isNaN(d.getTime())) return t.type === 'urgent';
    return (d.getTime() - now) < sevenDays;
  });
  const cautionTasks = activeTasks.filter(t => {
    const d = getTaskDate(t);
    if (!d || isNaN(d.getTime())) return false;
    const diff = d.getTime() - now;
    return diff >= sevenDays && diff < thirtyDays;
  });
  const overdueCount = activeTasks.filter(t => {
    const d = getTaskDate(t);
    return d && !isNaN(d.getTime()) && d.getTime() < now;
  }).length;
  const okTasks = activeTasks.filter(t => {
    if (t.type === 'urgent') return false;
    const d = getTaskDate(t);
    if (!d || isNaN(d.getTime())) return t.type !== 'urgent';
    return (d.getTime() - now) >= thirtyDays;
  });

  // サイドバー
  const typeItems = [
    { id: 'fbox', icon: '📥', label: 'F・BOX', count: fboxItems.length },
    { id: 'urgent', icon: '⚡', label: 'すぐやる', count: activeTasks.filter(t => t.type === 'urgent').length },
    { id: 'action', icon: '▶', label: 'アクションリスト', count: activeTasks.filter(t => t.type === 'action').length },
    { id: 'project', icon: '📁', label: 'プロジェクト', count: activeTasks.filter(t => t.type === 'project').length },
    { id: 'waiting', icon: '⏳', label: '待機リスト', count: activeTasks.filter(t => t.type === 'waiting').length },
    { id: 'calendar', icon: '📅', label: 'カレンダー', count: activeTasks.filter(t => t.type === 'calendar').length },
    { id: 'wish', icon: '⭐', label: 'いつかやりたい', count: activeTasks.filter(t => t.type === 'wish').length },
  ];

  const sidebarHTML = `
    <div class="nvb-sidebar">
      <div class="nvb-sidebar-section">メニュー</div>
      <div class="nvb-sidebar-item${view === 'dashboard' ? ' active' : ''}" onclick="app.setDashboardView('dashboard')">
        <span class="nvb-sidebar-icon">📊</span>
        <span class="nvb-sidebar-label">ダッシュボード</span>
        ${overdueCount > 0 ? `<span class="nvb-sidebar-badge">${overdueCount}</span>` : ''}
      </div>
      <div class="nvb-sidebar-item${view === 'all' ? ' active' : ''}" onclick="app.setDashboardView('all')">
        <span class="nvb-sidebar-icon">📋</span>
        <span class="nvb-sidebar-label">全タスク一覧</span>
      </div>
      <div class="nvb-sidebar-item${view === 'done' ? ' active' : ''}" onclick="app.setDashboardView('done')">
        <span class="nvb-sidebar-icon">✅</span>
        <span class="nvb-sidebar-label">完了済み</span>
      </div>
      <div class="nvb-sidebar-section">種別で絞り込み</div>
      ${typeItems.map(ti => `
        <div class="nvb-sidebar-item${view === 'type-' + ti.id ? ' active' : ''}" onclick="app.setDashboardView('type-${ti.id}')">
          <span class="nvb-sidebar-icon">${ti.icon}</span>
          <span class="nvb-sidebar-label">${ti.label}</span>
          ${ti.count > 0 ? `<span class="nvb-sidebar-count">${ti.count}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  // メインコンテンツ
  let mainHTML = '';
  if (view === 'dashboard') {
    mainHTML = renderDashboardMain(appRef, activeTasks, fboxItems, urgentTasks, cautionTasks, okTasks, overdueCount, now);
  } else if (view === 'all') {
    mainHTML = renderTaskTable('全タスク一覧', activeTasks.concat(fboxItems.map(f => ({ id: f.id, _source: 'fbox', title: f.text, type: 'fbox', status: 'open' }))));
  } else if (view === 'done') {
    mainHTML = renderTaskTable('完了済み', doneTasks);
  } else if (view.startsWith('type-')) {
    const typeId = view.replace('type-', '');
    const label = NV_CATEGORIES[typeId]?.label || typeId;
    if (typeId === 'fbox') {
      mainHTML = renderTaskTable(label, fboxItems.map(f => ({ id: f.id, _source: 'fbox', title: f.text, type: 'fbox', status: 'open' })));
    } else {
      mainHTML = renderTaskTable(label, allTasks.filter(t => t.type === typeId));
    }
  }

  return `
    <div class="nvb-layout">
      ${sidebarHTML}
      <div class="nvb-main">${mainHTML}</div>
    </div>
  `;
}

// ダッシュボードメイン（サマリーカード + テーブル）
function renderDashboardMain(appRef, activeTasks, fboxItems, urgentTasks, cautionTasks, okTasks, overdueCount, now) {
  const sevenDays = 7 * 86400000;
  const thirtyDays = 30 * 86400000;

  function getTaskDate(task) {
    if (task.type === 'calendar' && task.dateTime) return new Date(task.dateTime);
    if (task.type === 'waiting' && task.deadline) return new Date(task.deadline);
    return null;
  }

  // アラート
  let alertHTML = '';
  if (overdueCount > 0) {
    const soonCount = urgentTasks.length - overdueCount;
    alertHTML = `<div class="nvb-alert">⚠ 期限超過 ${overdueCount}件${soonCount > 0 ? `、7日以内の締め切りが ${soonCount}件` : ''}あります。ご確認ください。</div>`;
  }

  // サマリーカード
  const cardsHTML = `
    <div class="nvb-cards">
      <div class="nvb-card nvb-card-urgent" onclick="app.setDashboardView('dashboard')">
        <div class="nvb-card-icon">🔥</div>
        <div class="nvb-card-label">緊急（7日以内）</div>
        <div class="nvb-card-count">${urgentTasks.length}</div>
        <div class="nvb-card-unit">件</div>
      </div>
      <div class="nvb-card nvb-card-caution">
        <div class="nvb-card-icon">⏰</div>
        <div class="nvb-card-label">注意（30日以内）</div>
        <div class="nvb-card-count">${cautionTasks.length}</div>
        <div class="nvb-card-unit">件</div>
      </div>
      <div class="nvb-card nvb-card-ok">
        <div class="nvb-card-icon">🌿</div>
        <div class="nvb-card-label">余裕あり</div>
        <div class="nvb-card-count">${okTasks.length}</div>
        <div class="nvb-card-unit">件</div>
      </div>
      <div class="nvb-card nvb-card-total">
        <div class="nvb-card-icon">📋</div>
        <div class="nvb-card-label">未完了合計</div>
        <div class="nvb-card-count">${activeTasks.length + fboxItems.length}</div>
        <div class="nvb-card-unit">件</div>
      </div>
    </div>
  `;

  // 緊急タスクテーブル（7日以内）
  const urgentRows = urgentTasks.sort((a, b) => {
    const da = getTaskDate(a), db = getTaskDate(b);
    const ta = da ? da.getTime() : Infinity, tb = db ? db.getTime() : Infinity;
    return ta - tb;
  });

  let urgentTableHTML = '';
  if (urgentRows.length > 0) {
    urgentTableHTML = `
      <div class="nvb-table-section">
        <div class="nvb-table-title">■ 緊急タスク（7日以内）</div>
        ${renderNvbTable(urgentRows, now)}
      </div>
    `;
  }

  // 30日以内テーブル
  let cautionTableHTML = '';
  if (cautionTasks.length > 0) {
    cautionTableHTML = `
      <div class="nvb-table-section">
        <div class="nvb-table-title">■ 今後30日以内のタスク</div>
        ${renderNvbTable(cautionTasks, now)}
      </div>
    `;
  }

  return `${alertHTML}${cardsHTML}${urgentTableHTML}${cautionTableHTML}`;
}

// テーブル描画（共通）
function renderNvbTable(tasks, now) {
  if (!now) now = Date.now();

  function getTaskDate(task) {
    if (task.type === 'calendar' && task.dateTime) return new Date(task.dateTime);
    if (task.type === 'waiting' && task.deadline) return new Date(task.deadline);
    return null;
  }

  function getDeadlineInfo(task) {
    const d = getTaskDate(task);
    if (!d || isNaN(d.getTime())) return { text: '—', dateStr: '—', cls: '' };
    const diff = Math.ceil((d.getTime() - now) / 86400000);
    const dateStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
    if (diff < 0) return { text: `超過${Math.abs(diff)}日`, dateStr, cls: 'nvb-dl-overdue' };
    if (diff === 0) return { text: '今日', dateStr, cls: 'nvb-dl-urgent' };
    if (diff <= 7) return { text: `あと${diff}日`, dateStr, cls: 'nvb-dl-urgent' };
    if (diff <= 30) return { text: `あと${diff}日`, dateStr, cls: 'nvb-dl-caution' };
    return { text: `あと${diff}日`, dateStr, cls: '' };
  }

  const rows = tasks.map(task => {
    const isFbox = task._source === 'fbox' || task.type === 'fbox';
    const cat = NV_CATEGORIES[task.type] || { label: task.type || '不明', color: '#999' };
    const dl = getDeadlineInfo(task);
    const st = NV_STATUS[task.status || 'open'] || NV_STATUS.open;
    const safeId = parseInt(task.id, 10);

    let completeAction = isFbox ? `app.startFirstBoxSort(${safeId})` : `app.toggleTaskStatus(${safeId})`;
    let editAction = isFbox ? `app.startFirstBoxSort(${safeId})` : `app.showEditTaskModal(${safeId})`;

    return `
      <tr>
        <td class="${dl.cls}">${dl.text}</td>
        <td><span class="nvb-type-badge" style="background:${cat.color}20; color:${cat.color}; border:1px solid ${cat.color}40">${cat.label}</span></td>
        <td class="nvb-td-title">${escapeHtml(task.title || '')}</td>
        <td><span class="nvb-status-dot" style="color:${st.color}">${st.icon}</span> ${st.label}</td>
        <td class="nvb-td-actions">
          <button class="nvb-btn-complete" onclick="${completeAction}">✓ 完了</button>
          <button class="nvb-btn-edit" onclick="${editAction}">編集</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="nvb-table-wrap">
      <table class="nvb-table">
        <thead>
          <tr>
            <th>期限まで</th>
            <th>種別</th>
            <th>内容</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// 汎用テーブルビュー（全タスク/完了済み/種別フィルタ）
function renderTaskTable(title, tasks) {
  const now = Date.now();
  if (tasks.length === 0) {
    return `<div class="nvb-table-section"><div class="nvb-table-title">■ ${escapeHtml(title)}</div><div class="nvb-empty">該当するタスクはありません</div></div>`;
  }
  return `
    <div class="nvb-table-section">
      <div class="nvb-table-title">■ ${escapeHtml(title)}（${tasks.length}件）</div>
      ${renderNvbTable(tasks, now)}
    </div>
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
