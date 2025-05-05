class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.difficulty = 'medium';
        this.speeds = {
            easy: 200,
            medium: 150,
            hard: 100
        };
        this.speed = this.speeds[this.difficulty];
        this.foodAnimation = 0;
        this.lastRenderTime = 0;
        this.gameOver = false;

        // DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.difficultySelect = document.getElementById('difficulty');
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playerNameInput = document.getElementById('playerName');
        this.saveScoreBtn = document.getElementById('saveScoreBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.filterButtons = document.querySelectorAll('.filter-btn');

        // Sound effects
        this.eatSound = document.getElementById('eatSound');
        this.gameOverSound = document.getElementById('gameOverSound');

        this.highScoreElement.textContent = this.highScore;
        this.bindEvents();
        this.loadHighScores();
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.speed = this.speeds[this.difficulty];
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        });

        // Mobile controls
        this.upBtn.addEventListener('click', () => this.handleDirection('up'));
        this.downBtn.addEventListener('click', () => this.handleDirection('down'));
        this.leftBtn.addEventListener('click', () => this.handleDirection('left'));
        this.rightBtn.addEventListener('click', () => this.handleDirection('right'));

        // Game over modal
        this.saveScoreBtn.addEventListener('click', () => this.saveScore());
        this.playAgainBtn.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.start();
        });

        // High score filters
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadHighScores(btn.dataset.difficulty);
            });
        });
    }

    handleDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        const newDirection = keyMap[event.key.toLowerCase()];
        if (newDirection) {
            this.handleDirection(newDirection);
        }
    }

    generateFood() {
        const maxX = this.canvas.width / this.gridSize - 1;
        const maxY = this.canvas.height / this.gridSize - 1;
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update() {
        if (this.isPaused || this.gameOver) return;

        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.endGame();
            return;
        }

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            this.eatSound.currentTime = 0;
            this.eatSound.play();
            
            // Update high score
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = '#f0f0f0';
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            
            if (index === 0) {
                // Head color
                gradient.addColorStop(0, '#2E7D32');
                gradient.addColorStop(1, '#4CAF50');
            } else {
                // Body color
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#81C784');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // Add eyes to head
            if (index === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = this.gridSize / 5;
                const eyeOffset = this.gridSize / 3;
                
                // Position eyes based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                switch (this.direction) {
                    case 'right':
                        leftEyeX = segment.x * this.gridSize + this.gridSize - eyeOffset;
                        leftEyeY = segment.y * this.gridSize + eyeOffset;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - eyeOffset;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - eyeOffset;
                        break;
                    case 'left':
                        leftEyeX = segment.x * this.gridSize + eyeOffset;
                        leftEyeY = segment.y * this.gridSize + eyeOffset;
                        rightEyeX = segment.x * this.gridSize + eyeOffset;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - eyeOffset;
                        break;
                    case 'up':
                        leftEyeX = segment.x * this.gridSize + eyeOffset;
                        leftEyeY = segment.y * this.gridSize + eyeOffset;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - eyeOffset;
                        rightEyeY = segment.y * this.gridSize + eyeOffset;
                        break;
                    case 'down':
                        leftEyeX = segment.x * this.gridSize + eyeOffset;
                        leftEyeY = segment.y * this.gridSize + this.gridSize - eyeOffset;
                        rightEyeX = segment.x * this.gridSize + this.gridSize - eyeOffset;
                        rightEyeY = segment.y * this.gridSize + this.gridSize - eyeOffset;
                        break;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw food with animation
        this.foodAnimation = (this.foodAnimation + 0.1) % (Math.PI * 2);
        const foodSize = this.gridSize - 2 + Math.sin(this.foodAnimation) * 2;
        const foodX = this.food.x * this.gridSize + (this.gridSize - foodSize) / 2;
        const foodY = this.food.y * this.gridSize + (this.gridSize - foodSize) / 2;

        this.ctx.fillStyle = '#f44336';
        this.ctx.beginPath();
        this.ctx.arc(
            foodX + foodSize/2,
            foodY + foodSize/2,
            foodSize/2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        this.gameOverSound.play();
        
        // Show game over modal
        this.finalScoreElement.textContent = this.score;
        this.gameOverModal.style.display = 'flex';
    }

    async saveScore() {
        const playerName = this.playerNameInput.value.trim() || 'Anonim';
        
        try {
            const response = await fetch('/api/save-score/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_name: playerName,
                    score: this.score,
                    difficulty: this.difficulty
                })
            });

            const data = await response.json();
            if (data.success) {
                this.loadHighScores();
                this.gameOverModal.style.display = 'none';
            } else {
                alert('Skor kaydedilirken bir hata oluştu: ' + data.message);
            }
        } catch (error) {
            alert('Skor kaydedilirken bir hata oluştu: ' + error.message);
        }
    }

    async loadHighScores(difficulty = 'all') {
        try {
            const response = await fetch(`/api/high-scores/?difficulty=${difficulty}`);
            const data = await response.json();
            
            if (data.success) {
                const tbody = document.getElementById('highScoresBody');
                tbody.innerHTML = '';
                
                data.scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.player_name}</td>
                        <td>${score.score}</td>
                        <td>${score.difficulty}</td>
                        <td>${score.date}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Yüksek skorlar yüklenirken hata oluştu:', error);
        }
    }

    reset() {
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.food = this.generateFood();
        this.gameOver = false;
        this.foodAnimation = 0;
    }

    start() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.reset();
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Devam Et' : 'Duraklat';
    }
}

// Start the game when the page loads
window.onload = () => {
    new SnakeGame();
}; 