// --- API CONFIGURATION ---
// Backend hosted on Render.com
const API_BASE_URL = 'https://ooc-project.onrender.com';

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
const LANG_KEY = 'ooc-lang';

// Translations for EN + HI; keys fall back to stored original text when missing
const translations = {
    en: {},
    hi: {
        brandName: 'होप फाउंडेशन',
        navHome: 'होम',
        navAbout: 'हमारे बारे में',
        navPrograms: 'कार्यक्रम',
        navGallery: 'गैलरी',
        navImpact: 'प्रभाव',
        navEvents: 'ईवेंट्स',
        navStories: 'कहानियाँ',
        navVolunteer: 'स्वयंसेवक',
        navContact: 'संपर्क',
        navLogin: 'लॉगिन',
        navAdminLogin: 'एडमिन लॉगिन',
        navStaffLogin: 'स्टाफ लॉगिन',
        navDonate: 'दान करें',
        heroEyebrow: 'बच्चों के लिए विश्वसनीय एनजीओ',
        heroTitle: 'वंचित बच्चों को सीखने, बढ़ने और फलने-फूलने में सशक्त बनाना।',
        heroSubtitle: 'हम शिक्षा, पोषण और स्वास्थ्य कार्यक्रम चलाते हैं जो परिवारों और समुदायों के लिए मापने योग्य प्रभाव बनाते हैं।',
        heroDonate: 'अभी दान करें',
        heroVolunteer: 'स्वयंसेवक बनें',
        badgeVerified: 'सत्यापित एनजीओ',
        badgeReporting: 'प्रभाव रिपोर्टिंग',
        badgeReceipts: 'तुरंत रसीदें',
        statChildren: 'बच्चे शिक्षित',
        statPrograms: 'सामुदायिक कार्यक्रम',
        statTransparent: 'पारदर्शी निधि',
        missionTitle: 'हमारा मिशन',
        missionBody: 'हर बच्चे को गुणवत्तापूर्ण शिक्षा, पौष्टिक भोजन और सुरक्षित स्वास्थ्य सेवा सम्मान के साथ मिले।',
        missionMuted: 'हम स्थानीय समुदायों के साथ मिलकर दीर्घकालिक समाधान बनाते हैं और हर कार्यक्रम की पारदर्शी रिपोर्ट प्रकाशित करते हैं।',
        missionSnapshot: '2025 प्रभाव झलक',
        missionPoint1: '3,200 लर्निंग किट वितरित',
        missionPoint2: '1,500 स्वास्थ्य जांच पूरी',
        missionPoint3: '98% कार्यक्रम पूरा होने की दर',
        missionCTA: 'प्रभाव रिपोर्ट देखें',
        aboutTitle: 'होप फाउंडेशन के बारे में',
        aboutIntro: 'स्कूलों, शेल्टर और स्थानीय नेताओं के साथ मिलकर हर बच्चे को सम्मान के साथ सीखने, स्वस्थ रहने और बड़े सपने देखने में मदद करते हैं।',
        aboutWhoTitle: 'हम कौन हैं',
        aboutWhoBody: 'हम शिक्षकों, सामाजिक कार्यकर्ताओं और स्वयंसेवकों की टीम हैं जो समुदायों के साथ मिलकर कार्यक्रम बनाते हैं। हमारे केंद्र सीखने, पोषण ड्राइव और स्वास्थ्य शिविर चलाते हैं।',
        aboutWhoMuted: 'हर रुपया स्पष्ट परिणामों के खिलाफ ट्रैक किया जाता है—उपस्थिति, सीखने के स्तर, पोषण स्थिति और परिवार की भागीदारी—ताकि समर्थक प्रगति देखें।',
        aboutGuideTitle: 'हमें क्या मार्गदर्शन करता है',
        aboutGuide1: 'जहाँ संभव हो समुदाय-नेतृत्वित डिजाइन और महिला-नेतृत्वित संचालन।',
        aboutGuide2: 'डैशबोर्ड और ऑडिटेड रिपोर्ट के साथ पारदर्शी निधि।',
        aboutGuide3: 'बाल सुरक्षा, सम्मान और सभी क्षमताओं के लिए समावेशी कक्षाएँ।',
        aboutGuide4: 'बेसलाइन, फॉलो-अप और पार्टनर समीक्षा से मापा प्रभाव।',
        aboutDoTitle: 'हम हर सप्ताह क्या करते हैं',
        aboutDo1: '3–10 आयु के लिए कहानी-आधारित प्रारंभिक शिक्षा कोने।',
        aboutDo2: 'टीनएजर्स के लिए आफ्टर-स्कूल समर्थन, STEM क्लब, बोर्ड परीक्षा तैयारी।',
        aboutDo3: 'पौष्टिक भोजन, स्वास्थ्य जांच और मासिक स्वास्थ्य सत्र।',
        aboutDo4: 'लाइफ-स्किल्स, करियर मेंटरिंग और डिजिटल साक्षरता लैब।',
        aboutDo5: 'माता-पिता सर्कल जो देखभालकर्ताओं को सह-शिक्षक बनाते हैं।',
        aboutStat1: 'शहरी और अर्ध-शहरी क्षेत्रों में सक्रिय कार्यक्रम।',
        aboutStat2: 'फ्रंटलाइन शिक्षक, काउंसलर और सामुदायिक स्वयंसेवक।',
        aboutStat3: 'लर्निंग सेंटर्स में औसत मासिक उपस्थिति।',
        impactTitle: 'प्रभाव और रिपोर्ट',
        impactSubtitle: 'दान का उपयोग कैसे होता है और क्या परिणाम मिलते हैं, इसकी स्पष्ट जानकारी।',
        impactCard1: 'शिक्षा, स्वास्थ्य और पोषण पर उपयोग की गई कुल निधि।',
        impactCard2: 'सहयोगी स्कूल और सामुदायिक केंद्र समर्थित।',
        impactCard3: '12 महीनों में सुधार दिखाने वाले बच्चे।',
        impactCard4: '2025 में वितरित लर्निंग किट।',
        impactUtilTitle: 'कार्यक्रम उपयोग',
        impactUtilBody: 'योजना के लक्ष्य बनाम मासिक आवंटन प्रदर्शन।',
        impactUtilEdu: 'शिक्षा',
        impactUtilNut: 'पोषण',
        impactUtilHealth: 'स्वास्थ्य सेवा',
        impactHighlightsTitle: '2025 प्रभाव मुख्य बिंदु',
        impactHL1: 'सहयोगी स्कूलों में 98% उपस्थिति सुधार।',
        impactHL2: 'ग्रामीण समुदायों में 1,500 स्वास्थ्य जांच पूरी।',
        impactHL3: 'स्थानीय पहलों में 500+ स्वयंसेवक जुड़े।',
        impactHighlightsCTA: 'प्रभाव डैशबोर्ड देखें',
        eventsTitle: 'आगामी ईवेंट और घोषणाएँ',
        eventsSubtitle: 'हमारे आगामी सामुदायिक ईवेंट और पहलों से जुड़ें।',
        eventsColName: 'ईवेंट का नाम',
        eventsColDate: 'तारीख',
        eventsColDesc: 'विवरण',
        donateTitle: 'दान करें',
        donateSubtitle: 'आपका सहयोग जीवन बदलता है। सभी दान पर कर छूट।',
        donateName: 'दाता का नाम',
        donateAmount: 'राशि (रुपये)',
        donateMethod: 'भुगतान विधि',
        donateCTA: 'सुरक्षित दान करें',
        donateNote: 'तुरंत रसीद और ईमेल पुष्टिकरण।',
        program1Title: 'सभी के लिए शिक्षा',
        program1Desc: 'सड़क बच्चों के लिए किताबें, यूनिफॉर्म और ट्यूशन।',
        program2Title: 'स्वस्थ भोजन',
        program2Desc: 'कुपोषण से लड़ने के लिए दैनिक पौष्टिक भोजन।',
        program3Title: 'कौशल विकास',
        program3Desc: 'किशोरों के लिए व्यावसायिक प्रशिक्षण और नौकरी तैयारी।',
        program4Title: 'मेंटorship और ट्यूशन',
        program4Desc: 'एक-एक करके मार्गदर्शन और आफ्टर-स्कूल सहायता कार्यक्रम।',
        program5Title: 'सामुदायिक स्वास्थ्य सेवा',
        program5Desc: 'बच्चों और परिवारों के लिए स्वास्थ्य शिविर और रोकथाम देखभाल।',
        galleryTitle: 'गैलरी',
        gallerySubtitle: 'हमारे कार्यक्रमों और भागीदारों की झलक।',
        volunteerTitle: 'स्वयंसेवक बनें',
        volunteerSubtitle: 'परिवर्तन लाने वाली हमारी टीम से जुड़ें।',
        volunteerName: 'पूरा नाम',
        volunteerEmail: 'ईमेल',
        volunteerInterest: 'रुचियाँ',
        volunteerSubmit: 'आवेदन जमा करें'
    }
};

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

