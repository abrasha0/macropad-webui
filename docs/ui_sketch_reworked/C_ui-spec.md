# Macropad Configurator — Specyfikacja UI

> Dokument opisuje strukturę widoków, komponenty, stany interaktywne i stylistykę aplikacji **macropad configurator** na podstawie makiet Figma. Przeznaczony dla agenta kodującego jako jedyne źródło prawdy o wyglądzie i zachowaniu UI.

---

## 1. Architektura ogólna (Shell Layout)

Aplikacja ma stały, nieprzewijany shell podzielony na trzy strefy:

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (stały, ~180px)  │  MAIN CONTENT AREA (flex-grow)  │
│                           │                                  │
│                           │                                  │
│                           │                                  │
│                           │                                  │
├───────────────────────────┴──────────────────────────────────┤
│  SERIAL MONITOR (stały, ~180px height, full width)           │
└─────────────────────────────────────────────────────────────┘
```

- **Sidebar**: `position: fixed` lub `flex-shrink: 0`, szerokość `~180px`, pełna wysokość viewport minus serial monitor.
- **Main content area**: `flex: 1`, przewijalna pionowo w razie potrzeby.
- **Serial Monitor**: stały pasek na dole, pełna szerokość, nakłada się na całą aplikację (włącznie z sidebar).

---

## 2. Globalne tokeny designu

### 2.1 Paleta kolorów (CSS Variables)

```css
/* Backgrounds */
--bg-app:        #0D0F0C;   /* tło całej aplikacji – bardzo ciemna zieleń/czerń */
--bg-sidebar:    #111410;   /* tło sidebara – nieco cieplejsze od app bg */
--bg-surface:    #181B15;   /* tło kart, paneli, pól formularza */
--bg-surface-2:  #1F231B;   /* drugi poziom powierzchni (np. tło listy profilów) */
--bg-input:      #141714;   /* tło inputów i pól tekstowych */

/* Borders */
--border:        #2A2F26;   /* standardowa ramka */
--border-subtle: #1E221A;   /* bardzo delikatna ramka (między sekcjami) */

/* Accent – żółto-zielony (główny kolor akcentu) */
--accent:        #C8FF00;   /* aktywne przyciski, wskaźniki, podświetlenia */
--accent-dim:    #8FAF00;   /* przygaszony akcent (hover lub disabled) */
--accent-glow:   rgba(200, 255, 0, 0.15); /* subtelna poświata na aktywnych elementach */

/* Text */
--text-primary:  #E8EDE4;   /* główny tekst */
--text-secondary:#7A8570;   /* dodatkowe etykiety, opisy */
--text-muted:    #4A5045;   /* bardzo przyćmiony (placeholdery, nieaktywne) */
--text-accent:   #C8FF00;   /* tekst w kolorze akcentu */
--text-code:     #A8D080;   /* tekst kodu/poleceń w sekwencjach klawiatury */

/* Status / Semantic */
--status-connected:    #4ADE80; /* zielona kropka "Connected" */
--status-disconnected: #F87171; /* czerwona / szara kropka "Disconnected" */
--danger:              #F87171; /* akcje destruktywne (Reset to Defaults) */
--danger-bg:           rgba(248, 113, 113, 0.10);
--warning:             #FACC15; /* delay steps w macro */

/* Serial Monitor log colors */
--log-system: #60A5FA;   /* [SYSTEM] – niebieski */
--log-device: #4ADE80;   /* [DEVICE] – zielony */
--log-input:  #F87171;   /* [INPUT]  – czerwony/różowy */
--log-ts:     #4A5045;   /* timestamp – przyszarzały */

/* Macro action border colors (left accent stripe) */
--action-keystroke: #EC4899; /* różowy/purpurowy */
--action-delay:     #F59E0B; /* bursztynowy */
--action-media:     #60A5FA; /* niebieski */
```

### 2.2 Typografia

```css
/* Rodzina fontów */
--font-ui:   'JetBrains Mono', 'Fira Code', monospace; /* całe UI – monospace dla spójności z urządzeniem */
--font-mono: 'JetBrains Mono', monospace;              /* kod w sekwencjach, serial monitor */

