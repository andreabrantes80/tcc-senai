// SCRIPT JOGO MARIO

const mario = document.querySelector(".mario");
const pipe = document.querySelector(".pipe");
const currentScoreElement = document.getElementById("current-score");
const highScoreElement = document.getElementById("high-score");
const startButton = document.getElementById("start-button"); // Seleciona o botão de Start
const gameOverModal = document.getElementById("game-over-modal"); // Seleciona a modal de Game Over
const finalScoreElement = document.getElementById("final-score"); // Pontuação final na modal
const finalHighScoreElement = document.getElementById("final-high-score"); // Recorde na modal
let isJumping = false; // Variável para verificar se o Mario está pulando
let isGameOver = false;
let gameLoop;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; // Recupera o recorde do localStorage
let gameStarted = false; // Variável para verificar se o jogo já foi iniciado

// Atualiza a exibição do recorde
highScoreElement.textContent = highScore;

// Função de pulo
const jump = () => {
  if (!isJumping && !isGameOver && gameStarted) {
    isJumping = true; // Define que o Mario está no ar
    mario.classList.add("jump");

    // Remove a classe 'jump' após 500ms (duração do pulo)
    setTimeout(() => {
      mario.classList.remove("jump");
      isJumping = false; // Permite que Mario pule novamente
    }, 500);
  }
};

// Função para iniciar o loop do jogo
const startGameLoop = () => {
  gameLoop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window
      .getComputedStyle(mario)
      .bottom.replace("px", "");

    // Verifica se Mario colidiu com o pipe
    if (pipePosition < 120 && pipePosition > 0 && marioPosition < 80) {
      pipe.style.animation = "none";
      pipe.style.left = `${pipePosition}px`;

      mario.style.animation = "none";
      mario.style.bottom = `${marioPosition}px`;

      mario.src = "./img/game-over.png";
      mario.style.width = "75px";
      mario.style.marginLeft = "50px";

      isGameOver = true; // Define o jogo como encerrado
      gameStarted = false; // Para o loop do jogo
      clearInterval(gameLoop); // Para o loop do jogo

      // Verifica e atualiza o recorde
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore); // Armazena o novo recorde no localStorage
        highScoreElement.textContent = highScore; // Atualiza a exibição do recorde
      }

      // Exibe a modal de Game Over
      showGameOverModal();
    } else if (!isGameOver) {
      // Incrementa a pontuação a cada 100 ms
      score += 1;
      currentScoreElement.textContent = score; // Atualiza a pontuação exibida
    }
  }, 100);
};

// Função para mostrar a modal de Game Over
const showGameOverModal = () => {
  finalScoreElement.textContent = score; // Exibe a pontuação final
  finalHighScoreElement.textContent = highScore; // Exibe o recorde
  gameOverModal.style.display = "flex"; // Mostra a modal de Game Over
};

// Função para iniciar as animações
const startAnimations = () => {
  pipe.style.animation = "pipe-animation 1.5s infinite linear"; // Inicia a animação do pipe
  document.querySelector(".clouds").style.animation =
    "clouds-animation 20s infinite linear"; // Inicia a animação das nuvens
};

// Função para iniciar o jogo quando o botão é clicado
startButton.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    startButton.style.display = "none"; // Esconde o botão de Start
    startAnimations(); // Inicia as animações
    startGameLoop(); // Inicia o jogo
  }
});

// Evento para pulo sempre ativo
window.addEventListener("keydown", (event) => {
  if ((event.code === "Space" || event.code === "ArrowUp") && !isGameOver) {
    jump(); // Executa o pulo
  }
});