function applyLanguage(lang) {
    const dict = translations[lang] || {};
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.dataset.i18nOriginal) {
            el.dataset.i18nOriginal = el.innerHTML.trim();
        }
        const key = el.getAttribute('data-i18n');
        const translation = dict[key];
        if (translation) {
            const icon = el.querySelector('i');
            if (icon) {
                el.innerHTML = `${icon.outerHTML} ${translation}`;
            } else {
                el.textContent = translation;
            }
        } else if (el.dataset.i18nOriginal) {
            el.innerHTML = el.dataset.i18nOriginal;
        }
    });

    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    localStorage.setItem(LANG_KEY, lang);
}

function initLanguage() {
    const saved = localStorage.getItem(LANG_KEY) || 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.dataset.lang || 'en');
        });
    });
    applyLanguage(saved);
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
    } else if (sectionId === 'testimonials') {
        renderTestimonials();
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

    if (!window.Razorpay) {
        alert('Payments unavailable right now. Please try again later.');
        return;
    }

    const name = document.getElementById('don-name').value || 'Guest';
    const amount = parseFloat(document.getElementById('don-amount').value || '0');
    if (!amount || amount <= 0) {
        alert('Enter a valid amount.');
        return;
    }

    const donateBtn = e.target.querySelector('button[type="submit"]');
    if (donateBtn) {
        donateBtn.disabled = true;
        donateBtn.textContent = 'Processing...';
    }

    createRazorpayOrder({ amount, donorName: name })
        .then(order => {
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'Hope Foundation',
                description: 'Donation',
                order_id: order.orderId,
                prefill: {
                    name,
                    email: '',
                    contact: ''
                },
                theme: { color: '#2ecc71' },
                handler: function (response) {
                    recordDonationSuccess({
                        name,
                        amount,
                        method: 'Razorpay',
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id
                    });
                },
                modal: {
                    ondismiss: () => {
                        resetDonateButton(donateBtn);
                    }
                }
            };
            const rzp = new Razorpay(options);
            rzp.open();
        })
        .catch(() => {
            alert('Unable to start payment. Please try again.');
            resetDonateButton(donateBtn);
        });
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

