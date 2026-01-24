/* Staff Portal Messaging (client-side demo)
   Notes:
   - Works within the same browser (localStorage).
   - Cross-device / real-time “background” delivery requires a backend (Firebase/Supabase/WebSocket). */

(() => {
  const STORAGE = {
    currentUser: 'ooc_portal_current_user',
    directory: 'ooc_portal_directory_v1',
    messages: 'ooc_portal_messages_v1'
  };

  const DEFAULT_DIRECTORY = [
    { userId: 'ADMIN', displayName: 'Admin', role: 'admin', department: 'management', college: 'hope-foundation', email: 'admin@hope.org' },
    { userId: 'TCH-101', displayName: 'Demo Teacher', role: 'teacher', department: 'education', college: 'hope-foundation', email: 'teacher@hope.org' },
    { userId: 'EVT-201', displayName: 'Events Desk', role: 'events', department: 'events', college: 'hope-foundation', email: 'events@hope.org' },
    { userId: 'MGT-401', displayName: 'Management', role: 'management', department: 'management', college: 'hope-foundation', email: 'management@hope.org' },
    { userId: 'FND-301', displayName: 'Fundraising', role: 'fundraiser', department: 'fundraising', college: 'hope-foundation', email: 'fundraise@hope.org' }
  ];

  const ROLE_LABELS = {
    admin: 'Admin',
    staff: 'Staff',
    teacher: 'Teacher',
    events: 'Events',
    management: 'Management',
    fundraiser: 'Fundraiser'
  };

  const ROLE_DEFAULT_DEPT = {
    staff: 'operations',
    teacher: 'education',
    events: 'events',
    management: 'management',
    fundraiser: 'fundraising'
  };

  const DEPT_LABELS = {
    education: 'Education',
    events: 'Events',
    fundraising: 'Fundraising',
    management: 'Management',
    operations: 'Operations',
    it: 'IT',
    finance: 'Finance',
    hr: 'HR',
    outreach: 'Outreach'
  };

  const COLLEGE_LABELS = {
    'hope-foundation': 'Hope Foundation',
    'college-a': 'College A',
    'college-b': 'College B',
    other: 'Other'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function safeTrim(value) {
    return String(value ?? '').trim();
  }

  function normalizeId(value) {
    return safeTrim(value).replace(/\s+/g, '-').toUpperCase();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureDirectory() {
    const existing = loadJson(STORAGE.directory, null);
    if (Array.isArray(existing) && existing.length) return existing;
    saveJson(STORAGE.directory, DEFAULT_DIRECTORY);
    return DEFAULT_DIRECTORY;
  }

  function ensureMessages() {
    const existing = loadJson(STORAGE.messages, null);
    if (Array.isArray(existing)) return existing;
    saveJson(STORAGE.messages, []);
    return [];
  }

  function getCurrentUser() {
    return loadJson(STORAGE.currentUser, null);
  }

  function setCurrentUser(user) {
    saveJson(STORAGE.currentUser, user);
  }

  function clearCurrentUser() {
    localStorage.removeItem(STORAGE.currentUser);
  }

  function upsertDirectoryUser(user) {
    const directory = ensureDirectory();
    const idx = directory.findIndex(u => u.userId === user.userId);
    if (idx >= 0) directory[idx] = { ...directory[idx], ...user };
    else directory.push(user);
    saveJson(STORAGE.directory, directory);
    return directory;
  }

  function labelCollege(value) {
    if (!value) return 'Unknown';
    if (value.startsWith('other:')) return value.slice('other:'.length);
    return COLLEGE_LABELS[value] ?? value;
  }

  function userSummary(user) {
    const role = ROLE_LABELS[user.role] ?? user.role;
    const dept = DEPT_LABELS[user.department] ?? user.department;
    const college = labelCollege(user.college);
    return `${user.displayName} (${role} • ${dept} • ${college})`;
  }

  function showLoggedInLayout(isLoggedIn) {
    const loginCard = document.getElementById('loginCard');
    const roleHomeCard = document.getElementById('roleHomeCard');
    const messageCard = document.getElementById('messageCard');
    if (!loginCard || !roleHomeCard) return;
    loginCard.hidden = isLoggedIn;
    roleHomeCard.hidden = !isLoggedIn;

    if (messageCard) {
      messageCard.hidden = !isLoggedIn;
    }

    document.body.classList.toggle('is-logged-out', !isLoggedIn);
  }

  function storageKeyForUser(user, suffix) {
    return `ooc_portal_${suffix}_${user.userId}`;
  }

  function loadUserData(user, suffix, fallback) {
    return loadJson(storageKeyForUser(user, suffix), fallback);
  }

  function saveUserData(user, suffix, value) {
    saveJson(storageKeyForUser(user, suffix), value);
  }

  function renderRoleHome(user) {
    const titleEl = document.getElementById('homeTitle');
    const subtitleEl = document.getElementById('homeSubtitle');
    const bodyEl = document.getElementById('roleHomeBody');
    if (!titleEl || !subtitleEl || !bodyEl) return;

    const roleLabel = ROLE_LABELS[user.role] ?? user.role;
    titleEl.textContent = `${roleLabel} Home`;
    subtitleEl.textContent = 'Your role dashboard (messages are on the right).';

    const commonHeader = `
      <div class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">Logged in as</div>
          <div class="kpi-value">${escapeHtml(user.displayName)}</div>
          <div class="kpi-sub">${escapeHtml(user.userId)}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Role</div>
          <div class="kpi-value">${escapeHtml(roleLabel)}</div>
          <div class="kpi-sub">Department: ${escapeHtml(DEPT_LABELS[user.department] ?? user.department)}</div>
        </div>
      </div>
      <div class="hr"></div>
    `;

    if (user.role === 'teacher') {
      const timetable = loadUserData(user, 'teacher_timetable_v1', [
        { day: 'Mon', slot: '09:00 - 10:00', subject: 'Math', className: 'Class 8A' },
        { day: 'Tue', slot: '11:00 - 12:00', subject: 'Science', className: 'Class 9B' }
      ]);
      const grades = loadUserData(user, 'teacher_grades_v1', [
        { student: 'Aarav', subject: 'Math', score: '88' },
        { student: 'Sara', subject: 'Science', score: '92' }
      ]);

      bodyEl.innerHTML = `
        ${commonHeader}

        <div class="section-title">Timetable</div>
        <div class="table-wrap">
          <table class="simple-table">
            <thead>
              <tr><th>Day</th><th>Time</th><th>Subject</th><th>Class</th></tr>
            </thead>
            <tbody>
              ${timetable.map(r => `<tr><td>${escapeHtml(r.day)}</td><td>${escapeHtml(r.slot)}</td><td>${escapeHtml(r.subject)}</td><td>${escapeHtml(r.className)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="split-actions">
          <button class="btn btn-ghost" type="button" id="addTimetableBtn"><i class="fas fa-plus"></i> Add slot</button>
          <button class="btn btn-ghost" type="button" id="clearTimetableBtn"><i class="fas fa-trash"></i> Clear</button>
        </div>

        <div class="hr"></div>

        <div class="section-title">Student performance (demo)</div>
        <div class="table-wrap">
          <table class="simple-table">
            <thead>
              <tr><th>Student</th><th>Subject</th><th>Score</th></tr>
            </thead>
            <tbody>
              ${grades.map(g => `<tr><td>${escapeHtml(g.student)}</td><td>${escapeHtml(g.subject)}</td><td>${escapeHtml(g.score)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="split-actions">
          <button class="btn btn-ghost" type="button" id="addGradeBtn"><i class="fas fa-plus"></i> Add grade</button>
          <button class="btn btn-ghost" type="button" id="clearGradesBtn"><i class="fas fa-trash"></i> Clear</button>
        </div>
      `;

      document.getElementById('addTimetableBtn').addEventListener('click', () => {
        const day = prompt('Day (Mon/Tue/...):', 'Mon');
        if (!day) return;
        const slot = prompt('Time slot:', '09:00 - 10:00');
        if (!slot) return;
        const subject = prompt('Subject:', 'Math');
        if (!subject) return;
        const className = prompt('Class:', 'Class 8A');
        if (!className) return;

        timetable.push({ day, slot, subject, className });
        saveUserData(user, 'teacher_timetable_v1', timetable);
        renderRoleHome(user);
      });

      document.getElementById('clearTimetableBtn').addEventListener('click', () => {
        if (!confirm('Clear timetable?')) return;
        saveUserData(user, 'teacher_timetable_v1', []);
        renderRoleHome(user);
      });

      document.getElementById('addGradeBtn').addEventListener('click', () => {
        const student = prompt('Student name:', 'Aarav');
        if (!student) return;
        const subject = prompt('Subject:', 'Math');
        if (!subject) return;
        const score = prompt('Score:', '90');
        if (!score) return;

        grades.push({ student, subject, score });
        saveUserData(user, 'teacher_grades_v1', grades);
        renderRoleHome(user);
      });

      document.getElementById('clearGradesBtn').addEventListener('click', () => {
        if (!confirm('Clear grade list?')) return;
        saveUserData(user, 'teacher_grades_v1', []);
        renderRoleHome(user);
      });

      return;
    }

    if (user.role === 'fundraiser') {
      bodyEl.innerHTML = `
        ${commonHeader}
        <div class="section-title">Fundraising operations</div>
        <div class="muted-inline">Campaign tracking, donor updates, and coordination with management.</div>
        <div class="hr"></div>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-label">Active campaigns</div><div class="kpi-value">3</div><div class="kpi-sub">(demo)</div></div>
          <div class="kpi"><div class="kpi-label">Leads to follow up</div><div class="kpi-value">12</div><div class="kpi-sub">(demo)</div></div>
        </div>
        <div class="hr"></div>
        <div class="section-title">Quick actions</div>
        <div class="split-actions">
          <button class="btn btn-ghost" type="button" id="frPingAdmin"><i class="fas fa-bullhorn"></i> Message Admin</button>
          <button class="btn btn-ghost" type="button" id="frPingEvents"><i class="fas fa-calendar"></i> Message Events</button>
        </div>
      `;

      document.getElementById('frPingAdmin').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'Fundraising update' });
      });
      document.getElementById('frPingEvents').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'Coordination needed for event' });
      });
      return;
    }

    if (user.role === 'management') {
      bodyEl.innerHTML = `
        ${commonHeader}
        <div class="section-title">Management dashboard</div>
        <div class="muted-inline">Approvals, reporting, and cross-department communication.</div>
        <div class="hr"></div>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-label">Pending approvals</div><div class="kpi-value">5</div><div class="kpi-sub">(demo)</div></div>
          <div class="kpi"><div class="kpi-label">Open issues</div><div class="kpi-value">2</div><div class="kpi-sub">(demo)</div></div>
        </div>
        <div class="hr"></div>
        <div class="section-title">Quick actions</div>
        <div class="split-actions">
          <button class="btn btn-ghost" type="button" id="mgmtBroadcastTeachers"><i class="fas fa-paper-plane"></i> Broadcast to Teachers</button>
          <button class="btn btn-ghost" type="button" id="mgmtBroadcastAll"><i class="fas fa-globe"></i> Broadcast to All</button>
        </div>
      `;

      document.getElementById('mgmtBroadcastTeachers').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'Notice for Teachers' });
      });
      document.getElementById('mgmtBroadcastAll').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'General notice' });
      });
      return;
    }

    if (user.role === 'events') {
      bodyEl.innerHTML = `
        ${commonHeader}
        <div class="section-title">Events operations</div>
        <div class="muted-inline">Event planning tasks, schedules, and coordination.</div>
        <div class="hr"></div>
        <div class="section-title">Upcoming (demo)</div>
        <ul class="simple-list">
          <li>Orientation drive • Feb 02</li>
          <li>Donation camp • Feb 10</li>
          <li>Workshop • Feb 18</li>
        </ul>
        <div class="hr"></div>
        <div class="section-title">Quick actions</div>
        <div class="split-actions">
          <button class="btn btn-ghost" type="button" id="evtAskTeachers"><i class="fas fa-chalkboard-teacher"></i> Message Teachers</button>
          <button class="btn btn-ghost" type="button" id="evtAskFundraisers"><i class="fas fa-hand-holding-heart"></i> Message Fundraisers</button>
        </div>
      `;

      document.getElementById('evtAskTeachers').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'Event support needed (Teachers)' });
      });
      document.getElementById('evtAskFundraisers').addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { subject: 'Event support needed (Fundraising)' });
      });
      return;
    }

    // staff (default)
    bodyEl.innerHTML = `
      ${commonHeader}
      <div class="section-title">Staff dashboard</div>
      <div class="muted-inline">Operations tasks, internal updates, and communication.</div>
      <div class="hr"></div>
      <div class="section-title">Quick actions</div>
      <div class="split-actions">
        <button class="btn btn-ghost" type="button" id="staffCompose"><i class="fas fa-paper-plane"></i> Send message</button>
      </div>
    `;
    document.getElementById('staffCompose').addEventListener('click', () => {
      setTabs('compose');
      renderCompose(user, { subject: 'Update' });
    });
  }

  function userTokens(user) {
    const tokens = new Set();
    tokens.add(`user:${user.userId}`);
    tokens.add(`role:${user.role}`);
    tokens.add(`dept:${user.department}`);
    tokens.add(`college:${user.college}`);
    tokens.add('all');
    if (user.role === 'admin' || user.userId === 'ADMIN') tokens.add('admin');
    return tokens;
  }

  function resolveRecipients({ selectedUserIds, selectedRoles, selectedDepts, selectedColleges, includeAdmin }) {
    const tokens = new Set();
    selectedUserIds.forEach(userId => tokens.add(`user:${userId}`));
    selectedRoles.forEach(role => tokens.add(`role:${role}`));
    selectedDepts.forEach(dept => tokens.add(`dept:${dept}`));
    selectedColleges.forEach(college => tokens.add(`college:${college}`));
    if (includeAdmin) tokens.add('admin');
    return [...tokens];
  }

  function sendMessage({ fromUser, recipientTokens, subject, body }) {
    const messages = ensureMessages();
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      createdAt: nowIso(),
      from: {
        userId: fromUser.userId,
        displayName: fromUser.displayName,
        role: fromUser.role,
        department: fromUser.department,
        college: fromUser.college
      },
      recipientTokens,
      subject: safeTrim(subject) || '(No subject)',
      body: safeTrim(body),
      readBy: []
    };
    messages.unshift(msg);
    saveJson(STORAGE.messages, messages);
    return msg;
  }

  function inboxForUser(user) {
    const tokens = userTokens(user);
    return ensureMessages().filter(m => m.from.userId !== user.userId && Array.isArray(m.recipientTokens) && m.recipientTokens.some(t => tokens.has(t)));
  }

  function sentForUser(user) {
    return ensureMessages().filter(m => m.from.userId === user.userId);
  }

  function isReadByUser(message, user) {
    return Array.isArray(message.readBy) && message.readBy.includes(user.userId);
  }

  function markRead(messageId, user) {
    const messages = ensureMessages();
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx < 0) return;
    const msg = messages[idx];
    msg.readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
    if (!msg.readBy.includes(user.userId)) msg.readBy.push(user.userId);
    messages[idx] = msg;
    saveJson(STORAGE.messages, messages);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.style.display = 'block';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      el.style.display = 'none';
    }, 2200);
  }

  function setTabs(tabId) {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    $('panel-inbox').hidden = tabId !== 'inbox';
    $('panel-compose').hidden = tabId !== 'compose';
    $('panel-sent').hidden = tabId !== 'sent';
    $('panel-directory').hidden = tabId !== 'directory';
  }

  function formatRecipients(tokens) {
    if (!Array.isArray(tokens) || !tokens.length) return '—';
    return tokens.map(t => {
      if (t === 'admin') return 'Admin';
      if (t === 'all') return 'Everyone';
      if (t.startsWith('user:')) return t.replace('user:', 'User ');
      if (t.startsWith('role:')) return `Role ${ROLE_LABELS[t.slice(5)] ?? t.slice(5)}`;
      if (t.startsWith('dept:')) return `Dept ${DEPT_LABELS[t.slice(5)] ?? t.slice(5)}`;
      if (t.startsWith('college:')) return `College ${labelCollege(t.slice(7))}`;
      return t;
    }).join(', ');
  }

  function updateUnreadBadge(user) {
    const badge = $('unreadBadge');
    if (!user) {
      badge.style.display = 'none';
      return;
    }
    const inbox = inboxForUser(user);
    const unread = inbox.filter(m => !isReadByUser(m, user)).length;
    if (unread > 0) {
      badge.textContent = String(unread);
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function openMessage(user, messageId, context) {
    const messages = ensureMessages();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    if (context === 'inbox') {
      markRead(messageId, user);
      updateUnreadBadge(user);
    }

    const html = `
      <div class="card-title" style="margin-bottom: 6px;">${escapeHtml(msg.subject)}</div>
      <div class="muted-inline" style="margin-bottom: 10px;">
        <div><strong>From:</strong> ${escapeHtml(userSummary(msg.from))}</div>
        <div><strong>Date:</strong> ${escapeHtml(formatDate(msg.createdAt))}</div>
        <div><strong>To:</strong> ${escapeHtml(formatRecipients(msg.recipientTokens))}</div>
      </div>
      <div class="hr"></div>
      <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(msg.body)}</div>
      <div class="split-actions" style="margin-top: 16px;">
        <button class="btn btn-ghost" type="button" id="backToListBtn"><i class="fas fa-arrow-left"></i> Back</button>
        ${context === 'inbox' ? '<button class="btn btn-primary" type="button" id="replyBtn"><i class="fas fa-reply"></i> Reply</button>' : ''}
      </div>
    `;

    const panel = context === 'sent' ? $('panel-sent') : $('panel-inbox');
    panel.innerHTML = html;

    $('backToListBtn').addEventListener('click', () => {
      if (context === 'sent') renderSent(user);
      else renderInbox(user);
    });

    const reply = $('replyBtn');
    if (reply) {
      reply.addEventListener('click', () => {
        setTabs('compose');
        renderCompose(user, { replyTo: msg.from.userId, subject: `Re: ${msg.subject}` });
      });
    }
  }

  function renderInbox(user) {
    const inbox = inboxForUser(user);
    updateUnreadBadge(user);

    if (!inbox.length) {
      $('panel-inbox').innerHTML = '<div class="muted-inline">No messages yet.</div>';
      return;
    }

    const items = inbox.map(m => {
      const read = isReadByUser(m, user);
      const preview = m.body.length > 90 ? m.body.slice(0, 90) + '…' : m.body;
      return `
        <div class="msg-item" data-msg-id="${escapeHtml(m.id)}" role="button" tabindex="0" aria-label="Open message">
          <div class="msg-top">
            <div class="msg-from">${escapeHtml(m.from.displayName)}${read ? '' : ' • NEW'}</div>
            <div class="msg-date">${escapeHtml(formatDate(m.createdAt))}</div>
          </div>
          <div class="msg-subject">${escapeHtml(m.subject)}</div>
          <div class="msg-preview">${escapeHtml(preview)}</div>
        </div>
      `;
    }).join('');

    $('panel-inbox').innerHTML = `<div class="list">${items}</div>`;

    document.querySelectorAll('#panel-inbox .msg-item').forEach(el => {
      const open = () => openMessage(user, el.getAttribute('data-msg-id'), 'inbox');
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') open();
      });
    });
  }

  function renderSent(user) {
    const sent = sentForUser(user);

    if (!sent.length) {
      $('panel-sent').innerHTML = '<div class="muted-inline">No sent messages yet.</div>';
      return;
    }

    const items = sent.map(m => {
      const preview = m.body.length > 90 ? m.body.slice(0, 90) + '…' : m.body;
      return `
        <div class="msg-item" data-msg-id="${escapeHtml(m.id)}" role="button" tabindex="0" aria-label="Open message">
          <div class="msg-top">
            <div class="msg-from">To: ${escapeHtml(formatRecipients(m.recipientTokens))}</div>
            <div class="msg-date">${escapeHtml(formatDate(m.createdAt))}</div>
          </div>
          <div class="msg-subject">${escapeHtml(m.subject)}</div>
          <div class="msg-preview">${escapeHtml(preview)}</div>
        </div>
      `;
    }).join('');

    $('panel-sent').innerHTML = `<div class="list">${items}</div>`;

    document.querySelectorAll('#panel-sent .msg-item').forEach(el => {
      const open = () => openMessage(user, el.getAttribute('data-msg-id'), 'sent');
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') open();
      });
    });
  }

  function renderDirectory() {
    const directory = ensureDirectory();
    const rows = directory
      .slice()
      .sort((a, b) => String(a.displayName).localeCompare(String(b.displayName)))
      .map(u => `
        <div class="msg-item" style="cursor: default;">
          <div class="msg-top">
            <div class="msg-from">${escapeHtml(u.displayName)}</div>
            <div class="msg-date">${escapeHtml(u.userId)}</div>
          </div>
          <div class="msg-preview">${escapeHtml((ROLE_LABELS[u.role] ?? u.role) + ' • ' + (DEPT_LABELS[u.department] ?? u.department) + ' • ' + labelCollege(u.college))}</div>
        </div>
      `).join('');

    $('panel-directory').innerHTML = `
      <div class="muted-inline">Directory (saved on this browser)</div>
      <div class="hr"></div>
      <div class="list">${rows || '<div class="muted-inline">No directory entries.</div>'}</div>
    `;
  }

  function renderCompose(user, presets = {}) {
    const directory = ensureDirectory();
    const options = directory
      .filter(u => u.userId !== user.userId)
      .map(u => `<option value="${escapeHtml(u.userId)}">${escapeHtml(u.displayName)} (${escapeHtml(u.userId)})</option>`)
      .join('');

    const roleChecks = ['teacher', 'events', 'management', 'fundraiser', 'staff']
      .map(r => `<label class="pill"><input type="checkbox" value="${r}" class="roleCheck"> ${ROLE_LABELS[r]}</label>`)
      .join('');

    const deptChecks = Object.keys(DEPT_LABELS)
      .map(d => `<label class="pill"><input type="checkbox" value="${d}" class="deptCheck"> ${DEPT_LABELS[d]}</label>`)
      .join('');

    const collegeChecks = ['hope-foundation', 'college-a', 'college-b']
      .map(c => `<label class="pill"><input type="checkbox" value="${c}" class="collegeCheck"> ${labelCollege(c)}</label>`)
      .join('');

    $('panel-compose').innerHTML = `
      <div class="card-title" style="margin-bottom: 6px;">Compose message</div>
      <div class="card-subtitle" style="margin: 0 0 10px;">Send to multiple people, roles, departments, colleges, or Admin.</div>

      <div class="hr"></div>

      <form id="composeForm">
        <label for="toUsers">To (specific users)</label>
        <select id="toUsers" multiple size="5">${options}</select>
        <div class="help">Hold Ctrl/Command to select multiple users.</div>

        <div class="hr"></div>

        <div class="field-row cols-2">
          <div>
            <label>Roles (broadcast)</label>
            <div class="pill-row">${roleChecks}</div>
          </div>
          <div>
            <label>Departments (broadcast)</label>
            <div class="pill-row">${deptChecks}</div>
          </div>
        </div>

        <div style="margin-top: 12px;">
          <label>Colleges / Branches (broadcast)</label>
          <div class="pill-row">
            ${collegeChecks}
            <label class="pill"><input type="checkbox" value="${escapeHtml(user.college)}" class="collegeCheck"> My college</label>
            <label class="pill"><input type="checkbox" value="other" class="collegeOtherCheck"> Other…</label>
          </div>
          <div style="margin-top: 10px;">
            <input id="collegeBroadcastOther" type="text" placeholder="If Other… enter college name (e.g. ABC College)" disabled>
          </div>
        </div>

        <div style="margin-top: 12px;">
          <label class="pill"><input type="checkbox" id="toAdmin"> Send to Admin</label>
        </div>

        <div class="hr"></div>

        <div style="margin-top: 10px;">
          <label for="subject">Subject</label>
          <input id="subject" type="text" value="${escapeHtml(presets.subject ?? '')}" placeholder="Subject" required>
        </div>

        <div style="margin-top: 12px;">
          <label for="body">Message</label>
          <textarea id="body" placeholder="Write your message…" required></textarea>
          <div class="help">Tip: use roles/departments for one-to-many messages.</div>
        </div>

        <div class="split-actions">
          <button class="btn btn-primary" type="submit"><i class="fas fa-paper-plane"></i> Send</button>
          <button class="btn btn-ghost" type="button" id="clearMessagesBtn"><i class="fas fa-trash"></i> Clear all messages (this browser)</button>
        </div>
      </form>
    `;

    const toUsers = $('toUsers');
    if (presets.replyTo) {
      [...toUsers.options].forEach(opt => {
        if (opt.value === presets.replyTo) opt.selected = true;
      });
    }

    const collegeOtherCheck = document.querySelector('.collegeOtherCheck');
    const collegeOtherInput = $('collegeBroadcastOther');
    collegeOtherCheck.addEventListener('change', () => {
      collegeOtherInput.disabled = !collegeOtherCheck.checked;
      if (!collegeOtherCheck.checked) collegeOtherInput.value = '';
    });

    $('composeForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const selectedUserIds = [...toUsers.selectedOptions].map(o => o.value);
      const selectedRoles = [...document.querySelectorAll('.roleCheck:checked')].map(i => i.value);
      const selectedDepts = [...document.querySelectorAll('.deptCheck:checked')].map(i => i.value);
      const selectedColleges = [...document.querySelectorAll('.collegeCheck:checked')].map(i => i.value);
      const includeAdmin = $('toAdmin').checked;

      if (collegeOtherCheck.checked) {
        const other = safeTrim(collegeOtherInput.value);
        if (other) selectedColleges.push(`other:${other}`);
      }

      const subject = $('subject').value;
      const body = $('body').value;

      const recipientTokens = resolveRecipients({
        selectedUserIds,
        selectedRoles,
        selectedDepts,
        selectedColleges,
        includeAdmin
      });

      if (!recipientTokens.length) {
        toast('Select at least one recipient');
        return;
      }

      if (!safeTrim(body)) {
        toast('Message body is empty');
        return;
      }

      sendMessage({ fromUser: user, recipientTokens, subject, body });
      toast('Message sent');
      renderSent(user);
      setTabs('sent');
      updateUnreadBadge(user);
    });

    $('clearMessagesBtn').addEventListener('click', () => {
      if (!confirm('Clear ALL messages stored in this browser?')) return;
      saveJson(STORAGE.messages, []);
      toast('Messages cleared');
      renderInbox(user);
      renderSent(user);
      updateUnreadBadge(user);
    });
  }

  function renderLoggedOutPanels() {
    $('topbarRight').innerHTML = 'Not logged in';
    $('panel-inbox').innerHTML = '<div class="muted-inline">Login to view your inbox.</div>';
    $('panel-compose').innerHTML = '<div class="muted-inline">Login to send messages.</div>';
    $('panel-sent').innerHTML = '<div class="muted-inline">Login to view sent messages.</div>';
    $('panel-directory').innerHTML = '<div class="muted-inline">Login to view directory.</div>';
    updateUnreadBadge(null);
    showLoggedInLayout(false);
  }

  function renderLoggedInPanels(user) {
    $('topbarRight').innerHTML = `
      <span class="muted-inline">${escapeHtml(userSummary(user))}</span>
      <button class="btn btn-ghost" type="button" id="logoutBtn" style="margin-left: 10px;"><i class="fas fa-right-from-bracket"></i> Logout</button>
    `;

    $('logoutBtn').addEventListener('click', () => {
      clearCurrentUser();
      toast('Logged out');
      renderLoggedOutPanels();
    });

    showLoggedInLayout(true);
    renderRoleHome(user);
    renderInbox(user);
    renderCompose(user);
    renderSent(user);
    renderDirectory(user);
  }

  function setupEvents() {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        setTabs(btn.dataset.tab);
        const user = getCurrentUser();
        if (!user) return;

        if (btn.dataset.tab === 'inbox') renderInbox(user);
        if (btn.dataset.tab === 'compose') renderCompose(user);
        if (btn.dataset.tab === 'sent') renderSent(user);
        if (btn.dataset.tab === 'directory') renderDirectory(user);
      });
    });

    $('demoTeacherBtn').addEventListener('click', () => {
      $('userId').value = 'TCH-555';
      $('password').value = 'demo';
      $('role').value = 'teacher';
    });

    $('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const role = safeTrim($('role').value);
      const userId = normalizeId($('userId').value);

      if (!userId) {
        toast('Enter ID');
        return;
      }

      const directory = ensureDirectory();
      const existing = directory.find(u => u.userId === userId);
      const department = existing?.department ?? ROLE_DEFAULT_DEPT[role] ?? 'operations';
      const college = existing?.college ?? 'hope-foundation';
      const email = existing?.email ?? '';
      const displayName = existing?.displayName ?? `${ROLE_LABELS[role] ?? role} ${userId}`;

      const user = { userId, displayName, role, department, college, email };
      upsertDirectoryUser(user);
      setCurrentUser(user);
      toast('Login successful');
      renderLoggedInPanels(user);
      setTabs('inbox');
    });
  }

  function init() {
    document.body.classList.add('staff-portal');

    ensureDirectory();
    ensureMessages();

    setupEvents();

    const current = getCurrentUser();
    if (current) renderLoggedInPanels(current);
    else renderLoggedOutPanels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
