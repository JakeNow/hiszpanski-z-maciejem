document.getElementById('year').textContent=new Date().getFullYear();const toggle=document.getElementById('menu-toggle');toggle?.addEventListener('click',()=>{const n=document.getElementById('main-nav');const open=n.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?(document.documentElement.lang==='es'?'Cerrar menú':'Zamknij menu'):(document.documentElement.lang==='es'?'Abrir menú':'Otwórz menu'))});

/* OPINIE UCZNIÓW
 * Po otrzymaniu prawdziwych, zaakceptowanych do publikacji opinii
 * wpisujemy je w tablicy poniżej: { text: "...", author: "..." }.
 * Pusta lista = zachowujemy aktualny tekst w stopce, bez fikcyjnych recenzji.
 */
const CLIENT_REVIEWS = [
  {
    "text": "Lekcje odbywają się w bardzo luźnej, przyjaznej atmosferze, bez niepotrzebnego stresu i presji. Maciej jest niesamowicie cierpliwy, wyrozumiały i po prostu ludzki. Można się dogadać, zmienić plany, przełożyć coś, kiedy życie trochę pokrzyżuje szyki, i zawsze spotyka się to ze zrozumieniem. Nie ma nerwów, zniecierpliwienia ani poczucia, że za coś trzeba przepraszać. Do tego ziomalskie podejście, dzięki któremu nauka jest przyjemnością. Super człowiek i świetny nauczyciel. Polecam z całego serca!",
    "author": "Koleta"
  },
  {
    "text": "Z całego serca polecamy lekcje języka hiszpańskiego z Maciejem! Uczy naszą córkę już od 6 lat – zaczynali od nauki przez zabawę, a dziś wspólnie przygotowują się do kolejnych certyfikatów i egzaminów.\n\nMaciej jest niezwykle cierpliwy, uważny i metodyczny. Dużą wagę przykłada do dokładnego wyjaśniania zagadnień, utrwalania nowego materiału i regularnych powtórek. Jednocześnie potrafi doskonale dopasować metody pracy do wieku, potrzeb i możliwości dziecka. Korzysta z różnorodnych materiałów i pomocy dydaktycznych – podręczników, ćwiczeń, kart pracy, quizów, filmików, książek czy krzyżówek. Co jednak szczególnie cenne, potrafi wyjść poza tradycyjne ramy lekcji i przenieść naukę do codziennego życia. Oklejanie przedmiotów w pokoju hiszpańskimi nazwami, aby utrwalić słownictwo, czy wspólny spacer po okolicy, podczas którego dziecko opisywało drogę i kierunki po hiszpańsku, to tylko niektóre z pomysłów, dzięki którym nauka staje się ciekawa, naturalna i naprawdę angażująca.\n\nŚwietnie motywuje, docenia postępy, a jednocześnie konstruktywnie wskazuje obszary do dalszej pracy. Co najważniejsze, nasza córka po sześciu latach nadal z przyjemnością czeka na kolejne lekcje. W jej opinii Maciej jest „genialnym nauczycielem” – a z ust nastolatki to naprawdę wyjątkowy komplement!\n\nPolecamy Macieja z pełnym przekonaniem każdemu, kto szuka zaangażowanego, profesjonalnego nauczyciela, który nie tylko skutecznie uczy języka, ale także potrafi zarazić nim swoją pasją!",
    "author": "Ania – mama Liwii"
  }
];

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
  quote.setAttribute('id', 'footer-review-text');
  const readMore = make('button', 'footer-review-more', 'Czytaj całą opinię');
  readMore.type = 'button';
  readMore.setAttribute('aria-controls', 'footer-review-text');
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
  carousel.append(title, quote, readMore, author);
  if (reviews.length > 1) carousel.append(controls);
  original.replaceWith(carousel);

  let index = 0;
  let paused = false;
  let expanded = false;
  const update = (target, manual = false) => {
    index = (target + reviews.length) % reviews.length;
    const review = reviews[index];
    quote.setAttribute('aria-live', manual ? 'polite' : 'off');
    quote.textContent = '„' + review.text.trim() + '”';
    expanded = false;
    quote.classList.toggle('is-truncated', review.text.length > 700);
    quote.classList.remove('is-expanded');
    readMore.hidden = review.text.length <= 700;
    readMore.textContent = 'Czytaj całą opinię';
    readMore.setAttribute('aria-expanded', 'false');
    author.textContent = typeof review.author === 'string' ? review.author.trim() : '';
    author.hidden = !author.textContent;
    counter.textContent = (index + 1) + ' / ' + reviews.length;
    quote.classList.remove('footer-review-enter');
    void quote.offsetWidth;
    quote.classList.add('footer-review-enter');
  };

  readMore.addEventListener('click', () => {
    expanded = !expanded;
    quote.classList.toggle('is-expanded', expanded);
    readMore.textContent = expanded ? 'Zwiń opinię' : 'Czytaj całą opinię';
    readMore.setAttribute('aria-expanded', String(expanded));
  });

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
      if (!paused && !expanded && !document.hidden) update(index + 1);
    }, 7000);
  }
});