async function createRazorpayOrder(payload) {
    const url = `${API_BASE_URL}/api/razorpay/create-order`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`order failed (${res.status}): ${text?.slice(0,120)}`);
    }
    try {
        return await res.json();
    } catch (err) {
        const text = await res.text().catch(() => '');
        throw new Error(`invalid JSON from server: ${text?.slice(0,120)}`);
    }
}

function recordDonationSuccess({ name, amount, method, paymentId, orderId }) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const data = getData();
    const newDonation = {
        id: paymentId || orderId || 'D' + Date.now(),
        name,
        amount: Number(amount),
        method,
        date
    };

    data.donations.push(newDonation);
    saveData(data);

    document.getElementById('receipt-name').innerText = name;
    document.getElementById('receipt-amount').innerText = amount;
    document.getElementById('receipt-date').innerText = date;
    document.getElementById('receipt-generated').innerText = now.toLocaleString();
    document.getElementById('receipt-id').innerText = paymentId || orderId || 'N/A';
    document.getElementById('receipt-area').style.display = 'block';

    const form = document.getElementById('donation-form');
    if (form) form.reset();

    const chips = document.querySelectorAll('.chip');
    chips.forEach(c => c.classList.remove('active'));
    const defaultMethod = document.querySelector('input[name="pay-method"][value="UPI"]');
    if (defaultMethod) defaultMethod.checked = true;
    togglePaymentMethod();

    const donateBtn = document.querySelector('#donation-form button[type="submit"]');
    resetDonateButton(donateBtn);

    alert('Thank you for your generous donation!');
}

