// Obtener elementos del DOM (estructura de la página)
const tablero = document.getElementById("tablero"); // El área donde se muestra el tablero de juego.
const resultado = document.getElementById("resultado"); // El área donde se muestra el resultado del juego.
const turno = document.getElementById("turno"); // El área donde se muestra de quién es el turno.
const btnReiniciar = document.getElementById("btn-reiniciar"); // El botón para reiniciar el juego.
const btnJugadorVsJugador = document.getElementById("btn-jugador-vs-jugador"); // El botón para jugar entre dos jugadores.
const btnJugadorVsIA = document.getElementById("btn-jugador-vs-ia"); // El botón para jugar contra la IA.
const modoJuego = document.getElementById("modo-juego"); // El área donde se muestra el tipo de juego seleccionado.
const botonesOpciones = document.getElementById("opciones"); // El área donde se muestran los botones para elegir el modo de juego.

// Variables de estado del juego
let casillas = Array(9).fill(null); // Representa el tablero con 9 casillas vacías (inicialmente).
let esTurnoX = true; // Indica si es el turno de "X" (jugador 1) o "O" (jugador 2 o IA).
let juegoActivo = false; // Controla si el juego está en curso o no.
let tipoJuego = null; // Almacena el tipo de juego elegido: "jugador" o "ia".

// Combinaciones ganadoras posibles en el juego
const combinacionesGanadoras = [
    [0, 1, 2], // Fila 1
    [3, 4, 5], // Fila 2
    [6, 7, 8], // Fila 3
    [0, 3, 6], // Columna 1
    [1, 4, 7], // Columna 2
    [2, 5, 8], // Columna 3
    [0, 4, 8], // Diagonal de izquierda a derecha
    [2, 4, 6]  // Diagonal de derecha a izquierda
];

/**
 * Muestra el tablero y establece el tipo de juego seleccionado.
 * Cuando el usuario elige entre "Jugador vs Jugador" o "Jugador vs IA",
 * este método oculta los botones de selección y muestra el tablero para comenzar a jugar.
 * @param {string} modo - El modo de juego elegido: "jugador" o "ia".
 */
btnJugadorVsJugador.addEventListener("click", () => iniciarJuego("jugador"));
btnJugadorVsIA.addEventListener("click", () => iniciarJuego("ia"));

function iniciarJuego(modo) {
    tipoJuego = modo; // Guarda el tipo de juego elegido ("jugador" o "ia").
    modoJuego.textContent = modo === "jugador" ? "JUGADOR VS JUGADOR" : "JUGADOR VS IA"; // Muestra el tipo de juego.
    botonesOpciones.style.display = "none"; // Oculta los botones de selección de modo de juego.
    tablero.style.display = "flex"; // Muestra el tablero de juego.
    btnReiniciar.style.display = "inline-block"; // Muestra el botón de reinicio solo después de elegir un modo de juego.
    juegoActivo = true; // El juego comienza, por lo que está activo.

    // Asegura que "X" (Jugador 1) siempre comienza
    esTurnoX = true; // El primer turno siempre es para el jugador 1 (X).

    // Si el juego es contra la IA y es la IA la que debe comenzar
    if (tipoJuego === "ia" && Math.random() < 0.5) {
        esTurnoX = false; // La IA empieza, por lo que "X" le corresponde a la IA.
        turno.textContent = "Turno: IA"; // Muestra que es el turno de la IA.
        setTimeout(() => turnoIA(), 500); // Hace que la IA haga su jugada después de 500ms.
    }

    actualizarTurno(); // Actualiza el texto de "quién tiene el turno".
}

/**
 * Actualiza el texto que indica de quién es el turno en la interfaz.
 * Muestra "Turno de: Jugador 1", "Turno de: Jugador 2" o "Turno de: IA".
 */
function actualizarTurno() {
    turno.textContent = `Turno de: ${esTurnoX ? "Jugador 1" : tipoJuego === "jugador" ? "Jugador 2" : "IA"}`; 
    // Actualiza el mensaje del turno dependiendo de quién esté jugando.
}

