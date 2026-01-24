// --- MOCK DATABASE ---
const initialData = {
    donations: [
        { id: 'D001', name: 'Rohan Sharma', amount: 5000, method: 'UPI', date: '2023-10-15' },
        { id: 'D002', name: 'Alice Smith', amount: 12000, method: 'Credit Card', date: '2023-10-18' },
        { id: 'D003', name: 'Tech Corp Inc.', amount: 50000, method: 'Bank Transfer', date: '2023-10-20' },
    ],
    volunteers: [
        { id: 'V001', name: 'Priya Patel', email: 'priya@example.com', interest: 'Teaching', status: 'Approved' },
        { id: 'V002', name: 'John Doe', email: 'john@example.com', interest: 'Fundraising', status: 'Pending' }
    ],
    events: [
        { id: 'E001', title: 'Annual Charity Gala', date: '2023-12-25', desc: 'Join us for an evening of giving and celebration.' },
        { id: 'E002', title: 'Food Drive', date: '2023-11-10', desc: 'Distributing meals in local communities.' }
        ,{ id: 'E003', title: 'Donation Drive', date: '2024-02-15', desc: 'Collecting funds and supplies for children’s education and care.' }
        ,{ id: 'E004', title: 'Free Shelter Initiative', date: '2024-03-05', desc: 'Providing temporary shelter and essentials for families in need.' }
        ,{ id: 'E005', title: 'Free Education Camp', date: '2024-03-20', desc: 'Enrollment drive with books, uniforms, and tutoring support.' }
        ,{ id: 'E006', title: 'Essentials Distribution', date: '2024-04-01', desc: 'Distributing hygiene kits, blankets, and basic necessities.' }
    ],
    utilizationRatios: {
        Education: 0.5,
        Nutrition: 0.3,
        Healthcare: 0.2
    },
    messages: [
        { id: 'M001', name: 'Neha Kapoor', email: 'neha@example.com', message: 'Interested in partnering for a nutrition drive.' },
        { id: 'M002', name: 'Arjun Singh', email: 'arjun@example.com', message: 'Would like to sponsor learning kits this quarter.' }
    ],
    institutions: [
        {
            id: 'I001',
            name: 'Sunrise Public School',
            city: 'Delhi',
            sector: 'Education',
            allocation: 35,
            impact: 'Scholarships and learning kits for 120 children.'
        },
        {
            id: 'I002',
            name: 'Seva Nutrition Center',
            city: 'Mumbai',
            sector: 'Nutrition',
            allocation: 25,
            impact: 'Daily nutritious meals for 300 children.'
        },
        {
            id: 'I003',
            name: 'Asha Health Clinic',
            city: 'Bangalore',
            sector: 'Healthcare',
            allocation: 20,
            impact: 'Monthly health camps and immunizations.'
        },
        {
            id: 'I004',
            name: 'Nirmal Shelter Home',
            city: 'Kolkata',
            sector: 'Shelter',
            allocation: 20,
            impact: 'Temporary shelter and essentials for families.'
        }
    ]
};

const THEME_KEY = 'ooc-theme';

// Initialize LocalStorage from seed file and merge missing data
async function initData() {
    const existing = localStorage.getItem('ngoData');
    try {
        const response = await fetch('data/ngo-data.json');
        if (!response.ok) throw new Error('Seed load failed');
        const seed = await response.json();

        if (!existing) {
            localStorage.setItem('ngoData', JSON.stringify(seed));
            return;
        }

        const current = JSON.parse(existing);
        const merged = mergeSeedData(current, seed);
        localStorage.setItem('ngoData', JSON.stringify(merged));
    } catch (error) {
        if (!existing) {
            localStorage.setItem('ngoData', JSON.stringify(initialData));
        }
    }
}

function mergeSeedData(current, seed) {
    const merged = {
        donations: current.donations?.length ? current.donations : seed.donations,
        volunteers: current.volunteers?.length ? current.volunteers : seed.volunteers,
        events: mergeEvents(current.events || [], seed.events || []),
        utilizationRatios: current.utilizationRatios || seed.utilizationRatios || initialData.utilizationRatios,
        messages: current.messages?.length ? current.messages : seed.messages || initialData.messages,
        institutions: current.institutions?.length ? current.institutions : seed.institutions || initialData.institutions
    };
    return merged;
}

