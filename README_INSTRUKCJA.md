# Instrukcja zarządzania Nova Femme
*Zaktualizowano: maj 2026*

---

## 1. Jak dodać nową użytkowniczkę (whitelist)

**Plik:** `artifacts/nova-femme/src/whitelist.ts`

Otwórz plik i znajdź sekcję (około linii 27):

```
  // ↓ Tutaj dopisuj nowe osoby ↓
  "natalkaem@gmail.com",
  "lanakaspro4@gmail.com",
  // ↑ koniec listy ↑
```

Dopisz nowy adres **przed** linią `// ↑ koniec listy ↑`:

```
  "nowaosoba@gmail.com",
```

Zasady:
- Tylko małe litery
- Cudzysłowy i przecinek na końcu
- Po zapisaniu pliku zmiana działa natychmiast (bez ponownej publikacji)

---

## 2. Jak dodać nową kartę afirmacyjną

### Krok 1 — Wgraj plik graficzny
Przeciągnij plik `.png` do folderu:
```
artifacts/nova-femme/public/cards/
```
Nazwa pliku: tylko małe litery i cyfry, bez spacji (np. `radosc.png`).

### Krok 2 — Zarejestruj w kodzie (dwa pliki)

**Plik A:** `artifacts/nova-femme/src/pages/affirmations.tsx` — linia 26–27

**Plik B:** `artifacts/nova-femme/src/pages/dashboard.tsx` — linia 28–29

W obu plikach znajdź sekcję:
```
  // Transformacja / Inspiracje
  "milbzwr.png", "nowe.png", "poloc.png", "wsparcie.png", "zmia.png",
```

I dopisz nazwę nowego pliku w tej samej linii lub jako nową linię, np.:
```
  "milbzwr.png", "nowe.png", "poloc.png", "wsparcie.png", "zmia.png",
  "radosc.png",
```

---

## 3. Jak opublikować / zaktualizować aplikację po zmianach

Po każdej ręcznej edycji pliku w Replit wykonaj te kroki:

1. Upewnij się, że plik jest **zapisany** (Ctrl+S / Cmd+S)
2. Kliknij przycisk **„Deploy"** (lub **„Publish"**) w prawym górnym rogu Replit
3. Poczekaj ok. 1–2 minut na zakończenie procesu
4. Gotowe — zmiana jest widoczna na żywej stronie

> Jeśli zmieniałaś tylko `whitelist.ts` (dodawanie maili), Replit może zastosować zmianę automatycznie bez pełnego deployu. W razie wątpliwości — zawsze kliknij Deploy.

---

## 4. Pliki kluczowe — mapa aplikacji

| Co chcę zmienić | Plik |
|---|---|
| Lista zaproszonych osób | `artifacts/nova-femme/src/whitelist.ts` |
| Karty afirmacyjne (galeria) | `artifacts/nova-femme/src/pages/affirmations.tsx` |
| Karta na ekranie głównym | `artifacts/nova-femme/src/pages/dashboard.tsx` |
| Grafiki kart | `artifacts/nova-femme/public/cards/` |
| Ikona aplikacji (favicon) | `artifacts/nova-femme/public/app-icon.png` |
| Tytuł strony | `artifacts/nova-femme/index.html` |

---

## 5. Uwaga — brakujące pliki graficzne

Poniższe 3 pliki **nie zostały wgrane** do folderu z kartami i dlatego nie pojawiają się w galerii. Gdy je wgrasz, dodaj ich nazwy do obu plików z punktu 2:

- `radosc.png`
- `spoko.png`
- `tuiteraz.png`
