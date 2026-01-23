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
    }
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
        utilizationRatios: current.utilizationRatios || seed.utilizationRatios || initialData.utilizationRatios
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
    const method = document.getElementById('don-method').value;
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
