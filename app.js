// Czekamy, aż cała strona (HTML) się załaduje
document.addEventListener('DOMContentLoaded', () => {

    // --- SEKCJA 1: ZMIENNE GLOBALNE I SELEKTORY DOM ---
    
    const LOCAL_STORAGE_KEY = 'AplikacjaFiszek';
    let wszystkieZestawy = {};
    let edytowanyZestaw = {
        oryginalnaNazwa: null,
        nazwa: '',
        fiszki: []
    };
    let edytowanyIndexFiszki = null;
    let aktualnyQuiz = {
        nazwa: '',
        karty: [],
        indexKarty: 0,
        tryb: 'kontynuuj'
    };

    const ekrany = {
        lista: document.getElementById('ekran-lista-zestawow'),
        edytor: document.getElementById('ekran-edytor'),
        quiz: document.getElementById('ekran-quizu')
    };

    // Ekran Listy
    const listaZestawowEl = document.getElementById('lista-zestawow');
    const btnPokazEdytorNowy = document.getElementById('btn-pokaz-edytor-nowy');
    const btnEksportuj = document.getElementById('btn-eksportuj');
    const inputImportuj = document.getElementById('input-importuj');

    // Ekran Edytora
    const btnWrocDoListy = document.getElementById('btn-wroc-do-listy');
    const naglowekEdytora = document.getElementById('naglowek-edytora');
    const inputNazwaZestawu = document.getElementById('input-nazwa-zestawu');
    const naglowekFormularzaFiszki = document.getElementById('naglowek-formularza-fiszki'); 
    const inputPytanie = document.getElementById('input-pytanie');
    const selectTypPytania = document.getElementById('select-typ-pytania');
    const polaFiszka = document.getElementById('pola-fiszka');
    const inputOdpowiedzFiszka = document.getElementById('input-odpowiedz-fiszka');
    const polaWybor = document.getElementById('pola-wybor');
    const kontenerOpcjiEdytora = document.getElementById('kontener-opcji-edytora');
    const btnDodajOpcje = document.getElementById('btn-dodaj-opcje');
    const inputGwiazdka = document.getElementById('input-gwiazdka'); 
    const btnDodajFiszke = document.getElementById('btn-dodaj-fiszke-do-zestawu');
    const btnAnulujEdycjeFiszki = document.getElementById('btn-anuluj-edycje-fiszki'); 
    const listaFiszekWEdytorzeEl = document.getElementById('lista-fiszek-w-edytorze');
    const btnZapiszCalyZestaw = document.getElementById('btn-zapisz-caly-zestaw');
    const btnUsunCalyZestaw = document.getElementById('btn-usun-caly-zestaw');

    // Ekran Quizu
    const btnWrocDoListyZQuizu = document.getElementById('btn-wroc-do-listy-z-quizu');
    const btnGwiazdkaQuiz = document.getElementById('btn-gwiazdka-quiz'); 
    const nazwaZestawuQuizEl = document.getElementById('nazwa-zestawu-quiz');
    const postepQuizuEl = document.getElementById('postep-quizu');
    const pytanieQuizuEl = document.getElementById('pytanie-quizu');
    const odpowiedzFiszkaQuizEl = document.getElementById('odpowiedz-fiszka-quiz');
    const opcjeWyborQuizEl = document.getElementById('opcje-wybor-quiz');
    const btnAkcjaQuizu = document.getElementById('btn-akcja-quizu');
    const kontenerOceny = document.getElementById('kontener-oceny');
    const btnOcenaUmiem = document.getElementById('btn-ocena-umiem');
    const btnOcenaPowtorz = document.getElementById('btn-ocena-powtorz');
    const ekranKoncaQuizuEl = document.getElementById('ekran-konca-quizu');
    const tekstKoncaQuizuEl = document.getElementById('tekst-konca-quizu');
    const btnRestartWszystko = document.getElementById('btn-restart-wszystko');
    const btnRestartTrudne = document.getElementById('btn-restart-trudne');

    // Modal startu quizu
    const modalStartQuizu = document.getElementById('modal-start-quizu');
    const modalNazwaZestawu = document.getElementById('modal-nazwa-zestawu');
    const modalStatyZestawu = document.getElementById('modal-staty-zestawu');
    const btnStartKontynuuj = document.getElementById('btn-start-kontynuuj');
    const btnStartGwiazdki = document.getElementById('btn-start-gwiazdki');
    const btnStartWszystko = document.getElementById('btn-start-wszystko');
    const btnAnulujStartQuizu = document.getElementById('btn-anuluj-start-quizu');


    // --- SEKCJA 2: ZARZĄDZANIE DANYMI ---

    function zapiszDoLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wszystkieZestawy));
    }

    function aktualizujFiszkeWDb(nazwaZestawu, idFiszki, wlasciwosc, wartosc) {
        try {
            const fiszka = wszystkieZestawy[nazwaZestawu].find(f => f.id === idFiszki);
            if (fiszka) {
                fiszka[wlasciwosc] = wartosc;
                zapiszDoLocalStorage();
            }
        } catch (e) {
            console.error("Nie udało się zaktualizować fiszki:", e);
        }
    }

    function migrujDane(zestawy) {
        let czyBylaZmiana = false;
        Object.values(zestawy).forEach(zestaw => {
            zestaw.forEach((fiszka, index) => {
                if (!fiszka.id) {
                    fiszka.id = Date.now().toString() + index;
                    czyBylaZmiana = true;
                }
                if (!fiszka.status) {
                    fiszka.status = 'nowe';
                    czyBylaZmiana = true;
                }
                if (typeof fiszka.gwiazdka === 'undefined') {
                    fiszka.gwiazdka = false;
                    czyBylaZmiana = true;
                }
            });
        });

        if (czyBylaZmiana) {
            console.log("Migracja danych zakończona. Zapisywanie nowej struktury.");
            zapiszDoLocalStorage();
        }
        return zestawy;
    }

    function ladujZLocalStorage() {
        const dane = localStorage.getItem(LOCAL_STORAGE_KEY);
        wszystkieZestawy = dane ? JSON.parse(dane) : {};
        wszystkieZestawy = migrujDane(wszystkieZestawy);
    }

    // --- SEKCJA 3: NAWIGACJA ---

    function pokazEkran(nazwaEkranu) {
        Object.values(ekrany).forEach(ekran => ekran.classList.remove('aktywny'));
        if (ekrany[nazwaEkranu]) ekrany[nazwaEkranu].classList.add('aktywny');
    }

    // --- SEKCJA 4: EKRAN LISTY ZESTAWÓW ---

    function renderujListeZestawow() {
        listaZestawowEl.innerHTML = '';
        const nazwyZestawow = Object.keys(wszystkieZestawy);
        if (nazwyZestawow.length === 0) {
            listaZestawowEl.innerHTML = '<p>Nie masz jeszcze żadnych zestawów. Stwórz nowy!</p>';
            return;
        }
        nazwyZestawow.forEach(nazwa => {
            const zestaw = wszystkieZestawy[nazwa];
            const total = zestaw.length;
            const nowe = zestaw.filter(f => f.status === 'nowe').length;
            const powtorka = zestaw.filter(f => f.status === 'powtorka').length;
            const umiem = total - nowe - powtorka;

            const divZestawu = document.createElement('div');
            divZestawu.className = 'zestaw-item';
            
            divZestawu.innerHTML = `
                <div>
                    <h3>${nazwa}</h3>
                    <p>
                        ${total} fiszek (Umiem: ${umiem}, Powtórka: ${powtorka}, Nowe: ${nowe})
                    </p>
                </div>
                <div class="zestaw-przyciski">
                    <button class="przycisk-maly btn-edytuj" data-nazwa="${nazwa}">Edytuj</button>
                    <button class="przycisk-maly zielony btn-otworz-modal-quizu" data-nazwa="${nazwa}">Ucz się</button>
                </div>
            `;
            listaZestawowEl.appendChild(divZestawu);
        });
    }

    listaZestawowEl.addEventListener('click', (e) => {
        const nazwa = e.target.dataset.nazwa;
        if (!nazwa) return;
        if (e.target.classList.contains('btn-edytuj')) {
            otworzEdytor(nazwa);
        } else if (e.target.classList.contains('btn-otworz-modal-quizu')) {
            otworzModalStartuQuizu(nazwa);
        }
    });

    btnPokazEdytorNowy.addEventListener('click', () => otworzEdytor(null));

    btnWrocDoListy.addEventListener('click', () => {
        if (edytowanyIndexFiszki !== null) {
            alert("Najpierw zakończ edycję fiszki (kliknij 'Zaktualizuj' lub 'Anuluj').");
            return;
        }
        if (confirm("Czy na pewno chcesz wyjść bez zapisywania? Zmiany w tym zestawie zostaną utracone.")) {
            pokazEkran('lista');
            renderujListeZestawow();
        }
    });
    
    // --- Logika Modala Startu Quizu ---

    function otworzModalStartuQuizu(nazwa) {
        const zestaw = wszystkieZestawy[nazwa];
        modalNazwaZestawu.innerText = nazwa;
        
        const total = zestaw.length;
        const doNauki = zestaw.filter(f => f.status === 'nowe' || f.status === 'powtorka').length;
        const gwiazdki = zestaw.filter(f => f.gwiazdka).length;

        modalStatyZestawu.innerHTML = `
            Do nauki (Nowe + Powtórka): <strong>${doNauki}</strong><br>
            Oznaczone gwiazdką: <strong>${gwiazdki}</strong><br>
            Wszystkich fiszek: <strong>${total}</strong>
        `;

        btnStartKontynuuj.dataset.nazwa = nazwa;
        btnStartGwiazdki.dataset.nazwa = nazwa;
        btnStartWszystko.dataset.nazwa = nazwa;
        btnStartKontynuuj.disabled = doNauki === 0;
        btnStartGwiazdki.disabled = gwiazdki === 0;
        btnStartWszystko.disabled = total === 0;
        
        modalStartQuizu.style.display = 'flex';
    }

    function zamknijModalStartuQuizu() {
        modalStartQuizu.style.display = 'none';
    }

    btnStartKontynuuj.addEventListener('click', (e) => {
        uruchomQuiz(e.target.dataset.nazwa, 'kontynuuj');
        zamknijModalStartuQuizu();
    });
    btnStartGwiazdki.addEventListener('click', (e) => {
        uruchomQuiz(e.target.dataset.nazwa, 'gwiazdki');
        zamknijModalStartuQuizu();
    });
    btnStartWszystko.addEventListener('click', (e) => {
        uruchomQuiz(e.target.dataset.nazwa, 'wszystko');
        zamknijModalStartuQuizu();
    });
    btnAnulujStartQuizu.addEventListener('click', zamknijModalStartuQuizu);
    modalStartQuizu.addEventListener('click', (e) => {
        if (e.target === modalStartQuizu) zamknijModalStartuQuizu();
    });


    // --- SEKCJA 5: EKRAN EDYTORA ZESTAWU ---

    function otworzEdytor(nazwaZestawu) {
        if (nazwaZestawu) {
            const zestaw = wszystkieZestawy[nazwaZestawu];
            edytowanyZestaw.oryginalnaNazwa = nazwaZestawu;
            edytowanyZestaw.nazwa = nazwaZestawu;
            edytowanyZestaw.fiszki = JSON.parse(JSON.stringify(zestaw));
            naglowekEdytora.innerText = `Edytujesz: ${nazwaZestawu}`;
            inputNazwaZestawu.value = nazwaZestawu;
            btnUsunCalyZestaw.style.display = 'block';
        } else {
            edytowanyZestaw.oryginalnaNazwa = null;
            edytowanyZestaw.nazwa = '';
            edytowanyZestaw.fiszki = [];
            naglowekEdytora.innerText = 'Tworzenie nowego zestawu';
            inputNazwaZestawu.value = '';
            btnUsunCalyZestaw.style.display = 'none';
        }
        renderujListeFiszekWEdytorze();
        wyczyscFormularzFiszki();
        pokazEkran('edytor');
    }

    selectTypPytania.addEventListener('change', () => {
        if (selectTypPytania.value === 'fiszka') {
            polaFiszka.style.display = 'block';
            polaWybor.style.display = 'none';
        } else {
            polaFiszka.style.display = 'none';
            polaWybor.style.display = 'block';
            if (kontenerOpcjiEdytora.childElementCount === 0) {
                dodajPustaOpcjeDoEdytora();
                dodajPustaOpcjeDoEdytora();
            }
        }
    });

    function dodajPustaOpcjeDoEdytora(tekst = '', jestPoprawna = false) {
        const divOpcji = document.createElement('div');
        divOpcji.className = 'opcja-w-edytorze';
        divOpcji.innerHTML = `
            <input type="checkbox" class="cb-poprawna" ${jestPoprawna ? 'checked' : ''}>
            <input type="text" class="input-opcja" placeholder="Treść opcji" value="${tekst}">
            <button class="przycisk-maly czerwony btn-usun-opcje">&times;</button>
        `;
        divOpcji.querySelector('.btn-usun-opcje').addEventListener('click', () => divOpcji.remove());
        kontenerOpcjiEdytora.appendChild(divOpcji);
    }

    btnDodajOpcje.addEventListener('click', () => dodajPustaOpcjeDoEdytora());

    btnDodajFiszke.addEventListener('click', () => {
        const pytanie = inputPytanie.value.trim();
        const typ = selectTypPytania.value;
        const gwiazdka = inputGwiazdka.checked; 

        if (!pytanie) {
            alert("Pytanie nie może być puste!");
            return;
        }

        let nowaFiszka = {
            id: edytowanyIndexFiszki !== null ? edytowanyZestaw.fiszki[edytowanyIndexFiszki].id : Date.now().toString(),
            pytanie: pytanie,
            typ: typ,
            status: edytowanyIndexFiszki !== null ? edytowanyZestaw.fiszki[edytowanyIndexFiszki].status : 'nowe',
            gwiazdka: gwiazdka
        };

        if (typ === 'fiszka') {
            const odpowiedz = inputOdpowiedzFiszka.value.trim();
            if (!odpowiedz) {
                alert("Odpowiedź nie może być pusta!");
                return;
            }
            nowaFiszka.odpowiedz = odpowiedz;
        } else {
            nowaFiszka.opcje = [];
            nowaFiszka.odpowiedzi = [];
            const opcjeElementy = kontenerOpcjiEdytora.querySelectorAll('.opcja-w-edytorze');
            opcjeElementy.forEach(opcjaEl => {
                const tekstOpcji = opcjaEl.querySelector('.input-opcja').value.trim();
                const jestPoprawna = opcjaEl.querySelector('.cb-poprawna').checked;
                if (tekstOpcji) {
                    nowaFiszka.opcje.push(tekstOpcji);
                    if (jestPoprawna) nowaFiszka.odpowiedzi.push(tekstOpcji);
                }
            });
            if (nowaFiszka.opcje.length < 2) {
                alert("Pytanie wielokrotnego wyboru musi mieć co najmniej 2 opcje.");
                return;
            }
            if (nowaFiszka.odpowiedzi.length === 0) {
                alert("Pytanie wielokrotnego wyboru musi mieć co najmniej 1 poprawną odpowiedź.");
                return;
            }
        }

        if (edytowanyIndexFiszki !== null) {
            edytowanyZestaw.fiszki[edytowanyIndexFiszki] = nowaFiszka;
        } else {
            edytowanyZestaw.fiszki.push(nowaFiszka);
        }

        renderujListeFiszekWEdytorze();
        wyczyscFormularzFiszki();
    });

    function renderujListeFiszekWEdytorze() {
        listaFiszekWEdytorzeEl.innerHTML = '';
        if (edytowanyZestaw.fiszki.length === 0) {
            listaFiszekWEdytorzeEl.innerHTML = '<p>Ten zestaw jest pusty. Dodaj fiszki powyżej.</p>';
        }

        edytowanyZestaw.fiszki.forEach((fiszka, index) => {
            const divFiszki = document.createElement('div');
            divFiszki.className = 'fiszka-w-edytorze';
            divFiszki.dataset.status = fiszka.status;
            
            const gwiazdkaHtml = fiszka.gwiazdka ? '<span class="gwiazdka-ikona">⭐</span>' : '';

            divFiszki.innerHTML = `
                <span>${gwiazdkaHtml} ${index + 1}. ${fiszka.pytanie} (${fiszka.typ})</span>
                <div class="fiszka-przyciski">
                    <button class="przycisk-maly btn-edytuj-fiszke" data-index="${index}">Edytuj</button>
                    <button class="przycisk-maly czerwony btn-usun-fiszke" data-index="${index}">&times;</button>
                </div>
            `;
            
            divFiszki.querySelector('.btn-usun-fiszke').addEventListener('click', (e) => {
                const indexDoUsuniecia = parseInt(e.target.dataset.index, 10);
                if (edytowanyIndexFiszki === indexDoUsuniecia) {
                    alert("Nie można usunąć fiszki podczas jej edycji. Najpierw anuluj edycję.");
                    return;
                }
                usunFiszkeZEdytora(indexDoUsuniecia);
            });
            
            divFiszki.querySelector('.btn-edytuj-fiszke').addEventListener('click', (e) => {
                if (edytowanyIndexFiszki !== null) {
                    alert("Już edytujesz inną fiszkę. Zakończ lub anuluj poprzednią edycję.");
                    return;
                }
                const indexDoEdycji = parseInt(e.target.dataset.index, 10);
                ladujFiszkeDoFormularza(indexDoEdycji);
            });
            
            listaFiszekWEdytorzeEl.appendChild(divFiszki);
        });
    }

    // ZAKTUALIZOWANA: Tekst przycisku zmieniony na "Zaktualizuj"
    function ladujFiszkeDoFormularza(index) {
        const fiszka = edytowanyZestaw.fiszki[index];
        if (!fiszka) return;

        edytowanyIndexFiszki = index;

        inputPytanie.value = fiszka.pytanie;
        selectTypPytania.value = fiszka.typ;
        inputGwiazdka.checked = fiszka.gwiazdka;
        
        selectTypPytania.dispatchEvent(new Event('change')); 
        kontenerOpcjiEdytora.innerHTML = '';

        if (fiszka.typ === 'fiszka') {
            inputOdpowiedzFiszka.value = fiszka.odpowiedz;
        } else if (fiszka.typ === 'wybor') {
            fiszka.opcje.forEach(opcja => {
                const jestPoprawna = fiszka.odpowiedzi.includes(opcja);
                dodajPustaOpcjeDoEdytora(opcja, jestPoprawna);
            });
        }

        naglowekFormularzaFiszki.innerText = `Edytujesz fiszkę #${index + 1}`;
        btnDodajFiszke.innerText = 'Zaktualizuj'; // ZMIANA
        btnAnulujEdycjeFiszki.style.display = 'inline-block'; // ZMIANA
        
        naglowekFormularzaFiszki.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function usunFiszkeZEdytora(index) {
        edytowanyZestaw.fiszki.splice(index, 1);
        renderujListeFiszekWEdytorze();
    }
    
    // ZAKTUALIZOWANA: Tekst przycisku zmieniony na "Dodaj"
    function wyczyscFormularzFiszki() {
        inputPytanie.value = '';
        inputOdpowiedzFiszka.value = '';
        kontenerOpcjiEdytora.innerHTML = '';
        selectTypPytania.value = 'fiszka';
        inputGwiazdka.checked = false;
        polaFiszka.style.display = 'block';
        polaWybor.style.display = 'none';

        edytowanyIndexFiszki = null;
        naglowekFormularzaFiszki.innerText = 'Dodaj nową fiszkę';
        btnDodajFiszke.innerText = 'Dodaj'; // ZMIANA
        btnAnulujEdycjeFiszki.style.display = 'none';
    }
    
    btnAnulujEdycjeFiszki.addEventListener('click', wyczyscFormularzFiszki);

    btnZapiszCalyZestaw.addEventListener('click', () => {
        if (edytowanyIndexFiszki !== null) {
            alert("Nie można zapisać zestawu podczas edycji fiszki. Najpierw zaktualizuj lub anuluj.");
            return;
        }
        const nowaNazwa = inputNazwaZestawu.value.trim();
        if (!nowaNazwa) {
            alert("Nazwa zestawu nie może być pusta!");
            return;
        }
        if (nowaNazwa !== edytowanyZestaw.oryginalnaNazwa && wszystkieZestawy[nowaNazwa]) {
            alert("Zestaw o tej nazwie już istnieje!");
            return;
        }
        if (edytowanyZestaw.oryginalnaNazwa && edytowanyZestaw.oryginalnaNazwa !== nowaNazwa) {
            delete wszystkieZestawy[edytowanyZestaw.oryginalnaNazwa];
        }
        wszystkieZestawy[nowaNazwa] = edytowanyZestaw.fiszki;
        zapiszDoLocalStorage();
        alert("Zestaw zapisany pomyślnie!");
        pokazEkran('lista');
        renderujListeZestawow();
    });

    btnUsunCalyZestaw.addEventListener('click', () => {
        if (!edytowanyZestaw.oryginalnaNazwa) return;
        if (confirm(`Czy na pewno chcesz trwale usunąć zestaw "${edytowanyZestaw.oryginalnaNazwa}"?`)) {
            delete wszystkieZestawy[edytowanyZestaw.oryginalnaNazwa];
            zapiszDoLocalStorage();
            pokazEkran('lista');
            renderujListeZestawow();
        }
    });


    // --- SEKCJA 5B: IMPORT / EKSPORT ---

    function eksportujZestawy() {
        const dane = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!dane || Object.keys(JSON.parse(dane)).length === 0) {
            alert("Nie masz żadnych zestawów do wyeksportowania.");
            return;
        }
        const blob = new Blob([dane], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const data = new Date();
        const dataStr = `${data.getFullYear()}-${(data.getMonth()+1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;
        a.download = `fiszki-backup-${dataStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importujZestawy(event) {
        const plik = event.target.files[0];
        if (!plik) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            let noweZestawy;
            try {
                noweZestawy = JSON.parse(e.target.result);
            } catch (err) {
                alert("Błąd! Plik jest uszkodzony lub ma nieprawidłowy format JSON.");
                return;
            }
            if (typeof noweZestawy !== 'object' || Array.isArray(noweZestawy) || noweZestawy === null) {
                alert("Błąd! Plik nie zawiera prawidłowej struktury zestawów.");
                return;
            }
            if (confirm("Czy chcesz połączyć importowane zestawy z obecnymi? Spowoduje to nadpisanie zestawów o tych samych nazwach.")) {
                noweZestawy = migrujDane(noweZestawy);
                wszystkieZestawy = { ...wszystkieZestawy, ...noweZestawy };
                zapiszDoLocalStorage();
                renderujListeZestawow();
                alert(`Import zakończony! Dodano/zaktualizowano ${Object.keys(noweZestawy).length} zestawów.`);
            }
        };
        reader.readAsText(plik);
        event.target.value = null;
    }


    // --- SEKCJA 6: EKRAN QUIZU ---

    function zamieszajTablice(tablica) {
        let zasieg = tablica.length;
        while (zasieg != 0) {
            let losowyIndex = Math.floor(Math.random() * zasieg);
            zasieg--;
            [tablica[zasieg], tablica[losowyIndex]] = [tablica[losowyIndex], tablica[zasieg]];
        }
        return tablica;
    }

    function uruchomQuiz(nazwaZestawu, tryb = 'kontynuuj') {
        const zestawBazowy = wszystkieZestawy[nazwaZestawu];
        if (!zestawBazowy || zestawBazowy.length === 0) {
            alert("Ten zestaw jest pusty!");
            return;
        }

        aktualnyQuiz.nazwa = nazwaZestawu;
        aktualnyQuiz.tryb = tryb;
        
        let kartyDoQuizu;

        if (tryb === 'kontynuuj') {
            kartyDoQuizu = zestawBazowy.filter(karta => karta.status === 'nowe' || karta.status === 'powtorka');
        } else if (tryb === 'gwiazdki') {
            kartyDoQuizu = zestawBazowy.filter(karta => karta.gwiazdka);
        } else { 
            kartyDoQuizu = [...zestawBazowy];
        }

        if (kartyDoQuizu.length === 0) {
            if(tryb === 'kontynuuj') alert("Gratulacje! Wszystko umiesz w tym zestawie. Możesz zacząć od nowa wybierając 'Ucz się wszystkiego od nowa'.");
            else if(tryb === 'gwiazdki') alert("Nie masz żadnych kart oznaczonych gwiazdką w tym zestawie.");
            else alert("Ten zestaw jest pusty.");
            
            pokazEkran('lista');
            renderujListeZestawow(); 
            return;
        }

        aktualnyQuiz.karty = zamieszajTablice([...kartyDoQuizu]);
        aktualnyQuiz.indexKarty = 0;

        nazwaZestawuQuizEl.innerText = nazwaZestawu;
        ekranKoncaQuizuEl.style.display = 'none';
        
        ladujNastepnaKarteQuizu();
        pokazEkran('quiz');
    }

    function ladujNastepnaKarteQuizu() {
        btnAkcjaQuizu.style.display = 'block';
        kontenerOceny.style.display = 'none';
        odpowiedzFiszkaQuizEl.style.display = 'none';
        opcjeWyborQuizEl.style.display = 'none';
        opcjeWyborQuizEl.innerHTML = '';
        
        if (aktualnyQuiz.indexKarty >= aktualnyQuiz.karty.length) {
            pokazEkranKoncaQuizu();
            return;
        }
        
        const karta = aktualnyQuiz.karty[aktualnyQuiz.indexKarty];
        
        pytanieQuizuEl.innerText = karta.pytanie;
        postepQuizuEl.innerText = `Pytanie ${aktualnyQuiz.indexKarty + 1} / ${aktualnyQuiz.karty.length}`;
        
        btnGwiazdkaQuiz.classList.toggle('aktywna', karta.gwiazdka);
        
        if (karta.typ === 'fiszka') {
            odpowiedzFiszkaQuizEl.innerText = karta.odpowiedz;
            btnAkcjaQuizu.innerText = 'Pokaż odpowiedź';
            btnAkcjaQuizu.onclick = pokazOdpowiedzQuizu;
        } else {
            const zamieszaneOpcje = zamieszajTablice([...karta.opcje]);
            zamieszaneOpcje.forEach((opcja) => {
                const divOpcji = document.createElement('div');
                divOpcji.className = 'opcja-quizu';
                divOpcji.innerHTML = `<label><input type="checkbox" name="quiz-opcja" value="${opcja}"> ${opcja}</label>`;
                opcjeWyborQuizEl.appendChild(divOpcji);
            });
            opcjeWyborQuizEl.style.display = 'block';
            btnAkcjaQuizu.innerText = 'Sprawdź odpowiedzi';
            btnAkcjaQuizu.onclick = pokazOdpowiedzQuizu;
        }
    }

    function pokazOdpowiedzQuizu() {
        const karta = aktualnyQuiz.karty[aktualnyQuiz.indexKarty];
        if (karta.typ === 'fiszka') {
            odpowiedzFiszkaQuizEl.style.display = 'block';
        } else {
            const wybraneOpcje = Array.from(opcjeWyborQuizEl.querySelectorAll('input:checked')).map(cb => cb.value);
            const poprawneOpcje = karta.odpowiedzi;
            opcjeWyborQuizEl.querySelectorAll('input').forEach(cb => cb.disabled = true);
            opcjeWyborQuizEl.querySelectorAll('label').forEach(label => {
                const input = label.querySelector('input');
                const wartosc = input.value;
                const jestPoprawna = poprawneOpcje.includes(wartosc);
                const zostalaWybrana = wybraneOpcje.includes(wartosc);
                if (jestPoprawna) label.classList.add('poprawna');
                else if (zostalaWybrana && !jestPoprawna) label.classList.add('bledna');
            });
        }
        btnAkcjaQuizu.style.display = 'none';
        kontenerOceny.style.display = 'block';
    }

    btnGwiazdkaQuiz.addEventListener('click', () => {
        const karta = aktualnyQuiz.karty[aktualnyQuiz.indexKarty];
        const nowyStatusGwiazdki = !karta.gwiazdka;
        
        karta.gwiazdka = nowyStatusGwiazdki; 
        btnGwiazdkaQuiz.classList.toggle('aktywna', nowyStatusGwiazdki);

        aktualizujFiszkeWDb(aktualnyQuiz.nazwa, karta.id, 'gwiazdka', nowyStatusGwiazdki);
    });

    btnOcenaUmiem.addEventListener('click', () => ocenKarte('umiem'));
    btnOcenaPowtorz.addEventListener('click', () => ocenKarte('powtorka'));
    
    function ocenKarte(status) {
        const karta = aktualnyQuiz.karty[aktualnyQuiz.indexKarty];
        
        if (aktualnyQuiz.tryb !== 'gwiazdki') {
             aktualizujFiszkeWDb(aktualnyQuiz.nazwa, karta.id, 'status', status);
        }
       
        aktualnyQuiz.indexKarty++;
        ladujNastepnaKarteQuizu();
    }
    
    function pokazEkranKoncaQuizu() {
        btnAkcjaQuizu.style.display = 'none';
        kontenerOceny.style.display = 'none';
        ekranKoncaQuizuEl.style.display = 'block';

        tekstKoncaQuizuEl.innerText = `Ukończyłeś zestaw w trybie: "${aktualnyQuiz.tryb}".`;

        const czySaTrudne = wszystkieZestawy[aktualnyQuiz.nazwa].some(karta => karta.status === 'powtorka');
        btnRestartTrudne.style.display = czySaTrudne ? 'block' : 'none';
        
        btnRestartWszystko.onclick = () => uruchomQuiz(aktualnyQuiz.nazwa, 'wszystko');
        btnRestartTrudne.onclick = () => uruchomQuiz(aktualnyQuiz.nazwa, 'kontynuuj');
    }
    
    btnWrocDoListyZQuizu.addEventListener('click', () => {
        if (confirm("Czy na pewno chcesz zakończyć ten quiz?")) {
            pokazEkran('lista');
            renderujListeZestawow();
        }
    });

    // --- SEKCJA 7: INICJALIZACJA APLIKACJI ---

    btnEksportuj.addEventListener('click', eksportujZestawy);
    inputImportuj.addEventListener('change', importujZestawy);

    function startAplikacji() {
        ladujZLocalStorage(); 
        renderujListeZestawow();
        pokazEkran('lista');
        selectTypPytania.dispatchEvent(new Event('change'));
    }
    
    startAplikacji();
});