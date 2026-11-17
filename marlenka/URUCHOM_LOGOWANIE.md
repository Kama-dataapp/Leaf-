# Marlenka 💞 — aktywowanie logowania (bez opłat)

> Stan na 17 listopada 2026. Baza, tabele, ochrona RLS oraz przypisywanie ról po potwierdzeniu dwóch zaproszonych e-maili są już gotowe. **Nie wpisuj haseł, kluczy prywatnych ani haseł aplikacji w plikach GitHub.**

## 1. Ustaw adres powrotu po zalogowaniu

Panel: https://supabase.com/dashboard/project/qlfkkbqjntngzmpwayee/auth/url-configuration

- **Site URL**: `https://kama-dataapp.github.io/Leaf-/marlenka/`
- **Redirect URLs**: dodaj ten sam dokładny URL (z końcowym `/`).
- Zapisz zmiany.

## 2. Skonfiguruj darmową pocztę SMTP (bez wysyłania wiadomości do Marlenki na tym etapie)

Panel: https://supabase.com/dashboard/project/qlfkkbqjntngzmpwayee/auth/smtp

Do wysyłania e-maili na adresy spoza zespołu Supabase konieczny jest własny SMTP. Najprostszy wariant do prywatnej gry: **oddzielne bezpłatne konto Gmail dla wysyłania wiadomości**. Jeśli już masz odpowiednią skrzynkę, nowej nie trzeba zakładać.

1. Zaloguj się na skrzynkę wysyłającą; włącz **weryfikację dwuetapową** w koncie Google.
2. Otwórz https://myaccount.google.com/apppasswords i wygeneruj **hasło aplikacji** (nie zwykłe hasło Google).
3. W panelu SMTP Supabase włącz **Custom SMTP** i ustaw:
   - **Sender email / Sender address**: adres tej skrzynki Gmail
   - **Sender name**: `Marlenka`
   - **Host**: `smtp.gmail.com`
   - **Port**: `465` (SSL/TLS), ewentualnie `587` z STARTTLS, zgodnie z ustawieniami panelu
   - **Username / User**: pełny adres skrzynki Gmail
   - **Password**: wygenerowane hasło **aplikacji**
4. Zapisz i sprawdź, czy SMTP jest oznaczony jako aktywny. Nie wklejaj hasła w czat ani GitHub.

**Uwaga:** darmowa wysyłka jest ograniczona przez limity operatora poczty. Korzystanie z samego Supabase zostało wycenione na 0 USD miesięcznie; nie aktywuj żadnych płatnych dodatków.

## 3. Test bez zdradzania niespodzianki

1. Otwórz https://kama-dataapp.github.io/Leaf-/marlenka/.
2. Kliknij **Konto** i przetestuj logowanie **najpierw tylko na swoim adresie**.
3. Odbierz e-mail i kliknij link jednorazowy; powinien przekierować z powrotem do gry.
4. W panelu powinien pokazać się **Panel Kamisia**. Nie wysyłaj jeszcze testowych e-maili do Marlenki, jeśli nie chcesz ujawnić szczegółów prezentu.
5. Po udanym teście, gdy zdecydujesz, Marlenka otwiera tę samą grę, loguje się swoim zaproszonym adresem i zapisuje myśl przy wybranym wspomnieniu.
6. Ty otwierasz **Panel Kamisia → Odśwież myśli** i sprawdzasz, czy wpis jest widoczny.

## Co zostało już zrobione w bazie

- Dwie tabele: `marlenka_members`, `marlenka_thoughts`.
- RLS: brak dostępu anonimowego; role weryfikowane po stronie serwera.
- Marlenka może dodawać/edytować/usunąć **własne** myśli, Kamiś może je **czytać**, lecz nie zmieniać.
- Nowe konta mogą zakładać tylko dwa zaproszone adresy, a rola zostaje nadana po potwierdzeniu e-maila.
- Publiczna aplikacja ma tylko klucz `publishable` — żadnych sekretów administratora.

## Pamiętaj

Bez skonfigurowanego SMTP i adresów przekierowania **nie obiecujemy działającego logowania**. W międzyczasie gra działa bez konta i zachowuje możliwość lokalnego zapisu oraz ręcznego wysyłania myśli.

Dokumentacja:
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/kb/troubleshooting/using-google-smtp-with-supabase-custom-smtp-ZZzU4Y
