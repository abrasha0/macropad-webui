# Plan refaktoryzacji UI — macropad configurator

> Dokument opisuje pełną przebudowę UI aplikacji zgodnie z `ui_refactor.md`, makietami w `ui_sketch_reworked/*.png` i specyfikacjami `C_ui-spec.md` / `G_ui-spec.md`.

---

## Zmiany strukturalne — przed i po

```
PRZED:                                PO:
src/                                  src/
├── App.jsx                           ├── App.jsx
├── main.jsx                          ├── main.jsx
├── index.css                         ├── styles/
│                                     │   └── tokens.css
├── styles/
│   └── theme.js (usunąć)
├── components/                       ├── components/
│   ├── shell/                        │   ├── layout/
│   │   ├── Shell.jsx                 │   │   ├── Sidebar.tsx
│   │   ├── Sidebar.jsx               │   │   └── SerialMonitor.tsx
│   │   └── TopBar.jsx                │   │
│   ├── layout-view/                  │   ├── layout-view/
│   │   ├── LayoutView.jsx            │   │   ├── ProfileList.tsx
│   │   ├── LayerTabs.jsx             │   │   ├── KeyGrid.tsx
│   │   ├── KeyGrid.jsx               │   │   ├── KeyCap.tsx
│   │   ├── BindingPanel.jsx          │   │   ├── Encoder.tsx
│   │   └── EncoderWidget.jsx         │   │   └── BindingPanel.tsx
│   ├── macros-view/                  │   ├── macros-view/
│   │   ├── MacrosView.jsx            │   │   ├── MacroLibrary.tsx
│   │   ├── MacroLibrary.jsx          │   │   ├── MacroEditor.tsx
│   │   ├── MacroEditor.jsx           │   │   ├── ActionCard.tsx
│   ├── system-view/                  │   │   └── AddActionButton.tsx
│   │   ├── SystemView.jsx            │   ├── system-view/
│   │   ├── DeviceInfo.jsx            │   │   ├── DeviceInfoCard.tsx
│   │   ├── GlobalSettings.jsx        │   │   ├── GlobalSettingsCard.tsx
│   │   └── Management.jsx            │   │   └── ManagementCard.tsx
│   ├── monitor/                      │   └── ui/
│   │   └── SerialMonitor.jsx         │       ├── Badge.tsx
│   └── shared/                       │       ├── Button.tsx
│       ├── Toast.jsx                 │       ├── Input.tsx
│       ├── ProgressBar.jsx           │       ├── SegmentedControl.tsx
│       ├── KeyPicker.jsx             │       ├── TabSwitcher.tsx
│       └── Modal.jsx                 │       └── SectionLabel.tsx
├── contexts/                         ├── pages/
│   ├── DeviceContext.jsx             │   ├── LayoutPage.tsx
│   ├── LayoutContext.jsx             │   ├── MacrosPage.tsx
│   ├── MacroContext.jsx              │   └── SystemPage.tsx
│   └── ToastContext.jsx              │
├── hooks/                            ├── contexts/ (zostają)
│   ├── useSerial.js                  │   └── ...
│   ├── useDevice.js                  ├── hooks/ (zostają)
│   ├── useLayout.js                  │   └── ...
│   ├── useMacro.js                   ├── constants/ (zostają)
│   ├── useToast.js                   │   └── ...
│   └── useAutoScroll.js              └── utils/ (zostaje)
├── constants/
│   ├── hidCodes.js
│   ├── defaults.js
│   └── index.js
└── utils/
    └── keycode.js
```

---

## Faza 0 — Tokeny designu (`styles/tokens.css`)

**Plik:** `src/styles/tokens.css` (zastępuje `src/index.css`)

### Paleta kolorów

```css
/* Backgrounds */
--bg-app:        #0D0F0C;
--bg-sidebar:    #111410;
--bg-surface:    #181B15;
--bg-surface-2:  #1F231B;
--bg-input:      #141714;

/* Borders */
--border:        #2A2F26;
--border-subtle: #1E221A;

/* Accent – żółto-zielony */
--accent:        #C8FF00;
--accent-dim:    #8FAF00;
--accent-glow:   rgba(200, 255, 0, 0.15);

/* Text */
--text-primary:  #E8EDE4;
--text-secondary:#7A8570;
--text-muted:    #4A5045;
--text-accent:   #C8FF00;
--text-code:     #A8D080;

/* Status */
--status-connected:    #4ADE80;
--status-disconnected: #F87171;
--danger:              #F87171;
--danger-bg:           rgba(248, 113, 113, 0.10);
--warning:             #FACC15;

/* Log colors */
--log-system: #60A5FA;
--log-device: #4ADE80;
--log-input:  #F87171;
--log-ts:     #4A5045;

/* Macro action borders */
--action-keystroke: #EC4899;
--action-delay:     #F59E0B;
--action-media:     #60A5FA;
```

