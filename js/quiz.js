const Quiz = (() => {
  let state = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function start(mode, sectionId) {
    stopTimer();
    let pool = (window.QUESTIONS || []).slice();
    if (sectionId && sectionId !== 0) {
      pool = pool.filter(q => q.section === sectionId);
    }
    pool = shuffle(pool);
    if (mode === 'exam') pool = pool.slice(0, 30);

    state = {
      mode,
      sectionId: sectionId || 0,
      questions: pool,
      current: 0,
      selected: [],
      answered: false,
      results: [],
      timeLeft: mode === 'exam' ? 30 * 60 : 0,
      timerInterval: null,
      onTick: null,
      onEnd: null,
    };
    return state;
  }

  function getState() { return state; }

  function currentQuestion() {
    if (!state || state.current >= state.questions.length) return null;
    return state.questions[state.current];
  }

  function toggleOption(idx) {
    if (!state || state.answered) return false;
    const i = state.selected.indexOf(idx);
    if (i === -1) state.selected.push(idx);
    else state.selected.splice(i, 1);
    return true;
  }

  function check() {
    if (!state || state.answered) return null;
    const q = currentQuestion();
    if (!q) return null;
    state.answered = true;

    const correct = q.correct.slice();
    const selected = state.selected.slice().sort((a, b) => a - b);
    const sortedCorrect = correct.slice().sort((a, b) => a - b);

    const isCorrect =
      sortedCorrect.length === selected.length &&
      sortedCorrect.every((c, i) => c === selected[i]);

    const result = {
      id: q.id,
      section: q.section,
      question: q.question,
      selected,
      correct,
      isCorrect,
    };
    state.results.push(result);
    return result;
  }

  function next() {
    if (!state) return false;
    state.current++;
    state.selected = [];
    state.answered = false;
    return state.current < state.questions.length;
  }

  function setBucket(bucket) {
    if (!state) return;
    const idx = state.answered ? state.current : state.current - 1;
    const q = state.questions[idx] || currentQuestion();
    if (q) ProgressManager.setBucket(q.id, bucket);
  }

  function getSessionResults() {
    if (!state) return null;
    const total = state.results.length;
    const correctCount = state.results.filter(r => r.isCorrect).length;
    const bySection = {};
    for (const r of state.results) {
      if (!bySection[r.section]) bySection[r.section] = { correct: 0, total: 0 };
      bySection[r.section].total++;
      if (r.isCorrect) bySection[r.section].correct++;
    }
    return {
      mode: state.mode,
      sectionId: state.sectionId,
      correct: correctCount,
      total,
      percent: total > 0 ? Math.round(correctCount / total * 100) : 0,
      bySection,
      wrong: state.results.filter(r => !r.isCorrect),
    };
  }

  function startTimer(onTick, onEnd) {
    if (!state || state.mode !== 'exam') return;
    state.onTick = onTick;
    state.onEnd = onEnd;
    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      if (state.onTick) state.onTick(state.timeLeft);
      if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        if (state.onEnd) state.onEnd();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state && state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function stop() {
    stopTimer();
    state = null;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return {
    start,
    getState,
    currentQuestion,
    toggleOption,
    check,
    next,
    setBucket,
    getSessionResults,
    startTimer,
    stopTimer,
    stop,
    formatTime,
  };
})();