/* Skale */
--text-xs:   11px;
--text-sm:   12px;
--text-base: 13px;
--text-md:   14px;
--text-lg:   16px;
--text-xl:   20px;
--text-2xl:  24px;

/* Weight */
--fw-normal:  400;
--fw-medium:  500;
--fw-semibold:600;
```

> **Uwaga dla agenta**: Cała aplikacja używa monospace. To celowy wybór nawiązujący do estetyki firmware/embedded. Unikać sans-serif w jakimkolwiek miejscu UI.

### 2.3 Spacing & Radius

```css
--radius-sm:  4px;
--radius-md:  6px;
--radius-lg:  8px;
--radius-xl:  10px;

--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
```

### 2.4 Shadows

```css
--shadow-key:    0 2px 8px rgba(0,0,0,0.5);        /* klawisze na gridzie */
--shadow-panel:  0 0 0 1px var(--border);           /* obramowanie kart */
--shadow-accent: 0 0 12px var(--accent-glow);       /* focus / selected key */
```

---

## 3. Sidebar (Komponent globalny)

Sidebar jest identyczny we wszystkich trzech widokach. Zmieniają się tylko: stan połączenia oraz aktywna pozycja nawigacji.

### 3.1 Struktura

```
┌──────────────────────┐
│  [icon] macropad     │  ← logo / app name
│         configurator │
│  ● Connected /       │  ← status dot + tekst
│    Disconnected      │
├──────────────────────┤
│  [Connect Device]    │  ← CTA button
├──────────────────────┤
│  ▦ Layout            │  ← nav item (z ikoną)
│  ⬡ Macros            │
│  ⚙ System            │
└──────────────────────┘
```

### 3.2 Szczegóły

**Logo / App name**
- Ikona: niestandardowy symbol klawiatury/pad w kolorze `--accent`, w kwadratowym kontenerze `~32x32px` z `background: --bg-surface`, `border-radius: --radius-md`.
- Tekst: dwie linie: `macropad` (bold, `--text-lg`) i `configurator` (normal, `--text-sm`, `--text-secondary`).

**Status indicator**
- Małe kółko `8px` wypełnione:
  - `--status-connected` gdy podłączono
  - `--status-disconnected` (lub szare) gdy odłączono
- Tekst obok: `"Connected"` / `"Disconnected"` w `--text-sm`, `--text-secondary`.

**CTA Button (`Connect Device` / `Disconnect device`)**
- Pełna szerokość sidebara (z paddingiem).
- `background: --accent`, `color: #000`, `font-weight: --fw-semibold`, `border-radius: --radius-md`.
- Stan disconnected: etykieta `"Connect Device"`.
- Stan connected: etykieta `"Disconnect device"`, background może być przyciemniony lub czerwonawy (`--danger` z obramowaniem).
- Brak ikony w przycisku — tylko tekst.

**Nawigacja**
Trzy pozycje z ikonami SVG po lewej:

| Pozycja | Ikona          | Route     |
|---------|----------------|-----------|
| Layout  | grid/keys icon | `/layout` |
| Macros  | hexagon/flow   | `/macros` |
| System  | gear/cog       | `/system` |

- Styl inactive: `color: --text-secondary`, bez tła.
- Styl active: `color: --text-primary`, `background: --bg-surface-2`, lewy pasek `2px` w `--accent`, `border-radius: --radius-sm` po prawej stronie.
- Padding poziomy: `--space-4`. Padding pionowy: `--space-2` na element.
- Ikony: `16x16px`, `stroke-width: 1.5`.

---

## 4. Serial Monitor (Komponent globalny)

Stały pasek na dole aplikacji, widoczny na wszystkich ekranach.

### 4.1 Struktura

