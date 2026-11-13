# Rajasthan Engineering College Recommender (Frontend Only)

A student-first web application designed to help Rajasthan students choose the right engineering college. Students enter their entrance exam (JEE Main, JEE Advanced, BITSAT, REAP), rank/score, category, domicile, and priorities (fees, placements, location, reputation). The platform returns ranked recommendations, admission chance classifications (Safe, Target, Reach), dynamic "Why it fits" rationales, and side-by-side trade-off breakdowns.

Built by a first-year B.Tech beginner as a portfolio frontend project.

---

## 🚀 Tech Rules & Architecture

- **Vanilla Web Technologies Only**: Pure HTML5, CSS3, and ES6 JavaScript. No React, no build steps, no package managers required.
- **Run Anywhere**: Runs out-of-the-box by double-clicking `index.html` directly in any web browser (`file://`) or via the **VS Code Live Server** extension.
- **Beginner-Friendly Code**: Separates data, recommendation algorithms, internationalization, and UI rendering into distinct, well-commented modules.
- **Bilingual (English & हिन्दी)**: Full bilingual UI with flexible layout design that gracefully accommodates English and Hindi text strings.

---

## 📁 Folder Structure

```
c:/Reap_compass/
├── index.html                  # Landing page (hero, value prop, CTA, feature highlights, quick stats)
├── find.html                   # 2-step input wizard (About You + Priority Sliders)
├── results.html                # Ranked recommendation cards, filters, and compare selection
├── compare.html                # Side-by-side comparison table + "You Gain / You Lose" trade-offs
├── branch-vs-college.html      # Option A vs Option B decision helper (branch vs college prestige)
├── scholarships.html           # Scholarship search filterable by category and annual family income
├── README.md                   # Project documentation and developer guide
├── css/
│   └── styles.css              # Design tokens (colors, 8px grid, Poppins/Inter fonts, components)
└── js/
    ├── data.js                 # Converted dataset (20 colleges, 904 cutoffs, 40 placements, 44 scholarships)
    ├── recommender.js          # Core scoring logic, eligibility filters, BITSAT score handling, explanations
    ├── i18n.js                 # English and Hindi text dictionary + reactive translation controller
    └── app.js                  # Shared navbar, sticky demo banner, language toggle, and floating chat widget
```

---

## 🛠️ How to Run Locally

### Option 1: Direct File Open (Easiest)
1. Open the project folder `c:/Reap_compass` in File Explorer.
2. Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

### Option 2: VS Code Live Server
1. Open `c:/Reap_compass` in Visual Studio Code.
2. Right-click `index.html` and click **"Open with Live Server"**.
3. The website will open at `http://127.0.0.1:5500/index.html`.

---

## 🤖 Teammate Integration Guide (ML & RAG Chatbot)

This frontend was deliberately structured so your teammates can easily plug in the Machine Learning recommendation model and RAG-powered chatbot without modifying HTML markup:

### 1. Connecting the Machine Learning (ML) Model
- Open [`js/recommender.js`](file:///c:/Reap_compass/js/recommender.js).
- Look for `Recommender.calculateWeightedMatchScore()` and `Recommender.assessChanceTag()`.
- Currently, these functions use clean rule-based algorithms. Your teammate can replace them with an asynchronous `fetch()` call to a Python FastAPI/Flask backend hosting a trained Random Forest or MCDM model:
  ```javascript
  // Example future ML hook:
  async function fetchMLPredictions(profile) {
    const res = await fetch('http://localhost:8000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return await res.json();
  }
  ```

### 2. Connecting the RAG Chatbot API
- Open [`js/app.js`](file:///c:/Reap_compass/js/app.js).
- Locate the method `App.initChatWidget()`.
- Under the comment banner `FUTURE TEAMMATE / DEVELOPER HOOK FOR RAG CHATBOT`, replace the placeholder form with an active API call to your LangChain / LlamaIndex retrieval endpoint:
  ```javascript
  // Example future RAG hook:
  fetch('http://localhost:8000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: userQuery,
      studentProfile: sessionStorage.getItem('reap_student_profile')
    })
  });
  ```

### 3. Replacing Synthetic Mock Data with Real SOURCED Data
- Open [`js/data.js`](file:///c:/Reap_compass/js/data.js).
- The mock data objects strictly match the Excel dataset schema (`College ID`, `Closing Value`, `Avg Package (LPA)`, `Annual Tuition (INR)`, etc.).
- When real counseling data is verified, update the rows in `COLLEGES_DATA` and change `'Data Status': 'MOCK'` to `'Data Status': 'SOURCED'`. The UI will automatically switch the grey "Demo Data" badge to the green verified badge.

---

## 🎨 Design System
- **Deep Indigo (`#2B3A8C`)**: Primary brand color representing trust and academic authority.
- **Saffron (`#F59E0B`)**: Warm accent dot and highlights.
- **Soft Background (`#F7F8FC`) & Cards (`#FFFFFF`)**: Clean, low-stress readability for anxious students.
- **Chance Tag Colors**: Safe (Emerald `#16A34A`), Target (Warm Amber `#D97706`), Reach (Ruby `#E11D48`).
- **Demo Banner (`#FEF3C7`)**: Transparent warning banner on every page.
