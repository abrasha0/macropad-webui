# Macropad Configurator - UI Specification

## 1. Global Design Tokens & Theme

This application is a dark-themed, desktop-like web interface for configuring a hardware macropad.

### 1.1. Color Palette (Approximate HEX values)
*   **Backgrounds:**
    *   App Background (Main content): `#141414`
    *   Sidebar / Bottom Panel Background: `#1A1A1A`
    *   Card / Module Background: `#222222`
    *   Input Field Background: `#1A1A1A` or transparent with borders.
*   **Accents:**
    *   Primary Accent (Brand/Active/Action): `#C1F03B` (Vibrant Lime/Yellow-Green)
    *   Primary Accent Hover: `#AEE020`
*   **Text & Typography:**
    *   Text Primary: `#FFFFFF` or `#F3F4F6`
    *   Text Secondary (Muted): `#A1A1AA` or `#9CA3AF`
*   **Borders:**
    *   Default Border: `#333333`
    *   Active/Focus Border: `#C1F03B`
*   **Status & Terminal Colors:**
    *   System Log (`[SYSTEM]`): Cyan `#38BDF8`
    *   Device Log (`[DEVICE]`): Green `#4ADE80`
    *   Input Log (`[INPUT]`): Pink/Red `#F43F5E`
    *   Danger/Error (Reset button): Red `#EF4444`

### 1.2. Typography
*   **UI Font:** Sans-serif (e.g., Inter, Roboto). Crisp, highly legible.
*   **Code/Terminal Font:** Monospace (e.g., Fira Code, JetBrains Mono) for the Serial Monitor and keystroke representations.
*   **Font Weights:** Regular (400) for standard text, Medium (500) for labels/buttons, Semi-bold (600) for headers.

### 1.3. Global Layout Structure
The application uses a fixed, full-screen CSS Grid or Flexbox layout divided into three main areas:
1.  **Left Sidebar (Fixed Width):** ~280px wide, spans full height minus the bottom panel.
2.  **Main Content Area (Fluid):** Occupies remaining width. Contains the active view (Layout, Macros, or System).
3.  **Bottom Panel (Serial Monitor):** Fixed height (e.g., ~250px), spans the entire width (or full width minus sidebar). Resizable optionally, but static in mocks.

---

## 2. Global Components

### 2.1. Left Sidebar
*   **Header Section:**
    *   Icon container (circular, dark background, muted icon).
    *   Title: "macropad" (white) + "configurator" (lime green) stacked vertically.
    *   Status Indicator: Small dot (Green for Connected, Grey for Disconnected) + Text ("Connected" or "Disconnected").
*   **Main Action Button:**
    *   If disconnected: Solid Lime Green background, black text "Connect Device".
    *   If connected: Transparent background, white border (`#333333`), white text "Disconnect device".
*   **Navigation Menu:**
    *   Items: Layout, Macros, System.
    *   Layout: Flex container, left-aligned icon, text.
    *   Inactive state: Muted text, muted icon.
    *   Active state: Muted grey background (`#2A2A2A`), Lime Green left border (or text color), White text.

### 2.2. Bottom Panel: Serial Monitor
*   **Header Bar:**
    *   Left side: Terminal Icon + "SERIAL MONITOR" (muted uppercase). Status dot (green) + "COM3: 115200" (very muted, small text).
    *   Right side: Text buttons "Copy" and "Clear" (Cyan/Blue tint on hover).
    *   Bottom border separating header from logs.
*   **Log Area:**
    *   Scrollable container.
    *   Monospace font.
    *   Format: `[Timestamp] [TAG] Message`.
    *   Row hover states: Slight background highlight. Active highlighted row has a left pink border (as seen on `[INPUT]` logs).
*   **Command Input Area (Bottom):**
    *   Prefix `>` (Lime Green).
    *   Input placeholder: "Enter command...".

---

## 3. View 1: Layout Configurator (Macropad Configurator - Layout.png)

This view has a 3-column internal layout within the Main Content Area.

### 3.1. Left Column: Profiles List
*   **Header:** "PROFILES" (Small, uppercase, muted).
*   **List Items:**
    *   Box padding, rounded corners.
    *   Active Profile ("Profile 1 (Default)"): Lime Green border, Lime Green text.
    *   Inactive Profiles ("Profile 2 (Editing)", "Profile 3 (Gaming)"): No border (or transparent), white text.
*   **Add Profile Button:**
    *   Dashed border (`#333333`). Center aligned `+` icon.

