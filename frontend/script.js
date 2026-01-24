// --- API CONFIGURATION ---
// Backend hosted on Render.com
const API_BASE_URL = 'https://ooc-project-2-1.onrender.com';

// --- XSS SECURITY ---
// Escape HTML special characters to prevent XSS attacks
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;');
}

// Sanitize URLs to prevent javascript: and data: XSS
function sanitizeUrl(url) {
    if (!url) return '';
    const sanitized = String(url).trim();
    // Only allow http, https, and relative URLs
    if (sanitized.match(/^(https?:\/\/|\/|#|\.\/|\.\.\/)/i)) {
        return escapeHtml(sanitized);
    }
    // Block javascript:, data:, vbscript:, etc.
    if (sanitized.match(/^[a-z]+:/i)) {
        console.warn('Blocked potentially dangerous URL:', sanitized);
        return '';
    }
    return escapeHtml(sanitized);
}

// Sanitize and validate input data
function sanitizeInput(input, maxLength = 1000) {
    if (!input) return '';
    return escapeHtml(String(input).trim().slice(0, maxLength));
}

// --- MOCK DATABASE ---
const initialData = {
    donations: [
        { id: 'D001', name: 'Rohan Sharma', amount: 5000, method: 'UPI (Razorpay)', date: '2023-10-15', paymentId: 'pay_NxK7GhKlMn012', orderId: 'order_NxK7GhKlMn012', timestamp: '2023-10-15T10:30:00' },
        { id: 'D002', name: 'Alice Smith', amount: 12000, method: 'Card (Razorpay)', date: '2023-10-18', paymentId: 'pay_NyL8HiLmNo345', orderId: 'order_NyL8HiLmNo345', timestamp: '2023-10-18T14:45:00' },
        { id: 'D003', name: 'Tech Corp Inc.', amount: 50000, method: 'Bank Transfer', date: '2023-10-20', paymentId: '', orderId: '', timestamp: '2023-10-20T09:15:00' },
        { id: 'D004', name: 'Priya Verma', amount: 2500, method: 'UPI (Razorpay)', date: '2023-11-05', paymentId: 'pay_NzM9IjMnOp678', orderId: 'order_NzM9IjMnOp678', timestamp: '2023-11-05T16:20:00' },
        { id: 'D005', name: 'Rajesh Kumar', amount: 8000, method: 'Card (Razorpay)', date: '2023-11-12', paymentId: 'pay_OaN0JkNoQr901', orderId: 'order_OaN0JkNoQr901', timestamp: '2023-11-12T11:00:00' },
    ],
    disbursements: [
        { id: 'DIS001', recipient: 'Sunrise Public School', amount: 15000, category: 'Education', description: 'Monthly scholarship disbursement', date: '2023-10-25', timestamp: '2023-10-25T10:00:00' },
        { id: 'DIS002', recipient: 'Seva Nutrition Center', amount: 8000, category: 'Nutrition', description: 'Weekly meal program funding', date: '2023-11-01', timestamp: '2023-11-01T14:30:00' },
        { id: 'DIS003', recipient: 'Asha Health Clinic', amount: 5000, category: 'Healthcare', description: 'Medical supplies for health camp', date: '2023-11-08', timestamp: '2023-11-08T09:45:00' },
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
        
        // Impact KPI Cards
        impactFunds: '₹2.8करोड़',
        impactFundsDesc: 'शिक्षा, स्वास्थ्य और पोषण पर उपयोग की गई कुल निधि।',
        impactSchools: '120+',
        impactSchoolsDesc: 'सहयोगी स्कूल और सामुदायिक केंद्र समर्थित।',
        impactImprovement: '86%',
        impactImprovementDesc: '12 महीनों में सुधार दिखाने वाले बच्चे।',
        impactKitsNum: '3,200',
        impactKitsDesc: '2025 में वितरित लर्निंग किट।',
        
        // Program Utilization
        programUtilization: 'कार्यक्रम उपयोग',
        programUtilizationDesc: 'नियोजित लक्ष्यों के मुकाबले मासिक आवंटन प्रदर्शन।',
        metricEducation: 'शिक्षा',
        metricNutrition: 'पोषण',
        metricHealthcare: 'स्वास्थ्य सेवा',
        
        // Reports
        reportAnnual: 'वार्षिक प्रभाव रिपोर्ट 2025',
        reportAnnualDesc: 'कार्यक्रम मुख्य बिंदु, ऑडिट उपयोग, और परिणाम।',
        downloadPDF: 'PDF डाउनलोड करें',
        reportFinancial: 'वित्तीय पारदर्शिता सारांश',
        reportFinancialDesc: 'निधि आवंटन और परिचालन लागत का विवरण।',
        viewSummary: 'सारांश देखें',
        reportCaseStudies: 'बाल विकास केस स्टडीज़',
        reportCaseStudiesDesc: 'कहानियाँ जो मापने योग्य प्रभाव और विकास दिखाती हैं।',
        readStories: 'कहानियाँ पढ़ें',
        
        // Transparency Card
        donationGoesTitle: 'आपका दान कहाँ जाता है',
        donationGoesDesc: 'साझेदार संस्थानों में लाइव वितरण।',
        totalAllocated: 'कुल आवंटित: 0%',
        
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
        volunteerSubmit: 'आवेदन जमा करें',
        
        // Mission Section
        missionDesc: 'हर बच्चे को गुणवत्तापूर्ण शिक्षा, पौष्टिक भोजन और सुरक्षित स्वास्थ्य सेवा सम्मान के साथ मिले।',
        missionSubtext: 'हम स्थानीय समुदायों के साथ मिलकर दीर्घकालिक समाधान बनाते हैं और हर कार्यक्रम की पारदर्शी रिपोर्ट प्रकाशित करते हैं।',
        impactSnapshot: '2025 प्रभाव झलक',
        impactKits: '3,200 लर्निंग किट वितरित',
        impactHealth: '1,500 स्वास्थ्य जांच पूरी',
        impactRate: '98% कार्यक्रम पूरा होने की दर',
        viewImpact: 'प्रभाव रिपोर्ट देखें',
        
        // Contact Section
        contactTitle: 'संपर्क करें',
        contactSubtitle: 'हम आपसे सुनना चाहते हैं। साझेदारी, स्वयंसेवा या दान के लिए संपर्क करें।',
        contactOffice: 'मुख्य कार्यालय',
        contactAddress: 'होप फाउंडेशन, 112 कम्युनिटी लेन, नई दिल्ली, भारत',
        contactEmail: 'ईमेल',
        contactPhone: 'फोन:',
        contactHours: 'सोम–शुक्र, सुबह 9:00 – शाम 6:00',
        contactFormTitle: 'संदेश भेजें',
        contactName: 'नाम',
        contactMessage: 'संदेश',
        contactSend: 'संदेश भेजें',
        
        // Testimonials/Stories Section
        storiesTitle: 'सफलता की कहानियाँ',
        storiesSubtitle: 'हमारे समुदाय सदस्यों और स्वयंसेवकों का वास्तविक प्रभाव।',
        shareStory: 'अपनी कहानी साझा करें',
        shareStorySubtitle: 'होप फाउंडेशन के साथ अपने अनुभव के बारे में हम सुनना चाहते हैं।',
        yourName: 'आपका नाम',
        yourRole: 'आपकी भूमिका',
        yourCity: 'शहर',
        rating: 'रेटिंग',
        yourStory: 'आपकी कहानी',
        submitStory: 'अपनी कहानी सबमिट करें',
        
        // Footer
        footerSince: '2012 से',
        footerBrand: 'होप फाउंडेशन',
        footerDesc: 'शिक्षा, पोषण, स्वास्थ्य सेवा और पारिवारिक सहायता के माध्यम से वंचित बच्चों को सशक्त बनाना—पारदर्शी रिपोर्टिंग द्वारा समर्थित।',
        footerCities: '12 शहर',
        footerFacilitators: '86 सुविधाकर्ता',
        footerAttendance: '92% उपस्थिति',
        footerQuickLinks: 'त्वरित लिंक',
        footerContact: 'संपर्क',
        footerReady: 'मदद के लिए तैयार?',
        footerReadyDesc: 'आपका सहयोग लर्निंग किट, भोजन और स्वास्थ्य शिविरों को निधि देता है। हर योगदान रसीद के साथ रिपोर्ट किया जाता है।',
        footerDonate: 'अभी दान करें',
        footerCopyright: '© 2026 होप फाउंडेशन। सर्वाधिकार सुरक्षित।',
        
        // Admin/Login
        adminLoginTitle: 'एडमिन लॉगिन',
        adminUsername: 'यूज़रनेम',
        adminPassword: 'पासवर्ड',
        loginBtn: 'लॉगिन',
        closeBtn: 'बंद करें',
        backToHome: 'होम पर वापस जाएं',
        
        // Programs Section
        programsTitle: 'हमारे कार्यक्रम',
        
        // Events Section
        newslettersTitle: 'समाचार पत्र',
        newslettersSubtitle: 'हमारे मासिक समाचार पत्र और प्रभाव कहानियों से अपडेट रहें।',
        pastEventsTitle: 'पिछले ईवेंट',
        pastEventsSubtitle: 'हमारे पिछले सामुदायिक ईवेंट और पहलों की झलकियाँ।',
        
        // Gallery
        galleryCreative: 'रचनात्मक कार्यशालाएँ',
        galleryLearning: 'लर्निंग सेंटर',
        galleryNutrition: 'पोषण अभियान',
        galleryHealth: 'स्वास्थ्य शिविर',
        galleryVolunteer: 'स्वयंसेवक दिवस',
        galleryLibrary: 'पुस्तकालय समय',
        galleryCommunity: 'सामुदायिक आउटरीच',
        galleryAfterSchool: 'आफ्टर-स्कूल गतिविधियाँ',
        
        // Volunteer Form Options
        volunteerTeaching: 'शिक्षण',
        volunteerEvent: 'ईवेंट प्रबंधन',
        volunteerFund: 'फंडरेजिंग',
        
        // Donate Form
        donateDonorName: 'दाता का नाम',
        donatePaymentMethod: 'भुगतान विधि',
        donateSecurely: 'सुरक्षित दान करें',
        
        // Contact Form Labels
        contactHeadOffice: 'मुख्य कार्यालय',
        contactEmailLabel: 'ईमेल:',
        contactPhoneLabel: 'फोन:',
        contactHoursLabel: 'कार्य समय:',
        
        // Feedback Form
        feedbackName: 'आपका नाम',
        feedbackRole: 'आपकी भूमिका',
        feedbackCity: 'शहर',
        feedbackRating: 'रेटिंग',
        feedbackMessage: 'आपकी कहानी',
        feedbackSubmit: 'अपनी कहानी सबमिट करें',
        shareStoryTitle: 'अपनी कहानी साझा करें'
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
        disbursements: current.disbursements?.length ? current.disbursements : seed.disbursements || initialData.disbursements,
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
    
    // Handle toggle switch for EN/HI
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        // Set initial state based on saved preference
        langToggle.checked = saved === 'hi';
        
        langToggle.addEventListener('change', () => {
            const newLang = langToggle.checked ? 'hi' : 'en';
            applyLanguage(newLang);
        });
    }
    
    // Also handle button-based language switching if present
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.dataset.lang || 'en');
            // Update toggle switch if present
            if (langToggle) {
                langToggle.checked = btn.dataset.lang === 'hi';
            }
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

// Helper function to preload a single image
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Helper function to get all gallery image URLs
function getGalleryImageUrls() {
    const gallerySection = document.getElementById('gallery');
    if (!gallerySection) return [];
    
    const imageCards = gallerySection.querySelectorAll('.image-card');
    const urls = [];
    
    imageCards.forEach(card => {
        const style = card.style.backgroundImage;
        const match = style.match(/url\(['"]?([^'"\)]+)['"]?\)/);
        if (match && match[1]) {
            urls.push(match[1]);
        }
    });
    
    return urls;
}

// Async function to preload all gallery images
async function preloadGalleryImages() {
    const imageUrls = getGalleryImageUrls();
    if (imageUrls.length === 0) return;
    
    const loadPromises = imageUrls.map(url => preloadImage(url));
    
    try {
        await Promise.all(loadPromises);
        console.log('All gallery images loaded successfully');
    } catch (error) {
        console.warn('Some gallery images failed to load:', error.message);
    }
}

// Show loading overlay
function showLoadingOverlay() {
    // Create overlay if it doesn't exist
    let overlay = document.getElementById('gallery-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gallery-loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading gallery images...</p>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            gap: 1rem;
        `;
        
        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary, #2ecc71);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            #gallery-loading-overlay p {
                font-size: 1.1rem;
                color: #555;
                margin: 0;
            }
            [data-theme="dark"] #gallery-loading-overlay {
                background: rgba(30, 30, 30, 0.95);
            }
            [data-theme="dark"] #gallery-loading-overlay p {
                color: #ccc;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('gallery-loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Main showSection function with async support for gallery
async function showSection(sectionId) {
    // Special handling for gallery - preload images first
    if (sectionId === 'gallery') {
        showLoadingOverlay();
        await preloadGalleryImages();
        hideLoadingOverlay();
    }
    
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
                <td>${escapeHtml(evt.title)}</td>
                <td>${escapeHtml(evt.date)}</td>
                <td>${escapeHtml(evt.desc)}</td>
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
                    <h4>${escapeHtml(inst.name)}</h4>
                    <p class="muted">${escapeHtml(inst.city)} • ${escapeHtml(inst.sector)}</p>
                </div>
                <span class="pill">${escapeHtml(inst.allocation)}%</span>
            </div>
            <p>${escapeHtml(inst.impact)}</p>
            <div class="inst-bar"><span style="width:${Number(inst.allocation) || 0}%;"></span></div>
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
        donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to payment...';
    }

    // Get selected payment method from form (UPI or Card)
    const selectedMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'UPI';
    
    createRazorpayOrder({ amount, donorName: name })
        .then(order => {
            if (donateBtn) {
                donateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening payment...';
            }
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
                    // Determine the payment method from Razorpay response or use selected method
                    const paymentMethod = selectedMethod === 'Card' ? 'Card (Razorpay)' : 'UPI (Razorpay)';
                    recordDonationSuccess({
                        name,
                        amount,
                        method: paymentMethod,
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
        .catch((err) => {
            console.error('Payment initialization error:', err);
            // Check if it's a network/backend issue
            if (err.message && err.message.includes('Failed to fetch')) {
                alert('Unable to connect to payment server. The server might be waking up - please try again in a few seconds.');
            } else {
                alert('Unable to start payment. Please try again in a moment.');
            }
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

async function createRazorpayOrder(payload, retryCount = 0) {
    const url = `${API_BASE_URL}/api/razorpay/create-order`;
    const maxRetries = 2;
    
    try {
        // First, wake up the backend if it's sleeping (Render free tier)
        if (retryCount === 0) {
            try {
                await fetch(`${API_BASE_URL}/api/health`, { 
                    method: 'GET',
                    mode: 'cors'
                });
            } catch (e) {
                // Backend might be waking up, wait a moment
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'cors'
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error('Order creation failed:', res.status, text);
            throw new Error(`Order failed (${res.status}): ${text?.slice(0,120)}`);
        }
        
        return await res.json();
    } catch (err) {
        console.error('Razorpay order error (attempt ' + (retryCount + 1) + '):', err);
        
        // Retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
            console.log('Retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return createRazorpayOrder(payload, retryCount + 1);
        }
        
        throw err;
    }
}

function recordDonationSuccess({ name, amount, method, paymentId, orderId }) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const timestamp = now.toISOString();
    const data = getData();
    const newDonation = {
        id: paymentId || orderId || 'D' + Date.now(),
        name,
        amount: Number(amount),
        method,
        date,
        timestamp,
        paymentId: paymentId || '',
        orderId: orderId || ''
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
    
    // Initialize tasks and shifts when those tabs are shown
    if (tabId === 'dash-tasks') {
        renderTasksList();
    } else if (tabId === 'dash-shifts') {
        renderShiftsGrid();
    } else if (tabId === 'dash-audit') {
        renderAuditLog();
    }
}

function renderDashboard() {
    const data = getData();
    
    // Ensure disbursements array exists
    if (!data.disbursements) {
        data.disbursements = initialData.disbursements || [];
        saveData(data);
    }

    // 1. Overview Stats
    const totalFunds = data.donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDisbursed = (data.disbursements || []).reduce((sum, d) => sum + d.amount, 0);
    const balanceFunds = totalFunds - totalDisbursed;
    
    document.getElementById('total-funds').innerText = totalFunds.toLocaleString();
    document.getElementById('volunteer-count').innerText = data.volunteers.length;
    document.getElementById('total-disbursed').innerText = totalDisbursed.toLocaleString();
    document.getElementById('balance-funds').innerText = balanceFunds.toLocaleString();
    
    // Render recent audit in overview
    renderRecentAudit(data);

    // 2. Donations Table
    const donBody = document.getElementById('donations-table-body');
    donBody.innerHTML = '';
    
    // Sort by date desc
    const sortedDonations = [...data.donations].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sortedDonations.forEach(d => {
        // Display payment ID if available (for Razorpay/Online payments)
        const paymentIdDisplay = d.paymentId ? `<span class="payment-id" title="${escapeHtml(d.paymentId)}">${escapeHtml(d.paymentId.substring(0, 12))}...</span>` : escapeHtml(d.id || 'N/A');
        const methodClass = (d.method || 'Other').toLowerCase().replace(/[^a-z]/g, '');
        const row = `<tr>
            <td>${escapeHtml(d.name)}</td>
            <td>₹${Number(d.amount).toLocaleString()}</td>
            <td><span class="method-badge method-${methodClass}">${escapeHtml(d.method || 'Other')}</span></td>
            <td>${escapeHtml(d.date)}</td>
            <td>${paymentIdDisplay}</td>
        </tr>`;
        donBody.innerHTML += row;
    });

    // 3. Volunteers Table
    const volBody = document.getElementById('volunteers-table-body');
    volBody.innerHTML = '';

    data.volunteers.forEach(v => {
        const statusClass = (v.status || '').toLowerCase();
        const row = `<tr>
            <td>${escapeHtml(v.name)}</td>
            <td>${escapeHtml(v.email)}</td>
            <td>${escapeHtml(v.interest)}</td>
            <td><span class="status-${statusClass}">${escapeHtml(v.status)}</span></td>
            <td>
                ${v.status === 'Pending' ? `<button onclick="approveVolunteer('${escapeHtml(v.id)}')" style="cursor:pointer; color:green; background:none; border:none;">Approve</button>` : ''}
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
                <td>${escapeHtml(evt.title)}</td>
                <td>${escapeHtml(evt.date)}</td>
                <td><button onclick="deleteEvent('${escapeHtml(evt.id)}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button></td>
            </tr>`;
            evtBody.innerHTML += row;
        });
    }

    hydrateAllocationForm(data);
    renderCharts(data);
    renderInstitutionsAdmin(data);
    renderMessagesAdmin(data);
}

// ===== AUDIT LOG FUNCTIONS =====

function renderRecentAudit(data) {
    const recentAuditBody = document.getElementById('recent-audit-body');
    if (!recentAuditBody) return;
    
    const allTransactions = getAuditTransactions(data);
    const recentTransactions = allTransactions.slice(0, 5); // Show only 5 most recent
    
    recentAuditBody.innerHTML = '';
    
    if (recentTransactions.length === 0) {
        recentAuditBody.innerHTML = '<tr><td colspan="4" class="muted">No transactions yet.</td></tr>';
        return;
    }
    
    recentTransactions.forEach(t => {
        const typeClass = t.type === 'credit' ? 'credit' : 'debit';
        const typeIcon = t.type === 'credit' ? '↓' : '↑';
        const amountPrefix = t.type === 'credit' ? '+' : '-';
        const row = `<tr>
            <td><span class="type-badge ${typeClass}">${typeIcon} ${t.type === 'credit' ? 'Credit' : 'Debit'}</span></td>
            <td>${escapeHtml(t.description)}</td>
            <td style="color: ${t.type === 'credit' ? '#16a34a' : '#dc2626'}; font-weight: 600;">${amountPrefix}₹${Number(t.amount).toLocaleString()}</td>
            <td class="timestamp">${formatDateTime(t.timestamp)}</td>
        </tr>`;
        recentAuditBody.innerHTML += row;
    });
}

function getAuditTransactions(data) {
    const transactions = [];
    
    // Add donations as credits
    (data.donations || []).forEach(d => {
        transactions.push({
            id: d.id || d.paymentId || 'D' + Date.now(),
            type: 'credit',
            description: `Donation from ${d.name}`,
            category: d.method || 'Donation',
            amount: d.amount,
            date: d.date,
            timestamp: d.timestamp || d.date + 'T00:00:00',
            reference: d.paymentId || d.orderId || '-'
        });
    });
    
    // Add disbursements as debits
    (data.disbursements || []).forEach(d => {
        transactions.push({
            id: d.id,
            type: 'debit',
            description: `${d.description} - ${d.recipient}`,
            category: d.category,
            amount: d.amount,
            date: d.date,
            timestamp: d.timestamp || d.date + 'T00:00:00',
            reference: d.id
        });
    });
    
    // Sort by timestamp desc
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return transactions;
}

function renderAuditLog() {
    const data = getData();
    const transactions = getAuditTransactions(data);
    
    // Apply filters
    const filterType = document.getElementById('audit-filter-type')?.value || 'all';
    const dateFrom = document.getElementById('audit-date-from')?.value;
    const dateTo = document.getElementById('audit-date-to')?.value;
    
    let filteredTransactions = transactions;
    
    if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }
    
    if (dateFrom) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= dateTo);
    }
    
    // Calculate totals
    const totalCredit = filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalCredit - totalDebit;
    
    // Update summary cards
    document.getElementById('audit-total-credit').innerText = '₹' + totalCredit.toLocaleString();
    document.getElementById('audit-total-debit').innerText = '₹' + totalDebit.toLocaleString();
    document.getElementById('audit-net-balance').innerText = '₹' + netBalance.toLocaleString();
    
    // Render table
    const auditBody = document.getElementById('audit-table-body');
    auditBody.innerHTML = '';
    
    if (filteredTransactions.length === 0) {
        auditBody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align:center;">No transactions found.</td></tr>';
        return;
    }
    
    filteredTransactions.forEach(t => {
        const typeClass = t.type === 'credit' ? 'credit' : 'debit';
        const typeIcon = t.type === 'credit' ? '<i class="fas fa-arrow-down"></i>' : '<i class="fas fa-arrow-up"></i>';
        const amountPrefix = t.type === 'credit' ? '+' : '-';
        const categoryClass = (t.category || 'other').toLowerCase().replace(/[^a-z]/g, '');
        const refDisplay = t.reference && t.reference.length > 12 ? t.reference.substring(0, 12) + '...' : (t.reference || '-');
        
        const row = `<tr>
            <td><span class="transaction-id">${escapeHtml(t.id)}</span></td>
            <td><span class="type-badge ${typeClass}">${typeIcon} ${t.type === 'credit' ? 'Credit' : 'Debit'}</span></td>
            <td>${escapeHtml(t.description)}</td>
            <td><span class="category-badge ${categoryClass}">${escapeHtml(t.category)}</span></td>
            <td style="color: ${t.type === 'credit' ? '#16a34a' : '#dc2626'}; font-weight: 600;">${amountPrefix}₹${Number(t.amount).toLocaleString()}</td>
            <td class="timestamp">${formatDateTime(t.timestamp)}</td>
            <td><span class="payment-id" title="${escapeHtml(t.reference)}">${escapeHtml(refDisplay)}</span></td>
        </tr>`;
        auditBody.innerHTML += row;
    });
}

function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function filterAuditLog() {
    renderAuditLog();
}

function clearAuditFilters() {
    document.getElementById('audit-filter-type').value = 'all';
    document.getElementById('audit-date-from').value = '';
    document.getElementById('audit-date-to').value = '';
    renderAuditLog();
}

function handleAddDisbursement(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('disb-recipient').value;
    const amount = parseFloat(document.getElementById('disb-amount').value);
    const category = document.getElementById('disb-category').value;
    const description = document.getElementById('disb-description').value;
    
    if (!recipient || !amount || !category || !description) {
        alert('Please fill all fields.');
        return;
    }
    
    const data = getData();
    const totalFunds = data.donations.reduce((sum, d) => sum + d.amount, 0);
    const totalDisbursed = (data.disbursements || []).reduce((sum, d) => sum + d.amount, 0);
    const availableBalance = totalFunds - totalDisbursed;
    
    if (amount > availableBalance) {
        alert(`Insufficient funds. Available balance: ₹${availableBalance.toLocaleString()}`);
        return;
    }
    
    const now = new Date();
    const newDisbursement = {
        id: 'DIS' + Date.now(),
        recipient,
        amount,
        category,
        description,
        date: now.toISOString().split('T')[0],
        timestamp: now.toISOString()
    };
    
    if (!data.disbursements) data.disbursements = [];
    data.disbursements.push(newDisbursement);
    saveData(data);
    
    // Reset form
    e.target.reset();
    
    // Re-render
    renderAuditLog();
    renderDashboard();
    
    alert('Disbursement recorded successfully!');
}

function exportAuditLog(format) {
    const data = getData();
    const transactions = getAuditTransactions(data);
    
    if (format === 'csv') {
        let csv = 'Transaction ID,Type,Description,Category,Amount,Date & Time,Reference\n';
        transactions.forEach(t => {
            const amountPrefix = t.type === 'credit' ? '+' : '-';
            csv += `"${t.id}","${t.type}","${t.description}","${t.category}","${amountPrefix}${t.amount}","${formatDateTime(t.timestamp)}","${t.reference}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
        // For PDF, we'll create a printable view
        const printContent = `
            <html>
            <head>
                <title>Audit Log - Hope Foundation</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #2ecc71; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background: #f8f9fa; }
                    .credit { color: #16a34a; }
                    .debit { color: #dc2626; }
                    .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h1>Hope Foundation - Audit Log</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <div class="summary">
                    <strong>Total Credits:</strong> ₹${transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toLocaleString()} | 
                    <strong>Total Debits:</strong> ₹${transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toLocaleString()} | 
                    <strong>Net Balance:</strong> ₹${(transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)).toLocaleString()}
                </div>
                <table>
                    <tr><th>ID</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Date & Time</th></tr>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.id}</td>
                            <td class="${t.type}">${t.type.toUpperCase()}</td>
                            <td>${t.description}</td>
                            <td>${t.category}</td>
                            <td class="${t.type}">${t.type === 'credit' ? '+' : '-'}₹${t.amount.toLocaleString()}</td>
                            <td>${formatDateTime(t.timestamp)}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
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
            <td>${escapeHtml(msg.name)}<div class="muted small">${escapeHtml(msg.email)}</div></td>
            <td>${escapeHtml(msg.message)}</td>
            <td>${escapeHtml(msg.id)}</td>
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
    data.messages.push(newMsg);
    saveData(data);

    e.target.reset();
    alert('Thank you! We will get back to you shortly.');
    renderDashboard();
}

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
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.body.classList.toggle('nav-open');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-open')) {
            const navActions = document.querySelector('.nav-actions');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (navActions && !navActions.contains(e.target) && !menuBtn.contains(e.target)) {
                document.body.classList.remove('nav-open');
            }
        }
    });

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

// Alias for backward compatibility
const escAdminHtml = escapeHtml;

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

// --- TASK ASSIGNMENT & SHIFT MANAGEMENT ---
const TASKS_STORAGE = 'ooc_admin_tasks';
const SHIFTS_STORAGE = 'ooc_admin_shifts';

// Load tasks from localStorage
function loadTasks() {
    try {
        return JSON.parse(localStorage.getItem(TASKS_STORAGE)) || [];
    } catch {
        return [];
    }
}

// Save tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem(TASKS_STORAGE, JSON.stringify(tasks));
}

// Load shifts from localStorage
function loadShifts() {
    try {
        return JSON.parse(localStorage.getItem(SHIFTS_STORAGE)) || [];
    } catch {
        return [];
    }
}

// Save shifts to localStorage
function saveShifts(shifts) {
    localStorage.setItem(SHIFTS_STORAGE, JSON.stringify(shifts));
}

// Get role label
function getRoleLabel(roleToken) {
    const labels = {
        'role:staff': 'All Staff',
        'role:teacher': 'All Teachers',
        'role:events': 'Events Team',
        'role:management': 'Management',
        'role:fundraiser': 'Fundraising Team',
        'role:user': 'All Users'
    };
    return labels[roleToken] || roleToken;
}

// Handle task assignment
function handleAssignTask(event) {
    event.preventDefault();
    
    const assignee = document.getElementById('task-assignee').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    
    if (!assignee || !title || !dueDate) {
        alert('Please fill all required fields');
        return;
    }
    
    const task = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        assignee,
        assigneeLabel: getRoleLabel(assignee),
        priority,
        dueDate,
        title,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save task
    const tasks = loadTasks();
    tasks.unshift(task);
    saveTasks(tasks);
    
    // Send message notification to assignee
    sendTaskNotification(task);
    
    // Reset form
    document.getElementById('assignTaskForm').reset();
    document.getElementById('task-priority').value = 'medium';
    
    // Refresh task list
    renderTasksList();
    
    alert('Task assigned successfully! Notification sent to ' + task.assigneeLabel);
}

// Send task notification as a message
function sendTaskNotification(task) {
    const messages = loadUnifiedMessages();
    
    const priorityEmoji = {
        'low': '🟢',
        'medium': '🟡',
        'high': '🔴',
        'urgent': '🚨'
    };
    
    const newMsg = {
        id: 'msg-task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        from: ADMIN_USER,
        recipientTokens: [task.assignee],
        subject: `📋 New Task Assigned: ${task.title}`,
        body: `${priorityEmoji[task.priority]} **Priority:** ${task.priority.toUpperCase()}\n\n**Task:** ${task.title}\n\n**Description:**\n${task.description}\n\n**Due Date:** ${formatDateDisplay(task.dueDate)}\n\n---\n_Please complete this task by the due date. Contact admin if you have any questions._`,
        createdAt: new Date().toISOString(),
        type: 'task'
    };
    
    messages.push(newMsg);
    saveUnifiedMessages(messages);
}

// Render tasks list
function renderTasksList() {
    const container = document.getElementById('active-tasks-list');
    if (!container) return;
    
    const tasks = loadTasks().filter(t => t.status !== 'completed');
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="muted-inline" style="padding: 1rem; text-align: center;">No active tasks. Assign a new task above.</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-priority-indicator task-priority-${task.priority}"></div>
            <div class="task-content">
                <div class="task-header">
                    <h4 class="task-title">${escapeHtml(task.title)}</h4>
                </div>
                <p class="task-description">${escapeHtml(task.description)}</p>
                <div class="task-meta">
                    <span class="task-badge task-badge-assignee"><i class="fas fa-user"></i> ${task.assigneeLabel}</span>
                    <span class="task-badge task-badge-due"><i class="fas fa-calendar"></i> Due: ${formatDateDisplay(task.dueDate)}</span>
                    <span class="task-badge task-badge-priority"><i class="fas fa-flag"></i> ${task.priority.toUpperCase()}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn-complete" onclick="completeTask('${task.id}')" title="Mark Complete"><i class="fas fa-check"></i></button>
                <button class="task-btn-delete" onclick="deleteTask('${task.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// Complete a task
function completeTask(taskId) {
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
        tasks[idx].status = 'completed';
        tasks[idx].completedAt = new Date().toISOString();
        saveTasks(tasks);
        renderTasksList();
    }
}

// Delete a task
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const tasks = loadTasks().filter(t => t.id !== taskId);
    saveTasks(tasks);
    renderTasksList();
}

// Handle shift scheduling
function handleScheduleShift(event) {
    event.preventDefault();
    
    const assignee = document.getElementById('shift-assignee').value;
    const shiftDate = document.getElementById('shift-date').value;
    const startTime = document.getElementById('shift-start-time').value;
    const endTime = document.getElementById('shift-end-time').value;
    const shiftType = document.getElementById('shift-type').value;
    const location = document.getElementById('shift-location').value.trim();
    const notes = document.getElementById('shift-notes').value.trim();
    
    if (!assignee || !shiftDate || !startTime || !endTime) {
        alert('Please fill all required fields');
        return;
    }
    
    const shift = {
        id: 'shift-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        assignee,
        assigneeLabel: getRoleLabel(assignee),
        date: shiftDate,
        startTime,
        endTime,
        type: shiftType,
        location,
        notes,
        createdAt: new Date().toISOString()
    };
    
    // Save shift
    const shifts = loadShifts();
    shifts.unshift(shift);
    saveShifts(shifts);
    
    // Send shift notification as a message
    sendShiftNotification(shift);
    
    // Reset form
    document.getElementById('scheduleShiftForm').reset();
    
    // Refresh shifts display
    renderShiftsGrid();
    
    alert('Shift scheduled successfully! Notification sent to ' + shift.assigneeLabel);
}

// Send shift notification as a message
function sendShiftNotification(shift) {
    const messages = loadUnifiedMessages();
    
    const typeLabels = {
        'regular': '📅 Regular Shift',
        'morning': '🌅 Morning Shift',
        'afternoon': '☀️ Afternoon Shift',
        'evening': '🌆 Evening Shift',
        'weekend': '📆 Weekend Shift',
        'event': '🎉 Event Duty',
        'emergency': '🚨 Emergency/On-Call'
    };
    
    const newMsg = {
        id: 'msg-shift-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        from: ADMIN_USER,
        recipientTokens: [shift.assignee],
        subject: `🗓️ Shift Scheduled: ${formatDateDisplay(shift.date)}`,
        body: `${typeLabels[shift.type]}\n\n**Date:** ${formatDateDisplay(shift.date)}\n**Time:** ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}\n**Location:** ${shift.location}\n\n${shift.notes ? '**Notes:**\n' + shift.notes : ''}\n\n---\n_Please be on time. Contact admin if you have any scheduling conflicts._`,
        createdAt: new Date().toISOString(),
        type: 'shift'
    };
    
    messages.push(newMsg);
    saveUnifiedMessages(messages);
}

// Format date for display
function formatDateDisplay(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

// Format time for display
function formatTime(timeStr) {
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch {
        return timeStr;
    }
}

// Current week offset for shift view
let currentWeekOffset = 0;

// Change shift week view
function changeShiftWeek(direction) {
    currentWeekOffset += direction;
    renderShiftsGrid();
}

// Get week date range
function getWeekRange(offset = 0) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (offset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return { start: startOfWeek, end: endOfWeek };
}

// Render shifts grid
function renderShiftsGrid() {
    const container = document.getElementById('shifts-schedule-grid');
    const weekLabel = document.getElementById('shift-week-label');
    if (!container) return;
    
    const { start, end } = getWeekRange(currentWeekOffset);
    
    // Update week label
    if (weekLabel) {
        if (currentWeekOffset === 0) {
            weekLabel.textContent = 'This Week';
        } else if (currentWeekOffset === 1) {
            weekLabel.textContent = 'Next Week';
        } else if (currentWeekOffset === -1) {
            weekLabel.textContent = 'Last Week';
        } else {
            weekLabel.textContent = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
    }
    
    const shifts = loadShifts().filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= start && shiftDate <= end;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (shifts.length === 0) {
        container.innerHTML = '<div class="muted-inline" style="padding: 2rem; text-align: center;"><i class="fas fa-calendar-xmark" style="font-size: 2rem; color: #ccc; margin-bottom: 0.5rem;"></i><br>No shifts scheduled for this week.</div>';
        return;
    }
    
    container.innerHTML = shifts.map(shift => {
        const date = new Date(shift.date);
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        return `
            <div class="shift-item shift-type-${shift.type}">
                <div class="shift-date-box">
                    <div class="shift-date-day">${day}</div>
                    <div class="shift-date-month">${month}</div>
                </div>
                <div class="shift-details">
                    <h4 class="shift-assignee">${shift.assigneeLabel}</h4>
                    <div class="shift-time">
                        <i class="fas fa-clock"></i>
                        ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}
                    </div>
                    <div class="shift-info">
                        <span class="shift-badge shift-badge-type"><i class="fas fa-tag"></i> ${shift.type}</span>
                        <span class="shift-badge shift-badge-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(shift.location)}</span>
                    </div>
                </div>
                <div class="shift-actions">
                    <button class="shift-btn-delete" onclick="deleteShift('${shift.id}')" title="Delete Shift"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

// Delete a shift
function deleteShift(shiftId) {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    
    const shifts = loadShifts().filter(s => s.id !== shiftId);
    saveShifts(shifts);
    renderShiftsGrid();
}

// escapeHtml is defined at top of file for XSS protection

// Initialize tasks and shifts on page load
function initTasksAndShifts() {
    renderTasksList();
    renderShiftsGrid();
    
    // Set minimum date to today for forms
    const today = new Date().toISOString().split('T')[0];
    const taskDueDate = document.getElementById('task-due-date');
    const shiftDate = document.getElementById('shift-date');
    
    if (taskDueDate) taskDueDate.min = today;
    if (shiftDate) shiftDate.min = today;
}

// Call init when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize after a short delay to ensure elements are loaded
    setTimeout(initTasksAndShifts, 500);
});

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
        const imgSrc = sanitizeUrl(t.image) || getRandomAvatar();
        card.innerHTML = `
            <div class="testimonial-header">
                <img src="${imgSrc}" alt="${escapeHtml(t.name)}">
                <div>
                    <h4>${escapeHtml(t.name)}</h4>
                    <p class="muted">${escapeHtml(t.role)}, ${escapeHtml(t.city)}</p>
                </div>
            </div>
            <p>"${escapeHtml(t.message)}"</p>
            <div class="stars">${getStarsHtml(Number(t.rating) || 0)}</div>
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

function toggleFeedback() {
    const form = document.getElementById('feedback-form');
    if (form) {
        form.classList.toggle('active');
    }
}

// Events Section Tab Switching
function switchEventsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.events-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const activeBtn = document.querySelector(`.events-tab-btn[onclick*="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.events-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById('events-tab-' + tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Newsletter Subscription Handler
function handleNewsletterSubscribe(e) {
    e.preventDefault();
    
    const email = document.getElementById('newsletter-email').value;
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Store subscription (in localStorage for demo)
    const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
    
    if (subscriptions.includes(email)) {
        alert('You are already subscribed to our newsletter!');
        return;
    }
    
    subscriptions.push(email);
    localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
    
    // Show success message
    alert('🎉 Thank you for subscribing!\n\nYou will receive our monthly newsletter with updates on our programs, events, and impact stories.');
    
    // Reset form
    document.getElementById('newsletter-email').value = '';
}

// Stories Section Tab Switching
function switchStoriesTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.stories-tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.stories-tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(tabName + '-content');
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
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

// ===== CHATBOT FUNCTIONALITY =====
const chatbotResponses = {
    greetings: [
        "Hello! 👋 Welcome to Hope Foundation. How can I assist you today?",
        "Hi there! 😊 I'm here to help you learn more about our work.",
        "Hey! Great to see you. What would you like to know?"
    ],
    donation: {
        keywords: ['donate', 'donation', 'give', 'contribute', 'money', 'payment', 'pay', 'support financially'],
        responses: [
            "Thank you for your interest in donating! 💚\n\nYou can donate through:\n• **UPI** - Scan QR or use UPI ID\n• **Card** - Credit/Debit via Razorpay\n• **Bank Transfer** - Direct to our account\n\nAll donations are tax-deductible under 80G. Would you like me to take you to the donation page?",
        ],
        action: { text: "Go to Donate Page", section: "donate" }
    },
    volunteer: {
        keywords: ['volunteer', 'volunteering', 'help', 'join', 'participate', 'contribute time'],
        responses: [
            "We'd love to have you as a volunteer! 🙌\n\nOur volunteer opportunities include:\n• **Teaching** - Help children with education\n• **Fundraising** - Organize events & campaigns\n• **Healthcare** - Assist in health camps\n• **Administrative** - Help with office work\n\nWould you like to fill out a volunteer application?",
        ],
        action: { text: "Apply as Volunteer", section: "volunteer" }
    },
    programs: {
        keywords: ['program', 'programs', 'activities', 'what do you do', 'services', 'initiatives', 'work'],
        responses: [
            "We run several impactful programs: 📚\n\n• **Education for All** - Books, uniforms & tutoring for street children\n• **Healthy Meals** - Daily nutritious meals to fight malnutrition\n• **Skill Development** - Vocational training for teens\n• **Healthcare Camps** - Regular health check-ups\n• **Mentorship** - One-on-one guidance programs\n\nWant to learn more about any specific program?",
        ],
        action: { text: "View All Programs", section: "programs" }
    },
    contact: {
        keywords: ['contact', 'reach', 'phone', 'email', 'address', 'location', 'call', 'talk'],
        responses: [
            "Here's how you can reach us: 📞\n\n• **Phone:** +91 98765 43210\n• **Email:** hello@hopefoundation.org\n• **Address:** 21 Community Lane, Ahmedabad\n\nOur office hours are Mon-Sat, 9 AM to 6 PM. You can also fill out our contact form for queries!",
        ],
        action: { text: "Contact Form", section: "contact" }
    },
    impact: {
        keywords: ['impact', 'results', 'achievement', 'statistics', 'numbers', 'report', 'transparency', 'funds used'],
        responses: [
            "We believe in full transparency! 📊\n\n**Our Impact So Far:**\n• 10,000+ children educated\n• 50+ community programs\n• 100% transparent fund utilization\n• 98% program completion rate\n\nYou can view detailed reports on how every rupee is spent. Would you like to see our impact dashboard?",
        ],
        action: { text: "View Impact Report", section: "impact" }
    },
    events: {
        keywords: ['event', 'events', 'upcoming', 'program', 'camp', 'drive', 'gala'],
        responses: [
            "We have exciting events coming up! 🎉\n\nCheck out our Events page for:\n• Charity galas\n• Food & donation drives\n• Education camps\n• Health awareness programs\n\nYou can participate, volunteer, or sponsor our events!",
        ],
        action: { text: "View Events", section: "events" }
    },
    about: {
        keywords: ['about', 'who are you', 'organization', 'ngo', 'foundation', 'history', 'mission'],
        responses: [
            "**About Hope Foundation** 🏛️\n\nWe are a community-first nonprofit working with schools, shelters, and local leaders to help underprivileged children.\n\n**Our Mission:** To ensure every child has access to quality education, healthy nutrition, and safe healthcare with dignity.\n\nWe operate in 12+ cities with 86 facilitators and maintain 92% attendance in our learning centers.",
        ],
        action: { text: "Learn More About Us", section: "about" }
    },
    tax: {
        keywords: ['tax', '80g', 'receipt', 'certificate', 'deduction', 'exemption'],
        responses: [
            "Yes! All donations to Hope Foundation qualify for tax exemption under Section 80G of the Income Tax Act. 📝\n\nYou'll receive:\n• Instant digital receipt\n• 80G certificate via email\n• Annual donation summary\n\nThe receipt is generated immediately after your donation is confirmed.",
        ],
        action: { text: "Donate Now", section: "donate" }
    },
    thanks: {
        keywords: ['thank', 'thanks', 'awesome', 'great', 'helpful', 'appreciate'],
        responses: [
            "You're welcome! 😊 It's my pleasure to help. Is there anything else you'd like to know?",
            "Happy to help! 💚 Feel free to ask if you have more questions!",
            "Glad I could assist! Don't hesitate to reach out anytime."
        ]
    },
    fallback: [
        "I'm not sure I understand. Could you rephrase that? Or you can ask about:\n• Donations\n• Volunteering\n• Our Programs\n• Contact Information",
        "I didn't quite get that. Try asking about how to donate, volunteer, or learn about our programs!",
        "Hmm, I'm still learning! You can ask me about donations, volunteering, events, or our impact."
    ]
};

let chatbotOpen = false;

function toggleChatbot() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    const badge = document.getElementById('chatbot-badge');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        window.classList.add('active');
        toggle.classList.add('active');
        badge.style.display = 'none';
        document.getElementById('chatbot-input').focus();
    } else {
        window.classList.remove('active');
        toggle.classList.remove('active');
    }
}

