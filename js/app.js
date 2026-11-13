/**
 * Rajasthan Engineering College Recommender
 * App Shell Module (js/app.js)
 * 
 * Manages shared components:
 * 1. Sticky Demo Banner: "Demo data, not for real decisions."
 * 2. Navbar & Mobile Menu toggle
 * 3. Language Switcher (EN <-> HI)
 * 4. Floating Chat Placeholder ("Ask about colleges")
 * 5. Compare Selection persistence (sessionStorage)
 */

const App = {
  init() {
    this.renderBanner();
    this.initNavbar();
    this.initLangToggle();
    this.initChatWidget();
    this.initCompareBarListener();

    // Initial translation pass
    if (window.I18n) {
      document.documentElement.lang = window.I18n.getCurrentLang();
      window.I18n.translateDOM();
    }
  },

  /**
   * 1. Sticky Demo Banner
   * Displays on top of every page as specified: "Demo data, not for real decisions."
   */
  renderBanner() {
    // If banner element already exists in HTML, just bind text
    let banner = document.querySelector('.demo-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'demo-banner';
      banner.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span data-i18n="banner.demo">${window.t ? window.t('banner.demo') : 'Demo data, not for real decisions.'}</span>
      `;
      document.body.insertBefore(banner, document.body.firstChild);
    }
  },

  /**
   * 2. Navbar Setup
   * Highlights active link and attaches mobile toggle handlers
   */
  initNavbar() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mobile Hamburger button
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const linksContainer = document.querySelector('.nav-links');
    if (menuBtn && linksContainer) {
      menuBtn.addEventListener('click', () => {
        linksContainer.classList.toggle('show');
      });
    }
  },

  /**
   * 3. Language Toggle
   */
  initLangToggle() {
    const toggleBtns = document.querySelectorAll('.lang-toggle');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.I18n) {
          window.I18n.toggleLang();
        }
      });
    });
  },

  /**
   * 4. Floating Chatbot Placeholder ("Ask about colleges")
   * Non-functional mockup with comments indicating where RAG API integrates.
   */
  initChatWidget() {
    let chatBtn = document.querySelector('.chat-float-btn');
    let chatPanel = document.querySelector('.chat-panel');

    if (!chatBtn) {
      chatBtn = document.createElement('button');
      chatBtn.className = 'chat-float-btn';
      chatBtn.setAttribute('aria-label', 'Ask about colleges');
      chatBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span data-i18n="chat.btn_label">${window.t ? window.t('chat.btn_label') : 'Ask about colleges'}</span>
      `;
      document.body.appendChild(chatBtn);
    }

    if (!chatPanel) {
      chatPanel = document.createElement('div');
      chatPanel.className = 'chat-panel';
      chatPanel.innerHTML = `
        <div class="chat-header">
          <h4>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span data-i18n="chat.title">College Counseling Assistant</span>
          </h4>
          <button class="chat-close-btn" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-body">
          <div class="chat-placeholder-icon">🤖</div>
          <div class="chat-coming-soon" data-i18n="chat.coming_soon">AI Chatbot Coming Soon!</div>
          <p class="chat-desc" data-i18n="chat.desc">
            Our team is connecting a RAG-based AI model that answers detailed questions about college culture, hostels, syllabus, and admission chances.
          </p>
        </div>
        <div class="chat-input-area">
          <input type="text" data-i18n-placeholder="chat.input_placeholder" placeholder="Ask a question (coming soon)..." disabled />
          <button class="btn btn-primary btn-sm" disabled style="opacity:0.6;">Send</button>
        </div>
      `;
      document.body.appendChild(chatPanel);
    }

    /* ----------------------------------------------------------------------
       FUTURE TEAMMATE / DEVELOPER HOOK FOR RAG CHATBOT:
       ----------------------------------------------------------------------
       1. Replace the disabled input in .chat-input-area with an active form.
       2. On form submit, send POST request to the RAG backend endpoint:
          fetch('https://api.reapcompass.internal/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userQuery, context: sessionStorage.getItem('student_profile') })
          })
       3. Stream response tokens into .chat-body message list.
       ---------------------------------------------------------------------- */

    chatBtn.addEventListener('click', () => {
      chatPanel.classList.toggle('active');
    });

    const closeBtn = chatPanel.querySelector('.chat-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        chatPanel.classList.remove('active');
      });
    }
  },

  /**
   * 5. Compare List Helper (using sessionStorage)
   */
  getCompareList() {
    try {
      const data = sessionStorage.getItem('reap_compass_compare');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  setCompareList(list) {
    try {
      sessionStorage.setItem('reap_compass_compare', JSON.stringify(list.slice(0, 3)));
      window.dispatchEvent(new CustomEvent('compareListChanged', { detail: { list } }));
    } catch (e) {}
  },

  addToCompare(collegeId) {
    const list = this.getCompareList();
    if (!list.includes(collegeId)) {
      if (list.length >= 3) {
        alert(window.t ? 'You can compare at most 3 colleges at once.' : 'You can compare at most 3 colleges at once.');
        return false;
      }
      list.push(collegeId);
      this.setCompareList(list);
    }
    return true;
  },

  removeFromCompare(collegeId) {
    let list = this.getCompareList();
    list = list.filter(id => id !== collegeId);
    this.setCompareList(list);
  },

  initCompareBarListener() {
    // Renders the sticky bottom compare bar if comparisons are active
    const updateBar = () => {
      const list = this.getCompareList();
      let bar = document.querySelector('.compare-floating-bar');
      
      // If we are already on compare.html, do not show the floating jump bar
      if (window.location.pathname.endsWith('compare.html')) {
        if (bar) bar.remove();
        return;
      }

      if (list.length > 0) {
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'compare-floating-bar';
          document.body.appendChild(bar);
        }
        bar.classList.add('show');
        
        // Find college names
        const names = list.map(id => {
          const col = window.COLLEGES_DATA ? window.COLLEGES_DATA.find(c => c['College ID'] === id) : null;
          return col ? col['College Name'] : id;
        });

        bar.innerHTML = `
          <div class="compare-pills">
            ${names.map(name => `
              <span class="compare-pill">
                ${name.length > 18 ? name.substring(0, 18) + '...' : name}
              </span>
            `).join('')}
          </div>
          <span style="font-size:0.875rem; font-weight:600;">(${list.length}/3)</span>
          <a href="compare.html" class="btn btn-accent btn-sm" data-i18n="results.compare.btn">
            ${window.t ? window.t('results.compare.btn') : 'Compare Now →'}
          </a>
        `;
      } else if (bar) {
        bar.classList.remove('show');
      }
    };

    window.addEventListener('compareListChanged', updateBar);
    window.addEventListener('DOMContentLoaded', updateBar);
  }
};

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

if (typeof window !== 'undefined') {
  window.App = App;
}
