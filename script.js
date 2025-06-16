// Configuración del juego
const GAME_CONFIG = {
    totalPairs: 6, // Actualizado a 6 pares ya que tenemos 6 imágenes
    flipDuration: 1000, // duración en ms para voltear cartas no coincidentes
    maxAttempts: 10, // Cambiado a 10 movimientos
    cardImages: [
        {
            id: "vela",
            src: "assets/images/vela.png",
            alt: "Vela Bohemia",
        },
        {
            id: "shoes",
            src: "assets/images/shoes.png",
            alt: "Zapatos Bohemios",
        },
        {
            id: "perfume",
            src: "assets/images/perfume.png",
            alt: "Perfume",
        },
        {
            id: "mueble",
            src: "assets/images/mueble.png",
            alt: "Mueble Decorativo",
        },
        {
            id: "almohadones",
            src: "assets/images/almohadones.png",
            alt: "Almohadones Decorativos",
        },
        {
            id: "collar",
            src: "assets/images/collar.png",
            alt: "Collar Bohemio",
        },
    ],
};

// Estado del juego
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    attempts: GAME_CONFIG.maxAttempts,
    timer: null,
    startTime: null,
    seconds: 0,
    isProcessing: false,
};

// Elementos DOM
const elements = {
    welcomeScreen: document.getElementById("welcome-screen"),
    gameScreen: document.getElementById("game-screen"),
    resultsScreen: document.getElementById("results-screen"),
    cardsGrid: document.querySelector(".cards-grid"),
    attemptsCounter: document.getElementById("attempts"),
    timerDisplay: document.getElementById("timer"),
    pairsDisplay: document.getElementById("pairs"),
    finalTime: document.getElementById("final-time"),
    finalMoves: document.getElementById("final-moves"),
    startButton: document.getElementById("start-game"),
    playAgainButton: document.getElementById("play-again"),
    backToWelcomeButton: document.getElementById("back-to-welcome"),
};

// Mensajes de desempeño
const PERFORMANCE_MESSAGES = {
    win: {
        title: "¡Eres una mente brillante! 🎉",
        message: "Ganaste un 15% OFF en Anthropologie. Usa el código: ANTHRO15",
        button: "Jugar otra vez",
    },
    lose: {
        title: "¡La creatividad requiere paciencia! 🌿",
        message: "Pasá por nuestro stand y llévate un 10% de consuelo.",
        button: "Reintentar",
    },
};

// Configuración del confeti
const CONFETTI_CONFIG = {
    colors: ["#FFD1BA", "#E6E6FA", "#C2C5AA"],
    particleCount: 100,
    particleSize: { min: 3, max: 6 },
    speed: { min: 1, max: 3 },
    lifetime: { min: 3000, max: 5000 },
    spread: 360,
    gravity: 0.1,
    wind: 0.05,
};

