const KEYS = {
  buckets: 'ssi_buckets',
  examHistory: 'ssi_exams',
  lastSection: 'ssi_last_sec',
};

const ProgressManager = {
  getBucket(qId) {
    const buckets = JSON.parse(localStorage.getItem(KEYS.buckets) || '{}');
    return buckets[qId] || null;
  },

  setBucket(qId, bucket) {
    const buckets = JSON.parse(localStorage.getItem(KEYS.buckets) || '{}');
    buckets[qId] = bucket;
    localStorage.setItem(KEYS.buckets, JSON.stringify(buckets));
  },

  getStats(sectionId) {
    const buckets = JSON.parse(localStorage.getItem(KEYS.buckets) || '{}');
    let questions = window.QUESTIONS || [];
    if (sectionId) {
      questions = questions.filter(q => q.section === sectionId);
    }
    const stats = { know: 0, partial: 0, unknown: 0, total: questions.length };
    for (const q of questions) {
      const b = buckets[q.id];
      if (b === 'know') stats.know++;
      else if (b === 'partial') stats.partial++;
      else stats.unknown++;
    }
    return stats;
  },

  saveExamResult(result) {
    const history = JSON.parse(localStorage.getItem(KEYS.examHistory) || '[]');
    history.unshift({ date: new Date().toISOString(), ...result });
    localStorage.setItem(KEYS.examHistory, JSON.stringify(history));
  },

  getExamHistory() {
    return JSON.parse(localStorage.getItem(KEYS.examHistory) || '[]');
  },

  getLastSection() {
    return localStorage.getItem(KEYS.lastSection);
  },

  setLastSection(sectionId) {
    localStorage.setItem(KEYS.lastSection, sectionId);
  },

  resetSection(sectionId) {
    const buckets   = JSON.parse(localStorage.getItem(KEYS.buckets) || '{}');
    const questions = (window.QUESTIONS || []).filter(q => q.section === sectionId);
    for (const q of questions) delete buckets[q.id];
    localStorage.setItem(KEYS.buckets, JSON.stringify(buckets));
  },

  resetAllProgress() {
    localStorage.removeItem(KEYS.buckets);
  },

  resetExams() {
    localStorage.removeItem(KEYS.examHistory);
  },

  reset() {
    localStorage.removeItem(KEYS.buckets);
    localStorage.removeItem(KEYS.examHistory);
    localStorage.removeItem(KEYS.lastSection);
  },
};