function mergeEvents(existing, seed) {
    const map = new Map();
    seed.forEach(evt => map.set(evt.id, evt));
    existing.forEach(evt => map.set(evt.id, evt));
    return Array.from(map.values());
}

// --- THEME ---
function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
}

function prefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-sun', 'fa-moon');
            icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
        }
        toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
    const next = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(next);
}

// Helper to get/set data
function getData() {
    return JSON.parse(localStorage.getItem('ngoData'));
}

function saveData(data) {
    localStorage.setItem('ngoData', JSON.stringify(data));
}

function getTotalFunds(data) {
    return data.donations.reduce((sum, d) => sum + d.amount, 0);
}

// --- NAVIGATION ---
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to the clicked nav link
    const activeLink = document.querySelector(`.nav-links a[onclick*="'${sectionId}'"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Dynamic Rendering
    if (sectionId === 'admin-dashboard') {
        renderDashboard();
    } else if (sectionId === 'events') {
        renderPublicEvents();
    } else if (sectionId === 'impact') {
        renderPublicInstitutions();
    }
}

// --- PUBLIC VIEW RENDERING ---
function renderPublicEvents() {
    const data = getData();
    const list = document.getElementById('public-events-list');
    list.innerHTML = '';

    if (data.events.length === 0) {
        list.innerHTML = '<tr><td colspan="3" class="muted">No upcoming events.</td></tr>';
        return;
    }

    const sortedEvents = [...data.events].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEvents.forEach(evt => {
        const row = `
            <tr>
                <td>${evt.title}</td>
                <td>${evt.date}</td>
                <td>${evt.desc}</td>
            </tr>`;
        list.innerHTML += row;
    });
}

function renderPublicInstitutions() {
    const data = getData();
    const grid = document.getElementById('institution-grid');
    const totalLabel = document.getElementById('institution-total');
    if (!grid || !totalLabel) return;

    grid.innerHTML = '';
    const totalFunds = getTotalFunds(data);

    data.institutions.forEach(inst => {
        const allocatedAmount = Math.round((inst.allocation / 100) * totalFunds);
        const card = document.createElement('div');
        card.className = 'institution-card';
        card.innerHTML = `
            <div class="inst-header">
                <div>
                    <h4>${inst.name}</h4>
                    <p class="muted">${inst.city} • ${inst.sector}</p>
                </div>
                <span class="pill">${inst.allocation}%</span>
            </div>
            <p>${inst.impact}</p>
            <div class="inst-bar"><span style="width:${inst.allocation}%;"></span></div>
            <div class="inst-amount">Est. ₹${allocatedAmount.toLocaleString()} allocated</div>
        `;
        grid.appendChild(card);
    });

    totalLabel.textContent = `Total allocated: ${data.institutions.reduce((t, i) => t + Number(i.allocation || 0), 0)}% of donations`;
}

function focusImpactDashboard() {
    showSection('impact');
    const card = document.querySelector('.transparency-card');
    if (card) {
        card.classList.add('flash-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('flash-highlight'), 1200);
    }
}

function downloadImpactReport() {
    const data = getData();
    const totalFunds = getTotalFunds(data).toLocaleString();
    const allocations = data.institutions.map(inst => `${inst.name} (${inst.sector}) - ${inst.allocation}%`).join('\n');
    const summary = `Hope Foundation - Impact Report\n\nTotal Funds: ₹${totalFunds}\nInstitutions Allocation:\n${allocations}\n\nTop KPIs:\n- Attendance improvement: 98%\n- Health check-ups: 1,500\n- Volunteers engaged: 500+\n`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'impact-report.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function openSummaryModal() {
    const data = getData();
    const totalFunds = getTotalFunds(data);
    const allocLines = data.institutions
        .map(inst => `<li><strong>${inst.name}</strong> (${inst.sector}) — ${inst.allocation}% (est. ₹${Math.round((inst.allocation / 100) * totalFunds).toLocaleString()})</li>`)
        .join('');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');
    const modal = document.getElementById('impact-modal');
    if (!body || !title || !modal) return;

    title.textContent = 'Financial Transparency Summary';
    body.innerHTML = `
        <p><strong>Total Funds (recorded):</strong> ₹${totalFunds.toLocaleString()}</p>
        <p><strong>Distribution:</strong></p>
        <ul>${allocLines}</ul>
        <p class="muted small">Data is derived from recorded donations and current allocation settings.</p>
    `;
    modal.style.display = 'flex';
}

function closeImpactModal() {
    const modal = document.getElementById('impact-modal');
    if (modal) modal.style.display = 'none';
}

// --- FORMS HANDLING ---

// 1. Volunteer Form
function handleVolunteerSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('vol-name').value;
    const email = document.getElementById('vol-email').value;
    const interest = document.getElementById('vol-interest').value;

    const data = getData();
    const newVol = {
        id: 'V' + (Date.now() % 10000), // Simple ID
        name,
        email,
        interest,
        status: 'Pending'
    };
    
    data.volunteers.push(newVol);
    saveData(data);

    alert('Application Submitted Successfully!');
    e.target.reset();
    showSection('home');
}

// 2. Donation Form
function handleDonationSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('don-name').value;
    const amount = document.getElementById('don-amount').value;
    const method = document.querySelector('input[name="pay-method"]:checked')?.value || 'UPI';
    if (method === 'Card') {
        const cardNum = document.getElementById('don-card-number').value.trim();
        const cardExp = document.getElementById('don-card-exp').value.trim();
        const cardCvv = document.getElementById('don-card-cvv').value.trim();
        if (!cardNum || !cardExp || !cardCvv) {
            alert('Please fill card details.');
            return;
        }
    }
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const id = 'D' + Math.floor(Math.random() * 10000);

    const data = getData();
    const newDonation = { id, name, amount: parseInt(amount), method, date };
    
    data.donations.push(newDonation);
    saveData(data);

    // Show Receipt
    document.getElementById('receipt-name').innerText = name;
    document.getElementById('receipt-amount').innerText = amount;
    document.getElementById('receipt-date').innerText = date;
    document.getElementById('receipt-generated').innerText = now.toLocaleString();
    document.getElementById('receipt-id').innerText = id;
    
    document.getElementById('receipt-area').style.display = 'block';
    
    // Hide form for better UX
    e.target.style.display = 'none';
    
    alert('Thank you for your generous donation!');
}

function togglePaymentMethod() {
    const method = document.querySelector('input[name="pay-method"]:checked')?.value || 'UPI';
    const upiBox = document.getElementById('upi-box');
    const cardBox = document.getElementById('card-box');
    document.querySelectorAll('.pill-option').forEach(label => label.classList.remove('active'));
    const activeLabel = document.querySelector(`.pill-option input[value="${method}"]`)?.parentElement;
    if (activeLabel) activeLabel.classList.add('active');
    if (upiBox) upiBox.style.display = method === 'UPI' ? 'block' : 'none';
    if (cardBox) cardBox.style.display = method === 'Card' ? 'block' : 'none';
}

function copyUpiId() {
    const upiId = document.getElementById('upi-id-text')?.textContent?.trim();
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID copied');
    });
}

// --- ADMIN DASHBOARD ---
function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    // Simple Mock Auth
    if (user === 'admin' && pass === 'admin123') {
        alert('Login Successful');
        showSection('admin-dashboard');
    } else {
        alert('Invalid Credentials! (Try: admin / admin123)');
    }
}

function logout() {
    if(confirm('Are you sure you want to log out?')) {
        showSection('home');
    }
}

function showDashboardTab(tabId) {
    // Hide all dashboard tabs
    document.querySelectorAll('.dash-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    // Show selected
    document.getElementById(tabId).style.display = 'block';
}

function renderDashboard() {
    const data = getData();

    // 1. Overview Stats
    const totalFunds = data.donations.reduce((sum, d) => sum + d.amount, 0);
    document.getElementById('total-funds').innerText = totalFunds.toLocaleString();
    document.getElementById('volunteer-count').innerText = data.volunteers.length;

    // 2. Donations Table
    const donBody = document.getElementById('donations-table-body');
    donBody.innerHTML = '';
    
    // Sort by date desc
    const sortedDonations = [...data.donations].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedDonations.forEach(d => {
        const row = `<tr>
            <td>${d.name}</td>
            <td>₹${d.amount}</td>
            <td>${d.method}</td>
            <td>${d.date}</td>
        </tr>`;
        donBody.innerHTML += row;
    });

    // 3. Volunteers Table
    const volBody = document.getElementById('volunteers-table-body');
    volBody.innerHTML = '';

    data.volunteers.forEach(v => {
        const row = `<tr>
            <td>${v.name}</td>
            <td>${v.email}</td>
            <td>${v.interest}</td>
            <td><span class="status-${v.status.toLowerCase()}">${v.status}</span></td>
            <td>
                ${v.status === 'Pending' ? `<button onclick="approveVolunteer('${v.id}')" style="cursor:pointer; color:green; background:none; border:none;">Approve</button>` : ''}
            </td>
        </tr>`;
        volBody.innerHTML += row;
    });

    // 4. Events Management
    const evtBody = document.getElementById('events-table-body');
    if (evtBody) {
        evtBody.innerHTML = '';
        data.events.forEach(evt => {
            const row = `<tr>
                <td>${evt.title}</td>
                <td>${evt.date}</td>
                <td><button onclick="deleteEvent('${evt.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button></td>
            </tr>`;
            evtBody.innerHTML += row;
        });
    }

    hydrateAllocationForm(data);
    renderCharts(data);
    renderInstitutionsAdmin(data);
    renderMessagesAdmin(data);
}

let donationsChartInstance = null;
let utilizationChartInstance = null;

function renderCharts(data) {
    if (!window.Chart) return;

    const donationsCanvas = document.getElementById('donations-chart');
    const utilizationCanvas = document.getElementById('utilization-chart');
    if (!donationsCanvas || !utilizationCanvas) return;

    const monthlyTotals = getMonthlyTotals(data.donations);
    const monthLabels = Object.keys(monthlyTotals);
    const monthValues = Object.values(monthlyTotals);

    if (donationsChartInstance) donationsChartInstance.destroy();
    donationsChartInstance = new Chart(donationsCanvas, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Donations (₹)',
                data: monthValues,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    const totalFunds = data.donations.reduce((sum, d) => sum + d.amount, 0);
    const ratios = data.utilizationRatios || { Education: 0.5, Nutrition: 0.3, Healthcare: 0.2 };
    const sectorLabels = Object.keys(ratios);
    const sectorValues = sectorLabels.map(label => Math.round(totalFunds * ratios[label]));

    if (utilizationChartInstance) utilizationChartInstance.destroy();
    utilizationChartInstance = new Chart(utilizationCanvas, {
        type: 'bar',
        data: {
            labels: sectorLabels,
            datasets: [{
                label: 'Utilized (₹)',
                data: sectorValues,
                backgroundColor: ['#34d399', '#60a5fa', '#fbbf24'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderInstitutionsAdmin(data) {
    const tableWrap = document.getElementById('institutions-table');
    const totalLabel = document.getElementById('inst-total-label');
    if (!tableWrap || !totalLabel) return;

    const totalFunds = getTotalFunds(data);
    const rows = data.institutions.map(inst => {
        const estAmount = Math.round((inst.allocation / 100) * totalFunds);
        return `
            <tr>
                <td>${inst.name}<div class="muted small">${inst.city} • ${inst.sector}</div></td>
                <td><input type="number" min="0" max="100" step="1" class="inst-input" data-id="${inst.id}" value="${inst.allocation}"></td>
                <td>₹${estAmount.toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    tableWrap.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>Institution</th><th>Allocation (%)</th><th>Est. Amount</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    updateInstitutionTotalLabel();

    tableWrap.querySelectorAll('.inst-input').forEach(input => {
        input.addEventListener('input', updateInstitutionTotalLabel);
    });
}

function updateInstitutionTotalLabel() {
    const inputs = document.querySelectorAll('.inst-input');
    const totalLabel = document.getElementById('inst-total-label');
    if (!inputs.length || !totalLabel) return;
    const total = Array.from(inputs).reduce((sum, el) => sum + Number(el.value || 0), 0);
    totalLabel.textContent = `Total: ${total}%`;
    totalLabel.style.color = total === 100 ? '#16a34a' : '#dc2626';
}

function hydrateAllocationForm(data) {
    const educationInput = document.getElementById('alloc-education');
    const nutritionInput = document.getElementById('alloc-nutrition');
    const healthcareInput = document.getElementById('alloc-healthcare');
    const totalLabel = document.getElementById('alloc-total');

    if (!educationInput || !nutritionInput || !healthcareInput || !totalLabel) return;

    const ratios = data.utilizationRatios || { Education: 0.5, Nutrition: 0.3, Healthcare: 0.2 };
    educationInput.value = Math.round(ratios.Education * 100);
    nutritionInput.value = Math.round(ratios.Nutrition * 100);
    healthcareInput.value = Math.round(ratios.Healthcare * 100);
    updateAllocationTotal();

    [educationInput, nutritionInput, healthcareInput].forEach(input => {
        input.addEventListener('input', updateAllocationTotal);
    });
}

function updateAllocationTotal() {
    const educationInput = document.getElementById('alloc-education');
    const nutritionInput = document.getElementById('alloc-nutrition');
    const healthcareInput = document.getElementById('alloc-healthcare');
    const totalLabel = document.getElementById('alloc-total');
    if (!educationInput || !nutritionInput || !healthcareInput || !totalLabel) return;

    const total =
        Number(educationInput.value || 0) +
        Number(nutritionInput.value || 0) +
        Number(healthcareInput.value || 0);
    totalLabel.textContent = `Total: ${total}%`;
    totalLabel.style.color = total === 100 ? '#16a34a' : '#dc2626';
}

function updateAllocation(e) {
    e.preventDefault();
    const educationInput = document.getElementById('alloc-education');
    const nutritionInput = document.getElementById('alloc-nutrition');
    const healthcareInput = document.getElementById('alloc-healthcare');

    const education = Number(educationInput.value || 0);
    const nutrition = Number(nutritionInput.value || 0);
    const healthcare = Number(healthcareInput.value || 0);
    const total = education + nutrition + healthcare;

    if (total !== 100) {
        alert('Allocation must total 100%.');
        return;
    }

    const data = getData();
    data.utilizationRatios = {
        Education: education / 100,
        Nutrition: nutrition / 100,
        Healthcare: healthcare / 100
    };
    saveData(data);
    renderCharts(data);
    alert('Allocation updated.');
}

function updateInstitutionsAllocation(e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('.inst-input');
    if (!inputs.length) return;

    const allocations = Array.from(inputs).map(input => ({ id: input.dataset.id, allocation: Number(input.value || 0) }));
    const total = allocations.reduce((sum, item) => sum + item.allocation, 0);
    if (total !== 100) {
        alert('Institution allocation must total 100%.');
        return;
    }

    const data = getData();
    allocations.forEach(item => {
        const inst = data.institutions.find(i => i.id === item.id);
        if (inst) inst.allocation = item.allocation;
    });
    saveData(data);
    renderDashboard();
    renderPublicInstitutions();
    alert('Institution distribution updated.');
}

function handleAddInstitution(e) {
    e.preventDefault();
    const name = document.getElementById('inst-name').value;
    const city = document.getElementById('inst-city').value;
    const sector = document.getElementById('inst-sector').value;
    const allocation = Number(document.getElementById('inst-allocation').value || 0);
    const impact = document.getElementById('inst-impact').value;

    const data = getData();
    const newInst = {
        id: 'I' + (Date.now() % 10000),
        name,
        city,
        sector,
        allocation,
        impact
    };

    data.institutions.push(newInst);
    saveData(data);
    e.target.reset();
    renderDashboard();
    renderPublicInstitutions();
    alert('Institution added. Adjust percentages to total 100%.');
}

function getMonthlyTotals(donations) {
    const months = {};
    donations.forEach(donation => {
        const date = new Date(donation.date);
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!months[label]) months[label] = 0;
        months[label] += donation.amount;
    });
    return months;
}

