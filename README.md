# ESP32 Macropad WebUI

Interfejs webowy do konfiguracji bezprzewodowego makropada 4×4 + enkoder EC11 opartego na ESP32. Komunikacja z urządzeniem odbywa się przez **Web Serial API** (USB, 115200 baud).

---

## Spis treści

- [Architektura](#architektura)
- [Uruchomienie](#uruchomienie)
- [Struktura projektu](#struktura-projektu)
- [Funkcjonalności](#funkcjonalności)
- [Protokół komunikacji](#protokół-komunikacji)
- [Format konfiguracji](#format-konfiguracji)
- [Budowa i wdrożenie](#budowa-i-wdrożenie)

---

## Architektura

### Stos technologiczny

| Warstwa | Technologia |
|---------|------------|
| Framework | React 19 (JSX) |
| Budowanie | Vite 8 |
| Stylizacja | Tailwind CSS 4 (dark mode) |
| Ikonki | Lucide React |
| Komunikacja | Web Serial API (`navigator.serial`) |
| Wdrożenie | Docker + Nginx (serwowanie statyczne) |

### Przepływ danych

```
┌─────────────┐    Web Serial (USB)     ┌──────────────┐
│  Macropad   │ ◄──────────────────────► │   WebUI      │
│  (ESP32)    │    JSON @ 115200 baud    │  (przegląd.) │
└─────────────┘                          └──────────────┘
     │                                        │
     │ LittleFS (config.json)                 │ LocalStorage (nie req.)
     └── 5 warstw × 16 klawiszy               └── Stan UI (React state)
         + enkoder (left/right/press)
         + do 32 makr × 64 kroków
         + stringi (tekst przez BLE)
```

---

## Uruchomienie

### Wymagania

- Node.js 20+
- npm

### Development

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Build produkcyjny

```bash
npm run build
npm run preview
# → http://localhost:4173
```

### Docker

```bash
docker build -t macropad-webui .
docker run -d -p 8080:80 macropad-webui
# → http://localhost:8080
```

---

## Struktura projektu

```
src/
├── main.jsx                  # Entry point React
├── App.jsx                   # Główna aplikacja (wszystkie komponenty)
├── index.css                 # Import Tailwind CSS
├── constants/
│   ├── hidCodes.js           # Kody HID, mapy mediów, kategorie klawiszy
│   └── defaults.js           # Domyślne warstwy, makra, stringi
├── hooks/
│   └── useSerial.js          # Hook Web Serial API (connect/send/disconnect)
└── utils/
    └── keycode.js            # Konwersja UI ↔ device keycode (typy 0-4)
```

### Kluczowe moduły

#### `src/constants/hidCodes.js`

- `MEDIA_MAP` — mapowanie nazw mediów (`"Vol Up"`) na kody HID (1-9)
- `HID_NAMED` — mapowanie nazw klawiszy specjalnych (`"Enter"`, `"F1"`) na kody HID
- `KEY_CATEGORIES` — kategorie klawiszy dla edytora (Litery, Specjalne, Nawigacja, Funkcyjne, Media, Warstwy)
- `MOD_MAP` — modyfikatory: `Ctrl=1`, `Shift=2`, `Alt=4`, `GUI=8`

#### `src/utils/keycode.js`

Funkcje konwersji między reprezentacją UI (string, np. `"Ctrl+Shift+C"`) a 16-bitowym kodem urządzenia:

| Typ | Bit 15-12 | UI Prefix | Przykład UI | Przykład device |
|-----|-----------|-----------|-------------|-----------------|
| Standard | `0` | *(brak)* | `"A"`, `"Ctrl+C"` | `0x0004` |
| Media | `1` | *(nazwa)* | `"Vol Up"` | `0x1001` |
| Makro | `2` | `M:` | `"M:0"` | `0x2000` |
| Warstwa | `3` | `L` | `"L2"` | `0x3002` |
| Tekst | `4` | `T:` | `"T:1"` | `0x4001` |

- `deviceLayersToUI(rawLayers, uiLayers, macros, strings)` — zamiana danych z firmware na format UI
- `uiLayersToDevice(uiLayers)` — zamiana formatu UI na dane dla firmware
- `getKeyDisplayString(cell, macros, strings)` — wyświetlanie przyjaznej nazwy klawisza
- `macroCodeToSteps(rawMacros)` — konwersja makr z formatu device na UI
- `stepsToDeviceCode(macros)` — konwersja makr z UI na format device

#### `src/hooks/useSerial.js`

Hook zarządzający połączeniem Web Serial:

- `connect(onMessage, onError)` — wybór portu → otwarcie (`115200` baud) → pętla odczytu JSON
- `send(data)` — wysyła `JSON.stringify(data) + '\n'` przez serial
- `disconnect()` — anuluje czytnik, zamyka writer i port
- `isConnected` — stan połączenia

#### `src/constants/defaults.js`

5 domyślnych profili (warstw):
- **Numpad** — klawiatura numeryczna
- **NFS: U2** — sterowanie do NFS Underground 2
- **CS2** — skróty do CS:GO/CS2
- **Custom 1** — pusta templatka
- **Custom 2** — pusta templatka

Encoder domyślnie: LEFT=Volume Down, RIGHT=Volume Up, PRESS=Mute.

---

## Funkcjonalności

### Podstawowe

| Funkcja | Status |
|---------|--------|
| Połączenie przez Web Serial API | ✅ |
| Wybór portu USB | ✅ |
| Live feedback klawiszy (key_state event) | ✅ |
| 5 warstw (profili) z przełączaniem | ✅ |
| Edytor klawisza (kategorie + modyfikatory) | ✅ |
| Edytor enkodera (left/right/press) | ✅ |
| Zapis konfiguracji do urządzenia | ✅ |
| Serial monitor (podgląd JSON) | ✅ |
| Powiadomienia Toast | ✅ |

### Makra

| Funkcja | Status |
|---------|--------|
| Lista makr (do 32) | ✅ |
| Dodawanie/usuwanie makr | ✅ |
| Edycja nazwy makra | ✅ |
| Edytor kroków (keycode + delay w ms) | ✅ |
| Dodawanie/usuwanie kroków (do 64) | ✅ |
| Krok "czekaj" (keycode = 0) | ✅ |
| Wybór klawisza dla kroku (ten sam picker co w gridzie) | ✅ |
| Uruchamianie makra z UI (`run_macro`) | ✅ |
| Pasek postępu wykonania makra | ✅ |
| Klawisz typu "Makro" w edytorze akcji | ✅ |

### Stringi (tekst przez BLE)

| Funkcja | Status |
|---------|--------|
| Lista stringów | ✅ |
| Dodawanie/edycja/usuwanie stringów | ✅ |
| Klawisz typu "Tekst" w edytorze akcji | ✅ |
| Wyświetlanie treści stringa w gridzie | ✅ |

### Zarządzanie konfiguracją

| Funkcja | Status |
|---------|--------|
| Eksport konfiguracji do pliku JSON | ✅ |
| Import konfiguracji z pliku JSON | ✅ |
| Reset do ustawień domyślnych | ✅ |
| Zmiana nazw warstw (double-click na zakładce) | ✅ |
| Automatyczne pobranie konfiguracji po podłączeniu | ✅ |
| Zapis makr i stringów w `set_config` | ✅ |

---

## Protokół komunikacji

Pełna specyfikacja w [README firmware'u](../makropad/README.md).

### Komendy WebUI → ESP

| Komenda | Opis |
|---------|------|
| `get_config` | Pobiera pełną konfigurację |
| `set_config` | Zapisuje konfigurację (layers + encoder + macros + strings) |
| `get_layer` | Pobiera aktualną warstwę |
| `set_layer` | Wymusza warstwę N (0-4) |
| `get_macros` | Pobiera makra i stringi |
| `set_macros` | Zapisuje makra i stringi |
| `run_macro` | Testuje wykonanie makra |

### Eventy ESP → WebUI

| Event | Opis |
|-------|------|
| `config` | Odpowiedź na `get_config` |
| `status` | Potwierdzenie/błąd operacji |
| `key_state` | Zmiana stanu klawisza (live feedback) |
| `layer_change` | Zmiana aktywnej warstwy |
| `macros` | Odpowiedź na `get_macros` |
| `macro_progress` | Postęp wykonania makra |
| `log` | Logi diagnostyczne |

---

## Format konfiguracji

### Wewnętrzny format UI (React state)

```js
// Warstwy
layers = [
  {
    name: "Numpad",                    // nazwa wyświetlana (tylko UI)
    keys: [                             // 4×4
      ["7", "8", "9", "/"],
      ["4", "5", "6", "*"],
      ["1", "2", "3", "-"],
      ["0", ".", "Ent", "+"],
    ],
    encoder: { left: "Vol Down", right: "Vol Up", press: "Mute" },
  },
  // ... 4 więcej
]

// Makra
macros = [
  {
    name: "Login",
    steps: [
      { keycode: "M:0", delay: 50 },   // "M:0" = macro 0 → Ctrl+C → Ctrl+V → Enter
      { keycode: "", delay: 500 },     // wait 500ms
      { keycode: "Enter", delay: 100 },
    ],
  },
]

// Stringi
strings = ["hello@example.com", "password123"]
```

### Format JSON dla urządzenia (przy zapisie/eksporcie)

```json
{
  "layers": [[...5×16 kodów...]],
  "encoder": [{"left": 4097, "right": 4098, "press": 4100}, ...],
  "macros": [{"name": "Login", "steps": [{"keycode": 1302, "delay": 50}]}],
  "strings": ["hello@example.com"],
  "_layerNames": ["Numpad", "NFS: U2", "CS2", "Custom 1", "Custom 2"],
  "_version": 2
}
```

### 16-bitowy kod klawisza

| Bity | Pole | Opis |
|------|------|------|
| 15-12 | type | `0`=standard, `1`=media, `2`=makro, `3`=warstwa, `4`=tekst |
| 11-8 | mods | bit0=Ctrl, bit1=Shift, bit2=Alt, bit3=GUI |
| 7-0 | key | kod HID / indeks media / indeks makra / nr warstwy / indeks stringa |

---

## Budowa i wdrożenie

### Wymagania produkcyjne

- Przeglądarka z Web Serial API (Chrome, Edge, Opera)
- Połączenie USB z macropadem (ESP32)
- Serwer statyczny (Nginx, Caddy, GitHub Pages, Docker)

### Docker

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

### Uwagi

- Aplikacja nie wymaga backendu — cała logika działa w przeglądarce
- Konfiguracja nie jest przechowywana lokalnie (source of truth = urządzenie)
- Web Serial API wymaga **HTTPS** (lub `localhost` w development)
- Wspierane przeglądarki: Chrome 89+, Edge 89+, Opera 76+