function resetDonateButton(btn) {
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Donate Securely';
    }
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

function handleStaffLogin(e) {
    e.preventDefault();
    const user = document.getElementById('staff-user').value;
    const pass = document.getElementById('staff-pass').value;

    // Simple mock auth for staff
    if (user && pass) {
        alert('Staff login successful (demo)');
        showSection('home');
    } else {
        alert('Invalid staff credentials');
    }
}

function logout() {
    if(confirm('Are you sure you want to log out?')) {
        // Clear admin login state
        localStorage.removeItem('adminLoggedIn');
        // Clear hash from URL
        history.replaceState(null, '', window.location.pathname);
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
        const res = await fetch(`${API_BASE_URL}/api/create-order`, {
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
                const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
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
    
    // Check URL hash for admin-dashboard navigation from login
    const hash = window.location.hash;
    if (hash === '#admin-dashboard') {
        // Verify admin is logged in
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            showSection('admin-dashboard');
        } else {
            // Not logged in, redirect to login page
            window.location.href = 'portals/admin.html';
            return;
        }
    } else {
        showSection('home');
    }

    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav-links a');
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme ? savedTheme : (prefersDark() ? 'dark' : 'light'));
    initLanguage();

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
    
    // Initialize admin messaging if on admin dashboard
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        initAdminMessaging();
    }
});

/* =========================================== */
/* UNIFIED MESSAGING SYSTEM FOR ADMIN PORTAL  */
/* =========================================== */
const UNIFIED_MSG_STORAGE = 'ooc_portal_messages_v1';
const UNIFIED_DIRECTORY_STORAGE = 'ooc_portal_directory_v1';

const ADMIN_USER = {
    userId: 'ADMIN',
    displayName: 'Admin',
    role: 'admin',
    department: 'management',
    email: 'admin@hope.org'
};