```
┌─ SERIAL MONITOR header bar ─────────────────────── Copy | Clear ─┐
│ 14:22:01:453 [SYSTEM] Initializing connection to COM3...          │
│ 14:22:01:892 [DEVICE] MacroForge v2.1.4 ready.                   │
│ 14:22:02:105 [SYSTEM] Syncing Profile 1 (Default)...             │
│ 14:22:02:440 [DEVICE] Profile sync complete. 16 bindings loaded.  │
│ 14:25:12:033 [INPUT]  Key down: R2 C2 (Numpad 5)                 │
│ 14:25:12:185 [INPUT]  Key up: R2 C2 (Numpad 5)                   │
│ 14:28:45:991 [DEVICE] Encoder rotated CW (+1)                    │
├────────────────────────────────────────────────────────────────────┤
│ > Enter command...                                                 │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Szczegóły

**Header bar**
- Tło: `--bg-surface`, `border-top: 1px solid --border`.
- Lewa strona: mała ikona terminala (`12px`) + label `"SERIAL MONITOR"` (`--text-xs`, `--text-muted`, uppercase, `letter-spacing: 0.08em`).
- Status COM: zielona/czerwona kropka `6px` + tekst `"COM3: 115200"` (`--text-xs`, `--text-muted`).
- Prawa strona: przyciski `Copy` i `Clear` (`--text-xs`, `--text-secondary`, bez ramki, hover → `--text-primary`).

**Log area**
- Tło: `--bg-app` (najciemniejszy poziom).
- Czcionka: `--font-mono`, `--text-xs`.
- Wysokość: ~120–140px, overflow-y auto (autoprzewijanie do ostatniego wpisu).
- Format każdej linii:
  - Timestamp: `14:22:01:453` — kolor `--log-ts`
  - Tag `[SYSTEM]` — kolor `--log-system`
  - Tag `[DEVICE]` — kolor `--log-device`
  - Tag `[INPUT]`  — kolor `--log-input`
  - Wiadomość: kolor zgodny z tagiem, nieznacznie jaśniejszy.

**Input command**
- Cienka linia separatora `1px` w `--border-subtle`.
- Prompt `> ` w `--accent`, po nim `<input>` z placeholder `"Enter command..."`.
- Tło inputu: transparentne (dziedziczy `--bg-app`), brak ramki.

---

## 5. Widok: Layout

Ścieżka: `/layout` — ekran główny konfiguracji przycisków.

### 5.1 Makrolayout obszaru głównego

```
┌─────────────────────────────────────────────────────────────────┐
│  [PROFILES panel ~280px]  │  [KEY GRID center]  │  [BINDING ~300px] │
└─────────────────────────────────────────────────────────────────┘
```

Trójkolumnowy flex layout, bez separatorów wizualnych (przestrzeń robocza wygląda jak jeden panel).

---

### 5.2 Panel PROFILES (lewa kolumna)

**Nagłówek**
- Label `"PROFILES"` — uppercase, `--text-xs`, `--text-muted`, `letter-spacing: 0.1em`.

**Lista profili**
Każdy profil to wiersz listy:

```
┌──────────────────────────────┐
│  Profile 1                   │  ← nazwa
│  (Default)                   │  ← podtytuł/tag
└──────────────────────────────┘
```

- Styl wiersza: `padding: --space-2 --space-3`, `border-radius: --radius-md`.
- Nazwa profilu: `--text-sm`, `--text-primary`, `--fw-medium`.
- Podtytuł: `--text-xs`, `--text-muted`.
- **Aktywny profil**: `background: rgba(200, 255, 0, 0.08)`, lewy pasek `2px solid --accent`, `color: --text-accent` dla nazwy.
- **Inactive**: brak tła, hover → `background: --bg-surface`.

**Przykładowe profile z makiety:**
1. `Profile 1` / `(Default)` — aktywny
2. `Profile 2` / `(Editing)`
3. `Profile 3` / `(Gaming)`

**Przycisk dodawania profilu**
- Małe pole `"+"` na dole listy, `--text-muted`, hover → `--accent`.

---

### 5.3 Siatka klawiszy (center)

**Kontener**
- Wyśrodkowany w dostępnej przestrzeni.
- Tło: lekko odróżnialne od reszty (`--bg-surface` z subtelnym obramowaniem lub bez).
- `padding: --space-5`.

**Siatka 4×4 + encoder**

```
[ 7 ] [ 8 ] [ 9 ] [ / ]
[ 4 ] [*5*] [ 6 ] [ * ]   ← row 2, col 2 = selected (key 5)
[ 1 ] [ 2 ] [ 3 ] [ - ]
[ 0 ] [ . ] [ENT] [ + ]
```

Po prawej stronie wiersza 2: **Encoder (pokrętło)** z etykietą `VOL / MEDIA` pod nim.

**Styl klawisza (domyślny)**
- Rozmiar: `~56x56px` lub `~60x60px`, kwadratowe.
- `background: --bg-surface-2`.
- `border: 1px solid --border`.
- `border-radius: --radius-md`.
- `box-shadow: --shadow-key`.
- Etykieta: `--text-sm`, `--text-primary`, `--fw-medium`, wyśrodkowana.

**Styl klawisza (selected/active)**
- `border: 1.5px solid --accent`.
- `box-shadow: --shadow-accent, --shadow-key`.
- Etykieta: `color: --text-accent`.

**Encoder (pokrętło)**
- Kółko `~72px` diameter.
- Zewnętrzny pierścień `stroke: --border`.
- Wskaźnik pozycji: mała kropka `8px` w `--accent` przy górnej krawędzi okręgu.
- Etykieta poniżej: `"VOL / MEDIA"`, `--text-xs`, `--text-muted`, uppercase.

---

### 5.4 Panel BINDING (prawa kolumna, ~300px)

Pojawia się po kliknięciu klawisza. Nagłówek: `"Binding: Key 5"` + pozycja `"2, 2"` (row/col).

**Nagłówek binding panelu**
- `"Binding: Key 5"` — `--text-lg`, `--fw-semibold`, `--text-primary`.
- Pozycja `"2, 2"` — małe badge po prawej: `background: --bg-surface`, `border: 1px solid --border`, `border-radius: --radius-sm`, `--text-xs`, `--text-muted`.

**Tab switcher: Keystroke | Macro | Media**
- Trzy taby w jednym rzędzie, `width: 100%`, każdy `flex: 1`.
- `background: --bg-surface`, `border: 1px solid --border`.
- Aktywny tab: `background: --bg-surface-2`, `color: --text-primary`.
- Inactive: `color: --text-muted`.
- `border-radius: --radius-md` na całości, wewnątrz ostre krawędzie między tabami.

**Sekcja Primary Key**
- Label: `"Primary Key"`, `--text-xs`, `--text-muted`, uppercase.
- Input field: `background: --bg-input`, `border: 1px solid --accent` (gdy aktywny/wypełniony), `border-radius: --radius-md`.
- Wartość: `"Numpad 5"` — `--text-sm`, `--text-primary`.
- Przycisk `×` po prawej (clear): `--text-muted`, hover → `--danger`.
- Hint pod inputem: `"Click to record a new key"` — `--text-xs`, `--text-muted`, kursywa.

**Sekcja Modifiers**
- Label: `"Modifiers"`, `--text-xs`, `--text-muted`, uppercase.
- Cztery przyciski toggle: `CTRL`, `ALT`, `SHIFT`, `WIN`.
- Styl inactive: `background: --bg-surface`, `border: 1px solid --border`, `color: --text-secondary`.
- Styl active: `background: --accent`, `color: #000`, `border-color: --accent`.
- `border-radius: --radius-sm`, `font-size: --text-xs`, `font-weight: --fw-semibold`.

