/**
 * js/api.js: the website's phone line to the Python backend.
 *
 * Every call has a BACKUP. If the server is off, the website quietly uses
 * the copy of the data (js/data.js) and the chef (js/recommender.js) that
 * live inside the browser, so nothing ever breaks.
 *
 *   source: 'api'    -> the Python server answered
 *   source: 'local'  -> the browser's own backup was used
 */
const API_BASE = 'http://127.0.0.1:8000';

const API = {
  // ---------------------------------------------------------------
  // Shared helpers: every real call below goes through these two
  // ---------------------------------------------------------------
  async _call(method, path, body) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);   // give up after 4 seconds
    try {
      const res = await fetch(API_BASE + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error('Server answered with status ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  },

  // Small label "Powered by ..." so you can SEE who did the work.
  // `where` = a CSS selector for the element the label is added to.
  badge(source, where) {
    let pill = document.getElementById('source-pill');
    if (!pill) {
      pill = document.createElement('span');
      pill.id = 'source-pill';
      pill.className = 'summary-pill';
      pill.style.cssText = 'display:inline-block; margin-top:8px;';
      const host = document.querySelector(where || 'main .container > div');
      if (host) host.appendChild(pill);
    }
    pill.textContent = source === 'api' ? '⚙️ Powered by: Python API' : '💻 Powered by: Browser (offline mode)';
  },

  // ---------------------------------------------------------------
  // 1. Load ALL the data (colleges, cutoffs, placements, scholarships)
  //    One call to /data. On success the pages use the server's data;
  //    on failure they keep the copy from data.js. Runs only once.
  // ---------------------------------------------------------------
  loadData() {
    if (!this._dataPromise) {
      this._dataPromise = (async () => {
        try {
          const d = await this._call('GET', '/data');
          if (!d.colleges.length || !d.cutoffs.length) throw new Error('server sent empty data');
          window.COLLEGES_DATA = d.colleges;
          window.CUTOFFS_DATA = d.cutoffs;
          window.PLACEMENTS_DATA = d.placements;
          window.SCHOLARSHIPS_DATA = d.scholarships;
          return { source: 'api' };
        } catch (err) {
          console.warn('Backend not reachable, using data.js copy:', err.message);
          return { source: 'local' };
        }
      })();
    }
    return this._dataPromise;
  },

  // ---------------------------------------------------------------
  // 2. results.html -> ranked colleges for a student profile
  // ---------------------------------------------------------------
  async recommend(profile) {
    try {
      return { results: await this._call('POST', '/recommend', profile), source: 'api' };
    } catch (err) {
      console.warn('Backend not reachable, using local recommender:', err.message);
      const local = window.Recommender ? window.Recommender.recommend(profile) : [];
      return { results: local, source: 'local' };
    }
  },

  // ---------------------------------------------------------------
  // 3. compare.html -> table + "You gain / You give up" for 2-3 colleges
  //    data = null when the server is off (the page then builds it itself)
  // ---------------------------------------------------------------
  async compare(ids) {
    try {
      return { data: await this._call('POST', '/compare', { ids }), source: 'api' };
    } catch (err) {
      console.warn('Backend not reachable, comparing in the browser:', err.message);
      return { data: null, source: 'local' };
    }
  },

  // ---------------------------------------------------------------
  // 4. branch-vs-college.html -> verdict for (college A + branch A) vs (college B + branch B)
  // ---------------------------------------------------------------
  async branchVsCollege(collegeA, branchA, collegeB, branchB) {
    try {
      const body = { collegeA, branchA, collegeB, branchB };
      return { data: await this._call('POST', '/branch-vs-college', body), source: 'api' };
    } catch (err) {
      console.warn('Backend not reachable, judging in the browser:', err.message);
      return { data: null, source: 'local' };
    }
  },

  // ---------------------------------------------------------------
  // 5. find.html -> branch checkboxes (null = use the typed-in list)
  // ---------------------------------------------------------------
  async branches() {
    try {
      return { list: await this._call('GET', '/branches'), source: 'api' };
    } catch (err) {
      console.warn('Backend not reachable, using built-in branch list:', err.message);
      return { list: null, source: 'local' };
    }
  },

  // ---------------------------------------------------------------
  // 6. index.html -> real counts for the home page (null = leave as typed)
  // ---------------------------------------------------------------
  async stats() {
    try {
      return { stats: await this._call('GET', '/stats'), source: 'api' };
    } catch (err) {
      return { stats: null, source: 'local' };
    }
  }
};

window.API = API;