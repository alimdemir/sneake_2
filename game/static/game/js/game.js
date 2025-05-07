class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.speed = 150;
        this.difficulty = 'medium';
        this.foodAnimation = 0;
        this.snakeAnimation = 0;
        this.powerUp = null;
        this.powerUpTimer = null;
        this.powerUpDuration = 5000;
        this.powerUpTypes = ['speed', 'double'];
        this.doublePoints = false;
        this.originalSpeed = 150;

        // Canvas boyutlarını büyüt
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Event listeners
        this.setupEventListeners();
        
        // UI elementlerini güncelle
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('upBtn').addEventListener('click', () => this.setDirection('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.setDirection('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.setDirection('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.setDirection('right'));
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.setSpeed();
        });
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveScore());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restart());
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        const directions = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        if (directions[key]) {
            event.preventDefault();
            this.setDirection(directions[key]);
        } else if (key === 'p') {
            event.preventDefault();
            this.togglePause();
        }
    }

    setDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    generateFood() {
        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);
        
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
        if (this.isPaused || this.isGameOver) return;

        this.direction = this.nextDirection;
        const head = {...this.snake[0]};

        // Yeni baş pozisyonunu hesapla
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Duvarları geçme kontrolü
        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);

        // X ekseni kontrolü (yatay geçiş)
        if (head.x < 0) {
            head.x = maxX - 1;
        } else if (head.x >= maxX) {
            head.x = 0;
        }

        // Y ekseni kontrolü (dikey geçiş)
        if (head.y < 0) {
            head.y = maxY - 1;
        } else if (head.y >= maxY) {
            head.y = 0;
        }

        // Kendine çarpma kontrolü
        if (this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // Yeni başı ekle
        this.snake.unshift(head);

        // Yemek yeme kontrolü
        if (head.x === this.food.x && head.y === this.food.y) {
            const points = this.doublePoints ? 20 : 10;
            this.score += points;
            this.food = this.generateFood();
            this.generatePowerUp();
            this.updateUI();
            this.playEatSound();
        } else {
            this.snake.pop();
        }

        // Güç-up yeme kontrolü
        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.activatePowerUp(this.powerUp.type);
            this.powerUp = null;
            this.playPowerUpSound();
        }

        this.draw();
    }

    draw() {
        // Canvas'ı temizle
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Izgara çiz
        this.drawGrid();

        // Yılanı çiz
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Yılan gövdesi için gradient
            const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
            if (index === 0) {
                // Baş kısmı
                gradient.addColorStop(0, '#4ecca3');
                gradient.addColorStop(1, '#45b392');
            } else {
                // Gövde kısmı
                gradient.addColorStop(0, '#45b392');
                gradient.addColorStop(1, '#3da183');
            }

            this.ctx.fillStyle = gradient;
            
            // Yuvarlak köşeli dikdörtgen
            this.roundRect(
                x + 1,
                y + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                5
            );

            // Baş kısmına göz ekle
            if (index === 0) {
                this.drawEyes(x, y);
            }
        });

        // Yemeği çiz
        this.drawFood();

        // Güç-up'ı çiz
        if (this.powerUp) {
            this.drawPowerUp();
        }

        // Animasyonları güncelle
        this.foodAnimation = (this.foodAnimation + 0.1) % (Math.PI * 2);
        this.snakeAnimation = (this.snakeAnimation + 0.05) % (Math.PI * 2);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;

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
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawEyes(x, y) {
        const eyeSize = this.gridSize / 5;
        const eyeOffset = this.gridSize / 3;
        
        this.ctx.fillStyle = 'white';
        
        // Gözlerin pozisyonunu yönüne göre ayarla
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        switch (this.direction) {
            case 'right':
                leftEyeX = x + this.gridSize - eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + this.gridSize - eyeOffset;
                rightEyeY = y + this.gridSize - eyeOffset;
                break;
            case 'left':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + eyeOffset;
                rightEyeY = y + this.gridSize - eyeOffset;
                break;
            case 'up':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + eyeOffset;
                rightEyeX = x + this.gridSize - eyeOffset;
                rightEyeY = y + eyeOffset;
                break;
            case 'down':
                leftEyeX = x + eyeOffset;
                leftEyeY = y + this.gridSize - eyeOffset;
                rightEyeX = x + this.gridSize - eyeOffset;
                rightEyeY = y + this.gridSize - eyeOffset;
                break;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const size = this.gridSize - 4;
        
        // Yemeğin animasyonlu boyutu
        const pulseSize = Math.sin(this.foodAnimation) * 2;
        const finalSize = size + pulseSize;
        
        // Gradient efekti
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2,
            y + this.gridSize/2,
            0,
            x + this.gridSize/2,
            y + this.gridSize/2,
            finalSize/2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ff4757');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize/2,
            y + this.gridSize/2,
            finalSize/2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Parlaklık efekti
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize/3,
            y + this.gridSize/3,
            finalSize/6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawPowerUp() {
        const x = this.powerUp.x * this.gridSize;
        const y = this.powerUp.y * this.gridSize;
        const size = this.gridSize - 4;
        
        // Güç-up'ın animasyonlu boyutu
        const pulseSize = Math.sin(this.foodAnimation * 2) * 3;
        const finalSize = size + pulseSize;
        
        // Gradient efekti
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2,
            y + this.gridSize/2,
            0,
            x + this.gridSize/2,
            y + this.gridSize/2,
            finalSize/2
        );
        
        // Güç-up tipine göre renk
        switch (this.powerUp.type) {
            case 'speed':
                gradient.addColorStop(0, '#00b894');
                gradient.addColorStop(1, '#00a884');
                break;
            case 'double':
                gradient.addColorStop(0, '#fdcb6e');
                gradient.addColorStop(1, '#e17055');
                break;
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize/2,
            y + this.gridSize/2,
            finalSize/2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Parlaklık efekti
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize/3,
            y + this.gridSize/3,
            finalSize/6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    generatePowerUp() {
        if (Math.random() < 0.1) { // %10 şans
            const maxX = Math.floor(this.canvas.width / this.gridSize);
            const maxY = Math.floor(this.canvas.height / this.gridSize);
            
            let powerUp;
            do {
                powerUp = {
                    x: Math.floor(Math.random() * maxX),
                    y: Math.floor(Math.random() * maxY),
                    type: this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)]
                };
            } while (this.snake.some(segment => segment.x === powerUp.x && segment.y === powerUp.y) ||
                    (this.food.x === powerUp.x && this.food.y === powerUp.y));
            
            this.powerUp = powerUp;
        }
    }

    activatePowerUp(type) {
        switch (type) {
            case 'speed':
                this.speed = this.originalSpeed / 2;
                break;
            case 'double':
                this.doublePoints = true;
                break;
        }
        
        // Güç-up süresini başlat
        if (this.powerUpTimer) {
            clearTimeout(this.powerUpTimer);
        }
        
        this.powerUpTimer = setTimeout(() => {
            this.deactivatePowerUp(type);
        }, this.powerUpDuration);
    }

    deactivatePowerUp(type) {
        switch (type) {
            case 'speed':
                this.speed = this.originalSpeed;
                break;
            case 'double':
                this.doublePoints = false;
                break;
        }
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    start() {
        if (!this.gameLoop) {
            this.isGameOver = false;
            this.isPaused = false;
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? 'Devam Et' : 'Duraklat';
    }

    restart() {
        clearInterval(this.gameLoop);
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.isGameOver = false;
        this.isPaused = false;
        this.updateUI();
        this.start();
        document.getElementById('gameOverModal').style.display = 'none';
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.playGameOverSound();
        
        // Modal'ı göster
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').style.display = 'flex';
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    setSpeed() {
        const speeds = {
            'easy': 200,
            'medium': 150,
            'hard': 100
        };
        this.speed = speeds[this.difficulty];
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    async saveScore() {
        const playerName = document.getElementById('playerName').value || 'Anonim';
        
        try {
            const response = await fetch('/save_score/', {
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
                alert('Skor başarıyla kaydedildi!');
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('snakeHighScore', this.highScore);
                    this.updateUI();
                }
            } else {
                alert('Skor kaydedilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Skor kaydedilirken bir hata oluştu.');
        }
    }

    playEatSound() {
        const audio = new Audio('/static/game/sounds/eat.mp3');
        audio.play().catch(() => {});
    }

    playGameOverSound() {
        const audio = new Audio('/static/game/sounds/game-over.mp3');
        audio.play().catch(() => {});
    }

    playPowerUpSound() {
        const audio = new Audio('/static/game/sounds/power-up.mp3');
        audio.play().catch(() => {});
    }
}

// Oyunu başlat
window.onload = () => {
    const game = new SnakeGame();
}; 