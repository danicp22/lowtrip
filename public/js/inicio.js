// Panel de salidas: el destino del billete de ejemplo va cambiando letra a letra

const destinos = [
    { codigo: 'LIS', ciudad: 'Lisboa' },
    { codigo: 'BUD', ciudad: 'Budapest' },
    { codigo: 'OPO', ciudad: 'Oporto' },
    { codigo: 'KRK', ciudad: 'Cracovia' },
    { codigo: 'NAP', ciudad: 'Nápoles' },
    { codigo: 'BCN', ciudad: 'Barcelona' },
    { codigo: '???', ciudad: 'Por descubrir' },
];

const letras = document.querySelectorAll('#panel-codigo .letra');
const ciudadEl = document.getElementById('panel-ciudad');

const TIEMPO_ENTRE_DESTINOS = 2600;   // milisegundos
const TIEMPO_VOLTEO = 360;            // lo que dura el giro de cada letra

let posicion = 0;

function mostrarDestino(destino) {
    letras.forEach((letra, i) => {
        // cada letra empieza a girar un poco después que la anterior
        setTimeout(() => {
            letra.classList.add('letra--girando');

            // a mitad del giro (cuando la letra está de canto) se cambia el carácter
            setTimeout(() => { letra.textContent = destino.codigo[i]; }, TIEMPO_VOLTEO / 2);
            setTimeout(() => { letra.classList.remove('letra--girando'); }, TIEMPO_VOLTEO);
        }, i * 90);
    });

    setTimeout(() => { ciudadEl.textContent = destino.ciudad; }, TIEMPO_VOLTEO / 2);
}

// Si el usuario tiene desactivadas las animaciones en su sistema, el panel se queda quieto
const sinAnimaciones = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!sinAnimaciones && letras.length === 3) {
    setInterval(() => {
        mostrarDestino(destinos[posicion]);
        posicion = (posicion + 1) % destinos.length;
    }, TIEMPO_ENTRE_DESTINOS);
}