**Sekcja Display Label**
- Label: `"Display Label (Optional)"`, `--text-xs`, `--text-muted`.
- Input: placeholder `"e.g. 'Heal'"`, styl jak Primary Key input ale bez akcentowanego obramowania.

**Przycisk SAVE BINDING**
- Pełna szerokość.
- `background: --accent`, `color: #000`, `font-weight: --fw-semibold`.
- `border-radius: --radius-md`, `padding: --space-3`.
- Uppercase, `letter-spacing: 0.05em`.
- Hover: lekkie jaśniejsze lub `box-shadow: --shadow-accent`.

---

## 6. Widok: Macros

Ścieżka: `/macros` — tworzenie i edycja makr.

### 6.1 Makrolayout obszaru głównego

```
┌─────────────────────────────────────────────────────────────┐
│  [LIBRARY ~280px]  │  [MACRO EDITOR flex-grow]              │
└─────────────────────────────────────────────────────────────┘
```

Dwukolumnowy layout.

---

### 6.2 Panel Library (lewa kolumna, ~280px)

**Nagłówek**
- Label `"Library"` — `--text-lg`, `--fw-semibold`, `--text-primary`.
- Przycisk `"+"` po prawej: `background: --accent`, `color: #000`, `18x18px`, `border-radius: --radius-sm`.