### Typografia

- **Font UI:** `'JetBrains Mono', 'Fira Code', monospace` — monospace wszędzie
- **Font code:** `'JetBrains Mono', monospace`
- Skale: `--text-xs: 11px` do `--text-2xl: 24px`

### Spacing & Radius

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

### Shadows

```css
--shadow-key:    0 2px 8px rgba(0,0,0,0.5);
--shadow-panel:  0 0 0 1px var(--border);
--shadow-accent: 0 0 12px var(--accent-glow);
```

---

## Faza 1 — Shell layout

### `App.jsx` — nowy layout główny

```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (~180px)  │  MAIN CONTENT (flex:1)          │
│                     │                                  │
│                     │                                  │
├─────────────────────┴──────────────────────────────────┤
│  SERIAL MONITOR (full width, ~180px height)             │
└───────────────────────────────────────────────────────┘
```

- Sidebar: fixed/flex-shrink:0, ~180px, full height minus serial monitor
- Main content: flex:1, przewijalna (overflow-y: auto)
- Serial monitor: stały pasek na dole, **full width (włącznie z sidebar)**, ~180px height

### `Sidebar.tsx`

- Logo: kwadrat 32×32 z `background: --bg-surface`, `border-radius: --radius-md`, w środku ikona klawiatury w `--accent`
- Tekst: `macropad` (bold, --text-lg) + `configurator` (normal, --text-sm, --text-secondary)
- Status dot: 8px kółko (`--status-connected` / `--status-disconnected`) + tekst "Connected" / "Disconnected"
- CTA: `Connect Device` (--accent, #000, full width) / `Disconnect device` (danger border)
- Nawigacja: 3 pozycje (Layout/Macros/System) z ikonami 16×16, active → left border 2px --accent + `--bg-surface-2`

### `SerialMonitor.tsx`

- Header: ikona terminala 12px + `SERIAL MONITOR` (uppercase, --text-xs, --text-muted) + status COM (dot + "COM3: 115200") + Copy | Clear buttons
- Log area: ~120-140px, overflow-y auto, format `HH:mm:SS:sss [TAG] message` z kolorowaniem tagów
- Command input: separator, `> ` prompt w --accent + `<input>` placeholder "Enter command..."

---

## Faza 2 — Shared UI kit (`components/ui/`)

| Komponent | Opis |
|-----------|------|
| **Badge** | `background: --bg-surface`, `border: 1px solid --border`, `border-radius: --radius-sm`, `--text-xs`, padding 2px 6px |
| **Button** | Variants: primary (--accent, #000, --fw-semibold), secondary (--bg-surface, 1px --border, --text-primary), danger (--danger-bg, 1px --danger, --danger), ghost (transparent, --text-muted) |
| **Input** | `background: --bg-input`, `border: 1px solid --border`, `border-radius: --radius-md`, focus → --accent |
| **SegmentedControl** | Opcje w rzędzie, aktywna: `background: --bg-surface-2`, inactive: `color: --text-muted` |
| **TabSwitcher** | Kontener z tabami `flex: 1`, aktywny tab: `background: --bg-surface-2`, `color: --text-primary` |
| **SectionLabel** | `--text-xs`, `--text-muted`, uppercase, `letter-spacing: 0.1em`, `--fw-medium` |
| **IconButton** | 24×24px, transparent, `--text-muted`, hover → `--text-primary`, `border-radius: --radius-sm` |

---

## Faza 3 — Layout View

### `ProfileList.tsx`

- Nagłówek: `"PROFILES"` — SectionLabel
- Lista profili: każdy wiersz z `padding: --space-2 --space-3`, `border-radius: --radius-md`
- Aktywny: `background: rgba(200,255,0,0.08)`, left border 2px --accent, nazwa w --text-accent
- Inactive: hover → `background: --bg-surface`
- Podtytuł: `(Default)`, `(Editing)`, `(Gaming)` — `--text-xs`, `--text-muted`
- Przycisk `+` na dole: dashed border, --text-muted, hover → --accent

### `KeyGrid.tsx`

- Kontener wyśrodkowany, `background: --bg-surface`, `padding: --space-5`
- Siatka 4×4 z KeyCap (56-60px kwadraty)
- Obok rzędu 2: Encoder (kółko ~72px + etykieta `VOL / MEDIA`)

### `KeyCap.tsx`

- `background: --bg-surface-2`, `border: 1px solid --border`, `border-radius: --radius-md`, `box-shadow: --shadow-key`
- Etykieta: `--text-sm`, `--text-primary`, --fw-medium
- Selected: `border: 1.5px solid --accent`, `box-shadow: --shadow-accent, --shadow-key`, `color: --text-accent`
- Pressed: animacja `scale(0.95)`, 80ms

### `Encoder.tsx`

- SVG circle ~72px diameter
- Outer ring `stroke: --border`
- Marker: kropka 8px w --accent przy górnej krawędzi
- Label: `"VOL / MEDIA"`, --text-xs, --text-muted, uppercase

### `BindingPanel.tsx`

- Header: `"Binding: Key 5"` (--text-lg, --fw-semibold, --text-primary) + badge z pozycją `"2, 2"`
- **TabSwitcher**: Keystroke | Macro | Media
- **Sekcja Primary Key**: input (--bg-input, 1px --accent gdy aktywny) + `×` clear + hint "Click to record a new key"
- **Sekcja Modifiers**: 4 toggle CTRL | ALT | SHIFT | WIN — active: --accent, #000; inactive: --bg-surface, --border
- **Sekcja Display Label (Optional)**: input z placeholder "e.g. 'Heal'"
- **SAVE BINDING button**: full width, --accent, #000, uppercase. Po kliknięciu zmiana na "Saved ✓" na 1500ms

---

## Faza 4 — Macros View

### `MacroLibrary.tsx`

- Header: `"Library"` (--text-lg, --fw-semibold) + przycisk `+` (--accent, #000, 18×18px)
- Search: input z ikoną lupy, placeholder "Search macros..."
- Karty makr: nazwa + meta `"N steps • Xs"`, ikona `⋮` na hover
- Aktywna: `background: rgba(200,255,0,0.08)`, `border: 1px solid rgba(200,255,0,0.3)`

### `MacroEditor.tsx`

- Header: nazwa makra (--text-xl) + badge "Unsaved Changes" (warning) + `▶ Test` (secondary) + `💾 Save` (--accent)
- Trigger pill: `"TRIGGER: KEY 4"` — border-radius 999px, --text-xs, uppercase
- Lista ActionCard z `gap: --space-2`
- Przycisk `+ Add Action` (dashed border, full width)

### `ActionCard.tsx`

- Karta: `background: --bg-surface`, `border: 1px solid --border`, `border-radius: --radius-md`
- Lewy pasek 3px: `--action-keystroke` (różowy) / `--action-delay` (bursztynowy) / `--action-media` (niebieski)
- Ikona typu (14px, kolor paska) + label typu uppercase
- Przycisk 🗑 po prawej: --text-muted, hover → --danger
- **Keystroke**: tekst w `--font-mono`, `--text-sm`, `--text-code`, słowa kluczowe w badge'ach
- **Delay**: input numeryczny ~60px + "ms"

### `AddActionButton.tsx`

- Pełna szerokość, `background: --bg-surface`, `border: 1px dashed --border`, `border-radius: --radius-md`
- `color: --text-muted`, hover → `color: --text-primary`, `border-color: --accent`
- Ikona `+` + "Add Action"

---

## Faza 5 — System View

### `SystemView.tsx`

- Header: "System Configuration" (--text-2xl, --fw-semibold) + subtitle (--text-sm, --text-secondary)
- Grid: `display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: --space-5`

### `DeviceInfoCard.tsx`

- Karta: `background: --bg-surface`, `border: 1px solid --border`, `border-radius: --radius-lg`
- Nagłówek: ikona 16px + "Device Info" (--text-md, --fw-semibold)
- Wiersze klucz-wartość z `display: flex`, `justify-content: space-between`
- Architecture → --text-primary, Firmware Version → **--text-accent** (jedyne wyróżnienie), Build Date → --text-secondary
- Separatory między wierszami

### `GlobalSettingsCard.tsx`

- Nagłówek: ikona + "Global Settings"
- Bluetooth Device Name: input z "MacroForge-01" + ikona ołówka
- WebUI Theme: SegmentedControl (Light | Dark | System)

### `ManagementCard.tsx`

- Nagłówek: ikona + "Management"
- **Flash Firmware**: --accent, #000, full width, ikona błyskawicy
- **Export | Import**: obok siebie 50/50, secondary style
- **Reset to Defaults**: danger (--danger-bg, 1px --danger, --danger), ikona ostrzeżenia

---

## Faza 6 — Stany interaktywne

### Connection states

| Stan | Status dot | CTA button | Dostępność |
|------|-----------|------------|------------|
| Disconnected | --status-disconnected | "Connect Device" (--accent) | Wszystkie widoki readonly |
| Connected | --status-connected | "Disconnect device" (danger) | Pełna edycja |

### Key states (KeyCap)

| Stan | Border | Background | Text |
|------|--------|-----------|------|
| Default | --border | --bg-surface-2 | --text-primary |
| Hover | --border (jaśniejszy) | --bg-surface | --text-primary |
| Selected | 1.5px --accent | --bg-surface-2 | --text-accent |
| Pressed (anim) | --accent | --bg-surface | --text-accent |

### Form controls

| Stan | Border | Background |
|------|--------|-----------|
| Default | --border | --bg-input |
| Focus | --accent | --bg-input |
| Error | --danger | rgba(248,113,113,0.05) |
| Disabled | --border-subtle | --bg-surface (opacity 50%) |

---

## Faza 7 — Animacje

| Miejsce | Animacja |
|---------|----------|
| Zmiana zakładki nav | Natychmiast (brak animacji) |
| Kliknięcie klawisza | `scale(0.95)`, 80ms |
| Binding panel wejście | `opacity 0→1` + `translateX(8px→0)`, 120ms ease-out |
| Log w Serial Monitor | `opacity 0→1`, 60ms |
| SAVE BINDING | Zmiana etykiety na "Saved ✓", 1500ms |
| Badge "Unsaved Changes" | `opacity 0→1`, 100ms |
| Macro akcje | Drag-and-drop reorder z placeholderem |

---

## Co zostaje bez zmian

### Logika (domain layer)
- `constants/hidCodes.js` — mapy HID, kategorie
- `constants/defaults.js` — domyślne warstwy, makra, stringi
- `utils/keycode.js` — konwersja UI↔device

### Contexty (application layer)
- `DeviceContext.jsx` — min. zmiany (kolory logów, tagi [SYSTEM]/[DEVICE]/[INPUT])
- `LayoutContext.jsx` — profile zamiast layer tabs (min. adaptacja)
- `MacroContext.jsx` — bez zmian
- `ToastContext.jsx` — bez zmian

### Hooks
- `useSerial.js` — Web Serial API, bez zmian
- `useAutoScroll.js` — bez zmian
- `useDevice/useLayout/useMacro/useToast.js` — bez zmian (tylko context creatory)

### Shared components (kolorystyka tylko)
- `Toast.jsx` — nowe kolory tokenów
- `Modal.jsx` — bez zmian
- `ProgressBar.jsx` — nowe kolory

---

## Gaps: ui_refactor.md vs makiety

| Funkcja z ui_refactor.md | Status w makiecie | Rozwiązanie |
|---------------------------|-------------------|-------------|
| **Encoder binding** (left/right/press) | Encoder tylko wizualny na gridzie | BindingPanel wykrywa tryb enkodera → pokazuje 3 osobne sekcje |
| **Macro: string binding (BLE)** | Brak w makietach | Dodać zakładkę "Strings" w MacroLibrary lub osobny panel |
| **System: Update firmware** | Brak przycisku | Dodać jako disabled przycisk w ManagementCard (TODO) |
| **Profile rename (double-click)** | ProfileList nie pokazuje rename | Dodać inline rename przez double-click na nazwie profilu |
| **Responsywność** | Spec mówi desktop-only, min 960px | Nadpisuje ui_refactor.md — brak mobile breakpointów |

---

## Kolejność implementacji

```
Faza 0: styles/tokens.css
    ↓
Faza 1: Shell (Sidebar + SerialMonitor + App.jsx)
    ↓
Faza 5: Shared UI kit (Badge, Button, Input, TabSwitcher, SegmentedControl, SectionLabel)
    ↓
Faza 2: Layout View (ProfileList, KeyGrid, KeyCap, Encoder, BindingPanel)
    ↓
Faza 3: Macros View (MacroLibrary, MacroEditor, ActionCard, AddActionButton)
    ↓
Faza 4: System View (DeviceInfoCard, GlobalSettingsCard, ManagementCard)
    ↓
Faza 6: Stany (disconnected mode, readonly)
    ↓
Faza 7: Animacje i polerka
    ↓
Czyszczenie: usunięcie starych komponentów (LayerTabs, TopBar, KeyPicker, EncoderWidget, stary index.css)
```
