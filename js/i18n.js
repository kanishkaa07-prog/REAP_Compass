/**
 * Rajasthan Engineering College Recommender
 * Internationalization (i18n) Module: English & Hindi Support
 *
 * This module manages all UI strings so no text is hardcoded into HTML.
 * Language preference is persisted in localStorage.
 */

const TRANSLATIONS = {
  en: {
    // Brand & Global
    "brand.name": "Rajasthan College Compass",
    "brand.tagline": "Rajasthan Engineering College Guide",
    "banner.demo": "Demo data, not for real decisions.",
    "lang.toggle": "हिन्दी",

    // Navigation
    "nav.home": "Home",
    "nav.find": "Find My College",
    "nav.results": "Recommendations",
    "nav.compare": "Compare",
    "nav.branch_vs_college": "Branch vs College",
    "nav.scholarships": "Scholarships",

    // Home Page
    "home.badge": "Rajasthan B.Tech Admissions 2024-25",
    "home.title": "Find the Best Engineering College in Rajasthan",
    "home.subtitle": "Enter your exam rank, category, and preferences. Get tailored college recommendations with transparent trade-offs and 'why it fits' rationale.",
    "home.cta_find": "Find My College",
    "home.cta_compare": "Compare Colleges",
    "home.feature1.title": "Personalized Recommendations",
    "home.feature1.desc": "Ranked matches balancing fees, placements, distance from Jaipur, and NIRF/NAAC reputation based on what matters to you.",
    "home.feature2.title": "Transparent Trade-offs",
    "home.feature2.desc": "Side-by-side 'You Gain / You Lose' breakdowns comparing 2-3 colleges so you make informed admission decisions.",
    "home.feature3.title": "Branch vs. College Helper",
    "home.feature3.desc": "Resolve the age-old dilemma: Is it better to take CSE at a Tier-2 college, or Mechanical/Civil at an IIT/NIT?",
    "home.stats.colleges": "20 Engineering Institutes",
    "home.stats.colleges_sub": "Govt, Private & Deemed across Rajasthan",
    "home.stats.cutoffs": "900+ Cutoff Records",
    "home.stats.cutoffs_sub": "JEE Main, JEE Adv, BITSAT & REAP",
    "home.stats.scholarships": "40+ Scholarship Schemes",
    "home.stats.scholarships_sub": "State, Central & Merit tuition fee waivers",

    // Wizard (Find Page)
    "wizard.title": "Find Your Ideal Engineering College",
    "wizard.subtitle": "Complete two simple steps to see college recommendations tailored to your profile.",
    "wizard.step1": "1. About You",
    "wizard.step2": "2. What Matters to You",
    "wizard.exam.label": "Entrance Exam",
    "wizard.rank.label_rank": "Your Rank",
    "wizard.rank.label_score": "BITSAT Score (out of 390)",
    "wizard.rank.placeholder_rank": "e.g. 15000",
    "wizard.rank.placeholder_score": "e.g. 265",
    "wizard.rank.hint_score": "Enter your score out of 390 (higher score is better).",
    "wizard.rank.hint_rank": "Enter your overall category or all-India rank (lower rank is better).",
    "wizard.category.label": "Category",
    "wizard.domicile.label": "Domicile State",
    "wizard.domicile.rajasthan": "Rajasthan (Home State)",
    "wizard.domicile.other": "Other State",
    "wizard.gender.label": "Gender",
    "wizard.gender.male": "Male",
    "wizard.gender.female": "Female",
    "wizard.gender.other": "Other",
    "wizard.gender.hint": "Banasthali Vidyapith is exclusively for women students.",
    "wizard.branches.label": "Preferred Branches (Select one or more)",
    "wizard.income.label": "Annual Family Income (INR, Optional)",
    "wizard.income.placeholder": "e.g. 450000",
    "wizard.income.hint": "Used to check eligibility for fee reimbursements and scholarships.",
    "wizard.btn_next": "Next: Your Priorities →",
    "wizard.btn_back": "← Back",
    "wizard.btn_submit": "Find Colleges Now →",

    // Wizard Step 2 (Priorities)
    "wizard.priorities.title": "What matters most to you? (0 to 10)",
    "wizard.priorities.subtitle": "Adjust the sliders below to prioritize fees, career placements, location, or college brand reputation.",
    "wizard.slider.fees": "Affordable Fees",
    "wizard.slider.fees_desc": "Higher priority prefers government institutions and lower annual tuition.",
    "wizard.slider.placements": "Placements & Salaries",
    "wizard.slider.placements_desc": "Higher priority prefers colleges with higher average & median packages and high placement percentages.",
    "wizard.slider.location": "Location (Near Jaipur)",
    "wizard.slider.location_desc": "Higher priority favors colleges located in or close to Jaipur city.",
    "wizard.slider.reputation": "Reputation & Accreditation",
    "wizard.slider.reputation_desc": "Higher priority rewards top NAAC grades (A/A++), NBA accredited programs, and top NIRF rankings.",
    "wizard.hostel.title": "Hostel Accommodation",
    "wizard.hostel.label": "I need hostel accommodation",
    "wizard.hostel.desc": "Adds annual hostel fees to the total estimated yearly college expenditure.",

    // Results Page
    "results.title": "Recommended Colleges For You",
    "results.subtitle": "Ranked based on your entrance rank, eligible branches, and weighted priorities.",
    "results.edit_pref": "Edit Preferences",
    "results.filter.type": "Institution Type",
    "results.filter.type_all": "All Types",
    "results.filter.type_govt": "Govt Only",
    "results.filter.type_pvt": "Private Only",
    "results.filter.type_deemed": "Deemed Only",
    "results.filter.city": "City",
    "results.filter.city_all": "All Cities",
    "results.filter.budget": "Max Annual Fees",
    "results.filter.budget_all": "Any Budget",
    "results.sort.label": "Sort By",
    "results.sort.match": "Best Overall Match",
    "results.sort.fees": "Lowest Total Fees",
    "results.sort.placements": "Highest Avg Package",
    "results.sort.distance": "Closest to Jaipur",
    "results.chance.safe": "Safe Chance",
    "results.chance.target": "Target Chance",
    "results.chance.reach": "Reach / Dream",
    "results.match_score": "Match Score",
    "results.metric.fees": "Fees / Year",
    "results.metric.avg_pkg": "Avg Package",
    "results.metric.median_pkg": "Median Package",
    "results.metric.placement_rate": "Placement Rate",
    "results.metric.distance": "Distance to Jaipur",
    "results.tag.naac": "NAAC",
    "results.tag.nba": "NBA",
    "results.tag.nirf": "NIRF",
    "results.reason.title": "Why it fits your profile:",
    "results.choose_when.title": "Choose this college when:",
    "results.badge.demo": "Demo Data",
    "results.badge.demo_tooltip": "Data status: Mock synthetic values for testing.",
    "results.scholarship_hint": "Scholarship Opportunity",
    "results.scholarship_qualify": "You may qualify for up to ₹{amount}/yr in scholarships!",
    "results.compare.checkbox": "Compare this college",
    "results.compare.bar_selected": "colleges selected for comparison",
    "results.compare.btn": "Compare Now →",
    "results.no_matches": "No colleges matched your exact criteria.",
    "results.no_matches_tip": "Try increasing your budget filter, broadening branch preferences, or adjusting your rank.",

    // Compare Page
    "compare.title": "College Trade-off Comparison",
    "compare.subtitle": "Compare 2 to 3 colleges side-by-side to understand exactly what you gain and lose with each choice.",
    "compare.select1": "Select College 1",
    "compare.select2": "Select College 2",
    "compare.select3": "Select College 3 (Optional)",
    "compare.table.college": "College Name",
    "compare.table.city": "City",
    "compare.table.type": "Type",
    "compare.table.tuition": "Tuition Fee / Year",
    "compare.table.hostel": "Hostel Fee / Year",
    "compare.table.total_fee": "Total Annual Cost",
    "compare.table.avg_pkg": "Average Package (LPA)",
    "compare.table.median_pkg": "Median Package (LPA)",
    "compare.table.placement_rate": "Placement %",
    "compare.table.naac": "NAAC Grade",
    "compare.table.nba": "NBA Accreditation",
    "compare.table.nirf": "NIRF Band",
    "compare.table.dist_jaipur": "Distance from Jaipur",
    "compare.tradeoff.title": "Direct Trade-off Analysis",
    "compare.gain.title": "What You Gain",
    "compare.lose.title": "What You Give Up",
    "compare.empty_state": "Select at least two colleges above to view the comparison table and trade-off breakdown.",

    // Branch vs College Page
    "bvc.title": "Branch vs College Decision Helper",
    "bvc.subtitle": "Stuck between a preferred branch at a mid-tier college vs a lower branch at a premier brand? Let data guide your choice.",
    "bvc.option_a": "Option A (College + Branch)",
    "bvc.option_b": "Option B (College + Branch)",
    "bvc.select_college": "Select College",
    "bvc.select_branch": "Select Branch",
    "bvc.metric.cutoff": "Latest Closing Rank/Score",
    "bvc.metric.fees": "Annual Tuition",
    "bvc.metric.avg_pkg": "College Avg Package",
    "bvc.metric.reputation": "College Reputation",
    "bvc.verdict.title": "Advisor Verdict",
    "bvc.btn_compare": "Evaluate Decision →",

    // Scholarships Page
    "scholarships.title": "Engineering Scholarships in Rajasthan",
    "scholarships.subtitle": "Explore government and institutional scholarship schemes, fee waivers, and financial aid.",
    "scholarships.filter.cat": "Filter by Category",
    "scholarships.filter.cat_all": "All Categories",
    "scholarships.filter.income": "Maximum Family Income",
    "scholarships.filter.income_any": "Any Income Level",
    "scholarships.benefit_type": "Benefit Type",
    "scholarships.income_limit": "Income Ceiling",
    "scholarships.merit_rule": "Merit Requirement",
    "scholarships.provider": "Offered By",
    "scholarships.apply_btn": "Official Portal / Details",
    "scholarships.empty": "No scholarships matched the selected category and income filters.",

    // Chat Placeholder
    "chat.btn_label": "Ask about colleges",
    "chat.title": "College Counseling Assistant",
    "chat.coming_soon": "AI Chatbot Coming Soon!",
    "chat.desc": "Our team is connecting a RAG-based AI model that answers detailed questions about college culture, hostels, syllabus, and admission chances.",
    "chat.input_placeholder": "Ask a question (coming soon)...",
    "chat.close": "Close",

    // Footer
    "footer.disclaimer": "Disclaimer: All cutoff, fee, placement, and scholarship figures are synthetic mock data intended solely for academic demonstration and portfolio evaluation.",
    "footer.built_with": "Built with vanilla web standards for Rajasthan engineering aspirants."
  },

  hi: {
    // Brand & Global
    "brand.name": "राजस्थान कॉलेज कम्पास",
    "brand.tagline": "राजस्थान इंजीनियरिंग कॉलेज गाइड",
    "banner.demo": "डेमो डेटा, वास्तविक निर्णय के लिए नहीं।",
    "lang.toggle": "English",

    // Navigation
    "nav.home": "होम",
    "nav.find": "कॉलेज खोजें",
    "nav.results": "सिफारिशें",
    "nav.compare": "तुलना करें",
    "nav.branch_vs_college": "ब्रांच बनाम कॉलेज",
    "nav.scholarships": "छात्रवृत्तियां",

    // Home Page
    "home.badge": "राजस्थान बी.टेक प्रवेश 2024-25",
    "home.title": "राजस्थान में सर्वश्रेष्ठ इंजीनियरिंग कॉलेज चुनें",
    "home.subtitle": "अपनी परीक्षा रैंक, श्रेणी और प्राथमिकताएं दर्ज करें। पारदर्शी लाभ-हानि विश्लेषण और कॉलेज चयन के ठोस कारणों के साथ सही कॉलेज पाएं।",
    "home.cta_find": "मेरा कॉलेज खोजें",
    "home.cta_compare": "कॉलेजों की तुलना करें",
    "home.feature1.title": "व्यक्तिगत सिफारिशें",
    "home.feature1.desc": "फीस, प्लेसमेंट, जयपुर से दूरी और एनआईआरएफ/नैक प्रतिष्ठा के आधार पर आपके अनुसार रैंक की गई सूची।",
    "home.feature2.title": "पारदर्शी लाभ-हानि",
    "home.feature2.desc": "2-3 कॉलेजों की सीधी तुलना: 'आप क्या पाएंगे / क्या खोएंगे' का स्पष्ट विश्लेषण ताकि आप सही निर्णय ले सकें।",
    "home.feature3.title": "ब्रांच बनाम कॉलेज सहायता",
    "home.feature3.desc": "बड़ी दुविधा हल करें: क्या टियर-2 कॉलेज में सीएसई लेना बेहतर है या शीर्ष संस्थान में मैकेनिकल/सिविल?",
    "home.stats.colleges": "20 इंजीनियरिंग संस्थान",
    "home.stats.colleges_sub": "सरकारी, निजी और मानद संस्थान",
    "home.stats.cutoffs": "900+ कटऑफ रिकॉर्ड",
    "home.stats.cutoffs_sub": "जेईई मेन, एडवांस्ड, बिटसैट और रीप",
    "home.stats.scholarships": "40+ छात्रवृत्ति योजनाएं",
    "home.stats.scholarships_sub": "राज्य, केंद्र और मेरिट फीस छूट",

    // Wizard (Find Page)
    "wizard.title": "अपने लिए आदर्श इंजीनियरिंग कॉलेज खोजें",
    "wizard.subtitle": "अपनी प्रोफाइल के अनुसार कॉलेज सिफारिशें देखने के लिए दो आसान चरण पूरे करें।",
    "wizard.step1": "1. आपकी जानकारी",
    "wizard.step2": "2. आपकी प्राथमिकताएं",
    "wizard.exam.label": "प्रवेश परीक्षा (Entrance Exam)",
    "wizard.rank.label_rank": "आपकी रैंक (Rank)",
    "wizard.rank.label_score": "बिटसैट स्कोर (390 में से)",
    "wizard.rank.placeholder_rank": "उदा. 15000",
    "wizard.rank.placeholder_score": "उदा. 265",
    "wizard.rank.hint_score": "390 में से अपना स्कोर दर्ज करें (अधिक स्कोर बेहतर है)।",
    "wizard.rank.hint_rank": "अपनी रैंक दर्ज करें (कम रैंक बेहतर होती है)।",
    "wizard.category.label": "श्रेणी (Category)",
    "wizard.domicile.label": "मूल निवास (Domicile State)",
    "wizard.domicile.rajasthan": "राजस्थान (गृह राज्य)",
    "wizard.domicile.other": "अन्य राज्य (Other State)",
    "wizard.gender.label": "लिंग (Gender)",
    "wizard.gender.male": "पुरुष",
    "wizard.gender.female": "महिला",
    "wizard.gender.other": "अन्य",
    "wizard.gender.hint": "वनस्थली विद्यापीठ केवल महिला छात्राओं के लिए है।",
    "wizard.branches.label": "पसंदीदा ब्रांच (एक या अधिक चुनें)",
    "wizard.income.label": "वार्षिक पारिवारिक आय (रुपये, ऐच्छिक)",
    "wizard.income.placeholder": "उदा. 450000",
    "wizard.income.hint": "छात्रवृत्ति और फीस छूट पात्रता जांचने के लिए उपयोगी।",
    "wizard.btn_next": "अगला: प्राथमिकताएं →",
    "wizard.btn_back": "← वापस",
    "wizard.btn_submit": "कॉलेज सिफारिशें देखें →",

    // Wizard Step 2 (Priorities)
    "wizard.priorities.title": "आपके लिए सबसे महत्वपूर्ण क्या है? (0 से 10)",
    "wizard.priorities.subtitle": "फीस, प्लेसमेंट, स्थान या कॉलेज प्रतिष्ठा को प्राथमिकता देने के लिए स्लाइडर्स सेट करें।",
    "wizard.slider.fees": "किफायती फीस (कम खर्च)",
    "wizard.slider.fees_desc": "सरकारी संस्थान और कम ट्यूशन फीस को अधिक प्राथमिकता मिलती है।",
    "wizard.slider.placements": "प्लेसमेंट और पैकेज",
    "wizard.slider.placements_desc": "उच्च औसत और मीडियन पैकेज वाले कॉलेजों को प्राथमिकता मिलती है।",
    "wizard.slider.location": "स्थान (जयपुर के नजदीक)",
    "wizard.slider.location_desc": "जयपुर शहर या उसके नजदीक स्थित कॉलेजों को वरीयता मिलती है।",
    "wizard.slider.reputation": "प्रतिष्ठा और मान्यता (NAAC/NIRF)",
    "wizard.slider.reputation_desc": "शीर्ष नैक ग्रेड (A/A++), एनबीए और एनआईआरएफ रैंकिंग वाले कॉलेजों को वरीयता।",
    "wizard.hostel.title": "हॉस्टल आवास",
    "wizard.hostel.label": "मुझे हॉस्टल सुविधा चाहिए",
    "wizard.hostel.desc": "कुल वार्षिक खर्च में हॉस्टल फीस जोड़ी जाएगी।",

    // Results Page
    "results.title": "आपके लिए अनुशंसित कॉलेज",
    "results.subtitle": "आपकी प्रवेश रैंक, पात्र ब्रांच और प्राथमिकताओं के आधार पर तैयार की गई सूची।",
    "results.edit_pref": "प्राथमिकताएं बदलें",
    "results.filter.type": "कॉलेज प्रकार",
    "results.filter.type_all": "सभी प्रकार",
    "results.filter.type_govt": "केवल सरकारी",
    "results.filter.type_pvt": "केवल निजी",
    "results.filter.type_deemed": "केवल डीम्ड",
    "results.filter.city": "शहर",
    "results.filter.city_all": "सभी शहर",
    "results.filter.budget": "अधिकतम वार्षिक फीस",
    "results.filter.budget_all": "कोई भी बजट",
    "results.sort.label": "क्रमबद्ध करें",
    "results.sort.match": "सर्वश्रेष्ठ मिलान (Best Match)",
    "results.sort.fees": "न्यूनतम कुल फीस",
    "results.sort.placements": "उच्चतम औसत पैकेज",
    "results.sort.distance": "जयपुर के सबसे निकट",
    "results.chance.safe": "सुरक्षित संभावना (Safe)",
    "results.chance.target": "लक्ष्य संभावना (Target)",
    "results.chance.reach": "कठिन / ड्रीम (Reach)",
    "results.match_score": "मैच स्कोर",
    "results.metric.fees": "फीस / वर्ष",
    "results.metric.avg_pkg": "औसत पैकेज",
    "results.metric.median_pkg": "मीडियन पैकेज",
    "results.metric.placement_rate": "प्लेसमेंट दर",
    "results.metric.distance": "जयपुर से दूरी",
    "results.tag.naac": "नैक (NAAC)",
    "results.tag.nba": "एनबीए (NBA)",
    "results.tag.nirf": "एनआईआरएफ (NIRF)",
    "results.reason.title": "यह कॉलेज आपकी प्रोफाइल के अनुकूल क्यों है:",
    "results.choose_when.title": "इस कॉलेज को तब चुनें जब:",
    "results.badge.demo": "डेमो डेटा",
    "results.badge.demo_tooltip": "डेटा स्थिति: केवल परीक्षण और प्रदर्शन के लिए मॉक डेटा।",
    "results.scholarship_hint": "छात्रवृत्ति का अवसर",
    "results.scholarship_qualify": "आप ₹{amount}/वर्ष तक की छात्रवृत्ति के लिए पात्र हो सकते हैं!",
    "results.compare.checkbox": "तुलना के लिए चुनें",
    "results.compare.bar_selected": "कॉलेज तुलना के लिए चुने गए",
    "results.compare.btn": "तुलना करें →",
    "results.no_matches": "आपके मानदंडों से कोई कॉलेज मेल नहीं खाया।",
    "results.no_matches_tip": "बजट बढ़ाएं, अन्य ब्रांच चुनें या अपनी रैंक सीमा समायोजित करें।",

    // Compare Page
    "compare.title": "कॉलेज लाभ-हानि तुलना",
    "compare.subtitle": "2 से 3 कॉलेजों की आमने-सामने तुलना करें और समझें कि प्रत्येक विकल्प में आप क्या पाएंगे और क्या खोएंगे।",
    "compare.select1": "कॉलेज 1 चुनें",
    "compare.select2": "कॉलेज 2 चुनें",
    "compare.select3": "कॉलेज 3 चुनें (ऐच्छिक)",
    "compare.table.college": "कॉलेज का नाम",
    "compare.table.city": "शहर",
    "compare.table.type": "प्रकार",
    "compare.table.tuition": "ट्यूशन फीस / वर्ष",
    "compare.table.hostel": "हॉस्टल फीस / वर्ष",
    "compare.table.total_fee": "कुल वार्षिक खर्च",
    "compare.table.avg_pkg": "औसत पैकेज (LPA)",
    "compare.table.median_pkg": "मीडियन पैकेज (LPA)",
    "compare.table.placement_rate": "प्लेसमेंट %",
    "compare.table.naac": "नैक ग्रेड",
    "compare.table.nba": "एनबीए मान्यता",
    "compare.table.nirf": "एनआईआरएफ बैंड",
    "compare.table.dist_jaipur": "जयपुर से दूरी",
    "compare.tradeoff.title": "सीधा लाभ-हानि विश्लेषण (Trade-offs)",
    "compare.gain.title": "आपको क्या मिलेगा (Gains)",
    "compare.lose.title": "आपको क्या छोड़ना पड़ेगा (Losses)",
    "compare.empty_state": "तुलना तालिका और लाभ-हानि विश्लेषण देखने के लिए ऊपर कम से कम 2 कॉलेज चुनें।",

    // Branch vs College Page
    "bvc.title": "ब्रांच बनाम कॉलेज निर्णय सहायक",
    "bvc.subtitle": "क्या आप साधारण कॉलेज में अच्छी ब्रांच और शीर्ष कॉलेज में निचली ब्रांच के बीच भ्रमित हैं? डेटा से सही फैसला लें।",
    "bvc.option_a": "विकल्प अ (कॉलेज + ब्रांच)",
    "bvc.option_b": "विकल्प ब (कॉलेज + ब्रांच)",
    "bvc.select_college": "कॉलेज चुनें",
    "bvc.select_branch": "ब्रांच चुनें",
    "bvc.metric.cutoff": "कटऑफ रैंक / स्कोर",
    "bvc.metric.fees": "वार्षिक फीस",
    "bvc.metric.avg_pkg": "औसत पैकेज",
    "bvc.metric.reputation": "संस्थान प्रतिष्ठा",
    "bvc.verdict.title": "सलाहकार का निर्णय",
    "bvc.btn_compare": "निर्णय का मूल्यांकन करें →",

    // Scholarships Page
    "scholarships.title": "राजस्थान इंजीनियरिंग छात्रवृत्तियां",
    "scholarships.subtitle": "सरकारी और संस्थागत छात्रवृत्ति योजनाएं, फीस प्रतिपूर्ति और आर्थिक सहायता खोजें।",
    "scholarships.filter.cat": "श्रेणी अनुसार खोजें",
    "scholarships.filter.cat_all": "सभी श्रेणियां",
    "scholarships.filter.income": "पारिवारिक आय सीमा",
    "scholarships.filter.income_any": "कोई भी आय सीमा",
    "scholarships.benefit_type": "लाभ प्रकार",
    "scholarships.income_limit": "अधिकतम आय सीमा",
    "scholarships.merit_rule": "पात्रता शर्त",
    "scholarships.provider": "प्रदाता संस्था",
    "scholarships.apply_btn": "आधिकारिक पोर्टल / विवरण",
    "scholarships.empty": "चयनित श्रेणी और आय के लिए कोई छात्रवृत्ति नहीं मिली।",

    // Chat Placeholder
    "chat.btn_label": "कॉलेजों के बारे में पूछें",
    "chat.title": "कॉलेज प्रवेश सहायक",
    "chat.coming_soon": "एआई चैटबॉट जल्द आ रहा है!",
    "chat.desc": "हमारी टीम एक बुद्धिमान आरएजी (RAG) एआई मॉडल जोड़ रही है जो कॉलेज के माहौल, हॉस्टल, पाठ्यक्रम और प्रवेश संभावनाओं पर आपके सवालों का जवाब देगा।",
    "chat.input_placeholder": "एक सवाल पूछें (जल्द उपलब्ध)...",
    "chat.close": "बंद करें",

    // Footer
    "footer.disclaimer": "अस्वीकरण: सभी कटऑफ, फीस, प्लेसमेंट और छात्रवृत्ति आंकड़े कृत्रिम (मॉक) डेटा हैं और केवल शैक्षणिक प्रदर्शन के लिए हैं।",
    "footer.built_with": "राजस्थान के इंजीनियरिंग छात्रों के लिए शुद्ध वेब मानकों से निर्मित।"
  }
};

