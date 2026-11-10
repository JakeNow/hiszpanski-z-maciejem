document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('id');
  const m = (window.MATERIALS || []).find(item => item.id === id);
  if (!m) {
    document.getElementById('lesson-title').textContent = 'Nie znaleziono materiału';
    document.getElementById('lesson-desc').textContent = 'Wybierz lekcję z biblioteki materiałów.';
    return;
  }
  const $ = id => document.getElementById(id);
  const add = (parent, tag, value, className) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    parent.append(element);
    return element;
  };
  document.title = m.title + ' | RONDA — Szkoła Językowa';
  $('lesson-label').textContent = m.level + ' / ' + m.topic.toUpperCase();
  $('lesson-title').textContent = m.title;
  $('lesson-desc').textContent = m.desc;

  (Array.isArray(m.intro) ? m.intro : [m.intro]).filter(Boolean)
    .forEach(paragraph => add($('lesson-intro'), 'p', paragraph));

  if (m.rules && m.rules.length) {
    $('grammar-section').hidden = false;
    m.rules.forEach(rule => {
      const block = add($('grammar-rules'), 'div', '', 'grammar-rule');
      add(block, 'h3', rule.title);
      add(block, 'p', rule.text);
      (rule.examples || []).forEach(([es, pl]) => {
        const ex = add(block, 'p', '', 'grammar-rule-example');
        add(ex, 'strong', es);
        add(ex, 'span', ' — ' + pl);
      });
    });
  }

  (m.examples || []).forEach(([es, pl]) => {
    const block = add($('examples'), 'div', '', 'example');
    const phrase = add(block, 'strong', es);
    phrase.lang = 'es';
    add(block, 'span', pl);
  });

  if (m.reading && m.reading.paragraphs && m.reading.paragraphs.length) {
    $('reading-section').hidden = false;
    $('reading-title').textContent = m.reading.title || 'Czytanie ze zrozumieniem';
    m.reading.paragraphs.forEach(text => add($('reading-text'), 'p', text));
  }
  if (m.glossary && m.glossary.length) {
    $('glossary-section').hidden = false;
    m.glossary.forEach(([es, pl]) => {
      const entry = add($('glossary'), 'div', '', 'glossary-entry');
      const term = add(entry, 'dt', es);
      term.lang = 'es';
      add(entry, 'dd', pl);
    });
  }

  const questions = [
    ...(m.qs || []).map(q => ({ ...q, section: 'Ćwiczenia językowe' })),
    ...(m.readingQs || []).map(q => ({ ...q, section: 'Pytania do tekstu' }))
  ];
  let lastSection = null;
  questions.forEach((q, i) => {
    if (q.section !== lastSection) {
      add($('questions'), 'h3', q.section, 'quiz-heading');
      lastSection = q.section;
    }
    const fieldset = add($('questions'), 'fieldset', '');
    add(fieldset, 'legend', (i + 1) + '. ' + q.q);
    q.options.forEach((option, j) => {
      const label = add(fieldset, 'label', '', 'answer');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'q' + i;
      input.value = j;
      label.append(input, document.createTextNode(option));
    });
    const feedback = add(fieldset, 'p', '', 'feedback');
    feedback.id = 'feedback-' + i;
    feedback.setAttribute('aria-live', 'polite');
  });
  $('quiz').addEventListener('submit', event => {
    event.preventDefault();
    let score = 0;
    let unanswered = 0;
    questions.forEach((q, i) => {
      const selected = document.querySelector('input[name="q' + i + '"]:checked');
      const correct = selected && Number(selected.value) === q.answer;
      const feedback = $('feedback-' + i);
      if (correct) score++;
      if (!selected) unanswered++;
      feedback.textContent = correct
        ? '✓ Poprawnie! ' + (q.why || '')
        : (selected ? 'Poprawna odpowiedź: ' : 'Brak odpowiedzi. Poprawna odpowiedź: ')
          + q.options[q.answer] + '. ' + (q.why || '');
      feedback.style.color = correct ? '#28744c' : '#9f4b36';
    });
    $('result').textContent = 'Twój wynik: ' + score + ' / ' + questions.length
      + (unanswered ? ' · Pytania bez odpowiedzi: ' + unanswered : '');
  });
});
