/* ========================================
   MM - ノートビュー（Notion風一覧表示）
   既存UIに一切影響を与えない独立モジュール
   ======================================== */

/**
 * ノートビューページ全体を返す
 * @param {Object} appRef - appオブジェクトへの参照
 * @returns {string} HTML文字列
 */
function renderNoteViewPage(appRef) {
  const sections = buildNoteViewSections(appRef);

  return `
    ${renderHeader('ノートビュー', {
      showBack: true,
      rightIcon: 'list',
      rightAction: 'app.navigate("gtd")'
    })}
    <div class="content">
      <div class="nv-container">
        ${sections.map((section, i) => renderNoteViewSection(section, i)).join('')}
      </div>
    </div>
    ${renderNavBar('gtd')}
  `;
}

/**
 * 全データをセクション別に整理
 */
function buildNoteViewSections(appRef) {
  const tasks = appRef.taskItems || [];
  const routines = appRef.routineItems || [];
  const fboxItems = appRef.firstBoxItems || [];
  const materials = appRef.materialItems || [];

  const sections = [];

  // F・BOX
  sections.push({
    id: 'fbox',
    label: 'F・BOX',
    icon: 'inbox',
    color: fboxItems.length > 0 ? '#e74c3c' : '#27ae60',
    items: fboxItems.map(item => ({
      id: item.id,
      source: 'fbox',
      title: item.text || '',
      status: 'open',
      createdAt: item.createdAt
    })),
    emptyText: fboxItems.length === 0 ? 'クリア！' : null
  });

  // タスク系
  const taskTypes = [
    { type: 'calendar', label: 'カレンダー', icon: 'calendar' },
    { type: 'action', label: 'アクション', icon: 'check' },
    { type: 'waiting', label: '待機', icon: 'clock' },
    { type: 'project', label: 'プロジェクト', icon: 'list' },
    { type: 'wish', label: 'ウィッシュ', icon: 'star' }
  ];

  taskTypes.forEach(tt => {
    const filtered = tasks.filter(t => t.type === tt.type);
    const openItems = filtered.filter(t => (t.status || 'open') !== 'done');
    const doneItems = filtered.filter(t => (t.status || 'open') === 'done');

    sections.push({
      id: 'task-' + tt.type,
      label: tt.label,
      icon: tt.icon,
      group: 'タスク',
      color: '#3498db',
      items: openItems.map(t => taskToNoteItem(t)),
      doneItems: doneItems.map(t => taskToNoteItem(t)),
      emptyText: null
    });
  });

  // ルーティン系
  const routineTypes = [
    { type: 'goal', label: '目標' },
    { type: 'obligation', label: '義務' },
    { type: 'maintenance', label: '維持' },
    { type: 'principle', label: '指針' },
    { type: 'candidate', label: '候補' }
  ];

  routineTypes.forEach(rt => {
    const filtered = routines.filter(r => r.type === rt.type);
    sections.push({
      id: 'routine-' + rt.type,
      label: rt.label,
      icon: 'refresh',
      group: 'ルーティン',
      color: '#9b59b6',
      items: filtered.map(r => routineToNoteItem(r)),
      doneItems: [],
      emptyText: null
    });
  });

  // 資料
  sections.push({
    id: 'material',
    label: '資料',
    icon: 'file',
    group: '参照',
    color: '#7f8c8d',
    items: materials.map(m => ({
      id: m.id,
      source: 'material',
      title: m.title || '無題',
      status: 'open',
      sub: m.fileName || ''
    })),
    doneItems: [],
    emptyText: null
  });

  return sections;
}

