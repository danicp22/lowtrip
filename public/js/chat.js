// ---- Elementos de la página ----
const mensajesEl = document.getElementById('mensajes');
const zonaRespuestaEl = document.getElementById('zona-respuesta');
const progresoEl = document.getElementById('progreso');

// ---- Estado del chat ----
let preguntas = [];      // las preguntas que llegan del servidor
let indice = 0;          // por qué pregunta vamos
const respuestas = {};   // lo que contesta el usuario: { origen: 'Valencia', ... }

const PAUSA_ESCRIBIENDO = 650;   // milisegundos que "escribe" LowTrip antes de cada mensaje

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

    await escribirComoBot(pregunta.texto);

    if (pregunta.tipo === 'texto') pintarCampoTexto(pregunta);
    else if (pregunta.tipo === 'opcion') pintarOpciones(pregunta);
    else if (pregunta.tipo === 'multiple') pintarOpcionesMultiples(pregunta);

    bajarScroll();   // los botones ocupan sitio: volvemos a bajar para que no tapen el último mensaje
}

// Tipo "texto": un campo para escribir
function pintarCampoTexto(pregunta) {
    const formulario = document.createElement('form');
    formulario.className = 'respuesta-texto';

    const campo = document.createElement('input');
    campo.type = 'text';
    campo.placeholder = 'Por ejemplo, Valencia';
    campo.setAttribute('aria-label', pregunta.texto);
    campo.required = true;
    campo.maxLength = 60;

    const boton = document.createElement('button');
    boton.type = 'submit';
    boton.className = 'boton-principal';
    boton.textContent = 'Enviar';

    formulario.append(campo, boton);
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();          // evita que la página se recargue
        const valor = campo.value.trim();
        if (valor !== '') responder(pregunta, valor);
    });

    zonaRespuestaEl.append(formulario);
    campo.focus();
}

// Tipo "opcion": se elige una
function pintarOpciones(pregunta) {
    pregunta.opciones.forEach((opcion) => {
        const boton = crearBotonOpcion(opcion);
        boton.addEventListener('click', () => responder(pregunta, opcion));
        zonaRespuestaEl.append(boton);
    });
}

// Tipo "multiple": se marcan varias y se pulsa Continuar
function pintarOpcionesMultiples(pregunta) {
    const seleccionadas = [];

    const continuar = document.createElement('button');
    continuar.type = 'button';
    continuar.className = 'boton-principal';
    continuar.textContent = 'Continuar';
    continuar.disabled = true;
    continuar.addEventListener('click', () => responder(pregunta, seleccionadas));

    pregunta.opciones.forEach((opcion) => {
        const boton = crearBotonOpcion(opcion);
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

function crearBotonOpcion(texto) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'opcion';
    boton.textContent = texto;
    return boton;
}

// 4. Guarda la respuesta, la apunta en el billete y pasa a la siguiente
function responder(pregunta, valor) {
    respuestas[pregunta.clave] = valor;

    const texto = Array.isArray(valor) ? valor.join(', ') : valor;
    mostrarMensaje(texto, 'usuario');
    actualizarBillete(pregunta.clave, texto);

    zonaRespuestaEl.innerHTML = '';
    indice++;

    if (indice < preguntas.length) mostrarPregunta();
    else terminarChat();
}

// Escribe la respuesta en su hueco del billete
function actualizarBillete(clave, texto) {
    if (clave === 'origen') {
        document.getElementById('codigo-origen').textContent = crearCodigo(texto);
        document.getElementById('ciudad-origen').textContent = texto;
        return;
    }

    const hueco = document.querySelector(`[data-campo="${clave}"]`);
    if (!hueco) return;

    hueco.textContent = texto;
    hueco.classList.add('relleno');
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

// 5. Fin del chat
async function terminarChat() {
    progresoEl.textContent = 'Billete completo';
    document.getElementById('ciudad-destino').textContent = 'Lo elige la IA';
    document.getElementById('sello').hidden = false;

    await escribirComoBot('¡Listo! Ya tengo todo lo que necesito para buscarte un viaje que encaje con tu presupuesto.');

    // Para la demo: los datos que se le enviarán a la IA
    const detalles = document.createElement('details');
    detalles.className = 'datos-ia';
    detalles.innerHTML = '<summary>Ver los datos que se enviarán a la IA</summary>';

    const codigo = document.createElement('pre');
    codigo.textContent = JSON.stringify(respuestas, null, 2);
    detalles.append(codigo);
    mensajesEl.append(detalles);

    const reiniciar = document.createElement('button');
    reiniciar.type = 'button';
    reiniciar.className = 'boton-principal';
    reiniciar.textContent = 'Planificar otro viaje';
    reiniciar.addEventListener('click', () => location.reload());
    zonaRespuestaEl.append(reiniciar);
    bajarScroll();
}

iniciarChat();