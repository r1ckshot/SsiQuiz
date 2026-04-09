const App = (() => {
  // ─── State ────────────────────────────────────────────────────
  let activeTab   = 'sections'; // 'sections' | 'progress'
  let selSection  = null;       // null | section id (full-screen view)
  let lastResults = null;

  const ICONS = {1:'🤖',2:'🐍',3:'🔧',4:'📊',5:'🧠',6:'🔍',7:'🕸️',8:'🧬'};
  const hd  = () => document.getElementById('hd');
  const app = () => document.getElementById('app');

  // ─── Touch scroll guard ───────────────────────────────────────
  let _didScroll = false;
  document.addEventListener('touchstart', () => { _didScroll = false; }, {passive:true});
  document.addEventListener('touchmove',  () => { _didScroll = true;  }, {passive:true});

  function optTap(e, mode, idx) {
    if (_didScroll) return;
    e.preventDefault();
    if      (mode === 'learn') learnToggle(idx);
    else if (mode === 'quiz')  quizToggle(idx);
    else if (mode === 'exam')  examToggle(idx);
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function sec(id) { return (window.SECTIONS||[]).find(s=>s.id===id); }
  function pct(st) { return st.total===0 ? 0 : Math.round(st.know/st.total*100); }

  function checkSvg() {
    return `<svg viewBox="0 0 12 12" fill="none" stroke="#020f05"
      stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="2,6 5,9 10,3"/></svg>`;
  }

  function ring(p, size, color, sw) {
    sw = sw || 8;
    const r   = size/2 - sw/2 - 1;
    const C   = +(2*Math.PI*r).toFixed(1);
    const off = +(C*(1-p/100)).toFixed(1);
    const uid = '_r' + Math.random().toString(36).slice(2, 8);
    // Two rAF frames ensure element is in DOM before transition fires
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(uid);
      if (el) el.style.strokeDashoffset = off;
    }));
    return `<div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0;animation:liftIn .4s ease both">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--bg3)" stroke-width="${sw}"/>
        <circle id="${uid}" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}"
          stroke-width="${sw}" stroke-dasharray="${C}" stroke-dashoffset="${C}"
          stroke-linecap="round" style="transition:stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
        <span style="font-family:'JetBrains Mono',monospace;font-size:${Math.round(size*.18)}px;font-weight:700;color:${color}">${p}%</span>
      </div>
    </div>`;
  }

  function pbar(p, color) {
    const bg = color || 'var(--green-grad)';
    return `<div class="pbar-wrap" style="flex:unset"><div class="pbar-fill" style="background:${bg};width:${p}%"></div></div>`;
  }

  function badges(st) {
    return `<div class="badges">
      <span class="badge know">✓ ${st.know}</span>
      <span class="badge partial">~ ${st.partial}</span>
      <span class="badge unknown">? ${st.unknown}</span>
    </div>`;
  }

  function backArrow() {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  // ─── Header ───────────────────────────────────────────────────
  function hdTabs() {
    hd().innerHTML = `
      <span class="hd-logo" onclick="App.goHome()">SSI</span>
      <div class="tab-bar">
        <button class="tab ${activeTab==='sections'?'active':''}" onclick="App.setTab('sections')">Sekcje</button>
        <button class="tab ${activeTab==='progress'?'active':''}" onclick="App.setTab('progress')">Postęp</button>
      </div>`;
  }

  function hdQuiz(label, backFn, backLabel, timerVal) {
    hd().innerHTML = `
      <button class="hd-back" onclick="${backFn}()">${backArrow()} ${esc(backLabel)}</button>
      <span class="hd-counter" id="hd-counter">${esc(label)}</span>
      ${timerVal != null ? `<div id="hd-timer" class="hd-timer">${Quiz.formatTime(timerVal)}</div>` : ''}`;
  }

  // ─── Tab & routing ────────────────────────────────────────────
  function setTab(tab) {
    activeTab  = tab;
    selSection = null;
    Quiz.stop();
    render();
  }

  function goHome() { setTab('sections'); }

  function render() {
    hdTabs();
    if (activeTab === 'sections') {
      if (selSection) _renderSectionDetail(selSection);
      else _renderSectionsGrid();
    } else {
      _renderProgressTab();
    }
  }

  // ─── Sekcje — card grid ───────────────────────────────────────
  function _renderSectionsGrid() {
    const sections = window.SECTIONS || [];
    const cards = sections.map((s,i) => {
      const st = ProgressManager.getStats(s.id);
      const sp = pct(st);
      return `<div class="sec-card" style="--sc:${s.color};animation-delay:${i*.04}s"
          onclick="App.openSection(${s.id})">
        <div class="sec-card-icon">${ICONS[s.id]||'📚'}</div>
        <div class="sec-card-name">${esc(s.name)}</div>
        <div class="sec-card-meta">S${s.id} · Q${s.range[0]}–${s.range[1]}</div>
        <div class="sec-card-prog">
          <div class="pbar-wrap"><div class="pbar-fill" style="background:${s.color};width:${sp}%"></div></div>
          <span class="sec-card-pct">${sp}%</span>
        </div>
      </div>`;
    }).join('');

    app().innerHTML = `<div class="sections-page">
      <div class="sec-grid">${cards}</div>
      <div class="sec-actions">
        <button class="btn btn-primary" onclick="App.startExam()">🎓 Egzamin</button>
        <button class="btn btn-ghost" onclick="App.openGlobalCheatsheet()">📋 Szpargałka</button>
      </div>
    </div>`;
  }

  function openSection(id) {
    selSection = id;
    ProgressManager.setLastSection(id);
    hdTabs();
    _renderSectionDetail(id);
  }

  function goToSection(id) {
    activeTab  = 'sections';
    selSection = id;
    ProgressManager.setLastSection(id);
    render();
  }

  function backToGrid() {
    selSection = null;
    _renderSectionsGrid();
  }

  function _renderSectionDetail(id) {
    const s  = sec(id);
    if (!s) return;
    const st = ProgressManager.getStats(id);
    const sp = pct(st);

    app().innerHTML = `<div class="sec-detail-page">
      <div class="sd-inner">

        <button class="sd-back" onclick="App.backToGrid()">${backArrow()} Sekcje</button>

        <div class="sd-hero">
          <span class="sd-icon">${ICONS[id]||'📚'}</span>
          <div>
            <div class="sd-title">${esc(s.name)}</div>
            <div class="sd-sub" style="color:${s.color}">Sekcja ${s.id} · Q${s.range[0]}–${s.range[1]}</div>
          </div>
        </div>

        <div class="sd-progress-row">
          ${ring(sp, 80, s.color, 7)}
          <div class="sd-badges">
            <div style="font-size:.88rem;font-weight:600;color:var(--text);margin-bottom:8px">Postęp sekcji</div>
            ${badges(st)}
          </div>
        </div>

        <div class="sd-mode-list" style="--sc:${s.color}">
          <button class="sd-mode-btn" onclick="App.openLearnModal(${id})">
            <span class="sd-mode-icon">📖</span>
            <div>
              <div class="sd-mode-title">Nauka</div>
              <div class="sd-mode-desc">Odpowiadaj i oceniaj siebie · postęp jest zapisywany</div>
            </div>
          </button>
          <button class="sd-mode-btn" onclick="App.startQuiz(${id})">
            <span class="sd-mode-icon">⚡</span>
            <div>
              <div class="sd-mode-title">Quiz</div>
              <div class="sd-mode-desc">Odpowiadaj na pytania · wynik na końcu</div>
            </div>
          </button>
          <button class="sd-mode-btn" onclick="App.openSectionCheatsheet(${id})">
            <span class="sd-mode-icon">📋</span>
            <div>
              <div class="sd-mode-title">Szpargałka</div>
              <div class="sd-mode-desc">Kluczowe wzorce i skróty dla tej sekcji</div>
            </div>
          </button>
        </div>

        <div class="sd-reset" style="margin-top:14px;display:flex;justify-content:flex-end">
          <button class="btn btn-ghost" style="font-size:.82rem;padding:7px 16px;opacity:.7"
            onclick="App.resetSection(${id})">↺ Reset postępu sekcji</button>
        </div>

      </div>
    </div>`;
  }

  // ─── Cheatsheets (modal) ──────────────────────────────────────
  function _csPat(p, i) {
    let exHtml = '';
    if (p.examples && p.examples.length) {
      const list = Array.isArray(p.examples) ? p.examples : [p.examples];
      exHtml = `<div class="cs-pat-ex">${list.map(e => `❌ ${esc(e)}`).join('\n')}</div>`;
    }
    return `<div class="cs-pat" style="animation-delay:${i*.03}s">
      <div class="cs-pat-name">${esc(p.name)}</div>
      <div class="cs-pat-desc">${esc(p.desc)}</div>
      ${exHtml}
    </div>`;
  }

  function openGlobalCheatsheet() {
    const cs = window.CHEATSHEETS || {};
    let html = '';
    if (cs.global && cs.global.patterns && cs.global.patterns.length) {
      html += cs.global.patterns.map(_csPat).join('');
    }
    openModal('📋 Szpargałka globalna', html || '<p style="color:var(--text3)">Brak treści globalnej szpargałki.</p>');
  }

  function openSectionCheatsheet(id) {
    const s  = sec(id);
    const cs = ((window.CHEATSHEETS||{}).sections||{})[id];
    const html = cs && cs.patterns && cs.patterns.length
      ? cs.patterns.map(_csPat).join('')
      : `<p style="color:var(--text3);font-size:.9rem">Brak szpargałki dla tej sekcji.</p>`;
    openModal(`📋 ${s ? esc(s.name) : 'Szpargałka'}`, html);
  }

  function openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.add('open');
  }

  function closeModal(e) {
    if (e && e.target !== document.getElementById('modal')) return;
    const m = document.getElementById('modal');
    if (!m.classList.contains('open')) return;
    m.classList.add('closing');
    setTimeout(() => m.classList.remove('open', 'closing'), 150);
  }

  // ─── Postęp tab ───────────────────────────────────────────────
  function _renderProgressTab() {
    const sections = window.SECTIONS || [];
    const gs   = ProgressManager.getStats();
    const gp   = pct(gs);
    const hist = ProgressManager.getExamHistory();

    const bars = sections.map((s,i) => {
      const st = ProgressManager.getStats(s.id);
      const sp = pct(st);
      return `<div class="sec-bar-row" style="--sc:${s.color};animation-delay:${i*.04}s"
          onclick="App.goToSection(${s.id})">
        <span class="sec-bar-icon">${ICONS[s.id]||'📚'}</span>
        <div class="sec-bar-info">
          <div class="sec-bar-name">${esc(s.name)}</div>
          <div class="sec-bar-track"><div class="sec-bar-fill" style="width:${sp}%"></div></div>
        </div>
        <span class="sec-bar-pct">${sp}%</span>
      </div>`;
    }).join('');

    const histRows = hist.length
      ? hist.slice(0,10).map(h => {
          const d  = new Date(h.date);
          const ds = `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          const p  = Math.round(h.score/h.total*100);
          return `<tr>
            <td style="font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--text3)">${ds}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:600;color:${p>=60?'var(--green)':'var(--red)'}">${p}%</td>
            <td style="color:var(--text2)">${h.score}/${h.total}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:22px;font-size:.88rem">Brak historii egzaminów</td></tr>`;

    app().innerHTML = `<div class="progress-page">
      <div class="big-ring-wrap">
        ${ring(gp, 120, 'var(--green)', 10)}
        <div class="big-ring-info">
          <div class="big-ring-title">Całkowity postęp</div>
          <div class="big-ring-sub">${gs.total} pytań · ${gs.know} opanowanych</div>
          ${badges(gs)}
          <div class="progress-reset-row">
            <button class="btn btn-ghost" onclick="App.resetSectionProgress()">↺ Reset sekcji</button>
            <button class="btn btn-ghost" onclick="App.resetExams()">↺ Reset egzaminów</button>
          </div>
        </div>
      </div>

      <div class="section-heading" style="animation:liftIn .25s ease both;animation-delay:.1s">Postęp per sekcja</div>
      <div class="sec-bars">${bars}</div>

      <div class="divider" style="animation:fadeIn .3s ease both;animation-delay:.15s"></div>
      <div class="section-heading" style="animation:liftIn .25s ease both;animation-delay:.18s">Historia egzaminów</div>
      <table class="hist-table" style="animation:liftIn .3s ease both;animation-delay:.22s">
        <thead><tr><th>Data</th><th>Wynik</th><th>Pkt</th></tr></thead>
        <tbody>${histRows}</tbody>
      </table>
    </div>`;
  }

  // ─── Learn mode ───────────────────────────────────────────────
  function openLearnModal(id) {
    const s     = sec(id);
    const color = s ? s.color : 'var(--green)';
    const total = (window.QUESTIONS||[]).filter(q => q.section === id).length;
    const weak  = (window.QUESTIONS||[]).filter(q => {
      const b = ProgressManager.getBucket(q.id);
      return q.section === id && (b === 'partial' || b === 'unknown');
    }).length;

    const html = `<div style="display:flex;flex-direction:column;gap:10px;--sc:${color}">
      <button class="sd-mode-btn" onclick="App.closeModal();App.startLearn(${id},'all')">
        <span class="sd-mode-icon">📚</span>
        <div>
          <div class="sd-mode-title">Wszystkie pytania</div>
          <div class="sd-mode-desc">${total} pytań · losowa kolejność</div>
        </div>
      </button>
      <button class="sd-mode-btn${weak===0?' disabled':''}"
        ${weak>0?`onclick="App.closeModal();App.startLearn(${id},'weak')"`:''}>
        <span class="sd-mode-icon">🎯</span>
        <div>
          <div class="sd-mode-title">Tylko słabe</div>
          <div class="sd-mode-desc">${weak>0
            ? `${weak} pytań · nie znam + częściowo`
            : 'Wszystkie pytania opanowane! 🎉'}</div>
        </div>
      </button>
    </div>`;

    openModal(`📖 Nauka — ${s ? esc(s.name) : ''}`, html);
  }

  function startLearn(sectionId, filter) {
    Quiz.stop();
    Quiz.start('learn', sectionId||0, filter||'all');
    _learnQ();
  }

  function _learnQ() {
    const s = Quiz.getState();
    const q = Quiz.currentQuestion();
    if (!q) { _learnDone(); return; }

    const section  = sec(q.section);
    const color    = section ? section.color : 'var(--green)';
    const total    = s.questions.length;
    const num      = s.current + 1;
    const fillPct  = Math.round((num-1)/total*100);
    const backLbl  = s.sectionId ? `S${s.sectionId}` : 'Sekcje';

    hdQuiz(`Nauka · ${num} / ${total}`, 'App.backFromQuiz', backLbl);

    app().innerHTML = `<div class="quiz-layout">
      <div class="quiz-strip"><div class="quiz-strip-fill" id="qsf" style="width:${fillPct}%"></div></div>
      <div class="quiz-body">
        <div class="q-card" id="q-card">
          <div class="q-meta">
            <span class="q-chip" style="color:${color};border-color:${color}">S${q.section}</span>
            <span class="q-id">#${q.id}</span>
          </div>
          <div class="q-text">${esc(q.question)}</div>
          <div class="opts" id="opts">${q.options.map((o,i)=>`
            <div class="opt" id="opt-${i}" onclick="App.learnToggle(${i})" ontouchend="App.optTap(event,'learn',${i})">
              <div class="opt-box">${checkSvg()}</div>
              <div class="opt-text">${esc(o)}</div>
            </div>`).join('')}
          </div>
          <div id="bucket-area"></div>
        </div>
      </div>
      <div class="quiz-footer">
        <button class="btn btn-primary" id="btn-check" onclick="App.learnCheck()">Sprawdź</button>
        <button class="btn btn-ghost" onclick="App.backFromQuiz()">Zakończ</button>
      </div>
    </div>`;
  }

  function learnToggle(idx) {
    if (!Quiz.toggleOption(idx)) return;
    const s = Quiz.getState();
    document.querySelectorAll('.opt').forEach((el,i) =>
      el.classList.toggle('selected', s.selected.includes(i)));
  }

  function learnCheck() {
    const q = Quiz.currentQuestion();
    if (!q) return;
    const r = Quiz.check();
    if (!r) return;

    document.querySelectorAll('.opt').forEach((el,i) => {
      el.classList.add('disabled'); el.classList.remove('selected');
      if      (r.correct.includes(i) && r.selected.includes(i))  el.classList.add('correct');
      else if (r.selected.includes(i) && !r.correct.includes(i)) el.classList.add('wrong');
      else if (r.correct.includes(i) && !r.selected.includes(i)) el.classList.add('missed');
    });

    document.querySelectorAll('.opt.wrong').forEach(el => {
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    });
    document.getElementById('bucket-area').innerHTML = `
      <div class="bucket-row">
        <button class="btn-bucket know"    onclick="App.learnBucket('know')">✓ Wiem</button>
        <button class="btn-bucket partial" onclick="App.learnBucket('partial')">~ Częściowo</button>
        <button class="btn-bucket unknown" onclick="App.learnBucket('unknown')">✗ Nie wiem</button>
      </div>`;
    document.getElementById('btn-check').style.display = 'none';
  }

  function learnBucket(bucket) {
    Quiz.setBucket(bucket);
    const card = document.getElementById('q-card');
    if (card) {
      card.classList.add('exit');
      setTimeout(() => { Quiz.next(); _learnQ(); }, 150);
    } else { Quiz.next(); _learnQ(); }
  }

  function _learnDone() {
    const s      = Quiz.getState();
    const sid    = s ? s.sectionId : 0;
    const filter = s ? s.filter : 'all';
    const sec_   = sec(sid);
    const st     = ProgressManager.getStats(sid||0);

    // For weak mode: show how many of studied questions are now 'know'
    let barPct, barLabel;
    if (filter === 'weak' && s) {
      const nowKnow = s.questions.filter(q => ProgressManager.getBucket(q.id) === 'know').length;
      barPct   = s.questions.length > 0 ? Math.round(nowKnow / s.questions.length * 100) : 0;
      barLabel = `${nowKnow} / ${s.questions.length} opanowanych w tej sesji`;
    } else {
      barPct   = pct(st);
      barLabel = `${st.know} / ${st.total} opanowanych w sekcji`;
    }

    const modeLabel = filter === 'weak' ? '🎯 Tylko słabe' : '📚 Wszystkie pytania';
    const secLabel  = sec_ ? `${sec_.name}` : '';

    hdTabs();
    app().innerHTML = `<div class="done-wrap">
      <div class="done-card">
        <div class="done-emoji">🎉</div>
        <div class="done-title">Sesja zakończona!</div>
        <div class="done-sub" style="margin-bottom:4px">${secLabel ? esc(secLabel) + ' · ' : ''}${modeLabel}</div>
        <div class="done-sub" style="margin-bottom:14px">Przerobiono ${s ? s.questions.length : 0} pytań</div>
        ${pbar(barPct)}
        <div style="margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--text3)">${barLabel}</div>
        <div style="margin-top:10px">${badges(st)}</div>
        <div class="btn-row" style="margin-top:24px;justify-content:center">
          <button class="btn btn-primary" onclick="App.openLearnModal(${sid})">🔄 Jeszcze raz</button>
          <button class="btn btn-secondary" onclick="App.setTab('sections')">← Sekcje</button>
        </div>
      </div>
    </div>`;
  }

  // ─── Quiz mode ────────────────────────────────────────────────
  function startQuiz(sectionId) {
    Quiz.stop();
    Quiz.start('quiz', sectionId||0);
    _quizQ();
  }

  function _quizQ() {
    const s = Quiz.getState();
    const q = Quiz.currentQuestion();
    if (!q) { _finishSession(); return; }

    const section = sec(q.section);
    const color   = section ? section.color : 'var(--green)';
    const total   = s.questions.length;
    const num     = s.current + 1;
    const fillPct = Math.round((num-1)/total*100);
    const backLbl = s.sectionId ? `S${s.sectionId}` : 'Sekcje';

    hdQuiz(`Quiz · ${num} / ${total}`, 'App.backFromQuiz', backLbl);

    app().innerHTML = `<div class="quiz-layout">
      <div class="quiz-strip"><div class="quiz-strip-fill" id="qsf" style="width:${fillPct}%"></div></div>
      <div class="quiz-body">
        <div class="q-card" id="q-card">
          <div class="q-meta">
            <span class="q-chip" style="color:${color};border-color:${color}">S${q.section}</span>
            <span class="q-id">#${q.id}</span>
          </div>
          <div class="q-text">${esc(q.question)}</div>
          <div class="opts" id="opts">${q.options.map((o,i)=>`
            <div class="opt" id="opt-${i}" onclick="App.quizToggle(${i})" ontouchend="App.optTap(event,'quiz',${i})">
              <div class="opt-box">${checkSvg()}</div>
              <div class="opt-text">${esc(o)}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="quiz-footer">
        <button class="btn btn-primary" id="btn-check" onclick="App.quizCheck()">Sprawdź</button>
        <button class="btn btn-ghost" onclick="App.backFromQuiz()">Zakończ</button>
      </div>
    </div>`;
  }

  function quizToggle(idx) {
    if (!Quiz.toggleOption(idx)) return;
    const s = Quiz.getState();
    document.querySelectorAll('.opt').forEach((el,i) =>
      el.classList.toggle('selected', s.selected.includes(i)));
  }

  function quizCheck() {
    const q = Quiz.currentQuestion();
    if (!q) return;
    const s = Quiz.getState();
    if (s.selected.length===0 && q.correct.length>0) {
      const btn = document.getElementById('btn-check');
      btn.classList.remove('shake'); void btn.offsetWidth;
      btn.classList.add('shake'); return;
    }
    const r = Quiz.check();
    if (!r) return;
    document.querySelectorAll('.opt').forEach((el,i) => {
      el.classList.add('disabled'); el.classList.remove('selected');
      if      (r.correct.includes(i) && r.selected.includes(i))  el.classList.add('correct');
      else if (r.selected.includes(i) && !r.correct.includes(i)) el.classList.add('wrong');
      else if (r.correct.includes(i) && !r.selected.includes(i)) el.classList.add('missed');
    });
    document.querySelectorAll('.opt.wrong').forEach(el => {
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
    });
    const btn = document.getElementById('btn-check');
    btn.textContent = 'Dalej →';
    btn.onclick = () => {
      const card = document.getElementById('q-card');
      if (card) { card.classList.add('exit'); setTimeout(() => { Quiz.next(); _quizQ(); }, 150); }
      else { Quiz.next(); _quizQ(); }
    };
  }

  function _finishSession() {
    lastResults = Quiz.getSessionResults();
    Quiz.stopTimer();
    renderResults();
  }

  // ─── Exam ─────────────────────────────────────────────────────
  function startExam() {
    selSection = null;
    Quiz.stop();
    Quiz.start('exam', 0);
    _examQ();
    Quiz.startTimer(
      left => {
        const el = document.getElementById('hd-timer');
        if (!el) return;
        el.textContent = Quiz.formatTime(left);
        el.className = 'hd-timer' + (left<60?' crit':left<300?' warn':'');
      },
      () => _finishSession()
    );
  }

  function _examQ() {
    const s = Quiz.getState();
    const q = Quiz.currentQuestion();
    if (!q) { _finishSession(); return; }

    const section = sec(q.section);
    const color   = section ? section.color : 'var(--green)';
    const total   = s.questions.length;
    const num     = s.current + 1;
    const fillPct = Math.round((num-1)/total*100);

    hdQuiz(`Egzamin · ${num} / ${total}`, 'App.examFinish', 'Zakończ', s.timeLeft);

    app().innerHTML = `<div class="quiz-layout">
      <div class="quiz-strip"><div class="quiz-strip-fill" id="qsf" style="width:${fillPct}%"></div></div>
      <div class="quiz-body">
        <div class="q-card" id="q-card">
          <div class="q-meta">
            <span class="q-chip" style="color:${color};border-color:${color}">S${q.section}</span>
            <span class="q-id">#${q.id}</span>
          </div>
          <div class="q-text">${esc(q.question)}</div>
          <div class="opts" id="opts">${q.options.map((o,i)=>`
            <div class="opt" id="opt-${i}" onclick="App.examToggle(${i})" ontouchend="App.optTap(event,'exam',${i})">
              <div class="opt-box">${checkSvg()}</div>
              <div class="opt-text">${esc(o)}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="quiz-footer">
        <button class="btn btn-primary" onclick="App.examNext()">Dalej →</button>
        <button class="btn btn-ghost" onclick="App.examFinish()">Zakończ egzamin</button>
      </div>
    </div>`;
  }

  function examToggle(idx) {
    if (!Quiz.toggleOption(idx)) return;
    const s = Quiz.getState();
    document.querySelectorAll('.opt').forEach((el,i) =>
      el.classList.toggle('selected', s.selected.includes(i)));
  }

  function examNext() {
    Quiz.check();
    const card = document.getElementById('q-card');
    if (card) {
      card.classList.add('exit');
      setTimeout(() => { if (Quiz.next()) _examQ(); else _finishSession(); }, 150);
    } else {
      if (Quiz.next()) _examQ(); else _finishSession();
    }
  }

  function examFinish() {
    const s = Quiz.getState();
    if (s && !s.answered) Quiz.check();
    _finishSession();
  }

  function backFromQuiz() {
    Quiz.stop();
    hdTabs();
    if (selSection) _renderSectionDetail(selSection);
    else _renderSectionsGrid();
  }

  // ─── Results ──────────────────────────────────────────────────
  function renderResults() {
    const r = lastResults;
    if (!r) { setTab('sections'); return; }

    if (r.mode==='exam') {
      ProgressManager.saveExamResult({ score:r.correct, total:r.total, wrong:r.wrong.map(w=>w.id) });
    }
    if (r.percent >= 80) _confetti();

    activeTab = r.mode==='exam' ? 'progress' : activeTab;
    hdTabs();

    const pass  = r.percent >= 60;
    const color = pass ? 'var(--green)' : 'var(--red)';

    const wrongHtml = r.wrong.length
      ? `<div class="section-heading" style="margin-top:0">Błędne odpowiedzi · ${r.wrong.length}</div>
         <div class="wrong-list">${r.wrong.map((w,i) => {
           const s = sec(w.section);
           return `<div class="wrong-item" style="animation-delay:${i*.02}s">
             <div class="wrong-meta">#${w.id} · <span style="color:${s?s.color:'var(--text3)'}">S${w.section}</span></div>
             ${esc(w.question.length>95 ? w.question.slice(0,95)+'…' : w.question)}
           </div>`;
         }).join('')}</div>`
      : `<p style="color:var(--green);font-weight:600;margin-bottom:20px">✓ Bezbłędnie!</p>`;

    let breakdown = '';
    if (r.mode==='exam') {
      const rows = Object.entries(r.bySection).map(([sid,d]) => {
        const s = sec(parseInt(sid));
        return `<tr>
          <td><span class="sec-label" style="color:${s?s.color:'var(--green)'};border-color:${s?s.color:'var(--green)'}">S${sid}</span></td>
          <td style="color:var(--text)">${s?esc(s.name):''}</td>
          <td style="font-family:'JetBrains Mono',monospace;color:var(--green);font-weight:600">${d.correct}/${d.total}</td>
        </tr>`;
      }).join('');
      breakdown = `<div class="divider"></div>
        <div class="section-heading">Wyniki per sekcja</div>
        <table class="hist-table"><tbody>${rows}</tbody></table>`;
    }

    app().innerHTML = `<div class="results-page">
      <div class="score-wrap">
        ${ring(r.percent, 120, color, 10)}
        <div class="score-info">
          <div class="score-verdict">${pass ? '🎉 Zaliczone!' : '📚 Więcej nauki!'}</div>
          <div class="score-sub">${r.mode==='exam'?'Egzamin':'Quiz'} · ${r.correct} poprawnych</div>
          <div class="score-frac">${r.correct} / ${r.total} pytań</div>
          <div class="btn-row" style="margin-top:16px">
            ${r.mode==='exam'
              ? `<button class="btn btn-primary" onclick="App.startExam()">🔄 Nowy egzamin</button>`
              : `<button class="btn btn-primary" onclick="App.startQuiz(${r.sectionId})">🔄 Jeszcze raz</button>`}
            <button class="btn btn-secondary" onclick="App.setTab('sections')">← Sekcje</button>
          </div>
        </div>
      </div>
      ${wrongHtml}
      ${breakdown}
    </div>`;
  }

  function resetSectionProgress() {
    if (!confirm('Zresetować postęp nauki wszystkich sekcji?')) return;
    ProgressManager.resetAllProgress();
    _renderProgressTab();
  }

  function resetExams() {
    if (!confirm('Usunąć całą historię egzaminów?')) return;
    ProgressManager.resetExams();
    _renderProgressTab();
  }

  function resetSection(id) {
    const s = sec(id);
    if (!confirm(`Zresetować postęp sekcji "${s ? s.name : id}"?`)) return;
    ProgressManager.resetSection(id);
    _renderSectionDetail(id);
  }

  // ─── Confetti ─────────────────────────────────────────────────
  function _confetti() {
    const layer  = document.getElementById('confetti');
    const colors = ['#22c55e','#4ade80','#16a34a','#fbbf24','#f87171','#a78bfa','#60a5fa'];
    layer.innerHTML = '';
    for (let i=0; i<28; i++) {
      const p = document.createElement('div');
      p.className = 'cp';
      p.style.cssText = `left:${Math.random()*100}vw;background:${colors[i%colors.length]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'3px'};animation-duration:${2+Math.random()*2.5}s;animation-delay:${Math.random()*.8}s;`;
      layer.appendChild(p);
    }
    setTimeout(() => { layer.innerHTML=''; }, 5500);
  }

  // ─── Init ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => { render(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); return; }

    const s = Quiz.getState();
    if (!s) return;

    // 1–5 → select option
    const num = parseInt(e.key);
    if (num >= 1 && num <= 5) {
      const idx = num - 1;
      const opt = document.getElementById(`opt-${idx}`);
      if (!opt || opt.classList.contains('disabled')) return;
      if (s.mode === 'learn') learnToggle(idx);
      else if (s.mode === 'quiz') quizToggle(idx);
      else if (s.mode === 'exam') examToggle(idx);
      return;
    }

    // Enter → Sprawdź / Dalej (not in learn bucket-row state)
    if (e.key === 'Enter') {
      e.preventDefault();
      const btnCheck = document.getElementById('btn-check');
      if (btnCheck && btnCheck.style.display !== 'none') { btnCheck.click(); return; }
      // exam: primary footer button
      const primary = document.querySelector('.quiz-footer .btn-primary');
      if (primary) primary.click();
    }
  });

  return {
    setTab, goHome, openSection, backToGrid, goToSection,
    openGlobalCheatsheet, openSectionCheatsheet,
    openModal, closeModal,
    openLearnModal, startLearn, startQuiz, startExam,
    learnToggle, learnCheck, learnBucket,
    quizToggle, quizCheck,
    examToggle, examNext, examFinish,
    backFromQuiz, renderResults,
    resetSectionProgress, resetExams, resetSection, optTap,
  };
})();
