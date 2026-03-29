# Centrum Fiszek – Aplikacja do Nauki

Prosta i funkcjonalna aplikacja webowa do tworzenia własnych zestawów fiszek i efektywnej nauki. Projekt został stworzony w czystym JavaScript (Vanilla JS), z naciskiem na logikę zarządzania danymi w przeglądarce.

## Główne Funkcjonalności

*   **Zarządzanie Zestawami:** Tworzenie, edycja i usuwanie własnych talii fiszek.
*   **Dwa Typy Pytań:** Obsługa klasycznych fiszek (pytanie-odpowiedź) oraz pytań wielokrotnego wyboru.
*   **System Powtórek:** Aplikacja śledzi status nauki każdej karty (Nowe, Powtórka, Umiem) i pozwala filtrować trudniejsze pytania.
*   **Gwiazdkowanie:** Możliwość oznaczania ważnych fiszek gwiazdką i nauki tylko wybranych elementów.
*   **Import i Eksport:** Funkcja tworzenia kopii zapasowej zestawów do pliku JSON oraz ich ponownego wczytywania.
*   **Persistence:** Dane są zapisywane w `localStorage`, dzięki czemu nie znikają po zamknięciu przeglądarki.

## Technologie

*   **HTML5** – semantyczna struktura dokumentu.
*   **CSS3** – nowoczesny, responsywny wygląd (Flexbox, Grid).
*   **JavaScript (ES6+)** – dynamiczna manipulacja DOM, obsługa zdarzeń i logika quizu.
*   **LocalStorage API** – przechowywanie danych użytkownika bez bazy danych.

## Struktura Projektu

*   `index.html` – główna struktura aplikacji i ekrany (Lista, Edytor, Quiz).
*   `style.css` – warstwa wizualna i animacje.
*   `app.js` – serce aplikacji: logika zarządzania danymi, migracja i obsługa quizów.

---
Projekt stworzony do celów edukacyjnych.
