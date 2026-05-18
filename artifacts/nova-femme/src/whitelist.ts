// ═══════════════════════════════════════════════════════════════════════════
//  Lista zaproszonych adresów e-mail — Nova Femme
// ═══════════════════════════════════════════════════════════════════════════
//
//  ABY DODAĆ NOWĄ OSOBĘ:
//    Dopisz jej adres e-mail jako nową linię w tablicy poniżej.
//    Zachowaj format: "adres@domena.pl",   (małe litery, cudzysłów, przecinek)
//
//  Przykład:
//    "nowaosoba@gmail.com",   ← wstaw przed nawiasem zamykającym ]
//
// ═══════════════════════════════════════════════════════════════════════════

export const ALLOWED_EMAILS: readonly string[] = [
  "afresca@wp.pl",
  "kasiadominika4@gmail.com",
  "bozenka@web.de",
  "aleksandragorzela@gmail.com",
  "dominika.riemer.author@gmail.com",
  "jszu954@gmail.com",
  "karolinanowak2007@gmail.com",
  "magda.szostak5713@gmail.com",
  "agnieszka81@gmail.com",
  // ↓ Tutaj dopisuj nowe osoby ↓
  "natalkaem@gmail.com",
  "lanakaspro4@gmail.com",
  "justynaspizewska@gmail.com",
  "beatyl@op.pl",
    "iks.agnieszka@gmail.com",
  // ↑ koniec listy ↑
];

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim());
}