**Wyszukiwarka**
- Input z ikoną lupy po lewej.
- Placeholder: `"Search macros..."`, `--text-sm`, `--text-muted`.
- `background: --bg-input`, `border: 1px solid --border`, `border-radius: --radius-md`.
- Padding wewnętrzny uwzględniający ikonę.

**Lista makr**
Każde makro to karta/wiersz:

```
┌──────────────────────────────────┐
│  Git Commit Flow            ⋮    │
│  4 steps • 1.2s                  │
└──────────────────────────────────┘
```

- Nazwa: `--text-sm`, `--fw-medium`, `--text-primary`.
- Meta: `"N steps • Xs"` — `--text-xs`, `--text-muted`.
- Ikona `⋮` (three-dot menu): pojawia się na hover, `--text-muted`.
- **Aktywna karta**: `background: rgba(200,255,0,0.08)`, `border: 1px solid rgba(200,255,0,0.3)`, `border-radius: --radius-md`.
- Inactive: `background: --bg-surface`, `border: 1px solid --border`, hover → `border-color: --border-subtle`.
- `gap: --space-2` między kartami.

**Przykładowe makra z makiety:**
1. `Git Commit Flow` — 4 steps • 1.2s (aktywny)
2. `Zoom Mute Toggle` — 1 step • 50ms
3. `Photoshop Export` — 6 steps • 2.5s

---

### 6.3 Macro Editor (prawa kolumna)

**Header edytora**
```
Git Commit Flow   [Unsaved Changes]         [► Test] [💾 Save]
```

- Nazwa makra: `--text-xl`, `--fw-semibold`, `--text-primary`.
- Badge `"Unsaved Changes"`: `background: rgba(250, 204, 21, 0.15)`, `color: --warning`, `border: 1px solid rgba(250,204,21,0.3)`, `border-radius: --radius-sm`, `--text-xs`, `padding: 2px 8px`.
- Przycisk `Test`: secondary style — `background: --bg-surface`, `border: 1px solid --border`, `color: --text-primary`, ikona play `▶` po lewej, `--text-sm`.
- Przycisk `Save`: `background: --accent`, `color: #000`, ikona dyskietki/save, `--text-sm`, `--fw-semibold`.

**TRIGGER badge**
- Pill/badge: `"TRIGGER: KEY 4"`.
- `background: --bg-surface`, `border: 1px solid --border`, `border-radius: 999px`.
- `--text-xs`, `--text-secondary`, uppercase, `letter-spacing: 0.08em`.
- Wyśrodkowany poziomo nad sekwencją akcji (lub wyrównany do lewej).

**Sekwencja akcji**

Każda akcja to karta z kolorowym lewym paskiem:

```
┌─ [kolor] ──────────────────────────────────── [🗑] ─┐
│  KEYSTROKE SEQUENCE                                   │
│  git add . ENTER                                      │
└──────────────────────────────────────────────────────┘
```