/**
 * Maneja los clics en el tablero. Cuando el usuario hace clic en una casilla,
 * se marca con "X" o "O" dependiendo de quién esté jugando.
 * Además, verifica si hay un ganador o si el juego ha terminado en empate.
 * @param {Event} e - El evento que se dispara al hacer clic en el tablero.
 */
tablero.addEventListener("click", (e) => {
    if (!juegoActivo || !e.target.matches("button")) return; // Si el juego no está activo o el clic no es sobre un botón, no hace nada.

    const index = Array.from(tablero.children).indexOf(e.target); // Obtiene el índice de la casilla en la que se hizo clic.
    if (casillas[index]) return; // Si la casilla ya está ocupada, no hace nada.

    casillas[index] = esTurnoX ? "X" : "O"; // Marca la casilla con "X" o "O" dependiendo de quién esté jugando.
    e.target.textContent = casillas[index]; // Actualiza el texto de la casilla con "X" o "O".

    // Verifica si hay un ganador después de cada jugada.
    if (verificarGanador()) {
        finalizarJuego(esTurnoX ? "Jugador 1" : tipoJuego === "jugador" ? "Jugador 2" : "IA");
    } else if (casillas.every((casilla) => casilla)) { // Si todas las casillas están ocupadas y no hay ganador, es empate.
        finalizarJuego(null);
    } else {
        esTurnoX = !esTurnoX; // Cambia el turno a la otra persona.
        actualizarTurno(); // Actualiza el mensaje de turno.

        // Si el modo es "IA" y es el turno de la IA, hace que la IA juegue automáticamente después de medio segundo.
        if (tipoJuego === "ia" && !esTurnoX) {
            turno.textContent = "Turno: IA"; // Muestra que es el turno de la IA.
            setTimeout(() => turnoIA(), 500); // Hace que la IA juegue después de medio segundo.
        }
    }
});

/**
 * La IA juega su turno. Primero busca una jugada ganadora, luego intenta bloquear una jugada ganadora del jugador,
 * y si no hay ninguna jugada crítica, hace una jugada aleatoria.
 */
function turnoIA() {
    // Busca una jugada ganadora para la IA (O)
    const indiceGanador = buscarJugadaGanadora("O");
    if (indiceGanador !== null) {
        realizarJugadaIA(indiceGanador); // Si la IA puede ganar, realiza la jugada.
        return;
    }

    // Bloquea una jugada ganadora del jugador (X)
    const indiceBloqueo = buscarJugadaGanadora("X");
    if (indiceBloqueo !== null) {
        realizarJugadaIA(indiceBloqueo); // Si el jugador puede ganar, la IA bloquea su jugada.
        return;
    }

    // Si no hay jugadas críticas, hace una jugada aleatoria
    const indicesLibres = casillas.map((c, i) => (c ? null : i)).filter((i) => i !== null); // Encuentra las casillas vacías.
    const eleccionIA = indicesLibres[Math.floor(Math.random() * indicesLibres.length)]; // Elige aleatoriamente una casilla libre.
    realizarJugadaIA(eleccionIA); // Realiza la jugada en la casilla seleccionada.
}

/**
 * Busca una jugada ganadora para un símbolo ("X" o "O").
 * @param {string} simbolo - El símbolo que se está buscando ("X" o "O").
 * @returns {number|null} - El índice de la casilla ganadora o null si no hay jugada ganadora.
 */
function buscarJugadaGanadora(simbolo) {
    for (const combinacion of combinacionesGanadoras) { // Recorre todas las combinaciones posibles para ganar.
        const [a, b, c] = combinacion;
        const valores = [casillas[a], casillas[b], casillas[c]]; // Obtiene los valores de las tres casillas de la combinación.

        const cuentaSimbolo = valores.filter((v) => v === simbolo).length; // Cuenta cuántas casillas tienen el símbolo.
        const cuentaVacias = valores.filter((v) => v === null).length; // Cuenta cuántas casillas están vacías.

        if (cuentaSimbolo === 2 && cuentaVacias === 1) { // Si hay dos símbolos y una casilla vacía, es una jugada ganadora o bloqueo.
            return combinacion[valores.indexOf(null)]; // Retorna la posición vacía.
        }
    }
    return null; // Si no hay jugadas ganadoras, retorna null.
}

