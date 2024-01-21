//------FUNKCIJE:---------

//map funkcija
function mojMap(arr, callback) {
    const novoPolje = [];
    for (let i = 0; i < arr.length; i++) {
        novoPolje.push(callback(arr[i], i, arr));
    }
    return novoPolje;
}

//reduce funkcija
function mojReduce(arr, callback, initialValue) {
    let vrijednost = initialValue === undefined ? arr[0] : initialValue;
    const pocetniIndex = initialValue === undefined ? 1 : 0;

    for (let i = pocetniIndex; i < arr.length; i++) {
        vrijednost = callback(vrijednost, arr[i], i, arr);
    }
    return vrijednost;
}

//pipe funkcija
function mojPipe(...funkcije) {
    return function (x) {
        return mojReduce(funkcije, (vrijednost, funkcija) => funkcija(vrijednost), x);
    };
}


//--------PODACI-------------

const knjige = JSON.parse(localStorage.getItem('knjige')) || [];

const forma = document.getElementById('knjigaForma');

forma.addEventListener('submit', (event) => {
    event.preventDefault();

    const naslov = document.getElementById('naslov').value;
    const autor = document.getElementById('autor').value;
    const dobAutora = document.getElementById('dobAutora').value;
    const brojProcitanih = parseInt(document.getElementById('brojProcitanih').value);
    const cijena = parseFloat(document.getElementById('cijena').value);

    dodajNovuKnjigu(naslov, autor, dobAutora, brojProcitanih, cijena);
    forma.reset();
});

function dodajNovuKnjigu(naslov, autor, dobAutora, brojProcitanih, cijena) {
    const knjige = JSON.parse(localStorage.getItem('knjige')) || [];
    const novaKnjiga = { naslov, autor, dobAutora, brojProcitanih, cijena };
    knjige.push(novaKnjiga);
    localStorage.setItem('knjige', JSON.stringify(knjige));
    location.reload();
}

function obrisiKnjigu(index) {
    const knjige = JSON.parse(localStorage.getItem('knjige')) || [];
    var confirmed = confirm("Jeste li sigurni da želite obrisati knjigu?");
        if (index >= 0 && index < knjige.length) {
            if(confirmed){
            knjige.splice(index, 1);
            localStorage.setItem('knjige', JSON.stringify(knjige));
            location.reload();
            }
        } else {
            console.error('Neispravan indeks knjige.');
        }
}


//--------KORISTENJE FUNKCIJA------------//

const listaKnjiga = document.getElementById('listaKnjiga');
const listaPreporucenihKnjiga = document.getElementById('listaPreporucenihKnjiga');
const lista = document.createElement('ol');
lista.classList.add("list-group", "list-group-numbered");

//mojMap
const kombiniraniPodaci = mojMap(knjige, (knjiga, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");

    const divItem = document.createElement("div");
    divItem.classList.add("ms-2", "me-auto");

    const naslov = document.createElement("strong");
    naslov.textContent = knjiga.naslov;
    divItem.appendChild(naslov);

    const paragraph = document.createElement("p");
    paragraph.textContent = `AUTOR: ${knjiga.autor}, DOB AUTORA: ${knjiga.dobAutora}, CIJENA KNJIGE: ${knjiga.cijena}€`;
    divItem.appendChild(paragraph);

    const span = document.createElement("span");
    span.classList.add("badge", "bg-primary", "rounded-pill");
    span.textContent = `${knjiga.brojProcitanih} puta pročitano`

    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-solid', 'fa-trash', 'ikona');
    iconElement.addEventListener('click', () => obrisiKnjigu(index));

    listItem.appendChild(divItem);
    listItem.appendChild(span);
    listItem.appendChild(iconElement);
    lista.appendChild(listItem);

    return listItem;
});

listaKnjiga.appendChild(lista);

const filter = document.getElementById('filter');
const preporuceno = mojMap(knjige, (knjiga) => {
    if (knjiga.brojProcitanih > 1000) {
        const item = document.createElement('li');
        item.textContent = knjiga.naslov;
        return item;
    }
    return null;
}).filter(Boolean);

preporuceno.forEach(li => {
    filter.appendChild(li);
});


const inputCijena = document.getElementById('maksimalnaCijena');
const inputBrojProcitanih = document.getElementById('brojProcitanih');

const filtrirajBtn = document.getElementById('filtrirajBtn');
const brojProcitanihFilter = document.getElementById('brojProcitanihFilter');

const jeftineKnjigeLista = document.getElementById('jeftineKnjigeLista');
const rezultatProsjecnaCijena = document.getElementById('rezultatProsjecnaCijena');