**Wspólne cechy akcji:**
- `background: --bg-surface`.
- `border: 1px solid --border`.
- `border-radius: --radius-md`.
- Lewy pasek `3px solid [kolor-typu]`.
- Ikona typu (terminal/zegar) w lewym górnym rogu (mała, `14px`, kolor paska).
- Label typu: uppercase, `--text-xs`, `--text-muted`, `letter-spacing: 0.08em`.
- Przycisk 🗑 (delete) po prawej: `--text-muted`, hover → `--danger`.
- `margin-bottom: --space-2` między akcjami.

**Typ: KEYSTROKE SEQUENCE** (pasek `--action-keystroke` = różowy)
- Zawartość: tekst sekwencji klawiszy.
- Styl tekstu: `--font-mono`, `--text-sm`, `--text-code` (zielonkawy).
- Specjalne słowa kluczowe jak `ENTER` wyróżnione: `background: --bg-surface-2`, `border: 1px solid --border`, `border-radius: --radius-sm`, `padding: 1px 4px`, `--text-xs`.

**Typ: DELAY** (pasek `--action-delay` = bursztynowy)
- Zawartość: pole numeryczne `100` + label `"ms"`.
- Input liczby: `background: --bg-input`, `border: 1px solid --border`, `border-radius: --radius-sm`, `width: ~60px`, `--text-sm`, `--text-primary`.
- Label `"ms"`: `--text-sm`, `--text-muted`.

**Przycisk `+ Add Action`**
- Wyśrodkowany pod listą akcji.
- `background: --bg-surface`, `border: 1px dashed --border`, `border-radius: --radius-md`.
- Pełna szerokość obszaru akcji.
- `color: --text-muted`, hover → `color: --text-primary`, `border-color: --accent`.
- Ikona `+` po lewej tekstu.

---

## 7. Widok: System

Ścieżka: `/system` — konfiguracja systemu i urządzenia.

### 7.1 Header

```
System Configuration
Manage device settings, firmware, and core parameters.
```

- Tytuł: `--text-2xl`, `--fw-semibold`, `--text-primary`.
- Podtytuł: `--text-sm`, `--text-secondary`.
- Separator wizualny: brak (spacing wystarczy).

### 7.2 Trójkolumnowy grid kart

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Device Info   │  │ Global Settings │  │   Management    │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: --space-5`.
- Każda karta: `background: --bg-surface`, `border: 1px solid --border`, `border-radius: --radius-lg`, `padding: --space-5`.

**Nagłówek karty**
- Ikona `16px` + label `--text-md`, `--fw-semibold`, `--text-primary`.
- Ikony: ⚙ Device Info, ⚡ Global Settings (equalizer), ⏱ Management.
- Separator `1px solid --border` poniżej nagłówka karty.

---

#### Karta: Device Info

Tabela z wierszami `label: value`:

| Label | Value | Styl value |
|---|---|---|
| Architecture | RP2040 | `--text-primary` |
| Firmware Version | v2.4.1-beta | `--text-accent` (zielony) |
| Build Date | 2023-10-24 14:32 UTC | `--text-secondary` |

- Każdy wiersz: `display: flex`, `justify-content: space-between`.
- Label: `--text-sm`, `--text-muted`.
- Value: `--text-sm`.
- Separator między wierszami: `1px solid --border-subtle` lub `padding: --space-3 0`.

---

#### Karta: Global Settings

**Bluetooth Device Name**
- Label: `"Bluetooth Device Name"`, `--text-sm`, `--text-muted`.
- Input field: wartość `"MacroForge-01"`.
- Ikona Bluetooth po lewej: `12px`, `--text-muted`.
- Ikona ołówka/edit po prawej inputa: `12px`, `--text-muted`, hover → `--text-primary`.
- `background: --bg-input`, `border: 1px solid --border`, `border-radius: --radius-md`, `padding: --space-2 --space-3`.

**WebUI Theme**
- Label: `"WebUI Theme"`, `--text-sm`, `--text-muted`.
- Segmented control z 3 opcjami: `Light | Dark | System`.
- Kontener: `background: --bg-input`, `border: 1px solid --border`, `border-radius: --radius-md`.
- Aktywna opcja (`Dark`): `background: --bg-surface-2`, `color: --text-primary`, `border-radius: --radius-sm`.
- Inactive: `color: --text-muted`.
- Każda opcja `flex: 1`, `text-align: center`, `--text-sm`.

---

#### Karta: Management

Trzy przyciski, ułożone pionowo z wyjątkiem Export/Import które są obok siebie:

**Flash Firmware** (primary action)
- `background: --accent`, `color: #000`, `--fw-semibold`.
- Pełna szerokość, `padding: --space-3`.
- Ikona błyskawicy `⚡` po lewej.
- `border-radius: --radius-md`.

