const canvas = document.getElementById("myCanvas");
const C = canvas.getContext("2d");
const canvas_rectangle = canvas.getBoundingClientRect();
const cellSize = 5; // each cell in the grid is a square of this size, in pixels
const NUM_CELLS_HORIZONTAL = canvas.width / cellSize;
const NUM_CELLS_VERTICAL = canvas.height / cellSize;
const x0 = (canvas.width - NUM_CELLS_HORIZONTAL * cellSize) / 2;
const y0 = (canvas.height - NUM_CELLS_VERTICAL * cellSize) / 2;
const CELL_EMPTY = 0, CELL_OCCUPIED = 1;

let timeDelay = 100; // milliseconds
let timer = setInterval(function () { advance(); }, timeDelay);
let increaseSpeedTimer = setInterval(function () { increaseSpeed(); }, 200);

let grid, grid1, grid2;
let lightCycle1_x, lightCycle1_y, lightCycle1_vx, lightCycle1_vy, lightCycle1_alive;
let lightCycle2_x, lightCycle2_y, lightCycle2_vx, lightCycle2_vy, lightCycle2_alive

let lightCycle1_score = 0, lightCycle2_score = 0;
document.getElementById("score1").innerText = lightCycle1_score;
document.getElementById("score2").innerText = lightCycle2_score;

let gameEnded = false;
let winner = null;
const WINNING_SCORE = 7;

// Mouse drag
let tempX, tempY;
let mousePlayer1 = true;

let isSinglePlayer = false;
let aiEnabled = false;

const create2DArray = (numColumns, numRows) => {
    return Array.from({ length: numColumns }, () => Array(numRows).fill(0));
};

const clearGame = () => {
    lightCycle1_x = NUM_CELLS_HORIZONTAL / 2;
    lightCycle1_y = NUM_CELLS_VERTICAL - 2;
    lightCycle1_vx = 0;
    lightCycle1_vy = -1;
    lightCycle2_x = NUM_CELLS_HORIZONTAL / 2;
    lightCycle2_y = 1;
    lightCycle2_vx = 0;
    lightCycle2_vy = 1;

    grid = create2DArray(NUM_CELLS_HORIZONTAL, NUM_CELLS_VERTICAL);
    grid1 = create2DArray(NUM_CELLS_HORIZONTAL, NUM_CELLS_VERTICAL);
    grid2 = create2DArray(NUM_CELLS_HORIZONTAL, NUM_CELLS_VERTICAL);

    grid[lightCycle1_x][lightCycle1_y] = CELL_OCCUPIED;
    grid[lightCycle2_x][lightCycle2_y] = CELL_OCCUPIED;
    grid1[lightCycle1_x][lightCycle1_y] = CELL_OCCUPIED;
    grid2[lightCycle2_x][lightCycle2_y] = CELL_OCCUPIED;

    lightCycle1_alive = true;
    lightCycle2_alive = true;

    timeDelay = 100;
    document.getElementById('goButton').disabled = true;
}

clearGame();

const keyDownHandler = (e) => {
    if (gameEnded) return;

    switch (e.keyCode) {
        // 1st player
        case 38: // up arrow
            e.preventDefault();
            lightCycle1_vx = 0;
            lightCycle1_vy = -1;
            break;
        case 40: // down arrow
            e.preventDefault();
            lightCycle1_vx = 0;
            lightCycle1_vy = 1;
            break;
        case 37: // left arrow
            lightCycle1_vy = 0;
            lightCycle1_vx = -1;
            break;
        case 39: // right arrow
            lightCycle1_vy = 0;
            lightCycle1_vx = 1;
            break;

        // 2nd player
        case 87: // up (w)
            lightCycle2_vx = 0;
            lightCycle2_vy = -1;
            break;
        case 83: // down (s)
            lightCycle2_vx = 0;
            lightCycle2_vy = 1;
            break;
        case 65: // left (a)
            lightCycle2_vy = 0;
            lightCycle2_vx = -1;
            break;
        case 68: // right (d)
            lightCycle2_vy = 0;
            lightCycle2_vx = 1;
            break;
    }
}

const mouseDownHandler = (e) => {
    if (gameEnded) return;

    // check if the mouse is on the canvas
    if (e.pageX <= canvas_rectangle.right
        && e.pageY <= canvas_rectangle.bottom
        && e.pageX >= canvas_rectangle.left
        && e.pageY >= canvas_rectangle.top
    ) {
        tempX = e.pageX
        tempY = e.pageY
    }
}

