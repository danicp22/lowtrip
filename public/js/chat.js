// ---- Elementos de la página ----
const mensajesEl = document.getElementById('mensajes');
const zonaRespuestaEl = document.getElementById('zona-respuesta');
const progresoEl = document.getElementById('progreso');
const trayectoEl = document.getElementById('trayecto');

// ---- Estado del chat ----
let preguntas = [];      // las preguntas que llegan del servidor
let indice = 0;          // por qué pregunta vamos
const respuestas = {};   // lo que contesta el usuario: { origen: 'Valencia', ... }
const estilo = [];       // lo que elige en los duelos que no tienen hueco propio en el billete

const PAUSA_ESCRIBIENDO = 650;   // milisegundos que "escribe" LowTrip antes de cada mensaje

// Cada tipo de pregunta tiene su forma de responder
const pintores = {
    texto:    pintarCampoTexto,
    opcion:   pintarOpciones,
    multiple: pintarOpcionesMultiples,
    duelo:    pintarDuelo,
    rango:    pintarRango,
    escala:   pintarEscala,
    baraja:   pintarBaraja,
};

// 1. Pide las preguntas al servidor y empieza
async function iniciarChat() {
    try {
        const respuesta = await fetch('api/preguntas.php');
        if (!respuesta.ok) throw new Error('Error del servidor');

        preguntas = await respuesta.json();
        mostrarPregunta();
    } catch (error) {
        progresoEl.textContent = 'Sin conexión';
        mostrarMensaje('No se han podido cargar las preguntas. Recarga la página para volver a intentarlo.', 'bot');
    }
}