**Export + Import** (secondary, obok siebie)
- Dwa przyciski `50% - gap/2` każdy.
- `background: --bg-surface-2`, `border: 1px solid --border`, `color: --text-primary`.
- Export: ikona strzałka w górę + `"Export"`.
- Import: ikona strzałka w dół + `"Import"`.
- `border-radius: --radius-md`.

**Reset to Defaults** (danger)
- Pełna szerokość.
- `background: --danger-bg`, `border: 1px solid rgba(248,113,113,0.4)`, `color: --danger`.
- Ikona ostrzeżenia `⚠` po lewej.
- `border-radius: --radius-md`.
- Hover: `background: rgba(248,113,113,0.2)`.

---

## 8. Stany interaktywne

### 8.1 Połączenie urządzenia

| Stan | Sidebar status dot | CTA Button | Dostępność funkcji |
|---|---|---|---|
| Disconnected | Szara/czerwona | `"Connect Device"` (--accent) | Layout readonly, Macros readonly, System readonly |
| Connected | Zielona | `"Disconnect device"` (danger border) | Pełna edycja |

### 8.2 Klawisze na gridzie

| Stan | Border | Tło | Etykieta |
|---|---|---|---|
| Default | `--border` | `--bg-surface-2` | `--text-primary` |
| Hover | `--border` jaśniejszy | `--bg-surface` | `--text-primary` |
| Selected | `--accent`, 1.5px | `--bg-surface-2` | `--accent` |
| Pressed (aktywna animacja) | `--accent` | `--bg-surface` | `--accent` |

### 8.3 Formularze i inputy

| Stan | Border | Tło |
|---|---|---|
| Default | `--border` | `--bg-input` |
| Focus | `--accent` | `--bg-input` |
| Error | `--danger` | `rgba(248,113,113,0.05)` |
| Disabled | `--border-subtle` | `--bg-surface` (opacity 50%) |

### 8.4 Przyciski

| Variant | Background | Text | Hover |
|---|---|---|---|
| Primary (accent) | `--accent` | `#000` | brightness +5%, shadow-accent |
| Secondary | `--bg-surface` + border | `--text-primary` | `--bg-surface-2` |
| Danger | `--danger-bg` + border | `--danger` | background intensywniejszy |
| Ghost | transparent | `--text-muted` | `--text-primary` |

---

## 9. Animacje i mikro-interakcje

- **Zmiana zakładki nav**: brak animacji — natychmiastowa zmiana widoku.
- **Kliknięcie klawisza na gridzie**: krótka animacja `scale(0.95)` trwająca `80ms`.
- **Pojawienie się binding panelu**: `opacity 0 → 1` + `translateX(8px → 0)`, `120ms ease-out`.
- **Logowanie w Serial Monitor**: nowy wpis wskakuje od dołu z `opacity 0 → 1`, `60ms`.
- **Przycisk SAVE BINDING**: po kliknięciu chwilowa zmiana etykiety na `"Saved ✓"` przez `1500ms`.
- **Badge "Unsaved Changes"**: pojawia się z `opacity 0 → 1`, `100ms`.
- **Akcje w macro edytorze**: drag-and-drop reorder z wizualnym placeholderem (drop shadow + opacity 60% na przeciąganym elemencie).