const mouseUpHandler = (e) => {
    if (gameEnded) return;

    // check if the mouse is on the canvas
    if (e.pageX <= canvas_rectangle.right &&
        e.pageY <= canvas_rectangle.bottom &&
        e.pageX >= canvas_rectangle.left &&
        e.pageY >= canvas_rectangle.top
    ) {
        delta_x = e.pageX - tempX
        delta_y = e.pageY - tempY

        if (Math.abs(delta_x) > Math.abs(delta_y)) {
            if (delta_x > 0) { // geste vers la droite
                mousePlayer1 ? (lightCycle1_vx = 1, lightCycle1_vy = 0) : (lightCycle2_vx = 1, lightCycle2_vy = 0);
            }
            else { // geste vers la gauche
                mousePlayer1 ? (lightCycle1_vx = -1, lightCycle1_vy = 0) : (lightCycle2_vx = -1, lightCycle2_vy = 0);
            }
        }
        else if (delta_y > 0) { // geste vers le bas
            mousePlayer1 ? (lightCycle1_vx = 0, lightCycle1_vy = 1) : (lightCycle2_vx = 0, lightCycle2_vy = 1);
        }
        else { // geste vers le haut 
            mousePlayer1 ? (lightCycle1_vx = 0, lightCycle1_vy = -1) : (lightCycle2_vx = 0, lightCycle2_vy = -1);
        }
    }
}

document.onkeydown = keyDownHandler;
document.onmousedown = mouseDownHandler;
document.onmouseup = mouseUpHandler;

