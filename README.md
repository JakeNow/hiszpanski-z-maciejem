# RONDA — Szkoła Językowa 🇪🇸

Kompletna responsywna strona HTML/CSS/JavaScript, bez frameworka, kompilacji i bazy danych.

## Podstrony
- `index.html` — start, prezentacja, oferta, cennik, materiały, kontakt
- `o-mnie.html` — zdjęcie Macieja i bio
- `lekcje.html` — oferta i zapisy
- `materialy.html` — biblioteka z wyszukiwaniem i filtrowaniem A1–C1
- `cwiczenie.html?id=ser-estar` — przykładowe lekcje z quizami
- `kontakt.html` — formularz przygotowujący e-mail (`mailto`)
- `polityka-prywatnosci.html` — **szablon wymagający uzupełnienia**

## Uruchomienie lokalne
Otwórz `index.html` w przeglądarce. Dla pełnego testu użyj lokalnego serwera: `python -m http.server 8000`, potem `http://localhost:8000`.

## Publikacja z GitHub

Docelowy adres po zmianie nazwy repozytorium: https://jakenow.github.io/ronda/
Repozytorium: https://github.com/JakeNow/ronda

1. Utwórz repozytorium i wgraj **zawartość** tego katalogu do jego katalogu głównego.
2. Do testów statycznej strony możesz użyć GitHub Pages (Settings → Pages → Deploy from a branch → main / root), o ile jest to zgodne z aktualnymi warunkami usługi.
3. Przy docelowym zastosowaniu komercyjnym wybierz hosting dopuszczający takie wykorzystanie, np. odpowiedni plan hostingu statycznego po sprawdzeniu regulaminu. GitHub może nadal przechowywać kod.
4. Przetestuj wszystkie odnośniki, quizy oraz telefon.

## Konieczne zmiany przed publikacją
- W `assets/js/main.js` zamień `WPISZ_EMAIL` na swój prawdziwy adres e-mail. Formularz **nie wysyła wiadomości sam** — otwiera aplikację pocztową odwiedzającego. Dla wygody użytkowników warto wdrożyć formularz hostowany przez dedykowaną usługę.
- Uzupełnij `polityka-prywatnosci.html` o informacje wymagane dla rzeczywistej konfiguracji i działalności.
- Zweryfikuj, czy wszystkie opisane rodzaje zajęć odpowiadają faktycznej ofercie.
- Dodaj prawdziwe kwalifikacje do `o-mnie.html`, jeżeli chcesz je publikować.
- Bibliotekę edytujesz w `assets/js/materials-data.js`. Dodaj kolejne obiekty na wzór istniejących.
- Do zmiany barw użyj zmiennych `:root` w `assets/css/style.css`.

## Zdjęcia i pliki
W katalogu `assets/img/` jest własne zdjęcie i grafiki przekazane lub wygenerowane w ramach tej rozmowy. Nie dołączono cudzych podręczników ani ich treści.

## Sklep w przyszłości
Ta wersja nie zawiera płatności ani kont uczniów. Do sprzedaży PDF-ów i kursów użyj odpowiedniego hostingu oraz niezależnej platformy sprzedażowej lub rozwiązania e-commerce. Nie udostępniaj płatnych plików po prostu jako publiczne zasoby statyczne.