// --- ADMIN ACTIONS ---

function approveVolunteer(id) {
    const data = getData();
    const vol = data.volunteers.find(v => v.id === id);
    if(vol) {
        vol.status = 'Approved';
        saveData(data);
        renderDashboard(); 
        alert('Volunteer Approved!');
    }
}

function handleAddEvent(e) {
    e.preventDefault();
    const title = document.getElementById('evt-title').value;
    const date = document.getElementById('evt-date').value;
    const desc = document.getElementById('evt-desc').value;

    const data = getData();
    const newEvent = {
        id: 'E' + (Date.now() % 10000),
        title, date, desc
    };
    
    data.events.push(newEvent);
    saveData(data);
    
    alert('Event Published!');
    e.target.reset();
    renderDashboard();
    renderPublicEvents();
}

function renderMessagesAdmin(data) {
    const table = document.getElementById('messages-table-body');
    if (!table) return;
    table.innerHTML = '';
    if (!data.messages || !data.messages.length) {
        table.innerHTML = '<tr><td colspan="3" class="muted">No messages yet.</td></tr>';
        return;
    }
    data.messages.forEach(msg => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${msg.name}<div class="muted small">${msg.email}</div></td>
            <td>${msg.message}</td>
            <td>${msg.id}</td>
        `;
        table.appendChild(row);
    });
}

function handleContactSubmit(e) {
    e.preventDefault();
    const name = e.target.querySelector('input[name="contact-name"]').value;
    const email = e.target.querySelector('input[name="contact-email"]').value;
    const message = e.target.querySelector('textarea[name="contact-message"]').value;

    const data = getData();
    const newMsg = {
        id: 'M' + (Date.now() % 100000),
        name,
        email,
        message
    };
    data.messages = data.messages || [];

    createRazorpayOrder({ name, amount, method });
}

async function createRazorpayOrder({ name, amount, method }) {
    try {
        showPaymentStatus('Processing payment...', 'info');
        const res = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(Number(amount) * 100), receipt: 'don_' + Date.now(), notes: { donor: name, method } })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Order failed');

        const options = {
            key: data.keyId,
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'Hope Foundation',
            description: 'Donation',
            order_id: data.order.id,
            prefill: { name },
            theme: { color: '#2ecc71' },
            handler: async function (response) {
                const verifyRes = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });
                const verify = await verifyRes.json();
                if (verify.verified) {
                    finalizeDonation({ name, amount, method, gatewayId: response.razorpay_payment_id, status: 'Success' });
                    showPaymentStatus('Payment successful. Receipt generated.', 'success');
                } else {
                    showPaymentStatus('Payment verification failed.', 'error');
                }
            },
            modal: {
                ondismiss: function() {
                    showPaymentStatus('Payment cancelled.', 'error');
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (err) {
        console.error(err);
        showPaymentStatus(err.message || 'Payment failed', 'error');
    }
    data.messages.push(newMsg);

function finalizeDonation({ name, amount, method, gatewayId, status }) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const id = gatewayId || 'D' + Math.floor(Math.random() * 10000);

    const data = getData();
    const newDonation = { id, name, amount: parseInt(amount), method, date, status: status || 'Success' };
    data.donations.push(newDonation);
    saveData(data);

    document.getElementById('receipt-name').innerText = name;
    document.getElementById('receipt-amount').innerText = amount;
    document.getElementById('receipt-date').innerText = date;
    document.getElementById('receipt-generated').innerText = now.toLocaleString();
    document.getElementById('receipt-id').innerText = id;
    document.getElementById('receipt-area').style.display = 'block';

    const form = document.getElementById('donation-form');
    if (form) form.style.display = 'none';
    renderDashboard();
}

function showPaymentStatus(message, type) {
    const banner = document.getElementById('payment-status');
    if (!banner) return;
    banner.textContent = message;
    banner.className = `status-banner ${type}`;
    banner.style.display = 'block';
}
    saveData(data);

    e.target.reset();
    alert('Thank you! We will get back to you shortly.');
    renderDashboard();
}

function deleteEvent(id) {
    if(!confirm('Delete this event?')) return;
    
    let data = getData();
    data.events = data.events.filter(e => e.id !== id);
    saveData(data);
    renderDashboard();
}

// Initial Render catch
document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    showSection('home');

    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme ? savedTheme : (prefersDark() ? 'dark' : 'light'));

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
        });
    });

    togglePaymentMethod();

    const chips = document.querySelectorAll('.chip');
    const amountInput = document.getElementById('don-amount');
    if (chips.length && amountInput) {
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                amountInput.value = chip.textContent.replace(/[^0-9]/g, '');
            });
        });
    }
});
