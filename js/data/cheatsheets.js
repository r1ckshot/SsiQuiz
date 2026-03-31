window.CHEATSHEETS = {
  global: {
    title: "Globalne pułapki (działają we WSZYSTKICH sekcjach)",
    patterns: [
      {
        name: "🚫 Słowa absolutne → prawie zawsze FAŁSZ",
        desc: "zawsze, nigdy, wyłącznie, jedynie, obowiązkowo, niemożliwe, zawsze lepszy",
        examples: [
          "DL jest z natury lżejsze obliczeniowo od drzew w każdej skali",
          "RL nie korzysta z funkcji nagrody",
        ],
      },
      {
        name: "🖥️ Fizyczna infrastruktura jako odpowiedź na pytanie o algorytm → FAŁSZ",
        desc: "Jeśli w odpowiedzi pojawia się: liczba rdzeni CPU, częstotliwość procesora, rozmiar pliku, RAM — to pułapka.",
        examples: [
          "Maksymalizacja zużycia CPU jako miary inteligencji",
          "Liczba rdzeni CPU komputera",
        ],
      },
      {
        name: "🤪 Techniczny nonsens (dwa prawdziwe terminy sklejone bezsensownie) → FAŁSZ",
        desc: "Autorzy pytań często łączą dwa prawdziwe pojęcia w zdanie bez sensu.",
        examples: [
          "Ominięcie praw Kirchhoffa przez strojenie hiperparametrów",
          "Zamiana prądu zmiennego w stały samym algorytmem",
        ],
      },
    ],
  },
  sections: {
    1: {
      title: "Sekcja 1 — Teoria AI i Agenty",
      patterns: [
        { name: "Lista kompetencji AI → zwykle WSZYSTKIE poprawne", desc: "Pytania 'co należy do zakresu SI' — planowanie, uczenie, percepcja, wnioskowanie, optymalizacja → wszystkie tak." },
        { name: "Świadomość maszyny jako wymóg → FAŁSZ", desc: "Żadna standardowa def. SI nie wymaga świadomości." },
        { name: "Język programowania jako kryterium → FAŁSZ", desc: "AI definiuje się przez zachowanie/cel, nie przez język." },
      ],
    },
    2: {
      title: "Sekcja 2 — Python / NumPy / pandas",
      patterns: [
        { name: "numpy.range() → FAŁSZ", desc: "Nie istnieje. Poprawnie: numpy.arange()" },
        { name: "pip create / pip activate / pip deactivate → FAŁSZ", desc: "Takich komend nie ma. Poprawnie: python -m venv, deactivate" },
        { name: "df.select() / df.summary() / pandas.load_csv() → FAŁSZ", desc: "Nie istnieją w pandas." },
      ],
    },
    3: {
      title: "Sekcja 3 — Preprocessing danych",
      patterns: [
        { name: "Zawsze / nigdy dla technik normalizacji → FAŁSZ", desc: "'Zawsze logarytmuj', 'zawsze usuń kolumny' — pułapka absolutu." },
        { name: "Dopasuj na CAŁYM zbiorze przed podziałem → FAŁSZ", desc: "Zawsze fit na train, transform na test — inaczej data leakage." },
        { name: "min-max na cechach kategorycznych → FAŁSZ", desc: "min-max dla numerycznych, one-hot/ordinal dla kategorycznych." },
      ],
    },
    4: {
      title: "Sekcja 4 — Paradygmaty ML / sklearn",
      patterns: [
        { name: "ML zawsze wymaga etykiet → FAŁSZ", desc: "Unsupervised nie potrzebuje etykiet." },
        { name: "DL lżejsze niż klasyczny ML → FAŁSZ", desc: "DL wymaga więcej danych i mocy." },
        { name: "RandomForest wymaga standaryzacji → FAŁSZ", desc: "Drzewa są odporne na skalę cech." },
      ],
    },
    5: {
      title: "Sekcja 5 — Logika i Reguły Horna",
      patterns: [
        { name: "Prolog nie używa unifikacji → FAŁSZ", desc: "Unifikacja to fundament Prologu." },
        { name: "Klauzula Horna może mieć wiele głów → FAŁSZ", desc: "Co najwyżej JEDNA litera dodatnia (głowa)." },
        { name: "Forward chaining zaczyna od celu → FAŁSZ", desc: "Forward = od faktów do wniosków. Backward = od celu." },
      ],
    },
    6: {
      title: "Sekcja 6 — Algorytmy przeszukiwania",
      patterns: [
        { name: "BFS zawsze optymalny → FAŁSZ", desc: "Tylko przy równych kosztach kroków." },
        { name: "DFS gwarantuje optymalne rozwiązanie → FAŁSZ", desc: "DFS nie jest optymalny ani zupełny bez limitu." },
        { name: "A* optymalny przy ujemnych wagach → FAŁSZ", desc: "Wymaga nieujemnych wag i dopuszczalnej heurystyki." },
      ],
    },
    7: {
      title: "Sekcja 7 — Graf / Ścieżki w Pythonie",
      patterns: [
        { name: "Heurystyka może przeszacowywać → FAŁSZ dla A*", desc: "Admissible = NIGDY nie przeszacowuje." },
        { name: "Manhattan przeszacowuje w siatce 4-kierunkowej → FAŁSZ", desc: "Manhattan jest dopuszczalna dla 4-kierunkowej siatki." },
      ],
    },
    8: {
      title: "Sekcja 8 — Sieci neuronowe",
      patterns: [
        { name: "Sigmoid w szerokim zakresie → FAŁSZ", desc: "Sigmoid zwraca TYLKO wartości z (0,1)." },
        { name: "Dropout taki sam na treningu i teście → FAŁSZ", desc: "Na teście dropout jest wyłączony (lub skalowany)." },
        { name: "Adam nie wymaga doboru lr → FAŁSZ", desc: "Nadal wymaga ustawienia learning rate i innych hiperparametrów." },
      ],
    },
  },
};
