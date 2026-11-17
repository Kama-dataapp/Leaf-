# Marlenka 💞 — uruchomienie prywatnych kont

Stan przygotowania: darmowy projekt Supabase aktywny; strona gry podłączona; tabele `marlenka_members` i `marlenka_thoughts` z ochroną RLS; role przydzielane automatycznie po potwierdzeniu adresów.

**Nie publikować tu haseł ani danych SMTP.** Panel Supabase jest właściwym miejscem na takie dane.

## 1. Ustaw adresy powrotu
Otwórz https://supabase.com/dashboard/project/qlfkkbqjntngzmpwayee/auth/url-configuration

Ustaw **Site URL**:
`https://kama-dataapp.github.io/Leaf-/marlenka/`

Dodaj w **Redirect URLs** dokładnie ten sam adres (włącznie z ukośnikiem na końcu). Zapisz.

## 2. Włącz e-mail z własnego SMTP (bez płatnej subskrypcji)
W panelu projektu Supabase przejdź do **Authentication → Emails → SMTP Settings** (lub wyszukaj „SMTP” w ustawieniach Auth). Włącz Custom SMTP.

Dla konta Gmail z aktywnym uwierzytelnianiem dwuetapowym i **hasłem aplikacji**:
- Host: `smtp.gmail.com`
- Port: `465` (ewentualnie `587`)
- Username: pełny adres konta Gmail, z którego będą wychodziły wiadomości
- Password: **hasło aplikacji Google** (nie hasło do Gmail!)
- Sender email: ten sam adres Gmail
- Sender name: `Marlenka 💞`

Hasło aplikacji wygeneruj w https://myaccount.google.com/apppasswords . Najlepiej użyć osobnej skrzynki tylko do gry. Jeżeli Google nie oferuje haseł aplikacji dla tego konta, wybierz darmową usługę SMTP z możliwością weryfikacji nadawcy.

Zapisz ustawienia. **Nie wyłączaj potwierdzenia adresów e-mail**.

## 3. Testuj dyskretnie
Otwórz https://kama-dataapp.github.io/Leaf-/marlenka/

Najpierw samodzielnie wciśnij „🔐 Konto”, wpisz adres administratora, wybierz „Wyślij link logowania”, otwórz wiadomość z linkiem. Gdy zobaczysz panel Kamisia, potwierdź, że jest pusty (Marlena jeszcze nic nie zapisała).

Dopiero gdy wszystko działa, poproś Marlenkę o zalogowanie w grze własnym zaproszonym adresem. Po jej potwierdzeniu e-maila konto powinno otrzymać rolę Marlenki automatycznie. Następnie może otworzyć wspomnienie, nacisnąć „Moje myśli”, napisać tekst i nacisnąć „Zapisz”. W panelu Kamisia kliknij „Odśwież myśli”.

**Nie wysyłaj Marlenie wiadomości testowych z Supabase, zanim będziesz gotowy zdradzić niespodziankę.**

## Bezpieczeństwo
- Nie dodawaj konta Marlenki do zespołu Supabase i nie udostępniaj jej hasła administratora. Dostęp do gry to oddzielny system Auth.
- W kodzie strony może być wyłącznie publiczny klucz `sb_publishable_...`; nigdy `service_role`, `sb_secret` ani hasła SMTP.
- Ochrona zapisów jest egzekwowana przez polityki RLS w bazie, nie przez ukrywanie przycisków.
- Wyłącznie dwa zaproszone adresy mogą tworzyć konta w tym projekcie; role są nadawane po weryfikacji.
- Free tier = brak kosztu projektu w chwili jego utworzenia, ale obowiązują limity i warunki dostawców.

Pomoc techniczna: https://supabase.com/docs/guides/auth/auth-smtp