### 3.2. Center Column: Canvas / Hardware View
*   **Container:** Large dark rounded rectangle background. Centered in available space.
*   **Keys Grid (4x4):**
    *   Rounded square buttons. Dark background (`#1A1A1A`), subtle lighter border.
    *   Labels centered (7, 8, 9, /, 4, 5, 6, *, 1, 2, 3, -, 0, ., ENT, +).
    *   Selected Key (e.g., '5'): Has a bright Lime Green border and text highlight.
*   **Encoder (Rotary Knob):**
    *   Positioned to the right of the grid.
    *   Concentric circles with a dot indicator. Text "VOL / MEDIA" below it.

### 3.3. Right Column: Binding Inspector
*   **Header:** "Binding: Key 5" (Lime Green). Subtitle element showing grid coordinates `2, 2` on the right edge.
*   **Mode Selector (Segmented Control):**
    *   Options: Keystroke, Macro, Media.
    *   Active state: Lighter grey background.
*   **Primary Key Input:**
    *   Label: "Primary Key" (Muted, small).
    *   Input field: Shows "Numpad 5". Lime Green border (active focus). 'x' icon on the right to clear.
    *   Helper text below: "Click to record a new key".
*   **Modifiers Toggle Group:**
    *   Label: "Modifiers".
    *   Grid of 4 buttons: CTRL, ALT, SHIFT, WIN. Dark grey background, centered text.
*   **Display Label Input:**
    *   Label: "Display Label (Optional)".
    *   Standard text input (e.g., placeholder "e.g. 'Heal'").
*   **Action Button:** "SAVE BINDING" (Full width, Solid Lime Green, Black text).

---

## 4. View 2: Macros Editor (Macropad Configurator - Macros.png)

This view has a 2-column internal layout (Library and Editor Canvas).

### 4.1. Left Column: Library
*   **Header:** "Library" + a Lime Green square button with a black `+` icon on the right.
*   **Search Bar:**
    *   Magnifying glass icon + "Search macros..." placeholder. Rounded full-width input.
*   **Macro List Cards:**
    *   Displays Title (e.g., "Git Commit Flow").
    *   Displays meta info below (e.g., "4 steps • 1.2s").
    *   Active Card: Lime Green border, Lime Green title text, 3-dots context menu icon on the right.
    *   Inactive Cards: Standard border, white text.

### 4.2. Right Column: Macro Flow Builder (Canvas)
*   **Header:**
    *   Title: "Git Commit Flow".
    *   Badge: "Unsaved Changes" (Muted background, small text).
    *   Actions (Right): "▶ Test" (Outline button), "Save" (Solid Lime Green button).
*   **Flow Canvas Area:**
    *   **Trigger Node:** Pill-shaped badge at the top: "TRIGGER: KEY 4". Bordered.
    *   **Action Cards (Nodes):** Stacked vertically, connected visually (or just with spacing).
        *   Card styling: Dark background, rounded corners. Left colored border indicating action type. Trash icon on the right to delete.
        *   *Type: Keystroke Sequence* (Pink left border). Icon indicating keyboard. Label "KEYSTROKE SEQUENCE". Value formatted in monospace (e.g., `git add . ENTER`).
        *   *Type: Delay* (Cyan/Blue left border). Clock icon. Label "DELAY". Contains a small number input field (e.g., `100`) followed by "ms".
    *   **Add Action Button:**
        *   Below the last node. Pill-shaped outline button: "+ Add Action".

---

## 5. View 3: System Configuration (Macropad Configurator - System.png)

This view features a header and a CSS Grid layout for settings cards.

### 5.1. View Header
*   Title: "System Configuration" (Large, White).
*   Subtitle: "Manage device settings, firmware, and core parameters." (Muted).

### 5.2. Settings Cards Grid (3 Columns)
*   **Card 1: Device Info**
    *   Header: Icon + "Device Info".
    *   Content: Key-value rows in subtle bordered boxes.
        *   Architecture: `RP2040`
        *   Firmware Version: `v2.4.1-beta` (Lime Green text).
        *   Build Date: `2023-10-24 14:32 UTC`.
*   **Card 2: Global Settings**
    *   Header: Icon + "Global Settings".
    *   Field 1: "Bluetooth Device Name". Input containing "MacroForge-01" with a small edit/pencil icon.
    *   Field 2: "WebUI Theme". Segmented control (Light, Dark, System). "Dark" is selected.
*   **Card 3: Management**
    *   Header: Icon + "Management".
    *   Button 1: "Flash Firmware" (Solid Lime Green, full width).
    *   Button Group: "Export" (left half) / "Import" (right half). Both outlined.
    *   Button 3: "Reset to Defaults" (Full width, outline, RED border and RED text, warning icon).