// 2. Añade un mensaje al chat
function mostrarMensaje(texto, autor) {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje mensaje--${autor}`;
    mensaje.textContent = texto;   // textContent y no innerHTML: así no se puede inyectar código (XSS)
    mensajesEl.append(mensaje);
    bajarScroll();
}

// Muestra los puntos de "escribiendo..." y después el mensaje de LowTrip
function escribirComoBot(texto) {
    return new Promise((resolver) => {
        const puntos = document.createElement('div');
        puntos.className = 'escribiendo';
        puntos.setAttribute('aria-label', 'LowTrip está escribiendo');
        puntos.innerHTML = '<span></span><span></span><span></span>';
        mensajesEl.append(puntos);
        bajarScroll();

        setTimeout(() => {
            puntos.remove();
            mostrarMensaje(texto, 'bot');
            resolver();
        }, PAUSA_ESCRIBIENDO);
    });
}

function bajarScroll() {
    mensajesEl.scrollTop = mensajesEl.scrollHeight;
}

// 3. Muestra la pregunta actual y la forma de responderla
async function mostrarPregunta() {
    const pregunta = preguntas[indice];
    progresoEl.textContent = `Pregunta ${indice + 1} de ${preguntas.length}`;
    moverAvion(indice / preguntas.length);

    await escribirComoBot(pregunta.texto);

    const pintar = pintores[pregunta.tipo];
    if (pintar) pintar(pregunta);

    bajarScroll();   // los botones ocupan sitio: volvemos a bajar para que no tapen el último mensaje
}

// ---------- Formas de responder ----------

// Texto: un campo para escribir (con botón "Saltar" si la pregunta es opcional)
function pintarCampoTexto(pregunta) {
    const config = pregunta.opciones || {};

    const formulario = document.createElement('form');
    formulario.className = 'respuesta-texto';

    const campo = document.createElement('input');
    campo.type = 'text';
    campo.placeholder = config.ejemplo || 'Escribe tu respuesta';
    campo.setAttribute('aria-label', pregunta.texto);
    campo.maxLength = 60;

    const enviar = crearBoton('Enviar', 'boton-principal', 'submit');
    formulario.append(campo, enviar);

    if (config.opcional) {
        const saltar = crearBoton('Saltar', 'boton-secundario');
        saltar.addEventListener('click', () => responder(pregunta, null, 'No, me vale cualquiera'));
        formulario.append(saltar);
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();          // evita que la página se recargue
        const valor = campo.value.trim();
        if (valor !== '') responder(pregunta, valor);
        else campo.focus();
    });

    zonaRespuestaEl.append(formulario);
    campo.focus();
}

// Opción: se elige una
function pintarOpciones(pregunta) {
    pregunta.opciones.forEach((opcion) => {
        const boton = crearBoton(opcion, 'opcion');
        boton.addEventListener('click', () => responder(pregunta, opcion));
        zonaRespuestaEl.append(boton);
    });
}

// Múltiple: se marcan varias y se pulsa Continuar
function pintarOpcionesMultiples(pregunta) {
    const seleccionadas = [];

    const continuar = crearBoton('Continuar', 'boton-principal');
    continuar.disabled = true;
    continuar.addEventListener('click', () => responder(pregunta, seleccionadas));

    pregunta.opciones.forEach((opcion) => {
        const boton = crearBoton(opcion, 'opcion');
        boton.setAttribute('aria-pressed', 'false');

        boton.addEventListener('click', () => {
            const posicion = seleccionadas.indexOf(opcion);
            const marcar = posicion === -1;

            if (marcar) seleccionadas.push(opcion);
            else seleccionadas.splice(posicion, 1);

            boton.setAttribute('aria-pressed', String(marcar));
            continuar.disabled = seleccionadas.length === 0;
        });

        zonaRespuestaEl.append(boton);
    });

    zonaRespuestaEl.append(continuar);
}

// Duelo: dos tarjetas grandes, esto o aquello
function pintarDuelo(pregunta) {
    const duelo = document.createElement('div');
    duelo.className = 'duelo';

    pregunta.opciones.forEach((opcion, posicion) => {
        if (posicion === 1) {
            const o = document.createElement('span');
            o.className = 'duelo__o';
            o.textContent = 'o';
            o.setAttribute('aria-hidden', 'true');
            duelo.append(o);
        }

        const tarjeta = document.createElement('button');
        tarjeta.type = 'button';
        tarjeta.className = 'duelo__tarjeta';

        const icono = document.createElement('span');
        icono.className = 'duelo__icono';
        icono.textContent = opcion.icono;
        icono.setAttribute('aria-hidden', 'true');

        const texto = document.createElement('span');
        texto.textContent = opcion.texto;

        tarjeta.append(icono, texto);
        tarjeta.addEventListener('click', () => responder(pregunta, opcion.texto));
        duelo.append(tarjeta);
    });

    zonaRespuestaEl.append(duelo);
}

// Rango: barra deslizante con el valor en grande y un mote según la cantidad
function pintarRango(pregunta) {
    const c = pregunta.opciones;

    const caja = document.createElement('div');
    caja.className = 'rango';

    const cifra = document.createElement('output');
    cifra.className = 'rango__cifra';

    const mote = document.createElement('span');
    mote.className = 'rango__mote';

    const barra = document.createElement('input');
    barra.type = 'range';
    barra.className = 'rango__barra';
    barra.min = c.min;
    barra.max = c.max;
    barra.step = c.paso;
    barra.value = c.inicial;
    barra.setAttribute('aria-label', pregunta.texto);

    const confirmar = crearBoton('Este es mi límite', 'boton-principal');

    function actualizar() {
        const valor = Number(barra.value);
        const relleno = ((valor - c.min) / (c.max - c.min)) * 100;
        cifra.textContent = `${valor} ${c.unidad}`;
        mote.textContent = c.tramos.find((tramo) => valor <= tramo.hasta).texto;
        barra.style.setProperty('--relleno', `${relleno}%`);
        barra.setAttribute('aria-valuetext', `${valor} ${c.unidad}, ${mote.textContent}`);
    }

    barra.addEventListener('input', actualizar);
    confirmar.addEventListener('click', () => {
        responder(pregunta, Number(barra.value), `Hasta ${barra.value} ${c.unidad}`);
    });

    const cabecera = document.createElement('div');
    cabecera.className = 'rango__cabecera';
    cabecera.append(cifra, mote);

    caja.append(cabecera, barra, confirmar);
    zonaRespuestaEl.append(caja);
    actualizar();
    barra.focus();
}

// Escala: puntuación del 1 al N entre dos extremos
function pintarEscala(pregunta) {
    const c = pregunta.opciones;

    const caja = document.createElement('div');
    caja.className = 'escala';

    const pasos = document.createElement('div');
    pasos.className = 'escala__pasos';

    for (let numero = 1; numero <= c.pasos; numero++) {
        const boton = crearBoton(String(numero), 'escala__paso');
        boton.style.setProperty('--nivel', numero / c.pasos);
        boton.setAttribute('aria-label', `${numero} de ${c.pasos}`);
        boton.addEventListener('click', () => {
            responder(pregunta, numero, `${numero} de ${c.pasos}`);
        });
        pasos.append(boton);
    }

    const extremos = document.createElement('div');
    extremos.className = 'escala__extremos';
    extremos.innerHTML = '<span></span><span></span>';
    extremos.children[0].textContent = c.min;
    extremos.children[1].textContent = c.max;

    caja.append(pasos, extremos);
    zonaRespuestaEl.append(caja);
}

// Baraja: cartas con planes que se deslizan a la derecha (me apunto) o a la izquierda (paso)
function pintarBaraja(pregunta) {
    const elegidos = [];
    let actual = 0;

    const caja = document.createElement('div');
    caja.className = 'baraja';

    const mesa = document.createElement('div');
    mesa.className = 'baraja__mesa';

    const contador = document.createElement('span');
    contador.className = 'baraja__contador';

    const paso = crearBoton('Paso', 'baraja__boton baraja__boton--no');
    const meApunto = crearBoton('Me apunto', 'baraja__boton baraja__boton--si');

    const botones = document.createElement('div');
    botones.className = 'baraja__botones';
    botones.append(paso, contador, meApunto);

    caja.append(mesa, botones);
    zonaRespuestaEl.append(caja);

    // Pinta la carta de arriba y deja asomar la siguiente por detrás
    function repartir() {
        mesa.innerHTML = '';
        contador.textContent = `${actual + 1} / ${pregunta.opciones.length}`;

        const siguiente = pregunta.opciones[actual + 1];
        if (siguiente) mesa.append(crearCarta(siguiente, 'carta carta--detras'));

        const carta = crearCarta(pregunta.opciones[actual], 'carta');
        mesa.append(carta);
        hacerArrastrable(carta);
    }

    // Decide la carta actual: true = me apunto, false = paso
    function decidir(meGusta) {
        const carta = mesa.querySelector('.carta:not(.carta--detras)');
        if (!carta || carta.classList.contains('carta--fuera')) return;

        if (meGusta) elegidos.push(pregunta.opciones[actual].texto);

        carta.style.transform = '';
        carta.classList.add('carta--fuera', meGusta ? 'carta--derecha' : 'carta--izquierda');

        setTimeout(() => {
            actual++;
            if (actual < pregunta.opciones.length) {
                repartir();
            } else {
                document.removeEventListener('keydown', conTeclado);
                const texto = elegidos.length ? elegidos.join(', ') : 'Ninguno me convence';
                responder(pregunta, elegidos, texto);
            }
        }, 280);
    }

    // Arrastrar con el ratón o con el dedo
    function hacerArrastrable(carta) {
        let inicioX = null;

        carta.addEventListener('pointerdown', (evento) => {
            inicioX = evento.clientX;
            carta.setPointerCapture(evento.pointerId);
            carta.classList.add('carta--arrastrando');
        });

        carta.addEventListener('pointermove', (evento) => {
            if (inicioX === null) return;
            const distancia = evento.clientX - inicioX;
            carta.style.transform = `translateX(${distancia}px) rotate(${distancia / 14}deg)`;
            carta.dataset.tendencia = distancia > 40 ? 'si' : distancia < -40 ? 'no' : '';
        });

        carta.addEventListener('pointerup', (evento) => {
            if (inicioX === null) return;
            const distancia = evento.clientX - inicioX;
            inicioX = null;
            carta.classList.remove('carta--arrastrando');

            if (Math.abs(distancia) > 90) {
                decidir(distancia > 0);
            } else {
                carta.style.transform = '';     // no ha llegado: la carta vuelve a su sitio
                carta.dataset.tendencia = '';
            }
        });
    }

    // También con las flechas del teclado
    function conTeclado(evento) {
        if (evento.key === 'ArrowRight') decidir(true);
        if (evento.key === 'ArrowLeft') decidir(false);
    }

    paso.addEventListener('click', () => decidir(false));
    meApunto.addEventListener('click', () => decidir(true));
    document.addEventListener('keydown', conTeclado);

    repartir();
}

function crearCarta(plan, clase) {
    const carta = document.createElement('div');
    carta.className = clase;

    const icono = document.createElement('span');
    icono.className = 'carta__icono';
    icono.textContent = plan.icono;
    icono.setAttribute('aria-hidden', 'true');

    const texto = document.createElement('span');
    texto.className = 'carta__texto';
    texto.textContent = plan.texto;

    carta.append(icono, texto);
    return carta;
}

function crearBoton(texto, clase, tipo = 'button') {
    const boton = document.createElement('button');
    boton.type = tipo;
    boton.className = clase;
    boton.textContent = texto;
    return boton;
}

// 4. Guarda la respuesta, la apunta en el billete y pasa a la siguiente
//    valor: lo que se guarda para la IA   ·   textoVisible: lo que se ve en el chat
function responder(pregunta, valor, textoVisible) {
    respuestas[pregunta.clave] = valor;

    const texto = textoVisible ?? (Array.isArray(valor) ? valor.join(', ') : String(valor));
    mostrarMensaje(texto, 'usuario');
    actualizarBillete(pregunta, texto);

    zonaRespuestaEl.innerHTML = '';
    indice++;

    if (indice < preguntas.length) mostrarPregunta();
    else terminarChat();
}

// Escribe la respuesta en su hueco del billete
function actualizarBillete(pregunta, texto) {
    if (pregunta.clave === 'origen') {
        document.getElementById('codigo-origen').textContent = crearCodigo(texto);
        document.getElementById('ciudad-origen').textContent = texto;
        return;
    }

    let hueco = document.querySelector(`[data-campo="${pregunta.clave}"]`);

    // Los duelos sin hueco propio se van sumando a "Tu estilo"
    if (!hueco && pregunta.tipo === 'duelo') {
        estilo.push(estilo.length === 0 ? texto : texto.toLowerCase());
        hueco = document.querySelector('[data-campo="estilo"]');
        texto = estilo.join(', ');
    }

    if (!hueco) return;

    hueco.textContent = texto;
    hueco.classList.remove('relleno');
    void hueco.offsetWidth;            // truco para que la animación se repita cada vez
    hueco.classList.add('relleno');
}

// Coloca el avión del billete en su trayecto (0 = salida, 1 = destino)
function moverAvion(progreso) {
    trayectoEl.style.setProperty('--progreso', progreso);
}

// "Valencia" -> "VAL", "Ávila" -> "AVI": tres letras sin tildes, como un código de aeropuerto
function crearCodigo(ciudad) {
    return ciudad
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 3)
        .toUpperCase();
}

// 5. Fin del chat: el usuario arranca el talón del billete para "enviarlo" a la IA
async function terminarChat() {
    progresoEl.hidden = true;
    moverAvion(1);
    document.getElementById('sello').hidden = false;

    await escribirComoBot('¡Billete listo! Arranca el talón y se lo paso a la IA para que te busque destino.');

    const arrancar = crearBoton('Arrancar el talón', 'boton-principal');
    arrancar.addEventListener('click', arrancarTalon);
    zonaRespuestaEl.append(arrancar);
    bajarScroll();
}

async function arrancarTalon() {
    zonaRespuestaEl.innerHTML = '';

    const talon = document.getElementById('talon');
    const sinAnimaciones = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sinAnimaciones) {
        talon.hidden = true;
    } else {
        talon.classList.add('billete__talon--arrancado');
        talon.addEventListener('animationend', () => { talon.hidden = true; }, { once: true });
    }
    document.getElementById('ciudad-destino').textContent = 'Lo elige la IA';
    mostrarMensaje('Arrancado', 'usuario');

    await escribirComoBot('Recibido. En cuanto conectemos la IA, aquí aparecerá tu destino con el plan día a día.');

    // Para la demo: los datos que se le enviarán a la IA
    const detalles = document.createElement('details');
    detalles.className = 'datos-ia';
    detalles.innerHTML = '<summary>Ver los datos que se enviarán a la IA</summary>';

    const codigo = document.createElement('pre');
    codigo.textContent = JSON.stringify(respuestas, null, 2);
    detalles.append(codigo);
    mensajesEl.append(detalles);

    const reiniciar = crearBoton('Planificar otro viaje', 'boton-principal');
    reiniciar.addEventListener('click', () => location.reload());
    zonaRespuestaEl.append(reiniciar);
    bajarScroll();
}

iniciarChat();