// Clase para el confeti
class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.particles = [];
        this.animationFrame = null;
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle() {
        const x = Math.random() * this.canvas.width;
        const y = -10;
        const size =
            Math.random() * (CONFETTI_CONFIG.particleSize.max - CONFETTI_CONFIG.particleSize.min) + CONFETTI_CONFIG.particleSize.min;
        const color = CONFETTI_CONFIG.colors[Math.floor(Math.random() * CONFETTI_CONFIG.colors.length)];
        const speed = Math.random() * (CONFETTI_CONFIG.speed.max - CONFETTI_CONFIG.speed.min) + CONFETTI_CONFIG.speed.min;
        const angle = (Math.random() * CONFETTI_CONFIG.spread - CONFETTI_CONFIG.spread / 2) * (Math.PI / 180);
        const lifetime = Math.random() * (CONFETTI_CONFIG.lifetime.max - CONFETTI_CONFIG.lifetime.min) + CONFETTI_CONFIG.lifetime.min;

        return {
            x,
            y,
            size,
            color,
            speedX: Math.cos(angle) * speed,
            speedY: speed,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            createdAt: Date.now(),
            lifetime,
        };
    }

    start() {
        this.particles = [];
        for (let i = 0; i < CONFETTI_CONFIG.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        this.animate();
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const now = Date.now();

        // Actualizar y dibujar partículas
        this.particles = this.particles.filter((particle) => {
            const age = now - particle.createdAt;
            if (age > particle.lifetime) return false;

            // Actualizar posición
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += CONFETTI_CONFIG.gravity;
            particle.speedX += (Math.random() - 0.5) * CONFETTI_CONFIG.wind;
            particle.rotation += particle.rotationSpeed;

            // Dibujar partícula
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = 1 - age / particle.lifetime;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            return true;
        });

        if (this.particles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }
}

// Inicializar confeti
const confetti = new Confetti(document.getElementById("confetti-canvas"));

// Función para obtener mensaje según el desempeño
function getPerformanceMessage(moves, time) {
    const timeInMinutes = time / 60;
    const movesPerMinute = moves / timeInMinutes;

    if (moves <= 10 && timeInMinutes <= 2) {
        return PERFORMANCE_MESSAGES.excellent[Math.floor(Math.random() * PERFORMANCE_MESSAGES.excellent.length)];
    } else if (moves <= 15 && timeInMinutes <= 3) {
        return PERFORMANCE_MESSAGES.good[Math.floor(Math.random() * PERFORMANCE_MESSAGES.good.length)];
    } else {
        return PERFORMANCE_MESSAGES.average[Math.floor(Math.random() * PERFORMANCE_MESSAGES.average.length)];
    }
}

// Inicialización del juego
function initGame() {
    console.log("Iniciando juego...");

    // Crear array de cartas (8 pares)
    const cardValues = [...GAME_CONFIG.cardImages, ...GAME_CONFIG.cardImages];

    // Mezclar las cartas
    const shuffledCards = cardValues.sort(() => Math.random() - 0.5);
    console.log("Cartas mezcladas:", shuffledCards);

    // Limpiar el grid
    elements.cardsGrid.innerHTML = "";

    // Crear elementos de cartas
    shuffledCards.forEach((imageData, index) => {
        const card = createCardElement(imageData, index);
        elements.cardsGrid.appendChild(card);
    });

    // Reiniciar estado del juego
    gameState = {
        cards: Array.from(document.querySelectorAll(".card")),
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        attempts: GAME_CONFIG.maxAttempts,
        timer: null,
        startTime: null,
        seconds: 0,
        isProcessing: false,
    };

    // Actualizar contadores
    updateMovesCounter();
    updateAttemptsDisplay();
    updateTimerDisplay();
}

// Crear elemento de carta
function createCardElement(imageData, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.cardValue = imageData.id;
    card.dataset.cardIndex = index;

    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">
                <div class="card-image">
                    <img src="${imageData.src}" alt="${imageData.alt}" loading="lazy">
                </div>
            </div>
            <div class="card-back"></div>
        </div>
    `;

    // Agregar evento de clic con debounce para evitar clics múltiples
    let clickTimeout;
    card.addEventListener("click", () => {
        if (clickTimeout) return;
        clickTimeout = setTimeout(() => {
            clickTimeout = null;
            handleCardClick(card);
        }, 100);
    });

    return card;
}

// Manejar clic en carta
function handleCardClick(card) {
    // Verificar si se puede voltear la carta
    if (card.classList.contains("flipped") || card.classList.contains("matched") || gameState.flippedCards.length >= 2) {
        return;
    }

    // Iniciar temporizador en el primer clic
    if (!gameState.startTime) {
        gameState.startTime = Date.now();
        gameState.timer = setInterval(updateTimerDisplay, 1000);
    }

    // Voltear la carta
    card.classList.add("flipped");
    gameState.flippedCards.push(card);

    // Si tenemos dos cartas volteadas, verificar coincidencia
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateMovesCounter(); // Actualiza el contador de pares

        const [card1, card2] = gameState.flippedCards;
        const match = card1.dataset.cardValue === card2.dataset.cardValue;

        setTimeout(() => {
            if (match) {
                handleMatch(card1, card2);
            } else {
                handleMismatch(card1, card2);
            }
        }, 500);
    }
}

// Manejar coincidencia de cartas
function handleMatch(card1, card2) {
    // Marcar las cartas como emparejadas
    card1.classList.add("matched");
    card2.classList.add("matched");

    // Actualizar estado
    gameState.matchedPairs++;
    gameState.flippedCards = [];

    // Verificar si el juego está completo
    if (gameState.matchedPairs === GAME_CONFIG.totalPairs) {
        setTimeout(() => {
            endGame(true);
        }, 500);
    }
}

// Manejar no coincidencia de cartas
function handleMismatch(card1, card2) {
    gameState.attempts--;
    updateAttemptsDisplay();

    // Verificar si se acabaron los intentos
    if (gameState.attempts <= 0) {
        setTimeout(() => {
            endGame(false);
        }, GAME_CONFIG.flipDuration);
        return;
    }

    // Voltear las cartas después de un momento
    setTimeout(() => {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        gameState.flippedCards = [];
    }, GAME_CONFIG.flipDuration);
}

// Actualizar contadores
function updateMovesCounter() {
    if (elements.pairsDisplay) {
        elements.pairsDisplay.textContent = `${gameState.matchedPairs}/${GAME_CONFIG.totalPairs}`;
    }
}

function updateAttemptsDisplay() {
    if (elements.attemptsCounter) {
        elements.attemptsCounter.textContent = gameState.attempts;
    }
}

function updateTimerDisplay() {
    if (!gameState.startTime || !elements.timerDisplay) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    elements.timerDisplay.textContent = timeString;
}

// Función para transición entre pantallas
function transitionToScreen(fromScreen, toScreen) {
    fromScreen.classList.add("fade-out");
    setTimeout(() => {
        fromScreen.classList.remove("active", "fade-out");
        toScreen.classList.add("active");
    }, 500);
}

// Actualizar la función endGame
function endGame(isWin = true) {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    // Actualizar estadísticas
    elements.finalTime.textContent = elements.timerDisplay.textContent;
    elements.finalMoves.textContent = gameState.moves;

    // Obtener mensajes según resultado
    const messages = isWin ? PERFORMANCE_MESSAGES.win : PERFORMANCE_MESSAGES.lose;
    document.getElementById("results-title").textContent = messages.title;
    document.getElementById("performance-message").textContent = messages.message;
    document.getElementById("play-again").textContent = messages.button;

    // Mostrar código de descuento solo si ganó
    const discountCode = document.querySelector(".discount-code");
    if (discountCode) {
        if (isWin) {
            discountCode.style.display = "block";
            discountCode.innerHTML = `
                <p>¡Felicitaciones! Has ganado un descuento exclusivo:</p>
                <p class="code">ANTHRO15</p>
                <small>Válido para tu primera compra en Anthropologie</small>
            `;
            // Iniciar confeti para celebrar
            confetti.start();
            setTimeout(() => confetti.stop(), 5000);
        } else {
            discountCode.style.display = "none";
        }
    }

    // Transición a pantalla de resultados
    transitionToScreen(elements.gameScreen, elements.resultsScreen);
}

// Actualizar event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM cargado, inicializando event listeners...");

    elements.startButton.addEventListener("click", () => {
        transitionToScreen(elements.welcomeScreen, elements.gameScreen);
        initGame();
    });

    elements.playAgainButton.addEventListener("click", () => {
        transitionToScreen(elements.resultsScreen, elements.gameScreen);
        initGame();
    });

    elements.backToWelcomeButton.addEventListener("click", () => {
        transitionToScreen(elements.resultsScreen, elements.welcomeScreen);
    });
});