function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate response delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(message);
        addMessage(response.text, 'bot', response.action);
    }, 800 + Math.random() * 700);
}

function sendQuickReply(message) {
    addMessage(message, 'user');
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateResponse(message);
        addMessage(response.text, 'bot', response.action);
    }, 600 + Math.random() * 500);
}

function addMessage(text, sender, action = null) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    let actionHTML = '';
    if (action) {
        // Only allow known safe sections
        const safeSection = escapeHtml(action.section);
        actionHTML = `
            <div class="quick-replies" style="margin-top: 10px;">
                <button onclick="goToSection('${safeSection}')">${escapeHtml(action.text)}</button>
            </div>
        `;
    }
    
    // Escape user input, then convert markdown-style bold to HTML for bot messages
    const safeText = sender === 'user' ? escapeHtml(text) : text;
    const formattedText = safeText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\\n/g, '<br>')
        .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${formattedText}</p>
            ${actionHTML}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for greetings
    if (/^(hi|hello|hey|good morning|good evening|good afternoon|hola|namaste)/i.test(message)) {
        return {
            text: chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)],
            action: null
        };
    }
    
    // Check each category for keyword matches
    for (const [category, data] of Object.entries(chatbotResponses)) {
        if (category === 'greetings' || category === 'fallback') continue;
        
        if (data.keywords && data.keywords.some(keyword => message.includes(keyword))) {
            return {
                text: data.responses[Math.floor(Math.random() * data.responses.length)],
                action: data.action || null
            };
        }
    }
    
    // Fallback response
    return {
        text: chatbotResponses.fallback[Math.floor(Math.random() * chatbotResponses.fallback.length)],
        action: null
    };
}

function goToSection(sectionId) {
    toggleChatbot(); // Close chatbot
    setTimeout(() => {
        showSection(sectionId);
    }, 300);
}

// Initialize chatbot greeting after page load
document.addEventListener('DOMContentLoaded', function() {
    // Show notification badge after 5 seconds if chatbot not opened
    setTimeout(() => {
        if (!chatbotOpen) {
            const badge = document.getElementById('chatbot-badge');
            if (badge) badge.style.display = 'flex';
        }
    }, 5000);
})
