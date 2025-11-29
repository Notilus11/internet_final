class Minesweeper {
    constructor() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        this.difficulties = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 25 },
            hard: { rows: 16, cols: 16, mines: 50 }
        };

        this.currentDifficulty = 'easy';
        this.config = this.difficulties[this.currentDifficulty];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.renderBoard();
    }

    setupEventListeners() {
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDifficulty = e.target.dataset.difficulty;
                this.config = this.difficulties[this.currentDifficulty];
                this.resetGame();
            });
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
            this.resetGame();
        });
    }

    createBoard() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];

        for (let i = 0; i < this.config.rows; i++) {
            this.board[i] = [];
            this.revealed[i] = [];
            this.flagged[i] = [];
            for (let j = 0; j < this.config.cols; j++) {
                this.board[i][j] = 0;
                this.revealed[i][j] = false;
                this.flagged[i][j] = false;
            }
        }
    }

    placeMines(avoidRow, avoidCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.config.mines) {
            const row = Math.floor(Math.random() * this.config.rows);
            const col = Math.floor(Math.random() * this.config.cols);

            // Don't place mine on first click or adjacent cells
            if (this.board[row][col] === -1) continue;
            if (Math.abs(row - avoidRow) <= 1 && Math.abs(col - avoidCol) <= 1) continue;

            this.board[row][col] = -1;
            minesPlaced++;

            // Update adjacent cells
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (this.isValid(newRow, newCol) && this.board[newRow][newCol] !== -1) {
                        this.board[newRow][newCol]++;
                    }
                }
            }
        }
        this.firstClick = false;
    }

    isValid(row, col) {
        return row >= 0 && row < this.config.rows && col >= 0 && col < this.config.cols;
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${this.config.cols}, 35px)`;

        for (let i = 0; i < this.config.rows; i++) {
            for (let j = 0; j < this.config.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                cell.addEventListener('click', () => this.handleClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j);
                });

                boardElement.appendChild(cell);
            }
        }

        this.updateInfo();
    }

    handleClick(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col] || this.flagged[row][col]) return;

        if (this.firstClick) {
            this.placeMines(row, col);
            this.startTimer();
        }

        if (this.board[row][col] === -1) {
            this.revealMines();
            this.endGame(false);
            return;
        }

        this.revealCell(row, col);
        this.updateDisplay();
        this.checkWin();
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col]) return;

        this.flagged[row][col] = !this.flagged[row][col];
        this.updateDisplay();
    }

    revealCell(row, col) {
        if (!this.isValid(row, col) || this.revealed[row][col] || this.flagged[row][col]) return;

        this.revealed[row][col] = true;

        if (this.board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealCell(row + i, col + j);
                }
            }
        }
    }

    revealMines() {
        for (let i = 0; i < this.config.rows; i++) {
            for (let j = 0; j < this.config.cols; j++) {
                if (this.board[i][j] === -1) {
                    this.revealed[i][j] = true;
                }
            }
        }
    }

    updateDisplay() {
        for (let i = 0; i < this.config.rows; i++) {
            for (let j = 0; j < this.config.cols; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);

                if (this.revealed[i][j]) {
                    cell.classList.add('revealed');
                    if (this.board[i][j] === -1) {
                        cell.textContent = '💣';
                        cell.classList.add('mine');
                    } else if (this.board[i][j] > 0) {
                        cell.textContent = this.board[i][j];
                        cell.classList.add(`number-${this.board[i][j]}`);
                    }
                } else if (this.flagged[i][j]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                } else {
                    cell.classList.remove('flagged');
                    cell.textContent = '';
                }
            }
        }
        this.updateInfo();
    }

    updateInfo() {
        const flagCount = this.flagged.flat().filter(f => f).length;
        document.getElementById('mine-count').textContent = this.config.mines;
        document.getElementById('flag-count').textContent = flagCount;
        document.getElementById('timer').textContent = this.timer;
    }

    checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < this.config.rows; i++) {
            for (let j = 0; j < this.config.cols; j++) {
                if (this.revealed[i][j]) revealedCount++;
            }
        }

        const totalCells = this.config.rows * this.config.cols;
        if (revealedCount === totalCells - this.config.mines) {
            this.endGame(true);
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateInfo();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    endGame(won) {
        this.gameOver = !won;
        this.gameWon = won;
        this.stopTimer();

        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const message = document.getElementById('modal-message');

        if (won) {
            title.textContent = '🎉 Congratulations!';
            message.textContent = `You won in ${this.timer} seconds!`;
        } else {
            title.textContent = '💥 Game Over!';
            message.textContent = 'You hit a mine! Try again?';
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('game-over-modal').classList.remove('active');
    }

    resetGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.stopTimer();
        this.createBoard();
        this.renderBoard();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});