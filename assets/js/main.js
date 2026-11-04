document.getElementById('year').textContent=new Date().getFullYear();const toggle=document.getElementById('menu-toggle');toggle?.addEventListener('click',()=>{const n=document.getElementById('main-nav');const open=n.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu')});

/* OPINIE UCZNIÓW
 * Po otrzymaniu prawdziwych, zaakceptowanych do publikacji opinii
 * wpisujemy je w tablicy poniżej: { text: "...", author: "..." }.
 * Pusta lista = zachowujemy aktualny tekst w stopce, bez fikcyjnych recenzji.
 */
const CLIENT_REVIEWS = [];

document.addEventListener('DOMContentLoaded', () => {
  const reviews = CLIENT_REVIEWS.filter(review =>
    review && typeof review.text === 'string' && review.text.trim()
  );
  const original = document.querySelector('footer .footer-inner > div:first-child');
  if (!original || reviews.length === 0) return;

  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const carousel = make('section', 'footer-reviews');
  carousel.setAttribute('aria-label', 'Opinie uczniów');
  carousel.setAttribute('aria-roledescription', 'karuzela');
  const title = make('h3', 'footer-review-title', 'Opinie uczniów');
  const quote = make('blockquote', 'footer-review-quote');
  quote.setAttribute('aria-live', 'off');
  const author = make('cite', 'footer-review-author');
  const controls = make('div', 'footer-review-controls');
  const counter = make('span', 'footer-review-counter');
  counter.setAttribute('aria-label', 'Numer wyświetlanej opinii');
  const prev = make('button', 'footer-review-arrow', '←');
  const next = make('button', 'footer-review-arrow', '→');
  for (const [button, label] of [
    [prev, 'Poprzednia opinia'],
    [next, 'Następna opinia']
  ]) {
    button.type = 'button';
    button.setAttribute('aria-label', label);
  }

  controls.append(prev, counter, next);
  carousel.append(title, quote, author);
  if (reviews.length > 1) carousel.append(controls);
  original.replaceWith(carousel);

  let index = 0;
  let paused = false;
  const update = (target, manual = false) => {
    index = (target + reviews.length) % reviews.length;
    const review = reviews[index];
    quote.setAttribute('aria-live', manual ? 'polite' : 'off');
    quote.textContent = '„' + review.text.trim() + '”';
    author.textContent = typeof review.author === 'string' ? review.author.trim() : '';
    author.hidden = !author.textContent;
    counter.textContent = (index + 1) + ' / ' + reviews.length;
    quote.classList.remove('footer-review-enter');
    void quote.offsetWidth;
    quote.classList.add('footer-review-enter');
  };

  prev.addEventListener('click', () => update(index - 1, true));
  next.addEventListener('click', () => update(index + 1, true));
  carousel.addEventListener('mouseenter', () => { paused = true; });
  carousel.addEventListener('mouseleave', () => { paused = false; });
  carousel.addEventListener('focusin', () => { paused = true; });
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) paused = false;
  });
  update(0);

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reviews.length > 1 && !reduceMotion) {
    window.setInterval(() => {
      if (!paused && !document.hidden) update(index + 1);
    }, 7000);
  }
});
