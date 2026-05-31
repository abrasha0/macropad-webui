# ogólne wytyczne

- domyślnie darkmode (motyw obsidian/monokai)
- wzorowy ux pod konfigurację i operowanie makropadem 4x4 + enkoder
- łatwa dostępność połączenia urządzenia szeregowego i jego statusu (połączony/niepołączony)
- łatwa dostępność serial monitora
- zachowanie zasad DDD (gwarancja modularności i prostego rozszerzania interfejsu)
- realizacja zasad material 3 expressive (spójny, kolorowy interfejs, nastawienie na ux, płynne animacje, reaktywność w kontekście ui/ux, minimalizm)

# sekcje

## side menu

1. tytuł aplikacji "macropad configurator"
2. przycisk "connect device" będący jednocześnie informacją o statusie połączenia z możliwością rozłączenia
3. główna nawigacja:

- layout (edycja bindingów profili)
- macros (definiowanie i edycja makr)
- system (informacje i ustawienia systemowe)

3. dolna nawigacja (mniejsza, na samym dole)

- update (odnośnik do aktualizacji oprogramowania mikrokontrolera)\*

## main content

- dwa główne kontenery z podziałem:
  - 55% wysokości: główna treść
  - 45% wysokości: komponent z logami
- zależnie od wybranej zakładki w menu wyświetlana różna treść

### komponent z logami

- logi w formacie `hh:mm:SS:sss  [source]  log content` z odpowiednim kolorowaniem zależnie od źródła logów
- komponent ma miniheader z tytułem SERIAL MONITOR
- w prawym górnym rogu komponentu z logami przyciski do zerowania logów i skopiowania logów do schowka
- autoscroll włączony domyślnie i kiedy użytkownik przewinie na sam dół, wyłączany kiedy użytkownik przescrolluje wyżej

### layout

- dwa komponenty w wierszu:
  - 60% szerokosci: komponent layoutu
  - 40% szerokosci: komponent bindingu

#### komponent layoutu

- dwa komponenty w wierszu:
  - 30% szerokości: komponent z listą profili
  - 70% szerokości: komponent z makropadem
- klikalna wizualizacja makropada
- siatka przycisków 4x4 i po prawej stronie wizualizacja enkodera
- wizualizacja enkodera to estetyczny, minimalistyczny okrąg z kropką informującą o stanie obrotu enkodera (kropka zmienia położenie na sygnale obrotu)
- fizyczne kliknięcie przycisku (odpowiednie zdarzenie w serial monitorze) podświetla kliknięty przycisk
- obrót i kliknięcie enkodera jest wizualizowany na komponencie
- wybór przycisku otwiera komponent bindingu tego klawisza

#### komponent bindingu

- uzytkownik moze wpisac tekst
- zbindowac pojedynczy klawisz
- przypisac makro
- dodawac modyfikatory CRTL/ALT/SHIFT
- zbindowac kombinację klawiszy
- zbindowac akcję systemową/multimedialną
- binding enkodera ma 3 sekcje: obrót w prawo, obrót w lewo, kliknięcie

### macros

- dwa komponenty w wierszu:
  - 30% szerokosci: komponent biblioteki makr
  - 70% szerokosci: komponent definicji makr

#### komponent biblioteki makr

- spis zdefiniowanych makr
- mozliwosc dodawania/edycji makr
- wybor makra otwiera definicje tego makra w komponencie definicji makr

#### komponent definicji makr

- header z nazwą makra
- mozliwosc przetestowania makra
- mozliwosc zapisania makra
- definicja makra (ciągi akcji/przycisków/skrótów/przerw/kolejności/odpalanie cmd itp. - pipeline definiowany przez uzytkownika)

### system

- trzy komponenty:
  - komponent informacji o urządzeniu
  - komponent ustawień globalnych
  - komponent zarządzania

#### komponent informacji o urządzeniu

- wersja
- data builda
- architektura

#### komponent ustawień globalnych

- nazwa bluetooth urządzenia\*
- wybór motywu webui\*

#### komponent zarządzania

- flash firmware\*
- reset to defaults\*
- export/import profile

# responsywność

- webui ma działać prawidłowo zarówno na pełnowymiarowym oknie przeglądarki (fhd, 2k, 4k) jak i na urządzeniu mobilnym i gwarantować pokrycie tych samych funkcjonalności z odpowiednim skalowaniem i przesunięciem elementów

# \* - wątki rozwojowe wyświetlające template/modal "todo"
