/* Staff Portal Messaging
  Server-synced with live updates (SSE) for multi-device communication. */

(() => {
  const API_BASE_URL = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
    ? 'http://localhost:3000'
    : 'https://ooc-backend.onrender.com';

  const STORAGE = {
    currentUser: 'ooc_portal_current_user',
    directory: 'ooc_portal_directory_v1',
    messages: 'ooc_portal_messages_v1'
  };
  let portalStream = null;
  let reconnectTimer = null;

  function clearLegacyAppStorage() {
    const keysToRemove = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      // Keep shared messaging/directory/current-user keys intact for cross-portal communication
      if (
        key === 'ngoData' ||
        key.startsWith('ooc_user_read_') ||
        key.startsWith('ooc_legacy_')
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  clearLegacyAppStorage();

  const DEFAULT_DIRECTORY = [
    { userId: 'ADMIN', displayName: 'Admin', role: 'admin', department: 'management', college: 'hope-foundation', email: 'admin@hope.org' },
    { userId: 'TCH-101', displayName: 'Demo Teacher', role: 'teacher', department: 'education', college: 'hope-foundation', email: 'teacher@hope.org' },
    { userId: 'EVT-201', displayName: 'Events Desk', role: 'events', department: 'events', college: 'hope-foundation', email: 'events@hope.org' },
    { userId: 'MGT-401', displayName: 'Management', role: 'management', department: 'management', college: 'hope-foundation', email: 'management@hope.org' },
    { userId: 'FND-301', displayName: 'Fundraising', role: 'fundraiser', department: 'fundraising', college: 'hope-foundation', email: 'fundraise@hope.org' }
  ];

  const ROLE_LABELS = {
    admin: 'Admin',
    user: 'User',
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
      const localRaw = localStorage.getItem(key);
      if (localRaw) return JSON.parse(localRaw);
    } catch {
      // Try session fallback for backward compatibility.
    }

    try {
      const sessionRaw = sessionStorage.getItem(key);
      if (!sessionRaw) return fallback;
      const parsed = JSON.parse(sessionRaw);
      localStorage.setItem(key, sessionRaw);
      return parsed;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    sessionStorage.setItem(key, serialized);
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
    disconnectPortalStream();
    sessionStorage.removeItem(STORAGE.currentUser);
    localStorage.removeItem(STORAGE.currentUser);
  }

  function normalizeMessage(message) {
    if (!message) return null;
    return {
      ...message,
      id: message.id || message._id
    };
  }

  function mergeMessagesIntoCache(incoming) {
    const nextMessages = Array.isArray(incoming)
      ? incoming.map(normalizeMessage).filter(Boolean)
      : [normalizeMessage(incoming)].filter(Boolean);

    if (!nextMessages.length) return ensureMessages();

    const merged = new Map();
    ensureMessages().forEach(msg => {
      const normalized = normalizeMessage(msg);
      if (normalized?.id) merged.set(normalized.id, normalized);
    });

    nextMessages.forEach(msg => {
      if (msg?.id) merged.set(msg.id, msg);
    });

    const ordered = Array.from(merged.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    saveJson(STORAGE.messages, ordered);
    return ordered;
  }

  function rerenderMessagingPanels() {
    const user = getCurrentUser();
    if (!user) return;
    renderRoleHome(user);
    renderInbox(user);
    renderSent(user);
    renderDirectory();
    updateUnreadBadge(user);
  }

  async function syncPortalState() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/portal`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Portal sync failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (Array.isArray(payload?.messages)) {
        mergeMessagesIntoCache(payload.messages);
      }
      if (Array.isArray(payload?.directory) && payload.directory.length) {
        saveJson(STORAGE.directory, payload.directory);
      }

      rerenderMessagingPanels();
      return true;
    } catch (error) {
      console.warn('Portal sync failed:', error.message);
      return false;
    }
  }

  function applyLiveMessage(message) {
    if (!message) return;
    mergeMessagesIntoCache(message);
    rerenderMessagingPanels();
  }

  function disconnectPortalStream() {
    if (portalStream) {
      portalStream.close();
      portalStream = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function connectPortalStream() {
    const user = getCurrentUser();
    if (!user) return;

    disconnectPortalStream();

    try {
      portalStream = new EventSource(`${API_BASE_URL}/api/messages/portal/stream`, { withCredentials: true });
    } catch (error) {
      console.warn('Unable to start live portal stream:', error.message);
      return;
    }

    ['message:new', 'message:reply'].forEach(eventName => {
      portalStream.addEventListener(eventName, (event) => {
        try {
          const payload = JSON.parse(event.data || '{}');
          applyLiveMessage(payload?.message);
        } catch (error) {
          console.warn('Invalid live message payload:', error.message);
        }
      });
    });

    portalStream.addEventListener('conversation:update', () => {
      rerenderMessagingPanels();
    });

    portalStream.onerror = () => {
      disconnectPortalStream();
      reconnectTimer = setTimeout(async () => {
        await syncPortalState();
        connectPortalStream();
      }, 2500);
    };
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
    const msgFab = document.getElementById('msgFab');
    const msgModalOverlay = document.getElementById('msgModalOverlay');
    if (!loginCard || !roleHomeCard) return;
    loginCard.hidden = isLoggedIn;
    roleHomeCard.hidden = !isLoggedIn;

    // Show/hide FAB when logged in
    if (msgFab) {
      msgFab.hidden = !isLoggedIn;
    }
    
    // Close modal when logging out
    if (!isLoggedIn && msgModalOverlay) {
      msgModalOverlay.classList.remove('open');
      msgModalOverlay.hidden = true;
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
    titleEl.textContent = `Welcome, ${escapeHtml(user.displayName)}`;
    subtitleEl.textContent = `${roleLabel} Dashboard`;

    const roleIcons = {
      teacher: 'fa-chalkboard-teacher',
      events: 'fa-calendar-alt',
      management: 'fa-building',
      fundraiser: 'fa-hand-holding-heart',
      staff: 'fa-user-tie'
    };
    const roleIcon = roleIcons[user.role] ?? 'fa-user';

    const welcomeHeader = `
      <div class="welcome-banner">
        <div class="welcome-icon"><i class="fas ${roleIcon}"></i></div>
        <div class="welcome-info">
          <div class="welcome-name">${escapeHtml(user.displayName)}</div>
          <div class="welcome-meta">${escapeHtml(roleLabel)} • ${escapeHtml(DEPT_LABELS[user.department] ?? user.department)} • ID: ${escapeHtml(user.userId)}</div>
        </div>
      </div>
    `;

    if (user.role === 'teacher') {
      const timetable = loadUserData(user, 'teacher_timetable_v1', [
        { day: 'Mon', slot: '09:00 - 10:00', subject: 'Math', className: 'Class 8A' },
        { day: 'Tue', slot: '11:00 - 12:00', subject: 'Science', className: 'Class 9B' },
        { day: 'Wed', slot: '10:00 - 11:00', subject: 'English', className: 'Class 7C' }
      ]);
      const grades = loadUserData(user, 'teacher_grades_v1', [
        { student: 'Aarav Sharma', subject: 'Math', score: '88' },
        { student: 'Sara Khan', subject: 'Science', score: '92' },
        { student: 'Rohan Patel', subject: 'English', score: '85' }
      ]);

      bodyEl.innerHTML = `
        ${welcomeHeader}

        <div class="dash-grid">
          <div class="dash-card accent-blue">
            <div class="dash-card-icon"><i class="fas fa-clock"></i></div>
            <div class="dash-card-label">Classes Today</div>
            <div class="dash-card-value">${timetable.length}</div>
          </div>
          <div class="dash-card accent-green">
            <div class="dash-card-icon"><i class="fas fa-user-graduate"></i></div>
            <div class="dash-card-label">Students Graded</div>
            <div class="dash-card-value">${grades.length}</div>
          </div>
          <div class="dash-card accent-purple">
            <div class="dash-card-icon"><i class="fas fa-envelope"></i></div>
            <div class="dash-card-label">Messages</div>
            <div class="dash-card-value">${inboxForUser(user).length}</div>
          </div>
        </div>

        <div class="dash-section">
          <div class="dash-section-head">
            <span class="dash-section-title"><i class="fas fa-calendar-week"></i> My Timetable</span>
            <div class="dash-section-actions">
              <button class="btn-icon" type="button" id="addTimetableBtn" title="Add"><i class="fas fa-plus"></i></button>
              <button class="btn-icon" type="button" id="clearTimetableBtn" title="Clear"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="simple-table">
              <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Class</th></tr></thead>
              <tbody>
                ${timetable.length ? timetable.map(r => `<tr><td>${escapeHtml(r.day)}</td><td>${escapeHtml(r.slot)}</td><td>${escapeHtml(r.subject)}</td><td>${escapeHtml(r.className)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty-row">No classes scheduled</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="dash-section">
          <div class="dash-section-head">
            <span class="dash-section-title"><i class="fas fa-chart-line"></i> Student Performance</span>
            <div class="dash-section-actions">
              <button class="btn-icon" type="button" id="addGradeBtn" title="Add"><i class="fas fa-plus"></i></button>
              <button class="btn-icon" type="button" id="clearGradesBtn" title="Clear"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="simple-table">
              <thead><tr><th>Student</th><th>Subject</th><th>Score</th></tr></thead>
              <tbody>
                ${grades.length ? grades.map(g => `<tr><td>${escapeHtml(g.student)}</td><td>${escapeHtml(g.subject)}</td><td><span class="score-badge">${escapeHtml(g.score)}</span></td></tr>`).join('') : '<tr><td colspan="3" class="empty-row">No grades recorded</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="quick-actions-row">
          <button class="action-btn" type="button" id="teacherMsgAdmin"><i class="fas fa-envelope"></i> Message Admin</button>
          <button class="action-btn" type="button" id="teacherMsgEvents"><i class="fas fa-calendar"></i> Message Events</button>
        </div>
      `;

      document.getElementById('addTimetableBtn').addEventListener('click', () => {
        const day = prompt('Day:', 'Mon'); if (!day) return;
        const slot = prompt('Time:', '09:00 - 10:00'); if (!slot) return;
        const subject = prompt('Subject:', 'Math'); if (!subject) return;
        const className = prompt('Class:', 'Class 8A'); if (!className) return;
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
        const student = prompt('Student:', 'Name'); if (!student) return;
        const subject = prompt('Subject:', 'Math'); if (!subject) return;
        const score = prompt('Score:', '90'); if (!score) return;
        grades.push({ student, subject, score });
        saveUserData(user, 'teacher_grades_v1', grades);
        renderRoleHome(user);
      });
      document.getElementById('clearGradesBtn').addEventListener('click', () => {
        if (!confirm('Clear grades?')) return;
        saveUserData(user, 'teacher_grades_v1', []);
        renderRoleHome(user);
      });
      document.getElementById('teacherMsgAdmin').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Message from Teacher' }); });
      document.getElementById('teacherMsgEvents').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Event coordination' }); });
      return;
    }

    if (user.role === 'fundraiser') {
      const campaigns = loadUserData(user, 'fundraiser_campaigns_v1', [
        { name: 'Winter Aid Drive', target: '₹50,000', raised: '₹32,000', status: 'Active' },
        { name: 'Education Fund', target: '₹1,00,000', raised: '₹78,500', status: 'Active' },
        { name: 'Medical Support', target: '₹25,000', raised: '₹25,000', status: 'Completed' }
      ]);

      bodyEl.innerHTML = `
        ${welcomeHeader}

        <div class="dash-grid">
          <div class="dash-card accent-green">
            <div class="dash-card-icon"><i class="fas fa-bullseye"></i></div>
            <div class="dash-card-label">Active Campaigns</div>
            <div class="dash-card-value">${campaigns.filter(c => c.status === 'Active').length}</div>
          </div>
          <div class="dash-card accent-blue">
            <div class="dash-card-icon"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="dash-card-label">Total Raised</div>
            <div class="dash-card-value">₹1.35L</div>
          </div>
          <div class="dash-card accent-orange">
            <div class="dash-card-icon"><i class="fas fa-users"></i></div>
            <div class="dash-card-label">Donors This Month</div>
            <div class="dash-card-value">48</div>
          </div>
        </div>

        <div class="dash-section">
          <div class="dash-section-head">
            <span class="dash-section-title"><i class="fas fa-chart-pie"></i> Campaign Overview</span>
          </div>
          <div class="table-wrap">
            <table class="simple-table">
              <thead><tr><th>Campaign</th><th>Target</th><th>Raised</th><th>Status</th></tr></thead>
              <tbody>
                ${campaigns.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.target)}</td><td>${escapeHtml(c.raised)}</td><td><span class="status-badge ${c.status === 'Active' ? 'status-active' : 'status-done'}">${escapeHtml(c.status)}</span></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="quick-actions-row">
          <button class="action-btn" type="button" id="frMsgAdmin"><i class="fas fa-bullhorn"></i> Report to Admin</button>
          <button class="action-btn" type="button" id="frMsgMgmt"><i class="fas fa-building"></i> Update Management</button>
          <button class="action-btn" type="button" id="frMsgEvents"><i class="fas fa-calendar"></i> Coordinate Event</button>
        </div>
      `;

      document.getElementById('frMsgAdmin').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Fundraising Report' }); });
      document.getElementById('frMsgMgmt').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Fundraising Update' }); });
      document.getElementById('frMsgEvents').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Event Fundraising Coordination' }); });
      return;
    }

    if (user.role === 'management') {
      bodyEl.innerHTML = `
        ${welcomeHeader}

        <div class="dash-grid">
          <div class="dash-card accent-red">
            <div class="dash-card-icon"><i class="fas fa-clock"></i></div>
            <div class="dash-card-label">Pending Approvals</div>
            <div class="dash-card-value">5</div>
          </div>
          <div class="dash-card accent-blue">
            <div class="dash-card-icon"><i class="fas fa-users"></i></div>
            <div class="dash-card-label">Total Staff</div>
            <div class="dash-card-value">24</div>
          </div>
          <div class="dash-card accent-green">
            <div class="dash-card-icon"><i class="fas fa-check-circle"></i></div>
            <div class="dash-card-label">Tasks Completed</div>
            <div class="dash-card-value">18</div>
          </div>
        </div>

        <div class="dash-section">
          <div class="dash-section-head">
            <span class="dash-section-title"><i class="fas fa-tasks"></i> Recent Activity</span>
          </div>
          <ul class="activity-list">
            <li><i class="fas fa-check text-green"></i> Budget approved for Q1 events</li>
            <li><i class="fas fa-user-plus text-blue"></i> New teacher onboarded: Priya M.</li>
            <li><i class="fas fa-file-alt text-orange"></i> Report submitted by Fundraising</li>
            <li><i class="fas fa-bell text-purple"></i> Staff meeting scheduled for Feb 05</li>
          </ul>
        </div>

        <div class="quick-actions-row">
          <button class="action-btn" type="button" id="mgmtBroadcast"><i class="fas fa-bullhorn"></i> Broadcast to All</button>
          <button class="action-btn" type="button" id="mgmtMsgTeachers"><i class="fas fa-chalkboard-teacher"></i> Message Teachers</button>
          <button class="action-btn" type="button" id="mgmtMsgFund"><i class="fas fa-hand-holding-heart"></i> Message Fundraisers</button>
        </div>
      `;

      document.getElementById('mgmtBroadcast').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Announcement from Management' }); });
      document.getElementById('mgmtMsgTeachers').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Notice for Teachers' }); });
      document.getElementById('mgmtMsgFund').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Fundraising Discussion' }); });
      return;
    }

    if (user.role === 'events') {
      const events = loadUserData(user, 'events_list_v1', [
        { name: 'Orientation Drive', date: 'Feb 02', status: 'Upcoming' },
        { name: 'Donation Camp', date: 'Feb 10', status: 'Planning' },
        { name: 'Workshop', date: 'Feb 18', status: 'Upcoming' },
        { name: 'Annual Day', date: 'Mar 15', status: 'Planning' }
      ]);

      bodyEl.innerHTML = `
        ${welcomeHeader}

        <div class="dash-grid">
          <div class="dash-card accent-purple">
            <div class="dash-card-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="dash-card-label">Upcoming Events</div>
            <div class="dash-card-value">${events.filter(e => e.status === 'Upcoming').length}</div>
          </div>
          <div class="dash-card accent-orange">
            <div class="dash-card-icon"><i class="fas fa-clipboard-list"></i></div>
            <div class="dash-card-label">In Planning</div>
            <div class="dash-card-value">${events.filter(e => e.status === 'Planning').length}</div>
          </div>
          <div class="dash-card accent-green">
            <div class="dash-card-icon"><i class="fas fa-check-double"></i></div>
            <div class="dash-card-label">Completed</div>
            <div class="dash-card-value">12</div>
          </div>
        </div>

        <div class="dash-section">
          <div class="dash-section-head">
            <span class="dash-section-title"><i class="fas fa-calendar-alt"></i> Event Schedule</span>
          </div>
          <div class="table-wrap">
            <table class="simple-table">
              <thead><tr><th>Event</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                ${events.map(e => `<tr><td>${escapeHtml(e.name)}</td><td>${escapeHtml(e.date)}</td><td><span class="status-badge ${e.status === 'Upcoming' ? 'status-active' : 'status-plan'}">${escapeHtml(e.status)}</span></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="quick-actions-row">
          <button class="action-btn" type="button" id="evtMsgTeachers"><i class="fas fa-chalkboard-teacher"></i> Invite Teachers</button>
          <button class="action-btn" type="button" id="evtMsgFund"><i class="fas fa-hand-holding-heart"></i> Coordinate Fundraising</button>
          <button class="action-btn" type="button" id="evtMsgMgmt"><i class="fas fa-building"></i> Report to Management</button>
        </div>
      `;

      document.getElementById('evtMsgTeachers').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Event Support Request' }); });
      document.getElementById('evtMsgFund').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Fundraising for Event' }); });
      document.getElementById('evtMsgMgmt').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Event Status Update' }); });
      return;
    }

    // staff (default)
    bodyEl.innerHTML = `
      ${welcomeHeader}

      <div class="dash-grid">
        <div class="dash-card accent-blue">
          <div class="dash-card-icon"><i class="fas fa-tasks"></i></div>
          <div class="dash-card-label">Pending Tasks</div>
          <div class="dash-card-value">7</div>
        </div>
        <div class="dash-card accent-green">
          <div class="dash-card-icon"><i class="fas fa-envelope"></i></div>
          <div class="dash-card-label">Messages</div>
          <div class="dash-card-value">${inboxForUser(user).length}</div>
        </div>
        <div class="dash-card accent-orange">
          <div class="dash-card-icon"><i class="fas fa-bell"></i></div>
          <div class="dash-card-label">Notifications</div>
          <div class="dash-card-value">3</div>
        </div>
      </div>

      <div class="dash-section">
        <div class="dash-section-head">
          <span class="dash-section-title"><i class="fas fa-clipboard-check"></i> Today's Tasks</span>
        </div>
        <ul class="activity-list">
          <li><i class="fas fa-circle text-orange"></i> Complete inventory check</li>
          <li><i class="fas fa-circle text-blue"></i> Update records database</li>
          <li><i class="fas fa-circle text-green"></i> Prepare weekly report</li>
        </ul>
      </div>

      <div class="quick-actions-row">
        <button class="action-btn" type="button" id="staffMsgAdmin"><i class="fas fa-envelope"></i> Message Admin</button>
        <button class="action-btn" type="button" id="staffMsgMgmt"><i class="fas fa-building"></i> Message Management</button>
      </div>
    `;

    document.getElementById('staffMsgAdmin').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Staff Update' }); });
    document.getElementById('staffMsgMgmt').addEventListener('click', () => { openMessageModal('compose'); renderCompose(user, { subject: 'Request from Staff' }); });
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

  async function sendMessage({ recipientTokens, subject, body }) {
    const response = await fetch(`${API_BASE_URL}/api/messages/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        recipientTokens,
        subject: safeTrim(subject) || '(No subject)',
        body: safeTrim(body),
        type: 'message'
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || 'Failed to send message');
    }

    const persisted = normalizeMessage(payload?.data);
    if (persisted) {
      mergeMessagesIntoCache(persisted);
    }

    return persisted;
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

  function openMessageModal(tabId = 'inbox') {
    const overlay = $('msgModalOverlay');
    if (!overlay) return;
    overlay.hidden = false;
    void overlay.offsetWidth;
    overlay.classList.add('open');
    setTabs(tabId);
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
    const fabDot = $('msgFabDot');
    if (!user) {
      badge.style.display = 'none';
      if (fabDot) fabDot.classList.remove('has-unread');
      return;
    }
    const inbox = inboxForUser(user);
    const unread = inbox.filter(m => !isReadByUser(m, user)).length;
    if (unread > 0) {
      badge.textContent = String(unread);
      badge.style.display = 'inline-flex';
      if (fabDot) fabDot.classList.add('has-unread');
    } else {
      badge.style.display = 'none';
      if (fabDot) fabDot.classList.remove('has-unread');
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
      <div class="muted-inline">Directory (server-synced)</div>
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

    const roleChecks = ['admin', 'user', 'teacher', 'events', 'management', 'fundraiser', 'staff']
      .map(r => `<label class="pill"><input type="checkbox" value="${r}" class="roleCheck"> ${ROLE_LABELS[r] || r}</label>`)
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

    $('composeForm').addEventListener('submit', async (e) => {
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

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      try {
        await sendMessage({ recipientTokens, subject, body });
        toast('Message sent');
        await syncPortalState();
        renderSent(user);
        setTabs('sent');
        updateUnreadBadge(user);
      } catch (error) {
        toast(error.message || 'Failed to send message');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
      }
    });

    $('clearMessagesBtn').addEventListener('click', async () => {
      const refreshed = await syncPortalState();
      toast(refreshed ? 'Messages refreshed from server' : 'Unable to refresh messages');
    });
  }

  function renderLoggedOutPanels() {
    disconnectPortalStream();
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
    // Floating message button - open modal
    const msgFab = $('msgFab');
    const msgModalOverlay = $('msgModalOverlay');
    const msgModalClose = $('msgModalClose');
    
    if (msgFab && msgModalOverlay) {
      msgFab.addEventListener('click', () => {
        msgModalOverlay.hidden = false;
        // Trigger reflow for animation
        void msgModalOverlay.offsetWidth;
        msgModalOverlay.classList.add('open');
      });
    }
    
    if (msgModalClose && msgModalOverlay) {
      msgModalClose.addEventListener('click', () => {
        msgModalOverlay.classList.remove('open');
        setTimeout(() => {
          msgModalOverlay.hidden = true;
        }, 250);
      });
    }
    
    // Close modal when clicking overlay (outside modal)
    if (msgModalOverlay) {
      msgModalOverlay.addEventListener('click', (e) => {
        if (e.target === msgModalOverlay) {
          msgModalOverlay.classList.remove('open');
          setTimeout(() => {
            msgModalOverlay.hidden = true;
          }, 250);
        }
      });
    }
    
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

    $('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = safeTrim($('email').value);
      const password = $('password').value;
      const btn = e.target.querySelector('button[type="submit"]');

      if (!email || !password) {
        toast('Enter email and password');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

      try {
        const res = await fetch(`${API_BASE_URL}/api/staff/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
          // Prevent admin users from using the standard staff portal, and vice versa
          if (data.staff.role === 'admin') {
              alert('Administrators must use the dedicated Admin Portal.');
              return;
          }

          const userId = data.staff.id || data.staff._id || email.split('@')[0].toUpperCase();
          const role = data.staff.role.toLowerCase();
          const department = (data.staff.department || ROLE_DEFAULT_DEPT[role] || 'operations').toLowerCase();
          const displayName = data.staff.name || email.split('@')[0];
          const college = 'hope-foundation';

          const user = { userId, displayName, role, department, college, email };
          upsertDirectoryUser(user);
          setCurrentUser(user);
          
          toast('Login successful');
          renderLoggedInPanels(user);
          await syncPortalState();
          connectPortalStream();
          setTabs('inbox');
        } else {
          toast(data.error || 'Invalid credentials');
        }
      } catch (err) {
        console.error('Login error:', err);
        toast('Unable to connect to server.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Secure Login';
      }
    });
  }

  function init() {
    document.body.classList.add('staff-portal');
    window.addEventListener('beforeunload', disconnectPortalStream, { once: true });

    ensureDirectory();
    ensureMessages();

    setupEvents();

    const current = getCurrentUser();
    if (current) {
      renderLoggedInPanels(current);
      syncPortalState().finally(() => {
        connectPortalStream();
      });
      return;
    }
    renderLoggedOutPanels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
