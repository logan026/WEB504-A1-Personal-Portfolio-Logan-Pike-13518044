const game = document.getElementById("game");
const dinosaur = document.getElementById("dinosaur");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

let rocks = [];
let score = 0;
let savedHighScore = localStorage.getItem("dinoHighScore") || 0;
highScoreElement.innerText = savedHighScore;

function jump() {
    if (!dinosaur.classList.contains("jump-animation")) {
        dinosaur.classList.add("jump-animation");
        setTimeout(() => {
            dinosaur.classList.remove("jump-animation");
        }, 500);
    }
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
    }
});

document.addEventListener("touchstart", jump);

function spawnRock() {
    const rock = document.createElement("div");
    rock.classList.add("rock");
    
    const speedFactor = Math.max(0.65, 1.33 - Math.floor(score / 150) * 0.1);
    rock.style.animationDuration = `${speedFactor}s`;

    game.appendChild(rock);
    rocks.push(rock);

    setTimeout(() => {
        rock.remove();
        rocks = rocks.filter(r => r !== rock);
    }, speedFactor * 1000);

    const nextSpawnDelay = (1100 + Math.random() * 1200) * (speedFactor / 1.33);
    setTimeout(spawnRock, nextSpawnDelay);
}

spawnRock();

setInterval(() => {
    score++;
    scoreElement.innerText = score;

    if (score > savedHighScore) {
        savedHighScore = score;
        localStorage.setItem("dinoHighScore", savedHighScore);
        highScoreElement.innerText = savedHighScore;
    }

    const dinosaurTop = parseInt(window.getComputedStyle(dinosaur).getPropertyValue("top"));

    rocks.forEach(rock => {
        const rockLeft = parseInt(window.getComputedStyle(rock).getPropertyValue("left"));

        if (rockLeft < 90 && rockLeft > 30 && dinosaurTop >= 185) {
            alert("Game Over! Score: " + score + " | High Score: " + savedHighScore);
            location.reload();
        }
    });
}, 50);