/**
 * i18n Controller Object
 */
const I18n = {
  // Get active language code ('en' or 'hi')
  getCurrentLang() {
    try {
      return localStorage.getItem('reap_compass_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  },

  // Set active language, update HTML tag and translate the DOM
  setLang(lang) {
    if (!TRANSLATIONS[lang]) lang = 'en';
    try {
      localStorage.setItem('reap_compass_lang', lang);
    } catch (e) {}

    document.documentElement.lang = lang;
    this.translateDOM();

    // Dispatch a custom event so page scripts can re-render dynamic content
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  // Toggle between English and Hindi
  toggleLang() {
    const nextLang = this.getCurrentLang() === 'en' ? 'hi' : 'en';
    this.setLang(nextLang);
  },

  // Lookup translation string by key with parameter interpolation
  t(key, params = {}) {
    const lang = this.getCurrentLang();
    let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || 
               (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) || 
               key;

    // Replace {placeholder} tokens
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  },

  // Automatically translate all elements with data-i18n attributes in the document
  translateDOM(container = document) {
    const elements = container.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // Translate placeholders if specified
    const placeholders = container.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // Translate titles/tooltips
    const titles = container.querySelectorAll('[data-i18n-title]');
    titles.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Update language toggle button label
    const toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.textContent = this.t('lang.toggle');
    });
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.I18n = I18n;
  window.t = (key, params) => I18n.t(key, params);
}