const redraw = () => {
    C.fillStyle = "#000000";
    C.fillRect(0, 0, canvas.width, canvas.height);

    C.fillStyle = document.getElementById("moto1color").value;
    for (let i = 0; i < NUM_CELLS_HORIZONTAL; ++i) {
        for (let j = 0; j < NUM_CELLS_VERTICAL; ++j) {
            if (grid1[i][j] === CELL_OCCUPIED) C.fillRect(x0 + i * cellSize + 1, y0 + j * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    }

    C.fillStyle = document.getElementById("moto2color").value;
    for (var i = 0; i < NUM_CELLS_HORIZONTAL; ++i) {
        for (var j = 0; j < NUM_CELLS_VERTICAL; ++j) {
            if (grid2[i][j] === CELL_OCCUPIED) C.fillRect(x0 + i * cellSize + 1, y0 + j * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    }

    C.fillStyle = lightCycle1_alive ? "#ff0000" : "#ffffff";
    C.fillRect(x0 + lightCycle1_x * cellSize, y0 + lightCycle1_y * cellSize, cellSize, cellSize);

    C.fillStyle = lightCycle2_alive ? "#ff0000" : "#ffffff";
    C.fillRect(x0 + lightCycle2_x * cellSize, y0 + lightCycle2_y * cellSize, cellSize, cellSize);
}

const advance = () => {
    if (gameEnded) return;

    if (!lightCycle1_alive || !lightCycle2_alive) {
        clearGame();
        return;
    }

    // AI Decision Making
    if (aiEnabled && lightCycle2_alive) {
        const aiDirection = aiMakeDecision();
        if (aiDirection) {
            lightCycle2_vx = aiDirection.vx;
            lightCycle2_vy = aiDirection.vy;
        }
    }

    if (lightCycle1_alive && lightCycle2_alive) {
        var new1_x = lightCycle1_x + lightCycle1_vx;
        var new1_y = lightCycle1_y + lightCycle1_vy;
        var new2_x = lightCycle2_x + lightCycle2_vx;
        var new2_y = lightCycle2_y + lightCycle2_vy;
        // Check for collision with head of other motorcycle
        if ((new1_x < 0 || new1_x >= NUM_CELLS_HORIZONTAL
            || new1_y < 0 || new1_y >= NUM_CELLS_VERTICAL
            || grid[new1_x][new1_y] === CELL_OCCUPIED)
            && (new2_x < 0 || new2_x >= NUM_CELLS_HORIZONTAL
                || new2_y < 0 || new2_y >= NUM_CELLS_VERTICAL
                || grid[new2_x][new2_y] === CELL_OCCUPIED)) {
            lightCycle2_alive = false;
            lightCycle1_alive = false;
            document.getElementById('collisionSound').play();
            redraw();
            return;
        }
    }
    if (lightCycle1_alive) {
        var new1_x = lightCycle1_x + lightCycle1_vx;
        var new1_y = lightCycle1_y + lightCycle1_vy;

        // Check for collision with grid boundaries and with trail
        if (new1_x < 0 || new1_x >= NUM_CELLS_HORIZONTAL
            || new1_y < 0 || new1_y >= NUM_CELLS_VERTICAL
            || grid[new1_x][new1_y] === CELL_OCCUPIED) {
            lightCycle1_alive = false;
            document.getElementById('collisionSound').play();
            lightCycle2_score++; // player 2 wins this round
            document.getElementById("score2").innerText = lightCycle2_score;

            // Si 7 atteint, partie finie
            if (lightCycle2_score >= WINNING_SCORE) {
                declareWinner(2);
            }
        }
        else {
            grid[new1_x][new1_y] = CELL_OCCUPIED;
            grid1[lightCycle1_x][lightCycle1_y] = CELL_OCCUPIED;
            lightCycle1_x = new1_x;
            lightCycle1_y = new1_y;
        }
        redraw();
    }
    if (lightCycle2_alive) {
        var new2_x = lightCycle2_x + lightCycle2_vx;
        var new2_y = lightCycle2_y + lightCycle2_vy;
        if (
            new2_x < 0 || new2_x >= NUM_CELLS_HORIZONTAL
            || new2_y < 0 || new2_y >= NUM_CELLS_VERTICAL
            || grid[new2_x][new2_y] === CELL_OCCUPIED
        ) {
            lightCycle2_alive = false;
            document.getElementById('collisionSound').play();
            lightCycle1_score++; // player 1 wins this round
            document.getElementById("score1").innerText = lightCycle1_score;

            // Si 7 atteint, partie finie
            if (lightCycle1_score >= WINNING_SCORE) {
                declareWinner(1);
            }
        } else {
            grid[new2_x][new2_y] = CELL_OCCUPIED;
            grid2[lightCycle2_x][lightCycle2_y] = CELL_OCCUPIED;
            lightCycle2_x = new2_x;
            lightCycle2_y = new2_y;
        }
        redraw();
    }
}

var increaseSpeed = function () {
    clearInterval(timer);
    timer = setInterval(advance, timeDelay);
    timeDelay /= 1.03; // 3% decrease every 200 ms
}

function pause() {
    clearInterval(timer);
    clearInterval(increaseSpeedTimer);
    document.getElementById('pauseButton').disabled = true;
    document.getElementById('goButton').disabled = false;
}

function restart() {
    lightCycle1_alive = false;
    lightCycle2_alive = false;
    lightCycle1_score = 0
    lightCycle2_score = 0;
    document.getElementById("score1").innerText = lightCycle1_score;
    document.getElementById("score2").innerText = lightCycle2_score;
    clearInterval(timer);
    clearInterval(increaseSpeedTimer);
    go();
}

function go() {
    timer = setInterval(advance, 100);
    increaseSpeedTimer = setInterval(increaseSpeed, 150);
    document.getElementById('pauseButton').disabled = false;
    document.getElementById('goButton').disabled = true;
}

function changeMousePlayer() {
    const toggle = document.getElementById('mousePlayerToggle');
    const player1Label = document.getElementById('player1Label');
    const player2Label = document.getElementById('player2Label');

    mousePlayer1 = !toggle.checked; // Player 1 par défaut

    if (mousePlayer1) {
        player1Label.classList.add('active');
        player2Label.classList.remove('active');
        player1Label.style.color = 'var(--primary-cyan)';
        player2Label.style.color = 'var(--primary-cyan)';
    } else {
        player1Label.classList.remove('active');
        player2Label.classList.add('active');
        player1Label.style.color = 'var(--primary-cyan)';
        player2Label.style.color = 'var(--primary-orange)';
    }
}

function muteMusic() {
    document.getElementById("backgroundMusic").play();
    const isMuted = !document.getElementById('backgroundMusic').muted;
    document.getElementById('backgroundMusic').muted = isMuted;
    document.getElementById('collisionSound').muted = isMuted;
}

function initializeToggleSwitch() {
    const toggle = document.getElementById('mousePlayerToggle');
    const player1Label = document.getElementById('player1Label');
    const player2Label = document.getElementById('player2Label');

    toggle.checked = false;
    player1Label.classList.add('active');
    player2Label.classList.remove('active');
    player1Label.style.color = 'var(--primary-cyan)';
    player2Label.style.color = 'var(--primary-cyan)';
}

// Navigation entre pages
function showPage(pageId) {
    // Cacher toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Afficher la page demandée
    document.getElementById(pageId).classList.add('active');
}

function startGame(mode) {
    // Configurer le mode de jeu
    if (mode === 'singleplayer') {
        isSinglePlayer = true;
        aiEnabled = true;

        // Mettre à jour l'interface
        document.getElementById('currentMode').textContent = 'AI OPPONENT';
        document.getElementById('currentMode').classList.add('ai-mode');
        document.querySelector('.player-panel.right .player-title').textContent = 'AI OPPONENT';

        // Masquer le contrôle souris en mode IA
        document.querySelector('.mouse-toggle-container').style.display = 'none';
        document.getElementById('mouseControlText').style.display = 'none';
    } else {
        isSinglePlayer = false;
        aiEnabled = false;

        // Mettre à jour l'interface
        document.getElementById('currentMode').textContent = '2 PLAYERS';
        document.getElementById('currentMode').classList.remove('ai-mode');
        document.querySelector('.player-panel.right .player-title').textContent = 'PLAYER 2';

        // Afficher le toggle de contrôle souris au cas où mode IA a été choisi avant
        document.querySelector('.mouse-toggle-container').style.display = 'flex';
    }

    showPage('gamePage');
    restart();
}

function declareWinner(winnerNumber) {
    gameEnded = true;
    winner = winnerNumber;
    pause();

    // Changer les couleurs des panneaux
    const leftPanel = document.querySelector('.player-panel.left');
    const rightPanel = document.querySelector('.player-panel.right');

    if (winnerNumber === 1) {
        // Player 1 wins = vert à gauche et rouge à droite
        leftPanel.style.borderColor = '#00ff00';
        leftPanel.style.boxShadow = '0 0 30px #00ff00';
        leftPanel.style.color = '#00ff00';

        rightPanel.style.borderColor = '#ff0000';
        rightPanel.style.boxShadow = '0 0 30px #ff0000';
        rightPanel.style.color = '#ff0000';

        showVictoryMessage('PLAYER 1 WINS!', '#00ff00');
    } else {
        // Player 2 wins = rouge à gauche et vert à droite
        rightPanel.style.borderColor = '#00ff00';
        rightPanel.style.boxShadow = '0 0 30px #00ff00';
        rightPanel.style.color = '#00ff00';

        leftPanel.style.borderColor = '#ff0000';
        leftPanel.style.boxShadow = '0 0 30px #ff0000';
        leftPanel.style.color = '#ff0000';

        const winnerText = aiEnabled ? 'AI WINS!' : 'PLAYER 2 WINS!';
        showVictoryMessage(winnerText, '#00ff00');
    }
    document.onkeydown = null;
    document.onmousedown = null;
    document.onmouseup = null;
}

function showVictoryMessage(message, color) {
    let victoryDiv = document.getElementById('victoryMessage');
    if (!victoryDiv) {
        victoryDiv = document.createElement('div');
        victoryDiv.id = 'victoryMessage';
        victoryDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 3px solid ${color};
            border-radius: 20px;
            padding: 40px 60px;
            text-align: center;
            font-family: 'Orbitron', monospace;
            font-size: 2.5rem;
            font-weight: 900;
            color: ${color};
            text-shadow: 0 0 20px ${color};
            box-shadow: 0 0 50px ${color};
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: victoryPulse 2s ease-in-out infinite alternate;
        `;

        const messageText = document.createElement('div');
        messageText.textContent = message;
        messageText.style.marginBottom = '20px';
        victoryDiv.appendChild(messageText);

        // Bouton pour recommencer
        const restartButton = document.createElement('button');
        restartButton.textContent = 'NEW GAME';
        restartButton.style.cssText = `
            background: linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.3));
            border: 2px solid var(--primary-cyan);
            color: var(--primary-cyan);
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        restartButton.onclick = newGame;
        restartButton.onmouseover = () => {
            restartButton.style.boxShadow = '0 0 20px var(--primary-cyan)';
            restartButton.style.transform = 'translateY(-2px)';
        };
        restartButton.onmouseout = () => {
            restartButton.style.boxShadow = 'none';
            restartButton.style.transform = 'none';
        };

        victoryDiv.appendChild(restartButton);
        document.body.appendChild(victoryDiv);
    } else {
        // Mettre à jour texte existant
        victoryDiv.firstElementChild.textContent = message;
        victoryDiv.style.borderColor = color;
        victoryDiv.style.color = color;
        victoryDiv.style.textShadow = `0 0 20px ${color}`;
        victoryDiv.style.boxShadow = `0 0 50px ${color}`;
    }
}

function newGame() {
    const victoryDiv = document.getElementById('victoryMessage');
    if (victoryDiv) {
        victoryDiv.remove();
    }

    // Réinitialiser l'état du jeu
    gameEnded = false;
    winner = null;
    lightCycle1_score = 0;
    lightCycle2_score = 0;
    document.getElementById("score1").innerText = lightCycle1_score;
    document.getElementById("score2").innerText = lightCycle2_score;

    // Remettre les couleurs originales
    const leftPanel = document.querySelector('.player-panel.left');
    const rightPanel = document.querySelector('.player-panel.right');

    leftPanel.style.borderColor = 'var(--primary-cyan)';
    leftPanel.style.boxShadow = '0 0 20px var(--primary-cyan)';
    leftPanel.style.color = 'var(--primary-cyan)';

    if (aiEnabled) {
        rightPanel.style.borderColor = 'var(--primary-orange)';
        rightPanel.style.boxShadow = '0 0 20px var(--primary-orange)';
        rightPanel.style.color = 'var(--primary-orange)';
    } else {
        rightPanel.style.borderColor = 'var(--primary-orange)';
        rightPanel.style.boxShadow = '0 0 20px var(--primary-orange)';
        rightPanel.style.color = 'var(--primary-orange)';
    }

    document.onkeydown = keyDownHandler;
    document.onmousedown = mouseDownHandler;
    document.onmouseup = mouseUpHandler;

    restart();
}

function backToHome() {
    pause();

    // Supprimer message de victoire
    const victoryDiv = document.getElementById('victoryMessage');
    if (victoryDiv) victoryDiv.remove();

    // Réinitialiser l'état du jeu
    gameEnded = false;
    winner = null;

    showPage('homePage');

    // Réinitialiser les scores
    lightCycle1_score = 0;
    lightCycle2_score = 0;
    document.getElementById("score1").innerText = lightCycle1_score;
    document.getElementById("score2").innerText = lightCycle2_score;

    // Remettre les couleurs des panels
    const leftPanel = document.querySelector('.player-panel.left');
    const rightPanel = document.querySelector('.player-panel.right');

    leftPanel.style.borderColor = 'var(--primary-cyan)';
    leftPanel.style.boxShadow = '0 0 20px var(--primary-cyan)';
    leftPanel.style.color = 'var(--primary-cyan)';

    rightPanel.style.borderColor = 'var(--primary-orange)';
    rightPanel.style.boxShadow = '0 0 20px var(--primary-orange)';
    rightPanel.style.color = 'var(--primary-orange)';

    document.onkeydown = keyDownHandler;
    document.onmousedown = mouseDownHandler;
    document.onmouseup = mouseUpHandler;
}

function isValidPosition(x, y) {
    // Vérifier si la position est dans les limites et si libre
    return x >= 0 && x < NUM_CELLS_HORIZONTAL &&
        y >= 0 && y < NUM_CELLS_VERTICAL &&
        grid[x][y] === CELL_EMPTY;
}

function calculateAreaSize(x, y, direction, maxDepth = 100) {
    // Calculer la taille de l'espace accessible à partir d'une position dans une direction
    const visited = new Set();
    const queue = [{ x: x + direction.vx, y: y + direction.vy }];
    let area = 0;

    while (queue.length > 0 && area < maxDepth) {
        const pos = queue.shift();
        const key = `${pos.x},${pos.y}`;

        if (visited.has(key) || !isValidPosition(pos.x, pos.y)) {
            continue;
        }

        visited.add(key);
        area++;

        // Ajouter les positions qui sont adjacentes
        queue.push(
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 }
        );
    }

    return area;
}

function aiMakeDecision() {
    const currentX = lightCycle2_x;
    const currentY = lightCycle2_y;

    const directions = [
        { vx: 0, vy: -1, name: 'up' },
        { vx: 0, vy: 1, name: 'down' },
        { vx: -1, vy: 0, name: 'left' },
        { vx: 1, vy: 0, name: 'right' }
    ];

    // Évaluer chaque direction
    let bestDirection = null;
    let bestScore = -1;

    for (let direction of directions) {
        const newX = currentX + direction.vx;
        const newY = currentY + direction.vy;

        // Éviter de faire demi-tour
        if (direction.vx === -lightCycle2_vx && direction.vy === -lightCycle2_vy) {
            continue;
        }

        // Vérifier si la direction est valide
        if (!isValidPosition(newX, newY)) {
            continue;
        }

        // Calculer le score pour cette direction
        let score = 0;

        // Distance qu'on peut parcourir en sécurité (priorité principale)
        const safeDistance = calculateSafePath(currentX, currentY, direction);
        score += safeDistance * 10;

        // Taille de l'espace accessible (éviter d'être coincé)
        const areaSize = calculateAreaSize(currentX, currentY, direction);
        score += areaSize * 5;

        // Éviter de se rapprocher trop des murs
        const distanceToWallX = direction.vx > 0 ?
            (NUM_CELLS_HORIZONTAL - 1 - newX) : newX;
        const distanceToWallY = direction.vy > 0 ?
            (NUM_CELLS_VERTICAL - 1 - newY) : newY;
        const minDistanceToWall = Math.min(distanceToWallX, distanceToWallY);
        score += minDistanceToWall * 2;

        // Rester au centre du terrain
        const centerX = NUM_CELLS_HORIZONTAL / 2;
        const centerY = NUM_CELLS_VERTICAL / 2;
        const distanceToCenter = Math.abs(newX - centerX) + Math.abs(newY - centerY);
        score -= distanceToCenter * 0.5;

        // Stratégie: éviter de se rapprocher du joueur si on est en danger
        const distanceToPlayer = Math.abs(newX - lightCycle1_x) + Math.abs(newY - lightCycle1_y);
        if (distanceToPlayer < 10 && safeDistance < 15) {
            score += distanceToPlayer * 3; // Bonus pour s'éloigner du joueur
        }

        // Mettre à jour la meilleure direction
        if (score > bestScore) {
            bestScore = score;
            bestDirection = direction;
        }
    }

    // Si aucune direction optimale n'est trouvée, utiliser une direction aléatoire sûre
    if (!bestDirection) {
        bestDirection = getRandomSafeDirection();
    }

    return bestDirection;
} function getRandomSafeDirection() {
    // Obtenir une direction aléatoire sûre
    const directions = [
        { vx: 0, vy: -1 }, // Haut
        { vx: 0, vy: 1 },  // Bas
        { vx: -1, vy: 0 }, // Gauche
        { vx: 1, vy: 0 }   // Droite
    ];

    // Filtrer les directions sûres
    const safeDirections = directions.filter(dir => {
        const newX = lightCycle2_x + dir.vx;
        const newY = lightCycle2_y + dir.vy;
        return isValidPosition(newX, newY);
    });

    // Éviter de faire demi-tour (direction opposée)
    const filteredDirections = safeDirections.filter(dir => {
        return !(dir.vx === -lightCycle2_vx && dir.vy === -lightCycle2_vy);
    });

    // Choisir parmi les directions filtrées, ou les directions sûres si aucune
    const finalDirections = filteredDirections.length > 0 ? filteredDirections : safeDirections;

    if (finalDirections.length === 0) {
        return null; // Aucune direction sûre disponible
    }

    // Retourner une direction aléatoire
    const randomIndex = Math.floor(Math.random() * finalDirections.length);
    return finalDirections[randomIndex];
}

function analyzeSurroundings(x, y) {
    // Analyser les cellules autour de la position (x, y)
    const directions = {
        up: { x: x, y: y - 1, safe: false },
        down: { x: x, y: y + 1, safe: false },
        left: { x: x - 1, y: y, safe: false },
        right: { x: x + 1, y: y, safe: false }
    };

    for (let dir in directions) {
        const pos = directions[dir];
        directions[dir].safe = isValidPosition(pos.x, pos.y);
    }

    return directions;
}

function calculateSafePath(x, y, direction) {
    // Calculer combien de cases l'IA peut avancer en sécurité dans cette direction
    let steps = 0;
    let currentX = x + direction.vx;
    let currentY = y + direction.vy;

    // Continuer tant que la position est valide
    while (isValidPosition(currentX, currentY)) {
        steps++;
        currentX += direction.vx;
        currentY += direction.vy;

        // éviter calculs trop longs
        if (steps > 50) break;
    }

    return steps;
}

document.addEventListener('DOMContentLoaded', initializeToggleSwitch);