---

## 10. Responsywność

Aplikacja jest **desktopowa** — brak breakpointów mobilnych. Minimalna szerokość: **960px**.

- Sidebar: zawsze `180px`, niezwijany.
- Serial Monitor: zawsze widoczny, niezwijany.
- Grid klawiszy: skaluje się proporcjonalnie w dostępnym miejscu (max ~400px szerokości).
- Binding panel: `~300px` fixed width.

---

## 11. Komponenty wielokrotnego użytku

### Badge
```
[text content]
background: --bg-surface, border: 1px solid --border,
border-radius: --radius-sm, --text-xs, padding: 2px 6px
```

### Separator
```
height: 1px, background: --border-subtle, margin: --space-3 0
```

### Section Label
```
--text-xs, --text-muted, uppercase, letter-spacing: 0.1em, --fw-medium
```

### Icon Button
```
24x24px, background: transparent, color: --text-muted,
hover → color: --text-primary, border-radius: --radius-sm
```

### Tag / Pill
```
border-radius: 999px, --text-xs, padding: 3px 10px,
background: --bg-surface, border: 1px solid --border
```

---

## 12. Struktura plików (sugerowana)

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── SerialMonitor.tsx
│   ├── layout-view/
│   │   ├── ProfileList.tsx
│   │   ├── KeyGrid.tsx
│   │   ├── KeyCap.tsx
│   │   ├── Encoder.tsx
│   │   └── BindingPanel.tsx
│   ├── macros-view/
│   │   ├── MacroLibrary.tsx
│   │   ├── MacroEditor.tsx
│   │   ├── ActionCard.tsx        ← KeystrokeAction, DelayAction, MediaAction
│   │   └── AddActionButton.tsx
│   ├── system-view/
│   │   ├── DeviceInfoCard.tsx
│   │   ├── GlobalSettingsCard.tsx
│   │   └── ManagementCard.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── SegmentedControl.tsx
│       ├── TabSwitcher.tsx
│       └── SectionLabel.tsx
├── styles/
│   └── tokens.css             ← wszystkie --css-variables
├── pages/ (lub routes/)
│   ├── Layout.tsx
│   ├── Macros.tsx
│   └── System.tsx
└── App.tsx                    ← shell z Sidebar + SerialMonitor
```

---

## 13. Notatki implementacyjne dla agenta

1. **Monospace wszędzie** — żaden element UI nie używa sans-serif. `font-family: 'JetBrains Mono', monospace` globalnie.
2. **Kolor akcentu #C8FF00** — bardzo charakterystyczny żółto-zielony. Nie zastępować standardową zielenią.
3. **Tło aplikacji jest bardzo ciemne** — praktycznie czarne z minimalną domieszką zieleni. Unikać czystego `#000000` i czystego `#1a1a1a` bez zielonego odcienia.
4. **Serial Monitor** jest zawsze widoczny i interaktywny — nie jest skrywalny.
5. **Stan "Disconnected"** w Layout jest widoczny na makiecie — aplikacja działa bez połączenia, ale edycja powinna być ograniczona/blokowana.
6. **Lewe paski akcji** w Macro Editorze (keystroke/delay) są kluczowym elementem wizualnym — muszą być wyraźne.
7. **Siatka klawiszy** powinna obsługiwać kliknięcie i wizualne zaznaczenie jednego klawisza naraz.
8. **Profile** — lista ze scrollem jeśli więcej niż 5 pozycji.
9. **Encoder** na siatce jest interaktywnym elementem wizualnym (kółko z markerem), nie klikany jak klawisz — osobny komponent.
10. **Firmware Version** w Device Info ZAWSZE wyświetlana w `--accent` (zielony) jako jedyna wartość wyróżniona kolorem akcentu w tej karcie.