function taskToNoteItem(task) {
  let sub = '';
  if (task.type === 'waiting' && task.who) {
    sub = task.who;
    if (task.deadline) {
      const d = new Date(task.deadline);
      sub += ' ' + (d.getMonth() + 1) + '/' + d.getDate() + 'まで';
    }
  } else if (task.type === 'calendar' && task.dateTime) {
    const d = new Date(task.dateTime);
    sub = (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  } else if (task.type === 'project' && task.completionCriteria) {
    sub = task.completionCriteria;
  }
  return {
    id: task.id,
    source: 'task',
    title: task.title || '',
    status: task.status || 'open',
    sub: sub,
    notes: task.notes || ''
  };
}

function routineToNoteItem(routine) {
  let sub = '';
  if ((routine.type === 'obligation' || routine.type === 'maintenance') && routine.nextDate) {
    const d = new Date(routine.nextDate);
    sub = '次回: ' + (d.getMonth() + 1) + '/' + d.getDate();
  }
  return {
    id: routine.id,
    source: 'routine',
    title: routine.title || '',
    status: 'open',
    sub: sub,
    notes: routine.notes || ''
  };
}

/**
 * セクション1つを描画
 */
function renderNoteViewSection(section, index) {
  const totalCount = section.items.length + (section.doneItems ? section.doneItems.length : 0);
  const openCount = section.items.length;
  const doneCount = section.doneItems ? section.doneItems.length : 0;

  // 空セクション（F・BOX以外でアイテム0件）はコンパクト表示
  if (totalCount === 0 && section.id !== 'fbox') {
    return `
      <div class="nv-section nv-section-empty">
        <div class="nv-section-header" onclick="app.toggleNoteViewSection(${index})">
          <div class="nv-section-icon" style="color:${section.color}">${getIcon(section.icon)}</div>
          <span class="nv-section-label">${section.label}</span>
          <span class="nv-section-count">0</span>
        </div>
      </div>
    `;
  }

  // F・BOXで0件 = クリア表示
  if (section.id === 'fbox' && section.items.length === 0) {
    return `
      <div class="nv-section nv-section-clear">
        <div class="nv-section-header">
          <div class="nv-section-icon" style="color:${section.color}">${getIcon('check')}</div>
          <span class="nv-section-label">${section.label}</span>
          <span class="nv-section-badge nv-badge-clear">クリア！</span>
        </div>
      </div>
    `;
  }

  // 折りたたみ状態をチェック
  const collapsed = app.noteViewCollapsed && app.noteViewCollapsed[index];

  // アイテム一覧
  let itemsHTML = '';
  if (!collapsed) {
    itemsHTML = section.items.map(item => renderNoteViewItem(item, section)).join('');

    // 完了アイテム
    if (doneCount > 0) {
      const doneCollapsed = app.noteViewDoneCollapsed && app.noteViewDoneCollapsed[index];
      itemsHTML += `
        <div class="nv-done-header" onclick="app.toggleNoteViewDone(${index})">
          <span class="nv-done-toggle">${doneCollapsed ? getIcon('forward') : getIcon('chevronDown')}</span>
          <span>完了 (${doneCount})</span>
        </div>
      `;
      if (!doneCollapsed) {
        itemsHTML += section.doneItems.map(item => renderNoteViewItem(item, section)).join('');
      }
    }
  }

  return `
    <div class="nv-section">
      <div class="nv-section-header" onclick="app.toggleNoteViewSection(${index})">
        <span class="nv-section-toggle">${collapsed ? getIcon('forward') : getIcon('chevronDown')}</span>
        <div class="nv-section-icon" style="color:${section.color}">${getIcon(section.icon)}</div>
        <span class="nv-section-label">${section.label}</span>
        <span class="nv-section-count">${openCount}${doneCount > 0 ? ' / ' + doneCount + '済' : ''}</span>
      </div>
      ${itemsHTML ? `<div class="nv-section-body">${itemsHTML}</div>` : ''}
    </div>
  `;
}

/**
 * アイテム1行を描画
 */
function renderNoteViewItem(item, section) {
  const isDone = item.status === 'done';
  const clickAction = getNoteViewItemAction(item);

  let checkHTML = '';
  if (item.source === 'task') {
    checkHTML = `
      <div class="nv-item-check ${isDone ? 'checked' : ''}"
           onclick="event.stopPropagation(); app.toggleTaskStatus(${item.id})">
        ${isDone ? getIcon('check') : ''}
      </div>
    `;
  }

  return `
    <div class="nv-item ${isDone ? 'nv-item-done' : ''}" onclick="${clickAction}">
      ${checkHTML}
      <div class="nv-item-content">
        <div class="nv-item-title">${escapeHtml(item.title)}</div>
        ${item.sub ? `<div class="nv-item-sub">${escapeHtml(item.sub)}</div>` : ''}
      </div>
    </div>
  `;
}

function getNoteViewItemAction(item) {
  switch (item.source) {
    case 'task':
      return `app.showEditTaskModal(${item.id})`;
    case 'routine':
      return `app.showEditRoutineModal(${item.id})`;
    case 'fbox':
      return `app.startFirstBoxSort(${item.id})`;
    case 'material':
      return `app.openMaterial(${item.id})`;
    default:
      return '';
  }
}