function loadUnifiedMessages() {
    try {
        const raw = localStorage.getItem(UNIFIED_MSG_STORAGE);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveUnifiedMessages(messages) {
    localStorage.setItem(UNIFIED_MSG_STORAGE, JSON.stringify(messages));
}

function loadUnifiedDirectory() {
    try {
        const raw = localStorage.getItem(UNIFIED_DIRECTORY_STORAGE);
        if (raw) return JSON.parse(raw);
    } catch {}
    
    // Default directory
    const defaultDir = [
        { userId: 'ADMIN', displayName: 'Admin', role: 'admin', department: 'management', email: 'admin@hope.org' },
        { userId: 'TCH-101', displayName: 'Demo Teacher', role: 'teacher', department: 'education', email: 'teacher@hope.org' },
        { userId: 'EVT-201', displayName: 'Events Desk', role: 'events', department: 'events', email: 'events@hope.org' },
        { userId: 'MGT-401', displayName: 'Management', role: 'management', department: 'management', email: 'management@hope.org' },
        { userId: 'FND-301', displayName: 'Fundraising', role: 'fundraiser', department: 'fundraising', email: 'fundraise@hope.org' }
    ];
    localStorage.setItem(UNIFIED_DIRECTORY_STORAGE, JSON.stringify(defaultDir));
    return defaultDir;
}

function getAdminInbox() {
    const messages = loadUnifiedMessages();
    return messages.filter(m => {
        if (!m.recipientTokens) return false;
        return m.recipientTokens.some(t => 
            t === 'all' || 
            t === 'admin' ||
            t === `user:ADMIN` ||
            t === 'role:admin' ||
            t === 'role:management'
        );
    }).filter(m => m.from?.userId !== 'ADMIN')  // Exclude self-sent
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAdminSent() {
    const messages = loadUnifiedMessages();
    return messages.filter(m => m.from?.userId === 'ADMIN')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function formatAdminMsgDate(isoStr) {
    const d = new Date(isoStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString();
}

function escAdminHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function showAdminMsgPanel(panelId) {
    // Hide all panels
    document.querySelectorAll('.admin-msg-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.admin-msg-nav-item').forEach(n => n.classList.remove('active'));
    
    // Show selected panel
    const panel = document.getElementById('admin-panel-' + panelId);
    if (panel) panel.style.display = 'block';
    
    // Highlight nav item
    const navItem = document.querySelector(`.admin-msg-nav-item[onclick="showAdminMsgPanel('${panelId}')"]`);
    if (navItem) navItem.classList.add('active');
    
    // Render content
    if (panelId === 'inbox') renderAdminInbox();
    if (panelId === 'sent') renderAdminSent();
    if (panelId === 'directory') renderAdminDirectory();
}

function renderAdminInbox() {
    const inbox = getAdminInbox();
    const listEl = document.getElementById('admin-inbox-list');
    const badge = document.getElementById('adminUnreadBadge');
    
    const readKey = 'ooc_admin_read_messages';
    const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');
    const unreadCount = inbox.filter(m => !readIds.includes(m.id)).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
    
    if (!inbox.length) {
        listEl.innerHTML = '<div class="admin-msg-empty"><i class="fas fa-inbox" style="font-size:2rem;margin-bottom:0.5rem;color:#94a3b8;"></i><br>No messages in inbox</div>';
        return;
    }
    
    listEl.innerHTML = inbox.map(m => {
        const isUnread = !readIds.includes(m.id);
        const preview = m.body.length > 100 ? m.body.slice(0, 100) + '…' : m.body;
        const senderName = m.from?.displayName || 'Unknown';
        const senderRole = m.from?.role ? ` (${m.from.role})` : '';
        return `
            <div class="admin-msg-item ${isUnread ? 'unread' : ''}" onclick="openAdminMessage('${m.id}')">
                <div class="admin-msg-avatar">${escAdminHtml(senderName.charAt(0))}</div>
                <div class="admin-msg-body">
                    <div class="admin-msg-top">
                        <span class="admin-msg-from">${escAdminHtml(senderName)}${senderRole}</span>
                        <span class="admin-msg-date">${formatAdminMsgDate(m.createdAt)}</span>
                    </div>
                    <div class="admin-msg-subject">${escAdminHtml(m.subject)}</div>
                    <div class="admin-msg-preview">${escAdminHtml(preview)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminSent() {
    const sent = getAdminSent();
    const listEl = document.getElementById('admin-sent-list');
    
    if (!sent.length) {
        listEl.innerHTML = '<div class="admin-msg-empty"><i class="fas fa-paper-plane" style="font-size:2rem;margin-bottom:0.5rem;color:#94a3b8;"></i><br>No sent messages</div>';
        return;
    }
    
    listEl.innerHTML = sent.map(m => {
        const preview = m.body.length > 100 ? m.body.slice(0, 100) + '…' : m.body;
        return `
            <div class="admin-msg-item" onclick="openAdminMessage('${m.id}', 'sent')">
                <div class="admin-msg-avatar" style="background:#3498db;">→</div>
                <div class="admin-msg-body">
                    <div class="admin-msg-top">
                        <span class="admin-msg-from">To: ${escAdminHtml(formatAdminRecipients(m.recipientTokens))}</span>
                        <span class="admin-msg-date">${formatAdminMsgDate(m.createdAt)}</span>
                    </div>
                    <div class="admin-msg-subject">${escAdminHtml(m.subject)}</div>
                    <div class="admin-msg-preview">${escAdminHtml(preview)}</div>
                </div>
            </div>
        `;
    }).join('');
}

function formatAdminRecipients(tokens) {
    if (!tokens || !tokens.length) return '—';
    const labels = {
        'all': 'Everyone',
        'admin': 'Admin',
        'role:user': 'All Users',
        'role:staff': 'All Staff',
        'role:teacher': 'All Teachers',
        'role:events': 'Events Team',
        'role:management': 'Management',
        'role:fundraiser': 'Fundraising Team'
    };
    return tokens.map(t => labels[t] || t).join(', ');
}

function renderAdminDirectory() {
    const directory = loadUnifiedDirectory();
    const listEl = document.getElementById('admin-directory-list');
    
    // Group by role
    const grouped = {};
    directory.forEach(u => {
        const role = u.role || 'other';
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(u);
    });
    
    const roleLabels = {
        admin: 'Administrators',
        teacher: 'Teachers',
        events: 'Events Team',
        management: 'Management',
        fundraiser: 'Fundraising',
        staff: 'Staff',
        user: 'Users',
        other: 'Other'
    };
    
    let html = '';
    for (const [role, users] of Object.entries(grouped)) {
        if (role === 'admin') continue; // Don't show admin to themselves
        html += `<div class="admin-dir-section"><h4>${roleLabels[role] || role}</h4>`;
        users.forEach(u => {
            html += `
                <div class="admin-dir-item">
                    <div class="admin-dir-avatar">${escAdminHtml(u.displayName?.charAt(0) || '?')}</div>
                    <div class="admin-dir-info">
                        <div class="admin-dir-name">${escAdminHtml(u.displayName)}</div>
                        <div class="admin-dir-meta">${escAdminHtml(u.email || u.userId)}</div>
                    </div>
                    <button class="btn btn-sm btn-secondary" onclick="composeToAdmin('user:${u.userId}', '${escAdminHtml(u.displayName)}')"><i class="fas fa-envelope"></i></button>
                </div>
            `;
        });
        html += '</div>';
    }
    
    listEl.innerHTML = html || '<div class="admin-msg-empty">No directory entries</div>';
}

function composeToAdmin(recipientToken, name) {
    document.getElementById('adminMsgTo').value = recipientToken;
    document.getElementById('adminMsgSubject').value = '';
    document.getElementById('adminMsgBody').value = '';
    showAdminMsgPanel('compose');
}

function openAdminMessage(msgId, context = 'inbox') {
    const messages = loadUnifiedMessages();
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    
    // Mark as read if inbox
    if (context === 'inbox') {
        const readKey = 'ooc_admin_read_messages';
        const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');
        if (!readIds.includes(msgId)) {
            readIds.push(msgId);
            localStorage.setItem(readKey, JSON.stringify(readIds));
        }
    }
    
    const detailEl = document.getElementById('admin-msg-detail-content');
    const senderName = msg.from?.displayName || 'Unknown';
    const senderRole = msg.from?.role ? ` (${msg.from.role})` : '';
    
    detailEl.innerHTML = `
        <div style="border-bottom:1px solid #e2e8f0;padding-bottom:1rem;margin-bottom:1rem;">
            <h3 style="margin:0 0 0.5rem;">${escAdminHtml(msg.subject)}</h3>
            <div style="color:#64748b;font-size:0.9rem;">
                <strong>From:</strong> ${escAdminHtml(senderName)}${senderRole}<br>
                <strong>Date:</strong> ${new Date(msg.createdAt).toLocaleString()}<br>
                <strong>To:</strong> ${escAdminHtml(formatAdminRecipients(msg.recipientTokens))}
            </div>
        </div>
        <div style="white-space:pre-wrap;line-height:1.7;">${escAdminHtml(msg.body)}</div>
        ${context === 'inbox' && msg.from?.userId ? `
            <button class="btn btn-primary" style="margin-top:1.5rem;" onclick="replyToAdminMessage('${msg.from.userId}', '${escAdminHtml(msg.subject)}')">
                <i class="fas fa-reply"></i> Reply
            </button>
        ` : ''}
    `;
    
    showAdminMsgPanel('detail');
    renderAdminInbox(); // Update unread count
}

function replyToAdminMessage(toUserId, subject) {
    document.getElementById('adminMsgTo').innerHTML = `
        <option value="">Select recipient...</option>
        <option value="user:${toUserId}" selected>Reply to sender</option>
        <option value="all">Everyone (Broadcast)</option>
        <option value="role:user">All Users</option>
        <option value="role:staff">All Staff</option>
        <option value="role:teacher">All Teachers</option>
        <option value="role:events">Events Team</option>
        <option value="role:management">Management</option>
        <option value="role:fundraiser">Fundraising Team</option>
    `;
    document.getElementById('adminMsgTo').value = 'user:' + toUserId;
    document.getElementById('adminMsgSubject').value = subject.startsWith('Re:') ? subject : 'Re: ' + subject;
    document.getElementById('adminMsgBody').value = '';
    showAdminMsgPanel('compose');
}

function handleAdminSendMessage(event) {
    event.preventDefault();
    
    const to = document.getElementById('adminMsgTo').value;
    const subject = document.getElementById('adminMsgSubject').value.trim();
    const body = document.getElementById('adminMsgBody').value.trim();
    
    if (!to || !subject || !body) {
        alert('Please fill all fields');
        return;
    }
    
    const messages = loadUnifiedMessages();
    const newMsg = {
        id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        from: ADMIN_USER,
        recipientTokens: [to],
        subject,
        body,
        createdAt: new Date().toISOString()
    };
    
    messages.push(newMsg);
    saveUnifiedMessages(messages);
    
    // Also update directory with the recipient if it's a specific user
    if (to.startsWith('user:')) {
        const userId = to.replace('user:', '');
        const directory = loadUnifiedDirectory();
        if (!directory.find(d => d.userId === userId)) {
            directory.push({
                userId,
                displayName: userId,
                role: 'user',
                email: ''
            });
            localStorage.setItem(UNIFIED_DIRECTORY_STORAGE, JSON.stringify(directory));
        }
    }
    
    // Reset form
    document.getElementById('adminComposeForm').reset();
    
    // Reset recipient dropdown
    document.getElementById('adminMsgTo').innerHTML = `
        <option value="">Select recipient...</option>
        <option value="all">Everyone (Broadcast)</option>
        <option value="role:user">All Users</option>
        <option value="role:staff">All Staff</option>
        <option value="role:teacher">All Teachers</option>
        <option value="role:events">Events Team</option>
        <option value="role:management">Management</option>
        <option value="role:fundraiser">Fundraising Team</option>
    `;
    
    alert('Message sent successfully!');
    showAdminMsgPanel('sent');
}

function initAdminMessaging() {
    // Load inbox on dashboard load
    setTimeout(() => {
        if (document.getElementById('admin-inbox-list')) {
            renderAdminInbox();
        }
    }, 100);
}

// --- FEEDBACK & TESTIMONIALS ---
const defaultTestimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        role: 'Student',
        city: 'Delhi',
        message: 'Thanks to Hope Foundation\'s scholarship, I was able to continue my studies. Now I want to become a teacher myself!',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop'
    },
    {
        id: 2,
        name: 'Rajesh Kumar',
        role: 'Volunteer',
        city: 'Mumbai',
        message: 'Being part of this mission has been transformative. Seeing the kids\' smiles makes every hour worthwhile.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'
    },
    {
        id: 3,
        name: 'Anjali Verma',
        role: 'Parent',
        city: 'Bangalore',
        message: 'My daughter now has regular meals and attends school daily. The change is visible in her confidence and performance.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop'
    }
];

const randomAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop'
];

function getRandomAvatar() {
    return randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
}

function getStarsHtml(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function renderTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    
    // Get user feedbacks from localStorage
    const userFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    // Combine default testimonials with user feedbacks
    const allTestimonials = [...defaultTestimonials, ...userFeedbacks];
    
    grid.innerHTML = '';
    
    allTestimonials.forEach(t => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <div class="testimonial-header">
                <img src="${t.image || getRandomAvatar()}" alt="${t.name}">
                <div>
                    <h4>${t.name}</h4>
                    <p class="muted">${t.role}, ${t.city}</p>
                </div>
            </div>
            <p>"${t.message}"</p>
            <div class="stars">${getStarsHtml(t.rating)}</div>
        `;
        grid.appendChild(card);
    });
}

function setRating(rating) {
    document.getElementById('feedback-rating').value = rating;
    const stars = document.querySelectorAll('.rating-stars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitFeedback(e) {
    e.preventDefault();
    
    const name = document.getElementById('feedback-name').value;
    const role = document.getElementById('feedback-role').value;
    const city = document.getElementById('feedback-city').value;
    const rating = document.getElementById('feedback-rating').value;
    const message = document.getElementById('feedback-message').value;
    
    if (rating === '0') {
        alert('Please select a rating');
        return;
    }
    
    // Save feedback to localStorage
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.push({
        id: Date.now(),
        name,
        role,
        city,
        rating: parseInt(rating),
        message,
        image: getRandomAvatar(),
        date: new Date().toISOString()
    });
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    // Reset form
    e.target.reset();
    setRating(0);
    
    // Re-render testimonials
    renderTestimonials();
    
    // Show success
    alert('Thank you for sharing your story! It has been added to our Success Stories.');
    
    // Scroll to testimonials grid
    document.getElementById('testimonials-grid').scrollIntoView({ behavior: 'smooth' });
}