/**
 * Realiza la jugada de la IA en la posición indicada.
 * @param {number} indice - El índice de la casilla donde la IA va a jugar.
 */
function realizarJugadaIA(indice) {
    casillas[indice] = "O"; // Marca la casilla con "O" (la IA).
    tablero.children[indice].textContent = "O"; // Actualiza la casilla en la interfaz con "O".

    // Verifica si la IA ganó después de hacer la jugada.
    if (verificarGanador()) {
        finalizarJuego("IA"); // Si la IA ganó, finaliza el juego.
    } else if (casillas.every((casilla) => casilla)) { // Si todas las casillas están ocupadas y no hay ganador, es empate.
        finalizarJuego(null);
    } else {
        esTurnoX = true; // Cambia el turno al jugador 1 (X).
        actualizarTurno(); // Actualiza el mensaje de turno.
    }
}

/**
 * Verifica si hay un ganador en el juego.
 * Recorre todas las combinaciones ganadoras posibles y verifica si alguna está llena con el mismo símbolo.
 * @returns {boolean} - Retorna true si hay un ganador, false si no lo hay.
 */
function verificarGanador() {
    return combinacionesGanadoras.some((combinacion) => {
        const [a, b, c] = combinacion;
        if (casillas[a] && casillas[a] === casillas[b] && casillas[a] === casillas[c]) {
            combinacion.forEach((i) => tablero.children[i].classList.add("winning")); // Resalta las casillas ganadoras.
            return true; // Si hay un ganador, retorna true.
        }
        return false; // Si no hay ganador, retorna false.
    });
}

/**
 * Finaliza el juego mostrando el resultado final (ganador o empate).
 * @param {string|null} ganador - El ganador ("Jugador 1", "Jugador 2", "IA") o null si es empate.
 */
function finalizarJuego(ganador) {
    juegoActivo = false; // El juego termina.
    turno.textContent = ""; // Limpia el mensaje del turno.

    if (ganador) {
        if (ganador === "IA") {
            resultado.textContent = "Derrota: más suerte la próxima!"; // Si la IA gana, muestra un mensaje de derrota.
            resultado.classList.add("derrota"); // Aplica el estilo de derrota.
        } else {
            resultado.textContent = `GANADOR: ${ganador.toUpperCase()}`; // Muestra el ganador (Jugador 1 o Jugador 2).
            resultado.classList.remove("derrota"); // Asegura que no haya estilo de derrota.
        }
    } else {
        resultado.textContent = "¡EMPATE!"; // Si no hay ganador, muestra un mensaje de empate.
        resultado.classList.add("derrota"); // Para mostrar el empate de color rojo.
    }
    resultado.classList.add("final-message"); // Agrega estilo de mensaje final.
}

/**
 * Reinicia el juego, limpiando el tablero y restableciendo las variables de estado.
 */
btnReiniciar.addEventListener("click", () => {
    casillas.fill(null); // Limpia todas las casillas del tablero.
    Array.from(tablero.children).forEach((button) => {
        button.textContent = ""; // Limpia el texto de cada casilla.
        button.classList.remove("winning"); // Elimina el estilo de casillas ganadoras.
    });
    resultado.textContent = ""; // Limpia el resultado.
    resultado.classList.remove("derrota", "final-message"); // Elimina los estilos de derrota o mensaje final.
    turno.textContent = ""; // Limpia el mensaje de turno.
    esTurnoX = true; // Restablece el turno a Jugador 1 (X).
    juegoActivo = false; // Detiene el juego.
    tipoJuego = null; // Restablece el tipo de juego.
    tablero.style.display = "none"; // Oculta el tablero.
    botonesOpciones.style.display = "block"; // Muestra los botones de selección de modo de juego.
    modoJuego.textContent = "Elige un modo de juego"; // Muestra el texto que invita a elegir el modo.
});