//mojReduce
function prikaziJeftinijeKnjige() {
    const maksimalnaCijena = Number(inputCijena.value);

    const jeftineKnjige = mojReduce(knjige, (acc, knjiga) => {
        if (knjiga.cijena < maksimalnaCijena) {
            acc.push(knjiga);
        }
        return acc;
    }, []);

    jeftineKnjigeLista.innerHTML = '';

    jeftineKnjige.forEach((knjiga) => {
        const jeftineKnjigeListItem = document.createElement('li');
        jeftineKnjigeListItem.textContent = `${knjiga.naslov}, Autor: ${knjiga.autor}, Cijena: ${knjiga.cijena}€`;
        jeftineKnjigeLista.appendChild(jeftineKnjigeListItem);
    });
}

filtrirajBtn.addEventListener('click', prikaziJeftinijeKnjige);

function autorSaNajviseProcitanih(knjige) {
    const autori = mojReduce(
        knjige,
        (acc, knjiga) => {
            if (!acc[knjiga.autor]) {
                acc[knjiga.autor] = 0;
            }
            acc[knjiga.autor] += knjiga.brojProcitanih;
            return acc;
        },
        {}
    );

    const najviseProcitaniAutor = mojReduce(
        Object.keys(autori),
        (a, b) => (autori[a] > autori[b] ? a : b)
    );

    return { autor: najviseProcitaniAutor, procitaneKnjige: autori[najviseProcitaniAutor] };
}

const najviseProcitaniAutor = autorSaNajviseProcitanih(knjige);
const prikaziNajviseProcitanogAutora = document.getElementById('najviseProcitaniAutor');
const paragrafAutor = document.createElement('p');
paragrafAutor.textContent = `Autor s najviše pročitanih knjiga: ${najviseProcitaniAutor.autor}, Pročitano: ${najviseProcitaniAutor.procitaneKnjige} puta`;
prikaziNajviseProcitanogAutora.appendChild(paragrafAutor);

//mojPipe
const statistikeKnjigaElement = document.getElementById('statistikeKnjiga');
const statistikeKnjigaParafgraf = document.createElement('p');
const statistikeKnjiga = mojPipe(
    (knjige) => {
        const ukupnoKnjiga = knjige.length;
        const prosjecnaCijenaSuma = mojReduce(
            knjige,
            (acc, knjiga) => acc + knjiga.cijena,
            0
        );
        const prosjecnaCijena = prosjecnaCijenaSuma / ukupnoKnjiga;
        return { ukupnoKnjiga, prosjecnaCijena };
    },
    (statistike) => {
        statistikeKnjigaParafgraf.textContent = `Ukupan broj knjiga: ${statistike.ukupnoKnjiga}. Prosječna cijena knjiga: ${statistike.prosjecnaCijena}€`;
        statistikeKnjigaElement.appendChild(statistikeKnjigaParafgraf);
        return statistike;
    }
);
statistikeKnjiga(knjige);


const grupirajBtn = document.getElementById('grupirajBtn');
const grupiraneKnjigePoAutoruElement = document.getElementById('grupiraneKnjigePoAutoru');


grupirajBtn.addEventListener('click', () => {
    const grupiraneKnjigePoAutoru = mojPipe(
        (knjige) => {
            const grupirano = {};
            knjige.forEach((knjiga) => {
                if (!grupirano[knjiga.autor]) {
                    grupirano[knjiga.autor] = [];
                }
                grupirano[knjiga.autor].push(knjiga);
            });
            return grupirano;
        },
        (grupirano) => {
            grupiraneKnjigePoAutoruElement.innerHTML = '';

            Object.entries(grupirano).forEach(([autor, knjige]) => {
                const row = document.createElement('div');
                row.classList.add('row');

                const autorCol = document.createElement('div');
                autorCol.style.fontWeight = 'bold';
                autorCol.textContent = autor;

                row.appendChild(autorCol);

                knjige.forEach((knjiga) => {
                    const col = document.createElement('div');
                    col.classList.add('col-sm-6');

                    const card = document.createElement('div');
                    card.classList.add('card', 'border-info', 'mb-3');
                    card.style.maxWidth = '18rem';

                    const naslov = document.createElement('h5');
                    naslov.classList.add('card-header');
                    naslov.textContent = knjiga.naslov;

                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    const cijena = document.createElement('p');
                    cijena.classList.add('card-text');
                    cijena.textContent = `Cijena: ${knjiga.cijena}€`;

                    const brojProcitanih = document.createElement('p');
                    brojProcitanih.classList.add('card-text');
                    brojProcitanih.textContent = `Pročitano ${knjiga.brojProcitanih} puta`;

                    cardBody.appendChild(cijena);
                    cardBody.appendChild(brojProcitanih);

                    card.appendChild(naslov);
                    card.appendChild(cardBody);
                    col.appendChild(card);

                    row.appendChild(col);
                });

                grupiraneKnjigePoAutoruElement.appendChild(row);
            });

            console.log(grupirano);

            return grupirano;
        }
    );
    grupiraneKnjigePoAutoru(knjige);
});
